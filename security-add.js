#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');
const crypto = require('crypto');
var iot = new AWS.Iot();
var AWS = require('aws-sdk');
var awsIot = require('aws-iot-device-sdk');

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .description("Adds a new device to the server's security table. New PSKs are generated for both the bootstrap key and the core server key") 
  .action(function(urn, server) 
  {
    gtapi.log_level = program.verbose ? 1 : 0;
    print_json = false;

    // PSK_bootstrap = crypto.randomBytes(16).toString('hex');
    // PSK_core = crypto.randomBytes(16).toString('hex'); 

    var params = {
      setAsActive: true || false
    };
    iot.createKeysAndCertificate(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });



    gtapi.security_add_endpoint(PSK_bootstrap, PSK_core, urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    }, 
    function(err)
    {
      console.log("error:" + err);
    })
  })
  .parse(process.argv);