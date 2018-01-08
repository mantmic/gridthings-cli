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
    var values = Helpers.convertArgumentsToUsedValues({urn, server});

    Helpers.checkDredArguments(values);

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_put('33000/0/4', {id: 4, value: true}, urn, server, function () {
      gtapi.core_get('33000/0', urn, server, () => {}, () => {});
      console.info('Configuration was applied');
    }, function (error) {
      Helpers.displayError(error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}