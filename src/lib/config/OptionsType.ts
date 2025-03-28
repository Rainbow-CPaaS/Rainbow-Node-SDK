"use strict";

export {};

'use strict';

/*
class Colors {
    public themes;
    public styles;
    public enabled;

    constructor(themes, styles, enabled) {
        this.themes = themes;
        this.styles = styles;
        this.enabled = enabled;
    }
}
// */
/*
{
    rainbow: { host: 'openrainbow.net', mode: 'xmpp' },
    xmpp: {
      host: '',
      port: '443',
      protocol: 'wss',
      timeBetweenXmppRequests: '0',
      raiseLowLevelXmppInEvent: false,
      raiseLowLevelXmppOutReq: false,
      maxIdleTimer: 16000,
      maxPingAnswerTimer: 11000,
      maxPendingAsyncLockXmppQueue: 10000
    },
    s2s: {
      hostCallback: undefined,
      locallistenningport: 4000,
      expressEngine: undefined
    },
    rest: {
      useRestAtStartup: true,
      useGotLibForHttp: false,
      gotOptions: [Object]
    },
    credentials: {
      login: 'vincent00@vbe.test.openrainbow.net',
      password: 'Password_123',
      apikey: ''
    },
    application: {
      appID: '68fcf4208b5111e883e2ab434dc8e4c5',
      appSecret: 'iYBx4aZ9LbqUpK6UFwRIEttpxPZcHqpqKz9nkDjt5q1rQqA5Rn4Lzc3EOmnhleEN'
    },
    proxy: {
      host: undefined,
      port: 8080,
      protocol: undefined,
      user: undefined,
      password: undefined,
      secureProtocol: undefined
    },
    logs: {
      enableConsoleLogs: true,
      enableFileLogs: true,
      enableEventsLogs: false,
      enableEncryptedLogs: false,
      color: true,
      level: 'debug',
      customLabel: 'vincent00@vbe.test.openrainbow.net',
      'system-dev': [Object],
      filter: '',
      areas: [LogLevelAreas],
      file: [Object]
    },
    testOutdatedVersion: true,
    testDNSentry: true,
    httpoverxmppserver: true,
    intervalBetweenCleanMemoryCache: 21600000,
    requestsRate: {
      useRequestRateLimiter: true,
      maxReqByIntervalForRequestRate: 1250,
      intervalForRequestRate: 60,
      timeoutRequestForRequestRate: 600
    },
    autoReconnectIgnoreErrors: false,
    im: {
      sendReadReceipt: true,
      sendMessageToConnectedUser: false,
      conversationsRetrievedFormat: 'full',
      storeMessages: false,
      copyMessage: true,
      nbMaxConversations: 15,
      rateLimitPerHour: 100000,
      messagesDataStore: 'storetwinside',
      autoInitialGetBubbles: true,
      autoInitialBubblePresence: true,
      maxBubbleJoinInProgress: 10,
      autoInitialBubbleFormat: 'full',
      autoInitialBubbleUnsubscribed: true,
      autoLoadConversations: true,
      autoLoadConversationHistory: false,
      autoLoadContacts: true,
      autoInitialLoadContactsInfoBulk: 'true',
      autoLoadCallLog: false,
      enableCarbon: true,
      enablesendurgentpushmessages: true,
      storeMessagesInConversation: true,
      maxMessagesStoredInConversation: 830
    },
    servicesToStart: {
      bubbles: [Object],
      telephony: [Object],
      channels: [Object],
      admin: [Object],
      fileServer: [Object],
      fileStorage: [Object],
      calllog: [Object],
      favorites: [Object],
      alerts: [Object],
      webrtc: [Object]
    }
  }
  // */
'use strict';

class RainbowOptions {
    public host;
    public mode;

    constructor(host, mode) {
        this.host = host;
        this.mode = mode;
    }
}

class XmppOptions {
    public host;
    public port;
    public protocol;
    public timeBetweenXmppRequests;
    public raiseLowLevelXmppInEvent;
    public raiseLowLevelXmppOutReq;
    public maxIdleTimer;
    public maxPingAnswerTimer;
    public maxPendingAsyncLockXmppQueue;

    constructor(host, port, protocol, timeBetweenXmppRequests, raiseLowLevelXmppInEvent, raiseLowLevelXmppOutReq, maxIdleTimer, maxPingAnswerTimer, maxPendingAsyncLockXmppQueue) {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.timeBetweenXmppRequests = timeBetweenXmppRequests;
        this.raiseLowLevelXmppInEvent = raiseLowLevelXmppInEvent;
        this.raiseLowLevelXmppOutReq = raiseLowLevelXmppOutReq;
        this.maxIdleTimer = maxIdleTimer;
        this.maxPingAnswerTimer = maxPingAnswerTimer;
        this.maxPendingAsyncLockXmppQueue = maxPendingAsyncLockXmppQueue;
    }
}

class S2SOptions {
    public locallistenningport;

    constructor(locallistenningport) {
        this.locallistenningport = locallistenningport;
    }
}

class RestOptions {
    public useRestAtStartup;
    public useGotLibForHttp;
    public gotOptions;

    constructor(useRestAtStartup, useGotLibForHttp, gotOptions) {
        this.useRestAtStartup = useRestAtStartup;
        this.useGotLibForHttp = useGotLibForHttp;
        this.gotOptions = gotOptions;
    }
}

class Credentials {
    public login;
    public password;
    public apikey;

    constructor(login, password, apikey) {
        this.login = login;
        this.password = password;
        this.apikey = apikey;
    }
}

class Application {
    public appID;
    public appSecret;

    constructor(appID, appSecret) {
        this.appID = appID;
        this.appSecret = appSecret;
    }
}

class ProxyOptions {
    public port;

    constructor(port) {
        this.port = port;
    }
}

class LogsOptions {
    public enableConsoleLogs;
    public enableFileLogs;
    public enableEventsLogs;
    public enableEncryptedLogs;
    public color;
    public level;
    public customLabel;
    public systemDev;
    public areas;

    constructor(enableConsoleLogs, enableFileLogs, enableEventsLogs, enableEncryptedLogs, color, level, customLabel, systemDev, areas) {
        this.enableConsoleLogs = enableConsoleLogs;
        this.enableFileLogs = enableFileLogs;
        this.enableEventsLogs = enableEventsLogs;
        this.enableEncryptedLogs = enableEncryptedLogs;
        this.color = color;
        this.level = level;
        this.customLabel = customLabel;
        this.systemDev = systemDev;
        this.areas = areas;
    }
}

class ImOptions {
    public sendReadReceipt;
    public sendMessageToConnectedUser;
    public conversationsRetrievedFormat;
    public storeMessages;
    public copyMessage;
    public nbMaxConversations;
    public rateLimitPerHour;
    public messagesDataStore;
    public autoInitialGetBubbles;
    public autoInitialBubblePresence;
    public maxBubbleJoinInProgress;
    public autoInitialBubbleFormat;
    public autoInitialBubbleUnsubscribed;
    public autoLoadConversations;
    public autoLoadConversationHistory;
    public autoLoadContacts;
    public autoInitialLoadContactsInfoBulk;
    public autoLoadCallLog;
    public enableCarbon;
    public enablesendurgentpushmessages;
    public storeMessagesInConversation;
    public maxMessagesStoredInConversation;

    constructor(sendReadReceipt, sendMessageToConnectedUser, conversationsRetrievedFormat, storeMessages, copyMessage, nbMaxConversations, rateLimitPerHour, messagesDataStore, autoInitialGetBubbles, autoInitialBubblePresence, maxBubbleJoinInProgress, autoInitialBubbleFormat, autoInitialBubbleUnsubscribed, autoLoadConversations, autoLoadConversationHistory, autoLoadContacts, autoInitialLoadContactsInfoBulk, autoLoadCallLog, enableCarbon, enablesendurgentpushmessages, storeMessagesInConversation, maxMessagesStoredInConversation) {
        this.sendReadReceipt = sendReadReceipt;
        this.sendMessageToConnectedUser = sendMessageToConnectedUser;
        this.conversationsRetrievedFormat = conversationsRetrievedFormat;
        this.storeMessages = storeMessages;
        this.copyMessage = copyMessage;
        this.nbMaxConversations = nbMaxConversations;
        this.rateLimitPerHour = rateLimitPerHour;
        this.messagesDataStore = messagesDataStore;
        this.autoInitialGetBubbles = autoInitialGetBubbles;
        this.autoInitialBubblePresence = autoInitialBubblePresence;
        this.maxBubbleJoinInProgress = maxBubbleJoinInProgress;
        this.autoInitialBubbleFormat = autoInitialBubbleFormat;
        this.autoInitialBubbleUnsubscribed = autoInitialBubbleUnsubscribed;
        this.autoLoadConversations = autoLoadConversations;
        this.autoLoadConversationHistory = autoLoadConversationHistory;
        this.autoLoadContacts = autoLoadContacts;
        this.autoInitialLoadContactsInfoBulk = autoInitialLoadContactsInfoBulk;
        this.autoLoadCallLog = autoLoadCallLog;
        this.enableCarbon = enableCarbon;
        this.enablesendurgentpushmessages = enablesendurgentpushmessages;
        this.storeMessagesInConversation = storeMessagesInConversation;
        this.maxMessagesStoredInConversation = maxMessagesStoredInConversation;
    }
}


/*
class Options {
    _logger: Logger;
    _options: OptionsData;
    _hasCredentials: boolean;
    _hasApplication: boolean;
    _withXMPP: boolean;
    _withS2S: boolean;
    _CLIMode: boolean;
    _testOutdatedVersion: boolean;
    _testDNSentry: boolean;
    _autoReconnectIgnoreErrors: boolean;
    _httpoverxmppserver: boolean;
    _intervalBetweenCleanMemoryCache: number;
    _configIniData: { xmppRessourceName: string };
    _httpOptions: HttpOptions;
    _xmppOptions: XmppOptions;
    _s2sOptions: S2SOptions;
    _restOptions: RestOptions;
    _proxyoptions: ProxyOptions;
    _imOptions: IMOptions;
    _applicationOptions: ApplicationOptions;
    _servicesToStart: ServicesToStart;
    _requestsRate: RequestsRate;
}

interface Logger {
    customLabel: string;
    logHttp: boolean;
    logLevel: string;
    colors: Colors;
    enableEncryptedLogs: boolean;
}

interface Colors {
    themes: Record<string, any>;
    styles: Record<string, any>;
    enabled: boolean;
}

interface OptionsData {
    rainbow: RainbowOptions;
    xmpp: XmppOptions;
    s2s: S2SOptions;
    rest: RestOptions;
    credentials: Credentials;
    application: ApplicationOptions;
    proxy: ProxyOptions;
    logs: LogOptions;
    requestsRate: RequestsRate;
    im: IMOptions;
    servicesToStart: ServicesToStart;
}

interface RainbowOptions {
    host: string;
    mode: string;
}

interface XmppOptions {
    host: string;
    port: string;
    protocol: string;
    timeBetweenXmppRequests: string;
    raiseLowLevelXmppInEvent: boolean;
    raiseLowLevelXmppOutReq: boolean;
    maxIdleTimer: number;
    maxPingAnswerTimer: number;
    maxPendingAsyncLockXmppQueue: number;
    xmppRessourceName?: string;
}

interface HttpOptions {
    host: string;
    port: string;
    protocol: string;
}

interface S2SOptions {
    hostCallback?: string;
    locallistenningport: number;
    expressEngine?: any;
}

interface RestOptions {
    useRestAtStartup: boolean;
    useGotLibForHttp: boolean;
    gotOptions?: Record<string, any>;
}

interface Credentials {
    login: string;
    password: string;
    apikey: string;
}

interface ApplicationOptions {
    appID: string;
    appSecret: string;
}

interface ProxyOptions {
    host?: string;
    port: number;
    protocol?: string;
    user?: string;
    password?: string;
    secureProtocol?: string;
}

interface LogOptions {
    enableConsoleLogs: boolean;
    enableFileLogs: boolean;
    enableEventsLogs: boolean;
    enableEncryptedLogs: boolean;
    color: boolean;
    level: string;
    customLabel: string;
    filter: string;
    areas?: Record<string, any>;
    file?: Record<string, any>;
}

interface RequestsRate {
    useRequestRateLimiter: boolean;
    maxReqByIntervalForRequestRate: number;
    intervalForRequestRate: number;
    timeoutRequestForRequestRate: number;
}

interface IMOptions {
    sendReadReceipt: boolean;
    sendMessageToConnectedUser: boolean;
    conversationsRetrievedFormat: string;
    storeMessages: boolean;
    copyMessage: boolean;
    nbMaxConversations: number;
    rateLimitPerHour: number;
    messagesDataStore: string;
    autoInitialGetBubbles: boolean;
    autoInitialBubblePresence: boolean;
    maxBubbleJoinInProgress: number;
    autoInitialBubbleFormat: string;
    autoInitialBubbleUnsubscribed: boolean;
    autoLoadConversations: boolean;
    autoLoadConversationHistory: boolean;
    autoLoadContacts: boolean;
    autoInitialLoadContactsInfoBulk: boolean | string;
    autoLoadCallLog: boolean;
    enableCarbon: boolean;
    enablesendurgentpushmessages: boolean;
    storeMessagesInConversation: boolean;
    maxMessagesStoredInConversation: number;
}

interface ServicesToStart {
    [key: string]: {
        start_up: boolean;
        optional: boolean;
        logEntryParameters: boolean;
    };
}
// */
export { RainbowOptions, XmppOptions, S2SOptions, RestOptions, Credentials, Application, ProxyOptions, LogsOptions, ImOptions }
module.exports = {
    RainbowOptions, XmppOptions, S2SOptions, RestOptions, Credentials, Application, ProxyOptions, LogsOptions, ImOptions
};
