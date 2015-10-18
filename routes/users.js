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

//build the REST operations at the base for users
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
//need to add parsing for phonenumbers

//GET users
router.route('/:phoneNumber')
    .get(function(req, res, next) {
      if(req.params.phoneNumber) {
        mongoose.model('User').find({'phoneNumber' : new RegExp(req.params.phoneNumber, 'i')}, function (err, user) {
          if (err) {
            console.error(err);
            res.status(500).send("There was a problem getting the information to the database.");
          } else {
            if (user !== null && user !== 'undefined' && user.length > 0) {
              mongoose.model('Meeting').find({$or: [{'phoneNumber': new RegExp(req.params.phoneNumber, 'i')}, {'attendees': new RegExp(req.params.phoneNumber, 'i')}]}, function (err, meetings) {
                user[0]['meetings'] = meetings;
                res.format({
                  json: function () {
                    res.json(user);
                  }
                });
              });
            } else {
              res.format({
                json: function () {
                  res.json(user);
                }
              });
            }
          }
        });
      } else {
        mongoose.model('User').find(function (err, users) {
          if (err) return next(err);
          res.json(users);
        });
      }
    });
//POST a new user
router.route('/')
    .post(function(req, res) {
      // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
      var phoneNumber = req.body.phoneNumber;
      var name = req.body.name;
      var status = req.body.status;

      mongoose.model('User').collection.insert([{
        phoneNumber : phoneNumber,
        name : name,
        status : status
      }], function (err, user) {
        if (err) {
          res.status(500).send("There was a problem adding the information to the database.");
        } else {
          res.format({
            json: function(){
              res.json(user);
            }
          });
        }
      })
    });

module.exports = router;
