"use strict";
/*
 * @name index.ts
 *
 * @description :
 * The index.ts file is not a "best practice", but it is a file used by developper to test/validate the SDK, so you can find in it some help.
 *
 */
import {pause, setTimeoutPromised, until, getRandomInt} from "../lib/common/Utils";
import set = Reflect.set;
import {url} from "inspector";
import {OFFERTYPES} from "../lib/services/AdminService";
import {Conversation} from "../lib/common/models/Conversation";
import {createWriteStream} from "fs";
import {SDKSTATUSENUM} from "../lib/common/StateManager";
import {AlertFilter} from "../lib/common/models/AlertFilter";
import {List} from "ts-generic-collections-linq";
import {AlertTemplate} from "../lib/common/models/AlertTemplate";
import {Alert} from "../lib/common/models/Alert";
import {AlertDevice, AlertDevicesData} from "../lib/common/models/AlertDevice";
import {Contact} from "../lib/common/models/Contact";
import {ConferenceSession} from "../lib/common/models/ConferenceSession";
import {DataStoreType} from "../lib/config/config";

// @ts-ignore
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value:new P(function (resolve) {
            resolve(value);
        });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value):adopt(result.value).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {value: true});
// Load the SDK
// For using the fiddler proxy which logs requests to server
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
import Bubble_1 from "../lib/common/models/Bubble";
import {NodeSDK as RainbowSDK} from "../index";
import Utils from "../lib/common/Utils";
import fs = require("fs");
//import fileapi from "file-api";
let fileapi = require('file-api');
import {inspect} from "util";

const inquirer = require("inquirer");
import jwt from "jwt-decode";
/*const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}); // */
//let rainbowMode = "s2s" ;
let rainbowMode = "xmpp";

let ngrok = require('ngrok');
//import ngrok from 'ngrok';

let urlS2S;

(async function () {
    if (rainbowMode=="s2s") {
        console.log("MAIN - S2S Mode, with ngrock.");
        urlS2S = await ngrok.connect(4000).catch((error) => {
            console.log("MAIN - ngrock, error : ", error);
            process.exit(0);
        });
        console.log("MAIN - ngrock, urlS2S : ", urlS2S);
    } else {
        console.log("MAIN - XMPP Mode.");
    }

// Define your configuration
    let options: any = {
        "rainbow": {
            "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
            //      "host": "openrainbow.net",
            // "mode": "s2s"
            "mode": rainbowMode,
            //"mode": "xmpp"
            // "concurrentRequests" : 20
        },
        "xmpp": {
            "host": "",
            "port": "443",
            "protocol": "wss",
            "timeBetweenXmppRequests": "20",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false
        },
        "s2s": {
            "hostCallback": urlS2S,
            //"hostCallback": "http://70a0ee9d.ngrok.io",
            "locallistenningport": "4000"
        },
        "rest":{
            "useRestAtStartup" : false
        },
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
            "enableFileLogs": true,
            "enableEventsLogs": false,
            //"enableEncryptedLogs": false,
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
        "httpoverxmppserver": true,
        "intervalBetweenCleanMemoryCache": 1000 * 60 * 60 * 6, // Every 6 hours.
        "requestsRate": {
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
            "enablesendurgentpushmessages": true
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
// Instantiate the SDK
    let rainbowSDK = new RainbowSDK(options);

    /*
    let options2 = Object.assign({}, options);
    options2.logs.customLabel += "_2";
    let rainbowSDK2 = new RainbowSDK(options2);
    let options3 = Object.assign({}, options);
    options3.logs.customLabel += "_3";
    let rainbowSDK3 = new RainbowSDK(options3);
    let options4 = Object.assign({}, options);
    options4.logs.customLabel += "_4";
    let rainbowSDK4 = new RainbowSDK(options4);
    let options5 = Object.assign({}, options);
    options5.logs.customLabel += "_5";
    let rainbowSDK5 = new RainbowSDK(options5);
    let options6 = Object.assign({}, options);
    options6.logs.customLabel += "_6";
    let rainbowSDK6 = new RainbowSDK(options6);
    // */

    let logger = rainbowSDK._core.logger;
    let calls = [];
    let mycalllogs = {
        "callLogs": null,
        "simplifiedCallLogs": null
    };

    function saveCall(call) {
        if (!calls[call.id]) {
            calls[call.id] = call;
        }
    }

// Start the SDK
//rainbowSDK.start();
    rainbowSDK.events.onLog("debug", (log) => {
        console.log(logger.colors.green("MAIN - Log : ") + log);
    });

    let fileLogXmpp;
    if (options.xmpp.raiseLowLevelXmppInEvent || options.xmpp.raiseLowLevelXmppOutReq) {
        let now = new Date().getTime();
        let utc = new Date().toJSON().replace(/-/g, "_").replace(/:/g, "_");

        let fileNameXmppLogs = "c:\\temp\\xmpp_" + utc + ".log";
        fileLogXmpp = fs.openSync(fileNameXmppLogs, "w");
    }


    rainbowSDK.events.on("rainbow_onxmmpeventreceived", (...argv) => {
        // do something when the SDK is ready to be used
        logger.log("debug", "MAIN - (rainbow_onxmmpeventreceived) - rainbow xmpp event received : ", logger.colors.cyan(...argv));
        if (fileLogXmpp) fs.writeSync(fileLogXmpp, "in: " + logger.colors.cyan(argv[0]) + "\n");
    });

    rainbowSDK.events.on("rainbow_onxmmprequestsent", (...argv) => {
        // do something when the SDK is ready to be used
        logger.log("debug", "MAIN - (rainbow_onxmmprequestsent) - rainbow xmpp request sent : ", logger.colors.yellow(...argv));
        if (fileLogXmpp) fs.writeSync(fileLogXmpp, "out: " + logger.colors.yellow(argv[0]) + "\n");
    });

    let GROUP_NAME = "Services";

    const displayGroup = async () => {
        //let groups = rainbowSDK.groups.getAll();
        //let group = groups.find(group => group.name === GROUP_NAME);
        let group = await rainbowSDK.groups.getGroupByName(GROUP_NAME, true)
        logger.log("debug", "MAIN - group.length : ", group.length, ", group : ", group);
        let users = group.users.map(user => user.id)
        logger.log("debug", "MAIN - users.length : ", users.length, ", users : ", users);
    }

    rainbowSDK.events.on("rainbow_onready", () => {
        // do something when the SDK is ready to be used
        logger.log("debug", "MAIN - (rainbow_onready) - rainbow onready");
        /*let contacts = rainbowSDK.contacts.getAll().filter(contact => contact.roster);
        console.log("Contacts : ",contacts.length);
        contacts.forEach(contact => {
            console.log(contact.displayName, " - ",contact.presence, " - ",contact.id);
        }) // */

        let list = rainbowSDK.contacts.getAll().filter(contact => contact.roster);
        if (list) {
            list.forEach((contact) => {
                logger.log("debug", "MAIN - (rainbow_onready) contact.displayName : ", contact.displayName, " - ", contact.presence, " - ", contact.id, " - ", contact.loginEmail);
            });
        } else {
            logger.log("debug", "MAIN - (rainbow_onready) [start    " + countStop + "] :: contacts list empty");
        }
        // */
        //rainbowSDK.stop();
        logger.log("debug", "MAIN - Rainbow ready ", rainbowSDK.version);

        let contacts = rainbowSDK.contacts.getAll();
        logger.log("debug", "MAIN - Contacts : ", contacts.length);
        contacts.forEach(contact => {
            console.log(contact.displayName, " - ", contact.presence, " - ", contact.id, " - ", contact.jid);
            console.log("Emails ", contact.emails);
            console.log("Email pro", contact.emailPro);
        })

        // setInterval(() => {displayGroup();} , 10000);

        logger.log("debug", "MAIN - ----------------------------------------------------");
    });
    rainbowSDK.events.on("rainbow_onconnectionerror", () => {
        // do something when the SDK has been started
        logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
    });
    rainbowSDK.events.on("rainbow_onstarted", () => {
        // do something when the SDK has been started
        logger.log("debug", "MAIN - (rainbow_onstarted) - rainbow onstarted");
    });
    rainbowSDK.events.on("rainbow_oncallupdated", (data) => {
        try {
            if (data.contact) {
                logger.log("debug", "MAIN - (rainbow_oncallupdated) - rainbow call updated. deviceType : " + data.deviceType + ", State : " + data.status.value + ", displayName : " + data.contact.displayName, data);
            } else {
                logger.log("debug", "MAIN - (rainbow_oncallupdated) - rainbow call updated. deviceType : " + data.deviceType + ", State : " + data.status.value + ", ", data);
            }
        } catch (err) {
        }
        saveCall(data);
    });
    rainbowSDK.events.on("rainbow_onvoicemessageupdated", (data) => {
        logger.log("debug", "MAIN - (rainbow_onvoicemessageupdated) - rainbow voice message updated.", data);
    });

    let bubbleInvitationReceived = null;
    rainbowSDK.events.on("rainbow_onbubbleinvitationreceived", async (bubble) => {
        logger.log("debug", "MAIN - (rainbow_onbubbleinvitationreceived) - rainbow event received.", bubble);
        bubbleInvitationReceived = bubble;

        let utc = new Date().toJSON().replace(/-/g, "/");
        logger.log("debug", "MAIN - [rainbow_onbubbleinvitationreceived    ] :: bubble : ", bubble);
        let message = "message de test : " + utc;
        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", undefined, "subject", undefined, "middle");
        /* await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
            "type": "text/markdown",
            "message": message
        }, "subject", undefined, "middle"); // */
    });

    rainbowSDK.events.on("rainbow_onbubbleconferenceupdated", (conference: ConferenceSession) => {
        logger.log("debug", "MAIN - (rainbow_onbubbleconferenceupdated) - rainbow event received.", conference);
    });

    function acceptReceivedInvitation() {
        if (bubbleInvitationReceived) {
            rainbowSDK.bubbles.acceptInvitationToJoinBubble(bubbleInvitationReceived).then((updatedBubble) => {
                logger.log("debug", "MAIN - acceptInvitationToJoinBubble - sent : ", bubbleInvitationReceived, " : ", updatedBubble);
                // Do something once the invitation has been accepted
            }).catch((err) => {
                // Do something in case of error
                logger.log("error", "MAIN - acceptInvitationToJoinBubble - error : ", err);
            });
        }
    }

    rainbowSDK.events.on("rainbow_onownbubbledeleted", (bubble) => {
        logger.log("debug", "MAIN - (rainbow_onownbubbledeleted) - rainbow event received.", bubble);
        let bubbles = rainbowSDK.bubbles.getAll();
        logger.log("debug", "MAIN - (rainbow_onownbubbledeleted) - bubbles.", bubbles);
    });
    rainbowSDK.events.on("rainbow_onmessagereceiptreceived", (data) => {
        logger.log("debug", "MAIN - (rainbow_onmessagereceiptreceived) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onchannelmessagereceived", (data) => {
        logger.log("debug", "MAIN - (rainbow_onchannelmessagereceived) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onchannelcreated", (data) => {
        logger.log("debug", "MAIN - (rainbow_onchannelcreated) - rainbow event received.", data);
        /*rainbowSDK.channels.deleteChannel(data).then((result2) => {
            logger.log("debug", "MAIN - testcreateChannel deleteChannel result : ", JSON.stringify(result2)); //logger.colors.green(JSON.stringify(result)));
    
        }); */
        rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net").then((vincent01) => {
            let tab = [vincent01];
            logger.log("debug", "MAIN - (rainbow_onchannelcreated) rainbowSDK.channels.getAllChannels() result : ", rainbowSDK.channels.getAllChannels());
            rainbowSDK.channels.addMembersToChannel(data, tab).then((chnl) => {
                logger.log("debug", "MAIN - rainbow_onchannelcreated - addMembersToChannel rainbowSDK.channels.getAllChannels() result : ", rainbowSDK.channels.getAllChannels());
                logger.log("debug", "MAIN - rainbow_onchannelcreated addMembersToChannel result : ", chnl);
            });
        });
    });
    rainbowSDK.events.on("rainbow_onchanneldeleted", (data) => {
        logger.log("debug", "MAIN - (rainbow_onchanneldeleted) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onuseraddedingroup", (group, contact) => {
        logger.log("debug", "MAIN - (rainbow_onuseraddedingroup) - rainbow event received. group", group);
        logger.log("debug", "MAIN - (rainbow_onuseraddedingroup) - rainbow event received. contact", contact);
    });
    rainbowSDK.events.on("rainbow_oncalllogupdated", (calllogs) => {
        logger.log("debug", "MAIN - (rainbow_oncalllogupdated) - rainbow event received. ");
        mycalllogs = calllogs;
        if (calllogs) {
            if (calllogs.callLogs) {
                logger.log("debug", "MAIN - (rainbow_oncalllogupdated) - calllogs.callLogs.length : ", calllogs.callLogs.length);
                calllogs.orderByDateCallLogs.forEach((callL) => {
                    logger.log("debug", "MAIN - (rainbow_oncalllogupdated) - one call logged in calllogs.orderByDateCallLogs : ", ", id : ", callL.id, ", date : ", callL.date);
                });
                // */
            }
        } else {
            logger.log("error", "MAIN - (rainbow_oncalllogupdated) - rainbow event received. empty calllogs", calllogs);
        }
    });
    rainbowSDK.events.on("rainbow_oncalllogackupdated", (calllogs) => {
        logger.log("debug", "MAIN - (rainbow_oncalllogackupdated) - rainbow event received. ");
        if (calllogs) {
            if (calllogs.callLogs) {
                logger.log("debug", "MAIN - (rainbow_oncalllogackupdated) - rainbow event received. calllogs.callLogs.length", calllogs.callLogs.length);
            }
        }
        mycalllogs = calllogs;
    });
// Later in the code
    rainbowSDK.events.on("rainbow_onmessagereceived", (message) => {
        logger.log("debug", "MAIN - (rainbow_onmessagereceived) - rainbow event received. message", message);
        // send manually a 'read' receipt to the sender
        //rainbowSDK.im.markMessageAsRead(message);
        let that = this;
        let contactEmailToSearch = "alice01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        /*
        if (message.fromBubbleJid ) {
            rainbowSDK.im.sendMessageToBubbleJidAnswer("hello from node sendMessageToJidAnswer", message.fromJid, 'FR', null, 'Le sujet de node sendMessageToBubbleJidAnswer', message).then((result) => {
                logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToBubbleJidAnswer - result : ", result);
            });
    
        }  else {
            rainbowSDK.im.sendMessageToJidAnswer("hello from node sendMessageToJidAnswer", message.fromJid, 'FR', null, 'Le sujet de node sendMessageToJidAnswer', message).then((result) => {
                logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToJidAnswer - result : ", result);
            });
        } // */
        /*
         <message 
  xmlns='jabber:client' to='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net/node_VpzTvyYF' from='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net' type='chat'>
  <sent 
    xmlns='urn:xmpp:carbons:2'>
    <forwarded 
      xmlns='urn:xmpp:forward:0'>
      <message xml:lang='en' to='adcf613d42984a79a7bebccc80c2b65e@openrainbow.net' from='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net/web_win_2.101.3_3QO8WdOK' type='chat' id='web_28273cf2-b320-43c5-a195-7dc88c0935c60' 
        xmlns='jabber:client'>
        <archived stamp='2022-02-25T10:06:45.263921Z' by='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net' id='1645783605263921' 
          xmlns='urn:xmpp:mam:tmp'/>
          <stanza-id by='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net' id='1645783605263921' 
            xmlns='urn:xmpp:sid:0'/>
            <store 
              xmlns='urn:xmpp:hints'/>
              <request 
                xmlns='urn:xmpp:receipts'/>
                <active 
                  xmlns='http://jabber.org/protocol/chatstates'/>
                  <answeredMsg stamp='1645783648376'>web_f0d90f96-ec85-41dc-969d-371a30a59aa80</answeredMsg>
                  <body xml:lang='en'>Acknowledged</body>
                </message>
              </forwarded>
            </sent>
          </message>
         */
        let ackUngency = false; 
        if (ackUngency && message && message.urgency === "high" ) {
            if (message.fromBubbleJid ) {
                rainbowSDK.im.sendMessageToBubbleJidAnswer("Acknowledged", message.fromJid, 'EN', null, 'Acknowledged', message,undefined,"std").then((result) => {
                    logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToBubbleJidAnswer - Acknowledged sent result : ", result);
                });
            }  else {
                rainbowSDK.im.sendMessageToJidAnswer("Acknowledged", message.fromJid, 'EN', null, "Acknowledged", message, "std").then((result) => {
                    logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToJidAnswer - Acknowledged sent result : ", result);
                });
            } // */
        }
                
        let ignoreAckUngency = true; 
        if (ignoreAckUngency && message && message.urgency === "high" ) {
            if (message.fromBubbleJid ) {
                rainbowSDK.im.sendMessageToBubbleJidAnswer("ign", message.fromJid, 'EN', null, 'Ignored', message,undefined,"std").then((result) => {
                    logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToBubbleJidAnswer - Acknowledged sent result : ", result);
                });
            }  else {
                rainbowSDK.im.sendMessageToJidAnswer("Ignoré", message.fromJid, 'FR', null, "Ignored", message, "std").then((result) => {
                    logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToJidAnswer - Acknowledged sent result : ", result);
                });
            } // */
        }
        
    });
    rainbowSDK.events.on("rainbow_onmessageserverreceiptreceived", (data) => {
        logger.log("debug", "MAIN - (rainbow_onmessageserverreceiptreceived) - rainbow event received. data", data);
        /*rainbowSDK.conversations.getConversations().then(() => {
           sdfsdf
        }); // */
        // send manually a 'read' receipt to the sender
        // rainbowSDK.im.markMessageAsRead(data);
    });
    rainbowSDK.events.on("rainbow_onuserinvitereceived", async (data) => {
        logger.log("debug", "MAIN - (rainbow_onuserinvitereceived) - rainbow event received.  : ", data);
        let acceptInvitationResult = await rainbowSDK.contacts.acceptInvitation(data);
        logger.log("debug", "Main - rainbow_onuserinvitereceived, acceptInvitation - result : ", acceptInvitationResult);
    });
    rainbowSDK.events.on("rainbow_onfileupdated", (data) => {
        logger.log("debug", "MAIN - (rainbow_onfileupdated) - rainbow event received.");
        let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId(data.fileid);
        logger.log("debug", "Main - (rainbow_onfileupdated), retrieveFileDescriptorsListPerOwner - result : - fileDescriptorsReceived.id : ", fileDescriptorsReceived.id, ", fileDescriptorsReceived.fileName : ", fileDescriptorsReceived.fileName, ", fileDescriptorsReceived.url : ", fileDescriptorsReceived.url, ", fileDescriptorsReceived.ownerId : ", fileDescriptorsReceived.ownerId);
        /*rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceivedOwned: any) => {
            logger.log("debug", "Main - (rainbow_onfileupdated), retrieveFileDescriptorsListPerOwner - result : ", fileDescriptorsReceivedOwned.length);
            for (let fileReceived of fileDescriptorsReceivedOwned) {
                logger.log("debug", "Main - (rainbow_onfileupdated), retrieveFileDescriptorsListPerOwner - result : - fileReceived.id : ", fileReceived.id, ", fileReceived.fileName : ", fileReceived.fileName, ", fileReceived.url : ", fileReceived.url, ", fileReceived.ownerId : ", fileReceived.ownerId);

            }
        }); // */
    });
    rainbowSDK.events.on("rainbow_onfilecreated", (data) => {
        logger.log("debug", "MAIN - (rainbow_onfilecreated) - rainbow event received.");
        let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId(data.fileid);
        logger.log("debug", "Main - (rainbow_onfilecreated), getFileDescriptorFromId - result : - fileDescriptorsReceived.id : ", fileDescriptorsReceived.id, ", fileDescriptorsReceived.fileName : ", fileDescriptorsReceived.fileName, ", fileDescriptorsReceived.url : ", fileDescriptorsReceived.url, ", fileDescriptorsReceived.ownerId : ", fileDescriptorsReceived.ownerId);
    });
    
    let countStop = 0;
    rainbowSDK.events.on("rainbow_onerror", (data) => {
        logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
        until(() => {
            return stopped==true;
        }, "Waiting for the stop event after the rainbow_onerror event.", 10000).then(() => {
            rainbowSDK = undefined;
            stopped = false;
            rainbowSDK = new RainbowSDK(options);
            logger = rainbowSDK._core.logger;
            /*
            rainbowSDK.start().then(async(result) => {
                try {
                    // Do something when the SDK is started
                    logger.log("debug", "MAIN - rainbow SDK started result after rainbow_onerror : ", logger.colors.green(result)); //logger.colors.green(JSON.stringify(result)));
                    //let startDuration = Math.round(new Date() - startDate);
                    let startDuration = result.startDuration;
                    // that.stats.push({ service: "telephonyService", startDuration: startDuration });
                    logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
                    console.log("MAIN === STARTED (" + startDuration + " ms) ===");
    
                    commandLineInteraction();
                }
                catch (err) {
                    console.log("MAIN - Error during starting : " + util.inspect(err));
                }
            }).catch((err) => {
                console.log("MAIN - Error during starting : " + util.inspect(err));
            });
            // */
        });
    });

    let stopped = false;

    rainbowSDK.events.on("rainbow_onstopped", (data) => {
        countStop++;
        stopped = true;
        logger.log("debug", "MAIN - (rainbow_onstopped) " + countStop + " - rainbow event received. data", data);
        //setTimeout(() => {
        logger.log("debug", "MAIN - (rainbow_onstopped) rainbow SDK will re start " + countStop + " result : ", data); //logger.colors.green(JSON.stringify(result)));
        //rainbowSDK.start();
        //        rainbowSDK.start().then(()=>{
        /*logger.log("debug", "MAIN - rainbow_onstopped rainbow SDK started " + countStop + " result : ", data); //logger.colors.green(JSON.stringify(result)));
        let list = rainbowSDK.contacts.getAll();
        if (list) {
            list.forEach(function (contact) {
                logger.log("debug", "MAIN - rainbow_onstopped [start    " + countStop + "] :: contact : ", contact);
            });
        } else {
            logger.log("debug", "MAIN - rainbow_onstopped [start    " + countStop + "] :: contacts list empty");
        }
        // */
        //        });
        //}, 1);
        // */
    });

    //region Contacts
    
    function testupdateMyInformations() {
        let contactInfo = {
           
        };
        rainbowSDK.contacts.updateMyInformations(contactInfo).then(result => {
            logger.log("debug", "MAIN - [testupdateMyInformations    ] ::  result : ", result);
        }).catch((err) => {
            logger.log("error", "MAIN - [testupdateMyInformations    ] :: catch reject contact : ", err);
        });
    }
    
    function testgetUserPresenceInformation() {
        rainbowSDK.admin.getUserPresenceInformation().then(result => {
            logger.log("debug", "MAIN - [getUserPresenceInformation    ] ::  result : ", result);
        }).catch((err) => {
            logger.log("error", "MAIN - [getUserPresenceInformation    ] :: catch reject contact : ", err);
        });
    }

    function testgetContactByLoginEmail_UnknownUser() {
        let usershouldbeUnkown = "unknowcontact@openrainbow.org";
        rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then(contact => {
            logger.log("debug", "MAIN - [getContactByLoginEmail    ] ::  contact : ", contact);
        }).catch((err) => {
            logger.log("error", "MAIN - [getContactByLoginEmail    ] :: catch reject contact : ", err);
        });
    }

    function testgetContactByLoginEmail_NotInRoster() {
        let usershouldbeUnkown = "vincent06@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then(contact => {
            logger.log("debug", "MAIN - [getContactByLoginEmail    ] ::  contact : ", contact);
        }).catch((err) => {
            logger.log("error", "MAIN - [getContactByLoginEmail    ] :: catch reject contact : ", err);
        });
    }

    function multiple_testgetContactByLoginEmail_NotInRoster() {
        let usershouldbeUnkown = "vincent02@vbe.test.openrainbow.net"; // "WRONG6ac069e5eb4741e2af64a8beac59406f@openrainbow.net"
        rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then((contact: Contact) => {
            for (let i = 0; i < 20; i++) {
                let prom = rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
                    logger.log("debug", "MAIN - [getContactInformationByJID    ] ::  _contactFromServer : ", _contactFromServer);
                }).catch((err) => {
                    logger.log("error", "MAIN - [getContactInformationByJID    ] :: catch reject contact : ", err);
                });
            }
        });
    }


    async function testgetContactByLoginEmailCaseSensitiveTest() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            logger.log("debug", "MAIN - [testgetContactByLoginEmailCaseSensitiveTest] after getContactByLoginEmail : ", contactVincent00);
            let contactVincent00upperCase = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00.toUpperCase());
            logger.log("debug", "MAIN - [testgetContactByLoginEmailCaseSensitiveTest] after getContactByLoginEmail UpperCase : ", contactVincent00upperCase);
    }

    function displayRoster() {
        let contacts = rainbowSDK.contacts.getAll();
        let roster = contacts.filter(contact => contact.roster).map(contact => contact.displayName)
        logger.log("debug", "MAIN - [displayRoster] roster.length : ", roster.length, ", roster : ", roster);
    }

    /*function testgetContactByLoginEmail() {
        let loginEmail = "vincent++@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testgetContactByLoginEmail    ] :: getContactByLoginEmail contact : ", contact);
            }
        });
    } // */

    function testgetContactByLoginEmail(loginEmail: string = "vincent++@vbe.test.openrainbow.net", forceServerSearch: boolean = false) {
        //let loginEmail = "vincent++@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail, forceServerSearch).then(contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testgetContactByLoginEmail    ] :: getContactByLoginEmail contact : ", contact);
            }
        });
    }

    /**
     * need to be administrator of the company. Here vincent02 is ok.
     */
    function testgetContactInfos() {
        let loginEmail = "vincent++@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactByLoginEmail contact : ", contact);
                rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                    if (contactInfos) {
                        logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                    } else {
                        logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos no infos found");
                    }
                });
            }
        });
    }

    function testgetContactInfos2() {
        let loginEmail = "representaive2@al-mydemo.com";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactByLoginEmail contact : ", contact);
                rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                    if (contactInfos) {
                        logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                    } else {
                        logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos no infos found");
                    }
                });
            }
        });
    }

    /**
     * need to be administrator of the company. Here vincent02 is ok.
     */
    function testupdateContactInfos() {
        let loginEmail = "vincent++@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactByLoginEmail contact : ", contact);
                let utc = new Date().toJSON().replace(/-/g, "_");
                let infos = {
                    "userInfo1": "My Value UserInfo 1_" + utc,
                    "userInfo2": "My Value UserInfo 2_" + utc,
                    "jobTitle": "my job",
                    customData: {
                        "key1": "TestTextOfKey1" + utc,
                        "key2": "TestTextOfKey2" + utc
                    }
                };
                rainbowSDK.admin.updateContactInfos(contact.id, infos).then(result => {
                    if (result) {
                        logger.log("debug", "MAIN - [testupdateContactInfos    ] :: updateContactInfos result : ", result);
                    } else {
                        logger.log("debug", "MAIN - [testupdateContactInfos    ] :: updateContactInfos no infos found");
                    }
                    rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                        if (contactInfos) {
                            logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                        } else {
                            logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactInfos no infos found");
                        }
                    });
                });
            }
        });
    }

    async function testjoinContacts_AddContactToRoster() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            let tab = [];
            tab.push(contactVincent01.id);
            rainbowSDK.contacts.joinContacts(contactVincent00, tab);
    }

    async function testsendSubscription() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            let tab = [];
            tab.push(contactVincent01.id);
            //rainbowSDK.contacts.addContact(contactVincent00, tab);
    }

    async function testaddToContactsList() {
            let contactEmailToSearchVincent00 = "vincent02@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            //let tab = [];
            //tab.push(contactVincent01.id);
            await rainbowSDK.contacts.addToNetwork(contactVincent00);
    }

    async function testremoveFromNetwork() {
            let contactEmailToSearchVincent00 = "vincent02@vbe.test.openrainbow.net";
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            logger.log("debug", "MAIN - [testremoveFromNetwork] contactEmailToSearchVincent00 : " + contactEmailToSearchVincent00 + " : ", contactVincent00);
            await rainbowSDK.contacts.removeFromNetwork(contactVincent00);
    }

    async function testgetAllUsers() {
            // let utc = new Date().toJSON().replace(/-/g, '_');
            let users = await rainbowSDK.admin.getAllUsers("small", 2, 5, "firstName");
            logger.log("debug", "MAIN - [testgetAllUsers] after getAllUsers : ", users);
            //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            //let tab = [];
            //tab.push(contactVincent01.id);
            //await rainbowSDK.contacts.addToNetwork(contactVincent00);
    }

    async function testgetAllUsersByCompanyId() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);

            let users = await rainbowSDK.admin.getAllUsersByCompanyId("small", 2, 5, "firstName", contactVincent00.companyId);
            logger.log("debug", "MAIN - [testgetAllUsersByCompanyId] after getAllUsersByCompanyId : ", users);
    }

    async function testgetAllUsersBySearchEmailByCompanyId() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            let searchEmail = "cord";
            let users = await rainbowSDK.admin.getAllUsersBySearchEmailByCompanyId("small", 2, 5, "firstName", contactVincent00.companyId, searchEmail);
            logger.log("debug", "MAIN - [testgetAllUsersBySearchEmailByCompanyId] after getAllUsersBySearchEmailByCompanyId : ", users);
    }

    async function testgetServerFavorites() {
            let utc = new Date().toJSON().replace(/-/g, "_");
            let favorites = await rainbowSDK.favorites.fetchAllFavorites();
            //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            //let tab = [];
            //tab.push(contactVincent01.id);
            //await rainbowSDK.contacts.addToNetwork(contactVincent00);
    }

    async function testcreateGuestUserError() {
        let firstname = "firstname_";
        let lastname = "lastname_" + new Date().getTime() + "_";
        for (let iter = 0; iter < 1; iter++) {
            let firstnameTemp = firstname + iter;
            let lastnameTemp = lastname + iter;
            await rainbowSDK.admin.createGuestUser(firstnameTemp, lastnameTemp, "fr", 10).catch((err) => {
                logger.log("debug", "MAIN - (testcreateGuestUserError) error while creating guest user :  ", err);
            });
        }
    }

    function testsearchUsers() {
        let usershouldbeUnkown = "unknowcontact@openrainbow.org";
        rainbowSDK.contacts.searchUsers(20,undefined,"vincent").then(contact => {
            logger.log("debug", "MAIN - [testsearchUsers    ] ::  contact : ", contact);
        }).catch((err) => {
            logger.log("error", "MAIN - [testsearchUsers    ] :: catch reject contact : ", err);
        });
    }
    
    //endregion Contacts
    
    //region Messages

    async function testgetContactsMessagesFromConversationId() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let now = new Date().getTime();
            // get messages which are not events
            let msgNotEvents = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
            logger.log("debug", "MAIN - testgetContactsMessagesFromConversationId - result getContactsMessagesFromConversationId : ", msgNotEvents);
    }

    async function testgetContactsMessagesFromConversationIdForGuest() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";


            rainbowSDK.admin.createAnonymousGuestUser(60 * 60).then((guest: any) => {
                logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result createAnonymousGuestUser : ", guest);
                rainbowSDK.contacts.getContactByJid(guest.jid_im, true).then(contact => {
                    logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result getContactByJid : ", contact);
                    rainbowSDK.conversations.openConversationForContact(contact).then(async conversation => {
                        logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result openConversationForContact : ", conversation);
                        let msgNotEvents = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
                        logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result getContactsMessagesFromConversationId : ", msgNotEvents);
                    });
                });
            });
            /*
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let now = new Date().getTime();
            // get messages which are not events
            let msgNotEvents = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
            logger.log("debug", "MAIN - testgetContactsMessagesFromConversationId - result getContactsMessagesFromConversationId : ", msgNotEvents);
            // */
    }

    async function testremoveAllMessages() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 2;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                // Send message
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testremoveAllMessages - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);
    }

    async function testsendMessageToConversationForContact() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent02@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 2;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                // Send message
                //let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now, "middle");
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testsendMessageToConversationForContact - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
                let msgDeleted = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
                logger.log("debug", "MAIN - testsendMessageToConversationForContact - deleted in conversation the message : ", msgDeleted);
            }
            // let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            // logger.log("debug", "MAIN - testsendMessageToConversationForContact - conversation with messages removed : ", conversationWithMessagesRemoved);
    }

    async function testsendMessageToConversationForContactIrles() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "christophe.irles@al-enterprise.com";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 2;
            let msgsSent = [];
            let txt = "# TYPESCRIPT in SDK for Node.JS\n" +
                    "\n" +
                    "Here is the howto TypeScript in **Rainbow-Node-SDK**\n";
            let content = {
                message: txt,
                type: "text/markdown"
            };
            let now = new Date().getTime();
            // Send message
            //let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now, "middle");
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello from node at " + now, "FR", content, "Le sujet de node : " + now);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
    }

    async function testsendMessageToJid() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent02@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            //let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 1;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                // Send message
                let msgSent = await rainbowSDK.im.sendMessageToJid("hello num " + i + " from node : " + now, contact.jid, "FR", null, "Le sujet de node : " + now);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testsendMessageToJid - wait for message to be in conversation : ", msgSent);
                /*await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id) !== undefined;
                }, "Wait for message to be added in conversation num : " + i);
                let msgDeleted = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
                logger.log("debug", "MAIN - testsendMessageToJid - deleted in conversation the message : ", msgDeleted);
                // */
            }
            // let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            // logger.log("debug", "MAIN - testsendMessageToJid - conversation with messages removed : ", conversationWithMessagesRemoved);
    }

    function testsendMessageToConversation() {
        let that = this;
        // let conversation = null;
        let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
        //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
        // Retrieve a contact by its id
        rainbowSDK.contacts.getContactById(contactIdToSearch)
                .then(function (contact) {
                    // Retrieve the associated conversation
                    return rainbowSDK.conversations.openConversationForContact(contact);
                }).then(function (conversation) {
            // Share the file
            rainbowSDK.im.sendMessageToConversation(conversation, "hello from node", "FR", null, "Le sujet de node").then((result) => {
                logger.log("debug", "MAIN - testHDS sendMessageToConversation - result : ", result);
                logger.log("debug", "MAIN - testHDS sendMessageToConversation - conversation : ", conversation);
            });
        });
    }

    async function testsendMessageToConversation_html() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let txt = "# TYPESCRIPT in SDK for Node.JS\n" +
                    "\n" +
                    "Here is the howto TypeScript in **Rainbow-Node-SDK**\n";
            let content = {
                message: txt,
                type: "text/markdown"
            };
            /*let content = {
                message : "<a href=\"xxx\">mon lmien</<a>",
                type : "text/html"
            }; // */
            rainbowSDK.im.sendMessageToConversation(conversation, txt, "FR", content, "Le sujet de node").then((result) => {
                logger.log("debug", "MAIN - testsendMessageToConversation_html sendMessageToConversation - result : ", result);
                logger.log("debug", "MAIN - testsendMessageToConversation_html sendMessageToConversation - conversation : ", conversation);
            });
    }

    async function testSendMessageToJid() {
            let that = this;
            let contactEmailToSearch = "alice01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJid", contact.jid, "FR", null, "Le sujet de node testSendMessageToJid").then((result) => {
                logger.log("debug", "MAIN - testSendMessageToJid sendMessageToJid - result : ", result);
            });
    }

    async function testsendCorrectedChatMessage() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 2;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                // Send message
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testsendCorrectedChatMessage - wait for message to be in conversation : ", msgSent);
                await until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.content;
            logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
            setTimeout(async () => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                    logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
                });
                logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
            }, 10000);
    }

    async function testsendCorrectedChatMessageWithContent() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 2;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                let txt = "# Test " + now + " \n" +
                        "\n" +
                        "Here is the test in **Rainbow-Node-SDK**\n";
                let content = {
                    message: txt,
                    type: "text/markdown"
                };
                // Send message
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", content, "Le sujet de node : " + now);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testsendCorrectedChatMessageWithContent - wait for message to be in conversation : ", msgSent);
                await until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.content;
            logger.log("debug", "MAIN - testsendCorrectedChatMessageWithContent - msgStrModified : ", msgStrModified);
            setTimeout(async () => {
                let now = new Date().getTime();
                let txt = "# Test modified " + now + " \n" +
                        "\n" +
                        "Here is the test in **Rainbow-Node-SDK**\n";
                let content = {
                    message: txt,
                    type: "text/markdown"
                };

                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id, content).catch((err) => {
                    logger.log("error", "MAIN- testsendCorrectedChatMessageWithContent - error sendCorrectedChatMessage : ", err);
                });
                logger.log("debug", "MAIN- testsendCorrectedChatMessageWithContent - msgCorrectedSent : ", msgCorrectedSent);
            }, 10000);
    }

    async function tesdeleteMessageFromConversation() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let txt = "# TYPESCRIPT in SDK for Node.JS\n" +
                    "\n" +
                    "Here is the howto TypeScript in **Rainbow-Node-SDK**\n";
            let content = {
                message: txt,
                type: "text/markdown"
            };
            /*let content = {
                message : "<a href=\"xxx\">mon lmien</<a>",
                type : "text/html"
            }; // */
            rainbowSDK.im.sendMessageToConversation(conversation, txt, "FR", content, "Le sujet de node").then(async (msgSent) => {
                logger.log("debug", "MAIN - tesdeleteMessageFromConversation sendMessageToConversation - result : ", msgSent);
                logger.log("debug", "MAIN - tesdeleteMessageFromConversation sendMessageToConversation - conversation : ", conversation);

                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation id : " + conversation.id);

                let conversationWithMessagesRemoved = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
                logger.log("debug", "MAIN - tesdeleteMessageFromConversation - conversation with message removed : ", conversationWithMessagesRemoved);

            });
    }
    
    async function testgetlastEditableMsg() {
            let that = this;
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            logger.log("debug", "MAIN - testgetlastEditableMsg - result : ", conversation.getlastEditableMsg());
    }

    async function testsendCorrectedChatMessageForBubble() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            //let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let bubbleJib = "room_f829530bba37411896022878f81603ca@muc.vberder-all-in-one-dev-1.opentouch.cloud";
            // Retrieve a contact by its id
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            //let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let conversation = rainbowSDK.conversations.getConversationByBubbleJid(bubbleJib);
            let nbMsgToSend = 2;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date(); // .getTime()
                // Send message
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testsendCorrectedChatMessage - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.message;
            logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
            setTimeout(async () => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                    logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
                });
                logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
            }, 5000);
    }

    async function testsendCorrectedChatMessageForBubbleInExistingConversation() {
            //let that = this;
            let bubbleJib = "room_f829530bba37411896022878f81603ca@muc.vberder-all-in-one-dev-1.opentouch.cloud";
            let conversation = rainbowSDK.conversations.getConversationByBubbleJid(bubbleJib);
            await rainbowSDK.im.getMessagesFromConversation(conversation, 10);
            let msgSentOrig = conversation.getlastEditableMsg();
            let msgStrModified = "modified : " + msgSentOrig.content;
            setTimeout(async () => {
                logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                    logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
                });
                logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
            }, 5000);
    }

    async function testdeleteAllMessageInOneToOneConversation() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            if (conversation && conversation.id) {
                let result = await rainbowSDK.conversations.deleteAllMessageInOneToOneConversation(conversation);
                logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation deleteAllMessageInOneToOneConversation - result : ", result);
                logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation deleteAllMessageInOneToOneConversation - conversation : ", conversation);
            } else {
                logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation conversation empty or no id defined - conversation : ", conversation);
            }
    }

    async function testSendMessageToJidOfMySelf() {
            let that = this;
            let contactEmailToSearch = options.credentials.login;
            logger.log("debug", "MAIN - testSendMessageToJidOfMySelf contactEmailToSearch : ", contactEmailToSearch);
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            await rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJidOfMySelf", contact.jid, "FR", null, "Le sujet de node testSendMessageToJidOfMySelf").then((result) => {
                logger.log("debug", "MAIN - testSendMessageToJidOfMySelf sendMessageToJid - result : ", result);
            }).catch((err) => {
                logger.log("debug", "MAIN - testSendMessageToJidOfMySelf Error : ", err);
            });
    }

    async function testSendMultipleMessages() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 100;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                let msgstr = "hello num " + i + " from node : " + now;
                // Send message
                logger.log("debug", "MAIN - testSendMultipleMessages - message to be sent in conversation : ", msgstr);
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, msgstr, "FR", null, "Le sujet de node : " + now).catch((err) => {
                    logger.log("internalerror", "MAIN - testSendMultipleMessages - error while sendMessageToConversation : ", err);
                });
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                logger.log("debug", "MAIN - testSendMultipleMessages - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation Msg : " + msgstr);
            }
            //let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            //logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);
    }

    async function testsendMessageToContactUrgencyMiddle() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after getContactByLoginEmail : ", contactVincent00);
            rainbowSDK.im.sendMessageToContact("Middle important message test", contactVincent00, null, null, null, 'middle').then((result) => {
                logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after sendMessageToContact result : ", result);
            });
    }

    async function testsendMessageToContactUrgencyHigh() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after getContactByLoginEmail : ", contactVincent00);
            rainbowSDK.im.sendMessageToContact("High important message test", contactVincent00, null, null, null, 'high').then((result) => {
                logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after sendMessageToContact result : ", result);
            });
    }

    //endregion Messages
    
    //region group 

    async function testdeleteAllGroups() {
        let that = this;
        logger.log("debug", "MAIN - testdeleteAllGroups before delete");
        await rainbowSDK.groups.deleteAllGroups();
        logger.log("debug", "MAIN - testdeleteAllGroups after delete");
    }

    async function testsetGroupAsFavorite() {
        let that = this;
        //logger.log("debug", "testsetGroupAsFavorite before delete");
        let groupCreated = await rainbowSDK.groups.createGroup("myGroup", "commentGroup", false);
        logger.log("debug", "MAIN - testsetGroupAsFavorite groupCreated : ", groupCreated);
        let groupUpdatedSet = await rainbowSDK.groups.setGroupAsFavorite(groupCreated);
        logger.log("debug", "MAIN - testsetGroupAsFavorite groupUpdatedSet : ", groupUpdatedSet);
        await setTimeoutPromised(1500);
        let groupUpdatedUnset = await rainbowSDK.groups.unsetGroupAsFavorite(groupUpdatedSet);
        logger.log("debug", "MAIN - testsetGroupAsFavorite groupUpdatedUnset : ", groupUpdatedUnset);
        await setTimeoutPromised(1500);
        let groupDeleted = await rainbowSDK.groups.deleteGroup(groupCreated);
        logger.log("debug", "MAIN - testsetGroupAsFavorite groupDeleted : ", groupDeleted);
    }

    async function testgetGroupByName(forceSearchOnServer) {
        //let groups = rainbowSDK.groups.getAll();
        //let group = groups.find(group => group.name === GROUP_NAME);
        let GROUP_NAME = "Services";
        //let forceSearchOnServer = false;
        let group = await rainbowSDK.groups.getGroupByName(GROUP_NAME, forceSearchOnServer!=null ? forceSearchOnServer:false)
        if (group) {
            let users = group.users.map(user => user.id)
            logger.log("debug", "MAIN - testgetGroupByName - result users.length : ", users.length, ", users : ", users);
        } else {
            logger.log("debug", "MAIN - testgetGroupByName - result group not found.");
        }
    }

    //endregion group

    // region Channels
    
    function testChannelImage() {
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0]:null;
        rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((result) => {
            logger.log("debug", "MAIN - retrieveFileDescriptorsListPerOwner - result : ", result);
            if (result) {
                let now = new Date().getTime();
                let msg = " <h1>Rainbow Node SDK - Sample</h1><hr /><h2>[1.66.1] - 2020-01-29</h2>\n" +
                        "\n" +
                        "<ul><li>Fix when the SDK is already stopped when stop method is called, then return a succeed. (CRRAINB-10270: CPaaS Node SDK - Chief bot demo wasn&#39;t unable to restart after connection issue)</li><li>Add BubblesService::getUsersFromBubble to get the actives users of a bubble.</li><li>Fix the parameter type sent by events <code>rainbow_onbubbledeleted</code> and <code>rainbow_onbubbleownaffiliationchanged</code>. It is now <code>Bubble</code> insteadOf <code>Promise&lt;Bubble&gt;</code>.</li></ul>\n" +
                        "\n" +
                        "<h2>[1.66.0] - 2020-01-28</h2>\n" +
                        "\n" +
                        "<ul><li>" + now + "</li><li>Add correlatorData et GlobaleCallId </li><li>Fix method ChannelsService::createItem when parameter &quot;type&quot; is setted.</li><li>Split Xmmpp error event treatment in 3 possibilities:<ul><li>Errors which need a reconnection </li><li>Errors which need to only raise an event to inform up layer. =&gt; Add an event <code>rainbow_onxmpperror</code> to inform about issue. </li><li>Errors which are fatal errors and then need to stop the SDK. =&gt; Already existing events <code>rainbow_onerror</code> + <code>rainbow_onstop</code>.</li></ul></li><li>Work done on private method BubblesServices::joinConference (Not finish, so not available).</li><li>Update Bubble::users property ordered by additionDate.</li><li>Fix ordered calllogs (<code>orderByNameCallLogsBruts</code>, <code>orderByDateCallLogsBruts</code>).</li></ul>\n";
                let tabImages = [{"id": result[0].id}];
                rainbowSDK.channels.createItem(mychannel, msg, "title", null, tabImages, null).then((res) => {
                    logger.log("debug", "MAIN - createItem - res : ", res);
                });
            }
        });
    }

    async function testPublishChannel() {
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0]:null;
        if (mychannel) {
            for (let i = 0; i < 100; i++) {
                let now = new Date().getTime();
                await rainbowSDK.channels.createItem(mychannel, "-- message : " + i + " : " + now, "title_" + i, null, null, null).then((res) => {
                    logger.log("debug", "MAIN - createItem - res : ", res);
                });
                pause(300);
            }
        } else {
            logger.log("debug", "MAIN - createItem - getAllOwnedChannel mychannel is empty, so can not publish.");
        }
    }

    async function testgetDetailedAppreciationsChannel() {
        //let mychannel = await rainbowSDK.channels.getChannel("5dea7c6294e80144c1776fe1");
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0]:null;
        logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel : ", mychannel);
        if (mychannel) {
            for (let i = 0; i < 1; i++) {
                let now = new Date().getTime();
                let itemId = "";
                let item = await rainbowSDK.channels.fetchChannelItems(mychannel);
                itemId = item[0].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                    logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - res : ", res);
                });
            }
        } else {
            logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel is empty, so can not publish.");
        }
    }

    async function testfetchChannelItems() {
        //let mychannel = await rainbowSDK.channels.getChannel("5dea7c6294e80144c1776fe1");
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0]:null;
        logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel : ", mychannel);
        if (mychannel) {
            for (let i = 0; i < 1; i++) {
                let now = new Date().getTime();
                let itemId = "";
                let items = await rainbowSDK.channels.fetchChannelItems(mychannel);
                logger.log("debug", "MAIN - testgetDetailedAtestfetchChannelItemsppreciationsChannel - items.length : ", items.length);

                logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", items[0]);
                logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", items[items.length - 1]);

                /*itemId = items[0].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                    logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", itemId, ", res : ", res);
                });
                itemId = items[items.length - 1].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                    logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", itemId, ", res : ", res);
                }); // */
            }
        } else {
            logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel is empty, so can not publish.");
        }
    }

    async function testcreateChannel() {
            let mychannels = rainbowSDK.channels.getAllOwnedChannel();
            let mychannel = mychannels ? mychannels[0]:null;
            let utc = new Date().toJSON().replace(/-/g, "/");
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let channelCreated = await rainbowSDK.channels.createPublicChannel("testchannel" + utc, "test", "");
            logger.log("debug", "MAIN - testcreateChannel createPublicChannel result : ", channelCreated); //logger.colors.green(JSON.stringify(result)));
            let tab: any = [{"id": contact.id}];
            let channelMembersAdded = await rainbowSDK.channels.addMembersToChannel(channelCreated, tab);
            logger.log("debug", "MAIN - testcreateChannel - channelMembersAdded : ", channelMembersAdded);
            let channelinfo = await rainbowSDK.channels.fetchChannel(channelCreated.id);
            logger.log("debug", "MAIN - testcreateChannel - channelinfo : ", channelinfo);
            /*rainbowSDK.channels.createItem(mychannel, "message : " + now, "title", null, tabImages).then((res) => {
                logger.log("debug", "createItem - res : ", res);
            }); // */
    }

    function testChannelDeleteMessage() {
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0]:null;
        rainbowSDK.channels.getMessagesFromChannel(mychannel).then((result) => {
            logger.log("debug", "MAIN - getMessagesFromChannel - result : ", result);
            if (result && result.length > 0) {
                let now = new Date().getTime();
                let idToDelete = result.length - 1;
                logger.log("debug", "MAIN - getMessagesFromChannel - idToDelete : ", idToDelete);
                rainbowSDK.channels.deleteMessageFromChannel(mychannel.id, result[idToDelete].id).then((result) => {
                    logger.log("debug", "MAIN - deleteMessageFromChannel - result : ", result);
                });
                /*rainbowSDK.channels.createItem(mychannel, "message : " + now, "title", null, null).then((res) => {
                    logger.log("debug", "createItem - res : ", res);
                }); */
            }
        });
    }

    function testChannelupdateChannelDescription() {
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0]:null;
        let utc = new Date().toJSON().replace(/-/g, "_");
        rainbowSDK.channels.updateChannelDescription(mychannel, "desc_" + utc).then((result) => {
            logger.log("debug", "MAIN - updateChannelDescription - result : ", result);
        }).catch(reason => {
            logger.log("error", "MAIN - updateChannelDescription catch reject - reason : ", reason);
        });
    }

    function testupdateChannelAvatar() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }

    //endregion Channels

    //region Files
    
    function downloadFile() {
        logger.log("debug", "Main - downloadFile - file - ");
        rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceived: any) => {
            logger.log("debug", "Main - downloadFile, retrieveFileDescriptorsListPerOwner - result : ", fileDescriptorsReceived);
            for (let fileReceived of fileDescriptorsReceived) {
                logger.log("debug", "Main - downloadFile - file - ", fileReceived);
                rainbowSDK.fileStorage.downloadFile(fileReceived).then((blob: any) => {
                    logger.log("debug", "Main - downloadFile - blob : ", blob.mime);
                    fs.writeFile("c:\\temp\\" + fileReceived.fileName, blob.buffer, "binary", function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("The file was saved! : " + "c:\\temp\\" + fileReceived.fileName);
                        }
                    });
                });
                //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
                //let now = new Date().getTime();
            }
        });
    }

    async function testgetAllFilesReceived() {
        let that = this;
        for (let fd of rainbowSDK.fileStorage.getAllFilesReceived()) {
            logger.log("debug", `Main - Checking file ${fd.fileName} ...`, fd);
            let fileDescriptorFull = await rainbowSDK.fileStorage.retrieveOneFileDescriptor(fd.id);
            logger.log("debug", `Main - fileDescriptorFull : `, fileDescriptorFull);
        }
    }

    async function testaddFileViewer() {
        let that = this;

        let user: Contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
        let filesDescriptors: [any] = await rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner();
        for (let fileDescriptor of filesDescriptors) {
            let fileName = fileDescriptor.fileName;
            logger.log("debug", "Main - testaddFileViewer Checking file : ", fileName);
            let fileDescriptorFull = await rainbowSDK.fileStorage.retrieveOneFileDescriptor(fileDescriptor.id);
            logger.log("debug", "Main - testaddFileViewer fileDescriptorFull : ", fileDescriptorFull);
            let fileShared = await rainbowSDK.fileStorage.addFileViewer(fileDescriptorFull.id, user.id, "user");
            logger.log("debug", "Main - testaddFileViewer file shared : ", fileName);
        }
    }

    async function testdownloadFile() {
        let that = this;
        for (let fd of rainbowSDK.fileStorage.getAllFilesReceived()) {
            logger.log("debug", `Main - Checking file ${fd.fileName} ...`);
            if (!fs.existsSync("c:\\temp\\" + fd.fileName) || true) {
                logger.log("debug", `Main - TEST Downloading file ${fd.fileName} ...`);
                if (fd.fileName!="app-ovgtw1_0_34.tar" && fd.fileName!="Delta_Player_on.png") {
                    //logger.log("debug", `Main - Will NOT Download file ${fd.fileName} done`);
                } else {
                    logger.log("debug", `Main - Will Download file ${fd.fileName} : `, fd);
                    // continue;
                    let file: any;
                    file = await rainbowSDK.fileStorage.downloadFile(fd);
                    logger.log("debug", `Main - Downloading file ${fd.fileName} done`);
                    if (file) {
                        try {
                            let blobArray = file.buffer;

                            let writeStream = createWriteStream("c:\\temp\\" + fd.fileName);

                            writeStream.on('error', () => {
                                logger.log("debug", "Main - [RecordsService] WriteStream error event");
                            });
                            writeStream.on('drain', () => {
                                logger.log("debug", "Main - [RecordsService] WriteStream drain event");
                            });

                            for (let index = 0; index < blobArray.length; index++) {
                                if (blobArray[index]) {
                                    logger.log("debug", "[FileServerService] >writeAvailableChunksInDisk : Blob " + index + " available");
                                    //fd.chunkWrittenInDisk = index;
                                    writeStream.write(new Buffer(blobArray[index]));
                                    blobArray[index] = null;
                                } else {
                                    this.$log.debug("[FileServerService] >writeAvailableChunksInDisk : Blob " + index + " NOT available");
                                    break;
                                }
                            }
                            logger.log("debug", `Main - The file ${fd.fileName} was saved!`);
                        } catch (e) {
                            logger.log("debug", `Main - Error saving file ${fd.fileName} from Rainbow`, e);
                        }
                    } else {
                        logger.log("error", `Main - Error downloading file ${fd.fileName}`);
                    }
                }
            } else {
                logger.log("debug", `File ${fd.fileName} already downloaded`)
            }
        }
    }

    async function testdownloadFileInPath() {
        let that = this;
        for (let fd of rainbowSDK.fileStorage.getAllFilesReceived()) {
            logger.log("debug", `Main - Checking file ${fd.fileName} ...`);
            if (!fs.existsSync("c:\\temp\\" + fd.fileName) || true) {
                logger.log("debug", `MAIN - TEST Downloading file ${fd.fileName} ...`);
                if (fd.fileName!="app-ovgtw1_0_34.tar") {
                    //if ( fd.fileName != "Delta_Player_on.png" ) {
                    //logger.log("debug", `Main - Will NOT Download file ${fd.fileName} done`);
                } else {
                    logger.log("debug", `Main - Will Download file ${fd.fileName} : `, fd);
                    // continue;
                    let file$: any;
                    file$ = await rainbowSDK.fileStorage.downloadFileInPath(fd, "c:\\temp\\");
                    let currentValue: any = 0;
                    file$.subscribe({
                        next(value) {
                            currentValue = value;
                            if (value < 101) {
                                logger.log("internal", "MAIN - (downloadFile) % : ", value);
                            } else {
                                logger.log("internal", "MAIN - value !< 101 : File downloaded in Next : ", currentValue ? currentValue.fileName:"");
                                logger.log("debug", "MAIN - File downloaded");
                            }
                        },
                        complete() {
                            if (currentValue < 101) {
                                logger.log("internal", "MAIN - (downloadFile) % : ", currentValue);
                            } else {
                                logger.log("internal", "MAIN - value !< 101 : File downloaded in Complete : ", currentValue ? currentValue.fileName:"");
                                logger.log("debug", "MAIN - File downloaded");
                            }
                        }
                    });
                    logger.log("debug", `MAIN - Downloading file ${fd.fileName} done`);
                }
            } else {
                logger.log("debug", `File ${fd.fileName} already downloaded`)
            }
        }
    }

    function testUploadFileToConversation() {
        let that = this;
        // let conversation = null;
        let file = null;
        //let strMessage = {message: "message for the file"};
        let strMessage = "message for the file";
        //that.readFile("c:\\temp\\15777240.jpg", "binary").then((data)=> {
        //file = new fileapi.File("c:\\temp\\15777240.jpg");
        /*
            file = new fileapi.File({
    
        //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                    path: "c:\\temp\\IMG_20131005_173918.jpg",   // path of file to read
                    //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read
    
        //            buffer: Node.Buffer,          // use this Buffer instead of reading file
        //            stream: Node.ReadStream,      // use this ReadStream instead of reading file
        //            name: "SomeAwesomeFile.txt",  // optional when using `path`
                    // must be supplied when using `Node.Buffer` or `Node.ReadStream`
        //            type: "text/plain",           // generated based on the extension of `name` or `path`
    
    
                    jsdom: true,                  // be DoM-like and immediately get `size` and `lastModifiedDate`
                                                  // [default: false]
    
    
                    async: false,                  // use `fs.stat` instead of `fs.statSync` for getting
                    // the `jsdom` info
                    // [default: false]
    
    
                    //   lastModifiedDate: fileStat.mtime.toISOString()
    
    
        //            size: fileStat.size || Buffer.length
                }
            ); // */
        file = {
            "path": "c:\\temp\\IMG_20131005_173918.jpg",
            "name": "IMG_20131005_173918.jpg",
            "type": "image/JPEG",
            "size": 2960156
        };
        logger.log("debug", "MAIN - uploadFileToConversation - file.name : ", file.name, ", file.type : ", file.type, ", file.path : ", file.path, ", file.size : ", file.size);
        rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function (contact) {
            // Retrieve the associated conversation
            return rainbowSDK.conversations.openConversationForContact(contact);
        }).then(function (conversation) {
            // Share the file
            return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
                logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
            });
        });
        //});
    }

    function testUploadFileToConversationEmpty() {
        let that = this;
        // let conversation = null;
        let file = null;
        //let strMessage = {message: "message for the file"};
        let strMessage = "message for the file";
        file = {
            "path": "c:\\temp\\NotExistingFile.jpg",
            "name": "NotExistingFile.jpg",
            "type": "image/JPEG",
            "size": 2960156
        };
        logger.log("debug", "MAIN - uploadFileToConversation - file.name : ", file.name, ", file.type : ", file.type, ", file.path : ", file.path, ", file.size : ", file.size);
        rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function (contact) {
            // Retrieve the associated conversation
            return rainbowSDK.conversations.openConversationForContact(contact);
        }).then(function (conversation) {
            // Share the file
            return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
                logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
            }).catch((err) => {
                logger.log("error", "MAIN - uploadFileToConversation - error : ", err);
            });
        });
        //});
    }

    function testUploadFileToConversationByPath() {
        let that = this;
        // let conversation = null;
        let file = null;
        //let strMessage = {message: "message for the file"};
        let strMessage = "message for the file";
        file = "c:\\temp\\IMG_20131005_173918XXXXXXXXXXX.jpg";
        logger.log("debug", "MAIN - uploadFileToConversation - file : ", file);
        rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function (contact) {
            // Retrieve the associated conversation
            return rainbowSDK.conversations.openConversationForContact(contact);
        }).then(function (conversation) {
            // Share the file
            return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
                logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
            }).catch((errr) => {
                logger.log("error", "MAIN - uploadFileToConversation - error : ", errr);
            });
        });
        //});
    }

    function testuploadFileToStorage() {
        let that = this;
        // let conversation = null;
        let file = null;
        //let strMessage = {message: "message for the file"};
        let strMessage = "message for the file";
        file = "c:\\temp\\IMG_20131005_173918XXXXXXXXXXX.jpg";
        logger.log("debug", "MAIN - uploadFileToConversation - file : ", file);
        // Share the file
        return rainbowSDK.fileStorage.uploadFileToStorage(file).then((result) => {
            logger.log("debug", "MAIN - uploadFileToStorage - result : ", result);
        }).catch((errr) => {
            logger.log("error", "MAIN - uploadFileToStorage - error : ", errr);
        });
    }

    async function testfileOwnershipChange() {
        let that = this;
        let contactEmail = "vincent03@vbe.test.openrainbow.net";
        //let contactEmail = "vincent.berder@al-enterprise.com";
        rainbowSDK.contacts.getContactByLoginEmail(contactEmail).then(async (contact: any) => {
            if (contact) {
                logger.log("debug", "MAIN - [testfileOwnershipChange    ] :: getContactByLoginEmail contact : ", contact);

                try {


                    // let conversation = null;
                    let file = null;
                    //let strMessage = {message: "message for the file"};
                    let strMessage = "message for the file";
                    file = "c:\\temp\\IMG_20131005_173918.jpg";
                    logger.log("debug", "MAIN - testfileOwnershipChange - file : ", file);
                    // Share the file
                    let fileStored: any = await rainbowSDK.fileStorage.uploadFileToStorage(file);
                    logger.log("debug", "MAIN - testfileOwnershipChange - fileStored.id : ", fileStored.id, ", fileStored.fileName : ", fileStored.fileName, ", fileStored.url : ", fileStored.url, ", fileStored.ownerId : ", fileStored.ownerId);
                    let fileOwnerChanged = await rainbowSDK.fileStorage.fileOwnershipChange(fileStored.id, contact.id);
                    logger.log("debug", "MAIN - testfileOwnershipChange - fileOwnerChanged.id : ", fileOwnerChanged.id, ", fileOwnerChanged.fileName : ", fileOwnerChanged.fileName, ", fileOwnerChanged.url : ", fileOwnerChanged.url, ", fileOwnerChanged.ownerId : ", fileOwnerChanged.ownerId); 
                } catch (err) {
                    logger.log("error", "MAIN - testfileOwnershipChange - error : ", err);
                }
            }
        });
    }

    function testRetrieveOneFileDescriptor() {
        logger.log("debug", "Main - testRetrieveOneFileDescriptor - file - ");
        let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId("5cab49e3827d70023481c17a");
        logger.log("debug", "Main - testRetrieveOneFileDescriptor, getFileDescriptorFromId - result : ", fileDescriptorsReceived);
        rainbowSDK.fileStorage.retrieveOneFileDescriptor("5cab49e3827d70023481c17a").then((fileDescriptorsReceived) => {
            logger.log("debug", "Main - testRetrieveOneFileDescriptor, retrieveOneFileDescriptor - result : ", fileDescriptorsReceived);
        });
    }

    async function testgetFileDescriptorsByCompanyId() {
        // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
        logger.log("debug", "MAIN - testgetFileDescriptorsByCompanyId. ");
        /*let format  : string = "small";
        let sortField : string = "name" ;
        let bpId : string = undefined ;
        let catalogId : string = undefined ;
        let offerId : string = undefined ;
        let offerCanBeSold : boolean = undefined ;
        let externalReference : string = undefined;
        let externalReference2 : string = undefined;
        let salesforceAccountId : string = undefined;
        let selectedAppCustomisationTemplate : string = undefined
        let selectedThemeObj: boolean = undefined;
        let offerGroupName : string = undefined;
        let limit : number = 100;
        let offset : number = 0;
        let sortOrder : number = 1;
        let name : string = "westworld guest_";
        let status : string = undefined;
        let visibility : string = undefined;
        let organisationId : string = undefined
        let isBP : boolean = undefined;
        let hasBP : boolean = undefined;
        let bpType : string = undefined;

        let allCompanies: any = await rainbowSDK.admin.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType);
        logger.log("debug", "MAIN - testgetFileDescriptorsByCompanyId - allCompanies : ", allCompanies.length);
        
        // */

        let filesDescriptors = await rainbowSDK.fileStorage.getFileDescriptorsByCompanyId();
        logger.log("debug", "MAIN - testgetFileDescriptorsByCompanyId - filesDescriptors : ", filesDescriptors);
        
        /*let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
                logger.log("debug", "MAIN - testretrieveRainbowUserList vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
        logger.log("debug", "MAIN - testretrieveRainbowUserList - companyId : ", companyId);

        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
        logger.log("debug", "MAIN - testretrieveRainbowUserList - result : ", result);
        // */

    }
    
    async function testretrieveFileDescriptorsListPerOwner() {
        let filesDescriptors = await rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner();
        logger.log("debug", "MAIN - testretrieveFileDescriptorsListPerOwner - filesDescriptors : ", filesDescriptors);
    }
    
    //endregion Files

    //region Bubbles

    function testCreateBubbles() {
        let physician = {
            "name": "",
            "contact": null,
            "loginEmail": "vincent02@vbe.test.openrainbow.net",
//        "loginEmail": "vincent.berder@al-enterprise.com",
            "appointmentRoom": "testBot"
        };


        let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(physician.loginEmail).then((contact: any) => {
            if (contact) {
                logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);

                physician.name = contact.title + " " + contact.firstname + " " + contact.lastname;
                physician.contact = contact;
                for (let i = 0; i < 1; i++) {
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    rainbowSDK.bubbles.createBubble(physician.appointmentRoom + utc + contact + "_" + i, physician.appointmentRoom + utc + "_" + i, true).then((bubble) => {
                        logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);

                        rainbowSDK.events.on("rainbow_onbubbleaffiliationchanged", async (bubbleAffiliated) => {
                            // do something when the SDK has been started
                            logger.log("debug", "MAIN - (rainbow_onbubbleaffiliationchanged) - affiliationchanged : ");
                            if (bubbleAffiliated && bubbleAffiliated.users.filter((user) => {
                                let res = false;
                                if (user.userId===contact.id && user.status==="accepted") {
                                    res = true;
                                }
                                return res;
                            }).length===1) {
                                let utcMsg = new Date().getTime();
                                let message = "message de test in " + utcMsg;
                                await setTimeoutPromised(2000);
                                await rainbowSDK.im.sendMessageToBubbleJid(message, bubbleAffiliated.jid, "en", {
                                    "type": "text/markdown",
                                    "message": message
                                }, "subject", undefined);
                            }
                        });

                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                            //await Utils.setTimeoutPromised(200);
                            /*let utcMsg = new Date().getTime();
                            let message = "message de test in " + utcMsg;
                            rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
                            // */
                            /*rainbowSDK.bubbles.deleteBubble(bubble).then(() => {
                                let bubbles = rainbowSDK.bubbles.getAll();
                                logger.log("debug", "MAIN testCreateBubbles - after deleteBubble - bubble : ", bubble, ", bubbles : ", bubbles);
                            }); */
                            /*rainbowSDK.contacts.getContactByLoginEmail(botappointment).then(contactbot => {
                                rainbowSDK.bubbles.inviteContactToBubble(contactbot, bubble, false, false).then(function () {
                                    setTimeout(() => { rainbowSDK.bubbles.promoteContactInBubble(contactbot, bubble).then(function (updatedBubble) {
                                        rainbowSDK.conversations.getBubbleConversation(updatedBubble).then(conversation => {
                                           logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok", conversation);
                                       });
                                   })} , 2000);
                               });
                           }); // */
                        });
                    });
                }
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    async function testCreateBubbleAndSendMessage() {
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        let appointmentRoom = "testBot";
        //let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                let utc = new Date().toJSON().replace(/-/g, "/");
                await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                    logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                        let message = "message de test";
                        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                            "type": "text/markdown",
                            "message": message
                        }, "subject", undefined, "middle");
                    });
                });
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }
    
  async function testCreateBubbleAndInvite() {
        let loginEmail = "vincent01@vbe.test.openrainbow.net";
        let appointmentRoom = "testBot_";
        //let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testCreateBubbleAndInvite    ] :: getContactByLoginEmail contact : ", contact);
                let utc = new Date().toJSON().replace(/-/g, "/");
                await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                    logger.log("debug", "MAIN - [testCreateBubbleAndInvite    ] :: createBubble request ok", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                        /*let message = "message de test";
                        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                            "type": "text/markdown",
                            "message": message
                        }, "subject", undefined, "middle");
                        // */
                    });
                });
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    async function testCreateBubbleWithNoInvitationAndSendMessage() {
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        let appointmentRoom = "testBot";
        //let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                let utc = new Date().toJSON().replace(/-/g, "/");
                await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                    logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                        /* let message = "message de test";
                        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                            "type": "text/markdown",
                            "message": message
                        }, "subject", undefined, "middle");
                        // */
                    });
                });
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    async function testCreate50BubblesAndArchiveThem() {
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        let appointmentRoom = "testBot";
        //let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                for (let i = 0; i < 5; i++) {
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + i, appointmentRoom + utc + "_" + i).then(async (bubble: any) => {
                        logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                            let message = "message de test";
                            await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                                "type": "text/markdown",
                                "message": message
                            }, "subject", undefined, "middle");
                            /*await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
                            await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject"); // */
                            rainbowSDK.bubbles.archiveBubble(bubble).then(() => {
                                let bubbles = rainbowSDK.bubbles.getAll();
                                logger.log("debug", "MAIN testCreateBubbles - after archiveBubble - bubble : ", bubble, ", bubbles : ", bubbles);
                            }); // */
                            /*rainbowSDK.contacts.getContactByLoginEmail(botappointment).then(contactbot => {
                                rainbowSDK.bubbles.inviteContactToBubble(contactbot, bubble, false, false).then(function () {
                                    setTimeout(() => { rainbowSDK.bubbles.promoteContactInBubble(contactbot, bubble).then(function (updatedBubble) {
                                        rainbowSDK.conversations.getBubbleConversation(updatedBubble).then(conversation => {
                                           logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok", conversation);
                                       });
                                   })} , 2000);
                               });
                           }); // */
                        });
                    });
                }
                rainbowSDK.bubbles.getBubblesConsumption().then(consumption => {
                    if (consumption) {
                        logger.log("debug", "MAIN - [testCreate50BubblesAndArchiveThem    ] :: getBubblesConsumption consumption : ", consumption);
                    } else {
                        logger.log("debug", "MAIN - [testCreate50BubblesAndArchiveThem    ] :: getBubblesConsumption no consumption found.");
                    }
                });
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    async function testCreate50BubblesAndActivateThem() {
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        let appointmentRoom = "testBot";
        //let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                for (let i = 0; i < 50; i++) {
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    let bubbleName = appointmentRoom + "_" + utc + contact + "_" + i;
                    let timeBetweenCreate = 2000 + (getRandomInt(6) * 1000);
                    await setTimeoutPromised(timeBetweenCreate).then(async () => {
                        logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ", bubbleName, " after : ", timeBetweenCreate, " seconds waiting.");

                        await rainbowSDK.bubbles.createBubble(bubbleName, "desc : " + appointmentRoom + "_" + utc + "_" + i).then(async (bubble: any) => {
                            logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
                            rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                                let message = "message de test";
                                await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                                    "type": "text/markdown",
                                    "message": message
                                }, "subject");
                                // await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
                                // await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
                                let bubbles = rainbowSDK.bubbles.getAll();
                                logger.log("debug", "MAIN testCreateBubbles - after archiveBubble - bubble : ", bubble, ", bubbles : ", bubbles);
                            });
                        });
                        // */
                    });

                }
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    function testCreateBubblesAndInviteContactsByEmails() {
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble: any) => {
            logger.log("debug", "MAIN - [testCreateBubblesAndInviteContactsByEmails    ] :: createBubble request ok", bubble);

            let contacts = [];
            let d = new Date();
            let t = d.getTime();
            let y = Math.round(t);
            contacts.push("invited." + y + ".01@vbe.test.openrainbow.net");
            contacts.push("invited." + y + ".02@vbe.test.openrainbow.net");
            rainbowSDK.bubbles.inviteContactsByEmailsToBubble(contacts, bubble).then(async () => {
                let message = "message de test";
                await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                    "type": "text/markdown",
                    "message": message
                }, "subject", undefined, "middle");
            });
        });
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    function testCreateBubblesOnly() {
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble: any) => {
            logger.log("debug", "MAIN - [testCreateBubblesAndInviteContactsByEmails    ] :: createBubble request ok", bubble);
        });
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    async function testNbCreateBubblesOnly(nbBubblesToCreate: number) {
        let utc = new Date().toJSON().replace(/-/g, "/");
        for (let i = 0; i < nbBubblesToCreate; i++) {
            await rainbowSDK.bubbles.createBubble("bubbles_" + i + "_" + utc, "bubbles_" + i + "_" + utc).then((bubble: any) => {
                logger.log("debug", "MAIN - [testNbCreateBubblesOnly    ] :: createBubble nb " + i + " ok : ", bubble.id);
            });
            await setTimeoutPromised(800);
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }
    }

    function testCreateBubble_closeAndDeleteBubble() {
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.bubbles.createBubble("testCreateBubble_closeAndDeleteBubble" + utc, "testCreateBubble_closeAndDeleteBubble" + utc, true).then((bubble) => {
            logger.log("debug", "MAIN - [testCreateBubble_closeAndDeleteBubble    ] :: createBubble request ok, bubble : ", bubble);
            rainbowSDK.bubbles.closeAndDeleteBubble(bubble).then((result) => {
                logger.log("debug", "MAIN - [testCreateBubble_closeAndDeleteBubble    ] :: closeAndDeleteBubble request ok, result : ", result);
            });
        });
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    async function testsendMessageToBubbleJid_WithMention() {
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        let bubbleName = "testBotName_";
        let bubbleDescription = "testBotDescription_";
        let bubbleMessage = "testBotMessage_";
        let bubbleMessageSubject = "testBotMessageSubject_";

        //let botappointment = "vincent01@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
            if (contact) {
                logger.log("debug", "MAIN - [testsendMessageToBubbleJid_WithMention    ] :: getContactByLoginEmail contact : ", contact);
                let utc: string = new Date().toJSON().replace(/-/g, "/");
                bubbleName += utc + contact.name.value;
                bubbleDescription += utc;
                bubbleMessageSubject += utc;
                await rainbowSDK.bubbles.createBubble(bubbleName, bubbleDescription, true).then(async (bubble: any) => {
                    logger.log("debug", "MAIN - [testsendMessageToBubbleJid_WithMention    ] :: createBubble request ok", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {
                        let message = bubbleMessage + " @" + contact.name.value + " ";
                        let mentions = [];

                        mentions.push(contact.jid);
                        let content = {
                            message,
                            type: "text/markdown"
                        };


                        await setTimeoutPromised(20000);
                        //mentions
                        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", content, undefined, contact.jid);
                        //await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", content, bubbleMessageSubject, contact.jid);
                        /*await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                            "type": "text/markdown",
                            "message": message + " @" + contact.name.value
                        }, "subject", mentions); // */
                    });
                });
            }
        }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    function testgetBubblesConsumption() {
        rainbowSDK.bubbles.getBubblesConsumption().then(consumption => {
            if (consumption) {
                logger.log("debug", "MAIN - [testgetBubblesConsumption    ] :: getBubblesConsumption consumption : ", consumption);
            } else {
                logger.log("debug", "MAIN - [testgetBubblesConsumption    ] :: getBubblesConsumption no consumption found.");
            }
        });

    }

    async function testgetAllOwnedNotArchivedBubbles() {
        let bubblesNotArchived = await rainbowSDK.bubbles.getAllOwnedNotArchivedBubbles();
        logger.log("debug", "MAIN - testgetAllOwnedNotArchivedBubbles - bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);
    }

    async function testgetAllOwnedArchivedBubbles() {
        let bubblesArchived = await rainbowSDK.bubbles.getAllOwnedArchivedBubbles();
        logger.log("debug", "MAIN - testgetAllOwnedArchivedBubbles - bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);
    }

    async function testgetAllOwnedBubblesArchivedBubbles() {
        let result = rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testgetAllOwnedBubblesArchivedBubbles getAllOwnedBubbles - result : ", result, ", nb owned bulles : ", result ? result.length:0);

        async function asyncFilter(arr, predicate) {
            const results = await Promise.all(arr.map(predicate));

            return arr.filter((_v, index) => results[index]);
        }

        let bubblesNotArchived = await asyncFilter(result, async bubble => {
            return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===false);
        });
        logger.log("debug", "MAIN - testgetAllOwnedBubblesArchivedBubbles - bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);

        let bubblesArchived = await asyncFilter(result, async bubble => {
            return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===true);
        });
        logger.log("debug", "MAIN - testgetAllOwnedBubblesArchivedBubbles - bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);

    }

    async function testgetArchivedBubbles() {
        let result = rainbowSDK.bubbles.getAllBubbles();
        logger.log("debug", "MAIN - testgetArchivedBubbles getAllOwnedBubbles - result : ", result, ", nb owned bulles : ", result ? result.length:0);

        async function asyncFilter(arr, predicate) {
            const results = await Promise.all(arr.map(predicate));

            return arr.filter((_v, index) => results[index]);
        }

        let bubblesNotArchived = await asyncFilter(result, async bubble => {
            return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===false);
        });
        logger.log("debug", "MAIN - testgetArchivedBubbles - bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);

        let bubblesArchived = await asyncFilter(result, async bubble => {
            return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===true);
        });
        logger.log("debug", "MAIN - testgetArchivedBubbles - bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);

    }

    function testArchive10BubblesFromgetAllActiveBubbles() {
        let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();
        logger.log("debug", "MAIN - testArchive10BubblesFromgetAllActiveBubbles getAllActiveBubbles - nb owned bulles : ", bubbles ? bubbles.length:0);

        for (let i = 0; i < 10; i++) {
            rainbowSDK.bubbles.archiveBubble(bubbles[i]).then((result) => {
                logger.log("debug", "MAIN - testArchive10BubblesFromgetAllActiveBubbles archiveBubble - iter : ", i, ", result : ", result);

            });
        }
    }

//utils.setTimeoutPromised(1).then(()=> {
//    rainbowSDK.start();
//});
    function testBubblesArchived() {
        /*let bubbles = rainbowSDK.bubbles.getAllBubbles();
    
        bubbles.forEach((bubble) => {
            logger.log("debug", "MAIN - [testBubblesArchived    ] :: bubble : ", bubble);
        }); */
        let bubbleTestestsed = "room_e290bece54c34d69aef68f831be0d309@muc.vberder-all-in-one-dev-1.opentouch.cloud";
        rainbowSDK.bubbles.getBubbleByJid(bubbleTestestsed).then((bubbleFound) => {
            logger.log("debug", "MAIN - [testBubblesArchived    ] :: bubbleFound : ", bubbleFound);
            let utc = new Date().toJSON().replace(/-/g, "_");
            let message = "message " + utc;
            let jid = bubbleFound.jid;
            let lang = "en";
            let content = {"type": "text/markdown", "message": "**A message** for a _bubble_" + utc};
            let subject = "subject";
            rainbowSDK.im.sendMessageToBubbleJid(message, jid, lang, content, subject).then((result) => {
                logger.log("debug", "MAIN - testBubblesArchived sendMessageToBubbleJid result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
            }).catch((err) => {
                logger.log("error", "MAIN - testBubblesArchived error while sendMessageToBubbleJid result : ", err); //logger.colors.green(JSON.stringify(result)));
            });
        });
    }

    async function testSetBubbleCustomData() {
            let that = this;
            let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble;
            if (activesBubbles && activesBubbles.length > 0) {
                //bubble = Object.assign(new Bubble(), activesBubbles[0]);
                bubble = Bubble_1.Bubble.BubbleFactory("", rainbowSDK.contacts)(activesBubbles[0]);
            }
            //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
            logger.log("debug", "MAIN - testSetBubbleCustomData - bubble : ", bubble);
            //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
            let now = new Date().getTime();
            await rainbowSDK.bubbles.setBubbleCustomData(bubble, {
                "mypersonnaldata": "valueofmypersonnaldata",
                "updateDate": now
            });
            /*    await utils.setTimeoutPromised(3000);
    
                activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
                activesBubbles.forEach( ( bubbleIter )=> {
                    if (bubble && bubbleIter && bubbleIter.id === bubble.id) {
                        logger.log("debug", "MAIN - testSetBubbleCustomData, Few seconds after sending the customData bubbleIter : ", bubbleIter);
                    }
    
                });
            // */
            //});
    }

    async function testSetBubbleName() {
            let that = this;
            let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble;
            if (activesBubbles && activesBubbles.length > 0) {
                //bubble = Object.assign(new Bubble(), activesBubbles[0]);
                bubble = await Bubble_1.Bubble.BubbleFactory(undefined, rainbowSDK.contacts)(activesBubbles[0]);
            }
            //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
            logger.log("debug", "MAIN - testSetBubbleName - bubble : ", bubble);
            //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
            let now = new Date().getTime();
            let bubbleUpdated = await rainbowSDK.bubbles.setBubbleName(bubble, "TestName_" + now);
            logger.log("debug", "MAIN - testSetBubbleName, bubbleUpdated : ", bubbleUpdated);
    }

    async function testSetBubbleTopic() {
            let that = this;
            let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble;
            if (activesBubbles && activesBubbles.length > 0) {
                //bubble = Object.assign(new Bubble(), activesBubbles[0]);
                bubble = await Bubble_1.Bubble.BubbleFactory(undefined, rainbowSDK.contacts)(activesBubbles[0]);
            }
            //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
            logger.log("debug", "MAIN - testSetBubbleTopic - bubble : ", bubble);
            //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
            let now = new Date().getTime();
            let bubbleUpdated = await rainbowSDK.bubbles.setBubbleTopic(bubble, "TestTopic_" + now);
            logger.log("debug", "MAIN - testSetBubbleTopic, bubbleUpdated : ", bubbleUpdated);
    }


    async function testDeletebubble() {
            let bubbleId = "5cde768d424fb13186b9e6d4";
            let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            rainbowSDK.bubbles.deleteBubble(bubble);
    }

    async function testDeleteBubble() {
            let bubbles = await rainbowSDK.bubbles.getAllOwnedBubbles();
            logger.log("debug", "MAIN - testDeleteBubble bubbles : ", bubbles); //logger.colors.green(JSON.stringify(result)));
            rainbowSDK.bubbles.deleteBubble(bubbles[0]).then((resultDelete) => {
                logger.log("debug", "MAIN - testDeleteBubble resultDelete : ", resultDelete); //logger.colors.green(JSON.stringify(result)));
            });
    }

    async function testDeleteBubble_ByBubbleId(bubbleId) {
            let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            logger.log("debug", "MAIN - testDeleteBubble_ByBubbleId, ", bubbleId, ", bubble : ", bubble); //logger.colors.green(JSON.stringify(result)));
            rainbowSDK.bubbles.deleteBubble(bubble).then((resultDelete) => {
                logger.log("debug", "MAIN - testDeleteBubble_ByBubbleId resultDelete : ", resultDelete); //logger.colors.green(JSON.stringify(result)));
            });
    }

    async function testLeaveBubble() {
            let bubbles = await rainbowSDK.bubbles.getAllBubbles();
            logger.log("debug", "MAIN - testLeaveBubble bubbles : ", bubbles); //logger.colors.green(JSON.stringify(result)));
            for (const bubble of bubbles) {
                if (bubble.name.indexOf("testBot")!= -1) {
                    logger.log("debug", "MAIN - testLeaveBubble Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive); //logger.colors.green(JSON.stringify(result)));
                    if (bubble.ownerContact.id===rainbowSDK._core._rest.userId) {
                        // The bubble should be deleted instead of leaved
                        logger.log("debug", "MAIN - testLeaveBubble Found bubble.name : ", bubble.name, ", The bubble should be deleted instead of leaved."); //logger.colors.green(JSON.stringify(result)));
                        rainbowSDK.bubbles.deleteBubble(bubble).then((resultDelete) => {
                            logger.log("debug", "MAIN - testLeaveBubble resultDelete : ", resultDelete); //logger.colors.green(JSON.stringify(result)));
                        });
                    } else {
                        rainbowSDK.bubbles.leaveBubble(bubble).then((resultLeave) => {
                            logger.log("debug", "MAIN - testLeaveBubble bubble.name : ", bubble.name, ", resultLeave : ", resultLeave); //logger.colors.green(JSON.stringify(result)));
                        });
                        // */
                    }
                } else {
                    logger.log("debug", "MAIN - testLeaveBubble NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive); //logger.colors.green(JSON.stringify(result)));
                }
            }
    }

    function testCreateBubblesAndSetTags() {
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.bubbles.createBubble("testCreateBubblesAndSetTags" + utc, "testCreateBubblesAndSetTags" + utc).then((bubble: any) => {
            logger.log("debug", "MAIN - [testCreateBubblesAndSetTags    ] :: createBubble request ok", bubble);

            let tags: any = [{"tag": "Essai1DeTag"}, {"tag": "Essai2deTag"}];
            rainbowSDK.bubbles.setTagsOnABubble(bubble, tags).then(async (result) => {
                logger.log("debug", "MAIN - [testCreateBubblesAndSetTags    ] :: setTagsOnABubble result : ", result);

                let tags = ["Essai1DeTag"];
                rainbowSDK.bubbles.retrieveAllBubblesByTags(tags).then(bubbles => {
                    if (bubbles) {
                        logger.log("debug", "MAIN - [testCreateBubblesAndSetTags    ] :: bubbles : ", bubbles);
                    }
                }).catch((err) => {
                    logger.log("error", "MAIN - [testCreateBubblesAndSetTags    ] :: error : ", err);
                });
            });
        });
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }


    function testretrieveAllBubblesByTags() {
        //let tags = [{tag: "Essai1DeTag"}];
        let tags = ["Essai1DeTag", "tagess2"];
        let tags1 = ["Essai1DeTag"];
        rainbowSDK.bubbles.retrieveAllBubblesByTags(tags1).then(bubbles => {
            if (bubbles) {
                logger.log("debug", "MAIN - [testretrieveAllBubblesByTags    ] :: one tag bubbles : ", bubbles);
            }
        }).catch((err) => {
            logger.log("error", "MAIN - [testretrieveAllBubblesByTags    ] :: error : ", err);
        });
        rainbowSDK.bubbles.retrieveAllBubblesByTags(tags).then(bubbles => {
            if (bubbles) {
                logger.log("debug", "MAIN - [testretrieveAllBubblesByTags    ] :: two tags bubbles : ", bubbles);
            }
        }).catch((err) => {
            logger.log("error", "MAIN - [testretrieveAllBubblesByTags    ] :: error : ", err);
        });
    }

    function testCreateBubblesAndSetTagsAndDeleteTags() {
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.bubbles.createBubble("testCreateBubblesAndSetTagsAndDeleteTags" + utc, "testCreateBubblesAndSetTagsAndDeleteTags" + utc).then((bubble: any) => {
            logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: createBubble request ok", bubble);

            let tags: any = [{"tag": "Essai1DeTag"}, {"tag": "Essai2deTag"}];
            rainbowSDK.bubbles.setTagsOnABubble(bubble, tags).then(async (result) => {
                logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: setTagsOnABubble result : ", result);

                let tags = ["Essai1DeTag"];
                rainbowSDK.bubbles.retrieveAllBubblesByTags(tags).then(bubblesIdTags => {
                    if (bubblesIdTags) {
                        logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: bubblesIdTags : ", bubblesIdTags);

                        let bubblesTagsToDelete = [];
                        bubblesTagsToDelete.push({id: bubblesIdTags.rooms[0].roomId});
                        rainbowSDK.bubbles.deleteTagOnABubble(bubblesTagsToDelete, tags[0]).then(result => {
                            if (result) {
                                logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: deleteTagsOnABubble result : ", JSON.stringify(result));
                            }
                        }).catch((err) => {
                            logger.log("error", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: error : ", err);
                        });

                    }
                }).catch((err) => {
                    logger.log("error", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: error : ", err);
                });
            });
        });
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    function testUploadFileToBubble() {
        let that = this;
        let file = null;
        let strMessage = "message for the file";
        file = new fileapi.File({
            //            path: "c:\\temp\\15777240.jpg",   // path of file to read
            path: "c:\\temp\\IMG_20131005_173918.jpg",
            //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read
            jsdom: true,
            async: false,
        });
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result = rainbowSDK.bubbles.getAllActiveBubbles();
        logger.log("debug", "EngineVincent00 - uploadFileToBubble getAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
        if (result.length > 0) {
            let bubble = result[0];
            if (bubble.isActive == false) {
                that.presence.sendInitialBubblePresenceSync(bubble);
            } 
            // Share the file
            return rainbowSDK.fileStorage.uploadFileToBubble(bubble, file, strMessage).then((result) => {
                logger.log("debug", "EngineVincent00 - uploadFileToBubble - result : ", result);
            });
        }
        //});
    }

    function test_refreshMemberAndOrganizerLists() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result = rainbowSDK.bubbles.getAllActiveBubbles();
        logger.log("debug", "test_refreshMemberAndOrganizerLists - getAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
        if (result.length > 0) {
            let bubble = result[0];
            // Share the file
            rainbowSDK.bubbles.refreshMemberAndOrganizerLists(bubble);
            logger.log("debug", "MAIN - refreshMemberAndOrganizerLists - bubble : ", bubble);
        }
    }

    function testGetUsersFromBubble() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result = rainbowSDK.bubbles.getAllActiveBubbles();
        logger.log("debug", "MAIN - testGetUsersFromBubble getAllActiveBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
        if (result.length > 0) {
            let bubble = result[0];
            // Share the file
            return rainbowSDK.bubbles.getUsersFromBubble(bubble, undefined).then((users) => {
                logger.log("debug", "MAIN - testGetUsersFromBubble - users : ", users);
            });
        }
        //});
    }

    function testupdateAvatarForBubble() {
        let result = rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testupdateAvatarForBubble - result : ", result, "nb owned bulles : ", result ? result.length:0);
        rainbowSDK.bubbles.updateAvatarForBubble("c:\\temp\\IMG_20131005_173918.jpg", result[0]);
    }

    function testgetAllOwnedBubbles() {
        let result = rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testupdateAvatarForBubble - result : ", result, "nb owned bulles : ", result ? result.length:0);
    }

    async function testgetAvatarFromBubble() {
        let result = rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testgetAvatarFromBubble - result : ", result, "nb owned bulles : ", result ? result.length:0);
        let avatarBlob = await rainbowSDK.bubbles.getAvatarFromBubble(result[0]);
        logger.log("debug", "MAIN - testgetAvatarFromBubble - avatarBlob : ", avatarBlob);
    }

    //endregion Bubbles

    //region Conference V1
    
    function testGetAllConferences() {
        rainbowSDK.bubbles.retrieveConferences(undefined, false, false).then((conferences) => {
            logger.log("debug", "MAIN - retrieveAllConferences : ", conferences);
        });
    }
    
    async function testaskConferenceSnapshot() {
        let allConferences: [any] = await rainbowSDK.bubbles.retrieveConferences(undefined, false, false).then((conferences) => {
            logger.log("debug", "MAIN - testaskConferenceSnapshot all conferences : ", conferences);
            return conferences;
        });

        try {
            if (allConferences && allConferences.length > 0) {
                let conferenceInfo: ConferenceSession = await rainbowSDK.bubbles.askConferenceSnapshot(allConferences[0].id);
                logger.log("debug", "MAIN - testaskConferenceSnapshot conference : ", conferenceInfo);
            }
        } catch (err) {
            logger.log("debug", "MAIN - testaskConferenceSnapshot from existing conference Error : ", err);
        }

        try {
            let conferenceInfo: ConferenceSession = await rainbowSDK.bubbles.askConferenceSnapshot("XX7831e66d88e93afaa37cXX");
            logger.log("debug", "MAIN - testaskConferenceSnapshot conference : ", conferenceInfo);
        } catch (err) {
            logger.log("debug", "MAIN - testaskConferenceSnapshot non existing conference Error : ", err);
        }
    }

    function testStartConference() {
        let webrtcConferenceId = rainbowSDK.bubbles.getWebRtcConfEndpointId();
        logger.log("debug", "MAIN - testStartConference, webrtcConferenceId : ", webrtcConferenceId);

        let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();

        let myBubbleToConferenced = null;
        for (const bubble of bubbles) {
            if (bubble.name==="BullesOfTests") {
                logger.log("debug", "MAIN - testStartConference found BullesOfTests bubble : ", bubble);
                myBubbleToConferenced = bubble;
            }
        }

        rainbowSDK.bubbles.conferenceStart(myBubbleToConferenced).then((result) => {
            logger.log("debug", "MAIN - testStartConference, result : ", result);
        });
    }

    function testCreateBubblesAndJoinConference() {
        let physician = {
            "name": "",
            "contact": null,
            "loginEmail": "vincent02@vbe.test.openrainbow.net",
            "appointmentRoom": "testBot"
        };
        let botappointment = "vincent01@vbe.test.openrainbow.net";

        rainbowSDK.bubbles.getBubbleById("5bbb1f5fd6e166709a42d7c7").then((bubble) => {
            rainbowSDK.bubbles.joinConference(bubble).then((result) => {
                //let bubbles = rainbowSDK.bubbles.getAll();
                logger.log("debug", "MAIN testCreateBubblesAndJoinConference - after joinConference - bubble : ", bubble, ", result : ", result);
            });
        });

        // rainbowSDK.contacts.getContactByLoginEmail(physician.loginEmail).then(contact => {
        //     if (contact) {
        //         logger.log("debug", "MAIN - [testCreateBubblesAndJoinConference    ] :: getContactByLoginEmail contact : ", contact);
        //         physician.name = contact.title + " " + contact.firstname + " " + contact.lastname;
        //         physician.contact = contact;
        //         for (let i = 0; i < 1; i++) {
        //             let utc = new Date().toJSON().replace(/-/g, "/");
        //             rainbowSDK.bubbles.createBubble(physician.appointmentRoom + utc + contact + "_" + i, physician.appointmentRoom + utc + "_" + i).then((bubble) => {
        //                 logger.log("debug", "MAIN - [testCreateBubblesAndJoinConference    ] :: createBubble request ok", bubble);
        //                 rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async() => {
        //                     await Utils.setTimeoutPromised(600);
        //                     let message = "message de test";
        //                     //await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
        //                     rainbowSDK.bubbles.joinConference(bubble).then((result) => {
        //                         //let bubbles = rainbowSDK.bubbles.getAll();
        //                         logger.log("debug", "MAIN testCreateBubblesAndJoinConference - after joinConference - bubble : ", bubble, ", result : ", result);
        //                     }); // */
        //                     /*rainbowSDK.contacts.getContactByLoginEmail(botappointment).then(contactbot => {
        //                         rainbowSDK.bubbles.inviteContactToBubble(contactbot, bubble, false, false).then(function () {
        //                             setTimeout(() => { rainbowSDK.bubbles.promoteContactInBubble(contactbot, bubble).then(function (updatedBubble) {
        //                                 rainbowSDK.conversations.getBubbleConversation(updatedBubble).then(conversation => {
        //                                    logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok", conversation);
        //                                });
        //                            })} , 2000);
        //                        });
        //                    }); // */
        //                 });
        //             });
        //         }
        //     }
        // }); // */
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }

    //endregion Conference V1

    //region Guests

    async function testCreateAGuestAndAddItToACreatedBubble() {
        let loginEmail = "vincentGuest@vbe.test.openrainbow.net";
        let password = "Password_123"
        let bubbleName = "testBotName_";
        let bubbleDescription = "testBotDescription_";
        let bubbleMessage = "testBotMessage_";
        let bubbleMessageSubject = "testBotMessageSubject_";

        let utc: string = new Date().toJSON().replace(/-/g, "/");
        bubbleName += utc + "GuestUser";
        bubbleDescription += utc;
        bubbleMessageSubject += utc;
        await rainbowSDK.bubbles.createBubble(bubbleName, bubbleDescription, false).then(async (bubble: any) => {
            logger.log("debug", "MAIN - [testCreateAGuestAndAddItToACreatedBubble    ] :: createBubble request ok : ", bubble);
            rainbowSDK.bubbles.createPublicUrl(bubble).then(async (publicUrl) => {
                logger.log("debug", "MAIN - [testCreateAGuestAndAddItToACreatedBubble    ] :: createPublicUrl publicUrl : ", publicUrl);
                rainbowSDK.bubbles.registerGuestForAPublicURL(publicUrl, loginEmail, password, "VincentGuest", "berderGuest", "VBGuest", "Mr.", "DevGuest", "ITGuest").then(async (result) => {
                    logger.log("debug", "MAIN - [testCreateAGuestAndAddItToACreatedBubble    ] :: registerGuestForAPublicURL result : ", result);
                });
            });
        });

    }

    async function testCleanAGuest() {
        let loginEmail = "vincentGuest@vbe.test.openrainbow.net";
        let password = "Password_123"
        let bubbleName = "testBotName_";
        let bubbleDescription = "testBotDescription_";
        let bubbleMessage = "testBotMessage_";
        let bubbleMessageSubject = "testBotMessageSubject_";

        let utc: string = new Date().toJSON().replace(/-/g, "/");
        bubbleName += utc + "GuestUser";
        bubbleDescription += utc;
        bubbleMessageSubject += utc;
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
            if (contact) {
                logger.log("debug", "MAIN - [testCleanAGuest    ] :: getContactByLoginEmail contact : ", contact);
                rainbowSDK.admin.deleteUser(contact.id).then(async (result) => {
                    logger.log("debug", "MAIN - [testCleanAGuest    ] :: deleteUser result : ", result);
                });
            }
        });
    }

    //endregion Guests

//This is the event handler to detect change of a contact's presence and output in console contact name and new status
    rainbowSDK.events.on("rainbow_oncontactpresencechanged", (contact) => {
        //Presence event handler. Code in between curly brackets will be executed in case of presence change for a contact
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Presence status of contact in a roster : " + contact.displayName + ", changed to " + contact.presence);
        if (contact.presence!="Unknown") {
            return false;
        }
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) ----> ", contact.displayName, "(", contact.jid, ")", " - ", contact.presence);
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) ------------------Presence changed --------------------------");
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) --> ", contact.displayName);
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Presence ", contact.presence);
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Status", contact.status);
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Resources ", contact.resources);
        logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) -------------------------------------------------------------");
        //getLastMessageOfConversation(contact);
    });

    rainbowSDK.events.on("rainbow_onpresencechanged", (data) => {
        //Presence event handler. Code in between curly brackets will be executed in case of presence change for a contact
        logger.log("debug", "MAIN - (rainbow_onpresencechanged) Presence status of contact loggued in : " + data.displayName + ", changed to " + data.presence);
        //getLastMessageOfConversation(contact);
    });

    rainbowSDK.events.on("rainbow_onuserinviteaccepted", function (invit) {
        logger.log("debug", "MAIN - (rainbow_onuserinviteaccepted) invit : ", invit);
    });

    rainbowSDK.events.on("rainbow_oncontactremovedfromnetwork", async function (contact) {
        logger.log("debug", "MAIN - (rainbow_oncontactremovedfromnetwork) contact : ", contact);
    });


    async function testgetLastMessageOfConversation() {
        let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
        let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        let conversation = await getLastMessageOfConversation(contact);
        logger.log("debug", "MAIN - testgetLastMessageOfConversation - conversation : ", conversation);

        conversation.messages.forEach((message) => {
            logger.log("debug", "MAIN - testgetLastMessageOfConversation - conversation.message : ", message);
        });
    }

    async function testresetHistoryPageForConversation() {
        let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
        let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
            logger.log("debug", "MAIN - testGetHistoryPage - openConversationForContact, conversation : ", conversation);
            rainbowSDK.conversations.resetHistoryPageForConversation(conversation);
        });
    }

    function getLastMessageOfConversation(contact): Promise<Conversation> {
        let theLastMessageText = null;
        let conv = undefined;
        return new Promise((resolve, reject) => {
            //Request to create new conversation with the contact (in case if it does not exists)
            // or open existing (in case if it already exists)
            rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                logger.log("debug", "MAIN - getLastMessageOfConversation - openConversationForContact, conversation : ", conversation);
                conv = conversation;

                //This line of code will be executed when conversation object of the contact is provided
                //Check value of property conversation.historyComplete
                if (conversation.historyComplete===false) {
                    //Retrieve conversation history prior getting last message from conversation history
                    await getConversationHistory(conversation);
                    resolve(conversation);
                } else {
                    //The code below will be executed in case if conversation history in completed.
                    //Therefore we can call function to output the last message to console
                    PrintTheLastMessage(conversation);
                    resolve(conversation);
                }
            }).catch(function (err) {
                //Something when wrong with the server. Handle the trouble here
                logger.log("debug", "MAIN - Error occurred in function getLastMessageOfConversation:" + err);
            });

        });
    }

    function getConversationHistory(conversation) {
        return new Promise((resolve, reject) => {
            //get messages from conversation. Max number of messages whichcan be retrieved at once is 100
            rainbowSDK.im.getMessagesFromConversation(conversation, 3).then(function (result) {
                logger.log("debug", "MAIN - messages : ", result);
                // The conversation object is updated with the messages retrieved from the server after
                //execution of rainbowSDK.im.getMessagesFromConversation function
                // Check if there are is possibly more messages on the server than 100 requested
                if (conversation.historyComplete===false) {
                    // TO DO: get next 100 messages
                } else {
                    //At that pint conversation object has message history updated.
                    //Therefore we can call function to output the last message to console
                    PrintTheLastMessage(conversation);
                    resolve(conversation)
                }
            }).catch(function (err) {
                //Something when wrong with the server. Handle the trouble here
                logger.log("debug", "MAIN - Error in function getConversationHistory: " + err);
                reject(err);
            });
        });
    }

    function PrintTheLastMessage(conversation) {
        //Get number of messages in conversation
        let nbMessagesInConversation = conversation.messages.length;
        //If it is more than 0 then retrieve the last message from messages array.
        if (nbMessagesInConversation > 0) {
            //Note the messages array is 0 based, the first message has index 0
            //Therefore the last message index will be nbMessagesInConversation-1
            let theLastMessageText = conversation.messages[nbMessagesInConversation - 1].content;
            logger.log("debug", "MAIN - The last message text is: " + theLastMessageText);
            logger.log("debug", "MAIN - conversation.lastMessageText =" + conversation.lastMessageText);
        } else {
            logger.log("debug", "MAIN - There are no messages in the conversation");
        }
    }

    function getConversationHistoryMaxime(conversation) {
        return rainbowSDK.conversations.getHistoryPage(conversation, 100).then((conversationUpdated) => {
            return conversationUpdated.historyComplete ? conversationUpdated:getConversationHistoryMaxime(conversationUpdated);
        });
    }

    async function testGetHistoryPage() {
        let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
        let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
            logger.log("debug", "MAIN - testGetHistoryPage - openConversationForContact, conversation : ", conversation);
            getConversationHistoryMaxime(conversation).then(() => {
                logger.log("debug", "MAIN - testGetHistoryPage - getConversationHistoryMaxime, conversation : ", conversation);
            });
            ;
        });
    }

    async function testGetHistoryPageBubble() {
        let bubbles = rainbowSDK.bubbles.getAllBubbles();
        if (bubbles.length > 0) {
            let bubble = bubbles[0];
            rainbowSDK.conversations.getBubbleConversation(bubble.jid).then(async function (conversation) {
                logger.log("debug", "MAIN - testGetHistoryPageBubble - openConversationForContact, conversation : ", conversation);
                getConversationHistoryMaxime(conversation).then(() => {
                    logger.log("debug", "MAIN - testGetHistoryPageBubble - getConversationHistoryMaxime, conversation : ", conversation, ", status : ", conversation.status);
                });
            });
        }
    }


    function testgetAllConversations() {
        let conversations = rainbowSDK.conversations.getAllConversations();
        if (conversations) {
            conversations.forEach((conversation) => {
                logger.log("debug", "MAIN - [testgetAllConversations ] :: conversation.d : ", conversation.id);
            });
        }
    }

    async function testgetMyProfiles() {
        //let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        /*
        rainbowSDK.admin.retrieveUserSubscriptions(connectedUser.id).then(async function (result) {
            logger.log("debug", "MAIN - testretrieveUserSubscriptions - retrieveUserSubscriptions, result : ", result);
        });
        // */

        let result = rainbowSDK.profiles.getMyProfiles()
        logger.log("debug", "MAIN - testgetMyProfiles - getMyProfiles, result : ", result);
    }

//region BUBBLES CONTAINERS
    async function testgetAllBubblesContainers() {
        rainbowSDK.bubbles.getAllBubblesContainers().then(async function (result) {
            logger.log("debug", "MAIN - testgetAllBubblesContainers - getAllBubblesContainers, result : ", result);
        });
    }

    async function testgetAllBubblesContainersByName() {
        rainbowSDK.bubbles.getAllBubblesContainers("containers1").then(async function (result) {
            logger.log("debug", "MAIN - testgetAllBubblesContainersByName - getAllBubblesContainers, result : ", result);
        });
    }

    async function testgetABubblesContainersById() {
        rainbowSDK.bubbles.getAllBubblesContainers().then(async function (result) {
            logger.log("debug", "MAIN - testgetABubblesContainersById - getAllBubblesContainers, result : ", result);
            rainbowSDK.bubbles.getABubblesContainersById(result[0].id).then(async function (result2) {
                logger.log("debug", "MAIN - testgetABubblesContainersById - getABubblesContainersById, result2 : ", result2);

            });
        });
    }

    async function testaddBubblesToContainerById() {
        rainbowSDK.bubbles.getAllBubblesContainers("containers1").then(async function (result) {
            logger.log("debug", "MAIN - testaddBubblesToContainerById - getAllBubblesContainers, result : ", result);
            let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble = bubbles.find(element => element.name==="bubble2")
            let bubblesToMove = [];
            bubblesToMove.push(bubble.id);
            rainbowSDK.bubbles.addBubblesToContainerById(result[0].id, bubblesToMove).then(async function (result2) {
                logger.log("debug", "MAIN - testaddBubblesToContainerById - addBubblesToContainerById, result2 : ", result2);

            });
        });
    }

    async function testupdateBubbleContainerNameAndDescriptionById() {
        let name = "containers1"
        rainbowSDK.bubbles.getAllBubblesContainers(name).then(async function (result) {
            logger.log("debug", "MAIN - testupdateBubbleContainerNameAndDescriptionById - getAllBubblesContainers, result : ", result);
            let utc = new Date().toJSON().replace(/-/g, "_");
            name += "_" + utc;
            let description = "description_" + utc;
            rainbowSDK.bubbles.updateBubbleContainerNameAndDescriptionById(result[0].id, name, description).then(async function (result2) {
                logger.log("debug", "MAIN - testupdateBubbleContainerNameAndDescriptionById - addBubblesToContainersById, result2 : ", result2);
            });
        });
    }

    async function testcreateBubbleContainer() {
        let name = "containersNew"
        let utc = new Date().toJSON().replace(/-/g, "_");
        name += "_" + utc;
        let description = "description_" + utc;
        rainbowSDK.bubbles.createBubbleContainer(name, description).then(async function (result: any) {
            logger.log("debug", "MAIN - testcreateBubbleContainer - createBubbleContainer, result : ", result);
            rainbowSDK.bubbles.deleteBubbleContainer(result.id).then((result2) => {
                logger.log("debug", "MAIN - testcreateBubbleContainer - deleteBubbleContainer, result2 : ", result2);
            });
        });
    }

    async function testaddBubblesAndRemoveToContainersById() {
        rainbowSDK.bubbles.getAllBubblesContainers("containers1").then(async function (result: any) {
            logger.log("debug", "MAIN - testaddBubblesAndRemoveToContainersById - getAllBubblesContainers, result : ", result);
            let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble = bubbles.find(element => element.name==="bubble2")
            let bubblesToMove = [];
            bubblesToMove.push(bubble.id);
            rainbowSDK.bubbles.addBubblesToContainerById(result[0].id, bubblesToMove).then(async function (result2) {
                logger.log("debug", "MAIN - testaddBubblesAndRemoveToContainersById - addBubblesToContainerById, result2 : ", result2);
                rainbowSDK.bubbles.removeBubblesFromContainer(result[0].id, bubblesToMove).then(async function (result3) {
                    logger.log("debug", "MAIN - testaddBubblesAndRemoveToContainersById - removeBubblesFromContainer, result3 : ", result3);
                });
            });
        });
    }

    //endregion BUBBLES CONTAINERS

    //region CallLog

    function testDeleteOneCallLog() {
        let mycalllog = mycalllogs ? mycalllogs.callLogs[0]:{};
        let utc = new Date().toJSON().replace(/-/g, "_");
        rainbowSDK.calllog.deleteOneCallLog(mycalllog.id);
    }

    function testDeleteAllCallLogs() {
        let mycalllog = mycalllogs ? mycalllogs.callLogs[0]:{};
        let utc = new Date().toJSON().replace(/-/g, "_");
        rainbowSDK.calllog.deleteAllCallLogs();
    }

    async function testDeleteCallLogsForContact() {
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let jid = contact.jid_im;
            rainbowSDK.calllog.deleteCallLogsForContact(jid);
    }

    function testmarkCallLogAsRead() {
        let mycalllog = {"id": null}; //mycalllogs ? mycalllogs.callLogs[0] : {};
        let utc = new Date().toJSON().replace(/-/g, "_");
        if (mycalllogs) {
            mycalllogs.simplifiedCallLogs.forEach((simpleCallL) => {
                logger.log("debug", "MAIN - testmarkCallLogAsRead simpleCallL : ", simpleCallL); //logger.colors.green(JSON.stringify(result)));
                if (!simpleCallL.read) {
                    mycalllog = simpleCallL; // Keep a ref to the last call Logged which is not read
                }
            });
            if (mycalllog.id) {
                logger.log("debug", "MAIN - testmarkCallLogAsRead simpleCallL not read is : ", mycalllog); //logger.colors.green(JSON.stringify(result)));
                rainbowSDK.calllog.markCallLogAsRead(mycalllog.id);
            }
        } else {
            logger.log("debug", "MAIN - testmarkCallLogAsRead mycalllogs is not defined : ", mycalllogs); //logger.colors.green(JSON.stringify(result)));
        }
    }

    function testmarkAllCallsLogsAsRead() {
        logger.log("debug", "MAIN - testmarkAllCallsLogsAsRead."); //logger.colors.green(JSON.stringify(result)));
        rainbowSDK.calllog.markAllCallsLogsAsRead();
    }

    //endregion CallLog

    //region Telephony
    
    function testmakeCallByPhoneNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            rainbowSDK.telephony.makeCallByPhoneNumber("23050", undefined).then((data1) => {
                //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] after makecall : ", data1);
                Utils.setTimeoutPromised(1000).then(() => {
                    rainbowSDK.telephony.getCalls().forEach((data2) => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] after makecall getCalls : ", data2);
                    });
                });
            }).catch((error) => {
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] error ", error);
            });
            setTimeout(() => {
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] Release all calls, calls size : ", Object.keys(calls).length);
                // Release all calls
                calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                    //await rainbowSDK.telephony.releaseCall(c);
                    Utils.setTimeoutPromised(10000).then(() => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                        rainbowSDK.telephony.getCalls().forEach((data3) => {
                            logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] after releaseCall getCalls : ", data3);
                        });
                    });
                }));
            }, 15000);
            // */
        });
    }

    function testmakeCallByPhoneNumberAndHoldCallRetrieveCall() {
        return __awaiter(this, void 0, void 0, function* () {
            rainbowSDK.telephony.makeCallByPhoneNumber("23050", undefined).then((data1) => {
                //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after makecall : ", data1, " PLEASE ANSWER CALL ON PHONE.");

                Utils.setTimeoutPromised(1000).then(() => {
                    rainbowSDK.telephony.getCalls().forEach((data2) => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after makecall getCalls : ", data2);
                    });
                });
            }).catch((error) => {
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] error ", error);
            });
            setTimeout(() => {
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] holdCall all calls, calls size : ", Object.keys(calls).length);
                // Release all calls
                calls.forEach(async (c) => {
                    await rainbowSDK.telephony.holdCall(c);
                    Utils.setTimeoutPromised(6000).then(async () => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                        rainbowSDK.telephony.getCalls().forEach((data3) => {
                            logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after holdCall getCalls : ", data3);
                        });

                        await rainbowSDK.telephony.retrieveCall(c);
                    });
                });
            }, 15000);
            // */
        });
    }

    function testmakeCallByPhoneNumberProd() {
        return __awaiter(this, void 0, void 0, function* () {
            rainbowSDK.telephony.makeCallByPhoneNumber("00622413746", "My_correlatorData").then((data1) => {
                //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] after makecall : ", data1);
                Utils.setTimeoutPromised(1000).then(() => {
                    rainbowSDK.telephony.getCalls().forEach((data2) => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] after makecall getCalls : ", data2);
                    });
                });
            }).catch((error) => {
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] error ", error);
            });
            setInterval(() => {
                logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] Release all calls, calls size : ", Object.keys(calls).length);
                // Release all calls
                calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                    //await rainbowSDK.telephony.releaseCall(c);
                    Utils.setTimeoutPromised(10000).then(() => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                        rainbowSDK.telephony.getCalls().forEach((data3) => {
                            logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] after releaseCall getCalls : ", data3);
                        });
                    });
                }));
            }, 10000);
            // */
        });
    }

    //endregion Telephony

    //region Public URL of Bubble

    async function testgetAllPublicUrlOfBubbles() {
        let result = await rainbowSDK.bubbles.getAllPublicUrlOfBubbles().catch((err) => {
            logger.log("debug", "MAIN - (testgetAllPublicUrlOfBubbles) error while creating guest user :  ", err);
        });
        logger.log("debug", "MAIN - [testgetAllPublicUrlOfBubbles] All PublicUrl Of Bubbles : ", result);
    }

    async function testgetAllPublicUrlOfBubblesOfAUser() {
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
        let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
        let result = await rainbowSDK.bubbles.getAllPublicUrlOfBubblesOfAUser(contact).catch((err) => {
            logger.log("debug", "MAIN - (testgetAllPublicUrlOfBubblesOfAUser) error while creating guest user :  ", err);
        });
        logger.log("debug", "MAIN - [testgetAllPublicUrlOfBubblesOfAUser] All PublicUrl Of Bubbles : ", result);
    }

    async function testgetAllPublicUrlOfABubble() {
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
        let myBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
        if (myBubbles.length > 0) {
            logger.log("debug", "MAIN - testgetAllPublicUrlOfABubble - myBubbles : ", myBubbles, " nb owned bulles : ", myBubbles ? myBubbles.length:0);
            for (let bubble of myBubbles) {
                let result = await rainbowSDK.bubbles.getAllPublicUrlOfABubble(bubble).catch((err) => {
                    logger.log("debug", "MAIN - (testgetAllPublicUrlOfABubble) error while creating guest user :  ", err);
                });
                logger.log("debug", "MAIN - [testgetAllPublicUrlOfABubble] The PublicUrl ", result, " Of a Bubble : ", bubble);
            }
        }
    }

    async function testgetAllPublicUrlOfABubbleOfAUser() {
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
        //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
        let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
        let myBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
        if (myBubbles.length > 0) {
            logger.log("debug", "MAIN - testgetAllPublicUrlOfABubbleOfAUser - myBubbles : ", myBubbles, " nb owned bulles : ", myBubbles ? myBubbles.length:0);
            for (let bubble of myBubbles) {
                let result = await rainbowSDK.bubbles.getAllPublicUrlOfABubbleOfAUser(contact, bubble).catch((err) => {
                    logger.log("debug", "MAIN - (testgetAllPublicUrlOfABubbleOfAUser) error while creating guest user :  ", err);
                });
                logger.log("debug", "MAIN - [testgetAllPublicUrlOfABubbleOfAUser] The PublicUrl ", result, " Of a Bubble : ", bubble);
            }
        }
    }
    
    //endregion Public URL of Bubble

    //region Offers

    async function testretrieveAllOffersOfCompanyById() {
        let Offers = await rainbowSDK.admin.retrieveAllOffersOfCompanyById();
        logger.log("debug", "MAIN - testretrieveAllOffersOfCompanyById - Offers : ", Offers);
        for (let offer of Offers) {
            logger.log("debug", "MAIN - [testretrieveAllOffersOfCompanyById] offer : ", offer);
            if (offer.name==="Enterprise Demo") {
                logger.log("debug", "MAIN - [testretrieveAllOffersOfCompanyById] offer Enterprise Demo found : ", offer);
            }
        }
    }

    async function testsubscribeCompanyToDemoOffer() {

        let utc = new Date().toJSON().replace(/-/g, '_');
        let companyName = "MyVberderCompany_" + utc;
        let newCompany = await rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM);
        let subscribeResult: any = await rainbowSDK.admin.subscribeCompanyToDemoOffer(newCompany.id);
        logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - subscribeResult : ", subscribeResult);
        let email = "vincentTest01@vbe.test.openrainbow.com";
        let password = "Password_123";
        let firstname = "vincentTest01";
        let lastname = "berderTest01";
        logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - retrieveAllSubscriptionsOfCompanyById Result : ", await rainbowSDK.admin.retrieveAllSubscriptionsOfCompanyById(newCompany.id));

        let newUser = await rainbowSDK.admin.createUserInCompany(email, password, firstname, lastname, newCompany.id, "en-US", false /* admin or not */, ["user", "closed_channels_admin", "private_channels_admin", "public_channels_admin"]);
        logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - subscribeUserToSubscription Result : ", await rainbowSDK.admin.subscribeUserToSubscription(newUser.id, subscribeResult.id));
        logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - unSubscribeUserToSubscription Result : ", await rainbowSDK.admin.unSubscribeUserToSubscription(newUser.id, subscribeResult.id));
        logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - unSubscribeCompanyToDemoOffer Result : ", await rainbowSDK.admin.unSubscribeCompanyToDemoOffer(newCompany.id));
        let deletedUser = await rainbowSDK.admin.deleteUser(newUser.id);
        let deletedCompany = await rainbowSDK.admin.removeCompany({id: newCompany.id});

    }

    async function testgetAUserProfilesByUserId() {
        let Offers = await rainbowSDK.admin.getAUserProfilesByUserId(connectedUser.id);
        logger.log("debug", "MAIN - testgetAUserProfilesByUserId - profiles : ", Offers);
        let result = await rainbowSDK.admin.getAUserProfilesByUserEmail(connectedUser.loginEmail);
        logger.log("debug", "MAIN - testgetAUserProfilesByUserId by email - profiles : ", result);
    }

    async function testgetAUserProfilesFeaturesByUserId() {
        let Offers = await rainbowSDK.admin.getAUserProfilesFeaturesByUserId(connectedUser.id);
        logger.log("debug", "MAIN - testgetAUserProfilesFeaturesByUserId - profiles : ", Offers);
        let result = await rainbowSDK.admin.getAUserProfilesFeaturesByUserEmail(connectedUser.loginEmail);
        logger.log("debug", "MAIN - testgetAUserProfilesFeaturesByUserId by email - profiles : ", result);
    }

    //endregion Offers

    //region Connections

    function testReconnection() {
        let that = this;
        // let conversation = null;
        let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
        //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
        // Retrieve a contact by its id
        rainbowSDK.contacts.getContactById(contactIdToSearch)
                .then(function (contact) {
                    // Retrieve the associated conversation
                    return rainbowSDK.conversations.openConversationForContact(contact);
                }).then(function (conversation) {
            // Share the file
            setInterval(() => {
                rainbowSDK.im.sendMessageToConversation(conversation, "hello from node", "FR", null, "Le sujet de node").then((result) => {
                    logger.log("debug", "MAIN - testReconnection sendMessageToConversation - result : ", result);
                });
            }, 15000);
            /* that.rainbowSDK.fileStorage.getFilesSentInConversation(conversation).then((result) => {
            that.logger.log("debug", "MAIN - testHDS getFilesSentInConversation - result : ", result);
            }); // */
        });
    }

    async function testDeleteServerConversation() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            if (conversation && conversation.id) {
                let result = await rainbowSDK.conversations.deleteServerConversation(conversation.dbId);
                logger.log("debug", "MAIN - testDeleteServerConversation deleteServerConversation - result : ", result);
                logger.log("debug", "MAIN - testDeleteServerConversation deleteServerConversation - conversation : ", conversation);
            } else {
                logger.log("debug", "MAIN - testDeleteServerConversation conversation empty or no id defined - conversation : ", conversation);
            }
    }

    async function test_multireconnect() {
        for (let i = 0; i < 1000; i++) {
            /*
            rainbowSDK._core.rest.reconnect().then((result)=> {
                logger.log("debug", "MAIN - test_multireconnect - reconnect succeed : ", result, ", for i : ", i);
            }).catch((err)=> {
                logger.log("error", "MAIN - test_multireconnect - reconnect error : ", err, ", for i : ", i);
            });
            // */

            //await rainbowSDK._core.rest.reconnect();
            await rainbowSDK._core._eventEmitter.iee.emit("rainbow_xmppreconnected");
            logger.log("debug", "MAIN - test_multireconnect - reconnect sent ++ : ", i);
        }
    }

    async function testcheckPortalHealth() {

        rainbowSDK._core.rest.checkPortalHealth(0).then((result) => {
            logger.log("debug", "MAIN - testcheckPortalHealth - succeed : ", result);
        }).catch((err) => {
            logger.log("error", "MAIN - testcheckPortalHealth - error : ", err);
        });
        // */

        //await rainbowSDK._core.rest.reconnect();
        logger.log("debug", "MAIN - testcheckPortalHealth - ");
    }

    async function testgetConnectionStatus() {
        let connectionStatus: { restStatus: boolean, xmppStatus: boolean, s2sStatus: boolean, state: SDKSTATUSENUM, nbHttpAdded: number, httpQueueSize: number, nbRunningReq: number, maxSimultaneousRequests: number } = await rainbowSDK.getConnectionStatus();
        logger.log("debug", "MAIN - [testgetConnectionStatus    ] :: connectionStatus : ", connectionStatus);
        let state = SDKSTATUSENUM.CONNECTED;
        logger.log("debug", "MAIN - [testgetConnectionStatus    ] :: SDKSTATUSENUM.CONNECTED state : ", state);

    }

    //endregion Connections

    //region Alerts
    
    async function testcreateDevice() {

        let alertDevice: AlertDevice = new AlertDevice();
        alertDevice.name = "MyNodeDevice";
        alertDevice.jid_im = rainbowSDK._core._xmpp.fullJid;
        let result = await rainbowSDK.alerts.createDevice(alertDevice);
        logger.log("debug", "MAIN - testcreateDevice - result : ", result);
    }

    async function testdeleteDevice() {
        let result: AlertDevicesData = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, null, null, null);
        logger.log("debug", "MAIN - testdeleteDevice getDevices - result : ", result);
        let alertDevices = result.getAlertDevices().toArray();
        for (let i = 0; i < alertDevices.length; i++) {
            logger.log("debug", "MAIN - testdeleteDevice - alertDevices[" + i + "] : ", alertDevices[i].value);
            await rainbowSDK.alerts.deleteDevice(alertDevices[i].value);
        }
    }

    async function testgetDevicesList() {
        let result: AlertDevicesData = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, null, null, null);
        logger.log("debug", "MAIN - testgetDevicesList getDevices - result : ", result);
        let alertDevices = result.getAlertDevices().toArray();
        for (let i = 0; i < alertDevices.length; i++) {
            logger.log("debug", "MAIN - testgetDevicesList - alertDevices[" + i + "] : ", alertDevices[i].value);
        }
    }

    async function testcreateFilter() {

        let filter: AlertFilter = new AlertFilter();
        filter.name = "Filter1";
        filter.tags = new List<string>();
        filter.companyId = connectedUser.companyId;
        let result = await rainbowSDK.alerts.createFilter(filter);
        logger.log("debug", "MAIN - testcreateFilter - result : ", result);

        /*    {
                "executing": "api:_core._alerts.createFilter",
                "injecting":["obj:{ \"Name\" : \"Filter1\", \"Tags\" : null, \"CompanyId\" : @glo:maeveContact.companyId@ }"],
                "resulting": "filterCreated",
                "expecting": [{ "var:filterCreated": "$defined" } ],
                "using": [
                "robert"
            ]
            // */
    }

    async function testcreateTemplate() {

        let template: AlertTemplate = new AlertTemplate();
        template.name = "Template01";
        template.companyId = connectedUser.companyId;
        template.event = "Fire in building";
        template.senderName = "sender name";
        template.headline = "headline - headline";
        template.instruction = "instruction - instruction";
        template.contact = "contact - contact";
        template.mimeType = "text/html";
        template.description = "Fire in the building";
        let result = await rainbowSDK.alerts.createTemplate(template);
        logger.log("debug", "MAIN - testcreateTemplate - result : ", result);

        /*
    {
        "executing": "api:_core._alerts.createTemplate",
        "injecting": [ "obj:{ \"name\" : \"Template01\", \"companyId\"  : @glo:maeveContact.companyId@, \"event\" : \"Fire in building\", \"senderName\" : \"sender name\", \"headline\" : \"headline - headline\", \"instruction\" : \"instruction - instruction\", \"contact\" : \"contact - contact\", \"mimeType\" : \"text/html\", \"description\" : \"Fire in the building\" }"],
        "resulting": "glo:templateCreated",
        "expecting": [
        {
            "glo:templateCreated": "$defined"
        }
    ],
        "using": [
        "robert"
    ]
    },
    // */
    }

    async function testdeleteDevice_createDevice() {
        // Use alertDemoWestworld@vbe.test.openrainbow.net
        let result: any = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, null, null, null);
        logger.log("debug", "MAIN - testdeleteDevice_createDevice - result : ", result);
        let alertDevices = result.getAlertDevices().toArray();
        for (let i = 0; i < alertDevices.length; i++) {
            logger.log("debug", "MAIN - testdeleteDevice_createDevice - alertDevices[" + i + "] : ", alertDevices[i].value);
            await rainbowSDK.alerts.deleteDevice(alertDevices[i].value);
        }
        let alertDevice: AlertDevice = new AlertDevice();
        alertDevice.name = "MyNodeDevice";
        alertDevice.jid_im = rainbowSDK._core._xmpp.fullJid;
        alertDevice.tags = new List();
        alertDevice.tags.add("tag1");
        alertDevice.tags.add("tag2");
        alertDevice.tags.add("tag3");
        alertDevice.tags.add("tag4");
        result = await rainbowSDK.alerts.createDevice(alertDevice);
        logger.log("debug", "MAIN - testdeleteDevice_createDevice - result : ", result);

    }

    async function testcreateAlert() {

        // Use vincent01@vbe.test.openrainbow.net

        let alert: Alert = new Alert();
        alert.companyId = connectedUser.companyId;
        let resultTemplates: any = await rainbowSDK.alerts.getTemplates(connectedUser.companyId, 0, 100);
        logger.log("debug", "MAIN - testcreateAlert - resultTemplates : ", resultTemplates, " nb templates : ", resultTemplates.alertTemplates ? resultTemplates.alertTemplates.length:0);
        if (resultTemplates.alertTemplates.length > 0) {
            let template = resultTemplates.alertTemplates.elementAt(0).value;
            alert.templateId = template.id;
            let result = await rainbowSDK.alerts.createAlert(alert);
            logger.log("debug", "MAIN - testcreateAlert - result : ", result);
        }
        /*

{
        "executing": "api:_core._alerts.createAlert",
            "injecting": [ "obj:{ \"companyId\"  : @glo:maeveContact.companyId@, \"templateId\" : @glo:templateCreated.id@ }"],
            "resulting": "glo:alertCreated",
            "expecting": [
            {
                "glo:alertCreated": "$defined"
            }
        ],
            "using": [
            "robert"
        ]
    }, // */
    }

    async function testgetDevices() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result: AlertDevicesData = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, "", "", "", 0, 100);
        logger.log("debug", "MAIN - testgetDevices - result : ", result, " nb devices : ", result ? result.total:0);
        if (result.total > 0) {
            logger.log("debug", "MAIN - testgetDevices - devices : ", result);
            logger.log("debug", "MAIN - testgetDevices - first device : ", await result.first());
        }
        //});
    }

    async function testgetDevice() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, "", "", "", 0, 100);
        logger.log("debug", "MAIN - testgetDevice - result : ", result, " nb devices : ", result ? result.total:0);
        if (result.total > 0) {
            logger.log("debug", "MAIN - testgetDevice - devices : ", result);
            let result2 = await rainbowSDK.alerts.getDevice((await result.first()).id);
            logger.log("debug", "MAIN - testgetDevice - AlertDevice : ", result2);
        }
        //});
    }

    async function testgetDevicesTags() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testgetDevicesTags. ");
        let result = await rainbowSDK.alerts.getDevicesTags(connectedUser.companyId);
        logger.log("debug", "MAIN - testgetDevicesTags - result : ", result);
        //});
    }

    async function testrenameDevicesTags() {
        let newTagName: string;
        let tag: string;
        let companyId: string = connectedUser.companyId;
        let tags = await rainbowSDK.alerts.getDevicesTags(connectedUser.companyId);
        tag = tags.tags[0]
        newTagName = "tag1_" + new Date().getTime();
        let result = await rainbowSDK.alerts.renameDevicesTags(newTagName, tag, companyId);
        logger.log("debug", "MAIN - testrenameDevicesTags - result : ", result);
        //});
    }

    async function testdeleteDevicesTags() {
        let tag: string;
        let companyId: string = connectedUser.companyId;
        let tags = await rainbowSDK.alerts.getDevicesTags(connectedUser.companyId);
        tag = tags.tags[(tags.tags.length - 1)];
        let result = await rainbowSDK.alerts.deleteDevicesTags(tag, companyId);
        logger.log("debug", "MAIN - testdeleteDevicesTags - result : ", result);
        //});
    }

    async function testgetstatsTags() {
        let companyId: string = connectedUser.companyId;
        let result = await rainbowSDK.alerts.getstatsTags(companyId);
        logger.log("debug", "MAIN - testgetstatsTags - result : ", result);
        //});
    }

    async function testgetTemplates() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result: any = await rainbowSDK.alerts.getTemplates(connectedUser.companyId, 0, 100);
        logger.log("debug", "MAIN - testgetTemplates - result : ", result, " nb templates : ", result ? result.length:0);
        if (result.length > 0) {
            logger.log("debug", "MAIN - testgetTemplates - filters : ", result);
        }
        //});
    }

    async function testgetFilters() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result: any = await rainbowSDK.alerts.getFilters(0, 100);
        logger.log("debug", "MAIN - testgetFilters - result : ", result, " nb filters : ", result ? result.length:0);
        if (result.length > 0) {
            logger.log("debug", "MAIN - testgetFilters - filters : ", result);
        }
        //});
    }

    async function testgetAlerts() {
        // To use with vincent01 on .NET
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        let result: any = await rainbowSDK.alerts.getAlerts();
        logger.log("debug", "MAIN - testgetAlerts - result : ", result, " nb alerts : ", result ? result.length:0);
        if (result.length > 0) {
            logger.log("debug", "MAIN - testgetAlerts - alerts : ", result);
        }
        //});
    }

//endregion Alerts

//region Calendar

    async function testgetCalendarState() {
        // To use with vincent.berder on Official
        let result = await rainbowSDK.presence.getCalendarState();
        logger.log("debug", "MAIN - testgetCalendarState - result : ", result);
    }

    async function testgetCalendarStates() {
        // To use with vincent.berder on Official
        let contacts = rainbowSDK.contacts.getAll();
        logger.log("debug", "MAIN - testgetCalendarStates - contacts : ", contacts);
        let contactsIdentifier = contacts.map(elt => elt.loginEmail);
        //let contactsIdentifier = contacts.map(elt => elt.id ) ;
        logger.log("debug", "MAIN - testgetCalendarStates - contactsIdentifier : ", contactsIdentifier);
        /*let usersIds = [];
        usersIds.push(contactsIdentifier[0]);
        usersIds.push(contactsIdentifier[1]);
        usersIds.push(contactsIdentifier[2]); 
        let result = await rainbowSDK.presence.getCalendarStates(usersIds);
        // */
        let result = await rainbowSDK.presence.getCalendarStates(contactsIdentifier);
        logger.log("debug", "MAIN - testgetCalendarStates - result : ", result);
    }

    async function testgetCalendarAutomaticReplyStatus() {
        // To use with vincent.berder on Official
        let result = await rainbowSDK.presence.getCalendarAutomaticReplyStatus();
        logger.log("debug", "MAIN - testgetCalendarAutomaticReplyStatus - result : ", result);

        let contacts = rainbowSDK.contacts.getAll();
        logger.log("debug", "MAIN - testgetCalendarAutomaticReplyStatus - contacts : ", contacts);

        let result2 = await rainbowSDK.presence.getCalendarAutomaticReplyStatus(contacts[0].id);
        logger.log("debug", "MAIN - testgetCalendarAutomaticReplyStatus - contact : ", contacts[0], ", result2 : ", result2);
    }

    async function testenableDisableCalendar() {
        // To use with vincent.berder on Official
        let result = await rainbowSDK.presence.disableCalendar();
        logger.log("debug", "MAIN - testenableDisableCalendar - result : ", result);

        let result2 = await rainbowSDK.presence.enableCalendar();
        logger.log("debug", "MAIN - testenableDisableCalendar - result2 : ", result2);
    }

    //endregion    

    //region Rainbow Voice
    
    async function testgetCloudPbxById() {
        // To use with 
        let systemId = "5cf7dd229fb99523e4de0ea9";
        let result = await rainbowSDK.admin.getCloudPbxById(systemId);
        logger.log("debug", "MAIN - testgetCloudPbxById - result : ", result);
    }

    async function testgetCloudPbxs() {
        // To use with 
        let result = await rainbowSDK.admin.getCloudPbxs(100, 0, "companyId", 1, connectedUser.companyId, null);
        logger.log("debug", "MAIN - testgetCloudPbxs - result : ", result);
    }

    //endregion

    //region Company

    async function testgetAllCompanies() {
        // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
        logger.log("debug", "MAIN - testretrieveRainbowUserList. ");
        let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
        logger.log("debug", "MAIN - testretrieveRainbowUserList - allCompanies : ", allCompanies.length);
        /*let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
                logger.log("debug", "MAIN - testretrieveRainbowUserList vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
        logger.log("debug", "MAIN - testretrieveRainbowUserList - companyId : ", companyId);

        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
        logger.log("debug", "MAIN - testretrieveRainbowUserList - result : ", result);
        // */

    }

    async function testgetAllCompaniesWithFilters() {
        // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
        logger.log("debug", "MAIN - testgetAllCompaniesWithFilters. ");
        let format  : string = "small";
        let sortField : string = "name" ; 
        let bpId : string = undefined ;
        let catalogId : string = undefined ;
        let offerId : string = undefined ; 
        let offerCanBeSold : boolean = undefined ; 
        let externalReference : string = undefined; 
        let externalReference2 : string = undefined;
        let salesforceAccountId : string = undefined; 
        let selectedAppCustomisationTemplate : string = undefined
        let selectedThemeObj: boolean = undefined;
        let offerGroupName : string = undefined;
        let limit : number = 100;
        let offset : number = 0;
        let sortOrder : number = 1;
        let name : string = "westworld";
        let status : string = undefined;
        let visibility : string = undefined;
        let organisationId : string = undefined
        let isBP : boolean = undefined;
        let hasBP : boolean = undefined;
        let bpType : string = undefined;
        
        let allCompanies: any = await rainbowSDK.admin.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType);
        logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - allCompanies : ", allCompanies.length);
        
        /*let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
                logger.log("debug", "MAIN - testretrieveRainbowUserList vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
        logger.log("debug", "MAIN - testretrieveRainbowUserList - companyId : ", companyId);

        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
        logger.log("debug", "MAIN - testretrieveRainbowUserList - result : ", result);
        // */

    }

    async function testgetCompanyById() {
        let myCompanyId = connectedUser.companyId;
        let companyInfo = await rainbowSDK.admin.getCompanyById(myCompanyId)

        logger.log("debug", "MAIN - testgetCompanyById - companyInfo : ", companyInfo);
    }
    
    //endregion Company

    //region Custom Templates
    
    async function testapplyCustomisationTemplates() {
        let myCompanyId = connectedUser.companyId;
        let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
        let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        
        //let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", myCompanyId, contact.id);
        //let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", contact.companyId, undefined);
        let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", myCompanyId, undefined);
        // let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", undefined, contact.id);
        logger.log("debug", "MAIN - testapplyCustomisationTemplates - result : ", result);
    }
    
    async function testcreateCustomisationTemplate () {
//      let visibleBy: [],
        let instantMessagesCustomisation  = 'enabled';
        let useGifCustomisation = 'enabled';
        let fileSharingCustomisation = 'enabled';
        let fileStorageCustomisation = 'enabled';
        let phoneMeetingCustomisation = 'enabled';
        let useDialOutCustomisation = 'enabled';
        let useChannelCustomisation = 'enabled';
        let useRoomCustomisation = 'enabled';
        let useWebRTCAudioCustomisation = 'enabled';
        let useWebRTCVideoCustomisation = 'enabled';
        let recordingConversationCustomisation = 'enabled';
        let overridePresenceCustomisation = 'enabled';
        let userProfileCustomisation = 'enabled';
        let userTitleNameCustomisation = 'enabled';
        let changeTelephonyCustomisation = 'enabled';
        let changeSettingsCustomisation = 'enabled';
        let fileCopyCustomisation = 'enabled';
        let fileTransferCustomisation = 'enabled';
        let forbidFileOwnerChangeCustomisation = 'enabled';
        let useScreenSharingCustomisation = 'enabled';
        let readReceiptsCustomisation = 'enabled';
        let useSpeakingTimeStatistics = 'enabled';

        let myCompanyId = connectedUser.companyId;

        let name = 'MyTemplateVBE2';

        let result : any= await rainbowSDK.admin.createCustomisationTemplate(name , myCompanyId , undefined , instantMessagesCustomisation , useGifCustomisation ,
                fileSharingCustomisation , fileStorageCustomisation , phoneMeetingCustomisation , useDialOutCustomisation , useChannelCustomisation , useRoomCustomisation ,
                useScreenSharingCustomisation , useWebRTCAudioCustomisation , useWebRTCVideoCustomisation , recordingConversationCustomisation , overridePresenceCustomisation ,
                userProfileCustomisation , userTitleNameCustomisation , changeTelephonyCustomisation , changeSettingsCustomisation , fileCopyCustomisation ,
                fileTransferCustomisation , forbidFileOwnerChangeCustomisation , readReceiptsCustomisation , useSpeakingTimeStatistics );
        logger.log("debug", "MAIN - testcreateCustomisationTemplate - result : ", result);        
    }

    async function testdeleteCustomisationTemplate() {
        await testgetCompanyById();
        let myCompanyId = connectedUser.companyId;
        let result : any= await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
        logger.log("debug", "MAIN - testdeleteCustomisationTemplate - getAllAvailableCustomisationTemplates result : ", result);

        for (const template of result.data) {
            logger.log("debug", "MAIN - testdeleteCustomisationTemplate - template : ", template);
            let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
            logger.log("debug", "MAIN - testdeleteCustomisationTemplate - getRequestedCustomisationTemplate templateInfo : ", templateInfo);
            if (template.name == "MyTemplateVBE2") {
                let result2 : any= await rainbowSDK.admin.deleteCustomisationTemplate(template.id);
                logger.log("debug", "MAIN - testdeleteCustomisationTemplate - delete result2 : ", result2);
            }
        }
    }

    async function testgetAllAvailableCustomisationTemplates() {
        await testgetCompanyById();
        let myCompanyId = connectedUser.companyId;
        let result : any= await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
        logger.log("debug", "MAIN - testgetAllAvailableCustomisationTemplates - result : ", result);

        for (const template of result.data) {
            logger.log("debug", "MAIN - testgetAllAvailableCustomisationTemplates - template : ", template);
            let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
            logger.log("debug", "MAIN - testgetAllAvailableCustomisationTemplates - templateInfo : ", templateInfo);
        }
    }

    async function testgetRequestedCustomisationTemplate() {
        await testgetCompanyById();
        let myCompanyId = connectedUser.companyId;
        let result : any= await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
        logger.log("debug", "MAIN - testgetRequestedCustomisationTemplate - result : ", result);

        for (const template of result.data) {
            if (template.name == "MyTemplateVBE2") {
                logger.log("debug", "MAIN - testgetRequestedCustomisationTemplate - template : ", template);
                let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
                logger.log("debug", "MAIN - testgetRequestedCustomisationTemplate - templateInfo : ", templateInfo);
            }
        }
    }

    async function testupdateCustomisationTemplate() {
        await testgetCompanyById();
        let myCompanyId = connectedUser.companyId;
        let result : any= await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
        logger.log("debug", "MAIN - testupdateCustomisationTemplate - getAllAvailableCustomisationTemplates result : ", result);

        for (const template of result.data) {
            logger.log("debug", "MAIN - testupdateCustomisationTemplate - template : ", template);
            //let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
            //logger.log("debug", "MAIN - testupdateCustomisationTemplate - getRequestedCustomisationTemplate templateInfo : ", templateInfo);
            if (template.name == "MyTemplateVBE2") {
                let instantMessagesCustomisation  = 'enabled';
                let useGifCustomisation = 'enabled';
                let fileSharingCustomisation = 'enabled';
                let fileStorageCustomisation = 'enabled';
                let phoneMeetingCustomisation = 'enabled';
                let useDialOutCustomisation = 'enabled';
                let useChannelCustomisation = 'enabled';
                let useRoomCustomisation = 'enabled';
                let useWebRTCAudioCustomisation = 'enabled';
                let useWebRTCVideoCustomisation = 'enabled';
                let recordingConversationCustomisation = 'enabled';
                let overridePresenceCustomisation = 'enabled';
                let userProfileCustomisation = 'enabled';
                let userTitleNameCustomisation = 'enabled';
                let changeTelephonyCustomisation = 'enabled';
                let changeSettingsCustomisation = 'enabled';
                let fileCopyCustomisation = 'enabled';
                let fileTransferCustomisation = 'enabled';
                let forbidFileOwnerChangeCustomisation = 'disabled';
                let useScreenSharingCustomisation = 'enabled';
                let readReceiptsCustomisation = 'enabled';
                let useSpeakingTimeStatistics = 'enabled';

                //let myCompanyId = connectedUser.companyId;

                let name = 'MyTemplateVBE2';

                let result2 : any= await rainbowSDK.admin.updateCustomisationTemplate(template.id, name , undefined , instantMessagesCustomisation , useGifCustomisation ,
                        fileSharingCustomisation , fileStorageCustomisation , phoneMeetingCustomisation , useDialOutCustomisation , useChannelCustomisation , useRoomCustomisation ,
                        useScreenSharingCustomisation , useWebRTCAudioCustomisation , useWebRTCVideoCustomisation , recordingConversationCustomisation , overridePresenceCustomisation ,
                        userProfileCustomisation , userTitleNameCustomisation , changeTelephonyCustomisation , changeSettingsCustomisation , fileCopyCustomisation ,
                        fileTransferCustomisation , forbidFileOwnerChangeCustomisation , readReceiptsCustomisation, useSpeakingTimeStatistics );
                logger.log("debug", "MAIN - testupdateCustomisationTemplate - updateCustomisationTemplate result2 : ", result2);        
            }
        }
    }

    //endregion Custom Templates
    
    //region Directory

    async function testcreateDirectoryEntry() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testcreateDirectoryEntry. ");
        let utc = new Date().toJSON().replace(/-/g, "_");
        let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

        logger.log("debug", "MAIN - testcreateDirectoryEntry. utcEmail : ", utcEmail);

        let companyId = connectedUser.companyId,
                firstName = "firstname_" + utc,
                lastName = "firstname_" + utc,
                companyName = connectedUser.companyName,
                department = "SBU",
                street = "1 rte Albert Schweitzer",
                city = "Illkirch",
                state = null,
                postalCode = "67115",
                country: "France",
                workPhoneNumbers = ["0011223344"],
                mobilePhoneNumbers = [],
                otherPhoneNumbers = [],
                jobTitle = "Validation Engineer",
                eMail = utcEmail + "_test@vbe.test.openrainbow.net",
                tags = [],
                custom1 = "",
                custom2 = "";
        let result = await rainbowSDK.admin.createDirectoryEntry(companyId, firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2);
        logger.log("debug", "MAIN - testcreateDirectoryEntry - result : ", result);

        // */
        //});
    }

    async function testexportDirectoryCsvFile() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testexportDirectoryCsvFile. ");
        let companyId = connectedUser.companyId;
        let result = await rainbowSDK.admin.exportDirectoryCsvFile(companyId, "c:\\temp\\");
        logger.log("debug", "MAIN - testexportDirectoryCsvFile - result : ", result);
    }

    async function testImportDirectoryCsvFile() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testImportDirectoryCsvFile. ");
        let companyId = connectedUser.companyId;
        let result = await rainbowSDK.admin.ImportDirectoryCsvFile(companyId, "c:\\temp\\dirToImport.csv", "label1");
        logger.log("debug", "MAIN - testImportDirectoryCsvFile - result : ", result);
    }

    function testgetCSVTemplate() {
        // to use with bp-admin@pqa.test.openrainbow.net user on NET platform.
        rainbowSDK.admin.getCSVTemplate("5f75a07c1db9464d67e3245e", "user", "test").then((res) => {
            if (res) {
                logger.log("debug", "MAIN - [testgetCSVTemplate    ] :: res : ", res);
            }
        }).catch((err) => {
            logger.log("error", "MAIN - [testgetCSVTemplate    ] :: error : ", err);
        });
    }
    
    function testgetListDirectoryEntriesData () {
        let emailToSearch = "Bouvet@vbe.test.openrainbow.net";
        let companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate,
                tags, format, limit, offset, sortField, sortOrder, view = undefined;

        search = "Bouvet";
        //search = emailToSearch;
        type = "user";
        //search = emailToSearch;

        rainbowSDK.admin.getListDirectoryEntriesData(companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view).then((res : any) => {
            if (res) {
                logger.log("debug", "MAIN - [testgetListDirectoryEntriesData    ] :: res : ", res);
                if (res.data) {
                    for (let i = 0; i < res.data.length; i++) {
                        logger.log("debug", "MAIN - [testgetListDirectoryEntriesData    ] :: res[", i, "] : ", res.data[i]);
                    }
                }
            }
        }).catch((err) => {
            logger.log("error", "MAIN - [testgetListDirectoryEntriesData    ] :: error : ", err);
        });
    }

    function testgetDirectoryEntryData () {
        let emailToSearch = "Bouvet@vbe.test.openrainbow.net";
        let companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate,
                tags, format, limit, offset, sortField, sortOrder, view = undefined;

        search = "Bouvet";
        //search = emailToSearch;
        type = "user";
        //search = emailToSearch;

        format= "full";
        
        rainbowSDK.admin.getListDirectoryEntriesData(companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view).then((res : any) => {
            if (res) {
                logger.log("debug", "MAIN - [testgetDirectoryEntryData    ] :: res : ", res);
                if (res.data) {
                    for (let i = 0; i < res.data.length; i++) {
                        logger.log("debug", "MAIN - [testgetDirectoryEntryData    ] :: res[", i, "] : ", res.data[i]);
                        if (res.data[i].companyName == "compa") {
                            rainbowSDK.admin.getDirectoryEntryData(res.data[i].id, "full").then((result) => {
                                logger.log("debug", "MAIN - [testgetDirectoryEntryData    ] :: res[", i, "] : ", res.data[i], ", result : ", result);
                            });
                        }
                    }
                }
            }
        }).catch((err) => {
            logger.log("error", "MAIN - [testgetListDirectoryEntriesData    ] :: error : ", err);
        });
    }

    //endregion Directory
    
    //region Personal Directory

    async function testcreatePersonalDirectoryEntry() {
        //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
        logger.log("debug", "MAIN - testcreatePersonalDirectoryEntry. ");
        let utc = new Date().toJSON().replace(/-/g, "_");
        let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

        logger.log("debug", "MAIN - testcreatePersonalDirectoryEntry. utcEmail : ", utcEmail);

        let companyId = connectedUser.companyId,
                firstName = "testPersonalDirectory_firstname_" + utc,
                lastName = "testPersonalDirectory_firstname_" + utc,
                companyName = connectedUser.companyName,
                department = "SBU",
                street = "1 rte Albert Schweitzer",
                city = "Illkirch",
                state = null,
                postalCode = "67115",
                country= "FRA",
                workPhoneNumbers = ["0011223344"],
                mobilePhoneNumbers = [],
                otherPhoneNumbers = [],
                jobTitle = "Validation Engineer",
                eMail = utcEmail + "_test@vbe.test.openrainbow.net",
                tags = [],
                custom1 = "",
                custom2 = "";
        let result = await rainbowSDK.contacts.createPersonalDirectoryEntry( firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2);
        logger.log("debug", "MAIN - testcreatePersonalDirectoryEntry - result : ", result);

        // */
        //});
    }

    async function testgetListPersonalDirectoryEntriesData() {
        let result = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
        logger.log("debug", "MAIN - getListPersonalDirectoryEntriesData - result : ", result);
    }
    
    async function testupdatePersonalDirectoryEntry() {
        let personalDirectoryList : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
        logger.log("debug", "MAIN - testupdatePersonalDirectoryEntry - personalDirectoryList : ", personalDirectoryList);
        if (personalDirectoryList &&personalDirectoryList.data && personalDirectoryList.total > 0) {
            let result = await rainbowSDK.contacts.updatePersonalDirectoryEntry(personalDirectoryList.data[0].id, personalDirectoryList.data[0].firstName + "_updated");
            logger.log("debug", "MAIN - testupdatePersonalDirectoryEntry - updatePersonalDirectoryEntry result : ", result);
            let personalDirectoryListUpdated : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
            logger.log("debug", "MAIN - testupdatePersonalDirectoryEntry - personalDirectoryListUpdated : ", personalDirectoryListUpdated);
        }
    }

    async function testdeletePersonalDirectoryEntry() {
        logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry. ");
        let utc = new Date().toJSON().replace(/-/g, "_");
        let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

        logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry. utcEmail : ", utcEmail);

        let companyId = connectedUser.companyId,
                firstName = "testPersonalDirectory_firstname_" + utc,
                lastName = "testPersonalDirectory_firstname_" + utc,
                companyName = connectedUser.companyName,
                department = "SBU",
                street = "1 rte Albert Schweitzer",
                city = "Illkirch",
                state = null,
                postalCode = "67115",
                country = "FRA",
                workPhoneNumbers = ["0011223344"],
                mobilePhoneNumbers = [],
                otherPhoneNumbers = [],
                jobTitle = "Validation Engineer",
                eMail = utcEmail + "_test@vbe.test.openrainbow.net",
                tags = [],
                custom1 = "",
                custom2 = "";
        let result = await rainbowSDK.contacts.createPersonalDirectoryEntry( firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2);
        logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - createPersonalDirectoryEntry result : ", result);

        let personalDirectoryList : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
        logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryList : ", personalDirectoryList);
        if (personalDirectoryList &&personalDirectoryList.data && personalDirectoryList.data.total > 0) {
            let result = await rainbowSDK.contacts.deletePersonalDirectoryEntry(personalDirectoryList.data[0].id);
            logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - deletePersonalDirectoryEntry result : ", result);
            let personalDirectoryListUpdated : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
            logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryListUpdated : ", personalDirectoryListUpdated);
        }
    }
    
    //endregion Personal Directory

    //region ldap

    async function testsynchronizeUsersAndDeviceswithCSV() {
        // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
        logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV. ");
        let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
        logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV - allCompanies : ", allCompanies);
        let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
                logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
        logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV - companyId : ", companyId);
        fs.readFile('c:\\temp\\file.csv', 'utf8', async (err: any, data: any) => {
            if (err) {
                logger.log("error", "MAIN - testsynchronizeUsersAndDeviceswithCSV syncCSV readFile error: ", err);
                return;
            }
            let result = await rainbowSDK.admin.synchronizeUsersAndDeviceswithCSV(data, companyId, "test synchronise", true, false);
            logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV - result : ", result);
        });
    }

    async function testretrieveRainbowUserList() {
        // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
        logger.log("debug", "MAIN - testretrieveRainbowUserList. ");
        let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
        logger.log("debug", "MAIN - testretrieveRainbowUserList - allCompanies : ", allCompanies);
        let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
                logger.log("debug", "MAIN - testretrieveRainbowUserList vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
        logger.log("debug", "MAIN - testretrieveRainbowUserList - companyId : ", companyId);

        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
        logger.log("debug", "MAIN - testretrieveRainbowUserList - result : ", result);

    }

    //endregion ldap

    //region Conference V2

    async function testConferenceV2() {
        logger.log("debug", "MAIN - (testConferenceV2). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
            if (contact) {
                logger.log("debug", "MAIN - (testConferenceV2) :: getContactByLoginEmail contact : ", contact);
                rainbowSDK.bubbles.createBubble("testConferenceV2" + utc, "testConferenceV2" + utc, true).then((bubble: any) => {
                    logger.log("debug", "MAIN - (testConferenceV2) :: createBubble request ok, bubble : ", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {

                        rainbowSDK.bubbles.startConferenceOrWebinarInARoom(bubble.id).then(async (confStarted) => {
                            logger.log("debug", "MAIN - (testConferenceV2) :: startConferenceOrWebinarInARoom request ok, confStarted : ", confStarted);

                            await setTimeoutPromised(3000)
                            rainbowSDK.bubbles.stopConferenceOrWebinar(bubble.id).then(async (confStarted) => {
                                logger.log("debug", "MAIN - (testConferenceV2) :: stopConferenceOrWebinar request ok, confStarted : ", confStarted);

                                rainbowSDK.bubbles.closeAndDeleteBubble(bubble).then((confStopped) => {
                                    logger.log("debug", "MAIN - (testConferenceV2) :: closeAndDeleteBubble request ok, confStopped : ", confStopped);
                                });
                            });

                        });
                    });
                });
            }
        });
    }

    
    async function teststopConferenceV2() {
        let bubbleId = "6213b94219fa5d0143a71e3c";
        
        rainbowSDK.bubbles.stopConferenceOrWebinar(bubbleId).then(async (confStarted) => {
            logger.log("debug", "MAIN - (teststopConferenceV2) :: stopConferenceOrWebinar request ok, confStarted : ", confStarted);
        }).catch (err => {
            logger.log("error", "MAIN - (teststopConferenceV2) :: stopConferenceOrWebinar request not ok, err : ", err);
        });
    }
    
    async function tesaskConferenceSnapshot() {
        let confId = "60d5a4ee0eeee002d144e9bf";
        
        rainbowSDK.bubbles.askConferenceSnapshot(confId).then(async (confStarted) => {
            logger.log("debug", "MAIN - (tesaskConferenceSnapshot) :: askConferenceSnapshot request ok, confStarted : ", confStarted);
        }).catch (err => {
            logger.log("error", "MAIN - (tesaskConferenceSnapshot) :: askConferenceSnapshot request not ok, err : ", err);
        });
    }
    
    //endregion Conference V2

    //region Webinar

    async function testgetWebinarsData() {
        logger.log("debug", "MAIN - (testgetWebinarsData). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
            logger.log("debug", "MAIN - [testgetWebinarsData    ] :: getWebinarsData result : ", result);
        });
    }

    async function testcreateWebinar() {
        logger.log("debug", "MAIN - (testcreateWebinar). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        let nameWebinar = "nameWebinar_" + utc;
        let subjectWebinar = "subjectWebinar_" + utc;
        rainbowSDK.webinars.createWebinar(nameWebinar, subjectWebinar, null, null, null, null, null, null, null, null, null, null, null, null).then(async (result: any) => {
            logger.log("debug", "MAIN - (testcreateWebinar) :: create Webinar result : ", result);
            rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
                logger.log("debug", "MAIN - (testcreateWebinar) :: getWebinarsData result : ", result);
            });
        });
    }

    async function testupdateWebinar() {
        logger.log("debug", "MAIN - (testupdateWebinar). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.webinars.getWebinarsData("participant").then(async (webinarsResult: any) => {
            logger.log("debug", "MAIN - (testupdateWebinar) :: getWebinarsData result : ", webinarsResult);
            let webinar = webinarsResult.data[0];
            rainbowSDK.webinars.updateWebinar(webinar.id, "updatedNameWebinar", webinar.subject, webinar.waitingRoomStartDate, webinar.webinarStartDate, webinar.webinarEndDate, webinar.reminderDates, webinar.timeZone, webinar.register, webinar.approvalRegistrationMethod, webinar.passwordNeeded, webinar.lockRegistration, webinar.waitingRoomMultimediaURL, webinar.stageBackground, webinar.chatOption).then(async (result: any) => {
                logger.log("debug", "MAIN - (testupdateWebinar) :: updateWebinar result : ", result);
            }).catch(err => {
                logger.log("debug", "MAIN - (testupdateWebinar) :: error during upodate : ", err);
            });
        });
    }

    async function testcreateAndDeleteWebinar() {
        logger.log("debug", "MAIN - (testcreateAndDeleteWebinar). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        let nameWebinar = "nameWebinar_" + utc;
        let subjectWebinar = "subjectWebinar_" + utc;
        rainbowSDK.webinars.createWebinar(nameWebinar, subjectWebinar, null, null, null, null, null, null, null, null, null, null, null, null).then(async (createresult: any) => {
            logger.log("debug", "MAIN - [testcreateAndDeleteWebinar    ] :: create Webinar result : ", createresult);
            await rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
                logger.log("debug", "MAIN - [testcreateAndDeleteWebinar    ] :: getWebinarsData result : ", result);
            });

            await rainbowSDK.webinars.deleteWebinar(createresult.id).then(async (deleteresult: any) => {
                logger.log("debug", "MAIN - [testcreateAndDeleteWebinar    ] :: delete Webinar result : ", deleteresult);

            });
        });
    }

    async function testDeleteAllWebinar() {
        logger.log("debug", "MAIN - (testDeleteAllWebinar). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
            logger.log("debug", "MAIN - [testDeleteAllWebinar    ] :: getWebinarsData result : ", result);
            for (let resultKey in result.data) {
                rainbowSDK.webinars.deleteWebinar(result.data[resultKey].id).then(async (deleteresult: any) => {
                    logger.log("debug", "MAIN - [testDeleteAllWebinar    ] :: delete Webinar result : ", deleteresult);

                });
            }
        });
    }

    //endregion Webinar

    //region Clients Versions

    async function testgetAllClientsVersions() {
        let that = this;
        let res = await rainbowSDK.admin.getAllClientsVersions(null, null);
        logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);
    }

    async function testgetAllClientsVersionsBot() {
        let that = this;
        let res = await rainbowSDK.admin.getAllClientsVersions(null, "bot");
        logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);
    }

    async function testcreateAClientVersion() {
        let that = this;
        //let res = await rainbowSDK.admin.createAClientVersion(options.application.appID, "2.4.0");
        let res = await rainbowSDK.admin.createAClientVersion(undefined, "2.5.0");
        logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);
    }

    async function testdeleteAClientVersion() {
        let that = this;
        //let res = await rainbowSDK.admin.createAClientVersion(options.application.appID, "2.4.0");
        let res = await rainbowSDK.admin.deleteAClientVersion(options.application.appID);
        logger.log("debug", "MAIN - testdeleteAClientVersion, res : ", res);
    }

    //endregion Clients Versions

    //region bubbles polls

    async function testcreateBubblePollAndDelete() {
        let that = this;

        //let res = await rainbowSDK.bubbles.createBubblePoll();
        //logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);

        logger.log("debug", "MAIN - (testcreateBubblePollAndDelete). ");
        let utc = new Date().toJSON().replace(/-/g, "/");
        let loginEmail = "vincent02@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
            if (contact) {
                logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: getContactByLoginEmail contact : ", contact);
                rainbowSDK.bubbles.createBubble("testcreateBubblePollAndDelete" + utc, "testcreateBubblePollAndDelete" + utc, true).then((bubble: any) => {
                    logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: createBubble request ok, bubble : ", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {

                        let questions : Array <{ text: string, multipleChoice: boolean, answers: Array<{ text : string }> }> = [
                            {
                                text : "Question 1",
                                multipleChoice : true,
                                answers : [{text : "oui"} , {text : "non"}]
                            }
                        ];
                        rainbowSDK.bubbles.createBubblePoll(bubble.id, "My Poll", questions, false, 0).then(async (pollCreated: any) => {
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: createBubblePoll request ok, pollCreated : ", pollCreated);

                            await setTimeoutPromised(3000);

                            let polls = await rainbowSDK.bubbles.getBubblePollsByBubble (bubble.id, "full", 100, 0) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: getBubblePollsByBubble request ok, result : ", polls);

                            let updatePollResult = await rainbowSDK.bubbles.updateBubblePoll(pollCreated.pollId, bubble.id, "My Poll updated", questions, false, 0);
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: updateBubblePoll request ok, result : ", updatePollResult);

                            let pollsUpdated = await rainbowSDK.bubbles.getBubblePollsByBubble (bubble.id, "full", 100, 0) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: getBubblePollsByBubble updated request ok, result : ", pollsUpdated);
                            
                            let pollPublishedResult = await rainbowSDK.bubbles.publishBubblePoll (pollCreated.pollId) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: publishBubblePoll request ok, result : ", pollPublishedResult);

                            let votesPollResult = await rainbowSDK.bubbles.votesForBubblePoll (pollCreated.pollId, [{ "question" : 0, "answers" : [0]}]) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: votesForBubblePoll request ok, result : ", votesPollResult);

                            let unpollPublishedResult = await rainbowSDK.bubbles.unpublishBubblePoll (pollCreated.pollId) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: unpublishBubblePoll request ok, result : ", unpollPublishedResult);

                            let pollPublishedResult2 = await rainbowSDK.bubbles.publishBubblePoll (pollCreated.pollId) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: publishBubblePoll request ok, result : ", pollPublishedResult2);

                            let terminatedBubblePollResult = await rainbowSDK.bubbles.terminateBubblePoll(pollCreated.pollId) ;
                            logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: terminateBubblePoll request ok, result : ", terminatedBubblePollResult);
                            
                            

                            rainbowSDK.bubbles.deleteBubblePoll(pollCreated.pollId).then(async (result) => {
                                logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: deleteBubblePoll request ok, polls : ", result);
    
                                rainbowSDK.bubbles.closeAndDeleteBubble(bubble).then((result) => {
                                    logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: closeAndDeleteBubble request ok, result : ", result);
                                });
                            });

                        });
                    });
                });
            }
        });
    }

    async function testdeleteBubblePoll() {
        let that = this;
        //let res = await rainbowSDK.admin.createAClientVersion(options.application.appID, "2.4.0");
        let res = await rainbowSDK.bubbles.deleteBubblePoll(undefined);
        logger.log("debug", "MAIN - testdeleteAClientVersion, res : ", res);
    }

    //endregion bubbles polls

    //region Rainbow HTTPoverXMPP
    
    async function testgetHTTPoverXMPP(urlToGet :string = "https://moncompte.laposte.fr/") {
        let that = this;
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
        let headers = {"dateOfRequest" : new Date().toLocaleDateString()};
        //let headers = {};
        let res = await rainbowSDK.httpoverxmpp.get(urlToGet, headers);
        logger.log("debug", "MAIN - testgetHTTPoverXMPP, res : ", res);
    }
    
    async function testtraceHTTPoverXMPP(urlToGet :string = "https://moncompte.laposte.fr/") {
        let that = this;
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
        let headers = {"dateOfRequest" : new Date().toLocaleDateString()};
        //let headers = {};
        let res : any = await rainbowSDK.httpoverxmpp.trace(urlToGet, headers);
        logger.log("debug", "MAIN - tracegetHTTPoverXMPP, res : ", res);
        let resp = res.iq.resp;
        let bodyResult = decodeURIComponent(resp.data.text);
        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded bodyResult : ", bodyResult);
    }
    
    async function testheadHTTPoverXMPP(urlToGet :string = "https://moncompte.laposte.fr/hello") {
        let that = this;
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
        let headers = {"dateOfRequest" : new Date().toLocaleDateString()};
        //let headers = {};
        let res = await rainbowSDK.httpoverxmpp.head(urlToGet, headers);
        logger.log("debug", "MAIN - testheadHTTPoverXMPP, res : ", res);
    }
    
    async function testpostHTTPoverXMPP(urlToPost :string = "https://example.org/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep") {
        let that = this;
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
        let headers = {"dateOfRequest" : new Date().toLocaleDateString()};
        //let headers = {};
        let data = "PREFIXdc:<http://purl.org/dc/elements/1.1/>BASE<http://example.org/>SELECT?title?creator?publisherWHERE{?xdc:title?title.OPTIONAL{?xdc:creator?creator}.}";
        let res = await rainbowSDK.httpoverxmpp.post(urlToPost, headers, data);
        logger.log("debug", "MAIN - testpostHTTPoverXMPP, res : ", res);
    }
    
    async function testputHTTPoverXMPP(urlToPut :string = "https://example.org/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep") {
        let that = this;
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
        let headers = {"dateOfRequest" : new Date().toLocaleDateString()};
        //let headers = {};
        let data = "PREFIXdc:<http://purl.org/dc/elements/1.1/>BASE<http://example.org/>SELECT?title?creator?publisherWHERE{?xdc:title?title.OPTIONAL{?xdc:creator?creator}.}";
        let res = await rainbowSDK.httpoverxmpp.put(urlToPut, headers, data);
        logger.log("debug", "MAIN - testputHTTPoverXMPP, res : ", res);
    }
    
    async function testdeleteHTTPoverXMPP(urlToPut :string = "https://example.org/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep") {
        let that = this;
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
        let headers = {"dateOfRequest" : new Date().toLocaleDateString()};
        //let headers = {};
        let data = "PREFIXdc:<http://purl.org/dc/elements/1.1/>BASE<http://example.org/>SELECT?title?creator?publisherWHERE{?xdc:title?title.OPTIONAL{?xdc:creator?creator}.}";
        let res = await rainbowSDK.httpoverxmpp.delete(urlToPut, headers, data);
        logger.log("debug", "MAIN - testdeleteHTTPoverXMPP, res : ", res);
    }
    
    async function testHTTPoverXMPP() {
        let that = this;
        let utc = new Date().toJSON().replace(/-/g, "/");
        //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
        let headersPost = {
            "dateOfRequest": new Date().toLocaleDateString()
        };
        Object.assign(headersPost, rainbowSDK._core.rest.getRequestHeader());
        headersPost['Content-Type'] = "application/json";
        let headersGet = {
            "dateOfRequest": new Date().toLocaleDateString()
        };
        Object.assign(headersGet, rainbowSDK._core.rest.getRequestHeader());
        let headersPut = {
            "dateOfRequest": new Date().toLocaleDateString()
        };
        Object.assign(headersPut, rainbowSDK._core.rest.getRequestHeader());
        headersPut['Content-Type'] = "application/json";

        // *** Get directory entry ***

        let urlToGet = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries?name=testPersonalDirectory&format=small&limit=100&offset=0&sortField=lastName&sortOrder=1&view=all"
        //let res2 = await rainbowSDK.httpoverxmpp.getHTTPoverXMPP(urlToPost + "?name=testPersonalDirectory_lastname_", headers);
        let res2: any = await rainbowSDK.httpoverxmpp.get(urlToGet, headersGet);
        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP res2 : ", res2);
        let resp = res2.iq.resp;
        let bodyResult = decodeURIComponent(resp.data.text);
        let resultOfHttp : any = bodyResult;
        if (resp.$attrs.statusCode >= 200 && resp.$attrs.statusCode <= 206) {
            for (let i = 0; i < resp.headers.header.length; i++) {
                if (resp.headers.header[i].$attrs.name==="content-type" && (resp.headers.header[i]._.indexOf("json") > -1 || resp.headers.header[i]._.indexOf("csv") > -1)) {
                    resultOfHttp = JSON.parse(bodyResult);
                }

            }
        } else {
            logger.warn("internal", "MAIN - testHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
        }

        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded resultOfHttp : ", resultOfHttp);

        // *** Delete directory entry ***

        let urlToDelete = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries/"
        for (let i = 0; i < resultOfHttp.data.length; i++) {
            let resDelete: any = await rainbowSDK.httpoverxmpp.delete(urlToDelete + resultOfHttp.data[i].id, headersGet, undefined);
            logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP resDelete : ", resDelete);
            let respDelete = resDelete.iq.resp;
            let bodyResultDelete = decodeURIComponent(respDelete.data.text);
            let resultOfHttpDelete: any = bodyResultDelete;
            if (respDelete.$attrs.statusCode >= 200 && respDelete.$attrs.statusCode <= 206) {
                for (let i = 0; i < respDelete.headers.header.length; i++) {
                    if (respDelete.headers.header[i].$attrs.name==="content-type" && (respDelete.headers.header[i]._.indexOf("json") > -1 || respDelete.headers.header[i]._.indexOf("csv") > -1)) {
                        resultOfHttpDelete = JSON.parse(bodyResultDelete);
                    }

                }
            } else {
                logger.warn("internal", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResultDelete);
            }

            logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP decoded resultOfHttpDelete : ", resultOfHttpDelete);
            // */
        }

        // *** Create directory entry ***

        let urlToPost = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries"; //  https://openrainbow.net:443/api/rainbow/directory/v1.0/entries
        //headers["Content-Type"] = "application/json";
        //let headers = {};
        let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

        let data : any = {
            firstName: "testPersonalDirectory_firstname_" + utc,
            lastName: "testPersonalDirectory_lastname_" + utc,
            companyName: connectedUser.companyName,
            department: "SBU",
            street: "1 rte Albert Schweitzer",
            city: "Illkirch",
            state: null,
            postalCode: "67115",
            country: "FRA",
            workPhoneNumbers: ["0011223344"],
            mobilePhoneNumbers: [],
            otherPhoneNumbers: [],
            jobTitle: "Validation Engineer",
            eMail: utcEmail + "_test@vbe.test.openrainbow.net",
            tags: [],
            custom1: "",
            custom2: ""

        };
        let body = JSON.stringify(data);
        let res : any = await rainbowSDK.httpoverxmpp.post(urlToPost, headersPost, body);
        logger.log("debug", "MAIN - testHTTPoverXMPP, postHTTPoverXMPP res : ", res);
        resp = res.iq.resp;
        bodyResult = decodeURIComponent(resp.data.text);
        resultOfHttp = bodyResult;
        /*if (resp.$attrs.statusCode >= 200 && resp.$attrs.statusCode <= 206) {
            for (let i = 0; i < resp.headers.header.length; i++) {
                if (resp.headers.header[i].$attrs.name==="content-type" && (resp.headers.header[i]._.indexOf("json") > -1 || resp.headers.header[i]._.indexOf("csv") > -1)) {
                    resultOfHttp = JSON.parse(bodyResult);
                }

            }
        } else {
            logger.warn("internal", "MAIN - testHTTPoverXMPP, postHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
        } // */

        logger.log("debug", "MAIN - testHTTPoverXMPP, postHTTPoverXMPP decoded resultOfHttp : ", resultOfHttp);

        // *** Get directory entry ***

        urlToGet = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries?name=testPersonalDirectory&format=small&limit=100&offset=0&sortField=lastName&sortOrder=1&view=all"
        //let res2 = await rainbowSDK.httpoverxmpp.getHTTPoverXMPP(urlToPost + "?name=testPersonalDirectory_lastname_", headers);
        res2 = await rainbowSDK.httpoverxmpp.get(urlToGet, headersGet);
        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP res2 : ", res2);
        resp = res2.iq.resp;
        bodyResult = decodeURIComponent(resp.data.text);
        resultOfHttp = bodyResult;
        if (resp.$attrs.statusCode >= 200 && resp.$attrs.statusCode <= 206) {
            for (let i = 0; i < resp.headers.header.length; i++) {
                if (resp.headers.header[i].$attrs.name==="content-type" && (resp.headers.header[i]._.indexOf("json") > -1 || resp.headers.header[i]._.indexOf("csv") > -1)) {
                    resultOfHttp = JSON.parse(bodyResult);                
                }

            }
        } else {
            logger.warn("internal", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
        }

        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded resultOfHttp : ", resultOfHttp);

        // *** Update directory entry ***

        data = {
            lastName: "testPersonalDirectory_lastname_" + utc + "_updated",
        };
        body = JSON.stringify(data);

        let urlToPut = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries/" + resultOfHttp.data[0].id;
        res = await rainbowSDK.httpoverxmpp.put(urlToPut, headersPut, body);
        logger.log("debug", "MAIN - testHTTPoverXMPP, putHTTPoverXMPP res : ", res);
        resp = res.iq.resp;
        bodyResult = decodeURIComponent(resp.data.text);
        resultOfHttp = bodyResult;
        if (resp.$attrs.statusCode >= 200 && resp.$attrs.statusCode <= 206) {
            for (let i = 0; i < resp.headers.header.length; i++) {
                if (resp.headers.header[i].$attrs.name==="content-type" && (resp.headers.header[i]._.indexOf("json") > -1 || resp.headers.header[i]._.indexOf("csv") > -1)) {
                    resultOfHttp = JSON.parse(bodyResult);
                }

            }
        } else {
            logger.warn("internal", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
        }

        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded updated resultOfHttp : ", resultOfHttp);
        
        // *** Get directory entry ***

        urlToGet = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries?name=testPersonalDirectory&format=small&limit=100&offset=0&sortField=lastName&sortOrder=1&view=all"
        //let res2 = await rainbowSDK.httpoverxmpp.getHTTPoverXMPP(urlToPost + "?name=testPersonalDirectory_lastname_", headers);
        res2 = await rainbowSDK.httpoverxmpp.get(urlToGet, headersGet);
        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP res2 : ", res2);
        resp = res2.iq.resp;
        bodyResult = decodeURIComponent(resp.data.text);
        resultOfHttp = bodyResult;
        if (resp.$attrs.statusCode >= 200 && resp.$attrs.statusCode <= 206) {
            for (let i = 0; i < resp.headers.header.length; i++) {
                if (resp.headers.header[i].$attrs.name==="content-type" && (resp.headers.header[i]._.indexOf("json") > -1 || resp.headers.header[i]._.indexOf("csv") > -1)) {
                    resultOfHttp = JSON.parse(bodyResult);
                }

            }
        } else {
            logger.warn("internal", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
        }

        logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded updated resultOfHttp : ", resultOfHttp);

        // *** Delete directory entry ***

        urlToDelete = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries/"
        for (let i = 0; i < resultOfHttp.data.length; i++) {
            let resDelete: any = await rainbowSDK.httpoverxmpp.delete(urlToDelete + resultOfHttp.data[i].id, headersGet, undefined);
            logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP resDelete : ", resDelete);
            let respDelete = resDelete.iq.resp;
            let bodyResultDelete = decodeURIComponent(respDelete.data.text);
            let resultOfHttpDelete: any = bodyResultDelete;
            if (respDelete.$attrs.statusCode >= 200 && respDelete.$attrs.statusCode <= 206) {
                for (let i = 0; i < respDelete.headers.header.length; i++) {
                    if (respDelete.headers.header[i].$attrs.name==="content-type" && (respDelete.headers.header[i]._.indexOf("json") > -1 || respDelete.headers.header[i]._.indexOf("csv") > -1)) {
                        resultOfHttpDelete = JSON.parse(bodyResultDelete);
                    }

                }
            } else {
                logger.warn("internal", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResultDelete);
            }

            logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP decoded resultOfHttpDelete : ", resultOfHttpDelete);
            // */
        }



        /*
        let personalDirectoryList : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
        logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryList : ", personalDirectoryList);
        if (personalDirectoryList &&personalDirectoryList.data && personalDirectoryList.total > 0) {
                    let result = await rainbowSDK.contacts.updatePersonalDirectoryEntry(personalDirectoryList.data[0].id, personalDirectoryList.data[0].firstName + "_updated");

            let result = await rainbowSDK.contacts.deletePersonalDirectoryEntry(personalDirectoryList.data[0].id);
            logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - deletePersonalDirectoryEntry result : ", result);
            let personalDirectoryListUpdated : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
            logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryListUpdated : ", personalDirectoryListUpdated);
        }
        // */

    }
    
    async function testdiscover() {
        let that = this;
        let res = await rainbowSDK.httpoverxmpp.discover();
        logger.log("debug", "MAIN - testdiscover, res : ", res);
    }
    
    //endregion Rainbow HTTPoverXMPP 
    
    function testGetEventsList() {
        let eventsTab = rainbowSDK.events.sdkPublicEventsName;
        for (const event in eventsTab) {
            logger.log("debug", "MAIN - testGetEventsList, eventTab : ", eventsTab[event]);
        }
    }

    function commandLineInteraction() {
        let questions = [
            {
                type: "input",
                name: "cmd",
                message: "Command> "
            }
        ];
        logger.log("debug", "MAIN - commandLineInteraction, enter a command to eval : "); //logger.colors.green(JSON.stringify(result)));
        inquirer.prompt(questions).then(answers => {
            //console.log(`Hi ${answers.cmd}!`);
            logger.log("debug", "MAIN - cmd entered : ", answers.cmd); //logger.colors.green(JSON.stringify(result)));
            try {
                if (answers.cmd==="by") {
                    logger.log("debug", "MAIN - exit."); //logger.colors.green(JSON.stringify(result)));
                    rainbowSDK.stop().then(() => {
                        process.exit(0);
                    });
                } else {
                    logger.log("debug", "MAIN - run cmd : ", answers.cmd); //logger.colors.green(JSON.stringify(result)));
                    eval(answers.cmd);
                    commandLineInteraction();
                }
            } catch (e) {
                logger.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));
                commandLineInteraction();
            }
        });
    }

//let startDate = new Date();
    let token = undefined;

    // testMultiPromise(500)
    async function testMultiPromise(nb = 100) {
        let that = this;
        let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
        let nbRequestToSend = nb;
        let nbRequestSent = 0;
        let promiseList = []
        logger.log("debug", "MAIN - (testMultiPromise) : START iter.");
        for (let i = 0; i < nbRequestToSend; i++) {
            //setTimeoutPromised(100).then(() => {
            let prom = rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
                nbRequestSent++;
                logger.log("debug", "MAIN - promise iter : ", logger.colors.green(i), " : nb request sent ", nbRequestSent, "/", nbRequestToSend, " needed, result : contact : ", _contactFromServer.displayName);
            }).catch((error) => {
                logger.log("error", "MAIN - CATCH Error !!! promise to getContactInfo failed result : ", error);
            });
            promiseList.push(prom);
            //});
        }
        logger.log("debug", "MAIN - (testMultiPromise) : STOP iter.");
        Promise.all(promiseList).then(() => {
            logger.log("debug", "MAIN - (testMultiPromise) : ALL Promises done.");
        })
    }

    let connectedUser: any = {};

    async function testStartWithToken() {
        await rainbowSDK.stop();
        //let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1YmJkYzMzNzJjZjQ5NmMwN2RkODkxMjEiLCJsb2dpbkVtYWlsIjoidmluY2VudDAwQHZiZS50ZXN0Lm9wZW5yYWluYm93Lm5ldCJ9LCJhcHAiOnsiaWQiOiIyNzAzM2IxMDAxYmQxMWU4ODQzZDZmMDAxMzRlNTE4OSIsIm5hbWUiOiJSYWluYm93IG9mZmljaWFsIFdlYiBhcHBsaWNhdGlvbiJ9LCJpYXQiOjE1NzU0NjIyOTMsImV4cCI6MTU3Njc1ODI5M30.MA71vA1SDjf-PqYtrBnpEsPai1G4LvVFHFqolsQ6Dv3NukRpbHusEgyICvtBt0t9vJ3iuzupN-ltbrj1feSBR7VnGUf2i0QNXWRCSbOgHugQAKyRZTKt9lKphaYtEEJMjHrl7k8XO6E7E1nFLFWIgJw8pNbKSmJ84rCP-wyH6kh5N7ev10XBaZsC0kdDSgFH8M2T72xgc4gtLua5BIK8Oj6qdbpHSODaLptI7ehYdbU-Mw8ECZ_VFj8Cs6lfbQWOYKgHojkoLHakDf_6oVA40YarJZunYEasuuHKL5qiZJHGkgXHBxBUBGJbbDXu_DOkTognKMPSkAXjfnLmbk0kxw';
//let token = 'sdfsqfsqfsdfsdfgdf';
        let token = undefined;

//token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWY3NWEwZGQxZGI5NDY0ZDY3ZTMyNDYzIiwibG9naW5FbWFpbCI6ImxkYXAuY29ubmVjdG9yLmFkbWluMUBjbWEudGVzdC5vcGVucmFpbmJvdy5jb20ifSwiYXBwIjp7ImlkIjoiMDczMGY2ZTBhMGUwMTFlYjhlNjE3YjhlMWVkZTcwYjEiLCJuYW1lIjoiTERBUCAgY29ubmVjdG9yIn0sIm9hdXRoIjp7InRva2VuSWQiOiItZW1zcXpIa3F2IiwidHlwZSI6ImFjY2Vzc190b2tlbiIsInNjb3BlIjoiYWxsIiwiZ3JhbnQiOiJpbXBsaWNpdCJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJwcmVwcm9kdWN0aW9uIiwiZW52aXJvbm1lbnRBcGlVcmwiOiJodHRwczovL29wZW5yYWluYm93Lm5ldCJ9LCJpYXQiOjE2MjkxOTE1ODAsImV4cCI6MTYyOTE5MTg4MH0.p-GJWuIbJzb7eeY9Bi-4oq_t3PUxEr_E-0IrAad0LJbgXVprmIMiieBJamB4SXZhVSN2yqz68_I6yS7veFoLvcVU8coi4L_TebO8R5mnKB8Ocs66SqhjotggmXZNsWmaMNOGNCZRpaCJF9eHz04ux9BZTv7UJmfXpbg7xhce9GXDxT4OAoJYN7XYglymerueWZ8CArQ1Vtc_ahWdeOjp7dQYQ3DMKowmPO1_LdJTmcmAlwVZTG6RGZJNHckPyb4aGTesUYObJIyf_CHwZaIhyk-qcISCAPxzKG-x3qDZ_kCqzNGB3ojP9YkrBy1X5nTmDrt7UfV85gMaW5ew1AIFHQ";

//token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWMzZGY5Mzc3NmYzNTE4OTc4YzFkMDhhIn0sImFwcCI6eyJpZCI6IjIzNWFjNjAwMDk4MzExZWNiN2I4NGQ2OTk4MjVkNmQzIiwibmFtZSI6InZiZXJkZXItb2F1dGgtYXBwIn0sIm9hdXRoIjp7InRva2VuSWQiOiJMU19qV1VvcmpKIiwicmVmcmVzaFRva2VuSWQiOiI2MTJlNjhjMThkZDU3MTc4NTdmZTU1ZjIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwic2NvcGUiOiJhbGwiLCJncmFudCI6ImF1dGhvcml6YXRpb25fY29kZSJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJwcmVwcm9kdWN0aW9uIiwiZW52aXJvbm1lbnRBcGlVcmwiOiJodHRwczovL29wZW5yYWluYm93Lm5ldCJ9LCJpYXQiOjE2MzA0MzE0MjUsImV4cCI6MTYzMDQzMTcyNX0.DeWye85KexHllKsMwvJMfnC5ajl_NBXLzzE7DHaDuisrN3g3WA27C3Z1Saa7cGAQGixI5zK1DZScJPQaCC6Bv-gR3MJAfuyidF_HA5pjp7oHV40Dt6791NaMCQQDHhlpzbabDWL0pw9gqrO55y4bgtJ07EXg4j-H34nue6SxKfupXqmgx3A_4IM_rIn_HMMpNgooFOv2ktQIPNmRkXL8nUwyiyNIeIhCWtO8KQ4j23zXdgPP30jfS14vSEpRS19dlbCZ3dcdckj42cV8lPm_XEspk-F_x5DcjwGhtfvjrCcqWMn8mQ6x50lcnk_gfqB6K8lIrwWPZXw5PKdruHB40g";

        logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK token : ", logger.colors.green(token)); //logger.colors.green(JSON.stringify(result)));
        token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1NzMxZmU0Zjc4MjQwOTFiMzVmNWUyYjciLCJsb2dpbkVtYWlsIjoidmluY2VudC5iZXJkZXJAYWwtZW50ZXJwcmlzZS5jb20ifSwiZW52aXJvbm1lbnQiOnsiZW52aXJvbm1lbnROYW1lIjoib2ZmaWNpYWwiLCJlbnZpcm9ubWVudEFwaVVybCI6Imh0dHBzOi8vb3BlbnJhaW5ib3cuY29tIn0sImFwcCI6eyJpZCI6ImEyZjg5MDMwMDBmMDExZTg4NmQ5YjViYmQzMjYwNzkyIiwibmFtZSI6IlJhaW5ib3cgb2ZmaWNpYWwgV2ViIGFwcGxpY2F0aW9uIn0sInNhbWwiOnsibmFtZUlkIjoidmluY2VudC5iZXJkZXJAYWwtZW50ZXJwcmlzZS5jb20iLCJzZXNzaW9uSWR4IjoiXzZhZmM4Y2ZmLTg3OTEtNDZhNy1iZWEyLTAzODgwMGI4OGIwMCJ9LCJpYXQiOjE2MjkyMTEzMDQsImV4cCI6MTYzMDUwNzMwNH0.aP4LC9HX-QO1s9gf68-R08goe4472YQYEOErRc7_piaVRRPYchD6Fo3u3CXJNmwep5MJjnypuJKlttQ4mtMRHG5np3b_1peARj0qqMpePag4JiQZWV9ne9DwcwNRhxD8uTmYEDOezGH8hhpIvkqUfuHpR4ZW7Anff5SeVOHPWzwcJ5EUJQKQKKR3sEfEC_2PHd7fywEw0BDOxCIXFQjC1jG3_JbIgnIGOqTwOFdH9-ZaurDjj9mU2JL4l9GKPn_afi1YiBjoAm3Er7hM-x6XwHHdJBvl49SY-4p7uzhqFIFNnrZ-73Cihbo8RTyb0hnCdOB36p6HfiVytL6UwZHQCw";
        logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK token : ", logger.colors.green(token)); //logger.colors.green(JSON.stringify(result)));
        try {
            logger.log("debug", "MAIN - rainbow SDK token decoded : ", jwt(token));
        } catch (err) {
            logger.log("error", "MAIN - rainbow SDK token decoded error : ", token);
        }

        await rainbowSDK.start(token).then(async (result2) => {
            // Do something when the SDK is started
            logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK started with token result 2: ", logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
        });
        await rainbowSDK.stop();
    }

// */

    async function testStopAndStart() {
        await rainbowSDK.stop();
        let token = undefined;

        logger.log("debug", "MAIN - (testStopAndStart) rainbow SDK stopped.");
        await rainbowSDK.start(token).then(async (result2) => {
            // Do something when the SDK is started
            logger.log("debug", "MAIN - (testStopAndStart) rainbow SDK started : ", logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
        });
        await rainbowSDK.stop();
    }

    logger.log("debug", "MAIN - rainbow SDK created with options : ", rainbowSDK.option);
    
    rainbowSDK.start(token).then(async (result: any) => {
//Promise.resolve({}).then(async(result: any) => {
        try {
            // Do something when the SDK is started
            connectedUser = result.loggedInUser;
            token = result.token;
            logger.log("debug", "MAIN - rainbow SDK started with result 1 : ", result); //logger.colors.green(JSON.stringify(result)));
            logger.log("debug", "MAIN - rainbow SDK started with credentials result 1 : ", logger.colors.green(connectedUser)); //logger.colors.green(JSON.stringify(result)));
/*
            let companyInfo = await rainbowSDK.contacts.getCompanyInfos().catch((err) => {
                logger.log("warn", "MAIN - failed to retrieve company infos :" , err);
            });

            logger.log("debug", "MAIN - company infos :" , companyInfo);
// */
            /*
                    await rainbowSDK.stop().then((result)=>{
                        logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                    });
                    await rainbowSDK.start(token).then(async(result2) => {
                        // Do something when the SDK is started
                        logger.log("debug", "MAIN - rainbow SDK started result 2: ", logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
                        await rainbowSDK.stop().then((result)=>{
                            logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                        });
                        await rainbowSDK.start(token).then(async (result3) => {
                            // Do something when the SDK is started
                            logger.log("debug", "MAIN - rainbow SDK started result 3 : ", logger.colors.green(result3)); //logger.colors.green(JSON.stringify(result)));
                            await rainbowSDK.stop().then((result)=>{
                                logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                            });
                            await rainbowSDK.start(token).then(async (result4) => {
                                // Do something when the SDK is started
                                logger.log("debug", "MAIN - rainbow SDK started result 4 : ", logger.colors.green(result4)); //logger.colors.green(JSON.stringify(result)));
                                await rainbowSDK.stop().then((result)=>{
                                    logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                });
                                await rainbowSDK.start(token).then(async (result5) => {
                                    // Do something when the SDK is started
                                    logger.log("debug", "MAIN - rainbow SDK started result 5 : ", logger.colors.green(result5)); //logger.colors.green(JSON.stringify(result)));
                                    await rainbowSDK.stop().then((result)=>{
                                        logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                    });
                                    await rainbowSDK.start(token).then(async (result6) => {
                                        // Do something when the SDK is started
                                        logger.log("debug", "MAIN - rainbow SDK started result 6 : ", logger.colors.green(result6)); //logger.colors.green(JSON.stringify(result)));
                                        await rainbowSDK.stop().then((result)=>{
                                            logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                        });
                                        await rainbowSDK.start(token).then(async (result7) => {
                                            // Do something when the SDK is started
                                            logger.log("debug", "MAIN - rainbow SDK started result 7 : ", logger.colors.green(result7)); //logger.colors.green(JSON.stringify(result)));
                                            await rainbowSDK.stop().then((result)=>{
                                                logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                            });
                                            await rainbowSDK.start(token).then(async (result8) => {
                                                // Do something when the SDK is started
                                                logger.log("debug", "MAIN - rainbow SDK started result 8 : ", logger.colors.green(result8)); //logger.colors.green(JSON.stringify(result)));
                                                await rainbowSDK.stop().then((result)=>{
                                                    logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                });
                                                await rainbowSDK.start(token).then(async (result9) => {
                                                    // Do something when the SDK is started
                                                    logger.log("debug", "MAIN - rainbow SDK started result 9 : ", logger.colors.green(result9)); //logger.colors.green(JSON.stringify(result)));
                                                    await rainbowSDK.stop().then((result)=>{
                                                        logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                    });
                                                    await rainbowSDK.start(token).then(async (result10) => {
                                                        // Do something when the SDK is started
                                                        logger.log("debug", "MAIN - rainbow SDK started result 10 : ", logger.colors.green(result10)); //logger.colors.green(JSON.stringify(result)));
                                                        await rainbowSDK.stop().then((result)=>{
                                                            logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                        });
                                                        await rainbowSDK.start(token).then(async (result11) => {
                                                            // Do something when the SDK is started
                                                            logger.log("debug", "MAIN - rainbow SDK started result 11 : ", logger.colors.green(result11)); //logger.colors.green(JSON.stringify(result)));
                                                            await rainbowSDK.stop().then((result)=>{
                                                                logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                            });
                                                            await rainbowSDK.start(token).then(async (result12) => {
                                                                // Do something when the SDK is started
                                                                logger.log("debug", "MAIN - rainbow SDK started result 12 : ", logger.colors.green(result12)); //logger.colors.green(JSON.stringify(result)));
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
            // */

            //logger.log("debug", "MAIN - rainbow SDK started result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
            /*
            let list = rainbowSDK.contacts.getAll();
    
            if (list) {
                list.forEach(function (contact) {
                    logger.log("debug", "MAIN - [start    ] :: contact : ", contact);
                });
            } else {
                logger.log("debug", "MAIN - [start    ] :: contacts list empty");
            }
            // */

            /*let roster = await rainbowSDK.contacts.getRosters();
            logger.log("debug", "MAIN - getRosters - roster : ", roster);
    
             */
            class Dog {
                private name: any;

                constructor(name) {
                    this.name = name;
                }

                toString() {
                    return "vvv" + this.name;
                }
            }

            /*Dog.prototype.toString = function dogToString() {
                return 'vvv' + this.name;
            }; */
            let dog1 = new Dog("Gabby");
            logger.log("debug", "MAIN - dog1", dog1);


            //let startDuration = Math.round(new Date() - startDate);
            let startDuration = result.startDuration;
            // that.stats.push({ service: "telephonyService", startDuration: startDuration });
            logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
            console.log("MAIN === STARTED (" + startDuration + " ms) ===");

            /*
            let nbc = 1;
            for (let i = 0 ; i < 8000 ; i++) {
                console.log("MAIN iter : ", i , ", nbc : ", nbc);
                nbc = nbc * 3;
            } // */


            // process.exit(1);
            /*
             await rainbowSDK2.start();
             await rainbowSDK3.start();
             await rainbowSDK4.start();
             await rainbowSDK5.start();
             //await rainbowSDK6.start();
     
            // */

            //  rainbowSDK.stop().then(() => { process.exit(0); }); // testCreate50BubblesAndArchiveThem()
            commandLineInteraction();

            /* while (true) {
                 readline.question("Command>", cmd => {
                     //console.log(`run ${cmd}!`);
                     logger.log("debug", "MAIN - run : ", cmd); //logger.colors.green(JSON.stringify(result)));
    
                     try {
                         if (cmd === "by") {
                             process.exit(0);
                         }
                         eval(cmd);
                     } catch (e) {
                         logger.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));
    
                     }
                     readline.close();
                 });
             } // */

            /*
            setInterval(()=> {
                //let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();
                let bubbles = rainbowSDK.bubbles.getAll();
                let bubblesCount = bubbles.length;
                //logger.log("debug", "MAIN - Bubbles count = ", bubblesCount, " : ", bubbles);
    
                let conversationBubblePromises=[];
                let bubblesWithLastModificationDate=[];
    
    
                if(bubblesCount>0) {
                    let bubblesInfos = "";
                    for (let bubble of bubbles) {
                        bubblesInfos += "\n{ id : " + bubble.id + ", name : " + bubble.name + " },";
                        if (bubble.id == "5da6d969e6ca5a023da44edd") {
                            logger.log("debug", "MAIN - Bubble 5da6d969e6ca5a023da44edd : ", bubble);
                        }
                    }
                    logger.log("debug", "MAIN - Bubbles count = ", bubblesCount, " bubblesInfos : ", bubblesInfos);
                }
            }, 20000);
        // */
            // expected output: "Gabby"
            //await testSendMessageToJidOfMySelf();
            // await testgetAllUsers();
            //testgetContactByLoginEmail();
            //testUploadFileToConversationByPath();
            //testmakeCallByPhoneNumber();
            //testmakeCallByPhoneNumberProd();
            //testgetServerFavorites();
            //testgetContactInfos();
            //testupdateContactInfos();
            //testaddToContactsList();
            //testjoinContacts_AddContactToRoster();
            //testUploadFileToBubble();
            //testDeleteServerConversation();
            //testsendMessageToConversation_html();
            //testSendMessageToJid();
            //testUploadFileToConversation();
            //testRetrieveOneFileDescriptor();
            //testSetBubbleCustomData();
            //testDeleteAllCallLogs();
            //testmarkAllCallsLogsAsRead();
            //testDeleteCallLogsForContact();
            //testmarkCallLogAsRead();
            //testDeleteOneCallLog();
            //rainbowSDK.stop();
            // testremoveAllMessages();
            //testsendCorrectedChatMessageForBubbleInExistingConversation();
            //testsendCorrectedChatMessageForBubble();
            //testsendCorrectedChatMessage();
            // testBubblesArchived();
            // testgetContactByLoginEmail_UnknownUser();
            //testsendMessageToConversation();
            //   testCreateBubbles();
            //testChannelupdateChannelDescription();
            //downloadFile();
            //testChannelDeleteMessage();
            //testPublishChannel();
            //testReconnection();
            //testChannelImage();
            //testcreateChannel();
            //testChannelDeleteMessage();
            //rainbowSDK.stop();
            //process.exit(0);
            /*    rainbowSDK.contacts.getContactByLoginEmail(physician.loginEmail).then(contact => {
                    if (contact) {
                        physician.name = contact.title + " " + contact.firstname + " " + contact.lastname
                        physician.contact = contact;
                        rainbowSDK.bubbles.createBubble(physician.appointmentRoom, physician.appointmentRoom).then(function (bubble) {
                            rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(function (updatedBubble) {
                                rainbowSDK.contacts.getContactByLoginEmail(botappointment).then(contactbot => {
                                    rainbowSDK.bubbles.inviteContactToBubble(contactbot, bubble, false, false).then(function (updatedBubble) {
                                        setTimeout(() => { rainbowSDK.bubbles.promoteContactInBubble(contactbot, bubble).then(function (updatedBubble) {
                                            rainbowSDK.conversations.getBubbleConversation/*openConversationForBubble // */
            /*(updatedBubble).then(conversation => {
                                               logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok");
                                           });
                                       })} , 2000);
                                   });
                               });
                           });
                       });
                   }
               }); // */
            //    let utc = new Date().toJSON().replace(/-/g, '/');
            /*
                rainbowSDK.telephony.makeCallByPhoneNumber("23026").then((data)=>{
                    logger.log("debug", "MAIN - [makeCallByPhoneNumber] ", data);
                }).catch((error) => {
                    logger.log("debug", "MAIN - [makeCallByPhoneNumber] error ", error);
                });
    
                setTimeout(() => {
                    calls.forEach((c) => {
                        rainbowSDK.telephony.releaseCall(c);
                    });
                }, 5000);
                // */
            // */
            //rainbowSDK.im.sendMessageToJid("test  sample node : ° ✈ :airplane::airplane: ) : " + utc , "6a2010ca31864df79b958113785492ae@vberder-all-in-one-dev-1.opentouch.cloud", "fr", "", "im");
            /* rainbowSDK.admin.getAllCompanies().then((restresult) => {
                 console.log("getAllCompanies companies", restresult);
             }); //*/
            /* rainbowSDK.im.sendMessageToJid("😔😎😜😋👀😁😁🐣🐦🐷🐴🐮🦋🐗🙊🐧🐔🐻💿⏱⏱🎞🖨📻🇧🇴🇦🇱🇧🇼✡💔🚖🚗🚘🚜🛫🚔🚲🛫🛬\ntest  sample node : ° ✈ :airplane::airplane: ) : " + utc + ", randow : " + Math.random() * 10,
    
             "ca648c9e335f481d9b732dd99990b789@vberder-all-in-one-dev-1.opentouch.cloud", "fr", "", "im")
         /*    then((msg) => {
                 "6a2010ca31864df79b958113785492ae@vberder-all-in-one-dev-1.opentouch.cloud", "fr", "", "im"
             )// */
            /* .then((msg) => {
                    //console.log("message sent", msg);
                    logger.log("debug", "MAIN - sendMessageToJid.then() message sent", msg);
                }).catch((err) => {
                    console.log("Error while sending message ", err);
                }); // */
            /*
                rainbowSDK.admin.getAllCompanies().then((restresult) => {
                    //console.log("getAllCompanies companies", restresult);
                    let companies = restresult.data;
                    for (let company of companies) {
                        //Object.keys(company).forEach( (companyKey) => {
                        if (company.name && (company.name.indexOf("WestworldGuest_") !== -1 || company.name.indexOf("WestworldHost_") !== -1)) { //
                            console.log("WestworldXXXXX_ found : ", company);
                            rainbowSDK.admin.removeCompany(company).then((data) => {
                                console.log("deleteCompany data", data);
                                //process.exit(-1);
                            }).catch((err) => {
                                    if (err.code === 403) {
                                        let strToFind = "still linked to user(s) : ";
                                        let indexOf = err.details.indexOf(strToFind);
                                        let userstoDelete = err.details.substring(indexOf + strToFind.length, err.details.length - 1);
                                        //console.log ('delete user', strToFind, userstoDelete);
                                        let usersIdTab = userstoDelete.split(',');
                                        let removeUsers = [];
                                        usersIdTab.forEach((id) => {
                                            console.log('delete user', id);
                                            removeUsers.push(rainbowSDK.admin.deleteUser(id));
                                        });
    
                                        Promise.all(removeUsers).then(
                                            () => {
                                                rainbowSDK.admin.removeCompany(company).then((data) => {
                                                    console.log("deleteCompany data", data);
                                                    //process.exit(-1);
                                                }).catch((err2) => {
                                                        console.log("deleteCompany after user delete, error", err2);
                                                    }
                                                );
    
                                            });
                                    } else {
                                        console.log("error during deleting company : ", err);
                                    }
                                    //process.exit(-1);
                                }
                            );
                            //break;
                        }
                        //});
                    }
                }).catch((err) => {
                    console.log("error during get all companies : ", err);
                    //process.exit(-1);
                }); // */
            /*rainbowSDK.admin.deleteCompany().then((companies) => {
                console.log("deleteCompany companies", companies);
            }); //*/
            /* rainbowSDK.stop().then(() => {
                rainbowSDK.start().then((result) => {
                    // Do something when the SDK is started
                    logger.log("debug", "MAIN - rainbow SDK started result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
                    let list = rainbowSDK.contacts.getAll();
                    if (list) {
                        list.forEach(function (contact) {
                            logger.log("debug", "MAIN - [start    ] :: contact : ", contact);
                        });
                    } else {
                        logger.log("debug", "MAIN - [start    ] :: contacts list empty");
                    }
    
    
                })
                ;
            }); // */
            /*
            rainbowSDK.stop().then((result)=>{
                logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
            });
            // */
            /*.then(()=>{
               rainbowSDK.start().then(()=>{
                   logger.log("debug", "MAIN - rainbow SDK started step_2 result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
                   let list = rainbowSDK.contacts.getAll();
                   if (list) {
                       list.forEach(function (contact) {
                           logger.log("debug", "MAIN - [start    step_2] :: contact : ", contact);
                       });
                   } else {
                       logger.log("debug", "MAIN - [start    step_2] :: contacts list empty");
                   }
                   rainbowSDK.stop();
               });
           }); // */
//# sourceMappingURL=index.js.map
        } catch (err) {
            console.log("MAIN - Error during starting : ", inspect(err));
        }
    }).catch((err) => {
        console.log("MAIN - Error during starting : ", inspect(err));
    }); // */

})();
