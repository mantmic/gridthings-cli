#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    gtapi.software_reload_packages(server, function(response)
    { 
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        console.log(response.status);
      }
    })
  })
  .parse(process.argv);