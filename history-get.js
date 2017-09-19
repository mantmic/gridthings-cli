#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<endpoint> <resource> <newest> <oldest> <server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(endpoint, resource, newest, oldest, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    delimeter = ": ";
    gtapi.history_get_for_resource(endpoint, resource, newest, oldest, server, function(data)
    {
      try
      {
        if (print_json)
        {
          console.log(JSON.stringify(data, null, 2));
        }
        else
        {
          console.log(resource + ":");
          for (var i = 0; i < data.length; i++)
          {
            console.log("  " + data[i].timestamp + delimeter + data[i].value);
          }
        }
      }
      catch(e)
      {
        console.log(response.text);
      }  
    })
  })
  .parse(process.argv);