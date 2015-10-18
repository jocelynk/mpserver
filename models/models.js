var mongoose = require('mongoose');

/*

var meetingLocationSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    startDate: {type: Date, default: Date.now},
    endDate: Date,
    active: Boolean,
    description: String,
    private: Boolean,
    ownerId: [ {type : mongoose.Schema.ObjectId, ref : 'User'} ]
});
var MeetingLocation = mongoose.model('MeetingLocation', meetingLocationSchema);
*/

var userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    status: String,
    meetings: Array
});

var User = mongoose.model('User', userSchema);

var meetingSchema = new mongoose.Schema({
    phoneNumber: String,
    name: String,
    description: String,
    latitude: Number,
    longitude: Number,
    private: Boolean,
    date: Date,
    attendees: Array
});
mongoose.model('Meeting', meetingSchema);
