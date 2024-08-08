document.addEventListener('DOMContentLoaded', function() {
    const timeline = document.getElementById('timeline');
    const single = document.getElementById('single');
    const count = document.getElementById('count');
    const save = document.getElementById('save');
    const status = document.getElementById('status');

    // Load saved values
    chrome.storage.sync.get({
        timelineThreshold: 0.85,
        singleTweetThreshold: 0.803,
        marketCount: 1
    }, function(items) {
        timeline.value = items.timelineThreshold;
        single.value = items.singleTweetThreshold;
        count.value = items.marketCount;
    });

    // Save button listener
    document.getElementById('save').addEventListener('click', function() {
        var timelineThreshold = parseFloat(document.getElementById('timeline').value);
        var singleTweetThreshold = parseFloat(document.getElementById('single').value);
        var marketCount = parseInt(document.getElementById('count').value);

        chrome.storage.sync.set({
            timelineThreshold: timelineThreshold,
            singleTweetThreshold: singleTweetThreshold,
            marketCount: marketCount
        }, function() {
            var status = document.getElementById('status');
            status.textContent = 'Settings saved.';
            setTimeout(function() {
                status.textContent = '';
            }, 2000);
        });
    });

    // Log stored settings to console
    chrome.storage.sync.get(null, function(items) {
        console.log(items);
    });
});