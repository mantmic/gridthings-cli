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
    print_json = program.json;

    gtapi.ssn_poll_endpoint(urn, server, function(response)
    { 
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        if (response.status == 200) 
        {
          console.log("polling " + urn);
        }
        else
        {
          console.log(response.status + " " + response.text);
        }
      }
    }, 
    function(error)
    {
      if (error.status == 404)
      {
        console.log("The gt-edge service is not available");
      }
      else
      {
        helpers.display_error("polling SSN end point", error);
      }
    });
  })
  .parse(process.argv);