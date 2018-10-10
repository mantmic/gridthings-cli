var fs = require('fs') ;

const swaggerFile = './swagger/swagger.json' ;

var baseObject = {
  "swagger": "2.0",
  "info": {
    "version": "0.21",
    "title": "GT API",
    "description": "API into the gridthings stack"
  },
  "host": "",
  "basePath": "/",
  "schemes": [
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "paths": {},
  "definitions":{}
}
;

//these are standard parameters that can be included in any request (depending on request type) - there is an array containing routes that do not include these paremeters
//"in": "body",
const commonParameters = [
  {
    "name": "server",
    "description": "The environment to run the request against, by default the user's default environment will be used (see /environment)",
    "example":"ched-01.gridthin.gs"
  },
  {
    "name": "token",
    "description": "The token, returned from /token, to use for authentication"
  }
]
;

const parameterExceptions = ['/token','/environment/list','/environment/set/{server}', '/user/add'] ;

function applyPathParameter(pathName, pathObject){
  var path = pathName ;
  var object = pathObject ;
  //check if the path is in the exception
  if(parameterExceptions.indexOf(pathName) > -1){
    //do not perform any changes
  } else {
    //if there is a post route, add that
    if(object.post){
      //add parameters
      if(!object.post.parameters){
        object.post.parameters = [];
      }
      object.post.parameters.concat(commonParameters.map(function(x){
        x.in = "body" ;
        return(x);
      }))
    }
    if(object.get){
      path = path ;
      if(!object.get.parameters){
        object.get.parameters = [];
      }
      commonParameters.forEach(function(p){
        //add the parameter to the definition
        var thisParam = p ;
        thisParam.in = "path" ;
        object.get.parameters.push(thisParam) ;
        //add path parameters to route
        if(path.includes("?")){
          path = path + "&" + p.name + "={" + p.name + "}"
        } else {
          path = path + "?" + p.name + "={" + p.name + "}"
        }
      })
    }
  }
  return({
    "pathName":path,
    "pathObject":object
  })
}

//load each of the paths + definitions from the defitions
//parameters that are included in almost every definition (e.g. token, server), should be added here to avoid boilerplate
var definitionFiles = fs.readdirSync('./swagger/definitions') ;
definitionFiles = definitionFiles.map(x => './definitions/' + x) ;

definitionFiles.forEach(function(f){
  var thisFile = require(f);
  //add file definitions
  var definitions = thisFile.definitions ;
  Object.keys(definitions).forEach(function(d){
    baseObject.definitions[d] = definitions[d] ;
  })
  var paths = thisFile.paths ;
  Object.keys(paths).forEach(function(d){
    var thisPath = applyPathParameter(d,paths[d]) ;
    baseObject.paths[thisPath.pathName] = thisPath.pathObject ;
  })
})


fs.writeFileSync(swaggerFile,JSON.stringify(baseObject, null, 2));
