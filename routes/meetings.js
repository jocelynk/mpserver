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
        mongoose.model('Meeting').find({'phoneNumber' : new RegExp(req.params.phoneNumber, 'i')}, function (err, user) {
          if (err) {
            console.error(err);
            res.status(500).send("There was a problem getting the information to the database.");
          } else {
            res.format({
              json: function(){
                res.json(user);
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
//POST a new user
router.route('/')
    .post(function(req, res) {
      console.log(req.body)
      // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
      var phoneNumber = req.body.phoneNumber;
      var name = req.body.name;
      var description = req.body.description;
      var latitude = req.body.latitude;
      var longitude = req.body.longitude;
      var date = req.body.date;
      var attendees = req.body.attendees;
      mongoose.model('Meeting').collection.insert([{
        phoneNumber : phoneNumber,
        name : name,
        description : description,
        latitude : latitude,
        longitude : longitude,
        date : date,
        attendees : attendees
      }], function (err, meeting) {
        if (err) {
          res.status(500).send("There was a problem adding the information to the database.");
        } else {
          res.format({
            json: function(){
              res.json(meeting);
            }
          });
        }
      })
    });

module.exports = router;
