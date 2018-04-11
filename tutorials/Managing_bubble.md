## Managing Bubbles
---

### Preamble
---

Using the Rainbow SDK for Node.JS, you have the possibility to create and administrate Bubbles as well as to participate to the discussion. This guide is focussed on the management of the Bubbles. If you need to know how to send and receive messages in Bubbles, have a look to the guide [Answering to Chat Messages](/#/documentation/doc/sdk/node/guides/Answering_chat_message).


### Retrieve the list of existing bubbles
---

The first thing to do when connecting to Rainbow with the SDK for Node.JS is to get the existing list of Bubbles where the connected user is. Hopefully, this is done automatically by the SDK and once the event `rainbow_onready` you have access to this list by calling the API `getAll()` like in the following sample:


```js

...
rainbowSDK.events.on('rainbow_onready', function() {
    // Do something when the connection to Rainbow is done and the SDK is ready to be used
    let bubbles = rainbowSDK.bubbles.getAll();
    
    // Do something with the list of bubbles
    ...
});

```

Each new bubble created will then be added to that list automatically. Same when Bubbles have been removed or updated, this list is updated.

Note: Others methods like `getAllPendingBubbles()`, `getAllActiveBubbles()` and `getAllClosedBubbles()` are available to get the list of bubbles where the connected user is invited, where the connected user is active and that are closed.


### Retrieve a bubble information
---

If you know the `id` or the `JID` of an existing bubble, you can access to the information by calling the API `getBubbleByJid()` or `getBubbleById()` like in that sample:


```js

    ...
    // Retrieve the bubble information when receiving a message from a bubble
    let bubble = rainbowSDK.bubbles.getBubbleByJid(message.fromBubbleJid);

    // Do something with that bubble
    ...
});

```


### Create a new Bubble
---

At any time, you can create a new bubble by calling the API `createBubble()`. Depending your need you can create a bubble with history or not.

By setting the parameter `withHistory` to `true` will allow newcomers to have access to the complete history of the bubble and so newcomers can read all messages exchanged before their entrance to the bubble.  

By setting this parameter to `false`, only new messages exchanged will be seen by newcomers.


```js

...
let withHistory = true; // Allow newcomers to have access to the bubble messages since the creation of the bubble
rainbowSDK.bubbles.createBubble("My new Bubble", "A little description of my bubble", withHistory).then(function(bubble) {
    // do something with the bubble created
    ...
}).catch(function(err) {
    // do something if the creation of the bubble failed (eg. providing the same name as an existing bubble)
    ...
});

```

Once the bubble is created, you can then invite or add Rainbow users to that bubble.


### Inviting a Rainbow user to a bubble
---

To invite a Rainbow user to one of your bubble, use the API `inviteContactToBubble()` like in the following:


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


The user will then receive an invitation to join the bubble and can accept or decline the invitation.


### Inviting a Rainbow user to a bubble as a moderator
---

You can invite a Rainbow user as a new moderator of the Bubble by calling the same API `inviteContactToBubble()` and setting the parameter `invitedAsModerator` to `true` like in the following:


```js

...

let invitedAsModerator = true;     // To set to true if you want to invite someone as a moderator
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


If a user is invited as a moderator, it will have the right to invite or ban users and change the bubble parameters and data.


### Adding a Rainbow user to a bubble
---

Instead of inviting Rainbow users to a bubble, in some cases, you want to add them directly without sending them an invite. 

You can do this case by setting the parameter `sendAnInvite` to `false` like in that sample:


```js

...

let invitedAsModerator = true;     // To set to true if you want to invite someone as a moderator
let sendAnInvite = false;            // To set to false if you want to add someone to a bubble without having to invite him first
let inviteReason = "bot-invite";    // Define a reason for the invite (part of the invite received by the recipient)

rainbowSDK.bubbles.inviteContactToBubble(aContact, aBubble, invitedAsModerator, sendAnInvite, inviteReason).then(function(bubbleUpdated) {
    // do something with the invite sent
    ...
}).catch(function(err) {
    // do something if the invitation failed (eg. bad reference to a buble)
    ...
});

```


The user will then be added directly to the Bubble and can directly participate.


### Remove a contact from a bubble
---

A member can be removed from a bubble even the connected user is a moderator of the bubble. 

For removing a member, you can call the API `removeContactFromBubble()` like in that sample:


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

Once removed, the user will still be able to read the content of the bubble but can't see new messages added or post a new message. Others members are informed that this user has been removed.


### Setting custom data to a Bubble
---

Bubble can contain additional custom data that can be set by a moderator of that bubble depending your need.

For doing that, you have to specify a valid `JSON` object and use the API `setBubbleCustomData()` like in the following:


```js

...
let customDatas = {
    "aString": "The One", 
    "aNumber" : 1, 
    "anObject": {
        "aSubKey": "ASubValue"
    }
};

rainbowSDK.bubbles.setBubbleCustomData(bubble, customDatas).then(function(bubble) {
    // do something with the updated bubble
    ...
}).catch(function(err) {
    // do something if there is an issue adding custom data (e.g. too much keys...)
    ...
});

```


Please note that there is some limitations regarding the custom data to avoid abuse. These limitations are described here:

|Limit | Value | Description |
|------|-------|:------------|
| Number of keys | 20 | The customData is an object with a maximum of 20 keys & values |
| Key name length | 64 | Each key name can be a string with a maximum of 64 characters |
| Max size | 4096 octets | The max size of the whole custom data of a bubble is 4096 octets |

As you can see, custom data are used to store some additional information like a state, a localization..., but not for storing big data like a video or a file or something like that.


### Modifying custom data of a Bubble
---

Custom data can be updated or removed at any time by a moderator.

In fact, each time you call the API `setBubbleCustomData()`, the old keys are removed and replaced by the new keys set. Here is an example that explains how it works:


```js

// No initial custom data to my bubble. Add these values
let customDatas = {
    "key1": "value1", 
    "key2": "value2", 
    "key3": "value3"
};

rainbowSDK.bubbles.setBubbleCustomData(bubble, customDatas).then(function(bubble) {
    
    // 3 keys have been added
    // bubble.customData = {"key1": "value1", "key2": "value2", "key3": "value3"}

    let newCustomDatas = {
        "key2": "newValue2"
    }

    return rainbowSDK.bubbles.setBubbleCustomData(bubble, newCustomDatas);
}).function(bubble) {

    // 2 keys removed, 1 key updated
    // bubble.customData = {key2: "newValue2"}

}).catch(function(err) {
    // do something if there is an issue changing custom data (e.g. too much keys...)
    ...
});

```


### Modifying the name of the bubble
---

Name of the bubble can be updated at any time by a moderator by calling the API `setBubbleName()` like in the following code:


```js

};

rainbowSDK.bubbles.setBubbleName(bubble, "my new name").then(function(bubble) {

    // do something once the name of the bubble has been changed

}).catch(function(err) {
    // do something if there is an issue updating the name of the bubble
    ...
});

```


### Modifying the topic of the bubble
---

Topic of the bubble can be updated at any time by a moderator by calling the API `setBubbleTopic()` like in the following code:


```js

};

rainbowSDK.bubbles.setBubbleTopic(bubble, "my new topic").then(function(bubble) {

    // do something once the topic of the bubble has been changed

}).catch(function(err) {
    // do something if there is an issue updating the topic of the bubble
    ...
});

```


### Be notified when custom data have been modified
---

when a moderator changes the custom data of a bubble, the event `rainbow_onbubblecustomdatachanged` is fired to all the members of the bubble (including the one who did the change).

You can listen to that event by adding the following code:


```js

...
rainbowSDK.events.on('rainbow_onbubblecustomdatachanged', function(bubble) {
    // do something when the custom data has been updated
    ...
});

```


### Be notified when the name of the bubble has been modified
---

when a moderator changes the name of a bubble, the event `rainbow_onbubblenamechanged` is fired to all the members of the bubble (including the one who did the change).

You can listen to that event by adding the following code:


```js

...
rainbowSDK.events.on('rainbow_onbubblenamechanged', function(bubble) {
    // do something when the name has been updated
    ...
});

```


### Be notified when the topic of the bubble has been modified
---

when a moderator changes the topic of a bubble, the event `rainbow_onbubbletopicchanged` is fired to all the members of the bubble (including the one who did the change).

You can listen to that event by adding the following code:


```js

...
rainbowSDK.events.on('rainbow_onbubbletopicchanged', function(bubble) {
    // do something when the topic has been updated
    ...
});

```

### Be notified when a contact changes his affiliation with a bubble 
---

When a user accepts or declines your invite or when he leaves the bubble, you will receive a notification of his affiliation change. You can listen to that event by adding the following code:


```js

...
rainbowSDK.events.on('rainbow_onbubbleaffiliationchanged', function(bubble) {
    // do something the affiliation of a user in that bubble changes
    ...
});

```

In the `bubble` object received, the `users` parameter will be updated with the new status of the user.


### Be notified when the affiliation of the connected user changes with a bubble
---

When a moderator removes you from a bubble, you will receive a notification of your new affiliation with the bubble. You can listen to that event by adding the following code:


```js

...
rainbowSDK.events.on('rainbow_onbubbleownaffiliationchanged', function(bubble) {
    // do something when your affiliation changes for that bubble
    ...
});

```

Your new status will be stored in the `bubble` parameter received.


### Leaving a bubble
---

Depending your role in the bubble, you can or not leave it:
 - If you are a **moderator** or the **owner** of this bubble, you can leave it only if there is an other **active** moderator (that can be the owner or not).
 - If you are a **participant**, you can leave it when you want.

For both cases, you have to call the API `leaveBubble()`:


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

Once leaved, you can still have access to the existing messages exchanged, but not to the new one posted and you can't post new message.


### Closing a bubble
---

If you are the **owner** of a bubble or a **moderator**, you can close it. 

When a bubble is closed, all participants (including owner and moderators) can only read the content of the bubble but can't put new message into it (they are no more part of the bubble).

For closing a bubble, you have to call the API `closeBubble()`:


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

Once closed, a bubble can't be opened again.


### Deleting a bubble
---

If you are the **owner** of a bubble or a **moderator**, you can delete it. 

When a bubble is deleted, the bubble is removed from the bubble list and can't be accessed by the participants (including owner and moderators). The content of the bubble is no more accessible.

For deleting a bubble, you have to call API `deleteBubble()`:


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
---

When someone wants to add the connected user to a bubble the event `rainbow_onbubbleinvitationreceived` is fired. To listen to it, add the following code:


```js

...
rainbowSDK.events.on('rainbow_onbubbleinvitationreceived', function(bubble) {
    // do something wih this bubble
    ...
});

```


### Accepting a request to join a bubble
---

When a request to join a bubble is received from someone, you can accept it by calling the API `acceptInvitationToJoinBubble()` like in the following:


```js

...
rainbowSDK.events.on('rainbow_onbubbleinvitationreceived', function(bubble) {
    // Accept this invitation
    nodeSDK.bubbles.acceptInvitationToJoinBubble(bubble).then(function(updatedBubble) => {
        // Do something once the invitation has been accepted
        ...
    }).catch((err) => {
        // Do something in case of error
        ...
    });
});

```


Once accepting, you will be able to post new message to the bubble and to listen to messages posted by members.


### Declining a request to join a bubble
---

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
---

At anytime, you can get the list of pending invitations by calling the API `getAllPendingBubbles()`:


```js

...
    let pendingBubbles = nodeSDK.bubbles.getAllPendingBubbles();
    // Do something with this list
    ...
});

```

This list contains all the invitations the connected user received from moderators to join bubbles. 

For each invitation, you can call the API `acceptInvitationToJoinBubble()` or `declineInvitationToJoinBubble()` to accept or not to join the bubble.


### Understanding members status and privilege in a Bubble
---

When looking at the `bubble` JavaScript object, you can access to the list of members using the parameters `users`.

For each member, you will have two importants information: the **status** and the **privilege**:

- The status allows to know if the member has already joined the bubble or not, has left and so is able to receive or not the messages

- The privilege allows to know if the member is a moderator or not.


#### Status of a member
---

A member of a bubble can have one of the following status:

| Status | Description |
|:-------|:------------|
| **invited** | The member has been invited to the bubble by a moderator but has still not accepted or declined the invitation yet |
| **accepted** | The member is an active member in the bubble and so can send and receive messages |
| **rejected** | The member has rejected the invitation |
| **unsubscribed** | The member has left the bubble (by his own or by a moderator) |
| **deleted** | The member has been removed from the bubble by a moderator without having accepted or declined the invitation received |

Status can be retrieved using `bubble.users[<index>].status`.


#### Privilege of a member
---

A member of a bubble can have one of the following privilege:

| Privilege | Description |
|:-----|:------------|
| **Moderator** | A member who has been invited with a role of **moderator** can administrate the bubble (eg. Inviting others Rainbow users, renaming the bubble's name and description information, close and delete the bubble...) and collaborate with others members |
| **Participant** | A member who has been invited with a role of **participant** can only collaborate with others members (eg. chatting, sharing files and so can't do administrative tasks in that Bubble |

Note: The Rainbow user who creates the bubble is the owner. But once created, the owner becomes a member with **moderator** privilege in that bubble.

Privilege can be retrieved using `bubble.users[<index>].privilege`.


### Limitations
---

Here is a list of limitations regarding Bubbles:

| Limit | Value | Description |
|:------|:------|:------------|
| **Max number of members per Bubble** | 20 / 100 | A bubble contains a maximum of 20 members for bubble created by a user with Essential or Business profile or 100 members for bubble created by a user with Enterprise profile |
| **Max number of active Bubbles per user** | 300 | Any Rainbow user from any profile can join a maximum number of 300 Bubbles at a time. If the user has more than 300 Bubbles, the remaining Bubbles will be considered as inactive and so the user will not be notified from incoming messages received in these Bubbles. To limit the number of active Bubbles, they can be leaved or closed if no more used. | 


---

_Last updated September, 19th 2017_