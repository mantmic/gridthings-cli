exports.definitions = {
}
;

exports.paths = {
  "/lwm2m/values/{endpoint}": {
    "get": {
      "tags": [
        "lwm2m"
      ],
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The endpoint to pull lwm2m resources for",
          "example": "urn:slipi:002f001b5836500d2031363"
        }
      ],
      "summary": "Get all lwm2m resource values for a given endpoint",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
}
