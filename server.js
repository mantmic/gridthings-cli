#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the server object for an endpoiont')
  .command('set',       'Set a resource on the server object for an endpoiont')
  .parse(process.argv);