#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

function get_value(value, def)
{
  if ((value == "") || (value == null) || (value == undefined)) return def;
  return value;
}


program
  .arguments('<urn> <server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    gtapi.firmware_get(urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        var state = response[0];
       
        console.log("Firmware:");

        console.log("  Name:             " + get_value(state[0], "(none)"));
        console.log("  Version:          " + get_value(state[1], "(none)"));
        console.log("  Package URI:      " + get_value(state[1], "(none)"));
        console.log("  State:            " + gtapi.fw_state_to_string(get_value(state, 0)));
        console.log("  Update Result:    " + gtapi.fw_result_to_string(get_value(state, 0)));
        
      }
    })
  })
  .parse(process.argv);