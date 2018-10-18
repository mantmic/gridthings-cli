#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

program
  .arguments('<colour> <urn> [server]')
  .description(
    'Set the image colour for the specified oil level monitor\n\n' +
    'Colour can be one of `colour` or `grey`')
  .option('-v, --verbose', 'Be verbose')
  .action(function(colour, urn, server) {
    wrongArguments = false;

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var colour_int = 0;
    if (colour == "colour") colour_int = 1;
    else if (colour == "grey") colour_int = 3;
    else
    {
      console.error("invalid colour specified");
    }
    var obj = {
      "id":"0",
      "resources":[
        {"id":9,"value":colour_int}
      ]
    };

    if (colour_int != 0)
    {
      gtapi.core_put("30009/0", obj, urn, server, function () {
        console.info(
          'Oil Level Monitor Colour on ' + urn + ' is now ' + colour);
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