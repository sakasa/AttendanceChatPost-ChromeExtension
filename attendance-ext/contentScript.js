const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

let mfckExtUser = '';
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

function messageFormat(userText, dateText, text) {
    return `${userText} - \`${dateText}\` ${text}`
}

function lastMessageFormat(userText, chats) {
    return `${userText}さんが今日の勤務報告を送信しました。\n\n ${chats.join('\n')}`
}

function getUserText() {
    // console.log('getUserText')
    let userElem = document.getElementsByClassName("attendance-header-user-name")[0];
    userElem = userElem||document.getElementsByClassName("attendance-mobile-header-user-name")[0];
    // console.log(userElem);

    let userName = '';
    if (userElem && userElem.hasChildNodes()) {
        if (userElem.childElementCount == 1) {
            userName = userElem.firstElementChild.innerText;
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
    mfckExtUser = re.exec(userName)[1];
    mfckExtUser = mfckExtUser.replaceAll(/[ 　]/g, ' ');
    // console.log(user);
    return mfckExtUser;
}
function getDateText() {
    // console.log('getDateText')
    const statusContainer = document.getElementsByClassName('status-container')[0];
    const dateStr = statusContainer.firstElementChild.firstElementChild.firstElementChild.innerText.replaceAll(' ', '');
    const timeStr1 = statusContainer.lastElementChild.firstElementChild.firstElementChild.innerText;
    const timeStr2 = statusContainer.lastElementChild.firstElementChild.lastElementChild.innerText;
    const ret = `[${dateStr} ${timeStr1}:${timeStr2}]`;
    // console.log(ret);
    return ret;
}
function getAllDateText() {
    let chats = ['*日付*'];
    const historyListGroups = document.getElementsByClassName('history-list-group');
    let historyListGroup = historyListGroups[0];

    // historyListGroup とその子要素が存在するかをチェック
    if (historyListGroup && historyListGroup.firstElementChild && historyListGroup.firstElementChild.firstElementChild) {
        const dateStr = historyListGroup.firstElementChild.firstElementChild.innerText;
        chats.push(`${dateStr}`);
        chats.push('\n*勤怠*');

        const addHistory = (group) => {
            if (group && group.lastElementChild && group.lastElementChild.children) {
                Array.from(group.lastElementChild.children).reverse().forEach(element => {
                    if (element.firstElementChild && element.firstElementChild.firstElementChild && element.firstElementChild.lastElementChild) {
                        chats.push(`${element.firstElementChild.firstElementChild.innerText} ${element.firstElementChild.lastElementChild.innerText}`);
                    }
                });
            }
        };

        // 最初のhistoryListGroupから履歴を追加
        addHistory(historyListGroup);
        const beforeHistory = historyListGroups[1];
        // 最初のhistoryListGroupに履歴がない場合、次の候補をチェック
        if (chats.length === 3 && beforeHistory) {
            addHistory(beforeHistory);
            chats[1] = beforeHistory.firstElementChild.firstElementChild.innerText;
        }
    }

    return chats;
}
function getMessageText(text) {
    // console.log(text);
    return messageFormat(mfckExtUser||getUserText(), getDateText(), text)
}

function getLastMessageText() {
    return lastMessageFormat(mfckExtUser||getUserText(), getAllDateText())
}

/**
 * for `mypage.moneyforward.com`
 */
function getUserText2() {
    mfckExtUser = document.getElementById('root').firstElementChild.firstElementChild.lastElementChild.lastElementChild.firstElementChild.firstElementChild.innerText;
    mfckExtUser = mfckExtUser.replaceAll(/[ 　]/g, ' ');
    // console.log(ret);
    return mfckExtUser;
}
/**
 * for `mypage.moneyforward.com`
 */
function getDateText2() {
    let ret = '';
    document.getElementsByTagName('attendance-time-record-container')[0].shadowRoot.childNodes.forEach(function(element) {
        // console.log(element.tagName);
        if (element.tagName === 'SECTION') {
            const dateStr = element.getElementsByClassName('status-container')[0].firstElementChild.getElementsByTagName('section')[0].innerText.replaceAll(' ', '');
            const timeStr1 = element.getElementsByClassName('status-container')[0].lastElementChild.firstElementChild.firstElementChild.innerText;
            const timeStr2 = element.getElementsByClassName('status-container')[0].lastElementChild.firstElementChild.lastElementChild.innerText;
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
    return messageFormat(mfckExtUser||getUserText2(), getDateText2(), text)
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

    /* event */
    const chatPostEventName = 'click';
    /*
     * for `attendance.moneyforward.com`
     */
    if (location.hostname === 'attendance.moneyforward.com' && location.pathname === '/my_page') {
        [...document.getElementsByClassName('time-stamp-button')].forEach(function(element) {
            element.addEventListener(chatPostEventName, async function (e) {
                if (element.innerText === '退勤') {
                    await sleep(1000);
                    chatPostByClick(getLastMessageText());
                } else {
                    chatPostByClick(getMessageText(element.innerText));
                }
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
