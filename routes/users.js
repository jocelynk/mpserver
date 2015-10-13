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

//build the REST operations at the base for blobs
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
//need to add parsing for phonenumbers
router.route('/')
  //GET users
    .get(function(req, res, next) {
      if(req.query.phoneNumber) {
        mongoose.model('User').find({'phoneNumber' : new RegExp(req.query.phoneNumber, 'i')}, function (err, user) {
          if (err) {
            console.error(err);
            res.status(500).send("There was a problem getting the information to the database.");
          } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            res.format({
              //JSON response will show all blobs in JSON format
              json: function(){
                res.json(user);
              }
            });
          }
        });
      } else {
        mongoose.model('User').find(function (err, users) {
          if (err) return next(err);
          res.json(users);
        });
      }
    })
  //POST a new user
    .post(function(req, res) {
      // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
      var phoneNumber = req.body.phoneNumber;
      var name = req.body.name;
      //call the create function for our database
      console.log("post");
      console.log(req.body);
      console.log( mongoose.model('User'));
      mongoose.model('User').collection.insert([{
        phoneNumber : phoneNumber,
        name : name
      }], function (err, user) {
        console.log("callback in posting");
        if (err) {
          console.log(err);
          res.status(500).send("There was a problem adding the information to the database.");
        } else {
          //User has been created
          console.log('POST creating new user: ' + user);
          console.log(user);
          res.format({
            //JSON response will show the newly created blob
            json: function(){
              res.json(user);
            }
          });
        }
      })
    });

module.exports = router;
