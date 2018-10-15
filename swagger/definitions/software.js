exports.definitions = {
}
;

exports.paths = {
  "/software/show/{endpoint}": {
    "get": {
      "tags": [
        "software"
      ],
      "summary": "Show the software deployed at an endpoint",
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The endpoint to show software for",
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
  "/software/autodeploy/{endpoint}?package={package}&slot={slot}": {
    "get": {
      "tags": [
        "software"
      ],
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The endpoint to deplot software to",
          "example": "urn:slipi:002f001b5836500d2031363"
        },
        {
          "name": "package",
          "in": "path",
          "description": "The hashId of the package to deploy to the endpoint",
          "example": "mzzLjG97"
        },
        {
          "name": "slot",
          "in": "path",
          "description": "The slot to deploy the package to",
          "example": "0"
        }
      ],
      "summary": "Deploy a software package to an endpoint, slot",
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
