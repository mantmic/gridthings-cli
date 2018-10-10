exports.definitions = {
  "command": {
    "required": [
      "endpoint"
    ],
    "properties": {
      "endpoint": {
        "type": "string"
      }
    }
  },
  "process": {
    "required": [
      "processId"
    ],
    "properties": {
      "processId": {
        "type": "string"
      }
    }
  },
  "processStatus": {
    "required": [
      "processId"
    ],
    "properties": {
      "processId": {
        "type": "string"
      }
    }
  }
}
;

exports.paths = {
  "/command/show/{endpoint}": {
    "get": {
      "tags": [
        "command"
      ],
      "summary": "Show the queued commands for an endpoint",
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "example": "urn:slipi:002f001b5836500d2031363"
        }
      ],
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/command"
          }
        }
      }
    }
  },
  "/command/delete/{endpoint_command_id}": {
    "get": {
      "tags": [
        "command"
      ],
      "summary": "Delete an endpoint command in the queue",
      "parameters": [
        {
          "name": "endpoint_command_id",
          "in": "path",
          "example": "1"
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/command/push": {
    "post": {
      "tags": [
        "command"
      ],
      "summary": "Push a new command to the queue",
      "parameters": [
        {
          "name": "endpoint",
          "in": "body",
          "example": "urn:slipi:002f001b5836500d2031363"
        },
        {
          "name": "command",
          "in": "body",
          "example": "softwareAutodeploy"
        },
        {
          "name": "payload",
          "in": "path",
          "example": {}
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/process/{processId}": {
    "get": {
      "tags": [
        "command"
      ],
      "summary": "View the status of a long running process",
      "parameters": [
        {
          "name": "processId",
          "in": "path",
          "example": "processid"
        }
      ],
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/processStatus"
          }
        }
      }
    }
  }
}
