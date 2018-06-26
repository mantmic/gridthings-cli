#!/usr/bin/env node

var program = require('commander');

program
  .command('set', 'Set a configuration parameter on the specified Transformer Monitor.')
  .command('show', 'Show the configuration for the specified Transformer Monitor.')
  .command('calibrate', 'Calibrate the specified phase on the the specified Transformer Monitor.')
  .parse(process.argv);