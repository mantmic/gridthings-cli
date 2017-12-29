#!/usr/bin/env node

var program = require('commander');
program
 .description('Command line tool for managing GridThings devices and services.' + 
  '\n  ' +
  '\n  To access Gridthings Edge services you must have a client certificate for your instance in ~/.gtcli/' + 
  '\n  ')
 .command('software', 'Manage the software packages installed on a device')
 .command('firmware', 'Manage the firmware installed on a device')
 .command('package', 'Manage the software and firmware packages available on a server')
 .command('devices', 'List the devices attached to your Gridthings Edge services')
 .command('ssn', 'Configure SSN endpoints managed by your Gridthings Edge services')
 .command('history', 'Retrieve the history for an LWM2M resources')
 .command('stream', 'Attach to the record stream to view live records as they arrive')
 .command('security', 'Manage endpoint security keys')
 .command('mdl', 'Manage Layson Meter Data Loggers (requires MDL application to be loaded on the Gridthings Core)')
 .parse(process.argv);