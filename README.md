# chrome.adj.news
(In Alpha) Chrome Extension that provides extra context to News you read. 

Right now this works for the following sites ([code](https://github.com/adjacentresearchxyz/chrome.adj.news/blob/3caea0190103f1b63355cfddd20ad2cecec7208f/background.js#L17)
```
    if ((whitelist.includes(domain) || ['www.wsj.com', 'www.semafor.com', 'www.reuters.com'].includes(domain)) && url.pathname !== '/') {
      chrome.tabs.sendMessage(tabId, { action: "showTicker" });
    }
```

feel free to add your own, eventually this will be part of the settings. This uses the [adj.news](https://adj.news) API which can be found at [docs.adj.news](https://docs.adj.news). 

It looks like this (note the subtle ticker bar at the top with the related prediction market to the news)
![Google search violates US antitrust law_ judge rules _ Semafor](https://github.com/user-attachments/assets/f3f629ce-498d-4c48-af36-48f51ab3e63e)

## Usage
If you would like to use this
- clone / download the repo
- head to [chrome://extensions](chrome://extensions)
- click developer mode toggle in top right
- click "load unpacked"
- click on the downloaded (unzipped) folder
- head to a supported website
