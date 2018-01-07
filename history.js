#!/usr/bin/env node

var program = require('commander');

program
  .command('get',              'Retrieve the historical values of an LWM2M resource')
  .command('query',            'Run the specified query')
  .parse(process.argv);