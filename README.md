ALE Rainbow SDK for Node.js
===========================

Welcome to the Alcatel-Lucent Enterprise **Rainbow Software Development Kit for Node.js**!

The Alcatel-Lucent Enterprise (ALE) Rainbow Software Development Kit (SDK) is an npm package that allows you to integrate your Node.js application with Rainbow.

## Preamble

This SDK is a pure JavaScript library dedicated to the Node.js platform. 

Its powerfull APIs enable you to create the best Node.js applications that connect to Alcatel-Lucent Enterprise [Rainbow](https://www.openrainbow.com).

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
        login: "<your_rainbow_login_email>",  // Your Rainbow email account
        password: "<your_rainbow_password>"   // Your Rainbow password
    }
};
```

## Events

### Listen to events

Once you have called the **start()** method, you will begin receiving events from the SDK. If you want to catch them, you have to simply add the following lines to your code:

```js
...
rainbowSDK.events.on(<name_of_the_event_to_listen>, callback);
```

Here is an example for listening when the SDK is ready to be used (once the connection is successfull to Rainbow):

```js
...
rainbowSDK.events.on('rainbow_onready', function() {
    // do something
    ...
});
```

### List of events

Here is the complete list of the events that you can subscribe on:

| Name | Description |
|------|------------|
| **rainbow_onconnectionok** | Fired when the connection is successfull with Rainbow (signin complete) |
| **rainbow_onconnectionerror** | Fired when the connection can't be done with Rainbow (ie. issue on sign-in) |
| **rainbow_onerror** | Fired when something goes wrong (ie: bad 'configurations' parameter...) |
| **rainbow_onready** | Fired when the SDK is connected to Rainbow and ready to be used |
| **rainbow_onmessagereceived** | Fired when a one-to-one message is received |
| **rainbow_onmessageserverreceiptreceived** | Fired when the message has been received by the server |
| **rainbow_onmessagereceiptreceived** | Fired when the message has been received by the recipient |
| **rainbow_onmessagereceiptreadreceived** | Fired when the message has been read by the recipient |
| **rainbow_oncontactpresencechanged** | Fired when the presence of a contact changes |

## Instant Messaging

### Listen to incoming messages and answer to them

Listening to instant messages that come from other users is very easy. You just have to use the **'events'** public property and to subscribe to the **'rainbow_onmessagereceived'** event:

```js
...
rainbowSDK.events.on('rainbow_onmessagereceived', function(message) {
    // do something with the message received 
    ...
    // send an answer
    var msgSent = rainbowSDK.im.sendMessageToJid('This answer comes from the Node.js SDK for Rainbow', message.fromJid);
});
```

### Listen to receipts

Receipts allow to know if the message has been successfully delivered to your recipient. Use the ID of your originated message to be able to link with the receipt received.

When the server receives the message you just sent, a receipt is sent to you:

```js
...
rainbowSDK.events.on('rainbow_onmessageserverreceiptreceived', function(receipt) {
    // do something when the message has been received by the Rainbow server
    ...
});
```

Then, when the recipient receives the message, the following receipt is sent to you:

```js
...
rainbowSDK.events.on('rainbow_onmessagereceiptreceived', function(receipt) {
    // do something when the message has been received by the recipient
    ...
});
```

Finally, when the recipient read the message, the following receipt is sent to you:

```js
...
rainbowSDK.events.on('rainbow_onmessagereceiptreadreceived', function(receipt) {
    // do something when the message has been read by the recipient
    ...
});
```

## Contacts

### Retrieve the list of contacts

Once connected, the Rainbow SDK will automatically retrieve the list of contacts from the server. You can access to them by using the following API:

```js
...
rainbowSDK.events.on('rainbow_onconnectionok', function() {
    // do something when the connection to Rainbow is up
    var contacts = rainbowSDK.contacts.getAll();
});
```

### Listen to contact presence change

When the presence of a contact changes, the following event is fired:

```js
...
rainbowSDK.events.on('rainbow_oncontactpresencechanged', function(contact) {
    // do something when the connection to Rainbow is up
    var presence = contact.presence;    // Presence information
    var status = contact.status;        // Additionnal information if exists
});
```

The presence and status can take several values as described in the following table:

| Presence | Status | Meaning |
|----------------|--------------|---------|
| **online** | | The contact is connected to Rainbow through a desktop application and is available |
| **online** | **mobile** | The contact is connected to Rainbow through a mobile application and is available |
| **away** | | The contact is connected to Rainbow but hasn't have any activity since several minutes |
| **busy** | | The contact is connected to Rainbow and doesn't want to be disturbed at this time |
| **busy** | **audio** | The contact is connected to Rainbow and currently engaged in an audio call |
| **busy** | **video** | The contact is connected to Rainbow and currently engaged in a video call |
| **busy** | **presentation** | The contact is connected to Rainbow and currently engaged in a screen sharing presentation |
| **offline** | | The contact is not connected to Rainbow |


Notice: With this SDK version, if the contact uses several devices at the same time, only the latest presence information is taken into account.

## Features provided

Here is the list of the features provided by the Rainbow-Node-SDK

### v0.5.5
 - [Contacts] Retrieve the list of contacts
 - [Presence] Emit an event when the presence of a contact changes

### v0.4.8

 - [Instant Message] Send a chat message to a Rainbow user (JID)

 - [Instant Message] Emit events when the Rainbow server and the recipient send a receipt

### v0.3.8

 - [Instant Message] Emit an event when receiving a P2P chat messages from an other Rainbow user
 
 - [Instant Message] Send acknowledgments (Message received, Message read) when receiving a P2P message 

### v0.2

 - [Presence] Set the presence to 'online' once connected
 
 - [Connection] Signin using the XMPP API and maintain the connection on (PING)

### v0.1

 - [Connection] Signin using the REST API, refresh the token and reconnect when needed
