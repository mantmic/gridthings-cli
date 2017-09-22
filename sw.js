#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the state of the packages installed an endpoiont')
  .command('push',      'Push a new software package to an endpoint')
  .command('activate',  'Activate an application on an endpoint')
  .command('deactivate','Deactivate an application on an endpoint')
  .command('uninstall', 'Uninstall an application from an endpoint')
  .parse(process.argv);