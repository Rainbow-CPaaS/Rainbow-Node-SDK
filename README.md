ALE Rainbow SDK for Node.js
===========================

Welcome to the Alcatel-Lucent Enterprise **Rainbow Software Development Kit for Node.js**!

The Alcatel-Lucent Enterprise (ALE) Rainbow Software Development Kit (SDK) is an npm package for connecting your Node.js application to Rainbow.


## Preamble

This SDK is a pure JavaScript library dedicated to the Node.js platform. 

Its powerfull APIs enable you to create the best Node.js applications that connect to Alcatel-Lucent Enterprise [Rainbow](https://www.openrainbow.com).

This documentation will help you to use it.


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
    },
    // Add this part to store logs in a file
    logs: {
        path: '/var/tmp/rainbowsdk/',
        level: 'debug',
    },
    //Add this part to configure an HTTP proxy
    proxy: {
        host: '<proxy_host>',
        port: <proxy_port>,
        protocol: '<proxy_protocol>'
    },
    //IM options
    im: {
        sendReadReceipt: true   // True to send the the 'read' receipt automatically
    }
};
```


## Events

### Listen to events

Once you have called the **start()** method, you will begin receiving events from the SDK. If you want to catch them, you have simply to add the following lines to your code:

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


### Manually send a 'read' receipt

By default or if the **sendReadReceipt** property is not set, the 'read' receipt is sent automatically to the sender when the message is received so than the sender knows that the message as been read.

If you want to send it manually  when you want, you have to set this parameter to false and use the method **markMessageAsRead()** 

```js
...
rainbowSDK.events.on('rainbow_onmessagereceived', function(message) {
    // do something with the message received 
    ...
    // send manually a 'read' receipt to the sender
    rainbowSDK.im.markMessageAsRead(message);
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
    // do something when the presence of a contact changes
    var presence = contact.presence;    // Presence information
    var status = contact.status;        // Additionnal information if exists
});
```

The presence and status of a Rainbow user can take several values as described in the following table:

| Presence | Status | Meaning |
|----------------|--------------|---------|
| **online** | | The contact is connected to Rainbow through a desktop application and is available |
| **online** | **mobile** | The contact is connected to Rainbow through a mobile application and is available |
| **away** | | The contact is connected to Rainbow but hasn't have any activity for several minutes |
| **busy** | | The contact is connected to Rainbow and doesn't want to be disturbed at this time |
| **busy** | **presentation** | The contact is connected to Rainbow and uses an application in full screen (presentation mode) |
| **busy** | **phone** | The contact is connected to Rainbow and currently engaged in an audio call (PBX) |
| **busy** | **audio** | The contact is connected to Rainbow and currently engaged in an audio call (WebRTC) |
| **busy** | **video** | The contact is connected to Rainbow and currently engaged in a video call (WebRTC) |
| **busy** | **sharing** | The contact is connected to Rainbow and currently engaged in a screen sharing presentation (WebRTC) |
| **offline** | | The contact is not connected to Rainbow |
| **unknown** | | The presence of the Rainbow user is not known (not shared with the connected user) |

Notice: With this SDK version, if the contact uses several devices at the same time, only the latest presence information is taken into account.


## Presence

### Change presence manually

The SDK for Node.js allows to change the presence of the connected user by calling the following api:

```js
...
rainbowSDK.presence.setPresenceTo(rainbowSDK.presence.RAINBOW_PRESENCE_DONOTDISTURB).then(function() {
    // do smething when the presence has been changed
    ...
}).catch(function(err) {
    // do something if the presence has not been changed
    ...
});
```

The following values are accepted:

| Presence constant | value | Meaning |
|------------------ | ----- | ------- |
| **RAINBOW_PRESENCE_ONLINE** | "online" | The connected user is seen as **available** |
| **RAINBOW_PRESENCE_DONOTDISTURB** | "dnd" | The connected user is seen as **do not disturb** |
| **RAINBOW_PRESENCE_AWAY** | "away" | The connected user is seen as **away** |
| **RAINBOW_PRESENCE_INVISIBLE** | "invisible" | The connected user is connected but **seen as offline** |

Notice: Values other than the ones listed will not be taken into account.


## Proxy management

### Configuration

If you need to access to Rainbow through an HTTP proxy, you have to add the following part to your 'options' parameter:

```js
...
proxy: {
    host: '192.168.0.254',
    port: 8080              // Default to 80 if not provided
    protocol: 'http',       // Default to 'http' if not provided
}
```


## Serviceability

### Log file

By default, the SDK logs information in the shell console that starts the Node.js process.

You can add a logger for saving the SDK logs into a file. Each day, a new file is created.

Simply add the following lines to your **options** parameter:

```js
...
logs: {
    path: '/var/tmp/rainbowsdk/',
    level: 'debug',
}
```

You can define your own path and log level. Available log levels are: 'error', 'warn', 'info' and 'debug'

### API Return codes

Here is the table and description of the API return codes:

| Return code | Label | Message | Meaning |
|------------------ | ----- | ------ | ------ |
| 1 | **"Request successful"** | "" | The request has been successfully executed |
| -1 | **"General Error"** | "An error occured. See details for more information" | A error occurs. Check the details property for more information on this issue |
| -2 | **"Security Error"** | "The email or the password is not correct" | Either the login or the password is not correct. Check your Rainbow account |
| -4 | **"XMPP Error"** | "An error occured. See details for more information" | An error occurs regarding XMPP. Check the details property for more information on this issue |
| -16 | **"Bad Request"** | "One or several parameters are not valid for that request." | You entered bad parameters for that request. Check this documentation for the list of correct values |

When there is an issue calling an API, an error object is returned like in the following example:

```js
{
    code: -1                // The error code
    label: "General Error"  // The error label
    msg: "..."              // The error message
    details: ...            // The JS error
}
```

Notice: In case of successfull request, this object is returned only when there is no other information returned.


## Features provided

Here is the list of features supported by the Rainbow-Node-SDK


### Instant Messaging

 - Send and Receive One-to-One messages

 - XEP-0184: Message Delivery Receipts (received and read)

 - XEP-0280: Message Carbon

 - Send 'read' receipt manually


### Contacts

 - Get the list of contacts


### Presence

- Get the presence of contacts

- Set the user connected presence


### Serviciability

 - Support of connection through an HTTP Proxy 

 - Logs into file & console

 - XEP-0199: XMPP Ping

 - REST token automatic renewal and auto-relogin
