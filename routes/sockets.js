module.exports = {

    start: function(socketServer) {
        socketServer.on('connection', function(socket) {
            socket.on('send_location', function (data) {
                socketServer.sockets.emit('get_location', data);
            });
        });
    }

};

