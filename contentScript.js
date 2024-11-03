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
