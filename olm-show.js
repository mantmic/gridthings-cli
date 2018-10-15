#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

function print_olm(olm_object, urn)
{
  var olm_resources = {};
  olm_object.content.resources.map(function(i) { olm_resources[i.id] = i.value; });

  console.info("Oil Level Monitor " + urn);
  console.info("  Name:           " + olm_resources[0]);
  console.info("  Crop X:         " + olm_resources[1]);
  console.info("  Crop Y:         " + olm_resources[2]);
  console.info("  Crop Width:     " + olm_resources[3]);
  console.info("  Crop Height:    " + olm_resources[4]);
  console.info("  JPEG Quality:   " + olm_resources[5]);
  console.info("  LED 1:          " + olm_resources[6]);
  console.info("  LED 2:          " + olm_resources[7]);
  console.info("  LED 3:          " + olm_resources[8]);
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

    gtapi.core_get('30009/0', urn, server, function (olm_res) {

      console.log(olm_res.text);
      var olm_object = JSON.parse(olm_res.text);
      if (program.json)
      {
        var json_obj = { "olm" : olm_object};
        console.info(JSON.stringify(json_obj, null, 2));
      }
      else
      {
        print_olm(olm_object, urn);
      }
    }, 
    function (error) 
    {
      Helpers.displayError("getting olm object", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}
