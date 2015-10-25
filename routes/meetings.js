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
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
//need to add parsing for phonenumbers

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
            var private = req.body.private;
            var attendees = req.body.attendees;

            var total = 0;
            var userIds = [];

            var numbers = [];
            var inDB = [];

            for(var i = 0; i < attendees.length; i++) {
                numbers.push(new RegExp(attendees[i].phoneNumber, 'i'));
            }

            mongoose.model('User').find({'phoneNumber' : {'$in': numbers}}, function (err, users) {
                console.log(users);
                if (err) {
                    console.error(err);
                    res.status(500).send("There was a problem getting the information to the database.");
                } else {
                    for(var i = 0; i < users.length; i++) {
                        userIds.push(users[i]._id);
                        inDB.push(users[i].phoneNumber);
                    }

                    mongoose.model('Meeting').collection.insert([{
                        ownerId: ownerId.toObjectId(),
                        phoneNumber: phoneNumber,
                        name: name,
                        description: description,
                        latitude: latitude,
                        longitude: longitude,
                        private: private,
                        date: date,
                        attendees: userIds
                    }], function (err, meeting) {
                        if (err) {
                            res.status(500).send("There was a problem adding the information to the database.");
                        } else {
                            mongoose.model('User').collection.update(
                                {'_id': ownerId.toObjectId()},
                                {$push: {'meetings': meeting.ops[0]._id}}, function (err, user) {
                                    if (err) {
                                        console.log(err);
                                    }
                                }
                            );
                            meeting.ops[0].attendees = attendees;
                            console.log(meeting.ops[0]);
                            res.format({
                                json: function () {
                                    res.json(meeting.ops[0]);
                                }
                            });
                        }
                    }, function (err) {
                        console.log(err);
                    });

                    var ids = [];
                    var total = 0;
                    for(var i = 0; i < numbers.length; i++) {
                        if(inDB.indexOf(numbers[i]) < 0) {
                            mongoose.model('User').collection.insert([{
                                phoneNumber : numbers[i],
                                name : numbers[i],
                                meetings: []
                            }], function (err, user) {
                                if (err) {
                                    res.status(500).send("There was a problem adding the information to the database.");
                                } else {
                                    ids.push(user.ops[0]._id);
                                    total++;
                                    if(total == numbers.length) {

                                    }
                                }
                            })
                        } else {
                            total++;
                        }
                        numbers.push(new RegExp(attendees[i].phoneNumber, 'i'));
                    }

                }
            });









            /*async.each(attendees,
                function (person, callback) {
                    mongoose.model('User').findOne({'phoneNumber' : new RegExp(person.phoneNumber, 'i')}, function (err, user) {
                        console.log('Found Meeting User');
                        console.log(user);
                        if (err) {
                            console.error(err);
                            res.status(500).send("There was a problem getting the information to the database.");
                        } else {
                            if (user !== null) {
                                console.log('user found');
                                console.log(user);
                                users.push(user);
                                userIds.push(user._id);
                                total++;
                                callback(null);
                            } else {
                                console.log(person);
                                console.log('begin insert');
                                callback(person);
                            }

                        }
                    });

                },
                function (person) {
                    console.log('in callback method');
                    console.log(person);
                    if(person) {
                        mongoose.model('User').collection.insert([{
                            name: person.name,
                            phoneNumber: person.phoneNumber
                        }], function (err, user) {
                            if (err) {
                                res.status(500).send("There was a problem adding the information to the database.");
                            } else {
                                console.log("new user inserted");
                                users.push(user.ops[0]);
                                userIds.push(user.ops[0]._id);
                            }
                            total++;
                            console.log("total: " + total);
                          /!*  if(total == attendees.length) {
                                mongoose.model('Meeting').collection.insert([{
                                    ownerId: ownerId.toObjectId(),
                                    phoneNumber: phoneNumber,
                                    name: name,
                                    description: description,
                                    latitude: latitude,
                                    longitude: longitude,
                                    private: private,
                                    date: date,
                                    attendees: attendees
                                }], function (err, meeting) {
                                    if (err) {
                                        res.status(500).send("There was a problem adding the information to the database.");
                                    } else {
                                        userIds.push(ownerId.toObjectId());
                                        console.log(userIds);
                                        mongoose.model('User').collection.update(
                                            {'_id': {'$in': userIds}},
                                            {$push: {'meetings': meeting.ops[0]._id}}, function (err, user) {
                                                console.log("user updated");
                                                if (err) {
                                                    console.log(err);
                                                }
                                            }
                                        );
                                        meeting.attendees = users;
                                        res.format({
                                            json: function () {
                                                console.log(meeting);
                                                res.json(meeting.ops[0]);
                                            }
                                        });
                                    }
                                }, function (err) {
                                    console.log(err);
                                })
                            }*!/

                        }, function (err) {
                            console.log("error in inserting new user");
                            console.log(err);
                        })
                    } else {
                        if(total == attendees.length) {
                            console.log('no user added');
                            mongoose.model('Meeting').collection.insert([{
                                ownerId: ownerId.toObjectId(),
                                phoneNumber: phoneNumber,
                                name: name,
                                description: description,
                                latitude: latitude,
                                longitude: longitude,
                                private: private,
                                date: date,
                                attendees: attendees
                            }], function (err, meeting) {
                                if (err) {
                                    res.status(500).send("There was a problem adding the information to the database.");
                                } else {
                                    userIds.push(ownerId.toObjectId());
                                    console.log(userIds);
                                    mongoose.model('User').collection.update(
                                        {'_id': {'$in': userIds}},
                                        {$push: {'meetings': meeting.ops[0]._id}}, function (err, user) {
                                            console.log("user updated");
                                            if (err) {
                                                console.log(err);
                                            }
                                        }
                                    );
                                    meeting.attendees = users;
                                    res.format({
                                        json: function () {
                                            console.log(meeting);
                                            res.json(meeting.ops[0]);
                                        }
                                    });
                                }
                            }, function (err) {
                                console.log(err);
                            })
                        }
                    }*/


               // }
           // );

           /* mongoose.model('User').findOne({'phoneNumber': attendees[0].phoneNumber},
                function (err, user) {
                    console.log('found new user');
                    console.log(err);
                    if (err) {
                        console.log(err);
                        res.status(500).send("There was a problem adding the information to the database.");
                    } else {
                        console.log('-------------');
                        console.log(user);
                        console.log('-------------');

                        if (user !== null && user !== 'undefined' && user.length > 0) {
                            users.push(user[0]);
                            userIds.push(user[0]._id);
                            total++;
                        } else {

                            total++;
                            mongoose.model('User').collection.insert([{
                                name: attendees[i].name,
                                phoneNumber: attendees[i].phoneNumber
                            }], function (err, user) {
                                if (err) {
                                    res.status(500).send("There was a problem adding the information to the database.");
                                } else {
                                    console.log("new user inserted");
                                    users.push(user.ops[0]);
                                    userIds.push(user.ops[0]._id);
                                }
                            }, function (err) {
                                console.log("error in inserting new user");
                                console.log(err);
                            })

                        }
                    }

                }, function (err) {
                    console.log("error in finding user");
                    console.log(err);

                });*/
         /*   async.each(attendees,
                function (person, callback) {
                    console.log(person);
                    console.log(person.phoneNumber);
                    console.log(mongoose.model('User').findOne);

                },
                function (err) {
                    console.log('error in async');
                    console.log(err);
                }
            );*/

            if (total == attendees.length) {

            }
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
