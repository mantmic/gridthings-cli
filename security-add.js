#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<PSK-bootstrap> <PSK-core> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(PSK_bootstrap, PSK_core, urn, server) {
    gtapi.log_level = program.verbose ? 1 : 0;
    print_json = false;
    gtapi.security_add_endpoint(PSK_bootstrap, PSK_core, urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    }, 
    function(err)
    {
      console.log("error:" + err);
    })
  })
  .parse(process.argv);