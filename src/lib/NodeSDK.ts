"use strict";

import {TasksService} from "./services/TasksService.js";

require("fix-esm").register();

import {Core} from "./Core";
import {Appreciation} from "./common/models/Channel";
import {ErrorManager} from "./common/ErrorManager";
import {setTimeoutPromised} from "./common/Utils";
import {ImsService} from "./services/ImsService";
import {ChannelsService} from "./services/ChannelsService";
import {S2SService} from "./services/S2SService";
import {InvitationsService} from "./services/InvitationsService";
import {FavoritesService} from "./services/FavoritesService";
import {CallLogService} from "./services/CallLogService";
import {TelephonyService} from "./services/TelephonyService";
import {SDKSTATUSENUM} from "./common/StateManager";
import {SettingsService} from "./services/SettingsService";
import {RESTService} from "./connection/RESTService";
import {AdminService} from "./services/AdminService";
import {FileStorageService} from "./services/FileStorageService";
import {FileServerService} from "./services/FileServerService";
import {Events} from "./common/Events";
import {GroupsService} from "./services/GroupsService";
import {BubblesService} from "./services/BubblesService";
import {PresenceService} from "./services/PresenceService";
import {ConversationsService} from "./services/ConversationsService";
import {ContactsService} from "./services/ContactsService";
import {AlertsService} from "./services/AlertsService";
import {ProfilesService} from "./services/ProfilesService";
import {DataStoreType} from "./config/config";
import {WebinarsService} from "./services/WebinarsService";
import {RBVoiceService} from "./services/RBVoiceService";
import {Logger} from "./common/Logger";
import {inspect} from "util";
import {HTTPoverXMPP} from "./services/HTTPoverXMPPService";
import {RPCoverXMPPService} from "./services/RPCoverXMPPService.js";

let LOG_ID = "NodeSDK/IDX";

/**
 * options SDK Startup options.
 * {Object} OptionsType 
 * @property {string} options.rainbow.host "official", Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO.
 * @property {string} options.rainbow.mode "xmpp", The event mode used to receive the events. Can be `xmpp` or `s2s` (default : `xmpp`).
 * @property {string} options.xmpp.timeBetweenXmppRequests the time between two xmpp request (avoid burst)
 * @property {string} options.xmpp.raiseLowLevelXmppInEvent enable the raise of event "rainbow_onxmmpeventreceived" when a data is received in xmpp pipe.
 * @property {string} options.xmpp.raiseLowLevelXmppOutReq enable the raise of event "rainbow_onxmmprequestsent" when a data is sent in xmpp pipe.
 * @property {string} options.xmpp.maxIdleTimer to define the delay without xmpp exchange after which a ping is sent to server.
 * @property {string} options.xmpp.maxPingAnswerTimer to define the time to wait the xmpp ping response.
 * @property {string} options.xmpp.xmppRessourceName to define the name of the xmpp resource.
 * @property {string} options.xmpp.maxPendingAsyncLockXmppQueue the number of xmpp requests waiting for sending.
 * @property {string} options.s2s.hostCallback "http://3d260881.ngrok.io", S2S Callback URL used to receive events on internet.
 * @property {string} options.s2s.locallistenningport "4000", Local port where the events must be forwarded from S2S Callback Web server.
 * @property {string} options.rest.useRestAtStartup, enable the REST requests to the rainbow server at startup (used with startWSOnly method). Default value is true.
 * @property {string} options.rest.useGotLibForHttp, allows to enable the use of `got` lib for REST requests (esle the old Request lib is used). Default value is true.
 * @property {string} options.rest.gotOptions, allows to customize the `got` lib for REST requests options. Default value is :</BR>
 *  {</BR>
 *  agentOptions: { </BR>
 * //Keep sockets around in a pool to be used by other requests in the future. Default = false</BR>
 * keepAlive: true, // ?: boolean or undefined;</BR>
 * </BR>
 * //When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.</BR>
 * //Only relevant if keepAlive is set to true.</BR>
 * keepAliveMsecs: 15001, // ?: number or undefined;</BR>
 * </BR>
 * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity</BR>
 * maxSockets: 26, // ?: number or undefined;</BR>
 * </BR>
 * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.</BR>
 * maxTotalSockets: Infinity, // ?: number or undefined;</BR>
 * </BR>
 * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.</BR>
 * maxFreeSockets: 1001, // ?: number or undefined;</BR>
 * </BR>
 * Socket timeout in milliseconds. This will set the timeout after the socket is connected.</BR>
 * timeout: 60001 , // ?: number or undefined;</BR>
 * }</BR>,
 * gotRequestOptions : {</BR>
 *  timeout: { // This object describes the maximum allowed time for particular events.</BR>
 *      lookup: 800, // Starts when a socket is assigned.  Ends when the hostname has been resolved.</BR>
 *      connect: 1250, // Starts when lookup completes.  Ends when the socket is fully connected.</BR>
 *      secureConnect: 1250, // Starts when connect completes. Ends when the handshake process completes.</BR>
 *      socket: 2000, // Starts when the socket is connected. Resets when new data is transferred.</BR>
 *      send: 90000, // Starts when the socket is connected. Ends when all data have been written to the socket.</BR>
 *      response: 2000 // Starts when request has been flushed. Ends when the headers are received.</BR>
 *   }</BR>
 *  }</BR>
 * }</BR>
 *
 * @property {string} options.credentials.login "user@xxxx.xxx", The Rainbow email account to use.
 * @property {string} options.credentials.password "XXXXX", The password.
 * @property {string} options.application.appID "XXXXXXXXXXXXXXXXXXXXXXXXXXXX", The Rainbow Application Identifier.
 * @property {string} options.application.appSecret "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX", The Rainbow Application Secret.
 * @property {string} options.proxy.host "xxx.xxx.xxx.xxx", The proxy address.
 * @property {string} options.proxy.port xxxx, The proxy port.
 * @property {string} options.proxy.protocol "http", The proxy protocol (note http is used to https also).
 * @property {string} options.proxy.user "proxyuser", The proxy username.
 * @property {string} options.proxy.password "XXXXX", The proxy password.
 * @property {boolean} options.logs.enableConsoleLogs false, Activate logs on the console.
 * @property {boolean} options.logs.enableFileLogs false, Activate the logs in a file.
 * @property {boolean} options.logs.enableEventsLogs: false, Activate the logs to be raised from the events service (with `onLog` listener). Used for logs in connection node in red node contrib.
 * @property {boolean} options.logs.enableEncryptedLogs: true, Activate the logs of stanza exchange to be encrypted and loggued.
 * @property {boolean} options.logs.color true, Activate the ansii color in the log (more humain readable, but need a term console or reader compatible (ex : vim + AnsiEsc module, or notepad++ + python + error_list_lexer_support (https://github.com/Ekopalypse/NppPythonScripts/blob/master/npp/error_list_lexer_support.py) )).
 * @property {string} options.logs.level "info", The level of logs.  The value can be "error", "warn", "info", "trace", "http", "xmpp", "debug", "internal", "internalerror". These Severities of levels are shown in an inclusive order, so "error" level only show "error" logs, "warn" level only show "error" and "warn" levels, and so on.
 * @property {string} options.logs.customLabel "MyRBProject", A label inserted in every lines of the logs. It is usefull if you use multiple SDK instances at a same time. It allows to separate logs in console.
 * @property {string} options.logs.file.path "c:/temp/", Path to the log file.
 * @property {string} options.logs.file.customFileName "R-SDK-Node-MyRBProject", A label inserted in the name of the log file.
 * @property {boolean} options.logs.file.zippedArchive false Can activate a zip of file. It needs CPU process, so avoid it.
 * @property {boolean} options.testOutdatedVersion true, Parameter to verify at startup if the current SDK Version is the lastest published on npmjs.com.
 * @property {boolean} options.testDNSentry true, Parameter to verify at startup/reconnection that the rainbow server DNS entry name is available.
 * @property {boolean} options.httpoverxmppserver false, Activate the treatment of Http over Xmpp requests (xep0332).
 * @property {number} options.requestsRate.maxReqByIntervalForRequestRate 600, // nb requests during the interval of the rate limit of the http requests to server.
 * @property {number} options.requestsRate.intervalForRequestRate 60, // nb of seconds used for the calcul of the rate limit of the rate limit of the http requests to server.
 * @property {number} options.requestsRate.timeoutRequestForRequestRate 600 // nb seconds Request stay in queue before being rejected if queue is full of the rate limit of the http requests to server.
 * @property {boolean} options.im.sendReadReceipt true, Allow to automatically send back a 'read' status of the received message. Usefull for Bots.
 * @property {number} options.im.messageMaxLength 1024, Maximum size of messages send by rainbow. Note that this value should not be modified without ALE Agreement.
 * @property {boolean} options.im.sendMessageToConnectedUser false, Forbid the SDK to send a message to the connected user it self. This is to avoid bot loopback.
 * @property {string} options.im.conversationsRetrievedFormat "small", Set the size of the conversation's content retrieved from server. Can be `small`, `medium`, `full`.
 * @property {boolean} options.im.storeMessages false, Tell the server to store the message for delay distribution and also for history. Please avoid to set it to true for a bot which will not read anymore the messages. It is a better way to store it in your own CPaaS application.
 * @property {number} options.im.nbMaxConversations 15, Parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.
 * @property {number} options.im.rateLimitPerHour 1000, Parameter to set the maximum of "message" stanza sent to server by hour. Default value is 1000.
 * @property {string} options.im.messagesDataStore Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour).<br>
 *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
 *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
 *                          DataStoreType.StoreTwinSide The messages are fully stored.<br>
 *                          DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.
 * @property {boolean} options.im.autoInitialGetBubbles to allow automatic opening of the bubbles the user is in. Default value is true.
 * @property {boolean} options.im.autoInitialBubblePresence to allow automatic opening of conversation to the bubbles with sending XMPP initial presence to the room. Default value is true.
 * @property {number} options.im.maxBubbleJoinInProgress to define the maximum of simultaneous "send initial presence of the bubbles".
 * @property {boolean} options.im.autoInitialBubbleFormat to allow modify format of data received at getting the bubbles. Default value is true.
 * @property {boolean} options.im.autoInitialBubbleUnsubscribed to allow get the bubbles when the user is unsubscribed from it. Default value is true.
 * @property {boolean} options.im.autoLoadConversations to activate the retrieve of conversations from the server. The default value is true.
 * @property {boolean} options.im.autoLoadConversationHistory to activate the retrieve of conversation's messages from the server. The default value is false.
 * @property {boolean} options.im.autoLoadContacts to activate the retrieve of contacts from roster from the server. The default value is true.
 * @property {boolean} options.im.copyMessage to manage if the Messages hint should not be copied to others resources (https://xmpp.org/extensions/xep-0334.html#no-copy) . The default value is true.
 * @property {boolean} options.im.enableCarbon to manage carbon copy of message (https://xmpp.org/extensions/xep-0280.html). The default value is true.
 * @property {string} options.im.enablesendurgentpushmessages permit to add <retry-push xmlns='urn:xmpp:hints'/> tag to allows the server sending this messge in push with a small ttl (meaning urgent for apple/google backend) and retry sending it 10 times to increase probability that it is received by mobile device. The default value is false.
 * @property {Object} options.servicesToStart <br>
 *    Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.<br>
 *    Take care, severals services are linked, so disabling a service can disturb an other one.<br>
 *    By default all the services are started. Events received from server are not yet filtered.<br>
 *    So this feature is realy risky, and should be used with much more cautions.<br>
 *        {<br>
 *       "bubbles": {<br>
 *           "start_up": true,<br>
 *       },<br>
 *       "telephony": {<br>
 *           "start_up": true,<br>
 *       },<br>
 *       "channels": {<br>
 *           "start_up": true,<br>
 *       },<br>
 *       "admin": {<br>
 *           "start_up": true,<br>
 *       },<br>
 *       "fileServer": {<br>
 *           "start_up": true,<br>
 *       },<br>
 *       "fileStorage": {<br>
 *           start_up: true,<br>
 *       },<br>
 *       "calllog": {<br>
 *           "start_up": true,<br>
 *       },<br>
 *       "favorites": {<br>
 *           "start_up": true,<br>
 *               }
 */
type OptionsType = {
    rainbow: {
        host: string
        "mode": string,
    },
    xmpp: {
        host: string,
        port: string,
        protocol: string,
        timeBetweenXmppRequests: string,
        "raiseLowLevelXmppInEvent": false,
        "raiseLowLevelXmppOutReq": false,
        "maxIdleTimer": number,
        "maxPingAnswerTimer": number,
        "xmppRessourceName": undefined,
        "maxPendingAsyncLockXmppQueue":number
    }
    "s2s": {
        "hostCallback": string,
        //"hostCallback": "http://70a0ee9d.ngrok.io",
        "locallistenningport": string
    },
    rest:{
        useRestAtStartup : true
    }
    ,
    "credentials": {
        "login": string,  // The Rainbow email account to use
        "password": string,
    },
    // Application identifier
    "application": {
        "appID": string,
        "appSecret": string

    },

    // Proxy configuration
    proxy: {
        host: string,
        port: number,
        protocol: string,
        user: string,
        password: string,
        secureProtocol: string
    }, 

    // Logs options
    "logs": {
        "enableConsoleLogs": boolean,
        "enableFileLogs": boolean,
        "enableEventsLogs": boolean,
        "enableEncryptedLogs": boolean,
        "color": boolean,
        //"level": "info",
        "level": string,
        "customLabel": string,
        "system-dev": {
            "internals": boolean,
            "http": boolean,
        },
        "file": {
            "path": string,
            "customFileName": string,
            //"level": 'info',                    // Default log level used
            "zippedArchive": boolean 
            //"maxSize" : '10m',
            //"maxFiles" : 10 
        }
    },
    "testOutdatedVersion": boolean,
    "testDNSEntry": boolean, 
    "httpoverxmppserver": false,
    "requestsRate":{
        "useRequestRateLimiter": number,
        "maxReqByIntervalForRequestRate": number, // nb requests during the interval.
        "intervalForRequestRate": number, // nb of seconds used for the calcul of the rate limit.
        "timeoutRequestForRequestRate": number // nb seconds Request stay in queue before being rejected if queue is full.
    },
    "autoReconnectIgnoreErrors":boolean,
    // IM options
    "im": {
        "sendReadReceipt": boolean,
        "messageMaxLength": number,
        "sendMessageToConnectedUser": boolean,
        "conversationsRetrievedFormat": string,
        "storeMessages": boolean,
        "copyMessage": boolean,
        "nbMaxConversations": number,
        "rateLimitPerHour": number,
        "messagesDataStore": DataStoreType,
        "autoInitialBubblePresence": boolean,
        "maxBubbleJoinInProgress": number,
        "autoLoadConversations": boolean,
        "autoLoadConversationHistory": boolean,
        "autoLoadContacts": boolean,
        "enablesendurgentpushmessages": false
    },
    // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.
    // Take care, severals services are linked, so disabling a service can disturb an other one.
    // By default all the services are started. Events received from server are not yet filtered.
    // So this feature is realy risky, and should be used with much more cautions.
    "servicesToStart": {
        "bubbles": {
            "start_up": boolean,
        },
        "telephony": {
            "start_up": boolean,
        },
        "channels": {
            "start_up": boolean,
        },
        "admin": {
            "start_up": boolean,
        },
        "fileServer": {
            "start_up": boolean,
        },
        "fileStorage": {
            "start_up": boolean,
        },
        "calllog": {
            "start_up": boolean,
        },
        "favorites": {
            "start_up": boolean,
        },
        "alerts": {
            "start_up": boolean,
        }, //need services :
        "webrtc": {
            "start_up": boolean,
            "optional": boolean
        } 
    } // */
}

/**
 * @enum { String }
 *
*/
let Type = {
    home: "home",
    work: "work",
    other: "other"
};

/**
 * @enum { String }
 *
*/
let DeviceType = {
    landline: "landline",
    mobile: "mobile",
    fax: "fax",
    other: "other"
};

function uncaughtException(err) {
    console.error('Possibly uncaughtException err : ', err);
}
function warning(err) {
    console.error('Possibly unhandledRejection err : ', err);
}
function unhandledRejection(reason, p) {
    console.error('Possibly Unhandled Rejection at: Promise ', p, " reason: ", reason);
}

/**
 * @module
 * @name SDK
 * @version SDKVERSION
 * @public
 * @description
 *      This module is the core module of the Rainbow SDK for Node.JS <br>.
 *      It gives access to the other modules and allow to start/stop the SDK
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Access to each module like Bubbles, Contacts...<br>
 *      - Access to Event module <br>
 *      - Start and stop the SDK <br>
 *      - Get the version number <br>
 *      - Get the SDK internal state
 *
 *      Warning: Before deploying in production a bot that can generate heavy traffic, please contact ALE.
 */

/**
 *
 * @name NodeSDK 
 * @class
 * @description
 * NodeSDK Class
 */
class NodeSDK {
    private _option = {};
    get option(): {} {
        return this._option;
    }

    public _core: Core;
    public startTime: Date;
    static NodeSDK: any;

    /* *
     * @ method constructor
     * @ public
     * @ description
     *      The entry point of the Rainbow Node SDK.
     * @ param {OptionsType} options SDK Startup options.
     */
    private _logger: Logger;
    
    /**
     * @method constructor
     * @public
     * @description
     *      The entry point of the Rainbow Node SDK.
     * @param {Object} options SDK Startup options of constructor.
     * @param {string} options.rainbow.host "official", Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO.
     * @param {string} options.rainbow.mode "xmpp", The event mode used to receive the events. Can be `xmpp` or `s2s` (default : `xmpp`).
     * @param {string} options.xmpp.timeBetweenXmppRequests the time between two xmpp request (avoid burst)
     * @param {string} options.xmpp.raiseLowLevelXmppInEvent enable the raise of event "rainbow_onxmmpeventreceived" when a data is received in xmpp pipe.
     * @param {string} options.xmpp.xmppRessourceName to define the name of the xmpp resource.
     * @param {string} options.xmpp.raiseLowLevelXmppOutReq enable the raise of event "rainbow_onxmmprequestsent" when a data is sent in xmpp pipe.
     * @param {string} options.xmpp.maxIdleTimer to define the delay without xmpp exchange after which a ping is sent to server.
     * @param {string} options.xmpp.maxPingAnswerTimer to define the time to wait the xmpp ping response.
     * @param {string} options.xmpp.maxPendingAsyncLockXmppQueue the number of xmpp requests waiting for sending.
     * @param {string} options.s2s.hostCallback "http://3d260881.ngrok.io", S2S Callback URL used to receive events on internet.
     * @param {string} options.s2s.locallistenningport "4000", Local port where the events must be forwarded from S2S Callback Web server.
     * @param {string} options.rest.useRestAtStartup enable the REST requests to the rainbow server at startup (used with startWSOnly method). default value is true.
     * @param {string} options.rest.useGotLibForHttp allows to enable the use of `got` lib for REST requests (esle the old Request lib is used). Default value is true.
     * @param {string} options.rest.gotOptions, allows to customize the `got` lib for REST requests options. Default value is : </BR>
     *  {</BR>
     *  agentOptions: { </BR>
     * //Keep sockets around in a pool to be used by other requests in the future. Default = false</BR>
     * keepAlive: true, // ?: boolean or undefined;</BR>
     * </BR>
     * //When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.</BR>
     * //Only relevant if keepAlive is set to true.</BR>
     * keepAliveMsecs: 15001, // ?: number or undefined;</BR>
     * </BR>
     * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity</BR>
     * maxSockets: 26, // ?: number or undefined;</BR>
     * </BR>
     * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.</BR>
     * maxTotalSockets: Infinity, // ?: number or undefined;</BR>
     * </BR>
     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.</BR>
     * maxFreeSockets: 1001, // ?: number or undefined;</BR>
     * </BR>
     * Socket timeout in milliseconds. This will set the timeout after the socket is connected.</BR>
     * timeout: 60001 , // ?: number or undefined;</BR>
     * }</BR> ,
     * gotRequestOptions : {</BR>
     *  timeout: { // This object describes the maximum allowed time for particular events.</BR>
     *      lookup: 800, // Starts when a socket is assigned.  Ends when the hostname has been resolved.</BR>
     *      connect: 1250, // Starts when lookup completes.  Ends when the socket is fully connected.</BR>
     *      secureConnect: 1250, // Starts when connect completes. Ends when the handshake process completes.</BR>
     *      socket: 2000, // Starts when the socket is connected. Resets when new data is transferred.</BR>
     *      send: 90000, // Starts when the socket is connected. Ends when all data have been written to the socket.</BR>
     *      response: 2000 // Starts when request has been flushed. Ends when the headers are received.</BR>
     *   }</BR>
     *  }</BR>
     * }</BR>
     *
     * @param {string} options.credentials.login "user@xxxx.xxx", The Rainbow email account to use.
     * @param {string} options.credentials.password "XXXXX", The password.
     * @param {string} options.application.appID "XXXXXXXXXXXXXXXXXXXXXXXXXXXX", The Rainbow Application Identifier.
     * @param {string} options.application.appSecret "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX", The Rainbow Application Secret.
     * @param {string} options.proxy.host "xxx.xxx.xxx.xxx", The proxy address.
     * @param {string} options.proxy.port xxxx, The proxy port.
     * @param {string} options.proxy.protocol "http", The proxy protocol (note http is used to https also).
     * @param {string} options.proxy.user "proxyuser", The proxy username.
     * @param {string} options.proxy.password "XXXXX", The proxy password.
     * @param {string} options.logs.enableConsoleLogs false, Activate logs on the console.
     * @param {string} options.logs.enableFileLogs false, Activate the logs in a file.
     * @param {string} options.logs.enableEventsLogs: false, Activate the logs to be raised from the events service (with `onLog` listener). Used for logs in connection node in red node contrib.
     * @param {string} options.logs.enableEncryptedLogs: true, Activate the encryption of stanza in logs.
     * @param {string} options.logs.color true, Activate the ansii color in the log (more humain readable, but need a term console or reader compatible (ex : vim + AnsiEsc module)). 
     * @param {string} options.logs.level "info", The level of logs. The value can be "error", "warn", "info", "trace", "http", "xmpp", "debug", "internal", "internalerror". These Severities of levels are shown in an inclusive order, so "error" level only show "error" logs, "warn" level only show "error" and "warn" levels, and so on.
     * @param {string} options.logs.customLabel "MyRBProject", A label inserted in every lines of the logs. It is usefull if you use multiple SDK instances at a same time. It allows to separate logs in console.
     * @param {string} options.logs.file.path "c:/temp/", Path to the log file.
     * @param {string} options.logs.file.customFileName "R-SDK-Node-MyRBProject", A label inserted in the name of the log file.
     * @param {string} options.logs.file.zippedArchive false Can activate a zip of file. It needs CPU process, so avoid it.
     * @param {string} options.testOutdatedVersion true, Parameter to verify at startup if the current SDK Version is the lastest published on npmjs.com.
     * @param {string} options.testDNSentry true, Parameter to verify at startup/reconnection that the rainbow server DNS entry name is available.
     * @param {string} options.httpoverxmppserver false, Activate the treatment of Http over Xmpp requests (xep0332).
     * @param {string} options.requestsRate.maxReqByIntervalForRequestRate 600, // nb requests during the interval of the rate limit of the http requests to server.
     * @param {string} options.requestsRate.intervalForRequestRate 60, // nb of seconds used for the calcul of the rate limit of the rate limit of the http requests to server.
     * @param {string} options.requestsRate.timeoutRequestForRequestRate 600 // nb seconds Request stay in queue before being rejected if queue is full of the rate limit of the http requests to server.
     * @param {string} options.im.sendReadReceipt true, Allow to automatically send back a 'read' status of the received message. Usefull for Bots.
     * @param {string} options.im.messageMaxLength 1024, Maximum size of messages send by rainbow. Note that this value should not be modified without ALE Agreement.
     * @param {string} options.im.sendMessageToConnectedUser false, Forbid the SDK to send a message to the connected user it self. This is to avoid bot loopback.
     * @param {string} options.im.conversationsRetrievedFormat "small", Set the size of the conversation's content retrieved from server. Can be `small`, `medium`, `full`.
     * @param {string} options.im.storeMessages false, Tell the server to store the message for delay distribution and also for history. Please avoid to set it to true for a bot which will not read anymore the messages. It is a better way to store it in your own CPaaS application.
     * @param {string} options.im.nbMaxConversations 15, Parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.
     * @param {string} options.im.rateLimitPerHour 1000, Parameter to set the maximum of "message" stanza sent to server by hour. Default value is 1000.
     * @param {string} options.im.messagesDataStore Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour).<br>
     *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
     *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
     *                          DataStoreType.StoreTwinSide The messages are fully stored.<br>
     *                          DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.
     * @param {boolean} options.im.autoInitialGetBubbles to allow automatic opening of the bubbles the user is in. Default value is true.
     * @param {string} options.im.autoInitialBubblePresence to allow automatic opening of conversation to the bubbles with sending XMPP initial presence to the room. Default value is true.
     * @param {number} options.im.maxBubbleJoinInProgress to define the maximum of simultaneous "send initial presence of the bubbles".
     * @param {boolean} options.im.autoInitialBubbleFormat to allow modify format of data received at getting the bubbles. Default value is true.
     * @param {boolean} options.im.autoInitialBubbleUnsubscribed to allow get the bubbles when the user is unsubscribed form it. Default value is true.
     * @param {string} options.im.autoLoadConversations to activate the retrieve of conversations from the server. The default value is true. 
     * @param {string} options.im.autoLoadConversationHistory to activate the retrieve of conversation's messages from the server. The default value is false.
     * @param {string} options.im.autoLoadContacts to activate the retrieve of contacts from roster from the server. The default value is true.   
     * @param {string} options.im.enablesendurgentpushmessages permit to add <retry-push xmlns='urn:xmpp:hints'/> tag to allows the server sending this messge in push with a small ttl (meaning urgent for apple/google backend) and retry sending it 10 times to increase probability that it is received by mobile device. The default value is false.   
     * @param {Object} options.servicesToStart <br>
     *    Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.<br>
     *    Take care, severals services are linked, so disabling a service can disturb an other one.<br>
     *    By default all the services are started. Events received from server are not yet filtered.<br>
     *    So this feature is realy risky, and should be used with much more cautions.<br>
     *        {<br>
     *       "bubbles": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "telephony": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "channels": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "admin": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "fileServer": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "fileStorage": {<br>
     *           start_up: true,<br>
     *       },<br>
     *       "calllog": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "favorites": {<br>
     *           "start_up": true,<br>
     *               
     */
    constructor(options : Object) {
        /*
             *       @ deprecated "storeMessages": false, Tell the server to store the message for delay distribution and also for history. Please avoid to set it to true for a bot which will not read anymore the messages. It is a better way to store it in your own CPaaS application<br>
     *       "nbMaxConversations": 15, Parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.<br>
     *       "rateLimitPerHour": 1000, Parameter to set the maximum of "message" stanza sent to server by hour. Default value is 1000.<br>
     *       "messagesDataStore": DataStoreType.NoStoreBotSide, Parameter to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.NoStoreBotSide")<br>
     *                          DataStoreType.NoStore Same behaviour as previously `storeMessages=false` Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
     *                          DataStoreType.NoStoreBotSide The messages are not stored on  loggued-in Bot's history, but are stored on the other side. So the contact kept the messages exchanged with bot in his history.<br>
     *                          DataStoreType.StoreTwinSide The messages are fully stored.<br>

         */
        /* process.on("uncaughtException", (err) => {
            console.error(err);
        });

        process.on("warning", (err) => {
            console.error(err);
        });

        process.on("unhandledRejection", (err, p) => {
            console.error(err);
        }); // */
        process.removeListener("unhandledRejection", unhandledRejection);
        process.removeListener("warning", warning);
        process.removeListener("uncaughtException", uncaughtException);

        process.on("unhandledRejection", unhandledRejection);
        process.on("warning", warning);
        process.on("uncaughtException", uncaughtException);

        // Stop the SDK if the node exe receiv a signal to stop, except for sigkill.
        process.removeListener("SIGINT", this.stopProcess());
        process.removeListener("SIGQUIT", this.stopProcess());
        process.removeListener("SIGTERM", this.stopProcess());
        process.on("SIGINT", this.stopProcess());
        process.on("SIGQUIT", this.stopProcess());
        process.on("SIGTERM", this.stopProcess());
        //process.on("SIGUSR2", that.stopProcess());

        this._option = options;
        this._core = new Core(options);
        this._logger = this._core._logger
    }

    /**
     * @public
     * @method start
     * @instance
     * @param {String} token a valid token to login without login/password. <br>
     * if Oauth token is provided to the SDK then application MUST implement the refresh token and send it back to SDK with `setRenewedToken` API, while following event are raised : <br>
     * Events rainbow_onusertokenrenewfailed : fired when an oauth token is expired. <br>
     * Events rainbow_onusertokenwillexpire : fired when the duration of the current user token reaches half of the maximum time. <br>
     *      For instance, if the token is valid for 1 hour, this event will arrive at 30 minutes. <br>
     *      It is recommended to renew the token upon the arrival of this event. <br>
     * @description
     *    Start the SDK <br>
     *    Note :<br>
     *    The token must be empty to signin with credentials.<br>
     *    The SDK is disconnected when the renew of the token had expired (No initial signin possible with out credentials.)<br>
     *    There is a sample using the oauth and sdk at https://github.com/Rainbow-CPaaS/passport-rainbow-oauth2-with-rainbow-node-sdk-example <br>
     * @memberof NodeSDK
     */
    start(token ? : string) {
        let that = this;
        that.startTime = new Date();
        return new Promise(function(resolve, reject) {
            return that._core.start( token).then(function() {
                return that._core.signin(false, token);
                //throw new Error("error test");
            }).then(function(result : any) {
                let startDuration: number;
                // @ts-ignore
                startDuration = Math.round(new Date() - that.startTime);
                if (!result) {result = {};}
                result.startDuration = startDuration;
                resolve(result);
                //reject ({message : "Error !!!"});
            }).catch(async function(err) {
                try {
                    await that.stop();
                } catch (e) {
                    
                }
                await setTimeoutPromised(500).then( () => {
                    that._core._stateManager.transitTo(false, SDKSTATUSENUM.STOPPED);                    
                });
                if (err) {
                    console.log("[index ] : rainbow_onconnectionerror : ", inspect(err));
                    // It looks that winston is close before this line :(, so console is used. 
                    // that.logger.log("error", LOG_ID + " (evt_internal_xmppfatalerror) Error XMPP, Stop le SDK : ", err);
                    that.events.publish("connectionerror", err);
                    reject(err);
                } else {
                    let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                    error.details = err;
                    console.log("[index ] : rainbow_onconnectionerror : ", inspect(error));
                    that.events.publish("connectionerror", error);
                    reject(error);
                }
            });
        });
    }

    /**
     * @public
     * @method start
     * @instance
     * @description
     *    Start the SDK with only XMPP link<br>
     *    Note :<br>
     * @memberof NodeSDK
     */
    startWSOnly(token, userInfos) {
        let that = this;
        that.startTime = new Date();
        return new Promise(function(resolve, reject) {
            // Force to work without the REST API at startup :
            that._core.options._restOptions.useRestAtStartup = false;
            return that._core.start( token).then(function() {
                return that._core.signinWSOnly(false, token, userInfos);
            }).then(function(result : any) {
                let startDuration: number;
                // @ts-ignore
                startDuration = Math.round(new Date() - that.startTime);
                if (!result) {result = {};}
                result.startDuration = startDuration;
                resolve(result);
                //reject ({message : "Error !!!"});
            }).catch(async function(err) {
                try {
                    await that.stop();
                } catch (e) {
                    
                }

                await setTimeoutPromised(500).then( () => {
                    that._core._stateManager.transitTo(false, SDKSTATUSENUM.STOPPED);
                });

                if (err) {
                    console.log("[index ] : rainbow_onconnectionerror : ", inspect(err));
                    // It looks that winston is close before this line :(, so console is used. 
                    // that.logger.log("error", LOG_ID + " (evt_internal_xmppfatalerror) Error XMPP, Stop le SDK : ", err);
                    that.events.publish("connectionerror", err);
                    reject(err);
                } else {
                    let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                    error.details = err;
                    console.log("[index ] : rainbow_onconnectionerror : ", inspect(error));
                    that.events.publish("connectionerror", error);
                    reject(error);
                }
            });
        });
    }

    /**
     * @private
     * @method startCLI
     * @instance
     * @description
     *      Start the SDK in CLI mode
     * @memberof NodeSDK
     */
    startCLI() {
        let that = this;
        return new Promise(function(resolve, reject) {
            return that._core.start(true).then(function() {
                resolve(undefined);
            }).catch(async function(err) {
                try {
                    await that.stop();
                } catch (e) {

                }

                let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                error.details = err;
                that.events.publish("connectionerror", error);
                reject(error);
            });
        });
    }

    /**
     * @private
     * @method siginCLI
     * @instance
     * @description
     *      Sign-in in CLI
     * @memberof NodeSDK
     */
    signinCLI() {
        let that = this;
        return new Promise(function(resolve, reject) {
            return that._core.signin(false, undefined).then(function(json) {
                resolve(json);
            }).catch(async function(err) {
                try {
                    await that.stop();
                } catch (e) {

                }

                let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                error.details = err;
                that.events.publish("connectionerror", error);
                reject(error);
            });
        });
    }

    /**
     * @public
     * @method setRenewedToken
     * @instance
     * @description
     *    Set the token renewed externaly of the SDK. This is for oauth authentication.
     * @memberof NodeSDK
     */
    setRenewedToken(strToken) {
        let that = this;
        return that._core.setRenewedToken(strToken);
    }
    
    
    /**
     * @public
     * @method stop
     * @instance
     * @description
     *    Stop the SDK
     * @memberof NodeSDK
     */
    stop() {
        let that = this;
        return new Promise(function(resolve, reject) {
            return that._core.stop().then(function(result) {
                //let success = ErrorManager.getErrorManager().OK;
                setTimeoutPromised(1500).then( () => {
                    //that._core._stateManager.stop();
                    //that.events.publish("stopped", success);
                    resolve(result);
                });
            }).catch(function(err) {
                let error = ErrorManager.getErrorManager().ERROR;
                error.details = err;
                that.events.publish("stopped", error);
                reject(error);
            });
        });
    }

    stopProcess() {
        let self = this;
        // console.log("stopProcess.");

        return async () => {
            try {
                // console.log("stopProcess");
                await self.stop().catch((ee)=>{
                    console.log("stopProcess, stop failed : ", ee);
                });
                await setTimeoutPromised(1000);
                // eslint-disable-next-line no-process-exit
            }
            catch (e) {
                console.log("stopProcess, CATCH Error !!! stop failed : ", e);
            }
            process.exit(0);
        };
    }

    /**
     * @public
     * @property {ImsService} im
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the IM module
     * @return {ImsService}
     */
    get im() : ImsService {
        return this._core.im;
    }

    /**
     * @public
     * @property {ChannelsService} channels
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Channels module
     * @return {ChannelsService}
     */
    get channels() : ChannelsService {
        return this._core.channels;
    }

    /**
     * @public
     * @property {ContactsService} contacts
     * @nodered true
     * @service true
     * @instance
     * @description
     *    Get access to the Contacts module
     * @return {ContactsService}
     */
    get contacts() : ContactsService{
        return this._core.contacts;
    }

    /**
     * @public
     * @property {ConversationsService} conversations
     * @nodered true
     * @service true
     * @instance
     * @description
     *    Get access to the Conversations module
     * @return {ConversationsService}
     */
    get conversations() : ConversationsService{
        return this._core.conversations;
    }

    /**
     * @public
     * @property {PresenceService} presence
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Presence module
     * @return {PresenceService}
     */
    get presence() : PresenceService{
        return this._core.presence;
    }

    /**
     * @public
     * @property {BubblesService} bubbles
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Bubbles module
     * @return {BubblesService}
     */
    get bubbles() : BubblesService{
        return this._core.bubbles;
    }

    /**
     * @public
     * @property {GroupsService} groups
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Groups module
     * @return {GroupsService}
     */
    get groups() : GroupsService{
        return this._core.groups;
    }

    /**
     * @public
     * @property {Events} events
     * @instance
     * @nodered true
     * @description
     *    Get access to the Events module
     * @return {Events}
     */
    get events() : Events{
        return this._core.events;
    }

    /**
     * @public
     * @property {FileServerService} fileServer
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the File Server module
     * @return {FileServerService}
     */
    get fileServer() : FileServerService{
        return this._core.fileServer;
    }

    /**
     * @public
     * @property {FileStorageService} fileStorage
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the File Storage module
     * @return {FileStorageService}
     */
    get fileStorage() : FileStorageService{
        return this._core.fileStorage;
    }

    /**
     * @public
     * @property {AdminService} admin
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Admin module
     * @return {AdminService}
     */
    get admin() : AdminService{
        return this._core.admin;
    }

    /**
     * @public
     * @property {Object} profiles
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Profiles module
     * @return {ProfilesService}
     */
    get profiles() : ProfilesService{
        return this._core.profiles;
    }

    /**
     * @private
     * @property {RESTService} rest
     * @instance
     * @description
     *    Get access to the REST module
     * @return {RESTService}
     */
    get rest() : RESTService{
        return this._core.rest;
    }

    /**
     * @public
     * @property {SettingsService} settings
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the Settings module
     * @return {SettingsService}
     */
    get settings() : SettingsService{
        return this._core.settings;
    }

    /**
     * @public
     * @property {SDKSTATUSENUM} state
     * @instance
     * @nodered true
     * @description
     *    Return the state of the SDK (eg: STOPPED, STARTED, CONNECTED, READY, DISCONNECTED, RECONNECTING, FAILED, ERROR)
     * @return {SDKSTATUSENUM}
     */
    get state() : SDKSTATUSENUM{
        return this._core.state;
    }

    /**
     * @public
     * @property {String} version
     * @instance
     * @nodered true
     * @description
     *      Return the version of the SDK
     * @return {String}
     */
    get version() {
        return this._core.version;
    }

    /**
     * @public
     * @property {ConnectedUser} connectedUser
     * @instance
     * @nodered true
     * @description
     *      Return the connected user information
     * @return {any}
     */
    get connectedUser() {
        return this._core.rest.account;
    }

    /**
     * @public
     * @property {TelephonyService} telephony
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the telephony module
     * @return {TelephonyService}
     */
    get telephony() : TelephonyService{
        return this._core.telephony;
    }

    /**
     * @public
     * @property {TasksService} tasks
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the tasks module
     * @return {TasksService}
     */
    get tasks() : TasksService{
        return this._core.tasks;
    }

    /**
     * @public
     * @property {CallLogService} calllog
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the calllog module
     * @return {CallLogService}
     */
    get calllog() : CallLogService{
        return this._core.calllog;
    }

    /**
     * @public
     * @property {FavoritesService} favorites
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the favorite module
     * @return {FavoritesService}
     */
    get favorites() : FavoritesService{
        return this._core._favorites;
    }

    /**
     * @public
     * @property {InvitationsService} invitations
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the invitation module
     * @return {InvitationsService}
     */
    get invitations() : InvitationsService{
        return this._core._invitations;
    }

    /**
     * @public
     * @property {S2SService} s2s
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the s2s module
     * @return {S2SService}
     */
    get s2s() : S2SService{
        return this._core._s2s;
    }

    /**
     * @public
     * @property {AlertsService} alerts
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the alerts module
     * @return {AlertsService}
     */
    get alerts() : AlertsService{
        return this._core._alerts;
    }

    /**
     * @public
     * @property {RBVoiceService} alerts
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the webinar module
     * @return {RBVoiceService}
     */
    get rbvoice() : RBVoiceService {
        return this._core._rbvoice;
    }

    /**
     * @public
     * @property {WebinarsService} alerts
     * @intance
     * @nodered true
     * @service true
     * @description
     *    Get access to the webinar module
     * @return {WebinarsService}
     */
    get webinars() : WebinarsService {
        return this._core._webinars;
    }

    /**
     * @public
     * @property {HTTPoverXMPP} httpoverxmpp
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the httpoverxmpp module
     * @return {HTTPoverXMPP}
     */
    get httpoverxmpp() : HTTPoverXMPP {
        return this._core._httpoverxmpp;
    }
    
    /**
     * @public
     * @property {RPCoverXMPPService} rpcoverxmpp
     * @instance
     * @nodered true
     * @service true
     * @description
     *    Get access to the rpcoverxmpp module
     * @return {RPCoverXMPPService}
     */
    get rpcoverxmpp() : RPCoverXMPPService {
        return this._core._rpcoverxmpp;
    }
    
    /**
     * @public
     * @property {Object} DataStoreType
     * @description
     *    Get access to the DataStoreType type
     * @return {DataStoreType}
     */
    static get DataStoreType() {
        return DataStoreType;
    }

    get Utils() {
        return this._core.Utils;
    }
    
    /**
     * @public
     * @method getConnectionStatus
     * @instance
     * @nodered true
     * @description
     *    Get connections status of each low layer services, and also the full SDK state. <br>
     * <br>
     * { <br>
     * restStatus: boolean, The status of the REST connection authentication to rainbow server. <br>
     * xmppStatus: boolean, The status of the XMPP Connection to rainbow server. <br>
     * s2sStatus: boolean, The status of the S2S Connection to rainbow server. <br>
     * state: SDKSTATUSENUM The state of the SDK. <br>
     * nbHttpAdded: number, the number of HTTP requests (any verb GET, HEAD, POST, ...) added in the HttpManager queue. Note that it is reset to zero when it reaches Number.MAX_SAFE_INTEGER value. <br>
     * httpQueueSize: number, the number of requests stored in the Queue. Note that when a request is sent to server, it is already removed from the queue. <br>
     * nbRunningReq: number, the number of requests which has been poped from the queue and the SDK did not yet received an answer for it. <br>
     * maxSimultaneousRequests : number, the number of request which can be launch at a same time. <br>
     * nbReqInQueue : number, the number of requests waiting for being treated by the HttpManager.  <br>
     * } <br>
     * @return {Promise<{ restStatus: boolean, xmppStatus: boolean, s2sStatus: boolean, state: SDKSTATUSENUM, nbHttpAdded: number, httpQueueSize: number, nbRunningReq: number, maxSimultaneousRequests : number }>}
     * @category async
     */
    getConnectionStatus () : Promise<{restStatus: boolean, xmppStatus: boolean, s2sStatus: boolean, state: SDKSTATUSENUM, nbHttpAdded: number, httpQueueSize: number, nbRunningReq: number, maxSimultaneousRequests : number}> {
        return this._core.getConnectionStatus();
    }


    /**
     * @public
     * @method Appreciation
     * @static
     * @description
     *    Get connections Appreciation type. <br>
     * @return {Appreciation}
     */
    static get Appreciation() {
        return Appreciation;
    }
    
}

module.exports = NodeSDK;
module.exports.NodeSDK = NodeSDK;
module.exports.default = NodeSDK;
export default NodeSDK;
export { NodeSDK as NodeSDK}; //, OptionsType};
