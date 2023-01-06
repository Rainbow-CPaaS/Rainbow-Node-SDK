// Desactivated option because it is a preference one, so it impacted every ressources.
// DataStoreType.NoStoreBotSide The messages are not stored on  loggued-in Bot's history, but are stored on the other side. So the contact kept the messages exchanged with bot in his history.
// NoStoreBotSide = "nostorebotside",

/**
 *  used in SDK parameter "messagesDataStore": DataStoreType.NoStore, Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour)
 *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.
 *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).
 *                          DataStoreType.StoreTwinSide The messages are fully stored.
 *                          DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.
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
    /** To follow the storeMessages SDK's parameter behaviour. */
    UsestoreMessagesField = "OldstoreMessagesUsed"
}

let conf =  {
    sandbox: {
        http: {
            host: "sandbox.openrainbow.com",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "sandbox.openrainbow.com",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 15000,
            "maxPingAnswerTimer": 10000,
            "xmppRessourceName": undefined
        },
        s2s: {
            hostCallback: "nrock",
            locallistenningport: "4000"
        },
        rest:{
            useRestAtStartup : true
        }
    },
    official: {
        http: {
            host: "openrainbow.com",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "openrainbow.com",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 15000,
            "maxPingAnswerTimer": 10000,
            "xmppRessourceName": undefined
        },
        s2s: {
            hostCallback: "nrock",
            locallistenningport: "4000"
        },
        rest:{
            useRestAtStartup : true
        }
    },
    any: {
        http: {
            host: "",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 15000,
            "maxPingAnswerTimer": 10000,
            "xmppRessourceName": undefined
        },
        s2s: {
            hostCallback: "nrock",
            locallistenningport: "4000"
        }
        ,
        rest:{
            useRestAtStartup : true
        }
    },
    logs: {
        path: "/var/tmp/rainbowsdk/",
        level: "info",
        color: false,
        enableConsoleLog: true,
        enableEventsLogs: false,
        enableEncryptedLogs: false,
        "system-dev": {
            internals: false,
            http: false
        },
        zippedArchive: true,
        maxSize : "10m",
        maxFiles : null
    },
    im: {
        sendReadReceipt: true,
        messageMaxLength: 16384,
        sendMessageToConnectedUser: false,
        conversationsRetrievedFormat: "small",
        storeMessages: true, /* https://xmpp.org/extensions/xep-0334.html#hints :
         No store :
            A message containing a <no-store/> hint should not be stored by a server either permanently (as above) or temporarily,
            e.g. for later delivery to an offline client, or to users not currently present in a chatroom.
         // */
        /* copyMessage: true, /* https://xmpp.org/extensions/xep-0334.html#hints :
        No copies :
            Messages with the <no-copy/> hint should not be copied to addresses other than the one to which it is addressed, for example through Message Carbons (XEP-0280) [3].
            This hint MUST only be included on messages addressed to full JIDs and explicitly does not override the behaviour defined in XMPP IM [1] for handling messages to bare JIDs,
            which may involve copying to multiple resources, or multiple occupants in a Multi-User Chat (XEP-0045) [6] room.
        // */
        copyMessage: true,
        nbMaxConversations: 15,
        rateLimitPerHour: 1000,
        messagesDataStore: DataStoreType.UsestoreMessagesField,
        autoInitialGetBubbles: true,
        autoInitialBubblePresence: true,
        "autoInitialBubbleFormat": "small",
        "autoInitialBubbleUnsubscribed": false,
        autoLoadConversations: true,
        autoLoadContacts: true,
        // manage carbon copy https://xmpp.org/extensions/xep-0280.html
        enableCarbon: true,
        enablesendurgentpushmessages: false,
        useMessageEditionAndDeletionV2: false
    },
    mode:"xmpp",
    "concurrentRequests": 1000,
    "requestsRate": {
        "maxReqByIntervalForRequestRate": 600, // nb requests during the interval.
        "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit.
        "timeoutRequestForRequestRate": 600, // nb seconds Request stay in queue before being rejected if queue is full.
    },
    intervalBetweenCleanMemoryCache: 1000 * 60 * 60 * 6, // Every 6 hours 
    debug:true,
    permitSearchFromPhoneBook:true,
    displayOrder:"firstLast",
    testOutdatedVersion: true,
    testDNSentry: true,
    httpoverxmppserver: false,
    servicesToStart : {
            s2s: {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._settings);
            presence: {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._settings);
            contacts:  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest);
            conversations :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._bubbles, that._fileStorage, that._fileServer);
            im :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._conversations, that._bubbles, that._fileStorage);
            profiles :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest);
            groups :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest);

            bubbles:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            telephony:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._bubbles, that._profiles);
            channels:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            admin:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            fileServer:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._fileStorage);
            fileStorage:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._fileServer, that._conversations);
            calllog:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._profiles, that._telephony);
            favorites:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            alerts:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            invitation:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            settings:  {
                start_up:true,
                optional:true
            }, //need services : ( XMPPService, _rest : RESTService)
            webinar:  {
                start_up:true,
                optional:true
            }, //need services : ( )
            rbvoice:  {
                start_up:true,
                optional:true
            }, //need services : ( )
        httpoverxmpp:  {
                start_up:true,
                optional:true
            } //need services : ( )
    }

};
module.exports.config = conf;
//module.exports.OptionsType = OptionsType;
module.exports.DataStoreType = DataStoreType;
export {conf as config , DataStoreType};
