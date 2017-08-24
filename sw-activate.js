#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
program
  .arguments('install <slot> <urn> <server>')
  .action(function(slot, urn, server) {
    console.log('activating application %s on device %s via %s', slot , urn, server);

    gtapi.software_activate(slot, urn, server, function(response)
    {
      console.log(JSON.stringify(response));
    });
  })
  .parse(process.argv);