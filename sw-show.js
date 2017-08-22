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

function get_resource(instance_id, resource_id, content)
{
  for (var instance = 0; instance < content.instances.length; instance++)
  {
    if (content.instances[instance].id == instance_id)
    {
       for (var resource = 0;  resource < content.instances[instance].resources.length; resource++)
       {
          if (content.instances[instance].resources[resource].id == resource_id)
          {
            return content.instances[instance].resources[resource].value;
          }
       }
    }
  }
  return null;
}

program
  .arguments('<urn> <server>')
  .option('-v, --verbose', 'Be verbose')
  .action(function(urn, server) {
    gtapi.log_level = 1;//program.verbose;
    print_json = false;
    gtapi.software_get(urn, server, function(response)
    {
      if (response.status == 200)
      {
        if (print_json)
        {
          console.log(response.text);
        }
        else
        {
          var contents = JSON.parse(response.text);

          if (contents.status == "CONTENT")
          {
            for (var instance_id = 0; instance_id < contents.content.instances.length; instance_id++)
            {
              var pkg_name = get_resource(instance_id, 0, contents.content);
              console.log("Software Instance " + instance_id + ":");

              if (pkg_name == "") 
              {
                console.log("  no package installed");
              }
              else
              {
                console.log("  name: " + pkg_name);
                console.log("  version: " + get_resource(instance_id, 1, contents.content));
                console.log("  uri: " + get_resource(instance_id, 3, contents.content));
                console.log("  update state: " + get_resource(instance_id, 7, contents.content));
                console.log("  update result: " + get_resource(instance_id, 9, contents.content));
                console.log("  activation state: " + get_resource(instance_id, 12, contents.content));
              }
            }
          }
          else
          {
            console.log("device returned " + contents.status);
          }
        }
      }
      else
      {
        console.log(response.status + " " + response.text);
      }
    })
  })
  .parse(process.argv);