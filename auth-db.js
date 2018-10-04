var MongoClient = require('mongodb').MongoClient;
const config = require('./config.json') ;

//var db = require('diskdb');
// this
//db = db.connect('./localdb',['user','process']);

// Connect to the db, initialize the database variable
function connectMongo(){
  return(new Promise(function(resolve,reject){
    MongoClient.connect(config.mongoUri, function (err, database) {
      if(err){
        throw err;
        reject(err)
      } else {
        resolve(database);
      }
    });
  }))
}
;

var connectPromise = connectMongo() ;

exports.pushUser = function(userObject,resolve = function(data){console.log(data)}, error = function(e){console.log(e)}){
  try{
    Promise.resolve(connectPromise).then(function(db){
      db.collection("user").update({userId:userObject.userId},userObject, {upsert:true},function(err,result){
        if(err){
          error(err)
        } else {
          resolve(result)
        }
      });
    })
  } catch(e){
    error(e)
  }
}
;


exports.getUserById = function(userId, resolve = function(data){console.log(data)}, error = function(e){console.log(e)}){
  Promise.resolve(connectPromise).then(function(db){
    db.collection("user").findOne({userId: userId}, function(err,result){
      if(err){
        error(err)
      } else {
        resolve(result)
      }
    }) ;
  })
}
;

const uuidv4 = require('uuid/v4');
const processFile = './test/process.json' ;

function pushProcess(processId, processObject, resolve = function(processId){console.log(processId)}){
  try {
    var p = processObject ;
    p.processId = processId ;
    db.collection("process").update({processId:processId}, p, {upsert:true});
    resolve(processId) ;
  } catch(e){
    console.log(e);
  }
}
;

exports.getProcess = function(processId,resolve = function(data){console.log(data)}){
  try {
    resolve(db.collection("process").findOne({processId:processId}))
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
