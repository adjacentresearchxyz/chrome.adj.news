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
    const domain = url.hostname;

    console.log(whitelist)
      
    if ((whitelist.includes(domain) || ['www.wsj.com', 'www.semafor.com', 'www.reuters.com'].includes(domain)) && url.pathname !== '/') {
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