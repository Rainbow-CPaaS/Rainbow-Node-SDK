## Telephony calls
---

Rainbow Node SDK provides you with a possibility to make and manage telephony calls.

    There are severals type of calls : 
        - 3PCC calls done with a PBX linked to rainbow.
        - Conference calls done in a bubble. 
        - Webrtc calls done with rainbow officials UI (Android/Ipad/Desktop/Web). Note that it can not be done by node SDK. Only events are available. 


## 3PCC Events calls
---

Rainbow Telephony is heavily dependent on the events received by the connected users. 
There are two main types of 3PCC telephony events: those informing about the system changes (i.e. telephony started or nomadic state changed) and those being activated during a call. 
First category of events include:

- `rainbow_ontelephonystatuschanged` - Fired when status of the telephony service event is received. 
- `rainbow_onnomadicstatusevent` - informing about the Nomadic Event 
- `rainbow_onvoicemessageupdated` - Fired when a voice message updated event is received

Whereas the events activated during a call include:

- `rainbow_oncallupdated` - Fired during a pure 3PCC telephony call 
- `rainbow_oncallforwarded` - Fired when the forward state changes or by request (getForwardStatus)
- `rainbow_onconferenced` - Fired when a pure 3PCC telephony call is conferenced.

### rainbow_oncallupdated event sequence
---

This event is fired when the connected user's has a call on his 3PCC phoneset. 

#### Outgoing Telephony call event sequence
---

Here's what the event sequence data.status.value looks like from Alice's side.

Alice uses `makeCall()`  or `makeCallByPhoneNumber()` to call Bob:

| Number | Type  | Satus           |
| --- | --- | --- |
| 1      | Phone | dialing         |
| 2      | Phone | dialing         |
| 3      | Phone | ringingOutgoing |

Bob uses `answerCall()`:

| Number | Type  | Satus           |
| --- | --- | --- |
| 4      | Phone | active          |
| 5      | Phone | active          |

Bob uses `releaseCall()`;

| Number | Type  | Satus           |
| --- | --- | --- |
| 6      | Phone | Unknown         |
| 7      | Phone | Unknown         |

#### Incoming Telephony call event sequence
---

Here's what the event sequence looks like from Bob's side.

Alice uses `makeCall()` or `makeCallByPhoneNumber()` to call Bob:

| Number | Type  | Satus           |
| --- | --- | --- |
| 1      | Phone | incommingCall   |

Bob uses `answerCall()`:

| Number | Type  | Satus           |
| --- | --- | --- |
| 2      | Phone | active          |  

Bob uses `releaseCall()`;

| Number | Type  | Satus           |
| --- | --- | --- |
| 3      | Phone | Unknown         |  

## Conference calls
---

The conferences are described in the following guide [Conferences](/#/documentation/doc/sdk/node/guides/Managing_conferences) .
The events call about conferences are : 
- `rainbow_onbubbleconferencestartedreceived` - Fired when a webrtc conference is started. 
- `rainbow_onbubbleconferenceupdated` - Fired when a webrtc conference is updated. 
- `rainbow_onbubbleconferencestoppedreceived` - Fired when a webrtc conference is stopped. 

### rainbow_onbubbleconferencestartedreceived

When informations about the call are created in the conference it is done. 

```js
// sample of 'started' conference received event :
  Bubble {
  nameForLogs: 't************************************* ********1',
  status: 'invited',
  id: '61b0f0e2ccfe063af041861d',
  name: 'testBot2021/12/08T17:52:38.765Z[object Object]_1',
  jid: 'room_a2ed570e96fe4eeb9f604f9ed1418d0b@muc.openrainbow.net',
  isActive: true,
  lastActivityDate: '2022-02-09T17:26:29.371Z',
...
  conference: {
    scheduled: false,
    guestEmails: [],
    disableTimeStats: false,
    mediaType: 'webrtc',
    lastUpdateDate: '2022-02-09T17:26:29.150Z',
    sessions: []
  },
  disableNotifications: false,
...
  confEndpoints: [
    {
      confEndpointId: '617831e66d88e93afaa37ca4',
      userId: '5c3df93776f3518978c1d08a',
      mediaType: 'webrtc'
    }
  ],
...
    }
  }
}
```

### rainbow_onbubbleconferenceupdated

When informations about the call are updated in the conference it is done. 

```js
// sample of 'updated' conference during the call received event :
{
  _participants: List {
    list: [
      Participant {
        _id: '6203f94c0ac91865d50a8b3d',
        _jid_im: '29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net',
        _contact: [Contact],
        _moderator: false,
        _muted: false,
        _delegateCapability: true,
        _microphone: true,
        _talkingTime: 0,
        _connected: true
      },
      Participant {
        _id: '6203f945cca6687d54f7da36',
        _jid_im: 'adcf613d42984a79a7bebccc80c2b65e@openrainbow.net',
        _contact: [Contact],
        _moderator: true,
        _muted: false,
        _delegateCapability: true,
        _microphone: true,
        _talkingTime: 0,
        _connected: true
      }
    ]
  },
  _publishers: List { list: [] },
  _talkers: List { list: [] },
  _silents: List { list: [] },
  _id: '617831e66d88e93afaa37ca4',
  _mediaType: 'webrtc',
  _active: true,
  _locked: false,
  _talkerActive: true
}

// sample of 'updated' conference when the contact leave the call received event :
{
  _participants: List { list: [] },
  _publishers: List { list: [] },
  _talkers: List { list: [] },
  _silents: List { list: [] },
  _id: '617831e66d88e93afaa37ca4',
  _mediaType: 'webrtc',
  _active: true
}

// sample of 'updated' conference when the contact leave the call with a delegate received event :
{
  _participants: List { list: [] },
  _publishers: List { list: [] },
  _talkers: List { list: [] },
  _silents: List { list: [] },
  _id: '6200f8fed65df92deaef9988', // the leaved call can be join again with this new conference id.
  _mediaType: 'webrtc',
  _active: true,
  _replaceConference: ConferenceSession {
    _participants: List { list: [] },
    _publishers: List { list: [] },
    _talkers: List { list: [] },
    _silents: List { list: [] },
    _id: '6200f8dad65df92deaef9986',
    _mediaType: 'webrtc',
    _active: false,
    _locked: false,
    _talkerActive: true,
    _replaceConference: null,
    _replacedByConference: [Circular *1]
  }
}
```

### rainbow_onbubbleconferencestoppedreceived

When informations about the call are stopped in the conference it is done. 

```js
// sample of 'stopped' conference received event :
Bubble {
  nameForLogs: 't************************************* ********1',
  status: 'accepted',
  id: '61b0f0e2ccfe063af041861d',
  name: 'testBot2021/12/08T17:52:38.765Z[object Object]_1',
  jid: 'room_a2ed570e96fe4eeb9f604f9ed1418d0b@muc.openrainbow.net',
  creator: '5c3df93776f3518978c1d08a',
  creationDate: '2021-12-08T17:52:34.505Z',
  ...
  isActive: true,
  lastActivityDate: '2022-02-10T08:42:44.667Z',
  conference: {
    scheduled: false,
    guestEmails: [],
    disableTimeStats: false,
    mediaType: 'webrtc',
    lastUpdateDate: '2022-02-10T08:42:44.392Z',
    sessions: []
  },
  disableNotifications: false,
  lastAvatarUpdateDate: null,
  guestEmails: [],
  confEndpoints: [],
  activeUsersCounter: 4,
...
    }
  }
}
```

##  P2P WEBRTC Calls
---

The WebRtc calls are not possible thru the node SDK, but events of signalisation are provided from incomming calls and outgoing calls from other resources (devices).

### Incomming calls Events
---

Rainbow Telephony is heavily dependent on the events received by the connected users. 
Events include:
- `rainbow_onmediapropose` - Fired when a webrtc incomming call event is received. 
- `rainbow_onmediaretract` - Fired when the webrtc call is canceled before the accept action. 
- `rainbow_onmediaaccept` - Fired when the webrtc call is accepted (on an other resource(device)).

complementaries events : 
- `rainbow_onpresencechanged` - Fired when the connected user's rainbow presence has changed. So in this use case when webrtc telephony accepted or released call event is received. 
- `rainbow_oncalllogupdated` - Fired when the webrtc call is ended and added in the rainbow calllog. 

#### rainbow_onmediapropose
---

The propose event give the SDK the information an other contact try to connect with webrtc audio call.

```js
// sample of 'propose' received event :
{
  contact: {
    ...
  },
  resource: 'web_win_2.100.9_g3wt6YSJ',
  xmlns: 'urn:xmpp:jingle-message:0',
  description: { media: 'audio', xmlns: 'urn:xmpp:jingle:apps:rtp:1' },
  unifiedplan: { xmlns: 'urn:xmpp:jingle:apps:jsep:1' },
  id: 'web_12699b55-d686-469e-a6e1-8cacad388f7a'
}
```

#### rainbow_onmediaretract
---

The retract event give the SDK the information the previously proposed webrtc audio call has been canceled.

```js
// sample of 'retract' received event :
{
  contact: {
    ...
  },
  resource: 'web_win_2.100.9_g3wt6YSJ',
  xmlns: 'urn:xmpp:jingle-message:0',
  id: 'web_12699b55-d686-469e-a6e1-8cacad388f7a'
}
```

#### rainbow_onmediaaccept
---

The accept event give the SDK the information the previously proposed webrtc audio call has been accepted on an other resource/device.

```js
// sample of 'accept' received event :
{
  contact: {
    ...
  },
  resource: 'web_win_2.100.9_g3wt6YSJ',
  xmlns: 'urn:xmpp:jingle-message:0',
  id: 'web_12699b55-d686-469e-a6e1-8cacad388f7a'
}
```

#### rainbow_onpresencechanged
---

The presence event give the SDK the information about the connected user. 
It provides the global rainbow "phone" presence, and also the presence for the resources of the connected user.
 

```js
// sample of Contact object for the 'presence' on phone received event :
{
...
    lastName: 'berder11',
    firstName: 'vincent11',
    isTerminated: false,
    language: 'en',
    presence: 'dnd', // Contact user is occuped
    status: 'audio', // Contact is on phone (can be video also)
    resources: {
      node_nOhbvMKM: {
        show: 'online',
        status: 'mode=auto',
        delay: '',
        until: '',
        type: 'node'
      },
      'web_win_2.100.9_LqVU9olu': { // The resource on phone (can be video).
        show: 'dnd',
        status: 'audio',
        delay: '',
        until: '',
        type: 'desktopOrWeb'
      }
    },
    nameUpdatePrio: 99,
    initials: 'VB',
    nickname: '',
...
}

// sample of Contact object for the 'presence' on released phone call received event :
{
...
    lastName: 'berder11',
    firstName: 'vincent11',
    isTerminated: false,
    language: 'en',
    presence: 'online', // Contact user is online and available
    status: '', 
    resources: {
      node_nOhbvMKM: {
        show: 'online',
        status: 'mode=auto',
        delay: '',
        until: '',
        type: 'node'
      },
      'web_win_2.100.9_LqVU9olu': { // The resource is not any more on phone..
        show: 'online',
        status: '',
        delay: '',
        until: '',
        type: 'desktopOrWeb'
      }
    },
    nameUpdatePrio: 99,
    initials: 'VB',
    nickname: '',
...
}
```


### Outgoing Telephony call event sequence
---

There are no event forwarded to other resources/devices when a webrtc call is started, so the node SDK do not receives event about webrtc out going call from other resources/devices.

Only the presence is forwarded, so it is possible to see the on `phone/video` status.
