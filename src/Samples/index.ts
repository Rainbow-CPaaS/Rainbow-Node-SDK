"use strict";
import {NodeSDK as RainbowSDK, LogLevelAreas} from "../index";
/*
 * @name index.ts
 *
 * @description :
 * The index.ts file is not a "best practice", but it is a file used by developper to test/validate the SDK, so you can find in it some help.
 *
 */
import {
    pause,
    setTimeoutPromised,
    until,
    getRandomInt,
    addPropertyToObj,
    generateRamdomEmail,
    functionName,
    makeId,
    Deferred,
    msToTime,
    flattenObject,
    getJsonFromXML,
    isString,
    findAllPropInJSONByPropertyNameByXmlNS,
    findAllPropInJSONByPropertyName,
    getTextFromJSONProperty,
    writeArrayToFile,
    readArrayFromFile, addParamToUrl, getStoreStanzaValue
} from "../lib/common/Utils";
import {XMPPUTils} from "../lib/common/XMPPUtils";
import {TimeOutManager} from "../lib/common/TimeOutManager";
import set = Reflect.set;
import {url} from "inspector";
import {AdminService, OFFERTYPES} from "../lib/services/AdminService";
import {Conversation, MessagesQueue} from "../lib/common/models/Conversation";
import {createWriteStream, readFileSync, writeFileSync, appendFileSync} from "fs";
import {SDKSTATUSENUM} from "../lib/common/StateManager";
import {AlertFilter} from "../lib/common/models/AlertFilter";
import {List} from "ts-generic-collections-linq";
import {AlertTemplate} from "../lib/common/models/AlertTemplate";
import {Alert} from "../lib/common/models/Alert";
import {AlertDevice, AlertDevicesData} from "../lib/common/models/AlertDevice";
import {Contact} from "../lib/common/models/Contact";
import {ConferenceSession} from "../lib/common/models/ConferenceSession";
import {DataStoreType} from "../lib/config/config";
import {FileUpdated} from "../lib/services/FileStorageService";
import {Server as MockServer, WebSocket as WS} from 'mock-socket';
import {v4 as uuidv4} from 'uuid';
import { ParsedResult } from 'xml2js';

const xml = require("@xmpp/xml");
const xmppUtils = XMPPUTils.getXMPPUtils();
import moment from 'moment';
//const moment = global.get('moment');
import serialize from 'safe-stable-stringify' ;
//const serialize = global.get('safestablestringify');
import * as ACData from "adaptivecards-templating";
//const ACData = global.get('adaptivecardstemplating');
import * as path from "path";

const prettydata = require("../lib/connection/pretty-data").pd;
import mime from 'mime';

import * as nock from 'nock'

import * as ini from 'ini';
//const ini = require('ini')

//const MockServer = require("mock-socket").Server;
//const WS = require("mock-socket").WebSocket;

// global.it = () => {return true};

import { readFile } from 'fs/promises';

const Element = require('ltx').Element;
const express = require( "express" );

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
import Bubble_1, {getBubbleLogInfos} from "../lib/common/models/Bubble";
import * as Utils from "../lib/common/Utils";
import fs = require("fs");
//import fileapi from "file-api";
//let fileapi = require('file-api');
import {inspect, toUSVString} from "util";

//const inquirer = require("inquirer");
import inquirer from "inquirer";
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { search, Separator } from '@inquirer/prompts';
import figures from '@inquirer/figures'
import chalk from 'chalk'

import * as util from "util";
import {Message} from "../lib/common/models/Message.js";
import {catchError} from "rxjs";
import {NameSpacesLabels} from "../lib/connection/XMPPService.js";
import {jwtDecode} from "jwt-decode";
import {LEVELSNAMES} from "../lib/common/LevelLogs.js";
import {TaskInput} from "../lib/services/TasksService.js";
import {Task} from "../lib/common/models/Task.js";
import * as v8 from "v8";
import {tmpdir} from "node:os";
/*const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}); // */

//let rainbowMode = "s2s" ;
let rainbowMode = "xmpp";

let ngrok = require('ngrok');
//import ngrok from 'ngrok';

const Fs = require('@supercharge/fs') ;
const sp = require('synchronized-promise');
//const {tmpdir} = require("node:os");
async function tempDirEncapse() {
    return new Promise(async function internal_tempDirEncapse (resolve, reject) {
        return await Fs.mkdtemp(path.join(tmpdir(), "Ale-Rainbow-Node-SDK-" + makeId(10)) + "-", async function cb (err, folder) {
            //if (err) return await Fs.tempDir();
            console.log("creating temp dir : " + folder);
            // Prints: /tmp/foo-itXde2
            if (err) {
                console.log("Error while creating temp dir : " + folder, ", error : ", err);
                return resolve(await Fs.tempDir());
            }
            resolve(""+folder);
            /*
            setTimeout(function () {
                console.log("settimeout : " + folder);
                resolve(""+folder);
            }, 2000); // */
        });
    });
}

/* tempDirEncapse().then(()=> {
     console.log("done");
 }).catch (()=>{
     console.log("failed");
     }
 )
 // */

const createTempDirSync = sp(tempDirEncapse, {
    // Function call timeouts
    timeouts: 2 * 1000 * 60,
    // deasync tick, default to 100
    tick: 100
}); // performs the 'synchronized version'
// /var/folders/71/lxgy9vm54fb7tjcwr55mwccr0000gn/T/1b114e534d3ff95ea5951bb3db5c1cb3

const tempDirToSaveLogs = createTempDirSync();
// */

let urlS2S;
let portS2S = 4000 ;
let expressEngine = undefined;

(async function () {
    if (rainbowMode==="s2s") {
        console.log("MAIN - S2S Mode, with ngrock.");
        portS2S = 4001 + Math.round(Math.random() * 1000);
        urlS2S = await ngrok.connect(portS2S).catch((error) => {
            console.log("MAIN - ngrock, error : ", error);
            process.exit(0);
        });
        console.log("MAIN - ngrock, urlS2S : ", urlS2S, ", portS2S : ", portS2S);
        expressEngine = express();
        expressEngine.use(express.json());
        expressEngine.listen(portS2S, function () {
            console.log("MAIN - Server is running on " + portS2S + " port");
        });

    } else {
        console.log("MAIN - XMPP Mode.");
    }

  //  const tempDirToSaveLogs = "c:\\temp";

    let logLevelAreas = new LogLevelAreas();
    /*
    logLevelAreas.showAllLogs();
    logLevelAreas.showServicesApiLogs();
    logLevelAreas.showRESTLogs();
    logLevelAreas.showEventsLogs();
    logLevelAreas.showServicesLogs();
    logLevelAreas.showBubblesLogs();
    // */
    logLevelAreas.admin.api = true;
    logLevelAreas.admin.level = LEVELSNAMES.ERROR;
    logLevelAreas.alerts.api = true;
    logLevelAreas.alerts.level = LEVELSNAMES.ERROR;
    logLevelAreas.bubbles.api = true;
    logLevelAreas.bubbles.level = LEVELSNAMES.ERROR;
    logLevelAreas.calllog.api = true;
    logLevelAreas.calllog.level = LEVELSNAMES.ERROR;
    logLevelAreas.channels.api = true;
    logLevelAreas.channels.level = LEVELSNAMES.ERROR;
    logLevelAreas.connectedUser.api = true;
    logLevelAreas.connectedUser.level = LEVELSNAMES.ERROR;
    logLevelAreas.contacts.api = true;
    logLevelAreas.contacts.level = LEVELSNAMES.ERROR;
    logLevelAreas.conversations.api = true;
    logLevelAreas.conversations.level = LEVELSNAMES.ERROR;
    logLevelAreas.events.api = true;
    logLevelAreas.events.level = LEVELSNAMES.ERROR;
    logLevelAreas.favorites.api = true;
    logLevelAreas.favorites.level = LEVELSNAMES.ERROR;
    logLevelAreas.fileServer.api = true;
    logLevelAreas.fileServer.level = LEVELSNAMES.ERROR;
    logLevelAreas.fileStorage.api = true;
    logLevelAreas.fileStorage.level = LEVELSNAMES.ERROR;
    logLevelAreas.groups.api = true;
    logLevelAreas.groups.level = LEVELSNAMES.ERROR;
    logLevelAreas.httpoverxmpp.api = true;
    logLevelAreas.httpoverxmpp.level = LEVELSNAMES.ERROR;
    logLevelAreas.ims.api = true;
    logLevelAreas.ims.level = LEVELSNAMES.ERROR;
    logLevelAreas.invitations.api = true;
    logLevelAreas.invitations.level = LEVELSNAMES.ERROR;
    logLevelAreas.presence.api = true;
    logLevelAreas.presence.level = LEVELSNAMES.ERROR;
    logLevelAreas.profiles.api = true;
    logLevelAreas.profiles.level = LEVELSNAMES.ERROR;
    logLevelAreas.rbvoice.api = true;
    logLevelAreas.rbvoice.level = LEVELSNAMES.ERROR;
    logLevelAreas.rpcoverxmpp.api = true;
    logLevelAreas.rpcoverxmpp.level = LEVELSNAMES.ERROR;
    logLevelAreas.s2s.api = true;
    logLevelAreas.s2s.level = LEVELSNAMES.ERROR;
    logLevelAreas.settings.api = true;
    logLevelAreas.settings.level = LEVELSNAMES.ERROR;
    logLevelAreas.tasks.api = true;
    logLevelAreas.tasks.level = LEVELSNAMES.ERROR;
    logLevelAreas.telephony.api = true;
    logLevelAreas.telephony.level = LEVELSNAMES.ERROR;
    logLevelAreas.version.api = true;
    logLevelAreas.version.level = LEVELSNAMES.ERROR;
    logLevelAreas.webinars.api = true;
    logLevelAreas.webinars.level = LEVELSNAMES.ERROR;
    logLevelAreas.core.level = LEVELSNAMES.ERROR;
    logLevelAreas.bubblesmanager.level = LEVELSNAMES.ERROR;
    logLevelAreas.httpmanager.level = LEVELSNAMES.ERROR;
    logLevelAreas.httpservice.level = LEVELSNAMES.ERROR;
    logLevelAreas.rest.level = LEVELSNAMES.ERROR;
    logLevelAreas.resttelephony.level = LEVELSNAMES.ERROR;
    logLevelAreas.restconferencev2.level = LEVELSNAMES.ERROR;
    logLevelAreas.restwebinar.level = LEVELSNAMES.ERROR;
    logLevelAreas.xmpp.level = LEVELSNAMES.ERROR;
    logLevelAreas.xmpp.xmppin
    logLevelAreas.xmpp.xmppout
    logLevelAreas.s2sevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.rbvoiceevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.alertevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.calllogevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.channelevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.conversationevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.conversationhistory.level = LEVELSNAMES.ERROR;
    logLevelAreas.favoriteevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.httpoverxmppevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.invitationevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.iqevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.presenceevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.rpcoverxmppevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.tasksevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.telephonyevent.level = LEVELSNAMES.ERROR;
    logLevelAreas.webinarevent.level = LEVELSNAMES.ERROR;

    logLevelAreas.showRESTLogs(LEVELSNAMES.INTERNAL);
    logLevelAreas.showEventsLogs();
    // logLevelAreas.showServicesLogs();
    logLevelAreas.hideServicesApiLogs();
/*
    logLevelAreas.tasks.api = true;
    logLevelAreas.tasks.level = LEVELSNAMES.INTERNAL;
    logLevelAreas.tasksevent.level = LEVELSNAMES.INTERNAL;
*/

    logLevelAreas.conversations.api = true;
    logLevelAreas.conversations.level = LEVELSNAMES.INTERNAL;
    logLevelAreas.conversationevent.level = LEVELSNAMES.INTERNAL;
    logLevelAreas.conversationhistory.level = LEVELSNAMES.INTERNAL;
    // */

    //logLevelAreas.bubblesmanager.level = LEVELSNAMES.INTERNAL;

    logLevelAreas.fileServer.api = true;
    logLevelAreas.fileServer.level = LEVELSNAMES.INTERNAL;
    logLevelAreas.fileStorage.api = true;
    logLevelAreas.fileStorage.level = LEVELSNAMES.INTERNAL;

    logLevelAreas.xmpp.level = LEVELSNAMES.INTERNAL;
    logLevelAreas.xmpp.xmppin
    logLevelAreas.xmpp.xmppout

    if (rainbowMode === "s2s") {
        logLevelAreas.s2s.api = true;
        logLevelAreas.s2s.level = LEVELSNAMES.INTERNAL;
        logLevelAreas.s2sevent.level = LEVELSNAMES.INTERNAL;

        logLevelAreas.presence.api = true;
        logLevelAreas.presence.level = LEVELSNAMES.INTERNAL;
    }

    logLevelAreas.bubblesmanager.level = LEVELSNAMES.INTERNAL;
    logLevelAreas.bubbles.api = true;
    logLevelAreas.bubbles.level = LEVELSNAMES.INTERNAL;

// */
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
            "timeBetweenXmppRequests": "0",
            "raiseLowLevelXmppInEvent": false,
            "raiseLowLevelXmppOutReq": false,
            "maxIdleTimer": 16000,
            "maxPingAnswerTimer": 11000,
//            "xmppRessourceName": "vnagw",
            "maxPendingAsyncLockXmppQueue": 10000
        },
        "s2s": {
            "hostCallback": urlS2S,
            //"hostCallback": "http://70a0ee9d.ngrok.io",
            "locallistenningport": portS2S,
            "expressEngine": expressEngine
        },
        "rest": {
            "useRestAtStartup": true,
            "useGotLibForHttp": false,
             "gotOptions": {
                 agentOptions: {
                     /**
                      * Keep sockets around in a pool to be used by other requests in the future. Default = false
                      */
                     keepAlive: true, // ?: boolean | undefined;
                     /**
                      * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
                      * Only relevant if keepAlive is set to true.
                      */
                     keepAliveMsecs: 4302, // ?: number | undefined;
                     /**
                      * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
                      */
                     maxSockets: Infinity, // ?: number | undefined;
                     /**
                      * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
                      */
                     maxTotalSockets: Infinity, // ?: number | undefined;
                     /**
                      * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
                      */
                     maxFreeSockets: 1002, // ?: number | undefined;
                     /**
                      * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
                      */
                     timeout: 120002, // ?: number | undefined;
                     /**
                      * If not false, the server certificate is verified against the list of supplied CAs. Default: true.
                      */
                     rejectUnauthorized: false
                 },
                 gotRequestOptions: {
                     timeout: { // This object describes the maximum allowed time for particular events.
                         lookup: 5252, // lookup: 100, Starts when a socket is assigned.  Ends when the hostname has been resolved.
                         connect: 10252, // connect: 50, Starts when lookup completes.  Ends when the socket is fully connected.
                         secureConnect: 10252, // secureConnect: 50, Starts when connect completes. Ends when the handshake process completes.
                         socket: 120002, // socket: 1000, Starts when the socket is connected. Resets when new data is transferred.
                         send: 120002, // send: 10000, // Starts when the socket is connected. Ends when all data have been written to the socket.
                         response: 120002 // response: 1000 // Starts when request has been flushed. Ends when the headers are received.
                     }
                 } // */
            }
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
            //user: "",
            //password: "",
            //secureProtocol: "SSLv3_method"
        }, // */
        // Logs options
        "logs": {
            "enableConsoleLogs": true,
            "enableFileLogs": true,
            "enableEventsLogs": false,
            "enableEncryptedLogs": false,
            "color": true,
            //"level": "error",
            //"level": "info",
            //"level": "internal",
            //"level": "internal",
            "level": "debug",
            "customLabel": "RainbowSample",
            "system-dev": {
                "internals": true,
                "http": true,
            },
            "filter": "",
            "areas": logLevelAreas,
            /*,
            "areas" : {
                "admin": {
                    "category": "services",
                    "api": true,
                    "level": "debug"
                },
                "alerts": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "bubbles": {
                    "category": "services",
                    "api": false,
                    "level": "debug"
                },
                "calllog": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "channels": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "connectedUser": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "contacts": {
                    "category": "services",
                    "api": false,
                    "level": "error"
                },
                "conversations": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "events": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "favorites": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "fileServer": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "fileStorage": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "groups": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "httpoverxmpp": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "im": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "invitations": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "presence": {
                    "category": "services",
                    "api": true,
                    "level": "debug"
                },
                "profiles": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "rbvoice": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "rpcoverxmpp": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "s2s": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "settings": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "tasks": {
                    "category": "services",
                    "api": true,
                    "level": "debug"
                },
                "telephony": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "version": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                "webinars": {
                    "category": "services",
                    "api": true,
                    "level": "error"
                },
                'core': {
                    "category": "lawlayer",
                    "level": "debug"
                },
                'bubblesmanager': {
                    "category": "lawlayer",
                    "level": "error"
                },
                'httpmanager': {
                    "category": "lawlayer",
                    "level": "error"
                },
                'httpservice': {
                    "category": "lawlayer",
                    "level": "http"
                },
                'rest': {
                    "category": "lawlayer",
                    "level": "debug"
                },
                'resttelephony': {
                    "category": "lawlayer",
                    "level": "error"
                },
                'restconferencev2': {
                    "category": "lawlayer",
                    "level": "error"
                },
                'restwebinar': {
                    "category": "lawlayer",
                    "level": "error"
                },
                'xmpp': {
                    "category": "lawlayer",
                    "level": "error",
                    "xmppin": true,
                    "xmppout": true
                },
                's2sevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'rbvoiceevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'alertevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'calllogevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'channelevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'conversationevent': {
                    "category": "eventHandlers",
                    "level": "debug"
                },
                'conversationhistory': {
                    "category": "eventHandlers",
                    "level": "debug"
                },
                'favoriteevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'httpoverxmppevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'invitationevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'iqevent': {
                    "category": "eventHandlers",
                    "level": "debug"
                },
                'presenceevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'rpcoverxmppevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'telephonyevent': {
                    "category": "eventHandlers",
                    "level": "error"
                },
                'webinarevent': {
                    "level": "error"
                },
            },// */
            "file": {
                "path": tempDirToSaveLogs,
                "customFileName": "R-SDK-Node-Sample-" + Math.floor(Math.random() * 1000),
                //"level": 'info',                    // Default log level used
                "zippedArchive": false,
                "maxSize": '500m',
                "maxFiles": 5 // */
            }
        },
        "testOutdatedVersion": true,
        "testDNSentry": true,
        "httpoverxmppserver": true,
        "intervalBetweenCleanMemoryCache": 1000 * 60 * 60 * 6, // Every 6 hours.
        "requestsRate": {
            "useRequestRateLimiter": true,
            "maxReqByIntervalForRequestRate": 1250, // nb requests during the interval.
            "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit.
            "timeoutRequestForRequestRate": 600 // nb seconds Request stay in queue before being rejected if queue is full.
        },
        "autoReconnectIgnoreErrors": false,
        // IM options
        "im": {
            "sendReadReceipt": true,
//            "messageMaxLength": 1024,
            "sendMessageToConnectedUser": false,
            "conversationsRetrievedFormat": "full",
            "storeMessages": false,
            "copyMessage": true,
            "nbMaxConversations": 15,
            "rateLimitPerHour": 100000,
//        "messagesDataStore": DataStoreType.NoStore,
            "messagesDataStore": DataStoreType.StoreTwinSide,
//            "messagesDataStore": DataStoreType.NoPermanentStore,
            "autoInitialGetBubbles": true,
            "autoInitialBubblePresence": true,
            "maxBubbleJoinInProgress": 10,
            "autoInitialBubbleFormat": "full",
            "autoInitialBubbleUnsubscribed": true,
            //"autoLoadConversations": true,
            // "autoInitialBubblePresence": false,
            "autoLoadConversations": true,
            "autoLoadConversationHistory": false,
            "autoLoadContacts": true,
            "autoLoadCallLog": false,
            "enableCarbon": true,
            "enablesendurgentpushmessages": true,
            //"useMessageEditionAndDeletionV2": false
            "storeMessagesInConversation": true,
            "maxMessagesStoredInConversation" : 830
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

    console.log("UUID:" + String(uuidv4()).toUpperCase());

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

    let _logger = rainbowSDK._core._logger;
    let calls = [];
    let mycalllogs = {
        "callLogs": null,
        "simplifiedCallLogs": null
    };

    _logger.log("debug", "MAIN - rainbow SDK created with options : ", rainbowSDK.option);

    function saveCall(call) {
        if (!calls[call.id]) {
            calls[call.id] = call;
        }
    }

// Start the SDK
//rainbowSDK.start();
    rainbowSDK.events.onLog("debug", (log) => {
        console.log(_logger.colors.green("MAIN - Log : ") + log);
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
        _logger.log("debug", "MAIN - (rainbow_onxmmpeventreceived) - rainbow xmpp event received : ", _logger.colors.cyan(...argv));
        if (fileLogXmpp) fs.writeSync(fileLogXmpp, "in: " + _logger.colors.red(argv[0]) + "\n");
    });

    rainbowSDK.events.on("rainbow_onxmmprequestsent", (...argv) => {
        // do something when the SDK is ready to be used
        _logger.log("debug", "MAIN - (rainbow_onxmmprequestsent) - rainbow xmpp request sent : ", _logger.colors.yellow(...argv));
        if (fileLogXmpp) fs.writeSync(fileLogXmpp, "out: " + _logger.colors.green(argv[0]) + "\n");
    });

    let GROUP_NAME = "Services";

    const displayGroup = async () => {
        //let groups = rainbowSDK.groups.getAll();
        //let group = groups.find(group => group.name === GROUP_NAME);
        let group = await rainbowSDK.groups.getGroupByName(GROUP_NAME, true)
        _logger.log("debug", "MAIN - group.length : ", group.length, ", group : ", group);
        let users = group.users.map(user => user.id)
        _logger.log("debug", "MAIN - users.length : ", users.length, ", users : ", users);
    }

    rainbowSDK.events.on("rainbow_onready", () => {
        // do something when the SDK is ready to be used
        _logger.log("debug", "MAIN - (rainbow_onready) - rainbow onready");
        /*let contacts = rainbowSDK.contacts.getAll().filter(contact => contact.roster);
        console.log("Contacts : ",contacts.length);
        contacts.forEach(contact => {
            console.log(contact.displayName, " - ",contact.presence, " - ",contact.id);
        }) // */

        let list = rainbowSDK.contacts.getAll().filter(contact => contact.roster);
        if (list) {
            list.forEach((contact) => {
                _logger.log("debug", "MAIN - (rainbow_onready) contact.displayName : ", contact.displayName, " - ", contact.presence, " - ", contact.id, " - ", contact.loginEmail);
            });
        } else {
            _logger.log("debug", "MAIN - (rainbow_onready) [start    " + countStop + "] :: contacts list empty");
        }
        // */
        //rainbowSDK.stop();
        _logger.log("debug", "MAIN - Rainbow ready ", rainbowSDK.version);

        let contacts = rainbowSDK.contacts.getAll();
        _logger.log("debug", "MAIN - Contacts : ", contacts.length);
        contacts.forEach(contact => {
            console.log(contact.displayName, " - ", contact.presence, " - ", contact.id, " - ", contact.jid);
            console.log("Emails ", contact.emails);
            console.log("Email pro", contact.emailPro);
        })

        // setInterval(() => {displayGroup();} , 10000);

        _logger.log("debug", "MAIN - ----------------------------------------------------");
    });
    rainbowSDK.events.on("rainbow_onconnectionerror", () => {
        // do something when the SDK has been started
        _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
    });
    rainbowSDK.events.on("rainbow_onstarted", () => {

        // do something when the SDK has been started
        _logger.log("debug", "MAIN - (rainbow_onstarted) - rainbow onstarted");
    });
    rainbowSDK.events.on("rainbow_oncallupdated", (data) => {
        try {
            if (data.contact) {
                _logger.log("debug", "MAIN - (rainbow_oncallupdated) - rainbow call updated. deviceType : " + data.deviceType + ", State : " + data.status.value + ", displayName : " + data.contact.displayName, data);
            } else {
                _logger.log("debug", "MAIN - (rainbow_oncallupdated) - rainbow call updated. deviceType : " + data.deviceType + ", State : " + data.status.value + ", ", data);
            }
        } catch (err) {
        }
        saveCall(data);
    });
    rainbowSDK.events.on("rainbow_onvoicemessageupdated", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onvoicemessageupdated) - rainbow voice message updated.", data);
    });

    rainbowSDK.events.on("rainbow_on429BackoffError", (data) => {
        _logger.log("debug", "MAIN - (rainbow_on429BackoffError) - rainbow http code 429 raised, backoff.", data);
    });

    rainbowSDK.events.on("rainbow_onbubblepresencechanged", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onbubblepresencechanged) - rainbow bubble presence, nameForLogs : ", data.nameForLogs, ", status :", data.status,", id :", data.id, ", name : ", data.name);
    });

    rainbowSDK.events.on("rainbow_onchatstate", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onchatstate) - data : ", data);
    });

    let bubbleInvitationReceived = null;
    rainbowSDK.events.on("rainbow_onbubbleinvitationreceived", async (bubble) => {
        _logger.log("debug", "MAIN - (rainbow_onbubbleinvitationreceived) - rainbow event received.", bubble);
        bubbleInvitationReceived = bubble;

        let utc = new Date().toJSON().replace(/-/g, "/");
        _logger.log("debug", "MAIN - [rainbow_onbubbleinvitationreceived    ] :: bubble : ", bubble);
        let message = "message de test : " + utc;
        await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", undefined, "subject", undefined, "middle");
        /* await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
            "type": "text/markdown",
            "message": message
        }, "subject", undefined, "middle"); // */
    });

    rainbowSDK.events.on("rainbow_onbubbleconferenceupdated", (conference: ConferenceSession) => {
        _logger.log("debug", "MAIN - (rainbow_onbubbleconferenceupdated) - rainbow event received.", conference);
    });

    rainbowSDK.events.on("rainbow_onbubbleprivilegechanged", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onbubbleprivilegechanged) - rainbow bubble privilege, getBubbleLogInfos : ", data.bubble.getBubbleLogInfos(),", members : ", data.bubble.members, ", privilege :", data.privilege);
    });

    function acceptReceivedInvitation() {
        if (bubbleInvitationReceived) {
            rainbowSDK.bubbles.acceptInvitationToJoinBubble(bubbleInvitationReceived).then((updatedBubble) => {
                _logger.log("debug", "MAIN - acceptInvitationToJoinBubble - sent : ", bubbleInvitationReceived, " : ", updatedBubble);
                // Do something once the invitation has been accepted
            }).catch((err) => {
                // Do something in case of error
                _logger.log("error", "MAIN - acceptInvitationToJoinBubble - error : ", err);
            });
        }
    }

    rainbowSDK.events.on("rainbow_onownbubbledeleted", (bubble) => {
        _logger.log("debug", "MAIN - (rainbow_onownbubbledeleted) - rainbow event received.", bubble);
        let bubbles = rainbowSDK.bubbles.getAll();
        _logger.log("debug", "MAIN - (rainbow_onownbubbledeleted) - bubbles.", bubbles);
    });
    rainbowSDK.events.on("rainbow_onmessagereceiptreceived", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onmessagereceiptreceived) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onchannelmessagereceived", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onchannelmessagereceived) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onbubbleownaffiliationchanged", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onbubbleownaffiliationchanged) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onchannelcreated", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onchannelcreated) - rainbow event received.", data);
        /*rainbowSDK.channels.deleteChannel(data).then((result2) => {
           _logger.log("debug", "MAIN - testcreateChannel deleteChannel result : ", JSON.stringify(result2)); //logger.colors.green(JSON.stringify(result)));

        }); */
        rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net").then((vincent01) => {
            let tab = [vincent01];
            _logger.log("debug", "MAIN - (rainbow_onchannelcreated) rainbowSDK.channels.getAllChannels() result : ", rainbowSDK.channels.getAllChannels());
            rainbowSDK.channels.addMembersToChannel(data, tab).then((chnl) => {
                _logger.log("debug", "MAIN - rainbow_onchannelcreated - addMembersToChannel rainbowSDK.channels.getAllChannels() result : ", rainbowSDK.channels.getAllChannels());
                _logger.log("debug", "MAIN - rainbow_onchannelcreated addMembersToChannel result : ", chnl);
            });
        });
    });
    rainbowSDK.events.on("rainbow_onchanneldeleted", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onchanneldeleted) - rainbow event received.", data);
    });
    rainbowSDK.events.on("rainbow_onuseraddedingroup", (group, contact) => {
        _logger.log("debug", "MAIN - (rainbow_onuseraddedingroup) - rainbow event received. group", group);
        _logger.log("debug", "MAIN - (rainbow_onuseraddedingroup) - rainbow event received. contact", contact);
    });
    rainbowSDK.events.on("rainbow_oncalllogupdated", (calllogs) => {
        _logger.log("debug", "MAIN - (rainbow_oncalllogupdated) - rainbow event received. ");
        mycalllogs = calllogs;
        if (calllogs) {
            if (calllogs.callLogs) {
                _logger.log("debug", "MAIN - (rainbow_oncalllogupdated) - calllogs.callLogs.length : ", calllogs.callLogs.length);
                calllogs.orderByDateCallLogs.forEach((callL) => {
                    _logger.log("debug", "MAIN - (rainbow_oncalllogupdated) - one call logged in calllogs.orderByDateCallLogs : ", ", id : ", callL.id, ", date : ", callL.date);
                });
                // */
            }
        } else {
            _logger.log("error", "MAIN - (rainbow_oncalllogupdated) - rainbow event received. empty calllogs", calllogs);
        }
    });
    rainbowSDK.events.on("rainbow_oncalllogackupdated", (calllogs) => {
        _logger.log("debug", "MAIN - (rainbow_oncalllogackupdated) - rainbow event received. ");
        if (calllogs) {
            if (calllogs.callLogs) {
                _logger.log("debug", "MAIN - (rainbow_oncalllogackupdated) - rainbow event received. calllogs.callLogs.length", calllogs.callLogs.length);
            }
        }
        mycalllogs = calllogs;
    });
// Later in the code
    rainbowSDK.events.on("rainbow_onmessagereceived", (message) => {
        _logger.log("debug", "MAIN - (rainbow_onmessagereceived) - rainbow event received. message", message);
        // send manually a 'read' receipt to the sender
        //rainbowSDK.im.markMessageAsRead(message);
        let that = this;
        if (message?.content.includes("#test_charge ") ){
            let utc = new Date().toJSON().replace(/-/g, "/");
            let content = "_replyTo_" + message.content + " _at_ " + utc;
            rainbowSDK.im.sendMessageToJid(content, message.fromJid, 'EN', null, utc, "std", undefined).then((result) => {
                _logger.log("debug", "MAIN - rainbow_onmessagereceived reply to #test_charge received. sendMessageToJid - Acknowledged sent result : ", result);
            });
        } else {
            let contactEmailToSearch = "alice01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            /*
            if (message.fromBubbleJid ) {
                rainbowSDK.im.sendMessageToBubbleJidAnswer("hello from node sendMessageToJidAnswer", message.fromJid, 'FR', null, 'Le sujet de node sendMessageToBubbleJidAnswer', message).then((result) => {
                   _logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToBubbleJidAnswer - result : ", result);
                });

            }  else {
                rainbowSDK.im.sendMessageToJidAnswer("hello from node sendMessageToJidAnswer", message.fromJid, 'FR', null, 'Le sujet de node sendMessageToJidAnswer', message).then((result) => {
                   _logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToJidAnswer - result : ", result);
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
            if (ackUngency && message && message.urgency==="high") {
                if (message.fromBubbleJid) {
                    rainbowSDK.im.sendMessageToBubbleJidAnswer("Acknowledged", message.fromJid, 'EN', null, 'Acknowledged', message, undefined, "std").then((result) => {
                        _logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToBubbleJidAnswer - Acknowledged sent result : ", result);
                    });
                } else {
                    rainbowSDK.im.sendMessageToJidAnswer("Acknowledged", message.fromJid, 'EN', null, "Acknowledged", message, "std").then((result) => {
                        _logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToJidAnswer - Acknowledged sent result : ", result);
                    });
                } // */
            }

            let ignoreAckUngency = true;
            if (ignoreAckUngency && message && message.urgency==="high") {
                if (message.fromBubbleJid) {
                    rainbowSDK.im.sendMessageToBubbleJidAnswer("ign", message.fromJid, 'EN', null, 'Ignored', message, undefined, "std").then((result) => {
                        _logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToBubbleJidAnswer - Acknowledged sent result : ", result);
                    });
                } else {
                    rainbowSDK.im.sendMessageToJidAnswer("Ignoré", message.fromJid, 'FR', null, "Ignored", message, "std").then((result) => {
                        _logger.log("debug", "MAIN - rainbow_onmessagereceived sendMessageToJidAnswer - Acknowledged sent result : ", result);
                    });
                } // */
            }
        }
    });
    rainbowSDK.events.on("rainbow_onmessageserverreceiptreceived", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onmessageserverreceiptreceived) - rainbow event received. data", data);
        /*rainbowSDK.conversations.getConversations().then(() => {
           sdfsdf
        }); // */
        // send manually a 'read' receipt to the sender
        // rainbowSDK.im.markMessageAsRead(data);
    });
    rainbowSDK.events.on("rainbow_onuserinvitereceived", async (data) => {
        _logger.log("debug", "MAIN - (rainbow_onuserinvitereceived) - rainbow event received.  : ", data);
        let acceptInvitationResult = await rainbowSDK.contacts.acceptInvitation(data);
        _logger.log("debug", "Main - rainbow_onuserinvitereceived, acceptInvitation - result : ", acceptInvitationResult);
    });
    rainbowSDK.events.on("rainbow_onfileupdated", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onfileupdated) - rainbow event received.");
        let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId(data.fileid);
        _logger.log("debug", "Main - (rainbow_onfileupdated), retrieveFileDescriptorsListPerOwner - result : - fileDescriptorsReceived.id : ", fileDescriptorsReceived.id, ", fileDescriptorsReceived.fileName : ", fileDescriptorsReceived.fileName, ", fileDescriptorsReceived.url : ", fileDescriptorsReceived.url, ", fileDescriptorsReceived.ownerId : ", fileDescriptorsReceived.ownerId);
        /*rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceivedOwned: any) => {
           _logger.log("debug", "Main - (rainbow_onfileupdated), retrieveFileDescriptorsListPerOwner - result : ", fileDescriptorsReceivedOwned.length);
            for (let fileReceived of fileDescriptorsReceivedOwned) {
               _logger.log("debug", "Main - (rainbow_onfileupdated), retrieveFileDescriptorsListPerOwner - result : - fileReceived.id : ", fileReceived.id, ", fileReceived.fileName : ", fileReceived.fileName, ", fileReceived.url : ", fileReceived.url, ", fileReceived.ownerId : ", fileReceived.ownerId);

            }
        }); // */
    });
    rainbowSDK.events.on("rainbow_onfilecreated", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onfilecreated) - rainbow event received.");
        let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId(data.fileid);
        _logger.log("debug", "Main - (rainbow_onfilecreated), getFileDescriptorFromId - result : - fileDescriptorsReceived.id : ", fileDescriptorsReceived.id, ", fileDescriptorsReceived.fileName : ", fileDescriptorsReceived.fileName, ", fileDescriptorsReceived.url : ", fileDescriptorsReceived.url, ", fileDescriptorsReceived.ownerId : ", fileDescriptorsReceived.ownerId);
    });

    let countStop = 0;
    rainbowSDK.events.on("rainbow_onerror", (data) => {
        _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
        until(() => {
            return stopped==true;
        }, "Waiting for the stop event after the rainbow_onerror event.", 10000).then(() => {
            rainbowSDK = undefined;
            stopped = false;

            rainbowSDK = new RainbowSDK(options);
            stopped = true;
           /* _logger = rainbowSDK._core._logger;
            rainbowSDK.start().then(async(result) => {
                try {
                    // Do something when the SDK is started
                   _logger.log("debug", "MAIN - rainbow SDK started result after rainbow_onerror : ",_logger.colors.green(result)); //logger.colors.green(JSON.stringify(result)));
                    //let startDuration = Math.round(new Date() - startDate);
                    let startDuration = result.startDuration;
                    // that.stats.push({ service: "telephonyService", startDuration: startDuration });
                   _logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
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
        }).catch((err) => {
            console.log("MAIN - Error during starting : " + util.inspect(err));
        });
    });

    let stopped = false;

    rainbowSDK.events.on("rainbow_onstopped", (data) => {
        countStop++;
        stopped = true;
        _logger.log("debug", "MAIN - (rainbow_onstopped) " + countStop + " - rainbow event received. data", data);
        //setTimeout(() => {
        _logger.log("debug", "MAIN - (rainbow_onstopped) rainbow SDK will re start " + countStop + " result : ", data); //logger.colors.green(JSON.stringify(result)));
        //rainbowSDK.start();
        //        rainbowSDK.start().then(()=>{
        /*logger.log("debug", "MAIN - rainbow_onstopped rainbow SDK started " + countStop + " result : ", data); //logger.colors.green(JSON.stringify(result)));
        let list = rainbowSDK.contacts.getAll();
        if (list) {
            list.forEach(function (contact) {
               _logger.log("debug", "MAIN - rainbow_onstopped [start    " + countStop + "] :: contact : ", contact);
            });
        } else {
           _logger.log("debug", "MAIN - rainbow_onstopped [start    " + countStop + "] :: contacts list empty");
        }
        // */
        //        });
        //}, 1);
        // */
    });

    //This is the event handler to detect change of a contact's presence and output in console contact name and new status
    rainbowSDK.events.on("rainbow_oncontactpresencechanged", (contact) => {
        //Presence event handler. Code in between curly brackets will be executed in case of presence change for a contact
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Presence status of contact in a roster : " + contact.displayName + ", changed to " + contact.presence);
        if (contact.presence!="Unknown") {
            return false;
        }
        /* _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) ----> ", contact.displayName, "(", contact.jid, ")", " - ", contact.presence);
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) ------------------Presence changed --------------------------");
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) --> ", contact.displayName);
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Presence ", contact.presence);
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Status", contact.status);
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) Resources ", contact.resources);
        _logger.log("debug", "MAIN - (rainbow_oncontactpresencechanged) -------------------------------------------------------------");
        //  */
        //getLastMessageOfConversation(contact);
    });

    rainbowSDK.events.on("rainbow_onpresencechanged", (data) => {
        //Presence event handler. Code in between curly brackets will be executed in case of presence change for a contact
        _logger.log("debug", "MAIN - (rainbow_onpresencechanged) Presence status of contact loggued in : " + data.displayName + ", changed to " + data.presence, ", status : ", data.status);
        //getLastMessageOfConversation(contact);
    });

    rainbowSDK.events.on("rainbow_onuserinviteaccepted", function (invit) {
        _logger.log("debug", "MAIN - (rainbow_onuserinviteaccepted) invit : ", invit);
    });

    rainbowSDK.events.on("rainbow_oncontactremovedfromnetwork", async function (contact) {
        _logger.log("debug", "MAIN - (rainbow_oncontactremovedfromnetwork) contact : ", contact);
    });

    rainbowSDK.events.on("rainbow_onrbvoicerawevent", async function (data) {
        _logger.log("debug", "MAIN - (rainbow_onrbvoicerawevent) data : ", data);
    });

    rainbowSDK.events.on("rainbow_ontaskcreated", async function (data: any) {
        _logger.log("debug", "MAIN - (rainbow_ontaskcreated) data : ", data);
    });

    rainbowSDK.events.on("rainbow_ontaskupdated", async function (data: any) {
        _logger.log("debug", "MAIN - (rainbow_ontaskupdated) data : ", data);
    });

    rainbowSDK.events.on("rainbow_ontaskdeleted", async function (data: any) {
        _logger.log("debug", "MAIN - (rainbow_ontaskdeleted) data : ", data);
    });

    rainbowSDK.events.on("rainbow_onrainbowcpaasreceived", async function (data: any) {
        _logger.log("debug", "MAIN - (rainbow_onrainbowcpaasreceived) data : ", data);
    });

    rainbowSDK.events.on("rainbow_onpinmanagement", async function (data: any) {
        _logger.log("debug", "MAIN - (rainbow_onpinmanagement) data : ", data);
    });

    class Tests {

        testEventsRainbow_tokenexpired() {
            rainbowSDK._core._rest.p_decodedtokenRest = undefined;
            rainbowSDK.events.emit("evt_internal_tokenexpired", {});
        }

        async test_renewAuthToken() {
            for (let i = 0; i < 6; i++) {
                _logger.log("debug", "MAIN - [test_renewAuthToken    ] ::  i : ", i);
                rainbowSDK._core._rest._renewAuthToken();
                await pause(1000);
            }
            await rainbowSDK.stop().then(() => {
            }).catch(() => {
            });
            _logger.log("debug", "MAIN - [test_renewAuthToken    ] ::  last.",);
            rainbowSDK._core._rest._renewAuthToken();
        }

        async test_renewAuthToken_2() {
            await rainbowSDK.stop().then(() => {
            }).catch(() => {
            });
            _logger.log("debug", "MAIN - [test_renewAuthToken    ] ::  last.",);
            //rainbowSDK._core._rest._renewAuthToken("failedurl");
        }

        testCloseXMPP() {
            let stanza = xml("close", {
                "xmlns": NameSpacesLabels.XmppFraming
            });
            rainbowSDK._core._xmpp.sendStanza(stanza);
        }

        /*async testmockStanza(stanza : string = "<message type=\"management\" id=\"c07a1b5b-90b1-4d1f-a120-55f5bea4abaa_0\" to=\"fee2a3041f2f499e96ad493d14e3d304@openrainbow.com/web_win_1.67.2_P0EnyMvN\" xmlns=\"jabber:client\"><logs action=\"request\" xmlns='jabber:iq:configuration' contextid=\"5a1c2848bf33d1379ac5592f\"/></message>"){
            rainbowSDK._core._xmpp.mockStanza(stanza);
        } // */

        // region File JSON
        testloadDocJSON() {
            let pathJson = path.join(__dirname, '../build/JSONDOCS/BubblesService.json');
            // let pathJson = path.join(__dirname,'../node_modules/rainbow-node-sdk/build/JSONDOCS/BubblesService.json');
            console.log("Rainbow pathJson : ", pathJson);
            //const path = require("path");
            //let bubblesServiceDocJSONTab = require(pathJson);
            let fileStats = fs.statSync(pathJson);
            let fd = fs.openSync(pathJson, "r+");
            let sizeToRead = fileStats.size;
            let buf = Buffer.alloc(sizeToRead);
            fs.readSync(fd, buf, 0, sizeToRead, null);
            console.log("(testloadDocJSON) Buffer : ", buf);
            let bubblesServiceDocJSONTab = JSON.parse(buf.toString());
            console.log("(testloadDocJSON) JSON(Buffer) - bubblesServiceDocJSONTab : ", bubblesServiceDocJSONTab);

            /* ESM Code
            let bubblesServiceDocJSONTab = JSON.parse(
                await readFile(
                    new URL(pathJson, import.meta.url)
                )
            );
            // */

            //console.log("Rainbow BubblesService JSON : ", util.inspect(bubblesServiceDocJSONTab));
            for (let i = 0; i < bubblesServiceDocJSONTab.length; i++) {
                let bubblesServiceDocJSON = bubblesServiceDocJSONTab[i];
                if (bubblesServiceDocJSON.tags) {

                    let bubblesServiceDocJSONNodeRed = bubblesServiceDocJSON.tags.find((item) => {
                        //console.log("Rainbow BubblesService item : ", item);
                        return (item.title==="nodered" && (item.value==="true" || item.value===true));
                    });
                    if (bubblesServiceDocJSONNodeRed) {
                        //console.log("Rainbow BubblesService bubblesServiceDocJSONNodeRed JSON : ", bubblesServiceDocJSONNodeRed);
                        if ((bubblesServiceDocJSONNodeRed.value==="true" || bubblesServiceDocJSONNodeRed.value===true) && (bubblesServiceDocJSON["kind"]==="function" || bubblesServiceDocJSON["kind"]==="method")) {
                            console.log("Rainbow BubblesService bubblesServiceDocJSON JSON : ", bubblesServiceDocJSON);
                        }
                    }
                }
            }

        }

        testloadDocJSONServices() {
            let sdkPublic = [];
            console.log("Rainbow : rainbowsdkNodeSDKapi will get Services names and types from NodeSDK.");
            let pathJson = path.join(__dirname, '../build/JSONDOCS/NodeSDK.json');
            console.log("Rainbow pathJson : ", pathJson);
            //const path = require("path");
            //let NodeSDKServiceDocJSONTab = require(pathJson);
            let fileStats = fs.statSync(pathJson);
            let fd = fs.openSync(pathJson, "r+");
            let sizeToRead = fileStats.size;
            let buf = Buffer.alloc(sizeToRead);
            fs.readSync(fd, buf, 0, sizeToRead, null);
            console.log("(testloadDocJSONServices) Buffer : ", buf);
            let NodeSDKServiceDocJSONTab = JSON.parse(buf.toString());
            console.log("(testloadDocJSONServices) JSON(Buffer) - NodeSDKServiceDocJSONTab : ", NodeSDKServiceDocJSONTab);

            // console.log("Rainbow BubblesService JSON : ", util.inspect(NodeSDKServiceDocJSONTab));
            // console.log("Rainbow BubblesService JSON : ", util.inspect(NodeSDKServiceDocJSONTab));

            for (let i = 0; i < NodeSDKServiceDocJSONTab.length; i++) {
                let NodeSDKServiceDocJSON = NodeSDKServiceDocJSONTab[i];
                if (NodeSDKServiceDocJSON.tags) {

                    let NodeSDKServiceDocJSONNodeRed = NodeSDKServiceDocJSON.tags.find((item) => {
                        //console.log("Rainbow BubblesService item : ", item);
                        return (item.title==="nodered" && (item.value==="true" || item.value===true));
                    });
                    let NodeSDKServiceDocJSONService = NodeSDKServiceDocJSON.tags.find((item) => {
                        //console.log("Rainbow BubblesService item : ", item);
                        return (item.title==="service" && (item.value==="true" || item.value===true));
                    });
                    if (NodeSDKServiceDocJSONNodeRed && NodeSDKServiceDocJSONService) {
                        //console.log("Rainbow BubblesService NodeSDKServiceDocJSONNodeRed JSON : ", NodeSDKServiceDocJSONNodeRed);
                        if ((NodeSDKServiceDocJSONNodeRed.value==="true" || NodeSDKServiceDocJSONNodeRed.value===true) && (NodeSDKServiceDocJSONService.value==="true" || NodeSDKServiceDocJSONService.value===true) && (NodeSDKServiceDocJSON["kind"]==="member")) {
                            console.log("Rainbow NodeSDKServiceDocJSON JSON : ", NodeSDKServiceDocJSON);
                            console.log("Rainbow NodeSDKServiceDocJSON properties : ", NodeSDKServiceDocJSON.properties);
                            let serviceObj: any = {};
                            if (Array.isArray(NodeSDKServiceDocJSON.properties) && NodeSDKServiceDocJSON.properties[0]!=undefined) {
                                serviceObj.name = NodeSDKServiceDocJSON.properties[0].name;
                                serviceObj.typeService = NodeSDKServiceDocJSON.properties[0].type ? NodeSDKServiceDocJSON.properties[0].type.names[0]:"";
                            }
                            sdkPublic.push(serviceObj);
                        }
                    }
                }
            }
            console.log("SDK Services : ", sdkPublic);
        }

        //endregion File JSON

        //region tasks

        testflattenObject() {
            let jsonObj: TaskInput = {
                "category": "high",
                "position": 0,
                "content": {
                    "done": false,
                    "personalNote": true,
                    "text": "My task Text",
                    "title": "My Task Title",
                    "creationDate": 1709572666128
                },
                "id": "65e6023ae750d9fc381bbeeb",
                "categoryId": "65e5f30dc2d848f8d45ad356"
            };
            _logger.log("debug", "MAIN - jsonObj : ", jsonObj, ", flattenObject : ", flattenObject(jsonObj, 'XXX', false));
        }

        async testXml2jsParse() {
            let xmlNodeStr = " <message " +
                "  xmlns=\"jabber:client\" xml:lang=\"en\" to=\"adcf613d42984a79a7bebccc80c2b65e@openrainbow.net\" from=\"pcloud_enduser_1@openrainbow.net/7746302125005952675597380\" type=\"management\" id=\"bd7a468b-3c18-4929-bfa6-4841b509c70d_0\">" +
                "  <todo xmlns=\"jabber:iq:configuration\" id=\"65f1dfc59ad1c27b47d0ed46\" action=\"create\" position=\"0\" type=\"item\" category=\"middle\">" +
                "    <content  xmlns=\"urn:xmpp:json:0\">" +
                "{\"done\":false,\"personalNote\":true,\"text\":\"My task Text\",\"title\":\"My Task Title\",\"creationDate\":1710350292187}" +
                "    </content>" +
                "  </todo>" +
                "</message>";

            let reqObj = await getJsonFromXML(xmlNodeStr);
            _logger.log("debug", "MAIN - (testXml2jsParse) reqObj : ", reqObj);
        }

        testaddTask() {
            let task: TaskInput = {
                category: "middle",
                position: 1, // Todo's position in this category.
                content: { //  Todo's content.
                    done: false,// Todo's status.
                    personalNote: true,// true when todo is a personal note, false when to do is related to a message in a conversation.
                    title: "My Task Title", // personal note title, field mandatory when personalNote is true.
                    text: "My task Text", // To do's text
                    creationDate: new Date().getTime() //Creation date in ms since Unix epoch*
                }

            };
            rainbowSDK.tasks.addTask(task).then(result => {
                _logger.log("debug", "MAIN - [addTask    ] ::  result : ", result);
            }).catch((err) => {
                _logger.log("error", "MAIN - [addTask    ] :: catch reject contact : ", err);
            });
        }

        testTask() {
            let task: TaskInput = {
                category: "middle",
                position: 0, // Todo's position in this category.
                content: { //  Todo's content.
                    done: false,// Todo's status.
                    personalNote: true,// true when todo is a personal note, false when to do is related to a message in a conversation.
                    title: "My Task Title", // personal note title, field mandatory when personalNote is true.
                    text: "My task Text", // To do's text
                    creationDate: new Date().getTime() //Creation date in ms since Unix epoch*
                }

            };
            rainbowSDK.tasks.addTask(task).then(resultTask => {
                _logger.log("debug", "MAIN - [addTask    ] ::  result : ", resultTask);

                rainbowSDK.tasks.getTasks().then(result => {
                    _logger.log("debug", "MAIN - [getTasks    ] ::  result : ", result);
                    for (let i = 0; i < result.length; i++) {
                        _logger.log("debug", "MAIN - [getTasks    ] ::  result[", i, "] : ", result[i]);
                    }
                    let taskToUpdate: TaskInput = {
                        category: "low", position: 0, content: {
                            done: true,// Todo's status.
                            personalNote: true,// true when todo is a personal note, false when to do is related to a message in a conversation.
                            title: "My Task Title Updated", // personal note title, field mandatory when personalNote is true.
                            text: "My task Text Updated", // To do's text
                        }
                    };
                    rainbowSDK.tasks.updateTask(resultTask.id, taskToUpdate).then((updatedTask: any) => {
                        _logger.log("debug", "MAIN - [getTasks    ] ::  updatedTask : ", updatedTask);
                        rainbowSDK.tasks.getTasks().then(result2 => {
                            _logger.log("debug", "MAIN - [getTasks    ] ::  result2 : ", result2);
                            for (let i = 0; i < result2.length; i++) {
                                _logger.log("debug", "MAIN - [getTasks    ] ::  result2[", i, "] : ", result2[i]);
                            }
                        });

                        /*rainbowSDK.tasks.deleteTask(updatedTask.id).then((deleteresult) => {
                            _logger.log("debug", "MAIN - [deleteTask    ] ::  deleteresult : ", deleteresult);

                        }).catch((err) => {
                            _logger.log("error", "MAIN - [deleteTask    ] :: catch error  : ", err);
                        });
                        // */
                    }).catch((err) => {
                        _logger.log("error", "MAIN - [updateTask    ] :: catch error  : ", err);
                    });

                }).catch((err) => {
                    _logger.log("error", "MAIN - [getTasks    ] :: catch error : ", err);
                });

            }).catch((err) => {
                _logger.log("error", "MAIN - [addTask    ] :: catch reject contact : ", err);
            });
        }

        testgetTasks() {
            let contactInfo = {};
            rainbowSDK.tasks.getTasks(undefined, true).then((result: any) => {
                _logger.log("debug", "MAIN - [testgetTasks    ] ::  result.length : ", result.length);
                for (let i = 0; i < result.length; i++) {
                    _logger.log("debug", "MAIN - [testgetTasks    ] ::  result[", i, "] : ", result[i]);
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetTasks    ] :: catch reject contact : ", err);
            });
        }

        testgetAllCategories() {
            let contactInfo = {};
            rainbowSDK.tasks.getAllCategories().then((result: any) => {
                _logger.log("debug", "MAIN - [testgetAllCategories    ] ::  result.length : ", result.length);
                for (let i = 0; i < result.length; i++) {
                    _logger.log("debug", "MAIN - [testgetAllCategories    ] ::  result[", i, "] : ", result[i]);
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetAllCategories    ] :: catch reject contact : ", err);
            });
        }

        testgetTasksByCategories() {
            let contactInfo = {};
            rainbowSDK.tasks.getAllCategories().then((result: any) => {
                _logger.log("debug", "MAIN - [testgetTasksByCategories    ] ::  result.length : ", result.length);
                rainbowSDK.tasks.getTasksByCategoryId(result[0].categoryId, true).then((tasks: any) => {
                    _logger.log("debug", "MAIN - [testgetTasksByCategories    ] ::  tasks : ", tasks);
                    rainbowSDK.tasks.getTasks(undefined, false).then((result: any) => {
                        _logger.log("debug", "MAIN - [testgetTasksByCategories    ] ::  result.length : ", result.length);
                        for (let i = 0; i < result.length; i++) {
                            _logger.log("debug", "MAIN - [testgetTasksByCategories    ] ::  result[", i, "] : ", result[i]);
                        }
                    }).catch((err) => {
                        _logger.log("error", "MAIN - [testgetTasksByCategories    ] :: catch reject contact : ", err);
                    });
                });
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetAllCategories    ] :: catch reject contact : ", err);
            });
        }

        testgetTasksAndDeleteAll() {
            let contactInfo = {};
            rainbowSDK.tasks.getTasks().then(result => {
                _logger.log("debug", "MAIN - [getTasks    ] ::  result : ", result);
                for (let i = 0; i < result.length; i++) {
                    rainbowSDK.tasks.deleteTask(result[i].id).then((res) => {
                        _logger.log("debug", "MAIN - [deleteTask    ] ::  res : ", res);
                    })
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [getTasks    ] :: catch reject contact : ", err);
            });
        }

        //endregion tasks

        //region Config

        testAreasLevels() {
            let logLevelAreas = new LogLevelAreas();
            _logger.log("info", "MAIN - construct logLevelAreas : ", logLevelAreas);
            _logger.log("info", "MAIN - logLevelAreas to json : ", logLevelAreas.toJSON());
            _logger.log("info", "MAIN - construct logLevelAreas : ", logLevelAreas.toString());
        }

        testgetAreasLogs() {
            let areaslogs = rainbowSDK.getAreasLogs()
            _logger.log("info", "MAIN - construct logLevelAreas : ", logLevelAreas);
            _logger.log("info", "MAIN - logLevelAreas to json : ", logLevelAreas.toJSON());
            _logger.log("info", "MAIN - construct logLevelAreas : ", logLevelAreas.toString());
        }

        //endregion Config

        // region Contacts

        testupdateMyInformations() {
            let contactInfo = {};
            rainbowSDK.contacts.updateMyInformations(contactInfo).then(result => {
                _logger.log("debug", "MAIN - [testupdateMyInformations    ] ::  result : ", result);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testupdateMyInformations    ] :: catch reject contact : ", err);
            });
        }

        testgetUserPresenceInformation() {
            rainbowSDK.admin.getUserPresenceInformation().then(result => {
                _logger.log("debug", "MAIN - [getUserPresenceInformation    ] ::  result : ", result);
            }).catch((err) => {
                _logger.log("error", "MAIN - [getUserPresenceInformation    ] :: catch reject contact : ", err);
            });
        }

        testgetContactByLoginEmail_natawi29() {
            let usersToSearch = "natawi29@gmail.com";
            rainbowSDK.contacts.getContactByLoginEmail(usersToSearch).then(contact => {
                _logger.log("debug", "MAIN - [testgetContactByLoginEmail_natawi29    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetContactByLoginEmail_natawi29    ] :: catch reject contact : ", err);
            });
        }

        testgetContactByLoginEmail_UnknownUser() {
            let usershouldbeUnkown = "unknowcontact@openrainbow.org";
            rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then(contact => {
                _logger.log("debug", "MAIN - [getContactByLoginEmail    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [getContactByLoginEmail    ] :: catch reject contact : ", err);
            });
        }

        testgetContactByLoginEmail_NotInRoster() {
            let usershouldbeUnkown = "vincent06@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then(contact => {
                _logger.log("debug", "MAIN - [getContactByLoginEmail    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [getContactByLoginEmail    ] :: catch reject contact : ", err);
            });
        }

        async testgetContactByLoginEmail_vincent00() {
            let that = this;
            let contactLogin = "vincent00@vbe.test.openrainbow.net";
            // Token expired on vberder AIO for user vincent01
            let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjEsInVzZXIiOnsiaWQiOiI1YmJkYzM4MTJjZjQ5NmMwN2RkODkxMjgiLCJsb2dpbkVtYWlsIjoidmluY2VudDAxQHZiZS50ZXN0Lm9wZW5yYWluYm93Lm5ldCJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJkZXZlbG9wbWVudCIsImVudmlyb25tZW50QXBpVXJsIjoiaHR0cHM6Ly92YmVyZGVyLm9wZW5yYWluYm93Lm9yZyJ9LCJhcHAiOnsiaWQiOiIyNzAzM2IxMDAxYmQxMWU4ODQzZDZmMDAxMzRlNTE4OSIsIm5hbWUiOiJSYWluYm93IG9mZmljaWFsIFdlYiBhcHBsaWNhdGlvbiJ9LCJpYXQiOjE3MzAxMjY5MzAsImV4cCI6MTczMDEyNzE3MH0.mUkmBXjdhyNVvsMILuC9n7Njqj0-BoGNmewtzZVRf48m0cc36KGmJJmJbc9qocOVhl1_meTIROSRkCbd6j1b0aC7dkNv-bSCrVuy8jfrQo4Ih44wQLLdtWBox5xL4RFkuT18hL6SG_eiVDH8f7cawnEdwMcMkQqfpYsoCNvOaBFFPcphm9DkcFEGOcS3OqVCYfn5rfi8Zj9lc9vLSpPfM8bh1Ji_HQMtUolEFyaadBWXZHFsLpgYonujkvAG6LvBEUtNLHbfqI9XAIHcbAm7C7Qr-e86f1piw3AmMhEIF7FDJTFOvrcXT6VcHARuDRi5vcRkaLhX0qfEMvSGNYI20g';

            let sortOrder: number = 1, limit: number = 100, offset: number = 0;
            let LOG_ID = "SAMPLES/tests";

            let url = "/api/rainbow/enduser/v1.0/users/loginEmails";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            url = urlParamsTab[0];

            let filter: any = {};
            addPropertyToObj(filter, "loginEmail", contactLogin, false);

            //that._logger.log(that.INTERNAL, LOG_ID + "(testgetContactByLoginEmail_vincent00) with params : ", { "loginEmail": email });

            let headers = rainbowSDK._core._rest.getRequestHeader();
            headers["authorization"] = 'Bearer ' + token;

            await rainbowSDK._core._rest.http.post(url, headers, filter, undefined).then(function (json) {
                _logger.log("debug", LOG_ID + "(testgetContactByLoginEmail_vincent00) successfull");
                _logger.log("debug", LOG_ID + "(testgetContactByLoginEmail_vincent00) REST result : ", json);
                //resolve(json?.data);
            }).catch(function (err) {
                _logger.log("error", LOG_ID, "(testgetContactByLoginEmail_vincent00) error");
                _logger.log("error", LOG_ID, "(testgetContactByLoginEmail_vincent00) error : ", err);
                //return reject(err);
            });
        }

        testgetContactByLoginEmail_david() {
            let usershouldbeUnkown = "pbx191b-32a3-d759-4d7e-90a3-215b-f2ff-f499-vna@david-all-in-one-rd-dev-1.opentouch.cloud";
            rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then(contact => {
                _logger.log("debug", "MAIN - [getContactByLoginEmail    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [getContactByLoginEmail    ] :: catch reject contact : ", err);
            });
            rainbowSDK.admin.getAllUsersByFilter(undefined, undefined, usershouldbeUnkown, undefined, "vna_location", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                , undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                , undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                , undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined).then(contact => {
                _logger.log("debug", "MAIN - [getAllUsersByFilter    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [getAllUsersByFilter    ] :: catch reject contact : ", err);
            });
        }

        multiple_testgetContactByLoginEmail_NotInRoster() {
            let usershouldbeUnkown = "vincent02@vbe.test.openrainbow.net"; // "WRONG6ac069e5eb4741e2af64a8beac59406f@openrainbow.net"
            rainbowSDK.contacts.getContactByLoginEmail(usershouldbeUnkown).then((contact: Contact) => {
                for (let i = 0; i < 20; i++) {
                    let prom = rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
                        _logger.log("debug", "MAIN - [getContactInformationByJID    ] ::  _contactFromServer : ", _contactFromServer);
                    }).catch((err) => {
                        _logger.log("error", "MAIN - [getContactInformationByJID    ] :: catch reject contact : ", err);
                    });
                }
            });
        }

        async testEvents() {
            let listenerData = await rainbowSDK.events.listenerData();
            _logger.log("debug", "MAIN - [testEvents    ] ::  listenerData : ", prettydata.json(listenerData));
        }

        async testgetContactByLoginEmailCaseSensitiveTest() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            _logger.log("debug", "MAIN - [testgetContactByLoginEmailCaseSensitiveTest] after getContactByLoginEmail : ", contactVincent00);
            let contactVincent00upperCase = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00.toUpperCase());
            _logger.log("debug", "MAIN - [testgetContactByLoginEmailCaseSensitiveTest] after getContactByLoginEmail UpperCase : ", contactVincent00upperCase);
        }

        async testgetContactByLoginEmailVincentBerder() {
            let contactEmailToSearchVincent00 = "vincent.berder@al-enterprise.com";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00, true);
            _logger.log("debug", "MAIN - [testgetContactByLoginEmailCaseSensitiveTest] after getContactByLoginEmail : ", contactVincent00);
        }

        async testgetContactIdByLoginEmailVincentBerder() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactId = await rainbowSDK.contacts.getContactIdByLoginEmail(contactEmailToSearchVincent00, true);
            _logger.log("debug", "MAIN - [testgetContactIdByLoginEmailVincentBerder] after getContactIdByLoginEmail contactId : ", contactId);
        }

        displayRoster() {
            let contacts = rainbowSDK.contacts.getAll();
            let roster = contacts.filter(contact => contact.roster).map(contact => contact.displayName)
            _logger.log("debug", "MAIN - [displayRoster] roster.length : ", roster.length, ", roster : ", roster);
        }

        /* testgetContactByLoginEmail() {
        let loginEmail = "vincent++@vbe.test.openrainbow.net";
        rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
            if (contact) {
               _logger.log("debug", "MAIN - [testgetContactByLoginEmail    ] :: getContactByLoginEmail contact : ", contact);
            }
        });
    } // */

        testgetContactByLoginEmail(loginEmail: string = "vincent++@vbe.test.openrainbow.net", forceServerSearch: boolean = false) {
            //let loginEmail = "vincent++@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail, forceServerSearch).then(contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testgetContactByLoginEmail    ] :: getContactByLoginEmail contact : ", contact);
                }
            });
        }

        /**
         * need to be administrator of the company. Here vincent02 is ok.
         */
        testgetContactInfos() {
            let loginEmail = "vincent++@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactByLoginEmail contact : ", contact);
                    rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                        if (contactInfos) {
                            _logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                        } else {
                            _logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos no infos found");
                        }
                    });
                }
            });
        }

        testgetContactInfos2() {
            let loginEmail = "representaive2@al-mydemo.com";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactByLoginEmail contact : ", contact);
                    rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                        if (contactInfos) {
                            _logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                        } else {
                            _logger.log("debug", "MAIN - [testgetContactInfos    ] :: getContactInfos no infos found");
                        }
                    });
                }
            });
        }

        /**
         * need to be administrator of the company. Here vincent02 is ok.
         */
        testupdateContactInfos() {
            let loginEmail = "vincent++@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactByLoginEmail contact : ", contact);
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
                            _logger.log("debug", "MAIN - [testupdateContactInfos    ] :: updateContactInfos result : ", result);
                        } else {
                            _logger.log("debug", "MAIN - [testupdateContactInfos    ] :: updateContactInfos no infos found");
                        }
                        rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                            if (contactInfos) {
                                _logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactInfos contactInfos : ", contactInfos);
                            } else {
                                _logger.log("debug", "MAIN - [testupdateContactInfos    ] :: getContactInfos no infos found");
                            }
                        });
                    });
                }
            });
        }

        /**
         * need to be administrator of the company. Here vincent02 is ok.
         */
        testupdateContactInfos_loginEmail() {
            let loginEmail = "vincent++@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: getContactByLoginEmail contact : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "_");
                    let infos = {
                        "loginEmail": "vincent++updated@vbe.test.openrainbow.net"
                    };
                    rainbowSDK.admin.updateContactInfos(contact.id, infos).then(result => {
                        if (result) {
                            _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: updateInformationForUser result : ", result);
                        } else {
                            _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: updateInformationForUser no infos found");
                        }
                        rainbowSDK.admin.getContactInfos(contact.id).then(contactInfos => {
                            if (contactInfos) {
                                _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: getContactInfos contactInfos : ", contactInfos);
                            } else {
                                _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: getContactInfos no infos found");
                            }
                            rainbowSDK.admin.updateContactInfos(contact.id, {loginEmail}).then(result => {
                                if (result) {
                                    _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: updateInformationForUser result : ", result);
                                } else {
                                    _logger.log("debug", "MAIN - [testupdateContactInfos_loginEmail    ] :: updateInformationForUser no infos found");
                                }
                            });
                        });
                    });
                }
            });
        }

        async testjoinContacts_AddContactToRoster() {
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

        async testsendSubscription() {
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

        async testaddToContactsList() {
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

        async testremoveFromNetwork() {
            let contactEmailToSearchVincent00 = "vincent02@vbe.test.openrainbow.net";
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            _logger.log("debug", "MAIN - [testremoveFromNetwork] contactEmailToSearchVincent00 : " + contactEmailToSearchVincent00 + " : ", contactVincent00);
            await rainbowSDK.contacts.removeFromNetwork(contactVincent00);
        }

        async testgetAllUsers() {
            // let utc = new Date().toJSON().replace(/-/g, '_');
            let users = await rainbowSDK.admin.getAllUsers("small", 2, 5, "firstName");
            _logger.log("debug", "MAIN - [testgetAllUsers] after getAllUsers : ", users);
            //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            //let tab = [];
            //tab.push(contactVincent01.id);
            //await rainbowSDK.contacts.addToNetwork(contactVincent00);
        }

        async testgetAllUsersByFilter() {
            // let utc = new Date().toJSON().replace(/-/g, '_');
            let users = await rainbowSDK.admin.getAllUsersByFilter(undefined, undefined, "vincent02@vbe.test.openrainbow.net", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                , undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                , undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                , undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            _logger.log("debug", "MAIN - [testgetAllUsersByFilter] after getAllUsersByFilter : ", users);
        }

        async testgetAllUsersByCompanyId() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);

            let users = await rainbowSDK.admin.getAllUsersByCompanyId("small", 2, 5, "firstName", contactVincent00.companyId);
            _logger.log("debug", "MAIN - [testgetAllUsersByCompanyId] after getAllUsersByCompanyId : ", users);
        }

        async testgetAllUsersBySearchEmailByCompanyId() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            let searchEmail = "cord";
            let users = await rainbowSDK.admin.getAllUsersBySearchEmailByCompanyId("small", 2, 5, "firstName", contactVincent00.companyId, searchEmail);
            _logger.log("debug", "MAIN - [testgetAllUsersBySearchEmailByCompanyId] after getAllUsersBySearchEmailByCompanyId : ", users);
        }

        //region Favorites

        async testgetServerFavorites() {
            let utc = new Date().toJSON().replace(/-/g, "_");
            let favorites = await rainbowSDK.favorites.fetchAllFavorites();
            _logger.log("debug", "MAIN - (testgetServerFavorites) favorites :  ", favorites);

            //let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent01);
            //let jid = contactVincent01.jid_im;
            //  let me = rainbowSDK.contacts.getConnectedUser();
            //let tab = [];
            //tab.push(contactVincent01.id);
            //await rainbowSDK.contacts.addToNetwork(contactVincent00);
        }

        async testcreateFavorite() {
            // To be USED with vincent01 on .Net
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let contactEmailToSearch2 = "vincent02@vbe.test.openrainbow.net";
            let contactVincent01 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch2);
            try {


                let favoriteCreated: any = await rainbowSDK.favorites.createFavorite(contactVincent00.id, "user");
                _logger.log("debug", "MAIN - (testgetServerFavorites) createFavorite favoriteCreated :  ", favoriteCreated);
                let favoriteCreated01: any = await rainbowSDK.favorites.createFavorite(contactVincent01.id, "user");
                _logger.log("debug", "MAIN - (testgetServerFavorites) createFavorite favoriteCreated01 :  ", favoriteCreated01);

                let favoriteMoved: any = await rainbowSDK.favorites.moveFavoriteToPosition(favoriteCreated01.id, 0);
                _logger.log("debug", "MAIN - (testgetServerFavorites) moveFavoriteToPosition favoriteMoved :  ", favoriteMoved);

                let favorites = await rainbowSDK.favorites.fetchAllFavorites();
                _logger.log("debug", "MAIN - (testgetServerFavorites) fetchAllFavorites favorites :  ", favorites);
                let favoriteFoundInList = await rainbowSDK.favorites.getAllUserFavoriteList(contactVincent00.id);
                _logger.log("debug", "MAIN - (testgetServerFavorites) getAllUserFavoriteList favoriteFoundInList :  ", favoriteFoundInList);
                let isPeerSettedAsFavorite = await rainbowSDK.favorites.checkIsPeerSettedAsFavorite(contactVincent00.id);
                _logger.log("debug", "MAIN - (testgetServerFavorites) checkIsPeerSettedAsFavorite isPeerSettedAsFavorite :  ", isPeerSettedAsFavorite);
                let favoriteById = await rainbowSDK.favorites.getFavoriteById(favoriteCreated.id);
                _logger.log("debug", "MAIN - (testgetServerFavorites) getFavoriteById favoriteById :  ", favoriteById);
                let favoriteDeleted = await rainbowSDK.favorites.deleteFavorite(favoriteCreated.id);
                _logger.log("debug", "MAIN - (testgetServerFavorites) deleteFavorite favoriteDeleted :  ", favoriteDeleted);
                let favoriteDeleted01 = await rainbowSDK.favorites.deleteFavorite(favoriteCreated01.id);
                _logger.log("debug", "MAIN - (testgetServerFavorites) deleteFavorite favoriteDeleted01 :  ", favoriteDeleted01);

            } catch (e) {
                _logger.log("error", "MAIN - (testgetServerFavorites) FAILED :  ", e);
            }
        }

        //endregion Favorites

        async testcreateGuestUserError() {
            let firstname = "firstname_";
            let lastname = "lastname_" + new Date().getTime() + "_";
            for (let iter = 0; iter < 1; iter++) {
                let firstnameTemp = firstname + iter;
                let lastnameTemp = lastname + iter;
                await rainbowSDK.admin.createGuestUser(firstnameTemp, lastnameTemp, "fr", 10).catch((err) => {
                    _logger.log("debug", "MAIN - (testcreateGuestUserError) error while creating guest user :  ", err);
                });
            }
        }

        testsearchUsers() {
            let usershouldbeUnkown = "unknowcontact@openrainbow.org";
            rainbowSDK.contacts.searchUsers(20, undefined, "vincent").then(contact => {
                _logger.log("debug", "MAIN - [testsearchUsers    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testsearchUsers    ] :: catch reject contact : ", err);
            });
        }

        testsearchUserByPhonenumberALE() {
            // To be used vith vincent.berder on openrainbow.com
            let contactphone = "21885240"; // 21885240 is Thierry Peyrebesse
            //let contactphone = encodeURIComponent("+33298483031") ; // 23031 is vincent01 +33298483031
            rainbowSDK.contacts.searchUserByPhonenumber(contactphone).then(contact => {
                _logger.log("debug", "MAIN - [testsearchUserByPhonenumberALE    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testsearchUserByPhonenumberALE    ] :: catch reject contact : ", err);
            });
        }

        testsearchUserByPhonenumber() {
            // To be used vith vincent05 on vberder.openrainbow.org
            let contactphone = "23031"; // 23031 is vincent01 +33298483031
            //let contactphone = encodeURIComponent("+33298483031") ; // 23031 is vincent01 +33298483031
            rainbowSDK.contacts.searchUserByPhonenumber(contactphone).then(contact => {
                _logger.log("debug", "MAIN - [testsearchUserByPhonenumber    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testsearchUserByPhonenumber    ] :: catch reject contact : ", err);
            });
        }

        testsearchUserByPhonenumberByDDI() {
            // To be used vith vincent05 on vberder.openrainbow.org
            let contactphone = "+33298483031"; // 23031 is vincent01 +33298483031
            //let contactphone = encodeURIComponent("+33298483031") ; // 23031 is vincent01 +33298483031
            rainbowSDK.contacts.searchUserByPhonenumber(contactphone).then(contact => {
                _logger.log("debug", "MAIN - [testsearchUserByPhonenumber    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testsearchUserByPhonenumber    ] :: catch reject contact : ", err);
            });
        }

        // need Admin right :
        async testgetAllSystemPhoneNumbers() {
            // use on vberder.openrainbow.org with pbx.
            // To be used vith vincentAdmin@vbe.test.openrainbow.net on vberder.openrainbow.org
            let pbxId = 'PBXfa73-491b-e274-4e96-a0df-c6f4-e939-4bb2';
            let shortNumber = "23031"; // 23031 is vincent01 +33298483031
            //let contactphone = encodeURIComponent("+33298483031") ; // 23031 is vincent01 +33298483031
            let systemInfos: any = await rainbowSDK.admin.getSystemDataByPbxId(pbxId);
            rainbowSDK.admin.getAllSystemPhoneNumbers(systemInfos.id, shortNumber, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "full").then(async infos => {
                _logger.log("debug", "MAIN - [testgetAllSystemPhoneNumbers    ] ::  infos : ", infos);
                let contact = await rainbowSDK.contacts.getContactById(infos[0].userId);
                _logger.log("debug", "MAIN - [testgetAllSystemPhoneNumbers    ] ::  contact : ", contact);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetAllSystemPhoneNumbers    ] :: catch reject contact : ", err);
            });

        }

        //region Contacts Sources

        async testSource() {
            //async testcreateSource () {
            let userId: string, sourceId: string, os: string;
            userId = connectedUser.id;
            sourceId = "mySrc_" + new Date().getTime();
            os = "Node_" + process.version;
            let srcInfos: any /* {
                sourceId: string,
                os: string,
                id: string
            } */ = await rainbowSDK.contacts.createSource(userId, sourceId, os).then(async infos => {
                _logger.log("debug", "MAIN - [testcreateSource    ] ::  infos : ", infos);
                return infos;
            }).catch((err) => {
                _logger.log("error", "MAIN - [testcreateSource    ] :: catch reject contact : ", err);
            });
            //}

            //testupdateSourceData () {
            await rainbowSDK.contacts.updateSourceData(userId, srcInfos.id, os + "_UPDATED").then(async infos => {
                _logger.log("debug", "MAIN - [testupdateSourceData    ] ::  infos : ", infos);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testupdateSourceData    ] :: catch reject contact : ", err);
            });
            //}

            // testgetSourceData () {
            await rainbowSDK.contacts.getSourceData(userId, srcInfos.id).then(async infos => {
                _logger.log("debug", "MAIN - [testgetSourceData    ] ::  infos : ", infos);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetSourceData    ] :: catch reject contact : ", err);
            });
            //}

            await rainbowSDK.contacts.getAllSourcesByUserId().then(async infos => {
                _logger.log("debug", "MAIN - [testgetAllSourcesByUserId    ] ::  infos : ", infos);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetAllSourcesByUserId    ] :: catch reject contact : ", err);
            });

            //testdeleteSource () {
            await rainbowSDK.contacts.deleteSource(userId, srcInfos.id).then(async infos => {
                _logger.log("debug", "MAIN - [testdeleteSource    ] ::  infos : ", infos);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testdeleteSource    ] :: catch reject contact : ", err);
            });
        }

        async testdeleteSource_All() {
            let userId = connectedUser.id;

            await rainbowSDK.contacts.getAllSourcesByUserId().then(async (infos: any) => {
                _logger.log("debug", "MAIN - [testgetAllSourcesByUserId    ] ::  infos : ", infos);
                for (let i = 0; i < infos.data.length; i++) {
                    await rainbowSDK.contacts.deleteSource(userId, infos.data[i].id).then(async result => {
                        _logger.log("debug", "MAIN - [testdeleteSource    ] ::  result : ", result);
                    }).catch((err) => {
                        _logger.log("error", "MAIN - [testdeleteSource    ] :: catch reject contact : ", err);
                    });
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetAllSourcesByUserId    ] :: catch reject contact : ", err);
            });

        }

        testgetAllSourcesByUserId() {
            rainbowSDK.contacts.getAllSourcesByUserId().then(async infos => {
                _logger.log("debug", "MAIN - [testgetAllSourcesByUserId    ] ::  infos : ", infos);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetAllSourcesByUserId    ] :: catch reject contact : ", err);
            });
        }


        //endregion Contacts Sources

        //region Contacts API - Enduser portal

        async testcreateContact() {
            //async testcreateSource () {
            let userId: string, sourceIdName: string, os: string;
            userId = connectedUser.id;
            sourceIdName = "mySrc_" + new Date().getTime();
            os = "Node_" + process.version;
            let srcInfos: any /* {
                sourceId: string,
                os: string,
                id: string
            } */ = await rainbowSDK.contacts.createSource(userId, sourceIdName, os).then(async infos => {
                _logger.log("debug", "MAIN - [testcreateContact    ] :: testcreateSource infos : ", infos);
                return infos;
            }).catch((err) => {
                _logger.log("error", "MAIN - [testcreateContact    ] :: testcreateSource catch reject contact : ", err);
            });
            //}

            let sourceId: string = srcInfos.id;

            let idgenerated = new Date().getTime();
            let contactId: string, firstName: string, lastName: string, displayName: string, company: string,
                jobTitle: string, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>,
                groups: Array<string>, otherData: Array<any>;

            contactId = "id_" + idgenerated;
            firstName = "firstname_" + idgenerated;
            lastName = "lastname_" + idgenerated;
            displayName = "displayname_" + idgenerated;
            company = "company_" + idgenerated;
            jobTitle = "jobtitle_" + idgenerated;
            phoneNumbers = [];
            emails = [];
            addresses = [];
            groups = [];
            otherData = [];
            let result = await rainbowSDK.contacts.createContact(userId, sourceId, contactId, firstName, lastName, displayName, company, jobTitle, phoneNumbers, emails, addresses, groups, otherData).then(async infos => {
                _logger.log("debug", "MAIN - [testcreateContact    ] :: createContact infos : ", infos);
                return infos;
            }).catch((err) => {
                _logger.log("error", "MAIN - [testcreateContact    ] :: createContact catch reject contact : ", err);
            });
            //}

            let result2 = await rainbowSDK.contacts.getContactsList(userId, sourceId, "full").then(async (infos: any) => {
                _logger.log("debug", "MAIN - [testcreateContact    ] :: getContactsList infos : ", infos);
                for (let i = 0; i < infos.data.length; i++) {
                    _logger.log("debug", "MAIN - [testcreateContact    ] :: getContactsList infos.data[" + i + "] : ", infos.data[i]);
                    let result4 = await rainbowSDK.contacts.updateContactData(userId, sourceId, infos.data[i].id, undefined, "firstnameUpdated", "lastnameUpdated").then(async (infos3: any) => {
                        _logger.log("debug", "MAIN - [testcreateContact    ] :: updateContactData infos3 : ", infos3);
                    });
                    let result3 = await rainbowSDK.contacts.getContactData(userId, sourceId, infos.data[i].id).then(async (infos2: any) => {
                        _logger.log("debug", "MAIN - [testcreateContact    ] :: getContactData after update infos2 : ", infos2);
                    });
                    let result5 = await rainbowSDK.contacts.deleteContact(userId, sourceId, infos.data[i].id).then(async (infos4: any) => {
                        _logger.log("debug", "MAIN - [testcreateContact    ] :: deleteContact infos4 : ", infos4);
                    });
                    let result6 = await rainbowSDK.contacts.getContactsList(userId, sourceId, "full").then(async (infos5: any) => {
                        _logger.log("debug", "MAIN - [testcreateContact    ] :: getContactsList after delete infos5 : ", infos5);
                    });
                }
                return infos;
            }).catch((err) => {
                _logger.log("error", "MAIN - [testcreateContact    ] :: getContactsList catch reject contact : ", err);
            });
            //}

            //testdeleteSource () {
            await rainbowSDK.contacts.deleteSource(userId, srcInfos.id).then(async infos => {
                _logger.log("debug", "MAIN - [testcreateContact    ] :: deleteSource infos : ", infos);
            }).catch((err) => {
                _logger.log("error", "MAIN - [testcreateContact    ] :: deleteSource catch reject contact : ", err);
            });
        }

        /*
         testupdateContactData () {}
        testgetAContactData () {}
        testgetContactsList () {
        } */

        //endregion Contacts API - Enduser portal

        //endregion Contacts

        //region Messages

        async testsendConversationByEmail() {
            // To use with vincent01 on .NET
            //let that = this;
            let contactEmailToSearch = "vincent03@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let destArray = ["vincent02@vbe.test.openrainbow.net", "blablabla@vbe.test.openrainbow.net"];
            let sentConv = await rainbowSDK.conversations.sendConversationByEmail(conversation.dbId, destArray, "fr");
            _logger.log("debug", "MAIN - testsendConversationByEmail - result sendConversationByEmail : ", sentConv);
            let sentConv2 = await rainbowSDK.conversations.sendConversationByEmail(conversation.dbId, undefined, "fr");
            _logger.log("debug", "MAIN - testsendConversationByEmail - result sendConversationByEmail : ", sentConv2);
        }

        async testgetContactsMessagesFromConversationId() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let now = new Date().getTime();
            let usebulk = false;
            // get messages which are not events
            let msgNotEvents = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id, usebulk);
            _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationId - result getContactsMessagesFromConversationId : ", msgNotEvents);

        }

        async testupdateConversationBookmark() {
            // To use with vincent00 on .Net
            //let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let now = new Date().getTime();
            // get messages which are not events
            let msgNotEvents: any = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
            _logger.log("debug", "MAIN - testupdateConversationBookmark - result getContactsMessagesFromConversationId : ", msgNotEvents, ", msgNotEvents.length : ", msgNotEvents.length);
            if (msgNotEvents.length > 6) {
                let messageToSetUnread = msgNotEvents[msgNotEvents.length - 5];
                let result = await rainbowSDK.conversations.updateConversationBookmark(undefined, conversation.dbId, messageToSetUnread.id);
                _logger.log("debug", "MAIN - testupdateConversationBookmark - result updateConversationBookmark : ", result);
            }

        }

        async testdeleteConversationBookmark() {
            // To use with vincent00 on .Net
            //let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let now = new Date().getTime();
            // get messages which are not events
            let msgNotEvents: any = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
            _logger.log("debug", "MAIN - testdeleteConversationBookmark - result getContactsMessagesFromConversationId : ", msgNotEvents, ", msgNotEvents.length : ", msgNotEvents.length);
            if (msgNotEvents.length > 6) {
                let messageToSetUnread = msgNotEvents[msgNotEvents.length - 5];
                let result = await rainbowSDK.conversations.updateConversationBookmark(undefined, conversation.dbId, messageToSetUnread.id);
                _logger.log("debug", "MAIN - testdeleteConversationBookmark - result updateConversationBookmark : ", result);
                await pause(2000);
                let result2 = await rainbowSDK.conversations.deleteConversationBookmark(undefined, conversation.dbId);
                _logger.log("debug", "MAIN - testdeleteConversationBookmark - result deleteConversationBookmark : ", result2);
            }


        }

        async testgetContactsMessagesFromConversationId_2() {
            // To use with vincent00 on .Net
            //let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let now = new Date().getTime();
            // get messages which are not events
            let msgNotEvents: any = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
            _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationId - result getContactsMessagesFromConversationId : ", msgNotEvents, ", msgNotEvents.length : ", msgNotEvents.length);
        }

        async testgetContactsMessagesFromConversationIdForGuest() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";


            rainbowSDK.admin.createAnonymousGuestUser(60 * 60).then((guest: any) => {
                _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result createAnonymousGuestUser : ", guest);
                rainbowSDK.contacts.getContactByJid(guest.jid_im, true).then(contact => {
                    _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result getContactByJid : ", contact);
                    rainbowSDK.conversations.openConversationForContact(contact).then(async conversation => {
                        _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result openConversationForContact : ", conversation);
                        let msgNotEvents = await rainbowSDK.conversations.getContactsMessagesFromConversationId(conversation.id);
                        _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationIdForGuest - result getContactsMessagesFromConversationId : ", msgNotEvents);
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
       _logger.log("debug", "MAIN - testgetContactsMessagesFromConversationId - result getContactsMessagesFromConversationId : ", msgNotEvents);
        // */
        }

        async testremoveAllMessages(contactEmailToSearch : string = "vincent01@vbe.test.openrainbow.net") {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            //let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
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
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testremoveAllMessages - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            _logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);
        }

    async  testsendMessageToConversationForContact(nbMsgToSend = 2) {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent02@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
        //let nbMsgToSend = 2;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                // Send message
                //let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now, "middle");
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testsendMessageToConversationForContact - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
                let msgDeleted = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
                _logger.log("debug", "MAIN - testsendMessageToConversationForContact - deleted in conversation the message : ", msgDeleted);
            }
            // let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            //_logger.log("debug", "MAIN - testsendMessageToConversationForContact - conversation with messages removed : ", conversationWithMessagesRemoved);
    }

    async  testsendApplicationMessageContactJid() {
        //let that = this;
        let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
        // Retrieve a contact by its id
        let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        // Retrieve the associated conversation
        let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
        let now = new Date().getTime();
        let xmlElements = new Element('instance', {'xmlns': 'tests:rainbownodesdk', 'id': now });
        xmlElements.cnode(new Element('displayName').t("My displayName"));
        xmlElements.cnode(new Element('description').t("My description"));
        // Send message
        let msgSent = await rainbowSDK.im.sendApplicationMessageContactJid(contact.jid, xmlElements);
        //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
        //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
        //a rainbow_onrainbowcpaasreceived event should be received on other side.
    }

    async  testsendApplicationMessageBubbleJid() {
        //let that = this;
        _logger.log("debug", "MAIN - testsendApplicationMessageBubbleJid - getAll bubbles : ", rainbowSDK.bubbles.getAll());

        //let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
        let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();
        _logger.log("debug", "MAIN - testsendApplicationMessageBubbleJid - getAllOwnedBubbles bubble : ", bubbles);
        let bubble = bubbles.find(element => element.name==="bulle1")
        _logger.log("debug", "MAIN - testsendApplicationMessageBubbleJid -  bubble \"bulle1\" : ", bubble);
        if (bubble) {
            let bubbleJid = bubble.jid;
            let now = new Date().getTime();
            let xmlElements = new Element('instance', {'xmlns': 'tests:rainbownodesdk', 'id': now});
            xmlElements.cnode(new Element('displayName').t("My displayName"));
            xmlElements.cnode(new Element('description').t("My description"));
            // Send message
            let msgSent = await rainbowSDK.im.sendApplicationMessageBubbleJid(bubbleJid, xmlElements);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            //a rainbow_onrainbowcpaasreceived event should be received on other side.
        }
    }

        /*
            testeventrainbow_onconversationchanged() {
                _logger.log("info", "MAIN - (testeventrainbow_onconversationchanged) started.");
                rainbowSDK.events.on("rainbow_onconversationchanged", async function (conversation) {
                    try {
                        _logger.log("debug", "MAIN - (testeventrainbow_onconversationchanged) rainbow_onconversationchanged conversation.name : ", conversation.name, ", conversation.id : ", conversation.id, ", conversation.messages.length : ", conversation?.messages?.length);
                    } catch (err) {
                        _logger.log("error", "MAIN - (testeventrainbow_onconversationchanged) rainbow_onconversationchanged CATCH Error !!!");
                    }
                });
            }

            async  testsendMessageToConversationForContactSeveralTimes(contactEmailToSearch = "vincent03@vbe.test.openrainbow.net", nbMsgToSend = 2, removeAllMessagesBeforeSend = false) {
                //let that = this;
                // Retrieve a contact by its id
                let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
                // Retrieve the associated conversation
                let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
                if (removeAllMessagesBeforeSend && conversation?.id) {
                    await rainbowSDK.conversations.deleteAllMessageInOneToOneConversation(conversation);
                }
                let msgsSent = [];
                for (let i = 1; i <= nbMsgToSend; i++) {
                    let now = new Date().getTime();
                    // Send message
                    //let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now, "middle");
                    let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                    // _logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                    // _logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                    msgsSent.push(msgSent);
                    _logger.log("debug", "MAIN - testsendMessageToConversationForContact - wait for message to be in conversation : ", msgSent);
                    await pause(300);
                    // */
            /* await Utils.until(() => {
                return conversation.getMessageById(msgSent.id)!==undefined;
            }, "Wait for message to be added in conversation num : " + i);
            let msgDeleted = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
            _logger.log("debug", "MAIN - testsendMessageToConversationForContact - deleted in conversation the message : ", msgDeleted);
            // */
/*        }
    }
// */

    testeventrainbow_onconversationchanged() {
        _logger.log("info", "MAIN - (testeventrainbow_onconversationchanged) ", _logger.colors.cyan("rainbow_onconversationchanged"), " started.");
        rainbowSDK.events.on("rainbow_onconversationchanged", async function (conversation) {
            try {
                _logger.log("debug", "MAIN - (testeventrainbow_onconversationchanged) ", _logger.colors.cyan("rainbow_onconversationchanged"), " conversation.name : ", conversation.name, ", conversation.id : ", conversation.id, ", conversation.messages.length : ", conversation?.messages?.length);
            } catch (err) {
                _logger.log("error", "MAIN - (testeventrainbow_onconversationchanged) rainbow_onconversationchanged CATCH Error !!!");
            }
        });
    }

    testLogs () {
        /*
         "error" = 0,
 "warn" = 1,
 "info" = 2,
 "trace" = 3,
 "http" = 4,
 "xmpp" = 5,
 "debug" = 6,
 "internalerror" = 7,
 "internal" = 8,
         */
        _logger.log("error","MAIN - testLogs error.");
        _logger.log("warn","MAIN - testLogs warn.");
        _logger.log("info","MAIN - testLogs info.");
        _logger.log("trace","MAIN - testLogs trace.");
        _logger.log("http","MAIN - testLogs http.");
        _logger.log("xmpp","MAIN - testLogs xmpp.");
        _logger.log("debug","MAIN - testLogs debug.");
        _logger.log("internalerror","MAIN - testLogs internalerror.");
        _logger.log("internal","MAIN - testLogs internal.");
    }

    testMessagesQueue () {
        try {
            let msg1 = {id: "MSG1", content: "message1"};
            let msg2 = {id: "MSG2", content: "message2"};
            let msg3 = {id: "MSG3", content: "message3"};
            let msgQueue = new MessagesQueue(_logger, 10);

            msgQueue.updateMessageIfExistsElseEnqueueIt(msg1, true);
            msgQueue.updateMessageIfExistsElseEnqueueIt(msg2, true);
            msgQueue.updateMessageIfExistsElseEnqueueIt(msg3, true);
            _logger.log("debug", "MAIN - testMessagesQueue after store 3 messages msgQueue : ", msgQueue);
            _logger.log("debug", "MAIN - testMessagesQueue msgQueue[0] : ", msgQueue[0]);
            // _logger.log("debug","MAIN - testMessagesQueue msgQueue.queue[0] : ", msgQueue.queue[0]);

            // update an already existing message
            let msg2ToUpdate = {id: "MSG2", content: "message2Update"};
            msgQueue.updateMessageIfExistsElseEnqueueIt(msg2ToUpdate, true);
            _logger.log("debug", "MAIN - testMessagesQueue after update message (id=MSG2) msgQueue.toSmallString() : ", msgQueue.toSmallString());

            // remove a message
            msgQueue.removeMessage(msg2);
            _logger.log("debug", "MAIN - testMessagesQueue after removeMessage (id=MSG2) msgQueue : ", msgQueue);

            let msgIter = {id: "MSGiter", content: "messageIter"};
            for (let i = 0; i < 9; i++) {
                msgIter = {id: "MSGiter" + i, content: "messageIter" + i};
                msgQueue.updateMessageIfExistsElseEnqueueIt(msgIter, true);
            }
            _logger.log("debug", "MAIN - testMessagesQueue after adding 8 message to overflow the queue size msgQueue : ", msgQueue);
            msgQueue.clear();
            _logger.log("debug", "MAIN - testMessagesQueue after clear message : ", msgQueue);
        } catch (err) {
            _logger.log("error", "MAIN - testMessagesQueue CATCH Error !!! error : ", err);
        }
    }

    async  testsendMessageToConversationForContactSeveralTimes(contactEmailToSearch = "vincent03@vbe.test.openrainbow.net", nbMsgToSend = 2, removeAllMessagesBeforeSend = false) {
        //let that = this;
        // Retrieve a contact by its id
        let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
        // Retrieve the associated conversation
        let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
        if (removeAllMessagesBeforeSend && conversation?.id) {
            await rainbowSDK.conversations.deleteAllMessageInOneToOneConversation(conversation);
        }
        let msgsSent = [];
        for (let i = 1; i <= nbMsgToSend; i++) {
            let now = new Date().getTime();
            // Send message
            //let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now, "middle");
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
            // _logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            // _logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            _logger.log("debug", "MAIN - testsendMessageToConversationForContact - wait for message to be in conversation : ", msgSent);
            await pause(300);
            /* await Utils.until(() => {
                return conversation.getMessageById(msgSent.id)!==undefined;
            }, "Wait for message to be added in conversation num : " + i);
            let msgDeleted = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
            _logger.log("debug", "MAIN - testsendMessageToConversationForContact - deleted in conversation the message : ", msgDeleted);
            // */
        }
        }

        async testsendMessageToConversationForContactIrles() {
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
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
        }

        async testsendMessageToJid() {
            //let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent02@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let nbMsgToSend = 1;
            let msgsSent = [];
            for (let i = 1; i <= nbMsgToSend; i++) {
                let now = new Date().getTime();
                // Send message
                let msgSent = await rainbowSDK.im.sendMessageToJid("hello num " + i + " from node : " + now, contact.jid, "FR", null, "Le sujet de node : " + now);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testsendMessageToJid - wait for message to be in conversation : ", msgSent);
            }
        }

        testsendMessageToConversation() {
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
                    _logger.log("debug", "MAIN - testHDS sendMessageToConversation - result : ", result);
                    _logger.log("debug", "MAIN - testHDS sendMessageToConversation - conversation : ", conversation);
                });
            });
        }

        async testsendMessageToConversation_html() {
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
                _logger.log("debug", "MAIN - testsendMessageToConversation_html sendMessageToConversation - result : ", result);
                _logger.log("debug", "MAIN - testsendMessageToConversation_html sendMessageToConversation - conversation : ", conversation);
            });
        }

        async testSendMessageToJid() {
            let that = this;
            let contactEmailToSearch = "alice01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJid", contact.jid, "FR", null, "Le sujet de node testSendMessageToJid").then((result) => {
                _logger.log("debug", "MAIN - testSendMessageToJid sendMessageToJid - result : ", result);
            });
        }

        async testSendMessageToVincent02() {
            let that = this;
            let contactEmailToSearch = "vincent02@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJid", contact.jid, "FR", null, "Le sujet de node testSendMessageToJid").then((result) => {
                _logger.log("debug", "MAIN - testSendMessageToJid sendMessageToJid - result : ", result);
            });
        }

        async testsendCorrectedChatMessage() {
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
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testsendCorrectedChatMessage - wait for message to be in conversation : ", msgSent);
                await until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.content;
            _logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
            setTimeout(async () => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                    _logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
                });
                _logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
            }, 10000);
        }

        async testsendCorrectedChatMessageWithContent() {
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
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testsendCorrectedChatMessageWithContent - wait for message to be in conversation : ", msgSent);
                await until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.content;
            _logger.log("debug", "MAIN - testsendCorrectedChatMessageWithContent - msgStrModified : ", msgStrModified);
            setTimeout(async () => {
                let now = new Date().getTime();
                let txt = "# Test modified " + now + " \n" +
                    "\n" +
                    "Here is the test in **Rainbow-Node-SDK**\n";
                let content = {
                    message: txt,
                    type: "text/markdown"
                };

                // let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id, content).catch((err) => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, undefined, msgSentOrig.id, content).catch((err) => {
                    _logger.log("error", "MAIN- testsendCorrectedChatMessageWithContent - error sendCorrectedChatMessage : ", err);
                });
                _logger.log("debug", "MAIN- testsendCorrectedChatMessageWithContent - msgCorrectedSent : ", msgCorrectedSent);
            }, 10000);
        }

        formatCard(msg, utc) {
            return JSON.stringify({
                "version": "1.1",
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "Container",
                        "items": [{"type": "TextBlock", "text": msg + " Hey! How are you? " + utc, "wrap": "True"}]
                    },
                    {
                        "type": "ActionSet", "actions": [
                            {
                                "title": "great",
                                "type": "Action.Submit",
                                "data": {
                                    "rainbow": {
                                        "type": "messageBack",
                                        "value": {"response": "mood_great"},
                                        "text": "great"
                                    }
                                }
                            },
                            {
                                "title": "super sad",
                                "type": "Action.Submit",
                                "data": {
                                    "rainbow": {
                                        "type": "messageBack",
                                        "value": {"response": "mood_unhappy"},
                                        "text": "super sad"
                                    }
                                }
                            }
                        ]
                    }
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
            })
        }

        formatCard2(msg, utc) {
            //return "<![CDATA[{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"size\":\"large\",\"weight\":\"bolder\",\"text\":\" Welcome to the MCQ Test" + msg + ":" + utc + "\",\"horizontalAlignment\":\"center\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"TextBlock\",\"size\":\"medium\",\"weight\":\"bolder\",\"text\":\" Are you ready ?\",\"horizontalAlignment\":\"left\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"Input.ChoiceSet\",\"id\":\"MCQSelection\",\"label\":\"\",\"value\":\"\",\"size\":\"medium\",\"weight\":\"bolder\",\"style\":\"expanded\",\"isRequired\":false,\"errorMessage\":\"Selection is required\",\"choices\":[]},{\"type\":\"TextBlock\",\"id\":\"Information\",\"size\":\"Medium\",\"weight\":\"Bolder\",\"text\":\"MCQ Test started\",\"horizontalAlignment\":\"Center\",\"wrap\":true,\"style\":\"heading\",\"color\":\"Good\",\"isVisible\":false}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Go !\",\"data\":{\"rainbow\":{\"type\":\"messageBack\",\"value\":{},\"text\":\"\"},\"questionId\":\"00\"}}]}]]>";
            return "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"size\":\"large\",\"weight\":\"bolder\",\"text\":\" Welcome to the MCQ Test" + msg + ":" + utc + "\",\"horizontalAlignment\":\"center\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"TextBlock\",\"size\":\"medium\",\"weight\":\"bolder\",\"text\":\" Are you ready ?\",\"horizontalAlignment\":\"left\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"Input.ChoiceSet\",\"id\":\"MCQSelection\",\"label\":\"\",\"value\":\"\",\"size\":\"medium\",\"weight\":\"bolder\",\"style\":\"expanded\",\"isRequired\":false,\"errorMessage\":\"Selection is required\",\"choices\":[]},{\"type\":\"TextBlock\",\"id\":\"Information\",\"size\":\"Medium\",\"weight\":\"Bolder\",\"text\":\"MCQ Test started\",\"horizontalAlignment\":\"Center\",\"wrap\":true,\"style\":\"heading\",\"color\":\"Good\",\"isVisible\":false}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Go !\",\"data\":{\"rainbow\":{\"type\":\"messageBack\",\"value\":{},\"text\":\"\"},\"questionId\":\"00\"}}]}";
        }

        formatCard3(msg, utc) {
            //return "<![CDATA[{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"size\":\"large\",\"weight\":\"bolder\",\"text\":\" Question 1/5\",\"horizontalAlignment\":\"center\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"TextBlock\",\"size\":\"medium\",\"weight\":\"bolder\",\"text\":\" What was the first emoticon ever used?\",\"horizontalAlignment\":\"left\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"Input.ChoiceSet\",\"id\":\"MCQSelection\",\"label\":\"\",\"value\":\"\",\"size\":\"medium\",\"weight\":\"bolder\",\"style\":\"expanded\",\"isRequired\":true,\"errorMessage\":\"Selection is required\",\"choices\":[{\"title\":\"ðŸ˜€\",\"value\":\"A\"},{\"title\":\"ðŸ™‚\",\"value\":\"B\"},{\"title\":\"ðŸ™\",\"value\":\"C\"},{\"title\":\"ðŸ˜›\",\"value\":\"D\"}]},{\"type\":\"TextBlock\",\"id\":\"Information\",\"size\":\"Medium\",\"weight\":\"Bolder\",\"text\":\"Answered\",\"horizontalAlignment\":\"Center\",\"wrap\":true,\"style\":\"heading\",\"color\":\"Good\",\"isVisible\":false}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"rainbow\":{\"type\":\"messageBack\",\"value\":{},\"text\":\"\"},\"questionId\":\"01\"}}]}]]>";
            return "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"size\":\"large\",\"weight\":\"bolder\",\"text\":\" Question 1/5\",\"horizontalAlignment\":\"center\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"TextBlock\",\"size\":\"medium\",\"weight\":\"bolder\",\"text\":\" What was the first emoticon ever used? " + msg + " : " + utc + " : \",\"horizontalAlignment\":\"left\",\"wrap\":true,\"style\":\"heading\"},{\"type\":\"Input.ChoiceSet\",\"id\":\"MCQSelection\",\"label\":\"\",\"value\":\"\",\"size\":\"medium\",\"weight\":\"bolder\",\"style\":\"expanded\",\"isRequired\":true,\"errorMessage\":\"Selection is required\",\"choices\":[{\"title\":\"ðŸ˜€\",\"value\":\"A\"},{\"title\":\"ðŸ™‚\",\"value\":\"B\"},{\"title\":\"ðŸ™\",\"value\":\"C\"},{\"title\":\"ðŸ˜›\",\"value\":\"D\"}]},{\"type\":\"TextBlock\",\"id\":\"Information\",\"size\":\"Medium\",\"weight\":\"Bolder\",\"text\":\"Answered\",\"horizontalAlignment\":\"Center\",\"wrap\":true,\"style\":\"heading\",\"color\":\"Good\",\"isVisible\":false}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"rainbow\":{\"type\":\"messageBack\",\"value\":{},\"text\":\"\"},\"questionId\":\"01\"}}]}";
        }

        displayCard(message) {
            let formattedMessage = this.formatCard("", "");
            /*rainbowSDK.im.sendMessageToJid(formattedMessage, message.fromJid, "en", {
           "type": "form/json",
           "message": formattedMessage
       }).catch(error => {
          _logger.error("Error sending card: ", error);
       }); //*/
        }

        async testsendMessageToConversationWithContentAdaptiveCardWithHiddenAckResponse() {
            let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 1;
            let msgsSent = [];
            let now = new Date().getTime();
            let formattedMessage = that.formatCard2("original msg : ", now);
            let content = {
                "type": "form/json",
                "message": formattedMessage
            }
            // Send message
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "Welcome to the MCQ Test", "en", content, undefined);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            _logger.log("debug", "MAIN - testsendMessageToConversationWithContentAdaptiveCardWithHiddenAckResponse - wait for message to be in conversation : ", msgSent);
            await until(() => {
                return conversation.getMessageById(msgSent.id)!==undefined;
            }, "Wait for message to be added in conversation.");
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.content;
            _logger.log("debug", "MAIN - testsendMessageToConversationWithContentAdaptiveCardWithHiddenAckResponse - msgStrModified : ", msgStrModified);
        }

        async testsendCorrectedChatMessageWithContentAdaptiveCard() {
            let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 1;
            let msgsSent = [];
            let now = new Date().getTime();
            let formattedMessage = that.formatCard2("original msg : ", now);
            let content = {
                "type": "form/json",
                "message": formattedMessage
            }
            // Send message
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "Welcome to the MCQ Test", "en", content, undefined);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            _logger.log("debug", "MAIN - testsendCorrectedChatMessageWithContentAdaptiveCard - wait for message to be in conversation : ", msgSent);
            await until(() => {
                return conversation.getMessageById(msgSent.id)!==undefined;
            }, "Wait for message to be added in conversation.");
            let msgSentOrig = msgsSent.slice(-1)[0]; // get last message from tab.
            let msgStrModified = "modified : " + msgSentOrig.content;
            _logger.log("debug", "MAIN - testsendCorrectedChatMessageWithContentAdaptiveCard - msgStrModified : ", msgStrModified);
            setTimeout(async () => {

                formattedMessage = that.formatCard3("modified msg : ", now);
                content = {
                    "type": "form/json",
                    "message": formattedMessage
                }
                // content = "{ \"type\": \"form/json\", \"message\": \"{\\"\$schema\\":\\"http://adaptivecards.io/schemas/adaptive-card.json\\",\\"type\\":\\"AdaptiveCard\\",\\"version\\":\\"1.5\\",\\"body\\":[{\\"type\\":\\"TextBlock\\",\\"size\\":\\"large\\",\\"weight\\":\\"bolder\\",\\"text\\":\\" Question 1/5\\",\\"horizontalAlignment\\":\\"center\\",\\"wrap\\":true,\\"style\\":\\"heading\\"},{\\"type\\":\\"TextBlock\\",\\"size\\":\\"medium\\",\\"weight\\":\\"bolder\\",\\"text\\":\\" What was the first emoticon ever used? \" +  msg + \" : \" + utc + \" : \\",\\"horizontalAlignment\\":\\"left\\",\\"wrap\\":true,\\"style\\":\\"heading\\"},{\\"type\\":\\"Input.ChoiceSet\\",\\"id\\":\\"MCQSelection\\",\\"label\\":\\"\\",\\"value\\":\\"\\",\\"size\\":\\"medium\\",\\"weight\\":\\"bolder\\",\\"style\\":\\"expanded\\",\\"isRequired\\":true,\\"errorMessage\\":\\"Selection is required\\",\\"choices\\":[{\\"title\\":\\"ðŸ˜€\\",\\"value\\":\\"A\\"},{\\"title\\":\\"ðŸ™‚\\",\\"value\\":\\"B\\"},{\\"title\\":\\"ðŸ™\\",\\"value\\":\\"C\\"},{\\"title\\":\\"ðŸ˜›\\",\\"value\\":\\"D\\"}]},{\\"type\\":\\"TextBlock\\",\\"id\\":\\"Information\\",\\"size\\":\\"Medium\\",\\"weight\\":\\"Bolder\\",\\"text\\":\\"Answered\\",\\"horizontalAlignment\\":\\"Center\\",\\"wrap\\":true,\\"style\\":\\"heading\\",\\"color\\":\\"Good\\",\\"isVisible\\":false}],\\"actions\\":[{\\"type\\":\\"Action.Submit\\",\\"title\\":\\"Submit\\",\\"data\\":{\\"rainbow\\":{\\"type\\":\\"messageBack\\",\\"value\\":{},\\"text\\":\\"\\"},\\"questionId\\":\\"01\\"}}]}\" }" ;

                // let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id, content).catch((err) => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, "Question 1/5", msgSentOrig.id, content).catch((err) => {
                    _logger.log("error", "MAIN- testsendCorrectedChatMessageWithContentAdaptiveCard - error sendCorrectedChatMessage : ", err);
                });
                _logger.log("debug", "MAIN- testsendCorrectedChatMessageWithContentAdaptiveCard - msgCorrectedSent : ", msgCorrectedSent);
            }, 20000);
        }

        async testsendForwardedChatMessageWithContentAdaptiveCard() {
            let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 1;
            let msgsSent = [];
            let now = new Date().getTime();
            let formattedMessage = that.formatCard2("original msg : ", now);
            let content = {
                "type": "form/json",
                "message": formattedMessage
            }
            // Send message
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "Welcome to the MCQ Test", "en", content, undefined);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            _logger.log("debug", "MAIN - testsendForwardedChatMessageWithContentAdaptiveCard - wait for message to be in conversation : ", msgSent);
            await until(() => {
                return conversation.getMessageById(msgSent.id)!==undefined;
            }, "Wait for message to be added in conversation.");
            let msgSentOrig = msgsSent.slice(-1)[0]; // get last message from tab.
            let msgStrModified = "modified : " + msgSentOrig.content;
            _logger.log("debug", "MAIN - testsendForwardedChatMessageWithContentAdaptiveCard - msgStrModified : ", msgStrModified);
            setTimeout(async () => {

                formattedMessage = that.formatCard3("modified msg : ", now);
                content = {
                    "type": "form/json",
                    "message": formattedMessage
                }
                // content = "{ \"type\": \"form/json\", \"message\": \"{\\"\$schema\\":\\"http://adaptivecards.io/schemas/adaptive-card.json\\",\\"type\\":\\"AdaptiveCard\\",\\"version\\":\\"1.5\\",\\"body\\":[{\\"type\\":\\"TextBlock\\",\\"size\\":\\"large\\",\\"weight\\":\\"bolder\\",\\"text\\":\\" Question 1/5\\",\\"horizontalAlignment\\":\\"center\\",\\"wrap\\":true,\\"style\\":\\"heading\\"},{\\"type\\":\\"TextBlock\\",\\"size\\":\\"medium\\",\\"weight\\":\\"bolder\\",\\"text\\":\\" What was the first emoticon ever used? \" +  msg + \" : \" + utc + \" : \\",\\"horizontalAlignment\\":\\"left\\",\\"wrap\\":true,\\"style\\":\\"heading\\"},{\\"type\\":\\"Input.ChoiceSet\\",\\"id\\":\\"MCQSelection\\",\\"label\\":\\"\\",\\"value\\":\\"\\",\\"size\\":\\"medium\\",\\"weight\\":\\"bolder\\",\\"style\\":\\"expanded\\",\\"isRequired\\":true,\\"errorMessage\\":\\"Selection is required\\",\\"choices\\":[{\\"title\\":\\"ðŸ˜€\\",\\"value\\":\\"A\\"},{\\"title\\":\\"ðŸ™‚\\",\\"value\\":\\"B\\"},{\\"title\\":\\"ðŸ™\\",\\"value\\":\\"C\\"},{\\"title\\":\\"ðŸ˜›\\",\\"value\\":\\"D\\"}]},{\\"type\\":\\"TextBlock\\",\\"id\\":\\"Information\\",\\"size\\":\\"Medium\\",\\"weight\\":\\"Bolder\\",\\"text\\":\\"Answered\\",\\"horizontalAlignment\\":\\"Center\\",\\"wrap\\":true,\\"style\\":\\"heading\\",\\"color\\":\\"Good\\",\\"isVisible\\":false}],\\"actions\\":[{\\"type\\":\\"Action.Submit\\",\\"title\\":\\"Submit\\",\\"data\\":{\\"rainbow\\":{\\"type\\":\\"messageBack\\",\\"value\\":{},\\"text\\":\\"\\"},\\"questionId\\":\\"01\\"}}]}\" }" ;

                // let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id, content).catch((err) => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, "Question 1/5", msgSentOrig.id, content).catch((err) => {
                    _logger.log("error", "MAIN- testsendForwardedChatMessageWithContentAdaptiveCard - error sendCorrectedChatMessage : ", err);
                });
                _logger.log("debug", "MAIN- testsendForwardedChatMessageWithContentAdaptiveCard - msgCorrectedSent : ", msgCorrectedSent);
            }, 20000);
        }

        formatCardUrgent(msg, utc) {
            return JSON.stringify({
                "version": "1.1",
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "Container",
                        "items": [{"type": "TextBlock", "text": msg + " Hey! How are you? " + utc, "wrap": "True"}]
                    },
                    {
                        "type": "ActionSet", "actions": [
                            {
                                "title": "great",
                                "type": "Action.Submit",
                                "data": {
                                    "rainbow": {
                                        "type": "messageBack",
                                        "value": {"response": "mood_great"},
                                        "text": "great"
                                    }
                                }
                            },
                            {
                                "title": "reply urgent",
                                "type": "Action.Submit",
                                "data": {
                                    "rainbow": {
                                        "type": "messageBack",
                                        "value": {"response": "mood_unhappy"},
                                        "text": "reply urgent sad",
                                        "urgency": "high"
                                    }, "urgency": "high", "mentions": "@vincent01", "urlMetadata": "metadata"
                                }
                            }
                        ]
                    }
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
            })
        }

        async testsendChatMessageWithContentAdaptiveCardUrgent() {
            let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 1;
            let msgsSent = [];
            let now = new Date().getTime();
            let formattedMessage = that.formatCardUrgent("original msg : ", now);
            let content = {
                "type": "form/json",
                "message": formattedMessage
            }
            // Send message
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "Welcome to the MCQ Test", "en", content, undefined);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
        }

        formatCardLang (msg, utc) {
            const adaptiveCard =  JSON.stringify( {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "1.3",
                "body": [
                    {
                        "type": "TextBlock",
                        "text": "Configuration de la langue cible " + msg + " at " + utc,
                        "weight": "Bolder",
                        "size": "Medium"
                    },
                    {
                        "type": "Input.ChoiceSet",
                        "id": "targetLanguage",
                        "style": "compact",  // affiché sous forme de dropdown
                        "isMultiSelect": false,
                        "choices": [
                            { "title": "Albanian",                   "value": "sq" },
                            { "title": "Arabic",                     "value": "ar" },
                            { "title": "Armenian",                   "value": "hy" },
                            { "title": "Azerbaijani",                "value": "az" },
                            { "title": "Basque",                     "value": "eu" },
                            { "title": "Bosnian",                    "value": "bs" },
                            { "title": "Bulgarian",                  "value": "bg" },
                            { "title": "Burmese",                    "value": "my" },
                            { "title": "Catalan",                    "value": "ca" },
                            { "title": "Chinese (Simplified)",       "value": "zh" },
                            { "title": "Chinese (Traditional)",      "value": "zh-Hant" },
                            { "title": "Chinese (Traditional Hong Kong)", "value": "zh-HK" },
                            { "title": "Chinese (Traditional Taiwan)",    "value": "zh-TW" },
                            { "title": "Croatian",                   "value": "hr" },
                            { "title": "Czech",                      "value": "cs" },
                            { "title": "Danish",                     "value": "da" },
                            { "title": "Dutch",                      "value": "nl" },
                            { "title": "English (United Kingdom)",   "value": "en-GB" },
                            { "title": "English (United States)",    "value": "en" },
                            { "title": "Estonian",                   "value": "et" },
                            { "title": "Finnish",                    "value": "fi" },
                            { "title": "French (Canada)",            "value": "fr-CA" },
                            { "title": "French (France)",            "value": "fr" },
                            { "title": "Georgian",                   "value": "ka" },
                            { "title": "German (Germany)",           "value": "de" },
                            { "title": "German (Switzerland)",       "value": "de-CH" },
                            { "title": "Greek",                      "value": "el" },
                            { "title": "Hausa",                      "value": "ha" },
                            { "title": "Hebrew",                     "value": "he" },
                            { "title": "Hindi",                      "value": "hi" },
                            { "title": "Hungarian",                  "value": "hu" },
                            { "title": "Icelandic",                  "value": "is" },
                            { "title": "Indonesian",                 "value": "id" },
                            { "title": "Italian",                    "value": "it" },
                            { "title": "Japanese",                   "value": "ja" },
                            { "title": "Javanese",                   "value": "jv" },
                            { "title": "Kazakh",                     "value": "kk" },
                            { "title": "Korean",                     "value": "ko" },
                            { "title": "Kurdish",                    "value": "ku" },
                            { "title": "Kyrgyz",                     "value": "ky" },
                            { "title": "Latvian",                    "value": "lv" },
                            { "title": "Lithuanian",                 "value": "lt" },
                            { "title": "Macedonian",                 "value": "mk" },
                            { "title": "Malay",                      "value": "ms" },
                            { "title": "Mongolian",                  "value": "mn" },
                            { "title": "Norwegian",                  "value": "no" },
                            { "title": "Pashto",                     "value": "ps" },
                            { "title": "Persian (Farsi)",            "value": "fa" },
                            { "title": "Polish",                     "value": "pl" },
                            { "title": "Portuguese (Brazil)",        "value": "pt-BR" },
                            { "title": "Portuguese (Portugal)",      "value": "pt" },
                            { "title": "Punjabi",                    "value": "pa" },
                            { "title": "Romanian",                   "value": "ro" },
                            { "title": "Russian",                    "value": "ru" },
                            { "title": "Serbian",                    "value": "sr" },
                            { "title": "Slovak",                     "value": "sk" },
                            { "title": "Slovenian",                  "value": "sl" },
                            { "title": "Somali",                     "value": "so" },
                            { "title": "Spanish",                    "value": "es" },
                            { "title": "Swahili",                    "value": "sw" },
                            { "title": "Swedish",                    "value": "sv" },
                            { "title": "Tagalog",                    "value": "tl" },
                            { "title": "Tajik",                      "value": "tg" },
                            { "title": "Tamil",                      "value": "ta" },
                            { "title": "Thai",                       "value": "th" },
                            { "title": "Turkish",                    "value": "tr" },
                            { "title": "Turkmen",                    "value": "tk" },
                            { "title": "Ukrainian",                  "value": "uk" },
                            { "title": "Urdu",                       "value": "ur" },
                            { "title": "Vietnamese",                 "value": "vi" }
                        ]
                    }
                ],
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Submit",
                        "data": {
                            "action" : "submitform",
                            "rainbow": {
                                "type": "messageBack",
                                "value": {"response": "mood_unhappy"},
                                "text": ""
                            }
                        }
                    }
                ]
            });
            return adaptiveCard;
        }

        async testsendChatMessageWithContentAdaptiveCardLang() {
            let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let nbMsgToSend = 1;
            let msgsSent = [];
            let now = new Date().getTime();
            let formattedMessage = that.formatCardLang(" test msg ", now);
            let content = {
                "type": "form/json",
                "message": formattedMessage
            }
            // Send message
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "Adaptive Card Lang Test", "en", content, undefined);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
        }

        async testdeleteMessageFromConversation() {
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
                _logger.log("debug", "MAIN - testdeleteMessageFromConversation sendMessageToConversation - result : ", msgSent);
                _logger.log("debug", "MAIN - testdeleteMessageFromConversation sendMessageToConversation - conversation : ", conversation);

                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation id : " + conversation.id);

                let conversationWithMessagesRemoved = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
                _logger.log("debug", "MAIN - testdeleteMessageFromConversation - conversation with message removed : ", conversationWithMessagesRemoved);

            });
        }

        async testmodifyMessageFromConversation() {
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
                _logger.log("debug", "MAIN - testmodifyMessageFromConversation sendMessageToConversation - result : ", msgSent);
                _logger.log("debug", "MAIN - testmodifyMessageFromConversation sendMessageToConversation - conversation : ", conversation);

                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation id : " + conversation.id);

                let conversationWithMessagesRemoved = await rainbowSDK.conversations.deleteMessage(conversation, msgSent.id);
                _logger.log("debug", "MAIN - testmodifyMessageFromConversation - conversation with message removed : ", conversationWithMessagesRemoved);

            });
        }

        async testgetlastEditableMsg() {
            let that = this;
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            _logger.log("debug", "MAIN - testgetlastEditableMsg - result : ", conversation.getlastEditableMsg());
        }

        async testsendCorrectedChatMessageForBubble() {
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
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testsendCorrectedChatMessage - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation num : " + i);
            }
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.message;
            _logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
            setTimeout(async () => {
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                    _logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
                });
                _logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
            }, 5000);
        }

        async testsendCorrectedChatMessageForBubbleInExistingConversation() {
            //let that = this;
            let bubbleJib = "room_f829530bba37411896022878f81603ca@muc.vberder-all-in-one-dev-1.opentouch.cloud";
            let conversation = rainbowSDK.conversations.getConversationByBubbleJid(bubbleJib);
            await rainbowSDK.im.getMessagesFromConversation(conversation, 10);
            let msgSentOrig = conversation.getlastEditableMsg();
            let msgStrModified = "modified : " + msgSentOrig.content;
            setTimeout(async () => {
                _logger.log("debug", "MAIN - testsendCorrectedChatMessage - msgStrModified : ", msgStrModified);
                let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                    _logger.log("error", "MAIN- testsendCorrectedChatMessage - error sendCorrectedChatMessage : ", err);
                });
                _logger.log("debug", "MAIN- testsendCorrectedChatMessage - msgCorrectedSent : ", msgCorrectedSent);
            }, 5000);
        }

        async testdeleteAllMessageInOneToOneConversation() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            if (conversation && conversation.id) {
                let result = await rainbowSDK.conversations.deleteAllMessageInOneToOneConversation(conversation);
                _logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation deleteAllMessageInOneToOneConversation - result : ", result);
                _logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation deleteAllMessageInOneToOneConversation - conversation : ", conversation);
            } else {
                _logger.log("debug", "MAIN - testdeleteAllMessageInOneToOneConversation conversation empty or no id defined - conversation : ", conversation);
            }
        }

        async testSendMessageToJidOfMySelf() {
            let that = this;
            let contactEmailToSearch = options.credentials.login;
            _logger.log("debug", "MAIN - testSendMessageToJidOfMySelf contactEmailToSearch : ", contactEmailToSearch);
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            await rainbowSDK.im.sendMessageToJid("hello from node testSendMessageToJidOfMySelf", contact.jid, "FR", null, "Le sujet de node testSendMessageToJidOfMySelf").then((result) => {
                _logger.log("debug", "MAIN - testSendMessageToJidOfMySelf sendMessageToJid - result : ", result);
            }).catch((err) => {
                _logger.log("debug", "MAIN - testSendMessageToJidOfMySelf Error : ", err);
            });
        }

        async testSendMultipleMessages() {
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
                _logger.log("debug", "MAIN - testSendMultipleMessages - message to be sent in conversation : ", msgstr);
                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, msgstr, "FR", null, "Le sujet de node : " + now).catch((err) => {
                    _logger.log("internalerror", "MAIN - testSendMultipleMessages - error while sendMessageToConversation : ", err);
                });
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                msgsSent.push(msgSent);
                _logger.log("debug", "MAIN - testSendMultipleMessages - wait for message to be in conversation : ", msgSent);
                await Utils.until(() => {
                    return conversation.getMessageById(msgSent.id)!==undefined;
                }, "Wait for message to be added in conversation Msg : " + msgstr);
            }
            //let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
            //logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);
        }

        async testsendMessageToContactUrgencyMiddle() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            _logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after getContactByLoginEmail : ", contactVincent00);
            rainbowSDK.im.sendMessageToContact("Middle important message test", contactVincent00, null, null, null, 'middle').then((result) => {
                _logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after sendMessageToContact result : ", result);
            });
        }

        async testsendMessageToContactUrgencyHigh() {
            let contactEmailToSearchVincent00 = "vincent00@vbe.test.openrainbow.net";
            //let contactEmailToSearchVincent01 = "vincent01@vbe.test.openrainbow.net";
            //let utc = new Date().toJSON().replace(/-/g, "_");
            let contactVincent00 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearchVincent00);
            _logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after getContactByLoginEmail : ", contactVincent00);
            rainbowSDK.im.sendMessageToContact("High important message test", contactVincent00, null, null, null, 'high').then((result) => {
                _logger.log("debug", "MAIN - [testsendMessageToContactUrgencyMiddle] after sendMessageToContact result : ", result);
            });
        }

        async testgetMessagesFromConversation() {
            //let that = this;
            //let bubbleJib = "room_f829530bba37411896022878f81603ca@muc.vberder-all-in-one-dev-1.opentouch.cloud";
            //let conversation = rainbowSDK.conversations.getConversationByBubbleJid(bubbleJib);
            //await rainbowSDK.im.getMessagesFromConversation(conversation, 10);
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();

            for (const bubble of bubbles) {
                //if (bubble.name.indexOf("testBubbleEvents")!= -1) {
                if (bubble.name.indexOf("testBotName_2024/02/09T10:35:36.732ZGuestUser")!= -1) {
                    _logger.log("debug", "MAIN - testgetMessagesFromConversation Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive);
                    rainbowSDK.conversations.getConversationByBubbleId(bubble.id).then((result) => {
                    //rainbowSDK.conversations.getConversationByBubbleId("65c5fff8f3c002518b2e2a29").then((result) => {
                        _logger.log("debug", "MAIN - testgetMessagesFromConversation getConversationByBubbleId result : ", result);
                        rainbowSDK.im.getMessagesFromConversation(result).then((res2) => {
                            _logger.log("debug", "MAIN - testgetMessagesFromConversation res2 : ", res2);
                        })
                    })
                } else {
                    _logger.log("debug", "MAIN - testgetMessagesFromConversation NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive);
                }
            }
        }

        testmsgInObj() {
            try {
                let msg1 = {id: "MSG1", content: "message1"};
                let msg2 = {id: "MSG2", content: "message2"};
                let msg3 = {id: "MSG3", content: "message3"};

                class ConversationService{
                    public conversations: any;
                    constructor(){
                        this.conversations = {};
                    }

                    getConversationById(conversationId : string) {
                        let that = this;
                        _logger.log("debug", "(getConversationById) conversationId : ", conversationId);
                        //that._logger.log(that.DEBUG, LOG_ID + " (getConversationById) conversationId : ", conversationId);
                        if (!this.conversations) {
                            return null;
                        }
                        let conv =  this.conversations[conversationId];
                        _logger.log("debug", "(getConversationById) conversation by id, id of conversation found : ", conv ? conv.id : "");
                        /* if (!conv) {
                            conv = that.getConversationByDbId(conversationId);
                            _logger.log("debug", "(getConversationById) conversation not found by id, so searched by dbId result : ", conv);
                        } // */
                        return conv;
                    }

                }

                let conversationService = new ConversationService();

                let conversationInitial = {
                    "id" : "123",
                    "msgQueue": new MessagesQueue(_logger, 10)
                };

                conversationInitial.msgQueue.updateMessageIfExistsElseEnqueueIt(msg1, true);
                conversationInitial.msgQueue.updateMessageIfExistsElseEnqueueIt(msg2, true);
                conversationInitial.msgQueue.updateMessageIfExistsElseEnqueueIt(msg3, true);
                _logger.log("debug", "MAIN - testMessagesQueue after store 3 messages msgQueue : ", conversationInitial.msgQueue.toSmallString());

                conversationService.conversations[conversationInitial.id] = conversationInitial;

                let conversation = conversationService.getConversationById(conversationInitial.id);

                //conversation.msgQueue.updateMessageIfExistsElseEnqueueIt({id: "MSG4", content: "message4"}, true);
                conversation.msgQueue.unshift({id: "MSG4", content: "message4"});
                _logger.log("debug", "MAIN - testMessagesQueue should have 4 messages conversationInitial msgQueue : ", conversationInitial.msgQueue.toSmallString());
                _logger.log("debug", "MAIN - testMessagesQueue should have 4 messages conversation msgQueue : ", conversation.msgQueue.toSmallString());


            } catch (err) {
                _logger.log("error", "MAIN - testMessagesQueue CATCH Error !!! error : ", err);
            }
        }

        async testgetMessagesFromConversationHistory(sendMsg:boolean=true, msgType:string = "adaptive") {
            //let that = this;
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(loginEmail);

            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let conversationId = conversation.id;

            if (sendMsg && msgType == "adaptive") {
                const card = JSON.stringify({
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.5',
                    body: [{type: "TextBlock", text: "Vive le SDK Node"}]
                });
                //const content = { type: 'form/json', message: card }
                const content = {
                    type: 'form/json',
                    message: this.formatCard3("modified msg : ", new Date().toLocaleTimeString())
                }
                let utc = new Date().toJSON().replace(/-/g, "_");
                const sentMessage = await rainbowSDK.im.sendMessageToJid('du texte at ' + utc, conversationId, 'en', content, null);
                _logger.log("debug", "MAIN - " +  `SENT MESS ID: ${sentMessage.id}, content : ${sentMessage.content}, alternativeContent: `, sentMessage.alternativeContent);

            }
            if (sendMsg && msgType == "markdown") {
                const card = JSON.stringify({
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.5',
                    body: [{type: "TextBlock", text: "Vive le SDK Node"}]
                });
                //const content = { type: 'form/json', message: card }
                const content = {
                    type: 'text/markdown',
                    message: "message de **test** " + new Date().toLocaleTimeString()
                }
                let utc = new Date().toJSON().replace(/-/g, "_");
                const sentMessage = await rainbowSDK.im.sendMessageToJid('du texte at ' + utc, conversationId, 'en', content, null);
                _logger.log("debug", "MAIN - " +  `SENT MESS ID: ${sentMessage.id}, content : ${sentMessage.content}, alternativeContent: `, sentMessage.alternativeContent);
            }
            await pause(10000);
            await rainbowSDK.im.getMessagesFromConversation(conversation, 1);
            if (conversation.messages) {
                _logger.log("debug", "MAIN - " +  `NB HISTORY MESSAGES : ${conversation.messages.length}`);
                conversation.messages.forEach(message => {
                    _logger.log("debug", "MAIN - " +  `message id: ${message.id}, content : ${message.content}, alternativeContent: `, message.alternativeContent);
                });
            }
        }

        async testDecodeXml2js () {

// Exemple d'utilisation
            let resultExpected = [
                {
                    message: '{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","version":"1.5","body":[{"type":"TextBlock","text":"Vive le SDK Node"}]}',
                    type: 'form/json'
                }
            ];


             let xmlStr = "<content xmlns=\"urn:xmpp:content\" type=\"form/json\">{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"text\":\"Vive le SDK Node\"}]}</content>";
            // */
            let jsonedObject = await getJsonFromXML(xmlStr);
            let parsedObject = jsonedObject.content;
            _logger.log("debug", "MAIN - testDecodeXml2js jsonedObject : ", jsonedObject);
            _logger.log("debug", "MAIN - testDecodeXml2js parsedObject : ", parsedObject);

            /*const parsedObject = {
                root: {
                    $: {xmlns: 'urn:xmpp:content', type: 'form/json'},
                    _: {
                        schema: ['http://adaptivecards.io/schemas/adaptive-card.json'],
                        version: ['1.5'],
                        body: [
                            {
                                item: [
                                    {type: ['TextBlock'], text: ['Vive le SDK Node']}
                                ]
                            }
                        ]
                    }
                }
            }; // */

            /*const decoded = getJsonFromXml2jsObject(parsedObject);
            _logger.log("debug", "MAIN - testDecodeXml2js decoded : ", decoded);
            // */
            //console.log(JSON.stringify(decoded, null, 2));
        }
        //endregion Messages

        //region group

        async testgetGroups(forceSearchOnServer) {
            let groups = await rainbowSDK.groups.getGroups();
            if (groups) {
                _logger.log("debug", "MAIN - testgetGroups - result groups : ", groups);
            } else {
                _logger.log("debug", "MAIN - testgetGroups - result groups not found.");
            }
        }

        async testdeleteAllGroups() {
            let that = this;
            _logger.log("debug", "MAIN - testdeleteAllGroups before delete");
            await rainbowSDK.groups.deleteAllGroups();
            _logger.log("debug", "MAIN - testdeleteAllGroups after delete");
        }

        async testsetGroupAsFavorite() {
            let that = this;
            //logger.log("debug", "testsetGroupAsFavorite before delete");
            let groupCreated = await rainbowSDK.groups.createGroup("myGroup", "commentGroup", false);
            _logger.log("debug", "MAIN - testsetGroupAsFavorite groupCreated : ", groupCreated);
            let groupUpdatedSet = await rainbowSDK.groups.setGroupAsFavorite(groupCreated);
            _logger.log("debug", "MAIN - testsetGroupAsFavorite groupUpdatedSet : ", groupUpdatedSet);
            await setTimeoutPromised(1500);
            let groupUpdatedUnset = await rainbowSDK.groups.unsetGroupAsFavorite(groupUpdatedSet);
            _logger.log("debug", "MAIN - testsetGroupAsFavorite groupUpdatedUnset : ", groupUpdatedUnset);
            await setTimeoutPromised(1500);
            let groupDeleted = await rainbowSDK.groups.deleteGroup(groupCreated);
            _logger.log("debug", "MAIN - testsetGroupAsFavorite groupDeleted : ", groupDeleted);
        }

        async testgetGroupByName(forceSearchOnServer) {
            //let groups = rainbowSDK.groups.getAll();
            //let group = groups.find(group => group.name === GROUP_NAME);
            let GROUP_NAME = "Services";
            //let forceSearchOnServer = false;
            let group = await rainbowSDK.groups.getGroupByName(GROUP_NAME, forceSearchOnServer!=null ? forceSearchOnServer:false);
            if (group) {
                let users = group.users.map(user => user.id)
                _logger.log("debug", "MAIN - testgetGroupByName - result users.length : ", users.length, ", users : ", users);
            } else {
                _logger.log("debug", "MAIN - testgetGroupByName - result group not found.");
            }
        }

        async testgetGroupsAndUpdateName(forceSearchOnServer) {
            let groups = await rainbowSDK.groups.getGroups();
            if (groups) {
                //let users = group.users.map(user => user.id)
                _logger.log("debug", "MAIN - testgetGroupsAndUpdateName - result groups : ", groups);
                await rainbowSDK.groups.updateGroupName(groups[0], "updatedGroupName_" + new Date().getTime());
                let groupsUpdated = await rainbowSDK.groups.getGroups();
                if (groupsUpdated) {
                    //let users = group.users.map(user => user.id)
                    _logger.log("debug", "MAIN - testgetGroupsAndUpdateName - result groupsUpdated : ", groupsUpdated);
                } else {
                    _logger.log("debug", "MAIN - testgetGroupsAndUpdateName - result groupsUpdated not found.");
                }
            } else {
                _logger.log("debug", "MAIN - testgetGroupsAndUpdateName - result group not found.");
            }
        }

        async testsetGroupAsFavoriteAndUpdateIsFavorite() {
            let that = this;
            //logger.log("debug", "testsetGroupAsFavoriteAndUpdateIsFavorite before delete");
            let groupCreated = await rainbowSDK.groups.createGroup("myGroup", "commentGroup", false);
            _logger.log("debug", "MAIN - testsetGroupAsFavoriteAndUpdateIsFavorite groupCreated : ", groupCreated);
            let groupUpdatedSet = await rainbowSDK.groups.setGroupAsFavorite(groupCreated);
            _logger.log("debug", "MAIN - testsetGroupAsFavoriteAndUpdateIsFavorite groupUpdatedSet : ", groupUpdatedSet);
            let groups = await rainbowSDK.groups.getGroups();
            _logger.log("debug", "MAIN - testsetGroupAsFavoriteAndUpdateIsFavorite groups : ", groups);

            await setTimeoutPromised(1500);

            let groups2 = await rainbowSDK.groups.getGroups();
            _logger.log("debug", "MAIN - testsetGroupAsFavoriteAndUpdateIsFavorite groups2 : ", groups2);


            let groupUpdatedUnset = await rainbowSDK.groups.unsetGroupAsFavorite(groupUpdatedSet);
            _logger.log("debug", "MAIN - testsetGroupAsFavoriteAndUpdateIsFavorite groupUpdatedUnset : ", groupUpdatedUnset);
            await setTimeoutPromised(1500);
            let groupDeleted = await rainbowSDK.groups.deleteGroup(groupCreated);
            _logger.log("debug", "MAIN - testsetGroupAsFavoriteAndUpdateIsFavorite groupDeleted : ", groupDeleted);
        }


        //endregion group

        // region Channels

        tesgetAllOwnedChannels() {
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            //let mychannel = mychannels ? mychannels[0]:null;
            //let utc = new Date().toJSON().replace(/-/g, "_");
            _logger.log("debug", "MAIN - tesgetAllOwnedChannels - mychannels : ", mychannels);
        }

        testChannelImage() {
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((result) => {
                _logger.log("debug", "MAIN - retrieveFileDescriptorsListPerOwner - result : ", result);
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
                        _logger.log("debug", "MAIN - createItem - res : ", res);
                    });
                }
            });
        }

        async testPublishMessageToChannel() {
            // use with vincent03@vbe.test.openrainbow.net sur .Net
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            if (mychannel) {
                let now = new Date().getTime();
                await rainbowSDK.channels.publishMessageToChannel(mychannel, "-- message : " + now, "title_", null, null, null, {tag: ["tag1", "tag2"]}).then((res) => {
                    _logger.log("debug", "MAIN - publishMessageToChannel - res : ", res);
                });
                pause(300);
            } else {
                _logger.log("debug", "MAIN - publishMessageToChannel - getAllOwnedChannel mychannel is empty, so can not publish.");
            }
        }

        async testPublishChannel() {
            // use with vincent03@vbe.test.openrainbow.net sur .Net
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            if (mychannel) {
                for (let i = 0; i < 100; i++) {
                    let now = new Date().getTime();
                    await rainbowSDK.channels.publishMessageToChannel(mychannel, "-- message : " + i + " : " + now, "title_" + i, null, null, null).then((res) => {
                        _logger.log("debug", "MAIN - createItem - res : ", res);
                    });
                    pause(300);
                }
            } else {
                _logger.log("debug", "MAIN - createItem - getAllOwnedChannel mychannel is empty, so can not publish.");
            }
        }

        async testgetDetailedAppreciationsChannel() {
            //let mychannel = await rainbowSDK.channels.getChannel("5dea7c6294e80144c1776fe1");
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel : ", mychannel);
            if (mychannel) {
                for (let i = 0; i < 1; i++) {
                    let now = new Date().getTime();
                    let itemId = "";
                    let item = await rainbowSDK.channels.fetchChannelItems(mychannel);
                    itemId = item[0].id;
                    rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                        _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - res : ", res);
                    });
                }
            } else {
                _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel is empty, so can not publish.");
            }
        }

        async testfetchChannelItems() {
            //let mychannel = await rainbowSDK.channels.getChannel("5dea7c6294e80144c1776fe1");
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel : ", mychannel);
            if (mychannel) {
                for (let i = 0; i < 1; i++) {
                    let now = new Date().getTime();
                    let itemId = "";
                    let items = await rainbowSDK.channels.fetchChannelItems(mychannel);
                    _logger.log("debug", "MAIN - testgetDetailedAtestfetchChannelItemsppreciationsChannel - items.length : ", items.length);

                    _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", items[0]);
                    _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", items[items.length - 1]);

                    /*itemId = items[0].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                   _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", itemId, ", res : ", res);
                });
                itemId = items[items.length - 1].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                   _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", itemId, ", res : ", res);
                }); // */
                }
            } else {
                _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel is empty, so can not publish.");
            }
        }

        async testfetchChannelItemsFromSubscribed() {
            //let mychannel = await rainbowSDK.channels.getChannel("5dea7c6294e80144c1776fe1");
            let mychannels = rainbowSDK.channels.getAllSubscribedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel : ", mychannel);
            if (mychannel) {
                for (let i = 0; i < 1; i++) {
                    let now = new Date().getTime();
                    let itemId = "";
                    let items = await rainbowSDK.channels.fetchChannelItems(mychannel);
                    _logger.log("debug", "MAIN - testgetDetailedAtestfetchChannelItemsppreciationsChannel - items.length : ", items.length);

                    _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", items[0]);
                    _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", items[items.length - 1]);

                    /*itemId = items[0].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                   _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", itemId, ", res : ", res);
                });
                itemId = items[items.length - 1].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                   _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", itemId, ", res : ", res);
                }); // */
                }
            } else {
                _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - getAllOwnedChannel mychannel is empty, so can not publish.");
            }
        }

        async testfetchChannelItemsFromRNodeSdkChangeLog() {
            let mychannel = await rainbowSDK.channels.getChannel("5dea7c6294e80144c1776fe1");
            //let mychannels = rainbowSDK.channels.getAllSubscribedChannels();
            //let mychannel = mychannels ? mychannels[0]:null;
            _logger.log("debug", "MAIN - testfetchChannelItemsFromRNodeSdkChangeLog - getChannel mychannel : ", mychannel);
            if (mychannel) {
                for (let i = 0; i < 1; i++) {
                    let now = new Date().getTime();
                    let itemId = "";
                    let items = await rainbowSDK.channels.fetchChannelItems(mychannel);
                    _logger.log("debug", "MAIN - testfetchChannelItemsFromRNodeSdkChangeLog fetchChannelItems - items.length : ", items.length);

                    _logger.log("debug", "MAIN - testfetchChannelItemsFromRNodeSdkChangeLog fetchChannelItems - First item itemId : ", items[0]);
                    _logger.log("debug", "MAIN - testfetchChannelItemsFromRNodeSdkChangeLog fetchChannelItems - Last item itemId : ", items[items.length - 1]);

                    /*itemId = items[0].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                   _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - First item itemId : ", itemId, ", res : ", res);
                });
                itemId = items[items.length - 1].id;
                rainbowSDK.channels.getDetailedAppreciations(mychannel, itemId).then((res) => {
                   _logger.log("debug", "MAIN - testgetDetailedAppreciationsChannel - Last item itemId : ", itemId, ", res : ", res);
                }); // */
                }
            } else {
                _logger.log("debug", "MAIN - testfetchChannelItemsFromRNodeSdkChangeLog - mychannel is empty, so can not publish.");
            }
        }

        async testcreateChannel() {
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            let utc = new Date().toJSON().replace(/-/g, "/");
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let channelCreated = await rainbowSDK.channels.createPublicChannel("testchannel" + utc, "test", "");
            _logger.log("debug", "MAIN - testcreateChannel createPublicChannel result : ", channelCreated); //logger.colors.green(JSON.stringify(result)));
            let tab: any = [{"id": contact.id}];
            let channelMembersAdded = await rainbowSDK.channels.addMembersToChannel(channelCreated, tab);
            _logger.log("debug", "MAIN - testcreateChannel - channelMembersAdded : ", channelMembersAdded);
            let channelinfo = await rainbowSDK.channels.fetchChannel(channelCreated.id);
            _logger.log("debug", "MAIN - testcreateChannel - channelinfo : ", channelinfo);
            /*rainbowSDK.channels.createItem(mychannel, "message : " + now, "title", null, tabImages).then((res) => {
           _logger.log("debug", "createItem - res : ", res);
        }); // */
        }

        testChannelDeleteMessage() {
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            rainbowSDK.channels.fetchChannelItems(mychannel).then((result) => {
                _logger.log("debug", "MAIN - getMessagesFromChannel - result : ", result);
                if (result && result.length > 0) {
                    let now = new Date().getTime();
                    let idToDelete = result.length - 1;
                    _logger.log("debug", "MAIN - getMessagesFromChannel - idToDelete : ", idToDelete);
                    rainbowSDK.channels.deleteItemFromChannel(mychannel.id, result[idToDelete].id).then((result) => {
                        _logger.log("debug", "MAIN - deleteMessageFromChannel - result : ", result);
                    });
                    /*rainbowSDK.channels.createItem(mychannel, "message : " + now, "title", null, null).then((res) => {
                   _logger.log("debug", "createItem - res : ", res);
                }); */
                }
            });
        }

        testChannelupdateChannelDescription() {
            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            let utc = new Date().toJSON().replace(/-/g, "_");
            rainbowSDK.channels.updateChannelDescription(mychannel, "desc_" + utc).then((result) => {
                _logger.log("debug", "MAIN - updateChannelDescription - result : ", result);
            }).catch(reason => {
                _logger.log("error", "MAIN - updateChannelDescription catch reject - reason : ", reason);
            });
        }

        testupdateChannelAvatar() {
            return __awaiter(this, void 0, void 0, function* () {
            });
        }

        async testCreateGuestCreateChannelPublishItem() {
            // To be used with vincent01 on .NET

            let firstname = "firstname_";
            let lastname = "lastname_" + new Date().getTime() + "_";
            let firstnameTemp = firstname;
            let lastnameTemp = lastname;
            let contact = await rainbowSDK.admin.createGuestUser(firstnameTemp, lastnameTemp, "fr", 10).catch((err) => {
                _logger.log("debug", "MAIN - (testcreateGuestUserError) error while creating guest user :  ", err);
            });

            let mychannels = rainbowSDK.channels.getAllOwnedChannels();
            let mychannel = mychannels ? mychannels[0]:null;
            let utc = new Date().toJSON().replace(/-/g, "/");
            //let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail(guestUser.loginEmail);
            let channelCreated = await rainbowSDK.channels.createPublicChannel("testchannel" + utc, "test", "");
            _logger.log("debug", "MAIN - testcreateChannel createPublicChannel result : ", channelCreated); //logger.colors.green(JSON.stringify(result)));
            let tab: any = [{"id": contact.id}];
            let channelMembersAdded = await rainbowSDK.channels.addMembersToChannel(channelCreated, tab);
            _logger.log("debug", "MAIN - testcreateChannel - channelMembersAdded : ", channelMembersAdded);
            let channelinfo = await rainbowSDK.channels.fetchChannel(channelCreated.id);
            _logger.log("debug", "MAIN - testcreateChannel - channelinfo : ", channelinfo);
            /*rainbowSDK.channels.createItem(mychannel, "message : " + now, "title", null, tabImages).then((res) => {
           _logger.log("debug", "createItem - res : ", res);
        }); // */


            if (contact) {
                _logger.log("debug", "MAIN - [testCleanAGuest    ] :: contact : ", contact);
                rainbowSDK.admin.deleteUser(contact.id).then(async (result) => {
                    _logger.log("debug", "MAIN - [testCleanAGuest    ] :: deleteUser result : ", result);
                });
            }
        }


        //endregion Channels

        //region Files

        downloadFile() {
            _logger.log("debug", "Main - downloadFile - file - ");
            rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceived: any) => {
                _logger.log("debug", "Main - downloadFile, retrieveFileDescriptorsListPerOwner - result : ", fileDescriptorsReceived);
                for (let fileReceived of fileDescriptorsReceived) {
                    _logger.log("debug", "Main - downloadFile - file - ", fileReceived);
                    rainbowSDK.fileStorage.downloadFile(fileReceived).then((blob: any) => {
                        _logger.log("debug", "Main - downloadFile - blob : ", blob.mime);
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

        async testgetAllFilesSentV1() {
            let that = this;
            for (let fd of rainbowSDK.fileStorage.getAllFilesSent()) {
                let fdjson = JSON.stringify(fd);
                _logger.log("debug", "Main - testgetAllFilesSentV1 Checking file fd.fileName : ", fd.fileName, ", JSON string : ", fdjson);
                let fileDescriptorFull = await rainbowSDK.fileStorage.retrieveOneFileDescriptor(fd.id);
                _logger.log("debug", `Main - testgetAllFilesSentV1 fileDescriptorFull : `, fileDescriptorFull);
            }
        }

        async testgetAllFilesReceived() {
            let that = this;
            for (let fd of rainbowSDK.fileStorage.getAllFilesReceived()) {
                _logger.log("debug", `Main - Checking file ${fd.fileName} ...`, fd);
                let fileDescriptorFull = await rainbowSDK.fileStorage.retrieveOneFileDescriptor(fd.id);
                _logger.log("debug", `Main - fileDescriptorFull : `, fileDescriptorFull);
            }
        }

        async testgetAllFilesSent() {
            let that = this;
            let filesSent = rainbowSDK.fileStorage.getAllFilesSent();
            let filesSentJSON = util.inspect(filesSent, false, 4, false);
            _logger.log("debug", "Main - testgetAllFilesSent Checking files stringified : ", filesSentJSON);

            /*for (let fd of filesSent) {
           _logger.log("debug", `Main - testgetAllFilesSent Checking file ${fd.fileName} ...`, fd);
            let fileDescriptorFull = await rainbowSDK.fileStorage.retrieveOneFileDescriptor(fd.id);
           _logger.log("debug", `Main - testgetAllFilesSent fileDescriptorFull : `, fileDescriptorFull);
        } // */
        }

        async testaddFileViewer() {
            let that = this;

            let user: Contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
            let filesDescriptors: [any] = await rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner();
            for (let fileDescriptor of filesDescriptors) {
                let fileName = fileDescriptor.fileName;
                _logger.log("debug", "Main - testaddFileViewer Checking file : ", fileName);
                let fileDescriptorFull = await rainbowSDK.fileStorage.retrieveOneFileDescriptor(fileDescriptor.id);
                _logger.log("debug", "Main - testaddFileViewer fileDescriptorFull : ", fileDescriptorFull);
                let fileShared = await rainbowSDK.fileStorage.addFileViewer(fileDescriptorFull.id, user.id, "user");
                _logger.log("debug", "Main - testaddFileViewer file shared : ", fileName);
            }
        }

        async testdownloadFile() {
            let that = this;
            for (let fd of rainbowSDK.fileStorage.getAllFilesReceived()) {
                _logger.log("debug", `Main - Checking file ${fd.fileName} ...`);
                if (!fs.existsSync("c:\\temp\\" + fd.fileName) || true) {
                    _logger.log("debug", `Main - TEST Downloading file ${fd.fileName} ...`);
                    if (fd.fileName!="app-ovgtw1_0_34.tar" && fd.fileName!="Delta_Player_on.png") {
                        //logger.log("debug", `Main - Will NOT Download file ${fd.fileName} done`);
                    } else {
                        _logger.log("debug", `Main - Will Download file ${fd.fileName} : `, fd);
                        // continue;
                        let file: any;
                        file = await rainbowSDK.fileStorage.downloadFile(fd);
                        _logger.log("debug", `Main - Downloading file ${fd.fileName} done`);
                        if (file) {
                            try {
                                let blobArray = file.buffer;

                                let writeStream = createWriteStream("c:\\temp\\" + fd.fileName);

                                writeStream.on('error', () => {
                                    _logger.log("debug", "Main - [RecordsService] WriteStream error event");
                                });
                                writeStream.on('drain', () => {
                                    _logger.log("debug", "Main - [RecordsService] WriteStream drain event");
                                });

                                for (let index = 0; index < blobArray.length; index++) {
                                    if (blobArray[index]) {
                                        _logger.log("debug", "[FileServerService] >writeAvailableChunksInDisk : Blob " + index + " available");
                                        //fd.chunkWrittenInDisk = index;
                                        writeStream.write(new Buffer(blobArray[index]));
                                        blobArray[index] = null;
                                    } else {
                                        _logger.log("debug", "[FileServerService] >writeAvailableChunksInDisk : Blob " + index + " NOT available");
                                        break;
                                    }
                                }
                                _logger.log("debug", `Main - The file ${fd.fileName} was saved!`);
                            } catch (e) {
                                _logger.log("debug", `Main - Error saving file ${fd.fileName} from Rainbow`, e);
                            }
                        } else {
                            _logger.log("error", `Main - Error downloading file ${fd.fileName}`);
                        }
                    }
                } else {
                    _logger.log("debug", `File ${fd.fileName} already downloaded`)
                }
            }
        }

        async testdownloadFileInPath() {
            let that = this;
            for (let fd of rainbowSDK.fileStorage.getAllFilesReceived()) {
                _logger.log("debug", `Main - Checking file ${fd.fileName} ...`);
                if (!fs.existsSync("c:\\temp\\" + fd.fileName) || true) {
                    _logger.log("debug", `MAIN - TEST Downloading file ${fd.fileName} ...`);
                    if (fd.fileName!="app-ovgtw1_0_34.tar") {
                        //if ( fd.fileName != "Delta_Player_on.png" ) {
                        //logger.log("debug", `Main - Will NOT Download file ${fd.fileName} done`);
                    } else {
                        _logger.log("debug", `Main - Will Download file ${fd.fileName} : `, fd);
                        // continue;
                        let file$: any;
                        file$ = await rainbowSDK.fileStorage.downloadFileInPath(fd, "c:\\temp\\");
                        let currentValue: any = 0;
                        file$.subscribe({
                            next(value) {
                                currentValue = value;
                                if (value < 101) {
                                    _logger.log("internal", "MAIN - (downloadFile) % : ", value);
                                } else {
                                    _logger.log("internal", "MAIN - value !< 101 : File downloaded in Next : ", currentValue ? currentValue.fileName:"");
                                    _logger.log("debug", "MAIN - File downloaded");
                                }
                            },
                            complete() {
                                if (currentValue < 101) {
                                    _logger.log("internal", "MAIN - (downloadFile) % : ", currentValue);
                                } else {
                                    _logger.log("internal", "MAIN - value !< 101 : File downloaded in Complete : ", currentValue ? currentValue.fileName:"");
                                    _logger.log("debug", "MAIN - File downloaded");
                                }
                            }
                        });
                        _logger.log("debug", `MAIN - Downloading file ${fd.fileName} done`);
                    }
                } else {
                    _logger.log("debug", `File ${fd.fileName} already downloaded`)
                }
            }
        }

        testUploadFileToConversation() {
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
            _logger.log("debug", "MAIN - uploadFileToConversation - file.name : ", file.name, ", file.type : ", file.type, ", file.path : ", file.path, ", file.size : ", file.size);
            rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function (contact) {
                // Retrieve the associated conversation
                return rainbowSDK.conversations.openConversationForContact(contact);
            }).then(function (conversation) {
                // Share the file
                return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
                    _logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
                });
            });
            //});
        }

        testUploadFileToConversationEmpty() {
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
            _logger.log("debug", "MAIN - uploadFileToConversation - file.name : ", file.name, ", file.type : ", file.type, ", file.path : ", file.path, ", file.size : ", file.size);
            rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function (contact) {
                // Retrieve the associated conversation
                return rainbowSDK.conversations.openConversationForContact(contact);
            }).then(function (conversation) {
                // Share the file
                return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
                    _logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
                }).catch((err) => {
                    _logger.log("error", "MAIN - uploadFileToConversation - error : ", err);
                });
            });
            //});
        }

        testUploadFileToConversationByPath() {
            let that = this;
            // let conversation = null;
            let file = null;
            //let strMessage = {message: "message for the file"};
            let strMessage = "message for the file";
            file = "c:\\temp\\IMG_20131005_173918XXXXXXXXXXX.jpg";
            _logger.log("debug", "MAIN - uploadFileToConversation - file : ", file);
            rainbowSDK.contacts.getContactByLoginEmail("vincent02@vbe.test.openrainbow.net").then(function (contact) {
                // Retrieve the associated conversation
                return rainbowSDK.conversations.openConversationForContact(contact);
            }).then(function (conversation) {
                // Share the file
                return rainbowSDK.fileStorage.uploadFileToConversation(conversation, file, strMessage).then((result) => {
                    _logger.log("debug", "MAIN - uploadFileToConversation - result : ", result);
                }).catch((errr) => {
                    _logger.log("error", "MAIN - uploadFileToConversation - error : ", errr);
                });
            });
            //});
        }

        testgetRainbowNodeSdkPackagePublishedInfos() {
            rainbowSDK._core._rest.getRainbowNodeSdkPackagePublishedInfos().then((infos: any) => {
                _logger.log("debug", "MAIN - testgetRainbowNodeSdkPackagePublishedInfos - infos : ", infos);
            });
        }

        testuploadFileToStorage() {
            let that = this;
            // let conversation = null;
            let file = null;
            //let strMessage = {message: "message for the file"};
            let strMessage = "message for the file";
            file = "c:\\temp\\IMG_20131005_173918.jpg";
            _logger.log("debug", "MAIN - uploadFileToStorage - file : ", file);
            // Share the file
            return rainbowSDK.fileStorage.uploadFileToStorage(file).then((result) => {
                _logger.log("debug", "MAIN - uploadFileToStorage - result : ", result);
            }).catch((errr) => {
                _logger.log("error", "MAIN - uploadFileToStorage - error : ", errr);
            });
        }

        testuploadFileToStorageBig() {
            let that = this;
            // let conversation = null;
            let file = null;
            //let strMessage = {message: "message for the file"};
            let strMessage = "message for the file";
            file = "c:\\temp\\fichiertestupload.txt";
            _logger.log("debug", "MAIN - testuploadFileToStorageBig - file : ", file);
            // Share the file
            return rainbowSDK.fileStorage.uploadFileToStorage(file).then((result) => {
                _logger.log("debug", "MAIN - testuploadFileToStorageBig - uploadFileToStorage result : ", result);
            }).catch((errr) => {
                _logger.log("error", "MAIN - testuploadFileToStorageBig - uploadFileToStorage error : ", errr);
            });
        }

        async testfileOwnershipChange() {
            let that = this;
            let contactEmail = "vincent03@vbe.test.openrainbow.net";
            //let contactEmail = "vincent.berder@al-enterprise.com";
            rainbowSDK.contacts.getContactByLoginEmail(contactEmail).then(async (contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testfileOwnershipChange    ] :: getContactByLoginEmail contact : ", contact);

                    try {


                        // let conversation = null;
                        let file = null;
                        //let strMessage = {message: "message for the file"};
                        let strMessage = "message for the file";
                        file = "c:\\temp\\IMG_20131005_173918.jpg";
                        _logger.log("debug", "MAIN - testfileOwnershipChange - file : ", file);
                        // Share the file
                        let fileStored: any = await rainbowSDK.fileStorage.uploadFileToStorage(file);
                        _logger.log("debug", "MAIN - testfileOwnershipChange - fileStored.id : ", fileStored.id, ", fileStored.fileName : ", fileStored.fileName, ", fileStored.url : ", fileStored.url, ", fileStored.ownerId : ", fileStored.ownerId);
                        let fileOwnerChanged = await rainbowSDK.fileStorage.fileOwnershipChange(fileStored.id, contact.id);
                        _logger.log("debug", "MAIN - testfileOwnershipChange - fileOwnerChanged.id : ", fileOwnerChanged.id, ", fileOwnerChanged.fileName : ", fileOwnerChanged.fileName, ", fileOwnerChanged.url : ", fileOwnerChanged.url, ", fileOwnerChanged.ownerId : ", fileOwnerChanged.ownerId);
                    } catch (err) {
                        _logger.log("error", "MAIN - testfileOwnershipChange - error : ", err);
                    }
                }
            });
        }

        testRetrieveOneFileDescriptor() {
            _logger.log("debug", "Main - testRetrieveOneFileDescriptor - file - ");
            let fileDescriptorsReceived = rainbowSDK.fileStorage.getFileDescriptorFromId("5cab49e3827d70023481c17a");
            _logger.log("debug", "Main - testRetrieveOneFileDescriptor, getFileDescriptorFromId - result : ", fileDescriptorsReceived);
            rainbowSDK.fileStorage.retrieveOneFileDescriptor("5cab49e3827d70023481c17a").then((fileDescriptorsReceived) => {
                _logger.log("debug", "Main - testRetrieveOneFileDescriptor, retrieveOneFileDescriptor - result : ", fileDescriptorsReceived);
            });
        }

        testretrieveSentFiles() {
            _logger.log("debug", "Main - testretrieveSentFiles - file - ");
            let loginEmail = "vincent02@vbe.test.openrainbow.net";

            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then((contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testretrieveSentFiles    ] :: getContactByLoginEmail result : ", contact);
                    rainbowSDK.fileStorage.retrieveSentFiles(contact.id).then((fileDescriptorsReceived) => {
                        _logger.log("debug", "Main - testretrieveSentFiles, retrieveSentFiles - result : ", fileDescriptorsReceived);
                    });
                }
            });
        }

        testretrieveSentFiles_adminbot2() {
            _logger.log("debug", "Main - testretrieveSentFiles - file - ");
            let loginEmail = "mailto:representaive2@al-mydemo.com";

            //rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then((contact: any) => {
              //  if (contact) {
                   // _logger.log("debug", "MAIN - [testretrieveSentFiles    ] :: getContactByLoginEmail result : ", contact);
                    rainbowSDK.fileStorage.retrieveSentFiles("5bc462d10ea5fc3e2d1384c7").then((fileDescriptorsReceived) => {
                        _logger.log("debug", "Main - testretrieveSentFiles, retrieveSentFiles - result : ", fileDescriptorsReceived);
                    });
//                }
 //           });
        }

        async testgetFileDescriptorsByCompanyId() {
            // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
            _logger.log("debug", "MAIN - testgetFileDescriptorsByCompanyId. ");
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
       _logger.log("debug", "MAIN - testgetFileDescriptorsByCompanyId - allCompanies : ", allCompanies.length);

        // */

            let filesDescriptors = await rainbowSDK.fileStorage.getFileDescriptorsByCompanyId(undefined, true);
            _logger.log("debug", "MAIN - testgetFileDescriptorsByCompanyId - filesDescriptors : ", filesDescriptors);

            /*let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
               _logger.log("debug", "MAIN - testretrieveRainbowUserList vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
       _logger.log("debug", "MAIN - testretrieveRainbowUserList - companyId : ", companyId);

        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
       _logger.log("debug", "MAIN - testretrieveRainbowUserList - result : ", result);
        // */

        }

        async testretrieveFileDescriptorsListPerOwner() {
            let filesDescriptors = await rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner();
            _logger.log("debug", "MAIN - testretrieveFileDescriptorsListPerOwner - filesDescriptors : ", filesDescriptors);
        }

        //endregion Files

        //region Bubbles

        testgetContactById_65269b10bd1d36463da3c89d() {
            // userid not existing in .Net platform
            rainbowSDK.contacts.getContactById("65269b10bd1d36463da3c89d").then((contact: any) => {
                _logger.log("debug", "MAIN - [testgetContactById_65269b10bd1d36463da3c89d    ] :: getContactById contact : ", contact);
            });
        }

        testgetContactById_aluno() {
            rainbowSDK.contacts.getContactById("63fe5655db963ffcf51516cf").then((contact: any) => {
                _logger.log("debug", "MAIN - [testgetContactById_aluno    ] :: getContactById contact : ", contact);
            });
        }

        testCreateBubble_Uniasselvi() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";

            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then((contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail result : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "_");
                    let withHistory = false;
                    rainbowSDK.bubbles.createBubble("TestBubbleBot" + utc, "TestBubbleBot" + utc, withHistory).then((bubble) => {
                        _logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble result : ", bubble);

                        rainbowSDK.events.on("rainbow_onbubbleaffiliationchanged", async (bubbleAffiliated) => {
                            _logger.log("debug", "MAIN - (rainbow_onbubbleaffiliationchanged) - affiliationchanged.");
                            if (bubbleAffiliated && bubbleAffiliated.users.filter((user) => {
                                let res = false;
                                if (user.userId===contact.id && user.status==="accepted") {
                                    res = true;
                                }
                                return res;
                            }).length===1) {
                                let utcMsg = new Date().getTime();
                                let message = "** Test message ** at " + utcMsg;
                                await setTimeoutPromised(2000);
                                await rainbowSDK.im.sendMessageToBubbleJid(message, bubbleAffiliated.jid, "en", {
                                    "type": "text/markdown",
                                    "message": message
                                }, "subject", undefined);
                            }
                        });

                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                        });
                    });
                }
            }); // */
        }

        testCreateBubbles() {
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
                    _logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);

                    physician.name = contact.title + " " + contact.firstname + " " + contact.lastname;
                    physician.contact = contact;
                    for (let i = 0; i < 1; i++) {
                        let utc = new Date().toJSON().replace(/-/g, "/");
                        let withInvitation = false;
                        rainbowSDK.bubbles.createBubble(physician.appointmentRoom + utc + contact + "_" + i, physician.appointmentRoom + utc + "_" + i, withInvitation).then((bubble) => {
                            _logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);

                            rainbowSDK.events.on("rainbow_onbubbleaffiliationchanged", async (bubbleAffiliated) => {
                                // do something when the SDK has been started
                                _logger.log("debug", "MAIN - (rainbow_onbubbleaffiliationchanged) - affiliationchanged : ");
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
                               _logger.log("debug", "MAIN testCreateBubbles - after deleteBubble - bubble : ", bubble, ", bubbles : ", bubbles);
                            }); */
                                /*rainbowSDK.contacts.getContactByLoginEmail(botappointment).then(contactbot => {
                                rainbowSDK.bubbles.inviteContactToBubble(contactbot, bubble, false, false).then(function () {
                                    setTimeout(() => { rainbowSDK.bubbles.promoteContactInBubble(contactbot, bubble).then(function (updatedBubble) {
                                        rainbowSDK.conversations.getBubbleConversation(updatedBubble).then(conversation => {
                                          _logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok", conversation);
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

        async testCreateBubbleAndSendMessage() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                        _logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
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

        async testCreateBubbleAndInvite() {
            let loginEmail = "vincent01@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot_";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbleAndInvite    ] :: getContactByLoginEmail contact : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                        _logger.log("debug", "MAIN - [testCreateBubbleAndInvite    ] :: createBubble request ok", bubble);
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

        async testCreateBubbleWithNoInvitationAndSendMessage() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                        _logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
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

        async testCreateBubbleWithNoInvitationAndSendMessageAndRemoveAllMessages() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                        _logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                            let message = "message de **test** ";
                            await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                                "type": "text/markdown",
                                "message": message + "_1"
                            }, "subject", undefined, "middle");
                            await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                                "type": "text/markdown",
                                "message": message + "_2"
                            }, "subject", undefined, "middle");
                            // */

                            // Retrieve the associated conversation
                            let conversation = await rainbowSDK.conversations.openConversationForBubble(bubble);
                            let nbMsgToSend = 2;
                            let msgsSent = [];
                            for (let i = 1; i <= nbMsgToSend; i++) {
                                let now = new Date().getTime();
                                // Send message
                                let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "hello num " + i + " from node : " + now, "FR", null, "Le sujet de node : " + now);
                                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
                                //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
                                msgsSent.push(msgSent);
                                _logger.log("debug", "MAIN - testremoveAllMessages - wait for message to be in conversation : ", msgSent);
                                await Utils.until(() => {
                                    return conversation.getMessageById(msgSent.id)!==undefined;
                                }, "Wait for message to be added in conversation num : " + i);
                            }
                            let conversationWithMessagesRemoved = await rainbowSDK.conversations.removeAllMessages(conversation);
                            _logger.log("debug", "MAIN - testremoveAllMessages - conversation with messages removed : ", conversationWithMessagesRemoved);

                        });
                    });
                }
            }); // */
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

    async testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";

            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage    ] :: getContactByLoginEmail contact : ", contact);
                    let utc = new Date().toJSON().replace(/-/g, "/");
                    await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + 1, appointmentRoom + utc + "_" + 1).then(async (bubble: any) => {
                        _logger.log("debug", "MAIN - [testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage    ] :: createBubble request ok", bubble);
                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                            let message = "message de **test** ";
                            await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                                "type": "text/markdown",
                                "message": message + "_1"
                            }, "subject", undefined, "middle");
                            // */

                            // Retrieve the associated conversation
                            let conversation = await rainbowSDK.conversations.openConversationForBubble(bubble);
                            _logger.log("debug", "MAIN - testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage - conversation.messages : ", conversation.messages);
                            _logger.log("debug", "MAIN - testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage - bubble.members : ", bubble.members);

                            if (conversation.messages?.length) {
                                let msgSentOrig = conversation.messages[0];
                                let msgStrModified = "Message updated.";
                                setTimeout(async () => {
                                    _logger.log("debug", "MAIN - testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage - msgStrModified : ", msgStrModified);
                                    let msgCorrectedSent = await rainbowSDK.conversations.sendCorrectedChatMessage(conversation, msgStrModified, msgSentOrig.id).catch((err) => {
                                        _logger.log("error", "MAIN- testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage - error sendCorrectedChatMessage : ", err);
                                    });
                                    _logger.log("debug", "MAIN- testCreateBubbleWithNoInvitationAndSendMessageAndsendCorrectedMessage - msgCorrectedSent : ", msgCorrectedSent);
                                }, 5000);
                            }
                        });
                    });
                }
            }); // */
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        async testCreate50BubblesAndArchiveThem() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreateBubbles    ] :: getContactByLoginEmail contact : ", contact);
                    for (let i = 0; i < 5; i++) {
                        let utc = new Date().toJSON().replace(/-/g, "/");
                        await rainbowSDK.bubbles.createBubble(appointmentRoom + utc + contact + "_" + i, appointmentRoom + utc + "_" + i).then(async (bubble: any) => {
                            _logger.log("debug", "MAIN - [testCreateBubbles    ] :: createBubble request ok", bubble);
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
                                    _logger.log("debug", "MAIN testCreateBubbles - after archiveBubble - bubble : ", bubble, ", bubbles : ", bubbles);
                                }); // */
                                /*rainbowSDK.contacts.getContactByLoginEmail(botappointment).then(contactbot => {
                                rainbowSDK.bubbles.inviteContactToBubble(contactbot, bubble, false, false).then(function () {
                                    setTimeout(() => { rainbowSDK.bubbles.promoteContactInBubble(contactbot, bubble).then(function (updatedBubble) {
                                        rainbowSDK.conversations.getBubbleConversation(updatedBubble).then(conversation => {
                                          _logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok", conversation);
                                       });
                                   })} , 2000);
                               });
                           }); // */
                            });
                        });
                    }
                    rainbowSDK.bubbles.getBubblesConsumption().then(consumption => {
                        if (consumption) {
                            _logger.log("debug", "MAIN - [testCreate50BubblesAndArchiveThem    ] :: getBubblesConsumption consumption : ", consumption);
                        } else {
                            _logger.log("debug", "MAIN - [testCreate50BubblesAndArchiveThem    ] :: getBubblesConsumption no consumption found.");
                        }
                    });
                }
            }); // */
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        async testCreate50BubblesAndActivateThem(nbCreateBubbles : number =50) {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let appointmentRoom = "testBot";
            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testCreate50BubblesAndActivateThem    ] :: getContactByLoginEmail contact : ", contact);
                    for (let i = 0; i < nbCreateBubbles; i++) {
                        let utc = new Date().toJSON().replace(/-/g, "/");
                        let bubbleName = appointmentRoom + "_" + utc + contact + "_" + i;
                        let timeBetweenCreate = 2000 + (getRandomInt(6) * 1000);
                        await setTimeoutPromised(timeBetweenCreate).then(async () => {
                            _logger.log("debug", "MAIN - [testCreate50BubblesAndActivateThem    ] :: createBubble request ", bubbleName, " after : ", timeBetweenCreate, " seconds waiting.");

                            await rainbowSDK.bubbles.createBubble(bubbleName, "desc : " + appointmentRoom + "_" + utc + "_" + i).then(async (bubble: any) => {
                                _logger.log("debug", "MAIN - [testCreate50BubblesAndActivateThem    ] :: createBubble request ok", bubble);
                                rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async () => {
                                    let message = "message de test";
                                    await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                                        "type": "text/markdown",
                                        "message": message
                                    }, "subject");
                                    // await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
                                    // await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
                                    let bubbles = rainbowSDK.bubbles.getAll();
                                    _logger.log("debug", "MAIN testCreate50BubblesAndActivateThem - after archiveBubble - bubble : ", bubble, ", bubbles : ", bubbles);
                                });
                            });
                            // */
                        });

                    }
                }
            }); // */
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        testCreateBubblesAndInviteContactsByEmails() {
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble: any) => {
                _logger.log("debug", "MAIN - [testCreateBubblesAndInviteContactsByEmails    ] :: createBubble request ok", bubble);

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

        testCreateBubblesAndInviteUnknownContactsByEmails() {
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble: any) => {
                _logger.log("debug", "MAIN - [testCreateBubblesAndInviteUnknownContactsByEmails    ] :: createBubble request ok", bubble);

                let contacts = [];
                let d = new Date();
                let t = d.getTime();
                let y = Math.round(t);
                contacts.push("vincent09@vbe.test.openrainbow.net");
                rainbowSDK.bubbles.inviteContactsByEmailsToBubble(contacts, bubble).then(async () => {
                    /*                let message = "message de test";
                await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                    "type": "text/markdown",
                    "message": message
                }, "subject", undefined, "middle");
 */
                    await pause(45000);
                    let invitationsSent = await rainbowSDK.invitations.searchInvitationsSentFromServer("lastNotificationDate", "pending", "full", 50, 0, 1);
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteUnknownContactsByEmails    ] :: invitationsSent : ", invitationsSent);

                    rainbowSDK.contacts.getContactByLoginEmail("vincent09@vbe.test.openrainbow.net").then(async contact => {
                        if (contact) {
                            _logger.log("debug", "MAIN - [testCreateBubblesAndInviteUnknownContactsByEmails    ] :: getContactByLoginEmail contact : ", contact);

                        }
                    });
                });
                rainbowSDK.bubbles.deleteBubble(bubble);
            });
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        testCreateBubblesAndInviteVincentALEContactsByEmails() {
            // To be used with vincent01 on COM (needs vincent.berder@al-enterprise.com to not be already in rooster).
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then(async (bubble: any) => {
                _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: createBubble request ok", bubble);

                let contacts = [];
                let d = new Date();
                let t = d.getTime();
                let y = Math.round(t);
                let contactEmail = "vincent.berder@al-enterprise.com";
                contacts.push(contactEmail);

                let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmail);
                if (contact) {
                    await rainbowSDK.contacts.removeFromNetwork(contact);
                }
                await rainbowSDK.invitations.sendInvitationByEmail(contactEmail, "fr", "salut from rainbow bot.");
                await rainbowSDK.bubbles.inviteContactsByEmailsToBubble(contacts, bubble).then(async () => {
                    /*                let message = "message de test";
                await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", {
                    "type": "text/markdown",
                    "message": message
                }, "subject", undefined, "middle");
 */
                    await pause(15000);

                    let sentInvitations = await rainbowSDK.invitations.getAllSentInvitations();
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: sentInvitations : ", sentInvitations);
                    let invitationsSent = await rainbowSDK.invitations.searchInvitationsSentFromServer("lastNotificationDate", "accepted", "full", 50, 0, 1);
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: invitationsSent accepted : ", invitationsSent);
                    invitationsSent = await rainbowSDK.invitations.searchInvitationsSentFromServer("lastNotificationDate", "pending", "full", 50, 0, 1);
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: invitationsSent pending : ", invitationsSent);
                    invitationsSent = await rainbowSDK.invitations.searchInvitationsSentFromServer("lastNotificationDate", "auto-accepted", "full", 50, 0, 1);
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: invitationsSent auto-accepted : ", invitationsSent);
                    invitationsSent = await rainbowSDK.invitations.searchInvitationsSentFromServer("lastNotificationDate", "canceled", "full", 50, 0, 1);
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: invitationsSent canceled : ", invitationsSent);
                    invitationsSent = await rainbowSDK.invitations.searchInvitationsSentFromServer("lastNotificationDate", "failed", "full", 50, 0, 1);
                    _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: invitationsSent failed : ", invitationsSent);

                    await rainbowSDK.contacts.getContactByLoginEmail(contactEmail).then(async contact => {
                        if (contact) {
                            _logger.log("debug", "MAIN - [testCreateBubblesAndInviteVincentALEContactsByEmails    ] :: getContactByLoginEmail contact : ", contact);

                        }
                    });
                });
                //await rainbowSDK.bubbles.deleteBubble(bubble);
            });
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        testCreateBubblesOnly() {
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("TestInviteByEmails" + utc, "TestInviteByEmails" + utc).then((bubble: any) => {
                _logger.log("debug", "MAIN - [testCreateBubblesOnly    ] :: createBubble request ok", bubble);
            });
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        async testNbCreateBubblesOnly(nbBubblesToCreate: number) {
            let utc = new Date().toJSON().replace(/-/g, "/");
            for (let i = 0; i < nbBubblesToCreate; i++) {
                await rainbowSDK.bubbles.createBubble("bubbles_" + i + "_" + utc, "bubbles_" + i + "_" + utc).then((bubble: any) => {
                    _logger.log("debug", "MAIN - [testNbCreateBubblesOnly    ] :: createBubble nb " + i + " ok : ", bubble.id);
                });
                await setTimeoutPromised(800);
                //    let utc = new Date().toJSON().replace(/-/g, '/');
            }
        }

        testCreateBubble_closeAndDeleteBubble() {
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("testCreateBubble_closeAndDeleteBubble" + utc, "testCreateBubble_closeAndDeleteBubble" + utc, true).then((bubble) => {
                _logger.log("debug", "MAIN - [testCreateBubble_closeAndDeleteBubble    ] :: createBubble request ok, bubble : ", bubble);
                rainbowSDK.bubbles.closeAndDeleteBubble(bubble).then((result) => {
                    _logger.log("debug", "MAIN - [testCreateBubble_closeAndDeleteBubble    ] :: closeAndDeleteBubble request ok, result : ", result);
                });
            });
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        async testsendMessageToBubbleJid_WithMention() {
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let bubbleName = "testBotName_";
            let bubbleDescription = "testBotDescription_";
            let bubbleMessage = "testBotMessage_";
            let bubbleMessageSubject = "testBotMessageSubject_";

            //let botappointment = "vincent01@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - [testsendMessageToBubbleJid_WithMention    ] :: getContactByLoginEmail contact : ", contact);
                    let utc: string = new Date().toJSON().replace(/-/g, "/");
                    bubbleName += utc + contact.name.value;
                    bubbleDescription += utc;
                    bubbleMessageSubject += utc;
                    await rainbowSDK.bubbles.createBubble(bubbleName, bubbleDescription, true).then(async (bubble: any) => {
                        _logger.log("debug", "MAIN - [testsendMessageToBubbleJid_WithMention    ] :: createBubble request ok", bubble);
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

        async testsendMultiFilesInBubbles() {
            let that = this;
            let file1 = null;
            let file2 = null;
            let file3 = null;
            let strMessageFile1 = "message for the file 1";
            let strMessageFile2 = "message for the file 2";
            let strMessageFile3 = "message for the file 3";
            file1 = new FileUpdated({
                //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                path: "c:\\temp\\IMG_20131005_173918.jpg",
                //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read
                jsdom: true,
                async: false,
            }); // */

            //   const stats : any = fs.statSync("c:\\temp\\IMG_20131005_173918.jpg");

            _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) file1 : ", file1);
            file2 = new FileUpdated({
                //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                path: "src/lib/resources/unknownContact.png",
                //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read
                jsdom: true,
                async: false,
            });
            _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) file2 : ", file2);


            file3 = new FileUpdated({
                //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                path: "package.json",
                //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read
                jsdom: true,
                async: false,
            });
            _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) file3 : ", file3);


            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();
            _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) getAllActiveBubbles - bubbles : ", bubbles, "nb owned bulles : ", bubbles ? bubbles.length:0);
            if (bubbles.length > 2) {

                let bubblesActive = bubbles.filter((bubble) => {
                    return bubble.isActive===true;
                });

                for (let i = 0; i < bubblesActive.length; i++) {
                    let bubble = bubblesActive[i];
                    _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) iter - bubbles[", i, "] - bubble.name : ", bubble?.name, ", bubble?.id : ", bubble?.id, ", bubble?.jid : ", bubble?.jid, ", bubble?.status : ", bubble?.status, ", bubble?.isActive : ", bubble?.isActive);

                }

                /* if (bubble.isActive==false) {
                     rainbowSDK.presence.sendInitialBubblePresenceSync(bubble);
                 } // */

                /*
                rainbowSDK.fileStorage.uploadFileToBubble(bubblesActive[0], file1, strMessageFile1).then((result) => {
                    _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) uploadFileToBubble file1 - result : ", result);
                });
                rainbowSDK.fileStorage.uploadFileToBubble(bubblesActive[1], file2, strMessageFile2).then((result) => {
                    _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) uploadFileToBubble file1 - result : ", result);
                });
            // */

                async function shareFile(id, file, strMessageFile) {
                    const bubble = await rainbowSDK.bubbles.getBubbleById(id);
                    // Share the file
                    rainbowSDK.fileStorage.uploadFileToBubble(bubble, file, strMessageFile).then((result) => {
                        _logger.log("debug", "MAIN - (testsendMultiFilesInBubbles) uploadFileToBubble file - result : ", result);
                    });
                }

                shareFile(bubblesActive[0]?.id, file1, strMessageFile1);

                await pause(10000);

                shareFile(bubblesActive[1]?.id, file2, strMessageFile2);
                shareFile(bubblesActive[2]?.id, file3, strMessageFile3);

                // */
            }
            //});
            /*
                    private async sendMessageToBubbleRainbowClient(id: string, rainbowMessage: RainbowMessageDto, rainbowClient: typeof RainbowSDK): Promise<RainbowMessage> {
                       try {
                                if (!rainbowClient) {
                            throw new NotFoundException('sendMessageToBubbleRainbowClient: No Rainbow client');
                        }
                        let res;
                        const bubble = await rainbowClient.bubbles.getBubbleById(id);
                        if (!bubble) {
                            throw new NotFoundException(`sendMessageToBubbleRainbowClient: Bubble ${id} not found`);
                        }
                        this.logger.debug(`sendMessageToBubbleRainbowClient - bubbleId: ${bubble?.id} - JID: ${bubble?.jid}  name: ${bubble?.name}`);

                        const lang = "en"; // content language used
                        let message = rainbowMessage.message;
                        let content = (rainbowMessage.card ? { type: "form/json", message: rainbowMessage.card } : null);
                        if (rainbowMessage.file) {
                            message = message ? message : "Attached file";

                            const stats = fs.statSync(rainbowMessage.file.path);

                            // Construire l'objet avec les informations sur le fichier
                            const transformedFile = {
                                type: rainbowMessage.file.mimeType,
                                name: rainbowMessage.file.originalName,
                                path: rainbowMessage.file.path,
                                size: stats.size
                            };

                            res = await rainbowClient.fileStorage.uploadFileToBubble(bubble, transformedFile, message);
                        }
                        else {
                            message = message ? message : "Message";
                            let content = null;
                            if (rainbowMessage.card) {
                                // Update special characters of content message body
                                let adaptiveCard = rainbowMessage.card;
                                // List
                                adaptiveCard = adaptiveCard.replace(/\\\\n\\\\t-/g, '\\r\\t-');
                                // New line
                                adaptiveCard = adaptiveCard.replace(/\\\\n/g, '\\n\\n');
                                // Other
                                adaptiveCard = adaptiveCard.replace(/\\\\t/g, '\\t');
                                // Rainbow alternative text base content to send
                                content = {
                                    type: "form/json",
                                    message: adaptiveCard
                                };
                            }
                            //imsService.sendMessageToBubble(message, bubble, [lang], [content], [subject], mentions, urgency)
                            let urgency = (rainbowMessage.messageType ? rainbowMessage.messageType.toLowerCase() : null);
                            if (urgency === "high") {
                                urgency = "middle"
                            }
                            res = await rainbowClient.im.sendMessageToBubble(message, bubble, lang, content, "", [], urgency);
                        }
                        return {
                            status: "SUCCESS",
                            msgId: res.id,
                            msgType: res.type
                        };
                    } catch (e: any) {
                            throw this.rainbowException(e);
                        }
                    }
                    // */

        }

        testgetConversationByDbId() {
            let result = rainbowSDK.conversations.getConversationByDbId(undefined);
            if (result) {
                _logger.log("debug", "MAIN - [testgetConversationByDbId    ] :: getConversationByDbId result : ", result);
            } else {
                _logger.log("debug", "MAIN - [testgetConversationByDbId    ] :: getConversationByDbId no result found.");
            }

        }

        testgetBubblesConsumption() {
            rainbowSDK.bubbles.getBubblesConsumption().then(consumption => {
                if (consumption) {
                    _logger.log("debug", "MAIN - [testgetBubblesConsumption    ] :: getBubblesConsumption consumption : ", consumption);
                } else {
                    _logger.log("debug", "MAIN - [testgetBubblesConsumption    ] :: getBubblesConsumption no consumption found.");
                }
            });

        }

        async testgetAllOwnedNotArchivedBubbles() {
            let bubblesNotArchived = await rainbowSDK.bubbles.getAllOwnedNotArchivedBubbles();
            _logger.log("debug", "MAIN - testgetAllOwnedNotArchivedBubbles - bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);
        }

        async testgetAllOwnedArchivedBubbles() {
            let bubblesArchived = await rainbowSDK.bubbles.getAllOwnedArchivedBubbles();
            _logger.log("debug", "MAIN - testgetAllOwnedArchivedBubbles - bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);
        }

        async testgetAllOwnedBubblesArchivedBubbles() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetAllOwnedBubblesArchivedBubbles getAllOwnedBubbles - result : ", result, ", nb owned bulles : ", result ? result.length:0);

            async function asyncFilter(arr, predicate) {
                const results = await Promise.all(arr.map(predicate));

                return arr.filter((_v, index) => results[index]);
            }

            let bubblesNotArchived = await asyncFilter(result, async bubble => {
                return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===false);
            });
            _logger.log("debug", "MAIN - testgetAllOwnedBubblesArchivedBubbles - bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);

            let bubblesArchived = await asyncFilter(result, async bubble => {
                return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===true);
            });
            _logger.log("debug", "MAIN - testgetAllOwnedBubblesArchivedBubbles - bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);

        }

        async testgetArchivedBubbles() {
            let result = rainbowSDK.bubbles.getAllBubbles();
            _logger.log("debug", "MAIN - testgetArchivedBubbles getAllOwnedBubbles - result : ", result, ", nb owned bulles : ", result ? result.length:0);

            async function asyncFilter(arr, predicate) {
                const results = await Promise.all(arr.map(predicate));

                return arr.filter((_v, index) => results[index]);
            }

            let bubblesNotArchived = await asyncFilter(result, async bubble => {
                return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===false);
            });
            _logger.log("debug", "MAIN - testgetArchivedBubbles - bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);

            let bubblesArchived = await asyncFilter(result, async bubble => {
                return (await rainbowSDK.bubbles.isBubbleArchived(bubble)===true);
            });
            _logger.log("debug", "MAIN - testgetArchivedBubbles - bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);

        }

        testArchive10BubblesFromgetAllActiveBubbles() {
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();
            _logger.log("debug", "MAIN - testArchive10BubblesFromgetAllActiveBubbles getAllActiveBubbles - nb owned bulles : ", bubbles ? bubbles.length:0);

            for (let i = 0; i < 10; i++) {
                rainbowSDK.bubbles.archiveBubble(bubbles[i]).then((result) => {
                    _logger.log("debug", "MAIN - testArchive10BubblesFromgetAllActiveBubbles archiveBubble - iter : ", i, ", result : ", result);

                });
            }
        }

//utils.setTimeoutPromised(1).then(()=> {
//    rainbowSDK.start();
//});
        testBubblesArchived() {
            /*let bubbles = rainbowSDK.bubbles.getAllBubbles();

        bubbles.forEach((bubble) => {
           _logger.log("debug", "MAIN - [testBubblesArchived    ] :: bubble : ", bubble);
        }); */
            let bubbleTestestsed = "room_e290bece54c34d69aef68f831be0d309@muc.vberder-all-in-one-dev-1.opentouch.cloud";
            rainbowSDK.bubbles.getBubbleByJid(bubbleTestestsed).then((bubbleFound) => {
                _logger.log("debug", "MAIN - [testBubblesArchived    ] :: bubbleFound : ", bubbleFound);
                let utc = new Date().toJSON().replace(/-/g, "_");
                let message = "message " + utc;
                let jid = bubbleFound.jid;
                let lang = "en";
                let content = {"type": "text/markdown", "message": "**A message** for a _bubble_" + utc};
                let subject = "subject";
                rainbowSDK.im.sendMessageToBubbleJid(message, jid, lang, content, subject).then((result) => {
                    _logger.log("debug", "MAIN - testBubblesArchived sendMessageToBubbleJid result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
                }).catch((err) => {
                    _logger.log("error", "MAIN - testBubblesArchived error while sendMessageToBubbleJid result : ", err); //logger.colors.green(JSON.stringify(result)));
                });
            });
        }

        testgetBubbleUnknown() {
            let bubbleTestestsed = "room_e290bece54c34d69aef68f831be0d309@muc.vberder-all-in-one-dev-1.opentouch.cloud";
            rainbowSDK.bubbles.getBubbleByJid(bubbleTestestsed).then((bubbleFound) => {
                _logger.log("debug", "MAIN - [testgetBubbleUnknown    ] :: bubbleFound : ", bubbleFound);
            }).catch((err) => {
                _logger.log("error", "MAIN - testgetBubbleUnknown error while getBubbleByJid result : ", err); //logger.colors.green(JSON.stringify(result)));
            });
        }

        async testSetBubbleCustomData() {
            let that = this;
            let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble;
            if (activesBubbles && activesBubbles.length > 0) {
                //bubble = Object.assign(new Bubble(), activesBubbles[0]);
                bubble = Bubble_1.Bubble.BubbleFactory("", rainbowSDK.contacts)(activesBubbles[0]);
            }
            //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
            _logger.log("debug", "MAIN - testSetBubbleCustomData - bubble : ", bubble);
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
                   _logger.log("debug", "MAIN - testSetBubbleCustomData, Few seconds after sending the customData bubbleIter : ", bubbleIter);
                }

            });
        // */
            //});
        }

        async testSetBubbleName() {
            let that = this;
            let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble;
            if (activesBubbles && activesBubbles.length > 0) {
                //bubble = Object.assign(new Bubble(), activesBubbles[0]);
                bubble = await Bubble_1.Bubble.BubbleFactory(undefined, rainbowSDK.contacts)(activesBubbles[0]);
            }
            //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
            _logger.log("debug", "MAIN - testSetBubbleName - bubble : ", bubble);
            //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
            let now = new Date().getTime();
            let bubbleUpdated = await rainbowSDK.bubbles.setBubbleName(bubble, "TestName_" + now);
            _logger.log("debug", "MAIN - testSetBubbleName, bubbleUpdated : ", bubbleUpdated);
        }

        async testSetBubbleTopic() {
            let that = this;
            let activesBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            let bubble;
            if (activesBubbles && activesBubbles.length > 0) {
                //bubble = Object.assign(new Bubble(), activesBubbles[0]);
                bubble = await Bubble_1.Bubble.BubbleFactory(undefined, rainbowSDK.contacts)(activesBubbles[0]);
            }
            //rainbowSDK.bubbles.getBubbleByJid("room_0f5e4e62e3ef4e43bc991dde6c53bc98@muc.vberder-all-in-one-dev-1.opentouch.cloud").then((bubble) => {
            _logger.log("debug", "MAIN - testSetBubbleTopic - bubble : ", bubble);
            //that.rainbowSDK.bubbles.setBubbleCustomData(bubble, {});
            let now = new Date().getTime();
            let bubbleUpdated = await rainbowSDK.bubbles.setBubbleTopic(bubble, "TestTopic_" + now);
            _logger.log("debug", "MAIN - testSetBubbleTopic, bubbleUpdated : ", bubbleUpdated);
        }


        async testDeletebubble() {
            let bubbleId = "5cde768d424fb13186b9e6d4";
            let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            rainbowSDK.bubbles.deleteBubble(bubble);
        }

        async testDeleteBubble() {
            let bubbles = await rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testDeleteBubble bubbles : ", bubbles); //logger.colors.green(JSON.stringify(result)));
            rainbowSDK.bubbles.deleteBubble(bubbles[0]).then((resultDelete) => {
                _logger.log("debug", "MAIN - testDeleteBubble resultDelete : ", resultDelete); //logger.colors.green(JSON.stringify(result)));
            });
        }

       async testdeleteAllBubbles() {
        //let bubbles = await rainbowSDK.bubbles.getAllOwnedBubbles();
        //_logger.log("debug", "MAIN - testdeleteAllBubbles bubbles : ", bubbles); //logger.colors.green(JSON.stringify(result)));
        rainbowSDK.bubbles.deleteAllBubbles();
    }

        async testDeleteBubble_ByBubbleId(bubbleId) {
            let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            _logger.log("debug", "MAIN - testDeleteBubble_ByBubbleId, ", bubbleId, ", bubble : ", bubble); //logger.colors.green(JSON.stringify(result)));
            rainbowSDK.bubbles.deleteBubble(bubble).then((resultDelete) => {
                _logger.log("debug", "MAIN - testDeleteBubble_ByBubbleId resultDelete : ", resultDelete); //logger.colors.green(JSON.stringify(result)));
            });
        }

        async testLeaveBubble() {
            let bubbles = await rainbowSDK.bubbles.getAllBubbles();
            _logger.log("debug", "MAIN - testLeaveBubble bubbles : ", bubbles); //logger.colors.green(JSON.stringify(result)));
            for (const bubble of bubbles) {
                if (bubble.name.indexOf("testBot")!= -1) {
                    _logger.log("debug", "MAIN - testLeaveBubble Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive); //logger.colors.green(JSON.stringify(result)));
                    if (bubble.ownerContact.id===rainbowSDK._core._rest.userId) {
                        // The bubble should be deleted instead of leaved
                        _logger.log("debug", "MAIN - testLeaveBubble Found bubble.name : ", bubble.name, ", The bubble should be deleted instead of leaved."); //logger.colors.green(JSON.stringify(result)));
                        rainbowSDK.bubbles.deleteBubble(bubble).then((resultDelete) => {
                            _logger.log("debug", "MAIN - testLeaveBubble resultDelete : ", resultDelete); //logger.colors.green(JSON.stringify(result)));
                        });
                    } else {
                        rainbowSDK.bubbles.leaveBubble(bubble).then((resultLeave) => {
                            _logger.log("debug", "MAIN - testLeaveBubble bubble.name : ", bubble.name, ", resultLeave : ", resultLeave); //logger.colors.green(JSON.stringify(result)));
                        });
                        // */
                    }
                } else {
                    _logger.log("debug", "MAIN - testLeaveBubble NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive); //logger.colors.green(JSON.stringify(result)));
                }
            }
        }

        testCreateBubblesAndSetTags() {
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("testCreateBubblesAndSetTags" + utc, "testCreateBubblesAndSetTags" + utc).then((bubble: any) => {
                _logger.log("debug", "MAIN - [testCreateBubblesAndSetTags    ] :: createBubble request ok", bubble);

                let tags: any = [{"tag": "Essai1DeTag"}, {"tag": "Essai2deTag"}];
                rainbowSDK.bubbles.setTagsOnABubble(bubble, tags).then(async (result) => {
                    _logger.log("debug", "MAIN - [testCreateBubblesAndSetTags    ] :: setTagsOnABubble result : ", result);

                    let tags = ["Essai1DeTag"];
                    rainbowSDK.bubbles.retrieveAllBubblesByTags(tags).then(bubbles => {
                        if (bubbles) {
                            _logger.log("debug", "MAIN - [testCreateBubblesAndSetTags    ] :: bubbles : ", bubbles);
                        }
                    }).catch((err) => {
                        _logger.log("error", "MAIN - [testCreateBubblesAndSetTags    ] :: error : ", err);
                    });
                });
            });
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }


        testretrieveAllBubblesByTags() {
            //let tags = [{tag: "Essai1DeTag"}];
            let tags = ["Essai1DeTag", "tagess2"];
            let tags1 = ["Essai1DeTag"];
            rainbowSDK.bubbles.retrieveAllBubblesByTags(tags1).then(bubbles => {
                if (bubbles) {
                    _logger.log("debug", "MAIN - [testretrieveAllBubblesByTags    ] :: one tag bubbles : ", bubbles);
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testretrieveAllBubblesByTags    ] :: error : ", err);
            });
            rainbowSDK.bubbles.retrieveAllBubblesByTags(tags).then(bubbles => {
                if (bubbles) {
                    _logger.log("debug", "MAIN - [testretrieveAllBubblesByTags    ] :: two tags bubbles : ", bubbles);
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testretrieveAllBubblesByTags    ] :: error : ", err);
            });
        }

        testCreateBubblesAndSetTagsAndDeleteTags() {
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.bubbles.createBubble("testCreateBubblesAndSetTagsAndDeleteTags" + utc, "testCreateBubblesAndSetTagsAndDeleteTags" + utc).then((bubble: any) => {
                _logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: createBubble request ok", bubble);

                let tags: any = [{"tag": "Essai1DeTag"}, {"tag": "Essai2deTag"}];
                rainbowSDK.bubbles.setTagsOnABubble(bubble, tags).then(async (result) => {
                    _logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: setTagsOnABubble result : ", result);

                    let tags = ["Essai1DeTag"];
                    rainbowSDK.bubbles.retrieveAllBubblesByTags(tags).then(bubblesIdTags => {
                        if (bubblesIdTags) {
                            _logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: bubblesIdTags : ", bubblesIdTags);

                            let bubblesTagsToDelete = [];
                            bubblesTagsToDelete.push({id: bubblesIdTags.rooms[0].roomId});
                            rainbowSDK.bubbles.deleteTagOnABubble(bubblesTagsToDelete, tags[0]).then(result => {
                                if (result) {
                                    _logger.log("debug", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: deleteTagsOnABubble result : ", JSON.stringify(result));
                                }
                            }).catch((err) => {
                                _logger.log("error", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: error : ", err);
                            });

                        }
                    }).catch((err) => {
                        _logger.log("error", "MAIN - [testCreateBubblesAndSetTagsAndDeleteTags    ] :: error : ", err);
                    });
                });
            });
            //    let utc = new Date().toJSON().replace(/-/g, '/');
        }

        testUploadFileToBubble() {
            let that = this;
            let file = null;
            let strMessage = "message for the file";
            file = new FileUpdated({
                //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                path: "c:\\temp\\IMG_20131005_173918.jpg",
                //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read
                jsdom: true,
                async: false,
            });
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result = rainbowSDK.bubbles.getAllActiveBubbles();
            _logger.log("debug", "MAIN - (testUploadFileToBubble) getAllActiveBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
            if (result.length > 0) {
                let bubble = result[0];
                if (bubble.isActive==false) {
                    rainbowSDK.presence.sendInitialBubblePresenceSync(bubble);
                }
                // Share the file
                return rainbowSDK.fileStorage.uploadFileToBubble(bubble, file, strMessage).then((result) => {
                    _logger.log("debug", "MAIN - (testUploadFileToBubble) uploadFileToBubble - result : ", result);
                });
            }
            //});
        }

        test_refreshMemberAndOrganizerLists() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result = rainbowSDK.bubbles.getAllActiveBubbles();
            _logger.log("debug", "test_refreshMemberAndOrganizerLists - getAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
            if (result.length > 0) {
                let bubble = result[0];
                // Share the file
                rainbowSDK.bubbles.refreshMemberAndOrganizerLists(bubble);
                _logger.log("debug", "MAIN - refreshMemberAndOrganizerLists - bubble : ", bubble);
            }
        }

        testGetUsersFromBubble() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result = rainbowSDK.bubbles.getAllActiveBubbles();
            _logger.log("debug", "MAIN - testGetUsersFromBubble getAllActiveBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
            if (result.length > 0) {
                let bubble = result[0];
                // Share the file
                return rainbowSDK.bubbles.getUsersFromBubble(bubble, undefined).then((users) => {
                    _logger.log("debug", "MAIN - testGetUsersFromBubble - users : ", users);
                });
            }
            //});
        }

        testGetUsersFullFromBubble() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result = rainbowSDK.bubbles.getAllActiveBubbles();
            _logger.log("debug", "MAIN - testGetUsersFromBubble getAllActiveBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
            if (result.length > 0) {
                let bubble = result[0];
                // Share the file
                return rainbowSDK.bubbles.getUsersFromBubble(bubble, {"format": "full"}).then((users) => {
                    _logger.log("debug", "MAIN - testGetUsersFromBubble - users : ", users);
                });
            }
            //});
        }

        async testupdateAvatarForBubble() {
            try {
                // vincent00 on .net use bubble : testBotDescription_2024/02/07T15:18:39.669Z
                /*let result = rainbowSDK.bubbles.getAllOwnedBubbles();
                _logger.log("debug", "MAIN - testupdateAvatarForBubble - result : ", result, "nb owned bulles : ", result ? result.length:0);
                rainbowSDK.bubbles.updateAvatarForBubble("c:\\temp\\IMG_20131005_173918.jpg", result[0]);
                // */
                let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();
                _logger.log("debug", "MAIN - testupdateAvatarForBubble - getAllActiveBubbles bubble.length : ", bubbles ? bubbles.length:0);
                let bubble = bubbles.find(element => element.name==="testBotName_2024/02/07T15:18:39.669ZGuestUser")
                _logger.log("debug", "MAIN - testupdateAvatarForBubble -  bubble \"testBotName_2024/02/07T15:18:39.669ZGuestUser\" : ", bubble);
                let resultOfUpdateAvatarBubble = await rainbowSDK.bubbles.updateAvatarForBubble("c:\\temp\\IMG_20131005_173918.jpg", bubble);
                //let resultOfUpdateAvatarBubble = await rainbowSDK.bubbles.updateAvatarForBubble("c:\\temp\\infini.png", bubble);
                _logger.log("debug", "MAIN - testupdateAvatarForBubble - resultOfUpdateAvatarBubble : ", resultOfUpdateAvatarBubble);
            } catch (err) {
                _logger.log("debug", "MAIN - testupdateAvatarForBubble - CATCH Error !!! error : ", err);
            }
        }

        testgetAllOwnedBubbles() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
        }

        testdeleteAllMessagesInRoomConversationFromModerator() {
            // to be used with vincent02 on .NET with bubble "test".
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromModerator getAllOwnedBubbles - result : ", result, "nb owned bulles : ", result ? result.length:0);
            if (result && result.length > 0 && result[0].name=="test") {
                let resultDelete = rainbowSDK.bubbles.deleteAllMessagesInBubble(result[0], undefined);
                _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromModerator - resultDelete : ", resultDelete);
            }
        }

        async testdeleteAllMessagesInRoomConversationFromMember() {
            // to be used with vincent01 on .NET with bubble "test".
            //let listOfBubblesJIDs :any = await rainbowSDK.bubbles.getAllBubblesJidsOfAUserIsMemberOf(true, false, false, 100, 0, undefined, 1);
            // @ts-ignore
            let listOfBubblesJIDs: any = await rainbowSDK.bubbles.getAllBubblesJidsOfAUserIsMemberOf();
            _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember getAllBubblesJidsOfAUserIsMemberOf - listOfBubblesJIDs : ", listOfBubblesJIDs);
            for (let i = 0; i < listOfBubblesJIDs.data.length; i++) {
                let bubble = await rainbowSDK.bubbles.getBubbleByJid(listOfBubblesJIDs.data[i]);
                //logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember bubble : ", bubble);
                if (bubble && bubble.name=="test") {
                    _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember bubble name is test, so can delete all messages in bubble : ", bubble);
                    let resultDelete = rainbowSDK.bubbles.deleteAllMessagesInBubble(bubble, undefined);
                    _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember - resultDelete : ", resultDelete);
                }
            }
        }

        async testdeleteAllMessagesInRoomConversationFromMe() {
            // to be used with vincent01 on .NET with bubble "test".
            let listOfBubblesJIDs: any = await rainbowSDK.bubbles.getAllBubblesJidsOfAUserIsMemberOf(true, false, false, 100, 0, undefined, 1);
            _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMe getAllBubblesJidsOfAUserIsMemberOf - listOfBubblesJIDs : ", listOfBubblesJIDs);
            for (let i = 0; i < listOfBubblesJIDs.data.length; i++) {
                let bubble = await rainbowSDK.bubbles.getBubbleByJid(listOfBubblesJIDs.data[i]);
                //logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember bubble : ", bubble);
                if (bubble && bubble.name=="test") {
                    _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMe bubble name is test, so can delete all messages in bubble : ", bubble);
                    let resultDelete = rainbowSDK.bubbles.deleteAllMessagesInBubble(bubble, connectedUser.jid);
                    _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMe - resultDelete : ", resultDelete);
                }
            }
        }

        async testdeleteAllMessagesInRoomConversationFromMemberToContact() {
            // to be used with vincent01 on .NET with bubble "test".
            let loginEmail = "vincent02@vbe.test.openrainbow.net"
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async contact => {
                let listOfBubblesJIDs: any = await rainbowSDK.bubbles.getAllBubblesJidsOfAUserIsMemberOf(true, false, false, 100, 0, undefined, 1);
                _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMemberToContact getAllBubblesJidsOfAUserIsMemberOf - listOfBubblesJIDs : ", listOfBubblesJIDs);
                for (let i = 0; i < listOfBubblesJIDs.data.length; i++) {
                    let bubble = await rainbowSDK.bubbles.getBubbleByJid(listOfBubblesJIDs.data[i]);
                    //logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember bubble : ", bubble);
                    if (bubble && bubble.name=="test") {
                        _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMemberToContact bubble name is test, so can delete all messages in bubble : ", bubble);
                        let resultDelete = rainbowSDK.bubbles.deleteAllMessagesInBubble(bubble, contact.jid);
                        _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMemberToContact - resultDelete : ", resultDelete);
                    }
                }
            });
        }

        async testdeleteAllMessagesInRoomConversationFromContactNotInBubble() {
            // to be used with vincent03 on .NET with bubble "test" jid room_f8780e1fabd3449788896b73cab8bbbc@muc.openrainbow.net.
            let bubbleJid = "room_f8780e1fabd3449788896b73cab8bbbc@muc.openrainbow.net";
            let resultDelete = rainbowSDK._core._xmpp.deleteAllMessagesInRoomConversation(bubbleJid, undefined);
            _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromContactNotInBubble - resultDelete : ", resultDelete);
        }

        async testdeleteAllMessagesInRoomConversationFromContactNotInBubble2() {
            // to be used with vincent01 on .NET with bubble "test".
            let bubbleJid = "room_f8780e1fabd3449788896b73cab8bbbc@muc.openrainbow.net";
            let bubble = await rainbowSDK.bubbles.getBubbleByJid(bubbleJid);
            //logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromMember bubble : ", bubble);
            if (bubble && bubble.name=="test") {
                _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromContactNotInBubble2 bubble name is test, so can delete all messages in bubble : ", bubble);
                let resultDelete = rainbowSDK.bubbles.deleteAllMessagesInBubble(bubble, undefined);
                _logger.log("debug", "MAIN - testdeleteAllMessagesInRoomConversationFromContactNotInBubble2 - resultDelete : ", resultDelete);
            }
        }

        async testgetAvatarFromBubble() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetAvatarFromBubble - result : ", result, "nb owned bulles : ", result ? result.length:0);
            let avatarBlob = await rainbowSDK.bubbles.getAvatarFromBubble(result[0]);
            _logger.log("debug", "MAIN - testgetAvatarFromBubble - avatarBlob : ", avatarBlob);
        }

        async testgetABubblePublicLinkAsModerator() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetABubblePublicLinkAsModerator - result : ", result, "nb owned bulles : ", result ? result.length:0);
            let bubblePublicLink = await rainbowSDK.bubbles.getABubblePublicLinkAsModerator(result[0].id);
            _logger.log("debug", "MAIN - testgetABubblePublicLinkAsModerator - bubblePublicLink : ", bubblePublicLink);
        }

        async testgetAllBubblesJidsOfAUserIsMemberOf() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetAllBubblesJidsOfAUserIsMemberOf - result : ", result, "nb owned bulles : ", result ? result.length:0);
            let result2 = await rainbowSDK.bubbles.getAllBubblesJidsOfAUserIsMemberOf();
            _logger.log("debug", "MAIN - testgetAllBubblesJidsOfAUserIsMemberOf - result2 : ", result2);
        }

        async testgetAllBubblesVisibleByTheUser() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetAllBubblesVisibleByTheUser - result : ", result, "nb owned bulles : ", result ? result.length:0);
            let result2 = await rainbowSDK.bubbles.getAllBubblesVisibleByTheUser();
            _logger.log("debug", "MAIN - testgetAllBubblesVisibleByTheUser - result2 : ", result2);
        }

        async testgetBubblesDataByListOfBubblesIds() {
            let result = rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetBubblesDataByListOfBubblesIds - result : ", result, "nb owned bulles : ", result ? result.length:0);
            let bubblesIds = [];
            for (let i = 0; i < result.length; i++) {
                bubblesIds.push(result[i].id);
            }
            _logger.log("debug", "MAIN - testgetBubblesDataByListOfBubblesIds - bubblesIds : ", bubblesIds);
            let result2 = await rainbowSDK.bubbles.getBubblesDataByListOfBubblesIds(bubblesIds);
            _logger.log("debug", "MAIN - testgetBubblesDataByListOfBubblesIds - result2 : ", result2);
        }

        //endregion Bubbles

        //region Conference V1

        testGetAllConferences() {
            rainbowSDK.bubbles.retrieveConferences(undefined, false, false).then((conferences) => {
                _logger.log("debug", "MAIN - retrieveAllConferences : ", conferences);
            });
        }


        testaddPSTNParticipantToConference() {
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            if (bubbles.length > 0) {
                let bubble = bubbles[0];
                rainbowSDK.bubbles.addPSTNParticipantToConference(bubble.id, "0622413746", "FRA").then(async function (result) {
                    _logger.log("debug", "MAIN - testaddPSTNParticipantToConference - result : ", result);
                }).catch((err) => {
                    _logger.log("warn", "MAIN - testaddPSTNParticipantToConference - err : ", err);
                });
            }
        }

        /*
    async  testaskConferenceSnapshot() {
        let allConferences: [any] = await rainbowSDK.bubbles.retrieveConferences(undefined, false, false).then((conferences) => {
           _logger.log("debug", "MAIN - testaskConferenceSnapshot all conferences : ", conferences);
            return conferences;
        });

        try {
            if (allConferences && allConferences.length > 0) {
                let conferenceInfo: ConferenceSession = await rainbowSDK.bubbles.askConferenceSnapshot(allConferences[0].id);
               _logger.log("debug", "MAIN - testaskConferenceSnapshot conference : ", conferenceInfo);
            }
        } catch (err) {
           _logger.log("debug", "MAIN - testaskConferenceSnapshot from existing conference Error : ", err);
        }

        try {
            let conferenceInfo: ConferenceSession = await rainbowSDK.bubbles.askConferenceSnapshot("XX7831e66d88e93afaa37cXX");
           _logger.log("debug", "MAIN - testaskConferenceSnapshot conference : ", conferenceInfo);
        } catch (err) {
           _logger.log("debug", "MAIN - testaskConferenceSnapshot non existing conference Error : ", err);
        }
    }

     testStartConference() {
        let webrtcConferenceId = rainbowSDK.bubbles.getWebRtcConfEndpointId();
       _logger.log("debug", "MAIN - testStartConference, webrtcConferenceId : ", webrtcConferenceId);

        let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();

        let myBubbleToConferenced = null;
        for (const bubble of bubbles) {
            if (bubble.name==="BullesOfTests") {
               _logger.log("debug", "MAIN - testStartConference found BullesOfTests bubble : ", bubble);
                myBubbleToConferenced = bubble;
            }
        }

        rainbowSDK.bubbles.conferenceStart(myBubbleToConferenced).then((result) => {
           _logger.log("debug", "MAIN - testStartConference, result : ", result);
        });
    }

     testjoinConferenceV2(bubbleId : string = "621c9f61dd692c3dd3131869") {

        rainbowSDK.bubbles.getBubbleById(bubbleId).then((bubble) => {
           _logger.log("debug", "MAIN - testjoinConferenceV2 - found bubble.id : ", bubble.id);
        //rainbowSDK.bubbles.getBubbleById("5bbb1f5fd6e166709a42d7c7").then((bubble) => {
            rainbowSDK.bubbles.joinConferenceV2(bubble.id).then((result) => {
                //let bubbles = rainbowSDK.bubbles.getAll();
               _logger.log("debug", "MAIN - testjoinConferenceV2 - after joinConference - bubble : ", bubble, ", result : ", result);
            });
        });

        // rainbowSDK.contacts.getContactByLoginEmail(physician.loginEmail).then(contact => {
        //     if (contact) {
        //        _logger.log("debug", "MAIN - [testCreateBubblesAndJoinConference    ] :: getContactByLoginEmail contact : ", contact);
        //         physician.name = contact.title + " " + contact.firstname + " " + contact.lastname;
        //         physician.contact = contact;
        //         for (let i = 0; i < 1; i++) {
        //             let utc = new Date().toJSON().replace(/-/g, "/");
        //             rainbowSDK.bubbles.createBubble(physician.appointmentRoom + utc + contact + "_" + i, physician.appointmentRoom + utc + "_" + i).then((bubble) => {
        //                _logger.log("debug", "MAIN - [testCreateBubblesAndJoinConference    ] :: createBubble request ok", bubble);
        //                 rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false).then(async() => {
        //                     await Utils.setTimeoutPromised(600);
        //                     let message = "message de test";
        //                     //await rainbowSDK.im.sendMessageToBubbleJid(message, bubble.jid, "en", { "type": "text/markdown", "message": message }, "subject");
        //                     rainbowSDK.bubbles.joinConference(bubble).then((result) => {
        //                         //let bubbles = rainbowSDK.bubbles.getAll();
        //                        _logger.log("debug", "MAIN testCreateBubblesAndJoinConference - after joinConference - bubble : ", bubble, ", result : ", result);
        //                     });
        //                 });
        //             });
        //         }
        //     }
        // });
        //    let utc = new Date().toJSON().replace(/-/g, '/');
    }
// */
        //endregion Conference V1

        //region Guests

        async testCreateAGuestAndAddItToACreatedBubble() {
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
                _logger.log("debug", "MAIN - [testCreateAGuestAndAddItToACreatedBubble    ] :: createBubble request ok : ", bubble);
                rainbowSDK.bubbles.createPublicUrl(bubble).then(async (publicUrl) => {
                    _logger.log("debug", "MAIN - [testCreateAGuestAndAddItToACreatedBubble    ] :: createPublicUrl publicUrl : ", publicUrl);
                    rainbowSDK.bubbles.registerGuestForAPublicURL(publicUrl, loginEmail, password, "VincentGuest", "berderGuest", "VBGuest", "Mr.", "DevGuest", "ITGuest").then(async (result) => {
                        _logger.log("debug", "MAIN - [testCreateAGuestAndAddItToACreatedBubble    ] :: registerGuestForAPublicURL result : ", result);
                    });
                });
            });

        }

        async testCleanAGuest() {
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
                    _logger.log("debug", "MAIN - [testCleanAGuest    ] :: getContactByLoginEmail contact : ", contact);
                    rainbowSDK.admin.deleteUser(contact.id).then(async (result) => {
                        _logger.log("debug", "MAIN - [testCleanAGuest    ] :: deleteUser result : ", result);
                    });
                }
            });
        }

        //endregion Guests

        async testsendChatMessageWithContentAdaptiveCard() {
            let that = this;
            //let contactIdToSearch = "5bbdc3812cf496c07dd89128"; // vincent01 vberder
            //let contactIdToSearch = "5bbb3ef9b0bb933e2a35454b"; // vincent00 official
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let msgsSent = [];
            let now = new Date().getTime();
            let formattedMessage = that.formatCard2("original msg : ", now);
            let content = {
                "type": "form/json",
                "message": formattedMessage
            }
            /*
            {
    "title": "Report an issue",
    "issueList": [
        {
            "category": "Rainbow",
            "tag": "Sounds metallic",
            "idcategory": "idcategory",
            "idtag": "idtag",
            "reported": "false"
        },
        {
            "category": "Rainbow",
            "tag": "Sounds low",
            "idcategory": "idcategory1",
            "idtag": "idtag1",
            "reported": "true"
        }
    ]
}
             */
            // Send message
            let msgSent = await rainbowSDK.im.sendMessageToConversation(conversation, "Welcome to the MCQ Test", "en", content, undefined);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - result sendMessageToConversation : ", msgSent);
            //_logger.log("debug", "MAIN - testsendCorrectedChatMessage - conversation : ", conversation);
            msgsSent.push(msgSent);
            _logger.log("debug", "MAIN - testsendChatMessageWithContentAdaptiveCard - wait for message to be in conversation : ", msgSent);
            await until(() => {
                return conversation.getMessageById(msgSent.id)!==undefined;
            }, "Wait for message to be added in conversation.");
            let msgSentOrig = msgsSent.slice(-1)[0];
            let msgStrModified = "modified : " + msgSentOrig.content;
            _logger.log("debug", "MAIN - testsendChatMessageWithContentAdaptiveCard - msgStrModified : ", msgStrModified);
        }


        async testLoic() {
            let alternateContent = null;

            let msg: any = {};
            msg.template = "{\n" +
                "    \"type\": \"AdaptiveCard\",\n" +
                "    \"backgroundImage\": \"data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%3E%0A%20%20%3Crect%20fill%3D%22white%22%20x%3D%220%25%22%20y%3D%220%25%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20%2F%3E%0A%3C%2Fsvg%3E%0A\",\n" +
                "    \"body\": [\n" +
                "        {\n" +
                "            \"type\": \"TextBlock\",\n" +
                "            \"size\": \"medium\",\n" +
                "            \"weight\": \"bolder\",\n" +
                "            \"text\": \"${title}\",\n" +
                "            \"spacing\": \"large\",\n" +
                "            \"height\": \"stretch\",\n" +
                "            \"maxLines\": 1,\n" +
                "            \"separator\": true\n" +
                "        },\n" +
                "        {\n" +
                "            \"type\": \"Container\",\n" +
                "            \"spacing\": \"none\",\n" +
                "            \"items\": [\n" +
                "                {\n" +
                "                    \"type\": \"ColumnSet\",\n" +
                "                    \"columns\": [\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"TextBlock\",\n" +
                "                                    \"wrap\": true\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"31px\",\n" +
                "                            \"spacing\": \"none\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"TextBlock\",\n" +
                "                                    \"weight\": \"Bolder\",\n" +
                "                                    \"text\": \"CATEGORY\",\n" +
                "                                    \"wrap\": true\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"150px\",\n" +
                "                            \"spacing\": \"none\",\n" +
                "                            \"verticalContentAlignment\": \"Bottom\",\n" +
                "                            \"minHeight\": \"20px\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"spacing\": \"none\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"TextBlock\",\n" +
                "                                    \"weight\": \"Bolder\",\n" +
                "                                    \"text\": \"ISSUE\",\n" +
                "                                    \"wrap\": true\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"150px\",\n" +
                "                            \"horizontalAlignment\": \"Left\",\n" +
                "                            \"verticalContentAlignment\": \"Bottom\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"TextBlock\",\n" +
                "                                    \"weight\": \"Bolder\",\n" +
                "                                    \"wrap\": true\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"66px\"\n" +
                "                        }\n" +
                "                    ],\n" +
                "                    \"horizontalAlignment\": \"Left\",\n" +
                "                    \"minHeight\": \"30px\"\n" +
                "                }\n" +
                "            ]\n" +
                "        },\n" +
                "        {\n" +
                "            \"type\": \"Image\",\n" +
                "            \"url\": \"https://st-exupery.ale-custo.com/greenbot/line.svg\",\n" +
                "            \"height\": \"15px\",\n" +
                "            \"spacing\": \"none\",\n" +
                "            \"width\": \"383px\"\n" +
                "        },\n" +
                "        {\n" +
                "            \"$data\": \"${issueList}\",\n" +
                "            \"type\": \"Container\",\n" +
                "            \"items\": [\n" +
                "                {\n" +
                "                    \"type\": \"ColumnSet\",\n" +
                "                    \"columns\": [\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"id\": \"${idcategory};${idTag}\",\n" +
                "                                    \"type\": \"Input.Toggle\",\n" +
                "                                    \"title\": \"\",\n" +
                "                                    \"value\": \"${reported}\",\n" +
                "                                    \"spacing\": \"none\"\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"31px\",\n" +
                "                            \"spacing\": \"none\",\n" +
                "                            \"verticalContentAlignment\": \"Center\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"TextBlock\",\n" +
                "                                    \"text\": \"${category}\",\n" +
                "                                    \"wrap\": true\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"150px\",\n" +
                "                            \"spacing\": \"none\",\n" +
                "                            \"verticalContentAlignment\": \"Center\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"TextBlock\",\n" +
                "                                    \"text\": \"${tag}\",\n" +
                "                                    \"wrap\": true\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"150px\",\n" +
                "                            \"spacing\": \"none\",\n" +
                "                            \"verticalContentAlignment\": \"Center\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"Image\",\n" +
                "                                    \"$when\": \"${reported=='true'}\",\n" +
                "                                    \"url\": \"https://st-exupery.ale-custo.com/greenbot/Off.svg\",\n" +
                "                                    \"height\": \"19px\"\n" +
                "                                },\n" +
                "                                {\n" +
                "                                    \"type\": \"Image\",\n" +
                "                                    \"$when\": \"${reported=='false'}\",\n" +
                "                                    \"url\": \"https://st-exupery.ale-custo.com/greenbot/Running.svg\",\n" +
                "                                    \"height\": \"19px\"\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"150px\",\n" +
                "                            \"verticalContentAlignment\": \"Center\",\n" +
                "                            \"horizontalAlignment\": \"Left\",\n" +
                "                            \"spacing\": \"none\"\n" +
                "                        },\n" +
                "                        {\n" +
                "                            \"type\": \"Column\",\n" +
                "                            \"spacing\": \"none\",\n" +
                "                            \"items\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"ActionSet\",\n" +
                "                                    \"actions\": [\n" +
                "                                        {\n" +
                "                                            \"type\": \"Action.Submit\",\n" +
                "                                            \"$when\": \"${reported=='false'}\",\n" +
                "                                            \"title\": \"Report\",\n" +
                "                                            \"style\": \"destructive\",\n" +
                "                                            \"data\": {\n" +
                "                                                \"idCategory\": \"${idcategory}\",\n" +
                "                                                \"idTag\": \"${idtag}\",\n" +
                "                                                \"rainbow\": {\n" +
                "                                                    \"text\": \"#report ${category} ${tag}\",\n" +
                "                                                    \"type\": \"messageBack\",\n" +
                "                                                    \"value\": {\n" +
                "                                                        \"response\": \"report\",\n" +
                "                                                        \"idCategory\": \"${idcategory}\",\n" +
                "                                                        \"idTag\": \"${idtag}\"\n" +
                "                                                    }\n" +
                "                                                }\n" +
                "                                            }\n" +
                "                                        },\n" +
                "                                        {\n" +
                "                                            \"type\": \"Action.Submit\",\n" +
                "                                            \"$when\": \"${reported=='true'}\",\n" +
                "                                            \"title\": \"Cancel\",\n" +
                "                                            \"style\": \"destructive\",\n" +
                "                                            \"data\": {\n" +
                "                                                \"idCategory\": \"${idcategory}\",\n" +
                "                                                \"idTag\": \"${idtag}\",\n" +
                "                                                \"rainbow\": {\n" +
                "                                                    \"text\": \"#cancelreporting ${category} ${tag}\",\n" +
                "                                                    \"type\": \"messageBack\",\n" +
                "                                                    \"value\": {\n" +
                "                                                        \"response\": \"cancelreporting\",\n" +
                "                                                        \"idCategory\": \"${idcategory}\",\n" +
                "                                                        \"idTag\": \"${idtag}\"\n" +
                "                                                    }\n" +
                "                                                }\n" +
                "                                            }\n" +
                "                                        }\n" +
                "                                    ]\n" +
                "                                }\n" +
                "                            ],\n" +
                "                            \"width\": \"66px\"\n" +
                "                        }\n" +
                "                    ]\n" +
                "                },\n" +
                "                {\n" +
                "                    \"type\": \"Image\",\n" +
                "                    \"url\": \"https://st-exupery.ale-custo.com/greenbot/line.svg\",\n" +
                "                    \"spacing\": \"none\",\n" +
                "                    \"height\": \"15px\",\n" +
                "                    \"width\": \"383px\"\n" +
                "                }\n" +
                "            ],\n" +
                "            \"spacing\": \"none\"\n" +
                "        },\n" +
                "        {\n" +
                "            \"type\": \"ColumnSet\",\n" +
                "            \"columns\": [\n" +
                "                {\n" +
                "                    \"type\": \"Column\",\n" +
                "                    \"width\": \"auto\",\n" +
                "                    \"items\": [\n" +
                "                        {\n" +
                "                            \"type\": \"ActionSet\",\n" +
                "                            \"actions\": [\n" +
                "                                {\n" +
                "                                    \"type\": \"Action.Submit\",\n" +
                "                                    \"title\": \"Report selected\",\n" +
                "                                    \"style\": \"positive\",\n" +
                "                                    \"data\": {\n" +
                "                                        \"rainbow\": {\n" +
                "                                            \"text\": \"#report-selected\",\n" +
                "                                            \"type\": \"messageBack\",\n" +
                "                                            \"value\": {\n" +
                "                                                \"response\": \"#report-selected\"\n" +
                "                                            }\n" +
                "                                        }\n" +
                "                                    }\n" +
                "                                }\n" +
                "                            ]\n" +
                "                        }\n" +
                "                    ]\n" +
                "                }\n" +
                "            ],\n" +
                "            \"horizontalAlignment\": \"Center\",\n" +
                "            \"spacing\": \"ExtraLarge\",\n" +
                "            \"height\": \"stretch\"\n" +
                "        }\n" +
                "    ],\n" +
                "    \"$schema\": \"http://adaptivecards.io/schemas/adaptive-card.json\",\n" +
                "    \"version\": \"1.3\"\n" +
                "}";

            const buildCard = (type) => {
                const content = msg.template
                // Create a Template instance from the template payload
                const template = new ACData.Template(content);
                const context = {
                    $root: msg.sample
                };
                const card = template.expand(context);

                return card;

            }


            alternateContent = {
                type: 'form/json',
                message: serialize.configure(buildCard(""))
            };

            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);

            msg.conversation = rainbowSDK.conversations.getConversationById(conversation.id);

            function getConversationHistory(conversation) {

                return rainbowSDK.conversations.getHistoryPage(conversation, 100).then(function (conversationUpdated) {
                    msg.conversationUpdated = conversationUpdated
                    return conversationUpdated.historyComplete ? conversationUpdated:getConversationHistory(conversationUpdated);
                });
            }

            getConversationHistory(msg.conversation).then(async conversation => {
                msg.conversation = conversation
                await rainbowSDK.im.getMessagesFromConversation(conversation, 10);
                let msgSentOrig = conversation.getlastEditableMsg();

                rainbowSDK.conversations.sendCorrectedChatMessage(msg.conversation, `${msgSentOrig.content} up`, msgSentOrig.id, alternateContent).then(message => {
                    msg.message = message;
                    //node.send([msg, null])
                    _logger.log("debug", "MAIN - testLoic - sendCorrectedChatMessage msg : ", msg);
                }, error => {
                    msg.error = error
                    _logger.log("debug", "MAIN - testLoic - sendCorrectedChatMessage msg : ", msg);
                    //node.send([null, msg])
                })
            }, error => {
                msg.error = error
                _logger.log("debug", "MAIN - testLoic - sendCorrectedChatMessage msg : ", msg);
                //node.send([null, msg])
            })
        }

        async testsendMessageToConversationFormJson() {
            /*
       const moment = global.get('moment');
       const serialize = global.get('safestablestringify');
       const ACData = global.get('adaptivecardstemplating');
       // */

            const message = "test"
            let alternateContent = null;

            const waitUntil = (condition, checkInterval = 500) => {
                return new Promise(resolve => {
                    let iter = 100
                    let interval = setInterval(() => {
                        _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - (waitUntil::setInterval) test condition in waitUntil")
                        if (!condition() && iter-- > 0) return;
                        _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - (waitUntil::setInterval) test condition in waitUntil is true")
                        clearInterval(interval);
                        resolve(true);
                    }, checkInterval)
                })
            }
            const buildCard = (type) => {
                const content = "{\n" +
                    "    \"title\": \"Report an issue\",\n" +
                    "    \"title1\": \"Your Issue(s) reported\",\n" +
                    "    \"issueList\": [\n" +
                    "        {\n" +
                    "            \"category\": \"Rainbow\",\n" +
                    "            \"tag\": \"Sounds metallic\",\n" +
                    "            \"idcategory\": \"idcategory\",\n" +
                    "            \"idtag\": \"idtag\",\n" +
                    "            \"reported\": \"false\"\n" +
                    "        },\n" +
                    "        {\n" +
                    "            \"category\": \"Rainbow\",\n" +
                    "            \"tag\": \"Sounds high\",\n" +
                    "            \"idcategory\": \"idcategory\",\n" +
                    "            \"idtag\": \"idtag2\",\n" +
                    "            \"reported\": \"false\"\n" +
                    "        },\n" +
                    "        {\n" +
                    "            \"category\": \"Rainbow\",\n" +
                    "            \"tag\": \"Sounds low\",\n" +
                    "            \"idcategory\": \"idcategory\",\n" +
                    "            \"idtag\": \"idtag1\",\n" +
                    "            \"reported\": \"true\",\n" +
                    "            \"when\": \"August 19, 2022 23:15:30\",\n" +
                    "            \"idIssue\": \"idIssue1\"\n" +
                    "        }\n" +
                    "    ]\n" +
                    "}"
                // Create a Template instance from the template payload
                const template = new ACData.Template(content);
                const context = {
                    $root: JSON.parse(content)
                };
                const card = template.expand(context);

                return card;

            }


            alternateContent = {
                type: 'form/json',
                message: serialize.configure(buildCard(""))
            };

            //let msg : any = {origin : {}};
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            let conversationId = conversation.id;

            await rainbowSDK.im.sendMessageToConversation(conversation, 'ok', "fr", alternateContent, "alternate").then(async message => {
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - search msgId : " + message.id);
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - msg.origin.conversation.id : " + conversation.id)
                await waitUntil(() => {
                    _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - (condition) of waitUntil");
                    let conversation = rainbowSDK.conversations.getConversationById(conversationId);
                    _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - (condition) conversation getConversationById : " + conversation.id);
                    let msgFound = conversation.getMessageById(message.id);
                    if (msgFound) {
                        _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - (condition) msgFound returned by getMessageById : " + msgFound.id);
                        ;
                    } else {
                        _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - (condition) empty msgFound returned by getMessageById.");
                    }
                    return msgFound!==undefined
                })
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - after waitUntil");

            }, error => {
            })

            return null;
        }

        async testsendMessageAdaptiveCard() {
            let alternateContent = null;


            function treatmentOfAdaptiveCardMessage(adaptiveResponse) {
                // Treatment of returned data by the adptive card.
                if (adaptiveResponse?.rainbow?.value?.response==="adaptiveCard_responseIntervention") {
                    let firstName = adaptiveResponse?.firstName;
                    let lastName = adaptiveResponse?.lastName;
                    let soinDone = adaptiveResponse?.interventionDoneVal;
                    let quantity = adaptiveResponse?.quantity;
                    let dateVal = adaptiveResponse?.dateVal;
                    let timeVal = adaptiveResponse?.timeVal;
                    let dateRespVal = adaptiveResponse?.dateRespVal;
                    _logger.log("debug", "MAIN - treatmentOfAdaptiveCardMessage - prenom : ", firstName, ", nom : ", lastName, ", le soin a-t-il était fait : ", soinDone +
                        ", Quantité : ", quantity +
                        ", le  : ", dateVal +
                        ", à : ", timeVal +
                        ", hidden dateRespVal : ", dateRespVal);
                } else {
                    // The card is not the result of an intervention.
                }
            }

            // The Handle on the event should be only once. So in a prod program it should be outside of the initial send message of the adpative Card.
            rainbowSDK.events.on("rainbow_onmessagereceived", (message) => {
                _logger.log("debug", "MAIN - (rainbow_onmessagereceived) - rainbow event received. message", message);
                let responseObjJson = "";
                if (message.alternativeContent?.length > 0 && message.alternativeContent[0]?.message && message.alternativeContent[0]?.type) {

                    switch (message.alternativeContent[0].type) {
                        case "rainbow/json":
                            responseObjJson = JSON.parse(message.alternativeContent[0].message);
                            treatmentOfAdaptiveCardMessage(responseObjJson);
                        default:
                    }

                }
            });

            const buildCard = (type) => {
                let templateJson = {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "${titleCard}"
                        },
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "${Survey.title}",
                            "horizontalAlignment": "Center",
                            "wrap": true,
                            "style": "heading"
                        },
                        {
                            "type": "Input.Text",
                            "id": "firstName",
                            "label": "${Survey.askFirstName}"
                        },
                        {
                            "type": "Input.Text",
                            "id": "lastName",
                            "label": "${Survey.askLastName}"
                        },
                        { // start
                            "type": "TextBlock",
                            "text": "${Survey.askQuantity}",
                            "wrap": true
                        },
                        {
                            "type": "Input.Number",
                            "min": 0,
                            "max": 5,
                            "value": 1,
                            "id": "quantity"
                        },
                        {
                            "type": "TextBlock",
                            "text": "${Survey.askDate}",
                            "wrap": true
                        },
                        {
                            "type": "Input.Date",
                            "id": "dateVal",
                            "value": "2023-11-06"
                        },
                        {
                            "type": "TextBlock",
                            "text": "${Survey.askTime}",
                            "wrap": true
                        },
                        {
                            "type": "Input.Time",
                            "id": "timeVal",
                            "value": "16:59"
                        },
                        {
                            "type": "TextBlock",
                            "text": "${Survey.questions[0].question}",
                            "wrap": true
                        },
                        {
                            "type": "Input.ChoiceSet",
                            "id": "interventionDoneVal",
                            "style": "expanded",
                            "value": "false",
                            "choices": [
                                {
                                    "$data": "${Survey.questions[0].items}",
                                    "title": "${title}",
                                    "value": "${value}"
                                }
                            ]
                        },
                        {
                            "type": "Input.Date",
                            "id": "dateRespVal",
                            "isVisible": false,
                            "value": "${formatDateTime(utcNow(), 'yyyy-MM-dd')}"
                        },

                    ],
                    "actions": [
                        {
                            "type": "Action.Submit",
                            "title": "Valider",
                            "data": {
                                "rainbow": {
                                    "text": "Retour fait.",
                                    "type": "messageBack",
                                    "value": {
                                        "response": "adaptiveCard_responseIntervention"
                                    }
                                }
                            }
                        }
                    ]
                }; // */

                let messageJson = {
                    "titleCard": "Retour de textes et choix.",
                    "Survey": {
                        "title": "Résultat d'intervension : ",
                        "askFirstName": "Votre prénom ?",
                        "askLastName": "Votre nom ?",
                        "askQuantity": "Quantité deliverée ? ",
                        "askDate": "Date de réalisation : ",
                        "askTime": "Start time : ",
                        "questions": [
                            {
                                "question": "Avez-vous effectué l'intervension ? ",
                                "items": [
                                    {
                                        "title": "Oui",
                                        "value": "true"
                                    },
                                    {
                                        "title": "Non",
                                        "value": "false"
                                    }
                                ]
                            }
                        ]
                    }
                };

                // Create a Template instance from the template payload
                const template = new ACData.Template(templateJson);
                const context = {
                    $root: messageJson
                };
                const card = template.expand(context);
                return JSON.stringify(card);
            }

            alternateContent = {
                type: 'form/json',
                //message: serialize.configure(buildCard(""))
                message: buildCard("")
            };

            _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - alternateContent : ", alternateContent?.message);

            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let conversationId = conversation.id;

            await rainbowSDK.im.sendMessageToConversation(conversation, 'ok', "fr", alternateContent, "retour intervension").then(async message => {
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - search msgId : " + message.id);
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - msg.origin.conversation.id : " + conversation.id)

            }, error => {
            })
        }

        async testsendMessageAdaptiveCard_anthony() {
            let alternateContent = null;


            function treatmentOfAdaptiveCardMessage(adaptiveResponse) {
                // Treatment of returned data by the adptive card.
                if (adaptiveResponse?.rainbow?.value?.response==="adaptiveCard_responseIntervention") {
                    let firstName = adaptiveResponse?.firstName;
                    let lastName = adaptiveResponse?.lastName;
                    let soinDone = adaptiveResponse?.interventionDoneVal;
                    let quantity = adaptiveResponse?.quantity;
                    let dateVal = adaptiveResponse?.dateVal;
                    let timeVal = adaptiveResponse?.timeVal;
                    let dateRespVal = adaptiveResponse?.dateRespVal;
                    _logger.log("debug", "MAIN - treatmentOfAdaptiveCardMessage - prenom : ", firstName, ", nom : ", lastName, ", le soin a-t-il était fait : ", soinDone +
                        ", Quantité : ", quantity +
                        ", le  : ", dateVal +
                        ", à : ", timeVal +
                        ", hidden dateRespVal : ", dateRespVal);
                } else {
                    // The card is not the result of an intervention.
                }
            }

            // The Handle on the event should be only once. So in a prod program it should be outside of the initial send message of the adpative Card.
            rainbowSDK.events.on("rainbow_onmessagereceived", (message) => {
                _logger.log("debug", "MAIN - (rainbow_onmessagereceived) - rainbow event received. message", message);
                let responseObjJson = "";
                if (message.alternativeContent?.length > 0 && message.alternativeContent[0]?.message && message.alternativeContent[0]?.type) {

                    switch (message.alternativeContent[0].type) {
                        case "rainbow/json":
                            responseObjJson = JSON.parse(message.alternativeContent[0].message);
                            treatmentOfAdaptiveCardMessage(responseObjJson);
                        default:
                    }

                }
            });

            const buildCard = (type) => {
                let templateJson = {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "${titleCard}"
                        },
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "${Survey.title}",
                            "horizontalAlignment": "Center",
                            "wrap": true,
                            "style": "heading"
                        },
                        {
                            "type": "Input.Text",
                            "id": "firstName",
                            "label": "${Survey.askFirstName}"
                        },
                        {
                            "type": "Input.Text",
                            "id": "lastName",
                            "label": "${Survey.askLastName}"
                        },
                        { // start
                            "type": "TextBlock",
                            "text": "${Survey.askQuantity}",
                            "wrap": true
                        },
                        {
                            "type": "Input.Number",
                            "min": 0,
                            "max": 5,
                            "value": 1,
                            "id": "quantity"
                        },
                        {
                            "type": "TextBlock",
                            "text": "${Survey.askDate}",
                            "wrap": true
                        },
                        {
                            "type": "Input.Date",
                            "id": "dateVal",
                            "value": "2023-11-06"
                        },
                        {
                            "type": "TextBlock",
                            "text": "${Survey.askTime}",
                            "wrap": true
                        },
                        {
                            "type": "Input.Time",
                            "id": "timeVal",
                            "value": "16:59"
                        },
                        {
                            "type": "TextBlock",
                            "text": "${Survey.questions[0].question}",
                            "wrap": true
                        },
                        {
                            "type": "Input.ChoiceSet",
                            "id": "interventionDoneVal",
                            "style": "expanded",
                            "value": "false",
                            "choices": [
                                {
                                    "$data": "${Survey.questions[0].items}",
                                    "title": "${title}",
                                    "value": "${value}"
                                }
                            ]
                        },
                        {
                            "type": "Input.Date",
                            "id": "dateRespVal",
                            "isVisible": false,
                            "value": "${formatDateTime(utcNow(), 'yyyy-MM-dd')}"
                        },

                    ],
                    "actions": [
                        {
                            "type": "Action.Submit",
                            "title": "Valider",
                            "data": {
                                "rainbow": {
                                    "text": "Retour fait.",
                                    "type": "messageBack",
                                    "value": {
                                        "response": "adaptiveCard_responseIntervention"
                                    }
                                }
                            }
                        }
                    ]
                }; // */

                let messageJson = {
                    "titleCard": "Retour de textes et choix.",
                    "Survey": {
                        "title": "Résultat d'intervension : ",
                        "askFirstName": "Votre prénom ?",
                        "askLastName": "Votre nom ?",
                        "askQuantity": "Quantité deliverée ? ",
                        "askDate": "Date de réalisation : ",
                        "askTime": "Start time : ",
                        "questions": [
                            {
                                "question": "Avez-vous effectué l'intervension ? ",
                                "items": [
                                    {
                                        "title": "Oui",
                                        "value": "true"
                                    },
                                    {
                                        "title": "Non",
                                        "value": "false"
                                    }
                                ]
                            }
                        ]
                    }
                };

                // Create a Template instance from the template payload
                const template = new ACData.Template(templateJson);
                const context = {
                    $root: messageJson
                };
                const card = template.expand(context);
                return JSON.stringify(card);
            }

            alternateContent = {
                type: 'form/json',
                //message: serialize.configure(buildCard(""))
                message: buildCard("")
            };

            _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - alternateContent : ", alternateContent?.message);

            let contactEmailToSearch = "anthony.legal@al-enterprise.com";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            //let conversationId = conversation.id;

            await rainbowSDK.im.sendMessageToConversation(conversation, 'ok', "fr", alternateContent, "retour intervension").then(async message => {
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - search msgId : " + message.id);
                _logger.log("debug", "MAIN - testsendMessageToConversationFormJson - msg.origin.conversation.id : " + conversation.id)

            }, error => {
            })
        }

        async testgetLastMessageOfConversation() {
            let that = this;
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await that.getLastMessageOfConversation(contact);
            _logger.log("debug", "MAIN - testgetLastMessageOfConversation - conversation : ", conversation);

            conversation.messages.forEach((message) => {
                _logger.log("debug", "MAIN - testgetLastMessageOfConversation - conversation.message : ", message);
            });
        }

        async testresetHistoryPageForConversation() {
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                _logger.log("debug", "MAIN - testresetHistoryPageForConversation - openConversationForContact, conversation : ", conversation);
                rainbowSDK.conversations.resetHistoryPageForConversation(conversation);
            });
        }

        getLastMessageOfConversation(contact): Promise<Conversation> {
            let that = this;
            let theLastMessageText = null;
            let conv = undefined;
            return new Promise((resolve, reject) => {
                //Request to create new conversation with the contact (in case if it does not exists)
                // or open existing (in case if it already exists)
                rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                    _logger.log("debug", "MAIN - getLastMessageOfConversation - openConversationForContact, conversation : ", conversation);
                    conv = conversation;

                    //This line of code will be executed when conversation object of the contact is provided
                    //Check value of property conversation.historyComplete
                    if (conversation.historyComplete===false) {
                        //Retrieve conversation history prior getting last message from conversation history
                        await that.getConversationHistory(conversation);
                        resolve(conversation);
                    } else {
                        //The code below will be executed in case if conversation history in completed.
                        //Therefore we can call function to output the last message to console
                        that.PrintTheLastMessage(conversation);
                        resolve(conversation);
                    }
                }).catch(function (err) {
                    //Something when wrong with the server. Handle the trouble here
                    _logger.log("debug", "MAIN - Error occurred in function getLastMessageOfConversation:" + err);
                });

            });
        }

        getConversationHistory(conversation) {
            let that = this;
            return new Promise((resolve, reject) => {
                //get messages from conversation. Max number of messages whichcan be retrieved at once is 100
                rainbowSDK.im.getMessagesFromConversation(conversation, 3).then(function (result) {
                    _logger.log("debug", "MAIN - messages : ", result);
                    // The conversation object is updated with the messages retrieved from the server after
                    //execution of rainbowSDK.im.getMessagesFromConversation function
                    // Check if there are is possibly more messages on the server than 100 requested
                    if (conversation.historyComplete===false) {
                        // TO DO: get next 100 messages
                    } else {
                        //At that pint conversation object has message history updated.
                        //Therefore we can call function to output the last message to console
                        that.PrintTheLastMessage(conversation);
                        resolve(conversation)
                    }
                }).catch(function (err) {
                    //Something when wrong with the server. Handle the trouble here
                    _logger.log("debug", "MAIN - Error in function getConversationHistory: " + err);
                    reject(err);
                });
            });
        }

        PrintTheLastMessage(conversation) {
            //Get number of messages in conversation
            let nbMessagesInConversation = conversation.messages.length;
            //If it is more than 0 then retrieve the last message from messages array.
            if (nbMessagesInConversation > 0) {
                //Note the messages array is 0 based, the first message has index 0
                //Therefore the last message index will be nbMessagesInConversation-1
                let theLastMessageText = conversation.messages[nbMessagesInConversation - 1].content;
                _logger.log("debug", "MAIN - The last message text is: " + theLastMessageText);
                _logger.log("debug", "MAIN - conversation.lastMessageText =" + conversation.lastMessageText);
            } else {
                _logger.log("debug", "MAIN - There are no messages in the conversation");
            }
        }

        getConversationHistoryMaxime(conversation) {
            let that = this;
            _logger.log("debug", "MAIN - getConversationHistoryMaxime");
            return rainbowSDK.conversations.getHistoryPage(conversation, 100).then((conversationUpdated) => {
                _logger.log("debug", "MAIN - getConversationHistoryMaxime getHistoryPage");

                let result = conversationUpdated.historyComplete ? conversationUpdated:that.getConversationHistoryMaxime(conversationUpdated);
                _logger.log("debug", "MAIN - getConversationHistoryMaxime getHistoryPage result : ", result);
                return result;
            });
        }

        async testGetHistoryPage() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                _logger.log("debug", "MAIN - testGetHistoryPage - openConversationForContact, conversation : ", conversation);
                that.getConversationHistoryMaxime(conversation).then(() => {
                    _logger.log("debug", "MAIN - testGetHistoryPage - getConversationHistoryMaxime, conversation : ", conversation);
                });
                ;
            });
        }

        async testgetS2SMessagesByConversationId(contactEmailToSearch : string = "vincent01@vbe.test.openrainbow.net") {
            let that = this;
            //let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                //logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - openConversationForContact, conversation : ", conversation);
                _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - openConversationForContact, conversation.messages.length : ", conversation.messages.length);
                rainbowSDK.conversations.getS2SMessagesByConversationId(conversation.dbId).then((result) => {
                    _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, conversation.messages.length : ", result.messages.length);
                    //_logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, result : ", result);
                    for (let i = 0; i < result.messages.length; i++) {
                        /*
                        let msg = {
                            "id": result.messages[i].id,
                            "from": result.messages[i].from,
                            "date": result.messages[i].datetime,
                            "side": result.messages[i].side,
                            "type": result.messages[i].type,
                            "alternativeContent": result.messages[i].contents,
                            "subject": result.messages[i].subject,
                            "body": result.messages[i].body,
                            "lang": result.messages[i].lang,
                            "urgency": result.messages[i].urgency,
                            "deleted": result.messages[i].isDeleted,
                            "modified": result.messages[i].isModified
                        }
                        _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, iter : [" + i + "], result.messages : ", result.messages[i], ", msg : ", msg);
                        // */
                        _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, iter : [" + i + "], result.messages : ", result.messages[i]);
                    }

                    /*
                     _links: {
    prev: '/api/rainbow/ucs/v1.0/connections/aa7565f8-d1be-11ef-ae81-00505628611e/conversations/1668445329264340/messages?before=1708471230825733&limit=10',
    next: '/api/rainbow/ucs/v1.0/connections/aa7565f8-d1be-11ef-ae81-00505628611e/conversations/1668445329264340/messages?after=1736780603704239&limit=10'
  }
                     */
                    let urlNext = result._links.next;
                    let urlPrev = result._links.prev;

                    function getS2SMessagesByConversationIdNext(urlNext) {
                        _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationIdNext, urlNext : ", urlNext);
                        const match = urlNext.match(/after=(\d+)&/);

                        if (match && match[1]) {
                            const afterValue = match[1];
                            rainbowSDK.conversations.getS2SMessagesByConversationId(conversation.dbId, 10, undefined, afterValue).then((resultNext) => {
                                _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, resultNext.messages.length : ", resultNext.messages.length);
                                // _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, resultNext : ", resultNext);
                                for (let i = 0; i < resultNext.messages.length; i++) {
                                    _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, iter : [" + i + "], resultNext.messages : ", resultNext.messages[i]);
                                }
                                let urlNextNext = resultNext._links.next;
                                if (urlNextNext) getS2SMessagesByConversationIdNext(urlNextNext);
                            });
                        }
                    }

                    function getS2SMessagesByConversationIdPrev(urlPrev) {
                        _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationIdPrev, urlPrev : ", urlPrev);
                        const matchPrev = urlPrev.match(/before=(\d+)&/);

                        if (matchPrev && matchPrev[1]) {
                            const beforeValue = matchPrev[1];
                            rainbowSDK.conversations.getS2SMessagesByConversationId(conversation.dbId, 10, beforeValue, undefined).then((resultPrev) => {
                                _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, resultPrev.messages.length : ", resultPrev.messages.length);
                                _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, resultPrev : ", resultPrev);
                                for (let i = 0; i < resultPrev.messages.length; i++) {
                                    _logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, iter : [" + i + "], resultPrev.messages : ", resultPrev.messages[i]);
                                }
                                let urlPrevPrev = resultPrev._links.prev;
                                if (urlPrevPrev) getS2SMessagesByConversationIdPrev(urlPrevPrev);
                            });
                        }
                    }

                    getS2SMessagesByConversationIdNext(urlNext);
                    getS2SMessagesByConversationIdPrev(urlPrev);
                });
            });
        }

        async testgetAllS2SMessagesByConversationId(contactEmailToSearch : string = "vincent01@vbe.test.openrainbow.net") {
            let that = this;
            //let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                //logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - openConversationForContact, conversation : ", conversation);
                _logger.log("debug", "MAIN - testgetAllS2SMessagesByConversationId - openConversationForContact");
                rainbowSDK.conversations.getAllS2SMessagesByConversationId(conversation.dbId).then((messages) => {
                    _logger.log("debug", "MAIN - testgetAllS2SMessagesByConversationId - getS2SMessagesByConversationId, messages.length : ", messages.length);
                    //_logger.log("debug", "MAIN - testgetS2SMessagesByConversationId - getS2SMessagesByConversationId, result : ", result);
                    for (let i = 0; i < messages.length; i++) {
                        /*
                        let msg = {
                            "id": result.messages[i].id,
                            "from": result.messages[i].from,
                            "date": result.messages[i].datetime,
                            "side": result.messages[i].side,
                            "type": result.messages[i].type,
                            "alternativeContent": result.messages[i].contents,
                            "subject": result.messages[i].subject,
                            "body": result.messages[i].body,
                            "lang": result.messages[i].lang,
                            "urgency": result.messages[i].urgency,
                            "deleted": result.messages[i].isDeleted,
                            "modified": result.messages[i].isModified
                        }
                        _logger.log("debug", "MAIN - testgetAllS2SMessagesByConversationId - getS2SMessagesByConversationId, iter : [" + i + "], result.messages : ", result.messages[i], ", msg : ", msg);
                        // */
                        _logger.log("debug", "MAIN - testgetAllS2SMessagesByConversationId - getS2SMessagesByConversationId, iter : [" + i + "], result.messages : ", messages[i]);
                    }
                });
            });
        }

        async testloadConversationHistory(contactEmailToSearch : string = "vincent01@vbe.test.openrainbow.net") {
            let that = this;
            //let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            rainbowSDK.conversations.openConversationForContact(contact).then(async function (conversation) {
                //logger.log("debug", "MAIN - testloadConversationHistory - openConversationForContact, conversation : ", conversation);
                _logger.log("debug", "MAIN - testloadConversationHistory - openConversationForContact, conversation.messages.length : ", conversation.messages.length);
                rainbowSDK.conversations.loadConversationHistory(conversation).then(() => {
                    _logger.log("debug", "MAIN - testloadConversationHistory - loadConversationHistory, conversation.messages.length : ", conversation.messages.length);
                    _logger.log("debug", "MAIN - testloadConversationHistory - loadConversationHistory, conversation : ", conversation);
                    for (let i = 0; i < conversation.messages.length; i++) {
                        let msg = {
                            "id": conversation.messages[i].id,
                            "from": conversation.messages[i].from ? conversation.messages[i].from._displayName:"",
                            "date": conversation.messages[i].date,
                            "side": conversation.messages[i].side,
                            "type": conversation.messages[i].type,
                            "content": conversation.messages[i].content,
                            "alternativeContent": conversation.messages[i].alternativeContent,
                            "deleted": conversation.messages[i].deleted,
                            "modified": conversation.messages[i].modified
                        }
                        _logger.log("debug", "MAIN - testloadConversationHistory - loadConversationHistory, iter : " + i + "], msg : ", msg);
                    }
                });
            });
        }

        async testGetHistoryPageBubbleOpenrainbowNet() {
            // To be used on PROD.
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllBubbles();
            if (bubbles.length > 0) {
                //let bubble = bubbles[0];
                //let jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com/a9b77288b939470b8da4611cc2af1ed1@openrainbow.com" // jid of the bubble "openrainbow.net" on .COM platform
                let jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com" // jid of the bubble "openrainbow.net" on .COM platform
                rainbowSDK.conversations.getBubbleConversation(jid).then(async function (conversation) {
                    _logger.log("debug", "MAIN - testGetHistoryPageBubbleOpenrainbowNet - getBubbleConversation, conversation.jid : ", conversation.jid, ", conversation : ", conversation);
                    /* that.getConversationHistoryMaxime(conversation).then(() => {
                        _logger.log("debug", "MAIN - testGetHistoryPageBubble - getConversationHistoryMaxime, conversation : ", conversation, ", status : ", conversation.status);
                    }); // */

                    rainbowSDK.conversations.getHistoryPage(conversation, 20).then((conversationUpdated) => {
                        _logger.log("debug", "MAIN - testGetHistoryPageBubbleOpenrainbowNet getHistoryPage, conversationUpdated : ", conversationUpdated);

                      /*
                      let result = conversationUpdated.historyComplete ? conversationUpdated:that.getConversationHistoryMaxime(conversationUpdated);
                        _logger.log("debug", "MAIN - testGetHistoryPageBubbleOpenrainbowNet getHistoryPage result : ", result);
                        return result;
                        // */
                    });

                });
            }
        }

        async testsendMessageBubbleTestBotName_2024() {
            // To be used with user vincent00 on .Net
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();

            for (const bubble of bubbles) {
                //if (bubble.name.indexOf("testBubbleEvents")!= -1) {
                if (bubble.name.indexOf("testBotName_2024/02/09T10:35:36.732ZGuestUser")!= -1) {
                    _logger.log("debug", "MAIN - testsendMessageBubbleTestBotName_2024 Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive);
                    rainbowSDK.conversations.getBubbleConversation(bubble.jid).then(async function (conversation) {
                        _logger.log("info", "MAIN - testsendMessageBubbleTestBotName_2024 - getBubbleConversation, conversation.jid : ", conversation.jid);
                        //setInterval(() => {
                        for (let i = 0; i < 4400; i++) {


                            rainbowSDK.im.sendMessageToConversation(conversation, "hello from node_" + i, "FR", null, "Le sujet de node").then((result) => {
                                _logger.log("debug", "MAIN - testsendMessageBubbleTestBotName_2024 sendMessageToConversation - result : ", result);
                            });
                            //}, 15000);
                            await pause(100);
                        }
                    });
                } else {
                    _logger.log("debug", "MAIN - testsendMessageBubbleTestBotName_2024 NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive);
                }
            }
        }

        async testloadConversationHistoryAsyncBubbleTestBotName_2024() {
            // To be used with user vincent00 on .Net
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();

            for (const bubble of bubbles) {
                //if (bubble.name.indexOf("testBubbleEvents")!= -1) {
               // if (bubble.name.indexOf("bulleDeTest")!= -1) {
                if (bubble.name.indexOf("testBotName_2024/02/09T10:35:36.732ZGuestUser")!= -1) {
                    _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleTestBotName_2024 Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive);
                  that.testloadConversationHistoryAsyncBubbleByJid(bubble.jid).then((res) => {
                      _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleTestBotName_2024 testloadConversationHistoryAsyncBubbleByJid treated.");
                  });
                } else {
                    _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleTestBotName_2024 NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive);
                }
            }
        }

        async teststring() {
            let msg = {"content":undefined};
            msg.content = {"body":"testString"} ;
            let res = isString(msg.content)? msg.content?.replace(/\n/g,"").replace(/\r/g,""):""+msg.content;
            _logger.log("debug", "MAIN - teststring res : ", res);

        }

        async testfindAllPropInJSONByPropertyNameByXmlNS() {
            let jsonMessage : any = {
                "$attrs": {
                    "xml:lang": "fr",
                    "from": "room_4ffb3ac439d048549eff81ec273fcf46@muc.openrainbow.net/adcf613d42984a79a7bebccc80c2b65e@openrainbow.net/web_win_2.143.1_vX7Xa0OG",
                    "type": "groupchat",
                    "id": "web_b073d60e-6a20-49d9-9e16-1d91f2e2b3bc4",
                    "xmlns": "jabber:client"
                },
                "ack": {
                    "$attrs": {
                        "recv": false,
                        "read": false,
                        "xmlns": "urn:xmpp:receipts"
                    }
                },
                "x": [
                    {
                        "$attrs": {
                            "xmlns": "http://jabber.org/protocol/muc#user"
                        },
                        "item": {
                            "$attrs": {
                                "jid": "adcf613d42984a79a7bebccc80c2b65e@openrainbow.net"
                            }
                        }
                    },
                    {
                        "$attrs": {
                            "xmlns": "jabber:x:oob"
                        },
                        "url": "https://openrainbow.net:443/api/rainbow/fileserver/v1.0/files/66c884c52a85a299acd65f3d",
                        "mime": "image/jpeg",
                        "filename": "4289476.jpg",
                        "size": 133829
                    }
                ],
                "archived": {
                    "$attrs": {
                        "stamp": "2024-08-23T12:47:02.129723Z",
                        "by": "room_4ffb3ac439d048549eff81ec273fcf46@muc.openrainbow.net",
                        "id": 1724417222129723,
                        "xmlns": "urn:xmpp:mam:tmp"
                    }
                },
                "stanza-id": {
                    "$attrs": {
                        "by": "room_4ffb3ac439d048549eff81ec273fcf46@muc.openrainbow.net",
                        "id": 1724417222129723,
                        "xmlns": "urn:xmpp:sid:0"
                    }
                },
                "store": {
                    "$attrs": {
                        "xmlns": "urn:xmpp:hints"
                    }
                },
                "request": {
                    "$attrs": {
                        "xmlns": "urn:xmpp:receipts"
                    }
                },
                "active": {
                    "$attrs": {
                        "xmlns": "http://jabber.org/protocol/chatstates"
                    }
                },
                "body": {
                    "_": "4289476.jpg",
                    "$attrs": {
                        "xml:lang": "fr"
                    }
                }
            };

            let oobElmt = findAllPropInJSONByPropertyNameByXmlNS(jsonMessage, "x", "jabber:x:oob") ; //? jsonMessage?.x //: undefined; // stanzaMessage?.getChild("x", "jabber:x:oob");
            _logger.log("debug", "MAIN - testfindAllPropInJSONByPropertyNameByXmlNS : ", oobElmt);
        }

        async testfindAllPropInJSONByPropertyName() {
            let jsonMessage : any = {
                '$attrs': { xmlns: 'urn:xmpp:attention:0' },
                jid: '4c4400e242b946b08f79c2ee01c2f044@openrainbow.net',
                length: 1
            };

            let oobElmt = findAllPropInJSONByPropertyName(jsonMessage, "jid") ; //? jsonMessage?.x //: undefined; // stanzaMessage?.getChild("x", "jabber:x:oob");
            _logger.log("debug", "MAIN - testfindAllPropInJSONByPropertyName : ", oobElmt);
        }

        async testgetTextFromJSONProperty() {
            let jsonMessage : any = {
                '$attrs': { xmlns: 'urn:xmpp:attention:0' },
                jid: '4c4400e242b946b08f79c2ee01c2f044@openrainbow.net',
                length: 1
            };

            let  attention = getTextFromJSONProperty(jsonMessage.attention)==="true" ? true:false;
            _logger.log("debug", "MAIN - testgetTextFromJSONProperty : ", attention);
        }

        async testgetTextFromJSONProperty_forwardedElmt_message() {
            let jsonMessage : any = {
                '$attrs': {
                    xmlns: 'jabber:client',
                    to: 'b1e0d314a3a54bbd84c40c638976fab4@openrainbow.com',
                    from: 'b3d12420fd21425eb34506a40253ec75@openrainbow.com',
                    id: 'web_26ce9774-c3a4-463c-8d13-84f2f7146b292',
                    'xml:lang': 'fr',
                    type: 'groupchat'
                },
                body: 'Hi All, Voip calls are not working. when make call it shows dialing but not reaching to the destination.'
            };

            let  result = getTextFromJSONProperty(jsonMessage.body);
            _logger.log("debug", "MAIN - testgetTextFromJSONProperty_forwardedElmt_message - result : ", result);
        }

        async testloadConversationHistoryAsyncBubbleTestBubbleBot2023_03_13T16() {
            // To be used with user vincent00 on .Net
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();

            for (const bubble of bubbles) {
                //if (bubble.name.indexOf("testBubbleEvents")!= -1) {
               // if (bubble.name.indexOf("bulleDeTest")!= -1) {
                if (bubble.name.indexOf("TestBubbleBot2023_03_13T16:15:24.673Z")!= -1) {
                    _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleTestBubbleBot2023_03_13T16 Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive);
                  that.testloadConversationHistoryAsyncBubbleByJid(bubble.jid).then((res) => {
                      _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleTestBubbleBot2023_03_13T16 testloadConversationHistoryAsyncBubbleByJid treated.");
                  });
                } else {
                    _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleTestBubbleBot2023_03_13T16 NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive);
                }
            }
        }

        async testloadConversationHistoryAsyncBubblebulle1() {
            // To be used with user vincent00 on .Net
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllActiveBubbles();

            rainbowSDK.events.on("rainbow_onloadConversationHistoryCompleted", (conversationHistoryUpdated) => {
                // do something when the SDK has been started
                _logger.log("info", "MAIN - (rainbow_onloadConversationHistoryCompleted) - rainbow conversation history loaded completed, conversationHistoryUpdated?.messages?.length : ", conversationHistoryUpdated?.messages?.length);
                for (let i = 0; i < conversationHistoryUpdated?.messages?.length; i++) {
                    let msg = conversationHistoryUpdated?.messages[i];
                    _logger.log("info", "MAIN - testloadConversationHistoryAsyncBubbleByJid conversationHistoryUpdated.messages[" + i + "] id : ", msg.id, ", fromJid : ", msg.fromJid, ", date : ", msg.date, ", content : ", msg.content);
                }
                // */
            });

                for (const bubble of bubbles) {
                //if (bubble.name.indexOf("testBubbleEvents")!= -1) {
               // if (bubble.name.indexOf("bulleDeTest")!= -1) {
                if (bubble.name.indexOf("bulle1")!= -1) {
                    _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubblebulle1 Found bubble.name : ", bubble.name, ", bubble.isActive : ", bubble.isActive);
                  that.testloadConversationHistoryAsyncBubbleByJid(bubble.jid).then((res) => {
                      _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubblebulle1 testloadConversationHistoryAsyncBubbleByJid treated.");
                  });
                } else {
                    _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubblebulle1 NOT Found bubble.name : ", bubble.name, ", buibble.isActive : ", bubble.isActive);
                }
            }
        }

        async testloadConversationHistoryAsyncBubbleOpenrainbowNet() {
            // To be used on PROD.
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllBubbles();
            if (bubbles.length > 0) {
                //let bubble = bubbles[0];
                //let jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com/a9b77288b939470b8da4611cc2af1ed1@openrainbow.com" // jid of the bubble "openrainbow.net" on .COM platform
                let jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com" // jid of the bubble "openrainbow.net" on .COM platform
                await that.testloadConversationHistoryAsyncBubbleByJid(jid);
            }
        }

        async testloadConversationHistoryAsyncBubbleByJid(jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com") {
            // To be used on PROD.
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllBubbles();
            if (bubbles.length > 0) {
                //let bubble = bubbles[0];
                //let jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com/a9b77288b939470b8da4611cc2af1ed1@openrainbow.com" // jid of the bubble "openrainbow.net" on .COM platform
                //let jid = "room_61aee9e9d7e94cacbce7234e3fca93f2@muc.openrainbow.com" // jid of the bubble "openrainbow.net" on .COM platform
                let startDate = undefined// new Date();
                rainbowSDK.events.on("rainbow_onloadConversationHistoryCompleted", (conversationHistoryUpdated) => {
                    // do something when the SDK has been started
                    _logger.log("info", "MAIN - (rainbow_onloadConversationHistoryCompleted) - rainbow conversation history loaded completed, conversationHistoryUpdated?.messages?.length : ", conversationHistoryUpdated?.messages?.length);
                    let stopDate = new Date();
                    // @ts-ignore
                    let startDuration = Math.round(stopDate - startDate);
                    let historyDelay : number = rainbowSDK.conversations.conversationHistoryHandler.historyDelay;
                    _logger.log("info", "MAIN - testloadConversationHistoryAsyncBubbleByJid loadConversationHistoryAsync duration : " + startDuration + " ms => ", msToTime(startDuration));
                    _logger.log("info", "MAIN - testloadConversationHistoryAsyncBubbleByJid loadConversationHistoryAsync treatment in callback duration historyDelay : " + historyDelay + " ms => ", msToTime(historyDelay));
                    let utc = new Date().toJSON().replace(/-/g, "_").replace(/:/g,"_");
                    let fileName = "listMsgs_"+utc ;
                    const path = 'c:/Temp/'+fileName+'.txt';
                    //writeFileSync(path, "", "utf8");

                        try {
                            let data = conversationHistoryUpdated.messages.toSmallString() + "MAIN - testloadConversationHistoryAsyncBubbleByJid loadConversationHistoryAsync duration : " + startDuration + " ms => " + msToTime(startDuration) + "\n MAIN - testloadConversationHistoryAsyncBubbleByJid loadConversationHistoryAsync treatment in callback duration historyDelay : " + historyDelay + " ms => " + msToTime(historyDelay);
                            writeFileSync(path, data, "utf8");
                            //appendFileSync(path, data);
                        } catch (err) {
                            _logger.log("error", "MAIN - testloadConversationHistoryAsyncBubbleByJid loadConversationHistoryAsync CATCH Error !!! : ", err);
                        }

                    /*
                     for (let i = 0; i < conversationHistoryUpdated?.messages?.length ; i++) {
                        let msg = conversationHistoryUpdated?.messages[i];
                        _logger.log("info", "MAIN - testloadConversationHistoryAsyncBubbleByJid conversationHistoryUpdated.messages[" + i + "] id : ", msg.id, ", fromJid : ", msg.fromJid, ", date : ", msg.date, ", content : ", msg.content);
                    }
                    // */

                    if (rainbowSDK) {
                        rainbowSDK.stop().then(() => {
                            process.exit(0);
                        }).catch((err) => {
                            _logger.log("warn", "MAIN - testloadConversationHistoryAsyncBubbleByJid RainbowSDK stop failed : ", err, ", but even stop the process."); //logger.colors.green(JSON.stringify(result)));
                            process.exit(0);
                        });
                    } else {
                        process.exit(0);
                    }
                });

                rainbowSDK.conversations.getBubbleConversation(jid).then(async function (conversation) {
                    _logger.log("info", "MAIN - testloadConversationHistoryAsyncBubbleByJid - getBubbleConversation, conversation.jid : ", conversation.jid);
                    /* that.getConversationHistoryMaxime(conversation).then(() => {
                        _logger.log("debug", "MAIN - testGetHistoryPageBubble - getConversationHistoryMaxime, conversation : ", conversation, ", status : ", conversation.status);
                    }); // */
                    startDate = new Date();
                    let useBulk = true;

                    rainbowSDK.conversations.loadConversationHistoryAsync(conversation, 400, useBulk).then((running) => {
                        _logger.log("info", "MAIN - testloadConversationHistoryAsyncBubbleByJid loadConversationHistoryAsync running : ", running);

                      /*
                      let result = conversationUpdated.historyComplete ? conversationUpdated:that.getConversationHistoryMaxime(conversationUpdated);
                        _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleByJid getHistoryPage result : ", result);
                        return result;
                        // */
                    });

                });
            }
        }

        async testloadConversationHistoryAsyncP2P() {
            // To be used on .NET with vincent00.
            let that = this;
            let startDate = new Date();
            rainbowSDK.events.on("rainbow_onloadConversationHistoryCompleted", (conversationHistoryUpdated) => {
                // do something when the SDK has been started
                _logger.log("info", "MAIN - (rainbow_onloadConversationHistoryCompleted) - rainbow conversation history loaded completed, conversationHistoryUpdated?.messages?.length : ", conversationHistoryUpdated?.messages?.length);
                let stopDate = new Date();
                // @ts-ignore
                let startDuration = Math.round(stopDate - startDate);
                _logger.log("info", "MAIN - testloadConversationHistoryAsyncP2P loadConversationHistoryAsync duration : " + startDuration + " ms.");

                if (conversationHistoryUpdated && conversationHistoryUpdated.messages) {
                    for (let i = 0; i < conversationHistoryUpdated.messages.length ; i++) {
                        _logger.log("info", "MAIN - testloadConversationHistoryAsyncP2P conversationHistoryUpdated.messages[" + i + "] : ", conversationHistoryUpdated.messages[i]);
                    }
                }

                if (rainbowSDK) {
                    rainbowSDK.stop().then(() => {
                        process.exit(0);
                    }).catch((err) => {
                        _logger.log("warn", "MAIN - RainbowSDK stop failed : ", err, ", but even stop the process."); //logger.colors.green(JSON.stringify(result)));
                        process.exit(0);
                    });
                } else {
                    process.exit(0);
                }
            });

            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation : Conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            if (conversation && conversation.id) {
                _logger.log("info", "MAIN - testloadConversationHistoryAsyncP2P - getBubbleConversation, conversation.id : ", conversation.id, ", conversation?.messages.length : ", conversation?.messages.length);
                /* that.getConversationHistoryMaxime(conversation).then(() => {
                    _logger.log("debug", "MAIN - testGetHistoryPageBubble - getConversationHistoryMaxime, conversation : ", conversation, ", status : ", conversation.status);
                }); // */
                rainbowSDK.conversations.loadConversationHistoryAsync(conversation, 20).then((running) => {
                    _logger.log("info", "MAIN - testloadConversationHistoryAsyncP2P loadConversationHistoryAsync running : ", running);

                    /*
                    let result = conversationUpdated.historyComplete ? conversationUpdated:that.getConversationHistoryMaxime(conversationUpdated);
                      _logger.log("debug", "MAIN - testloadConversationHistoryAsyncBubbleOpenrainbowNet getHistoryPage result : ", result);
                      return result;
                      // */
                });

            }
        }

        async testGetHistoryPageBubble() {
            let that = this;
            let bubbles = rainbowSDK.bubbles.getAllBubbles();
            if (bubbles.length > 0) {
                let bubble = bubbles[0];
                rainbowSDK.conversations.getBubbleConversation(bubble.jid).then(async function (conversation) {
                    _logger.log("info", "MAIN - testGetHistoryPageBubble - openConversationForContact, conversation : ", conversation);
                    that.getConversationHistoryMaxime(conversation).then(() => {
                        _logger.log("info", "MAIN - testGetHistoryPageBubble - getConversationHistoryMaxime, conversation : ", conversation, ", status : ", conversation.status);
                    });
                });
            }
        }


        testgetAllConversations() {
            let conversations = rainbowSDK.conversations.getAllConversations();
            if (conversations) {
                _logger.log("info", "MAIN - [testgetAllConversations ] :: rainbowSDK.conversations.pendingMessages.length : ",  rainbowSDK.conversations?.pendingMessages?.length  );
                conversations.forEach((conversation) => {
                    _logger.log("info", "MAIN - [testgetAllConversations ] :: conversation.d : ", conversation.id, ", conversations.messages.length : ", conversation?.messages?.length, ", conversations.pendingMessages.length : ", conversation?.pendingMessages?.length  );
                });
            }
        }

        testgetApiConfigurationFromServer() {
            rainbowSDK._core.rest.getApiConfigurationFromServer();
            let apiSettings = rainbowSDK._core._rest.http.apiHeadersConfiguration;
            if (apiSettings) {
                _logger.log("info", "MAIN - [testgetApiConfigurationFromServer ] :: apiSettings : ", apiSettings );
                apiSettings.forEach((apiConfig) => {
                    _logger.log("info", "MAIN - [testgetApiConfigurationFromServer ] :: apiConfig.method : ", apiConfig.method, ", apiConfig.URL : ", apiConfig.URL, ", apiConfig.headers : ", apiConfig.headers );
                });
            }
        }

        async testgetMyProfiles() {
            //let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            /*
        rainbowSDK.admin.retrieveUserSubscriptions(connectedUser.id).then(async function (result) {
           _logger.log("debug", "MAIN - testretrieveUserSubscriptions - retrieveUserSubscriptions, result : ", result);
        });
        // */

            let result = rainbowSDK.profiles.getMyProfiles()
            _logger.log("debug", "MAIN - testgetMyProfiles - getMyProfiles, result : ", result);
        }

        async testgetMyInformations() {
            //let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            /*
        rainbowSDK.admin.retrieveUserSubscriptions(connectedUser.id).then(async function (result) {
           _logger.log("debug", "MAIN - testretrieveUserSubscriptions - retrieveUserSubscriptions, result : ", result);
        });
        // */

            let result = await rainbowSDK.contacts.getMyInformations();
            _logger.log("debug", "MAIN - testgetMyInformations - getMyInformations, result : ", result);
        }

        //region test Methodes

        teststripStringForLogs() {
            let str = null;

            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));
            str = undefined;
            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));
            str = NaN;
            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));
            str = "A";
            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));
            str = "AB";
            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));
            str = "ABC";
            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));
            str = "ABCD";
            _logger.log("info", "MAIN - (teststripStringForLogs) - '", str, "' value test, result : ", _logger.stripStringForLogs(str));

        }

        //endregion


//region BUBBLES CONTAINERS
        async testgetAllBubblesContainers() {
            rainbowSDK.bubbles.getAllBubblesContainers().then(async function (result) {
                _logger.log("debug", "MAIN - testgetAllBubblesContainers - getAllBubblesContainers, result : ", result);
            });
        }

        async testgetAllBubblesContainersByName() {
            rainbowSDK.bubbles.getAllBubblesContainers("containers1").then(async function (result) {
                _logger.log("debug", "MAIN - testgetAllBubblesContainersByName - getAllBubblesContainers, result : ", result);
            });
        }

        async testgetABubblesContainersById() {
            rainbowSDK.bubbles.getAllBubblesContainers().then(async function (result) {
                _logger.log("debug", "MAIN - testgetABubblesContainersById - getAllBubblesContainers, result : ", result);
                rainbowSDK.bubbles.getABubblesContainersById(result[0].id).then(async function (result2) {
                    _logger.log("debug", "MAIN - testgetABubblesContainersById - getABubblesContainersById, result2 : ", result2);

                });
            });
        }

        async testaddBubblesToContainerById() {
            rainbowSDK.bubbles.getAllBubblesContainers("containers1").then(async function (result) {
                _logger.log("debug", "MAIN - testaddBubblesToContainerById - getAllBubblesContainers, result : ", result);
                let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
                let bubble = bubbles.find(element => element.name==="bubble2")
                let bubblesToMove = [];
                bubblesToMove.push(bubble.id);
                rainbowSDK.bubbles.addBubblesToContainerById(result[0].id, bubblesToMove).then(async function (result2) {
                    _logger.log("debug", "MAIN - testaddBubblesToContainerById - addBubblesToContainerById, result2 : ", result2);

                });
            });
        }

        async testupdateBubbleContainerNameAndDescriptionById() {
            let name = "containers1"
            rainbowSDK.bubbles.getAllBubblesContainers(name).then(async function (result) {
                _logger.log("debug", "MAIN - testupdateBubbleContainerNameAndDescriptionById - getAllBubblesContainers, result : ", result);
                let utc = new Date().toJSON().replace(/-/g, "_");
                name += "_" + utc;
                let description = "description_" + utc;
                rainbowSDK.bubbles.updateBubbleContainerNameAndDescriptionById(result[0].id, name, description).then(async function (result2) {
                    _logger.log("debug", "MAIN - testupdateBubbleContainerNameAndDescriptionById - addBubblesToContainersById, result2 : ", result2);
                });
            });
        }

        async testcreateBubbleContainer() {
            let name = "containersNew"
            let utc = new Date().toJSON().replace(/-/g, "_");
            name += "_" + utc;
            let description = "description_" + utc;
            rainbowSDK.bubbles.createBubbleContainer(name, description).then(async function (result: any) {
                _logger.log("debug", "MAIN - testcreateBubbleContainer - createBubbleContainer, result : ", result);
                rainbowSDK.bubbles.deleteBubbleContainer(result.id).then((result2) => {
                    _logger.log("debug", "MAIN - testcreateBubbleContainer - deleteBubbleContainer, result2 : ", result2);
                });
            });
        }

        async testaddBubblesAndRemoveToContainersById() {
            rainbowSDK.bubbles.getAllBubblesContainers("containers1").then(async function (result: any) {
                _logger.log("debug", "MAIN - testaddBubblesAndRemoveToContainersById - getAllBubblesContainers, result : ", result);
                let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
                let bubble = bubbles.find(element => element.name==="bubble2")
                let bubblesToMove = [];
                bubblesToMove.push(bubble.id);
                rainbowSDK.bubbles.addBubblesToContainerById(result[0].id, bubblesToMove).then(async function (result2) {
                    _logger.log("debug", "MAIN - testaddBubblesAndRemoveToContainersById - addBubblesToContainerById, result2 : ", result2);
                    rainbowSDK.bubbles.removeBubblesFromContainer(result[0].id, bubblesToMove).then(async function (result3) {
                        _logger.log("debug", "MAIN - testaddBubblesAndRemoveToContainersById - removeBubblesFromContainer, result3 : ", result3);
                    });
                });
            });
        }

        //endregion BUBBLES CONTAINERS

        //region CallLog

        testgetCallLogHistoryPage() {
            //let mycalllog = mycalllogs ? mycalllogs.callLogs[0]:{};
            //let utc = new Date().toJSON().replace(/-/g, "_");
            rainbowSDK.calllog.getCallLogHistoryPage();
        }

        testDeleteOneCallLog() {
            let mycalllog = mycalllogs ? mycalllogs.callLogs[0]:{};
            let utc = new Date().toJSON().replace(/-/g, "_");
            rainbowSDK.calllog.deleteOneCallLog(mycalllog.id);
        }

        testDeleteAllCallLogs() {
            let mycalllog = mycalllogs ? mycalllogs.callLogs[0]:{};
            let utc = new Date().toJSON().replace(/-/g, "_");
            rainbowSDK.calllog.deleteAllCallLogs();
        }

        async testDeleteCallLogsForContact() {
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let jid = contact.jid_im;
            rainbowSDK.calllog.deleteCallLogsForContact(jid);
        }

        testmarkCallLogAsRead() {
            let mycalllog = {"id": null}; //mycalllogs ? mycalllogs.callLogs[0] : {};
            let utc = new Date().toJSON().replace(/-/g, "_");
            if (mycalllogs) {
                mycalllogs.simplifiedCallLogs.forEach((simpleCallL) => {
                    _logger.log("debug", "MAIN - testmarkCallLogAsRead simpleCallL : ", simpleCallL); //logger.colors.green(JSON.stringify(result)));
                    if (!simpleCallL.read) {
                        mycalllog = simpleCallL; // Keep a ref to the last call Logged which is not read
                    }
                });
                if (mycalllog.id) {
                    _logger.log("debug", "MAIN - testmarkCallLogAsRead simpleCallL not read is : ", mycalllog); //logger.colors.green(JSON.stringify(result)));
                    rainbowSDK.calllog.markCallLogAsRead(mycalllog.id);
                }
            } else {
                _logger.log("debug", "MAIN - testmarkCallLogAsRead mycalllogs is not defined : ", mycalllogs); //logger.colors.green(JSON.stringify(result)));
            }
        }

        testmarkAllCallsLogsAsRead() {
            _logger.log("debug", "MAIN - testmarkAllCallsLogsAsRead."); //logger.colors.green(JSON.stringify(result)));
            rainbowSDK.calllog.markAllCallsLogsAsRead();
        }

        //endregion CallLog

        //region Telephony

        testmakeCallByPhoneNumber() {
            return __awaiter(this, void 0, void 0, function* () {
                rainbowSDK.telephony.makeCallByPhoneNumber("23050", undefined).then((data1) => {
                    //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] after makecall : ", data1);
                    Utils.setTimeoutPromised(1000).then(() => {
                        rainbowSDK.telephony.getCalls().forEach((data2) => {
                            _logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] after makecall getCalls : ", data2);
                        });
                    });
                }).catch((error) => {
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] error ", error);
                });
                setTimeout(() => {
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] Release all calls, calls size : ", Object.keys(calls).length);
                    // Release all calls
                    calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                        //await rainbowSDK.telephony.releaseCall(c);
                        Utils.setTimeoutPromised(10000).then(() => {
                            _logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                            rainbowSDK.telephony.getCalls().forEach((data3) => {
                                _logger.log("debug", "MAIN - [testmakeCallByPhoneNumber] after releaseCall getCalls : ", data3);
                            });
                        });
                    }));
                }, 15000);
                // */
            });
        }

        testmakeCallByPhoneNumberAndHoldCallRetrieveCall() {
            return __awaiter(this, void 0, void 0, function* () {
                rainbowSDK.telephony.makeCallByPhoneNumber("23050", undefined).then((data1) => {
                    //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after makecall : ", data1, " PLEASE ANSWER CALL ON PHONE.");

                    Utils.setTimeoutPromised(1000).then(() => {
                        rainbowSDK.telephony.getCalls().forEach((data2) => {
                            _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after makecall getCalls : ", data2);
                        });
                    });
                }).catch((error) => {
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] error ", error);
                });
                setTimeout(() => {
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] holdCall all calls, calls size : ", Object.keys(calls).length);
                    // Release all calls
                    calls.forEach(async (c) => {
                        await rainbowSDK.telephony.holdCall(c);
                        Utils.setTimeoutPromised(6000).then(async () => {
                            _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                            rainbowSDK.telephony.getCalls().forEach((data3) => {
                                _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberAndHoldCallRetrieveCall] after holdCall getCalls : ", data3);
                            });

                            await rainbowSDK.telephony.retrieveCall(c);
                        });
                    });
                }, 15000);
                // */
            });
        }

        testmakeCallByPhoneNumberProd() {
            return __awaiter(this, void 0, void 0, function* () {
                rainbowSDK.telephony.makeCallByPhoneNumber("00622413746", "My_correlatorData").then((data1) => {
                    //        rainbowSDK.telephony.makeCallByPhoneNumber("23050","My_correlatorData").then((data1)=>{
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] after makecall : ", data1);
                    Utils.setTimeoutPromised(1000).then(() => {
                        rainbowSDK.telephony.getCalls().forEach((data2) => {
                            _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] after makecall getCalls : ", data2);
                        });
                    });
                }).catch((error) => {
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] error ", error);
                });
                setInterval(() => {
                    _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] Release all calls, calls size : ", Object.keys(calls).length);
                    // Release all calls
                    calls.forEach((c) => __awaiter(this, void 0, void 0, function* () {
                        //await rainbowSDK.telephony.releaseCall(c);
                        Utils.setTimeoutPromised(10000).then(() => {
                            _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] getCallsSize : ", rainbowSDK.telephony.getCallsSize());
                            rainbowSDK.telephony.getCalls().forEach((data3) => {
                                _logger.log("debug", "MAIN - [testmakeCallByPhoneNumberProd] after releaseCall getCalls : ", data3);
                            });
                        });
                    }));
                }, 10000);
                // */
            });
        }

        async testdeflectCallToVM() {
            //let call = {contact:{displayNameForLog:()=>{console.log("deflectCallToVM contact display.")}}};
            let call = calls ? calls[(calls.length - 1)]:{
                contact: {
                    displayNameForLog: () => {
                        console.log("deflectCallToVM contact display.")
                    }
                }
            };
            let result = await rainbowSDK.telephony.deflectCallToVM(call).catch((err) => {
                _logger.log("debug", "MAIN - (testdeflectCallToVM) error while deflect call to VM : ", err);
            });
            _logger.log("debug", "MAIN - (testdeflectCallToVM) result : ", result);
        }

        //endregion Telephony

        //region Public URL of Bubble

        async testgetAllPublicUrlOfBubbles() {
            let result = await rainbowSDK.bubbles.getAllPublicUrlOfBubbles().catch((err) => {
                _logger.log("debug", "MAIN - (testgetAllPublicUrlOfBubbles) error while creating guest user :  ", err);
            });
            _logger.log("debug", "MAIN - [testgetAllPublicUrlOfBubbles] All PublicUrl Of Bubbles : ", result);
        }

        async testgetAllPublicUrlOfBubblesOfAUser() {
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
            let result = await rainbowSDK.bubbles.getAllPublicUrlOfBubblesOfAUser(contact).catch((err) => {
                _logger.log("debug", "MAIN - (testgetAllPublicUrlOfBubblesOfAUser) error :  ", err);
            });
            _logger.log("debug", "MAIN - [testgetAllPublicUrlOfBubblesOfAUser] All PublicUrl Of Bubbles : ", result);
        }

        async testgetAllPublicUrlOfABubble() {
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
            let myBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            if (myBubbles.length > 0) {
                _logger.log("debug", "MAIN - testgetAllPublicUrlOfABubble - myBubbles : ", myBubbles, " nb owned bulles : ", myBubbles ? myBubbles.length:0);
                for (let bubble of myBubbles) {
                    let result = await rainbowSDK.bubbles.getAllPublicUrlOfABubble(bubble).catch((err) => {
                        _logger.log("debug", "MAIN - (testgetAllPublicUrlOfABubble) error :  ", err);
                    });
                    _logger.log("debug", "MAIN - [testgetAllPublicUrlOfABubble] The PublicUrl ", result, " Of a Bubble : ", bubble);
                }
            }
        }

        async testgetAllPublicUrlOfABubbleOfAUser() {
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");
            //let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
            let myBubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
            if (myBubbles.length > 0) {
                _logger.log("debug", "MAIN - testgetAllPublicUrlOfABubbleOfAUser - myBubbles : ", myBubbles, " nb owned bulles : ", myBubbles ? myBubbles.length:0);
                for (let bubble of myBubbles) {
                    let result = await rainbowSDK.bubbles.getAllPublicUrlOfABubbleOfAUser(contact, bubble).catch((err) => {
                        _logger.log("debug", "MAIN - (testgetAllPublicUrlOfABubbleOfAUser) error :  ", err);
                    });
                    _logger.log("debug", "MAIN - [testgetAllPublicUrlOfABubbleOfAUser] The PublicUrl ", result, " Of a Bubble : ", bubble);
                }
            }
        }

        //endregion Public URL of Bubble

        //region Offers

        async testretrieveAllOffersOfCompanyById() {
            let Offers = await rainbowSDK.admin.retrieveAllOffersOfCompanyById();
            _logger.log("debug", "MAIN - testretrieveAllOffersOfCompanyById - Offers : ", Offers);
            for (let offer of Offers) {
                _logger.log("debug", "MAIN - [testretrieveAllOffersOfCompanyById] offer : ", offer);
                if (offer.name==="Enterprise Demo") {
                    _logger.log("debug", "MAIN - [testretrieveAllOffersOfCompanyById] offer Enterprise Demo found : ", offer);
                }
            }
        }

        async testsubscribeCompanyToDemoOffer() {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "MyVberderCompany_" + utc;
            let newCompany = await (rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - createCompany Error : ", e);
            }));
            await pause(2000);
            let subscribeResult: any = await rainbowSDK.admin.subscribeCompanyToDemoOffer(newCompany.id).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - subscribeCompanyToDemoOffer Error : ", e);
            });
            _logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - subscribeResult : ", subscribeResult);
            let email = "vincentTest01@vbe.test.openrainbow.com";
            let password = "Password_123";
            let firstname = "vincentTest01";
            let lastname = "berderTest01";
            await pause(2000);
            _logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - retrieveAllSubscriptionsOfCompanyById Result : ", await rainbowSDK.admin.retrieveAllSubscriptionsOfCompanyById(newCompany.id).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - retrieveAllSubscriptionsOfCompanyById Error : ", e);
            }));
            await pause(2000);

            let newUser: any = await rainbowSDK.admin.createUserInCompany(email, password, firstname, lastname, newCompany.id, "en-US", false /* admin or not */, ["user", "closed_channels_admin", "private_channels_admin", "public_channels_admin"]).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - createUserInCompany Error : ", e);
            });
            await pause(10000);
            _logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - subscribeUserToSubscription Result : ", await rainbowSDK.admin.subscribeUserToSubscription(newUser.id, subscribeResult.id).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - subscribeUserToSubscription Error : ", e);
            }));
            _logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - unSubscribeUserToSubscription Result : ", await rainbowSDK.admin.unSubscribeUserToSubscription(newUser.id, subscribeResult.id).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - unSubscribeUserToSubscription Error : ", e);
            }));
            _logger.log("debug", "MAIN - testsubscribeCompanyToDemoOffer - unSubscribeCompanyToDemoOffer Result : ", await rainbowSDK.admin.unSubscribeCompanyToDemoOffer(newCompany.id).catch((e) => {
                _logger.log("error", "MAIN - testsubscribeCompanyToDemoOffer - unSubscribeCompanyToDemoOffer Error : ", e);
            }));
            let deletedUser = await rainbowSDK.admin.deleteUser(newUser.id);
            let deletedCompany = await rainbowSDK.admin.removeCompany({id: newCompany.id});

        }

        async testCreateCompanyCreateUserAndDelete() {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "MyVberderCompany_" + utc;
            let newCompany = await (rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM).catch((e) => {
                _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - createCompany Error : ", e);
            }));
            await pause(2000);
            /* let subscribeResult: any = await rainbowSDK.admin.subscribeCompanyToDemoOffer(newCompany.id).catch((e) => {
           _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - subscribeCompanyToDemoOffer Error : ", e);
        }) ;
       _logger.log("debug", "MAIN - testCreateCompanyCreateUserAndDelete - subscribeResult : ", subscribeResult);
        // */
            let generatedId = makeId(15);
            let email = "vincentTest01" + generatedId + "@vbe.test.openrainbow.com";
            let password = "Password_123";
            let firstname = "vincentTest01_" + generatedId;
            let lastname = "berderTest01_" + generatedId;
            await pause(2000);
            /*logger.log("debug", "MAIN - testCreateCompanyCreateUserAndDelete - retrieveAllSubscriptionsOfCompanyById Result : ", await rainbowSDK.admin.retrieveAllSubscriptionsOfCompanyById(newCompany.id).catch((e) => {
           _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - retrieveAllSubscriptionsOfCompanyById Error : ", e);
        }));
        await pause(2000);
// */
            let newUser: any = await rainbowSDK.admin.createUserInCompany(email, password, firstname, lastname, newCompany.id, "en-US", false /* admin or not */, ["user", "closed_channels_admin", "private_channels_admin", "public_channels_admin"]).catch((e) => {
                _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - createUserInCompany Error : ", e);
            });
            await pause(10000);
            /*
       _logger.log("debug", "MAIN - testCreateCompanyCreateUserAndDelete - subscribeUserToSubscription Result : ", await rainbowSDK.admin.subscribeUserToSubscription(newUser.id, subscribeResult.id).catch((e) => {
           _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - subscribeUserToSubscription Error : ", e);
        }));
       _logger.log("debug", "MAIN - testsubscribtestCreateCompanyCreateUserAndDeleteeCompanyToDemoOffer - unSubscribeUserToSubscription Result : ", await rainbowSDK.admin.unSubscribeUserToSubscription(newUser.id, subscribeResult.id).catch((e) => {
           _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - unSubscribeUserToSubscription Error : ", e);
        }));
       _logger.log("debug", "MAIN - testCreateCompanyCreateUserAndDelete - unSubscribeCompanyToDemoOffer Result : ", await rainbowSDK.admin.unSubscribeCompanyToDemoOffer(newCompany.id).catch((e) => {
           _logger.log("error", "MAIN - testCreateCompanyCreateUserAndDelete - unSubscribeCompanyToDemoOffer Error : ", e);
        }));
        // */

            let result = await rainbowSDK.contacts.addToNetwork(newUser);
            await pause(10000);
            _logger.log("debug", "MAIN - testCreateCompanyCreateUserAndDelete - addToNetwork done Result : ", result);

            let contacts = rainbowSDK.contacts.getAll();
            _logger.log("debug", "MAIN - contacts : ", contacts);

            let deletedUser = await rainbowSDK.admin.deleteUser(newUser.id);

            let contacts2 = rainbowSDK.contacts.getAll();
            _logger.log("debug", "MAIN - contacts2 : ", contacts2);
            await pause(10000);
            let contacts3 = rainbowSDK.contacts.getAll();
            _logger.log("debug", "MAIN - contacts3 : ", contacts3);
            let deletedCompany = await rainbowSDK.admin.removeCompany({id: newCompany.id});
        }

        async testCreateCompanyCreateUsersForTests() {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "VBRCompany";

            let newCompany : any = await (rainbowSDK.admin.getCompanieByName(companyName));

            if (!newCompany) {
                newCompany = await (rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM).catch((e) => {
                    _logger.log("error", "MAIN - testCreateCompanyCreateUsersForTests - createCompany Error : ", e);
                }));
                await pause(2000);
            } else {
                newCompany = newCompany?.data;
                if (Array.isArray(newCompany) && newCompany.length === 1) {
                    newCompany = newCompany[0];
                }
            }
            for (let i = 0; i < 100; i++) {

                let generatedId = i;
                //let generatedId = makeId(15);
                let email = "vbrTests" + generatedId + "@vbe.test.openrainbow.net";
                let password = "Password_123";
                let firstname = "vbrTests_" + generatedId;
                let lastname = "vbrTests_" + generatedId;
                await pause(2000);

                let newUser: any = await rainbowSDK.admin.createUserInCompany(email, password, firstname, lastname, newCompany.id, "en-US", false /* admin or not */, ["user", "closed_channels_admin", "private_channels_admin", "public_channels_admin"]).catch((e) => {
                    _logger.log("error", "MAIN - testCreateCompanyCreateUsersForTests - createUserInCompany Error : ", e);
                });
                _logger.log("debug", "MAIN - ",i, " contact created. Wait 5seconds before next creation.");
                await pause(5000);

            }
        }

        async testDeleteUsersForTestsWithComExtension() {
            // To use with rford@westworld.com
            // i created contacts with wrong emails extension, so this method is to clean server.

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "VBRCompany";

            let newCompany : any = await (rainbowSDK.admin.getCompanieByName(companyName));

            if (!newCompany) {
                await pause(2000);
                _logger.log("debug", "MAIN - testDeleteUsersForTestsWithComExtension - newCompany ", companyName, " not found.");
                return ;
            } else {
                newCompany = newCompany?.data;
                if (Array.isArray(newCompany) && newCompany.length === 1) {
                    newCompany = newCompany[0];
                }
            }
            await pause(2000);
            for (let i = 0; i < 100; i++) {

                let generatedId = i;
                //let generatedId = makeId(15);
                let email = "vbrTests" + generatedId + "@vbe.test.openrainbow.com";
                let password = "Password_123";
                let firstname = "vbrTests_" + generatedId;
                let lastname = "vbrTests_" + generatedId;

                let contactEmailToSearch = email;
                let utc = new Date().toJSON().replace(/-/g, "_");
                let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
                let deletedUser = await rainbowSDK.admin.deleteUser(contact.id).then(async () => {
                    _logger.log("debug", "MAIN - testDeleteUsersForTestsWithComExtension - ",i, " contact deleted. Wait 5seconds before next creation.");
                    // */
                    await pause(1000);
                }).catch((err) => {
                    _logger.log("error", "MAIN - testDeleteUsersForTestsWithComExtension - ",i, " failed to delete contact. Err : ", err);
                });
            }
        }

        async testJoinCompanyInvitations() {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "MyVberderCompany_" + utc;
            let newCompany = await (rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM).catch((e) => {
                _logger.log("error", "MAIN - testJoinCompanyInvitations - createCompany Error : ", e);
            }));
            await pause(2000);
            let email = "vincentTest01@vbe.test.openrainbow.com";
            let password = "Password_123";
            let firstname = "vincentTest01";
            let lastname = "berderTest01";
            await pause(2000);
            /*logger.log("debug", "MAIN - testJoinCompanyInvitations - retrieveAllSubscriptionsOfCompanyById Result : ", await rainbowSDK.admin.retrieveAllSubscriptionsOfCompanyById(newCompany.id).catch((e) => {
           _logger.log("error", "MAIN - testJoinCompanyInvitations - retrieveAllSubscriptionsOfCompanyById Error : ", e);
        }));
        await pause(2000);
        // */

            let loginEmail = rainbowSDK.Utils.generateRamdomEmail(email);

//        let newUser : any = await rainbowSDK.admin.createUser(email, password, firstname, lastname, undefined, "en-US", false /* admin or not */, ["user"]).catch((e) => {
            let p_sendInvitationEmail: boolean = false, p_doNotAssignPaidLicense: boolean = false,
                p_mandatoryDefaultSubscription: boolean = false,
                p_companyId: string = undefined, p_loginEmail: string = loginEmail, p_customData: any = undefined,
                p_password: string = password,
                p_firstName: string = firstname, p_lastName: string = lastname,
                p_nickName: string = undefined, p_title: string = undefined, p_jobTitle: string = undefined,
                p_department: string = undefined,
                p_tags: Array<string> = undefined, p_emails: Array<any> = undefined,
                p_phoneNumbers: Array<any> = undefined, p_country: string = undefined,
                p_state: string = undefined, p_language: string = "en-US",
                p_timezone: string = undefined, p_accountType: string = "free", p_roles: Array<string> = ["user"],
                p_adminType: string = undefined, p_isActive: boolean = true, p_isInitialized: boolean = false,
                p_visibility: string = undefined,
                p_timeToLive: number = -1, p_authenticationType: string = undefined,
                p_authenticationExternalUid: string = undefined, p_userInfo1: string = undefined,
                p_selectedTheme: string = undefined, p_userInfo2: string = undefined, p_isAdmin: boolean = false;
            let newUser: any = await rainbowSDK.admin.createUser(p_sendInvitationEmail, p_doNotAssignPaidLicense, p_mandatoryDefaultSubscription, p_companyId, p_loginEmail, p_customData, p_password, p_firstName, p_lastName,
                p_nickName, p_title, p_jobTitle, p_department, p_tags, p_emails, p_phoneNumbers, p_country, p_state, p_language,
                p_timezone, p_accountType, p_roles, p_adminType, p_isActive, p_isInitialized, p_visibility, p_timeToLive, p_authenticationType,
                p_authenticationExternalUid, p_userInfo1, p_selectedTheme, p_userInfo2, p_isAdmin).catch((e) => {
                _logger.log("error", "MAIN - testJoinCompanyInvitations - createUser Error : ", e);
            });
            await pause(10000);
            try {


                let invitation: any = await rainbowSDK.admin.inviteUserInCompany(newUser.loginEmail, newCompany.id, "en-US", "Hello !!!");
                _logger.log("debug", "MAIN - (testJoinCompanyInvitations) invitation : ", invitation);

                let options1: any = {};

                Object.assign(options1, options);
                options1.credentials.login = loginEmail;
                options1.credentials.password = password;
                options1.logs.customLabel = options1.credentials.login + "_1";
                options1.logs.file.customFileName = "R-SDK-Node-" + options1.credentials.login + "_1";
                let rainbowSDK1 = new RainbowSDK(options1);
                rainbowSDK1.events.on("rainbow_onconnectionerror", () => {
                    // do something when the SDK has been started
                    _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
                });
                rainbowSDK1.events.on("rainbow_onerror", (data) => {
                    _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " should destroy and recreate the SDK.");
                    rainbowSDK1 = undefined;
                });
                rainbowSDK1.events.on("rainbow_onjoincompanyinvitereceived", (data) => {
                    _logger.log("debug", "MAIN - (rainbow_onjoincompanyinvitereceived)  - rainbow event received. data", data);
                    rainbowSDK1 = undefined;
                });


                await rainbowSDK1.start(undefined).then(async (result2) => {
                    // Do something when the SDK is started
                    _logger.log("debug", "MAIN - (testJoinCompanyInvitations) rainbow SDK started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
                });

                let allInvitations: any = await rainbowSDK1.admin.getAllJoinCompanyInvitations("lastNotificationDate", undefined, "small", 100, 0, 1).catch((e) => {
                    _logger.log("error", "MAIN - testJoinCompanyInvitations - getAllJoinCompanyInvitations Error : ", e);
                })
                _logger.log("debug", "MAIN - testJoinCompanyInvitations - getAllJoinCompanyInvitations Result : ", allInvitations); // */

                _logger.log("debug", "MAIN - testJoinCompanyInvitations - acceptJoinCompanyInvitation Result : ", await rainbowSDK1.admin.acceptJoinCompanyInvitation(allInvitations.data[0].id).catch((e) => {
                    _logger.log("error", "MAIN - testJoinCompanyInvitations - acceptJoinCompanyInvitation Error : ", e);
                })); // */

            } catch (e) {

            }

            let deletedUser = await rainbowSDK.admin.deleteUser(newUser.id);
            let deletedCompany = await rainbowSDK.admin.removeCompany({id: newCompany.id});

        }

        async testJoinCompanyRequest() {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "MyVberderCompany_" + utc;
            let newCompany = await (rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM).catch((e) => {
                _logger.log("error", "MAIN - testJoinCompanyRequest - createCompany Error : ", e);
            }));
            await pause(2000);
            let email = "vincentTest01@vbe.test.openrainbow.com";
            let password = "Password_123";
            let firstname = "vincentTest01";
            let lastname = "berderTest01";
            await pause(2000);
            /*logger.log("debug", "MAIN - testJoinCompanyInvitations - retrieveAllSubscriptionsOfCompanyById Result : ", await rainbowSDK.admin.retrieveAllSubscriptionsOfCompanyById(newCompany.id).catch((e) => {
           _logger.log("error", "MAIN - testJoinCompanyInvitations - retrieveAllSubscriptionsOfCompanyById Error : ", e);
        }));
        await pause(2000);
        // */

            let loginEmail = rainbowSDK.Utils.generateRamdomEmail(email);

//        let newUser : any = await rainbowSDK.admin.createUser(email, password, firstname, lastname, undefined, "en-US", false /* admin or not */, ["user"]).catch((e) => {
            let p_sendInvitationEmail: boolean = false, p_doNotAssignPaidLicense: boolean = false,
                p_mandatoryDefaultSubscription: boolean = false,
                p_companyId: string = undefined, p_loginEmail: string = loginEmail, p_customData: any = undefined,
                p_password: string = password,
                p_firstName: string = firstname, p_lastName: string = lastname,
                p_nickName: string = undefined, p_title: string = undefined, p_jobTitle: string = undefined,
                p_department: string = undefined,
                p_tags: Array<string> = undefined, p_emails: Array<any> = undefined,
                p_phoneNumbers: Array<any> = undefined, p_country: string = undefined,
                p_state: string = undefined, p_language: string = "en-US",
                p_timezone: string = undefined, p_accountType: string = "free", p_roles: Array<string> = ["user"],
                p_adminType: string = undefined, p_isActive: boolean = true, p_isInitialized: boolean = false,
                p_visibility: string = undefined,
                p_timeToLive: number = -1, p_authenticationType: string = undefined,
                p_authenticationExternalUid: string = undefined, p_userInfo1: string = undefined,
                p_selectedTheme: string = undefined, p_userInfo2: string = undefined, p_isAdmin: boolean = false;
            let newUser: any = await rainbowSDK.admin.createUser(p_sendInvitationEmail, p_doNotAssignPaidLicense, p_mandatoryDefaultSubscription, p_companyId, p_loginEmail, p_customData, p_password, p_firstName, p_lastName,
                p_nickName, p_title, p_jobTitle, p_department, p_tags, p_emails, p_phoneNumbers, p_country, p_state, p_language,
                p_timezone, p_accountType, p_roles, p_adminType, p_isActive, p_isInitialized, p_visibility, p_timeToLive, p_authenticationType,
                p_authenticationExternalUid, p_userInfo1, p_selectedTheme, p_userInfo2, p_isAdmin).catch((e) => {
                _logger.log("error", "MAIN - testJoinCompanyRequest - createUser Error : ", e);
            });
            await pause(10000);
            try {


                let invitation: any = await rainbowSDK.admin.inviteUserInCompany(newUser.loginEmail, newCompany.id, "en-US", "Hello !!!");
                _logger.log("debug", "MAIN - (testJoinCompanyRequest) invitation : ", invitation);

                let options1: any = {};

                Object.assign(options1, options);
                options1.credentials.login = loginEmail;
                options1.credentials.password = password;
                options1.logs.customLabel = options1.credentials.login + "_1";
                options1.logs.file.customFileName = "R-SDK-Node-" + options1.credentials.login + "_1";
                let rainbowSDK1 = new RainbowSDK(options1);
                rainbowSDK1.events.on("rainbow_onconnectionerror", () => {
                    // do something when the SDK has been started
                    _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
                });
                rainbowSDK1.events.on("rainbow_onerror", (data) => {
                    _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " should destroy and recreate the SDK.");
                    rainbowSDK1 = undefined;
                });
                rainbowSDK1.events.on("rainbow_onjoincompanyinvitereceived", (data) => {
                    _logger.log("debug", "MAIN - (rainbow_onjoincompanyinvitereceived)  - rainbow event received. data", data);
                    rainbowSDK1 = undefined;
                });


                await rainbowSDK1.start(undefined).then(async (result2) => {
                    // Do something when the SDK is started
                    _logger.log("debug", "MAIN - (testJoinCompanyRequest) rainbow SDK started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
                });

                let allInvitations: any = await rainbowSDK1.admin.getAllJoinCompanyInvitations("lastNotificationDate", undefined, "small", 100, 0, 1).catch((e) => {
                    _logger.log("error", "MAIN - testJoinCompanyRequest - getAllJoinCompanyInvitations Error : ", e);
                })
                _logger.log("debug", "MAIN - testJoinCompanyRequest - getAllJoinCompanyInvitations Result : ", allInvitations); // */

                _logger.log("debug", "MAIN - testJoinCompanyRequest - acceptJoinCompanyInvitation Result : ", await rainbowSDK1.admin.acceptJoinCompanyInvitation(allInvitations.data[0].id).catch((e) => {
                    _logger.log("error", "MAIN - testJoinCompanyRequest - acceptJoinCompanyInvitation Error : ", e);
                })); // */

            } catch (e) {

            }

            let deletedUser = await rainbowSDK.admin.deleteUser(newUser.id);
            let deletedCompany = await rainbowSDK.admin.removeCompany({id: newCompany.id});

        }

        async testregisterUserByEmailFirstStep(userInfo: {"email":string,"lang":string}) {
            let result = await rainbowSDK.admin.registerUserByEmailFirstStep(userInfo);
            _logger.log("debug", "MAIN - testregisterUserByEmailFirstStep - result : ", result);
        }

        async testregisterUserByEmailSecondStepWithToken(userLoginInfo: {"loginEmail":string,"password":string,"temporaryToken":string}) {
            let result = await rainbowSDK.admin.registerUserByEmailSecondStepWithToken(userLoginInfo);
            _logger.log("debug", "MAIN - registerUserByEmailSecondStepWithToken - result : ", result);
        }

        async testaddPropertyToObj() {

            let user: any = {};
            let companyId = "12345678";
            let loginEmail = "vincent01@vbe.test.openrainbow.net";
            let companyName = undefined;
            let phoneNumber = undefined;
            addPropertyToObj(user, "companyId", companyId, false);
            addPropertyToObj(user, "loginEmail", loginEmail, false);
            addPropertyToObj(user, "companyName", companyName, true);
            addPropertyToObj(user, "phoneNumber", phoneNumber, false);
            _logger.log("debug", "MAIN - testaddPropertyToObj - user : ", user);
        }

        async testgetAUserProfilesByUserId() {
            let Offers = await rainbowSDK.admin.getAUserProfilesByUserId(connectedUser.id);
            _logger.log("debug", "MAIN - testgetAUserProfilesByUserId - profiles : ", Offers);
            let result = await rainbowSDK.admin.getAUserProfilesByUserEmail(connectedUser.loginEmail);
            _logger.log("debug", "MAIN - testgetAUserProfilesByUserId by email - profiles : ", result);
        }

        async testgetAUserProfilesFeaturesByUserId() {
            let Offers = await rainbowSDK.admin.getAUserProfilesFeaturesByUserId(connectedUser.id);
            _logger.log("debug", "MAIN - testgetAUserProfilesFeaturesByUserId - profiles : ", Offers);
            let result = await rainbowSDK.admin.getAUserProfilesFeaturesByUserEmail(connectedUser.loginEmail);
            _logger.log("debug", "MAIN - testgetAUserProfilesFeaturesByUserId by email - profiles : ", result);
        }

        //endregion Offers

        //region Connections

        testReconnection() {
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
                        _logger.log("debug", "MAIN - testReconnection sendMessageToConversation - result : ", result);
                    });
                }, 15000);
                /* that.rainbowSDK.fileStorage.getFilesSentInConversation(conversation).then((result) => {
            that._logger.log("debug", "MAIN - testHDS getFilesSentInConversation - result : ", result);
            }); // */
            });
        }

        async testDeleteServerConversation() {
            let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let utc = new Date().toJSON().replace(/-/g, "_");
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            if (conversation && conversation.id) {
                let result = await rainbowSDK.conversations.deleteServerConversation(conversation.dbId);
                _logger.log("debug", "MAIN - testDeleteServerConversation deleteServerConversation - result : ", result);
                _logger.log("debug", "MAIN - testDeleteServerConversation deleteServerConversation - conversation : ", conversation);
            } else {
                _logger.log("debug", "MAIN - testDeleteServerConversation conversation empty or no id defined - conversation : ", conversation);
            }
        }

        async test_multireconnect() {
            for (let i = 0; i < 1000; i++) {
                /*
            rainbowSDK._core.rest.reconnect().then((result)=> {
               _logger.log("debug", "MAIN - test_multireconnect - reconnect succeed : ", result, ", for i : ", i);
            }).catch((err)=> {
               _logger.log("error", "MAIN - test_multireconnect - reconnect error : ", err, ", for i : ", i);
            });
            // */

                //await rainbowSDK._core.rest.reconnect();
                await rainbowSDK._core._eventEmitter.iee.emit("rainbow_xmppreconnected");
                _logger.log("debug", "MAIN - test_multireconnect - reconnect sent ++ : ", i);
            }
        }

        async testcheckPortalHealth() {

            rainbowSDK._core.rest.checkPortalHealth(0).then((result) => {
                _logger.log("debug", "MAIN - testcheckPortalHealth - succeed : ", result);
            }).catch((err) => {
                _logger.log("error", "MAIN - testcheckPortalHealth - error : ", err);
            });
            // */

            //await rainbowSDK._core.rest.reconnect();
            _logger.log("debug", "MAIN - testcheckPortalHealth - ");
        }

        async testgetConnectionStatus() {
            let connectionStatus: {
                restStatus: boolean,
                xmppStatus: boolean,
                s2sStatus: boolean,
                state: SDKSTATUSENUM,
                nbHttpAdded: number,
                httpQueueSize: number,
                nbRunningReq: number,
                maxSimultaneousRequests: number
            } = await rainbowSDK.getConnectionStatus();
            _logger.log("debug", "MAIN - [testgetConnectionStatus    ] :: connectionStatus : ", connectionStatus);
            let state = SDKSTATUSENUM.CONNECTED;
            _logger.log("debug", "MAIN - [testgetConnectionStatus    ] :: SDKSTATUSENUM.CONNECTED state : ", state);

        }

        //endregion Connections

        //region Alerts

        async testcreateDevice() {

            let alertDevice: AlertDevice = new AlertDevice();
            alertDevice.name = "MyNodeDevice";
            alertDevice.jid_im = rainbowSDK._core._xmpp.fullJid;
            let result = await rainbowSDK.alerts.createDevice(alertDevice);
            _logger.log("debug", "MAIN - testcreateDevice - result : ", result);
        }

        async testdeleteDevice() {
            let result: AlertDevicesData = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, null, null, null);
            _logger.log("debug", "MAIN - testdeleteDevice getDevices - result : ", result);
            let alertDevices = result.getAlertDevices().toArray();
            for (let i = 0; i < alertDevices.length; i++) {
                _logger.log("debug", "MAIN - testdeleteDevice - alertDevices[" + i + "] : ", alertDevices[i].value);
                await rainbowSDK.alerts.deleteDevice(alertDevices[i].value);
            }
        }

        async testgetDevicesList() {
            let result: AlertDevicesData = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, null, null, null);
            _logger.log("debug", "MAIN - testgetDevicesList getDevices - result : ", result);
            let alertDevices = result.getAlertDevices().toArray();
            for (let i = 0; i < alertDevices.length; i++) {
                _logger.log("debug", "MAIN - testgetDevicesList - alertDevices[" + i + "] : ", alertDevices[i].value);
            }
        }

        async testcreateFilter() {

            let filter: AlertFilter = new AlertFilter();
            filter.name = "Filter1";
            filter.tags = new List<string>();
            filter.companyId = connectedUser.companyId;
            let result = await rainbowSDK.alerts.createFilter(filter);
            _logger.log("debug", "MAIN - testcreateFilter - result : ", result);

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

        async testcreateTemplate() {

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
            _logger.log("debug", "MAIN - testcreateTemplate - result : ", result);

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

        async testdeleteDevice_createDevice() {
            // Use alertDemoWestworld@vbe.test.openrainbow.net
            let result: any = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, null, null, null);
            _logger.log("debug", "MAIN - testdeleteDevice_createDevice - result : ", result);
            let alertDevices = result.getAlertDevices().toArray();
            for (let i = 0; i < alertDevices.length; i++) {
                _logger.log("debug", "MAIN - testdeleteDevice_createDevice - alertDevices[" + i + "] : ", alertDevices[i].value);
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
            _logger.log("debug", "MAIN - testdeleteDevice_createDevice - result : ", result);

        }

        async testcreateAlert() {

            // Use vincent01@vbe.test.openrainbow.net

            let alert: Alert = new Alert();
            alert.companyId = connectedUser.companyId;
            let resultTemplates: any = await rainbowSDK.alerts.getTemplates(connectedUser.companyId, 0, 100);
            _logger.log("debug", "MAIN - testcreateAlert - resultTemplates : ", resultTemplates, " nb templates : ", resultTemplates.alertTemplates ? resultTemplates.alertTemplates.length:0);
            if (resultTemplates.alertTemplates.length > 0) {
                let template = resultTemplates.alertTemplates.elementAt(0).value;
                alert.templateId = template.id;
                let result = await rainbowSDK.alerts.createAlert(alert);
                _logger.log("debug", "MAIN - testcreateAlert - result : ", result);
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

        async testgetDevices() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result: AlertDevicesData = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, "", "", "", 0, 100);
            _logger.log("debug", "MAIN - testgetDevices - result : ", result, " nb devices : ", result ? result.total:0);
            if (result.total > 0) {
                _logger.log("debug", "MAIN - testgetDevices - devices : ", result);
                _logger.log("debug", "MAIN - testgetDevices - first device : ", await result.first());
            }
            //});
        }

        async testgetDevice() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result = await rainbowSDK.alerts.getDevices(connectedUser.companyId, connectedUser.id, "", "", "", 0, 100);
            _logger.log("debug", "MAIN - testgetDevice - result : ", result, " nb devices : ", result ? result.total:0);
            if (result.total > 0) {
                _logger.log("debug", "MAIN - testgetDevice - devices : ", result);
                let result2 = await rainbowSDK.alerts.getDevice((await result.first()).id);
                _logger.log("debug", "MAIN - testgetDevice - AlertDevice : ", result2);
            }
            //});
        }

        async testgetDevicesTags() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testgetDevicesTags. ");
            let result = await rainbowSDK.alerts.getDevicesTags(connectedUser.companyId);
            _logger.log("debug", "MAIN - testgetDevicesTags - result : ", result);
            //});
        }

        async testrenameDevicesTags() {
            let newTagName: string;
            let tag: string;
            let companyId: string = connectedUser.companyId;
            let tags = await rainbowSDK.alerts.getDevicesTags(connectedUser.companyId);
            tag = tags.tags[0]
            newTagName = "tag1_" + new Date().getTime();
            let result = await rainbowSDK.alerts.renameDevicesTags(newTagName, tag, companyId);
            _logger.log("debug", "MAIN - testrenameDevicesTags - result : ", result);
            //});
        }

        async testdeleteDevicesTags() {
            let tag: string;
            let companyId: string = connectedUser.companyId;
            let tags = await rainbowSDK.alerts.getDevicesTags(connectedUser.companyId);
            tag = tags.tags[(tags.tags.length - 1)];
            let result = await rainbowSDK.alerts.deleteDevicesTags(tag, companyId);
            _logger.log("debug", "MAIN - testdeleteDevicesTags - result : ", result);
            //});
        }

        async testgetstatsTags() {
            let companyId: string = connectedUser.companyId;
            let result = await rainbowSDK.alerts.getstatsTags(companyId);
            _logger.log("debug", "MAIN - testgetstatsTags - result : ", result);
            //});
        }

        async testgetTemplates() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result: any = await rainbowSDK.alerts.getTemplates(connectedUser.companyId, 0, 100);
            _logger.log("debug", "MAIN - testgetTemplates - result : ", result, " nb templates : ", result ? result.length:0);
            if (result.length > 0) {
                _logger.log("debug", "MAIN - testgetTemplates - filters : ", result);
            }
            //});
        }

        async testgetFilters() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result: any = await rainbowSDK.alerts.getFilters(0, 100);
            _logger.log("debug", "MAIN - testgetFilters - result : ", result, " nb filters : ", result ? result.length:0);
            if (result.length > 0) {
                _logger.log("debug", "MAIN - testgetFilters - filters : ", result);
            }
            //});
        }

        async testgetAlerts() {
            // To use with vincent01 on .NET
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            let result: any = await rainbowSDK.alerts.getAlerts();
            _logger.log("debug", "MAIN - testgetAlerts - result : ", result, " nb alerts : ", result ? result.length:0);
            if (result.length > 0) {
                _logger.log("debug", "MAIN - testgetAlerts - alerts : ", result);
            }
            //});
        }

//endregion Alerts

//region Calendar

        async testgetCalendarState() {
            // To use with vincent.berder on Official
            let result = await rainbowSDK.presence.getCalendarState();
            _logger.log("debug", "MAIN - testgetCalendarState - result : ", result);
        }

        async testgetCalendarStates() {
            // To use with vincent.berder on Official
            let contacts = rainbowSDK.contacts.getAll();
            _logger.log("debug", "MAIN - testgetCalendarStates - contacts : ", contacts);
            let contactsIdentifier = contacts.map(elt => elt.loginEmail);
            //let contactsIdentifier = contacts.map(elt => elt.id ) ;
            _logger.log("debug", "MAIN - testgetCalendarStates - contactsIdentifier : ", contactsIdentifier);
            /*let usersIds = [];
        usersIds.push(contactsIdentifier[0]);
        usersIds.push(contactsIdentifier[1]);
        usersIds.push(contactsIdentifier[2]);
        let result = await rainbowSDK.presence.getCalendarStates(usersIds);
        // */
            let result = await rainbowSDK.presence.getCalendarStates(contactsIdentifier);
            _logger.log("debug", "MAIN - testgetCalendarStates - result : ", result);
        }

        async testgetCalendarAutomaticReplyStatus() {
            // To use with vincent.berder on Official
            let result = await rainbowSDK.presence.getCalendarAutomaticReplyStatus();
            _logger.log("debug", "MAIN - testgetCalendarAutomaticReplyStatus - result : ", result);

            let contacts = rainbowSDK.contacts.getAll();
            _logger.log("debug", "MAIN - testgetCalendarAutomaticReplyStatus - contacts : ", contacts);

            let result2 = await rainbowSDK.presence.getCalendarAutomaticReplyStatus(contacts[0].id);
            _logger.log("debug", "MAIN - testgetCalendarAutomaticReplyStatus - contact : ", contacts[0], ", result2 : ", result2);
        }

        async testenableDisableCalendar() {
            // To use with vincent.berder on Official
            /*  let result = await rainbowSDK.presence.disableCalendar();
         _logger.log("debug", "MAIN - testenableDisableCalendar - result : ", result);

          let result2 = await rainbowSDK.presence.enableCalendar();
         _logger.log("debug", "MAIN - testenableDisableCalendar - result2 : ", result2);
          // */
        }

        //endregion

        //region Country

        async testgetListOfCountries() {
            try {
                let result = await rainbowSDK.admin.getListOfCountries();
                _logger.log("debug", "MAIN - testgetListOfCountries - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testgetListOfCountries - error : ", e);
            }
        }

        //endregion Country

        //region Bubble - dialIn

        async testdialIn() {
            // To be used with vincent00 on .Net
            try {

                _logger.log("debug", "MAIN - testdialIn - getAll bubbles : ", rainbowSDK.bubbles.getAll());

                let bubbles = rainbowSDK.bubbles.getAllOwnedBubbles();
                _logger.log("debug", "MAIN - testdialIn - getAllOwnedBubbles bubble : ", bubbles);
                let bubble = bubbles.find(element => element.name==="bulle1")
                _logger.log("debug", "MAIN - testdialIn -  bubble \"bulle1\" : ", bubble);
                if (bubble) {
                    let bubbleId = bubble.id;


                    let result1 = await rainbowSDK.bubbles.enableDialInForABubble(bubbleId);
                    _logger.log("debug", "MAIN - testdialIn - enableDialInForABubble result1 : ", result1);

                    let result = await rainbowSDK.bubbles.disableDialInForABubble(bubbleId);
                    _logger.log("debug", "MAIN - testdialIn - disableDialInForABubble result : ", result);

                    let result4 = await rainbowSDK.bubbles.enableDialInForABubble(bubbleId);
                    _logger.log("debug", "MAIN - testdialIn - enableDialInForABubble result4 : ", result4);

                    let result2 = await rainbowSDK.bubbles.resetDialInCodeForABubble(bubbleId);
                    _logger.log("debug", "MAIN - testdialIn - resetDialInCodeForABubble result2 : ", result2);
                }
            } catch (e) {
                _logger.log("error", "MAIN - testdialIn - error : ", e);
            }
        }

        async testgetDialInPhoneNumbersList() {
            // To be used with vincent00 on .Net
            try {

                let shortList = true;
                //logger.log("debug", "MAIN - testgetDialInPhoneNumbersList - getAll bubbles : ", rainbowSDK.bubbles.getAll());

                let result = rainbowSDK.bubbles.getDialInPhoneNumbersList(shortList);
                _logger.log("debug", "MAIN - testgetDialInPhoneNumbersList - result : ", result);
            } catch (e) {
            }
        }

        //endregion Bubble - dialIn

        //region MS Teams

        async testcontrolMsteamsPresenceDisable() {
            try {
                let disable: boolean = false;
                let ignore: string = "true";

                let result = await rainbowSDK.presence.controlMsteamsPresence(disable, ignore);
                _logger.log("debug", "MAIN - testcontrolMsteamsPresence - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testcontrolMsteamsPresence - error : ", e);
            }
        }

        async testcontrolMsteamsPresenceEnable() {
            try {
                let disable: boolean = true;
                let ignore: string = "true";

                let result = await rainbowSDK.presence.controlMsteamsPresence(disable, ignore);
                _logger.log("debug", "MAIN - testcontrolMsteamsPresence - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testcontrolMsteamsPresence - error : ", e);
            }
        }

        async testgetMsteamsPresenceState() {
            try {
                let result = await rainbowSDK.presence.getMsteamsPresenceState();
                _logger.log("debug", "MAIN - testgetMsteamsPresenceState - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testgetMsteamsPresenceState - error : ", e);
            }
        }

        async testgetMsteamsPresenceStates() {
            try {
                let result = await rainbowSDK.presence.getMsteamsPresenceStates();
                _logger.log("debug", "MAIN - testgetMsteamsPresenceStates - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testgetMsteamsPresenceStates - error : ", e);
            }
        }

        async testunregisterMsteamsPresenceSharing() {
            try {
                let result = await rainbowSDK.presence.unregisterMsteamsPresenceSharing();
                _logger.log("debug", "MAIN - testunregisterMsteamsPresenceSharing - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testunregisterMsteamsPresenceSharing - error : ", e);
            }
        }

        async testactivateMsteamsPresence() {
            try {
                let result = await rainbowSDK.presence.activateMsteamsPresence();
                _logger.log("debug", "MAIN - testactivateMsteamsPresence - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testactivateMsteamsPresence - error : ", e);
            }
        }

        async testdeactivateMsteamsPresence() {
            try {
                let result = await rainbowSDK.presence.deactivateMsteamsPresence();
                _logger.log("debug", "MAIN - testdeactivateMsteamsPresence - result : ", result);
            } catch (e) {
                _logger.log("error", "MAIN - testdeactivateMsteamsPresence - error : ", e);
            }
        }

        //endregion MS Teams

        //region Rainbow Voice

        async testgetCloudPbxById() {
            // To use with
            let systemId = "5cf7dd229fb99523e4de0ea9";
            let result = await rainbowSDK.admin.getCloudPbxById(systemId);
            _logger.log("debug", "MAIN - testgetCloudPbxById - result : ", result);
        }

        async testgetCloudPbxs() {
            // To use with
            let result = await rainbowSDK.admin.getCloudPbxs(100, 0, "companyId", 1, connectedUser.companyId, null);
            _logger.log("debug", "MAIN - testgetCloudPbxs - result : ", result);
        }

        async testmakeCall3PCC() {
            // to use with user851@pqa.test.openrainbow.net
            /* Data sent by Web UI : {
        "deviceId":"9990130000168511",
        "calleeExtNumber":"",
        "calleeShortNumber":"840",
        "calleePbxId":"PBX1117-d1e8-9eac-4a8d-8b87-6593-1f26-c528",
        "callerAutoAnswer":true
        }
         */

            let contactEmailToSearch = "dom1@pqa.test.openrainbow.net";
            let contactDom1 = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);

            let userDevices: any = await rainbowSDK.rbvoice.getUserDevices();

            let sipDeviceId = "";

            for (let i = 0; userDevices && i < userDevices.length; i++) {
                if (userDevices[i].type=="sip") {
                    sipDeviceId = userDevices[i].deviceId;
                }
            }

            let callData: any = {
                deviceId: sipDeviceId,
                callerAutoAnswer: true,
                anonymous: false,
                calleeExtNumber: "",
                calleePbxId: contactDom1.phoneNumbers[0].pbxId,
                calleeShortNumber: contactDom1.phoneNumbers[0].shortNumber,
                calleeCountry: contactDom1.phoneNumbers[0].country,
                //dialPadCalleeNumber: string
            };
            _logger.log("debug", "MAIN - testmakeCall3PCC - callData : ", callData);
            let result = await rainbowSDK.rbvoice.makeCall3PCC(callData);
            _logger.log("debug", "MAIN - testmakeCall3PCC - result : ", result);
        }

        //endregion

        //region Company

        //region Company From enduser

        async testgetAllCompaniesVisibleByUser() {
            _logger.log("debug", "MAIN - testgetAllCompaniesVisibleByUser. ");
            let allCompanies: any = await rainbowSDK.admin.getAllCompaniesVisibleByUser();
            _logger.log("debug", "MAIN - testgetAllCompaniesVisibleByUser - allCompanies : ", allCompanies.length);
        }

        async testgetCompanyAdministrators() {
            _logger.log("debug", "MAIN - testgetCompanyAdministrators. ");
            let allCompanies: any = await rainbowSDK.admin.getCompanyAdministrators();
            _logger.log("debug", "MAIN - testgetCompanyAdministrators - allCompanies : ", allCompanies.length);
        }

        //endregion Company From enduser

        //region compagnies

        async testcreateRainbowMultifactorAuthenticationServerConfiguration() {
           // let results: any = await rainbowSDK.admin.createRainbowMultifactorAuthenticationServerConfiguration();
            //_logger.log("debug", "MAIN - testcreateRainbowMultifactorAuthenticationServerConfiguration - results : ", results);
        }

        async testgetAllRainbowMultifactorConfiguration () {
            try {
                let results: any = await rainbowSDK.admin.getAllRainbowMultifactorConfiguration(undefined, "small");
                _logger.log("debug", "MAIN - testgetAllRainbowMultifactorConfiguration - results : ", results);
            } catch (err) {
                _logger.log("debug", "MAIN - testgetAllRainbowMultifactorConfiguration - CATCH Error !!! error : ", err);
            }
        }

        //endregion compagnies

        async testgetAllCompanies() {
            // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
            _logger.log("debug", "MAIN - testgetAllCompanies. ");
            let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
            _logger.log("debug", "MAIN - testgetAllCompanies - allCompanies : ", allCompanies.length);
            /*let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
               _logger.log("debug", "MAIN - testgetAllCompanies vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
       _logger.log("debug", "MAIN - testgetAllCompanies - companyId : ", companyId);

        let result = await rainbowSDK.admin.testgetAllCompanies(companyId, "csv", true);
       _logger.log("debug", "MAIN - testgetAllCompanies - result : ", result);
        // */

        }

        async testgetAllCompaniesWithFilters() {
            // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
            _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters. ");
            let format: string = "small";
            let sortField: string = "name";
            let bpId: string = undefined;
            let catalogId: string = undefined;
            let offerId: string = undefined;
            let offerCanBeSold: boolean = undefined;
            let externalReference: string = undefined;
            let externalReference2: string = undefined;
            let salesforceAccountId: string = undefined;
            let selectedAppCustomisationTemplate: string = undefined
            let selectedThemeObj: boolean = undefined;
            let offerGroupName: string = undefined;
            let limit: number = 100;
            let offset: number = 0;
            let sortOrder: number = 1;
            let name: string = "westworld";
            let status: string = undefined;
            let visibility: string = undefined;
            let organisationId: string = undefined
            let isBP: boolean = undefined;
            let hasBP: boolean = undefined;
            let bpType: string = undefined;

            let allCompanies: any = await rainbowSDK.admin.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType);
            _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - allCompanies : ", allCompanies.length);

            /*let companyId = connectedUser.companyId;
        for (let company of allCompanies.data) {
            //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
            if (company.name==="vbeCompanie") {
               _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters vbeCompanie found : ", company);
                companyId = company.id;
            }
        }
       _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - companyId : ", companyId);

        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
       _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - result : ", result);
        // */

        }

        async testgetCompanyById() {
            let myCompanyId = connectedUser.companyId;
            let companyInfo = await rainbowSDK.admin.getCompanyById(myCompanyId)

            _logger.log("debug", "MAIN - testgetCompanyById - companyInfo : ", companyInfo);
        }

        async testCreateCompanyAndRemoveCompany() {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "MyVberderCompany_" + utc;
            let newCompany = await (rainbowSDK.admin.createCompany(companyName, "USA", "AA", OFFERTYPES.PREMIUM).catch((e) => {
                _logger.log("error", "MAIN - (testCreateCompanyAndRemoveCompany) - createCompany Error : ", e);
            }));
            await pause(2000);

            let deletedCompany = await rainbowSDK.admin.removeCompany({id: newCompany.id});
            _logger.log("debug", "MAIN - (testCreateCompanyAndRemoveCompany) deletedCompany : ", deletedCompany);
        }

        async testupdateCompany() {
            // to be used with rford@westworld.com on .Net.
            _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters. ");
            let format: string = "small";
            let sortField: string = "name";
            let bpId: string = undefined;
            let catalogId: string = undefined;
            let offerId: string = undefined;
            let offerCanBeSold: boolean = undefined;
            let externalReference: string = undefined;
            let externalReference2: string = undefined;
            let salesforceAccountId: string = undefined;
            let selectedAppCustomisationTemplate: string = undefined
            let selectedThemeObj: boolean = undefined;
            let offerGroupName: string = undefined;
            let limit: number = 100;
            let offset: number = 0;
            let sortOrder: number = 1;
            let name: string = "MyVberderCompany_updated";
            let status: string = undefined;
            let visibility: string = undefined;
            let organisationId: string = undefined
            let isBP: boolean = undefined;
            let hasBP: boolean = undefined;
            let bpType: string = undefined;

            let allCompanies: any = await rainbowSDK.admin.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType);
            _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - allCompanies.total : ", allCompanies.total);

            //let companyId = connectedUser.companyId;
            for (let company of allCompanies.data) {
                //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
                if (company.name===name) {
                   _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters company ", name, " found : ", company);
                    let companyId = company.id;
                    let companyInfo: any = await rainbowSDK.admin.getCompanyById(companyId);
                    _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - before update companyInfo : ", companyInfo);

                    /*
                    companyInfo :  {
                        selectedTheme: null,
                            localPublicSafetyAnsweringPoint: { userLocationReminderTimer: 360, globalUserRight: false },
                        names: [ 'myvberdercompany_2023_10_11t12:51:53758z' ],
                            offerType: 'freemium',
                            organisationId: '5c40a2d447ed8d89832292ff',
                            catalogId: '5fb32098514d23221012cfb5',
                            isBP: false,
                            bpBusinessType: [],
                            bpId: null,
                            disableCCareAdminAccess: false,
                            size: 'self-employed',
                            status: 'active',
                            visibility: 'organization',
                            visibleBy: [],
                            forceHandshake: false,
                            autoAcceptUserInvitations: true,
                            userSelfRegisterEnabled: true,
                            userSelfRegisterAllowedDomains: [],
                            lastAvatarUpdateDate: null,
                            lastBannerUpdateDate: null,
                            office365ScopesGranted: [],
                            avatarShape: 'circle',
                            adminCanSetCustomData: false,
                            isCentrex: false,
                            allowUsersSelectTheme: true,
                            allowUsersSelectPublicTheme: true,
                            selectedAppCustomisationTemplate: '5f43d61db7b6d40988a73e7c',
                            cloudPbxRecordingInboundOnly: true,
                            cloudPbxVoicemailToEmail: 'none',
                            mobilePermanentConnectionMode: false,
                            fileSharingCustomisation: 'enabled',
                            userTitleNameCustomisation: 'enabled',
                            softphoneOnlyCustomisation: 'disabled',
                            useRoomCustomisation: 'enabled',
                            phoneMeetingCustomisation: 'enabled',
                            useChannelCustomisation: 'enabled',
                            useScreenSharingCustomisation: 'enabled',
                            useWebRTCVideoCustomisation: 'enabled',
                            useWebRTCAudioCustomisation: 'enabled',
                            useWebRTCOnlyIfMobileLoggedCustomisation: 'disabled',
                            instantMessagesCustomisation: 'enabled',
                            userProfileCustomisation: 'enabled',
                            fileStorageCustomisation: 'enabled',
                            overridePresenceCustomisation: 'enabled',
                            changeTelephonyCustomisation: 'enabled',
                            changeSettingsCustomisation: 'enabled',
                            recordingConversationCustomisation: 'enabled',
                            useGifCustomisation: 'enabled',
                            useDialOutCustomisation: 'enabled',
                            fileCopyCustomisation: 'enabled',
                            fileTransferCustomisation: 'enabled',
                            forbidFileOwnerChangeCustomisation: 'enabled',
                            readReceiptsCustomisation: 'enabled',
                            useSpeakingTimeStatistics: 'enabled',
                            allowDeviceFirmwareSelection: false,
                            eLearningCustomisation: 'enabled',
                            eLearningGamificationCustomisation: 'enabled',
                            meetingRecordingCustomisation: 'enabled',
                            alertNotificationReception: 'disabled',
                            alertNotificationSending: 'disabled',
                            selectedDeviceFirmware: 'released',
                            defaultOptionsGroups: [],
                            sendPrepaidSubscriptionsNotification: true,
                            ddiReadOnly: false,
                            allowPhoneNumbersVisibility: false,
                            isMonitorable: false,
                            csEmailList: [],
                            seEmailList: [],
                            csmEmailList: [],
                            kamEmailList: [],
                            supervisionGroupMaxSize: 1500,
                            supervisionGroupMaxNumber: 5,
                            supervisionGroupMaxUsers: 30,
                            allowTeamsToDesktopSso: true,
                            useExternalStorage: 'disabled',
                            useRainbowStorage: 'enabled',
                            externalStorageAllowedAllUsers: false,
                            rainbowStorageAllowedAllUsers: true,
                            mainStorage: 'Rainbow Storage',
                            name: 'MyVberderCompany_updated',
                            state: 'AA',
                            country: 'USA',
                            statusUpdatedDate: '2023-10-11T12:51:59.689Z',
                            creationDate: '2023-10-11T12:51:59.689Z',
                            useComputerMode: 'enabled',
                            useOtherPhoneMode: 'enabled',
                            canCallParticipantPbxNumberCustomisation: 'enabled',
                            imPopupDuration: 3,
                            useSoftPhoneMode: 'enabled',
                            canAccessFaqCustomisation: 'enabled',
                            canAccessHelpCenterCustomisation: 'enabled',
                            canAccessStoreCustomisation: 'enabled',
                            canAccessWhatsNew: 'enabled',
                            canDownloadAppCustomisation: 'enabled',
                            endOfConferenceBehavior: { behavior: 'rainbow' },
                        canSetInvisiblePresenceCustomisation: 'enabled',
                            teamsPresenceOnRainbowBusyPhone: 'Busy',
                            canUseSendReportCustomisation: 'enabled',
                            canUseTaskCustomisation: 'enabled',
                            canUseTestConfigCustomisation: 'enabled',
                            useTeamsMode: 'disabled',
                            id: '65269a6fb06ddfd882b9c09f',
                            numberUsers: 0,
                            dataLocation: { name: 'North-America', location: 'Canada', country: 'CAN' }
                    } // */

                    let data : any = {"name": companyInfo.name, "autoAcceptUserInvitations" : false}; // !!! autoAcceptUserInvitations need superAdmin role.

                    _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - data : ", data);

                    let companyUpdatedResult : any = await rainbowSDK.admin.updateCompanyByObj(companyId, true, data);
                    _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - companyUpdatedResult : ", companyUpdatedResult);

                    companyInfo = await rainbowSDK.admin.getCompanyById(companyId);
                    _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - after update companyInfo : ", companyInfo);

                }
            }
       //_logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - companyId : ", companyId);

            /*
        let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
       _logger.log("debug", "MAIN - testgetAllCompaniesWithFilters - result : ", result);
        // */

        }

        //endregion Company

        //region Company Clean Afterbuild

        async testCompanyCleanAfterbuild( deleteUsers : boolean = false, deleteCompanies : boolean =false) {
            // To use with rford@westworld.com

            let utc = new Date().toJSON().replace(/-/g, '_');
            let companyName = "MyVberderCompany_" + utc;
            let format: string = "small";
            let sortField: string = "name";
            let bpId: string = undefined;
            let catalogId: string = undefined;
            let offerId: string = undefined;
            let offerCanBeSold: boolean = undefined;
            let externalReference: string = undefined;
            let externalReference2: string = undefined;
            let salesforceAccountId: string = undefined;
            let selectedAppCustomisationTemplate: string = undefined
            let selectedThemeObj: boolean = undefined;
            let offerGroupName: string = undefined;
            let limit: number = 500;
            let offset: number = 0;
            let sortOrder: number = 1;
            //let name: string = "Westworld_Guest_1583336606191";
           // let name: string = "Westworld_Guest_";
            let names: Array<string> = ["Westworld_Guest_", "Westworld_Host_","Westworld Guest_", "Westworld Host_", "Afterbuild_NodeSDK_Westworld_", "Westworld Test SDK ("];
            //let names: Array<string> = ["Westworld_Host_1611262600870"];
            let status: string = undefined;
            let visibility: string = undefined;
            let organisationId: string = undefined
            let isBP: boolean = undefined;
            let hasBP: boolean = undefined;
            let bpType: string = undefined;

            for (let name of names) {
                _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - name : ", name);
                let allCompaniesResult: any = await rainbowSDK.admin.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType);
                let allCompanies: Array<any> = allCompaniesResult.data;
                _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - allCompanies : ", allCompanies.length);
                await pause(2000);

                for (let i = 0; i < allCompanies.length; i++) {
                    let companie = allCompanies[i];
                    /*
    {
      "settings": {
        "singleSignOn": [],
        "rainbowMfaPolicies": [],
        "fileStorage": {}
      },
      "name": "Westworld_Guest_1583336606191",
      "id": "5e5fccadfe3b6715b0f098f1"
    }
    // */
                    _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - Companie : ", companie);


                    let allSubscriptionsOfCompany: any = await rainbowSDK.admin.retrieveAllSubscriptionsOfCompanyById( companie.id).catch(err => {
                        _logger.log("error", "MAIN - testCompanyCleanAfterbuild - retrieveAllSubscriptionsOfCompanyById() err : ", err);
                    });
                    for (let j = 0; j < allSubscriptionsOfCompany.length; j++) {
                        let subscriptionOfCompany = allSubscriptionsOfCompany[j];
                        _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - subscriptionOfCompany : ", subscriptionOfCompany);

                        await rainbowSDK.admin.unSubscribeCompanyToSubscription(subscriptionOfCompany.id, companie.id).catch(err => {
                            _logger.log("error", "MAIN - testCompanyCleanAfterbuild - unSubscribeCompanyToSubscription() err : ", err);
                        });
                    }
// */
                    let format: string = "small", name: string = undefined, canBeSold: boolean = undefined, autoSubscribe: boolean = undefined, isExclusive: boolean = undefined, isPrepaid: boolean = undefined, profileId: boolean = undefined, offerReference: boolean = undefined, sapReference: boolean = undefined, limit: number = 1000, offset: number = 0, sortField: string = "name", sortOrder: number = 1;
                    let Offers = await rainbowSDK.admin.retrieveAllOffersOfCompanyById(companie.id, format, name, canBeSold, autoSubscribe, isExclusive, isPrepaid, profileId, offerReference, sapReference, limit, offset, sortField, sortOrder  );
                    _logger.log("debug", "(testCompanyCleanAfterbuild) - Offers : ", Offers);
                    for (let offer of Offers) {
                        _logger.log("debug", "(testCompanyCleanAfterbuild) offer : ", offer);
                        await rainbowSDK.admin.unSubscribeCompanyToOfferById(offer.id, companie.id).catch(err => {
                            _logger.log("error", "MAIN - testCompanyCleanAfterbuild - unSubscribeCompanyToOfferById() err : ", err);
                        });
                    }


                    if (deleteUsers) {
                        let allUsersCompany: any = await rainbowSDK.admin.getAllUsersByCompanyId("small", 0, 100, undefined, companie.id).catch(err => {
                            _logger.log("error", "MAIN - testCompanyCleanAfterbuild - getAllUsersByCompanyId() err : ", err);
                        });

                        for (let j = 0; j < allUsersCompany.length; j++) {
                            let usersCompany = allUsersCompany[j];
                            _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - usersCompany : ", usersCompany);

                            let userDeleted = await rainbowSDK.admin.deleteUser(usersCompany.id).catch(err => {
                                _logger.log("error", "MAIN - testCompanyCleanAfterbuild - deleteUser() err : ", err);
                            });
                            _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - userDeleted : ", userDeleted);
                        }
                    }

                    if (deleteCompanies) {
                        let deletedCompany = await rainbowSDK.admin.removeCompany({"id": companie.id}).catch(err => {
                            _logger.log("error", "MAIN - testCompanyCleanAfterbuild - removeCompany() err : ", err);
                        });
                        _logger.log("debug", "MAIN - testCompanyCleanAfterbuild - deletedCompany : ", deletedCompany);
                    }
                }
            }
        }

        //endregion Company Clean Afterbuild

        //region Custom Templates

        async testgetCompanyServiceDescriptionFile() {
            let myCompanyId = connectedUser.companyId;
            let result = await rainbowSDK.admin.getCompanyServiceDescriptionFile(myCompanyId)

            _logger.log("debug", "MAIN - getCompanyServiceDescriptionFile - result : ", result);
        }

        //endregion Custom Templates

        //region Custom Templates

        async testapplyCustomisationTemplates() {
            let myCompanyId = connectedUser.companyId;
            let contactEmailToSearch = "vincent00@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);

            //let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", myCompanyId, contact.id);
            //let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", contact.companyId, undefined);
            let result: any = await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", myCompanyId, undefined);
            // let result : any= await rainbowSDK.admin.applyCustomisationTemplates("MyTemplateVBE2", undefined, contact.id);
            _logger.log("debug", "MAIN - testapplyCustomisationTemplates - result : ", result);
        }

        async testcreateCustomisationTemplate() {
//      let visibleBy: [],
            let instantMessagesCustomisation = 'enabled';
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

            let result: any = await rainbowSDK.admin.createCustomisationTemplate(name, myCompanyId, undefined, instantMessagesCustomisation, useGifCustomisation,
                fileSharingCustomisation, fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation, useRoomCustomisation,
                useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation, overridePresenceCustomisation,
                userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation,
                fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics);
            _logger.log("debug", "MAIN - testcreateCustomisationTemplate - result : ", result);
        }

        async testdeleteCustomisationTemplate() {
            let that = this;
            await that.testgetCompanyById();
            let myCompanyId = connectedUser.companyId;
            let result: any = await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
            _logger.log("debug", "MAIN - testdeleteCustomisationTemplate - getAllAvailableCustomisationTemplates result : ", result);

            for (const template of result.data) {
                _logger.log("debug", "MAIN - testdeleteCustomisationTemplate - template : ", template);
                let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
                _logger.log("debug", "MAIN - testdeleteCustomisationTemplate - getRequestedCustomisationTemplate templateInfo : ", templateInfo);
                if (template.name=="MyTemplateVBE2") {
                    let result2: any = await rainbowSDK.admin.deleteCustomisationTemplate(template.id);
                    _logger.log("debug", "MAIN - testdeleteCustomisationTemplate - delete result2 : ", result2);
                }
            }
        }

        async testgetAllAvailableCustomisationTemplates() {
            let that = this;
            await that.testgetCompanyById();
            let myCompanyId = connectedUser.companyId;
            let result: any = await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
            _logger.log("debug", "MAIN - testgetAllAvailableCustomisationTemplates - result : ", result);

            for (const template of result.data) {
                _logger.log("debug", "MAIN - testgetAllAvailableCustomisationTemplates - template : ", template);
                let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
                _logger.log("debug", "MAIN - testgetAllAvailableCustomisationTemplates - templateInfo : ", templateInfo);
            }
        }

        async testgetRequestedCustomisationTemplate() {
            let that = this;
            await that.testgetCompanyById();
            let myCompanyId = connectedUser.companyId;
            let result: any = await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
            _logger.log("debug", "MAIN - testgetRequestedCustomisationTemplate - result : ", result);

            for (const template of result.data) {
                if (template.name=="MyTemplateVBE2") {
                    _logger.log("debug", "MAIN - testgetRequestedCustomisationTemplate - template : ", template);
                    let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
                    _logger.log("debug", "MAIN - testgetRequestedCustomisationTemplate - templateInfo : ", templateInfo);
                }
            }
        }

        async testupdateCustomisationTemplate() {
            let that = this;
            await that.testgetCompanyById();
            let myCompanyId = connectedUser.companyId;
            let result: any = await rainbowSDK.admin.getAllAvailableCustomisationTemplates(myCompanyId);
            _logger.log("debug", "MAIN - testupdateCustomisationTemplate - getAllAvailableCustomisationTemplates result : ", result);

            for (const template of result.data) {
                _logger.log("debug", "MAIN - testupdateCustomisationTemplate - template : ", template);
                //let templateInfo = rainbowSDK.admin.getRequestedCustomisationTemplate(template.id);
                //logger.log("debug", "MAIN - testupdateCustomisationTemplate - getRequestedCustomisationTemplate templateInfo : ", templateInfo);
                if (template.name=="MyTemplateVBE2") {
                    let instantMessagesCustomisation = 'enabled';
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

                    let result2: any = await rainbowSDK.admin.updateCustomisationTemplate(template.id, name, undefined, instantMessagesCustomisation, useGifCustomisation,
                        fileSharingCustomisation, fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation, useRoomCustomisation,
                        useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation, overridePresenceCustomisation,
                        userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation,
                        fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics);
                    _logger.log("debug", "MAIN - testupdateCustomisationTemplate - updateCustomisationTemplate result2 : ", result2);
                }
            }
        }

        //endregion Custom Templates

        //region Directory

        async testcreateDirectoryEntry() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testcreateDirectoryEntry. ");
            let utc = new Date().toJSON().replace(/-/g, "_");
            let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

            _logger.log("debug", "MAIN - testcreateDirectoryEntry. utcEmail : ", utcEmail);

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
            _logger.log("debug", "MAIN - testcreateDirectoryEntry - result : ", result);

            // */
            //});
        }

        async testexportDirectoryCsvFile() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testexportDirectoryCsvFile. ");
            let companyId = connectedUser.companyId;
            let result = await rainbowSDK.admin.exportDirectoryCsvFile(companyId, "c:\\temp\\");
            _logger.log("debug", "MAIN - testexportDirectoryCsvFile - result : ", result);
        }

        async testImportDirectoryCsvFile() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testImportDirectoryCsvFile. ");
            let companyId = connectedUser.companyId;
            let result = await rainbowSDK.admin.ImportDirectoryCsvFile(companyId, "c:\\temp\\dirToImport.csv", "label1");
            _logger.log("debug", "MAIN - testImportDirectoryCsvFile - result : ", result);
        }

        testgetCSVTemplate() {
            // to use with bp-admin@pqa.test.openrainbow.net user on NET platform.
            rainbowSDK.admin.getCSVTemplate("5f75a07c1db9464d67e3245e", "user", "test").then((res) => {
                if (res) {
                    _logger.log("debug", "MAIN - [testgetCSVTemplate    ] :: res : ", res);
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetCSVTemplate    ] :: error : ", err);
            });
        }

        testgetListDirectoryEntriesData() {
            let emailToSearch = "Bouvet@vbe.test.openrainbow.net";
            let companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate,
                tags, format, limit, offset, sortField, sortOrder, view = undefined;

            search = "Bouvet";
            //search = emailToSearch;
            type = "user";
            //search = emailToSearch;

            rainbowSDK.admin.getListDirectoryEntriesData(companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view).then((res: any) => {
                if (res) {
                    _logger.log("debug", "MAIN - [testgetListDirectoryEntriesData    ] :: res : ", res);
                    if (res.data) {
                        for (let i = 0; i < res.data.length; i++) {
                            _logger.log("debug", "MAIN - [testgetListDirectoryEntriesData    ] :: res[", i, "] : ", res.data[i]);
                        }
                    }
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetListDirectoryEntriesData    ] :: error : ", err);
            });
        }

        testgetDirectoryEntryData() {
            let emailToSearch = "Bouvet@vbe.test.openrainbow.net";
            let companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate,
                tags, format, limit, offset, sortField, sortOrder, view = undefined;

            search = "Bouvet";
            //search = emailToSearch;
            type = "user";
            //search = emailToSearch;

            format = "full";

            rainbowSDK.admin.getListDirectoryEntriesData(companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view).then((res: any) => {
                if (res) {
                    _logger.log("debug", "MAIN - [testgetDirectoryEntryData    ] :: res : ", res);
                    if (res.data) {
                        for (let i = 0; i < res.data.length; i++) {
                            _logger.log("debug", "MAIN - [testgetDirectoryEntryData    ] :: res[", i, "] : ", res.data[i]);
                            if (res.data[i].companyName=="compa") {
                                rainbowSDK.admin.getDirectoryEntryData(res.data[i].id, "full").then((result) => {
                                    _logger.log("debug", "MAIN - [testgetDirectoryEntryData    ] :: res[", i, "] : ", res.data[i], ", result : ", result);
                                });
                            }
                        }
                    }
                }
            }).catch((err) => {
                _logger.log("error", "MAIN - [testgetListDirectoryEntriesData    ] :: error : ", err);
            });
        }

        //endregion Directory

        //region Personal Directory

        async testcreatePersonalDirectoryEntry() {
            //let result = that.rainbowSDK.bubbles.getAllOwnedBubbles();
            _logger.log("debug", "MAIN - testcreatePersonalDirectoryEntry. ");
            let utc = new Date().toJSON().replace(/-/g, "_");
            let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

            _logger.log("debug", "MAIN - testcreatePersonalDirectoryEntry. utcEmail : ", utcEmail);

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
            let result = await rainbowSDK.contacts.createPersonalDirectoryEntry(firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2);
            _logger.log("debug", "MAIN - testcreatePersonalDirectoryEntry - result : ", result);

            // */
            //});
        }

        async testgetListPersonalDirectoryEntriesData() {
            let result = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            _logger.log("debug", "MAIN - getListPersonalDirectoryEntriesData - result : ", result);
        }

        async testupdatePersonalDirectoryEntry() {
            let personalDirectoryList: any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            _logger.log("debug", "MAIN - testupdatePersonalDirectoryEntry - personalDirectoryList : ", personalDirectoryList);
            if (personalDirectoryList && personalDirectoryList.data && personalDirectoryList.total > 0) {
                let result = await rainbowSDK.contacts.updatePersonalDirectoryEntry(personalDirectoryList.data[0].id, personalDirectoryList.data[0].firstName + "_updated");
                _logger.log("debug", "MAIN - testupdatePersonalDirectoryEntry - updatePersonalDirectoryEntry result : ", result);
                let personalDirectoryListUpdated: any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                _logger.log("debug", "MAIN - testupdatePersonalDirectoryEntry - personalDirectoryListUpdated : ", personalDirectoryListUpdated);
            }
        }

        async testdeletePersonalDirectoryEntry() {
            _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry. ");
            let utc = new Date().toJSON().replace(/-/g, "_");
            let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

            _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry. utcEmail : ", utcEmail);

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
            let result = await rainbowSDK.contacts.createPersonalDirectoryEntry(firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2);
            _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - createPersonalDirectoryEntry result : ", result);

            let personalDirectoryList: any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryList : ", personalDirectoryList);
            if (personalDirectoryList && personalDirectoryList.data && personalDirectoryList.data.total > 0) {
                let result = await rainbowSDK.contacts.deletePersonalDirectoryEntry(personalDirectoryList.data[0].id);
                _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - deletePersonalDirectoryEntry result : ", result);
                let personalDirectoryListUpdated: any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryListUpdated : ", personalDirectoryListUpdated);
            }
        }

        //endregion Personal Directory

        //region ldap

        // testmockStanza("<message type=\"management\" id=\"c07a1b5b-90b1-4d1f-a120-55f5bea4abaa_0\" to=\"fee2a3041f2f499e96ad493d14e3d304@openrainbow.com/web_win_1.67.2_P0EnyMvN\" xmlns=\"jabber:client\"><logs action=\"request\" xmlns='jabber:iq:configuration' contextid=\"5a1c2848bf33d1379ac5592f\"/></message>")
        async testmockStanza(stanza: string = "<message type=\"management\" id=\"c07a1b5b-90b1-4d1f-a120-55f5bea4abaa_0\" to=\"fee2a3041f2f499e96ad493d14e3d304@openrainbow.com/web_win_1.67.2_P0EnyMvN\" xmlns=\"jabber:client\"><logs action=\"request\" xmlns='jabber:iq:configuration' contextid=\"5a1c2848bf33d1379ac5592f\"/></message>") {
            rainbowSDK._core._xmpp.mockStanza(stanza);
        }

        async testmockStanzaBubbleResume() {
            let stanza: string = "<presence xmlns='jabber:client' to='37dc2adbdf3c456e99ccc639742f177c@openrainbow.net/node_vnagw' from='room_c6afe2d3d1e24cf19d532f90bd46a32d@muc.openrainbow.net'><x  xmlns='http://jabber.org/protocol/muc#user'><item><reason>Room resumed</reason></item><status code='339'/><status code='110'/></x></presence>"
            await this.testmockStanza(stanza);
        }

        async testmockStanzaBubbleStatus110() {
            let stanza: string = "<presence xmlns=\"jabber:client\" xml:lang=\"en\" to=\"37dc2adbdf3c456e99ccc639742f177c@openrainbow.net/node_vnagw\" from=\"room_b6e356567da848b8bf25814b9ba9e09d@muc.openrainbow.net/37dc2adbdf3c456e99ccc639742f177c@openrainbow.net/node_vnagw\" id=\"node_43496c0f-3401-4540-803f-159644b73db03\"><x xmlns=\"http://jabber.org/protocol/muc#user\"><item jid=\"37dc2adbdf3c456e99ccc639742f177c@openrainbow.net/node_vnagw\" role=\"participant\" affiliation=\"none\"/><status code=\"110\"/></x></presence>";
            await rainbowSDK._core._xmpp.mockStanza(stanza);
        }

        async testmockDiconnect() {
            let stanza = "<iq to='openrainbow.com' type='set' id='122' xmlns='jabber:client'><disconnect xmlns='jabber:iq:configuration'><to>3ae059e2a91c40d9bdd7df0eedc911ca@openrainbow.com</to></disconnect></iq>";
            await rainbowSDK._core._xmpp.mockStanza(stanza);
        }

        async testmockUploadLdapAvatarPresence() {

            let stanzaStr = "<presence from='3ae059e2a91c40d9bdd7df0eedc911ca@openrainbow.com'> <x xmlns='vcard-temp:x:update'>    <avatar/> </x>    <actor xmlns='jabber:iq:configuration'/x>   </presence>";
            let stanza = prettydata.xmlmin(stanzaStr);
            _logger.log("debug", "MAIN - testmockUploadLdapAvatarPresence stanza : ", stanza);
            await rainbowSDK._core._xmpp.mockStanza(stanza);
        }

        async testmockMessageHistory() {
            //"xmlns=\"jabber:client\" to=\"e7f6f82264264b94af88bf4230cde0d1@openrainbow.net\" from=\"openrainbow.net\" type=\"management\" id=\"151951223080941625\">\n" +
            let stanzaConversation = "<message xmlns=\"jabber:client\" to=\"" +  rainbowSDK._core._xmpp.jid + "\" from=\"openrainbow.net\" type=\"management\" id=\"151951223080941625\"><conversation action=\"create\" id=\"1726593823351453\" xmlns=\"jabber:iq:configuration\"><type>room</type>" +
                "<peerId>66e9bb1f59debd61bf40879b</peerId>" +
                "<peer>room_53851c7c4a554cb79815209cc1dda5db@muc.openrainbow.net</peer>" +
                "<mute>false</mute>" +
                "<isFavorite>false</isFavorite>" +
                "<unreceivedMessageNumber>0</unreceivedMessageNumber>" +
                "<unreadMessageNumber>0</unreadMessageNumber>" +
                "</conversation>" +
                "</message>";
            let stanzaMessageHistory = "<message " +
                "xmlns=\"jabber:client\" to=\"" + rainbowSDK._core._xmpp.fullJid + "\" from=\"room_53851c7c4a554cb79815209cc1dda5db@muc.openrainbow.net\">" +
                "<result id=\"1726593839466176\" queryid=\"id:6s36T16irRroom_53851c7c4a554cb79815209cc1dda5db@muc.openrainbow.net\" " +
                "xmlns=\"urn:xmpp:mam:1\">" +
                "<forwarded " +
                "xmlns=\"urn:xmpp:forward:0\">" +
                "<message xml:lang=\"en\" from=\"room_53851c7c4a554cb79815209cc1dda5db@muc.openrainbow.net/e7f6f82264264b94af88bf4230cde0d1@openrainbow.net/node_MJU0bTzD\" type=\"groupchat\" id=\"node_e4463373-829b-4b90-840e-fc8b9e3d62e396\" " +
                "xmlns=\"jabber:client\">" +
                "<ack recv=\"false\" read=\"false\" " +
                "xmlns=\"urn:xmpp:receipts\"/>" +
                "<x xmlns=\"http://jabber.org/protocol/muc#user\">" +
                "<item jid=\"5269c5dc1db14fa2a32ab63d6ed632de@openrainbow.net\"/>" +
                "</x>" +
                "<archived stamp=\"2024-09-17T17:23:59.466176Z\" by=\"room_53851c7c4a554cb79815209cc1dda5db@muc.openrainbow.net\" id=\"1726593839466176\" xmlns=\"urn:xmpp:mam:tmp\"/>" +
                "<stanza-id by=\"room_53851c7c4a554cb79815209cc1dda5db@muc.openrainbow.net\" id=\"1726593839466176\" xmlns=\"urn:xmpp:sid:0\"/>" +
                "<request xmlns=\"urn:xmpp:receipts\">" +
                "<active xmlns=\"http://jabber.org/protocol/chatstates\"/>" +
                "</request>" +
                "<mention xmlns=\"urn:xmpp:attention:0\">" +
                "<jid>" + rainbowSDK._core._xmpp.jid + "</jid>" +
                "</mention>" +
                "<body xml:lang=\"en\">Hello Dolores from this bubble!</body>" +
                "<subject xml:lang=\"en\">helloDoloresSubject</subject>" +
                "</message>" +
                "<delay from=\"muc.openrainbow.net\" stamp=\"2024-09-17T17:23:59.466176Z\" xmlns=\"urn:xmpp:delay\"/>" +
                "</forwarded>" +
                "</result>" +
                "</message>";
         //   await rainbowSDK._core._xmpp.mockStanza(stanzaConversation);
            await rainbowSDK._core._xmpp.mockStanza(stanzaMessageHistory);
        }

        async testsynchronizeUsersAndDeviceswithCSV() {
            // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
            _logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV. ");
            let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
            _logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV - allCompanies : ", allCompanies);
            let companyId = connectedUser.companyId;
            for (let company of allCompanies.data) {
                //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
                if (company.name==="vbeCompanie") {
                    _logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV vbeCompanie found : ", company);
                    companyId = company.id;
                }
            }
            _logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV - companyId : ", companyId);
            fs.readFile('c:\\temp\\file.csv', 'utf8', async (err: any, data: any) => {
                if (err) {
                    _logger.log("error", "MAIN - testsynchronizeUsersAndDeviceswithCSV syncCSV readFile error: ", err);
                    return;
                }
                let result = await rainbowSDK.admin.synchronizeUsersAndDeviceswithCSV(data, companyId, "test synchronise", true, false);
                _logger.log("debug", "MAIN - testsynchronizeUsersAndDeviceswithCSV - result : ", result);
            });
        }

        async testretrieveRainbowUserList() {
            // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
            _logger.log("debug", "MAIN - testretrieveRainbowUserList. ");
            let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
            _logger.log("debug", "MAIN - testretrieveRainbowUserList - allCompanies : ", allCompanies);
            let companyId = connectedUser.companyId;
            for (let company of allCompanies.data) {
                //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
                if (company.name==="vbeCompanie") {
                    _logger.log("debug", "MAIN - testretrieveRainbowUserList vbeCompanie found : ", company);
                    companyId = company.id;
                }
            }
            _logger.log("debug", "MAIN - testretrieveRainbowUserList - companyId : ", companyId);

            let result = await rainbowSDK.admin.retrieveRainbowUserList(companyId, "csv", true);
            _logger.log("debug", "MAIN - testretrieveRainbowUserList - result : ", result);

        }

        async testretrieveRainbowEntriesList() {
            // to be used with vincentbp@vbe.test.openrainbow.net on vberder AIO.
            _logger.log("debug", "MAIN - testretrieveRainbowEntriesList. ");
            let allCompanies: any = await rainbowSDK.admin.getAllCompanies();
            _logger.log("debug", "MAIN - testretrieveRainbowEntriesList - allCompanies : ", allCompanies);
            let companyId = connectedUser.companyId;
            for (let company of allCompanies.data) {
                //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
                if (company.name==="vbeCompanie") {
                    _logger.log("debug", "MAIN - testretrieveRainbowEntriesList vbeCompanie found : ", company);
                    companyId = company.id;
                }
            }
            _logger.log("debug", "MAIN - testretrieveRainbowEntriesList - companyId : ", companyId);

            //companyId? : string, format : string = "json", ldap_id : boolean = true

            //let result = await rainbowSDK.admin.retrieveRainbowEntriesList(companyId, "json", true);
            let result = await rainbowSDK.admin.retrieveRainbowEntriesList(null, "json", false);
            _logger.log("debug", "MAIN - testretrieveRainbowEntriesList - result : ", result);

        }

        testundefined2() {
            let result = undefined;
            _logger.log("debug", "MAIN - testundefined2 - with undefined result : ", result?.id);
            result = {"id": "423412345145325"};
            _logger.log("debug", "MAIN - testundefined2 - with initialized result : ", result?.id);
        }

        testuploadLdapAvatar() {
            let that = this;
            let pathImg = "c:\\temp\\IMG_20131005_173918.jpg";

            let fd = fs.openSync(pathImg, "r+");
            let fileStats = fs.statSync(pathImg);
            let sizeToRead = fileStats.size;
            let buf = new Buffer(sizeToRead);
            _logger.log("debug", "MAIN - testuploadLdapAvatar sizeToRead=", sizeToRead, ", buff.byteLength : ", buf.byteLength);
            let promiseDeferred = new Deferred();
            fs.readSync(fd, buf, 0, sizeToRead, null);

            let fileType: any = undefined;

            // @ts-ignore
            if (mime.lookup) {
                // @ts-ignore
                fileType = mime.lookup(pathImg);
            }
            if (mime.getType) {
                fileType = mime.getType(pathImg);
            }

            rainbowSDK.admin.uploadLdapAvatar(buf, fileType).then((result) => {
                _logger.log("debug", "EngineVincent00 - uploadLdapAvatar - result : ", result);
            });
        }

        //endregion ldap

        //region Conference V2

        async testConferenceV2() {
            _logger.log("debug", "MAIN - (testConferenceV2). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - (testConferenceV2) :: getContactByLoginEmail contact : ", contact);
                    rainbowSDK.bubbles.createBubble("testConferenceV2" + utc, "testConferenceV2" + utc, true).then((bubble: any) => {
                        _logger.log("debug", "MAIN - (testConferenceV2) :: createBubble request ok, bubble : ", bubble);
                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {

                            rainbowSDK.bubbles.startConferenceOrWebinarInARoom(bubble.id).then(async (confStarted) => {
                                _logger.log("debug", "MAIN - (testConferenceV2) :: startConferenceOrWebinarInARoom request ok, confStarted : ", confStarted);

                                await setTimeoutPromised(3000)
                                rainbowSDK.bubbles.stopConferenceOrWebinar(bubble.id).then(async (confStarted) => {
                                    _logger.log("debug", "MAIN - (testConferenceV2) :: stopConferenceOrWebinar request ok, confStarted : ", confStarted);

                                    rainbowSDK.bubbles.closeAndDeleteBubble(bubble).then((confStopped) => {
                                        _logger.log("debug", "MAIN - (testConferenceV2) :: closeAndDeleteBubble request ok, confStopped : ", confStopped);
                                    });
                                });

                            });
                        });
                    });
                }
            });
        }


        async teststopConferenceV2() {
            let bubbleId = "6213b94219fa5d0143a71e3c";

            rainbowSDK.bubbles.stopConferenceOrWebinar(bubbleId).then(async (confStarted) => {
                _logger.log("debug", "MAIN - (teststopConferenceV2) :: stopConferenceOrWebinar request ok, confStarted : ", confStarted);
            }).catch(err => {
                _logger.log("error", "MAIN - (teststopConferenceV2) :: stopConferenceOrWebinar request not ok, err : ", err);
            });
        }

        async teststartConferenceOrWebinarInARoom() {
            // To be used with vincent01 NET
            let bubbleId = "62f503405e9a9be52522d2c4"; // "bubble1"

            rainbowSDK.bubbles.startConferenceOrWebinarInARoom(bubbleId).then(async (confStarted) => {
                _logger.log("debug", "MAIN - (teststartConferenceOrWebinarInARoom) :: startConferenceOrWebinarInARoom request ok, confStarted : ", confStarted);
            }).catch(err => {
                _logger.log("error", "MAIN - (teststartConferenceOrWebinarInARoom) :: startConferenceOrWebinarInARoom request not ok, err : ", err);
            });
        }

        async testpromoteContactToModerator() {
            // To be used with vincent01 NET
            let bubbleId = "62f503405e9a9be52522d2c4"; // "bubble1"
            let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");

            rainbowSDK.bubbles.promoteContactToModerator(contact, bubble).then(async (result) => {
                _logger.log("debug", "MAIN - (testpromoteContactToModerator) :: promoteContactToModerator request ok, result : ", result);
            }).catch(err => {
                _logger.log("error", "MAIN - (testpromoteContactToModerator) :: promoteContactToModerator request not ok, err : ", err);
            });
        }

        async testjoinConferenceV2_vincent01() {
            // To be used with vincent01 NET
            let bubbleId = "62f503405e9a9be52522d2c4"; // "bubble1"
            //let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");

            rainbowSDK.bubbles.joinConferenceV2(bubbleId).then(async (result) => {
                _logger.log("debug", "MAIN - (testjoinConferenceV2) :: joinConferenceV2 request ok, result : ", result);
            }).catch(err => {
                _logger.log("error", "MAIN - (testjoinConferenceV2) :: joinConferenceV2 request not ok, err : ", err);
            });
        }

        async testjoinConferenceV2_vincent01_WithStart() {
            // To be used with vincent01 NET
            let bubbleId = "62f503405e9a9be52522d2c4"; // "bubble1"


            // To be used with vincent.berder COM
            //let bubbleId = '5e56968c6f18201dde44fa7c'; // name: 'Bulle_NodeSDK',

            let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            _logger.log("debug", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: bubble : ", bubble);
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");

            rainbowSDK.bubbles.startConferenceOrWebinarInARoom(bubbleId).then(async (confStarted) => {
                _logger.log("debug", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: startConferenceOrWebinarInARoom request ok, confStarted : ", confStarted);
                rainbowSDK.bubbles.joinConferenceV2(bubbleId, undefined, undefined, false, ["rdeu"], false, false, ["video"], undefined).then(async (result) => {
                    _logger.log("debug", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: joinConferenceV2 request ok, result : ", result);
                    rainbowSDK.bubbles.snapshotConference(bubbleId).then(async (result) => {
                        _logger.log("debug", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: snapshotConference request ok, result : ", result);
                    }).catch(err => {
                        _logger.log("error", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: snapshotConference request not ok, err : ", err);
                    });
                }).catch(err => {
                    _logger.log("error", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: joinConferenceV2 request not ok, err : ", err);
                });
            }).catch(err => {
                _logger.log("error", "MAIN - (testjoinConferenceV2_vincent01_WithStart) :: startConferenceOrWebinarInARoom request not ok, err : ", err);
            });
        }

        async testjoinConferenceV2_CreateBubble_WithStart() {
            // To be used with vincent01 NET
            _logger.log("debug", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: getContactByLoginEmail contact : ", contact);
                    rainbowSDK.bubbles.createBubble("testConferenceV2" + utc, "testConferenceV2" + utc, true).then((bubble: any) => {
                        _logger.log("debug", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: createBubble request ok, bubble : ", bubble);
                        let bubbleId = bubble.id;
                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {

                            rainbowSDK.bubbles.startConferenceOrWebinarInARoom(bubbleId).then(async (confStarted) => {
                                _logger.log("debug", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: startConferenceOrWebinarInARoom request ok, confStarted : ", confStarted);
                                rainbowSDK.bubbles.joinConferenceV2(bubbleId, undefined, undefined, false, ["rdeu"], false, false, ["video"], undefined).then(async (result) => {
                                    _logger.log("debug", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: joinConferenceV2 request ok, result : ", result);
                                    rainbowSDK.bubbles.snapshotConference(bubbleId).then(async (result) => {
                                        _logger.log("debug", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: snapshotConference request ok, result : ", result);
                                    }).catch(err => {
                                        _logger.log("error", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: snapshotConference request not ok, err : ", err);
                                    });
                                }).catch(err => {
                                    _logger.log("error", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: joinConferenceV2 request not ok, err : ", err);
                                });
                            }).catch(err => {
                                _logger.log("error", "MAIN - (testjoinConferenceV2_CreateBubble_WithStart) :: startConferenceOrWebinarInARoom request not ok, err : ", err);
                            });

                        });
                    });
                }
            });
        }

        async testdelegateConference() {
            // To be used with vincent01 NET
            let bubbleId = "62f503405e9a9be52522d2c4"; // "bubble1"
            //let bubble = await rainbowSDK.bubbles.getBubbleById(bubbleId);
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent00@vbe.test.openrainbow.net");

            rainbowSDK.bubbles.delegateConference(bubbleId, contact.id).then(async (result) => {
                _logger.log("debug", "MAIN - (testpromoteContactToModerator) :: promoteContactToModerator request ok, result : ", result);
            }).catch(err => {
                _logger.log("error", "MAIN - (testpromoteContactToModerator) :: promoteContactToModerator request not ok, err : ", err);
            });
        }

        async teststopConference() {
            // To be used with vincent01 NET
            let bubbleId = "62f503405e9a9be52522d2c4"; // "bubble1"

            rainbowSDK.bubbles.stopConferenceOrWebinar(bubbleId).then(async (confStopped) => {
                _logger.log("debug", "MAIN - (teststopConferenceV2) :: stopConferenceOrWebinar request ok, confStopped : ", confStopped);
            }).catch(err => {
                _logger.log("error", "MAIN - (teststopConferenceV2) :: stopConferenceOrWebinar request not ok, err : ", err);
            });
        }

        async tesaskConferenceSnapshot() {
            let confId = "60d5a4ee0eeee002d144e9bf";

            /*rainbowSDK.bubbles.askConferenceSnapshot(confId).then(async (confStarted) => {
           _logger.log("debug", "MAIN - (tesaskConferenceSnapshot) :: askConferenceSnapshot request ok, confStarted : ", confStarted);
        }).catch (err => {
           _logger.log("error", "MAIN - (tesaskConferenceSnapshot) :: askConferenceSnapshot request not ok, err : ", err);
        }); // */
        }


        //endregion Conference V2

        //region Webinar

        async testgetWebinarsData() {
            _logger.log("debug", "MAIN - (testgetWebinarsData). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
                _logger.log("debug", "MAIN - [testgetWebinarsData    ] :: getWebinarsData result : ", result);
            });
        }

        async testcreateWebinar() {
            _logger.log("debug", "MAIN - (testcreateWebinar). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            let nameWebinar = "nameWebinar_" + utc;
            let subjectWebinar = "subjectWebinar_" + utc;
            rainbowSDK.webinars.createWebinar(nameWebinar, subjectWebinar, null, null, null, null, null, null, null, null, null, null, null, null).then(async (result: any) => {
                _logger.log("debug", "MAIN - (testcreateWebinar) :: create Webinar result : ", result);
                rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
                    _logger.log("debug", "MAIN - (testcreateWebinar) :: getWebinarsData result : ", result);
                });
            });
        }

        async testupdateWebinar() {
            _logger.log("debug", "MAIN - (testupdateWebinar). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.webinars.getWebinarsData("participant").then(async (webinarsResult: any) => {
                _logger.log("debug", "MAIN - (testupdateWebinar) :: getWebinarsData result : ", webinarsResult);
                let webinar = webinarsResult.data[0];
                rainbowSDK.webinars.updateWebinar(webinar.id, "updatedNameWebinar", webinar.subject, webinar.waitingRoomStartDate, webinar.webinarStartDate, webinar.webinarEndDate, webinar.reminderDates, webinar.timeZone, webinar.register, webinar.approvalRegistrationMethod, webinar.passwordNeeded, webinar.lockRegistration, webinar.waitingRoomMultimediaURL, webinar.stageBackground, webinar.chatOption).then(async (result: any) => {
                    _logger.log("debug", "MAIN - (testupdateWebinar) :: updateWebinar result : ", result);
                }).catch(err => {
                    _logger.log("debug", "MAIN - (testupdateWebinar) :: error during upodate : ", err);
                });
            });
        }

        async testcreateAndDeleteWebinar() {
            _logger.log("debug", "MAIN - (testcreateAndDeleteWebinar). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            let nameWebinar = "nameWebinar_" + utc;
            let subjectWebinar = "subjectWebinar_" + utc;
            rainbowSDK.webinars.createWebinar(nameWebinar, subjectWebinar, null, null, null, null, null, null, null, null, null, null, null, null).then(async (createresult: any) => {
                _logger.log("debug", "MAIN - [testcreateAndDeleteWebinar    ] :: create Webinar result : ", createresult);
                await rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
                    _logger.log("debug", "MAIN - [testcreateAndDeleteWebinar    ] :: getWebinarsData result : ", result);
                });

                await rainbowSDK.webinars.deleteWebinar(createresult.id).then(async (deleteresult: any) => {
                    _logger.log("debug", "MAIN - [testcreateAndDeleteWebinar    ] :: delete Webinar result : ", deleteresult);

                });
            });
        }

        async testDeleteAllWebinar() {
            _logger.log("debug", "MAIN - (testDeleteAllWebinar). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            rainbowSDK.webinars.getWebinarsData("participant").then(async (result: any) => {
                _logger.log("debug", "MAIN - [testDeleteAllWebinar    ] :: getWebinarsData result : ", result);
                for (let resultKey in result.data) {
                    rainbowSDK.webinars.deleteWebinar(result.data[resultKey].id).then(async (deleteresult: any) => {
                        _logger.log("debug", "MAIN - [testDeleteAllWebinar    ] :: delete Webinar result : ", deleteresult);

                    });
                }
            });
        }

        //endregion Webinar

        //region Clients Versions

        async testgetAllClientsVersions() {
            let that = this;
            let res = await rainbowSDK.admin.getAllClientsVersions(null, null);
            _logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);
        }

        async testgetAllClientsVersionsBot() {
            let that = this;
            let res = await rainbowSDK.admin.getAllClientsVersions(null, "bot");
            _logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);
        }

        async testcreateAClientVersion() {
            let that = this;
            //let res = await rainbowSDK.admin.createAClientVersion(options.application.appID, "2.4.0");
            let res = await rainbowSDK.admin.createAClientVersion(undefined, "2.5.0");
            _logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);
        }

        async testdeleteAClientVersion() {
            let that = this;
            //let res = await rainbowSDK.admin.createAClientVersion(options.application.appID, "2.4.0");
            let res = await rainbowSDK.admin.deleteAClientVersion(options.application.appID);
            _logger.log("debug", "MAIN - testdeleteAClientVersion, res : ", res);
        }

        //endregion Clients Versions

        //region bubbles polls

        async testcreateBubblePollAndDelete() {
            let that = this;

            //let res = await rainbowSDK.bubbles.createBubblePoll();
            //logger.log("debug", "MAIN - testgetAllClientsVersions, res : ", res);

            _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete). ");
            let utc = new Date().toJSON().replace(/-/g, "/");
            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
                if (contact) {
                    _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: getContactByLoginEmail contact : ", contact);
                    rainbowSDK.bubbles.createBubble("testcreateBubblePollAndDelete" + utc, "testcreateBubblePollAndDelete" + utc, true).then((bubble: any) => {
                        _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: createBubble request ok, bubble : ", bubble);
                        rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, false, false, "").then(async () => {

                            let questions: Array<{
                                text: string,
                                multipleChoice: boolean,
                                answers: Array<{ text: string }>
                            }> = [
                                {
                                    text: "Question 1",
                                    multipleChoice: true,
                                    answers: [{text: "oui"}, {text: "non"}]
                                }
                            ];
                            rainbowSDK.bubbles.createBubblePoll(bubble.id, "My Poll", questions, false, 0).then(async (pollCreated: any) => {
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: createBubblePoll request ok, pollCreated : ", pollCreated);

                                await setTimeoutPromised(3000);

                                let polls = await rainbowSDK.bubbles.getBubblePollsByBubble(bubble.id, "full", 100, 0);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: getBubblePollsByBubble request ok, result : ", polls);

                                let updatePollResult = await rainbowSDK.bubbles.updateBubblePoll(pollCreated.pollId, bubble.id, "My Poll updated", questions, false, 0);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: updateBubblePoll request ok, result : ", updatePollResult);

                                let pollsUpdated = await rainbowSDK.bubbles.getBubblePollsByBubble(bubble.id, "full", 100, 0);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: getBubblePollsByBubble updated request ok, result : ", pollsUpdated);

                                let pollPublishedResult = await rainbowSDK.bubbles.publishBubblePoll(pollCreated.pollId);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: publishBubblePoll request ok, result : ", pollPublishedResult);

                                let votesPollResult = await rainbowSDK.bubbles.votesForBubblePoll(pollCreated.pollId, [{
                                    "question": 0,
                                    "answers": [0]
                                }]);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: votesForBubblePoll request ok, result : ", votesPollResult);

                                let unpollPublishedResult = await rainbowSDK.bubbles.unpublishBubblePoll(pollCreated.pollId);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: unpublishBubblePoll request ok, result : ", unpollPublishedResult);

                                let pollPublishedResult2 = await rainbowSDK.bubbles.publishBubblePoll(pollCreated.pollId);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: publishBubblePoll request ok, result : ", pollPublishedResult2);

                                let terminatedBubblePollResult = await rainbowSDK.bubbles.terminateBubblePoll(pollCreated.pollId);
                                _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: terminateBubblePoll request ok, result : ", terminatedBubblePollResult);


                                rainbowSDK.bubbles.deleteBubblePoll(pollCreated.pollId).then(async (result) => {
                                    _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: deleteBubblePoll request ok, polls : ", result);

                                    rainbowSDK.bubbles.closeAndDeleteBubble(bubble).then((result) => {
                                        _logger.log("debug", "MAIN - (testcreateBubblePollAndDelete) :: closeAndDeleteBubble request ok, result : ", result);
                                    });
                                });

                            });
                        });
                    });
                }
            });
        }

        async testdeleteBubblePoll() {
            let that = this;
            //let res = await rainbowSDK.admin.createAClientVersion(options.application.appID, "2.4.0");
            let res = await rainbowSDK.bubbles.deleteBubblePoll(undefined);
            _logger.log("debug", "MAIN - testdeleteAClientVersion, res : ", res);
        }

        //endregion bubbles polls

        // region Pondeuse
        testPondeuse() {
            let timeoutMilliSeconds = 10;
            let date;
            let jid_BotSender;
            let jid_BotReceiver;
            let time1, time2, time3, time4, time5, time6;
            let index = 0;
            // let time= new Date();
            let botVNA = "646e00ba0b0a4eb58136d21204dd968d@openrainbow.com";

            let loginEmail = "vincent02@vbe.test.openrainbow.net";
            let botSender = rainbowSDK;
            rainbowSDK.contacts.getContactByLoginEmail(loginEmail).then(async (contact: any) => {
                if (contact) {
                    botVNA = contact.jid;
                    //botSender = new NodeSDK(botS);
                    //  botSender.start().then((account) => {
                    //console.log("Rainbow Started Sent : ",account);
                    //console.log("JID Sent: ", account.loggedInUser.jid_im);
                    //jid_BotSender = account.loggedInUser.jid_im;
                    _logger.log("debug", "MAIN - (testPondeuse) :: start pondeuse.");
                    let idInterval = setInterval(function () {
                        if (botVNA) {
                            //console.log("-------------------------------");
                            date = new Date(); //Date.now();
                            index = index + 1;
                            botSender.im.sendMessageToJid("#ECHO " + index + " " + date.toLocaleDateString() + " " + date.toLocaleTimeString() + ":" + date.getMilliseconds() + " [" + date.valueOf() + "]", botVNA, "en", undefined, undefined, "std");
                        }
                    }, timeoutMilliSeconds);

                    setTimeout(() => {
                        _logger.log("debug", "MAIN - (testPondeuse) :: stop pondeuse.");
                        clearInterval(idInterval);
                    }, 10 * 1000);

                    botSender.events.on("rainbow_onmessagereceived", (message) => {
                        if (!message.content.includes("#")) {
                            let value = message.content.split(" ")[0];
                            let timeOriginal = message.content.split(" ")[1];
                            let timeReception = message.content.split(" ")[2];
                            let timeR = Date.now() - timeOriginal;
                            console.log(value + "," + timeReception + "," + timeR);
                        }
                    });

                    botSender.events.on("rainbow_onmessagereceiptreceived", (receipt) => {
                        time2 = Date.now() - date;
                        //console.log("SENDER RECIPT RECIEVER : "+receipt.event+" "+time2);
                    });
                    botSender.events.on("rainbow_onmessagereceiptreadreceived", (receipt) => {
                        time3 = Date.now() - date;
                        //console.log("SENDER RECIPT RECIEVER: "+receipt.event+" "+time3);
                    });
                    //});
                }
            });
        }

        // endregion Pondeuse

        //region ChatGPT

        async testpostUrlToChatGPT(urlToPost: string = "https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions") {
            let alternateContent = null;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);

            async function treatmentOfAdaptiveCardMessage(adaptiveResponse) {
                // Treatment of returned data by the adptive card.
                if (adaptiveResponse?.rainbow?.value?.response==="adaptiveCard_responseIntervention") {
                    let prompt = adaptiveResponse?.prompt;
                    _logger.log("debug", "MAIN - testpostUrlToChatGPT - ");
                    let headers = {
                        'Content-Type': 'application/json',
                        'user-agent': 'node/v14.17.2 (linux; x64) Rainbow Sdk/2.16.0-lts.0',
                    };
                    //let body = decodeURIComponent(JSON.stringify({
                    let body = JSON.stringify({
                        "prompt": prompt,
                        "max_tokens": 600,
                        "n": 1
                    });
                    try {
                        let res = await rainbowSDK._core._http.postUrlRaw(urlToPost, headers, body);
                        let bodyJson = JSON.parse(res?.body);
                        let text = "/code Prompt: " + prompt + "\nChatGPT:\n" + bodyJson?.choices[0].text;
                        _logger.log("debug", "MAIN - testpostUrlToChatGPT, text : ", text);
                        await rainbowSDK.im.sendMessageToConversation(conversation, text, "fr", undefined, "retour de ChatGPT").then(async message => {
                            _logger.log("debug", "MAIN - testpostUrlToChatGPT - search msgId : " + message.id);
                            _logger.log("debug", "MAIN - testpostUrlToChatGPT - msg.origin.conversation.id : " + conversation.id)

                        }, error => {
                        });
                    } catch (err) {
                        _logger.log("error", "MAIN - testpostUrlToChatGPT, error err : ", err);
                    }

                } else {
                    // The card is not the result of an intervention.
                }
            }

            // The Handle on the event should be only once. So in a prod program it should be outside of the initial send message of the adpative Card.
            rainbowSDK.events.on("rainbow_onmessagereceived", (message) => {
                _logger.log("debug", "MAIN - (rainbow_onmessagereceived) - rainbow event received. message", message);
                let responseObjJson = "";
                if (message.alternativeContent?.length > 0 && message.alternativeContent[0]?.message && message.alternativeContent[0]?.type) {

                    switch (message.alternativeContent[0].type) {
                        case "rainbow/json":
                            responseObjJson = JSON.parse(message.alternativeContent[0].message);
                            treatmentOfAdaptiveCardMessage(responseObjJson);
                        default:
                    }

                }
            });

            const buildCard = (type) => {
                let templateJson = {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "${titleCard}"
                        },
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "${Survey.title}",
                            "horizontalAlignment": "Center",
                            "wrap": true,
                            "style": "heading"
                        },
                        {
                            "type": "Input.Text",
                            "id": "prompt",
                            "label": "${Survey.askPrompt}"
                        }
                    ],
                    "actions": [
                        {
                            "type": "Action.Submit",
                            "title": "Valider",
                            "data": {
                                "rainbow": {
                                    "text": "Send Prompt.",
                                    "type": "messageBack",
                                    "value": {
                                        "response": "adaptiveCard_responseIntervention"
                                    }
                                }
                            }
                        }
                    ]
                }; // */

                let messageJson = {
                    "titleCard": "Welcome to Rainbow Bot ChatGPT.",
                    "Survey": {
                        "title": "Saisie du prompt ChatGPT.",
                        "askPrompt": "Votre prompt ?",
                    }
                };

                // Create a Template instance from the template payload
                const template = new ACData.Template(templateJson);
                const context = {
                    $root: messageJson
                };
                const card = template.expand(context);
                return JSON.stringify(card);
            }

            alternateContent = {
                type: 'form/json',
                //message: serialize.configure(buildCard(""))
                message: buildCard("")
            };

            _logger.log("debug", "MAIN - testpostUrlToChatGPT - alternateContent : ", alternateContent?.message);

            await rainbowSDK.im.sendMessageToConversation(conversation, 'ok', "fr", alternateContent, "retour intervension").then(async message => {
                _logger.log("debug", "MAIN - testpostUrlToChatGPT - search msgId : " + message.id);
                _logger.log("debug", "MAIN - testpostUrlToChatGPT - msg.origin.conversation.id : " + conversation.id)

            }, error => {
            })

        }

        //endregion ChatGPT

        //region Rainbow HTTPoverXMPP

        async testpostUrl(urlToPost: string = "http://10.69.81.117:8091/management/api/onthemove/location/") {
            let headers = {
                'user-Id': 'ignoredWithPhone',
                'user-Pin': 'ignoredWithPhone',
                'user-Phone': '30100',
                'Content-Type': 'application/json',
                'Content-Length': '163',
                'user-agent': 'node/v14.17.2 (linux; x64) Rainbow Sdk/2.16.0-lts.0'
            };
            //let body = decodeURIComponent(JSON.stringify({
            let body = JSON.stringify({
                "city": "new york",
                "did": "8188784500",
                "name": "3",
                "psap": "911",
                "state": "QC",
                "streetName": "Quebec Rd",
                "streetNumber": "4812",
                "zipcode": "10010",
                "country": "CA"
            });
            try {


                let res = await rainbowSDK._core._http.postUrlRaw(urlToPost, headers, body);
                _logger.log("debug", "MAIN - testpostUrl, res : ", res);
            } catch (err) {
                _logger.log("error", "MAIN - testpostUrl, error err : ", err);
            }

        }

        async testsubscribePresence() {
            let to = "29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net"; // "vincent11@vbe.test.openrainbow.net";
            let res = await rainbowSDK.presence.subscribePresence(to);
            _logger.log("debug", "MAIN - testsubscribePresence, res : ", res);

        }

        async testgetHTTPoverXMPP(urlToGet: string = "https://moncompte.laposte.fr/") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {"dateOfRequest": new Date().toLocaleDateString()};
            //let headers = {};
            let res = await rainbowSDK.httpoverxmpp.get(urlToGet, headers);
            _logger.log("debug", "MAIN - testgetHTTPoverXMPP, res : ", res);
        }

        async testgetHTTPoverXMPPVNA(urlToGet: string = "http://localhost:8091/management/api/onthemove/location/", jidServer: string = "vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud/node_Dufz2bRl") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {
                "dateOfRequest": new Date().toLocaleDateString(),
                "user-Id": "ignoredWithPhone",
                "user-Pin": "ignoredWithPhone",
                "user-Phone": "31000"
            };
            //let headers = {};
            let res: any = await rainbowSDK.httpoverxmpp.get(urlToGet, headers, jidServer);
            _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, res : ", res);
            if (res && res.iq && res.iq.resp && res.iq.resp["$attrs"] && res.iq.resp["$attrs"].statusCode==200 && res.iq.resp.data) {
                _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, headers : ", res.iq.resp.headers);
                //console.log("MAIN - testgetHTTPoverXMPPVNA, headers : ", res.iq.resp.headers);
                let isJson = false;
                for (const header of res.iq.resp.headers.header) {
                    if (header["$attrs"].name=="content-type" && header["$attrs"]._=="application/json") {
                        isJson = true;
                    }
                }
                let bodyStr = decodeURIComponent(res.iq.resp.data.text);
                _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, bodyStr : ", bodyStr);
                if (isJson) {
                    _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, body JSON : ", JSON.parse(bodyStr));
                }
            }
        }

        async testpostHTTPoverXMPPVNA(urlToPost: string = "http://localhost:8091/management/api/onthemove/location/", jidServer: string = "vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud/node_vnagw") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {
                "dateOfRequest": new Date().toLocaleDateString(),
                "user-Id": "ignoredWithPhone",
                "user-Pin": "ignoredWithPhone",
                "user-Phone": "31000",
                "Content-Type": "application/json"
            };
            //let headers = {};
            let data = "{\n" +
                "\"did\":\"8188784500\",\n" +
                "\"city\": \"Agoura Hills\",\n" +
                "\"country\": \"US\",\n" +
                "\"name\": \"MyHouse\",\n" +
                "\"nomadic\": false,\n" +
                "\"psap\": \"911\",\n" +
                "\"state\": \"CA\",\n" +
                "\"streetName\": \"Québec Drive\",\n" +
                "\"streetNumber\": \"27000\",\n" +
                "\"zipcode\": \"91301\"\n" +
                "}";
            let res: any = await rainbowSDK.httpoverxmpp.post(urlToPost, headers, data, jidServer);
            _logger.log("debug", "MAIN - testpostHTTPoverXMPPVNA, res : ", res);
            if (res && res.iq && res.iq.resp && res.iq.resp["$attrs"] && res.iq.resp.data) {
                _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, headers : ", res.iq.resp.headers);
                //console.log("MAIN - testgetHTTPoverXMPPVNA, headers : ", res.iq.resp.headers);
                //if (res.iq.resp["$attrs"].statusCode==200) {
                let isJson = false;
                for (const header of res.iq.resp.headers.header) {
                    if (header["$attrs"].name=="content-type" && header["$attrs"]._=="application/json") {
                        isJson = true;
                    }
                }
                let bodyStr = decodeURIComponent(res.iq.resp.data.text);
                _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, bodyStr : ", bodyStr);
                if (isJson) {
                    _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, body JSON : ", JSON.parse(bodyStr));
                }
                /*} else {
                let bodyStr = decodeURIComponent(res.iq.resp.data.text);
               _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, bodyStr : ", bodyStr);

            } //*/
            }
        }

        async testdeleteHTTPoverXMPPVNA(urlToPost: string = "http://localhost:8091/management/api/onthemove/location/", jidServer: string = "vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud/node_Dufz2bRl") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {
                "dateOfRequest": new Date().toLocaleDateString(),
                "user-Id": "ignoredWithPhone",
                "user-Pin": "ignoredWithPhone",
                "user-Phone": "31000"
            };
            //let headers = {};
            let data = "";
            let res = await rainbowSDK.httpoverxmpp.delete(urlToPost, headers, data, jidServer);
            _logger.log("debug", "MAIN - testdeleteHTTPoverXMPP, res : ", res);
        }

        async testdiscoverHTTPoverXMPP(jidHTTPoverXMPPBot: string = "vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud", vincent01?: boolean) {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {
                "dateOfRequest": new Date().toLocaleDateString(),
                "user-Id": "ignoredWithPhone",
                "user-Pin": "ignoredWithPhone",
                "user-Phone": "31000"
            };
            if (vincent01) {
                let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net");
                jidHTTPoverXMPPBot = contact.jid;
            }

            //let headers = {};
            //let res : any = await rainbowSDK.httpoverxmpp.discoverHTTPoverXMPP( headers, jidServer);
            let res: any = await rainbowSDK.httpoverxmpp.discoverHTTPoverXMPP(headers, jidHTTPoverXMPPBot);
            _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, res : ", res);
            /*
                if (res && res.iq && res.iq.resp && res.iq.resp["$attrs"] && res.iq.resp["$attrs"].statusCode == 200 && res.iq.resp.data) {
                   _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, headers : ", res.iq.resp.headers);
                    //console.log("MAIN - testgetHTTPoverXMPPVNA, headers : ", res.iq.resp.headers);
                    let isJson = false;
                    for (const header of res.iq.resp.headers.header) {
                        if (header["$attrs"].name == "content-type" && header["$attrs"]._ == "application/json") {
                            isJson = true;
                        }
                    }
                    let bodyStr = decodeURIComponent(res.iq.resp.data.text);
                   _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, bodyStr : ", bodyStr);
                    if (isJson) {
                       _logger.log("debug", "MAIN - testgetHTTPoverXMPPVNA, body JSON : ", JSON.parse(bodyStr));
                    }
                }
        */
        }

        async testtraceHTTPoverXMPP(urlToGet: string = "https://moncompte.laposte.fr/", jidHTTPoverXMPPBot: string = "vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud", vincent01?: boolean) {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {"dateOfRequest": new Date().toLocaleDateString()};
            //let headers = {};
            if (vincent01) {
                let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net");
                jidHTTPoverXMPPBot = contact.jid + "/node_vnagw";
            }
            let res: any = await rainbowSDK.httpoverxmpp.trace(urlToGet, headers, jidHTTPoverXMPPBot);
            _logger.log("debug", "MAIN - tracegetHTTPoverXMPP, res : ", res);
            let resp = res.iq.resp;
            if (resp.data) {
                let bodyResult = decodeURIComponent(resp.data.text);
                _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded bodyResult : ", bodyResult);
            } else {
                _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP failed : ", resp);
            }
        }

        async testheadHTTPoverXMPP(urlToGet: string = "https://moncompte.laposte.fr/hello") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {"dateOfRequest": new Date().toLocaleDateString()};
            //let headers = {};
            let res = await rainbowSDK.httpoverxmpp.head(urlToGet, headers);
            _logger.log("debug", "MAIN - testheadHTTPoverXMPP, res : ", res);
        }

        async testpostHTTPoverXMPP(urlToPost: string = "https://example.org/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep", jidHTTPoverXMPPBot: string = "vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud", vincent01?: boolean) {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {"dateOfRequest": new Date().toLocaleDateString()};
            //let headers = {};
            if (vincent01) {
                let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net");
                jidHTTPoverXMPPBot = contact.jid + "/node_vnagw";
            }
            let data = "PREFIXdc:<http://purl.org/dc/elements/1.1/>BASE<http://example.org/>SELECT?title?creator?publisherWHERE{?xdc:title?title.OPTIONAL{?xdc:creator?creator}.}";
            let res = await rainbowSDK.httpoverxmpp.post(urlToPost, headers, data, jidHTTPoverXMPPBot);
            _logger.log("debug", "MAIN - testpostHTTPoverXMPP, res : ", res);
        }

        async testputHTTPoverXMPP(urlToPut: string = "https://example.org/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {"dateOfRequest": new Date().toLocaleDateString()};
            //let headers = {};
            let data = "PREFIXdc:<http://purl.org/dc/elements/1.1/>BASE<http://example.org/>SELECT?title?creator?publisherWHERE{?xdc:title?title.OPTIONAL{?xdc:creator?creator}.}";
            let res = await rainbowSDK.httpoverxmpp.put(urlToPut, headers, data);
            _logger.log("debug", "MAIN - testputHTTPoverXMPP, res : ", res);
        }

        async testputHTTPoverXMPP_2(urlToPut: string = "https://reqbin.com/echo/put/json") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {
                "dateOfRequest": new Date().toLocaleDateString(),
                "Content-Type": "application/json"
            };
            //let headers = {};
            let data = "{\n" +
                "  \"Id\": 12345,\n" +
                "  \"Customer\": \"John Smith\",\n" +
                "  \"Quantity\": 1,\n" +
                "  \"Price\": 10.00\n" +
                "}";
            let res = await rainbowSDK.httpoverxmpp.put(urlToPut, headers, data);
            _logger.log("debug", "MAIN - testputHTTPoverXMPP, res : ", res);
        }

        async testdeleteHTTPoverXMPP(urlToPut: string = "https://example.org/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep") {
            let that = this;
            //let urlToGet = "https://xmpp.org/extensions/xep-0332.html";
            //let urlToGet = "https://www.javatpoint.com/oprweb/test.jsp?filename=SimpleHTMLPages1";
            let headers = {"dateOfRequest": new Date().toLocaleDateString()};
            //let headers = {};
            let data = "PREFIXdc:<http://purl.org/dc/elements/1.1/>BASE<http://example.org/>SELECT?title?creator?publisherWHERE{?xdc:title?title.OPTIONAL{?xdc:creator?creator}.}";
            let res = await rainbowSDK.httpoverxmpp.delete(urlToPut, headers, data);
            _logger.log("debug", "MAIN - testdeleteHTTPoverXMPP, res : ", res);
        }

        async testHTTPoverXMPP() {
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
            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP res2 : ", res2);
            let resp = res2.iq.resp;
            let bodyResult = decodeURIComponent(resp.data.text);
            let resultOfHttp: any = bodyResult;
            if (resp.$attrs.statusCode >= 200 && resp.$attrs.statusCode <= 206) {
                for (let i = 0; i < resp.headers.header.length; i++) {
                    if (resp.headers.header[i].$attrs.name==="content-type" && (resp.headers.header[i]._.indexOf("json") > -1 || resp.headers.header[i]._.indexOf("csv") > -1)) {
                        resultOfHttp = JSON.parse(bodyResult);
                    }

                }
            } else {
                _logger.warn("internal", "MAIN - testHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
            }

            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded resultOfHttp : ", resultOfHttp);

            // *** Delete directory entry ***

            let urlToDelete = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries/"
            for (let i = 0; i < resultOfHttp.data.length; i++) {
                let resDelete: any = await rainbowSDK.httpoverxmpp.delete(urlToDelete + resultOfHttp.data[i].id, headersGet, undefined);
                _logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP resDelete : ", resDelete);
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
                    _logger.warn("internal", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResultDelete);
                }

                _logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP decoded resultOfHttpDelete : ", resultOfHttpDelete);
                // */
            }

            // *** Create directory entry ***

            let urlToPost = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries"; //  https://openrainbow.net:443/api/rainbow/directory/v1.0/entries
            //headers["Content-Type"] = "application/json";
            //let headers = {};
            let utcEmail = new Date().toJSON().replace(/-|\.|:/g, "_");

            let data: any = {
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
            let res: any = await rainbowSDK.httpoverxmpp.post(urlToPost, headersPost, body);
            _logger.log("debug", "MAIN - testHTTPoverXMPP, postHTTPoverXMPP res : ", res);
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
           _logger.warn("internal", "MAIN - testHTTPoverXMPP, postHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
        } // */

            _logger.log("debug", "MAIN - testHTTPoverXMPP, postHTTPoverXMPP decoded resultOfHttp : ", resultOfHttp);

            // *** Get directory entry ***

            urlToGet = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries?name=testPersonalDirectory&format=small&limit=100&offset=0&sortField=lastName&sortOrder=1&view=all"
            //let res2 = await rainbowSDK.httpoverxmpp.getHTTPoverXMPP(urlToPost + "?name=testPersonalDirectory_lastname_", headers);
            res2 = await rainbowSDK.httpoverxmpp.get(urlToGet, headersGet);
            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP res2 : ", res2);
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
                _logger.warn("internal", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
            }

            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded resultOfHttp : ", resultOfHttp);

            // *** Update directory entry ***

            data = {
                lastName: "testPersonalDirectory_lastname_" + utc + "_updated",
            };
            body = JSON.stringify(data);

            let urlToPut = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries/" + resultOfHttp.data[0].id;
            res = await rainbowSDK.httpoverxmpp.put(urlToPut, headersPut, body);
            _logger.log("debug", "MAIN - testHTTPoverXMPP, putHTTPoverXMPP res : ", res);
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
                _logger.warn("internal", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
            }

            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded updated resultOfHttp : ", resultOfHttp);

            // *** Get directory entry ***

            urlToGet = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries?name=testPersonalDirectory&format=small&limit=100&offset=0&sortField=lastName&sortOrder=1&view=all"
            //let res2 = await rainbowSDK.httpoverxmpp.getHTTPoverXMPP(urlToPost + "?name=testPersonalDirectory_lastname_", headers);
            res2 = await rainbowSDK.httpoverxmpp.get(urlToGet, headersGet);
            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP res2 : ", res2);
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
                _logger.warn("internal", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResult);
            }

            _logger.log("debug", "MAIN - testHTTPoverXMPP, getHTTPoverXMPP decoded updated resultOfHttp : ", resultOfHttp);

            // *** Delete directory entry ***

            urlToDelete = "https://openrainbow.net:443/api/rainbow/directory/v1.0/entries/"
            for (let i = 0; i < resultOfHttp.data.length; i++) {
                let resDelete: any = await rainbowSDK.httpoverxmpp.delete(urlToDelete + resultOfHttp.data[i].id, headersGet, undefined);
                _logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP resDelete : ", resDelete);
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
                    _logger.warn("internal", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP HTTP response.code != 200 , bodyjs : ", bodyResultDelete);
                }

                _logger.log("debug", "MAIN - testHTTPoverXMPP, deleteHTTPoverXMPP decoded resultOfHttpDelete : ", resultOfHttpDelete);
                // */
            }


            /*
        let personalDirectoryList : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
       _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryList : ", personalDirectoryList);
        if (personalDirectoryList &&personalDirectoryList.data && personalDirectoryList.total > 0) {
                    let result = await rainbowSDK.contacts.updatePersonalDirectoryEntry(personalDirectoryList.data[0].id, personalDirectoryList.data[0].firstName + "_updated");

            let result = await rainbowSDK.contacts.deletePersonalDirectoryEntry(personalDirectoryList.data[0].id);
           _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - deletePersonalDirectoryEntry result : ", result);
            let personalDirectoryListUpdated : any = await rainbowSDK.contacts.getListPersonalDirectoryEntriesData("testPersonalDirectory", undefined, undefined, undefined, undefined, undefined, undefined, undefined );
           _logger.log("debug", "MAIN - testdeletePersonalDirectoryEntry - personalDirectoryListUpdated : ", personalDirectoryListUpdated);
        }
        // */

        }

        async testdiscover() {
            let that = this;
            let res = await rainbowSDK.httpoverxmpp.discover();
            _logger.log("debug", "MAIN - testdiscover, res : ", res);
        }

        //endregion Rainbow HTTPoverXMPP

        //region Presence

        async testgetMyPresenceInformation() {
            let res = await rainbowSDK.presence.getMyPresenceInformation();
            _logger.log("debug", "MAIN - testgetMyPresenceInformation, res : ", res);
        }

        async testsendIqGetMyPresenceInformation() {
            /* The API server send to xmpp server the following request.
            <iq type='get' id='123' xmlns='jabber:client'>
                 *     <user-presences user='cce80c33c78c47c0907a6bfa3f4ffe72@openrainbow.com' xmlns='jabber:iq:configuration'/>
                 * </iq>
             */
            let that = this;
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net");
            let promiseList = []
            _logger.log("debug", "MAIN - (testsendIq) : START iter.");
            //await rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
            //_logger.log("debug", "MAIN - (testsendPing) getContactInformationByJID result : ", _contactFromServer);
            let id = xmppUtils.getUniqueMessageId();
            let stanza = xml("iq", {
                    "from": rainbowSDK._core._xmpp.fullJid,
                    "type": "get",
               //     "to": rainbowSDK._core._xmpp.fullJid,
                    "to": connectedUser.jid,
                    "id": id
                },
                xml("user-presences", {"user" : connectedUser.jid, "xmlns": 'jabber:iq:configuration'})
            );
            _logger.log("debug", "MAIN - (testsendIq) send - 'stanza'", stanza.root().toString());

            let sendIqResult = await rainbowSDK._core._xmpp.xmppClient.sendIq(stanza);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result : ", sendIqResult);
            let prettyStanza = stanza.root ? prettydata.xml(stanza.root().toString()) : stanza;
            _logger.log("debug", "MAIN - (testsendIq) sendIq result prettyStanza : ", prettyStanza);
            let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
            let jsonStanza = await getJsonFromXML(xmlNodeStr);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result jsonStanza : ", jsonStanza);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result jsonStanza.iq.query.identity : ", jsonStanza.iq.query.identity);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result jsonStanza.iq.query.feature : ", jsonStanza.iq.query.feature);
            //}).catch((error) => {
            //  _logger.log("error", "MAIN - CATCH Error !!! promise to getContactInfo failed result : ", error);
            //});
        }


        async testsetPresenceTo() {
            let presenceStr = "away"; // 'dnd', 'away', 'invisible' ('xa' on server side) or 'online'
            let setAway = true;
            setInterval(async () => {
                if (setAway) {
                    presenceStr = "away";
                    setAway = false;
                } else {
                    presenceStr = "online";
                    setAway = true;
                }
                let res = await rainbowSDK.presence.setPresenceTo(presenceStr);
                _logger.log("debug", "MAIN - testsetPresenceTo, set presence res : ", res);
            }, 20000);
        }

        async testsendIsTypingStateInConversation(state : boolean = true) {
            //let that = this;
            let contactEmailToSearch = "vincent01@vbe.test.openrainbow.net";
            // Retrieve a contact by its id
            let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
            // Retrieve the associated conversation
            let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
            // let now = new Date().getTime();
            // Send message
            let msgSent = await rainbowSDK.im.sendIsTypingStateInConversation(conversation, state);
            _logger.log("debug", "MAIN - sendIsTypingStateInConversation - result : ", msgSent);
            //_logger.log("debug", "MAIN - sendIsTypingStateInConversation - conversation : ", conversation);
        }

        //endregion Presence

        // region Telephony Voice Messages

        async testdeleteAllMyVoiceMessagesFromPbx() {
            // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
            // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
            let that = this;
            let res = await rainbowSDK.telephony.deleteAllMyVoiceMessagesFromPbx();
            _logger.log("debug", "MAIN - testdeleteAllMyVoiceMessagesFromPbx, res : ", res);
        }

        async testdeleteAVoiceMessageFromPbx() {
            // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
            // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
            let that = this;
            let messageId = "";
            let res = await rainbowSDK.telephony.deleteAVoiceMessageFromPbx(messageId);
            _logger.log("debug", "MAIN - testdeleteAVoiceMessageFromPbx, res : ", res);
        }

        async testgetAVoiceMessageFromPbx() {
            // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read
            // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
            let that = this;
            let messageId: string, messageDate: string, messageFrom: string;
            let res = await rainbowSDK.telephony.getAVoiceMessageFromPbx(messageId, messageDate, messageFrom);
            _logger.log("debug", "MAIN - testgetAVoiceMessageFromPbx, res : ", res);
        }

        async testgetDetailedListOfVoiceMessages() {
            // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list
            // GET /api/rainbow/telephony/v1.0/voicemessages
            let that = this;
            try {
                let res = await rainbowSDK.telephony.getDetailedListOfVoiceMessages();
                _logger.log("debug", "MAIN - testgetDetailedListOfVoiceMessages, res : ", res);
            } catch (err) {
                _logger.log("error", "MAIN - testgetDetailedListOfVoiceMessages, error : ", err);

            }
        }

        async testgetNumbersOfVoiceMessages() {
            // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
            // GET /api/rainbow/telephony/v1.0/voicemessages/counters
            let that = this;
            let res = await rainbowSDK.telephony.getNumbersOfVoiceMessages();
            _logger.log("debug", "MAIN - testgetNumbersOfVoiceMessages, res : ", res);
        }

        // endregion Telephony Voice Messages

        // region Bots

        async testgetRainbowSupportBotService() {
            let that = this;
            let res = await rainbowSDK.admin.getRainbowSupportBotService();
            _logger.log("debug", "MAIN - testgetRainbowSupportBotService, res : ", res);
        }

        async testgetABotServiceData() {
            let that = this;
            let res = await rainbowSDK.admin.getRainbowSupportBotService();
            _logger.log("debug", "MAIN - testgetABotServiceData, getRainbowSupportBotService res : ", res);
            let res2 = await rainbowSDK.admin.getABotServiceData(res.id);
            _logger.log("debug", "MAIN - testgetABotServiceData, getABotServiceData res2 : ", res2);

        }

        async testgetAllBotServices() {
            let that = this;
            let res = await rainbowSDK.admin.getAllBotServices();
            _logger.log("debug", "MAIN - testgetAllBotServices, res : ", res);
        }

        // endregion Bots

        //region PBXS

        async testgetAllPbxs() {
            let that = this;
            let res = await rainbowSDK.admin.getAllPbxs();
            _logger.log("debug", "MAIN - testgetAllPbxs, res : ", res);
        }

        //endregion PBXS

        //region RPC

        testFunctionName() {
            let fn1 = function (arg1) {
                return arg1;
            }
            _logger.log("debug", "MAIN - testcallRPCMethod_system, function name of fn1 : ", functionName(fn1));

            let fn2 = function fn2(arg1) {
                return arg1;
            }
            _logger.log("debug", "MAIN - testcallRPCMethod_system, function name of fn2 : ", functionName(fn2));

            let fn3 = (arg1) => {
                return arg1;
            }
            _logger.log("debug", "MAIN - testcallRPCMethod_system, function name of fn3 : ", functionName(fn3));
        }


        async testcallRPCMethod_system() {
            let that = this;
            let methodNames: any = await rainbowSDK.rpcoverxmpp.callRPCMethod(); // Call system.listMethods (default
            _logger.log("debug", "MAIN - testcallRPCMethod_system, methodNames : ", methodNames);
            for (const methodName of methodNames) {
                _logger.log("debug", "MAIN - testcallRPCMethod_system, methodName : ", methodName);
                let methodHelp: any = await rainbowSDK.rpcoverxmpp.callRPCMethod(undefined, "system.methodHelp", [methodName]);
                _logger.log("debug", "MAIN - testcallRPCMethod_system, methodName : ", methodName, ", methodHelp : ", methodHelp);
                let methodSignature: any = await rainbowSDK.rpcoverxmpp.callRPCMethod(undefined, "system.methodSignature", [methodName]);
                _logger.log("debug", "MAIN - testcallRPCMethod_system, methodName : ", methodName, ", methodSignature : ", methodSignature);
            }
        }

        async testaddRPCMethod() {
            let that = this;

            let resultOfAdd = await rainbowSDK.rpcoverxmpp.addRPCMethod("example.trace", (arg1, arg2, arg3, arg4, arg5) => {
                _logger.log("debug", "MAIN - example.trace, arg1 : ", arg1);
                _logger.log("debug", "MAIN - example.trace, arg2 : ", arg2);
                _logger.log("debug", "MAIN - example.trace, arg3 : ", arg3);
                _logger.log("debug", "MAIN - example.trace, arg4 : ", arg4);
                _logger.log("debug", "MAIN - example.trace, arg5 : ", arg5);
                let result = {
                    arg1,
                    arg2,
                    arg3,
                    arg4,
                    arg5
                }
                return result;
            }, "example.trace description", "example.trace help");
            _logger.log("debug", "MAIN - testaddRPCMethod, resultOfAdd : ", resultOfAdd);
        }

        async testcallRPCMethod_withParams() {
            let that = this;
            let param = [];

            await rainbowSDK.rpcoverxmpp.addRPCMethod("example.trace", (arg1, arg2, arg3, arg4, arg5, arg6, arg7) => {
                _logger.log("debug", "MAIN - example.trace, arg1 : ", arg1);
                _logger.log("debug", "MAIN - example.trace, arg2 : ", arg2);
                _logger.log("debug", "MAIN - example.trace, arg3 : ", arg3);
                _logger.log("debug", "MAIN - example.trace, arg4 : ", arg4);
                _logger.log("debug", "MAIN - example.trace, arg5 : ", arg5);
                _logger.log("debug", "MAIN - example.trace, arg6 : ", arg6);
                _logger.log("debug", "MAIN - example.trace, arg7 : ", arg7);
                let result = {
                    arg1,
                    arg2,
                    arg3,
                    arg4,
                    arg5,
                    arg6,
                    arg7
                }
                return result;
            }, "example.trace description", "example.trace help");

            let obj = {
                "firstName": "vincent",
                "lastName": "berder",
                "age": 20,
                "isEmployed": true,
            };
            param.push("hello array of number and array of string");
            param.push([1, 2, ["arg1", "arg2", {
                "propertyOfObjInTab1": "mypropertyOfObjInTab1",
                "propertyOfObjInTab2": "mypropertyOfObjInTab2"
            }]]);
            // param.push([1,2,["arg1", "arg2"]]);
            param.push("param3");
            param.push(undefined);
            param.push(obj);
            param.push({"propertyOne": "valueproperty"});
            param.push(["valArrayOne"]);

            let res = await rainbowSDK.rpcoverxmpp.callRPCMethod(undefined, "example.trace", param);
            _logger.log("debug", "MAIN - testcallRPCMethod_withParams, res : ", res);
        }

        //endregion RPC

        //region Customer Care

        async testsendCustomerCareReport() {
            let logId: string, filesPath: Array<string> = [], occurrenceDate: string, occurrenceDateTimezone: string,
                description: string, externalRef: string, device: string, version: string, deviceDetails: any;
            try {
                logId = "1234";

                filesPath.push("c:\\temp\\test.txt");
                filesPath.push("c:\\temp\\test2.txt");

                occurrenceDate = new Date().toLocaleString();
                occurrenceDateTimezone = "Europe/Paris";
                description = "test of log return by node SDK";
                externalRef = undefined;
                device = "web";
                version = "2.24.1";
                deviceDetails = undefined;

                let res = await rainbowSDK.admin.sendCustomerCareReport(logId, filesPath, occurrenceDate, occurrenceDateTimezone,
                    description, externalRef, device, version, deviceDetails);
                _logger.log("debug", "MAIN - testcallRPCMethod_withParams, res : ", res);
            } catch (err) {
                _logger.log("error", "MAIN - CATCH error.");
                _logger.log("internalerror", "MAIN - CATCH error !!! : ", err);
            }
        }

        //endregion Customer Care

        //region XMPP 

        async testsendPing() {
            /*
            <iq from='user2@pdevdv3os18f.corp.intuit.net'
to='user1@pdevdv3os18f.corp.intuit.net/BANL07R9AME9X' type='get' id='e2e1'>
<ping xmlns='urn:xmpp:ping'/>
</iq>
             */
            let that = this;
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net");
            let promiseList = []
            _logger.log("debug", "MAIN - (testsendPing) : START contact : ", contact.displayName);
            //await rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
            //_logger.log("debug", "MAIN - (testsendPing) getContactInformationByJID result : ", _contactFromServer);
            let pingResult = rainbowSDK._core._xmpp.sendPing(contact.jid);
            _logger.log("debug", "MAIN - (testsendPing) sendPing result : ", pingResult);
            //}).catch((error) => {
            //  _logger.log("error", "MAIN - CATCH Error !!! promise to getContactInfo failed result : ", error);
            //});
        }

        async testsendIq() {
            /*
    <iq type='result'
        from='romeo@montague.net/orchard'
        to='juliet@capulet.com/balcony'
        id='info4'>
      <query xmlns='http://jabber.org/protocol/disco#info'>
        <identity
            category='client'
            type='pc'
            name='Work PC'/>
        <feature var='jabber:iq:time'/>
        <feature var='jabber:iq:version'/>
      </query>
    </iq>
             */
            let that = this;
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net");
            let promiseList = []
            _logger.log("debug", "MAIN - (testsendIq) : START iter.");
            //await rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
            //_logger.log("debug", "MAIN - (testsendPing) getContactInformationByJID result : ", _contactFromServer);
            let id = xmppUtils.getUniqueMessageId();
            let stanza = xml("iq", {
                    "from": rainbowSDK._core._xmpp.fullJid,
                    "type": "result",
                    "to": rainbowSDK._core._xmpp.fullJid,
                    "id": id
                }, xml("query", {xmlns: 'http://jabber.org/protocol/disco#info'},
                    xml("identity", {category: 'client'}),
                    xml("feature", {var: 'jabber:iq:time'}),
                    xml("feature", {var: 'jabber:iq:version'})
                    )
            );
            _logger.log("debug", "MAIN - (testsendIq) send - 'stanza'", stanza.root().toString());

            let sendIqResult = await rainbowSDK._core._xmpp.xmppClient.sendIq(stanza);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result : ", sendIqResult);
            let prettyStanza = stanza.root ? prettydata.xml(stanza.root().toString()) : stanza;
            _logger.log("debug", "MAIN - (testsendIq) sendIq result prettyStanza : ", prettyStanza);
            let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
            let jsonStanza = await getJsonFromXML(xmlNodeStr);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result jsonStanza : ", jsonStanza);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result jsonStanza.iq.query.identity : ", jsonStanza.iq.query.identity);
            _logger.log("debug", "MAIN - (testsendIq) sendIq result jsonStanza.iq.query.feature : ", jsonStanza.iq.query.feature);
            //}).catch((error) => {
            //  _logger.log("error", "MAIN - CATCH Error !!! promise to getContactInfo failed result : ", error);
            //});
        }


        //endregion XMPP
        
        // region TimeOutManager

        async testtimeOutManagersetTimeout() {

            if (rainbowSDK.state==="ready") {
                await rainbowSDK.stop();
            }

            let timeOutManager = new TimeOutManager(_logger);

            function fn(id) {
                return () => {
                    _logger.log("debug", "MAIN - testtimeOutManagersetTimeout, id : ", id, " done at : ", new Date().toTimeString());
                }
            }

            _logger.log("debug", "MAIN - testtimeOutManagersetTimeout, start at : ", new Date().toTimeString());
            timeOutManager.setTimeout(fn("1"), 20000, "timer a 20 secondes");
            timeOutManager.setTimeout(fn("2"), 10000, "timer a 10 secondes");
            timeOutManager.listEveryTimeout();
            //setTimeout(timeOutManager.cleanNotInProgressTimeoutCache.bind(timeOutManager), 5000);
            //setTimeout(timeOutManager.cleanNotInProgressTimeoutCache.bind(timeOutManager), 15000);
            //setTimeout(timeOutManager.cleanNotInProgressTimeoutCache.bind(timeOutManager), 25000);
            setTimeout(timeOutManager.listEveryTimeout.bind(timeOutManager), 5000);
            setTimeout(timeOutManager.listEveryTimeout.bind(timeOutManager), 15000);
            setTimeout(timeOutManager.listEveryTimeout.bind(timeOutManager), 30000);
            /*
        timeOutManager.clearEveryTimeout();
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 5000);
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 15000);
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 20000);
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 25000);
        // */


        }

        async testtimeOutManagersetTimeoutPromised() {

            if (rainbowSDK.state==="ready") {
                await rainbowSDK.stop();
            }

            let timeOutManager = new TimeOutManager(_logger);

            function fn(id) {
                return () => {
                    _logger.log("debug", "MAIN - testtimeOutManagersetTimeoutPromised, id : ", id, " done at : ", new Date().toTimeString());
                }
            }

            _logger.log("debug", "MAIN - testtimeOutManagersetTimeoutPromised, start at : ", new Date().toTimeString());
            timeOutManager.setTimeoutPromised(fn("1"), 20000, "timer a 20 secondes").then(() => {
                _logger.log("debug", "MAIN - testtimeOutManagersetTimeoutPromised, After setTimeoutPromised done at : ", new Date().toTimeString());
            }).catch((err) => {
                _logger.log("error", "MAIN - testtimeOutManagersetTimeoutPromised, Catch setTimeoutPromised done at : ", new Date().toTimeString(), ", error : ", err);
            });
            //timeOutManager.setTimeout(fn("2"), 10000, "timer a 10 secondes") ;
            timeOutManager.listEveryTimeout();
            /*setTimeout(timeOutManager.cleanNotInProgressTimeoutCache.bind(timeOutManager), 5000);
        setTimeout(timeOutManager.cleanNotInProgressTimeoutCache.bind(timeOutManager), 15000);
        setTimeout(timeOutManager.cleanNotInProgressTimeoutCache.bind(timeOutManager), 25000);
        // */
            setTimeout(timeOutManager.listEveryTimeout.bind(timeOutManager), 30000);

            timeOutManager.clearEveryTimeout();
            /*
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 5000);
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 15000);
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 20000);
        setTimeout(timeOutManager.clearEveryTimeout.bind(timeOutManager), 25000);
        // */


        }

        // endregion TimeOutManager

        testgetRandomInt() {
            for (let i = 0; i < 1000; i++) {
                let test = false;
                let intRandom = getRandomInt(2);
                if (intRandom==1 || !test) {
                    console.log("getRandomInt(2)", intRandom);
                }
            }
        }

        testundefined() {
            try {
                // @ts-ignore
                _logger.log("debug", "MAIN - testundefined, start at : ", undefined.settings);
            } catch (err) {
                _logger.log("debug", "MAIN - testundefined, CATCH Error !!! : ", err);
            }
        }

        testresolveDns(url: string = 'www.amagicshop.com.tw') {
            Utils.resolveDns(url).then((result) => {
                _logger.log("debug", "MAIN - testresolveDns, result : ", result);
            }).catch((err) => {
                _logger.log("debug", "MAIN - testresolveDns, error : ", err);
            })
        }

        testGetEventsList() {
            let eventsTab = rainbowSDK.events.sdkPublicEventsName;
            for (const event in eventsTab) {
                _logger.log("debug", "MAIN - testGetEventsList, eventTab : ", eventsTab[event]);
            }
        }

        // testMultiPromise(500)
        async testMultiPromise(nb = 100) {
            let that = this;
            let contact = await rainbowSDK.contacts.getContactByLoginEmail("vincent.berder@al-enterprise.com");
            let nbRequestToSend = nb;
            let nbRequestSent = 0;
            let promiseList = []
            _logger.log("debug", "MAIN - (testMultiPromise) : START iter.");
            for (let i = 0; i < nbRequestToSend; i++) {
                //setTimeoutPromised(100).then(() => {
                let prom = rainbowSDK._core._rest.getContactInformationByJID(contact.jid).then((_contactFromServer: any) => {
                    nbRequestSent++;
                    _logger.log("debug", "MAIN - promise iter : ", _logger.colors.green(i), " : nb request sent ", nbRequestSent, "/", nbRequestToSend, " needed, result : contact : ", _contactFromServer.displayName);
                }).catch((error) => {
                    _logger.log("error", "MAIN - CATCH Error !!! promise to getContactInfo failed result : ", error);
                });
                promiseList.push(prom);
                //});
            }
            _logger.log("debug", "MAIN - (testMultiPromise) : STOP iter.");
            Promise.all(promiseList).then(() => {
                _logger.log("debug", "MAIN - (testMultiPromise) : ALL Promises done.");
            })
        }

        //region Start / Stop
        async testStartWithToken() {
            await rainbowSDK.stop();
            //let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1YmJkYzMzNzJjZjQ5NmMwN2RkODkxMjEiLCJsb2dpbkVtYWlsIjoidmluY2VudDAwQHZiZS50ZXN0Lm9wZW5yYWluYm93Lm5ldCJ9LCJhcHAiOnsiaWQiOiIyNzAzM2IxMDAxYmQxMWU4ODQzZDZmMDAxMzRlNTE4OSIsIm5hbWUiOiJSYWluYm93IG9mZmljaWFsIFdlYiBhcHBsaWNhdGlvbiJ9LCJpYXQiOjE1NzU0NjIyOTMsImV4cCI6MTU3Njc1ODI5M30.MA71vA1SDjf-PqYtrBnpEsPai1G4LvVFHFqolsQ6Dv3NukRpbHusEgyICvtBt0t9vJ3iuzupN-ltbrj1feSBR7VnGUf2i0QNXWRCSbOgHugQAKyRZTKt9lKphaYtEEJMjHrl7k8XO6E7E1nFLFWIgJw8pNbKSmJ84rCP-wyH6kh5N7ev10XBaZsC0kdDSgFH8M2T72xgc4gtLua5BIK8Oj6qdbpHSODaLptI7ehYdbU-Mw8ECZ_VFj8Cs6lfbQWOYKgHojkoLHakDf_6oVA40YarJZunYEasuuHKL5qiZJHGkgXHBxBUBGJbbDXu_DOkTognKMPSkAXjfnLmbk0kxw';
//let token = 'sdfsqfsqfsdfsdfgdf';
            let token = undefined;

//token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWY3NWEwZGQxZGI5NDY0ZDY3ZTMyNDYzIiwibG9naW5FbWFpbCI6ImxkYXAuY29ubmVjdG9yLmFkbWluMUBjbWEudGVzdC5vcGVucmFpbmJvdy5jb20ifSwiYXBwIjp7ImlkIjoiMDczMGY2ZTBhMGUwMTFlYjhlNjE3YjhlMWVkZTcwYjEiLCJuYW1lIjoiTERBUCAgY29ubmVjdG9yIn0sIm9hdXRoIjp7InRva2VuSWQiOiItZW1zcXpIa3F2IiwidHlwZSI6ImFjY2Vzc190b2tlbiIsInNjb3BlIjoiYWxsIiwiZ3JhbnQiOiJpbXBsaWNpdCJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJwcmVwcm9kdWN0aW9uIiwiZW52aXJvbm1lbnRBcGlVcmwiOiJodHRwczovL29wZW5yYWluYm93Lm5ldCJ9LCJpYXQiOjE2MjkxOTE1ODAsImV4cCI6MTYyOTE5MTg4MH0.p-GJWuIbJzb7eeY9Bi-4oq_t3PUxEr_E-0IrAad0LJbgXVprmIMiieBJamB4SXZhVSN2yqz68_I6yS7veFoLvcVU8coi4L_TebO8R5mnKB8Ocs66SqhjotggmXZNsWmaMNOGNCZRpaCJF9eHz04ux9BZTv7UJmfXpbg7xhce9GXDxT4OAoJYN7XYglymerueWZ8CArQ1Vtc_ahWdeOjp7dQYQ3DMKowmPO1_LdJTmcmAlwVZTG6RGZJNHckPyb4aGTesUYObJIyf_CHwZaIhyk-qcISCAPxzKG-x3qDZ_kCqzNGB3ojP9YkrBy1X5nTmDrt7UfV85gMaW5ew1AIFHQ";

//token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWMzZGY5Mzc3NmYzNTE4OTc4YzFkMDhhIn0sImFwcCI6eyJpZCI6IjIzNWFjNjAwMDk4MzExZWNiN2I4NGQ2OTk4MjVkNmQzIiwibmFtZSI6InZiZXJkZXItb2F1dGgtYXBwIn0sIm9hdXRoIjp7InRva2VuSWQiOiJMU19qV1VvcmpKIiwicmVmcmVzaFRva2VuSWQiOiI2MTJlNjhjMThkZDU3MTc4NTdmZTU1ZjIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwic2NvcGUiOiJhbGwiLCJncmFudCI6ImF1dGhvcml6YXRpb25fY29kZSJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJwcmVwcm9kdWN0aW9uIiwiZW52aXJvbm1lbnRBcGlVcmwiOiJodHRwczovL29wZW5yYWluYm93Lm5ldCJ9LCJpYXQiOjE2MzA0MzE0MjUsImV4cCI6MTYzMDQzMTcyNX0.DeWye85KexHllKsMwvJMfnC5ajl_NBXLzzE7DHaDuisrN3g3WA27C3Z1Saa7cGAQGixI5zK1DZScJPQaCC6Bv-gR3MJAfuyidF_HA5pjp7oHV40Dt6791NaMCQQDHhlpzbabDWL0pw9gqrO55y4bgtJ07EXg4j-H34nue6SxKfupXqmgx3A_4IM_rIn_HMMpNgooFOv2ktQIPNmRkXL8nUwyiyNIeIhCWtO8KQ4j23zXdgPP30jfS14vSEpRS19dlbCZ3dcdckj42cV8lPm_XEspk-F_x5DcjwGhtfvjrCcqWMn8mQ6x50lcnk_gfqB6K8lIrwWPZXw5PKdruHB40g";

            _logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK token : ", _logger.colors.green(token)); //logger.colors.green(JSON.stringify(result)));
            token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1NzMxZmU0Zjc4MjQwOTFiMzVmNWUyYjciLCJsb2dpbkVtYWlsIjoidmluY2VudC5iZXJkZXJAYWwtZW50ZXJwcmlzZS5jb20ifSwiZW52aXJvbm1lbnQiOnsiZW52aXJvbm1lbnROYW1lIjoib2ZmaWNpYWwiLCJlbnZpcm9ubWVudEFwaVVybCI6Imh0dHBzOi8vb3BlbnJhaW5ib3cuY29tIn0sImFwcCI6eyJpZCI6ImEyZjg5MDMwMDBmMDExZTg4NmQ5YjViYmQzMjYwNzkyIiwibmFtZSI6IlJhaW5ib3cgb2ZmaWNpYWwgV2ViIGFwcGxpY2F0aW9uIn0sInNhbWwiOnsibmFtZUlkIjoidmluY2VudC5iZXJkZXJAYWwtZW50ZXJwcmlzZS5jb20iLCJzZXNzaW9uSWR4IjoiXzZhZmM4Y2ZmLTg3OTEtNDZhNy1iZWEyLTAzODgwMGI4OGIwMCJ9LCJpYXQiOjE2MjkyMTEzMDQsImV4cCI6MTYzMDUwNzMwNH0.aP4LC9HX-QO1s9gf68-R08goe4472YQYEOErRc7_piaVRRPYchD6Fo3u3CXJNmwep5MJjnypuJKlttQ4mtMRHG5np3b_1peARj0qqMpePag4JiQZWV9ne9DwcwNRhxD8uTmYEDOezGH8hhpIvkqUfuHpR4ZW7Anff5SeVOHPWzwcJ5EUJQKQKKR3sEfEC_2PHd7fywEw0BDOxCIXFQjC1jG3_JbIgnIGOqTwOFdH9-ZaurDjj9mU2JL4l9GKPn_afi1YiBjoAm3Er7hM-x6XwHHdJBvl49SY-4p7uzhqFIFNnrZ-73Cihbo8RTyb0hnCdOB36p6HfiVytL6UwZHQCw";
            _logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK token : ", _logger.colors.green(token)); //logger.colors.green(JSON.stringify(result)));
            try {
                _logger.log("debug", "MAIN - rainbow SDK token decoded : ", jwtDecode(token));
            } catch (err) {
                _logger.log("error", "MAIN - rainbow SDK token decoded error : ", token);
            }

            await rainbowSDK.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK started with token result 2: ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            await rainbowSDK.stop();
        }

        async testTokenJwtDecode() {
            //let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1YmJkYzMzNzJjZjQ5NmMwN2RkODkxMjEiLCJsb2dpbkVtYWlsIjoidmluY2VudDAwQHZiZS50ZXN0Lm9wZW5yYWluYm93Lm5ldCJ9LCJhcHAiOnsiaWQiOiIyNzAzM2IxMDAxYmQxMWU4ODQzZDZmMDAxMzRlNTE4OSIsIm5hbWUiOiJSYWluYm93IG9mZmljaWFsIFdlYiBhcHBsaWNhdGlvbiJ9LCJpYXQiOjE1NzU0NjIyOTMsImV4cCI6MTU3Njc1ODI5M30.MA71vA1SDjf-PqYtrBnpEsPai1G4LvVFHFqolsQ6Dv3NukRpbHusEgyICvtBt0t9vJ3iuzupN-ltbrj1feSBR7VnGUf2i0QNXWRCSbOgHugQAKyRZTKt9lKphaYtEEJMjHrl7k8XO6E7E1nFLFWIgJw8pNbKSmJ84rCP-wyH6kh5N7ev10XBaZsC0kdDSgFH8M2T72xgc4gtLua5BIK8Oj6qdbpHSODaLptI7ehYdbU-Mw8ECZ_VFj8Cs6lfbQWOYKgHojkoLHakDf_6oVA40YarJZunYEasuuHKL5qiZJHGkgXHBxBUBGJbbDXu_DOkTognKMPSkAXjfnLmbk0kxw';
//let token = 'sdfsqfsqfsdfsdfgdf';
            let token = undefined;

//token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWY3NWEwZGQxZGI5NDY0ZDY3ZTMyNDYzIiwibG9naW5FbWFpbCI6ImxkYXAuY29ubmVjdG9yLmFkbWluMUBjbWEudGVzdC5vcGVucmFpbmJvdy5jb20ifSwiYXBwIjp7ImlkIjoiMDczMGY2ZTBhMGUwMTFlYjhlNjE3YjhlMWVkZTcwYjEiLCJuYW1lIjoiTERBUCAgY29ubmVjdG9yIn0sIm9hdXRoIjp7InRva2VuSWQiOiItZW1zcXpIa3F2IiwidHlwZSI6ImFjY2Vzc190b2tlbiIsInNjb3BlIjoiYWxsIiwiZ3JhbnQiOiJpbXBsaWNpdCJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJwcmVwcm9kdWN0aW9uIiwiZW52aXJvbm1lbnRBcGlVcmwiOiJodHRwczovL29wZW5yYWluYm93Lm5ldCJ9LCJpYXQiOjE2MjkxOTE1ODAsImV4cCI6MTYyOTE5MTg4MH0.p-GJWuIbJzb7eeY9Bi-4oq_t3PUxEr_E-0IrAad0LJbgXVprmIMiieBJamB4SXZhVSN2yqz68_I6yS7veFoLvcVU8coi4L_TebO8R5mnKB8Ocs66SqhjotggmXZNsWmaMNOGNCZRpaCJF9eHz04ux9BZTv7UJmfXpbg7xhce9GXDxT4OAoJYN7XYglymerueWZ8CArQ1Vtc_ahWdeOjp7dQYQ3DMKowmPO1_LdJTmcmAlwVZTG6RGZJNHckPyb4aGTesUYObJIyf_CHwZaIhyk-qcISCAPxzKG-x3qDZ_kCqzNGB3ojP9YkrBy1X5nTmDrt7UfV85gMaW5ew1AIFHQ";

//token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWMzZGY5Mzc3NmYzNTE4OTc4YzFkMDhhIn0sImFwcCI6eyJpZCI6IjIzNWFjNjAwMDk4MzExZWNiN2I4NGQ2OTk4MjVkNmQzIiwibmFtZSI6InZiZXJkZXItb2F1dGgtYXBwIn0sIm9hdXRoIjp7InRva2VuSWQiOiJMU19qV1VvcmpKIiwicmVmcmVzaFRva2VuSWQiOiI2MTJlNjhjMThkZDU3MTc4NTdmZTU1ZjIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwic2NvcGUiOiJhbGwiLCJncmFudCI6ImF1dGhvcml6YXRpb25fY29kZSJ9LCJlbnZpcm9ubWVudCI6eyJlbnZpcm9ubWVudE5hbWUiOiJwcmVwcm9kdWN0aW9uIiwiZW52aXJvbm1lbnRBcGlVcmwiOiJodHRwczovL29wZW5yYWluYm93Lm5ldCJ9LCJpYXQiOjE2MzA0MzE0MjUsImV4cCI6MTYzMDQzMTcyNX0.DeWye85KexHllKsMwvJMfnC5ajl_NBXLzzE7DHaDuisrN3g3WA27C3Z1Saa7cGAQGixI5zK1DZScJPQaCC6Bv-gR3MJAfuyidF_HA5pjp7oHV40Dt6791NaMCQQDHhlpzbabDWL0pw9gqrO55y4bgtJ07EXg4j-H34nue6SxKfupXqmgx3A_4IM_rIn_HMMpNgooFOv2ktQIPNmRkXL8nUwyiyNIeIhCWtO8KQ4j23zXdgPP30jfS14vSEpRS19dlbCZ3dcdckj42cV8lPm_XEspk-F_x5DcjwGhtfvjrCcqWMn8mQ6x50lcnk_gfqB6K8lIrwWPZXw5PKdruHB40g";

            _logger.log("debug", "MAIN - (testTokenJwtDecode) rainbow SDK token : ", _logger.colors.green(token)); //logger.colors.green(JSON.stringify(result)));
            token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudFJlbmV3ZWQiOjAsIm1heFRva2VuUmVuZXciOjcsInVzZXIiOnsiaWQiOiI1NzMxZmU0Zjc4MjQwOTFiMzVmNWUyYjciLCJsb2dpbkVtYWlsIjoidmluY2VudC5iZXJkZXJAYWwtZW50ZXJwcmlzZS5jb20ifSwiZW52aXJvbm1lbnQiOnsiZW52aXJvbm1lbnROYW1lIjoib2ZmaWNpYWwiLCJlbnZpcm9ubWVudEFwaVVybCI6Imh0dHBzOi8vb3BlbnJhaW5ib3cuY29tIn0sImFwcCI6eyJpZCI6ImEyZjg5MDMwMDBmMDExZTg4NmQ5YjViYmQzMjYwNzkyIiwibmFtZSI6IlJhaW5ib3cgb2ZmaWNpYWwgV2ViIGFwcGxpY2F0aW9uIn0sInNhbWwiOnsibmFtZUlkIjoidmluY2VudC5iZXJkZXJAYWwtZW50ZXJwcmlzZS5jb20iLCJzZXNzaW9uSWR4IjoiXzZhZmM4Y2ZmLTg3OTEtNDZhNy1iZWEyLTAzODgwMGI4OGIwMCJ9LCJpYXQiOjE2MjkyMTEzMDQsImV4cCI6MTYzMDUwNzMwNH0.aP4LC9HX-QO1s9gf68-R08goe4472YQYEOErRc7_piaVRRPYchD6Fo3u3CXJNmwep5MJjnypuJKlttQ4mtMRHG5np3b_1peARj0qqMpePag4JiQZWV9ne9DwcwNRhxD8uTmYEDOezGH8hhpIvkqUfuHpR4ZW7Anff5SeVOHPWzwcJ5EUJQKQKKR3sEfEC_2PHd7fywEw0BDOxCIXFQjC1jG3_JbIgnIGOqTwOFdH9-ZaurDjj9mU2JL4l9GKPn_afi1YiBjoAm3Er7hM-x6XwHHdJBvl49SY-4p7uzhqFIFNnrZ-73Cihbo8RTyb0hnCdOB36p6HfiVytL6UwZHQCw";
            _logger.log("debug", "MAIN - (testTokenJwtDecode) rainbow SDK token : ", _logger.colors.green(token)); //logger.colors.green(JSON.stringify(result)));
            try {
                let decodedToken = jwtDecode(token);
                _logger.log("debug", "MAIN - (testTokenJwtDecode) token decodedToken : ", decodedToken);

                _logger.log("debug", "MAIN - (testTokenJwtDecode) token full duration : ", msToTime((decodedToken.exp - decodedToken.iat) * 1000));
                // 1 jours = 86400000, 1 heure = 3600000, 1 min = 60000, 1 seconde = 1000
                let timToTest = 86400000 * 15 + 3600000 * 6 + 60000 * 24 + 1000 * 3;
                _logger.log("debug", "MAIN - (testTokenJwtDecode) timToTest full duration : ", msToTime(timToTest));
                /* await rainbowSDK._core._rest.getContactByToken(token).then(async (result2) => {
                    // Do something when the SDK is started
                   _logger.log("debug", "MAIN - (testStartWithToken) rainbow SDK started with token result 2: ",_logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
                }); // */

            } catch (err) {
                _logger.log("error", "MAIN - (testTokenJwtDecode) token decoded error : ", token);
            }
        }


// */

        async testStopAndStart() {
            let result = await this.start();
            _logger.log("debug", "MAIN - (testStopAndStart) rainbow SDK started first time : ", _logger.colors.green(result));
            await rainbowSDK.stop();
            let token = undefined;

            _logger.log("debug", "MAIN - (testStopAndStart) rainbow SDK stopped.");
            await rainbowSDK.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (testStopAndStart) rainbow SDK started second time : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            await rainbowSDK.stop();
        }

        async testsend429Appid() {

            _logger.log("debug", "MAIN - (testsend429Appid) rainbow SDK stopped.");
            let headers = rainbowSDK._core._rest.getLoginHeader();
            headers["x-rainbow-client-id"] = "098b3333e3f254ddbce01e2311edb8dec";
            await rainbowSDK._core._rest.http.get("/api/rainbow/authentication/v1.0/login", headers, undefined).then(
                async (result) => {
                    _logger.log("debug", "MAIN - (testsend429Appid) rainbow get result : ", _logger.colors.green(result));
                }
            ).catch(async error => {
                _logger.log("error", "MAIN - (testsend429Appid) CATCH Error !!! : ", _logger.colors.green(error));
                let res = await rainbowSDK.admin.getAllBotServices().then(() => {
                    _logger.log("debug", "MAIN - (testsend429Appid), getAllBotServices res : ", res);
                }).catch((error2) => {
                    _logger.log("error", "MAIN - (testsend429Appid), getAllBotServices error2 : ", error2);
                });
                let connectionStatus = await rainbowSDK.getConnectionStatus().catch(err => {
                    return err;
                });
                _logger.log("debug", "MAIN - [testgetConnectionStatus    ] :: connectionStatus : ", connectionStatus);

            });
        }

        async testsendMultiHttpRequest() {

            _logger.log("debug", "MAIN - (testsendMultiHttpRequest) .");
            let headers = rainbowSDK._core._rest.getRequestHeader();

            for (let i = 0; i < 102; i++) {
                rainbowSDK._core._rest.http.get("/api/rainbow/enduser/v1.0/users/jids/209c7d9cf1fe4b818ae4004899cbd03c@openrainbow.com", headers, undefined).then(
                    async (result) => {
                        _logger.log("debug", "MAIN - (testsendMultiHttpRequest) rainbow get result : ", _logger.colors.green(result));
                    }
                ).catch(async error => {
                    _logger.log("error", "MAIN - (testsendMultiHttpRequest) CATCH Error !!! : ", _logger.colors.green(error));
                    let connectionStatus = await rainbowSDK.getConnectionStatus().catch(err => {
                        return err;
                    });
                    _logger.log("debug", "MAIN - [testsendMultiHttpRequest    ] :: connectionStatus : ", connectionStatus);

                });
            }
        }

        async testGotRequest() {
            let url = "/api/rainbow/enduser/v1.0/settings/apis";
            // Mock API response
            //nock("https://some.api").get(url).reply(200, { "data": {"stuff": "happened" }});
            //notok nock("https://some.api").get(url).reply(500, { "code": 500, "error":"error", "data": {"stuff": "happened", "errorDetails":500, "errorDetailsCode": "error details code." }});
            //notok nock("https://some.api").get(url).replyWithError({code: 'ETIMEDOUT', "errorDetails":500, "errorDetailsCode": "error details code."});
            //nock("https://some.api").get(url).replyWithError({code: 'ETIMEDOUT'});
            //notok nock("https://some.api").get(/.*/).delayConnection(500).replyWithError({code: 'ETIMEDOUT'});
            /*
            nock("https://some.api").get(url).delayConnection(500).replyWithError({code: 'ETIMEDOUT', "errorMessage":"ETIMEDOUT"});
            nock("https://some.api").get(url).delayConnection(500).replyWithError({code: 'ETIMEDOUT', "errorMessage":"ETIMEDOUT"});
            nock("https://some.api").get(url).delayConnection(500).replyWithError({code: 'ETIMEDOUT', "errorMessage":"ETIMEDOUT"});
            // */

            //nock("https://some.api").get(url).delayConnection(500).reply(429,{code: 429, "errorMessage":'Too Many Requests (HAP429).\n'});
            nock("https://some.api").get(url).delayConnection(500).reply(429,{code: 429, "errorMessage":'Too Many Requests (HAP429).\n'});
            //nock("https://some.api").get(url).delayConnection(500).reply(429,{code: 429, "errorMessage":'Too Many Requests (HAP429).\n'});

            //nock("https://some.api").get(url).delayConnection(500).reply(501,{code: 501, "errorMessage":'Internal Error Server 501.\n'});
            nock("https://some.api").get(url).reply(200, { "data": {"stuff": "happened" }});
            // */
            //notok nock("https://some.api").get(url).delayConnection(500).reply(200, {"code": 'ETIMEDOUT'});
            _logger.log("info", "MAIN - (testGotRequest) - nock.activeMocks() : ", nock.activeMocks());

            rainbowSDK._core._http.serverURL = "https://some.api:443";

            await rainbowSDK._core._http.start() ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            _logger.log("info", "MAIN - (testGotRequest) (getApisSettings) REST url : ", url);
            let headers = rainbowSDK._core._rest.getRequestHeader();

            let nbTryBeforeFailed:number = 0, timeBetweenRetry :number=1000;
            let res = await rainbowSDK._core._http.get(url, headers, undefined,"",  nbTryBeforeFailed, timeBetweenRetry).then((json) => {
                _logger.log("info", "MAIN - (testGotRequest) (getApisSettings) successfull");
                _logger.log("info", "MAIN - (testGotRequest) (getApisSettings) REST result : ", json);
                return (json?.data);
            }).catch(function (err) {
                _logger.log("error", "MAIN - (testGotRequest) (getApisSettings) error");
                _logger.log("error", "MAIN - (testGotRequest) (getApisSettings) error : ", err);
                return (err);
            });
            _logger.log("info", "MAIN - (testGotRequest) - res : ", _logger.stripStringForLogs(res));
            nock.cleanAll();
            nock.restore();
        }

        async testGetRequestOnServer() {
            // To be use with the "serverweb" project started and listenning on port 8443.
            let url = "/request";
            _logger.log("info", "MAIN - (testGetRequestOnServer) - url : ", url);

            let serverURLSaved = rainbowSDK._core._http.serverURL;
            rainbowSDK._core._http.serverURL = "https://localhost:8443";

            /*
            await rainbowSDK._core._http.start() ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            url = urlParamsTab[0];
            // */

            _logger.log("info", "MAIN - (testGetRequestOnServer) (get) REST url : ", url);
            let headers = rainbowSDK._core._rest.getRequestHeader();
            let param =  {"code":403,"message":"Forbidden"};
            let nbTryBeforeFailed:number = 0, timeBetweenRetry :number=1000;
            let res = await rainbowSDK._core._http.get(url, headers, param, 'application/json',  nbTryBeforeFailed, timeBetweenRetry).then((json) => {
                _logger.log("info", "MAIN - (testGetRequestOnServer) (get) successfull");
                _logger.log("info", "MAIN - (testGetRequestOnServer) (get) REST result : ", json);
                //return (json?.data);
                rainbowSDK._core._http.serverURL = serverURLSaved;
            }).catch(function (err) {
                _logger.log("error", "MAIN - (testGetRequestOnServer) (get) error");
                _logger.log("error", "MAIN - (testGetRequestOnServer) (get) error : ", err);
                //return (err);
                rainbowSDK._core._http.serverURL = serverURLSaved;
            });
            _logger.log("info", "MAIN - (testGetRequestOnServer) - res : ", _logger.stripStringForLogs(res));
        }

        async testUserAppDataPath() {
            let userAPPDATAPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") ;
            _logger.log("debug", "MAIN - (testUserAppDataPath) - userAPPDATAPath : ", userAPPDATAPath, ", process.env.HOME : ", process.env.HOME);

            function loadConfigFromIniFile(userHomePath) {
                let config :any = {};
                try {
                    let readResult = fs.readFileSync(userHomePath + '/config.ini', 'utf-8');
                        config = ini.parse(readResult);
                        _logger.log("debug", "MAIN - (testUserAppDataPath) loadConfigFromIniFile - config : ", config, ", config.XMPP.xmppRessourceName : ", config?.XMPP?.xmppRessourceName);
                } catch (err) {
                    _logger.log("warn", "MAIN - (testUserAppDataPath) loadConfigFromIniFile - err : ", err);
                    if (err.code === 'ENOENT') {
                        let generatedRandomId = xmppUtils.generateRandomID();
                        config["xmppRessourceName"] = generatedRandomId;
                        fs.writeFileSync(userHomePath + '/config.ini', ini.stringify(config, {section: 'XMPP'}));
                    }
                }
                return config;
            }

            try {
                if (userAPPDATAPath) {
                    userAPPDATAPath += "/Rainbow/RainbowNodeSdkDir";
                    _logger.log("debug", "MAIN - (testUserAppDataPath) - userAPPDATAPath : ", userAPPDATAPath);
                    if (!fs.existsSync(userAPPDATAPath)) {
                        _logger.log("debug", "MAIN - (testUserAppDataPath) - does not exists and can not be created, so can do the treatment.");
                        if (fs.mkdirSync(userAPPDATAPath, {recursive: true})) {
                            _logger.log("debug", "MAIN - (testUserAppDataPath) - mkdirSync succeed, so can do the treatment.");
                            loadConfigFromIniFile(userAPPDATAPath);
                        } else {
                            _logger.log("error", "MAIN - (testUserAppDataPath) - mkdirSync failed and can not be created, so can do the treatment.");
                        }
                    } else {
                        _logger.log("debug", "MAIN - (testUserAppDataPath) - exists, so can do the treatment.");
                        loadConfigFromIniFile(userAPPDATAPath);
                    }
                } else {

                }
            } catch (err) {
                if (err.code !== 'EEXIST') throw err
            }
        }

        testgetStoreStanzaValue() {
            let storeStanzaValue = getStoreStanzaValue(true, undefined, undefined);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, undefined, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, undefined, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, undefined, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, undefined, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, undefined, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, undefined, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, undefined, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, undefined, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, undefined, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoStore, undefined);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoStore, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoStore, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoPermanentStore, undefined);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoPermanentStore, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.NoPermanentStore, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.StoreTwinSide, undefined);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.StoreTwinSide, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.StoreTwinSide, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, undefined);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, DataStoreType.UsestoreMessagesField, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, undefined, undefined);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(true, undefined, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, undefined, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, undefined, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, undefined, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, undefined, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, undefined, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, undefined, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, undefined, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, undefined, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoStore, undefined);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoStore, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoStore, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoPermanentStore, undefined);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoPermanentStore, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.NoPermanentStore, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.StoreTwinSide, undefined);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.StoreTwinSide, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.StoreTwinSide, DataStoreType.UsestoreMessagesField) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, undefined);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, undefined) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.NoStore);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.NoStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.NoPermanentStore);
            if (storeStanzaValue != DataStoreType.NoPermanentStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.NoPermanentStore) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.StoreTwinSide);
            if (storeStanzaValue != DataStoreType.StoreTwinSide) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.StoreTwinSide) wrong value!");
            }
            storeStanzaValue = getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.UsestoreMessagesField);
            if (storeStanzaValue != DataStoreType.NoStore) {
                _logger.log("error", "MAIN - (testgetStoreStanzaValue) - storeStanzaValue : " + storeStanzaValue + ", getStoreStanzaValue(false, DataStoreType.UsestoreMessagesField, DataStoreType.UsestoreMessagesField) wrong value!");
            }

        }
        
        async test5Start() {
            _logger.log("debug", "MAIN - (test5Start) __ begin __.");
            let options1: any = {};
            let options2: any = {};
            let options3: any = {};
            let options4: any = {};

            Object.assign(options1, options);
            options1.logs.customLabel = options1.credentials.login + "_1";
            options1.logs.file.customFileName = "R-SDK-Node-" + options1.credentials.login + "_1";
            let rainbowSDK1 = new RainbowSDK(options1);
            rainbowSDK1.events.on("rainbow_onconnectionerror", () => {
                // do something when the SDK has been started
                _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
            });
            rainbowSDK1.events.on("rainbow_onerror", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
                rainbowSDK1 = undefined;
            });

            Object.assign(options2, options);
            options2.logs.customLabel = options2.credentials.login + "_2";
            options2.logs.file.customFileName = "R-SDK-Node-" + options2.credentials.login + "_2";
            let rainbowSDK2 = new RainbowSDK(options2);
            rainbowSDK2.events.on("rainbow_onconnectionerror", () => {
                // do something when the SDK has been started
                _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
            });
            rainbowSDK2.events.on("rainbow_onerror", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
                rainbowSDK2 = undefined;
            });

            Object.assign(options3, options);
            options3.logs.customLabel = options3.credentials.login + "_3";
            options3.logs.file.customFileName = "R-SDK-Node-" + options3.credentials.login + "_3";
            let rainbowSDK3 = new RainbowSDK(options3);
            rainbowSDK3.events.on("rainbow_onconnectionerror", () => {
                // do something when the SDK has been started
                _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
            });
            rainbowSDK3.events.on("rainbow_onerror", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
                rainbowSDK3 = undefined;
            });

            Object.assign(options4, options);
            options4.logs.customLabel = options4.credentials.login + "_4";
            options4.logs.file.customFileName = "R-SDK-Node-" + options4.credentials.login + "_4";
            let rainbowSDK4 = new RainbowSDK(options4);
            rainbowSDK4.events.on("rainbow_onconnectionerror", () => {
                // do something when the SDK has been started
                _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
            });
            rainbowSDK4.events.on("rainbow_onerror", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
                rainbowSDK4 = undefined;
            });
// */

            await rainbowSDK.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (test5Start) rainbow SDK started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            await rainbowSDK1.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (test5Start) rainbow SDK 1 started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            // */

            await rainbowSDK2.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (test5Start) rainbow SDK 2 started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            await rainbowSDK3.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (test5Start) rainbow SDK 3 started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            await rainbowSDK4.start(token).then(async (result2) => {
                // Do something when the SDK is started
                _logger.log("debug", "MAIN - (test5Start) rainbow SDK 4 started : ", _logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
            });
            // */
            // await rainbowSDK.stop();
        }

        startWSOnly() {
            rainbowSDK.start(token).then(async (result: any) => {
//Promise.resolve({}).then(async(result: any) => {
                try {
                    // Do something when the SDK is started
                    connectedUser = result.loggedInUser;
                    token = result.token;
                    _logger.log("debug", "MAIN - rainbow SDK started with result 1 : ", result); //logger.colors.green(JSON.stringify(result)));
                    console.log("MAIN - rainbow SDK started with result 1 : ", inspect(result)); //logger.colors.green(JSON.stringify(result)));
                    _logger.log("debug", "MAIN - rainbow SDK started with credentials result 1 : ", _logger.colors.green(connectedUser)); //logger.colors.green(JSON.stringify(result)));

                    //let startDuration = Math.round(new Date() - startDate);
                    let startDuration = result.startDuration;
                    // that.stats.push({ service: "telephonyService", startDuration: startDuration });
                    _logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
                    console.log("MAIN === STARTED (" + startDuration + " ms) ===");

                    rainbowSDK.stop().then(() => {
                        _logger.log("debug", "MAIN - rainbow SDK startedand stopped, now we start WS Only : token : ", token, ", connectedUser : ", JSON.stringify(connectedUser)); //logger.colors.green(JSON.stringify(result)));
                        rainbowSDK.startWSOnly(token, connectedUser).then((result) => {
                            // Do something when the SDK is started
                            _logger.log("debug", "MAIN - rainbow SDK started WS Only result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
                        })
                        ;
                    }); // */
                } catch (err) {
                    console.log("MAIN - Error during starting : ", inspect(err));
                }
            });
        }

        startMockXMPP() {
            let options1: any = {};

            Object.assign(options1, options);
            options1.logs.customLabel = options1.credentials.login + "_1";
            options1.logs.file.customFileName = "R-SDK-Node-" + options1.credentials.login + "_1";
            let rainbowSDK1 = new RainbowSDK(options1);

            // XMPP WebSocket Server
            _logger.log("debug", "MAIN - (startMockXMPP) going to MockServer : " + "wss://openrainbow.net:443/websocket");

            class XmppWebSocket extends WS {
                constructor(address, protocols) {
                    super(address, protocols);
                }
            }

// @ts-ignore
            global.WebSocket = XmppWebSocket;

            let isAuthenticated = false;
            let resource = "";
            let alice = {loggedInUser: {jid_im: "98091bcde14d4eadac763d9cc0851719@openrainbow.net"}};
            //alice.loggedInUser.jid_im

            const mockServer = new MockServer("wss://openrainbow.net:443/websocket");
            mockServer.on("connection", (socket) => {
                _logger.log("debug", "MAIN - (startMockXMPP) (on) MockServer.connection : " + "socket : " + socket);
                socket.on('message', (message: string) => {
                    _logger.log("debug", "MAIN - (startMockXMPP) (on) we have intercepted the message and can assert on it " + "socket : " + socket);
                    // t.is(data, 'test message from app', 'we have intercepted the message and can assert on it');
                    //socket.send('test message from mock server');
                    if (message.startsWith("<open")) {
                        socket.send("<open xmlns='urn:ietf:params:xml:ns:xmpp-framing' to='openrainbow.net' version='1.0'/>");
                        if (!isAuthenticated) {
                            socket.send("<stream:features xmlns:stream='http://etherx.jabber.org/streams'><c xmlns='http:" +
                                "//jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/eja" +
                                "bberd/' ver='XOFO0R0cqi8p4qFlpdNxjjjK4Zs='/><register xmlns='http://jabber.org/f" +
                                "eatures/iq-register'/><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mech" +
                                "anism>PLAIN</mechanism><mechanism>DIGEST-MD5</mechanism><mechanism>SCRAM-SHA-1</" +
                                "mechanism></mechanisms></stream:features>");
                        } else {
                            socket.send("<stream:features xmlns:stream='http://etherx.jabber.org/streams'><c xmlns='http:" +
                                "//jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/eja" +
                                "bberd/' ver='XOFO0R0cqi8p4qFlpdNxjjjK4Zs='/><bind xmlns='urn:ietf:params:xml:ns:" +
                                "xmpp-bind'/><session xmlns='urn:ietf:params:xml:ns:xmpp-session'><optional/></se" +
                                "ssion><ver xmlns='urn:xmpp:features:rosterver'/><sm xmlns='urn:xmpp:sm:2'/><sm x" +
                                "mlns='urn:xmpp:sm:3'/><csi xmlns='urn:xmpp:csi:0'/></stream:features>");
                        }
                    }
                    if (message.startsWith("<auth")) {
                        socket.send("<challenge xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>cj1kNDFkOGNkOThmMDBiMjA0ZTk4" +
                            "MDA5OThlY2Y4NDI3ZS93UzdkNlNDYmsyUXRFM0VUd251V0E9PSxzPU52NERxZ1dmb09ESG5YUlJCeWpE" +
                            "REE9PSxpPTQwOTY=</challenge>");
                        socket.send("<open xmlns=\"urn:ietf:params:xml:ns:xmpp-framing\" version=\"1.0\" default:lang" +
                            "=\"en\" id=\"13260960624462208793\" from=\"openrainbow.net\"\/>");
                    }
                    if (message.startsWith("<response")) {
                        socket.send("<success xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>dj1KM3d3dTc2WWU4THVEM1FOWVNWZj" +
                            "dTNUlHS3c9</success>");
                        isAuthenticated = true;
                    }
                    if (message.startsWith("<iq type=\"set\"")) {
                        var id = message.match(/id="(.*)" /);
                        if (message.indexOf("bind") > -1) {
                            let resource = message.match(/<resource>(.*)<\/resource>/);
                            socket.send("<iq xmlns='jabber:client' id='" + id[1] + "' type='result'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><jid>" + alice.loggedInUser.jid_im + "/" + resource[1] + "</jid></bind></iq>");
                        } else if (message.indexOf("session") > -1) {
                            socket.send("<iq xmlns='jabber:client' type='result' id='" + id[1] + "'/>");
                        } else if (message.indexOf("carbon") > -1) {
                            socket.send("<iq xmlns='jabber:client' from='" + alice.loggedInUser.jid_im + "' to='" + alice.loggedInUser.jid_im + "/" + resource[1] + "' id='" + id[1] + "' type='result'/>")
                        }
                    }
                    if (message.startsWith("<presence")) {
                        socket.send("<presence xmlns='jabber:client' from='" + alice.loggedInUser.jid_im + "/" + resource[1] + "' to='" + alice.loggedInUser.jid_im + "/" + resource[1] + "'><priority>5</priority></presence>");
                    }
                });
                // */
            });

            /*
         // read XMPP flow
         const data = readFileSync('./config.json');
         console.log(JSON.parse(String(data)));
         // */

            mockServer.on("message", message => {
                _logger.log("debug", "MAIN - (startMockXMPP) (on) message : ", message);
            });


            rainbowSDK1.events.on("rainbow_onconnectionerror", () => {
                // do something when the SDK has been started
                _logger.log("debug", "MAIN - (rainbow_onconnectionerror) - rainbow failed to start.");
            });
            rainbowSDK1.events.on("rainbow_onerror", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onerror)  - rainbow event received. data", data, " destroy and recreate the SDK.");
                rainbowSDK1 = undefined;
            });
            const path = './xmpp.txt';
            writeFileSync(path, "", "utf8");

            rainbowSDK1.events.on("rainbow_onxmmpeventreceived", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onxmmpeventreceived) - rainbow failed to start.");
                try {
                    appendFileSync(path, "in:" + data + "\n");
                    console.log('Data successfully saved to disk');
                } catch (error) {
                    console.log('An error has occurred ', error);
                }
            });
            rainbowSDK1.events.on("rainbow_onxmmprequestsent", (data) => {
                _logger.log("debug", "MAIN - (rainbow_onxmmprequestsent) - rainbow failed to start.");
                try {
                    appendFileSync(path, "out:" + data + "\n");
                    console.log('Data successfully saved to disk');
                } catch (error) {
                    console.log('An error has occurred ', error);
                }
            });


            rainbowSDK1.start(token).then(async (result: any) => {
//Promise.resolve({}).then(async(result: any) => {
                try {
                    // Do something when the SDK is started
                    connectedUser = result.loggedInUser;
                    token = result.token;
                    _logger.log("debug", "MAIN - rainbow SDK started with result 1 : ", result); //logger.colors.green(JSON.stringify(result)));
                    console.log("MAIN - rainbow SDK started with result 1 : ", inspect(result)); //logger.colors.green(JSON.stringify(result)));
                    _logger.log("debug", "MAIN - rainbow SDK started with credentials result 1 : ", _logger.colors.green(connectedUser)); //logger.colors.green(JSON.stringify(result)));

                    //let startDuration = Math.round(new Date() - startDate);
                    let startDuration = result.startDuration;
                    // that.stats.push({ service: "telephonyService", startDuration: startDuration });
                    _logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
                    console.log("MAIN === STARTED (" + startDuration + " ms) ===");
                } catch (err) {
                    console.log("MAIN - Error during starting : ", inspect(err));
                }
            }).catch((err) => {
                console.log("MAIN - Error during starting : ", inspect(err));
            }); // */
        }

        testsetCredentialPassword() {
            rainbowSDK.setCredentialPassword("Password_123");
        }

        start() {
            rainbowSDK.start(token).then(async (result: any) => {
//Promise.resolve({}).then(async(result: any) => {
                try {
                    // Do something when the SDK is started
                    connectedUser = result.loggedInUser;
                    token = result.token;
                    _logger.log("info", "MAIN - rainbow SDK started with result 1 : ", result); //logger.colors.green(JSON.stringify(result)));
                    console.log("MAIN - rainbow SDK started with result 1 : ", inspect(result)); //logger.colors.green(JSON.stringify(result)));
                    _logger.log("info", "MAIN - rainbow SDK started with credentials result 1 : ", _logger.colors.green(connectedUser)); //logger.colors.green(JSON.stringify(result)));
                    /*
                            let companyInfo = await rainbowSDK.contacts.getCompanyInfos().catch((err) => {
                               _logger.log("warn", "MAIN - failed to retrieve company infos :" , err);
                            });

                           _logger.log("debug", "MAIN - company infos :" , companyInfo);
                // */
                    /*
                        await rainbowSDK.stop().then((result)=>{
                           _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                        });
                        await rainbowSDK.start(token).then(async(result2) => {
                            // Do something when the SDK is started
                           _logger.log("debug", "MAIN - rainbow SDK started result 2: ",_logger.colors.green(result2)); //logger.colors.green(JSON.stringify(result)));
                            await rainbowSDK.stop().then((result)=>{
                               _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                            });
                            await rainbowSDK.start(token).then(async (result3) => {
                                // Do something when the SDK is started
                               _logger.log("debug", "MAIN - rainbow SDK started result 3 : ",_logger.colors.green(result3)); //logger.colors.green(JSON.stringify(result)));
                                await rainbowSDK.stop().then((result)=>{
                                   _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                });
                                await rainbowSDK.start(token).then(async (result4) => {
                                    // Do something when the SDK is started
                                   _logger.log("debug", "MAIN - rainbow SDK started result 4 : ",_logger.colors.green(result4)); //logger.colors.green(JSON.stringify(result)));
                                    await rainbowSDK.stop().then((result)=>{
                                       _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                    });
                                    await rainbowSDK.start(token).then(async (result5) => {
                                        // Do something when the SDK is started
                                       _logger.log("debug", "MAIN - rainbow SDK started result 5 : ",_logger.colors.green(result5)); //logger.colors.green(JSON.stringify(result)));
                                        await rainbowSDK.stop().then((result)=>{
                                           _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                        });
                                        await rainbowSDK.start(token).then(async (result6) => {
                                            // Do something when the SDK is started
                                           _logger.log("debug", "MAIN - rainbow SDK started result 6 : ",_logger.colors.green(result6)); //logger.colors.green(JSON.stringify(result)));
                                            await rainbowSDK.stop().then((result)=>{
                                               _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                            });
                                            await rainbowSDK.start(token).then(async (result7) => {
                                                // Do something when the SDK is started
                                               _logger.log("debug", "MAIN - rainbow SDK started result 7 : ",_logger.colors.green(result7)); //logger.colors.green(JSON.stringify(result)));
                                                await rainbowSDK.stop().then((result)=>{
                                                   _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                });
                                                await rainbowSDK.start(token).then(async (result8) => {
                                                    // Do something when the SDK is started
                                                   _logger.log("debug", "MAIN - rainbow SDK started result 8 : ",_logger.colors.green(result8)); //logger.colors.green(JSON.stringify(result)));
                                                    await rainbowSDK.stop().then((result)=>{
                                                       _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                    });
                                                    await rainbowSDK.start(token).then(async (result9) => {
                                                        // Do something when the SDK is started
                                                       _logger.log("debug", "MAIN - rainbow SDK started result 9 : ",_logger.colors.green(result9)); //logger.colors.green(JSON.stringify(result)));
                                                        await rainbowSDK.stop().then((result)=>{
                                                           _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                        });
                                                        await rainbowSDK.start(token).then(async (result10) => {
                                                            // Do something when the SDK is started
                                                           _logger.log("debug", "MAIN - rainbow SDK started result 10 : ",_logger.colors.green(result10)); //logger.colors.green(JSON.stringify(result)));
                                                            await rainbowSDK.stop().then((result)=>{
                                                               _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                            });
                                                            await rainbowSDK.start(token).then(async (result11) => {
                                                                // Do something when the SDK is started
                                                               _logger.log("debug", "MAIN - rainbow SDK started result 11 : ",_logger.colors.green(result11)); //logger.colors.green(JSON.stringify(result)));
                                                                await rainbowSDK.stop().then((result)=>{
                                                                   _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                                                                });
                                                                await rainbowSDK.start(token).then(async (result12) => {
                                                                    // Do something when the SDK is started
                                                                   _logger.log("debug", "MAIN - rainbow SDK started result 12 : ",_logger.colors.green(result12)); //logger.colors.green(JSON.stringify(result)));
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
                       _logger.log("debug", "MAIN - [start    ] :: contact : ", contact);
                    });
                } else {
                   _logger.log("debug", "MAIN - [start    ] :: contacts list empty");
                }
                // */

                    /*let roster = await rainbowSDK.contacts.getRosters();
               _logger.log("debug", "MAIN - getRosters - roster : ", roster);

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
                    _logger.log("debug", "MAIN - dog1", dog1);


                    //let startDuration = Math.round(new Date() - startDate);
                    let startDuration = result.startDuration;
                    // that.stats.push({ service: "telephonyService", startDuration: startDuration });
                    _logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
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
                    //commandLineInteraction();

                    /* while (true) {
                     readline.question("Command>", cmd => {
                         //console.log(`run ${cmd}!`);
                        _logger.log("debug", "MAIN - run : ", cmd); //logger.colors.green(JSON.stringify(result)));

                         try {
                             if (cmd === "by") {
                                 process.exit(0);
                             }
                             eval(cmd);
                         } catch (e) {
                            _logger.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));

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
                               _logger.log("debug", "MAIN - Bubble 5da6d969e6ca5a023da44edd : ", bubble);
                            }
                        }
                       _logger.log("debug", "MAIN - Bubbles count = ", bubblesCount, " bubblesInfos : ", bubblesInfos);
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
                                                  _logger.log("debug", "MAIN - [start    ] :: getBubbleConversation request ok");
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
                       _logger.log("debug", "MAIN - [makeCallByPhoneNumber] ", data);
                    }).catch((error) => {
                       _logger.log("debug", "MAIN - [makeCallByPhoneNumber] error ", error);
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
                       _logger.log("debug", "MAIN - sendMessageToJid.then() message sent", msg);
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
                       _logger.log("debug", "MAIN - rainbow SDK started result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
                        let list = rainbowSDK.contacts.getAll();
                        if (list) {
                            list.forEach(function (contact) {
                               _logger.log("debug", "MAIN - [start    ] :: contact : ", contact);
                            });
                        } else {
                           _logger.log("debug", "MAIN - [start    ] :: contacts list empty");
                        }


                    })
                    ;
                }); // */
                    /*
                rainbowSDK.stop().then((result)=>{
                   _logger.log("debug", "MAIN - rainbow SDK stop : ", result); //logger.colors.green(JSON.stringify(result)));
                });
                // */
                    /*.then(()=>{
                   rainbowSDK.start().then(()=>{
                      _logger.log("debug", "MAIN - rainbow SDK started step_2 result : ", JSON.stringify(result)); //logger.colors.green(JSON.stringify(result)));
                       let list = rainbowSDK.contacts.getAll();
                       if (list) {
                           list.forEach(function (contact) {
                              _logger.log("debug", "MAIN - [start    step_2] :: contact : ", contact);
                           });
                       } else {
                          _logger.log("debug", "MAIN - [start    step_2] :: contacts list empty");
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
        }

        startstop() {
            rainbowSDK.start(token).then(async (result: any) => {
                try {
                    // Do something when the SDK is started
                    connectedUser = result.loggedInUser;
                    token = result.token;
                    _logger.log("info", "MAIN - rainbow SDK started with result 1 : ", result); //logger.colors.green(JSON.stringify(result)));
                    console.log("MAIN - rainbow SDK started with result 1 : ", inspect(result)); //logger.colors.green(JSON.stringify(result)));
                    _logger.log("info", "MAIN - rainbow SDK started with credentials result 1 : ", _logger.colors.green(connectedUser)); //logger.colors.green(JSON.stringify(result)));

                    //let startDuration = Math.round(new Date() - startDate);
                    let startDuration = result.startDuration;
                    _logger.log("info", "MAIN === STARTED (" + startDuration + " ms) ===");
                    console.log("MAIN === STARTED (" + startDuration + " ms) ===");

                    rainbowSDK.stop();
                } catch (err) {
                    console.log("MAIN - Error during starting : ", inspect(err));
                }
            }).catch((err) => {
                console.log("MAIN - Error during starting : ", inspect(err));
            }); // */
        }

        stop() {
            rainbowSDK.stop();
        }

        //endregion Start / Stop

        //region Logguer

        testDecrypt(strEncoded="f583b6c352801523822f4f02699005ad279ffbecbdf440c033ed2b3c39551ec558cbcb91fc97f9d604546db2cf90ee108eb5c3eecece0f8995d096d5cf0d16ed233c2076ba5bac6d232099139abf9348da5ffbbd3a86f367ed04f4c70cd513fb10f6034e4571ad791fe9a801429531122a5dfd8e46018b4a797449b529a7558d184698f1912468d2ac08e10428b9a5b0ef536db1146a2af8d559a4eaada3bd39398d6e87163dfaf045166e48bdb6bc1666f30f45682f47e1ce45435e0a7b0a5d410bc0ef6167618d6c240e01e6154e110b3f4a9c88d7b2b3503437bad2369f270b6dd53d00") {
            _logger.log("info", "MAIN - str strEncoded : ", strEncoded);
            let decrypted = _logger.decrypt(strEncoded);
            _logger.log("info", "MAIN - str Decrypted : ", decrypted);
        }

        //endregion Logguer


    }

    function commandLineInteraction() {
        let tests = new Tests();
        let testsFunctions = findTests(tests);

        //testsFunctions.unshift(["testsFunction", "exit", "by", "stop", "start", "help"]);

        testsFunctions.unshift(["exit"]);
        testsFunctions.unshift(["quit"]);
        testsFunctions.unshift(["by"]);
        testsFunctions.unshift(["eval:"]);
        testsFunctions.unshift(["stop"]);
        testsFunctions.unshift(["history"]);
        testsFunctions.unshift(["search"]);
        testsFunctions.unshift(["start"]);
        testsFunctions.unshift(["help"]);
        // */
        _logger.log("info", "MAIN - findTests : ", testsFunctions);
        _logger.log("info", "MAIN - NodeJS process memory : ", v8.getHeapStatistics().heap_size_limit/(1024*1024));

        let questions : any = [
            {
                type: "autocomplete",
                name: "cmd",
                message: "Command> ",
                choices: testsFunctions,
                source: async (input) => {
                    //console.log("input : ",  util.inspect(input, false, 4, true));
                    if (!input) {
                        //console.log("input empty, return empty Array.");
                        return [];
                    }
                    //const filteredCountries = await searchCountries(input)
                    return testsFunctions.map(testFunction => {
                        return {
                            value: `${testFunction}`,
                            description: `${testFunction} is a a tes function.`
                        }
                    });
                },
                suggestOnly: true,
                // default:"start",
                pageSize:10,
                validate: function (val) {
                    if (!val) {
                        return 'Please provide a key'
                    }
                    return true
                }
            }
        ];
// */
/*
        let questions = [
            {
                type: "input",
                name: "cmd",
                message: "Command> ",
                choices: testsFunctions,
            }
        ];
// */

        let searchQuestion : any =
            {
                message: "Search> ",
                choices: testsFunctions,
                source: async (input, { signal }) => {
                    if (!input) {
                        //console.log("input empty, return empty Array.");
                        return [];
                    }
                    //console.log("input : ",  util.inspect(input, false, 4, true));
                    //const filteredCountries = await searchCountries(input)
                    return testsFunctions.filter((functionName) => {
                        // console.log("filter input : " + input + " in functionName : " + functionName);
                        return (functionName.indexOf(input) != -1);
                    } ).map(testFunction => {
                        return {
                            //value: testFunction + "()",
                            value: testFunction,
                            description: `${testFunction} is a test function.\n`
                        }
                    });
                },
                pageSize:10,
                theme:{
                    icon: {
                        cursor: figures.pointerSmall
                    },
                    style: {
                        disabled: (text: string) => chalk.dim(`- ${text}`),
                        searchTerm: (text: string) => chalk.cyan(text),
                        description: (text: string) => chalk.yellowBright(text)
                    },
                    helpMode: 'auto'
                }
            }; // */

        let historyFound : Array<any> = loadHistory();

        let historyQuestion : any = [
            {
                type: "autocomplete",
                name: "historyCmd",
                message: "History> ",
                choices: historyFound,
                source: async (input) => {
                    //console.log("input : ",  util.inspect(input, false, 4, true));
                    if (!input) {
                        //console.log("input empty, return empty Array.");
                        return [];
                    }
                    //const filteredCountries = await searchCountries(input)
                    return historyFound.map(testFunction => {
                        return {
                            value: `${testFunction}`,
                            description: `${testFunction} is a a tes function.`
                        }
                    });
                },
                suggestOnly: true,
                // default:"start",
                pageSize:10
            }]; // */

        inquirer.registerPrompt('autocomplete', inquirerPrompt);

        function enterCmd() {
            _logger.log("info", "MAIN - commandLineInteraction (help, start, stop, by, quit, exit, search, history), enter a command to eval : "); //logger.colors.green(JSON.stringify(result)));
            // _logger.log("info", "MAIN - test Array : ", [1,"2",{"11":"22"}], " JSON : ", {1:2,"2":[1]});
            //let result = search(searchQuestion).then(answers => {
            inquirer.prompt(questions).then(async answers => {
                //console.log(`Hi ${cmd}!`);
                let cmd = Array.isArray(answers)?answers[0]:answers?.cmd;
                //let cmd = answers.cmd;
                _logger.log("info", "MAIN - answers entered : ",  util.inspect(answers, false, 4, true)); //logger.colors.green(JSON.stringify(result)));
                _logger.log("info", "MAIN - cmd entered : ", cmd); //logger.colors.green(JSON.stringify(result)));
                try {
                    switch (cmd) {
                        case "exit":
                        case "quit":
                        case "by":
                            _logger.log("info", "MAIN - exit."); //logger.colors.green(JSON.stringify(result)));
                            writeHistory(historyFound);
                            if (rainbowSDK) {
                                rainbowSDK.stop().then(() => {
                                    process.exit(0);
                                }).catch((err) => {
                                    _logger.log("warn", "MAIN - RainbowSDK stop failed : ", err, ", but even stop the process."); //logger.colors.green(JSON.stringify(result)));
                                    process.exit(0);
                                });
                            } else {
                                process.exit(0);
                            }
                            break;
                        case "help":
                            _logger.log("info", "MAIN - help."); //logger.colors.green(JSON.stringify(result)));
                            for (const testsFunction of testsFunctions) {
                                _logger.log("info", "MAIN - testsFunction : tests.", testsFunction); //logger.colors.green(JSON.stringify(result)));
                            }
                            enterCmd();
                            break;
                        case "start":
                            addStringToHistoryMemory(historyFound, cmd);
                            _logger.log("info", "MAIN - run cmd : tests.start()"); //logger.colors.green(JSON.stringify(result)));
                            eval("tests.start()");
                            enterCmd();
                            break;
                        case "cls":
                        case "clear":
                            //addStringToHistoryMemory(historyFound, cmd);
                            _logger.log("info", "MAIN - run cmd : clear"); //logger.colors.green(JSON.stringify(result)));
                            console.clear();
                            enterCmd();
                            break;
                        case "search":
                            //addStringToHistoryMemory(historyFound, cmd);
                            _logger.log("info", "MAIN - run cmd : search"); //logger.colors.green(JSON.stringify(result)));
                            await search(searchQuestion).then(answers => {
                                _logger.log("info", "MAIN - search : answers : ", _logger.colors.warn(answers)); //logger.colors.green(JSON.stringify(result)));
                                questions[0].default=answers;
                            });
                            enterCmd();
                            break;
                        case "history":
                            _logger.log("info", "MAIN - run cmd : history"); //logger.colors.green(JSON.stringify(result)));
                            await inquirer.prompt(historyQuestion).then(async answers => {
                            // await search(historyQuestion).then(answers => {
                                _logger.log("info", "MAIN - history : answers?.historyCmd : ", _logger.colors.warn(answers?.historyCmd)); //logger.colors.green(JSON.stringify(result)));
                                questions[0].default=answers?.historyCmd;
                            });
                            enterCmd();
                            break;
                        case "startstop":
                            //addStringToHistoryMemory(historyFound, cmd);
                            _logger.log("info", "MAIN - run cmd : tests.startstop()"); //logger.colors.green(JSON.stringify(result)));
                            eval("tests.startstop()");
                            enterCmd();
                            break;
                        case "stop":
                            //addStringToHistoryMemory(historyFound, cmd);
                            _logger.log("info", "MAIN - run cmd : tests.stop()"); //logger.colors.green(JSON.stringify(result)));
                            eval("tests.stop()");
                            enterCmd();
                            break;
                        default:
                            questions[0].default=cmd;
                            addStringToHistoryMemory(historyFound, cmd);
                            _logger.log("info", "MAIN - run cmd : ", cmd); //logger.colors.green(JSON.stringify(result)));
                            if (cmd) {
                                if (cmd?.indexOf("eval:")===0) {
                                    let cmdStr = cmd.substring("eval:".length);
                                    _logger.log("info", "MAIN - run eval cmdStr : ", cmd); //logger.colors.green(JSON.stringify(result)));
                                    eval(cmdStr);
                                } else {
                                    let cmdStr = (cmd + "").indexOf("tests.")===0 ? cmd:"tests." + cmd
                                    _logger.log("info", "MAIN - run cmdStr : ", cmd); //logger.colors.green(JSON.stringify(result)));
                                    eval(cmdStr);
                                }
                            }
                            enterCmd();
                            break;
                    }
                    /*
                    if (cmd==="by") {
                       _logger.log("debug", "MAIN - exit."); //logger.colors.green(JSON.stringify(result)));
                        rainbowSDK.stop().then(() => {
                            process.exit(0);
                        });
                    } else {
                       _logger.log("debug", "MAIN - run cmd : ", cmd); //logger.colors.green(JSON.stringify(result)));
                        eval(cmd);
                        enterCmd();
                    }
                    // */
                } catch (e) {
                    _logger.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));
                    console.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));
                    enterCmd();
                }
            });
        }

        enterCmd();
    }

//let startDate = new Date();
    let token = undefined;


    let connectedUser: any = {};

    function findTests(obj) {
        let propertiestoIgnore = [];
        let privateAPI = [];
        let depth = 0
        let MAXDEPTH = 3;
        let tests = [];

        if (!obj) return [];

        let props = Object.getPrototypeOf(obj);
        Object.getOwnPropertyNames(props).forEach(function (property) {
            //that._logger.log("debug", logService + "[iterateAPI] getPrototypeOf property : " + property);
            try {
                if ((propertiestoIgnore.indexOf(property)== -1) && depth < MAXDEPTH) {
                    //that._logger.log("debug",logService + "[iterateAPI] iter properties of obj " + typeof obj[property] + ", current propertie  : " + property + "()");
                    if (props.hasOwnProperty(property)) {
                        if (typeof obj[property]==="object") {
                            //that._logger.log("debug", logService + "[iterateAPI] found a child object : " + currentStack + "->" + property);
                            /*if (property === "_contacts" || property === "_core") {
                                that._logger.log("debug",logService + "[iterateAPI] contacts found a child object : " + currentStack + "." + property);
                                iterateAPI(obj[property], currentStack + "." + property, list);
                            } // */
//                            iterateAPI(obj[property], currentStack + "." + property, list);
                        } else {
                            if (typeof props[property]==="function") {
                                //that._logger.log("debug", logService + "[iterateAPI] found a child function : " + property + "()");
                                if (!(property in privateAPI)) {
                                    _logger.log("info", "MAIN - (findTests) found in props a test function : tests." + property + "()");
                                    /*servicesList[currentStack] = currentStack;
                                    var item = {
                                        "serviceName": currentStack,
                                        "methodName": currentStack + "." + property,
                                        "called": 0
                                    };
                                    list[item.methodName] = item;
                                    // */
                                    tests.push(property+"()");
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                // that._logger.log("debug",logService + "[iterateAPI] !!! CATCH ERROR : " + err.message);
            }
        });

        Object.getOwnPropertyNames(obj)
            //for (var property in obj) {
            .forEach(function (property) {
                //Object.getOwnPropertyNames(obj).forEach(function (property) {
                try {
                    if ((propertiestoIgnore.indexOf(property)== -1) && depth < MAXDEPTH) {
                        //that._logger.log("debug",logService + "[iterateAPI] iter properties of obj " + typeof obj[property] + ", current propertie  : " + property + "()");
                        if (obj.hasOwnProperty(property)) {
                            if (typeof obj[property]==="object") {
                                //that._logger.log("debug",logService + "[iterateAPI] found a child object : " + currentStack + "->" + property);
                                if (property==="_contacts" || property==="_core") {
//                                that._logger.log("debug",logService + "[iterateAPI] contacts found a child object : " + currentStack + "." + property  );
//                                iterateAPI(obj[property], currentStack + "." + property, list);
                                }
                                //that._logger.log("debug", logService + "[iterateAPI] contacts found a child object : " + currentStack + "." + property);
                                // iterateAPI(obj[property], currentStack + "." + property, list, servicesList, depth + 1 );
                            } else {
                                if (typeof obj[property]==="function") {
                                    //that._logger.log("debug", logService + "[iterateAPI] found a child function : " + property + "()");
                                    if (!(property in privateAPI)) {
                                        _logger.log("info", "MAIN - (findTests) found in propreties a test function : tests." + property + "()");
                                        /*
                                            servicesList[currentStack] = currentStack;
                                            var item = {
                                                "serviceName": currentStack,
                                                "methodName": currentStack + "." + property,
                                                "called": 0
                                            };
                                            list[item.methodName] = item;
                                            // */
                                        tests.push(property+"()");
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    // that._logger.log("debug",logService + "[iterateAPI] !!! CATCH ERROR : " + err.message);
                }
            });

        return tests;
    }

    function addStringToHistoryMemory(arr:Array<any>, str) {
        if (Array.isArray(arr) && !arr.includes(str)) {
            arr.push(str);
            //console.log(`Added: ${str}`);
        } else {
            //console.log(`String "${str}" already exists in the array.`);
        }
    }

    function loadHistory(){
        let userAPPDATAPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") ;
        _logger.log("debug", "MAIN - (loadHistory) - userAPPDATAPath : ", userAPPDATAPath, ", process.env.HOME : ", process.env.HOME);
        let historyResult = [];
        function loadHistoryFromFile(userHomePath) {
            let history :any = [];
            try {
                //let readResult = fs.readFileSync(userHomePath + '/history.ini', 'utf-8');
                //history = ini.parse(readResult);
                history = readArrayFromFile(userHomePath + '/history.txt')
                _logger.log("debug", "MAIN - (loadHistory) loadHistoryFromFile - history : ", history);
            } catch (err) {
                _logger.log("warn", "MAIN - (loadHistory) loadHistoryFromFile - err : ", err);
               /* if (err.code === 'ENOENT') {
                    let generatedRandomId = xmppUtils.generateRandomID();
                    history["xmppRessourceName"] = generatedRandomId;
                    fs.writeFileSync(userHomePath + '/history.ini', ini.stringify(history, {section: 'HISTORY'}));
                }*/
            }
            return history;
        }

        try {
            if (userAPPDATAPath) {
                userAPPDATAPath += "/Rainbow/RainbowNodeSdkDir";
                _logger.log("debug", "MAIN - (loadHistory) - userAPPDATAPath : ", userAPPDATAPath);
                if (!fs.existsSync(userAPPDATAPath)) {
                    _logger.log("debug", "MAIN - (loadHistory) - does not exists and can not be created, so can do the treatment.");
                    if (fs.mkdirSync(userAPPDATAPath, {recursive: true})) {
                        _logger.log("debug", "MAIN - (loadHistory) - mkdirSync succeed, so can do the treatment.");
                        historyResult = loadHistoryFromFile(userAPPDATAPath);
                    } else {
                        _logger.log("error", "MAIN - (loadHistory) - mkdirSync failed and can not be created, so can do the treatment.");
                    }
                } else {
                    _logger.log("debug", "MAIN - (loadHistory) - exists, so can do the treatment.");
                    historyResult = loadHistoryFromFile(userAPPDATAPath);
                }
            } else {

            }
            return historyResult;
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }

    function writeHistory(history){
        let userAPPDATAPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") ;
        _logger.log("debug", "MAIN - (writeHistory) - userAPPDATAPath : ", userAPPDATAPath, ", process.env.HOME : ", process.env.HOME);
        function writeHistoryInFile(userHomePath : any) {
            try {
                writeArrayToFile(history, userHomePath + '/history.txt');
                _logger.log("debug", "MAIN - (writeHistory) writeHistoryInFile - history : ", history);
            } catch (err) {
                _logger.log("warn", "MAIN - (writeHistory) writeHistoryInFile - err : ", err);
               /* if (err.code === 'ENOENT') {
                    let generatedRandomId = xmppUtils.generateRandomID();
                    history["xmppRessourceName"] = generatedRandomId;
                    fs.writeFileSync(userHomePath + '/history.ini', ini.stringify(history, {section: 'HISTORY'}));
                }*/
            }
            return history;
        }

        try {
            if (userAPPDATAPath) {
                userAPPDATAPath += "/Rainbow/RainbowNodeSdkDir";
                _logger.log("debug", "MAIN - (writeHistory) - userAPPDATAPath : ", userAPPDATAPath);
                if (!fs.existsSync(userAPPDATAPath)) {
                    _logger.log("debug", "MAIN - (writeHistory) - does not exists and can not be created, so can do the treatment.");
                    if (fs.mkdirSync(userAPPDATAPath, {recursive: true})) {
                        _logger.log("debug", "MAIN - (writeHistory) - mkdirSync succeed, so can do the treatment.");
                        writeHistoryInFile(userAPPDATAPath);
                    } else {
                        _logger.log("error", "MAIN - (writeHistory) - mkdirSync failed and can not be created, so can do the treatment.");
                    }
                } else {
                    _logger.log("debug", "MAIN - (writeHistory) - exists, so can do the treatment.");
                    writeHistoryInFile(userAPPDATAPath);
                }
            } else {

            }
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }
    
    commandLineInteraction();

})();
