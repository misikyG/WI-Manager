// SillyTavern-WorldBookTagManager/index.js

jQuery(async () => {
    // 取得 SillyTavern 的核心上下文，這是與 ST 互動的基礎
    const context = getContext();

    // 擴充的日誌前綴，方便在開發者工具中辨識日誌
    const LOG_PREFIX = '[WorldBook Manager]';

    // 我們的擴充設定
    const extensionSettings = {
        // 用來儲存每個世界書的標籤
        // 格式: { "世界書A": ["標籤1", "標籤2"], "世界書B": ["標籤3"] }
        worldbook_tags: {},
        // 用來儲存當前啟用的篩選標籤
        active_filter_tags: [],
    };

    // 在 SillyTavern 的全域設定中初始化我們的擴充設定
    // 如果使用者是第一次安裝，這裡會建立一個新的設定物件
    // 如果不是，則會讀取已有的設定
    context.extension_settings.worldbook_tag_manager =
        context.extension_settings.worldbook_tag_manager || extensionSettings;

    // 方便後續使用的設定物件的簡短引用
    const settings = context.extension_settings.worldbook_tag_manager;

    /**
     * @info 輔助函數：將設定儲存到 SillyTavern
     * 我們使用 debounce 來防止過於頻繁的儲存操作，提升效能
     */
    const saveSettings = debounce(() => {
        context.saveExtensionSettings();
        console.log(`${LOG_PREFIX} Settings saved.`);
    }, 500); // 延遲 500 毫秒儲存

    /**
     * @info 取得一個世界書的所有標籤
     * @param {string} worldName - 世界書的名稱
     * @returns {string[]} 標籤陣列
     */
    function getTagsForWorld(worldName) {
        return settings.worldbook_tags[worldName] || [];
    }

    /**
     * @info 設定一個世界書的標籤
     * @param {string} worldName - 世界書的名稱
     * @param {string[]} tags - 新的標籤陣列
     */
    function setTagsForWorld(worldName, tags) {
        if (tags && tags.length > 0) {
            settings.worldbook_tags[worldName] = tags;
        } else {
            // 如果標籤是空的，就從設定中刪除這個世界書的鍵
            delete settings.worldbook_tags[worldName];
        }
        saveSettings();
    }

    /**
     * @info 創建標籤輸入框的 HTML
     * @param {string} worldName - 當前正在編輯的世界書名稱
     * @returns {JQuery<HTMLElement>} 返回一個 jQuery 物件
     */
    function createTagInputUI(worldName) {
        const tags = getTagsForWorld(worldName);
        const tagsString = tags.join(', '); // 將標籤陣列轉換為逗號分隔的字串

        // 這是我們新的 UI 的 HTML 結構
        const html = `
            <div id="wbtm-tag-input-container" class="wbtm-container">
                <span class="wbtm-label">標籤 (Tags):</span>
                <input type="text" id="wbtm-tag-input" class="text_pole" 
                       placeholder="輸入標籤，用逗號分隔..." value="${tagsString}">
            </div>
        `;
        const $ui = $(html);

        // 監聽輸入框的變動
        $ui.find('#wbtm-tag-input').on('input', debounce(function () {
            const newTagsString = $(this).val();
            // 將字串按逗號分割，並移除頭尾空格和空字串
            const newTags = newTagsString.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            setTagsForWorld(worldName, newTags);
            console.log(`${LOG_PREFIX} Tags for ${worldName} updated:`, newTags);
        }, 300)); // 延遲 300 毫秒觸發，避免輸入時頻繁儲存

        return $ui;
    }


    /**
     * @info 覆寫（Patch）原有的 displayWorldEntries 函數
     * 我們需要在原有函數執行後，插入我們的標籤輸入框 UI
     */
    const originalDisplayWorldEntries = window.displayWorldEntries;
    window.displayWorldEntries = async function (...args) {
        // 先執行 SillyTavern 的原始函數，讓它把介面畫出來
        await originalDisplayWorldEntries.apply(this, args);

        const worldName = args[0]; // 第一個參數是世界書的名稱
        const data = args[1]; // 第二個參數是世界書的資料

        // 確保只有在成功載入世界書時才顯示我們的 UI
        if (worldName && data && data.entries) {
            // 避免重複添加 UI
            $('#wbtm-tag-input-container').remove();

            // 創建我們的標籤輸入 UI
            const $tagInputUI = createTagInputUI(worldName);

            // 找到圖二紅框的位置，也就是分頁控制項的上方
            const $pagination = $('#world_info_pagination');
            if ($pagination.length > 0) {
                $pagination.before($tagInputUI);
            } else {
                // 如果找不到分頁控制項，就加到列表的頂部
                $('#world_popup_entries_list').before($tagInputUI);
            }
        }
    };

    /**
     * @info 獲取所有世界書中的所有不重複標籤
     * @returns {string[]} 排序後的不重複標籤列表
     */
    function getAllUniqueTags() {
        const allTags = new Set();
        for (const worldName in settings.worldbook_tags) {
            settings.worldbook_tags[worldName].forEach(tag => allTags.add(tag));
        }
        return Array.from(allTags).sort(); // 轉換為陣列並排序
    }

    /**
     * @info 創建標籤篩選按鈕的 UI
     * @returns {JQuery<HTMLElement>}
     */
    function createTagFilterButtonUI() {
        const html = `
            <div id="wbtm-filter-button" class="wbtm-icon-button" title="依標籤篩選世界書">
                <i class="fa-solid fa-tags"></i>
            </div>
        `;
        const $ui = $(html);

        // 點擊按鈕時的處理
        $ui.on('click', async () => {
            const uniqueTags = getAllUniqueTags();

            if (uniqueTags.length === 0) {
                toastr.info("目前沒有任何世界書設定了標籤。");
                return;
            }

            // 創建彈出視窗的內容
            let popupContent = '<div id="wbtm-filter-popup">';
            uniqueTags.forEach(tag => {
                const isChecked = settings.active_filter_tags.includes(tag);
                popupContent += `
                    <label class="wbtm-filter-tag-label">
                        <input type="checkbox" class="wbtm-filter-tag-checkbox" value="${tag}" ${isChecked ? 'checked' : ''}>
                        <span class="wbtm-tag-span">${tag}</span>
                    </label>
                `;
            });
            popupContent += '</div>';

            // 顯示彈出視窗
            const popupResult = await callGenericPopup(popupContent, 'confirm', {
                title: '選擇要篩選的標籤',
                okButton: '套用',
                cancelButton: '取消',
            });

            if (popupResult) {
                // 如果用戶點擊了 "套用"
                const selectedTags = [];
                $('.wbtm-filter-tag-checkbox:checked').each(function () {
                    selectedTags.push($(this).val());
                });
                settings.active_filter_tags = selectedTags;
                saveSettings(); // 儲存當前的篩選狀態

                // 強制更新世界書列表
                await updateWorldInfoListWithTagFilter();
                toastr.success("世界書列表已更新。");
            }
        });

        return $ui;
    }

    /**
     * @info 帶有標籤篩選功能的更新世界書列表函數
     */
    async function updateWorldInfoListWithTagFilter() {
        // 這是 SillyTavern 用來更新世界書列表的核心函數
        // 我們需要先拿到所有的世界書名稱
        const result = await fetch('/api/settings/get', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({}),
        });

        if (!result.ok) return;

        const data = await result.json();
        let world_names = data.world_names?.length ? data.world_names : [];

        // 執行篩選
        const activeTags = settings.active_filter_tags;
        let filtered_world_names = world_names;

        if (activeTags.length > 0) {
            filtered_world_names = world_names.filter(worldName => {
                const worldTags = getTagsForWorld(worldName);
                // 檢查這個世界書的標籤是否包含所有被選中的篩選標籤
                return activeTags.every(filterTag => worldTags.includes(filterTag));
            });
            // 根據篩選結果更新篩選按鈕的狀態（例如變色）
            $('#wbtm-filter-button').addClass('active');
        } else {
            $('#wbtm-filter-button').removeClass('active');
        }

        // --- 以下是從 SillyTavern 的 updateWorldInfoList 函數中複製並修改的邏輯 ---
        const $editorSelect = $('#world_editor_select');
        const editorSelected = String($editorSelect.find(':selected').text());

        // 清空舊的選項
        $editorSelect.find('option[value!=""]').remove();

        // 填充篩選後的選項
        filtered_world_names.forEach((item, i) => {
            // 注意：這裡的 value 仍然使用原始 world_names 的索引，以保持與 ST 內部的邏輯一致
            const originalIndex = world_names.indexOf(item);
            const editorListOption = new Option(item, originalIndex.toString());
            editorListOption.selected = editorSelected === item;
            $editorSelect.append(editorListOption);
        });

        // 觸發 select2 更新，讓 UI 顯示最新的列表
        if ($editorSelect.data('select2')) {
            $editorSelect.trigger('change.select2');
        }
    }

    /**
     * @info 覆寫（Patch）原有的 initWorldInfo 函數
     * 我們需要在初始化時插入篩選按鈕，並替換掉原有的列表更新邏輯
     */
    const originalInitWorldInfo = window.initWorldInfo;
    window.initWorldInfo = function (...args) {
        originalInitWorldInfo.apply(this, args);

        // 插入篩選按鈕
        if ($('#wbtm-filter-button').length === 0) {
            const $filterButton = createTagFilterButtonUI();
            // 找到 select2 的容器並在其後方插入按鈕
            $('#world_editor_select').next('.select2-container').after($filterButton);
        }

        // 因為我們需要篩選下拉列表，所以我們需要覆寫或監聽觸發列表更新的事件
        // 一個簡單的方法是，當世界書編輯器選擇器被點擊時，我們強制刷新一次列表
        // 這樣可以確保用戶總能看到最新的篩選結果
        $('#world_editor_select').on('select2:opening', async () => {
            console.log(`${LOG_PREFIX} World editor select opened, refreshing list with filter.`);
            await updateWorldInfoListWithTagFilter();
        });

        // 初始載入時也應用一次篩選
        updateWorldInfoListWithTagFilter();
    };
});