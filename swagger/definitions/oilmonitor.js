exports.definitions = {}
;

exports.paths = {
  "/oilmonitor/image/{endpoint}?atTimestamp={atTimestamp}": {
    "get": {
      "tags": [
        "oilmonitor"
      ],
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The name of the environment to set as default",
          "example": "urn:slipi:002f001b5836500d2031363"
        },
        {
          "name": "atTimestamp",
          "in": "path",
          "description": "Used to get the latest image as of this timestamp. By default the latest image in the db is returned",
          "example": "2199-12-31T12:30:00"
        },
      ],
      "summary": "Get the latest oilmonitor image for a given endpoint as of a given timestamp",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
}
