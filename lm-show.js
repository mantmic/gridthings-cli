#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

function print_line_monitor(lm_object, urn)
{
  var lm_resources = {};
  lm_object.content.resources.map(function(i) { lm_resources[i.id] = i.value; });

  console.info("Line Monitor " + urn);
  console.info("  Alarm Visual Indication: " + lm_resources[1]);
  console.info("  Line Voltage:            " + lm_resources[2]);
  console.info("  Line Current:            " + lm_resources[3]);
  console.info("  Line Temperature:        " + lm_resources[4]);
  console.info("  Voltage Low Level:       " + lm_resources[5]);
  console.info("  Voltage High Level:      " + lm_resources[6]);
  console.info("  Voltage Low Time:        " + lm_resources[7]);
  console.info("  Voltage High Time:       " + lm_resources[8]);
  console.info("  Voltage Average Time:    " + lm_resources[9]);
  console.info("  High Temperature Level:  " + lm_resources[10]);
  console.info("  Low Battery Level:       " + lm_resources[11]);
  console.info("  Current Average Time:    " + lm_resources[12]);
  console.info("  Sensor Status:           " + lm_resources[13]);
  console.info("  Battery Voltage:         " + lm_resources[14]);
  console.info("  System Voltage:          " + lm_resources[15]);
  console.info("  Context:                 " + lm_resources[16]);
  console.info("  Test Events Period:      " + lm_resources[17]);
}



function print_current_curve(current_curve_object)
{
  var ccs = current_curve_object.content.instances;

  for (var i = 0; i < ccs.length; i ++)
  {
    console.info("");
    console.info("  Curve Point " + i);
    var cc_resources = {};
    ccs[i].resources.map(function(i) { cc_resources[i.id] = i.value; });

    console.info("    Level:               " + cc_resources[0]);
    console.info("    Time:                " + cc_resources[1]);
  }
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

    gtapi.core_get('31001/0/', urn, server, function (lm_res) {
      gtapi.core_get('31000', urn, server, function (cc_res) {

        var lm_object = JSON.parse(lm_res.text);
        var cc_object = JSON.parse(cc_res.text);
        if (program.json)
        {
          var json_obj = { "line_monitor" : lm_object, "current_curve" : cc_object};
          console.info(JSON.stringify(json_obj, null, 2));
        }
        else
        {
          print_line_monitor(lm_object, urn);
          print_current_curve(cc_object);
        }

      }, function (error) {
        Helpers.displayError("getting current curve", error);
      });
    }, function (error) {
      Helpers.displayError("getting line monitor", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}