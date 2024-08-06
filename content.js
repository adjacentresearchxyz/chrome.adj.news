let ticker;

function createTicker() {
  ticker = document.createElement('div');
  ticker.id = 'ticker';
  ticker.style.display = 'none';
  ticker.style.padding = '10px'; // Added padding
  ticker.style.textAlign = 'center'; // Centered the text
  ticker.style.fontFamily = 'monospace'; // Made the font mono
  document.body.prepend(ticker);
}

function showTicker() {
  const pageTitle = document.title;
  
  fetch(`https://api.data.adj.news/api/markets/headline/${pageTitle}`)
    .then(response => response.json())
    .then(markets => {
      let market = markets[0];
      if (market.link && market.question && market.probability) {
        ticker.innerHTML = `
          <a href="${market.link}" style="text-decoration: underline; text-decoration-style: dashed;">${market.question}: ${market.probability}%</a>
        `;
      }
      ticker.style.display = 'block';
    })
    .catch(error => console.error('Error fetching markets:', error));
}

createTicker();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showTicker") {
    showTicker();
  }
});