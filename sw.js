#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the state of the packages installed an endpoiont')
  .command('push',      'Install a package on an endpoint')
  .command('list',      'List packages available for installation')
  .command('publish',   'Publish a package to make it available for installation')
  .command('delete',    'Delete a package from the server')
  .command('reload',    'Force the software server to reload packages from the package store')
  .command('activate',  'Activate an application on an endpoint')
  .command('deactivate','Deactivate an application on an endpoint')
  .command('uninstall', 'Uninstall an application from an endpoint')
  .parse(process.argv);