# gridthings cli
Command line tools for working with a Gridthings Edge Server

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

Add a file called `default` into `~/.gtcli` with the following:

```
{
  "server" : "server-01.gridthin.gs"
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

# Development

For development you will want to link to the files in this repo so that when you change the cli it is 
updated

> sudo npm link
