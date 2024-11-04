window.extensionDropHandler = {
    simulateFileDrop: function (gifData) {
        window.postMessage({
            type: 'EXTENSION_DRAG_DROP_FILE',
            gifData: gifData
        }, '*');
    }
};
