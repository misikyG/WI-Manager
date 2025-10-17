/**
 * 注入世界書管理介面所需的 UI 元件
 */
export function injectWorldBookUI() {
    // 找到世界書編輯選單的容器
    const editorSelectContainer = document.querySelector('#world_popup .flex-container.alignitemscenter');

    if (editorSelectContainer) {
        // --- 藍色框：新增標籤篩選按鈕 ---
        const tagFilterButton = document.createElement('div');
        tagFilterButton.id = 'wbtm-tag-filter-button';
        tagFilterButton.className = 'menu_button fa-solid fa-tags';
        tagFilterButton.title = 'Filter by tags';
        // 插入到下拉選單的旁邊
        editorSelectContainer.querySelector('#world_editor_select').insertAdjacentElement('afterend', tagFilterButton);


        // --- 紅色框：新增標籤輸入區域 ---
        const tagInputContainer = document.createElement('div');
        tagInputContainer.id = 'wbtm-tag-input-container';
        tagInputContainer.className = 'wbtm-tag-bar';
        tagInputContainer.style.display = 'none'; // 預設隱藏，選擇世界書後再顯示

        tagInputContainer.innerHTML = `
            <span class="wbtm-tag-icon fa-solid fa-tag"></span>
            <input type="text" id="wbtm-tag-input" class="text_pole" placeholder="Add tags, separated by commas...">
        `;

        // 插入到搜尋框和排序選單的父容器之後
        const searchAndSortContainer = editorSelectContainer.nextElementSibling;
        if (searchAndSortContainer) {
            searchAndSortContainer.insertAdjacentElement('afterend', tagInputContainer);
        }
    }
}