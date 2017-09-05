#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

// {
//   "_exceptions":[
//     {
//       "exception":"com.mongodb.MongoTimeoutException",
//       "exception message":"Timed out after 30000 ms while waiting for a server that matches ReadPreferenceServerSelector{readPreference=primary}. Client view of cluster state is {type=UNKNOWN, servers=[{address=mongo:27017, type=UNKNOWN, state=CONNECTING, exception={com.mongodb.MongoSecurityException: Exception authenticating MongoCredential{mechanism=null, userName='gt-user', source='gtedge', password=<hidden>, mechanismProperties={}}}, caused by {com.mongodb.MongoCommandException: Command failed with error 18: 'Authentication failed.' on server mongo:27017. The full response is { 'ok' : 0.0, 'code' : 18, 'errmsg' : 'Authentication failed.' }}}]"
//     }
//   ],
//   "http status code":500,
//   "http status description":"Internal Server Error",
//   "message":"Timeout connecting to MongoDB, is it running?"
// }

program
  .arguments('<urn> <server>')
  .action(function(urn, server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = false;

    gtapi.ssn_remove_endpoint(urn, server, function(response)
    { 
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    })
  })
  .parse(process.argv);