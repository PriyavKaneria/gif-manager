chrome.runtime.onInstalled.addListener(() => {
    // Create context menu items
    chrome.contextMenus.create({
        id: "copyGif",
        title: "Copy GIF",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "copyGifAndFavorite",
        title: "Copy GIF and Favorite",
        contexts: ["all"]
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

// Save GIF to storage individually for optmiized performance
async function saveGif(url, shouldFavorite) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const gifId = Date.now().toString();
        const arrayBuffer = await blob.arrayBuffer();

        const gifData = {
            id: gifId,
            binary: Array.from(new Uint8Array(arrayBuffer)),
            timestamp: Date.now()
        };

        // Save each GIF with a unique key
        chrome.storage.local.set({ [`gif_${gifId}`]: gifData }, () => {
            if (shouldFavorite) {
                chrome.storage.local.get('favorites', ({ favorites = [] }) => {
                    chrome.storage.local.set({ favorites: [...favorites, gifId] });
                });
            }

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'showNotification',
                    message: `GIF ${shouldFavorite ? 'copied and favorited' : 'copied'} successfully!`
                });
            });
        });

        chrome.storage.local.get(['gifs', 'downloadPath', 'downloadSetting'], async ({ gifs = [], downloadPath = 'GIFManager', downloadSetting = "no" }) => {
            // Append the new GIF to the id list
            chrome.storage.local.set({ gifs: [...gifs, gifId] });

            // Save to downloads if required
            const toDownload = downloadSetting === "yes";
            if (toDownload) {
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