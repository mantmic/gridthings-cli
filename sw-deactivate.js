#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
program
  .arguments('install <slot> <urn> <server>')
  .action(function(slot, urn, server) {
    console.log('deactivating application %s on device %s via %s', slot , urn, server);

    gtapi.software_deactivate(slot, urn, server, function(response)
    {
      console.log(JSON.stringify(response, null, 2));
    });
  })
  .parse(process.argv);