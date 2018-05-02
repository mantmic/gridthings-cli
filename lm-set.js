#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

var settings = {};

settings.alarm_visual_indication = { parse: parseInt, uri: "31001/0/1", id : 1 };
settings.voltage_low_level       = { parse: parseInt, uri: "31001/0/5", id : 5 };
settings.voltage_high_level      = { parse: parseInt, uri: "31001/0/6", id : 6 };
settings.voltage_low_time        = { parse: parseInt, uri: "31001/0/7", id : 7 };
settings.voltage_high_time       = { parse: parseInt, uri: "31001/0/8", id : 8 };
settings.voltage_average_time    = { parse: parseInt, uri: "31001/0/9", id : 9 };
settings.high_temperature_level  = { parse: parseInt, uri: "31001/0/10", id :10 };
settings.low_battery_level       = { parse: parseInt, uri: "31001/0/11", id :11 };
settings.current_average_time    = { parse: parseInt, uri: "31001/0/12", id :12 };
settings.mock                    = { parse: parseInt, uri: "31001/0/17", id: 17 };
settings.context                 = { parse: function(v){return v;}, uri: "31001/0/16", id :16 };
settings.level0                  = { parse: parseInt, uri: "31000/0/0", id: 0 };
settings.time0                   = { parse: parseInt, uri: "31000/0/1", id: 1 };
settings.level1                  = { parse: parseInt, uri: "31000/1/0", id: 0 };
settings.time1                   = { parse: parseInt, uri: "31000/1/1", id: 1 };
settings.level2                  = { parse: parseInt, uri: "31000/2/0", id: 0 };
settings.time2                   = { parse: parseInt, uri: "31000/2/1", id: 1 };
settings.level3                  = { parse: parseInt, uri: "31000/3/0", id: 0 };
settings.time3                   = { parse: parseInt, uri: "31000/3/1", id: 1 };


function is_valid_setting(setting)
{
  return setting in settings;
}

program
  .arguments('<setting> <value> <urn> [server]')
  .description(
    'Set a configuration value on the specified line monitor\n' +
    '\n' +
    '  Valid settings are:\n' +
    '    alarm_visual_indication\n'+
    '    voltage_low_level      \n'+
    '    voltage_high_level     \n'+
    '    voltage_low_time       \n'+
    '    voltage_high_time      \n'+
    '    voltage_average_time   \n'+
    '    high_temperature_level \n'+
    '    low_battery_level      \n'+
    '    current_average_time   \n'+
    '    mock                   \n'+
    '    context                \n'+
    '    level0                 \n'+
    '    time0                  \n'+
    '    level1                 \n'+
    '    time1                  \n'+
    '    level2                 \n'+
    '    time2                  \n'+
    '    level3                 \n'+
    '    time3                  \n'
    )
  .option('-v, --verbose', 'Be verbose')
  .action(function(setting, value, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    if (is_valid_setting(setting))
    {

      gtapi.core_put(settings[setting].uri, {id: settings[setting].id, value: settings[setting].parse(value) }, urn, server, function () {
        console.info('Line Monitor ' + setting + " on " + urn + " is now " + value);
      }, function (error) {
        helpers.display_error("writting configuration resource", error);
      });
    }
    else
    {
      console.error("invalid setting name");
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}