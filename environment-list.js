#!/usr/bin/env node

const program = require('commander');
const defaults = require('./defaults.js');

const config = defaults.get_config();

function getEnvironment(){
  var servers = Object.keys(config) ;
  servers = servers.filter(s => s != 'server') ;
  return(servers)
}
;

function environmentList(){
  getEnvironment().forEach(function(s){
    console.log(s, config.server == s ? "*" : "");
  })
}
;

program
  .parse(process.argv);

environmentList();
