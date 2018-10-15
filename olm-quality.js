#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

program
  .arguments('<quality> <urn> [server]')
  .description(
    'Set the image JPEG quality for the specified oil level monitor\n\n' +
    'The camera supports three quality levels, high, medium, low\n')
  .option('-v, --verbose', 'Be verbose')
  .action(function(quality, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var quality_int = 0;
    if (quality == "high") quality_int = 1;
    else if (quality == "medium") quality_int = 2;
    else if (quality == "low") quality_int = 3;
    else
    {
      console.error("invalid quality specified");
    }
    
    var obj = {
      "id":"0",
      "resources":[
        {"id":5,"value":x_int}
      ]
    };

    if (quality_int != 0)
    {
      gtapi.core_put("30009/0", obj, urn, server, function () {
        console.info(
          'Oil Level Monitor JPEG quality on ' + urn + ' is now ' + quality);
      }, function (error) {
        helpers.display_error("writting configuration resource", error);
      });
    }
    else
    {
      //error already reported
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}