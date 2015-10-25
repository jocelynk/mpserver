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
    meetings: [ {type : mongoose.Schema.ObjectId, ref : 'Meeting'} ]
});

var User = mongoose.model('User', userSchema);

var meetingSchema = new mongoose.Schema({
    ownerId: {type : mongoose.Schema.ObjectId, ref : 'Meeting'},
    phoneNumber: String,
    name: String,
    description: String,
    latitude: Number,
    longitude: Number,
    private: Boolean,
    date: Date,
    attendees: [ {type : mongoose.Schema.ObjectId, ref : 'User'} ]
});
mongoose.model('Meeting', meetingSchema);
