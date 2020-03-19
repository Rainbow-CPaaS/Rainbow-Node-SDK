"use strict";
/*
 * @name index.ts
 *
 * @description :
 * The index.ts file is not a "best practice", but it is a file used by developper to test/validate the SDK, so you can find in it some help.
 *
 */
import {setTimeoutPromised} from "../lib/common/Utils";
import set = Reflect.set;
import {DataStoreType} from "../lib/config/config";
import {url} from "inspector";

var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function(resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator.throw(value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load the SDK
// For using the fiddler proxy which logs requests to server
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const Bubble_1 = require("../lib/common/models/Bubble");
const RainbowSDK = require("../index");
const Utils = require("../lib/common/Utils");
const fs = require("fs");
const fileapi = require("file-api");
const util = require("util");
const inquirer = require("inquirer");
const jwt =  require("jwt-decode");
/*const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}); // */

const ngrok = require('ngrok');
let urlS2S;

(async function() {
    console.log("MAIN - ngrock.");
    urlS2S = await ngrok.connect(4000).catch((error) => {
        console.log("MAIN - ngrock, error : ", error);
    });
    console.log("MAIN - ngrock, urlS2S : ", urlS2S);

// Define your configuration
let options = {
    "rainbow": {
         "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
   //      "host": "openrainbow.net",
       "mode": "s2s"
       // "mode": "xmpp"
    },
    "s2s": {
        "hostCallback": urlS2S,
        //"hostCallback": "http://70a0ee9d.ngrok.io",
        "locallistenningport": "4000"
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
    /*
        // Proxy configuration
        proxy: {
            host: "",
            port: 8080,
            protocol: "http",
            user: "",
            password: "",
            secureProtocol: "SSLv3_method"
        }, // */
    // Logs options
    "logs": {
        "enableConsoleLogs": true,
        "enableFileLogs": true,
        "color": true,
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
    "testOutdatedVersion": false,
    // IM options
    "im": {
        "sendReadReceipt": true,
        "messageMaxLength": 1024,
        "sendMessageToConnectedUser": true,
        "conversationsRetrievedFormat": "small",
        "storeMessages": false,
        "copyMessage": true,
        "nbMaxConversations": 15,
        "rateLimitPerHour": 1000,
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
rainbowSDK.events.on("rainbow_onready", () => {
    // do something when the SDK is ready to be used
    logger.log("debug", "MAIN - rainbow_onready - rainbow onready");
    /*let list = rainbowSDK.contacts.getAll();
    if (list) {
        list.forEach((contact) => {
            logger.log("debug", "MAIN - rainbow_onready [start    " + countStop + "] :: getAll contact : ", contact);
        });
    } else {
        logger.log("debug", "MAIN - rainbow_onready [start    " + countStop + "] :: contacts list empty");
    }
 // */
    //rainbowSDK.stop();
});
rainbowSDK.events.on("rainbow_onstarted", () => {
    // do something when the SDK has been started
    logger.log("debug", "MAIN - rainbow_onstarted - rainbow onstarted");
});
rainbowSDK.events.on("rainbow_oncallupdated", (data) => {
    try {
        if (data.contact) {
            logger.log("debug", "MAIN - rainbow_oncallupdated - rainbow call updated. deviceType : " + data.deviceType + ", State : " + data.status.value + ", displayName : " + data.contact.displayName, data);
        }
        else {
            logger.log("debug", "MAIN - rainbow_oncallupdated - rainbow call updated. deviceType : " + data.deviceType + ", State : " + data.status.value + ", ", data);
        }
    }
    catch (err) {
    }
    saveCall(data);
});
rainbowSDK.events.on("rainbow_onvoicemessageupdated", (data) => {
    logger.log("debug", "MAIN - rainbow_onvoicemessageupdated - rainbow voice message updated.", data);
});
rainbowSDK.events.on("rainbow_onbubbleinvitationreceived", (bubble) => {
    logger.log("debug", "MAIN - rainbow_onbubbleinvitationreceived - rainbow event received.", bubble);
    rainbowSDK.bubbles.acceptInvitationToJoinBubble(bubble).then((updatedBubble) => {
        logger.log("debug", "MAIN - acceptInvitationToJoinBubble - sent.", bubble);
        // Do something once the invitation has been accepted
    }).catch((err) => {
        // Do something in case of error
        logger.log("error", "MAIN - acceptInvitationToJoinBubble - error : ", err);
    });
});
rainbowSDK.events.on("rainbow_onownbubbledeleted", (bubble) => {
    logger.log("debug", "MAIN - rainbow_onownbubbledeleted - rainbow event received.", bubble);
    let bubbles = rainbowSDK.bubbles.getAll();
    logger.log("debug", "MAIN - rainbow_onownbubbledeleted - bubbles.", bubbles);
});
rainbowSDK.events.on("rainbow_onmessagereceiptreceived", (data) => {
    logger.log("debug", "MAIN - rainbow_onmessagereceiptreceived - rainbow event received.", data);
});
rainbowSDK.events.on("rainbow_onchannelmessagereceived", (data) => {
    logger.log("debug", "MAIN - rainbow_onchannelmessagereceived - rainbow event received.", data);
});
rainbowSDK.events.on("rainbow_onchannelcreated", (data) => {
    logger.log("debug", "MAIN - rainbow_onchannelcreated - rainbow event received.", data);
    /*rainbowSDK.channels.deleteChannel(data).then((result2) => {
        logger.log("debug", "MAIN - testcreateChannel deleteChannel result : ", JSON.stringify(result2)); //logger.colors.green(JSON.stringify(result)));

    }); */
    rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net").then((vincent01) => {
        let tab = [vincent01];
        logger.log("debug", "MAIN - rainbow_onchannelcreated rainbowSDK.channels.getAllChannels() result : ", rainbowSDK.channels.getAllChannels());
        rainbowSDK.channels.addMembersToChannel(data, tab).then((chnl) => {
            logger.log("debug", "MAIN - rainbow_onchannelcreated - addMembersToChannel rainbowSDK.channels.getAllChannels() result : ", rainbowSDK.channels.getAllChannels());
            logger.log("debug", "MAIN - rainbow_onchannelcreated addMembersToChannel result : ", chnl);
        });
    });
});
rainbowSDK.events.on("rainbow_onchanneldeleted", (data) => {
    logger.log("debug", "MAIN - rainbow_onchanneldeleted - rainbow event received.", data);
});
rainbowSDK.events.on("rainbow_onuseraddedingroup", (group, contact) => {
    logger.log("debug", "MAIN - rainbow_onuseraddedingroup - rainbow event received. group", group);
    logger.log("debug", "MAIN - rainbow_onuseraddedingroup - rainbow event received. contact", contact);
});
rainbowSDK.events.on("rainbow_oncalllogupdated", (calllogs) => {
    logger.log("debug", "MAIN - rainbow_oncalllogupdated - rainbow event received. ");
    mycalllogs = calllogs;
    if (calllogs) {
        if (calllogs.callLogs) {
            logger.log("debug", "MAIN - rainbow_oncalllogupdated - calllogs.callLogs.length : ", calllogs.callLogs.length);
            calllogs.orderByDateCallLogs.forEach((callL) => {
                logger.log("debug", "MAIN - rainbow_oncalllogupdated - one call logged in calllogs.orderByDateCallLogs : ", ", id : ", callL.id, ", date : ", callL.date);
            });
            // */
        }
    }
    else {
        logger.log("error", "MAIN - rainbow_oncalllogupdated - rainbow event received. empty calllogs", calllogs);
    }
});
rainbowSDK.events.on("rainbow_oncalllogackupdated", (calllogs) => {
    logger.log("debug", "MAIN - rainbow_oncalllogackupdated - rainbow event received. ");
    if (calllogs) {
        if (calllogs.callLogs) {
            logger.log("debug", "MAIN - rainbow_oncalllogackupdated - rainbow event received. calllogs.callLogs.length", calllogs.callLogs.length);
        }
    }
    mycalllogs = calllogs;
});
// Later in the code
rainbowSDK.events.on("rainbow_onmessagereceived", (message) => {
    logger.log("debug", "MAIN - rainbow_onmessagereceived - rainbow event received. message", message);
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
});
rainbowSDK.events.on("rainbow_onmessageserverreceiptreceived", (data) => {
    logger.log("debug", "MAIN - rainbow_onmessageserverreceiptreceived - rainbow event received. data", data);
    /*rainbowSDK.conversations.getConversations().then(() => {
       sdfsdf
    }); // */
    // send manually a 'read' receipt to the sender
    // rainbowSDK.im.markMessageAsRead(data);
});
rainbowSDK.events.on("rainbow_onuserinvitereceived", (data) => __awaiter(void 0, void 0, void 0, function* () {
    logger.log("debug", "MAIN - rainbow_onuserinvitereceived - rainbow event received. data", data);
    let acceptInvitationResult = yield rainbowSDK.contactService.acceptInvitation(data);
    logger.log("debug", "Main - rainbow_onuserinvitereceived, acceptInvitation - result : ", acceptInvitationResult);
}));
rainbowSDK.events.on("rainbow_onfileupdated", (data) => {
    logger.log("debug", "MAIN - rainbow_onfileupdated - rainbow event received. data", data);
    let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId(data.fileid);
    logger.log("debug", "Main - rainbow_onfileupdated, getFileDescriptorFromId - result : ", fileDescriptorsReceived);
    rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceivedOwned) => {
        logger.log("debug", "Main - rainbow_onfileupdated, retrieveFileDescriptorsListPerOwner - result : ", fileDescriptorsReceivedOwned);
        for (let fileReceived of fileDescriptorsReceivedOwned) {
            logger.log("debug", "Main - rainbow_onfileupdated - file - ", fileReceived);
        }
    });
});
rainbowSDK.events.on("rainbow_onfilecreated", (data) => {
    logger.log("debug", "MAIN - rainbow_onfilecreated - rainbow event received. data", data);
    let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId(data.fileid);
    logger.log("debug", "Main - rainbow_onfilecreated, getFileDescriptorFromId - result : ", fileDescriptorsReceived);
});
let countStop = 0;
rainbowSDK.events.on("rainbow_onstopped", (data) => {
    countStop++;
    logger.log("debug", "MAIN - rainbow_onstopped " + countStop + " - rainbow event received. data", data);
    //setTimeout(() => {
    logger.log("debug", "MAIN - rainbow_onstopped rainbow SDK will re start " + countStop + " result : ", data); //logger.colors.green(JSON.stringify(result)));
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

function testremoveAllMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        //let that = this;
        //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
        //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        // Retrieve the associated conversation
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
        let nbMsgToSend = 2;
        let msgsSent = [];
        for (let i = 1; i <= nbMsgToSend; i++) {
            let now = new Date().getTime();
            // Send message
            let msgSent = yield rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            logger.log("debug", "MAIN - testremoveAllMessages - wait for message to be in conversation : ", msgSent);
            yield Utils.until(() => {
                return conversation.getMessageById(msgSent.id) !== undefined;
            }, "Wait for message to be added in conversation num : " + i);
        }
        let conversationWithMessagesRemoved = yield rainbowSDK.conversations.removeAllMessages(conversation);
        logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);
    });
}

function testsendMessageToContact() {
    return __awaiter(this, void 0, void 0, function* () {
        //let that = this;
        //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
        //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
        let contactEmailToSearch = "vincent02@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        // Retrieve the associated conversation
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
        let nbMsgToSend = 2;
        let msgsSent = [];
        for (let i = 1; i <= nbMsgToSend; i++) {
            let now = new Date().getTime();
            // Send message
            let msgSent = yield rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            logger.log("debug", "MAIN - testsendMessageToContact - wait for message to be in conversation : ", msgSent);
            yield Utils.until(() => {
                return conversation.getMessageById(msgSent.id) !== undefined;
            }, "Wait for message to be added in conversation num : " + i);
        }
        // let conversationWithMessagesRemoved = yield rainbowSDK.conversations.removeAllMessages(conversation);
        // logger.log("debug", "MAIN - testsendMessageToContact - conversation with messages removed : ", conversationWithMessagesRemoved);
    });
}

function testsendMessageToConversation() {
    let that = this;
    // let conversation = null;
    let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
    //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
    // Retrieve a contact by its id
    rainbowSDK.contacts.getContactById(contactIdToSearch)
        .then(function(contact) {
        // Retrieve the associated conversation
        return rainbowSDK.conversations.openConversationForContact(contact);
    }).then(function(conversation) {
        // Share the file
        rainbowSDK.im.sendMessageToConversation(conversation, "hello from node", "FR", null, "Le sujet de node").then((result) => {
            logger.log("debug", "MAIN - testHDS sendMessageToConversation - result : ", result);
            logger.log("debug", "MAIN - testHDS sendMessageToConversation - conversation : ", conversation);
        });
    });
}
function testsendMessageToConversation_html() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
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
    });
}
function testSendMessageToJid() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        let contactEmailToSearch = "alice01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJid", contact.jid, "FR", null, "Le sujet de node testSendMessageToJid").then((result) => {
            logger.log("debug", "MAIN - testSendMessageToJid sendMessageToJid - result : ", result);
        });
    });
}
function testsendCorrectedChatMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        //let that = this;
        //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
        //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        // Retrieve the associated conversation
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
        let nbMsgToSend = 2;
        let msgsSent = [];
        for (let i = 1; i <= nbMsgToSend; i++) {
            let now = new Date().getTime();
            // Send message
            let msgSent = yield rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            logger.log("debug", "MAIN - testsendCorrectedChatMessage - wait for message to be in conversation : ", msgSent);
            yield Utils.until(() => {
                return conversation.getMessageById(msgSent.id) !== undefined;
            }, "Wait for message to be added in conversation num : " + i);
        }
        let msgSentOrig = msgsSent.slice(-1)[0];
        let msgStrModified = "modified : " + msgSentOrig.content;
        logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let msgCorrectedSent = yield rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
            });
            logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
        }), 10000);
    });
}
function testsendCorrectedChatMessageForBubble() {
    return __awaiter(this, void 0, void 0, function* () {
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
            let msgSent = yield rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            logger.log("debug", "MAIN - testsendCorrectedChatMessage - wait for message to be in conversation : ", msgSent);
            yield Utils.until(() => {
                return conversation.getMessageById(msgSent.id) !== undefined;
            }, "Wait for message to be added in conversation num : " + i);
        }
        let msgSentOrig = msgsSent.slice(-1)[0];
        let msgStrModified = "modified : " + msgSentOrig.message;
        logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let msgCorrectedSent = yield rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
            });
            logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
        }), 5000);
    });
}
function testsendCorrectedChatMessageForBubbleInExistingConversation() {
    return __awaiter(this, void 0, void 0, function* () {
        //let that = this;
        let bubbleJib = "room_f829530bba37411896022878f81603ca@muc.vberder-all-in-one-dev-1.opentouch.cloud";
        let conversation = rainbowSDK.conversations.getConversationByBubbleJid(bubbleJib);
        yield rainbowSDK.im.getMessagesFromConversation(conversation, 10);
        let msgSentOrig = conversation.getlastEditableMsg();
        let msgStrModified = "modified : " + msgSentOrig.content;
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
            let msgCorrectedSent = yield rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
            });
            logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
        }), 5000);
    });
}


function testSendMultipleMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        //let that = this;
        //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
        //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        // Retrieve the associated conversation
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
        let nbMsgToSend = 100;
        let msgsSent = [];
        for (let i = 1; i <= nbMsgToSend; i++) {
            let now = new Date().getTime();
            let msgstr = "hello num " + i + " from node : " + now;
            // Send message
            logger.log("debug", "MAIN - testSendMultipleMessages - message to be sent in conversation : ", msgstr);
            let msgSent = yield rainbowSDK.im.sendMessageToConversation(conversation, msgstr, "FR", null, "Le sujet de node : " + now).catch((err) => {
                logger.log("internalerror", "MAIN - testSendMultipleMessages - error while sendMessageToConversation : ", err);
            });
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            logger.log("debug", "MAIN - testSendMultipleMessages - wait for message to be in conversation : ", msgSent);
            yield Utils.until(() => {
                return conversation.getMessageById(msgSent.id) !== undefined;
            }, "Wait for message to be added in conversation Msg : " + msgstr);
        }
        //let conversationWithMessagesRemoved = yield rainbowSDK.conversations.removeAllMessages(conversation);
        //logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);
    });
}


function testReconnection() {
    let that = this;
    // let conversation = null;
    let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
    //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
    // Retrieve a contact by its id
    rainbowSDK.contacts.getContactById(contactIdToSearch)
        .then(function(contact) {
        // Retrieve the associated conversation
        return rainbowSDK.conversations.openConversationForContact(contact);
    }).then(function(conversation) {
        // Share the file
        setInterval(() => {
            rainbowSDK.im.sendMessageToConversation(conversation, "hello from node", "FR", null, "Le sujet de node").then((result) => {
                logger.log("debug", "MAIN - testHDS sendMessageToConversation - result : ", result);
            });
        }, 15000);
        /* that.rainbowSDK.fileStorage.getFilesSentInConversation(conversation).then((result) => {
        that.logger.log("debug", "MAIN - testHDS getFilesSentInConversation - result : ", result);
        }); // */
    });
}

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

function testChannelImage() {
    let mychannels = rainbowSDK.channels.getAllOwnedChannel();
    let mychannel = mychannels ? mychannels[0] : null;
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
            let tabImages = [{ "id": result[0].id }];
            rainbowSDK.channels.createItem(mychannel, msg, "title", null, tabImages).then((res) => {
                logger.log("debug", "MAIN - createItem - res : ", res);
            });
        }
    });
}
function testPublishChannel() {
    let mychannels = rainbowSDK.channels.getAllOwnedChannel();
    let mychannel = mychannels ? mychannels[0] : null;
    if (mychannel) {
        for (let i = 0; i < 1; i++) {
            let now = new Date().getTime();
            rainbowSDK.channels.createItem(mychannel, "-- message : " + i + " : " + now, "title", null, null).then((res) => {
                logger.log("debug", "MAIN - createItem - res : ", res);
            });
        }
    }
    else {
        logger.log("debug", "MAIN - createItem - getAllOwnedChannel mychannel is empty, so can not publish.");
    }
}
function testcreateChannel() {
    return __awaiter(this, void 0, void 0, function* () {
        let mychannels = rainbowSDK.channels.getAllOwnedChannel();
        let mychannel = mychannels ? mychannels[0] : null;
        let utc = new Date().toJSON().replace(/-/g, "/");
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        let channelCreated = yield rainbowSDK.channels.createPublicChannel("testchannel" + utc, "test");
        logger.log("debug", "MAIN - testcreateChannel createPublicChannel result : ", channelCreated); //logger.colors.green(JSON.stringify(result)));
        let channelMembersAdded = yield rainbowSDK.channels.addMembersToChannel(channelCreated, [{ "id": contact.id }]);
        logger.log("debug", "MAIN - testcreateChannel - channelMembersAdded : ", channelMembersAdded);
        let channelinfo = yield rainbowSDK.channels.fetchChannel(channelCreated.id);
        logger.log("debug", "MAIN - testcreateChannel - channelinfo : ", channelinfo);
        /*rainbowSDK.channels.createItem(mychannel, "message : " + now, "title", null, tabImages).then((res) => {
            logger.log("debug", "createItem - res : ", res);
        }); // */
    });
}
function testChannelDeleteMessage() {
    let mychannels = rainbowSDK.channels.getAllOwnedChannel();
    let mychannel = mychannels ? mychannels[0] : null;
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
function downloadFile() {
    logger.log("debug", "Main - downloadFile - file - ");
    rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceived) => {
        logger.log("debug", "Main - downloadFile, retrieveFileDescriptorsListPerOwner - result : ", fileDescriptorsReceived);
        for (let fileReceived of fileDescriptorsReceived) {
            logger.log("debug", "Main - downloadFile - file - ", fileReceived);
            rainbowSDK.fileStorage.downloadFile(fileReceived).then((blob) => {
                logger.log("debug", "Main - downloadFile - blob : ", blob.mime);
                fs.writeFile("c:\\temp\\" + fileReceived.fileName, blob.buffer, "binary", function(err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("The file was saved! : " + "c:\\temp\\" + fileReceived.fileName);
                    }
                });
            });
            //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
            //let now = new Date().getTime();
        }
    });
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
    file = { "path": "c:\\temp\\IMG_20131005_173918.jpg", "name": "IMG_20131005_173918.jpg", "type": "image/JPEG", "size": 2960156 };
    logger.log("debug", "MAIN - uploadFileToConversation - file.name : ", file.name, ", file.type : ", file.type, ", file.path : ", file.path, ", file.size : ", file.size);
    rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function(contact) {
        // Retrieve the associated conversation
        return rainbowSDK.conversations.openConversationForContact(contact);
    }).then(function(conversation) {
        // Share the file
        return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
            logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
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
    rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function(contact) {
        // Retrieve the associated conversation
        return rainbowSDK.conversations.openConversationForContact(contact);
    }).then(function(conversation) {
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

function testRetrieveOneFileDescriptor() {
    logger.log("debug", "Main - testRetrieveOneFileDescriptor - file - ");
    let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId("5cab49e3827d70023481c17a");
    logger.log("debug", "Main - testRetrieveOneFileDescriptor, getFileDescriptorFromId - result : ", fileDescriptorsReceived);
    rainbowSDK.fileStorage.retrieveOneFileDescriptor("5cab49e3827d70023481c17a").then((fileDescriptorsReceived) => {
        logger.log("debug", "Main - testRetrieveOneFileDescriptor, retrieveOneFileDescriptor - result : ", fileDescriptorsReceived);
    });
}
function testChannelupdateChannelDescription() {
    let mychannels = rainbowSDK.channels.getAllOwnedChannel();
    let mychannel = mychannels ? mychannels[0] : null;
    let utc = new Date().toJSON().replace(/-/g, "_");
    rainbowSDK.channels.updateChannelDescription(mychannel, "desc_" + utc).then((result) => {
        logger.log("debug", "MAIN - updateChannelDescription - result : ", result);
    }).catch(reason => {
        logger.log("error", "MAIN - updateChannelDescription catch reject - reason : ", reason);
    });
}
function testCreateBubbles() {
    let physician = {
        "name": "",
        "contact": null,
        "loginEmail": "vincent02@vbe.test.openrainbow.net",
//        "loginEmail": "vincent.berder@al-enterprise.com",
        "appointmentRoom": "testBot"
    };


    let botappointment = "vincent01@vbe.test.openrainbow.net";
    rainbowSDK.contacts.getContactByLoginEmail(physician.loginEmail).then(contact => {
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
                        logger.log("debug", "MAIN - rainbow_onbubbleaffiliationchanged - affiliationchanged : ");
                        if (bubbleAffiliated && bubbleAffiliated.users.filter((user) => {
                            let res = false;
                            if (user.userId === contact.id && user.status === "accepted") {
                                res = true;
                            }
                            return res;
                        }).length === 1 ) {
                            let utcMsg = new Date().getTime();
                            let message = "message de test in " + utcMsg;
                            await setTimeoutPromised(2000);
                            await rainbowSDK.im.sendMessageToBubbleJid(message, bubbleAffiliated.jid, "en", { "type": "text/markdown", "message": message }, "subject", undefined);
                        }
                    });

                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async() => {
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

async function testCreate50BubblesAndArchiveThem() {
    let loginEmail = "vincent02@vbe.test.openrainbow.net";
    let appointmentRoom = "testBot";
    //let botappointment = "vincent01@vbe.test.openrainbow.net";
    rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
        if (contact) {
            logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
            for (let i = 0; i < 50; i++) {
                let utc = new Date().toJSON().replace(/-/g, "/");
                await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + i, appointmentRoom + utc + "_" + i).then( async(bubble) => {
                    logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async() => {
                        let message = "message de test";
                        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
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
        }
    }); // */
    //    let utc = new Date().toJSON().replace(/-/g, '/');
}

function testCreateBubblesAndInviteContactsByEmails() {
    let utc = new Date().toJSON().replace(/-/g, "/");
    rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble) => {
        logger.log("debug", "MAIN - [testCreateBubblesAndInviteContactsByEmails    ] :: createBubble request ok", bubble);

        let contacts = [];
        let d = new Date();
        let t = d.getTime();
        let y = Math.round(t);
        contacts.push("invited." + y + ".01@vbe.test.openrainbow.net");
        contacts.push("invited." + y + ".02@vbe.test.openrainbow.net");
        rainbowSDK.bubbles.inviteContactsByEmailsToBubble(contacts, bubble).then(async() => {
            let message = "message de test";
            await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                "type": "text/markdown",
                "message": message
            }, "subject");
        });
    });
    //    let utc = new Date().toJSON().replace(/-/g, '/');
}

function testCreateBubblesOnly() {
    let utc = new Date().toJSON().replace(/-/g, "/");
    rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble) => {
        logger.log("debug", "MAIN - [testCreateBubblesAndInviteContactsByEmails    ] :: createBubble request ok", bubble);
    });
    //    let utc = new Date().toJSON().replace(/-/g, '/');
}

async function testsendMessageToBubbleJid_WithMention() {
    let loginEmail = "vincent02@vbe.test.openrainbow.net";
    let appointmentRoom = "testBot";
    //let botappointment = "vincent01@vbe.test.openrainbow.net";
    rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
        if (contact) {
            logger.log("debug", "MAIN - [testsendMessageToBubbleJid_WithMention    ] :: getContactByLoginEmail contact : ", contact);
            let utc = new Date().toJSON().replace(/-/g, "/");
            await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact , appointmentRoom + utc, true).then(async (bubble) => {
                logger.log("debug", "MAIN - [testsendMessageToBubbleJid_WithMention    ] :: createBubble request ok", bubble);
                rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {
                    let message = "message de test" + " @" + contact.name.value + " ";
                    let mentions = [];

                    mentions.push(contact.jid);

                    await setTimeoutPromised(20000);
                    //mentions
                    await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", undefined, "subject", contact.jid);
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

function testgetContactByLoginEmail() {
    let loginEmail = "vincent++@vbe.test.openrainbow.net";
    rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
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
                }
                else {
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
                "jobTitle": "my job"
            };
            rainbowSDK.admin.updateContactInfos(contact.id, infos).then(result => {
                if (result) {
                    logger.log("debug", "MAIN - [testupdateContactInfos    ] :: updateContactInfos result : ", result);
                }
                else {
                    logger.log("debug", "MAIN - [testupdateContactInfos    ] :: updateContactInfos no infos found");
                }
                rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                    if (contactInfos) {
                        logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                    }
                    else {
                        logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactInfos no infos found");
                    }
                });
            });
        }
    });
}
//This is the event handler to detect change of a contact's presence and output in console contact name and new status
rainbowSDK.events.on("rainbow_oncontactpresencechanged", (contact) => {
    //Presence event handler. Code in between curly brackets will be executed in case of presence change for a contact
    logger.log("debug", "MAIN - Presence status of contact " + contact.displayName + ", changed to " + contact.presence);
    //getLastMessageOfConversation(contact);
});
function getLastMessageOfConversation(contact) {
    let theLastMessageText = null;
    //Request to create new conversation with the contact (in case if it does not exists)
    // or open existing (in case if it already exists)
    rainbowSDK.conversations.openConversationForContact(contact).then(function(conversation) {
        //This line of code will be executed when conversation object of the contact is provided
        //Check value of property conversation.historyComplete
        if (conversation.historyComplete === false) {
            //Retrieve conversation history prior getting last message from conversation history
            getConversationHistory(conversation);
        }
        else {
            //The code below will be executed in case if conversation history in completed.
            //Therefore we can call function to output the last message to console
            PrintTheLastMessage(conversation);
        }
    }).catch(function(err) {
        //Something when wrong with the server. Handle the trouble here
        logger.log("debug", "MAIN - Error occurred in function getLastMessageOfConversation:" + err);
    });
}
function getConversationHistory(conversation) {
    //get messages from conversation. Max number of messages whichcan be retrieved at once is 100
    rainbowSDK.im.getMessagesFromConversation(conversation, 100).then(function(result) {
        logger.log("debug", "MAIN - messages : ", result);
        // The conversation object is updated with the messages retrieved from the server after
        //execution of rainbowSDK.im.getMessagesFromConversation function
        // Check if there are is possibly more messages on the server than 100 requested
        if (conversation.historyComplete === false) {
            // TO DO: get next 100 messages
        }
        else {
            //At that pint conversation object has message history updated.
            //Therefore we can call function to output the last message to console
            PrintTheLastMessage(conversation);
        }
    }).catch(function(err) {
        //Something when wrong with the server. Handle the trouble here
        logger.log("debug", "MAIN - Error in function getConversationHistory: " + err);
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
    }
    else {
        logger.log("debug", "MAIN - There are no messages in the conversation");
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
        let content = { "type": "text/markdown", "message": "**A message** for a _bubble_" + utc };
        let subject = "subject";
        rainbowSDK.im.sendMessageToBubbleJid(message, jid, lang, content, subject).then((result) => {
            logger.log("debug", "MAIN - testBubblesArchived sendMessageToBubbleJid result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
        }).catch((err) => {
            logger.log("error", "MAIN - testBubblesArchived error while sendMessageToBubbleJid result : ", err); //logger.colors.green(JSON.stringify(result)));
        });
    });
}
function testSetBubbleCustomData() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
        let bubble;
        if (activesBubbles && activesBubbles.length > 0) {
            //bubble = Object.assign(new Bubble(), activesBubbles[0]);
            bubble = Bubble_1.Bubble.BubbleFactory()(activesBubbles[0]);
        }
        //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
        logger.log("debug", "MAIN - testSetBubbleCustomData - bubble : ", bubble);
        //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
        let now = new Date().getTime();
        yield rainbowSDK.bubbles.setBubbleCustomData(bubble, { "mypersonnaldata": "valueofmypersonnaldata", "updateDate": now });
        /*    await utils.setTimeoutPromised(3000);

            activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            activesBubbles.forEach( ( bubbleIter )=> {
                if (bubble && bubbleIter && bubbleIter.id === bubble.id) {
                    logger.log("debug", "MAIN - testSetBubbleCustomData, Few seconds after sending the customData bubbleIter : ", bubbleIter);
                }

            });
        // */
        //});
    });
}
function testDeletebubble() {
    return __awaiter(this, void 0, void 0, function* () {
        let bubbleId = "5cde768d424fb13186b9e6d4";
        let bubble = yield rainbowSDK.bubbles.getBubbleById(bubbleId);
        rainbowSDK.bubbles.deleteBubble(bubble);
    });
}
function testDeleteOneCallLog() {
    let mycalllog = mycalllogs ? mycalllogs.callLogs[0] : {};
    let utc = new Date().toJSON().replace(/-/g, "_");
    rainbowSDK.calllog.deleteOneCallLog(mycalllog.id);
}
function testDeleteAllCallLogs() {
    let mycalllog = mycalllogs ? mycalllogs.callLogs[0] : {};
    let utc = new Date().toJSON().replace(/-/g, "_");
    rainbowSDK.calllog.deleteAllCallLogs();
}
function testDeleteCallLogsForContact() {
    return __awaiter(this, void 0, void 0, function* () {
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        let utc = new Date().toJSON().replace(/-/g, "_");
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        let jid = contact.jid_im;
        rainbowSDK.calllog.deleteCallLogsForContact(jid);
    });
}
function testmarkCallLogAsRead() {
    let mycalllog = { "id": null }; //mycalllogs ? mycalllogs.callLogs[0] : {};
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
    }
    else {
        logger.log("debug", "MAIN - testmarkCallLogAsRead mycalllogs is not defined : ", mycalllogs); //logger.colors.green(JSON.stringify(result)));
    }
}
function testmarkAllCallsLogsAsRead() {
    logger.log("debug", "MAIN - testmarkAllCallsLogsAsRead."); //logger.colors.green(JSON.stringify(result)));
    rainbowSDK.calllog.markAllCallsLogsAsRead();
}
function testDeleteServerConversation() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        let utc = new Date().toJSON().replace(/-/g, "_");
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
        if (conversation && conversation.id) {
            let result = yield rainbowSDK.conversations.deleteServerConversation(conversation.dbId);
            logger.log("debug", "MAIN - testDeleteServerConversation deleteServerConversation - result : ", result);
            logger.log("debug", "MAIN - testDeleteServerConversation deleteServerConversation - conversation : ", conversation);
        }
        else {
            logger.log("debug", "MAIN - testDeleteServerConversation conversation empty or no id defined - conversation : ", conversation);
        }
    });
}

function testdeleteAllMessageInOneToOneConversation() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        let utc = new Date().toJSON().replace(/-/g, "_");
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        let conversation = yield rainbowSDK.conversations.openConversationForContact(contact);
        if (conversation && conversation.id) {
            let result = yield rainbowSDK.conversations.deleteAllMessageInOneToOneConversation(conversation);
            logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation deleteAllMessageInOneToOneConversation - result : ", result);
            logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation deleteAllMessageInOneToOneConversation - conversation : ", conversation);
        }
        else {
            logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation conversation empty or no id defined - conversation : ", conversation);
        }
    });
}

function testUploadFileToBubble() {
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
    logger.log("debug", "EngineVincent00 - uploadFileToBubble getAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length : 0);
    if (result.length > 0) {
        let bubble = result[0];
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
    logger.log("debug", "test_refreshMemberAndOrganizerLists - getAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length : 0);
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
    logger.log("debug", "MAIN - testGetUsersFromBubble getAllActiveBubbles - result : ", result, "nb owned bulles : ", result ? result.length : 0);
    if (result.length > 0) {
        let bubble = result[0];
        // Share the file
        return rainbowSDK.bubbles.getUsersFromBubble(bubble, undefined).then((users) => {
            logger.log("debug", "MAIN - testGetUsersFromBubble - users : ", users);
        });
    }
    //});
}

function testjoinContacts_AddContactToRoster() {
    return __awaiter(this, void 0, void 0, function* () {
        let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
        let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
        let utc = new Date().toJSON().replace(/-/g, "_");
        let contactVincent00 = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
        let contactVincent01 = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
        //let jid = contactVincent01.jid_im;
        //  let me = rainbowSDK.contacts.getConnectedUser();
        let tab = [];
        tab.push(contactVincent01.id);
        rainbowSDK.contacts.joinContacts(contactVincent00, tab);
    });
}
function testsendSubscription() {
    return __awaiter(this, void 0, void 0, function* () {
        let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
        let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
        let utc = new Date().toJSON().replace(/-/g, "_");
        let contactVincent00 = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
        let contactVincent01 = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
        //let jid = contactVincent01.jid_im;
        //  let me = rainbowSDK.contacts.getConnectedUser();
        let tab = [];
        tab.push(contactVincent01.id);
        rainbowSDK.contacts.addContact(contactVincent00, tab);
    });
}
function testaddToContactsList() {
    return __awaiter(this, void 0, void 0, function* () {
        let contactEmailToSearchVincent00 = "vincent02@vbe.test.openrainbow.net";
        //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
        let utc = new Date().toJSON().replace(/-/g, "_");
        let contactVincent00 = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
        //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
        //let jid = contactVincent01.jid_im;
        //  let me = rainbowSDK.contacts.getConnectedUser();
        //let tab = [];
        //tab.push(contactVincent01.id);
        yield rainbowSDK.contacts.addToNetwork(contactVincent00);
    });
}
function testupdateChannelAvatar() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function testgetServerFavorites() {
    return __awaiter(this, void 0, void 0, function* () {
        let utc = new Date().toJSON().replace(/-/g, "_");
        let favorites = yield rainbowSDK.favorites.fetchAllFavorites();
        //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
        //let jid = contactVincent01.jid_im;
        //  let me = rainbowSDK.contacts.getConnectedUser();
        //let tab = [];
        //tab.push(contactVincent01.id);
        //await rainbowSDK.contacts.addToNetwork(contactVincent00);
    });
}
function testgetAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        // let utc = new Date().toJSON().replace(/-/g, '_');
        let users = yield rainbowSDK.admin.getAllUsers("small", 2, 5, "firstName");
        logger.log("debug", "MAIN - [testgetAllUsers] after getAllUsers : ", users);
        //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
        //let jid = contactVincent01.jid_im;
        //  let me = rainbowSDK.contacts.getConnectedUser();
        //let tab = [];
        //tab.push(contactVincent01.id);
        //await rainbowSDK.contacts.addToNetwork(contactVincent00);
    });
}
function testmakeCallByPhoneNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        rainbowSDK.telephony.makeCallByPhoneNumber("23050", undefined).then((data1) => {
            //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
            logger.log("debug", "MAIN - [makeCallByPhoneNumber] after makecall : ", data1);
            Utils.setTimeoutPromised(1000).then(() => {
                rainbowSDK.telephony.getCalls().forEach((data2) => {
                    logger.log("debug", "MAIN - [makeCallByPhoneNumber] after makecall getCalls : ", data2);
                });
            });
        }).catch((error) => {
            logger.log("debug", "MAIN - [makeCallByPhoneNumber] error ", error);
        });
        setTimeout(() => {
            logger.log("debug", "MAIN - [makeCallByPhoneNumber] Release all calls, calls size : ", Object.keys(calls).length);
            // Release all calls
            calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                //yield rainbowSDK.telephony.releaseCall(c);
                Utils.setTimeoutPromised(10000).then(() => {
                    logger.log("debug", "MAIN - [makeCallByPhoneNumber] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                    rainbowSDK.telephony.getCalls().forEach((data3) => {
                        logger.log("debug", "MAIN - [makeCallByPhoneNumber] after releaseCall getCalls : ", data3);
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
            calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                yield rainbowSDK.telephony.holdCall(c);
                Utils.setTimeoutPromised(6000).then(async() => {
                    logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                    rainbowSDK.telephony.getCalls().forEach((data3) => {
                        logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after holdCall getCalls : ", data3);
                    });

                    await rainbowSDK.telephony.retrieveCall(c);
                });
            }));
        }, 15000);
        // */
    });
}


function testSendMessageToJidOfMySelf() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        let contactEmailToSearch = options.credentials.login;
        logger.log("debug", "MAIN - testSendMessageToJidOfMySelf contactEmailToSearch : ", contactEmailToSearch);
        // Retrieve a contact by its id
        let contact = yield rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        yield rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJidOfMySelf", contact.jid, "FR", null, "Le sujet de node testSendMessageToJidOfMySelf").then((result) => {
            logger.log("debug", "MAIN - testSendMessageToJidOfMySelf sendMessageToJid - result : ", result);
        }).catch((err) => {
            logger.log("debug", "MAIN - testSendMessageToJidOfMySelf Error : ", err);
        });
    });
}

function  testupdateAvatarForBubble() {
    let result = rainbowSDK.bubbles.getAllOwnedBubbles();
    logger.log("debug", "MAIN - testupdateAvatarForBubble - result : ", result, "nb owned bulles : ", result ? result.length : 0);
    rainbowSDK.bubbles.updateAvatarForBubble("c:\\temp\\IMG_20131005_173918.jpg", result[0]);
}

async function  testgetAvatarFromBubble() {
    let result = rainbowSDK.bubbles.getAllOwnedBubbles();
    logger.log("debug", "MAIN - testgetAvatarFromBubble - result : ", result, "nb owned bulles : ", result ? result.length : 0);
    let avatarBlob = await rainbowSDK.bubbles.getAvatarFromBubble(result[0]);
    logger.log("debug", "MAIN - testgetAvatarFromBubble - avatarBlob : ", avatarBlob);
}

function testmakeCallByPhoneNumberProd() {
    return __awaiter(this, void 0, void 0, function* () {
        rainbowSDK.telephony.makeCallByPhoneNumber("00622413746", "My_correlatorData").then((data1) => {
            //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
            logger.log("debug", "MAIN - [makeCallByPhoneNumber] after makecall : ", data1);
            Utils.setTimeoutPromised(1000).then(() => {
                rainbowSDK.telephony.getCalls().forEach((data2) => {
                    logger.log("debug", "MAIN - [makeCallByPhoneNumber] after makecall getCalls : ", data2);
                });
            });
        }).catch((error) => {
            logger.log("debug", "MAIN - [makeCallByPhoneNumber] error ", error);
        });
        setInterval(() => {
            logger.log("debug", "MAIN - [makeCallByPhoneNumber] Release all calls, calls size : ", Object.keys(calls).length);
            // Release all calls
            calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                //yield rainbowSDK.telephony.releaseCall(c);
                Utils.setTimeoutPromised(10000).then(() => {
                    logger.log("debug", "MAIN - [makeCallByPhoneNumber] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                    rainbowSDK.telephony.getCalls().forEach((data3) => {
                        logger.log("debug", "MAIN - [makeCallByPhoneNumber] after releaseCall getCalls : ", data3);
                    });
                });
            }));
        }, 10000);
        // */
    });
}

async function testcreateGuestUserError() {
    let firstname = "firstname_";
    let lastname = "lastname_";
    for (let iter = 0; iter < 1; iter++) {
        let firstnameTemp = firstname + iter;
        let lastnameTemp = lastname + iter;
        await rainbowSDK.admin.createGuestUser(firstnameTemp, lastnameTemp, "fr", 10).catch((err) => {
            logger.log("debug", "MAIN - (testcreateGuestUserError) error while creating guest user :  ", err);
        });
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
            if (answers.cmd === "by") {
                logger.log("debug", "MAIN - exit."); //logger.colors.green(JSON.stringify(result)));
                rainbowSDK.stop().then(() => { process.exit(0); });
            }
            logger.log("debug", "MAIN - run cmd : ", answers.cmd); //logger.colors.green(JSON.stringify(result)));
            eval(answers.cmd);
            commandLineInteraction();
        }
        catch (e) {
            logger.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));
            commandLineInteraction();
        }
    });
}

//let startDate = new Date();
//let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1YmJkYzMzNzJjZjQ5NmMwN2RkODkxMjEiLCJsb2dpbkVtYWlsIjoidmluY2VudDAwQHZiZS50ZXN0Lm9wZW5yYWluYm93Lm5ldCJ9LCJhcHAiOnsiaWQiOiIyNzAzM2IxMDAxYmQxMWU4ODQzZDZmMDAxMzRlNTE4OSIsIm5hbWUiOiJSYWluYm93IG9mZmljaWFsIFdlYiBhcHBsaWNhdGlvbiJ9LCJpYXQiOjE1NzU0NjIyOTMsImV4cCI6MTU3Njc1ODI5M30.MA71vA1SDjf-PqYtrBnpEsPai1G4LvVFHFqolsQ6Dv3NukRpbHusEgyICvtBt0t9vJ3iuzupN-ltbrj1feSBR7VnGUf2i0QNXWRCSbOgHugQAKyRZTKt9lKphaYtEEJMjHrl7k8XO6E7E1nFLFWIgJw8pNbKSmJ84rCP-wyH6kh5N7ev10XBaZsC0kdDSgFH8M2T72xgc4gtLua5BIK8Oj6qdbpHSODaLptI7ehYdbU-Mw8ECZ_VFj8Cs6lfbQWOYKgHojkoLHakDf_6oVA40YarJZunYEasuuHKL5qiZJHGkgXHBxBUBGJbbDXu_DOkTognKMPSkAXjfnLmbk0kxw';
//let token = 'sdfsqfsqfsdfsdfgdf';
let token;
try {
    logger.log("debug", "MAIN - rainbow SDK token decoded : ", jwt(token));
} catch (err) {
    logger.log("error", "MAIN - rainbow SDK token decoded error : ", token);
}

rainbowSDK.start(token).then(async(result) => {
    try {
        // Do something when the SDK is started
        logger.log("debug", "MAIN - rainbow SDK started result 1 : ", logger.colors.green(result)); //logger.colors.green(JSON.stringify(result)));

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
    }
    catch (err) {
        console.log("MAIN - Error during starting : " + util.inspect(err));
    }
}).catch((err) => {
    console.log("MAIN - Error during starting : " + util.inspect(err));
}); // */

})();
