var app = require('http').createServer(handler)
var io = require('socket.io')(app);

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
