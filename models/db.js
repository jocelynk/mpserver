var mongoose = require('mongoose');

//database
mongoose.connect('mongodb://localhost/mp', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

