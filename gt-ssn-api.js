var coap = require('coap');
var URL = require('url');
var Agent = require('./node_modules/coap/lib/agent.js');
var async = require('async');
const os = require('os');
var defaults = require('./defaults.js');

function make_ssn_url(server)
{
  return "coap://" + defaults.check_server_name(server) + ":5883/";
}

//The Internet Assigned Numbers Authority (IANA) suggests the range 49152 to 65535 (215+214 to 216−1) for dynamic or private ports. 
//Many Linux kernels use the port range 32768 to 61000. FreeBSD has used the IANA port range since release 4.6.

exports.delete_sessions = function(session_url, resolve, reject)
{
  var sessions = [];
  var portno = 32768;
  for (var i = portno; i < 65535; i++)
  {
    sessions.push(function(callback) {
      var port = portno++;
      try
      {
        url = URL.parse(session_url);
        url.agent = new Agent({ type: 'udp4', port: port });
        
        url.agent.on("error", function(){console.log("bind failed for port " + port)});

        coap.request(url).on('response', function(response) {
          if (response.code < 4.00) console.log("####### port " + port + " had a session");
          //else console.log("no session on " + port);
          callback(null);
        }).end();
      }
      catch(e)
      {
        console.log("bind failed for " + port);
      }
    });
  }

  async.parallelLimit(sessions, 50, function(err, results) {});
}

exports.reload_endpoints = function(server, resolve, reject)
{
  var request = {};
  
  request.hostname = server;
  request.port = 5883;
  request.method = "PUT";
  request.pathname = "/reload/";
  console.log("PUT " + make_ssn_url(server) + "reload/");
  var req = coap.request(request).on('response', function(response) {
    if (response.code < 4.00) resolve(response);
    else reject(response);
  }).end();
}


exports.poll_endpoint = function(urn, server, resolve, reject)
{
  var request = {};
  
  request.hostname = server;
  request.port = 5883;
  request.method = "POST";
  request.pathname = "/poll/";
  request.query = urn;
  console.log("POST " + make_ssn_url(server) + "poll?" + urn);
  var req = coap.request(request).on('response', function(response) {
    if (response.code < 4.00) resolve(response);
    else reject(response);
  }).end();
}