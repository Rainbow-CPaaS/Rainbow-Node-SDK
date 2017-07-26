## Using a Proxy
---

### Preamble
---

Often, your server can't access to the Internet directly and need to pass throught a Proxy.

This guide will describe in details how to configure the SDK for Node.JS for using a Proxy.


### Configuration
---


#### Connecting using a Proxy
---

If you need to access to Rainbow through an HTTP Proxy, you have to add the following part to your `options` parameter:

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
    rainbow: {
        host: "sandbox",    
    },
    credentials: {
        login: "<your_rainbow_login_email>",  // Your Rainbow email account
        password: "<your_rainbow_password>"   // Your Rainbow password
    },
    application: {
        appID: "<your_application_ID>",         // Your application Identifier
        appSecret: "<your_application_secret>"  // Your application secret
    },
    // Logs options
    logs: {
        enableConsoleLogs: true,            // Default: true
        enableFileLogs: false,              // Default: false
        file: {
            path: '/var/tmp/rainbowsdk/',   // Default path used
            level: 'debug'                  // Default log level used
        }
    },
    // Proxy configuration
    proxy: {
        host: '192.168.0.254',
        port: 8080,
        protocol: 'http'
    },
    // IM options
    im: {
        sendReadReceipt: true   // True to send the the 'read' receipt automatically
    }
};

```


#### Connecting without a Proxy
---

If you don't want to use a Proxy, the recommandation is to remove the key `proxy` from the configuration or to set the value of the `host` to an empty string "".

---

_Last updated July, 26th 2017_
