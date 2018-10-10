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
  "/environment/list?token={token}": {
    "get": {
      "tags": [
        "environment"
      ],
      "parameters": [
        {
          "name": "token",
          "in": "path",
          "description": "The token, returned from /token, to use for authentication"
        }
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
  "/environment/set/{server}?token={token}": {
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
        },
        {
          "name": "token",
          "in": "path",
          "description": "The token, returned from /token, to use for authentication"
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
