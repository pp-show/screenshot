chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // 扩展程序首次安装时的处理逻辑
        console.log('chrome插件安装成功')
        // 进行其他操作
    } else if (details.reason === 'update') {
        // 扩展程序更新时的处理逻辑
        console.log('chrome插件更新成功')
        // 进行其他操作
    }
});
