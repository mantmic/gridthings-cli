#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the device object for an endpoiont')
  .command('reboot',    'Reboot the specified endpoiont')
  .command('format',    'Format the device\'s file systems')
  .parse(process.argv);