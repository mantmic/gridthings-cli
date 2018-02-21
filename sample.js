#!/usr/bin/env node

var program = require('commander');

program
  .command('start', 'Start recording samples for the specified sample stream')
  .command('stop', 'Stop recording samples for the specified sample stream')
  .command('offset', 'Set the offset from the period for the specified sample stream')
  .command('period', 'Set the recording period for the specified sample stream')
  .command('show', 'Show the sample configuration on the specified device')
  .parse(process.argv);