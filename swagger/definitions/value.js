exports.definitions = {
  "value": {
    "required": [
      "value_id"
    ],
    "properties": {
      "value_id": {
        "type": "number"
      },
      "timestamp": {
        "type": "string"
      },
      "endpoint": {
        "type": "string"
      },
      "uri_path": {
        "type": "string"
      },
      "value": {
        "type": "object"
      }
    }
  }
}
;

exports.paths = {
  "/value/latest/{endpoint}?uri_path={uri_path}": {
    "get": {
      "tags": [
        "value"
      ],
      "summary": "Show latest value for a given endpoint, resource",
      "parameters": [
        {
          "name": "endpoint",
          "in": "path",
          "description": "The endpoint to show firmware for",
          "example": "urn:slipi:002f001b5836500d2031363"
        },
        {
          "name": "uri_path",
          "in": "path",
          "description": "The uri_path of the resource",
          "example": "33000/0/1"
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  },
  "/value/{value_id}": {
    "get": {
      "tags": [
        "value"
      ],
      "summary": "Get a value by it's value_id",
      "parameters": [
        {
          "name": "value_id",
          "in": "path",
          "description": "The value_id of a value record",
          "example": "1"
        }
      ],
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/value"
          }
        }
      }
    }
  },
  "/value/push": {
    "post": {
      "tags": [
        "value"
      ],
      "summary": "Push a value into the gridthings database",
      "parameters": [
        {
          "name": "timestamp",
          "in": "body",
          "example": "2018-07-01T12:30:00"
        },
        {
          "name": "endpoint",
          "in": "body",
          "example": "urn:slipi:002f001b5836500d2031363"
        },
        {
          "name": "uri_path",
          "in": "body",
          "example": "0/0/0"
        },
        {
          "name": "value",
          "in": "body",
          "example": "test"
        }
      ],
      "responses": {
        "200": {
          "description": "OK"
        }
      }
    }
  }
}
