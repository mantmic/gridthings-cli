#!/usr/bin/env node

var program = require('commander');

program
  .command('add',      'Add an SSN endpoint to be manages by the specified instance')
  .command('remove',   'Remove an SSN endpoint from management by the specified instance')
  .command('list',     'List the endpoints managed by the specified instance')
  .command('reload',   'Ask the Gridthings Edge instance to reload the endpoint configuration')
  .command('poll',     'Force a poll of the specified endpoint')
  .parse(process.argv);