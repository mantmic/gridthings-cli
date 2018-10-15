#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

program
  .arguments('<led1> <led2> <led3> <urn> [server]')
  .description(
    'Set the camera flash brightness for the specified oil level monitor\n\n' +
    'The camera has three LEDs, each with a brightness from 0 to 255\n')
  .option('-v, --verbose', 'Be verbose')
  .action(function(led1, led2, led3, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var led1_int = parseInt(led1);
    var led2_int = parseInt(led2);
    var led3_int = parseInt(led3);
    
    var is_valid = !isNaN(led1_int) && !isNaN(led2_int) && !isNaN(led2_int);

    if (is_valid)
    {
      is_valid = led1_int >= 0 && led2_int >= 0 && led2_int > 0;
      if (is_valid)
      {
        is_valid = (led1_int <= 255) && (led2_int <= 255) && (led3_int <= 255);

        if (!is_valid) console.error("LED values must be less than 255");
      }
      else
      {
        console.error("LED values must be greater than 0");
      }
    }
    else
    {
      console.error("invalid number specified");
    }

    var obj = {
      "id":"0",
      "resources":[
        {"id":6,"value":led1_int},
        {"id":7,"value":led2_int},
        {"id":8,"value":led3_int}
      ]
    };

    if (is_valid)
    {
      gtapi.core_put("30009/0", obj, urn, server, function () {
        console.info(
          'Oil Level Monitor flash on ' + urn + ' is now ' + 
          led1_int + ', ' +
          led2_int + ', ' +
          led3_int);

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