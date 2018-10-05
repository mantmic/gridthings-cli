#!/usr/bin/env node

var program = require('commander');
var winston = require('winston');
var defaults = require('./defaults.js');
var gtapi = require('./gt-api.js');

//web socket
var uuid = require('uuid');
var nJwt = require('njwt');
const WebSocket = require('ws');

//AWS
const AWS = require('aws-sdk');
AWS.config.update({region:'ap-southeast-2'});
const { KinesisReadable } = require('kinesis-streams')


var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
var logging = false;

function make_ws_url(server, jwt_claim)
{
  return "wss://stream." + defaults.check_server_name(server) + ":443/records/" + jwt_claim;
}

var resource_parts = [];

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
      if (logging) console.log(record.data.val.value.trim());
    }
    else
    {
     
    }
  }
}

function get_jwt(jwt_secret)
{
  var claims = {
   "channel": "records",
   "mode": "r"
  }

  var jwt = nJwt.create(claims,jwt_secret,"HS256");
  return jwt.compact();
}

function ws_stream(endpoint, resource, server, jwt_secret)
{
  var certs = gtapi.get_certs(server);
  var s = make_ws_url(server, get_jwt(jwt_secret));

  if (program.verbose) console.log(s);
  var ws = new WebSocket(
    s,
    { ca : certs.ca, key: certs.key, cert: certs.crt});


  ws.on('open', function open() {

  });

  ws.on('error', function error(err) {
    console.log("web socket error " + err);
  });

  ws.on('message', function incoming(data) {
    print_record(endpoint, JSON.parse(data));
  });
}

//{
//  "name":"notification",
//  "length":198,
//  "processId":36,
//  "channel":"records",
//  payload":"{\"timestamp\":\"2017-12-07T08:51:49\",\"endpoint\":\"urn:ssni:001e0029573650112032353\",\"object_id\":30001,\"object_instance_id\":125,\"resource_id\":4,\"resource_instance_id\":null,\"data\":false}"}
function eventhub_stream(endpoint, resource, connStr)
{
  var EventHubClient = require('azure-event-hubs').Client;

  var printError = function (err)
  {
    console.log(err.message);
  };

  var printMessage = function (message)
  {
    try
    {
      var record = JSON.parse(message.body.payload);
      print_record(endpoint, record);
    }
    catch(e)
    {
      console.log(e);
    }
  };

  var client = EventHubClient.fromConnectionString(connStr);
  client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime': Date.now() }).then(function (receiver) {
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);

}

function kinesis_stream(endpoint, resource, server)
{
  var options = {}
  if (program.verbose) options.logger = winston;

  var server_name = defaults.check_server_name(server).split(".")[0];
  const client = new AWS.Kinesis()

  options.interval = 1000;

  const reader = new KinesisReadable(client, server_name + "-records", options)
  reader.on('data', function(record_Buffer)
  {
    try
    {
      var record = JSON.parse(record_Buffer.toString('ascii'));
      print_record(record);
    }
    catch(e)
    {
      console.log(e);
    }
  });
}

var the_endpoint = null;
var the_server = null;

program
  .arguments('<endpoint> [server]')
  .action(function(endpoint, server) {
    the_endpoint = endpoint;
    the_server = server;
  })
  .parse(process.argv);

if (the_endpoint == null)
{
  console.error("no endpoint specified");
  process.exit(1);
}


rl.setPrompt('gt-core $ ');
rl.prompt();
rl.on('line', function(line) 
{
  line = line.trim();

  if (line === "exit") rl.close();
  else if (line === "log on")
  { 
    logging = true;
  } 
  else if (line === "log off") 
  {
    logging = false;
  } 
  else if (line === "") 
  {
    rl.prompt();
  }
  else
  {
    gtapi.core_exec("30006/0/2", line, the_endpoint, the_server, function()
    {
      gtapi.core_get("30006/0/0", the_endpoint, the_server, function(response)
      {
        var response_object = JSON.parse(response.text);
        console.log(response_object.content.value);
        rl.prompt();
      }, 
      function(error)
      {
        console.error("failed to get response");
        rl.prompt();
      });
  }
  }, 
  function(error)
  {
    console.error("failed to send command");
    rl.prompt();
  });
  
}).on('close',function()
{
  console.log("\nexiting");
  process.exit(0);
});

var the_resource = "30006/0/0/0";

var config = defaults.get_config();
var server_config = config[config.server];
if (typeof server_config === 'undefined')
{
  console.log("no server configuration in ~/.gtcli/defaults");
}
else
{
  if (server_config.stream_reader == "kinesis")
  { 
    kinesis_stream(the_endpoint, the_resource, the_server);
  }
  else if (server_config.stream_reader == "eventhub")
  {
    eventhub_stream(the_endpoint, the_resource, server_config.event_hub_connection_string);
  }
  else 
  {
    ws_stream(the_endpoint, the_resource, the_server, server_config.jwt_secret);
  }
}
