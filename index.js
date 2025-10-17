// 導入整個 script 模組，以便我們可以修改它內部的函數
import * as script from '../../../../script.js';

// 導入我們自己的 UI 繪製函數
import { renderTagUI } from './js/ui.js';

// 檢查 script.displayWorldEntries 是否存在，確保我們沒有找錯目標
if (script.displayWorldEntries) {
    // 儲存原始的 displayWorldEntries 函數
    const originalDisplayWorldEntries = script.displayWorldEntries;

    // 建立我們自己的擴充版本
    async function extendedDisplayWorldEntries(name, data, navigation, flashOnNav) {
        console.log('[WBTM] extendedDisplayWorldEntries triggered. World:', name);

        // 首先，執行原始的函數，讓 SillyTavern 繪製出原本的所有UI
        // 使用 .call(this, ...) 來確保函數內部的 this 指向正確
        await originalDisplayWorldEntries.call(this, name, data, navigation, flashOnNav);

        // 當原始UI繪製完成後，執行我們的函數來加入標籤相關的UI
        if (name && data) {
            console.log('[WBTM] World data is present, rendering tag UI...');
            renderTagUI(name, data);
        } else {
            console.log('[WBTM] No world data, skipping tag UI render.');
        }
    }

    // 用我們擴充過的版本替換掉原始的版本
    script.displayWorldEntries = extendedDisplayWorldEntries;
    
    // 在擴充載入時，於控制台打印一條訊息，證明 index.js 已成功執行
    console.log('[WBTM] WorldBook Manager extension loaded and monkey-patch applied.');

} else {
    // 如果找不到目標函數，就在控制台報錯
    console.error('[WBTM] Failed to find original displayWorldEntries function to patch.');
}
