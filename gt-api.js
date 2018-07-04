
var request = require('superagent');
const path = require('path');

const os = require('os');
var fs = require("fs");
var gtswp = require('./gt-software-package.js');
var defaults = require('./defaults.js');

exports.log_level = 0;
function log_debug(str)
{
  if (exports.log_level > 0) console.log(str);
}

//FIXME: need to remove this when we work out how to get superagent to use the supplied ca certificate password
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


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
  return path.join(os.homedir(), '.gtcli', file);
}

function make_core_url(server)
{
  return "https://core." + defaults.check_server_name(server) + "/api/clients";
}

function make_coap_url(path, server)
{
  return "https://coap." + defaults.check_server_name(server) + "/" + path;
}

function make_config_url(path, server)
{
  return "https://config." + defaults.check_server_name(server)  + "/gtedge/" + path;
}

function make_client_url(path, urn, server)
{
  var url = make_core_url(defaults.check_server_name(server));
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
  server = defaults.check_server_name(server);
  if (server in server_certs)
  {
    return server_certs[server];
  }

  server_certs[server] = {};
  server_certs[server].ca  = fs.readFileSync(gt_cli_path(path.join(server, 'ca.crt')));
  server_certs[server].key = fs.readFileSync(gt_cli_path(path.join(server, server + '-client.key')));
  server_certs[server].crt = fs.readFileSync(gt_cli_path(path.join(server, server + '-client.pem')));
  return server_certs[server];
}
exports.get_certs = get_certs;

/////////////////////////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////////////////////////
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
    log_debug("Body: " + JSON.stringify(body));
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
    log_debug("Body: " + JSON.stringify(body));
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

function add_query(q)
{
  var str_q = "";
  for (var i = 0; i < q.length; i++)
  {
    if (i != 0) str_q += "&";
    str_q += q[i];
  }
  if (str_q.length != 0) return "?" + str_q;
  return "";
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////////////////////////
exports.coap_put = function(path, body, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_coap_url(path, server);
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

exports.coap_post = function(path, body, query, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_coap_url(path, server);
    url += add_query(query);

    log_debug("POST " + url);
    request.post(url).ca(certs.ca).cert(certs.crt).key(certs.key).send(body).end(function(error, response) {
      if (error) reject(error);
      else resolve(response);
    });
  }
  catch (e)
  {
    reject(e);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////////////////////////
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

exports.config_post = function(path, body, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_config_url(path, server);
    log_debug("POST " + url);
    request.post(url).ca(certs.ca).cert(certs.crt).key(certs.key).send(body).end(function(error, response) {
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
    url += add_query(query);
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
    url += add_query(query);
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


function make_history_url(path, server)
{
  return "https://history." + defaults.check_server_name(server) + "/" + path;
}

exports.history_exec= function(path, body, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_history_url(path, server);
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


exports.history_get = function(path, query, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_history_url(path, server);
    url += add_query(query);
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



function history_get_newest(newest)
{
  if (newest == 'now') return new Date().toISOString();
  else return newest;
}


function history_get_oldest(newest, oldest)
{
  var newest = history_get_newest(newest);
  var newest_date = new Date(newest);

  var period = parseInt(oldest, 10);
  if (period != NaN)
  {
     return new Date(newest_date.getTime() - (1000 * period)).toISOString();
  }

  return new Date(oldest).toISOString();
}

////////////////////////////////////////////////////
//
// gets the history for the specified resource from newest for period seconds
exports.history_get_for_resource = function(endpoint, resource, newest, oldest, server, resolve, reject)
{
  //http://127.0.0.1:3000/values?endpoint=eq.testlwm2mclient&uri_path=like.3/0/7/*&timestamp=gte.2017-07-18&timestamp=lt.2017-07-19&select=timestamp,value&order=timestamp.asc' |

  var q = [];
  q.push("endpoint=eq." + endpoint);
  q.push("uri_path=eq." + resource);
  q.push("timestamp=gte." + history_get_oldest(newest, oldest));
  q.push("timestamp=lte." + history_get_newest(newest));
  q.push("select=uri_path,timestamp,value");
  q.push("order=timestamp.asc");

  exports.history_get("values", q, server,
    function(response) {
      try
      {
        var contents = JSON.parse(response.text);
        resolve(contents);
      }
      catch(e)
      {
        if (reject) reject(e.message);
      }
    },
    function(error){
      if (reject) reject(error);
      else log_error("getting history", error);
    });
}

////////////////////////////////////////////////////
exports.ssn_list_endpoints = function(server, resolve, reject)
{
  exports.config_get("ssn-proxy-endpoints-1", "", server,
    function(response) {
      try
      {

        var contents = JSON.parse(response.text);
        //console.log(JSON.stringify(contents._embedded));
        var endpoints = [];
        for (var ep = 0; ep < contents._embedded.length; ep++)
        {
          if (!contents._embedded[ep]._id["$oid"])
          {
            endpoints.push(contents._embedded[ep]._id);
          }
        }
        resolve(endpoints);
      }
      catch(e)
      {
        if (reject) reject(e.message);
      }
    },
    function(error){
      if (reject) reject(error);
      else log_error("listing software packages", error);
    });
}

exports.ssn_add_endpoint = function(urn, server, resolve, reject)
{
  if ((urn === "") || (urn == null))
  {
    log_error("adding ssn endpoint", "invalid urn");
    if (reject) reject("invalid urn");
  }

  log_debug("adding " + urn);

  exports.config_put(
    "ssn-proxy-endpoints-1/" + urn,
    null,
    server,
    resolve,
    function(error){
      if (reject) reject(error);
      else log_error("adding ssn endpoint", error);
    });
}

exports.ssn_remove_endpoint = function(urn, server, resolve, reject)
{
  if ((urn === "") || (urn == null))
  {
    log_error("removing ssn endpoint", "invalid urn");
    if (reject) reject("invalid urn");
  }

  exports.config_delete("ssn-proxy-endpoints-1/"+urn, "", server,
    resolve,
    function(error){
      if (reject) reject(error);
      else log_error("removing ssn endpoint", error);
    });
}

exports.ssn_reload_endpoints = function(server, resolve, reject)
{
  exports.coap_put("ssn/reload", {}, server,
    resolve,
    function(error){
      if (reject) reject(error);
      else log_error("reloading ssn endpoints", error);
    });
}

exports.ssn_poll_endpoint = function(urn, server, resolve, reject)
{
  exports.coap_post("ssn/poll", {}, ["urn=" + urn], server,
    resolve,
    function(error){
      if (reject) reject(error);
      else log_error("polling ssn endpoint", error);
    });
}


////////////////////////////////////////////////////
exports.update_state_to_string = function(us)
{
  switch(us)
  {
    case 0: return "Before downloading.";
    case 1: return "The downloading process has started and is on-going.";
    case 2: return "The package has been completely downloaded.";
    case 3: return "The package has been correctly downloaded and is ready to be installed. ";
    case 4: return "The software is correctly installed and can be activated or deactivated.";
  }
  return "unknown";
}
exports.update_result_to_string = function(ur)
{
   switch(ur)
  {
    case 0:  return "Initial.";
    case 1:  return "Downloading.";
    case 2:  return "Software successfully installed.";
    case 3:  return "Successfully Downloaded and package integrity verified";
    case 50: return "Not enough storage for the new software package.";
    case 51: return "Out of memory during downloading process.";
    case 52: return "Connection lost during downloading process.";
    case 53: return "Package integrity check failure.";
    case 54: return "Unsupported package type.";
    case 56: return "Invalid URI";
    case 57: return "Device defined update error";
    case 58: return "Software installation failure";
    case 59: return "Uninstallation/Uninstallation Failure";
  }
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
  console.log("  Update state:  " + exports.update_state_to_string(state[7]));
  console.log("  Update result: " + exports.update_result_to_string(state[9]));
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
      else log_error("deleting software packages", error);
    });
}

//lists the packages installed in the configuration database
exports.software_list_packages = function(server, resolve, reject)
{
  exports.config_get("packages", ["keys={'_id':1 ,'name':1, 'version':1, 'signature':1, 'type':1, 'payload_length':1}", "np"], server,
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

  var record = package.toMongo();

  exports.config_put(
    "packages/" + package.hashid,
    record,
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
  exports.coap_put("software/reload", {}, server,
    resolve,
    function(error){
      if (reject) reject(error);
      else log_error("reloading software resources", error);
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
      software_print_state("software in slot " + slot + " is ", software_states[slot]);

      if (state[7] == 0)
      { //no package
        if (reject) reject("no software loaded");
        else log_error("deactiviating software", "no software loaded");
      }
      else if (!state[12])
      { //inactive
        if (reject) reject("software is not active");
        else log_error("deactiviating software", "software is not active");
      }
      else
      {
        //execute deactivate
        exports.core_exec("9" + "/" + slot + "/11", null, urn, server,
          function(response) {
            if (response.status == 200) console.log("software is now inactive");
            else console.log(response.text);
          },
          function(error){
            if (reject) reject(error);
            else log_error("deactiviating software", error);
          });
      }
    }
  }, reject);
}


exports.software_install = function(slot, urn, server, resolve, reject)
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
        if (reject) reject("no software loaded");
        else log_error("activiating software", "no software loaded");
      }
      else if (state[7] == 1)
      { //downloading
        if (reject) reject("software is currently downloading");
        else log_error("activiating software", "software is currently downloading");
      }
      else if (state[7] == 4) //installed
      {
        console.log("software is already installed");
        if (reject) reject("software is already installed");
      }
      else if (state[7] == 3) //downloaded but not installed
      {
        exports.core_exec("9" + "/" + slot + "/4", null, urn, server, function(response) {

          if (response.status == 200) console.log("software is now installed");
          else console.log("failed to install software", response.text);

        },
        function(error){
          if (reject) reject(error);
          else log_error("installing software", error);
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
        if (reject) reject("no software loaded");
        else log_error("activiating software", "no software loaded");
      }
      else if (state[7] == 1)
      { //downloading
        if (reject) reject("software is currently downloading");
        else log_error("activiating software", "software is currently downloading");
      }
      else if (state[12]) //active
      {
        //execute deactivate
        exports.core_exec("9" + "/" + slot + "/11", null, urn, server,
          function(response) {
            if (response.status == 200)
            {
              console.log("application is now inactive");
              exports.core_exec("9" + "/" + slot + "/6", null, urn, server, function(response) {
                console.log("software is now uninstalled");
              },
              function(error){
                if (reject) reject(error);
                else log_error("uninstalling software", error);
              });
            }
            else
            {
              console.log(response.text);
            }
          },
          function(error){
            if (reject) reject(error);
            else log_error("uninstalling software", error);
          });
      }
      else if (state[7] == 4) //installed
      {
        console.log("software is now inactive");
        exports.core_exec("9" + "/" + slot + "/6", null, urn, server, function(response) {
          if (response.status == 200) console.log("software is now uninstalled");
          else console.log("failed to uninstall software", response.text);
        },
        function(error){
          if (reject) reject(error);
          else log_error("uninstalling software", error);
        });
      }
      else if (state[7] == 3) //downloaded but not active
      {
        exports.core_exec("9" + "/" + slot + "/6", null, urn, server, function(response) {
          if (response.status == 200) console.log("software is now uninstalled");
          else console.log("failed to uninstall software", response.text);
        },
        function(error){
          if (reject) reject(error);
          else log_error("uninstalling software", error);
        });
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
        if (reject) reject("no software loaded");
        else log_error("activiating software", "no software loaded");
      }
      else if (state[7] == 1)
      { //downloading
        if (reject) reject("software is currently downloading");
        else log_error("activiating software", "software is currently downloading");
      }
      else if (state[7] == 3) //downloaded but not installed
      {
        //execute install
        exports.core_exec("9" + "/" + slot + "/4", null, urn, server,
          function(response) {
            console.log("software is now installed");
            exports.core_exec("9" + "/" + slot + "/10", null, urn, server, function(response) {
             if (response.status == 200) console.log("software is now active");
             else console.log("failed to activiate software", response.text);
            },
            function(error){
              if (reject) reject(error);
              else log_error("activiating software", error);
            });
          },
          function(error){
            if (reject) reject(error);
            else log_error("activiating software", error);
          });
      }
      else if (state[7] == 4) //installed
      {
        console.log("software is already installed");
        exports.core_exec("9" + "/" + slot + "/10", null, urn, server, function(response) {
          if (response.status == 200) console.log("software is now active");
          else console.log("failed to activiate software", response.text);
        },
        function(error){
          if (reject) reject(error);
          else log_error("activiating software", error);
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
        put_obj.value = "coap://" + defaults.check_server_name(server) + ":5433/" + package;
        //write the package URI to the uri resource
        exports.core_put("9" + "/" + slot + "/3", put_obj, urn, server,
          function(response) {
            console.log(response.status);
            if (response.status == 200)
            {
              //the package is now downloading.
              console.log(urn + " is downloading " + package);
              if (resolve) resolve(response);
            }
            else
            {
              if (reject) reject(response);
            }
          },
          function(error){
            if (reject) reject(error);
            else log_error("writing software URI", error);
          });
      }
      else
      { //need to uninstall first
        log_error("pushing software", "slot 0 has software installed, uninstall first", error);
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
      else log_error("listing devices", error);
    });
}


exports.device_get = function(urn, server, resolve, reject)
{
  exports.core_get("3", urn, server,
    function(response) {resolve(lwm2m_object_response_to_map(response))},
    function(error){
      if (reject) reject(error);
      else log_error("fetching device resources", error);
    });
}

exports.server_get = function(urn, server, resolve, reject)
{
  exports.core_get("1", urn, server,
    function(response) {resolve(lwm2m_object_response_to_map(response))},
    function(error){
      if (reject) reject(error);
      else log_error("fetching server resources", error);
    });
}
/////////////////////////////////////////////////////////////
//
exports.fw_state_to_string = function(state)
{
  switch (state[3])
  {
     case 0: return "Idle (before downloading or after successful updating)";
     case 1: return "Downloading (The data sequence is on the way)";
     case 2: return "Downloaded";
     case 3: return "Updating";
  }
  return "unknown";
}

exports.fw_result_to_string = function(state)
{
  switch(state[5])
  {
    case 0: return "Initial value";
    case 1: return "Firmware updated successfully";
    case 2: return "Not enough flash memory for the new firmware package";
    case 3: return "Out of RAM during downloading process";
    case 4: return "Connection lost during downloading process";
    case 5: return "Integrity check failure for new downloaded package";
    case 6: return "Unsupported package type";
    case 7: return "Invalid URI";
    case 8: return "Firmware update failed";
    case 9: return "Unsupported protocol";
  }
  return "unknown";
}

exports.firmware_get = function(urn, server, resolve, reject)
{
  exports.core_get("5", urn, server,
    function(response) {resolve(lwm2m_object_response_to_map(response))},
    function(error){
      if (reject) reject(error);
      else log_error("fetching firmware resources", error);
    });
}


exports.firmware_push = function(package, urn, server, resolve, reject)
{
  //first get the state
  exports.firmware_get(urn, server, function(repsonse){
    //console.log(JSON.stringify());
    var state = repsonse[0];

    console.log("firmware is " + exports.fw_state_to_string(state));

    if ((state[3] == 0) || (state[3] == 2))//idle
    {
      var put_obj = {};
      put_obj.id = 1;
      put_obj.value = "coap://" + defaults.check_server_name(server) + ":5433/" + package;
      console.log( put_obj.value);
      //write the package URI to the uri resource
      exports.core_put("5/0/1", put_obj, urn, server,
        function(response) {

          if (response.status == 200)
          {
            //the package is now downloading.
            console.log(urn + " is downloading " + package);
            if (resolve) resolve(response);
          }
          else
          {
            if (reject) reject(response);
          }
        },
        function(error){
          if (reject) reject(error);
          else log_error("writing package URI", error);
        });
    }
    else
    {
      console.log("not idle");
    }
  }, reject);
}


exports.firmware_update = function(urn, server, resolve, reject)
{
  //first get the state
  exports.firmware_get(urn, server, function(repsonse){
    var state = repsonse[0];
    console.log("firmware is " + exports.fw_state_to_string(state));

    if (state[3] == 0)
    { //no package
      if (reject) reject("no firmware downloaded");
      else log_error("updating firmware", "no software loaded");
    }
    else if (state[3] == 1)
    { //downloading
      if (reject) reject("Firmware is currently downloading");
      else log_error("updating firmware", "software is currently downloading");
    }
    else if (state[3] == 2) //downloaded
    {
      //execute install
      exports.core_exec("5/0/2", null, urn, server,
        function(response) {
          if (response.status == 200) console.log("firmware has been updated, device is rebooting");
          if (resolve) resolve(response);
        },
        function(error){
          if (reject) reject(error);
          else log_error("activiating software", error);
        });
    }
    else if (state[7] == 3) //installed
    {
      if (reject) reject("Firmware is currently updating");
      else log_error("updating firmware", "firmware is currently updating");
    }
  }, reject);
}

/////////////////////////////////////////////////////////////////////////////////////////
// Security functions
function make_bs_url(server)
{
  return "https://bs." + defaults.check_server_name(server) + "/api/bootstrap";
}

function make_bs_client_url(path, urn, server)
{
  var url = make_bs_url(defaults.check_server_name(server));
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


exports.bs_get= function(path, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_bs_url(server);
    log_debug("GET " + url);
     request.get(url)
      .ca(certs.ca)
      .cert(certs.crt)
      .key(certs.key)
      .set('Content-Type', 'application/json')
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
exports.bs_post= function(path, body, urn, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_bs_client_url(path, urn, server);
    log_debug("POST " + url);
    log_debug("Body: " + JSON.stringify(body));
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

exports.bs_delete= function(path, urn, server, resolve, reject)
{
  try
  {
    var certs = get_certs(server);
    var url = make_bs_client_url(path, urn, server);
    log_debug("DELETE " + url);
    request.delete(url)
      .ca(certs.ca)
      .cert(certs.crt)
      .key(certs.key)
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


function hexToBytes(hex)
{
  for (var bytes = [], c = 0; c < hex.length; c += 2)
  {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function strToBytes(str)
{
  var codes = str.split("");
  for (var i = 0; i < codes.length; i++)
  {
    codes[i] = codes[i].charCodeAt(0);
  }
  return codes;
}

exports.security_list_endpoints = function(server, resolve, reject)
{
  exports.bs_get("", server, function(response) {
    if (response.status == 200)
    {
      //the package is now downloading.
      if (resolve) resolve(response);
    }
    else
    {
      if (reject) reject(response);
    }
  },
  function(error){
    if (reject) reject(error);
    else log_error("listing endpoint security", error);
  });
}

exports.security_add_endpoint = function(PSK_bootstrap, PSK_core, urn, server, resolve, reject)
{
  var security_object = {
    "servers": {
        "1": {
            "shortId": "1"
        }
      },
      "security": {
          "0": {
              "uri": "coaps://[2001:db8::1]:5684/",
              "bootstrapServer": true,
              "securityMode": "PSK",
              "serverPublicKeyOrId": [],
              "publicKeyOrId": [],
              "secretKey": [],
              "serverId": "0"
          },
          "1": {
              "uri": "coaps://[2001:db8::2]:5684/",
              "securityMode": "PSK",
              "serverPublicKeyOrId": [],
              "publicKeyOrId": [],
              "secretKey": [],
              "serverId": "1"
          }
      }
  }

  security_object.security[0].uri = "coaps://" + defaults.check_server_name(server) + ":5644/";
  security_object.security[0].serverPublicKeyOrId = strToBytes(defaults.check_server_name(server) );
  security_object.security[0].publicKeyOrId = strToBytes(urn);
  security_object.security[0].secretKey = hexToBytes(PSK_bootstrap);

  security_object.security[1].uri = "coaps://" + defaults.check_server_name(server) + ":5684/";
  security_object.security[1].serverPublicKeyOrId = strToBytes(defaults.check_server_name(server) );
  security_object.security[1].publicKeyOrId = strToBytes(urn);
  security_object.security[1].secretKey = hexToBytes(PSK_core);

  exports.bs_post("", security_object, urn, server,
    function(response) {
      if (response.status == 200)
      {
        //the package is now downloading.
        if (resolve) resolve(response);
      }
      else
      {
        if (reject) reject(response);
      }
    },
    function(error){
      if (reject) reject(error);
      else log_error("adding endpoint security", error);
    });
}

exports.security_delete_endpoint = function(urn, server, resolve, reject)
{
  exports.bs_delete("", urn, server, function(response)
  {
    if (response.status == 204)
    {
      //the package is now downloading.
      if (resolve) resolve(response);
    }
    else
    {
      if (reject) reject(response);
    }
  },
  function(error){
    if (reject) reject(error);
    else log_error("deleting security", error);
  });
}

