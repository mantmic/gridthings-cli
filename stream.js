#!/usr/bin/env node

var program = require('commander');
var winston = require('winston');
var defaults = require('./defaults.js');

const AWS = require('aws-sdk');
AWS.config.update({region:'ap-southeast-2'});

const { KinesisReadable } = require('kinesis-streams')

program
  .arguments('<endpoint> <resource> <server>')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print records as JSON')
  .action(function(endpoint, resource, server) 
  { 
    var options = {}
    if (program.verbose) options.logger = winston;
    print_json = program.json;

    var server_name = defaults.check_server_name(server).split(".")[0];
    const client = new AWS.Kinesis()
    
    options.interval = 1000;  
   
    if (resource == ".") resource = "./././.";
    var resource_parts = resource.split('/');
    for (var i =resource_parts.length; i < 4; i++)
    {
      resource_parts.push("*");
    }
    function filter(record)
    {
      if ((endpoint != ".") && (endpoint != record.endpoint)) return true;
      if ((resource_parts[0] != ".") && (resource_parts[0] != record.object_id)) return true;
      if ((resource_parts[1] != ".") && (resource_parts[1] != record.object_instance_id)) return true;
      if ((resource_parts[2] != ".") && (resource_parts[2] != record.resource_id)) return true;
      if (record.resource_instance_id != null)
      {
        if ((resource_parts[3] != ".") && (resource_parts[3] != record.resource_instance_id)) return true;
      }
      return false;
    }

    const reader = new KinesisReadable(client, server_name + "-records", options)
    reader.on('data', function(record_Buffer)
    {
      if (program.verbose) console.log(record_Buffer.toString('ascii'));
      try
      {
        var record = JSON.parse(record_Buffer.toString('ascii'));
        if (!filter(record))
        {
          if (print_json)
          {
            console.log(record_json);
          }
          else
          {
            console.log(record.endpoint + "\t" + 
              record.timestamp + "\t" + record.object_id + "/" + 
              record.object_instance_id + "/" + record.resource_id + 
              ((record.resource_instance_id != null) ? "/"+record.resource_instance_id : "") + "\t" +
              record.data);

          }
          
        }

      }
      catch(e)
      {
        console.log(e);
      }
    });
  })
  .parse(process.argv);