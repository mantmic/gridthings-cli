
var request = require('superagent');

const os = require('os');
var fs = require("fs");
var gtswp = require('./gt-software-package.js');
var gtsws = require('./gt-software-api.js')
exports.log_level = 0;

//FIXME: need to remove this when we work out how to get superagent to use the supplied ca certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


function log_debug(str)
{
  if (exports.log_level > 0) console.log(str);
}

// {
//   "status":404,
//   "response":
//   {
//     "req":{
//       "method":"GET",
//       "url":"https://config.manderson-01.gridthin.gs/gtedge/packages",
//       "headers":{"user-agent":"node-superagent/3.6.0"}
//     },
//     "header":{
//       "server":"nginx/1.13.3",
//       "date":"Wed, 23 Aug 2017 23:17:40 GMT",
//       "content-type":"application/json",
//       "content-length":"105",
//       "connection":"close",
//       "content-encoding":"gzip",
//       "x-powered-by":"restheart.org",
//       "access-control-expose-headers":"Location, ETag, Auth-Token, Auth-Token-Valid-Until, Auth-Token-Location, X-Powered-By",
//       "access-control-allow-origin":"*","access-control-allow-credentials":"true"
//     },
//     "status":404,
//     "text":"{\"http status code\":404,\"http status description\":\"Not Found\",\"message\":\"Db 'gtedge' does not exist\"}"
//   }
// }

function log_error(context, err)
{
  if (err.response) 
  {
    try
    {
      var contents = JSON.parse(err.response);
      if (contents.message) console.log(err.response.status + " " + contents.message);
      else  console.log(err.response.status + " " + err.response.text);
    }
    catch(e)
    {
      try
      {
        var contents = JSON.parse(err.response.text);
        if (contents.message) console.log(err.response.status + " " + contents.message);
        else console.log(err.response.status + " " + err.response.text);
      }
      catch(e)
      {
        console.log(err.response.status + " " + err.response.text);
      }
    }
  } 
  else if (err.code) console.log((err.code == "ECONNREFUSED" ? "connection refused" : err.code) + " " + err.address);
  else console.log(err);
}


function gt_cli_path(file)
{
  return os.homedir() + '/.gtcli/' + file;
}

function make_core_url(server)
{
  return "https://core." + server + "/api/clients";
}

function make_config_url(path, server)
{
  return "https://config." + server + "/gtedge/" + path;
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

exports.core_exec= function(path, body, urn, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_client_url(path, urn, server);
    log_debug("EXEC " + url);
    request.post(url)
      .ca(certs.ca)
      .cert(certs.crt)
      .key(certs.key)
      .set('Content-Type', 'application/json')
      .send(body)
      .end(function(error, response) {
        if (error) reject(error);
        else resolve(response);
      });
  }
  catch (e)
  {
    reject(e);
  }
}

exports.core_put= function(path, body, urn, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_client_url(path, urn, server);
    log_debug("PUT " + url);
    request.put(url)
      .ca(certs.ca)
      .cert(certs.crt)
      .key(certs.key)
      .set('Content-Type', 'application/json')
      .send(body)
      .end(function(error, response) {
        if (error) reject(error);
        else resolve(response);
      });
  }
  catch (e)
  {
    reject(e);
  }
}

function config_add_query(q)
{
  var str_q = q.length != 0 ? "?" : "";
  for (var i = 0; i < q.length; i++)
  {
    if (i != 0) str_q += "&";
    str_q += q[i];
  }
  return str_q;
}

exports.config_put = function(path, body, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_config_url(path, server);
    log_debug("PUT " + url);
    request.put(url).ca(certs.ca).cert(certs.crt).key(certs.key).send(body).end(function(error, response) {
      if (error) reject(error);
      else resolve(response);
    });
  }
  catch (e)
  {
    reject(e);
  }
}
exports.config_get = function(path, query, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_config_url(path, server);
    url += config_add_query(query);
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

exports.config_delete = function(path, query, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_config_url(path, server);
    url += config_add_query(query);
    log_debug("DELETE " + url);
    request.delete(url).ca(certs.ca).cert(certs.crt).key(certs.key).end(function(error, response) {
      if (error) reject(error);
      else resolve(response);
    });
  }
  catch (e)
  {
    reject(e);
  }
}

exports.ssn_list_endpoints = function(server, resolve, reject)
{
  exports.config_get("ssn-proxy-endpoints-1", "", server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("listing software packages", error); 
    });
}

////////////////////////////////////////////////////
exports.update_state_to_string = function(us)
{
  if (us == 0) return "not installed";
  else if (us == 1) return "downloading";
  else if (us == 2) return "verifying";
  else if (us == 3) return "downlaoded";
  else if (us == 4) return "installed";
  return "unknown";
}

function lwm2m_resource_array_to_map(resources)
{
  var map = {};
  for (var resource = 0; resource < resources.length; resource++)
  {
    map[resources[resource].id] = resources[resource].value;
  }
  return map;
}

function lwm2m_instance_array_to_map(instances)
{
  var map = {};

  for (var instance = 0; instance < instances.length; instance++)
  {
    map[instances[instance].id] = lwm2m_resource_array_to_map(instances[instance].resources);
  }
  return map;
}

function lwm2m_object_response_to_map(response)
{
  var resp_obj = JSON.parse(response.text);
  if (resp_obj.status == "CONTENT")
  {
    return lwm2m_instance_array_to_map(resp_obj.content.instances);
  }
  
  return {};
}

function software_print_state(context, state)
{
  console.log(context+ (state[12] ? "active" : "inactive"));
  console.log("  Update state:  " + exports.update_state_to_string(state[7]) );
  console.log("  Update result: " + state[9] );
}

exports.software_delete_package = function(hashid, server, resolve, reject)
{
  if ((hashid === "") || (hashid == null))
  {
    log_error("listing software packages", "invalid package id");
    if (reject) reject("invalid package id");
  }
  exports.config_delete("packages/" + hashid, [], server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("listing software packages", error); 
    });
}

//lists the packages installed in the configuration database
exports.software_list_packages = function(server, resolve, reject)
{
  exports.config_get("packages", ["keys={'_id':1}", "np"], server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("listing software packages", error); 
    });
}

exports.software_publish_package = function(package_name, server, resolve, reject)
{
  var package = gtswp.load(package_name);
  console.log("publishing " + package.toString());
  var bindata = new require('mongodb').Binary(package.data);
  exports.config_put(
    "packages/" + package.hashid, 
    { "package" : bindata }, 
    server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("publishing software package", error); 
    });
}

exports.software_get = function(urn, server, resolve, reject)
{
  exports.core_get("9", urn, server, 
    function(response) {resolve(lwm2m_object_response_to_map(response))},
    function(error){ 
      if (reject) reject(error);
      else log_error("fetching software resources", error); 
    });
}

exports.software_reload_packages = function(server, resolve, reject)
{
  gtsws.reload_packages(server, 
    resolve,
    function(error){ 
      if (reject) reject(error);
      else log_error("fetching software resources", error); 
    });
}


exports.software_deactivate = function(slot, urn, server, resolve, reject)
{
  //first get the state
  exports.software_get(urn, server, function(repsonse){
    //console.log(JSON.stringify());
    var software_states = repsonse;
    if (!software_states[slot])
    {
      if (reject) reject("the specified slot is not available");
      else log_error("activating software", "the specified slot is not available"); 
    }
    else
    {
      var state = software_states[slot];
      software_print_state("software in slot 0 is ", software_states[slot]);

      if (state[7] == 0)
      { //no package
        if (reject) reject("no application loaded");
        else log_error("deactiviating package", "no application loaded");
      }
      else if (!state[12])
      { //downloading
        if (reject) reject("application is now inactive");
        else log_error("deactiviating package", "application is not active"); 
      }
      else
      {
        //execute install
        exports.core_exec("9" + "/" + slot + "/11", null, urn, server, 
          function(response) {
            console.log("application is now inactive");
          },
          function(error){ 
            if (reject) reject(error);
            else log_error("deactiviating package", error); 
          });
      }
    } 
  }, reject);
}


exports.software_uninstall = function(slot, urn, server, resolve, reject)
{
  //first get the state
  exports.software_get(urn, server, function(repsonse){
    var software_states = repsonse;
    if (!software_states[slot])
    {
      if (reject) reject("the specified slot is not available");
      else log_error("activating software", "the specified slot is not available"); 
    }
    else
    {
      var state = software_states[slot];
      software_print_state("software in slot 0 is ", software_states[slot]);

      if (state[7] == 0)
      { //no package
        if (reject) reject("no application loaded");
        else log_error("activiating package", "no application loaded");
      }
      else if (state[7] == 1)
      { //downloading
        if (reject) reject("application is currently downloading");
        else log_error("activiating package", "application is currently downloading"); 
      }
      else if (state[12]) //active
      {
        //execute install
        exports.core_exec("9" + "/" + slot + "/11", null, urn, server, 
          function(response) {
            console.log("application is now inactive");
            exports.core_exec("9" + "/" + slot + "/6", null, urn, server, function(response) {
              console.log("application is now uninstalled");
            },
            function(error){ 
              if (reject) reject(error);
              else log_error("uninstalling package", error); 
            });
          },
          function(error){ 
            if (reject) reject(error);
            else log_error("uninstalling package", error); 
          });
      }
      else if (state[7] == 4) //installed
      { 
        console.log("application is now inactive");
        exports.core_exec("9" + "/" + slot + "/6", null, urn, server, function(response) {
          console.log("application is now uninstalled");
        },
        function(error){ 
          if (reject) reject(error);
          else log_error("uninstalling package", error); 
        });
      }
      else
      {
        //??
      }
    } 
  }, reject);
}


exports.software_activate = function(slot, urn, server, resolve, reject)
{
  //first get the state
  exports.software_get(urn, server, function(repsonse){
    //console.log(JSON.stringify());
    var software_states = repsonse;
    if (!software_states[slot])
    {
      if (reject) reject("the specified slot is not available");
      else log_error("activating software", "the specified slot is not available"); 
    }
    else
    {
      var state = software_states[slot];
      software_print_state("software in slot 0 is ", software_states[slot]);

      if (state[7] == 0)
      { //no package
        if (reject) reject("no application loaded");
        else log_error("activiating package", "no application loaded");
      }
      else if (state[7] == 1)
      { //downloading
        if (reject) reject("application is currently downloading");
        else log_error("activiating package", "application is currently downloading"); 
      }
      else if (state[7] == 3) //downloaded but not installed
      {
        //execute install
        exports.core_exec("9" + "/" + slot + "/4", null, urn, server, 
          function(response) {
            console.log("application is now installed");
            exports.core_exec("9" + "/" + slot + "/10", null, urn, server, function(response) {
              console.log("application is now active");
            },
            function(error){ 
              if (reject) reject(error);
              else log_error("activiating package", error); 
            });
          },
          function(error){ 
            if (reject) reject(error);
            else log_error("activiating package", error); 
          });
      }
      else if (state[7] == 4) //installed
      { 
        console.log("application is already installed");
        exports.core_exec("9" + "/" + slot + "/10", null, urn, server, function(response) {
          console.log("application is now active");
        },
        function(error){ 
          if (reject) reject(error);
          else log_error("activiating package", error); 
        });
      }
    } 
  }, reject);
}

exports.software_push = function(slot, package, urn, server, resolve, reject)
{
  //first get the state
  exports.software_get(urn, server, function(repsonse){
    //console.log(JSON.stringify());
    var software_states = repsonse;
    if (!software_states[slot])
    {
      if (reject) reject("the specified slot is not available");
      else log_error("pushing software", "the specified slot is not available"); 
    }
    else
    {
      var state = software_states[slot];
      software_print_state("software in slot 0 is ", software_states[slot]);

      if (state[7] == 0) //not installed
      {
        var put_obj = {};
        put_obj.id = 3;
        put_obj.value = "coap://" + server + ":5433/" + package;
        //write the package URI to the uri resource
        exports.core_put("9" + "/" + slot + "/3", put_obj, urn, server, 
          function(response) {
            console.log(response.status);
            if (response.status == 200)
            {
              //the package is now downloading.
              console.log(urn + " is downloading " + package);
            }
          },
          function(error){ 
            if (reject) reject(error);
            else log_error("writing package URI", error); 
          });
      }
      else
      { //need to uninstall first

      }
    } 
  }, reject);
 
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