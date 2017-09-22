## What's new
---

Welcome to the new release of the Rainbow SDK for Node.JS. There are a number of significant updates in this version that we hope you will like, some of the key highlights include:


### SDK for Node.JS 1.30 - September 2017
---

**SDK**

- New tutorial has been added to explain how to manage Bubbles: [Managing Bubbles](/#/documentation/doc/node/tutorials/Managing_bubble)


**API**

- New methods `getAllActiveBubbles()` and `getAllClosedBubbles()` have been added to get the list of bubbles that are active and closed.

- [Compatibility Break] Method `deleteBubble()` now returns the bubble deleted instead of the `Error.OK` Object.


**BUGS**

- Remove limitation of the `getAll()` Bubbles that was fixed to 100. Now this API retrieves all bubbles of the connected user.

- Avoid to send two times the initial presence when accepting an invitation to join the Bubble. 

- Fix the resource used for the connected user.


### SDK for Node.JS 1.29 - August 2017
---

**SDK**

- Provisionning and managing users can now be done using the SDK for Node.JS.

- Data models used by the SDK (Contact, Bubble and Message) as well as events parameters have been documented.

- New tutorials have been added to explain some of key concepts: [Answering chat messages](/#/documentation/doc/node/tutorials/Answering_chat_message), [Debugging](/#/documentation/doc/node/tutorials/Debugging) and [Managing Proxy](/#/documentation/doc/node/tutorials/Proxy)

- New tutorials has been added to explain how to manage and create users and guests: [Managing Users and Guests](/#/documentation/doc/node/tutorials/Managing_users)

- The number of log files is now limited to 10 files (one file per day) then the oldest one is overwritten.


**API**

- New methods `createUserInCompany()`, `createGuestUser()`,`inviteUserInCompany()`, `changePasswordForUser()`, `updateInformationForUser()` and `deleteUser()` have been added for managing users.

- New methods `setBubbleCustomData()` has been added to Bubble service to add, modify and delete custom data to bubble, `setBubbleTopic()` has been added to Bubble service to modify the Bubble's topic, `setBubbleName()` has been added to Bubble service to modify the Bubble's name.

- [Changes] Methods `getContactByLoginEmail()` now search contacts on server side if not found locally


**BUGS**

- In CLI mode, all methods return an error code in case of issue.

- Receipt no more sent on specific bubble messages (admin messages)

- Unable to connect the Websocket behind a proxy

- Fix crash when no application ID is provided


### SDK for Node.JS 1.28 - July 2017
---

**SDK**

- Starting version 1.28.0, the SDK for Node.JS is able to reconnect automatically after each Rainbow update. When the SDK for Node.JS is disconnected from Rainbow, it tries to reconnect several times and once succeeded continues to work as before.

- The SDK for Node.Js now distinguishes carbon-copy (cc) messages that have been sent by other connected resources.

- Version of the SDK for Node.JS, version of Node.JS and version from other Node.JS components have been added to the log file to help debugging Node.JS application.

- New tutorial [`Connecting to Rainbow`](/#/documentation/doc/node/tutorials/Connecting_to_Rainbow) has been written to help understanding the SDK for Node.JS lifecycle.


**API**

- New property `version` has been added to retrieve the SDK Node.JS version.

- New property `state`has been added to retrieve the SDK Node.JS current state.

- New method `stop()` has been added to be able to stop and deconnect the SDK from Rainbow.

- New parameters `cc` and `cctype` have been added to event `rainbow_onmessagereceived` to distinguish carbon copy messages sent and received in one-to-one conversation.

- New parameter 'lang' has been added to API `sendMessageToJid()` and to API `sendMessageToBubbleJid()` to specify the language used of the message. This parameter is optional and by default is `en`.

- New parameter `content` has been added to API `sendMessageToJid()` and API `sendMessageToBubbleJid()` to send a message in an additional content type (default is Markdown). This parameter is optional.

- New parameter `subject` has been added to API `sendMessageToJid()` and API `sendMessageToBubbleJid()` in order to send a header associated to the message. For information, this subject is displayed by the Rainbow client in notifications. This parameter is optional.


**BUGS**

- A fix has been added to be able to listen to messages received in bubble just after the bubble has been created.

- A fix has been added to avoid crashing when receiving not managed XMPP messages.


### SDK for Node.JS 1.27.0 - June 2017
---

**SDK**

- The SDK for Node.JS now accepts application key and secret for authenticating on Rainbow. Until September, applications without key and secret can continue to connect to Rainbow.

- First SDK for Node.JS ESR (extended support release) version 1.27.0 is available.

- SDK for Node.JS now manages the language of messages

**API**

 - New methods `acceptInvitationToJoinBubble()`, `declineInvitationToJoinBubble()` have been added to answer a request to join a bubble

 - New event `rainbow_onbubbleinvitationreceived` has been added for handling invitation to join a bubble

 - New event `rainbow_onbubbleownaffiliationchanged`has been added for handling user connected affiliation changes in a bubble

 - [Compatibility Break] Methods `getContactById()` is now a Promise based function: If contact is not found locally (ie: user's network), a request is sent to the server to retrieve the contact. Depending on privacy, only partial information can be returned instead of full information.


### SDK for Node.JS 0.10.18
---

**SDK**

- No changes

**API**

- Only bug fixing


### SDK for Node.JS 0.10.14
---

**SDK**

- No changes

**API**

- [Compatibility Break] API `getContactByJid()` taken into account privacy concerns - Internal change

- Add parameter boolWithHistory in API `createBubble()` to offer or not full history for newcomers


### SDK for Node.JS 0.10.13
---

**SDK**

**API**

 - [Compatibility Break] Methods `getContactByJid()` and `getContactByLoginEmail()` are now Promise based functions.

 