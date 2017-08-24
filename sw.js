#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the packages installed a device')
  .command('push',      'Install a package on a device')
  .command('list',      'List packages available for installation')
  .command('publish',   'Publish a package to make it available for installation')
  .command('delete',    'Delete a package from the server')
  .command('reload',    'Force the software server to reload packages from the package store')
  .command('activate',  'Activate an application on a device')
  .command('deactivate','Deactivate an application on a device')
  .command('uninstall', 'Uninstall an application from a device')
  .parse(process.argv);