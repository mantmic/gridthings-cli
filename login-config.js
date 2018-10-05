
const os = require('os');
var fs = require("fs");

const path = require('path');
var login_path = path.join(os.homedir(), '.gtcli', 'config');



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

exports.set_config = function(config){
  fs.writeFile(login_path,JSON.stringify(config), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("defaults saved");
  });
}
;

var config = {};
try
{
  config = JSON.parse(fs.readFileSync(login_path, 'utf8'));
}
catch (e)
{
  console.log("Creating config file")
  exports.set_config({})
}
