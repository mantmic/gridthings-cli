exports.definitions = {
  "endpoint": {
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
  "/endpoint": {
    "get": {
      "tags": [
        "endpoint"
      ],
      "summary": "Get endpoints that have been saved in the gridthings database",
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/endpoint"
          }
        }
      }
    }
  }
}
