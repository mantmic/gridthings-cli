#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var the_server = null;

function devices(server) 
{    
  if (program.verbose) 
  {
    gtapi.log_level = 1;
  }
  
  print_json = false;
  gtapi.list_devices(server, function(response)
  {  
    if (response.status == 200)
    {
      var devices = JSON.parse(response.text);
      if (devices.length == 0) console.log("no devices are registered");
      else
      {
        for (var i = 0; i < devices.length; i++)
        {
          if (print_json)
          {
            console.log(devices[i]);
          }
          else
          {
            console.log(devices[i].endpoint + " last updated " + devices[i].lastUpdate);
          }
        }
      }
    }
    else
    {
      console.log(response.status + " " + response.text);
    }
  });
};

program
  .arguments('<server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(server) { the_server = server; })
  .parse(process.argv);
  
devices(the_server == null ? "." : the_server);