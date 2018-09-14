#!/usr/bin/env node

var program = require('commander');
var softwareStatemachine = require('./software-statemachine.js') ;


program
  //.arguments('<slot> <package> <urn> [server]')
  .arguments('<slot> <package> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(slot, package, urn, server) {
    var fsm = new softwareStatemachine.SoftwareUpdate({
      endpoint:urn,
      targetSlot:slot,
      targetVersion:package,
      server:server,
      printJson:program.json
    })
    ;
    //console.log(fsm);
    fsm.begin();
  })
  .parse(process.argv);
