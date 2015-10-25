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
router.route('/:phoneNumber')
    .get(function (req, res, next) {
        if (req.params.phoneNumber) {
            mongoose.model('Meeting').find({'phoneNumber': new RegExp(req.params.phoneNumber, 'i')}, function (err, meeting) {
                if (err) {
                    console.error(err);
                    res.status(500).send("There was a problem getting the information to the database.");
                } else {
                    res.format({
                        json: function () {
                            res.json(meeting);
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
        if (req.body._id == null || req.body._id == 'undefined' || req.body._id.length < 1) {

            var ownerId = req.body.ownerId;
            var phoneNumber = req.body.phoneNumber;
            var name = req.body.name;
            var description = req.body.description;
            var latitude = req.body.latitude;
            var longitude = req.body.longitude;
            var date = req.body.date;
            var priv = req.body.private;
            var attendees = req.body.attendees;

            var userIds = [];
            var numbers = [];
            var existingUsers = [];
            var totalUsers = [];

            for (var i = 0; i < attendees.length; i++) {
                numbers.push(attendees[i].phoneNumber.replace(/\D+/g, "").replace(/^[01]+/, ""));
            }

            mongoose.model('User').find({'phoneNumber': {'$in': numbers}}, function (err, users) {
                if (err) {
                    console.error(err);
                    res.status(500).send("There was a problem getting the information to the database.");
                } else {
                    for (var i = 0; i < users.length; i++) {
                        userIds.push(users[i]._id);
                        existingUsers.push(users[i].phoneNumber);
                    }
                    totalUsers = users;
                    var newUsers = [];

                    for (var i = 0; i < numbers.length; i++) {
                        if (existingUsers.indexOf(numbers[i]) < 0) {
                            var newUser = {};
                            newUser.name = attendees[i].name; //should be replaced with phoneNumber?
                            newUser.phoneNumber = attendees[i].phoneNumber;
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
        } else {
            console.log("updating");
            // Convert the Model instance to a simple object using Model's 'toObject' function
            // to prevent weirdness like infinite looping...
            var meeting = req.body;
            //var upsertData = meeting.toObject();
            // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
            var meetingId = meeting._id;
            if (meeting._id) delete meeting._id;
            /*if(meeting.deletedInd) delete meeting.deletedInd;
             if(meeting.attendees) meeting.attendees.split(',');*/
            console.log(meeting);

            mongoose.model('Meeting').collection.update({_id: meetingId.toObjectId()}, meeting, function (err, location) {
                if (err) {
                    console.log(err);
                    res.status(500).send("There was a problem updating the information to the database.");
                } else {
                    //Meeting updated
                    console.log('UPDATE meeting location: ' + location);
                    meeting._id = meetingId;
                    res.format({
                        //JSON response will show the newly created blob
                        json: function () {
                            res.json(meeting);
                        }
                    });
                }
            });
        }
    });

module.exports = router;
