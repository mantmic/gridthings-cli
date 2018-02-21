#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;


function is_valid_period(period_int)
{
  var valid_periods = [];
  valid_periods.push(1);
  valid_periods.push(5);
  valid_periods.push(15);
  valid_periods.push(30);
  valid_periods.push(60);
  valid_periods.push((60 * 5));
  valid_periods.push((60 * 15));
  valid_periods.push((60 * 30));
  valid_periods.push((60 * 60));
  valid_periods.push((60 * 60 * 3));
  valid_periods.push((60 * 60 * 12));
  valid_periods.push((60 * 60 * 24));
  valid_periods.push((60 * 60 * 24 * 7));
  valid_periods.push((60 * 60 * 24 * 7 * 4));

  if (isNaN(period_int)) console.error("period must be a number");
  else if (!valid_periods.includes(period_int))
  {
    console.error("period must be one of " + JSON.stringify(valid_periods));
  }
  else
  {
    return true;
  }
  return false;
}


program
  .arguments('<sample> <period> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(sample, period, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var period_int = parseInt(period);

    if (is_valid_period(period_int))
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