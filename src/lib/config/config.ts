// Desactivated option because it is a preference one, so it impacted every ressources.
// DataStoreType.NoStoreBotSide The messages are not stored on  loggued-in Bot's history, but are stored on the other side. So the contact kept the messages exchanged with bot in his history.
// NoStoreBotSide = "nostorebotside",

import {LEVELSNAMES} from "../common/LevelLogs.js";

/**
 *  used in SDK parameter "messagesDataStore": DataStoreType.NoStore, Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.NoStore")
 *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.
 *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).
 *                          DataStoreType.StoreTwinSide The messages are fully stored.
 *                          DataStoreType.Store Offline storage and Message Archive Management (XEP-0313) [4] can define their own rules on what messages to store and usually only store messages that contain a body element. However a sender may want to indicate that a message is worth storing even though it might not match those rules.
 * @public
 * @enum {string}
 * @readonly
 */
enum DataStoreType {
    /** Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact. */
    NoStore = "no-store",
    /** Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending). */
    NoPermanentStore = "no-permanent-store",
    /** The messages are fully stored. */
    StoreTwinSide = "storetwinside",
    /**
     * Offline storage and Message Archive Management (XEP-0313) [4] can define their own rules on what messages to store and usually only store messages that contain a body element.
     * However a sender may want to indicate that a message is worth storing even though it might not match those rules
     * (e.g. an encrypted message that carries the payload outside the body element). Such a message can be marked with a <store/> hint.
     * */
    Store = "store"
}

enum UrgencyType {
    /**
     * Urgent message
     * @type {UrgencyType.HIGH}
     */
    HIGH = 'high',
    /**
     *  important message
     * @type {UrgencyType.MIDDLE}
     */
    MIDDLE = 'middle',
    /**
     *  information message
      * @type {UrgencyType.LOW}
     */
    LOW = 'low',
    /**
     *  standard message (null/undefined value is also treated as a standard message)
     * @type {UrgencyType.STANDARD}
     */
    STANDARD = 'std'
}

let conf =  {
    "sandbox": {
        "http": {
            "host": "sandbox.openrainbow.com",
            "port": "443",
            "protocol": "https",
        },
        "xmpp": {
            "host": "sandbox.openrainbow.com",
            "port": "443",
            "protocol": "wss",
            "timeBetweenXmppRequests": "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 15000,
            "maxPingAnswerTimer": 10000,
            "xmppRessourceName": undefined,
            "maxPendingAsyncLockXmppQueue": 10000,
            "stanzaMaxLength" : 18380, // Max stanza size on server is 18432
        },
        "s2s": {
            "hostCallback": "nrock",
            "locallistenningport": "4000",
            "expressEngine": undefined
        },
        "rest":{
            "useRestAtStartup" : true,
            "gotOptions": {
                "agentOptions": {
                    /**
                     * Keep sockets around in a pool to be used by other requests in the future. Default = false
                     */
                    "keepAlive": true, // ?: boolean | undefined;
                    /**
                     * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
                     * Only relevant if keepAlive is set to true.
                     */
                    "keepAliveMsecs": 4302, // ?: number | undefined;
                    /**
                     * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
                     */
                    "maxSockets": Infinity, // ?: number | undefined;
                    /**
                     * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
                     */
                    "maxTotalSockets": Infinity, // ?: number | undefined;
                    /**
                     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
                     */
                    "maxFreeSockets": 1002, // ?: number | undefined;
                    /**
                     * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
                     */
                    "timeout": 55002, // ?: number | undefined;
                    /**
                     * If not false, the server certificate is verified against the list of supplied CAs. Default: true.
                     */
                    "rejectUnauthorized": true
                },
                "gotRequestOptions": {
                    "timeout": { // This object describes the maximum allowed time for particular events.
                        "lookup": 5252, // lookup: 100, Starts when a socket is assigned.  Ends when the hostname has been resolved.
                        "connect": 10252, // connect: 50, Starts when lookup completes.  Ends when the socket is fully connected.
                        "secureConnect": 10252, // secureConnect: 50, Starts when connect completes. Ends when the handshake process completes.
                        "socket": 55000, // socket: 1000, Starts when the socket is connected. Resets when new data is transferred.
                        "send": 120002, // send: 10000, // Starts when the socket is connected. Ends when all data have been written to the socket.
                        "response": 120002 // response: 1000 // Starts when request has been flushed. Ends when the headers are received.
                    }
                } // */
            }
        }
    },
    "official": {
        "http": {
            "host": "openrainbow.com",
            "port": "443",
            "protocol": "https",
        },
        "xmpp": {
            "host": "openrainbow.com",
            "port": "443",
            "protocol": "wss",
            "timeBetweenXmppRequests": "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 15000,
            "maxPingAnswerTimer": 10000,
            "xmppRessourceName": undefined,
            "maxPendingAsyncLockXmppQueue": 10000,
            "stanzaMaxLength" : 18380, // Max stanza size on server is 18432
        },
        "s2s": {
            "hostCallback": "nrock",
            "locallistenningport": "4000",
            "expressEngine": undefined
        },
        "rest":{
            "useRestAtStartup" : true,
            "gotOptions": {
                "agentOptions": {
                    /**
                     * Keep sockets around in a pool to be used by other requests in the future. Default = false
                     */
                    "keepAlive": true, // ?: boolean | undefined;
                    /**
                     * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
                     * Only relevant if keepAlive is set to true.
                     */
                    "keepAliveMsecs": 4302, // ?: number | undefined;
                    /**
                     * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
                     */
                    "maxSockets": Infinity, // ?: number | undefined;
                    /**
                     * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
                     */
                    "maxTotalSockets": Infinity, // ?: number | undefined;
                    /**
                     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
                     */
                    "maxFreeSockets": 1002, // ?: number | undefined;
                    /**
                     * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
                     */
                    "timeout": 55000, // ?: number | undefined; // VBR CRRAINB below server keep-alive idle timeout (~60s) to avoid ECONNRESET on stale sockets
                    /**
                     * If not false, the server certificate is verified against the list of supplied CAs. Default: true.
                     */
                    "rejectUnauthorized": true
                },
                "gotRequestOptions": {
                    "timeout": { // This object describes the maximum allowed time for particular events.
                        "lookup": 5252, // lookup: 100, Starts when a socket is assigned.  Ends when the hostname has been resolved.
                        "connect": 10252, // connect: 50, Starts when lookup completes.  Ends when the socket is fully connected.
                        "secureConnect": 10252, // secureConnect: 50, Starts when connect completes. Ends when the handshake process completes.
                        "socket": 55000, // socket: 1000, Starts when the socket is connected. Resets when new data is transferred.
                        "send": 120002, // send: 10000, // Starts when the socket is connected. Ends when all data have been written to the socket.
                        "response": 120002 // response: 1000 // Starts when request has been flushed. Ends when the headers are received.
                    }
                } // */
            }
        }
    },
    "any": {
        "http": {
            "host": "",
            "port": "443",
            "protocol": "https"
        },
        "xmpp": {
            "host": "",
            "port": "443",
            "protocol": "wss",
            "timeBetweenXmppRequests": "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 15000,
            "maxPingAnswerTimer": 10000,
            "xmppRessourceName": undefined,
            "maxPendingAsyncLockXmppQueue": 10000,
            "stanzaMaxLength" : 18380, // Max stanza size on server is 18432
        },
        "s2s": {
            "hostCallback": "nrock",
            "locallistenningport": "4000",
            "expressEngine": undefined
        }
        ,
        "rest":{
            "useRestAtStartup" : true,
            "gotOptions": {
                "agentOptions": {
                    /**
                     * Keep sockets around in a pool to be used by other requests in the future. Default = false
                     */
                    "keepAlive": true, // ?: boolean | undefined;
                    /**
                     * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
                     * Only relevant if keepAlive is set to true.
                     */
                    "keepAliveMsecs": 4302, // ?: number | undefined;
                    /**
                     * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
                     */
                    "maxSockets": Infinity, // ?: number | undefined;
                    /**
                     * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
                     */
                    "maxTotalSockets": Infinity, // ?: number | undefined;
                    /**
                     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
                     */
                    "maxFreeSockets": 1002, // ?: number | undefined;
                    /**
                     * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
                     */
                    "timeout": 55000, // ?: number | undefined; // VBR CRRAINB below server keep-alive idle timeout (~60s) to avoid ECONNRESET on stale sockets
                    /**
                     * If not false, the server certificate is verified against the list of supplied CAs. Default: true.
                     */
                    "rejectUnauthorized": true
                },
                "gotRequestOptions": {
                    "timeout": { // This object describes the maximum allowed time for particular events.
                        "lookup": 5252, // lookup: 100, Starts when a socket is assigned.  Ends when the hostname has been resolved.
                        "connect": 10252, // connect: 50, Starts when lookup completes.  Ends when the socket is fully connected.
                        "secureConnect": 10252, // secureConnect: 50, Starts when connect completes. Ends when the handshake process completes.
                        "socket": 55000, // socket: 1000, Starts when the socket is connected. Resets when new data is transferred.
                        "send": 120002, // send: 10000, // Starts when the socket is connected. Ends when all data have been written to the socket.
                        "response": 120002 // response: 1000 // Starts when request has been flushed. Ends when the headers are received.
                    }
                } // */
            }
        }
    },
    "logs": {
        "path": "/var/tmp/rainbowsdk/",
        "level": LEVELSNAMES.INFO,
        "color": false,
        "enableConsoleLog": true,
        "enableEventsLogs": false,
        "enableEncryptedLogs": false,
        "system-dev": {
            "internals": false,
            "http": false
        },
        "zippedArchive": true,
        "maxSize" : "10m",
        "maxFiles" : null
    },
    "im": {
        "sendReadReceipt": true,
        "messageMaxLength": 16384, // Max stanza size on server is 18432
        "sendMessageToConnectedUser": false,
        "conversationsRetrievedFormat": "small",
        /* copyMessage: true, /* https://xmpp.org/extensions/xep-0334.html#hints :
        No copies :
            Messages with the <no-copy/> hint should not be copied to addresses other than the one to which it is addressed, for example through Message Carbons (XEP-0280) [3].
            This hint MUST only be included on messages addressed to full JIDs and explicitly does not override the behaviour defined in XMPP IM [1] for handling messages to bare JIDs,
            which may involve copying to multiple resources, or multiple occupants in a Multi-User Chat (XEP-0045) [6] room.
        // */
        "copyMessage": true,
        "nbMaxConversations": 15,
        "rateLimitPerHour": 10000,
        "messagesDataStore": DataStoreType.NoStore,
        "autoInitialGetBubbles": true,
        "autoInitialBubblePresence": true,
        "maxBubbleJoinInProgress": 10,
        "autoInitialBubbleFormat": "full",
        "autoInitialBubbleUnsubscribed": true,
        "autoLoadConversations": true,
        "autoLoadConversationHistory": false,
        "autoLoadContacts": true,
        "autoInitialLoadContactsInfoBulk": true,
        "autoLoadCallLog": false,
        "forceHistoryGetContactFromServer": false,
        // manage carbon copy https://xmpp.org/extensions/xep-0280.html
        "enableCarbon": true,
        "enablesendurgentpushmessages": false,
        "useMessageEditionAndDeletionV2": true,
        "storeMessagesInConversation": true,
        "maxMessagesStoredInConversation": 1000
    },
    "mode":"xmpp",
    "concurrentRequests": 1000,
    "requestsRate": {
        "useRequestRateLimiter": true,
        "maxReqByIntervalForRequestRate": 20250, // nb requests during the interval.
        "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit.
        "timeoutRequestForRequestRate": 600, // nb seconds Request stay in queue before being rejected if queue is full.
    },
    "intervalBetweenCleanMemoryCache": 1000 * 60 * 60 * 6, // Every 6 hours
    "debug":true,
    "permitSearchFromPhoneBook":true,
    "displayOrder":"firstLast",
    "testOutdatedVersion": false,
    "testDNSentry": true,
    "autoReconnectIgnoreErrors": false,
    "httpoverxmppserver": false,
    "servicesToStart" : {
            "s2s": {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._settings);
            "presence": {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._settings);
            "contacts":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "conversations" :  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._bubbles, that._fileStorage, that._fileServer);
            "im" :  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._conversations, that._bubbles, that._fileStorage);
            "profiles" :  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "groups" :  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);

            "bubbles":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "telephony":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._bubbles, that._profiles);
            "channels":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "admin":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "backendStatus":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._rest);
            "fileServer":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest, that._fileStorage);
            "fileStorage":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest, that._fileServer, that._conversations);
            "calllog":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._profiles, that._telephony);
            "favorites":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "alerts":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "invitation":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services :  (that._xmpp, that._rest);
            "settings":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services : ( XMPPService, _rest : RESTService)
            "webinar":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services : ( )
            "rbvoice":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services : ( )
            "httpoverxmpp":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services : ( )
            "rpcoverxmpp":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            }, //need services : ( )
            "tasks":  {
                "start_up":true,
                "optional":true,
                "logEntryParameters":false
            } //need services : ( )
    }

};
module.exports.config = conf;
//module.exports.OptionsType = OptionsType;
module.exports.DataStoreType = DataStoreType;
module.exports.UrgencyType = UrgencyType;
export {conf as config , DataStoreType, UrgencyType};
