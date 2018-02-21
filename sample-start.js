#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');
var wrongArguments = true;

program
  .arguments('<sample> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(sample, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) 
    {
      gtapi.log_level = 1;
    }

    gtapi.core_exec('30000/' + sample + '/11', null, urn, server, function () {
      gtapi.core_get('30000/' + sample + '/12', urn, server, function (result) {
        var enabled = helpers.resource_get_result(result).content.value;
        console.info('Sample ' + sample + ' on ' + urn + ' is' + (enabled ? " " : " NOT ") + "recording");
      }, function (error) {
        helpers.display_error("reading Recording Enabled resource", error);
      });
    }, function (error) {
      helpers.display_error("executing Start Recording resource", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) 
{
  program.help();
}