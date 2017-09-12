#!/usr/bin/env node

var program = require('commander');
program
 .description('Command line tool for managing GridThings devices and services.' + 
  '\n  ' +
  '\n  To access Gridthings Edge services you must have a client certificate for your instance in ~/.gtcli/' + 
  '\n  ')
 .command('software', 'Manage the software packages installed on a device')
 .command('devices', 'List the devices attached to your Gridthings Edge services')
 .command('ssn', 'Configure SSN endpoints managed by your Gridthings Edge services')
 .command('history', 'Retrieve the history for an LWM2M resources')
 .parse(process.argv);