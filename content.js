let ticker;

function modifyRelatedPosts() {
  const relatedPostsElement = document.querySelector('a[data-testid="similar_posts_pivot"]');
  if (relatedPostsElement) {
    const pageTitle = document.title;
    fetch(`https://api.data.adj.news/api/markets/headline/${encodeURIComponent(pageTitle)}`)
      .then(response => response.json())
      .then(markets => {
        let market = markets[0];
        if (market.link && market.question && market.probability) {
          // Create a new div to wrap our content
          const wrapperDiv = document.createElement('div');
          wrapperDiv.style.cssText = `
            background-color: #1c1c1e;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
          `;

          // Create the icon element
          const iconSpan = document.createElement('span');
          iconSpan.innerHTML = '&#x2728;'; // Unicode for sparkles emoji
          iconSpan.style.cssText = `
            font-size: 20px;
            margin-right: 12px;
          `;

          // Create the text content
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
          textDiv.textContent = `${market.question}: ${market.probability}% - via Adjacent News`;

          // Assemble the elements
          wrapperDiv.appendChild(iconSpan);
          wrapperDiv.appendChild(textDiv);

          // Replace the original content
          relatedPostsElement.innerHTML = '';
          relatedPostsElement.appendChild(wrapperDiv);

          // Modify the parent element styles if necessary
          relatedPostsElement.style.textDecoration = 'none';
          relatedPostsElement.style.display = 'block';
          relatedPostsElement.href = market.link;

          // Show the related posts element after it's been updated
          relatedPostsElement.style.display = 'block';
        } else {
          // If no market data is found, hide the related posts element
          relatedPostsElement.style.display = 'none';
        }
      })
      .catch(error => console.error('Error fetching markets:', error));
    console.log('Modified related posts element with page title:', pageTitle);
  } else {
    console.log('Related posts element not found on this page');
  }
}

// Run the function when the page loads
modifyRelatedPosts();

// Also run the function when the page content changes (for dynamic websites)
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === 'childList') {
      for (let node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('a[data-testid="similar_posts_pivot"]') || node.querySelector('a[data-testid="similar_posts_pivot"]')) {
            modifyRelatedPosts();
            return;
          }
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
