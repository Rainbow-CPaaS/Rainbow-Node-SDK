## CHANGELOG SDK for Node.JS

---

Here is the list of the changes and features provided by the **Rainbow-Node-SDK**
Warning: Before deploying in production a bot that can generate heavy traffic, please contact ALE.
All notable changes to Rainbow-Node-SDK will be documented in this file.


### [2.33.0] - 2025-01-XX
#### Removed
-   None

#### Fixed
-   Fix `methodsToIgnoreStartedState` value in `Utils::isStarted` to be able to define more than one method in "@isStarted" decoration parameter.
-   Fix `S2SServiceEventHandler::ParseRoomStateCallback` to emit "evt_internal_onbubblepresencechanged" to treat the promise of the sent initial bubble presence request.

#### Added
-   Add `AdminService::updateCompanyByObj` method to allows users with superadmin role to update any company. Users with admin role (and not having superadmin role) can only update their own company.
-   Add `AdminService::registerUserByEmailFirstStep` API allows to send a self-register email to a user. A temporary user token is generated and send in the email body. This token is required in the self register validation workflow with API `registerUserByEmailSecondStepWithToken`.
-   Add `AdminService::registerUserByEmailSecondStepWithToken` API allows to a user to self register a user account in Rainbow application. The token must be retrieved with `registerUserByEmailFirstStep`.
-   Add in `S2SServiceEventHandler` treatment of `/user` path event. It allows to receive the user roster events (add, remove).
-   Add in Logger Welcome trace the node version and the SDK running version.
-   Add `hasLobby`, `isOwnedByRoomAdmin`, `managedRoomPolicy`, `companyId` in `Bubble` class.
-   Add `expressEngine` for S2S mode. It is an SDK's option to provide an already existing Express engine to severeals SDK instance, to use the same Web server for S2S callback for different Bots.
-   Add `getBubbleLogInfos` methods to log small informations about Bubble.
-   Add `getAllS2SMessagesByConversationId` Retrieve the remote history of a specific conversation.
 
#### Changed
-   Update `S2SServiceEventHandler` to use the `userId` provided by each server's event to use a uniq Web server for many callback url.
-   Update default value of `maxReqByIntervalForRequestRate` to 20250.
-   Update default value of `timeoutRequestForRequestRate` to 600.
-   Update `Samples\index` to create and use a folder in %temp% directory.

### [2.32.0-lts.2] - 2024-11-26
#### Removed
-   None

#### Fixed
-   Fix Jenkinsfile for new branch 'LTSDeliveryNew'
  - Fix loadConfigFromIniFile()

#### Added
-   None

#### Changed
-   None

### [2.32.0-lts.0] - 2024-11-22
#### Removed
-   None

#### Fixed
-   None

#### Added
-   None

#### Changed
-   Same as STS 2.31.0 .

### [2.31.0] - 2024-11-22
#### Removed
-   None

#### Fixed
-   Fix loading message history.
-   Remove child event in XMPPService in fn_STANZA_EVENT callback. To increase speed of treatment.
-   Fix default values of FileStorageService::retrieveSentFiles.
-   Fix `NodeSDK` java doc.
-   Fix doc "autoInitialBubbleFormat" : "full".
-   Fix spelling of label `bubblemanager` to `bubblesmanager` for logs.
-   Fix the `ttl` used for renew of get `settings`.
-   Fix rainbowSDK.bubbles.updateAvatarForBubble because the Jimp library API changed.

#### Added
-   Add options to SDK {boolean} options.im.autoLoadCallLog to activate the retrieve of calllog from the server. The default value is false.
-   Add ability to load message history with bulk.
-   Add event "rainbow_on429BackoffError" Fired when a request initially failed and is trying to be retreated by backoff process.
-   Add Utils::loadConfigFromIniFile Utils::saveConfigFromIniFile to manage a config.ini file in $USERDATA$/Rainbow/RainbowNodeSdkDir directory.
-   Add `setCredentialPassword` API to set the password credential of the Bot for the login.
-   Add method `destroy()` on SDK. This method should be called before the bot to point to the SDK's instance to remove listener of "process" object.
-   Add `ImsService::sendApplicationMessageContactJid` API method to Sends a message to a Contact Jid that is ignored in the UCaaS app's message stream.
-   Add `ImsService::sendApplicationMessageBubbleJid` API method to Sends a message to a bubbleJid that is ignored in the UCaaS app's message stream.
-   Add `rainbow_onrainbowcpaasreceived` event Fired when a `rainbow-cpaas` event is receveid for a private data exchange.
-   Add a log for `Replaced by new connection` xmpp error.

#### Changed
-   Update `createBubble` with new parameters, and update "withHistory" parameter to "history" parameter to fllow ths string type. Note that for compatibility, if a boolean is provided then the API still have the same behaviour.
-   (internal to SDK) Refactor event treatment to have stanza in different format of xml, prettyXml and json in every law layer callbacks.
-   Replace old `Jenkinsfile-lts.groovy` and `Jenkinsfile-sts.groovy` with a merged `Jenkinsfile` file for new jenkins server.
-   Update got network lib default config value.
-   Update `HttpService` methods to use a param nbRetryBeforeFailed to use the `retry` mechanism of got library.
-   Update `xmppRessourceName` Option to be store in config.ini file to keep the same ressource name when a new SDK is constructed. So a user can only be connected one times on one computer. Note that the ressource name will be the same if few users has an instance of SDK.
-   Update `AdminService::retrieveAllOffersOfCompanyById` with parameters to filter the search.
-   Update method to find if the presence for teams in `isFromPresenceJid`.
-   Update of `getConnectionStatus()` API with `serviceStatus` to give the started status of SDK's services.

### [2.30.0] - 2024-07-03
#### Removed
-   None

#### Fixed
-   Fix upload file in wrong bubbles.
-   Fix `events messages` received in conversationHistoryHandler.
-   Fix missing some history messages received in conversationHistoryHandler missing in `conversations.messages`.

#### Added
-   Add "SDK" in tag of postChangeLogInChannel.
-   Add API `RESTService::getApiConfigurationFromServer` and `HttpService::addAdditionalHeaders` to retrieve settings. The settings is the configuration of rules allowing to force the clients to use a specific region for some API calls in Rainbow multi-region deployment (to avoid some clustering issues or increase performances)

#### Changed
-   Update `keepAliveMsecs` got option to 4301 to follow server values.
-   Update logs when an error occured in `Event handlers`.
-   Update to do less job when the history is retrieved.
-   Update `BubblesManager::treatAllBubblesToJoin` to oreder the join of bubbles, ordered by the most recent `lastActivityDate` .

### [2.29.0] - 2024-05-24
#### Removed
-   None

#### Fixed
-   None

#### Added
-   Add AdminService::getCompaniesBPBusinessType, AdminService::getCompanyAppFeatureCustomisation, AdminService::getCompanyServiceDescriptionFile, AdminService::getDefaultCompanyData, AdminService::setCompanyAppFeatureCustomisation, AdminService::updateCompany api methods about managing companies.
-   Add option `storeMessagesInConversation` to define if messages are stored in Conversation.  
-   Add option `maxMessagesStoredInConversation` to define the number of messages stored in Conversation. It is still stored in `messages` property but the type becomes a MessagesQueue (a FIFOQueue which extends Array). Note that storeMessagesInConversation needs to  

#### Changed
-   None

### [2.28.3] - 2024-04-04
#### Removed
-   None

#### Fixed
-   Fix build Jenkinsfile-sts.groovy file with new hubSearchIndex

#### Added
-   Add AdminService::deleteEmailTemplate AdminService::deleteAvailableEmailTemplatesBycompanyId AdminService::testEmailTemplateRendering AdminService::activateEmailTemplate AdminService::deactivateEmailTemplate

#### Changed
-   None

### [2.28.2] - 2024-03-29
#### Removed
-   None

#### Fixed
-   Fix build.

#### Added
-   None
 
#### Changed
-   None

### [2.28.1] - 2024-03-29
#### Removed
-   None

#### Fixed
-   Fix build.

#### Added
-   Cyclone DX informations
-   Add Companies Cloudpbx Groups (Rainbow Voice) API createCloudPBXGroup, deleteCloudPBXGroup, getCloudPBXGroup, getAllCloudPBXGroups, getMembersOfCloudPBXGroups, updateCloudPBXGroup, updateCloudPBXHuntingGroupAnalyticsConfiguration, updateCloudPBXHuntingGroupRecordingConfiguration, 
-   Add region Companies Customization Emails API getEmailTemplatesDocumentation, initiateEmailTemplate, updateSubjectPartTemplate, updateMjmlFormatPartTemplate, updateTextFormatFormatPartTemplate, getEmailTemplatesByCompanyId. (Some APi are still missing)
 
#### Changed
-   Update Jenkinsfile-lts.groovy Jenkinsfile-sts.groovy file with new hubSearchIndex

### [2.28.0] - 2024-03-20
#### Removed
-   None

#### Fixed
-   Fix S2S presence in bubble event evt_internal_ownaffiliationchanged event.
-   Fix typo "LOCK_TIMEOUT_QUEUE"
-   Fix HttpService::_delete of logs after request.
-   Fix reading of xmpp.timeBetweenXmppRequests SDK options.
-   Fix Contact.name.value for display. 
-   Fix to sendPresenceFromConfiguration after having ContactsService.init. To have already get the informations about connected user.
-   Fix RESTConferenceV2::addPSTNParticipantToConference request Headers.

#### Added
-   Add Offended 'raw in' and 'raw out' xmpp stanza.
-   Add options.xmpp.maxPendingAsyncLockXmppQueue the number of xmpp requests waiting for sending.
-   Add TasksService to manage Tasks (todos on server side).
-   Add  "rainbow_ontaskcreated", "rainbow_ontaskupdated", "rainbow_ontaskdeleted" events about tasks.
-   Add TasksService API : addTask, createTaskcategory, createOrUpdatePropertiesTaskByCategoryId, getTaskById, getTasksByCategoryId, getTasks, getAllCategories, deletePropertiesFromCategoriesTasks, deleteTask, deleteCategoryFromTasks, updateTask
-   Add an error trace when a fatal XMPP event "resource-constraint" with text "Max sessions reached" is received. This happens when the maximum of different XMPP ressources connected to server is reached (A user can only be connected simultaneously 5 times to XMPP Server).

#### Changed
-   Update Logger to add milliseconds.
-   Update timeouts of got default requests.
-   Update HttpService for log error.message when requests failed.
-   Update maxPending of AsyncLock to 5000 and update logs in XmppQueue.
-   Refactor Logger to use new levels with following order : "error", "warn", "info", "trace", "http", "xmpp", "debug", "internalerror", "internal". Each level contains previous one. 
-   Refactor Logger to use customs levels areas. Areas allow to override the log level for specifics limited area of code.

### [2.27.1] - 2024-01-22
#### Removed
-   None

#### Fixed
-   Fix FileStorageService.
-   Fix grunt compil of mime.

#### Added
-   Update logs API_ID in `AdminService`.
-   Update logs API_ID in `AlertsService`.
-   Update logs API_ID in `FileStorageService`.
-   Update `HttpService` logs
-   Update stop of sdk.
-   Update `gotOptions` with a new layer : gotRequestOptions to manage the `got` request timeout.

#### Changed
-   Update `gotOptions` with a new layer : agentOptions containing previous values.

### [2.27.0] - 2024-01-12
#### Removed
-   None

#### Fixed
-   Fix "jwt-decode" import.

#### Added
-   Add method's caller name in HTTP request logs.
-   Add "x-rainbow-request-node-id" header in HTTP request to link with the resulting "x-rainbow-request-id" header received in response.
-   Add missing properties in Contact and Bubble class.
-   Add method's caller name in HTTP request logs.

#### Changed
-   Update to use "SCRAM-SHA-1" on Xmpp link instead of "PLAIN".
-   Update `Logger` to enable or disable colors with "colors" lib and without removing ansi colors caracters.
-   Update `AdminService::uploadLdapAvatar` with parameter `ldapId` user unique identifier in ldap
-   Update `AdminService::deleteLdapAvatar` with parameter `ldapId` user unique identifier in ldap
-   Update reconnexion when token expired.
-   Update postTestRunOpenrainbowDotNet sdk's options
-   Update of logs from debug to info if not needed.
-   Update of stop sdk when error occured.

### [2.26.0] - 2023-12-12
#### Removed
-   None

#### Fixed
-   Fix reading of xmpp.timeBetweenXmppRequests SDK options.
-   Fix "roomid" and "pollid" when a poll event is received.

#### Added
-   Add Offended `raw in` and `raw out` xmpp stanza in `debug` level.

#### Changed
-   Update logs by levels.

### [2.25.2-lts.5] - 2024-01-11
#### Removed
-   None

#### Fixed
-   Fix RESTConferenceV2::addPSTNParticipantToConference
-   Fix ChannelsService::fetchChannel when an error occurred.

#### Added
-   None
-   Add options `useGotLibForHttp` to enable the use of `got` lib for REST requests (esle the old Request lib is used). Default value is true.
-   Add options `gotOptions` to customize the `got` lib for REST requests options.
-   Add a header in REST requests : `x-rainbow-request-id`.
-   Add `fix-esm` lib to load node package of type `ES Modules`.
 
#### Changed
-   Update `AdminService::uploadLdapAvatar` with parameter `ldapId` user unique identifier in ldap
-   Update `AdminService::deleteLdapAvatar` with parameter `ldapId` user unique identifier in ldap

### [2.25.2-lts.4] - 2023-10-20
#### Removed
-   None

#### Fixed
-   Fix `429` error for got lib.

#### Added
-   None

#### Changed
-   Update the dependencies versions.

### [2.25.2-lts.3] - 2023-10-20
#### Removed
-   None

#### Fixed
-   Rollback the modifications done to increase the startup because the init of the services was not correct when the SDK sent the rainbow_onready event.
-   Fix `ContactsService::_onPresenceChanged` and `ContactsService::_onRosterPresenceChanged` about Dnd on PCG V2.

#### Added
-   Add `AdminService::uploadLdapAvatar` API used to upload avatar image for logged in user.
-   Add `AdminService::deleteLdapAvatar` API used to delete avatar image for logged in user.

#### Changed
-   Update `catch` callbacks in event's handler in services : log level from `error` to `warn`.

### [2.25.2-lts.2] - 2023-10-17
#### Removed
-   None

#### Fixed
-   Fix `ContactsService::getAll` to return the Contacts in cache the network of the connected user. If you need the previous behaviour use the new API `ContactsService::getAllContactsInCache`.
-   Fix `InvitationsService` when an error occurs during call of `ContactsService::getContactById`. 

#### Added
-   Add `ContactsService::getAllContactsInCache` to get the list of _contacts that are in the cache of the current instance of the connected users.
-   Add @nodered true tag in javadoc of Service's apis
-   Add generated JSON docs for nodered contrib in jenkins job for include it in npmjs publish.

#### Changed
-   Update `ContactsService::getAll` API result (see Fixed).

### [2.25.2-lts.1] - 2023-10-03
#### Removed
-   None

#### Fixed
-   Fix SDK state when an error occured during "start" api.  
-   Fix 'AdminService::sendCustomerCareReport' method.

#### Added
-   None.  

#### Changed
-   Update callback event on "evt_internal_signinrequired" event to reconnect with the previously used singin method (signin or signinWSOnly).

### [2.25.1] - 2023-09-13
#### Removed
-   None

#### Fixed
-   None

#### Added
-   Add `generateWhatsNew` file with a task to generate a "what s new". It is used in grunt delivery process.  

#### Changed
-   None

### [2.25.0] - 2023-09-11
#### Removed
-   None

#### Fixed
-   Fix `AdminService::sendCustomerCareReport` to send 'ccareclientlogs' header to `uploadFileToStorage` method and to use the initiateLogsContext instead of completeLogsContext
-   Downgrade to mime lib 1.6.0 version.

#### Added
-   Add option `options.im.autoLoadConversationHistory` to activate the retrieve of conversation's messages from the server. The default value is false.
-   Add `customDatas` parameter a JSON object with custom datas merged to the payload send to server for the `ChannelService::publishMessageToChannel` .  (and createItem also). And also take these custom data into account is the events received.

#### Changed
-   Update sendCustomerCareReport to send "feedback" as default type.

### [2.24.3] - 2023-08-21
#### Removed
-   None

#### Fixed
-   Fix delivery failed.

#### Added
-   None

#### Changed
-   None

### [2.24.2] - 2023-08-21
#### Removed
-   None

#### Fixed
-   Fix `AdminService::sendCustomerCareReport` to put the ccare header in createFileDescriptor request.

#### Added
-   None

#### Changed
-   None

### [2.24.1] - 2023-08-18
#### Removed
-   None

#### Fixed
-   Fix `File` library in `FileStorageService` to use lastest mime version (3.0.0).

#### Added
-   Add API method `AdminService::sendCustomerCareReport` allows to store files in rainbow, and then to complete the logs context with it and provided informations.

#### Changed
-   Update `ErrorManager::CUSTOMERROR` with an error object to provide more information.

### [2.24.0] - 2023-08-10
#### Removed
-   None

#### Fixed
-   Fix BubblesService::_onBubbleConferenceStoppedReceived event.

#### Added
-   Add API methods in AdminService service to exchange with Customer Care portal (RQRAINB-5086). Details :
-   Add ability to inject a stanza in the event engine with `XMPPService::mockStanza` method. Of course this is for developer tests, and should not be used in production environnment.
-   * Add API `AdminService::getCustomerCareAdministratorsGroup` allows get the list of administrators allowed to consult the list of issues, create and consolidate tickets.
-   * Add API `AdminService::addAdministratorToGroup` allows Add one administrators allowed to consult the list of issues, create and consolidate tickets.
-   * Add API `AdminService::removeAdministratorFromGroup` allows to remove one administrator from the group.
-   * Add API `AdminService::getIssue` allows to retrieve a given issue.
-   * Add API `AdminService::getListOfIssues` allows to retrieve the list of issues.
-   * Add API `AdminService::getListOfIssuesForUser` allows to consult the list of issues associated to a user or a Rainbow Room.
-   * Add API `AdminService::getIssueForUser` allows to consult one issue associated to a user or a Rainbow Room.
-   * Add API `AdminService::initiateLogsContext` allows to Initialise a context to submit logs.
-   * Add API `AdminService::completeLogsContext` allows to completethe logs context.
-   * Add API `AdminService::cancelOrCloseLogsSubmission` to cancel the Ticket submission.
-   * Add API `AdminService::acknowledgeLogsRequest`  to acknoledge the log request.
-   * Add API `AdminService::rejectLogsRequest` to reject the log request.
-   * Add API `AdminService::adminOrBotAddAdditionalFiles` add files
-   * Add API `AdminService::getListOfResourcesForUser` allows to have the list of resources a user selected to connect to Rainbow infrastructure. 
-   * Add API `AdminService::createAnAtriumTicket` allows to Initialise a context from logs to submit a ticket to Zendesk.
-   * Add API `AdminService::updateAnAtriumTicket` allows to update a context from logs to submit a ticket to Zendesk.
-   * Add API `AdminService::deleteAnAtriumTicketInformation` allows to delete an existing context in database from a submitted ticket to Zendesk.
-   * Add API `AdminService::readAnAtriumTicketInformation` allows to read a context from a submitted ticket to Zendesk.
-   * Add API `AdminService::readAllTicketsOnASameCompany` allows to read all context regarding submitted tickets to Zendesk in the same company .
-   Add event `rainbow_onlogsconfig` for Logs management from customer care.
-   Add API `AdminService::createListOfEventsForConnector` allows the different connectors to store a list of events (RQRAINB-8039). 

#### Changed
-   None

<!--- xxx -->

### [2.23.1] - 2023-07-07
-   Fix to not ignore messages when it is received with empty body but with a filled alternativeContent.

### [2.23.0] - 2023-07-04
-   Update `AdminService::getAllUsersByFilter` with phonenumbers and phonenumber filters. 
-   Add treatment of Http Status Code 429 while occurs.
-   Add random delay (between 1 and 5000ms) to delay provided in headers RetryAfter on Http Status Code 429.
-   Add `ContactsService::getContactIdByLoginEmail` to retrieve the Id of a contact by its email. 
-   Remove deprecated methods form ChannelsService : getChannelById, createPrivateChannel, getChannels, getAllOwnedChannel, getMessagesFromChannel, deleteMessageFromChannel, getAllSubscribedChannel, getUsersFromChannel, removeAllUsersFromChannel, removeUsersFromChannel1
-   Add ability to log the call of API methods and parameters sent to it. It is an API module scoped feature. It is the `logEntryParameters` property in each services of the servicesToStart start options of the SDK.
-   Add `ChannelsService::updateChannelUsersByLoginEmails` to Update a collection of channel users by loginEmail
-   Add `ChannelsService::addOwnersToChannelByLoginEmails` to Add a list of owners to the channel by loginEmail
-   Add `ChannelsService::addPublishersToChannelByLoginEmails` to Add a list of publishers to the channel by loginEmail
-   Add `ChannelsService::addMembersToChannelByLoginEmails` to Add a list of members to the channel by loginEmail
-   Add `ChannelsService::deleteUsersFromChannelByLoginEmails` to Remove a list of users from a channel by loginEmail
-   Add log in `Conversation` class object.
-   Fix the update of `Conversation.Messages` when _onReceipt event received.
-   Fix `Message::alternativeContent` in pending Message sent.

### [2.22.4] - 2023-05-26
-   Add `Administrator::deleteTrustedApplication` `Administrator::deleteAllTrustedApplications` `Administrator::disableMultifactorAuthentication` `Administrator::enableMultifactorAuthentication` `Administrator::getMultifactorInformation` `Administrator::verifyMultifactorInformation` `Administrator::resetRecoveryCodeForMultifactorAuthentication` to manage Multifactor Rainbow Authentication
-   Add `BubblesService::checkOpenInviteIdValidity` `BubblesService::joinBubbleByOpenInviteId` to use Bubbles Open Invites.

### [2.22.3] - 2023-05-24
-   Update `rainbow_onconnectorimportstatus` event.

### [2.22.2] - 2023-05-23
-   Add "userId" and "description" when creating AlertDevice.
-   Add private API for PBX : `AdminService::createPbxPhoneNumber`, `AdminService::deletePbxPhoneNumber`, `AdminService::getPbxPhoneNumber`, `AdminService::getAllPbxPhoneNumbers`, `AdminService::updatepbxPhoneNumber`
-   Add `rainbow_onconnectorimportstatus` event.

### [2.22.1] - 2023-05-11
-   Fix `RpcoverxmppEventHandler::_onIqGetSetQueryReceived`.

### [2.22.0] - 2023-05-10
-   Add RPCoverXMPPService to manages and use an RPC over XMPP requests system.
-   Add RPCoverXMPPService documentation.
-   Add documentation about guide Remote Procedure Call in SDK in `Managing_RPCoverXMPP.md`.

### [2.21.0] - 2023-04-14
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
-   Update `ConversationsService::sendConversationByEmail` with parameters to send it to custom email, and set the language.
-   Update `ConversationsService::ackAllMessages` with parameter `maskRead` if true Im won't be shown as read on peer conversation side.
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
-   Update `FavoritesService::fetchAllFavorites` with peerId parameter.
-   Add `FavoritesService::checkIsPeerSettedAsFavorite` API that can be used to check if a given peerId is in user's favorites.
-   Add `FavoritesService::getFavoriteById` API that can be used to retrieve a specific user's favorite by Id. 
-   Add `FavoritesService::getAllUserFavoriteList` API that can be used to retrieve the list of user's favorites. 
-   Add `FavoritesService::moveFavoriteToPosition` API that can be used to update a favorite's position in favorite list.
-   Add `GroupsService::updateGroupComment` to Update the comment of a group.
-   Add `ImsService::retrieveXMPPMessagesByListOfMessageIds` This API allows user to retrieve it's ims by list of message Ids, peer and peer type.
-   Update `InvitationsService::sendInvitationsByBulk` API with lang and comment parameters. 
-   Add `InvitationsService::deleteAUserInvitation` API can be used to delete an invitation sent to/received from another Rainbow user. 
-   Update `InvitationsService::reSendInvitation` API with customMessage parameters. 
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

### [2.20.0] - 2023-02-24
-   Add `PresenceService::setApplyMsTeamsPresenceSettings` This api allows to activate the exchange of presence of the connected user between rainbow and MS Teams on UI side.
-   Add treatment of presence received from ms-teams. Note that only "online" and "do not disturb" teams presences are relayed by rainbow.
-   Add API MSTeams presence in `PresenceService`.
-   Add `rainbow_onbubblecontactinvitationreceived` event fired when an invitation to join a bubble is received for a contact.
-   Add use `applyMsTeamsPresence` in calculated presence.
-   Fix treatment of XMPP error with conditions : `policy-violation`, `resource-constraint` .
-   Fix `BubblesService::startRecording`.
-   Fix xmpp stanza for deleted or modified messages.
-   Update to set useMessageEditionAndDeletionV2 to true by default.
-   Add `AdminService::getASystemPhoneNumber` `AdminService::getAllSystemPhoneNumbers` `AdminService::updateASystemPhoneNumber` API to get/update phones numbers for a given system (pbx).
-   Fix `RESTService::renameTagForAllAssignedDirectoryEntries` parameters.
-   Fix `searchUserByPhonenumber` parameter type.
-   Fix `alternativeContent` in message for `sendCorrectedChatMessage` in bubble.
-   Add `BubblesService::deleteAllMessagesInBubble` API to delete all messages in a Bubble for everybody or hide it definitively for a specific contact. Please be carefull with it.
-   Add methods to retrieve/update phone number in systems : `AdminService::getASystemPhoneNumber`, `AdminService::getAllSystemPhoneNumbers`, `AdminService::updateASystemPhoneNumber`.
-   Add methods to manage `Systems` in Rainbow `AdminService::createSystem`, `AdminService::deleteSystem`, `AdminService::getSystemConnectionState`, `AdminService::getSystemDataByPbxId`, `AdminService::getSystemData`, `AdminService::getAllSystems`, `AdminService::getListOfCountriesAllowedForSystems`, `AdminService::updateSystem`.
-   Add `pcg2` presence (Rainbow HUB - Sipwize)
-   Add `RBVoiceEventHandler` to manage Rainbow Voice Events received from server.
-   Add `rainbow_onrbvoicerawevent` event fired in case a of rainbow voice event.
-   Fix `BubblesService::snapshotConference` return.
-   Add services parameter of `BubblesService::startConferenceOrWebinarInARoom` Requested service types. 
-   Fix of events of modified/deleted messages.

### [2.19.0] - 2023-01-09
-   Add `rainbow_onbubbleconferencedelegatereceived` event fired when an event conference delegate in a bubble is received.
-   Add `BubblesService::updateBubbleData` This API allows to update room data.
-   Update the `BubblesService::getBubbleById` with few parameters.
-   Update the `BubblesService::getBubbleByJid` with few parameters.
-   Add `BubblesService::getABubblePublicLinkAsModerator` api allow to get the openInviteId bound with the given bubble.
-   Add `BubblesService::getAllBubblesJidsOfAUserIsMemberOf` Provide the list of room JIDs a user is a member of.
-   Add `BubblesService::getAllBubblesVisibleByTheUser` Get all rooms visible by the user requesting it.
-   Add `BubblesService::getBubblesDataByListOfBubblesIds` Get all rooms visible by the user requesting it.
-   Add `BubblesService::getAllOwnedIdBubbles` Get the list of bubbles created by the user.
-   Add SDK parameter options.im : "autoInitialGetBubbles" : true, // to allow automatic opening of the bubbles the user is in. Default value is true.
-   Add SDK parameter options.im : "autoInitialBubbleFormat": "small", // to allow modify format of data received at getting the bubbles. Default value is true.
-   Add SDK parameter options.im : "autoInitialBubbleUnsubscribed": true, // to allow get the bubbles when the user is unsubscribed from it. Default value is true.

### [2.18.0] - 2022-12-09
-   Add PBX Voice messages treatments with methods `TelephonyService::deleteAllMyVoiceMessagesFromPbx` `TelephonyService::deleteAVoiceMessageFromPbx` `TelephonyService::getAVoiceMessageFromPbx` `TelephonyService::getDetailedListOfVoiceMessages` `TelephonyService::getNumbersOfVoiceMessages`
-   Add `rainbow_onvoicemessagesinfo` event about the PBX Voice Message status.
-   Fix to initialize the contacts service before the telephony service.
-   Fix `ConversationsService::getServerConversations` to succeed even if the retrieve of informations about the contact failed.
-   Add a `TimeOutManager` manager to be able to control every setTimeout from one tool. Useful for stopping setTimeout when a stop of SDK occured.
-   Fix events treatment `ConversationHistoryHandler::onHistoryMessageReceived` when there are several times the tag `headers`. These events are raised as result of `conversations::getHistoryPage` API.
-   Add `AdminService::getAnImportStatus` API to provide a short status of the last import (completed or pending) of a company directory.
-   Remove `PresenceService::enableCalendar` and `PresenceService::disableCalendar` because the API is not available on server side anymore.    
-   Add `PresenceService::controlCalendarOrIgnoreAnEntry` API to Enable/disable a calendar sharing or ignore a calendar entry.
-   Add `PresenceService::unregisterCalendar` API to Delete a calendar sharing.
    
### [2.17.0] - 2022-10-28
-   Catch when getBubble failed.

### [2.16.1-lts.3] - 2022-12-09
-   Update `FileViewer` Class to avoid the property ContactsService to be serialized when the Object is used with JSON.stringify tool.

### [2.16.1-lts.2] - 2022-11-18
-   Fix events treatment `ConversationHistoryHandler::onHistoryMessageReceived` when there are several times the tag `headers`. These events are raised as result of `conversations::getHistoryPage` API.
-   Add a new header with the rainbow application id `x-rainbow-client-id` in requests. 

### [2.16.1-lts.1] - 2022-11-07
-   Fix to initialize the contacts service before the telephony service.
-   Fix `ConversationsService::getServerConversations` to succeed even if the retrieve of informations about the contact failed. 

-   Catch when getBubble failed.


### [2.16.1-lts.0] - 2022-10-28
-   Fix body in error of raw request in HttpService.
-   Extract the definition of methods from the constructor of the `core` class. 
-   comments unused  XMPPService::getRosters method.
-   Refactor treatment of contacts events during startup to store and send these events when data about the contact are received from getRosters method. correction for CRRAINB-29833.
-   Avoid to send request to server when the parameter is not setted in RESTService::getBubble and RESTService::getBubbleByJid .

### [2.16.0-lts.0] - 2022-10-07
-   Deliver STS version 2.15.3 as new LTS.

### [2.15.3] - 2022-10-07
-   Fix getConnectionStatus when REST is not used.
-   Add methods `Utils::doWithinInterval`, `Utils::isPromise` to manage promises.
-   Refactor XmppQueue to use lock to avoid the previously happened unhandled exceptions.
-   Add the catch of `unhandledRejection` in XmppClient constructor.
-   Refactor XmppClient::send, XmppClient::sendIq methods to use the new XmppQueue with lock system. 
-   Add `Bubble::isAlertNotificationEnabled`, `Bubble::isOwnedByGroup`, `Bubble::isActiveLastChange`, `Bubble::processId` properties.
-   Add `Contact::outOfOffice`, `Contact::lastSeenDate`, `Contact::eLearningCustomisation`, `Contact::eLearningGamificationCustomisation`, `Contact::useRoomAsRBVoiceUser`, `Contact::useWebRTCAudioAsRBVoiceUser`, `Contact::msTeamsPresence` properties.
-   Add `Chanel::enable_comments`, `Chanel::max_comments`, `Chanel::max_payload_comment_size`, `Chanel::additionDate` properties.
-   Add in channel messages of result of ChannelsService::fetchChannelItems properties `creation`, `typeEntry`, `my_appreciation`, `appreciations`.

### [2.15.2] - 2022-09-13
-   fix  RESTService::retrieveFileDescriptors method, the type of the fileName.
-   Update for RQRAINB-7234 : NodeJS [Edge] Meet Bubble link should work also on Edges.
-   Add API `PresenceService::getMyPresenceInformation` to get connected user's resources presences information from server.
-   Fix type compare of array when finding DNS.
-   Fix fullJid for `xmppRessourceName` option.
-   Add call of `BubbleService::snapshotConference` for conference V2 at startup when a conference.sessions is define on bubbles.
-   Add a defense at login when network is disconnected. The SDK try to connect until the login request reach the server.

### [2.15.1] - 2022-09-02
-   Updated discover of HTTPoverXMPP to use a message stanza instead of presence one. 
-   Remove `answerDiscoverHTTPoverXMPP` low layer method, and put the code in treatment of the request discover event.
-   Add logs about reconnexion and try to reconnect if the ping failed and no reconnexion is in progress.
-   Add `xrbclient` `xrbversion` in `application` node of `presence` stanza at login.
-   Add the ability to choose a customized specific xmpp resource name with an init option `xmppRessourceName`. The resource will be "node_+`xmppRessourceName`".
-   Update for the new behaviour of `delete` and `modify` message. The `Message` class has new properties `deleted` and `modified`. By default it is desactivated by the property `useMessageEditionAndDeletionV2` in im section of the init option.
-   Fix sitemap generation. 
-   Finaly disable discover of HTTPoverXMPP.   

### [2.15.0] - 2022-08-25
-   Fix `FileStorageService::copyFileInPersonalCloudSpace`. There was an issue in URL.
-   Update `ChannelsService::fetchChannelItems` to return the timestamp property in the Items.
-   Fix Content-Type of `AdminService::updateCommandIdStatus` method.
-   Add low layer methods discoverHTTPoverXMPP and answerDiscoverHTTPoverXMPP to allow the discover of the rainbow-vna-gw (specific project). 
-   Fix of `HTTPoverXMPP::get`, Add `HTTPoverXMPP::trace`, Add `HTTPoverXMPP::head`, Add `HTTPoverXMPP::post`, Add `HTTPoverXMPP::put`, `HTTPoverXMPP::delete` methods to set the dest `httpoverxmppserver_jid` of the request.
-   Fix of send/receive messages in bubbles after a reconnection with reset of sending initial bubble presence in `BubblesManager`.
-   Add parameters to filter request for methods `FileStorageService::getFilesReceivedInBubble` `FileStorageService::createFileDescriptor` `FileStorageService::retrieveFileDescriptorsListPerOwner` `FileStorageService::retrieveSentFiles` `FileStorageService::retrieveReceivedFilesForRoom` `FileStorageService::retrieveReceivedFiles` `FileStorageService::getFilesSentInConversation` `FileStorageService::getFilesSentInBubble`
-   Add parameter `type` to specify for which type of synchronisation the config is in `AdminService::createConfigurationForLdapConnector` .
-   Add API method `AdminService::retrieveLdapConnectorAllConfigs` This API allows to retrieve the configurations list for the connector.
-   Add API method `AdminService::retrieveLDAPConnectorConfigByLdapConfigId` This API allows to retrieve the configuration for the connector with the ldapConfigId.
-   Updated the `rainbow_onconnectorconfig` event with configId property in data parameter.
-   Updated the documentation of `AdminService::sendCommandToLdapConnectorUser` API of `command` parameter possible values :  "manual_synchro_directories", "manual_dry_run_directories".
-   Update `AdminService::retrieveLdapConnectorConfigTemplate` method with parameter "type" that allows to filter connectors config list on the type provided in this option.
-   Add `AdminService::retrieveLdapConnectorAllConfigTemplate` API allows to retrieve all the configuration templates for the connector.
-   Add `rainbow_onconnectorcommandended` event received in case a query parameter commandId is added to the `AdminService::checkCSVdataForSynchronizeDirectory`, `AdminService::importCSVdataForSynchronizeDirectory` methods.
-   Add `AdminService::checkCSVdataForSynchronizeDirectory` API allows to checks a CSV UTF-8 content for mass-provisioning for directory mode.
-   Add `AdminService::importCSVdataForSynchronizeDirectory` API allows to import the entries of a company directory with CSV UTF-8 encoded data.
-   Add `AdminService::getCSVReportByCommandId` API allows to retrieves the last import CSV UTF-8 content for mass-provisioning for directory mode, performed by an admin (using a commandId).
-   Add `AdminService::createCSVReportByCommandId` API allows to create a report for a commandId in case no other API is called (no action to be performed, error, ...).
-   Add `AdminService::retrieveRainbowEntriesList` API allows to generates a file describing all companies entries (csv or json format).
-   Fix sitemap génération for developpers Web site.
-   Replace path `/#/documentation` with `/` in documentation for developpers Web site.
-   Add the "conversation" property in `answeredMsg` property of a instant message received.

### [2.14.1] - 2022-07-07
-   Add events::removeListener method to call events.eee.removeListener
-   Fix Unhandle Promise when a GET HTTP response is received.
 
### [2.14.0] - 2022-07-07
-   Add fileId when a file is attached in 'oob' property of data of a "rainbow_onmessagereceived".
-   Fix `NodeSDK::getConnectionStatus` api when the rest/xmpp/s2S/http law layer is not initialized.
-   Fix : Move the call at startup `_sendPresenceFromConfiguration` to avoid the missed messages when the "getContacts" method failed.
-   Add `PresenceService::sendInitialBubblePresenceById` private method. 
-   Fix ignored commandId in `AdminService::synchronizeUsersAndDeviceswithCSV`. 
-   Add to SDK initialisation a `testDNSentry` option to verify at startup/reconnection that the rainbow server DNS entry name is available.
-   Add parameter `maxIdleTimer` in xmpp section to define the delay without xmpp exchange after which a ping is sent to server. 
-   Add parameters `maxPingAnswerTimer` in xmpp section to define the time to wait the xmpp ping response. 
-   Add retry ability in `HttpService::_get` method. It is used to retry get data of GET request at startup when failed.
-   Use retry of _get in methods `RESTService::getAllUsersByFilter` `RESTService::getContacts` `RESTService::getServerFavorites` `RESTService::getAllSentInvitations` `RESTService::getAllReceivedInvitations` `RESTService::getGroups` `RESTService::getBots` `RESTService::getBubbles` `RESTService::fetchMyChannels` `RESTService::getServerProfiles` `RESTService::getServerProfilesFeatures` `RESTService::getServerConversations` 
-   Fix double fetch channels at startup in xmpp mode.


### [2.13.0] - 2022-06-16
-   Updated the event `rainbow_onbubbleconferenceupdated` with a parameter updatedDatasForEvent telling the data updated.
-   Add parameter commandId to the method `AdminService::checkCSVforSynchronization`.
-   Add `AdminService::getCheckCSVReport`, This API retrieves the last checks CSV UTF-8 content for mass-provisioning for useranddevice mode, performed by an admin (using a commandId).
-   Add `AdminService::checkCSVdata`, This API checks a CSV UTF-8 content for mass-provisioning.
-   Add `AdminService::deleteAnImportStatusReport`, This API allows to delete the report of an import identified by its reqId. 
-   Add `AdminService::getAnImportStatusReport`, This API allows to access the report of an import identified by its reqId.
-   Add `AdminService::getInformationOnImports`, This API provides information on all imports of the administrator's company.
-   Add `AdminService::getResultOfStartedOffice365TenantSynchronizationTask`, This API retrieves data describing all operations required to synchronize an Office365 tenant (csv or json format).
-   Add `AdminService::importCSVData`, This API allows to manage Rainbow users or devices through a CSV UTF-8 encoded file.
-   Add `AdminService::startsAsynchronousGenerationOfOffice365TenantUserListSynchronization`, This API generates data describing all operations required to synchronize an Office365 tenant (csv or json format).
-   Add `AdminService::synchronizeOffice365TenantUserList`, This API generates a file describing all operations required to synchronize an Office365 tenant (csv or json format).
-   Add `AdminService::checkCSVDataOfSynchronizationUsingRainbowvoiceMode`, This API checks a CSV UTF-8 content for mass-provisioning for rainbowvoice mode.
-   Add `AdminService::updateCommandIdStatus`, This API is used to update the status of the commandId.

### [2.12.0] - 2022-06-03
-   Same content as version 2.10.0-lts.10 

### [2.10.0-lts.10] - 2022-06-03
-   Add parameter "commandId" in `AdminService::synchronizeUsersAndDeviceswithCSV` API when runing the manual synchro, the commandId must be added as query parameter.
-   Fix `ContactsService::init`. 

### [2.10.0-lts.9] - 2022-05-25
-   Add event `rainbow_onconnectorconfig` fired when a config is sent to connector's jid_im.
-   Add Bubble property in data of the 'rainbow_onbubbleconferenceupdated' event.
-   Fix lts_version.json file used to generate the image tab with the support's dates.

### [2.10.0-lts.8] - 2022-05-13
-   Update of conference's events when V2
-   Fix init of ChannelsService.

### [2.11.2] - 2022-05-11
-   Add option `options.rest.useRestAtStartup`, enable the REST requests to the rainbow server at startup (used with startWSOnly method). Default value is true.
-   Add API method `AdminService::getAllUsersByFilter` to get a list of users by filters.

### [2.11.1] - 2022-05-09
-   Add startWSOnly API method to SDK to Start the SDK with only XMPP link.
-   Add `AdminService::sendCommandToLdapConnectorUser` API can be used to send a command to a ldap connector user. And add the event `rainbow_onconnectorcommand` raised when a command is received.

### [2.11.0] - 2022-04-05
-   Add `AdminService::getAUserProfilesByUserId` and `AdminService::getAUserProfilesByUserEmail` method to retrieve the profiles of a user by his id or email.
-   Add `AdminService::getAUserProfilesFeaturesByUserId` and `AdminService::getAUserProfilesFeaturesByUserEmail` method to retrieve the features profiles of a user by his id or email.
-   Update `enableEncryptedLogs` SDK's parameter to false because of perf issue.
-   Update `AdminService::createConfigurationForLdapConnector` with 'name' parameter, and update doc.
-   Update `AdminService::updateConfigurationForLdapConnector` with 'name' parameter, and update doc.
-   In `conversationEventHandler::onErrorMessageReceived` callback send the bubble presence when an error occured when a message is sent to a bubble with error "Only occupants are allowed to send messages to the conference".
-   Fix when No data received from server since 80 secondes. The XMPP link is badly broken, so Application needs to destroy and recreate the SDK, with fresh start(...).  
-   Start of the update of the treatment of event conference V2.

### [2.10.0-lts.7] - 2022-05-10
-   Fix with Update `enableEncryptedLogs` SDK's parameter to false because of perf issue.

### [2.10.0-lts.6] - 2022-05-03
-   Fix with Update `enableEncryptedLogs` SDK's parameter to false because of perf issue.
-   Fix In `conversationEventHandler::onErrorMessageReceived` calback send the bubble presence when an error occured when a message is sent to a bubble with error "Only occupants are allowed to send messages to the conference".
-   Fix when No data received from server since 80 secondes. The XMPP link is badly broken, so Application needs to destroy and recreate the SDK, with fresh start(...).  

### [2.10.0-lts.5] - 2022-04-08
-   Fix for jenkins generation of docs.

### [2.10.0-lts.4] - 2022-04-08
-   Fix for jenkins generation of docs.

### [2.10.0-lts.3] - 2022-04-07
-   Fix for jenkins generation of docs.

### [2.10.0-lts.2] - 2022-04-07
-   Fix for jenkins generation of docs.

### [2.10.0-lts.1] - 2022-04-07
-   Fix for jenkins generation of docs.

### [2.10.0-lts.0] - 2022-04-07
-   Add `ContactsService::getDirectoryEntryData` This API allows user to get data about an entry of his personnal directory.
-   Add `BubblesService::createBubblePoll` This API allow to create a Poll for a bubble.
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

### [2.9.1] - 2022-03-23
-   Fix RESTService at login to getCompanyInfos when it failed.

### [2.9.0] - 2022-03-18
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
-   Rename `InvitationsService::sendInvitationsByBulk` to `InvitationsService::sendInvitationsByBulk` 
-   Fix documentation of `InvitationsService::sendInvitationsByBulk` and `InvitationsService::sendInvitationByEmail`  
-   Add `InvitationsService::sendInvitationByCriteria` This API allows logged in user to invite another user by criteria.
-   Add `InvitationsService::searchInvitationsReceivedFromServer` This API is to retrieve the invites received from others Rainbow users from server. 
-   Add `InvitationsService::searchInvitationsSentFromServer` This API is to retrieve the invites sent to others Rainbow users from server.
-   Add `ContactsService::getCompanyInfos` This API allows user to get a company data.
-   Add an automatic start of monitoring on server when the company of the connected user has the `isMonitorable` property setted to true.

### [2.8.2] - 2022-02-18
-   Add documentation about telephony call : `Telephony_calls.md`.
-   Update the `rainbow_onmediapropose` event with more data.
-   Add events about Webrtc calls : `rainbow_onmediaretract` of the retract action, it is the call propose id received before.  
-   Add events about Webrtc calls : `rainbow_onmediaaccept` of the accept action, it is the call propose id received before.
-   Add Rainbow Voice API :
    * `RBVoiceService::retrieveAllAvailableCallLineIdentifications` : This api returns all CLI options available.  
    * `RBVoiceService::retrieveCurrentCallLineIdentification` : This api returns current Call line identification.
    * `RBVoiceService::setCurrentActiveCallLineIdentification` : This api allows user to set the current CLI.
    * `RBVoiceService::addMemberToGroup` : This part of the API allows a user having manager role on a group to add another user.
    * `RBVoiceService::deleteVoiceMessageAssociatedToAGroup` : Deletion of the given voice message.
    * `RBVoiceService::getVoiceMessagesAssociatedToGroup` : Returns the list of voice messages associated to a group. 
    * `RBVoiceService::getGroupForwards` : This API allows to get all cloud PBX group forwards.
    * `RBVoiceService::getTheUserGroup` : This API allows to retrieve the groups where the logged user is member.
    * `RBVoiceService::joinAGroup` : This part of the API allows a user to join a group. 
    * `RBVoiceService::joinAllGroups` : Allow a user to join all the groups he belongs to.
    * `RBVoiceService::leaveAGroup` : This part of the API allows a user to leave a group.
    * `RBVoiceService::leaveAllGroups` : Allow a user to leave all the groups he belongs to.
    * `RBVoiceService::removeMemberFromGroup` : This part of the API allows a manager to remove a member from a group.
    * `RBVoiceService::retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser` : Returns the number of read/unread messages for each hunting group where logged in user is a member.
    * `RBVoiceService::updateAVoiceMessageAssociatedToAGroup` : Update the given voice message - mark it as read or unread When a message is 'unread', it is considered as a new message.
    * `RBVoiceService::updateAGroup` : This API allows a manager of to group to modify some settings of a Cloud PBX hunting group.
    * `RBVoiceService::updateGroupForward` : This API allows to update the forwards of a cloud PBX group.
    * `RBVoiceService::updateGroupMember` : This part of the API allows a manager to update a member inside a group.
    * `RBVoiceService::activateDeactivateDND` : This API allows logged in user to activate or deactivate his DND state.
    * `RBVoiceService::configureAndActivateDeactivateForward` : This API allows logged in user to activate or deactivate a forward.
    * `RBVoiceService::retrieveActiveForwards` : This API allows logged in user to retrieve his active forwards.
    * `RBVoiceService::retrieveDNDState` : This API allows logged in user to retrieve his DND state.
    * `RBVoiceService::searchUsersGroupsContactsByName` : This API allows to retrieve phone numbers associated to Rainbow users, groups, Office365 contacts and external directories contacts.
    * `RBVoiceService::activatePersonalRoutine` : This api activate a user's personal routine.
    * `RBVoiceService::createCustomPersonalRoutine` : This api create a user's custom personal routine.
    * `RBVoiceService::deleteCustomPersonalRoutine` : This api delete a user's custom personal routine.
    * `RBVoiceService::getPersonalRoutineData` : This api returns a user's personal routine data.
    * `RBVoiceService::getAllPersonalRoutines` : This api returns all user's personal routines data.
    * `RBVoiceService::updatePersonalRoutineData` : This api updates a user's personal routine data, it's not possible to update the work routine, it contains memorized data before the activation of another routine.
    * `RBVoiceService::manageUserRoutingData` : This api allows user routing management.
    * `RBVoiceService::retrievetransferRoutingData` : For transfer, get addressee routing data.
    * `RBVoiceService::retrieveUserRoutingData` : This api returns user routing information.
    * `RBVoiceService::retrieveVoiceUserSettings` : Allows logged in user to retrieve his voice settings.
    * `RBVoiceService::addParticipant3PCC` : Adds a participant in a call, as a one step conference.
    * `RBVoiceService::answerCall3PCC` : This is a 3PCC answer call.
    * `RBVoiceService::blindTransferCall3PCC` : This is a 3PCC blind transfer call. Immediate transfer of an active call to a new destination.
    * `RBVoiceService::deflectCall3PCC` : This is a 3PCC deflect call. During ringing state, user transfer the call to another destination.
    * `RBVoiceService::holdCall3PCC` : This is a 3PCC hold call.
    * `RBVoiceService::makeCall3PCC` : This api makes a 3PCC call between 2 users.
    * `RBVoiceService::mergeCall3PCC` : This is a 3PCC merge call. Merge an held call into the active call (single call or conference call).
    * `RBVoiceService::pickupCall3PCC` : 3PCC pickup call can be used in case of manager/assistant context, when an assistant wants to pickup a call on a manager.
    * `RBVoiceService::releaseCall3PCC` : This is a 3PCC release call.
    * `RBVoiceService::retrieveCall3PCC` : This is a 3PCC retrieve call.
    * `RBVoiceService::sendDTMF3PCC` : This is a 3PCC send DTMF.
    * `RBVoiceService::snapshot3PCC` : This is a 3PCC Snapshot of the user's calls and devices.
    * `RBVoiceService::transferCall3PCC` : This is a 3PCC transfer call. Transfer the active call to the given held call.
    * `RBVoiceService::deleteAVoiceMessage` : Deletion of the given voice message.
    * `RBVoiceService::deleteAllVoiceMessages` : Deletion of all user's voice messages.
    * `RBVoiceService::getEmergencyNumbersAndEmergencyOptions` : This api returns emergency numbers the user can use (+ emergency options).
    * `RBVoiceService::getVoiceMessages` : Returns the list of voice messages.
    * `RBVoiceService::getUserDevices` : This api returns user devices information.
    * `RBVoiceService::updateVoiceMessage` : Update the given voice message - mark it as read or unread.
    * `RBVoiceService::forwardCall` : This api activates/deactivates a forward.
    * `RBVoiceService::getASubscriberForwards` : This api gets the user forwards.
    * `RBVoiceService::searchCloudPBXhuntingGroups` : This API allows to retrieve Cloud PBX Hunting Groups.

### [2.8.1] - 2022-02-07
-   Add `FileStorage::copyFileInPersonalCloudSpace` method to keep a copy of a file in my personal cloud space. 
-   Add `FileStorage::getFileDescriptorsByCompanyId` method to get all file descriptors belonging to a given companyId. 
-   Add `FileStorage::fileOwnershipChange` method to Drop the ownership of a file to another Rainbow user of the same company.
-   Update `AdminService.getAllCompanies` method with parameters to filter the requested companies.
-   Add `ContactsService::updateMyInformations` method to  update data of logged in user. This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL)
-   Add Customization templates methods : `AdminService::applyCustomisationTemplates` `AdminService::createCustomisationTemplate` `AdminService::deleteCustomisationTemplates` `AdminService::getAllAvailableCustomisationTemplates` `AdminService::getRequestedCustomisationTemplate` `AdminService::updateCustomisationTemplate`
-   Fix renew of token.  
-   Update `Contact::isObsoleteCache` method to avoid the remove of roster's contacts from cache. 

### [2.8.0] - 2022-01-28
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

### [2.7.0] - 2021-12-0
-   Update `CallLogService` `ChannelsService` `CallLogService` `ChannelsService` `FileStorage` with categories in the documentation.
-   Update `GroupsService` `ImsService` `InvitationsSerice` `PresenceService` `ProfilesService` `S2SService` `TelephonyService` with categories in the documentation.
-   Add `ProfilesService::getThirdPartyApps` to get The list of the Third Party Application that have access to this Rainbow Account. 
-   Add `ProfilesService::revokeThirdPartyAccess` to revoke the access of a third-party application from Rainbow. 

### [2.6.2] - 2021-12-02
-   Fix initialisation of _contactService in FileStorageService.
-   Add `Bubble::status` property which is the status of the connected user in the bubble ('invited', 'accepted', 'unsubscribed', 'rejected' or 'deleted'). The initial value is "none", it is not a real value.
-   Add `BubblesService::isBubbleArchived` method to check if the Bubble is an Archive state (everybody 'unsubscribed'). 
-   Add `BubblesService::getAllOwnedArchivedBubbles` method to get all the owned Bubbles in an Archive state (everybody 'unsubscribed'). 
-   Add `BubblesService::getAllOwnedNotArchivedBubbles` method to  get all the owned Bubbles which are NOT in an Archive state (everybody unsubscribed).
-   Add "unsubscribed=true" parameter to resquests to server about bubbles. Beside owner and invited/accepted users keep also unsubscribed users.
-   Update `AdminService` `AlertsService` `BubblesService` `ContactsService` `ConversationsService` with categories in the documentation.

### [2.6.1] - 2021-11-19
-   Fix `GroupsService::getGroupByName` and `GroupsService::getGroupById` methods.

### [2.6.0] - 2021-11-18
-   Add parameter `raiseLowLevelXmppInEvent` to SDK options to raise an event `rainbow_onxmmpeventreceived` when an XMPP stanza is received. The default value is false. 
-   Add parameter `raiseLowLevelXmppOutReq` to SDK options to raise an event `rainbow_onxmmprequestsent` when an XMPP stanza is sent. The default value is false.
-   Fix `AdminService::retrieveRainbowUserList` method.
-   Update conferences related methods documentation in BubblesService.
-   Add `rainbow_onbubbleconferenceupdated` event raised during conference life. See `Manage_conferences` documentation and `BubblesService` API for details.
-   Add `Manage_conferences` documentation for information about conferences.
-   Fix events documentation and low layer documentation.
-   Update `GroupsService::getGroupByName` method to search the group on server if not found in cache, so now the method is asynchronous and has a new `forceServerSearch` parameter.
-   Update `GroupsService::getGroupById` method to search the group on server if not found in cache, so now the method is asynchronous and has a new `forceServerSearch` parameter.
-   Update `Contact` property `roster` to false when the `rainbow_oncontactremovedfromnetwork` event is raised instead of removing the Contact from cache.
-   Add `Contact::isAlertNotificationEnabled` property which allow to know if a user is able to send/receiv an urgency message.
-   Update `AdminService::retrieveAllSubscriptionsOfCompanyById` API method with a format parameter to get "small","middle", or "full" data. 

### [2.1.0-lts.0] - 2021-10-10
-   Update grunt task `removedebugcode` to define the replaced tags in Gruntfile.js config instead of in the code. 
-   Add tags : `dev-code-console` and `dev-code-internal` to `removedebugcode` task.
-   Fix RESTService::synchronizeUsersAndDeviceswithCSV method.

### [2.5.1] - 2021-10-06
-   Remove `console.log` from models Classes
-   Add method `AdminService::importRainbowVoiceUsersWithCSVdata`. This API allows to perform provisioning for Rainbow Voice (Rainbow Users and Subscribers management + DDIs and Sip devices attachment) through a CSV UTF-8 encoded file.
-   Fix openning of XMPP websocket. Headers can not be settend by @xmpp/client lib, so put it as url query parameters : "x-rainbow-client" and "x-rainbow-client-version".
-   Update the logs of `STATUS_EVENT` events in `XMPPService`.

### [2.5.0] - 2021-09-13
-   Fix import of strip-ansi which is now a node module and not a commonjs anymore.
-   Fix `BubblesService::retrieveAllBubblesByTags` when multiple tags are passed in parameter.
-   Update `BubblesService::retrieveAllBubblesByTags` with `format` and `nbUsersToKeep` parameters to define the retrieve more or less room details in response.
-   Add Management of "Client Version" : `AdminService::createAClientVersion` `AdminService::deleteAClientVersion` `AdminService::getAClientVersionData` `AdminService::getAllClientsVersions` `AdminService::updateAClientVersion`. These api are used to manage the minimal required version for a given client application (by AppID).
-   Add methods in RESTService to deal with Rainbow Voice system (not yet available on API).
-   Add property in options passed to SDK : {boolean} options.im.copyMessage to manage if the Messages hint should not be copied to others resources (https://xmpp.org/extensions/xep-0334.html#no-copy) . The default value is true.
-   Add property in options passed to SDK : {boolean} options.im.enableCarbon to manage carbon copy of message (https://xmpp.org/extensions/xep-0280.html). The default value is true.
-   Add "x-rainbow-client" "x-rainbow-client-version" properties in Headers of every requests to make stats.
-   Fix `AdminService::getCSVTemplate` method.

### [2.4.0] - 2021-09-13
-   Update typescript lib `es2017` to `es2019`
-   Update `ImsService::sendMessageToConversation` with a new 'content' parameter to update message with a typed message.
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
-   Fix typo in methods `AdminService::retrieveAllSubscribtionsOfCompanyById` to `AdminService::retrieveAllSubscriptionsOfCompanyById` and `AdminService::getSubscribtionsOfCompanyByOfferId` to `AdminService::getSubscriptionsOfCompanyByOfferId`
-   Update `ContactsService::getContactByLoginEmail` method with a new parameter `forceServerSearch` boolean to force the search of the _contacts informations on the server.
-   Remove the "Authorization" property from http headers when openning the XMPP socket.
-   Add `ContactsService::getMyInformations` API to Get informations about the connected user.
-   Update stop of logger to stop winston library.
-   Fix the XMPPService (handleXMPPConnection) when ERROR_EVENT happenned to stop the ping timer only when the error is a fatal one.
-   Change to keep DEBUG with "logs.system-dev.*" in STS delivery. Do not forget that when properties of this section are setted then personnal datas are displayed in logs, so it is not RGPD compatible.is Do not activate it in production systems.  

### [2.3.0] - 2021-08-13
-   Add event `rainbow_onwebinarupdated` fired when a webinar update event is received.
-   Add `WebinarService` to manage Webinars.

### [2.2.0] - 2021-06-28
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

### [2.1.1] - 2021-06-10 
-   Fix remove wrong copy/paste of hard coded "https://openrainbow.com" string in some CloudPBX methods.
-   Add `AdminService::createASite` API that allows administrators to create a site for a company they administrate.
-   Add `AdminService::deleteSite` API that allows administrators to delete a site by id for a company they administrate.
-   Add `AdminService::getSiteData` API that allows administrators to get a site data by id for a company they administrate.
-   Add `AdminService::getAllSites` API that allows administrators to get all sites for a company they administrate.
-   Add `AdminService::updateSite` API that allows administrators to update a given site by id for a company they administrate.

### [2.1.0] - 2021-06-09
-   Fix delivery issue.
-   Authorized the method "cleanMemoryCache" to be called when services are not connected (in Utils::isStarted).
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

### [2.0.1-lts.2] - 2021-07-01
-   Fix export of `DataStoreType` in NodeSDK.  

### [2.0.1-lts.1] - 2021-05-20
-   Fix delete of item in `ContactsService::cleanMemoryCache ` method.

### [2.0.0-lts.1] - 2021-05-20
-   Authorized the method "cleanMemoryCache" to be called when services are not connected (in Utils::isStarted).
-   Fix null Contact in `ContactsService::cleanMemoryCache()` method.
-   Fix S2SService::stop method.
-   Fix quotes in generated version.json file. 

### [2.0.0] - 2021-04-20
-   Add Jenkinsfile-sts.groovy file for the delivery of STS Verstion with a jenkins pipeline job.
-   Add Jenkinsfile-lts.groovy file for the delivery of LTS Verstion with a jenkins pipeline job.
-   Update API Documentation
-   First official STS Version.

### [1.87.0-test.16] - 2021-04-20
-   Add STSDelivery branch.

### [1.87.0-test.0] - 2021-04-16
-   Add STS version build.

### [1.86.0-dotnet.1] - 2021-04-01
-   Add what's new.

### [1.86.0-dotnet.0] - 2021-04-01
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

### [1.85.1] - 2021-03-18
-   Delivery 1.85.0 failed, so new one.

### [1.85.0] - 2021-03-18
-   Delivery to production.

### [1.85.0-dotnet.1] - 2021-03-17
-   Update methods `groups.getGroups()`, `BubblesService::getBubbles()`, `FileServerService::init`, `FileStorageService::init` to return a succeed event if the requests to server failed. To avoid the start to failed.
-   Update of the `dependencies`.
-   Fix XmppClient when sent iq failed at re-startup.
-   Activate DEBUG of `request` library when "logs.system-dev.http" is setted to true. It is only available on rainbow-node-sdk from sources or from debug npm package.
-   Fix Return types in documentation. 

### [1.85.0-dotnet.0] - 2021-03-09
-   Fix ContactsService::getRosters api to not reset the contacts cache, but to update contacts from data received from server.
-   Update events `rainbow_onpresencechanged` and `rainbow_oncontactpresencechanged`  with new properties `until` and `delay`.
-   Add `until` propertie in the presence event of contacts to give the validity date of the calendar presence.
-   Add PATCH verb in HttpService
-   Add `PresenceService::getCalendarState` Allow to get the calendar presence of the connected user.
-   Add `PresenceService::getCalendarStates`  Allow to get the calendar presence of severals users.
-   Add `PresenceService::setCalendarRegister` Register a new calendar.
-   Add `PresenceService::getCalendarAutomaticReplyStatus` Allow to retrieve the calendar automatic reply status.
-   Add `PresenceService::enableCalendar` Allow to enable the calendar.
-   Add `PresenceService::disableCalendar` Allow to disable the calendar.
-   Offline presence of contacts in the roster.
-   Update methods `ProfilesService::init` to return a succeed event if the requests to server failed. To avoid the start to failed. 

### [1.84.0] - 2021-02-22
-   Add API methods `AlertsService::renameDevicesTags` `AlertsService::deleteDevicesTags` `AlertsService::getstatsTags` to manage Tags in Alerts.

### [1.84.0-dotnet.1] - 2021-02-18
-   Update method `channelsService::fetchMyChannels` with a new `force` parameter to allow the force of getting the channels informations from server. 
-   Update method `channelsService::fetchChannelItems` with a new parameters `maxMessages`=100 : number of messages to get, 100 by default. `beforeDate` [optional] : show items before a specific timestamp (ISO 8601 format), `afterDate` : show items after a specific timestamp (ISO 8601 format).
-   Fix method `channelsService::fetchChannelItems` to realy return the last posted messages if the channels contents more than maxMessages. 

### [1.84.0-dotnet.0] - 2021-02-17
-   Add treatment of Urgency messages Events
-   Add parameter urgency of the message sent in API Methods `ImsService::sendMessageToJid` `ImsService::sendMessageToJidAnswer` `ImsService::sendMessageToBubble` `ImsService::sendMessageToBubbleJid` `ImsService::sendMessageToBubbleJidAnswer` `ImsService::sendMessageToContact` `ImsService::sendMessageToConversation` . The urgence of the message value can be : 'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message.
-   Refactor the way the HTTP requests are limited. Now use the `request-rate-limiter` library which is a simple leaky-bucket based request rate limiter.
-   Add a `requestsRate` section in SDK's Options for the configuration of the `request-rate-limiter`. Defaults values :
-   "requestsRate":{ </br>    
        "maxReqByIntervalForRequestRate": 600, // nb requests during the interval. </br>  
        "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit. </br>  
        "timeoutRequestForRequestRate": 600 // nb seconds Request stay in queue before being rejected if queue is full. </br>  
    },   </br>  
-   Add property `AlertDevice::domainUsername` for filtering alerts by domain username of the device.
-   Add ConversationsService::getContactsMessagesFromConversationId method to retrieve messages exchanged by contacts in a conversation. The result is the messages without event type.  

### [1.83.0] - 2021-02-03
-   Add containerId and containerName in Bulle type. It is the folder where the bubble is stored in.
-   Add events `rainbow_onbubblescontainercreated` `rainbow_onbubblescontainerupdated` `rainbow_onbubblescontainerdeleted` fired when a container of bubbles event is received.
-   Add API in BubblesService for managing containers and add/remove bubbles in it (`getAllBubblesContainers`, `getABubblesContainersById`, `addBubblesToContainerById`, `updateBubbleContainerNameAndDescriptionById`, `createBubbleContainer`, `deleteBubbleContainer`, `removeBubblesFromContainer`).
-   Add `GenericHandler::getJsonFromXML` method to get JSON from xml server's events. It provided ability to decode events in JSON in insteadOf manually decode XML.
-   Fix `contactsService::getRosters` method to reset the _contacts list before getting the list from server, to avoid multiple additional of a contact.  

### [1.83.0-dotnet.2] - 2021-02-01
-   Update getConnectionStatus api to add in the return a value of `nbReqInQueue` the number of requests waiting for being treated by the HttpManager.
-   Fix getHistory when the conversation contain no message.
-   Use of `Alert`, `AlertsData` types of result of API in `AlertsService`.

### [1.83.0-dotnet.1] - 2021-01-29

### [1.83.0-dotnet.0] - 2021-01-29
-   Use of `AlertFilter`, `AlertFiltersData`, `AlertTemplate`, `AlertTemplatesData`, `AlertFilter`, `AlertFiltersData`, types of result of API in `AlertsService`.
-   Update of `rainbow_onmessagereceived` event with the `mentions` tab. It is to indicate the contacts mentioned in the message.
-   Fix of initial bubble presence when the SDK is restarted.
-   Fix build in Makefile for the docs of the HUB.

### [1.82.0] - 2021-01-22
-   Add stack traces when using winston logger. 
-   Update doc generation for `Alert, AlertDevice, AlertFilter, AlertMessage, AlertTemplate`.
-   Add "Alert Custom" offer in `AdminService::subscribeCompanyToAlertOffer` and `AdminService::unSubscribeCompanyToAlertOffer` .
-   Fix `AlertsService::createOrUpdateAlert` API for name and description properties.
-   Use of `AlertDevice` type in the result of `AlertsService::createOrUpdateDevice, AlertsService::deleteDevice, AlertsService::getDevice, AlertsService::getDevices` to represent an Alert Device.
-   Use of `AlertDeviceData` type in `AlertsService::getDevices` result to represent a list of Alert Devices.

### [1.82.0-dotnet.3] - 2021-01-19
-   Update the imported lib.
-   Split the grunt build in two steps : Step 1 : `grunt` : to compil the sources, Step 2 : `grunt delivery` : To pepare the sources + doc for package

### [1.82.0-debug.0] - 2021-01-15
-   Update the Web site column in Foss file.
-   Update the grunt task "debug" to be able to deliver a version with debug logs.

### [1.82.0-dotnet.2] - 2021-01-14
-   Update foss

### [1.82.0-dotnet.1] - 2021-01-14
-   Idem

### [1.82.0-dotnet.0] - 2021-01-14
-   Add `generateFoss` grunt task to update the FOSS during delivery process.

### [1.81.1] - 2021-01-06
-   Fix issue when login failed. 

### [1.81.0] - 2021-01-06
-   Add in Contact property {String} `selectedTheme` Set the selected theme for the user. 
-   Add in Contact property {Object} `customData` User's custom data.
-   Add event `rainbow_onuserinformationchanged` when the properties of the connected user are changed on server side.
-   Add properties `selectedTheme, customData` in `AdminService::updateContactInfos` API method parameters.
-   Add API methods to get users `AdminService::getAllUsersByCompanyId` to get all users for a given admin in a company and `AdminService::getAllUsersBySearchEmailByCompanyId` to get all users for a given admin in a company by a search of string in email .

### [1.81.0-dotnet.0] - 2020-12-17
-   Add the property `FileDescriptor::md5sum` : md5 of the file getted from the backend file storage. This value is not filled at the first retrieve of all files. To get this property filled you need to call the retrieveOneFileDescriptor API.
-   Continue progress of coding AlertsService
-   Fix `fileStorage.uploadFileToConversation` method to return the error when the file provided in parameter does not exist.
-   Add event `rainbow_onalertmessagereceived` when an alert is received from server.
-   Fix `AlertsService::createAlert` method about date and no provided parameters.
-   Fix documentation.

### [1.80.0] - 2020-12-02
-   Update messageMaxLength option default value to 16384.

### [1.80.0-dotnet.3] - 2020-11-27
-   Add SDK parameter in log section : `enableEventsLogs`: false, Activate the logs to be raised from the events service (with `onLog` listener).

### [1.80.0-dotnet.2] - 2020-11-26
-   Change the max value of nbHttpAdded to Number.MAX_SAFE_INTEGER
-   Update getConnectionStatus() method to return the status of the queue of HTTP requests :
-   `nbHttpAdded`: number, the number of HTTP requests (any verb GET, HEAD, POST, ...) added in the HttpManager queue. Note that it is reset to zero when it reaches Number.MAX_SAFE_INTEGER value.
-   `httpQueueSize`: number, the number of requests stored in the Queue. Note that when a request is sent to server, it is already removed from the queue.
-   `nbRunningReq`: number, the number of requests which has been poped from the queue and the SDK did not yet received an answer for it.
-   `maxSimultaneousRequests` : number, the number of request which can be launch at a same time.

### [1.80.0-dotnet.1] - 2020-11-26
-   Add HttpManager class to manage a promised queue of request to the server. It allow to have a queue of request and then avoid to much concurrents one.
-   Initial use HttpManager with first method HttpService::get .
-   Treat the HttpService methods getUrl, post, head, put, putBuffer, delete with the HttpManager queue.
-   Add label in RequestForQueue for logs.
-   Fix HttpManager treatment in treatHttp with the started boolean when a restart of the SDK is happen.
-   Add property "concurrentRequests" in options.rainbow section parameter of the SDK to define the number of allowed concurrent request running in the HttpManager queue.

### [1.79.2] - 2020-11-18
-   Same as 1.80.0-dotnet.0

### [1.80.0-dotnet.0] - 2020-11-19
-   Fix XMPP resource name to have the string "node_" at the beginning of it.
-   Fix presence events. The presence event are all raised even if the aggregated contact.presence do not change, and only the resources property (with  detailed presence) is updated.

### [1.79.1] - 2020-11-18
-   Fix offline and invisible events for connected user and also for contacts in the roster.

### [1.79.0] - 2020-11-13
-   Add requestType in get of HttpService.
-   Add RESTService::getPartialBufferFromServer method to retrieve a peace of data from server.
-   Fix in presenceEventHandler the offline presence of a contact in the roster.
-   Add FileServerService::getBlobFromUrlWithOptimizationObserver method to retrieve a file and store it in a path. An Observer is returned to follow the download progress.
-   Add FileStorageService::downloadFileInPath method to retrieve a file and store it in a path. An Observer is returned to follow the download progress.
-   Fix FileStorageService::downloadFile for big files. So the returned Object.buffer is modified to an Array of data.

### [1.79.0-dotnet.0] - 2020-11-04
-   Update the AlertsService documentation

### [1.78.1] - 2020-11-04
-   Start to add the alert system.
-   Add autoLoadConversations option to activate the retrieve of conversations from the server. The default value is true.
-   Add autoLoadContacts option to activate the retrieve of contacts from roster from the server. The default value is true.
-   Update the XMPPService::markMessageAsReceived with a parameter conversationType to define the type of message marked as read.
-   Add AdminService::subscribeCompanyToAlertOffer and AdminService::unSubscribeCompanyToAlertOffer to manage the subscription to "Alert Demo" features.

### [1.78.0] - 2020-10-15
-   Add TelephonyService::getMediaPillarInfo method to retrieve the Jabber id of the Media Pillar linked to the system user belongs to.

### [1.78.0-dotnet.1] - 2020-10-15
-   Add `AdminService::getUserPresenceInformation` method to get user presence information.
-   Refactor the way the presence is sent in bubble at startup with a BubblesManager. Presence is now sent it by group of bubbles, and there is a timer when it failed to avoid flood of server.
-   Move the `XMPPService::handleXMPPConnection` method from the constructor to be a fully class method.

### [1.78.0-dotnet.0] - 2020-10-07
-   Add option `autoInitialBubblePresence` to allow automatic opening of conversation to the bubbles with sending XMPP initial presence to the room. Default value is true.
-   Add BubblesManager class which will be used to join bubbles by pool with initial XMPP presence.
-   Add decode of calendar event with isFromCalendarJid

### [1.77.0] - 2020-09-30
-   Add Body in HttpService::delete request.
-   Extract method from RESTService constructor to core of the class.
-   Add BubblesService::setTagsOnABubble to Set a list of tags on a {Bubble}.
-   Add BubblesService::deleteTagOnABubble to Delete a single tag on a list of {Bubble}. If the list of bubble is empty then every bubbles are concerned.
-   Add in bubble presence event the property statusCode to "disconnected" if status is "332". it is disconnected from room because of a system shutdown

### [1.77.0-dotnet.0] - 2020-09-23
-   Update treatment of error event in XMPPService::handleXMPPConnection of the default condition to avoid wrong stop of SDK, so we ignore it.
-   Add pretty-data logs of xml data.
-   Add in classes the method `getClassName` and refactor `Utils::logEntryExit` method to log the name of class in front of method name when used in 'source debug mode'
-   Refactor conversationEventHandler and conversationHistoryHandler to extract callback definitions from constructor.
-   Add `answeredMsg, answeredMsgId, answeredMsgDate, answeredMsgStamp` properties in messages received in XMPP event and in history when it is a reply to a previous message (defined by these properties).
-   Add method `conversations::getOneMessageFromConversationId` To retrieve ONE message archived on server exchanged in a conversation based on the specified message Id and the timestamp (both are mandatory for the search)
-   Refactor logs to show XML of event's node instead of unreadable Element structure.
-   Add `mute` property in Channel object.
-   Move events callbacks from constructors of classes to get types.
-   Add NodeSDK::getConnectionStatus API to get connections status of each low layer services, and also the full SDK state.
-   Fix RainbowNodeSDKNews.md


### [1.76.0] - 2020-09-09
-   Add event `rainbow_onopeninvitationupdate` to return the informations about a management event on a public URL share of a bubble.
-   Add method `BubblesService::getBubblesConsumption` to get an object describing the consumption of number active bubbles.
-   Update methods : `BubblesService::createPublicUrl` `BubblesService::generateNewPublicUrl` `BubblesService::removePublicUrl` to get a Bubble in parameter instead of an Id.
-   Fix retrieveAllBubblesByTags method to get the bubbles filtered by a list of tags.of
-   Add RainbowNodeSDKNews.md guide to explain how to keep informed.

### [1.76.0-dotnet.0] - 2020-09-02
-   Update method BubblesService::registerGuestForAPublicURL method.

### [1.75.0] - 2020-08-19
-   Add method BubblesService::registerGuestForAPublicURL to register a guest user with a mail and a password and join a bubble with a public url.
-   Add tags data in Bubbles type

### [1.75.0-dotnet.1] - 2020-08-13
-   Idem 1.75.0-dotnet.0

### [1.75.0-dotnet.0] - 2020-08-13
-   Refactor `reconnect` code for xmpp lost connection to avoid multiple simultaneous tries to reconnect from low layer (@xmpp/reconnect plugging)

### [1.73.0] - 2020-07-08
-   Add methods `BubblesService::conferenceStart`, `BubblesService::conferenceStop` to start/stop the webrtc conference include in a bubble (Note that a premium account is need for this API to succeed).
-   Add the events rainbow_onbubbleconferencestartedreceived rainbow_onbubbleconferencestoppedreceived when a webrtc conference start/stop.

### [1.73.0-dotnet.0] - 2020-06-26
-   Add in method `AdminService::createCompany` parameter offerType. It's the company offer type. Companies with `offerType=freemium` are not able to subscribe to paid offers, they must be premium to do so.
-   Add Offers and subscriptions management in AdminService. Add methods : `retrieveAllOffersOfCompanyById, retrieveAllSubscribtionsOfCompanyById, getSubscribtionsOfCompanyByOfferId, subscribeCompanyToOfferById, subscribeCompanyToDemoOffer, unSubscribeCompanyToDemoOffer, unSubscribeCompanyToOfferById, subscribeUserToSubscription, unSubscribeUserToSubscription`.
-   Add method `S2SService::checkS2Sconnection` to give the ability to check the S2S connection with a head request.

### [1.72.0] - 2020-17-06
-   Add methods `BubblesService::getInfoForPublicUrlFromOpenInvite`, `BubblesService::getAllPublicUrlOfBubbles`, `BubblesService::getAllPublicUrlOfBubblesOfAUser`, `BubblesService::getAllPublicUrlOfABubbleto`, to retrieve the public URL of bubbles.

### [1.72.0-dotnet.1] - 2020-12-06
-   Add methods to manage public url access to bubbles. So a Guest or a Rainbow user can access to it just using a URL. `bubblesService::createPublicUrl`, `bubblesService::generateNewPublicUrl`, `bubblesService::removePublicUrl`.
-   Fix when sendPresence in S2S mode did not return any data.

### [1.72.0-dotnet.0] - 2020-05-26
-   Fix of jenkins job for delivery

### [1.71.0] - 2020-05-07
-   Fix `unavailable` stanza to be well understood by Web UI

### [1.71.0-dotnet.0] - 2020-04-26
-   Add `altitude` in `geoloc` field of received messages.
-   Add `publishResult` field in the result of `ChannelsService::publishMessage` API. It now contents the `id` of the created item. Nice to likeItem, deleteItem...
-   Fix the call of likeItem in postChangeLogInChannel.
-   Fix RESTService::getDetailedAppreciations url
-   Fill the oob property in received message in S2S mode. It is the description of an attached file to the message (if provided).
-   Add date of generation of doc in documentation

### [1.70.0] - 2020-04-16
-   Add a `PresenceRainbow` class to store the presence of a contact.
-   Fix presence in `presenceService` for the `Contact` class (take care may have change with "xa/away", "busy/dnd").

### [1.70.0-dotnet.0] - 2020-04-16
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
-   Add in methods `ContactsService::getContactById`, `ContactsService::getContactByJid`, `ContactsService::getContactByLoginEmail`, `ContactsService::getContact` the presence if the requested user is the connected one.
-   Add in Message received from server a field "geoloc: { datum: 'WGS84', latitude: '4x.567938', longitude: '-4.xxxxxxx' }" of the localisation sent in messages by a mobile.
-   Move `index.js` to `src/index.ts` => become a typescript source file.
-   Update libs to lastest version : `ncu -u` , so update sitemap library => fix sitemap_generation
-   Add a Sample project `usingrainbownodesdkrelease` to github to use the Rainbow-Node-SDK with typescript lib : https://github.com/Rainbow-CPaaS/usingrainbownodesdkrelease

### [1.69.0] - 2020-03-30
-   Add nextDebugBuildVersion program to generate to stdout a new debug version of  rainbow-node-sdk

### [1.69.0-dotnet.2] - 2020-03-23
-   Same as 1.69.0-dotnet.0 (Failed of production)

### [1.69.0-dotnet.1] - 2020-03-23
-   Same as 1.69.0-dotnet.0 (Failed of production)

### [1.69.0-dotnet.0] - 2020-03-23
-   Rename document Connecting_to_Rainbow to Connecting_to_Rainbow_XMPP_Mode.
-   Add document Connecting_to_Rainbow_S2S_Mode to describe the connection to Rainbow with a S2S event pipe.
-   Official ChangeLog RSS Flow URL : https://hub.openrainbow.com/doc/sdk/node/api/ChangeLogRSS.xml
-   Fix empty message list in conversation when conversationEventHandler::onConversationManagementMessageReceived event.
-   Move S2SService to service layer and folder
-   update S2S documentation.
-   Add the parameter role (Enum: "member" "moderator" of your role in this room) in joinroom in S2S
-   Fix S2SServiceEventHandler::ParseRoomInviteCallback
-   Fix error when delete conversation.

### [1.68.0] - 2020-03-06
-   Change default value of storeMessages SDK's parameter to true. Because the no-store is not fully supported by officials UI.

### [1.68.0-dotnet.1] - 2020-03-04
-   Add isFavorite in Conversation.
-   Move bubbles._sendInitialBubblePresence to presence.sendInitialBubblePresence.
-   change start methods prototype of services to replace each services in parameters to only one param the Core object.
-   Add methods in RESTService :: sendS2SMessageInConversation, getS2SServerConversation, joinS2SRoom.
-   Add methods in S2SService :: sendMessageInConversation, joinRoom.
-   Add events treatment S2SServiceEventHandler :: ParseChatStateCallback, ParseReceitpCallback, ParseAllReceitpCallback, ParseConversationCallback, ParseMessageCallback,
ParseRoomInviteCallback, ParseRoomMemberCallback, ParseRoomStateCallback, ParseAlldeletedCallback, ParseErrorCallback.
-   Add  method in ConversationsService::getS2SServerConversation to get a conversation from id on S2S API Server.
-   Raise event on message when the content is empty (because message can have a subject filled without body)  in conversationEventHandler.
-   raise an event when receive a conversation unknown by sdk deleted in conversationEventHandler.
-   Update ImsService::sendMessageToConversation api to send the message in S2S mode.
-   Add postTestRunOpenrainbowDotNet script to post a message in a bubble when the tests for afterbuild start/stop.
-   Fix "no-store" value in DataStoreType type.
-   Update the event's data with the subject property when a Message arrive.
-   Fix presence for S2SServiceEventHandler.
-   Add original url in HttpService errors to help the following.
-   Update in the S2SServiceEventHandler the event handler for a received message with the `shouldSendReadReceipt` SDK parameter to automatically mark as read a received message.
-   Fix the stanza "presence" to desactivate history for room on server side.

### [1.67.1] - 2020-02-19
-   Fix login issue when Rainbow CLI use SDK.

### [1.67.0] - 2020-02-19
-   Fix typo error in Gruntfile.js file for the generated documentation of the invitations service. And fix documentation.
-   Move the methods `BubblesService::resizeImage` and `BubblesService::getBinaryData` to module Utils.ts .
-   Add method `FileStorageService::uploadFileToStorage` to Send a file in user storage.
-   RQRAINB-2870 Add `ConversationsService::deleteAllMessageInOneToOneConversation` method to delete all messages in ONE2ONE conversation.
-   RQRAINB-2984 Treat the XMPP Errors conditions provided by the XMPP RFC : https://xmpp.org/rfcs/rfc6120.html#streams-error .
-   Add `Bubble::autoAcceptationInvitation` property received from server.
-   RQRAINB-2868 Add property `Message::attention` Boolean to indicate if the current logged user is mentioned in the message.
-   RQRAINB-2868 Add parameter mention to API `ImsService::sendMessageToBubble` `ImsService::sendMessageToBubbleJid` `ImsService::sendMessageToBubbleJidAnswer` which contains an array list of JID of contacts to mention or a string containing a single JID of one contact.
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
-   Add properties `_options, _useXMPP, _useS2S, _s2s` in all SDK's services to select S2S or XMPP behaviour of API.
-   Start parse S2S events in S2SServiceEventHandler
-   Refactor for private members of services.
-   Fix retrieve at startup of the previous presence saved in settings service, and use it.


### [1.66.1] - 2020-01-29
-   Fix when the SDK is already stopped when stop method is called, then return a succeed. (CRRAINB-10270: CPaaS Node SDK - Chief bot demo wasn't unable to restart after connection issue)
-   Add BubblesService::getUsersFromBubble to get the actives users of a bubble.
-   Fix the parameter type sent by events `rainbow_onbubbledeleted` and `rainbow_onbubbleownaffiliationchanged`. It is now `Bubble` insteadOf `Promise<Bubble>`.

### [1.66.0] - 2020-01-28
-   Add correlatorData et GlobaleCallId properties in Call type of phone calls : RQRAINB-2773, RQRAINB-2784, RQRAINB-2784, RQRAINB-2789, RQRAINB-2793, RQRAINB-2793, RQRAINB-2799
-   Fix method ChannelsService::createItem when parameter "type" is setted.
-   Split Xmmpp error event treatment in 3 possibilities:
    * Errors which need a reconnection
    * Errors which need to only raise an event to inform up layer. => Add an event `rainbow_onxmpperror` to inform about issue.
    * Errors which are fatal errors and then need to stop the SDK. => Already existing events `rainbow_onerror` + `rainbow_onstop`.
-   Work done on private method BubblesService::joinConference (Not finish, so not available).
-   Update Bubble::users property ordered by additionDate.
-   Fix ordered calllogs (`orderByNameCallLogsBruts`, `orderByDateCallLogsBruts`).

### [1.65.2] - 2020-01-10
-   remove an unwanted log

### [1.65.1] - 2020-01-09
-   remove an unwanted log

### [1.65.0] - 2020-01-08
-   Treat the Replace/conflict XMPP event received. This event means a sixth connection to server happens, only five simultaneous are possible. The oldest one is disconneted. The treatmeant is to stop the reconnect process, and stop the SDK. Events `rainbow_onerror` and  `rainbow_onstopped` are raised. **Note : The SDK is not any more connected, so the bot is offline**.
-   Refactor handling of the process "unhandledRejection" "warning" "uncaughtException".
-   Fix fill of properties Contact.companyId and Contact.companyName.
-   Forbid the sent over the XMPP socket if closed (XmppClient::socketClosed)
-   Update the use of types.
-   Fix datas of channel when fetched.
-   When Contacts::getContactByLoginEmail, force to get data from server if the contact is not found in local cache by mail.
-   Add method Presence::getUserConnectedPresence to get connected user's presence status calculated from events.
-   Move treatment of invitations events from Conversation/Contacts services to invitations service.
-   Retrieve less information about conversation at startup to increase it. The behavior is manage by the `conversationsRetrievedFormat` option in `im` section provided to NodeSdk intance.
-   Add the `storeMessage` parameter : message hint should not be stored by a server either permanently (as above) or temporarily. E.g. for later delivery to an offline client, or to users not currently present in a chatroom.
-   Add a new event `rainbow_onsendmessagefailed` fired when a chat message with no-store attribut sent has failed (ex: remote party offline).
-   Add a build of RSS fill of the changelog (available on https://hub.openrainbow.com/doc/sdk/node/api/ChangeLogRSS)
-   Add automatic version of the SDK in jsdoc of service's classes.
-   Add BubblesService::archiveBubble method to  close the room in one step. The other alternative is to change the status for each room users not deactivated yet. All users currently having the status 'invited' or 'accepted' will receive a message/stanza .
-   Typescript improvement.
-   Add CDD methods in TelephonyService : logon, logoff, withdrawal, wrapup.
-   Add the ability to login with a token to the Rainbow Node SDK (token parameter to SDK start method.).
-   Fix MaxListenersExceededWarning issue about too much listener registred.
-   Add a program using the SDK to post changelog in a channel. Should be used in jenkins job delivery.
-   Fix onFileManagementMessageReceived when a file created to store the filedescriptor in internal list
-   Add event `evt_internal_bubbleavatarchanged` raised when a bubble is updated with a new avatar
-   Add avatar property in Bubble class. This is the URL to download the avatar . Note that it can spot on an empty file if no avatar has been setted.
-   Add BubblesService::promoteContactToModerator Promote a contact to moderator in a bubble
-   Add BubblesService::demoteContactFromModerator Demote a contact to user in a bubble
-   Add BubblesService::getAvatarFromBubble Get A Blob object with data about the avatar picture of the bubble.
-   Add BubblesService::updateAvatarForBubble  Update the bubble avatar (from given URL). The image will be automaticalle resized.
-   Add BubblesService::deleteAvatarFromBubble Delete the bubble avatar
-   Add private methods in BubblesService : randomString, setAvatarBubble, deleteAvatarBubble, resizeImage, getBinaryData
-   Add BubblesService::updateCustomDataForBubble Update the customData of the bubble
-   Add BubblesService::deleteCustomDataForBubble Delete the customData of the bubble
-   Add BubblesService::updateDescriptionForBubble Update the description of the bubble. (it is the topic on server side, and result event)
-   Add BubblesService::openConversationForBubble Open a conversation to a bubble
-   Add `rainbow_onmediapropose` event raised when a WEBRTC `propose` event is received for a media. It allows to know an incommingcall is arriving.
-   Add in Bubble the property `owner`, boolean saying the connected user is the owner or not of the Bubble.
-   Add in Bubble the property `ownerContact`, Contact object which is the owner of the Bubble.
-   Add event `rainbow_onbubbleprivilegechanged` raised when a privilege is changed on a Bubble.
-   Add method BubblesService::refreshMemberAndOrganizerLists called when treating a Bubble to fill members and organizers of a Bubble
-   Add the documentation for the CallLogService.
-   Add a parameter `nbMaxConversations` to the initialization of the SDK to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.
-   Put async/await in treatment of  `BubblesService::addOrUpdateBubbleToCache`
-   Add option rateLimitPerHour for the SDK to set the maximum of message stanza sent to server by hour. Default value is 1000.

### [1.64.2] - 2019-11-26
-   rebundle of the 1.64.0 version with the same content.

### [1.64.0] - 2019-11-20
-   Fix of the Presence::setPresenceTo to follow the server presence type.
-   Doc update

### [1.63.2] - 2019-11-14
-   Fix comment for admin::createCompagny, Country is mandatory.
-   Add method bubbles::inviteContactsByEmailsToBubble to Invite a list of contacts by emails in a bubble.
-   Fix stop of the services if the SDK did not been started before.

### [1.63.1] - 2019-11-06
-   Add start duration in result of start.
-   Use argumentsToStringReduced for internal dev logs and argumentsToStringFull for package built with grunt
-   Fix to much logs in TelephonyService::getCallFromCache
-   Fix TelephonyService Call instance creation on few methods.
-   Fix data received from server in TelephonyService::holdCall,retrieveCall,makeConsultationCall
-   Add a BubblesService::joinConference method to do some tests

### [1.63.0] - 2019-10-31
-   Fix Options.ts the start up service requested to start when it is not already present in default config.
-   Add bubble.lastActivityDate property : Last activity date of the room (read only, set automatically on IM exchange)
-   Fix ts build
-   Reduce logs in dev mod
-   Add Message factory
-   Update stripcode to put the unneeded code in production env in comment during grunt build for delivery.
-   Add listenning of system's signals "SIGINT", "SIGQUIT", "SIGTERM" for automatic call of stop on the rainbow intance.
-   Fix Makecall when the user doesn't have telephony.
-   Fix value Contact.id and Contact._id were sometime not filled
-   Fix onDivertedEvent callback
-   Fix some missing return when reject Promise.
-   Remove unused singleton in RESTTelephony
-   Refactor _entering_ _existing_ logs in services and in some other classes

### [1.62.0] - 2019-10-07
-   Typescript improvement

### [1.61.3] - 2019-10-08
-   Fix issue in Contact.ts to be compatible with previous datas names.

### [1.61.2] - 2019-09-18
-   Fix issue when an http request failed with a no-JSON body.
-   Add in the proxy section of option parameter : `secureProtocol: "SSLv3_method"` : The parameter to enable the SSL V3.

### [1.61.1] - 2019-09-18
-   Same content than 1.61.0

### [1.61.0] - 2019-09-18
-   Update the logs to remove all people data.
-   CRRAINB-7686 : Fix code for the 'read' receipt sent automatically to the sender when the message is received.
-   Add the ability to start services one by one. To avoid the calls to unnecessary pay API on server.
-   Add event `rainbow_onconferenced` fired when a conference event is received.


### [1.60.0] - 2019-08-28
-   Add method getStatusForUser in Bubble class to get the status of a user in the bubble
-   Update the "leaveBubble" method to unsubscribe form a bubble if not already unsubscribed the connected user. Else delete it from bubble.
-   Fix file url in XMPPService::sendChatExistingFSMessage and XMPPService::sendChatExistingFSMessageToBubble methods
-   Add method BubblesService::getStatusForConnectedUserInBubble to Get the status of the connected user in a bubble
-   Fix ImsService::getMessageFromBubbleById method
-   Add shortFileDescriptor property in message return by ImsService::getMessageFromBubbleById method

### [1.59.0] - 2019-08-12
-   Add in AdminService the method to get all users for a given admin
-   Update method BubblesService::unsubscribeContactFromBubble to send an event when the request to unsubscribe a user from a bubble succeed at end of the microservice call. Because sometimes the xmpp server does not send us the resulting event. So this event change will be sent twice time.
-   Add options::im::sendMessageToConnectedUser option to allow SDK to send a message to it self.
-   Add logs when an error occurred in XmppClient::send.

### [1.58.0] - 2019-07-10
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

### [1.57.0] - 2019-06-18
-   RQRAINB-1550 : Add AdminService::getContactInfos method to retrieve informations about a user (need to be loggued in as a admin)
-   RQRAINB-1550 : Add userInfo1 and userInfo2 value in Contact but it can only be filled for the current user himself and AdminService::getContactInfos methods
-   RQRAINB-1550 : Add AdminService::updateContactInfos :  Set informations about a user (userInfo1, userInfo2, ...).
-   RQRAINB-1585 : Fix use of ErrorManager index.js
-   Update package.json "moment-duration-format": "^2.2.2" and npm audit fix
-   RQRAINB-1627 : Update to latest typescript engine
-   Rename event `rainbow_onownbubbledeleted` to `rainbow_onbubbledeleted` when a bubble is deleted.
-   Add options::im::messageMaxLength option to define the max size of the messages sent.

### [1.56.0] - 2019-05-28
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

### [1.55.0] - 2019-04-30
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


### [1.54.6] - 2019-04-09
Update doc
Fix of FileStorageService::retrieveAndStoreOneFileDescriptor
Add method ContactService::acceptInvitation Accept a an invitation from an other Rainbow user to mutually join the network
Add method ContactService::declineInvitation Decline an invitation from an other Rainbow user to mutually join the network
Update onFileManagementMessageReceived event with the file descriptor data
Fix some type issue find by typescript

### [1.54.2] - 2019-04-04
* Fix issue in GruntFile about doc generation.

### [1.54.1] - 2019-04-02
* add missing deep-egal lib.

### [1.54.0] - 2019-04-02
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

### [1.51.0] - 2019-01-22
* Fix property conversation.lastMessageText which was undefined
* Remove the unirest library (security issue)
* Fix updateChannel topic value
* Fix the start/stop of the SDK. These processes has been improved to avoid multiple `start()` at the same time, and also to have a better flow life.
* Add event rainbow_onpresencechanged fired when the presence of the connected user changes.
* Fix decode of status in xmpp event when presence changed is received..

### [1.49.1] - 2018-12-07
* Update docs
* Fix parsing of stanza event `message is deleted in a channel` when the number of messages limit is reached and then raises the event `rainbow_onchannelmessagedeletedreceived`.
* Update call to publishToChannel channel new api

### [1.49.0] - 2018-11-20
* Refactor Events emitter to produce better logs in dev mode.
* Correction of contact's phonenumbers filling. Now Contact.phoneNumbers should be synchronised with splitted datas.
* Add images property in message retrieved from channels with method channels::getMessagesFromChannel and also when event "rainbow_onchannelmessagereceived" is fired
* Correction of parsing of the result data from server in method channels::getMessagesFromChannel
* Add a method to delete message in a channel channels::deleteMessageFromChannel. Note: there is probably an issue with the channelid of the message which is removed from event when a new message arrive in channel.
* Add event fired when a message is delete in a channel : rainbow_onchannelmessagedeletedreceived
* Add event fired when a channel is created : rainbow_onchannelcreated
* Add event fired when a channel is deleted : rainbow_channeldeleted
* typo correction in Contacts firstName and lastName

### [1.48.0] - 2018-10-31
* Add ability to post files in channels.
* Correction of stop and reconnection
* Add log level at root level of logs in config : config.logs.level
* Add "system-dev" section in logs for DEVELOPPEMENT ONLY, no production system should use it :
    "internals" for logs level of debug + unsensored data. Warning password and so on can be logs, it should only be used in dev environement !
    "http" moved from logs sections, kept the same behaviour

### [1.47.7] - 2018-10-28
### [1.47.6] - 2018-10-28
* Add missing rules to compile typescript before publishing

### [1.47.5] - 2018-10-27
* Fix bad cleanup around the Stop() method

### [1.53.0] - 2018-03-11
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

### [1.52.0] - 2018-02-12

### [1.51.5] - 2018-02-08
* Improve the  XMPP reconnect process
* Fix error in HttpService get method

### [1.51.4] - 2018-02-07
* Fix Messages list in conversation when SDK sent or received a message in it. Message is add to conversation when the server received it and send back a Receipt.
* Fix error return when an HttpService put or post failed
* Fix event listener life to avoid memoryleak
* Fix lastMessageText when retrieve history.

### [1.51.3] - 2018-02-06
* Fix remove from in markAsReadMessage
* Fix logs

### [1.51.2] - 2018-01-30
* Fix reconnection when network is lost or when the server reboot.

### [1.51.1] - 2018-01-24
* Add event fired when a channel is updated : rainbow_channelupdated
* Fix issue in HttpService when remote server is unavailable

### [1.51.0] - 2018-01-22
* Fix property conversation.lastMessageText which was undefined
* Remove the unirest library (security issue)
* Fix updateChannel topic value
* Fix the start/stop of the SDK. These processes has been improved to avoid multiple `start()` at the same time, and also to have a better flow life.
* Add event rainbow_onpresencechanged fired when the presence of the connected user changes.
* Fix decode of status in xmpp event when presence changed is received..

### [1.49.1] - 2018-12-07
* Update docs
* Fix parsing of stanza event `message is deleted in a channel` when the number of messages limit is reached and then raises the event `rainbow_onchannelmessagedeletedreceived`.
* Update call to publishToChannel channel new api

### [1.49.0] - 2018-11-20
* Refactor Events emitter to produce better logs in dev mode.
* Correction of contact's phonenumbers filling. Now Contact.phoneNumbers should be synchronised with splitted datas.
* Add images property in message retrieved from channels with method channels::getMessagesFromChannel and also when event "rainbow_onchannelmessagereceived" is fired
* Correction of parsing of the result data from server in method channels::getMessagesFromChannel
* Add a method to delete message in a channel channels::deleteMessageFromChannel. Note: there is probably an issue with the channelid of the message which is removed from event when a new message arrive in channel.
* Add event fired when a message is delete in a channel : rainbow_onchannelmessagedeletedreceived
* Add event fired when a channel is created : rainbow_onchannelcreated
* Add event fired when a channel is deleted : rainbow_channeldeleted
* typo correction in Contacts firstName and lastName

### [1.48.0] - 2018-10-31
* Add ability to post files in channels.
* Correction of stop and reconnection
* Add log level at root level of logs in config : config.logs.level
* Add "system-dev" section in logs for DEVELOPPEMENT ONLY, no production system should use it :
    "internals" for logs level of debug + unsensored data. Warning password and so on can be logs, it should only be used in dev environement !
    "http" moved from logs sections, kept the same behaviour

### [1.47.7] - 2018-10-28
### [1.47.6] - 2018-10-28
* Add missing rules to compile typescript before publishing

### [1.47.5] - 2018-10-27
* Fix bad cleanup around the Stop() method

### [1.47.0] - 2018-10-10
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

### [1.46.0] - 2018-09-07
* Add Conversations::getConversationByBubbleJid method
* Correction of Conversations::getBubbleConversation
* Restore token survey process.

### [1.45.1] - 2018-09-07
- Add Bulles::getAllBulles method witch call the getAll
- Add Bulles::deleteAllBubbles method to remove all methods own by user logged in.
- Add Bulles:getAllOwnedBubbles method to Get the list of bubbles created by the user
- Add "logs.customLabel" property in config file for customize the logs
- Add "logs.file.customFileName" property in config file for customize the log file name.
- Correction of Conversation::getBubbleConversation() who use the updated Bubbles::getBubbleByJid method
- Add parameters to Admin::createCompany : country, state
- Add methods to Switch the "is typing" state in a conversation : Conversations::sendIsTypingState, IM::sendIsTypingStateInBubble, IM::sendIsTypingStateInConversation

### [1.45.0] - 2018-08-28
- Correction of the telephony state when transfertcall succeed to allow a new call.
- Correction of conversations.getServerConversations() method which returned an empty result.
- Remove the check of isAdmin when api is called. It is the server who will check it.
- Refactor Bubbles::getBubbleById to Get a bubble by its ID in memory and if it is not found in server. And it now return a promise.
- Refactor Bubbles::getBubbleByJid to Get a bubble by its JID in memory and if it is not found in server. It return a promise.

### [1.44.0] - 2018-08-03
- Add 3-release SDK breaking changes notice.
- #CRRAINB-3176:Request created from: NodeJS SDK documentation
- Fix Regression on Contact id

### [1.43.4] - 2018-07-21
- Fix Rotary file logger

### [1.43.3] - 2018-07-19
- Add Application and multidomain management

### [1.43.2] - 2018-07-13
- Fix old node 6.x support

### [1.43.1] - 2018-07-12
- Update to winston logger library with correction of issues
- Improvement of the reconnection when the getRoster from serveur does not get an answer.
- Remove old application authentication
- Correction of Telephony (Still in Alpha)
- Correction of typo
- When send a message (im.sendxxx) parse the jid if it is a fullJid to keep the needed part.

### [1.42.3] - 2018-06-25
- Add Chatstate events support (reception)
- RESTService.js : add checkEveryPortals called from (checkPortalHealth) to wait a few time (10 seconds ) before check every portals, because somes of it respond before being xmpp ready.
- modify logs to enable/disable color and take winston parameter (zippedArchive, maxSize, maxFiles)

### [1.42.2] - 2018-06-21
- Fix Winston logger dependency : revert to winston 2.4.2

### [1.42.1] - 2018-06-20
- Fix Winston logger dependency

### [1.42.0] - 2018-06-20
- #CRRAINB-2838 - Event rainbow_onbubbleaffiliationchanged cand be fired
- #CRRAINB-2840 Request created from: Random behaviour to join a second time a nodejs user.
- add Telephony API for Alpha tests

### [1.41.6] - 2018-06-07
- Fix documentation

### [1.41.5] - 2018-06-06
- Fix race condition on bubble deletion

### [1.41.4] - 2018-06-05
- Fix #CRRAINB-2766: log files name is not correct

### [1.41.3] - 2018-05-30
- Set getRosters() as public
- Add Contacts.joinContacts admin API

### [1.41.2] - 2018-05-30
- Remove default values under models objects

### [1.41.1] - 2018-05-30
- Fix multiple presence subscription

### [1.41.0] - 2018-05-28
- #CRRAINB-2672: Update contacts information with getAll.
- Add contact avatar property
- Add additional header for analytics

### [1.40.2] - 2018-05-18
- Fix Object assign upper case
- Add missing Date in live received message, and from in sent message

### [1.40.1] - 2018-05-03
- Add internal admin getCompanyById method

### [1.40.0] - 2018-05-02
- #RQRAINB-910: CPAAS / SDK Node / refactor in IM service the APIs "sendMessageToConversation, sendMessageToContact, sendMessageToJid, sendMessageToBubble, sendMessageToBubbleJid" to return a Promise with the message sent, or null in case of error, as parameter of the resolve
- #CRRAINB-2413: Roster removing no more taken into account
- #CRRAINB-2405: Roster subscription no more taken into account
- Improvement in Promise treatment and error handling - Explicit documentation on Promises

### [1.39.1] - 2018-04-12
- #CRRAINB-2373: Conversation creation too verbose

### [1.39.0] - 2018-04-09
- #CRRAINB-2346: Add missing type in documentation for properties
- #CRRAINB-: Add the "createCompany" method in Admin service to create a company
- #CRRAINB-: Add the authent headers on the websocket xmpp
- #RQRAINB-859: CPAAS / SDK NodeJS / Add API Conversation
- #CRRAINB-2357: CPAAS / SDK Node / Promote to moderator in bubbles - Change owner

### [1.38.0] - 2018-03-17
- #CRRAINB-2123: The 'lang' of an IM is sometimes undefined
- #CRRAINB-2101: Fix issue with token survey that blocks the process in CLI mode

### [1.37.0] - 2018-02-25
- #CRRAINB-1812: Create a user by default to the admin company
- #CRRAINB-1860: Fix issue when retrieving the list of channels
- #CRRAINB-1972: Use the new authent login to server (the /api/rainbow/authentication/v1.0/login api login both user and application). Note: the old login process is stil used for compatibility.

### [1.36.1] - 2018-02-03
- #CRRAINB-1729: Remove log to console in channels service

### [1.36.0] - 2018-02-02
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

### [1.35.2] - 2018-01-18
- #CRRAINB-1519: Impossible to update group name

### [1.35.1] - 2018-01-12
- #CRRAINB-1463: Fix typo in guides `Getting_Started`, `Proxy`, `Readme` and `Connecting to Rainbow` that had bad application parameters name.

### [1.35.0] - 2018-01-11
- #CRRAINB-1450: Replace JID by fullJID when sending a P2P message to avoid crash
- #CRRAINB-1451: Fix typo in guide `Managing contacts` with API getContactByLoginEmail that returns an array and not the contact directly
- #CRRAINB-1452: Update FOSS WS (DOS fix) and request (latest version available)
- #CRRAINB-1458: Add better explanation in guides `Getting started` and `Connecting to Rainbow` on configuration parameters.
- #CRRAINB-1459: Describe missing API `sendMessageToJid()` and `sendMessageToBubbleJid()` to sending messages in guide `Answering chat messages`

### [1.34.0] - 2017-12-17
- #RQRAINB-513: Allow to send a POST request with a specific content-type
- #RQRAINB-515: Add a ping mechanism from client side to server side when no stanza received during 70s
- #RQRAINB-478: Manage content-type text/csv in server response
- #CRRAINB-1222: Fix typo in guide `Managing Contacts`
- #CRRAINB-1217: Token renew policy forbids users to connect - SDK

### [1.33.3] - 2017-12-01
- #30078: Add User Agent in request

### [1.33.2] - 2017-11-30
- #30070: Send unavailability when removing from a bubble

### [1.33.1] - 2017-11-28
- #30007: Rename API findChannels to findChannelsByName and add findChannelsByTopic
- #30016: API fetchChannelUsers() is paginated
- #30023: Fix connection login issue
- #29698: Application token renewal

### [1.33.0] - 2017-11-24
- #29880: Password with autogenerated character §, is not working on createAnonymousGuestUser call
- #29704: Tutorial for channels
- #29697: Channels

### [1.32.0] - 2017-11-04
- #29647: Update documentation with markdown tags supported
- #29640: Allow put request when using from CLI
- #29275: Remove offline resource (avoir memory leak)
- #29282: Add Groups API
- #29492: Add tutorial on Groups
- #29273: Save presence (settings) when updating the presence

### [1.31.1] - 2017-10-17
- Force XMPP PLAIN Sasl mechanism for authentication
- Fix Gruntfile default rules
- #29146: Fix global variable
- Update XMPP.js to 0.3.0

### [1.31.0] - 2017-09-28
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

### [1.30.2] - 2017-09-28
- #29125: Impossible to log in CLI mode

### [1.30.1] - 2017-09-17
- #28960: Temporarily avoid sending application token
- #28989: Allow to get all bubbles from the server
- #28994: Add API getAllActiveBubbles() and getAllClosedBubbles()
- #29050: Fix bad fullJID identifier
- #29051: Avoid to send 2x the initial presence in bubble

### [1.30.0] - 2017-09-07
- #28821: Add new tutorial for managing bubbles
- #28823: No bearer in user login request

### [1.29.4] - 2017-08-23
- #28706: Fix crash when no AppID is provisionned

### [1.29.3] - 2017-08-22
- #28639: Fix Node.JS version 4.x compatibility
- #28463: Add new tutorial for managing users
- #28656: Document data models used and events parameters

### [1.29.2] - 2017-08-18
- #28640: New methods **setBubbleTopic()**, **setBubbleName()**

### [1.29.1] - 2017-08-17
- #28388: Return the bubble with the custom data updated

### [1.29.0] - 2017-08-16
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

### [1.28.0] - 2017-07-22
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

### [1.27.2] - 2017-06-30
- Avoid message reception from Rainbow Bots (i.e. Emily)

### [1.27.1] - 2017-06-28
 - Fix regression in API getContactByJid()

### [1.27.0] - 2017-06-26
 - Add application ID treatment
 - Add language information in incoming and ougoing messages
 - #27892 Be notified of a bubble invitation and accept or decline this invitation
 - #27903 Bubble not updated when affiliation changed
 - #28006 Rework API getContactByID() to get data from server too
 - [Bubble] New methods **acceptInvitationToJoinBubble()**, **declineInvitationToJoinBubble()** have been added to answer a request of joining a bubble
 - [Bubble] New event **rainbow_onbubbleinvitationreceived** added for handling invitation to join a bubble
 - [Bubble] New event **rainbow_onbubbleownaffiliationchanged** added for handling user connected affiliation changes in a bubble

### [0.10.18] - 2017-06-09
 - #27522 Bad fix (introduce lots of regressions when no resource)

### [0.10.15] - 2017-05-23
 - [Contact] #27522 SearchByJid API doesn't return result when JID contains the resource

### [0.10.14] - 2017-05-19
 - [Quality] Add eslint and fix all issues - Internal change
 - [Contact] Switch to new get contacts API (Privacy concerns) - Internal change
 - [Bubble] #27312 Add parameter boolWithHistory in API createBubble to offer or not full history for newcomers

### [0.10.13] - 2017-05-04
 - [Contact] Methods **getContactByJid()**, **getContactById()** or **getContactByLoginEmail()** are now Promise based functions.

### [0.10.12] - 2017-04-30
 - [Bubble] Allow to create a bubble
 - [Bubble] Allow to close a bubble (Bubble is archived but existing messages can still be consulted including owners)
 - [Bubble] Allow to delete a bubble (Bubble no more appears in the bubble list for all participants including owners)
 - [Bubble] Allow to add a contact to a bubble (with or without invite, as user or moderator, with a reason)
 - [Bubble] Send a event when the a contact changes his affiliation with a bubble
 - [Bubble] Allow to send a message to a bubble
 - [Bubble] Allow to leave a bubble
 - [Bubble] Allow to remote a contact from a bubble
 - [Contact] Retrieve a contact using his login (email)

### [0.9.7] - 2017-03-21
 - [CLI] Allow to use the SDK as a CLI tool

### [0.8.12] - 2017-03-14
 - [Serviceability] Allow to enable or disable console and file logging
 - [Instant Message] Allow to send a 'read' receipt manually
 - [Presence] Compute the contact's presence by taken into account all resources including the phone one.
 - [Presence] Change the user connected presence manually

### [0.7.3] - 2017-03-02
 - [Serviceability] Connect through HTTP Proxy

### [0.6.7] - 2017-03-01
 - [Serviceability] Log debugging traces to files

### [0.5.6] - 2017-02-24
 - [Contacts] Retrieve the list of contacts
 - [Presence] Emit an event when the presence of a contact changes

### [0.4.8] - 2017-02-22
 - [Instant Message] Send a chat message to a Rainbow user (JID)
 - [Instant Message] Emit events when the Rainbow server and the recipient send a receipt

### [0.3.8] - 2017-02-21
 - [Instant Message] Emit an event when receiving a P2P chat messages from an other Rainbow user
 - [Instant Message] Send acknowledgments (Message received, Message read) when receiving a P2P message

### [0.0.2] - 2017-02-21
 - [Presence] Set the presence to 'online' once connected
 - [Connection] Sign-in using the XMPP API and maintain the connection on (PING)

### [0.0.1] - 2017-02-19
 - [Connection] Sign-in using the REST API, refresh the token and reconnect when needed
