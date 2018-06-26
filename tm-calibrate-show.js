#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;

function print_transformer_monitor_calibration(tm_object, urn, phase)
{
  var lm_resources = {};
  tm_object.content.resources.map(function(i) { lm_resources[i.id] = i.value; });

  console.info("Transformer Monitor Calibration for phase " + phase + " on " + urn);
  console.info("  Phase                      " + lm_resources[0]);
  console.info("  IGAIN                      " + lm_resources[1]);
  console.info("  VGAIN                      " + lm_resources[2]);
  console.info("  IRMSOS                     " + lm_resources[3]);
  console.info("  VRMSOS                     " + lm_resources[4]);
  console.info("  PGAIN                      " + lm_resources[5]);
  console.info("  IFRMSOS                    " + lm_resources[6]);
  console.info("  VFRMSOS                    " + lm_resources[7]);
  console.info("  PHCAL0                     " + lm_resources[8]);
  console.info("  WATTOS                     " + lm_resources[9]);
  console.info("  VAROS                      " + lm_resources[10]);
  console.info("  FWATTOS                    " + lm_resources[11]);
  console.info("  FVAROS                     " + lm_resources[12]);
  console.info("  IRMS                       " + lm_resources[13]);
  console.info("  VRMS                       " + lm_resources[14]);
  console.info("  IFRMS                      " + lm_resources[15]);
  console.info("  VFRMS                      " + lm_resources[16]);
  console.info("  WATTHR_HI                  " + lm_resources[17]);
  console.info("  VARHR_HI                   " + lm_resources[18]);
  console.info("  Auto Polling               " + lm_resources[20]);
  console.info("  Calibration Current        " + lm_resources[22]);
  console.info("  Calibration Current Offset " + lm_resources[23]);
  console.info("  Calibration Voltage        " + lm_resources[24]);
  console.info("  Calibration Voltage Offset " + lm_resources[25]);
  console.info("  Calibration Angle          " + lm_resources[26]);
  console.info("  Current Error              " + lm_resources[27]);
  console.info("  Voltage Error              " + lm_resources[28]);
  console.info("  Current Voltage Angle      " + lm_resources[29]);

}


var phase_map = {
  red: 0,
  white: 1,
  blue: 2,
  neutral: 3
};

function phase_str_to_instance(phase)
{
  if (phase in phase_map)
  {
    return phase_map[phase];
  }
  console.error("invalid phase specified: " + phase);
  return null;
}

program
  .arguments('<phase> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(phase, urn, server) {
    wrongArguments = false;
    if (program.verbose) {
      gtapi.log_level = 1;
    }
    
    var phase_instance = phase_str_to_instance(phase);
    
    if (phase_instance != null)
    {
      gtapi.core_get('32001/' + phase_instance.toString(), urn, '.', function (tm_res) {
        var tm_object = JSON.parse(tm_res.text);
        if (program.json)
        {
          var json_obj = { "transformer_monitor_calibration" : lm_object};
          console.info(JSON.stringify(json_obj, null, 2));
        }
        else
        {
          print_transformer_monitor_calibration(tm_object, urn, phase);
        }
      }, function (error) {
        console.error("getting transformer monitor calibration: " + error);
      });
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}