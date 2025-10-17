jQuery(async () => {
    const context = getContext();

    // =================================================================================
    // 核心功能：在世界書頁面插入 UI
    // =================================================================================

    /**
     * 插入標籤篩選器 UI
     * 位置：世界書下拉選單的上方
     */
    function insertTagFilterUI() {
        const filterHtml = `
            <div id="wbtm-filter-container">
                <div class="inline-flex">
                    <label for="wbtm-tag-filter"><i class="fa-solid fa-tags"></i> Tags</label>
                    <select id="wbtm-tag-filter" class="text_pole" multiple="multiple"></select>
                </div>
            </div>
        `;

        // 找到世界書編輯器選擇器，並在其前面插入我們的篩選器
        if ($('#world_editor_select').length && $('#wbtm-filter-container').length === 0) {
            $('#world_info_container').before(filterHtml);
            console.log('[WBTM] Tag filter UI inserted.');

            // 初始化 select2 以獲得更好的多選體驗
            if (!isMobile()) {
                $('#wbtm-tag-filter').select2({
                    width: '100%',
                    placeholder: 'Filter by tags...',
                    allowClear: true,
                    closeOnSelect: false,
                });
            }
        }
    }

    /**
     * 在每個世界書條目中插入標籤輸入框
     * @param {jQuery} entryElement - 代表單個世界書條目的 jQuery 元素
     */
    function insertTagInputUI(entryElement) {
        // 確保我們不會重複插入
        if (entryElement.find('.wbtm-tag-input-container').length > 0) {
            return;
        }

        const uid = entryElement.attr('uid');
        const tagInputHtml = `
            <div class="wbtm-tag-input-container">
                <i class="fa-solid fa-tags" title="Tags for this entry"></i>
                <input type="text" class="text_pole wbtm-tag-input" data-uid="${uid}" placeholder="Add tags, separated by commas...">
            </div>
        `;

        // 找到條目的標題/備註輸入框，並在其後方插入
        const commentTextarea = entryElement.find('textarea[name="comment"]');
        if (commentTextarea.length > 0) {
            commentTextarea.parent().after(tagInputHtml);
        }
    }


    // =================================================================================
    // 監聽與觸發
    // =================================================================================

    /**
     * 當世界書條目列表被重新渲染時，我們需要重新插入我們的 UI
     */
    function enhanceWorldInfoUI() {
        // 1. 插入標籤篩選器
        insertTagFilterUI();

        // 2. 遍歷所有已顯示的世界書條目，為它們加上標籤輸入框
        $('#world_popup_entries_list .world_entry').each(function() {
            insertTagInputUI($(this));
        });
    }

    /**
     * 使用 MutationObserver 監控世界書列表的變化
     * 這是最可靠的方式，因為 displayWorldEntries 函數是異步的
     */
    function observeWorldEntries() {
        const targetNode = document.getElementById('world_popup_entries_list');

        if (!targetNode) {
            console.warn('[WBTM] Could not find world entries list to observe.');
            return;
        }

        const config = { childList: true, subtree: true };

        const callback = function(mutationsList, observer) {
            // 我們只關心何時有 .world_entry 被新增
            for(const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const hasNewEntry = Array.from(mutation.addedNodes).some(node =>
                        node.nodeType === 1 && $(node).hasClass('world_entry')
                    );
                    if (hasNewEntry) {
                        // 發現了新條目，執行我們的 UI 增強
                        enhanceWorldInfoUI();
                        // 找到新條目後可以暫時停止，避免不必要的重複執行
                        // 但考慮到分頁等操作，持續監聽可能更好
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
        console.log('[WBTM] Now observing world entries list for changes.');
    }


    // =================================================================================
    // 初始化
    // =================================================================================
    function initialize() {
        console.log('[WBTM] Initializing WorldBook Tag Manager...');
        
        // 首次加載時嘗試增強 UI
        enhanceWorldInfoUI();

        // 設置一個觀察者來處理後續的動態加載
        observeWorldEntries();
    }

    // 擴充主入口
    initialize();
});