#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the latest image from the specified OLM')
  .parse(process.argv);