#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');


program
  .arguments('<urn> <server>')
  .action(function(urn, server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = false;

    gtapi.ssn_poll_endpoint(urn, server, function(response)
    { 
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    })
  })
  .parse(process.argv);