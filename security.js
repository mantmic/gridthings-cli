#!/usr/bin/env node

var program = require('commander');

program
  .command('add',              'Add the specified endpoint to the security configuration')
  .command('list',             'List the security configuration for all endpoints')
  .command('delete',           'Remove the security configuration for the endpoint')
  .parse(process.argv);