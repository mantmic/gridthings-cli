#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

var settings = {};

settings.dip_voltage                     = { parse: parseInt, uri: "32000/0/0", id : 0  };
settings.dip_cycles                      = { parse: parseInt, uri: "32000/0/1", id : 1  };
settings.swell_voltage                   = { parse: parseInt, uri: "32000/0/2", id : 2  };
settings.swell_cycles                    = { parse: parseInt, uri: "32000/0/3", id : 3  };
settings.overcurrent_threshold           = { parse: parseInt, uri: "32000/0/4", id : 4  };
settings.single_phase                    = { parse: function(v){ return JSON.parse(String(val).toLowerCase());}, uri: "32000/0/5", id : 5  };
settings.phase_no_load_poll_time         = { parse: parseInt, uri: "32000/0/6", id : 6  };
settings.over_current_status_poll_time  = { parse: parseInt, uri: "32000/0/7", id : 7  };
settings.phase_peak_select               = { parse: parseInt, uri: "32000/0/8", id : 8  };
settings.overcurrent_enable              = { parse: parseInt, uri: "32000/0/9", id : 9  };
settings.temperature_update_time         = { parse: parseInt, uri: "32000/0/10", id : 10};
settings.power_update_time               = { parse: parseInt, uri: "32000/0/11", id : 11};
settings.power_sign                      = { parse: parseInt, uri: "32000/0/12", id : 12};
settings.active_power_accumulation_mode  = { parse: parseInt, uri: "32000/0/13", id : 13};
settings.rective_power_accumulation_mode = { parse: parseInt, uri: "32000/0/14", id : 14};
settings.selection_3_wire_4_wire         = { parse: parseInt, uri: "32000/0/15", id : 15};
settings.frequency_select                = { parse: parseInt, uri: "32000/0/16", id : 16};
settings.voltage_conversion_constant     = { parse: parseFloat, uri: "32000/0/17", id : 17};
settings.current_conversion_constant     = { parse: parseFloat, uri: "32000/0/18", id : 18};
settings.power_conversion_constant       = { parse: parseFloat, uri: "32000/0/19", id : 19};
settings.energy_conversion_constant      = { parse: parseFloat, uri: "32000/0/20", id : 20};
settings.context                         = { parse: function(v){return v;}, uri: "32000/0/21", id : 21};

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
    '    dip_voltage                    \n'+
    '    dip_cycles                     \n'+
    '    swell_voltage                  \n'+
    '    swell_cycles                   \n'+
    '    overcurrent_threshold          \n'+
    '    single_phase                   \n'+
    '    phase_no_load_poll_time        \n'+
    '    over_current_status_poll_ time \n'+
    '    phase_peak_select              \n'+
    '    overcurrent_enable             \n'+
    '    temperature_update_time        \n'+
    '    power_update_time              \n'+
    '    power_sign                     \n'+
    '    active_power_accumulation_mode \n'+
    '    rective_power_accumulation_mode\n'+
    '    selection_3_wire_4_wire        \n'+
    '    frequency_select               \n'+
    '    voltage_conversion_constant    \n'+
    '    current_conversion_constant    \n'+
    '    power_conversion_constant      \n'+
    '    energy_conversion_constant     \n'+
    '    context                        \n'
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
        console.info('Transformer Monitor ' + setting + " on " + urn + " is now " + value);
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