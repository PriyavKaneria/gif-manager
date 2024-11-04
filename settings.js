// Load saved settings
chrome.storage.local.get(['downloadPath', 'downloadSetting'], (data) => {
    if (data.downloadPath) {
        document.getElementById('customPath').value = data.downloadPath;
    }
    if (data.downloadSetting === 'yes') {
        document.getElementById('downloadYes').checked = true;
        updateForm(data.downloadSetting);
    } else {
        document.getElementById('downloadNo').checked = true;
        updateForm(data.downloadSetting);
    }
});

// Handle radio button changes
document.querySelectorAll('input[name="download"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        updateForm(e.target.value);
    });
});

function updateForm(value) {
    const customPath = document.getElementById('customPath');
    customPath.disabled = value !== 'yes';

    const pathForm = document.getElementById('path-form');
    pathForm.style.display = value === 'yes' ? 'block' : 'none';
}

// Save settings
document.getElementById('saveSettings').addEventListener('click', () => {

    const downloadPath = document.getElementById('customPath').value.trim();
    if (!downloadPath) {
        showStatus('Please enter a path!', true);
        return;
    }

    const downloadSetting = document.querySelector('input[name="download"]:checked').value;

    chrome.storage.local.set({
        downloadPath: downloadPath,
        downloadSetting: downloadSetting
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
