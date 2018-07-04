#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) {
    wrongArguments = false;

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_exec('3/0/4', '', urn, server, function () {
     console.info('endpoint ' + urn + " is rebooting");
    }, function (error) {
      Helpers.displayError(error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}