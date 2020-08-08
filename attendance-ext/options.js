'use strict';

const webhookElem = document.getElementById('webhook-url');
chrome.storage.local.get(['webhook'], function(data) {
  webhookElem.value = data.webhook;
});

const channelElem = document.getElementById('channel');
chrome.storage.local.get(['channel'], function(data) {
  channelElem.value = data.channel;
});

const usernameElem = document.getElementById('username');
chrome.storage.local.get(['username'], function(data) {
  usernameElem.value = data.username;
});

const buttonClick = function(){
  const button = document.getElementById('config-set');
  button.addEventListener('click', function() {
    chrome.storage.local.set({webhook: webhookElem.value}, function() {
      console.log('webhook is ' + webhookElem.value);
    });
    chrome.storage.local.set({channel: channelElem.value}, function() {
      console.log('channel is ' + channelElem.value);
    });
    chrome.storage.local.set({username: usernameElem.value}, function() {
      console.log('username is ' + usernameElem.value);
    });
  });
};
buttonClick();
