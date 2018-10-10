exports.definitions = {
  "token": {
    "required": [
      "token"
    ],
    "properties": {
      "token": {
        "type": "string",
        "uniqueItems": true
      }
    }
  }
}
;

exports.paths = {
  "/token": {
    "post": {
      "tags": [
        "token"
      ],
      "parameters": [
        {
          "name": "body",
          "in": "body",
          "required": true,
          "schema": {
            "type": "object",
            "properties": {
              "userId": {
                "type": "string",
                "description": "Username to authenticate to gridthings",
                "example": "username"
              },
              "password": {
                "type": "string",
                "description": "Password to authenticate to gridthings",
                "example": "password"
              }
            }
          }
        }
      ],
      "produces": [
        "application/json"
      ],
      "summary": "Get JWT token for api authentication",
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "$ref": "#/definitions/token"
          }
        }
      }
    }
  }
}
