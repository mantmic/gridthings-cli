var express    = require('express');        // call express
const enableWs = require('express-ws') ;
var app        = express();                 // define our app using express
var expressWs = enableWs(app);
var gtapi = require('./gt-api.js');
var gtswp = require('./gt-software-package.js');

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
  gtapi.software_get(req.params.endpoint,false, '.', function(response){
    res.json(response);
  })
});

//firmware show
router.get('/firmware/show/:endpoint', function(req, res) {
  gtapi.firmware_get(req.params.endpoint,false, '.', function(response){
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

//commands
//show
router.get('/command/show/:endpoint', function(req, res) {
  if(req.query.read_only == false || req.query.read_only == 'false'){
    var read_only = false ;
  } else {
    var read_only = true ;
  }
  gtapi.command_get(req.params.endpoint, '.',
    function(response){
      res.json(response);
    },
    function(response){
      //console.log(response)
      res.json([])
    }, read_only)
});

//push
router.post('/command/push', function(req, res) {
  gtapi.command_push(req.body.endpoint, req.body.command, req.body.payload, '.',
    function(response){
      res.json(response);
    },
    function(response){
      //console.log(response)
      res.json([])
    }, read_only)
});

//cancel
router.get('/command/delete/:endpoint_command_id', function(req, res) {
  gtapi.command_complete(req.params.endpoint_command_id, '.', 'cancelled', 'cancelled', function(response){
    res.json(response);
  })
});

//complete
//needs a place to determine whether the result was success, failure or
router.get('/command/complete/:endpoint_command_id', function(req, res) {
  gtapi.command_complete(req.params.endpoint_command_id, '.', req.query.response, 'complete', function(response){
    res.json(response);
  })
});

//stream
//need to broadcast on a route for every server
//server side listens to stream then broadcasts messages to all connected clients

//for each server, create a websocket route, and spawn a broadcaster for that route
const streamBaseRoute = 'stream'

var sendStreamRecord = function(data, server){
  expressWs.getWss().clients.forEach(function (client) {
    if(client.upgradeReq.url.replace('.websocket', '') === '/' + streamBaseRoute + '/' + server + '/'){
      client.send(data);
    }
  });
}
;


const defaults = require('./defaults.js');
var stream = require('./stream-api.js') ;
const config = defaults.get_config();
var servers = Object.keys(config) ;
servers = servers.filter(s => s != 'server') ;
servers = servers.filter(s => s != 'vm-napsbx006.domain.dev.int') ;

//filder out the

/*
stream.stream('.','.','evoenergy-01.gridthin.gs', false, function(endpoint,record){
  sendStreamRecord(JSON.stringify(record),'evoenergy-01.gridthin.gs')
}.bind(this))
;
*/

servers.forEach(function(s){
  var server = s ;
  console.log("Building stream route /" + streamBaseRoute + "/" + s) ;
  //create route
  router.ws('/' + streamBaseRoute + '/' + server, (ws, req) => {
    console.log('Client connected to ' + streamBaseRoute + '/' + server);
    ws.upgradeReq = req;
      ws.on('message', msg => {
        ws.send("Connection is read only")
        //ws.send(msg)
      })
      ws.on('close', () => {
          console.log('Client disconnected from ' + streamBaseRoute + '/' + server);
      })
      ws.on('error', (error) => {
        console.log(error)
      })
  })
  ;
  //create a sub process to listen to the stream, execute the sendStreamRecord function when a new message appears
  stream.stream('.','.',server, false, function(endpoint,record){
    sendStreamRecord(JSON.stringify(record),server)
  }.bind(this))
  ;
})
;


// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('GT Api running on port ' + port);
