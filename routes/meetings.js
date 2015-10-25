var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method
    }
}));

String.prototype.toObjectId = function() {
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
        if(req.body._id == null || req.body._id == 'undefined' || req.body._id.length < 1) {

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
            var users = [];
            var userIds = [];
            for(var i = 0; i < attendees.length; i++) {
                mongoose.model('User').collection.findOne({'phoneNumber' : new RegExp(attendees[i].phoneNumber, 'i')},
                function(err, user) {
                    console.log(user);
                    if(err) {
                        console.log(err);
                        res.status(500).send("There was a problem adding the information to the database.");
                    } else {
                        if (user !== null && user !== 'undefined' && user.length > 0) {
                            users.push(user);
                            userIds.push(user._id);
                            total++;
                        } else {
                            mongoose.model('User').collection.insert([{
                                name: attendees[i].name,
                                phoneNumber: attendees[i].phoneNumber
                            }], function (err, user) {
                                if (err) {
                                    res.status(500).send("There was a problem adding the information to the database.");
                                } else {
                                    users.push(user.ops[0]);
                                    userIds.push(user.ops[0]._id);
                                }
                                total++;
                            }, function(err) {
                                console.log(err);
                            })

                        }
                    }

                }, function(err) {
                    console.log(err);

                });
            }

            if(total == attendees.length) {
                mongoose.model('Meeting').collection.insert([{
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
                        userIds.push(ownerId.toObjectId);
                        mongoose.model('User').collection.update(
                            { '_id': {'$in':userIds} },
                            { $push: { 'meetings': meeting.ops[0]._id } }
                        );
                        meeting.attendees = users;
                        res.format({
                            json: function () {
                                console.log(meeting);
                                res.json(meeting.ops[0]);
                            }
                        });
                    }
                }, function(err) {
                    console.log(err);
                })
            }




        } else {
            console.log("updating");
            // Convert the Model instance to a simple object using Model's 'toObject' function
            // to prevent weirdness like infinite looping...
            var meeting = req.body;
            //var upsertData = meeting.toObject();
            // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
            var meetingId = meeting._id;
            if(meeting._id) delete meeting._id;
            /*if(meeting.deletedInd) delete meeting.deletedInd;
            if(meeting.attendees) meeting.attendees.split(',');*/
            console.log(meeting);

            mongoose.model('Meeting').collection.update({ _id: meetingId.toObjectId() }, meeting, function (err, location) {
                if (err) {
                    console.log(err);
                    res.status(500).send("There was a problem updating the information to the database.");
                } else {
                    //Meeting updated
                    console.log('UPDATE meeting location: ' + location);
                    meeting._id = meetingId;
                    res.format({
                        //JSON response will show the newly created blob
                        json: function(){
                            res.json(meeting);
                        }
                    });
                }
            });
        }
    });

module.exports = router;
