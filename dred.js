#!/usr/bin/env node

var program = require('commander');

program
  .command('immediate', 'Configure the DRED to action a DR event as soon as the start command is received by the DRED.')
  .command('once', 'Configure the DRED to action a DR event at a time specified in the future.')
  .command('daily', 'Configure the DRED to action a DR event each day at the specified time.')
  .command('start', 'Force the start the DR event now')
  .command('stop', 'Force the stop the DR event now')
  .command('disable', 'Disable the specified DR schedule')
  .command('enable', 'Enable the specified DR schedule')
  .command('deactivate', 'De-acivate all DR events on this DRED')
  .command('activate', 'Acivate all DR events on this DRED, events will hounr their schedule.')
  .command('context', 'Commission the DRED, providing business context.')
  .command('show', 'Show the configuration for this DRED')
  .parse(process.argv);