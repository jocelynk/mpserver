var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    status: String
});

mongoose.model('User', userSchema);

var meetingSchema = new mongoose.Schema({
    phoneNumber: String,
    name: String,
    description: String,
    latitude: Number,
    longitude: Number,
    date: Date,
    attendees: Array
});
mongoose.model('Meeting', meetingSchema);

