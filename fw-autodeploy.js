#!/usr/bin/env node

var program = require('commander');
var packageStatemachine = require('./package-statemachine.js') ;


//gtcli firmware autodeploy 42N7MKZy urn:imei:352753090108638 .

program
  //.arguments('<package> <urn> [server]')
  .arguments('<package> <urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(package, urn, server) {
    var fsm = new packageStatemachine.FirmwareUpdate({
      endpoint:urn,
      targetVersion:package,
      server:server,
      printJson:program.json
    })
    ;
    //console.log(fsm);
    fsm.begin();
  })
  .parse(process.argv);
