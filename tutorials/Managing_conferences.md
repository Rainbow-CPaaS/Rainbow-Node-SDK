## Managing Conferences
---

### Preamble
---

Using the Rainbow SDK for Node.JS, you have the possibility to create and administrate Bubbles as well as to participate to the discussion. This guide is focussed on the management of the Bubbles. If you need to know how to send and receive messages in Bubbles, have a look to the guide [Answering to Chat Messages](/doc/sdk/node/guides/Answering_chat_message).

### Managing conferences 

This guide explains how to manage conferences from a bubble: get list of participants, mute/unmute participant, drop participant, get list of publishers

Publishers are people using media others than audio like **sharing** or **video**

The short term **Conference** is used as a reference to **WebRTC conference**: the audio part is done in WebRTC. Then another media can be added (sharing, video) alos in WebRTC.

### Check permissions
---

First thing to do, it's to check if the user can make conferences. For this `conferenceAllowed` methods must be used from `Bubbles` object. 


```js

...
//Once connected

// Is the WebRTC conference allowed ?
let conferenceAllowed = rainbowSDK.bubbles.conferenceAllowed();
...

```

### WebRTC conferences

Web conferences are linked to bubbles. Bubbles has `confEndpoints` property which describe the id of conference.  
To get current conferences you can call the `BubblesService::retrieveConferences` API. 
The WebRTC conferences can not be joined from node SDK because a WebRTC stack is need, and none is integrated in it. So it has to be done from common UI. 

 
```js
...
//Once connected

// @deprecated
rainbowSDK.bubbles.retrieveConferences(undefined, false, false).then((conferences) => {
        console.log("(retrieveConferences) conferences : ", conferences);
});

...

// Retrieve my owned bubbles and select one by name.
let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();

let myBubbleToConferenced = null;
for (const bubble of bubbles) {
    if (bubble.name === "BullesOfTests") {
        console.log("Found BullesOfTests bubble : ", bubble);
        myBubbleToConferenced = bubble;
    }
}
let conferencId = null;

// Start a conference linked to the bubble provided in poarameter. 
rainbowSDK.bubbles.startConferenceOrWebinarInARoom(myBubbleToConferenced.id).then((result) => {
    // the id of the conference is in the result of the start in confId properties. 
    // It allow to follow the life of the bubble with the `rainbow_onbubbleconferenceupdated` event (see bellow).
    // Note that only a first event is received with the `participant::connected` property to false.
    logger.log("debug", "(conferenceStart) result : ", result);
    // To get the events of conference's life, it is necessary to join the conference.
        rainbowSDK.bubbles.joinConferenceV2(bubbleId).then(async (result) => {
                // to retrieve initial state of the conference ask a snapshot. Note that event should also give the informations.
                rainbowSDK.bubbles.snapshotConference(bubbleId).then(async (result) => {
                    ...
                }).catch(err => {
                });                
            }).catch(err => {
            });
});

...

// stop the conference
rainbowSDK.bubbles.stopConferenceOrWebinar(conferencId).then((result) => {
    // 
    logger.log("debug", "(conferenceStop) result : ", result);
});


```

### Follow conference update - WebRTC
---

To follow the status of conference in progress use `rainbow_onbubbleconferencestartedreceived` `rainbow_onbubbleconferencestoppedreceived` `rainbow_onbubbleconferenceupdated` events (same events WebRTC conference).

You can know the list of participants and their status (moderator or not, muted or not), the list of publishers (using "sharing" and or "video"), and the current talkers.  


```js

// Subscribe events before the start of the SDK .
// event when a conference is started
rainbowSDK.events.on("rainbow_onbubbleconferencestartedreceived", (bubble: Bubble) => {
    console.log("debug", "MAIN - (rainbow_onbubbleconferencestartedreceived) - received. bubble : ", bubble);
});

// event when a conference is stopped
rainbowSDK.events.on("rainbow_onbubbleconferencestoppedreceived", (bubble: Bubble) => {
    console.log("debug", "MAIN - (rainbow_onbubbleconferencestoppedreceived) - received. bubble : ", bubble);
});

// event when a conference status or properties updated.
rainbowSDK.events.on("rainbow_onbubbleconferenceupdated", (conference: ConferenceSession) => {
    console.log("debug", "MAIN - (rainbow_onbubbleconferenceupdated) - received. conference : ", conference);
});

...

```

 **Specials usecases**
 
 * When the conference is already started when the sdk before the SDK then a `rainbow_onbubbleconferenceupdated` event will be raised with its information.
 * When the conference is started, but the connected user has not joined (or has leaved) the conference then the `ConferenceSession` object of the `rainbow_onbubbleconferenceupdated` event will have `isActive` field be true, and the `participants` list is empty.   
 When this conference is finaly ended then an event `rainbow_onbubbleconferenceupdated` with property `isActive` field setted to false, and the `participants` setted to an empty list, is raised. 
 * When the conference is delegated to an other moderator of the bubble, then the conference is replaced by a new conference.   
 So the previous conference will be raised with  `rainbow_onbubbleconferenceupdated` event with property `isActive` be false, the `participants` list empty, and a link to the new conference in property `replacedByConference`.  
 And the new conference will be raised with  `rainbow_onbubbleconferenceupdated` event with property `isActive` be true, the `participants` list updated without the moderator who leaved, and a link to the old conference in property `replaceConference`.
 


### Limits
---

To consult the exact limits concerning the Rainbow Bubbles, visit [this link](/doc/hub/features-limits)

---

_Last updated december, 08th 2022_
