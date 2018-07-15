#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

function get_value(value, def)
{
  if ((value == "") || (value == null) || (value == undefined)) return def;
  return value;
}

function power_source_to_string(ps)
{
  switch (ps)
  {
  case 1: return "Internal Battery";
  case 2: return "External Battery";
  case 4: return "Power over Ethernet";
  case 5: return "USB";
  case 6: return "AC (Mains) power";
  case 7: return "Solar";
  }
  return "unkown";
}

function current_time_to_string(ct)
{
  var date = new Date(ct);

  return date.toString();
}

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    gtapi.device_get(urn, server, function(response)
    {
      gtapi.device_system_get(urn, server, function(sys_response)
      {
        if (print_json)
        {
          console.log(JSON.stringify(response));
        }
        else
        {
          var state = response[0];
          var sys_state = sys_response[0];

          console.log("Device:");
          console.log("  Manufacturer            "  + get_value(state[0 ], "")); 
          console.log("  Model                   "  + get_value(state[1 ], "")); 
          console.log("  Serial                  "  + get_value(state[2 ], "")); 
          console.log("  Firmware Version        "  + get_value(state[3 ], "")); 
          console.log("  Available Power Sources "  + power_source_to_string(get_value(state[6 ], ""))); 
          console.log("  Power Source Voltage    "  + get_value(state[7 ], "")); 
          console.log("  Power Source Current    "  + get_value(state[8 ], "")); 
          console.log("  Battery Level           "  + get_value(state[9 ], "")); 
          console.log("  Memory Free             "  + get_value(state[10], "")); 
          console.log("  Memory Total            "  + get_value(state[21], "")); 
          console.log("  Current Time            "  + current_time_to_string(get_value(state[13], ""))); 
          console.log("  Current Uptime          "  + get_value(sys_state[5], "")); 
          console.log("  Fault Uptime            "  + get_value(sys_state[6], ""));
          console.log("  Fault Time              "  + get_value(sys_state[7], "")); 
          console.log("  Fault Type              "  + get_value(sys_state[8], "")); 
          console.log("  Fault PC                "  + get_value(sys_state[9], "")); 
          console.log("  Fault LR                "  + get_value(sys_state[10], "")); 
       
        }
      })
    })
  })
  .parse(process.argv);