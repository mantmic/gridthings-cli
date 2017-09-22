#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the state of the firmware running on an endpoiont')
  .command('push',      'Push a new firmware image to the endpoint')
  .command('update',    'Update the firmware on the enpoint usind the previouslty pushed package')
  .parse(process.argv);