#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<package> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(package, urn, server) {
    console.log('pushing %s to device %s', package ,urn);

    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    gtapi.firmware_push(package, urn, server, function(response){
     if (print_json) console.log(JSON.stringify(response));
     else 
     {
        console.log(response.status);
     }
    });
  })
  .parse(process.argv);