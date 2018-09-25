#!/usr/bin/env node

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

function default_callback(endpoint,record){
  console.log(JSON.stringify(record, null, 2));
}

function make_ws_url(server, jwt_claim)
{
  return "wss://stream." + defaults.check_server_name(server) + ":443/records/" + jwt_claim;
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

function ws_stream(endpoint, resource, server, jwt_secret, verbose = false, callback = default_callback, error = function(error){console.log(error)}){
  var certs = gtapi.get_certs(server);
  var s = make_ws_url(server, get_jwt(jwt_secret));

  if (verbose){
    console.log(s);
  }
  var ws = new WebSocket(
    s,
    { ca : certs.ca, key: certs.key, cert: certs.crt});


  ws.on('open', function open() {

  });

  ws.on('error', function error(err) {
    error("web socket error " + err);
  });

  ws.on('message', function incoming(data) {
    callback(endpoint, JSON.parse(data));
  });
}

//{
//  "name":"notification",
//  "length":198,
//  "processId":36,
//  "channel":"records",
//  payload":"{\"timestamp\":\"2017-12-07T08:51:49\",\"endpoint\":\"urn:ssni:001e0029573650112032353\",\"object_id\":30001,\"object_instance_id\":125,\"resource_id\":4,\"resource_instance_id\":null,\"data\":false}"}
function eventhub_stream(endpoint, resource, connStr, verbose = false, callback = default_callback, error = function(error){console.log(error)}){
  var EventHubClient = require('azure-event-hubs').Client;

  var printError = function (err)
  {
    error(err.message);
  };

  var printMessage = function (message)
  {
    try
    {
      var record = JSON.parse(message.body.payload);
      callback(endpoint, record);
    }
    catch(e)
    {
      error(e);
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

function kinesis_stream(endpoint, resource, server, verbose = false, callback = default_callback, error = function(error){console.log(error)}){
  var options = {}
  if (verbose) options.logger = winston;

  var server_name = defaults.check_server_name(server).split(".")[0];
  const client = new AWS.Kinesis()

  options.interval = 1000;

  const reader = new KinesisReadable(client, server_name + "-records", options)
  reader.on('data', function(record_Buffer)
  {
    if (verbose) console.log(record_Buffer.toString('ascii'));
    try
    {
      var record = JSON.parse(record_Buffer.toString('ascii'));
      callback(record);
    }
    catch(e)
    {
      error(e);
    }
  });
}

exports.stream = function(endpoint,resource,server, verbose = false, callback = default_callback, error = function(error){console.log(error)}){
  var the_endpoint =endpoint;
  var the_resource = resource;
  var the_server = server;
  var config = defaults.get_config();
  if(the_server == "." || the_server == null){
    the_server = config["server"]
  }
  var server_config = config[the_server];
  //console.log(server_config);
  if (typeof server_config === 'undefined'){
    error("no server configuration in ~/.gtcli/defaults");
  }
  else {
    if (server_config.stream_reader == "kinesis"){
      kinesis_stream(the_endpoint, the_resource, the_server, verbose, callback, error);
    }
    else if (server_config.stream_reader == "eventhub"){
      eventhub_stream(the_endpoint, the_resource, server_config.event_hub_connection_string, verbose, callback, error);
    }
    else {
      ws_stream(the_endpoint, the_resource, the_server, server_config.jwt_secret, verbose, callback, error);
    }
  }
}
