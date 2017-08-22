#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');


program
  .arguments('<server>')
  .option('-v, --verbose', 'Be verbose')
  .action(function(server) {
    gtapi.log_level = 0;//program.verbose;
    print_json = false;
    gtapi.list_devices(server, function(response){
      
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
    })
  })
  .parse(process.argv);