var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    async = require('async');

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method
    }
}));

String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};


//build the REST operations at the base for users
//need to add parsing for phonenumbers


var updateUsers = function(update_arr, id) {
    mongoose.model('User').collection.update(
        {'_id': {'$in': update_arr}},
        {$push: {'meetings': id}}, { multi: true }, function (err, user) {
            if (err) {
                console.log(err);
            }
        }
    );
};


//GET meetings
router.route('/:id')
    .get(function (req, res, next) {
        console.log(req.params.id);
        if (req.params.id) {
            mongoose.model('Meeting').find({'_id': req.params.id.toObjectId()}).populate('attendees', 'name').exec(function (err, meeting) {
                if (err) {
                    console.error(err);
                    res.status(500).send("There was a problem getting the information to the database.");
                } else {
                    res.format({
                        json: function () {
                            res.json(meeting[0]);
                        }
                    });
                }
            });
        } else {
            mongoose.model('Meeting').find(function (err, meetings) {
                if (err) return next(err);
                res.json(meetings);
            });
        }
    });
//POST a new meeting
router.route('/')
    .post(function (req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var meetingLocation = req.body.meetingLocation;
        var selectedContacts = req.body.newContacts || [];
        var deletedContacts = req.body.deletedContacts || [];

        if (meetingLocation._id == null || meetingLocation.body._id == 'undefined') {
            console.log("in save");
            var ownerId = meetingLocation.ownerId;
            var phoneNumber = meetingLocation.phoneNumber;
            var name = meetingLocation.name;
            var description = meetingLocation.description;
            var latitude = meetingLocation.latitude;
            var longitude = meetingLocation.longitude;
            var date = meetingLocation.date;
            var priv = meetingLocation.private;
            var attendees = meetingLocation.attendees;

            var userIds = [];
            var numbers = [];
            var existingUsers = [];
            var totalUsers = [];

            for (var i = 0; i < selectedContacts.length; i++) {
                numbers.push(selectedContacts[i].phoneNumber.replace(/\D+/g, "").replace(/^[01]+/, ""));
            }

            console.log(numbers);
            mongoose.model('User').find({'phoneNumber': {'$in': numbers}}, function (err, users) {
                if (err) {
                    console.error(err);
                    res.status(500).send("There was a problem getting the information to the database.");
                } else {
                    console.log(users);
                    for (var i = 0; i < users.length; i++) {
                        userIds.push(users[i]._id);
                        existingUsers.push(users[i].phoneNumber);
                    }
                    totalUsers = totalUsers.concat(users);
                    var newUsers = [];

                    for (var i = 0; i < numbers.length; i++) {
                        if (existingUsers.indexOf(numbers[i]) < 0) {
                            var newUser = {};
                            newUser.name = selectedContacts[i].name; //should be replaced with phoneNumber?
                            newUser.phoneNumber = selectedContacts[i].phoneNumber;
                            newUser.meetings = [];
                            newUsers.push(newUser);
                        }
                    }
                    if (newUsers.length > 0) {
                        mongoose.model('User').collection.insert(newUsers, function (err, users) {
                            if (err) {
                                res.status(500).send("There was a problem adding the information to the database.");
                            } else {
                                userIds = userIds.concat(users.insertedIds);
                                totalUsers = totalUsers.concat(users.ops);
                                mongoose.model('Meeting').collection.insert([{
                                    ownerId: ownerId.toObjectId(),
                                    phoneNumber: phoneNumber,
                                    name: name,
                                    description: description,
                                    latitude: latitude,
                                    longitude: longitude,
                                    private: priv,
                                    date: date,
                                    attendees: userIds
                                }], function (err, meeting) {
                                    if (err) {
                                        res.status(500).send("There was a problem adding the information to the database.");
                                    } else {
                                        meeting.ops[0].attendees = totalUsers;
                                        meeting.ops[0].action = 'CREATE';
                                        res.format({
                                            json: function () {
                                                res.json(meeting.ops[0]);
                                            }
                                        });

                                        userIds.push(ownerId.toObjectId());
                                        updateUsers(userIds, meeting.ops[0]._id);

                                        /*mongoose.model('User').collection.update(
                                         {'_id': ownerId.toObjectId()},
                                         {$push: {'meetings': meeting.ops[0]._id}}, function (err, user) {
                                         if (err) {
                                         console.log(err);
                                         }
                                         }
                                         );*/
                                    }
                                }, function (err) {
                                    console.log(err);
                                });
                            }
                        }, function (err) {
                            console.log(err);
                        });
                    } else {
                        mongoose.model('Meeting').collection.insert([{
                            ownerId: ownerId.toObjectId(),
                            phoneNumber: phoneNumber,
                            name: name,
                            description: description,
                            latitude: latitude,
                            longitude: longitude,
                            private: priv,
                            date: date,
                            attendees: userIds
                        }], function (err, meeting) {
                            if (err) {
                                res.status(500).send("There was a problem adding the information to the database.");
                            } else {
                                meeting.ops[0].attendees = totalUsers;
                                meeting.ops[0].action = "CREATE";
                                res.format({
                                    json: function () {
                                        res.json(meeting.ops[0]);
                                    }
                                });

                                userIds.push(ownerId.toObjectId());
                                updateUsers(userIds, meeting.ops[0]._id);

                                /*  mongoose.model('User').collection.update(
                                 {'_id': ownerId.toObjectId()},
                                 {$push: {'meetings': meeting.ops[0]._id}}, function (err, user) {
                                 if (err) {
                                 console.log(err);
                                 }
                                 }
                                 );*/
                            }
                        }, function (err) {
                            console.log(err);
                        });
                    }
                }
            });
        }
    });

router.route('/')
    .put(function(req, res){

        console.log("updating in put");
        // Convert the Model instance to a simple object using Model's 'toObject' function
        // to prevent weirdness like infinite looping...
        var meetingLocation = req.body.meetingLocation;
        var selectedContacts = req.body.newContacts || [];
        var deletedContacts = req.body.deletedContacts || [];
        //var upsertData = meeting.toObject();
        // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
        var meetingId = meetingLocation._id;
        if (meetingLocation._id) delete meetingLocation._id;
        console.log(meetingLocation);

        mongoose.model('Meeting').collection.update({_id: meetingId.toObjectId()}, meetingLocation, function (err, location) {
            if (err) {
                console.log(err);
                res.status(500).send("There was a problem updating the information to the database.");
            } else {
                //Meeting updated
                console.log('UPDATE meeting location: ' + location);
                meetingLocation._id = meetingId;
                meetingLocation.action = 'UPDATE';
                res.format({
                    //JSON response will show the newly created blob
                    json: function () {
                        res.json(meetingLocation);
                    }
                });
            }
        });
    });

module.exports = router;
