var gri = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var gra = function (min, max) {
    return Math.random() * (max - min) + min;
}

const express = require('express')
const request = require('request')
const keys = require('./keys.json')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

const getImage = function (term, cb) {
    const options = {
        url: `https://api.cognitive.microsoft.com/bing/v7.0/images/search`,
        headers: {
          'Ocp-Apim-Subscription-Key': keys.azure1
        },
        qs: {
            q: term + ' painting'
        }
      };
    request(options, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        let data = JSON.parse(body)
        console.log(data.value[0])
        cb(data.value[0])
    });
}

io.on('connection', function (socket) {
    console.log('A user connected');
    socket.on('word', (word, fn) => {
        console.log('Word: ' + word)
        getImage(word, function(imageData){
            socket.emit('image', imageData)
        })
    });
});
