chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {
                hostEquals: 'attendance.moneyforward.com',
                pathEquals: '/my_page'
              },
            }),
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {
                hostEquals: 'mypage.moneyforward.com',
                pathEquals: '/'
              },
            }),
          ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
