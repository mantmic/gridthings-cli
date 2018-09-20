#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

function get_value(value, def)
{
  if ((value == "") || (value == null) || (value == undefined)) return def;
  return value;
}


program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .option('-n, --nocache', 'Do not used cached values, hit the LWM2M server')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    no_cache = program.nocache ;
    gtapi.firmware_get(urn, no_cache, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        var state = response[0];

        console.log("Firmware:");

        console.log("  Name:             " + get_value(state[6], "(none)"));
        console.log("  Version:          " + get_value(state[7], "(none)"));
        console.log("  Package URI:      " + get_value(state[1], "(none)"));
        console.log("  State:            " + gtapi.fw_state_to_string(get_value(state, 0)));
        console.log("  Update Result:    " + gtapi.fw_result_to_string(get_value(state, 0)));
        console.log("  Bytes downloaded: " + get_value(state[30005], 0));

      }
    })
  })
  .parse(process.argv);
