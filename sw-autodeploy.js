#!/usr/bin/env node

var program = require('commander');
var packageStatemachine = require('./package-statemachine.js') ;


program
  //.arguments('<slot> <package> <urn> [server]')
  .arguments('<slot> <package> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(slot, package, urn, server) {
    var fsm = new packageStatemachine.SoftwareUpdate({
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
