// Create notification container
const notificationContainer = document.createElement('div');
notificationContainer.style.cssText = `
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 10000;
	font-family: Arial, sans-serif;
`;
document.body.appendChild(notificationContainer);

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('Content script received message:', request);

	if (request.action === 'showNotification') {
		showNotification(request.message);
	}
});

function showNotification(message) {
	const notification = document.createElement('div');
	notification.style.cssText = `
		background-color: #333;
		color: white;
		padding: 12px 24px;
		border-radius: 4px;
		margin-top: 10px;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		animation: slideIn 0.3s ease-out;
	`;
	notification.textContent = message;

	notificationContainer.appendChild(notification);

	// Remove notification after 3 seconds
	setTimeout(() => {
		notification.style.animation = 'slideOut 0.3s ease-out';
		setTimeout(() => {
			notificationContainer.removeChild(notification);
		}, 300);
	}, 3000);
}

// Add CSS animations to head
const style = document.createElement('style');
style.textContent = `
	@keyframes slideIn {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
	
	@keyframes slideOut {
		from { transform: translateX(0); opacity: 1; }
		to { transform: translateX(100%); opacity: 0; }
	}
`;
document.head.appendChild(style);


// Create a custom event handler for communication
window.addEventListener('message', async (event) => {
	// Verify the message is from our extension
	if (event.data.type === 'EXTENSION_DRAG_DROP_FILE' && event.data.gifData) {
		const { gifData } = event.data;

		// Create the File object
		const file = new File(
			[new Blob([new Uint8Array(gifData.binary)], { type: 'image/gif' })],
			`gif_${gifData.id}.gif`,
			{ type: 'image/gif' }
		);

		// Find and update the file input
		const dropZone = document.querySelector('input[type="file"]');

		// console.log("found dropzone", dropZone);
		if (!dropZone) return;

		const triggerUpload = () => {
			// Create a DataTransfer object
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);

			// Trigger the change event with the file
			const uploadEvent = new Event('change', { bubbles: true });
			Object.defineProperty(uploadEvent, 'target', {
				writable: false,
				value: {
					files: dataTransfer.files
				}
			});

			dropZone.files = dataTransfer.files;
			// Also try dispatching input event which some frameworks might listen to
			dropZone.dispatchEvent(new Event('input', { bubbles: true }));

			// Force a focus event first which might help some frameworks
			dropZone.focus();

			dropZone.dispatchEvent(uploadEvent);
		};

		// First attempt
		triggerUpload();
		setTimeout(() => {
			// If the upload failed, try again
			if (dropZone.files.length === 0) {
				console.log("Failed to upload! retrying...");
				triggerUpload();
			}
		}, 500);

		// // If first attempt fails, try with increasing delays
		// // max retries : 3
		// for (let i = 0; i < 3; i++) {
		// 	await new Promise(resolve => setTimeout(resolve, 50 * (i + 1))); // Increasing delays: 50ms, 100ms, 150ms, etc.
		// 	console.log("Failed to upload! retry - ", i);
		// 	if (triggerUpload()) return;
		// }

		return;
	}
});

// Create a separate script file for page context
const pageScript = document.createElement('script');
pageScript.src = chrome.runtime.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(pageScript);

// Clean up
pageScript.onload = function () {
	pageScript.remove();
};
