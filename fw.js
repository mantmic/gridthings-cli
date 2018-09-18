#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the state of the firmware running on an endpoint')
  .command('cancel',    'Cancel a firmware download on an endpoint')
  .command('push',      'Push a new firmware image to the endpoint')
  .command('update',    'Update the firmware on the enpoint usind the previouslty pushed package')
  .command('autodeploy', 'Automatically push and update firmware on an endpoint' )
  .parse(process.argv);
