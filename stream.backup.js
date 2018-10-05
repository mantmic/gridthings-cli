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

//Azure

var resource_parts = [];

function make_ws_url(server, jwt_claim)
{
  return "wss://stream." + defaults.check_server_name(server) + ":443/records/" + jwt_claim;
}

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
                console.log('Created partition receiver: ' + partitionId)
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
    if (program.verbose) console.log(record_Buffer.toString('ascii'));
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

program
  .arguments('<endpoint> <resource> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print records as JSON')
  .option('-u, --utc', 'Display times in UTC')
  .action(function(endpoint, resource, server) {
    the_endpoint =endpoint;
    the_resource = resource;
    the_server = server;
  })
  .parse(process.argv);


if (typeof program.utc === 'undefined') program.utc = false;

if (the_resource == ".") the_resource = "./././.";
resource_parts = the_resource.split('/');
for (var i = resource_parts.length; i < 4; i++)
{
  resource_parts.push("*");
}

var config = defaults.get_config();
var server_config = config[config.server];
if (typeof server_config === 'undefined')
{
  console.log("no server configuration in ~/.gtcli/defaults");
}
else
{
  if (server_config.stream_reader == "kinesis") kinesis_stream(the_endpoint, the_resource, the_server);
  else if (server_config.stream_reader == "eventhub")
  {
    eventhub_stream(the_endpoint, the_resource, server_config.event_hub_connection_string);
  }
  else ws_stream(the_endpoint, the_resource, the_server, server_config.jwt_secret);
}
