#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var defaults = require('./defaults.js');
var bmp = require("./bmp-565.js");

const fs = require('fs');
var wrongArguments = true;

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) {
    wrongArguments = false;
   
    if (program.verbose) 
    {
      gtapi.log_level = 1;
    }
  
    gtapi.get_latest_value(urn, "30007/0/1", server,
      function(response) 
      {
        var raw_image = Buffer.from(response.value, 'base64');

        var bmp_data = { data:raw_image, width:320, height:240 };

        var bmp_file = bmp(bmp_data);

        fs.writeFileSync("tmp.bmp", bmp_file.data);

      },
      function(error)
      {
        console.log(error);
      });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}