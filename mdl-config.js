#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');

function append_space(str, size) 
{
  var s =  str + "                       ";
  return s.substr(0, size);
}

program
  .arguments('<endpoint> <rmu> <config> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, rmu, config, server) {
    if (program.verbose) gtapi.log_level = 1;
    if (server === undefined) server = ".";

    var rmu_id_resource = "32002/0/14";
    var config_resource = "32002/0/16";
    var load_config_resource = "32002/0/8";
    var clear_config_resource = "32002/0/11";
    var write_result_resource = "32002/0/13";

    var put_obj = {};
    put_obj.id = "14";
    put_obj.value = parseInt(rmu);

    if (config.split("\r\n").length > 1)
    {
      console.log("too many meters is configuation, maximum of 1 per request is supported");
      return;
    }
    if (program.verbose) console.log("writing rmu " + put_obj.value);

    //set the rmu id
    gtapi.core_put(rmu_id_resource, put_obj, urn, server, 
      function(response) 
      {
        if (response.status == 200)
        {
          var config_put_obj = {};
          config_put_obj.id = "16";
          config_put_obj.value = config;
          //write the config
          gtapi.core_put(config_resource, config_put_obj, urn, server, 
            function(response) 
            {
              if (response.status == 200) 
              {
                gtapi.core_exec(load_config_resource, null, urn, server, 
                  function(response) 
                  {
                    gtapi.core_get(write_result_resource, urn, server, 
                      function(response) 
                      {
                        if (response.status == 200) 
                        {
                          var resp_obj = JSON.parse(response.text);
                          resp_obj =  JSON.parse(resp_obj.content.value);
                          if (program.json) console.log(JSON.stringify(resp_obj, null, 2));
                          else
                          {
                            for (var i = 0; i < resp_obj.length; i++)
                            {
                              var response = resp_obj[i];
                              
                              console.log(
                                append_space(response.context, 14) +
                                append_space(response.success ? "OK" : "FAIL", 6) + 
                                "'" + append_space(response.command.replace("\r", ""), 20) + "'  " + 
                                response.error);
                            }
                          }
                        }
                        else
                        {
                          console.log("unexpected response code when reading  the load result from the modem (" + response.status + ")");
                        }
                      },
                      function(error)
                      { 
                        console.log("Failed to read the load result from the modem\n\n" + error);
                      });
                  },
                  function(error)
                  { 
                    console.log("Failed to load the config to the MDL\n\n" + error);
                  });
              }
              else
              {
                console.log("Unexpected response code when writing to the modem (" + response.status + ")");
              }
            },
            function(error)
            {
              console.log("Failed to write the config to the modem\n\n" + error);
            });
        }
        else
        {
          console.log("Unexpected response code when setting RMU ID (" + response.status + ")");
        }
      },
      function(error)
      { 
        console.log("Failed to set RMU ID\n\n" + error);
      });
    
  })
  .parse(process.argv);