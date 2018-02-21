#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;



program
  .arguments('<sample> <period> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(sample, period, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var period_int = parseInt(period);

    if (helpers.is_valid_period(period_int, "period"))
    {
      gtapi.core_put('30000/' + sample + '/1', {id: 1, value: period_int }, urn, server, function () {
        console.info('Sample ' + sample + " period on " + urn + " is now " + period_int);
      }, function (error) {
        helpers.display_error("setting period resource", error);
      });
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}