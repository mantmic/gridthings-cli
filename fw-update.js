#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
program
  .arguments('update <urn> <server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    console.log('Updating firmware on device %s via %s', urn, server);

    gtapi.firmware_update(urn, server, function(response)
    {
      if (print_json) console.log(JSON.stringify(response));
      else console.log(response.status);
    });
  })
  .parse(process.argv);