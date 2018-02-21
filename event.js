#!/usr/bin/env node

var program = require('commander');

program
  .command('realtime', 'Set the events to be notifed to the server immediately')
  .command('scheduled', 'Set the events to be notifed to the server on the next delviery schedule')
  .command('show', 'Show the event configuration on the specified device')
  .parse(process.argv);