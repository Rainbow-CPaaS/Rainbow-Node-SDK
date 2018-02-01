## Using a Proxy
---

### Preamble
---

Often, your server can't access to the Internet directly and need to pass throught a Proxy.

This guide will describe in details how to configure the SDK for Node.JS for using a Proxy.


### Installation
---

When you are behind a proxy, you need to configure NPM in order to go throught this proxy.

A lot of documentation exists on the web to explain how to do it. Here is a link: [Node.js and NPM behind a proxy](https://medium.com/@patdhlk/node-js-and-npm-behind-a-proxy-111708b82718)


### Configuration
---


#### Connecting using a Proxy
---

If you need to access to Rainbow through an HTTP Proxy, you have to add the following part to your `options` configuration parameter:

```js

...
proxy: {
    host: '192.168.0.254',
    port: 8080,             // Default to 80 if not provided
    protocol: 'http'        // Default to 'http' if not provided
}

```

You need to specify the following parameters:

- `host`: The Proxy host (String)
 
- `port`: The proxy port (Integer)

- `protocol`: The protocol used (String), can be `http` or `https`.


Here is an example of a complete configuration that uses an HTTP Proxy.

```js

// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox",    
    },
    "credentials": {
        "login": "bot@mycompany.com",  
        "password": "thePassword!123"   
    },
    "application": {
        "appID": "", 
        "appSecret": "", 
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": true,            // Default: true
        "enableFileLogs": false,              // Default: false
        "file": {
            "path": '/var/tmp/rainbowsdk/',   // Default path used
            "level": 'debug'                  // Default log level used
        }
    },
    // Proxy configuration
    "proxy": {
        "host": '192.168.0.254',
        "port": 8080,
        "protocol": 'http'
    },
    // IM options
    "im": {
        "sendReadReceipt": true   // True to send the the 'read' receipt automatically
    }
};

```


#### Connecting without a Proxy
---

If you don't want to use a Proxy, the recommandation is to remove the key `proxy` from the configuration or to set the value of the `host` to an empty string "".

---

_Last updated January, 12th 2018_
