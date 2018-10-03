var MongoClient = require('mongodb').MongoClient;
const config = require('./config.json') ;
// Connect to the db
MongoClient.connect(config.mongoUri, function (err, db) {
  if(err){
    throw err;
  } else {
    console.log("Connected to mongodb")
  }
});

var db = require('diskdb');
// this
db = db.connect('./localdb',['user','process']);

//create the admin user
const adminUser = {
  "_id":"admin",
  "userId": "admin",
  "hashedPassword": "$2a$08$r2xVFOzBZJzkOfVPEafkweB1VWr6ZumyYRtKc51y5TqT71iafaM4q",
  "environment": {
    "evoenergy-01.gridthin.gs": {
      "user": true,
      "powerUser": true,
      "admin": true
    },
    "actewagl-01.gridthin.gs": {
      "user": true,
      "powerUser": true,
      "admin": true
    },
    "ched-01.gridthin.gs": {
      "user": true,
      "powerUser": true,
      "admin": true
    }
  },
  "defaultEnvironment": "evoenergy-01.gridthin.gs"
}
;

exports.getUserById = function(userId){
  return(db.user.findOne({userId: userId}));
}
;

/*
exports.pushUser = function(userObject,resolve = function(data){console.log(data), error = function(e){console.log(e)}}){
  var user = JSON.parse(fs.readFileSync(userFile, 'utf8'));
  user[userObject.userId] = userObject ;
  fs.writeFile(userFile,JSON.stringify(user), function(err) {
    if(err) {
      error(err);
    } else {
      resolve("User saved")
    }
  });
}
;
*/

exports.pushUser = function(userObject,resolve = function(data){console.log(data), error = function(e){console.log(e)}}){
  try{
    resolve(db.user.update({userId:userObject.userId},userObject, {upsert:true}));
  } catch(e){
    error(e)
  }
}
;

exports.pushUser(adminUser);

//methods for cached commands
/*
{
  "processUiid":{
    "complete":false,
    "status":2,
    "output":[

    ]
  }
}
*/
const uuidv4 = require('uuid/v4');
const processFile = './test/process.json' ;

/*
function pushProcess(processId, processObject, resolve = function(processId){console.log(processId)}){
  try{
    var p = JSON.parse(fs.readFileSync(processFile, 'utf8'));
    p[processId] = processObject;
    const newFile = JSON.stringify(p, null, 2) ;
    fs.writeFile(processFile,newFile, function(err) {
      if(err) {
        console.log(err);
      } else {
        resolve(processId)
      }
    });
  } catch(e){
      console.log(e);
  }
}
;

exports.getProcess = function(processId,resolve = function(data){console.log(data)}){
  fs.readFile(processFile,'utf8',function(err,data){
    if(err){
      console.log(err)
      resolve({})
    } else {
      var p = JSON.parse(data);
      p = p[processId] ;
      if(p == null){
        resolve({})
      } else {
        resolve(p)
      }
    }
  }.bind(this))
}
;
*/

function pushProcess(processId, processObject, resolve = function(processId){console.log(processId)}){
  try {
    var p = processObject ;
    p.processId = processId ;
    db.process.update({processId:processId}, p, {upsert:true});
    resolve(processId) ;
  } catch(e){
    console.log(e);
  }
}
;

exports.getProcess = function(processId,resolve = function(data){console.log(data)}){
  try {
    resolve(db.process.findOne({processId:processId}))
  } catch(e){
    console.log(e);
  }
}
;

exports.createProcess = function(server, resolve = function(processId){console.log(processId)}){
  const processId = uuidv4();
  pushProcess(processId,{
    complete:false,
    status:2,
    output:[],
    server:server
  },resolve)
}
;

exports.updateProcess = function(processId,message, resolve = function(data){console.log(data)}){
  exports.getProcess(processId,function(processObject){
    var thisProcess = processObject ;
    thisProcess.output.push(message) ;
    pushProcess(processId,thisProcess,resolve);
  }.bind(this))
}
;

exports.completeProcess = function(processId,status, resolve = function(data){console.log(data)}){
  exports.getProcess(processId,function(processObject){
    var thisProcess = processObject ;
    thisProcess.status = status ;
    thisProcess.complete = true ;
    pushProcess(processId,thisProcess,resolve);
  }.bind(this))
}
;
