chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "changePage"){
            sendResponse({text: "document.body.innerText", method: "changePage"}); //same as innerText
            connect();
        }
    }
);

config = {
    scrollDelay: 1000,
    actionDelay: 3000,
    maxRequests: -1,
    totalRequestsSent: 0,
}

var data = {}

function connect() {
    var elements = document.querySelectorAll('button');
    data.pageButtons = [...elements].filter(function (element) {
        return element.textContent.trim() === "Connect";
    });
    if (!data.pageButtons || data.pageButtons.length === 0) {
        console.warn("ERROR: no connect buttons found on page!");
    } else {
        data.pageButtonTotal = data.pageButtons.length;
        console.info("INFO: " + data.pageButtonTotal + " connect buttons found");
        data.pageButtonIndex = 0;
        var names = document.getElementsByClassName("entity-result__title-text");
        names = [...names].filter(function (element) {
            return element.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.textContent.includes("Connect\n");
        });
        data.connectNames = [...names].map(function (element) {
            return element.innerText.split(" ")[0];
        });
        console.debug("DEBUG: starting to send invites in " + config.actionDelay + " ms");
        setTimeout(() => { this.sendInvites(data, config) }, config.actionDelay);
    }
}

function sendInvites(data, config) {
    console.debug("remaining requests " + config.maxRequests);
    if (config.maxRequests == 0) {
        console.info("INFO: max requests reached for the script run!");
        this.complete(config);
    } else {
        console.debug('DEBUG: sending invite to ' + (data.pageButtonIndex + 1) + ' out of ' + data.pageButtonTotal);
        var button = data.pageButtons[data.pageButtonIndex];
        button.click();
        console.debug("DEBUG: clicking done in popup, if present, in " + config.actionDelay + " ms");
        setTimeout(() => this.clickDone(data, config), config.actionDelay);
    }
}

function clickDone(data, config) {
    var buttons = document.querySelectorAll('button');
    var doneButton = Array.prototype.filter.call(buttons, function (el) {
        return el.textContent.trim() === 'Send';
    });
    // Click the first send button
    if (doneButton && doneButton[0]) {
        console.debug("DEBUG: clicking send button to close popup");
        doneButton[0].click();
    } else {
        console.debug("DEBUG: send button not found, clicking close on the popup in " + config.actionDelay);
    }
    setTimeout(() => this.clickClose(data, config), config.actionDelay);
}

function clickClose(data, config) {
    var closeButton = document.getElementsByClassName('artdeco-modal__dismiss artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary ember-view');
    if (closeButton && closeButton[0]) {
        closeButton[0].click();
    }
    console.info('INFO: invite sent to ' + (data.pageButtonIndex + 1) + ' out of ' + data.pageButtonTotal);
    config.maxRequests--;
    config.totalRequestsSent++;
    if (data.pageButtonIndex === (data.pageButtonTotal - 1)) {
    } else {
        data.pageButtonIndex++;
        console.debug("DEBUG: sending next invite in " + config.actionDelay + " ms");
        setTimeout(() => this.sendInvites(data, config), config.actionDelay);
    }
}

