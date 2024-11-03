let currentTab = 'all';
const heartIconSVGOutline = '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#f72b2b" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>';
const heartIconSVGFilled = '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#f72b2b" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>';
const deleteIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 16 16"><path d="M 6.496094 1 C 5.675781 1 5 1.675781 5 2.496094 L 5 3 L 2 3 L 2 4 L 3 4 L 3 12.5 C 3 13.328125 3.671875 14 4.5 14 L 10.5 14 C 11.328125 14 12 13.328125 12 12.5 L 12 4 L 13 4 L 13 3 L 10 3 L 10 2.496094 C 10 1.675781 9.324219 1 8.503906 1 Z M 6.496094 2 L 8.503906 2 C 8.785156 2 9 2.214844 9 2.496094 L 9 3 L 6 3 L 6 2.496094 C 6 2.214844 6.214844 2 6.496094 2 Z M 5 5 L 6 5 L 6 12 L 5 12 Z M 7 5 L 8 5 L 8 12 L 7 12 Z M 9 5 L 10 5 L 10 12 L 9 12 Z"></path></svg>';

document.addEventListener('DOMContentLoaded', () => {
    loadGifs();
    setupTabs();
});

function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            loadGifs();
        });
    });
}

async function loadGifs() {
    chrome.storage.local.get(['gifs', 'favorites', 'downloadPath'], async ({ gifs = [], favorites = [], downloadPath = 'GIFManager' }) => {
        const gifGrid = document.getElementById('gifGrid');
        gifGrid.innerHTML = '';

        const gifsToShow = currentTab === 'favorites'
            ? gifs.filter(gif => favorites.includes(gif.id))
            : gifs;

        for (const gif of gifsToShow) {
            try {
                let binaryData = gif.binary;

                if (!binaryData) {
                    // Try to load from downloaded file
                    const filename = `${downloadPath}/gif_${gif.id}.gif`;
                    // Note: We can't directly access the file system
                    // Instead, we'll need to use the downloads API to re-download it
                    // This is a limitation of Chrome extensions

                    // For now, skip this GIF if binary data is not in storage
                    continue;
                }

                const container = document.createElement('div');
                container.className = 'gif-container';

                const img = document.createElement('img');
                const uint8Array = new Uint8Array(binaryData);
                const blob = new Blob([uint8Array], { type: 'image/gif' });
                img.src = URL.createObjectURL(blob);
                img.draggable = true;

                container.dataset.blobUrl = img.src;
                setupDragHandling(img, gif, downloadPath);

                const heart = document.createElement('div');
                heart.className = `heart-icon ${favorites.includes(gif.id) ? 'active' : ''}`;
                heart.innerHTML = favorites.includes(gif.id) ? heartIconSVGFilled : heartIconSVGOutline;
                heart.onclick = () => toggleFavorite(gif.id);

                const deleteIcon = document.createElement('div');
                deleteIcon.className = 'delete-icon';
                deleteIcon.innerHTML = deleteIconSVG;
                deleteIcon.onclick = () => {
                    chrome.storage.local.set({
                        gifs: gifs.filter(g => g.id !== gif.id),
                        favorites: favorites.filter(id => id !== gif.id)
                    }, () => {
                        loadGifs();
                    });
                }

                container.appendChild(img);
                container.appendChild(heart);
                container.appendChild(deleteIcon);
                gifGrid.appendChild(container);
            } catch (error) {
                console.error('Error loading GIF:', error);
            }
        }
    });
}


function toggleFavorite(gifId) {
    chrome.storage.local.get('favorites', ({ favorites = [] }) => {
        const newFavorites = favorites.includes(gifId)
            ? favorites.filter(id => id !== gifId)
            : [...favorites, gifId];

        chrome.storage.local.set({ favorites: newFavorites }, () => {
            loadGifs();
        });
    });
}

function setupDragHandling(img, gifData, downloadPath) {
    img.addEventListener('dragstart', (e) => {
        const filename = `gif_${gifData.id}.gif`;
        const filePath = `${downloadPath}/${filename}`;
        e.dataTransfer.clearData();
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.dropEffect = 'copy';
        e.dataTransfer.items.add(new File([new Blob([new Uint8Array(gifData.binary)], { type: 'image/gif' })], filename));

        console.log('Dragging:', filename, "Data:", e.dataTransfer.getData('image/gif'));

        // Set drag image
        e.dataTransfer.setDragImage(img, 0, 0);
    });
}

// Clean up Blob URLs when popup closes
window.addEventListener('unload', () => {
    document.querySelectorAll('.gif-container').forEach(container => {
        if (container.dataset.blobUrl) {
            URL.revokeObjectURL(container.dataset.blobUrl);
        }
    });
});
