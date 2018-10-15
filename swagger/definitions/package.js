exports.definitions = {
  "package": {
    "required": [
      "hashid"
    ],
    "properties": {
      "hashid": {
        "type": "string"
      },
      "signature":{
        "type": "string"
      },
      "version": {
        "type": "string"
      },
      "name":{
        "type": "string"
      },
      "type":{
        "type": "string",
        "description":"Either application for device software, or firmware for device firmware"
      },
      "data_length":{
        "type": "number"
      }
    }
  }
}
;

exports.paths = {
  "/package/list": {
    "get": {
      "tags": [
        "package"
      ],
      "summary": "Get packages available in the environment",
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/package"
          }
        }
      }
    }
  }
}
