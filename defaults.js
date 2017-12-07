
const os = require('os');
var fs = require("fs");

var defaults_path = os.homedir() + '/.gtcli/defaults';

var config = {};
try
{
  config = JSON.parse(fs.readFileSync(defaults_path, 'utf8'));
}
catch (e)
{
  console.log("error in defaults file " + defaults_path +  " " + e);
}

//apply default
exports.check_server_name = function(server)
{
  if (server === undefined) server = ".";
  if (server == ".") { return config.server; }
  return server;
}

exports.get_config = function()
{
  return config;
}