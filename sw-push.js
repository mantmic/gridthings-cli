#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('install <slot> <package> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(slot, package, urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    console.log('pushing %s to slot %s on device %s via %s', package, slot , urn, server);

    gtapi.software_push(slot, package, urn, server, function(response){
      if (print_json) console.log(JSON.stringify(response, null, 2));
      else
      {
        console.log(response.status);
      }
    });
  })
  .parse(process.argv);
