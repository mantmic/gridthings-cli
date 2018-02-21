#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

function is_valid_offset(offset_int, period_int)
{
  console.log("offset_int: " + offset_int + " period_int " + period_int);
  if (isNaN(offset_int)) console.error("offset must be a number");
  else if (offset_int >= period_int) console.error("offset must be lass than period, period is currently " + period_int);
  else return true;
  return false;
}

program
  .arguments('<sample> <offset> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(sample, offset, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var offset_int = parseInt(offset);

    gtapi.core_get("30000/" + sample, urn, server, function (sample_res) {
      var sample_response = JSON.parse(sample_res.text);

      if (is_valid_offset(offset_int, sample_response.content.resources[1].value))
      {
        gtapi.core_put('30000/' + sample + '/2', {id: 1, value: offset_int }, urn, server, function () {
          console.info('Sample ' + sample + " offset on " + urn + " is now " + offset_int);
        }, function (error) {
          helpers.display_error("setting offset resource", error);
        });
      }
    }, 
    function (error) {
      helpers.display_error("getting sample object", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}