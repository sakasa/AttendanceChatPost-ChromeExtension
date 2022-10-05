'use strict';

const webhookElem = document.getElementById('webhook-url');
const channelElem = document.getElementById('channel');
const usernameElem = document.getElementById('username');
chrome.storage.local.get(['chatConfig'], function(data) {
  // console.log(data);
  if (data.chatConfig) {
    webhookElem.innerText = data.chatConfig.webhook ?? "";
    channelElem.innerText = data.chatConfig.channel ?? "";
    usernameElem.innerText = data.chatConfig.username ?? "";
  }
});
// console.log(webhookElem.innerText, channelElem.innerText, usernameElem.innerText);
