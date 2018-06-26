#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

function print_transformer_monitor(lm_object, urn)
{
  var lm_resources = {};
  lm_object.content.resources.map(function(i) { lm_resources[i.id] = i.value; });

  console.info("Transformer Monitor " + urn);
  console.info("  Dip Voltage:                     " + lm_resources[0]);
  console.info("  Dip Cycles:                      " + lm_resources[1]);
  console.info("  Swell Voltage:                   " + lm_resources[2]);
  console.info("  Swell Cycles:                    " + lm_resources[3]);
  console.info("  Overcurrent Threshold:           " + lm_resources[4]);
  console.info("  Single Phase:                    " + lm_resources[5]);
  console.info("  Phase No Load Poll Time:         " + lm_resources[6] + "s");
  console.info("  Over Current Status Poll Time:   " + lm_resources[7] + "s");
  console.info("  Phase Peak Select:               " + lm_resources[8]);
  console.info("  Overcurrent Enable:              " + lm_resources[9]);
  console.info("  Temperature Update Time:         " + lm_resources[10]);
  console.info("  Power Update Time:               " + lm_resources[11]);
  console.info("  Power Sign:                      " + lm_resources[12]);
  console.info("  Active Power Accumulation Mode:  " + lm_resources[13]);
  console.info("  Rective Power Accumulation Mode: " + lm_resources[14]);
  console.info("  Selection 3 Wire 4 Wire:         " + lm_resources[15]);
  console.info("  Frequency Select:                " + lm_resources[16]);
  console.info("  Voltage Conversion Constant:     " + lm_resources[17]);
  console.info("  Current Conversion Constant:     " + lm_resources[18]);
  console.info("  Power Conversion Constant:       " + lm_resources[19]);
  console.info("  Energy Conversion Constant:      " + lm_resources[20]);
  console.info("  Context:                         " + lm_resources[21]);
  console.info("  Temperature:                     " + lm_resources[22]/100 + "°C");
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

    gtapi.core_get('32000/0/', urn, server, function (tm_res) {
      var tm_object = JSON.parse(tm_res.text);
      if (program.json)
      {
        var json_obj = { "transformer_monitor" : lm_object};
        console.info(JSON.stringify(json_obj, null, 2));
      }
      else
      {
        print_transformer_monitor(tm_object, urn);
      }
    }, function (error) {
      Helpers.displayError("getting transformer monitor", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}