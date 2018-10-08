# gridthings cli
Command line tools for working with a Gridthings Edge Server

First must install node (v8.9.2 tested) and npm (v5.5.1 tested)
To Install:

> sudo npm install -g

# setup

Configuration settings are located in `~/.gtcli`, so you need to create that directory first.

> mkdir ~/.gtcli

## Add a new server

For the CLI tool to access a server it must have access to the server's client certificate, key and the ca certifcate. This is done by putting
these files into the ~/.gtcli directory under a folder named with the servers base host name.

Copy the certificates from your server to `~/.gtcli/{DOMAIN}`, the example below it for the default Ubuntu built servers.

```
> mkdir mkdir ~/.gtcli/server-01.gridthin.gs
> cd  ~/.gtcli/server-01.gridthin.gs
> ssh ubuntu@server-01.gridthin.gs 'sudo cp /root/gridthings-edge/nginx/certs/*client* ~/'
> ssh ubuntu@server-01.gridthin.gs 'sudo cp /root/gridthings-edge/nginx/certs/ca.crt ~/'

> scp ubuntu@server-01.gridthin.gs:~/*client* .
> scp ubuntu@server-01.gridthin.gs:~/ca.crt .
```

The CLI is looking for the following certiciate files

```
 ~/.gtcli/[server]/[server]-client.key
 ~/.gtcli/[server]/[server]-client.pem
 ~/.gtcli/[server]/ca.crt
```

Currently the CLI doesn't support providing a passphrase for the client certificate so we must remove it using openssl

```
openssl rsa -in server-01.gridthin.gs-client.key -out server-01.gridthin.gs-client.key
```
## List servers

To list the configured servers run the following
```
gtcli environment list
```


## Setup default server

Set the default server with the environment set command
```
gtcli environment set server-01.gridthin.gs
```


### Field definitions

* `server` - this specifies the default server address to connect to.

* `<server_address>` - e.g. `"actewagl-01.gridthin.gs"` this field contains server specific settings
    - `jwt_secret` - **No idea what this secret key is... it's used when reading a stream**
    - `stream_reader` - specifies to stream reader the kind of reader it is. (e.g. `kinesis`, `eventhub` and `websocket`)

### Example

In `~/.gtcli/defaults`

```
{
  "server" : "actewagl-01.gridthin.gs",
  "actewagl-01.gridthin.gs":{
    "jwt_secret":"...xxx...",
    "stream_reader":"eventhub"
  },
  "some-other-server.gs":{
    "jwt_secret":"...xxx...",
    "stream_reader":"websocket"
  }
}
```



# Examples

Get help
```
gtcli --help
```

Get all devices that are registered with the server
```
gtcli devices server-01.gridthin.gs
```

or to use the default server
```
gtcli devices .
```

To add an SSN device to be managed by the service
```
gtcli ssn add SSN00135005003cb872.SG.PROD.STAR.SSNSGS.NET .
```

To force the server to poll the SSN gateway for a device
```
gtcli ssn poll SSN00135005003cb872.SG.PROD.STAR.SSNSGS.NET .
```

To release a new package to the server
```
gtcli-package-publish -v build/iot-mdl.gta .
```

To push in a new app to a device app slot 0 and activate it (then deactivate it).
```
gtcli software push 0 5qZvWxJr urn:imei:355922062171570  .
gtcli software show urn:imei:355922062171570  .
gtcli software activate 0 urn:imei:355922062171570 .
gtcli software deactivate 0 urn:imei:355922062171570 .
gtcli software uninstall 0 urn:imei:355922062171570 .
```



## Stream of lwm2m resources

To get all resource from a device from a default server

```
DID=urn:imei:352753090104975 # Device ID
gtcli stream ${DID} . .
```

Example output:

```
$ gtcli stream urn:imei:352753090104975 . . .
Created partition receiver: 1
Created partition receiver: 0
DEREGISTRATION urn:imei:352753090104975 2018-07-12T02:33:09.235077  lifetime 3600
REGISTRATION urn:imei:352753090104975 2018-07-12T02:33:09.243707  lifetime 3600
urn:imei:352753090104975  Thu Jul 12 2018 12:33:15 GMT+1000 (AEST)  undefined/undefined/undefined [object Object]
urn:imei:352753090104975  Thu Jul 12 2018 12:30:41 GMT+1000 (AEST)  30001/321/4 true
urn:imei:352753090104975  Thu Jul 12 2018 12:35:11 GMT+1000 (AEST)  30005/0/0/0 2,-125,25,1,65,3,-127,-125,26,91,70,-67,81,1,0
urn:imei:352753090104975  Thu Jul 12 2018 12:30:41 GMT+1000 (AEST)  30001/327/9030/0  478
urn:imei:352753090104975  Thu Jul 12 2018 12:30:41 GMT+1000 (AEST)  30001/342/4 true
urn:imei:352753090104975  Thu Jul 12 2018 12:35:11 GMT+1000 (AEST)  30005/0/0/2 2,-125,25,1,86,3,-127,-125,26,91,7
... futher stream output
```

## Remote Update Of Device Firmware

First publish firmware

```
GTF_PATH=build/example_firmware.gtf

# Publish Firmware To Package Server
gtcli package publish -v ${GTF_PATH} .
```

Publishing will return a package hash id which you can then use to publish:

```
DEVICE_URI="urn:slipi:00160021544350012034335"
PACKAGE_HASH_ID=EAgqQO3Q

gtcli firmware push ${PACKAGE_HASH_ID} ${DEVICE_URI} .
gtcli firmware update ${DEVICE_URI} .
gtcli firmware show ${DEVICE_URI} .
```

## Remote Update Of Device App

```
GTA_PATH=example_app.gtf

gtcli-package-publish -v ${GTA_PATH}
```

Publishing will return a package hash id which you can then use to publish:

```
DEVICE_URI="urn:slipi:00270046544350012034335"
PACKAGE_HASH_ID=51bor0eD

gtcli software deactivate 0 ${DEVICE_URI} .
gtcli software uninstall 0 ${DEVICE_URI} .
gtcli software push 0 ${PACKAGE_HASH_ID} ${DEVICE_URI}  .
gtcli software show ${DEVICE_URI}  .
gtcli software activate 0 ${DEVICE_URI} .
```


# Development

For development you will want to link to the files in this repo so that when you change the cli it is
updated

> sudo npm link

# API

Details on API endpoints can be found at the swagger docs at the root of the API deployment

```
https://api.gridthin.gs
```

## Websockets

For real-time data streams,there is a websocket for every environment. Each are hosted at wss://{apihost}/stream/{environment}

Example
```
wss:api.gridthin.gs/stream/ched-01.gridthin.gs
```

Once connecting, the client must send a valid token to the host before the stream will send the data to the client. The host will send the following message when a client connects.
```
{
  "message": "Send API authencation key to access stream"
}
```

Once authenticated, the websocket will send the following message to the client
```
{
  "message": "Access granted"
}
```

Any other message will either indicate an error, or will deny a user access to the environment due to that user's permissions.

# API Deployment

Ensure that whatever machine this deployment will run from has gtcli configured to access all required environments.

Copy the contents of .gtcli to this repository directory prior to deployment.

```
cp -R ~/.gtcli .
```

## SSH Certificates
Currently we only have self-signed certificates as an option for deployment.

## AWS Cloudformation

Create stack
```
aws cloudformation create-stack --stack-name gtapi --capabilities CAPABILITY_NAMED_IAM --template-body file:///`pwd`/gridthings-api.json --parameters file:///`pwd`/gridthings-api.parameters
```

Delete stack
```
aws cloudformation delete-stack --stack-name gtapi
```

Add ssh key
```
cat ~/.ssh/id_rsa.pub | (ssh -i ~/ots/mantfeld-laptop.pem ubuntu@13.239.24.9 "cat >> ~/.ssh/authorized_keys")
```
