// Auto-detect OS
chrome.runtime.getPlatformInfo(function (info) {
    const osMap = {
        'mac': 'macos',
        'win': 'windows',
        'linux': 'other',
        'android': 'other',
        'cros': 'other',
        'linux': 'other',
        'openbsd': 'other'
    };
    const os = osMap[info.os] || 'other';
    document.querySelector(`input[value="${os}"]`).checked = true;
    updatePathInputVisibility(os);
});

// Handle radio button changes
document.querySelectorAll('input[name="os"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        updatePathInputVisibility(e.target.value);
    });
});

// Handle custom path link
document.getElementById('customPathLink-mac').addEventListener('click', () => {
    document.getElementById('customPath').value = '/please/enter/an/absolute/path/here/GIFManager';
    document.getElementById('other').checked = true;
    updatePathInputVisibility('other');
});
document.getElementById('customPathLink-win').addEventListener('click', () => {
    document.getElementById('customPath').value = '/please/enter/an/absolute/path/here/GIFManager';
    document.getElementById('other').checked = true;
    updatePathInputVisibility('other');
});

function updatePathInputVisibility(os) {
    document.getElementById('macosPathGroup').style.display = os === 'macos' ? 'block' : 'none';
    document.getElementById('windowsPathGroup').style.display = os === 'windows' ? 'block' : 'none';
    document.getElementById('otherPathGroup').style.display = os === 'other' ? 'block' : 'none';
}

// Load saved settings
chrome.storage.local.get(['downloadPath', 'os'], (data) => {
    if (data.downloadPath) {
        if (data.os === 'macos') {
            const matches = data.downloadPath.match(/^\/Users\/([^/]+)\/Downloads\/(.+)$/);
            if (matches) {
                document.getElementById('macUsername').value = matches[1];
                document.getElementById('macFolderName').value = matches[2];
            }
        } else if (data.os === 'windows') {
            const matches = data.downloadPath.match(/^C:\\Users\\([^\\]+)\\Downloads\\(.+)$/);
            if (matches) {
                document.getElementById('winUsername').value = matches[1];
                document.getElementById('winFolderName').value = matches[2];
            }
        } else {
            document.getElementById('customPath').value = data.downloadPath;
        }
    }
});

// Save settings
document.getElementById('saveSettings').addEventListener('click', () => {
    const os = document.querySelector('input[name="os"]:checked').value;
    let downloadPath = '';

    if (os === 'macos') {
        const username = document.getElementById('macUsername').value.trim();
        const folderName = document.getElementById('macFolderName').value.trim();
        if (!username || !folderName) {
            showStatus('Please fill in all fields!', true);
            return;
        }
        downloadPath = `/Users/${username}/Downloads/${folderName}`;
    } else if (os === 'windows') {
        const username = document.getElementById('winUsername').value.trim();
        const folderName = document.getElementById('winFolderName').value.trim();
        if (!username || !folderName) {
            showStatus('Please fill in all fields!', true);
            return;
        }
        downloadPath = `C:\\Users\\${username}\\Downloads\\${folderName}`;
    } else {
        downloadPath = document.getElementById('customPath').value.trim();
        if (!downloadPath) {
            showStatus('Please enter a path!', true);
            return;
        }
    }

    chrome.storage.local.set({
        downloadPath: downloadPath,
        os: os
    }, () => {
        showStatus('Settings saved!');
    });
});

function showStatus(message, isError = false) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#dc3545' : '#28a745';
    setTimeout(() => {
        statusEl.textContent = '';
    }, 2000);
}