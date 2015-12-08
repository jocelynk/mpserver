var mongoose = require("mongoose");
var models = require("../models/models");
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var meetings = require('../routes/meetings')

//tell Mongoose to use a different DB - created on the fly


describe('Routing', function() {
    var url = 'http://someurl.com';
    // within before() you can run all the operations that are needed to setup your tests. In this case
    // I want to create a connection with the database, and when I'm done, I call done().
    before(function(done) {
        // In our tests we use the test db
        var db = mongoose.createConnection('mongodb://localhost/test_db');
        done();
    });
    var meeting_id = null;
    describe('Meetings', function () {
        it('should save new meeting', function (done) {
            var meeting = {
                meetingLocation: {
                    _id: null,
                    ownerId: '562ea856fdd9aa941b1d5cb0',
                    phoneNumber: '1234567890',
                    name: 'Home',
                    description: 'I like napping at home.',
                    latitude: 0,
                    longitude: 0,
                    date: new Date(),
                    priv: 'Y',
                    attendees: []
                }
            };
            // once we have specified the info we want to send to the server via POST verb,
            // we need to actually perform the action on the resource, in this case we want to 
            // POST on /api/profiles and we want to send some info
            // We do this using the request object, requiring supertest!
            request('http://localhost:5000')
                .post('/meeting')
                .send(meeting)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    meeting_id = res.body._id;
                    res.body.name.should.equal('Home');
                    res.body.phoneNumber.should.equal('1234567890');
                    done();
                });
        });
        it('should get a meeting', function(done){
            request('http://localhost:5000')
                .get('/meeting/' + meeting_id)
                //.send(body)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function(err,res) {
                    if (err) {
                        throw err;
                    }
                    console.log(res.body);
                    // Should.js fluent syntax applied
                    res.body._id.should.equal(meeting_id);
                    res.body.ownerId.should.equal('562ea856fdd9aa941b1d5cb0');
                    res.body.phoneNumber.should.equal('1234567890');
                    res.body.name.should.equal('Home');
                    res.body.latitude.should.equal(0);
                    res.body.longitude.should.equal(0);
                    done();
                });
        });
    });
});