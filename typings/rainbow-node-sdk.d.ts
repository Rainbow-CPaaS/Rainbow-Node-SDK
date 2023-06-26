declare module 'lib/common/Utils' {
	 let makeId: (n: any) => string; let createPassword: (size: any) => string; let isAdmin: (roles: any) => boolean; class Deferred {
	    resolve: any;
	    reject: any;
	    promise: any;
	    constructor();
	} let isSuperAdmin: (roles: any) => boolean; let anonymizePhoneNumber: (number: any) => any; let equalIgnoreCase: (s1: string, s2: string) => boolean; let isNullOrEmpty: (value: any) => boolean; let setTimeoutPromised: (timeOutMs: any) => Promise<any>; let pause: (timeOutMs: any) => Promise<any>; function until(conditionFunction: Function, labelOfWaitingCondition: string, waitMsTimeBeforeReject?: number): Promise<unknown>; function doWithinInterval({ promise, timeout, error }: {
	    promise: any;
	    timeout: any;
	    error: any;
	}): Promise<any>; function orderByFilter(originalArray: any, filterFct: any, flag: any, sortFct: any): any[]; function addDaysToDate(date: any, days: any): Date; function addParamToUrl(urlParams: Array<string>, paramName: string, paramValue: any): void; function cleanEmptyMembersFromObject(objParams: Object): void; function isStart_upService(serviceoptions: any): boolean; function isStarted(_methodsToIgnoreStartedState?: Array<string>): any; function logEntryExit(LOG_ID: any): any; function resizeImage(avatarImg: any, maxWidth: any, maxHeight: any): Promise<unknown>; function getBinaryData(image: any): {
	    type: any;
	    data: Uint8Array;
	}; function getRandomInt(max: any): number; function stackTrace(): string; function isPromise(x: any): any; const resolveDns: (cname: any) => Promise<unknown>;
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
	    cleanEmptyMembersFromObject: typeof cleanEmptyMembersFromObject;
	    resolveDns: (cname: any) => Promise<unknown>;
	    isPromise: typeof isPromise;
	    doWithinInterval: typeof doWithinInterval;
	};
	export { makeId, createPassword, isAdmin, anonymizePhoneNumber, equalIgnoreCase, isNullOrEmpty, Deferred, isSuperAdmin, setTimeoutPromised, until, orderByFilter, isStart_upService, isStarted, logEntryExit, resizeImage, getBinaryData, getRandomInt, pause, stackTrace, addDaysToDate, addParamToUrl, cleanEmptyMembersFromObject, resolveDns, isPromise, doWithinInterval }; const _default: {
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
	    cleanEmptyMembersFromObject: typeof cleanEmptyMembersFromObject;
	    resolveDns: (cname: any) => Promise<unknown>;
	    isPromise: typeof isPromise;
	    doWithinInterval: typeof doWithinInterval;
	};
	export default _default;

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
	    enable_comments: boolean;
	    max_comments: number;
	    max_payload_comment_size: number;
	    additionDate: boolean;
	    lastCheckDate: string;
	    max_payload_size_comment: number;
	    /**
	     * @this Channel
	     */
	    constructor(_name: string, _id: string, _visibility: string, _topic: string, _creatorId: string, _companyId: string, _creationDate: Date, _users_count: number, _lastAvatarUpdateDate: Date, _subscribed: boolean, _type: string, _invited: boolean, _category: string, _mode: string, _subscribers_count: number, _serverURL: string, _max_items: number, _max_payload_size: number, _pageIndex: number, _isLoading: boolean, _complete: boolean, _users: any[], _publishersRetreived: boolean, _loaded: boolean, _avatar: string, _userRole: string, _messageRetrieved: boolean, _messages: any[], _deleted: boolean, _mute: boolean, _enable_comments: boolean, _max_comments: number, _max_payload_comment_size: number, _additionDate: boolean, _lastCheckDate: string, _max_payload_size_comment: number);
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
	    stop(): Promise<unknown>;
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
	    deleteAllMyVoiceMessagesFromPbx(postHeader: any): Promise<unknown>;
	    deleteAVoiceMessageFromPbx(postHeader: any, messageId: any): Promise<unknown>;
	    getAVoiceMessageFromPbx(requestHeader: any, messageId: string, messageDate: string, messageFrom: string): Promise<unknown>;
	    getDetailedListOfVoiceMessages(requestHeader: any): Promise<unknown>;
	    getNumbersOfVoiceMessages(requestHeader: any): Promise<unknown>;
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
	    replacedByMessage: Message;
	    deleted: boolean;
	    modified: boolean;
	    constructor(serverAckTimer: any, index: any, id: string, type: any, date: Date, from: any, side: string, status: string, receiptStatus: number, isMarkdown: boolean, subject: string, geoloc: GeoLoc, voiceMessage: any, alternativeContent: any, attention: any, mentions: any, urgency: string, urgencyAck: boolean, urgencyHandler: any, historyIndex: string, attachedMsgId: string, attachIndex: number, attachNumber: number, resource: any, toJid: any, content: any, lang: any, cc: any, cctype: any, isEvent: any, event: any, oob: {
	        url: string;
	        mime: string;
	        filename: string;
	        filesize: string;
	    }, fromBubbleJid: any, fromBubbleUserJid: any, answeredMsg: Message, answeredMsgId: string, answeredMsgDate: string, answeredMsgStamp: string, eventJid: string, originalMessageReplaced: Message, confOwnerId: string, confOwnerDisplayName: string, confOwnerJid: string, isForwarded: boolean, forwardedMsg: any, deleted?: boolean, modified?: boolean);
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
	    }, fromBubbleJid: any, fromBubbleUserJid: any, answeredMsg: Message, answeredMsgId: string, answeredMsgDate: string, answeredMsgStamp: string, /* fileTransfer: any,*/ eventJid: string, originalMessageReplaced: Message, confOwnerId: string, confOwnerDisplayName: string, confOwnerJid: string, isForwarded: boolean, forwardedMsg: any, deleted?: boolean, modified?: boolean): Message;
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
	    addOrUpdateMessage(message: any): any;
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
	    get resourceId(): any;
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
	            raiseLowLevelXmppInEvent: boolean;
	            raiseLowLevelXmppOutReq: boolean;
	            maxIdleTimer: number;
	            maxPingAnswerTimer: number;
	            xmppRessourceName: any;
	        };
	        s2s: {
	            hostCallback: string;
	            locallistenningport: string;
	        };
	        rest: {
	            useRestAtStartup: boolean;
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
	            raiseLowLevelXmppInEvent: boolean;
	            raiseLowLevelXmppOutReq: boolean;
	            maxIdleTimer: number;
	            maxPingAnswerTimer: number;
	            xmppRessourceName: any;
	        };
	        s2s: {
	            hostCallback: string;
	            locallistenningport: string;
	        };
	        rest: {
	            useRestAtStartup: boolean;
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
	            raiseLowLevelXmppInEvent: boolean;
	            raiseLowLevelXmppOutReq: boolean;
	            maxIdleTimer: number;
	            maxPingAnswerTimer: number;
	            xmppRessourceName: any;
	        };
	        s2s: {
	            hostCallback: string;
	            locallistenningport: string;
	        };
	        rest: {
	            useRestAtStartup: boolean;
	        };
	    };
	    logs: {
	        path: string;
	        level: string;
	        color: boolean;
	        enableConsoleLog: boolean;
	        enableEventsLogs: boolean;
	        enableEncryptedLogs: boolean;
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
	        enableCarbon: boolean;
	        enablesendurgentpushmessages: boolean;
	        useMessageEditionAndDeletionV2: boolean;
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
	    testDNSentry: boolean;
	    httpoverxmppserver: boolean;
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
	        webinar: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        rbvoice: {
	            start_up: boolean;
	            optional: boolean;
	        };
	        httpoverxmpp: {
	            start_up: boolean;
	            optional: boolean;
	        };
	    };
	};
	export { conf as config, DataStoreType };

}
declare module 'lib/common/XmppQueue/XmppClient' {
	import { DataStoreType } from 'lib/config/config';
	import { Deferred } from 'lib/common/Utils';
	export {}; class XmppClient {
	    options: any;
	    eventEmitter: any;
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
	    enablesendurgentpushmessages: any;
	    copyMessage: any;
	    rateLimitPerHour: any;
	    private nbMessagesSentThisHour;
	    lastTimeReset: Date;
	    timeBetweenReset: number;
	    messagesDataStore: DataStoreType;
	    socket: any;
	    pendingRequests: Array<{
	        id: string;
	        prom: Deferred;
	    }>;
	    constructor(...args: any[]);
	    init(_logger: any, _eventemitter: any, _timeBetweenXmppRequests: any, _storeMessages: any, _rateLimitPerHour: any, _messagesDataStore: any, _copyMessage: any, _enablesendurgentpushmessages: any): Promise<void>;
	    onIqErrorReceived(msg: any, stanza: any): void;
	    iqGetEventPing(ctx: any): {};
	    iqSetEventRoster(ctx: any): {};
	    iqSetEventHttp(ctx: any): Promise<boolean>;
	    onIqResultReceived(msg: any, stanza: any): void;
	    resolvPendingRequest(id: any, stanza: any): Promise<boolean>;
	    resetnbMessagesSentThisHour(): void;
	    getJsonFromXML(xml: string): Promise<any>;
	    send(...args: any[]): any;
	    send_orig(...args: any[]): Promise<unknown>;
	    sendIq(...args: any[]): Promise<unknown>;
	    sendIq_orig(...args: any[]): Promise<unknown>;
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
	    private enableEncryptedLogs;
	    logLevel: string;
	    get logEventEmitter(): NodeJS.EventEmitter;
	    set logEventEmitter(value: NodeJS.EventEmitter);
	    colors: any;
	    _logger: any;
	    _winston: any;
	    hideId: any;
	    hideUuid: any;
	    private _logEventEmitter;
	    private emit;
	    private cryptr;
	    constructor(config: any);
	    get log(): any;
	    argumentsToStringReduced(v: any, delemiter?: string): any;
	    argumentsToStringFull(v: any, delemiter?: string): any;
	    argumentsToString: (v: any, delemiter?: string) => any;
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
	    tags: Array<string>;
	    private _lastContactCacheUpdate;
	    isActive: boolean;
	    accountType: string;
	    systemId: string;
	    isInitialized: boolean;
	    initializationDate: string;
	    createdBySelfRegister: boolean;
	    createdByAdmin: any;
	    createdByAppId: string;
	    firstLoginDate: string;
	    lastLoginDate: string;
	    loggedSince: string;
	    failedLoginAttempts: number;
	    lastLoginFailureDate: string;
	    lastExpiredTokenRenewedDate: string;
	    lastPasswordUpdateDate: string;
	    timeToLive: number;
	    timeToLiveDate: string;
	    terminatedDate: string;
	    fileSharingCustomisation: string;
	    userTitleNameCustomisation: string;
	    softphoneOnlyCustomisation: string;
	    useRoomCustomisation: string;
	    phoneMeetingCustomisation: string;
	    useChannelCustomisation: string;
	    useScreenSharingCustomisation: string;
	    useWebRTCAudioCustomisation: string;
	    useWebRTCVideoCustomisation: string;
	    instantMessagesCustomisation: string;
	    userProfileCustomisation: string;
	    fileStorageCustomisation: string;
	    overridePresenceCustomisation: string;
	    changeTelephonyCustomisation: string;
	    changeSettingsCustomisation: string;
	    recordingConversationCustomisation: string;
	    useGifCustomisation: string;
	    useDialOutCustomisation: string;
	    fileCopyCustomisation: string;
	    fileTransferCustomisation: string;
	    forbidFileOwnerChangeCustomisation: string;
	    readReceiptsCustomisation: string;
	    useSpeakingTimeStatistics: string;
	    selectedAppCustomisationTemplate: any;
	    alertNotificationReception: string;
	    selectedDeviceFirmware: string;
	    visibility: string;
	    jid_password: string;
	    creationDate: string;
	    profiles: Array<any>;
	    activationDate: string;
	    lastOfflineMailReceivedDate: string;
	    state: string;
	    authenticationType: string;
	    department: string;
	    isADSearchAvailable: boolean;
	    isTv: boolean;
	    calendars: Array<any>;
	    openInvites: any;
	    isAlertNotificationEnabled: boolean;
	    outOfOffice: any;
	    lastSeenDate: string;
	    eLearningCustomisation: any;
	    eLearningGamificationCustomisation: any;
	    useRoomAsRBVoiceUser: boolean;
	    useWebRTCAudioAsRBVoiceUser: boolean;
	    msTeamsPresence: any;
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
	    checkPropertiesName(obj: any): void;
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
	    init(useRestAtStartup: boolean): Promise<void>;
	    private attachHandlers;
	    reconnect(): Promise<void>;
	    private getServerFavorites;
	    private addServerFavorite;
	    private removeServerFavorite;
	    private toggleFavorite;
	    private updateFavorites;
	    private createFavoriteObj;
	    /**
	     * @public
	     * @since 1.56
	     * @method createFavorite()
	     * @category Favorites MANAGEMENT
	     * @instance
	     * @description
	     *   Add conversation/bubble/bot to Favorites Array <br>
	     * @param {string} id of the conversation/bubble
	     * @param {string} type of Favorite (can be 'user' or 'bubble')
	     * @return {Promise<Favorite>} A Favorite object
	     */
	    createFavorite(id: string, type: string): Promise<Favorite>;
	    /**
	     * @public
	     * @since 1.56
	     * @method deleteFavorite()
	     * @category Favorites MANAGEMENT
	     * @instance
	     * @description
	     *   Delete conversation/bubble/bot from Favorites Array <br>
	     * @param {string} id of the Favorite item
	     * @return {Favorite[]} A Favorite object
	     */
	    deleteFavorite(id: string): Promise<any>;
	    /**
	     * @public
	     * @method getFavorite
	     * @category Favorites GET
	     * @instance
	     * @description
	     * get favorite from cache by Id.
	     * @param {string} peerId The id of the favorite.
	     * @return {Promise<Favorite>} The favorite corresponding to the peerId
	     */
	    getFavorite(peerId: string): Promise<Favorite>;
	    /**
	     * @public
	     * @since 1.56
	     * @method fetchAllFavorites()
	     * @category Favorites GET
	     * @instance
	     * @description
	     *   Fetch all the Favorites from the server in a form of an Array <br>
	     * @return {Array<Favorite>} An array of Favorite objects
	     */
	    fetchAllFavorites(): Promise<Array<Favorite>>;
	    private onXmppEvent;
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
	export {};
	interface CallbackOneParam<T1, T2 = any> {
	    (param1: T1): T2;
	} class InitialPresence {
	    private _initPresencePromise;
	    private _initPresencePromiseResolve;
	    private _initPresenceAck;
	    private _initPresenceInterval;
	    constructor();
	    get initPresencePromise(): Promise<any>;
	    set initPresencePromise(value: Promise<any>);
	    get initPresencePromiseResolve(): CallbackOneParam<any>;
	    set initPresencePromiseResolve(value: CallbackOneParam<any>);
	    get initPresenceAck(): boolean;
	    set initPresenceAck(value: boolean);
	    get initPresenceInterval(): any;
	    set initPresenceInterval(value: any);
	} class Bubble {
	    get initialPresence(): InitialPresence;
	    set initialPresence(value: InitialPresence);
	    id: any;
	    name: any;
	    nameForLogs: string;
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
	    activeUsersCounter: number;
	    avatar: string;
	    organizers: Array<any>;
	    members: Array<any>;
	    containerId: string;
	    containerName: string;
	    status: string;
	    private _initialPresence;
	    isAlertNotificationEnabled: boolean;
	    isOwnedByGroup: boolean;
	    isActiveLastChange: boolean;
	    processId: any;
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
	    constructor(_id: any, _name: any, _topic: any, _jid: any, _creator: any, _history: any, _users: any, _creationDate: any, _visibility: any, _customData: any, _isActive: any, _conference: any, _disableNotifications: boolean, _lastAvatarUpdateDate: any, _guestEmails: [], _activeUsersCounter: number, _autoRegister: boolean, _lastActivityDate: any, _autoAcceptInvitation?: boolean, _tags?: Array<any>, _avatarDomain?: string, _containerId?: string, _containerName?: string, _isAlertNotificationEnabled?: boolean, _isOwnedByGroup?: boolean, _isActiveLastChange?: boolean, _processId?: any);
	    /**
	     * Method helper to know if room is a meeting
	     * @private
	     */
	    isMeetingBubble(): boolean;
	    getStatusForUser(userId: any): any;
	    setUsers(_users: any): void;
	    get getNameForLogs(): string;
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
	export { Bubble, InitialPresence }; const _default: {
	    Bubble: typeof Bubble;
	    InitialPresence: typeof InitialPresence;
	};
	export default _default;

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
	    private stats;
	    features: any;
	    profiles: any;
	    mainOffers: any;
	    private thirdPartyApps;
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
	    init(useRest: boolean): Promise<unknown>;
	    onUserUpdateNeeded(): void;
	    /*********************************************************************/
	    /** PROFILE API STUFF                                          **/
	    /*********************************************************************/
	    /**
	     * @public
	     * @method getServerProfile
	     * @async
	     * @category Profiles PROFILES
	     * @description
	     * This API can be used to get user profiles and features.<br>
	     * @return {Promise<any>}
	     */
	    getServerProfile(): Promise<[unknown, unknown]>;
	    /**
	     * @public
	     * @method getServerProfiles
	     * @async
	     * @category Profiles PROFILES
	     * @description
	     * This API can be used to get user profiles.<br>
	     * This API can only be used by user himself
	     * @return {Promise<any>}
	     */
	    getServerProfiles(): Promise<unknown>;
	    /**
	     * @public
	     * @method getMyProfileOffer
	     * @category Profiles PROFILES
	     * @description
	     * This API can be used to get user profile offer.<br>
	     * Returns the profile "Enterprise", "Business", "Essential" or null (if none of them)
	     * @return {any}
	     */
	    getMyProfileOffer(): any;
	    /**
	     * @public
	     * @method getMyProfileName
	     * @category Profiles PROFILES
	     * @description
	     * This API can be used to get user profile offer name.<br>
	     * Returns the profile "Enterprise", "Business", "Essential" or null (if none of them)
	     * @return {any}
	     */
	    getMyProfileName(): any;
	    /**
	     * @public
	     * @method getMyProfiles
	     * @category Profiles PROFILES
	     * @description
	     * This API can be used to get user profiles.<br>
	     * @return {any}
	     */
	    getMyProfiles(): any[];
	    /**
	     * @public
	     * @method getThirdPartyApps
	     * @async
	     * @category Profiles PROFILES
	     * @param {boolean} force Parameter force in order to refresh the list
	     * @description
	     *  Get The list of the Third Party Application that have access to this Rainbow Account.
	     * @return {Promise<any>}
	     */
	    getThirdPartyApps(force?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method revokeThirdPartyAccess
	     * @async
	     * @category Profiles PROFILES
	     * @param {string} tokenId The tokenId should be sent as a parameter
	     * @description
	     * Revoke the access of a third-party application from Rainbow
	     * @return {Promise<any>}
	     */
	    revokeThirdPartyAccess(tokenId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getServerProfilesFeatures
	     * @async
	     * @category Profiles FEATURES
	     * @description
	     * This API can be used to get user profile features.<br>
	     * @return {Promise<any>}
	     */
	    getServerProfilesFeatures(): Promise<unknown>;
	    /*********************************************************************/
	    /** USER DATA API STUFF                                             **/
	    /*********************************************************************/
	    /**
	     * @public
	     * @method isFeatureEnabled
	     * @category Profiles FEATURES
	     * @description
	     * This API can be used to know if a feature is enabled.<br>
	     * @return {any}
	     */
	    isFeatureEnabled(featureUniqueRef: any): any;
	    /**
	     * @public
	     * @method getFeatureLimitMax
	     * @category Profiles FEATURES
	     * @description
	     * This API can be used to get Max limit of feature.<br>
	     * @return {any}
	     */
	    getFeatureLimitMax(featureUniqueRef: any): any;
	    /**
	     * @public
	     * @method getFeatureLimitMin
	     * @category Profiles FEATURES
	     * @description
	     * This API can be used to get Min limit of feature.<br>
	     * @return {any}
	     */
	    getFeatureLimitMin(featureUniqueRef: any): any;
	    /**
	     * @public
	     * @method getMyProfileFeatures
	     * @category Profiles FEATURES
	     * @description
	     * This API can be used to get features of the profile of connected user.<br>
	     * @return {any}
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
	import { MEDIATYPE } from 'lib/connection/RESTService';
	import { Contact } from 'lib/common/models/Contact';
	import { Bubble } from 'lib/common/models/Bubble';
	export {}; class Participant {
	    private _id;
	    private _jid_im;
	    private _phoneNumber;
	    private _moderator;
	    private _muted;
	    private _hold;
	    private _talking;
	    private _talkingTime;
	    private _microphone;
	    private _delegateCapability;
	    private _connected;
	    private _contact;
	    private _associatedUserId;
	    private _associatedGroupName;
	    private _isOwner;
	    constructor(id: string);
	    /**
	     *
	     *  @name id
	     * @return {string}
	     * @description
	     *    get the id of the participant. The Id of the particpant is NOT AT ALL related to the Id of a Contact.
	     */
	    get id(): string;
	    /**
	     *
	     *  @name id
	     * @param {string} value
	     * @description
	     *    set the id of the participant. The Id of the particpant is NOT AT ALL related to the Id of a Contact.
	     */
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
	    get contact(): Contact;
	    set contact(value: Contact);
	    get talkingTime(): number;
	    set talkingTime(value: number);
	    get talking(): boolean;
	    set talking(value: boolean);
	    get microphone(): boolean;
	    set microphone(value: boolean);
	    get delegateCapability(): boolean;
	    set delegateCapability(value: boolean);
	    get associatedUserId(): string;
	    set associatedUserId(value: string);
	    get associatedGroupName(): string;
	    set associatedGroupName(value: string);
	    get isOwner(): boolean;
	    set isOwner(value: boolean);
	    ToString(): string;
	} class Talker {
	    private _participant;
	    private _talkingTime;
	    private _publisher;
	    private _simulcast;
	    constructor(participant: Participant);
	    get participant(): Participant;
	    set participant(value: Participant);
	    get talkingTime(): number;
	    set talkingTime(value: number);
	    get publisher(): boolean;
	    set publisher(value: boolean);
	    get simulcast(): boolean;
	    set simulcast(value: boolean);
	    ToString(): string;
	} class Silent {
	    private _participant;
	    private _talkingTime;
	    private _publisher;
	    private _simulcast;
	    constructor(participant: Participant);
	    get participant(): Participant;
	    set participant(value: Participant);
	    get talkingTime(): string;
	    set talkingTime(value: string);
	    get publisher(): boolean;
	    set publisher(value: boolean);
	    get simulcast(): boolean;
	    set simulcast(value: boolean);
	    ToString(): string;
	} class Publisher {
	    get simulcast(): boolean;
	    set simulcast(value: boolean);
	    private _id;
	    private _jid_im;
	    private _media;
	    private _participant;
	    private _simulcast;
	    get participant(): Participant;
	    set participant(value: Participant);
	    constructor(id: any);
	    get id(): string;
	    set id(value: string);
	    get jid_im(): string;
	    set jid_im(value: string);
	    get media(): List<string>;
	    set media(value: List<string>);
	    ToString(): string;
	} class Service {
	    private _serviceId;
	    private _serviceType;
	    get serviceId(): string;
	    set serviceId(value: string);
	    get serviceType(): string;
	    set serviceType(value: string);
	    constructor();
	} class ConferenceSession {
	    get bubble(): Bubble;
	    set bubble(value: Bubble);
	    get ownerJidIm(): string;
	    set ownerJidIm(value: string);
	    get services(): List<Service>;
	    set services(value: List<Service>);
	    private _id;
	    private _active;
	    private _muted;
	    private _locked;
	    private _talkerActive;
	    private _recordStarted;
	    private _recordingState;
	    private _recordingUserId;
	    private _participantCount;
	    private _mediaType;
	    private _reason;
	    private _participants;
	    private _publishers;
	    private _talkers;
	    private _silents;
	    private _replacedByConference;
	    private _replaceConference;
	    private _services;
	    private _ownerJidIm;
	    private _bubble;
	    constructor(id: string, participants?: List<Participant>, mediaType?: MEDIATYPE);
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
	    get recordingState(): boolean;
	    set recordingState(value: boolean);
	    get recordingUserId(): boolean;
	    set recordingUserId(value: boolean);
	    get participantCount(): number;
	    set participantCount(value: number);
	    get mediaType(): string;
	    set mediaType(value: string);
	    get participants(): List<Participant>;
	    set participants(value: List<Participant>);
	    get publishers(): List<Publisher>;
	    set publishers(value: List<Publisher>);
	    get talkers(): List<Talker>;
	    set talkers(value: List<Talker>);
	    get silents(): List<Silent>;
	    set silents(value: List<Silent>);
	    get talkerActive(): boolean;
	    set talkerActive(value: boolean);
	    get reason(): string;
	    set reason(value: string);
	    get replacedByConference(): ConferenceSession;
	    set replacedByConference(value: ConferenceSession);
	    get replaceConference(): ConferenceSession;
	    set replaceConference(conference: ConferenceSession);
	    ToString(): string;
	    reset(): void;
	}
	export { Publisher, Participant, ConferenceSession, Talker, Silent, Service };

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
	import { Bubble } from 'lib/common/models/Bubble';
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { Contact } from 'lib/common/models/Contact';
	import { ConferenceSession } from 'lib/common/models/ConferenceSession';
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
	    /**
	     * @method start
	     * @private
	     * @return {Promise<void>}
	     */
	    start(_options: any, _core: Core): Promise<unknown>;
	    /**
	     * @method stop
	     * @private
	     * @return {Promise<void>}
	     */
	    stop(): Promise<unknown>;
	    /**
	     * @method init
	     * @private
	     * @return {Promise<void>}
	     */
	    init(useRestAtStartup: boolean): Promise<void>;
	    /**
	     * @private
	     * @method _onInvitationReceived
	     * @instance
	     * @param {Object} invitation contains informations about bubble and user's jid
	     * @description
	     *      Method called when receiving an invitation to join a bubble <br>
	     */
	    _onInvitationReceived(invitation: any): void;
	    /**
	     * @private
	     * @method _onAffiliationChanged
	     * @instance
	     * @param {Object} affiliation contains information about bubble and user's jid
	     * @description
	     *      Method called when affilitation to a bubble changed <br>
	     */
	    _onAffiliationChanged(affiliation: any): Promise<void>;
	    /**
	     * @private
	     * @method _onOwnAffiliationChanged
	     * @instance
	     * @param {Object} affiliation contains information about bubble and user's jid
	     * @description
	     *      Method called when the user affilitation to a bubble changed <br>
	     */
	    _onOwnAffiliationChanged(affiliation: any): Promise<void>;
	    /**
	     * @private
	     * @method _onCustomDataChanged
	     * @instance
	     * @param {Object} data contains information about bubble and new custom data received
	     * @description
	     *      Method called when custom data have changed for a bubble <br>
	     */
	    _onCustomDataChanged(data: any): void;
	    /**
	     * @private
	     * @method _onTopicChanged
	     * @instance
	     * @param {Object} data contains information about bubble new topic received
	     * @description
	     *      Method called when the topic has changed for a bubble <br>
	     */
	    _onTopicChanged(data: any): void;
	    /**
	     * @private
	     * @method _onPrivilegeBubbleChanged
	     * @instance
	     * @param {Object} bubbleInfo modified bubble info
	     * @description
	     *     Method called when the owner of a bubble changed. <br>
	     */
	    _onPrivilegeBubbleChanged(bubbleInfo: any): Promise<void>;
	    /**
	     * @private
	     * @method _onNameChanged
	     * @instance
	     * @param {Object} data contains information about bubble new name received
	     * @description
	     *      Method called when the name has changed for a bubble <br>
	     */
	    _onNameChanged(data: any): void;
	    _onBubblePollConfiguration(data: any): void;
	    _onBubblePollEvent(data: any): void;
	    /**
	     * @private
	     * @method _onBubblePresenceSent
	     * @instance
	     * @param {Object} data contains information about bubble where the presence as been sent to receiv bubble events.
	     * @description
	     *      Method called when the presence has been sent to a bubble <br>
	     */
	    _onBubblePresenceSent(data: any): void;
	    /**
	     * @private
	     * @method _onbubblepresencechanged
	     * @instance
	     * @param {Object} bubbleInfo contains information about bubble
	     * @description
	     *      Method called when the name has changed for a bubble <br>
	     */
	    _onbubblepresencechanged(bubbleInfo: any): Promise<void>;
	    /**
	     * @private
	     * @method _onBubblesContainerReceived
	     * @instance
	     * @param {Object} infos contains informations about a bubbles container
	     * @description
	     *      Method called when receiving an create/update/delete event of the bubbles container <br>
	     */
	    _onBubblesContainerReceived(infos: any): Promise<void>;
	    /**
	     * @method _onBubbleConferenceStoppedReceived
	     * @private
	     * @param bubble
	     * @return {Promise<void>}
	     */
	    _onBubbleConferenceStoppedReceived(bubble: any): Promise<void>;
	    /**
	     * @public
	     * @method conferenceAllowed
	     * @since 2.6.0
	     * @instance
	     * @category CONFERENCE SPECIFIC
	     * @return {boolean}
	     * @description
	     *      To know if the current user has the permission to start its own WebRTC Conference.
	     *      return True if it's allowed, false if it's not the case
	     */
	    conferenceAllowed(): boolean;
	    /**
	     * @public
	     * @method getConferenceByIdFromCache
	     * @since 2.6.0
	     * @category CONFERENCE SPECIFIC
	     * @instance
	     * @param {string} conferenceId ID of the conference to get
	     * @return {ConferenceSession}
	     * @description
	     *      To get a conference from the cache using a conference Id.
	     *      RETURN A conference object or NULL if not found
	     */
	    getConferenceByIdFromCache(conferenceId: string): ConferenceSession;
	    /**
	     * @public
	     * @method conferenceGetListFromCache
	     * @since 2.6.0
	     * @category CONFERENCE SPECIFIC
	     * @instance
	     * @return {boolean}
	     * @description
	     *      To get conferences list in progress from the cache.
	     *      return The list of Conference in progress.
	     */
	    conferenceGetListFromCache(): List<ConferenceSession>;
	    /**
	     * @private
	     * @Method retrieveConferences
	     * @since 2.6.0
	     * @instance
	     * @category CONFERENCE SPECIFIC
	     * @deprecated
	     * @param {string} mediaType [optional] mediaType of conference(s) to retrive.
	     * @param {boolean} scheduled [optional] whether it is a scheduled conference or not
	     * @param {boolean} provisioning [optional] whether it is a conference that is in provisioning state or not
	     * @returns {Promise<any>} a promise that resolves when conference are retrieved. Note: If no parameter is specified, then all mediaTypes are retrieved
	     * @memberof ConferenceService
	     */
	    retrieveConferences(mediaType?: string, scheduled?: boolean, provisioning?: boolean): Promise<any>;
	    /**
	     * @private
	     * @method personalConferenceGetId
	     * @since 2.6.0
	     * @category PERSONAL CONFERENCE SPECIFIC
	     * @instance
	     * @deprecated
	     * @description
	     * To get teh Id of the Personal Conference
	     * @return {string} Id of the Personal Conference or NULL
	     */
	    personalConferenceGetId(): string;
	    /**
	     * @private
	     * @method personalConferenceGetBubbleFromCache
	     * @since 2.6.0
	     * @category PERSONAL CONFERENCE SPECIFIC
	     * @instance
	     * @deprecated
	     * @description
	     * To get the bubble which contains the Personal Meeting of the end-user (if he has the permission)
	     * @return {Promise<Bubble>} The Bubble which contains the Personal Meeting or null
	     */
	    personalConferenceGetBubbleFromCache(): Promise<Bubble>;
	    /**
	     * @private
	     * @method personalConferenceGetPublicUrl
	     * @since 2.6.0
	     * @category PERSONAL CONFERENCE SPECIFIC
	     * @instance
	     * @deprecated
	     * @description
	     * To retrieve the public URL to access the Personal Meeting - So a Guest or a Rainbow user can access to it just using a URL
	     * @return {Promise<any>}
	     */
	    personalConferenceGetPublicUrl(): Promise<any>;
	    /**
	     * @private
	     * @method personalConferenceGenerateNewPublicUrl
	     * @since 2.6.0
	     * @category PERSONAL CONFERENCE SPECIFIC
	     * @instance
	     * @deprecated
	     * @description
	     * Generate a new public URL to access the Personal Meeting (So a Guest or a Rainbow user can access to it just using a URL). <br>
	     * The previous URL is no more functional !
	     * @return {Promise<any>}
	     */
	    personalConferenceGenerateNewPublicUrl(): Promise<any>;
	    /**
	     * @method removeBubbleFromCache
	     * @private
	     * @instance
	     * @param {string} conferenceId
	     * @param {boolean} deleteLinkWithBubble
	     */
	    removeConferenceFromCache(conferenceId: string): void;
	    /**
	     * @method addOrUpdateConferenceToCache
	     * @private
	     * @instance
	     * @param {ConferenceSession} conference
	     * @param {boolean} useConferenceV2 do a specific treatment if the conference V2 model is used.
	     * @param {Object} updatedDatasForEvent participants added or removed
	     */
	    addOrUpdateConferenceToCache(conference: ConferenceSession, updatedDatasForEvent?: any): Promise<void>;
	    /**
	     * @public
	     * @method getBubblesConsumption
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @return {Promise<Object>} return an object describing the consumption of bubbles : {
	        maxValue : number // The quota associated to this offer [room]
	        currentValue : number // The user's current consumption [room].
	     }
	     * @description
	     *      return an object describing the consumption of bubbles. <br>
	     */
	    getBubblesConsumption(): Promise<unknown>;
	    /**
	     * @public
	     * @method getBubbleById
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {string} id the id of the bubble
	     * @param {boolean} [force=false] True to force a request to the server
	     * @param {string} context
	     * @param {string} format Allows to retrieve more or less room details in response. </br>
	     * small: id, name, jid, isActive</br>
	     * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive, autoAcceptInvitation</br>
	     * full: all room fields</br>
	     * If full format is used, the list of users returned is truncated to 100 active users by default.</br>
	     * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned).</br>
	     * The total number of users being member of the room is returned in the field activeUsersCounter.</br>
	     * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users.</br>
	     * The full list of users registered in the room shall be got using API GET /api/rainbow/enduser/v1.0/rooms/:roomId/users, which is paginated and allows to sort the users list.</br>
	     * If full format is used, and whatever the status of the logged in user (active or unsubscribed), then he is added in first position of the users list.</br>
	     * Default value : small Possibles values : small, medium, full</br>
	     * @param {boolean} unsubscribed When true and always associated with full format, beside owner and invited/accepted users keep also unsubscribed users. Not taken in account if the logged in user is not a room moderator. Default value : false
	     * @param {number} nbUsersToKeep Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). If value is set to -1, all active bubble members are returned. Only usable if requested format is full (otherwise users field is not returned) Default value : 100
	     * @async
	     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
	     * @description
	     *  Get a bubble by its ID in memory and if it is not found in server. <br>
	     *  Get a bubble data visible by the user requesting it (a private room the user is part of or a public room)
	     */
	    getBubbleById(id: any, force?: boolean, context?: string, format?: string, unsubscribed?: boolean, nbUsersToKeep?: number): Promise<Bubble>;
	    /**
	     * @public
	     * @method getBubbleByJid
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {string} jid the JID of the bubble
	     * @param {boolean} [force=false] True to force a request to the server
	     * @param {string} format Allows to retrieve more or less room details in response. </br>
	     * small: id, name, jid, isActive</br>
	     * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive, autoAcceptInvitation</br>
	     * full: all room fields</br>
	     * If full format is used, the list of users returned is truncated to 100 active users by default.</br>
	     * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned).</br>
	     * The total number of users being member of the room is returned in the field activeUsersCounter.</br>
	     * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users.</br>
	     * The full list of users registered in the room shall be got using API GET /api/rainbow/enduser/v1.0/rooms/:roomId/users, which is paginated and allows to sort the users list.</br>
	     * If full format is used, and whatever the status of the logged in user (active or unsubscribed), then he is added in first position of the users list.</br>
	     * Default value : small Possibles values : small, medium, full</br>
	     * @param {boolean} unsubscribed When true and always associated with full format, beside owner and invited/accepted users keep also unsubscribed users. Not taken in account if the logged in user is not a room moderator. Default value : false
	     * @param {number} nbUsersToKeep Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). If value is set to -1, all active bubble members are returned. Only usable if requested format is full (otherwise users field is not returned) Default value : 100
	     * @async
	     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
	     * @description
	     *  Get a bubble by its JID in memory and if it is not found in server. <br>
	     *  Get a rooms data visible by the user requesting it (a private room the user is part of or a public room)
	     */
	    getBubbleByJid(jid: any, force?: boolean, format?: string, unsubscribed?: boolean, nbUsersToKeep?: number): Promise<Bubble>;
	    /**
	     * @public
	     * @method getAllPendingBubbles
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @instance
	     * @return {Bubble[]} An array of Bubbles not accepted or declined
	     * @description
	     *  Get the list of Bubbles that have a pending invitation not yet accepted of declined <br>
	     */
	    getAllPendingBubbles(): Bubble[];
	    /**
	     * @public
	     * @method getAllActiveBubbles
	     * @since 1.30
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @return {Bubble[]} An array of Bubbles that are "active" for the connected user
	     * @description
	     *  Get the list of Bubbles where the connected user can chat <br>
	     */
	    getAllActiveBubbles(): Bubble[];
	    /**
	     * @public
	     * @method getAllClosedBubbles
	     * @since 1.30
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @return {Bubble[]} An array of Bubbles that are closed for the connected user
	     * @description
	     *  Get the list of Bubbles where the connected user can only read messages <br>
	     */
	    getAllClosedBubbles(): Bubble[];
	    /**
	     * @public
	     * @method createBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *  Create a new bubble <br>
	     * @param {string} name  The name of the bubble to create
	     * @param {string} description  The description of the bubble to create
	     * @param {boolean} withHistory If true, a newcomer will have the complete messages history since the beginning of the bubble. False if omitted
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - Bubble object, else an ErrorManager object

	     */
	    createBubble(name: any, description: any, withHistory?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method isBubbleClosed
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Bubble} bubble  The bubble to check
	     * @return {boolean} True if the bubble is closed
	     * @description
	     *  Check if the bubble is closed or not. <br>
	     */
	    isBubbleClosed(bubble: any): boolean;
	    /**
	     * @public
	     * @method isBubbleArchived
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *     Check if the Bubble is un Archive state (everybody unsubscribed)
	     * @param {object} bubble Bubble to be archived
	     * @returns {Promise<boolean>} True if the Bubble is in archive state
	     */
	    isBubbleArchived(bubble: Bubble): Promise<boolean>;
	    /**
	     * @public
	     * @method getAllOwnedNotArchivedBubbles
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *     Get all the owned Bubbles which are NOT in an Archive state (everybody unsubscribed)
	     * @returns {Promise<Bubble>} return a promise with an array of the owned bubbles which are NOT in an archive state
	     */
	    getAllOwnedNotArchivedBubbles(): Promise<[Bubble]>;
	    /**
	     * @public
	     * @method getAllOwnedArchivedBubbles
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *     Get all the owned Bubbles in an Archive state (everybody unsubscribed)
	     * @returns {Promise<Bubble>} return a promise with an array of the owned bubbles with an archive state
	     */
	    getAllOwnedArchivedBubbles(): Promise<[Bubble]>;
	    /**
	     * @public
	     * @method deleteAllBubbles
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *    Delete all existing owned bubbles <br>
	     *    Return a promise <br>
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    deleteAllBubbles(): void;
	    /**
	     * @public
	     * @method closeAnddeleteAllBubbles
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *    Delete all existing owned bubbles <br>
	     *    Return a promise <br>
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    closeAnddeleteAllBubbles(): void;
	    /**
	     * @public
	     * @method deleteBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Bubble} bubble  The bubble to delete
	     * @description
	     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants. <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble removed, else an ErrorManager object

	     */
	    deleteBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method closeAndDeleteBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Bubble} bubble  The bubble to close + delete
	     * @description
	     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants. <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble removed, else an ErrorManager object

	     */
	    closeAndDeleteBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method closeBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Bubble} bubble The Bubble to close
	     * @description
	     *  Close a owned bubble. When the owner closes a bubble, the bubble is archived and only accessible in read only mode for all participants. <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble closed, else an ErrorManager object

	     */
	    closeBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method archiveBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Bubble} bubble  The bubble to archive
	     * @description
	     *  Archive  a bubble. <br>
	     *  This API allows to close the room in one step. The other alternative is to change the status for each room users not deactivated yet. <br>
	     *  All users currently having the status 'invited' or 'accepted' will receive a message/stanza . <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The operation result

	     */
	    archiveBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method leaveBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Bubble} bubble  The bubble to leave
	     * @description
	     *  Leave a bubble. If the connected user is a moderator, an other moderator should be still present in order to leave this bubble. <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The operation result

	     */
	    leaveBubble(bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @instance
	     * @description
	     *      Internal method
	     */
	    getBubbles(): Promise<unknown>;
	    /**
	     * @public
	     * @method getAll
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @instance
	     * @return {Bubble[]} The list of existing bubbles
	     * @description
	     *  Return the list of existing bubbles <br>
	     */
	    getAll(): Bubble[];
	    /**
	     * @public
	     * @method getAllBubbles
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @return {Bubble[]} The list of existing bubbles
	     * @description
	     *  Return the list of existing bubbles <br>
	     */
	    getAllBubbles(): Bubble[];
	    /**
	     * @public
	     * @method getAllOwnedBubbles
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *    Get the list of bubbles created by the user <br>
	     * @return {Bubble[]} An array of bubbles restricted to the ones owned by the user
	     */
	    getAllOwnedBubbles(): Bubble[];
	    /**
	     * @method getBubbleFromCache
	     * @private
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @instance
	     * @param {string} bubbleId
	     * @return {Bubble}
	     * @private
	     */
	    private getBubbleFromCache;
	    /**
	     * @method addOrUpdateBubbleToCache
	     * @private
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param bubble
	     * @return {Promise<Bubble>}
	     * @private
	     */
	    private addOrUpdateBubbleToCache;
	    /**
	     * @method removeBubbleFromCache
	     * @private
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @instance
	     * @param {string} bubbleId
	     * @return {Promise<Bubble>}
	     * @private
	     */
	    private removeBubbleFromCache;
	    /**
	     * @public
	     * @method promoteContactInBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @param {Contact} contact         The contact to promote or downgraded
	     * @param {Bubble} bubble           The bubble
	     * @param {boolean} isModerator     True to promote a contact as a moderator of the bubble, and false to downgrade
	     * @description
	     *  Promote or not a contact in a bubble <br>
	     *  The logged in user can't update himself. As a result, a 'moderator' can't be downgraded to 'user'. <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the modifications

	     */
	    promoteContactInBubble(contact: any, bubble: any, isModerator: any): Promise<unknown>;
	    /**
	     * @public
	     * @method promoteContactToModerator
	     * @since 1.65
	     * @instance
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *    Promote a contact to moderator in a bubble <br>
	     *    Return a promise. <br>
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
	     * @category Manage Bubbles - Bubbles MANAGEMENT
	     * @description
	     *    Demote a contact to user in a bubble <br>
	     *    Return a promise. <br>
	     * @param {Contact} contact The contact to promote
	     * @param {Bubble} bubble   The destination bubble
	     * @return {Promise<Bubble, ErrorManager>} The bubble object or an error object depending on the result
	     */
	    demoteContactFromModerator(contact: any, bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method acceptInvitationToJoinBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles INVITATIONS
	     * @param {Bubble} bubble The Bubble to join
	     * @description
	     *  Accept an invitation to join a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated or an error object depending on the result

	     */
	    acceptInvitationToJoinBubble(bubble: Bubble): Promise<unknown>;
	    /**
	     * @public
	     * @method declineInvitationToJoinBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles INVITATIONS
	     * @param {Bubble} bubble The Bubble to decline
	     * @description
	     *  Decline an invitation to join a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated or an error object depending on the result

	     */
	    declineInvitationToJoinBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method inviteContactToBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles INVITATIONS
	     * @param {Contact} contact         The contact to invite
	     * @param {Bubble} bubble           The bubble
	     * @param {boolean} isModerator     True to add a contact as a moderator of the bubble
	     * @param {boolean} withInvitation  If true, the contact will receive an invitation and will have to accept it before entering the bubble. False to force the contact directly in the bubble without sending an invitation.
	     * @param {string} reason        The reason of the invitation (optional)
	     * @description
	     *  Invite a contact in a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the new invitation

	     */
	    inviteContactToBubble(contact: any, bubble: any, isModerator: any, withInvitation: any, reason?: any): Promise<unknown>;
	    /**
	     * @public
	     * @method inviteContactsByEmailsToBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles INVITATIONS
	     * @param {Contact} contactsEmails         The contacts email tab to invite
	     * @param {Bubble} bubble           The bubble
	     * @description
	     *  Invite a list of contacts by emails in a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the new invitation

	     */
	    inviteContactsByEmailsToBubble(contactsEmails: any, bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateBubbleData
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {string} bubbleId The id of the Bubble to update
	     * @param {string} visibility Public/private group visibility for search. Default value : private. Possible values : private, public.
	     * @param {string} topic Room topic.
	     * @param {string} name Room name.
	     * @param {string} owner User unique identifier; New room owner must be a moderator and current owner must have valid licence (feature BUBBLE_PROMOTE_MEMBER).
	     * @param {string} autoRegister A user can create a room and not have to register users. He can share instead a public link also called 'public URL'(users public link). <br>
	     * According with autoRegister value, if another person uses the link to join the room: <br>
	     * autoRegister = 'unlock': <br>
	     * If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room. <br>
	     * autoRegister = 'lock': <br>
	     * If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room. <br>
	     * autoRegister = 'unlock_ack' (value not authorized yet): <br>
	     * If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment. Default value : unlock. Possible values : unlock, lock. <br>
	     *
	     * @param {boolean} autoAcceptInvitation When set to true, allows to automatically add participants in the room (default behavior is that participants need to accept the room invitation first before being a member of this room)
	     * @param {boolean} muteUponEntry When participant enters the conference, he is automatically muted.
	     * @param {boolean} playEntryTone Play an entry tone each time a participant enters the conference.
	     * @param {boolean} disableTimeStats When set to true, clients will hide the Time Stats tab from bubble meetings.
	     * @param {Object} phoneNumbers : Array of object with : {  <br>
	     * location : string location of the Dial In phone number <br>
	     * locationcode : string location code of the Dial In phone number <br>
	     * number : string Dial In phone number <br>
	     * numberE164 : string Dial In phone number in E164 format <br>
	     * } <br>
	     * @param {boolean} includeAllPhoneNumbers Indicates if user chooses to include all Dial In phone numbers.
	     * @description
	     *  This API allows to update room data. <br>
	     *
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the data

	     */
	    updateBubbleData(bubbleId: string, visibility?: string, topic?: string, name?: string, owner?: string, autoRegister?: string, autoAcceptInvitation?: boolean, muteUponEntry?: boolean, playEntryTone?: boolean, disableTimeStats?: boolean, phoneNumbers?: Array<{
	        location?: string;
	        locationcode?: string;
	        number?: string;
	        numberE164?: string;
	    }>, includeAllPhoneNumbers?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method setBubbleCustomData
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble The Bubble
	     * @param {Object} customData Bubble's custom data area. key/value format. Maximum and size are server dependent
	     * @description
	     *  Modify all custom data at once in a bubble <br>
	     *  To erase all custom data, put {} in customData <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the custom data set or an error object depending on the result

	     */
	    setBubbleCustomData(bubble: any, customData: any): Promise<unknown>;
	    /**
	     * @private
	     * @method setBubbleVisibilityStatus
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble The Bubble
	     * @param {string} status Bubble's public/private group visibility for search.  Either "private" (default) or "public"
	     * @description
	     *  Set the Bubble's visibility status <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result

	     */
	    setBubbleVisibilityStatus(bubble: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method setBubbleTopic
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble The Bubble
	     * @param {string} topic Bubble's topic
	     * @description
	     *  Set the Bubble's topic <br>
	     * @memberof Bubbles
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result

	     */
	    setBubbleTopic(bubble: any, topic: any): Promise<unknown>;
	    /**
	     * @public
	     * @method setBubbleName
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble The Bubble
	     * @param {string} name Bubble's name
	     * @description
	     *  Set the Bubble's name <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result

	     */
	    setBubbleName(bubble: any, name: any): Promise<unknown>;
	    /**
	     * @method randomString
	     * @private
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @instance
	     * @param {number} length
	     * @return {string}
	     */
	    randomString(length?: number): string;
	    /**
	     * @public
	     * @method updateAvatarForBubble
	     * @since 1.65
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @description
	     *    Update the bubble avatar (from given URL) <br>
	     *    The image will be automaticalle resized <br>
	     *    /!\ if URL isn't valid or given image isn't loadable, it'll fail <br>
	     *    Return a promise. <br>
	     * @param {string} urlAvatar  The avatarUrl
	     * @param {Bubble} bubble  The bubble to update
	     * @return {Bubble} A bubble object of null if not found
	     */
	    updateAvatarForBubble(urlAvatar: any, bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @method setAvatarBubble
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @instance
	     * @param bubble
	     * @param roomAvatarPath
	     */
	    setAvatarBubble(bubble: any, roomAvatarPath: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAvatarFromBubble
	     * @since 1.65
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @description
	     *    Delete the bubble avatar <br>
	     *     <br>
	     *    Return a promise. <br>
	     * @param {Bubble} bubble  The bubble to update
	     * @return {Bubble} A bubble object of null if not found
	     */
	    deleteAvatarFromBubble(bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @method deleteAvatarBubble
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @instance
	     * @param bubbleId
	     */
	    deleteAvatarBubble(bubbleId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCustomDataForBubble
	     * @since 1.64
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @description
	     *    Update the customData of the bubble  <br>
	     *    Return a promise. <br>
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
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @description
	     *    Delete the customData of the bubble  <br>
	     *    Return a promise. <br>
	     * @param {Bubble} bubble   The bubble to update
	     * @return {Promise<Bubble>} The updated Bubble
	     */
	    deleteCustomDataForBubble(bubble: any): Promise<unknown>;
	    /**
	     * @public
	     * @method updateDescriptionForBubble
	     * @since 1.65
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @description
	     *    Update the description of the bubble  <br>
	     *    Return a promise. <br>
	     * @param {Bubble} bubble   The bubble to update
	     * @param {string} strDescription   The description of the bubble (is is the topic on server side, and result event)
	     * @return {Bubble} A bubble object of null if not found
	     */
	    updateDescriptionForBubble(bubble: any, strDescription: any): Promise<unknown>;
	    /**
	     * @public
	     * @method changeBubbleOwner
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble           The bubble
	     * @param {Contact} contact         The contact to set a new bubble owner
	     * @description
	     *  Set a moderator contact as owner of a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble updated with the modifications

	     */
	    changeBubbleOwner(bubble: any, contact: any): Promise<unknown>;
	    /**
	     * @public
	     * @method removeContactFromBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Contact} contact The contact to remove
	     * @param {Bubble} bubble   The destination bubble
	     * @description
	     *    Remove a contact from a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     * @fulfil {Bubble} - The bubble object or an error object depending on the result

	     */
	    removeContactFromBubble(contact: any, bubble: any): Promise<unknown>;
	    /**
	     * @method getAvatarFromBubble
	     * @public
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble   The destination bubble
	     * @async
	     * @return {Promise<{}>}  return a promise with {Object} A Blob object with data about the avatar picture.
	     * @description
	     *  Get A Blob object with data about the avatar picture of the bubble. <br>
	     */
	    getAvatarFromBubble(bubble: any): Promise<unknown>;
	    /**
	     * @private
	     * @method refreshMemberAndOrganizerLists
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble the bubble to refresh
	     * @async
	     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
	     * @description
	     *  Refresh members and organizers of the bubble. <br>
	     */
	    refreshMemberAndOrganizerLists(bubble: any): any;
	    /**
	     * @public
	     * @method getUsersFromBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble           The bubble
	     * @param {Object} options          The criterias to select the users to retrieve <br>
	     * format : Allows to retrieve more or less user details in response, besides specifics data about room users like (privilege, status and additionDate) <br>
	     * - small: userId loginEmail displayName jid_im <br>
	     * - medium: userId loginEmail displayName jid_im status additionDate privilege firstName lastName companyId companyName <br>
	     * - full: userId loginEmail displayName jid_im status additionDate privilege firstName lastName nickName title jobTitle emails country language timezone companyId companyName roles adminType <br>
	     * sortField : Sort items list based on the given field <br>
	     * privilege : Allows to filter users list on the privilege type provided in this option. <br>
	     * limit : Allow to specify the number of items to retrieve. <br>
	     * offset : Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. <br>
	     * sortOrder : Specify order when sorting items list. Available values -1, 1 (default) <br>
	     * @description
	     *  Get a list of users in a bubble filtered by criterias. <br>
	     * @async
	     * @return {Promise<Array, ErrorManager>}
	     */
	    getUsersFromBubble(bubble: any, options?: Object): Promise<unknown>;
	    /**
	     * @public
	     * @method getStatusForConnectedUserInBubble
	     * @instance
	     * @category Manage Bubbles - Bubbles FIELDS
	     * @param {Bubble} bubble           The bubble
	     * @description
	     *  Get the status of the connected user in a bubble <br>
	     * @async
	     * @return {Promise<Bubble, ErrorManager>}
	     */
	    getStatusForConnectedUserInBubble(bubble: any): any;
	    /**
	     * @public
	     * @method retrieveAllBubblesByTags
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles TAGS
	     * @param {Array<string>} tags List of tags to filter the retrieved bubbles. 64 tags max.
	     * @param {string} format Allows to retrieve more or less room details in response. <br>
	     * small: id, name, jid, isActive <br>
	     * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive, autoAcceptInvitation <br>
	     * full: all room fields <br>
	     * If full format is used, the list of users returned is truncated to 100 active users by default. <br>
	     * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned). <br>
	     * The total number of users being member of the room is returned in the field activeUsersCounter. <br>
	     * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users. <br>
	     * If full format is used, and whatever the status of the logged in user (active or unsubscribed), then he is added in first position of the users list. <br>
	     * Default value : small <br>
	     * Authorized value : small, medium, full <br>
	     * @param {number} nbUsersToKeep Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). <br>
	     * If value is set to -1, all active bubble members are returned. <br>
	     * Only usable if requested format is full (otherwise users field is not returned) <br>
	     * Default value : 100 <br>
	     * @return {Promise<{rooms, roomDetails}>}  return a promise with a list of  {rooms : List of rooms having the searched tag, roomDetails : List of rooms detail data according with format and nbUsersToKeep choices} filtered by tags or null
	     * @description
	     *  Get a list of {Bubble} filtered by tags. <br>
	     */
	    retrieveAllBubblesByTags(tags: Array<string>, format?: string, nbUsersToKeep?: number): Promise<any>;
	    /**
	     * @public
	     * @method setTagsOnABubble
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles TAGS
	     * @description
	     *      Set a list of tags on a {Bubble}. <br>
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
	     * @category Manage Bubbles - Bubbles TAGS
	     * @description
	     *  Delete a single tag on a list of {Bubble}. If the list of bubble is empty then every bubbles are concerned. <br>
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
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} name name The name of a rooms container created by the logged in user. <br>
	     * Two way to search containers are available:<br>
	     * a word search ('all containers that contain a word beginning with...'). So name=cont or name=container leads to find "My first Container", "my second container" ..<br>
	     * an exact match case insensitive for a list of container name. name=Container1&name=container2 eads to find 'Container1' and 'Container2' name (must be an exact match but we are case sensitive)<br>
	     * @description
	     *      retrieve the containers of bubbles from server. <br>
	     *      A filter can be provided for the search by a name. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    getAllBubblesContainers(name?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getABubblesContainersById
	     * @instance
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} id The id of the container of bubbles to retreive from server.
	     * @async
	     * @description
	     *       retrieve a containers of bubbles from server by it's id. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    getABubblesContainersById(id?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method addBubblesToContainerById
	     * @instance
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} containerId The id of the container of bubbles to retreive from server.
	     * @param {Array<string>} bubbleIds List of the bubbles Id to attach to the container.
	     * @async
	     * @description
	     *       Add a list of bubbles to a containers of bubbles on server by it's id. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    addBubblesToContainerById(containerId: string, bubbleIds: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method updateBubbleContainerNameAndDescriptionById
	     * @instance
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} containerId The id of the container of bubbles to retreive from server.
	     * @param {string} name The name of the container.
	     * @param {string} description The description of the container.
	     * @async
	     * @description
	     *       Change one rooms container name or description from server by it's id. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    updateBubbleContainerNameAndDescriptionById(containerId: string, name: string, description?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createBubbleContainer
	     * @instance
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} name The name of the container.
	     * @param {string} description The description of the container.
	     * @param {Array<string>} bubbleIds List of the bubbles Id to attach to the container.
	     * @async
	     * @description
	     *       Create one rooms container with name or description. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    createBubbleContainer(name: string, description?: string, bubbleIds?: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteBubbleContainer
	     * @instance
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} containerId The id of the container of bubbles to delete from server.
	     * @async
	     * @description
	     *       delete one container by id. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    deleteBubbleContainer(containerId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method removeBubblesFromContainer
	     * @instance
	     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
	     * @param {string} containerId The id of the container.
	     * @param {Array<string>} bubbleIds List of the bubbles Id to remove from the container.
	     * @async
	     * @description
	     *       remove rooms from a container by id. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    removeBubblesFromContainer(containerId: string, bubbleIds: Array<string>): Promise<unknown>;
	    /**
	     * @private
	     * @method getABubblePublicLinkAsModerator
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @param {string} bubbleId
	     * @param {boolean} emailContent
	     * @param {string} language
	     * @description
	     *     Any member with an Organizer role (moderator privilege) should be able to share the link of the bubble. This api allow to get the openInviteId bound with the given bubble. <br>
	     * @return {Promise<any>}
	     */
	    getABubblePublicLinkAsModerator(bubbleId?: string, emailContent?: boolean, language?: string): Promise<any>;
	    /**
	     * @private
	     * @method getInfoForPublicUrlFromOpenInvite
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @param {Object} openInvite contains informations about a bubbles invitation
	     * @description
	     *     get infos for the PublicUrl <br>
	     * @return {Promise<any>}
	     */
	    getInfoForPublicUrlFromOpenInvite(openInvite: any): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfBubbles
	     * @since 1.72
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @instance
	     * @description
	     *     get all the PublicUrl belongs to the connected user <br>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfBubbles(): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfBubblesOfAUser
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @param  {Contact} contact user used to get all his Public Url. If not setted the connected user is used.
	     * @description
	     *     get all the PublicUrl belongs to a user <br>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfBubblesOfAUser(contact?: Contact): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfABubble
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @param {Bubble} bubble bubble from where get the public link.
	     * @description
	     *     get all the PublicUrl of a bubble belongs to the connected user <br>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfABubble(bubble: any): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getAllPublicUrlOfABubbleOfAUser
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @param {Contact} contact user used to get all his Public Url. If not setted the connected user is used.
	     * @param {Bubble} bubble bubble from where get the public link.
	     * @description
	     *     get all the PublicUrl of a bubble belong's to a user <br>
	     * @return {Promise<any>}
	     */
	    getAllPublicUrlOfABubbleOfAUser(contact: Contact, bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method createPublicUrl
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @description
	     *    Create / Get the public URL used to access the specified bubble. So a Guest or a Rainbow user can access to it just using a URL <br>
	     *    Return a promise. <br>
	     * @param {Bubble} bubble The bubble on which the public url is requested.
	     * @return {Promise<string>} The public url
	     */
	    createPublicUrl(bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method generateNewPublicUrl
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @description
	     *    Generate a new public URL to access the specified bubble (So a Guest or a Rainbow user can access to it just using a URL) <br>
	     *    Return a promise. <br>
	     * <br>
	     *    !!! The previous URL is no more functional !!! <br>
	     * @param {Bubble} bubble The bubble on which the public url is requested.
	     * @return {Promise<string>} The public url
	     */
	    generateNewPublicUrl(bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method removePublicUrl
	     * @since 1.72
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @description
	     *    'Remove' the public URL used to access the specified bubble. So it's no more possible to access to this buble using this URL <br>
	     *    Return a promise. <br>
	     * @param {Bubble} bubble The bubble on which the public url must be deleted.
	     * @return {Promise<any>} An object of the result
	     */
	    removePublicUrl(bubble: Bubble): Promise<any>;
	    /**
	     * @public
	     * @method setBubbleAutoRegister
	     * @since 1.86
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @description
	     *    A user can create a room and not have to register users. He can share instead a public link also called 'public URL'(users public link).
	     *    According with autoRegister value, if another person uses the link to join the room:
	     *    autoRegister = 'unlock': If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room. (default value).
	     *    autoRegister = 'lock': If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room.
	     *    autoRegister = 'unlock_ack' (value not authorized yet): If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment.
	     *    Return a promise. <br>
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
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @description
	     *    retrieve the public url from public url object. <br>
	     * @param {Object} content   Id of the bubble
	     * @return {string} An url
	     */
	    getPublicURLFromResponseContent(content: any): string;
	    /**
	     * @public
	     * @method registerGuestForAPublicURL
	     * @since 1.75
	     * @instance
	     * @category Manage Bubbles - Bubbles PUBLIC URL
	     * @description
	     *    register a guest user with a mail and a password and join a bubble with a public url. <br>
	     *    For this use case, first generate a public link using createPublicUrl(bubbleId) API for the requested bubble. <br>
	     *    If the provided openInviteId is valid, the user account is created in guest mode (guestMode=true) <br>
	     *    and automatically joins the room to which the public link is bound. <br>
	     * <br>
	     *    Note: The guest account can be destroy only with a user having one of the following rights : superadmin,bp_admin,bp_finance,admin. <br>
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
	    /**
	     * @public
	     * @method createBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to create a Poll for a bubble. <br>
	     * @param {string} bubbleId bubble identifier.
	     * @param {string} title Poll title.
	     * @param {Object} questions
	     * [{<br>
	     *      text : string //Question text (up to 20 questions).<br>
	     *      multipleChoice : boolean //Is multiple choice allowed?<br>
	     *      answers : [{<br>
	     *           text : string // Answer text (up to 20 answers).<br>
	     *           }]<br>
	     * }] The questions to ask.<br>
	     * @param {boolean} anonymous Is poll anonymous? Default value : false
	     * @param {number} duration Poll duration (from 0 to 60 minutes, 0 means no duration). Default value : 0
	     * @return {Promise<any>} An object of the result
	     * {
	     *  pollId : string // Created poll identifier.
	     *  }
	     */
	    createBubblePoll(bubbleId: string, title: string, questions: Array<{
	        text: string;
	        multipleChoice: boolean;
	        answers: Array<{
	            text: string;
	        }>;
	    }>, anonymous?: boolean, duration?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to delete a Poll for a bubble. <br>
	     * @param {string} pollId poll identifier.
	     * @return {Promise<any>} An object of the result
	     */
	    deleteBubblePoll(pollId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to get data of a Poll for a bubble. <br>
	     * @param {string} pollId poll identifier.
	     * @param {string} format If format equals small, non-anonymous polls are sent in anonymous format. Default value : small. Possible values : small, full
	     * @return {Promise<any>} An object of the result
	     */
	    getBubblePoll(pollId: string, format?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getBubblePollsByBubble
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    Get polls for a room. They are ordered by creation date (from newest to oldest). Only moderator can get unpublished polls. <br>
	     * @param {string} bubbleId Bubble identifier.
	     * @param {string} format If format equals small, non-anonymous polls are sent in anonymous format. Default value : small. Possible values : small, full
	     * @return {Promise<any>} An object of the result
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] |     |
	     * | id  | String | Poll identifier. |
	     * | roomId | String | Room identifier. |
	     * | title optionnel | String | Poll title. |
	     * | questions | Object\[\] |     |
	     * | text | String | Question text. |
	     * | multipleChoice optionnel | Boolean | Is multiple choice allowed? |
	     * | answers | Object\[\] |     |
	     * | text | String | Answer text. |
	     * | votes optionnel | Number\[\] | Voter indexes in case of non-anonymous poll. |
	     * | voters optionnel | Number | Number of voters for this question in case of anonymous poll. |
	     * | voters optionnel | Object\[\] |     |
	     * | userId optionnel | String | Voter user identifier in case of non-anonymous poll. |
	     * | email optionnel | String | Voter login email in case of non-anonymous poll. |
	     * | firstName optionnel | String | Voter first name in case of non-anonymous poll. |
	     * | lastName optionnel | String | Voter last name in case of non-anonymous poll. |
	     * | anonymous optionnel | Boolean | Is poll anonymous? |
	     * | duration optionnel | Number | Poll duration (0 means no duration). |
	     * | creationDate | Date | Poll creation date. |
	     * | publishDate optionnel | Date | Poll publication date. |
	     * | state | String | Poll state.<br><br>Possible values : `unpublished`, `published`, `terminated` |
	     * | voted optionnel | Boolean | In case of published or terminated poll, did requester vote? |
	     * | limit | Number | Number of polls to retrieve. |
	     * | offset | Number | Position of first poll to retrieve. |
	     * | total | Number | Total number of polls. |
	     */
	    getBubblePollsByBubble(bubbleId: string, format: string, limit: number, offset: number): Promise<unknown>;
	    /**
	     * @public
	     * @method publishBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to publish a Poll for a bubble. <br>
	     * @param {string} pollId poll bubble identifier.
	     * @return {Promise<any>} An object of the result
	     *
	     */
	    publishBubblePoll(pollId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method terminateBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to terminate a Poll for a bubble. <br>
	     * @param {string} pollId poll bubble identifier.
	     * @return {Promise<any>} An object of the result
	     *
	     */
	    terminateBubblePoll(pollId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unpublishBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to unpublish a Poll for a bubble. <br>
	     * @param {string} pollId poll bubble identifier.
	     * @return {Promise<any>} An object of the result
	     *
	     */
	    unpublishBubblePoll(pollId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to update poll. When updating a question or an answer, all questions and answers must be present in body. <br>
	     * @param {string} pollId poll identifier.
	     * @param {string} bubbleId bubble identifier.
	     * @param {string} title Poll title.
	     * @param {Object} questions
	     * [{<br>
	     *      text : string //Question text (up to 20 questions).<br>
	     *      multipleChoice : boolean //Is multiple choice allowed?<br>
	     *      answers : [{<br>
	     *           text : string // Answer text (up to 20 answers).<br>
	     *           }]<br>
	     * }] The questions to ask.<br>
	     * @param {boolean} anonymous Is poll anonymous? Default value : false
	     * @param {number} duration Poll duration (from 0 to 60 minutes, 0 means no duration). Default value : 0
	     * @return {Promise<any>} An object of the result
	     *
	     */
	    updateBubblePoll(pollId: string, bubbleId: string, title: string, questions: Array<{
	        text: string;
	        multipleChoice: boolean;
	        answers: Array<{
	            text: string;
	        }>;
	    }>, anonymous?: boolean, duration?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method votesForBubblePoll
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Manage Bubbles - Bubbles Polls
	     * @description
	     *    This API allow to vote for a Poll for a bubble. <br>
	     * @param {string} pollId poll bubble identifier.
	     * @param {Array<Object>} votes Array< <br>
	     *  question : number // Question number (starts at 0). <br>
	     *  answers : number // Question answers (starts at 0). > <br>
	     * @return {Promise<any>} An object of the result
	     *
	     */
	    votesForBubblePoll(pollId: string, votes: Array<{
	        question: number;
	        answers: Array<number>;
	    }>): Promise<unknown>;
	    /**
	     * @public
	     * @method addPSTNParticipantToConference
	     * @instance
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} participantPhoneNumber Phone number to call.
	     * @param {string} country Country where the called number is from. If not provided, the user's country is taken.
	     * @since 2.2.0
	     * @async
	     * @description
	     *       Adds a PSTN participant to WebRTC conference. A SIP call is launched towards the requested phone number. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    addPSTNParticipantToConference(roomId: string, participantPhoneNumber: string, country: string): Promise<unknown>;
	    /**
	     * @public
	     * @method snapshotConference
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} limit Allows to specify the number of participants to retrieve.
	     * @param {string} offset Allows to specify the position of first participant to retrieve.
	     * @async
	     * @description
	     *       The snapshot command returns global information about conference and the set of participants engaged in the conference. <br>
	     *       If conference isn't started, 'active' will be 'false' and the participants list empty. <br>
	     *       If conference is started and the requester is in it, the response will contain global information about conference and the requested set of participants. <br>
	     *       If the conference is started and the requester, not conference owner, isn't in the conference, the response will contain global information about conference and an empty participants list. <br>
	     *       If the conference is started and the requester, conference owner, isn't in the conference, the response will contain global information about conference and the requested set of participants. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    snapshotConference(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method delegateConference
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId User identifier.
	     * @async
	     * @description
	     *       Current owner of the conference delegates its control to another user (this user must support conference delegation, i.e. "delegateCapability" was set to true when joining). <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    delegateConference(roomId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method disconnectPSTNParticipantFromConference
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Disconnect PSTN participant from conference. The request is sent by a conference's moderator. <br>
	     *       Conference: Moderator can drop any PSTN participant. <br>
	     *       Webinar: Organizer or speaker can drop any PSTN participant. <br>
	     *       Practice room: Not applicable <br>
	     *       Waiting room: Not applicable. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    disconnectPSTNParticipantFromConference(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method disconnectParticipantFromConference
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId User identifier.
	     * @async
	     * @description
	     *       Disconnect participant from conference. The request can be sent by participant himself or by a conference's moderator. <br>
	     *       Conference: Moderator can drop any participant except conference owner. <br>
	     *       Webinar: Organizer or speaker can drop any participant. <br>
	     *       Practice room: Organizer or speaker can drop any participant. When last participant is dropped, practice room stops. <br>
	     *       Waiting room: Not applicable. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    disconnectParticipantFromConference(roomId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getTalkingTimeForAllPparticipantsInConference
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} limit Allows to specify the number of participants to retrieve.
	     * @param {string} offset Allows to specify the position of first participant to retrieve.
	     * @async
	     * @description
	     *       The snapshot command returns global information about conference and the set of participants engaged in the conference. <br>
	     *       If conference isn't started, 'active' will be 'false' and the participants list empty. <br>
	     *       If conference is started and the requester is in it, the response will contain global information about conference and the requested set of participants. <br>
	     *       If the conference is started and the requester, not conference owner, isn't in the conference, the response will contain global information about conference and an empty participants list. <br>
	     *       If the conference is started and the requester, conference owner, isn't in the conference, the response will contain global information about conference and the requested set of participants. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    getTalkingTimeForAllPparticipantsInConference(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method joinConferenceV2
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     //* @param {string} mediaType For screen sharing during PSTN conference. Valid value : webrtcSharingOnly
	     * @param {string} participantPhoneNumber Join through dial.
	     * @param {string} country Country where the called number is from. If not provided, the user's country is taken.
	     * @param {string} deskphone User joins conference through his deskphone. Default value : false
	     * @param {Array<string>} dc TURN server prefix information associated to client location (DC = Data Center).
	     * @param {string} mute Join as muted/unmuted.
	     * @param {string} microphone Has client a microphone?
	     * @param {string} media Requested media. Default value : [audio,video] . Possible value : audio, video .
	     * @async
	     * @description
	     *       Adds a participant to a conference. In case of PSTN conference, the user will be called to the provided phone number (dial out). <br>
	     *           NOTE: The join can not be done without any audio/video media, because the server will close the connection after one minute.
	     * @return {Promise<any>} the result of the operation.

	     */
	    joinConferenceV2(roomId: string, participantPhoneNumber?: string, country?: string, deskphone?: boolean, dc?: Array<string>, mute?: boolean, microphone?: boolean, media?: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method pauseRecording
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Pauses the recording of a conference. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    pauseRecording(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method resumeRecording
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Resume the recording of a conference. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    resumeRecording(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method startRecording
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Start the recording of a conference. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    startRecording(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method stopRecording
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Stop the recording of a conference. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    stopRecording(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method rejectAVideoConference
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       User indicates that he rejects the conference (only available for WebRTC conferences). <br>
	     *       A XMPP message will be sent to all his clients in order for them to remove the incoming call popup. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    rejectAVideoConference(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method startConferenceOrWebinarInARoom
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       The start command initiates a conference in a room. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    startConferenceOrWebinarInARoom(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method stopConferenceOrWebinar
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       The stop command terminates an active conference identified in a room. All currently connected participants are disconnected. <br>
	     *       Conference: Only conference owner can stop it. <br>
	     *       Webinar: Any organizer can stop it. <br>
	     *       Practice room: Any organizer or speaker can stop it. <br>
	     *       Waiting room: Can't be stopped through API. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    stopConferenceOrWebinar(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeForParticipantVideoStream
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId User identifier.
	     * @param {string} media [or audioVideo] Concerned media. Default value in case of webinar is audio+video, else video. <br>
	     * default value : video <br>
	     * Authorized values : audio, video, audioVideo, sharing <br>
	     * @param {number} subStreamLevel Sub stream level (O=low, 2=high) to activate at startup. To be used only if simulcast is available at publisher side. <br>
	     * Authorized values : 0, 1, 2 <br>
	     * @param {boolean} dynamicFeed Declare a feed as dynamic. You will subscribe first to the feed associated to publisher, then switch to active talker's feed if present. <br>
	     *     Default value : false <br>
	     * @async
	     * @description
	     *       Gives the possibility to a user participating in a WebRTC conference to subscribe and receive a video stream published by an other user. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    subscribeForParticipantVideoStream(roomId: string, userId: string, media?: string, subStreamLevel?: number, dynamicFeed?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method updatePSTNParticipantParameters
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} phoneNumber Participant phone number.
	     * @param {string} option Mute/unmute the participant. <br>
	     *     Authorized values : mute, unmute
	     * @async
	     * @description
	     *       The update PSTN participant command can update different options of a participant. Only one option can be updated at a time. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    updatePSTNParticipantParameters(roomId: string, phoneNumber: string, option?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateConferenceParameters
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} option Following options are available: <br>
	     * Mute Mutes all participants, except requester. <br>
	     * Unmute Unmutes all participants. <br>
	     * Lock Disables any future participant from joining conference. <br>
	     * Unlock Unlocks the conference. <br>
	     * Webinar Changes practice room into webinar. <br>
	     *     Authorized values :  mute, unmute, lock, unlock, webinar <br>
	     * @async
	     * @description
	     *       The update conference command can update different options of a conference. Only one option can be updated at a time. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    updateConferenceParameters(roomId: string, option?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateParticipantParameters
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId Conference session participant identifier.
	     * @param {string} option Mute/unmute the participant. <br>
	     * Plug/unplug the microphone.<br>
	     * Update some media parameters:<br>
	     *     Update media bandwidth as publisher. Two parameters must be present: media and bitRate.<br>
	     *     Update substream level as subscriber. One parameter must be present: subStreamLevel. Parameter publisherId is optional.<br>
	     * Authorized values : mute, unmute, update, plug, unplug<br>
	     * @param {string} media Media for which the bitrate will be updated.
	     * Authorized values : video, sharing
	     * @param {number} bitRate Maximum bitrate value in kbps. If 0, no limit of bandwidth usage.
	     * Authorized values : 0..4096
	     * @param {number} subStreamLevel Substream level (only when simulcast is enabled).
	     * Authorized values : 0, 1, 2
	     * @param {string} publisherId Publisher identifier for which the substream level will be updated (a user identifier).
	     * @async
	     * @description
	     *       The update participant command can update different options of a participant. Only one option can be updated at a time. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    updateParticipantParameters(roomId: string, userId: string, option: string, media: string, bitRate: number, subStreamLevel: number, publisherId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method allowTalkWebinar
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId User identifier. <br>
	     * @async
	     * @description
	     *       Webinar: allow a participant who raised his hand to talk. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    allowTalkWebinar(roomId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method disableTalkWebinar
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId User identifier. <br>
	     * @async
	     * @description
	     *       Webinar: disable a participant who raised his hand to talk. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    disableTalkWebinar(roomId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method lowerHandWebinar
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Webinar: participant lowers hand. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    lowerHandWebinar(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method raiseHandWebinar
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @async
	     * @description
	     *       Webinar: participant raises hand. <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    raiseHandWebinar(roomId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method stageDescriptionWebinar
	     * @instance
	     * @since 2.2.0
	     * @category Conference V2
	     * @param {string} roomId The id of the room.
	     * @param {string} userId For each actor, his user identifier.
	     * @param {string} type For each actor, how is he on scene: as a participant (avatar or video) or as a screen sharing. <br>
	     * Authorized values : participant, sharing
	     * @param {Array<string>} properties For each actor, up to 10 properties.
	     * @async
	     * @description
	     *       Webinar: stage description (up to 10 actors). <br>
	     * @return {Promise<any>} the result of the operation.

	     */
	    stageDescriptionWebinar(roomId: string, userId: string, type: string, properties: Array<string>): Promise<unknown>;
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
	    init(useRestAtStartup: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method createGroup
	     * @instance
	     * @param {string} name The name of the group to create
	     * @param {string} comment The comment of the group to create
	     * @param {boolean} isFavorite If true, the group is flagged as favorite
	     * @description
	     *      Create a new group <br>
	     * @async
	     * @category Groups MANAGEMENT
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
	    *    Delete an owned group <br>
	    * @async
	     * @category Groups MANAGEMENT
	     * @return {Promise<Object, ErrorManager>}
	    * @fulfil {Group} - Deleted group object or an error object depending on the result
	    * @category async
	    */
	    deleteGroup(group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAllGroups
	     * @instance
	     * @async
	     * @category Groups MANAGEMENT
	     * @description
	     *    Delete all existing owned groups <br>
	     *    Return a promise <br>
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    deleteAllGroups(): Promise<unknown>;
	    /**
	     * @public
	     * @method updateGroupName
	     * @instance
	     * @async
	     * @category Groups MANAGEMENT
	     * @param {Object} group The group to update
	     * @param {string} name The new name of the group
	     * @description
	     * 		Update the name of a group <br>
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group object or an error object depending on the result
	     * @category async
	     */
	    updateGroupName(group: any, name: any): Promise<unknown>;
	    /**
	     * @private
	     * @category Groups MANAGEMENT
	     * @description
	     *      Internal method <br>
	     */
	    getGroups(): Promise<unknown>;
	    /**
	    * @public
	    * @method setGroupAsFavorite
	    * @since 1.67.0
	    * @async
	    * @category Groups MANAGEMENT
	    * @instance
	    * @param {Object} group The group
	    * @description
	    * 		Set a group as a favorite one of the curent loggued in user. <br>
	    * @return {Promise<Object, ErrorManager>}
	    * @fulfil {Group} - Updated group or an error object depending on the result
	    * @category async
	    */
	    setGroupAsFavorite(group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method unsetGroupAsFavorite
	     * @since 1.67.0
	     * @category Groups MANAGEMENT
	     * @async
	     * @instance
	     * @param {Object} group The group
	     * @description
	     * 		Remove the favorite state of a group of the curent loggued in user. <br>
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group or an error object depending on the result
	     * @category async
	     */
	    async: any;
	    unsetGroupAsFavorite(group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getAll
	     * @category Groups MANAGEMENT
	     * @instance
	     * @return {Array} The list of existing groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
	     * @description
	     *  Return the list of existing groups <br>
	     */
	    getAll(): any;
	    /**
	     * @public
	     * @method getFavoriteGroups
	     * @category Groups MANAGEMENT
	     * @instance
	     * @return {Array} The list of favorite groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
	     * @description
	     *  Return the list of favorite groups <br>
	     */
	    getFavoriteGroups(): any;
	    /**
	     * @public
	     * @method getGroupById
	     * @category Groups MANAGEMENT
	     * @instance
	     * @async
	     * @param {String} id group Id of the group to found
	     * @return {Promise<any>} The group found if exist or undefined
	     * @description
	     *  Return a group by its id <br>
	     */
	    getGroupById(id: string, forceServerSearch?: boolean): Promise<any>;
	    /**
	     * @public
	     * @method getGroupByName
	     * @category Groups MANAGEMENT
	     * @instance
	     * @async
	     * @param {String} name Name of the group to found
	     * @param {boolean} forceServerSearch force the update from server.
	     * @return {Promise<any>} The group found if exist or undefined
	     * @description
	     *  Return a group by its id <br>
	     */
	    getGroupByName(name: string, forceServerSearch?: boolean): Promise<any>;
	    /**
	     * @public
	     * @method addUserInGroup
	     * @instance
	     * @async
	     * @category Groups USERS
	     * @param {Contact} contact The user to add in group
	     * @param {Object} group The group
	     * @description
	     * 		Add a contact in a group <br>
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group with the new contact added or an error object depending on the result
	     * @category async
	     */
	    addUserInGroup(contact: any, group: any): Promise<unknown>;
	    /**
	     * @public
	     * @method removeUserFromGroup
	     * @instance
	     * @async
	     * @category Groups USERS
	     * @param {Contact} contact The user to remove from the group
	     * @param {Object} group The destination group
	     * @description
	     *		Remove a contact from a group <br>
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Group} - Updated group without the removed contact or an error object depending on the result
	     * @category async
	     */
	    removeUserFromGroup(contact: any, group: any): Promise<unknown>;
	    /**
	     * @private
	     * @method _onGroupCreated
	     * @instance
	     * @param {Object} data Contains the groupId of the created group
	     * @description
	     *		Method called when a group is created <br>
	     */
	    _onGroupCreated(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onGroupDeleted
	     * @instance
	     * @param {Object} data Contains the groupId of the deleted group
	     * @description
	     *		Method called when a group is deleted <br>
	     */
	    _onGroupDeleted(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onGroupUpdated
	     * @instance
	     * @param {Object} data Contains the groupId of the updated group
	     * @description
	     *		Method called when a group is updated (name, comment, isFavorite) <br>
	     */
	    _onGroupUpdated(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onUserAddedInGroup
	     * @instance
	     * @param {Object} data Contains the groupId and the userId
	     * @description
	     *		Method called when a user is added to a group <br>
	     */
	    _onUserAddedInGroup(data: any): Promise<void>;
	    /**
	     * @private
	     * @method _onUserRemovedFromGroup
	     * @instance
	     * @param {Object} data Contains the groupId and the userId
	     * @description
	     *		Method called when a user is removed from a group <br>
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
	    init(useRestAtStartup: boolean): Promise<void>;
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
	    /**
	     * @private
	     */
	    getAllReceivedInvitations(): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method getReceivedInvitations
	     * @instance
	     * @category Invitations RECEIVED
	     * @description
	     *    Get the invite received coming from Rainbow users <br>
	     * @return {Invitation[]} The list of invitations received
	     */
	    getReceivedInvitations(): any[];
	    /**
	     * @public
	     * @since 2.9.0
	     * @method searchInvitationsReceivedFromServer
	     * @instance
	     * @category Invitations RECEIVED
	     * @param {string} sortField Sort items list based on the given field. Default value : lastNotificationDate.
	     * @param {string} status List all invitations having the provided status(es). Possible values : pending, accepted, auto-accepted, declined, canceled, failed. Default value : pending.
	     * @param {string} format Allows to retrieve more or less invitation details in response. Default value : `small`. Possible values : `small`, `medium`, `full`
	     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 500
	     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.
	     * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possible values : -1, 1.
	     * @description
	     *    retrieve the invites received from others Rainbow users from server.<br>
	     * @return {any} The list of invite received
	     */
	    searchInvitationsReceivedFromServer(sortField: string, status: string, format: string, limit: number, offset: number, sortOrder: number): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method 	getAcceptedInvitations
	     * @instance
	     * @category Invitations RECEIVED
	     * @description
	     *    Get the invites you accepted received from others Rainbow users <br>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getAcceptedInvitations(): any[];
	    /**
	     * @public
	     * @since 1.65
	     * @method getInvitationsNumberForCounter
	     * @category Invitations RECEIVED
	     * @instance
	     * @description
	     *    Get the number of invitations received from others Rainbow users <br>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getInvitationsNumberForCounter(): number;
	    getServerInvitation(invitationId: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method getInvitation
	     * @instance
	     * @category Invitations RECEIVED
	     * @description
	     *    Get an invite by its id <br>
	     * @param {String} invitationId the id of the invite to retrieve
	     * @return {Invitation} The invite if found
	     */
	    getInvitation(invitationId: any): any;
	    /**
	     * @public
	     * @since 1.65
	     * @method joinContactInvitation
	     * @instance
	     * @category Invitations RECEIVED
	     * @async
	     * @description
	     *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once accepted, the user will be part of your network. <br>
	     *    Return a promise <br>
	     * @param {Contact} contact The invitation to accept
	     * @return {Promise<Object>} A promise that contains SDK.OK if success or an object that describes the error
	     */
	    joinContactInvitation(contact: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method acceptInvitation
	     * @instance
	     * @category Invitations RECEIVED
	     * @async
	     * @description
	     *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once accepted, the user will be part of your network. <br>
	     *    Return a promise <br>
	     * @param {Invitation} invitation The invitation to accept
	     * @return {Promise<Object>} A promise that contains SDK.OK if success or an object that describes the error
	     */
	    acceptInvitation(invitation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method declineInvitation
	     * @instance
	     * @category Invitations RECEIVED
	     * @async
	     * @description
	     *    Decline an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once declined, the user will not be part of your network. <br>
	     *    Return a promise <br>
	     * @param {Invitation} invitation The invitation to decline
	     * @return {Promise<Object>} A promise that contains SDK.OK in case of success or an object that describes the error
	     */
	    declineInvitation(invitation: any): Promise<unknown>;
	    /**
	     * @private
	     */
	    getAllSentInvitations(): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method getSentInvitations
	     * @instance
	     * @category Invitations SENT
	     * @description
	     *    Get the invites sent to others Rainbow users <br>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getSentInvitations(): any[];
	    /**
	     * @public
	     * @since 2.9.0
	     * @method searchInvitationsSentFromServer
	     * @instance
	     * @category Invitations SENT
	     * @param {string} sortField Sort items list based on the given field. Default value : lastNotificationDate
	     * @param {string} status List all invitations having the provided status(es). Possible values : pending, accepted, auto-accepted, declined, canceled, failed. Default value : pending.
	     * @param {string} format Allows to retrieve more or less invitation details in response. Default value : `small`. Possible values : `small`, `medium`, `full`
	     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 500
	     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.
	     * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possible values : -1, 1.
	     * @description
	     *    retrieve the invites sent to others Rainbow users from server.<br>
	     * @return {any} The list of invite sent
	     */
	    searchInvitationsSentFromServer(sortField: string, status: string, format: string, limit: number, offset: number, sortOrder: number): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method sendInvitationByEmail
	     * @instance
	     * @category Invitations SENT
	     * @async
	     * @description
	     *    This API allows logged in user to invite another user by email. <br>
	     *    At the end of the process, if invited user accepts the invitation, invited user and inviting user will be searchable mutually and will be in each other rosters.  <br>
	     * @param {string} email The email.
	     * @param {string} lang The lang of the message.
	     * @param {string} customMessage The email text (optional).
	     * @return {Object} A promise that contains the contact added or an object describing an error
	     */
	    sendInvitationByEmail(email: string, lang: string, customMessage: string): Promise<unknown>;
	    /**
	     * @public
	     * @since 2.9.0
	     * @method sendInvitationByCriteria
	     * @instance
	     * @category Invitations SENT
	     * @async
	     * @description
	     *    This API allows logged in user to invite another user by criteria. <br>
	     *    At the end of the process, if invited user accepts the invitation, invited user and inviting user will be searchable mutually and will be in each other rosters.  <br>
	     *
	     *
	     * **Notes**:
	     *
	     * * One of email, invitedPhoneNumber or invitedUserId is mandatory.
	     * * It's not possible to invite users having only the role `guest`. (CPAAS user)
	     * * Users with visibility `isolated` or being in a company with visibility `isolated` are not allowed to invite external users.
	     * * Users with visibility `isolated` or being in a company with visibility `isolated` are not allowed to be invited by external users.
	     *    From **1.53.0**, a user can be embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration.
	     *    It is not a user with the role `guest`.
	     *    This user gets the role `user` and the flag `guestMode` is set to true, waiting for the user finalizes his account. Besides, his `visibility` is 'none'.
	     *    We can't invite this kind of user to join the logged in network. (HTTP error 403509)
	     *
	     *    Here are some details about this API and user invitation features.
	     *    Users can be invited:
	     *
	     * * by `email`:
	     *    * If the provided email corresponds to the loginEmail of a Rainbow user, a visibility request is sent (if this Rainbow user is not in logged in user roster).
	     *        * An InviteUser entry is stored in database (with a generated invitationId).
	     *        * The invited user receive an email with a validation link (containing the invitationId).
	     *        * The invited user is notified with an XMPP message (containing the invitationId).
	     *            <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite action="create" id='57cd5922d341df5812bbcb72' type='received' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	     *        * The inviting user is notified with an XMPP message (containing the invitationId) (useful for multi-device).
	     *            <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite action="create" id='57cd5922d341df5812bbcb72' type='sent' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	     *        * The list of all visibility requests received by the logged in user (invited user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetReceivedInvites)
	     *        * The list of all visibility requests sent by the logged in user (inviting user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetSentInvites)
	     *        * The inviting user can re-send a visibility request notification (only by email) using API [POST /api/rainbow/enduser/v1.0/notifications/emails/invite-by-end-user/:invitationId/re-send](#api-enduser_notifications_emails-enduser_ResendInvite)
	     *        * To accept the visibility request (invited user side), client has to call API [POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/accept](#api-enduser_invitations-enduser_users_AcceptInvites)
	     *            Once accepted, invited and inviting user will be in each other roster and will be mutually visible (search API, GET users, GET users/:userId, ...)
	     *        * To decline the visibility request (invited user side), client has to call API [POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/decline](#api-enduser_invitations-enduser_users_DeclineInvites)
	     *    * If the provided email is not known in Rainbow, an invitation is sent to this email to invite the person to create a Rainbow account
	     *        * An InviteUser entry is stored in database (with a generated invitationId).
	     *        * The invited user receive an email with a creation link (containing the invitationId).
	     *        * The inviting user is notified with an XMPP message (containing the invitationId) (useful for multi-device).
	     *            <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite id='57cd5922d341df5812bbcb72' action="create" type='sent' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	     *        * The list of all visibility requests sent by the logged in user (inviting user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetSentInvites)
	     *        * The inviting user can re-send a visibility request notification (only by email) using API [POST /api/rainbow/enduser/v1.0/notifications/emails/invite-by-end-user/:invitationId/re-send](#api-enduser_notifications_emails-enduser_ResendInvite)
	     *        * To create his Rainbow account, the invited user has to use API "Self register a user" ([POST /api/rainbow/enduser/v1.0/users/self-register](#api-enduser_users-enduser_SelfRegisterUsers))
	     * * by phoneNumber (`invitedPhoneNumber`):
	     *    * No match is done on potential existing Rainbow users.
	     *    * An InviteUser entry is stored in database (with a generated invitationId).
	     *    * No email is sent to invited user. It is **up to clients calling this API to send an SMS to the invited user's phone** (with the invitationId).
	     *    * The inviting user is notified with an XMPP message (containing the invitationId) (useful for multi-device).
	     *        <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite id='57cd5922d341df5812bbcb72' action="create" type='sent' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	     *    * If the invitedPhoneNumber correspond to a user already existing in Rainbow, he **will not** be able to see the request using the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetReceivedInvites), as no match is done between the invitedPhoneNumber and a potential user existing in Rainbow
	     *    * The list of all visibility requests sent by the logged in user (inviting user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetSentInvites)
	     *    * The inviting user can re-send a visibility request notification done by phoneNumber using API [POST /api/rainbow/enduser/v1.0/notifications/emails/invite-by-end-user/:invitationId/re-send](#api-enduser_notifications_emails-enduser_ResendInvite), however it is still **up to client to send an SMS to the invited user's phone** (the API only updates the field lastNotificationDate). If needed, it is **up to clients to re-send the SMS to the invited user's phone**.
	     *    * To create his Rainbow account, the invited user has to use API "Self register a user" using the associated invitationId ([POST /api/rainbow/enduser/v1.0/users/self-register](#api-enduser_users-enduser_SelfRegisterUsers))
	     * * by Rainbow user id (`invitedUserId`):
	     *    * if no user is found with the provided invitedUserId, an error 404 is returned
	     *    * otherwise, a visibility request is sent (if this Rainbow user is not in logged in user roster).
	     *        Same documentation than existing user invited by email apply (see above).
	     * @param {string} email The email.
	     * @param {string} invitedPhoneNumber Invited phone number.
	     * @param {string} invitedUserId Invited Rainbow user unique ID
	     * @param {string} lang The lang of the message.
	     * @param {string} customMessage The email text (optional).
	     * @return {Object} A promise that contains the contact added or an object describing an error
	     */
	    sendInvitationByCriteria(email: string, invitedPhoneNumber: string, invitedUserId: string, lang: string, customMessage: string): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method cancelOneSendInvitation
	     * @instance
	     * @category Invitations SENT
	     * @async
	     * @param {Invitation} invitation The invitation to cancel
	     * @description
	     *    Cancel an invitation sent <br>
	     * @return {Object} The SDK Ok object or an error
	     */
	    cancelOneSendInvitation(invitation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method reSendInvitation
	     * @instance
	     * @category Invitations SENT
	     * @async
	     * @param {Number} invitationId The invitation to re send
	     * @description
	     *    Re send an invitation sent <br>
	     * @return {Object} The SDK Ok object or an error
	     */
	    reSendInvitation(invitationId: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method sendInvitationsByBulk
	     * @instance
	     * @category Invitations SENT
	     * @async
	     * @description
	     *    Send invitations for a list of emails as UCaaS <br>
	     *    LIMITED TO 100 invitations <br>
	     * @param {Array} listOfMails The list of emails
	     * @return {Object} A promise that the invite result or an object describing an error
	     */
	    sendInvitationsByBulk(listOfMails: any): Promise<unknown>;
	    sendInvitationsParBulk(listOfMails: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.65
	     * @method getAllInvitationsNumber
	     * @instance
	     * @category Invitations RECEIVED/SENT
	     * @description
	     *    Get the number of invitations sent/received to/from others Rainbow users <br>
	     * @return {Invitation[]} The list of invite sent
	     */
	    getAllInvitationsNumber: () => any;
	    /**
	     * @private
	     */
	    updateContactInvitationStatus(contactDBId: any, status: any, invitation: any): Promise<unknown>;
	    /**
	     * @private
	     */
	    sortInvitationArray(invitA: any, invitB: any): number;
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
	    userContact: Contact;
	    private _rosterPresenceQueue;
	    private _rosterPresenceQueue3;
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
	    init(useRestAtStartup: boolean): Promise<unknown>;
	    cleanMemoryCache(): void;
	    createEmptyContactContact(jid: any): Contact;
	    getContact(jid: any, phoneNumber: any): any;
	    getOrCreateContact(jid: any, phoneNumber: any): Promise<any>;
	    createBasicContact(jid: any, phoneNumber?: any): Contact;
	    /**
	     * @public
	     * @method getAll
	     * @category Contacts INFORMATIONS
	     * @instance
	     * @return {Contact[]} the list of _contacts
	     * @description
	     *  Return the list of _contacts that are in the network of the connected users (aka rosters) <br>
	     */
	    getAll(): Array<Contact>;
	    /**
	     * @public
	     * @method getContactByJid
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {string} jid The contact jid
	     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
	     * @description
	     *  Get a contact by his JID by searching in the connected user _contacts list (full information) and if not found by searching on the server too (limited set of information) <br>
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Found contact or null or an error object depending on the result

	     */
	    getContactByJid(jid: string, forceServerSearch?: boolean): Promise<Contact>;
	    /**
	     * @public
	     * @method getContactById
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {string} id The contact id
	     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
	     * @description
	     *  Get a contact by his id <br>
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Found contact or null or an error object depending on the result

	     */
	    getContactById(id: string, forceServerSearch?: boolean): Promise<Contact>;
	    /**
	     * @public
	     * @method getContactByLoginEmail
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {string} loginEmail The contact loginEmail
	     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
	     * @description
	     *  Get a contact by his loginEmail <br>
	     * @async
	     * @return {Promise<Contact, ErrorManager>}
	     * @fulfil {Contact} - Found contact or null or an error object depending on the result

	     */
	    getContactByLoginEmail(loginEmail: string, forceServerSearch?: boolean): Promise<Contact>;
	    /**
	     * @public
	     * @method getMyInformations
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @description
	     *  Get informations about the connected user <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Found informations or null or an error object depending on the result

	     */
	    getMyInformations(): Promise<Contact>;
	    /**
	     * @public
	     * @method getCompanyInfos
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {string} companyId The company id
	     * @param {string} format
	     * @param {boolean} selectedThemeObj
	     * @param {string} name
	     * @param {string} status
	     * @param {string} visibility
	     * @param {string} organisationId
	     * @param {boolean} isBP
	     * @param {boolean} hasBP
	     * @param {string} bpType
	     * @description
	     *  This API allows user to get a company data.<br>
	     *     **Users can only retrieve their own company and companies they can see** (companies with `visibility`=`public`, companies having user's companyId in `visibleBy` field, companies being in user's company organization and having `visibility`=`organization`, BP company of user's company).<br>
	     *     If user request his own company, `numberUsers` field is returned with the number of Rainbow users being in this company. <br>
	     * @return {string} Contact avatar URL or file
	     */
	    getCompanyInfos(companyId?: string, format?: string, selectedThemeObj?: boolean, name?: string, status?: string, visibility?: string, organisationId?: string, isBP?: boolean, hasBP?: boolean, bpType?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAvatarByContactId
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {string} id The contact id
	     * @param {string} lastAvatarUpdateDate use this field to give the stored date ( could be retrieved with contact.lastAvatarUpdateDate )
	     *      if missing or null in case where no avatar available a local module file is provided instead of URL
	     * @description
	     *  Get a contact avatar by his contact id <br>
	     * @return {string} Contact avatar URL or file
	     */
	    getAvatarByContactId(id: string, lastAvatarUpdateDate: string): string;
	    /**
	     * @public
	     * @method getConnectedUser
	     * @category Contacts INFORMATIONS
	     * @instance
	     * @description
	     *    Get the connected user information <br>
	     * @return {Contact} Return a Contact object representing the connected user information or null if not connected
	     */
	    getConnectedUser(): Contact;
	    /**
	     * @public
	     * @method getDisplayName
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {Contact} contact  The contact to get display name
	     * @return {string} The contact first name and last name
	     * @description
	     *      Get the display name of a contact <br>
	     */
	    getDisplayName(contact: Contact): string;
	    /**
	     * @public
	     * @method updateMyInformations
	     * @instance
	     * @category Contacts INFORMATIONS
	     * @param {Object} dataToUpdate :
	     * {
	     * {string} number User phone number (as entered by user). Not mandatory if the PhoneNumber to update is a PhoneNumber linked to a system (pbx) Ordre de grandeur : 1..32
	     * {string} type 	String Phone number type Possible values : home, work, other
	     * {string} deviceType 	String Phone number device type Possible values : landline, mobile, fax, other
	     * {boolean} isVisibleByOthers optionnel 	Boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers.
	     * {string} shortNumber optionnel 	String [Only for update of PhoneNumbers linked to a system (pbx)] Short phone number (corresponds to the number monitored by PCG). Read only field, only used by server to find the related system PhoneNumber to update (couple shortNumber/systemId). Ordre de grandeur : 1..32
	     * {string} systemId optionnel 	String [Only for update of PhoneNumbers linked to a system (pbx)] Unique identifier of the system in Rainbow database to which the system PhoneNumbers belong. Read only field, only used by server to find the related system PhoneNumber to update (couple shortNumber/systemId). Ordre de grandeur : 1..32
	     * {string} internalNumber optionnel 	String [Only for update of PhoneNumbers linked to a system (pbx)] Internal phone number. Usable within a PBX group. By default, it is equal to shortNumber. Admins and users can modify this internalNumber field. internalNumber must be unique in the whole system group to which the related PhoneNumber belong (an error 409 is raised if someone tries to update internalNumber to a number already used by another PhoneNumber in the same system group). Ordre de grandeur : 1..32
	     * {Array<string>} emails optionnel 	Object Array of user emails addresses objects
	     * {Array<string>} phoneNumbers optionnel 	Object[] Array of user PhoneNumbers objects Notes: Provided PhoneNumbers data overwrite previous values: PhoneNumbers which are not known on server side are added, PhoneNumbers which are changed are updated, PhoneNumbers which are not provided but existed on server side are deleted. This does not applies to PhoneNumbers linked to a system(pbx), which can only be updated (addition and deletion of system PhoneNumbers are ignored). When number is present, the server tries to compute the associated E.164 number (numberE164 field) using provided PhoneNumber country if available, user country otherwise. If numberE164 can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) PhoneNumber linked to a system (pbx) can also be updated. In that case, shortNumber and systemId of the existing system PhoneNumber must be provided with the fields to update (see example bellow).     * System phoneNumbers can't be created nor deleted using this API, only PCG can create/delete system PhoneNumbers.
	     * {string} selectedTheme optionnel 	String Theme to be used by the user If the user is allowed to (company has 'allowUserSelectTheme' set to true), he can choose his preferred theme among the list of supported themes (see https://openrainbow.com/api/rainbow/enduser/v1.0/themes).
	     * {string} firstName optionnel 	String User first name Ordre de grandeur : 1..255
	     * {string} lastName optionnel 	String User last name Ordre de grandeur : 1..255
	     * {string} nickName optionnel 	String User nickName Ordre de grandeur : 1..255
	     * {string} title optionnel 	String User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) Ordre de grandeur : 1..40
	     * {string} jobTitle optionnel 	String User job title Ordre de grandeur : 1..255
	     * {string} visibility optionnel 	String User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Default value : same_than_company Possible values : same_than_company, public, private, closed, isolated, none
	     * {boolean} isInitialized optionnel 	Boolean Is user initialized
	     * {string} timezone optionnel 	String User timezone name Allowed values: one of the timezone names defined in IANA tz database Timezone name are composed as follow: Area/Location (ex: Europe/Paris, America/New_York,...)
	     * {string} language optionnel 	String User language Language format is composed of locale using format ISO 639-1, with optionally the regional variation using ISO 3166‑1 alpha-2 (separated by hyphen). Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... More information about the format can be found on this link. Ordre de grandeur : 2|5
	     * {string} state optionnel 	String When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null).
	     * {string} country optionnel 	String User country (ISO 3166-1 alpha3 format) Ordre de grandeur : 3
	     * {string} department optionnel 	String User department Ordre de grandeur : 1..255
	     * {string} email 	String User email address Ordre de grandeur : 3..255
	     * {string} country optionnel 	String Phone number country (ISO 3166-1 alpha3 format). country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used Note that in the case number field is set (but not in E164 format), associated numberE164 field is computed using phoneNumber'country field. So, number and country field must match so that numberE164 can be computed. Ordre de grandeur : 3
	     * {string} type 	String User email type Possible values : home, work, other
	     * {string} customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. User customData can only be created/updated by: the user himself `company_admin` or `organization_admin` of his company, `bp_admin` and `bp_finance` of his company, `superadmin`.
	     * }
	     *
	     * @return {string} The contact first name and last name
	     * @description
	     *          This API can be used to update data of logged in user. This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL)
	     */
	    updateMyInformations(dataToUpdate: any): Promise<any>;
	    isTelJid(jid: any): boolean;
	    getImJid(jid: any): any;
	    getRessourceFromJid(jid: any): string;
	    isUserContactJid(jid: any): boolean;
	    isUserContact(contact: Contact): boolean;
	    /**
	     * @public
	     * @method getRosters
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *      Get the list of _contacts that are in the user's network (aka rosters) <br>
	     * @async
	     * @return {Promise<Array<Contact>,ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)

	     */
	    getRosters(): Promise<Array<Contact>>;
	    /**
	     * @public
	     * @since 1.17
	     * @method addToNetwork
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    Send an invitation to a Rainbow user for joining his network. <br>
	     *    The user will receive an invitation that can be accepted or declined <br>
	     *    In return, when accepted, he will be part of your network <br>
	     *    When in the same company, invitation is automatically accepted (ie: can't be declined) <br>
	     * @param {Contact} contact The contact object to subscribe
	     * @return {Promise<Contact>} A promise that contains the contact added or an object describing an error
	     */
	    addToNetwork(contact: Contact): Promise<Contact>;
	    /**
	     * @public
	     * @since 1.17
	     * @method addToContactsList
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    Send an invitation to a Rainbow user for joining his network. <br>
	     *    The user will receive an invitation that can be accepted or declined <br>
	     *    In return, when accepted, he will be part of your network <br>
	     *    When in the same company, invitation is automatically accepted (ie: can't be declined) <br>
	     * @param {Contact} contact The contact object to subscribe
	     * @return {Promise<Contact>} A promise that contains the contact added or an object describing an error

	     */
	    addToContactsList(contact: Contact): Promise<Contact>;
	    /**
	     * @public
	     * @method removeFromNetwork
	     * @since 1.69
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    Remove a contact from the list of contacts and unsubscribe to the contact's presence <br>
	     * @param {Contact} contact The contact object to unsubscribe
	     * @returns {Promise} A promise that contains success code if removed or an object describing an error
	     */
	    removeFromNetwork(contact: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.64.0
	     * @method getInvitationById
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    Get an invite by its id <br>
	     * @param {string} strInvitationId the id of the invite to retrieve
	     * @return {Invitation} The invite if found
	     */
	    getInvitationById(strInvitationId: string): Promise<any>;
	    /**
	     * @public
	     * @since 1.17
	     * @method acceptInvitation
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    Accept an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once accepted, the user will be part of your network. <br>
	     *    Return a promise <br>
	     * @param {Invitation} invitation The invitation to accept
	     * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
	     */
	    acceptInvitation(invitation: Invitation): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.17
	     * @method declineInvitation
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    Decline an invitation from an other Rainbow user to mutually join the network <br>
	     *    Once declined, the user will not be part of your network. <br>
	     *    Return a promise <br>
	     * @param {Invitation} invitation The invitation to decline
	     * @return {Object} A promise that contains SDK.OK in case of success or an object that describes the error
	     */
	    declineInvitation(invitation: Invitation): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.41
	     * @beta
	     * @method joinContacts
	     * @instance
	     * @category Contacts NETWORK
	     * @description
	     *    As admin, add _contacts to a user roster <br>
	     * @param {Contact} contact The contact object to subscribe
	     * @param {Array<string>} contactIds List of contactId to add to the user roster
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {any} - Join result or an error object depending on the result
	     */
	    joinContacts(contact: Contact, contactIds: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method searchInAlldirectories
	     * @since 2.8.9
	     * @instance
	     * @category Contacts Search
	     * @description
	     * This API allows to search for resources matching given keywords. <br>
	     * Depending on the provided query parameters, search can be done: <br>
	     *   * on shortNumber
	     *   * on numberE164
	     * <br>
	     * <br>
	     * For both cases, systemId or pbxId must be provided, corresponding to the identifier of the system for which the search is requested. <br>
	     * <br>
	     * This API tries to find a resource in the directories:
	     *   * PBX devices of the system for which the search is requested, if associated to a Rainbow user (PBX devices of all systems belonging to the system's group if applicable),
	     *   * phonebook of the system for which the search is requested (phonebooks of all systems belonging to the system's group if applicable),
	     *   * Office365 database associated to the company(ies) to which is(are) linked the system for which the search is requested,
	     *   * Business directory database associated to the company(ies) to which is(are) linked the system for which the search is requested.
	     *    <br>
	     * If several entries match in several directories, the order defined in searchResultOrder setting of the system is applied. <br>
	     *    <br>
	     * @return {Promise<any>} An object of the result
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | firstName | String | First name as it is present in one directory (either phonebbok,user or ActiveDirectory) |
	     * | lastName | String | Last name as it is present in one directory (either phonebbok,user or ActiveDirectory) |
	     * | id  | String | id of the user (if a user is found) |
	     * | jid_im | String | jid_im of the user (if a user is found) |
	     *
	     * @param {string} pbxId pbxId of the system for which the search is requested. One of systemId or pbxId is mandatory.
	     * @param {string} systemId identifier of the system for which the search is requested. One of systemId or pbxId is mandatory.
	     * @param {string} numberE164 Allows to filter users list on the numberE164 provided in this option.
	     * @param {string} shortnumber Allows to filter users list on the phone short number provided in this option.
	     * @param {string} format Allows to retrieve more or less phone book details in response. small: id, firstName, lastName, number. medium: id, firstName, lastName, number. full: id, firstName, lastName, number. Default value : small Possible values : small, medium, full.
	     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first entry if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort phone book list based on the given field. Default value : reverseDisplayName
	     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1.
	     */
	    searchInAlldirectories(pbxId?: string, systemId?: string, numberE164?: string, shortnumber?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method searchInPhonebook
	     * @since 2.8.9
	     * @instance
	     * @category Contacts Search
	     * @description
	     * This API allows to search for resources matching given keywords.The search is done on name and phone number. <br>
	     * Search can be: <br>
	     *   - on name: <br>
	     *      * keywords exact match (ex: 'John Doe' find 'John Doe')
	     *      * keywords partial match (ex: 'Jo Do' find 'John Doe')
	     *      * case insensitive (ex: 'john doe' find 'John Doe')
	     *      * accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     *      * on only firstname or lastname (ex: 'john' find 'John Doe')
	     *      * order firstname / lastname does not matter (ex: 'doe john' find 'John Doe')
	     *   - on number: <br>
	     *      * keywords exact match (ex: '0630594224' finds '0630594224' but NOT '+33630594224')
	     * <br>
	     * In case of user requesting the API, the search is done on user's system phonebook. <br>
	     * In case of PCG requesting the API, pbxId parameter is mandatory and the search is done on related system phonebook. <br>
	     *  <br>
	     * **Specific feature:** Sharing a system between several companies <br>
	     * Since 1.47.0 release, configuring companies sharing a multi-tenant system is possible. <br>
	     * An OXE can be multi-company. <br>
	     * A multi-tenant system, so called CENTREX, allows sharing a call-server between several entities. <br>
	     * Each company in this multi-tenant system has his own range of phone number. Each company has a company prefix named 'tenantCallNumber' in the companies data model <br>
	     *    <br>
	     *   - Company A - 8210xxxx (82103000 Alice, 82103001 Bob)
	     *   - Company B - 8211xxxx (82113001 Carol)
	     *    <br>
	     *   Carol can't search Alice by name because her phone number begins by a wrong company prefix.
	     *   Carol can't search Bob by number because her phone number begins by a wrong company prefix.".
	     *   In case of inconsistent configuration, an HTTP error 409210 is thrown.
	     *    <br>
	     * @return {Promise<any>} An object of the result
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | id  | String | phone book id |
	     * | firstName | String | First name as it is present in the phone book |
	     * | lastName | String | Last name as it is present in the phone book |
	     * | number | String | Phone number as it is present in the phone book |
	     *
	     * @param {string} pbxId Mandatory if role is pcg.
	     * @param {string} name Allows to filter users list on the given keyword(s) provided in this option.
	     * @param {string} number Allows to filter users list on the phone number provided in this option.
	     * @param {string} format Allows to retrieve more or less phone book details in response. small: id, firstName, lastName, number. medium: id, firstName, lastName, number. full: id, firstName, lastName, number. Default value : small Possible values : small, medium, full.
	     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first entry if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort phone book list based on the given field. Default value : reverseDisplayName
	     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1.
	     */
	    searchInPhonebook(pbxId: string, name: string, number: string, format: string, limit: number, offset: number, sortField: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method searchUserByPhonenumber
	     * @since 2.8.9
	     * @instance
	     * @category Contacts Search
	     * @description
	     * This API allows to search user being associated to the requested number. <br>
	     * The algorithm of this API is the following: <br>
	     *   * The API first search if the provided number matches one belonging to the pbx group of logged in user's pbx and being affected to a Rainbow user.
	     *   * Otherwise, the API search for users having the provided E164 number filled in their profile (only if setting isVisibleByOthers related to this number is not set to false). The API returns the result only if found user is in the same company or organisation than the logged in user's.
	     * If several numbers match, the first one found is returned. <br>
	     *    <br>
	     * @return {Promise<any>} An object of the result
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | id  | String | User unique identifier |
	     * | firstName | String | User first name |
	     * | lastName | String | User last name |
	     * | jid_im | String | User Jabber IM identifier |
	     * | companyId | String | User company unique identifier |
	     * | companyName | String | User company name |
	     * | organisationId | String | User organisation unique identifier |
	     * | lastAvatarUpdate | Date-Time | Date Date of last user avatar create/update, null if no avatar |
	     * | lastUpdateDate | Date-Time | Date of last user create/update |
	     * | guestMode | Boolean | Indicates a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. |
	     * | fileSharingCustomisation | String | Activate/Deactivate file sharing capability per user  <br>Define if the user can use the file sharing service.  <br>FileSharingCustomisation can be:<br><br>* `enabled`: The user can use the file sharing service.<br>* `disabled`: The user can't use the file sharing service. |
	     * | fileStorageCustomisation | String | Activate/Deactivate the capability for a user to access to Rainbow file storage.  <br>Define if a user has the right to upload/download/copy or share documents.  <br>fileStorageCustomisation can be:<br><br>* `enabled`: The user can manage and share files.<br>* `disabled`: The user can't manage and share files. |
	     * | useRoomCustomisation | String | Activate/Deactivate the capability for a user to use bubbles.  <br>Define if a user can create bubbles or participate in bubbles (chat and web conference).  <br>useRoomCustomisation can be:<br><br>* `enabled`: The user can use bubbles.<br>* `disabled`: The user can't use bubbles. |
	     * | phoneMeetingCustomisation | String | Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).  <br>Define if a user has the right to join phone meetings.  <br>phoneMeetingCustomisation can be:<br><br>* `enabled`: The user can join phone meetings.<br>* `disabled`: The user can't join phone meetings. |
	     * | useChannelCustomisation | String | Activate/Deactivate the capability for a user to use a channel.  <br>Define if a user has the right to create channels or be a member of channels.  <br>useChannelCustomisation can be:<br><br>* `enabled`: The user can use some channels.<br>* `disabled`: The user can't use some channel. |
	     * | useScreenSharingCustomisation | String | Activate/Deactivate the capability for a user to share a screen.  <br>Define if a user has the right to share his screen.  <br>useScreenSharingCustomisation can be:<br><br>* `enabled`: Each user of the company can share his screen.<br>* `disabled`: No user of the company can share his screen. |
	     * | useWebRTCVideoCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.  <br>Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC video conversation.<br>* `disabled`: The user can't switch to a Web RTC video conversation. |
	     * | useWebRTCAudioCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.  <br>Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).  <br>useWebRTCAudioCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC audio conversation.<br>* `disabled`: The user can't switch to a Web RTC audio conversation. |
	     * | instantMessagesCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.  <br>instantMessagesCustomisation can be:<br><br>* `enabled`: The user can use instant messages.<br>* `disabled`: The user can't use instant messages. |
	     * | isTerminated | Boolean | Indicates if the user account has been deleted. |
	     *
	     * @param {number} number number to search. The number can be: <br>
	     *      - a system phone number being in the pbx group of logged in user's pbx <br>
	     *      - a phone number entered manually by a user in his profile and being in the same organisation than logged in user's (in that case, provided number must be in E164 format) <br>
	     *
	     */
	    searchUserByPhonenumber(number: number): Promise<unknown>;
	    /**
	     * @public
	     * @method searchUsers
	     * @since 2.8.9
	     * @instance
	     * @category Contacts Search
	     * @description
	     *
	     * This API allows to search users.
	     * Two type of searches are available:
	     * * Search on displayName (query parameter `displayName`):
	     *      - The search is done on users' `firstName` and `lastName`, and search is done in all Rainbow public users and users being in companies visible by logged in user's company.
	     *      - If logged in user's has visibility `closed` or `isolated`, or `same_than_company` and logged in user's company has visibility `closed` or `isolated`, search is done only on users being in companies visible by logged in user's company.
	     *      - Search on display name can be:
	     *          * firstName and lastName exact match (ex: 'John Doe' find 'John Doe')
	     *          * partial match (ex: 'Jo Do' find 'John Doe')
	     *          * case insensitive (ex: 'john doe' find 'John Doe')
	     *          * accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     *          * on only firstname or lastname (ex: 'john' find 'John Doe')
	     *          * order firstname / lastname does not matter (ex: 'doe john' find 'John Doe')
	     *      - It is possible to specify on which company(ies) users are searched (using `companyId` query parameter)
	     *      - It is possible to exclude users from some company(ies) in the search (using `excludeCompanyId` query parameter)
	     * * Multi-criterion search (query parameter `search`):
	     *      - Multi criterion search is only available to users having feature `SEARCH_BY_TAGS` in their profiles,
	     *      - Multi criterion allows to search users based on their fields `firstName`, `lastName`, `jobTitle`, `department`, `companyName` and `tags`.
	     *          * Multi criterion search is limited to users belonging to logged in user's company or users being in a company that belongs to the same organization.
	     *          * For other users which does not belong to the same company or organisation (Rainbow public users and users being in companies visible by logged in user's company outside the organisation), the search is only done on users' `firstName` and `lastName`. If logged in user's has visibility `closed` or `isolated` (or `same_than_company` and logged in user's company has visibility `closed` or `isolated`), search on `firstName`/`lastName` is done only on users being in companies visible by logged in user's company (similar behavior than search with query parameter displayName).
	     *      - Provided search tags can be a single word or composed of several words separated by spaces.
	     *      - Only users matching all provided search tags in their fields `firstName`, `lastName`, `jobTitle`,`department`, `companyName` and/or `tags` (or `firstName` and/or `lastName` for users outside the logged in user company/organisation) will be returned in the results.
	     *      - Matching of the search tags is done from the start of the word, case is insensitive and special characters are ignored.
	     *      - Example, consider a user as follow:
	     *    <br>
	     *  { <br>
	     * firstName: 'John', <br>
	     * lastName: 'Doe', <br>
	     * companyName: 'Alcatel-Lucent International', <br>
	     * jobTitle: 'Sales Representative', <br>
	     * department: 'Sales', <br>
	     * tags: \['Healthcare', 'Hospitality'\] <br>
	     * } <br>
	     *    <br>
	     *  - This user can be found with the following search tags:
	     *      * exact match (ex: 'John Doe', 'John Sales Representative', 'John Healthcare', ...)
	     *      * partial match (ex: 'Jo Do', 'Jo Sales', 'Jo Health', 'Do Alcatel', ...)
	     *      * case insensitive (ex: 'john doe', 'john sales', 'john hospitality', 'doe alcatel', ...)
	     *      * on only one field (ex: 'doe', 'sales', 'healthcare')
	     *      * order does not matter (ex: 'doe john', 'sales alcatel', 'healthcare sales john', ...)
	     *  - It is possible to specify on which company(ies) users are searched (using companyId query parameter)
	     *  - It is possible to exclude users from some company(ies) in the search (using excludeCompanyId query parameter)
	     *    <br>
	     * One of `displayName` or `search` parameters must be provided to execute the search request.
	     *    <br>
	     * @return {Promise<any>} An object of the result
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | limit | Number | Number of requested items |
	     * | offset | Number | Requested position of the first item to retrieve |
	     * | total | Number | Total number of items |
	     * | data | Object\[\] | List of user Objects. |
	     * | id  | String | User unique identifier |
	     * | loginEmail | String | User email address (used for login)  <br>`loginEmail` field is only returned for users being in the same company than logged in user and not being in the default Rainbow company. |
	     * | firstName | String | User first name |
	     * | lastName | String | User last name |
	     * | jid_im | String | User Jabber IM identifier |
	     * | companyId | String | User company unique identifier |
	     * | companyName | String | User company name |
	     * | jobTitle optionnel | String | User job title.  <br>Only returned if search is requested using `search` parameter and found user is in the same company or organisation than logged in user. |
	     * | tags optionnel | String\[\] | Tags associated to the user by an administrator.  <br>Only returned if search is requested using `search` parameter and found user is in the same company or organisation than logged in user. |
	     * | lastAvatarUpdate | Date-Time | Date Date of last user avatar create/update, null if no avatar |
	     * | lastUpdateDate | Date-Time | Date of last user create/update |
	     * | guestMode | Boolean | Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. |
	     * | fileSharingCustomisation | String | Activate/Deactivate file sharing capability per user  <br>Define if the user can use the file sharing service.  <br>FileSharingCustomisation can be:<br><br>* `enabled`: The user can use the file sharing service.<br>* `disabled`: The user can't use the file sharing service. |
	     * | fileStorageCustomisation | String | Activate/Deactivate the capability for a user to access to Rainbow file storage.  <br>Define if a user has the right to upload/download/copy or share documents.  <br>fileStorageCustomisation can be:<br><br>* `enabled`: The user can manage and share files.<br>* `disabled`: The user can't manage and share files. |
	     * | useRoomCustomisation | String | Activate/Deactivate the capability for a user to use bubbles.  <br>Define if a user can create bubbles or participate in bubbles (chat and web conference).  <br>useRoomCustomisation can be:<br><br>* `enabled`: The user can use bubbles.<br>* `disabled`: The user can't use bubbles. |
	     * | phoneMeetingCustomisation | String | Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).  <br>Define if a user has the right to join phone meetings.  <br>phoneMeetingCustomisation can be:<br><br>* `enabled`: The user can join phone meetings.<br>* `disabled`: The user can't join phone meetings. |
	     * | useChannelCustomisation | String | Activate/Deactivate the capability for a user to use a channel.  <br>Define if a user has the right to create channels or be a member of channels.  <br>useChannelCustomisation can be:<br><br>* `enabled`: The user can use some channels.<br>* `disabled`: The user can't use some channel. |
	     * | useScreenSharingCustomisation | String | Activate/Deactivate the capability for a user to share a screen.  <br>Define if a user has the right to share his screen.  <br>useScreenSharingCustomisation can be:<br><br>* `enabled`: Each user of the company can share his screen.<br>* `disabled`: No user of the company can share his screen. |
	     * | useWebRTCVideoCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.  <br>Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC video conversation.<br>* `disabled`: The user can't switch to a Web RTC video conversation. |
	     * | useWebRTCAudioCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.  <br>Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).  <br>useWebRTCAudioCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC audio conversation.<br>* `disabled`: The user can't switch to a Web RTC audio conversation. |
	     * | instantMessagesCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.  <br>instantMessagesCustomisation can be:<br><br>* `enabled`: The user can use instant messages.<br>* `disabled`: The user can't use instant messages. |
	     * | isTv | Boolean | True if it is a TV user |
	     * | isAlertNotificationEnabled | Boolean | True if user is to subscribed to Alert Offer |
	     * | phoneNumbers | Object\[\] | Array of user phone numbers objects.  <br>Phone number objects can:<br><br>* be created by user (information filled by user),<br>* come from association with a system (pbx) device (association is done by admin). |
	     * | phoneNumberId | String | Phone number unique id in phone-numbers directory collection. |
	     * | number optionnel | String | User phone number (as entered by user) |
	     * | numberE164 optionnel | String | User E.164 phone number, computed by server from `number` and `country` fields |
	     * | country | String | Phone number country (ISO 3166-1 alpha3 format)  <br>`country` field is automatically computed using the following algorithm when creating/updating a phoneNumber entry:<br><br>* If `number` is provided and is in E164 format, `country` is computed from E164 number<br>* Else if `country` field is provided in the phoneNumber entry, this one is used<br>* Else user `country` field is used |
	     * | isFromSystem optionnel | Boolean | Boolean indicating if phone is linked to a system (pbx). |
	     * | shortNumber optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG).  <br>Only usable within the same PBX.  <br>Only PCG can set this field. |
	     * | internalNumber optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), internal phone number.  <br>Usable within a PBX group.  <br>Admins and users can modify this internalNumber field. |
	     * | systemId optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. |
	     * | pbxId optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), unique identifier of that pbx. |
	     * | type | String | Phone number type, one of `home`, `work`, `other`. |
	     * | deviceType | String | Phone number device type, one of `landline`, `mobile`, `fax`, `other`. |
	     * | isVisibleByOthers | Boolean | Allow user to choose if the phone number is visible by other users or not.  <br>Note that administrators can see all the phone numbers, even if `isVisibleByOthers` is set to false.  <br>Note that phone numbers linked to a system (`isFromSystem`=true) are always visible, `isVisibleByOthers` can't be set to false for these numbers. |
	     *
	     * @param {number} limit Allow to specify the number of users to retrieve. Default value : 20
	     * @param {string} displayName earch users on the given displayName. displayName and search parameters are exclusives, displayName parameter can only be set if search parameter is not provided.
	     * @param {string} search Search users belonging to the same company/organisation than logged in user on the given search tags on fields firstName, lastName, companyName, jobTitle, department,tags. Other public users/users in companies visible by logged in user's company are searched only on fields firstName and lastName (except if logged in user has visibility closed or isolated). displayName and search parameters are exclusives, search parameter can only be set if displayName parameter is not provided.
	     * @param {string} companyId Search users being in the requested company(ies). companyId and excludeCompanyId parameters are exclusives, companyId parameter can only be set if excludeCompanyId parameter is not provided.
	     * @param {string} excludeCompanyId Exclude users being in the requested company(ies) from the search results. companyId and excludeCompanyId parameters are exclusives, excludeCompanyId parameter can only be set if companyId parameter is not provided.
	     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort items list based on the given field.
	     * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possible values : -1, 1
	     */
	    searchUsers(limit?: number, displayName?: string, search?: string, companyId?: string, excludeCompanyId?: string, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method createPersonalDirectoryEntry
	     * @since 2.9.0
	     * @instance
	     * @async
	     * @category Contacts Personal Directory
	     * @param {string} firstName Contact first Name
	     * @param {string} lastName Contact last Name
	     * @param {string} companyName Company Name of the contact
	     * @param {string} department Contact address: Department
	     * @param {string} street Contact address: Street
	     * @param {string} city Contact address: City
	     * @param {string} state When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY"
	     * @param {string} postalCode Contact address: postal code / ZIP
	     * @param {string} country Contact address: country (ISO 3166-1 alpha3 format)
	     * @param {Array<string>} workPhoneNumbers Work phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} mobilePhoneNumbers Mobile phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} otherPhoneNumbers Other phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {string} jobTitle Contact Job title
	     * @param {string} eMail Contact Email address
	     * @param {Array<string>} tags An Array of free tags <br>
	     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
	     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case). <br>
	     * @param {string} custom1 Custom field 1
	     * @param {string} custom2 Custom field 2
	     * @description
	     *      This API allows connected user to Create a personal directory entry.  <br>
	     */
	    createPersonalDirectoryEntry(firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getDirectoryEntryData
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category  Contacts Personnal Directory
	     * @param {string} entryId Id of the entry.
	     * @param {string} format Allows to retrieve more or less entry details in response. <br>
	     * - small: id, firstName, lastName  <br>
	     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
	     * - full: all fields. <br>
	     * default : small <br>
	     * Valid values : small, medium, full <br>
	     * @description
	     *      This API allows user to get data about an entry of his personnal directory.<br>
	     * @return {Promise<any>}
	     */
	    getDirectoryEntryData(entryId: string, format?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getListPersonalDirectoryEntriesData
	     * @since 2.9.0
	     * @instance
	     * @async
	     * @category Contacts Personnal Directory
	     * @param {string} name Allows to filter the list of directory entries of user type on the name provided in this option. <br>
	     * - keywords exact match (ex: 'John Doe' find 'John Doe')
	     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
	     * - case insensitive (ex: 'john doe' find 'John Doe')
	     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     * - on only firstname or lastname (ex: 'john' find 'John Doe')
	     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
	     * @param {string} search Allows to filter the list of directory entries by the words provided in this option. <br>
	     * - The query parameter type allows to specify on which type of directory entries the search is performed ('user' (default), 'company', or all entries) - Multi criterion search is only available to users having feature SEARCH_BY_TAGS in their profiles - keywords exact match (ex: 'John Doe' find 'John Doe')
	     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
	     * - case insensitive (ex: 'john doe' find 'John Doe')
	     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     * - multi criterion: fields firstName, lastName, jobTitle,companyName, department and tags.
	     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
	     * @param {string} type Allows to specify on which type of directory entries the multi-criterion search is performed ('user' (default), 'company', or all entries)<br>
	     * This parameter is only used if the query parameter search is also specified, otherwise it is ignored. Default value : user. Possible values : user, company
	     * @param {string} companyName Allows to filter the list of directory entries of company type on the name provided in this option. <br>
	     * - keywords exact match (ex: 'John Doe' find 'John Doe')
	     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
	     * - case insensitive (ex: 'john doe' find 'John Doe')
	     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     * - on only companyName (ex: 'john' find 'John Doe')
	     * @param {string} phoneNumbers Allows to filter the list of directory entries on the number provided in this option. (users and companies type) <br>
	     *     Note the numbers must be in E164 format separated by a space and the character "+" replaced by "%2B". ex. "phoneNumbers=%2B33390676790 %2B33611223344"
	     * @param {Date} fromUpdateDate Allows to filter the list of directory entries from provided date (ISO 8601 format eg: '2019-04-11 16:06:47').
	     * @param {Date} toUpdateDate Allows to filter the list of directory entries until provided date (ISO 8601 format).
	     * @param {string} tags Allows to filter the list of directory entries on the tag(s) provided in this option. <br>
	     *     Only usable by users with admin rights, so that he can list the directory entries to which a given tag is assigned (useful for tag administration). <br>
	     *     Using this parameter, the tags are matched with strict equality (i.e. it is case sensitive and the whole tag must be provided).
	     * @param {string} format Allows to retrieve more or less entry details in response. <br>
	     * - small: id, firstName, lastName  <br>
	     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
	     * - full: all fields. <br>
	     * default : small <br>
	     * Valid values : small, medium, full <br>
	     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first one if not specified) Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort directory list based on the given field. Default value : lastName
	     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1
	     * @param {string} view Precises ios the user would like to consult either his personal directory, his company directory or the both. Default value : all. Possible values : personal, company, all
	     * @description
	     *   This API allows connected users to get an entry of his personal directory.<br>
	     *   <br>
	     *   name, phoneNumbers, search and tags parameters are exclusives.
	     * @return {Promise<any>}
	     * <br>
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | Data objects |
	     * | id  | String | Directory entry identifier |
	     * | companyId optionnel | String | Id of the company |
	     * | userId optionnel | String | Id of the user |
	     * | type | String | Type of the directory entry<br>* `user` if firstName and/or lastName are filled,<br>* `company` if only companyName is filled (firstName and lastName empty)<br>Possible values : `user`, `company` |
	     * | firstName optionnel | String | Contact First name<br>Ordre de grandeur : `0..255` |
	     * | lastName optionnel | String | Contact Last name<br>Ordre de grandeur : `0..255` |
	     * | companyName optionnel | String | Company Name of the contact<br>Ordre de grandeur : `0..255` |
	     * | department optionnel | String | Contact address: Department<br>Ordre de grandeur : `0..255` |
	     * | street optionnel | String | Contact address: Street<br>Ordre de grandeur : `0..255` |
	     * | city optionnel | String | Contact address: City<br>Ordre de grandeur : `0..255` |
	     * | state optionnel | String | When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY" |
	     * | postalCode optionnel | String | Contact address: postal code / ZIP<br>Ordre de grandeur : `0..64` |
	     * | country optionnel | String | Contact address: country (ISO 3166-1 alpha3 format) |
	     * | workPhoneNumbers optionnel | String\[\] | Work phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
	     * | mobilePhoneNumbers optionnel | String\[\] | Mobile phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
	     * | otherPhoneNumbers optionnel | String\[\] | other phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
	     * | jobTitle optionnel | String | Contact Job title<br>Ordre de grandeur : `0..255` |
	     * | eMail optionnel | String | Contact Email address<br>Ordre de grandeur : `0..255` |
	     * | tags optionnel | String\[\] | An Array of free tags<br>Ordre de grandeur : `1..64` |
	     * | custom1 optionnel | String | Custom field 1<br>Ordre de grandeur : `0..255` |
	     * | custom2 optionnel | String | Custom field 2<br>Ordre de grandeur : `0..255` |
	     *
	     *
	     */
	    getListPersonalDirectoryEntriesData(name: string, search: string, type: string, companyName: string, phoneNumbers: string, fromUpdateDate: Date, toUpdateDate: Date, tags: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number, view?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updatePersonalDirectoryEntry
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Contacts Personnal Directory
	     * @param {string} entryId Id of the entry.
	     * @param {string} firstName Contact first Name
	     * @param {string} lastName Contact last Name
	     * @param {string} companyName Company Name of the contact
	     * @param {string} department Contact address: Department
	     * @param {string} street Contact address: Street
	     * @param {string} city Contact address: City
	     * @param {string} state When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY"
	     * @param {string} postalCode Contact address: postal code / ZIP
	     * @param {string} country Contact address: country (ISO 3166-1 alpha3 format)
	     * @param {Array<string>} workPhoneNumbers Work phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} mobilePhoneNumbers Mobile phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} otherPhoneNumbers Other phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {string} jobTitle Contact Job title
	     * @param {string} eMail Contact Email address
	     * @param {Array<string>} tags An Array of free tags <br>
	     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
	     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case).
	     * @param {string} custom1 Custom field 1
	     * @param {string} custom2 Custom field 2
	     * @description
	     *      This API allows the connected user to update an entry of his personnal directory.<br>
	     * @return {Promise<any>}
	     */
	    updatePersonalDirectoryEntry(entryId: string, firstName?: string, lastName?: string, companyName?: string, department?: string, street?: string, city?: string, state?: string, postalCode?: string, country?: string, workPhoneNumbers?: string[], mobilePhoneNumbers?: string[], otherPhoneNumbers?: string[], jobTitle?: string, eMail?: string, tags?: string[], custom1?: string, custom2?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deletePersonalDirectoryEntry
	     * @since 2.9.0
	     * @instance
	     * @async
	     * @category Contacts Personnal Directory
	     * @param {string} entryId Id of the entry.
	     * @description
	     *      This API allows connected user to delete an entry from his personal directory.<br>
	     * @return {Promise<any>}
	     */
	    deletePersonalDirectoryEntry(entryId: string): Promise<unknown>;
	    /**
	     * @private
	     * @method _onPresenceChanged
	     * @instance
	     * @param {Object} presence contains informations about contact changes
	     * @description
	     *      Method called when the presence of a contact changed <br>
	     */
	    _onPresenceChanged(presence: any): void;
	    /**
	     * @private
	     * @method _onRosterPresenceChanged
	     * @instance
	     * @param {Object} presence contains informations about contact changes
	     * @description
	     *      Method called when the presence of a contact changed <br>
	     */
	    _onRosterPresenceChanged(presence: any): void;
	    /**
	     * @private
	     * @method _onContactInfoChanged
	     * @instance
	     * @param {string} jid modified roster contact Jid
	     * @description
	     *     Method called when an roster user information are updated <br>
	     */
	    _onContactInfoChanged(jid: string): void;
	    /**
	     * @private
	     * @method _onRosterContactInfoChanged
	     * @instance
	     * @param {string} jid modified roster contact Jid
	     * @description
	     *     Method called when an roster user information are updated <br>
	     */
	    _onRosterContactInfoChanged(jid: string): void;
	    /**
	     * @private
	     * @method _onUserInviteReceived
	     * @instance
	     * @param {Object} data contains the invitationId
	     * @description
	     *      Method called when an user invite is received <br>
	     */
	    /**
	     * @private
	     * @method _onUserInviteAccepted
	     * @instance
	     * @param {Object} data contains the invitationId
	     * @description
	     *      Method called when an user invite is accepted <br>
	     */
	    /**
	     * @private
	     * @method _onUserInviteCanceled
	     * @instance
	     * @param {Object} data contains the invitationId
	     * @description
	     *      Method called when an user invite is canceled <br>
	     */
	    /**
	     * @private
	     * @method _onRostersUpdate
	     * @instance
	     * @param {Object} contacts contains a contact list with updated elements
	     * @description
	     *      Method called when the roster _contacts is updated <br>
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
	    init(useRestAtStartup: boolean): Promise<void>;
	    /**
	     * @private
	     * @method getUserSettings
	     * @instance
	     * @description
	     *  Get current User Settings <br>
	     * @return {Promise<UserSettings>} A promise containing the result
	     */
	    getUserSettings(): Promise<unknown>;
	    /**
	     * @private
	     * @method updateUserSettings
	     * @instance
	     * @description
	     *  Update current User Settings <br>
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
	import { Bubble } from 'lib/common/models/Bubble';
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
	    init(useRestAtStartup: boolean): Promise<void>;
	    /**
	     * @private
	     * @method sendInitialPresence
	     * @instance
	     * @async
	     * @category Presence CONNECTED USER
	     * @description
	     *  Send the initial presence (online) <br>
	     * @return {Promise<ErrorManager.Ok>} A promise containing the result
	     */
	    sendInitialPresence(): Promise<unknown>;
	    /**
	     * @public
	     * @method setPresenceTo
	     * @instance
	     * @async
	     * @category Presence CONNECTED USER
	     * @description
	     *    Allow to change the presence of the connected user <br>
	     *    Only the following values are authorized: 'dnd', 'away', 'invisible' or 'online' <br>
	     * @param {String} presence The presence value to set i.e: 'dnd', 'away', 'invisible' ('xa' on server side) or 'online'
	     * @return {Promise<any, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)
	     
	     */
	    setPresenceTo(presence: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getUserConnectedPresence
	     * @instance
	     * @category Presence CONNECTED USER
	     * @description
	     *      Get user presence status calculated from events. <br>
	     */
	    getUserConnectedPresence(): PresenceRainbow;
	    /**
	    * @private
	    * @method _setUserPresenceStatus
	    * @instance
	    * @async
	    * @category Presence CONNECTED USER
	    * @description
	    *      Send user presence status and message to xmpp. <br>
	    */
	    _setUserPresenceStatus(presenceRainbow: PresenceRainbow): Promise<unknown>;
	    /**
	     * @private
	     * @method _sendPresenceFromConfiguration
	     * @instance
	     * @async
	     * @category Presence CONNECTED USER
	     * @description
	     *      Send user presence according to user settings presence. <br>
	     */
	    _sendPresenceFromConfiguration(): Promise<unknown>;
	    /**
	     * @public
	     * @method getMyPresenceInformation
	     * @since 2.16.0
	     * @instance
	     * @category Presence CONNECTED USER
	     * @description
	     *      Get user's resources presences informations from server. <br>
	     */
	    getMyPresenceInformation(): Promise<unknown>;
	    /**
	     * @private
	     * @method sendInitialBubblePresence
	     * @instance
	     * @async
	     * @category Presence Bubbles
	     * @param {Bubble} bubble The Bubble
	     * @param {number} intervalDelay The interval between sending presence to a Bubble while it failed. default value is 75000 ms.
	     * @description
	     *      Method called when receiving an invitation to join a bubble <br>
	     */
	    sendInitialBubblePresenceSync(bubble: Bubble, intervalDelay?: number): Promise<any>;
	    /**
	     * @private
	     * @method sendInitialBubblePresenceById
	     * @instance
	     * @async
	     * @category Presence Bubbles
	     * @param {string} id The Bubble id.
	     * @param {number} attempt To log a number of attempt of sending presence to the Bubble. default value is 0.
	     * @description
	     *      Method called when receiving an invitation to join a bubble <br>
	     */
	    sendInitialBubblePresenceById(id: string, attempt?: number): Promise<unknown>;
	    /**
	 * @private
	 * @method sendInitialBubblePresence
	 * @instance
	 * @async
	 * @category Presence Bubbles
	 * @param {Bubble} bubble The Bubble
	 * @param {number} attempt To log a number of attempt of sending presence to the Bubble. default value is 0.
	 * @description
	 *      Method called when receiving an invitation to join a bubble <br>
	 */
	    sendInitialBubblePresence(bubble: Bubble, attempt?: number): Promise<unknown>;
	    /**
	     * @private
	     * @method sendInitialBubblePresenceSync
	     * @instance
	     * @async
	     * @category Presence Bubbles
	     * @param {Bubble} bubble The Bubble
	     * @param {number} intervalDelay The interval between sending presence to a Bubble while it failed. default value is 75000 ms.
	     * @description
	     *      Method called when receiving an invitation to join a bubble <br>
	     */
	    sendInitialBubblePresenceSyncFn(bubble: Bubble, intervalDelay?: number): Promise<any>;
	    /**
	     * @private
	     * @method _onUserSettingsChanged
	     * @instance
	     * @description
	     *      Method called when receiving an update on user settings <br>
	     */
	    _onUserSettingsChanged(): void;
	    /**
	     * @private
	     * @method _onPresenceChanged
	     * @instance
	     * @description
	     *      Method called when receiving an update on user presence <br>
	     */
	    _onMyPresenceChanged(user: any): void;
	    /**
	     * @public
	     * @method getCalendarState
	     * @instance
	     * @category Presence CALENDAR
	     * @description
	     *    Allow to get the calendar presence of the connected user <br>
	     *    return promise with {  <br>
	     *    busy: boolean, // Does the connected user is busy ? <br>
	     *    status: string, // The status of the connected user (one of "free", "busy" or "out_of_office") <br>
	     *    subject: string, // The meeting subject. <br>
	     *    since: string, // The meeting since date. <br>
	     *    until: string // Date until the current presence is valid <br>
	     *    }  <br>
	     *    <br>
	     * @async
	     * @return {Promise<{
	     *    busy: boolean,
	     *    status: string,
	     *    subject: string,
	     *    since: string,
	     *    until: string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     
	     */
	    getCalendarState(): Promise<unknown>;
	    /**
	     * @public
	     * @method getCalendarStates
	     * @instance
	     * @category Presence CALENDAR
	     * @param {Array<string>} users The list of the Rainbow user's references - id or logins (Contact::loginEmail) - to retrieve the calendar presence.
	     * @description
	     *    Allow to get the calendar presence of severals users <br>
	     *    return promise with {
	     *    usersIdentifier : { // List of calendar user states. <br>
	     *    busy: boolean, // Does the connected user is busy ? <br>
	     *    status: string, // The status of the connected user (one of "free", "busy" or "out_of_office") <br>
	     *    subject: string, // The meeting subject. <br>
	     *    since: string, // The meeting since date. <br>
	     *    until: string // Date until the current presence is valid <br>
	     *    }  <br>
	     *    <br>
	     * @async
	     * @return {Promise< {
	     *    busy: boolean,
	     *    status: string,
	     *    subject: string,
	     *    since: string,
	     *    until: string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     */
	    getCalendarStates(users?: Array<string>): Promise<unknown>;
	    /**
	     * @public
	     * @method setCalendarRegister
	     * @instance
	     * @category Presence CALENDAR
	     * @param {string} type Calendar type. Default : office365, Authorized values : office365, google
	     * @param {boolean} redirect Immediately redirect to login page (OAuth2) or generate an HTML page. Default : false.
	     * @param {string} callback Redirect URL to the requesting client.
	     * @description
	     *    Register a new calendar.<br>
	     *    return promise with {
	     *    "url" : string // Calendar provider's OAuth URL <br>
	     *    } <br>
	     * @async
	     * @return {Promise<{
	     *    "url" : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     
	     */
	    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCalendarAutomaticReplyStatus
	     * @instance
	     * @category Presence CALENDAR
	     * @param {string} userId The id of user to retrieve the calendar automatic reply status.
	     * @description
	     *    Allow to retrieve the calendar automatic reply status <br>
	     *    return promise with { <br>
	     *    enabled : string, // 	its status <br>
	     *    start : string, // its start date <br>
	     *    end : string, // its end date <br>
	     *    message_text : string, // its message as plain text <br>
	     *    message_thtml : string // its message as html <br>
	     *    }  <br>
	     *    <br>
	     * @async
	     * @return {Promise<{
	     *    enabled : string,
	     *    start : string,
	     *    end : string,
	     *    message_text : string,
	     *    message_thtml : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     
	     */
	    getCalendarAutomaticReplyStatus(userId?: string): Promise<unknown>;
	    /**
	     * @private
	     * @method enableCalendar
	     * @instance
	     * @category Presence CALENDAR
	     * @deprecated
	     * @description
	     *    Allow to enable the calendar. <br>
	     *    return promise with { <br>
	     *       Status : string // Operation status ("enabled" or "disabled") <br>
	     *    }  <br>
	     *    <br>
	     * @async
	     * @return {Promise< {
	     *       Status : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     
	     */
	    private enableCalendar;
	    /**
	     * @private
	     * @method disableCalendar
	     * @instance
	     * @category Presence CALENDAR
	     * @deprecated
	     * @description
	     *    Allow to disable the calendar. <br>
	     *    return promise with { <br>
	     *       Status : string // Operation status ("enabled" or "disabled") <br>
	     *    }  <br>
	     *    <br>
	     * @async
	     * @return {Promise< {
	     *       Status : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     
	     */
	    private disableCalendar;
	    /**
	     * @public
	     * @method controlCalendarOrIgnoreAnEntry
	     * @instance
	     * @category Presence CALENDAR
	     * @param {boolean} disable disable calendar, true to re-enable
	     * @param {string} ignore ignore the current calendar entry, false resumes the entry. Possible values : current, false
	     * @description
	     *    Enable/disable a calendar sharing or ignore a calendar entry. <br>
	     *    return promise with { <br>
	     *       Status : string // Operation status ("enabled" or "disabled") <br>
	     *    }  <br>
	     *    <br>
	     * @async
	     * @return {Promise< {
	     *       Status : string
	     *    }, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.

	     */
	    controlCalendarOrIgnoreAnEntry(disable?: boolean, ignore?: string): Promise<unknown>;
	    /**
	    * @public
	    * @method unregisterCalendar
	    * @instance
	    * @category Presence CALENDAR
	    * @description
	    *    Delete a calendar sharing. <br>
	    *    return promise with { <br>
	    *       Status : string // Operation status ("deleted") <br>
	    *    }  <br>
	    *    <br>
	    * @async
	    * @return {Promise< {
	    *       Status : string
	    *    }, ErrorManager>}
	    * @fulfil {ErrorManager} - ErrorManager object depending on the result.

	    */
	    unregisterCalendar(): Promise<unknown>;
	    /**
	     * @private
	     * @method subscribePresence
	     * @instance
	     * @category Presence Contact
	     * @description
	     *    Allows to subscribe presence to a contact. <br>
	     * @async
	     * @return {Promise< any, ErrorManager>}
	     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
	     */
	    subscribePresence(to: any): Promise<any>;
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
	    getUrlRaw(url: any, headers: any, params: any): Promise<any>;
	    _getUrlRaw(url: any, headers: any, params: any): Promise<any>;
	    headUrlRaw(url: any, headers?: any): Promise<any>;
	    _headUrlRaw(url: any, headers?: any): Promise<any>;
	    postUrlRaw(url: any, headers: any, data: any): Promise<any>;
	    _postUrlRaw(url: any, headers: any, data: any): Promise<any>;
	    putUrlRaw(url: any, headers: any, data: any): Promise<any>;
	    _putUrlRaw(url: any, headers: any, data: any): Promise<any>;
	    deleteUrlRaw(url: any, headers?: any, data?: Object): Promise<any>;
	    _deleteUrlRaw(url: any, headers?: any, data?: Object): Promise<any>;
	    getUrlJson(url: any, headers: any, params: any): Promise<any>;
	    _getUrlJson(url: any, headers: any, params: any): Promise<any>;
	    get(url: any, headers: any, params: any, responseType?: string, nbTryBeforeFailed?: number, timeBetweenRetry?: number): Promise<any>;
	    _get(url: any, headers: any, params: any, responseType?: string, nbTryBeforeFailed?: number, timeBetweenRetry?: number): Promise<any>;
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
declare module 'lib/connection/GenericRESTService' {
	 class GenericRESTService {
	    protected _token: any;
	    protected _decodedtokenRest: any;
	    protected _credentials: any;
	    protected _application: any;
	    protected _auth: any;
	    constructor();
	    set p_token(value: any);
	    set p_credentials(value: any);
	    set p_application(value: any);
	    set p_auth(value: any);
	    get token(): any;
	    get credentials(): any;
	    get application(): any;
	    get auth(): any;
	    get p_decodedtokenRest(): any;
	    set p_decodedtokenRest(value: any);
	    getRequestHeader(accept?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	    getRequestHeaderLowercaseAccept(accept?: string): {
	        Authorization: string;
	        accept: string;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	    getRequestHeaderWithRange(accept?: string, range?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	    getPostHeader(contentType?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	    getPostHeaderWithRange(accept?: string, initialSize?: string, minRange?: string, maxRange?: string): {
	        Authorization: string;
	        Accept: string;
	        Range: any;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	    getLoginHeader(auth?: string, password?: string): {
	        Accept: string;
	        "Content-Type": string;
	        Authorization: string;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	    getDefaultHeader(): {
	        Accept: string;
	        "Content-Type": string;
	        "x-rainbow-client": string;
	        "x-rainbow-client-version": any;
	        "x-rainbow-client-id": any;
	    };
	}
	export { GenericRESTService as GenericRESTService };

}
declare module 'lib/connection/RestServices/RESTConferenceV2' {
	import { GenericRESTService } from 'lib/connection/GenericRESTService'; class RESTConferenceV2 extends GenericRESTService {
	    http: any;
	    logger: any;
	    _logger: any;
	    evtEmitter: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(evtEmitter: any, logger: any);
	    start(http: any): Promise<unknown>;
	    stop(): Promise<unknown>;
	    addPSTNParticipantToConference(roomId: string, participantPhoneNumber: string, country: string): Promise<unknown>;
	    snapshotConference(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    delegateConference(roomId: string, userId: string): Promise<unknown>;
	    disconnectPSTNParticipantFromConference(roomId: string): Promise<unknown>;
	    disconnectParticipantFromConference(roomId: string, userId: string): Promise<unknown>;
	    getTalkingTimeForAllPparticipantsInConference(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    joinConference(roomId: string, participantPhoneNumber?: string, country?: string, deskphone?: boolean, dc?: Array<string>, mute?: boolean, microphone?: boolean, media?: Array<string>): Promise<unknown>;
	    pauseRecording(roomId: string): Promise<unknown>;
	    resumeRecording(roomId: string): Promise<unknown>;
	    startRecording(roomId: string): Promise<unknown>;
	    stopRecording(roomId: string): Promise<unknown>;
	    rejectAVideoConference(roomId: string): Promise<unknown>;
	    startConferenceOrWebinarInARoom(roomId: string): Promise<unknown>;
	    stopConferenceOrWebinar(roomId: string): Promise<unknown>;
	    subscribeForParticipantVideoStream(roomId: string, userId: string, media?: string, subStreamLevel?: number, dynamicFeed?: boolean): Promise<unknown>;
	    updatePSTNParticipantParameters(roomId: string, phoneNumber: string, option?: string): Promise<unknown>;
	    updateConferenceParameters(roomId: string, option?: string): Promise<unknown>;
	    updateParticipantParameters(roomId: string, userId: string, option: string, media: string, bitRate: number, subStreamLevel: number, publisherId: string): Promise<unknown>;
	    allowTalkWebinar(roomId: string, userId: string): Promise<unknown>;
	    disableTalkWebinar(roomId: string, userId: string): Promise<unknown>;
	    lowerHandWebinar(roomId: string): Promise<unknown>;
	    raiseHandWebinar(roomId: string): Promise<unknown>;
	    stageDescriptionWebinar(roomId: string, userId: string, type: string, properties: Array<string>): Promise<unknown>;
	}
	export { RESTConferenceV2 };

}
declare module 'lib/connection/RestServices/RESTWebinar' {
	import { GenericRESTService } from 'lib/connection/GenericRESTService'; class RESTWebinar extends GenericRESTService {
	    http: any;
	    logger: any;
	    _logger: any;
	    evtEmitter: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(evtEmitter: any, logger: any);
	    start(http: any): Promise<unknown>;
	    stop(): Promise<unknown>;
	    createWebinar(name: string, subject: string, waitingRoomStartDate: Date, webinarStartDate: Date, webinarEndDate: Date, reminderDates: Array<Date>, timeZone: string, register: boolean, approvalRegistrationMethod: string, passwordNeeded: boolean, isOrganizer: boolean, waitingRoomMultimediaURL: Array<string>, stageBackground: string, chatOption: string): Promise<unknown>;
	    updateWebinar(webinarId: string, name: string, subject: string, waitingRoomStartDate: Date, webinarStartDate: Date, webinarEndDate: Date, reminderDates: Array<Date>, timeZone: string, register: boolean, approvalRegistrationMethod: string, passwordNeeded: boolean, isOrganizer: boolean, waitingRoomMultimediaURL: Array<string>, stageBackground: string, chatOption: string): Promise<unknown>;
	    getWebinarData(webinarId: string): Promise<unknown>;
	    getWebinarsData(role: string): Promise<unknown>;
	    warnWebinarModerators(webinarId: string): Promise<unknown>;
	    publishAWebinarEvent(webinarId: string): Promise<unknown>;
	    deleteWebinar(webinarId: string): Promise<unknown>;
	}
	export { RESTWebinar };

}
declare module 'lib/common/TimeOutManager' {
	/// <reference types="node" />
	export {}; class ItemForTimeOutQueue {
	    private defered;
	    private itemFunction;
	    id: string;
	    private label;
	    typePromised: boolean;
	    timeoutId: NodeJS.Timer;
	    timetoutInProgress: boolean;
	    constructor(itemFunction: any, label: string, typePromised: boolean);
	    getId(): string;
	    getPromise(): any;
	    resolve(...args: any[]): any;
	    reject(...args: any[]): any;
	    start(): Promise<NodeJS.Timer>;
	    stop(): Promise<NodeJS.Timer>;
	    startPromised(): Promise<any>;
	} class TimeOutManager {
	    private timeoutFnTab;
	    private logger;
	    private lockEngine;
	    private lockKey;
	    constructor(_logger: any);
	    start(): void;
	    stop(): void;
	    lock(fn: any, id: any): Promise<string>;
	    /**
	     * @public
	     * @method setTimeout
	     * @instance
	     * @category Timeout
	     * @description
	     *    To se a setTimeout function which is stored in a queue, and then can be manage.<br>
	     * @param fn
	     * @param timer
	     * @param {string} label
	     * @return {string} the return of the system setTimeout call method.
	     */
	    setTimeout(fn: any, timer: any, label?: string): any;
	    setTimeoutPromised(fn: any, timer: any, label: string): any;
	    cleanAtimeOut(timeoutItemQueue: ItemForTimeOutQueue): Promise<void>;
	    clearEveryTimeout(): void;
	    cleanNotInProgressTimeoutCache(): void;
	    listEveryTimeout(): void;
	}
	export { TimeOutManager };

}
declare module 'lib/connection/RESTService' {
	/// <reference types="node" />
	import { RESTTelephony } from 'lib/connection/RestServices/RESTTelephony';
	import { HTTPService } from 'lib/connection/HttpService';
	import EventEmitter = NodeJS.EventEmitter;
	import { Logger } from 'lib/common/Logger';
	import { ROOMROLE } from 'lib/services/S2SService';
	import { Core } from 'lib/Core';
	import { RESTConferenceV2 } from 'lib/connection/RestServices/RESTConferenceV2';
	import { RESTWebinar } from 'lib/connection/RestServices/RESTWebinar';
	import { GenericRESTService } from 'lib/connection/GenericRESTService'; enum MEDIATYPE {
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
	} class RESTService extends GenericRESTService {
	    http: HTTPService;
	    account: any;
	    app: any;
	    renewTokenInterval: any;
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
	    restConferenceV2: RESTConferenceV2;
	    restWebinar: RESTWebinar;
	    applicationToken: string;
	    connectionS2SInfo: any;
	    private reconnectInProgress;
	    private _options;
	    private timeOutManager;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_options: any, evtEmitter: EventEmitter, _logger: Logger, core: Core);
	    get userId(): any;
	    get loggedInUser(): any;
	    start(http: any): Promise<any[]>;
	    stop(): Promise<unknown>;
	    signin(token?: string): Promise<unknown>;
	    set tokenRest(value: any);
	    set decodedtokenRest(value: any);
	    set credentialsRest(value: any);
	    set applicationRest(value: any);
	    set authRest(value: any);
	    setconnectionS2SInfo(_connectionS2SInfo: any): void;
	    askTokenOnBehalf(loginEmail: any, password: any): Promise<unknown>;
	    signout(): Promise<unknown>;
	    startTokenSurvey(): Promise<void>;
	    _renewAuthToken(): void;
	    searchInAlldirectories(pbxId?: string, systemId?: string, numberE164?: string, shortnumber?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    searchInPhonebook(pbxId: string, name: string, number: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number): Promise<unknown>;
	    searchUserByPhonenumber(number: any): Promise<unknown>;
	    searchUsers(limit?: number, displayName?: string, search?: string, companyId?: string, excludeCompanyId?: string, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    getAllUsers(format?: string, offset?: number, limit?: number, sortField?: string, companyId?: string, searchEmail?: string): Promise<unknown>;
	    getAllUsersByFilter(searchEmail: string, companyId: string, roles: string, excludeRoles: string, tags: string, departments: string, isTerminated: string, isActivated: string, fileSharingCustomisation: string, userTitleNameCustomisation: string, softphoneOnlyCustomisation: string, useRoomCustomisation: string, phoneMeetingCustomisation: string, useChannelCustomisation: string, useScreenSharingCustomisation: string, useWebRTCVideoCustomisation: string, useWebRTCAudioCustomisation: string, instantMessagesCustomisation: string, userProfileCustomisation: string, fileStorageCustomisation: string, overridePresenceCustomisation: string, alert: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, recordingConversationCustomisation: string, useGifCustomisation: string, useDialOutCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string, selectedAppCustomisationTemplate: string, format: string, limit: string, offset: string, sortField: string, sortOrder: string, displayName: string, useEmails: boolean, companyName: string, loginEmail: string, email: string, visibility: string, organisationId: string, siteId: string, jid_im: string, jid_tel: string): Promise<unknown>;
	    getContactInfos(userId: any): Promise<unknown>;
	    putContactInfos(userId: any, infos: any): Promise<unknown>;
	    getContacts(): Promise<unknown>;
	    removeContactFromRoster(dbId: any): Promise<unknown>;
	    getContactInformationByJID(jid: any): Promise<unknown>;
	    getContactInformationByID(id: any): Promise<unknown>;
	    getMyInformations(): Promise<unknown>;
	    getContactInformationByLoginEmail(email: any): Promise<[any]>;
	    getContactByToken(token: string): Promise<{
	        loggedInUser: any;
	        loggedInApplication: any;
	        token: string;
	    }>;
	    createUser(email: any, password: any, firstname: any, lastname: any, companyId: any, language: any, isAdmin: any, roles: any): Promise<unknown>;
	    createGuestUser(firstname: any, lastname: any, language: any, timeToLive: any): Promise<unknown>;
	    changePassword(password: any, userId: any): Promise<unknown>;
	    updateInformation(objData: any, userId: any): Promise<unknown>;
	    deleteUser(userId: any): Promise<unknown>;
	    updateEndUserInformations(userId: any, objData: any): Promise<unknown>;
	    getServerFavorites(): Promise<unknown>;
	    addServerFavorite(peerId: string, type: string): Promise<unknown>;
	    removeServerFavorite(favoriteId: string): Promise<unknown>;
	    getAllSentInvitations(): Promise<unknown>;
	    getInvitationsSent(sortField: string, status: string, format: string, limit: number, offset: number, sortOrder?: number): Promise<unknown>;
	    getAllReceivedInvitations(): Promise<unknown>;
	    getInvitationsReceived(sortField: string, status: string, format: string, limit: number, offset: number, sortOrder?: number): Promise<unknown>;
	    getServerInvitation(invitationId: any): Promise<unknown>;
	    sendInvitationByCriteria(email: string, lang: string, customMessage: string, invitedPhoneNumber: string, invitedUserId: string): Promise<unknown>;
	    cancelOneSendInvitation(invitation: any): Promise<unknown>;
	    reSendInvitation(invitationId: any): Promise<unknown>;
	    sendInvitationsParBulk(listOfMails: any): Promise<unknown>;
	    /**
	     * ACCEPT INVITATION
	     */
	    acceptInvitation(invitation: any): Promise<unknown>;
	    /**
	     * DECLINE INVITATION
	     */
	    declineInvitation(invitation: any): Promise<unknown>;
	    /**
	     * SEND INVITATION
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
	    getUserPresenceInformation(userId?: string): Promise<unknown>;
	    getMyPresenceInformation(): Promise<unknown>;
	    /**
	     * @description
	     *      https://api.openrainbow.org/mediapillar/#api-mediapillars-GetMediaPillarsData
	     * @return {Promise<unknown>}
	     */
	    getMediaPillarInfo(): Promise<unknown>;
	    createBubble(name: any, description: any, withHistory: any): Promise<unknown>;
	    updateRoomData(bubbleId: string, data: any): Promise<unknown>;
	    setBubbleVisibility(bubbleId: any, visibility: any): Promise<unknown>;
	    setBubbleAutoRegister(bubbleId: string, autoRegister?: string): Promise<unknown>;
	    setBubbleTopic(bubbleId: any, topic: any): Promise<unknown>;
	    setBubbleName(bubbleId: any, name: any): Promise<unknown>;
	    getBubbles(): Promise<unknown>;
	    getBubble(bubbleId: string, context?: string, format?: string, unsubscribed?: boolean, nbUsersToKeep?: number): Promise<unknown>;
	    getBubbleByJid(bubbleJid: string, format?: string, unsubscribed?: boolean, nbUsersToKeep?: number): Promise<unknown>;
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
	    deleteUserFromBubble(bubbleId: any): Promise<unknown>;
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
	    createFileDescriptor(name: any, extension: any, size: any, viewers: any, voicemessage: boolean, duration: number, encoding: boolean, ccarelogs: boolean, ccareclientlogs: boolean): Promise<unknown>;
	    deleteFileDescriptor(fileId: any): Promise<unknown>;
	    retrieveFileDescriptors(fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, viewerId: string, path: string, limit: number, offset: number, sortField: string, sortOrder: number, format?: string): Promise<unknown>;
	    retrieveFilesReceivedFromPeer(userId: any, peerId: any): Promise<unknown>;
	    retrieveReceivedFilesForRoomOrViewer(viewerId: any, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string, limit: number, offset: number, sortField: string, sortOrder: number): Promise<unknown>;
	    retrieveOneFileDescriptor(fileId: any): Promise<unknown>;
	    retrieveUserConsumption(): Promise<unknown>;
	    deleteFileViewer(viewerId: any, fileId: any): Promise<unknown>;
	    addFileViewer(fileId: any, viewerId: any, viewerType: any): Promise<unknown>;
	    getFileDescriptorsByCompanyId(companyId: any, fileName: boolean, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    copyFileInPersonalCloudSpace(fileId: string): Promise<unknown>;
	    fileOwnershipChange(fileId: string, userId: string): Promise<unknown>;
	    getPartialDataFromServer(url: any, minRange: any, maxRange: any, index: any): Promise<unknown>;
	    getPartialBufferFromServer(url: any, minRange: any, maxRange: any, index: any): Promise<unknown>;
	    getFileFromUrl(url: any): Promise<unknown>;
	    getBlobFromUrl(url: any): Promise<unknown>;
	    uploadAFile(fileId: any, buffer: any): Promise<unknown>;
	    uploadAStream(fileId: any, stream: any): Promise<unknown>;
	    sendPartialDataToServer(fileId: any, file: any, index: any): Promise<unknown>;
	    sendPartialFileCompletion(fileId: any): Promise<unknown>;
	    getUserSettings(): Promise<unknown>;
	    updateUserSettings(settings: any): Promise<unknown>;
	    getServerCapabilities(): Promise<unknown>;
	    getAllCompanies(format?: string, sortField?: string, bpId?: string, catalogId?: string, offerId?: string, offerCanBeSold?: boolean, externalReference?: string, externalReference2?: string, salesforceAccountId?: string, selectedAppCustomisationTemplate?: string, selectedThemeObj?: boolean, offerGroupName?: string, limit?: number, offset?: number, sortOrder?: number, name?: string, status?: string, visibility?: string, organisationId?: string, isBP?: boolean, hasBP?: boolean, bpType?: string): Promise<unknown>;
	    createCompany(name: any, country: any, state: any, offerType: any): Promise<unknown>;
	    getCompany(companyId: any): Promise<unknown>;
	    deleteCompany(companyId: any): Promise<unknown>;
	    getCompanyInfos(companyId: any, format: string, selectedThemeObj: boolean, name: string, status: string, visibility: string, organisationId: string, isBP: boolean, hasBP: boolean, bpType: string): Promise<unknown>;
	    setVisibilityForCompany(companyId: any, visibleByCompanyId: any): Promise<unknown>;
	    applyCustomisationTemplates(name: string, companyId: string, userId: string): Promise<unknown>;
	    createCustomisationTemplate(name: string, ownedByCompany: string, visibleBy: Array<string>, instantMessagesCustomisation: string, useGifCustomisation: string, fileSharingCustomisation: string, fileStorageCustomisation: string, phoneMeetingCustomisation: string, useDialOutCustomisation: string, useChannelCustomisation: string, useRoomCustomisation: string, useScreenSharingCustomisation: string, useWebRTCAudioCustomisation: string, useWebRTCVideoCustomisation: string, recordingConversationCustomisation: string, overridePresenceCustomisation: string, userProfileCustomisation: string, userTitleNameCustomisation: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string): Promise<unknown>;
	    deleteCustomisationTemplate(templateId: any): Promise<unknown>;
	    getAllAvailableCustomisationTemplates(companyId?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    getRequestedCustomisationTemplate(templateId?: string): Promise<unknown>;
	    updateCustomisationTemplate(templateId: string, name: string, visibleBy: string[], instantMessagesCustomisation?: string, useGifCustomisation?: string, fileSharingCustomisation?: string, fileStorageCustomisation?: string, phoneMeetingCustomisation?: string, useDialOutCustomisation?: string, useChannelCustomisation?: string, useRoomCustomisation?: string, useScreenSharingCustomisation?: string, useWebRTCAudioCustomisation?: string, useWebRTCVideoCustomisation?: string, recordingConversationCustomisation?: string, overridePresenceCustomisation?: string, userProfileCustomisation?: string, userTitleNameCustomisation?: string, changeTelephonyCustomisation?: string, changeSettingsCustomisation?: string, fileCopyCustomisation?: string, fileTransferCustomisation?: string, forbidFileOwnerChangeCustomisation?: string, readReceiptsCustomisation?: string, useSpeakingTimeStatistics?: string): Promise<unknown>;
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
	    getThirdPartyApps(): Promise<unknown>;
	    revokeThirdPartyAccess(tokenId: any): Promise<unknown>;
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
	    deleteAllMyVoiceMessagesFromPbx(): Promise<unknown>;
	    deleteAVoiceMessageFromPbx(messageId: any): Promise<unknown>;
	    getAVoiceMessageFromPbx(messageId: string, messageDate: string, messageFrom: string): Promise<unknown>;
	    getDetailedListOfVoiceMessages(): Promise<unknown>;
	    getNumbersOfVoiceMessages(): Promise<unknown>;
	    getServerConversations(format?: string): Promise<unknown>;
	    createServerConversation(conversation: any): Promise<unknown>;
	    deleteServerConversation(conversationId: any): Promise<unknown>;
	    updateServerConversation(conversationId: any, mute: any): Promise<unknown>;
	    sendConversationByEmail(conversationId: any): Promise<unknown>;
	    ackAllMessages(conversationId: any): Promise<unknown>;
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
	    getABubblePublicLinkAsModerator(bubbleId?: string, emailContent?: boolean, language?: string): Promise<any>;
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
	    retrieveAllConferences(scheduled: any): Promise<unknown>;
	    /**
	     * Method retrieveWebConferences
	     * @public
	     * @param {string} mediaType mediaType of conference to retrieve. Default: this.MEDIATYPE.WEBRTC
	     * @returns {Promise<any>} a promise that resolves when conference are reterived
	     * @memberof WebConferenceService
	     */
	    retrieveWebConferences(mediaType?: string): Promise<any>;
	    retrieveAllCompanyOffers(companyId: string): Promise<unknown>;
	    retrieveAllCompanySubscriptions(companyId: string, format?: string): Promise<unknown>;
	    subscribeCompanyToOffer(companyId: string, offerId: string, maxNumberUsers?: number, autoRenew?: boolean): Promise<unknown>;
	    unSubscribeCompanyToSubscription(companyId: string, subscriptionId: string): Promise<unknown>;
	    subscribeUserToSubscription(userId: string, subscriptionId: string): Promise<unknown>;
	    unSubscribeUserToSubscription(userId: string, subscriptionId: string): Promise<unknown>;
	    getAUserProfiles(userId: string): Promise<unknown>;
	    getAUserProfilesFeaturesByUserId(userId: string): Promise<unknown>;
	    retrieveAllBubblesByTags(tags: Array<string>, format?: string, nbUsersToKeep?: number): Promise<unknown>;
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
	     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. <br>
	     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
	     * @param {string} newTagName New tag name. (Body Parameters)
	     * @description
	     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
	     */
	    renameDevicesTags(newTagName: string, tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @method deleteDevicesTags
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to remove a tag from the devices being in the companyIds provided in this option.. <br>
	     * If companyId is not provided, the tag is deleted from all the devices linked to all the companies that the administrator manage.
	     * @description
	     * This API can be used to remove a tag being assigned to some devices of the companies managed by the administrator.
	     */
	    deleteDevicesTags(tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @method getstatsTags
	     * @param {string} companyId Allows to compute the tags statistics for the devices associated to the companyIds provided in this option.  <br>
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
	    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string): Promise<unknown>;
	    getAlertFeedbackSentForAnAlert(alertId: string): Promise<unknown>;
	    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string): Promise<unknown>;
	    getReportSummary(alertId: string): Promise<unknown>;
	    getReportDetails(alertId: string): Promise<unknown>;
	    getReportComplete(alertId: string): Promise<unknown>;
	    getCalendarState(): Promise<unknown>;
	    getCalendarStates(users?: Array<string>): Promise<unknown>;
	    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string): Promise<unknown>;
	    getCalendarAutomaticReplyStatus(userid?: string): Promise<unknown>;
	    enableOrNotCalendar(disable: boolean): Promise<unknown>;
	    controlCalendarOrIgnoreAnEntry(disable?: boolean, ignore?: string): Promise<unknown>;
	    unregisterCalendar(): Promise<unknown>;
	    checkCSVdata(data?: any, companyId?: string, delimiter?: string, comment?: string): Promise<unknown>;
	    deleteAnImportStatusReport(reqId: string): Promise<unknown>;
	    getAnImportStatusReport(reqId?: string, format?: string): any;
	    getAnImportStatus(companyId?: string): any;
	    getInformationOnImports(companyId?: string): any;
	    getResultOfStartedOffice365TenantSynchronizationTask(tenant?: string, format?: string): any;
	    importCSVData(data?: any, companyId?: string, label?: string, noemails?: boolean, nostrict?: boolean, delimiter?: string, comment?: string): Promise<unknown>;
	    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant?: string): Promise<unknown>;
	    synchronizeOffice365TenantUserList(tenant?: string, format?: string): any;
	    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data?: any, companyId?: string, delimiter?: string, comment?: string): Promise<unknown>;
	    updateCommandIdStatus(data?: any, commandId?: string): Promise<unknown>;
	    synchronizeUsersAndDeviceswithCSV(CSVTxt?: string, companyId?: string, label?: string, noemails?: boolean, nostrict?: boolean, delimiter?: string, comment?: string, commandId?: string): Promise<{
	        reqId: string;
	        mode: string;
	        status: string;
	        userId: string;
	        displayName: string;
	        label: string;
	        startTime: string;
	    }>;
	    getCSVTemplate(companyId?: string, mode?: string, comment?: string): any;
	    checkCSVforSynchronization(CSVTxt: any, companyId?: string, delimiter?: string, comment?: string, commandId?: string): any;
	    getCheckCSVReport(commandId: string): Promise<unknown>;
	    importRainbowVoiceUsersWithCSVdata(companyId: string, label: string, noemails: boolean, nostrict: boolean, delimiter: string, comment: string, csvData: string): Promise<unknown>;
	    retrieveRainbowUserList(companyId?: string, format?: string, ldap_id?: boolean): Promise<unknown>;
	    checkCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, csvData: string): Promise<unknown>;
	    importCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, label: string, csvData: string): Promise<unknown>;
	    getCSVReportByCommandId(commandId: string): any;
	    createCSVReportByCommandId(commandId: string, data: any): Promise<unknown>;
	    retrieveRainbowEntriesList(companyId: string, format: string, ldap_id: boolean): any;
	    ActivateALdapConnectorUser(): Promise<{
	        id: string;
	        companyId: string;
	        loginEmail: string;
	        password: string;
	    }>;
	    deleteLdapConnector(ldapId: string): Promise<{
	        status: string;
	    }>;
	    retrieveAllLdapConnectorUsersData(companyId?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    sendCommandToLdapConnectorUser(ldapId: string, command: string): Promise<any>;
	    createConfigurationForLdapConnector(companyId: string, settings: any, name: string, type?: string): Promise<unknown>;
	    deleteLdapConnectorConfig(ldapConfigId: string): Promise<{
	        status: string;
	    }>;
	    retrieveLdapConnectorConfig(companyId: string): Promise<unknown>;
	    retrieveLdapConnectorConfigTemplate(type?: string): Promise<unknown>;
	    retrieveLdapConnectorAllConfigTemplates(): Promise<unknown>;
	    retrieveLdapConnectorAllConfigs(companyId: string): Promise<unknown>;
	    retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId: string): Promise<unknown>;
	    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict: boolean, name: string): Promise<unknown>;
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
	    retrieveAllAvailableCallLineIdentifications(): Promise<unknown>;
	    retrieveCurrentCallLineIdentification(): Promise<unknown>;
	    setCurrentActiveCallLineIdentification(policy: string, phoneNumberId?: string): Promise<unknown>;
	    addMemberToGroup(groupId: string, memberId: string, position: number, roles: [], status: string): Promise<unknown>;
	    deleteVoiceMessageAssociatedToAGroup(groupId: string, messageId: string): Promise<unknown>;
	    getVoiceMessagesAssociatedToGroup(groupId: string, limit: number, offset: number, sortField: string, sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string): Promise<unknown>;
	    getGroupForwards(groupId: string): Promise<unknown>;
	    getTheUserGroup(type: string): Promise<unknown>;
	    joinAGroup(groupId: string): Promise<unknown>;
	    joinAllGroups(): Promise<unknown>;
	    leaveAGroup(groupId: string): Promise<unknown>;
	    leaveAllGroups(): Promise<unknown>;
	    removeMemberFromGroup(groupId: string, memberId: string): Promise<unknown>;
	    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser(): Promise<unknown>;
	    updateAGroup(groupId: string, externalNumberId: string, isEmptyAllowed: boolean): Promise<unknown>;
	    updateAVoiceMessageAssociatedToAGroup(groupId: string, messageId: string, read: boolean): Promise<unknown>;
	    updateGroupForward(groupId: string, callForwardType: string, destinationType: string, numberToForward: number, activate: boolean, noReplyDelay: number, managerIds: Array<string>, rvcpAutoAttendantId: string): Promise<unknown>;
	    updateGroupMember(groupId: string, memberId: string, position: number, roles: Array<string>, status: string): Promise<unknown>;
	    activateDeactivateDND(activate: boolean): Promise<unknown>;
	    configureAndActivateDeactivateForward(callForwardType: string, type: string, number: string, timeout: number, activated: boolean): Promise<unknown>;
	    retrieveActiveForwards(): Promise<unknown>;
	    retrieveDNDState(): Promise<unknown>;
	    searchUsersGroupsContactsByName(displayName: string, limit: number): Promise<unknown>;
	    activatePersonalRoutine(routineId: string): Promise<unknown>;
	    createCustomPersonalRoutine(name: string): Promise<unknown>;
	    deleteCustomPersonalRoutine(routineId: string): Promise<unknown>;
	    getPersonalRoutineData(routineId: string): Promise<unknown>;
	    getAllPersonalRoutines(userId: any): Promise<unknown>;
	    updatePersonalRoutineData(routineId: string, dndPresence: boolean, name: string, presence: {
	        manage: boolean;
	        value: string;
	    }, deviceMode: {
	        manage: boolean;
	        mode: string;
	    }, immediateCallForward: {
	        manage: boolean;
	        activate: boolean;
	        number: string;
	        destinationType: string;
	    }, busyCallForward: {
	        manage: boolean;
	        activate: boolean;
	        number: string;
	        destinationType: string;
	    }, noreplyCallForward: {
	        manage: boolean;
	        activate: boolean;
	        number: string;
	        destinationType: string;
	        noReplyDelay: number;
	    }, huntingGroups: {
	        withdrawAll: boolean;
	    }): Promise<unknown>;
	    manageUserRoutingData(destinations: Array<string>, currentDeviceId: string): Promise<unknown>;
	    retrievetransferRoutingData(calleeId: string, addresseeId?: string, addresseePhoneNumber?: string): Promise<unknown>;
	    retrieveUserRoutingData(): Promise<unknown>;
	    retrieveVoiceUserSettings(): Promise<unknown>;
	    addParticipant3PCC(callId: string, callData: {
	        callee: string;
	    }): Promise<unknown>;
	    answerCall3PCC(callId: string, callData: {
	        legId: string;
	    }): Promise<unknown>;
	    blindTransferCall3PCC(callId: string, callData: {
	        destination: {
	            userId: string;
	            resource: string;
	        };
	    }): Promise<unknown>;
	    deflectCall3PCC(callId: string, callData: {
	        destination: string;
	    }): Promise<unknown>;
	    holdCall3PCC(callId: string, callData: {
	        legId: string;
	    }): Promise<unknown>;
	    makeCall3PCC(callData: {
	        deviceId: string;
	        callerAutoAnswer: boolean;
	        anonymous: boolean;
	        calleeExtNumber: string;
	        calleePbxId: string;
	        calleeShortNumber: string;
	        calleeCountry: string;
	        dialPadCalleeNumber: string;
	    }): Promise<unknown>;
	    mergeCall3PCC(activeCallId: string, callData: {
	        heldCallId: string;
	    }): Promise<unknown>;
	    pickupCall3PCC(callData: {
	        deviceId: string;
	        callerAutoAnswer: boolean;
	        calleeShortNumber: string;
	    }): Promise<unknown>;
	    releaseCall3PCC(callId: string, legId: string): Promise<unknown>;
	    retrieveCall3PCC(callId: string, callData: {
	        legId: string;
	    }): Promise<unknown>;
	    sendDTMF3PCC(callId: string, callData: {
	        legId: string;
	        digits: string;
	    }): Promise<unknown>;
	    snapshot3PCC(callId: string, deviceId: string, seqNum: number): Promise<unknown>;
	    transferCall3PCC(activeCallId: string, callData: {
	        heldCallId: string;
	    }): Promise<unknown>;
	    deleteAVoiceMessage(messageId: string): Promise<unknown>;
	    deleteAllVoiceMessages(messageId: string): Promise<unknown>;
	    getEmergencyNumbersAndEmergencyOptions(): Promise<unknown>;
	    getVoiceMessages(limit: number, offset: number, sortField: string, sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string): Promise<unknown>;
	    getUserDevices(): Promise<unknown>;
	    updateVoiceMessage(messageId: string, urlData: {
	        read: boolean;
	    }): Promise<unknown>;
	    forwardCall(callForwardType: string, userId: string, urlData: {
	        destinationType: string;
	        number: string;
	        activate: boolean;
	        noReplyDelay: number;
	    }): Promise<unknown>;
	    getASubscriberForwards(userId: string): Promise<unknown>;
	    searchCloudPBXhuntingGroups(name: string): Promise<unknown>;
	    createAClientVersion(id: string, version: string): Promise<unknown>;
	    deleteAClientVersion(clientId: string): Promise<unknown>;
	    getAClientVersionData(clientId: string): Promise<unknown>;
	    getAllClientsVersions(name?: string, typeClient?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    updateAClientVersion(clientId: string, version: string): Promise<unknown>;
	    createASite(name: string, status: string, companyId: string): Promise<unknown>;
	    deleteSite(siteId: string): Promise<unknown>;
	    getSiteData(siteId: string): Promise<unknown>;
	    getAllSites(format: string, limit: number, offset: number, sortField: string, sortOrder: number, name: string, companyId: string): Promise<unknown>;
	    updateSite(siteId: string, name: string, status: string, companyId: string): Promise<unknown>;
	    createDirectoryEntry(companyId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string): Promise<unknown>;
	    deleteCompanyDirectoryAllEntry(companyId: string): Promise<unknown>;
	    deleteDirectoryEntry(entryId: string): Promise<unknown>;
	    getDirectoryEntryData(entryId: string, format: string): Promise<unknown>;
	    getListDirectoryEntriesData(companyId: string, organisationIds: string, name: string, search: string, type: string, companyName: string, phoneNumbers: string, fromUpdateDate: Date, toUpdateDate: Date, tags: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number, view: string): Promise<unknown>;
	    updateDirectoryEntry(entryId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string): Promise<unknown>;
	    ImportDirectoryCsvFile: (companyId: any, csvContent: any, label: any) => Promise<unknown>;
	    getAllTagsAssignedToDirectoryEntries(companyId: string): Promise<unknown>;
	    removeTagFromAllDirectoryEntries(companyId: string, tag: string): Promise<unknown>;
	    renameTagForAllAssignedDirectoryEntries(tag: string, companyId: string, newTagName: string): Promise<unknown>;
	    getStatsRegardingTagsOfDirectoryEntries(companyId: string): Promise<unknown>;
	    createBubblePoll(roomId: string, title: string, questions: Array<{
	        text: string;
	        multipleChoice: boolean;
	        answers: Array<{
	            text: string;
	        }>;
	    }>, anonymous?: boolean, duration?: number): Promise<unknown>;
	    deleteBubblePoll(pollId: any): Promise<unknown>;
	    getBubblePoll(pollId: string, format?: string): Promise<unknown>;
	    getBubblePollsByBubble(roomId: string, format: string, limit: number, offset: number): Promise<unknown>;
	    publishBubblePoll(pollId: string): Promise<unknown>;
	    terminateBubblePoll(pollId: string): Promise<unknown>;
	    unpublishBubblePoll(pollId: string): Promise<unknown>;
	    updateBubblePoll(pollId: string, roomId: string, title: string, questions: Array<{
	        text: string;
	        multipleChoice: boolean;
	        answers: Array<{
	            text: string;
	        }>;
	    }>, anonymous: boolean, duration: number): Promise<unknown>;
	    votesForBubblePoll(pollId: string, votes: Array<{
	        question: number;
	        answers: Array<number>;
	    }>): Promise<unknown>;
	    addPSTNParticipantToConference(roomId: string, participantPhoneNumber: string, country: string): Promise<unknown>;
	    askConferenceSnapshotV2(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    snapshotConference(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    delegateConference(roomId: string, userId: string): Promise<unknown>;
	    disconnectPSTNParticipantFromConference(roomId: string): Promise<unknown>;
	    disconnectParticipantFromConference(roomId: string, userId: string): Promise<unknown>;
	    getTalkingTimeForAllPparticipantsInConference(roomId: string, limit?: number, offset?: number): Promise<unknown>;
	    joinConferenceV2(roomId: string, participantPhoneNumber?: string, country?: string, deskphone?: boolean, dc?: Array<string>, mute?: boolean, microphone?: boolean, media?: Array<string>): Promise<unknown>;
	    pauseRecording(roomId: string): Promise<unknown>;
	    resumeRecording(roomId: string): Promise<unknown>;
	    startRecording(roomId: string): Promise<unknown>;
	    stopRecording(roomId: string): Promise<unknown>;
	    rejectAVideoConference(roomId: string): Promise<unknown>;
	    startConferenceOrWebinarInARoom(roomId: string): Promise<unknown>;
	    stopConferenceOrWebinar(roomId: string): Promise<unknown>;
	    subscribeForParticipantVideoStream(roomId: string, userId: string, media?: string, subStreamLevel?: number, dynamicFeed?: boolean): Promise<unknown>;
	    updatePSTNParticipantParameters(roomId: string, phoneNumber: string, option?: string): Promise<unknown>;
	    updateConferenceParameters(roomId: string, option?: string): Promise<unknown>;
	    updateParticipantParameters(roomId: string, userId: string, option: string, media: string, bitRate: number, subStreamLevel: number, publisherId: string): Promise<unknown>;
	    allowTalkWebinar(roomId: string, userId: string): Promise<unknown>;
	    disableTalkWebinar(roomId: string, userId: string): Promise<unknown>;
	    lowerHandWebinar(roomId: string): Promise<unknown>;
	    raiseHandWebinar(roomId: string): Promise<unknown>;
	    stageDescriptionWebinar(roomId: string, userId: string, type: string, properties: Array<string>): Promise<unknown>;
	    createWebinar(name: string, subject: string, waitingRoomStartDate: Date, webinarStartDate: Date, webinarEndDate: Date, reminderDates: Array<Date>, timeZone: string, register: boolean, approvalRegistrationMethod: string, passwordNeeded: boolean, isOrganizer: boolean, waitingRoomMultimediaURL: Array<string>, stageBackground: string, chatOption: string): Promise<unknown>;
	    updateWebinar(webinarId: string, name: string, subject: string, waitingRoomStartDate: Date, webinarStartDate: Date, webinarEndDate: Date, reminderDates: Array<Date>, timeZone: string, register: boolean, approvalRegistrationMethod: string, passwordNeeded: boolean, isOrganizer: boolean, waitingRoomMultimediaURL: Array<string>, stageBackground: string, chatOption: string): Promise<unknown>;
	    getWebinarData(webinarId: string): Promise<unknown>;
	    getWebinarsData(role: string): Promise<unknown>;
	    warnWebinarModerators(webinarId: string): Promise<unknown>;
	    publishAWebinarEvent(webinarId: string): Promise<unknown>;
	    deleteWebinar(webinarId: string): Promise<unknown>;
	}
	export { RESTService, MEDIATYPE, GuestParams };

}
declare module 'lib/common/models/FileViewer' {
	export {}; class FileViewer {
	    private getContactByDBId;
	    viewerId: any;
	    type: any;
	    contact: any;
	    _avatarSrc: any;
	    /**
	     * @this FileViewer
	     */
	    constructor(viewerId: any, type: any, contact: any, getContactByDBId: any);
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
	    getDisplayNameTruncated(): string[];
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
	    getDisplayNameTruncated(): string[];
	    getExtension(): string;
	    private getThumbnailPlaceholderFromMimetype;
	} function FileDescriptorFactory(): (id: any, url: any, ownerId: any, fileName: any, extension: any, typeMIME: any, size: any, registrationDate: any, uploadedDate: any, dateToSort: any, viewers: any, state: any, thumbnail: any, orientation: any, md5sum: any, applicationId: any) => FileDescriptor;
	export { FileDescriptorFactory as fileDescriptorFactory, FileDescriptor };

}
declare module 'lib/services/FileServerService' {
	/// <reference types="node" />
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
	    init(useRestAtStartup: boolean): Promise<unknown>;
	    /**
	     *
	     * @private
	     * @param {string} url [required] server url for request
	     * @param {number} minRange [requied] minimum value of range
	     * @param {number} maxRange [required] maximum value of range
	     * @param {number} index [required] index of the part. Used to re-assemble the data
	     * @description
	     *    Method retrieve data from server using range request mecanism (RFC7233)
	     * @returns {Object} structure containing the response data from server and the index
	     *
	     */
	    getPartialDataFromServer(url: string, minRange: number, maxRange: number, index: number): Promise<unknown>;
	    getPartialBufferFromServer(url: string, minRange: number, maxRange: number, index: number): Promise<unknown>;
	    /**
	     * @description
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
	     * @description
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
	     * @description
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
	     * @description
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
	     * @description
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
	     * @description
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
	     * @description
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
	     * @description
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
	     * @description
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
	import { FileDescriptor } from 'lib/common/models/FileDescriptor';
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
	    init(useRestAtStartup: boolean): Promise<unknown>;
	    /**************** API ***************/
	    /**
	     * @public
	     * @since 1.47.1
	     * @method uploadFileToConversation
	     * @instance
	     * @async
	     * @category Files TRANSFER
	     * @param {Conversation} conversation   The conversation where the message will be added
	     * @param {{size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
	     * @param {String} strMessage   An optional message to add with the file
	     * @description
	     *    Allow to add a file to an existing conversation (ie: conversation with a contact) <br>
	     *    Return the promise <br>
	     * @return {Message} Return the message sent <br>
	     */
	    uploadFileToConversation(conversation: any, file: any, strMessage: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method uploadFileToBubble
	     * @instance
	     * @async
	     * @category Files TRANSFER
	     * @param {Bubble} bubble   The bubble where the message will be added
	     * @param {File} file The file to add
	     * @param {String} strMessage   An optional message to add with the file
	     * @description
	     *    Allow to add a file to an existing Bubble conversation <br>
	     *    Return a promise <br>
	     * @return {Message} Return the message sent <br>
	     */
	    uploadFileToBubble(bubble: any, file: any, strMessage: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.67.0
	     * @method uploadFileToStorage
	     * @category Files TRANSFER
	     * @async
	     * @param {String|File} file An {size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
	     * @instance
	     * @description
	     *   Send a file in user storage <br>
	     */
	    uploadFileToStorage(file: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method downloadFile
	     * @category Files TRANSFER
	     * @async
	     * @instance
	     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
	     * @param {string} path If provided then the retrieved file is stored in it. If not provided then
	     * @description
	     *    Allow to download a file from the server) <br>
	     *    Return a promise <br>
	     * @return {} Object with : Array of buffer Binary data of the file type,  Mime type, fileSize: fileSize, Size of the file , fileName: fileName The name of the file  Return the file received
	     */
	    downloadFile(fileDescriptor: any, path?: string): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.79.0
	     * @method downloadFileInPath
	     * @instance
	     * @category Files TRANSFER
	     * @async
	     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
	     * @param {string} path If provided then the retrieved file is stored in it. If not provided then
	     * @async
	     * @description
	     *    Allow to download a file from the server and store it in provided path. <br>
	     *    Return a promise <br>
	     * @return {Observable<any>} Return an Observable object to see the completion of the download/save. <br>
	     * It returns a percentage of downloaded data Values are between 0 and 100 (include). <br>
	     * The last one value is the description and content of the file : <br>
	     *  { <br>
	     *      buffer : blobArray, // the buffer with the content of the file. <br>
	     *      type: mime, // The mime type of the encoded file <br>
	     *      fileSize: fileSize, // The size in octects of the file <br>
	     *      fileName: fileName // The file saved. <br>
	     *  } <br>
	     *  Warning !!! : <br>
	     *  take care to not log this last data which can be very important for big files. You can test if the value is < 101. <br>
	     */
	    downloadFileInPath(fileDescriptor: any, path: string): Promise<Observable<any>>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method removeFile
	     * @instance
	     * @async
	     * @category Files TRANSFER
	     * @param {FileDescriptor} fileDescriptor   The description of the file to remove (short file descriptor)
	     * @description
	     *    Remove an uploaded file <br>
	     *    Return a promise <br>
	     * @return {Object} Return a SDK OK Object or a SDK error object depending the result
	     */
	    removeFile(fileDescriptor: any): Promise<unknown>;
	    /**
	     * @private
	     * @since 1.47.1
	     * @method
	     * @instance
	     * @async
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     *    Allow to add a file to an existing Peer 2 Peer or Bubble conversation <br>
	     *    Return a promise <br>
	     * @return {Message} Return the message sent
	     */
	    _addFileToConversation(conversation: any, file: any, data: any): Promise<unknown>;
	    /**********************************************************/
	    /**  Basic accessors to FileStorage's properties   **/
	    /**********************************************************/
	    getFileDescriptorById(id: any): any;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFileDescriptorFromId
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {String} id   The file id
	     * @description
	     *    Get the file descriptor the user own by it's id <br>
	     * @return {FileDescriptor} Return a file descriptors found or null if no file descriptor has been found
	     */
	    getFileDescriptorFromId(id: any): any;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesReceivedInConversation
	     * @instance
	     * @async
	     * @param {Conversation} conversation   The conversation where to get the files
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     *    Get the list of all files received in a conversation with a contact <br>
	     *    Return a promise <br>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesReceivedInConversation(conversation: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesReceivedInBubble
	     * @instance
	     * @async
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {Bubble} bubble   The bubble where to get the files
	     * @description
	     *    Get the list of all files received in a bubble <br>
	     *    Return a promise <br>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesReceivedInBubble(bubble: any, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string, limit: number, offset: number, sortField: string, sortOrder: number): Promise<unknown>;
	    /**
	     * @private
	     * @description
	     * Method returns a file descriptor with full contact object in viewers'list by requesting server <br>
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @async
	     * @param {string} fileId [required] Identifier of file descriptor
	     * @return {Promise<FileDescriptor>} file descriptor
	     *
	     */
	    getCompleteFileDescriptorById(id: any): Promise<unknown>;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @return {FileDescriptor[]}
	     */
	    getDocuments(): any;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @return {FileDescriptor}
	     */
	    getReceivedDocuments(): any;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {boolean} received
	     * @return {FileDescriptor[]}
	     */
	    getDocumentsByName(received: any): any;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {boolean} received
	     * @return {FileDescriptor[]}
	     */
	    getDocumentsByDate(received: any): any;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {boolean} received
	     * @return {FileDescriptor[]}
	     */
	    getDocumentsBySize(received: any): any;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} dbId
	     * @return {FileDescriptor[]}
	     */
	    getReceivedFilesFromContact(dbId: any): any;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} dbId
	     * @return {FileDescriptor[]}
	     */
	    getSentFilesToContact(dbId: any): any;
	    /**
	     * @method getReceivedFilesForRoom
	     * @public
	     *
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} bubbleId id of the bubble
	     * @description
	     *    Method to get the list of received files descriptors.
	     * @return {FileDescriptor[]}
	     */
	    getReceivedFilesForRoom(bubbleId: any): any;
	    /**
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
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
	     * Method requests server to create a file descriptor this will be saved to local file descriptor list (i.e. this.fileDescriptors) <br>
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} name [required] name of file for which file descriptor has to be created
	     * @param {string} extension [required] extension of file
	     * @param {number} size [required] size of  file
	     * @param {FileViewer[]} viewers [required] list of viewers having access to the file (a viewer could be either be a user or a room)
	     * @param {boolean} voicemessage When set to True, that allows to identify voice memos in a chat or multi-users chat conversation.
	     * @param {number} duration The voice message in seconds. This field must be a positive number and is only taken into account when voicemessage is true.
	     * @param {boolean} encoding AAC is the choosen format to encode a voice message. This is the native format for mobile clients, nor web client (OPUS, OGG..). This field must be set to true to order a transcodind and is only taken into account when voicemessage is true.
	     * @param {boolean} ccarelogs When set to True, that allows to identify a log file uploaded by the user
	     * @param {boolean} ccareclientlogs When set to True, that allows to identify a log file uploaded automatically by the client application
	     * @return {Promise<FileDescriptor>} file descriptor created by server or error
	     *
	     */
	    createFileDescriptor(name: any, extension: any, size: any, viewers: any, voicemessage?: boolean, duration?: number, encoding?: boolean, ccarelogs?: boolean, ccareclientlogs?: boolean): Promise<unknown>;
	    /**
	     *
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {*} data
	     * @return {FileDescriptor}
	     */
	    createFileDescriptorFromData(data: any): any;
	    /**
	     * @private
	     * @description
	     *
	     * Method request deletion of a file descriptor on the server and removes it from local storage <br>
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} id [required] file descriptor id to be destroyed
	     * @return {Promise<FileDescriptor[]>} list of remaining file descriptors
	     */
	    deleteFileDescriptor(id: any): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * Method request deletion of all files on the server and removes them from local storage <br>
	     * @return {Promise<{}>} ???
	     */
	    deleteAllFileDescriptor(): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveFileDescriptorsListPerOwner
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @async
	     * @instance
	     * @param {string} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion.
	     * typeMIME='image/jpeg' allows to get all jpeg file
	     * typeMime='image' allows to get all image files whatever the extension
	     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files
	     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). purpose=conference_record allows to get all records of conference
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} viewerId Among all files shared by the user, allow to specify a viewer.
	     * @param {string} path For visual voice mail feature only (step1), allows to get file descriptors of each file under the given path.
	     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 1000 Possibles values : 0-1000
	     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0
	     * @param {string} sortField Sort items list based on the given field.
	     * @param {string} sortOrder Specify order when sorting items list. Default value : 1 Possibles values : -1, 1
	     * @param {string} format Allows to retrieve more or less file descriptors details in response.
	     * small: _id, fileName, extension, isClean
	     * medium: _id, fileName, extension, typeMIME, size, isUploaded,isClean, avReport, thumbnail, thumbnail500, original_w, original_h
	     * full: all descriptors fields except storageURL
	     * Default value : full Possibles values : "small", "medium", "full"
	     * @description
	     * Method retrieve full list of files belonging to user making the request <br>
	     *
	     * @return {Promise<FileDescriptor[]>}
	     *
	     */
	    retrieveFileDescriptorsListPerOwner(fileName?: string, extension?: string, typeMIME?: string, purpose?: string, isUploaded?: boolean, viewerId?: string, path?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number, format?: string): Promise<[any]>;
	    /**
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * Method retrieve a list of [limit] files belonging to user making the request begining with offset <br>
	     *
	     * @return {Promise<FileDescriptor[]>}
	     *
	     */
	    retrieveFileDescriptorsListPerOwnerwithOffset(fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, viewerId: string, path: string, limit: number, offset: number, sortField: string, sortOrder: number, format?: string): Promise<unknown>;
	    /**
	     * @private
	     *
	     * @description
	     * Method request for the list of files received by a user from a given peer (i.e. inside a given conversation) <br>
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @async
	     * @param {string} userId [required] dbId of user making the request
	     * @param {string} peerId [required] dbId of peer user in the conversation
	     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
	     *
	     */
	    retrieveFilesReceivedFromPeer(userId: any, peerId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveSentFiles
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @instance
	     * @description
	     * Method request for the list of files sent to a given peer (i.e. inside a given conversation) <br>
	     *
	     * @param {string} peerId [required] id of peer user in the conversation
	     * @param {string} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion.
	     * typeMIME='image/jpeg' allows to get all jpeg file
	     * typeMime='image' allows to get all image files whatever the extension
	     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files
	     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). purpose=conference_record allows to get all records of conference
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} path For visual voice mail feature only (step1), allows to get file descriptors of each file under the given path.
	     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 1000 Possibles values : 0-1000
	     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0
	     * @param {string} sortField Sort items list based on the given field.
	     * @param {string} sortOrder Specify order when sorting items list. Default value : 1 Possibles values : -1, 1
	     * @param {string} format Allows to retrieve more or less file descriptors details in response.
	     * small: _id, fileName, extension, isClean
	     * medium: _id, fileName, extension, typeMIME, size, isUploaded,isClean, avReport, thumbnail, thumbnail500, original_w, original_h
	     * full: all descriptors fields except storageURL
	     * Default value : full Possibles values : "small", "medium", "full"
	     * @return {Promise<FileDescriptor[]>} : list of sent files descriptors
	     *
	     */
	    retrieveSentFiles(peerId: string, fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, path: string, limit: number, offset: number, sortField: string, sortOrder?: number, format?: string): Promise<unknown>;
	    /**
	     * @public
	     *
	     * @method retrieveReceivedFilesForRoom
	     * @instance
	     * @description
	     * Method request for the list of files received in a room <br>
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} bubbleId [required] Id of the room
	     * @param {string} ownerId Among all files shared with the user, allow to precify a provider.
	     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion.
	     * typeMIME='image/jpeg' allows to get all jpeg file
	     * typeMime='image' allows to get all image files whatever the extension
	     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files
	     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). purpose=conference_record allows to get all records of conference
	     * @param {string} roomName A word of the conference name. When purpose=conference_record is used, allow to reduce the list of results focusing of the recording name.
	     * @param {boolean} overall When true, allow to get all files (my files and received files) in the same paginated list
	     * @param {string} format Allows to retrieve viewers of each file when the format is full.
	     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
	     * Default value : full Possibles values : small, medium, full
	     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 1000
	     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
	     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1 Possibles values : -1, 1
	     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
	     *
	     */
	    retrieveReceivedFilesForRoom(bubbleId: any, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     *
	     * @public
	     * @method retrieveReceivedFiles
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @instance
	     * @async
	     * @description
	     * Method request for the list of files received by a user <br>
	     *
	     * @param {string} viewerId [required] Id of the viewer, could be either an userId or a bubbleId
	     * @param {string} ownerId Among all files shared with the user, allow to precify a provider. Example a peerId in a face to face conversation.
	     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. </br>
	     * typeMIME='image/jpeg' allows to get all jpeg file </br>
	     * typeMime='image' allows to get all image files whatever the extension </br>
	     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files </br>
	     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension </br>
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). </br> purpose=conference_record allows to get all records of conference
	     * @param {string} roomName A word of the conference name. When purpose=conference_record is used, allow to reduce the list of results focusing of the recording name.
	     * @param {boolean} overall When true, allow to get all files (my files and received files) in the same paginated list
	     * @param {string} format Allows to retrieve viewers of each file when the format is full.
	     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
	     * Default value : full. Possibles values : small, medium, full
	     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
	     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possibles values : -1, 1
	     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
	     *
	     */
	    retrieveReceivedFiles(viewerId: string, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string, limit: number, offset: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesSentInConversation
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {Conversation} conversation   The conversation where to get the files
	     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. </br>
	     * typeMIME='image/jpeg' allows to get all jpeg file </br>
	     * typeMime='image' allows to get all image files whatever the extension </br>
	     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files </br>
	     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension </br>
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). </br> purpose=conference_record allows to get all records of conference
	     * @param {string} format Allows to retrieve viewers of each file when the format is full.
	     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
	     * Default value : full. Possibles values : small, medium, full
	     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
	     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possibles values : -1, 1
	     * @description
	     *    Get the list of all files sent in a conversation with a contact <br>
	     *    Return a promise <br>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesSentInConversation(conversation: any, fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, path: string, limit: number, offset: number, sortField: string, sortOrder: number, format?: string): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getFilesSentInBubble
	     * @instance
	     * @param {Bubble} bubble   The bubble where to get the files
	     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. </br>
	     * typeMIME='image/jpeg' allows to get all jpeg file </br>
	     * typeMime='image' allows to get all image files whatever the extension </br>
	     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files </br>
	     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension </br>
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). </br> purpose=conference_record allows to get all records of conference
	     * @param {string} path For visual voice mail feature only (step1), allows to get file descriptors of each file under the given path.
	     * @param {string} format Allows to retrieve viewers of each file when the format is full.
	     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
	     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
	     * Default value : full. Possibles values : small, medium, full
	     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
	     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possibles values : -1, 1
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     *    Get the list of all files sent in a bubble <br>
	     *    Return a promise <br>
	     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
	     */
	    getFilesSentInBubble(bubble: any, fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, path: string, limit: number, offset: number, sortField: string, sortOrder: number, format?: string): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getUserQuotaConsumption
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @instance
	     * @description
	     *    Get the current file storage quota and consumption for the connected user <br>
	     *    Return a promise <br>
	     * @return {Object} Return an object containing the user quota and consumption
	     */
	    getUserQuotaConsumption(): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getAllFilesSent
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     *    Get the list of files (represented using an array of File Descriptor objects) created and owned by the connected which is the list of file sent to all of his conversations and bubbles. <br>
	     * @return {FileDescriptor[]} Return an array containing the list of FileDescriptor objects representing the files sent
	     */
	    getAllFilesSent(): any;
	    /**
	     * @public
	     * @since 1.47.1
	     * @method getAllFilesReceived
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     *    Get the list of files (represented using an array of File Descriptor objects) received by the connected user from all of his conversations and bubbles. <br>
	     * @return {FileDescriptor[]} Return an array containing a list of FileDescriptor objects representing the files received
	     */
	    getAllFilesReceived(): any;
	    /**
	     * @private
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * Method retrieve the data usage of a given user <br>
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
	     * Method deletes a viewer from the list of viewer of a given file <br>
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
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
	     * @category Files FILE MANAGEMENT / PROPERTIES
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
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * Method retrieve a specific file descriptor from server <br>
	     *
	     * @param {string} fileId [required] Identifier of file descriptor to retrieve
	     * @return {Promise<FileDescriptor>} file descriptor retrieved
	     *
	     */
	    retrieveOneFileDescriptor(fileId: any): Promise<any>;
	    /**
	     * @private
	     *
	     * @description
	     * Method retrieve a specific file descriptor from server and stores it in local fileDescriptors (replace existing and add if new) <br>
	     *
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @param {string} fileId [required] Identifier of file descriptor to retrieve
	     * @return {Promise<FileDescriptor>} file descriptor retrieved or null if none found
	     *
	     */
	    retrieveAndStoreOneFileDescriptor(fileId: any, forceRetrieve: any): Promise<any>;
	    /**
	     * @public
	     * @method getFileDescriptorsByCompanyId
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * Get all file descriptors belonging to a given companyId.  <br>
	     * The result is paginated.  <br>
	     *
	     * @param {string} companyId Company unique identifier. If no value is provided then the companyId of the connected user is used.
	     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
	     * @param {string} extension Allows to filter file descriptors by extension criterion.
	     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. <br>
	     *  <br>
	     * - typeMIME=audio/wav allows to get all wav file <br>
	     * - typeMime=audio allows to get all audio files whatever the extension <br>
	     * - typeMIME=audio/wav&typeMIME=audio/mp3 allows to get all wav and mp3 files <br>
	     *  <br>
	     * @param {string} purpose Allows to filter file descriptors by the utility of the file (rvcp_voice_promp, rvcp_record). <br>
	     *  <br>
	     * - purpose=rvcp_voice_promp allows to get all voice prompt used by Rainbow Voice Communication Platform <br>
	     * - purpose=rvcp_record allows to get all records generated by Rainbow Voice Communication Platform <br>
	     * - purpose=rvcp allows to get all Rainbow Voice Communication Platform files <br>
	     *  <br>
	     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
	     * @param {string} format Allows to retrieve viewers of each file when the format is full. <br>
	     *   <br>
	     * - small: _id, fileName, extension, isClean <br>
	     * - medium: _id, fileName, extension, typeMIME, size, isUploaded,isClean, avReport, thumbnail, thumbnail500, original_w, original_h <br>
	     * - full: all descriptors fields except storageURL   <br>
	     *  <br>
	     * Default value : small <br>
	     * Possible values : small, medium, full <br>
	     *  <br>
	     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
	     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possible values : -1, 1
	     * @return {Promise<any>} all file descriptors belonging to a given companyId.
	     *
	     */
	    getFileDescriptorsByCompanyId(companyId?: string, fileName?: boolean, extension?: string, typeMIME?: string, purpose?: string, isUploaded?: boolean, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method copyFileInPersonalCloudSpace
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * This API allows to keep a copy in my personal cloud space. Then:
	     * - A new file descriptor is created.
	     * - The viewer becomes owner. The file has not yet viewer.
	     * - A copy of the file is put in the viewer's personal cloud space.
	     * - A STANZA MESSAGE (type management) is sent to the owner of this new file. (tag 'file', action='update')
	     *
	     * To copy the file you must:
	     *
	     * - have enough space to store the file.(errorDetailsCode: 403630)
	     * - not be the owner of the file.(errorDetailsCode: 403631)
	     * - be an allowed viewer. The file is shared via a conversation or via a room.(errorDetailsCode: 403632)
	     * - copy a file uploaded.(errorDetailsCode: 403630)
	     * - have a personal cloud space in the same data center than the owner of the file.
	     *
	     * @param {string} fileId [required] Identifier of file descriptor to modify
	     * @return {Promise<FileDescriptor>} File descriptor Object
	     *
	     */
	    copyFileInPersonalCloudSpace(fileId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method fileOwnershipChange
	     * @instance
	     * @category Files FILE MANAGEMENT / PROPERTIES
	     * @description
	     * As a file owner, I want to Drop the ownership to another Rainbow user of the same company.     <br>
	     *      Then:     <br>
	     * <br>
	     * The former owner becomes a viewer to stay allowed to get the display of the file.     <br>
	     * The new owner may loose his status of viewer when needed (as he becomes owner).     <br>
	     * <br>
	     * Error cases:
	     *
	     * - the former owner's company must allow file ownership change (forbidFileOwnerChangeCustomisation == disabled) errorDetailCode 403156 Access denied: this API can only be called by users having the feature key forbidFileOwnerChangeCustomisation disabled
	     * - the logged in user is not the owner (errorDetailsCode: 403629)
	     * - the new owner must belong to the same company of the current owner. errorDetailCode 403637 User [userId] doesn't belong to the company [companyId]
	     * - the target file is not uploaded yet. errorDetailCode 403638 File [fileId] is not uploaded yet. So it can't be re-allocated.
	     * - the new owner must have enough space to store the file.(errorDetailsCode: 403630)
	     * - A STANZA MESSAGE (type management) is sent to the owner and each viewers. (tag 'file', action='update', owner='xxxxxxxxxxxxx')
	     *
	     * @param {string} fileId [required] Identifier of file descriptor to modify
	     * @param {string} userId ID of another user which will become owner.
	     * @return {Promise<FileDescriptor>} File descriptor Object
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | File descriptor Object |
	     * | id  | String | File unique identifier (like 56d0277a0261b53142a5cab5) |
	     * | fileName | String | Name of the file |
	     * | ownerId | String | Rainbow Id of the file owner |
	     * | md5sum | String | md5 of the file get from the backend file storage (default: "", refreshed each time the file is uploaded) |
	     * | extension | String | File extension (jpeg, txt, ...) |
	     * | typeMIME | String | https://fr.wikipedia.org/wiki/Type_MIME (image/jpeg,text/plain,...) |
	     * | size | Number | Size of the file (Default: value given by Rainbow clients). Refreshed from the backend file storage each time the file is uploaded. |
	     * | registrationDate | Date-Time | Date when the submit to upload this file was registered |
	     * | isUploaded | Boolean | true when the file was uploaded at least one time |
	     * | uploadedDate | Date-Time | Last time when the file was uploaded |
	     * | viewers | Object\[\] | A set of objects including user or room Rainbow Id, type (user, room) |
	     * | thumbnail | Object | Data of the thumbnail 'low resolution' (200X200 for images, 300x300 for .pdf, at least one dimension is 200 or 300)) |
	     * | availableThumbnail | Boolean | Thumbnail availability |
	     * | wantThumbnailDate | Date-Time | When the thumbnail is ordered |
	     * | size | Number | Thumbnail size |
	     * | md5sum | String | md5 of the thumbnail get from the backend file storage |
	     * | typeMIME | String | https://fr.wikipedia.org/wiki/Type_MIME (application/octet-stream) |
	     * | thumbnail500 | Object | Data of the thumbnail 'High resolution' (500x500 - at least one dimension is 500) |
	     * | availableThumbnail | Boolean | Thumbnail availability |
	     * | wantThumbnailDate | Date-Time | When the thumbnail is ordered |
	     * | size | Integer | Thumbnail size |
	     * | md5sum | String | md5 of the thumbnail get from the backend file storage |
	     * | isClean | Boolean | Null when the file is not yet scanned by an anti-virus |
	     * | typeMIME | String | https://fr.wikipedia.org/wiki/Type_MIME (application/octet-stream) |
	     * | avReport | String | Null when the file is not yet scanned by an anti-virus |
	     * | original_w | Number | For images only (jpeg, jpg, png, gif, pdf), this is the original width. It is processed at the same time as the thumbnails processing. (asynchronously) |
	     * | original_h | Number | For images only (jpeg, jpg, png, gif, pdf), this is the original height. It is processed at the same time as the thumbnails processing. (asynchronously) |
	     * | tags | Object | Wrap a set of data according with the file use |
	     * | path | String | The path under which the owner will be able to classified the file. The folder management is not yet available; only a get files per path. For instance this facility is used to implement OXO visual voice mail feature on client side.<br><br>* /<br>* /voice-messages |
	     * | msgId | String | When the file is generated by the Rainbow visual voice mail feature - The message Id (ex: "g0F6jhGrIXN5NQa") |
	     * | messageType | String | When the file is generated by the Rainbow visual voice mail feature - The message type<br><br>default : `voice_message`<br><br>Possible values : `voice_message`, `conv_recording` |
	     * | duration | Number | The message duration in second (voice message duration) |
	     *
	     *
	     */
	    fileOwnershipChange(fileId: any, userId: any): Promise<FileDescriptor>;
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
	     * Method extract fileId part of URL <br>
	     *
	     * @param {string} url
	     * @return {string}
	     *
	     */
	    extractFileIdFromUrl(url: any): any;
	}
	export { FileStorage as FileStorageService };

}
declare module 'lib/common/models/webConferenceParticipant' {
	import { Contact } from 'lib/common/models/Contact';
	/**
	 * @module
	 * @name WebConferenceParticipant
	 * @description
	 * This class is used to represent a web conference participant object that
	 * is part of the WebConferenceSession
	 */
	export class WebConferenceParticipant {
	    /**
	     * @public
	     * @name id
	     * @description The ID of the participant;
	     * @type {string}
	     * @readonly
	     */
	    id: string;
	    /**
	     * @public
	     * @name contact
	     * @description Contact object related to the web conference participant
	     * @type {Contact}
	     * @readonly
	     */
	    contact: Contact;
	    /**
	     * @public
	     * @name isVideoAvailable
	     * @description Whether the participant is currently publishing his video in the conference
	     * @type {boolean}
	     * @readonly
	     */
	    isVideoAvailable: boolean;
	    /**
	     * @public
	     * @name videoSession
	     * @description The current video session related to that participant. If the session is null but the 'isVideoAvailable'
	     * is true, then we can subscribe to this participant video.
	     * @type {any}
	     * @readonly
	     */
	    videoSession: any;
	    /**
	     * @public
	     * @name mute
	     * @description Whether the participant is currently muted
	     * @type {boolean}
	     * @readonly
	     */
	    mute: boolean;
	    /**
	     * @public
	     * @name noMicrophone
	     * @description Whether the participant has joined without microphone
	     * @type {boolean}
	     * @readonly
	     */
	    noMicrophone: boolean;
	    /**
	     * @public
	     * @name role
	     * @description The current role of the participant. It could be either a moderator, or participant
	     * @type {string}
	     * @readonly
	     */
	    role: string;
	    /**
	     * @public
	     * @name isSharingParticipant
	     * @description Whether the current participant object is a sharing participant (in this case, the videoSession object is related to the sharing session)
	     * @type {boolean}
	     * @readonly
	     */
	    isSharingParticipant: boolean;
	    /**
	     * @public
	     * @name delegateCapability
	     * @description Indicates whether the conference can be delegated to the current participant
	     * @type {boolean}
	     * @readonly
	     */
	    delegateCapability: boolean;
	    subscriptionInProgress: boolean;
	    static create(id: string): WebConferenceParticipant;
	    constructor(id: string);
	}

}
declare module 'lib/common/models/webConferenceSession' {
	import { Bubble } from 'lib/common/models/Bubble';
	import { WebConferenceParticipant } from 'lib/common/models/webConferenceParticipant';
	/**
	 * @module
	 * @name WebConferenceSession
	 * @description
	 * This class is used to represent a web conference session containing
	 * all the relevant information to the current conference session
	 */
	export class WebConferenceSession {
	    /**
	     * @public
	     * @name id
	     * @description Conference Session ID. This is a global reference of the conference session
	     * @type {string}
	     * @readonly
	     */
	    id: string;
	    /**
	     * @public
	     * @name bubble
	     * @description The Bubble object related to the conference
	     * @type {Bubble}
	     * @readonly
	     */
	    bubble: Bubble;
	    /**
	     * @public
	     * @name status
	     * @description The current status of the conference. It could be "connecting", "connected", "reconnecting", "ended"
	     * @type {string}
	     * @readonly
	     */
	    status: string;
	    /**
	     * @public
	     * @name duration
	     * @description The current duration of the conference (in seconds)
	     * @type {number}
	     * @readonly
	     */
	    duration: number;
	    /**
	     * @public
	     * @name localParticipant
	     * @description Yourself in the conference
	     * @type {WebConferenceParticipant}
	     * @readonly
	     */
	    localParticipant: WebConferenceParticipant;
	    /**
	     * @public
	     * @name participants
	     * @description The list of other participants currently connected in the conference
	     * @type {WebConferenceParticipant[]}
	     * @readonly
	     */
	    participants: WebConferenceParticipant[];
	    /**
	     * @public
	     * @name hasLocalSharing
	     * @description Boolean indicating whether the current user is currently sharing his screen
	     * @type {boolean}
	     * @readonly
	     */
	    hasLocalSharing: boolean;
	    /**
	     * @public
	     * @name localSharingSession
	     * @description The local sharing session (as a JINGLE SESSION object) or null
	     * @type {any}
	     * @readonly
	     */
	    localSharingSession: any;
	    /**
	     * @public
	     * @name audioSession
	     * @description The Audio session related to the web conference. (represented as a Jingle Session object)
	     * @type {any}
	     * @readonly
	     */
	    audioSession: any;
	    private sharingParticipant;
	    private pinnedParticipant;
	    type: string;
	    haveJoined: boolean;
	    isInExternalWindow: boolean;
	    conferenceView: string;
	    externalWindowRef: any;
	    isOnlySharingWindow: boolean;
	    control: any;
	    conferenceLayoutSize: any;
	    record: any;
	    recordingStarted: boolean;
	    currentRecordingState: string;
	    isMyConference: boolean;
	    dimLocalSharingScreen: boolean;
	    localStreams: any;
	    jingleJid: string;
	    originalVideoStream: any;
	    metricsId: string;
	    metricsState: string;
	    private durationTimer;
	    private locked;
	    static create(id: string, bubble: Bubble): WebConferenceSession;
	    constructor(id: string, bubble: Bubble);
	    /**
	     * @public
	     * @function getParticipants
	     * @instance
	     * @description
	     *    Get a list of all connected participants in the conference (except for yourself)
	     * @returns {WebConferenceParticipant[]} Return an array of all WebConferenceParticipants taking part of the web conference
	     */
	    getParticipants(): WebConferenceParticipant[];
	    /**
	     * @public
	     * @function getLocalParticipant
	     * @instance
	     * @description
	     *    Get yourself as a web conference participant
	     * @returns {WebConferenceParticipant} Return the current user as a web conference participant connected to the conference
	     */
	    getLocalParticipant(): WebConferenceParticipant;
	    /**
	     * @public
	     * @function getBubble
	     * @instance
	     * @description
	     *    Get the bubble related to the web conference session
	     * @returns {Bubble} Get the bubble related to the web conference session
	     */
	    getBubble(): Bubble;
	    /**
	     * @public
	     * @function getAudioSession
	     * @instance
	     * @description
	     *    Get the jingle audio session related to the conference session
	     * @returns {any} The jingle audio session related to the conference session
	     */
	    getAudioSession(): any;
	    /**
	     * @public
	     * @function getSharingParticipant
	     * @instance
	     * @description
	     *    Get web conference participant object that is currently sharing in the conference (could not be myself)
	     * @returns {WebConferenceParticipant} Web conference participant object that is currently sharing (could not be myself)
	     */
	    getSharingParticipant(): WebConferenceParticipant;
	    /**
	     * @public
	     * @function getLocalSharingSession
	     * @instance
	     * @description
	     *    Get the local sharing session (if any)
	     * @returns {any} The local sharing session (or null)
	     */
	    getLocalSharingSession(): any;
	    /**
	     * @public
	     * @function getRemoteSharingSession
	     * @instance
	     * @description
	     *    Get the remote sharing session (if any)
	     * @returns {any} The remote sharing session (or null) from the sharing participant object
	     */
	    getRemoteSharingSession(): any;
	    /**
	     * @public
	     * @function getParticipantById
	     * @instance
	     * @param {string} participantId the ID of the participant to find
	     * @description
	     *    Find and return a participant by his Id
	     * @returns {WebConferenceParticipant} The WebConferenceParticipant (if found) by his id
	     */
	    getParticipantById(participantId: string): WebConferenceParticipant;
	    /**
	     * @public
	     * @function isLock
	     * @instance
	     * @description
	     *    Check if the current web conference is locked. In case it's locked, no other user is allowed to join it
	     * @returns {boolean} Return a boolean value indicating whether the web conference is currently locked
	     */
	    isLocked(): boolean;
	    /**
	     * @public
	     * @function getDelegateParticipantsList
	     * @instance
	     * @description
	     *    Get the list of participants to whom we can delegate the current conference. Delegation means that we give
	     *    the ownership of the conference to another user
	     * @returns {Array} Return an array of WebConferenceParticipant to whom we can delegate the conference
	     */
	    getDelegateParticipantsList(): WebConferenceParticipant[];
	    addOrUpdateParticipant(participant: WebConferenceParticipant): void;
	    startDuration(): void;
	    stopDuration(): void;
	    getPinnedParticipant(): any;
	    updatePinnedParticipant(participant?: WebConferenceParticipant, mediaType?: string): void;
	    setLocked(lock?: boolean): void;
	    setSharingParticipant(participant?: WebConferenceParticipant): void;
	    private getParticipantByIdAndMediaType;
	}

}
declare module 'lib/connection/XMPPServiceHandler/conversationEventHandler' {
	import { Element } from 'ltx';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler';
	import { ConferenceSession } from 'lib/common/models/ConferenceSession';
	import { List } from 'ts-generic-collections-linq';
	import { XMPPService } from 'lib/connection/XMPPService';
	export {}; class ConversationEventHandler extends GenericHandler {
	    MESSAGE: string;
	    MESSAGE_CHAT: string;
	    MESSAGE_GROUPCHAT: string;
	    MESSAGE_WEBRTC: string;
	    MESSAGE_MANAGEMENT: string;
	    MESSAGE_ERROR: string;
	    MESSAGE_HEADLINE: string;
	    MESSAGE_CLOSE: string;
	    private _conversationService;
	    findAttrs: any;
	    findChildren: any;
	    private _fileStorageService;
	    private _fileServerService;
	    private _bubbleService;
	    private _contactsService;
	    private _presenceService;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, conversationService: any, fileStorageService: any, fileServerService: any, bubbleService: any, contactsService: any, presenceService: any);
	    private createSessionParticipantFromElem;
	    parseConferenceV2UpdatedEvent(stanza: any, id: any, node: any): Promise<void>;
	    onChatMessageReceived(msg: any, stanza: Element): Promise<void>;
	    parseParticipantsFromConferenceUpdatedEvent(conference: ConferenceSession, addedParticipants: any): Promise<void>;
	    parseIdFromConferenceUpdatedEvent(participants: any, propertyToGet: string): List<string>;
	    parseTalkersFromConferenceUpdatedEvent(conference: ConferenceSession, talkersElmt: any): void;
	    parsSilentsFromConferenceUpdatedEvent(conference: ConferenceSession, silentsElmt: any): void;
	    parsePublishersFromConferenceUpdatedEvent(conference: ConferenceSession, xmlElementList: any, add: boolean): Promise<void>;
	    parseServicesFromConferenceUpdatedEvent(conference: ConferenceSession, xmlElementList: any, add: boolean): Promise<void>;
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
	    onConnectorCommandManagementMessageReceived(node: any): Promise<void>;
	    onConnectorCommandEndedMessageReceived(node: any): Promise<void>;
	    onConnectorConfigManagementMessageReceived(node: any): Promise<void>;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): Promise<void>;
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
	    private _presenceService;
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
	    init(useRestAtStartup: boolean): Promise<void>;
	    attachHandlers(): void;
	    _onReceipt(receipt: any): Promise<void>;
	    sortFunction(aa: any, bb: any): number;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     * Get a pstn conference <br>
	     */
	    getRoomConferences(conversation: any): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @instance
	     * @description
	     * Update a pstn conference <br>
	     */
	    updateRoomConferences(): void;
	    /*********************************************************/
	    /**                   MESSAGES STUFF                    **/
	    /*********************************************************/
	    /**
	     * @public
	     * @method ackAllMessages
	     * @instance
	     * @category MESSAGES
	     * @description
	     *    Mark all unread messages in the conversation as read. <br>
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
	     * @category MESSAGES
	     * @description
	     *    Retrieve the remote history of a specific conversation. <br>
	     * @param {Conversation} conversation Conversation to retrieve
	     * @param {number} size Maximum number of element to retrieve
	     * @async
	     * @return {Promise<Conversation[]>}
	     * @fulfil {Conversation[]} - Array of Conversation object
	     * @category async
	     */
	    getHistoryPage(conversation: Conversation, size?: number): Promise<any>;
	    /**
	     *
	     * @public
	     * @method getOneMessageFromConversationId
	     * @instance
	     * @category MESSAGES
	     * @description
	     *    To retrieve ONE message archived on server exchanged in a conversation based on the specified message Id and the timestamp <br>
	     * <br>
	     *    Time stamp is mandatory - the search is performed using it. <br>
	     *    Once results are returned, we look for a message with the message id specified. <br>
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
	     * @category MESSAGES
	     * @description
	     *    To retrieve messages exchanged by contacts in a conversation. The result is the messages without event type. <br>
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
	     * @category MESSAGES
	     * @description
	     *   Send an file sharing message <br>
	     */
	    sendFSMessage(conversation: any, file: any, data: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendExistingMessage
	     * @instance
	     * @category MESSAGES
	     * @description
	     *    Send a message to this conversation <br>
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
	     * @category MESSAGES
	     * @description
	     *   Send an existing file sharing message <br>
	     */
	    /**
	     * @private
	     * @method
	     * @instance
	     * @category MESSAGES
	     * @description
	     *    Send a instant message to a conversation <br>
	     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br>
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
	     * @category MESSAGES
	     * @instance
	     * @description
	     *    Send a corrected message to a conversation <br>
	     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br>
	     *    The new message has the property originalMessageReplaced which spot on original message // Warning this is a circular depend. <br>
	     *    The original message has the property replacedByMessage  which spot on the new message // Warning this is a circular depend. <br>
	     *    Note: only the last sent message on the conversation can be changed. The connected user must be the sender of the original message. <br>
	     * @param {Conversation} conversation
	     * @param {string} data The message string corrected
	     * @param {string} origMsgId The id of the original corrected message.
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @returns {Promise<string>} message the message new correction message sent. Throw an error if the send fails.
	     */
	    sendCorrectedChatMessage(conversation: Conversation, data: string, origMsgId: string, content?: {
	        message: string;
	        type: string;
	    }): Promise<any>;
	    /**
	     * @public
	     * @since 1.58
	     * @method deleteMessage
	     * @category MESSAGES
	     * @instance
	     * @async
	     * @description
	     *    Delete a message by sending an empty string in a correctedMessage <br>
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
	     * @category MESSAGES
	     * @instance
	     * @async
	     * @description
	     *   Delete all messages for the connected user on a one to one conversation. <br>
	     * @param {Conversation} conversation The conversation object
	     * @return {Message} - message object with updated replaceMsgs property
	     */
	    deleteAllMessageInOneToOneConversation(conversation: Conversation): Promise<unknown>;
	    /**
	     * @private
	     * @category MESSAGES
	     * @description
	     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
	     *      It allow to give back the status of the sending process. <br>
	     * @param conversation
	     * @param message
	     */
	    storePendingMessage(conversation: any, message: any): void;
	    /**
	     * @private
	     * @category MESSAGES
	     * @description
	     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
	     *      It allow to give back the status of the sending process. <br>
	     * @param message
	     */
	    removePendingMessage(message: any): void;
	    /**
	     * @public
	     * @method removeAllMessages
	     * @category MESSAGES
	     * @instance
	     * @description
	     *    Cleanup a conversation by removing all previous messages<br>
	     *    This method returns a promise <br>
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
	     * @category MESSAGES
	     * @instance
	     * @description
	     *    Remove a specific range of message in a conversation<br>
	     *    This method returns a promise <br>
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
	     * @method sendIsTypingState
	     * @category MESSAGES
	     * @instance
	     * @description
	     *    Switch the "is typing" state in a conversation<br>
	     * @param {Conversation} conversation The conversation recipient
	     * @param {boolean} status The status, true for setting "is Typing", false to remove it
	     * @return a promise with no success parameter
	     */
	    sendIsTypingState(conversation: Conversation, status: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllConversations
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Allow to get the list of existing conversations (p2p and bubbles) <br>
	     * @return {Conversation[]} An array of Conversation object
	     */
	    getAllConversations(): any[];
	    /**
	     * @private
	     * @method
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *      Get all conversation <br>
	     * @return {Conversation[]} The conversation list to retrieve
	     */
	    getConversations(): any[];
	    /**
	     * @public
	     * @method openConversationForContact
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Open a conversation to a contact <br>
	     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br>
	     *    This method returns a promise <br>
	     * @param {Contact} contact The contact involved in the conversation
	     * @return {Conversation} The conversation (created or retrieved) or null in case of error
	     */
	    openConversationForContact(contact: Contact): Promise<Conversation>;
	    /**
	     * @public
	     * @method openConversationForBubble
	     * @since 1.65
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Open a conversation to a bubble <br>
	     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br>
	     *    This method returns a promise <br>
	     * @param {Bubble} bubble The bubble involved in this conversation
	     * @return {Promise<Conversation>} The conversation (created or retrieved) or null in case of error
	     */
	    openConversationForBubble(bubble: Bubble): Promise<Conversation>;
	    /**
	     * @public
	     * @method getS2SServerConversation
	     * @since 1.65
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    get a conversation from id on S2S API Server.<br>
	     *    This method returns a promise <br>
	     * @param {string} conversationId The id of the conversation to find.
	     * @return {Conversation} The conversation (created or retrieved) or null in case of error
	     */
	    getS2SServerConversation(conversationId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteServerConversation
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Allow to delete a conversation on server (p2p and bubbles) <br>
	     * @param {string} conversationId of the conversation (id field)
	     * @return {Promise}
	     */
	    deleteServerConversation(conversationId: string): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Allow to mute notification in a conversations (p2p and bubbles) <br>
	     *    When a conversation is muted/unmuted, all user's resources will receive the notification <br>
	     * @param {string} conversationId ID of the conversation (dbId field)
	     * @param {Boolean} mute mutation state
	     * @return {Promise}
	     */
	    updateServerConversation(conversationId: any, mute: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendConversationByEmail
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Allow to get the specified conversation as mail attachment to the login email of the current user (p2p and bubbles) <br>
	     *    can be used to backup a conversation between a rainbow user and another one, or between a user and a room, <br>
	     *    The backup of the conversation is restricted to a number of days before now. By default the limit is 30 days. <br>
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
	     * @category CONVERSATIONS
	     * @instance
	     */
	    getOrCreateOneToOneConversation(conversationId: any, conversationDbId?: any, lastModification?: any, lastMessageText?: any, missedIMCounter?: any, muted?: any, creationDate?: any): Promise<Conversation>;
	    /**
	     * @public
	     * @method getConversationById
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *      Get a p2p conversation by id <br>
	     * @param {string} conversationId Conversation id of the conversation to clean
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationById(conversationId: string): any;
	    /**
	     * @public
	     * @method getConversationByDbId
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *      Get a conversation by db id <br>
	     * @param {string} dbId db id of the conversation to retrieve
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationByDbId(dbId: string): Conversation;
	    /**
	     * @public
	     * @method
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *      Get a bubble conversation by bubble id <br>
	     * @param {string} bubbleId Bubble id of the conversation to retrieve
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationByBubbleId(bubbleId: string): Promise<Conversation>;
	    /**
	     * @public
	     * @method
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *      Get a bubble conversation by bubble id <br>
	     * @param {string} bubbleJid Bubble jid of the conversation to retrieve
	     * @return {Conversation} The conversation to retrieve
	     */
	    getConversationByBubbleJid(bubbleJid: string): Conversation;
	    /**
	     * @public
	     * @method getBubbleConversation
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Get a conversation associated to a bubble (using the bubble ID to retrieve it) <br>
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
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Close a conversation <br>
	     *    This method returns a promise <br>
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
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Remove locally a conversation <br>
	     *    This method returns a promise <br>
	     * @param {Conversation} conversation The conversation to remove
	     */
	    removeConversation(conversation: Conversation): void;
	    /**
	     * @public
	     * @method cleanConversations
	     * @category CONVERSATIONS
	     * @instance
	     * @async
	     * @description
	     *    Allow to clean openned conversations. It keep openned the maxConversations last modified conversations. If maxConversations is not defined then keep the last 15 conversations. <br>
	     * @return {Promise<any>} the result of the deletion.
	     * @category async
	     */
	    cleanConversations(): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Allow to get the list of existing conversations from server (p2p and bubbles) <br>
	     * @return {Conversation[]} An array of Conversation object
	     */
	    getServerConversations(): Promise<unknown>;
	    /**
	     * @private
	     * @method
	     * @category CONVERSATIONS
	     * @instance
	     * @description
	     *    Allow to create a conversations on server (p2p and bubbles) <br>
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
	    init(useRestAtStartup: boolean): Promise<void>;
	    /**
	     * @public
	     * @method listConnectionsS2S
	     * @instance
	     * @category S2S Management
	     * @description
	     *      List all the connected user's connexions. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    listConnectionsS2S(): Promise<any>;
	    /**
	     * @public
	     * @method checkS2Sconnection
	     * @instance
	     * @category S2S Management
	     * @description
	     *      check the S2S connection with a head request. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    checkS2Sconnection(): Promise<any>;
	    /**
	     * @private
	     * @method deleteConnectionsS2S
	     * @instance
	     * @category S2S Management
	     * @param {Array} connexions a List of connections S2S to delete
	     * @description
	     *      Delete one by one a list of S2S connections of the connected user. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    deleteConnectionsS2S(connexions: any): Promise<any>;
	    /**
	     * @public
	     * @method deleteAllConnectionsS2S
	     * @instance
	     * @category S2S Management
	     * @description
	     *      Delete all the connected user's S2S connexions. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    deleteAllConnectionsS2S(): Promise<any>;
	    /**
	     * @private
	     * @method loginS2S
	     * @instance
	     * @category S2S Management
	     * @param {String} callback_url The web site which is the callback where the S2S events are sent by Rainbow server
	     * @description
	     *      Login to S2S event server the already connected user to REST API server. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    loginS2S(callback_url: any): Promise<any>;
	    /**
	     * @public
	     * @method infoS2S
	     * @instance
	     * @category S2S Management
	     * @param {String} s2sConnectionId The id of the S2S conneexion to retrieve informations about.
	     * @description
	     *      Get informations about a S2S connexions. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    infoS2S(s2sConnectionId: any): Promise<any>;
	    onS2SReady(event: any): Promise<void>;
	    /**
	     * @private
	     * @method sendS2SPresence
	     * @instance
	     * @category S2S Methods
	     * @param {Object} obj Object {show, status} describing the presence : <br>
	     *  To put presence to cases : <br>
	     * "online":     {show = undefined, status = "mode=auto"} <br>
	     * "away": {show = "xa", status = "away"} <br>
	     * "dnd": {show = "dnd", status = ""} <br>
	     * "invisible": {show = "xa", status = ""} <br>
	     * @description
	     *      set the presence of the connected user with s2s api . <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    sendS2SPresence(obj: any): Promise<any>;
	    /**
	     * @public
	     * @method sendMessageInConversation
	     * @instance
	     * @category S2S Methods
	     * @param {String} conversationId
	     * @param {String} msg The message object to send. <br>
	     * { <br>
	     *   "message": { <br>
	     *   "subject": "Greeting", <br>
	     *   "lang": "en", <br>
	     *   "contents": [ <br>
	     *     { <br>
	     *       "type": "text/markdown", <br>
	     *       "data": "## Hello Bob" <br>
	     *     } <br>
	     *   ], <br>
	     *   "body": "Hello world" <br>
	     *   } <br>
	     * } <br>
	     * @description
	     *      Send a message in a conversation. Note, corrected message is not yet supported. <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
	     */
	    sendMessageInConversation(conversationId: any, msg: any): Promise<any>;
	    /**
	     * @private
	     * @method joinRoom
	     * @param {String} bubbleId The id of the bubble to open the conversation.
	     * @param {string} role Enum: "member" "moderator" of your role in this room
	     * @category S2S Methods
	     * @instance
	     * @description
	     *      send presence in S2S to join a bubble conversation <br>
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - List of connexions or an error object depending on the result
	     
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
declare module 'lib/connection/XMPPServiceHandler/httpoverxmppEventHandler' {
	import { XMPPService } from 'lib/connection/XMPPService';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler';
	import { RESTService } from 'lib/connection/RESTService'; class HttpoverxmppEventHandler extends GenericHandler {
	    IQ_GET: any;
	    IQ_SET: any;
	    IQ_RESULT: any;
	    IQ_ERROR: any;
	    private _rest;
	    options: any;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, restService: RESTService, options: any);
	    onIqGetSetReceived(msg: any, stanza: any): void;
	    onIqResultReceived(msg: any, stanza: any): void;
	    _onIqGetSetReqReceived(stanza: any, node: any): Promise<number>;
	    _onIqRespResultReceived(stanza: any, node: any): Promise<void>;
	}
	export { HttpoverxmppEventHandler };

}
declare module 'lib/connection/XMPPService' {
	import { XMPPUTils } from 'lib/common/XMPPUtils';
	import { XmppClient } from 'lib/common/XmppQueue/XmppClient';
	import { AlertMessage } from 'lib/common/models/AlertMessage';
	import { GenericService } from 'lib/services/GenericService';
	import { HttpoverxmppEventHandler } from 'lib/connection/XMPPServiceHandler/httpoverxmppEventHandler'; const NameSpacesLabels: {
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
	    MonitoringNS: string;
	    XmppHttpNS: string;
	    protocolShimNS: string;
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
	    httpoverxmppEventHandler: HttpoverxmppEventHandler;
	    xmppUtils: XMPPUTils;
	    private shouldSendMessageToConnectedUser;
	    private storeMessages;
	    private copyMessage;
	    private enablesendurgentpushmessages;
	    private useMessageEditionAndDeletionV2;
	    private rateLimitPerHour;
	    private messagesDataStore;
	    private raiseLowLevelXmppInEvent;
	    private raiseLowLevelXmppOutReq;
	    private maxIdleTimer;
	    private maxPingAnswerTimer;
	    private company;
	    private xmppRessourceName;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_xmpp: any, _im: any, _application: any, _eventEmitter: any, _logger: any, _proxy: any, _rest: any, _options: any);
	    start(withXMPP: any): Promise<unknown>;
	    signin(account: any, headers: any): Promise<unknown>;
	    stop(forceStop: any): Promise<unknown>;
	    startOrResetIdleTimer(incomingStanza?: boolean): void;
	    stopIdleTimer(): void;
	    handleXMPPConnection(headers: any): Promise<void>;
	    setPresence(show: any, status: any): any;
	    subscribePresence(to: any): any;
	    enableCarbon(): Promise<unknown>;
	    disableCarbon(): Promise<unknown>;
	    sendChatMessage(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, urgency?: string): Promise<unknown>;
	    sendChatMessageToBubble(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, attention: any, urgency?: string): Promise<unknown>;
	    sendCorrectedChatMessage(conversation: any, originalMessage: any, data: any, origMsgId: any, lang: any, content?: any): Promise<string>;
	    markMessageAsRead(message: any, conversationType?: string, span?: number): Promise<unknown>;
	    markMessageAsReceived(message: any, conversationType: string, span?: number): Promise<unknown>;
	    sendChatExistingFSMessage(message: any, jid: any, lang: any, fileDescriptor: any): Promise<unknown>;
	    sendChatExistingFSMessageToBubble(message: any, jid: any, lang: any, fileDescriptor: any): Promise<unknown>;
	    sendIsTypingState(conversation: any, isTypingState: any): Promise<unknown>;
	    /****************************************************/
	    /**            XMPP ROSTER MANAGEMENT              **/
	    /****************************************************/
	    sendSubscription(contact: any): Promise<void>;
	    sendSubscribeInvitation(jid: any): Promise<unknown>;
	    sendInitialBubblePresence(jid: any): any;
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
	    discoverHTTPoverXMPP(to: any, headers?: {}): Promise<unknown>;
	    getHTTPoverXMPP(urlToGet: any, to: any, headers?: {}): Promise<unknown>;
	    traceHTTPoverXMPP(urlToGet: any, to: any, headers?: {}): Promise<unknown>;
	    headHTTPoverXMPP(urlToGet: any, to: any, headers?: {}): Promise<unknown>;
	    postHTTPoverXMPP(urlToGet: any, to: any, headers: {}, data: any): Promise<unknown>;
	    putHTTPoverXMPP(urlToGet: any, to: any, headers: {}, data: any): Promise<unknown>;
	    deleteHTTPoverXMPP(urlToGet: any, to: any, headers: {}, data: any): Promise<unknown>;
	    discover(): Promise<unknown>;
	}
	export { XMPPService, NameSpacesLabels };

}
declare module 'lib/services/ImsService' {
	/// <reference types="node" />
	export {};
	import { Logger } from 'lib/common/Logger';
	import { EventEmitter } from 'events';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService';
	import { Message } from 'lib/common/models/Message'; class ImsService extends GenericService {
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
	    init(enableCarbonBool: boolean, useRestAtStartup: boolean): Promise<void>;
	    /**
	     * @private
	     * @method enableCarbon
	     * @instance
	     * @description
	     *      Enable message carbon XEP-0280 <br>
	     * @async
	     * @category Ims MANAGEMENT
	     * @return {Promise}
	     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
	    
	     */
	    enableCarbon(): Promise<unknown>;
	    /**
	     * @private
	     * @method disableCarbon
	     * @instance
	     * @description
	     *      Disable message carbon XEP-0280 <br>
	     * @async
	     * @category Ims MANAGEMENT
	     * @return {Promise}
	     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
	    
	     */
	    disableCarbon(): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.39
	     * @method getMessagesFromConversation
	     * @instance
	     * @description
	     *    <b>(beta)</b> Retrieve the list of messages from a conversation <br>
	     *    Calling several times this method will load older message from the history (pagination) <br>
	     * @param {Conversation} conversation The conversation
	     * @param {Number} intNbMessage The number of messages to retrieve. Optional. Default value is 30. Maximum value is 100
	     * @async
	     * @category Ims MESSAGES
	     * @return {Promise<Conversation, ErrorManager>}
	     * @fulfil {Conversation, ErrorManager} Return the conversation updated with the list of messages requested or an error (reject) if there is no more messages to retrieve
	    
	     */
	    getMessagesFromConversation(conversation: any, intNbMessage: any): Promise<any>;
	    /**
	     * @public
	     * @since 1.39
	     * @method getMessageFromConversationById
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *    <b>(beta)</b> Retrieve a specific message in a conversation using its id <br>
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
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *    Retrieve a specific message in a bubble using its id <br>
	     * @param {Bubble} bubble The bubble where to search for the message
	     * @param {String} strMessageId The message id
	     * @return {Message} The message if found or null
	     */
	    getMessageFromBubbleById(bubble: any, strMessageId: any): Promise<any>;
	    /**
	     * @public
	     * @method markMessageAsRead
	     * @instance
	     * @description
	     *  Send a 'read' receipt to the recipient <br>
	     * @param {Message} messageReceived The message received to mark as read
	     * @async
	     * @category Ims MESSAGES
	     * @return {Promise}
	     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
	    
	     */
	    markMessageAsRead(messageReceived: any): Promise<unknown>;
	    /**
	     * @public
	     * @since 1.39
	     * @method sendMessageToConversation
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *    <b>(beta)</b> Send a instant message to a conversation<br>
	     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation <br>
	     * @param {Conversation} conversation The conversation recipient
	     * @param {String} message The message to send
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToConversation(conversation: any, message: any, lang: any, content: any, subject: any, urgency?: string): Promise<any>;
	    /**
	     * @public
	     * @method sendMessageToContact
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send a one-2-one message to a contact <br>
	     * @param {String} message The message to send
	     * @param {Contact} contact The contact (should have at least a jid_im property)
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToContact(message: any, contact: any, lang: any, content: any, subject: any, urgency?: string): Promise<any>;
	    /**
	     * @private
	     * @description
	     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
	     *      It allow to give back the status of the sending process. <br>
	     * @param conversation
	     * @param message
	     */
	    /**
	     * @private
	     * @description
	     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
	     *      It allow to give back the status of the sending process. <br>
	     * @param message
	     */
	    /**
	     * @public
	     * @method sendMessageToJid
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send a one-2-one message to a contact identified by his Jid <br>
	     * @param {String} message The message to send
	     * @param {String} jid The contact Jid
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToJid(message: any, jid: any, lang: any, content: any, subject: any, urgency?: string): Promise<any>;
	    /**
	     * @public
	     * @method sendMessageToJidAnswer
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send a reply to a one-2-one message to a contact identified by his Jid <br>
	     * @param {String} message The message to send
	     * @param {String} jid The contact Jid
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {String} [answeredMsg] The message answered
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToJidAnswer(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendMessageToJidAcknowledged
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send an Acknowledged reply to an urgent message (one to one, or bubble) <br>
	     * @param {Message} message The message to acknoledge
	     * @param {string} lang the lang used to acknowledged the message.
	     * @param {string} ackLabel the label used to acknowledged the message.
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} - the message
	     */
	    sendMessageToJidAcknowledged(message: Message, lang?: string, ackLabel?: string): Promise<void>;
	    /**
	     * @public
	     * @method sendMessageToJidIgnored
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send an Ignored reply to an urgent message (one to one, or bubble) <br>
	     * @param {Message} message The message to Ignored
	     * @param {string} lang the lang used to ignore the message.
	     * @param {string} ignLabel the label used to ignore the message.
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} - the message
	     */
	    sendMessageToJidIgnored(message: Message, lang?: string, ignLabel?: string): Promise<void>;
	    /**
	     * @public
	     * @method sendMessageToBubble
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send a message to a bubble <br>
	     * @param {String} message The message to send
	     * @param {Bubble} bubble The bubble (should at least have a jid property)
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToBubble(message: any, bubble: any, lang: any, content: any, subject: any, mentions: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendMessageToBubbleJid
	     * @instance
	     * @async
	     * @category Ims MESSAGES
	     * @description
	     *  Send a message to a bubble identified by its JID <br>
	     * @param {String} message The message to send
	     * @param {String} jid The bubble JID
	     * @param {String} [lang=en] The content language used
	     * @param {Object} [content] Allow to send alternative text base content
	     * @param {String} [content.type=text/markdown] The content message type
	     * @param {String} [content.message] The content message body
	     * @param {String} [subject] The message subject
	     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
	     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToBubbleJid(message: any, jid: any, lang: any, content: any, subject: any, mentions?: any, urgency?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method sendMessageToBubbleJidAnswer
	     * @async
	     * @category Ims MESSAGES
	     * @instance
	     * @description
	     *  Send a message to a bubble identified by its JID <br>
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
	     * @return {Promise<Message, ErrorManager>}
	     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

	     */
	    sendMessageToBubbleJidAnswer(message: any, jid: any, lang: any, content: any, subject: any, answeredMsg: any, mentions: any, urgency?: string): Promise<unknown>;
	    _onmessageReceipt(receipt: any): void;
	    /**
	     * @public
	     * @method sendIsTypingStateInBubble
	     * @async
	     * @category Ims TYPING
	     * @instance
	     * @description
	     *    Switch the "is typing" state in a bubble/room<br> <br>
	     * @param {Bubble} bubble The destination bubble
	     * @param {boolean} status The status, true for setting "is Typing", false to remove it
	     * @return {Object} Return a promise with no parameter when succeed.
	     */
	    sendIsTypingStateInBubble(bubble: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method sendIsTypingStateInConversation
	     * @instance
	     * @async
	     * @category Ims TYPING
	     * @description
	     *    Switch the "is typing" state in a conversation<br>
	     * @param {Conversation} conversation The conversation recipient
	     * @param {boolean} status The status, true for setting "is Typing", false to remove it
	     * @return Return a promise with no parameter when succeed
	     */
	    sendIsTypingStateInConversation(conversation: any, status: any): Promise<unknown>;
	}
	export { ImsService };

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
	    init(useRestAtStartup: boolean): Promise<void>;
	    attachHandlers(): void;
	    /**
	     * @public
	     * @method createChannel
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new public channel with a visibility limited to my company <br>
	     */
	    createChannel(name: string, channelTopic: string): Promise<Channel>;
	    /**
	     * @public
	     * @method createPublicChannel
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
	     * @param {string} [category=""] The category of the channel
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new public channel with a visibility limited to my company <br>
	     */
	    createPublicChannel(name: string, channelTopic: string, category: string): Promise<Channel>;
	    /**
	     * @public
	     * @method createClosedChannel (ex: createPrivateChannel)
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the createClosedChannel method instead,
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [description]  The description of the channel to create (max-length=255)
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new private channel <br>
	     */
	    createPrivateChannel(name: string, description: string): Promise<Channel>;
	    /**
	     * @public
	     * @method createClosedChannel (ex: createPrivateChannel)
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {string} name  The name of the channel to create (max-length=255)
	     * @param {string} [description]  The description of the channel to create (max-length=255)
	     * @param {string} [category=""] The category of the channel
	     * @return {Promise<Channel>} New Channel
	     * @description
	     *  Create a new closed channel <br>
	     */
	    createClosedChannel(name: string, description: string, category: string): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteChannel
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {Channel} channel  The channel to delete
	     * @return {Promise<Channel>} Promise object represents The channel deleted
	     * @description
	     *  Delete a owned channel <br>
	     */
	    deleteChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method findChannelsByName
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {string} name Search this provided substring in the channel name (case insensitive).
	     * @return {Promise<Array<Channel>>} ChannelsService found
	     * @description
	     *  Find channels by name. Only channels with visibility equals to 'company' can be found. First 100 results are returned. <br>
	     */
	    findChannelsByName(name: string): Promise<[Channel]>;
	    /**
	     * @public
	     * @method findChannelsByTopic
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {string} topic Search this provided substring in the channel topic (case insensitive).
	     * @return {Promise<Array<Channel>>} ChannelsService found
	     * @description
	     *  Find channels by topic. Only channels with visibility equals to 'company' can be found. First 100 results are returned. <br>
	     */
	    findChannelsByTopic(topic: string): Promise<[Channel]>;
	    /**
	     * @private
	     * @method findChannels
	     * @category Channels MANAGEMENT
	     */
	    private _findChannels;
	    /**
	     * @public
	     * @method getChannelById
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the fetchChannel method instead,
	     * @param {string} id The id of the channel)
	     * @param {boolean} [force=false] True to force a request to the server
	     * @return {Promise<Channel>} The channel found
	     * @description
	     * Find a channel by its id (locally if exists or by sending a request to Rainbow) <br>
	     */
	    getChannelById(id: string, force?: boolean): Promise<Channel>;
	    /**
	     * @public
	     * @method fetchChannel
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
	     * @param {string} id The id of the channel)
	     * @param {boolean} [force=false] True to force a request to the server
	     * @return {Promise<Channel>} The channel found
	     * @description
	     * Find a channel by its id (locally if exists or by sending a request to Rainbow) <br>
	     */
	    fetchChannel(id: string, force?: boolean): Promise<Channel>;
	    /**
	     * @public
	     * @method fetchChannelsByFilter
	     * @since 1.55
	     * @instance
	     * @category Channels MANAGEMENT
	     * @description
	     *    Find channels using a filter (on name, topic)<br>
	     *    Result may be filtered with result limit, offet and sortField or SortOrder <br>
	     *    Return a promise. <br>
	     * @param {Object} filter The filter with at least [filter.name] or [filter.topic] defined <br>
	     *      {string} [filter.name] search by channel names (case insensitive substring). <br>
	     *      {string} [filter.topic] search by channel topics (case insensitive substring). <br>
	     *      {Number} [filter.limit=100] allow to specify the number of channels to retrieve. <br>
	     *      {Number} [filter.offset] allow to specify the position of first channel to retrieve (first channel if not specified). Warning: if offset > total, no results are returned. <br>
	     *      {string} [filter.sortField="name"] sort channel list based on the given field. <br>
	     *      {Number} [filter.sortOrder="1"] specify order ascending/descending. 1 for ascending, -1 for descending. <br>
	     * @return {Promise<Channel[]>} Result of the find with <br>
	     *      {Array}   found channels informations with an array of { id, name, topic, creatorId, visibility, users_count } <br>
	     */
	    fetchChannelsByFilter(filter: any): Promise<[Channel]>;
	    /**
	     * @public
	     * @method getChannels
	     * @since 1.38
	     * @category Channels MANAGEMENT
	     * @instance
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the fetchMyChannels method instead,
	     * @description
	     *    Get the channels you own, are subscribed to, are publisher<br>
	     *    Return a promise. <br>
	     * @return {{Promise<Channel[]>} } Return Promise with a list of channels or an empty array if no channel has been found
	     */
	    getChannels(): Promise<[Channel]>;
	    /**
	     * @public
	     * @method fetchMyChannels
	     * @since 1.38
	     * @instance
	     * @category Channels MANAGEMENT
	     * @param {boolean} force Boolean to force the get of channels's informations from server.
	     * @description
	     *    Get the channels you own, are subscribed to, are publisher<br>
	     *    Return a promise. <br>
	     * @return {Promise<Channel[]>} Return Promise with a list of channels or an empty array if no channel has been found
	     */
	    fetchMyChannels(force?: boolean): Promise<[Channel]>;
	    /**
	     * @public
	     * @method getAllChannels
	     * @category Channels MANAGEMENT
	     * @instance
	     * @return {Channel[]} An array of channels (owned, invited, subscribed)
	     * @description
	     *  Return the list of channels (owned, invited, subscribed) <br>
	     */
	    getAllChannels(): [Channel];
	    /**
	     * @public
	     * @method getAllOwnedChannel
	     * @instance
	     * @category Channels MANAGEMENT
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the getAllOwnedChannels method instead,
	     * @return {Channel[]} An array of channels (owned only)
	     * @description
	     *  Return the list of owned channels only <br>
	     */
	    getAllOwnedChannel(): [Channel];
	    /**
	     * @public
	     * @method getAllOwnedChannels
	     * @category Channels MANAGEMENT
	     * @instance
	     * @return {Channel[]} An array of channels (owned only)
	     * @description
	     *  Return the list of owned channels only <br>
	     */
	    getAllOwnedChannels(): [Channel];
	    /**
	     * @public
	     * @method getAllPendingChannels
	     * @category Channels MANAGEMENT
	     * @instance
	     * @return {Channel[]} An array of channels (invited only)
	     * @description
	     *  Return the list of invited channels only <br>
	     */
	    getAllPendingChannels(): [Channel];
	    /**
	     * @public
	     * @method updateChannelTopic
	     * @instance
	     * @async
	     * @category Channels MANAGEMENT
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
	     * @category Channels MANAGEMENT
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
	     * @category Channels MANAGEMENT
	     * @description
	     *    Update a channel name<br>
	     *    Return a promise. <br>
	     * @param {Channel} channel The channel to update
	     * @param {string} channelName The name of the channel
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelName(channel: Channel, channelName: string): Promise<unknown>;
	    /**
	     * @public
	     * @method
	     * @since 1.38
	     * @category Channels MANAGEMENT
	     * @instance
	     * @description
	     *    Update a channel<br>
	     *      May be updated: name, topic, visibility, max_items and max_payload<br>
	     *      Please put null to not update a property.<br>
	     *    Return a promise. <br>
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
	     * @category Channels MANAGEMENT
	     * @instance
	     * @description
	     *    Update a channel visibility<br>
	     *    Return a promise. <br>
	     * @param {Channel} channel The channel to update
	     * @param {string} visibility  The new channel visibility (closed or company)
	     * @return {Promise<Channel>} Return the channel updated or an error
	     */
	    updateChannelVisibility(channel: Channel, visibility: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateChannelVisibilityToPublic
	     * @since 1.55
	     * @category Channels MANAGEMENT
	     * @instance
	     * @description
	     *    Set the channel visibility to company (visible for users in that company)<br>
	     *    Return a promise. <br>
	     * @param {Channel} channel The channel to update
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelVisibilityToPublic(channel: Channel): Promise<unknown>;
	    /**
	     * @public
	     * @method updateChannelVisibilityToClosed
	     * @since 1.55
	     * @instance
	     * @category Channels MANAGEMENT
	     * @description
	     *    Set the channel visibility to closed (not visible by users)<br>
	     *    Return a promise. <br>
	     * @param {Channel} channel The channel to update
	     * @return {Channel} Return the channel updated or an error
	     */
	    updateChannelVisibilityToClosed(channel: Channel): Promise<unknown>;
	    /**
	     * @public
	     * @method
	     * @since 1.43
	     * @instance
	     * @category Channels MANAGEMENT
	     * @description
	     *    Update a channel avatar<br>
	     *    Return a promise. <br>
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
	     * @category Channels MANAGEMENT
	     * @description
	     *    Delete a channel avatar<br>
	     *    Return a promise. <br>
	     * @param {Channel} channel The channel to update
	     * @return {Channel} Return the channel updated or an error
	     */
	    deleteChannelAvatar(channel: Channel): Promise<unknown>;
	    /**
	     * @private
	     * @param channelId
	     * @category Channels MANAGEMENT
	     * @description
	     *      GET A CHANNEL <br>
	     */
	    getChannel(channelId: string): Promise<Channel>;
	    /**
	     * @private
	     * @param channelId
	     * @category Channels MANAGEMENT
	     * @description
	     *      GET A CHANNEL FROM CACHE <br>
	     */
	    private getChannelFromCache;
	    private updateChannelsList;
	    private addOrUpdateChannelToCache;
	    private removeChannelFromCache;
	    /**
	     * @public
	     * @method publishMessageToChannel
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @param {Channel} channel The channel where to publish the message
	     * @param {string} message Message content
	     * @param {string} [title = "", limit=256] Message title
	     * @param {string} [url = ""] An URL
	     * @param {any} [imagesIds = null] An Array of ids of the files stored in Rainbow
	     * @param {string} [type="basic"] An optional message content type (could be basic, markdown, html or data)
	     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
	     * @description
	     *  Publish to a channel <br>
	     */
	    publishMessageToChannel(channel: Channel, message: string, title: string, url: string, imagesIds: any, type: string): Promise<{}>;
	    /**
	     * @public
	     * @method createItem
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @param {Channel} channel The channel where to publish the message
	     * @param {string} message Message content
	     * @param {string} [title = "", limit=256] Message title
	     * @param {string} [url = ""] An URL
	     * @param {any} imagesIds An Array of ids of the files stored in Rainbow
	     * @param {string} [type="basic"] An optional message content type (could be basic, markdown, html or data)
	     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
	     * @description
	     *  Publish to a channel <br>
	     */
	    createItem(channel: Channel, message: string, title: string, url: string, imagesIds: any, type: string): Promise<{}>;
	    /**
	     * @public
	     * @method getMessagesFromChannel
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the fetchChannelItems method instead,
	     * @param {Channel} channel The channel
	     * @return {Promise<Object[]>} The list of messages received
	     * @description
	     *  Retrieve the last messages from a channel <br>
	     */
	    getMessagesFromChannel(channel: Channel): Promise<any[]>;
	    /**
	     * @public
	     * @method fetchChannelItems
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @param {Channel} channel The channel
	     * @param {number} maxMessages=100 [optional] number of messages to get, 100 by default
	     * @param {Date} beforeDate [optional] - show items before a specific timestamp (ISO 8601 format)
	     * @param {Date} afterDate [optional] - show items after a specific timestamp (ISO 8601 format)
	     * @return {Promise<Object[]>} The list of messages received
	     * @description
	     *  Retrieve the last maxMessages messages from a channel <br>
	     */
	    fetchChannelItems(channel: Channel, maxMessages?: number, beforeDate?: Date, afterDate?: Date): Promise<Array<any>>;
	    /**
	     * @public
	     * @method deleteMessageFromChannel
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @deprecated [#1] since version 1.55 [#2]. <br>
	     * [#3] Will be deleted in future version <br>
	     * [#4] In case you need similar behavior use the deleteItemFromChannel method instead, <br>
	     * @param  {string} channelId The Id of the channel
	     * @param  {string} messageId The Id of the message
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Delete a message from a channel <br>
	     */
	    deleteMessageFromChannel(channelId: string, messageId: string): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteItemFromChannel
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @param  {string} channelId The Id of the channel
	     * @param  {string} itemId The Id of the item
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Delete a message from a channel <br>
	     */
	    deleteItemFromChannel(channelId: string, itemId: string): Promise<Channel>;
	    /**
	     * @public
	     * @method likeItem
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @param  {Channel} channel The channel where the item must be liked.
	     * @param  {string} itemId The Id of the item
	     * @param {Appreciation} appreciation Appreciation value - must be one of the value specified in Appreciation object.
	     * @return {Promise<any>}
	     * @description
	     *  To like an Channel Item with the specified appreciation <br>
	     */
	    likeItem(channel: Channel, itemId: string, appreciation: Appreciation): Promise<any>;
	    /**
	     * @public
	     * @method getDetailedAppreciations
	     * @instance
	     * @async
	     * @category Channels MESSAGES/ITEMS
	     * @param  {Channel} channel The channel where the item appreciations must be retrieved.
	     * @param  {string} itemId The Id of the item
	     * @return {Promise<any>}
	     * @description
	     *  To know in details apprecations given on a channel item (by userId the apprecation given) <br>
	     */
	    getDetailedAppreciations(channel: Channel, itemId: string): Promise<any>;
	    retrieveLatests(beforeDate?: Date): Promise<any>;
	    /**
	     * @public
	     * @method getAllSubscribedChannel
	     * @instance
	     * @category Channels SUBSCRIPTION
	     * @deprecated [#1] since version 1.55 [#2].
	     * [#3] Will be deleted in future version
	     * [#4] In case you need similar behavior use the getAllSubscribedChannels method instead,
	     * @return {Channel[]} An array of channels (subscribed only)
	     * @description
	     *  Return the list of subscribed channels only <br>
	     */
	    getAllSubscribedChannel(): [Channel];
	    /**
	     * @public
	     * @method getAllSubscribedChannels
	     * @instance
	     * @category Channels SUBSCRIPTION
	     * @return {Channel[]} An array of channels (subscribed only)
	     * @description
	     *  Return the list of subscribed channels only <br>
	     */
	    getAllSubscribedChannels(): [Channel];
	    /**
	     * @public
	     * @method subscribeToChannel
	     * @instance
	     * @async
	     * @category Channels SUBSCRIPTION
	     * @param {Channel} channel The channel to subscribe
	     * @return {Promise<Channel>} The channel updated with the new subscription
	     * @description
	     *  Subscribe to a public channel <br>
	     */
	    subscribeToChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method
	     * @since 1.47
	     * @instance
	     * @category Channels SUBSCRIPTION
	     * @description
	     *    Subscribe to a channel using its id<br>
	     *    Return a promise. <br>
	     * @param {string} id The id of the channel
	     * @return {Object} Nothing or an error object depending on the result
	     */
	    subscribeToChannelById(id: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unsubscribeFromChannel
	     * @instance
	     * @async
	     * @category Channels SUBSCRIPTION
	     * @param {Channel} channel The channel to unsubscribe
	     * @return {Promise<string>} The status of the unsubscribe.
	     * @description
	     *  Unsubscribe from a public channel <br>
	     */
	    unsubscribeFromChannel(channel: Channel): Promise<string>;
	    /**
	     * @public
	     * @method fetchChannelUsers
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @deprecated [#1] since version 1.55 [#2]. <br>
	     * [#3] Will be deleted in future version <br>
	     * [#4] In case you need similar behavior use the fetchChannelUsers method instead, <br>
	     * @param {Channel} channel The channel
	     * @param {Object} [options] A filter parameter
	     * @param {Number} [options.page = 0] Display a specific page of results
	     * @param {Number} [options.limit=100] Number of results per page (max 1000)
	     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
	     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
	     * @return {Promise<Array<any>>} An array of users who belong to this channel
	     * @description
	     *  Get a pagined list of users who belongs to a channel <br>
	     */
	    getUsersFromChannel(channel: Channel, options: any): Promise<{}[]>;
	    /**
	     * @public
	     * @method fetchChannelUsers
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @param {Channel} channel The channel
	     * @param {Object} [options] A filter parameter
	     * @param {Number} [options.page = 0] Display a specific page of results
	     * @param {Number} [options.limit=100] Number of results per page (max 1000)
	     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
	     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
	     * @return {Promise<Array<any>>} An array of users who belong to this channel
	     * @description
	     *  Get a pagined list of users who belongs to a channel <br>
	     */
	    fetchChannelUsers(channel: Channel, options: any): Promise<Array<{}>>;
	    /**
	     * @public
	     * @method removeAllUsersFromChannel
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @deprecated [#1] since version 1.55 [#2]. <br>
	     * [#3] Will be deleted in future version <br>
	     * [#4] In case you need similar behavior use the deleteAllUsersFromChannel method instead, <br>
	     * @param {Channel} channel The channel
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Remove all users from a channel <br>
	     */
	    removeAllUsersFromChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteAllUsersFromChannel
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @param {Channel} channel The channel
	     * @return {Promise<Channel>} The channel updated
	     * @description
	     *  Remove all users from a channel <br>
	     */
	    deleteAllUsersFromChannel(channel: Channel): Promise<Channel>;
	    /**
	     * @public
	     * @method updateChannelUsers
	     * @instance
	     * @async
	     * @category Channels USERS
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
	     * @category Channels USERS
	     * @param {Channel} channel The channel
	     * @param {Array<any>}owners
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Add a list of owners to the channel <br>
	     */
	    addOwnersToChannel(channel: Channel, owners: any[]): Promise<Channel>;
	    /**
	     * @public
	     * @method addPublishersToChannel
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} publishers The list of Contacts to add as publisher to channel.
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Add a list of publishers to the channel <br>
	     */
	    addPublishersToChannel(channel: Channel, publishers: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method addMembersToChannel
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} members array of users to add
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Add a list of members to the channel <br>
	     */
	    addMembersToChannel(channel: Channel, members: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method removeUsersFromChannel1
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @deprecated [#1] since version 1.55 [#2]. <br>
	     * [#3] Will be deleted in future version <br>
	     * [#4] In case you need similar behavior use the deleteUsersFromChannel method instead, <br>
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} users An array of users to remove
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Remove a list of users from a channel <br>
	     */
	    removeUsersFromChannel1(channel: Channel, users: Array<Contact>): Promise<Channel>;
	    /**
	     * @public
	     * @method deleteUsersFromChannel
	     * @instance
	     * @async
	     * @category Channels USERS
	     * @param {Channel} channel The channel
	     * @param {Array<Contact>} users An array of users to remove
	     * @return {Promise<Channel>} The updated channel
	     * @description
	     *  Remove a list of users from a channel <br>
	     */
	    deleteUsersFromChannel(channel: Channel, users: Array<Contact>): Promise<Channel>;
	    _onChannelMessageReceived(message: any): void;
	    _onChannelMyAppreciationReceived(my_appreciation: any): void;
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
	    /****************************************************************/
	    /*** END MANAGEMENT EVENT HANDLER                             ***/
	    /****************************************************************/
	    incrementInvitationCounter(): void;
	    decrementInvitationCounter(): void;
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
	import { XMPPUTils } from 'lib/common/XMPPUtils';
	import { Call } from 'lib/common/models/Call';
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler';
	export {}; class TelephonyEventHandler extends GenericHandler {
	    MESSAGE: any;
	    IQ_RESULT: any;
	    IQ_ERROR: any;
	    telephonyService: any;
	    contactService: any;
	    promiseQueue: any;
	    _profiles: any;
	    xmppUtils: XMPPUTils;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(xmppService: XMPPService, telephonyService: any, contactService: any, profileService: any);
	    onIqResultReceived(msg: any, stanza: any): void;
	    onIqGetPbxAgentStatusReceived(stanza: any, node: any): void;
	    onMessageReceived(msg: any, stanza: any): boolean;
	    onProposeMessageReceived(node: any, from: any): Promise<void>;
	    onRetractMessageReceived(node: any, from: any): Promise<void>;
	    onAcceptMessageReceived(node: any, from: any): Promise<void>;
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
	    /** VOICE MESSAGES
	     /*********************************************************************/
	    onVoiceMessagesEvent(eventElem: any): Promise<void>;
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
	import { GenericService } from 'lib/services/GenericService'; class TelephonyService extends GenericService {
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
	    init(useRestAtStartup: boolean): Promise<unknown>;
	    /**
	     * @private
	     * @method onTelPresenceChange
	     * @instance
	     * @description
	     *      Method called when receiving an update on user presence <br>
	     */
	    onTelPresenceChange(__event: any, attr?: any): boolean;
	    /**
	     * @private
	     * @method onCallUpdated
	     * @instance
	     * @description
	     *      Method called when receiving an update on a call <br>
	     */
	    onCallUpdated(callInfo: Call): void;
	    /**
	     * @public
	     * @method isTelephonyAvailable
	     * @category Telephony MANAGEMENT
	     * @instance
	     * @description
	     *    Check if the telephony service can be used or not (if the connected user has a phone monitored by a PBX) <br>
	     * @return {boolean} Return true if the telephony service is configured
	     */
	    isTelephonyAvailable(): boolean;
	    /**
	     * @public
	     * @method getAgentVersion
	     * @instance
	     * @category Telephony MANAGEMENT
	     * @description
	     *    Get the associated PBX agent version <br>
	     * @return {string} Return the version of the agent or "unknown"
	     */
	    getAgentVersion(): any;
	    /**
	     * @public
	     * @method getXMPPAgentStatus
	     * @instance
	     * @category Telephony MANAGEMENT
	     * @description
	     *    Get the status of the XMPP connection to the PBX Agent <br>
	     * @return {string} Return the status of the connections to the agent or "unknown"
	     */
	    getXMPPAgentStatus(): any;
	    /**
	     * @public
	     * @method getPhoneAPIStatus
	     * @instance
	     * @category Telephony MANAGEMENT
	     * @description
	     *    Get the status of the Phone API status for the PBX Agent <br>
	     * @return {string} Return the Phone API status for to this Agent or "unknown"
	     */
	    getPhoneAPIStatus(): any;
	    getAgentStatus(): Promise<unknown>;
	    /**
	     * @private
	     * @method getTelephonyState
	     * @instance
	     * @category Telephony MANAGEMENT
	     * @param second
	     */
	    getTelephonyState(second: any): Promise<unknown>;
	    /**
	     *
	     /**
	     * @public
	     * @method getMediaPillarInfo
	     * @instance
	     * @category Telephony MANAGEMENT
	     * @description
	     *   This API allows user to retrieve the Jabber id of the Media Pillar linked to the system he belongs, or Media Pillar user to retrieve the Jabber id credentials and data of the Media Pillar he belongs. <br>
	     * @async
	     * @return {Promise<any>}
	     * @category async
	     */
	    getMediaPillarInfo(): Promise<any>;
	    /**
	     * @private
	     * @category Telephony CALL
	     * @instance
	     * @param connectionElemObj
	     */
	    private createCallFromConnectionElem;
	    /**
	     * @private
	     * @category Telephony CALL
	     * @instance
	     * @method getParticipantsFromParticipantsElem
	     * @param participants
	     */
	    getParticipantsFromParticipantsElem(participants: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getVoiceMessageCounter
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      Get the number of voice message <br>
	     * @return {Promise<integer>} Return resolved promise if succeed with the number of messages, and a rejected else.
	     */
	    getVoiceMessageCounter(): Promise<unknown>;
	    /*********************************************************/
	    /**                   CALL HANDLERS                     **/
	    /*********************************************************/
	    /**
	     * @public
	     * @method getCallToHangOut
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      Get the call which can be hang out <br>
	     * @return {Call} The call with the ability to be hang out.
	     */
	    getCallToHangOut(): any;
	    /**
	     * @public
	     * @method getActiveCall
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      get the active call <br>
	     * @return {Call} The active call
	     */
	    getActiveCall(): any;
	    /**
	     * @public
	     * @method getActiveCalls
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      get active calls <br>
	     * @return {Call} The active call
	     */
	    getActiveCalls(): any[];
	    /**
	     * @public
	     * @method getCalls
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      get calls <br>
	     * @return {Call} The calls
	     */
	    getCalls(): any[];
	    /**
	     * @public
	     * @method getCallsSize
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      get calls tab size. Warning do not use length on the getCalls method result because it is the last index id +1 <br>
	     * @return {Call} The calls tab size
	     */
	    getCallsSize(): number;
	    /**
	     * @private
	     * @category Telephony CALL
	     * @instance
	     * @param {Array} tab The tab which need to be sized
	     */
	    getTabSize(tab: any): number;
	    /**
	     * @public
	     * @method getActiveCall
	     * @param {Contact} contact The contact with an active call with us.
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      get the active call for a contact <br>
	     * @return {Call} The active call
	     */
	    getActiveCallsForContact(contact: any): any[];
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method makeCall
	     * @instance
	     * @async
	     * @category Telephony CALL
	     * @description
	     *    Call a number <br>
	     *    Contacts and numbers are allowed <br>
	     *    Return a promise <br>
	     * @param {Contact} contact - contact object that you want to call
	     * @param {String} phoneNumber The number to call
	     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     * @return {Promise<Call>} Return a promise with the call created
	     */
	    makeCall(contact: any, phoneNumber: any, correlatorData: any): Promise<any>;
	    /**
	     * @private
	     * @method makeSimpleCall
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @param contact
	     * @param phoneNumber
	     * @param correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     */
	    private makeSimpleCall;
	    /**
	     * @private
	     * @method makeConsultationCall
	     * @category Telephony CALL
	     * @instance
	     * @param contact
	     * @param phoneNumber
	     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     * @param callId
	     */
	    private makeConsultationCall;
	    /**
	     * @public
	     * @method makeCall
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Call a number <br>
	     *    Return a promise <br>
	     * @param {String} phoneNumber The number to call
	     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
	     * @return {Promise<Call>} Return a promise with the call created
	     */
	    makeCallByPhoneNumber(phoneNumber: any, correlatorData: any): Promise<unknown>;
	    /**
	     * @private
	     * @method getPhoneInfo
	     * @category Telephony CALL
	     * @instance
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
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Release a call <br>
	     *    Return a promise <br>
	     * @param {Call} call The call to release
	     * @return {Promise<Call>} Return a promise with the call released
	     */
	    releaseCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method answerCall
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Answer a call <br>
	     *    Return a promise <br>
	     * @param {Call} call The call to answer
	     * @return {Promise<Call>} Return a promise with the answered call.
	     */
	    answerCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method holdCall
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Hold a call <br>
	     *    Return a promise <br>
	     * @param {Call} call The call to hold
	     * @return {Call} Return a promise with the held call.
	     */
	    holdCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method retrieveCall
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Retrieve a call <br>
	     *    Return a promise <br>
	     * @param {Call} call The call to retrieve
	     * @return {Promise<Call>} Return a promise with the call retrieved
	     */
	    retrieveCall(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method deflectCallToVM
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Deflect a call to the voice mail <br>
	     *    Return a promise <br>
	     * @param {Call} call The call to deflect
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    deflectCallToVM(call: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method deflectCall
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Deflect a call to an other telephone number<br>
	     *    Return a promise <br>
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
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Transfer a held call to the active call <br>
	     *    User should have transfer rights <br>
	     *    Return a promise <br>
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
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Create a conference with a held call and the active call <br>
	     *    User should have conference rights <br>
	     *    Return a promise <br>
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
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Activate the forward to a number <br>
	     *    Return a promise <br>
	     * @param {String} phoneNumber The number to call
	     * @return {Promise} Return a promise resolved.
	    */
	    forwardToDevice(phoneNumber: any): Promise<unknown>;
	    /**
	     * @public
	     * @method forwardToVoicemail
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Activate the forward to VM <br>
	     *    Return a promise <br>
	     * @return {Promise} Return a promise resolved.
	     */
	    forwardToVoicemail(): Promise<unknown>;
	    /**
	     * @public
	     * @method cancelForward
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *    Cancel the forward <br>
	     *    Return a promise <br>
	     * @return {Promise<Call>} Return a promise with the canceled forward call.
	     */
	    cancelForward(): Promise<unknown>;
	    getForwardStatus(): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    /**
	     * @public
	     * @method sendDtmf
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @description
	     *      send dtmf to the remote party <br>
	     * @param {string} connectionId
	     * @param {string} dtmf
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    sendDtmf(connectionId: any, dtmf: any): Promise<unknown>;
	    /**
	     * @private
	     * @method clearCall
	     * @category Telephony CALL
	     * @instance
	     * @param Call call the call to reset.
	     * @return nothing.
	     */
	    private clearCall;
	    private startAsPhoneNumber;
	    /**
	     * @private
	     * @method getOrCreateCall
	     * @category Telephony CALL
	     * @instance
	     * @param status
	     * @param connectionId
	     * @param deviceType
	     * @param contact
	     */
	    getOrCreateCall(status: any, connectionId: any, deviceType: any, contact?: any): Call;
	    /**
	     * @private
	     * @category Telephony CALL
	     * @instance
	     * @param callId
	     * @description
	     *      GET A CALL FROM CACHE <br>
	     */
	    private getCallFromCache;
	    addOrUpdateCallToCache(call: any): Call;
	    private removeCallFromCache;
	    /**
	     * @public
	     * @method logon
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @param {String} endpointTel The endpoint device phone number.
	     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
	     * @param {String} password optionnel Password or authorization code.
	     * @param {String} groupId optionnel CCD Agent's group number
	     * @description
	     *      This api allows an CCD Agent to logon into the CCD system. <br>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    logon(endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method logoff
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @param {String} endpointTel The endpoint device phone number.
	     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
	     * @param {String} password optionnel Password or authorization code.
	     * @param {String} groupId optionnel CCD Agent's group number
	     * @description
	     *      This api allows an CCD Agent logoff logon from the CCD system. <br>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    logoff(endpointTel: any, agentId: any, password: any, groupId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method withdrawal
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
	     * @param {String} groupId optionnel CCD Agent's group number
	     * @param {String} status optionnel Used to deactivate the withdrawal state. Values: 'on', 'off'; 'on' is optional.
	     * @description
	     *      This api allows an CCD Agent to change to the state 'Not Ready' on the CCD system. When the parameter 'status' is passed and has the value 'off', the state is changed to 'Ready' <br>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    withdrawal(agentId: any, groupId: any, status: any): Promise<unknown>;
	    /**
	     * @public
	     * @method wrapup
	     * @async
	     * @category Telephony CALL
	     * @instance
	     * @param {String} agentId CCD Agent identifier (agent device number).
	     * @param {String} groupId CCD Agent's group number
	     * @param {String} password optionnel Password or authorization code.
	     * @param {String} status optionnel Used to deactivate the WrapUp state. Values: 'on', 'off'; 'on' is optional.
	     * @description
	     *      This api allows an CCD Agent to change to the state Working After Call in the CCD system. When the parameter 'status' is passed and has the value 'off', the state is changed to 'Ready'. <br>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    wrapup(agentId: any, groupId: any, password: any, status: any): Promise<unknown>;
	    /*************************************************************/
	    /*************************************************************/
	    nomadicLogin(phoneNumber: any, NotTakeIntoAccount?: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getNomadicStatus
	     * @async
	     * @category Telephony NOMADIC
	     * @instance
	     * @description
	     *      This api allows to get the nomadic status. <br>
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    getNomadicStatus(): Promise<unknown>;
	    /**
	     * @private
	      * @param response
	     */
	    updateNomadicData(response: any): Promise<void>;
	    getNomadicObject(): any;
	    getNomadicDestination(): any;
	    /**
	     * @public
	     * @method deleteAllMyVoiceMessagesFromPbx
	     * @async
	     * @category Telephony Voice Messages
	     * @instance
	     * @description
	     *      This api allows to Delete all user's present (read and unread) voice messages from the Pbx. <br>
	     *      This command is to be used to remove all read and unread messages for one user, on the pbx side, it has no effect on the file storage side. <br>
	     *      Do not use this API command to delete the voice messages file from the file storage. <br>
	     *
	     *  return :
	     *
	     *  | Champ | Type | Description |
	     *  | --- | --- | --- |
	     *  | status | String |     |
	     *
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    deleteAllMyVoiceMessagesFromPbx(): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAVoiceMessageFromPbx
	     * @async
	     * @category Telephony Voice Messages
	     * @instance
	     * @param {string} messageId The message Id
	     * @description
	     *      This api allows to Delete a voice message from the Pbx, using it's unique identifier (messageId), which is the one given in the messages list. <br>
	     *      This command is to be used to remove the message on the pbx side; it has no effect on the file storage side. <br>
	     *      Do not use this API command to delete the voice message file from the file storage. <br>
	     *
	     *  return :
	     *
	     *  | Champ | Type | Description |
	     *  | --- | --- | --- |
	     *  | status | String |     |
	     *
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    deleteAVoiceMessageFromPbx(messageId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAVoiceMessageFromPbx
	     * @async
	     * @category Telephony Voice Messages
	     * @instance
	     * @param {string} messageId The message Id
	     * @param {string} messageDate The date in ISO 8601 format, used form : YYYY-MM-DDTHH:MM:SSTZ
	     * @param {string} messageFrom The message sender phone number (can an external number in E164 form or an internal short).
	     * @description
	     *      This api allows to Get a voice message from the Pbx, using it's unique identifier (messageId), which is the one given in the messages list. <br>
	     *      But, in order to build a proper file name, we also need the message's creation date (ISO 8601) and the distant user's phone number. <br>
	     *      Initialy all voice messages are stored in the pbx, therefore they have to be transfered to Rainbow server before being given to the asking client. <br>
	     *      The positive acknowledged of this request only signifies that the pbx has accepted the download request. The client will be informed further once the message is available on file storage server. In the case the file transfer should fail, the client will also be informed.. <br>
	     *
	     *  parameters: <br>
	     *   * messageDate : mandatory, date in ISO 8601 format, used form : YYYY-MM-DDTHH:MM:SSTZ. <br>
	     *   * messageFrom : the message sender phone number (can an external number in E164 form or an internal short). <br>
	     *
	     *  return :
	     *
	     *  | Champ | Type | Description |
	     *  | --- | --- | --- |
	     *  | status | String |     |
	     *  | resultCode | String | Pbx result code |
	     *
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    getAVoiceMessageFromPbx(messageId: string, messageDate: string, messageFrom: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getDetailedListOfVoiceMessages
	     * @async
	     * @category Telephony Voice Messages
	     * @instance
	     * @description
	     *      This api allows to Get the detailed list of all available voice messages. <br>
	     *      For a user, which has a voice mail box, it is possible to get the detailed list of it's messages. <br>
	     *      A voice message can be : <br>
	     *   * a message recorded by a calling party which couldn't reach the user, <br>
	     *   * a conversation recorded by the user itself. <br>
	     *
	     *  return :
	     *
	     *  | Champ | Type | Description |
	     *  | --- | --- | --- |
	     *  | status | String |     |
	     *  | data | Object |     |
	     *  | voicemessages | Object |     |
	     *  | voiceMessageList | Object\[\] | Table of message descriptor. |
	     *  | id  | String | Message unique id. |
	     *  | unread | String | Message state, false for already read, true elsewhere. |
	     *  | length | String | Message length is seconds. |
	     *  | date | Date-Time | Message date in ISO 8601 (usual form : YYYY-MM-DDTHH:MM:SSTZ). |
	     *  | from | String | Message sender's number. |
	     *  | jid | String | Message sender's jid. |
	     *  | callable | String | Message sender can be called back or not. |
	     *  | identity | Object | Message sender names. |
	     *  | displayName | String | Message sender's display name. |
	     *  | firstName | String | Message sender's first name. |
	     *  | lastName | String | Message sender's last name. |
	     *
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    getDetailedListOfVoiceMessages(): Promise<unknown>;
	    /**
	     * @public
	     * @method getNumbersOfVoiceMessages
	     * @async
	     * @category Telephony Voice Messages
	     * @instance
	     * @description
	     *      This api allows to Get voice messages counters, total and unlistened. <br>
	     *      For a user, which has a voice mail box, it is possible to get the number of not yet listened message (aka unread messages). <br>
	     *      When possible the total number of messages is also given. <br>
	     *      Some VoiceMail units only gives if the users has or not one or more messages in his box, the number of them is unknown. <br>
	     *
	     *
	     *  return :
	     *
	     *  | Champ | Type | Description |
	     *  | --- | --- | --- |
	     *  | status | String |     |
	     *  | data | Object |     |
	     *  | voicemessages | Object |     |
	     *  | unread | Number | Number of unlistened messages |
	     *  | total | Number | Total number of voice messages |
	     *  | present optionnel | Boolean | Pbx doesn't know how much messages a user has, only that one or more are present |
	     *
	     * @return {Promise} Return resolved promise if succeed, and a rejected else.
	     */
	    getNumbersOfVoiceMessages(): Promise<unknown>;
	}
	export { TelephonyService as TelephonyService };

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
	} class AdminService extends GenericService {
	    private _contacts;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: any): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(useRestAtStartup: boolean): Promise<void>;
	    /**
	     * @public
	     * @method createCompany
	     * @instance
	     * @description
	     *      Create a company <br>
	     * @param {string} strName The name of the new company
	     * @param {string} country Company country (ISO 3166-1 alpha3 format, size 3 car)
	     * @param {string} state (optionnal if not USA)  define a state when country is 'USA' (["ALASKA", "....", "NEW_YORK", "....", "WYOMING"] ), else it is not managed by server. Default value on server side: ALABAMA
	     * @param {OFFERTYPES} offerType Company offer type. Companies with offerType=freemium are not able to subscribe to paid offers, they must be premium to do so. Companies created with privateDC="HDS" are automatically created with offerType=premium (as a paid subscription to HDS Company offer is automatically done during the company creation. Values can be : freemium, premium
	     * @async
	     * @category Companies and users management
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
	     *      Create a new user in a given company <br>
	     * @param {string} email The email of the user to create
	     * @param {string} password The associated password
	     * @param {string} firstname The user firstname
	     * @param {string} lastname  The user lastname
	     * @param {string} [companyId="user company"] The Id of the company where to create the user or the connected user company if null
	     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
	     * @param {boolean} [isCompanyAdmin=false] True to create the user with the right to manage the company (`companyAdmin`). False by default.
	     * @param {Array<string>} [roles] The roles the created user.
	     * @async
	     * @category Companies and users management
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
	     *      Create a new guest user in the same company as the requester admin <br>
	     * @param {string} firstname The user firstname
	     * @param {string} lastname  The user lastname
	     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
	     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
	     * @async
	     * @category Companies and users management
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
	     *      Create a new anonymous guest user in the same company as the requester admin   <br>
	     *      Anonymous guest user is user without name and firstname   <br>
	     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
	     * @async
	     * @category Companies and users management
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
	     *      Invite a new user to join a company in Rainbow <br>
	     * @param {string} email The email address of the contact to invite
	     * @param {string} companyId     The id of the company where the user will be invited in
	     * @param {string} [language="en-US"]  The language of the message to send. Default is `en-US`
	     * @param {string} [message=""] A custom message to send
	     * @async
	     * @category Companies and users management
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
	     *      Change a password for a user <br>
	     * @param {string} password The new password
	     * @param {string} userId The id of the user
	     * @async
	     * @category Companies and users management
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
	     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` <br>
	     * @param {Object} objData An object (key: value) containing the data to change with their new value
	     * @param {string} userId The id of the user
	     * @async
	     * @category Companies and users management
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
	     *      Delete an existing user <br>
	     * @param {string} userId The id of the user
	     * @async
	     * @category Companies and users management
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Deleted user or an error object depending on the result
	     * @category async
	     */
	    deleteUser(userId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllCompanies
	     * @param {string} format Allows to retrieve more or less company details in response. <br>
	     * - small: _id, name <br>
	     * - medium: id, name, status, adminEmail, companyContactId, country, website, slogan, description, size, economicActivityClassification, lastAvatarUpdateDate, lastBannerUpdateDate, avatarShape, visibility <br>
	     * - full for superadmin, support, business_admin, bp_admin and bp_finance: All fields <br>
	     * - full for admin: All fields except BP fields (bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpIsContractAccepted, bpContractAcceptationInfo) <br>
	     *  <br>
	     * Default value : small <br>
	     * Possible values : small, medium, full <br>
	     * @param {string} sortField Sort items list based on the given field. Default value : name
	     * @param {string} bpId Allows to filter companies list on bpId field. <br>
	     * This filter allow to get all the End Customer companies associated to a given Business Partner company. <br>
	     * <br>
	     *  Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. <br>
	     *  Users with role bp_admin or bp_finance can use this filter on their own company.
	     * @param {string} catalogId Allows to filter companies list on catalogId field. <br>
	     *     This filter allow to get all the companies linked to a given catalogId. <br>
	     *         <br>
	     *             Only users with role superadmin, support or business_admin can use this filter.
	     * @param {string} offerId Allows to filter companies list on companies having subscribed to the provided offerId.
	     * @param {boolean} offerCanBeSold Allows to filter companies list on companies having subscribed to offers with canBeSold=true. <br>
	     *     This filter can only be used with the value true (false is not relevant, as all companies have a subscription to Essential which has canBeSold=false, so all companies would match offerCanBeSold=false).
	     * @param {string} externalReference Allows to filter companies list on externalReference field. <br>
	     *     The search is done on externalReference starting with the input characters, case sensitive (ex: ABC will match companies with externalReference ABC, ABCD, ABC12... ; but externalReference abc, AABC, 1ABC, ... will not match). <br>
	     *          <br>
	     *     Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
	     * @param {string} externalReference2 Allows to filter companies list on externalReference2 field. <br>
	     *     The search is done on externalReference2 starting with the input characters, case sensitive (ex: ABC will match companies with externalReference2 ABC, ABCD, ABC12... ; but externalReference2 abc, AABC, 1ABC, ... will not match). <br>
	     *         <br>
	     *     Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
	     * @param {string} salesforceAccountId Allows to filter companies list on salesforceAccountId field. <br>
	     * The search is done on the whole salesforceAccountId, case sensitive (no partial search). <br>
	     *  <br>
	     * Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
	     * @param {string} selectedAppCustomisationTemplate Allows to filter companies list on application customisation template applied for the company. <br>
	     *     This filter allows to get a list of companies for which we have applied the same application customisation template. <br>
	     *         <br>
	     *     Only users with role superadmin, support, bp_admin, admin can use this filter.
	     * @param {boolean} selectedThemeObj Allows to return selectedTheme attribute as an object: <br>
	     * - true returns selectedTheme as an object (e.g. { "light": "60104754c8fada2ad4be3e48", "dark": "5ea304e4359c0e6815fc8b57" }), <br>
	     * - false return selectedTheme as a string.
	     * @param {string} offerGroupName Allows to filter companies list on companies having subscribed to offers with provided groupName(s). <br>
	     *    Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. <br>
	     *    groupName can be retrieved from API GET /api/rainbow/subscription/v1.0/companies/:companyId/offers <br>
	     *    The search is done on the whole groupName(s), case sensitive (no partial search). <br>
	     *    Several groupName can be provided, seperated by a space.
	     * @param {number} limit Allow to specify the number of items to retrieve. <br>
	     *     Default value : 100
	     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). <br>
	     *     Warning: if offset > total, no results are returned.
	     * @param {number} sortOrder Specify order when sorting items list. <br>
	     *     Default value : 1 <br>
	     *     Possible values : -1, 1
	     * @param {string} name Allows to filter companies list on the given keyword(s) on field name. <br>
	     *      <br>
	     *     The filtering is case insensitive and on partial name match: all companies containing the provided name value will be returned (whatever the position of the match). <br>
	     *     Ex: if filtering is done on comp, companies with the following names are match the filter 'My company', 'Company', 'A comp 1', 'Comp of comps', ...
	     * @param {string} status Allows to filter companies list on the provided status(es) <br>
	     *      <br>
	     *      Possible values : initializing, active, alerting, hold, terminated
	     * @param {string} visibility Allows to filter companies list on the provided visibility(ies) <br>
	     *      <br>
	     *      Possible values : public, private, organization, closed, isolated
	     * @param {string} organisationId Allows to filter companies list on the organisationIds provided in this option. <br>
	     *      <br>
	     *      This filter can only be used if user has role(s) superadmin, support, bp_admin or admin
	     * @param {boolean} isBP Allows to filter companies list on isBP field: <br>
	     *      <br>
	     *      true returns only Business Partner companies, <br>
	     *      false return only companies which are not Business Partner. <br>
	     *      <br>
	     *      This filter can only be used if user has role(s) superadmin, business_admin, support, bp_admin or admin.
	     * @param {boolean} hasBP Allows to filter companies list on companies being linked or not to a BP: <br>
	     *      <br>
	     *      true returns only companies linked to a BP (BP IR companies are also returned), <br>
	     *      false return only companies which are not linked to a BP.
	     *      <br>
	     *      This filter can only be used if user has role(s) superadmin, business_admin, support or bp_admin. <br>
	     *      <br>
	     *      Users with role bp_admin can only use this filter with value false.
	     * @param {string} bpType Allows to filter companies list on bpType field. <br>
	     *      <br>
	     *      This filter allow to get all the Business Partner companies from a given bpType. <br>
	     *      <br>
	     *      Only users with role superadmin, business_admin, support or bp_admin can use this filter.
	     * @instance
	     * @description
	     *      Get all companies for a given admin following request filters.<br>
	     * @async
	     * @category Companies and users management
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Json object containing with all companies (companyId and companyName) or an error object depending on the result
	     * @category async
	     */
	    getAllCompanies(format?: string, sortField?: string, bpId?: string, catalogId?: string, offerId?: string, offerCanBeSold?: boolean, externalReference?: string, externalReference2?: string, salesforceAccountId?: string, selectedAppCustomisationTemplate?: string, selectedThemeObj?: boolean, offerGroupName?: string, limit?: number, offset?: number, sortOrder?: number, name?: string, status?: string, visibility?: string, organisationId?: string, isBP?: boolean, hasBP?: boolean, bpType?: string): Promise<unknown>;
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
	     * @method getAllUsers
	     * @instance
	     * @description
	     *      Get all users for a given admin <br>
	     * @async
	     * @category Companies and users management
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
	     * @method getAllUsersByFilter
	     * @instance
	     * @category Companies and users management
	     * @description
	     *  Get a list of users by filters <br>
	     * @async
	     * @return {Promise<any, ErrorManager>}
	     * @fulfil {any} - Found users or null or an error object depending on the result
	     * @param {string} searchEmail Allows to filter users list on the loginEmail field using the word provided in this option.
	     * @param {string} companyId Allows to filter users list on the companyIds provided in this option.
	     * @param {string} roles Allows to filter users list on the role(s) provided in this option. Default value is "user".
	     * @param {string} excludeRoles Allows to exclude users having the role(s) provided in this option.
	     * @param {string} tags Allows to filter users list on the tag(s) provided in this option.
	     * @param {string} departments Allows to filter users list on the department(s) provided in this option.
	     * @param {string} isTerminated Allows to filter users list on the status 'isTerminated'. Default value is "false"
	     * @param {string} isActivated Allows to filter users list for users which have logged in at least once ("true") or never ("false").
	     * @param {string} fileSharingCustomisation Allows to filter users list on fileSharing feature restriction (enabled, disabled, same_than_company)
	     * @param {string} userTitleNameCustomisation Allows to filter users list on user's profile update restriction (enabled, disabled, same_than_company)
	     * @param {string} softphoneOnlyCustomisation Allows to filter users list on use softphone part of the UCaas application restriction (enabled, disabled, same_than_company)
	     * @param {string} useRoomCustomisation Allows to filter users list on use room (bubble) restriction (enabled, disabled, same_than_company)
	     * @param {string} phoneMeetingCustomisation Allows to filter users list on can join a PSTN conference restriction (enabled, disabled, same_than_company)
	     * @param {string} useChannelCustomisation Allows to filter users list on use channels restriction (enabled, disabled, same_than_company)
	     * @param {string} useScreenSharingCustomisation Allows to filter users list on sharing screen restriction (enabled, disabled, same_than_company)
	     * @param {string} useWebRTCVideoCustomisation Allows to filter users list on use screen sharing restriction (enabled, disabled, same_than_company)
	     * @param {string} useWebRTCAudioCustomisation Allows to filter users list on use Web RTC audio restriction (enabled, disabled, same_than_company)
	     * @param {string} instantMessagesCustomisation Allows to filter users list on use Instant Messages restriction (enabled, disabled, same_than_company)
	     * @param {string} userProfileCustomisation Allows to filter users list on modify a profile restriction (enabled, disabled, same_than_company)
	     * @param {string} fileStorageCustomisation Allows to filter users list on use Rainbow file storage restriction (enabled, disabled, same_than_company)
	     * @param {string} overridePresenceCustomisation Allows to filter users by the ability to modify manually presence state (enabled, disabled, same_than_company)
	     * @param {string} alert notification] Allows to filter users by the ability to receive alert notification(enabled, disabled, same_than_company)
	     * @param {string} changeTelephonyCustomisation Allows to filter users by the ability to modify telephony settings (enabled, disabled, same_than_company)
	     * @param {string} changeSettingsCustomisation Allows to filter users by the ability to change client general setting (enabled, disabled, same_than_company)
	     * @param {string} recordingConversationCustomisation Allows to filter users by the ability to record conversation (enabled, disabled, same_than_company)
	     * @param {string} useGifCustomisation Allows to filter users by the ability to use GIFs in conversations (enabled, disabled, same_than_company)
	     * @param {string} useDialOutCustomisation Allows to filter users by the ability to be called by the Rainbow conference bridge. (enabled, disabled, same_than_company)
	     * @param {string} fileCopyCustomisation Allows to filter users by the ability to copy any file he receives in his personal cloud space.
	     * @param {string} fileTransferCustomisation Allows to filter users by the ability to copy a file from a conversation then share it inside another conversation.
	     * @param {string} forbidFileOwnerChangeCustomisation Allows to filter users by the ability to loose the ownership on one file.
	     * @param {string} readReceiptsCustomisation Allows to filter users by the ability to authorize a sender to check if a chat message is read.
	     * @param {string} useSpeakingTimeStatistics Allows to filter users by the ability to see speaking time statistics about a WebRTC meeting.
	     * @param {string} selectedAppCustomisationTemplate Allows to filter users by the last application customisation template applied.
	     * @param {string} format Allows to retrieve more or less user details in response. </br>
	     * small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
	     * medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode </br>
	     * full: all user fields </br>
	     * Default value : small
	     * Possible values : small, medium, full
	     * @param {string} limit Allow to specify the number of users to retrieve. Default value 100.
	     * @param {string} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort user list based on the given field. Default value : displayName
	     * @param {string} sortOrder Specify order when sorting user list. Default value : 1. Possible values : -1, 1
	     * @param {string} displayName Allows to filter users list on the given keyword(s) on field displayName.
	     * @param {boolean} useEmails used with displayName, allows to filter users list on the given keyword(s) on field displayName for loginEmails too.
	     * @param {string} companyName Allows to filter users list on the given keyword(s) on field companyName.
	     * @param {string} loginEmail Allows to filter users list on the loginEmails provided in this option.
	     * @param {string} email Allows to filter users list on the emails provided in this option.
	     * @param {string} visibility Allows to filter users list on the visibility(ies) provided in this option. Possible values : same_than_company, public, private, closed, isolated, none
	     * @param {string} organisationId Allows to filter users list on the organisationIds provided in this option. Option is reserved for superAdmin or admin allowed to manage the given organisationId.
	     * @param {string} siteId Allows to filter users list on the siteIds provided in this option. Option is reserved for superAdmin or admin allowed to manage the given siteIds.
	     * @param {string} jid_im Allows to filter users list on the jid_ims provided in this option.
	     * @param {string} jid_tel Allows to filter users list on the jid_tels provided in this option.
	     */
	    getAllUsersByFilter(searchEmail: string, companyId: string, roles: string, excludeRoles: string, tags: string, departments: string, isTerminated: string, isActivated: string, fileSharingCustomisation: string, userTitleNameCustomisation: string, softphoneOnlyCustomisation: string, useRoomCustomisation: string, phoneMeetingCustomisation: string, useChannelCustomisation: string, useScreenSharingCustomisation: string, useWebRTCVideoCustomisation: string, useWebRTCAudioCustomisation: string, instantMessagesCustomisation: string, userProfileCustomisation: string, fileStorageCustomisation: string, overridePresenceCustomisation: string, alert: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, recordingConversationCustomisation: string, useGifCustomisation: string, useDialOutCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string, selectedAppCustomisationTemplate: string, format: string, limit: string, offset: string, sortField: string, sortOrder: string, displayName: string, useEmails: boolean, companyName: string, loginEmail: string, email: string, visibility: string, organisationId: string, siteId: string, jid_im: string, jid_tel: string): Promise<any>;
	    /**
	     * @public
	     * @method getAllUsersByCompanyId
	     * @instance
	     * @description
	     *      Get all users for a given admin in a company <br>
	     * @async
	     * @category Companies and users management
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
	     *      Get all users for a given admin in a company by a search of string in email<br>
	     * @async
	     * @category Companies and users management
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
	     *      Get informations about a user <br>
	     * @param {string} userId The id of the user
	     * @async
	     * @category Companies and users management
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
	     *      Set informations about a user <br>
	     * @param {string} userId The id of the user
	     * @param {Object} infos The infos of the user : <br>
	     * {string{3..255}}  [infos.loginEmail]      User email address (used for login). <br>
	     * <br> Must be unique (409 error is returned if a user already exists with the same email address). <br>
	     *  {string{8..64}}   [infos.password]        User password. <br>
	     * <br> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character. <br>
	     * {string{1..255}}  [infos.firstName]     User first name <br>
	     * {string{1..255}}  [infos.lastName]      User last name <br>
	     * {string{1..255}}  [infos.nickName]      User nickName <br>
	     * {string{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br>
	     * {string{1..255}}  [infos.jobTitle]      User job title <br>
	     * {string[]{1..64}} [infos.tags]          An Array of free tags associated to the user. <br>
	     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
	     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. <br>
	     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with <br>
	     * the search API to search the user based on his tags. <br>
	     * {Object[]}           [infos.emails]        Array of user emails addresses objects <br>
	     * {string{3..255}}          [infos.emails.email]    User email address <br>
	     * {string=home,work,other}  [infos.emails.type]     User email type <br>
	     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects <br>
	     * <br>
	     * <br><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise. <br>
	     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) <br>
	     * {string{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user) <br>
	     * {string{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field. <br>
	     * <br>
	     * <br>If not provided, user country is used by default. <br>
	     * {string=home,work,other}              phoneNumbers.type           Phone number type <br>
	     * {string=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type <br>
	     * {string{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format) <br>
	     * {string=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed. <br>
	     * <br> USA states code list: <br>
	     * <li> <code>AA</code>:"Armed Forces America", <br>
	     * <li> <code>AE</code>:"Armed Forces", <br>
	     * <li> <code>AP</code>:"Armed Forces Pacific", <br>
	     * <li> <code>AK</code>:"Alaska", <br>
	     * <li> <code>AL</code>:"Alabama", <br>
	     * <li> <code>AR</code>:"Arkansas", <br>
	     * <li> <code>AZ</code>:"Arizona", <br>
	     * <li> <code>CA</code>:"California", <br>
	     * <li> <code>CO</code>:"Colorado", <br>
	     * <li> <code>CT</code>:"Connecticut", <br>
	     * <li> <code>DC</code>:"Washington DC", <br>
	     * <li> <code>DE</code>:"Delaware", <br>
	     * <li> <code>FL</code>:"Florida", <br>
	     * <li> <code>GA</code>:"Georgia", <br>
	     * <li> <code>GU</code>:"Guam", <br>
	     * <li> <code>HI</code>:"Hawaii", <br>
	     * <li> <code>IA</code>:"Iowa", <br>
	     * <li> <code>ID</code>:"Idaho", <br>
	     * <li> <code>IL</code>:"Illinois", <br>
	     * <li> <code>IN</code>:"Indiana", <br>
	     * <li> <code>KS</code>:"Kansas", <br>
	     * <li> <code>KY</code>:"Kentucky", <br>
	     * <li> <code>LA</code>:"Louisiana", <br>
	     * <li> <code>MA</code>:"Massachusetts", <br>
	     * <li> <code>MD</code>:"Maryland", <br>
	     * <li> <code>ME</code>:"Maine", <br>
	     * <li> <code>MI</code>:"Michigan", <br>
	     * <li> <code>MN</code>:"Minnesota", <br>
	     * <li> <code>MO</code>:"Missouri", <br>
	     * <li> <code>MS</code>:"Mississippi", <br>
	     * <li> <code>MT</code>:"Montana", <br>
	     * <li> <code>NC</code>:"North Carolina", <br>
	     * <li> <code>ND</code>:"Northmo Dakota", <br>
	     * <li> <code>NE</code>:"Nebraska", <br>
	     * <li> <code>NH</code>:"New Hampshire", <br>
	     * <li> <code>NJ</code>:"New Jersey", <br>
	     * <li> <code>NM</code>:"New Mexico", <br>
	     * <li> <code>NV</code>:"Nevada", <br>
	     * <li> <code>NY</code>:"New York", <br>
	     * <li> <code>OH</code>:"Ohio", <br>
	     * <li> <code>OK</code>:"Oklahoma", <br>
	     * <li> <code>OR</code>:"Oregon", <br>
	     * <li> <code>PA</code>:"Pennsylvania", <br>
	     * <li> <code>PR</code>:"Puerto Rico", <br>
	     * <li> <code>RI</code>:"Rhode Island", <br>
	     * <li> <code>SC</code>:"South Carolina", <br>
	     * <li> <code>SD</code>:"South Dakota", <br>
	     * <li> <code>TN</code>:"Tennessee", <br>
	     * <li> <code>TX</code>:"Texas", <br>
	     * <li> <code>UT</code>:"Utah", <br>
	     * <li> <code>VA</code>:"Virginia", <br>
	     * <li> <code>VI</code>:"Virgin Islands", <br>
	     * <li> <code>VT</code>:"Vermont", <br>
	     * <li> <code>WA</code>:"Washington", <br>
	     * <li> <code>WI</code>:"Wisconsin", <br>
	     * <li> <code>WV</code>:"West Virginia", <br>
	     * <li> <code>WY</code>:"Wyoming" <br>
	     * <br> Canada states code list: <br>
	     * <li> <code>AB</code>: "Alberta", <br>
	     * <li> <code>BC</code>: "British Columbia", <br>
	     * <li> <code>MB</code>: "Manitoba", <br>
	     * <li> <code>NB</code>:	"New Brunswick", <br>
	     * <li> <code>NL</code>: "Newfoundland and Labrador", <br>
	     * <li> <code>NS</code>: "Nova Scotia", <br>
	     * <li> <code>NT</code>: "Northwest Territories", <br>
	     * <li> <code>NU</code>: "Nunavut", <br>
	     * <li> <code>ON</code>: "Ontario", <br>
	     * <li> <code>PE</code>: "Prince Edward Island", <br>
	     * <li> <code>QC</code>: "Quebec", <br>
	     * <li> <code>SK</code>: "Saskatchewan", <br>
	     * <li> <code>YT</code>: "Yukon" <br>
	     * {string="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language <br>
	     * <br>
	     * <br> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen). <br>
	     * <br> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... <br>
	     * <br> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>. <br>
	     * {string}          [infos.timezone]      User timezone name <br>
	     * <br> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a> <br>
	     * <br> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...) <br>
	     * {string=free,basic,advanced} [infos.accountType=free]  User subscription type <br>
	     * {string[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles <br>
	     * <br>
	     * <br>The general rule is that a user must have the roles that the wants to assign to someone else. <br>
	     * <br>Examples: <br>
	     * <ul>
	     *     <li>an <code>admin</code> can add or remove the role <code>admin</code> to another user of the company(ies) he manages,</li>
	     *     <li>an <code>bp_admin</code> can add or remove the role <code>bp_admin</code> to another user of the company(ies) he manages,</li>
	     *     <li>an <code>app_superadmin</code> can add or remove the role <code>app_superadmin</code> to another user...</li>
	     * </ul>
	     * Here are some explanations regarding the roles available in Rainbow: <br>
	     * <ul>
	     * <li><code>admin</code>, <code>bp_admin</code> and <code>bp_finance</code> roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...).</li>
	     * <li><code>bp_admin</code> and <code>bp_finance</code> roles can only be set to users of a BP company (company with isBP=true).</li>
	     * <li><code>app_admin</code>, <code>app_support</code> and <code>app_superadmin</code> roles are related to application management.</li>
	     * <li><code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code> roles are related to channels management.</li>
	     * <li>Only <code>superadmin</code> can set <code>superadmin</code> and <code>support</code> roles to a user.</li>
	     * <li>A user with admin rights (admin, bp_admin, superadmin) can't change his own roles, except for roles related to channels (<code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code>).</li>
	     * </ul>
	     * {string=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS <br>
	     * {string}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1) <br>
	     * <br> companyName field is automatically filled on server side based on companyId. <br>
	     * {boolean} [infos.isActive=true]         Is user active <br>
	     * {boolean} [infos.isInitialized=false]   Is user initialized <br>
	     * {string=private,public,closed,isolated,none} [infos.visibility]  User visibility <br>
	     * <br> Define if the user can be searched by users being in other company and if the user can search users being in other companies. <br>
	     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
	     * - `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
	     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users <br>
	     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users <br>
	     * - `none`:  Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users <br>
	     * <br>External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. <br>
	     * {Number} [infos.timeToLive] Duration in second to wait before automatically starting a user deletion from the creation date. <br>
	     * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. <br>
	     * Value -1 means timeToLive is disable (i.e. user account will not expire). <br>
	     * If created user has role <code>guest</code> and no timeToLive is provided, a default value of 172800 seconds is set (48 hours). <br>
	     * If created user does not have role <code>guest</code> and no timeToLive is provided, a default value of -1 is set (no expiration). <br>
	     * {string=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used) <br>
	     * {string{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
	     * {string{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
	     * {string} selectedTheme Set the selected theme for the user. <br>
	     * {Object} customData  User's custom data. <br>
	     *    key1 	string User's custom data key1. <br>
	     *    key2 	string Company's custom data key2. <br>
	     *  customData can only be created/updated by: <br>
	     *   the user himself, company_admin or organization_admin of his company, bp_admin and bp_finance of his company, superadmin. <br>
	     *   Restrictions on customData Object: <br>
	     *   max 20 keys, <br>
	     *   max key length: 64 characters, max value length: 512 characters. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). <br>
	     *
	     * @async
	     * @return {Promise<Object, ErrorManager>}
	     * @fulfil {Object} - Json object containing informations or an error object depending on the result
	     * @category Companies and users management
	     */
	    updateContactInfos(userId: any, infos: any): Promise<unknown>;
	    /**
	     * @public
	     * @method applyCustomisationTemplates
	     * @instance
	     * @description
	     *      This API allows an administrator to apply an application customisation template to a company or a user
	     *
	     *  **Why is an application template?**
	     *
	     *  - An application template is a set of key feature controlled by permission.
	     *  - A template can be applied to a company, to a user.
	     *  - A template to a user can be applied by an administrator action or by bulk using mass provisioning mechanism.
	     *  - Custom templates may be created
	     *
	     *  **Who can apply a template?**
	     *
	     *  - superadmin, bp_admin and company_admin can apply templates available for any company (public or private template)
	     *
	     *  **Restrictions about template types.**
	     *
	     *  - Each template has a type:
	     *
	     *    - default_company
	     *    - default_user
	     *    - private_default_company
	     *    - other
	     *
	     *  - It may have only one template of default_company and default_user type.
	     *
	     *  - A default_company or default_user template is always public.
	     *
	     *  - default_company is created by Rainbow team under name Full.
	     *
	     *  - default_user is a template used to reset user with default values. It is created by Rainbow team under name Same as company. It is public too.
	     *
	     *  - An 'other' template is public or private. If private, it belongs to a company.
	     *
	     *  - A private_default_company is private and belongs to a standalone company. It may have only one private_default_company per company.
	     *
	     *  To apply a template, a template name plus a companyId or a userId must be set. When both companyId or userId are set, an error occurs (400000).
	     *
	     *  You can find on which companies the template has been applied by using the API getAllCompanies with parameter selectedAppCustomisationTemplate=:templateId
	     *  The company field selectedAppCustomisationTemplate is the last template applyed for this company.
	     * @async
	     * @category Customisation Template
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the result of the method.
	     * @category async
	     * @param {string} name Template name.
	     * @param {string} companyId Company unique identifier
	     * @param {string} userId User unique identifier
	     */
	    applyCustomisationTemplates(name: string, companyId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createCustomisationTemplate
	     * @instance
	     * @description
	     *      This API allows an administrator to create an application customisation template for the given company.
	     *
	     *      - The name of the template must be unique among all of its belonging to the company.
	     *      - The template is always private. So it has automatically private visibility.
	     *      - It can includes following items. When some of them are missing, the default value enabled is used. So the body can include only items to set with the statedisabled.
	     * @async
	     * @category Customisation Template
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the result of the method
	     * @category async
	     * @param {string} name Template name.
	     * @param {string} ownedByCompany Identifier of the company owning the template.
	     * @param {string} visibleBy When visibility is private, list of companyIds that can access the template (other than the 'ownedByCompany' one).
	     * @param {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.<br>
	     * Define if one or all users of a company has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.<br>
	     * <br>
	     * instantMessagesCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use instant messages.<br>
	     * - disabled: No user of the company can use instant messages.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.<br>
	     * Define if one or all users of a company has the is allowed to send animated GIFs in conversations<br>
	     * <br>
	     * useGifCustomisation can be:<br>
	     *
	     * - enabled: The user can send animated GIFs in conversations.<br>
	     * - disabled: The user can't send animated GIFs in conversations.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} fileSharingCustomisation Activate/Deactivate file sharing capability per company<br>
	     * Define if one or all users of a company can use the file sharing service then, allowed to download and share file.<br>
	     * <br>
	     * fileSharingCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.<br>
	     * - disabled: Each user of the company can't use the file sharing service, except when his own capability is set to 'enabled'.<br>
	     * <br>
	     * Default value : enabled<br>
	     * @param {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.<br>
	     * Define if one or all users of a company has the right to upload/download/copy or share documents.<br>
	     * <br>
	     * fileStorageCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can manage and share files.<br>
	     * - disabled: No user of the company can manage and share files.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).<br>
	     * Define if one or all users of a company has the right to join phone meetings.<br>
	     * <br>
	     * phoneMeetingCustomisation can be:<br>
	     *
	     * -  enabled: Each user of the company can join phone meetings.<br>
	     * - disabled: No user of the company can join phone meetings.<br>
	     *<br>
	     *  Default value : enabled
	     * @param {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.<br>
	     * Define if one or all users of a company is allowed to be called by the Rainbow conference bridge.<br>
	     * <br>
	     * useDialOutCustomisation can be:<br>
	     *
	     * - enabled: The user can be called by the Rainbow conference bridge.<br>
	     * - disabled: The user can't be called by the Rainbow conference bridge.<br>
	     *<br>
	     *  Default value : enabled
	     * @param {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.<br>
	     * Define if one or all users of a company has the right to create channels or be a member of channels.<br>
	     * <br>
	     * useChannelCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use some channels.<br>
	     * - disabled: No user of the company can use some channel.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.<br>
	     * Define if one or all users of a company can create bubbles or participate in bubbles (chat and web conference).<br>
	     * <br>
	     * useRoomCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use bubbles.<br>
	     * - disabled: No user of the company can use bubbles.<br>
	     *<br>
	     *  Default value : enabled
	     * @param {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.<br>
	     * Define if a user has the right to share his screen.<br>
	     * <br>
	     * useScreenSharingCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can share his screen.<br>
	     * - disabled: No user of the company can share his screen.<br>
	     * <br>
	     * @param {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.<br>
	     * Define if one or all users of a company has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).<br>
	     * <br>
	     * useWebRTCVideoCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can switch to a Web RTC audio conversation.<br>
	     * - disabled: No user of the company can switch to a Web RTC audio conversation.<br>
	     *<br>
	     * Default value : enabled
	     * @param {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.<br>
	     * Define if one or all users of a company has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).<br>
	     * <br>
	     * useWebRTCVideoCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can switch to a Web RTC video conversation.<br>
	     * - disabled: No user of the company can switch to a Web RTC video conversation.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.<br>
	     * Define if one or all users of a company has the right to record a conversation (for P2P and multi-party calls).<br>
	     * <br>
	     * recordingConversationCustomisation can be:<br>
	     *
	     * - enabled: The user can record a peer to peer or a multi-party call.<br>
	     * - disabled: The user can't record a peer to peer or a multi-party call.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to change manually his presence.<br>
	     * Define if one or all users of a company has the right to change his presence manually or only use automatic states.<br>
	     * <br>
	     * overridePresenceCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can change his presence.<br>
	     * - disabled: No user of the company can change his presence.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.<br>
	     * Define if one or all users of a company has the right to modify the globality of his profile and not only (title, firstName, lastName).<br>
	     * <br>
	     * userProfileCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can modify his profile.<br>
	     * - disabled: No user of the company can modify his profile.<br>
	     *<br>
	     * Default value : enabled
	     * @param {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company<br>
	     * Define if one or all users of a company is allowed to change some profile data.<br>
	     * <br>
	     * userTitleNameCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.<br>
	     * - disabled: Each user of the company can't change some profile data, except when his own capability is set to 'enabled'.<br>
	     *<br>
	     * Default value : enabled
	     * @param {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.<br>
	     * Define if one or all users of a company has the right to modify telephony settings like forward activation ....<br>
	     * <br>
	     * changeTelephonyCustomisation can be:<br>
	     *
	     * - enabled: The user can modify telephony settings.<br>
	     * - disabled: The user can't modify telephony settings.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.<br>
	     * Define if one or all users of a company has the right to change his client general settings.<br>
	     * <br>
	     * changeSettingsCustomisation can be:<br>
	     *
	     * - enabled: The user can change all client general settings.<br>
	     * - disabled: The user can't change any client general setting.<br>
	     * <br>
	     * Default value : enabled<br>
	     * @param {string} fileCopyCustomisation Activate/Deactivate the capability for a user to copy files<br>
	     * Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.<br>
	     * <br>
	     * fileCopyCustomisation can be:<br>
	     *
	     * - enabled: The user can make a copy of a file to his personal cloud space.<br>
	     * - disabled: The user can't make a copy of a file to his personal cloud space.<br>
	     * <br>
	     * default value : enabled
	     * @param {string} fileTransferCustomisation Activate/Deactivate the ability for a user to transfer files.<br>
	     * Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.<br>
	     * <br>
	     * fileTransferCustomisation can be:<br>
	     *
	     * - enabled: The user can transfer a file doesn't belong to him.<br>
	     * - disabled: The user can't transfer a file doesn't belong to him.<br>
	     * <br>
	     * Default value : enabled<br>
	     * @param {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the ability for a user to loose the ownership on one file.<br>
	     * Define if one or all users can drop the ownership of a file to another Rainbow user of the same company<br>
	     * <br>
	     * forbidFileOwnerChangeCustomisation can be:<br>
	     *
	     * - enabled: The user can't give the ownership of his file.<br>
	     * - disabled: The user can give the ownership of his file.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} readReceiptsCustomisation Activate/Deactivate the ability for a user to allow a sender to check if a chat message is read.<br>
	     * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.<br>
	     * <br>
	     * readReceiptsCustomisation can be:<br>
	     *
	     * - enabled: The user allow the sender to check if an IM is read.<br>
	     * - disabled: The user doesn't allow the sender to check if an IM is read.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} useSpeakingTimeStatistics Activate/Deactivate the ability for a user to see speaking time statistics.<br>
	     * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.<br>
	     * <br>
	     * useSpeakingTimeStatistics can be:<br>
	     *
	     * - enabled: The user can use meeting speaking time statistics.<br>
	     * - disabled: The user can't can use meeting speaking time statistics.<br>
	     * <br>
	     * Default value : enabled
	     */
	    createCustomisationTemplate(name: string, ownedByCompany: string, visibleBy: Array<string>, instantMessagesCustomisation: string, useGifCustomisation: string, fileSharingCustomisation: string, fileStorageCustomisation: string, phoneMeetingCustomisation: string, useDialOutCustomisation: string, useChannelCustomisation: string, useRoomCustomisation: string, useScreenSharingCustomisation: string, useWebRTCAudioCustomisation: string, useWebRTCVideoCustomisation: string, recordingConversationCustomisation: string, overridePresenceCustomisation: string, userProfileCustomisation: string, userTitleNameCustomisation: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCustomisationTemplate
	     * @instance
	     * @description
	     *      This API allows an administrator to delete an application customisation template.
	     *
	     *      Users with superadmin role can delete any private template.
	     *
	     *      Users with bp_admin or admin role can only delete template they owned.
	     *      The template to delete may have been applied to one or several companies. So, before the template deletion, we have to go back to the application of this template. A default template is applyed instead (Full)
	     *      This is done automitically and it could be necessary to advice the administrator before deleting the template.
	     *      You can find on which companies the template has been applied by using the API getAllCompanies using the parameter selectedAppCustomisationTemplate=:templateId
	     * @async
	     * @category Customisation Template
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the result of the method
	     * @category async
	     * @param {string} templateId Template id.
	     */
	    deleteCustomisationTemplate(templateId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllAvailableCustomisationTemplates
	     * @instance
	     * @description
	     *      This API allows administrator to retrieve application customisation templates supported by a given company.
	     *
	     *      superadmin and support can get templates available for any company (the requested company has to be specified in companyId query parameter. bp_admin and company_admin get templates for its own company (no need to specify companyId parameter).
	     * @async
	     * @category Customisation Template
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the result of the method
	     * @category async
	     * @param {string} companyId Select a company other than the one the user belongs to (must be an admin of the company)
	     * @param {string} format Allows to retrieve more or less templates details in response.<br>
	     * - small: id, name, visibility<br>
	     * - medium: id, name, visibility, visibleBy, type, createdBy, creationDate, ownedByCompany<br>
	     * - full: all fields<br>
	     * <br>
	     * Default value : small<br>
	     * Possible values : small, medium, full
	     * @param {number} limit Allow to specify the number of templates to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first templates to retrieve (first template if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort templates list based on the given field. Default value : name
	     * @param {number} sortOrder Specify order when sorting templates list. Default value : 1. Possible values : -1, 1
	     */
	    getAllAvailableCustomisationTemplates(companyId?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllAvailableCustomisationTemplates
	     * @instance
	     * @description
	     *      This API allows administrator to retrieve the requested application customisation template
	     *
	     * @async
	     * @category Customisation Template
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the result of the method
	     * @category async
	     * @param {string} templateId Template id.
	     */
	    getRequestedCustomisationTemplate(templateId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCustomisationTemplate
	     * @instance
	     * @description
	     *     This API allows an administrator to update an application customisation template.
	     *
	     *     A public template can't be updated using this API. Update is only allowed via a database migration.
	     * @async
	     * @category Customisation Template
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the result of the method
	     * @category async
	     * @param {string} templateId id of the template to update.
	     * @param {string} name Template name.
	     * @param {string} visibleBy When visibility is private, list of companyIds that can access the template (other than the 'ownedByCompany' one).
	     * @param {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.<br>
	     * Define if one or all users of a company has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.<br>
	     * <br>
	     * instantMessagesCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use instant messages.<br>
	     * - disabled: No user of the company can use instant messages.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.<br>
	     * Define if one or all users of a company has the is allowed to send animated GIFs in conversations<br>
	     * <br>
	     * useGifCustomisation can be:<br>
	     *
	     * - enabled: The user can send animated GIFs in conversations.<br>
	     * - disabled: The user can't send animated GIFs in conversations.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} fileSharingCustomisation Activate/Deactivate file sharing capability per company<br>
	     * Define if one or all users of a company can use the file sharing service then, allowed to download and share file.<br>
	     * <br>
	     * fileSharingCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.<br>
	     * - disabled: Each user of the company can't use the file sharing service, except when his own capability is set to 'enabled'.<br>
	     * <br>
	     * Default value : enabled<br>
	     * @param {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.<br>
	     * Define if one or all users of a company has the right to upload/download/copy or share documents.<br>
	     * <br>
	     * fileStorageCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can manage and share files.<br>
	     * - disabled: No user of the company can manage and share files.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).<br>
	     * Define if one or all users of a company has the right to join phone meetings.<br>
	     * <br>
	     * phoneMeetingCustomisation can be:<br>
	     *
	     * -  enabled: Each user of the company can join phone meetings.<br>
	     * - disabled: No user of the company can join phone meetings.<br>
	     *<br>
	     *  Default value : enabled
	     * @param {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.<br>
	     * Define if one or all users of a company is allowed to be called by the Rainbow conference bridge.<br>
	     * <br>
	     * useDialOutCustomisation can be:<br>
	     *
	     * - enabled: The user can be called by the Rainbow conference bridge.<br>
	     * - disabled: The user can't be called by the Rainbow conference bridge.<br>
	     *<br>
	     *  Default value : enabled
	     * @param {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.<br>
	     * Define if one or all users of a company has the right to create channels or be a member of channels.<br>
	     * <br>
	     * useChannelCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use some channels.<br>
	     * - disabled: No user of the company can use some channel.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.<br>
	     * Define if one or all users of a company can create bubbles or participate in bubbles (chat and web conference).<br>
	     * <br>
	     * useRoomCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can use bubbles.<br>
	     * - disabled: No user of the company can use bubbles.<br>
	     *<br>
	     *  Default value : enabled
	     * @param {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.<br>
	     * Define if a user has the right to share his screen.<br>
	     * <br>
	     * useScreenSharingCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can share his screen.<br>
	     * - disabled: No user of the company can share his screen.<br>
	     * <br>
	     * @param {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.<br>
	     * Define if one or all users of a company has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).<br>
	     * <br>
	     * useWebRTCVideoCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can switch to a Web RTC audio conversation.<br>
	     * - disabled: No user of the company can switch to a Web RTC audio conversation.<br>
	     *<br>
	     * Default value : enabled
	     * @param {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.<br>
	     * Define if one or all users of a company has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).<br>
	     * <br>
	     * useWebRTCVideoCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can switch to a Web RTC video conversation.<br>
	     * - disabled: No user of the company can switch to a Web RTC video conversation.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.<br>
	     * Define if one or all users of a company has the right to record a conversation (for P2P and multi-party calls).<br>
	     * <br>
	     * recordingConversationCustomisation can be:<br>
	     *
	     * - enabled: The user can record a peer to peer or a multi-party call.<br>
	     * - disabled: The user can't record a peer to peer or a multi-party call.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to change manually his presence.<br>
	     * Define if one or all users of a company has the right to change his presence manually or only use automatic states.<br>
	     * <br>
	     * overridePresenceCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can change his presence.<br>
	     * - disabled: No user of the company can change his presence.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.<br>
	     * Define if one or all users of a company has the right to modify the globality of his profile and not only (title, firstName, lastName).<br>
	     * <br>
	     * userProfileCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can modify his profile.<br>
	     * - disabled: No user of the company can modify his profile.<br>
	     *<br>
	     * Default value : enabled
	     * @param {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company<br>
	     * Define if one or all users of a company is allowed to change some profile data.<br>
	     * <br>
	     * userTitleNameCustomisation can be:<br>
	     *
	     * - enabled: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.<br>
	     * - disabled: Each user of the company can't change some profile data, except when his own capability is set to 'enabled'.<br>
	     *<br>
	     * Default value : enabled
	     * @param {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.<br>
	     * Define if one or all users of a company has the right to modify telephony settings like forward activation ....<br>
	     * <br>
	     * changeTelephonyCustomisation can be:<br>
	     *
	     * - enabled: The user can modify telephony settings.<br>
	     * - disabled: The user can't modify telephony settings.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.<br>
	     * Define if one or all users of a company has the right to change his client general settings.<br>
	     * <br>
	     * changeSettingsCustomisation can be:<br>
	     *
	     * - enabled: The user can change all client general settings.<br>
	     * - disabled: The user can't change any client general setting.<br>
	     * <br>
	     * Default value : enabled<br>
	     * @param {string} fileCopyCustomisation Activate/Deactivate the capability for a user to copy files<br>
	     * Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.<br>
	     * <br>
	     * fileCopyCustomisation can be:<br>
	     *
	     * - enabled: The user can make a copy of a file to his personal cloud space.<br>
	     * - disabled: The user can't make a copy of a file to his personal cloud space.<br>
	     * <br>
	     * default value : enabled
	     * @param {string} fileTransferCustomisation Activate/Deactivate the ability for a user to transfer files.<br>
	     * Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.<br>
	     * <br>
	     * fileTransferCustomisation can be:<br>
	     *
	     * - enabled: The user can transfer a file doesn't belong to him.<br>
	     * - disabled: The user can't transfer a file doesn't belong to him.<br>
	     * <br>
	     * Default value : enabled<br>
	     * @param {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the ability for a user to loose the ownership on one file.<br>
	     * Define if one or all users can drop the ownership of a file to another Rainbow user of the same company<br>
	     * <br>
	     * forbidFileOwnerChangeCustomisation can be:<br>
	     *
	     * - enabled: The user can't give the ownership of his file.<br>
	     * - disabled: The user can give the ownership of his file.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} readReceiptsCustomisation Activate/Deactivate the ability for a user to allow a sender to check if a chat message is read.<br>
	     * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.<br>
	     * <br>
	     * readReceiptsCustomisation can be:<br>
	     *
	     * - enabled: The user allow the sender to check if an IM is read.<br>
	     * - disabled: The user doesn't allow the sender to check if an IM is read.<br>
	     * <br>
	     * Default value : enabled
	     * @param {string} useSpeakingTimeStatistics Activate/Deactivate the ability for a user to see speaking time statistics.<br>
	     * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.<br>
	     * <br>
	     * useSpeakingTimeStatistics can be:<br>
	     *
	     * - enabled: The user can use meeting speaking time statistics.<br>
	     * - disabled: The user can't can use meeting speaking time statistics.<br>
	     * <br>
	     * Default value : enabled
	     */
	    updateCustomisationTemplate(templateId: string, name: string, visibleBy: string[], instantMessagesCustomisation?: string, useGifCustomisation?: string, fileSharingCustomisation?: string, fileStorageCustomisation?: string, phoneMeetingCustomisation?: string, useDialOutCustomisation?: string, useChannelCustomisation?: string, useRoomCustomisation?: string, useScreenSharingCustomisation?: string, useWebRTCAudioCustomisation?: string, useWebRTCVideoCustomisation?: string, recordingConversationCustomisation?: string, overridePresenceCustomisation?: string, userProfileCustomisation?: string, userTitleNameCustomisation?: string, changeTelephonyCustomisation?: string, changeSettingsCustomisation?: string, fileCopyCustomisation?: string, fileTransferCustomisation?: string, forbidFileOwnerChangeCustomisation?: string, readReceiptsCustomisation?: string, useSpeakingTimeStatistics?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method askTokenOnBehalf
	     * @instance
	     * @description
	     *      Ask Rainbow for a token on behalf a user <br>
	     *      This allow to not use the secret key on client side <br>
	     * @param {string} loginEmail The user login email
	     * @param {string} password The user password
	     * @async
	     * @category Users at running
	     * @return {Promise<Object, Error>}
	     * @fulfil {Object} - Json object containing the user data, application data and token
	     * @category async
	     */
	    askTokenOnBehalf(loginEmail: any, password: any): Promise<unknown>;
	    /**
	     *
	     * @public
	     * @method getUserPresenceInformation
	     * @instance
	     * @description
	     *      Get presence informations about a user <br>
	     * <br>
	     *      Company admin shall be able to check if a user can be reached or not, by checking the presence information (available, busy, away, etc). <br>
	     *      Admin will have to select a user to get a presence snapshot when opening the user configuration profile. <br>
	     *      A brute force defense is activated when too much request have been requested by the same administrator, to not overload the backend. As a result, an error 429 "Too Many Requests" will be returned . <br>
	     * @param {string} userId The id of the user. If the userId is not provided, then it use the current loggedin user id.
	     * @async
	     * @category Users at running
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
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to be retrieve the offers.
	     * @description
	     *      Method to retrieve all the offers of one company on server. <br>
	     * @return {Promise<Array<any>>}
	     */
	    retrieveAllOffersOfCompanyById(companyId?: string): Promise<Array<any>>;
	    /**
	     * @public
	     * @method retrieveAllSubscriptionsOfCompanyById
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to be retrieve the subscriptions.
	     * @param {string} format Allows to retrieve more or less subscription details in response. (default value: "small") <br>
	     * - small: id offerId profileId isDefault<br>
	     * - medium: id offerId profileId isDefault maxNumberUsers status<br>
	     * - full: all offer fields, including computed user assignment fields (numberAssignedUsers, nbAssignedBPUsers, nbLicencesAssignedToECs, ...)<br>
	     * @description
	     *      Method to retrieve all the subscriptions of one company on server. <br>
	     * @return {Promise<Array<any>>}
	     */
	    retrieveAllSubscriptionsOfCompanyById(companyId?: string, format?: string): Promise<Array<any>>;
	    /**
	     * @public
	     * @method getSubscriptionsOfCompanyByOfferId
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} offerId Id of the offer to filter subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to get the subscription of one company for one offer. <br>
	     * @return {Promise<any>}
	     */
	    getSubscriptionsOfCompanyByOfferId(offerId: any, companyId: any): Promise<any>;
	    /**
	     * @public
	     * @method subscribeCompanyToOfferById
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} offerId Id of the offer to filter subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @param {number} maxNumberUsers
	     * @param {boolean} autoRenew
	     * @description
	     *      Method to subscribe one company to one offer. <br>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToOfferById(offerId: string, companyId?: string, maxNumberUsers?: number, autoRenew?: boolean): Promise<unknown>;
	    /**
	     * @private
	     * @method subscribeCompanyToDemoOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to subscribe one company to offer demo. <br>
	     *      Private offer on .Net platform. <br>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToDemoOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @private
	     * @method unSubscribeCompanyToDemoOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to offer demo. <br>
	     *      Private offer on .Net platform. <br>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToDemoOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeCompanyToAlertOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to the subscription of the offer.
	     * @description
	     *      Method to subscribe one company to offer Alert. <br>
	     *      Private offer on .Net platform. <br>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToAlertOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeCompanyToAlertOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to the unsubscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to offer Alert. <br>
	     *      Private offer on .Net platform. <br>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToAlertOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeCompanyToVoiceEnterpriseOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company the subscription of the offer.
	     * @description
	     *      Method to subscribe one company to offer Voice Enterprise. <br>
	     *      Private offer on .Net platform. <br>
	     * @return {Promise<any>}
	     */
	    subscribeCompanyToVoiceEnterpriseOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeCompanyToVoiceEnterpriseOffer
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} companyId Id of the company to the unsubscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to offer Voice Enterprise. <br>
	     *      Private offer on .Net platform. <br>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToVoiceEnterpriseOffer(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeCompanyToOfferById
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} offerId Id of the offer to filter subscriptions.
	     * @param {string} companyId Id of the company to get the subscription of the offer.
	     * @description
	     *      Method to unsubscribe one company to one offer . <br>
	     * @return {Promise<any>}
	     */
	    unSubscribeCompanyToOfferById(offerId: string, companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method subscribeUserToSubscription
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} userId the id of the user which will subscribe. If not provided, the connected user is used.
	     * @param {string} subscriptionId the id of the subscription to attach to user.
	     * @description
	     *      Method to subscribe one user to a subscription of the company. <br>
	     * @return {Promise<any>}
	     */
	    subscribeUserToSubscription(userId?: string, subscriptionId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method unSubscribeUserToSubscription
	     * @since 1.73
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} userId the id of the user which will unsubscribe. If not provided, the connected user is used.
	     * @param {string} subscriptionId the id of the subscription to unsubscribe the user.
	     * @description
	     *      Method to unsubscribe one user to a subscription. <br>
	     * @return {Promise<any>}
	     */
	    unSubscribeUserToSubscription(userId?: string, subscriptionId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAUserProfilesByUserId
	     * @since 2.11.0
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} userId the id of the user. If not provided, the connected user is used.
	     * @description
	     *      Method to retrieve the profiles of a user by his id. <br>
	     * @return {Promise<any>} result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | subscriptionId | string | Id of company subscription to which user profile is assigned (one of the subscriptions available to user's company) |
	     * | offerId | string | Id of the offer to which company subscription is attached |
	     * | offerName | string | Name of the offer to which company subscription is attached |
	     * | offerDescription | string | Description of the offer to which company subscription is attached |
	     * | offerTechnicalDescription | string | Technical description of the subscribed offer |
	     * | offerReference | string | Key used for referencing the subscribed offer. Well know offer References are: RB-Essential, RB-Business, RB-Enterprise, RB-Conference. |
	     * | profileId | string | Id of the profile to which company subscription is attached |
	     * | profileName | string | Name of the profile to which company subscription is attached |
	     * | status | string | Status of the company subscription to which user profile is assigned  <br>  <br>Possible values: `active`, `alerting`, `hold`, `terminated` |
	     * | isDefault | boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
	     * | canBeSold | boolean | Indicates if this profile is linked a subscription for a paid offer.  <br>Some offers are not be sold (Essential, Beta, Demo, ...).  <br>If canBeSold is true, the subscription is billed. |
	     * | businessModel | string | Indicates the business model associated to the subscribed offer (number of users, usage, ...)<br><br>* `nb_users`: Licencing business model. Offers having this business model are billed according to the number of users bought for it. This should be the business model for Business and Enterprise offers.<br>* `usage`: Offers having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer). This should be the business model for Conference offer.<br>* `none`: no business model. Used for offers which are not sold (like Essential, Beta, ...).<br><br>Possible values : `nb_users`, `usage`, `none` |
	     * | isExclusive | boolean | Indicates if this profile is relative to a subscription for an exclusive offer (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer).  <br>Used on GUI side to know if the subscription to assign to a user profile has to be displayed as a radio button or as a check box. |
	     * | isPrepaid | boolean | Indicates if this profile is relative to a subscription for a prepaid offer |
	     * | expirationDate | Date-Time | Expiration date of the subscription to the prepaid offer (creationDate + prepaidDuration) |
	     * | provisioningNeeded | Object\[\] | Indicates if provisioning is needed on other component when assigning the user profile to this subscription (depends of thus subscribed offer) |
	     * | providerType | string | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when Business Store confirms through the callback that the subscription is created).<br><br>Possible values : `PGI`, `JANUS` |
	     * | mediaType optionnel | string | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on JANUS component.<br><br>Possible values : `webrtc` |
	     * | provisioningOngoing | boolean | boolean indicating if the account is being provisioned on the other component. If set to false, the account has been successfully created on the component. |
	     * | provisioningStartDate | string | Provisioning starting date |
	     * | assignationDate | string | Date when the subscription was attached to user profile |
	     *
	     */
	    getAUserProfilesByUserId(userId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAUserProfilesByUserEmail
	     * @since 2.11.0
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} email the email of the user. If not provided, the connected user is used.
	     * @description
	     *      Method to retrieve the profiles of a user by his email. <br>
	     * @return {Promise<any>} result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | subscriptionId | string | Id of company subscription to which user profile is assigned (one of the subscriptions available to user's company) |
	     * | offerId | string | Id of the offer to which company subscription is attached |
	     * | offerName | string | Name of the offer to which company subscription is attached |
	     * | offerDescription | string | Description of the offer to which company subscription is attached |
	     * | offerTechnicalDescription | string | Technical description of the subscribed offer |
	     * | offerReference | string | Key used for referencing the subscribed offer. Well know offer References are: RB-Essential, RB-Business, RB-Enterprise, RB-Conference. |
	     * | profileId | string | Id of the profile to which company subscription is attached |
	     * | profileName | string | Name of the profile to which company subscription is attached |
	     * | status | string | Status of the company subscription to which user profile is assigned  <br>  <br>Possible values: `active`, `alerting`, `hold`, `terminated` |
	     * | isDefault | boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
	     * | canBeSold | boolean | Indicates if this profile is linked a subscription for a paid offer.  <br>Some offers are not be sold (Essential, Beta, Demo, ...).  <br>If canBeSold is true, the subscription is billed. |
	     * | businessModel | string | Indicates the business model associated to the subscribed offer (number of users, usage, ...)<br><br>* `nb_users`: Licencing business model. Offers having this business model are billed according to the number of users bought for it. This should be the business model for Business and Enterprise offers.<br>* `usage`: Offers having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer). This should be the business model for Conference offer.<br>* `none`: no business model. Used for offers which are not sold (like Essential, Beta, ...).<br><br>Possible values : `nb_users`, `usage`, `none` |
	     * | isExclusive | boolean | Indicates if this profile is relative to a subscription for an exclusive offer (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer).  <br>Used on GUI side to know if the subscription to assign to a user profile has to be displayed as a radio button or as a check box. |
	     * | isPrepaid | boolean | Indicates if this profile is relative to a subscription for a prepaid offer |
	     * | expirationDate | Date-Time | Expiration date of the subscription to the prepaid offer (creationDate + prepaidDuration) |
	     * | provisioningNeeded | Object\[\] | Indicates if provisioning is needed on other component when assigning the user profile to this subscription (depends of thus subscribed offer) |
	     * | providerType | string | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when Business Store confirms through the callback that the subscription is created).<br><br>Possible values : `PGI`, `JANUS` |
	     * | mediaType optionnel | string | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on JANUS component.<br><br>Possible values : `webrtc` |
	     * | provisioningOngoing | boolean | boolean indicating if the account is being provisioned on the other component. If set to false, the account has been successfully created on the component. |
	     * | provisioningStartDate | string | Provisioning starting date |
	     * | assignationDate | string | Date when the subscription was attached to user profile |
	     *
	     */
	    getAUserProfilesByUserEmail(email?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAUserProfilesFeaturesByUserId
	     * @since 2.11.0
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} userId the id of the user. If not provided, the connected user is used.
	     * @description
	     *      Method to retrieve the features profiles of a user by his id. <br>
	     * @return {Promise<any>} result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | List of feature Objects. |
	     * | featureId | string | Feature unique identifier |
	     * | featureUniqueRef | string | Feature unique reference (to be used for controls on limitations linked to this feature in server/client code) |
	     * | featureName | string | Feature name |
	     * | featureType | string | Feature limitation type (`boolean`, `number`, `string`, `undefined`) |
	     * | isEnabled | boolean | In case feature has type boolean (on/off), is the feature enabled |
	     * | limitMin | Number | In case feature has type number, limit min of the feature (if applicable) |
	     * | limitMax | string | In case feature has type number, limit max of the feature (if applicable) |
	     * | addedDate | Date-Time | Date when the feature was updated for the profile |
	     * | lastUpdateDate | Date-Time | Date when the feature was updated for the profile |
	     *
	     */
	    getAUserProfilesFeaturesByUserId(userId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAUserProfilesFeaturesByUserEmail
	     * @since 2.11.0
	     * @instance
	     * @async
	     * @category Offers and Subscriptions.
	     * @param {string} email the email of the user. If not provided, the connected user is used.
	     * @description
	     *      Method to retrieve the features profiles of a user by his email. <br>
	     * @return {Promise<any>} result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | List of feature Objects. |
	     * | featureId | string | Feature unique identifier |
	     * | featureUniqueRef | string | Feature unique reference (to be used for controls on limitations linked to this feature in server/client code) |
	     * | featureName | string | Feature name |
	     * | featureType | string | Feature limitation type (`boolean`, `number`, `string`, `undefined`) |
	     * | isEnabled | boolean | In case feature has type boolean (on/off), is the feature enabled |
	     * | limitMin | Number | In case feature has type number, limit min of the feature (if applicable) |
	     * | limitMax | string | In case feature has type number, limit max of the feature (if applicable) |
	     * | addedDate | Date-Time | Date when the feature was updated for the profile |
	     * | lastUpdateDate | Date-Time | Date when the feature was updated for the profile |
	     *
	     */
	    getAUserProfilesFeaturesByUserEmail(email?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method checkCSVdata
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
	     * @param {any} data body of the POST.
	     * @description
	     *     This API checks a CSV UTF-8 content for mass-provisioning. Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | * check results summary |
	     * | reqId | String | * check request identifier |
	     * | mode | String | * request csv mode<br><br>Possible values : `user`, `device` |
	     * | actions | Object | * actions information |
	     * | add optionnel | Number | * number of user add actions |
	     * | update optionnel | Number | * number of user update actions |
	     * | remove optionnel | Number | * number of user remove actions |
	     * | attach optionnel | Number | * number of device pairing actions |
	     * | force_attach optionnel | Number | * number of device forced pairing actions |
	     * | columns | Number | * number of columns in the CSV |
	     * | detach optionnel | Number | * number of device unpairing actions |
	     * | delimiter | String | * the CSV delimiter |
	     * | profiles | Object | * the managed profiles |
	     * | name | String | * the managed profiles name |
	     * | valid | Boolean | * the managed profiles validity |
	     * | assignedBefore | Number | * the assigned number of managed profiles before this import |
	     * | assignedAfter | Number | * the assigned number of managed profiles after this import has been fulfilled |
	     * | max | Number | * the maximum number of managed profiles available |
	     *
	     */
	    checkCSVdata(data?: any, companyId?: string, delimiter?: string, comment?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAnImportStatusReport
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} reqId the import request id
	     * @description
	     *     This API allows to delete the report of an import identified by its reqId. <br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | * delete status |
	     * | reqId | String | * deleted reqId |
	     * | status | String | * delete status |
	     *
	     */
	    deleteAnImportStatusReport(reqId?: string, delimiter?: string, comment?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAnImportStatusReport
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} reqId the import request id
	     * @param {string} format Allows to retrieve more or less report details.
	     * - small: reporting without operation details
	     * - full: reporting with operation details
	     * Default value : full
	     * Possible values : small, full
	     * @description
	     *     This API allows to access the report of an import identified by its reqId. <br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | * import report |
	     * | reqId | String | * import request identifier |
	     * | mode | String | * provisioning mode<br><br>Possible values : `user`, `device`, `rainbowvoice` |
	     * | status | String | * request status |
	     * | report | Object | * request report |
	     * | status | String | * action status |
	     * | action | String | * the fulfilled action |
	     * | userId | String | * Rainbow user Id |
	     * | failingLines | String\[\] | * CSV lines that failed |
	     * | line optionnel | String | * associated CSV line in an error case |
	     * | counters | Object | * request counters |
	     * | succeeded | Integer | * '#' of succeeded action |
	     * | failed | Integer | * '#' of failed action |
	     * | label | String | * description of the import |
	     * | total | Integer | * total '#' of actions |
	     * | userId | String | * id of the requesting user |
	     * | displayName | String | * the requesting user displayname |
	     * | companyId | String | * the default company Id |
	     * | startTime | String | * the import processing start time |
	     * | profiles | Object | * provides info about licences used |
	     * | subscriberReport optionnel | Object | * provides details about subscriber action (attach, update or detach action) - only in case of rainbowvoice mode |
	     * | sipDeviceReport optionnel | Object | * provides details about sip Device action (attach or detach action) - only in case of rainbowvoice mode |
	     * | ddiReport optionnel | Object | * provides details about ddi action (attach or detach action) - only in case of rainbowvoice mode |
	     * | endTime | String | * the import processing end time |
	     *
	     */
	    getAnImportStatusReport(reqId?: string, format?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAnImportStatus
	     * @since 2.18.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} companyId the company id. Default value is the current company.
	     * @description
	     *     This API provides a short status of the last import (completed or pending) of a company directory. <br>
	     *          <br>
	     *              superadmin can get the status of the import of the directory of any company. <br>
	     *              bp_admin can only get the status of the import of the directory of their own companies or their End Customer companies. <br>
	     *              organization_admin can only get the status of the import of the directory of the companies under their organization. <br>
	     *              company_admin and directory_admin can only get the status of the import of the directory of their onw companies. <br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object |     |
	     * | state | String | Import state<br><br>Possibles values `"Initializing"`, `"Creating"`, `"Completed successfully"`, `"Completed with failure"` |
	     * | companyId | String | Id of the company of the directory |
	     * | userId | String | Id of the requesting user |
	     * | displayName | String | Display name of the requesting user |
	     * | label | String | Description of the import |
	     * | csvHeaders | String | CSV header line (Fields names) |
	     * | startTime | String | Import processing start time |
	     * | created | Integer | Count of created entries |
	     * | failed | Integer | Count of failed entries |
	     *
	     */
	    getAnImportStatus(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getInformationOnImports
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} companyId the companyId to list imports of
	     * @description
	     *     This API provides information on all imports of the administrator's company. <br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | reqId | String | * import request identifier |
	     * | status | String | * import status |
	     * | userId | String | * id of the requesting user |
	     * | displayName | String | * display name of the requesting user |
	     * | mode | String | * provisioning mode<br><br>Possible values : `user`, `device`, `rainbowvoice` |
	     * | label | String | * description of the import |
	     * | startTime | String | * the import processing start time |
	     * | endTime | String | * the import processing end time |
	     * | counters | Object | * the import processing operation status counters |
	     * | data | Object\[\] | * list of company imports |
	     * | succeeded | Integer | * '#' of succeeded actions |
	     * | failed | Integer | * '#' of failed actions |
	     * | warnings | Integer | * '#' actions with warnings |
	     * | total | Integer | * total '#' of actions |
	     *
	     */
	    getInformationOnImports(companyId?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getResultOfStartedOffice365TenantSynchronizationTask
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} tenant Office365 tenant
	     * @param {string} format Allows to retrieve more or less phone numbers details in response.
	     * - json: answer follows the pattern { "data" : { ... JSON ... }}
	     * - csv: answer follows the pattern { "data" : [ ... CSV ... ]}
	     * - all: answer follows the pattern { "data" : { jsonContent: {...........}, csvContent: [ , , ; , , ] }}
	     * Default value : json
	     * Possible values : csv, json, all
	     * @description
	     *     This API retrieves data describing all operations required to synchronize an Office365 tenant (csv or json format).
	     *     This API returns the result of a prior SynchronizeTenantTaskStart that triggers an asynchronous processing for a given tenant. <br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | status optionnel | String | Asynchronous operation status<br><br>Possible values : `pending` |
	     * | data optionnel | Object | synchronization data |
	     *
	     */
	    getResultOfStartedOffice365TenantSynchronizationTask(tenant?: string, format?: string): any;
	    /**
	     * @public
	     * @method importCSVData
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
	     * @param {string} label a text description of this import. Default value : none
	     * @param {string} noemails disable email sending. Default value : true
	     * @param {string} nostrict create of an existing user and delete of an unexisting user are not errors. Default value : false
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
	     * @param {any} data The body of the POST.
	     * @description
	     *     This API allows to manage Rainbow users or devices through a CSV UTF-8 encoded file. </br>
	     *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. </br>
	     *     Caution: To avoid multiple imports of same CSV data, the reqId returned to access the import status is a hash of the CSV data. </br>
	     *     If you really need to apply same CSV data again, you will have to delete its associated import report first. </br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | * import summary |
	     * | reqId | String | * import request identifier |
	     * | mode | String | * provisioning mode<br><br>Possible values : `user`, `device` |
	     * | status | String | * Current import state, should be 'Pending' |
	     * | userId | String | * id of the requesting user |
	     * | displayName | String | * display name of the requesting user |
	     * | label | String | * description of the import |
	     * | startTime | String | * the import processing start time |
	     *
	     */
	    importCSVData(data?: any, companyId?: string, label?: string, noemails?: boolean, nostrict?: boolean, delimiter?: string, comment?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method startsAsynchronousGenerationOfOffice365TenantUserListSynchronization
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} tenant Office365 tenant
	     * @description
	     *     This API generates data describing all operations required to synchronize an Office365 tenant (csv or json format). </br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | status | String | Asynchronous operation status<br><br>Possible values : `pending` |
	     *
	     */
	    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method synchronizeOffice365TenantUserList
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} tenant Office365 tenant
	     * @param {string} format Allows to retrieve more or less phone numbers details in response.
	     * - json: answer follows the pattern { "data" : { ... JSON ... }}
	     * - csv: answer follows the pattern { "data" : [ ... CSV ... ]}
	     * - all: answer follows the pattern { "data" : { jsonContent: {...........}, csvContent: [ , , ; , , ] }}
	     * Default value : json
	     * Possible values : csv, json, all
	     * @description
	     *     This API generates a file describing all operations required to synchronize an Office365 tenant (csv or json format). </br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | String | synchronization data. |
	     *
	     */
	    synchronizeOffice365TenantUserList(tenant?: string, format?: string): any;
	    /**
	     * @public
	     * @method checkCSVDataOfSynchronizationUsingRainbowvoiceMode
	     * @since 2.12.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} companyId companyId of the users in the CSV file, default to admin's companyId
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character. Default value : %
	     * @param {any} data The body of the POST.
	     * @description
	     *    This API checks a CSV UTF-8 content for mass-provisioning for rainbowvoice mode. Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. </br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | * check results summary |
	     * | reqId | String | * check request identifier |
	     * | mode | String | * request csv mode<br><br>Possible values : `rainbowvoide` |
	     * | actions | Object | * actions information |
	     * | upsert optionnel | Number | * number of user create/update actions |
	     * | delete optionnel | Number | * number of user remove actions |
	     * | columns | Number | * number of columns in the CSV |
	     * | detach optionnel | Number | * number of device unpairing actions |
	     * | delimiter | String | * the CSV delimiter |
	     * | profiles | Object | * the managed profiles |
	     * | name | String | * the managed profiles name |
	     * | valid | Boolean | * the managed profiles validity |
	     * | assignedBefore | Number | * the assigned number of managed profiles before this import |
	     * | assignedAfter | Number | * the assigned number of managed profiles after this import has been fulfilled |
	     * | max | Number | * the maximum number of managed profiles available |
	     *
	     */
	    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data?: any, companyId?: string, delimiter?: string, comment?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCommandIdStatus
	     * @since 2.14.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} data body of the POST. Body : {
	     * status : `success` or `failure`, // status for the execution of the command
	     * details : string // details that can be provided about the command execution
	     * }
	     *
	     * @param {string} commandId commandId which came from connector on behalf of admin command
	     * @description
	     *    This API is used to update the status of the commandId. </br>
	     * <br>
	     * @return {Promise<any>} result.
	     *
	     */
	    updateCommandIdStatus(data?: any, commandId?: string): Promise<unknown>;
	    /**
	 * @public
	 * @method synchronizeUsersAndDeviceswithCSV
	 * @since 1.86.0
	 * @instance
	 * @async
	 * @category AD/LDAP - AD/LDAP Massprovisioning
	 * @param {string} csvTxt the csv of the user and device to synchronize.
	 * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
	 * @param {string} label a text description of this import
	 * @param {boolean} noemails disable email sending
	 * @param {boolean} nostrict create of an existing user and delete of an unexisting user are not errors
	 * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	 * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
	 * @param {string} commandId Command identifier. When runing the manual synchro, the commandId must be added as query parameter.
	 * @description
	 *     This API allows to synchronize Rainbow users or devices through a CSV UTF-8 encoded file. it is a merge from user mode and device mode <br>
	 *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. <br>
	 * <br>
	 * Supported fields for "user" management are: <br>
	 * __action__  delete, upsert, sync or detach <br>
	 * loginEmail  (mandatory) <br>
	 * password  (mandatory) <br>
	 * title <br>
	 * firstName <br>
	 * lastName <br>
	 * nickName <br>
	 * businessPhone{n}  (n is a number starting from 0 or 1) <br>
	 * mobilePhone{n}  (n is a number starting from 0 or 1) <br>
	 * email{n}  (n is a number starting from 0 or 1) <br>
	 * tags{n}  (n is a number starting from 0 to 4) <br>
	 * jobTitle <br>
	 * department <br>
	 * userInfo1 <br>
	 * userInfo2 <br>
	 * country <br>
	 * language <br>
	 * timezone <br>
	 * visibility <br>
	 * isInitialized <br>
	 * authenticationType <br>
	 * service{n} <br>
	 * accountType <br>
	 * photoUrl <br>
	 * <br>
	 * Supported fields for "device" management are: <br>
	 * loginEmail (mandatory) <br>
	 * pbxId <br>
	 * pbxShortNumber <br>
	 * pbxInternalNumber <br>
	 * number <br>
	 * <br>
	 * detach: allows to detach an PBX extension from a user. delete: allows to delete a user. upsert: allows to modify user (update or create if doesn't exists) and device (force attach if filled) with filled fields. Remark: empty fields are not taken into account. sync: allows to modify user (update or create if doesn't exists) and device (force attach if filled, detach if empty) with filled fields. <br>
	 * Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value). <br>
	 * <br>
	 * Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. Caution: for sync action: <br>
	 * As empty fields are taken into account, all fields must be filled to avoid a reset of these values <br>
	 * As empty fields are taken into account, it is better to avoid mixing sync __action__ with others actions <br>
	 * <br>
	 * @return {Promise<any>} import summary result.
	 */
	    synchronizeUsersAndDeviceswithCSV(csvTxt?: string, companyId?: string, label?: string, noemails?: boolean, nostrict?: boolean, delimiter?: string, comment?: string, commandId?: string): Promise<{
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
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string}  companyId ompanyId of the users in the CSV file, default to admin's companyId.
	     * @param {string} mode Select template to return.
	     * - user: provider the user management template
	     * - device: provider the device management template
	     * - useranddevice: provider the user and device management template (both user and device)
	     * - rainbowvoice : provider the user and subscriber/DDI/device association management template.
	     * @param {string} comment Only the template comment..
	     * @description
	     *      This API provides a CSV template. <br>
	     *      result : <br>
	     *      CSV {Object[]} lines with all supported headers and some samples : <br>
	     *      __action__ {string} Action to perform values : create, update, delete, upsert, detach <br>
	     *      loginEmail {string} email address - Main or professional email used as login <br>
	     *      password optionnel {string} (>= 8 chars with 1 capital+1 number+1 special char) (e.g. This1Pwd!) <br>
	     *      title optionnel {string} (e.g. Mr, Mrs, Dr, ...) <br>
	     *      firstName optionnel {string} <br>
	     *      lastName optionnel {string} <br>
	     *      nickName optionnel {string} <br>
	     *      businessPhone0 optionnel {string} E.164 number - DDI phone number (e.g. +33123456789) <br>
	     *      mobilePhone0 optionnel {string} E.164 number - Mobile phone number (e.g. +33601234567) <br>
	     *      email0 optionnel {string} email address - Personal email <br>
	     *      jobTitle optionnel {string} <br>
	     *      department optionnel {string} <br>
	     *      country optionnel {string} ISO 3166-1 alpha-3 - (e.g. FRA) <br>
	     *      language optionnel {string} ISO 639-1 (en) / with ISO 31661 alpha-2 (en-US) <br>
	     *      timezone optionnel {string} IANA tz database (Europe/Paris) <br>
	     *      pbxShortNumber optionnel {number} PBX extension number <br>
	     *      pbxInternalNumber optionnel {string} E.164 number - Private number when different from extension number <br>
	     *      selectedAppCustomisationTemplateName optionnel {string} Allow to specify an application customisation template for this user. The application customisation template has to be specified using its name (ex: "Chat and Audio", "Custom profile")     Values( Full, Phone, calls, only, Audio, only, Chat, and, Audio, Same, as, company, , profile) <br>
	     *      shortNumber optionnel string subscriber {number} (only for rainbowvoice mode) <br>
	     *      macAddress optionnel {string} macAddress of the associated SIP device of the subscriber (only for rainbowvoice mode) <br>
	     *      ddiE164Number optionnel string E.164 {number} - E164 number of the associted DDI of the subscriber (only for rainbowvoice mode) <br>
	     * @return {Promise<any>}
	     */
	    getCSVTemplate(companyId?: string, mode?: string, comment?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method checkCSVforSynchronization
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} CSVTxt CSV File content to be checked.
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character.
	     * @param {string} commandId if the check csv request comes from connector on behalf of admin command, it will generates a report.
	     * @description
	     *      This API checks a CSV UTF-8 content for mass-provisioning for useranddevice mode.<br>
	     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br>
	     *      { <br>
	     *           actions {Object} actions information <br>
	     *               sync optionnel {number} number of user synchronization actions <br>
	     *               upsert optionnel {number} number of user create/update actions <br>
	     *               delete optionnel {number} number of user remove actions <br>
	     *               detach optionnel {number} number of device unpairing actions <br>
	     *           reqId {string} check request identifier <br>
	     *           mode {string} request csv mode Possible values : user, device <br>
	     *           columns {number} number of columns in the CSV <br>
	     *           delimiter {string} the CSV delimiter <br>
	     *           profiles {Object} the managed profiles <br>
	     *              name {string} the managed profiles name <br>
	     *              valid {boolean} the managed profiles validity <br>
	     *              assignedBefore {number} the assigned number of managed profiles before this import <br>
	     *              assignedAfter {number} the assigned number of managed profiles after this import has been fulfilled <br>
	     *              max number the {maximum} number of managed profiles available <br>
	     *      } <br>
	     * @return {Promise<any>}
	     */
	    checkCSVforSynchronization(CSVTxt: any, companyId?: string, delimiter?: string, comment?: string, commandId?: string): any;
	    /**
	     * @public
	     * @method getCheckCSVReport
	     * @since 2.5.1
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} commandId used in the check csv request whicj came from connector on behalf of admin command
	     * @description
	     *      This API retrieves the last checks CSV UTF-8 content for mass-provisioning for useranddevice mode, performed by an admin (using a commandId). <br>
	     * @return {Promise<any>}
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | report | Object | * check results summary |
	     * | status | String | * status of the check csv<br><br>Possible values : `success`, `failure`, `pending` |
	     * | reqId | String | * check request identifier |
	     * | mode | String | * request csv mode<br><br>Possible values : `user`, `device` |
	     * | actions | Object | * actions information |
	     * | sync optionnel | Number | * number of user synchronization actions |
	     * | upsert optionnel | Number | * number of user create/update actions |
	     * | delete optionnel | Number | * number of user remove actions |
	     * | columns | Number | * number of columns in the CSV |
	     * | detach optionnel | Number | * number of device unpairing actions |
	     * | delimiter | String | * the CSV delimiter |
	     * | profiles | Object | * the managed profiles |
	     * | name | String | * the managed profiles name |
	     * | valid | Boolean | * the managed profiles validity |
	     * | assignedBefore | Number | * the assigned number of managed profiles before this import |
	     * | assignedAfter | Number | * the assigned number of managed profiles after this import has been fulfilled |
	     * | max | Number | * the maximum number of managed profiles available |
	     *
	     */
	    getCheckCSVReport(commandId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method importRainbowVoiceUsersWithCSVdata
	     * @since 2.5.1
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
	     * @param {string} label a text description of this import. default undefined.
	     * @param {boolean} noemails disable email sending. default true.
	     * @param {boolean} nostrict create of an existing user and delete of an unexisting user are not errors. default false.
	     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
	     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character. default "%"
	     * @param {string} csvData the csv of the user and device to synchronize.
	     * @description
	     *      This API allows to perform provisioning for Rainbow Voice (Rainbow Users and Subscribers management + DDIs and Sip devices attachment) through a CSV UTF-8 encoded file. <br>
	     *      The first line of the CSV data describes the content format. <br>
	     *      Most of the field names are the field names of the admin createUser API. <br>
	     *      Additional field used for Subscriber management is: shortNumber <br>
	     *      Additional field used for DDI attachment is: ddiE164Number  <br>
	     *      Additional field used for Sip device attachment is: macAddress <br>
	     *  <br>
	     *      Supported fields for "user" management are: <br>
	     *      __action__    upsert, delete or detach <br>
	     *      loginEmail    (mandatory) <br>
	     *      password    (mandatory) <br>
	     *      title <br>
	     *      firstName <br>
	     *      lastName <br>
	     *      nickName <br>
	     *      businessPhone{n}    (n is a number starting from 0 or 1) <br>
	     *      mobilePhone{n}    (n is a number starting from 0 or 1) <br>
	     *      email{n}    (n is a number starting from 0 or 1) <br>
	     *      tags{n}    (n is a number starting from 0 to 4) <br>
	     *      jobTitle <br>
	     *      department <br>
	     *      userInfo1 <br>
	     *      userInfo2 <br>
	     *      country <br>
	     *      language <br>
	     *      timezone <br>
	     *      visibility <br>
	     *      isInitialized <br>
	     *      authenticationType <br>
	     *      service{n} <br>
	     *      accountType <br>
	     *      photoUrl <br>
	     *       <br>
	     *      Supported fields for "subscriber" management are: <br>
	     * <br>
	     *      loginEmail    (mandatory) <br>
	     *      shortNumber <br>
	     * <br>
	     *      Supported fields for "SIP Device" management are: <br>
	     * <br>
	     *      loginEmail    (mandatory) <br>
	     *      macAddress <br>
	     * <br>
	     *      Supported fields for "DDI" management are: <br>
	     * <br>
	     *      loginEmail    (mandatory) <br>
	     *      ddiE164Number <br>
	     * <br>
	     *      __action__ description : <br>
	     *      upsert: allows to modify user (update or create if doesn't exist). It attaches also a subscriber (if field shortNumber is filled) , attaches a Sip Device (if field macAddress is filled) and attaches a DDI (if field ddiE164Number is filled) <br>
	     *      Remark: empty fields are not taken into account. <br>
	     * <br>
	     *      detach: allows to detach subscriber (if field shortNumber is filled) ; to detach Sip Device (if field macAddress is filled) and to detach DDI (if field ddiE164Number is filled) <br>
	     *      If field shortNumber is filled; detach action is done not only on subscriber but also on Sip Device and DDI automatically (even if fields macAddress and ddiE164Number are not filled) <br>
	     *    <br>
	     *      delete: allows to delete a user (if user is attached to a subscriber ; this subscriber + DDI + Sip device are automatically detached) <br>
	     *       <br>
	     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br>
	     *   <br>
	     *      Caution: To avoid multiple imports of same CSV data, the reqId returned to access the import status is a hash of the CSV data. If you really need to apply same CSV data again, you will have to delete its associated import report first. <br>
	     * <br>
	     *      Error codes: <br>
	     *      2001 'company {companyId} has no Cloud Pbx' <br>
	     *      2002 'ShortNumber {shortNumber} not in line with Cloud PBX Numbering Plan for company {companyId}' <br>
	     *      2003 'ShortNumber {shortNumber} is already assigned to someone else inside this company {companyId}' <br>
	     *      2004 'user {userId} is already assigned into another PBX of the company {companyId}' <br>
	     *      2005 'failed to create subscriber for user {userId} with shortNumber {shortNumber} into system {systemId}' <br>
	     *      2006 'failed to update subscriber number for user {userId} with this new shortNumber {shortNumber} into system {systemId}' <br>
	     *      2007 'there is no existing Sip Device with this macAddress {macAddress}' <br>
	     *      2008 'the existing Sip Device with this macAddress {macAddress} is not belonging to the requested company {companyId}' <br>
	     *      2009 'the existing Sip Device with this macAddress {macAddress} is attached to someone else: userId={userId}' <br>
	     *      2010 'another Sip Device with macAddress {macAddress} is attached to user={userId}' <br>
	     *      2011 'cannot assign/unassign a Sip device to this user {userId} ; he is not yet a subscriber' <br>
	     *      2012 'failed to attach this Sip Device {macAddress} with this user {userId} %s' <br>
	     *      2013 'cannot assign a DDI to this user {userId} ; he is not yet a subscriber' <br>
	     *      2014 'there is no existing DDI with this number {ddiE164Number}' <br>
	     *      2015 'the existing DDI with this number {ddiE164Number} is attached to someone else: userId={userId}' <br>
	     *      2016 'another DDI with number {ddiE164Number} is attached to user={userId}' <br>
	     *      2017 'failed to attach this DDI {ddiE164Number} with this user {userId}' <br>
	     *      2018 'failed to detach subscriber for user {userId}, no shortNumber is provided' <br>
	     *      2019 'failed to detach this subscriber {shortNumber into the request} from this user {userId}, user is attached to another subscriber {real subscriber shortNumber}' <br>
	     *      2020 'cannot detach a DDI to this user {userId} ; he is no more a subscriber' <br>
	     *      2021 'failed to detach this DDI {ddiE164Number} with this user {userId}' <br>
	     *      2022 'failed to detach this Sip Device {macAddress} with this user {userId}' <br>
	     *      <br>
	     *
	     *      Sample :
	     *      <code class="  language-csv">
	     *          __action__;loginEmail                   ;shortNumber;   macAddress        ; ddiE164Number    ;password     ;title;firstName  ;lastName;language;service0         ;service1
	     *          upsert    ;lupin00@ejo.company.com      ;           ;                     ;                  ;Password_123 ;Mr   ;Arsene00   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
	     *          upsert    ;lupin01@ejo.company.com      ; 81011     ;                     ;                  ;Password_123 ;Mr   ;Arsene01   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
	     *          upsert    ;lupin02@ejo.company.com      ; 81012     ;   aa:bb:cc:dd:ee:02 ;                  ;Password_123 ;Mr   ;Arsene02   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
	     *          delete    ;lupin13@ejo.company.com      ; 81023     ;   aa:bb:cc:dd:ee:13 ; 33298300513      ;Password_123 ;Mr   ;Arsene13   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
	     *          delete    ;lupin14@ejo.company.com      ;           ;                     ;                  ;             ;     ;           ;        ;        ;                 ;</code>
	     *
	     *      return an {Object}  . <br>
	     * @return {Promise<any>}
	     */
	    importRainbowVoiceUsersWithCSVdata(companyId: string, label: string, noemails: boolean, nostrict: boolean, delimiter: string, comment: string, csvData: string): Promise<unknown>;
	    /**
	    * @public
	    * @method retrieveRainbowUserList
	    * @since 1.86.0
	    * @instance
	    * @async
	    * @category AD/LDAP - AD/LDAP Massprovisioning
	    * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
	    * @param {string} format the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
	    * @param {boolean} ldap_id the CSV comment start character, use double quotes in field values to escape this character.
	    * @description
	    *      This API generates a file describing all users (csv or json format). <br>
	    *      return an {Object}  of synchronization data. <br>
	    * @return {Promise<any>}
	    */
	    retrieveRainbowUserList(companyId?: string, format?: string, ldap_id?: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method checkCSVdataForSynchronizeDirectory
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @description
	     *      This API checks a CSV UTF-8 content for mass-provisioning for directory mode.</br>
	     *      All the entries defined in the CSV data are relative to the same company directory. <br>
	     *      In case a query parameter commandId is added, the following event is sent to the initiator of the command: "rainbow_onconnectorcommandended"<br>
	     *          <br>
	     *      The first line of the CSV file describes the content format. Most of the field names are the same than the field names of the company directory API - Create a directory entry.<br>
	     *      Supported fields are:<br>
	     *      __action__ : delete, upsert or sync<br>
	     *      ldap_id : (mandatory)<br>
	     *      *<br>
	     *      firstName<br>
	     *      lastName<br>
	     *      companyName<br>
	     *      workPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
	     *      mobilePhoneNumber{n} : (n is a number starting from 0 or 9)<br>
	     *      otherPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
	     *      tag{n} : (n is a number starting from 0 to 4)<br>
	     *      department<br>
	     *      street<br>
	     *      city<br>
	     *      postalCode<br>
	     *      state<br>
	     *      country<br>
	     *      jobTitle<br>
	     *      eMail<br>
	     *      custom1<br>
	     *      custom2<br>
	     *      <br>
	     *      delete: allows to delete an entry. upsert: allows to modify an entry (update or create if doesn't exists) with filled fields.<br>
	     *      Remark: empty fields are not taken into account. sync: allows to modify an entry (update or create if doesn't exists) with filled fields.<br>
	     *      Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value).<br>
	     *      <br>
	     *      return an {Object}  of synchronization data. <br>
	     * @return {Promise<any>}
	     * @param {string} delimiter CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	     * @param {string} comment CSV comment start character. Default value : %
	     * @param {string} commandId commandId if the check csv request comes from connector on behalf of admin command, ity will generates a report
	     * @param {string} csvData string with the body of the CSV data.
	     */
	    checkCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, csvData: string): Promise<unknown>;
	    /**
	     * @public
	     * @method importCSVdataForSynchronizeDirectory
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @description
	     *      This API allows to import the entries of a company directory with CSV UTF-8 encoded data. <br>
	     *      All the entries defined in the CSV data are relative to the same company directory. <br>
	     *      In case a query parameter commandId is added, the following event is sent to the initiator of the command: "rainbow_onconnectorcommandended"<br>
	     *          <br>
	     *      The first line of the CSV file describes the content format. Most of the field names are the same than the field names of the company directory API - Create a directory entry.<br>
	     *      Supported fields are:<br>
	     *      __action__ : delete, upsert or sync<br>
	     *      ldap_id : (mandatory)<br>
	     *      *<br>
	     *      firstName<br>
	     *      lastName<br>
	     *      companyName<br>
	     *      workPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
	     *      mobilePhoneNumber{n} : (n is a number starting from 0 or 9)<br>
	     *      otherPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
	     *      tag{n} : (n is a number starting from 0 to 4)<br>
	     *      department<br>
	     *      street<br>
	     *      city<br>
	     *      postalCode<br>
	     *      state<br>
	     *      country<br>
	     *      jobTitle<br>
	     *      eMail<br>
	     *      custom1<br>
	     *      custom2<br>
	     *      <br>
	     *      delete: allows to delete an entry. upsert: allows to modify an entry (update or create if doesn't exists) with filled fields.<br>
	     *      Remark: empty fields are not taken into account. sync: allows to modify an entry (update or create if doesn't exists) with filled fields.<br>
	     *      Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value).<br>
	     *      <br>
	     *      return an {Object}  of synchronization data. <br>
	     * @return {Promise<any>}
	     * @param {string} delimiter CSV delimiter character (will be determined by analyzing the CSV file if not provided)
	     * @param {string} comment CSV comment start character. Default value : %
	     * @param {string} commandId commandId if the check csv request comes from connector on behalf of admin command, ity will generates a report
	     * @param {string} label A text description of this import. Default value : none
	     * @param {string} csvData string with the body of the CSV data.
	     */
	    importCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, label: string, csvData: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCSVReportByCommandId
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @description
	     *      This API retrieves the last import CSV UTF-8 content for mass-provisioning for directory mode, performed by an admin (using a commandId). <br>
	     *           <br>
	     *      return { <br>
	     *           status : string, // status of the check csv. Possible values : success, failure, pending  <br>
	     *          report : Object,  // check results summary <br>
	     *              companyId : string, // Id of the company of the directory <br>
	     *              userId : string, Id of the requesting user <br>
	     *              displayName : string Display name of the requesting user <br>
	     *              label : string Description of the import <br>
	     *              csvHeaders : string CSV header line (Fields names) <br>
	     *              startTime : string Import processing start time <br>
	     *              created : number Count of created entries <br>
	     *              updated : number Count of updated entries <br>
	     *              deleted : number Count of deleted entries <br>
	     *              failed : 	Integer Count of failed entries <br>
	     *        } <br>
	     *
	     *      return an {Object}  of synchronization data. <br>
	     * @return {Promise<any>}
	     * @param {string} commandId commandId used in the import csv request which came from connector on behalf of admin command.
	     */
	    getCSVReportByCommandId(commandId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createCSVReportByCommandId
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @description
	     *      This API allows to create a report for a commandId in case no other API is called (no action to be performed, error, ...). <br>
	     *           <br>
	     *      return { <br>
	     *           status : string, // status of the check csv. Possible values : success, failure, pending  <br>
	     *          report : Object,  // check results summary <br>
	     *              details : string details for for report <br>
	     *        } <br>
	     *
	     *      return an {Object}  of synchronization data. <br>
	     * @return {Promise<any>}
	     * @param {string} commandId commandId used in the import csv request which came from connector on behalf of admin command.
	     * @param {Object} data The body of the request : {
	     *     status : string, // status for the execution of the command Possible values : success, failure
	     *     details : string, // details that can be provided about the command execution
	     * }
	     */
	    createCSVReportByCommandId(commandId: string, data: any): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveRainbowEntriesList
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - AD/LDAP Massprovisioning
	     * @description
	     *      This API generates a file describing all companies entries (csv or json format). <br>
	     *           <br>
	     *
	     *      return an {Object}  of result data. <br>
	     * @return {Promise<any>}
	     * @param {string} companyId companyId from which to retrieve entries, default to admin's companyId
	     * @param {string} format Allows to retrieve more or less phone numbers details in response. Default value : json. Possible values : csv, json, all
	     * @param {boolean} ldap_id Allows to filter entries containing a ldap_id. </br>
	     * - json: answer follows the pattern { "data" : { ... JSON ... }} </br>
	     * - csv: answer follows the pattern { "data" : [ ... CSV ... ]} </br>
	     * - all: answer follows the pattern { "data" : { jsonContent: {...........}, csvContent: [ , , ; , , ] }} </br>
	     * </br>
	     *  Default value : true </br>
	     */
	    retrieveRainbowEntriesList(companyId?: string, format?: string, ldap_id?: boolean): any;
	    /**
	     * @public
	     * @method ActivateALdapConnectorUser
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @description
	     *      This API allows to activate a Ldap connector. <br>
	     *      A "Ldap user" is created and registered to the XMPP services. The Ldap user credentials (loginEmail and password) are generated randomly and returned in the response. <br>
	     * <br>
	     *      Note 1 A brute force defense is activated when too much activation have been requested. As a result, an error 429 "Too Many Requests" will be returned during an increasing period to dissuade a slow brute force attack. <br>
	     *      Note 2 Ldap's company should have an active subscription to to activate Ldap. If subscription linked to Ldap is not active or it has no more remaining licenses, error 403 is thrown <br>
	     *      Note 3 Ldap's company should have an SSO authentication Type, and it must be the default authentication Type for users. If company doesn't have an SSO or have one but not a default one, error 403 is thrown <br>
	     *       <br>
	     * @return {Promise<{ id : string, companyId : string, loginEmail : string, password : string}>} -
	     * <br>
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | id  | string | Ldap connector unique identifier. |
	     * | companyId | string | Company linked to the Ldap connector. |
	     * | loginEmail | string | Generated Ldap connector user login ("throwaway" email address, never used by rainbow to send email). |
	     * | password | string | Generated Ldap connector user password. |
	     *
	     */
	    ActivateALdapConnectorUser(): Promise<{
	        id: string;
	        companyId: string;
	        loginEmail: string;
	        password: string;
	    }>;
	    /**
	     * @public
	     * @method deleteLdapConnector
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} ldapId the Id of the ldap connector to delete.
	     * @description
	     *      This API is to delete the connector <br>
	     *     **BP Admin** and **BP Finance** users can only delete users being in a company linked to their BP company.<br>
	     *     **Admin** users can only delete users being in their own company. (superadmin, organization\_admin, company\_admin)
	     *      return { <br>
	     *          status {string} Delete operation status message. <br>
	     *          } <br>
	     * @return {Promise<{ status : string}>}
	     */
	    deleteLdapConnector(ldapId: string): Promise<{
	        status: string;
	    }>;
	    /**
	     * @public
	     * @method retrieveAllLdapConnectorUsersData
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
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
	     *     This API allows administrators to retrieve all the ldap connectors. <br>
	     *     Users with superadmin, support role can retrieve the connectors from any company. <br>
	     *     Users with bp_admin or bp_finance role can only retrieve the connectors in companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
	     *     Users with admin role can only retrieve the connectors in companies they can manage. That is to say: <br>
	     *     an organization_admin can retrieve the connectors only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
	     *     a company_admin can only retrieve the connectors in his company. <br>
	     *     This API can return more or less connector information using format option in query string arguments (default is small). <br>
	     * <br>
	     *      return { // List of connector Objects. <br>
	     *          id string TV unique identifier. <br>
	     *          name string TV name. <br>
	     *          location optionnel string Location of the TV. <br>
	     *          locationDetail optionnel string More detail on the location of the TV. <br>
	     *          room optionnel string Name of the room where the TV is located. <br>
	     *          companyId string company linked to the TV. <br>
	     *          activationCode string Activation code (6 digits). The activationCode may be null in the case its generation in multi-environment database failed. In that case, a security mechanism takes place to generate this activation code asynchronously (try every minutes until the code creation is successful). As soon as the activation code is successfully generated in multi-environment database, the TV is updated accordingly (activationCode set to the generated code value) and with activationCodeGenerationStatus updated to done. <br>
	     *          codeUpdateDate date Date of last activation code update. <br>
	     *          status string TV status:    unassociated (no TV user).    associated with a TV user (the TV has been activated). <br>
	     *          statusUpdatedDate Date-Time Date of last tv status update. <br>
	     *          subscriptionId string Subscription to use when activating TV. <br>
	     *          loginEmail string User email address (used for login) <br>
	     *          firstName string User first name <br>
	     *          lastName string User last name <br>
	     *          displayName string User display name (firstName + lastName concatenated on server side) <br>
	     *          nickName optionnel string User nickName <br>
	     *          title optionnel string User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br>
	     *          jobTitle optionnel string User job title <br>
	     *          department optionnel string User department <br>
	     *          tags optionnel string[] An Array of free tags associated to the user. A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. tags can only be set by users who have administrator rights on the user. The user can't modify the tags. The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. <br>
	     *          emails Object[] Array of user emails addresses objects <br>
	     *             email string User email address <br>
	     *             type string Email type, one of home, work, other <br>
	     *          phoneNumbers Object[] Array of user phone numbers objects. Phone number objects can:   be created by user (information filled by user), come from association with a system (pbx) device (association is done by admin). <br>
	     *              phoneNumberId string Phone number unique id in phone-numbers directory collection. <br>
	     *              number optionnel string User phone number (as entered by user) <br>
	     *              numberE164 optionnel string User E.164 phone number, computed by server from number and country fields <br>
	     *              country 	string Phone number country (ISO 3166-1 alpha3 format) country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used   isFromSystem boolean boolean indicating if phone is linked to a system (pbx). <br>
	     *              shortNumber optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG). Only usable within the same PBX. Only PCG can set this field. <br>
	     *              internalNumber optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), internal phone number. Usable within a PBX group. Admins and users can modify this internalNumber field. <br>
	     *              systemId optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. <br>
	     *              pbxId optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that pbx. <br>
	     *              type 	string Phone number type, one of home, work, other. <br>
	     *              deviceType 	string Phone number device type, one of landline, mobile, fax, other. <br>
	     *              isVisibleByOthers 	boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers. <br>
	     *         country 	string User country (ISO 3166-1 alpha3 format) <br>
	     *         state optionnel 	string When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null). <br>
	     *         language optionnel 	string User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) <br>
	     *         timezone optionnel 	string User timezone name <br>
	     *         jid_im 	string User Jabber IM identifier <br>
	     *         jid_tel 	string User Jabber TEL identifier <br>
	     *         jid_password 	string User Jabber IM and TEL password <br>
	     *         roles 	string[] List of user roles (Array of string) Note: company_support role is only used for support redirection. If a user writes a #support ticket and have the role company_support, the ticket will be sent to ALE's support (otherwise the ticket is sent to user's company's supportEmail address is set, ALE otherwise). <br>
	     *         adminType 	string In case of user's is 'admin', define the subtype (organisation_admin, company_admin, site_admin (default undefined) <br>
	     *         organisationId 	string In addition to User companyId, optional identifier to indicate the user belongs also to an organization <br>
	     *         siteId 	string In addition to User companyId, optional identifier to indicate the user belongs also to a site <br>
	     *         companyName 	string User company name <br>
	     *         visibility 	string User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: <br>
	     *         same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. <br>
	     *         public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
	     *         private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
	     *         closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users <br>
	     *         isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users <br>
	     *         none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users <br>
	     *         External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Values(same_than_company, public, private, closed, isolated, none) <br>
	     *         isActive 	boolean Is user active  <br>
	     *         isInitialized 	boolean Is user initialized <br>
	     *         initializationDate 	Date-Time User initialization date <br>
	     *         activationDate 	Date-Time User activation date <br>
	     *         creationDate 	Date-Time User creation date <br>
	     *         lastUpdateDate 	Date-Time Date of last user update (whatever the field updated) <br>
	     *         lastAvatarUpdateDate 	Date-Time Date of last user avatar create/update, null if no avatar <br>
	     *         createdBySelfRegister 	boolean true if user has been created using self register <br>
	     *         createdByAdmin optionnel 	Object If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user <br>
	     *         userId 	string userId of the admin who created this user <br>
	     *         loginEmail 	string loginEmail of the admin who created this user <br>
	     *         invitedBy optionnel 	Object If user has been created from an email invitation sent by another rainbow user, contain the date the invitation was sent and userId and loginEmail of the user who invited this user <br>
	     *         userId 	string userId of the user who invited this user <br>
	     *         loginEmail 	string loginEmail of the user who invited this user <br>
	     *         authenticationType optionnel 	string User authentication type (if not set company default authentication will be used) Values (DEFAULT, RAINBOW, SAML, OIDC) <br>
	     *         authenticationExternalUid optionnel 	string User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType) <br>
	     *         firstLoginDate 	Date-Time Date of first user login (only set the first time user logs in, null if user never logged in) <br>
	     *         lastLoginDate 	Date-Time Date of last user login (defined even if user is logged out) <br>
	     *         loggedSince 	Date-Time Date of last user login (null if user is logged out) <br>
	     *         isTerminated 	boolean Indicates if the Rainbow account of this user has been deleted <br>
	     *         guestMode 	boolean Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. <br>
	     *         timeToLive optionnel 	Number Duration in second to wait before automatically starting a user deletion from the creation date. Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. Value -1 means timeToLive is disable (i.e. user account will not expire). <br>
	     *         userInfo1 optionnel 	string Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
	     *         userInfo2 optionnel 	string 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
	     *         useScreenSharingCustomisation 	string Activate/Deactivate the capability for a user to share a screen. Define if a user has the right to share his screen. <br>
	     *         useScreenSharingCustomisation can be: <br>
	     *            same_than_company: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting. <br>
	     *            enabled: Each user of the company can share his screen. <br>
	     *            disabled: No user of the company can share his screen. <br>
	     *         customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. <br>
	     *         activationCodeGenerationStatus 	string Status the activation code generation done if the activation code generation is successful <br>
	     *         in_progress if the activation code generation failed and the security mechanism is ongoing to try to generate it again every minute Possible values : done, in_progress <br>
	     *         fileSharingCustomisation 	string Activate/Deactivate file sharing capability per user Define if the user can use the file sharing service then, allowed to download and share file. <br>
	     *         FileSharingCustomisation can be: <br>
	     *            same_than_company: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting. <br>
	     *            enabled: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service. <br>
	     *            disabled: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. <br>
	     *         userTitleNameCustomisation 	string Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) Define if the user can change some profile data. <br>
	     *         userTitleNameCustomisation can be: <br>
	     *            same_than_company: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting. <br>
	     *            enabled: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data. <br>
	     *            disabled: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data. <br>
	     *         softphoneOnlyCustomisation 	string Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services but to focus to telephony services Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on. <br>
	     *         softphoneOnlyCustomisation can be: <br>
	     *            same_than_company: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting. <br>
	     *            enabled: The user switch to a softphone mode only. <br>
	     *            disabled: The user can use telephony services, chat, bubbles, channels meeting services and so on. <br>
	     *         useRoomCustomisation 	string Activate/Deactivate the capability for a user to use bubbles. Define if a user can create bubbles or participate in bubbles (chat and web conference). <br>
	     *         useRoomCustomisation can be: <br>
	     *            same_than_company: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting. <br>
	     *            enabled: The user can use bubbles. <br>
	     *            disabled: The user can't use bubbles. <br>
	     *         phoneMeetingCustomisation 	string Activate/Deactivate the capability for a user to use phone meetings (PSTN conference). Define if a user has the right to join phone meetings. <br>
	     *         phoneMeetingCustomisation can be: <br>
	     *            same_than_company: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting. <br>
	     *            enabled: The user can join phone meetings. <br>
	     *            disabled: The user can't join phone meetings. <br>
	     *         useChannelCustomisation 	string Activate/Deactivate the capability for a user to use a channel. Define if a user has the right to create channels or be a member of channels. <br>
	     *         useChannelCustomisation can be: <br>
	     *            same_than_company: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting. <br>
	     *            enabled: The user can use some channels. <br>
	     *            disabled: The user can't use some channel. <br>
	     *         useWebRTCVideoCustomisation 	string Activate/Deactivate the capability for a user to switch to a Web RTC video conversation. Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call). <br>
	     *         useWebRTCVideoCustomisation can be: <br>
	     *            same_than_company: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting. <br>
	     *            enabled: The user can switch to a Web RTC video conversation. <br>
	     *            disabled: The user can't switch to a Web RTC video conversation. <br>
	     *         useWebRTCAudioCustomisation 	string Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation. Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call). <br>
	     *         useWebRTCAudioCustomisation can be: <br>
	     *            same_than_company: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting. <br>
	     *            enabled: The user can switch to a Web RTC audio conversation. <br>
	     *            disabled: The user can't switch to a Web RTC audio conversation. <br>
	     *         instantMessagesCustomisation 	string Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications. <br>
	     *         instantMessagesCustomisation can be: <br>
	     *            same_than_company: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting. <br>
	     *            enabled: The user can use instant messages. <br>
	     *            disabled: The user can't use instant messages. <br>
	     *         userProfileCustomisation 	string Activate/Deactivate the capability for a user to modify his profile. Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName). <br>
	     *         userProfileCustomisation can be: <br>
	     *            same_than_company: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting. <br>
	     *            enabled: The user can modify his profile. <br>
	     *            disabled: The user can't modify his profile. <br>
	     *         fileStorageCustomisation 	string Activate/Deactivate the capability for a user to access to Rainbow file storage.. Define if a user has the right to upload/download/copy or share documents. <br>
	     *         fileStorageCustomisation can be: <br>
	     *            same_than_company: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting. <br>
	     *            enabled: The user can manage and share files. <br>
	     *            disabled: The user can't manage and share files. <br>
	     *         overridePresenceCustomisation 	string Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to change his presence manually or only use automatic states. <br>
	     *         overridePresenceCustomisation can be: <br>
	     *            same_than_company: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting. <br>
	     *            enabled: The user can change his presence. <br>
	     *            disabled: The user can't change his presence. <br>
	     *         changeTelephonyCustomisation 	string Activate/Deactivate the ability for a user to modify telephony settings. Define if a user has the right to modify some telephony settigs like forward activation... <br>
	     *         changeTelephonyCustomisation can be: <br>
	     *            same_than_company: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting. <br>
	     *            enabled: The user can modify telephony settings. <br>
	     *            disabled: The user can't modify telephony settings. <br>
	     *         changeSettingsCustomisation 	string Activate/Deactivate the ability for a user to change all client general settings. <br>
	     *         changeSettingsCustomisation can be: <br>
	     *            same_than_company: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting. <br>
	     *            enabled: The user can change all client general settings. <br>
	     *            disabled: The user can't change any client general setting. <br>
	     *         recordingConversationCustomisation 	string Activate/Deactivate the capability for a user to record a conversation. Define if a user has the right to record a conversation (for P2P and multi-party calls). <br>
	     *         recordingConversationCustomisation can be: <br>
	     *            same_than_company: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting. <br>
	     *            enabled: The user can record a peer to peer or a multi-party call. <br>
	     *            disabled: The user can't record a peer to peer or a multi-party call. <br>
	     *         useGifCustomisation 	string Activate/Deactivate the ability for a user to Use GIFs in conversations. Define if a user has the is allowed to send animated GIFs in conversations <br>
	     *         useGifCustomisation can be: <br>
	     *            same_than_company: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting. <br>
	     *            enabled: The user can send animated GIFs in conversations. <br>
	     *            disabled: The user can't send animated GIFs in conversations. <br>
	     *         fileCopyCustomisation 	string Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space <br>
	     *         fileCopyCustomisation can be: <br>
	     *            same_than_company: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting. <br>
	     *            enabled: The user can make a copy of a file to his personal cloud space. <br>
	     *            disabled: The user can't make a copy of a file to his personal cloud space. <br>
	     *         fileTransferCustomisation 	string Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation. The file cannot be re-shared. <br>
	     *         fileTransferCustomisation can be: <br>
	     *            same_than_company: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting. <br>
	     *            enabled: The user can transfer a file doesn't belong to him. <br>
	     *            disabled: The user can't transfer a file doesn't belong to him. <br>
	     *         forbidFileOwnerChangeCustomisation 	string Activate/Deactivate the capability for a user to loose the ownership on one file.. One user can drop the ownership to another Rainbow user of the same company. <br>
	     *         forbidFileOwnerChangeCustomisation can be: <br>
	     *            same_than_company: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting. <br>
	     *            enabled: The user can't give the ownership of his file. <br>
	     *            disabled: The user can give the ownership of his file. <br>
	     *         useDialOutCustomisation 	string Activate/Deactivate the capability for a user to use dial out in phone meetings. Define if a user is allowed to be called by the Rainbow conference bridge. <br>
	     *         useDialOutCustomisation can be: <br>
	     *            same_than_company: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting. <br>
	     *            enabled: The user can be called by the Rainbow conference bridge. <br>
	     *            disabled: The user can't be called by the Rainbow conference bridge. <br>
	     *         selectedAppCustomisationTemplate 	string To log the last template applied to the user. <br>
	     *      } <br>
	     * @return {Promise<any>}
	     */
	    retrieveAllLdapConnectorUsersData(companyId?: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<any>;
	    /**
	     * @public
	     * @method sendCommandToLdapConnectorUser
	     * @since 2.11.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} ldapId ldap connector unique identifier.
	     * @param {string} command Allows to specify a command to be performed by the ldap connector. Allowed commands are: "manual_synchro", "manual_dry_run", "manual_synchro_directories", "manual_dry_run_directories".
	     * @description
	     *      This API can be used to send a command to a ldap connector user. <br>
	     *      BP Admin and BP Finance users can only control users being in a company linked to their BP company. <br>
	     *      Admin users can only control users being in their own company. (superadmin, organization_admin, company_admin). <br>
	     *
	     * @return {Promise<{Object}>} return -
	     * <br>
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | response Object. |
	     * | status | String | Command operation status message. |
	     * | commandId optionnel | String | Command identifier to retrieve the report (only for "manual\_dry\_run" command). |
	     *
	     */
	    sendCommandToLdapConnectorUser(ldapId: string, command: string): Promise<any>;
	    /**
	     * @public
	     * @method createConfigurationForLdapConnector
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} companyId the id of the company.
	     * @param {string} name name of this configuration.
	     * @param {Object} settings config settings.
	     * @param {string} type specify for which type of synchronisation this config is . Allowed types are: "ldap_config", "ldap_config_directories". Default value : ldap_config
	     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
	     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
	     * @param {Object} settings.company specific settings for the company. Each key represent a setting.
	     * @param {string} settings.company.login login for the ldap server.
	     * @param {string} settings.company.password password for the ldap server.
	     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours.
	     * @param {string} settings.company.url url of the ldap server.
	     * @param {string} settings.company.domain domain of the ldap server.
	     * @param {string} settings.company.baseDN base DN for the ldap server.
	     * @param {boolean} settings.company.activeFlag defines if the synchronization is active, or not.
	     * @param {string} settings.company.nextSynchronization date (ISO 8601 format) which defines when the next synchronization will be performed.
	     * @param {string} settings.company.search_rule filters to use when requesting the ldap server.
	     * @description
	     *      This API allows create configuration for the connector. <br>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
	     *      Users with superadmin, support role can create the connectors configuration from any company. <br>
	     *      Users with bp_admin or bp_finance role can only create the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
	     *      Users with admin role can only create the connectors configuration in companies they can manage. That is to say: <br>
	     *      * an organization_admin can create the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId)
	     *      * a company_admin can only create the connectors configuration in his company.
	     *
	     * @return {Promise<{Object}>} return -
	     * <br>
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Config Object. |
	     * | id  | String | Config unique identifier. |
	     * | type | String | Config type |
	     * | companyId | String | Allows to specify for which company the connectors configuration is done.. |
	     * | settings | Object | config settings |
	     * | massproFromLdap | Object | list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. |
	     * | headerName | String | headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. |
	     * | company | Object | specific settings for the company. Each key represent a setting. |
	     * | login | String | login for the ldap server. |
	     * | password | String | password for the ldap server. |
	     * | synchronizationTimeInterval | Number | time interval between synchronization in hours. |
	     * | url | String | url of the ldap server. |
	     * | baseDN | String | base DN for the ldap server. |
	     * | activeFlag | Boolean | defines if the synchronization is active, or not. |
	     * | nextSynchronization | Date-Time | date (ISO 8601 format) which defines when the next synchronization will be performed. |
	     * | enrollmentEmailEnable | Boolean | defines if an enrollment email is sent to new users |
	     * | synchronisationDiffMode | Boolean | defines if synching only users changed since last sync date |
	     * | search_rule | String | filters to use when requesting the ldap server. |
	     * | lastSynchronization | Date-Time | date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). |
	     * | softwareVersion | String | software Version of the ldap connector (filled by the ldap connector). |
	     *
	     */
	    createConfigurationForLdapConnector(companyId: any, settings: any, name: string, type?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteLdapConnectorConfig
	     * @since 2.9.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} ldapConfigId the Id of the ldap connector to delete.
	     * @description
	     *      This API can be used to delete a ldap connector config. <br>
	     *      <br>
	     *      **BP Admin** and **BP Finance** users can only delete a ldap config being in a company linked to their BP company. <br>
	     *      **Admin** users can only delete ldap config being in their own company. (superadmin, organization_admin, company_admin)  <br>
	     * @return {Promise<{ status : string}>}
	     */
	    deleteLdapConnectorConfig(ldapConfigId: string): Promise<{
	        status: string;
	    }>;
	    /**
	     * @public
	     * @method retrieveLdapConnectorConfig
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} companyId Allows to filter connectors list on the companyId provided in this option. In the case of admin (except superadmin and support roles), provided companyId should correspond to a company visible by logged in user's company (if some of the provided companyId are not visible by logged in user's company, connectors from these companies will not be returned). if not provided, default is admin's company.
	     * @description
	     *      This API allows to retrieve the configuration for the connector. <br>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
	     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br>
	     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
	     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br>
	     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
	     *      a company_admin can only retrieve the connectors configuration in his company. <br>
	     *      return { <br>
	     *         id 	string Config unique identifier. <br>
	     *         type 	string Config type  <br>
	     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
	     *         settings 	Object config settings <br>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
	     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br>
	     *                 login 	string login for the ldap server. <br>
	     *                 password 	string password for the ldap server. <br>
	     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
	     *                 url 	string url of the ldap server. <br>
	     *          } <br>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLdapConnectorConfig(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveLdapConnectorConfigTemplate
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @param {string} type Allows to filter connectors config list on the type provided in this option. Allowed types are: "ldap_template", "ldap_template_directories". Default value : ldap_template
	     * @category AD/LDAP - LDAP APIs to use
	     * @description
	     *      This API allows to retrieve the configuration template for the connector. <br>
	     *      return { <br>
	     *         id 	string Config unique identifier. <br>
	     *         type 	string Config type  <br>
	     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
	     *         settings 	Object config settings <br>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
	     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br>
	     *                 login 	string login for the ldap server. <br>
	     *                 password 	string password for the ldap server. <br>
	     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
	     *                 url 	string url of the ldap server. <br>
	     *          } <br>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLdapConnectorConfigTemplate(type?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveLdapConnectorAllConfigTemplate
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @description
	     *      This API allows to retrieve all the configuration templates for the connector. <br>
	     *      return { <br>
	     *         id 	string Config unique identifier. <br>
	     *         type 	string Config type  <br>
	     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
	     *         settings 	Object config settings <br>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
	     *                 default 	String default field name in ldap. <br>
	     *                 mandatory optionnel 	Boolean specify if field is mandatory. <br>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br>
	     *                  headerName 	Object headerName as specified in the csv templates for the massprovisioning portal. <br>
	     *                  settingName Object name of the setting. Each key represent a setting. As of now list of setting is "login", "password", "synchronizationTimeInterval", "url". This list can evolve. <br>
	     *                  default optionnel 	String 	 <br>
	     *                  default value of the setting.  <br>
	     *                  mandatory optionnel 	String specify if field is mandatory. <br>
	     *          } <br>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLdapConnectorAllConfigTemplates(): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveLdapConnectorAllConfigs
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} companyId Allows to filter connectors config list on the companyId provided in this option. In the case of admin (except superadmin and support roles), provided companyId should correspond to a company visible by logged in user's company (if some of the provided companyId are not visible by logged in user's company, connectors from these companies will not be returned). if not provided, default is admin's company.
	     * @description
	     *      This API allows to retrieve the configurations list for the connector. <br>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
	     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br>
	     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
	     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br>
	     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
	     *      a company_admin can only retrieve the connectors configuration in his company. <br>
	     *      return { <br>
	     *         id 	string Config unique identifier. <br>
	     *         type 	string Config type  <br>
	     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
	     *         settings 	Object config settings <br>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
	     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br>
	     *                 login 	string login for the ldap server. <br>
	     *                 password 	string password for the ldap server. <br>
	     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
	     *                 url 	string url of the ldap server. <br>
	     *                 connectorStatus 	string status of the connector (set by the connector itself). <br>
	     *                 nextSynchronization 	Date-Time date (ISO 8601 format) which defines when the next synchronization will be performed. <br>
	     *                 enrollmentEmailEnable 	boolean defines if an enrollment email is sent to new users <br>
	     *                 synchronisationDiffMode 	boolean defines if synching only users changed since last sync date <br>
	     *                 search_rule 	string filters to use when requesting the ldap server. <br>
	     *                 lastSynchronization 	Date-Time date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). <br>
	     *                 softwareVersion 	string software Version of the ldap connector (filled by the ldap connector). <br>
	     *          } <br>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLdapConnectorAllConfigs(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveLDAPConnectorConfigByLdapConfigId
	     * @since 2.15.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} ldapConfigId Ldap connector unique identifier
	     * @description
	     *      This API allows to retrieve the configuration for the connector with the ldapConfigId. <br>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
	     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br>
	     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
	     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br>
	     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
	     *      a company_admin can only retrieve the connectors configuration in his company. <br>
	     *      return { <br>
	     *         id 	string Config unique identifier. <br>
	     *         type 	string Config type  <br>
	     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
	     *         settings 	Object config settings <br>
	     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
	     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
	     *             company 	Object specific settings for the company. Each key represent a setting. <br>
	     *                 login 	string login for the ldap server. <br>
	     *                 password 	string password for the ldap server. <br>
	     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
	     *                 url 	string url of the ldap server. <br>
	     *                 connectorStatus 	string status of the connector (set by the connector itself). <br>
	     *                 nextSynchronization 	Date-Time date (ISO 8601 format) which defines when the next synchronization will be performed. <br>
	     *                 enrollmentEmailEnable 	boolean defines if an enrollment email is sent to new users <br>
	     *                 synchronisationDiffMode 	boolean defines if synching only users changed since last sync date <br>
	     *                 search_rule 	string filters to use when requesting the ldap server. <br>
	     *                 lastSynchronization 	Date-Time date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). <br>
	     *                 softwareVersion 	string software Version of the ldap connector (filled by the ldap connector). <br>
	     *          } <br>
	     * @return {Promise<{Object}>}
	     */
	    retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateConfigurationForLdapConnector
	     * @since 1.86.0
	     * @instance
	     * @async
	     * @category AD/LDAP - LDAP APIs to use
	     * @param {string} ldapConfigId ldap connector unique identifier
	     * @param {boolean}   [strict=false]      Allows to specify if all the previous fields must be erased or just update/push new fields.
	     * @param {string}    name name of this configuration
	     * @param {Object}    settings      config settings
	     * @param {Object}    settings.massproFromLdap      list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
	     * @param {string}    settings.massproFromLdap.headerName      headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
	     * @param {Object}    settings.company      specific settings for the company. Each key represent a setting.
	     * @param {string}    settings.company.login      login for the ldap server.
	     * @param {string}    settings.company.password      password for the ldap server.
	     * @param {Number}     settings.company.synchronizationTimeInterval      time interval between synchronization in hours.
	     * @param {string}    settings.company.url      url of the ldap server.
	     * @param {string}    settings.company.baseDN      base DN for the ldap server.
	     * @param {boolean}     settings.company.activeFlag      defines if the synchronization is active, or not.
	     * @param {boolean}      settings.company.enrollmentEmailEnable   defines if an enrollment email is sent to new users
	     * @param {boolean}      settings.company.synchronisationDiffMode     defines if  synching only users changed since last sync date
	     * @param {string}    settings.company.nextSynchronization      date (ISO 8601 format) which defines when the next synchronization will be performed.
	     * @param {string}    settings.company.search_rule      filters to use when requesting the ldap server.
	     * @param {string}    settings.company.lastSynchronization      date (ISO 8601 format) of the last performed synchronization, usually set by the AD connector .
	     * @param {string}    settings.company.softwareVersion     Software Version of the AD connector, provisioned by the AD connector
	     * @description
	     *      This API allows update configuration for the connector. <br>
	     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
	     *      Users with superadmin, support role can update the connectors configuration from any company. <br>
	     *      Users with bp_admin or bp_finance role can only update the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
	     *      Users with admin role can only update the connectors configuration in companies they can manage. That is to say: <br>
	     *      an organization_admin can update the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
	     *      a company_admin can only update the connectors configuration in his company. <br>
	     *
	     *      a 'rainbow_onconnectorconfig' event is raised when updated. The parameter configId can be used to retrieve the updated configuration.
	     *
	     * @return {Promise<{Object}>} -
	     * <br>
	     *
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Config Object. |
	     * | id  | string | Config unique identifier. |
	     * | type | string | Config type |
	     * | companyId | string | Allows to specify for which company the connectors configuration is done.. |
	     * | settings | Object | config settings |
	     * | massproFromLdap | Object | list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. |
	     * | headerName | string | headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. |
	     * | company | Object | specific settings for the company. Each key represent a setting. |
	     * | login | string | login for the ldap server. |
	     * | password | string | password for the ldap server. |
	     * | synchronizationTimeInterval | Number | time interval between synchronization in hours. |
	     * | url | string | url of the ldap server. |
	     * | baseDN | string | base DN for the ldap server. |
	     * | activeFlag | boolean | defines if the synchronization is active, or not. |
	     * | nextSynchronization | string | date (ISO 8601 format) which defines when the next synchronization will be performed. |
	     * | enrollmentEmailEnable | boolean | defines if an enrollment email is sent to new users |
	     * | synchronisationDiffMode | boolean | defines if synching only users changed since last sync date |
	     * | search_rule | string | filters to use when requesting the ldap server. |
	     * | lastSynchronization | string | date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). |
	     * | softwareVersion | string | software Version of the ldap connector (filled by the ldap connector). |
	     *
	     */
	    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict: boolean, name: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPbxById
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows administrator to retrieve a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    getCloudPbxById(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCloudPBX
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
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
	     *      This API allows to update a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    updateCloudPBX(systemId: any, barringOptions_permissions: string, barringOptions_restrictions: string, callForwardOptions_externalCallForward: string, customSipHeader_1: string, customSipHeader_2: string, emergencyOptions_callAuthorizationWithSoftPhone: boolean, emergencyOptions_emergencyGroupActivated: boolean, externalTrunkId: string, language: string, name: string, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBX
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to delete a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBX(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPbxs
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @description
	     *      This API allows administrator to retrieve a list of CloudPBXs. <br>
	     * @return {Promise<any>}
	     * @param {number} limit Allow to specify the number of CloudPBXs to retrieve. Default value : 100
	     * @param {number} offset llow to specify the position of first cloudPBX to retrieve (first site if not specified) Warning: if offset > total, no results are returned
	     * @param {string} sortField Sort CloudPBXs list based on the given field. Default value : companyId
	     * @param {number} sortOrder Specify order when sorting CloudPBXs list. Default value : 1. Possible values : -1, 1
	     * @param {string} companyId Allows to filter CloudPBXs list on the siteIds linked to companyIds provided in this option
	     * @param {string} bpId Allows to filter CloudPBXs list on the bpIds provided in this option
	     */
	    getCloudPbxs(limit: number, offset: number, sortField: string, sortOrder: number, companyId: string, bpId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createACloudPBX
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
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
	     *      This API allows to creates a CloudPBX for a given company. <br>
	     * @return {Promise<any>}
	     */
	    createACloudPBX(bpId: string, companyId: string, customSipHeader_1: string, customSipHeader_2: string, externalTrunkId: string, language: string, name: string, noReplyDelay: number, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean, siteId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXCLIPolicyForOutboundCalls
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve the CloudPBX CLI options for outbound calls using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXCLIPolicyForOutboundCalls(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCloudPBXCLIOptionsConfiguration
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {CLOUDPBXCLIOPTIONPOLICY} policy CLI policy to apply. Values : "installation_ddi_number" or "user_ddi_number".
	     * @description
	     *      This API allows to update a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    updateCloudPBXCLIOptionsConfiguration(systemId: string, policy: CLOUDPBXCLIOPTIONPOLICY): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXlanguages
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve a list of languages supported by a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXlanguages(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXDeviceModels
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve a list of device models supported by a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXDeviceModels(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXTrafficBarringOptions
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve a list of traffic barring options supported by a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXTrafficBarringOptions(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXEmergencyNumbersAndEmergencyOptions
	     * @since 2.1.0
	     * @instance
	     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @description
	     *      This API allows to retrieve Emergency Numbers and Emergency Options supported by a CloudPBX using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method CreateCloudPBXSIPDevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} description Description for identifying the device
	     * @param {number} deviceTypeId Device type Identifier - see API GET /cloudpbxs/:id/devicemodels to get the list of supported models for the CloudPBX.
	     * @param {string} macAddress Device mac address - mandatory for SIP deskphone device
	     * @description
	     *      This API allows allows to create a new SIP device into a CloudPBX. This SIP device can then be assigned to an existing subscriber. <br>
	     * @return {Promise<any>}
	     */
	    CreateCloudPBXSIPDevice(systemId: string, description: string, deviceTypeId: string, macAddress: string): Promise<unknown>;
	    /**
	     * @public
	     * @method factoryResetCloudPBXSIPDevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device to be reset
	     * @description
	     *      This API allows to reset a SIP deskphone device to its factory settings.<br>
	     *      Be aware that the device will no longer be operational, and should, after the factory reset, need to be manually configured (e.g. at least auto provisioning Url will need to be set). <br>
	     * @return {Promise<any>}
	     */
	    factoryResetCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSIPDeviceById
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device to get
	     * @description
	     *      This API allows to retrieve a SIP device using the given deviceId.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSIPDeviceById(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBXSIPDevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device to delete
	     * @description
	     *      This API allows to remove a SIP Device from a CloudPBX. To do so, the SIP device must no longer be associated to a subscriber.<br>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateCloudPBXSIPDevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} description new description
	     * @param {string} deviceId Unique identifier of the SIP device to delete
	     * @param {string} macAddress new device mac address
	     * @description
	     *      This API allows to update a SIP device.<br>
	     * @return {Promise<any>}
	     */
	    updateCloudPBXSIPDevice(systemId: string, description: string, deviceId: string, macAddress: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllCloudPBXSIPDevice
	     * @since 2.1.0
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
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @description
	     *      This API allows  to retrieve all SIP devices assigned into a CloudPBX.<br>
	     * @return {Promise<any>}
	     */
	    getAllCloudPBXSIPDevice(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, assigned: boolean, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSIPRegistrationsInformationDevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device for which SIP registrations information should be retrieved.
	     * @description
	     *      This API allows to retrieve SIP registrations information relative to a device.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSIPRegistrationsInformationDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method grantCloudPBXAccessToDebugSession
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device for which the debug session access will be granted.
	     * @param {string} duration Duration, in seconds, of the debug session - Only superadmin can set a debug duration different from the default one (configuration parameter: e.g. 30 minutes)
	     * @description
	     *      This API allows  to grant access to debug session on the given device.<br>
	     *      When debug session is granted on the device, admins can retrieve the admin password of the device, url to access the device admin page and also initiate ssh session with the device. <br>
	     *      A debug session can be terminated by: <br>
	     *      Calling the device revoke API <br>
	     *      After debug session has timed out, a periodic check is performed by the portal to revoke expired debug sessions (periodicity defined by configuration parameter). <br>
	     *
	     *      During debug session, adminUrl and adminPassword of the device can be retrieved by getting device information.  <br>
	     *      Please note that adminUrl could be unreachable depending on network configuration. <br>
	     *      When a debug session is closed, ssh access to the device is deactivated, and the admin password of the device is modified.<br>
	     * @return {Promise<any>}
	     */
	    grantCloudPBXAccessToDebugSession(systemId: string, deviceId: string, duration: string): Promise<unknown>;
	    /**
	     * @public
	     * @method revokeCloudPBXAccessFromDebugSession
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device access will be revoked
	     * @description
	     *      This API allows  to revoke access to debug session on the given device. <br>
	     *      When revoked, the debug session can no longer be used. <br>
	     *      The admin password is no longer visible (changed). <br>
	     * @return {Promise<any>}
	     */
	    revokeCloudPBXAccessFromDebugSession(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method rebootCloudPBXSIPDevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} deviceId Unique identifier of the SIP device access will be revoked
	     * @description
	     *      This API allows  to reboot a SIP deskphone device. <br>
	     * @return {Promise<any>}
	     */
	    rebootCloudPBXSIPDevice(systemId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSubscriber
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id).
	     * @description
	     *      This API allows to get data of a CloudPBX Subscriber.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBXSubscriber
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id).
	     * @description
	     *      This API allows to delete a CloudPBX Subscriber. All its associated SIP devices become free for other subscribers.<br>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBXSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createCloudPBXSubscriberRainbowUser
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} login SIP username (if not provided ; shortNumber is used as SIP username)
	     * @param {string} password SIP password for all associated SIP devices (if not provided ; it will be automatically generated).
	     * Only lowercases, digits, * and # are authorized characters. Minimum length is 8, maximum is 12
	     * @param {string} shortNumber Internal Number of the new CloudPBX Subscriber
	     * @param {string} userId Unique identifier of the associated Rainbow User
	     * @description
	     *      This API allows to create a new CloudPBX Subscriber for a Rainbow User.<br>
	     *      This new subscriber will appear as a new entry into "phoneNumbers" list of the targeted Rainbow User.<br>
	     * @return {Promise<any>}
	     */
	    createCloudPBXSubscriberRainbowUser(systemId: string, login: string, password: string, shortNumber: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSIPdeviceAssignedSubscriber
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber associated to the SIP device to retrieve.
	     * @param {string} deviceId Unique identifier of the SIP device to retrieve
	     * @description
	     *      This API allows to retrieve a given SIP device assigned to a subscriber.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSIPdeviceAssignedSubscriber(systemId: string, phoneNumberId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method removeCloudPBXAssociationSubscriberAndSIPdevice
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber on which the Sip device association must be deleted.
	     * @param {string} deviceId Unique identifier of the SIP device to free
	     * @description
	     *      This API allows to remove association between subscriber and the Sip Device (SIP device becomes available for another subscriber).<br>
	     * @return {Promise<any>}
	     */
	    removeCloudPBXAssociationSubscriberAndSIPdevice(systemId: string, phoneNumberId: string, deviceId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXAllSIPdevicesAssignedSubscriber
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {number} limit Allow to specify the number of SIP Devices to retrieve.
	     * @param {number} offset Allow to specify the position of first SIP Device to retrieve (first one if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort SIP Devices list based on the given field.
	     * @param {number} sortOrder Specify order when sorting SIP Devices list. Valid values are -1, 1.
	     * @param {string} phoneNumberId Allows to filter devices according their phoneNumberId (i.e. subscriber id)
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @description
	     *      This API allows  to retrieve all SIP devices assigned to a subscriber.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXAllSIPdevicesAssignedSubscriber(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXInfoAllRegisteredSIPdevicesSubscriber
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber for which all SIP registrations must be retrieved
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @description
	     *      This API allows to retrieve registrations info on all devices registered for a subscriber.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method assignCloudPBXSIPDeviceToSubscriber
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber on which the SIP device must be assigned
	     * @param {string} deviceId Unique identifier of the device to assign
	     * @param {string} macAddress device mac address
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @description
	     *      This API allows to assign a SIP device to a CloudPBX Subscriber.<br>
	     *      The device must have been previously created.<br>
	     *      Assigning a device to a subscriber can de done by specifying the device Id (preferred) in the request, or the device mac address.<br>
	     *      Assigning a device to a subscriber can de done by specifying the device Id in the request, or the device mac address and deviceType Id.<br>
	     * @return {Promise<any>}
	     */
	    assignCloudPBXSIPDeviceToSubscriber(systemId: string, phoneNumberId: string, deviceId: string, macAddress: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXSubscriberCLIOptions
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id)
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
	     * @description
	     *      This API allows to get CLI policy of a CloudPBX Subscriber.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXSubscriberCLIOptions(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getCloudPBXUnassignedInternalPhonenumbers
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to list all unassigned internal phone numbers for a given CloudPBX system.<br>
	     * @return {Promise<any>}
	     */
	    getCloudPBXUnassignedInternalPhonenumbers(systemId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method listCloudPBXDDINumbersAssociated
	     * @since 2.1.0
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
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to get the list of DDI numbers associated to a CloudPBX.<br>
	     * @return {Promise<any>}
	     */
	    listCloudPBXDDINumbersAssociated(systemId: string, limit: number, offset: number, sortField: string, sortOrder: number, isAssignedToUser: boolean, isAssignedToGroup: boolean, isAssignedToIVR: boolean, isAssignedToAutoAttendant: boolean, isAssigned: boolean): Promise<unknown>;
	    /**
	     * @public
	     * @method createCloudPBXDDINumber
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} number DDI number
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to create a DDI number for a CloudPBX.<br>
	     * @return {Promise<any>}
	     */
	    createCloudPBXDDINumber(systemId: string, number: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCloudPBXDDINumber
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to delete a DDI number for a CloudPBX. <br>
	     *      Note : Default DDI can be deleted only if it is the last DDI of the CloudPBX. <br>
	     * @return {Promise<any>}
	     */
	    deleteCloudPBXDDINumber(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method associateCloudPBXDDINumber
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier
	     * @param {string} userId Rainbow user unique identifier
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to associate a DDI number to a Rainbow user. <br>
	     * @return {Promise<any>}
	     */
	    associateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method disassociateCloudPBXDDINumber
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier.
	     * @param {string} userId Rainbow user unique identifier.
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to disassociate a DDI number from a Rainbow user. <br>
	     * @return {Promise<any>}
	     */
	    disassociateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method setCloudPBXDDIAsdefault
	     * @since 2.1.0
	     * @instance
	     * @param {string} systemId CloudPBX unique identifier.
	     * @param {string} phoneNumberId PhoneNumber unique identifier.
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
	     * @description
	     *      This API allows to set a DDI number as default DDI for a CloudPBX. <br>
	     * @return {Promise<any>}
	     */
	    setCloudPBXDDIAsdefault(systemId: string, phoneNumberId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrieveExternalSIPTrunkById
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @param {string} externalTrunkId External trunk unique identifier
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx SIP Trunk
	     * @description
	     *      This API allows to retrieve an external SIP trunk using its identifier. <br>
	     * @return {Promise<any>}
	     */
	    retrieveExternalSIPTrunkById(externalTrunkId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method retrievelistExternalSIPTrunks
	     * @since 2.1.0
	     * @instance
	     * @async
	     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx SIP Trunk
	     * @param {string} rvcpInstanceId Allows to filter external SIP trunks by RVCP instance identifier. <br>
	     *          This filter allows to load all external SIP trunks in relation with an RVCP Instance. <br>
	     * @param {string} status Allows to filter external SIP trunks by status. <br>
	     *          This filter allows to load all external SIP trunks according to their status. <br>
	     *          Valid values : "new" "active". <br>
	     * @param {string} trunkType Allows to filter external SIP trunks by their type. <br>
	     * @description
	     *      This API allows superadmin or bp_admin to retrieve a list of external SIP trunks. <br>
	     *      bp_admin can list only external SIP trunks he is allowed to use. <br>
	     * @return {Promise<any>}
	     */
	    retrievelistExternalSIPTrunks(rvcpInstanceId: string, status: string, trunkType: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createASite
	     * @since 2.1.1
	     * @instance
	     * @async
	     * @category sites
	     * @param {string} name Site name. <br>
	     *              Valid values : 1..255
	     * @param {string} status Site status. <br>
	     *          Valid values : "active", "alerting", "hold", "terminated". <br>
	     * @param {string} companyId Id of the company from which the site is linked.
	     * @description
	     *      This API allows administrators to create a site for a company they administrate.  <br>
	     * @return {Promise<any>}
	     */
	    createASite(name: string, status: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteSite
	     * @since 2.1.1
	     * @instance
	     * @async
	     * @category sites
	     * @param {string} siteId Site id. <br>
	     * @description
	     *      This API allows administrators to delete a site by id they administrate.  <br>
	     * @return {Promise<any>}
	     */
	    deleteSite(siteId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getSiteData
	     * @since 2.1.1
	     * @instance
	     * @async
	     * @category sites
	     * @param {string} siteId Site id. <br>
	     * @description
	     *      This API allows administrators to get a site data by id they administrate.  <br>
	     * @return {Promise<any>}
	     */
	    getSiteData(siteId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllSites
	     * @since 2.1.1
	     * @instance
	     * @async
	     * @category sites
	     * @param {string} format Allows to retrieve more or less site details in response. <br>
	     * - small: _id, name <br>
	     * - medium: _id, name, status, companyId <br>
	     * - full: all site fields <br>
	     * default : small <br>
	     * Valid values : small, medium, full <br>
	     * @param {number} limit Allow to specify the number of companies to retrieve. (default=100).
	     * @param {number} offset Allow to specify the position of first site to retrieve (first site if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort site list based on the given field. (default="name").
	     * @param {number} sortOrder Specify order when sorting site list. Default values : 1. Valid values : -1, 1.
	     * @param {string} name Allows to filter sites list on field name. <br>
	     * The filtering is case insensitive and on partial name match: all sites containing the provided name value will be returned (whatever the position of the match). <br>
	     * Ex: if filtering is done on sit, sites with the following names are match the filter 'My site', 'Site', 'A site 1', 'Site of company', 'Sit1', 'Sit2', ... <br>
	     * @param {string} companyId
	     * @description
	     *      This API allows administrators to get all sites they administrate.  <br>
	     * @return {Promise<any>}
	     */
	    getAllSites(format: string, limit: number, offset: number, sortField: string, sortOrder: number, name: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateSite
	     * @since 2.1.1
	     * @instance
	     * @category sites
	     * @async
	     * @param {string} siteId Site id. <br>
	     * @param {string} name Site name
	     * @param {string} status Site status. Valid values : "active", "alerting", "hold", "terminated"
	     * @param {string} companyId Id of the company from which the site is linked.
	     * @description
	     *      This API allows administrators to update a given site by id they administrate.  <br>
	     * @return {Promise<any>}
	     */
	    updateSite(siteId: string, name: string, status: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createDirectoryEntry
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} companyId Id of the company the directory is linked to.
	     * @param {string} firstName Contact first Name
	     * @param {string} lastName Contact last Name
	     * @param {string} companyName Company Name of the contact
	     * @param {string} department Contact address: Department
	     * @param {string} street Contact address: Street
	     * @param {string} city Contact address: City
	     * @param {string} state When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY"
	     * @param {string} postalCode Contact address: postal code / ZIP
	     * @param {string} country Contact address: country (ISO 3166-1 alpha3 format)
	     * @param {Array<string>} workPhoneNumbers Work phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} mobilePhoneNumbers Mobile phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} otherPhoneNumbers Other phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {string} jobTitle Contact Job title
	     * @param {string} eMail Contact Email address
	     * @param {Array<string>} tags An Array of free tags <br>
	     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
	     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case). <br>
	     * @param {string} custom1 Custom field 1
	     * @param {string} custom2 Custom field 2
	     * @description
	     *      This API allows administrators to Create a directory entry.  <br>
	     */
	    createDirectoryEntry(companyId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCompanyDirectoryAllEntry
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} companyId Id of the company.
	     * @description
	     *      This API allows administrators  to delete all the entries in the directory of a company they administrate.<br>
	     * @return {Promise<any>}
	     */
	    deleteCompanyDirectoryAllEntry(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteDirectoryEntry
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} entryId Id of the entry.
	     * @description
	     *      This API allows administrators  to delete an entry from the directory of a company they administrate.<br>
	     * @return {Promise<any>}
	     */
	    deleteDirectoryEntry(entryId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getDirectoryEntryData
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} entryId Id of the entry.
	     * @param {string} format Allows to retrieve more or less entry details in response. <br>
	     * - small: id, firstName, lastName  <br>
	     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
	     * - full: all fields. <br>
	     * default : small <br>
	     * Valid values : small, medium, full <br>
	     * @description
	     *      This API allows administrators to get an entry of the directory of a company they administrate.<br>
	     * @return {Promise<any>}
	     */
	    getDirectoryEntryData(entryId: string, format?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getListDirectoryEntriesData
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} companyId Allows to filter the list of directory entries on the companyIds provided in this option
	     * @param {string} organisationIds Allows to filter the list of directory entries on the organisationIds provided in this option
	     * @param {string} name Allows to filter the list of directory entries of user type on the name provided in this option. <br>
	     * - keywords exact match (ex: 'John Doe' find 'John Doe')
	     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
	     * - case insensitive (ex: 'john doe' find 'John Doe')
	     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     * - on only firstname or lastname (ex: 'john' find 'John Doe')
	     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
	     * @param {string} search Allows to filter the list of directory entries by the words provided in this option. <br>
	     * - The query parameter type allows to specify on which type of directory entries the search is performed ('user' (default), 'company', or all entries) - Multi criterion search is only available to users having feature SEARCH_BY_TAGS in their profiles - keywords exact match (ex: 'John Doe' find 'John Doe')
	     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
	     * - case insensitive (ex: 'john doe' find 'John Doe')
	     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     * - multi criterion: fields firstName, lastName, jobTitle,companyName, department and tags.
	     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
	     * @param {string} type Allows to specify on which type of directory entries the multi-criterion search is performed ('user' (default), 'company', or all entries)<br>
	     * This parameter is only used if the query parameter search is also specified, otherwise it is ignored. Default value : user. Possible values : user, company
	     * @param {string} companyName Allows to filter the list of directory entries of company type on the name provided in this option. <br>
	     * - keywords exact match (ex: 'John Doe' find 'John Doe')
	     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
	     * - case insensitive (ex: 'john doe' find 'John Doe')
	     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     * - on only companyName (ex: 'john' find 'John Doe')
	     * @param {string} phoneNumbers Allows to filter the list of directory entries on the number provided in this option. (users and companies type) <br>
	     *     Note the numbers must be in E164 format separated by a space and the character "+" replaced by "%2B". ex. "phoneNumbers=%2B33390676790 %2B33611223344"
	     * @param {Date} fromUpdateDate Allows to filter the list of directory entries from provided date (ISO 8601 format eg: '2019-04-11 16:06:47').
	     * @param {Date} toUpdateDate Allows to filter the list of directory entries until provided date (ISO 8601 format).
	     * @param {string} tags Allows to filter the list of directory entries on the tag(s) provided in this option. <br>
	     *     Only usable by users with admin rights, so that he can list the directory entries to which a given tag is assigned (useful for tag administration). <br>
	     *     Using this parameter, the tags are matched with strict equality (i.e. it is case sensitive and the whole tag must be provided).
	     * @param {string} format Allows to retrieve more or less entry details in response. <br>
	     * - small: id, firstName, lastName  <br>
	     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
	     * - full: all fields. <br>
	     * default : small <br>
	     * Valid values : small, medium, full <br>
	     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first one if not specified) Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort directory list based on the given field. Default value : lastName
	     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1
	     * @param {string} view Precises ios the user would like to consult either his personal directory, his company directory or the both. Default value : all. Possible values : personal, company, all
	     * @description
	     *   This API allows users to get an entry of the directory of a company they administrate.<br>
	     *   superadmin and support can get a directory entry of all companies.<br>
	     *   bp_admin can only get a directory entry of their own companies or their End Customer companies.<br>
	     *   organization_admin can only get a directory entry of the companies under their organization.<br>
	     *   other users can only get a directory entry of their onw companies (and companies visible in their organisation if any). users can get the entries of their own directory too.<br>
	     *   <br>
	     *   name, phoneNumbers, search and tags parameters are exclusives.
	     * @return {Promise<any>}
	     * <br>
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | Data objects |
	     * | id  | string | Directory entry identifier |
	     * | companyId optionnel | string | Id of the company |
	     * | userId optionnel | string | Id of the user |
	     * | type | string | Type of the directory entry<br>* `user` if firstName and/or lastName are filled,<br>* `company` if only companyName is filled (firstName and lastName empty)<br>Possible values : `user`, `company` |
	     * | firstName optionnel | string | Contact First name<br>Ordre de grandeur : `0..255` |
	     * | lastName optionnel | string | Contact Last name<br>Ordre de grandeur : `0..255` |
	     * | companyName optionnel | string | Company Name of the contact<br>Ordre de grandeur : `0..255` |
	     * | department optionnel | string | Contact address: Department<br>Ordre de grandeur : `0..255` |
	     * | street optionnel | string | Contact address: Street<br>Ordre de grandeur : `0..255` |
	     * | city optionnel | string | Contact address: City<br>Ordre de grandeur : `0..255` |
	     * | state optionnel | string | When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY" |
	     * | postalCode optionnel | string | Contact address: postal code / ZIP<br>Ordre de grandeur : `0..64` |
	     * | country optionnel | string | Contact address: country (ISO 3166-1 alpha3 format) |
	     * | workPhoneNumbers optionnel | string\[\] | Work phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
	     * | mobilePhoneNumbers optionnel | string\[\] | Mobile phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
	     * | otherPhoneNumbers optionnel | string\[\] | other phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
	     * | jobTitle optionnel | string | Contact Job title<br>Ordre de grandeur : `0..255` |
	     * | eMail optionnel | string | Contact Email address<br>Ordre de grandeur : `0..255` |
	     * | tags optionnel | string\[\] | An Array of free tags<br>Ordre de grandeur : `1..64` |
	     * | custom1 optionnel | string | Custom field 1<br>Ordre de grandeur : `0..255` |
	     * | custom2 optionnel | string | Custom field 2<br>Ordre de grandeur : `0..255` |
	     *
	     *
	     */
	    getListDirectoryEntriesData(companyId: string, organisationIds: string, name: string, search: string, type: string, companyName: string, phoneNumbers: string, fromUpdateDate: Date, toUpdateDate: Date, tags: string, format?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number, view?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateDirectoryEntry
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} entryId Id of the entry.
	     * @param {string} firstName Contact first Name
	     * @param {string} lastName Contact last Name
	     * @param {string} companyName Company Name of the contact
	     * @param {string} department Contact address: Department
	     * @param {string} street Contact address: Street
	     * @param {string} city Contact address: City
	     * @param {string} state When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY"
	     * @param {string} postalCode Contact address: postal code / ZIP
	     * @param {string} country Contact address: country (ISO 3166-1 alpha3 format)
	     * @param {Array<string>} workPhoneNumbers Work phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} mobilePhoneNumbers Mobile phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {Array<string>} otherPhoneNumbers Other phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
	     * @param {string} jobTitle Contact Job title
	     * @param {string} eMail Contact Email address
	     * @param {Array<string>} tags An Array of free tags <br>
	     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
	     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case).
	     * @param {string} custom1 Custom field 1
	     * @param {string} custom2 Custom field 2
	     * @description
	     *      This API allows administrators to update an entry of the directory of a company they administrate.<br>
	     * @return {Promise<any>}
	     */
	    updateDirectoryEntry(entryId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string): Promise<unknown>;
	    /********************************************************/
	    /** EXPORT CSV                                         **/
	    /********************************************************/
	    getAllDirectoryContacts(companyId: any): Promise<unknown>;
	    buildDirectoryCsvBlob(companyId: any): Promise<unknown>;
	    /**
	     * @public
	     * @method exportDirectoryCsvFile
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} companyId The company id of the directory to export.<br>
	     * @param {string} filePath The folder where the directory will be exported.
	     * @description
	     *      This API allows administrators to export the directory in a CSV file.<br>
	     * @return {Promise<any>} If it succeed then it returns the file full path of the exported data. If it failed then it return the error.
	     */
	    exportDirectoryCsvFile(companyId: string, filePath: string): Promise<unknown>;
	    /**
	     * @public
	     * @method ImportDirectoryCsvFile
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory
	     * @param {string} companyId The company id of the directory to export.<br>
	     * @param {string} fileFullPath The full file path to import.
	     * @param {string} label The label used for the import.
	     * @description
	     *      This API allows administrators to import the directory from a CSV file.<br>
	     * @return {Promise<any>} .
	     */
	    ImportDirectoryCsvFile(companyId: string, fileFullPath: string, label: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllTagsAssignedToDirectoryEntries
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory tags
	     * @param {string} companyId Allows to list the tags for the directory entries of the companyIds provided in this option. <br>
	     * If companyId is not provided, the tags are listed for all the directory entries of the companies managed by the logged in administrator.
	     * @description
	     *      This API allows administrators to list all the tags being assigned to the directory entries of the companies managed by the administrator.<br>
	     * @return {Promise<any>}
	     */
	    getAllTagsAssignedToDirectoryEntries(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method removeTagFromAllDirectoryEntries
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory tags
	     * @param {string} companyId Allows to list the tags for the directory entries of the companyIds provided in this option. <br>
	     * If companyId is not provided, the tags are listed for all the directory entries of the companies managed by the logged in administrator.<br>
	     * @param {string} tag tag to remove.
	     * @description
	     *      This API allows administrators to remove a tag being assigned to some directory entries of the companies managed by the administrator.<br>
	     *      The parameter companyId can be used to limit the removal of the tag on the directory entries of the specified company(ies).<br>
	     * @return {Promise<any>}
	     */
	    removeTagFromAllDirectoryEntries(companyId: string, tag: string): Promise<unknown>;
	    /**
	     * @public
	     * @method renameTagForAllAssignedDirectoryEntries
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory tags
	     * @param {string} companyId Allows to rename a tag for the directory entries of the companyIds provided in this option.<br>
	     * If companyId is not provided, the tag is renamed from all the directory entries of all the companies managed by the logged in administrator.<br>
	     * @param {string} tag tag to rename.
	     * @param {string} newTagName New tag name.
	     * @description
	     *      This API allows administrators to rename a tag being assigned to some directory entries of the companies managed by the administrator.<br>
	     *      The parameter companyId can be used to limit the renaming of the tag on the directory entries of the specified company(ies).<br>
	     * @return {Promise<any>}
	     */
	    renameTagForAllAssignedDirectoryEntries(tag: string, companyId: string, newTagName: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getStatsRegardingTagsOfDirectoryEntries
	     * @since 2.2.0
	     * @instance
	     * @async
	     * @category Rainbow Company Directory portal - directory tags
	     * @param {string} companyId Allows to compute the tags statistics for the directory entries of the companyIds provided in this option.<br>
	     * @description
	     *      This API can be used to list all the tags being assigned to the directory entries of the companies managed by the administrator, with the number of directory entries for each tags.<br>
	     * @return {Promise<any>}
	     */
	    getStatsRegardingTagsOfDirectoryEntries(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createAClientVersion
	     * @since 2.5.0
	     * @instance
	     * @param {string} id Unique identifier of the application to which the client version refer. Default value is the AppId provided to login the SDK.
	     * @param {string} version App version
	     * @async
	     * @category Clients Versions
	     * @description
	     *      This API can be used to define the minimal required version for a given client application.<br>
	     *      When a minimal required version is defined for a client application, if a user using an older version of this application tries to login to Rainbow, the login is forbidden with a specific error code (403020). <br>
	     *      In that case, the client application can show an error message to the user requesting him to update his application.<br>
	     *      To be noted that the application must provide the header x-rainbow-client-version with its current version so that this check can be performed.<br>
	     *      Users with superadmin role can define the minimal required version for any client applications.<br>
	     * @return {Promise<any>}
	     */
	    createAClientVersion(id: string, version: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAClientVersion
	     * @since 2.5.0
	     * @instance
	     * @param {string} clientId Application unique identifier to which the client version refer
	     * @async
	     * @category Clients Versions
	     * @description
	     *      This API can be used to delete the minimal required version defined for a given client application.<br>
	     *      When no minimal required version is defined for a client application, this application will allow to log users in Rainbow whatever their version.<br>
	     *      Users with superadmin role can delete the minimal required version for any client applications.<br>
	     * @return {Promise<any>}
	     */
	    deleteAClientVersion(clientId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAClientVersionData
	     * @since 2.5.0
	     * @instance
	     * @param {string} clientId Application unique identifier to which the client version refer
	     * @async
	     * @category Clients Versions
	     * @description
	     *     This API can be used to get the minimal required version defined for a given client application (if any, otherwise a 404 http error is returned).<br>
	     *     Users with superadmin role can retrieve the minimal required version for all client applications.<br>
	     * @return {Promise<any>}
	     */
	    getAClientVersionData(clientId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getAllClientsVersions
	     * @since 2.5.0
	     * @instance
	     * @async
	     * @category Clients Versions
	     * @param {string} name Allows to filter clients versions list on field name.
	     * @param {string} typeClient Allows to filter clients versions list on field type.
	     * @param {number} limit Allow to specify the number of clients versions to retrieve. Default value : 100.
	     * @param {number} offset Allow to specify the position of first client version to retrieve (first client version if not specified). Warning: if offset > total, no results are returned.
	     * @param {string} sortField Sort clients versions list based on the given field. Default value : "name"
	     * @param {number} sortOrder Specify order when sorting clients versions list. Default value : 1. Authorized values : -1, 1.
	     * @description
	     *      This API can be used to get the minimal required versions defined for the client applications.<br>
	     *      Users with superadmin role can retrieve the minimal required version for all client applications.<br>
	     * @return {Promise<any>}
	     */
	    getAllClientsVersions(name?: string, typeClient?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number): Promise<unknown>;
	    /**
	     * @public
	     * @method updateAClientVersion
	     * @since 2.5.0
	     * @instance
	     * @param {string} clientId Application unique identifier to which the client version refer
	     * @param {string} version App version
	     * @async
	     * @category Clients Versions
	     * @description
	     *     This API can be used to get the minimal required version defined for a given client application (if any, otherwise a 404 http error is returned).<br>
	     *     Users with superadmin role can retrieve the minimal required version for all client applications.<br>
	     * @return {Promise<any>}
	     */
	    updateAClientVersion(clientId: string, version: string): Promise<unknown>;
	}
	export { AdminService as AdminService, OFFERTYPES, CLOUDPBXCLIOPTIONPOLICY };

}
declare module 'lib/common/StateManager' {
	import { TimeOutManager } from 'lib/common/TimeOutManager';
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
	    private timeOutManager;
	    constructor(_eventEmitter: any, logger: any, timeOutManager: TimeOutManager);
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
	    init(useRestAtStartup: boolean): Promise<void>;
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
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Get all calls log history for the connected user <br>
	     * @return {CallLog[]} An array of call log entry
	     */
	    getAll(): any[];
	    /**
	     * @public
	     * @method getMissedCallLogCounter
	     * @instance
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Get the number of call missed (state === "missed" && direction === "incoming") <br>
	     * @return {Number} The number of call missed
	     */
	    getMissedCallLogCounter(): number;
	    /**
	     * @public
	     * @method deleteOneCallLog
	     * @instance
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Delete a call log from it's id<br>
	     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br>
	     * @param {string} id The call log id to remove
	     * @return Nothing
	     */
	    deleteOneCallLog(id: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteCallLogsForContact
	     * @instance
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Delete all calls log items associated to a contact's given jid<br>
	     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br>
	     * @param {string} jid The call log id to remove
	     * @return Nothing
	     */
	    deleteCallLogsForContact(jid: any): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteAllCallLogs
	     * @instance
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Delete all call logs history<br>
	     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br>
	     * @return Nothing
	     */
	    deleteAllCallLogs(): Promise<any>;
	    /**
	     * @public
	     * @method markCallLogAsRead
	     * @instance
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Mark a call log item as read<br>
	     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished <br>
	     * @param {string} id The call log id
	     * @return Nothing
	     */
	    markCallLogAsRead(id: any): Promise<unknown>;
	    /**
	     * @public
	     * @method markAllCallsLogsAsRead
	     * @instance
	     * @category CallLog MANAGEMENT
	     * @description
	     *    Mark all call log items as read<br>
	     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished <br>
	     * @return Nothing
	     */
	    markAllCallsLogsAsRead(): Promise<void>;
	    /**
	     * @public
	     * @method isInitialized
	     * @instance
	     * @category CallLog INITIALISATION
	     * @description
	     *    Check if the call log history has been received from Rainbow <br>
	     *    A false answer means that the call logs have not yet been retrieved from the server. <br>
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
	    sdkPublicEventsName: string[];
	    waitBeforeBubblePresenceSend: boolean;
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
	     * @method removeListener
	     * @public
	     * @memberof Events
	     * @instance
	     * @param {string} eventName The event name to unsubscribe
	     * @param {function} listener The listener called when the even is fired
	     * @return {Object} The events instance to be able to remove a subscription from chain.
	     * @description
	     *      Unsubscribe to an event
	     */
	    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter;
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
	    _restOptions: any;
	    _proxyoptions: any;
	    _imOptions: any;
	    _applicationOptions: any;
	    _withXMPP: any;
	    _withS2S: any;
	    _CLIMode: any;
	    _servicesToStart: any;
	    private _testOutdatedVersion;
	    private _testDNSentry;
	    private _httpoverxmppserver;
	    private _concurrentRequests;
	    private _intervalBetweenCleanMemoryCache;
	    private _requestsRate;
	    constructor(_options: any, _logger: Logger);
	    parse(): void;
	    get testOutdatedVersion(): boolean;
	    set testOutdatedVersion(value: boolean);
	    get testDNSentry(): boolean;
	    set testDNSentry(value: boolean);
	    get testhttpoverxmppserver(): boolean;
	    set testhttpoverxmppserver(value: boolean);
	    get intervalBetweenCleanMemoryCache(): number;
	    set intervalBetweenCleanMemoryCache(value: number);
	    get servicesToStart(): any;
	    get httpOptions(): any;
	    get xmppOptions(): any;
	    get s2sOptions(): any;
	    get restOptions(): any;
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
	    _gettestDNSentry(): any;
	    _gethttpoverxmppserver(): any;
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
	        raiseLowLevelXmppInEvent: boolean;
	        raiseLowLevelXmppOutReq: boolean;
	        maxIdleTimer: number;
	        maxPingAnswerTimer: number;
	        xmppRessourceName: any;
	    };
	    _getS2SOptions(): {
	        hostCallback: string;
	        locallistenningport: string;
	    };
	    _getRESTOptions(): {
	        useRestAtStartup: boolean;
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
	        enableCarbon: boolean;
	        enablesendurgentpushmessages: boolean;
	        useMessageEditionAndDeletionV2: boolean;
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
	    init(useRestAtStartup: boolean): Promise<void>;
	    private attachHandlers;
	    reconnect(): Promise<void>;
	    /**
	     * @private
	     * @method markAlertMessageAsReceived
	     * @instance
	     * @async
	     * @category Mark as Received / Read
	     * @param {string} jid The Jid of the sender</param>
	     * @param {string} messageXmppId the Xmpp Id of the alert message</param>
	     * @description
	     *    Mark as Received the specified alert message   <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    markAlertMessageAsReceived(jid: string, messageXmppId: string): Promise<any>;
	    /**
	     * @public
	     * @method markAlertMessageAsRead
	     * @instance
	     * @async
	     * @category Mark as Received / Read
	     * @param {string} jid The Jid of the sender
	     * @param {string} messageXmppId the Xmpp Id of the alert message
	     * @description
	     *    Mark as Read the specified alert message   <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    markAlertMessageAsRead(jid: string, messageXmppId: string): Promise<any>;
	    /**
	     * @public
	     * @method createDevice
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {AlertDevice} device Device to create.
	     * @description
	     *    Create a device which can receive Alerts(notifications) from the server   <br>
	     *    AlertDevice.jid_im cannot be specified, it's always the Jid of the current user. <br>
	     *    if AlertDevice.jid_resource cannot be specified, it's always the Jid_resource of the current user. <br>
	     *    if AlertDevice.type is not specified, automatically it's set to "desktop" <br>
	     * @return {Promise<AlertDevice>} the result of the operation.
	     
	     */
	    createDevice(device: AlertDevice): Promise<AlertDevice>;
	    /**
	     * @public
	     * @method updateDevice
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {AlertDevice} device Device to Update.
	     * @description
	     *    Update a device which can receive Alerts(notifications) from the server <br>
	     *    AlertDevice.CompanyId cannot be specified, it's always the Compnay of the current user <br>
	     *    AlertDevice.Jid_im cannot be specified, it's always the Jid of the current user: Contacts.GetCurrentContactJid() <br>
	     *    AlertDevice.Jid_resource cannot be specified, it's always the Jid_resource of the current user: Application.GetResourceId() <br>
	     *    if AlertDevice.Type is not specified, automatically it's set to "desktop"     <br>
	     * @return {Promise<AlertDevice>} the result of the operation.   <br>
	     
	     */
	    updateDevice(device: AlertDevice): Promise<AlertDevice>;
	    private createOrUpdateDevice;
	    /**
	     * @public
	     * @method deleteDevice
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {AlertDevice} device Device to delete.
	     * @description
	     *    Delete a device (using its id) <br>
	     * @return {Promise<AlertDevice>} the result of the operation.
	     
	     */
	    deleteDevice(device: AlertDevice): Promise<AlertDevice>;
	    /**
	     * @public
	     * @method getDevice
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {string} deviceId Id of the device.
	     * @description
	     *    Get a device using its Id <br>
	     * @return {Promise<AlertDevice>} the result of the operation.
	     
	     */
	    getDevice(deviceId: string): Promise<AlertDevice>;
	    /**
	     * @public
	     * @method getDevices
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {string} companyId Allows to filter device list on the companyId provided in this option. (optional) If companyId is not provided, the devices linked to all the companies that the administrator manage are returned.
	     * @param {string} userId Allows to filter device list on the userId provided in this option. (optional) If the user has no admin rights, this filter is forced to the logged in user's id (i.e. the user can only list is own devices).
	     * @param {string} deviceName Allows to filter device list on the name provided in this option. (optional) The filtering is case insensitive and on partial name match: all devices containing the provided name value will be returned(whatever the position of the match). Ex: if filtering is done on My, devices with the following names are match the filter 'My device', 'My phone', 'This is my device', ...
	     * @param {string} type Allows to filter device list on the type provided in this option. (optional, exact match, case sensitive).
	     * @param {string} tag Allows to filter device list on the tag provided in this option. (optional, exact match, case sensitive).
	     * @param {number} offset Allow to specify the position of first device to retrieve (default value is 0 for the first device). Warning: if offset > total, no results are returned.
	     * @param {number} limit Allow to specify the number of devices to retrieve.
	     * @description
	     *    Get list of devices   <br>
	     * @return {Promise<AlertDevicesData>} the result of the operation.
	     
	     */
	    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset?: number, limit?: number): Promise<AlertDevicesData>;
	    /**
	     * @public
	     * @method getDevicesTags
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {string} companyId Allows to list the tags set for devices associated to the companyIds provided in this option. (optional) If companyId is not provided, the tags being set for devices linked to all the companies that the administrator manage are returned.
	     * @description
	     *    Get list of all tags being assigned to devices of the compagnies managed by the administrator <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    getDevicesTags(companyId: string): Promise<any>;
	    /**
	     * @public
	     * @method renameDevicesTags
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. <br>
	     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
	     * @param {string} newTagName New tag name. (Body Parameters)
	     * @description
	     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    renameDevicesTags(newTagName: string, tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteDevicesTags
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {string} tag 	tag to rename.
	     * @param {string} companyId Allows to remove a tag from the devices being in the companyIds provided in this option.. <br>
	     * If companyId is not provided, the tag is deleted from all the devices linked to all the companies that the administrator manage.
	     * @description
	     * This API can be used to remove a tag being assigned to some devices of the companies managed by the administrator.
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    deleteDevicesTags(tag: string, companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getstatsTags
	     * @instance
	     * @async
	     * @category DEVICE
	     * @param {string} companyId Allows to compute the tags statistics for the devices associated to the companyIds provided in this option.  <br>
	     * if companyId is not provided, the tags statistics are computed for all the devices being in all the companies managed by the logged in administrator.
	     * @description
	     * This API can be used to list all the tags being assigned to the devices of the companies managed by the administrator, with the number of devices for each tags.
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    getstatsTags(companyId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method createTemplate
	     * @instance
	     * @async
	     * @category TEMPLATE
	     * @param {AlertTemplate} template Template to create.
	     * @description
	     *    Create a template <br>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     
	     */
	    createTemplate(template: AlertTemplate): Promise<AlertTemplate>;
	    /**
	     * @public
	     * @method updateTemplate
	     * @instance
	     * @async
	     * @category TEMPLATE
	     * @param {AlertTemplate} template Template to Update.
	     * @description
	     *    Update a template  <br>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     
	     */
	    updateTemplate(template: AlertTemplate): Promise<AlertTemplate>;
	    private createOrUpdateTemplate;
	    /**
	     * @public
	     * @method deleteTemplate
	     * @instance
	     * @async
	     * @category TEMPLATE
	     * @param {AlertTemplate} template Template to Delete.
	     * @description
	     *    Delete a template <br>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     
	     */
	    deleteTemplate(template: AlertTemplate): Promise<AlertTemplate>;
	    /**
	     * @public
	     * @method getTemplate
	     * @instance
	     * @async
	     * @category TEMPLATE
	     * @param {string} templateId Id of the template.
	     * @description
	     *    Get an template by id <br>
	     * @return {Promise<AlertTemplate>} the result of the operation.
	     
	     */
	    getTemplate(templateId: string): Promise<AlertTemplate>;
	    /**
	     * @public
	     * @method getTemplates
	     * @instance
	     * @async
	     * @category TEMPLATE
	     * @param {string} companyId Id of the company (optional).
	     * @param {number} offset Offset to use to retrieve templates - if offset > total, no result is returned.
	     * @param {number} limit Limit of templates to retrieve (100 by default).
	     * @description
	     *    Get templates <br>
	     * @return {Promise<AlertTemplatesData>} the result of the operation.
	     
	     */
	    getTemplates(companyId: string, offset?: number, limit?: number): Promise<AlertTemplatesData>;
	    /**
	     * @public
	     * @method createFilter
	     * @instance
	     * @async
	     * @category FILTERS
	     * @param {AlertFilter} filter Filter to create.
	     * @description
	     *    Create a filter <br>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     
	     */
	    createFilter(filter: AlertFilter): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method updateFilter
	     * @instance
	     * @async
	     * @category FILTERS
	     * @param {AlertFilter} filter Filter to Update.
	     * @description
	     *    Update a filter <br>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     
	     */
	    updateFilter(filter: AlertFilter): Promise<AlertFilter>;
	    createOrUpdateFilter(create: boolean, filter: AlertFilter): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method deleteFilter
	     * @instance
	     * @async
	     * @category FILTERS
	     * @param {AlertFilter} filter Filter to Delete.
	     * @description
	     *    Delete a filter <br>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     
	     */
	    deleteFilter(filter: AlertFilter): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method getFilter
	     * @instance
	     * @async
	     * @category FILTERS
	     * @param {string} filterId Id of the Filter.
	     * @description
	     *    Get an filter by id <br>
	     * @return {Promise<AlertFilter>} the result of the operation.
	     
	     */
	    getFilter(filterId: string): Promise<AlertFilter>;
	    /**
	     * @public
	     * @method getFilters
	     * @instance
	     * @async
	     * @category FILTERS
	     * @param {number} offset Offset to use to retrieve filters - if offset > total, no result is returned.
	     * @param {number} limit Limit of filters to retrieve (100 by default).
	     * @description
	     *    Get filters : have required role(s) superadmin, admin <br>
	     * @return {Promise<AlertFiltersData>} the result of the operation.
	     
	     */
	    getFilters(offset?: number, limit?: number): Promise<AlertFiltersData>;
	    /**
	     * @public
	     * @method createAlert
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {Alert} alert Alert to send.
	     * @description
	     *    To create an alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future). <br>
	     *    The alert will be received by devices according the filter id and the company id used.   <br>
	     *    The content of the alert is based on the template id.   <br>
	     * @return {Promise<Alert>} the result of the operation.
	     */
	    createAlert(alert: Alert): Promise<Alert>;
	    /**
	     * @public
	     * @method updateAlert
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {Alert} alert Alert to update.
	     * @description
	     *    To update an existing alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future). <br>
	     *    The alert will be received by devices according the filter id and the company id used.   <br>
	     *    The content of the alert is based on the template id.   <br>
	     *    Note : if no expirationDate is provided, then the validity is one day from the API call. <br>
	     * @return {Promise<Alert>} the result of the operation.
	     
	     */
	    updateAlert(alert: Alert): Promise<Alert>;
	    createOrUpdateAlert(create: boolean, alert: Alert): Promise<Alert>;
	    /**
	     * @public
	     * @method deleteAlert
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {Alert} alert Alert to Delete.
	     * @description
	     *    Delete an alert   <br>
	     *    All the data related to this notification are deleted, including the reports <br>
	     * @return {Promise<Alert>} the result of the operation.
	     
	     */
	    deleteAlert(alert: Alert): Promise<Alert>;
	    /**
	     * @public
	     * @method getAlert
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Get an alert by id <br>
	     * @return {Promise<Alert>} the result of the operation.
	     
	     */
	    getAlert(alertId: string): Promise<Alert>;
	    /**
	     * @public
	     * @method getAlerts
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {number} offset Offset to use to retrieve Alerts - if offset > total, no result is returned.
	     * @param {number} limit Limit of Alerts to retrieve (100 by default).
	     * @description
	     *    Get alerts : required role(s) superadmin,support,admin <br>
	     * @return {Promise<AlertsData>} the result of the operation.
	     
	     */
	    getAlerts(offset?: number, limit?: number): Promise<AlertsData>;
	    /**
	     * @public
	     * @method sendAlertFeedback
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {string} deviceId Id of the device.
	     * @param {string} alertId Id of the alert.
	     * @param {string} answerId Id of the answer.
	     * @description
	     *    To send a feedback from an alert.   <br>
	     *    To be used by end-user who has received the alert   <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    sendAlertFeedback(deviceId: string, alertId: string, answerId: string): Promise<any>;
	    /**
	     * @public
	     * @method getAlertFeedbackSentForANotificationMessage
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {string} notificationHistoryId notification history unique identifier. notificationHistoryId corresponds to the id in the history Array of the messages sent for the related notification..
	     * @description
	     *    This API allows to list the feedback sent by the devices for a given notification message (identified by its notification history's id). <br>
	     * @return {Promise<any>} the result of the operation.
	     * {
	     * fromCreationDate optionnel 	Date-Time Allows to filter feedback submitted from provided date (ISO 8601 format). <br>
	     * toCreationDate optionnel 	Date-Time Allows to filter feedback submitted until provided date (ISO 8601 format). <br>
	     * format optionnel 	String Allows to retrieve more or less feedback details in response. <br>
	     * - small: id notificationId notificationHistoryId device.id creationDate <br>
	     * - medium: id notificationId notificationHistoryId device.id device.name creationDate data <br>
	     * - full: id notificationId companyId notificationHistoryId device.id device.name device.type device.userId device.jid_im device.jid_resource creationDate data (default value : small. Possible values : small, medium, full) <br>
	     * limit optionnel 	Number Allow to specify the number of feedback to retrieve. (default value : 100) <br>
	     * offset optionnel 	Number Allow to specify the position of first feedback to retrieve (first feedback if not specified). Warning: if offset > total, no results are returned. (default value : 0) <br>
	     * sortField optionnel 	String Sort feedback list based on the creationDate field (date when the feedback submitted by the device has been received by Rainbow servers). (default value : creationDate. Possible values : creationDate) <br>
	     * sortOrder optionnel 	Number Specify order when sorting feedback list. (default value : 1. Possible values : -1, 1) <br>
	     * }
	     
	     */
	    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string): Promise<any>;
	    /**
	     * @public
	     * @method getAlertFeedbackSentForAnAlert
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    This API allows to list the feedback sent by the devices for a given notification. <br>
	     * @return {Promise<any>} the result of the operation.
	     * {
	     * fromCreationDate optionnel 	Date-Time Allows to filter feedback submitted from provided date (ISO 8601 format). <br>
	     * toCreationDate optionnel 	Date-Time Allows to filter feedback submitted until provided date (ISO 8601 format). <br>
	     * format optionnel 	String Allows to retrieve more or less feedback details in response. <br>
	     * - small: id notificationId notificationHistoryId device.id creationDate <br>
	     * - medium: id notificationId notificationHistoryId device.id device.name creationDate data <br>
	     * - full: id notificationId companyId notificationHistoryId device.id device.name device.type device.userId device.jid_im device.jid_resource creationDate data (default value : small. Possible values : small, medium, full) <br>
	     * limit optionnel 	Number Allow to specify the number of feedback to retrieve. (default value : 100) <br>
	     * offset optionnel 	Number Allow to specify the position of first feedback to retrieve (first feedback if not specified). Warning: if offset > total, no results are returned. (default value : 0) <br>
	     * sortField optionnel 	String Sort feedback list based on the creationDate field (date when the feedback submitted by the device has been received by Rainbow servers). (default value : creationDate. Possible values : creationDate) <br>
	     * sortOrder optionnel 	Number Specify order when sorting feedback list. (default value : 1. Possible values : -1, 1) <br>
	     * }
	     
	     */
	    getAlertFeedbackSentForAnAlert(alertId: string): Promise<any>;
	    /**
	     * @public
	     * @method getAlertStatsFeedbackSentForANotificationMessage
	     * @instance
	     * @async
	     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
	     * @param {string} notificationHistoryId notification history unique identifier. notificationHistoryId corresponds to the id in the history Array of the messages sent for the related notification.
	     * @description
	     *    This API can be used to list all distinct feedback data submitted by the devices for a given notification message (identified by its notification history's id), with the number of devices for each distinct submitted feedback data. <br>
	     * @return {Promise<any>} the result of the operation.
	     * {
	     *   stats 	Object[] List of feedback data submitted by the devices for this given notification message <br>
	     *      data 	String data submitted by the devices <br>
	     *      count 	String Number of devices having submitted this given data <br>
	     * }
	     
	     */
	    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string): Promise<any>;
	    /**
	     * @public
	     * @method getReportSummary
	     * @instance
	     * @async
	     * @category REPORTS
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Allow to retrieve the list of summary reports of an alert (initial alert plus alerts update if any). <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    getReportSummary(alertId: string): Promise<any>;
	    /**
	     * @public
	     * @method getReportDetails
	     * @instance
	     * @async
	     * @category REPORTS
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Allow to retrieve detail the list of detail reports of a alert (initial alert plus alerts update if any). <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    getReportDetails(alertId: string): Promise<any>;
	    /**
	     * @public
	     * @method getReportComplete
	     * @instance
	     * @async
	     * @category REPORTS
	     * @param {string} alertId Id of the alert.
	     * @description
	     *    Allows to get the fileDescriptor storing the detailed CSV report of the notification. <br>
	     * <br>
	     *  The detailed CSV report is generated when one of the APIs getReportSummary or GET getReportDetails is called while the state of the notification message process has reached a final state: <br>
	     * <br>
	     *  completed: all the devices targeted by the notification have been notified and have acknowledged the reception of the message, <br>
	     *  expired: some devices targeted by the notification haven't acknowledged the reception of the message but the notification expiration date has been reached, <br>
	     *  cancelled: some devices targeted by the notification haven't acknowledged the reception of the message but the notification status has been set to terminated.<br>
	     * <br>
	     *  The generated detailed CSV report is stored in Rainbow filestorage backend. The fileDescriptor identifier returned by this API can then be used to download it using the Rainbow filestorage API GET /api/rainbow/fileserver/v1.0/files/:fileId <br>
	     *  The detailed CSV report contains the following columns: <br>
	     *  DeviceName,DeviceID,Domain_Username,IpAddress,MacAddress,sent,received,read,feedback,notificationId. <br>
	     * @return {Promise<any>} the result of the operation.
	     
	     */
	    getReportComplete(alertId: string): Promise<any>;
	}
	export { AlertsService };

}
declare module 'lib/common/models/webinar' {
	export {};
	import { Subject, Subscription } from 'rxjs';
	import { Contact } from 'lib/common/models/Contact'; class WebinarSessionParticipant {
	    id: string;
	    contact: Contact;
	    activeSpeaker: boolean;
	    mute: boolean;
	    onStage: boolean;
	    sharingOnStage: boolean;
	    searchString: string;
	    role: string;
	    raiseHand: boolean;
	    audioVideoSession: any;
	    originalAudioVideoStream: any;
	    audioVideoSubStreamLevel: number;
	    audioVideoAudioElement: any;
	    sharingSession: any;
	    sharingStream: any;
	    sharingAudioElement: any;
	    medias: any;
	    rxSubject: Subject<any>;
	    subStreamLevel: number;
	    static create(id: string): WebinarSessionParticipant;
	    constructor(id: string);
	} class WebinarSession {
	    jingleJid: string;
	    activeSpeakerId: string;
	    localParticipant: WebinarSessionParticipant;
	    speakerParticipants: WebinarSessionParticipant[];
	    attendeeParticipants: WebinarSessionParticipant[];
	    raiseHandAttendeeParticipants: WebinarSessionParticipant[];
	    masterMedia: string;
	    static create(): WebinarSession;
	    getParticipantById(participantId: string): WebinarSessionParticipant;
	    addOrUpdateParticipant(participant: WebinarSessionParticipant): void;
	    removeParticipant(participantId: string): void;
	} class WebinarParticipant {
	    email: string;
	    lastName: string;
	    firstName: string;
	    company: string;
	    jobTitle: string;
	    state: string;
	    userId: string;
	    lastAvatarUpdateDate: string;
	    country: string;
	    static create(): WebinarParticipant;
	    getData(): string;
	} class WebinarCSVStatus {
	    errorDetails: string;
	    okCount: number;
	    errorCount: number;
	    errorReport: any;
	    static create(): WebinarCSVStatus;
	} class Webinar {
	    id: string;
	    name: string;
	    subject: string;
	    webinarStartDate: string;
	    webinarEndDate: string;
	    waitingRoomStartDate: string;
	    timeZone: string;
	    roomId: string;
	    roomModeratorsChatId: string;
	    room: any;
	    practiceRoom: any;
	    organizers: any[];
	    speakers: any[];
	    participants: WebinarParticipant[];
	    pendingParticipantNumber: number;
	    acceptedParticipantNumber: number;
	    rejectedParticipantNumber: number;
	    color: string;
	    creatorId: string;
	    isCreator: boolean;
	    isOrganizer: boolean;
	    isSpeaker: boolean;
	    isAttendee: boolean;
	    password: string;
	    approvalRegistrationMethod: string;
	    registrationUuid: string;
	    published: boolean;
	    moderatorsNotified: boolean;
	    status: string;
	    webinarUrl: string;
	    rxSubject: Subject<any>;
	    rxParticipantsSubject: Subject<any>;
	    isWebinarSync: boolean;
	    session: WebinarSession;
	    waitingRoomMultimediaURLs: string[];
	    stageBackground: string;
	    blur: boolean;
	    bgReplaceUrl: string;
	    action: string;
	    serverURL: string;
	    static create(_serverURL: any): Webinar;
	    static createFromData(webinarData: any, _serverURL: string): Webinar;
	    static updateFromData(webinar: Webinar, webinarData: any): Webinar;
	    static computeWebinarColor(name: string): string;
	    constructor(_serverURL: string);
	    subscribe(handler: any): Subscription;
	    getData(): string;
	    updateRaiseHandParticipants(): void;
	    getTagInfo(): any;
	}
	export { WebinarSessionParticipant, WebinarSession, WebinarParticipant, WebinarCSVStatus, Webinar };

}
declare module 'lib/connection/XMPPServiceHandler/webinarEventHandler' {
	export {};
	import { GenericHandler } from 'lib/connection/XMPPServiceHandler/GenericHandler'; class WebinarEventHandler extends GenericHandler {
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
	    onWebinarManagementMessageReceived(stanza: any): boolean;
	    onReceiptMessageReceived(msg: any, stanza: any): void;
	    onErrorMessageReceived(msg: any, stanza: any): void;
	}
	export { WebinarEventHandler };

}
declare module 'lib/services/WebinarsService' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService';
	import { Webinar } from 'lib/common/models/webinar';
	export {}; class WebinarsService extends GenericService {
	    private avatarDomain;
	    private readonly _protocol;
	    private readonly _host;
	    private readonly _port;
	    private _webinars;
	    private webinarEventHandler;
	    private webinarHandlerToken;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(useRestAtStartup: boolean): Promise<void>;
	    attachHandlers(): void;
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
	    onCreateWebinar(webinarInfo: {
	        id: string;
	    }): Promise<void>;
	    private onDeleteWebinar;
	    /**
	     * @name getWebinarFromCache
	     * @private
	     * @category Webinars Utils
	     * @param {string} webinarId
	     * @description
	     *      GET A CHANNEL FROM CACHE <br>
	     */
	    private getWebinarFromCache;
	    private addOrUpdateWebinarToCache;
	    private removeWebinarFromCache;
	    /**
	     * @public
	     * @method createWebinar
	     * @since 2.3.0
	     * @instance
	     * @category Webinars
	     * @description
	     *  Create a webinar (2 rooms are used for it).<br>
	     * @param {string} name The name of the bubble to create.
	     * @param {string} subject Webinar subject.
	     * @param {Date} waitingRoomStartDate Waiting room start date UTC format.
	     * @param {Date} webinarStartDate Webinar start date UTC format.
	     * @param {Date} webinarEndDate Webinar end date UTC format.
	     * @param {Array<Date>} reminderDates Up to 10 webinar reminder dates UTC format.
	     * @param {string} timeZone Webinar time zone. If none, user time zone will be used.
	     * @param {boolean} register Is participant registration required for webinar? Default value : true.
	     * @param {string} approvalRegistrationMethod Participants approval method. If 'manual` is selected, webinar creator can choose to manually approve or reject participants. default value : automatic. Possible values : manual, automatic.
	     * @param {boolean} passwordNeeded If true, a password is needed when joining the webinar. This password is included in the registration confirmation email. Default value : true.
	     * @param {boolean} isOrganizer If true, webinar creator is also an organizer. Default value : false.
	     * @param {Array<string>} waitingRoomMultimediaURL Up to 5 URL of media to broadcast in the waiting room.
	     * @param {string} stageBackground Free field used for customization (for example a file descriptor unique identifier).
	     * @param {string} chatOption Define how participants can chat with organizers. Default value : participant. Possible values : participant, visitor, private.
	     * @async
	     * @return {Promise<any, ErrorManager>}
	    
	     */
	    createWebinar(name: string, subject: string, waitingRoomStartDate: Date, webinarStartDate: Date, webinarEndDate: Date, reminderDates: Array<Date>, timeZone: string, register: boolean, approvalRegistrationMethod: string, passwordNeeded: boolean, isOrganizer: boolean, waitingRoomMultimediaURL: Array<string>, stageBackground: string, chatOption?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method updateWebinar
	     * @since 2.3.0
	     * @category Webinars
	     * @instance
	     * @description
	     *  Update a webinar.<br>
	     * @param {string} webinarId Webinar identifier.
	     * @param {string} name The name of the bubble to create.
	     * @param {string} subject Webinar subject.
	     * @param {Date} waitingRoomStartDate Waiting room start date UTC format.
	     * @param {Date} webinarStartDate Webinar start date UTC format.
	     * @param {Date} webinarEndDate Webinar end date UTC format.
	     * @param {Array<Date>} reminderDates Up to 10 webinar reminder dates UTC format.
	     * @param {string} timeZone Webinar time zone. If none, user time zone will be used.
	     * @param {boolean} register Is participant registration required for webinar?
	     * @param {string} approvalRegistrationMethod Participants approval method. If 'manual` is selected, webinar creator can choose to manually approve or reject participants. Possible values : manual, automatic.
	     * @param {boolean} passwordNeeded If true, a password is needed when joining the webinar. This password is included in the registration confirmation email.
	     * @param {boolean} lockRegistration Turn off registration for webinar before it starts.
	     * @param {Array<string>} waitingRoomMultimediaURL Up to 5 URL of media to broadcast in the waiting room.
	     * @param {string} stageBackground Free field used for customization (for example a file descriptor unique identifier).
	     * @param {string} chatOption Define how participants can chat with organizers. Default value : participant. Possible values : participant, visitor, private.
	     * @async
	     * @return {Promise<any, ErrorManager>}
	     */
	    updateWebinar(webinarId: string, name: string, subject: string, waitingRoomStartDate: Date, webinarStartDate: Date, webinarEndDate: Date, reminderDates: Array<Date>, timeZone: string, register: boolean, approvalRegistrationMethod: string, passwordNeeded: boolean, lockRegistration: boolean, waitingRoomMultimediaURL: Array<string>, stageBackground: string, chatOption: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getWebinarData
	     * @since 2.3.0
	     * @instance
	     * @category Webinars
	     * @description
	     *  Get data for a given webinar.<br>
	     * @param {string} webinarId Webinar identifier.
	     * @async
	     * @return {Promise<any, ErrorManager>}
	    
	     */
	    getWebinarData(webinarId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method getWebinarsData
	     * @instance
	     * @category Webinars
	     * @since 2.3.0
	     * @description
	     *  Get data for webinars where requester is creator, organizer, speaker and/or participant.<br>
	     * @param {string} role filter. Possible values : creator, organizer, speaker, participant
	     * @async
	     * @return {Promise<any, ErrorManager>}
	     */
	    getWebinarsData(role: string): Promise<unknown>;
	    /**
	     * @public
	     * @method fetchMyWebinars
	     * @since 2.3.0
	     * @instance
	     * @async
	     * @category Webinars
	     * @param {boolean} force Boolean to force the get of webinars's informations from server.
	     * @description
	     *    Get the webinars you own.<br>
	     *    Return a promise. <br>
	     * @return {Promise<Webinar[]>} Return Promise
	     */
	    fetchMyWebinars(force?: boolean): Promise<Webinar[]>;
	    /**
	     * @public
	     * @method warnWebinarModerators
	     * @since 2.3.0
	     * @instance
	     * @category Webinars
	     * @description
	     *  When main speakers and organizers are selected, it's time to warn each of them to join the practice room. when some webinar information change such as:<br>
	     *  As a result, moderatorsSelectedAnNotified boolean is set to true.<br>
	     * @param {string} webinarId Webinar unique identifier. <br>
	     * Notes:<br>
	     * API Call Mandatory before publishing the webinar event:<br>
	     *  The webinar can't be published if webinar moderators are not warned prior.<br>
	     *  see API publishAWebinarEvent<br>
	     * @async
	     * @return {Promise<any, ErrorManager>}
	    
	     */
	    warnWebinarModerators(webinarId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method publishAWebinarEvent
	     * @since 2.3.0
	     * @instance
	     * @category Webinars
	     * @description
	     *  When main information about the webinar event are decided, it's up to open participant registration and allow automatic email sent when some webinar information change such as:<br>
	     *  cancellation<br>
	     *  date changes<br>
	     *  speakers added or removed<br>
	     *  As a result, emailNotification boolean is set to true. This boolean is checked when a participant try to submit a registration earlier. See API POST /api/rainbow/webinar/v1.0/webinars/self-register<br>
	     * @param {string} webinarId Webinar unique identifier. <br>
	     * @async
	     * @return {Promise<any, ErrorManager>}
	    
	     */
	    publishAWebinarEvent(webinarId: string): Promise<unknown>;
	    /**
	     * @public
	     * @method deleteWebinar
	     * @since 2.3.0
	     * @category Webinars
	     * @instance
	     * @description
	     *  Delete a webinar.<br>
	     * @param {string} webinarId Webinar unique identifier. <br>
	     * @async
	     * @return {Promise<any, ErrorManager>}
	     */
	    deleteWebinar(webinarId: string): Promise<unknown>;
	}
	export { WebinarsService as WebinarsService };

}
declare module 'lib/services/RBVoiceService' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService';
	export {}; class RBVoiceService extends GenericService {
	    private avatarDomain;
	    private readonly _protocol;
	    private readonly _host;
	    private readonly _port;
	    private rbvoiceHandlerToken;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(useRestAtStartup: boolean): Promise<void>;
	    attachHandlers(): void;
	    /**
	     * @method retrieveAllAvailableCallLineIdentifications
	     * @async
	     * @category Rainbow Voice CLI Options
	     * @instance
	     * @description
	     * This api returns all CLI options available.
	     * @fulfil {Promise<any>} return result.
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Detailed information about Calling Line Identification (CLI) |
	     * | policy | String | CLI **policy** applied.  <br>It indicates which kind of number is used as CLI  <br>Detailed description of **policy** meanings:<br>* **company_policy** : CLI will be the **Default identifier** as defined at company level (as a result it can be either the Company Number or the Work phone of the user ; according the chosen CLI company policy)<br>* **user\_ddi\_number** : CLI will be the **Work phone** of the user<br>* **installation\_ddi\_number** : CLI will be the **Company number**<br>* **other\_ddi\_number** : CLI will be a **Hunting Group number** the user belongs to. Can be also **another number authorized** by Admin<br>Possible values : `company_policy`, `user_ddi_number`, `installation_ddi_number`, `other_ddi_number` |
	     * | companyPolicy optionnel | String | Only when policy is "company_policy" ; it indicates what is the CLI policy defined at company level<br>Possible values : `user_ddi_number`, `installation_ddi_number` |
	     * | phoneNumberId | String | phoneNumber Unique identifier that is used for identifying selected CLI |
	     * | number | String | phoneNumber value that is used as CLI |
	     * | type optionnel | String | Only when CLI policy is "other\_ddi\_number" ; allows to differentiate Hunting Groups with another number<br>Possible values : `Group`, `Other` |
	     * | name optionnel | String | Only when CLI policy is "other\_ddi\_number" and type is "Group". It is then the Group name |
	     *
	     */
	    retrieveAllAvailableCallLineIdentifications(): Promise<unknown>;
	    /**
	     * @method retrieveCurrentCallLineIdentification
	     * @async
	     * @category Rainbow Voice CLI Options
	     * @instance
	     * @description
	     * This api returns current Call line identification. <br>
	     * @return {Promise<any>}
	     */
	    retrieveCurrentCallLineIdentification(): Promise<unknown>;
	    /**
	     * @method setCurrentActiveCallLineIdentification
	     * @async
	     * @category Rainbow Voice CLI Options
	     * @param {string} policy CLI policy to apply.Possible values : "company_policy", "user_ddi_number", "installation_ddi_number", "other_ddi_number"
	     * @param {string} phoneNumberId  phoneNumber Unique Identifier of the ddi we want to apply (parameter only mandatory when selected CLI policy is "other_ddi_number"
	     * @instance
	     * @description
	     *  This api allows user to set the current CLI. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Detailed information about Calling Line Identification (CLI) |
	     * | policy | String | CLI **policy** applied.  <br>It indicates which kind of number is used as CLI  <br>Detailed description of **policy** meanings:<br>* **company_policy** : CLI will be the **Default identifier** as defined at company level (as a result it can be either the Company Number or the Work phone of the user ; according the chosen CLI company policy)<br>* **user\_ddi\_number** : CLI will be the **Work phone** of the user<br>* **installation\_ddi\_number** : CLI will be the **Company number**<br>* **other\_ddi\_number** : CLI will be a **Hunting Group number** the user belongs to. Can be also **another number authorized** by Admin<br>Posible values : `company_policy`, `user_ddi_number`, `installation_ddi_number`, `other_ddi_number` |
	     * | companyPolicy optionnel | String | Only when policy is "company_policy" ; it indicates what is the CLI policy defined at company level<br>Possible values : `user_ddi_number`, `installation_ddi_number` |
	     * | phoneNumberId | String | phoneNumber Unique identifier that is used for identifying selected CLI |
	     * | number | String | phoneNumber value that is used as CLI |
	     * | type optionnel | String | Only when CLI policy is "other\_ddi\_number" ; allows to differentiate Hunting Groups with another number<br>Possible values : `Group`, `Other` |
	     * | name optionnel | String | Only when CLI policy is "other\_ddi\_number" and type is "Group". It is then the Group name |
	     *
	     */
	    setCurrentActiveCallLineIdentification(policy: string, phoneNumberId?: string): Promise<unknown>;
	    /**
	     * @method addMemberToGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} memberId Unique identifier (userId) of the user to add
	     * @param {number} position Position of the user inside the group, from 1 to last.
	     * @param {Array<string>} roles Member roles inside the group. Default value : agent.Possible value : agent, manager, assistant
	     * @param {string} status Member status inside the group. Default : active. Possible value : active, idle
	     * @instance
	     * @description
	     *  This part of the API allows a user having manager role on a group to add another user. <br>
	     *  The added user can be any user belonging to the same company. <br>
	     *  The position of the inserted member is important in case of a hunting group with serial or circular policy, and also in case of a manager_assistant group with several assistants. <br>
	     *  The position is meaningless in case of parallel hunting group. <br>
	     *  Manager can choose to set the default status of the added user to 'idle' or 'active' (default value, user will be involved in call distribution for hunting group). <br>
	     *  In case of a manager_assistant group the status can be: <br>
	     *  <br>
	     *   - 'idle': the newly inserted member is just 'declared', and not provisioned on cloud PBX side <br>
	     *   - 'active': the newly inserted manager or assistant is configured and ready <br>
	     *  <br>
	     *  Manager can also set the added user role, defining if this user is an agent and/or manager in a hunting group (assistant or manager in case of manager_assistant group). <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    addMemberToGroup(groupId: string, memberId: string, position: number, roles: [], status: string): Promise<unknown>;
	    /**
	     * @method deleteVoiceMessageAssociatedToAGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} messageId Message identifier (userId) of the user to add
	     * @instance
	     * @description
	     *  Deletion of the given voice message. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    deleteVoiceMessageAssociatedToAGroup(groupId: string, messageId: string): Promise<unknown>;
	    /**
	     * @method getVoiceMessagesAssociatedToGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {number} limit Allow to specify the number of voice messages to retrieve. Default value : 100
	     * @param {number} offset Allow to specify the position of first voice messages to retrieve. Default value : 0
	     * @param {string} sortField Sort voice messages list based on the given field. Default value : date
	     * @param {number} sortOrder Specify order when sorting voice messages. Default is descending. Default value : -1. Possible values : -1, 1
	     * @param {string} fromDate List voice messages created after the given date.
	     * @param {string} toDate List voice messages created before the given date.
	     * @param {string} callerName List voice messages with caller party name containing the given value.
	     * @param {string} callerNumber List voice messages with caller party number containing the given value.
	     * @instance
	     * @description
	     *      Returns the list of voice messages associated to a group. <br>
	     * @return {Promise<any>} the result.
	     *
	     *
	     *  | Champ | Type | Description |
	     *  | --- | --- | --- |
	     *  | id  | String | voice message identifier |
	     *  | fileName | String | File name of the voice message - composed of the voice message date |
	     *  | mime | String | MIME type of the voice message file<br>Possible values : `audio/mpeg` |
	     *  | size | Number | Size of the voice message file (in bytes). |
	     *  | duration | Number | Duration of the voice message (in seconds) |
	     *  | date | Date | Date of the voice message |
	     *  | callerInfo | Object | Caller party info |
	     *  | data | Object\[\] | Voice messages |
	     *  | number | String | Caller number |
	     *  | name optionnel | String | Caller name, if available |
	     *  | firstName optionnel | String | Caller firstName, if available |
	     *  | lastName optionnel | String | Caller lastName, if available |
	     *  | userId optionnel | String | Caller user identifier if it can be resolved. |
	     *  | jid optionnel | String | Caller Jid if it can be resolved. |
	     *
	     */
	    getVoiceMessagesAssociatedToGroup(groupId: string, limit: number, offset: number, sortField: string, sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string): Promise<unknown>;
	    /**
	     * @method getGroupForwards
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @instance
	     * @description
	     *  This API allows to get all cloud PBX group forwards. <br>
	     *  The cloud PBX group forwards can be of two different types: <br>
	     *   - groupForwards: applies to hunting group - supported forward types for this kind of group are all listed in the response (immediate, overflow (reprensents busy/unavailable for non parallel and busy/unavailable/noReply for parallel))
	     *   - members: applies to manager_assistant group - list the individual forwards of every managers of the group. These individual forwards are filtered to the only immediate forward, with a destinationType of 'managersecretary' (a.k.a. 'Do Not Disturb forward to assistants')
	     *  <br>
	     *  Inside a manager_assistant group, both manager and assistant can retrieve the group forwards. Inside a hunting group, only the manager can see it (i.e. users with role only set to 'agent' are not allowed to consult the group forwards). <br>
	     *  <br>
	     *  For hunting_group on return data "name" or concerned "id" with value "null" if the user/rvcpGroup/rvcpAutoAttendant is deleted, please remove the forward. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    getGroupForwards(groupId: string): Promise<unknown>;
	    /**
	     * @method getTheUserGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} type Filter only groups of the given type. Possible values : hunting_group, manager_assistant
	     * @description
	     *  This API allows to retrieve the groups where the logged user is member. <br>
	     *  For a hunting group, a user can have two roles inside the group: manager and/or agent. <br>
	     *  For a manager_assistant group, a user can be manager OR assistant, not both. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | skippedGroups optionnel | String\[\] | List of group Identifier from which user has not been able to leave due to restrictions |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    getTheUserGroup(type: string): Promise<unknown>;
	    /**
	     * @method joinAGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} groupId The group identifier to join.
	     * @description
	     *  This part of the API allows a user to join a group. <br>
	     *  To be able to join in a group, the member must have been already declared inside the group, by a manager or an administrator. <br>
	     *  Only the status of the member will be altered (idle to active). His roles will remain untouched (assistant, agent and/or manager). <br>
	     *  Only users with role 'agent' or 'assistant' can join or leave a group. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    joinAGroup(groupId: string): Promise<unknown>;
	    /**
	     * @method joinAllGroups
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @description
	     *  Allow a user to join all the groups he belongs to. <br>
	     *  Only users of hunting groups with role 'agent' can leave all their groups in one go. <br>
	     *  If user if already logged out of a given group, logout action for this group will be skipped. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    joinAllGroups(): Promise<unknown>;
	    /**
	     * @method leaveAGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @param {string} groupId The group identifier to leave.
	     * @instance
	     * @description
	     *  This part of the API allows a user to leave a group. <br>
	     *  To be able to leave in a group, a member must have been already declared inside the group, by a manager or an administrator. <br>
	     *  Only the status of the member will be altered (active to idle). His roles will remain untouched (assistant, agent and/or manager). <br>
	     *  Only users with role 'agent' or 'assistant' can join or leave a group. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    leaveAGroup(groupId: string): Promise<unknown>;
	    /**
	     * @method leaveAllGroups
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @description
	     *  Allow a user to leave all the groups he belongs to. <br>
	     *  Only users of hunting groups with role 'agent' can leave all their groups in one go. <br>
	     *  If user if already logged out of a given group, logout action for this group will be skipped. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    leaveAllGroups(): Promise<unknown>;
	    /**
	     * @method removeMemberFromGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} memberId Unique identifier of the member to remove
	     * @description
	     *  This part of the API allows a manager to remove a member from a group. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    removeMemberFromGroup(groupId: string, memberId: string): Promise<unknown>;
	    /**
	     * @method retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @description
	     *  Returns the number of read/unread messages for each hunting group where logged in user is a member. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | Messages summary for each hunting group where logged in user is a member |
	     * | groupId | String | Group identifier |
	     * | groupName | String | Group name |
	     * | messages | Object\[\] | List of read/unread messages per type |
	     * | type | String | Messages type<br>Possible values : `voicemail`, `email`, `fax`, `video` |
	     * | new | Number | Number of unread voice messages |
	     * | old | Number | Number of read voice messages |
	     * | totalByType | Object\[\] | Total of messages grouped by their type |
	     * | type | String | Messages type<br>Possible values : `voicemail`, `email`, `fax`, `video` |
	     * | new | Number | Unread messages sum for all group messages where logged in user is a member. |
	     * | old | Number | Read messages sum for all group messages where logged in user is a member. |
	     *
	     */
	    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser(): Promise<unknown>;
	    /**
	     * @method updateAVoiceMessageAssociatedToAGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} messageId Message Identifier
	     * @param {string} read Mark the message as read or unread
	     * @description
	     *  Update the given voice message - mark it as read or unread When a message is 'unread', it is considered as a new message. On the opposite, a 'read' message is considered as an old message. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    updateAVoiceMessageAssociatedToAGroup(groupId: string, messageId: string, read: boolean): Promise<unknown>;
	    /**
	     * @method updateAGroup
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} externalNumberId Identifier of the public phone number assigned to the group - applicable to hunting group type only
	     * @param {boolean} isEmptyAllowed Indicates if the last active member can leave the group or not - applicable to hunting group only.
	     * @description
	     *  This API allows a manager of to group to modify some settings of a Cloud PBX hunting group. <br>
	     *  Modification can be done on the following settings of a group: <br>
	     *  * Assign a public phone number to the group
	     *  * Allow or not empty group
	     *  <br>
	     *  To assign a public number, the following steps should be performed: <br>
	     *  * Retrieve the list of available phone numbers: (list DDI numbers from RVCP Provisioning portal)
	     *  * Provide the externalNumberId of the selected phone number in the body of this update request
	     *
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    updateAGroup(groupId: string, externalNumberId: string, isEmptyAllowed: boolean): Promise<unknown>;
	    /**
	     * @method updateGroupForward
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} callForwardType The forward type to update. Only 'immediate' supported in case of manager_assistant group. Possible values : immediate, overflow
	     * @param {string} destinationType The destination type. Mandatory for activation. 'managersecretary' only for manager_assistant. 'internalNumber', 'externalNumber', 'autoAttendant' only for hunting group. Possible values : internalnumber, externalnumber, autoattendant, managersecretary
	     * @param {number} numberToForward The number to forward. Mandatory for destinationType = internalnumber or externalnumber.
	     * @param {boolean} activate Activate or cancel a forward.
	     * @param {number} noReplyDelay in case of 'overflow' forward type on parallel hunting group, timeout in seconds after which the call will be forwarded. Default value : 20. Possible values : {10-60}.
	     * @param {Array<string>} managerIds List of manager ids to set forward on (Manager_assistant group type with destination type 'managersecretary' only. <br>
	     *     For assistant(s) only).<br>
	     *     If not provided, all active managers of the group will be concerned by this forward.
	     * @param {string} rvcpAutoAttendantId Unique identifier of the auto attendant, only for hunting_group for autoAttendant destinationType
	     * @description
	     *  This API allows to update the forwards of a cloud PBX group. <br>
	     *  Setting a forward on a group has different implications depending on the type of group. <br>
	     *  For a **_hunting group_**, it implies setting a forward on the dedicated subscriber of the cloud PBX associated with the group. The supported forward types in this case are: 'immediate', 'overflow'. Overflow is: <br>
	     *  <br>
	     *  * for parallel: 'busy', 'noreply' and 'unavailable'
	     *  * for others: 'busy', unavailable'
	     *    Only user with manager role inside the hunting group can set up a forward for the group. <br>
	     *  Forward destinations are limited to externalNumber, autoAttendant and internalNumber for hunting group. <br>
	     *  <br>
	     *  For a **_manager_assistant group_**, only 'immediate' forward type to 'managersecretary' destination is allowed in this API. <br>
	     *  When requested by an assistant, update of the forward will be sent to every active managers of the group, unless filtered by the 'managerIds' parameter. <br>
	     *  When requested by a manager, only its own forward is concerned ('managerIds' parameter is not used). <br>
	     *  <br>
	     *  Additional remarks on group forward: <br>
	     *  <br>
	     *  * Users can access their forwards from the dedicated forward API ([Voice Forward](#api-Voice_Forward))
	     *  * ...but only this API allows to deal with the 'managersecretary' for destination type (as an assistant to set or cancel the DND of its manager(s), or as the manager itself)
	     *  * Setting DND on a manager will then override its previous immediate forward (if set). After cancelling the DND, the previous forward will NOT be restored.
	     *  * When setting a noreply forward, providing a noReplyDelay timeout, pay attention that this timeout can be later changed if hunting group changes (add / remove member).
	     *  * In manager_assistant groups, if forward is activated and the group is then modified, the forward will be cancelled if there are no longer any active assistants after the modification.
	     *  * A forward can be indirectly cancelled after a group modification (case of manager_assistant group, with assistant(s) no longer active).
	     *
	     * @return {Promise<any>} the result.
	     *
	     */
	    updateGroupForward(groupId: string, callForwardType: string, destinationType: string, numberToForward: number, activate: boolean, noReplyDelay: number, managerIds: Array<string>, rvcpAutoAttendantId: string): Promise<unknown>;
	    /**
	     * @method updateGroupMember
	     * @async
	     * @category Rainbow Voice Cloud PBX group
	     * @instance
	     * @param {string} groupId Unique identifier of the Cloud PBX group to update
	     * @param {string} memberId Unique identifier of the group member
	     * @param {number} position Position of the user inside a serial group, from 1 to last. Meaningless in case of parallel hunting group
	     * @param {Array<string>} roles Member roles inside the group. Default value : agent. Possible values : agent, manager, assistant
	     * @param {string} status Member status inside the group. Default value : active. Possible values : active, idle
	     * @description
	     *  This part of the API allows a manager to update a member inside a group. <br>
	     *  Update consists in changing the status of the member, or its roles, or its position inside the group. <br>
	     *  Some updates are specific to the type of group: <br>
	     *  * Hunting group only can support several roles for a member (e.g. manager and agent)
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Group Object |
	     * | id  | String | Group unique identifier |
	     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
	     * | name | String | Group name - displayed on the caller phone set for hunting group type |
	     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
	     * | members | Object\[\] | List of group members. |
	     * | memberId | String | Member (user) unique identifier |
	     * | displayName | String | Member display name |
	     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
	     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
	     *
	     */
	    updateGroupMember(groupId: string, memberId: string, position: number, roles: Array<string>, status: string): Promise<unknown>;
	    /**
	     * @method activateDeactivateDND
	     * @async
	     * @category Rainbow Voice Deskphones
	     * @instance
	     * @param {string} activate Set to "true" to activate or "false' to deactivate user DND.
	     * @description
	     *  This API allows logged in user to activate or deactivate his DND state. <br>
	     * @return {Promise<any>} the result.
	     */
	    activateDeactivateDND(activate: boolean): Promise<unknown>;
	    /**
	     * @method configureAndActivateDeactivateForward
	     * @async
	     * @category Rainbow Voice Deskphones
	     * @instance
	     * @param {string} callForwardType The forward type to update. Possible values : immediate, busy, noreply .
	     * @param {string} type The destination type (Optional in case of deactivation)). Possible values : number, voicemail .
	     * @param {string} number Forward destination number (Optional if forward destination type is voicemail).
	     * @param {number} timeout In case of noreply forward type, timeout in seconds after which the call will be forwarded. Default value : 20 . Possible values : {10-60} .
	     * @param {boolean} activated Activate or deactivate current forward.
	     * @description
	     *  This API allows logged in user to activate or deactivate a forward. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | type optionnel | String | The destination type (Optional in case of deactivation)).<br>Possible values : `number`, `voicemail` |
	     * | number optionnel | String | Forward destination number (Optional if forward destination type is `voicemail`). |
	     * | timeout optionnel | Number | In case of `noreply` forward type, timeout in seconds after which the call will be forwarded.<br>Default value : `20`<br>Possible values : `{10-60}` |
	     * | activated | Boolean | Activate or deactivate current forward. |
	     *
	     */
	    configureAndActivateDeactivateForward(callForwardType: string, type: string, number: string, timeout: number, activated: boolean): Promise<unknown>;
	    /**
	     * @method retrieveActiveForwards
	     * @async
	     * @category Rainbow Voice Deskphones
	     * @instance
	     * @description
	     *  This API allows logged in user to retrieve his active forwards. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    retrieveActiveForwards(): Promise<unknown>;
	    /**
	     * @method retrieveDNDState
	     * @async
	     * @category Rainbow Voice Deskphones
	     * @instance
	     * @description
	     *  This API allows logged in user to retrieve his DND state. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    retrieveDNDState(): Promise<unknown>;
	    /**
	     * @method searchUsersGroupsContactsByName
	     * @async
	     * @category Rainbow Voice Deskphones
	     * @param {string} displayName Search users, groups, contacts on the given name.
	     * @param {number} limit Allow to specify the number of users, groups or contacts to retrieve (Max: 50). Default value : 20
	     * @instance
	     * @description
	     * This API allows to retrieve phone numbers associated to Rainbow users, groups, Office365 contacts and external directories contacts. <br>
	     * <br>
	     * Search by displayName (query parameter `displayName`):<br>
	     *  * The search is done on users/contacts' \`firstName\` and \`lastName\`, and search is done in
	     *    * all Rainbow public users and users being in companies visible by logged in user's company,
	     *    * external directories (like Office365) linked to logged in user's company.
	     *  <br>
	     *  * If logged in user's has visibility \`closed\` or \`isolated\`, or \`same\_than\_company\` and logged in user's company has visibility \`closed\` or \`isolated\`, search is done only on users being in companies visible by logged in user's company.<br>
	     *  * Search on display name can be:<br>
	     *    * firstName and lastName exact match (ex: 'John Doe' find 'John Doe')
	     *    * partial match (ex: 'Jo Do' find 'John Doe')
	     *    * case insensitive (ex: 'john doe' find 'John Doe')
	     *    * accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
	     *    * on only firstname or lastname (ex: 'john' find 'John Doe')
	     *    * order firstname / lastname does not matter (ex: 'doe john' find 'John Doe').
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object\[\] | List of user, group, contact Objects. |
	     * | firstName optionnel | String | User, contact first name |
	     * | lastName optionnel | String | User, contact last name |
	     * | companyName optionnel | String | User company name if known and different of logged in user company |
	     * | displayName | String | User, group, contact display name |
	     * | category | String | Specify where user, group or contact has been found<br>Possible values : `my_company`, `other_company`, `other_directory` |
	     * | phonenumbers | Object\[\] | List of phone numbers linked to user, group or contact |
	     * | number | String | User, group or contact phone number |
	     * | type | String | Phone number type<br>Possible values : `home`, `work`, `other` |
	     * | deviceType optionnel | String | Device type<br>Possible values : `landline`, `mobile`, `fax`, `other` |
	     *
	     */
	    searchUsersGroupsContactsByName(displayName: string, limit: number): Promise<unknown>;
	    /**
	     * @method activatePersonalRoutine
	     * @async
	     * @category Rainbow Voice Personal Routines
	     * @instance
	     * @param {string} routineId A user routine unique identifier.
	     * @description
	     *  This api activate a user's personal routine. <br>
	     *  A supervisor can request to activate the personal routine of a user by providing its identifier as a parameter. <br>
	     *  The requesting user must be supervisor of the given supervised user.
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Detailed information about Rvcp Personal Routines |
	     * | routines | Object\[\] | Routines data array of routine objects |
	     * | id  | String | Routine unique identifier |
	     * | name | String | Name of the routine |
	     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
	     * | active | Boolean | Is the routine activated<br>Default value : `false` |
	     * | inSync | Boolean | Boolean to know if last activation or active routine update is done |
	     * | issuesLastSync | Object | Indications about issues last activation or active routine update |
	     * | dndPresence | Boolean |     |
	     * | presence | Boolean |     |
	     * | cliOptions | Boolean |     |
	     * | deviceMode | Boolean |     |
	     * | immediateCallForward | Boolean |     |
	     * | busyCallForward | Boolean |     |
	     * | noreplyCallForward | Boolean |     |
	     * | huntingGroups | Boolean |     |
	     *
	     */
	    activatePersonalRoutine(routineId: string): Promise<unknown>;
	    /**
	     * @method createCustomPersonalRoutine
	     * @async
	     * @category Rainbow Voice Personal Routines
	     * @instance
	     * @param {string} name Name of the new routine between 1 and 255 characters.
	     * @description
	     *  This api create a user's custom personal routine. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Detailed information about Rvcp Personal Routines |
	     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
	     * | id  | String | Routine unique identifier |
	     * | active | Boolean | Is the routine activated<br>Default value : `false` |
	     * | name | String | Name of the routine |
	     * | dndPresence | Boolean | If set to true, on routine activation the presence will be set to "dnd", if false "online", soon deprecated with presence object<br>Default value : `true` |
	     * | deviceMode | Object | Device mode data |
	     * | manage | Boolean | Is device mode managed on routine activation<br>Default value : `false` |
	     * | mode | String | Device mode value, same choice(s) as in Rainbow GUI<br>Default value : `computer`<br>Possible values : `computer`, `office_phone` |
	     * | immediateCallForward | Object | Immediate call forward data |
	     * | manage | Boolean | Is immediate call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `immediate` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber` |
	     * | busyCallForward | Object | Busy call forward data |
	     * | manage | Boolean | Is busy call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `busy` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
	     * | noreplyCallForward | Object | No reply call forward data |
	     * | manage | Boolean | Is noreply call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `noreply` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
	     * | noReplyDelay | Number |     |
	     * | huntingGroups | Object |     |
	     * | manage | Boolean | Default value : `false` |
	     * | withdrawAll optionnel | Boolean | Not for work routine<br>Default value : `true` |
	     * | huntingGroupsWithdraw optionnel | Object\[\] | Array of objects on user status in each hunting groups, only for work routine |
	     * | rvcpGroupId | String | Hunting group unique identifier |
	     * | presence | Object | Presence configuration, value can be overwritten by user |
	     * | status | String | User's status in the hunting group<br>Possible values : `active`, `idle` |
	     * | manage | Boolean | Manage presence on routine activation |
	     * | value | String | Same choices as in Rainbow GUI<br>Possible values : `dnd`, `online`, `invisible`, `away` |
	     * | cliOptions | Object | Cli options configuration |
	     * | manage | Boolean | Manage cli options on routine activation |
	     * | policy | String | Cli options policy<br>Possible values : `company_policy`, `installation_number`, `user_ddi_number`, `other_ddi_number` |
	     * | phoneNumberId | String | Phone number id in "other\_ddi\_number" policy |
	     *
	     */
	    createCustomPersonalRoutine(name: string): Promise<unknown>;
	    /**
	     * @method deleteCustomPersonalRoutine
	     * @async
	     * @category Rainbow Voice Personal Routines
	     * @instance
	     * @param {string} routineId A user routine unique identifier.
	     * @description
	     *  This api delete a user's custom personal routine. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    deleteCustomPersonalRoutine(routineId: string): Promise<unknown>;
	    /**
	     * @method getPersonalRoutineData
	     * @async
	     * @category Rainbow Voice Personal Routines
	     * @instance
	     * @param {string} routineId A user routine unique identifier.
	     * @description
	     *  This api returns a user's personal routine data. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Detailed information about Rvcp Personal Routines |
	     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
	     * | id  | String | Routine unique identifier |
	     * | active | Boolean | Is the routine activated<br>Default value : `false` |
	     * | name | String | Name of the routine |
	     * | dndPresence | Boolean | If set to true, on routine activation the presence will be set to "dnd", if false "online", soon deprecated with presence object<br>Default value : `true` |
	     * | deviceMode | Object | Device mode data |
	     * | manage | Boolean | Is device mode managed on routine activation<br>Default value : `false` |
	     * | mode | String | Device mode value, same choice(s) as in Rainbow GUI<br>Default value : `computer`<br>Possible values : `computer`, `office_phone` |
	     * | immediateCallForward | Object | Immediate call forward data |
	     * | manage | Boolean | Is immediate call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `immediate` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber` |
	     * | busyCallForward | Object | Busy call forward data |
	     * | manage | Boolean | Is busy call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `busy` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
	     * | noreplyCallForward | Object | No reply call forward data |
	     * | manage | Boolean | Is noreply call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `noreply` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
	     * | noReplyDelay | Number |     |
	     * | huntingGroups | Object |     |
	     * | manage | Boolean | Default value : `false` |
	     * | withdrawAll optionnel | Boolean | Not for work routine<br>Default value : `true` |
	     * | huntingGroupsWithdraw optionnel | Object\[\] | Array of objects on user status in each hunting groups, only for work routine |
	     * | rvcpGroupId | String | Hunting group unique identifier |
	     * | presence | Object | Presence configuration, value can be overwritten by user |
	     * | status | String | User's status in the hunting group<br>Possible values : `active`, `idle` |
	     * | manage | Boolean | Manage presence on routine activation |
	     * | value | String | Same choices as in Rainbow GUI<br>Possible values : `dnd`, `online`, `invisible`, `away` |
	     * | cliOptions | Object | Cli options configuration |
	     * | manage | Boolean | Manage cli options on routine activation |
	     * | policy | String | Cli options policy<br>Possible values : `company_policy`, `installation_number`, `user_ddi_number`, `other_ddi_number` |
	     * | phoneNumberId | String | Phone number id in "other\_ddi\_number" policy |
	     *
	     */
	    getPersonalRoutineData(routineId: string): Promise<unknown>;
	    /**
	     * @method getAllPersonalRoutines
	     * @async
	     * @category Rainbow Voice Personal Routines
	     * @instance
	     * @param {string} userId Identifier of the user for which we want to get the personal routines. Requesting user must be a supervisor.
	     * @description
	     *  This api returns all user's personal routines data <br>
	     *  <br>
	     *  A supervisor can request the personal routines of a user by providing its identifier as a parameter. <br>
	     *  The requesting user must be supervisor of the given supervised user. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Detailed information about Rvcp Personal Routines |
	     * | routines | Object\[\] | Routines data array of routine objects |
	     * | id  | String | Routine unique identifier |
	     * | name | String | Name of the routine |
	     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
	     * | active | Boolean | Is the routine activated<br>Default value : `false` |
	     * | inSync | Boolean | Boolean to know if last activation or active routine update is done |
	     * | issuesLastSync | Object | Indications about issues last activation or active routine update |
	     * | dndPresence | Boolean |     |
	     * | presence | Boolean |     |
	     * | cliOptions | Boolean |     |
	     * | deviceMode | Boolean |     |
	     * | immediateCallForward | Boolean |     |
	     * | busyCallForward | Boolean |     |
	     * | noreplyCallForward | Boolean |     |
	     * | huntingGroups | Boolean |     |
	     *
	     */
	    getAllPersonalRoutines(userId: any): Promise<unknown>;
	    /**
	     * @method updatePersonalRoutineData
	     * @async
	     * @category Rainbow Voice Personal Routines
	     * @instance
	     * @description
	     *  This api updates a user's personal routine data, it's not possible to update the work routine, it contains memorized data before the activation of another routine. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | cliOptions optionnel | Object | Cli options configuration |
	     * | manage | Boolean | Manage cli options on routine activation |
	     * | policy | String | Cli options policy<br>Possible values : `company_policy`, `installation_number`, `user_ddi_number`, `other_ddi_number` |
	     * | phoneNumberId | String | Phone number id in "other\_ddi\_number" policy |
	     * | data | Object | Detailed information about Rvcp Personal Routines |
	     * | name | String | name of the routine |
	     * | dndPresence | Boolean | If set to true, on routine activation the presence will be set to "dnd", if false "online", soon deprecated with presence object<br>Default value : `true` |
	     * | deviceMode | Object | Device mode data |
	     * | manage | Boolean | Is device mode managed on routine activation<br>Default value : `false` |
	     * | mode | String | Device mode value, same choice(s) as in Rainbow GUI<br>Default value : `computer`<br>Possible values : `computer`, `office_phone` |
	     * | immediateCallForward | Object | Immediate call forward data |
	     * | manage | Boolean | Is immediate call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `immediate` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber` |
	     * | busyCallForward | Object | Busy call forward data |
	     * | manage | Boolean | Is busy call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `busy` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
	     * | noreplyCallForward | Object | No reply call forward data |
	     * | manage | Boolean | Is noreply call forward managed on routine activation<br>Default value : `false` |
	     * | callForwardType | String | Default value : `noreply` |
	     * | activate | Boolean | Default value : `false` |
	     * | number | String | Default value : `null` |
	     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
	     * | noReplyDelay | Number |     |
	     * | huntingGroups | Object |     |
	     * | manage | Boolean | Default value : `false` |
	     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
	     * | withdrawAll optionnel | Boolean | Default value : `true` |
	     * | active | Boolean | Is the routine activated<br>Default value : `false` |
	     * | issuesLastSync optionnel | Object | Indications about issues if the routine was active |
	     * | dndPresence | Boolean |     |
	     * | presence | Boolean |     |
	     * | cliOptions | Boolean |     |
	     * | deviceMode | Boolean |     |
	     * | immediateCallForward | Boolean |     |
	     * | busyCallForward | Boolean |     |
	     * | noreplyCallForward | Boolean |     |
	     * | presence | Object | Presence configuration, value can be overwritten by user |
	     * | huntingGroups | Boolean |     |
	     * | manage | Boolean | Manage presence on routine activation |
	     * | value | String | Same choices as in Rainbow GUI<br>Possible values : `dnd`, `online`, `invisible`, `away` |
	     *
	     * @param {string} routineId A user routine unique identifier.
	     * @param {boolean} dndPresence Configure dndPresence on routine activation, or online on fallback to work routine, soon deprecated with presence object
	     * @param {string} name New routine name, not for default routine.
	     * @param {Object} deviceMode Device mode configuration <BR>
	     *     - deviceMode.manage : boolean Manage device mode on routine activation <BR>
	     *     - deviceMode.mode : string Same choices as in Rainbow GUI. Possible values : computer, office_phone <BR>
	     * @param {Object} presence Presence configuration, value can be overwritten by user<BR>
	     *     - presence.manage : boolean Manage presence on routine activation<BR>
	     *     - presence.value : string Same choices as in Rainbow GUI. Possible values : dnd, online, invisible, away<BR>
	     * @param {Object} immediateCallForward immediate call forward configuration <BR>
	     *     - immediateCallForward.manage : boolean Manage immediate call forward <BR>
	     *     - immediateCallForward.activate : boolean <BR>
	     *     - immediateCallForward.number optionnel : string Mandatory on destinationType internalnumber or externalnumber <BR>
	     *     - immediateCallForward.destinationType optionnel : string Possible values : voicemail, internalnumber, externalnumber <BR>
	     * @param {Object} busyCallForward Busy call forward configuration <BR>
	     *     - busyCallForward.manage : boolean Manage busy call forward <BR>
	     *     - busyCallForward.activate : boolean <BR>
	     *     - busyCallForward.number optionnel : string Mandatory on destinationType internalnumber or externalnumber <BR>
	     *     - busyCallForward.destinationType optionnel : string Possible values : voicemail, internalnumber, externalnumber <BR>
	     * @param {Object} noreplyCallForward Noreply call forward configuration <BR>
	     *     - noreplyCallForward.manage : boolean Manage noreply call forward <BR>
	     *     - noreplyCallForward.activate : boolean <BR>
	     *     - noreplyCallForward.number optionnel : string Mandatory on destinationType internalnumber or externalnumber <BR>
	     *     - noreplyCallForward.destinationType optionnel : string Possible values : voicemail, internalnumber, externalnumber <BR>
	     *     - noreplyCallForward.noReplyDelay : number timeout in seconds after which the call will be forwarded Default value : 20 Ordre de grandeur : 10-60 <BR>
	     * @param {Object} huntingGroups Hunting groups configuration <BR>
	     *     - huntingGroups.withdrawAll    Boolean Withdraw from all hunting groups or keep the work data <BR>
	     *     - huntingGroups.manage    Boolean Manage hunting groups configuration <BR>
	     *
	     */
	    updatePersonalRoutineData(routineId: string, dndPresence: boolean, name: string, presence: {
	        manage: boolean;
	        value: string;
	    }, deviceMode: {
	        manage: boolean;
	        mode: string;
	    }, immediateCallForward: {
	        manage: boolean;
	        activate: boolean;
	        number: string;
	        destinationType: string;
	    }, busyCallForward: {
	        manage: boolean;
	        activate: boolean;
	        number: string;
	        destinationType: string;
	    }, noreplyCallForward: {
	        manage: boolean;
	        activate: boolean;
	        number: string;
	        destinationType: string;
	        noReplyDelay: number;
	    }, huntingGroups: {
	        withdrawAll: boolean;
	    }): Promise<unknown>;
	    /**
	     * @method manageUserRoutingData
	     * @async
	     * @category Rainbow Voice Routing
	     * @instance
	     * @param {string} destinations List of device's identifiers indicating which devices will receive incoming calls.
	     * @param {string} currentDeviceId Device's identifier to use for 3Pcc initial requests like "Make Call".
	     * @description
	     *  This api allows user routing management <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | destinations | Object\[\] | Which devices will be ringing when an incoming call is received |
	     * | deviceId | String | Destination identifier |
	     * | type | String | Destination type (`webrtc` : destination is a softphone ; `sip` : destination is a SIP deskphone)<br>Possible values : `sip`, `webrtc` |
	     * | currentDeviceId | String | Which device is used for handling 3PCC initial requests (like "Make Call") |
	     * | current | String | (Deprecated) Which device is used for handling 3PCC initial requests (like "Make Call") |
	     *
	     */
	    manageUserRoutingData(destinations: Array<string>, currentDeviceId: string): Promise<unknown>;
	    /**
	     * @method retrievetransferRoutingData
	     * @async
	     * @category Rainbow Voice Routing
	     * @instance
	     * @param {string} calleeId Callee user identifier.
	     * @param {string} addresseeId Addressee user identifier (in case of Rainbow user).
	     * @param {string} addresseePhoneNumber Addressee phone number (short or external number).
	     * @description
	     *  For transfer, get addressee routing data. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | jid_im | String | Addressee Jabber identifier (WebRTC). |
	     * | phoneNumber | String | Addressee phone number (deskphone or external number). |
	     *
	     */
	    retrievetransferRoutingData(calleeId: string, addresseeId?: string, addresseePhoneNumber?: string): Promise<unknown>;
	    /**
	     * @method retrieveUserRoutingData
	     * @async
	     * @category Rainbow Voice Routing
	     * @instance
	     * @description
	     *  This api returns user routing information. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | destinations | Object\[\] | Which devices will be ringing when an incoming call is received |
	     * | deviceId | String | Destination identifier |
	     * | type | String | Destination type (`webrtc` : destination is a softphone ; `sip` : destination is a SIP deskphone)<br>Possible values : `sip`, `webrtc` |
	     * | currentDeviceId | String | Which device is used for handling 3PCC initial requests (like "Make Call") |
	     * | current | String | (Deprecated) Which device is used for handling 3PCC initial requests (like "Make Call") |
	     *
	     */
	    retrieveUserRoutingData(): Promise<unknown>;
	    /**
	     * @method retrieveVoiceUserSettings
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @description
	     *  Allows logged in user to retrieve his voice settings. <br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | data | Object | Response data |
	     * | emulatedRingBackTone | Boolean | Indicate that emulated ringback tone is active |
	     *
	     */
	    retrieveVoiceUserSettings(): Promise<unknown>;
	    /**
	     * @method addParticipant3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.callee : string Contains the callee number. <br>
	     * @description
	     *  Adds a participant in a call, as a one step conference. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    addParticipant3PCC(callId: string, callData: {
	        callee: string;
	    }): Promise<unknown>;
	    /**
	     * @method answerCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.legId : string Leg identifier, on which the call will be answered.<br>
	     * @description
	     *  This is a 3PCC answer call. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    answerCall3PCC(callId: string, callData: {
	        legId: string;
	    }): Promise<unknown>;
	    /**
	     * @method blindTransferCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.destination : Object if destination type is a `String`, its content is treated as the phone number to call, if destination type is an `Object` with following attributes is expected:<br>
	     *     callData.destination.userId : string Identifier of the user to call.<br>
	     *     callData.destination.resource : string Specific user resource to call.<br>
	     * @description
	     *  This is a 3PCC blind transfer call. Immediate transfer of an active call to a new destination. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    blindTransferCall3PCC(callId: string, callData: {
	        destination: {
	            userId: string;
	            resource: string;
	        };
	    }): Promise<unknown>;
	    /**
	     * @method deflectCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.destination : string The number to deflect to.<br>
	     * @description
	     *  This is a 3PCC deflect call. During ringing state, user transfer the call to another destination. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    deflectCall3PCC(callId: string, callData: {
	        destination: string;
	    }): Promise<unknown>;
	    /**
	     * @method holdCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.legId : string Leg identifier, from which the call will be held.<br>
	     * @description
	     *  This is a 3PCC hold call. <br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    holdCall3PCC(callId: string, callData: {
	        legId: string;
	    }): Promise<unknown>;
	    /**
	     * @method makeCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {Object} callData Object with : <br>
	     * callData.deviceId : string Identifier of the device from which the call should be initiated.<br>
	     * callData.callerAutoAnswer : boolean Indicates if the call should be automatically answered by the caller (if true). Default value : false.<br>
	     * callData.anonymous : boolean If true, the caller identity will not be presented to the other call parties. Default value : false.<br>
	     * callData.calleeExtNumber : string The format could be anything the user can type, it will be transformed in E164 format.<br>
	     * callData.calleePbxId : string PBX identifier on which the callee is attached.<br>
	     * callData.calleeShortNumber : string Callee short number. CalleePbxId must be provided with calleeShortNumber, as it is used to check that caller and callee are on the same pbx.<br>
	     * callData.calleeCountry : string Callee country code. If not specified, the logged user country code will be used.<br>
	     * callData.dialPadCalleeNumber : string Callee number ; with the same format as if number was dialed By EndUser using a deskphone :<br>
	     * That means that inside this parameter, we can have internal number ; or external number (for national and international calls) but in that case the outgoing prefix must be present.<br>
	     * This parameter support also the E.164 format.<br>
	     * Examples of accepted number into this parameter:<br>
	     *  - +33299151617 : national or international call to France<br>
	     *  - 0 00 XXXXXXXXX : for international calls where 0 is PBX outbound prefix and 00 the international prefix (spaces are not mandatory, it is for better understanding)<br>
	     *  - 0 0 XXXXXXXXX : for national calls where 0 is PBX outbound prefix and 0 the national prefix (spaces are not mandatory, it is for better understanding)<br>
	     *  - 0 XXXX : for services where 0 is PBX outbound prefix (space is not mandatory, it is for better understanding)<br>
	     *  - XXXXX : for internal calls<br>
	     *  <br>
	     *  This parameter is used only if other "callee" parameters are not set.<br>
	     * @description
	     *  This api makes a 3PCC call between 2 users.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    makeCall3PCC(callData: {
	        deviceId: string;
	        callerAutoAnswer: boolean;
	        anonymous: boolean;
	        calleeExtNumber: string;
	        calleePbxId: string;
	        calleeShortNumber: string;
	        calleeCountry: string;
	        dialPadCalleeNumber: string;
	    }): Promise<unknown>;
	    /**
	     * @method mergeCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} activeCallId Active call identifier. <br>
	     * @param {Object} callData Object with : <br>
	     * callData.heldCallId : string Held call identifier.<br>
	     * @description
	     *  This is a 3PCC merge call. Merge an held call into the active call (single call or conference call).<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    mergeCall3PCC(activeCallId: string, callData: {
	        heldCallId: string;
	    }): Promise<unknown>;
	    /**
	     * @method pickupCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {Object} callData Object with : <br>
	     * callData.deviceId : string Identifier of the device from which the call should be initiated.<br>
	     * callData.callerAutoAnswer : string Indicates if the call should be automatically answered by the caller (if true). Default value : false.<br>
	     * callData.calleeShortNumber : string Callee short number.<br>
	     * @description
	     *  3PCC pickup call can be used in case of manager/assistant context, when an assistant wants to pickup a call on a manager.
	     *  To allow such pickup, the following checks must be fulfilled:
	     *  * The user initiating the pickup must be an active assistant in the same group as the manager .<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    pickupCall3PCC(callData: {
	        deviceId: string;
	        callerAutoAnswer: boolean;
	        calleeShortNumber: string;
	    }): Promise<unknown>;
	    /**
	     * @method releaseCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {string} legId Leg identifier, from which the call will be released.<br>
	     * @description
	     *  This is a 3PCC release call.<br>
	     *  If the legId is not specified, the resulting operation will be considered as a 'clearCall'.<br>
	     *  If specified, a 'clearConnection' will be invoked.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    releaseCall3PCC(callId: string, legId: string): Promise<unknown>;
	    /**
	     * @method retrieveCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.legId : string Leg identifier, from which the call will be retrieved.<br>
	     * @description
	     *  This is a 3PCC retrieve call.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    retrieveCall3PCC(callId: string, callData: {
	        legId: string;
	    }): Promise<unknown>;
	    /**
	     * @method sendDTMF3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Call identifier.
	     * @param {Object} callData : <br>
	     *     callData.legId : string Leg identifier, on which the DTMF will be sent.<br>
	     *     callData.digits : string Digits to send.<br>
	     * @description
	     *  This is a 3PCC send DTMF.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    sendDTMF3PCC(callId: string, callData: {
	        legId: string;
	        digits: string;
	    }): Promise<unknown>;
	    /**
	     * @method snapshot3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} callId Snapshot will be filtered with the given callId.
	     * @param {string} deviceId Snapshot will be filtered with the given deviceId.
	     * @param {string} seqNum If provided and different from the server's sequence number, full snapshot will be returned. If provided seqNum is the same as the one on the server, no snapshot returned (client and server are sync).
	     * @description
	     *  This is a 3PCC Snapshot of the user's calls and devices.<br>
	     *  Providing a callId will restrict the snapshot to the given call. The same principle applies to the deviceId for the user's devices states.<br>
	     *  A synchronisation check can also be used by the client to see if any changes have been correctly notified by the server.<br>
	     *  To use this mechanism, the client will send the last sequence number received, either from events, or when requesting the last snapshot.<br>
	     *  The main advantage of using this sequence number is to minimize the data flow between the client and the server.<br>
	     *  Returning the complete snapshot result is only necessary when sequence numbers are different between the server and the client.<br>
	     * @return {Promise<any>} the result.
	     *
	     *  data : Object snapshot Calls and/or devices snapshot
	     *
	     */
	    snapshot3PCC(callId: string, deviceId: string, seqNum: number): Promise<unknown>;
	    /**
	     * @method transferCall3PCC
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} activeCallId Active call identifier.
	     * @param {Object} callData : <br>
	     *     callData.heldCallId : string Held call identifier.<br>
	     * @description
	     *  This is a 3PCC transfer call. Transfer the active call to the given held call.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    transferCall3PCC(activeCallId: string, callData: {
	        heldCallId: string;
	    }): Promise<unknown>;
	    /**
	     * @method deleteAVoiceMessage
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} messageId Message identifier.
	     * @description
	     *  Deletion of the given voice message.<br>
	     *  When deleted, the user will receive a MWI XMPP notification.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    deleteAVoiceMessage(messageId: string): Promise<unknown>;
	    /**
	     * @method deleteAllVoiceMessages
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {string} messageId Message identifier.
	     * @description
	     *  Deletion of all user's voice messages.<br>
	     *  When updated, the user will receive a MWI XMPP notification.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    deleteAllVoiceMessages(messageId: string): Promise<unknown>;
	    /**
	     * @method getEmergencyNumbersAndEmergencyOptions
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @description
	     *  This api returns emergency numbers the user can use (+ emergency options).<br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | emergencyNumbers | Object\[\] | Array of emergency numbers |
	     * | outgoingPrefix | String | Reminder of what is the outgoing prefix for the Cloud PBX |
	     * | emergencyOptions | Object | Emergency options |
	     * | callAuthorizationWithSoftPhone | Boolean | Indicates if SoftPhone can perform an emergency call over voip |
	     * | number | String | emergency number |
	     * | description | String | description of the emergency number |
	     *
	     */
	    getEmergencyNumbersAndEmergencyOptions(): Promise<unknown>;
	    /**
	     * @method getVoiceMessages
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @param {number} limit Allow to specify the number of voice messages to retrieve. Default value : 100.
	     * @param {number} offset Allow to specify the position of first voice messages to retrieve. Default value : 0.
	     * @param {string} sortField Sort voice messages list based on the given field. Default value : date.
	     * @param {number} sortOrder Specify order when sorting voice messages. Default is descending. Default value : -1. Possible values : -1, 1 .
	     * @param {string} fromDate List voice messages created after the given date.
	     * @param {string} toDate List voice messages created before the given date.
	     * @param {string} callerName List voice messages with caller party name containing the given value.
	     * @param {string} callerNumber List voice messages with caller party number containing the given value.
	     * @description
	     *  Returns the list of voice messages.<br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | id  | String | voice message identifier |
	     * | fileName | String | File name of the voice message - composed of the voice message date |
	     * | mime | String | MIME type of the voice message file<br>Possible values : `audio/mpeg` |
	     * | size | Number | Size of the voice message file (in bytes). |
	     * | duration | Number | Duration of the voice message (in seconds) |
	     * | date | Date | Date of the voice message |
	     * | callerInfo | Object | Caller party info |
	     * | data | Object\[\] | Voice messages |
	     * | number | String | Caller number |
	     * | name optionnel | String | Caller name, if available |
	     * | firstName optionnel | String | Caller firstName, if available |
	     * | lastName optionnel | String | Caller lastName, if available |
	     * | userId optionnel | String | Caller user identifier if it can be resolved. |
	     * | jid optionnel | String | Caller Jid if it can be resolved. |
	     *
	     */
	    getVoiceMessages(limit: number, offset: number, sortField: string, sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string): Promise<unknown>;
	    /**
	     * @method getUserDevices
	     * @async
	     * @category Rainbow Voice Voice
	     * @instance
	     * @description
	     *  This api returns user devices information.<br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | id  | String | Device Unique Identifier |
	     * | deviceId | String | Device identifier to use for 3PCC requests (like MakeCall) |
	     * | type | String | Device type (enumeration ; values are : "sip" ; "webrtc") |
	     * | jid_wrg | String | Jabber identifier of the associated Web Rtc Gateway (only set when type is "webrtc") |
	     *
	     */
	    getUserDevices(): Promise<unknown>;
	    /**
	     * @method updateVoiceMessage
	     * @async
	     * @category Rainbow Voice Voice
	     * @param {string} messageId Message Identifier.
	     * @param {Object} urlData : <br>
	     *     urlData.read : boolean Mark the message as read or unread.<br>
	     * @instance
	     * @description
	     *  Update the given voice message - mark it as read or unread.<br>
	     *  When a message is 'unread', it is considered as a new message. On the opposite, a 'read' message is considered as an old message.<br>
	     * @return {Promise<any>} the result.
	     *
	     * | Champ | Type | Description |
	     * | --- | --- | --- |
	     * | messageUpdateResult | Object | message Updated message |
	     *
	     */
	    updateVoiceMessage(messageId: string, urlData: {
	        read: boolean;
	    }): Promise<unknown>;
	    /**
	     * @method forwardCall
	     * @async
	     * @category Rainbow Voice Voice Forward
	     * @param {string} callForwardType The forward type to update. Possible values : immediate, busy, noreply
	     * @param {string} userId Identifier of the user for which we want to set the forwards. Requesting user must be a supervisor.
	     * @param {Object} urlData : <br>
	     *     urlData.destinationType : string The destination type. Possible values : internalNumber, externalNumber, voicemail .<br>
	     *     urlData.number : string The number to forward.<br>
	     *     urlData.activate : boolean Activate or cancel a forward.<br>
	     *     urlData.noReplyDelay : number in case of 'noreply' forward type, timeout in seconds after which the call will be forwarded. Default value : 20. Possible values : {10-60} .<br>
	     * @instance
	     * @description
	     *  This api activates/deactivates a forward.<br>
	     *  Group forward (immediate/managersecretary) is not supported here. There is a dedicated API for group forward management (Cloud PBX group forwards)<br>
	     *  If the destinationType is "voicemail" and overflow is enabled on the Cloud PBX or/and forced on the subscriber, the overflow configuration (noReplyDelay) will be use.<br>
	     *  <br>
	     *  A supervisor can also set the forward of a user by providing its identifier as a parameter, as well as the supervision group identifier.<br>
	     *  In such case, the requesting user must be supervisor of the given supervision group, and the requested user must 'supervised' in the given group.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    forwardCall(callForwardType: string, userId: string, urlData: {
	        destinationType: string;
	        number: string;
	        activate: boolean;
	        noReplyDelay: number;
	    }): Promise<unknown>;
	    /**
	     * @method getASubscriberForwards
	     * @async
	     * @category Rainbow Voice Voice Forward
	     * @param {string} userId Identifier of the user for which we want to get the forwards. Requesting user must be a supervisor.
	     * @instance
	     * @description
	     *  This api gets the user forwards.<br>
	     *  For internalnumber forward, on return data you will see the userId/rvcpGroupId/rvcpAutoAttendantId with the associated name.<br>
	     *  If name equals "null" or the id equals "null", the concerned user/rvcpGroup/rvcpAutoAttendantId is deleted, please remove the associated forward.<br>
	     *  <br>
	     *  A supervisor can request the forwards of a user by providing its identifier as a parameter.<br>
	     *  The requesting user must be supervisor of the given supervised user.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    getASubscriberForwards(userId: string): Promise<unknown>;
	    /**
	     * @method searchCloudPBXhuntingGroups
	     * @async
	     * @category Rainbow Voice Voice Search Hunting Groups
	     * @param {string} name Search hunting groups on the given name
	     * @instance
	     * @description
	     *  This API allows to retrieve Cloud PBX Hunting Groups.<br>
	     * @return {Promise<any>} the result.
	     *
	     */
	    searchCloudPBXhuntingGroups(name: string): Promise<unknown>;
	}
	export { RBVoiceService as RBVoiceService };

}
declare module 'lib/services/HTTPoverXMPPService' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { Logger } from 'lib/common/Logger';
	import { Core } from 'lib/Core';
	import { GenericService } from 'lib/services/GenericService';
	export {}; class HTTPoverXMPP extends GenericService {
	    private avatarDomain;
	    private readonly _protocol;
	    private readonly _host;
	    private readonly _port;
	    private hTTPoverXMPPHandlerToken;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
	        start_up: boolean;
	        optional: boolean;
	    });
	    start(_options: any, _core: Core): Promise<unknown>;
	    stop(): Promise<unknown>;
	    init(useRestAtStartup: boolean): Promise<void>;
	    attachHandlers(): void;
	    /**
	     * @public
	     * @method get
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a GET http request to an XMPP server supporting Xep0332. <br>
	     * @param {string} urlToGet The url to request
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    get(urlToGet: string, headers?: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method discoverHTTPoverXMPP
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a discover presence to a bare jid to find the resources availables. <br>
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    discoverHTTPoverXMPP(headers?: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method trace
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a TRACE http request to an XMPP server supporting Xep0332. TRACE is only used for debugging <br>
	     * @param {string} urlToTrace The url to request
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    trace(urlToTrace: string, headers?: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method head
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a HEAD http request to an XMPP server supporting Xep0332. <br>
	     * @param {string} urlToHead The url to request
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    head(urlToHead: string, headers?: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method post
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a POST http request to an XMPP server supporting Xep0332. <br>
	     * @param {string} urlToPost The url to request
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} data The body data of the http request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    post(urlToPost: string, headers: any, data: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method put
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a PUT http request to an XMPP server supporting Xep0332. <br>
	     * @param {string} urlToPost The url to request
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} data The body data of the http request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    put(urlToPost: string, headers: any, data: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method delete
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to send a DELETE http request to an XMPP server supporting Xep0332. <br>
	     * @param {string} urlToPost The url to request
	     * @param {Object} headers The Http Headers used to web request.
	     * @param {string} data The body data of the http request.
	     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
	     * @return {Promise<any>} An object of the result
	     */
	    delete(urlToPost: string, headers: any, data: any, httpoverxmppserver_jid?: string): Promise<unknown>;
	    /**
	     * @private
	     * @method discover
	     * @since 2.10.0
	     * @instance
	     * @async
	     * @category Rainbow HTTPoverXMPP
	     * @description
	     *    This API allows to get the supported XMPP services. <br>
	     * @return {Promise<any>} An object of the result
	     */
	    discover(): Promise<unknown>;
	}
	export { HTTPoverXMPP as HTTPoverXMPP };

}
declare module 'lib/Core' {
	/// <reference types="node" />
	import { XMPPService } from 'lib/connection/XMPPService';
	import { RESTService } from 'lib/connection/RESTService';
	import { HTTPService } from 'lib/connection/HttpService';
	import { ImsService } from 'lib/services/ImsService';
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
	import { S2SService } from 'lib/services/S2SService';
	import { WebinarsService } from 'lib/services/WebinarsService';
	import { RBVoiceService } from 'lib/services/RBVoiceService';
	import { HTTPoverXMPP } from 'lib/services/HTTPoverXMPPService';
	import { TimeOutManager } from 'lib/common/TimeOutManager';
	export {}; class Core {
	    get timeOutManager(): TimeOutManager;
	    set timeOutManager(value: TimeOutManager);
	    logger: any;
	    _rest: RESTService;
	    _eventEmitter: Events;
	    options: any;
	    _proxy: ProxyImpl;
	    _http: HTTPService;
	    _xmpp: XMPPService;
	    _stateManager: StateManager;
	    _im: ImsService;
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
	    _webinars: WebinarsService;
	    _rbvoice: RBVoiceService;
	    _invitations: InvitationsService;
	    _httpoverxmpp: HTTPoverXMPP;
	    _botsjid: any;
	    _s2s: S2SService;
	    cleanningClassIntervalID: NodeJS.Timeout;
	    private _timeOutManager;
	    static getClassName(): string;
	    getClassName(): string;
	    constructor(options: any);
	    _signin(forceStopXMPP: any, token: any): Promise<unknown>;
	    _signinWSOnly(forceStopXMPP: any, token: any, userInfos: any): Promise<unknown>;
	    _retrieveInformation(): Promise<unknown>;
	    setRenewedToken(strToken: string): Promise<void>;
	    onTokenRenewed(): void;
	    onTokenExpired(): void;
	    _tokenSurvey(): void;
	    startCleanningInterval(): void;
	    start(token: any): Promise<unknown>;
	    signin(forceStopXMPP: any, token: any): Promise<unknown>;
	    signinWSOnly(forceStopXMPP: any, token: any, userInfos: any): Promise<unknown>;
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
	    get im(): ImsService;
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
	import { ImsService } from 'lib/services/ImsService';
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
	import { DataStoreType } from 'lib/config/config';
	import { WebinarsService } from 'lib/services/WebinarsService';
	import { RBVoiceService } from 'lib/services/RBVoiceService';
	import { HTTPoverXMPP } from 'lib/services/HTTPoverXMPPService'; class NodeSDK {
	    private _option;
	    get option(): {};
	    _core: Core;
	    startTime: Date;
	    static NodeSDK: any;
	    private logger;
	    /**
	     * @method constructor
	     * @public
	     * @description
	     *      The entry point of the Rainbow Node SDK.
	     * @param {Object} options SDK Startup options of constructor.
	     * @param {string} options.rainbow.host "official", Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO.
	     * @param {string} options.rainbow.mode "xmpp", The event mode used to receive the events. Can be `xmpp` or `s2s` (default : `xmpp`).
	     * @param {string} options.xmpp.timeBetweenXmppRequests the time between two xmpp request (avoid burst)
	     * @param {string} options.xmpp.raiseLowLevelXmppInEvent enable the raise of event "rainbow_onxmmpeventreceived" when a data is received in xmpp pipe.
	     * @param {string} options.xmpp.xmppRessourceName to define the name of the xmpp resource.
	     * @param {string} options.xmpp.raiseLowLevelXmppOutReq enable the raise of event "rainbow_onxmmprequestsent" when a data is sent in xmpp pipe.
	     * @param {string} options.xmpp.maxIdleTimer to define the delay without xmpp exchange after which a ping is sent to server.
	     * @param {string} options.xmpp.maxPingAnswerTimer to define the time to wait the xmpp ping response.
	     * @param {string} options.s2s.hostCallback "http://3d260881.ngrok.io", S2S Callback URL used to receive events on internet.
	     * @param {string} options.s2s.locallistenningport "4000", Local port where the events must be forwarded from S2S Callback Web server.
	     * @param {string} options.rest.useRestAtStartup enable the REST requests to the rainbow server at startup (used with startWSOnly method). default value is true.
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
	     * @param {string} options.logs.enableEncryptedLogs: true, Activate the encryption of stanza in logs.
	     * @param {string} options.logs.color true, Activate the ansii color in the log (more humain readable, but need a term console or reader compatible (ex : vim + AnsiEsc module)).
	     * @param {string} options.logs.level "info", The level of logs. The value can be "info", "debug", "warn", "error".
	     * @param {string} options.logs.customLabel "MyRBProject", A label inserted in every lines of the logs. It is usefull if you use multiple SDK instances at a same time. It allows to separate logs in console.
	     * @param {string} options.logs.file.path "c:/temp/", Path to the log file.
	     * @param {string} options.logs.file.customFileName "R-SDK-Node-MyRBProject", A label inserted in the name of the log file.
	     * @param {string} options.logs.file.zippedArchive false Can activate a zip of file. It needs CPU process, so avoid it.
	     * @param {string} options.testOutdatedVersion true, Parameter to verify at startup if the current SDK Version is the lastest published on npmjs.com.
	     * @param {string} options.testDNSentry true, Parameter to verify at startup/reconnection that the rainbow server DNS entry name is available.
	     * @param {string} options.httpoverxmppserver false, Activate the treatment of Http over Xmpp requests (xep0332).
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
	     * @param {string} options.im.messagesDataStore Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour).<br>
	     *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
	     *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
	     *                          DataStoreType.StoreTwinSide The messages are fully stored.<br>
	     *                          DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.
	     * @param {string} options.im.autoInitialBubblePresence to allow automatic opening of conversation to the bubbles with sending XMPP initial presence to the room. Default value is true.
	     * @param {string} options.im.autoLoadConversations to activate the retrieve of conversations from the server. The default value is true.
	     * @param {string} options.im.autoLoadContacts to activate the retrieve of contacts from roster from the server. The default value is true.
	     * @param {string} options.im.enablesendurgentpushmessages permit to add <retry-push xmlns='urn:xmpp:hints'/> tag to allows the server sending this messge in push with a small ttl (meaning urgent for apple/google backend) and retry sending it 10 times to increase probability that it is received by mobile device. The default value is false.
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
	     * @param {String} token a valid token to login without login/password. <br>
	     * if Oauth token is provided to the SDK then application MUST implement the refresh token and send it back to SDK with `setRenewedToken` API, while following event are raised : <br>
	     * Events rainbow_onusertokenrenewfailed : fired when an oauth token is expired. <br>
	     * Events rainbow_onusertokenwillexpire : fired when the duration of the current user token reaches half of the maximum time. <br>
	     *      For instance, if the token is valid for 1 hour, this event will arrive at 30 minutes. <br>
	     *      It is recommended to renew the token upon the arrival of this event. <br>
	     * @description
	     *    Start the SDK <br>
	     *    Note :<br>
	     *    The token must be empty to signin with credentials.<br>
	     *    The SDK is disconnected when the renew of the token had expired (No initial signin possible with out credentials.)<br>
	     *    There is a sample using the oauth and sdk at https://github.com/Rainbow-CPaaS/passport-rainbow-oauth2-with-rainbow-node-sdk-example <br>
	     * @memberof NodeSDK
	     */
	    start(token?: string): Promise<unknown>;
	    /**
	     * @public
	     * @method start
	     * @instance
	     * @description
	     *    Start the SDK with only XMPP link<br>
	     *    Note :<br>
	     * @memberof NodeSDK
	     */
	    startWSOnly(token: any, userInfos: any): Promise<unknown>;
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
	     * @method setRenewedToken
	     * @instance
	     * @description
	     *    Set the token renewed externaly of the SDK. This is for oauth authentication.
	     * @memberof NodeSDK
	     */
	    setRenewedToken(strToken: any): Promise<void>;
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
	     * @return {ImsService}
	     */
	    get im(): ImsService;
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
	     * @property {RBVoiceService} alerts
	     * @description
	     *    Get access to the webinar module
	     * @return {RBVoiceService}
	     */
	    get rbvoice(): RBVoiceService;
	    /**
	     * @public
	     * @property {WebinarsService} alerts
	     * @description
	     *    Get access to the webinar module
	     * @return {WebinarsService}
	     */
	    get webinars(): WebinarsService;
	    /**
	     * @public
	     * @property {HTTPoverXMPP} httpoverxmpp
	     * @description
	     *    Get access to the httpoverxmpp module
	     * @return {HTTPoverXMPP}
	     */
	    get httpoverxmpp(): HTTPoverXMPP;
	    /**
	     * @public
	     * @property {Object} DataStoreType
	     * @description
	     *    Get access to the DataStoreType type
	     * @return {DataStoreType}
	     */
	    static get DataStoreType(): typeof DataStoreType;
	    /**
	     * @public
	     * @method getConnectionStatus
	     * @instance
	     * @description
	     *    Get connections status of each low layer services, and also the full SDK state. <br>
	     * <br>
	     * { <br>
	     * restStatus: boolean, The status of the REST connection authentication to rainbow server. <br>
	     * xmppStatus: boolean, The status of the XMPP Connection to rainbow server. <br>
	     * s2sStatus: boolean, The status of the S2S Connection to rainbow server. <br>
	     * state: SDKSTATUSENUM The state of the SDK. <br>
	     * nbHttpAdded: number, the number of HTTP requests (any verb GET, HEAD, POST, ...) added in the HttpManager queue. Note that it is reset to zero when it reaches Number.MAX_SAFE_INTEGER value. <br>
	     * httpQueueSize: number, the number of requests stored in the Queue. Note that when a request is sent to server, it is already removed from the queue. <br>
	     * nbRunningReq: number, the number of requests which has been poped from the queue and the SDK did not yet received an answer for it. <br>
	     * maxSimultaneousRequests : number, the number of request which can be launch at a same time. <br>
	     * nbReqInQueue : number, the number of requests waiting for being treated by the HttpManager.  <br>
	     * } <br>
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
	     *    Get connections Appreciation type. <br>
	     * @return {Appreciation}
	     */
	    static get Appreciation(): typeof Appreciation;
	}
	export default NodeSDK;
	export { NodeSDK as NodeSDK };

}
declare module 'index' {
	import { NodeSDK } from 'lib/NodeSDK';
	export default NodeSDK;
	export { NodeSDK as NodeSDK };

}
declare module 'Samples/index' {
	export {};

}
declare module 'Samples/samplesTests' {
	export {};

}
declare module 'Samples/testStop' {
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
