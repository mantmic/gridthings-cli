var fs = require("fs");
const userFile = './test/user.json' ;

//replace this with an interface to mongo / postgres / whatever

exports.getUserById = function(userId){
  var user = JSON.parse(fs.readFileSync(userFile, 'utf8'));
  if(user[userId] == null){
    return({})
  } else {
    return(user[userId])
  }
}
;

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
