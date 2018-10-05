#!/usr/bin/env node

var program = require('commander');

program
  .command('list',      'Show the all configured enviroinments')
  .command('set',       'Set the default environment for gtcli')
  .command('add',       'Add an environment to use with gtcli')
  .command('remove',    'Remove an environment from gtcli')
  .parse(process.argv);
