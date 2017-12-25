#!/usr/bin/env node

var program = require('commander');

program
  .command('immediate', 'immediate')
  .command('once', 'once')
  .command('daily', 'daily')
  .command('start', 'start')
  .command('stop', 'stop')
  .command('disable', 'disable')
  .command('enable', 'enable')
  .command('deactivate', 'deactivate')
  .command('activate', 'activate')
  .command('context', 'context')
  .parse(process.argv);