#!/usr/bin/env node

var program = require('commander');

program
  .command('list',      'List packages available for installation')
  .command('publish',   'Publish a package to make it available for installation')
  .command('delete',    'Delete a package from the server')
  .command('reload',    'Force the software server to reload packages from the package store')
  .parse(process.argv);