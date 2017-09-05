#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<server>')
  .action(function(server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = false;

    gtapi.ssn_reload_endpoints(server, function(response)
    { 
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        console.log(response.code);
      }
    })
  })
  .parse(process.argv);