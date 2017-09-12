#!/usr/bin/env node

var program = require('commander');

program
  .command('get',              'Retrieve the historical values of an LWM2M resource')
  .parse(process.argv);