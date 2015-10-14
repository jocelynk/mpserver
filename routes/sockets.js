/*
var app = require('http').createServer(handler);
var io = require('socket.io')(app);

var port = process.env.PORT || 5000;
app.listen(8888);


function handler (req, res) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end('Sockets connected');
}

io.on('connection', function (socket) {
    socket.on('send_location', function (data) {
        io.sockets.emit('get_location', data);
    });
});
*/


/*

var app = express();
var serv = require('http').createServer(app);

var socket = require('socket.io');


var io = socket.listen(serv);

serv.listen(80);


function handler (req, res) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end('Sockets connected');
}

io.on('connection', function (socket) {
    socket.on('send_location', function (data) {
        io.sockets.emit('get_location', data);
    });
});
*/

/*
var io = require('socket.io');

function handler(socket) {
    socket.on('send_location', function (data) {
        io.sockets.emit('get_location', data);
    });
}
*/

module.exports = {

    start: function(socketServer) {
        socketServer.on('connection', function(socket) {
            socket.on('send_location', function (data) {
                socketServer.sockets.emit('get_location', data);
            });
        });
    }

};

