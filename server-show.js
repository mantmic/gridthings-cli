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
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;

    gtapi.server_get(urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        var state = response[0];

        console.log("Server:");
        console.log("  Short Server ID:        " + get_value(state[0],""));
        console.log("  Lifetime:               " + get_value(state[1],""));
        console.log("  Default Minimum Period: " + get_value(state[2],""));
        console.log("  Default Maximum Period: " + get_value(state[3],""));
        console.log("  Disable:                " + get_value(state[4],""));
        console.log("  Disable Timeout:        " + get_value(state[5],""));
        console.log("  Notification Storing:   " + get_value(state[6],""));
        console.log("  Binding:                " + get_value(state[7]));
      }
    })
  })
  .parse(process.argv);
