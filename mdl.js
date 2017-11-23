#!/usr/bin/env node

var program = require('commander');

program
  .command('show',    'Show the configuration for the specified RMU')
  .command('config',  'Push a new configuration for an RMU')
  .parse(process.argv);