// Background script for WiFi Auto Login Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('WiFi Auto Login Extension installed');
  
  // Set default settings for smart redirect
  chrome.storage.sync.get(['enableRedirect'], function(result) {
    if (result.enableRedirect === undefined) {
      chrome.storage.sync.set({
        enableRedirect: true  // Enable smart redirect by default
      });
    }
  });
});

// Store the last intended URL before portal redirect
let lastIntendedUrl = '';

// Listen for navigation to detect intended destination
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    const url = details.url.toLowerCase();
    
    // Check if this looks like a search engine attempt
    const searchEnginePatterns = [
      'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com', 
      'yandex.com', 'baidu.com', 'brave.com', 'startpage.com', 'ecosia.org'
    ];
    
    if (searchEnginePatterns.some(pattern => url.includes(pattern))) {
      lastIntendedUrl = details.url;
      console.log('Detected search engine attempt:', lastIntendedUrl);
      
      // Store this for the content script to access
      chrome.storage.local.set({
        lastIntendedUrl: lastIntendedUrl,
        timestamp: Date.now()
      });
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'portalDetected') {
    console.log('Portal detected:', request.url);
    sendResponse({status: 'received'});
  } else if (request.action === 'getLastIntendedUrl') {
    // Return the last intended URL if recent (within 5 minutes)
    chrome.storage.local.get(['lastIntendedUrl', 'timestamp'], function(result) {
      const isRecent = result.timestamp && (Date.now() - result.timestamp) < 300000; // 5 minutes
      sendResponse({
        url: isRecent ? result.lastIntendedUrl : null,
        timestamp: result.timestamp
      });
    });
    return true;
  }
  return true;
});

// Listen for startup
chrome.runtime.onStartup.addListener(() => {
  console.log('WiFi Auto Login Extension started');
});

// Helper function to check if URL looks like a portal
function isLikelyPortalURL(url) {
  const portalIndicators = [
    'captive',
    'portal',
    'login',
    'auth',
    'welcome',
    'gateway',
    'wifi',
    'hotspot',
    '192.168.',
    '10.0.',
    '172.16.',
    'connectify.me',
    'neverssl.com'
  ];
  
  return portalIndicators.some(indicator => 
    url.toLowerCase().includes(indicator.toLowerCase())
  );
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'portalDetected') {
    console.log('Portal detected:', request.url);
    // You can add additional logic here if needed
  }
});
