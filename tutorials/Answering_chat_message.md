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

#### Listening to incoming messages sending to a bubble
---

Messages posted to a bubble can be listened in the same way as messages coming from users. Use the event `rainbow_onmessagereceived` to handle them as described:


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

### Sending message receipts
---

When receiving an incoming message, the SDK for Node.JS automatically sends a receipt of type `received` to inform the user that the message has been well handled.

The receipt of type `read` (that inform that the message has been read or interpreted) can be managed automatically or manually depending the configuration of the option `sendreadreceipt`.


#### Send read receipt automatically
---

If you want that a receipt of type `read` is sent automatically to the sender, you have to set the parameter `sendReadReceipt` of the configuration to true like in the following:

```js

// Define your configuration
let options = {
    // Rainbow platform
    "rainbow": {
        "host": "sandbox"                      
    },
    // Identity used
    "credentials": {
        "login": "<your_rainbow_login_email>", 
        "password": "<your_rainbow_password>"  
    },
    ...

    // IM options
    "im": {
        "sendReadReceipt": true   // True to send the 'read' receipt automatically
    }
};

```

This is the default option: Receipt of type `read` is sent automatically on each new message received.


#### Send read receipt manually
---

In some cases, you want to send the receipt of type `read` manually (eg: to acknowledge an alarm message only if other command has been done sucessfully), so you can set the parameter `sendReadReceipt` to false and use the API `markMessageAsRead()` to send it manually. Here is an example:


```js

// Define your configuration
let options = {
    // Rainbow platform
    "rainbow": {
        "host": "sandbox"
    },
    // Identity used
    "credentials": {
        "login": "<your_rainbow_login_email>",
        "password": "<your_rainbow_password>" 
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

Notice: You don't have to send receipt for messages having the property `isEvent` equals to true. These messages are specific Bubble messages not sent by a user and indicating that someone entered the bubble or juste leaved it.


### Listening to receipts
---

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

At this time of writting, Rainbow clients manage Message language and is able to display message using a `Markdown` content type.

Subject is used when displaying Rainbow notification messages.


### Limitations
---

Here are the list of limitations regarding chat messages

| Topic | Limit | Details |
|-------|-------|:--------|
| Message size | 1024 characters | You can't send chat message having more than 1024 characters. This limit takes into account any additionnal content message. |


---

_Last updated July, 25th 2017_