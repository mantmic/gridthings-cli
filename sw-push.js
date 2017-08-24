#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

gtapi.log_level = 1;

program
  .arguments('install <slot> <package> <urn> <server>')
  .action(function(slot, package, urn, server) {
    console.log('pushing %s to slot %s on device %s via %s', package, slot , urn, server);

    gtapi.software_push(slot, package, urn, server, function(response){
      console.log(JSON.stringify(response));
    });
  })
  .parse(process.argv);