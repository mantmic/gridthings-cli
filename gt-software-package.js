
var fs = require('fs');
var Hashids = require('hashids');

//
// load a software package from a file, returning 
// a stucture conting the information from the file
// typedef enum gt_package_type
// {
//   pt_firmware = 0xAA,
//   pt_application = 0x55
// } gt_package_type;
// #define GT_PACKAGE_SIGNATURE_SIZE 32
// #define GT_PACKAGE_MAX_DATA_SIZE (750 * 1024)
// #define GT_PACKAGE_MAX_FIRMWARE_SIZE GT_PACKAGE_MAX_DATA_SIZE
// #define GT_PACKAGE_MAX_APPLICATION_SIZE (128 * 1024)

// #define GT_PACKAGE_MAX_HASH_ID 14 //max long long hashid
// #define GT_PACKAGE_MAX_NAME 24
// #define GT_PACKAGE_MAX_VERSION 24
// #define GT_PACKAGE_VERSION 0x01

// #define GT_HASHID_SALT "ducupusuhi10"
// #define GT_HASHIDS_DEFAULT_ALPHABET "abcdefghijklmnopqrstuvwxyz" \
//                                     "ABCDEFGHIJKLMNOPQRSTUVWXYZ" \
//                                     "1234567890"\
//
//   struct body
//   {
//     uint8_t signature[GT_PACKAGE_SIGNATURE_SIZE];

//     struct header
//     {
//       uint8_t package_version;
//       uint8_t name[GT_PACKAGE_MAX_NAME + 1];
//       uint8_t version[GT_PACKAGE_MAX_VERSION + 1];
//       uint8_t package_type;
//       uint32_t data_length;
//     } header;

//     uint8_t data[GT_PACKAGE_MAX_DATA_SIZE];
//   } body;
// }
// gt_package_t;

var GT_PACKAGE_SIGNATURE_SIZE = 32;
var GT_PACKAGE_MAX_NAME       = 24;
var GT_PACKAGE_MAX_VERSION    = 24;

function package_toString(package)
{
  return package.type + ":\n " + 
    "name:      " + package.name + "\n " +
    "version:   " + package.version + "\n " + 
    "signature: " + package.signature + "\n " + 
    "hashid:    " + package.hashid + "\n " + 
    "size:      " + package.data_length  + " bytes";
}

exports.from_mongo = function(mongo_record)
{
  var package = {};
  package.hashid = mongo_record._id;
  package.signature = mongo_record.signature;
  package.version = mongo_record.version;
  package.name = mongo_record.name;
  package.type = mongo_record.type;
  package.data_length = mongo_record.payload_length;
  package.toString = function () { return package_toString(package); }
  return package;
}

exports.load =function(filename)
{
  var package = {};
  package.data = fs.readFileSync(filename);
  package.signature = package.data.slice(0, GT_PACKAGE_SIGNATURE_SIZE).toString("hex");
  var parse_index = GT_PACKAGE_SIGNATURE_SIZE;
  package.version = package.data.readUInt8(parse_index);
  parse_index++;
  package.name = package.data.slice(parse_index, parse_index + GT_PACKAGE_MAX_NAME + 1).toString();
  parse_index += GT_PACKAGE_MAX_NAME + 1;
  package.version = package.data.slice(parse_index, parse_index + GT_PACKAGE_MAX_VERSION + 1).toString();
  parse_index += GT_PACKAGE_MAX_VERSION + 1;

  type = package.data.readUInt8(parse_index);

  switch(type)
  {
    case 0xAA: package.type = "firmware"; break;
    case 0x55: package.type = "application"; break;
    case 0xBB: package.type = "patch"; break;
    case 0xCC: package.type = "user"; break;
    case 0xDD: package.type = "bootloader"; break;
  };

  parse_index++;
  package.data_length = package.data.readUInt32LE(parse_index);
  parse_index += 4;
  package.payload = package.data.slice(parse_index, parse_index + package.data_length);

  var hashids = new Hashids('ducupusuhi10', 8, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
  package.hashid = hashids.encode(package.data.readUInt32LE(0));

  package.toString = function () { return package_toString(package);}

  //gets a Mongo DB record for the package
  package.toMongo = function()
  {
     var bindata = new require('mongodb').Binary(package.data);
     return { 
       "package" : bindata,
       "hashid": package.hashid, 
       "signature" : package.signature,
       "version": package.version,
       "name": package.name,
       "type": package.type,
       "payload_length":package.data_length
     };
  }
  return package;
}
