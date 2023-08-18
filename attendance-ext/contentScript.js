const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

let user = '';
let chatConf = {};

function loadChatConf(){
    chrome.storage.local.get(['chatConfig'], function(data) {
        if (data.chatConfig) {
            chatConf.webhook = data.chatConfig.webhook;
            chatConf.channel = data.chatConfig.channel;
            chatConf.username = data.chatConfig.username;
        }
    });
};

function getUserText() {
    // console.log('getUserText')
    let userElem = document.getElementsByClassName("attendance-header-user-name")[0];
    userElem = userElem||document.getElementsByClassName("attendance-mobile-header-user-name")[0];
    // console.log(userElem);
    
    let userName = '';
    if (userElem && userElem.hasChildNodes()) {
        if (userElem.childElementCount == 1) {
            userName = userElem.firstChild.innerText;
        } else {
            [...userElem.childNodes].forEach(function(element) {
                if (!element.hasChildNodes()) {
                    userName = element.data;
                } else if (element.innerText.endsWith('さん')) {
                    userName = element.innerText;
                }
            });
        }
    }
    // console.log(userName);
    
    const re = /^(.+?)さん$/
    user = re.exec(userName)[1];
    // console.log(user);
    return user;
}
function getDateText() {
    // console.log('getDateText')
    const statusContainer = document.getElementsByClassName('status-container')[0];
    const dateStr = statusContainer.firstChild.firstChild.firstChild.innerText.replaceAll(' ', '');
    const timeStr1 = statusContainer.lastChild.firstChild.firstChild.innerText;
    const timeStr2 = statusContainer.lastChild.firstChild.lastChild.innerText;
    const ret = `[${dateStr} ${timeStr1}:${timeStr2}]`;
    // console.log(ret);
    return ret;
}
function getMessageText(text) {
    // console.log(text);
    return `${user||getUserText()} - ${getDateText()} ${text}`
}

/**
 * for `mypage.moneyforward.com`
 */
function getUserText2() {
    const ret = document.getElementById('root').firstChild.firstChild.lastChild.lastChild.firstChild.firstChild.innerText;
    // console.log(ret);
    return ret;
}
/**
 * for `mypage.moneyforward.com`
 */
function getDateText2() {
    let ret = '';
    document.getElementsByTagName('attendance-time-record-container')[0].shadowRoot.childNodes.forEach(function(element) {
        // console.log(element.tagName);
        if (element.tagName === 'SECTION') {
            const dateStr = element.getElementsByClassName('status-container')[0].firstChild.getElementsByTagName('section')[0].innerText.replaceAll(' ', '');
            const timeStr1 = element.getElementsByClassName('status-container')[0].lastChild.firstChild.firstChild.innerText;
            const timeStr2 = element.getElementsByClassName('status-container')[0].lastChild.firstChild.lastChild.innerText;
            ret = `[${dateStr} ${timeStr1}:${timeStr2}]`;
        }
    });
    // console.log(ret);
    return ret;
}
/**
 * for `mypage.moneyforward.com`
 */
function getMessageText2(text) {
    // console.log(text);
    return `${user||getUserText2()} - ${getDateText2()} ${text}`
}

function dataJson(messageText){
    // console.log(messageText);

    let ret = {
        "text" : messageText,
        "username": (chatConf.username || null) ?? "kintai-bot"
    };
    if(chatConf.channel) {
        ret.channel = chatConf.channel;
    }
    // console.log(ret);

    return ret;
}

function postChat(data){
    // console.log(data);
    fetch(chatConf.webhook, {
        method: "POST",
        mode: "no-cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        // })
        // .then(res => res.json())
        // .then(result => {
        //     console.log(result);
        // }).catch((e) => {
        //     console.error(e);
    });
}

function chatPostByClick(messageText) {
    // console.log(messageText);
    const data = dataJson(messageText);
    // console.log(data);
    postChat(data);
}

(async function() {
    /* load configration */
    loadChatConf();
    // console.log(chatConf);

    /* event */
    const chatPostEventName = 'click';

    /*
     * for `attendance.moneyforward.com`
     */
    if (location.hostname === 'attendance.moneyforward.com' && location.pathname === '/my_page') {
        [...document.getElementsByClassName('time-stamp-button')].forEach(function(element) {
            element.addEventListener(chatPostEventName, function(e) {
                chatPostByClick(getMessageText(element.innerText));
            });
        });
    }

    /*
     * for `mypage.moneyforward.com`
     */
    if (location.hostname === 'mypage.moneyforward.com' && location.pathname === '/') {
        await sleep(1000);
        document.getElementsByTagName('attendance-time-record-container')[0].shadowRoot.childNodes.forEach(
            function(element) {
                if (element.tagName === 'SECTION') {
                    [...element.getElementsByClassName('time-stamp-button')].forEach(function(elem) {
                        elem.addEventListener(chatPostEventName, function(e) {
                            chatPostByClick(getMessageText2(elem.innerText));
                        });
                    });
                }
            }
        );
    }
})();

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        const storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue
        );
    }
    loadChatConf();
});
