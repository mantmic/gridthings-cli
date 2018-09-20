#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    gtapi.command_get(urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        if(response.length == 0){
          console.log("No commands in queue")
        } else {
          response.forEach(function(r){
            console.log("Command:");

            console.log("  Id:               " + r.endpoint_command_id);
            console.log("  Command:          " + r.command);
            console.log("  Status:           " + r.status);
            console.log("  Reponse:          " + r.response);
            console.log("  Created:          " + new Date(r.created_on_ts));
            console.log("  Last updated:     " + new Date(r.last_updated_ts));
          })
        }
      }
    })
  })
  .parse(process.argv);
