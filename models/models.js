var mongoose = require('mongoose');

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
mongoose.model('MeetingLocation', meetingLocationSchema);

var userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    meetingLocations: [ {type : mongoose.Schema.ObjectId, ref : 'MeetingLocation'} ]
});

mongoose.model('User', userSchema);

var userMeetingLocationsSchema = new mongoose.Schema({
    meetingLocationId: mongoose.Schema.ObjectId,
    userId: mongoose.Schema.ObjectId
});

mongoose.model('UserMeetingLocation', userMeetingLocationsSchema);