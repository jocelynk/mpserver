var express = require('express');
var router = express.Router();
var gm = require('googlemaps');
var GoogleMapsAPI = require('googlemaps/lib/index');



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


var publicConfig = {
    key: 'AIzaSyDgCxswLQzLO1Wwyr3HCPCRR1hgCP2j0ek',
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true, // use https
    proxy: 'http:localhost:3000'
  //proxy:              'http://127.0.0.1:8080' // optional, set a proxy for HTTP requests
};
var gmAPI = new GoogleMapsAPI(publicConfig);

// geocode API
var geocodeParams = {
  "address":    "121, Curtain Road, EC2A 3AD, London UK",
  "components": "components=country:GB",
  "bounds":     "55,-1|54,1",
  "language":   "en",
  "region":     "uk"
};



// reverse geocode API
var reverseGeocodeParams = {
  "latlng":        "51.1245,-0.0523",
  "result_type":   "postal_code",
  "language":      "en",
  "location_type": "APPROXIMATE"
};

gmAPI.reverseGeocode(reverseGeocodeParams, function(err, result){
  console.log(result);
});


router.route('/maps')

  //(accessed at GET http://localhost:3000/api/maps)
    .get(function(req, res) {
        console.log(geocodeParams);
        console.log(gmAPI);
        gmAPI.reverseGeocode(reverseGeocodeParams, function(err, result){
            console.log(result);
        });

/*        gmAPI.geocode(geocodeParams, function(err, result){
        console.log("test");
        console.log(result);
        });*/
    });


module.exports = router;
