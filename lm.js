#!/usr/bin/env node

var program = require('commander');

program
  .command('show', 'Show the configuration for the specified Line Monitor')
  .command('set', 'Set a configuration parameter for the specified Line Monitor')
  .parse(process.argv);