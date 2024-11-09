let currentTab = 'all';
const heartIconSVGOutline = '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#f72b2b" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>';
const heartIconSVGFilled = '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#f72b2b" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>';
const deleteIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 16 16"><path d="M 6.496094 1 C 5.675781 1 5 1.675781 5 2.496094 L 5 3 L 2 3 L 2 4 L 3 4 L 3 12.5 C 3 13.328125 3.671875 14 4.5 14 L 10.5 14 C 11.328125 14 12 13.328125 12 12.5 L 12 4 L 13 4 L 13 3 L 10 3 L 10 2.496094 C 10 1.675781 9.324219 1 8.503906 1 Z M 6.496094 2 L 8.503906 2 C 8.785156 2 9 2.214844 9 2.496094 L 9 3 L 6 3 L 6 2.496094 C 6 2.214844 6.214844 2 6.496094 2 Z M 5 5 L 6 5 L 6 12 L 5 12 Z M 7 5 L 8 5 L 8 12 L 7 12 Z M 9 5 L 10 5 L 10 12 L 9 12 Z"></path></svg>';

document.addEventListener('DOMContentLoaded', async () => {
    setupTabs();
    setupTwitterGIFInput();
    await loadGifs();

    chrome.storage.local.get(null, (data) => {
        console.log('All data:', data);
    })
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

function showTwitterGIFStatus(success, msg) {
    const twitterGIFInput = document.getElementById('twitterGif');
    const status = document.getElementById('status');
    const addBtn = document.getElementById('addTwitterGif');
    if (success) {
        status.style.color = 'green';
        status.textContent = msg;
        twitterGIFInput.value = '';
    } else {
        status.style.color = 'red';
        status.textContent = 'Failed : ' + msg;
    }
    addBtn.disabled = false;
    addBtn.textContent = 'Add';
}

function setupTwitterGIFInput() {
    const twitterGIFInput = document.getElementById('twitterGif');
    const addBtn = document.getElementById('addTwitterGif');
    const status = document.getElementById('status');

    addBtn.addEventListener('click', async () => {
        const tweetUrl = twitterGIFInput.value.trim();
        if (!tweetUrl) {
            status.style.color = 'red';
            status.textContent = 'Please enter a valid tweet URL';
            return;
        }
        addBtn.disabled = true;
        addBtn.textContent = 'Processing';



        await convertTwitterVideoToGif(tweetUrl, (progress) => {
            addBtn.textContent = `Processing (${Math.round(progress * 100)}%)`;
        })
            .catch((error) => {
                console.error('Error converting Twitter video to GIF:', error);
            });
    });
}

async function loadGifs() {
    const gifGrid = document.getElementById('gifGrid');
    gifGrid.innerHTML = '';

    const lazyLoad = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // console.log('Lazy loading:', img);
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                img.parentElement.classList.remove('template');

                observer.unobserve(img);
            }
        });
    };

    const observer = new IntersectionObserver(lazyLoad, {
        root: document.getElementById('scrollarea'),
        rootMargin: '0px 0px 10px 0px',
        threshold: 0
    });

    const asyncLoadGifs = async (gifs, favorites = []) => {
        // asynchronously get the gif data for each id
        notFound = [];
        gifs.forEach(gifId => {
            // console.log('Loading GIF:', gifId);

            chrome.storage.local.get(`gif_${gifId}`, async (gifData) => {
                const gif = gifData[`gif_${gifId}`];
                if (!gif) {
                    console.log('GIF not found:', gifId);
                    notFound.push(gifId);
                    return;
                }
                // console.log('Loaded GIF:', gif.id);

                const container = document.createElement('div');
                container.className = 'gif-container template';

                const img = document.createElement('img');
                img.draggable = true;
                img.dataset.gifId = gif.id;

                const heart = document.createElement('div');
                heart.className = `heart-icon ${favorites.includes(gif.id) ? 'active' : ''}`;
                heart.innerHTML = favorites.includes(gif.id) ? heartIconSVGFilled : heartIconSVGOutline;
                heart.onclick = () => toggleFavorite(gif.id);

                const deleteIcon = document.createElement('div');
                deleteIcon.className = 'delete-icon';
                deleteIcon.innerHTML = deleteIconSVG;
                deleteIcon.onclick = () => {
                    chrome.storage.local.remove(`gif_${gif.id}`, () => {
                        loadGifs();
                    });
                    chrome.storage.local.get(['gifs', 'favorites'], ({ gifs = [], favorites = [] }) => {
                        chrome.storage.local.set({
                            gifs: gifs.filter(id => id !== gif.id),
                            favorites: favorites.filter(id => id !== gif.id)
                        });
                    });
                };

                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.color = 'white';
                overlay.style.fontSize = '14px';
                overlay.style.fontWeight = 'bold';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.3s';
                overlay.style.pointerEvents = 'none';
                overlay.textContent = 'Click to add';

                container.style.position = 'relative';
                container.appendChild(overlay);
                container.addEventListener('mouseenter', () => {
                    overlay.style.opacity = '1';
                });
                container.addEventListener('mouseleave', () => {
                    overlay.style.opacity = '0';
                });

                container.appendChild(img);
                container.appendChild(heart);
                container.appendChild(deleteIcon);
                gifGrid.appendChild(container);

                if (gif.binary) {
                    try {
                        const uint8Array = new Uint8Array(gif.binary);
                        const blob = new Blob([uint8Array], { type: 'image/gif' });
                        const blobUrl = URL.createObjectURL(blob);
                        img.alt = `GIF ${gif.id}`;
                        img.dataset.src = blobUrl;
                        container.dataset.blobUrl = blobUrl;

                        img.addEventListener('click', () => {
                            setupDragHandling(gif);
                        });
                        img.addEventListener('dragstart', () => {
                            setupDragHandling(gif);
                        });

                        // Lazy load the GIF
                        observer.observe(img);
                        // console.log('Observing:', img);

                    } catch (error) {
                        console.error('Error creating Blob URL:', error);
                    }
                }
            });
        });

        if (notFound.length) {
            chrome.storage.local.set({ gifs: gifs.filter(id => !notFound.includes(id)) });
        }
    };

    // get the list of gif ids from storage
    if (currentTab === 'favorites') {
        chrome.storage.local.get('favorites', async ({ favorites = [] }) => {
            asyncLoadGifs(favorites, favorites);
        });
    } else {
        chrome.storage.local.get(['gifs', 'favorites'], async ({ gifs = [], favorites = [] }) => {
            asyncLoadGifs(gifs, favorites);
        });
    }
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

// DRAG AND DROP
// did not work because popup closes when drag ends outside and hence the event listener is removed
function setupDragHandling(gifData) {
    // Get the data and simulate the drop
    // Execute in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(
            activeTab.id,
            {
                type: 'EXTENSION_DRAG_DROP_FILE',
                gifData: gifData
            }
        );
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

async function convertTwitterVideoToGif(tweetUrl, onProgress) {
    // Function to wait for video element with timeout and retries
    try {
        // check if activetab is on x.com
        await chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
            // console.log(tabs[0]);
            if (!tabs[0].url) {
                showTwitterGIFStatus(false, 'No active tab found');
            }

            // console.log(tabs[0].url.includes('x.com'));

            if (!tabs[0].url.includes('x.com')) {
                showTwitterGIFStatus(false, 'Please keep x.com tab in focus for GIF');
            }

            const videoUrl = await new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject()
                }, 4000);
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'EXTENSION_GET_VIDEO',
                    tweetURL: tweetUrl
                }, (data) => {
                    if (data.videoUrl) {
                        clearTimeout(timeout);
                        resolve(data.videoUrl);
                    } else {
                        reject();
                    }
                });
            })

            if (!videoUrl) {
                showTwitterGIFStatus(false, 'No video found in tweet');
            }

            // Create a video element to load the video
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = videoUrl;

            // Wait for video metadata to load
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = reject;
                video.load();
            });

            // Create a canvas to draw video frames
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', {
                willReadFrequently: true
            });
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Initialize GIF encoder with more conservative settings
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: video.videoWidth,
                height: video.videoHeight,
                workerScript: 'gif.worker.js',
                dither: false // Disable dithering for faster processing
            });

            // Process video frames with progress tracking
            const frameCount = Math.min(Math.floor(video.duration * 10), 50); // Cap at 50 frames
            const frameInterval = video.duration / frameCount;

            for (let i = 0; i < frameCount; i++) {
                video.currentTime = i * frameInterval;
                await new Promise(resolve => {
                    video.onseeked = () => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        gif.addFrame(ctx, {
                            copy: true,
                            delay: frameInterval * 1000,
                            dispose: 1 // Use disposal method 1 for better optimization
                        });
                        // Emit progress if callback provided
                        if (typeof onProgress === 'function') {
                            onProgress((i + 1) / frameCount);
                        }
                        resolve();
                    };
                });
            }

            // Return promise that resolves with the gif blob
            const gifData = await new Promise((resolve, reject) => {
                gif.on('finished', blob => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(blob);
                });
                gif.render();
            })

            const gifId = Date.now().toString();
            // Save the GIF data
            chrome.storage.local.set({ [`gif_${gifId}`]: { id: gifId, binary: Array.from(new Uint8Array(gifData)), timestamp: Date.now() } }, () => {
                chrome.storage.local.get('gifs', ({ gifs = [] }) => {
                    chrome.storage.local.set({ gifs: [...gifs, gifId] }, () => {
                        // if active tab is favorites add to favorites
                        if (currentTab === 'favorites') {
                            chrome.storage.local.get('favorites', ({ favorites = [] }) => {
                                chrome.storage.local.set({ favorites: [...favorites, gifId] });
                            });
                        }
                        loadGifs();
                        showTwitterGIFStatus(true, 'GIF added successfully!')
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error fetching video URL:', error);
        showTwitterGIFStatus(false, 'Could not find video element');
    }
}
