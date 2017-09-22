#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
program
  .arguments('<slot> <urn> <server>')
  .action(function(slot, urn, server) {
    console.log('uninstalling application %s on device %s via %s', slot , urn, server);

    gtapi.software_uninstall(slot, urn, server, function(response)
    {
      console.log(JSON.stringify(response, null, 2));
    });
  })
  .parse(process.argv);