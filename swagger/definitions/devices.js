exports.definitions = {
  "devices": {
    "required": [
      "endpoint"
    ],
    "properties": {
      "endpoint": {
        "type": "string"
      }
    }
  }
}
;

exports.paths = {
  "/devices": {
    "get": {
      "tags": [
        "devices"
      ],
      "summary": "Get devices currently registered with lwm2m",
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/devices"
          }
        }
      }
    }
  }
}
