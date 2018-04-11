## Answering to Chat Messages
---

### Preamble
---

As the SDK for Node.JS is a server side component, it could act as a **Bot** that is always connected to Rainbow and so that can interact with users that request help or that send text messages to it.

This tutorial explains in details how to listen to incoming messages and how to answer to them.


### Listening to incoming messages
---

The Rainbow SDK for Node.JS can listen to messages posted in bubbles (where the connected user belongs) or posted direcly to the connected user.


#### Listening to incoming messages coming from a user
---

Listening to instant messages that come from other users is very easy. You have just to use the `events` public property and to subscribe to the `rainbow_onmessagereceived` event like in the following code sample:


```js

...
rainbowSDK.events.on('rainbow_onmessagereceived', (message) => {
    
    // Check if the message comes from a user
    if(message.type === "chat") {
        // Do something with the message       
        ...
    }
});

```

You can have more details about the `message` structure by looking to the [Message API documentation](/#/documentation/doc/sdk/node/guides/api/message).


#### Listening to incoming messages sending to a bubble
---

Messages posted to a bubble can be listened using the same way as messages coming from users. Use the event `rainbow_onmessagereceived` to handle them as described:


```js

...
rainbowSDK.events.on('rainbow_onmessagereceived', (message) => {
    
    // Check if the message comes from a user
    if(message.type === "groupchat") {
        // Do something with the message       
        ...
    }
});

```

For bubble messages, the `type` property has a value equals to `groupchat` whereas the value is `chat` for simple messages exchanged with a user.

Be careful, when using the property `fromJid` of the message. When in a bubble, the `fromJid` property contains the identity of the user inside the bubble so follows the pattern `jid_room/jid_user`.


### Answering to messages
---

Once you know how to detect and interpret incoming messages, the next steps are to send receipts and to answer to these messages.

#### Managing received receipts
---

When receiving an incoming message, the SDK for Node.JS automatically sends a receipt of type `received` to inform the user that the message has been well handled.

So, on your side, you have nothing to do. The user will be informed that your application has received the message.


#### Sending read receipts automatically
---

The receipt of type `read` (that inform that the message has been read or interpreted) can be managed automatically or manually depending the configuration of the option `sendreadreceipt`.

If you want that a receipt of type `read` is sent automatically to the sender, you have to set the parameter `sendReadReceipt` of the configuration to `true` like in the following:

```js

// Define your configuration
let options = {
    // Rainbow platform
    "rainbow": {
        "host": "sandbox"                      
    },
    // Identity used
    "credentials": {
        "login": "bot@mycompany.com",  
        "password": "thePassword!123"   
    },
    ...

    // IM options
    "im": {
        "sendReadReceipt": true   // True to send the 'read' receipt automatically
    }
};

```

This is the default option: Receipt of type `read` is sent automatically on each new message received. If you want to manage it manually, set the value to `false`.


#### Sending read receipt manually
---

In some cases, you want to send the receipt of type `read` manually (eg: to acknowledge an alarm message only if other command has been done sucessfully), so you can set the parameter `sendReadReceipt` to `false` and use the API `markMessageAsRead()` to send it manually. Here is an example:


```js

// Define your configuration
let options = {
    // Rainbow platform
    "rainbow": {
        "host": "sandbox"
    },
    // Identity used
    "credentials": {
        "login": "bot@mycompany.com",  
        "password": "thePassword!123" 
    },
    ...

    // IM options
    "im": {
        "sendReadReceipt": false   // Do not send a receipt of type read automatically
    }
};

// Later in the code
rainbowSDK.events.on('rainbow_onmessagereceived', (message) => {
    // do something with the message received 
    ...
    // send manually a 'read' receipt to the sender
    rainbowSDK.im.markMessageAsRead(message);
});

```

Notice: You don't have to send receipt for messages having the property `isEvent` equals to true. These messages are specific Bubble messages not sent by a user and indicating that someone entered the bubble or just leaved it.


#### Sending a message to a recipient
---

If you want to send a message to a recipient, once you have to do is to call the API `sendMessageToJid()`. For example, if you want to answer to an incoming message from a user, do the following

```js

nodeSDK.events.on("rainbow_onmessagereceived", (message) => {
    // Check if the message is not from you
    if(!message.fromJid.includes(nodeSDK.connectedUser.jid_im)) {
        // Check that the message is from a user and not a bot
        if( message.type === "chat") {
            // Answer to this user
            nodeSDK.im.sendMessageToJid("hello! How may I help you?", message.fromJid);
            // Do something with the message sent
            ...
        }
    }
});

```

In order to avoid loop, it's always a good practice to check if the sender is not you as you can be connected several times with several resources...

It's a good practice to keep a reference to the message sent if you want to know which message has been received and read from users.


#### Sending a message to a bubble
---

When a message is received in a bubble, you can do the same and respond to everyone by calling the API `sendMessageToBubbleJid()`. The following code will add a new message to a bubble each time an other participant has written one.

```js

nodeSDK.events.on("rainbow_onmessagereceived", (message) => {
    // Check if the message is not from you
    if(!message.fromJid.includes(nodeSDK.connectedUser.jid_im)) {
        // Check that the message is from a user and not a bot
        if( message.type === "groupchat") {
            // Answer to this user
            let messageSent = nodeSDK.im.sendMessageToBubbleJid("I got it!", message.fromBubbleJid);
            // Do something with the message sent
            ...
        }
    }
});

```


### Listening to receipts
---

When you send messages to a recipient, it's a good practice to listen for receipts from your recipients.  

Receipts allow to know if the message has been successfully delivered to your recipient. You need to subscribe to the events `rainbow_onmessageserverreceiptreceived`, `rainbow_onmessagereceiptreceived` and `rainbow_onmessagereceiptreadreceived` to follow the different receipts received:


| Receipt | Event to subscribe | Description |
|:--------|:-------------------|:------------|
| `server` | `rainbow_onmessageserverreceiptreceived` | Your message has been successfully received by Rainbow. It will now be relayed to the recipient |
| `received` | `rainbow_onmessagereceiptreceived` | Your message has been successfully received by the recipient application |
| `read` | `rainbow_onmessagereceiptreadreceived` | Your message has been read by the recipient |


Note: Use the ID of your originated message (ie: message sent) to be able to link with the receipt received.


#### Listening to server receipt
----

When the server receives the message you just sent, a receipt is sent to you:

```js

...
rainbowSDK.events.on('rainbow_onmessageserverreceiptreceived', (receipt) => {
    // do something when the message has been received by the Rainbow server
    ...
});

```

#### Listening to receipt of type received
---

Then, when the recipient receives the message, the following receipt is sent to you:

```js

...
rainbowSDK.events.on('rainbow_onmessagereceiptreceived', (receipt) => {
    // do something when the message has been received by the recipient
    ...
});

```

#### Listening to receipt of type read
---

Finally, when the recipient reads the message, the following receipt is sent to you:

```js

...
rainbowSDK.events.on('rainbow_onmessagereceiptreadreceived', function(receipt) {
    // do something when the message has been read by the recipient
    ...
});

```


### Supporting additionnal message content
---

When sending a message to a recipient or to a bubble, the SDK for Node.JS is able to add additional content in that message like:

- Defining the language of the message

- Defining an additional content type and message

- Defining a subject

Note: This possibility is to use when you are developing your own end-user application with your own support of Markdown.


#### Message language
---

When sending a message, a language information can be sent to the recipient to inform him about the language of the message.

To add this information, modify your code like in the following:


```js

...
// Send a message to a recipient with a language information equals to 'French' 
messageSent = rainbowSDK.im.sendMessageToJid('Ce message est en français', user.jid, "fr");

// Send a message to a bubble with a language information equals to 'English'
messageSent = rainbowSDK.im.sendMessageToBubbleJid('This message is in English', bubble.jid, "en");

```

This parameter is optional and by default the language information is set to `en` if no one is specified.


#### Additional content type and message
---

When sending a message, an additional content type and message can be added. This can be usefull if your recipient's application can handle other content type like `Markdown`.

To add an extra content type and message, you need to define a JavaScript object containing the content type and the associated formatted message like in the following:


```js

let additionalContent = {
    "type": "text/markdown",
    "message": "your formatted message"
}

```

And then pass it to the API `sendMessageToJid()` or `sendMessageToBubbleJid()`:


```js

...
// Send a message to a recipient with an additional content in Markdown 
messageSent = rainbowSDK.im.sendMessageToJid('A message sent by Rainbow', user.jid, "en", {"type": "text/markdown", "message": "**A message** sent by [Rainbow](https://openrainbow.com)"});

// Send a message to a bubble with an additional content in Markdown 
messageSent = rainbowSDK.im.sendMessageToBubbleJid('A message sent by Rainbow', bubble.jid, "en", {"type": "text/markdown", "message": "**A message** sent by [Rainbow](https://openrainbow.com)"});

```

By default, if the `type` property is not specified, `text/markdown` will be used.

Content type could be `text/xml`, `text/markdown`, `application/json`, `application/octet-stream` or any content type specific to your application like `application/rainbow`.


#### Message Subject
---

When sending a message, you can specify an associated `subject`. This subject can be usefull if your recipient's application has the possibility to display a message title or subject and a message content to avoid having to cut message content if it is too long (eg: Displaying list of message in a mobile application). 

By default, there is no message subject. Here is an example of a adding a specific subject to a message:


```js

...
// Send a message with a subject
messageSent = rainbowSDK.im.sendMessageToJid('A message to a user', user.jid, "en", null, "Subject of my message");

// Send a message with a subject to a bubble
messageSent = rainbowSDK.im.sendMessageToBubbleJid('A message to a bubble', bubble.jid, "en", null, "Subject of my message");

```

#### Interaction with Rainbow clients
---

At this time of writting, Rainbow clients manage Message language and are able to display messages using a `Markdown` content type. This feature is not officially supported but if your Node.JS application interacts with a Rainbow official client, this can help.

Here is the list of Markdown tags supported by the Rainbow official Web application (Rainbow Web client and Rainbow Desktop client):

- **Headers**: `#H1` to  `######H6`

- **Emphasis**: `*italics*` and `**bold**`

- **Lists**: `- `, `+ ` or `* ``

- **Links**: `[a link](https://www.hub.openrainbow.com)`

- **Images** `![alt text](https://hub.openrainbow.com/img/logohub.svg)`

- **Code**: Inline `code` has `back-ticks around` it.

- **Blockquotes**: `> a Blockquote`.

Note: Other Markdown tags can be used specifically if you have provided your own end-user application but will not be rendered correcly in the Rainbow official clients.

Subject is used when displaying Rainbow notification messages.

Note: At this time of writing, Markdown is not supported by the Rainbow mobile clients.


### Specific Bubbles messages
---

When chatting in a bubble, you can receive specific messages that inform you about the affiliation's change of a member in that bubble. An exemple can be where a new user has accepted to join a bubble, you will be informed.

In order to distinguish this kind of message that has not to be displayed "like that", you have to take into account the parameter `isEvent`. If the value is `true`, it means that the message is a specific message. You can then have a look to the parameter `event` that contains the name of that event.

The `event` parameter can have the following values:

| Value | Description |
|:-----|:------------|
| **leave** | A member left or has been removed from the bubble by a moderator |
| **invitation** | A member has been invited to the bubble - received only by the **moderator**|
| **join** | A new member has join the bubble |
| **close** | The bubble has been closed |
| **welcome** | You have been granted to the bubble - received only by the **user who enters the bubble** |


### Limitations
---

Here are the list of limitations regarding chat messages

| Topic | Limit | Details |
|-------|-------|:--------|
| Message size | 1024 characters | You can't send chat message having more than 1024 characters. This limit takes into account any additionnal content message. |


---

_Last updated January, 11th 2018_