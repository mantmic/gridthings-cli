#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the device object for an endpoiont')
  .command('reboot',    'Reboot the specified endpoiont')
  .parse(process.argv);