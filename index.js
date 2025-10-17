// IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
(function () {
    const extensionName = "WorldBook Manager";
    const LOG_PREFIX = `[${extensionName}]`;

    // 引入我們的新模組
    const { loadTags, saveTags } = await import('./src/core/storage.js');
    const { injectWorldBookUI } = await import('./src/ui/worldbook-ui.js');

    // A simple logger for debugging
    function log(message, ...data) {
        console.log(`${LOG_PREFIX} ${message}`, ...data);
    }

    // This function runs when the extension is loaded
    function onLoaded() {
        log("Extension loaded successfully.");

        // 載入 CSS 樣式
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `extensions/${extensionName}/styles/worldbook.css`;
        document.head.appendChild(link);

        // 執行 UI 注入
        injectWorldBookUI();

        log("UI components injected.");
    }

    // Wait for the DOM to be fully loaded before running our script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onLoaded);
    } else {
        onLoaded();
    }
})();