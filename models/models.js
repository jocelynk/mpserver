var mongoose = require('mongoose');

var meetingLocationSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    active: Boolean,
    private: Boolean,
    ownerId: [ {type : mongoose.Schema.ObjectId, ref : 'User'} ]
});
mongoose.model('MeetingLocation', meetingLocationSchema);

var userSchema = new mongoose.Schema({
    name: String,
    phonenumber: String,
    meetinglocations    : [ {type : mongoose.Schema.ObjectId, ref : 'MeetingLocation'} ]
});
mongoose.model('User', userSchema);