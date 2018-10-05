#!/usr/bin/env node

const program = require('commander');
const defaults = require('./defaults.js');
var the_server = null ;


program
  .arguments('server')
  .action(function(server) {
    var config = defaults.get_config();
    delete config[server] ;
    defaults.set_config(config);
  })
  .parse(process.argv)
