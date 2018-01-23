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

## Setup default server

Add a file called `defaults` into `~/.gtcli` with the following:

```
{
  "server" : "server-01.gridthin.gs"
}
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

To get all device and resources from a default server
```
gtcli stream . .
```

# Development

For development you will want to link to the files in this repo so that when you change the cli it is
updated

> sudo npm link
