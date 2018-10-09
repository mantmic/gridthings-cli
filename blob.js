#!/usr/bin/env node

var program = require('commander');

program
  .command('read',      'Initated the read and transfer of the specifiy blob resource')
  .command('list',      'List the blobs provided by the spedicifed device')
  .parse(process.argv);