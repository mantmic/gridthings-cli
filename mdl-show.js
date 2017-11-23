#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');

var resource_name_map = {
  0:  {  "name": "Channel_Number", "include" : true },
  1:  {  "name": "Meter_ID", "include" : true },
  2:  {  "name": "K_Factor", "include" : true },
  3:  {  "name": "Format", "include" : true },
  4:  {  "name": "Raw_Count", "include" : true },
  5:  {  "name": "Energy", "include" : true },
  6:  {  "name": "Units", "include" : true },
  7:  {  "name": "Alarm", "include" : true },
  8:  {  "name": "Write To MDL", "include" : false},
  9:  {  "name": "Clear Tamper", "include" : false},
  10: {  "name": "Clear Power Fail",  "include" : false},
  11: {  "name": "Reset To Default Settings", "include" : false},
  12: {  "name": "Set Data Time", "include" : false},
  13: {  "name": "Write Result", "include" : false},
  14: {  "name": "RMU ID", "include" : false},
  15: {  "name": "Load From MDL", "include" : false}
}


function create_rmu_file(data)
{
  var file = {};
  
  for (var i = 0; i < data.resources.length; i++)
  {
    var resource = data.resources[i];
  
    var id = parseInt(resource.id);
    if (id == 14)
    {
      file["rmu"] = parseInt(resource.value);
    }

    if (id in resource_name_map)
    {
      
      var resource_cfg = resource_name_map[id];
     
      if (resource_cfg.include)
      {
        file[resource_cfg.name] = resource.values;
      }
    }
  }
  return file;
}

program
  .arguments('<endpoint> <rmu> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, rmu, server) {
    if (server === undefined) server = ".";
    if (program.verbose) gtapi.log_level = 1;
    print_json = program.json;
    delimeter = ": ";

    var rmu_id_resource = "32002/0/14";
    var config_resource = "32002/0";
    var load_from_mdl_resource = "32002/0/15";

    var put_obj = {};
    put_obj.id = "14";
    put_obj.value = parseInt(rmu);

    if (program.verbose) console.log("reading rmu " + put_obj.value);

    //set the rmu id
    gtapi.core_put(rmu_id_resource, put_obj, urn, server, 
      function(response) 
      {
        if (response.status == 200)
        {
          //load the data from the MDL
          gtapi.core_exec(load_from_mdl_resource, null, urn, server, 
            function(response) {
              if (response.status == 200) 
              {
                //read the config
                gtapi.core_get(config_resource, urn, server, 
                  function(response) 
                  {
                    var file = create_rmu_file(JSON.parse(response.text).content);

                    if (response.status == 200) 
                    {
                      //got the file
                      if (print_json)
                      {
                        console.log(JSON.stringify(file, null, 2));
                      }
                      else
                      {
                        console.log("MDL Read for RMU:" + file.rmu);
                        for (var i = 0; i < 32; i++)
                        {
                          if (file.Channel_Number[i] != undefined)
                          {
                            console.log(
                              file.Channel_Number[i] + "\t" +
                              file.Meter_ID[i] + "\t" +
                              file.K_Factor[i] + "\t" +
                              file.Format[i] + "\t" +
                              file.Raw_Count[i] + "\t" +
                              file.Energy[i] + "\t" +
                              file.Units[i] + "\t" +
                              file.Alarm[i]
                            );
                          }
                        }
                      }
                    }
                    else
                    {
                      console.log("Unexpected response code when reading from the modem (" + response.status + ")");
                    }
                  },
                  function(error)
                  { 
                    console.log("Failed to read the config from the modem\n\n" + error);
                  });
              }
              else
              {
                console.log("Unexpected response code when loading config from the MDL (" + response.status + ")");
              }
            },
            function(error)
            { 
              console.log("Failed to load the config from the MDL\n\n" + error);
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