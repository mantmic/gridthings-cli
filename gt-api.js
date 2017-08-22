
var request = require('superagent');

const os = require('os');
var fs = require("fs");

exports.log_level = 0;

//FIXME: need to remove this when we work out how to get superagent to use the supplied ca certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


function log_debug(str)
{
  if (exports.log_level > 0) console.log(str);
}

function log_error(context, err)
{
  console.log(err.response.status + " " + err.response.text);
}


function gt_cli_path(file)
{
  return os.homedir() + '/.gtcli/' + file;
}

function make_core_url(server)
{
  return "https://core." + server + "/api/clients";
}

function make_client_url(path, urn, server)
{
  var url = make_core_url(server) ;
  if (urn != "") 
  {
    url += "/" + urn;
    if (path != "")
    {
       url += "/" + path;
    } 
  }
  return url;
}


var server_certs = {};
function get_certs(server)
{
  if (server in server_certs)
  {
    return server_certs[server];
  }

  server_certs[server] = {};
  server_certs[server].ca  = fs.readFileSync(gt_cli_path(server + '/ca.crt'));
  server_certs[server].key = fs.readFileSync(gt_cli_path(server + '/' + server + '-client.key'));
  server_certs[server].crt = fs.readFileSync(gt_cli_path(server + '/' + server + '-client.pem'));
  return server_certs[server];
}


exports.core_get = function(path, urn, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_client_url(path, urn, server);
    log_debug("GET " + url);
    request.get(url).ca(certs.ca).cert(certs.crt).key(certs.key).end(function(error, response) {
      if (error) reject(error);
      else resolve(response);
    });
  }
  catch (e)
  {
    reject(e);
  }
}

exports.software_get = function(urn, server, resolve, reject)
{
  exports.core_get("9", urn, server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("fetching software resources", error); 
    });
}


exports.list_devices = function(server, resolve, reject)
{
  exports.core_get('', '', server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("fetching software resources", error); 
    });
}