#!/usr/bin/env node

var program = require('commander');

program
  .command('show', 'Show the delivery configuration for the specified device')
  .command('set', 'Set the delivery configuration for the specified Line Monitor')
  .parse(process.argv);