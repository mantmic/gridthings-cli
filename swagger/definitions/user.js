exports.definitions = {
  "user": {
    "required": [
      "userId"
    ],
    "properties": {
      "userId": {
        "type": "string",
        "uniqueItems": true
      },
      "password":{
        "type": "string"
      }
    }
  }
}
;

exports.paths = {
  "/user/add": {
    "post": {
      "tags": [
        "user"
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
              },
              "environment":{
                "type": "object",
                "description":"Key = name of the environment to grant access to, the nested values define the user's permissions",
                "example":{
                  "evoenergy-01.gridthin.gs": {
              			"user": true,
              			"powerUser": true,
              			"admin": true
              		},
              		"actewagl-01.gridthin.gs": {
              			"user": true,
              			"powerUser": true,
              			"admin": true
              		},
              		"ched-01.gridthin.gs": {
              			"user": true,
              			"powerUser": true,
              			"admin": true
              		}
                },
                "properties":{
                  "user": {
                    "type": "boolean",
                    "description":"Allows a user to read information from an environment"
                  },
                  "powerUser": {
                    "type": "boolean",
                    "description":"Allows a user to execute commands on devices"
                  },
                  "admin": {
                    "type": "boolean",
                    "description":"Allows a user to grant others permissions to this environment"
                  }
                }
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
        }
      }
    }
  }
}
