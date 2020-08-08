const datetime = function(){
    const dateStr = document.getElementsByClassName('attendance-card-time-recorder-date')[0].innerText;
    const timeStr = document.getElementsByClassName('attendance-card-time-recorder-time')[0].innerText;
    return '[' +  dateStr + ' ' + timeStr + ']';
};
console.log(datetime());

const user = document.getElementsByClassName("attendance-header-user-name")[0].firstChild.innerText.split(" ")[0];
console.log(user);

let chatConf = {};
const load = function(){
    chrome.storage.local.get(['webhook'], function(data) {
        chatConf.webhook = data.webhook;
    });
    chrome.storage.local.get(['channel'], function(data) {
        chatConf.channel = data.channel;
    });
    chrome.storage.local.get(['username'], function(data) {
        chatConf.username = data.username;
    });
};
load();

function dataJson(text){
    console.log(text);
    let ret = {
        "text": user + " - " + datetime() + " " + text,
        "username": (chatConf.username || null) ?? "kintai-bot"
    };
    if(chatConf.channel) {
        ret.channel = chatConf.channel;
    }
    console.log(ret);
    return ret;
}

function postChat(data){
    console.log(data);
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

const timeStampButtons = document.getElementsByClassName('attendance-card-time-stamp-button');
for(let i=0;i<timeStampButtons.length; i++){
    const element = timeStampButtons[i];
    element.addEventListener('click', function(evt){
        let data = dataJson(element.innerText);
        postChat(data);
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
      let storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
    load();
});
