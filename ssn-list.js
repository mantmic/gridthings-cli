#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var the_server = null;
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

function list(server) 
{
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    gtapi.ssn_list_endpoints(server, function(endpoints)
    {
      if (print_json)
      {
        console.log(JSON.stringify(endpoints, null, 2));
      }
      else
      {
        if (endpoints.length == 0)
        {
          console.log("No SSN endpoints are configured");
        }
        else
        {
          for (var ep = 0; ep < endpoints.length; ep++)
          {
            console.log(endpoints[ep]);
          }
        }
      }
    }, 
    function(error)
    {
      if (error.status == 404)
      {
        console.log("No SSN endpoints are configured");
      }
      else
      {
        helpers.display_error("getting SSN endpoints", error);
      }
    });
  }

program
  .arguments('[server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(server) { the_server = server; })
  .parse(process.argv);


list(the_server == null ? "." : the_server);