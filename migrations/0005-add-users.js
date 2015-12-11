var mongodb = require('mongodb');


exports.up = function (db, next) {
    db.createCollection('users');

    var users = db.collection('users');

    var users_list = [
        {
            phoneNumber: "123456789",
            name: "Test User One",
            meetings: []
        },
        {
            phoneNumber: "987654321",
            name: "Test User Two",
            meetings: []
        }];
    users.insert(users_list, next);
};

exports.down = function (db, next) {
    var users = db.collection('users');
    users.remove({}, next);
    //next();
};