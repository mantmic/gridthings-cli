#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show outstanding commands for an endpoint')
  .command('push',      'Push a new command to an endpoint')
  .command('delete',    'Delete an outstanding command for an endpoint')
  .parse(process.argv);
