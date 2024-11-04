chrome.runtime.onInstalled.addListener(() => {
    // Create context menu items
    chrome.contextMenus.create({
        id: "copyGif",
        title: "Copy GIF",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "copyGifAndFavorite",
        title: "Copy GIF and Favorite",
        contexts: ["image"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.srcUrl?.toLowerCase().includes('.gif')) {
        // Show error message if not a GIF
        chrome.tabs.sendMessage(tab.id, {
            action: 'showNotification',
            message: 'Selected image is not a GIF'
        });
        return;
    }

    const shouldFavorite = info.menuItemId === "copyGifAndFavorite";

    saveGif(info.srcUrl, shouldFavorite);
});

async function saveGif(url, shouldFavorite) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const gifId = Date.now().toString();
        const arrayBuffer = await blob.arrayBuffer();

        // Save to local storage
        const gifData = {
            id: gifId,
            binary: Array.from(new Uint8Array(arrayBuffer)),
            timestamp: Date.now()
        };

        // Get download path
        chrome.storage.local.get(['downloadPath', 'gifs', 'favorites', 'downloadSetting'], async ({ downloadPath = 'GIFManager', gifs = [], favorites = [], downloadSetting = "no" }) => {
            // Update storage
            const newGifs = [...gifs, gifData];
            const newFavorites = shouldFavorite ? [...favorites, gifId] : favorites;

            chrome.storage.local.set({
                gifs: newGifs,
                favorites: newFavorites
            }, () => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'showNotification',
                        message: `GIF ${shouldFavorite ? 'copied and favorited' : 'copied'} successfully!`
                    });
                });
            });

            // Save file to downloads if download setting is yes
            const toDownload = downloadSetting === "yes";
            if (toDownload) {
                // Note: We can't directly access the file system, so we save to subfolder in default download path
                const filename = `${downloadPath}/gif_${gifId}.gif`;
                await chrome.downloads.download({
                    url: await createObjectURL(blob),
                    filename: filename,
                    saveAs: false
                });
            }

        });
    } catch (error) {
        console.error('Error saving GIF:', error);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showNotification',
                message: 'Error saving GIF'
            });
        });
    }
}

async function createObjectURL(blob) {
    const fileReader = new FileReader();
    return await new Promise((resolve) => {
        fileReader.onload = (e) => resolve(e.target.result.toString());
        fileReader.readAsDataURL(blob);
    });
}

// check if downloadPath is set, else open options page
chrome.storage.local.get('downloadPath', (data) => {
    if (!data.downloadPath) {
        chrome.runtime.openOptionsPage();
    }
});