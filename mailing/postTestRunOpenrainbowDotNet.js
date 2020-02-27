"use strict";

const DataStoreType = require("../lib/config/config").DataStoreType;

const md = require("markdown").markdown;
const fs = require("fs");
const path = require("path");

const RainbowSDK = require("../index");
//const Utils = require("../lib/common/Utils");

// Define your configuration
let options = {
    "rainbow": {
         "host": "official",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "credentials": {
        "login": "",  // The Rainbow email account to use
        "password": "",   // The Rainbow associated password to use
    },
    // Application identifier
    "application": {
               "appID": "", // The Rainbow Application Identifier - application must have a 'deployed' state OFFICIAL
               "appSecret": "", // The Rainbow Application Secret - retrieved from developer hub OFFICIAL
    },
    // */
    /*
        // Proxy configuration
        proxy: {
            host: "",
            port: 8080,
            protocol: "http",
            user: "",
            password: "",
        }, // */
    // Logs options
    "logs": {
        "enableConsoleLogs": true,
        "enableFileLogs": false,
        "color": true,
        "level": "debug",
        "customLabel": "ChangeLog",
        "system-dev": {
            "internals": true,
            "http": true,
        },
        "file": {
            "path": "c:/temp/",
            "customFileName": "R-SDK-Node-ChangeLog",
            //"level": 'info',                    // Default log level used
            "zippedArchive": false /*,
            "maxSize" : '10m',
            "maxFiles" : 10 // */
        }
    },
    // IM options
    "im": {
        "sendReadReceipt": false,
        "messageMaxLength": 1024,
        "sendMessageToConnectedUser": false,
        "conversationsRetrievedFormat": "small",
        "storeMessages": false,
        "copyMessage": true,
        "messagesDataStore": DataStoreType.NoPermanentStore
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
            start_up: true,
        },
        "calllog": {
            "start_up": true,
        },
        "favorites": {
            "start_up": true,
        }, //need services :
        "webrtc": {
            "start_up": true,
            "optional": true
        } // */
    } // */
};

let action = "start";
let bullName = "Bulle_NodeSDK";
process.argv.forEach((val, index) => {
    //console.log(`${index}: ${val}`);
    if (`${val}`.startsWith("login=") ) {
        options.credentials.login = `${val}`.substring(6);
    }
    if (`${val}`.startsWith("password=") ) {
        options.credentials.password = `${val}`.substring(9);
    }
    if (`${val}`.startsWith("host=") ) {
        options.rainbow.host = `${val}`.substring(5);
    }
    if (`${val}`.startsWith("appID=") ) {
        options.application.appID = `${val}`.substring(6);
    }
    if (`${val}`.startsWith("appSecret=") ) {
        options.application.appSecret = `${val}`.substring(10);
    }
    if (`${val}`.startsWith("action=") ) {
        action = `${val}`.substring(7);
    }
    if (`${val}`.startsWith("bullName=") ) {
        bullName = `${val}`.substring(9);
    }
});


options.logs.customLabel = options.credentials.login;
// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

let logger = rainbowSDK._core.logger;

// logger.log("internal", "MAIN - options : ", options);

rainbowSDK.events.on("rainbow_onready", () => {
    // do something when the SDK is ready to be used
    logger.log("debug", "MAIN - rainbow_onready - rainbow onready");
});

rainbowSDK.events.on("rainbow_onstarted", () => {
    // do something when the SDK has been started
    logger.log("debug", "MAIN - rainbow_onstarted - rainbow onstarted");
});

rainbowSDK.start(undefined).then(async(result) => {
    try {
        // Do something when the SDK is started
        logger.log("debug", "MAIN - rainbow SDK started result 1 : ", logger.colors.green(result)); //logger.colors.green(JSON.stringify(result)));
        //let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        //let packageJSON = JSON.parse(content);
        //let minVersion = packageJSON.version.indexOf("-dotnet") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-dotnet") - 2) : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
        //let fullVersion = packageJSON.version;
        //let currentVersion = packageJSON.version.indexOf("-dotnet") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-dotnet")) : packageJSON.version;

        let allBubbles = await rainbowSDK.bubbles.getAllBubbles(); // "5e56968c6f18201dde44fa7c"
        let bubble = allBubbles ? allBubbles.filter((bull) => { return bull.name === bullName; }) : null;
        let content = {
            message: "*`--" + action.toUpperCase() + "--` AfterBuild **Node SDK TESTs***  \n-----------------",
            type: "text/markdown"
        };
        if (bubble) {
            logger.log("debug", "MAIN - bubble : ", bubble, ", action : ", action); //logger.colors.green(JSON.stringify(result)));
            switch (action) {
                case "start":
                    /*let txt = "# TYPESCRIPT in SDK for Node.JS\n" +
                        "\n" +
                        "Here is the howto TypeScript in **Rainbow-Node-SDK**\n";

                     */
                    logger.log("debug", "MAIN - send start to bubble"); //logger.colors.green(JSON.stringify(result)));
                    await rainbowSDK.im.sendMessageToBubble("Start", bubble[0], "en", content, "Start AfterBuild Node SDK TESTs", undefined);
                break;
                case "stop":
                    logger.log("debug", "MAIN - send stop to bubble"); //logger.colors.green(JSON.stringify(result)));
                    await rainbowSDK.im.sendMessageToBubble("Stop", bubble[0], "en", content, "Stop AfterBuild Node SDK TESTs", undefined);
                break;
                default:
                    logger.log("debug", "MAIN - unknown action : ", action); //logger.colors.green(JSON.stringify(result)));
                    break;
            }
        } else {
            logger.log("warn", "bubble is empty, so can not publish.");
        }

    } catch (err){
        logger.log("error", "!!! CATCH Error so can not publish message in bubble : ", err);
    }

    rainbowSDK.stop().then(() => {
        process.exit(0);
    });
});
