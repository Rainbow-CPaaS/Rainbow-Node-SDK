## Retrieving calls history

---

In this tutorial, you will discover how to retrieve your call history.

Each time you call a Rainbow user using audio or video from your mobile application, your browser or when you call someone using your phone connected to a PBX, a call log entry is generated and added to your call history. This tutorial will help you understand how to deal with these information and manage your call history.

### Preamble

---

The call history is not limited to audio and video calls done from Rainbow. Each time someone calls you on your phone associated to your Rainbow user or when you call someone with your phone device registered on Rainbow, a call log entry is generated and saved on Rainbow.

The call history of the connected user will contain all these call log items.

Each entry will contain the following structure:

```JSON

CallLog {
       id: '16E845E7384#84#1354',
       contact:
        Contact {
          id: '23032', // User ID or phone number
          _displayName: '23032 SingleClient',
          name: [Object],
          displayNameMD5: '13221569116aaad0a74fe708bbc50116',
          companyName: '',
          loginEmail: 'noEmail',
          ... },
       state: 'missed', // Or `missed`
       duration: 0, // 0 for missed call
       direction: 'incoming', // Or `outgoing`
       callSubject: '',
       isLatestCall: undefined,
       type: 'telephone', // or `webrtc`
       read: true, // false if new (not marked as read)
       date: 2019-11-19T15:53:30.338Z,
       count: 1,
       editable: true,
       isMissed: true 
}


```

Here are some information regarding the parameters in that structure:

-   Regarding the property `contact`, if the recipient is a Rainbow user, this property will contain a `Contact` object identified by the `ID` information. If the recipient is not a Rainbow user, you can have only a phone number.

-   Regarding the property `read`. Its value equals to `false` if it is a new entry that has not been marked as read.

-   Regarding the property `state`. Its value equals to `answered` if the call has been established or would be set to `missed` otherwise.

-   Regarding the property `type`. Its value equals to `webrtc` if the call has been done with the computer or the mobile using the WebRTC technology or `telephone` otherwise (for a PSTN call).

-   Regarding the property `direction`. Its value equals to `incoming` when this is a call from a recipient to the connected user or `outgoing` when the call has been established by the connected user.

### Retrieving the call history

---

Once the SDK for Web has started, you can retrieve the log history of the connected user by using the API `rainbowSDK.calllog.getAll()`.

This operation is not synchronous so to be sure that all the history has been received, you need to listen to the event `rainbow_oncalllogupdated`.

Here is an example for retrieving the call history when started:

```js

rainbowSDK.events.on("rainbow_oncalllogupdated", (calllogs) => {
    logger.log("debug", "(rainbow_oncalllogupdated) - rainbow event received. ");
    if (calllogs) {
        if (calllogs.callLogs) {
            logger.log("debug", "(rainbow_oncalllogupdated) - calllogs.callLogs.length : ", calllogs.callLogs.length);
            calllogs.orderByDateCallLogs.forEach((callL) => {
                logger.log("debug", "(rainbow_oncalllogupdated) - one call logged in calllogs.orderByDateCallLogs : ", callL);
            });
        }
    }
    else {
        logger.log("error", "(rainbow_oncalllogupdated) - rainbow event received. empty calllogs", calllogs);
    }
});

```

The API `rainbowSDK.calllog.isInitialized()` can be used to check if the initial log history has been retrieved from Rainbow. A `true` value returned means that the whole call log has been retrieved from Rainbow.

### Listening to new call history entry

---

The same listener on `rainbow_oncalllogupdated` can be used to listen to new call log entry.

This new entry will be automatically added to the history. Calling the API

### Managing call history counter

---

Generally speaking, when a call is missed a new call log entry is added to the history with the property `read` equals to `false`.

So, when you need to know how many calls you missed, you can use the API `rainbowSDK.calllog.getMissedCallLogCounter()` such as in the following:

```js
let missedCallCounter = rainbowSDK.calllog.getMissedCallLogCounter();
```

The variable `missedCallCounter` will be a number that represents the number of missed calls.

And then, using the API `rainbowSDK.calllog.getAll()`, you will be able to retrieve these calls. In order to decrease this counter, you will have to mark these logs 'as read' (described in the next paragraph).

### Mark a call history entry as read

---

To mark as read an existing missed call entry, you need to call the API `rainbowSDK.calllog.markCallLogAsRead()`.

```js

rainbowSDK.events.on("rainbow_oncalllogackupdated", (calllogs) => {
    logger.log("debug", "(rainbow_oncalllogackupdated) - rainbow event received. ");
    if (calllogs) {
        if (calllogs.callLogs) {
            logger.log("debug", "(rainbow_oncalllogackupdated) - rainbow event received. calllogs.callLogs.length", calllogs.callLogs.length);
    //Do something when an acknowledgement has been done on the call history
        }
    }
});

let entry = rainbowSDK.calllog.getAll()[0];
rainbowSDK.calllog.markCallLogAsRead(entry.id);

```

Once this has been done, a new event `rainbow_oncalllogackupdated` is fired to inform that at least an acknowledgement has been done on the call history.

Calling the API `rainbowSDK.calllog.getAll()` will give you an update of the call history and the property `read` of the associated entry has changed to `true`.

By calling the API `rainbowSDK.calllog.getMissedCallLogCounter()`, you should have a smaller result.

Note: The API `rainbowSDK.calllog.markAllCallsLogsAsRead()` mark all missed call to read in one step.

### Deleting call history items

---

You can delete a call history item at any time by calling the API `rainbowSDK.calllog.deleteOneCallLog()`

```js

rainbowSDK.events.on("rainbow_oncalllogupdated", (calllogs) => {
    logger.log("debug", "(rainbow_oncalllogupdated) - rainbow event received. ");
    // Do something when the call history has been updated
    ...
});


let entry = rainbowSDK.calllog.getAll()[0];
rainbowSDK.calllog.deleteOneCallLog(entry.id);

```

Once the call log entry is removed, the event `RAINBOW_ONCALLLOGUPDATED` is fired and so you are notified when the action is done.

You can use the `rainbowSDK.calllog.deleteCallLogsForContact()` API to delete all call log entries associated to a contact or the `rainbowSDK.calllog.deleteAllCallLogs()` API to delete the entire call history.

### Limits

To consult the exact limits concerning Rainbow Web SDK, visit [this link](/doc/hub/features-limits)

---

_Last updated january, 6 2020_
