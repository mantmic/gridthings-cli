#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<urn> <command> <payload> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .option('-n, --nocache', 'Do not used cached values, hit the LWM2M server')
  .action(function(urn, command, payload, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    gtapi.command_push(urn, command, payload, server, function(response)
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
