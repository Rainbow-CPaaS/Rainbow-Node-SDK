"use strict";

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
        "enableConsoleLogs": false,
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
        "sendReadReceipt": true,
        "messageMaxLength": 1024,
        "sendMessageToConnectedUser": true,
        "conversationsRetrievedFormat": "small",
        "storeMessages": false,
        "copyMessage": true
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
        let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        let packageJSON = JSON.parse(content);
        let minVersion = packageJSON.version.indexOf("-dotnet") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-dotnet") - 2) : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
        //let fullVersion = packageJSON.version;
        //let currentVersion = packageJSON.version.indexOf("-dotnet") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-dotnet")) : packageJSON.version;

        let mychannels = await rainbowSDK.channels.findChannelsByName("RNodeSdkChangeLog");
        let mychannel = mychannels ? mychannels[0] : null;
        if (mychannel) {
            //for (let i = 0; i < 1; i++) {
            //let now = new Date().getTime();

            let product = {};

            let item = {
                "title": "Rainbow Node SDK ChangeLog : " + minVersion,
                "path": "./CHANGELOG.md"
            };

            product.title = item.title;

            fs.readFile(item.path, "utf8", async(err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                let tree = md.parse(data.toString());

                let version = null;
                let filteredTree = tree.filter((markdownElt, index) => {
                    if (index === 0) {
                        return true;
                    }
                    if (item[0] === "hr") {
                        return false;
                    }

                    if (markdownElt[0] === "header" && markdownElt[1].level === 2) {
                        // A version
                        version = markdownElt[2][2];
                        if (version.startsWith(minVersion)) {
                            return true;
                        } else {
                            version = null;
                        }
                    }

                    if (markdownElt[0] === "bulletlist") {
                        if (version) {
                            return true;
                        }
                    }

                    return false;
                });

               let html = md.renderJsonML(md.toHTMLTree(filteredTree));


                await rainbowSDK.channels.createItem(mychannel, html, product.title, null, null).then((res) => {
                    logger.log("debug", "createItem - res : ", res);
                });

            });

            //}
        } else {
            logger.log("warn", "createItem - mychannel is empty, so can not publish.");
        }

    } catch (err){
        logger.log("error", "CATCH Error so can not publish CHANGELOG in channel : ", err);
    }

    rainbowSDK.stop().then(() => {
        process.exit(0);
    });
});
