#!/usr/bin/env node

var program = require('commander');

var gtapi = require('./gt-api.js');

// {
// "status":"CONTENT",
// "content":{
//   "id":9,
//   "instances":[
//     {
//       "id":0,
//       "resources":[
//         {"id":0,"value":""},
//         {"id":1,"value":""},
//         {"id":9,"value":0},
//         {"id":12,"value":false},
//         {"id":7,"value":0}
//       ]
//     },
//     {"id":1,
//       "resources":[
//         {"id":0,"value":""},
//         {"id":1,"value":""},
//         {"id":9,"value":0},
//         {"id":12,"value":false},
//         {"id":7,"value":0}
//       ]
//    }]}}
//{"req":{"method":"GET","url":"https://core.manderson-01.gridthin.gs/api/clients/urn:slipi:00460036573650112032353/9","headers":{"user-agent":"node-superagent/3.6.0"}},"header":{"server":"nginx/1.13.3","date":"Tue, 22 Aug 2017 21:42:33 GMT","content-type":"application/json","transfer-encoding":"chunked","connection":"close","strict-transport-security":"max-age=31536000"},"status":200,"text":"{\"status\":\"CONTENT\",\"content\":{\"id\":9,\"instances\":[{\"id\":0,\"resources\":[{\"id\":0,\"value\":\"\"},{\"id\":1,\"value\":\"\"},{\"id\":9,\"value\":0},{\"id\":12,\"value\":false},{\"id\":7,\"value\":0}]},{\"id\":1,\"resources\":[{\"id\":0,\"value\":\"\"},{\"id\":1,\"value\":\"\"},{\"id\":9,\"value\":0},{\"id\":12,\"value\":false},{\"id\":7,\"value\":0}]}]}}"}

// function get_resource(instance_id, resource_id, content)
// {
//   for (var instance = 0; instance < content.instances.length; instance++)
//   {
//     if (content.instances[instance].id == instance_id)
//     {
//        for (var resource = 0;  resource < content.instances[instance].resources.length; resource++)
//        {
//           if (content.instances[instance].resources[resource].id == resource_id)
//           {
//             return content.instances[instance].resources[resource].value;
//           }
//        }
//     }
//   }
//   return null;
// }

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .option('-n, --nocache', 'Do not used cached values, hit the LWM2M server')
  .action(function(urn, server) {
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    no_cache = program.nocache ;
    gtapi.software_get(urn, no_cache, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response, null, 2));
      }
      else
      {
        for (var instance_id = 0; instance_id < 4; instance_id++)
        {
          var state = response[instance_id];

          console.log("Software Instance " + instance_id + ":");

          console.log("  Name:             " + (state[0] == "" ? "(none)" : state[0]));
          console.log("  Version:          " + (state[1] == "" ? "(none)" : state[1]));


          console.log("  Update state:     " + gtapi.update_state_to_string(state[7]));
          console.log("  Update result:    " + gtapi.update_result_to_string(state[9]));
          console.log("  Activation state: " + state[12]);
          console.log("  Bytes downloaded: " + state[30005]);
        }
      }
    })
  })
  .parse(process.argv);
