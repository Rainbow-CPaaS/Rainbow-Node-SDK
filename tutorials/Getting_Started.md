## Getting Started
---

### Preamble
---

Welcome to the Alcatel-Lucent Enterprise **Rainbow Software Development Kit for Node.JS**!

The Alcatel-Lucent Enterprise (ALE) Rainbow Software Development Kit (SDK) is an **NPM** package based on JavaScript for connecting your Node.js application to Rainbow.

Its powerfull APIs enable you to create the best Node.js applications that connect to Alcatel-Lucent Enterprise [Rainbow](https://www.openrainbow.com).

This tutorial will help you starting with the ALE Rainbow SDK for Node.JS by building a basic application that connect to Rainbow.


### Prerequisites
---

#### Node.JS and NPM
---

You need to have Node.JS and NPM installed on your computer if you want to develop using the ALE Rainbow SDK for Node.JS

The minimal versions supported are:

| Pre-requisites | Version supported |
| -------------- |:---------------- |
| Node.JS | >= 6.0 (LTS version is recommanded) |
| NPM | >= 3.6 |


#### Platforms supported
---

The following OS are supported:

| Operating System | Version supported |
| ---------------- | ----------------- |
| Windows | Starting Windows 7 |
| MacOS | Starting OS X 10.11 |
| Linux | Compatible with Debian, Ubuntu |


#### For developping using the Rainbow Developer Sandboxed Platform
---

Your need a Rainbow **Developer** account in order to use the Rainbow SDK for Node.js.

Please 
- Contact the Rainbow [support](mailto:support@openrainbow.com) team if you need one.

- Or ask our bot **Emily** for an account. Just add the tags `#support #api` to your message sent to Emily.


#### For deploying in the Rainbow Production environment
---

Once your application is ready and you want to deploy it on the Rainbow Production environment, you need to have a Rainbow official account to use it in your application.

You can create a new one by connecting to [Rainbow](https://www.openrainbow.com).


### Building a new Node.JS application   
---

Here are the steps you have to do for creating your first application using the ALE Rainbow SDK for Node.JS that connects to Rainbow.


#### Initializing your application
---

To create your application, first, you need a fresh directory to put your source files. Open a shell and execute these commands to create the application's directory and initialize your application.

```bash

$ mkdir "my-nodeApp"
$ cd my-NodeApp
$ npm init

```

Then answer to the question. For most of them, you have just to answer **Yes**. Once you have finished, the file `package.json` is created and ready for your application.


#### Installing the ALE Rainbow SDK for Node.JS
---

You can now install the SDK. In the shell, execute the following command to install the ALE Rainbow SDK for Node.JS

```bash

$ npm install --save rainbow-node-sdk

```

Once installed, the file `package.json` will be updated and your application now depends on the SDK. You are now ready to code...


#### Loading and starting the SDK
---

You need a file to write your code. Add the file index.js to your directory using your code editor or using a shell command

```bash

$ touch index.js

```

Then edit this file and add the following code to load and start the SDK:


```js
// Load the SDK
let RainbowSDK = require('rainbow-node-sdk');

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();

```

That's all for the JavaScript code. Using these 3 lines of codes, you have an application that when launched is connected to Rainbow.

But to be complete, we need to fill the parameter `options` wich will describe all the configuration used by the SDK


#### Configuring your SDK
---

The `options` parameter allows to enter your credentials and to target the Rainbow platform to use.

Add these lines before instantiating the SDK:

```js

// Load the SDK
let RainbowSDK = require('rainbow-node-sdk');


// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "credentials": {
        "login": "<your_rainbow_login_email>",  // The Rainbow email account to use
        "password": "<your_rainbow_password>"   // The Rainbow associated password to use
    },
    // Application identifier
    "application": {
        "id": "<your_rainbow_application_id>", // The Rainbow Application Identifier - application must have a 'deployed' state
        "secret": "<your_rainbow_application_secret>", // The Rainbow Application Secret - retrieved from developer hub
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": true,              // Default: true
        "enableFileLogs": false,                // Default: false
        "file": {
            "path": '/var/tmp/rainbowsdk/',     // Default path used
            "level": 'debug'                    // Default log level used
        }
    },
    // Proxy configuration
    "proxy": {
        "host": "<proxy_host>",                 // eg: "172.25.50.190" (string expected)
        "port": "<proxy_port>",                 // eg: 8080 (integer expected)
        "protocol": "<proxy_protocol>"          // eg: "http" (string expected)
    },
    // IM options
    "im": {
        "sendReadReceipt": true   // True to send the 'read' receipt automatically
    }
};

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();

```

For our HelloWorld, you have just to put the credentials you want to use. Others parameters can stay unchanged.


#### Executing the application
---

It's time to check that your application can connect to Rainbow. In your shell, execute the following command:


```bash

$ node index.js

```

Your application should start and if everything is ok, you will see somewhere in the logs displayed in the console the following:

```bash

debug: CORE - (signin) signed in successfully

```

For sure, it's not the right way to know if your application is successfully connected or not. We can now enhance a little bit our HelloWorld application to detect if the connection to Rainbow is ok or not.


#### Listening to SDK events
---

In order to detect it the connection has been done successfully or not, you have to subscribe to several events. To do that, add the following lines to your code:

```js
...
rainbowSDK.events.on(<name_of_the_event_to_listen>, callback);
```

In our HelloWorld application we want to detect if the connection to Rainbow has been donne successfully or not and when the SDK has finished is 'starting phase' and can be used by the application. 

Here is the list of events that can be subscribed by the application:

| Name | Description |
|:-----|:------------|
| **rainbow_onstarted** | Fired when the SDK has successfully started (not yet signed in) |
| **rainbow_onconnectionok** | Fired when the connection is successfull with Rainbow (signin complete) |
| **rainbow_onconnectionerror** | Fired when the connection can't be done with Rainbow (ie. issue on sign-in) |
| **rainbow_onerror** | Fired when something goes wrong (ie: bad 'configurations' parameter...) |
| **rainbow_onready** | Fired when the SDK is connected to Rainbow and ready to be used |
| **rainbow_onmessagereceived** | Fired when a one-to-one message is received |
| **rainbow_onmessageserverreceiptreceived** | Fired when the message has been received by the server |
| **rainbow_onmessagereceiptreceived** | Fired when the message has been received by the recipient |
| **rainbow_onmessagereceiptreadreceived** | Fired when the message has been read by the recipient |
| **rainbow_oncontactpresencechanged** | Fired when the presence of a contact changes |
| **rainbow_onbubbleaffiliationchanged** | Fired when the presence of a contact changes |

So, in our application, we can subscribed to the `rainbow_onready` event to be sure that all is correct and to the `rainbow_onerror` to detect if something goes wrong. Don't hesitate to subscribe to others events if you want more information of what's happening. 


```js

...
rainbowSDK.events.on('rainbow_onready', function() {
    // do something when the SDK is connected to Rainbow
    ...
});

rainbowSDK.events.on('rainbow_onerror', function(err) {
    // do something when something goes wrong
    ...
});

```

For checking that everything works fine, you can add a log in your callbacks and see the result in your shell.

You're now ready to do greater things with the ALE Rainbow SDK for Node.JS!!!

---

_Last updated June, 16th 2017_
