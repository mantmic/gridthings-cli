#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var helpers = require('./helpers.js');

var wrongArguments = true;


// Level /31000/0/0
// Time  /31000/0/1
function print_ccs(cc_objects)
{
  var ccs = cc_objects.instances;

  for (var i = 0; i < ccs.length; i ++)
  {
    console.info("");
    console.info("  Current Curve " + i + ":");
    var cc_resources = {};
    var cc = ccs[i];
    cc.resources.map(function(i) { cc_resources[i.id] = i.value; });
  
    console.info("    Level:   " + cc_resources[0]);
    console.info("    Time:    " + cc_resources[1]);
  }


}
// Alarm Visual Indication      /31001/0/1
// Line Voltage                 /31001/0/2
// Line Current                 /31001/0/3
// Line Temperature             /31001/0/4
// Voltage Low Level            /31001/0/5
// Voltage High Level           /31001/0/6
// Voltage Low Time             /31001/0/7
// Voltage High Time            /31001/0/8
// Voltage Average Time         /31001/0/9
// High Temperature Level       /31001/0/10
// Low Battery Level            /31001/0/11
// Current Average Time         /31001/0/12
// Sensor Status                /31001/0/13
// Battery Voltage              /31001/0/14
// System Voltage               /31001/0/15
// Context                      /31001/0/16

function print_lm(lm_object, cc_objects)
{
  console.info("Line Monitor ");
  var lm_resources = {};
  lm_object.resources.map(function(i) { lm_resources[i.id] = i.value; });

  /* Extracted Value, based on resource id */  
  console.info("  Alarm Visual Indication:   " + lm_resources[1]);
  console.info("  Line Voltage:              " + lm_resources[2]);
  console.info("  Line Current:              " + lm_resources[3]);
  console.info("  Line Temperature:          " + lm_resources[4]);
  console.info("  Voltage Low Level:         " + lm_resources[5]);
  console.info("  Voltage High Level:        " + lm_resources[6]);
  console.info("  Voltage Low Time:          " + lm_resources[7]);
  console.info("  Voltage High Time:         " + lm_resources[8]);
  console.info("  Voltage Average Time;      " + lm_resources[9]);
  console.info("  High Temperature Level:    " + lm_resources[10]);
  console.info("  Low Battery Level:         " + lm_resources[11]);
  console.info("  Current Average Time:      " + lm_resources[12]);
  console.info("  Sensor Status:             " + lm_resources[13]);
  console.info("  Battery Voltage:           " + lm_resources[14]);
  console.info("  System Voltage:            " + lm_resources[15]);
  console.info("  Context:                   " + lm_resources[16]);

  print_ccs(cc_objects);
}

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    
    wrongArguments = false;
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_get('31001/0', urn, server, function (sample_res) {
     
      var lm_response = JSON.parse(sample_res.text);

      gtapi.core_get('31000', urn, server, function (sample_res) {

        var cc_response = JSON.parse(sample_res.text);

        if (program.json)
        {
          console.info(JSON.stringify({lm : lm_response, cc: cc_response}, null, 2));
        }
        else
        {
          print_lm(lm_response.content, cc_response.content);
        }
      }, function (error) {
      helpers.display_error("reading current curve objects", error);
    });
    }, function (error) {
      helpers.display_error("reading line monitor object", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}