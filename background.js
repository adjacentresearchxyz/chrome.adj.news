let whitelist = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['whitelist'], (result) => {
    console.log(result)
    whitelist = result.whitelist || [];
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const url = new URL(tab.url);
    const domain = url.hostname.split('.').slice(-2).join('.');
      
    if ((whitelist.includes(domain) || ['wsj.com', 'semafor.com', 'reuters.com', "x.com", "twitter.com"].includes(domain))) {
      chrome.tabs.sendMessage(tabId, { action: "showTicker" });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addToWhitelist") {
    whitelist.push(request.domain);
    chrome.storage.sync.set({ whitelist: whitelist });
  } else if (request.action === "removeFromWhitelist") {
    whitelist = whitelist.filter(site => site !== request.domain);
    chrome.storage.sync.set({ whitelist: whitelist });
  }
});