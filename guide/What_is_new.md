## What's new

---

Welcome to the new release of the Rainbow SDK for Node.JS.
Warning: Before deploying in production a bot that can generate heavy traffic, please contact ALE.
Some of the key highlights include:

### SDK for Node.JS 2.24.0 - STS Version - August 2023

---

**3-Delivery Release SDK Breaking Changes**

-   Warning: From version STS 2.24.0 this file will not be updated any more, because all the informations are now in the changelog file.


### SDK for Node.JS 2.23.0 - STS Version - July 2023

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   Remove deprecated methods form ChannelsService : getChannelById, createPrivateChannel, getChannels, getAllOwnedChannel, getMessagesFromChannel, deleteMessageFromChannel, getAllSubscribedChannel, getUsersFromChannel, removeAllUsersFromChannel, removeUsersFromChannel1

**API Changes**

-   Update `AdminService::getAllUsersByFilter` with phonenumbers and phonenumber filters. 

**Others Changes**

-   Update `AdminService::getAllUsersByFilter` with phonenumbers and phonenumber filters. 
-   Add treatment of Http Status Code 429 while occurs.
-   Add random delay (between 1 and 5000ms) to delay provided in headers RetryAfter on Http Status Code 429.
-   Add `ContactsService::getContactIdByLoginEmail` to retrieve the Id of a contact by its email. 
-   Add ability to log the call of API methods and parameters sent to it. It is an API module scoped feature. It is the `logEntryParameters` property in each services of the servicesToStart start options of the SDK.
-   Add `ChannelsService::updateChannelUsersByLoginEmails` to Update a collection of channel users by loginEmail
-   Add `ChannelsService::addOwnersToChannelByLoginEmails` to Add a list of owners to the channel by loginEmail
-   Add `ChannelsService::addPublishersToChannelByLoginEmails` to Add a list of publishers to the channel by loginEmail
-   Add `ChannelsService::addMembersToChannelByLoginEmails` to Add a list of members to the channel by loginEmail
-   Add `ChannelsService::deleteUsersFromChannelByLoginEmails` to Remove a list of users from a channel by loginEmail
-   Add log in `Conversation` class object.
-   Fix the update of `Conversation.Messages` when _onReceipt event received.
-   Fix `Message::alternativeContent` in pending Message sent.


### SDK for Node.JS 2.22.0 - STS Version - May 2023

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None    

**API Changes**

-   None    

**Others Changes**

-   Add RPCoverXMPPService to manages and use an RPC over XMPP requests system.
-   Add RPCoverXMPPService documentation.
-   Add documentation about guide Remote Procedure Call in SDK in `Managing_RPCoverXMPP.md`.


### SDK for Node.JS 2.21.0 - STS Version - April 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None    

**API Changes**

-   Update `ConversationsService::sendConversationByEmail` with parameters to send it to custom email, and set the language.
-   Update `ConversationsService::ackAllMessages` with parameter `maskRead` if true Im won't be shown as read on peer conversation side.
-   Update `FavoritesService::fetchAllFavorites` with peerId parameter.
-   Update `InvitationsService::reSendInvitation` API with customMessage parameters. 
-   Update `InvitationsService::sendInvitationsByBulk` API with lang and comment parameters. 

**Others Changes**

-   Fix startup when use startWSOnly() : to force set useRestAtStartup=false, and to use it for the load of getRosters.
-   Add `AdminService::getRainbowSupportBotService` `AdminService::getABotServiceData` `AdminService::getAllBotServices` to retrieve informations of bot services.
-   Fix `AdminService::retrieveRainbowEntriesList`
-   Add `AdminService::createCompanyFromDefault` This API API allows to create a company for a user belonging to the 'Default' company is able to create his own company.
-   Add `AdminService::getAllCompaniesVisibleByUser` This API allows users to get all companies.
-   Add `AdminService::getCompanyAdministrators` This API allows users to list users being administrator of a company.
-   Fix `BubblesService::disconnectParticipantFromConference` 
-   Add methods about Contacts Sources in ContactsService.
-   Add methods about Contacts API from Enduser portal in ContactsService.
-   Add `ConversationsService::getTheNumberOfHitsOfASubstringInAllUsersconversations` This API can be used to search a text substring in all conversations for a given user from recent to old messages.
-   Update low layer `RESTService::getServerConversations` method's parameters.
-   Add `ConversationsService::updateConversationBookmark` API can be used to set or replace a bookmarked message in a conversation.
-   Add `ConversationsService::loadConversationHistory` API to retrieve the remote history of a specific conversation.
-   Update the `ConversationsService::getContactsMessagesFromConversationId` method to retrieve history from server if not yet loaded.
-   Fix `BubblesService::getBubbles` when users property is empty in bubble.
-   Add `ConversationsService::showAllMatchingMessagesForAPeer` API. It can be used to return all matching messages for one specific peer.
-   Fix `AdminService::retrieveLdapConnectorAllConfigTemplates` (the last "s" was missing in doc).
-   Add `ConversationsService::deleteConversationBookmark` API. It can be used to set or replace a bookmarked message in a conversation.
-   Add `AdminService::getListOfCountries` API. It allows to retrieve the list of countries supported by Rainbow Server.
-   Add `BubblesSerice::disableDialInForARoom` This API allows to disable dial in for a room. 
-   Add `BubblesSerice::enableDialInForARoom` This API allows to enable dial in for a room.
-   Add `BubblesSerice::resetDialInCodeForARoom` This API allows to reset dial in code for a room.
-   Add `BubblesSerice::getDialInPhoneNumbersList` API that allows to retrieve the list of phone numbers to join conference by Dial In.
-   Add `FavoritesService::checkIsPeerSettedAsFavorite` API that can be used to check if a given peerId is in user's favorites.
-   Add `FavoritesService::getFavoriteById` API that can be used to retrieve a specific user's favorite by Id. 
-   Add `FavoritesService::getAllUserFavoriteList` API that can be used to retrieve the list of user's favorites. 
-   Add `FavoritesService::moveFavoriteToPosition` API that can be used to update a favorite's position in favorite list.
-   Add `GroupsService::updateGroupComment` to Update the comment of a group.
-   Add `ImsService::retrieveXMPPMessagesByListOfMessageIds` This API allows user to retrieve it's ims by list of message Ids, peer and peer type.
-   Add `InvitationsService::deleteAUserInvitation` API can be used to delete an invitation sent to/received from another Rainbow user. 
-   Add deleted and modified property in messages retrieved with history.
-   Fix attention when user's jid_im is in mention array of an history message.
-   Fix completion of Conversation.messages array with history's messages.
-   Add `AdminService::acceptJoinCompanyInvitation` API. It allows to accept a join company invitation received by the user (invitation sent by admin ).
-   Add `AdminService::declineJoinCompanyInvitation` API. It allows to decline a join company invitation received by the user (invitation sent by admin ).
-   Add `AdminService::getJoinCompanyInvitation` API. It allows to get a join company invitation received by the user using its invitationId (invitation sent by admin ).
-   Add `AdminService::getAllJoinCompanyInvitations` API. It allows to list all join company invitations received by the user (invitation sent by admin ).
-   Update `AdminService::createUserInCompany` to use low layer updated.
-   Add `AdminService::createUser` to Create a new user in providen company, else in Rainbow default companie.
-   Add event `rainbow_onjoincompanyinvitereceived` fired in case a of rainbow join company invite event.
-   Add `AdminService::cancelJoinCompanyRequest` This API can be used by logged in user to cancel a request to join a company he sent.
-   Add `AdminService::getJoinCompanyRequest` This API allows to get a join company request sent by the user.
-   Add `AdminService::getAllJoinCompanyRequests` This API allows to list all join company requests sent by the user.
-   Add `AdminService::resendJoinCompanyRequest` This API can be used by logged in user to re-send a request to join a company.
-   Add `AdminService::requestToJoinCompany` This API allows logged in user to send a request to join a company.
-   Add event `rainbow_onjoincompanyrequestreceived` fired in case a of rainbow join company request event.
-   Add `AdminService::createAJoinCompanyLink` This API can be used by company admin users to create a join company link for his company.
-   Add `AdminService::deleteAJoinCompanyLink` This API can be used by company `admin` users to delete a join company link by id.
-   Add `AdminService::getAJoinCompanyLink` This API can be used by company admin users to get a join company link by id.
-   Add `AdminService::getAllJoinCompanyLinks` This API can be used by company admin users to list existing join company links for his company.
-   Add `AdminService::updateAJoinCompanyLink` This API can be used by company admin users to update a join company link for his company.
-   Fix to send "close" stanza back to server when a "close" is received. It allows the reconnection without the "Replaced by new connection" error.
-   Fix `evt_internal_signinrequired` callback to restart the SDK before the signin.
-   Fix `rainbow_xmppreconnected` to stop the SDK before switching to FAILED state.


### SDK for Node.JS 2.19.0 - STS Version - December 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None    

**API Changes**

-   Add SDK parameter options.im : "autoInitialBubbleFormat": "small", // to allow modify format of data received at getting the bubbles. Default value is true.
-   Update the `BubblesService::getBubbleById` with few parameters.
-   Update the `BubblesService::getBubbleByJid` with few parameters.

**Others Changes**

-   Add `rainbow_onbubbleconferencedelegatereceived` event fired when an event conference delegate in a bubble is received.
-   Add `BubblesService::updateBubbleData` This API allows to update room data.
-   Add `BubblesService::getABubblePublicLinkAsModerator` api allow to get the openInviteId bound with the given bubble.
-   Add `BubblesService::getAllBubblesJidsOfAUserIsMemberOf` Provide the list of room JIDs a user is a member of.
-   Add `BubblesService::getAllBubblesVisibleByTheUser` Get all rooms visible by the user requesting it.
-   Add `BubblesService::getBubblesDataByListOfBubblesIds` Get all rooms visible by the user requesting it.
-   Add `BubblesService::getAllOwnedIdBubbles` Get the list of bubbles created by the user.
-   Add SDK parameter options.im : "autoInitialGetBubbles" : true, // to allow automatic opening of the bubbles the user is in. Default value is true.
-   Add SDK parameter options.im : "autoInitialBubbleUnsubscribed": true, // to allow get the bubbles when the user is unsubscribed from it. Default value is true.


### SDK for Node.JS 2.18.0 - STS Version - December 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   Remove `PresenceService::enableCalendar` and `PresenceService::disableCalendar` because the API is not available on server side anymore.    
-   Remove Conference V1 methods in BubblesService : 
-   methods `askConferenceSnapshot` `joinConference` `getBubbleByConferenceIdFromCache` `getBubbleIdByConferenceIdFromCache` 
-   methods `getConferencesIdByBubbleIdFromCache` `getConferenceByIdFromCache` `conferenceGetListFromCache` 
-   methods `updateOrCreateWebConferenceEndpoint` `updateWebConferenceInfos` `getWebRtcConfEndpointId` `getWebRtcSharingOnlyConfEndpointId` 
-   methods `conferenceStart` `conferenceStop` `conferenceJoin` `conferenceMuteOrUnmute` `conferenceMuteOrUnmutParticipant` 
-   methods `conferenceDropParticipant` `personalConferenceAllowed` `personalConferenceGetId` 
-   methods `personalConferenceGetBubbleFromCache` `personalConferenceGetBubbleIdFromCache` `personalConferenceGetPhoneNumbers`
-   methods `personalConferenceGetPassCodes` `personalConferenceResetPassCodes` `personalConferenceGetPublicUrl` `personalConferenceStart`
-   methods `personalConferenceStop` `personalConferenceJoin` `personalConferenceMuteOrUnmute` `personalConferenceLockOrUnlock` 
-   methods `personalConferenceMuteOrUnmuteParticipant` `personalConferenceDropParticipant` `conferenceEndedForBubble` `askBubbleForConferenceDetails` 
-   methods `personalConferenceRename` `conferenceModeratorAction` `conferenceMuteOrUnmutParticipant` 

**API Changes**

-   None

**Others Changes**

-   Add PBX Voice messages treatments with methods `TelephonyService::deleteAllMyVoiceMessagesFromPbx` `TelephonyService::deleteAVoiceMessageFromPbx` `TelephonyService::getAVoiceMessageFromPbx` `TelephonyService::getDetailedListOfVoiceMessages` `TelephonyService::getNumbersOfVoiceMessages`
-   Add `rainbow_onvoicemessagesinfo` event about the PBX Voice Message status.
-   Fix to initialize the contacts service before the telephony service.
-   Fix `ConversationsService::getServerConversations` to succeed even if the retrieve of informations about the contact failed.
-   Add a `TimeOutManager` manager to be able to control every setTimeout from one tool. Useful for stopping setTimeout when a stop of SDK occured.
-   Fix events treatment `ConversationHistoryHandler::onHistoryMessageReceived` when there are several times the tag `headers`. These events are raised as result of `conversations::getHistoryPage` API.
-   Add `AdminService::getAnImportStatus` API to provide a short status of the last import (completed or pending) of a company directory.
-   Add `PresenceService::controlCalendarOrIgnoreAnEntry` API to Enable/disable a calendar sharing or ignore a calendar entry.
-   Add `PresenceService::unregisterCalendar` API to Delete a calendar sharing.


### SDK for Node.JS 2.16.1 - LTS Version - october 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   None

**Others Changes**

-   Fix body in error of raw request in HttpService.
-   Extract the definition of methods from the constructor of the `core` class. 
-   comments unused  XMPPService::getRosters method.
-   Refactor treatment of contacts events during startup to store and send these events when data about the contact are received from getRosters method. correction for CRRAINB-29833.
-   Avoid to send request to server when the parameter is not setted in RESTService::getBubble and RESTService::getBubbleByJid .


### SDK for Node.JS 2.15 - STS Version - August 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   Add the "conversation" property in `answeredMsg` property of a instant message received.
-   Fix of `HTTPoverXMPP::get`, Add `HTTPoverXMPP::trace`, Add `HTTPoverXMPP::head`, Add `HTTPoverXMPP::post`, Add `HTTPoverXMPP::put`, `HTTPoverXMPP::delete` methods to set the dest `httpoverxmppserver_jid` of the request.
-   Add parameters to filter request for methods `FileStorageService::getFilesReceivedInBubble` `FileStorageService::createFileDescriptor` `FileStorageService::retrieveFileDescriptorsListPerOwner` `FileStorageService::retrieveSentFiles` `FileStorageService::retrieveReceivedFilesForRoom` `FileStorageService::retrieveReceivedFiles` `FileStorageService::getFilesSentInConversation` `FileStorageService::getFilesSentInBubble`
-   Add parameter `type` to specify for which type of synchronisation the config is in `AdminService::createConfigurationForLdapConnector` .
-   Updated the `rainbow_onconnectorconfig` event with configId property in data parameter.
-   Updated the documentation of `AdminService::sendCommandToLdapConnectorUser` API of `command` parameter possible values :  "manual_synchro_directories", "manual_dry_run_directories".
-   Update `AdminService::retrieveLdapConnectorConfigTemplate` method with parameter "type" that allows to filter connectors config list on the type provided in this option.

**Others Changes**

-   Fix `FileStorageService::copyFileInPersonalCloudSpace`. There was an issue in URL.
-   Update `ChannelsService::fetchChannelItems` to return the timestamp property in the Items.
-   Fix Content-Type of `AdminService::updateCommandIdStatus` method.
-   Add low layer methods discoverHTTPoverXMPP and answerDiscoverHTTPoverXMPP to allow the discover of the rainbow-vna-gw (specific project). 
-   Fix of send/receive messages in bubbles after a reconnection with reset of sending initial bubble presence in `BubblesManager`.
-   Add API method `AdminService::retrieveLdapConnectorAllConfigs` This API allows to retrieve the configurations list for the connector.
-   Add API method `AdminService::retrieveLDAPConnectorConfigByLdapConfigId` This API allows to retrieve the configuration for the connector with the ldapConfigId.
-   Add `AdminService::retrieveLdapConnectorAllConfigTemplate` API allows to retrieve all the configuration templates for the connector.
-   Add `rainbow_onconnectorcommandended` event received in case a query parameter commandId is added to the `AdminService::checkCSVdataForSynchronizeDirectory`, `AdminService::importCSVdataForSynchronizeDirectory` methods.
-   Add `AdminService::checkCSVdataForSynchronizeDirectory` API allows to checks a CSV UTF-8 content for mass-provisioning for directory mode.
-   Add `AdminService::importCSVdataForSynchronizeDirectory` API allows to import the entries of a company directory with CSV UTF-8 encoded data.
-   Add `AdminService::getCSVReportByCommandId` API allows to retrieves the last import CSV UTF-8 content for mass-provisioning for directory mode, performed by an admin (using a commandId).
-   Add `AdminService::createCSVReportByCommandId` API allows to create a report for a commandId in case no other API is called (no action to be performed, error, ...).
-   Add `AdminService::retrieveRainbowEntriesList` API allows to generates a file describing all companies entries (csv or json format).
-   Fix sitemap génération for developpers Web site.
-   Replace path `/#/documentation` with `/` in documentation for developpers Web site.

### SDK for Node.JS 2.16 - STS Version - August 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   None

**Others Changes**

-   None

### SDK for Node.JS 2.10.0-lts.10 - LTS Version - June 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   Add parameter "commandId" in `AdminService::synchronizeUsersAndDeviceswithCSV` API when runing the manual synchro, the commandId must be added as query parameter.
-   Add Bubble property in data of the 'rainbow_onbubbleconferenceupdated' event.
-   Update of conference's events when V2
-   Update `enableEncryptedLogs` SDK's parameter to false because of perf issue.
-   Update `AdminService::createConfigurationForLdapConnector` with 'name' parameter, and update doc.
-   Update `AdminService::updateConfigurationForLdapConnector` with 'name' parameter, and update doc.

**Others Changes**

-   Fix `ContactsService::init`. 
-   Add event `rainbow_onconnectorconfig` fired when a config is sent to connector's jid_im.
-   Fix lts_version.json file used to generate the image tab with the support's dates.
-   Fix init of ChannelsService.
-   Add option `options.rest.useRestAtStartup`, enable the REST requests to the rainbow server at startup (used with startWSOnly method). Default value is true.
-   Add API method `AdminService::getAllUsersByFilter` to get a list of users by filters.
-   Add startWSOnly API method to SDK to Start the SDK with only XMPP link.
-   Add `AdminService::sendCommandToLdapConnectorUser` API can be used to send a command to a ldap connector user. And add the event `rainbow_onconnectorcommand` raised when a command is received.
-   Add `AdminService::getAUserProfilesByUserId` and `AdminService::getAUserProfilesByUserEmail` method to retrieve the profiles of a user by his id or email.
-   Add `AdminService::getAUserProfilesFeaturesByUserId` and `AdminService::getAUserProfilesFeaturesByUserEmail` method to retrieve the features profiles of a user by his id or email.
-   In `conversationEventHandler::onErrorMessageReceived` callback send the bubble presence when an error occured when a message is sent to a bubble with error "Only occupants are allowed to send messages to the conference".
-   Fix when No data received from server since 80 secondes. The XMPP link is badly broken, so Application needs to destroy and recreate the SDK, with fresh start(...).  

## [2.10.0-lts.7] - 2022-05-10
-   Fix with Update `enableEncryptedLogs` SDK's parameter to false because of perf issue.

-   Fix In `conversationEventHandler::onErrorMessageReceived` calback send the bubble presence when an error occured when a message is sent to a bubble with error "Only occupants are allowed to send messages to the conference".
-   Fix when No data received from server since 80 secondes. The XMPP link is badly broken, so Application needs to destroy and recreate the SDK, with fresh start(...).  

-   Fix for jenkins generation of docs.


### SDK for Node.JS 2.10.0-lts.0 - LTS Version - April 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   Put deprecated following methods in BubblesService :  askConferenceSnapshot, retrieveConferences, updateOrCreateWebConferenceEndpoint, getWebRtcConfEndpointId, getWebRtcSharingOnlyConfEndpointId, conferenceStart, conferenceStop, conferenceJoin, conferenceMuteOrUnmute, conferenceMuteOrUnmutParticipant, conferenceDropParticipant, personalConferenceAllowed, personalConferenceGetId, personalConferenceGetBubbleFromCache, personalConferenceGetBubbleIdFromCache, personalConferenceGetPhoneNumbers, personalConferenceGetPassCodes, personalConferenceResetPassCodes, personalConferenceGetPublicUrl, personalConferenceGenerateNewPublicUrl, personalConferenceStart, personalConferenceStop, personalConferenceJoin, personalConferenceMuteOrUnmute, personalConferenceLockOrUnlock, personalConferenceMuteOrUnmuteParticipant, personalConferenceDropParticipant.
-   Put private following methods in BubblesService :  retrieveConferences, updateOrCreateWebConferenceEndpoint, getWebRtcConfEndpointId, getWebRtcSharingOnlyConfEndpointId, conferenceStart, conferenceStop, conferenceJoin, conferenceMuteOrUnmute, conferenceMuteOrUnmutParticipant, conferenceDropParticipant, personalConferenceGetId, personalConferenceGetBubbleFromCache, personalConferenceGetBubbleIdFromCache, personalConferenceGetPhoneNumbers, personalConferenceGetPassCodes, personalConferenceResetPassCodes, personalConferenceGetPublicUrl, personalConferenceGenerateNewPublicUrl, personalConferenceStart, personalConferenceStop, personalConferenceJoin, personalConferenceMuteOrUnmute, personalConferenceLockOrUnlock, personalConferenceMuteOrUnmuteParticipant, personalConferenceDropParticipant.

**Others Changes**

-   Add `ContactsService::getDirectoryEntryData` This API allows user to get data about an entry of his personnal directory.
-   Add `BubblesService::createBubblePoll` This API allows to create a Poll for a bubble.
-   Add `BubblesService::deleteBubblePoll` This API allows user to delete a Poll for a bubble.
-   Add `BubblesService::getBubblePoll` This API allows user to get data of a Poll for a bubble.
-   Add `BubblesService::getBubblePollsByBubble` This API allows user to get polls for a room.
-   Add `BubblesService::publishBubblePoll` This API allows user to publish a Poll for a bubble.
-   Add `BubblesService::terminateBubblePoll` This API allows user to terminate a Poll for a bubble.
-   Add `BubblesService::unpublishBubblePoll` This API allows user to unpublish a Poll for a bubble.
-   Add `BubblesService::updateBubblePoll` This API allows user to update poll.
-   Add `BubblesService::votesForBubblePoll` This API allows user to vote for a Poll for a bubble.
-   Add events for the polls : `rainbow_onbubblepollcreated`, `rainbow_onbubblepolldeleted`, `rainbow_onbubblepollpublished`, `rainbow_onbubblepollunpublished`, `rainbow_onbubblepollterminated`, `rainbow_onbubblepollupdated`, `rainbow_onbubblepollvoted`
-   Fix `AdminService::checkCSVforSynchronization` method.
-   Fix history return result when no queryid is available.
-   Add `HTTPoverXMPP` service to send HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HTTPoverXMPP::get` method to send a `GET` HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HTTPoverXMPP::trace` method to send a `TRACE` HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HTTPoverXMPP::head` method to send a `HEAD` HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HTTPoverXMPP::post` method to send a `POST` HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HTTPoverXMPP::put` method to send a `PUT` HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HTTPoverXMPP::delete` method to send a `DELETE` HTTP over XMPP requests to a server supporting the XEP0332.
-   Add `HttpoverxmppEventHandler` low layer class to treat HTTP over XMPP requests received from clients. SDK support `GET, TRACE,HEAD,POST,PUT,DELETE` requests.
-   Add `httpoverxmppserver` SDK's option parameter to activate the treatment of requests in `HttpoverxmppEventHandler` class. By default this feature is setted to false.


### SDK for Node.JS 2.9.0 - STS Version - LTS BETA - March 2022

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   Rename `InvitationsService::sendInvitationsByBulk` to `InvitationsService::sendInvitationsByBulk` 

**Others Changes**

-   Add `ImsService::sendMessageToJidAcknowledged` method to Send an Acknowledged reply to an urgent message (one to one, or bubble)
-   Add `ImsService::sendMessageToJidIgnored` method to Send an Ignored reply to an urgent message (one to one, or bubble)
-   Add `ContactsService::searchInAlldirectories` This API allows to search for resources matching given keywords. 
-   Add `ContactsService::searchInPhonebook` This API allows to search for resources matching given keywords.The search is done on name and phone number.
-   Add `ContactsService::searchUserByPhonenumber` This API allows to search user being associated to the requested number.
-   Add `ContactsService::searchUsers` This API allows to search users.
-   Add `AdminService::deleteLdapConnectorConfig` This API can be used to delete a ldap connector config.
-   Add `ContactsService::createPersonalDirectoryEntry` This API allows connected user to Create a personal directory entry. 
-   Add `ContactsService::getListPersonalDirectoryEntriesData` This API allows connected users to get an entry of his personal directory. 
-   Add `ContactsService::updatePersonalDirectoryEntry` This API allows the connected user to update an entry of his personnal directory. 
-   Add `ContactsService::deletePersonalDirectoryEntry` This API allows connected user to delete an entry from his personal directory.
-   Fix logs when a restart of the SDK is done.
-   Fix default typescript export.
-   Fix documentation of `InvitationsService::sendInvitationsByBulk` and `InvitationsService::sendInvitationByEmail`  
-   Add `InvitationsService::sendInvitationByCriteria` This API allows logged in user to invite another user by criteria.
-   Add `InvitationsService::searchInvitationsReceivedFromServer` This API is to retrieve the invites received from others Rainbow users from server. 
-   Add `InvitationsService::searchInvitationsSentFromServer` This API is to retrieve the invites sent to others Rainbow users from server.
-   Add `ContactsService::getCompanyInfos` This API allows user to get a company data.
-   Add an automatic start of monitoring on server when the company of the connected user has the `isMonitorable` property setted to true.


---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   None

**Others Changes**

-   Fix documentation about line feed in HTML.
-   Replace `sendInitialBubblePresence` with `sendInitialBubblePresenceSync` method to take in to account the event received from server about the presence in the bubble.
-   Fix missing mime.lookup with mime lib version > 1.5.0 .
-   Fix delete / leave bubbles methods in BubblesService when the bubble has the property isActive egal to false.
-   Add a `enablesendurgentpushmessages` property in the options provided to the initialisation of the SDK. This property permit to add <retry-push xmlns='urn:xmpp:hints'/> tag to allows the server sending this messge in push with a small ttl (meaning urgent for apple/google backend) and retry sending it 10 times to increase probability that it is received by mobile device.
-   Add generation of search index in Jenkinsfile-sts.groovy file.
-   Add `removeMacEOL` job in Jenkinsfile-sts.groovy file to remove from generated jsdoc the Mac (\r) end of line character which forbid the use of markdown table in comments.
-   Add `generatemermaid` job in Jenkinsfile-sts.groovy file to generate mermaid diagram from mmd files (to be used in SDK documentation).
-   Fix `Conversation::getlastEditableMsg()` method to return the editable only from sent messages. 
-   Complete and set public the `BubblesService::askConferenceSnapshot` method to returns global information about conference.


### SDK for Node.JS 2.7.0 - STS Version - November 2021

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   None

**Others Changes**

-   Update `CallLogService` `ChannelsService` `CallLogService` `ChannelsService` `FileStorage` with categories in the documentation.
-   Update `GroupsService` `ImsService` `InvitationsSerice` `PresenceService` `ProfilesService` `S2SService` `TelephonyService` with categories in the documentation.
-   Add `ProfilesService::getThirdPartyApps` to get The list of the Third Party Application that have access to this Rainbow Account. 
-   Add `ProfilesService::revokeThirdPartyAccess` to revoke the access of a third-party application from Rainbow. 
-   Fix initialisation of _contactService in FileStorageService.
-   Add `Bubble::status` property which is the status of the connected user in the bubble ('invited', 'accepted', 'unsubscribed', 'rejected' or 'deleted'). The initial value is "none", it is not a real value.
-   Add `BubblesService::isBubbleArchived` method to check if the Bubble is an Archive state (everybody 'unsubscribed'). 
-   Add `BubblesService::getAllOwnedArchivedBubbles` method to get all the owned Bubbles in an Archive state (everybody 'unsubscribed'). 
-   Add `BubblesService::getAllOwnedNotArchivedBubbles` method to  get all the owned Bubbles which are NOT in an Archive state (everybody unsubscribed).
-   Add "unsubscribed=true" parameter to resquests to server about bubbles. Beside owner and invited/accepted users keep also unsubscribed users.
-   Update `AdminService` `AlertsService` `BubblesService` `ContactsService` `ConversationsService` with categories in the documentation.
-   Fix `GroupsService::getGroupByName` and `GroupsService::getGroupById` methods.


### SDK for Node.JS 2.6.0 - STS Version - November 2021

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   Update `GroupsService::getGroupByName` method to search the group on server if not found in cache, so now the method is asynchronous and has a new `forceServerSearch` parameter.
-   Update `GroupsService::getGroupById` method to search the group on server if not found in cache, so now the method is asynchronous and has a new `forceServerSearch` parameter.
-   Update `AdminService::retrieveAllSubscriptionsOfCompanyById` API method with a format parameter to get small,middle, or full data.

**Others Changes**

-   Add parameter `raiseLowLevelXmppInEvent` to SDK options to raise an event `rainbow_onxmmpeventreceived` when an XMPP stanza is received. The default value is false. 
-   Add parameter `raiseLowLevelXmppOutReq` to SDK options to raise an event `rainbow_onxmmprequestsent` when an XMPP stanza is sent. The default value is false.
-   Fix `AdminService::retrieveRainbowUserList` method.
-   Update conferences related methods documentation in BubblesService.
-   Add `rainbow_onbubbleconferenceupdated` event raised during conference life. See `Manage_conferences` documentation and `BubblesService` API for details.
-   Add `Manage_conferences` documentation for information about conferences.
-   Fix events documentation and low layer documentation.
-   Update `Contact::roster` property to false when the `rainbow_oncontactremovedfromnetwork` event is raised instead of removing the Contact from cache.
-   Add `Contact::isAlertNotificationEnabled` property which allow to know if a user is able to send/receiv an urgency message. 


### SDK for Node.JS 2.1.0-lts.0 - LTS Version - October 2021

---

**3-Release SDK Breaking Changes**

-   Warning: The LTS active version of Node.js migrated to version 14.x. This version of SDK Node.js is only compliant with this LTS version up to 14.x.
Consequently, you need to update your Node.js version to 14.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   None.

**Others Changes**

-   Fix RESTService::synchronizeUsersAndDeviceswithCSV method.


## SDK for Node.JS 2.5.0 - STS Version - October 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   None

**API Changes**

-   Update `BubblesService::retrieveAllBubblesByTags` with `format` and `nbUsersToKeep` parameters to define the retrieve more or less room details in response.

**Others Changes**

-   Fix import of strip-ansi which is now a node module and not a commonjs anymore.
-   Fix `BubblesService::retrieveAllBubblesByTags` when multiple tags are passed in parameter.
-   Add Management of "Client Version" : `AdminService::createAClientVersion` `AdminService::deleteAClientVersion` `AdminService::getAClientVersionData` `AdminService::getAllClientsVersions` `AdminService::updateAClientVersion`. These api are used to manage the minimal required version for a given client application (by AppID).
-   Add methods in RESTService to deal with Rainbow Voice system (not yet available on API).
-   Add property in options passed to SDK : {boolean} options.im.copyMessage to manage if the Messages hint should not be copied to others resources (https://xmpp.org/extensions/xep-0334.html#no-copy) . The default value is true.
-   Add property in options passed to SDK : {boolean} options.im.enableCarbon to manage carbon copy of message (https://xmpp.org/extensions/xep-0280.html). The default value is true.
-   Add "x-rainbow-client" "x-rainbow-client-version" properties in Headers of every requests to make stats.
-   Fix `AdminService::getCSVTemplate` method.


### SDK for Node.JS 2.4.0 - STS Version - September 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   Fix typo in methods `AdminService::retrieveAllSubscribtionsOfCompanyById` to `AdminService::retrieveAllSubscriptionsOfCompanyById` and `AdminService::getSubscribtionsOfCompanyByOfferId` to `AdminService::getSubscriptionsOfCompanyByOfferId`

**API Changes**

-   Update `ContactsService::getContactByLoginEmail` method with a new parameter `forceServerSearch` boolean to force the search of the _contacts informations on the server.
-   Update `ImsService::sendMessageToConversation` with a new 'content' parameter to update message with a typed message.

**Others Changes**

-   Update typescript lib `es2017` to `es2019`
-   Fix `ConversationsService::_onReceipt` callback to not failed even if the conversation is empty.
-   Fix pendingMessages treatment between Array and Object methods mixed in ConversationsService.
-   Add method API `AlertsService::getAlertFeedbackSentForANotificationMessage`. This API allows to list the feedback sent by the devices for a given notification message (identified by its notification history's id).
-   Add method API `AlertsService::getAlertFeedbackSentForAnAlert`. This API allows to list the feedback sent by the devices for a given notification. 
-   Add method API `AlertsService::getAlertStatsFeedbackSentForANotificationMessage`. This API can be used to list all distinct feedback data submitted by the devices for a given notification message (identified by its notification history's id), with the number of devices for each distinct submitted feedback data. 
-   Add method API `AlertsService::getReportComplete`. Allows to get the fileDescriptor storing the detailed CSV report of the notification.  
-   Add method API `AlertsService::getAlertFeedbackSentForANotificationMessage`.
-   Add support of oauth tokens provided by application at `start` of the SDK and also the api to set the renewed token `setRenewedToken`. There is a sample using the oauth and sdk at https://github.com/Rainbow-CPaaS/passport-rainbow-oauth2-with-rainbow-node-sdk-example
-   Fix `alternativeContent` in `Message` object constructor.   
-   Fix `emails` property in `Contact` object.
-   Add in `Contact` object properties isActive, accountType, systemId, isInitialized, initializationDate, createdBySelfRegister, createdByAppId, firstLoginDate, lastLoginDate, loggedSince, failedLoginAttempts, lastLoginFailureDate, lastExpiredTokenRenewedDate, lastPasswordUpdateDate, timeToLive, timeToLiveDate, terminatedDate, fileSharingCustomisation, userTitleNameCustomisation, softphoneOnlyCustomisation, useRoomCustomisation, phoneMeetingCustomisation, useChannelCustomisation, useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, instantMessagesCustomisation, userProfileCustomisation, fileStorageCustomisation, overridePresenceCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, recordingConversationCustomisation, useGifCustomisation, useDialOutCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics, selectedAppCustomisationTemplate, alertNotificationReception, selectedDeviceFirmware, visibility, jid_password, creationDate, profiles, activationDate, lastOfflineMailReceivedDate, state, authenticationType, department, isADSearchAvailable, isTv, calendars, openInvites.
-   Add support of `Oauth token` provided at `start` of the SDK. In this use case application MUST implement the refresh token and send it back to SDK with `setRenewedToken` API, while following event are raised : </br> * Events rainbow_onusertokenrenewfailed : fired when an oauth token is expired. </br> * Events rainbow_onusertokenwillexpire : fired when the duration of the current user token reaches half of the maximum time.
-   Remove the "Authorization" property from http headers when openning the XMPP socket.
-   Add `ContactsService::getMyInformations` API to Get informations about the connected user.
-   Update stop of logger to stop winston library.
-   Fix the XMPPService (handleXMPPConnection) when ERROR_EVENT happenned to stop the ping timer only when the error is a fatal one.
-   Change to keep DEBUG with "logs.system-dev.*" in STS delivery. Do not forget that when properties of this section are setted then personnal datas are displayed in logs, so it is not RGPD compatible.is Do not activate it in production systems.  


### SDK for Node.JS 2.2.0 - STS Version - June 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Fix delete of item in `ContactsService::cleanMemoryCache ` method.
-   Fix `ConversationsService::openConversationForContact` when dbid is empty to get conversation from serveur side.
-   Add `AdminService::createDirectoryEntry` API that allows administrators to Create a directory entry.
-   Add `AdminService::deleteCompanyDirectoryAllEntry` API that allows administrators administrators  to delete all the entries in the directory of a company they administrate.
-   Add `AdminService::deleteDirectoryEntry` API that allows administrators to delete an entry from the directory of a company they administrate.
-   Add `AdminService::getDirectoryEntryData` API that allows administrators to get an entry of the directory of a company they administrate.
-   Add `AdminService::getListDirectoryEntriesData` API that allows administrators to get a list of directory entries data of a company they administrate.
-   Add `AdminService::updateDirectoryEntry` API that allows administrators to get an entry of the directory of a company they administrate.
-   Add `AdminService::exportDirectoryCsvFile` API that allows administrators to export the directory in a CSV file.
-   Add `AdminService::ImportDirectoryCsvFile` API that allows administrators to import the directory from a CSV file.
-   Add `AdminService::getAllTagsAssignedToDirectoryEntries` API that allows administrators to list all the tags being assigned to the directory entries of the companies managed by the administrator.
-   Add `AdminService::removeTagFromAllDirectoryEntries` API that allows administrators to remove a tag being assigned to some directory entries of the companies managed by the administrator.
-   Add `AdminService::renameTagForAllAssignedDirectoryEntries` API that allows administrators to rename a tag being assigned to some directory entries.
-   Add `AdminService::getStatsRegardingTagsOfDirectoryEntries` API that allows administrators to list all the tags being assigned to the directory entries.
-   Fix use of addParamToUrl method.
-   Add `BubblesService::addPSTNParticipantToConference` API that Adds a PSTN participant to WebRTC conference. A SIP call is launched towards the requested phone number.
-   Add `BubblesService::snapshotConference` The snapshot command returns global information about conference and the set of participants engaged in the conference. .
-   Add `BubblesService::delegateConference` API that allows Current owner of the conference delegates its control to another user.
-   Add `BubblesService::disconnectPSTNParticipantFromConference` API that Disconnect PSTN participant from conference.
-   Add `BubblesService::disconnectParticipantFromConference` API that Disconnect participant from conference.
-   Add `BubblesService::getTalkingTimeForAllPparticipantsInConference` The snapshot command returns global information about conference and the set of participants engaged in the conference. .
-   Add `BubblesService::joinConferenceV2` The snapshot command returns global information about conference and the set of participants engaged in the conference.
-   Add `BubblesService::pauseRecording` API that allows Pauses the recording of a conference.
-   Add `BubblesService::resumeRecording` API that allows Resume the recording of a conference. .
-   Add `BubblesService::startRecording` API that allows Start the recording of a conference.
-   Add `BubblesService::stopRecording` API that allows Stop the recording of a conference.
-   Add `BubblesService::rejectAVideoConference` API that allows User indicates that he rejects the conference (only available for WebRTC conferences).
-   Add `BubblesService::startConferenceOrWebinarInARoom` API that allows The start command initiates a conference in a room.
-   Add `BubblesService::stopConferenceOrWebinar` API that allows The stop command terminates an active conference identified in a room. All currently connected participants are disconnected.
-   Add `BubblesService::subscribeForParticipantVideoStream` API that Gives the possibility to a user participating in a WebRTC conference to subscribe and receive a video stream published by an other user.
-   Add `BubblesService::updatePSTNParticipantParameters` API that allows The update PSTN participant command can update different options of a participant.
-   Add `BubblesService::updateConferenceParameters` API that allows The update conference command can update different options of a conference.
-   Add `BubblesService::updateParticipantParameters` API that allows The update participant command can update different options of a participant.
-   Add `BubblesService::allowTalkWebinar` API that allows Webinar: allow a participant who raised his hand to talk.
-   Add `BubblesService::disableTalkWebinar` API that allows Webinar: disable a participant who raised his hand to talk.
-   Add `BubblesService::lowerHandWebinar` API that allows Webinar: participant lowers hand.
-   Add `BubblesService::raiseHandWebinar` API that allows Webinar: participant raises hand.
-   Add `BubblesService::stageDescriptionWebinar` API that allows Webinar: stage description (up to 10 actors).
-   Add treatment of xmpp event of "startConference" and "stopConference" for conference V2.
-   Fix export of `DataStoreType` in NodeSDK.  


### SDK for Node.JS 2.1.0 - STS Version - June 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Fix null Contact in `ContactsService::cleanMemoryCache()` method.
-   Fix S2SService::stop method.
-   Fix quotes in generated version.json file. 
-   Start implementation of "Rainbow Voice Communication Platform Provisioning" API.
-   Add `AdminService::getCloudPbxById` API that allows administrator to retrieve a CloudPBX using its identifier.
-   Add `AdminService::getCloudPbxs` API that allows administrator to retrieve a list of CloudPBXs.
-   Add `AdminService::subscribeCompanyToAlertOffer` API that allows administrator to subscribe one company to offer Alert. Private offer on .Net platform.
-   Add `AdminService::unSubscribeCompanyToAlertOffer` API that allows administrator to unsubscribe one company to offer Alert. Private offer on .Net platform.
-   Add `AdminService::subscribeCompanyToVoiceEnterpriseOffer` API Method to subscribe one company to offer Voice Enterprise.
-   Add `AdminService::unSubscribeCompanyToVoiceEnterpriseOffer` API Method to unsubscribe one company to offer Voice Enterprise.
-   Add `AdminService::updateCloudPBX` API that allows administrator to update a CloudPBX using its identifier.
-   Add `AdminService::deleteCloudPBX` API that allows administrator to delete a CloudPBX using its identifier.
-   Add `AdminService::createACloudPBX` API that allows administrator to creates a CloudPBX for a given company.
-   Add `AdminService::getCloudPBXCLIPolicyForOutboundCalls` API that allows administrator to retrieve the CloudPBX CLI options for outbound calls using its identifier.
-   Add `AdminService::updateCloudPBXCLIOptionsConfiguration` API that allows administrator to update a CloudPBX using its identifier.
-   Add `AdminService::getCloudPBXlanguages` API that allows administrator to retrieve a list of languages supported by a CloudPBX using its identifier.
-   Add `AdminService::getCloudPBXDeviceModels` API that allows administrator to retrieve a list of device models supported by a CloudPBX using its identifier.
-   Add `AdminService::getCloudPBXTrafficBarringOptions` API that allows administrator to retrieve a list of traffic barring options supported by a CloudPBX using its identifier.
-   Add `AdminService::getCloudPBXEmergencyNumbersAndEmergencyOptions` API that allows administrator to retrieve Emergency Numbers and Emergency Options supported by a CloudPBX using its identifier.
-   Add `AdminService::CreateCloudPBXSIPDevice` API that allows administrator to create a new SIP device into a CloudPBX.
-   Add `AdminService::factoryResetCloudPBXSIPDevice` API that allows administrator to reset a SIP deskphone device to its factory settings.
-   Add `AdminService::getCloudPBXSIPDeviceById` API that allows administrator to retrieve a SIP device using the given deviceId.
-   Add `AdminService::deleteCloudPBXSIPDevice` API that allows administrator to remove a SIP Device from a CloudPBX.
-   Add `AdminService::updateCloudPBXSIPDevice` API that allows administrator to update a SIP device.
-   Add `AdminService::getAllCloudPBXSIPDevice` API that allows administrator to filter devices according their assignment to a subscriber false, allows to obtain all devices not yet assigned to a subscriber.
-   Add `AdminService::getCloudPBXSIPRegistrationsInformationDevice` API that allows administrator to retrieve SIP registrations information relative to a device.
-   Add `AdminService::grantCloudPBXAccessToDebugSession` API that allows administrator to grant access to debug session on the given device.
-   Add `AdminService::revokeCloudPBXAccessFromDebugSession` API that allows administrator to revoke access to debug session on the given device.
-   Add `AdminService::rebootCloudPBXSIPDevice` API that allows administrator to reboot a SIP deskphone device.
-   Add `AdminService::getCloudPBXSubscriber` API that allows administrator to get data of a CloudPBX Subscriber.
-   Add `AdminService::deleteCloudPBXSubscriber` API that allows administrator to delete a CloudPBX Subscriber
-   Add `AdminService::createCloudPBXSubscriberRainbowUser` API that allows administrator to create a new CloudPBX Subscriber for a Rainbow User.
-   Add `AdminService::getCloudPBXSIPdeviceAssignedSubscriber` API that allows administrator to retrieve a given SIP device assigned to a subscriber.
-   Add `AdminService::removeCloudPBXAssociationSubscriberAndSIPdevice` API that allows administrator to remove association between subscriber and the Sip Device (SIP device becomes available for another subscriber).
-   Add `AdminService::getCloudPBXAllSIPdevicesAssignedSubscriber` API that allows administrator to retrieve all SIP devices assigned to a subscriber.
-   Add `AdminService::getCloudPBXInfoAllRegisteredSIPdevicesSubscriber` API that allows administrator to retrieve registrations info on all devices registered for a subscriber.
-   Add `AdminService::assignCloudPBXSIPDeviceToSubscriber` API that allows administrator to assign a SIP device to a CloudPBX Subscriber.
-   Add `AdminService::getCloudPBXSubscriberCLIOptions` API that allows administrator to get CLI policy of a CloudPBX Subscriber.
-   Add `AdminService::getCloudPBXUnassignedInternalPhonenumbers` API that allows administrator to list all unassigned internal phone numbers for a given CloudPBX system.
-   Add `AdminService::listCloudPBXDDINumbersAssociated` API that allows administrator to get the list of DDI numbers associated to a CloudPBX.
-   Add `AdminService::createCloudPBXDDINumber` API that allows administrator to create a DDI number for a CloudPBX.
-   Add `AdminService::deleteCloudPBXDDINumber` API that allows administrator to delete a DDI number for a CloudPBX.
-   Add `AdminService::associateCloudPBXDDINumber` API that allows administrator to associate a DDI number to a Rainbow user.
-   Add `AdminService::disassociateCloudPBXDDINumber` API that allows administrator to disassociate a DDI number from a Rainbow user.
-   Add `AdminService::setCloudPBXDDIAsdefault` API that allows administrator to set a DDI number as default DDI for a CloudPBX.
-   Add `AdminService::retrieveExternalSIPTrunkById` API that allows administrator to retrieve an external SIP trunk using its identifier.
-   Add `AdminService::retrievelistExternalSIPTrunks` API that allows administrator to retrieve a list of external SIP trunks.


### SDK for Node.JS 2.0.1-lts.2 - June 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**
-   Fix export of `DataStoreType` in NodeSDK.  
-   Fix delete of item in `ContactsService::cleanMemoryCache ` method.
-   Authorized the method "cleanMemoryCache" to be called when services are not connected (in Utils::isStarted).
-   Fix null Contact in `ContactsService::cleanMemoryCache()` method.
-   Fix S2SService::stop method.
-   Fix quotes in generated version.json file. 


### SDK for Node.JS 2.0.0 - May 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Update API Documentation
-   First LTS Verstion. 


### SDK for Node.JS 2.0.0 - April 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   First STS Verstion which is the Beta of the first LTS Version. 


### SDK for Node.JS 1.86 - April 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add API `ConversationsService::resetHistoryPageForConversation` to restart from scratch the retrieve of messages from history with getHistoryPage.
-   Fix the resources information when getContactByJid or by Id for the connected user.
-   Add API `AdminService::synchronizeUsersAndDeviceswithCSV` masspro to synchronize Rainbow users or devices through a CSV UTF-8 encoded file.
-   Add API `AdminService::getCSVTemplate` masspro to provides a CSV template. 
-   Add API `AdminService::checkCSVforSynchronization` masspro to checks a CSV UTF-8 content for mass-provisioning for useranddevice mode.
-   Add API `AdminService::retrieveRainbowUserList` API generates a file describing all users (csv or json format).
-   Add API `AdminService::ActivateALdapConnectorUser` API allows to activate a Ldap connector.
-   Add API `AdminService::retrieveAllLdapConnectorUsersData` API allows administrators to retrieve all the ldap connectors.
-   Add API `AdminService::deleteLdapConnector` API is to delete the LDAP connector (the connector cannot be modified by the others admin APIs).
-   Add API `AdminService::createConfigurationForLdapConnector` API allows create configuration for the LDAP connector.
-   Add API `AdminService::updateConfigurationForLdapConnector` API allows update configuration for the connector. .
-   Add API `AdminService::retrieveLdapConnectorConfig` This API allows to retrieve the configuration for the connector.
-   Fix some parameters orders in documentation of `BubblesService`.
-   Add API `BubblesService::setBubbleAutoRegister` to manage the share of bubble with a public link also called 'public URL' according the autoRegister value.
-   Add GenericService Class to set common behaviour at startup to the services. And traces the starting delay.
-   Add `intervalBetweenCleanMemoryCache` Node SDK option to set the time in milliseconds Between two `CleanMemoryCache`, method to avoid memoryleak on services (each one needs to implement the cleanning).
-   Add the treatment of the `CleanMemoryCache` in `ContactsService`.


### SDK for Node.JS 1.85 - March 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Update events `rainbow_onpresencechanged` and `rainbow_oncontactpresencechanged`  with new properties `until` and `delay`.
-   Add `until` propertie in the presence event of contacts to give the validity date of the calendar presence.

**Others Changes**

-   Update of the `dependencies`.
-   Fix XmppClient when sent iq failed at re-startup.
-   Activate DEBUG of `request` library when "logs.system-dev.http" is setted to true. It is only available on rainbow-node-sdk from sources or from debug npm package.
-   Fix Return types in documentation. 
-   Fix ContactsService::getRosters api to not reset the contacts cache, but to update contacts from data received from server.
-   Add PATCH verb in HttpService
-   Add `PresenceService::getCalendarState` Allow to get the calendar presence of the connected user.
-   Add `PresenceService::getCalendarStates`  Allow to get the calendar presence of severals users.
-   Add `PresenceService::setCalendarRegister` Register a new calendar.
-   Add `PresenceService::getCalendarAutomaticReplyStatus` Allow to retrieve the calendar automatic reply status.
-   Add `PresenceService::enableCalendar` Allow to enable the calendar.
-   Add `PresenceService::disableCalendar` Allow to disable the calendar.
-   Fix Offline presence of contacts in the roster.
-   Update methods `groups.getGroups()`, `BubblesService::getBubbles()`, `FileServerService::init`, `FileStorageService::init` to return a succeed event if the requests to server failed. To avoid the start to failed.
-   Update methods `ProfilesService::init` to return a succeed event if the requests to server failed. To avoid the start to failed. 


### SDK for Node.JS 1.84 - February 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Add parameter urgency of the message sent in API Methods `ImsService::sendMessageToJid` `ImsService::sendMessageToJidAnswer` `ImsService::sendMessageToBubble` `ImsService::sendMessageToBubbleJid` `ImsService::sendMessageToBubbleJidAnswer` `ImsService::sendMessageToContact` `ImsService::sendMessageToConversation` . The urgence of the message value can be : 'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message.
-   Add property `AlertDevice::domainUsername` for filtering alerts by domain username of the device.
-   Update method channelsService::fetchMyChannels with a new `force` parameter to allow the force of getting the channels informations from server. 
-   Update method channelsService::fetchChannelItems with a new parameters `maxMessages`=100 : number of messages to get, 100 by default. `beforeDate` [optional] : show items before a specific timestamp (ISO 8601 format), `afterDate` : show items after a specific timestamp (ISO 8601 format). 
-   Fix method `channelsService::fetchChannelItems` to realy return the last posted messages if the channels contents more than maxMessages. 

**Others Changes**

-   Add treatment of Urgency messages Events
-   Refactor the way the HTTP requests are limited. Now use the `request-rate-limiter` library which is a simple leaky-bucket based request rate limiter.
-   Add a `requestsRate` section in SDK's Options for the configuration of the `request-rate-limiter`. Defaults values :
-   "requestsRate":{ </br>    
        "maxReqByIntervalForRequestRate": 600, // nb requests during the interval. </br>  
        "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit. </br>  
        "timeoutRequestForRequestRate": 600 // nb seconds Request stay in queue before being rejected if queue is full. </br>  
    },   </br>  
-   Add ConversationsService::getContactsMessagesFromConversationId method to retrieve messages exchanged by contacts in a conversation. The result is the messages without event type.  
-   Add API methods `AlertsService::renameDevicesTags` `AlertsService::deleteDevicesTags` `AlertsService::getstatsTags` to manage Tags in Alerts.


### SDK for Node.JS 1.83 - February 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Add containerId and containerName in Bulle type. It is the folder where the bubble is stored in.
-   Update getConnectionStatus api to add in the return a value of `nbReqInQueue` the number of requests waiting for being treated by the HttpManager.

**Others Changes**

-   Add events `rainbow_onbubblescontainercreated` `rainbow_onbubblescontainerupdated` `rainbow_onbubblescontainerdeleted` fired when a container of bubbles event is received.
-   Add API in BubblesService for managing containers and add/remove bubbles in it (`getAllBubblesContainers`, `getABubblesContainersById`, `addBubblesToContainerById`, `updateBubbleContainerNameAndDescriptionById`, `createBubbleContainer`, `deleteBubbleContainer`, `removeBubblesFromContainer`).
-   Add `GenericHandler::getJsonFromXML` method to get JSON from xml server's events. It provided ability to decode events in JSON in insteadOf manually decode XML.
-   Fix `contactsService::getRosters` method to reset the _contacts list before getting the list from server, to avoid multiple additional of a contact.  
-   Fix getHistory when the conversation contain no message.
-   Use of `Alert`, `AlertsData` types of result of API in `AlertsService`.
-   Use of `AlertFilter`, `AlertFiltersData`, `AlertTemplate`, `AlertTemplatesData`, `AlertFilter`, `AlertFiltersData`, types of result of API in `AlertsService`.
-   Update of `rainbow_onmessagereceived` event with the `mentions` tab. It is to indicate the contacts mentioned in the message.
-   Fix of initial bubble presence when the SDK is restarted.
-   Fix build in Makefile for the docs of the HUB.


### SDK for Node.JS 1.82 - January 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Update the imported lib.
-   Add `generateFoss` grunt task to update the FOSS in documentation during delivery process.
-   Update the grunt task "debug" to be able to deliver a version with debug logs. 
-   Split the grunt build in two steps : Step 1 : `grunt` : to compil the sources, Step 2 : `grunt delivery` : To pepare the sources + doc for package
-   Add stack traces when using winston logger. 
-   Update doc generation for Alert, AlertDevice, AlertFilter, AlertMessage, AlertTemplate.
-   Add "Alert Custom" offer in AdminService::subscribeCompanyToAlertOffer and AdminService::unSubscribeCompanyToAlertOffer .
-   Fix AlertsService::createOrUpdateAlert API for name and description properties.
-   Use of `AlertDevice` type in the result of `AlertsService::createOrUpdateDevice, AlertsService::deleteDevice, AlertsService::getDevice, AlertsService::getDevices` to represent an Alert Device.
-   Use of `AlertDeviceData` type in `AlertsService::getDevices` result to represent a list of Alert Devices.


### SDK for Node.JS 1.81 - January 2021

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add in Contact property {String} `selectedTheme` Set the selected theme for the user. 
-   Add in Contact property {Object} `customData` User's custom data.
-   Add event `rainbow_onuserinformationchanged` when the properties of the connected user are changed on server side.
-   Add properties `selectedTheme, customData` in `AdminService::updateContactInfos` API method parameters.
-   Add API methods to get users `AdminService::getAllUsersByCompanyId` to get all users for a given admin in a company and `AdminService::getAllUsersBySearchEmailByCompanyId` to get all users for a given admin in a company by a search of string in email .
-   Add the property `FileDescriptor::md5sum` : md5 of the file getted from the backend file storage. This value is not filled at the first retrieve of all files. To get this property filled you need to call the retrieveOneFileDescriptor API.
-   Fix `fileStorage.uploadFileToConversation` method to return the error when the file provided in parameter does not exist.
-   Add event `rainbow_onalertmessagereceived` when an alert is received from server.
-   Fix `AlertsService::createAlert` method about date and no provided parameters.
-   Fix documentation.


### SDK for Node.JS 1.80 - December 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Update messageMaxLength option default value to 16384.

**Others Changes**

-   Fix in presenceEventHandler the offline presence of a contact in the roster.
-   Add HttpManager class to manage a promised queue of request to the server. It allow to have a queue of request and then avoid to much concurrents one.
-   Treat the HttpService methods getUrl, post, head, put, putBuffer, delete with the HttpManager queue.
-   Add property "concurrentRequests" in options.rainbow section parameter of the SDK to define the number of allowed concurrent request running in the HttpManager queue.
-   Change the max value of nbHttpAdded to Number.MAX_SAFE_INTEGER
-   Update getConnectionStatus() method to return the status of the queue of HTTP requests :
-   `nbHttpAdded`: number, the number of HTTP requests (any verb GET, HEAD, POST, ...) added in the HttpManager queue. Note that it is reset to zero when it reaches Number.MAX_SAFE_INTEGER value.
-   `httpQueueSize`: number, the number of requests stored in the Queue. Note that when a request is sent to server, it is already removed from the queue.
-   `nbRunningReq`: number, the number of requests which has been poped from the queue and the SDK did not yet received an answer for it.
-   `maxSimultaneousRequests` : number, the number of request which can be launch at a same time.
-   Add SDK parameter in log section : `enableEventsLogs`: false, Activate the logs to be raised from the events service (with `onLog` listener).
-   Fix XMPP resource name to have the string "node_" at the beginning of it.
-   Fix presence events. The presence event are all raised even if the aggregated contact.presence do not change, and only the resources property (with  detailed presence) is updated.


### SDK for Node.JS 1.79 - November 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Fix FileStorageService::downloadFile for big files. So the returned Object.buffer is modified to an Array of data.

**Others Changes**

-   Fix in presenceEventHandler the offline presence of a contact in the roster.
-   Add FileServerService::getBlobFromUrlWithOptimizationObserver method to retrieve a file and store it in a path. An Observer is returned to follow the download progress.
-   Add FileStorageService::downloadFileInPath method to retrieve a file and store it in a path. An Observer is returned to follow the download progress.
-   Fix FileStorageService::downloadFile for big files. So the returned Object.buffer is modified to an Array of data.
-   Update the AlertsService documentation
-   Add autoLoadConversations option to activate the retrieve of conversations from the server. The default value is true.
-   Add autoLoadContacts option to activate the retrieve of contacts from roster from the server. The default value is true.
-   Update the XMPPService::markMessageAsReceived with a parameter conversationType to define the type of message marked as read.


### SDK for Node.JS 1.78 - October 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add `AdminService::getUserPresenceInformation` method to get user presence information.
-   Add BubblesManager class used to join bubbles by pool with initial XMPP presence.
-   Refactor the way the presence is sent in bubble at startup with the `BubblesManager` in `BubblesService`. Presence is now sent it by group of bubbles, and there is a timer when it failed to avoid flood of server.
-   Add option `autoInitialBubblePresence` to allow automatic opening of conversation to the bubbles with sending XMPP initial presence to the room. Default value is true.
-   Add decode of calendar presence event with `isFromCalendarJid`
-   Add TelephonyService::getMediaPillarInfo method to retrieve the Jabber id of the Media Pillar linked to the system user belongs to.


### SDK for Node.JS 1.77 - September 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add Body in HttpService::delete request.
-   Add BubblesService::setTagsOnABubble to Set a list of tags on a {Bubble}.
-   Add BubblesService::deleteTagOnABubble to Delete a single tag on a list of {Bubble}. If the list of bubble is empty then every bubbles are concerned.
-   Add in bubble presence event the property statusCode to "disconnected" if status is "332". it is disconnected from room because of a system shutdown
-   Update treatment of error event in XMPPService::handleXMPPConnection of the default condition to avoid wrong stop of SDK, so we ignore it.
-   Add pretty-data logs of xml data.
-   Refactor logs to show XML of event's node instead of unreadable Element structure.
-   Add in classes the method `getClassName` and refactor `Utils::logEntryExit` method to log the name of class in front of method name when used in 'source debug mode'
-   Refactor conversationEventHandler, conversationHistoryHandler and RESTService to extract callback definitions from constructor.
-   Move events callbacks from constructors of classes to get types.
-   Add `answeredMsg, answeredMsgId, answeredMsgDate, answeredMsgStamp` properties in messages received in XMPP event and in history when it is a reply to a previous message (defined by these properties).
-   Add method `conversations::getOneMessageFromConversationId` To retrieve ONE message archived on server exchanged in a conversation based on the specified message Id and the timestamp (both are mandatory for the search)
-   Add `mute` property in Channel object.
-   Add NodeSDK::getConnectionStatus API to get connections status of each low layer services, and also the full SDK state.
-   Fix RainbowNodeSDKNews.md


### SDK for Node.JS 1.76 - September 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Update methods : `BubblesService::createPublicUrl` `BubblesService::generateNewPublicUrl` `BubblesService::removePublicUrl` to get a Bubble in parameter instead of an Id.

**Others Changes**

-   Add event `rainbow_onopeninvitationupdate` to return the informations about a management event on a public URL share of a bubble.
-   Add method `BubblesService::getBubblesConsumption` to get an object describing the consumption of number active bubbles.
-   Fix retrieveAllBubblesByTags method to get the bubbles filtered by a list of tags.of
-   Add RainbowNodeSDKNews.md guide to explain how to keep informed.


### SDK for Node.JS 1.75 - August 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Refactor `reconnect` code for xmpp lost connection to avoid multiple simultaneous tries to reconnect from low layer (@xmpp/reconnect plugging)
-   Add method BubblesService::registerGuestForAPublicURL to register a guest user with a mail and a password and join a bubble with a public url.
-   Add tags data in Bubbles type

### SDK for Node.JS 1.73 - July 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Add in method `AdminService::createCompany` parameter offerType. It's the company offer type. Companies with `offerType=freemium` are not able to subscribe to paid offers, they must be premium to do so.

**Others Changes**

-   Add Offers and subscriptions management in AdminService. Add methods : `retrieveAllOffersOfCompanyById, retrieveAllSubscribtionsOfCompanyById, getSubscribtionsOfCompanyByOfferId, subscribeCompanyToOfferById, subscribeCompanyToDemoOffer, unSubscribeCompanyToDemoOffer, unSubscribeCompanyToOfferById, subscribeUserToSubscription, unSubscribeUserToSubscription`.
-   Add method `S2SService::checkS2Sconnection` to give the ability to check the S2S connection with a head request.
-   Add methods `BubblesService::conferenceStart`, `BubblesService::conferenceStop` to start/stop the webrtc conference include in a bubble (Note that a premium account is need for this API to succeed).
-   Add the events rainbow_onbubbleconferencestartedreceived rainbow_onbubbleconferencestoppedreceived when a webrtc conference start/stop.

### SDK for Node.JS 1.72 - June 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add methods `BubblesService::getInfoForPublicUrlFromOpenInvite`, `BubblesService::getAllPublicUrlOfBubbles`, `BubblesService::getAllPublicUrlOfBubblesOfAUser`, `BubblesService::getAllPublicUrlOfABubbleto`, to retrieve the public URL of bubbles.
-   Add methods to manage public url access to bubbles. So a Guest or a Rainbow user can access to it just using a URL. `bubblesService::createPublicUrl`, `bubblesService::generateNewPublicUrl`, `bubblesService::removePublicUrl`.
-   Fix when sendPresence in S2S mode did not return any data.

### SDK for Node.JS 1.71 - May 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add `altitude` in `geoloc` field of received messages.
-   Add `publishResult` field in the result of `ChannelsService::publishMessage` API. It now contents the `id` of the created item. Nice to likeItem, deleteItem...
-   Fix the call of `likeItem` in postChangeLogInChannel.
-   Fix `RESTService::getDetailedAppreciations` url
-   Fill the `oob` property in received message in S2S mode. It is the description of an attached file to the message (if provided).
-   Add date of generation of doc in documentation
-   Fix `unavailable` stanza to be well understood by Web UI
-   Add a `PresenceRainbow` class to store the presence of a contact.
-   Fix presence in `presenceService` for the `Contact` class (take care may have change with "xa/away", "busy/dnd").

### SDK for Node.JS 1.70 - April 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Add in methods `ContactsService::getContactById`, `ContactsService::getContactByJid`, `ContactsService::getContactByLoginEmail`, `ContactsService::getContact` the presence if the requested user is the connected one.
-   Add in Message received from server a field "geoloc: { datum: 'WGS84', latitude: '4x.567938', longitude: '-4.xxxxxxx' }" of the localisation sent in messages by a mobile.
-   Fix presence in `presenceService` for the `Contact` class (take care may have change with "xa/away", "busy/dnd").

**Others Changes**

-   Add defaultDEBUG target in gruntfile to generate the compiled files with debug log not putted in comment.
-   Fix generateRss file because Array.values() method did not work anymore.
-   Update getContactByJid with a forceServerSearch parameter to force the search of the _contacts informations on the server.
-   Add method `channelsService::likeItem` to like treatment/event on a Channel's Item with an appreciation
-   Add method `channelsService::getDetailedAppreciations` to know in details apprecations given on a channel item (by userId the apprecation given)
-   Add like events on a Channel's Item with an appreciation.
-   Add in `postChangeLogInChannel` code to like the item when posting the changelog in Rainbow CPaaS info channel.
-   Fix `postChangeLogInChannel` to wait until the publish and like item are done.
-   Fix treatment of XMPP iq query event `set "remove"` from roster which was sending an "unavailable service" to server.
-   Add method `contactsService::removeFromNetwork` to remove a contact from the list of contacts and unsubscribe to the contact's presence
-   Add event `rainbow_contactremovedfromnetwork` raised when a contact is removed from connected user's network.
-   Move `index.js` to `src/index.ts` => become a typescript source file.

### SDK for Node.JS 1.69 - March 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Rename document Connecting_to_Rainbow to Connecting_to_Rainbow_XMPP_Mode.
-   Add document Connecting_to_Rainbow_S2S_Mode to describe the connection to Rainbow with a S2S event pipe.
-   Official ChangeLog RSS Flow URL : https://hub.openrainbow.com/doc/sdk/node/api/ChangeLogRSS.xml
-   Fix empty message list in conversation when conversationEventHandler::onConversationManagementMessageReceived event.
-   Move S2SService to service layer and folder
-   update S2S documentation.
-   Add the parameter role (Enum: "member" "moderator" of your role in this room) in joinroom in S2S
-   Fix S2SServiceEventHandler::ParseRoomInviteCallback
-   Fix error when delete conversation.
-   Add jenkins job to generate a new debug version of  rainbow-node-sdk

### SDK for Node.JS 1.68 - February 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Change default value of storeMessages SDK's parameter to true. Because the no-store is not fully supported by officials UI.

**Others Changes**

-   Add isFavorite in Conversation.
-   Add events treatment in S2SServiceEventHandler.
-   Add  method in ConversationsService::getS2SServerConversation to get a conversation from id on S2S API Server.
-   Raise event on message when the content is empty (because message can have a subject filled without body)  in conversationEventHandler.
-   Raise an event when receive a conversation unknown by sdk deleted in conversationEventHandler.
-   Update ImsService::sendMessageToConversation api to send the message in S2S mode.
-   Add postTestRunOpenrainbowDotNet script to post a message in a bubble when the tests for afterbuild start/stop.
-   Fix "no-store" value in DataStoreType type.
-   Update the event's data with the subject property when a Message arrive.
-   Fix presence for S2SServiceEventHandler.
-   Add original url in HttpService errors to help the following.
-   Update in the S2SServiceEventHandler the event handler for a received message with the `shouldSendReadReceipt` SDK parameter to automatically mark as read a received message.
-   Fix the stanza "presence" to desactivate history for room on server side.

### SDK for Node.JS 1.67 - February 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   RQRAINB-2868 Add property `Message::attention` Boolean to indicate if the current logged user is mentioned in the message.
-   RQRAINB-2868 Add parameter mention to API `ImsService::sendMessageToBubble` `ImsService::sendMessageToBubbleJid` `ImsService::sendMessageToBubbleJidAnswer` which contains an array list of JID of contacts to mention or a string containing a single JID of one contact.

**Others Changes**

-   Fix typo error in Gruntfile.js file for the generated documentation of the invitations service. And fix documentation.
-   Add method `FileStorageService::uploadFileToStorage` to Send a file in user storage.
-   RQRAINB-2870 Add `ConversationsService::deleteAllMessageInOneToOneConversation` method to delete all messages in ONE2ONE conversation.
-   RQRAINB-2984 Treat the XMPP Errors conditions provided by the XMPP RFC : https://xmpp.org/rfcs/rfc6120.html#streams-error .
-   Add `Bubble::autoAcceptationInvitation` property received from server.
-   Fix the treatment of error while method `getServerConversations` failed to retrieve conversations for `removeOlderConversations`.
-   RQRAINB-3024 Add `GroupsServices::deleteAllGroups` API to delete all existing owned groups.
-   RQRAINB-3024 Add `GroupsServices::setGroupAsFavorite` API to Set a group as a favorite one of the curent loggued in user.
-   RQRAINB-3024 Add `GroupsServices::unsetGroupAsFavorite` API to remove the favorite state of a group of the curent loggued in user.
-   RQRAINB-3024 Fix errors in groups events.
-   RQRAINB-3023 Add events `rainbow_onrainbowversionwarning` (+log) when the curent rainbow-node-sdk version is OLDER than the latest available one on npmjs.com.
-   RQRAINB-3023 Add method `HttpService::getUrl` to retrieve a specified url. The url can be any one while `HttpService::get` method only accept path on rainbow platform.
-   RQRAINB-3023 Add method `RESTService::getRainbowNodeSdkPackagePublishedInfos` to retrieve informations about the published package `rainbow-node-sdk` on npmjs.com.
-   RQRAINB-3023 Add a SDK parameter `testOutdatedVersion` to activate verification at startup if the current SDK Version is the lastest published on npmjs.com.
-   Add `Events::Emitter` class extending `EventEmitter` to log the events names and parameters. This class is removed while delivery process, so it is only available for SDK Dev.
-   RQRAINB-2721 Start to code s2s connection mode for methods (`listConnectionsS2S, sendS2SPresence, deleteConnectionsS2S, deleteAllConnectionsS2S, loginS2S, infoS2S`) and events (`S2SServiceEventHandler::handleS2SEvent` method). (Note that it is not finished, and it does not yet work).
-   RQRAINB-3022 Add a SDK parameter `messagesDataStore` to override the `storeMessages` parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value `DataStoreType.UsestoreMessagesField` so it follows the storeMessages behaviour).
-   Changelog is removed from https://hub.openrainbow.com/doc/sdk/node/api/ChangeLogRSS.
-   Fix the retrieve of `csv` file in HttpService. => Fix failure of command in rainbow Cli `rbw masspro template user` .
-   Fix S2SService::stop method.
-   Refactor for private members of services.
-   Fix retrieve at startup of the previous presence saved in settings service, and use it.

### SDK for Node.JS 1.66 - January 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Fix when the SDK is already stopped when stop method is called, then return a succeed. (CRRAINB-10270: CPaaS Node SDK - Chief bot demo wasn't unable to restart after connection issue)
-   Add BubblesService::getUsersFromBubble to get the actives users of a bubble.
-   Fix the parameter type sent by events `rainbow_onbubbledeleted` and `rainbow_onbubbleownaffiliationchanged`. It is now `Bubble` insteadOf `Promise<Bubble>`.
-   Add correlatorData et GlobaleCallId properties in Call type of phone calls : RQRAINB-2773, RQRAINB-2784, RQRAINB-2784, RQRAINB-2789, RQRAINB-2793, RQRAINB-2793, RQRAINB-2799
-   Fix method ChannelsService::createItem when parameter "type" is setted.
-   Split Xmmpp error event treatment in 3 possibilities:
    * Errors which need a reconnection
    * Errors which need to only raise an event to inform up layer. => Add an event `rainbow_onxmpperror` to inform about issue.
    * Errors which are fatal errors and then need to stop the SDK. => Already existing events `rainbow_onerror` + `rainbow_onstop`.
-   Work done on private method BubblesServices::joinConference (Not finish, so not available).
-   Update Bubble::users property ordered by additionDate.
-   Fix ordered calllogs (`orderByNameCallLogsBruts`, `orderByDateCallLogsBruts`).

### SDK for Node.JS 1.65 - January 2020

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   Add a parameter `nbMaxConversations` to the initialization SDK of the SDK to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.
-   Add option rateLimitPerHour for the SDK to set the maximum of message stanza sent to server by hour. Default value is 1000.

**API Changes**

-   none

**Others Changes**

-   Treat the Replace/conflict XMPP event received. This event means a sixth connection to server happens, only five simultaneous are possible. The oldest one is disconneted. The treatmeant is to stop the reconnect process, and stop the SDK. Events `rainbow_onerror` and  `rainbow_onstopped` are raised. **Note : The SDK is not any more connected, so the bot is offline**.
-   Refactor handling of the process "unhandledRejection" "warning" "uncaughtException".
-   Fix fill of properties Contact.companyId and Contact.companyName.
-   Forbid the sent over the XMPP socket if closed (XmppClient::socketClosed)
-   Fix datas of channel when fetched.
-   When Contacts::getContactByLoginEmail, force to get data from server if the contact is not found in local cache by mail.
-   Add method Presence::getUserConnectedPresence to get connected user's presence status calculated from events.
-   Move treatment of invitations events from Conversation/Contacts services to invitations service.
-   Retrieve less information about conversation at startup to increase it. The behavior is manage by the `conversationsRetrievedFormat` option in `im` section provided to NodeSdk intance.
-   Add the `storeMessage` parameter : message hint should not be stored by a server either permanently (as above) or temporarily. E.g. for later delivery to an offline client, or to users not currently present in a chatroom.
-   Add a new event `rainbow_onsendmessagefailed` fired when a chat message with no-store attribut sent has failed (ex: remote party offline).
-   Add a build of RSS fill of the changelog (available on https://hub.openrainbow.com/doc/sdk/node/api/ChangeLogRSS)
-   Add BubblesService::archiveBubble method to  close the room in one step. The other alternative is to change the status for each room users not deactivated yet. All users currently having the status 'invited' or 'accepted' will receive a message/stanza .
-   Typescript improvement.
-   Add CDD methods in TelephonyService : logon, logoff, withdrawal, wrapup.
-   Add the ability to login with a token to the Rainbow Node SDK (token parameter to SDK start method.).
-   Fix MaxListenersExceededWarning issue about too much listener registred.
-   Fix onFileManagementMessageReceived when a file created to store the filedescriptor in internal list
-   Add event `evt_internal_bubbleavatarchanged` raised when a bubble is updated with a new avatar
-   Add avatar property in Bubble class. This is the URL to download the avatar . Note that it can spot on an empty file if no avatar has been setted.
-   Add BubblesService::promoteContactToModerator Promote a contact to moderator in a bubble
-   Add BubblesService::demoteContactFromModerator Demote a contact to user in a bubble
-   Add BubblesService::getAvatarFromBubble Get A Blob object with data about the avatar picture of the bubble.
-   Add BubblesService::updateAvatarForBubble  Update the bubble avatar (from given URL). The image will be automaticalle resized.
-   Add BubblesService::deleteAvatarFromBubble Delete the bubble avatar
-   Add BubblesService::updateCustomDataForBubble Update the customData of the bubble
-   Add BubblesService::deleteCustomDataForBubble Delete the customData of the bubble
-   Add BubblesService::updateDescriptionForBubble Update the description of the bubble. (it is the topic on server side, and result event)
-   Add BubblesService::openConversationForBubble Open a conversation to a bubble.
-   Add `rainbow_onmediapropose` event raised when a WEBRTC `propose` event is received for a media. It allows to know an incommingcall is arriving.
-   Add in Bubble the property `owner`, boolean saying the connected user is the owner or not of the Bubble.
-   Add in Bubble the property `ownerContact`, Contact object which is the owner of the Bubble.
-   Add event `rainbow_onbubbleprivilegechanged` raised when a privilege is changed on a Bubble.
-   Add in Bubble the fields `members` and `organizers`.
-   Add the documentation for the CallLogService.

### SDK for Node.JS 1.64 - November 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   Fix of the presence::setPresenceTo to follow the server presence type.

**API Changes**

-   none

**Others Changes**

-   Documentation update
-   Fix comment for admin::createCompagny, Country is mandatory.
-   Add method bubbles::inviteContactsByEmailsToBubble to Invite a list of contacts by emails in a bubble.
-   Fix stop of the services if the SDK did not been started before.
-   Add start duration in result of start.
-   Fix to much logs in TelephonyService::getCallFromCache
-   Fix TelephonyService Call instance creation on few methods.
-   Fix data received from server in TelephonyService::holdCall,retrieveCall,makeConsultationCall

### SDK for Node.JS 1.63 - October 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting 2019, the LTS active version of Node.js migrated to version 12.x. This version of SDK Node.js is only compliant with this LTS version up to 10.x.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Fix Options.ts the start up service requested to start when it is not already present in default config.
-   Add bubble.lastActivityDate property : Last activity date of the room (read only, set automatically on IM exchange)
-   Add Message factory
-   Add listenning of system's signals "SIGINT", "SIGQUIT", "SIGTERM" for automatic call of stop on the rainbow intance.
-   Fix Makecall when the user doesn't have telephony.
-   Fix value Contact.id and Contact._id were sometime not filled
-   Reduce logs in dev mod
-   Add Message factory
-   Fix onDivertedEvent callback
-   Fix some missing return when reject Promise.
-   Remove unused singleton in RESTTelephony
-   Refactor _entering_ _existing_ logs in services and in some other classes

### SDK for Node.JS 1.62 - September 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Typescript improvement
-   Fix issue when an http request failed with a no-JSON body.
-   Add in the proxy section of option parameter : `secureProtocol: "SSLv3_method"` : The parameter to enable the SSL V3.

### SDK for Node.JS 1.61 - September 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Update the logs to remove all people data.
-   CRRAINB-7686 : Fix code for the 'read' receipt is sent automatically to the sender when the message is received.
-   Add the ability to start services one by one. To avoid the calls to unnecessary pay API on server.
-   Add event `rainbow_onconferenced` fired when a conference event is received.

### SDK for Node.JS 1.60 - August 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Update the "leaveBubble" method to unsubscribe form a bubble if not already unsubscribed the connected user. Else delete it from bubble.

**Others Changes**

-   Add method getStatusForUser in Bubble class to get the status of a user in the bubble
-   Fix file url in XMPPService::sendChatExistingFSMessage and XMPPService::sendChatExistingFSMessageToBubble methods
-   Add method BubblesService::getStatusForConnectedUserInBubble to Get the status of the connected user in a bubble
-   Fix ImsService::getMessageFromBubbleById method
-   Add shortFileDescriptor property in message return by ImsService::getMessageFromBubbleById method


### SDK for Node.JS 1.59 - August 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   none

**Others Changes**

-   Add in AdminService the method to get all users for a given admin
-   Update method BubblesService::unsubscribeContactFromBubble to send an event when the request to unsubscribe a user from a bubble succeed at end of the microservice call. Because sometimes the xmpp server does not send us the resulting event. So this event change will be sent twice time.
-   Add options::im::sendMessageToConnectedUser option to allow SDK to send a message to it self.
-   Add logs when an error occurred in XmppClient::send.


### SDK for Node.JS 1.58 - July 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Add correlatorData when makecall (TelephonyService::makeCall, TelephonyService::makeConsultationCall).
-   Update in fileStorage::uploadFileToConversation method to upload a file by an simple file path in file parameter or by the object description of the file (previous existing behavior).

**Others Changes**

-   Fix : event presence rainbow_oncontactpresencechanged when a contact in the roster is on phone.
-   Fix : put the SDK to STOPPED state if "rainbow_xmppdisconnect" arrive and the reconnection is disabled.
-   CRRAINB-6601 : Fix : Allows to make a second 3PCC RCC if the second call is allowed in profile.
-   Add properties Call::deviceType, Call::deviceState, Call::cause, Call::jid, Call::Call.
-   Fix getForwardStatus. Update of the URL to get it on server.
-   Add TelephonyService::getActiveCalls to retrieve active Call.
-   CRRAINB-6773: Update TelephonyService::getCalls method to return all the Calls.
-   Add TelephonyService::getCallsSize method to get calls tab size. Warning do not use length on the getCalls method result because it is the last index id +1.
-   Treat the Calls array cache in TelephonyService with the event received from server instead of doing the treatment when an API method is called.
-   CRRAINB-6600 : Add treatment of the initiated event in telephonyEventHandler to raise a dialing event.
-   CRRAINB-6600  : Add treatment of the conference event in telephonyEventHandler.
-   Update telephonyEventHandler::getCall to parse more data from XMPP telephony event
-   Add Favorites service (fetchAllFavorites, createFavorite, deleteFavorite)
-   Add Favorites events (rainbow_onfavoritecreated, rainbow_onfavoritedeleted)
-   Add Favorites doc
-   Add conversations::deleteMessage to delete a message by sending an empty string in a correctedMessage
-   Add shortFileDescriptor in message when ImsService::getMessageFromConversationById


### SDK for Node.JS 1.57 - June 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Rename event `rainbow_onownbubbledeleted` to `rainbow_onbubbledeleted` when a bubble is deleted.

**Others Changes**

-   RQRAINB-1550 : Add AdminService::getContactInfos method to retrieve informations about a user (need to be loggued in as a admin)
-   RQRAINB-1550 : Add userInfo1 and userInfo2 value in Contact but it can only be filled for the current user himself and AdminService::getContactInfos methods
-   RQRAINB-1550 : Add AdminService::updateContactInfos :  Set informations about a user (userInfo1, userInfo2, ...).
-   RQRAINB-1585 : Fix use of ErrorManager index.js
-   Update package.json "moment-duration-format": "^2.2.2" and npm audit fix
-   RQRAINB-1627 : Update to latest typescript engine


### SDK for Node.JS 1.56 - May 2019

---

**3-Release SDK Breaking Changes**

-   Warning: Starting January 2019, the LTS active version of Node.js migrated to version 10. This version of SDK Node.js is only compliant with this LTS active version.
Consequently, you need to update your Node.js version to 10.x in order to use this release of the SDK Node.js.


**API Breaking Changes**

-   none

**API Changes**

-   Refactor the channel's events to follow the event received from server :
    - replace events `rainbow_channelcreated`,`rainbow_channeldeleted` by `rainbow_channelupdated` with a `kind` parameter (with also a `label`)
    - Add event `rainbow_channelusersubscription` with a `kind` parameter (with also a `label`)

**Others Changes**

-   Add TelephonyService::deflectCall method to deflect a call to an other telephone number
-   Update TelephonyService doc.
-   Fix XMPPService::sendChatExistingFSMessageToBubble with the right from value.
-   Add event emitter in HttpService to raise event when token fail
-   Fix json parse in HttpService, and treat token expiration
-   Add mime-types lib to find file type.
-   Fix issue RESTService::unsubscribeToChannel method
-   Add uploadChannelAvatar  deleteChannelAvatar methods to manbage the avatar of a channel.
-   Add treatment of "channel-subscription" event
-   Refactor BubblesService with a method addOrUpdateBubbleToCache to have bubbles in cache.
-   Add method ChannelsService::subscribeToChannelById to Subscribe to a channel using its id
-   Add method ChannelsService::updateChannel to Update a channel
-   Fix new conversation in a Bubble event
-   Add calllog API doc
-   Refactor BubblesService::deleteBubble to not close the Bubble before the delete
-   Add a BubblesService::closeAndDeleteBubble method to close and delete a Bubble (Previous behaviour of deleteBubble).
-   Add guestMode property in Contact class : Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration.
-   Add openInviteId property in Contact class : The open invite ID of the user.

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

-   In order to save free disk space, logs files can be archived by adding the parameter `zippedArchive: true` to the `file` section of your configuration parameter. Adding parameters `maxSize: '10m'` and `maxFiles: 10` allow to limit disk usage used. See guide [Debugging](/doc/sdk/node/guides/Debugging) to have more information on how to configure these parametes.

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

-   Fix typo in guide [Managing Contacts](/doc/sdk/node/guides/Managing_contacts) with API `getContactByLoginEmail()` that returns an array and not the contact directly. API documentation has been updated too.

-   Update FOSS `ws` in order to avoid a DOS attack and FOSS `request` to be aligned with the latest available version.

-   Add better explanation in guides [Getting started](/doc/sdk/node/guides/Getting_Started) and [Connecting to Rainbow](/doc/sdk/node/guides/Connecting_to_Rainbow) on configuration parameters.

-   Describe APIs `sendMessageToJid()` and `sendMessageToBubbleJid()` on how to send messages in guide [Answering chat messages](/doc/sdk/node/guides/Answering_chat_message).

### SDK for Node.JS 1.34 - December 2017

---

**SDK**

-   An enhancement has been done to avoid `ghost` bot. The Node.JS SDK is automatically restarted if there is no message (stanza) received from the server during 70 secondes and after a ping request sent to rainbow that has not been answered within 5 secondes.

-   The Node.JS SDK now manages requests with a content-type equals to `text/csv` in order send and receive CSV content.

**Bugs**

-   Some minor typos corrections have been done on the guide [Managing Contacts](/doc/sdk/node/guides/Managing_contacts).

-   A fix has been done on the token renewal mechanism to manage the new token duration and renew process.

### SDK for Node.JS 1.33 - December 2017

---

**SDK**

-   New service `Channels` to send messages to a large number of users.

-   New guide [Managing Channels](/doc/sdk/node/guides/Managing_channels) has been added to explain how to create channels and publish messages.

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

-   New guide [Managing Groups](/doc/sdk/node/guides/Managing_groups) has been added to explain how to have create groups and add users in.

-   Updating guide [Answering Chat Messages](/doc/sdk/node/guides/Answering_chat_message) to list the Markdown tags unofficially supported by the Rainbow Web client.

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

-   New tutorial [Managing Contacts](/doc/sdk/node/guides/Managing_contacts) has been added to explain how to have retrieve the user's network or find for Rainbow contacts.

-   Guide [Answering to Chat Messages](/doc/sdk/node/guides/Answering_chat_message) has been updated to explain the specific messages that can be received by members when the affiliation of a specific member changes.

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

-   New tutorial has been added to explain how to manage Bubbles: [Managing Bubbles](/doc/sdk/node/guides/Managing_bubbles)

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

-   New tutorials have been added to explain some of key concepts: [Answering chat messages](/doc/sdk/node/guides/Answering_chat_message), [Debugging](/doc/sdk/node/guides/Debugging) and [Managing Proxy](/doc/sdk/node/guides/Proxy)

-   New tutorials has been added to explain how to manage and create users and guests: [Managing Users and Guests](/doc/sdk/node/guides/Managing_users)

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

-   New tutorial [`Connecting to Rainbow`](/doc/sdk/node/guides/Connecting_to_Rainbow) has been written to help understanding the SDK for Node.JS lifecycle.

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
