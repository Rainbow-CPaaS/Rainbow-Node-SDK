# CHANGELOG SDK for Node.JS

---

Here is the list of the changes and features provided by the **Rainbow-Node-SDK**

All notable changes to Rainbow-Node-SDK will be documented in this file.

## [1.62.0] - 2018-09-xx
-   Update

## [1.61.0] - 2018-09-18
-   Update the logs to remove all people data.
-   CRRAINB-7686 : Fix code for the 'read' receipt sent automatically to the sender when the message is received.
-   Add the ability to start services one by one. To avoid the calls to unnecessary pay API on server.
-   Add event `rainbow_onconferenced` fired when a conference event is received.
    

## [1.60.0] - 2018-08-28
-   Add method getStatusForUser in Bubble class to get the status of a user in the bubble
-   Update the "leaveBubble" method to unsubscribe form a bubble if not already unsubscribed the connected user. Else delete it from bubble.
-   Fix file url in XMPPService::sendChatExistingFSMessage and XMPPService::sendChatExistingFSMessageToBubble methods
-   Add method BubblesService::getStatusForConnectedUserInBubble to Get the status of the connected user in a bubble
-   Fix ImsService::getMessageFromBubbleById method
-   Add shortFileDescriptor property in message return by ImsService::getMessageFromBubbleById method

## [1.59.0] - 2018-08-12
-   Add in AdminService the method to get all users for a given admin
-   Update method BubblesService::unsubscribeContactFromBubble to send an event when the request to unsubscribe a user from a bubble succeed at end of the microservice call. Because sometimes the xmpp server does not send us the resulting event. So this event change will be sent twice time.
-   Add options::im::sendMessageToConnectedUser option to allow SDK to send a message to it self.
-   Add logs when an error occurred in XmppClient::send.

## [1.58.0] - 2018-07-10
-   Fix : event presence rainbow_oncontactpresencechanged when a contact in the roster is on phone.
-   Fix : put the SDK to STOPPED state if "rainbow_xmppdisconnect" arrive and the reconnection is disabled.
-   CRRAINB-6601 : Fix : Allows to make a second 3PCC RCC if the second call is allowed in profile.
-   Add internals telephony events raised outside the SDK to allow Afterbuild receveid multiple events : "evt_internal_callupdated_***". Must not be used outside Afterbuild context. Note it is available only when internal traces are enabled.
-   Add Call::updateCall method used to update a Call from data object.
-   Add Call::CallFactory method used to create a Call from data object.
-   Add properties Call::deviceType, Call::deviceState, Call::cause, Call::jid, Call::Call.
-   Add correlatorData when makecall (TelephonyService::makeCall, TelephonyService::makeConsultationCall).
-   Fix getForwardStatus. Update of the URL to get it on server.
-   Add TelephonyService::getActiveCalls to retrieve active Call.
-   CRRAINB-6773: Update TelephonyService::getCalls method to return all the Calls.
-   Add TelephonyService::getCallsSize method to get calls tab size. Warning do not use length on the getCalls method result because it is the last index id +1.
-   Add TelephonyService::getTabSize method to get the tab size given in parameter. So, use of the getTabSize method to avoid errors on Array length.
-   Keep the delete of released Call in the releaseCall method because the server do not raise the end call event on one participant of an OXE conference.index.
-   Treat the Calls array cache in TelephonyService with the event received from server instead of doing the treatment when an API method is called.
-   Add TelephonyService::getCallFromCache method to get a call from Calls array cache
-   Add TelephonyService::addOrUpdateCallToCache method to add or update a call in the Calls array cache
-   Add TelephonyService::removeCallFromCache method to remove a call from the Calls array cache
-   CRRAINB-6600 : Add treatment of the initiated event in telephonyEventHandler to raise a dialing event.
-   CRRAINB-6600  : Add treatment of the conference event in telephonyEventHandler.
-   Update telephonyEventHandler::getCall to parse more data from XMPP telephony event.
-   Add Favorites service (fetchAllFavorites, createFavorite, deleteFavorite)
-   Add Favorites events (rainbow_onfavoritecreated, rainbow_onfavoritedeleted)
-   Add Favorites doc
-   Add conversations::deleteMessage to delete a message by sending an empty string in a correctedMessage
-   Update in fileStorage::uploadFileToConversation method to upload a file by an simple file path in file parameter or by the object description of the file (previous existing behavior).
-   Add shortFileDescriptor in message when ImsService::getMessageFromConversationById

## [1.57.0] - 2018-06-18
-   RQRAINB-1550 : Add AdminService::getContactInfos method to retrieve informations about a user (need to be loggued in as a admin) 
-   RQRAINB-1550 : Add userInfo1 and userInfo2 value in Contact but it can only be filled for the current user himself and AdminService::getContactInfos methods
-   RQRAINB-1550 : Add AdminService::updateContactInfos :  Set informations about a user (userInfo1, userInfo2, ...).
-   RQRAINB-1585 : Fix use of ErrorManager index.js
-   Update package.json "moment-duration-format": "^2.2.2" and npm audit fix    
-   RQRAINB-1627 : Update to latest typescript engine
-   Rename event `rainbow_onownbubbledeleted` to `rainbow_onbubbledeleted` when a bubble is deleted.
-   Add options::im::messageMaxLength option to define the max size of the messages sent.
 
## [1.56.0] - 2018-05-28
-   Add TelephonyService::deflectCall method to deflect a call to an other telephone number  
-   Update TelephonyService doc.  
-   Move channel events from conversationEventHandler to channelEventHandler.   
-   Fix XMPPService::sendChatExistingFSMessageToBubble with the right from value.   
-   Refactor the channel's events to follow the event received from server :   
-    - replace events `rainbow_channelcreated`,`rainbow_channeldeleted` by `rainbow_channelupdated` with a `kind` parameter (with also a `label`)    
-    - Add event `rainbow_channelusersubscription` with a `kind` parameter (with also a `label`)  
-   Add event emitter in HttpService to raise event when token fail  
-   Fix json parse in HttpService, and treat token expiration  
-   Add mime-types lib to find file type.  
-   Update Bubble Class to have a factory  
-   Update Channel Class to have a factory  
-   Fix issue RESTService::unsubscribeToChannel method  
-   Add uploadChannelAvatar  deleteChannelAvatar methods to manbage the avatar of a channel.  
-   Add treatment of "channel-subscription" event  
-   Refactor BubblesService with a method addOrUpdateBubbleToCache to have bubble in cache.  
-   Add method ChannelsService::subscribeToChannelById to Subscribe to a channel using its id  
-   Add method ChannelsService::updateChannel to Update a channel  
-   Fix new conversation in a Bubble event   
-   Add calllog API doc  
-   Refactor BubblesService::deleteBubble to not close the Bubble before the delete  
-   Add a BubblesService::closeAndDeleteBubble method to close and delete a Bubble (Previous behaviour of deleteBubble).  
-   Add guestMode property in Contact class : Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration.
-   Add openInviteId property in Contact class : The open invite ID of the user.

## [1.55.0] - 2018-04-30
Update comments limitations => limits
Update ImsService::sendMessageToJidAnswer and XMPPService::sendChatMessage with a new parameter answeredMsg to allow to send a reply to a message
Update ImsService::sendMessageToBubbleJidAnswer and XMPPService::sendChatMessageToBubble with a new parameter answeredMsg to allow to send a reply to a message
Update conversationEventHandler to handle the conversation Events from server (create/update)
fix ContactsService::getRosters to return the list of contacts
Add ConversationsService::getConversationByDbId method to retrieve a conversation from the dbid identifier.
Explain isTyping in the "Chatting with Rainbow users" guide
Rename the method `ChannelsService::createPrivateChannel()` to `ChannelsService::CreateClosedChannel`
Rename the method `ChannelsService::deleteMessageFromChannel()` to `ChannelsService::deleteItemFromChannel`
Rename the method `ChannelsService::getMessagesFromChannel()` to `ChannelsService::fetchChannelItems`
Rename the method `ChannelsService::removeUsersFromChannel1()` to `ChannelsService::deleteUsersFromChannel`
Rename the method `ChannelsService::removeAllUsersFromChannel()` to `ChannelsService::deleteAllUsersFromChannel`
Rename the method `ChannelsService::getUsersFromChannel()` to `ChannelsService::fetchChannelUsers`
Rename the method `ChannelsService::getChannelById()` to `ChannelsService::fetchChannel`
Rename the method `ChannelsService::publishMessageToChannel()` to `ChannelsService::createItem`
Add `ChannelsService::fetchChannelsByFilter` method retrieve a channel by filter
Fix wrong `INCOMMING` spelling to `INCOMING`, `incomming` to `incoming`, `Incomming` to `Incoming`   
Rename the method `ChannelsService::getAllOwnedChannel()` to `ChannelsService::getAllOwnedChannels`
Rename the method `ChannelsService::getAllSubscribedChannel()` to `ChannelsService::getAllSubscribedChannels`
Refactor ChannelsService to return the real Channel type in API/Events
Refactor ChannelsService to use the return types
Add ContactsService::getConnectedUser method to get the connected user information
Add ChannelsService::updateChannelVisibility method to update a channel visibility (closed or company)
Add ChannelsService::updateChannelVisibilityToPublic method to update a channel visibility to company (visible for users in that company)
Add ChannelsService::updateChannelVisibilityToClosed method to update a channel visibility to closed (not visible by users)
Add ChannelsService::updateChannelTopic method to update the description of the channel to update (max-length=255)
Add ChannelsService::updateChannelName method to update a channel name
Update AdminService::createUserInCompany to add the roles parameter when creating a user.
Reduce log for the XMPP ping.


## [1.54.6] - 2018-04-09
Update doc
Fix of FileStorageService::retrieveAndStoreOneFileDescriptor
Add method ContactService::acceptInvitation Accept a an invitation from an other Rainbow user to mutually join the network
Add method ContactService::declineInvitation Decline an invitation from an other Rainbow user to mutually join the network
Update onFileManagementMessageReceived event with the file descriptor data
Fix some type issue find by typescript

## [1.54.2] - 2018-04-04
* Fix issue in GruntFile about doc generation.

## [1.54.1] - 2018-04-02
* add missing deep-egal lib.

## [1.54.0] - 2018-04-02
* Add CallLog service (typeScript sources) to `get/delete` the calllog history.
* Increase "Element" Behaviour for manipulate XML/XMPP objects in XmppClient 
* Update XMPPService to factorise the `NameSpaces`
* move `orderByFilter` from FileStorage to the common Utils module
* Update doc about options provided at building the SDK object for the logs
* Remove the `data` property layer in result of `admin::createCompany` API method. Properties found before in data are a now in root object.
* Fix `admin::removeUserFromCompany` ro return the deletion result.
* Change the sources from javascript to typescript.
* Fix the `conflict` error on xmpp socket when two rainbow node sdk login at the same time.
* Add `admin::createTokenOnBehalf` method to ask Rainbow a token on behalf a user. You need this user password.
* Add user/password in the Proxy settings.  
* Add In `Call` object the member `deviceType`. It can be MAIN for the main device, and SECONDARY for the remote extension linked to it. It can be used when the event `rainbow_oncallupdated` is raised to seperate events.  
* rename files service
* update `setBubbleCustomData` to wait for the bubble to be updated by the event `rainbow_bubblecustomDatachanged`, and else get the informations about bubble from server

## [1.51.0] - 2018-01-22
* Fix property conversation.lastMessageText which was undefined
* Remove the unirest library (security issue)
* Fix updateChannel topic value
* Fix the start/stop of the SDK. These processes has been improved to avoid multiple `start()` at the same time, and also to have a better flow life.
* Add event rainbow_onpresencechanged fired when the presence of the connected user changes.
* Fix decode of status in xmpp event when presence changed is received..

## [1.49.1] - 2018-12-07
* Update docs 
* Fix parsing of stanza event `message is deleted in a channel` when the number of messages limit is reached and then raises the event `rainbow_onchannelmessagedeletedreceived`.
* Update call to publishToChannel channel new api

## [1.49.0] - 2018-11-20
* Refactor Events emitter to produce better logs in dev mode.
* Correction of contact's phonenumbers filling. Now Contact.phoneNumbers should be synchronised with splitted datas. 
* Add images property in message retrieved from channels with method channels::getMessagesFromChannel and also when event "rainbow_onchannelmessagereceived" is fired
* Correction of parsing of the result data from server in method channels::getMessagesFromChannel
* Add a method to delete message in a channel channels::deleteMessageFromChannel. Note: there is probably an issue with the channelid of the message which is removed from event when a new message arrive in channel.
* Add event fired when a message is delete in a channel : rainbow_onchannelmessagedeletedreceived
* Add event fired when a channel is created : rainbow_onchannelcreated 
* Add event fired when a channel is deleted : rainbow_channeldeleted
* typo correction in Contacts firstName and lastName
 
## [1.48.0] - 2018-10-31
* Add ability to post files in channels.
* Correction of stop and reconnection
* Add log level at root level of logs in config : config.logs.level
* Add "system-dev" section in logs for DEVELOPPEMENT ONLY, no production system should use it :  
    "internals" for logs level of debug + unsensored data. Warning password and so on can be logs, it should only be used in dev environement !  
    "http" moved from logs sections, kept the same behaviour

## [1.47.7] - 2018-10-28
## [1.47.6] - 2018-10-28
* Add missing rules to compile typescript before publishing

## [1.47.5] - 2018-10-27
* Fix bad cleanup around the Stop() method

## [1.53.0] - 2018-03-11
* Add event `rainbow_onbubblepresencechanged` when a bubble presence change. It is also raised when a bubble change isActive from true to false (and reverse)
* Add a method `until` in Utils to wait for a while to condition to be done.
* Update errors return by HttpService, to have a json object.
* Add the isActive propertie in `Bubble` object, and the method/events to update it. 
* Improve the `bubble::createBubble` to wait for a while (5s) the success of creation on server side.
* Update `im::sendMessageToBubbleJid` to take care of isActive value of the bubble. So if it is archived, then sendInitialPresence to wkae it up, and wait for a while (5s) for the resumed event, before sending message in it.
* Add the method `conversations::sendCorrectedChatMessage` to send a corrected message to a conversation. This method works for sending messages to a one-to-one conversation or to a bubble conversation.  
 ! Note ! : only the last sent message on the conversation can be changed. The connected user must be the sender of the original message.`
* Add treatment of the replace last message event.
* Add event `rainbow_onownbubbledeleted` when a bubble own bythe connected user is deleted.
* Refactor improve of xmpp reconnection for the new xmpp lib 

## [1.52.0] - 2018-02-12

## [1.51.5] - 2018-02-08
* Improve the  XMPP reconnect process
* Fix error in HttpService get method

## [1.51.4] - 2018-02-07
* Fix Messages list in conversation when SDK sent or received a message in it. Message is add to conversation when the server received it and send back a Receipt.
* Fix error return when an HttpService put or post failed
* Fix event listener life to avoid memoryleak
* Fix lastMessageText when retrieve history.

## [1.51.3] - 2018-02-06
* Fix remove from in markAsReadMessage
* Fix logs

## [1.51.2] - 2018-01-30
* Fix reconnection when network is lost or when the server reboot. 

## [1.51.1] - 2018-01-24
* Add event fired when a channel is updated : rainbow_channelupdated
* Fix issue in HttpService when remote server is unavailable

## [1.51.0] - 2018-01-22
* Fix property conversation.lastMessageText which was undefined
* Remove the unirest library (security issue)
* Fix updateChannel topic value
* Fix the start/stop of the SDK. These processes has been improved to avoid multiple `start()` at the same time, and also to have a better flow life.
* Add event rainbow_onpresencechanged fired when the presence of the connected user changes.
* Fix decode of status in xmpp event when presence changed is received..

## [1.49.1] - 2018-12-07
* Update docs 
* Fix parsing of stanza event `message is deleted in a channel` when the number of messages limit is reached and then raises the event `rainbow_onchannelmessagedeletedreceived`.
* Update call to publishToChannel channel new api

## [1.49.0] - 2018-11-20
* Refactor Events emitter to produce better logs in dev mode.
* Correction of contact's phonenumbers filling. Now Contact.phoneNumbers should be synchronised with splitted datas. 
* Add images property in message retrieved from channels with method channels::getMessagesFromChannel and also when event "rainbow_onchannelmessagereceived" is fired
* Correction of parsing of the result data from server in method channels::getMessagesFromChannel
* Add a method to delete message in a channel channels::deleteMessageFromChannel. Note: there is probably an issue with the channelid of the message which is removed from event when a new message arrive in channel.
* Add event fired when a message is delete in a channel : rainbow_onchannelmessagedeletedreceived
* Add event fired when a channel is created : rainbow_onchannelcreated 
* Add event fired when a channel is deleted : rainbow_channeldeleted
* typo correction in Contacts firstName and lastName
 
## [1.48.0] - 2018-10-31
* Add ability to post files in channels.
* Correction of stop and reconnection
* Add log level at root level of logs in config : config.logs.level
* Add "system-dev" section in logs for DEVELOPPEMENT ONLY, no production system should use it :  
    "internals" for logs level of debug + unsensored data. Warning password and so on can be logs, it should only be used in dev environement !  
    "http" moved from logs sections, kept the same behaviour

## [1.47.7] - 2018-10-28
## [1.47.6] - 2018-10-28
* Add missing rules to compile typescript before publishing

## [1.47.5] - 2018-10-27
* Fix bad cleanup around the Stop() method

## [1.47.0] - 2018-10-10
* Add support for typescript sources in folder ./src/. see README.md in src folder to compil it.
* Add debug for http request (in config file set `http` field value to `true` in `logs` section).
* Add uploadFileToConversation to upload a file and share it in a conversation
* Add code for fileStorage::uploadFileToBubble to upload a file and share it in a bubble
* Refactor contact model to have initialized field
* Add file management event handler for Xmpp :  
  	rainbow_filecreated  
  	rainbow_fileupdated  
  	rainbow_filedeleted  
  	rainbow_thumbnailcreated  
* Refactor contacts to return the correct type "Contact" of data on few use cases in severals methods
* Add methods in FileStorage :  
  	removeFile();  
    getFileDescriptorFromId();  
    getFilesReceivedInConversation();  
    getFilesReceivedInBubble();  
  	getFilesSentInConversation();  
    getFilesSentInBubble();  
    getUserQuotaConsumption();  
    getAllFilesSent();  
    getAllFilesReceived()  
* Refactor the FileStorage::orderByFilter method to correct the behaviour. 

## [1.46.0] - 2018-09-07
* Add Conversations::getConversationByBubbleJid method
* Correction of Conversations::getBubbleConversation
* Restore token survey process.

## [1.45.1] - 2018-09-07
- Add Bulles::getAllBulles method witch call the getAll
- Add Bulles::deleteAllBubbles method to remove all methods own by user logged in.
- Add Bulles:getAllOwnedBubbles method to Get the list of bubbles created by the user
- Add "logs.customLabel" property in config file for customize the logs 
- Add "logs.file.customFileName" property in config file for customize the log file name.
- Correction of Conversation::getBubbleConversation() who use the updated Bubbles::getBubbleByJid method
- Add parameters to Admin::createCompany : country, state 
- Add methods to Switch the "is typing" state in a conversation : Conversations::sendIsTypingState, IM::sendIsTypingStateInBubble, IM::sendIsTypingStateInConversation
 
## [1.45.0] - 2018-08-28
- Correction of the telephony state when transfertcall succeed to allow a new call.
- Correction of conversations.getServerConversations() method which returned an empty result.
- Remove the check of isAdmin when api is called. It is the server who will check it.
- Refactor Bubbles::getBubbleById to Get a bubble by its ID in memory and if it is not found in server. And it now return a promise.
- Refactor Bubbles::getBubbleByJid to Get a bubble by its JID in memory and if it is not found in server. It return a promise.

## [1.44.0] - 2018-08-03
- Add 3-release SDK breaking changes notice.
- #CRRAINB-3176:Request created from: NodeJS SDK documentation
- Fix Regression on Contact id

## [1.43.4] - 2018-07-21
- Fix Rotary file logger

## [1.43.3] - 2018-07-19
- Add Application and multidomain management

## [1.43.2] - 2018-07-13
- Fix old node 6.x support

## [1.43.1] - 2018-07-12
- Update to winston logger library with correction of issues
- Improvement of the reconnection when the getRoster from serveur does not get an answer.
- Remove old application authentication
- Correction of Telephony (Still in Alpha)
- Correction of typo
- When send a message (im.sendxxx) parse the jid if it is a fullJid to keep the needed part.

## [1.42.3] - 2018-06-25
- Add Chatstate events support (reception)
- RESTService.js : add checkEveryPortals called from (checkPortalHealth) to wait a few time (10 seconds ) before check every portals, because somes of it respond before being xmpp ready.
- modify logs to enable/disable color and take winston parameter (zippedArchive, maxSize, maxFiles)

## [1.42.2] - 2018-06-21
- Fix Winston logger dependency : revert to winston 2.4.2

## [1.42.1] - 2018-06-20
- Fix Winston logger dependency

## [1.42.0] - 2018-06-20
- #CRRAINB-2838 - Event rainbow_onbubbleaffiliationchanged cand be fired
- #CRRAINB-2840 Request created from: Random behaviour to join a second time a nodejs user.
- add Telephony API for Alpha tests

## [1.41.6] - 2018-06-07
- Fix documentation

## [1.41.5] - 2018-06-06
- Fix race condition on bubble deletion

## [1.41.4] - 2018-06-05
- Fix #CRRAINB-2766: log files name is not correct

## [1.41.3] - 2018-05-30
- Set getRosters() as public
- Add Contacts.joinContacts admin API

## [1.41.2] - 2018-05-30
- Remove default values under models objects

## [1.41.1] - 2018-05-30
- Fix multiple presence subscription

## [1.41.0] - 2018-05-28
- #CRRAINB-2672: Update contacts information with getAll.
- Add contact avatar property
- Add additional header for analytics

## [1.40.2] - 2018-05-18
- Fix Object assign upper case
- Add missing Date in live received message, and from in sent message

## [1.40.1] - 2018-05-03
- Add internal admin getCompanyById method

## [1.40.0] - 2018-05-02
- #RQRAINB-910: CPAAS / SDK Node / refactor in IM service the APIs "sendMessageToConversation, sendMessageToContact, sendMessageToJid, sendMessageToBubble, sendMessageToBubbleJid" to return a Promise with the message sent, or null in case of error, as parameter of the resolve
- #CRRAINB-2413: Roster removing no more taken into account
- #CRRAINB-2405: Roster subscription no more taken into account
- Improvement in Promise treatment and error handling - Explicit documentation on Promises

## [1.39.1] - 2018-04-12
- #CRRAINB-2373: Conversation creation too verbose

## [1.39.0] - 2018-04-09
- #CRRAINB-2346: Add missing type in documentation for properties
- #CRRAINB-: Add the "createCompany" method in Admin service to create a company
- #CRRAINB-: Add the authent headers on the websocket xmpp
- #RQRAINB-859: CPAAS / SDK NodeJS / Add API Conversation
- #CRRAINB-2357: CPAAS / SDK Node / Promote to moderator in bubbles - Change owner

## [1.38.0] - 2018-03-17
- #CRRAINB-2123: The 'lang' of an IM is sometimes undefined
- #CRRAINB-2101: Fix issue with token survey that blocks the process in CLI mode

## [1.37.0] - 2018-02-25
- #CRRAINB-1812: Create a user by default to the admin company
- #CRRAINB-1860: Fix issue when retrieving the list of channels
- #CRRAINB-1972: Use the new authent login to server (the /api/rainbow/authentication/v1.0/login api login both user and application). Note: the old login process is stil used for compatibility.

## [1.36.1] - 2018-02-03
- #CRRAINB-1729: Remove log to console in channels service

## [1.36.0] - 2018-02-02
- #CRRAINB-1530: Stop XMPP connection correctly on `stop()`
- #CRRAINB-1534: Adapt channels API to changes from server
- #CRRAINB-1540: Add API `getMessagesFromChannel()` to retrieve messages from a channel
- #CRRAINB-1541: Fix API documentation for property `connectedUser`
- #CRRAINB-1542: Add API `sendMessageToContact()` `and sendMessageToBubble()`
- #CRRAINB-1579: Avoid crash on multiple `signout()`
- #CRRAINB-1628: Avoid crash when evaluating XMPP connection error
- #CRRAINB-1631: Avoid crash when the network is lost and launch the reconnection procedure
- #CRRAINB-1637: Increase attempt and MAX_DELAY when trying to reconnect the REST part
- #CRRAINB-1639: API `getContactByLoginEmail()`, `getContactById()`, `getContactsByJid()` doesn't work as expected
- #CRRAINB-1667: Fix crash when getting the bubbles list

## [1.35.2] - 2018-01-18
- #CRRAINB-1519: Impossible to update group name

## [1.35.1] - 2018-01-12
- #CRRAINB-1463: Fix typo in guides `Getting_Started`, `Proxy`, `Readme` and `Connecting to Rainbow` that had bad application parameters name.

## [1.35.0] - 2018-01-11
- #CRRAINB-1450: Replace JID by fullJID when sending a P2P message to avoid crash
- #CRRAINB-1451: Fix typo in guide `Managing contacts` with API getContactByLoginEmail that returns an array and not the contact directly
- #CRRAINB-1452: Update FOSS WS (DOS fix) and request (latest version available)
- #CRRAINB-1458: Add better explanation in guides `Getting started` and `Connecting to Rainbow` on configuration parameters.
- #CRRAINB-1459: Describe missing API `sendMessageToJid()` and `sendMessageToBubbleJid()` to sending messages in guide `Answering chat messages`

## [1.34.0] - 2017-12-17
- #RQRAINB-513: Allow to send a POST request with a specific content-type
- #RQRAINB-515: Add a ping mechanism from client side to server side when no stanza received during 70s
- #RQRAINB-478: Manage content-type text/csv in server response
- #CRRAINB-1222: Fix typo in guide `Managing Contacts`
- #CRRAINB-1217: Token renew policy forbids users to connect - SDK

## [1.33.3] - 2017-12-01
- #30078: Add User Agent in request

## [1.33.2] - 2017-11-30
- #30070: Send unavailability when removing from a bubble

## [1.33.1] - 2017-11-28
- #30007: Rename API findChannels to findChannelsByName and add findChannelsByTopic
- #30016: API fetchChannelUsers() is paginated
- #30023: Fix connection login issue
- #29698: Application token renewal

## [1.33.0] - 2017-11-24
- #29880: Password with autogenerated character §, is not working on createAnonymousGuestUser call
- #29704: Tutorial for channels
- #29697: Channels

## [1.32.0] - 2017-11-04
- #29647: Update documentation with markdown tags supported
- #29640: Allow put request when using from CLI
- #29275: Remove offline resource (avoir memory leak)
- #29282: Add Groups API
- #29492: Add tutorial on Groups
- #29273: Save presence (settings) when updating the presence

## [1.31.1] - 2017-10-17
- Force XMPP PLAIN Sasl mechanism for authentication
- Fix Gruntfile default rules
- #29146: Fix global variable
- Update XMPP.js to 0.3.0

## [1.31.0] - 2017-09-28
- #28868: Fix documentation around event rainbow_onmessagereceived
- #28880: Add date and timestamp to logger
- #28863: Impossible to reconnect after token expiration
- #28919: Fix signinCLI which was not promised
- #28930: Rework of custom data
- #28865: Allow to create anonymous guest user
- #28955: Limit message chat to 1024 characters
- #28866: Add explanation on specific messages received in bubble
- #29009: Add property connectedUser to retrieve the user account information
- #29012: No initial presence information for roster's contacts when offline
- #29017: Add new tutorial for managing contacts
- #29145: Re-inviting a declined user in a bubble

## [1.30.2] - 2017-09-28
- #29125: Impossible to log in CLI mode

## [1.30.1] - 2017-09-17
- #28960: Temporarily avoid sending application token
- #28989: Allow to get all bubbles from the server
- #28994: Add API getAllActiveBubbles() and getAllClosedBubbles()
- #29050: Fix bad fullJID identifier
- #29051: Avoid to send 2x the initial presence in bubble

## [1.30.0] - 2017-09-07
- #28821: Add new tutorial for managing bubbles
- #28823: No bearer in user login request

## [1.29.4] - 2017-08-23
- #28706: Fix crash when no AppID is provisionned

## [1.29.3] - 2017-08-22
- #28639: Fix Node.JS version 4.x compatibility
- #28463: Add new tutorial for managing users
- #28656: Document data models used and events parameters

## [1.29.2] - 2017-08-18
- #28640: New methods **setBubbleTopic()**, **setBubbleName()**

## [1.29.1] - 2017-08-17
- #28388: Return the bubble with the custom data updated

## [1.29.0] - 2017-08-16
- #28439: New methods **createUserInCompany()**, **createGuestUser()**, **inviteUserInCompany()**, **changePasswordForUser()**, **updateInformationForUser()** and **deleteUser()** have been added for managing users.
- #28456: [Changes] Methods **getContactByLoginEmail()** now search contacts on server side if not found locally.
- #28503: Return error codes when using in CLI mode.
- #28380: Add new tutorial for answering to chat messages.
- #28391: Limit the number of log files generated to 10
- #28375: Do not send receipt on specific bubble messages (admin message)
- #28388: Allow to add custom data to bubble.
- #28393: Add new tutorial for debugging.
- #28397: Add new tutorial for configuring the Proxy
- #28557: Unable to connect websocket behind a proxy

## [1.28.0] - 2017-07-22
- #28219: Reconnect
- #28086: Switch to new get contacts network API
- #28292: Avoid crashing on unknown XMPP messages
- #28161: Manage messages received just after bubble creation
- #28162: Differentiate Carbon copy message
- #28182: Stop the SDK
- #28307: Add property version
- #28085: Display SDK version in log
- #28231: Allow to send and receive additional content type like markdown
- #28238: New tutorial "Connecting to Rainbow"
- #28239: Add property state
- #28299: Add subject in message

## [1.27.2] - 2017-06-30
- Avoid message reception from Rainbow Bots (i.e. Emily)

## [1.27.1] - 2017-06-28
 - Fix regression in API getContactByJid()

## [1.27.0] - 2017-06-26
 - Add application ID treatment
 - Add language information in incoming and ougoing messages
 - #27892 Be notified of a bubble invitation and accept or decline this invitation
 - #27903 Bubble not updated when affiliation changed
 - #28006 Rework API getContactByID() to get data from server too
 - [Bubble] New methods **acceptInvitationToJoinBubble()**, **declineInvitationToJoinBubble()** have been added to answer a request of joining a bubble
 - [Bubble] New event **rainbow_onbubbleinvitationreceived** added for handling invitation to join a bubble
 - [Bubble] New event **rainbow_onbubbleownaffiliationchanged** added for handling user connected affiliation changes in a bubble

## [0.10.18] - 2017-06-09
 - #27522 Bad fix (introduce lots of regressions when no resource)

## [0.10.15] - 2017-05-23
 - [Contact] #27522 SearchByJid API doesn't return result when JID contains the resource

## [0.10.14] - 2017-05-19
 - [Quality] Add eslint and fix all issues - Internal change
 - [Contact] Switch to new get contacts API (Privacy concerns) - Internal change
 - [Bubble] #27312 Add parameter boolWithHistory in API createBubble to offer or not full history for newcomers

## [0.10.13] - 2017-05-04
 - [Contact] Methods **getContactByJid()**, **getContactById()** or **getContactByLoginEmail()** are now Promise based functions.

## [0.10.12] - 2017-04-30
 - [Bubble] Allow to create a bubble
 - [Bubble] Allow to close a bubble (Bubble is archived but existing messages can still be consulted including owners)
 - [Bubble] Allow to delete a bubble (Bubble no more appears in the bubble list for all participants including owners)
 - [Bubble] Allow to add a contact to a bubble (with or without invite, as user or moderator, with a reason)
 - [Bubble] Send a event when the a contact changes his affiliation with a bubble
 - [Bubble] Allow to send a message to a bubble
 - [Bubble] Allow to leave a bubble
 - [Bubble] Allow to remote a contact from a bubble
 - [Contact] Retrieve a contact using his login (email)

## [0.9.7] - 2017-03-21
 - [CLI] Allow to use the SDK as a CLI tool

## [0.8.12] - 2017-03-14
 - [Serviceability] Allow to enable or disable console and file logging
 - [Instant Message] Allow to send a 'read' receipt manually
 - [Presence] Compute the contact's presence by taken into account all resources including the phone one.
 - [Presence] Change the user connected presence manually

## [0.7.3] - 2017-03-02
 - [Serviceability] Connect through HTTP Proxy

## [0.6.7] - 2017-03-01
 - [Serviceability] Log debugging traces to files

## [0.5.6] - 2017-02-24
 - [Contacts] Retrieve the list of contacts
 - [Presence] Emit an event when the presence of a contact changes

## [0.4.8] - 2017-02-22
 - [Instant Message] Send a chat message to a Rainbow user (JID)
 - [Instant Message] Emit events when the Rainbow server and the recipient send a receipt

## [0.3.8] - 2017-02-21
 - [Instant Message] Emit an event when receiving a P2P chat messages from an other Rainbow user
 - [Instant Message] Send acknowledgments (Message received, Message read) when receiving a P2P message

## [0.0.2] - 2017-02-21
 - [Presence] Set the presence to 'online' once connected
 - [Connection] Sign-in using the XMPP API and maintain the connection on (PING)

## [0.0.1] - 2017-02-19
 - [Connection] Sign-in using the REST API, refresh the token and reconnect when needed
