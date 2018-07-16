#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
program
  .arguments('cancel <slot> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(slot, urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    console.log('cancelling software download for slot %s on %s', slot, urn);

    gtapi.software_cancel(slot, urn, server, function(response)
    {
      if (print_json) console.log(JSON.stringify(response));
      else console.log(response.status);
    });
  })
  .parse(process.argv);