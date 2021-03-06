declare module 'lib/common/Utils' {
	 let makeId: (n: any) => string; let createPassword: (size: any) => string; let isAdmin: (roles: any) => boolean; class Deferred {
	    resolve: any;
	    reject: any;
	    promise: any;
	    constructor();
	} let isSuperAdmin: (roles: any) => boolean; let anonymizePhoneNumber: (number: any) => any; let equalIgnoreCase: (s1: string, s2: string) => boolean; let isNullOrEmpty: (value: any) => boolean; let setTimeoutPromised: (timeOutMs: any) => Promise<any>; let pause: (timeOutMs: any) => Promise<any>; function until(conditionFunction: Function, labelOfWaitingCondition: string, waitMsTimeBeforeReject?: number): Promise<unknown>; function orderByFilter(originalArray: any, filterFct: any, flag: any, sortFct: any): any[]; function addDaysToDate(date: any, days: any): Date; function addParamToUrl(urlParams: string, paramName: string, paramValue: string): void; function isStart_upService(serviceoptions: any): boolean; function isStarted(_methodsToIgnoreStartedState?: Array<string>): any; function logEntryExit(LOG_ID: any): any; function resizeImage(avatarImg: any, maxWidth: any, maxHeight: any): Promise<unknown>; function getBinaryData(image: any): {
	    type: any;
	    data: Uint8Array;
	}; function getRandomInt(max: any): number; function stackTrace(): string;
	export let objToExport: {
	    makeId: (n: any) => string;
	    createPassword: (size: any) => string;
	    isAdmin: (roles: any) => boolean;
	    anonymizePhoneNumber: (number: any) => any;
	    equalIgnoreCase: (s1: string, s2: string) => boolean;
	    isNullOrEmpty: (value: any) => boolean;
	    Deferred: typeof Deferred;
	    isSuperAdmin: (roles: any) => boolean;
	    setTimeoutPromised: (timeOutMs: any) => Promise<any>;
	    until: typeof until;
	    orderByFilter: typeof orderByFilter;
	    isStart_upService: typeof isStart_upService;
	    isStarted: typeof isStarted;
	    logEntryExit: typeof logEntryExit;
	    resizeImage: typeof resizeImage;
	    getBinaryData: typeof getBinaryData;
	    getRandomInt: typeof getRandomInt;
	    pause: (timeOutMs: any) => Promise<any>;
	    stackTrace: typeof stackTrace;
	    addDaysToDate: typeof addDaysToDate;
	    addParamToUrl: typeof addParamToUrl;
	};
	export { makeId, createPassword, isAdmin, anonymizePhoneNumber, equalIgnoreCase, isNullOrEmpty, Deferred, isSuperAdmin, setTimeoutPromised, until, orderByFilter, isStart_upService, isStarted, logEntryExit, resizeImage, getBinaryData, getRandomInt, pause, stackTrace, addDaysToDate, addParamToUrl };

}
declare module 'lib/common/models/Channel' {
	export {}; enum Appreciation {
	    /** Applause */
	    Applause = "applause",
	    /** Doubt */
	    Doubt = "doubt",
	    /** Fantastic */
	    Fantastic = "fantastic",
	    /** Happy */
	    Happy = "happy",
	    /** Like */
	    Like = "like",
	    /** None (no appreciation) */
	    None = "none"
	} class Channel {
	    name: string;
	    id: string;
	    visibility: string;
	    topic: string;
	    creatorId: string;
	    companyId: string;
	    creationDate: Date;
	    users_count: number;
	    lastAvatarUpdateDate: Date;
	    subscribed: boolean;
	    type: string;
	    invited: boolean;
	    category: string;
	    mode: string;
	    subscribers_count: number;
	    serverURL: string;
	    max_items: number;
	    max_payload_size: number;
	    pageIndex: number;
	    isLoading: boolean;
	    complete: boolean;
	    users: any[];
	    publishersRetreived: boolean;
	    loaded: boolean;
	    avatar: string;
	    userRole: string;
	    messageRetrieved: boolean;
	    messages: any[];
	    deleted: boolean;
	    mute: boolean;
	    /**
	     * @this Channel
	     */
	    constructor(_name: string, _id: string, _visibility: string, _topic: string, _creatorId: string, _companyId: string, _creationDate: Date, _users_count: number, _lastAvatarUpdateDate: Date, _subscribed: boolean, _type: string, _invited: boolean, _category: string, _mode: string, _subscribers_count: number, _serverURL: string, _max_items: number, _max_payload_size: number, _pageIndex: number, _isLoading: boolean, _complete: boolean, _users: any[], _publishersRetreived: boolean, _loaded: boolean, _avatar: string, _userRole?: string, _messageRetrieved?: boolean, _messages?: any[], _deleted?: boolean, _mute?: boolean);
	    isNotMember(): string;
	    isOwner(): boolean;
	    isPublisher(): boolean;
	    isMember(): boolean;
	    getAvatarSrc(): string;
	    /**
	     * @function
	     * @public
	     * @name updateChannel
	     * @description
	     * This method is used to update a channel from data object
	     */
	    updateChannel(data: any): this;
	    /**
	     * @function
	     * @public
	     * @name ChannelFactory
	     * @description
	     * This method is used to create a channel from data object
	     */
	    static ChannelFactory(): (data: any, serverURL: string) => Channel;
	}
	export { Channel, Appreciation };

}
declare module 'lib/common/models/Call' {
	export {}; class Call {
	    status: any;
	    id: any;
	    conversationId: any;
	    connectionId: any;
	    type: any;
	    isVm: any;
	    contact: any;
	    remoteMedia: any;
	    localMedia: any;
	    isEscalated: any;
	    startDate: any;
	    isInitiator: any;
	    participants: any;
	    isRemoteVideoMuted: any;
	    isConference: any;
	    avatars: any;
	    currentCalled: any;
	    vm: any;
	    Status: any;
	    Type: any;
	    Media: any;
	    deviceType: any;
	    cause: any;
	    deviceState: any;
	    static Status: {
	        DIALING: {
	            value: string;
	            key: number;
	        };
	        QUEUED_OUTGOING: {
	            value: string;
	            key: number;
	        };
	        ACTIVE: {
	            value: string;
	            key: number;
	        };
	        RELEASING: {
	            value: string;
	            key: number;
	        };
	        ANSWERING: {
	            value: string;
	            key: number;
	        };
	        PUT_ON_HOLD: {
	            value: string;
	            key: number;
	        };
	        CONNECTING: {
	            value: string;
	            key: number;
	        };
	        RINGING_OUTGOING: {
	            value: string;
	            key: number;
	        };
	        QUEUED_INCOMING: {
	            value: string;
	            key: number;
	        };
	        ERROR: {
	            value: string;
	            key: number;
	        };
	        UNKNOWN: {
	            value: string;
	            key: number;
	        };
	        HOLD: {
	            value: string;
	            key: number;
	        };
	        RINGING_INCOMING: {
	            value: string;
	            key: number;
	        };
	    };
	    static Media: {
	        SHARING: number;
	        VIDEO: number;
	        PHONE: number;
	        AUDIO: number;
	    };
	    static Type: {
	        PHONE: {
	            value: string;
	            key: number;
	        };
	        WEBRTC: {
	            value: string;
	            key: number;
	        };
	    };
	    jid: undefined;
	    phoneNumber: undefined;
	    globalCallId: any;
	    correlatorData: any;
	    errorMessage: string;
	    static create(status: any, id: any, type: any, contact: any, deviceType: any): Call;
	    /**
	     * @this Call
	     */
	    constructor(status: any, id: any, type: any, contact: any, deviceType: any);
	    getCause(): any;
	    setCause(value: any): void;
	    getDeviceState(): any;
	    setDeviceState(value: any): void;
	    getDeviceType(): any;
	    setDeviceType(value: any): void;
	    setCallId(id: any): void;
	    setConversationId(id: any): void;
	    setConnectionId(connectionId: any): void;
	    setStatus(status: any): void;
	    setType(type: any): void;
	    setIsVm(isVM: any): void;
	    setContact(contact: any): void;
	    setParticipants(participants: any): void;
	    getGlobalCallId(): undefined;
	    setGlobalCallId(value: undefined): void;
	    getCurrentCalled(): any;
	    setCurrentCalled(currentCalled: any): void;
	    setCurrentCalledContactNumber(number: any): void;
	    toString(): string;
	    /*********************************************************/
	    /**                  TELEPHONY STUFF                     */
	    /*********************************************************/
	    static getIdFromConnectionId(connectionId: any): string;
	    static getDeviceIdFromConnectionId(connectionId: any): string;
	    /**
	     * @function
	     * @public
	     * @name updateCall
	     * @description
	     * This method is used to update a Call from data object
	     */
	    updateCall(data: any): Call;
	    /**
	     * @function
	     * @public
	     * @name CallFactory
	     * @description
	     * This method is used to create a Call from data object
	     */
	    static CallFactory(): (data: any) => Call;
	}
	export { Call };

}
declare module 'lib/common/models/Conversation' {
	 class Conversation {
	    id: any;
	    dbId: any;
	    type: any;
	    owner: any;
	    contact: any;
	    bubble: any;
	    capabilities: any;
	    avatar: any;
	    presenceStatus: any;
	    name: any;
	    filterName: any;
	    missedCounter: any;
	    missedCalls: any;
	    messages: any;
	    participantStatuses: any;
	    draft: any;
	    uploadFile: any;
	    status: any;
	    historyIndex: any;
	    historyMessages: any;
	    historyDefered: any;
	    historyComplete: any;
	    lastModification: any;
	    creationDate: any;
	    lastMessageText: any;
	    lastMessageSender: any;
	    pip: any;
	    videoCall: any;
	    audioCall: any;
	    pstnConferenceSession: any;
	    webConferenceSession: any;
	    isMutedAudio: any;
	    isMutedVideo: any;
	    infoVisible: any;
	    muted: any;
	    randomBase: any;
	    messageId: any;
	    currentHistoryId: any;
	    static Status: any;
	    static Type: any;
	    private static randomBase;
	    private static messageId;
	    preload: boolean;
	    isFavorite: boolean;
	    constructor(conversationId: any);
	    /**
	     * @private
	     * @method addMessage
	     * @memberof Conversation
	     * @instance
	     */
	    addMessage(message: any): any;
	    /*************************************************************/
	    /*************************************************************/
	    static createOneToOneConversation(participant: any): Conversation;
	    static createBubbleConversation(bubble: any): Conversation;
	    generateRandomID(): any;
	    static getUniqueMessageId(): string;
	    /*************************************************************/
	    /*************************************************************/
	    static stringToStatus(status: any): any;
	    /*************************************************************/
	    /*************************************************************/
	    reset(): void;
	    getMessageById(messId: any): any;
	    getlastEditableMsg(): any;
	}
	export { Conversation };

}
declare module 'lib/connection/RestServices/RESTTelephony' {
	 class RESTTelephony {
	    http: any;
	    logger: any;
	    _logger: any;
	    evtEmitter: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(evtEmitter: any, logger: any);
	    start(http: any): Promise<unknown>;
	    makeCall(requestHeader: any, contact: any, phoneInfo: any): Promise<unknown>;
	    releaseCall(requestHeader: any, call: any): Promise<unknown>;
	    makeConsultationCall(requestHeader: any, callId: any, contact: any, phoneInfo: any): Promise<unknown>;
	    answerCall(requestHeader: any, call: any): Promise<unknown>;
	    holdCall(requestHeader: any, call: any): Promise<unknown>;
	    retrieveCall(requestHeader: any, call: any): Promise<unknown>;
	    deflectCallToVM(requestHeader: any, call: any, VMInfos: any): Promise<unknown>;
	    deflectCall(requestHeader: any, call: any, VMInfos: any): Promise<unknown>;
	    transfertCall(requestHeader: any, activeCall: any, heldCall: any): Promise<unknown>;
	    conferenceCall(requestHeader: any, activeCall: any, heldCall: any): Promise<unknown>;
	    forwardToDevice(requestHeader: any, contact: any, phoneInfo: any): Promise<unknown>;
	    getForwardStatus(requestHeader: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendDtmf
	     * @description
	     *      send dtmf to the remote party
	     * @param requestHeader
	     * @param callId
	     * @param deviceId
	     * @param data
	     */
	    sendDtmf(requestHeader: any, callId: any, deviceId: any, data: any): Promise<unknown>;
	    getNomadicStatus(requestHeader: any): Promise<unknown>;
	    nomadicLogin(requestHeader: any, data: any): Promise<unknown>;
	    logon(requestHeader: any, endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    logoff(requestHeader: any, endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    withdrawal(requestHeader: any, agentId: any, groupId: any, status: any): Promise<unknown>;
	    wrapup(requestHeader: any, agentId: any, groupId: any, password: any, status: any): Promise<unknown>;
	}
	export { RESTTelephony };

}
declare module 'lib/common/XMPPUtils' {
	export class XMPPUTils {
	    messageId: any;
	    static xmppUtils: XMPPUTils;
	    constructor();
	    static getXMPPUtils(): XMPPUTils;
	    generateRandomID(): string;
	    getUniqueMessageId(): string;
	    getUniqueId(suffix: any): string;
	    generateRandomFullJidForNode(jid: any, generatedRandomId: any): string;
	    generateRandomFullJidForS2SNode(jid: any, generatedRandomId: any): string;
	    getBareJIDFromFullJID(fullJid: any): any;
	    getRoomJIDFromFullJID(fullJid: any): any;
	    getDomainFromFullJID(fullJid: any): string;
	    findChild(element: any, nodeNameToFind: any): any;
	    isFromMobile(fullJid: any): boolean;
	    isFromNode(fullJid: any): boolean;
	    isFromS2S(fullJid: any): boolean;
	    isFromTelJid(fullJid: any): boolean;
	    isFromCalendarJid(fullJid: any): boolean;
	    getResourceFromFullJID(fullJid: any): any;
	    /** Function: getBareJidFromJid
	     *  Get the bare JID from a JID String.
	     *
	     *  Parameters:
	     *    (String) jid - A JID.
	     *
	     *  Returns:
	     *    A String containing the bare JID.
	     */
	    getBareJidFromJid(jid: any): any;
	}
	export let xu: XMPPUTils;

}
declare module 'lib/connection/XMPPServiceHandler/GenericHandler' {
	export {};
	import { XMPPService } from 'lib/connection/XMPPService'; class GenericHandler {
	    xmppService: XMPPService;
	    constructor(xmppService: any);
	    getJsonFromXML(xml: string): Promise<any>;
	    get jid_im(): any;
	    get jid_tel(): any;
	    get jid_password(): any;
	    get fullJid(): any;
	    get jid(): any;
	    get userId(): any;
	    get applicationId(): any;
	    get xmppClient(): import("../../common/XmppQueue/XmppClient").XmppClient;
	    get eventEmitter(): any;
	    get logger(): any;
	}
	export { GenericHandler as GenericHandler };

}
declare module 'lib/connection/XMPPServiceHandler/iqEventHandler' {
	import { XMPPService } from 'lib/connection/XMPPService';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class IQEventHandler extends GenericHandler {
	    IQ_GET: any;
	    IQ_SET: any;
	    IQ_RESULT: any;
	    IQ_ERROR: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService);
	    onIqGetSetReceived(msg: any, stanza: any): void;
	    onIqResultReceived(msg: any, stanza: any): void;
	    _onIqGetPbxAgentStatusReceived(stanza: any, node: any): void;
	    _onIqGetPingReceived(stanza: any, node: any): void;
	    _onIqGetQueryReceived(stanza: any, node: any): void;
	}
	export { IQEventHandler };

}
declare module 'lib/config/config' {
	 enum DataStoreType {
	    /** Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact. */
	    NoStore = "no-store",
	    /** Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending). */
	    NoPermanentStore = "no-permanent-store",
	    /** The messages are fully stored. */
	    StoreTwinSide = "storetwinside",
	    /** To follow the storeMessages SDK's parameter behaviour. */
	    UsestoreMessagesField = "OldstoreMessagesUsed"
	} let conf: {
	    sandbox: {
	        http: {
	            host: string;
	            port: string;
	            protocol: string;
	        };
	        xmpp: {
	            host: string;
	            port: string;
	            protocol: string;
	            timeBetweenXmppRequests: string;
	        };
	        s2s: {
	            hostCallback: string;
	            locallistenningport: string;
	        };
	    };
	    official: {
	        http: {
	            host: string;
	            port: string;
	            protocol: string;
	        };
	        xmpp: {
	            host: string;
	            port: string;
	            protocol: string;
	            timeBetweenXmppRequests: string;
	        };
	        s2s: {
	            hostCallback: string;
	            locallistenningport: string;
	        };
	    };
	    any: {
	        http: {
	            host: string;
	            port: string;
	            protocol: string;
	        };
	        xmpp: {
	            host: string;
	            port: string;
	            protocol: string;
	            timeBetweenXmppRequests: string;
	        };
	        s2s: {
	            hostCallback: string;
	            locallistenningport: string;
	        };
	    };
	    logs: {
	        path: string;
	        level: string;
	        color: boolean;
	        enableConsoleLog: boolean;
	        enableEventsLogs: boolean;
	        "system-dev": {
	            internals: boolean;
	            http: boolean;
	        };
	        zippedArchive: boolean;
	        maxSize: string;
	        maxFiles: any;
	    };
	    im: {
	        sendReadReceipt: boolean;
	        messageMaxLength: number;
	        sendMessageToConnectedUser: boolean;
	        conversationsRetrievedFormat: string;
	        storeMessages: boolean;
	        copyMessage: boolean;
	        nbMaxConversations: number;
	        rateLimitPerHour: number;
	        messagesDataStore: DataStoreType;
	        autoInitialBubblePresence: boolean;
	        autoLoadConversations: boolean;
	        autoLoadContacts: boolean;
	    };
	    mode: string;
	    concurrentRequests: number;
	    requestsRate: {
	        maxReqByIntervalForRequestRate: number;
	        intervalForRequestRate: number;
	        timeoutRequestForRequestRate: number;
	    };
	    intervalBetweenCleanMemoryCache: number;
	    debug: boolean;
	    permitSearchFromPhoneBook: boolean;
	    displayOrder: string;
	    testOutdatedVersion: boolean;
	    servicesToStart: {
	        s2s: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        presence: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        contacts: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        conversations: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        im: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        profiles: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        groups: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        bubbles: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        telephony: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        channels: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        admin: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        fileServer: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        fileStorage: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        calllog: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        favorites: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        alerts: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        invitation: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        settings: {
	            start_up: boolean;
	            optional: boolean;
	        };
	    };
	};
	export { conf as config, DataStoreType };

}
declare module 'lib/common/XmppQueue/XmppClient' {
	import { DataStoreType } from 'lib/config/config';
	export {}; class XmppClient {
	    options: any;
	    restartConnectEnabled: any;
	    client: any;
	    iqGetEventWaiting: any;
	    logger: any;
	    xmppQueue: any;
	    timeBetweenXmppRequests: any;
	    username: any;
	    password: any;
	    socketClosed: boolean;
	    storeMessages: any;
	    rateLimitPerHour: any;
	    private nbMessagesSentThisHour;
	    lastTimeReset: Date;
	    timeBetweenReset: number;
	    messagesDataStore: DataStoreType;
	    private iqSetEventRoster;
	    socket: any;
	    constructor(...args: any[]);
	    init(_logger: any, _timeBetweenXmppRequests: any, _storeMessages: any, _rateLimitPerHour: any, _messagesDataStore: any): void;
	    onIqErrorReceived(msg: any, stanza: any): void;
	    onIqResultReceived(msg: any, stanza: any): void;
	    resetnbMessagesSentThisHour(): void;
	    send(...args: any[]): Promise<unknown>;
	    sendIq(...args: any[]): Promise<unknown>;
	    on(evt: any, cb: any): void;
	    get sasl(): any;
	    setgetMechanism(cb: any): void;
	    get reconnect(): any;
	    /**
	     * @description
	     *  Do not use this method to reconnect. Use the @xmpp/reconnect pluging else (with the method XmppClient::reconnect).
	     *
	     * @returns {Promise<any>}
	     */
	    restartConnect(): Promise<string>;
	    start(...args: any[]): any;
	    stop(...args: any[]): any;
	} function getXmppClient(...args: any[]): void;
	export { getXmppClient, XmppClient };

}
declare module 'lib/common/models/AlertMessage' {
	export {}; class AlertMessage {
	    id: string;
	    toJid: string;
	    fromJid: string;
	    fromResource: string;
	    identifier: string;
	    sender: string;
	    sent: string;
	    status: string;
	    msgType: string;
	    references: string;
	    scope: string;
	    info: AlertMessageInfo;
	    constructor(id?: string, toJid?: string, fromJid?: string, fromResource?: string, identifier?: string, sender?: string, sent?: string, status?: string, msgType?: string, references?: string, scope?: string, info?: AlertMessageInfo);
	} class AlertMessageInfo {
	    category: string;
	    event: string;
	    urgency: string;
	    certainty: string;
	    expires: string;
	    senderName: string;
	    headline: string;
	    description: string;
	    descriptionMimeType: string;
	    instruction: string;
	    contact: string;
	    constructor(category?: string, event?: string, urgency?: string, certainty?: string, expires?: string, senderName?: string, headline?: string, description?: string, descriptionMimeType?: string, instruction?: string, contact?: string);
	}
	export { AlertMessage, AlertMessageInfo };

}
declare module 'lib/common/Logger' {
	/// <reference types="node" />
	export {}; class Logger {
	    get logEventEmitter(): NodeJS.EventEmitter;
	    set logEventEmitter(value: NodeJS.EventEmitter);
	    colors: any;
	    _logger: any;
	    _winston: any;
	    hideId: any;
	    hideUuid: any;
	    private _logEventEmitter;
	    private emit;
	    constructor(config: any);
	    get log(): any;
	    argumentsToStringReduced(v: any): any;
	    argumentsToStringFull(v: any): any;
	    argumentsToString: (v: any) => any;
	}
	export { Logger };

}
declare module 'lib/common/ErrorManager' {
	 const code: {
	    /** OK code result */
	    OK: number;
	    /** ERROR code result */
	    ERROR: number;
	    /** ERRORUNAUTHORIZED code result */
	    ERRORUNAUTHORIZED: number;
	    /** ERRORXMPP code result */
	    ERRORXMPP: number;
	    /** ERRORXMPPJID code result */
	    ERRORXMPPJID: number;
	    /** ERRORBADREQUEST code result */
	    ERRORBADREQUEST: number;
	    /** ERRORUNSUPPORTED code result */
	    ERRORUNSUPPORTED: number;
	    /** ERRORNOTFOUND code result */
	    ERRORNOTFOUND: number;
	    /** ERRORFORBIDDEN code result */
	    ERRORFORBIDDEN: number;
	    /** OTHERERROR code result */
	    OTHERERROR: number;
	}; class ErrorManager {
	    private static xmppUtils;
	    constructor();
	    static getErrorManager(): ErrorManager;
	    /**
	     * @readonly
	     * @memberof ErrorManager
	     * @return {Err}
	     */
	    get BAD_REQUEST(): any;
	    /**
	     * @readonly
	     * @memberof ErrorManager
	     * @return {Err}
	     */
	    get FORBIDDEN(): {
	        code: number;
	        label: string;
	        msg: string;
	    };
	    /**
	     * @readonly
	     * @memberof ErrorManager
	     * @return {Err}
	     */
	    get OK(): {
	        code: number;
	        label: string;
	        msg: string;
	    };
	    /**
	     * @readonly
	     * @memberof ErrorManager
	     * @return {Err}
	     */
	    get XMPP(): {
	        code: number;
	        label: string;
	        msg: string;
	    };
	    /**
	     * @readonly
	     * @memberof ErrorManager
	     * @return {Err}
	     */
	    get ERROR(): {
	        code: number;
	        label: string;
	        msg: string;
	        details: string;
	    };
	    /**
	     * @readonly
	     * @memberof ErrorManager
	     * @return {Err}
	     */
	    get UNAUTHORIZED(): {
	        code: number;
	        label: string;
	        msg: string;
	        details: string;
	    };
	    OTHERERROR(_label: any, _msg: any): {
	        code: number;
	        label: any;
	        msg: any;
	    };
	    CUSTOMERROR(codeERROR: any, label: any, msg: any): {
	        code: any;
	        label: any;
	        msg: any;
	    };
	}
	export { ErrorManager, code };

}
declare module 'lib/common/models/Offer' {
	export {}; class Offer {
	    id: any;
	    name: any;
	    description: any;
	    offerReference: any;
	    profileId: any;
	    canBeSold: any;
	    businessModel: any;
	    isPrepaid: any;
	    prepaidDuration: any;
	    isDefault: any;
	    isExclusive: any;
	    logo: any;
	    isEnterprise: any;
	    isBusiness: any;
	    isEssential: any;
	    constructor(id: any, name: any, description: any, offerReference: any, profileId: any, canBeSold: any, businessModel: any, isDefault: any, isExclusive: any, isPrepaid: any, prepaidDuration: any);
	    static isExclusive(offer: any): boolean;
	} class OfferManager {
	    constructor();
	    offerComparator(offer1: any, offer2: any): 0 | 1 | -1;
	    isExclusive(offer: any): any;
	    isOptional(offer: any): boolean;
	    isEssential(offer: any): any;
	    isNotEssential(offer: any): boolean;
	    isModelByNbUser(offer: any): boolean;
	    isPrepaid(offer: any): any;
	    isNotPrepaid(offer: any): boolean;
	    createOfferFromData(data: any): Offer;
	    createOfferFromSubscriptionData(subscription: any): Offer;
	    createOfferFromProfileData(profile: any): Offer;
	} let offerManager: OfferManager;
	export { Offer, offerManager };

}
declare module 'lib/common/models/PresenceRainbow' {
	 enum PresenceLevel {
	    /** Offline/Invisible The presence of the contact is not connected */
	    Offline = "offline",
	    /** Offline/Invisible The presence of the contact is not connected */
	    Invisible = "invisible",
	    /** The presence of the contact is connected */
	    Online = "online",
	    /** The presence of the contact is connected on mobile */
	    OnlineMobile = "online-mobile",
	    /** The presence of the contact is connected but away from a long time */
	    Away = "away",
	    /** The presence of the contact is in "Do not disturb" state */
	    Dnd = "dnd",
	    /** The presence of the contact is in "Busy" state */
	    Busy = "busy",
	    /** The presence of the contact appear offline but to stay still connected. */
	    Xa = "xa",
	    /** The presence of the contact is not known */
	    Unknown = "Unknown",
	    /** internal */
	    Chat = "chat",
	    /** The presence of the contact is an empty string */
	    EmptyString = ""
	} enum PresenceShow {
	    /** The presence of the contact is connected */
	    Online = "online",
	    /** The presence of the contact is disconnected */
	    Offline = "offline",
	    /** The contact is in "Do not disturb" state */
	    Dnd = "dnd",
	    /** For current contact only - to appear offline but to stay still connected */
	    Xa = "xa",
	    /** The contact is away */
	    Away = "away",
	    /** The Show is Chat */
	    Chat = "chat",
	    /** The Show is empty string */
	    EmptyString = ""
	} enum PresenceStatus {
	    /** The presence of the contact is connected */
	    Online = "online",
	    /** The presence of the contact is disconnected */
	    ModeAuto = "mode=auto",
	    /** The contact is connected but away from a long time */
	    Away = "away",
	    /** The contact is on phone */
	    Phone = "phone",
	    /** The contact is on presentation */
	    Presentation = "presentation",
	    /** The contact is on mobile phone */
	    Mobile = "mobile",
	    /** The status is empty string. */
	    EmptyString = ""
	} enum PresenceDetails {
	    Inactive = "inactive",
	    Audio = "audio",
	    Video = "video",
	    Sharing = "sharing",
	    Presentation = "presentation",
	    Busy = "busy",
	    OutOfOffice = "out_of_office",
	    Free = "free",
	    EmptyString = ""
	} enum PresencePhone {
	    /** The PBX service is available - the phone is not currently used */
	    EVT_CONNECTION_CLEARED = "EVT_CONNECTION_CLEARED",
	    /** The PBX service is available - there is a incoming or outgoing call in ringing state */
	    EVT_SERVICE_INITIATED = "EVT_SERVICE_INITIATED",
	    /** The PBX service is available - there is a current call */
	    EVT_ESTABLISHED = "EVT_ESTABLISHED",
	    /** The PBX service is not available / operational so we don't know the presence phone */
	    NOT_AVAILABLE = "NOT_AVAILABLE"
	} class PresenceInfo {
	    get presenceShow(): string;
	    set presenceShow(value: string);
	    private _presenceLevel;
	    private _presenceDetails;
	    private _presenceShow;
	    private _presenceStatus;
	    constructor(presenceLevel?: PresenceLevel, presenceDetails?: PresenceDetails);
	    get presenceLevel(): PresenceLevel | string;
	    set presenceLevel(value: PresenceLevel | string);
	    get presenceDetails(): PresenceDetails;
	    set presenceDetails(value: PresenceDetails);
	    get presenceStatus(): string;
	    set presenceStatus(value: string);
	    toJsonForServer(): {
	        show: string;
	        status: string;
	    };
	} class PresenceCalendar extends PresenceInfo {
	    private _until;
	    constructor(presenceLevel?: PresenceLevel, presenceStatus?: string, presenceDetails?: PresenceDetails, until?: Date);
	    get until(): Date;
	    set until(value: Date);
	} class PresenceRainbow extends PresenceInfo {
	    private _resource;
	    private _date;
	    constructor(presenceLevel?: PresenceLevel, presenceStatus?: string, presenceDetails?: PresenceDetails, resource?: string, date?: Date);
	    get resource(): string;
	    set resource(value: string);
	    get date(): Date;
	    set date(value: Date);
	}
	export { PresenceCalendar, PresenceInfo, PresenceLevel, PresenceShow, PresenceStatus, PresenceDetails, PresencePhone, PresenceRainbow };

}
declare module 'lib/common/models/Contact' {
	export {}; const AdminType: {
	    /** Organization administrator */
	    ORGANIZATION_ADMIN: string;
	    /** Company administrator */
	    COMPANY_ADMIN: string;
	    /** Site administrator */
	    SITE_ADMIN: string;
	    /** No administrator right */
	    UNDEFINED: string;
	}; const NameUpdatePrio: {
	    /** no update prio then could be updated */
	    NO_UPDATE_PRIO: number;
	    /** prio associated to outlook name resolution update */
	    OUTLOOK_UPDATE_PRIO: number;
	    /** prio associated to server name resolution (phonebook or office365AD ...) update */
	    SERVER_UPDATE_PRIO: number;
	    /** max prio : no update could overwrite */
	    MAX_UPDATE_PRIO: number;
	}; class Contact {
	    id: any;
	    _displayName: any;
	    name: any;
	    displayNameMD5: any;
	    companyName: any;
	    loginEmail: any;
	    nickName: any;
	    title: any;
	    jobTitle: any;
	    country: any;
	    timezone: any;
	    organisationId: any;
	    siteId: any;
	    companyId: any;
	    jid_im: any;
	    jid: any;
	    jid_tel: any;
	    jidtel: any;
	    avatar: any;
	    lastAvatarUpdateDate: any;
	    lastUpdateDate: any;
	    adminType: any;
	    roles: any;
	    phoneNumbers: any;
	    phonePro: any;
	    phoneProCan: any;
	    phonePbx: any;
	    phoneInternalNumber: any;
	    pbxId: any;
	    mobilePro: any;
	    mobileProCan: any;
	    phonePerso: any;
	    phonePersoCan: any;
	    mobilePerso: any;
	    mobilePersoCan: any;
	    voicemailNumber: any;
	    emails: any;
	    emailPro: any;
	    emailPerso: any;
	    lastName: any;
	    firstName: any;
	    isTerminated: any;
	    language: any;
	    presence: string;
	    status: any;
	    resources: any;
	    nameUpdatePrio: any;
	    initials: any;
	    nickname: any;
	    roster: any;
	    initialized: any;
	    colorIndex: any;
	    color: any;
	    _id: any;
	    isInDefaultCompany: any;
	    company: any;
	    hasPhoneNumber: any;
	    guestMode: any;
	    openInviteId: any;
	    userInfo1: null;
	    userInfo2: null;
	    ask: string;
	    subscription: string;
	    temp: boolean;
	    invitation: any;
	    selectedTheme: string;
	    customData: any;
	    isVirtualTerm: boolean;
	    private _lastContactCacheUpdate;
	    constructor();
	    updateLastContactCacheUpdate(): void;
	    isObsoleteCache(): boolean;
	    /**
	     * @public
	     * @readonly
	     * @property {string} displayName The display name of the Contact
	     * @instance
	     */
	    set displayName(value: any);
	    get displayName(): any;
	    setNameUpdatePrio(prio: any): void;
	    getNameUpdatePrio(): any;
	    displayNameForLog(): any;
	    computeCompleteDisplayName(firstName: any, lastName: any): void;
	    computeDisplayName(): void;
	    updateName(firstName: any, lastName: any): void;
	    updateFromUserData(userData: any): void;
	    isGuest(): any;
	}
	export { Contact as Contact, AdminType as AdminType, NameUpdatePrio as NameUpdatePrio };

}
declare module 'lib/connection/XMPPServiceHandler/favoriteEventHandler' {
	export {};
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class FavoriteEventHandler extends GenericHandler {
	    MESSAGE_CHAT: any;
	    MESSAGE_GROUPCHAT: any;
	    MESSAGE_WEBRTC: any;
	    MESSAGE_MANAGEMENT: any;
	    MESSAGE_ERROR: any;
	    MESSAGE_HEADLINE: any;
	    MESSAGE_CLOSE: any;
	    channelsService: any;
	    findAttrs: any;
	    findChildren: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: any, channelsService: any);
	    onManagementMessageReceived(msg: any, stanza: any): void;
	    onFavoriteManagementMessageReceived(stanza: any): boolean;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): void;
	}
	export { FavoriteEventHandler };

}
declare module 'lib/common/models/AlertFilter' {
	export {};
	import { List } from 'ts-generic-collections-linq'; class AlertFilter {
	    id: string;
	    name: string;
	    companyId: string;
	    tags: List<string>;
	    constructor(id?: string, name?: string, companyId?: string, tags?: List<string>);
	} class AlertFiltersData {
	    private alertFilters;
	    total: number;
	    limit: number;
	    offset: number;
	    private lockEngine;
	    private lockKey;
	    constructor(limit?: number);
	    lock(fn: any): any;
	    addAlertFilter(alertFilter: AlertFilter): Promise<AlertFilter>;
	    removeBubbleToJoin(alertFilter: AlertFilter): Promise<any>;
	    getAlertFilter(): Promise<AlertFilter>;
	    first(): Promise<AlertFilter>;
	    last(): Promise<AlertFilter>;
	}
	export { AlertFilter, AlertFiltersData };

}
declare module 'lib/common/models/Favorite' {
	export {}; class Favorite {
	    id: string;
	    peerId: string;
	    type: string;
	    room: any;
	    contact: any;
	    conv: any;
	    constructor(id: string, peerId: string, type: string);
	}
	export { Favorite };

}
declare module 'lib/services/FavoritesService' {
	/// <reference types="node" />
	import { Logger } from 'lib/common/Logger';
	export {};
	import { Favorite } from 'lib/common/models/Favorite';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService'; class FavoritesService extends GenericService {
	    private _favoriteEventHandler;
	    private _favoriteHandlerToken;
	    private favorites;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<void>;
	    stop(): Promise<void>;
	    init(): Promise<void>;
	    private attachHandlers;
	    reconnect(): Promise<void>;
	    private getServerFavorites;
	    private addServerFavorite;
	    private removeServerFavorite;
	    private toggleFavorite;
	    private updateFavorites;
	    /**
	     * @description
	     * get favorite from cach by Id.
	     * @param {string} peerId The id of the favorite.
	     * @return {Promise<Favorite>} The favorite corresponding to the peerId
	     */
	    getFavorite(peerId: string): Promise<Favorite>;
	    private createFavoriteObj;
	    private onXmppEvent;
	    /**
	     * @public
	     * @since 1.56
	     * @method fetchAllFavorites()
	     * @instance
	     * @description
	     *   Fetch all the Favorites from the server in a form of an Array <br/>
	     * @return {Array<Favorite>} An array of Favorite objects
	     */
	    fetchAllFavorites(): Promise<Array<Favorite>>;
	    /**
	     * @public
	     * @since 1.56
	     * @method createFavorite()
	     * @instance
	     * @description
	     *   Add conversation/bubble/bot to Favorites Array <br/>
	     * @param {string} id of the conversation/bubble
	     * @param {string} type of Favorite (can be 'user' or 'bubble')
	     * @return {Promise<Favorite>} A Favorite object
	     */
	    createFavorite(id: string, type: string): Promise<Favorite>;
	    /**
	     * @public
	     * @since 1.56
	     * @method deleteFavorite()
	     * @instance
	     * @description
	     *   Delete conversation/bubble/bot from Favorites Array <br/>
	     * @param {string} id of the Favorite item
	     * @return {Favorite[]} A Favorite object
	     */
	    deleteFavorite(id: string): Promise<any>;
	    onFavoriteCreated(fav: {
	        id: string;
	        peerId: string;
	        type: string;
	    }): Promise<void>;
	    onFavoriteDeleted(fav: {
	        id: string;
	        peerId: string;
	        type: string;
	    }): Promise<void>;
	}
	export { FavoritesService };

}
declare module 'lib/connection/XMPPServiceHandler/invitationEventHandler' {
	export {};
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class InvitationEventHandler extends GenericHandler {
	    MESSAGE_CHAT: any;
	    MESSAGE_GROUPCHAT: any;
	    MESSAGE_WEBRTC: any;
	    MESSAGE_MANAGEMENT: any;
	    MESSAGE_ERROR: any;
	    MESSAGE_HEADLINE: any;
	    MESSAGE_CLOSE: any;
	    invitationService: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: any, invitationService: any);
	    onManagementMessageReceived(msg: any, stanza: any): void;
	    onInvitationManagementMessageReceived(stanza: any): boolean;
	    onOpenInvitationManagementMessageReceived(stanza: any): boolean;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): void;
	    findAttrs(): void;
	}
	export { InvitationEventHandler };

}
declare module 'lib/common/models/Invitation' {
	export {}; class Invitation {
	    id: any;
	    invitedUserId: any;
	    invitedUserEmail: any;
	    invitedPhoneNumber: any;
	    invitingUserId: any;
	    invitingUserEmail: any;
	    requestNotificationLanguage: any;
	    invitingDate: any;
	    lastNotificationDate: any;
	    status: any;
	    type: any;
	    defaultAvatar: null;
	    inviteToJoinMeeting: any;
	    constructor(id: any, invitedUserId: any, invitedUserEmail: any, invitingUserId: any, invitingUserEmail: any, requestNotificationLanguage: any, invitingDate: any, lastNotificationDate: any, status: any, type: any, inviteToJoinMeeting: any, invitedPhoneNumber: any);
	    createDefaultAvatar(): void;
	    /*************************************************************/
	    /*************************************************************/
	    static create(id: any, invitedUserId: any, invitedUserEmail: any, invitingUserId: any, invitingUserEmail: any, requestNotificationLanguage: any, invitingDate: any, lastNotificationDate: any, status: any, type: any, inviteToJoinMeeting: any, invitedPhoneNumber: any): Invitation;
	    static createFromData(invitationData: any): Invitation;
	}
	export { Invitation as Invitation };

}
declare module 'lib/common/models/Bubble' {
	import { Contact } from 'lib/common/models/Contact';
	export {}; class Bubble {
	    id: any;
	    name: any;
	    topic: any;
	    jid: any;
	    creator: any;
	    history: any;
	    users: any;
	    creationDate: any;
	    visibility: any;
	    customData: any;
	    isActive: any;
	    conference: any;
	    disableNotifications: boolean;
	    lastAvatarUpdateDate: null;
	    guestEmails: any[];
	    confEndpoints: [];
	    activeUsersCounter: number;
	    avatar: String;
	    organizers: Array<any>;
	    members: Array<any>;
	    containerId: string;
	    containerName: string;
	    static RoomUserStatus: {
	        INVITED: string;
	        ACCEPTED: string;
	        UNSUBSCRIBED: string;
	        REJECTED: string;
	        DELETED: string;
	    };
	    autoRegister: any;
	    lastActivityDate: any;
	    /**
	     * @private
	     * @readonly
	     * @enum {number}
	     */
	    static Type: {
	        PRIVATE: number;
	        PUBLIC: number;
	    };
	    /**
	     * The privilege of the Contact in the Bubble.
	     * @public
	     * @readonly
	     * @enum {String}
	     */
	    static Privilege: {
	        /** User level */
	        USER: string;
	        /** Moderator level */
	        MODERATOR: string;
	        /** Guest level */
	        GUEST: string;
	    };
	    /**
	     * Behaviour of the Bubble's History
	     * @public
	     * @readonly
	     * @enum {String}
	     */
	    static History: {
	        /** Full bubble history is accessible for newcomers */
	        ALL: string;
	        /** No history is accessible for newcomers, only new messages posted */
	        NONE: string;
	    };
	    /**
	     * @description the creator (owner ) of the bubble.
	     */
	    ownerContact: Contact;
	    owner: boolean;
	    autoAcceptInvitation: boolean;
	    tags: Array<any>;
	    constructor(_id: any, _name: any, _topic: any, _jid: any, _creator: any, _history: any, _users: any, _creationDate: any, _visibility: any, _customData: any, _isActive: any, _conference: any, _disableNotifications: boolean, _lastAvatarUpdateDate: any, _guestEmails: [], _confEndpoints: [], _activeUsersCounter: number, _autoRegister: boolean, _lastActivityDate: any, _autoAcceptInvitation?: boolean, _tags?: Array<any>, _avatarDomain?: String, _containerId?: string, _containerName?: string);
	    /**
	     * Method helper to know if room is a meeting
	     * @private
	     */
	    isMeetingBubble(): boolean;
	    getStatusForUser(userId: any): any;
	    setUsers(_users: any): void;
	    updateBubble(data: any, contactsService: any): Promise<this>;
	    /**
	     * @function
	     * @public
	     * @name BubbleFactory
	     * @description
	     * This class is used to create a bubble from data object
	     */
	    static BubbleFactory(avatarDomain: any, contactsService: any): (data: any) => Promise<Bubble>;
	}
	export { Bubble };

}
declare module 'lib/common/promiseQueue' {
	export {}; class PromiseQueue {
	    logger: any;
	    queue: any;
	    started: any;
	    constructor(_logger: any);
	    add(promise: any): void;
	    execute(): void;
	} let createPromiseQueue: (_logger: any) => PromiseQueue;
	export { createPromiseQueue };

}
declare module 'lib/services/ProfilesService' {
	/// <reference types="node" />
	import { GenericService } from 'lib/services/GenericService';
	export {};
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger'; const FeaturesEnum: {
	    COMPANY_ADMIN_COUNT: string;
	    COMPANY_LOGO_MODIFICATION: string;
	    COMPANY_DOMAIN_NAME_MODIFICATION: string;
	    COMPANY_DETAILS_MODIFICATION: string;
	    WEBRTC_FOR_MOBILE: string;
	    BUBBLE_PARTICIPANT_COUNT: string;
	    TELEPHONY_BASIC_CALL: string;
	    TELEPHONY_SECOND_CALL: string;
	    TELEPHONY_TRANSFER_CALL: string;
	    TELEPHONY_CONFERENCE_CALL: string;
	    TELEPHONY_DEFLECT_CALL: string;
	    TELEPHONY_PHONE_BOOK: string;
	    TELEPHONY_VOICE_MAIL: string;
	    TELEPHONY_CALL_FORWARD: string;
	    TELEPHONY_NOMADIC: string;
	    CONFERENCE_PARTICIPANT_COUNT: string;
	    CONFERENCE_PARTICIPANT_ALLOWED: string;
	    WEBRTC_CONFERENCE_ALLOWED: string;
	    WEBRTC_CONFERENCE_PARTICIPANT_COUNT: string;
	    WEBRTC_PARTICIPANT_ALLOWED: string;
	    CONFERENCE_ALLOWED: string;
	    CONFERENCE_DIAL_OUT: string;
	    CONFERENCE_RECORDING: string;
	    MSO365_CALENDAR_PRESENCE: string;
	    MSO365_DIRECTORY_SEARCH: string;
	    MS_OUTLOOK_PLUGIN: string;
	    MS_SKYPE_PLUGIN: string;
	    FILE_SHARING_QUOTA_GB: string;
	    GOOGLE_CALENDAR_PRESENCE: string;
	    WEBRTC_P2P_RECORDING: string;
	    BUBBLE_PROMOTE_MEMBER: string;
	    BUBBLE_GUESTS_ALLOWED: string;
	    TELEPHONY_WEBRTC_GATEWAY: string;
	    TELEPHONY_WEBRTC_PSTN_CALLING: string;
	    ANALYTICS_DASHBOARD_EC: string;
	    ANALYTICS_DASHBOARD_BP: string;
	    TELEPHONY_CALL_SUBJECT: string;
	    CHANNEL_CREATE: string;
	    CHANNEL_CREATE_ADMIN_ROLE_BYPASS: string;
	    CHANNEL_ACTIVATED: string;
	    PERSONAL_CONFERENCE_ALLOWED: string;
	    ALERT_NOTIFICATIONS_ALLOWED: string;
	}; class ProfilesService extends GenericService {
	    private onUserUpdateNeeded;
	    private stats;
	    features: any;
	    profiles: any;
	    mainOffers: any;
	    private startDate;
	    private timer;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    /*********************************************************************/
	    /** LIFECYCLE STUFF                                                 **/
	    /*********************************************************************/
	    start(_options: any, _core: any, stats: any): void;
	    stop(): Promise<any>;
	    restart(): void;
	    init(): Promise<unknown>;
	    /*********************************************************************/
	    /** PROFILE API STUFF                                          **/
	    /*********************************************************************/
	    getServerProfile(): Promise<[unknown, unknown]>;
	    getServerProfiles(): Promise<unknown>;
	    getServerProfilesFeatures(): Promise<unknown>;
	    /*********************************************************************/
	    /** USER DATA API STUFF                                             **/
	    /*********************************************************************/
	    /**
	     * APIs for GUI components
	     * Used by SDK (public)
	     * Warning when modifying this method
	     */
	    isFeatureEnabled(featureUniqueRef: any): any;
	    getFeatureLimitMax(featureUniqueRef: any): any;
	    getFeatureLimitMin(featureUniqueRef: any): any;
	    /**
	     * Returns the profile "Enterprise", "Business", "Essential" or null (if none of them)
	     */
	    getMyProfileOffer(): any;
	    getMyProfileName(): any;
	    /**
	     * APIs for GUI components
	     * Used by SDK (public)
	     */
	    getMyProfiles(): any[];
	    /**
	     * Used by SDK (public)
	     * Warning when modifying this method
	     */
	    getMyProfileFeatures(): {};
	    getFeaturesEnum(): {
	        COMPANY_ADMIN_COUNT: string;
	        COMPANY_LOGO_MODIFICATION: string;
	        COMPANY_DOMAIN_NAME_MODIFICATION: string;
	        COMPANY_DETAILS_MODIFICATION: string;
	        WEBRTC_FOR_MOBILE: string;
	        BUBBLE_PARTICIPANT_COUNT: string;
	        TELEPHONY_BASIC_CALL: string;
	        TELEPHONY_SECOND_CALL: string;
	        TELEPHONY_TRANSFER_CALL: string;
	        TELEPHONY_CONFERENCE_CALL: string;
	        TELEPHONY_DEFLECT_CALL: string;
	        TELEPHONY_PHONE_BOOK: string;
	        TELEPHONY_VOICE_MAIL: string;
	        TELEPHONY_CALL_FORWARD: string;
	        TELEPHONY_NOMADIC: string;
	        CONFERENCE_PARTICIPANT_COUNT: string;
	        CONFERENCE_PARTICIPANT_ALLOWED: string;
	        WEBRTC_CONFERENCE_ALLOWED: string;
	        WEBRTC_CONFERENCE_PARTICIPANT_COUNT: string;
	        WEBRTC_PARTICIPANT_ALLOWED: string;
	        CONFERENCE_ALLOWED: string;
	        CONFERENCE_DIAL_OUT: string;
	        CONFERENCE_RECORDING: string;
	        MSO365_CALENDAR_PRESENCE: string;
	        MSO365_DIRECTORY_SEARCH: string;
	        MS_OUTLOOK_PLUGIN: string;
	        MS_SKYPE_PLUGIN: string;
	        FILE_SHARING_QUOTA_GB: string;
	        GOOGLE_CALENDAR_PRESENCE: string;
	        WEBRTC_P2P_RECORDING: string;
	        BUBBLE_PROMOTE_MEMBER: string;
	        BUBBLE_GUESTS_ALLOWED: string;
	        TELEPHONY_WEBRTC_GATEWAY: string;
	        TELEPHONY_WEBRTC_PSTN_CALLING: string;
	        ANALYTICS_DASHBOARD_EC: string;
	        ANALYTICS_DASHBOARD_BP: string;
	        TELEPHONY_CALL_SUBJECT: string;
	        CHANNEL_CREATE: string;
	        CHANNEL_CREATE_ADMIN_ROLE_BYPASS: string;
	        CHANNEL_ACTIVATED: string;
	        PERSONAL_CONFERENCE_ALLOWED: string;
	        ALERT_NOTIFICATIONS_ALLOWED: string;
	    };
	}
	export { ProfilesService, FeaturesEnum };

}
declare module 'lib/common/models/ConferenceSession' {
	import { List } from 'ts-generic-collections-linq';
	export {}; class Participant {
	    private _id;
	    private _jid_im;
	    private _phoneNumber;
	    private _moderator;
	    private _muted;
	    private _hold;
	    private _connected;
	    constructor();
	    get id(): string;
	    set id(value: string);
	    get jid_im(): string;
	    set jid_im(value: string);
	    get phoneNumber(): string;
	    set phoneNumber(value: string);
	    get moderator(): boolean;
	    set moderator(value: boolean);
	    get muted(): boolean;
	    set muted(value: boolean);
	    get hold(): boolean;
	    set hold(value: boolean);
	    get connected(): boolean;
	    set connected(value: boolean);
	    ToString(): string;
	} class Publisher {
	    private _id;
	    private _jid_im;
	    private _media;
	    constructor();
	    get id(): string;
	    set id(value: string);
	    get jid_im(): string;
	    set jid_im(value: string);
	    get media(): List<string>;
	    set media(value: List<string>);
	    ToString(): string;
	} class ConferenceSession {
	    private _id;
	    private _active;
	    private _muted;
	    private _locked;
	    private _recordStarted;
	    private _mediaType;
	    private _participants;
	    private _publishers;
	    private _talkers;
	    constructor();
	    get id(): string;
	    set id(value: string);
	    get active(): boolean;
	    set active(value: boolean);
	    get muted(): boolean;
	    set muted(value: boolean);
	    get locked(): boolean;
	    set locked(value: boolean);
	    get recordStarted(): boolean;
	    set recordStarted(value: boolean);
	    get mediaType(): string;
	    set mediaType(value: string);
	    get participants(): List<Participant>;
	    set participants(value: List<Participant>);
	    get publishers(): List<Publisher>;
	    set publishers(value: List<Publisher>);
	    get talkers(): List<String>;
	    set talkers(value: List<String>);
	    ToString(): string;
	}
	export { ConferenceSession };

}
declare module 'lib/common/models/ConferencePassCodes' {
	export {}; class ConferencePassCodes {
	    private _moderatorPassCode;
	    private _participantPassCode;
	    constructor();
	    get moderatorPassCode(): string;
	    set moderatorPassCode(value: string);
	    get participantPassCode(): string;
	    set participantPassCode(value: string);
	    ToString(): string;
	}
	export { ConferencePassCodes };

}
declare module 'lib/common/models/Conference' {
	import { MEDIATYPE } from 'lib/connection/RESTService';
	export {}; class Conference {
	    private _companyId;
	    private _id;
	    private _mediaType;
	    private _name;
	    private _passCodes;
	    private _scheduled;
	    private _lastUpdateDate;
	    private _confDialOutDisabled;
	    private _playEntryTone;
	    private _userId;
	    private _muteUponEntry;
	    /**
	     * @this Conference
	     */
	    constructor(companyId: any, // (String) Company unique identifier
	    id: any, // (String) unique identifier of conference
	    mediaType: any, // (String) mediaType of conference ("pstnAudio", "webrtc", "webrtcSharingOnly")
	    name: any, // (String) name of conference
	    passCodes: any, // (Array) list of passcodes
	    scheduled: any, // (Boolean) true if it is a scheduled meeting, false otherwise
	    lastUpdateDate: any, // (String) last update date of conference (e.g. 2018-06-20T09:08:00.000Z)
	    userId: any, // (String) user unique identifier
	    confDialOutDisabled: any, // (Boolean) true if dialOut from PGi is disabled
	    playEntryTone: any, // (Boolean) A tone is played when participant enters the conference.
	    muteUponEntry: any);
	    static createFromData(data: any): Conference;
	    /**
	     * @private
	     * @property {string} updateFromData Allow to update an existing conference with data from server
	     * @readonly
	     */
	    updateFromData(data: any): void;
	    get companyId(): string;
	    set companyId(value: string);
	    get id(): string;
	    set id(value: string);
	    get mediaType(): MEDIATYPE;
	    set mediaType(value: MEDIATYPE);
	    get name(): string;
	    set name(value: string);
	    get passCodes(): any;
	    set passCodes(value: any);
	    get scheduled(): boolean;
	    set scheduled(value: boolean);
	    get lastUpdateDate(): string;
	    set lastUpdateDate(value: string);
	    get confDialOutDisabled(): string;
	    set confDialOutDisabled(value: string);
	    get playEntryTone(): boolean;
	    set playEntryTone(value: boolean);
	    get userId(): string;
	    set userId(value: string);
	    get muteUponEntry(): boolean;
	    set muteUponEntry(value: boolean);
	}
	export { Conference };

}
declare module 'lib/common/BubblesManager' {
	/// <reference types="node" />
	import { Bubble } from 'lib/common/models/Bubble';
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	export {}; class BubblesManager {
	    private _xmpp;
	    private _logger;
	    private _eventEmitter;
	    private _imOptions;
	    private _rest;
	    private _presence;
	    private _bubblesservice;
	    private _options;
	    private _s2s;
	    private _useXMPP;
	    private _useS2S;
	    private fibonacciStrategy;
	    private poolBubbleToJoin;
	    private poolBubbleJoinInProgress;
	    private poolBubbleAlreadyJoined;
	    private lockEngine;
	    private lockKey;
	    private nbBubbleAdded;
	    private delay;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger);
	    init(_options: any, _core: Core): Promise<unknown>;
	    reset(): Promise<any>;
	    lock(fn: any): any;
	    addBubbleToJoin(bubble: any): Promise<any>;
	    removeBubbleToJoin(bubble: any): Promise<any>;
	    getBubbleToJoin(): Promise<Bubble>;
	    treatAllBubblesToJoin(): Promise<unknown>;
	    /**
	     * @private
	     * @method _onAffiliationDetailsChanged
	     * @instance
	     * @param {Object} affiliation contains information about bubble and user's jid
	     * @description
	     *      Method called when affilitation (presence) to a bubble changed
	     */
	    _onAffiliationDetailsChanged(bubble: any): Promise<void>;
	    /**
	     * @private
	     * @method _onbubblepresencechanged
	     * @instance
	     * @param {Object} affiliation contains information about bubble and user's jid
	     * @description
	     *      Method called when affilitation (presence) to a bubble changed
	     */
	    _onbubblepresencechanged(bubblepresenceinfo: any): Promise<void>;
	    addBubbleToJoinInProgress(bubble: any): Promise<any>;
	    removeBubbleToJoinInProgress(bubble: any): Promise<any>;
	    resetBubbleFromJoinInProgressToBubbleToJoin(): Promise<any>;
	    addBubbleAlreadyJoined(bubble: any): Promise<any>;
	    removeBubbleAlreadyJoined(bubble: any): Promise<any>;
	}
	export { BubblesManager };

}
declare module 'lib/services/BubblesService' {
	/// <reference types="node" />
	import { List } from 'ts-generic-collections-linq';
	import { MEDIATYPE } from 'lib/connection/RESTService';
	import { Bubble } from 'lib/common/models/Bubble';
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { Contact } from 'lib/common/models/Contact';
	import { ConferenceSession } from 'lib/common/models/ConferenceSession';
	import { ConferencePassCodes } from 'lib/common/models/ConferencePassCodes';
	import { GenericService } from 'lib/services/GenericService';
	export {}; class Bubbles extends GenericService {
	    private _bubbles;
	    private avatarDomain;
	    private _contacts;
	    private _profileService;
	    private _presence;
	    private _personalConferenceBubbleId;
	    private _personalConferenceConfEndpointId;
	    private _conferenceEndpoints;
	    private _conferencesSessionById;
	    private _linkConferenceAndBubble;
	    private _webrtcConferenceId;
	    _webConferenceRoom: any;
	    private readonly _protocol;
	    private readonly _host;
	    private readonly _port;
	    private bubblesManager;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    /**
	     * @public
	     * @method createBubble
	     * @instance
	     * @description
	     *  Create a new bubble <br/>
	     * @param {string} name  The name of the bubble to create
	     * @param {string} description  The description of the bubble to create
	     * @param {boolean} withHistory If true, a newcomer will have the complete messages history since the beginning of the bubble. False if omitted
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - Bubble object, else an ErrorManager object
	     * @category async
	     */
	    createBubble(name: any, description: any, withHistory: any): Promise<unknown>;
	    /**
	     * @public
	     * @method isBubbleClosed
	     * @instance
	     * @param {Bubble} bubble  The bubble to check
	     * @return {boolean} True if the bubble is closed
	     * @description
	     *  Check if the bubble is closed or not. <br/>
	     */
	    isBubbleClosed(bubble: any): boolean;
	    /**
	     * @public
	     * @method
	     * @instance
	     * @description
	     *    Delete all existing owned bubbles <br/>
	     *    Return a promise <br/>
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    deleteAllBubbles(): void;
	    /**
	     * @public
	     * @method
	     * @instance
	     * @description
	     *    Delete all existing owned bubbles <br/>
	     *    Return a promise <br/>
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    closeAnddeleteAllBubbles(): void;
	    /**
	     * @public
	     * @method deleteBubble
	     * @instance
	     * @param {Bubble} bubble  The bubble to delete
	     * @description
	     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants. <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble removed, else an ErrorManager object
	     * @category async
	     */
	    deleteBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method closeAndDeleteBubble
	     * @instance
	     * @param {Bubble} bubble  The bubble to close + delete
	     * @description
	     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants. <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble removed, else an ErrorManager object
	     * @category async
	     */
	    closeAndDeleteBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method closeBubble
	     * @instance
	     * @param {Bubble} bubble The Bubble to close
	     * @description
	     *  Close a owned bubble. When the owner closes a bubble, the bubble is archived and only accessible in read only mode for all participants. <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble closed, else an ErrorManager object
	     * @category async
	     */
	    closeBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method archiveBubble
	     * @instance
	     * @param {Bubble} bubble  The bubble to archive
	     * @description
	     *  Archive  a bubble. <br/>
	     *  This API allows to close the room in one step. The other alternative is to change the status for each room users not deactivated yet. <br/>
	     *  All users currently having the status 'invited' or 'accepted' will receive a message/stanza . <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The operation result
	     * @category async
	     */
	    archiveBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method leaveBubble
	     * @instance
	     * @param {Bubble} bubble  The bubble to leave
	     * @description
	     *  Leave a bubble. If the connected user is a moderator, an other moderator should be still present in order to leave this bubble. <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The operation result
	     * @category async
	     */
	    leaveBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getUsersFromBubble
	     * @instance
	     * @param {Bubble} bubble           The bubble
	     * @param {Object} options          The criterias to select the users to retrieve <br/>
	     * format : Allows to retrieve more or less user details in response, besides specifics data about room users like (privilege, status and additionDate) <br/>
	     * - small: userId loginEmail displayName jid_im <br/>
	     * - medium: userId loginEmail displayName jid_im status additionDate privilege firstName lastName companyId companyName <br/>
	     * - full: userId loginEmail displayName jid_im status additionDate privilege firstName lastName nickName title jobTitle emails country language timezone companyId companyName roles adminType <br/>
	     * sortField : Sort items list based on the given field <br/>
	     * privilege : Allows to filter users list on the privilege type provided in this option. <br/>
	     * limit : Allow to specify the number of items to retrieve. <br/>
	     * offset : Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. <br/>
	     * sortOrder : Specify order when sorting items list. Available values -1, 1 (default) <br/>
	     * @description
	     *  Get a list of users in a bubble filtered by criterias. <br/>
	     * @async
	     * @return {Promise<Array, ErrorManager>}
	     */
	    getUsersFromBubble(bubble: any, options?: Object): Promise<unknown>;
	    /**
	     * @public
	     * @method getStatusForConnectedUserInBubble
	     * @instance
	     * @param {Bubble} bubble           The bubble
	     * @description
	     *  Get the status of the connected user in a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     */
	    getStatusForConnectedUserInBubble(bubble: any): any;
	    /**
	     * @public
	     * @method inviteContactToBubble
	     * @instance
	     * @param {Contact} contact         The contact to invite
	     * @param {Bubble} bubble           The bubble
	     * @param {boolean} isModerator     True to add a contact as a moderator of the bubble
	     * @param {boolean} withInvitation  If true, the contact will receive an invitation and will have to accept it before entering the bubble. False to force the contact directly in the bubble without sending an invitation.
	     * @param {string} reason        The reason of the invitation (optional)
	     * @description
	     *  Invite a contact in a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the new invitation
	     * @category async
	     */
	    inviteContactToBubble(contact: any, bubble: any, isModerator: any, withInvitation: any, reason: any): Promise<unknown>;
	    /**
	     * @public
	     * @method inviteContactsByEmailsToBubble
	     * @instance
	     * @param {Contact} contactsEmails         The contacts email tab to invite
	     * @param {Bubble} bubble           The bubble
	     * @description
	     *  Invite a list of contacts by emails in a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the new invitation
	     * @category async
	     */
	    inviteContactsByEmailsToBubble(contactsEmails: any, bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method promoteContactInBubble
	     * @instance
	     * @param {Contact} contact         The contact to promote or downgraded
	     * @param {Bubble} bubble           The bubble
	     * @param {boolean} isModerator     True to promote a contact as a moderator of the bubble, and false to downgrade
	     * @description
	     *  Promote or not a contact in a bubble <br/>
	     *  The logged in user can't update himself. As a result, a 'moderator' can't be downgraded to 'user'. <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the modifications
	     * @category async
	     */
	    promoteContactInBubble(contact: any, bubble: any, isModerator: any): Promise<unknown>;
	    /**
	     * @public
	     * @method promoteContactToModerator
	     * @since 1.65
	     * @instance
	     * @description
	     *    Promote a contact to moderator in a bubble <br/>
	     *    Return a promise. <br/>
	     * @param {Contact} contact The contact to promote
	     * @param {Bubble} bubble   The destination bubble
	     * @return {Promise<Bubble, ErrorManager>} The bubble object or an error object depending on the result
	     */
	    promoteContactToModerator(contact: any, bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method demoteContactFromModerator
	     * @since 1.65
	     * @instance
	     * @description
	     *    Demote a contact to user in a bubble <br/>
	     *    Return a promise. <br/>
	     * @param {Contact} contact The contact to promote
	     * @param {Bubble} bubble   The destination bubble
	     * @return {Promise<Bubble, ErrorManager>} The bubble object or an error object depending on the result
	     */
	    demoteContactFromModerator(contact: any, bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method changeBubbleOwner
	     * @instance
	     * @param {Bubble} bubble           The bubble
	     * @param {Contact} contact         The contact to set a new bubble owner
	     * @description
	     *  Set a moderator contact as owner of a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the modifications
	     * @category async
	     */
	    changeBubbleOwner(bubble: any, contact: any): Promise<unknown>;
	    /**
	     * @public
	     * @method removeContactFromBubble
	     * @instance
	     * @param {Contact} contact The contact to remove
	     * @param {Bubble} bubble   The destination bubble
	     * @description
	     *    Remove a contact from a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble object or an error object depending on the result
	     * @category async
	     */
	    removeContactFromBubble(contact: any, bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @description
	     *      Internal method
	     */
	    getBubbles(): Promise<unknown>;
	    /**
	     * @public
	     * @method getAll
	     * @instance
	     * @return {Bubble[]} The list of existing bubbles
	     * @description
	     *  Return the list of existing bubbles <br/>
	     */
	    getAll(): Bubble[];
	    /**
	     * @public
	     * @method getAllBubbles
	     * @instance
	     * @return {Bubble[]} The list of existing bubbles
	     * @description
	     *  Return the list of existing bubbles <br/>
	     */
	    getAllBubbles(): Bubble[];
	    /**
	     * @public
	     * @method getAllOwnedBubbles
	     * @instance
	     * @description
	     *    Get the list of bubbles created by the user <br/>
	     * @return {Bubble[]} An array of bubbles restricted to the ones owned by the user
	     */
	    getAllOwnedBubbles(): Bubble[];
	    private getBubbleFromCache;
	    private addOrUpdateBubbleToCache;
	    private removeBubbleFromCache;
	    /**
	     * @method getAvatarFromBubble
	     * @public
	     * @instance
	     * @param {Bubble} bubble   The destination bubble
	     * @async
	     * @return {Promise<{}>}  return a promise with {Object} A Blob object with data about the avatar picture.
	     * @description
	     *  Get A Blob object with data about the avatar picture of the bubble. <br/>
	     */
	    getAvatarFromBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getBubblesConsumption
	     * @instance
	     * @async
	     * @return {Promise<Object>} return an object describing the consumption of bubbles : {
	        maxValue : number // The quota associated to this offer [room]
	        currentValue : number // The user's current consumption [room].
	     }
	     * @description
	     *      return an object describing the consumption of bubbles. <br/>
	     */
	    getBubblesConsumption(): Promise<unknown>;
	    /**
	     * @private
	     * @method refreshMemberAndOrganizerLists
	     * @instance
	     * @param {Bubble} bubble the bubble to refresh
	     * @async
	     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
	     * @description
	     *  Refresh members and organizers of the bubble. <br/>
	     */
	    refreshMemberAndOrganizerLists(bubble: any): any;
	    /**
	     * @public
	     * @method getBubbleById
	     * @instance
	     * @param {string} id the id of the bubble
	     * @param {boolean} [force=false] True to force a request to the server
	     * @async
	     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
	     * @description
	     *  Get a bubble by its ID in memory and if it is not found in server. <br/>
	     */
	    getBubbleById(id: any, force?: boolean): Promise<Bubble>;
	    /**
	     * @public
	     * @method getBubbleByJid
	     * @instance
	     * @param {string} jid the JID of the bubble
	     * @param {boolean} [force=false] True to force a request to the server
	     * @async
	     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
	     * @description
	     *  Get a bubble by its JID in memory and if it is not found in server. <br/>
	     */
	    getBubbleByJid(jid: any, force?: boolean): Promise<Bubble>;
	    /**
	     * @public
	     * @method getAllPendingBubbles
	     * @instance
	     * @return {Bubble[]} An array of Bubbles not accepted or declined
	     * @description
	     *  Get the list of Bubbles that have a pending invitation not yet accepted of declined <br/>
	     */
	    getAllPendingBubbles(): Bubble[];
	    /**
	     * @public
	     * @method getAllActiveBubbles
	     * @since 1.30
	     * @instance
	     * @return {Bubble[]} An array of Bubbles that are "active" for the connected user
	     * @description
	     *  Get the list of Bubbles where the connected user can chat <br/>
	     */
	    getAllActiveBubbles(): Bubble[];
	    /**
	     * @public
	     * @method getAllClosedBubbles
	     * @since 1.30
	     * @instance
	     * @return {Bubble[]} An array of Bubbles that are closed for the connected user
	     * @description
	     *  Get the list of Bubbles where the connected user can only read messages <br/>
	     */
	    getAllClosedBubbles(): Bubble[];
	    /**
	     * @public
	     * @method acceptInvitationToJoinBubble
	     * @instance
	     * @param {Bubble} bubble The Bubble to join
	     * @description
	     *  Accept an invitation to join a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated or an error object depending on the result
	     * @category async
	     */
	    acceptInvitationToJoinBubble(bubble: Bubble): Promise<unknown>;
	    /**
	     * @public
	     * @method declineInvitationToJoinBubble
	     * @instance
	     * @param {Bubble} bubble The Bubble to decline
	     * @description
	     *  Decline an invitation to join a bubble <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated or an error object depending on the result
	     * @category async
	     */
	    declineInvitationToJoinBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method setBubbleCustomData
	     * @instance
	     * @param {Bubble} bubble The Bubble
	     * @param {Object} customData Bubble's custom data area. key/value format. Maximum and size are server dependent
	     * @description
	     *  Modify all custom data at once in a bubble <br/>
	     *  To erase all custom data, put {} in customData <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the custom data set or an error object depending on the result
	     * @category async
	     */
	    setBubbleCustomData(bubble: any, customData: any): Promise<unknown>;
	    /**
	     * @private
	     * @method setBubbleVisibilityStatus
	     * @instance
	     * @param {Bubble} bubble The Bubble
	     * @param {string} status Bubble's public/private group visibility for search.  Either "private" (default) or "public"
	     * @description
	     *  Set the Bubble's visibility status <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result
	     * @category async
	     */
	    setBubbleVisibilityStatus(bubble: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method setBubbleTopic
	     * @instance
	     * @param {Bubble} bubble The Bubble
	     * @param {string} topic Bubble's topic
	     * @description
	     *  Set the Bubble's topic <br/>
	     * @memberof Bubbles
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result
	     * @category async
	     */
	    setBubbleTopic(bubble: any, topic: any): Promise<unknown>;
	    /**
	     * @public
	     * @method setBubbleName
	     * @instance
	     * @param {Bubble} bubble The Bubble
	     * @param {string} name Bubble's name
	     * @description
	     *  Set the Bubble's name <br/>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result
	     * @category async
	     */
	    setBubbleName(bubble: any, name: any): Promise<unknown>;
	    randomString(length?: number): string;
	    /**
	     * @public
	     * @method updateAvatarForBubble
	     * @since 1.65
	     * @instance
	     * @description
	     *    Update the bubble avatar (from given URL) <br/>
	     *    The image will be automaticalle resized <br/>
	     *    /!\ if URL isn't valid or given image isn't loadable, it'll fail <br/>
	     *    Return a promise. <br/>
	     * @param {string} urlAvatar  The avatarUrl
	     * @param {Bubble} bubble  The bubble to update
	     * @return {Bubble} A bubble object of null if not found
	     */
	    updateAvatarForBubble(urlAvatar: any, bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @method setAvatarBubble
	     * @param bubble
	     * @param roomAvatarPath
	     */
	    setAvatarBubble(bubble: any, roomAvatarPath: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAvatarFromBubble
	     * @since 1.65
	     * @instance
	     * @description
	     *    Delete the bubble avatar <br/>
	     *     <br/>
	     *    Return a promise. <br/>
	     * @param {Bubble} bubble  The bubble to update
	     * @return {Bubble} A bubble object of null if not found
	     */
	    deleteAvatarFromBubble(bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @method deleteAvatarBubble
	     * @param bubbleId
	     */
	    deleteAvatarBubble(bubbleId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCustomDataForBubble
	     * @since 1.64
	     * @instance
	     * @description
	     *    Update the customData of the bubble  <br/>
	     *    Return a promise. <br/>
	     * @param {Object} customData
	     *    The customData to put to the bubble <br />
	     *    Example: { "key1" : 123, "key2" : "a string" }
	     * @param {Bubble} bubble   The bubble to update
	     * @return {Promise<Bubble>} The updated Bubble
	     */
	    updateCustomDataForBubble(customData: any, bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCustomDataForBubble
	     * @since 1.65
	     * @instance
	     * @description
	     *    Delete the customData of the bubble  <br/>
	     *    Return a promise. <br/>
	     * @param {Bubble} bubble   The bubble to update
	     * @return {Promise<Bubble>} The updated Bubble
	     */
	    deleteCustomDataForBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateDescriptionForBubble
	     * @since 1.65
	     * @instance
	     * @description
	     *    Update the description of the bubble  <br/>
	     *    Return a promise. <br/>
	     * @param {Bubble} bubble   The bubble to update
	     * @param {string} strDescription   The description of the bubble (is is the topic on server side, and result event)
	     * @return {Bubble} A bubble object of null if not found
	     */
	    updateDescriptionForBubble(bubble: any, strDescription: any): Promise<unknown>;
	    /**
	     * @private
	     * @method _onInvitationReceived
	     * @instance
	     * @param {Object} invitation contains informations about bubble and user's jid
	     * @description
	     *      Method called when receiving an invitation to join a bubble <br/>
	     */
	    _onInvitationReceived(invitation: any): void;
	    /**
	     * @private
	     * @method _onAffiliationChanged
	     * @instance
	     * @param {Object} affiliation contains information about bubble and user's jid
	     * @description
	     *      Method called when affilitation to a bubble changed <br/>
	     */
	    _onAffiliationChanged(affiliation: any): Promise<void>;
	    /**
	     * @private
	     * @method _onOwnAffiliationChanged
	     * @instance
	     * @param {Object} affiliation contains information about bubble and user's jid
	     * @description
	     *      Method called when the user affilitation to a bubble changed <br/>
	     */
	    _onOwnAffiliationChanged(affiliation: any): Promise<void>;
	    /**
	     * @private
	     * @method _onCustomDataChanged
	     * @instance
	     * @param {Object} data contains information about bubble and new custom data received
	     * @description
	     *      Method called when custom data have changed for a bubble <br/>
	     */
	    _onCustomDataChanged(data: any): void;
	    /**
	     * @private
	     * @method _onTopicChanged
	     * @instance
	     * @param {Object} data contains information about bubble new topic received
	     * @description
	     *      Method called when the topic has changed for a bubble <br/>
	     */
	    _onTopicChanged(data: any): void;
	    /**
	     * @private
	     * @method _onPrivilegeBubbleChanged
	     * @instance
	     * @param {Object} bubbleInfo modified bubble info
	     * @description
	     *     Method called when the owner of a bubble changed. <br/>
	     */
	    _onPrivilegeBubbleChanged(bubbleInfo: any): Promise<void>;
	    /**
	     * @private
	     * @method _onNameChanged
	     * @instance
	     * @param {Object} data contains information about bubble new name received
	     * @description
	     *      Method called when the name has changed for a bubble <br/>
	     */
	    _onNameChanged(data: any): void;
	    /**
	     * @private
	     * @method _onbubblepresencechanged
	     * @instance
	     * @param {Object} bubbleInfo contains information about bubble
	     * @description
	     *      Method called when the name has changed for a bubble <br/>
	     */
	    _onbubblepresencechanged(bubbleInfo: any): Promise<void>;
	    /**
	     * @private
	     * @method _onBubblesContainerReceived
	     * @instance
	     * @param {Object} infos contains informations about a bubbles container
	     * @description
	     *      Method called when receiving an create/update/delete event of the bubbles container <br/>
	     */
	    _onBubblesContainerReceived(infos: any): Promise<void>;
	    /**
	     * @private
	     * @method getInfoForPublicUrlFromOpenInvite
	     * @since 1.72
	     * @instance
	     * @param {Object} openInvite contains informations about a bubbles invitation
	     * @description
	     *     get infos for the PublicUrl <br/>
	     * @return {Promise<any>}
	     */
	    getInfoForPublicUrlFromOpenInvite(openInvite: any): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfBubbles
	     * @since 1.72
	     * @instance
	     * @description
	     *     get all the PublicUrl belongs to the connected user <br/>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfBubbles(): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfBubblesOfAUser
	     * @since 1.72
	     * @instance
	     * @param  {Contact} contact user used to get all his Public Url. If not setted the connected user is used.
	     * @description
	     *     get all the PublicUrl belongs to a user <br/>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfBubblesOfAUser(contact?: Contact): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfABubble
	     * @since 1.72
	     * @instance
	     * @param {Bubble} bubble bubble from where get the public link.
	     * @description
	     *     get all the PublicUrl of a bubble belongs to the connected user <br/>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfABubble(bubble: any): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfABubbleOfAUser
	     * @since 1.72
	     * @instance
	     * @param {Contact} contact user used to get all his Public Url. If not setted the connected user is used.
	     * @param {Bubble} bubble bubble from where get the public link.
	     * @description
	     *     get all the PublicUrl of a bubble belong's to a user <br/>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfABubbleOfAUser(contact: Contact, bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method createPublicUrl
	     * @since 1.72
	     * @instance
	     * @description
	     *    Create / Get the public URL used to access the specified bubble. So a Guest or a Rainbow user can access to it just using a URL <br/>
	     *    Return a promise. <br/>
	     * @param {Bubble} bubble The bubble on which the public url is requested.
	     * @return {Promise<string>} The public url
	     */
	    createPublicUrl(bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method generateNewPublicUrl
	     * @since 1.72
	     * @instance
	     * @description
	     *    Generate a new public URL to access the specified bubble (So a Guest or a Rainbow user can access to it just using a URL) <br/>
	     *    Return a promise. <br/>
	     * <br/>
	     *    !!! The previous URL is no more functional !!! <br/>
	     * @param {Bubble} bubble The bubble on which the public url is requested.
	     * @return {Promise<string>} The public url
	     */
	    generateNewPublicUrl(bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method removePublicUrl
	     * @since 1.72
	     * @instance
	     * @description
	     *    'Remove' the public URL used to access the specified bubble. So it's no more possible to access to this buble using this URL <br/>
	     *    Return a promise. <br/>
	     * @param {Bubble} bubble The bubble on which the public url must be deleted.
	     * @return {Promise<any>} An object of the result
	     */
	    removePublicUrl(bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method setBubbleAutoRegister
	     * @since 1.86
	     * @instance
	     * @description
	     *    A user can create a room and not have to register users. He can share instead a public link also called 'public URL'(users public link).
	     *    According with autoRegister value, if another person uses the link to join the room:
	     *    autoRegister = 'unlock': If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room. (default value).
	     *    autoRegister = 'lock': If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room.
	     *    autoRegister = 'unlock_ack' (value not authorized yet): If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment.
	     *    Return a promise. <br/>
	     * @param {Bubble} bubble The bubble on which the public url must be deleted.
	     * @param {string} autoRegister value of the share of public URL to set.
	     * @return {Promise<Bubble>} An object of the result
	     */
	    setBubbleAutoRegister(bubble: Bubble, autoRegister?: string): Promise<Bubble>;
	    /**
	 * @private
	 * @method GetPublicURLFromResponseContent
	 * @since 1.72
	 * @instance
	 * @description
	 *    retrieve the public url from public url object. <br/>
	 * @param {Object} content   Id of the bubble
	 * @return {string} An url
	 */
	    getPublicURLFromResponseContent(content: any): string;
	    /**
	     * @public
	     * @method registerGuestForAPublicURL
	     * @since 1.75
	     * @instance
	     * @description
	     *    register a guest user with a mail and a password and join a bubble with a public url. <br/>
	     *    For this use case, first generate a public link using createPublicUrl(bubbleId) API for the requested bubble. <br/>
	     *    If the provided openInviteId is valid, the user account is created in guest mode (guestMode=true) <br/>
	     *    and automatically joins the room to which the public link is bound. <br/>
	     * <br/>
	     *    Note: The guest account can be destroy only with a user having one of the following rights : superadmin,bp_admin,bp_finance,admin. <br/>
	     * @param {string} publicUrl
	     * @param {string} loginEmail
	     * @param {string} password
	     * @param {string} firstName
	     * @param {string} lastName
	     * @param {string} nickName
	     * @param {string} title
	     * @param {string} jobTitle
	     * @param {string} department
	     * @return {Promise<any>} An object of the result
	     */
	    registerGuestForAPublicURL(publicUrl: string, loginEmail: string, password: string, firstName: string, lastName: string, nickName: string, title: string, jobTitle: string, department: string): Promise<unknown>;
	    joinConference(bubble: any): Promise<unknown>;
	    getBubbleByConferenceIdFromCache(conferenceId: string): Bubble;
	    getBubbleIdByConferenceIdFromCache(conferenceId: string): string;
	    conferenceAllowed(): boolean;
	    conferenceGetByIdFromCache(conferenceId: string): ConferenceSession;
	    conferenceGetListFromCache(): List<ConferenceSession>;
	    /**
	     * @Method retrieveConferences
	     * @public
	     * @param {string} mediaType [optional] mediaType of conference(s) to retrive.
	     * @param {boolean} scheduled [optional] whether it is a scheduled conference or not
	     * @param {boolean} provisioning [optional] whether it is a conference that is in provisioning state or not
	     * @returns {Promise<any>} a promise that resolves when conference are retrieved. Note: If no parameter is specified, then all mediaTypes are retrieved
	     * @memberof ConferenceService
	     */
	    retrieveConferences(mediaType?: string, scheduled?: boolean, provisioning?: boolean): Promise<any>;
	    /**
	     * @Method updateOrCreateWebConferenceEndpoint
	     * @public
	     * @param {any} conferenceData [required] conference data for the update / creation
	     * @returns {any} the updated conferenceEndpoint or null on error
	     * @memberof BubblesService
	     */
	    updateOrCreateWebConferenceEndpoint(conferenceData: any): any;
	    updateWebConferenceInfos(endpoints: any[]): void;
	    /**
	     * @Method getWebRtcConfEndpointId
	     * @public
	     * @returns {string} the user unique webrtc conference enpoint id
	     * @memberof BubblesService
	     */
	    getWebRtcConfEndpointId(): string;
	    /**
	     * @Method getWebRtcSharingOnlyConfEndpointId
	     * @public
	     * @returns {string} the user unique webrtcSharingOnly  conference enpoint id
	     * @memberof BubblesService
	     */
	    getWebRtcSharingOnlyConfEndpointId(): string;
	    /**
	     * @public
	     * @method conferenceStart
	     * @since 1.73
	     * @instance
	     * @description
	     *     To start a conference. <br/>
	     *     Only a moderator can start a conference. It also need to be a premium account. <br/>
	     * @param {Bubble} bubble   The bubble where the conference should start
	     * @param {string} conferenceId The id of the conference that should start. Optional, if not provided then the webrtc conference is used.
	     * @return {Promise<any>} The result of the starting.
	     */
	    conferenceStart(bubble: any, conferenceId: string): Promise<any>;
	    /**
	     * @public
	     * @method conferenceStop
	     * @since 1.73
	     * @instance
	     * @description
	     *     To stop a conference. <br/>
	     *     Only a moderator can stop a conference. It also need to be a premium account. <br/>
	     * @param {string} conferenceId The id of the conference that should stop
	     * @return {Promise<any>} return undefined.
	     */
	    conferenceStop(conferenceId: string): Promise<unknown>;
	    conferenceJoin(conferenceId: string, asModerator: boolean, muted: boolean, phoneNumber: string, country: string): Promise<unknown>;
	    conferenceMuteOrUnmute(conferenceId: string, mute: boolean): Promise<unknown>;
	    conferenceMuteOrUnmutParticipant(conferenceId: string, participantId: string, mute: boolean): Promise<unknown>;
	    conferenceDropParticipant(conferenceId: string, participantId: string): Promise<unknown>;
	    personalConferenceAllowed(): boolean;
	    personalConferenceGetId(): string;
	    personalConferenceGetBubbleFromCache(): Promise<Bubble>;
	    personalConferenceGetBubbleIdFromCache(): string;
	    personalConferenceGetPhoneNumbers(): Promise<any>;
	    personalConferenceGetPassCodes(): Promise<ConferencePassCodes>;
	    personalConferenceResetPassCodes(): Promise<any>;
	    personalConferenceGetPublicUrl(): Promise<any>;
	    personalConferenceGenerateNewPublicUrl(): Promise<any>;
	    personalConferenceStart(): Promise<any>;
	    personalConferenceStop(): Promise<any>;
	    personalConferenceJoin(asModerator: boolean, muted: boolean, phoneNumber: string, country: string): Promise<any>;
	    personalConferenceMuteOrUnmute(mute: boolean): Promise<unknown>;
	    personalConferenceLockOrUnlock(toLock: boolean): Promise<unknown>;
	    personalConferenceMuteOrUnmutParticipant(participantId: string, mute: boolean): Promise<any>;
	    personalConferenceDropParticipant(participantId: string): Promise<any>;
	    conferenceEndedForBubble(bubbleJid: string): Promise<void>;
	    askBubbleForConferenceDetails(bubbleJid: string): void;
	    personalConferenceRename(name: string): Promise<unknown>;
	    askConferenceSnapshot(conferenceId: string, type: MEDIATYPE): Promise<unknown>;
	    conferenceModeratorAction(conferenceId: string, action: string): Promise<unknown>;
	    conferenceModeratorActionOnParticipant(conferenceId: string, participantId: string, action: string): Promise<unknown>;
	    removeConferenceFromCache(conferenceId: string, deleteLinkWithBubble: boolean): void;
	    addConferenceToCache(conference: ConferenceSession): void;
	    /**
	     * @public
	     * @method retrieveAllBubblesByTags
	     * @instance
	     * @async
	     * @param {Array<string>} tags List of tags to filter the retrieved bubbles. 64 tags max.
	     * @return {Promise<Bubble>}  return a promise with a list of  {Bubble} filtered by tags or null
	     * @description
	     *  Get a list of {Bubble} filtered by tags. <br/>
	     */
	    retrieveAllBubblesByTags(tags: Array<string>): Promise<any>;
	    /**
	     * @public
	     * @method setTagsOnABubble
	     * @instance
	     * @async
	     * @description
	     *      Set a list of tags on a {Bubble}. <br/>
	     * @param {Bubble} bubble The on which the tags must be setted.
	     * @param {Array<Object>} tags The tags to be setted on the selected bubble. Ex :  [{ "tag" : "Test1Tag" }, { "tag" : "Test2Tag" }]
	     * @return {Promise<any>} return a promise with a Bubble's tags infos.
	     */
	    setTagsOnABubble(bubble: Bubble, tags: Array<string>): Promise<any>;
	    /**
	     *
	     * @public
	     * @method deleteTagOnABubble
	     * @instance
	     * @async
	     * @description
	     *  Delete a single tag on a list of {Bubble}. If the list of bubble is empty then every bubbles are concerned. <br/>
	     * @param {Array<Bubble>} bubbles The bubbles on which the tags must be deleted.
	     * @param {string} tag The tag to be removed on the selected bubbles.
	     * @return {Promise<any>} return a promise with a Bubble's tags infos.
	     */
	    deleteTagOnABubble(bubbles: Array<Bubble>, tag: string): Promise<any>;
	    /**
	     * @public
	     * @method getAllBubblesContainers
	     * @instance
	     * @async
	     * @param {string} name name The name of a rooms container created by the logged in user. </BR>
	     * Two way to search containers are available:</BR>
	     * a word search ('all containers that contain a word beginning with...'). So name=cont or name=container leads to find "My first Container", "my second container" ..</BR>
	     * an exact match case insensitive for a list of container name. name=Container1&name=container2 eads to find 'Container1' and 'Container2' name (must be an exact match but we are case sensitive)</BR>
	     * @description
	     *      retrieve the containers of bubbles from server. <br/>
	     *      A filter can be provided for the search by a name. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    getAllBubblesContainers(name?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getABubblesContainersById
	     * @instance
	     * @param {string} id The id of the container of bubbles to retreive from server.
	     * @async
	     * @description
	     *       retrieve a containers of bubbles from server by it's id. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    getABubblesContainersById(id?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method addBubblesToContainerById
	     * @instance
	     * @param {string} containerId The id of the container of bubbles to retreive from server.
	     * @param {Array<string>} bubbleIds List of the bubbles Id to attach to the container.
	     * @async
	     * @description
	     *       Add a list of bubbles to a containers of bubbles on server by it's id. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    addBubblesToContainerById(containerId: string, bubbleIds: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method updateBubbleContainerNameAndDescriptionById
	     * @instance
	     * @param {string} containerId The id of the container of bubbles to retreive from server.
	     * @param {string} name The name of the container.
	     * @param {string} description The description of the container.
	     * @async
	     * @description
	     *       Change one rooms container name or description from server by it's id. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    updateBubbleContainerNameAndDescriptionById(containerId: string, name: string, description?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createBubbleContainer
	     * @instance
	     * @param {string} name The name of the container.
	     * @param {string} description The description of the container.
	     * @param {Array<string>} bubbleIds List of the bubbles Id to attach to the container.
	     * @async
	     * @description
	     *       Create one rooms container with name or description. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    createBubbleContainer(name: string, description?: string, bubbleIds?: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteBubbleContainer
	     * @instance
	     * @param {string} containerId The id of the container of bubbles to delete from server.
	     * @async
	     * @description
	     *       delete one container by id. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    deleteBubbleContainer(containerId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method removeBubblesFromContainer
	     * @instance
	     * @param {string} containerId The id of the container.
	     * @param {Array<string>} bubbleIds List of the bubbles Id to remove from the container.
	     * @async
	     * @description
	     *       remove rooms from a container by id. <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    removeBubblesFromContainer(containerId: string, bubbleIds: Array<string>): Promise<unknown>;
	}
	export { Bubbles as BubblesService };

}
declare module 'lib/services/GroupsService' {
	/// <reference types="node" />
	import { GenericService } from 'lib/services/GenericService';
	export {};
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core'; class GroupsService extends GenericService {
	    private _groups;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<unknown>;
	    /**
	     * @public
	     * @method createGroup
	     * @instance
	     * @param {string} name The name of the group to create
	     * @param {string} comment The comment of the group to create
	     * @param {boolean} isFavorite If true, the group is flagged as favorite
	     * @description
	     *      Create a new group <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Created group object or an error object depending on the result
	     * @category async
	     */
	    createGroup(name: any, comment: any, isFavorite: any): Promise<unknown>;
	    /**
	    * @public
	    * @method deleteGroup
	    * @instance
	    * @param {Object} group The group to delete
	    * @description
	    * 		Delete an owned group <br/>
	    * @async
	    * @return {Promise<Object, ErrorManager>}
	    * @fulfil {Group} - Deleted group object or an error object depending on the result
	    * @category async
	    */
	    deleteGroup(group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAllGroups
	     * @instance
	     * @description
	     *    Delete all existing owned groups <br/>
	     *    Return a promise <br/>
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    deleteAllGroups(): Promise<unknown>;
	    /**
	     * @public
	     * @method updateGroupName
	     * @instance
	     * @param {Object} group The group to update
	     * @param {string} name The new name of the group
	     * @description
	     * 		Update the name of a group <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group object or an error object depending on the result
	     * @category async
	     */
	    updateGroupName(group: any, name: any): Promise<unknown>;
	    /**
	     * @private
	     * @description
	     *      Internal method <br/>
	     */
	    getGroups(): Promise<unknown>;
	    /**
	    * @public
	    * @method setGroupAsFavorite
	    * @since 1.67.0
	    * @instance
	    * @param {Object} group The group
	    * @description
	    * 		Set a group as a favorite one of the curent loggued in user. <br/>
	    * @async
	    * @return {Promise<Object, ErrorManager>}
	    * @fulfil {Group} - Updated group or an error object depending on the result
	    * @category async
	    */
	    setGroupAsFavorite(group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method unsetGroupAsFavorite
	     * @since 1.67.0
	     * @instance
	     * @param {Object} group The group
	     * @description
	     * 		Remove the favorite state of a group of the curent loggued in user. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group or an error object depending on the result
	     * @category async
	     */
	    unsetGroupAsFavorite(group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method addUserInGroup
	     * @instance
	     * @param {Contact} contact The user to add in group
	     * @param {Object} group The group
	     * @description
	     * 		Add a contact in a group <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group with the new contact added or an error object depending on the result
	     * @category async
	     */
	    addUserInGroup(contact: any, group: any): Promise<unknown>;
	    /**
	    * @public
	    * @method removeUserFromGroup
	    * @instance
	    * @param {Contact} contact The user to remove from the group
	    * @param {Object} group The destination group
	    * @description
	    *		Remove a contact from a group <br/>
	    * @async
	    * @return {Promise<Object, ErrorManager>}
	    * @fulfil {Group} - Updated group without the removed contact or an error object depending on the result
	    * @category async
	    */
	    removeUserFromGroup(contact: any, group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getAll
	     * @instance
	     * @return {Array} The list of existing groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
	     * @description
	     *  Return the list of existing groups <br/>
	     */
	    getAll(): any;
	    /**
	     * @public
	     * @method getFavoriteGroups
	     * @instance
	     * @return {Array} The list of favorite groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
	     * @description
	     *  Return the list of favorite groups <br/>
	     */
	    getFavoriteGroups(): any;
	    /**
	     * @public
	     * @method getGroupById
	     * @instance
	     * @param {String} group Id of the group to found
	     * @return {Object} The group found if exist or undefined
	     * @description
	     *  Return a group by its id <br/>
	     */
	    getGroupById(id: any): any;
	    /**
	     * @public
	     * @method getGroupByName
	     * @instance
	     * @param {String} name Name of the group to found
	     * @return {Object} The group found if exist or undefined
	     * @description
	     *  Return a group by its id <br/>
	     */
	    getGroupByName(name: any): any;
	    /**
	     * @private
	     * @method _onGroupCreated
	     * @instance
	     * @param {Object} data Contains the groupId of the created group
	     * @description
	     *		Method called when a group is created <br/>
	     */
	    _onGroupCreated(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onGroupDeleted
	     * @instance
	     * @param {Object} data Contains the groupId of the deleted group
	     * @description
	     *		Method called when a group is deleted <br/>
	     */
	    _onGroupDeleted(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onGroupUpdated
	     * @instance
	     * @param {Object} data Contains the groupId of the updated group
	     * @description
	     *		Method called when a group is updated (name, comment, isFavorite) <br/>
	     */
	    _onGroupUpdated(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onUserAddedInGroup
	     * @instance
	     * @param {Object} data Contains the groupId and the userId
	     * @description
	     *		Method called when a user is added to a group <br/>
	     */
	    _onUserAddedInGroup(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onUserRemovedFromGroup
	     * @instance
	     * @param {Object} data Contains the groupId and the userId
	     * @description
	     *		Method called when a user is removed from a group <br/>
	     */
	    _onUserRemovedFromGroup(data: any): Promise<void>;
	}
	export { GroupsService as GroupsService };

}
declare module 'lib/services/InvitationsService' {
	/// <reference types="node" />
	export {};
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService'; class InvitationsService extends GenericService {
	    receivedInvitations: {};
	    sentInvitations: {};
	    acceptedInvitationsArray: any[];
	    sentInvitationsArray: any[];
	    receivedInvitationsArray: any[];
	    private _listeners;
	    private _portalURL;
	    private _contactConfigRef;
	    acceptedInvitations: {};
	    private _invitationEventHandler;
	    private _invitationHandlerToken;
	    private _contacts;
	    private _bubbles;
	    private stats;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    /************************************************************/
	    /** LIFECYCLE STUFF                                        **/
	    /************************************************************/
	    start(_options: any, _core: Core, stats: any): Promise<void>;
	    init(): Promise<void>;
	    stop(): Promise<void>;
	    /************************************************************/
	    /** EVENT HANDLING STUFF                                   **/
	    /************************************************************/
	    attachHandlers(): void;
	    onRosterChanged(data: any): Promise<unknown>;
	    onOpenInvitationManagementUpdate(openInvitation: any): Promise<boolean>;
	    onInvitationsManagementUpdate(userInvite: any): Promise<boolean>;
	    handleReceivedInvitation(id: any, action: any): Promise<void>;
	    handleSentInvitation(id: any, action: any): Promise<unknown>;
	    updateReceivedInvitationsArray(): void;
	    updateSentInvitationsArray(): void;
	    getServerInvitation(invitationId: any): Promise<unknown>;
	    /************************************************************/
	    /** PUBLIC METHODS                                         **/
	    /************************************************************/
	    /**
	     * @public
	     * @since 1.65
	     * @method getReceivedInvitations
	     * @instance
	     * @description
	     *    Get the invite received coming from Rainbow users <br/>
	     * @return {Invitation[]} The list of invitations received
	     */
	    getReceivedInvitations(): any[];
	    /**
	     * @public
	     * @since 1.65
	     * @method 	getAcceptedInvitations
	     * @instance
	     * @description
	     *    Get the invites you accepted received from others Rainbow users <br/>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getAcceptedInvitations(): any[];
	    /**
	     * @public
	     * @since 1.65
	     * @method getSentInvitations
	     * @instance
	     * @description
	     *    Get the invites sent to others Rainbow users <br/>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getSentInvitations(): any[];
	    /**
	     * @public
	     * @since 1.65
	     * @method getInvitationsNumberForCounter
	     * @instance
	     * @description
	     *    Get the number of invitations received from others Rainbow users <br/>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getInvitationsNumberForCounter(): number;
	    /**
	     * @public
	     * @since 1.65
	     * @method getAllInvitationsNumber
	     * @instance
	     * @description
	     *    Get the number of invitations sent/received to/from others Rainbow users <br/>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getAllInvitationsNumber: () => any;
	    /**
	     * @public
	     * @since 1.65
	     * @method getInvitation
	     * @instance
	     * @description
	     *    Get an invite by its id <br/>
	     * @param {String} invitationId the id of the invite to retrieve
	     * @return {Invitation} The invite if found
	     */
	    getInvitation(invitationId: any): any;
	    /**
	     * @public
	     * @since 1.65
	     * @method joinContactInvitation
	     * @instance
	     * @description
	     *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once accepted, the user will be part of your network. <br>
	     *    Return a promise <br/>
	     * @param {Contact} contact The invitation to accept
	     * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
	     */
	    joinContactInvitation(contact: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method sendInvitationByEmail
	     * @instance
	     * @description
	     *    Send an invitation email as UCaaS <br/>
	     * @param {string} email The email
	     * @param {string} [customMessage] The email text (optional)
	     * @return {Object} A promise that contains the contact added or an object describing an error
	     */
	    sendInvitationByEmail(email: any, lang: any, customMessage: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method cancelOneSendInvitation
	     * @instance
	     * @param {Invitation} invitation The invitation to cancel
	     * @description
	     *    Cancel an invitation sent <br/>
	     * @return {Object} The SDK Ok object or an error
	     */
	    cancelOneSendInvitation(invitation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method reSendInvitation
	     * @instance
	     * @param {Number} invitationId The invitation to re send
	     * @description
	     *    Re send an invitation sent <br/>
	     * @return {Object} The SDK Ok object or an error
	     */
	    reSendInvitation(invitationId: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method sendInvitationByEmail
	     * @instance
	     * @description
	     *    Send invitations for a list of emails as UCaaS <br/>
	     *    LIMITED TO 100 invitations <br/>
	     * @param {Array} listOfMails The list of emails
	     * @return {Object} A promise that the invite result or an object describing an error
	     */
	    sendInvitationsParBulk(listOfMails: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method acceptInvitation
	     * @instance
	     * @description
	     *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once accepted, the user will be part of your network. <br>
	     *    Return a promise <br/>
	     * @param {Invitation} invitation The invitation to accept
	     * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
	     */
	    acceptInvitation(invitation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method declineInvitation
	     * @instance
	     * @description
	     *    Decline an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once declined, the user will not be part of your network. <br>
	     *    Return a promise <br/>
	     * @param {Invitation} invitation The invitation to decline
	     * @return {Object} A promise that contains SDK.OK in case of success or an object that describes the error
	     */
	    declineInvitation(invitation: any): Promise<unknown>;
	    /************************************************************/
	    /** PRIVATE METHODS                                        **/
	    /************************************************************/
	    /**
	     * @private
	     */
	    updateContactInvitationStatus(contactDBId: any, status: any, invitation: any): Promise<unknown>;
	    /**
	     * @private
	     */
	    sortInvitationArray(invitA: any, invitB: any): number;
	    /**
	     * @private
	     */
	    getAllReceivedInvitations(): Promise<unknown>;
	    /**
	     * @private
	     */
	    getAllSentInvitations(): Promise<unknown>;
	}
	export { InvitationsService };

}
declare module 'lib/services/ContactsService' {
	/// <reference types="node" />
	import { Contact } from 'lib/common/models/Contact';
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { Invitation } from 'lib/common/models/Invitation';
	import { GenericService } from 'lib/services/GenericService';
	export {}; class ContactsService extends GenericService {
	    private avatarDomain;
	    private _contacts;
	    private _rosterPresenceQueue;
	    userContact: Contact;
	    private _invitationsService;
	    private _presenceService;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<unknown>;
	    cleanMemoryCache(): void;
	    /**
	     * @public
	     * @method getDisplayName
	     * @instance
	     * @param {Contact} contact  The contact to get display name
	     * @return {string} The contact first name and last name
	     * @description
	     *      Get the display name of a contact <br/>
	     */
	    getDisplayName(contact: Contact): string;
	    /**
	     * @public
	     * @method getRosters
	     * @instance
	     * @description
	     *      Get the list of _contacts that are in the user's network (aka rosters) <br/>
	     * @async
	     * @return {Promise<Array<Contact>,ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)
	     * @category async
	     */
	    getRosters(): Promise<Array<Contact>>;
	    /**
	     * @public
	     * @method getAll
	     * @instance
	     * @return {Contact[]} the list of _contacts
	     * @description
	     *  Return the list of _contacts that are in the network of the connected users (aka rosters) <br/>
	     */
	    getAll(): Array<Contact>;
	    createEmptyContactContact(jid: any): Contact;
	    getContact(jid: any, phoneNumber: any): any;
	    getOrCreateContact(jid: any, phoneNumber: any): Promise<any>;
	    createBasicContact(jid: any, phoneNumber?: any): Contact;
	    /**
	     * @public
	     * @method getContactByJid
	     * @instance
	     * @param {string} jid The contact jid
	     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
	     * @description
	     *  Get a contact by his JID by searching in the connected user _contacts list (full information) and if not found by searching on the server too (limited set of information) <br/>
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Found contact or null or an error object depending on the result
	     * @category async
	     */
	    getContactByJid(jid: string, forceServerSearch?: boolean): Promise<Contact>;
	    /**
	     * @public
	     * @method getContactById
	     * @instance
	     * @param {string} id The contact id
	     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
	     * @description
	     *  Get a contact by his id <br/>
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Found contact or null or an error object depending on the result
	     * @category async
	     */
	    getContactById(id: string, forceServerSearch?: boolean): Promise<Contact>;
	    /**
	     * @public
	     * @method getContactByLoginEmail
	     * @instance
	     * @param {string} loginEmail The contact loginEmail
	     * @description
	     *  Get a contact by his loginEmail <br/>
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Found contact or null or an error object depending on the result
	     * @category async
	     */
	    getContactByLoginEmail(loginEmail: string): Promise<Contact>;
	    /**
	     * @public
	     * @method getAvatarByContactId
	     * @instance
	     * @param {string} id The contact id
	     * @param {string} lastAvatarUpdateDate use this field to give the stored date ( could be retrieved with contact.lastAvatarUpdateDate )
	     *      if missing or null in case where no avatar available a local module file is provided instead of URL
	     * @description
	     *  Get a contact avatar by his contact id <br/>
	     * @return {string} Contact avatar URL or file
	     */
	    getAvatarByContactId(id: string, lastAvatarUpdateDate: string): string;
	    isTelJid(jid: any): boolean;
	    getImJid(jid: any): any;
	    getRessourceFromJid(jid: any): string;
	    isUserContactJid(jid: any): boolean;
	    isUserContact(contact: Contact): boolean;
	    /**
	     * @public
	     * @method getConnectedUser
	     * @instance
	     * @description
	     *    Get the connected user information <br/>
	     * @return {Contact} Return a Contact object representing the connected user information or null if not connected
	     */
	    getConnectedUser(): Contact;
	    /**
	     * @public
	     * @since 1.17
	     * @method addToNetwork
	     * @instance
	     * @description
	     *    Send an invitation to a Rainbow user for joining his network. <br>
	     *    The user will receive an invitation that can be accepted or declined <br>
	     *    In return, when accepted, he will be part of your network <br>
	     *    When in the same company, invitation is automatically accepted (ie: can't be declined) <br/>
	     * @param {Contact} contact The contact object to subscribe
	     * @return {Promise<Contact>} A promise that contains the contact added or an object describing an error
	     */
	    addToNetwork(contact: Contact): Promise<Contact>;
	    /**
	     * @public
	     * @since 1.17
	     * @method addToContactsList
	     * @instance
	     * @description
	     *    Send an invitation to a Rainbow user for joining his network. <br>
	     *    The user will receive an invitation that can be accepted or declined <br>
	     *    In return, when accepted, he will be part of your network <br>
	     *    When in the same company, invitation is automatically accepted (ie: can't be declined) <br/>
	     * @param {Contact} contact The contact object to subscribe
	     * @return {Promise<Contact>} A promise that contains the contact added or an object describing an error
	     * @category async
	     */
	    addToContactsList(contact: Contact): Promise<Contact>;
	    /**
	     * @public
	     * @method removeFromNetwork
	     * @since 1.69
	     * @instance
	     * @description
	     *    Remove a contact from the list of contacts and unsubscribe to the contact's presence <br/>
	     * @param {Contact} contact The contact object to unsubscribe
	     * @returns {Promise} A promise that contains success code if removed or an object describing an error
	     */
	    removeFromNetwork(contact: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.64.0
	     * @method getInvitationById
	     * @instance
	     * @description
	     *    Get an invite by its id <br/>
	     * @param {string} strInvitationId the id of the invite to retrieve
	     * @return {Invitation} The invite if found
	     */
	    getInvitationById(strInvitationId: string): Promise<any>;
	    /**
	     * @public
	     * @since 1.17
	     * @method
	     * @instance
	     * @description
	     *    Accept an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once accepted, the user will be part of your network. <br>
	     *    Return a promise <br/>
	     * @param {Invitation} invitation The invitation to accept
	     * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
	     */
	    acceptInvitation(invitation: Invitation): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.17
	     * @method
	     * @instance
	     * @description
	     *    Decline an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once declined, the user will not be part of your network. <br>
	     *    Return a promise <br/>
	     * @param {Invitation} invitation The invitation to decline
	     * @return {Object} A promise that contains SDK.OK in case of success or an object that describes the error
	     */
	    declineInvitation(invitation: Invitation): Promise<unknown>;
	    /**
	     * @typedef {Object} joinContactsResult
	     * @property {string[]} success List of succeed joined users
	     * @property {string[]} failed List of failed to joined users
	     */
	    /**
	     * @public
	     * @since 1.41
	     * @beta
	     * @method joinContacts
	     * @instance
	     * @description
	     *    As admin, add _contacts to a user roster <br/>
	     * @param {Contact} contact The contact object to subscribe
	     * @param {Array<string>} contactIds List of contactId to add to the user roster
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {joinContactsResult} - Join result or an error object depending on the result
	     * @category async
	     */
	    joinContacts(contact: Contact, contactIds: Array<string>): Promise<unknown>;
	    /**
	     * @private
	     * @method _onPresenceChanged
	     * @instance
	     * @param {Object} presence contains informations about contact changes
	     * @description
	     *      Method called when the presence of a contact changed <br/>
	     */
	    _onPresenceChanged(presence: any): void;
	    /**
	     * @private
	     * @method _onRosterPresenceChanged
	     * @instance
	     * @param {Object} presence contains informations about contact changes
	     * @description
	     *      Method called when the presence of a contact changed <br/>
	     */
	    _onRosterPresenceChanged(presence: any): void;
	    /**
	     * @private
	     * @method _onContactInfoChanged
	     * @instance
	     * @param {string} jid modified roster contact Jid
	     * @description
	     *     Method called when an roster user information are updated <br/>
	     */
	    _onContactInfoChanged(jid: string): void;
	    /**
	     * @private
	     * @method _onRosterContactInfoChanged
	     * @instance
	     * @param {string} jid modified roster contact Jid
	     * @description
	     *     Method called when an roster user information are updated <br/>
	     */
	    _onRosterContactInfoChanged(jid: string): void;
	    /**
	     * @private
	     * @method _onUserInviteReceived
	     * @instance
	     * @param {Object} data contains the invitationId
	     * @description
	     *      Method called when an user invite is received <br/>
	     */
	    /**
	     * @private
	     * @method _onUserInviteAccepted
	     * @instance
	     * @param {Object} data contains the invitationId
	     * @description
	     *      Method called when an user invite is accepted <br/>
	     */
	    /**
	     * @private
	     * @method _onUserInviteCanceled
	     * @instance
	     * @param {Object} data contains the invitationId
	     * @description
	     *      Method called when an user invite is canceled <br/>
	     */
	    /**
	     * @private
	     * @method _onRostersUpdate
	     * @instance
	     * @param {Object} contacts contains a contact list with updated elements
	     * @description
	     *      Method called when the roster _contacts is updated <br/>
	     */
	    _onRostersUpdate(contacts: any): void;
	}
	export { ContactsService as ContactsService };

}
declare module 'lib/connection/XMPPServiceHandler/presenceEventHandler' {
	import { XMPPService } from 'lib/connection/XMPPService';
	import { ContactsService } from 'lib/services/ContactsService';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler';
	export {}; class PresenceEventHandler extends GenericHandler {
	    PRESENCE: any;
	    private _contacts;
	    private _xmpp;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, contacts: ContactsService);
	    onPresenceReceived(msg: any, stanza: any): Promise<boolean>;
	}
	export { PresenceEventHandler };

}
declare module 'lib/services/SettingsService' {
	/// <reference types="node" />
	import { GenericService } from 'lib/services/GenericService';
	export {};
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core'; class Settings extends GenericService {
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    /**
	     * @private
	     * @method getUserSettings
	     * @instance
	     * @description
	     *  Get current User Settings <br/>
	     * @return {Promise<UserSettings>} A promise containing the result
	     */
	    getUserSettings(): Promise<unknown>;
	    /**
	     * @private
	     * @method updateUserSettings
	     * @instance
	     * @description
	     *  Update current User Settings <br/>
	     * @return {Promise<Settings, ErrorManager>} A promise containing the result
	     */
	    updateUserSettings(settings: any): Promise<unknown>;
	}
	export { Settings as SettingsService };

}
declare module 'lib/services/PresenceService' {
	/// <reference types="node" />
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { PresenceLevel, PresenceRainbow } from 'lib/common/models/PresenceRainbow';
	import { GenericService } from 'lib/services/GenericService';
	export {}; class PresenceService extends GenericService {
	    private _settings;
	    private _presenceEventHandler;
	    private _presenceHandlerToken;
	    private manualState;
	    private _currentPresence;
	    RAINBOW_PRESENCE_ONLINE: PresenceLevel.Online;
	    RAINBOW_PRESENCE_DONOTDISTURB: PresenceLevel.Dnd;
	    RAINBOW_PRESENCE_AWAY: PresenceLevel.Away;
	    RAINBOW_PRESENCE_INVISIBLE: PresenceLevel.Invisible;
	    private _bubbles;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    /**
	     * @private
	     * @method sendInitialPresence
	     * @instance
	     * @description
	     *  Send the initial presence (online) <br/>
	     * @return {ErrorManager.Ok} A promise containing the result
	     */
	    sendInitialPresence(): Promise<unknown>;
	    /**
	     * @public
	     * @method setPresenceTo
	     * @instance
	     * @description
	     *    Allow to change the presence of the connected user <br/>
	     *    Only the following values are authorized: 'dnd', 'away', 'invisible' or 'online' <br/>
	     * @param {String} presence The presence value to set i.e: 'dnd', 'away', 'invisible' ('xa' on server side) or 'online'
	     * @async
	     * @return {Promise<ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)
	     * @category async
	     */
	    setPresenceTo(presence: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getUserConnectedPresence
	     * @instance
	     * @description
	     *      Get user presence status calculated from events. <br/>
	     */
	    getUserConnectedPresence(): PresenceRainbow;
	    /**
	    * @private
	    * @method _setUserPresenceStatus
	    * @instance
	    * @description
	    *      Send user presence status and message to xmpp. <br/>
	    */
	    _setUserPresenceStatus(presenceRainbow: PresenceRainbow): Promise<unknown>;
	    /**
	     * @private
	     * @method _sendPresenceFromConfiguration
	     * @instance
	     * @description
	     *      Send user presence according to user settings presence. <br/>
	     */
	    _sendPresenceFromConfiguration(): Promise<unknown>;
	    /**
	     * @private
	     * @method sendInitialBubblePresence
	     * @instance
	     * @param {Bubble} bubble The Bubble
	     * @description
	     *      Method called when receiving an invitation to join a bubble <br/>
	     */
	    sendInitialBubblePresence(bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @method _onUserSettingsChanged
	     * @instance
	     * @description
	     *      Method called when receiving an update on user settings <br/>
	     */
	    _onUserSettingsChanged(): void;
	    /**
	     * @private
	     * @method _onPresenceChanged
	     * @instance
	     * @description
	     *      Method called when receiving an update on user presence <br/>
	     */
	    _onMyPresenceChanged(user: any): void;
	    /**
	     * @public
	     * @method getCalendarState
	     * @instance
	     * @description
	     *    Allow to get the calendar presence of the connected user <br/>
	     *    return promise with {  <br/>
	     *    busy: boolean, // Does the connected user is busy ? <br/>
	     *    status: string, // The status of the connected user (one of "free", "busy" or "out_of_office") <br/>
	     *    subject: string, // The meeting subject. <br/>
	     *    since: string, // The meeting since date. <br/>
	     *    until: string // Date until the current presence is valid <br/>
	     *    }  <br/>
	     *    <br/>
	     * @async
	     * @return {Promise<{
	     *    busy: boolean,
	     *    status: string,
	     *    subject: string,
	     *    since: string,
	     *    until: string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     * @category async
	     */
	    getCalendarState(): Promise<unknown>;
	    /**
	     * @public
	     * @method getCalendarStates
	     * @instance
	     * @param {Array<string>} users The list of user's logins (Contact::loginEmail) to retrieve the calendar presence.
	     * @description
	     *    Allow to get the calendar presence of severals users <br/>
	     *    return promise with {
	     *    usersIdentifier : { // List of calendar user states. <br/>
	     *    busy: boolean, // Does the connected user is busy ? <br/>
	     *    status: string, // The status of the connected user (one of "free", "busy" or "out_of_office") <br/>
	     *    subject: string, // The meeting subject. <br/>
	     *    since: string, // The meeting since date. <br/>
	     *    until: string // Date until the current presence is valid <br/>
	     *    }  <br/>
	     *    <br/>
	     * @async
	     * @return {Promise< {
	     *    busy: boolean,
	     *    status: string,
	     *    subject: string,
	     *    since: string,
	     *    until: string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     * @category async
	     */
	    getCalendarStates(users?: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method setCalendarRegister
	     * @instance
	     * @param {string} type Calendar type. Default : office365, Authorized values : office365, google
	     * @param {boolean} redirect Immediately redirect to login page (OAuth2) or generate an HTML page. Default : false.
	     * @param {string} callback Redirect URL to the requesting client.
	     * @description
	     *    Register a new calendar.<br/>
	     *    return promise with {
	     *    "url" : string // Calendar provider's OAuth URL <br/>
	     *    } <br/>
	     * @async
	     * @return {Promise<{
	     *    "url" : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     * @category async
	     */
	    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCalendarAutomaticReplyStatus
	     * @instance
	     * @param {string} userId The id of user to retrieve the calendar automatic reply status.
	     * @description
	     *    Allow to retrieve the calendar automatic reply status <br/>
	     *    return promise with { <br/>
	     *    enabled : string, // 	its status <br/>
	     *    start : string, // its start date <br/>
	     *    end : string, // its end date <br/>
	     *    message_text : string, // its message as plain text <br/>
	     *    message_thtml : string // its message as html <br/>
	     *    }  <br/>
	     *    <br/>
	     * @async
	     * @return {Promise<{
	     *    enabled : string,
	     *    start : string,
	     *    end : string,
	     *    message_text : string,
	     *    message_thtml : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     * @category async
	     */
	    getCalendarAutomaticReplyStatus(userId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method enableCalendar
	     * @instance
	     * @description
	     *    Allow to enable the calendar. <br/>
	     *    return promise with { <br/>
	     *       Status : string // Operation status ("enabled" or "disabled") <br/>
	     *    }  <br/>
	     *    <br/>
	     * @async
	     * @return {Promise< {
	     *       Status : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     * @category async
	     */
	    enableCalendar(): Promise<unknown>;
	    /**
	     * @public
	     * @method disableCalendar
	     * @instance
	     * @description
	     *    Allow to disable the calendar. <br/>
	     *    return promise with { <br/>
	     *       Status : string // Operation status ("enabled" or "disabled") <br/>
	     *    }  <br/>
	     *    <br/>
	     * @async
	     * @return {Promise< {
	     *       Status : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     * @category async
	     */
	    disableCalendar(): Promise<unknown>;
	}
	export { PresenceService };

}
declare module 'lib/connection/request-rate-limiter/src/leakybucket' {
	export default class LeakyBucket {
	    private queue;
	    private totalCost;
	    private currentCapacity;
	    private lastRefill;
	    private refillRate;
	    private timer;
	    private emptyPromiseResolver;
	    private emptyPromise;
	    private capacity;
	    private maxCapacity;
	    private timeout;
	    private interval;
	    /**
	     * Sets up the leaky bucket. The bucket is designed so that it can
	     * burst by the capacity it is given. after that items can be queued
	     * until a timeout of n seonds is reached.
	     *
	     * example: throttle 10 actions per minute that have each a cost of 1, reject
	     * everything theat is overflowing. there will no more than 10 items queued
	     * at any time
	     *   capacity: 10
	     *   interval: 60
	     *   timeout: 60
	     *
	     * example: throttle 100 actions per minute that have a cost of 1, reject
	     * items that have to wait more thatn 2 minutes. there will be no more thatn
	     * 200 items queued at any time. of those 200 items 100 will be bursted within
	     * a minute, the rest will be executed evenly spread over a mintue.
	     *   capacity: 100
	     *   interval: 60
	     *   timeout: 120
	     *
	     * @param {number} capacity the capacity the bucket has per interval
	     * @param {number} timeout the total time items are allowed to wait for execution
	     * @param {number} interval the interval for the capacity in seconds
	     */
	    constructor({ capacity, timeout, interval, }?: {
	        capacity?: number;
	        timeout?: number;
	        interval?: number;
	    });
	    get length(): number;
	    /**
	     * dthe throttle method is used to throttle things. it is async and will resolve either
	     * immediatelly, if there is space in the bucket, than can be bursted, or it will wait
	     * until there is enough capacity left to execute the item with the given cost. if the
	     * bucket is overflowing, and the item cannot be executed within the timeout of the bucket,
	     * the call will be rejected with an error.
	     *
	     * @param {number} cost=1 the cost of the item to be throttled. is the cost is unknown,
	     *                        the cost can be payed after execution using the pay method.
	     *                        defaults to 1.
	     * @param {boolean} append = true set to false if the item needs ot be added to the
	     *                                beginning of the queue
	     * @param {boolean} isPause = false defines if the element is a pause elemtn, if yes, it
	     *                                  will not be cleaned off of the queue when checking
	     *                                  for overflowing elements
	     * @returns {promise} resolves when the item can be executed, rejects if the item cannot
	     *                    be executed in time
	     */
	    throttle(cost?: number, append?: boolean, isPause?: boolean): Promise<unknown>;
	    /**
	     * either executes directly when enough capacity is present or delays the
	     * execution until enough capacity is available.
	     *
	     * @private
	     */
	    startTimer(): void;
	    /**
	     * removes the first item in the queue, resolves the promise that indicated
	     * that the bucket is empty and no more items are waiting
	     *
	     * @private
	     */
	    shiftQueue(): void;
	    /**
	     * is resolved as soon as the bucket is empty. is basically an event
	     * that is emitted
	     */
	    isEmpty(): Promise<any>;
	    /**
	     * ends the bucket. The bucket may be recycled after this call
	     */
	    end(): void;
	    /**
	     * removes all items from the queue, does not stop the timer though
	     *
	     * @privae
	     */
	    clear(): void;
	    /**
	     * can be used to pay costs for items where the cost is clear after exection
	     * this will devcrease the current capacity availabe on the bucket.
	     *
	     * @param {number} cost the ost to pay
	     */
	    pay(cost: any): void;
	    /**
	     * stops the running times
	     *
	     * @private
	     */
	    stopTimer(): void;
	    /**
	     * refills the bucket with capacity which has become available since the
	     * last refill. starts to refill after a call has started using capacity
	     *
	     * @private
	     */
	    refill(): void;
	    /**
	     * gets the currenlty avilable max capacity, respecintg
	     * the capacity that is already used in the moment
	     *
	     * @private
	     */
	    getCurrentMaxCapacity(): number;
	    /**
	     * removes all items that cannot be executed in time due to items
	     * that were added in front of them in the queue (mostly pause items)
	     *
	     * @private
	     */
	    cleanQueue(): void;
	    /**
	     * returns the first item from the queue
	     *
	     * @private
	     */
	    getFirstItem(): any;
	    /**
	     * pasue the bucket for the given cost. means that an item is added in the
	     * front of the queue with the cost passed to this method
	     *
	     * @param {number} cost the cost to pasue by
	     */
	    pauseByCost(cost: any): void;
	    /**
	     * pause the bucket for n seconds. means that an item with the cost for one
	     * second is added at the beginning of the queue
	     *
	     * @param {number} seconds the number of seconds to pause the bucket by
	     */
	    pause(seconds?: number): void;
	    /**
	     * drains the bucket, so that nothing can be exuted at the moment
	     *
	     * @private
	     */
	    drain(): void;
	    /**
	     * set the timeout value for the bucket. this is the amount of time no item
	     * may longer wait for.
	     *
	     * @param {number} timeout in seonds
	     */
	    setTimeout(timeout: any): this;
	    /**
	     * set the interval within whch the capacity can be used
	     *
	     * @param {number} interval in seonds
	     */
	    setInterval(interval: any): this;
	    /**
	     * set the capacity of the bucket. this si the capacity that can be used per interval
	     *
	     * @param {number} capacity
	     */
	    setCapacity(capacity: any): this;
	    /**
	     * claculates the values of some frequently used variables on the bucket
	     *
	     * @private
	     */
	    updateVariables(): void;
	}

}
declare module 'lib/connection/request-rate-limiter/src/BackoffError' {
	export default class BackoffError extends Error {
	}

}
declare module 'lib/connection/request-rate-limiter/src/RequestRateLimiter' {
	export default class RequestRateLimiter {
	    private backoffTime;
	    private requestRate;
	    private interval;
	    private timeout;
	    bucket: any;
	    private requestHandler;
	    /**
	     * The constructor accepts 4 additional options, which can be used to configure the behaviour of the limiter:
	     * backoffTime: how many seconds to back off when the remote end indicates to back off
	     * requestRate: how many requests can be sent within the interval
	     * interval: the interval within which all requests of the requestRate should be executed
	     * timeout: no request will stay in the queue any longer than the timeout. if the queue is full, the requst will be rejected
	     *
	    */
	    constructor({ backoffTime, requestRate, interval, timeout, }?: {
	        backoffTime?: number;
	        requestRate?: number;
	        interval?: number;
	        timeout?: number;
	    });
	    /**
	    * promise that resolves when the rate limited becomes idle
	    * once resolved, the call to this method must be repeated
	    * in order to become notified again.
	    */
	    idle(): Promise<any>;
	    /**
	    * enqueue a request
	    */
	    request(requestConfig: any): Promise<any>;
	    /**
	    * actually execute the requests
	    */
	    executeRequest(requestConfig: any): Promise<any>;
	    /**
	    * set the reuqest handler that shall be used to handle the requests
	    */
	    setRequestHandler(requestHandler: any): void;
	}

}
declare module 'lib/connection/request-rate-limiter/src/RequestRequestHandler' {
	export default class RequestRequestHandler {
	    private backoffHTTPCode;
	    constructor({ backoffHTTPCode, }?: {
	        backoffHTTPCode?: number;
	    });
	    request(requestConfig: any): Promise<unknown>;
	}

}
declare module 'lib/connection/request-rate-limiter/src/MockRequestHandler' {
	export default class MockRequestHandler {
	    request(requestConfig: any): Promise<{
	        status: string;
	    }>;
	}

}
declare module 'lib/connection/request-rate-limiter/index' {
	import RequestRateLimiter from 'lib/connection/request-rate-limiter/src/RequestRateLimiter';
	import BackoffError from 'lib/connection/request-rate-limiter/src/BackoffError';
	import RequestRequestHandler from 'lib/connection/request-rate-limiter/src/RequestRequestHandler';
	import MockRequestHandler from 'lib/connection/request-rate-limiter/src/MockRequestHandler';
	export { BackoffError, RequestRequestHandler, MockRequestHandler, RequestRateLimiter as default };

}
declare module 'lib/connection/HttpManager' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { Logger } from 'lib/common/Logger';
	import RequestRateLimiter from 'lib/connection/request-rate-limiter/index';
	export {}; class RequestForQueue {
	    id: string;
	    method: Function;
	    params: IArguments;
	    label: string;
	    constructor();
	} class HttpManager {
	    _logger: Logger;
	    private _eventEmitter;
	    private _imOptions;
	    private _options;
	    private lockEngine;
	    private lockKeyNbHttpAdded;
	    nbHttpAdded: number;
	    nbRunningReq: number;
	    started: boolean;
	    limiter: RequestRateLimiter;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger);
	    init(_options: any, _core: Core): Promise<unknown>;
	    checkHTTPStatus(): Promise<{
	        nbHttpAdded: number;
	        httpQueueSize: number;
	        nbRunningReq: number;
	        maxSimultaneousRequests: number;
	        nbReqInQueue: number;
	    }>;
	    locknbRunningReq(fn: any): any;
	    incNbRunningReq(): any;
	    decNbRunningReq(): any;
	    /**
	     *
	     * @param {} req {id, method, params, resolve, reject}
	     * @return {Promise<any>}
	     */
	    add(req: RequestForQueue): Promise<any>;
	    stop(): void;
	}
	export { RequestForQueue, HttpManager };

}
declare module 'lib/connection/HttpService' {
	import { HttpManager } from 'lib/connection/HttpManager'; class HTTPService {
	    serverURL: any;
	    _host: any;
	    logger: any;
	    proxy: any;
	    eventEmitter: any;
	    httpManager: HttpManager;
	    private _options;
	    private _core;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_options: any, _logger: any, _proxy: any, _evtEmitter: any, _core: any);
	    checkHTTPStatus(): Promise<{
	        nbHttpAdded: number;
	        httpQueueSize: number;
	        nbRunningReq: number;
	        maxSimultaneousRequests: number;
	        nbReqInQueue: number;
	    }>;
	    /**
	     *
	     */
	    hasJsonStructure(str: any): boolean;
	    get host(): any;
	    start(): Promise<any>;
	    stop(): Promise<any>;
	    tokenExpirationControl(bodyjs: {
	        errorCode: number;
	        errorDetails: string;
	    }): void;
	    getUrl(url: any, headers: any, params: any): Promise<any>;
	    _getUrl(url: any, headers: any, params: any): Promise<any>;
	    get(url: any, headers: any, params: any, responseType?: string): Promise<any>;
	    _get(url: any, headers: any, params: any, responseType?: string): Promise<any>;
	    post(url: any, headers: any, data: any, contentType: any): Promise<any>;
	    _post(url: any, headers: any, data: any, contentType: any): Promise<any>;
	    head(url: any, headers?: any): Promise<any>;
	    _head(url: any, headers?: any): Promise<any>;
	    patch(url: any, headers: any, data: any, type: any): Promise<any>;
	    _patch(url: any, headers: any, data: any, type: any): Promise<any>;
	    put(url: any, headers: any, data: any, type: any): Promise<any>;
	    _put(url: any, headers: any, data: any, type: any): Promise<any>;
	    putBuffer(url: any, headers: any, buffer: any): Promise<any>;
	    _putBuffer(url: any, headers: any, buffer: any): Promise<any>;
	    putStream(url: any, headers: any, stream: any): Promise<any>;
	    delete(url: any, headers?: any, data?: Object): Promise<any>;
	    _delete(url: any, headers?: any, data?: Object): Promise<any>;
	}
	export { HTTPService };

}
declare module 'lib/connection/RESTService' {
	/// <reference types="node" />
	import { RESTTelephony } from 'lib/connection/RestServices/RESTTelephony';
	import { HTTPService } from 'lib/connection/HttpService';
	import EventEmitter = NodeJS.EventEmitter;
	import { Logger } from 'lib/common/Logger';
	import { ROOMROLE } from 'lib/services/S2SService';
	import { Core } from 'lib/Core'; enum MEDIATYPE {
	    WEBRTC = "webrtc",
	    PstnAudio = "pstnAudio",
	    WEBRTCSHARINGONLY = "webrtcSharingOnly"
	} class GuestParams {
	    loginEmail: string;
	    password: string;
	    temporaryToken: string;
	    invitationId: string;
	    joinCompanyInvitationId: string;
	    joinCompanyLinkId: string;
	    openInviteId: string;
	    isInitialized: boolean;
	    firstName: string;
	    lastName: string;
	    nickName: string;
	    title: string;
	    jobTitle: string;
	    department: string;
	    emails: {
	        email: string;
	        type: string;
	    };
	    phoneNumbers: Array<{
	        number: string;
	        country: string;
	        type: string;
	        deviceType: string;
	        isVisibleByOthers: boolean;
	    }>;
	    country: string;
	    state: string;
	    language: string;
	    timezone: string;
	    visibility: string;
	    customData: {
	        key1: string;
	        key2: string;
	    };
	    constructor(_loginEmail?: string, _password?: string, _temporaryToken?: string, _invitationId?: string, _joinCompanyInvitationId?: string, _joinCompanyLinkId?: string, _openInviteId?: string, _isInitialized?: boolean, _firstName?: string, _lastName?: string, _nickName?: string, _title?: string, _jobTitle?: string, _department?: string, _emails?: {
	        email: string;
	        type: string;
	    }, _phoneNumbers?: Array<any>, _country?: string, _state?: string, _language?: string, _timezone?: string, _visibility?: string, _customData?: any);
	    getUrlParam(): any;
	} class RESTService {
	    http: HTTPService;
	    account: any;
	    app: any;
	    token: any;
	    renewTokenInterval: any;
	    auth: any;
	    _credentials: any;
	    _application: any;
	    loginEmail: any;
	    eventEmitter: EventEmitter;
	    logger: Logger;
	    currentAttempt: any;
	    attempt_succeeded_callback: any;
	    attempt_failed_callback: any;
	    attempt_promise_resolver: any;
	    _isOfficialRainbow: any;
	    maxAttemptToReconnect: any;
	    fibonacciStrategy: any;
	    reconnectDelay: any;
	    restTelephony: RESTTelephony;
	    applicationToken: string;
	    connectionS2SInfo: any;
	    private reconnectInProgress;
	    private _options;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_options: any, evtEmitter: EventEmitter, _logger: Logger, core: Core);
	    get userId(): any;
	    get loggedInUser(): any;
	    start(http: any): Promise<void>;
	    stop(): Promise<unknown>;
	    getRequestHeader(accept?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	    };
	    getRequestHeaderWithRange(accept?: string, range?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	    };
	    getPostHeader(contentType?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	    };
	    getPostHeaderWithRange(accept?: string, initialSize?: string, minRange?: string, maxRange?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	    };
	    getLoginHeader(auth?: string, password?: string): {
	        Accept: string;
	        "Content-Type": string;
	        Authorization: string;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	    };
	    getDefaultHeader(): {
	        Accept: string;
	        "Content-Type": string;
	    };
	    signin(token?: string): Promise<unknown>;
	    setconnectionS2SInfo(_connectionS2SInfo: any): void;
	    askTokenOnBehalf(loginEmail: any, password: any): Promise<unknown>;
	    signout(): Promise<unknown>;
	    startTokenSurvey(): void;
	    _renewAuthToken(): void;
	    getContacts(): Promise<unknown>;
	    removeContactFromRoster(dbId: any): Promise<unknown>;
	    getContactInformationByJID(jid: any): Promise<unknown>;
	    getContactInformationByID(id: any): Promise<unknown>;
	    getContactInformationByLoginEmail(email: any): Promise<[any]>;
	    getServerFavorites(): Promise<unknown>;
	    addServerFavorite(peerId: string, type: string): Promise<unknown>;
	    removeServerFavorite(favoriteId: string): Promise<unknown>;
	    /**
	     * ACCEPT INVITATION
	     * Used by SDK (public)
	     * Warning when modifying this method
	     */
	    acceptInvitation(invitation: any): Promise<unknown>;
	    /**
	     * DECLINE INVITATION
	     * Used by SDK (public)
	     * Warning when modifying this method
	     */
	    declineInvitation(invitation: any): Promise<unknown>;
	    /**
	     * SEND INVITATION
	     * Used by SDK (public)
	     * Warning when modifying this method
	     */
	    joinContactInvitation(contact: any): Promise<unknown>;
	    joinContacts(contact: any, contactIds: any, presence: any): Promise<unknown>;
	    getInvitationById(invitationId: any): Promise<unknown>;
	    getGroups(): Promise<unknown>;
	    getGroup(groupId: any): Promise<unknown>;
	    setFavoriteGroup(group: any, favorite: any): Promise<unknown>;
	    createGroup(name: any, comment: any, isFavorite: any): Promise<unknown>;
	    deleteGroup(groupId: any): Promise<unknown>;
	    updateGroupName(groupId: any, name: any): Promise<unknown>;
	    addUserInGroup(contactId: any, groupId: any): Promise<unknown>;
	    removeUserFromGroup(contactId: any, groupId: any): Promise<unknown>;
	    getBots(): Promise<unknown>;
	    /**
	     * @description
	     *      https://api.openrainbow.org/admin/#api-users_presence-admin_users_GetUserPresence
	     * @param {any} userId
	     * @return {Promise<unknown>}
	     */
	    getUserPresenceInformation(userId?: any): Promise<unknown>;
	    /**
	     * @description
	     *      https://api.openrainbow.org/mediapillar/#api-mediapillars-GetMediaPillarsData
	     * @return {Promise<unknown>}
	     */
	    getMediaPillarInfo(): Promise<unknown>;
	    createBubble(name: any, description: any, withHistory: any): Promise<unknown>;
	    setBubbleVisibility(bubbleId: any, visibility: any): Promise<unknown>;
	    setBubbleAutoRegister(bubbleId: string, autoRegister?: string): Promise<unknown>;
	    setBubbleTopic(bubbleId: any, topic: any): Promise<unknown>;
	    setBubbleName(bubbleId: any, name: any): Promise<unknown>;
	    getBubbles(): Promise<unknown>;
	    getBubble(bubbleId: any): Promise<unknown>;
	    getBubbleByJid(bubbleJid: any): Promise<unknown>;
	    setBubbleCustomData(bubbleId: any, customData: any): Promise<unknown>;
	    inviteContactToBubble(contactId: any, bubbleId: any, asModerator: any, withInvitation: any, reason: any): Promise<unknown>;
	    inviteContactsByEmailsToBubble(contactsEmails: any, bubbleId: any): Promise<unknown>;
	    getRoomUsers(bubbleId: any, options?: any): Promise<unknown>;
	    promoteContactInBubble(contactId: any, bubbleId: any, asModerator: any): Promise<unknown>;
	    changeBubbleOwner(bubbleId: any, contactId: any): Promise<unknown>;
	    archiveBubble(bubbleId: any): Promise<unknown>;
	    leaveBubble(bubbleId: any, bubbleStatus: any): Promise<unknown>;
	    deleteBubble(bubbleId: any): Promise<unknown>;
	    removeInvitationOfContactToBubble(contactId: any, bubbleId: any): Promise<unknown>;
	    unsubscribeContactFromBubble(contactId: any, bubbleId: any): Promise<unknown>;
	    acceptInvitationToJoinBubble(bubbleId: any): Promise<unknown>;
	    declineInvitationToJoinBubble(bubbleId: any): Promise<unknown>;
	    inviteUser(email: any, companyId: any, language: any, message: any): Promise<unknown>;
	    setAvatarRoom(bubbleid: any, binaryData: any): Promise<unknown>;
	    deleteAvatarRoom(roomId: any): Promise<unknown>;
	    getBubblesConsumption(): Promise<unknown>;
	    getAllBubblesContainers(name?: string): Promise<unknown>;
	    getABubblesContainersById(id?: string): Promise<unknown>;
	    addBubblesToContainerById(containerId: string, bubbleIds: Array<string>): Promise<unknown>;
	    updateBubbleContainerNameAndDescriptionById(containerId: string, name: string, description?: string): Promise<unknown>;
	    createBubbleContainer(name: string, description?: string, bubbleIds?: Array<string>): Promise<unknown>;
	    deleteBubbleContainer(containerId: any): Promise<unknown>;
	    removeBubblesFromContainer(containerId: string, bubbleIds: Array<string>): Promise<unknown>;
	    /**
	     * Method retrieveWebConferences
	     * @public
	     * @param {string} mediaType mediaType of conference to retrieve. Default: this.MEDIATYPE.WEBRTC
	     * @returns {ng.IPromise<any>} a promise that resolves when conference are reterived
	     * @memberof WebConferenceService
	     */
	    retrieveWebConferences(mediaType?: string): Promise<any>;
	    createUser(email: any, password: any, firstname: any, lastname: any, companyId: any, language: any, isAdmin: any, roles: any): Promise<unknown>;
	    createGuestUser(firstname: any, lastname: any, language: any, timeToLive: any): Promise<unknown>;
	    changePassword(password: any, userId: any): Promise<unknown>;
	    updateInformation(objData: any, userId: any): Promise<unknown>;
	    deleteUser(userId: any): Promise<unknown>;
	    createFileDescriptor(name: any, extension: any, size: any, viewers: any): Promise<unknown>;
	    deleteFileDescriptor(fileId: any): Promise<unknown>;
	    retrieveFileDescriptors(format: any, limit: any, offset: any, viewerId: any): Promise<unknown>;
	    retrieveFilesReceivedFromPeer(userId: any, peerId: any): Promise<unknown>;
	    retrieveReceivedFilesForRoomOrViewer(roomId: any): Promise<unknown>;
	    retrieveOneFileDescriptor(fileId: any): Promise<unknown>;
	    retrieveUserConsumption(): Promise<unknown>;
	    deleteFileViewer(viewerId: any, fileId: any): Promise<unknown>;
	    addFileViewer(fileId: any, viewerId: any, viewerType: any): Promise<unknown>;
	    getPartialDataFromServer(url: any, minRange: any, maxRange: any, index: any): Promise<unknown>;
	    getPartialBufferFromServer(url: any, minRange: any, maxRange: any, index: any): Promise<unknown>;
	    getFileFromUrl(url: any): Promise<unknown>;
	    getBlobFromUrl(url: any): Promise<unknown>;
	    uploadAFile(fileId: any, buffer: any): Promise<unknown>;
	    uploadAStream(fileId: any, stream: any): Promise<unknown>;
	    sendPartialDataToServer(fileId: any, file: any, index: any): Promise<unknown>;
	    sendPartialFileCompletion(fileId: any): Promise<unknown>;
	    getServerCapabilities(): Promise<unknown>;
	    getUserSettings(): Promise<unknown>;
	    updateUserSettings(settings: any): Promise<unknown>;
	    getAllCompanies(): Promise<unknown>;
	    getAllUsers(format?: string, offset?: number, limit?: number, sortField?: string, companyId?: string, searchEmail?: string): Promise<unknown>;
	    getContactInfos(userId: any): Promise<unknown>;
	    putContactInfos(userId: any, infos: any): Promise<unknown>;
	    createCompany(name: any, country: any, state: any, offerType: any): Promise<unknown>;
	    getCompany(companyId: any): Promise<unknown>;
	    deleteCompany(companyId: any): Promise<unknown>;
	    setVisibilityForCompany(companyId: any, visibleByCompanyId: any): Promise<unknown>;
	    createPublicChannel(name: any, topic: any, category: string, visibility: any, max_items: any, max_payload_size: any): Promise<unknown>;
	    deleteChannel(channelId: any): Promise<unknown>;
	    findChannels(name: any, topic: any, category: any, limit: any, offset: any, sortField: any, sortOrder: any): Promise<unknown>;
	    getChannels(): Promise<unknown>;
	    getChannel(id: any): Promise<unknown>;
	    publishMessage(channelId: any, message: any, title: any, url: any, imagesIds: any, type: any): Promise<unknown>;
	    private chewReceivedItems;
	    /**
	     * Get latests message from channel
	     */
	    getLatestMessages(maxMessages: number, beforeDate?: Date, afterDate?: Date): Promise<unknown>;
	    subscribeToChannel(channelId: any): Promise<unknown>;
	    unsubscribeToChannel(channelId: any): Promise<unknown>;
	    updateChannel(channelId: any, title: any, visibility: any, max_items: any, max_payload_size: any, channelName: any, mode: any): Promise<unknown>;
	    uploadChannelAvatar(channelId: string, avatar: any, avatarSize: number, fileType: string): Promise<any>;
	    deleteChannelAvatar(channelId: string): Promise<any>;
	    getChannelUsers(channelId: any, options: any): Promise<unknown>;
	    deleteAllUsersFromChannel(channelId: any): Promise<unknown>;
	    updateChannelUsers(channelId: any, users: any): Promise<unknown>;
	    getChannelMessages(channelId: any, maxMessages?: number, beforeDate?: Date, afterDate?: Date): Promise<unknown>;
	    likeItem(channelId: any, itemId: any, appreciation: any): Promise<unknown>;
	    getDetailedAppreciations(channelId: any, itemId: any): Promise<unknown>;
	    /**
	     * Delete item from a channel
	     */
	    deleteChannelMessage(channelId: any, itemId: any): Promise<unknown>;
	    getServerProfiles(): Promise<unknown>;
	    getServerProfilesFeatures(): Promise<unknown>;
	    makeCall(contact: any, phoneInfo: any): Promise<unknown>;
	    releaseCall(call: any): Promise<unknown>;
	    makeConsultationCall(callId: any, contact: any, phoneInfo: any): Promise<unknown>;
	    answerCall(call: any): Promise<unknown>;
	    holdCall(call: any): Promise<unknown>;
	    retrieveCall(call: any): Promise<unknown>;
	    deflectCallToVM(call: any, VMInfos: any): Promise<unknown>;
	    deflectCall(call: any, calleeInfos: any): Promise<unknown>;
	    transfertCall(activeCall: any, heldCall: any): Promise<unknown>;
	    conferenceCall(activeCall: any, heldCall: any): Promise<unknown>;
	    forwardToDevice(contact: any, phoneInfo: any): Promise<unknown>;
	    getForwardStatus(): Promise<unknown>;
	    getNomadicStatus(): Promise<unknown>;
	    nomadicLogin(data: any): Promise<unknown>;
	    sendDtmf(callId: any, deviceId: any, data: any): Promise<unknown>;
	    logon(endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    logoff(endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    withdrawal(agentId: any, groupId: any, status: any): Promise<unknown>;
	    wrapup(agentId: any, groupId: any, password: any, status: any): Promise<unknown>;
	    getRainbowNodeSdkPackagePublishedInfos(): Promise<unknown>;
	    getNpmPackagePublishedInfos(packageName?: string): Promise<unknown>;
	    getServerConversations(format?: String): Promise<unknown>;
	    createServerConversation(conversation: any): Promise<unknown>;
	    deleteServerConversation(conversationId: any): Promise<unknown>;
	    updateServerConversation(conversationId: any, mute: any): Promise<unknown>;
	    sendConversationByEmail(conversationId: any): Promise<unknown>;
	    ackAllMessages(conversationId: any): Promise<unknown>;
	    getAllSentInvitations(): Promise<unknown>;
	    getServerInvitation(invitationId: any): Promise<unknown>;
	    sendInvitationByEmail(email: any, lang: any, customMessage: any): Promise<unknown>;
	    cancelOneSendInvitation(invitation: any): Promise<unknown>;
	    reSendInvitation(invitationId: any): Promise<unknown>;
	    sendInvitationsParBulk(listOfMails: any): Promise<unknown>;
	    getAllReceivedInvitations(): Promise<unknown>;
	    get(url: any, token: any): Promise<unknown>;
	    post(url: any, token: any, data: any, contentType: any): Promise<unknown>;
	    put(url: any, token: any, data: any): Promise<unknown>;
	    delete(url: any, token: any): Promise<unknown>;
	    checkEveryPortals(): Promise<[void, void, void, void, void, void] | {
	        status: string;
	    }>;
	    checkPortalHealth(currentAttempt: any): Promise<unknown>;
	    checkRESTAuthentication(): Promise<boolean>;
	    attemptToReconnect(reconnectDelay: any, currentAttempt: any): void;
	    get_attempt_succeeded_callback(resolve?: any): any;
	    get_attempt_failed_callback(reject?: any): any;
	    reconnect(): Promise<unknown>;
	    listConnectionsS2S(): Promise<any>;
	    sendS2SPresence(obj: any): Promise<any>;
	    deleteConnectionsS2S(connexions: any): Promise<any>;
	    loginS2S(callback_url: any): Promise<any>;
	    infoS2S(s2sConnectionId: any): Promise<any>;
	    setS2SConnection(connectionId: any): Promise<any>;
	    sendS2SMessageInConversation(conversationId: any, msg: any): Promise<any>;
	    getS2SServerConversation(conversationId: any): Promise<any>;
	    checkS2Sconnection(): Promise<any>;
	    checkS2SAuthentication(): Promise<boolean>;
	    /**
	     *
	     * @param roomid
	     * @param {string} role Enum: "member" "moderator" of your role in this room

	     */
	    joinS2SRoom(roomid: any, role: ROOMROLE): Promise<any>;
	    markMessageAsRead(conversationId: any, messageId: any): Promise<unknown>;
	    /**
	     *
	     * @param {string} userId id of to get all openInviteId belonging to this user. If not setted the connected user is used.
	     * @param {string} type type optionnel to get the public link of personal rooms type query parameter used with personal_audio_room or personal_video_room or default.
	     * @param {string} roomId id optionnel to get the public link for a given roomId, managed by the userId roomId
	     * @return {Promise<any>}
	     */
	    getAllOpenInviteIdPerRoomOfAUser(userId?: string, type?: string, roomId?: string): Promise<Array<any>>;
	    generateNewPublicUrl(bubbleId: any): Promise<unknown>;
	    removePublicUrl(bubbleId: any): Promise<unknown>;
	    createPublicUrl(bubbleId: any): Promise<unknown>;
	    registerGuest(guest: GuestParams): Promise<unknown>;
	    joinConference(webPontConferenceId: any, role?: string): Promise<unknown>;
	    getRoomByConferenceEndpointId(conferenceEndpointId: any): Promise<unknown>;
	    conferenceStart(roomId: string, conferenceId: string, mediaType: MEDIATYPE): Promise<unknown>;
	    conferenceStop(conferenceId: string, mediaType: MEDIATYPE, roomId: string): Promise<unknown>;
	    conferenceJoin(conferenceId: any, mediaType: any, asModerator: boolean, muted: boolean, phoneNumber: string, country: string): Promise<unknown>;
	    conferenceDropParticipant(conferenceId: any, mediaType: any, participantId: any): Promise<unknown>;
	    personalConferenceGetPhoneNumbers(): Promise<unknown>;
	    personalConferenceGetPassCodes(personalConferenceConfEndpointId: any): Promise<unknown>;
	    personalConferenceResetPassCodes(personalConferenceConfEndpointId: any): Promise<unknown>;
	    personalConferenceRename(personalConferenceConfEndpointId: string, name: string): Promise<unknown>;
	    askConferenceSnapshot(conferenceId: string, type: MEDIATYPE): Promise<unknown>;
	    conferenceModeratorAction(conferenceId: string, mediaType: MEDIATYPE, action: string): Promise<unknown>;
	    conferenceModeratorActionOnParticipant(conferenceId: string, mediaType: MEDIATYPE, participantId: string, action: string): Promise<unknown>;
	    retrieveAllConferences(scheduled: any): Promise<unknown>;
	    retrieveAllCompanyOffers(companyId: string): Promise<unknown>;
	    retrieveAllCompanySubscriptions(companyId: string): Promise<unknown>;
	    subscribeCompanyToOffer(companyId: string, offerId: string, maxNumberUsers?: number, autoRenew?: boolean): Promise<unknown>;
	    unSubscribeCompanyToSubscription(companyId: string, subscriptionId: string): Promise<unknown>;
	    subscribeUserToSubscription(userId: string, subscriptionId: string): Promise<unknown>;
	    unSubscribeUserToSubscription(userId: string, subscriptionId: string): Promise<unknown>;
	    retrieveAllBubblesByTags(tags: Array<string>): Promise<unknown>;
	    /**
	     *
	     * @param {string} roomId
	     * @param {Array<any>} tags : tags 	Object[]
	     List of objects. Empty to reset the list
	     tag 	String Tag name
	     color optionnel String Tag color - Hex Color in "0x" or "#" prefixed or "non-prefixed"
	     emoji optionnel String Tag emoji - an unicode sequence
	     * @return {Promise<unknown>}
	     */
	    setTagsOnABubble(roomId: string, tags: Array<string>): Promise<unknown>;
	    deleteTagOnABubble(roomIds: Array<string>, tag: string): Promise<unknown>;
	    createDevice(data: Object): Promise<unknown>;
	    updateDevice(deviceId: any, params: Object): Promise<unknown>;
	    deleteDevice(deviceId: string): Promise<unknown>;
	    getDevice(deviceId: string): Promise<unknown>;
	    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number, limit: number): Promise<unknown>;
	    getDevicesTags(companyId: string): Promise<unknown>;
	    /**
	     * @method renameDevicesTags
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. </br>
	     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
	     * @param {string} newTagName New tag name. (Body Parameters)
	     * @description
	     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
	     */
	    renameDevicesTags(newTagName: string, tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @method deleteDevicesTags
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to remove a tag from the devices being in the companyIds provided in this option.. </br>
	     * If companyId is not provided, the tag is deleted from all the devices linked to all the companies that the administrator manage.
	     * @description
	     * This API can be used to remove a tag being assigned to some devices of the companies managed by the administrator.
	     */
	    deleteDevicesTags(tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @method getstatsTags
	     * @param {string} companyId Allows to compute the tags statistics for the devices associated to the companyIds provided in this option.  </br>
	     * if companyId is not provided, the tags statistics are computed for all the devices being in all the companies managed by the logged in administrator.
	     * @description
	     * This API can be used to list all the tags being assigned to the devices of the companies managed by the administrator, with the number of devices for each tags.
	     */
	    getstatsTags(companyId: string): Promise<unknown>;
	    createTemplate(data: Object): Promise<unknown>;
	    updateTemplate(templateId: any, params: Object): Promise<unknown>;
	    deleteTemplate(templateId: string): Promise<unknown>;
	    getTemplate(templateId: string): Promise<unknown>;
	    getTemplates(companyId: string, offset: number, limit: number): Promise<unknown>;
	    createFilter(data: Object): Promise<unknown>;
	    updateFilter(FilterId: any, params: Object): Promise<unknown>;
	    deleteFilter(FilterId: string): Promise<unknown>;
	    getFilter(templateId: string): Promise<unknown>;
	    getFilters(offset: number, limit: number): Promise<unknown>;
	    createAlert(data: Object): Promise<unknown>;
	    updateAlert(AlertId: any, params: Object): Promise<unknown>;
	    deleteAlert(AlertId: string): Promise<unknown>;
	    getAlert(alertId: string): Promise<unknown>;
	    getAlerts(offset: number, limit: number): Promise<unknown>;
	    sendAlertFeedback(alertId: string, data: Object): Promise<unknown>;
	    getReportSummary(alertId: string): Promise<unknown>;
	    getReportDetails(alertId: string): Promise<unknown>;
	    getCalendarState(): Promise<unknown>;
	    getCalendarStates(users?: Array<string>): Promise<unknown>;
	    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string): Promise<unknown>;
	    getCalendarAutomaticReplyStatus(userid?: string): Promise<unknown>;
	    enableOrNotCalendar(disable: boolean): Promise<unknown>;
	    synchronizeUsersAndDeviceswithCSV(CSVTxt?: string, companyId?: string, label?: string, noemails?: boolean, nostrict?: boolean, delimiter?: string, comment?: string): Promise<{
	        reqId: string;
	        mode: string;
	        status: string;
	        userId: string;
	        displayName: string;
	        label: string;
	        startTime: string;
	    }>;
	    getCSVTemplate(companyId?: string, mode?: string, comment?: string): any;
	    checkCSVforSynchronization(CSVTxt: any, companyId?: string, delimiter?: string, comment?: string): any;
	    retrieveRainbowUserList(companyId?: string, format?: string, ldap_id?: boolean): Promise<unknown>;
	    ActivateALdapConnectorUser(): Promise<{
	        id: string;
	        companyId: string;
	        loginEmail: string;
	        password: string;
	    }>;
	    retrieveAllLdapConnectorUsersData(companyId?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    deleteLdapConnector(ldapId: string): Promise<{
	        status: string;
	    }>;
	    retrieveLdapConnectorConfigTemplate(): Promise<unknown>;
	    createConfigurationForLdapConnector(companyId: string, settings: any): Promise<unknown>;
	    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict: boolean): Promise<unknown>;
	    retrieveLdapConnectorConfig(companyId: string): Promise<unknown>;
	    getCloudPbxById(systemId: any): Promise<unknown>;
	    updateCloudPBX(systemId: any, barringOptions_permissions: string, barringOptions_restrictions: string, callForwardOptions_externalCallForward: string, customSipHeader_1: string, customSipHeader_2: string, emergencyOptions_callAuthorizationWithSoftPhone: boolean, emergencyOptions_emergencyGroupActivated: boolean, externalTrunkId: string, language: string, name: string, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean): Promise<unknown>;
	    deleteCloudPBX(systemId: string): Promise<{
	        status: string;
	    }>;
	    getCloudPbxs(limit: number, offset: number, sortField: string, sortOrder: number, companyId: string, bpId: string): Promise<unknown>;
	    createACloudPBX(bpId: string, companyId: string, customSipHeader_1: string, customSipHeader_2: string, externalTrunkId: string, language: string, name: string, noReplyDelay: number, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean, siteId: string): Promise<unknown>;
	    getCloudPBXCLIPolicyForOutboundCalls(systemId: string): Promise<unknown>;
	    updateCloudPBXCLIOptionsConfiguration(systemId: string, policy: string): Promise<unknown>;
	    getCloudPBXlanguages(systemId: string): Promise<unknown>;
	    getCloudPBXDeviceModels(systemId: string): Promise<unknown>;
	    getCloudPBXTrafficBarringOptions(systemId: string): Promise<unknown>;
	    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId: string): Promise<unknown>;
	    CreateCloudPBXSIPDevice(systemId: string, description: string, deviceTypeId: string, macAddress: string): Promise<unknown>;
	    factoryResetCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    getCloudPBXSIPDeviceById(systemId: string, deviceId: string): Promise<unknown>;
	    deleteCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    updateCloudPBXSIPDevice(systemId: string, description: string, deviceId: string, macAddress: string): Promise<unknown>;
	    getAllCloudPBXSIPDevice(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, assigned: boolean, phoneNumberId: string): Promise<unknown>;
	    getCloudPBXSIPRegistrationsInformationDevice(systemId: string, deviceId: string): Promise<unknown>;
	    grantCloudPBXAccessToDebugSession(systemId: string, deviceId: string, duration: string): Promise<unknown>;
	    revokeCloudPBXAccessFromDebugSession(systemId: string, deviceId: string): Promise<unknown>;
	    rebootCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    getCloudPBXSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    deleteCloudPBXSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    createCloudPBXSubscriberRainbowUser(systemId: string, login: string, password: string, shortNumber: string, userId: string): Promise<unknown>;
	    getCloudPBXSIPdeviceAssignedSubscriber(systemId: string, phoneNumberId: string, deviceId: string): Promise<unknown>;
	    removeCloudPBXAssociationSubscriberAndSIPdevice(systemId: string, phoneNumberId: string, deviceId: string): Promise<unknown>;
	    getCloudPBXAllSIPdevicesAssignedSubscriber(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, phoneNumberId: string): Promise<unknown>;
	    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    assignCloudPBXSIPDeviceToSubscriber(systemId: string, phoneNumberId: string, deviceId: string, macAddress: string): Promise<unknown>;
	    getCloudPBXSubscriberCLIOptions(systemId: string, phoneNumberId: string): Promise<unknown>;
	    getCloudPBXUnassignedInternalPhonenumbers(systemId: string): Promise<unknown>;
	    listCloudPBXDDINumbersAssociated(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, isAssignedToUser: boolean, isAssignedToGroup: boolean, isAssignedToIVR: boolean, isAssignedToAutoAttendant: boolean, isAssigned: boolean): Promise<unknown>;
	    createCloudPBXDDINumber(systemId: string, number: string): Promise<unknown>;
	    deleteCloudPBXDDINumber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    associateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string): Promise<unknown>;
	    disassociateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string): Promise<unknown>;
	    setCloudPBXDDIAsdefault(systemId: string, phoneNumberId: string): Promise<unknown>;
	    retrieveExternalSIPTrunkById(externalTrunkId: string): Promise<unknown>;
	    retrievelistExternalSIPTrunks(rvcpInstanceId: string, status: string, trunkType: string): Promise<unknown>;
	}
	export { RESTService, MEDIATYPE, GuestParams };

}
declare module 'lib/common/models/FileViewer' {
	export {}; class FileViewer {
	    contactService: any;
	    viewerId: any;
	    type: any;
	    contact: any;
	    _avatarSrc: any;
	    /**
	     * @this FileViewer
	     */
	    constructor(viewerId: any, type: any, contact: any, _contactService: any);
	    get avatarSrc(): any;
	} function FileViewerElementFactory(viewerId: any, type: any, contact: any, contactService: any): FileViewer;
	export { FileViewerElementFactory, FileViewer };

}
declare module 'lib/common/models/FileDescriptor' {
	export {}; class FileState {
	    static DELETED: string;
	    static UPLOADING: string;
	    static UPLOADED: string;
	    static NOT_UPLOADED: string;
	    static DOWNLOADING: string;
	    static UNKNOWN: string;
	} class ThumbnailPlaceholder {
	    icon: string;
	    style: string;
	    constructor(icon: string, style: string);
	}
	interface IThumbnail {
	    availableThumbnail: boolean;
	    md5sum: string;
	    size: number;
	    wantThumbnailDate: Date;
	    isThumbnailAvailable(): boolean;
	}
	interface IFileDescriptor {
	    id: string;
	    url: string;
	    ownerId: string;
	    fileName: string;
	    extension: string;
	    typeMIME: string;
	    size: number;
	    registrationDate: Date;
	    uploadedDate: Date;
	    viewers: any[];
	    state: FileState;
	    fileToSend: any;
	    previewBlob: any;
	    chunkTotalNumber: number;
	    chunkPerformed: number;
	    chunkPerformedPercent: number;
	    thumbnail: IThumbnail;
	    thumbnailPlaceholder: ThumbnailPlaceholder;
	    orientation: number;
	    isThumbnailPossible(): boolean;
	    isImage(): boolean;
	    isUploaded(): boolean;
	    isAlreadyFileViewer(viewerId: string): boolean;
	    getDisplayName(): string;
	    getDisplayNameTruncated(): String[];
	    getExtension(): string;
	} class FileDescriptor implements IFileDescriptor {
	    id: string;
	    url: string;
	    ownerId: string;
	    fileName: string;
	    extension: string;
	    typeMIME: string;
	    size: number;
	    registrationDate: Date;
	    uploadedDate: Date;
	    viewers: any[];
	    dateToSort: Date;
	    state: FileState;
	    fileToSend: any;
	    previewBlob: any;
	    chunkTotalNumber: number;
	    chunkPerformed: number;
	    chunkPerformedPercent: number;
	    thumbnail: IThumbnail;
	    thumbnailPlaceholder: ThumbnailPlaceholder;
	    orientation: number;
	    md5sum: string;
	    applicationId: string;
	    /**
	     * @this FileDescriptor
	     */
	    constructor(id: string, url: string, ownerId: string, fileName: string, extension: string, typeMIME: string, size: number, registrationDate: Date, uploadedDate: Date, dateToSort: Date, viewers: any, state: FileState, thumbnail: IThumbnail, orientation: number, md5sum: string, applicationId: string);
	    isMicrosoftFile(): boolean;
	    isThumbnailPossible(): boolean;
	    isPDF(): boolean;
	    isImage(): boolean;
	    isAudioVideo(): boolean;
	    isUploaded(): boolean;
	    isAlreadyFileViewer(viewerId: string): boolean;
	    getDisplayName(): string;
	    getDisplayNameTruncated(): String[];
	    getExtension(): string;
	    private getThumbnailPlaceholderFromMimetype;
	} function FileDescriptorFactory(): (id: any, url: any, ownerId: any, fileName: any, extension: any, typeMIME: any, size: any, registrationDate: any, uploadedDate: any, dateToSort: any, viewers: any, state: any, thumbnail: any, orientation: any, md5sum: any, applicationId: any) => FileDescriptor;
	export { FileDescriptorFactory as fileDescriptorFactory, FileDescriptor };

}
declare module 'lib/services/FileServerService' {
	/// <reference types="node" />
	import { Observable } from 'rxjs';
	export {};
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { FileDescriptor } from 'lib/common/models/FileDescriptor';
	import { GenericService } from 'lib/services/GenericService'; class FileServer extends GenericService {
	    private _capabilities;
	    private transferPromiseQueue;
	    private _fileStorageService;
	    ONE_KILOBYTE: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    get capabilities(): Promise<any>;
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<unknown>;
	    /**
	     * Method retrieve data from server using range request mecanism (RFC7233)
	     *
	     * @private
	     * @param {string} url [required] server url for request
	     * @param {number} minRange [requied] minimum value of range
	     * @param {number} maxRange [required] maximum value of range
	     * @param {number} index [required] index of the part. Used to re-assemble the data
	     * @returns {Object} structure containing the response data from server and the index
	     *
	     */
	    getPartialDataFromServer(url: string, minRange: number, maxRange: number, index: number): Promise<unknown>;
	    getPartialBufferFromServer(url: string, minRange: number, maxRange: number, index: number): Promise<unknown>;
	    /**
	     * Method creates buffer from a file retrieved from server using optimization (range request) whenever necessary
	     *
	     * @param {string} url [required] server url for request
	     * @param {string} mime [required] Mime type of the blob to be created
	     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
	     * @param {string} fileName [optional] name of file to be downloaded
	     * @param {string} uploadedDate
	     * @returns {Buffer} Buffer created from data received from server
	     *
	     */
	    getBufferFromUrlWithOptimization(url: string, mime: string, fileSize: number, fileName: string, uploadedDate: string): Promise<unknown>;
	    /**
	     * Method creates buffer from a file retrieved from server using optimization (range request) whenever necessary
	     *
	     * @param destFile
	     * @param {string} url [required] server url for request
	     * @param {string} mime [required] Mime type of the blob to be created
	     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
	     * @param {string} fileName [optional] name of file to be downloaded
	     * @param {string} uploadedDate [optional] date of the upload
	     * @returns {Buffer} Buffer created from data received from server
	     *
	     */
	    getFileFromUrlWithOptimization(destFile: string, url: string, mime: string, fileSize: number, fileName: string, uploadedDate: string): Promise<unknown>;
	    /***
	     * @private
	     * @param fileDescriptor
	     * @param large
	     */
	    getBlobThumbnailFromFileDescriptor(fileDescriptor: any, large?: boolean): Promise<void>;
	    /**
	     * Method sends data file to server
	     *
	     * @private
	     * @param {string} fileId [required] file descriptor ID of file to be sent
	     * @param {string} fileId [required] file to be sent
	     * @param {string} filePath [required] file path to file to be sent
	     * @param {string} mime [required] mime type of file
	     * @returns {Promise<FileDescriptor>} file descriptor data received as response from server or http error response
	     *
	     */
	    _uploadAFile(fileId: string, filePath: string, mime: string): Promise<unknown>;
	    /**
	     * Method sends data to server using range request mecanism (RFC7233)
	     *
	     * @private
	     * @param {string} fileId [required] file descriptor ID of file to be sent
	     * @param {Buffer} file [required] file to be sent
	     * @param {number} index [required] index of the part. Used to indicate the part number to the server
	     * @returns {Promise<{}>} file descriptor data received as response from server or http error response
	     *
	     */
	    _sendPartialDataToServer(fileId: string, file: Buffer, index: number): Promise<unknown>;
	    /**
	     * Upload File ByChunk progressCallback callback is displayed as part of the Requester class.
	     * @callback uploadAFileByChunk~progressCallback
	     * @param {FileDescriptor} fileDescriptor
	     */
	    /**
	     * Method sends data to server using range request mecanism (RFC7233)
	     *
	     * @private
	     * @param {FileDescriptor} fileDescriptor [required] file descriptor Object of file to be sent
	     * @param {string} filePath [required] filePath of the file to be sent
	//     * @param {uploadAFileByChunk~progressCallback} progressCallback [required] initial size of whole file to be sent before partition
	     * @returns {Promise<{FileDescriptor}>} file descriptor data received as response from server or http error response
	     *
	     */
	    uploadAFileByChunk(fileDescriptor: FileDescriptor, filePath: string): Promise<any>;
	    isTransferInProgress(): any;
	    cancelAllTransfers(): void;
	    /**
	     * Method creates blob from a file retrieved from server using optimization (range request) whenever necessary
	     *
	     * @param {string} url [required] server url for request
	     * @param {string} mime [required] Mime type of the blob to be created
	     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
	     * @param {string} fileName [optional] name of file to be downloaded
	     * @param {string} uploadedDate
	     * @returns {Promise<{
	     *                          buffer : Array<any>,
	     *                           type: string, // mime type
	     *                           fileSize: number,
	     *                           fileName: string
	     *                       }>} Object created from data received from server.
	     */
	    getBlobFromUrlWithOptimization(url: string, mime: string, fileSize: number, fileName: string, uploadedDate: string): Promise<unknown>;
	    /**
	     * Method creates blob from a file retrieved from server using optimization (range request) whenever necessary
	     *
	     * @param {string} url [required] server url for request
	     * @param {string} mime [required] Mime type of the blob to be created
	     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
	     * @param {string} fileName [optional] name of file to be downloaded
	     * @param {string} uploadedDate
	     * @returns {Promise<Observable<any>} Observer returning a Blob created from data received from server
	     *
	     */
	    getBlobFromUrlWithOptimizationObserver(url: string, mime: string, fileSize: number, fileName: string, uploadedDate: string): Promise<Observable<any>>;
	    /**
	     * Method creates blob from a file retrieved from server
	     *
	     * @private
	     * @param {string} url [required] server url for request
	     * @param {string} mime [required] Mime type of the blob to be created
	     * @param {number} fileSize [required] size of file to be retrieved
	     * @param {string} fileName [required] name of file to be downloaded
	     * @returns {Promise<{
	     *                          buffer : Array<any>,
	     *                           type: string, // mime type
	     *                           fileSize: number,
	     *                           fileName: string
	     *                       }>} Blob created from data received from server
	     */
	    getBlobFromUrl(url: string, mime: string, fileSize: number, fileName: string): Promise<unknown>;
	    /**
	    * Method retrieves user quota (capabilities) for user
	    *
	    * @returns {Object} user quota for user
	    *
	    */
	    getServerCapabilities(): Promise<unknown>;
	}
	export { FileServer as FileServerService };

}
declare module 'lib/services/FileStorageService' {
	/// <reference types="node" />
	export {};
	import { Observable } from 'rxjs';
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService'; class FileStorage extends GenericService {
	    private _fileServerService;
	    private _conversations;
	    fileDescriptors: any;
	    fileDescriptorsByDate: any;
	    fileDescriptorsByName: any;
	    fileDescriptorsBySize: any;
	    receivedFileDescriptors: any;
	    receivedFileDescriptorsByName: any;
	    receivedFileDescriptorsByDate: any;
	    receivedFileDescriptorsBySize: any;
	    consumptionData: any;
	    private _contactService;
	    private _errorHelperService;
	    private _helpersService;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<unknown>;
	    /**
	     * @private
	     * @since 1.47.1
	     * @method
	     * @instance
	     * @description
	     *    Allow to add a file to an existing Peer 2 Peer or Bubble conversation <br/>
	     *    Return a promise <br/>
	     * @return {Message} Return the message sent
	     */
	    _addFileToConversation(conversation: any, file: any, data: any): Promise<unknown>;
	    /**************** API ***************/
	    /**
	     * @public
	     * @since 1.47.1
	     * @method uploadFileToConversation
	     * @instance
	     * @param {Conversation} conversation   The conversation where the message will be added
	     * @param {{size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
	     * @param {String} strMessage   An optional message to add with the file
	     * @description
	     *    Allow to add a file to an existing conversation (ie: conversation with a contact) <br/>
	     *    Return the promise <br/>
	     * @return {Message} Return the message sent <br/>
	     */
	    uploadFileToConversation(conversation: any, file: any, strMessage: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method uploadFileToBubble
	     * @instance
	     * @param {Bubble} bubble   The bubble where the message will be added
	     * @param {File} file The file to add
	     * @param {String} strMessage   An optional message to add with the file
	     * @description
	     *    Allow to add a file to an existing Bubble conversation <br/>
	     *    Return a promise <br/>
	     * @return {Message} Return the message sent <br/>
	     */
	    uploadFileToBubble(bubble: any, file: any, strMessage: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.67.0
	     * @method uploadFileToStorage
	     * @param {String|File} file An {size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
	     * @instance
	     * @description
	     *   Send a file in user storage <br/>
	     */
	    uploadFileToStorage(file: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method downloadFile
	     * @instance
	     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
	     * @param {string} path If provided then the retrieved file is stored in it. If not provided then
	     * @description
	     *    Allow to download a file from the server) <br/>
	     *    Return a promise <br/>
	     * @return {} Object with : Array of buffer Binary data of the file type,  Mime type, fileSize: fileSize, Size of the file , fileName: fileName The name of the file  Return the file received
	     */
	    downloadFile(fileDescriptor: any, path: string): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.79.0
	     * @method downloadFileInPath
	     * @instance
	     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
	     * @param {string} path If provided then the retrieved file is stored in it. If not provided then
	     * @description
	     *    Allow to download a file from the server and store it in provided path. <br/>
	     *    Return a promise <br/>
	     * @return {Observable<any>} Return an Observable object to see the completion of the download/save. <br/>
	     * It returns a percentage of downloaded data Values are between 0 and 100 (include). <br/>
	     * The last one value is the description and content of the file : <br/>
	     *  { <br/>
	     *      buffer : blobArray, // the buffer with the content of the file. <br/>
	     *      type: mime, // The mime type of the encoded file <br/>
	     *      fileSize: fileSize, // The size in octects of the file <br/>
	     *      fileName: fileName // The file saved. <br/>
	     *  } <br/>
	     *  Warning !!! : <br/>
	     *  take care to not log this last data which can be very important for big files. You can test if the value is < 101. <br/>
	     */
	    downloadFileInPath(fileDescriptor: any, path: string): Promise<Observable<any>>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getUserQuotaConsumption
	     * @instance
	     * @description
	     *    Get the current file storage quota and consumption for the connected user <br/>
	     *    Return a promise <br/>
	     * @return {Object} Return an object containing the user quota and consumption
	     */
	    /**
	     * @public
	     * @since 1.47.1
	     * @method removeFile
	     * @instance
	     * @param {FileDescriptor} fileDescriptor   The description of the file to remove (short file descriptor)
	     * @description
	     *    Remove an uploaded file <br/>
	     *    Return a promise <br/>
	     * @return {Object} Return a SDK OK Object or a SDK error object depending the result
	     */
	    removeFile(fileDescriptor: any): Promise<unknown>;
	    /**********************************************************/
	    /**  Basic accessors to FileStorage's properties   **/
	    /**********************************************************/
	    getFileDescriptorById(id: any): any;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFileDescriptorFromId
	     * @instance
	     * @param {String} id   The file id
	     * @description
	     *    Get the file descriptor the user own by it's id <br/>
	     * @return {FileDescriptor} Return a file descriptors found or null if no file descriptor has been found
	     */
	    getFileDescriptorFromId(id: any): any;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesReceivedInConversation
	     * @instance
	     * @param {Conversation} conversation   The conversation where to get the files
	     * @description
	     *    Get the list of all files received in a conversation with a contact <br/>
	     *    Return a promise <br/>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesReceivedInConversation(conversation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesReceivedInBubble
	     * @instance
	     * @param {Bubble} bubble   The bubble where to get the files
	     * @description
	     *    Get the list of all files received in a bubble <br/>
	     *    Return a promise <br/>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesReceivedInBubble(bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @description
	     * Method returns a file descriptor with full contact object in viewers'list by requesting server <br/>
	     *
	     * @param {string} fileId [required] Identifier of file descriptor
	     * @return {Promise<FileDescriptor>} file descriptor
	     *
	     */
	    getCompleteFileDescriptorById(id: any): Promise<unknown>;
	    /**
	     *
	     * @private
	     *
	     * @return {FileDescriptor[]}
	     */
	    getDocuments(): any;
	    /**
	     *
	     * @private
	     *
	     * @return {FileDescriptor}
	     */
	    getReceivedDocuments(): any;
	    /**
	     *
	     * @private
	     *
	     * @param {boolean} received
	     * @return {FileDescriptor[]}
	     */
	    getDocumentsByName(received: any): any;
	    /**
	     *
	     * @private
	     *
	     * @param {boolean} received
	     * @return {FileDescriptor[]}
	     */
	    getDocumentsByDate(received: any): any;
	    /**
	     *
	     * @private
	     *
	     * @param {boolean} received
	     * @return {FileDescriptor[]}
	     */
	    getDocumentsBySize(received: any): any;
	    /**
	     *
	     * @private
	     *
	     * @param {string} dbId
	     * @return {FileDescriptor[]}
	     */
	    getReceivedFilesFromContact(dbId: any): any;
	    /**
	     *
	     * @private
	     *
	     * @param {string} dbId
	     * @return {FileDescriptor[]}
	     */
	    getSentFilesToContact(dbId: any): any;
	    /**
	     *
	     * @public
	     *
	     * @param {string} bubbleId id of the bubble
	     * @return {FileDescriptor[]}
	     */
	    getReceivedFilesForRoom(bubbleId: any): any;
	    /**
	     *
	     * @private
	     *
	     * @return {Object}
	     */
	    getConsumptionData(): any;
	    /**********************************************************/
	    /**  Methods requesting server                           **/
	    /**********************************************************/
	    /**
	     * @private
	     * @description
	     * Method requests server to create a file descriptor this will be saved to local file descriptor list (i.e. this.fileDescriptors) <br/>
	     *
	     * @param {string} name [required] name of file for which file descriptor has to be created
	     * @param {string} extension [required] extension of file
	     * @param {number} size [required] size of  file
	     * @param {FileViewer[]} viewers [required] list of viewers having access to the file (a viewer could be either be a user or a room)
	     * @return {Promise<FileDescriptor>} file descriptor created by server or error
	     *
	     */
	    createFileDescriptor(name: any, extension: any, size: any, viewers: any): Promise<unknown>;
	    /**
	     *
	     * @private
	     *
	     * @param {*} data
	     * @return {FileDescriptor}
	     */
	    createFileDescriptorFromData(data: any): any;
	    /**
	     * @private
	     * @description
	     *
	     * Method request deletion of a file descriptor on the server and removes it from local storage <br/>
	     * @param {string} id [required] file descriptor id to be destroyed
	     * @return {Promise<FileDescriptor[]>} list of remaining file descriptors
	     */
	    deleteFileDescriptor(id: any): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @description
	     * Method request deletion of all files on the server and removes them from local storage <br/>
	     * @return {Promise<{}>} ???
	     */
	    deleteAllFileDescriptor(): Promise<unknown>;
	    /**
	     * @public
	     *
	     * @description
	     * Method retrieve full list of files belonging to user making the request <br/>
	     *
	     * @return {Promise<FileDescriptor[]>}
	     *
	     */
	    retrieveFileDescriptorsListPerOwner(): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @description
	     * Method retrieve a list of [limit] files belonging to user making the request begining with offset <br/>
	     *
	     * @return {Promise<FileDescriptor[]>}
	     *
	     */
	    retrieveFileDescriptorsListPerOwnerwithOffset(offset: any, limit: any): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @description
	     * Method request for the list of files received by a user from a given peer (i.e. inside a given conversation) <br/>
	     *
	     * @param {string} userId [required] dbId of user making the request
	     * @param {string} peerId [required] dbId of peer user in the conversation
	     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
	     *
	     */
	    retrieveFilesReceivedFromPeer(userId: any, peerId: any): Promise<unknown>;
	    /**
	     * @public
	     *
	     * @description
	     * Method request for the list of files sent to a given peer (i.e. inside a given conversation) <br/>
	     *
	     * @param {string} peerId [required] id of peer user in the conversation
	     * @return {Promise<FileDescriptor[]>} : list of sent files descriptors
	     *
	     */
	    retrieveSentFiles(peerId: any): Promise<unknown>;
	    /**
	     * @public
	     *
	     * @description
	     * Method request for the list of files received in a room <br/>
	     *
	     * @param {string} bubbleId [required] Id of the room
	     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
	     *
	     */
	    retrieveReceivedFilesForRoom(bubbleId: any): Promise<unknown>;
	    /**
	     *
	     * @public
	     *
	     * @description
	     * Method request for the list of files received by a user <br/>
	     *
	     * @param {string} viewerId [required] Id of the viewer, could be either an userId or a bubbleId
	     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
	     *
	     */
	    retrieveReceivedFiles(viewerId: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesSentInConversation
	     * @instance
	     * @param {Conversation} conversation   The conversation where to get the files
	     * @description
	     *    Get the list of all files sent in a conversation with a contact <br/>
	     *    Return a promise <br/>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesSentInConversation(conversation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesSentInBubble
	     * @instance
	     * @param {Bubble} bubble   The bubble where to get the files
	     * @description
	     *    Get the list of all files sent in a bubble <br/>
	     *    Return a promise <br/>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesSentInBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method
	     * @instance
	     * @description
	     *    Get the current file storage quota and consumption for the connected user <br/>
	     *    Return a promise <br/>
	     * @return {Object} Return an object containing the user quota and consumption
	     */
	    getUserQuotaConsumption(): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getAllFilesSent
	     * @instance
	     * @description
	     *    Get the list of files (represented using an array of File Descriptor objects) created and owned by the connected which is the list of file sent to all of his conversations and bubbles. <br/>
	     * @return {FileDescriptor[]} Return an array containing the list of FileDescriptor objects representing the files sent
	     */
	    getAllFilesSent(): any;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getAllFilesReceived
	     * @instance
	     * @description
	     *    Get the list of files (represented using an array of File Descriptor objects) received by the connected user from all of his conversations and bubbles. <br/>
	     * @return {FileDescriptor[]} Return an array containing a list of FileDescriptor objects representing the files received
	     */
	    getAllFilesReceived(): any;
	    /**
	     * @private
	     *
	     * @description
	     * Method retrieve the data usage of a given user <br/>
	     *
	     * @return {Promise<{}>} : object data with the following properties:
	     *                  - feature {string} : The feature key belonging to the user's profile
	     *                  - maxValue {number} : The quota associated to this offer [octet]
	     *                  - currentValue {number} : The user's current consumption [octet]
	     *                  - unit {string} : The unit of this counters
	     */
	    retrieveUserConsumption(): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @description
	     * Method deletes a viewer from the list of viewer of a given file <br/>
	     *
	     * @param {string} viewerId [required] Identifier of viewer to be removed. Could be either a user or a room
	     * @param {string} fileId [required] Identifier of the fileDescriptor from which the viewer will be removed
	     * @return {Promise<{}>}
	     *
	     */
	    deleteFileViewer(viewerId: any, fileId: any): Promise<unknown>;
	    /**
	     *
	     * @private
	     *
	     * @description
	     * Method adds a viewer to a given file on server if it is not already one
	     *
	     * @param {string} fileId [required] Identifier of file
	     * @param {string} viewerId [required] Identifier of viewer to be added
	     * @param {string} viewerType [required] type of viewer to be added (user or room)
	     * @return {Promise<FileDescriptor>} file descriptor with newly added viewer
	     *
	     */
	    addFileViewer(fileId: any, viewerId: any, viewerType: any): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveOneFileDescriptor
	     * @instance
	     * @description
	     * Method retrieve a specific file descriptor from server <br/>
	     *
	     * @param {string} fileId [required] Identifier of file descriptor to retrieve
	     * @return {Promise<FileDescriptor>} file descriptor retrieved
	     *
	     */
	    retrieveOneFileDescriptor(fileId: any): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @description
	     * Method retrieve a specific file descriptor from server and stores it in local fileDescriptors (replace existing and add if new) <br/>
	     *
	     * @param {string} fileId [required] Identifier of file descriptor to retrieve
	     * @return {Promise<FileDescriptor>} file descriptor retrieved or null if none found
	     *
	     */
	    retrieveAndStoreOneFileDescriptor(fileId: any, forceRetrieve: any): Promise<any>;
	    /**********************************************************/
	    /**  Utilities                                           **/
	    /**********************************************************/
	    deleteFileDescriptorFromCache(id: any, forceDelete: any): void;
	    orderDocuments(): void;
	    orderReceivedDocuments(): void;
	    orderDocumentsForRoom(documents: any): any[];
	    replaceOrderedByFilter(resultArray: any, originalArray: any, filterFct: any, flag: any, sortFct: any): void;
	    getName(file: any): {
	        name: string;
	        date: string;
	    };
	    getDate(file: any): any;
	    getSize(file: any): {
	        name: string;
	        size: string;
	    };
	    sortByName(fileA: any, fileB: any): number;
	    sortBySize(fileA: any, fileB: any): number;
	    sortByDate(fileA: any, fileB: any): number;
	    /**
	     * @private
	     *
	     * @description
	     * Method extract fileId part of URL <br/>
	     *
	     * @param {string} url
	     * @return {string}
	     *
	     */
	    extractFileIdFromUrl(url: any): any;
	}
	export { FileStorage as FileStorageService };

}
declare module 'lib/common/models/GeoLoc' {
	export {}; class GeoLoc {
	    datum: string;
	    latitude: string;
	    longitude: string;
	    altitude: string;
	    static create(datum: string, latitude: string, longitude: string, altitude: string): GeoLoc;
	}
	export { GeoLoc };

}
declare module 'lib/common/models/Message' {
	import { GeoLoc } from 'lib/common/models/GeoLoc';
	import { Conversation } from 'lib/common/models/Conversation';
	export {}; class Message {
	    /**
	     *  The Type of message.
	     * @public
	     * @enum {{ key: number, value: string }}
	     * @readonly
	     */
	    static Type: any;
	    /**
	     * The Status of the Receipt.
	     * @public
	     * @enum {number}
	     * @readonly
	     */
	    static ReceiptStatus: {
	        /** No receipt received yet */
	        NONE: number;
	        /** No receipt received after a while (The server doesn't answer) */
	        ERROR: number;
	        /** Receipt in progress */
	        IN_PROGRESS: number;
	        /** The server has confirmed the reception of the message */
	        SENT: number;
	        /** The message has been received but not read */
	        UNREAD: number;
	        /** The message has been read */
	        READ: number;
	    };
	    /**
	     * @private
	     */
	    static ReceiptStatusText: string[];
	    /**
	     * The Side of Message's from
	     * @public
	     * @enum {string}
	     * @readonly
	     */
	    static Side: {
	        /** Message is from a recipient */
	        LEFT: string;
	        /** Message is from me */
	        RIGHT: string;
	        /** Specific admin message */
	        ADMIN: string;
	    };
	    serverAckTimer: any;
	    private index;
	    id: string;
	    type: any;
	    date: Date;
	    from: any;
	    side: string;
	    status: string;
	    receiptStatus: number;
	    fileId: string;
	    fileName: string;
	    isMarkdown: boolean;
	    subject: string;
	    geoloc: GeoLoc;
	    voiceMessage: any;
	    alternativeContent: any;
	    attention: any;
	    mentions: any;
	    urgency: string;
	    urgencyAck: boolean;
	    urgencyHandler: any;
	    historyIndex: string;
	    fileErrorMsg: string;
	    attachedMsgId: string;
	    attachIndex: number;
	    attachNumber: number;
	    fromJid: any;
	    resource: any;
	    toJid: any;
	    content: any;
	    lang: any;
	    cc: any;
	    cctype: any;
	    isEvent: any;
	    event: any;
	    oob: {
	        url: string;
	        mime: string;
	        filename: string;
	        filesize: string;
	    };
	    fromBubbleJid: any;
	    fromBubbleUserJid: any;
	    answeredMsgId: string;
	    answeredMsg: Message;
	    answeredMsgDate: string;
	    answeredMsgStamp: string;
	    fileTransfer: any;
	    eventJid: string;
	    originalMessageReplaced: Message;
	    confOwnerId: string;
	    confOwnerDisplayName: string;
	    confOwnerJid: string;
	    conversation: Conversation;
	    isForwarded: boolean;
	    forwardedMsg: any;
	    constructor(serverAckTimer: any, index: any, id: string, type: any, date: Date, from: any, side: string, status: string, receiptStatus: number, isMarkdown: boolean, subject: string, geoloc: GeoLoc, voiceMessage: any, alternativeContent: any, attention: any, mentions: any, urgency: string, urgencyAck: boolean, urgencyHandler: any, historyIndex: string, attachedMsgId: string, attachIndex: number, attachNumber: number, resource: any, toJid: any, content: any, lang: any, cc: any, cctype: any, isEvent: any, event: any, oob: {
	        url: string;
	        mime: string;
	        filename: string;
	        filesize: string;
	    }, fromBubbleJid: any, fromBubbleUserJid: any, answeredMsg: Message, answeredMsgId: string, answeredMsgDate: string, answeredMsgStamp: string, eventJid: string, originalMessageReplaced: Message, confOwnerId: string, confOwnerDisplayName: string, confOwnerJid: string, isForwarded: boolean, forwardedMsg: any);
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    static create(serverAckTimer: any, index: any, id: string, type: any, date: Date, from: any, side: string, /*  data: string ,*/ status: string, receiptStatus: number, /* fileId: string, */ /* fileName: string, */ isMarkdown: boolean, subject: string, geoloc: GeoLoc, voiceMessage: any, alternativeContent: any, attention: any, mentions: any, urgency: string, urgencyAck: boolean, urgencyHandler: any, /* translatedText: string = null, */ /* isMerged: boolean, */ historyIndex: string, /*showCorrectedMessages: boolean,*/ /* replaceMsgs: any[],*/ /* fileErrorMsg: string = null, */ attachedMsgId: string, attachIndex: number, attachNumber: number, /* fromJid: any, */ resource: any, toJid: any, content: any, lang: any, cc: any, cctype: any, isEvent: any, event: any, oob: {
	        url: string;
	        mime: string;
	        filename: string;
	        filesize: string;
	    }, fromBubbleJid: any, fromBubbleUserJid: any, answeredMsg: Message, answeredMsgId: string, answeredMsgDate: string, answeredMsgStamp: string, /* fileTransfer: any,*/ eventJid: string, originalMessageReplaced: Message, confOwnerId: string, confOwnerDisplayName: string, confOwnerJid: string, isForwarded: boolean, forwardedMsg: any): Message;
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    static createFileSharingMessage(id: any, date: any, from: any, side: any, data: any, status: any, fileId: any): Message;
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    static createWebRTCMessage(id: any, date: any, from: any, side: any, data: any, status: any): Message;
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    static createFTMessage(id: any, date: any, from: any, side: any, data: any, status: any, fileTransfer: any): Message;
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    static createBubbleAdminMessage(id: any, date: any, from: any, type: any): Message;
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    static createRecordingAdminMessage(id: any, date: any, from: any, type: any, cmd: any): Message;
	    /**
	     * Method extract fileId part of URL
	     *
	     * @private
	     * @param {string} url
	     * @returns {string}
	     *
	     * @memberof Conversation
	     */
	    static extractFileIdFromUrl(url: any): any;
	    updateMessage(data: any): this;
	    /**
	     * @function
	     * @public
	     * @name MessageFactory
	     * @description
	     * This class is used to create a message from data object
	     */
	    static MessageFactory(): (data: any) => Message;
	}
	export { Message };

}
declare module 'lib/connection/XMPPServiceHandler/conversationEventHandler' {
	import { Element } from 'ltx';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler';
	export {}; class ConversationEventHandler extends GenericHandler {
	    MESSAGE_CHAT: any;
	    MESSAGE_GROUPCHAT: any;
	    MESSAGE_WEBRTC: any;
	    MESSAGE_MANAGEMENT: any;
	    MESSAGE_ERROR: any;
	    MESSAGE_HEADLINE: any;
	    MESSAGE_CLOSE: any;
	    private _conversationService;
	    findAttrs: any;
	    findChildren: any;
	    private _fileStorageService;
	    private _fileServerService;
	    private _bubbleService;
	    private _contactsService;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: any, conversationService: any, fileStorageService: any, fileServerService: any, bubbleService: any, contactsService: any);
	    onChatMessageReceived(msg: any, stanza: Element): Promise<void>;
	    _onMessageReceived(conversationId: any, data: any): Promise<void>;
	    onRoomAdminMessageReceived(msg: any, stanza: any): void;
	    onFileMessageReceived(msg: any, stanza: any): void;
	    onWebRTCMessageReceived(msg: any, stanza: any): void;
	    onManagementMessageReceived(msg: any, stanza: any): void;
	    onRoomManagementMessageReceived(node: any): void;
	    onUserSettingsManagementMessageReceived(node: any): void;
	    onUserInviteManagementMessageReceived(node: any): void;
	    onGroupManagementMessageReceived(node: any): void;
	    onConversationManagementMessageReceived(node: Element): Promise<void>;
	    onMuteManagementMessageReceived(node: any): void;
	    onUnmuteManagementMessageReceived(node: any): void;
	    onFileManagementMessageReceived(node: any): Promise<void>;
	    onThumbnailManagementMessageReceived(node: any): void;
	    onRoomsContainerManagementMessageReceived(node: any): Promise<void>;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): void;
	    onCloseMessageReceived(msg: any, stanza: any): void;
	}
	export { ConversationEventHandler };

}
declare module 'lib/connection/XMPPServiceHandler/conversationHistoryHandler' {
	import { XMPPService } from 'lib/connection/XMPPService';
	export {};
	import { ConversationsService } from 'lib/services/ConversationsService';
	import { ContactsService } from 'lib/services/ContactsService';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class ConversationHistoryHandler extends GenericHandler {
	    MESSAGE_MAM: any;
	    FIN_MAM: any;
	    _conversationService: ConversationsService;
	    private _contactsService;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, conversationService: ConversationsService, contactsService: ContactsService);
	    onMamMessageReceived(msg: any, stanza: any): boolean;
	    onHistoryMessageReceived(msg: any, stanza: any): boolean;
	    onWebrtcHistoryMessageReceived(stanza: any, conversation: any): boolean;
	}
	export { ConversationHistoryHandler };

}
declare module 'lib/common/Emoji' {
	export {}; function shortnameToUnicode(str: any): any;
	export { shortnameToUnicode };

}
declare module 'lib/services/ConversationsService' {
	/// <reference types="node" />
	export {};
	import { Conversation } from 'lib/common/models/Conversation';
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Contact } from 'lib/common/models/Contact';
	import { Core } from 'lib/Core';
	import { Message } from 'lib/common/models/Message';
	import { Bubble } from 'lib/common/models/Bubble';
	import { GenericService } from 'lib/services/GenericService'; class ConversationsService extends GenericService {
	    private _contactsService;
	    private _fileStorageService;
	    private _fileServerService;
	    private _presence;
	    private pendingMessages;
	    private _conversationEventHandler;
	    private _conversationHandlerToken;
	    private _conversationHistoryHandlerToken;
	    conversations: Array<Conversation>;
	    private _conversationServiceEventHandler;
	    private _bubblesService;
	    activeConversation: any;
	    inCallConversations: any;
	    idleConversations: any;
	    involvedContactIds: any;
	    involvedRoomIds: any;
	    waitingBotConversations: any;
	    botServiceReady: any;
	    private _conversationHistoryHandler;
	    private chatRenderer;
	    private conversationsRetrievedFormat;
	    private nbMaxConversations;
	    private autoLoadConversations;
	    get startConfig(): {
	        start_up: boolean;
	        optional: boolean;
	    };
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    }, _conversationsRetrievedFormat: string, _nbMaxConversations: number, _autoLoadConversations: boolean);
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    attachHandlers(): void;
	    _onReceipt(receipt: any): void;
	    sortFunction(aa: any, bb: any): number;
	    /**
	     * @public
	     * @method sendIsTypingState
	     * @instance ConversationsService
	     * @description
	     *    Switch the "is typing" state in a conversation<br>
	     * @param {Conversation} conversation The conversation recipient
	     * @param {boolean} status The status, true for setting "is Typing", false to remove it
	     * @return a promise with no success parameter
	     */
	    sendIsTypingState(conversation: Conversation, status: string): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     * Get a pstn conference <br/>
	     */
	    getRoomConferences(conversation: any): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     * Update a pstn conference <br/>
	     */
	    updateRoomConferences(): void;
	    /*********************************************************/
	    /**                   MESSAGES STUFF                    **/
	    /*********************************************************/
	    /**
	     * @public
	     * @method ackAllMessages
	     * @instance
	     * @description
	     *    Mark all unread messages in the conversation as read. <br/>
	     * @param {string} conversationDbId ID of the conversation (dbId field)
	     * @async
	     * @return {Promise<Conversation[]>}
	     * @fulfil {Conversation[]} - Array of Conversation object
	     * @category async
	     */
	    ackAllMessages(conversationDbId: any): Promise<unknown>;
	    resetHistoryPageForConversation(conversation: Conversation): void;
	    /**
	     * @public
	     * @method getHistoryPage
	     * @instance
	     * @description
	     *    Retrieve the remote history of a specific conversation. <br/>
	     * @param {Conversation} conversation Conversation to retrieve
	     * @param {number} size Maximum number of element to retrieve
	     * @async
	     * @return {Promise<Conversation[]>}
	     * @fulfil {Conversation[]} - Array of Conversation object
	     * @category async
	     */
	    getHistoryPage(conversation: Conversation, size?: number): any;
	    /**
	     *
	     * @public
	     * @method getOneMessageFromConversationId
	     * @instance
	     * @description
	     *    To retrieve ONE message archived on server exchanged in a conversation based on the specified message Id and the timestamp <br/>
	     * <br/>
	     *    Time stamp is mandatory - the search is performed using it. <br/>
	     *    Once results are returned, we look for a message with the message id specified. <br/>
	     * @param {string} conversationId : Id of the conversation
	     * @param {string} messageId : Id of the message
	     * @param {string} stamp : Time stamp. Time stamp is mandatory - the search is performed using it.
	     * @async
	     * @return {Promise<any>}
	     */
	    getOneMessageFromConversationId(conversationId: string, messageId: string, stamp: string): Promise<Message>;
	    /**
	     *
	     * @public
	     * @method getContactsMessagesFromConversationId
	     * @instance
	     * @description
	     *    To retrieve messages exchanged by contacts in a conversation. The result is the messages without event type. <br/>
	     * @param {string} conversationId : Id of the conversation
	     * @async
	     * @return {Promise<any>}
	     */
	    getContactsMessagesFromConversationId(conversationId: string): Promise<Message>;
	    searchMessageArchivedFromServer(conversation: Conversation, messageId: string, stamp: string): Promise<any>;
	    /**
	     * @private
	     * @method sendFSMessage
	     * @instance
	     * @description
	     *   Send an file sharing message <br/>
	     */
	    sendFSMessage(conversation: any, file: any, data: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendExistingMessage
	     * @instance
	     * @description
	     *    Send a message to this conversation <br/>
	     * @return {Message} The message sent
	     * @param {Conversation} conversation
	     * @param {string} message
	     * @param {any} fileDescriptor
	     */
	    sendExistingFSMessage(conversation: Conversation, message: string, fileDescriptor: any): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *   Send an existing file sharing message <br/>
	     */
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *    Send a instant message to a conversation <br/>
	     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br/>
	     * @param {Conversation} conversation The conversation to clean
	     * @param {string} data Test message to send
	     * @param answeredMsg
	     */
	    /**
	     * SEND CORRECTED MESSAGE
	     */
	    /**
	     * @public
	     * @method sendCorrectedChatMessage
	     * @instance
	     * @description
	     *    Send a corrected message to a conversation <br/>
	     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br/>
	     *    The new message has the property originalMessageReplaced which spot on original message // Warning this is a circular depend. <br/>
	     *    The original message has the property replacedByMessage  which spot on the new message // Warning this is a circular depend. <br/>
	     *    Note: only the last sent message on the conversation can be changed. The connected user must be the sender of the original message. <br/>
	     * @param {Conversation} conversation
	     * @param {string} data The message string corrected
	     * @param {string} origMsgId The id of the original corrected message.
	     * @returns {Promise<string>} message the message new correction message sent. Throw an error if the send fails.
	     */
	    sendCorrectedChatMessage(conversation: Conversation, data: string, origMsgId: string): Promise<any>;
	    /**
	     * @public
	     * @since 1.58
	     * @method deleteMessage
	     * @instance
	     * @async
	     * @description
	     *    Delete a message by sending an empty string in a correctedMessage <br/>
	     * @param {Conversation} conversation The conversation object
	     * @param {string} messageId The id of the message to be deleted
	     * @return {Message} - message object with updated replaceMsgs property
	     */
	    deleteMessage(conversation: Conversation, messageId: string): Promise<any>;
	    /**
	     *
	     * @public
	     * @since 1.67.0
	     * @method deleteAllMessageInOneToOneConversation
	     * @instance
	     * @async
	     * @description
	     *   Delete all messages for the connected user on a one to one conversation. <br/>
	     * @param {Conversation} conversation The conversation object
	     * @return {Message} - message object with updated replaceMsgs property
	     */
	    deleteAllMessageInOneToOneConversation(conversation: Conversation): Promise<unknown>;
	    /**
	     * @private
	     * @description
	     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br/>
	     *      It allow to give back the status of the sending process. <br/>
	     * @param conversation
	     * @param message
	     */
	    storePendingMessage(conversation: any, message: any): void;
	    /**
	     * @private
	     * @description
	     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br/>
	     *      It allow to give back the status of the sending process. <br/>
	     * @param message
	     */
	    removePendingMessage(message: any): void;
	    /**
	     * @public
	     * @method removeAllMessages
	     * @instance
	     * @description
	     *    Cleanup a conversation by removing all previous messages<br/>
	     *    This method returns a promise <br/>
	     * @param {Conversation} conversation The conversation to clean
	     * @async
	     * @return {Promise}
	     * @fulfil {} Return nothing in case success
	     * @category async
	     */
	    removeAllMessages(conversation: Conversation): Promise<unknown>;
	    /**
	     * @public
	     * @method removeMessagesFromConversation
	     * @instance
	     * @description
	     *    Remove a specific range of message in a conversation<br/>
	     *    This method returns a promise <br/>
	     * @param {Conversation} conversation The conversation to clean
	     * @param {Date} date The date since when the message should be deleted.
	     * @param {number} number max number of messages to delete.
	     * @async
	     * @return {Promise}
	     * @fulfil {} Return nothing in case success
	     * @category async
	     */
	    removeMessagesFromConversation(conversation: Conversation, date: Date, number: number): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllConversations
	     * @instance
	     * @description
	     *    Allow to get the list of existing conversations (p2p and bubbles) <br/>
	     * @return {Conversation[]} An array of Conversation object
	     */
	    getAllConversations(): any[];
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *      Get all conversation <br/>
	     * @return {Conversation[]} The conversation list to retrieve
	     */
	    getConversations(): any[];
	    /**
	     * @public
	     * @method openConversationForContact
	     * @instance
	     * @description
	     *    Open a conversation to a contact <br/>
	     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br/>
	     *    This method returns a promise <br/>
	     * @param {Contact} contact The contact involved in the conversation
	     * @return {Conversation} The conversation (created or retrieved) or null in case of error
	     */
	    openConversationForContact(contact: Contact): Promise<Conversation>;
	    /**
	     * @public
	     * @method openConversationForBubble
	     * @since 1.65
	     * @instance
	     * @description
	     *    Open a conversation to a bubble <br/>
	     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br/>
	     *    This method returns a promise <br/>
	     * @param {Bubble} bubble The bubble involved in this conversation
	     * @return {Conversation} The conversation (created or retrieved) or null in case of error
	     */
	    openConversationForBubble(bubble: Bubble): Promise<unknown>;
	    /**
	     * @private
	     * @method getS2SServerConversation
	     * @since 1.65
	     * @instance
	     * @description
	     *    get a conversation from id on S2S API Server.<br/>
	     *    This method returns a promise <br/>
	     * @param {string} conversationId The id of the conversation to find.
	     * @return {Conversation} The conversation (created or retrieved) or null in case of error
	     */
	    getS2SServerConversation(conversationId: string): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *    Allow to delete a conversation on server (p2p and bubbles) <br/>
	     * @param {string} conversationId of the conversation (id field)
	     * @return {Promise}
	     */
	    deleteServerConversation(conversationId: string): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *    Allow to mute notification in a conversations (p2p and bubbles) <br/>
	     *    When a conversation is muted/unmuted, all user's resources will receive the notification <br/>
	     * @param {string} conversationId ID of the conversation (dbId field)
	     * @param {Boolean} mute mutation state
	     * @return {Promise}
	     */
	    updateServerConversation(conversationId: any, mute: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendConversationByEmail
	     * @instance
	     * @description
	     *    Allow to get the specified conversation as mail attachment to the login email of the current user (p2p and bubbles) <br/>
	     *    can be used to backup a conversation between a rainbow user and another one, or between a user and a room, <br/>
	     *    The backup of the conversation is restricted to a number of days before now. By default the limit is 30 days. <br/>
	     * @param {string} conversationDbId ID of the conversation (dbId field)
	     * @async
	     * @return {Promise<Conversation[]>}
	     * @fulfil {Conversation[]} - Array of Conversation object
	     * @category async
	     */
	    sendConversationByEmail(conversationDbId: any): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     */
	    getOrCreateOneToOneConversation(conversationId: any, conversationDbId?: any, lastModification?: any, lastMessageText?: any, missedIMCounter?: any, muted?: any, creationDate?: any): Promise<Conversation>;
	    /**
	     * @public
	     * @method getConversationById
	     * @instance
	     * @description
	     *      Get a p2p conversation by id <br/>
	     * @param {string} conversationId Conversation id of the conversation to clean
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationById(conversationId: string): any;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *      Get a conversation by db id <br/>
	     * @param {string} dbId db id of the conversation to retrieve
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationByDbId(dbId: string): Conversation;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *      Get a bubble conversation by bubble id <br/>
	     * @param {string} bubbleId Bubble id of the conversation to retrieve
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationByBubbleId(bubbleId: string): Promise<Conversation>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *      Get a bubble conversation by bubble id <br/>
	     * @param {string} bubbleJid Bubble jid of the conversation to retrieve
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationByBubbleJid(bubbleJid: string): Conversation;
	    /**
	     * @public
	     * @method getBubbleConversation
	     * @instance
	     * @description
	     *    Get a conversation associated to a bubble (using the bubble ID to retrieve it) <br/>
	     * @param {string} bubbleJid JID of the bubble (dbId field)
	     * @param {string} conversationDbId
	     * @param {Date} lastModification
	     * @param {string} lastMessageText
	     * @param {number} missedIMCounter
	     * @param {boolean} noError
	     * @param {boolean} muted
	     * @param {Date} creationDate
	     * @param {string} lastMessageSender
	     * @async
	     * @return {Promise<Conversation>}
	     * @fulfil {Conversation} - Conversation object or null if not found
	     * @category async
	     */
	    getBubbleConversation(bubbleJid: string, conversationDbId?: string, lastModification?: Date, lastMessageText?: string, missedIMCounter?: number, noError?: boolean, muted?: boolean, creationDate?: Date, lastMessageSender?: string): Promise<any>;
	    /**
	     * @public
	     * @method closeConversation
	     * @instance
	     * @description
	     *    Close a conversation <br/>
	     *    This method returns a promise <br/>
	     * @param {Conversation} conversation The conversation to close
	     * @async
	     * @return {Promise}
	     * @fulfil {} Return nothing in case success
	     * @category async
	     */
	    closeConversation(conversation: Conversation): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *    Remove locally a conversation <br/>
	     *    This method returns a promise <br/>
	     * @param {Conversation} conversation The conversation to remove
	     */
	    removeConversation(conversation: Conversation): void;
	    /**
	     * @public
	     * @method cleanConversations
	     * @instance
	     * @async
	     * @description
	     *    Allow to clean openned conversations. It keep openned the maxConversations last modified conversations. If maxConversations is not defined then keep the last 15 conversations. <br/>
	     * @return {Promise<any>} the result of the deletion.
	     * @category async
	     */
	    cleanConversations(): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *    Allow to get the list of existing conversations from server (p2p and bubbles) <br/>
	     * @return {Conversation[]} An array of Conversation object
	     */
	    getServerConversations(): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     *    Allow to create a conversations on server (p2p and bubbles) <br/>
	     * @param {Conversation} conversation of the conversation (dbId field)
	     * @return {Conversation} Created conversation object
	     */
	    createServerConversation(conversation: Conversation): Promise<Conversation>;
	    removeOlderConversations(conversations?: []): Promise<unknown>;
	    /**
	     * @private
	     */
	    onRoomChangedEvent(__event: any, bubble: any, action: any): Promise<void>;
	    /**
	     * @private
	     */
	    /**
	     * @private
	     */
	    /*********************************************************************/
	    /** Remove the conversation history                                 **/
	    /*********************************************************************/
	    /**
	     * @private
	     *
	     */
	    reinit(): Promise<unknown>;
	    /*********************************************************************/
	    /** BOT SERVICE IS RUNNING, CREATE ALL BOT CONVERSATIONS            **/
	    /*********************************************************************/
	    unlockWaitingBotConversations(isBotServiceReady?: any): void;
	}
	export { ConversationsService as ConversationsService };

}
declare module 'lib/connection/S2S/S2SServiceEventHandler' {
	export {};
	import { Core } from 'lib/Core'; class S2SServiceEventHandler {
	    private _logger;
	    private _eventEmitter;
	    private _rest;
	    private callbackAbsolutePath;
	    private _contacts;
	    private _bulles;
	    private jid_im;
	    private jid_password;
	    private userId;
	    private fullJid;
	    private jid_tel;
	    private jid;
	    private xmppUtils;
	    private _conversations;
	    private shouldSendReadReceipt;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_im: any, _application: any, _eventEmitter: any, _logger: any, _hostCallback: any);
	    setAccount(account: any): void;
	    handleS2SEvent(event: any): boolean | Promise<boolean>;
	    ParseConnectionCallback(event: any): boolean;
	    ParsePresenceCallback(event: any): Promise<boolean>;
	    ParseChatStateCallback(content: any): Promise<boolean>;
	    ParseReceiptCallback(content: any): Promise<boolean>;
	    ParseAllReceiptCallback(content: any): boolean;
	    ParseConversationCallback(content: any): Promise<boolean>;
	    ParseMessageCallback(content: any): Promise<boolean>;
	    ParseRoomInviteCallback(content: any): Promise<boolean>;
	    ParseRoomMemberCallback(content: any): Promise<boolean>;
	    ParseRoomStateCallback(content: any): Promise<boolean>;
	    ParseAlldeletedCallback(content: any): Promise<boolean>;
	    ParseErrorCallback(content: any): Promise<boolean>;
	    start(_core: Core): Promise<unknown>;
	}
	export { S2SServiceEventHandler };

}
declare module 'lib/ProxyImpl' {
	export {}; class ProxyImpl {
	    _logger: any;
	    _protocol: any;
	    _host: any;
	    _port: any;
	    _activated: any;
	    _proxyURL: any;
	    private _user;
	    private _password;
	    private _secureProtocol;
	    constructor(config: any, _logger: any);
	    get proxyURL(): any;
	    get isProxyConfigured(): any;
	    get secureProtocol(): string;
	    set secureProtocol(value: string);
	}
	export { ProxyImpl };

}
declare module 'lib/services/S2SService' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { ProxyImpl } from 'lib/ProxyImpl';
	import { GenericService } from 'lib/services/GenericService'; class S2SService extends GenericService {
	    private serverURL;
	    private host;
	    version: any;
	    jid_im: any;
	    jid_tel: any;
	    jid_password: any;
	    fullJid: any;
	    jid: any;
	    userId: any;
	    private proxy;
	    private xmppUtils;
	    private generatedRandomId;
	    private hash;
	    private hostCallback;
	    private app;
	    private locallistenningport;
	    private s2sEventHandler;
	    private _contacts;
	    private _conversations;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_s2s: {
	        hostCallback: string;
	        locallistenningport: string;
	    }, _im: any, _application: any, _eventEmitter: EventEmitter, _logger: Logger, _proxy: ProxyImpl, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: any): Promise<unknown>;
	    /**
	     * @private
	     * @name signin
	     * @param account
	     * @param headers
	     */
	    signin(account: any, headers: any): Promise<unknown>;
	    /**
	     * @private
	     * @param forceStop
	     */
	    stop(forceStop?: boolean): Promise<unknown>;
	    init(): Promise<void>;
	    /**
	     * @public
	     * @method listConnectionsS2S
	     * @instance
	     * @description
	     *      List all the connected user's connexions. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    listConnectionsS2S(): Promise<any>;
	    /**
	     * @public
	     * @method checkS2Sconnection
	     * @instance
	     * @description
	     *      check the S2S connection with a head request. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    checkS2Sconnection(): Promise<any>;
	    /**
	     * @private
	     * @method sendS2SPresence
	     * @instance
	     * @param {Object} obj Object {show, status} describing the presence : <br/>
	     *  To put presence to cases : <br/>
	     * "online":     {show = undefined, status = "mode=auto"} <br/>
	     * "away": {show = "xa", status = "away"} <br/>
	     * "dnd": {show = "dnd", status = ""} <br/>
	     * "invisible": {show = "xa", status = ""} <br/>
	     * @description
	     *      set the presence of the connected user with s2s api . <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    sendS2SPresence(obj: any): Promise<any>;
	    /**
	     * @private
	     * @method deleteConnectionsS2S
	     * @instance
	     * @param {Array} connexions a List of connections S2S to delete
	     * @description
	     *      Delete one by one a list of S2S connections of the connected user. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    deleteConnectionsS2S(connexions: any): Promise<any>;
	    /**
	     * @public
	     * @method deleteAllConnectionsS2S
	     * @instance
	     * @description
	     *      Delete all the connected user's S2S connexions. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    deleteAllConnectionsS2S(): Promise<any>;
	    /**
	     * @private
	     * @method loginS2S
	     * @instance
	     * @param {String} callback_url The web site which is the callback where the S2S events are sent by Rainbow server
	     * @description
	     *      Login to S2S event server the already connected user to REST API server. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    loginS2S(callback_url: any): Promise<any>;
	    /**
	     * @public
	     * @method infoS2S
	     * @instance
	     * @param {String} s2sConnectionId The id of the S2S conneexion to retrieve informations about.
	     * @description
	     *      Get informations about a S2S connexions. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    infoS2S(s2sConnectionId: any): Promise<any>;
	    /** S2S EVENTS */
	    onS2SReady(event: any): Promise<void>;
	    /** S2S methods */
	    /**
	     * @private
	     * @method sendMessageInConversation
	     * @instance
	     * @param {String} conversationId
	     * @param {String} msg The message object to send. <br/>
	     * { <br/>
	     *   "message": { <br/>
	     *   "subject": "Greeting", <br/>
	     *   "lang": "en", <br/>
	     *   "contents": [ <br/>
	     *     { <br/>
	     *       "type": "text/markdown", <br/>
	     *       "data": "## Hello Bob" <br/>
	     *     } <br/>
	     *   ], <br/>
	     *   "body": "Hello world" <br/>
	     *   } <br/>
	     * } <br/>
	     * @description
	     *      Send a message in a conversation. Note, corrected message is not yet supported. <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    sendMessageInConversation(conversationId: any, msg: any): Promise<any>;
	    /**
	     * @private
	     * @method joinRoom
	     * @param {String} bubbleId The id of the bubble to open the conversation.
	     * @param {string} role Enum: "member" "moderator" of your role in this room
	     * @instance
	     * @description
	     *      send presence in S2S to join a bubble conversation <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     * @category async
	     */
	    joinRoom(bubbleId: any, role: ROOMROLE): Promise<any>;
	} enum ROOMROLE {
	    MODERATOR = "moderator",
	    MEMBER = "member"
	}
	export { S2SService, ROOMROLE };

}
declare module 'lib/services/GenericService' {
	/// <reference types="node" />
	import { XMPPService } from 'lib/connection/XMPPService';
	export {};
	import { Logger } from 'lib/common/Logger';
	import { S2SService } from 'lib/services/S2SService';
	import { EventEmitter } from 'events';
	import { RESTService } from 'lib/connection/RESTService'; class GenericService {
	    protected _logger: Logger;
	    protected _logId: string;
	    protected _xmpp: XMPPService;
	    protected _options: any;
	    protected _s2s: S2SService;
	    protected _useXMPP: boolean;
	    protected _useS2S: boolean;
	    protected _eventEmitter: EventEmitter;
	    protected _rest: RESTService;
	    protected _started: boolean;
	    protected _initialized: boolean;
	    protected _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    };
	    get startConfig(): {
	        start_up: boolean;
	        optional: boolean;
	    };
	    protected ready: boolean;
	    protected startingInfos: {
	        constructorDate: Date;
	        startedDate: Date;
	        initilizedDate: Date;
	        readyDate: Date;
	    };
	    constructor(_logger: Logger, logId?: string);
	    cleanMemoryCache(): void;
	    get startedDuration(): number;
	    get initializedDuration(): number;
	    setConstructed(): void;
	    setStarted(): void;
	    setInitialized(): void;
	    setStopped(): void;
	}
	export { GenericService as GenericService };

}
declare module 'lib/connection/XMPPService' {
	import { XMPPUTils } from 'lib/common/XMPPUtils';
	import { XmppClient } from 'lib/common/XmppQueue/XmppClient';
	import { AlertMessage } from 'lib/common/models/AlertMessage';
	import { GenericService } from 'lib/services/GenericService'; const NameSpacesLabels: {
	    ChatstatesNS: string;
	    ReceiptNS: string;
	    CallLogNamespace: string;
	    CallLogAckNamespace: string;
	    CallLogNotificationsNamespace: string;
	    RsmNameSpace: string;
	    Carbon2NameSpace: string;
	    ApplicationNameSpace: string;
	    RosterNameSpace: string;
	    ClientNameSpace: string;
	    PingNameSpace: string;
	    DataNameSpace: string;
	    MucNameSpace: string;
	    ReceiptsNameSpace: string;
	    ChatestatesNameSpace: string;
	    ContentNameSpace: string;
	    MessageCorrectNameSpace: string;
	    HintsNameSpace: string;
	    OobNameSpace: string;
	    Monitoring1NameSpace: string;
	    CallService1NameSpace: string;
	    MamNameSpace: string;
	    MamNameSpaceTmp: string;
	    AttentionNS: string;
	    IncidentCap: string;
	}; class XMPPService extends GenericService {
	    serverURL: any;
	    host: any;
	    eventEmitter: any;
	    version: any;
	    jid_im: any;
	    jid_tel: any;
	    jid_password: any;
	    fullJid: any;
	    jid: any;
	    userId: any;
	    resourceId: any;
	    initialPresence: any;
	    xmppClient: XmppClient;
	    logger: any;
	    proxy: any;
	    shouldSendReadReceipt: any;
	    useXMPP: any;
	    timeBetweenXmppRequests: any;
	    isReconnecting: any;
	    maxAttempts: any;
	    idleTimer: any;
	    pingTimer: any;
	    forceClose: any;
	    applicationId: any;
	    generatedRandomId: any;
	    hash: any;
	    reconnect: any;
	    fibonacciStrategy: any;
	    IQEventHandlerToken: any;
	    IQEventHandler: any;
	    xmppUtils: XMPPUTils;
	    private shouldSendMessageToConnectedUser;
	    private storeMessages;
	    private copyMessage;
	    private rateLimitPerHour;
	    private messagesDataStore;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_xmpp: any, _im: any, _application: any, _eventEmitter: any, _logger: any, _proxy: any);
	    start(withXMPP: any): Promise<unknown>;
	    signin(account: any, headers: any): Promise<unknown>;
	    stop(forceStop: any): Promise<unknown>;
	    startOrResetIdleTimer(incomingStanza?: boolean): void;
	    stopIdleTimer(): void;
	    handleXMPPConnection(headers: any): void;
	    setPresence(show: any, status: any): Promise<unknown>;
	    enableCarbon(): Promise<unknown>;
	    sendChatMessage(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, urgency?: string): Promise<unknown>;
	    sendChatMessageToBubble(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, attention: any, urgency?: string): Promise<unknown>;
	    sendCorrectedChatMessage(conversation: any, originalMessage: any, data: any, origMsgId: any, lang: any, urgency?: string): Promise<string>;
	    markMessageAsRead(message: any, conversationType?: string, span?: number): Promise<unknown>;
	    markMessageAsReceived(message: any, conversationType: string, span?: number): Promise<unknown>;
	    sendChatExistingFSMessage(message: any, jid: any, lang: any, fileDescriptor: any): Promise<unknown>;
	    sendChatExistingFSMessageToBubble(message: any, jid: any, lang: any, fileDescriptor: any): Promise<unknown>;
	    sendIsTypingState(conversation: any, isTypingState: any): Promise<unknown>;
	    getRosters(): void;
	    /****************************************************/
	    /**            XMPP ROSTER MANAGEMENT              **/
	    /****************************************************/
	    sendSubscription(contact: any): Promise<void>;
	    sendSubscribeInvitation(jid: any): Promise<unknown>;
	    sendInitialBubblePresence(jid: any): Promise<unknown>;
	    sendUnavailableBubblePresence(jid: any): void;
	    getAgentStatus(): Promise<unknown>;
	    /**
	     *
	      * @param useAfter
	     * @returns {Promise<void>}
	     */
	    sendGetCallLogHistoryPage(useAfter: any): Promise<unknown>;
	    deleteOneCallLog(id: any): Promise<unknown>;
	    deleteCallLogsForContact(jid: any): Promise<unknown>;
	    deleteAllCallLogs(): Promise<any>;
	    markCallLogAsRead(id: any): Promise<unknown>;
	    markAllCallsLogsAsRead(callLogs: any): Promise<any[]>;
	    deleteAllMessageInOneToOneConversation(conversationId: any): Promise<unknown>;
	    getErrorMessage(data: any, actionLabel: any): string;
	    getTelephonyState(secondary: any): Promise<unknown>;
	    sendPing(): Promise<any>;
	    SendAlertMessage(alertMessage: AlertMessage): Promise<unknown>;
	    mamQuery(jid: any, options: any): void;
	    mamQueryMuc(jid: any, to: any, options: any): void;
	    mamDelete(options: any): void;
	    voiceMessageQuery(jid: any): Promise<unknown>;
	}
	export { XMPPService, NameSpacesLabels };

}
declare module 'lib/services/ImsService' {
	/// <reference types="node" />
	export {};
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService'; class IMService extends GenericService {
	    private _conversations;
	    private _pendingMessages;
	    private _bulles;
	    private _imOptions;
	    private _fileStorage;
	    private _presence;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _imOptions: any, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    /**
	     * @public
	     * @since 1.39
	     * @method getMessagesFromConversation
	     * @instance
	     * @description
	     *    <b>(beta)</b> Retrieve the list of messages from a conversation <br/>
	     *    Calling several times this method will load older message from the history (pagination) <br/>
	     * @param {Conversation} conversation The conversation
	     * @param {Number} intNbMessage The number of messages to retrieve. Optional. Default value is 30. Maximum value is 100
	     * @async
	     * @return {Promise<Conversation, ErrorManager>}
	     * @fulfil {Conversation, ErrorManager} Return the conversation updated with the list of messages requested or an error (reject) if there is no more messages to retrieve
	     * @category async
	     */
	    getMessagesFromConversation(conversation: any, intNbMessage: any): any;
	    /**
	     * @public
	     * @since 1.39
	     * @method getMessageFromConversationById
	     * @instance
	     * @description
	     *    <b>(beta)</b> Retrieve a specific message in a conversation using its id <br/>
	     * @param {Conversation} conversation The conversation where to search for the message
	     * @param {String} strMessageId The message id
	     * @return {Message} The message if found or null
	     */
	    getMessageFromConversationById(conversation: any, strMessageId: any): Promise<any>;
	    /**
	     * @public
	     * @since 1.39
	     * @method getMessageFromBubbleById
	     * @instance
	     * @description
	     *    Retrieve a specific message in a bubble using its id <br/>
	     * @param {Bubble} bubble The bubble where to search for the message
	     * @param {String} strMessageId The message id
	     * @return {Message} The message if found or null
	     */
	    getMessageFromBubbleById(bubble: any, strMessageId: any): Promise<any>;
	    /**
	     * @public
	     * @since 1.39
	     * @method sendMessageToConversation
	     * @instance
	     * @description
	     *    <b>(beta)</b> Send a instant message to a conversation<br>
	     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation <br/>
	     * @param {Conversation} conversation The conversation recipient
	     * @param {String} message The message to send
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToConversation(conversation: any, message: any, lang: any, content: any, subject: any, urgency?: string): Promise<any>;
	    /**
	     * @public
	     * @method sendMessageToContact
	     * @instance
	     * @description
	     *  Send a one-2-one message to a contact <br/>
	     * @param {String} message The message to send
	     * @param {Contact} contact The contact (should have at least a jid_im property)
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToContact(message: any, contact: any, lang: any, content: any, subject: any, urgency?: string): Promise<any>;
	    /**
	     * @private
	     * @description
	     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br/>
	     *      It allow to give back the status of the sending process. <br/>
	     * @param conversation
	     * @param message
	     */
	    /**
	     * @private
	     * @description
	     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br/>
	     *      It allow to give back the status of the sending process. <br/>
	     * @param message
	     */
	    _onmessageReceipt(receipt: any): void;
	    /**
	     * @public
	     * @method sendMessageToJid
	     * @instance
	     * @description
	     *  Send a one-2-one message to a contact identified by his Jid <br/>
	     * @param {String} message The message to send
	     * @param {String} jid The contact Jid
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToJid(message: any, jid: any, lang: any, content: any, subject: any, urgency?: string): Promise<any>;
	    /**
	     * @public
	     * @method sendMessageToJidAnswer
	     * @instance
	     * @description
	     *  Send a reply to a one-2-one message to a contact identified by his Jid <br/>
	     * @param {String} message The message to send
	     * @param {String} jid The contact Jid
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {String} [answeredMsg] The message answered
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToJidAnswer(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendMessageToBubble
	     * @instance
	     * @description
	     *  Send a message to a bubble <br/>
	     * @param {String} message The message to send
	     * @param {Bubble} bubble The bubble (should at least have a jid property)
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToBubble(message: any, bubble: any, lang: any, content: any, subject: any, mentions: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendMessageToBubbleJid
	     * @instance
	     * @description
	     *  Send a message to a bubble identified by its JID <br/>
	     * @param {String} message The message to send
	     * @param {String} jid The bubble JID
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToBubbleJid(message: any, jid: any, lang: any, content: any, subject: any, mentions: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendMessageToBubbleJidAnswer
	     * @instance
	     * @description
	     *  Send a message to a bubble identified by its JID <br/>
	     * @param {String} message The message to send
	     * @param {String} jid The bubble JID
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {String} [answeredMsg] The message answered
	     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @async
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
	     * @category async
	     */
	    sendMessageToBubbleJidAnswer(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, mentions: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendIsTypingStateInBubble
	     * @instance IMService
	     * @description
	     *    Switch the "is typing" state in a bubble/room<br> <br/>
	     * @param {Bubble} bubble The destination bubble
	     * @param {boolean} status The status, true for setting "is Typing", false to remove it
	     * @return {Object} Return a promise with no parameter when succeed.
	     */
	    sendIsTypingStateInBubble(bubble: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendIsTypingStateInConversation
	     * @instance IMService
	     * @description
	     *    Switch the "is typing" state in a conversation<br>
	     * @param {Conversation} conversation The conversation recipient
	     * @param {boolean} status The status, true for setting "is Typing", false to remove it
	     * @return Return a promise with no parameter when succeed
	     */
	    sendIsTypingStateInConversation(conversation: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method markMessageAsRead
	     * @instance
	     * @description
	     *  Send a 'read' receipt to the recipient <br/>
	     * @param {Message} messageReceived The message received to mark as read
	     * @async
	     * @return {Promise}
	     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
	     * @category async
	     */
	    markMessageAsRead(messageReceived: any): Promise<unknown> | {
	        code: number;
	        label: string;
	        msg: string;
	    };
	    /**
	     * @private
	     * @method enableCarbon
	     * @instance
	     * @description
	     *      Enable message carbon XEP-0280 <br/>
	     * @async
	     * @return {Promise}
	     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
	     * @category async
	     */
	    enableCarbon(): Promise<unknown>;
	}
	export { IMService };

}
declare module 'lib/connection/XMPPServiceHandler/channelEventHandler' {
	export {};
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class ChannelEventHandler extends GenericHandler {
	    MESSAGE_CHAT: any;
	    MESSAGE_GROUPCHAT: any;
	    MESSAGE_WEBRTC: any;
	    MESSAGE_MANAGEMENT: any;
	    MESSAGE_ERROR: any;
	    MESSAGE_HEADLINE: any;
	    MESSAGE_CLOSE: any;
	    channelsService: any;
	    findAttrs: any;
	    findChildren: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: any, channelsService: any);
	    onManagementMessageReceived(msg: any, stanza: any): void;
	    onHeadlineMessageReceived(msg: any, stanza: any): void;
	    onChannelManagementMessageReceived(stanza: any): boolean;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): void;
	}
	export { ChannelEventHandler };

}
declare module 'lib/services/ChannelsService' {
	/// <reference types="node" />
	import { Contact } from 'lib/common/models/Contact';
	import { Appreciation, Channel } from 'lib/common/models/Channel';
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService';
	export {}; class ChannelsService extends GenericService {
	    private _channels;
	    private _channelsList;
	    MAX_ITEMS: any;
	    MAX_PAYLOAD_SIZE: any;
	    PUBLIC_VISIBILITY: any;
	    PRIVATE_VISIBILITY: any;
	    CLOSED_VISIBILITY: any;
	    private channelEventHandler;
	    private channelHandlerToken;
	    invitationCounter: number;
	    static getClassName(): string;
	    getClassName(): string;
	    LIST_EVENT_TYPE: {
	        ADD: {
	            code: number;
	            label: string;
	        };
	        UPDATE: {
	            code: number;
	            label: string;
	        };
	        REMOVE: {
	            code: number;
	            label: string;
	        };
	        DELETE: {
	            code: number;
	            label: string;
	        };
	        SUBSCRIBE: {
	            code: number;
	            label: string;
	        };
	        UNSUBSCRIBE: {
	            code: number;
	            label: string;
	        };
	        CREATE: {
	            code: number;
	            label: string;
	        };
	    };
	    USER_ROLE: {
	        NONE: string;
	        OWNER: string;
	        PUBLISHER: string;
	        MEMBER: string;
	    };
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    attachHandlers(): void;
	    /**
	     * @public
	     * @method createChannel
	     * @instance
	     * @async
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new public channel with a visibility limited to my company <br/>
	     */
	    createChannel(name: string, channelTopic: string): Promise<Channel>;
	    /**
	     * @public
	     * @method createPublicChannel
	     * @instance
	     * @async
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
	     * @param {string} [category=""] The category of the channel
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new public channel with a visibility limited to my company <br/>
	     */
	    createPublicChannel(name: string, channelTopic: string, category: string): Promise<Channel>;
	    /**
	     * @public
	     * @method createClosedChannel (ex: createPrivateChannel)
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the createClosedChannel method instead,
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [description]  The description of the channel to create (max-length=255)
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new private channel <br/>
	     */
	    createPrivateChannel(name: string, description: string): Promise<Channel>;
	    /**
	     * @public
	     * @method createClosedChannel (ex: createPrivateChannel)
	     * @instance
	     * @async
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [description]  The description of the channel to create (max-length=255)
	     * @param {string} [category=""] The category of the channel
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new closed channel <br/>
	     */
	    createClosedChannel(name: string, description: string, category: string): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteChannel
	     * @instance
	     * @async
	     * @param {Channel} channel  The channel to delete
	     * @return {Promise<Channel>} Promise object represents The channel deleted
	     * @description
	     *  Delete a owned channel <br/>
	     */
	    deleteChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method findChannelsByName
	     * @instance
	     * @async
	     * @param {string} name Search this provided substring in the channel name (case insensitive).
	     * @return {Promise<Array<Channel>>} ChannelsService found
	     * @description
	     *  Find channels by name. Only channels with visibility equals to 'company' can be found. First 100 results are returned. <br/>
	     */
	    findChannelsByName(name: string): Promise<[Channel]>;
	    /**
	     * @public
	     * @method findChannelsByTopic
	     * @instance
	     * @async
	     * @param {string} topic Search this provided substring in the channel topic (case insensitive).
	     * @return {Promise<Array<Channel>>} ChannelsService found
	     * @description
	     *  Find channels by topic. Only channels with visibility equals to 'company' can be found. First 100 results are returned. <br/>
	     */
	    findChannelsByTopic(topic: string): Promise<[Channel]>;
	    /**
	     * @private
	     * @method findChannels
	     */
	    private _findChannels;
	    /**
	     * @public
	     * @method getChannelById
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the fetchChannel method instead,
	     * @param {string} id The id of the channel)
	     * @param {boolean} [force=false] True to force a request to the server
	     * @return {Promise<Channel>} The channel found
	     * @description
	     * Find a channel by its id (locally if exists or by sending a request to Rainbow) <br/>
	     */
	    getChannelById(id: string, force?: boolean): Promise<Channel>;
	    /**
	     * @public
	     * @method fetchChannel
	     * @instance
	     * @async
	     * @param {string} id The id of the channel)
	     * @param {boolean} [force=false] True to force a request to the server
	     * @return {Promise<Channel>} The channel found
	     * @description
	     * Find a channel by its id (locally if exists or by sending a request to Rainbow) <br/>
	     */
	    fetchChannel(id: string, force?: boolean): Promise<Channel>;
	    /**
	     * @public
	     * @method fetchChannelsByFilter
	     * @since 1.55
	     * @instance
	     * @description
	     *    Find channels using a filter (on name, topic)<br/>
	     *    Result may be filtered with result limit, offet and sortField or SortOrder <br/>
	     *    Return a promise. <br/>
	     * @param {Object} filter The filter with at least [filter.name] or [filter.topic] defined <br/>
	     *      {string} [filter.name] search by channel names (case insensitive substring). <br/>
	     *      {string} [filter.topic] search by channel topics (case insensitive substring). <br/>
	     *      {Number} [filter.limit=100] allow to specify the number of channels to retrieve. <br/>
	     *      {Number} [filter.offset] allow to specify the position of first channel to retrieve (first channel if not specified). Warning: if offset > total, no results are returned. <br/>
	     *      {string} [filter.sortField="name"] sort channel list based on the given field. <br/>
	     *      {Number} [filter.sortOrder="1"] specify order ascending/descending. 1 for ascending, -1 for descending. <br/>
	     * @return {Promise<Channel[]>} Result of the find with <br/>
	     *      {Array}   found channels informations with an array of { id, name, topic, creatorId, visibility, users_count } <br/>
	     */
	    fetchChannelsByFilter(filter: any): Promise<[Channel]>;
	    /**
	     * @public
	     * @method getChannels
	     * @since 1.38
	     * @instance
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the fetchMyChannels method instead,
	     * @description
	     *    Get the channels you own, are subscribed to, are publisher<br/>
	     *    Return a promise. <br/>
	     * @return {{Promise<Channel[]>} } Return Promise with a list of channels or an empty array if no channel has been found
	     */
	    getChannels(): Promise<[Channel]>;
	    /**
	     * @public
	     * @method fetchMyChannels
	     * @since 1.38
	     * @instance
	     * @param {boolean} force Boolean to force the get of channels's informations from server.
	     * @description
	     *    Get the channels you own, are subscribed to, are publisher<br/>
	     *    Return a promise. <br/>
	     * @return {Promise<Channel[]>} Return Promise with a list of channels or an empty array if no channel has been found
	     */
	    fetchMyChannels(force?: boolean): Promise<[Channel]>;
	    /**
	     * @public
	     * @method getAllChannels
	     * @instance
	     * @return {Channel[]} An array of channels (owned, invited, subscribed)
	     * @description
	     *  Return the list of channels (owned, invited, subscribed) <br/>
	     */
	    getAllChannels(): [Channel];
	    /**
	     * @public
	     * @method getAllOwnedChannel
	     * @instance
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the getAllOwnedChannels method instead,
	     * @return {Channel[]} An array of channels (owned only)
	     * @description
	     *  Return the list of owned channels only <br/>
	     */
	    getAllOwnedChannel(): [Channel];
	    /**
	     * @public
	     * @method getAllOwnedChannels
	     * @instance
	     * @return {Channel[]} An array of channels (owned only)
	     * @description
	     *  Return the list of owned channels only <br/>
	     */
	    getAllOwnedChannels(): [Channel];
	    /**
	     * @public
	     * @method getAllSubscribedChannel
	     * @instance
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the getAllSubscribedChannels method instead,
	     * @return {Channel[]} An array of channels (subscribed only)
	     * @description
	     *  Return the list of subscribed channels only <br/>
	     */
	    getAllSubscribedChannel(): [Channel];
	    /**
	     * @public
	     * @method getAllSubscribedChannels
	     * @instance
	     * @return {Channel[]} An array of channels (subscribed only)
	     * @description
	     *  Return the list of subscribed channels only <br/>
	     */
	    getAllSubscribedChannels(): [Channel];
	    /**
	     * @public
	     * @method getAllPendingChannels
	     * @instance
	     * @return {Channel[]} An array of channels (invited only)
	     * @description
	     *  Return the list of invited channels only <br/>
	     */
	    getAllPendingChannels(): [Channel];
	    /**
	     * @public
	     * @method publishMessageToChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel where to publish the message
	     * @param {string} message Message content
	     * @param {string} [title = "", limit=256] Message title
	     * @param {string} [url = ""] An URL
	     * @param {any} [imagesIds = null] An Array of ids of the files stored in Rainbow
	     * @param {string} [type="basic"] An optional message content type (could be basic, markdown, html or data)
	     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
	     * @description
	     *  Publish to a channel <br/>
	     */
	    publishMessageToChannel(channel: Channel, message: string, title: string, url: string, imagesIds: any, type: string): Promise<{}>;
	    /**
	     * @public
	     * @method createItem
	     * @instance
	     * @async
	     * @param {Channel} channel The channel where to publish the message
	     * @param {string} message Message content
	     * @param {string} [title = "", limit=256] Message title
	     * @param {string} [url = ""] An URL
	     * @param {any} imagesIds An Array of ids of the files stored in Rainbow
	     * @param {string} [type="basic"] An optional message content type (could be basic, markdown, html or data)
	     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
	     * @description
	     *  Publish to a channel <br/>
	     */
	    createItem(channel: Channel, message: string, title: string, url: string, imagesIds: any, type: string): Promise<{}>;
	    /**
	     * @public
	     * @method subscribeToChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel to subscribe
	     * @return {Promise<Channel>} The channel updated with the new subscription
	     * @description
	     *  Subscribe to a public channel <br/>
	     */
	    subscribeToChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method
	     * @since 1.47
	     * @instance
	     * @description
	     *    Subscribe to a channel using its id<br/>
	     *    Return a promise. <br/>
	     * @param {string} id The id of the channel
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    subscribeToChannelById(id: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unsubscribeFromChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel to unsubscribe
	     * @return {Promise<string>} The status of the unsubscribe.
	     * @description
	     *  Unsubscribe from a public channel <br/>
	     */
	    unsubscribeFromChannel(channel: Channel): Promise<string>;
	    /**
	     * @public
	     * @method updateChannelTopic
	     * @instance
	     * @async
	     * @param {Channel} channel The channel to update
	     * @param {string} description  The description of the channel to update (max-length=255)
	     * @return {Promise<Channel>} Updated channel
	     * @description
	     *  TODO
	     */
	    updateChannelTopic(channel: Channel, description: string): Promise<Channel>;
	    /**
	     * @public
	     * @method updateChannelDescription
	     * @instance
	     * @async
	     * @param {Channel} channel The channel to update
	     * @param {string} description  The description of the channel to update (max-length=255)
	     * @return {Promise<Channel>} Updated channel
	     * @description
	     *  TODO
	     */
	    updateChannelDescription(channel: Channel, description: string): Promise<Channel>;
	    /**
	     * @public
	     * @method
	     * @since 1.46
	     * @instance
	     * @description
	     *    Update a channel name<br/>
	     *    Return a promise. <br/>
	     * @param {Channel} channel The channel to update
	     * @param {string} channelName The name of the channel
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelName(channel: Channel, channelName: string): Promise<unknown>;
	    /**
	     * @public
	     * @method
	     * @since 1.38
	     * @instance
	     * @description
	     *    Update a channel<br/>
	     *      May be updated: name, topic, visibility, max_items and max_payload<br/>
	     *      Please put null to not update a property.<br/>
	     *    Return a promise. <br/>
	     * @param {string} id The id of the channel
	     * @param {string} [channelTopic=""] The topic of the channel
	     * @param {string} [visibility=public] public/company/closed group visibility for search
	     * @param {Number} [max_items=30] max # of items to persist in the channel
	     * @param {Number} [max_payload_size=60000] max # of items to persist in the channel
	     * @param {string} [channelName=""] The name of the channel
	     * @param {string} [category=""] The category of the channel
	     * @return {Promise<Channel>} Return the channel created or an error
	     */
	    updateChannel(id: string, channelTopic: string, visibility: string, max_items: Number, max_payload_size: Number, channelName: string, category: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateChannelVisibility
	     * @since 1.55
	     * @instance
	     * @description
	     *    Update a channel visibility<br/>
	     *    Return a promise. <br/>
	     * @param {Channel} channel The channel to update
	     * @param {string} visibility  The new channel visibility (closed or company)
	     * @return {Promise<Channel>} Return the channel updated or an error
	     */
	    updateChannelVisibility(channel: Channel, visibility: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateChannelVisibilityToPublic
	     * @since 1.55
	     * @instance
	     * @description
	     *    Set the channel visibility to company (visible for users in that company)<br/>
	     *    Return a promise. <br/>
	     * @param {Channel} channel The channel to update
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelVisibilityToPublic(channel: Channel): Promise<unknown>;
	    /**
	     * @public
	     * @method updateChannelVisibilityToClosed
	     * @since 1.55
	     * @instance
	     * @description
	     *    Set the channel visibility to closed (not visible by users)<br/>
	     *    Return a promise. <br/>
	     * @param {Channel} channel The channel to update
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelVisibilityToClosed(channel: Channel): Promise<unknown>;
	    /**
	     * @public
	     * @method
	     * @since 1.43
	     * @instance
	     * @description
	     *    Update a channel avatar<br/>
	     *    Return a promise. <br/>
	     * @param {Channel} channel The Channel to update
	     * @param {string} urlAvatar  The avatar Url.  It must be resized to 512 pixels before calling this API.
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelAvatar(channel: Channel, urlAvatar: string): Promise<unknown>;
	    /**
	     * @public
	     * @method
	     * @since 1.43
	     * @instance
	     * @description
	     *    Delete a channel avatar<br/>
	     *    Return a promise. <br/>
	     * @param {Channel} channel The channel to update
	     * @return {Channel} Return the channel updated or an error
	     */
	    deleteChannelAvatar(channel: Channel): Promise<unknown>;
	    /**
	     * @public
	     * @method fetchChannelUsers
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2]. <br/>
	     * [#3] Will be deleted in future version <br/>
	     * [#4] In case you need similar behavior use the fetchChannelUsers method instead, <br/>
	     * @param {Channel} channel The channel
	     * @param {Object} [options] A filter parameter
	     * @param {Number} [options.page = 0] Display a specific page of results
	     * @param {Number} [options.limit=100] Number of results per page (max 1000)
	     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
	     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
	     * @return {Promise<Array<any>>} An array of users who belong to this channel
	     * @description
	     *  Get a pagined list of users who belongs to a channel <br/>
	     */
	    getUsersFromChannel(channel: Channel, options: any): Promise<{}[]>;
	    /**
	     * @public
	     * @method fetchChannelUsers
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {Object} [options] A filter parameter
	     * @param {Number} [options.page = 0] Display a specific page of results
	     * @param {Number} [options.limit=100] Number of results per page (max 1000)
	     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
	     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
	     * @return {Promise<Array<any>>} An array of users who belong to this channel
	     * @description
	     *  Get a pagined list of users who belongs to a channel <br/>
	     */
	    fetchChannelUsers(channel: Channel, options: any): Promise<Array<{}>>;
	    /**
	     * @public
	     * @method removeAllUsersFromChannel
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2]. <br/>
	     * [#3] Will be deleted in future version <br/>
	     * [#4] In case you need similar behavior use the deleteAllUsersFromChannel method instead, <br/>
	     * @param {Channel} channel The channel
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Remove all users from a channel <br/>
	     */
	    removeAllUsersFromChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteAllUsersFromChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Remove all users from a channel <br/>
	     */
	    deleteAllUsersFromChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method updateChannelUsers
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {Array<any>} users The users of the channel
	     * @return {Promise<Channel>} Update Channel Users status
	     * @description
	     *  Update a collection of channel users
	     */
	    updateChannelUsers(channel: Channel, users: Array<any>): Promise<Channel>;
	    /**
	     * @public
	     * @method addOwnersToChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {Array<any>}owners
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Add a list of owners to the channel <br/>
	     */
	    addOwnersToChannel(channel: Channel, owners: any[]): Promise<Channel>;
	    /**
	     * @public
	     * @method addPublishersToChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} publishers The list of Contacts to add as publisher to channel.
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Add a list of publishers to the channel <br/>
	     */
	    addPublishersToChannel(channel: Channel, publishers: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method addMembersToChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} members array of users to add
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Add a list of members to the channel <br/>
	     */
	    addMembersToChannel(channel: Channel, members: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method removeUsersFromChannel1
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2]. <br/>
	     * [#3] Will be deleted in future version <br/>
	     * [#4] In case you need similar behavior use the deleteUsersFromChannel method instead, <br/>
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} users An array of users to remove
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Remove a list of users from a channel <br/>
	     */
	    removeUsersFromChannel1(channel: Channel, users: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteUsersFromChannel
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} users An array of users to remove
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Remove a list of users from a channel <br/>
	     */
	    deleteUsersFromChannel(channel: Channel, users: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method getMessagesFromChannel
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the fetchChannelItems method instead,
	     * @param {Channel} channel The channel
	     * @return {Promise<Object[]>} The list of messages received
	     * @description
	     *  Retrieve the last messages from a channel <br/>
	     */
	    getMessagesFromChannel(channel: Channel): Promise<any[]>;
	    /**
	     * @public
	     * @method fetchChannelItems
	     * @instance
	     * @async
	     * @param {Channel} channel The channel
	     * @param {number} maxMessages=100 [optional] number of messages to get, 100 by default
	     * @param {Date} beforeDate [optional] - show items before a specific timestamp (ISO 8601 format)
	     * @param {Date} afterDate [optional] - show items after a specific timestamp (ISO 8601 format)
	     * @return {Promise<Object[]>} The list of messages received
	     * @description
	     *  Retrieve the last maxMessages messages from a channel <br/>
	     */
	    fetchChannelItems(channel: Channel, maxMessages?: number, beforeDate?: Date, afterDate?: Date): Promise<Array<any>>;
	    /**
	     * @public
	     * @method deleteMessageFromChannel
	     * @instance
	     * @async
	     * @deprecated [#1] since version 1.55 [#2]. <br/>
	     * [#3] Will be deleted in future version <br/>
	     * [#4] In case you need similar behavior use the deleteItemFromChannel method instead, <br/>
	     * @param  {string} channelId The Id of the channel
	     * @param  {string} messageId The Id of the message
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Delete a message from a channel <br/>
	     */
	    deleteMessageFromChannel(channelId: string, messageId: string): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteItemFromChannel
	     * @instance
	     * @async
	     * @param  {string} channelId The Id of the channel
	     * @param  {string} itemId The Id of the item
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Delete a message from a channel <br/>
	     */
	    deleteItemFromChannel(channelId: string, itemId: string): Promise<Channel>;
	    _onChannelMessageReceived(message: any): void;
	    _onChannelMyAppreciationReceived(my_appreciation: any): void;
	    /**
	     * @private
	     * @param channelId
	     * @description
	     *      GET A CHANNEL <br/>
	     */
	    getChannel(channelId: string): Promise<Channel>;
	    /**
	     * @public
	     * @method likeItem
	     * @instance
	     * @async
	     * @param  {Channel} channel The channel where the item must be liked.
	     * @param  {string} itemId The Id of the item
	     * @param {Appreciation} appreciation Appreciation value - must be one of the value specified in Appreciation object.
	     * @return {Promise<any>}
	     * @description
	     *  To like an Channel Item with the specified appreciation <br/>
	     */
	    likeItem(channel: Channel, itemId: string, appreciation: Appreciation): Promise<any>;
	    /**
	     * @public
	     * @method getDetailedAppreciations
	     * @instance
	     * @async
	     * @param  {Channel} channel The channel where the item appreciations must be retrieved.
	     * @param  {string} itemId The Id of the item
	     * @return {Promise<any>}
	     * @description
	     *  To know in details apprecations given on a channel item (by userId the apprecation given) <br/>
	     */
	    getDetailedAppreciations(channel: Channel, itemId: string): Promise<any>;
	    /**
	     * @private
	     * @param channelId
	     * @description
	     *      GET A CHANNEL FROM CACHE <br/>
	     */
	    private getChannelFromCache;
	    private updateChannelsList;
	    private addOrUpdateChannelToCache;
	    private removeChannelFromCache;
	    retrieveLatests(beforeDate?: Date): Promise<any>;
	    incrementInvitationCounter(): void;
	    decrementInvitationCounter(): void;
	    /****************************************************************/
	    /*** MANAGEMENT EVENT HANDLER                                 ***/
	    /****************************************************************/
	    private onAvatarChange;
	    private onUpdateToChannel;
	    onAddToChannel(channelInfo: {
	        id: string;
	    }): void;
	    private onRemovedFromChannel;
	    private onSubscribeToChannel;
	    private onUnsubscribeToChannel;
	    private onDeleteChannel;
	    private onUserSubscribeEvent;
	    private onUserUnsubscribeEvent;
	}
	export { ChannelsService as ChannelsService };

}
declare module 'lib/common/models/VoiceMail' {
	export {}; const createVoiceMail: (profilesService: any) => VoiceMail; class VoiceMail {
	    VMFlag: any;
	    VMCounter: any;
	    infoMsg: any;
	    voiceMailFeatureEnabled: any;
	    /*************************************************************/
	    /*************************************************************/
	    constructor(profileService: any);
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    setVMFlag(flag: any): void;
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    getVMFlag(): any;
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    setVMCounter(ct: any): void;
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    getVMCounter(): any;
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    setInfoMsg(msg: any): void;
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    getInfoMsg(): any;
	    /**
	     * @public
	     * @method
	     * @instance
	     */
	    getDisplayState(): any;
	}
	export { createVoiceMail as createVoiceMail, VoiceMail as VoiceMail };

}
declare module 'lib/connection/XMPPServiceHandler/telephonyEventHandler' {
	import { XMPPService } from 'lib/connection/XMPPService';
	export {};
	import { Call } from 'lib/common/models/Call';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class TelephonyEventHandler extends GenericHandler {
	    MESSAGE: any;
	    IQ_RESULT: any;
	    IQ_ERROR: any;
	    telephonyService: any;
	    contactService: any;
	    promiseQueue: any;
	    _profiles: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, telephonyService: any, contactService: any, profileService: any);
	    onIqResultReceived(msg: any, stanza: any): void;
	    onIqGetPbxAgentStatusReceived(stanza: any, node: any): void;
	    onMessageReceived(msg: any, stanza: any): boolean;
	    onProposeMessageReceived(node: any, from: any): Promise<void>;
	    /*********************************************************************/
	    /** INITIATED CALL STUFF                                           **/
	    /*********************************************************************/
	    onInitiatedEvent(initiatedElem: any): Promise<any>;
	    /*********************************************************************/
	    /** ORIGINATED CALL STUFF                                           **/
	    /*********************************************************************/
	    onOriginatedEvent(originatedElem: any): Promise<any>;
	    /*********************************************************************/
	    /** DELIVERED STUFF                                                 **/
	    /*********************************************************************/
	    onDeliveredEvent(deliveredElem: any): Promise<any>;
	    /*********************************************************************/
	    /** ESTABLISHED STUFF                                               **/
	    /*********************************************************************/
	    onEstablishedEvent(establishedElem: any): Promise<any>;
	    /*********************************************************************/
	    /** RETRIEVE CALL STUFF                                             **/
	    /*********************************************************************/
	    onRetrieveCallEvent(retrieveElem: any): Promise<void>;
	    /*********************************************************************/
	    /** CLEAR CALL STUFF                                                **/
	    /*********************************************************************/
	    onClearCallEvent(clearElem: any): Promise<void>;
	    /*********************************************************************/
	    /** HOLD CALL STUFF                                                 **/
	    /*********************************************************************/
	    onHeldEvent(heldElem: any): Promise<any>;
	    /*********************************************************************/
	    /** QUEUED STUFF                                                    **/
	    /*********************************************************************/
	    onQueuedEvent(queuedElem: any): Promise<any>;
	    /*********************************************************************/
	    /** DIVERTED STUFF                                                  **/
	    /*********************************************************************/
	    onDivertedEvent(divertedElem: any): Promise<any>;
	    /*********************************************************************/
	    /** TRANSFER STUFF                                                  **/
	    /*********************************************************************/
	    onTransferEvent(transferElem: any): Promise<any>;
	    /*********************************************************************/
	    /** CONFERENCE STUFF                                                **/
	    /*********************************************************************/
	    onConferenceEvent(conferencedElem: any): Promise<void>;
	    /*********************************************************************/
	    /** VOICE MESSAGE STUFF                                            **/
	    /*********************************************************************/
	    onVoiceMessageEvent(messagingElem: any): any;
	    /*********************************************************************/
	    /** UPDATECALL STUFF                                                **/
	    /*********************************************************************/
	    onUpDateCallEvent(updatecallElem: any): Promise<any>;
	    /*********************************************************************/
	    /** FAILURE STUFF                                                   **/
	    /*********************************************************************/
	    onFailCallEvent(failedElem: any): Promise<void>;
	    /*********************************************************************/
	    /** FORWARD CALL STUFF                                              **/
	    /*********************************************************************/
	    onCallForwardedEvent(forwardElem: any): Promise<any>;
	    /*********************************************************************/
	    /** NOMADIC STATUS STUFF                                              **/
	    /*********************************************************************/
	    onNomadicStatusEvent(eventElem: any): Promise<any>;
	    /*********************************************************************/
	    /** PRIVATE UTILITY METHODS                                         **/
	    /*********************************************************************/
	    getCall(elem: any): Promise<Call>;
	    getOrCreateCall(connectionId: any, jid: any, deviceType: any, phoneNumber: any): Promise<Call>;
	    createConferenceCall(connectionId: any, participants: any): Promise<Call>;
	    /*********************************************************************/
	    /** CALL UPDATE STUFF                                               **/
	    /*********************************************************************/
	    /**
	     * Method analyzeContactChange
	     * Analyse if a setContact has to be done following situation
	     * @public
	     * @param jid [required] jid from PCG
	     * @param phoneNumber [required] phone number from PCG
	     * @param call [required] the call to update
	     * @returns object:{ updateContactToBeDone : boolean, searchOutlookToBeDone :boolean}
	     *  updateContactToBeDone true if the contact has to be updated in the call (by setContact)
	     *  searchOutlookToBeDone true if an outlook search has to be performed to resolve call identity
	     * @memberof TelephonyServiceEventHandler
	     */
	    analyzeContactChange(jid: any, phoneNumber: any, call: any): {
	        updateContactToBeDone: boolean;
	    };
	    /**
	     * Method updateCallContact
	     * @public
	     * @param jid [required] jid from PCG
	     * @param phoneNumber [required] phone number from PCG
	     * @param actionElemName [required] name of the action event
	     * @param call [required] the call to update
	     * @returns {ng.IPromise<{}>} status promise
	     * @memberof TelephonyServiceEventHandler
	     */
	    updateCallContact(jid: any, phoneNumber: any, actionElemName: any, call: any): any;
	    makeUpdateContact(call: any, contact: any, phoneNumber: any, actionElemName: any): void;
	}
	export { TelephonyEventHandler };

}
declare module 'lib/services/TelephonyService' {
	/// <reference types="node" />
	export {};
	import { Call } from 'lib/common/models/Call';
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService'; class Telephony extends GenericService {
	    private _contacts;
	    private _bubbles;
	    private _profiles;
	    private _calls;
	    private voiceMail;
	    private userJidTel;
	    private agentStatus;
	    private voicemailNumber;
	    private pbxId;
	    private forwardObject;
	    private nomadicObject;
	    private nomadicAnswerNotTakedIntoAccount;
	    private isBasicCallAllowed;
	    private isSecondCallAllowed;
	    private isTransferAllowed;
	    private isConferenceAllowed;
	    private isVMDeflectCallAllowed;
	    private voiceMailFeatureEnabled;
	    private isForwardEnabled;
	    private isNomadicEnabled;
	    private telephonyHandlerToken;
	    private telephonyHistoryHandlerToken;
	    private _telephonyEventHandler;
	    private makingCall;
	    private starting;
	    private stats;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    attachHandlers(): void;
	    init(): Promise<unknown>;
	    /**
	     * @private
	     * @method onTelPresenceChange
	     * @instance
	     * @description
	     *      Method called when receiving an update on user presence <br/>
	     */
	    onTelPresenceChange(__event: any, attr?: any): boolean;
	    /**
	     * @private
	     * @method onCallUpdated
	     * @instance
	     * @description
	     *      Method called when receiving an update on a call <br/>
	     */
	    onCallUpdated(callInfo: Call): void;
	    /**
	     * @public
	     * @method isTelephonyAvailable
	     * @instance
	     * @description
	     *    Check if the telephony service can be used or not (if the connected user has a phone monitored by a PBX) <br/>
	     * @return {boolean} Return true if the telephony service is configured
	     */
	    isTelephonyAvailable(): boolean;
	    /**
	     * @public
	     * @method getAgentVersion
	     * @instance
	     * @description
	     *    Get the associated PBX agent version <br/>
	     * @return {string} Return the version of the agent or "unknown"
	     */
	    getAgentVersion(): any;
	    /**
	     * @public
	     * @method getXMPPAgentStatus
	     * @instance
	     * @description
	     *    Get the status of the XMPP connection to the PBX Agent <br/>
	     * @return {string} Return the status of the connections to the agent or "unknown"
	     */
	    getXMPPAgentStatus(): any;
	    /**
	     * @public
	     * @method getPhoneAPIStatus
	     * @instance
	     * @description
	     *    Get the status of the Phone API status for the PBX Agent <br/>
	     * @return {string} Return the Phone API status for to this Agent or "unknown"
	     */
	    getPhoneAPIStatus(): any;
	    getAgentStatus(): Promise<unknown>;
	    /**
	     * @private
	     * @method getTelephonyState
	     * @param second
	     */
	    getTelephonyState(second: any): Promise<unknown>;
	    /**
	     *
	     /**
	     * @public
	     * @method getMediaPillarInfo
	     * @instance
	     * @description
	     *   This API allows user to retrieve the Jabber id of the Media Pillar linked to the system he belongs, or Media Pillar user to retrieve the Jabber id credentials and data of the Media Pillar he belongs. <br/>
	     * @async
	     * @return {Promise<any>}
	     * @category async
	     */
	    getMediaPillarInfo(): Promise<any>;
	    /**
	     * @private
	     * @param connectionElemObj
	     */
	    private createCallFromConnectionElem;
	    /**
	     * @private
	     * @method getParticipantsFromParticipantsElem
	     * @param participants
	     */
	    getParticipantsFromParticipantsElem(participants: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getVoiceMessageCounter
	     * @description
	     *      Get the number of voice message <br/>
	     * @return {Promise<integer>} Return resolved promise if succeed with the number of messages, and a rejected else.
	     */
	    getVoiceMessageCounter(): Promise<unknown>;
	    /*********************************************************/
	    /**                   CALL HANDLERS                     **/
	    /*********************************************************/
	    /**
	     * @public
	     * @method getCallToHangOut
	     * @description
	     *      Get the call which can be hang out <br/>
	     * @return {Call} The call with the ability to be hang out.
	     */
	    getCallToHangOut(): any;
	    /**
	     * @public
	     * @method getActiveCall
	     * @description
	     *      get the active call <br/>
	     * @return {Call} The active call
	     */
	    getActiveCall(): any;
	    /**
	     * @public
	     * @method getActiveCalls
	     * @description
	     *      get active calls <br/>
	     * @return {Call} The active call
	     */
	    getActiveCalls(): any[];
	    /**
	     * @public
	     * @method getCalls
	     * @description
	     *      get calls <br/>
	     * @return {Call} The calls
	     */
	    getCalls(): any[];
	    /**
	     * @public
	     * @method getCallsSize
	     * @description
	     *      get calls tab size. Warning do not use length on the getCalls method result because it is the last index id +1 <br/>
	     * @return {Call} The calls tab size
	     */
	    getCallsSize(): number;
	    /**
	     * @private
	     * @param {Array} tab The tab which need to be sized
	     */
	    getTabSize(tab: any): number;
	    /**
	     * @public
	     * @method getActiveCall
	     * @param {Contact} contact The contact with an active call with us.
	     * @description
	     *      get the active call for a contact <br/>
	     * @return {Call} The active call
	     */
	    getActiveCallsForContact(contact: any): any[];
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method makeCall
	     * @instance
	     * @description
	     *    Call a number <br/>
	     *    Contacts and numbers are allowed <br/>
	     *    Return a promise <br/>
	     * @param {Contact} contact - contact object that you want to call
	     * @param {String} phoneNumber The number to call
	     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     * @return {Promise<Call>} Return a promise with the call created
	     */
	    makeCall(contact: any, phoneNumber: any, correlatorData: any): Promise<unknown>;
	    /**
	     * @private
	     * @method makeSimpleCall
	     * @param contact
	     * @param phoneNumber
	     * @param correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     */
	    private makeSimpleCall;
	    /**
	     * @private
	     * @method makeConsultationCall
	     * @param contact
	     * @param phoneNumber
	     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     * @param callId
	     */
	    private makeConsultationCall;
	    /**
	     * @public
	     * @method makeCall
	     * @instance
	     * @description
	     *    Call a number <br/>
	     *    Return a promise <br/>
	     * @param {String} phoneNumber The number to call
	     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     * @return {Promise<Call>} Return a promise with the call created
	     */
	    makeCallByPhoneNumber(phoneNumber: any, correlatorData: any): Promise<unknown>;
	    /**
	     * @private
	     * @method getPhoneInfo
	     * @param contact
	     * @param phoneNumber
	     * @param correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     */
	    private getPhoneInfo;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method releaseCall
	     * @instance
	     * @description
	     *    Release a call <br/>
	     *    Return a promise <br/>
	     * @param {Call} call The call to release
	     * @return {Promise<Call>} Return a promise with the call released
	     */
	    releaseCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method answerCall
	     * @instance
	     * @description
	     *    Answer a call <br/>
	     *    Return a promise <br/>
	     * @param {Call} call The call to answer
	     * @return {Promise<Call>} Return a promise with the answered call.
	     */
	    answerCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method holdCall
	     * @instance
	     * @description
	     *    Hold a call <br/>
	     *    Return a promise <br/>
	     * @param {Call} call The call to hold
	     * @return {Call} Return a promise with the held call.
	     */
	    holdCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method retrieveCall
	     * @instance
	     * @description
	     *    Retrieve a call <br/>
	     *    Return a promise <br/>
	     * @param {Call} call The call to retrieve
	     * @return {Promise<Call>} Return a promise with the call retrieved
	     */
	    retrieveCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method deflectCallToVM
	     * @instance
	     * @description
	     *    Deflect a call to the voice mail <br/>
	     *    Return a promise <br/>
	     * @param {Call} call The call to deflect
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    deflectCallToVM(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method deflectCall
	     * @instance
	     * @description
	     *    Deflect a call to an other telephone number<br/>
	     *    Return a promise <br/>
	     * @param {Call} call The call to deflect
	     * @param {Object} callee The callee phone number informations where the call shopuld be deflecte'd.
	     * @param {string} callee.calleeExtNumber : The phone number where the call is deflected, the format could be anything the user can type, it will be transformed in E164 format.,
	     * @param {string} callee.calleeIntNumber : Internal number if available,
	     * @param {string} callee.calleePbxId : The pbx id if available,
	     * @param {string} [callee.calleeShortNumber] : Short number,
	     * @param {string} [callee.calleeDisplayName] : The displayed name,
	     * @param {string} [callee.calleeCountry] : The contry whe the call will be deflected.
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    deflectCall(call: any, callee: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method transfertCall
	     * @instance
	     * @description
	     *    Transfer a held call to the active call <br/>
	     *    User should have transfer rights <br/>
	     *    Return a promise <br/>
	     * @param {Call} activeCall The active call
	     * @param {Call} heldCall The held call to transfer to the activeCall
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    transfertCall(activeCall: any, heldCall: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method conferenceCall
	     * @instance
	     * @description
	     *    Create a conference with a held call and the active call <br/>
	     *    User should have conference rights <br/>
	     *    Return a promise <br/>
	     * @param {Call} activeCall The active call
	     * @param {Call} heldCall The held call to transfer to the activeCall
	     * @return {Promise} Return a resolved promise .
	     */
	    conferenceCall(activeCall: any, heldCall: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method forwardToDevice
	     * @instance
	     * @description
	     *    Activate the forward to a number <br/>
	     *    Return a promise <br/>
	     * @param {String} phoneNumber The number to call
	     * @return {Promise} Return a promise resolved.
	    */
	    forwardToDevice(phoneNumber: any): Promise<unknown>;
	    /**
	     * @public
	     * @method forwardToVoicemail
	     * @instance
	     * @description
	     *    Activate the forward to VM <br/>
	     *    Return a promise <br/>
	     * @return {Promise} Return a promise resolved.

	     */
	    forwardToVoicemail(): Promise<unknown>;
	    /**
	     * @public
	     * @method cancelForward
	     * @instance
	     * @description
	     *    Cancel the forward <br/>
	     *    Return a promise <br/>
	     * @return {Promise<Call>} Return a promise with the canceled forward call.
	     */
	    cancelForward(): Promise<unknown>;
	    getForwardStatus(): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    nomadicLogin(phoneNumber: any, NotTakeIntoAccount?: any): Promise<unknown>;
	    getNomadicStatus(): Promise<unknown>;
	    /**
	     * @private
	      * @param response
	     */
	    updateNomadicData(response: any): Promise<void>;
	    getNomadicObject(): any;
	    getNomadicDestination(): any;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method sendDtmf
	     * @description
	     *      send dtmf to the remote party <br/>
	     * @param {string} connectionId
	     * @param {string} dtmf
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    sendDtmf(connectionId: any, dtmf: any): Promise<unknown>;
	    /**
	     * @private
	     * @method clearCall
	     * @param Call call the call to reset.
	     * @return nothing.
	     */
	    private clearCall;
	    private startAsPhoneNumber;
	    /**
	     * @private
	     * @method getOrCreateCall
	     * @param status
	     * @param connectionId
	     * @param deviceType
	     * @param contact
	     */
	    getOrCreateCall(status: any, connectionId: any, deviceType: any, contact?: any): Call;
	    /**
	     * @private
	     * @param callId
	     * @description
	     *      GET A CALL FROM CACHE <br/>
	     */
	    private getCallFromCache;
	    addOrUpdateCallToCache(call: any): Call;
	    private removeCallFromCache;
	    /**
	     * @public
	     * @method logon
	     * @param {String} endpointTel The endpoint device phone number.
	     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
	     * @param {String} password optionnel Password or authorization code.
	     * @param {String} groupId optionnel CCD Agent's group number
	     * @description
	     *      This api allows an CCD Agent to logon into the CCD system. <br/>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    logon(endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method logoff
	     * @param {String} endpointTel The endpoint device phone number.
	     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
	     * @param {String} password optionnel Password or authorization code.
	     * @param {String} groupId optionnel CCD Agent's group number
	     * @description
	     *      This api allows an CCD Agent logoff logon from the CCD system. <br/>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    logoff(endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method withdrawal
	     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
	     * @param {String} groupId optionnel CCD Agent's group number
	     * @param {String} status optionnel Used to deactivate the withdrawal state. Values: 'on', 'off'; 'on' is optional.
	     * @description
	     *      This api allows an CCD Agent to change to the state 'Not Ready' on the CCD system. When the parameter 'status' is passed and has the value 'off', the state is changed to 'Ready' <br/>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    withdrawal(agentId: any, groupId: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method wrapup
	     * @param {String} agentId CCD Agent identifier (agent device number).
	     * @param {String} groupId CCD Agent's group number
	     * @param {String} password optionnel Password or authorization code.
	     * @param {String} status optionnel Used to deactivate the WrapUp state. Values: 'on', 'off'; 'on' is optional.
	     * @description
	     *      This api allows an CCD Agent to change to the state Working After Call in the CCD system. When the parameter 'status' is passed and has the value 'off', the state is changed to 'Ready'. <br/>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    wrapup(agentId: any, groupId: any, password: any, status: any): Promise<unknown>;
	}
	export { Telephony as TelephonyService };

}
declare module 'lib/services/AdminService' {
	/// <reference types="node" />
	export {};
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Contact } from 'lib/common/models/Contact';
	import { GenericService } from 'lib/services/GenericService'; enum OFFERTYPES {
	    /** freemium licence offer */
	    "FREEMIUM" = "freemium",
	    /** premium licence offer */
	    "PREMIUM" = "premium"
	} enum CLOUDPBXCLIOPTIONPOLICY {
	    /** installation_ddi_number */
	    "INSTALLATION_DDI_NUMBER" = "installation_ddi_number",
	    /** user_ddi_number */
	    "USER_DDI_NUMBER" = "user_ddi_number"
	} class Admin extends GenericService {
	    private _contacts;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: any): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(): Promise<void>;
	    /**
	     * @public
	     * @method createCompany
	     * @instance
	     * @description
	     *      Create a company <br/>
	     * @param {string} strName The name of the new company
	     * @param {string} country Company country (ISO 3166-1 alpha3 format, size 3 car)
	     * @param {string} state (optionnal if not USA)  define a state when country is 'USA' (["ALASKA", "....", "NEW_YORK", "....", "WYOMING"] ), else it is not managed by server. Default value on server side: ALABAMA
	     * @param {OFFERTYPES} offerType Company offer type. Companies with offerType=freemium are not able to subscribe to paid offers, they must be premium to do so. Companies created with privateDC="HDS" are automatically created with offerType=premium (as a paid subscription to HDS Company offer is automatically done during the company creation. Values can be : freemium, premium
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Created Company or an error object depending on the result
	     * @category async
	     */
	    createCompany(strName: string, country: string, state: string, offerType?: OFFERTYPES): Promise<any>;
	    /**
	     * Remove a user from a company
	     * @private
	     */
	    removeUserFromCompany(user: any): Promise<any>;
	    /**
	     * Set the visibility for a company
	     * @private
	     */
	    setVisibilityForCompany(company: any, visibleByCompany: any): Promise<any>;
	    /**
	     * @public
	     * @method createUserInCompany
	     * @instance
	     * @description
	     *      Create a new user in a given company <br/>
	     * @param {string} email The email of the user to create
	     * @param {string} password The associated password
	     * @param {string} firstname The user firstname
	     * @param {string} lastname  The user lastname
	     * @param {string} [companyId="user company"] The Id of the company where to create the user or the connected user company if null
	     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
	     * @param {boolean} [isCompanyAdmin=false] True to create the user with the right to manage the company (`companyAdmin`). False by default.
	     * @param {Array<string>} [roles] The roles the created user.
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Created contact in company or an error object depending on the result
	     * @category async
	     */
	    createUserInCompany(email: any, password: any, firstname: any, lastname: any, companyId: any, language: any, isCompanyAdmin: any, roles: any): Promise<Contact>;
	    /**
	     * @public
	     * @method createGuestUser
	     * @instance
	     * @description
	     *      Create a new guest user in the same company as the requester admin <br/>
	     * @param {string} firstname The user firstname
	     * @param {string} lastname  The user lastname
	     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
	     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Created guest user in company or an error object depending on the result
	     * @category async
	     */
	    createGuestUser(firstname: any, lastname: any, language: any, timeToLive: any): Promise<any>;
	    /**
	     * @public
	     * @method createAnonymousGuestUser
	     * @since 1.31
	     * @instance
	     * @description
	     *      Create a new anonymous guest user in the same company as the requester admin   <br/>
	     *      Anonymous guest user is user without name and firstname   <br/>
	     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Created anonymous guest user in company or an error object depending on the result
	     * @category async
	     */
	    createAnonymousGuestUser(timeToLive: any): Promise<unknown>;
	    /**
	     * @public
	     * @method inviteUserInCompany
	     * @instance
	     * @description
	     *      Invite a new user to join a company in Rainbow <br/>
	     * @param {string} email The email address of the contact to invite
	     * @param {string} companyId     The id of the company where the user will be invited in
	     * @param {string} [language="en-US"]  The language of the message to send. Default is `en-US`
	     * @param {string} [message=""] A custom message to send
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Created invitation or an error object depending on the result
	     * @category async
	     */
	    inviteUserInCompany(email: any, companyId: any, language: any, message: any): Promise<unknown>;
	    /**
	     * @public
	     * @method changePasswordForUser
	     * @instance
	     * @description
	     *      Change a password for a user <br/>
	     * @param {string} password The new password
	     * @param {string} userId The id of the user
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Updated user or an error object depending on the result
	     * @category async
	     */
	    changePasswordForUser(password: any, userId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateInformationForUser
	     * @instance
	     * @description
	     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` <br/>
	     * @param {Object} objData An object (key: value) containing the data to change with their new value
	     * @param {string} userId The id of the user
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Updated user or an error object depending on the result
	     * @category async
	     */
	    updateInformationForUser(objData: any, userId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteUser
	     * @instance
	     * @description
	     *      Delete an existing user <br/>
	     * @param {string} userId The id of the user
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Deleted user or an error object depending on the result
	     * @category async
	     */
	    deleteUser(userId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllCompanies
	     * @instance
	     * @description
	     *      Get all companies for a given admin <br/>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Json object containing with all companies (companyId and companyName) or an error object depending on the result
	     * @category async
	     */
	    getAllCompanies(): Promise<unknown>;
	    /**
	     * get a company
	     * @private
	     */
	    getCompanyById(companyId: any): Promise<unknown>;
	    /**
	     * Remove a company
	     * @private
	     */
	    removeCompany(company: any): Promise<unknown>;
	    /**
	     * @public
	     * @method askTokenOnBehalf
	     * @instance
	     * @description
	     *      Ask Rainbow for a token on behalf a user <br/>
	     *      This allow to not use the secret key on client side <br/>
	     * @param {string} loginEmail The user login email
	     * @param {string} password The user password
	     * @async
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the user data, application data and token
	     * @category async
	     */
	    askTokenOnBehalf(loginEmail: any, password: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllUsers
	     * @instance
	     * @description
	     *      Get all users for a given admin <br/>
	     * @async
	     * @param {string} format Allows to retrieve more or less user details in response.
	     *   small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
	     *   medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
	     *   full: all user fields
	     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
	     * @param {number} limit Allow to specify the number of users to retrieve (default=100).
	     * @param {string} sortField Sort user list based on the given field (default="loginEmail").
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Array} - Array of Json object containing users or an error object depending on the result
	     * @category async
	     */
	    getAllUsers(format?: string, offset?: number, limit?: number, sortField?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllUsersByCompanyId
	     * @instance
	     * @description
	     *      Get all users for a given admin in a company <br/>
	     * @async
	     * @param {string} format Allows to retrieve more or less user details in response.
	     *   small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
	     *   medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
	     *   full: all user fields
	     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
	     * @param {number} limit Allow to specify the number of users to retrieve (default=100).
	     * @param {string} sortField Sort user list based on the given field (default="loginEmail").
	     * @param {string} companyId the id company the users are in. If not provided, then the companyId of the connected user is used.
	     });
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Array} - Array of Json object containing users or an error object depending on the result
	     * @category async
	     */
	    getAllUsersByCompanyId(format: string, offset: number, limit: number, sortField: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllUsersBySearchEmailByCompanyId
	     * @instance
	     * @description
	     *      Get all users for a given admin in a company by a search of string in email<br/>
	     * @async
	     * @param {string} format Allows to retrieve more or less user details in response.
	     *   small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
	     *   medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
	     *   full: all user fields
	     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
	     * @param {number} limit Allow to specify the number of users to retrieve (default=100).
	     * @param {string} sortField Sort user list based on the given field (default="loginEmail").
	     * @param {string} companyId the id company the users are in.
	     * @param {string} searchEmail the string to to filter users list on the loginEmail field using the word provided in this option..
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Array} - Array of Json object containing users or an error object depending on the result
	     * @category async
	     */
	    getAllUsersBySearchEmailByCompanyId(format: string, offset: number, limit: number, sortField: string, companyId: string, searchEmail: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getContactInfos
	     * @instance
	     * @description
	     *      Get informations about a user <br/>
	     * @param {string} userId The id of the user
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Json object containing informations or an error object depending on the result
	     * @category async
	     */
	    getContactInfos(userId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateContactInfos
	     * @instance
	     * @description
	     *      Set informations about a user <br/>
	     * @param {string} userId The id of the user
	     * @param {Object} infos The infos of the user : <br/>
	     * {string{3..255}}  [infos.loginEmail]      User email address (used for login). <br/>
	     * <br/> Must be unique (409 error is returned if a user already exists with the same email address). <br/>
	     *  {string{8..64}}   [infos.password]        User password. <br/>
	     * <br/> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character. <br/>
	     * {string{1..255}}  [infos.firstName]     User first name <br/>
	     * {string{1..255}}  [infos.lastName]      User last name <br/>
	     * {string{1..255}}  [infos.nickName]      User nickName <br/>
	     * {string{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br/>
	     * {string{1..255}}  [infos.jobTitle]      User job title <br/>
	     * {string[]{1..64}} [infos.tags]          An Array of free tags associated to the user. <br/>
	     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br/>
	     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. <br/>
	     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with <br/>
	     * the search API to search the user based on his tags. <br/>
	     * {Object[]}           [infos.emails]        Array of user emails addresses objects <br/>
	     * {string{3..255}}          [infos.emails.email]    User email address <br/>
	     * {string=home,work,other}  [infos.emails.type]     User email type <br/>
	     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects <br/>
	     * <br/>
	     * <br/><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise. <br/>
	     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) <br/>
	     * {string{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user) <br/>
	     * {string{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field. <br/>
	     * <br/>
	     * <br/>If not provided, user country is used by default. <br/>
	     * {string=home,work,other}              phoneNumbers.type           Phone number type <br/>
	     * {string=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type <br/>
	     * {string{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format) <br/>
	     * {string=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed. <br/>
	     * <br/> USA states code list: <br/>
	     * <li> <code>AA</code>:"Armed Forces America", <br/>
	     * <li> <code>AE</code>:"Armed Forces", <br/>
	     * <li> <code>AP</code>:"Armed Forces Pacific", <br/>
	     * <li> <code>AK</code>:"Alaska", <br/>
	     * <li> <code>AL</code>:"Alabama", <br/>
	     * <li> <code>AR</code>:"Arkansas", <br/>
	     * <li> <code>AZ</code>:"Arizona", <br/>
	     * <li> <code>CA</code>:"California", <br/>
	     * <li> <code>CO</code>:"Colorado", <br/>
	     * <li> <code>CT</code>:"Connecticut", <br/>
	     * <li> <code>DC</code>:"Washington DC", <br/>
	     * <li> <code>DE</code>:"Delaware", <br/>
	     * <li> <code>FL</code>:"Florida", <br/>
	     * <li> <code>GA</code>:"Georgia", <br/>
	     * <li> <code>GU</code>:"Guam", <br/>
	     * <li> <code>HI</code>:"Hawaii", <br/>
	     * <li> <code>IA</code>:"Iowa", <br/>
	     * <li> <code>ID</code>:"Idaho", <br/>
	     * <li> <code>IL</code>:"Illinois", <br/>
	     * <li> <code>IN</code>:"Indiana", <br/>
	     * <li> <code>KS</code>:"Kansas", <br/>
	     * <li> <code>KY</code>:"Kentucky", <br/>
	     * <li> <code>LA</code>:"Louisiana", <br/>
	     * <li> <code>MA</code>:"Massachusetts", <br/>
	     * <li> <code>MD</code>:"Maryland", <br/>
	     * <li> <code>ME</code>:"Maine", <br/>
	     * <li> <code>MI</code>:"Michigan", <br/>
	     * <li> <code>MN</code>:"Minnesota", <br/>
	     * <li> <code>MO</code>:"Missouri", <br/>
	     * <li> <code>MS</code>:"Mississippi", <br/>
	     * <li> <code>MT</code>:"Montana", <br/>
	     * <li> <code>NC</code>:"North Carolina", <br/>
	     * <li> <code>ND</code>:"Northmo Dakota", <br/>
	     * <li> <code>NE</code>:"Nebraska", <br/>
	     * <li> <code>NH</code>:"New Hampshire", <br/>
	     * <li> <code>NJ</code>:"New Jersey", <br/>
	     * <li> <code>NM</code>:"New Mexico", <br/>
	     * <li> <code>NV</code>:"Nevada", <br/>
	     * <li> <code>NY</code>:"New York", <br/>
	     * <li> <code>OH</code>:"Ohio", <br/>
	     * <li> <code>OK</code>:"Oklahoma", <br/>
	     * <li> <code>OR</code>:"Oregon", <br/>
	     * <li> <code>PA</code>:"Pennsylvania", <br/>
	     * <li> <code>PR</code>:"Puerto Rico", <br/>
	     * <li> <code>RI</code>:"Rhode Island", <br/>
	     * <li> <code>SC</code>:"South Carolina", <br/>
	     * <li> <code>SD</code>:"South Dakota", <br/>
	     * <li> <code>TN</code>:"Tennessee", <br/>
	     * <li> <code>TX</code>:"Texas", <br/>
	     * <li> <code>UT</code>:"Utah", <br/>
	     * <li> <code>VA</code>:"Virginia", <br/>
	     * <li> <code>VI</code>:"Virgin Islands", <br/>
	     * <li> <code>VT</code>:"Vermont", <br/>
	     * <li> <code>WA</code>:"Washington", <br/>
	     * <li> <code>WI</code>:"Wisconsin", <br/>
	     * <li> <code>WV</code>:"West Virginia", <br/>
	     * <li> <code>WY</code>:"Wyoming" <br/>
	     * <br/> Canada states code list: <br/>
	     * <li> <code>AB</code>: "Alberta", <br/>
	     * <li> <code>BC</code>: "British Columbia", <br/>
	     * <li> <code>MB</code>: "Manitoba", <br/>
	     * <li> <code>NB</code>:	"New Brunswick", <br/>
	     * <li> <code>NL</code>: "Newfoundland and Labrador", <br/>
	     * <li> <code>NS</code>: "Nova Scotia", <br/>
	     * <li> <code>NT</code>: "Northwest Territories", <br/>
	     * <li> <code>NU</code>: "Nunavut", <br/>
	     * <li> <code>ON</code>: "Ontario", <br/>
	     * <li> <code>PE</code>: "Prince Edward Island", <br/>
	     * <li> <code>QC</code>: "Quebec", <br/>
	     * <li> <code>SK</code>: "Saskatchewan", <br/>
	     * <li> <code>YT</code>: "Yukon" <br/>
	     * {string="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language <br/>
	     * <br/>
	     * <br/> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen). <br/>
	     * <br/> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... <br/>
	     * <br/> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>. <br/>
	     * {string}          [infos.timezone]      User timezone name <br/>
	     * <br/> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a> <br/>
	     * <br/> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...) <br/>
	     * {string=free,basic,advanced} [infos.accountType=free]  User subscription type <br/>
	     * {string[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles <br/>
	     * <br/>
	     * <br/>The general rule is that a user must have the roles that the wants to assign to someone else. <br/>
	     * <br/>Examples: <br/>
	     * <ul>
	     *     <li>an <code>admin</code> can add or remove the role <code>admin</code> to another user of the company(ies) he manages,</li>
	     *     <li>an <code>bp_admin</code> can add or remove the role <code>bp_admin</code> to another user of the company(ies) he manages,</li>
	     *     <li>an <code>app_superadmin</code> can add or remove the role <code>app_superadmin</code> to another user...</li>
	     * </ul>
	     * Here are some explanations regarding the roles available in Rainbow: <br/>
	     * <ul>
	     * <li><code>admin</code>, <code>bp_admin</code> and <code>bp_finance</code> roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...).</li>
	     * <li><code>bp_admin</code> and <code>bp_finance</code> roles can only be set to users of a BP company (company with isBP=true).</li>
	     * <li><code>app_admin</code>, <code>app_support</code> and <code>app_superadmin</code> roles are related to application management.</li>
	     * <li><code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code> roles are related to channels management.</li>
	     * <li>Only <code>superadmin</code> can set <code>superadmin</code> and <code>support</code> roles to a user.</li>
	     * <li>A user with admin rights (admin, bp_admin, superadmin) can't change his own roles, except for roles related to channels (<code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code>).</li>
	     * </ul>
	     * {string=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS <br/>
	     * {string}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1) <br/>
	     * <br/> companyName field is automatically filled on server side based on companyId. <br/>
	     * {Boolean} [infos.isActive=true]         Is user active <br/>
	     * {Boolean} [infos.isInitialized=false]   Is user initialized <br/>
	     * {string=private,public,closed,isolated,none} [infos.visibility]  User visibility <br/>
	     * </br> Define if the user can be searched by users being in other company and if the user can search users being in other companies. <br/>
	     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
	     * - `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
	     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users <br/>
	     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users <br/>
	     * - `none`:  Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users <br/>
	     * <br/>External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. <br/>
	     * {Number} [infos.timeToLive] Duration in second to wait before automatically starting a user deletion from the creation date. <br/>
	     * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. <br/>
	     * Value -1 means timeToLive is disable (i.e. user account will not expire). <br/>
	     * If created user has role <code>guest</code> and no timeToLive is provided, a default value of 172800 seconds is set (48 hours). <br/>
	     * If created user does not have role <code>guest</code> and no timeToLive is provided, a default value of -1 is set (no expiration). <br/>
	     * {string=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used) <br/>
	     * {string{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
	     * {string{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
	     * {string} selectedTheme Set the selected theme for the user. <br/>
	     * {Object} customData  User's custom data. <br/>
	     *    key1 	string User's custom data key1. <br/>
	     *    key2 	string Company's custom data key2. <br/>
	     *  customData can only be created/updated by: <br/>
	     *   the user himself, company_admin or organization_admin of his company, bp_admin and bp_finance of his company, superadmin. <br/>
	     *   Restrictions on customData Object: <br/>
	     *   max 10 keys, <br/>
	     *   max key length: 64 characters, max value length: 512 characters. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). <br/>
	     *
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Json object containing informations or an error object depending on the result
	     * @category async
	     */
	    updateContactInfos(userId: any, infos: any): Promise<unknown>;
	    /**
	     *
	     * @public
	     * @method getUserPresenceInformation
	     * @instance
	     * @description
	     *      Get presence informations about a user <br/>
	     * <br/>
	     *      Company admin shall be able to check if a user can be reached or not, by checking the presence information (available, busy, away, etc). <br/>
	     *      Admin will have to select a user to get a presence snapshot when opening the user configuration profile. <br/>
	     *      A brute force defense is activated when too much request have been requested by the same administrator, to not overload the backend. As a result, an error 429 "Too Many Requests" will be returned . <br/>
	     * @param {string} userId The id of the user. If the userId is not provided, then it use the current loggedin user id.
	     * @async
	     * @return {Promise<any>}
	     * @category async
	     */
	    getUserPresenceInformation(userId?: undefined): Promise<any>;
	    /**
	     * @public
	     * @method retrieveAllOffersOfCompanyById
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to be retrieve the offers.
	     * @description
	     *      Method to retrieve all the offers of one company on server. <br/>
	     * @return {Promise<Array<any>>}
	     */
	    retrieveAllOffersOfCompanyById(companyId?: string): Promise<Array<any>>;
	    /**
	     * @public
	     * @method retrieveAllSubscribtionsOfCompanyById
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to be retrieve the subscriptions.
	     * @description
	     *      Method to retrieve all the subscriptions of one company on server. <br/>
	     * @return {Promise<Array<any>>}
	     */
	    retrieveAllSubscribtionsOfCompanyById(companyId?: string): Promise<Array<any>>;
	    /**
	     * @public
	     * @method getSubscribtionsOfCompanyByOfferId
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} offerId Id of the offer to filter subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to get the subscription of one company for one offer. <br/>
	     * @return {Promise<any>}
	     */
	    getSubscribtionsOfCompanyByOfferId(offerId: any, companyId: any): Promise<any>;
	    /**
	     * @public
	     * @method subscribeCompanyToOfferById
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} offerId Id of the offer to filter subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @param {number} maxNumberUsers
	     * @param {boolean} autoRenew
	     * @description
	     *      Method to subscribe one company to one offer. <br/>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToOfferById(offerId: string, companyId?: string, maxNumberUsers?: number, autoRenew?: boolean): Promise<unknown>;
	    /**
	     * @private
	     * @method subscribeCompanyToDemoOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to subscribe one company to offer demo. <br/>
	     *      Private offer on .Net platform. <br/>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToDemoOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @private
	     * @method unSubscribeCompanyToDemoOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to offer demo. <br/>
	     *      Private offer on .Net platform. <br/>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToDemoOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeCompanyToAlertOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to the subscription of the offer.
	     * @description
	     *      Method to subscribe one company to offer Alert. <br/>
	     *      Private offer on .Net platform. <br/>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToAlertOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeCompanyToAlertOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to the unsubscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to offer Alert. <br/>
	     *      Private offer on .Net platform. <br/>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToAlertOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeCompanyToVoiceEnterpriseOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company the subscription of the offer.
	     * @description
	     *      Method to subscribe one company to offer Voice Enterprise. <br/>
	     *      Private offer on .Net platform. <br/>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToVoiceEnterpriseOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeCompanyToVoiceEnterpriseOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company to the unsubscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to offer Voice Enterprise. <br/>
	     *      Private offer on .Net platform. <br/>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToVoiceEnterpriseOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeCompanyToOfferById
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} offerId Id of the offer to filter subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to one offer . <br/>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToOfferById(offerId: string, companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeUserToSubscription
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} userId the id of the user which will subscribe. If not provided, the connected user is used.
	     * @param {string} subscriptionId the id of the subscription to attach to user.
	     * @description
	     *      Method to subscribe one user to a subscription of the company. <br/>
	     * @return {Promise<any>}
	     */
	    subscribeUserToSubscription(userId?: string, subscriptionId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeUserToSubscription
	     * @since 1.73
	     * @instance
	     * @async
	     * @param {string} userId the id of the user which will unsubscribe. If not provided, the connected user is used.
	     * @param {string} subscriptionId the id of the subscription to unsubscribe the user.
	     * @description
	     *      Method to unsubscribe one user to a subscription. <br/>
	     * @return {Promise<any>}
	     */
	    unSubscribeUserToSubscription(userId?: string, subscriptionId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method synchronizeUsersAndDeviceswithCSV
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} csvTxt the csv of the user and device to synchronize.
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
	     * @param {string} label a text description of this import
	     * @param {boolean} noemails disable email sending
	     * @param {boolean} nostrict create of an existing user and delete of an unexisting user are not errors
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
	     * @description
	     *     This API allows to synchronize Rainbow users or devices through a CSV UTF-8 encoded file. it is a merge from user mode and device mode <br/>
	     *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. <br/>
	     * <br/>
	     * Supported fields for "user" management are: <br/>
	     * __action__  delete, upsert, sync or detach <br/>
	     * loginEmail  (mandatory) <br/>
	     * password  (mandatory) <br/>
	     * title <br/>
	     * firstName <br/>
	     * lastName <br/>
	     * nickName <br/>
	     * businessPhone{n}  (n is a number starting from 0 or 1) <br/>
	     * mobilePhone{n}  (n is a number starting from 0 or 1) <br/>
	     * email{n}  (n is a number starting from 0 or 1) <br/>
	     * tags{n}  (n is a number starting from 0 to 4) <br/>
	     * jobTitle <br/>
	     * department <br/>
	     * userInfo1 <br/>
	     * userInfo2 <br/>
	     * country <br/>
	     * language <br/>
	     * timezone <br/>
	     * visibility <br/>
	     * isInitialized <br/>
	     * authenticationType <br/>
	     * service{n} <br/>
	     * accountType <br/>
	     * photoUrl <br/>
	     * <br/>
	     * Supported fields for "device" management are: <br/>
	     * loginEmail (mandatory) <br/>
	     * pbxId <br/>
	     * pbxShortNumber <br/>
	     * pbxInternalNumber <br/>
	     * number <br/>
	     * <br/>
	     * detach: allows to detach an PBX extension from a user. delete: allows to delete a user. upsert: allows to modify user (update or create if doesn't exists) and device (force attach if filled) with filled fields. Remark: empty fields are not taken into account. sync: allows to modify user (update or create if doesn't exists) and device (force attach if filled, detach if empty) with filled fields. <br/>
	     * Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value). <br/>
	     * <br/>
	     * Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. Caution: for sync action: <br/>
	     * As empty fields are taken into account, all fields must be filled to avoid a reset of these values <br/>
	     * As empty fields are taken into account, it is better to avoid mixing sync __action__ with others actions <br/>
	     * <br/>
	     * @return {Promise<any>} import summary result.
	     */
	    synchronizeUsersAndDeviceswithCSV(csvTxt?: string, companyId?: string, label?: string, noemails?: boolean, nostrict?: boolean, delimiter?: string, comment?: string): Promise<{
	        reqId: string;
	        mode: string;
	        status: string;
	        userId: string;
	        displayName: string;
	        label: string;
	        startTime: string;
	    }>;
	    /**
	     * @public
	     * @method getCSVTemplate
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string}  companyId ompanyId of the users in the CSV file, default to admin's companyId.
	     * @param {string} mode Select template to return.
	     * - user: provider the user management template
	     * - device: provider the device management template
	     * - useranddevice: provider the user and device management template (both user and device)
	     * - rainbowvoice : provider the user and subscriber/DDI/device association management template.
	     * @param {string} comment Only the template comment..
	     * @description
	     *      This API provides a CSV template. <br/>
	     *      result : <br/>
	     *      CSV {Object[]} lines with all supported headers and some samples : <br/>
	     *      __action__ {string} Action to perform values : create, update, delete, upsert, detach <br/>
	     *      loginEmail {string} email address - Main or professional email used as login <br/>
	     *      password optionnel {string} (>= 8 chars with 1 capital+1 number+1 special char) (e.g. This1Pwd!) <br/>
	     *      title optionnel {string} (e.g. Mr, Mrs, Dr, ...) <br/>
	     *      firstName optionnel {string} <br/>
	     *      lastName optionnel {string} <br/>
	     *      nickName optionnel {string} <br/>
	     *      businessPhone0 optionnel {string} E.164 number - DDI phone number (e.g. +33123456789) <br/>
	     *      mobilePhone0 optionnel {string} E.164 number - Mobile phone number (e.g. +33601234567) <br/>
	     *      email0 optionnel {string} email address - Personal email <br/>
	     *      jobTitle optionnel {string} <br/>
	     *      department optionnel {string} <br/>
	     *      country optionnel {string} ISO 3166-1 alpha-3 - (e.g. FRA) <br/>
	     *      language optionnel {string} ISO 639-1 (en) / with ISO 31661 alpha-2 (en-US) <br/>
	     *      timezone optionnel {string} IANA tz database (Europe/Paris) <br/>
	     *      pbxShortNumber optionnel {number} PBX extension number <br/>
	     *      pbxInternalNumber optionnel {string} E.164 number - Private number when different from extension number <br/>
	     *      selectedAppCustomisationTemplateName optionnel {string} Allow to specify an application customisation template for this user. The application customisation template has to be specified using its name (ex: "Chat and Audio", "Custom profile")     Values( Full, Phone, calls, only, Audio, only, Chat, and, Audio, Same, as, company, , profile) <br/>
	     *      shortNumber optionnel string subscriber {number} (only for rainbowvoice mode) <br/>
	     *      macAddress optionnel {string} macAddress of the associated SIP device of the subscriber (only for rainbowvoice mode) <br/>
	     *      ddiE164Number optionnel string E.164 {number} - E164 number of the associted DDI of the subscriber (only for rainbowvoice mode) <br/>
	     * @return {Promise<any>}
	     */
	    getCSVTemplate(companyId?: string, mode?: string, comment?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method checkCSVforSynchronization
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} CSVTxt CSV File content to be checked.
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character.
	     * @description
	     *      This API checks a CSV UTF-8 content for mass-provisioning for useranddevice mode.<br/>
	     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br/>
	     *      { <br/>
	     *           actions {Object} actions information <br/>
	     *               sync optionnel {number} number of user synchronization actions <br/>
	     *               upsert optionnel {number} number of user create/update actions <br/>
	     *               delete optionnel {number} number of user remove actions <br/>
	     *               detach optionnel {number} number of device unpairing actions <br/>
	     *           reqId {string} check request identifier <br/>
	     *           mode {string} request csv mode Valeurs autorisées : user, device <br/>
	     *           columns {number} number of columns in the CSV <br/>
	     *           delimiter {string} the CSV delimiter <br/>
	     *           profiles {Object} the managed profiles <br/>
	     *              name {string} the managed profiles name <br/>
	     *              valid {boolean} the managed profiles validity <br/>
	     *              assignedBefore {number} the assigned number of managed profiles before this import <br/>
	     *              assignedAfter {number} the assigned number of managed profiles after this import has been fulfilled <br/>
	     *              max number the {maximum} number of managed profiles available <br/>
	     *      } <br/>
	     * @return {Promise<any>}
	     */
	    checkCSVforSynchronization(CSVTxt: any, companyId?: string, delimiter?: string, comment?: string): any;
	    /**
	     * @public
	     * @method retrieveRainbowUserList
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
	     * @param {string} format the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
	     * @param {boolean} ldap_id the CSV comment start character, use double quotes in field values to escape this character.
	     * @description
	     *      This API generates a file describing all users (csv or json format). <br/>
	     *      return an {Object}  of synchronization data. <br/>
	     * @return {Promise<any>}
	     */
	    retrieveRainbowUserList(companyId?: string, format?: string, ldap_id?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method ActivateALdapConnectorUser
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @description
	     *      This API allows to activate a Ldap connector. <br/>
	     *      A "Ldap user" is created and registered to the XMPP services. The Ldap user credentials (loginEmail and password) are generated randomly and returned in the response. <br/>
	     * <br/>
	     *      Note 1 A brute force defense is activated when too much activation have been requested. As a result, an error 429 "Too Many Requests" will be returned during an increasing period to dissuade a slow brute force attack. <br/>
	     *      Note 2 Ldap's company should have an active subscription to to activate Ldap. If subscription linked to Ldap is not active or it has no more remaining licenses, error 403 is thrown <br/>
	     *      Note 3 Ldap's company should have an SSO authentication Type, and it must be the default authentication Type for users. If company doesn't have an SSO or have one but not a default one, error 403 is thrown <br/>
	     *       <br/>
	     *      return { <br/>
	     *          id {string} ldap connector unique identifier. <br/>
	     *          companyId {string} Company linked to the Ldap connector. <br/>
	     *          loginEmail {string} Generated Ldap connector user login ("throwaway" email address, never used by rainbow to send email). <br/>
	     *          password {string} Generated Ldap connector user password. <br/>
	     *          } <br/>
	     * @return {Promise<{ id : string, companyId : string, loginEmail : string, password : string}>}
	     */
	    ActivateALdapConnectorUser(): Promise<{
	        id: string;
	        companyId: string;
	        loginEmail: string;
	        password: string;
	    }>;
	    /**
	     * @public
	     * @method retrieveAllLdapConnectorUsersData
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} companyId the id of the company that allows to filter connectors list on the companyIds provided in this option.
	     * @param {string} format Allows to retrieve more or less user details in response.
	     * small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
	     * medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
	     * full: all user fields
	     * default : small
	     * Values : small, medium, full
	     * @param {number} limit Allow to specify the number of users to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort user list based on the given field. Default : displayName
	     * @param {number} sortOrder Specify order when sorting user list. Default : 1. Values : -1, 1
	     * @description
	     *     This API allows administrators to retrieve all the ldap connectors. <br/>
	     *     Users with superadmin, support role can retrieve the connectors from any company. <br/>
	     *     Users with bp_admin or bp_finance role can only retrieve the connectors in companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
	     *     Users with admin role can only retrieve the connectors in companies they can manage. That is to say: <br/>
	     *     an organization_admin can retrieve the connectors only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
	     *     a company_admin can only retrieve the connectors in his company. <br/>
	     *     This API can return more or less connector information using format option in query string arguments (default is small). <br/>
	     * <br/>
	     *      return { // List of connector Objects. <br/>
	     *          id string TV unique identifier. <br/>
	     *          name string TV name. <br/>
	     *          location optionnel string Location of the TV. <br/>
	     *          locationDetail optionnel string More detail on the location of the TV. <br/>
	     *          room optionnel string Name of the room where the TV is located. <br/>
	     *          companyId string company linked to the TV. <br/>
	     *          activationCode string Activation code (6 digits). The activationCode may be null in the case its generation in multi-environment database failed. In that case, a security mechanism takes place to generate this activation code asynchronously (try every minutes until the code creation is successful). As soon as the activation code is successfully generated in multi-environment database, the TV is updated accordingly (activationCode set to the generated code value) and with activationCodeGenerationStatus updated to done. <br/>
	     *          codeUpdateDate date Date of last activation code update. <br/>
	     *          status string TV status:    unassociated (no TV user).    associated with a TV user (the TV has been activated). <br/>
	     *          statusUpdatedDate Date-Time Date of last tv status update. <br/>
	     *          subscriptionId string Subscription to use when activating TV. <br/>
	     *          loginEmail string User email address (used for login) <br/>
	     *          firstName string User first name <br/>
	     *          lastName string User last name <br/>
	     *          displayName string User display name (firstName + lastName concatenated on server side) <br/>
	     *          nickName optionnel string User nickName <br/>
	     *          title optionnel string User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br/>
	     *          jobTitle optionnel string User job title <br/>
	     *          department optionnel string User department <br/>
	     *          tags optionnel string[] An Array of free tags associated to the user. A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. tags can only be set by users who have administrator rights on the user. The user can't modify the tags. The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. <br/>
	     *          emails Object[] Array of user emails addresses objects <br/>
	     *             email string User email address <br/>
	     *             type string Email type, one of home, work, other <br/>
	     *          phoneNumbers Object[] Array of user phone numbers objects. Phone number objects can:   be created by user (information filled by user), come from association with a system (pbx) device (association is done by admin). <br/>
	     *              phoneNumberId string Phone number unique id in phone-numbers directory collection. <br/>
	     *              number optionnel string User phone number (as entered by user) <br/>
	     *              numberE164 optionnel string User E.164 phone number, computed by server from number and country fields <br/>
	     *              country 	String Phone number country (ISO 3166-1 alpha3 format) country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used   isFromSystem Boolean Boolean indicating if phone is linked to a system (pbx). <br/>
	     *              shortNumber optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG). Only usable within the same PBX. Only PCG can set this field. <br/>
	     *              internalNumber optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), internal phone number. Usable within a PBX group. Admins and users can modify this internalNumber field. <br/>
	     *              systemId optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. <br/>
	     *              pbxId optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that pbx. <br/>
	     *              type 	String Phone number type, one of home, work, other. <br/>
	     *              deviceType 	String Phone number device type, one of landline, mobile, fax, other. <br/>
	     *              isVisibleByOthers 	Boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers. <br/>
	     *         country 	String User country (ISO 3166-1 alpha3 format) <br/>
	     *         state optionnel 	String When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null). <br/>
	     *         language optionnel 	String User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) <br/>
	     *         timezone optionnel 	String User timezone name <br/>
	     *         jid_im 	String User Jabber IM identifier <br/>
	     *         jid_tel 	String User Jabber TEL identifier <br/>
	     *         jid_password 	String User Jabber IM and TEL password <br/>
	     *         roles 	String[] List of user roles (Array of String) Note: company_support role is only used for support redirection. If a user writes a #support ticket and have the role company_support, the ticket will be sent to ALE's support (otherwise the ticket is sent to user's company's supportEmail address is set, ALE otherwise). <br/>
	     *         adminType 	String In case of user's is 'admin', define the subtype (organisation_admin, company_admin, site_admin (default undefined) <br/>
	     *         organisationId 	String In addition to User companyId, optional identifier to indicate the user belongs also to an organization <br/>
	     *         siteId 	String In addition to User companyId, optional identifier to indicate the user belongs also to a site <br/>
	     *         companyName 	String User company name <br/>
	     *         visibility 	String User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: <br/>
	     *         same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. <br/>
	     *         public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
	     *         private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
	     *         closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users <br/>
	     *         isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users <br/>
	     *         none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users <br/>
	     *         External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Values(same_than_company, public, private, closed, isolated, none) <br/>
	     *         isActive 	Boolean Is user active  <br/>
	     *         isInitialized 	Boolean Is user initialized <br/>
	     *         initializationDate 	Date-Time User initialization date <br/>
	     *         activationDate 	Date-Time User activation date <br/>
	     *         creationDate 	Date-Time User creation date <br/>
	     *         lastUpdateDate 	Date-Time Date of last user update (whatever the field updated) <br/>
	     *         lastAvatarUpdateDate 	Date-Time Date of last user avatar create/update, null if no avatar <br/>
	     *         createdBySelfRegister 	Boolean true if user has been created using self register <br/>
	     *         createdByAdmin optionnel 	Object If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user <br/>
	     *         userId 	String userId of the admin who created this user <br/>
	     *         loginEmail 	String loginEmail of the admin who created this user <br/>
	     *         invitedBy optionnel 	Object If user has been created from an email invitation sent by another rainbow user, contain the date the invitation was sent and userId and loginEmail of the user who invited this user <br/>
	     *         userId 	String userId of the user who invited this user <br/>
	     *         loginEmail 	String loginEmail of the user who invited this user <br/>
	     *         authenticationType optionnel 	String User authentication type (if not set company default authentication will be used) Values (DEFAULT, RAINBOW, SAML, OIDC) <br/>
	     *         authenticationExternalUid optionnel 	String User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType) <br/>
	     *         firstLoginDate 	Date-Time Date of first user login (only set the first time user logs in, null if user never logged in) <br/>
	     *         lastLoginDate 	Date-Time Date of last user login (defined even if user is logged out) <br/>
	     *         loggedSince 	Date-Time Date of last user login (null if user is logged out) <br/>
	     *         isTerminated 	Boolean Indicates if the Rainbow account of this user has been deleted <br/>
	     *         guestMode 	Boolean Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. <br/>
	     *         timeToLive optionnel 	Number Duration in second to wait before automatically starting a user deletion from the creation date. Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. Value -1 means timeToLive is disable (i.e. user account will not expire). <br/>
	     *         userInfo1 optionnel 	String Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
	     *         userInfo2 optionnel 	String 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
	     *         useScreenSharingCustomisation 	String Activate/Deactivate the capability for a user to share a screen. Define if a user has the right to share his screen. <br/>
	     *         useScreenSharingCustomisation can be: <br/>
	     *            same_than_company: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting. <br/>
	     *            enabled: Each user of the company can share his screen. <br/>
	     *            disabled: No user of the company can share his screen. <br/>
	     *         customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. <br/>
	     *         activationCodeGenerationStatus 	String Status the activation code generation done if the activation code generation is successful <br/>
	     *         in_progress if the activation code generation failed and the security mechanism is ongoing to try to generate it again every minute Valeurs autorisées : done, in_progress <br/>
	     *         fileSharingCustomisation 	String Activate/Deactivate file sharing capability per user Define if the user can use the file sharing service then, allowed to download and share file. <br/>
	     *         FileSharingCustomisation can be: <br/>
	     *            same_than_company: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting. <br/>
	     *            enabled: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service. <br/>
	     *            disabled: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. <br/>
	     *         userTitleNameCustomisation 	String Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) Define if the user can change some profile data. <br/>
	     *         userTitleNameCustomisation can be: <br/>
	     *            same_than_company: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting. <br/>
	     *            enabled: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data. <br/>
	     *            disabled: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data. <br/>
	     *         softphoneOnlyCustomisation 	String Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services but to focus to telephony services Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on. <br/>
	     *         softphoneOnlyCustomisation can be: <br/>
	     *            same_than_company: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting. <br/>
	     *            enabled: The user switch to a softphone mode only. <br/>
	     *            disabled: The user can use telephony services, chat, bubbles, channels meeting services and so on. <br/>
	     *         useRoomCustomisation 	String Activate/Deactivate the capability for a user to use bubbles. Define if a user can create bubbles or participate in bubbles (chat and web conference). <br/>
	     *         useRoomCustomisation can be: <br/>
	     *            same_than_company: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting. <br/>
	     *            enabled: The user can use bubbles. <br/>
	     *            disabled: The user can't use bubbles. <br/>
	     *         phoneMeetingCustomisation 	String Activate/Deactivate the capability for a user to use phone meetings (PSTN conference). Define if a user has the right to join phone meetings. <br/>
	     *         phoneMeetingCustomisation can be: <br/>
	     *            same_than_company: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting. <br/>
	     *            enabled: The user can join phone meetings. <br/>
	     *            disabled: The user can't join phone meetings. <br/>
	     *         useChannelCustomisation 	String Activate/Deactivate the capability for a user to use a channel. Define if a user has the right to create channels or be a member of channels. <br/>
	     *         useChannelCustomisation can be: <br/>
	     *            same_than_company: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting. <br/>
	     *            enabled: The user can use some channels. <br/>
	     *            disabled: The user can't use some channel. <br/>
	     *         useWebRTCVideoCustomisation 	String Activate/Deactivate the capability for a user to switch to a Web RTC video conversation. Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call). <br/>
	     *         useWebRTCVideoCustomisation can be: <br/>
	     *            same_than_company: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting. <br/>
	     *            enabled: The user can switch to a Web RTC video conversation. <br/>
	     *            disabled: The user can't switch to a Web RTC video conversation. <br/>
	     *         useWebRTCAudioCustomisation 	String Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation. Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call). <br/>
	     *         useWebRTCAudioCustomisation can be: <br/>
	     *            same_than_company: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting. <br/>
	     *            enabled: The user can switch to a Web RTC audio conversation. <br/>
	     *            disabled: The user can't switch to a Web RTC audio conversation. <br/>
	     *         instantMessagesCustomisation 	String Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications. <br/>
	     *         instantMessagesCustomisation can be: <br/>
	     *            same_than_company: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting. <br/>
	     *            enabled: The user can use instant messages. <br/>
	     *            disabled: The user can't use instant messages. <br/>
	     *         userProfileCustomisation 	String Activate/Deactivate the capability for a user to modify his profile. Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName). <br/>
	     *         userProfileCustomisation can be: <br/>
	     *            same_than_company: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting. <br/>
	     *            enabled: The user can modify his profile. <br/>
	     *            disabled: The user can't modify his profile. <br/>
	     *         fileStorageCustomisation 	String Activate/Deactivate the capability for a user to access to Rainbow file storage.. Define if a user has the right to upload/download/copy or share documents. <br/>
	     *         fileStorageCustomisation can be: <br/>
	     *            same_than_company: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting. <br/>
	     *            enabled: The user can manage and share files. <br/>
	     *            disabled: The user can't manage and share files. <br/>
	     *         overridePresenceCustomisation 	String Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to change his presence manually or only use automatic states. <br/>
	     *         overridePresenceCustomisation can be: <br/>
	     *            same_than_company: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting. <br/>
	     *            enabled: The user can change his presence. <br/>
	     *            disabled: The user can't change his presence. <br/>
	     *         changeTelephonyCustomisation 	String Activate/Deactivate the ability for a user to modify telephony settings. Define if a user has the right to modify some telephony settigs like forward activation... <br/>
	     *         changeTelephonyCustomisation can be: <br/>
	     *            same_than_company: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting. <br/>
	     *            enabled: The user can modify telephony settings. <br/>
	     *            disabled: The user can't modify telephony settings. <br/>
	     *         changeSettingsCustomisation 	String Activate/Deactivate the ability for a user to change all client general settings. <br/>
	     *         changeSettingsCustomisation can be: <br/>
	     *            same_than_company: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting. <br/>
	     *            enabled: The user can change all client general settings. <br/>
	     *            disabled: The user can't change any client general setting. <br/>
	     *         recordingConversationCustomisation 	String Activate/Deactivate the capability for a user to record a conversation. Define if a user has the right to record a conversation (for P2P and multi-party calls). <br/>
	     *         recordingConversationCustomisation can be: <br/>
	     *            same_than_company: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting. <br/>
	     *            enabled: The user can record a peer to peer or a multi-party call. <br/>
	     *            disabled: The user can't record a peer to peer or a multi-party call. <br/>
	     *         useGifCustomisation 	String Activate/Deactivate the ability for a user to Use GIFs in conversations. Define if a user has the is allowed to send animated GIFs in conversations <br/>
	     *         useGifCustomisation can be: <br/>
	     *            same_than_company: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting. <br/>
	     *            enabled: The user can send animated GIFs in conversations. <br/>
	     *            disabled: The user can't send animated GIFs in conversations. <br/>
	     *         fileCopyCustomisation 	String Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space <br/>
	     *         fileCopyCustomisation can be: <br/>
	     *            same_than_company: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting. <br/>
	     *            enabled: The user can make a copy of a file to his personal cloud space. <br/>
	     *            disabled: The user can't make a copy of a file to his personal cloud space. <br/>
	     *         fileTransferCustomisation 	String Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation. The file cannot be re-shared. <br/>
	     *         fileTransferCustomisation can be: <br/>
	     *            same_than_company: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting. <br/>
	     *            enabled: The user can transfer a file doesn't belong to him. <br/>
	     *            disabled: The user can't transfer a file doesn't belong to him. <br/>
	     *         forbidFileOwnerChangeCustomisation 	String Activate/Deactivate the capability for a user to loose the ownership on one file.. One user can drop the ownership to another Rainbow user of the same company. <br/>
	     *         forbidFileOwnerChangeCustomisation can be: <br/>
	     *            same_than_company: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting. <br/>
	     *            enabled: The user can't give the ownership of his file. <br/>
	     *            disabled: The user can give the ownership of his file. <br/>
	     *         useDialOutCustomisation 	String Activate/Deactivate the capability for a user to use dial out in phone meetings. Define if a user is allowed to be called by the Rainbow conference bridge. <br/>
	     *         useDialOutCustomisation can be: <br/>
	     *            same_than_company: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting. <br/>
	     *            enabled: The user can be called by the Rainbow conference bridge. <br/>
	     *            disabled: The user can't be called by the Rainbow conference bridge. <br/>
	     *         selectedAppCustomisationTemplate 	String To log the last template applied to the user. <br/>
	     *      } <br/>
	     * @return {Promise<any>}
	     */
	    retrieveAllLdapConnectorUsersData(companyId?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<any>;
	    /**
	     * @public
	     * @method deleteLdapConnector
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} ldapId the Id of the ldap connector to delete.
	     * @description
	     *      This API is to delete the connector (the connector cannot be modified by the others admin APIs) <br/>
	     *      return { <br/>
	     *          status {string} Delete operation status message. <br/>
	     *          } <br/>
	     * @return {Promise<{ status : string}>}
	     */
	    deleteLdapConnector(ldapId: string): Promise<{
	        status: string;
	    }>;
	    /**
	     * @public
	     * @method retrieveLdapConnectorConfigTemplate
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @description
	     *      This API allows to retrieve the configuration template for the connector. <br/>
	     *      return { <br/>
	     *         id 	String Config unique identifier. <br/>
	     *         type 	String Config type  <br/>
	     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
	     *         settings 	Object config settings <br/>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
	     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
	     *                 login 	String login for the ldap server. <br/>
	     *                 password 	String password for the ldap server. <br/>
	     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
	     *                 url 	String url of the ldap server. <br/>
	     *          } <br/>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLdapConnectorConfigTemplate(): Promise<unknown>;
	    /**
	     * @public
	     * @method createConfigurationForLdapConnector
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} companyId the id of the company.
	     * @param {Object} settings config settings.
	     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
	     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
	     * @param {Object} settings.company specific settings for the company. Each key represent a setting.
	     * @param {string} settings.company.login login for the ldap server.
	     * @param {string} settings.company.password password for the ldap server.
	     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours.
	     * @param {string} settings.company.url url of the ldap server.
	     * @description
	     *      This API allows create configuration for the connector. <br/>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br/>
	     *      Users with superadmin, support role can create the connectors configuration from any company. <br/>
	     *      Users with bp_admin or bp_finance role can only create the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
	     *      Users with admin role can only create the connectors configuration in companies they can manage. That is to say: <br/>
	     *      an organization_admin can create the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
	     *      a company_admin can only create the connectors configuration in his company. <br/>
	     *      return { <br/>
	     *         id 	String Config unique identifier. <br/>
	     *         type 	String Config type  <br/>
	     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
	     *         settings 	Object config settings <br/>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
	     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
	     *                 login 	String login for the ldap server. <br/>
	     *                 password 	String password for the ldap server. <br/>
	     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
	     *                 url 	String url of the ldap server. <br/>
	     *          } <br/>
	     * @return {Promise<{Object}>}
	     */
	    createConfigurationForLdapConnector(companyId: any, settings: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateConfigurationForLdapConnector
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} ldapConfigId ldap connector unique identifier
	     * @param {Object} settings config settings
	     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
	     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
	     * @param {Object} settings.company specific settings for the company. Each key represent a setting.
	     * @param {string} settings.company.login login for the ldap server.
	     * @param {string} settings.company.password password for the ldap server.
	     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours.
	     * @param {string} settings.company.url url of the ldap server.
	     * @param {boolean} strict Allows to specify if all the previous fields must be erased or just update/push new fields.
	     * @description
	     *      This API allows update configuration for the connector. <br/>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br/>
	     *      Users with superadmin, support role can update the connectors configuration from any company. <br/>
	     *      Users with bp_admin or bp_finance role can only update the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
	     *      Users with admin role can only update the connectors configuration in companies they can manage. That is to say: <br/>
	     *      an organization_admin can update the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
	     *      a company_admin can only update the connectors configuration in his company. <br/>
	     *      return { <br/>
	     *         id 	String Config unique identifier. <br/>
	     *         type 	String Config type  <br/>
	     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
	     *         settings 	Object config settings <br/>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
	     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
	     *                 login 	String login for the ldap server. <br/>
	     *                 password 	String password for the ldap server. <br/>
	     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
	     *                 url 	String url of the ldap server. <br/>
	     *          } <br/>
	     * @return {Promise<{Object}>}
	     */
	    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveLdapConnectorConfig
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} companyId Allows to filter connectors list on the companyId provided in this option. In the case of admin (except superadmin and support roles), provided companyId should correspond to a company visible by logged in user's company (if some of the provided companyId are not visible by logged in user's company, connectors from these companies will not be returned). if not provided, default is admin's company.
	     * @description
	     *      This API allows to retrieve the configuration for the connector. <br/>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br/>
	     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br/>
	     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
	     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br/>
	     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
	     *      a company_admin can only retrieve the connectors configuration in his company. <br/>
	     *      return { <br/>
	     *         id 	String Config unique identifier. <br/>
	     *         type 	String Config type  <br/>
	     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
	     *         settings 	Object config settings <br/>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
	     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
	     *                 login 	String login for the ldap server. <br/>
	     *                 password 	String password for the ldap server. <br/>
	     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
	     *                 url 	String url of the ldap server. <br/>
	     *          } <br/>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLdapConnectorConfig(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPbxById
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows administrator to retrieve a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPbxById(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCloudPBX
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} barringOptions_permissions Identifier of the traffic barring permission to apply
	     * @param {string} barringOptions_restrictions Identifier of the traffic barring restriction to apply
	     * @param {string} callForwardOptions_externalCallForward Indicates if an external call forward is authorized
	     * @param {string} customSipHeader_1 Value to put as Custom SIP Header 1 into SIP data for an external outgoing call
	     * @param {string} customSipHeader_2 Value to put as Custom SIP Header 2 into SIP data for an external outgoing call
	     * @param {boolean} emergencyOptions_callAuthorizationWithSoftPhone Indicates if SoftPhone can perform an emergency call over voip
	     * @param {boolean} emergencyOptions_emergencyGroupActivated Indicates if emergency Group is active
	     * @param {string} externalTrunkId External trunk that should be linked to this CloudPBX
	     * @param {string} language New language for this CloudPBX. Values : "ro" "es" "it" "de" "ru" "fr" "en" "ar" "he" "nl"
	     * @param {string} name New CloudPBX name
	     * @param {number} numberingDigits Number of digits for CloudPBX numbering plan. If a numberingPrefix is provided, this parameter is mandatory.
	     * For example, if numberingPrefix is 8 and numberingDigits is 4, allowed numbers for this CloudPBX will be from 8000 to 8999.
	     * @param {number} numberingPrefix Prefix for CloudPBX numbering plan
	     * @param {number} outgoingPrefix Company outgoing prefix
	     * @param {boolean} routeInternalCallsToPeer Indicates if internal calls must be routed to peer (Only available if 'routeInternalCallsToPeerAllowed' is set to 'true' on external trunk)
	     * @description
	     *      This API allows to update a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    updateCloudPBX(systemId: any, barringOptions_permissions: string, barringOptions_restrictions: string, callForwardOptions_externalCallForward: string, customSipHeader_1: string, customSipHeader_2: string, emergencyOptions_callAuthorizationWithSoftPhone: boolean, emergencyOptions_emergencyGroupActivated: boolean, externalTrunkId: string, language: string, name: string, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBX
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to delete a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBX(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPbxs
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @description
	     *      This API allows administrator to retrieve a list of CloudPBXs. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPbxs(limit: number, offset: number, sortField: string, sortOrder: number, companyId: string, bpId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createACloudPBX
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} bpId Identifier of the BP to which CloudPBX should be linked with.
	     * @param {string} companyId Required Identifier of the company for which CloudPBX should be created.
	     * @param {string} customSipHeader_1 Value to put as CustomSipHeader_1 into SIP data for an external outgoing call.
	     * @param {string} customSipHeader_2 Value to put as CustomSipHeader_2 into SIP data for an external outgoing call.
	     * @param {string} externalTrunkId External trunk identifier that should be linked to this CloudPBX.
	     * @param {string} language Associated language for this CloudPBX. Values : "ro" "es" "it" "de" "ru" "fr" "en" "ar" "he" "nl".  default : "en".
	     * @param {string} name CloudPBX name. If not provided, will be something like 'cloud_pbx_companyName'.
	     * @param {number} noReplyDelay In case of overflow no reply forward on subscribers, timeout in seconds after which the call will be forwarded. Default 20.
	     * @param {number} numberingDigits Number of digits for CloudPBX numbering plan. If a numberingPrefix is provided, this parameter is mandatory. <br>
	     * For example, if numberingPrefix is 8 and numberingDigits is 4, allowed numbers for this CloudPBX will be from 8000 to 8999.
	     * @param {number} numberingPrefix Prefix for CloudPBX numbering plan.
	     * @param {number} outgoingPrefix Company outgoing prefix.
	     * @param {boolean} routeInternalCallsToPeer Indicates if internal calls must be routed to peer (Only available if 'routeInternalCallsToPeerAllowed' is set to 'true' on external trunk).
	     * @param {string} siteId Identifier of the site on which CloudPBX should be created.
	     * @description
	     *      This API allows to creates a CloudPBX for a given company. <br/>
	     * @return {Promise<any>}
	     */
	    createACloudPBX(bpId: string, companyId: string, customSipHeader_1: string, customSipHeader_2: string, externalTrunkId: string, language: string, name: string, noReplyDelay: number, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean, siteId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXCLIPolicyForOutboundCalls
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve the CloudPBX CLI options for outbound calls using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXCLIPolicyForOutboundCalls(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCloudPBXCLIOptionsConfiguration
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {CLOUDPBXCLIOPTIONPOLICY} policy CLI policy to apply. Values : "installation_ddi_number" or "user_ddi_number".
	     * @description
	     *      This API allows to update a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    updateCloudPBXCLIOptionsConfiguration(systemId: string, policy: CLOUDPBXCLIOPTIONPOLICY): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXlanguages
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve a list of languages supported by a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXlanguages(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXDeviceModels
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve a list of device models supported by a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXDeviceModels(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXTrafficBarringOptions
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve a list of traffic barring options supported by a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXTrafficBarringOptions(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXEmergencyNumbersAndEmergencyOptions
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve Emergency Numbers and Emergency Options supported by a CloudPBX using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method CreateCloudPBXSIPDevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} description Description for identifying the device
	     * @param {number} deviceTypeId Device type Identifier - see API GET /cloudpbxs/:id/devicemodels to get the list of supported models for the CloudPBX.
	     * @param {string} macAddress Device mac address - mandatory for SIP deskphone device
	     * @description
	     *      This API allows allows to create a new SIP device into a CloudPBX. This SIP device can then be assigned to an existing subscriber. <br/>
	     * @return {Promise<any>}
	     */
	    CreateCloudPBXSIPDevice(systemId: string, description: string, deviceTypeId: string, macAddress: string): Promise<unknown>;
	    /**
	     * @public
	     * @method factoryResetCloudPBXSIPDevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device to be reset
	     * @description
	     *      This API allows to reset a SIP deskphone device to its factory settings.<br/>
	     *      Be aware that the device will no longer be operational, and should, after the factory reset, need to be manually configured (e.g. at least auto provisioning Url will need to be set). <br/>
	     * @return {Promise<any>}
	     */
	    factoryResetCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSIPDeviceById
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device to get
	     * @description
	     *      This API allows to retrieve a SIP device using the given deviceId.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSIPDeviceById(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBXSIPDevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device to delete
	     * @description
	     *      This API allows to remove a SIP Device from a CloudPBX. To do so, the SIP device must no longer be associated to a subscriber.<br/>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCloudPBXSIPDevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} description new description
	     * @param {string} deviceId Unique identifier of the SIP device to delete
	     * @param {string} macAddress new device mac address
	     * @description
	     *      This API allows to update a SIP device.<br/>
	     * @return {Promise<any>}
	     */
	    updateCloudPBXSIPDevice(systemId: string, description: string, deviceId: string, macAddress: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllCloudPBXSIPDevice
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {number} limit Allow to specify the number of SIP Devices to retrieve.
	     * @param {number} offset Allow to specify the position of first SIP Device to retrieve (first one if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort SIP Devices list based on the given field.
	     * @param {number} sortOrder Specify order when sorting SIP Devices list. Valid values are -1, 1.
	     * @param {boolean} assigned Allows to filter devices according their assignment to a subscriber
	     *      false, allows to obtain all devices not yet assigned to a subscriber.
	     *      true, allows to obtain all devices already assigned to a subscriber.
	     *      if undefined ; all devices whatever their assignment status are returned
	     * @param {string} phoneNumberId Allows to filter devices according their phoneNumberId (i.e. subscriber id)
	     *      This parameter can be a list of phoneNumberId separated by a space (space has to be encoded)
	     * @async
	     * @description
	     *      This API allows  to retrieve all SIP devices assigned into a CloudPBX.<br/>
	     * @return {Promise<any>}
	     */
	    getAllCloudPBXSIPDevice(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, assigned: boolean, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSIPRegistrationsInformationDevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device for which SIP registrations information should be retrieved.
	     * @description
	     *      This API allows to retrieve SIP registrations information relative to a device.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSIPRegistrationsInformationDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method grantCloudPBXAccessToDebugSession
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device for which the debug session access will be granted.
	     * @param {string} duration Duration, in seconds, of the debug session - Only superadmin can set a debug duration different from the default one (configuration parameter: e.g. 30 minutes)
	     * @description
	     *      This API allows  to grant access to debug session on the given device.<br/>
	     *      When debug session is granted on the device, admins can retrieve the admin password of the device, url to access the device admin page and also initiate ssh session with the device. <br/>
	     *      A debug session can be terminated by: <br/>
	     *      Calling the device revoke API <br/>
	     *      After debug session has timed out, a periodic check is performed by the portal to revoke expired debug sessions (periodicity defined by configuration parameter). <br/>
	     *
	     *      During debug session, adminUrl and adminPassword of the device can be retrieved by getting device information.  <br/>
	     *      Please note that adminUrl could be unreachable depending on network configuration. <br/>
	     *      When a debug session is closed, ssh access to the device is deactivated, and the admin password of the device is modified.<br/>
	     * @return {Promise<any>}
	     */
	    grantCloudPBXAccessToDebugSession(systemId: string, deviceId: string, duration: string): Promise<unknown>;
	    /**
	     * @public
	     * @method revokeCloudPBXAccessFromDebugSession
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device access will be revoked
	     * @description
	     *      This API allows  to revoke access to debug session on the given device. <br/>
	     *      When revoked, the debug session can no longer be used. <br/>
	     *      The admin password is no longer visible (changed). <br/>
	     * @return {Promise<any>}
	     */
	    revokeCloudPBXAccessFromDebugSession(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method rebootCloudPBXSIPDevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device access will be revoked
	     * @description
	     *      This API allows  to reboot a SIP deskphone device. <br/>
	     * @return {Promise<any>}
	     */
	    rebootCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSubscriber
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id).
	     * @description
	     *      This API allows to get data of a CloudPBX Subscriber.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBXSubscriber
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id).
	     * @description
	     *      This API allows to delete a CloudPBX Subscriber. All its associated SIP devices become free for other subscribers.<br/>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBXSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createCloudPBXSubscriberRainbowUser
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} login SIP username (if not provided ; shortNumber is used as SIP username)
	     * @param {string} password SIP password for all associated SIP devices (if not provided ; it will be automatically generated).
	     * Only lowercases, digits, * and # are authorized characters. Minimum length is 8, maximum is 12
	     * @param {string} shortNumber Internal Number of the new CloudPBX Subscriber
	     * @param {string} userId Unique identifier of the associated Rainbow User
	     * @description
	     *      This API allows to create a new CloudPBX Subscriber for a Rainbow User.<br/>
	     *      This new subscriber will appear as a new entry into "phoneNumbers" list of the targeted Rainbow User.<br/>
	     * @return {Promise<any>}
	     */
	    createCloudPBXSubscriberRainbowUser(systemId: string, login: string, password: string, shortNumber: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSIPdeviceAssignedSubscriber
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber associated to the SIP device to retrieve.
	     * @param {string} deviceId Unique identifier of the SIP device to retrieve
	     * @description
	     *      This API allows to retrieve a given SIP device assigned to a subscriber.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSIPdeviceAssignedSubscriber(systemId: string, phoneNumberId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method removeCloudPBXAssociationSubscriberAndSIPdevice
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber on which the Sip device association must be deleted.
	     * @param {string} deviceId Unique identifier of the SIP device to free
	     * @description
	     *      This API allows to remove association between subscriber and the Sip Device (SIP device becomes available for another subscriber).<br/>
	     * @return {Promise<any>}
	     */
	    removeCloudPBXAssociationSubscriberAndSIPdevice(systemId: string, phoneNumberId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXAllSIPdevicesAssignedSubscriber
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {number} limit Allow to specify the number of SIP Devices to retrieve.
	     * @param {number} offset Allow to specify the position of first SIP Device to retrieve (first one if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort SIP Devices list based on the given field.
	     * @param {number} sortOrder Specify order when sorting SIP Devices list. Valid values are -1, 1.
	     * @param {string} phoneNumberId Allows to filter devices according their phoneNumberId (i.e. subscriber id)
	     * @async
	     * @description
	     *      This API allows  to retrieve all SIP devices assigned to a subscriber.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXAllSIPdevicesAssignedSubscriber(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXInfoAllRegisteredSIPdevicesSubscriber
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber for which all SIP registrations must be retrieved
	     * @async
	     * @description
	     *      This API allows to retrieve registrations info on all devices registered for a subscriber.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method assignCloudPBXSIPDeviceToSubscriber
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber on which the SIP device must be assigned
	     * @param {string} deviceId Unique identifier of the device to assign
	     * @param {string} macAddress device mac address
	     * @description
	     *      This API allows to assign a SIP device to a CloudPBX Subscriber.<br/>
	     *      The device must have been previously created.<br/>
	     *      Assigning a device to a subscriber can de done by specifying the device Id (preferred) in the request, or the device mac address.<br/>
	     *      Assigning a device to a subscriber can de done by specifying the device Id in the request, or the device mac address and deviceType Id.<br/>
	     * @return {Promise<any>}
	     */
	    assignCloudPBXSIPDeviceToSubscriber(systemId: string, phoneNumberId: string, deviceId: string, macAddress: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSubscriberCLIOptions
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id)
	     * @async
	     * @description
	     *      This API allows to get CLI policy of a CloudPBX Subscriber.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSubscriberCLIOptions(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXUnassignedInternalPhonenumbers
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @async
	     * @description
	     *      This API allows to list all unassigned internal phone numbers for a given CloudPBX system.<br/>
	     * @return {Promise<any>}
	     */
	    getCloudPBXUnassignedInternalPhonenumbers(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method listCloudPBXDDINumbersAssociated
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {number} limit Allow to specify the number of DDI numbers to retrieve. Default : 100.
	     * @param {number} offset Allow to specify the position of first DDI number to retrieve (first site if not specified)
	     * Warning: if offset > total, no results are returned
	     * @param {string} sortField Sort DDI numbers list based on the given field. Default : "number"
	     * @param {number} sortOrder Specify order when sorting DDI numbers list. Default : 1. Valid values : -1, 1.
	     * @param {boolean} isAssignedToUser Allows to filter DDI numbers list if they are assigned to a user or not
	     * @param {boolean} isAssignedToGroup Allows to filter DDI numbers list if they are assigned to a group or not (e.g. hunting group)
	     * @param {boolean} isAssignedToIVR Allows to filter DDI numbers list if they are assigned to a IVR or not
	     * @param {boolean} isAssignedToAutoAttendant Allows to filter DDI numbers list if they are assigned to a Auto attendant or not
	     * @param {boolean} isAssigned Allows to filter DDI numbers list if they are assigned (to a user or to a group or to a IVR) or not assigned
	     * @async
	     * @description
	     *      This API allows to get the list of DDI numbers associated to a CloudPBX.<br/>
	     * @return {Promise<any>}
	     */
	    listCloudPBXDDINumbersAssociated(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, isAssignedToUser: boolean, isAssignedToGroup: boolean, isAssignedToIVR: boolean, isAssignedToAutoAttendant: boolean, isAssigned: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method createCloudPBXDDINumber
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} number DDI number
	     * @async
	     * @description
	     *      This API allows to create a DDI number for a CloudPBX.<br/>
	     * @return {Promise<any>}
	     */
	    createCloudPBXDDINumber(systemId: string, number: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBXDDINumber
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier
	     * @async
	     * @description
	     *      This API allows to delete a DDI number for a CloudPBX. <br/>
	     *      Note : Default DDI can be deleted only if it is the last DDI of the CloudPBX. <br/>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBXDDINumber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method associateCloudPBXDDINumber
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier
	     * @param {string} userId Rainbow user unique identifier
	     * @async
	     * @description
	     *      This API allows to associate a DDI number to a Rainbow user. <br/>
	     * @return {Promise<any>}
	     */
	    associateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method disassociateCloudPBXDDINumber
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier.
	     * @param {string} userId Rainbow user unique identifier.
	     * @async
	     * @description
	     *      This API allows to disassociate a DDI number from a Rainbow user. <br/>
	     * @return {Promise<any>}
	     */
	    disassociateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method setCloudPBXDDIAsdefault
	     * @since 2.0.2
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier.
	     * @async
	     * @description
	     *      This API allows to set a DDI number as default DDI for a CloudPBX. <br/>
	     * @return {Promise<any>}
	     */
	    setCloudPBXDDIAsdefault(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveExternalSIPTrunkById
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} externalTrunkId External trunk unique identifier
	     * @description
	     *      This API allows to retrieve an external SIP trunk using its identifier. <br/>
	     * @return {Promise<any>}
	     */
	    retrieveExternalSIPTrunkById(externalTrunkId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrievelistExternalSIPTrunks
	     * @since 2.0.2
	     * @instance
	     * @async
	     * @param {string} rvcpInstanceId Allows to filter external SIP trunks by RVCP instance identifier. <br/>
	     *          This filter allows to load all external SIP trunks in relation with an RVCP Instance. <br/>
	     * @param {string} status Allows to filter external SIP trunks by status. <br/>
	     *          This filter allows to load all external SIP trunks according to their status. <br/>
	     *          Valid values : "new" "active". <br/>
	     * @param {string} trunkType Allows to filter external SIP trunks by their type. <br/>
	     * @description
	     *      This API allows superadmin or bp_admin to retrieve a list of external SIP trunks. <br/>
	     *      bp_admin can list only external SIP trunks he is allowed to use. <br/>
	     * @return {Promise<any>}
	     */
	    retrievelistExternalSIPTrunks(rvcpInstanceId: string, status: string, trunkType: string): Promise<unknown>;
	}
	export { Admin as AdminService, OFFERTYPES, CLOUDPBXCLIOPTIONPOLICY };

}
declare module 'lib/common/StateManager' {
	export {}; enum SDKSTATUSENUM {
	    "STARTED" = "started",
	    "STARTING" = "starting",
	    "CONNECTED" = "connected",
	    "READY" = "ready",
	    "STOPPED" = "stopped",
	    "DISCONNECTED" = "disconnected",
	    "RECONNECTING" = "reconnecting",
	    "FAILED" = "failed",
	    "ERROR" = "error"
	} class StateManager {
	    eventEmitter: any;
	    logger: any;
	    state: any;
	    constructor(_eventEmitter: any, logger: any);
	    start(): Promise<unknown>;
	    stop(): Promise<unknown>;
	    transitTo(state: any, data?: any): Promise<unknown>;
	    get STOPPED(): SDKSTATUSENUM;
	    get CONNECTED(): SDKSTATUSENUM;
	    get STARTED(): SDKSTATUSENUM;
	    get STARTING(): SDKSTATUSENUM;
	    get DISCONNECTED(): SDKSTATUSENUM;
	    get RECONNECTING(): SDKSTATUSENUM;
	    get READY(): SDKSTATUSENUM;
	    get FAILED(): SDKSTATUSENUM;
	    get ERROR(): SDKSTATUSENUM;
	    isSTOPPED(): boolean;
	    isCONNECTED(): boolean;
	    isSTARTED(): boolean;
	    isSTARTING(): boolean;
	    isDISCONNECTED(): boolean;
	    isRECONNECTING(): boolean;
	    isREADY(): boolean;
	    isFAILED(): boolean;
	    isERROR(): boolean;
	}
	export { StateManager, SDKSTATUSENUM };

}
declare module 'lib/connection/XMPPServiceHandler/calllogEventHandler' {
	import { XMPPService } from 'lib/connection/XMPPService';
	export {};
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class CallLogEventHandler extends GenericHandler {
	    MESSAGE: any;
	    IQ_RESULT: any;
	    IQ_ERROR: any;
	    IQ_CALLLOG: any;
	    CALLLOG_ACK: any;
	    IQ_CALLOG_NOTIFICATION: any;
	    calllogService: any;
	    contactService: any;
	    profileService: any;
	    telephonyService: any;
	    callLogsPromises: any;
	    calllogs: any;
	    callLogs: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, calllogService: any, contactService: any, profileService: any, telephonyService: any);
	    onIqCallLogReceived(msg: any, stanza: any): boolean;
	    onCallLogAckReceived(msg: any, stanza: any): boolean;
	    onIqCallLogNotificationReceived(msg: any, stanza: any): Promise<boolean>;
	    /**
	     * Method isMediaPillarJid
	     * @public
	     * @param {string} fromJid the from jid
	     * @returns {boolean} true if it is the media pillar Jid
	     * @memberof WebrtcGatewayService
	     */
	    isMediaPillarJid(fromJid: any): boolean;
	    removeCallLogsForUser(jid: any): void;
	    createCallLogFromMessage(message: any): Promise<any>;
	    logAlreadyExists(log: any): boolean;
	    orderCallLogsFunction(): any;
	    getMissedCallLogCounter(): number;
	    callLogAckUpdate(id: any): void;
	    simplifyCallLogs(callLogs: any): any[];
	    resetCallLogs(): Promise<void>;
	    fusionInformation(callLogs: any): any[];
	}
	export { CallLogEventHandler };

}
declare module 'lib/services/CallLogService' {
	/// <reference types="node" />
	import { GenericService } from 'lib/services/GenericService';
	export {};
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core'; class CallLogService extends GenericService {
	    private calllogs;
	    private callLogHandlerRef;
	    private callLogMessageAckRef;
	    private callLogNotificationRef;
	    private callLogsHistory;
	    private telephonyCallLog;
	    private telephonyCallLogHistory;
	    private deferedObject;
	    private callLogComplete;
	    private callLogIndex;
	    private calllogHandlerToken;
	    private _contacts;
	    private _profiles;
	    private _calllogEventHandler;
	    private _telephony;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<void>;
	    stop(): Promise<void>;
	    init(): Promise<void>;
	    attachHandlers(): void;
	    /*********************************************************/
	    /**       MAM REQUESTS                                  **/
	    /*********************************************************/
	    getCallLogHistoryPage(useAfter?: any): Promise<any>;
	    /*********************************************************/
	    /**                     API                             **/
	    /*********************************************************/
	    /**
	     * @public
	     * @method getAll
	     * @instance
	     * @description
	     *    Get all calls log history for the connected user <br/>
	     * @return {CallLog[]} An array of call log entry
	     */
	    getAll(): any[];
	    /**
	     * @public
	     * @method getMissedCallLogCounter
	     * @instance
	     * @description
	     *    Get the number of call missed (state === "missed" && direction === "incoming") <br/>
	     * @return {Number} The number of call missed
	     */
	    getMissedCallLogCounter(): number;
	    /**
	     * @public
	     * @method deleteOneCallLog
	     * @instance
	     * @description
	     *    Delete a call log from it's id<br/>
	     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br/>
	     * @param {string} id The call log id to remove
	     * @return Nothing
	     */
	    deleteOneCallLog(id: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCallLogsForContact
	     * @instance
	     * @description
	     *    Delete all calls log items associated to a contact's given jid<br/>
	     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br/>
	     * @param {string} jid The call log id to remove
	     * @return Nothing
	     */
	    deleteCallLogsForContact(jid: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAllCallLogs
	     * @instance
	     * @description
	     *    Delete all call logs history<br/>
	     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br/>
	     * @return Nothing
	     */
	    deleteAllCallLogs(): Promise<any>;
	    /**
	     * @public
	     * @method markCallLogAsRead
	     * @instance
	     * @description
	     *    Mark a call log item as read<br/>
	     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished <br/>
	     * @param {string} id The call log id
	     * @return Nothing
	     */
	    markCallLogAsRead(id: any): Promise<unknown>;
	    /**
	     * @public
	     * @method markAllCallsLogsAsRead
	     * @instance
	     * @description
	     *    Mark all call log items as read<br/>
	     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished <br/>
	     * @return Nothing
	     */
	    markAllCallsLogsAsRead(): Promise<void>;
	    /**
	     * @public
	     * @method isInitialized
	     * @instance
	     * @description
	     *    Check if the call log history has been received from Rainbow <br/>
	     *    A false answer means that the call logs have not yet been retrieved from the server. <br/>
	     * @return {Boolean} True if the call logs have been retrieved. False elsewhere.
	     */
	    isInitialized(): boolean;
	    /*********************************************************/
	    /**                  EVENT HANDLERS                     **/
	    /*********************************************************/
	    onCallLogUpdated(calllogs: any): Promise<void>;
	    onCallLogAckReceived(calllogs: any): Promise<void>;
	    /*********************************************************/
	    /**                  HELPER FUNCTIONS                   **/
	    /*********************************************************/
	    getOrderByNameCallLogs(): any[];
	    getOrderByDateCallLogs(): any[];
	    getOrderByNameCallLogsBruts(): any[];
	    getOrderByDateCallLogsBruts(): any[];
	    getSimplifiedCallLogs(): any[];
	    getNumberMissedCalls(): number;
	    resetCallLogs(): Promise<void>;
	}
	export { CallLogService };

}
declare module 'lib/common/Events' {
	/// <reference types="node" />
	export {};
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { Logger } from 'lib/common/Logger'; class Events {
	    get logEmitter(): EventEmitter;
	    set logEmitter(value: EventEmitter);
	    _logger: Logger;
	    _filterCallback: Function;
	    _evReceiver: EventEmitter;
	    _evPublisher: EventEmitter;
	    _core: Core;
	    private _logEmitter;
	    constructor(_logger: Logger, _filterCallback: Function);
	    get iee(): EventEmitter;
	    get eee(): EventEmitter;
	    /**
	     * @method onLog
	     * @public
	     * @memberof Events
	     * @instance
	     * @param {string} event The event name to subscribe
	     * @param {function} callback The function called when the even is fired
	     * @return {Object} The events instance to be able to chain subscriptions
	     * @description
	     *      Subscribe to an event raised when a log is done.
	     */
	    onLog(event: any, callback: any): EventEmitter;
	    /**
	     * @method removeLogListener
	     * @public
	     * @memberof Events
	     * @instance
	     * @param {string} event The event name to unsubscribe
	     * @param {function} callback The function called when the even is fired
	     * @return {Object} The events instance to be able to chain subscriptions
	     * @description
	     *      Unsubscribe to an event raised when a log is done.
	     */
	    removeLogListener(event: any, callback: any): EventEmitter;
	    /**
	     * @method on
	     * @public
	     * @memberof Events
	     * @instance
	     * @param {string} event The event name to subscribe
	     * @param {function} callback The function called when the even is fired
	     * @return {Object} The events instance to be able to chain subscriptions
	     * @description
	     *      Subscribe to an event
	     */
	    on(event: any, callback: any): EventEmitter;
	    /**
	     * @method once
	     * @public
	     * @memberof Events
	     * @instance
	     * @param {string} event The event name to subscribe
	     * @param {function} callback The function called when the even is fired
	     * @return {Object} The events instance to be able to chain subscriptions
	     * @description
	     *      Subscribe to an event only one time (fired only the first time)
	     */
	    once(event: string, callback: (...args: any[]) => void): EventEmitter;
	    publish(event: string, data: any): void;
	    /**
	     * @method publishEvent
	     * @private
	     * @memberof Events
	     * @instance
	     * @param {...*} args all arguments for the event
	     * @return nothing
	     * @description
	     *      Add "rainbow_on" prefix to event name, print it human readable, and raises it.
	     */
	    publishEvent(...args: any[]): void;
	    setCore(_core: Core): void;
	}
	export { Events };

}
declare module 'lib/config/Options' {
	import { Logger } from 'lib/common/Logger';
	export {};
	import { DataStoreType } from 'lib/config/config'; class Options {
	    _logger: Logger;
	    _options: any;
	    _hasCredentials: any;
	    _hasApplication: any;
	    _httpOptions: any;
	    _xmppOptions: any;
	    _s2sOptions: any;
	    _proxyoptions: any;
	    _imOptions: any;
	    _applicationOptions: any;
	    _withXMPP: any;
	    _withS2S: any;
	    _CLIMode: any;
	    _servicesToStart: any;
	    private _testOutdatedVersion;
	    private _concurrentRequests;
	    private _intervalBetweenCleanMemoryCache;
	    private _requestsRate;
	    constructor(_options: any, _logger: Logger);
	    parse(): void;
	    get testOutdatedVersion(): boolean;
	    set testOutdatedVersion(value: boolean);
	    get intervalBetweenCleanMemoryCache(): number;
	    set intervalBetweenCleanMemoryCache(value: number);
	    get servicesToStart(): any;
	    get httpOptions(): any;
	    get xmppOptions(): any;
	    get s2sOptions(): any;
	    get proxyOptions(): any;
	    get imOptions(): any;
	    get applicationOptions(): any;
	    get hasCredentials(): any;
	    get hasApplication(): any;
	    get useXMPP(): any;
	    get useS2S(): any;
	    get useCLIMode(): any;
	    get credentials(): any;
	    get concurrentRequests(): number;
	    get requestsRate(): {
	        "maxReqByIntervalForRequestRate": number;
	        "intervalForRequestRate": number;
	        "timeoutRequestForRequestRate": number;
	    };
	    _gettestOutdatedVersion(): any;
	    _getintervalBetweenCleanMemoryCache(): any;
	    _getservicesToStart(): {};
	    _isOfficialRainbow(): boolean;
	    _getHTTPOptions(): {
	        host: string;
	        port: string;
	        protocol: string;
	    };
	    _getXMPPOptions(): {
	        host: string;
	        port: string;
	        protocol: string;
	        timeBetweenXmppRequests: string;
	    };
	    _getS2SOptions(): {
	        hostCallback: string;
	        locallistenningport: string;
	    };
	    _getModeOption(): string;
	    _getRequestsRateOption(): {
	        maxReqByIntervalForRequestRate: number;
	        intervalForRequestRate: number;
	        timeoutRequestForRequestRate: number;
	    };
	    _getProxyOptions(): {
	        protocol: string;
	        host: string;
	        port: number;
	        user: any;
	        password: any;
	        secureProtocol: any;
	    };
	    _getIMOptions(): {
	        sendReadReceipt: boolean;
	        messageMaxLength: number;
	        sendMessageToConnectedUser: boolean;
	        conversationsRetrievedFormat: string;
	        storeMessages: boolean;
	        copyMessage: boolean;
	        nbMaxConversations: number;
	        rateLimitPerHour: number;
	        messagesDataStore: DataStoreType;
	        autoInitialBubblePresence: boolean;
	        autoLoadConversations: boolean;
	        autoLoadContacts: boolean;
	    };
	    _getApplicationsOptions(): {
	        appID: string;
	        appSecret: string;
	    };
	}
	export { Options };

}
declare module 'lib/connection/XMPPServiceHandler/alertEventHandler' {
	export {};
	import { XMPPService } from 'lib/connection/XMPPService';
	import { AlertsService } from 'lib/services/AlertsService';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class AlertEventHandler extends GenericHandler {
	    MESSAGE_CHAT: any;
	    MESSAGE_GROUPCHAT: any;
	    MESSAGE_WEBRTC: any;
	    MESSAGE_MANAGEMENT: any;
	    MESSAGE_ERROR: any;
	    MESSAGE_HEADLINE: any;
	    MESSAGE_CLOSE: any;
	    alertsService: any;
	    private _options;
	    private _xmpp;
	    private alertsMessagePoolReceived;
	    private lockEngine;
	    private lockKey;
	    findAttrs: any;
	    findChildren: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, alertsService: AlertsService, options: any);
	    lock(fn: any): any;
	    onManagementMessageReceived(msg: any, stanza: any): void;
	    onHeadlineMessageReceived(msg: any, stanza: any): void;
	    onNotificationManagementMessageReceived(stanza: any): boolean;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): void;
	}
	export { AlertEventHandler };

}
declare module 'lib/common/models/Alert' {
	import { IDictionary } from 'ts-generic-collections-linq';
	export {}; class Alert {
	    id: string;
	    name: string;
	    description: string;
	    status: string;
	    templateId: string;
	    filterId: string;
	    companyId: string;
	    startDate: string;
	    expirationDate: string;
	    constructor(name?: string, description?: string, status?: string, templateId?: string, filterId?: string, companyId?: string, startDate?: string, expirationDate?: string);
	} class AlertsData {
	    get size(): number;
	    set size(value: number);
	    get alerts(): IDictionary<string, Alert>;
	    set alerts(value: IDictionary<string, Alert>);
	    private _alerts;
	    total: number;
	    limit: number;
	    offset: number;
	    private _size;
	    private lockEngine;
	    private lockKey;
	    constructor(limit?: number);
	    lock(fn: any): any;
	    addAlert(alert: Alert): Promise<Alert>;
	    removeBubbleToJoin(alert: Alert): Promise<any>;
	    getAlert(): Promise<Alert>;
	    first(): Promise<Alert>;
	    last(): Promise<Alert>;
	}
	export { Alert, AlertsData };

}
declare module 'lib/common/models/AlertDevice' {
	export {};
	import { IDictionary, List } from 'ts-generic-collections-linq'; class AlertDevice {
	    id: string;
	    name: string;
	    type: string;
	    userId: string;
	    companyId: string;
	    jid_im: string;
	    jid_resource: string;
	    creationDate: string;
	    ipAddresses: List<string>;
	    macAddresses: List<string>;
	    tags: List<string>;
	    geolocation: string;
	    domainUsername: string;
	    constructor(id?: string, name?: string, type?: string, userId?: string, companyId?: string, jid_im?: string, jid_resource?: string, creationDate?: string, ipAddresses?: List<string>, macAddresses?: List<string>, tags?: List<string>, geolocation?: string, domainUsername?: string);
	} class AlertDevicesData {
	    private alertDevices;
	    total: number;
	    limit: number;
	    offset: number;
	    private lockEngine;
	    private lockKey;
	    constructor(limit?: number);
	    lock(fn: any): any;
	    addAlertDevice(alertDevice: AlertDevice): Promise<AlertDevice>;
	    removeBubbleToJoin(alertDevice: AlertDevice): Promise<any>;
	    getAlertDevice(): Promise<AlertDevice>;
	    first(): Promise<AlertDevice>;
	    last(): Promise<AlertDevice>;
	    getAlertDevices(): IDictionary<string, AlertDevice>;
	}
	export { AlertDevice, AlertDevicesData };

}
declare module 'lib/common/models/AlertTemplate' {
	export {}; class AlertTemplate {
	    id: string;
	    name: string;
	    companyId: string;
	    event: string;
	    description: string;
	    mimeType: string;
	    senderName: string;
	    headline: string;
	    instruction: string;
	    contact: string;
	    type: string;
	    status: string;
	    scope: string;
	    category: string;
	    urgency: string;
	    severity: string;
	    certainty: string;
	    constructor(id?: string, name?: string, companyId?: string, event?: string, description?: string, mimeType?: string, senderName?: string, headline?: string, instruction?: string, contact?: string, type?: string, status?: string, scope?: string, category?: string, urgency?: string, severity?: string, certainty?: string);
	} class AlertTemplatesData {
	    private alertTemplates;
	    total: number;
	    limit: number;
	    offset: number;
	    private lockEngine;
	    private lockKey;
	    constructor(limit?: number);
	    lock(fn: any): any;
	    addAlertTemplate(alertTemplate: AlertTemplate): Promise<AlertTemplate>;
	    removeBubbleToJoin(alertTemplate: AlertTemplate): Promise<any>;
	    getAlertTemplate(): Promise<AlertTemplate>;
	    first(): Promise<AlertTemplate>;
	    last(): Promise<AlertTemplate>;
	}
	export { AlertTemplate, AlertTemplatesData };

}
declare module 'lib/services/AlertsService' {
	/// <reference types="node" />
	import { Logger } from 'lib/common/Logger';
	export {};
	import { Alert, AlertsData } from 'lib/common/models/Alert';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { AlertDevice, AlertDevicesData } from 'lib/common/models/AlertDevice';
	import { AlertTemplate, AlertTemplatesData } from 'lib/common/models/AlertTemplate';
	import { AlertFilter, AlertFiltersData } from 'lib/common/models/AlertFilter';
	import { GenericService } from 'lib/services/GenericService'; class AlertsService extends GenericService {
	    private _alertEventHandler;
	    private _alertHandlerToken;
	    private readonly delayToSendReceiptReceived;
	    private readonly delayToSendReceiptRead;
	    private delayInfoLoggued;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<void>;
	    stop(): Promise<void>;
	    init(): Promise<void>;
	    private attachHandlers;
	    reconnect(): Promise<void>;
	    /**
	     * @private
	     * @method markAlertMessageAsReceived
	     * @instance
	     * @async
	     * @param {string} jid The Jid of the sender</param>
	     * @param {string} messageXmppId the Xmpp Id of the alert message</param>
	     * @description
	     *    Mark as Received the specified alert message   <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    markAlertMessageAsReceived(jid: string, messageXmppId: string): Promise<any>;
	    /**
	     * @public
	     * @method markAlertMessageAsRead
	     * @instance
	     * @async
	     * @param {string} jid The Jid of the sender
	     * @param {string} messageXmppId the Xmpp Id of the alert message
	     * @description
	     *    Mark as Read the specified alert message   <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    markAlertMessageAsRead(jid: string, messageXmppId: string): Promise<any>;
	    /**
	     * @public
	     * @method createDevice
	     * @instance
	     * @async
	     * @param {AlertDevice} device Device to create.
	     * @description
	     *    Create a device which can receive Alerts(notifications) from the server   <br/>
	     *    AlertDevice.jid_im cannot be specified, it's always the Jid of the current user. <br/>
	     *    if AlertDevice.jid_resource cannot be specified, it's always the Jid_resource of the current user. <br/>
	     *    if AlertDevice.type is not specified, automatically it's set to "desktop" <br/>
	     * @return {Promise<AlertDevice>} the result of the operation.
	     * @category async
	     */
	    createDevice(device: AlertDevice): Promise<AlertDevice>;
	    /**
	     * @public
	     * @method updateDevice
	     * @instance
	     * @async
	     * @param {AlertDevice} device Device to Update.
	     * @description
	     *    Update a device which can receive Alerts(notifications) from the server <br/>
	     *    AlertDevice.CompanyId cannot be specified, it's always the Compnay of the current user <br/>
	     *    AlertDevice.Jid_im cannot be specified, it's always the Jid of the current user: Contacts.GetCurrentContactJid() <br/>
	     *    AlertDevice.Jid_resource cannot be specified, it's always the Jid_resource of the current user: Application.GetResourceId() <br/>
	     *    if AlertDevice.Type is not specified, automatically it's set to "desktop"     <br/>
	     * @return {Promise<AlertDevice>} the result of the operation.   <br/>
	     * @category async
	     */
	    updateDevice(device: AlertDevice): Promise<AlertDevice>;
	    private createOrUpdateDevice;
	    /**
	     * @public
	     * @method deleteDevice
	     * @instance
	     * @async
	     * @param {AlertDevice} device Device to delete.
	     * @description
	     *    Delete a device (using its id) <br/>
	     * @return {Promise<AlertDevice>} the result of the operation.
	     * @category async
	     */
	    deleteDevice(device: AlertDevice): Promise<AlertDevice>;
	    /**
	     * @public
	     * @method getDevice
	     * @instance
	     * @async
	     * @param {string} deviceId Id of the device.
	     * @description
	     *    Get a device using its Id <br/>
	     * @return {Promise<AlertDevice>} the result of the operation.
	     * @category async
	     */
	    getDevice(deviceId: string): Promise<AlertDevice>;
	    /**
	     * @public
	     * @method getDevices
	     * @instance
	     * @async
	     * @param {string} companyId Allows to filter device list on the companyId provided in this option. (optional) If companyId is not provided, the devices linked to all the companies that the administrator manage are returned.
	     * @param {string} userId Allows to filter device list on the userId provided in this option. (optional) If the user has no admin rights, this filter is forced to the logged in user's id (i.e. the user can only list is own devices).
	     * @param {string} deviceName Allows to filter device list on the name provided in this option. (optional) The filtering is case insensitive and on partial name match: all devices containing the provided name value will be returned(whatever the position of the match). Ex: if filtering is done on My, devices with the following names are match the filter 'My device', 'My phone', 'This is my device', ...
	     * @param {string} type Allows to filter device list on the type provided in this option. (optional, exact match, case sensitive).
	     * @param {string} tag Allows to filter device list on the tag provided in this option. (optional, exact match, case sensitive).
	     * @param {number} offset Allow to specify the position of first device to retrieve (default value is 0 for the first device). Warning: if offset > total, no results are returned.
	     * @param {number} limit Allow to specify the number of devices to retrieve.
	     * @description
	     *    Get list of devices   <br/>
	     * @return {Promise<AlertDevicesData>} the result of the operation.
	     * @category async
	     */
	    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset?: number, limit?: number): Promise<AlertDevicesData>;
	    /**
	     * @public
	     * @method getDevicesTags
	     * @instance
	     * @async
	     * @param {string} companyId Allows to list the tags set for devices associated to the companyIds provided in this option. (optional) If companyId is not provided, the tags being set for devices linked to all the companies that the administrator manage are returned.
	     * @description
	     *    Get list of all tags being assigned to devices of the compagnies managed by the administrator <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    getDevicesTags(companyId: string): Promise<any>;
	    /**
	     * @public
	     * @method renameDevicesTags
	     * @instance
	     * @async
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. </br>
	     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
	     * @param {string} newTagName New tag name. (Body Parameters)
	     * @description
	     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    renameDevicesTags(newTagName: string, tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteDevicesTags
	     * @instance
	     * @async
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to remove a tag from the devices being in the companyIds provided in this option.. </br>
	     * If companyId is not provided, the tag is deleted from all the devices linked to all the companies that the administrator manage.
	     * @description
	     * This API can be used to remove a tag being assigned to some devices of the companies managed by the administrator.
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    deleteDevicesTags(tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getstatsTags
	     * @instance
	     * @async
	     * @param {string} companyId Allows to compute the tags statistics for the devices associated to the companyIds provided in this option.  </br>
	     * if companyId is not provided, the tags statistics are computed for all the devices being in all the companies managed by the logged in administrator.
	     * @description
	     * This API can be used to list all the tags being assigned to the devices of the companies managed by the administrator, with the number of devices for each tags.
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    getstatsTags(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createTemplate
	     * @instance
	     * @async
	     * @param {AlertTemplate} template Template to create.
	     * @description
	     *    Create a template <br/>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     * @category async
	     */
	    createTemplate(template: AlertTemplate): Promise<AlertTemplate>;
	    /**
	     * @public
	     * @method updateTemplate
	     * @instance
	     * @async
	     * @param {AlertTemplate} template Template to Update.
	     * @description
	     *    Update a template  <br/>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     * @category async
	     */
	    updateTemplate(template: AlertTemplate): Promise<AlertTemplate>;
	    private createOrUpdateTemplate;
	    /**
	     * @public
	     * @method deleteTemplate
	     * @instance
	     * @async
	     * @param {AlertTemplate} template Template to Delete.
	     * @description
	     *    Delete a template <br/>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     * @category async
	     */
	    deleteTemplate(template: AlertTemplate): Promise<AlertTemplate>;
	    /**
	     * @public
	     * @method getTemplate
	     * @instance
	     * @async
	     * @param {string} templateId Id of the template.
	     * @description
	     *    Get an template by id <br/>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     * @category async
	     */
	    getTemplate(templateId: string): Promise<AlertTemplate>;
	    /**
	     * @public
	     * @method getTemplates
	     * @instance
	     * @async
	     * @param {string} companyId Id of the company (optional).
	     * @param {number} offset Offset to use to retrieve templates - if offset > total, no result is returned.
	     * @param {number} limit Limit of templates to retrieve (100 by default).
	     * @description
	     *    Get templates <br/>
	     * @return {Promise<AlertTemplatesData>} the result of the operation.
	     * @category async
	     */
	    getTemplates(companyId: string, offset?: number, limit?: number): Promise<AlertTemplatesData>;
	    /**
	     * @public
	     * @method createFilter
	     * @instance
	     * @async
	     * @param {AlertFilter} filter Filter to create.
	     * @description
	     *    Create a filter <br/>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     * @category async
	     */
	    createFilter(filter: AlertFilter): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method updateFilter
	     * @instance
	     * @async
	     * @param {AlertFilter} filter Filter to Update.
	     * @description
	     *    Update a filter <br/>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     * @category async
	     */
	    updateFilter(filter: AlertFilter): Promise<AlertFilter>;
	    createOrUpdateFilter(create: boolean, filter: AlertFilter): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method deleteFilter
	     * @instance
	     * @async
	     * @param {AlertFilter} filter Filter to Delete.
	     * @description
	     *    Delete a filter <br/>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     * @category async
	     */
	    deleteFilter(filter: AlertFilter): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method getFilter
	     * @instance
	     * @async
	     * @param {string} filterId Id of the Filter.
	     * @description
	     *    Get an filter by id <br/>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     * @category async
	     */
	    getFilter(filterId: string): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method getFilters
	     * @instance
	     * @async
	     * @param {number} offset Offset to use to retrieve filters - if offset > total, no result is returned.
	     * @param {number} limit Limit of filters to retrieve (100 by default).
	     * @description
	     *    Get filters : have required role(s) superadmin, admin <br/>
	     * @return {Promise<AlertFiltersData>} the result of the operation.
	     * @category async
	     */
	    getFilters(offset?: number, limit?: number): Promise<AlertFiltersData>;
	    /**
	     * @public
	     * @method createAlert
	     * @instance
	     * @async
	     * @param {Alert} alert Alert to send.
	     * @description
	     *    To create an alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future). <br/>
	     *    The alert will be received by devices according the filter id and the company id used.   <br/>
	     *    The content of the alert is based on the template id.   <br/>
	     * @return {Promise<Alert>} the result of the operation.
	     * @category async
	     */
	    createAlert(alert: Alert): Promise<Alert>;
	    /**
	     * @public
	     * @method updateAlert
	     * @instance
	     * @async
	     * @param {Alert} alert Alert to update.
	     * @description
	     *    To update an existing alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future). <br/>
	     *    The alert will be received by devices according the filter id and the company id used.   <br/>
	     *    The content of the alert is based on the template id.   <br/>
	     *    Note : if no expirationDate is provided, then the validity is one day from the API call. <br/>
	     * @return {Promise<Alert>} the result of the operation.
	     * @category async
	     */
	    updateAlert(alert: Alert): Promise<Alert>;
	    createOrUpdateAlert(create: boolean, alert: Alert): Promise<Alert>;
	    /**
	     * @public
	     * @method deleteAlert
	     * @instance
	     * @async
	     * @param {Alert} alert Alert to Delete.
	     * @description
	     *    Delete an alert   <br/>
	     *    All the data related to this notification are deleted, including the reports <br/>
	     * @return {Promise<Alert>} the result of the operation.
	     * @category async
	     */
	    deleteAlert(alert: Alert): Promise<Alert>;
	    /**
	     * @public
	     * @method getAlert
	     * @instance
	     * @async
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Get an alert by id <br/>
	     * @return {Promise<Alert>} the result of the operation.
	     * @category async
	     */
	    getAlert(alertId: string): Promise<Alert>;
	    /**
	     * @public
	     * @method getAlerts
	     * @instance
	     * @async
	     * @param {number} offset Offset to use to retrieve Alerts - if offset > total, no result is returned.
	     * @param {number} limit Limit of Alerts to retrieve (100 by default).
	     * @description
	     *    Get alerts : required role(s) superadmin,support,admin <br/>
	     * @return {Promise<AlertsData>} the result of the operation.
	     * @category async
	     */
	    getAlerts(offset?: number, limit?: number): Promise<AlertsData>;
	    /**
	     * @public
	     * @method sendAlertFeedback
	     * @instance
	     * @async
	     * @param {string} deviceId Id of the device.
	     * @param {string} alertId Id of the alert.
	     * @param {string} answerId Id of the answer.
	     * @description
	     *    To send a feedback from an alert.   <br/>
	     *    To be used by end-user who has received the alert   <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    sendAlertFeedback(deviceId: string, alertId: string, answerId: string): Promise<any>;
	    /**
	     * @public
	     * @method getReportSummary
	     * @instance
	     * @async
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Allow to retrieve the list of summary reports of an alert (initial alert plus alerts update if any). <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    getReportSummary(alertId: string): Promise<any>;
	    /**
	     * @public
	     * @method getReportDetails
	     * @instance
	     * @async
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Allow to retrieve detail the list of detail reports of a alert (initial alert plus alerts update if any). <br/>
	     * @return {Promise<any>} the result of the operation.
	     * @category async
	     */
	    getReportDetails(alertId: string): Promise<any>;
	}
	export { AlertsService };

}
declare module 'lib/Core' {
	/// <reference types="node" />
	export {};
	import { XMPPService } from 'lib/connection/XMPPService';
	import { RESTService } from 'lib/connection/RESTService';
	import { HTTPService } from 'lib/connection/HttpService';
	import { IMService } from 'lib/services/ImsService';
	import { PresenceService } from 'lib/services/PresenceService';
	import { ChannelsService } from 'lib/services/ChannelsService';
	import { ContactsService } from 'lib/services/ContactsService';
	import { ConversationsService } from 'lib/services/ConversationsService';
	import { ProfilesService } from 'lib/services/ProfilesService';
	import { TelephonyService } from 'lib/services/TelephonyService';
	import { BubblesService } from 'lib/services/BubblesService';
	import { GroupsService } from 'lib/services/GroupsService';
	import { AdminService } from 'lib/services/AdminService';
	import { SettingsService } from 'lib/services/SettingsService';
	import { FileServerService } from 'lib/services/FileServerService';
	import { FileStorageService } from 'lib/services/FileStorageService';
	import { SDKSTATUSENUM, StateManager } from 'lib/common/StateManager';
	import { CallLogService } from 'lib/services/CallLogService';
	import { FavoritesService } from 'lib/services/FavoritesService';
	import { InvitationsService } from 'lib/services/InvitationsService';
	import { Events } from 'lib/common/Events';
	import { ProxyImpl } from 'lib/ProxyImpl';
	import { AlertsService } from 'lib/services/AlertsService';
	import { S2SService } from 'lib/services/S2SService'; class Core {
	    _signin: any;
	    _retrieveInformation: any;
	    onTokenRenewed: any;
	    logger: any;
	    _rest: RESTService;
	    onTokenExpired: any;
	    _eventEmitter: Events;
	    _tokenSurvey: any;
	    options: any;
	    _proxy: ProxyImpl;
	    _http: HTTPService;
	    _xmpp: XMPPService;
	    _stateManager: StateManager;
	    _im: IMService;
	    _presence: PresenceService;
	    _channels: ChannelsService;
	    _contacts: ContactsService;
	    _conversations: ConversationsService;
	    _profiles: ProfilesService;
	    _telephony: TelephonyService;
	    _bubbles: BubblesService;
	    _groups: GroupsService;
	    _admin: AdminService;
	    _settings: SettingsService;
	    _fileServer: FileServerService;
	    _fileStorage: FileStorageService;
	    _calllog: CallLogService;
	    _favorites: FavoritesService;
	    _alerts: AlertsService;
	    _invitations: InvitationsService;
	    _botsjid: any;
	    _s2s: S2SService;
	    cleanningClassIntervalID: NodeJS.Timeout;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(options: any);
	    startCleanningInterval(): void;
	    start(token: any): Promise<unknown>;
	    signin(forceStopXMPP: any, token: any): Promise<unknown>;
	    stop(): Promise<unknown>;
	    getConnectionStatus(): Promise<{
	        restStatus: boolean;
	        xmppStatus: boolean;
	        s2sStatus: boolean;
	        state: SDKSTATUSENUM;
	        nbHttpAdded: number;
	        httpQueueSize: number;
	        nbRunningReq: number;
	        maxSimultaneousRequests: number;
	        nbReqInQueue: number;
	    }>;
	    get settings(): SettingsService;
	    get presence(): PresenceService;
	    get profiles(): ProfilesService;
	    get im(): IMService;
	    get invitations(): InvitationsService;
	    get contacts(): ContactsService;
	    get conversations(): ConversationsService;
	    get channels(): ChannelsService;
	    get bubbles(): BubblesService;
	    get groups(): GroupsService;
	    get admin(): AdminService;
	    get fileServer(): FileServerService;
	    get fileStorage(): FileStorageService;
	    get events(): Events;
	    get rest(): RESTService;
	    get state(): any;
	    get version(): any;
	    get telephony(): TelephonyService;
	    get calllog(): CallLogService;
	}
	export { Core };

}
declare module 'lib/NodeSDK' {
	import { Core } from 'lib/Core';
	import { Appreciation } from 'lib/common/models/Channel';
	import { IMService } from 'lib/services/ImsService';
	import { ChannelsService } from 'lib/services/ChannelsService';
	import { S2SService } from 'lib/services/S2SService';
	import { InvitationsService } from 'lib/services/InvitationsService';
	import { FavoritesService } from 'lib/services/FavoritesService';
	import { CallLogService } from 'lib/services/CallLogService';
	import { TelephonyService } from 'lib/services/TelephonyService';
	import { SDKSTATUSENUM } from 'lib/common/StateManager';
	import { SettingsService } from 'lib/services/SettingsService';
	import { RESTService } from 'lib/connection/RESTService';
	import { AdminService } from 'lib/services/AdminService';
	import { FileStorageService } from 'lib/services/FileStorageService';
	import { FileServerService } from 'lib/services/FileServerService';
	import { Events } from 'lib/common/Events';
	import { GroupsService } from 'lib/services/GroupsService';
	import { BubblesService } from 'lib/services/BubblesService';
	import { PresenceService } from 'lib/services/PresenceService';
	import { ConversationsService } from 'lib/services/ConversationsService';
	import { ContactsService } from 'lib/services/ContactsService';
	import { AlertsService } from 'lib/services/AlertsService';
	import { ProfilesService } from 'lib/services/ProfilesService';
	import { DataStoreType } from 'lib/config/config'; class NodeSDK {
	    _core: Core;
	    startTime: Date;
	    static NodeSDK: any;
	    /**
	     * @method constructor
	     * @public
	     * @description
	     *      The entry point of the Rainbow Node SDK.
	     * @param {Object} options SDK Startup options of constructor.
	     * @param {string} options.rainbow.host "official", Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO.
	     * @param {string} options.rainbow.mode "xmpp", The event mode used to receive the events. Can be `xmpp` or `s2s` (default : `xmpp`).
	     * @param {string} options.s2s.hostCallback "http://3d260881.ngrok.io", S2S Callback URL used to receive events on internet.
	     * @param {string} options.s2s.locallistenningport "4000", Local port where the events must be forwarded from S2S Callback Web server.
	     * @param {string} options.credentials.login "user@xxxx.xxx", The Rainbow email account to use.
	     * @param {string} options.credentials.password "XXXXX", The password.
	     * @param {string} options.application.appID "XXXXXXXXXXXXXXXXXXXXXXXXXXXX", The Rainbow Application Identifier.
	     * @param {string} options.application.appSecret "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX", The Rainbow Application Secret.
	     * @param {string} options.proxy.host "xxx.xxx.xxx.xxx", The proxy address.
	     * @param {string} options.proxy.port xxxx, The proxy port.
	     * @param {string} options.proxy.protocol "http", The proxy protocol (note http is used to https also).
	     * @param {string} options.proxy.user "proxyuser", The proxy username.
	     * @param {string} options.proxy.password "XXXXX", The proxy password.
	     * @param {string} options.logs.enableConsoleLogs false, Activate logs on the console.
	     * @param {string} options.logs.enableFileLogs false, Activate the logs in a file.
	     * @param {string} options.logs.enableEventsLogs: false, Activate the logs to be raised from the events service (with `onLog` listener). Used for logs in connection node in red node contrib.
	     * @param {string} options.logs.color true, Activate the ansii color in the log (more humain readable, but need a term console or reader compatible (ex : vim + AnsiEsc module)).
	     * @param {string} options.logs.level "info", The level of logs. The value can be "info", "debug", "warn", "error".
	     * @param {string} options.logs.customLabel "MyRBProject", A label inserted in every lines of the logs. It is usefull if you use multiple SDK instances at a same time. It allows to separate logs in console.
	     * @param {string} options.logs.file.path "c:/temp/", Path to the log file.
	     * @param {string} options.logs.file.customFileName "R-SDK-Node-MyRBProject", A label inserted in the name of the log file.
	     * @param {string} options.logs.file.zippedArchive false Can activate a zip of file. It needs CPU process, so avoid it.
	     * @param {string} options.testOutdatedVersion true, Parameter to verify at startup if the current SDK Version is the lastest published on npmjs.com.
	     * @param {string} options.requestsRate.maxReqByIntervalForRequestRate 600, // nb requests during the interval of the rate limit of the http requests to server.
	     * @param {string} options.requestsRate.intervalForRequestRate 60, // nb of seconds used for the calcul of the rate limit of the rate limit of the http requests to server.
	     * @param {string} options.requestsRate.timeoutRequestForRequestRate 600 // nb seconds Request stay in queue before being rejected if queue is full of the rate limit of the http requests to server.
	     * @param {string} options.im.sendReadReceipt true, Allow to automatically send back a 'read' status of the received message. Usefull for Bots.
	     * @param {string} options.im.messageMaxLength 1024, Maximum size of messages send by rainbow. Note that this value should not be modified without ALE Agreement.
	     * @param {string} options.im.sendMessageToConnectedUser false, Forbid the SDK to send a message to the connected user it self. This is to avoid bot loopback.
	     * @param {string} options.im.conversationsRetrievedFormat "small", Set the size of the conversation's content retrieved from server. Can be `small`, `medium`, `full`.
	     * @param {string} options.im.storeMessages false, Tell the server to store the message for delay distribution and also for history. Please avoid to set it to true for a bot which will not read anymore the messages. It is a better way to store it in your own CPaaS application.
	     * @param {string} options.im.nbMaxConversations 15, Parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.
	     * @param {string} options.im.rateLimitPerHour 1000, Parameter to set the maximum of "message" stanza sent to server by hour. Default value is 1000.
	     * @param {string} options.im.messagesDataStore Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour).</br>
	     *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
	     *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
	     *                          DataStoreType.StoreTwinSide The messages are fully stored.<br>
	     *                          DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.
	     * @param {string} options.im.autoInitialBubblePresence to allow automatic opening of conversation to the bubbles with sending XMPP initial presence to the room. Default value is true.
	     * @param {string} options.im.autoLoadConversations to activate the retrieve of conversations from the server. The default value is true.
	     * @param {string} options.im.autoLoadContacts to activate the retrieve of contacts from roster from the server. The default value is true.
	     * @param {Object} options.servicesToStart <br>
	     *    Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.<br>
	     *    Take care, severals services are linked, so disabling a service can disturb an other one.<br>
	     *    By default all the services are started. Events received from server are not yet filtered.<br>
	     *    So this feature is realy risky, and should be used with much more cautions.<br>
	     *        {<br>
	     *       "bubbles": {<br>
	     *           "start_up": true,<br>
	     *       },<br>
	     *       "telephony": {<br>
	     *           "start_up": true,<br>
	     *       },<br>
	     *       "channels": {<br>
	     *           "start_up": true,<br>
	     *       },<br>
	     *       "admin": {<br>
	     *           "start_up": true,<br>
	     *       },<br>
	     *       "fileServer": {<br>
	     *           "start_up": true,<br>
	     *       },<br>
	     *       "fileStorage": {<br>
	     *           start_up: true,<br>
	     *       },<br>
	     *       "calllog": {<br>
	     *           "start_up": true,<br>
	     *       },<br>
	     *       "favorites": {<br>
	     *           "start_up": true,<br>
	     *
	     */
	    constructor(options: Object);
	    /**
	     * @public
	     * @method start
	     * @instance
	     * @param {String} token a valid token to login without login/password.
	     * @description
	     *    Start the SDK </br>
	     *    Note :</br>
	     *    The token must be empty to signin with credentials.</br>
	     *    The SDK is disconnected when the renew of the token had expired (No initial signin possible with out credentials.)</br>
	     * @memberof NodeSDK
	     */
	    start(token: any): Promise<unknown>;
	    /**
	     * @private
	     * @method startCLI
	     * @instance
	     * @description
	     *      Start the SDK in CLI mode
	     * @memberof NodeSDK
	     */
	    startCLI(): Promise<unknown>;
	    /**
	     * @private
	     * @method siginCLI
	     * @instance
	     * @description
	     *      Sign-in in CLI
	     * @memberof NodeSDK
	     */
	    signinCLI(): Promise<unknown>;
	    /**
	     * @public
	     * @method stop
	     * @instance
	     * @description
	     *    Stop the SDK
	     * @memberof NodeSDK
	     */
	    stop(): Promise<unknown>;
	    stopProcess(): () => Promise<never>;
	    /**
	     * @public
	     * @property {Object} im
	     * @instance
	     * @description
	     *    Get access to the IM module
	     * @return {IMService}
	     */
	    get im(): IMService;
	    /**
	     * @public
	     * @property {Object} channels
	     * @instance
	     * @description
	     *    Get access to the Channels module
	     * @return {ChannelsService}
	     */
	    get channels(): ChannelsService;
	    /**
	     * @public
	     * @property {Object} contacts
	     * @instance
	     * @description
	     *    Get access to the Contacts module
	     * @return {ContactsService}
	     */
	    get contacts(): ContactsService;
	    /**
	     * @public
	     * @property {Object} conversations
	     * @instance
	     * @description
	     *    Get access to the Conversations module
	     * @return {ConversationsService}
	     */
	    get conversations(): ConversationsService;
	    /**
	     * @public
	     * @property {Object} presence
	     * @instance
	     * @description
	     *    Get access to the Presence module
	     * @return {PresenceService}
	     */
	    get presence(): PresenceService;
	    /**
	     * @public
	     * @property {Object} bubbles
	     * @instance
	     * @description
	     *    Get access to the Bubbles module
	     * @return {BubblesService}
	     */
	    get bubbles(): BubblesService;
	    /**
	     * @public
	     * @property {Object} groups
	     * @instance
	     * @description
	     *    Get access to the Groups module
	     * @return {GroupsService}
	     */
	    get groups(): GroupsService;
	    /**
	     * @public
	     * @property {Object} events
	     * @instance
	     * @description
	     *    Get access to the Events module
	     * @return {Events}
	     */
	    get events(): Events;
	    /**
	     * @private
	     * @property {Object} fileServer
	     * @instance
	     * @description
	     *    Get access to the File Server module
	     * @return {FileServerService}
	     */
	    get fileServer(): FileServerService;
	    /**
	     * @private
	     * @property {Object} fileStorage
	     * @instance
	     * @description
	     *    Get access to the File Storage module
	     * @return {FileStorageService}
	     */
	    get fileStorage(): FileStorageService;
	    /**
	     * @public
	     * @property {Object} admin
	     * @instance
	     * @description
	     *    Get access to the Admin module
	     * @return {AdminService}
	     */
	    get admin(): AdminService;
	    /**
	     * @public
	     * @property {Object} profiles
	     * @instance
	     * @description
	     *    Get access to the Profiles module
	     * @return {AdminService}
	     */
	    get profiles(): ProfilesService;
	    /**
	     * @private
	     * @property {Object} rest
	     * @instance
	     * @description
	     *    Get access to the REST module
	     * @return {RESTService}
	     */
	    get rest(): RESTService;
	    /**
	     * @public
	     * @property {Object} settings
	     * @instance
	     * @description
	     *    Get access to the Settings module
	     * @return {SettingsService}
	     */
	    get settings(): SettingsService;
	    /**
	     * @public
	     * @property {SDKSTATUSENUM} state
	     * @instance
	     * @description
	     *    Return the state of the SDK (eg: STOPPED, STARTED, CONNECTED, READY, DISCONNECTED, RECONNECTING, FAILED, ERROR)
	     * @return {SDKSTATUSENUM}
	     */
	    get state(): SDKSTATUSENUM;
	    /**
	     * @public
	     * @property {String} version
	     * @instance
	     * @description
	     *      Return the version of the SDK
	     * @return {String}
	     */
	    get version(): any;
	    /**
	     * @public
	     * @property {ConnectedUser} connectedUser
	     * @instance
	     * @description
	     *      Return the connected user information
	     * @return {any}
	     */
	    get connectedUser(): any;
	    /**
	     * @public
	     * @property {Object} telephony
	     * @instance
	     * @description
	     *    Get access to the telephony module
	     * @return {TelephonyService}
	     */
	    get telephony(): TelephonyService;
	    /**
	     * @public
	     * @property {Object} calllog
	     * @instance
	     * @description
	     *    Get access to the calllog module
	     * @return {CallLogService}
	     */
	    get calllog(): CallLogService;
	    /**
	     * @public
	     * @property {Object} favorites
	     * @instance
	     * @description
	     *    Get access to the favorite module
	     * @return {FavoritesService}
	     */
	    get favorites(): FavoritesService;
	    /**
	     * @public
	     * @property {Object} invitations
	     * @instance
	     * @description
	     *    Get access to the invitation module
	     * @return {InvitationsService}
	     */
	    get invitations(): InvitationsService;
	    /**
	     * @public
	     * @property {Object} s2s
	     * @instance
	     * @description
	     *    Get access to the s2s module
	     * @return {S2SService}
	     */
	    get s2s(): S2SService;
	    /**
	     * @public
	     * @property {AlertsService} alerts
	     * @description
	     *    Get access to the alerts module
	     * @return {AlertsService}
	     */
	    get alerts(): AlertsService;
	    /**
	     * @public
	     * @property {Object} DataStoreType
	     * @description
	     *    Get access to the DataStoreType type
	     * @return {DataStoreType}
	     */
	    get DataStoreType(): typeof DataStoreType;
	    /**
	     * @public
	     * @method getConnectionStatus
	     * @instance
	     * @description
	     *    Get connections status of each low layer services, and also the full SDK state. </br>
	     * </br>
	     * { </br>
	     * restStatus: boolean, The status of the REST connection authentication to rainbow server. </br>
	     * xmppStatus: boolean, The status of the XMPP Connection to rainbow server. </br>
	     * s2sStatus: boolean, The status of the S2S Connection to rainbow server. </br>
	     * state: SDKSTATUSENUM The state of the SDK. </br>
	     * nbHttpAdded: number, the number of HTTP requests (any verb GET, HEAD, POST, ...) added in the HttpManager queue. Note that it is reset to zero when it reaches Number.MAX_SAFE_INTEGER value. </br>
	     * httpQueueSize: number, the number of requests stored in the Queue. Note that when a request is sent to server, it is already removed from the queue. </br>
	     * nbRunningReq: number, the number of requests which has been poped from the queue and the SDK did not yet received an answer for it. </br>
	     * maxSimultaneousRequests : number, the number of request which can be launch at a same time. </br>
	     * nbReqInQueue : number, the number of requests waiting for being treated by the HttpManager.  </br>
	     * } </br>
	     * @return {Promise<{ restStatus: boolean, xmppStatus: boolean, s2sStatus: boolean, state: SDKSTATUSENUM, nbHttpAdded: number, httpQueueSize: number, nbRunningReq: number, maxSimultaneousRequests : number }>}
	     * @category async
	     */
	    getConnectionStatus(): Promise<{
	        restStatus: boolean;
	        xmppStatus: boolean;
	        s2sStatus: boolean;
	        state: SDKSTATUSENUM;
	        nbHttpAdded: number;
	        httpQueueSize: number;
	        nbRunningReq: number;
	        maxSimultaneousRequests: number;
	    }>;
	    /**
	     * @public
	     * @method Appreciation
	     * @static
	     * @description
	     *    Get connections Appreciation type. </br>
	     * @return {Appreciation}
	     */
	    static get Appreciation(): typeof Appreciation;
	}
	export { NodeSDK as NodeSDK };

}
declare module 'index' {
	import { NodeSDK } from 'lib/NodeSDK';
	export { NodeSDK as NodeSDK };

}
declare module 'Samples/index' {
	export {};

}
declare module 'lib/common/XmppQueue/XmppClientWrapper' {
	export {};

}
declare module 'lib/common/XmppQueue/XmppQueue' {
	export {};

}
declare module 'lib/common/models/CallLog' {
	export {};

}
declare module 'lib/common/models/ConferencePhoneNumber' {
	export {}; class ConferencePhoneNumber {
	    private _location;
	    private _locationcode;
	    private _number;
	    private _needLanguageSelection;
	    private _numberType;
	    constructor();
	    get location(): string;
	    set location(value: string);
	    get locationcode(): string;
	    set locationcode(value: string);
	    get number(): string;
	    set number(value: string);
	    get needLanguageSelection(): boolean;
	    set needLanguageSelection(value: boolean);
	    get numberType(): string;
	    set numberType(value: string);
	    ToString(): string;
	}
	export { ConferencePhoneNumber };

}
declare module 'lib/common/models/Settings' {
	export {};
	import { PresenceRainbow } from 'lib/common/models/PresenceRainbow'; class Settings {
	    presence: PresenceRainbow;
	    status: string;
	    displayNameOrderFirstNameFirst: any;
	    activeAlarm: any;
	    activeNotif: any;
	    constructor();
	}
	export { Settings };

}
/**
* pretty-data - nodejs plugin to pretty-print or minify data in XML, JSON and CSS formats.
*
* Version - 0.40.0
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/pretty-data/
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*	pd.xml(data ) - pretty print XML;
*	pd.json(data) - pretty print JSON;
*	pd.css(data ) - pretty print CSS;
*	pd.sql(data)  - pretty print SQL;
*
*	pd.xmlmin(data [, preserveComments] ) - minify XML;
*	pd.jsonmin(data)                      - minify JSON;
*	pd.cssmin(data [, preserveComments] ) - minify CSS;
*	pd.sqlmin(data)                       - minify SQL;
*
* PARAMETERS:
*
*	@data  			- String; XML, JSON, CSS or SQL text to beautify;
* 	@preserveComments	- Bool (optional, used in minxml and mincss only);
*				  Set this flag to true to prevent removing comments from @text;
*	@Return 		- String;
*
* USAGE:
*
*	var pd  = require('pretty-data').pd;
*
*	var xml_pp   = pd.xml(xml_text);
*	var xml_min  = pd.xmlmin(xml_text [,true]);
*	var json_pp  = pd.json(json_text);
*	var json_min = pd.jsonmin(json_text);
*	var css_pp   = pd.css(css_text);
*	var css_min  = pd.cssmin(css_text [, true]);
*	var sql_pp   = pd.sql(sql_text);
*	var sql_min  = pd.sqlmin(sql_text);
*
* TEST:
*	comp-name:pretty-data$ node ./test/test_xml
*	comp-name:pretty-data$ node ./test/test_json
*	comp-name:pretty-data$ node ./test/test_css
*	comp-name:pretty-data$ node ./test/test_sql
*/
declare function pp(): void;
declare function isSubquery(str: any, parenthesisLevel: any): number;
declare function split_sql(str: any, tab: any): any;
declare module 'lib/connection/plugins/mam/index' {
	export {};

}
declare module 'lib/connection/sasl-digest-md5/index' {
	export {};

}
declare module 'lib/services/TransferPromiseQueue' {
	export {};

}
