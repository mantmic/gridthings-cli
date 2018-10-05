#!/usr/bin/env node

var program = require('commander');
var stream = require('./stream-api.js') ;

function filter(endpoint, record)
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

function print_record(endpoint, record)
{
  if (!filter(endpoint, record))
  {
    if (program.json)
    {
      console.log(JSON.stringify(record, null, 2));
    }
    else
    {
      if ((record.type == "REGISTRATION") || (record.type == "DEREGISTRATION"))
      {
         console.log(record.type + " " + record.endpoint + "\t" + record.timestamp + "\t" + "lifetime " + record.data.lifetime);
      }
      else if (record.type == "COAPMSG")
      {
        //ignore?
      }
      else if (record.type == "NOTIFICATION")
      {
        
      }
      else
      {
        var timestamp = Date.parse(record.timestamp + "+0000");
        timestamp = program.utc ? new Date(timestamp).toUTCString() : new Date(timestamp).toString();

        console.log(record.endpoint + "\t" +
           timestamp + "\t" + record.object_id + "/" +
          record.object_instance_id + "/" + record.resource_id +
          ((record.resource_instance_id != null) ? "/"+record.resource_instance_id : "") + "\t" +
          record.data);
      }
    }
  }
}
var resource_parts = [];

program
  .arguments('<endpoint> <resource> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print records as JSON')
  .option('-u, --utc', 'Display times in UTC')
  .action(function(endpoint, resource, server) {
    the_resource = resource
    the_endpoint = endpoint
    the_server = server
  })
  .parse(process.argv);

if (the_resource == "."){
  the_resource = "./././.";
}
resource_parts = the_resource.split('/');
for (var i = resource_parts.length; i < 4; i++)
{
  resource_parts.push("*");
}
stream.stream(the_endpoint,the_resource,the_server, program.verbose, print_record.bind(this))
