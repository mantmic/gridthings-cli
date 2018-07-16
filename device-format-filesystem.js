#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var prompt = require('prompt');
var colors = require("colors/safe");
var Spinner = require('cli-spinner').Spinner;

prompt.message = ""
prompt.delimiter = ""
prompt.start();

var wrongArguments = true;

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) {
    wrongArguments = false;

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    prompt.get(
    {
      properties: {
        confirm: {
          description: colors.red("All object settings will be lost, are you sure you want to continue (yes or no)?")
        }
      }
    }, function (err, result) 
    {
      if (result.confirm.toLowerCase() == "yes")
      {
        var spinner = new Spinner('formatting... %s');
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        gtapi.core_exec('30006/0/3', '', urn, server, function () {
          spinner.stop(true);
          console.info('filesystem on endpoint ' + urn + " is formated");
        }, function (error) {
          spinner.stop(true);
          Helpers.displayError("failed to format file system: ", error);
        });
      }
      else
      {
        console.error("aborting");
      }
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}