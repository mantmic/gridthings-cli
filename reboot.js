#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var the_server = null;
var the_urn = null;

function reboot(urn, server) 
{    
  if (program.verbose) 
  {
    gtapi.log_level = 1;
  }
  
  print_json = false;

  gtapi.core_exec("3/0/4", null, urn, server, function(response)
  {  
    if (response.status == 200)
    {
      console.info("device is rebooting");
    }
    else
    {
      console.log(response.status + " " + response.text);
    }
  }, function(error)
  {
    console.log("failed to reboot " + error);
  });
};

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) { the_server = server; the_urn = urn; })
  .parse(process.argv);
  
reboot(the_urn, the_server == null ? "." : the_server);