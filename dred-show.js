#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

function class_to_string(dred_class)
{
  switch (dred_class)
  {
    case 0 : return "HVAC compressor or furnace";
    case 1 : return "Strip Heaters/Baseboard Heaters/Water Heater";
    case 2 : return "Pool Pump/Spa/Jacuzzi";
    case 4 : return "Smart Appliances";
    case 5 : return "Irrigation Pump";
    case 6 : return "Managed Commercial & Industrial (C&I) loads";
    case 7 : return "Simple misc. (Residential On/Off) loads";
    case 8 : return "Exterior Lighting";
    case 9 : return "Interior Lighting";
    case 10: return "Electric Vehicle";
    case 11: return "Generation Systems";
    case 12: return "Reserved";
    default: return "unknown";
  }
  return "unknown";
}

function mode_to_string(mode)
{
  switch (mode)
  {
    case 1 : return "No load, or minimal load.";
    case 2 : return "Restrict load to no greater than 50% of a reference value.";
    case 3 : return "Restrict load to no greater than 75% of a reference value.";
    default: return "No load control is active.";
  }
}

function print_dred(dred_object, urn)
{
  var dred_resources = {} 
  dred_object.content.resources.map(function(i) { dred_resources[i.id] = i.value; });

  console.info("DRED " + urn);
  console.info("context:        " + dred_resources[0]);
  console.info("class:          " + class_to_string(dred_resources[1]));
  console.info("enabled:        " + dred_resources[4]);
  console.info("events enabled: " + dred_resources[4]);
  console.info("UTC Offset:     " + dred_resources[6]);
  console.info("Current Mode:   " + mode_to_string(dred_resources[7]));
}

function schedule_to_string(schedule)
{
  switch (schedule)
  {
    case 1: return "Immediate: Action the DR event as soon as the start command is received by the DRED.";
    case 2: return "Once: Action the DR event at a time specified in the future. ";
    case 3: return "Daily: Action the DR event each day at the specified time";
    default: return "None";
  }
  return "None";
}

function utc_time_to_string(time)
{
  if (time == 0) return "never";
 
  return new Date(time * 1000).toString();
}

function start_time_to_string(time, schedule)
{

  switch (schedule)
  {
    case 1: return utc_time_to_string(time);
    case 2: return utc_time_to_string(time);
    case 3: return (new Date).clearTime().addSeconds(time).toString('H:mm:ss');
  }

  return utc_time_to_string(time);
}

function print_schedule(schedule_object)
{
  var schedules = schedule_object.content.instances;
  
  for (var i = 0; i < schedules.length; i ++)
  {
    console.info("Schedule " + i);
    var schedule_resources = {} 
    schedules[i].resources.map(function(i) { schedule_resources[i.id] = i.value; });

    console.info("  Mode:         " + mode_to_string(schedule_resources[0]));
    console.info("  Schedule:     " + schedule_to_string(1));
    console.info("  Start Time:   " + start_time_to_string(schedule_resources[2]));
    console.info("  Start Window: " + schedule_resources[3]+ "s");
    console.info("  Min Duration: " + schedule_resources[4]+ "s");
    console.info("  Max Duration: " + schedule_resources[5]+ "s");
    console.info("  Active:       " + schedule_resources[7]);
    console.info("  Enbled:       " + schedule_resources[8]);
    console.info("  Expiry:       " + utc_time_to_string(schedule_resources[9]));
  }
}


program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    wrongArguments = false;
    var values = Helpers.convertArgumentsToUsedValues({urn, server});

    Helpers.checkDredArguments(values);

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_get('33000/0/', urn, server, function (dred_res) {
      gtapi.core_get('33001', urn, server, function (schedule_res) {

        var dred_object = JSON.parse(dred_res.text);
        var schedule_object = JSON.parse(schedule_res.text);
        if (program.json)
        {
          var json_obj = { "schedule" : schedule_object, "dred" : dred_object};
          console.info(JSON.stringify(json_obj, null, 2));
        }
        else
        {
          print_dred(dred_object, urn);
          print_schedule(schedule_object);
        }

      }, function (error) {
        Helpers.displayError(error);
      });
    }, function (error) {
      Helpers.displayError(error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}