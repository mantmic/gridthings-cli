var coap = require('coap');
const os = require('os');
var defaults = require('./defaults.js');


function make_software_url(server)
{
  return "coap://" + defaults.check_server_name(server) + ":5433/packages/reload";
}

exports.reload_packages = function(server, resolve, reject)
{

  var request = {};
  
  request.hostname = server;
  request.port = 5433;
  request.method = "PUT";
  request.pathname = "/packages/reload";
  console.log("PUT " + make_software_url(server));
  var req = coap.request(request).on('response', function(response) {
    if (response.code < 4.00) resolve(response);
    else reject(response);
  }).end();
}