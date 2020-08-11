# AttendanceChatPost-ChromeExtension
Chrome extension for attendance chat post with `https://biz.moneyforward.com/attendance`.


## Overview
[マネーフォワードクラウド勤怠](https://biz.moneyforward.com/attendance) のホーム画面にある出勤・退勤等の打刻のアクションでチャットツールに投稿を行うGoogleChrome拡張機能です。

以下の環境で確認しています。
- [Google Chrome] バージョン: 84.0.4147.105


## Install
Chromeウェブストアに公開していないため、手動でインストールを行ってください。

1. 任意のディレクトリにソースコードをcloneまたはzipダウンロード
2. Chrome拡張機能の **デベロッパーモード** を有効にして **パッケージ化されていない拡張機能の読み込み** で **[attendance-ext](https://github.com/sakasa/AttendanceChatPost-ChromeExtension/tree/master/attendance-ext)** フォルダを指定

参考
- https://developer.chrome.com/extensions/getstarted
- https://toranoana-lab.hatenablog.com/entry/2020/04/23/174421


## 使い方
- Chrome拡張機能のオプションでチャットツールの設定を行ってください。
- 事前にチャットツール側でIncoming Webhookの設定を行いWebhookのURLを発行しておく必要があります。

  チャットツールは [Slack](https://slack.com) と [Mattermost](https://mattermost.com/) で確認を行っています。
  - [Slack Incoming Webhook](https://slack.com/intl/ja-jp/help/articles/115005265063-Slack-%E3%81%A7%E3%81%AE-Incoming-Webhook-%E3%81%AE%E5%88%A9%E7%94%A8)
  - [Mattermost Incoming Webhook](https://docs.mattermost.com/developer/webhooks-incoming.html)

- [マネーフォワードクラウド勤怠](https://biz.moneyforward.com/attendance) のホーム画面で打刻のアクション（クリック）を行うとチャットツールのチャンネルにPOSTされます。


## 動作するURLの設定
以下の箇所で指定しています。
- [background.js](https://github.com/sakasa/AttendanceChatPost-ChromeExtension/blob/master/attendance-ext/background.js) ・・・ Chrome拡張機能を動作させるURLの設定
```javascript
pageUrl: {
  hostEquals: 'attendance.moneyforward.com',
  pathEquals: '/my_page'
},
```

- [manifest.json](https://github.com/sakasa/AttendanceChatPost-ChromeExtension/blob/master/attendance-ext/manifest.json) ・・・ [contentScript.js](https://github.com/sakasa/AttendanceChatPost-ChromeExtension/blob/master/attendance-ext/contentScript.js) を動作させるURLの設定
```json
"content_scripts": [
  {
    "matches": ["https://attendance.moneyforward.com/my_page"],
    "js": ["contentScript.js"]
  }
],
```


## その他
Chrome拡張機能のオプションページとポップアップページのcssに [Bootstrap5](https://v5.getbootstrap.jp/docs/5.0/migration/) を使っています。
```html
<!-- Bootstrap CSS -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css" integrity="sha384-r4NyP46KrjDleawBgD5tp8Y7UzmLA05oM1iAEQ17CSuDqnUK2+k9luXQOfXJCJ4I" crossorigin="anonymous">
```
バージョンがAlphaなので突然画面が崩れたりするかもしれません。
