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

  /* Extracted Value, based on resource id */
  var dred_context                  = dred_resources[0];
  var dred_class                    = dred_resources[1];
  var dred_utility_enrolment_group  = dred_resources[2];
  //  dred_reset /33000/0/3
  var dred_enabled                  = dred_resources[4];
  var dred_events_enabled           = dred_resources[5];
  var dred_UTC_Offset               = dred_resources[6];
  var dred_Current_Mode             = dred_resources[7];

  console.info("DRED " + urn);
  console.info("context:        " + dred_context);
  console.info("class:          " + class_to_string(dred_class));
  console.info("enabled:        " + dred_enabled);
  console.info("events enabled: " + dred_events_enabled);
  console.info("UTC Offset:     " + dred_UTC_Offset);
  console.info("Current Mode:   " + mode_to_string(dred_Current_Mode));
  console.info("utility enrolment group : " + dred_utility_enrolment_group);
}

function schedule_to_string(schedule)
{
  switch (schedule)
  {
    case 0: return "Immediate: Action the DR event as soon as the start command is received by the DRED.";
    case 1: return "Once: Action the DR event at a time specified in the future. ";
    case 2: return "Daily: Action the DR event each day at the specified time";
    case 3: return "Week Days: Action the DR event each weekdays at the specified time";
    case 4: return "Week Ends: Action the DR event each weekends at the specified time";
    default: return "None";
  }
  return "None";
}

function utc_time_to_string(utc_time_s)
{
  if (utc_time_s == 0) return "never";

  return new Date(utc_time_s * 1000).toString();
}

function time_hh_mm_ss_to_string(time_s)
{
  var date = new Date(time_s * 1000);
  var hh = date.getUTCHours();
  var mm = date.getMinutes();
  var ss = date.getUTCSeconds();

  return hh+" hours, "+mm+" minutes, "+ss+" seconds";
}


function start_time_to_string(time, schedule)
{

  switch (schedule)
  {
    case 0: return utc_time_to_string(time);
    case 1: return utc_time_to_string(time);
    case 2: return time_hh_mm_ss_to_string(time)+" from midnight";
    {
      var date = new Date(60*60*1000)
    }
  }

  return "Not Implemented Yet ("+time+")";
}

function print_schedule(schedule_object)
{
  var schedules = schedule_object.content.instances;

  for (var i = 0; i < schedules.length; i ++)
  {
    console.info("Schedule " + i);
    var schedule_resources = {}
    schedules[i].resources.map(function(i) { schedule_resources[i.id] = i.value; });

    /* Extracted Value, based on resource id */
    var io_mode         = schedule_resources[0];
    var schedule_type   = schedule_resources[1];
    var start_time_s    = schedule_resources[2];
    var start_window_s  = schedule_resources[3];
    var min_duration_s  = schedule_resources[4];
    var max_duration_s  = schedule_resources[5];
    //  start : executable resource /33001/0/6
    var active_mode     = schedule_resources[7];
    var enabled         = schedule_resources[8];
    var expiry_UTC      = schedule_resources[9];
    //  stop : executable resource /33001/0/10

    console.info("  Mode:         " + mode_to_string(io_mode));
    console.info("  Schedule:     " + schedule_to_string(schedule_type));
    console.info("  Start Time:   " + start_time_to_string(start_time_s, schedule_type));
    console.info("  Start Window: " + start_window_s + "s");
    console.info("  Min Duration: " + min_duration_s + "s");
    console.info("  Max Duration: " + max_duration_s + "s");
    console.info("  Active:       " + active_mode);
    console.info("  Enabled:      " + enabled);
    console.info("  Expiry:       " + utc_time_to_string(expiry_UTC));
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