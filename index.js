import {
    world_info,
    displayWorldEntries,
} from '../../../../script.js';

import { renderTagUI } from './js/ui.js';

// 儲存原始的 displayWorldEntries 函數
const originalDisplayWorldEntries = displayWorldEntries;

// 使用 monkey-patch 的方式來擴充原始函數
// 這能在不修改原始碼的情況下，於執行後附加我們的功能
async function extendedDisplayWorldEntries(name, data, navigation, flashOnNav) {
    // 首先，執行原始的函數，讓 SillyTavern 繪製出原本的所有UI
    await originalDisplayWorldEntries(name, data, navigation, flashOnNav);

    // 當原始UI繪製完成後，執行我們的函數來加入標籤相關的UI
    // 我們需要傳入 name 和 data，以便後續讀取和儲存標籤
    if (name && data) {
        renderTagUI(name, data);
    }
}

// 用我們擴充過的版本替換掉原始的版本
window.displayWorldEntries = extendedDisplayWorldEntries;

// 在擴充載入時，於控制台打印一條訊息，方便除錯
console.log('[WBTM] WorldBook Manager extension loaded.');