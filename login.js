#!/usr/bin/env node
var prompt = require('prompt');
var colors = require("colors/safe");
var login_config = require('./login-config.js') ;

prompt.message =  colors.grey("gtcli   ") ;
prompt.delimiter = "" ;

prompt.start();
prompt.get(
  {
    properties: {
      username: {
        required: true,
        description:colors.green("User:")
      },
      password: {
        hidden: true,
        description:colors.green("Password:")
      }
    }
  }, function (err, result) {
    //use the credentials to get a key
    //save key into the config file
  }
);
