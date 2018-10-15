exports.definitions = {
}
;

exports.paths = {
  "/firmware/show/{endpoint}": {
    "get": {
      "tags": [
        "firmware"
      ],
      "summary": "Show the firmware deployed at an endpoint",
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The endpoint to show firmware for",
          "example": "urn:slipi:002f001b5836500d2031363"
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/firmware/autodeploy/{endpoint}?package={package}": {
    "get": {
      "tags": [
        "firmware"
      ],
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The endpoint to deploy firmware to",
          "example": "urn:slipi:002f001b5836500d2031363"
        },
        {
          "name": "package",
          "in": "path",
          "description": "The hashId of the packge to deploy to the endpoint",
          "example": "mlRwyJgy"
        }
      ],
      "summary": "Deploy a firmware package to an endpoint",
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/process"
          }
        }
      }
    }
  }
}
