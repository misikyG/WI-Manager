import { getContext, extension_settings } from "/scripts/context.js";
import { saveSettingsDebounced } from "/scripts/utils.js";

// 初始化擴充套件的設定，如果它不存在的話
if (!extension_settings.worldbookManager) {
    extension_settings.worldbookManager = {
        tagsByFile: {}, // 用來儲存每個世界書檔案對應的標籤
    };
}

/**
 * 獲取特定世界書的標籤
 * @param {string} worldBookFileName - 世界書的檔案名稱 (例如 "MyWorld.json")
 * @returns {string[]} - 標籤陣列
 */
export function getTagsForBook(worldBookFileName) {
    return extension_settings.worldbookManager.tagsByFile[worldBookFileName] || [];
}

/**
 * 為特定的世界書設定標籤
 * @param {string} worldBookFileName - 世界書的檔案名稱
 * @param {string[]} tags - 新的標籤陣列
 */
export function setTagsForBook(worldBookFileName, tags) {
    extension_settings.worldbookManager.tagsByFile[worldBookFileName] = tags;
    // 使用 debounce 節流，避免頻繁寫入設定
    saveSettingsDebounced();
}

/**
 * 獲取所有標籤資料
 * @returns {Object}
 */
export function getAllTags() {
    return extension_settings.worldbookManager.tagsByFile;
}