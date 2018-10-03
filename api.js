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

//stream
//need to broadcast on a route for every server
//server side listens to stream then broadcasts messages to all connected clients

//for each server, create a websocket route, and spawn a broadcaster for that route
const streamBaseRoute = 'stream'

var sendStreamRecord = function(data, server){
  expressWs.getWss().clients.forEach(function (client) {
    //check if client has been authenticated, and if they are connected to the right socket
    if(client.authenticated && client.upgradeReq.url.replace('.websocket', '') === '/' + streamBaseRoute + '/' + server + '/'){
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
servers = servers.filter(s => s != 'ched-01.gridthin.gs') ;

//filder out the

/*
stream.stream('.','.','evoenergy-01.gridthin.gs', false, function(endpoint,record){
  sendStreamRecord(JSON.stringify(record),'evoenergy-01.gridthin.gs')
}.bind(this))
;
*/
//function to check if a token has read access to a server
//returns boolean
function checkReadAccess(token,server, resolve = function(access){console.log(access)},error = function(e){console.log(e)}){
  auth.getUserByToken(token,function(userObject){
    const environment = Object.keys(userObject.environment) ;
    if(environment.indexOf(server) > -1){
      resolve(true)
    } else {
      resole(false)
    }
  }.bind(this), error)
}
;

servers.forEach(function(s){
  var server = s ;
  console.log("Building stream route /" + streamBaseRoute + "/" + s) ;
  //create route
  try {
    router.ws('/' + streamBaseRoute + '/' + server, (ws, req) => {
      console.log('Client connected to ' + streamBaseRoute + '/' + server);
      ws.upgradeReq = req;
      //by default, set the authenticated fault to false
      ws.authenticated = false ;
      //tell client to send key
      ws.send({message:"Send API authencation key to access stream"}) ;
      ws.on('message', msg => {
        checkReadAccess(msg, server,function(access){
          if(access){
            ws.authenticated = true ;
            ws.send({message:"Access granted"})
          } else {
            ws.send({message:"Access denied"})
          }
        }.bind(this),
        function(e){
          ws.send({message:"error",error:e})
        }.bind(this)) ;
      })
      ws.on('close', () => {
          console.log('Client disconnected from ' + streamBaseRoute + '/' + server);
      })
      ws.on('error', (error) => {
        console.log(error)
      })
    })
    ;
  } catch(e){
    console.log(e)
  };
  //create a sub process to listen to the stream, execute the sendStreamRecord function when a new message appears
  stream.stream('.','.',server, false, function(endpoint,record){
    sendStreamRecord(JSON.stringify(record),server)
  }.bind(this))
  ;
})
;

/*
  New routes with auth build in
*/
var auth = require('./auth.js') ;

//route to get token
router.post('/token', function(req, res) {
  auth.getToken(req.body.userId,req.body.password,
    function(token){
      res.json({token:token});
    }.bind(this),
    function(e){
      res.status(500).send({message:e})
    }.bind(this)
  )
});


//function to handle token, return user object
function processRequest(req,res,resolve = function(userObject){console.log(userObject)}){
  //try to get the token either from the parameters or from the headers
  var token = req.headers['x-access-token'];
  if(token == null){
    token = req.query.token
  }
  try {
    if (!token){
      return res.status(401).send({message: 'No token provided.' });
    } else {
      auth.getUserByToken(token,resolve,function(e){
        res.status(500).send({message:e})
      })
    }
  } catch(e){
    res.status(500).send({message:e})
  }
}
;

function getRequestServer(req, userObject){
  var defaultEnvironment = userObject.defaultEnvironment ;
  if(defaultEnvironment == null){
    defaultEnvironment = Object.keys(userObject.environment)[0];
  }
  if(req.query.server == undefined){
    return(defaultEnvironment);
  } else {
    if(userObject.environment[req.query.server] == null){
      //return default if server not found
      return(defaultEnvironment);
    } else {
      return(req.query.server);
    }
  }
}
;

router.get('/environment/list', function(req, res) {
  processRequest(req,res,function(userObject){
    const environment = Object.keys(userObject.environment) ;
    const defaultEnvironment = userObject.defaultEnvironment ;
    res.json({
      environment:environment,
      defaultEnvironment:defaultEnvironment
    });
  })
});

router.get('/environment/set/:environment', function(req,res){
  processRequest(req,res,function(userObject){
    var user = userObject ;
    const userEnvironment = Object.keys(userObject.environment) ;
    if(userEnvironment.indexOf(req.params.environment) > -1){
      user.defaultEnvironment = req.params.environment;
      auth.pushUser(user,
        function(data){
          res.status(202).send({message:"Default environment set"})
        }.bind(this),
        function(e){
          res.status(500).send({message:e})
        }.bind(this)
      )
    } else {
      res.status(500).send({message:"User does not have access to this environment"})
    }
  })
})
;

//list devices
router.get('/devices', function(req, res) {
  processRequest(req,res,function(userObject){
    gtapi.list_devices(getRequestServer(req,userObject), function(response){
      if (response.status == 200) {
        var devices = JSON.parse(response.text);
        res.json(devices);
      } else {
        res.json([]);
      }
    }.bind(this));
  }.bind(this));
});

router.get('/endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
    gtapi.get_endpoints(getRequestServer(req,userObject), function(response){
      res.json(response) ;
    }.bind(this));
  }.bind(this));
});

//show packages
router.get('/package/list', function(req, res) {
  processRequest(req,res,function(userObject){
    gtapi.software_list_packages(getRequestServer(req,userObject), function(response){
      try {
        var contents = JSON.parse(response.text);
        var json_values = [];
        for (var package = 0; package < contents.length; package++){
          if (!contents[package]._id["$oid"]){
            var p = gtswp.from_mongo(contents[package]);
            json_values.push(p);
          }
        }
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
      catch(e){
        res.status(500).send({message:e})
      }
    }.bind(this))
  }.bind(this));
});

//routes to create users
router.post('/user/add', function(req,res){
  processRequest(req,res,function(userObject){
    var requestUser = userObject ;
    var newUser = req.body ;
    //check that pushing user is admin in all the environments in userObject
    const userEnvironment = Object.keys(newUser.environment) ;
    var adminCheck = userEnvironment.map(function(ue){
      if(requestUser.environment[ue] == null){
        return(false)
      } else {
        return(requestUser.environment[ue]['admin'])
      }
    })
    ;
    if(adminCheck.every(function(c){return(c)})){
      auth.pushUserObject(newUser,
        function(data){
          res.status(202).send({message:"User created"})
        }.bind(this),
        function(e){
          res.status(500).send({message:e})
        }.bind(this)
      )
    } else {
      res.status(500).send({message:"To grant access to an environment you must be admin of that environment"})
    }
  }.bind(this))
})
;

//software show
router.get('/software/show/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
    gtapi.software_get(req.params.endpoint,false, getRequestServer(req,userObject), function(response){
      res.json(response);
    }.bind(this));
  }.bind(this));
});

//software autodeploy
router.get('/software/autodeploy/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
   console.log(userObject);
   const server = getRequestServer(req,userObject) ;
   console.log(server);
   if(userObject.environment[server].powerUser){
     //create a process
     db.createProcess(server,function(processId){
       var fsm = new packageStatemachine.SoftwareUpdate({
         endpoint:req.params.endpoint,
         targetSlot:req.query.slot,
         targetVersion:req.query.package,
         server:server,
         printJson:true,
         messageCallback:function(message){
           db.updateProcess(processId,message) ;
         }.bind(this),
         callback:function(data){
           db.completeProcess(processId,4) ;
         }.bind(this)
       })
       ;
       //console.log(fsm);
       fsm.begin();
       res.json({processId:processId});
     }.bind(this))
   } else {
     res.status(500).send({message:"Power user permissions required to run this command"})
   }
  }.bind(this));
});


//firmware show
router.get('/firmware/show/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
    gtapi.firmware_get(req.params.endpoint,false, getRequestServer(req,userObject), function(response){
      res.json(response);
    }.bind(this));
  }.bind(this));
});

//firmware autodeploy
router.get('/firmware/autodeploy/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
   const server = getRequestServer(req,userObject) ;
   if(userObject.environment[server].powerUser){
     //create a process
     db.createProcess(server,function(processId){
       var fsm = new packageStatemachine.FirmwareUpdate({
         endpoint:req.params.endpoint,
         targetVersion:req.query.package,
         server:server,
         printJson:true,
         messageCallback:function(message){
           db.updateProcess(processId,message) ;
         }.bind(this),
         callback:function(data){
           db.completeProcess(processId,4) ;
         }.bind(this)
       })
       ;
       //console.log(fsm);
       fsm.begin();
       res.json({processId:processId});
     }.bind(this))
   } else {
     res.status(500).send({message:"Power user permissions required to run this command"})
   }
  }.bind(this));
});

//routes for long running processes that return a processId
var db = require('./auth-db.js') ;
router.get('/process/:processId', function(req, res) {
  processRequest(req,res,function(userObject){
    const userEnvironment = Object.keys(userObject.environment) ;
    db.getProcess(req.params.processId,function(processObject){
      if(processObject == null){
        res.status(404).send({message:"Process not found"})
      } else if(userEnvironment.indexOf(processObject.server) > -1){
        res.json(processObject)
      } else {
        res.status(403).send({message:"Permission denied"})
      }
    }.bind(this))
  }.bind(this));
});


//push
//commands
//show
router.get('/command/show/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
    if(req.query.read_only == false || req.query.read_only == 'false'){
      var read_only = false ;
    } else {
      var read_only = true ;
    }
    var server = getRequestServer(req,userObject) ;
    gtapi.command_get(req.params.endpoint, server,
      function(response){
        res.json(response);
      },
      function(response){
        //console.log(response)
        res.json([])
      }, read_only)
  }.bind(this));
});

//cancel
router.get('/command/delete/:endpoint_command_id', function(req, res) {
  processRequest(req,res,function(userObject){
    var server = getRequestServer(req,userObject) ;
    if(userObject.environment[server].powerUser){
    //create a process
      gtapi.command_complete(req.params.endpoint_command_id, '.', 'cancelled', 'cancelled', function(response){
        res.json(response);
      }.bind(this))
    }
    else {
      res.status(500).send({message:"Power user permissions required to run this command"})
    }
  }.bind(this));
});

//complete
//needs a place to determine whether the result was success, failure or
router.get('/command/complete/:endpoint_command_id', function(req, res) {
  processRequest(req,res,function(userObject){
    var server = getRequestServer(req,userObject) ;
    if(userObject.environment[server].powerUser){
    //create a process
      gtapi.command_complete(req.params.endpoint_command_id, '.', req.query.response, 'complete', function(response){
        res.json(response);
      })
    }
    else {
      res.status(500).send({message:"Power user permissions required to run this command"})
    }
  }.bind(this));
});

router.post('/command/push', function(req, res) {
  processRequest(req,res,function(userObject){
    var server = getRequestServer(req,userObject) ;
    if(req.query.read_only == false || req.query.read_only == 'false'){
      var read_only = false ;
    } else {
      var read_only = true ;
    }
    if(userObject.environment[server].powerUser){
      //create a process
      gtapi.command_push(req.body.endpoint, req.body.command, req.body.payload, '.',
        function(response){
          res.json("pushed");
        }.bind(this),
        function(response){
          res.status(500).send({message:"Error"})
        }.bind(this))
    }
    else {
      res.status(500).send({message:"Power user permissions required to run this command"})
    }
  }.bind(this));
});

router.post('/value/push', function(req, res) {
  processRequest(req,res,function(userObject){
    var server = getRequestServer(req,userObject) ;
    if(userObject.environment[server].powerUser){
      //create a process
      var timestamp = req.body.timestamp ;
      if(timestamp == null){
        timestamp = new Date();
      }
      gtapi.value_push(req.body.endpoint, req.body.resource, req.body.value, timestamp, '.',
        function(response){
          res.json({"message":"pushed"});
        }.bind(this),
        function(response){
          res.status(500).send({message:"Error"})
        }.bind(this))
    }
    else {
      res.status(500).send({message:"Power user permissions required to run this command"})
    }
  }.bind(this));
});

//route to get the latest value for a resource
router.get('/value/latest/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
    const server = getRequestServer(req,userObject) ;
    //get the latest value of the oil monitor value
    var timestamp = req.query.atTimestamp ;
    if(timestamp == null){
      timestamp = new Date('2199-12-31') ;
    }
    gtapi.get_latest_value(req.params.endpoint,req.query.uri_path, server,
      function(data){
        res.json(data)
      }.bind(this),
      function(e){
        res.status(500).send({message:e})
      }.bind(this),timestamp
    );
 }.bind(this));
});


//route for oil monitor endpoints
//route to get the image serialized as png
const oilmonitorImage = "30007/0/1" ;

//parameters
//endpoint (in route)
//atTimestamp (defaults to now)
router.get('/oilmonitor/image/:endpoint', function(req, res) {
  processRequest(req,res,function(userObject){
    const server = getRequestServer(req,userObject) ;
    //get the latest value of the oil monitor value
    var timestamp = req.query.atTimestamp ;
    if(timestamp == null){
      timestamp = new Date('2199-12-31') ;
    }
    gtapi.get_latest_value(req.params.endpoint,oilmonitorImage, server,
      function(data){
        if(data.value != null){
          res.writeHead(200, {'Content-Type': 'image/png' });
          res.end(new Buffer(data.value,'base64'), 'binary');
        } else {
          res.status(404).send({message:"Image not found"})
        }
      }.bind(this),
      function(e){
        res.status(500).send({message:e})
      }.bind(this),timestamp
    );
 }.bind(this));
});

// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('GT Api running on port ' + port);
