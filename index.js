const { ev, create, } = require('@open-wa/wa-automate');
const express = require("express");
const { body, validationResult } = require('express-validator');
const { phoneNumberFormatter } = require('./function/formater');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
app.use(express.json({ limit: '200mb' }))
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
})

function start(client) {
    //api send message
    app.post('/send-message', [
        body('number').notEmpty(),
        body('message').notEmpty(),
    ], async (req, res) => {
        const errors = validationResult(req).formatWith(({
            msg
        }) => {
            return msg;
        });

        if (!errors.isEmpty()) {
            return res.status(422).json({
                status: false,
                message: errors.mapped()
            });
        }

        const number = phoneNumberFormatter(req.body.number);
        const message = req.body.message;

        const isRegisteredNumber = await client.checkNumberStatus(number);

        if (!isRegisteredNumber) {
            return res.status(422).json({
                status: false,
                message: 'The number is not registered'
            });
        }

        await client.sendText(number, message).then(response => {
            res.status(200).json({
                status: true,
                response: 'message sent successfully',
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: false,
                response: 'failed to sent message'
            });
        });
    });

    //api send document
    app.post('/send-media', async (req, res) => {
        const getLastItem = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)

        const number = phoneNumberFormatter(req.body.number);
        const caption = req.body.caption;
        const fileUrl = req.body.file;

        const fileName = getLastItem(fileUrl);
        await client.sendFileFromUrl(number, fileUrl, fileName, caption).then(response => {
            res.status(200).json({
                status: true,
                response: 'document sent successfully'
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                response: 'failed to sent document'
            });
        });
    });

    client.onMessage(async message => {
        if (message.body === 'hi') {
            await client.sendText(message.from, '👋 Hello!');
        } else if (message.body == 'p') {
            await client.sendText(message.from, '?');
        }
    });
}

io.on('connection', function (socket) {
    socket.emit('message', 'connecting....');

    ev.on('qr.**', async qrcode => {
        socket.emit('qr', qrcode);
        socket.emit('message', 'QR Code received, scan please!');
    });

    ev.on('STARTUP.**', async (data, sessionId) => {
        if (data === 'SUCCESS') {
            socket.emit('ready', 'Whatsapp is ready!');
            socket.emit('message', 'Whatsapp is ready!');
        }
    })
});

server.listen(PORT, function () {
    console.log(`\n• Listening on port ${PORT}!`);
});

create({
    sessionId: 'bot-notif',
    useChrome: true,
    // licenseKey : 'CB504B49-44F240FA-BB53A828-6F2C467B', 
}).then(client => start(client));