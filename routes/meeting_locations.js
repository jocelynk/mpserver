var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
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

router.get('/', function(req, res, next) {
    if(req.query.locationIds) {
        mongoose.model('MeetingLocation').find({'_id' : { $in: req.query.locationIds}}, function (err, userLocations) {
            if (err) {
                console.error(err);
                res.status(500).send("There was a problem getting the information to the database.");
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //JSON response will show all blobs in JSON format
                    json: function(){
                        res.json(userLocations);
                    }
                });
            }
        });
    } else {
        res.json([]);
    }
});

//insert
router.post('/', function(req, res, next) {
    console.log("in Meeting Location Post");
    console.log(req.body.location);
    var location = req.body.location;
    if(location) {
        if(!location._id) {
            console.log("Inserting new Meeting Location");
            mongoose.model('MeetingLocation').collection.insert([{
                name : location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                startDate: location.startDate,
                endDate: null,
                active: true,
                description: location.description,
                private: location.private,
                ownerId: location.ownerId
            }], function (err, loc) {
                if (err) {
                    console.log(err);
                    res.status(500).send("There was a problem adding the information to the database.");
                } else {
                    console.log("Meeting Location Saved, now saving to User");
                    //save to User creating the meeting point
                    console.log(location.ownerId);
                    console.log(loc.ops[0]);
                    mongoose.model('User').collection.update({_id: location.ownerId.toObjectId()}, { $push: {"meetingLocations": loc.ops[0]} }, function (err, user) {
                        console.log("Updated User");
                        console.log(user);
                        if (err) {
                            console.log(err);
                            res.status(500).send("There was a problem updating the information to the database.");
                        } else {
                           /* mongoose.model('UserMeetingLocation').collection.insert([{
                                    name: location.name,
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    startDate: location.startDate,
                                    endDate: null,
                                    active: true,
                                    description: location.description,
                                    private: location.private,
                                    ownerId: location.ownerId
                                }], function (err, user) {
                                    console.log("Updated User");
                                    console.log(user);
                                    if (err) {
                                    console.log(err);
                                    res.status(500).send("There was a problem updating the information to the database.");
                                } else {
                                    console.log("Successfully saved to user");
                                    res.format({
                                        //JSON response will show the newly created blob
                                        json: function(){
                                            res.json(location);
                                        }
                                    });
                                }
                            });*/
                            console.log("Successfully saved to user");
                            res.format({
                                //JSON response will show the newly created blob
                                json: function(){
                                    res.json(location);
                                }
                            });
                        }
                    });
                }
            });
        } else if(location.deletedInd.trim().toUpperCase() === 'Y') {
            mongoose.model('MeetingLocations').collection.find({ _id: location._id }).remove(function(err) {
                if(err) {
                    console.log(err);
                    res.status(500).send("There was a problem deleting the information to the database")
                }

                mongoose.model('User').findByIdAndUpdate(
                    location.ownerId,
                    { $pull: { 'meetingLocations': {  _id: location._id } } },function(err,model){
                        if(err){
                            console.log(err);
                            return res.send(err);
                        }
                        return res.json(model);
                    });
            });

        } else {
            // Convert the Model instance to a simple object using Model's 'toObject' function
            // to prevent weirdness like infinite looping...
            var upsertData = location.toObject();
            // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
            var meetingId = upsertData._id;
            delete upsertData._id;
            delete upsertData.deletedInd;

            mongoose.model('MeetingLocations').collection.update({ _id: meetingId }, upsertData, function (err, location) {
                if (err) {
                    console.log(err);
                    res.status(500).send("There was a problem updating the information to the database.");
                } else {
                    //User has been created
                    console.log('POST creating new location: ' + location);
                    console.log(location);
                    res.format({
                        //JSON response will show the newly created blob
                        json: function(){
                            res.json(location);
                        }
                    });
                }
            });
        }

    } else {
        res.status(500).send("Object is null. Cannot update");
    }
});

module.exports = router;
