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

program
  .arguments('[server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(server) 
  {
    gtapi.log_level = program.verbose ? 1 : 0;
    print_json = program.json;
  
    gtapi.security_list_endpoints(server, function(response)
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

//         {
//   "urn:imei:355922062171679": {
//     "servers": {
//       "1": {
//         "shortId": 1,
//         "lifetime": 86400,
//         "defaultMinPeriod": 1,
//         "notifIfDisabled": true,
//         "binding": "U"
//       }
//     },
//     "security": {
//       "0": {
//         "uri": "coaps://actewagl-01.gridthin.gs:5644/",
//         "bootstrapServer": true,
//         "securityMode": "PSK",
//         "publicKeyOrId": [
//           117,
//           114,
//           110,
//           58,
//           105,
//           109,
//           101,
//           105,
//           58,
//           51,
//           53,
//           53,
//           57,
//           50,
//           50,
//           48,
//           54,
//           50,
//           49,
//           55,
//           49,
//           54,
//           55,
//           57
//         ],
//         "serverPublicKey": [],
//         "secretKey": [
//           0,
//           17,
//           34,
//           51
//         ],
//         "smsSecurityMode": "NO_SEC",
//         "smsBindingKeyParam": [],
//         "smsBindingKeySecret": [],
//         "serverSmsNumber": "",
//         "serverId": 0,
//         "clientOldOffTime": 1,
//         "bootstrapServerAccountTimeout": 0
//       },
//       "1": {
//         "uri": "coaps://actewagl-01.gridthin.gs:5684/",
//         "bootstrapServer": false,
//         "securityMode": "PSK",
//         "publicKeyOrId": [
//           117,
//           114,
//           110,
//           58,
//           105,
//           109,
//           101,
//           105,
//           58,
//           51,
//           53,
//           53,
//           57,
//           50,
//           50,
//           48,
//           54,
//           50,
//           49,
//           55,
//           49,
//           54,
//           55,
//           57
//         ],
//         "serverPublicKey": [],
//         "secretKey": [
//           68,
//           85,
//           102
//         ],
//         "smsSecurityMode": "NO_SEC",
//         "smsBindingKeyParam": [],
//         "smsBindingKeySecret": [],
//         "serverSmsNumber": "",
//         "serverId": 1,
//         "clientOldOffTime": 1,
//         "bootstrapServerAccountTimeout": 0
//       }
//     }
//   }
// }


        //console.log(response.status + " " + response.text);
      }
    }, 
    function(err)
    {
      console.log("error:" + err);
    })
  })
  .parse(process.argv);