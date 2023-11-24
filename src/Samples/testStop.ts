import {NodeSDK as RainbowSDK} from "../index";
import {DataStoreType} from "../lib/config/config";

let options: any = {
    "rainbow": {
        "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
        //      "host": "openrainbow.net",
        // "mode": "s2s"
        "mode": "xmpp",
        //"mode": "xmpp"
        // "concurrentRequests" : 20
    },
    "xmpp": {
        "host": "",
        "port": "443",
        "protocol": "wss",
        "timeBetweenXmppRequests": "20",
        "raiseLowLevelXmppInEvent": false,
        "raiseLowLevelXmppOutReq": false,
        "maxIdleTimer": 16000,
        "maxPingAnswerTimer": 11000,
        // "xmppRessourceName": "vnagw"
    },
    "s2s": {
        "hostCallback": "urlS2S",
        //"hostCallback": "http://70a0ee9d.ngrok.io",
        "locallistenningport": "4000"
    },
    /*"rest":{
        "useRestAtStartup" : true
    }, // */
    "credentials": {
        "login": "",  // The Rainbow email account to use
        "password": "",
    },
    // Application identifier
    "application": {
        "appID": "",
        "appSecret": ""

    },
    // */

    // Proxy configuration
    proxy: {
        host: undefined,
        port: 8080,
        protocol: undefined,
        user: undefined,
        password: undefined,
        secureProtocol: undefined //"SSLv3_method"
    }, // */
    // Proxy configuration

    /*
    proxy: {
        host: "10.67.253.14",
        port: 8081,
        protocol: "http",
       // user: "",
        //password: "",
        //secureProtocol: "SSLv3_method"
    }, // */
    // Logs options
    "logs": {
        "enableConsoleLogs": true,
        "enableFileLogs": false,
        "enableEventsLogs": false,
        "enableEncryptedLogs": false,
        "color": true,
        //"level": "info",
        "level": "debug",
        "customLabel": "RainbowSample",
        "system-dev": {
            "internals": true,
            "http": true,
        },
        "file": {
            "path": "c:/temp/",
            "customFileName": "R-SDK-Node-Sample",
            //"level": 'info',                    // Default log level used
            "zippedArchive": false /*,
            "maxSize" : '10m',
            "maxFiles" : 10 // */
        }
    },
    "testOutdatedVersion": true,
    "testDNSentry": true,
    "httpoverxmppserver": true,
    "intervalBetweenCleanMemoryCache": 1000 * 60 * 60 * 6, // Every 6 hours.
    "requestsRate": {
        "useRequestRateLimiter": false,
        "maxReqByIntervalForRequestRate": 600, // nb requests during the interval.
        "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit.
        "timeoutRequestForRequestRate": 600 // nb seconds Request stay in queue before being rejected if queue is full.
    },
    // IM options
    "im": {
        "sendReadReceipt": true,
//            "messageMaxLength": 1024,
        "sendMessageToConnectedUser": false,
        "conversationsRetrievedFormat": "small",
        "storeMessages": false,
        "copyMessage": true,
        "nbMaxConversations": 15,
        "rateLimitPerHour": 100000,
//        "messagesDataStore": DataStoreType.NoStore,
        "messagesDataStore": DataStoreType.StoreTwinSide,
        "autoInitialBubblePresence": true,
        "autoLoadConversations": true,
        // "autoInitialBubblePresence": false,
        // "autoLoadConversations": false,
        "autoLoadContacts": true,
        "enableCarbon": true,
        "enablesendurgentpushmessages": true,
        "useMessageEditionAndDeletionV2": true
    },
    // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.
    // Take care, severals services are linked, so disabling a service can disturb an other one.
    // By default all the services are started. Events received from server are not yet filtered.
    // So this feature is realy risky, and should be used with much more cautions.
    "servicesToStart": {
        "bubbles": {
            "start_up": true,
        },
        "telephony": {
            "start_up": true,
        },
        "channels": {
            "start_up": true,
        },
        "admin": {
            "start_up": true,
        },
        "fileServer": {
            "start_up": true,
        },
        "fileStorage": {
            "start_up": true,
        },
        "calllog": {
            "start_up": true,
        },
        "favorites": {
            "start_up": true,
        },
        "alerts": {
            "start_up": true,
        }, //need services :
        "webrtc": {
            "start_up": true,
            "optional": true
        } // */
    } // */
};

process.argv.forEach((val, index) => {
    //console.log(`${index}: ${val}`);
    if (`${val}`.startsWith("login=")) {
        options.credentials.login = `${val}`.substring(6);
    }
    if (`${val}`.startsWith("password=")) {
        options.credentials.password = `${val}`.substring(9);
    }
    if (`${val}`.startsWith("host=")) {
        options.rainbow.host = `${val}`.substring(5);
    }
    if (`${val}`.startsWith("appID=")) {
        options.application.appID = `${val}`.substring(6);
    }
    if (`${val}`.startsWith("appSecret=")) {
        options.application.appSecret = `${val}`.substring(10);
    }
});


options.logs.customLabel = options.credentials.login;


options.logs.customLabel = options.credentials.login;

const rainbowSDK : RainbowSDK = new RainbowSDK(options);

rainbowSDK.start().then(() => {

    let bubbles = rainbowSDK.bubbles.getAllActiveBubbles(); //.then( (bubble) =>
    //{
      let bubble = bubbles[0];
        rainbowSDK.im.sendMessageToBubbleJid("rainbowPost.message", bubble.jid, "en", "", undefined, "")
                .finally(() => rainbowSDK.stop())
    //});

});
