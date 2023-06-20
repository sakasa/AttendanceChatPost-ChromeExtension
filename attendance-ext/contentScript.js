const datetime = function(){
    const statusContainer = document.getElementsByClassName('status-container')[0];
    const dateStr = statusContainer.firstChild.firstChild.firstChild.innerText;
    const timeStr = statusContainer.lastChild.firstChild.firstChild.innerText;
    return '[' +  dateStr + ' ' + timeStr + ']';
};
// console.log(datetime());

let userElem = document.getElementsByClassName("attendance-header-user-name")[0];
if (userElem && userElem.hasChildNodes()) {
    userElem = userElem.firstChild;
} else {
    userElem = document.getElementsByClassName("attendance-mobile-header-user-name")[0];
}
const re = /^(.+?)さん$/
const user = re.exec(userElem.innerText)[1];
// console.log(user);

let chatConf = {};
const load = function(){
    chrome.storage.local.get(['chatConfig'], function(data) {
        if (data.chatConfig) {
            chatConf.webhook = data.chatConfig.webhook;
            chatConf.channel = data.chatConfig.channel;
            chatConf.username = data.chatConfig.username;
        }
    });
};
load();
// console.log(chatConf);

function dataJson(text){
    // console.log(text);
    let ret = {
        "text": user + " - " + datetime() + " " + text,
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
    load();
});
