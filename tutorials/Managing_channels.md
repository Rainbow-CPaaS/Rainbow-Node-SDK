## Managing Channels
---

### Preamble
---

Using the Rainbow SDK for Node.JS, you can send notifications to a large numbers of users (e.i. several thousands of users) using a **channel**.

Channel can be used when you want to notify a large group of users without having to send a chat message individually to each.

You can create and administrate 2 differents types of channels:  Either by managing the recipients (called **private** channels) or by letting the users subscribing to the channel they want (called **public** channels) if they find an interest to receive these information.


| Channel type | Description |
|:-------------|:------------|
| **Private** | Only Owner can add or remove users in a private channels. Private channels can't be found when searching for channels. Consequently, users can't subscribe on their own to private channel. |
| **Public** | Users are free to subscribe to a public channel. Public channels can be found when searching for channels. The visibility of a channel is limited to my company. |

In a channel, the membership of a user (role) can be **owner**, **member**, **publisher** or **none**.

| User role | Description |
|:----------|:------------|
| **Owner** | The owner is the user who creates the channel. A owner can modify information of the channel, can invite other users (including new owners) can publish messages and can receive incoming messages |
| **Publisher** | A publisher is a member of a channel who can publish messages in that channel and can receive incoming messages |
| **Member** | A member of a channel can only receive incoming messages |
| **None** | A user with this particular role is a user who left the channel (by his own or removed by a owner) |


### Retrieving the list of existing channels
---

Once connected to Rainbow, the SDK for Node.JS will automatically retrieve the channels where you are owner and the channels where you have subscribed (by your own or by an owner).

To access to the list of channels, you have to call the API `getAllChannels()` such as in the following samples:

```js

...
rainbowSDK.events.on('rainbow_onready', function() {

    let channels = nodeSDK.channels.getAllChannels();
    
    // Do something with the channel created
    ...
});

```

Each time you create a new channel or you subscribe to a new one, this list will be updated. Same thing will happens when you unsubscribe or when you delete a channel.

Note: Others methods like `getAllOwnedChannels()` and `getAllSubscribedChannels()`  are available to get the list of channels you own or the list of channels you subscribed.


### Retrieve a channel information by its id
---

If you know the `id` of an existing channel, you can access to the information by calling the API `getChannelById()` as follows:


```js

    ...
    let channelId = "...";

    // Retrieve the bubble information when receiving a message from a bubble
    rainbowSDK.channels.getChannelById(channelId).then((channel) => {
        // Do something with the channel
        ...
    }).catch((err) => {
        // Do something in case of error
        ...
    });
    
});

```

Note: Using this API, if the channel is not found locally, a request is sent to the server to retrieve it.


### Creating channels
---

Channels can be created by using the API `createChannel()` or `createPrivateChannel()`.


#### Creating a new private channel
---

In order to create a new private channel, add the following code:

```js

nodeSDK.channels.createPrivateChannel("a private channel", "The description of my private channel").then((channel) => {
    // Do something with the channel created
    ...
}).catch(err) {
    // Do something in case of error
    ...
});

```

#### Creating a new public channel
---

You have to use the API `createChannel()` for creating a public channel as in the following:

When creating a public channel, only users from the same company can found this channel and subscribe to it.


```js

nodeSDK.channels.createChannel("a company channel", "The description of my channel limited to my company").then((channel) => {
    // Do something with the channel created
    ...
}).catch(err) {
    // Do something in case of error
    ...
});

```

#### Updating a channel
---

At any time, as a owner, you can update the channel description by using the API `updateChannelDescription()` as follows:


```js

nodeSDK.channels.updateChannelDescription(channel, "The new description of my channel").then((channelUpdated) => {
    // Do something with the channel updated
    ...
}).catch(err) {
    // Do something in case of error .
    ...
});

```


### Adding and removing users in private channel
---

Like mentionned in the preamble, in a private channel, the users can't subscribe on their own. So, the owner has to add a list of users to a private channel so that these users are able to receive messages sent on that channel.

The followin paragraphes describe how to add users in a channel depending on the role you want to attach to these users.


#### Adding new members to a private channel
---

New users with role members can be added to a channel using the API `addMembersToChannel()` as in the following code:

```js

let channel = <...> // A channel
let users = [...]   // A list of users

nodeSDK.channels.addMembersToChannel(channel, users).then((channelUpdated) => {
    // Do something once the users have been added to the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

#### Adding new publishers to a private channel
---

New publishers can be added to a channel using the API `addPublishersToChannel()` as in the following code:

```js

let channel = <...> // A channel
let users = [...]   // A list of users

nodeSDK.channels.addPublishersToChannel(channel, users).then((channelUpdated) => {
    // Do something once the users have been added to the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

#### Adding new owners to a private channel
---

New owners can be added to a channel using the API `addOwnersToChannel()` as in the following code:

```js

let channel = <...> // A channel
let users = [...]   // A list of users

nodeSDK.channels.addOwnersToChannel(channel, users).then((channelUpdated) => {
    // Do something once the users have been added to the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

#### Updating users in a private channel
---

When calling the API `addMembersToChannel()`, `addPublishersToChannel()` and `addOwnersToChannel()` on existing users, they will receive the latest role set.


#### Removing users from a private channel
---

Users can be removed from a channel by calling the API `removeUsersFromChannel()` as in the following code

```js

let channel = <...> // A channel
let usersToRemove = [...]   // A list of users

nodeSDK.channels.removeUsersFromChannel(channel, usersToRemove).then((channelUpdated) => {
    // Do something once the users have been removed from the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

If you want to remove all users of a channel, you can use the API `removeAllUsersFromChannel()` instead as follow:

```js

let channel = <...> // A channel

nodeSDK.channels.removeAllUsersFromChannel(channel).then((channelUpdated) => {
    // Do something once the users have been removed from the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

### Getting all users from a channel
---

You can have access to the list of users that have subscribed to a channel by using the API `getUsersFromChannel()` as in the following sample:

```js

let channel = <...> // A channel

nodeSDK.channels.getUsersFromChannel(channel).then((listOfUsers) => {
    // Do something with the list of users
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

By default, you will only receive the 100 first users in that channel. Due to the fact that a channel can contain several thousands of users, you could not retrieve it in one shot to avoid an heavy HTTP request. Instead, you can use an additionnal `options` parameter to paginate or add specific filters that will give you less results to display (and so a better UX).

The `options` contains the following parameters:

```json

let options = {
    "page": 0, // The index of the page of results to receive. By default the first (0)
    "limit": 100, // The number of users per page of results. By default 100.
    "onlyPublishers": false, // Filter to display only publishers and owners
    "onlyOwners": false // Filter to display only owners.
};

```

So for example, if there are 1000 users in a channel and you want to display a paginated table with the first 25 users, set the parameter `page` to `0` and the parameter `limit` to `25`. Then if the user wants to display the next page, simply change the parameter `page` to `1`.

So finally, here is a more complex example where display a paginated list of members that are at least `publisher`.

```js

let options = {
    "page": 2, 
    "limit": 50, 
    "onlyPublishers": true
};

let channel = <...> // A channel

nodeSDK.channels.getUsersFromChannel(channel, options).then((listOfUsers) => {
    // Do something with the list of users
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Note: You can know how many users are in a channel by using the property `users_count`. This will give you the total number of users in a channel included you.


### Sending messages to channel
---

Message can be sent to a channel by using the API `publishMessageToChannel()`.

A message can contain the following fields:

| Fields | Limit | Description |
|:-------|-------|:------------|
| **message** | 1024 | The text message to send. This field is **mandatory** |
| **title** | 256 | The title of your message. |
| **url** | - | An link to a file or web site can be added |

Here is an example sending a message to a channel:

```js

let channel = <...> // A channel
let aMessage = "This message will be sent to all users of this channel";
let aTitle = "This title is optional";
let aURL = "https://host.adomain/alinktoagreatarticle/";

nodeSDK.channels.publishMessageToChannel(channel, aMessage, aTitle, aURL).then((message) => {
    // Do something once the message has been sent
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

### Listening to message from a channel
---

In order to catch messages from channel, you have to subscribe to the event `rainbow_onchannelmessagereceived` as follows

```js

nodeSDK.events.on("rainbow_onchannelmessagereceived", (message) => {
    // Do something with the channel event
    ...
});

```

A `message` will contain the following structure:

```json

{
    "messageId": "5E6BCE5E54A37",
    "channel": <...>,                                                   // The JavaScript channel object       
    "fromJid": "c2e80b1c0qe5c44dbaf9cfe6d1a88e204@openrainbow.com",     // The JID of the publisher
    "message": "aMessage",
    "title": "aTitle",
    "url": "https://www.openrainbow.com/",
    "date": "2017-11-15T19:22:06.342Z"                                  // A JavaScript Date object
}

```


### Searching for a public channel
---

Public channels can be found by using the API `findChannel()` and providing a channel name.

Here is an example:


```js

let channelName = "myChannel";

nodeSDK.channels.findChannel(channelName).then((list) => {
    // Do something with the channels found
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Note: Only users from the same company as the owner can found this channel.


### Subscribing to a public channel
---

When a channel has been found, you can subscribe to it by calling the API `subscribeToChannel()` such as in the following sample:

```js

let channelName = "myChannel";

nodeSDK.channels.findChannel(channelName).then((list) => {
    let channel = list[0]; // Pick the right channel in that list
    return nodeSDK.channels.subscribeToChannel(channel);
}).then(status) {
    // Do something once subscribed to the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Once subscribed, you will be able to receive notification of new messages posted on that channel by listening to the event `rainbow_onchannelmessagereceived`.


### Unsubscribing from a public channel
---

At any time, you can unsubscribe from a public channel by calling the API `unsubscribeFromChannel()` as follows:

```js

let channelName = "myChannel";

nodeSDK.channels.findChannel(channelName).then((list) => {
    let channel = list[0]; // Pick the right channel in that list
    return nodeSDK.channels.unsubscribeFromChannel(channel);
}).then(status) {
    // Do something once unsubscribed from the channel
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


### Deleting a channel
---

A channel can be deleted by calling the API `deleteChannel()` as in the following sample:

```js

let channel = <...> // A channel

nodeSDK.channels.deleteChannel(channel).then((message) => {
    // Do something once the channel has been deleted
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Once deleted, nobody can't publish a message anymore.


### Limitations
---

Here is a list of limitations regarding Channels:

| Limit | Value | Description |
|:------|:------|:------------|
| **Max items saved when offline** | 100 | If you were not connected during a long time, you will be able to get only the 100 latest messages from a channel. Older messages will never been received. |


---

_Last updated November, 17th 2017_