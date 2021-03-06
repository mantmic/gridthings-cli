#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Lazy = require('lazy.js');
var Helpers = require('./dred-helpers.js');


var wrongArguments = true;

program
  .arguments('<instance> <mode> <startWindow> <minDuration> <maxDuration> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(instance, mode, startWindow, minDuration, maxDuration, urn, server) {
    wrongArguments = false;
    var values = Helpers.convertArgumentsToUsedValues({instance, mode, startWindow, minDuration, maxDuration, urn, server});

    values.schedule = 0;
    values.enabled = true;

    Helpers.checkDredArguments(values);

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    //construct the body of the request
    var payload = {
      id: instance,
      resources: Helpers.buildPayloadResources(Lazy(values).pick(['enabled', 'schedule', 'mode', 'startWindow', 'minDuration', 'maxDuration']).toObject())
    };

    gtapi.core_put('33001/' + instance, payload, urn, server, function () {
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