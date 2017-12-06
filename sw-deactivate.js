#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
program
  .arguments('install <slot> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(slot, urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    console.log('deactivating application %s on device %s via %s', slot , urn, server);

    gtapi.software_deactivate(slot, urn, server, function(response)
    {
      if (print_json) console.log(JSON.stringify(response, null, 2));
      else console.log(response.code);
    });
  })
  .parse(process.argv);