## What's new
---

### SDK for Node.JS 1.28 (July 2017)

---

Welcome to the new release of the Rainbow SDK for Node.JS. There are a number of significant updates in this version that we hope you will like, some of the key highlights include:

**SDK**

- Starting version 1.28.0, the SDK for Node.JS is able to reconnect automatically after each Rainbow update. When the SDK for Node.JS is deconnected from Rainbow, it will try to reconnect several times and once succeeded will continue to work normally.

- The SDK for Node.Js now distinguishes Carbon Copy (cc) Message that has been sent by an other connected resource.

- SDK for Node.JS version, Node.JS version and some others Node.JS components version have been added to the log file to help debugging Node.JS application.

- New tutorial `Connecting to Rainbow` has been written to help understanding the SDK for Node.JS lifecycle.


**API**

- New method `stop()` has been added to be able to stop and deconnect the SDK from Rainbow.

- New property `version` has been added to retrieve the SDK Node.JS version.

- New property `state`has been added to retrieve the SDK Node.JS current state.

- A fix has been added to be able to listen to messages received in bubble just after the bubble has been created.

- A fix has been added to avoid crash when receiving unknown message (XMPP).

- New parameters `cc` and `cctype` have been added to event `rainbow_onmessagereceived` to distinguish carbon copy messages sent and received in one-to-one conversation.

- New parameter 'lang' has been added to API `sendMessageToJid()` and to API `sendMessageToBubbleJid()` to specify the language used of the message. This parameter is optional and by default is `en`.

- New parameter `content` has been added to API `sendMessageToJid()` and API `sendMessageToBubbleJid()` to send a content in an additional format (default is Markdown). This parameter is optional.

- New parameter `subject` has been added to API `sendMessageToJid()` and API `sendMessageToBubbleJid()` in order to send a header associated to the message. For information, this subject is displayed by the Rainbow client in notifications.


### Previous versions

---

Here is the complete list of notable changes for the previous releases of the SDK for Node.JS


#### v1.27.0


**SDK**

- The SDK for Node.JS now accepts application key and secret for authenticating on Rainbow. Until September, applications without key and secret can continue to connect to Rainbow.

- First SDK for Node.JS ESR (extended support release) version 1.27.0 is available.

- SDK for Node.JS now manages the language of messages

**API**

 - New methods `acceptInvitationToJoinBubble()`, `declineInvitationToJoinBubble()` have been added to answer a request to join a bubble

 - New event `rainbow_onbubbleinvitationreceived` has been added for handling invitation to join a bubble

 - New event `rainbow_onbubbleownaffiliationchanged`has been added for handling user connected affiliation changes in a bubble

 - [Compatibility Break] Methods `getContactById()` is now a Promise based function: If contact is not found locally (ie: user's network), a request is sent to the server to retrieve the contact. Depending on privacy, only partial information can be returned instead of full information.


#### v0.10.18

---

**SDK**

- No changes

**API**

- Only bug fixing


#### v0.10.14

---

**SDK**

- No changes

**API**

- [Compatibility Break] API `getContactByJid()` taken into account privacy concerns - Internal change

- Add parameter boolWithHistory in API `createBubble()` to offer or not full history for newcomers


#### v0.10.13

---

**SDK**

**API**

 - [Compatibility Break] Methods `getContactByJid()` and `getContactByLoginEmail()` are now Promise based functions.

 
 