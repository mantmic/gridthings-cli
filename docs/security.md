# GridThings Endpoint Security

GridThings implements [Datagram Transport Layer Security](https://tools.ietf.org/html/rfc4347) (DTLS) to provide application layer privacy and uses X509 certificates for endpoint authentication. 

## Setup 

Security administrator must install the `gtca` command line tool from the github repository. This tool is used to create keys and certificates for different environments.

## Create a Root CA for a trust zone

A root CA is needed for each trust zone that device and server certificates will be generated for. 

```> gtca ca show test 123456```

In the above the trust zone is `test` and the root trust password is `123456`, naturally for production environments stronger passwords would be used. 

## Create a key store for a server

Each server that is operating in an trust zone must have a key store generated for it. This store will contain the servers certificate and private key.

```> gtca server create test 123456 server-01 4567890```

In the above the trust zone is `test`, the trust password is `123456` the server name is `server-01` and the server password is `4567890`. This command must be run for each server operating in a trust zone. 

The above command creates a server certificate store file in:

```~/.gtca/<trustzone>/<trustzone>-<servername>.jceks```

This file must be copied to the `private` directory on the gridthings edge server, and the security environment variables must be set appropriately.

```
KEY_STORE_PATH=/private/<trustzone>-<servername>.jceks
KEY_STORE_TYPE=JCEKS
KEY_STORE_PASS= 4567890
KEY_STORE_ALIAS=<trustzone>-<servername>
```

Now copy the server key store to the server using scp:

```
> scp ~/.gtca/test/test-actewagl-01.gridthin.gs.jceks devops@actewagl-01.gridthin.gs:/root/gridthings-edge/private
```

And then restart the server

```
> gtedge down && gtedge up -d
```

The new key store should now be installed on the server. And devices with certificates signed by the same trust zone store will be able to access this server (after adding their urn to the server white list).

On success you should see the following in the `gtcoregw` logs

```
...
gtcoregw_1            | 21:13:27.892 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - Auto Observer Request Timeout set to: 10000
gtcoregw_1            | 21:13:27.898 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - keyStorePath      = /private/test-actewagl-01.gridthin.gs.jceks
gtcoregw_1            | 21:13:27.898 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - keyStoreType      = JCEKS
gtcoregw_1            | 21:13:27.898 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - keyStorePass      = <redacted>
gtcoregw_1            | 21:13:27.898 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - keyStoreAlias     = test-actewagl-01.gridthin.gs
gtcoregw_1            | 21:13:27.898 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - keyStoreAliasPass = <redacted>
gtcoregw_1            | Feb 24, 2018 9:13:27 PM org.eclipse.californium.core.network.config.NetworkConfig load
gtcoregw_1            | INFO: loading properties from file /opt/Californium.properties
gtcoregw_1            | 21:13:27.930 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo - loading x509 from key store, looking for alias test-actewagl-01.gridthin.gs
gtcoregw_1            | 21:13:28.024 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo -   processing alias test-actewagl-01.gridthin.gs
gtcoregw_1            | 21:13:28.024 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo -   adding certificate for test-actewagl-01.gridthin.gs
gtcoregw_1            | 21:13:28.025 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo -   adding certificate for test-actewagl-01.gridthin.gs
gtcoregw_1            | 21:13:28.054 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo -   loaded private key for test-actewagl-01.gridthin.gs
gtcoregw_1            | 21:13:28.055 [main] INFO  org.eclipse.leshan.server.demo.LeshanServerDemo -   loaded certificate chain test-actewagl-01.gridthin.gs
...
gtcoregw_1            | Feb 23, 2018 2:47:49 AM org.eclipse.californium.scandium.DTLSConnector start
gtcoregw_1            | INFO: DTLS connector listening on [0.0.0.0/0.0.0.0:5684] with MTU [1,280] using (inbound) datagram buffer size [16,474 bytes]
gtcoregw_1            | Feb 23, 2018 2:47:49 AM org.eclipse.californium.core.network.CoapEndpoint start
gtcoregw_1            | INFO: Started endpoint at coaps://0.0.0.0:5684
...
```
### Errors

```java.io.IOException: Keystore was tampered with, or password was incorrect```

This is caused by the wrong password in the `KEY_STORE_PASS` setting in the `.env` file.

```java.security.UnrecoverableKeyException: Given final block not properly padded```

Possibly the Alias password is not correct

## Add Device

The basic steps to add a new device to the system are as follows:

1. Add the device to the server's security table using `gtcli security add`

```
> gtcli security add urn:imei:357520073996460
200 
```

2. Get the generated PSK for the device using `gtcli security list`,

```
> gtcli security list
Client				server					Key
-----------------------------------------------------------------------------------------------------------------
urn:imei:357520073996460	coaps://actewagl-01.gridthin.gs:5644/	19dff8494ba21686d3c0cdfe3c0bb7a81ca91ccca361fc951f0bb0d603c743bb
urn:imei:357520073996460	coaps://actewagl-01.gridthin.gs:5684/	6f5c1ec3c78685a5116fb83be0a36493f16dc9b6786ceefc5e1ed9e70736df6b
```
3. Create the endpoint server configuration on the endpoint device using `server set bs`
4. Revoke a device using `gtcli security delete`

## Adding a new endpoint

