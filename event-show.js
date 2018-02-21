#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var helpers = require('./helpers.js');

var wrongArguments = true;


// Event Name                    /30001/300/1
// Event Type                    /30001/300/2
// Realtime                      /30001/300/3
// Alarm State                   /30001/300/4
// Maximum Event Count           /30001/300/9
// Maximum Event Period          /30001/300/10
// Latest Delivered Event Time   /30001/300/11
// Latest Recorded Event Time    /30001/300/12
// Clear Alarm                   /30001/300/14
// Auto Clear Alarm              /30001/300/15
// Event Code                    /30001/300/4010
// Latest Payload                /30001/300/4014
          
function print_event(event_object)
{
  console.info("Event " + event_object.id);
  var event_resources = {};
  event_object.resources.map(function(i) { event_resources[i.id] = i.value; });

  /* Extracted Value, based on resource id */
  console.info("  Event Name:                  " + event_resources[1]);
  console.info("  Event Type:                  " + event_resources[2]);
  console.info("  Realtime:                    " + event_resources[3]);
  console.info("  Alarm State:                 " + event_resources[4]);
  console.info("  Maximum Event Count:         " + event_resources[9]);
  console.info("  Maximum Event Period:        " + event_resources[10]);
  console.info("  Latest Delivered Event Time: " + event_resources[11]);
  console.info("  Latest Recorded Event Time:  " + event_resources[12]);
  console.info("  Auto Clear Alarm:            " + event_resources[15]);
  console.info("  Event Code:                  " + event_resources[4010]);
}

function print_events(event_response)
{
  var event_objects = event_response.content.instances;

  for (var i = 0; i < event_objects.length; i ++)
  {
    print_event(event_objects[i]);
  }
}

program
  .arguments('<urn> [event] [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, event, server) {
    
    wrongArguments = false;
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var get_uri = '30001' + (event != undefined ? ("/" + event) : "");

    gtapi.core_get(get_uri, urn, server, function (event_res) {
     
      var event_response = JSON.parse(event_res.text);
      if (program.json)
      {
        console.info(JSON.stringify(event_response, null, 2));
      }
      else
      {
        if (event != undefined)
        {
          print_event(event_response.content);
        }
        else
        {
          print_events(event_response);
        }
      }
    }, function (error) {
      helpers.display_error("reading event objects", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}