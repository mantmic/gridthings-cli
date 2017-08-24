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
  .arguments('<urn> <server>')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = false;
    gtapi.software_get(urn, server, function(response)
    {
      if (print_json)
      {
        console.log(JSON.stringify(response));
      }
      else
      {
        for (var instance_id = 0; instance_id < 2; instance_id++)
        {
          var state = response[instance_id];
         
          console.log("Software Instance " + instance_id + ":");

          console.log("  name:             " + (state[0] == "" ? "(none)" : state[0]));
          console.log("  version:          " + (state[1] == "" ? "(none)" : state[1]));
          

          console.log("  update state:     " + gtapi.update_state_to_string(state[7]));
          console.log("  update result:    " + state[9]);
          console.log("  activation state: " + state[12]);
        }
      }
    })
  })
  .parse(process.argv);