#!/usr/bin/env node

var program = require('commander');

program
  .command('filesystem', 'Format the file system on the specified device. All applications must be inactive.')
  .command('samples',    'Format the sample file system on the specified device. All applications must be inactive.')
  .parse(process.argv);