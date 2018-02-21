#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

// {
//   "status": "CONTENT",
//   "content": {
//     "id": 30000,
//     "instances": [
//       {
//         "id": 304,
//         "resources": [
//           {
//             "id": 0,
//             "value": "Accumulated Reactive Power Total"
//           },
//           {
//             "id": 1,
//             "value": 60
//           },
//           {
//             "id": 2,
//             "value": 0
//           },
//           {
//             "id": 4,
//             "value": "1970-01-01T00:00:00Z"
//           },
//           {
//             "id": 5,
//             "value": "2018-02-19T13:17:00Z"
//           },
//           {
//             "id": 6,
//             "value": "2018-02-20T21:00:00Z"
//           },
//           {
//             "id": 7,
//             "value": "2018-02-20T21:34:00Z"
//           },
//           {
//             "id": 12,
//             "value": true
//           },
//           {
//             "id": 4014,
//             "value": [
//               "0",
//               "2",

//Name                      /30000/300/0
//Interval Period           /30000/300/1
//Interval Offset           /30000/300/2
//Collection Start time     /30000/300/4
//Oldest Recorded Interval  /30000/300/5
//Latest Delivered Interval /30000/300/6
//Latest Recorded Interval  /30000/300/7
//stop                      /30000/300/10
//start                     /30000/300/11
//Recording Enabled         /30000/300/12
//Latest Payload            /30000/300/4014

function print_sample(sample_object)
{
  console.info("Sample Stream " + sample_object.id);
  var sample_resources = {};
  sample_object.resources.map(function(i) { sample_resources[i.id] = i.value; });

  /* Extracted Value, based on resource id */
  console.info("  Name:                      " + sample_resources[0]);
  console.info("  Interval Period:           " + sample_resources[1]);
  console.info("  Interval Offset:           " + sample_resources[2]);
  console.info("  Collection Start time:     " + sample_resources[4]);
  console.info("  Oldest Recorded Interval:  " + sample_resources[5]);
  console.info("  Latest Delivered Interval: " + sample_resources[6]);
  console.info("  Latest Recorded Interval:  " + sample_resources[7]);
  console.info("  Recording Enabled:         " + sample_resources[12]);
}

function print_samples(sample_response)
{
  var sample_objects = sample_response.content.instances;

  for (var i = 0; i < sample_objects.length; i ++)
  {
    print_sample(sample_objects[i]);
  }
}


program
  .arguments('<urn> [sample] [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, sample, server) {
    
    wrongArguments = false;
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var get_uri = '30000' + (sample != undefined ? ("/" + sample) : "");

    gtapi.core_get(get_uri, urn, server, function (sample_res) {
     
      var sample_response = JSON.parse(sample_res.text);
      if (program.json)
      {
        console.info(JSON.stringify(sample_response, null, 2));
      }
      else
      {
        if (sample != undefined)
        {
          print_sample(sample_response.content);
        }
        else
        {
          print_samples(sample_response);
        }
      }
    }, function (error) {
      helpers.display_error("reading sample objects", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}