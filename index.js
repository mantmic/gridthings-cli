#!/usr/bin/env node

var program = require('commander');
program
 .description('Command line tool for managing GridThings devices and services.' +
  '\n  ' +
  '\n  To access Gridthings Edge services you must have a client certificate for your instance in ~/.gtcli/' +
  '\n  ')
 .command('login', 'Log into the gtcli application')
 .command('software', 'Manage the software packages installed on an endpoint')
 .command('device',   'Manage the device object of an endpoint')
 .command('server',   'Manage the server object of an endpoint')
 .command('firmware', 'Manage the firmware installed on a device')
 .command('package',  'Manage the software and firmware packages available on a server')
 .command('devices',  'List the endpoints attached to your Gridthings Edge services')
 .command('ssn',      'Configure SSN endpoints managed by your Gridthings Edge services')
 .command('history',  'Retrieve the history for an LWM2M resources')
 .command('event',    'Manage the event objects on an endpoint')
 .command('delivery', 'Manage the sample and event delivery in an endpoint')
 .command('sample',   'Manage the sample objects on an endpoint')
 .command('stream',   'Attach to the record stream to view live records as they arrive')
 .command('security', 'Manage endpoint security keys')
 .command('mdl',      'Manage Layson Meter Data Loggers (requires MDL application to be loaded on the Gridthings Core)')
 .command('dred',     'Configure the IoT DRED for common usage scenarios (requires DRED application to be loaded on the Gridthings Core)')
 .command('lm',       'Configure the IoT Line Monitor for common usage scenarios (requires Line Monitor application to be loaded on the Gridthings Core)')
 .command('tm',       'Configure the IoT Transformer Monitor for common usage scenarios (requires Transformer Monitor (slim or cal) application to be loaded on the Gridthings Core)')
 .command('reboot',   'Reboot the specified endpoint')
 .command('environment', 'Manage the accessible Gridthings environments')
 .command('console',  'open a console on the specified device')
 .command('command',  'Queue commands to be executed on endpoint')
 .command('blob',     'Manage blob trasfers from an endpoint')
 .command('olm',      'Manage oil level monitor endpoints')
 // .on('command:*', function()
 // {
 //     program.help();
 //  })
 .parse(process.argv);


// Check the program.args obj
var NO_COMMAND_SPECIFIED = program.args.length === 0;

// Handle it however you like
if (NO_COMMAND_SPECIFIED) {
  // e.g. display usage
  program.help();
}
