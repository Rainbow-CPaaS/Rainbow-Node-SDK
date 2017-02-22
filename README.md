Rainbow SDK for Node.js
=======================

Welcome to the **Rainbow Software Development Kit for Node.js**!

The Node.js SDK for Rainbow is an npm package that allows you to integrate your Node.js application with Rainbow.

## Preamble

This SDK (Software Development Kit) for Node.js is a pure JavaScript library dedicated to the Node.js platform. 

Its powerfull APIs enable you to create the best Node.js applications that connect to [Rainbow](https://www.openrainbow.com).

Read this documentation in order to know how to install and use the Rainbow SDK for Node.js. 

## Rainbow developper account

Your need a Rainbow **developer** account in order to use the Rainbow SDK for Node.js.

Please contact the Rainbow [support](mailto:support@openrainbow.com) team if you need one.

Notice: This is not a SDK for Bot as this SDK needs a Rainbow developer account. Nevertheless, once started, the connection to Rainbow is never broken so it can be seen as a **"always on"** user (a user that is always connected and 'online'). 

## Beta disclaimer

Please note that this is a Beta version of the Rainbow SDK for Node.js which is still undergoing final testing before its official release. The SDK for Node.js and the documentation are provided on a "as is" and "as available" basis. Before releasing the official release, all these content can change depending on the feedback we receive in one hand and the developpement of the Rainbow official product in the other hand.

Alcatel-Lucent Enterprise will not be liable for any loss, whether such loss is direct, indirect, special or consequential, suffered by any party as a result of their use of the Rainbow SDK for Node.js, the application sample software or the documentation content.

If you encounter any bugs, lack of functionality or other problems regarding the Rainbow SDK for Node.js, the application samples or the documentation, please let us know immediately so we can rectify these accordingly. Your help in this regard is greatly appreciated. 


## Install

```bash
$ npm install --save rainbow-node-sdk
```

## Usage

```js
var RainbowSDK = require('rainbow-node-sdk');

// instantiate the SDK
var rainbowSDK = new RainbowSDK(options);

// start the SDK
rainbowSDK.start();
```

That's all! Your application should be connected to Rainbow, congratulation!

## Configuration

The **options** parameter allows to enter your credentials and to target the Rainbow Cloud Services server to use.

```js
// Define your configuration
var options = {
    rainbow: {
        host: "sandbox",  // can be "sandbox" (developer platform) or "official"
    },
    credentials: {
        login: "<your_rainbow_login_email>",  // Your email account
        password: "<your_rainbow_password>"   // Your password
    }
};
```

## Instant Messaging

### Listen to new IM messages and answer to them

Listening to instant messages that come from other users is very easy. You just have to use the **'events'** public property and to subscribe to the **'rainbow_onmessagereceived'** event:

```js
...
rainbowSDK.events.on('rainbow_onmessagereceived', function(json) {
    // do something with the message received 
    ...
    // send an answer
    rainbowSDK.sendAMessage(json.from, 'This answer comes from the Node.js SDK for Rainbow');
});

```

## List of events

Here is the complete list of the events that you can subscribe on:

| Event | Description |
|------|------------|
| 'rainbow_onconnected' | Sent when the connection is successfull with Rainbow (signin complete) |
| 'rainbow_onerror' | Sent when something goes wrong (ie: impossible to sign-in...) |
| 'rainbow_onmessagereceived | Sent when a One-to-One message is received |

## Features provided

Here is the list of the features provided by the Rainbow-Node-SDK

### v0.4

 - [Instant Message] Send a chat message to a Rainbow user (JID)

### v0.3.8

 - Fix version - simplify 'options'

### v0.3

 - [Presence] Set the presence to 'online' once connected

 - [Instant Message] Emit an event when receiving a P2P chat messages from an other Rainbow user
 
 - [Instant Message] Send acknowledgments (Message received, Message read) when receiving a P2P message 

### v0.2

 - [Connection] Signin using the XMPP API and maintain the connection on (PING)

### v0.1

 - [Connection] Signin using the REST API, refresh the token and reconnect when needed
