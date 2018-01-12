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

let RainbowSDK = require('rainbow-node-sdk');

// instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// start the SDK
rainbowSDK.start().then( () => {
    // SDK has been started
});

```

That's all! Your application should be connected to Rainbow, congratulation!


## Configuration

The `options` parameter allows to enter your credentials and to target the Rainbow Cloud Services server to use.

```js

// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox",                      
    },
    "credentials": {
        "login": "bot@mycompany.com",  // To replace by your developer credendials
        "password": "thePassword!123"  // To replace by your developer credentials
    },
    // Application identifier
    "application": {
        "appID": "", 
        "appSecret": "", 
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": true,              
        "enableFileLogs": false,                
        "file": {
            "path": '/var/tmp/rainbowsdk/',
            "level": 'debug'                    
        }
    },
    // IM options
    "im": {
        "sendReadReceipt": true   
    }
};

```


## Events

### Listen to events

Once you have called the `start()` method, you will begin receiving events from the SDK. If you want to catch them, you have simply to add the following lines to your code:

```js

...
rainbowSDK.events.on(<name_of_the_event_to_listen>, callback);
```

Here is an example for listening when the SDK is ready to be used (once the connection is successfull to Rainbow):

```js
...
rainbowSDK.events.on('rainbow_onready', () => {
    // do something when the SDK is ready to be used
    ...
});

rainbowSDK.events.on('rainbow_onstarted', () => {
    // do something when the SDK has been started
    ...
});

rainbowSDK.start().then(() => {
    // Do something when the SDK is started
    ...
});

```


### List of events

Here is the complete list of the events that you can subscribe on:

| Name | Description |
|------|------------|
| **rainbow_onstarted** | Fired when the SDK has successfully started (not yet signed in) |
| **rainbow_onstopped** | Fired when the SDK has been successfully stopped (all services have been stopped) |
| **rainbow_onconnected** | Fired when the connection is successfull with Rainbow (signin complete) |
| **rainbow_onconnectionerror** | Fired when the connection can't be done with Rainbow (ie. issue on sign-in) |
| **rainbow_ondisconnected** | Fired when the SDK lost the connection with Rainbow |
| **rainbow_onreconnecting** | Fired when the SDK tries to reconnect |
| **rainbow_onfailed** | Fired when the SDK didn't succeed to reconnect and stop trying |
| **rainbow_onerror** | Fired when something goes wrong (ie: bad 'configurations' parameter...) |
| **rainbow_onready** | Fired when the SDK is connected to Rainbow and ready to be used |
| **rainbow_onmessagereceived** | Fired when a one-to-one message is received |
| **rainbow_onmessageserverreceiptreceived** | Fired when the message has been received by the server |
| **rainbow_onmessagereceiptreceived** | Fired when the message has been received by the recipient |
| **rainbow_onmessagereceiptreadreceived** | Fired when the message has been read by the recipient |
| **rainbow_oncontactpresencechanged** | Fired when the presence of a contact changes |
| **rainbow_onbubbleaffiliationchanged** | Fired when a user changes his affiliation with a bubble |
| **rainbow_onbubbleownaffiliationchanged** | Fired when a user changes the user connected affiliation with a bubble |
| **rainbow_onbubbleinvitationreceived** | Fired when an invitation to join a bubble is received |


## Instant Messaging

### Listen to incoming messages and answer to them

Listening to instant messages that come from other users is very easy. You just have to use the `events` public property and to subscribe to the `rainbow_onmessagereceived` event:

```js

...
rainbowSDK.events.on('rainbow_onmessagereceived', function(message) {
    // test if the message comes from a bubble of from a conversation with one participant
    if(message.type == "groupchat") {
        // Send the answer to the bubble
        messageSent = rainbowSDK.im.sendMessageToBubbleJid('The message answer', message.fromBubbleJid);
    }
    else {
        // send the answer to the user directly otherwise
        messageSent = rainbowSDK.im.sendMessageToJid('The message answer', message.fromJid);
    }
});

```

### Managing additionnal content

You can add extra content when sending a message to a user:

- Define the language of the message

- Define an additionnal text format

- Define a subject

Modify your code like in the following to add extra content:


```js

...
// Send a message in English to a user with a markdown format and a subject
messageSent = rainbowSDK.im.sendMessageToJid('A message', user.jid, "en", {"type": "text/markdown", "message": "**A message**"}, "My Title");

// Send a message in English to a bubble with a markdown format and a subject
messageSent = rainbowSDK.im.sendMessageToBubbleJid('A message for a bubble', bubble.jid, "en", {"type": "text/markdown", "message": "**A message** for a _bubble_"}, "My ‡Title");

```


### Manually send a 'read' receipt

By default or if the `sendReadReceipt` property is not set, the 'read' receipt is sent automatically to the sender when the message is received so than the sender knows that the message as been read.

If you want to send it manually  when you want, you have to set this parameter to false and use the method `markMessageAsRead()`

```js

...
rainbowSDK.events.on('rainbow_onmessagereceived', function(message) {
    // do something with the message received 
    ...
    // send manually a 'read' receipt to the sender
    rainbowSDK.im.markMessageAsRead(message);
});

```

Notice: You not have to send receipt for message having the property `isEvent` equals to true. This is specific Bubble messages indicating that someone entered the bubble or juste leaved it.



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
rainbowSDK.events.on('rainbow_onready', function() {
    // do something when the connection to Rainbow is up
    let contacts = rainbowSDK.contacts.getAll();
});

```

Note: This is the fixed list of contacts of the connected user.


### Retrieve a contact information

Accessing individually an existing contact can be done using the API `getContactByJid()`, `getContactById()` or `getContactByLoginEmail()`

```js

    ...
    // Retrieve the contact information when receiving a message from him
    rainbowSDK.contacts.getContactByJid(message.fromJid).then(function(contact) {
        // do something with the contact found
    }).catch(function(err) {
        // do something on error 
    });
});

```

Regarding the method `getContactByJid()`, if the contact is not found in the list of contacts, a request is sent to the server to retrieve it (limited set of information depending privacy rules).


### Listen to contact presence change

When the presence of a contact changes, the following event is fired:

```js

...
rainbowSDK.events.on('rainbow_oncontactpresencechanged', function(contact) {
    // do something when the presence of a contact changes
    let presence = contact.presence;    // Presence information
    let status = contact.status;        // Additionnal information if exists
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
    // do something when the presence has been changed
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


## Bubbles

### Retrieve the list of existing bubbles

Once connected, the Rainbow SDK will automatically retrieve the list of bubbles from the server. You can access to them by using the following API:

```js

...
rainbowSDK.events.on('rainbow_onready', function() {
    // do something when the connection to Rainbow is up
    let bubbles = rainbowSDK.bubbles.getAll();
});

```

Each new bubble created will then be added to that list automatically.


### Retrieve a bubble information

Accessing individually an existing bubble can be done using the API `getBubbleByJid()` or `getBubbleById()`

```js

    ...
    // Retrieve the bubble information when receiving a message in that bubble
    let bubble = rainbowSDK.bubbles.getBubbleByJid(message.fromBubbleJid);
});

```


### Create a new Bubble

A new bubble can be created by calling the following API

```js

...
let withHistory = true // Allow newcomers to have access to the bubble messages since the creation of the bubble
rainbowSDK.bubbles.createBubble("My new Bubble", "A little description of my bubble", withHistory).then(function(bubble) {
    // do something with the bubble created
    ...
}).catch(function(err) {
    // do something if the creation of the bubble failed (eg. providing the same name as an existing bubble)
    ...
});

```

### Add customData to a Bubble

May be added to an existing Bubble calling the following API
Please consider asking your administrator specific limitations: number max of string key : string value, max string size for key and value

```js

...
let customDatas = { "customData" :  {
    "one": "The One", "another" : "No idea"
}};
rainbowSDK.bubbles.setBubbleCustomData(bubble, customDatas).then(function(bubble) {
    // do something with the bubble
    ...
}).catch(function(err) {
    // do something if something went wrong by addinf customData to the bubble (eg. too much customData, too long)
    ...
});

```


### Add a contact to a bubble

Once you have created a bubble, you can invite a contact. Insert the following code

```js

...

let invitedAsModerator = false;     // To set to true if you want to invite someone as a moderator
let sendAnInvite = true;            // To set to false if you want to add someone to a bubble without having to invite him first
let inviteReason = "bot-invite";    // Define a reason for the invite (part of the invite received by the recipient)

rainbowSDK.bubbles.inviteContactToBubble(aContact, aBubble, invitedAsModerator, sendAnInvite, inviteReason).then(function(bubbleUpdated) {
    // do something with the invite sent
    ...
}).catch(function(err) {
    // do something if the invitation failed (eg. bad reference to a buble)
    ...
});

```


### Remove a contact from a bubble

A contact can be removed from a bubble even if he hasn't yet accepted the invitation. For removing him, add the following code

```js

...

rainbowSDK.bubbles.removeContactFromBubble(aContact, aBubble).then(function(bubbleUpdated) {
    // do something with once the contact has been removed
    ...
}).catch(function(err) {
    // do something if there is a trouble when removing the conact
    ...
});

```


### Be notified when a contact changes his affiliation with a bubble 

When a recipient accepts or decline your invite or when he leaves the bubble, you can receive a notification of his affiliation change by listening to the following event:

```js

...
rainbowSDK.events.on('rainbow_onbubbleaffiliationchanged', function(bubble) {
    // do something the affiliation of a user in that bubble changes
    ...
});

```


### Be notified when the affiliation of the connected user changes with a bubble

When a moderator removes you from a bubble, you can receive a notification of your new affiliation with the bubble by listening the following event:


```js

...
rainbowSDK.events.on('rainbow_onbubbleownaffiliationchanged', function(bubble) {
    // do something when your affiliation changes for that bubble
    ...
});

```


### Leave a bubble

Depending your role in the bubble, you can or not leave it:
 - If you are a **moderator** or the **owner** of this bubble, you can leave it only if there is an other **active** moderator (that can be the owner or not).
 - If you are a **participant**, you can leave it when you want.

For both cases, you have to call the following API

```js

...
rainbowSDK.bubbles.leaveBubble(aBubble).then(function() {
    // do something once leaved the bubble
    ...
}).catch(function(err) {
    // do something if you can't leave the bubble
    ...
});

```


### Close a bubble

If you are the **owner** of a bubble or a **moderator**, you can close it. When a bubble is closed, all participants (including owner and moderators) can only read the content of the bubble but can't put new message into it (they are no more part of the bubble).

For closing a bubble, you have to call the following API

```js

...
rainbowSDK.bubbles.closeBubble(aBubble).then(function(bubbleClosed) {
    // do something once the bubble is closed
    ...
}).catch(function(err) {
    // do something if you can't close the bubble
    ...
});

```


### Delete a bubble

If you are the **owner** of a bubble or a **moderator**, you can delete it. When a bubble is deleted, the bubble is removed from the bubble list and can't be accessed by the participants (including owner and moderators). The content of the bubble is no more accessible.

For deleting a bubble, you have to call following API:

```js

...
rainbowSDK.bubbles.deleteBubble(aBubble).then(function() {
    // do something once the bubble has been deleted
    ...
}).catch(function(err) {
    // do something if you can't delete the bubble
    ...
});

```


### Be notified when a request to join a bubble is received 

When someone wants to add the connected user to a bubble the event `rainbow_onbubbleinvitationreceived` is fired:


```js

...
rainbowSDK.events.on('rainbow_onbubbleinvitationreceived', function(bubble) {
    // do something wih this bubble
    ...
});

```


### Accepting a request to join a bubble

When a request to join a bubble is received from someone, you can accept it by calling the API `acceptInvitationToJoinBubble()` like in the following:


```js

...
rainbowSDK.events.on('rainbow_onbubbleinvitationreceived', function(bubble) {
    // Accept this invitation
    nodeSDK.bubbles.acceptInvitationToJoinBubble(jsonMessage).then(function(updatedBubble) => {
        // Do something once the invitation has been accepted
        ...
    }).catch((err) => {
        // Do something in case of error
        ...
    });
});

```


### Declining a request to join a bubble

You can decline a request to join a bubble by calling the API `declineInvitationToJoinBubble()` like in the following:


```js

...
rainbowSDK.events.on('rainbow_onbubbleinvitationreceived', function(bubble) {
    // Accept this invitation
    nodeSDK.bubbles.declineInvitationToJoinBubble(jsonMessage).then(function(updatedBubble) => {
        // Do something once the invitation has been declined
        ...
    }).catch((err) => {
        // Do something in case of error
        ...
    });
});

```


### Get the list of pending invitation to join a bubble

At anytime, you can get the list of pending invitation by calling the API `getAllPendingBubbles()`:


```js

...
    let pendingInvitations = nodeSDK.bubbles.getAllPendingBubbles();
    // Do something with this list
    ...
});

```


## Proxy management

### Configuration

If you need to access to Rainbow through an HTTP proxy, you have to add the following part to your `options` parameter:

```js

...
proxy: {
    host: '192.168.0.254',
    port: 8080,             // Default to 80 if not provided
    protocol: 'http'       // Default to 'http' if not provided
}

```


## Serviceability

### Retrieving SDK version

You can retrieve the SDK Node.JS version by calling the API `version`

```js

let version = rainbowSDK.version;

```


### Logging to the console

By default, the Rainbow SDK for Node.js logs to the shell console used (ie. that starts the Node.js process).

You can disable it by setting the parameter `enableConsoleLogs` to false

```js

...
logs: {
    enableConsoleLogs: false
    ...
}

```


### Logging to files

By default, the SDK logs information in the shell console that starts the Node.js process.

You can save these logs into a file by setting the parameter `enableFileLogs` to true. (False by default).

```js

...
logs: {
    enableFileLogs: true
    ...
}
```

You can modify the path where the logs are saved and the log level by modifying the parameter `file` like the following:

```js
...
logs: {
    file: {
        path: '/var/tmp/mypath/',
        level: 'error'
    }
}

```

The available log levels are: `error`, `warn`, `info` and `debug`

Notice: Each day a new file is created.


### Stopping the SDK

At any time, you can stop the connection to Rainbow by calling the API `stop()`. This will stop all services. The only way to reconnect is to call the API `start()` again.

```js

...
rainbowSDK.events.on('rainbow_onstopped', () => {
    // do something when the SDK has been stopped
    ...
});


rainbowSDK.stop().then((res) => {
    // Do something when the SDK has been stopped
    ...
});

```


### Auto-reconnection

When the SDK for Node.JS is disconnected from Rainbow, attempts are made to try to reconnect automatically.

This reconnection step can be followed by listening to events `rainbow_ondisconnected`, `rainbow_onreconnecting`, `rainbow_onconnected` and `rainbow_onready`.

```js

...
rainbowSDK.events.on('rainbow_ondisconnected', () => {
    // do something when the SDK has been disconnected
    ...
});


rainbowSDK.events.on('rainbow_onreconnecting', () => {
    // do something when the SDK tries to reconnect to Rainbow
    ...
});

rainbowSDK.events.on('rainbow_onconnected', () => {
    // do something when the SDK has connected to Rainbow
    ...
});

rainbowSDK.events.on('rainbow_onready', () => {
    // do something when the SDK is ready to be used 
    ...
});

```


### API Return codes

Here is the table and description of the API return codes:

| Return code | Label | Message | Meaning |
|------------------ | ----- | ------ | ------ |
| 1 | **"SUCCESSFULL"** | "" | The request has been successfully executed |
| -1 | **"INTERNALERROR"** | "An error occured. See details for more information" | A error occurs. Check the details property for more information on this issue |
| -2 | **"UNAUTHORIZED"** | "The email or the password is not correct" | Either the login or the password is not correct. Check your Rainbow account |
| -4 | **"XMPPERROR"** | "An error occured. See details for more information" | An error occurs regarding XMPP. Check the details property for more information on this issue |
| -16 | **"BADREQUEST"** | "One or several parameters are not valid for that request." | You entered bad parameters for that request. Check this documentation for the list of correct values |

When there is an issue calling an API, an error object is returned like in the following example:

```js

{
    code: -1                // The error code
    label: "INTERNALERROR"  // The error label
    msg: "..."              // The error message
    details: ...            // The JS error
}

```

Notice: In case of successfull request, this object is returned only when there is no other information returned.


## Features provided

Here is the list of features supported by the Rainbow-Node-SDK


### Instant Messaging

 - Send and receive One-to-One messages

 - XEP-0045: Multi-user Chat: Send and receive messages in Bubbles

 - XEP-0184: Message Delivery Receipts (received and read)

 - XEP-0280: Message Carbon


### Contacts

 - Get the list of contacts

 - Get contact individually


### Bubbles

 - Create a new Bubble
 
 - Get the list of bubbles

 - Get bubble individually

 - Invite contact to a bubble

 - Remove contact from a bubble

 - Leave a bubble

 - Delete a bubble

 - Be notified of an invitation to join a bubble

 - Be notified when affiliation of users changes in a bubble

 - Be notified when my affiliation changes in a bubble

 - Accept to join a bubble

 - Decline to join a bubble


### Presence

- Get the presence of contacts

- Set the user connected presence


### Serviciability

 - Support of connection through an HTTP Proxy 

 - Logs into file & console

 - XEP-0199: XMPP Ping

 - REST token automatic renewal and auto-relogin
