#!/usr/bin/env node

var program = require('commander');

var gtssn = require('./gt-ssn-api.js');


program
  .arguments('<session_uri>')
  .action(function(session_uri) {
    
    gtssn.delete_sessions(session_uri, function(response)
    { 
      console.log("done");
    })
  })
  .parse(process.argv);