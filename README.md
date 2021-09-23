# WhatsApp Api

create using package [wa-automate-nodejs](https://github.com/open-wa/wa-automate-nodejs)

## Installation

```bash
$ git clone https://github.com/razisek/whatsapp-api
$ cd whatsapp-api
$ npm start
```

## List Method
Use http POST
1. Send Message
```
[URL]/send-message
```
&ensp;Params : 
- nomor (required)
- message (reduired)

2. Send Media\
support send media img,doc and audio
```
[URL]/send-media
```
&ensp;Params : 
- nomor (required)
- file (required)
- caption (optional)

## Deploy Heroku
* Add Buildpack
1. heroku/nodejs
2. https://github.com/heroku/heroku-buildpack-google-chrome.git

* Push Project
