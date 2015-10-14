var io = require('socket.io');

function handler(socket) {
    socket.on('send_location', function (data) {
        console.log(data);
        socket.emit('get_location', data);
    });
}

module.exports = {

    start: function(fileserver) {
        io.listen(fileserver).on('connection', handler);
    }

};

