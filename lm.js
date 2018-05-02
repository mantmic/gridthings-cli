#!/usr/bin/env node

var program = require('commander');

program
  .command('set', 'Set a configuration parameter on the specified Line Monitor.')
  .command('show', 'Show the configuration for the specified Line Monitor.')
  .parse(process.argv);