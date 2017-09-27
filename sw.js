#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the state of the packages installed a device')
  .command('push',      'Push a new software package to a device')
  .command('activate',  'Activate an application on a device')
  .command('deactivate','Deactivate an application on a device')
  .command('uninstall', 'Uninstall an application from a device')
  .command('install',   'Install an application onto a device')
  .parse(process.argv);