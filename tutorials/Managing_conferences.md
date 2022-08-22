## Managing Conferences
---

### Preamble
---

Using the Rainbow SDK for Node.JS, you have the possibility to create and administrate Bubbles as well as to participate to the discussion. This guide is focussed on the management of the Bubbles. If you need to know how to send and receive messages in Bubbles, have a look to the guide [Answering to Chat Messages](/doc/sdk/node/guides/Answering_chat_message).

### Managing conferences - PSTN or WebRTC

This guide explains how to manage conferences from a bubble: get list of participants, mute/unmute participant, drop participant, get list of publishers

Publishers are people using media others than audio like **sharing** or **video**

The term **PersonalConference** is used as a reference to **PSTN conference**: people can use their own phone device to join this kind of conference. Then another media can be added (sharing, video) but only in WebRTC.

The short term **Conference** is used as a reference to **WebRTC conference**: the audio part is done in WebRTC. Then another media can be added (sharing, video) alos in WebRTC.

### Check permissions
---

First thing to do, it's to check if the user can make conferences. For this `ConferenceAllowed` and `PersonalConferenceAllowed` methods must be used from `Bubbles` object. 


```js

...
//Once connected

// Is the WebRTC conference allowed ?
let conferenceAllowed = rainbowSDK.bubbles.conferenceAllowed();
// Is the PSTN conference allowed ?
let personalConferenceAllowed = rainbowSDK.bubbles.personalConferenceAllowed();
...

```

### Phone Numbers, access code and public URL to acces the Personal Conference
---

A Personal Conference must be joined in audio by a standard phone device. So it's necessary to have a phone number to access it - for this use `BubblesService::personalConferenceGetPhoneNumbers` method.

Once joined you need to enter an access code in DTMF to grant the permission. There is a code different for moderators and for participants. To have them use `BubblesService::personalConferenceGetPassCodes` method.

You can also share a public URL to any person you want. So they can access to a web site which then permits to access to the conference. To have this URL use `BubblesService::personalConferenceGetPublicUrl` method.

It's also possible to ask the server to call you back direclty to a phone number to join the conference. In same time you can specify you role: moderator or participant. To do this use `BubblesService::personalConferenceJoin` method.

**NOTE**: before to use `BubblesService::personalConferenceJoin` method, the conference must first be started using `BubblesService::personalConferenceStart` method


```js
...
//Once connected

let personalConfPhones = await rainbowSDK.bubbles.personalConferenceGetPhoneNumbers();

...

let personalConfPassCode = await rainbowSDK.bubbles.personalConferenceGetPassCodes();

...

let personalConfPublicUrl = await rainbowSDK.bubbles.personalConferenceGetPublicUrl();

...

let asModerator = true;           // User wants to join as moderator;
let muted = true;                 // User want to join directly as muted;
let phoneNumber = "+33612345678";  // The phone number used to be called back by the server - use an international format
let country = "FRA";               // The country of the user - can be empty

await rainbowSDK.bubbles.personalConferenceStart();
// The server as well started the conference - so we can now join it
await rainbowSDK.bubbles.personalConferenceJoin(asModerator, muted, phoneNumber, country );

```

### WebRTC conferences

Web conferences are linked to bubbles. Bubbles has `confEndpoints` property which describe the id of conference.  
To get current conferences you can call the `BubblesService::retrieveConferences` API. 
The WebRTC conferences can not be joined from node SDK because a WebRTC stack is need, and none is integrated in it. So it has to be done from common UI. 

 
```js
...
//Once connected

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
rainbowSDK.bubbles.conferenceStart(myBubbleToConferenced).then((result) => {
    // the id of the conference is in the result of the start in confId properties. 
    // It allow to follow the life of the bubble with the `rainbow_onbubbleconferenceupdated` event (see bellow).
    // Note that only a first event is received with the `participant::connected` property to false.
    // To get the events of conference's life, it is necessary to join the conference from a common UI (not possible with node SDK).   
    logger.log("debug", "(conferenceStart) result : ", result);
});

...

// stop the conference
rainbowSDK.bubbles.conferenceStop(conferencId).then((result) => {
    // 
    logger.log("debug", "(conferenceStop) result : ", result);
});


```

### Reset access code and public URL of the Personal Conference
---

For security reason, if you want you can reset access code and public URL of your personal conference.

To do this, you must use `personalConferenceResetPassCodes` and `personalConferenceGenerateNewPublicUrl` methods. 


```js
...
//Once connected

await rainbowSDK.bubbles.personalConferenceResetPassCodes();

...

await rainbowSDK.bubbles.personalConferenceGenerateNewPublicUrl();

```

### Follow conference update - PSTN or WebRTC
---

To follow the status of conference in progress use `rainbow_onbubbleconferencestartedreceived` `rainbow_onbubbleconferencestoppedreceived` `rainbow_onbubbleconferenceupdated` events (same events for PSTN or WebRTC conference).

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
 

### Lock/UnLock, Mute/Unmute and Stop Conference
---

You can lock / unlock a Personal Conference (but not WebRTC Conference) using `BubblesService::personalConferenceLockOrUnlock` method. Once locked it's no more possible to reach the conference using audio.

You can mute all participants except moderators using `BubblesService::personalConferenceMuteOrUnmute` or `BubblesService::conferenceMuteOrUnmute` methods. In Personal Conference, participants muted need to wait to be unmuted to speak. In WebRTC Conference they can unmute theirself.

You can stop a conference using  `BubblesService::personalConferenceStop` or `BubblesService::conferenceStop` methods.

Example below explain how to use them for a Personal Conference. It's nearly the same for WebRTC Conference, you just need to specify also a conference Id.

```js

...
//Once connected


// We want to lock the conference
let lockConference = true;
await rainbowSDK.bubbles.personalConferenceLockOrUnlock(lockConference);

...

// We want to mute the conference
let muteConference = true;

await rainbowSDK.bubbles.personalConferenceMuteOrUnmute(lockComuteConferencenference);

...

// We want to stop (end) the conference - All participants are dropped (even moderators)
await rainbowSDK.bubbles.personalConferenceStop();

```


### Mute/Unmute, Drop participant
---

You can mute/unmute a specific participant using `BubblesService::personalConferenceMuteOrUnmutParticipant` or `BubblesService::conferenceMuteOrUnmutParticipant` method from `Bubbles` object. In Pesonal Conference, a muted particpant must wait to be unmuted. In a WebRTC conference, he can unmute himself.

You can drop a specific participant using `PBubblesService::personalConferenceDropParticipant` or `BubblesService::conferenceDropParticipant` method from `Bubbles` object. This participant looses all media currently used.

Example below explain how to use them for a Personal Conference. It's nearly the same for WebRTC Conference, you just need to specify also an conference Id.

```js

...
//Once connected

let participantID; // Id of a participant previously set
let mute = true;  // We want to mute this participant
await rainbowSDK.bubbles.personalConferenceMuteOrUnmutParticipant(participantID, mute);

...

// Id of a participant previously set
let participantID; 
await rainbowSDK.bubbles.personalConferenceDropParticipant(participantID);
```


### Limits
---

To consult the exact limits concerning the Rainbow Bubbles, visit [this link](/doc/hub/features-limits)

---

_Last updated April, 04th 2017_
