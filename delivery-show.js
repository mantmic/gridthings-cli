#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

// Schedule Start Time           /30003/0/0
// Schedule UTC Offset           /30003/0/1
// Delivery Frequency            /30003/0/2
// Randomised Delivery Window    /30003/0/3
// Number of Retries             /30003/0/4
// Retry Period                  /30003/0/5

function print_delivery(delivery_object)
{
  console.info("Delivery Schedule ");
  var delivery_resources = {};
  delivery_object.resources.map(function(i) { delivery_resources[i.id] = i.value; });

  /* Extracted Value, based on resource id */  
  console.info("  Schedule Start Time:          " + delivery_resources[0]);
  console.info("  Schedule UTC Offset:          " + delivery_resources[1]);
  console.info("  Delivery Frequency:           " + delivery_resources[2]);
  console.info("  Randomised Delivery Window:   " + delivery_resources[3]);
  console.info("  Number of Retries:            " + delivery_resources[4]);
  console.info("  Retry Period:                 " + delivery_resources[5]); 
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

    gtapi.core_get('30003/0', urn, server, function (sample_res) {
     
      var delivery_response = JSON.parse(sample_res.text);

      if (program.json)
      {
        console.info(JSON.stringify(delivery_response, null, 2));
      }
      else
      {
        print_delivery(delivery_response.content);
      }
     
    }, function (error) {
      helpers.display_error("reading delivery object", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}