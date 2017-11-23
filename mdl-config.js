#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');


program
  .arguments('<endpoint> <rmu> <config> [server]')
  .option('-v, --verbose', 'Be verbose')
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
                    console.log("done, checking result...");

                    gtapi.core_get(write_result_resource, urn, server, 
                      function(response) 
                      {
                        if (response.status == 200) 
                        {
                          var resp_obj = JSON.parse(response.text);
                          console.log("write complete with status '" + resp_obj.content.value + "'");
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