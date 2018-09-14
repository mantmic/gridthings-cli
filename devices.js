#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var the_server = null;


function time_to_string(ct)
{
  var date = new Date(ct);

  return date.toString();
}

function devices(server)
{
  if (program.verbose)
  {
    gtapi.log_level = 1;
  }

  print_json = (program.json == true);
  gtapi.list_devices(server, function(response)
  {
    if (response.status == 200) {
      var devices = JSON.parse(response.text);
      if (devices.length == 0){
        console.log("no devices are registered");
      } else {
        if (print_json) {
          console.log(JSON.stringify(devices, null, 2));
        } else {
          for (var i = 0; i < devices.length; i++){
            console.log(devices[i].endpoint + " last updated " + time_to_string(devices[i].lastUpdate));
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
