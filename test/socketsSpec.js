var chai = require('chai'),
    mocha = require('mocha')
    //should = chai.should();

var io = require('socket.io-client');

var socketURL = "http://localhost:5000";
var options ={
    transports: ['websocket'],
    'force new connection': true
};

var coord1 = {'latitude': 0.12, 'longitude': -.15 };

var coord2 = {'latitude': 0.54332, 'longitude': -.1234 };

describe('sockets test', function() {
    it("should send and receive location", function (done) {
        var client1 = io.connect(socketURL, options);
        client1.on('connect', function(data){
            console.log("connecting 1");
            client1.emit('send_location', coord1);

            /* Since first client is connected, we connect
             the second client. */
            var client2 = io.connect(socketURL, options);
            client2.on('connect', function(data){
                client2.emit('send_location', coord2);
            });

            client1.on('get_location', function(data){
                console.log("getting location 1")
                data.latitude.should.equal(coord1.latitude);
                data.longitude.should.equal(coord1.longitude);
                client1.disconnect();
                done();
            });

        });
    });
});

