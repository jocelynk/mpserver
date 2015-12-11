var mongodb = require('mongodb');

exports.up = function (db, next) {
    db.createCollection('meetings');
    var meetings = db.collection('meetings');
    var users = db.collection('users');
    var user_one_id = '';
    var user_two_id = '';

    users.findOne({phoneNumber: '123456789'}, function (err, obj) {
            user_one_id = obj._id;
            users.findOne({phoneNumber: '987654321'}, function (err, obj) {
                    user_two_id = obj._id;
                    var meeting = {
                        ownerId: user_two_id,
                        name: "Apartment",
                        description: "Home",
                        private: false,
                        date: "2015-12-16T17:18:00.000Z",
                        phoneNumber: "123456789",
                        latitude: 50,
                        longitude: -50,
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