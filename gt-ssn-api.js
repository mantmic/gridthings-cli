var coap = require('coap');

function make_ssn_url(server)
{
  return "coap://" + server + ":5883/";
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