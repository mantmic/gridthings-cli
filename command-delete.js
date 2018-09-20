#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<endpoint_command_id> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(endpoint_command_id, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    gtapi.command_cancel(endpoint_command_id, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        //log a pretty version of the oustanding commands
        console.log(JSON.stringify(response, null, 2));
      }
    })
  })
  .parse(process.argv);
