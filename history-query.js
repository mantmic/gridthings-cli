#!/usr/bin/env node

var program = require('commander');
var defaults = require("./defaults.js");
var gtapi = require('./gt-api.js');

program
  .arguments('<path> <query> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(path, query, server) {
    if (program.verbose) gtapi.log_level = 1;
    gtapi.history_get(path, [query], defaults.check_server_name(server), function(data)
    {
      try
      {
        console.log(JSON.stringify(data, null, 2));
      }
      catch(e)
      {
        console.log(e.message);
      }  
    }, 
    function(e)
    {
      console.log(e.message);
    })
  })
  .parse(process.argv);