#!/usr/bin/env node

var program = require('commander');

program
  .command('list',      'Show the all configured enviroinments')
  .command('set',       'Set the default environment for gtcli')
  .parse(process.argv);
