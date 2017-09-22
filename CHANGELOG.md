# SDK for Node.JS

Here is the list of the changes and features provided by the **Rainbow-Node-SDK**

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

## [1.30.1] - 2017-09-17
- #28960: Temporarily avoid sending application token
- #28989: Allow to get all bubbles from the server
- #28994: Add API getAllActiveBubbles() and getAllClosedBubbles()
- #29050: Fix bad fullJID identifier

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
 