"use strict";
import {isDefined, stackTrace} from "./Utils.js";
import {level} from "winston";

export {};


enum LEVELSNAMES  {
 "ERROR" = "error",
 "WARN" = "warn",
 "INFO" = "info",
 "TRACE" = "trace",
 "HTTP" = "http",
 "XMPP" = "xmpp",
 "DEBUG" = "debug",
 "INTERNALERROR" = "internalerror",
 "INTERNAL" = "internal"
}
// order : "error", "warn", "info", "trace", "http", "xmpp", "debug", "internalerror", "internal"
enum LEVELS {
 "error" = 0,
 "warn" = 1,
 "info" = 2,
 "trace" = 3,
 "http" = 4,
 "xmpp" = 5,
 "debug" = 6,
 "internalerror" = 7,
 "internal" = 8,
}
// Set up logger
enum LEVELSCOLORS {
 "error" = "red",
 "warn" = "yellow",
 "info" = "green",
 "trace" = "white",
 "http" = "cyan",
 "xmpp" = "cyan",
 "debug" = "green",
 "internalerror" = "red",
"internal" = "blue"
}

interface LevelLogsInterface {
 "ERROR": any,
 "WARN": any,
 "INFO": any,
 "TRACE": any,
 "HTTP": any,
 "XMPP": any,
 "DEBUG": any,
 "INTERNAL": any,
 "INTERNALERROR": any,
 "ERRORAPI": any,
 "WARNAPI": any,
 "INFOAPI": any,
 "TRACEAPI": any,
 "HTTPAPI": any,
 "XMPPAPI": any,
 "DEBUGAPI": any,
 "INTERNALAPI": any,
 "INTERNALERRORAPI": any
}

class LevelLogs implements LevelLogsInterface{
 public "ERROR": any;
 public "WARN": any;
 public "INFO": any;
 public "TRACE": any;
 public "HTTP": any;
 public "XMPP": any;
 public "DEBUG": any;
 public "INTERNAL": any;
 public "INTERNALERROR": any;
 public "ERRORAPI": any;
 public "WARNAPI": any;
 public "INFOAPI": any;
 public "TRACEAPI": any;
 public "HTTPAPI": any;
 public "XMPPAPI": any;
 public "DEBUGAPI": any;
 public "INTERNALAPI": any;
 public "INTERNALERRORAPI": any;

 constructor() {
 }

 //  "error", "warn", "info", "trace", "http", "xmpp", "debug", "internal", "internalerror"
 protected setLogLevels (obj : any) {
  if (obj && typeof (obj) === "object") {
   obj.ERROR = {"callerObj": obj, "level": "error", isApi: false};
   obj.WARN = {"callerObj": obj, "level": "warn", isApi: false};
   obj.INFO = {"callerObj": obj, "level": "info", isApi: false};
   obj.TRACE = {"callerObj": obj, "level": "trace", isApi: false};
   obj.HTTP = {"callerObj": obj, "level": "http", isApi: false};
   obj.XMPP = {"callerObj": obj, "level": "xmpp", isApi: false};
   obj.DEBUG = {"callerObj": obj, "level": "debug", isApi: false};
   obj.INTERNAL = {"callerObj": obj, "level": "internal", isApi: false};
   obj.INTERNALERROR = {"callerObj": obj, "level": "internalerror", isApi: false};

   obj.ERRORAPI = {"callerObj": obj, "level": "error", isApi: true};
   obj.WARNAPI = {"callerObj": obj, "level": "warn", isApi: true};
   obj.INFOAPI = {"callerObj": obj, "level": "info", isApi: true};
   obj.TRACEAPI = {"callerObj": obj, "level": "trace", isApi: true};
   obj.HTTPAPI = {"callerObj": obj, "level": "http", isApi: true};
   obj.XMPPAPI = {"callerObj": obj, "level": "xmpp", isApi: true};
   obj.DEBUGAPI = {"callerObj": obj, "level": "debug", isApi: true};
   obj.INTERNALAPI = {"callerObj": obj, "level": "internal", isApi: true};
   obj.INTERNALERRORAPI = {"callerObj": obj, "level": "internalerror", isApi: true}; // */
  } else {
   console.log("Can not set Logs Levels : ", stackTrace());
  }
 }
}

interface Service {
 category: string;
 api: boolean;
 level: LEVELSNAMES;
 xmppin?: boolean;
 xmppout?: boolean;
}

interface EventHandlers {
 category: string;
 level: LEVELSNAMES;
}

interface ServicesMap {
 [key: string]: Service;
}

interface LawLayer {
  category: string;
  level: LEVELSNAMES;
  xmppin?: boolean;
  xmppout?: boolean;
}

interface EventHandlersMap {
 [key: string]: EventHandlers;
}

interface LogLevelAreasInterface {
 admin: Service;
 alerts: Service;
 bubbles: Service;
 backendStatus: Service,
 calllog: Service;
 channels: Service;
 connectedUser: Service;
 contacts: Service;
 conversations: Service;
 events: Service;
 favorites: Service;
 fileServer: Service;
 fileStorage: Service;
 groups: Service;
 httpoverxmpp: Service;
 ims: Service;
 invitations: Service;
 presence: Service;
 profiles: Service;
 rbvoice: Service;
 rpcoverxmpp: Service;
 s2s: Service;
 settings: Service;
 tasks: Service;
 telephony: Service;
 version: Service;
 webinars: Service;
 core: LawLayer;
 bubblesmanager: LawLayer;
 httpmanager: LawLayer;
 httpservice: LawLayer;
 rest: LawLayer;
 resttelephony: LawLayer;
 restroom: LawLayer;
 restconferencev2: LawLayer;
 restwebinar: LawLayer;
 restadldap: LawLayer;
 restalerts: LawLayer;
 restapplications: LawLayer;
 restapisettings: LawLayer;
 restauth: LawLayer;
 restbots: LawLayer;
 restbubbleopeninvites: LawLayer;
 restbubblesdialin: LawLayer;
 restbubbles: LawLayer;
 restbubblestags: LawLayer;
 restcalendar: LawLayer;
 restchannels: LawLayer;
 restclientsversions: LawLayer;
 restcloudpbx: LawLayer;
 restcompany: LawLayer;
 restconference: LawLayer;
 restconnectors: LawLayer;
 restcontacts: LawLayer;
 restconversations: LawLayer;
 restcountry: LawLayer;
 restcustomercare: LawLayer;
 restcustomisationtemplate: LawLayer;
 restdirectory: LawLayer;
 restfilestorage: LawLayer;
 restgroups: LawLayer;
 restinvitations: LawLayer;
 restpolls: LawLayer;
 restpresence: LawLayer;
 restprofiles: LawLayer;
 restpublicurl: LawLayer;
 restrainbowvoice: LawLayer;
 rests2s: LawLayer;
 restsettings: LawLayer;
 restsites: LawLayer;
 restsubscriptions: LawLayer;
 restsystems: LawLayer;
 resttasks: LawLayer;
 xmpp: LawLayer;
 s2sevent: EventHandlers;
 rbvoiceevent: EventHandlers;
 alertevent: EventHandlers;
 calllogevent: EventHandlers;
 channelevent: EventHandlers;
 conversationevent: EventHandlers;
 conversationhistory: EventHandlers;
 favoriteevent: EventHandlers;
 httpoverxmppevent: EventHandlers;
 invitationevent: EventHandlers;
 iqevent: EventHandlers;
 presenceevent: EventHandlers;
 rpcoverxmppevent: EventHandlers;
 tasksevent: EventHandlers;
 telephonyevent: EventHandlers;
 webinarevent: EventHandlers;
}

class LogLevelAreas implements LogLevelAreasInterface  {

 constructor(level : LEVELSNAMES = LEVELSNAMES.ERROR, api : boolean = false, xmppin : boolean = false, xmppout : boolean = false) {
     this.admin = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.alerts = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.bubbles = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.backendStatus = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.calllog = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.channels = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.connectedUser = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.contacts = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.conversations = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.events = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.favorites = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.fileServer = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.fileStorage = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.groups = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.httpoverxmpp = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.ims = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.invitations = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.presence = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.profiles = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.rbvoice = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.rpcoverxmpp = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.s2s = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.settings = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.tasks = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.telephony = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.version = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.webinars = {
         "category": "services",
         "api": api,
         "level": level
     };
     this.core = {
         "category": "lawlayer",
         "level": level
     };
     this.bubblesmanager = {
         "category": "lawlayer",
         "level": level
     };
     this.httpmanager = {
         "category": "lawlayer",
         "level": level
     };
     this.httpservice = {
         "category": "lawlayer",
         "level": level
     };
     this.rest = {
         "category": "lawlayer",
         "level": level
     };
     this.resttelephony = {
         "category": "lawlayer",
         "level": level
     };
     this.restroom = {
         "category": "lawlayer",
         "level": level
     };
     this.restconferencev2 = {
         "category": "lawlayer",
         "level": level
     };
     this.restwebinar = {
         "category": "lawlayer",
         "level": level
     };
     this.restadldap = { "category": "lawlayer", "level": level };
     this.restalerts = { "category": "lawlayer", "level": level };
     this.restapplications = { "category": "lawlayer", "level": level };
     this.restapisettings = { "category": "lawlayer", "level": level };
     this.restauth = { "category": "lawlayer", "level": level };
     this.restbots = { "category": "lawlayer", "level": level };
     this.restbubbleopeninvites = { "category": "lawlayer", "level": level };
     this.restbubblesdialin = { "category": "lawlayer", "level": level };
     this.restbubbles = { "category": "lawlayer", "level": level };
     this.restbubblestags = { "category": "lawlayer", "level": level };
     this.restcalendar = { "category": "lawlayer", "level": level };
     this.restchannels = { "category": "lawlayer", "level": level };
     this.restclientsversions = { "category": "lawlayer", "level": level };
     this.restcloudpbx = { "category": "lawlayer", "level": level };
     this.restcompany = { "category": "lawlayer", "level": level };
     this.restconference = { "category": "lawlayer", "level": level };
     this.restconnectors = { "category": "lawlayer", "level": level };
     this.restcontacts = { "category": "lawlayer", "level": level };
     this.restconversations = { "category": "lawlayer", "level": level };
     this.restcountry = { "category": "lawlayer", "level": level };
     this.restcustomercare = { "category": "lawlayer", "level": level };
     this.restcustomisationtemplate = { "category": "lawlayer", "level": level };
     this.restdirectory = { "category": "lawlayer", "level": level };
     this.restfilestorage = { "category": "lawlayer", "level": level };
     this.restgroups = { "category": "lawlayer", "level": level };
     this.restinvitations = { "category": "lawlayer", "level": level };
     this.restpolls = { "category": "lawlayer", "level": level };
     this.restpresence = { "category": "lawlayer", "level": level };
     this.restprofiles = { "category": "lawlayer", "level": level };
     this.restpublicurl = { "category": "lawlayer", "level": level };
     this.restrainbowvoice = { "category": "lawlayer", "level": level };
     this.rests2s = { "category": "lawlayer", "level": level };
     this.restsettings = { "category": "lawlayer", "level": level };
     this.restsites = { "category": "lawlayer", "level": level };
     this.restsubscriptions = { "category": "lawlayer", "level": level };
     this.restsystems = { "category": "lawlayer", "level": level };
     this.resttasks = { "category": "lawlayer", "level": level };
     this.xmpp = {
         "category": "lawlayer",
         "level": level,
         "xmppin": xmppin,
         "xmppout": xmppout
     };
     this.s2sevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.rbvoiceevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.alertevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.calllogevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.channelevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.conversationevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.conversationhistory = {
         "category": "eventHandlers",
         "level": level
     };
     this.favoriteevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.httpoverxmppevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.invitationevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.iqevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.presenceevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.rpcoverxmppevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.tasksevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.telephonyevent = {
         "category": "eventHandlers",
         "level": level
     };
     this.webinarevent = {
         "category": "eventHandlers",
         "level": level
     };
 }

 //region Set Levels Methods
    configureServicesLevelLogs(level:LEVELSNAMES=LEVELSNAMES.INFO, api:boolean=false ) {
        this.admin.level = level;
        this.admin.api = api;
        this.alerts.level = level;
        this.alerts.api = api;
        this.bubbles.level = level;
        this.bubbles.api = api;
        this.backendStatus.level = level;
        this.backendStatus.api = api;
        this.calllog.level = level;
        this.calllog.api = api;
        this.channels.level = level;
        this.channels.api = api;
        this.connectedUser.level = level;
        this.connectedUser.api = api;
        this.contacts.level = level;
        this.contacts.api = api;
        this.conversations.level = level;
        this.conversations.api = api;
        this.events.level = level;
        this.events.api = api;
        this.favorites.level = level;
        this.favorites.api = api;
        this.fileServer.level = level;
        this.fileServer.api = api;
        this.fileStorage.level = level;
        this.fileStorage.api = api;
        this.groups.level = level;
        this.groups.api = api;
        this.httpoverxmpp.level = level;
        this.httpoverxmpp.api = api;
        this.ims.level = level;
        this.ims.api = api;
        this.invitations.level = level;
        this.admin.api = api;
        this.presence.level = level;
        this.admin.api = api;
        this.profiles.level = level;
        this.admin.api = api;
        this.rbvoice.level = level;
        this.admin.api = api;
        this.rpcoverxmpp.level = level;
        this.admin.api = api;
        this.s2s.level = level;
        this.s2s.api = api;
        this.settings.level = level;
        this.settings.api = api;
        this.tasks.level = level;
        this.tasks.api = api;
        this.telephony.level = level;
        this.telephony.api = api;
        this.version.level = level;
        this.version.api = api;
        this.webinars.level = level;
        this.webinars.api = api;
    }

    configureRESTLevelLogs(level:LEVELSNAMES) {
        this.httpmanager.level = level;
        this.httpservice.level = level;
        this.rest.level = level;
        this.resttelephony.level = level;
        this.restroom.level = level;
        this.backendStatus.level = level;
        this.restconferencev2.level = level;
        this.restwebinar.level = level;
        this.restadldap.level = level;
        this.restalerts.level = level;
        this.restapplications.level = level;
        this.restapisettings.level = level;
        this.restauth.level = level;
        this.restbots.level = level;
        this.restbubbleopeninvites.level = level;
        this.restbubblesdialin.level = level;
        this.restbubbles.level = level;
        this.restbubblestags.level = level;
        this.restcalendar.level = level;
        this.restchannels.level = level;
        this.restclientsversions.level = level;
        this.restcloudpbx.level = level;
        this.restcompany.level = level;
        this.restconference.level = level;
        this.restconnectors.level = level;
        this.restcontacts.level = level;
        this.restconversations.level = level;
        this.restcountry.level = level;
        this.restcustomercare.level = level;
        this.restcustomisationtemplate.level = level;
        this.restdirectory.level = level;
        this.restfilestorage.level = level;
        this.restgroups.level = level;
        this.restinvitations.level = level;
        this.restpolls.level = level;
        this.restpresence.level = level;
        this.restprofiles.level = level;
        this.restpublicurl.level = level;
        this.restrainbowvoice.level = level;
        this.rests2s.level = level;
        this.restsettings.level = level;
        this.restsites.level = level;
        this.restsubscriptions.level = level;
        this.restsystems.level = level;
        this.resttasks.level = level;
        this.xmpp.level = level;
        this.s2sevent.level = level;
    }

    configureEventsLevelLogs(level:LEVELSNAMES) {
        this.xmpp.level = level;
        this.s2sevent.level = level;
        this.rbvoiceevent.level = level;
        this.alertevent.level = level;
        this.calllogevent.level = level;
        this.channelevent.level = level;
        this.conversationevent.level = level;
        this.conversationhistory.level = level;
        this.favoriteevent.level = level;
        this.httpoverxmppevent.level = level;
        this.invitationevent.level = level;
        this.iqevent.level = level;
        this.presenceevent.level = level;
        this.rpcoverxmppevent.level = level;
        this.tasksevent.level = level;
        this.telephonyevent.level = level;
        this.webinarevent.level = level;
    }

    showServicesApiLogs(api : boolean = true) {
        this.admin.api = api;
        this.alerts.api = api;
        this.bubbles.api = api;
        this.backendStatus.api = api;
        this.calllog.api = api;
        this.channels.api = api;
        this.connectedUser.api = api;
        this.contacts.api = api;
        this.conversations.api = api;
        this.events.api = api;
        this.favorites.api = api;
        this.fileServer.api = api;
        this.fileStorage.api = api;
        this.groups.api = api;
        this.httpoverxmpp.api = api;
        this.ims.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.s2s.api = api;
        this.settings.api = api;
        this.tasks.api = api;
        this.telephony.api = api;
        this.version.api = api;
        this.webinars.api = api;
    }
    hideServicesApiLogs(api : boolean = false) {
        this.admin.api = api;
        this.alerts.api = api;
        this.bubbles.api = api;
        this.calllog.api = api;
        this.channels.api = api;
        this.connectedUser.api = api;
        this.contacts.api = api;
        this.conversations.api = api;
        this.events.api = api;
        this.favorites.api = api;
        this.fileServer.api = api;
        this.fileStorage.api = api;
        this.groups.api = api;
        this.httpoverxmpp.api = api;
        this.ims.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.admin.api = api;
        this.s2s.api = api;
        this.settings.api = api;
        this.tasks.api = api;
        this.telephony.api = api;
        this.version.api = api;
        this.webinars.api = api;
    }

    showServicesLogs(level : LEVELSNAMES = LEVELSNAMES.XMPP, api: boolean = true) {
        this.configureServicesLevelLogs(level, api);
    }
    hideServicesLogs(level : LEVELSNAMES = LEVELSNAMES.ERROR, api : boolean = false) {
        this.configureServicesLevelLogs(level, api);
    }

    showRESTLogs(level : LEVELSNAMES = LEVELSNAMES.XMPP) {
     this.configureRESTLevelLogs(level);
    }
    hideRESTLogs(level : LEVELSNAMES = LEVELSNAMES.ERROR) {
        this.configureRESTLevelLogs(level);
    }

    showEventsLogs(level : LEVELSNAMES = LEVELSNAMES.XMPP) {
     this.configureEventsLevelLogs(level);
    }
    hideEventsLogs(level : LEVELSNAMES = LEVELSNAMES.ERROR) {
        this.configureEventsLevelLogs(level);
    }

    showBubblesLogs(level : LEVELSNAMES = LEVELSNAMES.XMPP, api : boolean = true) {
        this.bubblesmanager.level = level;
        this.bubbles.level = level;
        this.bubbles.api = api;
    }
    hideBubblesLogs(level : LEVELSNAMES = LEVELSNAMES.ERROR, api : boolean = false) {
        this.bubblesmanager.level = level;
        this.bubbles.level = level;
        this.bubbles.api = api;
    }

    showAllLogs(level:LEVELSNAMES=LEVELSNAMES.INTERNAL, api:boolean=true) {
        let objProperties = Object.getOwnPropertyNames(this);
        for (const objPropertiesKey in objProperties) {
            console.log("initial value objPropertiesKey : ", objPropertiesKey, " -> ", this[objPropertiesKey]);
            this[objPropertiesKey].level = level;
            if (isDefined(this[objPropertiesKey].api)) {
                this[objPropertiesKey].api = level;
            }
            console.log("updated value objPropertiesKey : ", objPropertiesKey, " -> ", this[objPropertiesKey]);
        }
    }
    hideAllLogs(level:LEVELSNAMES=LEVELSNAMES.ERROR, api:boolean=false) {
        let objProperties = Object.getOwnPropertyNames(this);
        for (const objPropertiesKey in objProperties) {
            console.log("initial value objPropertiesKey : ", objPropertiesKey, " -> ", this[objPropertiesKey]);
            this[objPropertiesKey].level = level;
            if (isDefined(this[objPropertiesKey].api)) {
                this[objPropertiesKey].api = level;
            }
            console.log("updated value objPropertiesKey : ", objPropertiesKey, " -> ", this[objPropertiesKey]);
        }
    }

    //endregion Set Levels Methods

    //region

    toJSON () {
     return {
         admin : this.admin,
         alerts : this.alerts,
         bubbles : this.bubbles,
         backendStatus : this.backendStatus,
         calllog : this.calllog,
         channels : this.channels,
         connectedUser : this.connectedUser,
         contacts : this.contacts,
         conversations : this.conversations,
         events : this.events,
         favorites : this.favorites,
         fileServer : this.fileServer,
         fileStorage : this.fileStorage,
         groups : this.groups,
         httpoverxmpp : this.httpoverxmpp,
         ims : this.ims,
         invitations : this.invitations,
         presence : this.presence,
         profiles : this.profiles,
         rbvoice : this.rbvoice,
         rpcoverxmpp : this.rpcoverxmpp,
         s2s : this.s2s,
         settings : this.settings,
         tasks : this.tasks,
         telephony : this.telephony,
         version : this.version,
         webinars : this.webinars,
         core:  this.core,
         bubblesmanager:  this.bubblesmanager,
         httpmanager:  this.httpmanager,
         httpservice:  this.httpservice,
         rest:  this.rest,
         resttelephony:  this.resttelephony,
         restroom:  this.restroom,
         restconferencev2:  this.restconferencev2,
         restwebinar:  this.restwebinar,
         restadldap: this.restadldap,
         restalerts: this.restalerts,
         restapplications: this.restapplications,
         restapisettings: this.restapisettings,
         restauth: this.restauth,
         restbots: this.restbots,
         restbubbleopeninvites: this.restbubbleopeninvites,
         restbubblesdialin: this.restbubblesdialin,
         restbubbles: this.restbubbles,
         restbubblestags: this.restbubblestags,
         restcalendar: this.restcalendar,
         restchannels: this.restchannels,
         restclientsversions: this.restclientsversions,
         restcloudpbx: this.restcloudpbx,
         restcompany: this.restcompany,
         restconference: this.restconference,
         restconnectors: this.restconnectors,
         restcontacts: this.restcontacts,
         restconversations: this.restconversations,
         restcountry: this.restcountry,
         restcustomercare: this.restcustomercare,
         restcustomisationtemplate: this.restcustomisationtemplate,
         restdirectory: this.restdirectory,
         restfilestorage: this.restfilestorage,
         restgroups: this.restgroups,
         restinvitations: this.restinvitations,
         restpolls: this.restpolls,
         restpresence: this.restpresence,
         restprofiles: this.restprofiles,
         restpublicurl: this.restpublicurl,
         restrainbowvoice: this.restrainbowvoice,
         rests2s: this.rests2s,
         restsettings: this.restsettings,
         restsites: this.restsites,
         restsubscriptions: this.restsubscriptions,
         restsystems: this.restsystems,
         resttasks: this.resttasks,
         xmpp:  this.xmpp,
         s2sevent:  this.s2sevent,
         rbvoiceevent:  this.rbvoiceevent,
         alertevent:  this.alertevent,
         calllogevent:  this.calllogevent,
         channelevent:  this.channelevent,
         conversationevent:  this.conversationevent,
         conversationhistory:  this.conversationhistory,
         favoriteevent:  this.favoriteevent,
         httpoverxmppevent:  this.httpoverxmppevent,
         invitationevent:  this.invitationevent,
         iqevent:  this.iqevent,
         presenceevent:  this.presenceevent,
         rpcoverxmppevent:  this.rpcoverxmppevent,
         telephonyevent:  this.telephonyevent,
         webinarevent: this.webinarevent
     } ;
    }

    toString () {
        return JSON.stringify(this.toJSON());
    }

   //endregion

 //region Getters and Setters
 get admin(): Service {
  return this._admin;
 }

 set admin(value: Service) {
  this._admin = value;
 }

 get alertevent(): EventHandlers {
  return this._alertevent;
 }

 set alertevent(value: EventHandlers) {
  this._alertevent = value;
 }

 get alerts(): Service {
  return this._alerts;
 }

 set alerts(value: Service) {
  this._alerts = value;
 }

 get bubblesmanager(): LawLayer {
  return this._bubblemanager;
 }

 set bubblesmanager(value: LawLayer) {
  this._bubblemanager = value;
 }

 get bubbles(): Service {
  return this._bubbles;
 }

 set bubbles(value: Service) {
  this._bubbles = value;
 }

get backendStatus(): Service {
    return this._backendStatus;
}

set backendStatus(value: Service) {
    this._backendStatus = value;
}

get calllog(): Service {
  return this._calllog;
 }

 set calllog(value: Service) {
  this._calllog = value;
 }

 get calllogevent(): EventHandlers {
  return this._calllogevent;
 }

 set calllogevent(value: EventHandlers) {
  this._calllogevent = value;
 }

 get channelevent(): EventHandlers {
  return this._channelevent;
 }

 set channelevent(value: EventHandlers) {
  this._channelevent = value;
 }

 get channels(): Service {
  return this._channels;
 }

 set channels(value: Service) {
  this._channels = value;
 }

 get connectedUser(): Service {
  return this._connectedUser;
 }

 set connectedUser(value: Service) {
  this._connectedUser = value;
 }

 get contacts(): Service {
  return this._contacts;
 }

 set contacts(value: Service) {
  this._contacts = value;
 }

 get conversationevent(): EventHandlers {
  return this._conversationevent;
 }

 set conversationevent(value: EventHandlers) {
  this._conversationevent = value;
 }

 get conversationhistory(): EventHandlers {
  return this._conversationhistory;
 }

 set conversationhistory(value: EventHandlers) {
  this._conversationhistory = value;
 }

 get conversations(): Service {
  return this._conversations;
 }

 set conversations(value: Service) {
  this._conversations = value;
 }

 get core(): LawLayer {
  return this._core;
 }

 set core(value: LawLayer) {
  this._core = value;
 }

 get events(): Service {
  return this._events;
 }

 set events(value: Service) {
  this._events = value;
 }

 get favoriteevent(): EventHandlers {
  return this._favoriteevent;
 }

 set favoriteevent(value: EventHandlers) {
  this._favoriteevent = value;
 }

 get favorites(): Service {
  return this._favorites;
 }

 set favorites(value: Service) {
  this._favorites = value;
 }

 get fileServer(): Service {
  return this._fileServer;
 }

 set fileServer(value: Service) {
  this._fileServer = value;
 }

 get fileStorage(): Service {
  return this._fileStorage;
 }

 set fileStorage(value: Service) {
  this._fileStorage = value;
 }

 get groups(): Service {
  return this._groups;
 }

 set groups(value: Service) {
  this._groups = value;
 }

 get httpmanager(): LawLayer {
  return this._httpmanager;
 }

 set httpmanager(value: LawLayer) {
  this._httpmanager = value;
 }

 get httpoverxmpp(): Service {
  return this._httpoverxmpp;
 }

 set httpoverxmpp(value: Service) {
  this._httpoverxmpp = value;
 }

 get httpoverxmppevent(): EventHandlers {
  return this._httpoverxmppevent;
 }

 set httpoverxmppevent(value: EventHandlers) {
  this._httpoverxmppevent = value;
 }

 get httpservice(): LawLayer {
  return this._httpservice;
 }

 set httpservice(value: LawLayer) {
  this._httpservice = value;
 }

 get ims(): Service {
  return this._ims;
 }

 set ims(value: Service) {
  this._ims = value;
 }

 get invitationevent(): EventHandlers {
  return this._invitationevent;
 }

 set invitationevent(value: EventHandlers) {
  this._invitationevent = value;
 }

 get invitations(): Service {
  return this._invitations;
 }

 set invitations(value: Service) {
  this._invitations = value;
 }

 get iqevent(): EventHandlers {
  return this._iqevent;
 }

 set iqevent(value: EventHandlers) {
  this._iqevent = value;
 }

 get presence(): Service {
  return this._presence;
 }

 set presence(value: Service) {
  this._presence = value;
 }

 get presenceevent(): EventHandlers {
  return this._presenceevent;
 }

 set presenceevent(value: EventHandlers) {
  this._presenceevent = value;
 }

 get profiles(): Service {
  return this._profiles;
 }

 set profiles(value: Service) {
  this._profiles = value;
 }

 get rbvoice(): Service {
  return this._rbvoice;
 }

 set rbvoice(value: Service) {
  this._rbvoice = value;
 }

 get rbvoiceevent(): EventHandlers {
  return this._rbvoiceevent;
 }

 set rbvoiceevent(value: EventHandlers) {
  this._rbvoiceevent = value;
 }

 get rest(): LawLayer {
  return this._rest;
 }

 set rest(value: LawLayer) {
  this._rest = value;
 }

 get restconferencev2(): LawLayer {
  return this._restconferencev2;
 }

 set restconferencev2(value: LawLayer) {
  this._restconferencev2 = value;
 }

 get resttelephony(): LawLayer {
  return this._resttelephony;
 }

 set resttelephony(value: LawLayer) {
  this._resttelephony = value;
 }

 get restroom(): LawLayer {
  return this._restroom;
 }

 set restroom(value: LawLayer) {
  this._restroom = value;
 }

 get restwebinar(): LawLayer {
  return this._restwebinar;
 }

 set restwebinar(value: LawLayer) {
  this._restwebinar = value;
 }

 get restadldap(): LawLayer { return this._restadldap; }
 set restadldap(value: LawLayer) { this._restadldap = value; }
 get restalerts(): LawLayer { return this._restalerts; }
 set restalerts(value: LawLayer) { this._restalerts = value; }
 get restapplications(): LawLayer { return this._restapplications; }
 set restapplications(value: LawLayer) { this._restapplications = value; }
 get restapisettings(): LawLayer { return this._restapisettings; }
 set restapisettings(value: LawLayer) { this._restapisettings = value; }
 get restauth(): LawLayer { return this._restauth; }
 set restauth(value: LawLayer) { this._restauth = value; }
 get restbots(): LawLayer { return this._restbots; }
 set restbots(value: LawLayer) { this._restbots = value; }
 get restbubbleopeninvites(): LawLayer { return this._restbubbleopeninvites; }
 set restbubbleopeninvites(value: LawLayer) { this._restbubbleopeninvites = value; }
 get restbubblesdialin(): LawLayer { return this._restbubblesdialin; }
 set restbubblesdialin(value: LawLayer) { this._restbubblesdialin = value; }
 get restbubbles(): LawLayer { return this._restbubbles; }
 set restbubbles(value: LawLayer) { this._restbubbles = value; }
 get restbubblestags(): LawLayer { return this._restbubblestags; }
 set restbubblestags(value: LawLayer) { this._restbubblestags = value; }
 get restcalendar(): LawLayer { return this._restcalendar; }
 set restcalendar(value: LawLayer) { this._restcalendar = value; }
 get restchannels(): LawLayer { return this._restchannels; }
 set restchannels(value: LawLayer) { this._restchannels = value; }
 get restclientsversions(): LawLayer { return this._restclientsversions; }
 set restclientsversions(value: LawLayer) { this._restclientsversions = value; }
 get restcloudpbx(): LawLayer { return this._restcloudpbx; }
 set restcloudpbx(value: LawLayer) { this._restcloudpbx = value; }
 get restcompany(): LawLayer { return this._restcompany; }
 set restcompany(value: LawLayer) { this._restcompany = value; }
 get restconference(): LawLayer { return this._restconference; }
 set restconference(value: LawLayer) { this._restconference = value; }
 get restconnectors(): LawLayer { return this._restconnectors; }
 set restconnectors(value: LawLayer) { this._restconnectors = value; }
 get restcontacts(): LawLayer { return this._restcontacts; }
 set restcontacts(value: LawLayer) { this._restcontacts = value; }
 get restconversations(): LawLayer { return this._restconversations; }
 set restconversations(value: LawLayer) { this._restconversations = value; }
 get restcountry(): LawLayer { return this._restcountry; }
 set restcountry(value: LawLayer) { this._restcountry = value; }
 get restcustomercare(): LawLayer { return this._restcustomercare; }
 set restcustomercare(value: LawLayer) { this._restcustomercare = value; }
 get restcustomisationtemplate(): LawLayer { return this._restcustomisationtemplate; }
 set restcustomisationtemplate(value: LawLayer) { this._restcustomisationtemplate = value; }
 get restdirectory(): LawLayer { return this._restdirectory; }
 set restdirectory(value: LawLayer) { this._restdirectory = value; }
 get restfilestorage(): LawLayer { return this._restfilestorage; }
 set restfilestorage(value: LawLayer) { this._restfilestorage = value; }
 get restgroups(): LawLayer { return this._restgroups; }
 set restgroups(value: LawLayer) { this._restgroups = value; }
 get restinvitations(): LawLayer { return this._restinvitations; }
 set restinvitations(value: LawLayer) { this._restinvitations = value; }
 get restpolls(): LawLayer { return this._restpolls; }
 set restpolls(value: LawLayer) { this._restpolls = value; }
 get restpresence(): LawLayer { return this._restpresence; }
 set restpresence(value: LawLayer) { this._restpresence = value; }
 get restprofiles(): LawLayer { return this._restprofiles; }
 set restprofiles(value: LawLayer) { this._restprofiles = value; }
 get restpublicurl(): LawLayer { return this._restpublicurl; }
 set restpublicurl(value: LawLayer) { this._restpublicurl = value; }
 get restrainbowvoice(): LawLayer { return this._restrainbowvoice; }
 set restrainbowvoice(value: LawLayer) { this._restrainbowvoice = value; }
 get rests2s(): LawLayer { return this._rests2s; }
 set rests2s(value: LawLayer) { this._rests2s = value; }
 get restsettings(): LawLayer { return this._restsettings; }
 set restsettings(value: LawLayer) { this._restsettings = value; }
 get restsites(): LawLayer { return this._restsites; }
 set restsites(value: LawLayer) { this._restsites = value; }
 get restsubscriptions(): LawLayer { return this._restsubscriptions; }
 set restsubscriptions(value: LawLayer) { this._restsubscriptions = value; }
 get restsystems(): LawLayer { return this._restsystems; }
 set restsystems(value: LawLayer) { this._restsystems = value; }
 get resttasks(): LawLayer { return this._resttasks; }
 set resttasks(value: LawLayer) { this._resttasks = value; }

 get rpcoverxmpp(): Service {
  return this._rpcoverxmpp;
 }

 set rpcoverxmpp(value: Service) {
  this._rpcoverxmpp = value;
 }

 get rpcoverxmppevent(): EventHandlers {
  return this._rpcoverxmppevent;
 }

 set rpcoverxmppevent(value: EventHandlers) {
  this._rpcoverxmppevent = value;
 }

 get s2s(): Service {
  return this._s2s;
 }

 set s2s(value: Service) {
  this._s2s = value;
 }

 get s2sevent(): EventHandlers {
  return this._s2sevent;
 }

 set s2sevent(value: EventHandlers) {
  this._s2sevent = value;
 }

 get settings(): Service {
  return this._settings;
 }

 set settings(value: Service) {
  this._settings = value;
 }

 get tasks(): Service {
  return this._tasks;
 }

 set tasks(value: Service) {
  this._tasks = value;
 }

 get tasksevent(): EventHandlers {
  return this._tasksevent;
 }

 set tasksevent(value: EventHandlers) {
  this._tasksevent = value;
 }

 get telephony(): Service {
  return this._telephony;
 }

 set telephony(value: Service) {
  this._telephony = value;
 }

 get telephonyevent(): EventHandlers {
  return this._telephonyevent;
 }

 set telephonyevent(value: EventHandlers) {
  this._telephonyevent = value;
 }

 get version(): Service {
  return this._version;
 }

 set version(value: Service) {
  this._version = value;
 }

 get webinarevent(): EventHandlers {
  return this._webinarevent;
 }

 set webinarevent(value: EventHandlers) {
  this._webinarevent = value;
 }

 get webinars(): Service {
  return this._webinars;
 }

 set webinars(value: Service) {
  this._webinars = value;
 }

 get xmpp(): LawLayer {
  return this._xmpp;
 }

 set xmpp(value: LawLayer) {
  this._xmpp = value;
 }
 //endregion Getters and Setters

 //region Declarations
 private _admin: Service;
 private _alertevent: EventHandlers;
 private _alerts: Service;
 private _bubblemanager: LawLayer;
 private _backendStatus: Service;
 private _bubbles: Service;
 private _calllog: Service;
 private _calllogevent: EventHandlers;
 private _channelevent: EventHandlers;
 private _channels: Service;
 private _connectedUser: Service;
 private _contacts: Service;
 private _conversationevent: EventHandlers;
 private _conversationhistory: EventHandlers;
 private _conversations: Service;
 private _core: LawLayer;
 private _events: Service;
 private _favoriteevent: EventHandlers;
 private _favorites: Service;
 private _fileServer: Service;
 private _fileStorage: Service;
 private _groups: Service;
 private _httpmanager: LawLayer;
 private _httpoverxmpp: Service;
 private _httpoverxmppevent: EventHandlers;
 private _httpservice: LawLayer;
 private _ims: Service;
 private _invitationevent: EventHandlers;
 private _invitations: Service;
 private _iqevent: EventHandlers;
 private _presence: Service;
 private _presenceevent: EventHandlers;
 private _profiles: Service;
 private _rbvoice: Service;
 private _rbvoiceevent: EventHandlers;
 private _rest: LawLayer;
 private _restconferencev2: LawLayer;
 private _resttelephony: LawLayer;
 private _restroom: LawLayer;
 private _restwebinar: LawLayer;
 private _restadldap: LawLayer;
 private _restalerts: LawLayer;
 private _restapplications: LawLayer;
 private _restapisettings: LawLayer;
 private _restauth: LawLayer;
 private _restbots: LawLayer;
 private _restbubbleopeninvites: LawLayer;
 private _restbubblesdialin: LawLayer;
 private _restbubbles: LawLayer;
 private _restbubblestags: LawLayer;
 private _restcalendar: LawLayer;
 private _restchannels: LawLayer;
 private _restclientsversions: LawLayer;
 private _restcloudpbx: LawLayer;
 private _restcompany: LawLayer;
 private _restconference: LawLayer;
 private _restconnectors: LawLayer;
 private _restcontacts: LawLayer;
 private _restconversations: LawLayer;
 private _restcountry: LawLayer;
 private _restcustomercare: LawLayer;
 private _restcustomisationtemplate: LawLayer;
 private _restdirectory: LawLayer;
 private _restfilestorage: LawLayer;
 private _restgroups: LawLayer;
 private _restinvitations: LawLayer;
 private _restpolls: LawLayer;
 private _restpresence: LawLayer;
 private _restprofiles: LawLayer;
 private _restpublicurl: LawLayer;
 private _restrainbowvoice: LawLayer;
 private _rests2s: LawLayer;
 private _restsettings: LawLayer;
 private _restsites: LawLayer;
 private _restsubscriptions: LawLayer;
 private _restsystems: LawLayer;
 private _resttasks: LawLayer;
 private _rpcoverxmpp: Service;
 private _rpcoverxmppevent: EventHandlers;
 private _s2s: Service;
 private _s2sevent: EventHandlers;
 private _settings: Service;
 private _tasks: Service;
 private _tasksevent: EventHandlers;
 private _telephony: Service;
 private _telephonyevent: EventHandlers;
 private _version: Service;
 private _webinarevent: EventHandlers;
 private _webinars: Service;
 private _xmpp: LawLayer;
 //endregion Declarations
}

//module.exports = {'LevelInterface' : LevelInterface};
// export type {LevelInterface as LevelInterface};
export {LevelLogs as LevelLogs, LogLevelAreas as LogLevelAreas,LEVELSNAMES as LEVELSNAMES, LEVELS as LEVELS, LEVELSCOLORS as LEVELSCOLORS};
module.exports.LevelLogs = LevelLogs;
module.exports.LogLevelAreas = LogLevelAreas;
module.exports.LEVELSNAMES = LEVELSNAMES;
module.exports.LEVELS = LEVELS;
module.exports.LEVELSCOLORS = LEVELSCOLORS;

