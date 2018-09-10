#!/usr/bin/env node

const program = require('commander');
const defaults = require('./defaults.js');
var the_server = null ;


function environment_set(environment){
  var config = defaults.get_config();
  var servers = Object.keys(config) ;
  servers = servers.filter(s => s != 'server') ;
  var config = defaults.get_config();

  if(servers.includes(environment)){
    config.server = environment;
    defaults.set_config(config);
    console.log("Set environment to " + environment) ;
  } else {
    console.log("Environment " + environment + " not configured in defaults file") ;
  }
}

program
  .arguments('server')
  .action(function(server) { the_server = server; })
  .parse(process.argv)
environment_set(the_server);
