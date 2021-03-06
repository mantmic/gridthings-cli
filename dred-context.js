#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Lazy = require('lazy.js');
var Helpers = require('./dred-helpers.js');


var wrongArguments = true;

program
  .arguments('<context> <dredClass> <utcOffset> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(context, dredClass, utcOffset, urn, server) {
    wrongArguments = false;
    var values = Helpers.convertArgumentsToUsedValues({context, dredClass, utcOffset, urn, server});

    Helpers.checkDredArguments(values);

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    //construct the body of the request
    var payload = {
      id: 0,
      resources: Helpers.buildPayloadResources(Lazy(values).pick(['context', 'dredClass', 'utcOffset']).toObject())
    };

    gtapi.core_put('33000/' + 0, payload, urn, server, function () {
      gtapi.core_get('33000/' + 0, urn, server, function () {
        console.info('Configuration applied to DRED ' + urn);
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