#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) {
    gtapi.log_level = program.verbose ? 1 : 0;
    print_json = false;

    gtapi.ssn_add_endpoint(urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    })
  })
  .parse(process.argv);