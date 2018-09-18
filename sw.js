#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the state of the packages installed an endpoint')
  .command('push',      'Push a new software package to an endpoint')
  .command('cancel',    'Cancel and active firmwre download on an endpoint')
  .command('activate',  'Activate an application on an endpoint')
  .command('deactivate','Deactivate an application on an endpoint')
  .command('uninstall', 'Uninstall an application from an endpoint')
  .command('install',   'Install an application onto an endpoint')
  .command('autodeploy',   'Run automated software deployment of an application onto an endpoint')
  .parse(process.argv);
