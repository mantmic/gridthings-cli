#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

program
  .arguments('<endpoint> <resource> <newest> <oldest> <server>')
  .option('-v, --verbose', 'Be verbose')
  .action(function(endpoint, resource, newest, oldest, server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = true;

    gtapi.history_get_for_resource(endpoint, resource, newest, oldest, server, function(data)
    {
      try
      {
        if (print_json)
        {
          console.log(JSON.stringify(data, null, 2));
        }
      }
      catch(e)
      {
        console.log(response.text);
      }  
    })
  })
  .parse(process.argv);