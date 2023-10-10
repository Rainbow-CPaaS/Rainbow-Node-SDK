$Id$
## SDK for Node.JS: Getting Started

---

### Preamble

---

Welcome to the Alcatel-Lucent Enterprise **Rainbow Software Development Kit for Node.JS**!

The Alcatel-Lucent Enterprise (ALE) Rainbow Software Development Kit (SDK) is an **NPM** package based on JavaScript for connecting your Node.js application to Rainbow.

This powerfull library enables you to create the best Node.js applications that connect to Alcatel-Lucent Enterprise [Rainbow](https://www.openrainbow.com).

This tutorial will help you starting with the ALE Rainbow SDK for Node.JS by building a basic application that connects to Rainbow.

### Prerequisites

---

#### Node.JS and NPM

---

You need to have Node.JS and NPM installed on your computer if you want to develop using the ALE Rainbow SDK for Node.JS

The minimal versions supported are:

| Pre-requisites | Version supported                        | Minimal                        |
| -------------- | :--------------------------------------- | :----------------------------- |
| Node.JS        | **Active LTS version only is supported** | Starting 10.x (without support) |
| NPM            | **Active LTS version is supported**      | Starting 6.x (without support) |

Note: We encourage you to migrate and to keep closer to the **active** LTS version of Node.JS in order to let us write this SDK using the latest JavaScript and Node.JS evolutions in term of language, and to have the best of Node.JS in term of features and security. **Current** version of Node.JS (with latest features) can be used but without support too.

#### Platforms supported

---

The following OS are supported:

| Operating System | Version supported              |
| ---------------- | ------------------------------ |
| Windows          | Starting Windows 7             |
| MacOS            | Starting OS X 10.11            |
| Linux            | Compatible with Debian, Ubuntu |

#### For developping using the Rainbow Developers Sandboxed Platform

---

For developping on the Rainbow Developers Sandboxed Platform, your need a **Developer** account in order to use the Rainbow SDK for Node.js.

To obtain it, you have to connect to the [Rainbow for Developers](https://developers.openrainbow.com) and to follow the instructions.

-   Or you can contact the Rainbow [support](mailto:support@openrainbow.com) team if you need one.

-   Or ask our bot **Emily** for an account. Just add the tags `#support #api` to your message sent to Emily.

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
let RainbowSDK = require("rainbow-node-sdk");

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();
```

That's all for the JavaScript code. Using these 3 lines of codes, you have an application that when launched is connected to Rainbow.

But to be complete, we need to fill the parameter `options` wich will describe all the configuration used by the SDK

#### Configuring your SDK (in XMPP mode)

---

The `options` parameter allows to enter your credentials and to target the Rainbow platform to use.

Add these lines before instantiating the SDK:

```js
// Load the SDK
let RainbowSDK = require("rainbow-node-sdk");

// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox",
        "mode": "xmpp"
    },
    "credentials": {
        "login": "bot@mycompany.com", // To replace by your developer credendials
        "password": "thePassword!123" // To replace by your developer credentials
    },
    "xmpp": {
          "host": "",
          "port": "443",
          "protocol": "wss",
          "timeBetweenXmppRequests": "20",
          "raiseLowLevelXmppInEvent": false,
          "raiseLowLevelXmppOutReq": false,
          "maxIdleTimer": 16000,
          "maxPingAnswerTimer": 11000,
          "xmppRessourceName": "vnagw"
    },
    "s2s": {
          "hostCallback": urlS2S,
          //"hostCallback": "http://70a0ee9d.ngrok.io",
          "locallistenningport": "4000"
    },
    // Application identifier
    "application": {
        "appID": "",
        "appSecret": ""
    },
    // Proxy configuration
    "proxy": {
        "host": undefined,
        "port": 8080,
        "protocol": undefined,
        "user": undefined,
        "password": undefined,
        "secureProtocol": undefined //"SSLv3_method"
    }, // */
    // Proxy configuration
    // Logs options
    "logs": {
        "enableConsoleLogs": true,
        "enableFileLogs": false,
        "enableEventsLogs": false,
        "enableEncryptedLogs": false,
        "color": true,
        "level": 'debug',
        "customLabel": "vincent01",
        "system-dev": {
            "internals": false,
            "http": false,
        }, 
        "file": {
            "path": "/var/tmp/rainbowsdk/",
            "customFileName": "R-SDK-Node-Sample2",
            "level": "debug",
            "zippedArchive" : false/*,
            maxSize : '10m',
            maxFiles : 10 // */
        }
    },
    "testOutdatedVersion": false,
    "testDNSentry": true,
    "httpoverxmppserver": false,
    "intervalBetweenCleanMemoryCache": 1000 * 60 * 60 * 6, // Every 6 hours.
    "requestsRate": {
        "maxReqByIntervalForRequestRate": 600, // nb requests during the interval.
        "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit.
        "timeoutRequestForRequestRate": 600 // nb seconds Request stay in queue before being rejected if queue is full.
    },
    // IM options
    "im": {
        "sendReadReceipt": true,
        "messageMaxLength": 1024,
        "sendMessageToConnectedUser": false,
        "conversationsRetrievedFormat": "small",
        "storeMessages": false,
        //"copyMessage": true,
        "nbMaxConversations": 15,
        "rateLimitPerHour": 1000,
//          "messagesDataStore": DataStoreType.NoStore,
        "messagesDataStore": RainbowSDK.DataStoreType.StoreTwinSide, // Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour)<br>
                              // DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
                              // DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
                              // DataStoreType.StoreTwinSide The messages are fully stored.<br>
                              // DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour. 
        "autoInitialGetBubbles": true,
        "autoInitialBubblePresence": true,
        "autoInitialBubbleFormat": "small",
        "autoInitialBubbleUnsubscribed": true,
        "autoLoadConversations": true,
        "autoLoadConversationHistory" : false,
        "autoLoadContacts": true,
        "enableCarbon": true,
        "enablesendurgentpushmessages": true,
        "useMessageEditionAndDeletionV2": true
    },
    // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.
    // Take care, severals services are linked, so disabling a service can disturb an other one.
    // By default all the services are started. Events received from server are not yet filtered.
    // So this feature is realy risky, and should be used with much more cautions.
    "servicesToStart": {
        "bubbles": {
            "start_up": true,
        },
        "telephony": {
            "start_up": true,
        },
        "channels": {
            "start_up": true,
        },
        "admin": {
            "start_up": true,
        },
        "fileServer": {
            "start_up": true,
        },
        "fileStorage": {
           "start_up": true,
        },
        "calllog": {
            "start_up": true,
        },
        "favorites": {
            "start_up": true,
        },
        "alerts": {
            "start_up": true,
        }, //need services :
        "webrtc": {
            "start_up": true,
            "optional": true
        } // */
    } // */
};


// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();
```

If you don't have valids application `id` and `secret`, you can create it with the rainbow-cli (github) tool.
They are mandatory.

For our HelloWorld application, you have just to replace the credentials by your owns. Others parameters can stay unchanged.

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

In order to detect it the connection has been done successfully or not, you have to subscribe to several events. To do that, you have to handle them using the API `on`:

```js
...
rainbowSDK.events.on(<name_of_the_event_to_listen>, callback);
```

So, in our HelloWorld application you can subscribe to the `rainbow_onready` event to be sure that all is correct and to the `rainbow_onerror` to detect if something goes wrong. Don't hesitate to subscribe to others events if you want more information of what's happening. Have a look on the guide [Connecting to Rainbow](/doc/sdk/node/guides/Connecting_to_Rainbow_XMPP_Mode).

```js

...
rainbowSDK.events.on('rainbow_onstarted', function() {
    // do something when the SDK has successfully started (the object is contructed, but the bot is not yet signed in, and the SDK's APIs are not ready to be used.)
    ...
});

rainbowSDK.events.on('rainbow_onconnected', function() {
    // do something when the connection to Rainbow XMPP server is successfull (signin complete, but data for initialisation not yet retrieved)
    ...
});

rainbowSDK.events.on('rainbow_onready', function() {
    // do something when the SDK is connected to Rainbow. It is this event which allows application to start the use of SDK's APIs.
    ...
});

rainbowSDK.events.on('rainbow_onstopped', function() {
    // do something when the SDK is stopped (all services have been stopped)
    ...
});

rainbowSDK.events.on('rainbow_onconnectionerror', function(err) {
    // do something when the connection can't be done with Rainbow (ie. issue on sign-in) 
    // Application must start the sdk again.
    ...
});

rainbowSDK.events.on('rainbow_onfailed', function(err) {
    // do something when the SDK didn't succeed to reconnect and stop trying
    // Application must start the sdk again.
    ...
});

rainbowSDK.events.on('rainbow_onerror', function(err) {
    // do something when something goes fatal on Xmpp server (ie: bad 'configurations' parameter...). 
    // Application must start the sdk again.
    ...
});

rainbowSDK.events.on('rainbow_ondisconnected', function(err) {
    // do something when the SDK lost the connection with Rainbow
    ...
});

rainbowSDK.events.on('rainbow_onreconnecting', function(err) {
    // do something when the SDK tries to reconnect
    ...
});

// It is also possible to listen to one event only once with the following code
rainbowSDK.events.once("rainbow_on...", function fn_onrbevent() {
    // remove the listener.
    rainbowSDK.events.removeListener("rainbow_on...", fn_onrbevent);
});

```

_Note:_  
The Events class (rainbowSDK.events) extends the NodeJS.EventEmitter so you can use method from super class : `https://nodejs.org/api/events.html` 


For checking that everything works fine, you can add a login your callbacks and see the result in your shell.

You're now ready to do greater things with the ALE Rainbow SDK for Node.JS!!!

Others available guides will help you understanding the tricky parts. Take time to read these manuals, they will perhaps save you a lot of time at the end :-).

---

_Last updated $DATE$_
