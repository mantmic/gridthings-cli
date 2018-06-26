#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var helpers = require('./helpers.js');

var wrongArguments = true;

var settings = {};

settings.lifetime = { parse: parseInt, uri: "1/0/1", id : 1 };

function is_valid_setting(setting)
{
  return setting in settings;
}

program
  .arguments('<setting> <value> <urn> [server]')
  .description(
    'Set a server resource value on the specified endpoint\n' +
    '\n' +
    '  Valid settings are:\n' +
    '    lifetime\n'
    )
  .option('-v, --verbose', 'Be verbose')
  .action(function(setting, value, urn, server) {
    wrongArguments = false;
   
    if (program.verbose) {
      gtapi.log_level = 1;
    }

    if (is_valid_setting(setting))
    {

      gtapi.core_put(settings[setting].uri, {id: settings[setting].id, value: settings[setting].parse(value) }, urn, server, function () {
        console.info('endpoint ' + setting + " on " + urn + " is now " + value);
      }, function (error) {
        helpers.display_error("writting resource", error);
      });
    }
    else
    {
      console.error("invalid setting name");
    }
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}