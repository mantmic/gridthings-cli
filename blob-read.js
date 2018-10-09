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
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_get('30007/' + instance + "/0", urn, server, function (result) 
    {
      var object = JSON.parse(result.text);
      gtapi.core_exec('30007/' + instance + '/2', null, urn, server, function () 
      {
        console.log(object.content.value + " from " + urn + " is streaming to the server");
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