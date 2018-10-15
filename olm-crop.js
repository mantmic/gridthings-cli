#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

program
  .arguments('<x> <y> <w> <h> <urn> [server]')
  .description(
    'Set the image cropping for the specified oil level monitor\n\n' +
    'The camera can capture a maxium resolution of 320 x 200 and\n'+
    'so your crop settings must fit within this window')
  .option('-v, --verbose', 'Be verbose')
  .action(function(x, y, w, h, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var x_int = parseInt(x);
    var y_int = parseInt(y);
    var w_int = parseInt(w);
    var h_int = parseInt(h);
    
    var is_valid = !isNaN(x_int) && !isNaN(y_int) && !isNaN(w_int) && !isNaN(h_int);

    if (is_valid)
    {
      is_valid = x_int >= 0 && y_int >= 0 && w_int > 0 && h_int > 0;
      if (is_valid)
      {
        is_valid = (x_int + w_int <= 320) && (y_int + h_int <= 240);

        if (!is_valid) console.error("crop values outside of image bounds (320 x 240)");
      }
      else
      {
        console.error("crop values must be greater than 0");
      }
    }
    else
    {
      console.error("invalid number specified");
    }

    var obj = {
      "id":"0",
      "resources":[
        {"id":1,"value":x_int},
        {"id":2,"value":y_int},
        {"id":3,"value":w_int},
        {"id":5,"value":h_int}
      ]
    };

    if (is_valid)
    {
      gtapi.core_put("30009/0", obj, urn, server, function () {
        console.info(
          'Oil Level Monitor cropping on ' + urn + ' is now ' + 
          x_int + ', ' +
          y_int + ', ' +
          w_int + ', ' +
          h_int);
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