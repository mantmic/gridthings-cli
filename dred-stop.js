#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

program
  .arguments('<instance> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(instance, urn, server) {
    wrongArguments = false;
    var values = Helpers.convertArgumentsToUsedValues({instance, urn, server});

    Helpers.checkDredArguments(values);

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_exec('33001/' + instance + '/10', null, urn, server, function () {
      gtapi.core_get('33001/' + instance, urn, server, function () {
        console.info('Configuration was applied to DRED ' + urn);
      }, function (error) {
        Helpers.displayError(error);
      });
    }, function (error) {
      Helpers.displayError(error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}