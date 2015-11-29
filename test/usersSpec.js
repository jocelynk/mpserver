var mongoose = require("mongoose");
var models = require("../models/models");
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var users = require('../routes/users')

//tell Mongoose to use a different DB - created on the fly


describe('Routing', function() {
    var url = 'http://someurl.com';
    // within before() you can run all the operations that are needed to setup your tests. In this case
    // I want to create a connection with the database, and when I'm done, I call done().
    before(function(done) {
        // In our tests we use the test db
        mongoose.connect('mongodb://localhost/test_db');
        done();
    });
    describe('Account', function() {
        it('should save new user', function(done) {
            var user = {
                phoneNumber : '1234567890',
                name : 'Alice',
                meetings: []
            };
            // once we have specified the info we want to send to the server via POST verb,
            // we need to actually perform the action on the resource, in this case we want to 
            // POST on /api/profiles and we want to send some info
            // We do this using the request object, requiring supertest!
            request('http://localhost:5000')
                .post('/user')
                .send(user)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // this is should.js syntax, very clear
                    res.body.insertedCount.should.equal(1);
                    res.body.ops[0].phoneNumber.should.equal(user.phoneNumber);
                    res.body.ops[0].name.should.equal(user.name);
                    res.body.ops[0]._id.should.not.equal(null);
                    done();
                });
        });
        it('should get user', function(done){
            request('http://localhost:5000')
                .get('/user/1234567890')
                //.send(body)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function(err,res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body.should.have.property('_id');
                    res.body.phoneNumber.should.equal('1234567890');
                    res.body.name.should.equal('Alice');
                    done();
                });
        });
    });
});