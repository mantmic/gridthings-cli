#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');


program
  .arguments('<package> <server>')
  .option('-v, --verbose', 'Be verbose')
  .action(function(package, server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = false;

    gtapi.software_publish_package(package, server, function(response)
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