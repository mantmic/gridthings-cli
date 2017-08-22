# gridthings-cli
Command line tools for working with the Gridthings Server

https://developer.atlassian.com/blog/2015/11/scripting-with-node/

> sudo npm install -g
> sudo npm link


# setup

> mkdir ~/.gtcli

## Add a new server

For the CLI tool to access a server it must have access to the server'd client certificate, key and the ca certifcate. This is done by putting 
these files into the ~/.gtcli directory under a folder named with the servers base host name.

Copy the certificates from the server to ~/.gtcli

```
> mkdir mkdir ~/.gtcli/manderson-01.gridthin.gs
> cd  ~/.gtcli/manderson-01.gridthin.gs 
> ssh ubuntu@manderson-01.gridthin.gs 'sudo cp /root/gridthings-edge/nginx/certs/*client* ~/'
> ssh ubuntu@manderson-01.gridthin.gs 'sudo cp /root/gridthings-edge/nginx/certs/ca.crt ~/'
                                                                                       
> scp ubuntu@manderson-01.gridthin.gs:~/*client* .
> scp ubuntu@manderson-01.gridthin.gs:~/ca.crt .
```

The CLI is looking for the following certiciate files
        
```
 ~/.gtcli/[server]/[server]-client.key
 ~/.gtcli/[server]/[server]-client.pem
 ~/.gtcli/[server]/ca.crt
```

Currently the CLI doesn't support providing a passphrase for the client certificate so we must remove it using openssl

```
openssl rsa -in manderson-01.gridthin.gs-client.key -out manderson-01.gridthin.gs-client.key
```


