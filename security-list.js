#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

function bytes2string(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) 
  {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

function bytes2HexString(bytes) 
{
  return bytes.map(function(byte) 
  {
    var result = "";
    if (byte < 0x10) result += "0";
    result += (byte & 0xFF).toString(16);
    return result;
  }).join('')
}

var _server = ".";

program
  .arguments('[server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .description("List the PSKs and addresses for devices in the security table")
  .action(function(server) 
  {
    _server = server;
  })
  .parse(process.argv);



gtapi.log_level = program.verbose ? 1 : 0;
print_json = program.json;
  
gtapi.security_list_endpoints(_server, function(response)
{
  var body = JSON.parse(response.text);
  if (print_json)
  {
    console.log(JSON.stringify(body, null, 2));
  }
  else
  {

    console.log("Client\t\t\t\tserver\t\t\t\t\tKey");
    console.log("-----------------------------------------------------------------------------------------------------------------");
    for (var c in body)
    {
      console.log(c + "\t" + body[c]["security"][0].uri + "\t" + bytes2HexString(body[c]["security"][0].secretKey));
      console.log(c + "\t" + body[c]["security"][1].uri + "\t" + bytes2HexString(body[c]["security"][1].secretKey));
    
    }
  }
}, 
function(err)
{
  console.log("error:" + err);
});