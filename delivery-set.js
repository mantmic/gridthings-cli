#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

var settings = {};

// Schedule Start Time           /30003/0/0
// Schedule UTC Offset           /30003/0/1
// Delivery Frequency            /30003/0/2
// Randomised Delivery Window    /30003/0/3
// Number of Retries             /30003/0/4
// Retry Period                  /30003/0/5

function parse_int(value)
{
  var value_int = parseInt(value);
  if (isNaN(value_int)) 
  {
    console.error("value must be an integer");
  }
  return value_int;
}

//we expect utc in seconds offest
function parse_utc(value)
{
  var value_int = parse_int(value);
 
  if ((value_int > 3600) || (value_int < -3600))
  {
    console.error("timezone out of range");
    return NaN;
  } 
  return value_int;
}

function parse_period(value)
{ 
  var value_int = parse_int(value);
  if (isNaN(value_int)) 
  {
    return value_int;
  }
  if (!helpers.is_valid_period(value_int, "frequency"))
  {
    return NaN;
  }
  return value_int;
}

settings.start         = { parse: parse_int,      uri: "30003/0/0", id : 0 };
settings.utc_offset    = { parse: parse_utc,      uri: "30003/0/1", id : 1 };
settings.frequency     = { parse: parse_period,   uri: "30003/0/2", id : 2 };
settings.retry_window  = { parse: parse_int,      uri: "30003/0/3", id : 3 };
settings.num_retries   = { parse: parse_int,      uri: "30003/0/4", id : 4 };
settings.retry_period  = { parse: parse_int,      uri: "30003/0/5", id : 5 };

function is_valid_setting(setting, value)
{
  if (!(setting in settings)) return false;

  var p_v = settings[setting].parse(value);
  return (p_v != null) && (!isNaN(p_v)); 
}


program
  .arguments('<setting> <value> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .description('Set the parameters of the Delivery Schedule object on the specified device. Valid settings are:\n\n' +
     "    start:            Seconds from midnight to offset the scehdule.\n" +
     "    utc_offset:       Seconds from UTC for the device's timezone, used to determin when midnight is.\n" +
     "    frequency:        Seconds between deliveries, must be a valid period.\n" +
     "    retry_window:     Number of seconds to select random delivery time over.\n" +
     "    num_retries:      Nummber of retry attempts for each delivery.\n" +
     "    retry_period:     Number of seconds to spread retries over."
  )
  .action(function(setting, value, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    if (is_valid_setting(setting, value))
    {

      gtapi.core_put(settings[setting].uri, {id: settings[setting].id, value: settings[setting].parse(value) }, urn, server, function () {
        console.info('Delivery Schedule ' + setting + " on " + urn + " is now " + value);
      }, function (error) {
        helpers.display_error("writting configuration resource", error);
      });
    }
    else
    {
      console.error("invalid setting");
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}