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
loadChatConf();
// console.log(chatConf);

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
    const dateStr = statusContainer.firstChild.firstChild.firstChild.innerText;
    const timeStr = statusContainer.lastChild.firstChild.firstChild.innerText;
    const datetime = '[' +  dateStr + ' ' + timeStr + ']';
    // console.log(datetime);
    return datetime;
}

function dataJson(text){
    // console.log(text);
    let ret = {
        "text" : `${user||getUserText()} - ${getDateText()} ${text}`,
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

const timeStampButtons = document.getElementsByClassName('time-stamp-button');
for(let i=0;i<timeStampButtons.length; i++){
    const element = timeStampButtons[i];
    element.addEventListener('click', function(evt){
        const data = dataJson(element.innerText);
        // alert(data);
        postChat(data);
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        const storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
    loadChatConf();
});

// document.addEventListener('click', function(e) {
//     console.log(e);
// })
