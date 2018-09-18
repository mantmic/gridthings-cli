var express    = require('express');        // call express
var gtapi = require('./gt-api.js');
var gtswp = require('./gt-software-package.js');

var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8889;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/', function(req, res) {
    res.json({ message: 'Gridthings API' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('GT Api running on port ' + port);


//first few routes as a POC
//packge list
router.get('/package/list', function(req, res) {
  gtapi.software_list_packages('.', function(response)
  {
    try {
      var contents = JSON.parse(response.text);
      var json_values = [];
      for (var package = 0; package < contents.length; package++){
        if (!contents[package]._id["$oid"]){
          var p = gtswp.from_mongo(contents[package]);
          if (true){
            json_values.push(p);
          }
          else {
            console.log(p.toString());
            console.log("");
          }
        }
      }
      if (true){
        //get rid of the junk at the end of some of the strings
        var find = '\u0000';
        var re = new RegExp(find, 'g');
        let data = json_values.map(function(s){
          var d = s ;
          d.version = s.version.replace(re, '').trim() ;
          d.name = s.name.replace(re,'').trim();
          //return(s);
          return(d);
        })
        res.json(data);
      }
    }
    catch(e)
    {
      console.log(e);
    }
  })
});


//software show
router.get('/software/show/:endpoint', function(req, res) {
  gtapi.software_get(req.params.endpoint, '.', function(response){
    res.json(response);
  })
});

//firmware show
router.get('/firmware/show/:endpoint', function(req, res) {
  gtapi.firmware_get(req.params.endpoint, '.', function(response){
    res.json(response);
  })
});

//software autodeploy
var packageStatemachine = require('./package-statemachine.js') ;
router.get('/software/autodeploy/:endpoint', function(req, res) {
  var fsm = new packageStatemachine.SoftwareUpdate({
    endpoint:req.params.endpoint,
    targetSlot:req.query.slot,
    targetVersion:req.query.package,
    server:'.',
    printJson:true,
    callback:function(data){
      res.json(data)
    }.bind(this)
  })
  ;
  //console.log(fsm);
  fsm.begin();
});


//devices
router.get('/devices', function(req, res) {
  gtapi.list_devices(".", function(response){
    if (response.status == 200) {
      var devices = JSON.parse(response.text);
      res.json(devices);
    } else {
      res.json([]);
    }
  });
});
