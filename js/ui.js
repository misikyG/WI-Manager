import { saveWorldInfo, worldInfoCache } from '../../../../script.js';

/**
 * 繪製所有標籤相關的UI元素
 * @param {string} worldName - 當前世界書的名稱
 * @param {object} worldData - 當前世界書的資料物件
 */
export function renderTagUI(worldName, worldData) {
    // 每次重新繪製前，先移除舊的UI，避免重複
    removeOldUI();

    // 找到要在哪裡插入我們的UI
    const anchorPoint = document.querySelector('#world_editor_select').parentElement;
    const controlsRow = document.querySelector('#world_popup_new').parentElement;

    if (anchorPoint && controlsRow) {
        // 1. 插入標籤輸入區塊 (紅框)
        const tagInputSection = createTagInputSection(worldName, worldData);
        // 插入到世界書選擇下拉選單的下一行
        anchorPoint.insertAdjacentElement('afterend', tagInputSection);

        // 2. 插入標籤篩選按鈕 (藍框)
        const tagFilterButton = createTagFilterButton();
        // 插入到 "New Entry" 按鈕的前面
        controlsRow.insertBefore(tagFilterButton, controlsRow.querySelector('#world_popup_new'));
    }
}

/**
 * 建立標籤輸入區塊的 HTML 元素
 * @param {string} worldName - 當前世界書的名稱
 * @param {object} worldData - 當前世界書的資料物件
 * @returns {HTMLElement}
 */
function createTagInputSection(worldName, worldData) {
    const section = document.createElement('div');
    section.id = 'wbtm-tag-section';
    section.className = 'wbtm-tag-section';

    // 讀取目前已儲存的標籤
    const currentTags = worldData.tags || [];

    // 顯示已存在的標籤
    const tagsDisplay = document.createElement('div');
    tagsDisplay.className = 'wbtm-tags-display';
    currentTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'wbtm-tag';
        tagElement.textContent = tag;
        tagsDisplay.appendChild(tagElement);
    });

    // 標籤輸入框
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'wbtm-tag-input';
    input.className = 'text_pole'; // 使用 ST 原生樣式
    input.placeholder = 'Add tags, separated by commas...';
    input.value = currentTags.join(', ');

    // TODO: 在下一步中為輸入框加上儲存事件

    section.appendChild(tagsDisplay);
    section.appendChild(input);

    return section;
}

/**
 * 建立標籤篩選按鈕的 HTML 元素
 * @returns {HTMLElement}
 */
function createTagFilterButton() {
    const button = document.createElement('div');
    button.id = 'wbtm-filter-button';
    button.className = 'wbtm-filter-button fa-solid fa-tags menu_button';
    button.title = 'Filter by tag';

    // TODO: 在下一步中為按鈕加上點擊事件

    return button;
}

/**
 * 移除舊的UI元素，防止重複生成
 */
function removeOldUI() {
    const oldSection = document.getElementById('wbtm-tag-section');
    if (oldSection) {
        oldSection.remove();
    }
    const oldButton = document.getElementById('wbtm-filter-button');
    if (oldButton) {
        oldButton.remove();
    }
}