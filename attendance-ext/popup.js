'use strict';

const webhookElem = document.getElementById('webhook-url');
chrome.storage.local.get(['webhook'], function(data) {
  webhookElem.innerText = data.webhook ?? "";
});

const channelElem = document.getElementById('channel');
chrome.storage.local.get(['channel'], function(data) {
  channelElem.innerText = data.channel ?? "";
});

const usernameElem = document.getElementById('username');
chrome.storage.local.get(['username'], function(data) {
  usernameElem.innerText = data.username ?? "";
});
