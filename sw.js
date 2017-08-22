#!/usr/bin/env node

var program = require('commander');

program
  .arguments('<urn> <server>')
  .command('show', 'Show the packages installed a device')
  .command('install', 'Install a package on a device')
  .parse(process.argv);