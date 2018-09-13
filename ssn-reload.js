#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
var the_server = null;
var helpers = require('./helpers.js');

function reload(server) 
{
  if (program.verbose) gtapi.log_level = 1;
  print_json = program.json;

  gtapi.ssn_reload_endpoints(server, function(response)
  { 
    if (print_json)
    {
      console.log(JSON.stringify(response, null, 2));
    }
    else
    {
      if (response.status == 200) 
      {
        console.log("OK");
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    }
  }, 
  function(error)
  {
    helpers.display_error("reloading endpoints", error);
  });
}

program
  .arguments('[server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(server) { the_server = server; })
  .parse(process.argv);


reload(the_server == null ? "." : the_server);