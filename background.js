console.log("ESTOU NO BACKGROUND E FUNCIONANDO")
// omnibox
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    suggest([
        { content: "color-divs", description: "Make everything red" }
    ]);
});
chrome.omnibox.onInputEntered.addListener(function (text) {
    if (text == "color-divs") playerSpotify();
});

// listening for an event / one-time requests
// coming from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    playerSpotify(request.type);
    return true;
});

// listening for an event / long-lived connections
// coming from devtools
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (message) {
        switch (port.name) {
            case "color-divs-port":
                playerSpotify(port.name);
                break;
        }
    });
});

// // send a message to the content script
// var playerSpotify = function (type) {
//     chrome.tabs.query(null, function (tab) {
//         chrome.tabs.sendMessage(tab.id, { type: type });
//         // setting a badge
//         //chrome.browserAction.setBadgeText({text: "play!"});
//     });
// }

var playerSpotify = function (type) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            var tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, { type: type });
            // setting a badge
            //chrome.action.setBadgeText({text: "play!"});
        }
    });
}


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        chrome.tabs.sendMessage(tabId, { type: "play-music", color: "#F00" });
    }
})