#!/usr/bin/env node

var program = require('commander');

program
  .arguments('install <package> <urn> <server>')
  .action(function(package, urn, server) {
    console.log('package: %s urn: %s server: %s', package, urn, server);
  })
  .parse(process.argv);