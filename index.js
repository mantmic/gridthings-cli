#!/usr/bin/env node

var program = require('commander');
program
 .description('Command line tool for managing GridThings devices.' + 
  '\n  ' +
  '\n  To access the server you must have a client certificate for your server in ~/.gtcli/' + 
  '\n  ')
 .command('software', 'Manage the software packages installed on a device')
 .command('devices', 'List the devices attacvhed to your server')
 .parse(process.argv);
