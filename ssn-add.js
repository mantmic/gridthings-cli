#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    var print_json = program.json;

    gtapi.ssn_add_endpoint(urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        if ((response.status == 201) || (response.status == 200))
        {
          console.log("OK");
        }
        else
        {
          console.log(response.status + " " + response.text);
        }
      }
    },
    function(error)
    {
      if (print_json)
      {
        console.log(JSON.stringify(error, null, 2));
      }
      helpers.display_error("Failed to add SSN endpoint", error);
    })
  })
  .parse(process.argv);