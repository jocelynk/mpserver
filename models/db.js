var mongoose = require('mongoose');

//database
mongoose.connect('mongodb://localhost/mp', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

//mongodb://heroku_p43wgxfq:6uobk9jdbtu7d067qqh09caubl@ds035014.mongolab.com:35014/heroku_p43wgxfq
