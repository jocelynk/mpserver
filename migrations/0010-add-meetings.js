var mongodb = require('mongodb');

exports.up = function (db, next) {
    db.createCollection('meetings');
    var meetings = db.collection('meetings');
    var users = db.collection('users');
    var user_one_id = '';
    var user_two_id = '';

    users.findOne({phoneNumber: '9088927117'}, function (err, obj) {
            user_one_id = obj._id;
            users.findOne({phoneNumber: '9088927106'}, function (err, obj) {
                    user_two_id = obj._id;
                    var meeting = {
                        ownerId: user_two_id,
                        name: "JC Apartment",
                        description: "JC Home",
                        private: false,
                        date: "2015-12-16T17:18:00.000Z",
                        phoneNumber: "9088927117",
                        latitude: 40.7137589,
                        longitude: -74.0389566,
                        attendees: [user_two_id]
                    };

                    meetings.insert(meeting, function (err, meetingsInserted) {
                            console.log(meetingsInserted);
                            users.update(
                                {'_id': {'$in': [user_two_id, user_one_id]}},
                                {$push: {'meetings': [meetingsInserted.ops[0]._id]}}, {multi: true}, next
                            );
                        }
                    );
                }
            );
        }
    );

};

exports.down = function (db, next) {
    var meetings = db.collection('meetings');
    meetings.remove({}, next);
};