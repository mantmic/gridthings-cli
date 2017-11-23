#!/usr/bin/env node

var program = require('commander');

program
  .command('show',    'Show the configuration for the specified RMU')
  .command('config',  
    'Push a new configuration to meters attached to an RMU. The format for the config argument is in the\n' +
    '\t\tMDL standard fixed width format. For example:\n\n' + 
    '\t\t  07  RMU00007  00001/00001   6.0  0000000075      000075  Wh      \n\n' +
    '\t\tThis will set the meter id, k factor, display format, raw count and units of meter 07. If you don\'t\n' + 
    '\t\twant to set a particular parameter then leave it as spaces in the argument.\n'
  )
  .parse(process.argv);