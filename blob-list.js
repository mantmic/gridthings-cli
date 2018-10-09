#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

function print_blob(object, urn)
{
  var instances = object.content.instances;

  console.info("Endpoint " + urn + " provides the following blobs:");
  for (var i = 0; i < instances.length; i++)
  { 
    var resources = {};
    instances[i].resources.map(function(i) { resources[i.id] = i.value; });

    console.info("  30007/" + i + ": " + resources[0]);
  }
  
  // console.info("Line Monitor " + urn);
  // console.info("  Alarm Visual Indication: " + lm_resources[1]);
  // console.info("  Line Voltage:            " + lm_resources[2]);
  // console.info("  Line Current:            " + lm_resources[3]);
  // console.info("  Line Temperature:        " + lm_resources[4]);
  // console.info("  Voltage Low Level:       " + lm_resources[5]);
  // console.info("  Voltage High Level:      " + lm_resources[6]);
  // console.info("  Voltage Low Time:        " + lm_resources[7]);
  // console.info("  Voltage High Time:       " + lm_resources[8]);
  // console.info("  Voltage Average Time:    " + lm_resources[9]);
  // console.info("  High Temperature Level:  " + lm_resources[10]);
  // console.info("  Low Battery Level:       " + lm_resources[11]);
  // console.info("  Current Average Time:    " + lm_resources[12]);
  // console.info("  Sensor Status:           " + lm_resources[13]);
  // console.info("  Battery Voltage:         " + lm_resources[14]);
  // console.info("  System Voltage:          " + lm_resources[15]);
  // console.info("  Context:                 " + lm_resources[16]);
  // console.info("  Test Events Period:      " + lm_resources[17]);
}

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    wrongArguments = false;
   
    if (program.verbose) 
    {
      gtapi.log_level = 1;
    }

    gtapi.core_get('30007', urn, server, function (result) 
    {
      var object = JSON.parse(result.text);
     
      if (program.json)
      {
        var json_obj = { "blobs" : object };
        console.info(JSON.stringify(json_obj, null, 2));
      }
      else
      {
        print_blob(object, urn);
      }
    }, function (error) {
      Helpers.displayError("getting blobs", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) 
{
  program.help();
}