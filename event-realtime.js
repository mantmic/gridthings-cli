#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

program
  .arguments('<event> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(event, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_put('30001/' + event + '/3', {id: 3, value: true }, urn, server, function () {
      console.info('event ' + event + " on " + urn + " is now realtime");
    }, function (error) {
      console.log(JSON.stringify(error));
      helpers.display_error("setting realtime resource", error);
    });
    
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}