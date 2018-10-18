#!/usr/bin/env node

var program = require('commander');
var gtapi = require('./gt-api.js');
var Helpers = require('./dred-helpers.js');

var wrongArguments = true;


function color_mode_str(color_mode)
{
  switch (color_mode)
  {
    case 1: return "Greyscale";
    case 3: return "Full Colour";
    default: return color_mode;
  }
}

function print_olm(olm_object, urn)
{
  var olm_resources = {};
  olm_object.content.resources.map(function(i) { olm_resources[i.id] = i.value; });

  var cam_name           = olm_resources[0];
  var crop_X             = olm_resources[1];
  var crop_Y             = olm_resources[2];
  var crop_width         = olm_resources[3];
  var crop_height        = olm_resources[4];
  var jpeg_quality       = olm_resources[5];
  var led_1_brightness   = olm_resources[6];
  var led_2_brightness   = olm_resources[7];
  var led_3_brightness   = olm_resources[8];
  var color_mode   = olm_resources[9];

  console.info("Oil Level Monitor " + urn);
  console.info("  Name:           " + cam_name        );
  console.info("  Crop X:         " + crop_X          );
  console.info("  Crop Y:         " + crop_Y          );
  console.info("  Crop Width:     " + crop_width      );
  console.info("  Crop Height:    " + crop_height     );
  console.info("  JPEG Quality:   " + jpeg_quality    );
  console.info("  LED 1:          " + led_1_brightness);
  console.info("  LED 2:          " + led_2_brightness);
  console.info("  LED 3:          " + led_3_brightness);
  console.info("  color_mode:     " + color_mode_str(color_mode));

  if ((crop_width == 0) || (crop_width > 320))
    console.info("WARN: Crop Width may be invalid");

  if ((crop_height == 0 ) || (crop_height > 240))
    console.info("WARN: Crop Height may be invalid");

  if (crop_X + crop_width > 320)
    console.info("WARN: Crop on x axis may be invalid");

  if (crop_Y + crop_height > 240)
    console.info("WARN: Crop on y axis may be invalid");

  if ( (led_1_brightness > 100) ||  (led_2_brightness > 100) || (led_3_brightness > 100) )
    console.info("WARN: LED brightness may be invalid");

}

program
  .arguments('<urn> [server]')
  .option('-v, --verbose', 'Be verbose')
  .option('-j, --json', 'Print repsonse as JSON')
  .action(function(urn, server) {
    wrongArguments = false;

    if (program.verbose) {
      gtapi.log_level = 1;
    }

    gtapi.core_get('30009/0', urn, server, function (olm_res) {

      console.log(olm_res.text);
      var olm_object = JSON.parse(olm_res.text);
      if (program.json)
      {
        var json_obj = { "olm" : olm_object};
        console.info(JSON.stringify(json_obj, null, 2));
      }
      else
      {
        print_olm(olm_object, urn);
      }
    },
    function (error)
    {
      Helpers.displayError("getting olm object", error);
    });
  })
  .parse(process.argv);

if (wrongArguments == true) {
  program.help();
}
