var mongodb = require('mongodb');


exports.up = function (db, next) {
    db.createCollection('users');

    var users = db.collection('users');

    var users_list = [
        {
            phoneNumber: "9088927117",
            name: "Jocelyn Kong",
            meetings: []
        },
        {
            phoneNumber: "9088927106",
            name: "Lilian Kong",
            meetings: []
        },
        {
            phoneNumber: "6504887374",
            name: "Halil Akin",
            meetings: []
        },
        {
            phoneNumber: "9147158049",
            name: "Richard Chu",
            meetings: []
        },
        {
            phoneNumber: "9086421304",
            name: "Elvin",
            meetings: []
        }];
    users.insert(users_list, next);
};

exports.down = function (db, next) {
    var users = db.collection('users');
    users.remove({}, next);
    //next();
};
