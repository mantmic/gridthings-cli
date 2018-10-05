#!/usr/bin/env node

const program = require('commander');
const defaults = require('./defaults.js');
var the_server = null ;


program
  .arguments('server payload')
  .action(function(server, payload) {
    var config = defaults.get_config();
    config[server] = payload ;
    defaults.set_config(config);
  })
  .parse(process.argv)
