var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const config = require('./config.json') ;
const jwtSecret = 'test' ;
const hashSalt = '$2a$08$r2xVFOzBZJzkOfVPEafkwe';

function getHashedPassword(password){
  return(bcrypt.hashSync(password, hashSalt));
}
;

function getJwtToken(userId,hashedPassword){
  return(jwt.sign({ userId:userId,hashedPassword:hashedPassword}, jwtSecret))
}
;

function decodeJwtToken(token){
  return(jwt.verify(token, jwtSecret))
}
;

function comparePassword(password, hashedPassword){
  return(bcrypt.compareSync(password, hashedPassword))
}
;
//user to simulate a mongo db, id = userid
var db = require('./auth-db.js') ;

exports.pushUser = function(userObject,resolve = function(data){console.log(data)}, error = function(e){console.log(e)}){
  db.pushUser(userObject,resolve,error);
}
;

exports.pushUserObject = function(constructorObject,resolve = function(data){console.log(data)}, error = function(e){console.log(e)}){
  try{
    var defaultEnvironment = constructorObject.defaultEnvironment ;
    if(defaultEnvironment == null){
      defaultEnvironment = constructorObject.environment[0];
    }
    var userObject = {
      userId:constructorObject.userId,
      hashedPassword:getHashedPassword(constructorObject.password),
      environment:constructorObject.environment,
      defaultEnvironment:defaultEnvironment
    }
    exports.pushUser(userObject,resolve,error) ;
  } catch(e){
    error(e);
  }
}

exports.getUserByToken = function(token, resolve = function(data){console.log(data)}, error = function(e){console.log(e)}){
  //decode jwt token
  var decodedToken ;
  try {
    decodedToken = decodeJwtToken(token);
  }
  catch(e) {
    error("Invalid token")
    return
  }
  //check if it decodes, otherwise throw error
  const userId = decodedToken.userId ;
  //get user object
  db.getUserById(decodedToken.userId,function(userObject){
    if(userObject == null || userObject.userId == null){
      error("User not found")
    }
    //compare hashedPassword
    if(userObject.hashedPassword != decodedToken.hashedPassword){
      error("Password expired")
    } else {
      resolve(userObject) ;
    }
  }.bind(this));
}
;

exports.getToken = function(userId,password,resolve = function(data){console.log(data)}, error = function(error){console.log(error)}){
  //check if hashed password matches what is in the db
  db.getUserById(userId, function(userObject){
    if(userObject == null || userObject.userId == null){
      error("User not found")
    } else if (!comparePassword(password,userObject.hashedPassword)){
      error("Incorrect password")
    } else {
      resolve(getJwtToken(userId,userObject.hashedPassword))
    }
  }.bind(this));
}
;


//create default users
//list of all servers connected (should get via some other means..)
let servers = ["evoenergy-01.gridthin.gs","actewagl-01.gridthin.gs","ched-01.gridthin.gs"];

var adminEnvironment = {};
var serviceEnvironment = {};
var readEnvironment = {};

servers.forEach(function(s){
  adminEnvironment[s] = {
    admin:true,
    powerUser:true,
    user:true
  }
  serviceEnvironment[s] = {
    admin:false,
    powerUser:true,
    user:true
  }
  readEnvironment[s] = {
    admin:false,
    powerUser:false,
    user:true
  }
})
;


//create the default users
[
  {
    "userId": "admin",
    "password": config.adminPassword,
    "environment": adminEnvironment,
    "defaultEnvironment": "evoenergy-01.gridthin.gs"
  },
  {
  	"userId": "service",
  	"password": config.servicePassword,
  	"environment": serviceEnvironment,
  	"defaultEnvironment": "evoenergy-01.gridthin.gs"
  },
  {
    "userId": "read",
    "password": config.readPassword,
    "environment": readEnvironment,
    "defaultEnvironment": "evoenergy-01.gridthin.gs"
  }
].forEach(function(u){
  exports.pushUserObject(u,function(insert){
    console.log(u.userId)
  })
})
;
