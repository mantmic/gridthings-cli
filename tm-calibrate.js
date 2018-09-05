#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');
var Spinner = require('cli-spinner').Spinner;
var prompt = require('prompt');
var colors = require("colors/safe");

prompt.message = ""
prompt.delimiter = ""
prompt.start();

var wrongArguments = true;

var phase_map = {
  red: 0,
  white: 1,
  blue: 2,
  neutral: 3
};

function phase_str_to_instance(phase)
{
  if (phase == "show") return null;
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
  .command('show', 'Show the calibrations for the specified Transformer Monitor phase.')
  .action(function(phase, urn, server) {
    wrongArguments = false;

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    var phase_instance = phase_str_to_instance(phase);

    if (phase_instance != null)
    {
      gtapi.core_get('32001/' + phase_instance.toString(), urn, '.', function (tm_res) 
      {
        var tm_object = JSON.parse(tm_res.text);
        var lm_resources = {};
        tm_object.content.resources.map(function(i) { lm_resources[i.id] = i.value; });

        var i_nominal = lm_resources[22];
        var v_nominal = lm_resources[24];
        gtapi.core_exec('32001/' + phase_instance + '/19', null, urn, server, function (res) {
          console.info("cleared existing calibration");

        prompt.get(
          {
            properties: {
              confirm: {
                description: colors.green("set the current to " + Math.floor(i_nominal/1000) + "A and voltage to " + Math.floor(v_nominal / 1000) + "v and press enter to continue")
              }
            }
          }, function (err, result) 
          {
            gtapi.core_exec('32001/' + phase_instance + '/21', null, urn, server, function (res) {
              var spinner = new Spinner('calibrating (wait 60s).. %s');
              spinner.setSpinnerString('|/-\\');
              spinner.start();
              setTimeout(function()
              {
                spinner.stop(false);console.info("done");
              
                prompt.get(
                {
                  properties: {
                    confirm: {
                      description: colors.green("now set the current to 1A and voltage to 200v and press enter to continue")
                    }
                  }
                }, function (err, result) 
                {
                  spinner = new Spinner('calibrating offset.. %s');
                  spinner.setSpinnerString('|/-\\');
                  spinner.start();
                  gtapi.core_exec('32001/' + phase_instance + '/30', null, urn, server, function (res) {
                    setTimeout(function()
                    {
                      spinner.stop(false);console.info("done");
                    }, 11000);
                  }, function (error) {
                    Helpers.displayError("calibrating transformer monitor offset" + phase + " phase", error);
                  });
                });
              }, 63000);
            }, function (error) {
              Helpers.displayError("calibrating transformer monitor " + phase + " phase", error);
            });
          });
        }, function (error) {
            Helpers.displayError("clearing transformer monitor calibration for " + phase + " phase", error);
        });
      });
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}