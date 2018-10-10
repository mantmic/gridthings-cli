exports.definitions = {
  "environmentList": {
    "required": [
      "defaultEnvironment",
      "environment"
    ],
    "properties": {
      "environment": {
        "type": "array"
      },
      "defaultEnvironment": {
        "type": "string"
      }
    }
  }
}
;

exports.paths = {
  "/environment/list": {
    "get": {
      "tags": [
        "environment"
      ],
      "summary": "Get environments accessible to current user",
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/environmentList"
          }
        }
      }
    }
  },
  "/environment/set/{server}": {
    "get": {
      "tags": [
        "environment"
      ],
      "parameters": [
        {
          "name": "server",
          "in": "path",
          "description": "The name of the environment to set as default",
          "example": "ched-01.gridthin.gs"
        }
      ],
      "summary": "Set default environment for user",
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
}
