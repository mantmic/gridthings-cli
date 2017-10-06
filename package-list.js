#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var gtswp = require('./gt-software-package.js');
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
  .arguments('<server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    gtapi.software_list_packages(server, function(response)
    {
      try
      {
        var contents = JSON.parse(response.text);
        var json_values = [];
        for (var package = 0; package < contents.length; package++)
        {
          if (!contents[package]._id["$oid"])
          {
            var p = gtswp.from_mongo(contents[package]);
            if (print_json)
            {
              json_values.push(p);
            }
            else
            {
              console.log(p.toString());
              console.log("");
            }
          }
        }

        if (print_json)
        {
          console.log(JSON.stringify(json_values, null, 2));
        }

      }
      catch(e)
      {
        console.log(e);
      }  
    })
  })
  .parse(process.argv);