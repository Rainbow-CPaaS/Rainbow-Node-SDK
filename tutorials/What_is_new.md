## What's new

---

Welcome to the new release of the Rainbow SDK for Node.JS. There are a number of significant updates in this version that we hope you will like, some of the key highlights include:


### SDK for Node.JS 1.55 - April 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version. 
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add TelephonyService::deflectCall method to deflect a call to an other telephone number
-   Update TelephonyService doc.

### SDK for Node.JS 1.55 - April 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version. 
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Update ImsService::sendMessageToJidAnswer and XMPPService::sendChatMessage with a new parameter answeredMsg to allow to send a reply to a message
-   Update ImsService::sendMessageToBubbleJidAnswer and XMPPService::sendChatMessageToBubble with a new parameter answeredMsg to allow to send a reply to a message
-   Update conversationEventHandler to handle the conversation Events from server (create/update)
-   Add ConversationsService::getConversationByDbId method to retrieve a conversation from the dbid identifier.
-   fix ContactsService::getRosters to return the list of contacts
-   Refactor ChannelsService to return the real Channel type in API/Events
-   Refactor ChannelsService to use the return types
-   Add `ChannelsService::fetchChannelsByFilter` method retrieve a channel by filter
-   Add ContactsService::getConnectedUser method to get the connected user information
-   Add ChannelsService::updateChannelVisibility method to update a channel visibility (closed or company)
-   Add ChannelsService::updateChannelVisibilityToPublic method to update a channel visibility to company (visible for users in that company)
-   Add ChannelsService::updateChannelVisibilityToClosed method to update a channel visibility to closed (not visible by users)
-   Add ChannelsService::updateChannelTopic method to update the description of the channel to update (max-length=255)
-   Update AdminService::createUserInCompany to add the roles parameter when creating a user.
-   Rename the method `ChannelsService::createPrivateChannel()` to `ChannelsService::CreateClosedChannel`
-   Rename the method `ChannelsService::deleteMessageFromChannel()` to `ChannelsService::deleteItemFromChannel`
-   Rename the method `ChannelsService::getMessagesFromChannel()` to `ChannelsService::fetchChannelItems`
-   Rename the method `ChannelsService::removeUsersFromChannel1()` to `ChannelsService::deleteUsersFromChannel`
-   Rename the method `ChannelsService::removeAllUsersFromChannel()` to `ChannelsService::deleteAllUsersFromChannel`
-   Rename the method `ChannelsService::getUsersFromChannel()` to `ChannelsService::fetchChannelUsers`
-   Rename the method `ChannelsService::getChannelById()` to `ChannelsService::fetchChannel`
-   Rename the method `ChannelsService::publishMessageToChannel()` to `ChannelsService::createItem`
-   Fix wrong `INCOMMING` spelling to `INCOMING`, `incomming` to `incoming`, `Incomming` to `Incoming`   
-   Rename the method `ChannelsService::getAllOwnedChannel()` to `ChannelsService::getAllOwnedChannels`
-   Rename the method `ChannelsService::getAllSubscribedChannel()` to `ChannelsService::getAllSubscribedChannels`

**Others Changes**

-   Update comments limitations => limits
-   Explain isTyping in the "Chatting with Rainbow users" guide
-   Reduce log for the XMPP ping.


### SDK for Node.JS 1.54 - March 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version. 
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None.

**API Changes**

-   Remove the `data` property layer in result of `admin::createCompany` API method. Properties found before in `data` are a now in root object.
-   Fix `admin::removeUserFromCompany` ro return the deletion result.

**Others Changes**

-   Add CallLog service (typeScript sources) to get/delete the calllog history.
-   Update doc about options provided at building the SDK object for the logs.
-   Change the sources from javascript to typescript. But the delivery is still js.
-   Fix the `conflict` error on xmpp socket when two rainbow node sdk login at the same time.
-   Add `admin::createTokenOnBehalf` method to ask Rainbow a token on behalf a user. You need this user password.
-   Add `user/password` in the Proxy settings.
-   Add In `Call` object the member `deviceType`. It can be MAIN for the main device, and SECONDARY for the remote extension linked to it. It can be used when the event `rainbow_oncallupdated` is raised to seperate events.
-   Update `setBubbleCustomData` to wait for the bubble to be updated by the event `rainbow_bubblecustomDatachanged`, and else get the informations about bubble from server

### SDK for Node.JS 1.53 - March 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version. 
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None.

**API Changes**

-  

**Others Changes**

-   Add event `rainbow_onbubblepresencechanged` when a bubble presence change. It is also raised when a bubble change isActive from true to false (and reverse)
-   Add a method `until` in Utils to wait for a while to condition to be done.
-   Update errors return by HttpService, to have a json object.
-   Add the isActive propertie in `Bubble` object, and the method/events to update it. 
-   Improve the `bubble::createBubble` to wait for a while (5s) the success of creation on server side.
-   Update `im::sendMessageToBubbleJid` to take care of isActive value of the bubble. So if it is archived, then sendInitialPresence to wake it up, and wait for a while (5s) for the resumed event, before sending message in it.
-   Add the method `conversations::sendCorrectedChatMessage` to send a corrected message to a conversation. This method works for sending messages to a one-to-one conversation or to a bubble conversation.  
 ! Note ! : only the last sent message on the conversation can be changed. The connected user must be the sender of the original message.`
-   Add treatment of the replace last message event.
-   Add event `rainbow_onownbubbledeleted` when a bubble own bythe connected user is deleted.
-   Refactor improve of xmpp reconnection for the new xmpp lib 


### SDK for Node.JS 1.52 - February 2019

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   Add event fired when a channel is updated : rainbow_channelupdated

**Others Changes**

-   Improve the  XMPP reconnect process
-   Fix error in HttpService get method
-   Fix Messages list in conversation when SDK sent or received a message in it. Message is add to conversation when the server received it and send back a Receipt.
-   Fix error return when an HttpService put or post failed
-   Fix event listener life to avoid memoryleak
-   Fix lastMessageText when retrieve history.
-   Fix remove from in markAsReadMessage
-   Fix logs
-   Fix reconnection when network is lost or when the server reboot. 
-   Fix issue in HttpService when remote server is unavailable


### SDK for Node.JS 1.51 - January 2019

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   None.

**Others Changes**

-   Fix property conversation.lastMessageText which was undefined
-   Remove the unirest library (security issue)
-   Fix updateChannel topic value
-   Fix the start/stop of the SDK. These processes has been improved to avoid multiple `start()` at the same time, and also to have a better flow life.
-   Add event `rainbow_onpresencechanged` fired when the presence of the connected user changes.
-   Fix decode of status in xmpp event when presence changed is received.
  

### SDK for Node.JS 1.50 - December 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   In service **channels** the method `publishToChannel` has been updated to follow the new channel api on server side. Now it is possible to define the `type` of data published in a channel (could be `basic`, `markdown`, `html` or `data`).

**Others Changes**

-   NodeJS 8.x end of active LTS period has been announced to 2019-01-01. Starting January, 31th 2019, we will no more support development done with that version. We encourage you to migrate your development to the current active LTS version of NodeJS which is now the 10.x version.
-   Fix parsing of stanza event `message is deleted in a channel` when the number of messages limit is reached and then raises the event `rainbow_onchannelmessagedeletedreceived`.

### SDK for Node.JS 1.49 - November 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   None.

**Others Changes**

-   Refactor Events emitter to produce better logs in dev mode.
-   Correction of contact's `phonenumbers` filling. Now Contact `phoneNumbers` should be synchronised with individual splitted phones numbers.
-   Fix: Typo correction in Contacts `firstName` and `lastName` case
-   Fix: In service **channels**, correction of parsing of the result data from server in method `getMessagesFromChannel`
-   In service **channels**, add images property in messages retrieved from channels with method `getMessagesFromChannel` and also when event `rainbow_onchannelmessagereceived` is fired
-   In service **channels**, add a method to delete message in a channel `deleteMessageFromChannel`.
-   Add event `rainbow_onchannelmessagedeletedreceived` fired when a message is delete in a channel.

*   Add event `rainbow_onchannelcreated` fired when a channel is created.
*   Add event `rainbow_channeldeleted` fired when a channel is deleted.

### SDK for Node.JS 1.48 - October 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   In config parameter a log level at root level of logs in config : config.logs.level has been added for set the level of logs. Note: The value in file section will erase it, if the file logging is enabled.

**Others Changes**

-   In service **channels** the method `createItem` has been updated to allow post of files.
-   A correction of `stop` and `reconnection` processes has been done
-   Logs has been updated to follow the GPRD law and then hide private data.

### SDK for Node.JS 1.47 - October 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   In service **FileStorage**, new method `retrieveFileDescriptorsListPerOwner()` has been added to get the File descriptors owned by logged in user.
-   In service **FileStorage**, new method `downloadFile()` has been added to download a file from the server).
-   In service **FileStorage**, new method `getUserQuotaConsumption()` has been added to get the current file storage quota and consumption for the connected user.
-   In service **FileStorage**, new method `uploadFileToConversation()` has been added to upload a file and share it in a conversation.
-   In service **FileStorage**, new method `uploadFileToBubble()` has been added to upload a file and share it in a bubble.
-   In service **FileStorage**, new method `removeFile()` has been added to Remove an uploaded file.
-   In service **FileStorage**, new method `getFileDescriptorFromId()` has been added to get the file descriptor the user own by it's id.
-   In service **FileStorage**, new method `getFilesReceivedInConversation()` has been added to get the list of all files received in a conversation with a contact .
-   In service **FileStorage**, new method `getFilesReceivedInBubble()` has been added to get the list of all files received in a bubble.
-   In service **FileStorage**, new method `getFilesSentInConversation()` has been added to get the list of all files sent in a conversation with a contact.
-   In service **FileStorage**, new method `getFilesSentInBubble()` has been added to get the list of all files sent in a bubble.
-   In service **FileStorage**, new method `getAllFilesSent()` has been added to get the list of files (represented using an array of File Descriptor objects) created and owned by the connected which is the list of file sent to all of his conversations and bubbles.
-   In service **FileStorage**, new method `getAllFilesReceived()` has been added to get the list of files (represented using an array of File Descriptor objects) received by the connected user from all of his conversations and bubbles.
-   In service **Events** new files management event handler `rainbow_filecreated` from server when a file is uploaded
-   In service **Events** new files management event handler `rainbow_fileupdated` from server when the description of the file is updated
-   In service **Events** new files management event handler `rainbow_filedeleted` from server when the file is deleted
-   In service **Events** new files management event handler `rainbow_thumbnailcreated` from server when a thumbnail is created.

**Others Changes**

-   Fix FileStorage::orderByFilter method.
-   Support for typescript is added in sources, in folder ./src/. see README.md file to compil it. (It is only needed is you use the sources, and not if you use the version from npm registry )

### SDK for Node.JS 1.46 - September 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   In service **Conversations**, new method `getConversationByBubbleJid()` has been added to retrieve a conversation associated to a bubble using the JID information.

**Others Changes**

-   Fix : Token expiration
-   Fix : Conversations::getBubbleConversation

### SDK for Node.JS 1.45 - August 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   Change `Bubbles.getBubbleById()` API to Get a bubble by its ID in memory and if it is not found in server
    and then return a promise with The bubble {Bubble} found or null.
-   Change `Bubbles.getBubbleByJid()` API to Get a bubble by its JID in memory and if it is not found in server. It return a promise.

**Others Changes**

### SDK for Node.JS 1.44 - August 2018

---

**3-Release SDK Breaking Changes**

-   GPRD: Contacts fields loginEmail and roles have to be deprecated and removed from contact object. We are working with Legals and Architects, in order to offers the best appropriate alternative.

-   Due to data privacy improvements and compliances, Rainbow platform will introduce breaking changes in the way data associated to users are located around the world in one hand and the way users connect to the platform in other hand. Consequently, any SDK for Node.JS prior to version 1.44 are entered deprecation period and will no more work once Rainbow platform 1.47 will be deployed on production (starting Sept, 30th)”. Before Sept’30, your application has to migrate to SDK for Node.JS version 1.44 at least in order for your application to continue to work after this date.

**API Breaking Changes**

-   None.

**API Changes**

-   None

**Others Changes**

### SDK for Node.JS 1.43 - July 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   None

**Others Changes**

-   Logs printed to the console are now displayed in white color only. To activate colors, you have to manually add the parameter `color: true` to the `logs` section of your configuration parameter.

-   In order to save free disk space, logs files can be archived by adding the parameter `zippedArchive: true` to the `file` section of your configuration parameter. Adding parameters `maxSize: '10m'` and `maxFiles: 10` allow to limit disk usage used. See guide [Debugging](/#/documentation/doc/sdk/node/guides/Debugging) to have more information on how to configure these parametes.

-   Enhance authentication and reconnection mechanisms to set the `connected` state only when Rainbow connection is fully established.

### SDK for Node.JS 1.42 - June 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   Add Telephony API (alpha)
-   Add Chatstate events support (reception)

**Others Changes**

-   Fix user joining twice
-   Fix Bubble change notification

### SDK for Node.JS 1.41 - June 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   Starting version 1.41, api `Contact.getAll()` returns now all contacts who where in conversation since the SDK starts (cache),
    contacts may not up to date if not in user roster.

**API Changes**

-   Add contact avatar property
-   Api `Contact.getRosters()` has been added to retrieve the fixed list contacts who are in the network of the connected user.
-   Api `Contacts.joinContacts()` has been added to join together, by an admin, contacts from the same or several companies but manageable by the admin.

**Others Changes**

-   Fix contacts refresh on contact profile update
-   Fix issue on Log files name
-   Fix race condition on bubble deletion

### SDK for Node.JS 1.40 - May 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   APIs `sendMessageToConversation()`, `sendMessageToContact()`, `sendMessageToJid()`, `sendMessageToBubble()` and `sendMessageToBubbleJid()` have been changed to Promise based methods in order to give the hand to the application only once the action has really been done.
-   Improvement in Promise treatment and error handling - Explicit documentation on Promises

**API Changes**

-   None.

**Others Changes**

-   None.

### SDK for Node.JS 1.39 - April 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   New Conversations API (beta), allow to retrieve all conversations messages.
-   Promote to moderator or downgrade a user in bubbles
-   Allow to change change bubble owner

**Others Changes**

-   Fix issue in cheets documentation where public properties where missing from the NodeSDK class.

-   Default guest TTL (time to live) has been set to `172800s` (48 hours) if not provied when creating an account.

### SDK for Node.JS 1.38 - March 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   New API `createCompany()` has been added in Admin API to create a new company.

**Others Changes**

-   Fix issue with token survey that blocks the process in CLI mode.

-   Fix issue with text messages that were not sent in UTF-8. This allows now to send Emoji to users.

-   Fix issue with the 'lang' of an IM that were sometimes undefined.

### SDK for Node.JS 1.37 - March 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   None.

**API Changes**

-   Parameter `companyId` from API `createUserInCompany()` is now optional. When not set, the user is created in the company the administrator belongs.

**Others Changes**

-   Fix issue when retrieving the list of channels.

-   Implements the new application authentication method allowing applications to be identified.

### SDK for Node.JS 1.36 - February 2018

---

**3-Release SDK Breaking Changes**

-   None.

**API Breaking Changes**

-   Due to optimizations added on the service Channels, the **Rainbow SDK Node.JS 1.35 and prior will not be able to manage channels anymore starting Rainbow 1.36**. You need to update to this version to use this service. Note: Channels APIs are still in _beta_, the deprecation policy doesn't apply here.

-   To increase the scalability of the Channels API, the server will no more return the list of participants when retrieving information on a channel. Channel's property `users` has been replaced by `users_count` which contains the number of users of the channel. Existing API `fetchChannelUsers()` has to be used to retrieve the list of users in a channel.

-   In order to have an homogeneous way of working, the following API `getContactByLoginEmail()`, `getContactById()`, `getContactsByJid()` now return the contact found directly and `null` if not found. API `getContactByLoginEmail()` will no more return a JavaScript `Array` object when the contact was not found locally. API `getContactById()`, `getContactsByJid()` will no more return an error (catch) when the contact is not found.

**API Changes**

-   New API `getMessagesFromChannel()` has been added to retrieve all available messages from a channel.

-   Number of messages archived for a channel has changed from **30** to **100**.

-   New API `sendMessageToContact()` and `sendMessageToBubble()` have been added to send message by passing the `contact` object instance or the `bubble` object instance.

**Others Changes**

-   A fix has been done to close properly the XMPP connection when calling the method `stop()` from the SDK.

-   API documentation for `connectedUser` property has been fixed.

-   Avoid crash when calling API `signout()` when not logged-in.

-   Avoid crash when evaluating XMPP connection error.

-   Avoid crash on network lost and try to reconnect. Application needs to listen the event `rainbow_onerror`. This event is triggered when the SDK fails to reconnect automatically. In that case, the application has to manually call the API `stop()` and `start()` to be able to try to reconnect to the SDK.

-   When trying to reconnect to Rainbow REST APIs, the SDK for Node.JS will now made up to **50** attempts instead of 30 and the max time between 2 attempts has been set to **60s** as for the XMPP part.

-   Fix a crash when retrieving the list of bubbles.

### SDK for Node.JS 1.35 - January 2018

---

**SDK**

-   The new method `updateGroupName(group, name)` has been added which allows to change the name of a group.

**Bugs**

-   Replaced the `Jid` by the `Jid/resource` when sending a P2P message to avoid crash when connected twice with the same account.

-   Fix typo in guide [Managing Contacts](/#/documentation/doc/sdk/node/guides/Managing_contacts) with API `getContactByLoginEmail()` that returns an array and not the contact directly. API documentation has been updated too.

-   Update FOSS `ws` in order to avoid a DOS attack and FOSS `request` to be aligned with the latest available version.

-   Add better explanation in guides [Getting started](/#/documentation/doc/sdk/node/guides/Getting_Started) and [Connecting to Rainbow](/#/documentation/doc/sdk/node/guides/Connecting_to_Rainbow) on configuration parameters.

-   Describe APIs `sendMessageToJid()` and `sendMessageToBubbleJid()` on how to send messages in guide [Answering chat messages](/#/documentation/doc/sdk/node/guides/Answering_chat_message).

### SDK for Node.JS 1.34 - December 2017

---

**SDK**

-   An enhancement has been done to avoid `ghost` bot. The Node.JS SDK is automatically restarted if there is no message (stanza) received from the server during 70 secondes and after a ping request sent to rainbow that has not been answered within 5 secondes.

-   The Node.JS SDK now manages requests with a content-type equals to `text/csv` in order send and receive CSV content.

**Bugs**

-   Some minor typos corrections have been done on the guide [Managing Contacts](/#/documentation/doc/sdk/node/guides/Managing_contacts).

-   A fix has been done on the token renewal mechanism to manage the new token duration and renew process.

### SDK for Node.JS 1.33 - December 2017

---

**SDK**

-   New service `Channels` to send messages to a large number of users.

-   New guide [Managing Channels](/#/documentation/doc/sdk/node/guides/Managing_channels) has been added to explain how to create channels and publish messages.

**API**

-   New method `createPrivateChannel()`, `addMembersToChannel()`, `addPublishersToChannel()`, `addOwnersToChannel()`, `deleteUsersFromChannel()`, `deleteAllUsersFromChannel()` and `fetchChannelUsers()` have been added to manage private channels.

-   New method `createPublicChannel()`, `findChannelsByName()`, `findChannelsByTopic()` `subscribeToChannel()` and `unsubscribeFromChannel()` have been added to manage public channels.

-   New method ``updateChannelDescription()`,`deleteChannel()`and`createItem()` have been added to manage both private and public channels.

**BUGS**

-   Fix issue with password generation for guest account.

-   Fis some issues in the documentation

-   Fix issue with application token renewal

-   Fix issue with connection issue with new Rainbow 1.33 version (token check issue)

-   Fix issue when removing from a room

### SDK for Node.JS 1.32 - November 2017

---

**SDK**

-   New service `Groups` to organize contacts has been added.

-   New guide [Managing Groups](/#/documentation/doc/sdk/node/guides/Managing_groups) has been added to explain how to have create groups and add users in.

-   Updating guide [Answering Chat Messages](/#/documentation/doc/sdk/node/guides/Answering_chat_message) to list the Markdown tags unofficially supported by the Rainbow Web client.

**API**

-   New methods `createGroup()`, `getAll()`, `getFavoriteGroups()`, `getGroupByName()`, `getGroupById()` and `deleteGroup()` have been added to manage groups.

-   New methods `addUserInGroup()` and `removeUserFromGroup()` have been added to manage a users in a group.

-   New events `rainbow_ongroupcreated`, `rainbow_ongroupdeleted`, `rainbow_ongroupupdated`, `rainbow_onuseraddedingroup` and `rainbow_onuserremovedfromgroup` have been added for listening to changes on groups.

**BUGS**

-   Fix issue with manual presence not dispatched to other connected ressources

-   Fix issue with offline resources that are not removed (memory leak)

-   Fix documentation issues for models `Bubble`, `Contact`, `Message` and `Settings`.

### SDK for Node.JS 1.31 - October 2017

---

**SDK**

-   Date and timestamp have been added to console and file loggers.

-   New tutorial [Managing Contacts](/#/documentation/doc/sdk/node/guides/Managing_contacts) has been added to explain how to have retrieve the user's network or find for Rainbow contacts.

-   Guide [Answering to Chat Messages](/#/documentation/doc/sdk/node/guides/Answering_chat_message) has been updated to explain the specific messages that can be received by members when the affiliation of a specific member changes.

**API**

-   New events `rainbow_onbubblenamechanged`, `rainbow_onbubbletopicchanged` and `rainbow_onbubblecustomdatachanged` have been added for listening when the name, the topic or the custom data of a bubble has changed.

-   New method `createAnonymousGuestUser()` has been added to create guest users without identification (no name, firstname and language to specify).

-   New property `connectedUser` has been added to access to the user account information.

-   Methods `sendMessageToJid()` and `sendMessageToBubbleJid()` now return an error if the number of characters of the message is greater than 1024.

**BUGS**

-   Crash after token expiration has been fixed in order to be able to reconnect automatically

-   `signinCLI()` method now waits for the internal Promise based function to resolve

-   Fix issue when re-inviting a user who has declined a bubble invitation

### SDK for Node.JS 1.30 - September 2017

---

**SDK**

-   New tutorial has been added to explain how to manage Bubbles: [Managing Bubbles](/#/documentation/doc/sdk/node/guides/Managing_bubble)

**API**

-   New methods `getAllActiveBubbles()` and `getAllClosedBubbles()` have been added to get the list of bubbles that are active and closed.

-   [Compatibility Break] Method `deleteBubble()` now returns the bubble deleted instead of the `ErrorManager.OK` Object.

**BUGS**

-   Remove limit of the `getAll()` Bubbles that was fixed to 100. Now this API retrieves all bubbles of the connected user.

-   Avoid to send two times the initial presence when accepting an invitation to join the Bubble.

-   Fix the resource used for the connected user.

-   Fix issue when connecting in CLI mode.

### SDK for Node.JS 1.29 - August 2017

---

**SDK**

-   Provisioning and managing users can now be done using the SDK for Node.JS.

-   Data models used by the SDK (Contact, Bubble and Message) as well as events parameters have been documented.

-   New tutorials have been added to explain some of key concepts: [Answering chat messages](/#/documentation/doc/sdk/node/guides/Answering_chat_message), [Debugging](/#/documentation/doc/sdk/node/guides/Debugging) and [Managing Proxy](/#/documentation/doc/sdk/node/guides/Proxy)

-   New tutorials has been added to explain how to manage and create users and guests: [Managing Users and Guests](/#/documentation/doc/sdk/node/guides/Managing_users)

-   The number of log files is now limited to 10 files (one file per day) then the oldest one is overwritten.

**API**

-   New methods `createUserInCompany()`, `createGuestUser()`,`inviteUserInCompany()`, `changePasswordForUser()`, `updateInformationForUser()` and `deleteUser()` have been added for managing users.

-   New methods `setBubbleCustomData()` has been added to Bubble service to add, modify and delete custom data to bubble, `setBubbleTopic()` has been added to Bubble service to modify the Bubble's topic, `setBubbleName()` has been added to Bubble service to modify the Bubble's name.

-   [Changes] Methods `getContactByLoginEmail()` now search contacts on server side if not found locally

**BUGS**

-   In CLI mode, all methods return an error code in case of issue.

-   Receipt no more sent on specific bubble messages (admin messages)

-   Unable to connect the Websocket behind a proxy

-   Fix crash when no application ID is provided

### SDK for Node.JS 1.28 - July 2017

---

**SDK**

-   Starting version 1.28.0, the SDK for Node.JS is able to reconnect automatically after each Rainbow update. When the SDK for Node.JS is disconnected from Rainbow, it tries to reconnect several times and once succeeded continues to work as before.

-   The SDK for Node.Js now distinguishes carbon-copy (cc) messages that have been sent by other connected resources.

-   Version of the SDK for Node.JS, version of Node.JS and version from other Node.JS components have been added to the log file to help debugging Node.JS application.

-   New tutorial [`Connecting to Rainbow`](/#/documentation/doc/sdk/node/guides/Connecting_to_Rainbow) has been written to help understanding the SDK for Node.JS lifecycle.

**API**

-   New property `version` has been added to retrieve the SDK Node.JS version.

-   New property `state`has been added to retrieve the SDK Node.JS current state.

-   New method `stop()` has been added to be able to stop and deconnect the SDK from Rainbow.

-   New parameters `cc` and `cctype` have been added to event `rainbow_onmessagereceived` to distinguish carbon copy messages sent and received in one-to-one conversation.

-   New parameter 'lang' has been added to API `sendMessageToJid()` and to API `sendMessageToBubbleJid()` to specify the language used of the message. This parameter is optional and by default is `en`.

-   New parameter `content` has been added to API `sendMessageToJid()` and API `sendMessageToBubbleJid()` to send a message in an additional content type (default is Markdown). This parameter is optional.

-   New parameter `subject` has been added to API `sendMessageToJid()` and API `sendMessageToBubbleJid()` in order to send a header associated to the message. For information, this subject is displayed by the Rainbow client in notifications. This parameter is optional.

**BUGS**

-   A fix has been added to be able to listen to messages received in bubble just after the bubble has been created.

-   A fix has been added to avoid crashing when receiving not managed XMPP messages.

### SDK for Node.JS 1.27.0 - June 2017

---

**SDK**

-   The SDK for Node.JS now accepts application key and secret for authenticating on Rainbow. Until September, applications without key and secret can continue to connect to Rainbow.

-   First SDK for Node.JS ESR (extended support release) version 1.27.0 is available.

-   SDK for Node.JS now manages the language of messages

**API**

-   New methods `acceptInvitationToJoinBubble()`, `declineInvitationToJoinBubble()` have been added to answer a request to join a bubble

-   New event `rainbow_onbubbleinvitationreceived` has been added for handling invitation to join a bubble

-   New event `rainbow_onbubbleownaffiliationchanged`has been added for handling user connected affiliation changes in a bubble

-   [Compatibility Break] Methods `getContactById()` is now a Promise based function: If contact is not found locally (ie: user's network), a request is sent to the server to retrieve the contact. Depending on privacy, only partial information can be returned instead of full information.

### SDK for Node.JS 0.10.18

---

**SDK**

-   No changes

**API**

-   Only bug fixing

### SDK for Node.JS 0.10.14

---

**SDK**

-   No changes

**API**

-   [Compatibility Break] API `getContactByJid()` taken into account privacy concerns - Internal change

-   Add parameter boolWithHistory in API `createBubble()` to offer or not full history for newcomers

### SDK for Node.JS 0.10.13

---

**SDK**

**API**

-   [Compatibility Break] Methods `getContactByJid()` and `getContactByLoginEmail()` are now Promise based functions.
