let TIMELINE_SEMANTIC_THRESHOLD = 0.85;
let SINGLE_TWEET_SEMANTIC_THRESHOLD = 0.803;
let MARKET_COUNT = 1;

// Load the values from storage when the script starts
function loadSettings() {
  chrome.storage.sync.get({
      timelineThreshold: 0.85,
      singleTweetThreshold: 0.803,
      marketCount: 1
  }, function(items) {
      TIMELINE_SEMANTIC_THRESHOLD = items.timelineThreshold;
      SINGLE_TWEET_SEMANTIC_THRESHOLD = items.singleTweetThreshold;
      MARKET_COUNT = items.marketCount;
      // console.log("Adjacent News Settings loaded:", items);
  });
}

// Load settings initially
loadSettings();

// Listen for changes to the stored values
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.timelineThreshold) {
      TIMELINE_SEMANTIC_THRESHOLD = changes.timelineThreshold.newValue;
  }
  if (changes.singleTweetThreshold) {
      SINGLE_TWEET_SEMANTIC_THRESHOLD = changes.singleTweetThreshold.newValue;
  }
  if (changes.marketCount) {
      MARKET_COUNT = changes.marketCount.newValue;
  }
  // console.log("Adjacent News Settings updated:", {
  //     TIMELINE_SEMANTIC_THRESHOLD,
  //     SINGLE_TWEET_SEMANTIC_THRESHOLD,
  //     MARKET_COUNT
  // });
});

let processedTweets = new Map();

function isSingleTweetPage() {
  return window.location.pathname.includes('/status/');
}

function gatherVisibleTweets() {
  const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
  
  tweetElements.forEach(tweetElement => {
    const tweetId = getTweetId(tweetElement);
    if (tweetId && !processedTweets.has(tweetId)) {
      const tweetTextElement = tweetElement.querySelector('div[data-testid="tweetText"]');
      
      if (tweetTextElement) {
        const tweetText = tweetTextElement.textContent.trim();
        processedTweets.set(tweetId, null); // Set to null initially
        // console.log(`New tweet found: ${tweetText}`);
        fetchMarketNews(tweetId, tweetText);
      }
    }
    
    // Always try to add or update the indicator
    addProcessedIndicator(tweetElement);
  });
  
  // console.log("Total processed tweets:", processedTweets.size);
}

function getTweetId(tweetElement) {
  const tweetLinkElement = tweetElement.querySelector('a[href*="/status/"]');
  if (tweetLinkElement) {
    const href = tweetLinkElement.getAttribute('href');
    const match = href.match(/\/status\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

function fetchMarketNews(tweetId, tweetText) {
  // Only fetch if the tweet has not been processed yet and tweetText is not null or empty
  if (processedTweets.get(tweetId) === null && tweetText) {
    const threshold = isSingleTweetPage() ? SINGLE_TWEET_SEMANTIC_THRESHOLD : TIMELINE_SEMANTIC_THRESHOLD;
    const apiUrl = `https://api.data.adj.news/api/markets/headline/${encodeURIComponent(tweetText)}?count=${MARKET_COUNT}&threshold=${threshold}`;
    console.log(`Fetching market news for tweet ${tweetId} at semantic threshold ${threshold}...`);
    fetch(apiUrl, { method: 'GET' })
      .then(response => response.json())
      .then(markets => {
        if (markets.length > 0) {
          let market = markets[0];
          if (market.link && market.question && market.probability) {
            // console.log(`✅ Market news found for tweet ${tweetId}: ${market.question} - ${market.probability}%`);
            processedTweets.set(tweetId, market);
            addProcessedIndicator(document.querySelector(`article[data-testid="tweet"] a[href*="/status/${tweetId}"]`).closest('article'));
          }
        }
      })
      .catch(error => console.error('Error fetching markets:', error));
  }
}

function addProcessedIndicator(tweetElement) {
  const tweetId = getTweetId(tweetElement);
  if (!tweetId || !processedTweets.has(tweetId)) {
    return;
  }

  const marketData = processedTweets.get(tweetId);
  if (!marketData) {
    return; // Market data not yet fetched
  }

  let indicator = tweetElement.querySelector('.tweet-processed-indicator');
  if (!indicator) {
    const buttonContainer = tweetElement.querySelector('div[role="group"]');
    if (buttonContainer) {
      indicator = document.createElement('div');
      indicator.className = 'tweet-processed-indicator';
      indicator.style.cssText = `
        background-color: #1c1c1e;
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
        margin-top: 8px;
      `;
      
      const iconSpan = document.createElement('span');
      iconSpan.innerHTML = '&#x2728;'; // Unicode for sparkles emoji
      iconSpan.style.cssText = `
        font-size: 20px;
        margin-right: 12px;
      `;
      
      const textDiv = document.createElement('div');
      textDiv.style.cssText = `
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        font-size: 15px;
        font-weight: 500;
        line-height: 1.2;
        text-decoration: underline;
        text-decoration-style: dashed;
      `;
      
      indicator.appendChild(iconSpan);
      indicator.appendChild(textDiv);
      
      buttonContainer.parentNode.insertBefore(indicator, buttonContainer.nextSibling);
    }
  }
  
  if (indicator) {
    // indicator was added, now update it
    const textDiv = indicator.querySelector('div');
    const anchor = document.createElement('a');
    anchor.href = marketData.link;
    anchor.target = '_blank';
    anchor.style.cssText = `
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.2;
      text-decoration: underline;
      text-decoration-style: dashed;
    `;
    anchor.textContent = `${marketData.question}: ${marketData.probability}% - via Adjacent News`;
    textDiv.innerHTML = ''; // Clear previous content
    textDiv.appendChild(anchor);
    indicator.href = marketData.link;
    // Add a click event listener, but only once
    if (!indicator.dataset.clickListenerAdded) {
      indicator.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(marketData.link, '_blank');
      });
      indicator.dataset.clickListenerAdded = 'true'; // Mark that the listener has been added
    }
    indicator.target = '_blank'; // Open in a new tab
  }
}

// Run the function when the page loads
gatherVisibleTweets();

// Run the function periodically to catch dynamically loaded tweets
setInterval(gatherVisibleTweets, 500); // Run every 0.5 seconds

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showTicker") {
    // console.log("got showTicker action request, gathering tweets...");
    gatherVisibleTweets();
  }
});

// MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === 'childList') {
      for (let node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('article[data-testid="tweet"]') || node.querySelector('article[data-testid="tweet"]')) {
            gatherVisibleTweets();
            return;
          }
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });