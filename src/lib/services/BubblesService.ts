"use strict";

import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import * as deepEqual from "deep-equal";
import {GuestParams, MEDIATYPE} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Bubble} from "../common/models/Bubble";
import {EventEmitter} from "events";
import {createPromiseQueue} from "../common/promiseQueue";
import {
    addParamToUrl,
    getBinaryData, isDefined,
    isStarted,
    logEntryExit,
    resizeImage,
    traceExecutionTime,
    until
} from "../common/Utils";
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {ProfilesService} from "./ProfilesService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";
import {Contact} from "../common/models/Contact";
import {ConferenceSession, Participant} from "../common/models/ConferenceSession";
import {ConferencePassCodes} from "../common/models/ConferencePassCodes";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";
import {Conference} from "../common/models/Conference";
import {BubblesManager} from "../common/BubblesManager";
import {GenericService} from "./GenericService";
import {Conversation} from "../common/models/Conversation.js";
import {ConversationsService} from "./ConversationsService.js";

export {};

const LOG_ID = "BUBBLES/SVCE - ";
const API_ID = "API_CALL - ";

@logEntryExit(LOG_ID)
@isStarted([])
    /**
     * @module
     * @name Bubbles
     * @version SDKVERSION
     * @public
     * @description
     *      This service manages multi-party communications (aka bubbles). Bubbles allow to chat and to share files with several participants.<br><br>
     *      Each user can create bubbles and invite other users to be part of it. <br>
     *      <br><br>
     *      The main methods proposed in that module allow to: <br>
     *      - Create a new bubble <br>
     *      - Invite users in a bubble or remove them <br>
     *      - Manage a bubble: close, delete <br>
     *      - Leave a bubble <br>
     *      - Accept or decline an invitation to join a bubble <br>
     *      - Change the custom data attached to a bubble <br>
     */
class Bubbles extends GenericService {
    private _bubbles: Bubble[];
    private avatarDomain: string;
    private _contactsService : ContactsService;
    private _conversations: ConversationsService;
    private _profileService: ProfilesService;
    private _presence: PresenceService;
    private _personalConferenceBubbleId: any;
    private _personalConferenceConfEndpointId: any;
    //private _conferencesSessionById: { [id: string] : any; } = {};     // <Conference Id, Conference>
    private _conferenceEndpoints: IDictionary<string, Conference> = new Dictionary();     // <Conference Id, Conference>
    private _conferencesSessionById: IDictionary<string, ConferenceSession> = new Dictionary();     // <Conference Id, Conference>
    private _webrtcConferenceId: string;
    _webConferenceRoom: any;
    private readonly _protocol: string = null;
    private readonly _host: string = null;
    private readonly _port: string = null;
    private bubblesManager: BubblesManager;

    static getClassName() { return 'Bubbles'; }
    getClassName() { return Bubbles.getClassName(); }

    static getAccessorName(){ return 'bubbles'; }
    getAccessorName(){ return Bubbles.getAccessorName(); }

    constructor(_core:Core, _eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up: boolean,
        optional: boolean
    }) {
        super(_logger, LOG_ID, _eventEmitter);
        this.setLogLevels(this);
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._bubbles = [];
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._startConfig = _startConfig;
        this._protocol = _http.protocol;
        this._host = _http.host;
        this._port = _http.port;

        this._core = _core;

        this.bubblesManager = new BubblesManager(this._eventEmitter, this._logger)

        this.avatarDomain = this._host.split(".").length===2 ? this._protocol + "://cdn." + this._host + ":" + this._port:this._protocol + "://" + this._host + ":" + this._port;

        this._eventEmitter.on("evt_internal_invitationreceived", this._onInvitationReceived.bind(this));
        this._eventEmitter.on("evt_internal_contactinvitationreceived", this._onContactInvitationReceived.bind(this));
        this._eventEmitter.on("evt_internal_affiliationchanged", this._onAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_contactchanged", this._onBubbleContactChanged.bind(this));
        this._eventEmitter.on("evt_internal_ownaffiliationchanged", this._onOwnAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_customdatachanged", this._onCustomDataChanged.bind(this));
        this._eventEmitter.on("evt_internal_topicchanged", this._onTopicChanged.bind(this));
        this._eventEmitter.on("evt_internal_namechanged", this._onNameChanged.bind(this));
        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));
        this._eventEmitter.on("evt_internal_privilegechanged", this._onPrivilegeBubbleChanged.bind(this));
        this._eventEmitter.on("evt_internal_roomscontainer", this._onBubblesContainerReceived.bind(this));
        this._eventEmitter.on("evt_internal_bubbleconferencestoppedreceived", this._onBubbleConferenceStoppedReceived.bind(this));        
        this._eventEmitter.on("evt_internal_bubblepresencesent", this._onBubblePresenceSent.bind(this));
        this._eventEmitter.on("evt_internal_bubblepollconfiguration", this._onBubblePollConfiguration.bind(this));
        this._eventEmitter.on("evt_internal_bubblepollevent", this._onBubblePollEvent.bind(this));
    }

    /**
     * @method start
     * @private
     * @return {Promise<void>}
     */
    start(_options) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _profileService : ProfilesService
        let that = this;
        that.initStartDate();

        return new Promise(async function (resolve, reject) {
            try {
                await that.bubblesManager.init(_options, that._core);
                that._xmpp = that._core._xmpp;
                that._rest = that._core._rest;
                that._bubbles = [];
                that._contactsService  = that._core.contacts;
                that._conversations = that._core.conversations;
                that._profileService = that._core.profiles;
                that._presence = that._core.presence;
                that._options = _options;
                that._s2s = that._core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;

                /*
                                that._eventEmitter.on("evt_internal_invitationreceived", that._onInvitationReceived.bind(that));
                                that._eventEmitter.on("evt_internal_affiliationchanged", that._onAffiliationChanged.bind(that));
                                that._eventEmitter.on("evt_internal_ownaffiliationchanged", that._onOwnAffiliationChanged.bind(that));
                                that._eventEmitter.on("evt_internal_customdatachanged", that._onCustomDataChanged.bind(that));
                                that._eventEmitter.on("evt_internal_topicchanged", that._onTopicChanged.bind(that));
                                that._eventEmitter.on("evt_internal_namechanged", that._onNameChanged.bind(that));
                */
                await that.bubblesManager.reset();
                that.setStarted();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    /**
     * @method stop
     * @private
     * @return {Promise<void>}
     */
    stop() {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._bubbles = [];
                /*that._eventEmitter.removeListener("evt_internal_invitationreceived", that._onInvitationReceived.bind(that));
                that._eventEmitter.removeListener("evt_internal_affiliationchanged", that._onAffiliationChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_ownaffiliationchanged", that._onOwnAffiliationChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_customdatachanged", that._onCustomDataChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_topicchanged", that._onTopicChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_namechanged", that._onNameChanged.bind(that));
                that._logger.log(that.DEBUG, LOG_ID + "(stop) _exiting_");
                // */
                that.bubblesManager.reset();
                that.setStopped();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @method init
     * @private
     * @return {Promise<void>}
     */
    async init(useRestAtStartup : boolean) {
        let that = this;
        if (useRestAtStartup) {
//            await that.bubblesManager.reset();
            if (that._options._imOptions.autoInitialGetBubbles || that._options._imOptions.autoInitialGetBubbles == "true") {
                await that.getBubbles(that._options._imOptions.autoInitialBubbleFormat, that._options._imOptions.autoInitialBubbleUnsubscribed).then((result) => {
                    let bubbles = that.getAll();
                    if (bubbles && bubbles.length > 1) {
                        for (const bubble of bubbles) {
                            if (bubble.conference && bubble.conference.sessions && bubble.conference.sessions.length > 0) {
                                that._logger.log(that.INFO, LOG_ID + "(init) get snapshotConference.");
                                that.snapshotConference(bubble.id);
                            }
                        }
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(init) no bubbles at startup. ");
                    }
                    that.setInitialized();
                }).catch((err)=>{
                    that._logger.log(that.WARN, LOG_ID + "(init) error at startup : ", err);
                    that.setInitialized();
                    throw (err);
                });
            } else {
                that._logger.log(that.WARN, LOG_ID + "(init) autoInitialGetBubbles setted to false, so do not retrieve the bubbles at startup. ");
                that.setInitialized();
            }
        } else {
            that.setInitialized();
        }
    }
    
    async reset() {
        let that = this ; 
        return await that.bubblesManager.reset();
    }

    //region Events

    /**
     * @private
     * @method _onInvitationReceived
     * @instance
     * @param {Object} invitation contains informations about bubble and user's jid
     * @description
     *      Method called when receiving an invitation to join a bubble <br>
     */
    _onInvitationReceived(invitation : any) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + "(_onInvitationReceived) received. ");
        that._logger.log(that.INTERNAL, LOG_ID + "(_onInvitationReceived) invitation : ", invitation);

        if (invitation && invitation.bubbleId) {
            this._rest.getBubble(invitation.bubbleId).then(async (bubbleUpdated: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(_onInvitationReceived) invitation received from bubble.");
                that._logger.log(that.INTERNAL, LOG_ID + "(_onInvitationReceived) invitation received from bubble : ", bubbleUpdated?.id);

                let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                that._eventEmitter.emit("evt_internal_invitationdetailsreceived", bubble);
            }).catch((err) => {
                that._logger.log(that.WARN, LOG_ID + "(_onInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
                //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
            });
        } else  if (invitation && invitation.bubbleJid) {
            this._rest.getBubbleByJid(invitation.bubbleJid).then(async (bubbleUpdated: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(_onInvitationReceived) invitation received from bubble.");
                that._logger.log(that.INTERNAL, LOG_ID + "(_onInvitationReceived) invitation received from bubble : ", bubbleUpdated?.id);

                let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                that._eventEmitter.emit("evt_internal_invitationdetailsreceived", bubble);
            }).catch((err) => {
                that._logger.log(that.WARN, LOG_ID + "(_onInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
                //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
            });
        } else {
            that._logger.log(that.WARN, LOG_ID + "(_onInvitationReceived) failed to find bubble for invitation : ", invitation);
        }
    }

    /**
     * @private
     * @method _onContactInvitationReceived
     * @instance
     * @param {Object} invitation contains informations about bubble and user's jid
     * @description
     *      Method called when receiving an invitation to join a bubble for a contact<br>
     */
    _onContactInvitationReceived(invitation : any) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + "(_onContactInvitationReceived) received. ");
        that._logger.log(that.INTERNAL, LOG_ID + "(_onContactInvitationReceived) invitation : ", invitation);

        if (invitation && invitation.bubbleJid) {
            this._rest.getBubbleByJid(invitation.bubbleJid).then(async (bubbleUpdated: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(_onContactInvitationReceived) invitation received from bubble.");
                that._logger.log(that.INTERNAL, LOG_ID + "(_onContactInvitationReceived) invitation received from bubble : ", bubbleUpdated?.id);
                let contact = await that._contactsService .getContactByJid(invitation.contact_jid);
                //that._logger.log(that.INFO, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference invitation received for somebody else contact : ", contact?contact.id:"", ",\n  content (=body) : ", content, ", subject : ", subject);
                let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                let invitationFull = {
                    contact: contact,
                    bubble: bubble,
                    content : invitation.content,
                    subject : invitation.subject
                };


                that._eventEmitter.emit("evt_internal_contactinvitationdetailsreceived", invitationFull);
            }).catch((err) => {
                that._logger.log(that.WARN, LOG_ID + "(_onContactInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
                //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onContactInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
            });
        } else {
            that._logger.log(that.WARN, LOG_ID + "(_onContactInvitationReceived) receive empty invitation : ", invitation);
        }
    }

    /**
     * @private
     * @method _onAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when affilitation to a bubble changed <br>
     */
    async _onAffiliationChanged(affiliation : any) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(_onAffiliationChanged) affiliation : ", affiliation);

        await this._rest.getBubble(affiliation.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log(that.DEBUG, LOG_ID + "(_onAffiliationChanged) user affiliation changed for bubble.");
            that._logger.log(that.INTERNAL, LOG_ID + "(_onAffiliationChanged) user affiliation changed for bubble : ", bubbleUpdated?.id, ", affiliation : ", affiliation);

            let bubbleProm = that.addOrUpdateBubbleToCache(bubbleUpdated);
            let bubble = await bubbleProm;

            /*// Update the existing local bubble stored
            let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            } // */

            that._eventEmitter.emit("evt_internal_bubbleaffiliationchanged", bubble);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onAffiliationChanged) get bubble failed for affiliation : ", affiliation, ", : ", err);
            //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onAffiliationChanged) get bubble failed for affiliation : ", affiliation, ", : ", err);
        });
    }

    /**
     * @private
     * @method _onBubbleContactChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when affilitation to a bubble changed <br>
     */
    async _onBubbleContactChanged(eventInfo : any) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubbleContactChanged) eventInfo : ", eventInfo);

        await this._rest.getBubble(eventInfo.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log(that.DEBUG, LOG_ID + "(_onBubbleContactChanged) user affiliation changed for bubble.");
            that._logger.log(that.INTERNAL, LOG_ID + "(_onBubbleContactChanged) user affiliation changed for bubble : ", bubbleUpdated?.id, ", eventInfo : ", eventInfo);

            let bubbleProm = that.addOrUpdateBubbleToCache(bubbleUpdated);
            let bubble = await bubbleProm;

            let eventData = {
                "action": eventInfo.action, // "updated"
                "bubble": bubble,
                "peer" : eventInfo.peer
            };

            that._eventEmitter.emit("evt_internal_bubblecontactchanged", eventData);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onBubbleContactChanged) get bubble failed for eventInfo : ", eventInfo, ", : ", err);
            //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onAffiliationChanged) get bubble failed for affiliation : ", affiliation, ", : ", err);
        });
    }

    /**
     * @private
     * @method _onOwnAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when the user affilitation to a bubble changed <br>
     */
    async _onOwnAffiliationChanged(affiliation : any) {
        let that = this;

        that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) parameters : affiliation : ", affiliation);

        if (affiliation.status!=="deleted") {
            if (affiliation.status==="available") {
                that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) available state received. Nothing to do.");

            //   je recois un evt_internal_ownaffiliationchanged a partir d un room-invite avec le status available aulieu de invited avant en S2S.

            } else {
                await this._rest.getBubble(affiliation.bubbleId).then(async (bubbleUpdated: any) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) own affiliation changed for bubble : ", bubbleUpdated.name + " | " + affiliation.status);
                    let bubble = null;

                    // Update the existing local bubble stored
                    let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id===bubbleUpdated.id);
                    if (foundIndex > -1) {
                        bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                        //bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                        //that._bubbles[foundIndex] = bubbleUpdated;
                        if (affiliation.status==="accepted") {
                            if (that._options._imOptions.autoInitialBubblePresence) {
                                if (bubble.isActive) {
                                    that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                                     await that._presence.sendInitialBubblePresenceSync(bubble).catch((errOfSent) => {
                                        that._logger.log(that.WARN, LOG_ID + "(_onOwnAffiliationChanged) Error while sendInitialBubblePresenceSync : ", errOfSent);                                       
                                    }); 
                                } else {
                                    that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                                }
                            } else {
                                that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        } else if (affiliation.status==="unsubscribed") {
                            that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                        }
                    } else {
                         bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                        /*bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                        that._bubbles.push(bubbleUpdated); // */
                        // New bubble, send initial presence
                        if (that._options._imOptions.autoInitialBubblePresence) {
                            if (bubble.isActive) {
                                that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                                await that._presence.sendInitialBubblePresenceSync(bubble).catch((errOfSent) => {
                                    that._logger.log(that.WARN, LOG_ID + "(_onOwnAffiliationChanged) Error while sendInitialBubblePresenceSync : ", errOfSent);
                                });
                            } else {
                                that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        } else {
                            that._logger.log(that.DEBUG, LOG_ID + "(_onOwnAffiliationChanged) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
                        }

                    }

                    that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubble ? bubble : bubbleUpdated);
                }).catch((err) => {
                    that._logger.log(that.WARN, LOG_ID + "(_onOwnAffiliationChanged) get bubble failed for affiliation : ", affiliation, ", : ", err);
                    //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onOwnAffiliationChanged) get bubble failed for affiliation : ", affiliation, ", : ", err);
                });
            }
        } else {

            // remove it
            let bubbleToRemoved = that._bubbles.findIndex(function (el) {
                return el.id===affiliation.bubbleId;
            });
            //*/

            if (bubbleToRemoved!= -1) {
                let bubbleRemoved = await that.removeBubbleFromCache(affiliation.bubbleId);
                that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubbleRemoved);
                that._eventEmitter.emit("evt_internal_bubbledeleted", bubbleRemoved);
            } else {
                that._logger.log(that.WARN, LOG_ID + "(_onOwnAffiliationChanged) deleted bubble not found in cache, so raised the deleted event with only the id of this bubble : ", affiliation.bubbleId);
                let bubble = {id: null};
                bubble.id = affiliation.bubbleId;
                that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubble);
                that._eventEmitter.emit("evt_internal_bubbledeleted", bubble);
            } // */
        }
    }

    /**
     * @private
     * @method _onCustomDataChanged
     * @instance
     * @param {Object} data contains information about bubble and new custom data received
     * @description
     *      Method called when custom data have changed for a bubble <br>
     */
    _onCustomDataChanged(data : any) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {

            that._logger.log(that.INTERNAL, LOG_ID + "(_onCustomDataChanged) Custom data changed for bubble : ", bubbleUpdated.name + " | " + data.customData);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

            /*// Update the existing local bubble stored
            let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            } // */

            that._eventEmitter.emit("evt_internal_bubblecustomDatachanged", bubble);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onCustomDataChanged) get bubble failed for data : ", data, ", : ", err);
        });
    }

    /**
     * @private
     * @method _onTopicChanged
     * @instance
     * @param {Object} data contains information about bubble new topic received
     * @description
     *      Method called when the topic has changed for a bubble <br>
     */
    _onTopicChanged(data : any) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onTopicChanged) Topic changed for bubble : ", bubbleUpdated.name + " | " + data.topic);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
            /*// Update the existing local bubble stored
            let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            } // */

            that._eventEmitter.emit("evt_internal_bubbletopicchanged", bubble);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onTopicChanged) get bubble failed for data : ", data, ", : ", err);
        });
    }

    /**
     * @private
     * @method _onPrivilegeBubbleChanged
     * @instance
     * @param {Object} bubbleInfo modified bubble info
     * @description
     *     Method called when the owner of a bubble changed. <br>
     */
    async _onPrivilegeBubbleChanged(bubbleInfo : any) {
        /*
        let that = this;
        let ownerContact = await that.getContactById(bubbleInfo.creator, false);
         */
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(_onPrivilegeBubbleChanged) privilege changed for bubbleInfo : ", bubbleInfo);

        this._rest.getBubble(bubbleInfo.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onPrivilegeBubbleChanged) privilege changed for bubble : ", bubbleUpdated.name);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
            that._eventEmitter.emit("evt_internal_bubbleprivilegechanged", {bubble, "privilege": bubbleInfo.privilege});
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onPrivilegeBubbleChanged) get bubble failed for bubbleInfo : ", bubbleInfo, ", : ", err);
        });
    }


    /**
     * @private
     * @method _onNameChanged
     * @instance
     * @param {Object} data contains information about bubble new name received
     * @description
     *      Method called when the name has changed for a bubble <br>
     */
    _onNameChanged(data : any) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onNameChanged) Name changed for bubble : ", bubbleUpdated.name + " | " + data.name);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

            /*// Update the existing local bubble stored
            let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            } // */

            that._eventEmitter.emit("evt_internal_bubblenamechanged", bubble);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onNameChanged) get bubble failed for data : ", data, ", : ", err);
        });
    }

    _onBubblePollConfiguration(data : any) {
        let that = this;
        /*
        let pollObj = {
                                "action": action,
                                "roomid": msg.getChild("roomid").text(),
                                "pollid": msg.getChild("pollid").text(),
                            };
         */

        that.getBubbleById(data.roomid).then(async (bubble: Bubble) => {
            that._logger.log(that.DEBUG, LOG_ID + "(_onBubblePollConfiguration) poll in bubble : " + data.roomid);
            //let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

            let eventName = "evt_internal_bubble_poll_" + data.action;
            let objPoll = {
                pollId : data.pollid,
                bubble
            };
            
            that._eventEmitter.emit(eventName, objPoll);
        });
    }

    _onBubblePollEvent(data : any) {
        let that = this;
        /*
        let pollObj = {
                                "action": action,
                                "roomid": msg.getChild("roomid").text(),
                                "pollid": msg.getChild("pollid").text(),
                            };
         */

        that.getBubbleById(data.roomid).then(async (bubble: Bubble) => {
            that._logger.log(that.DEBUG, LOG_ID + "(_onBubblePollEvent) poll in bubble : " + data.roomid);
            //let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

            let eventName = "evt_internal_bubble_poll_" + data.event;
            let objPoll = {
                "pollId" : data.pollid,
                bubble,
                "questions" : data.questions
            };
            
            that._eventEmitter.emit(eventName, objPoll);
        }).catch ((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onBubblePollEvent) Failed to find the room : " + data.roomid + ", so no poll event raised.");
        });
    }

    /**
     * @private
     * @method _onBubblePresenceSent
     * @instance
     * @param {Object} data contains information about bubble where the presence as been sent to receiv bubble events.
     * @description
     *      Method called when the presence has been sent to a bubble <br>
     */
    _onBubblePresenceSent(data : any) {
        let that = this;

        //this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {
        this._rest.getBubble(data.id).then(async (bubbleUpdated: any) => {
            that._logger.log(that.DEBUG, LOG_ID + "(_onBubblePresenceSent) Presence sent to bubble : " + data.id);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

            //that._eventEmitter.emit("evt_internal_bubble___", bubble);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onBubblePresenceSent) get bubble failed for data : ", data, ", : ", err);
        });
    }

    /**
     * @private
     * @method _onbubblepresencechanged
     * @instance
     * @param {Object} bubbleInfo contains information about bubble
     * @description
     *      Method called when the name has changed for a bubble <br>
     */
    async _onbubblepresencechanged(bubbleInfo : any) {
        let that = this;

        that._logger.log(that.DEBUG, LOG_ID + "(_onbubblepresencechanged) bubble presence received for : ", bubbleInfo.jid);
        //that._logger.log(that.INTERNAL, LOG_ID + "(_onbubblepresencechanged) bubble presence : ", bubbleInfo );
        // Find the bubble in service list, and else retrieve it from server.
        let bubbleInMemory: Bubble;
        bubbleInMemory = await that.getBubbleByJid(bubbleInfo.jid);
// that._bubbles.find((bubbleIter) => { return bubbleIter.jid === bubbleInfo.jid ; });
        if (bubbleInMemory) {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onbubblepresencechanged) bubble found in memory : ", bubbleInMemory.jid);
            if (bubbleInfo.statusCode==="resumed") {
                if (that._options._imOptions.autoInitialBubblePresence) {
                    that._presence.sendInitialBubblePresenceSync(bubbleInfo).then(() => {
                        bubbleInMemory.isActive = true;
                        that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
                    }).catch((errOfSent) => {
                        that._logger.log(that.WARN, LOG_ID + "(_onbubblepresencechanged) Error while sendInitialBubblePresenceSync : ", errOfSent);
                    }); 
                } else {
                    that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
                }
            } else 
            if (bubbleInfo.statusCode==="deactivated") {
                bubbleInMemory.isActive = false;
                that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
            } else {
                bubbleInMemory.initialPresence.initPresenceAck = true;
                if (bubbleInMemory.initialPresence.initPresencePromise) {
                    that._logger.log(that.INFO, LOG_ID + "(_onbubblepresencechanged) - initPresencePromise resolved");
                    bubbleInMemory.initialPresence.initPresencePromiseResolve(bubbleInMemory);
                    if (bubbleInMemory.initialPresence.initPresenceInterval) {
                        bubbleInMemory.initialPresence.initPresenceInterval.unsubscribe();
                        bubbleInMemory.initialPresence.initPresenceInterval = null;
                    }
                    /* do not reset the initPresencePromise to avoid any request of sendInitialBubblePresence to not receive the result
                    bubbleInMemory.initialPresence.initPresencePromise = null;
                    bubbleInMemory.initialPresence.initPresencePromiseResolve = null;
                    // */
                }
                //this.eventService.publish(this.ROOM_UPDATE_EVENT, bubbleInMemory);
                //this.sendEvent(this.ROOM_UPDATE_EVENT, bubbleInMemory);
                that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
            }
        } else {
            that._logger.log(that.WARN, LOG_ID + "(_onbubblepresencechanged) bubble not found !");
            //that._bubbles.push(Object.assign(new Bubble(), bubble));
        }

        // that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
    }

    /**
     * @private
     * @method _onBubblesContainerReceived
     * @instance
     * @param {Object} infos contains informations about a bubbles container
     * @description
     *      Method called when receiving an create/update/delete event of the bubbles container <br>
     */
    async _onBubblesContainerReceived(infos : any) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) infos : ", infos);

        let action = infos.action;
        let containerName = infos.containerName;
        let containerId = infos.containerId;
        let containerDescription = infos.containerDescription;
        let bubblesAdded = [];
        let bubblesIdAdded = infos.bubblesIdAdded;
        let bubblesRemoved = [];
        let bubblesIdRemoved = infos.bubblesIdRemoved;

        if (bubblesIdAdded) {
            if (Array.isArray(bubblesIdAdded)) {
                for (let i = 0; i < bubblesIdAdded.length; i++) {
                    let bubbleId = bubblesIdAdded[i];

                    //that._bubbles.forEach((bubble: Bubble) => {
                        for (const bubble of that._bubbles) {


                            if (bubble.id===bubbleId) {
                                bubble.containerId = containerId;
                                bubble.containerName = containerName;
                            }
                        }
                    //});

                    await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) container received found bubble.");
                        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) container received found bubble : ", bubbleUpdated?.id);
                        bubblesAdded.push(bubbleUpdated);
                    }).catch((err) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", err : ", err);
                    });
                }
            } else {
                let bubbleId = bubblesIdAdded;

                //that._bubbles.forEach((bubble: Bubble) => {
                    for (const bubble of that._bubbles) {
                        if (bubble.id===bubbleId) {
                            bubble.containerId = containerId;
                            bubble.containerName = containerName;
                        }
                    }
                //});

                await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) container received found bubble to add.");
                    that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) container received found bubble to add : ", bubbleUpdated?.id);
                    bubblesAdded.push(bubbleUpdated);
                }).catch((err) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", err : ", err);
                });
            }
        }

        if (bubblesIdRemoved) {
            if (Array.isArray(bubblesIdRemoved)) {
                for (let i = 0; i < bubblesIdRemoved.length; i++) {
                    let bubbleId = bubblesIdRemoved[i];

                    //that._bubbles.forEach((bubble: Bubble) => {
                        for (const bubble of that._bubbles) {
                            if (bubble.id===bubbleId) {
                                bubble.containerId = undefined;
                                bubble.containerName = undefined;
                            }
                        }
                    //});

                    await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) container received found bubble to remove.");
                        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) container received found bubble to remove : ", bubbleUpdated?.id);
                        bubblesAdded.push(bubbleUpdated);
                    }).catch((err) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", err : ", err);
                    });
                }
            } else {
                let bubbleId = bubblesIdRemoved;
                //that._bubbles.forEach((bubble: Bubble) => {
                    for (const bubble of that._bubbles) {
                        if (bubble.id===bubbleId) {
                            bubble.containerId = undefined;
                            bubble.containerName = undefined;
                        }
                    }
                //});

                await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) container received found bubble.");
                    that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) container received found bubble : ", bubbleUpdated?.id);
                    bubblesRemoved.push(bubbleUpdated);
                }).catch((err) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", : ", err);
                });
            }
        }

        let eventInfo = {containerName, containerId, containerDescription, bubblesAdded, bubblesRemoved};

        switch (action) {
            case "create": {
                that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) create action.");
                that._eventEmitter.emit("evt_internal_bubblescontainercreated", eventInfo);
            }
                break;
            case "update": {
                that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) update action.");
                that._eventEmitter.emit("evt_internal_bubblescontainerupdated", eventInfo);
            }
                break;
            case "delete": {
                //that._bubbles.forEach((bubble: Bubble) => {
                for (const bubble of that._bubbles) {
                    if (bubble.containerId===containerId) {
                        bubble.containerId = undefined;
                        bubble.containerName = undefined;
                    }
                }
                //});
                that._logger.log(that.DEBUG, LOG_ID + "(_onBubblesContainerReceived) delete action.");
                that._eventEmitter.emit("evt_internal_bubblescontainerdeleted", eventInfo);
            }
                break;
            default: {
                that._logger.log(that.WARN, LOG_ID + "(_onBubblesContainerReceived) unknown action : ", action);
            }
                break;
        }

    }

    /**
     * @method _onBubbleConferenceStoppedReceived
     * @private
     * @param bubble
     * @return {Promise<void>}
     */
    async _onBubbleConferenceStoppedReceived(bubble : any) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubbleConferenceStoppedReceived) bubble : ", bubble?.id);
        if (bubble) {
                let conference = that.getConferenceByIdFromCache(bubble.id);
                that.removeConferenceFromCache(bubble.id);
                //conference.
                if (conference) conference.active = false;
                that._eventEmitter.emit("evt_internal_bubbleconferenceupdated", conference, {});
        }
    }

    //endregion Events

//region CONFERENCE SPECIFIC

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
    conferenceAllowed(): boolean {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(conferenceAllowed) .");
        return that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().WEBRTC_CONFERENCE_ALLOWED) //that._profileService.get.IsFeatureEnabled(Feature.WEBRTC_CONFERENCE_ALLOWED);
    }

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
    getConferenceByIdFromCache(conferenceId: string): ConferenceSession // Conference
    {
        let result: any = null; // Conference
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConferenceByIdFromCache) conferenceId : ", conferenceId);
        //lock (lockConferenceDictionary)
        //{
        if (that._conferencesSessionById.containsKey(conferenceId)) {
            //result = that._conferencesSessionById[conferenceId];
            result = that._conferencesSessionById.tryGetValue(conferenceId);
        }
        //}
        return result;
    }

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
    conferenceGetListFromCache(): List<ConferenceSession> // List<Conference>
    {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(conferenceGetListFromCache) .");
        let result: List<ConferenceSession> = new List();
        that._conferencesSessionById.forEach((item) => {
            result.add(item.value);
        });
        return result;
    }

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
    /*
    public retrieveConferences(mediaType?: string, scheduled?: boolean, provisioning?: boolean): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(retrieveConferences)  with mediaType=" + mediaType + " and scheduled=" + scheduled);

        switch (mediaType) {
            case MEDIATYPE.PstnAudio:
                return;
                //return this.pstnConferenceService.retrievePstnConferences(scheduled, provisioning);
            case MEDIATYPE.WEBRTC:
            case MEDIATYPE.WEBRTCSHARINGONLY:
                //return this.BubblesService.retrieveWebConferences(mediaType);
            default:
                break;
        }

        return new Promise((resolve, reject) => {

            if (/*!this.pstnConferenceService.isPstnConferenceAvailable && */ /* !(that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().WEBRTC_CONFERENCE_ALLOWED))) {
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveConferences)  - user is not allowed");
                reject(new Error("notAllowed"));
                return;
            }
// */
            /*let urlParameters = "conferences?format=full&userId=" + this.contactService.userContact.dbId;
            if (angular.isDefined(scheduled)) {
                urlParameters += "&scheduled=" + scheduled;
            } // */
/*
            that._rest.retrieveAllConferences(scheduled).then((result: Iterable<any>) => {
                for (let conferenceData of result) {
                    switch (conferenceData.mediaType) {
                        case MEDIATYPE.PstnAudio:
                            //this.pstnConferenceService.updateOrCreatePstnConferenceEndpoint(conferenceData);
                            break;
                        case MEDIATYPE.WEBRTC:
                        case MEDIATYPE.WEBRTCSHARINGONLY:
                            //that.updateOrCreateWebConferenceEndpoint(conferenceData);
                            break;
                        default:
                            break;
                    }
                }
                resolve(result);
            }).catch(() => {
                resolve(undefined);
            });
        });
    }; // */

 //endregion CONFERENCE SPECIFIC

//region PERSONAL CONFERENCE SPECIFIC

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
    /*
    personalConferenceGetId(): string {
        let that = this;
        return that._personalConferenceConfEndpointId;
    }
    // */

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
    /*
    async personalConferenceGetBubbleFromCache(): Promise<Bubble> {
        let that = this;
//    if (!String.IsNullOrEmpty(personalConferenceBubbleId))
        //      return GetBubbleByIdFromCache(personalConferenceBubbleId);
        if (that._personalConferenceBubbleId!=null) {
            return await that.getBubbleById(that._personalConferenceBubbleId);
        }
        return null;
    }
    // */

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
    /*
    async personalConferenceGetPublicUrl(): Promise<any> {
        let that = this;
        return that.createPublicUrl(that._personalConferenceBubbleId);
// */
        /*
        // Cf. https://api.openrainbow.org/enduser/#api-users_rooms_public_link-getOpenInviteIdsOfUser

        if (String.IsNullOrEmpty(personalConferenceBubbleId))
        {
        callback?.Invoke(new SdkResult<String>("You don't have an Personal Meeting", false));
        return;
        }

        CreatePublicUrl(personalConferenceBubbleId, callback);
        // */
    //}

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
    /*
    async personalConferenceGenerateNewPublicUrl(): Promise<any> {
        let that = this;
        return that.generateNewPublicUrl(that._personalConferenceBubbleId);
    }
    // */

//endregion PERSONAL CONFERENCE SPECIFIC

//region CONFERENCE / Personal Conference SPECIFIC

// Internal

//endregion CONFERENCE / Personal Conference SPECIFIC

//region Conference cache
    /**
     * @method removeBubbleFromCache
     * @private
     * @instance
     * @param {string} conferenceId
     */
    removeConferenceFromCache(conferenceId: string) {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(removeConferenceFromCache) remove conference : ", conferenceId);
        if (that._conferencesSessionById.containsKey(conferenceId)) {
            that._conferencesSessionById.remove((item: KeyValuePair<string, ConferenceSession>) => {
                return conferenceId===item.key;
            });
        }

    }

    /**
     * @method addOrUpdateConferenceToCache
     * @private
     * @instance
     * @param {ConferenceSession} conference
     * @param {boolean} useConferenceV2 do a specific treatment if the conference V2 model is used.
     * @param {Object} updatedDatasForEvent participants added or removed
     */
    async addOrUpdateConferenceToCache(conference: ConferenceSession, updatedDatasForEvent: any = {}) {
        let that = this;
        if (conference!=null) {
            let needToRaiseEvent: boolean = false;
            // Does this conference is linked to a known bubble ?
            let linkedWithBubble: boolean;

            let bubble = await that.getBubbleById(conference.id);
            linkedWithBubble = bubble.id == conference.id;
            conference.bubble = bubble;

            // Remove conference from cache
            that.removeConferenceFromCache(conference.id);

            // Add conference - only if still active
            if (conference.active) {
                that._conferencesSessionById.add(conference.id, conference);
                that._logger.log(that.DEBUG, LOG_ID + "(addOrUpdateConferenceToCache) Added to conferences list cache - Conference : ", conference.ToString());
                // log.DebugFormat("[addOrUpdateConferenceToCache] Added to conferences list cache - Conference:[{0}]", conference.ToString());
            } else {
                needToRaiseEvent = true; // We always need to raise event even if conference is no more active - third party must known that the conference has ended
                that._logger.log(that.DEBUG, LOG_ID + "(addOrUpdateConferenceToCache) Not added to conferences list cache - Conference : ", conference.ToString());
                // log.DebugFormat("[addOrUpdateConferenceToCache] Not added to conferences list cache - Conference[{0}]", conference.ToString());
                that._conferencesSessionById.add(conference.id, conference);
            }

            // If already linked to bubble raised ConferenceUpdated event
            if (linkedWithBubble) {
                needToRaiseEvent = true;
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(addOrUpdateConferenceToCache) This conference : ", conference.id, " is not linked to a known bubble");
                // log.WarnFormat("[addOrUpdateConferenceToCache] This conference [{0}] is not linked to a known bubble", conference.Id);
                // NEED TO ENHANCE THIS PART
            }

            // Raise event outside lock
            if (needToRaiseEvent) {
                that._logger.log(that.DEBUG, LOG_ID + "(addOrUpdateConferenceToCache) ConferenceUpdated event raised.");
                // log.DebugFormat("[addOrUpdateConferenceToCache] ConferenceUpdated event raised");
                // TODO: ConferenceUpdated.Raise(this, new ConferenceEventArgs(conference));
                that._eventEmitter.emit("evt_internal_bubbleconferenceupdated", conference, updatedDatasForEvent);
            }
        }
    }

//endregion

//region Manage Bubbles

    //region Bubbles MANAGEMENT
    
        /**
         * @public
         * @nodered true
         * @method getBubblesConsumption
         * @instance
         * @async
         * @category Manage Bubbles - Bubbles MANAGEMENT 
         * @return {Promise<Object>} return an object describing the consumption of bubbles : {
         *   maxValue : number // The quota associated to this offer [room]
         *   currentValue : number // The user's current consumption [room].
         * }
         *
         * @description
         *      return an object describing the consumption of bubbles. <br>
         */
        getBubblesConsumption() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubblesConsumption) .");

            return new Promise((resolve, reject) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesConsumption) .");
    
                return that._rest.getBubblesConsumption().then((consumption: any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesConsumption) consumption from server : ", consumption);
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubblesConsumption) success.");
    
                    let consumptionBuble = {};
                    if (consumption.feature==="BUBBLE_COUNT" && consumption.unit==="room") {
                        consumptionBuble = {
                            maxValue: consumption.maxValue,
                            currentValue: consumption.currentValue
                        };
                        that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesConsumption) return consumptionBuble : ", consumptionBuble);
                    } else {
                        that._logger.log(that.WARN, LOG_ID + "(getBubblesConsumption) consumption returned is not reconnised.");
                    }
                    resolve(consumptionBuble);
                }).catch((err) => {
                    return reject(err);
                });
            });
    
        }
    
        /**
         * @public
         * @nodered true
         * @method getBubbleById
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {string} id the id of the bubble
         * @param {boolean} force=false Boolean to force a request to the server
         * @param {string} context 
         * @param {string} format="full" Allows to retrieve more or less room details in response. </br>
         * small: id, name, jid, isActive</br>
         * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive, autoAcceptInvitation</br>
         * full: all room fields</br>
         * If full format is used, the list of users returned is truncated to 100 active users by default.</br>
         * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned).</br>
         * The total number of users being member of the room is returned in the field activeUsersCounter.</br>
         * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users.</br>
         * The full list of users registered in the room shall be got using API GET /api/rainbow/enduser/v1.0/rooms/:roomId/users, which is paginated and allows to sort the users list.</br>
         * If full format is used, and whatever the status of the logged in user (active or unsubscribed), then he is added in first position of the users list.</br>
         * Default value : full Possible values : small, medium, full</br>
         * @param {boolean} unsubscribed=true When true and always associated with full format, beside owner and invited/accepted users keep also unsubscribed users. Not taken in account if the logged in user is not a room moderator. Default value : false
         * @param {number} nbUsersToKeep=100 Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). If value is set to -1, all active bubble members are returned. Only usable if requested format is full (otherwise users field is not returned) Default value : 100
         * @async
         * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
         * @description
         *  Get a bubble by its ID in memory and if it is not found in server. <br>
         *  Get a bubble data visible by the user requesting it (a private room the user is part of or a public room)
         */
        getBubbleById(id, force: boolean = false, context : string = undefined, format : string = "full", unsubscribed : boolean = true, nbUsersToKeep : number = 100): Promise<Bubble> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubbleById) id : ", id, ", force : ", force);

            return new Promise((resolve, reject) => {
                // that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) bubble id  " + id);
    
                if (!id) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) bad or empty 'id' parameter : ", id);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                let bubbleFound = that._bubbles.find((bubble) => {
                    return (bubble.id===id);
                });
    
                if (bubbleFound && !force) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) bubbleFound in memory : ", bubbleFound.jid);
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) bubble not found in memory, search in server id : ", id);
                    return that._rest.getBubble(id, context, format, unsubscribed, nbUsersToKeep).then(async (bubbleFromServer: any) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleById) bubble from server : ", bubbleFromServer?.id);
    
                        if (that._options._imOptions.autoInitialBubblePresence) {
                            if (bubbleFromServer) {
                                let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                                //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                                //that._bubbles.push(bubble);
                                if (bubble.isActive) {
                                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) send initial presence to room : ", bubble.jid);
                                    await that._presence.sendInitialBubblePresenceSync(bubble).catch((errOfSent) => {
                                        that._logger.log(that.WARN, LOG_ID + "(getBubbleById) Error while sendInitialBubblePresenceSync : ", errOfSent);
                                    });                                    
                                } else {
                                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) bubble not active, so do not send initial presence to room : ", bubble.jid);
                                }
                                resolve(bubble);
                            } else {
                                resolve(null);
                            }
                        } else {
                            that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubbleFromServer.jid);
                            resolve(null);
                        }
                    }).catch((err) => {
                            that._logger.log(that.ERROR, LOG_ID + "(getBubbleById) get bubble failed for id : ", id, ", : ", err);
                            return reject(err);
                    });
                }
    
    
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleById) bubbleFound in memory : ", bubbleFound);
                resolve(bubbleFound);
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method getBubbleByJid
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {string} jid the JID of the bubble
         * @param {boolean} force=false True to force a request to the server
         * @param {string} format="full" Allows to retrieve more or less room details in response. </br>
         * small: id, name, jid, isActive</br>
         * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive, autoAcceptInvitation</br>
         * full: all room fields</br>
         * If full format is used, the list of users returned is truncated to 100 active users by default.</br>
         * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned).</br>
         * The total number of users being member of the room is returned in the field activeUsersCounter.</br>
         * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users.</br>
         * The full list of users registered in the room shall be got using API GET /api/rainbow/enduser/v1.0/rooms/:roomId/users, which is paginated and allows to sort the users list.</br>
         * If full format is used, and whatever the status of the logged in user (active or unsubscribed), then he is added in first position of the users list.</br>
         * Default value : full Possible values : small, medium, full</br>
         * @param {boolean} unsubscribed=true When true and always associated with full format, beside owner and invited/accepted users keep also unsubscribed users. Not taken in account if the logged in user is not a room moderator. Default value : false
         * @param {number} nbUsersToKeep=100 Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). If value is set to -1, all active bubble members are returned. Only usable if requested format is full (otherwise users field is not returned) Default value : 100
         * @async
         * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
         * @description
         *  Get a bubble by its JID in memory and if it is not found in server. <br>
         *  Get a rooms data visible by the user requesting it (a private room the user is part of or a public room)
         */
        async getBubbleByJid(jid, force: boolean = false, format : string = "full", unsubscribed : boolean = true, nbUsersToKeep : number = 100): Promise<Bubble> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubbleByJid) jid : ", jid, ", force : ", force);

            return new Promise(async (resolve, reject) => {
                // that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) bubble jid  ", jid);
    
                if (!jid) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) bad or empty 'jid' parameter : ", jid);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                let bubbleFound: any = that._bubbles.find((bubble) => {
                    return (bubble.jid===jid);
                });
    
    
                if (bubbleFound && !force) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJId) bubbleFound in memory : ", bubbleFound.jid);
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJId) bubble not found in memory, search in server jid : ", jid);
                    return await that._rest.getBubbleByJid(jid, format, unsubscribed, nbUsersToKeep).then(async (bubbleFromServer:any) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleByJId) bubble from server : ", bubbleFromServer?.jid);
    
                        if (bubbleFromServer) {
                            let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                            //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                            //that._bubbles.push(bubble);
                            if (that._options._imOptions.autoInitialBubblePresence) {
                                if (bubble.isActive) {
                                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) send initial presence to room : ", bubble.jid);
                                    await that._presence.sendInitialBubblePresenceSync(bubble).catch((errOfSent) => {
                                        that._logger.log(that.WARN, LOG_ID + "(getBubbleByJid) Error while sendInitialBubblePresenceSync : ", errOfSent);
                                    });
                                } else {
                                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) bubble not active, so do not send initial presence to room : ", bubble.jid);
                                }
                            } else {
                                that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
                            }
                            resolve(bubble);
                        } else {
                            resolve(null);
                        }
                    }).catch((err) => {
                        return reject(err);
                    });
                }
    
                resolve(bubbleFound);
            });
        }

        /**
         * @public
         * @nodered true
         * @method getAllBubblesJidsOfAUserIsMemberOf
         * @since 2.19.0
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @async
         * @description
         *  Provide the list of room JIDs a user is a member of. <br>
         * @param {boolean} isActive isActive is a flag of the room. When set to true all room users are invited to join the room. </br>
         * Else they have to wait an event from XMPP server before joining. </br>
         * This flag is reset when the room is inactive for a while (basically 60 days), and set when a first user joins the room. </br>
         * isActive=false : inactive rooms only </br>
         * isActive=true : active rooms only </br>
         * @param {boolean} webinar When true, beside room used for a conversation, rooms used for a webinar are shown in the list.
         * @param {boolean} unsubscribed=true When false, exclude rooms where the member status is 'unsubscribed'. Default value : true
         * @param {number} limit=100 Allow to specify the number of items to retrieve. Default value : 100
         * @param {number} offset=0 Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0.
         * @param {string} sortField Sort items list based on the given field.
         * @param {number} sortOrder=1 Specify order when sorting items list. Default value : 1. Possible values : -1, 1.
         * @return {Promise<Object>}  return a promise with The result found or null.
         * 
         * 
         * | Champ | Type | Description |
         * | --- | --- | --- |
         * | data | String\[\] | List of room JIDs. |
         * | limit | Number | Number of requested items |
         * | offset | Number | Requested position of the first item to retrieve |
         * | total | Number | Total number of items |
         * 
         */
        getAllBubblesJidsOfAUserIsMemberOf (isActive ? : boolean, webinar ? : boolean, unsubscribed : boolean = true, limit : number = 100, offset : number = 0, sortField ? : string, sortOrder : number = 1 ) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllBubblesJidsOfAUserIsMemberOf) isActive : ", isActive);

            return new Promise(async (resolve, reject) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) .");

                try {
                    return await that._rest.getAllBubblesJidsOfAUserIsMemberOf(isActive, webinar, unsubscribed, limit, offset, sortField, sortOrder).then(async (listOfBubblesJIDs) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) listOfBubblesJIDs from server : ", listOfBubblesJIDs);
                        resolve(listOfBubblesJIDs);
                    });
                } catch (err) {
                    reject (err);
                }
            });
        }

    /**
     * @public
     * @nodered true
     * @method getAllBubblesVisibleByTheUser
     * @since 2.19.0
     * @instance
     * @category Manage Bubbles - Bubbles MANAGEMENT
     * @async
     * @description
     *  Display a list of short room description including: id - room identifier, name - room name </br>
     *  Get all rooms visible by the user requesting it (the private rooms the user is part of and the public rooms)</br>
     *  Admin shall be able to disallow the use of bubbles, either for the whole company, or per user. User that does not have the right to use bubbles (useRoomCustomisation is disabled) will not be able to create bubbles or participate in bubbles (chat and web conference). </br>
     *
     * @param {string} format="small" Allows to retrieve more or less room details in response. </br>
     * small: id, name, jid, isActive </br>
     * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive </br>
     * full: </br>
     * if userId is used at the same time as format=full: all rooms fields else not all fields but only: id, name, jid, topic, creator, confEndpoints, conference, guestEmails, customData, disableNotifications, isActive, autoAcceptInvitation </br>
     * the list of users returned is truncated to 100 active users by default. </br>
     * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned). </br>
     * The total number of users being member of the room is returned in the field activeUsersCounter. </br>
     * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users. </br>
     * If userId is used at the same time as format=full, then this user is added in first position of the users list even if he has the status unsubscribed. </br>
     * The full list of users registered in the room shall be got using API GET /api/rainbow/enduser/v1.0/rooms/:roomId/users, which is paginated and allows to sort the users list. </br>
     * </br>
     *  Whatever the used format, when userId is indicated, lastActivityDate field is append for each room data. This is the last activity date of the room (read only, set automatically on IM exchange) </br>
     *  When the status of the userId in this room is ìnvited and when nothing has been shared yet in the room, the lastActivityDate is initialized with the date of the invitation. </br>
     *  When the status of the userId in this room is accepted and when nothing has been shared yet in the room, the lastActivityDate is initialized with the date of the invitation or arrival. Default value : small. Possible values : small, medium, full. </br>
     * @param {string} userId user unique identifier from which to retrieve the list of rooms the user is in (like 56f42c1914e2a8a91b99e595). creator and userId parameters are exclusives. If both are set, creator is used (as the rooms created by the user are a subset of all the rooms in which the user is).
     * @param {string} status user's status to filter when retrieving the list of user's rooms (like 56f42c1914e2a8a91b99e595) userId query parameter can be any userid from Users with superadmin role, and only the User's id itself if not. In this case only the rooms the user is part of are returned
     * @param {string} confId When a room hosts a conference endpoint, retrieve the one hosting the given confEndPointId (like 5980c0aaf698c541468fd1e0). confId query parameter used with userId query parameter helps filter when retrieving the list of user's rooms.
     * @param {boolean} scheduled When a room is/was used for a meeting, select rooms used for an immediate or a scheduled meeting. scheduled query parameter used with userId query parameter helps filter when retrieving the list of user's rooms. </br>
     * scheduled=false : all rooms used for an instant meeting </br>
     * scheduled=true : all rooms used for a scheduled meeting </br>
     * @param {boolean} hasConf Select all rooms used for meeting. hasConf query parameter used with userId query parameter helps filter when retrieving the list of user's rooms. </br>
     * hasConf=false : all rooms never used for a meeting </br>
     * hasConf=true : all rooms used for a meeting </br>
     * @param {boolean} isActive isActive is a flag of the room. When set to true all room users are invited to share their presence. </br>
     * Else they have to wait an event from XMPP server to share the presence. </br>
     * This flag is reset when the room is inactive for a while (basically 60 days), and set when the first user share his presence. </br>
     * isActive=false : all rooms not active yet </br>
     * isActive=true : all active rooms </br>
     * @param {string} name Allow to search room which name includes a word beginning by ...
     * @param {string} sortField Sort items list based on the given field.
     * @param {number} sortOrder=1 Specify order when sorting items list. by default sortOrder is -1 when sort=lastActivityDate is used. Default value : 1. Possible values : -1, 1.
     * @param {boolean} unsubscribed=false When true, beside owner and invited/accepted users keep also unsubscribed users. Default value : false.
     * @param {number} webinar When true, beside room used for a conversation, rooms used for a webinar are shown in the list. webinar query parameter used with userId query parameter helps filter when retrieving the list of user's rooms.
     * @param {number} limit=100 Allow to specify the number of items to retrieve. Default value : 100.
     * @param {number} offset=0 Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0.
     * @param {number} nbUsersToKeep=100 Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). If value is set to -1, all active bubble members are returned. Only usable if requested format is full (otherwise users field is not returned). Default value : 100.
     * @param {string} creator user unique identifier from which to retrieve the list of rooms created by thie user (like 56f42c1914e2a8a91b99e595) creator and userId parameters are exclusives. If both are set, creator is used (as the rooms created by the user are a subset of all the rooms in which the user is).
     * @param {string} context Allow to define a context of use for this API (webinar is the only awaited value)
     * @param {string} needIsAlertNotificationEnabled="true" Allow to specify if the field isAlertNotificationEnabled has to be returned for each room result. If this field is not needed, setting needIsAlertNotificationEnabled to false allows to improve performance and reduce server load. Default value : true.
     * @return {Promise<Object>}  return a promise with The result found or null.
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | containerId | String | UUID of the rooms container hosting this room. See ([Rooms containers](#api-rooms_containers)). |
     * | containerName | String | Name of the rooms container hosting this room |
     * | tags | Object\[\] | Tags list |
     * | tag | String | Tag name |
     * | color | String | Tag color - Hex Color in "0x" or "#" prefixed or "non-prefixed" |
     * | emoji | String | Tag emoji - an unicode sequence |
     * | isAlertNotificationEnabled optionnel | Boolean | When set to true, allows participants in the room to send alert notifications<br><br>This field is not returned if the query parameter `needIsAlertNotificationEnabled` is set to false. |
     * | id  | String | Room unique identifier (like 56d0277a0261b53142a5cab5) |
     * | name | String | Room name. |
     * | visibility | String | Public/private group visibility for search<br><br>Possibles values `private`, `public` |
     * | topic | String | Room topic |
     * | jid | String | Room MUC JID |
     * | creationDate | Date-Time | Creation date of the room (read only, set automatically during room creation) |
     * | lastActivityDate | Date-Time | Last activity date of the room (read only, set automatically on IM exchange) |
     * | creator | String | Rainbow Id of creator |
     * | users | Object\[\] | List of active users members of the room.  <br>Active users members correspond to users having the status `accepted` or `invited` in the room.  <br>  <br>**Warning**: The list of users returned is truncated to **100 active users**. The total number of users being member of the room is returned in the field `activeUsersCounter`.  <br>Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users.  <br>The full list of users registered in the room can be got using API [GET /api/rainbow/enduser/v1.0/rooms/:roomId/users](#api-rooms_users-getRoomActiveUsers), which is paginated and allows to sort the users list. |
     * | userId | String | User identifier |
     * | jid_im | String | User jid |
     * | additionDate | String | Date when the user has been added in the room |
     * | privilege | String | Privilege of the user in the room<br><br>Possibles values `user`, `moderator` |
     * | status | String | Status of the user in the room<br><br>Possibles values `invited`, `accepted`, `unsubscribed`, `rejected`, `deleted` |
     * | activeUsersCounter | Integer | The number of users with the status 'accepted' or 'invited'.  <br>As the list of users returned is truncated to **100 active users**, this counter allows to know if all active room members are in the `users` list or not (if `users`.length < `activeUsersCounter`).  <br>Only available when format=full |
     * | confEndpoints | Object\[\] | Conference end point of a room user. This user is always a 'moderator'. Only one confEndPoint per room. |
     * | userId | String | User identifier the user owning the confEndPoint |
     * | confEndPointId | String | Identifier of the conference end point |
     * | mediaType | String | User identifier  <br>see also [GET /api/rainbow/confprovisioning/v1.0/conferences/{confEndpointId}](/conf-provision/#api-conferences-GetConference))<br><br>Possibles values `pstnAudio`, `webrtc` |
     * | conference | Object | When the room hosts or has hosted a meeting, this is a set of data usefull to display list of meetings |
     * | scheduled | Boolean | Kind of meeting (false: instant meeting, true: scheduled meeting) |
     * | scheduledStartDate | Date-Time | Scheduled meeting start date |
     * | scheduledEndDate | Date-Time | Scheduled meeting end date |
     * | scheduledDuration | Integer | Scheduled meeting duration |
     * | disableTimeStats | Boolean | When set to true, clients will hide the Time Stats tab from bubble meetings |
     * | mediaType | String | Conference type \[pstnAudio, webrtc\] |
     * | lastUpdateDate | Date-Time | Scheduled meeting creation or update date |
     * | phoneNumbers | Object\[\] | Dial In phone numbers for this room. |
     * | location | String | location of the Dial In phone number. |
     * | locationcode | String | location code of the Dial In phone number. |
     * | number | String | Dial In phone number. |
     * | numberE164 | String | Dial In phone number in E164 format.@apiSuccess {String\[\]} data.conference.guestEmails Array of non rainbow users email |
     * | dialInCode | String | Dial in code. |
     * | guestEmails | String\[\] | Array of non rainbow users email. The former conference.guestEmails field should be deprecated sooner or later |
     * | includeAllPhoneNumbers | Boolean | Indicates if user chooses to include all Dial In phone numbers. |
     * | disableNotifications | Boolean | When set to true, there is no more notifications to be sent by a room in all cases with text body (user join/leave, conference start/end) |
     * | isActive | Boolean | When set to true all room users are invited to share their presence. Else they have to wait an event from XMPP server.  <br>This flag is reset when the room is inactive for a while (basically 60 days), and set when the first user share his presence.  <br>This flag is read-only. |
     * | autoRegister | String | A user can create a room and not have to register users. He can share instead a public link also called 'public URL'([users public link](#api-users_rooms_public_link)).  <br>According with autoRegister value, if another person uses the link to join the room:<br><br>* autoRegister = 'unlock':  <br>    If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room.<br>* autoRegister = 'lock':  <br>    If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room.<br>* autoRegister = 'unlock_ack':  <br>    If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment. |
     * | customData optionnel | Object | Room's custom data.  <br>Object with free keys/values.  <br>It is up to the client to manage the room's customData (new customData provided overwrite the existing one).  <br>  <br>Restrictions on customData Object:<br><br>* max 20 keys,<br>* max key length: 64 characters,<br>* max value length: 8192 characters. |
     * | data | Object\[\] | List of room Objects. |
     * | limit | Number | Number of requested items |
     * | offset | Number | Requested position of the first item to retrieve |
     * | total | Number | Total number of items |
     * | autoAcceptInvitation | Boolean | When set to true, allows to automatically add participants in the room (default behavior is that participants need to accept the room invitation first before being a member of this room) |
     * 
     */
     getAllBubblesVisibleByTheUser(format : string = "small", userId ? : string, status ? : string, confId ? : string, scheduled ? : boolean, hasConf ? : boolean, isActive ? : boolean, name ? : string, sortField ? : string, sortOrder : number = 1,
                                      unsubscribed : boolean = false, webinar ? : boolean, limit : number = 100, offset : number = 0 , nbUsersToKeep : number = 100, creator ? : string, context ? : string, needIsAlertNotificationEnabled : string = "true") {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllBubblesVisibleByTheUser) format : ", format, ", userId : ", userId);

        return new Promise(async (resolve, reject) => {
            //that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesVisibleByTheUser) .");

            try {
                return await that._rest.getAllBubblesVisibleByTheUser(format, userId, status, confId, scheduled, hasConf, isActive, name, sortField, sortOrder,
                        unsubscribed, webinar, limit, offset, nbUsersToKeep, creator, context, needIsAlertNotificationEnabled).then(async (listOfBubbles) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesVisibleByTheUser) listOfBubbles from server : ", listOfBubbles);
                    resolve(listOfBubbles);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
        
    /**
     * @public
     * @nodered true
     * @method getBubblesDataByListOfBubblesIds
     * @since 2.19.0
     * @instance
     * @category Manage Bubbles - Bubbles MANAGEMENT
     * @async
     * @description
     *  Display a list of short bubbles description including: id - room identifier, name - room name </br>
     *  Get Bubbles data by list of room ids </br>
     *  User that does not have the right to use bubbles (useRoomCustomisation is disabled) will not be able to create bubbles or participate in bubbles (chat and web conference). </br>
     *
     * @param {Array<string>} bubblesIds list of room's unique identifier (like 56f42c1914e2a8a91b99e595) for which requesting data. if a room identifier doesn't correspond to a room visible by userId or logged in user it is ignored.
     * @param {string} format="small" Allows to retrieve more or less room details in response. </br>
     * small: id, name, jid, isActive </br>
     * medium: id, name, jid, topic, creator, conference, guestEmails, disableNotifications, isActive </br>
     * full: </br>
     * if userId is used at the same time as format=full: all rooms fields else not all fields but only: id, name, jid, topic, creator, confEndpoints, conference, guestEmails, customData, disableNotifications, isActive, autoAcceptInvitation </br>
     * the list of users returned is truncated to 100 active users by default. </br>
     * The number of active users returned can be specified using the query parameter nbUsersToKeep (if set to -1, all active users are returned). </br>
     * The total number of users being member of the room is returned in the field activeUsersCounter. </br>
     * Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users. </br>
     * If userId is used at the same time as format=full, then this user is added in first position of the users list even if he has the status unsubscribed. </br>
     * The full list of users registered in the room shall be got using API GET /api/rainbow/enduser/v1.0/rooms/:roomId/users, which is paginated and allows to sort the users list. </br>
     * </br>
     *  Whatever the used format, when userId is indicated, lastActivityDate field is append for each room data. This is the last activity date of the room (read only, set automatically on IM exchange) </br>
     *  When the status of the userId in this room is ìnvited and when nothing has been shared yet in the room, the lastActivityDate is initialized with the date of the invitation. </br>
     *  When the status of the userId in this room is accepted and when nothing has been shared yet in the room, the lastActivityDate is initialized with the date of the invitation or arrival. Default value : small. Possible values : small, medium, full. </br>
     * @param {string} userId user unique identifier from which to retrieve the list of rooms the user is in (like 56f42c1914e2a8a91b99e595). creator and userId parameters are exclusives. If both are set, creator is used (as the rooms created by the user are a subset of all the rooms in which the user is).
     * @param {string} status user's status to filter when retrieving the list of user's rooms (like 56f42c1914e2a8a91b99e595) userId query parameter can be any userid from Users with superadmin role, and only the User's id itself if not. In this case only the rooms the user is part of are returned
     * @param {string} confId When a room hosts a conference endpoint, retrieve the one hosting the given confEndPointId (like 5980c0aaf698c541468fd1e0). confId query parameter used with userId query parameter helps filter when retrieving the list of user's rooms.
     * @param {boolean} scheduled When a room is/was used for a meeting, select rooms used for an immediate or a scheduled meeting. scheduled query parameter used with userId query parameter helps filter when retrieving the list of user's rooms. </br>
     * scheduled=false : all rooms used for an instant meeting </br>
     * scheduled=true : all rooms used for a scheduled meeting </br>
     * @param {boolean} hasConf Select all rooms used for meeting. hasConf query parameter used with userId query parameter helps filter when retrieving the list of user's rooms. </br>
     * hasConf=false : all rooms never used for a meeting </br>
     * hasConf=true : all rooms used for a meeting </br>
     * @param {string} sortField Sort items list based on the given field.
     * @param {number} sortOrder=1 Specify order when sorting items list. by default sortOrder is -1 when sort=lastActivityDate is used. Default value : 1. Possible values : -1, 1.
     * @param {boolean} unsubscribed="small" When true, beside owner and invited/accepted users keep also unsubscribed users. Default value : false.
     * @param {number} webinar When true, beside room used for a conversation, rooms used for a webinar are shown in the list. webinar query parameter used with userId query parameter helps filter when retrieving the list of user's rooms.
     * @param {number} limit=100 Allow to specify the number of items to retrieve. Default value : 100.
     * @param {number} offset=0 Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0.
     * @param {number} nbUsersToKeep=100 Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). If value is set to -1, all active bubble members are returned. Only usable if requested format is full (otherwise users field is not returned). Default value : 100.

     creator and userId parameters are exclusives. If both are set, creator is used (as the rooms created by the user are a subset of all the rooms in which the user is).
     * @param {string} context Allow to define a context of use for this API (webinar is the only awaited value)
     * @param {string} needIsAlertNotificationEnabled="true" Allow to specify if the field isAlertNotificationEnabled has to be returned for each room result. If this field is not needed, setting needIsAlertNotificationEnabled to false allows to improve performance and reduce server load. Default value : true.
     * @return {Promise<Object>}  return a promise with The result found or null.
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | containerId | String | UUID of the rooms container hosting this room. See ([Rooms containers](#api-rooms_containers)). |
     * | containerName | String | Name of the rooms container hosting this room |
     * | tags | Object\[\] | Tags list |
     * | tag | String | Tag name |
     * | color | String | Tag color - Hex Color in "0x" or "#" prefixed or "non-prefixed" |
     * | emoji | String | Tag emoji - an unicode sequence |
     * | isAlertNotificationEnabled optionnel | Boolean | When set to true, allows participants in the room to send alert notifications<br><br>This field is not returned if the query parameter `needIsAlertNotificationEnabled` is set to false. |
     * | id  | String | Room unique identifier (like 56d0277a0261b53142a5cab5) |
     * | name | String | Room name. |
     * | visibility | String | Public/private group visibility for search<br><br>Possibles values `private`, `public` |
     * | topic | String | Room topic |
     * | jid | String | Room MUC JID |
     * | creationDate | Date-Time | Creation date of the room (read only, set automatically during room creation) |
     * | lastActivityDate | Date-Time | Last activity date of the room (read only, set automatically on IM exchange) |
     * | creator | String | Rainbow Id of creator |
     * | users | Object\[\] | List of active users members of the room.  <br>Active users members correspond to users having the status `accepted` or `invited` in the room.  <br>  <br>**Warning**: The list of users returned is truncated to **100 active users**. The total number of users being member of the room is returned in the field `activeUsersCounter`.  <br>Logged in user, room creator and room moderators are always listed first to ensure they are not part of the truncated users.  <br>The full list of users registered in the room can be got using API [GET /api/rainbow/enduser/v1.0/rooms/:roomId/users](#api-rooms_users-getRoomActiveUsers), which is paginated and allows to sort the users list. |
     * | userId | String | User identifier |
     * | jid_im | String | User jid |
     * | additionDate | String | Date when the user has been added in the room |
     * | privilege | String | Privilege of the user in the room<br><br>Possibles values `user`, `moderator` |
     * | status | String | Status of the user in the room<br><br>Possibles values `invited`, `accepted`, `unsubscribed`, `rejected`, `deleted` |
     * | activeUsersCounter | Integer | The number of users with the status 'accepted' or 'invited'.  <br>As the list of users returned is truncated to **100 active users**, this counter allows to know if all active room members are in the `users` list or not (if `users`.length < `activeUsersCounter`).  <br>Only available when format=full |
     * | confEndpoints | Object\[\] | Conference end point of a room user. This user is always a 'moderator'. Only one confEndPoint per room. |
     * | userId | String | User identifier the user owning the confEndPoint |
     * | confEndPointId | String | Identifier of the conference end point |
     * | mediaType | String | User identifier  <br>see also [GET /api/rainbow/confprovisioning/v1.0/conferences/{confEndpointId}](/conf-provision/#api-conferences-GetConference))<br><br>Possibles values `pstnAudio`, `webrtc` |
     * | conference | Object | When the room hosts or has hosted a meeting, this is a set of data usefull to display list of meetings |
     * | scheduled | Boolean | Kind of meeting (false: instant meeting, true: scheduled meeting) |
     * | scheduledStartDate | Date-Time | Scheduled meeting start date |
     * | scheduledEndDate | Date-Time | Scheduled meeting end date |
     * | scheduledDuration | Integer | Scheduled meeting duration |
     * | disableTimeStats | Boolean | When set to true, clients will hide the Time Stats tab from bubble meetings |
     * | mediaType | String | Conference type \[pstnAudio, webrtc\] |
     * | lastUpdateDate | Date-Time | Scheduled meeting creation or update date |
     * | phoneNumbers | Object\[\] | Dial In phone numbers for this room. |
     * | location | String | location of the Dial In phone number. |
     * | locationcode | String | location code of the Dial In phone number. |
     * | number | String | Dial In phone number. |
     * | numberE164 | String | Dial In phone number in E164 format.@apiSuccess {String\[\]} data.conference.guestEmails Array of non rainbow users email |
     * | dialInCode | String | Dial in code. |
     * | guestEmails | String\[\] | Array of non rainbow users email. The former conference.guestEmails field should be deprecated sooner or later |
     * | includeAllPhoneNumbers | Boolean | Indicates if user chooses to include all Dial In phone numbers. |
     * | disableNotifications | Boolean | When set to true, there is no more notifications to be sent by a room in all cases with text body (user join/leave, conference start/end) |
     * | isActive | Boolean | When set to true all room users are invited to share their presence. Else they have to wait an event from XMPP server.  <br>This flag is reset when the room is inactive for a while (basically 60 days), and set when the first user share his presence.  <br>This flag is read-only. |
     * | autoRegister | String | A user can create a room and not have to register users. He can share instead a public link also called 'public URL'([users public link](#api-users_rooms_public_link)).  <br>According with autoRegister value, if another person uses the link to join the room:<br><br>* autoRegister = 'unlock':  <br>    If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room.<br>* autoRegister = 'lock':  <br>    If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room.<br>* autoRegister = 'unlock_ack':  <br>    If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment. |
     * | customData optionnel | Object | Room's custom data.  <br>Object with free keys/values.  <br>It is up to the client to manage the room's customData (new customData provided overwrite the existing one).  <br>  <br>Restrictions on customData Object:<br><br>* max 20 keys,<br>* max key length: 64 characters,<br>* max value length: 8192 characters. |
     * | data | Object\[\] | List of room Objects. |
     * | autoAcceptInvitation | Boolean | When set to true, allows to automatically add participants in the room (default behavior is that participants need to accept the room invitation first before being a member of this room) |
     * 
     */
    getBubblesDataByListOfBubblesIds (bubblesIds : Array<string>, format : string = "small", userId ? : string, status ? : string, confId ? : string, scheduled ? : boolean, hasConf ? : boolean, sortField ? : string, sortOrder : number = 1,
                                      unsubscribed : boolean = false, webinar ? : boolean, limit : number = 100, offset : number = 0 , nbUsersToKeep : number = 100, context ? : string, needIsAlertNotificationEnabled : string = "true") {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubblesDataByListOfBubblesIds) bubblesIds.length : ", bubblesIds?.length, ", format : ", format, ", userId : ", userId);

        return new Promise(async (resolve, reject) => {
            //that._logger.log(that.DEBUG, LOG_ID + "(getBubblesDataByListOfBubblesIds) .");

            try {
                return await that._rest.getBubblesDataByListOfBubblesIds(bubblesIds, format, userId, status, confId, scheduled, hasConf, sortField, sortOrder,
                        unsubscribed, webinar, limit, offset, nbUsersToKeep, context, needIsAlertNotificationEnabled).then(async (listOfBubbles) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesDataByListOfBubblesIds) listOfBubbles from server : ", listOfBubbles);
                    resolve(listOfBubbles);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
    
        /**
         * @public
         * @nodered true
         * @method getAllPendingBubbles
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @instance
         * @return {Bubble[]} An array of Bubbles not accepted or declined
         * @description
         *  Get the list of Bubbles that have a pending invitation not yet accepted of declined <br>
         */
        getAllPendingBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllPendingBubbles) .");
    
            return this._bubbles.filter((bubble) => {
    
                let invitation = bubble.users.filter((user) => {
                    return (user.userId===that._rest.userId && user.status==="invited");
                });
                return invitation.length > 0;
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllActiveBubbles
         * @since 1.30
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @return {Bubble[]} An array of Bubbles that are "active" for the connected user
         * @description
         *  Get the list of Bubbles where the connected user can chat <br>
         */
        getAllActiveBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllActiveBubbles) .");

            return this._bubbles.filter((bubble) => {
    
                return bubble.users.find((user) => {
                    return (user.userId===that._rest.userId && user.status==="accepted");
                });
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllClosedBubbles
         * @since 1.30
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @return {Bubble[]} An array of Bubbles that are closed for the connected user
         * @description
         *  Get the list of Bubbles where the connected user can only read messages <br>
         */
        getAllClosedBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllClosedBubbles) .");

            return this._bubbles.filter((bubble) => {
    
                return bubble.users.find((user) => {
                    return (user.userId===that._rest.userId && user.status==="unsubscribed");
                });
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method createBubble
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *  Create a new bubble <br>
         * @param {string} name  The name of the bubble to create
         * @param {string} description  The description of the bubble to create
         * @param {string } history="all" (optional) Determines the amount of history available to new users. Default is "all". Allowed values: "none", "all", "number".
         * @param {number} p_number=0 (optional) Number of messages to retrieve when history="number". Default is 0.
         * @param {string} visibility="private" (optional) Group visibility for search, either "private" or "public". Default is "private".
         * @param {boolean} disableNotifications=false (optional) If true, no notifications will be sent. Default is false.
         * @param {string} autoRegister='unlock' (optional) Determines behavior for public links. Default is "unlock". Allowed values: "unlock", "lock".
         * @param {boolean} autoAcceptInvitation=false (optional) If true, participants are automatically added to the room. Default is false.
         * @param {boolean} muteUponEntry=false (optional) Automatically mutes participants when they join the conference. Default is false.
         * @param {boolean} playEntryTone=true (optional) Plays a sound when a participant enters the conference. Default is true.
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         * @fulfil {Bubble} - Bubble object, else an ErrorManager object
         */
        async createBubble(name: string, description: string, history:any="all", p_number : number=0, visibility : string="private", disableNotifications : boolean=false, autoRegister:string = 'unlock', autoAcceptInvitation:boolean = false, muteUponEntry:boolean=false, playEntryTone:boolean=true) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(createBubble) name : ",  that._logger.stripStringForLogs(name), ", description : ",  that._logger.stripStringForLogs(description), ", history : ", history);
            
            return new Promise((resolve, reject) => {

                that._logger.log(that.DEBUG, LOG_ID + "(createBubble) enterring.");

                if (typeof history==="undefined") {
                    history = "none";
                }
    
                if (!name) {
                    that._logger.log(that.WARN, LOG_ID + "(createBubble) bad or empty 'name' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubble) bad or empty 'name' parameter : ", name);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (!description) {
                    that._logger.log(that.WARN, LOG_ID + "(createBubble) bad or empty 'description' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubble) bad or empty 'description' parameter : ", description);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createBubble(name, description, history, p_number, visibility, disableNotifications, autoRegister, autoAcceptInvitation, muteUponEntry, playEntryTone).then(async (bubble: any) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(createBubble) creation successfull");
                    // that._logger.log(that.INTERNAL, LOG_ID + "(createBubble) creation successfull, bubble", bubble);
    
                    let bubbleObj = await that.addOrUpdateBubbleToCache(bubble);
                    that._logger.log(that.INTERNAL, LOG_ID + "(createBubble) creation successfull, bubble object : ", bubbleObj?.id);
                    /*that._eventEmitter.once("evt_internal_bubblepresencechanged", function fn_onbubblepresencechanged() {
                        that._logger.log(that.DEBUG, LOG_ID + "(createBubble) bubble presence successfull");
                        that._logger.log(that.DEBUG, LOG_ID + "(createBubble) _exiting_");
                        that._bubbles.push(Object.assign( new Bubble(), bubble));
                        that._eventEmitter.removeListener("evt_internal_bubblepresencechanged", fn_onbubblepresencechanged);
                        resolve(bubble);
                    }); // */
                    that._presence.sendInitialBubblePresenceSync(bubbleObj).then(async () => {
                        /* // Wait for the bubble to be added in service list with the treatment of the sendInitialPresence result event (_onbubblepresencechanged)
                        await until(() => {
                                return (that._bubbles.find((bubbleIter: any) => {
                                    return (bubbleIter.jid === bubble.jid);
                                }) !== undefined);
                            },
                            "Waiting for the initial presence of a creation of bubble : " + bubble.jid);
                         // */
                        //that._bubbles.push(Object.assign( new Bubble(), bubble));
                        that._logger.log(that.DEBUG, LOG_ID + "(createBubble) bubble successfully created and presence sent : ", bubbleObj.jid);
                        resolve(bubble);
                    });
    
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(createBubble) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubble) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method isBubbleClosed
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {Bubble} bubble  The bubble to check
         * @return {boolean} True if the bubble is closed
         * @description
         *  Check if the bubble is closed or not. <br>
         */
        isBubbleClosed(bubble: Bubble): boolean {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(isBubbleClosed) bubble.name : ",  that._logger.stripStringForLogs(bubble?.name), ", bubble.id : ",  bubble?.id);

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter : ", bubble);
                throw (ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                let activeUser = bubble.users.find((user) => {
                    return user.status==="invited" || user.status==="accepted";
                });
    
                return !activeUser;
            }
        }
    
        /**
         * @public
         * @nodered true
         * @method isBubbleArchived
         * @instance
         * @async
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *     Check if the Bubble is an Archive state (everybody unsubscribed)
         * @param {object} bubble Bubble to be archived
         * @returns {Promise<boolean>} True if the Bubble is in archive state
         */
        public async isBubbleArchived(bubble: Bubble): Promise<boolean> {
            let that = this;
            let isArchived = true;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(isBubbleArchived) bubble.name : ",  that._logger.stripStringForLogs(bubble?.name), ", bubble.id : ",  bubble?.id);

            // update bubble with internal copy to avoid user/moderator/owner side effects
            bubble = bubble && bubble.id ? await that.getBubbleById(bubble.id):null;
    
            if (!bubble) {
                isArchived = false;
            } else if (bubble.status!==Bubble.RoomUserStatus.UNSUBSCRIBED) {
                isArchived = false;
            } else {
                //bubble.users.forEach(user => {
                for (const user of bubble.users) {                    
                    if (user.status!==Bubble.RoomUserStatus.UNSUBSCRIBED && user.status!==Bubble.RoomUserStatus.DELETED) {
                        isArchived = false;
                    }
                    //});
                }
            }
    
            return isArchived;
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllOwnedNotArchivedBubbles
         * @instance
         * @async
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *     Get all the owned Bubbles which are NOT in an Archive state (everybody unsubscribed)
         * @returns {Promise<Bubble>} return a promise with an array of the owned bubbles which are NOT in an archive state
         */
        public async getAllOwnedNotArchivedBubbles(): Promise<[Bubble]> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllOwnedNotArchivedBubbles) .");
            let allOwnedBubbles = that.getAllOwnedBubbles();
            that._logger.log(that.DEBUG, "(getAllOwnedNotArchivedBubbles) nb owned bulles : ", allOwnedBubbles ? allOwnedBubbles.length:0);
    
            //that._logger.log(that.INTERNAL, "(getAllOwnedNotArchivedBubbles) allOwnedBubbles : ", allOwnedBubbles, ", nb owned bulles : ", allOwnedBubbles ? allOwnedBubbles.length:0);
    
            async function asyncFilter(arr, predicate) {
                const results = await Promise.all(arr.map(predicate));
    
                return arr.filter((_v, index) => results[index]);
            }
    
            let bubblesNotArchived = await asyncFilter(allOwnedBubbles, async bubble => {
                return (await that.isBubbleArchived(bubble)===false);
            });
            that._logger.log(that.DEBUG, "(getAllOwnedNotArchivedBubbles) nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);
            //that._logger.log(that.INTERNAL, "(getAllOwnedNotArchivedBubbles) bubblesNotArchived : ", bubblesNotArchived, ", nb bubblesNotArchived bulles : ", bubblesNotArchived ? bubblesNotArchived.length:0);
    
            return bubblesNotArchived;
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllOwnedArchivedBubbles
         * @instance
         * @async
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *     Get all the owned Bubbles in an Archive state (everybody unsubscribed)
         * @returns {Promise<Bubble>} return a promise with an array of the owned bubbles with an archive state
         */
        public async getAllOwnedArchivedBubbles(): Promise<[Bubble]> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllOwnedArchivedBubbles) .");
            let allOwnedBubbles = that.getAllOwnedBubbles();
            that._logger.log(that.DEBUG, "(getAllOwnedArchivedBubbles) nb owned bulles : ", allOwnedBubbles ? allOwnedBubbles.length:0);
    
            //that._logger.log(that.INTERNAL, "(getAllOwnedArchivedBubbles) allOwnedBubbles : ", allOwnedBubbles, ", nb owned bulles : ", allOwnedBubbles ? allOwnedBubbles.length:0);
    
            async function asyncFilter(arr, predicate) {
                const results = await Promise.all(arr.map(predicate));
    
                return arr.filter((_v, index) => results[index]);
            }
    
            let bubblesArchived = await asyncFilter(allOwnedBubbles, async bubble => {
                return (await that.isBubbleArchived(bubble)===true);
            });
            that._logger.log(that.DEBUG, "(getAllOwnedArchivedBubbles) nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);
            //that._logger.log(that.INTERNAL, "(getAllOwnedArchivedBubbles) bubblesArchived : ", bubblesArchived, ", nb bubblesArchived bulles : ", bubblesArchived ? bubblesArchived.length:0);
            return bubblesArchived;
        }
    
        /**
         * @public
         * @nodered true
         * @method deleteAllBubbles
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *    Delete all existing owned bubbles <br>
         *    Return a promise <br>
         * @return {void} Nothing or an error object depending on the result
         */
        deleteAllBubbles(): void  {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteAllBubbles) .");

            let deleteallBubblePromiseQueue = createPromiseQueue(that._logger);
    
            let bubbles = that.getAll();
    
            bubbles.forEach(function (bubble) {
                let deleteBubblePromise = async function () {
                    if (bubble.isActive) {
                        return that.deleteBubble(bubble);
                    } else {
                        try {
                            await that._presence.sendInitialBubblePresenceSync(bubble);
                        } catch (err) {
                            that._logger.log(that.DEBUG, "(deleteAllBubbles) Error while ending presence : ", err);
                        }
                        return that.deleteBubble(bubble);
                    }
                };
                deleteallBubblePromiseQueue.add(deleteBubblePromise);
            });
    
            return deleteallBubblePromiseQueue.execute();
        };
    
        /**
         * @public
         * @nodered true
         * @method closeAnddeleteAllBubbles
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *    Delete all existing owned bubbles <br>
         *    Return a promise <br>
         * @return {Object} Nothing or an error object depending on the result
         */
        closeAnddeleteAllBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(closeAnddeleteAllBubbles) .");

            let deleteallBubblePromiseQueue = createPromiseQueue(that._logger);
    
            let bubbles = that.getAll();
    
            bubbles.forEach(function (bubble) {
                let deleteBubblePromise = function () {
                    return that.closeAndDeleteBubble(bubble);
                };
                deleteallBubblePromiseQueue.add(deleteBubblePromise);
            });
    
            return deleteallBubblePromiseQueue.execute();
        };
    
        /**
         * @public
         * @nodered true
         * @method deleteBubble
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {Bubble} bubble  The bubble to delete
         * @description
         *  Delete an owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants. <br>
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         * @fulfil {Bubble} - The bubble removed, else an ErrorManager object
    
         */
        deleteBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteBubble) bubble.id : ", bubble?.id, ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(async function (resolve, reject) {
    
                if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
    
                let amIModerator = false;
                let userStatus = "none";
    
                let meUser = bubble.users ? bubble.users.find((user) => {
                    return user.userId===that._rest.userId;
                }):true;
                amIModerator = meUser ? meUser.privilege==="moderator":true;
                userStatus = meUser ? meUser.status:"none";

                if (!bubble.isActive) {
                    try {
                        await that._presence.sendInitialBubblePresenceSync(bubble);
                    } catch (err) {
                        that._logger.log(that.DEBUG, "(deleteBubble) Error while ending presence : ", err);
                    }
                }
                
                if (amIModerator) {
                    that._rest.deleteBubble(bubble.id).then((resultDelete) => {
                        //let bubbleRemoved = await that.removeBubbleFromCache(updatedBubble.id);
                        /*let bubbleRemovedList = that._bubbles.splice(that._bubbles.findIndex(function(el) {
                            return el.id === updatedBubble.id;
                        }), 1); // */
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteBubble) delete bubble with id : ", bubble.id, " successfull");
                        that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubble) delete bubble : ", bubble?.id, ", resultDelete : ", resultDelete, " bubble successfull");
                        //let bubbleRemoved = bubbleRemoved.length > 0 ? bubbleRemoved[0] : null;
                        //resolve( Object.assign(bubble, bubbleRemoved));
                        resolve(bubble);
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID + "(deleteBubble) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteBubble) error : ", err);
                        return reject(err);
                    });
                } else {
                    if (userStatus!=="deleted") {
                        that._rest.deleteUserFromBubble(bubble.id).then(function (json) {
                            that._logger.log(that.INFO, LOG_ID + "(deleteBubble) deleted successfull : ", json);
                            //that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                            resolve(json);
                        }).catch(function (err) {
                            that._logger.log(that.ERROR, LOG_ID + "(deleteBubble) error.");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteBubble) error : ", err);
                            return reject(err);
                        });
                    }
                }
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method closeAndDeleteBubble
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {Bubble} bubble  The bubble to close + delete
         * @description
         *  Delete an owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants. <br>
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         * @fulfil {Bubble} - The bubble removed, else an ErrorManager object
    
         */
        closeAndDeleteBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(closeAndDeleteBubble) bubble.id : ", bubble?.id, ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(async function (resolve, reject) {
                if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(closeAndDeleteBubble) bad or empty 'bubble' parameter ");
                    that._logger.log(that.WARN, LOG_ID + "(closeAndDeleteBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!bubble.isActive) {
                    try {
                        await that._presence.sendInitialBubblePresenceSync(bubble);
                    } catch (err) {
                        that._logger.log(that.DEBUG, "(closeAndDeleteBubble) Error while ending presence : ", err);
                    }
                }

                that.closeBubble(bubble).then((updatedBubble: any) => {
                    that._rest.deleteBubble(updatedBubble.id).then(() => {
                        //let bubbleRemoved = await that.removeBubbleFromCache(updatedBubble.id);
                        /*let bubbleRemovedList = that._bubbles.splice(that._bubbles.findIndex(function(el) {
                            return el.id === updatedBubble.id;
                        }), 1); // */
                        that._logger.log(that.DEBUG, LOG_ID + "(closeAndDeleteBubble) delete with id : ", updatedBubble.id, " bubble successfull");
                        that._logger.log(that.INTERNAL, LOG_ID + "(closeAndDeleteBubble) delete ", updatedBubble?.id, " bubble successfull");
                        //let bubbleRemoved = bubbleRemoved.length > 0 ? bubbleRemoved[0] : null;
                        //resolve( Object.assign(bubble, bubbleRemoved));
                        resolve(updatedBubble);
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID + "(closeAndDeleteBubble) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID + "(closeAndDeleteBubble) error : ", err);
                        return reject(err);
                    });
                }).catch((err) => {
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method closeBubble
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {Bubble} bubble The Bubble to close
         * @description
         *  Close an owned bubble. When the owner closes a bubble, the bubble is archived and only accessible in read only mode for all participants. <br>
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         * @fulfil {Bubble} - The bubble closed, else an ErrorManager object
    
         */
        closeBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(closeBubble) bubble.id : ", bubble?.id, ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            let unsubscribeParticipants = (participantsIDList) => {
    
                return new Promise((resolve, reject) => {
    
                    let participantID = participantsIDList.shift();
    
                    if (participantID) {
                        let participant = (new Contact());
                        participant.id = participantID;

                        return that.removeContactFromBubble(participant, bubble).then(() => {
                            that._logger.log(that.DEBUG, LOG_ID + "(closeBubble) Participant " + participantID + " unsubscribed");
                            return unsubscribeParticipants(participantsIDList).then(() => {
                                resolve(undefined);
                            }).catch((err) => {
                                return reject(err);
                            });
                        }).catch((err) => {
                            return reject(err);
                        });
                    }
                    resolve(undefined);
                });
            };
    
            return new Promise(async function (resolve, reject) {
                if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(closeBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(closeBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (that.isBubbleClosed(bubble)) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(closeBubble) bubble is already closed : ", bubble?.id);
                    resolve(bubble);
                } else {
                    let queue = [];
                    bubble.users.forEach(function (user) {
                        if (user.userId!==that._rest.userId && user.status!==Bubble.RoomUserStatus.DELETED && user.status!==Bubble.RoomUserStatus.REJECTED) {
                            // if (user.userId !== that._rest.userId) {
                            // unsubscribe everyone except the connected user
                            queue.push(user.userId);
                            //}
                        }
                    });

                    if (!bubble.isActive) {
                        try {
                            await that._presence.sendInitialBubblePresenceSync(bubble);
                        } catch (err) {
                            that._logger.log(that.DEBUG, "(closeBubble) Error while ending presence : ", err);
                        }
                    }

                    // unsubscribe the connected user
                    // queue.push(that._rest.userId);
    
                    unsubscribeParticipants(queue).then(() => {
                        that._logger.log(that.INFO, LOG_ID + "(closeBubble) all users have been unsubscribed from bubble. Bubble is closed");
                        /* let participant = (new Contact());
                        participant.id = that._rest.userId;
                        // */

                        that.removeContactFromBubble(that._rest.account, bubble).then(() => {
                            that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                                // Update the existing local bubble stored
                                let bubbleReturned = await that.addOrUpdateBubbleToCache(bubbleUpdated);
    
                                /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                                if ( foundIndex > -1) {
                                    bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                    that._bubbles[foundIndex] = bubbleUpdated;
                                } else {
                                    that._logger.log(that.WARN, LOG_ID + "(closeBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                                }
                                // */
    
                                resolve(bubbleReturned);
                            }).catch((err) => {
                                that._logger.log(that.ERROR, LOG_ID + "(closeBubble) get bubble failed for bubble : ", bubble, ", : ", err);
                                return reject(err);
                            });
                        });
                    }).catch((err) => {
                        return reject(err);
                    });
                }
            });
        }
    
        /**
         * @public
         * @nodered true
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
        archiveBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(archiveBubble) bubble.id : ", bubble?.id, ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(async function (resolve, reject) {
    
                if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(archiveBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(archiveBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!bubble.isActive) {
                    try {
                        await that._presence.sendInitialBubblePresenceSync(bubble);
                    } catch (err) {
                        that._logger.log(that.DEBUG, "(archiveBubble) Error while ending presence : ", err);
                    }
                }

                that._rest.archiveBubble(bubble.id).then(function (json) {
                    that._logger.log(that.INFO, LOG_ID + "(archiveBubble) leave successfull");
                    that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                    resolve(json);
    
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(archiveBubble) error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(archiveBubble) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        leaveBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(leaveBubble) bubble.id : ", bubble?.id, ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(async function (resolve, reject) {
                let otherModerator = null;
                let userStatus = "none";
    
                if (bubble) {
                    otherModerator = bubble.users.find((user) => {
                        return user.privilege==="moderator" && user.status==="accepted" && user.userId!==that._rest.userId;
                    });
    
                    userStatus = bubble.getStatusForUser(that._rest.userId);
                }
    
                if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (!otherModerator) {
                    that._logger.log(that.WARN, LOG_ID + "(leaveBubble) can't leave a bubble if no other active moderator");
                    reject(ErrorManager.getErrorManager().FORBIDDEN);
                    return;
                }

                if (!bubble.isActive) {
                    try {
                        await that._presence.sendInitialBubblePresenceSync(bubble);
                    } catch (err) {
                        that._logger.log(that.DEBUG, "(leaveBubble) Error while ending presence : ", err);
                    }
                }

                that._rest.leaveBubble(bubble.id, userStatus).then(function (json) {
                    that._logger.log(that.INFO, LOG_ID + "(leaveBubble) leave successfull");
                    that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(leaveBubble) error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(leaveBubble) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @private
         * @instance
         * @description
         *      Internal method
         */
        getBubbles(format : string="small", unsubscribed : boolean = false) {
            let that = this;
    
            return new Promise(function (resolve, reject) {
                that._rest.getBubbles(format, unsubscribed).then(async function (listOfBubbles: any = []) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbles)  listOfBubbles.length : ", listOfBubbles.length);
    
                    //that._bubbles = listOfBubbles.map( (bubble) => Object.assign( new Bubble(), bubble));
                    that._bubbles = [];
                    /*listOfBubbles.map(async (bubble) => {
                        await that.addOrUpdateBubbleToCache(bubble);
                    }); // */

                    for (const bubble of listOfBubbles) {
                        await that.addOrUpdateBubbleToCache(bubble);
                    }
                    
                    that._logger.log(that.INFO, LOG_ID + "(getBubbles) get successfully");
                    if (that._options._imOptions.autoInitialBubblePresence) {
                        let prom = [];
                        let nbBubblesToJoin = 0;
                        for (let i = 0; i < listOfBubbles.length; i++) {
                            //listOfBubbles.forEach(async function (bubble: any) {
                            let bubble = listOfBubbles[i];
                            let bubbleObj = await that.getBubbleById(bubble.id);
                            if (!bubbleObj) bubbleObj = await that.getBubbleByJid(bubble.jid);

                            if (bubbleObj) {
                                let users = bubble.users ? bubble.users:[];
                                //for (const user of users) {
                                for (let i = 0; i < users.length; i++) {
                                    let user = users[i];
                                    //users.forEach(function (user) {
                                    if (user.userId===that._rest.userId && user.status==="accepted") {
                                        //if (that._options._imOptions.autoInitialBubblePresence) {
                                            if (bubbleObj.isActive) {
                                                that._logger.log(that.DEBUG, LOG_ID + "(getBubbles) send initial presence to bubble : ", bubbleObj.jid);
                                                //prom.push(that._presence.sendInitialBubblePresence(bubble));
                                                nbBubblesToJoin++;
                                                prom.push(that.bubblesManager.addBubbleToJoin(bubbleObj));
                                            } else {
                                                that._logger.log(that.DEBUG, LOG_ID + "(getBubbles) bubble not active, so do not send initial presence to bubble : ", bubbleObj.jid);
                                            }
                                        //} else {
                                        //    that._logger.log(that.DEBUG, LOG_ID + "(getBubbles)  autoInitialBubblePresence not active, so do not send initial presence to bubble : ", bubbleObj.jid);
                                        //}
                                    }
                                    //});
                                }
                            }
                        }
                        //});

                        Promise.all(prom).then(async () => {
                            //   if (that._options._imOptions.autoInitialBubblePresence) {
                            that._logger.log(that.DEBUG, LOG_ID + "(getBubbles)  autoInitialBubblePresence active, so treatAllBubblesToJoin, nbBubblesToJoin : ", nbBubblesToJoin);
                            //await that.bubblesManager.treatAllBubblesToJoin();
                            await traceExecutionTime(that.bubblesManager, "treatAllBubblesToJoin", that.bubblesManager.treatAllBubblesToJoin, undefined);
                            that._eventEmitter.emit("evt_internal_allbubbleinitialaffiliationchanged", {});
                            //    } else {
                            //        that._logger.log(that.DEBUG, LOG_ID + "(getBubbles)  autoInitialBubblePresence not active, so do not treatAllBubblesToJoin");
                            //    }

                            return resolve(undefined);

                        }).catch(function (err) {
                            that._logger.log(that.ERROR, LOG_ID + "(getBubbles) error");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "(getBubbles) error : ", err);
                            return reject(err);
                        }); // */
                    } else {
                        that._eventEmitter.emit("evt_internal_allbubbleinitialaffiliationchanged", {});
                        return resolve(undefined);
                    }
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(getBubbles) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(getBubbles) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method getAll
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @instance
         * @return {Bubble[]} The list of existing bubbles
         * @description
         *  Return the list of existing bubbles <br>
         */
        getAll() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAll) .");
            return this._bubbles;
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllBubbles
         * @nodered true
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @return {Bubble[]} The list of existing bubbles
         * @description
         *  Return the list of existing bubbles <br>
         */
        getAllBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllBubbles) .");
            return this.getAll();
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllOwnedBubbles
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *    Get the list of bubbles created by the user <br>
         * @return {Bubble[]} An array of bubbles restricted to the ones owned by the user
         */
        getAllOwnedBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllOwnedBubbles) .");
    //        return new Promise(function (resolve, reject) {
//            that._logger.log(that.DEBUG, LOG_ID + "(getAllOwnedBubbles) .");
            //resolve(that._bubbles.filter(function (room) {
            return (that._bubbles.filter(function (room) {
                return (room.creator===that._rest.userId);
            }));
            //      });
        }
    
        /**
         * @public
         * @nodered true
         * @method getAllOwnedIdBubbles
         * @instance
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @description
         *    Get the list of bubbles created by the user <br>
         * @return {Bubble[]} An array of bubbles restricted to the ones owned by the user
         */
        getAllOwnedIdBubbles() {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllOwnedIdBubbles) .");
//            that._logger.log(that.DEBUG, LOG_ID + "(getAllOwnedIdBubbles) .");
            let allOwnedIdBubbles = [];
            let allOwnedBubbles = that.getAllOwnedBubbles();
            for (let i = 0; i < allOwnedBubbles.length ; i++) {
                allOwnedIdBubbles.push(allOwnedBubbles[i].id);
            }
            return allOwnedIdBubbles;
        }
    
        /**
         * @method getBubbleFromCache
         * @private
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @instance
         * @param {string} bubbleId
         * @return {Bubble}
         * @private
         */
        private getBubbleFromCache(bubbleId: string): Bubble {
            let bubbleFound = null;
            let that = this;
            that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleFromCache) search id : ", bubbleId);
    
            if (this._bubbles) {
                let channelFoundindex = this._bubbles.findIndex((channel) => {
                    return channel.id===bubbleId;
                });
                if (channelFoundindex!= -1) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleFromCache) bubble found : ", this._bubbles[channelFoundindex]?.id, " with id : ", bubbleId);
                    return this._bubbles[channelFoundindex];
                }
            }
            that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleFromCache) channel found : ", bubbleFound, " with id : ", bubbleId);
            return bubbleFound;
        }
    
        /**
         * @method addOrUpdateBubbleToCache
         * @private
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @param {any} bubble
         * @return {Promise<Bubble>}
         * @private
         */
        private async addOrUpdateBubbleToCache(bubble: any): Promise<Bubble> {
            let that = this;
            that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateBubbleToCache) - parameter bubble : ", bubble);
    
            let bubbleObj: Bubble = await Bubble.BubbleFactory(that.avatarDomain, that._contactsService )(bubble);
            let bubbleFoundindex = this._bubbles.findIndex((channelIter) => {
                return channelIter.id===bubble.id;
            });
    
            if (bubble.conference!=null) {
                if (bubble.conference.scheduled) {
                    //canAdd = false;
                    //infoMessage = "DON'T MANAGE SCHEDULED MEETING";
                    that._logger.log(that.DEBUG, LOG_ID + "(addOrUpdateBubbleToCache) - DON'T MANAGE SCHEDULED MEETING");
                } else if (!bubble.isActive) {
                    //canAdd = false;
                    //infoMessage = "DON'T MANAGE INACTIVE Personal Conference";
                    that._logger.log(that.DEBUG, LOG_ID + "(addOrUpdateBubbleToCache) - DON'T MANAGE INACTIVE Personal Conference");
                } else {
                    if (bubble.creator===that._rest.userId) {
                        if (bubble.confEndpoints!=null) {
                            //foreach(Bubble.ConfEndpoint confEndpoint in bubble.confEndpoints)
                            for (const confEndpoint of bubble.confEndpoints) {
                                //bubble.confEndpoints.forEach((confEndpoint: any) => {
                                if (confEndpoint!=null) {
                                    if (confEndpoint.mediaType==="pstnAudio") {
                                        // It's an active and not scheduled meeting with a ConfEndpointId AND PstnAudio => So it's the Personal Conference
                                        //canAdd = true;

                                        that._personalConferenceBubbleId = bubble.id;
                                        that._personalConferenceConfEndpointId = confEndpoint.confEndpointId;
                                        let mediaType = confEndpoint.mediaType;
                                        that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateBubbleToCache) - Personal Conference found - BubbleID: ", that._personalConferenceBubbleId, " - ConfEndpointId: ", that._personalConferenceConfEndpointId, " - mediaType: ", mediaType);
                                    }
                                }
                                //});
                            }
                        }
                    }
                }
            }
    
            if (bubbleFoundindex!= -1) {
                that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble?.id, ", at bubbleFoundindex : ", bubbleFoundindex);
                //that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble, ", at bubbleFoundindex : ", bubbleFoundindex);
                await this._bubbles[bubbleFoundindex].updateBubble(bubble, that._contactsService );
                //this._bubbles.splice(bubbleFoundindex,1,bubbleObj);
                this.refreshMemberAndOrganizerLists(this._bubbles[bubbleFoundindex]);
                //that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateBubbleToCache) in update this._bubbles : ", this._bubbles);
                bubbleObj = this._bubbles[bubbleFoundindex];
            } else {
                that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateBubbleToCache) add in cache bubbleObj : ", bubbleObj?.id);
    
                this.refreshMemberAndOrganizerLists(bubbleObj);
                this._bubbles.push(bubbleObj);
            }
            //this.updateChannelsList();
    
            return bubbleObj;
        }
    
        /**
         * @method removeBubbleFromCache
         * @private
         * @category Manage Bubbles - Bubbles MANAGEMENT
         * @instance
         * @param {string} bubbleId
         * @return {Promise<Bubble>}
         * @private
         */
        private removeBubbleFromCache(bubbleId: string): Promise<Bubble> {
            let that = this;
            return new Promise((resolve, reject) => {
                // Get the channel to remove
                let bubbleToRemove = this.getBubbleFromCache(bubbleId);
                if (bubbleToRemove) {
                    // Remove from channels
                    let bubbleIdToRemove : any = bubbleToRemove.id;
    
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleFromCache) remove from cache bubbleId : ", bubbleIdToRemove);
                    that._bubbles = this._bubbles.filter(function (chnl: any) {
                        return !(chnl.id===bubbleIdToRemove);
                    });
                    resolve(bubbleToRemove);
                } else {
                    resolve(null);
                }
            });
        }
    
        /**
         * @public
         * @nodered true
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
        promoteContactInBubble(contact : Contact, bubble : Bubble, isModerator : boolean) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(promoteContactInBubble) contact.id : ", that._logger.stripStringForLogs(contact?.id), ", contact.name : ", that._logger.stripStringForLogs(contact?.name?.value), ", bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(function (resolve, reject) {
    
                if (!contact) {
                    that._logger.log(that.WARN, LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter : ", contact?.id);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
                let isActive = false;
                let isInvited = false;
                for (const user of bubble.users) {
                    //bubble.users.forEach(function (user) {
                    if (user.userId===contact.id) {
                        switch (user.status) {
                            case "invited":
                                isInvited = true;
                                break;
                            case "accepted":
                                isActive = true;
                                break;
                            default:
                                break;
                        }
                    }
                    //});
                }
    
                if (!isActive && !isInvited) {
                    that._logger.log(that.WARN, LOG_ID + "(promoteContactInBubble) Contact is not invited or is not already a member of the bubble");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
    
                that._rest.promoteContactInBubble(contact.id, bubble.id, isModerator)
                        .then(function () {
                            that._logger.log(that.INFO, LOG_ID + "(promoteContactInBubble) user privilege successfully sent");
    
                            return that._rest.getBubble(bubble.id).catch((err) => {
                                that._logger.log(that.ERROR, LOG_ID + "(promoteContactInBubble) get bubble failed for bubble : ", bubble?.id, ", : ", err);
                                return reject(err);
                            });
                        }).then(async (bubbleReUpdated: any) => {
    
                    // Update the existing local bubble stored
                    let bubble = await that.addOrUpdateBubbleToCache(bubbleReUpdated);
                    /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleReUpdated.id);
                    if ( foundIndex > -1) {
                        bubbleReUpdated = Object.assign(that._bubbles[foundIndex], bubbleReUpdated);
                        that._bubbles[foundIndex] = bubbleReUpdated;
                    } else {
                        that._logger.log(that.WARN, LOG_ID + "(promoteContactInBubble) bubble with id:" + bubbleReUpdated.id + " is no more available");
                    }
                     */
    
                    resolve(bubble);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(promoteContactInBubble) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(promoteContactInBubble) error : ", err);
                    reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        promoteContactToModerator(contact : Contact, bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(promoteContactToModerator) contact.id : ", that._logger.stripStringForLogs(contact?.id), ", contact.name : ", that._logger.stripStringForLogs(contact?.name?.value), ", bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            if (!contact) {
                that._logger.log(that.WARN, LOG_ID + "(promoteContactToModerator) bad or empty 'contact' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(promoteContactToModerator) bad or empty 'contact' parameter : ", contact);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(promoteContactToModerator) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(promoteContactToModerator) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            return this.promoteContactInBubble(contact, bubble, true);
        }
    
        /**
         * @public
         * @nodered true
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
        demoteContactFromModerator(contact : Contact, bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(demoteContactFromModerator) contact.id : ", that._logger.stripStringForLogs(contact?.id), ", contact.name : ", that._logger.stripStringForLogs(contact?.name?.value), ", bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            if (!contact) {
                that._logger.log(that.WARN, LOG_ID + "(demoteContactFromModerator) bad or empty 'contact' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(demoteContactFromModerator) bad or empty 'contact' parameter : ", contact);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(demoteContactFromModerator) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(demoteContactFromModerator) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            return this.promoteContactInBubble(contact, bubble, false);
        }
    
    //endregion Bubbles MANAGEMENT
    
    //region Bubbles INVITATIONS
    
        /**
         * @public
         * @nodered true
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
        acceptInvitationToJoinBubble(bubble: Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(acceptInvitationToJoinBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
    
                that._rest.acceptInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                    that._logger.log(that.INFO, LOG_ID + "(acceptInvitationToJoinBubble) invitation accepted", invitationStatus);
    
                    that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                        // Update the existing local bubble stored
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                        /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                        if ( foundIndex > -1) {
                            bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                            that._bubbles[foundIndex] = bubbleUpdated;
                        } else {
                            that._logger.log(that.WARN, LOG_ID + "(acceptInvitationToJoinBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                        }
                         */
    
                        resolve(bubble);
                    }).catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID + "(acceptInvitationToJoinBubble) get bubble failed for bubble : ", bubble, ", : ", err);
                        return reject(err);
                    });    
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(acceptInvitationToJoinBubble) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(acceptInvitationToJoinBubble) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        declineInvitationToJoinBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(declineInvitationToJoinBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
    
                that._rest.declineInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                    that._logger.log(that.INFO, LOG_ID + "(declineInvitationToJoinBubble) invitation declined : ", invitationStatus);
    
                    that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                        // Update the existing local bubble stored
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                        /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                        if ( foundIndex > -1) {
                            bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                            that._bubbles[foundIndex] = bubbleUpdated;
                        } else {
                            that._logger.log(that.WARN, LOG_ID + "(declineInvitationToJoinBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                        }
                         */
    
                        resolve(bubble);
                    }).catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID + "(declineInvitationToJoinBubble) get bubble failed for bubble : ", bubble, ", : ", err);
                        return reject(err);
                    });    
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(declineInvitationToJoinBubble) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(declineInvitationToJoinBubble) error : ", err);
                    return reject(err);
                });
            });
        }

        /**
         * @public
         * @nodered true
         * @method inviteContactToBubble
         * @instance
         * @category Manage Bubbles - Bubbles INVITATIONS
         * @param {Contact} contact         The contact to invite
         * @param {Bubble} bubble           The bubble
         * @param {boolean} isModerator     True to add a contact as a moderator of the bubble
         * @param {boolean} withInvitation  If true, the contact will receive an invitation and will have to accept it before entering the bubble. False to force the contact directly in the bubble without sending an invitation.
         * @param {string} reason=null        The reason of the invitation (optional)
         * @description
         *  Invite a contact in a bubble <br>
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         * @fulfil {Bubble} - The bubble updated with the new invitation
    
         */
        inviteContactToBubble(contact : Contact, bubble: Bubble, isModerator : boolean, withInvitation : boolean, reason : string = null) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(inviteContactToBubble) contact.id : ", that._logger.stripStringForLogs(contact?.id), ", contact.name : ", that._logger.stripStringForLogs(contact?.name?.value), ", bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(function (resolve, reject) {
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactToBubble) arguments : ", ...arguments);
    
                if (!contact) {
                    that._logger.log(that.WARN, LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter : ", contact);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
    
                let isActive = false;
                let isInvited = false;
  //              bubble.users.forEach(function (user) {
                if (bubble.users) {
                    for (const user of bubble.users) {

                        if (user.userId === contact.id) {
                            switch (user.status) {
                                case "invited":
                                    isInvited = true;
                                    break;
                                case "accepted":
                                    isActive = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
//                });
    
                if (isActive || isInvited) {
                    that._logger.log(that.WARN, LOG_ID + "(inviteContactToBubble) Contact has been already invited or is already a member of the bubble");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
    
                that.removeContactFromBubble(contact, bubble).then((bubbleUpdated: any) => {
                    return that._rest.inviteContactToBubble(contact.id, bubbleUpdated.id, isModerator, withInvitation, reason);
                }).then(function () {
                    that._logger.log(that.INFO, LOG_ID + "(inviteContactToBubble) invitation successfully sent");
    
                    return that._rest.getBubble(bubble.id).catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID + "(inviteContactToBubble) get bubble failed for bubble : ", bubble?.id, ", : ", err);
                        return reject(err);
                    });
                }).then(async (bubbleReUpdated: any) => {
    
                    let bubble = await that.addOrUpdateBubbleToCache(bubbleReUpdated);
    
                    /*
                    // Update the existing local bubble stored
                    let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleReUpdated.id);
                    if ( foundIndex > -1) {
                        bubbleReUpdated = Object.assign(that._bubbles[foundIndex], bubbleReUpdated);
                        that._bubbles[foundIndex] = bubbleReUpdated;
                    } else {
                        that._logger.log(that.WARN, LOG_ID + "(inviteContactToBubble) bubble with id:" + bubbleReUpdated.id + " is no more available");
                    }
                     */
    
                    resolve(bubble);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(inviteContactToBubble) error");
                    return reject(err);
                });
            });
        }

        /**
         * @public
         * @nodered true
         * @method inviteContactsByEmailsToBubble
         * @instance
         * @category Manage Bubbles - Bubbles INVITATIONS
         * @param {Array<string>} contactsEmails         The contacts email tab to invite
         * @param {Bubble} bubble           The bubble
         * @description
         *  Invite a list of contacts by emails in a bubble <br>
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         * @fulfil {Bubble} - The bubble updated with the new invitation
         */
        inviteContactsByEmailsToBubble(contactsEmails : Array<string>, bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(inviteContactsByEmailsToBubble) isDefined(contactsEmails) : ", isDefined(contactsEmails), ", bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name?.value));

            return new Promise(function (resolve, reject) {
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactsByEmailToBubble) arguments : ", ...arguments);
    
                if (!contactsEmails || !Array.isArray(contactsEmails)) {
                    that._logger.log(that.WARN, LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'contact' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'contact' parameter : ", contactsEmails);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
                return that._rest.inviteContactsByEmailsToBubble(contactsEmails, bubble.id).then(function () {
                    that._logger.log(that.INFO, LOG_ID + "(inviteContactsByEmailsToBubble) invitation successfully sent");
                    return that._rest.getBubble(bubble.id).catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID + "(inviteContactsByEmailsToBubble) get bubble failed for bubble : ", bubble?.id, ", : ", err);
                        return reject(err);
                    });
                }).then(async (bubbleReUpdated: any) => {
                    let bubble = await that.addOrUpdateBubbleToCache(bubbleReUpdated);
                    resolve(bubble);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(inviteContactsByEmailsToBubble) error");
                    return reject(err);
                });
            });
        }
    
    //endregion Bubbles INVITATIONS
    
    //region Bubbles FIELDS
    
        /**
         * @public
         * @nodered true
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
        updateBubbleData(bubbleId : string, visibility ? : string, topic ? : string, name ? : string, owner ? : string, autoRegister ? : string, autoAcceptInvitation? : boolean,
    muteUponEntry ? : boolean, playEntryTone ? : boolean, disableTimeStats ? : boolean, phoneNumbers ? : Array<{ location ? : string, locationcode ? : string, number ? : string,
    numberE164 ? : string } >, includeAllPhoneNumbers ? : boolean ) {
    
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateBubbleData) bubbleId : ", that._logger.stripStringForLogs(bubbleId));

            if (!bubbleId) {
                that._logger.log(that.WARN, LOG_ID + "(updateBubbleData) bad or empty 'bubbleId' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateBubbleData) bad or empty 'bubbleId' parameter : ", bubbleId);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            let data : { visibility ? : string, topic ? : string, name ? : string, owner ? : string, autoRegister ? : string, autoAcceptInvitation? : boolean,
                muteUponEntry ? : boolean, playEntryTone ? : boolean, disableTimeStats ? : boolean, phoneNumbers ? : Array<{ location ? : string, locationcode ? : string, number ? : string,
                    numberE164 ? : string } >, includeAllPhoneNumbers ? : boolean } = {};
            
            if (visibility != undefined) {
                data.visibility = visibility;
            }
            if (topic != undefined) {
                data.topic = topic;
            }
            if (name != undefined) {
                data.name = name;
            }
            if (owner != undefined) {
                data.owner = owner;
            }
            if (autoRegister != undefined) {
                data.autoRegister = autoRegister;
            }
            if (autoAcceptInvitation != undefined) {
                data.autoAcceptInvitation = autoAcceptInvitation;
            }
            if (muteUponEntry != undefined) {
                data.muteUponEntry = muteUponEntry;
            }
            if (playEntryTone != undefined) {
                data.playEntryTone = playEntryTone;
            }
            if (disableTimeStats != undefined) {
                data.disableTimeStats = disableTimeStats;
            }
            if (phoneNumbers != undefined) {
                data.phoneNumbers = phoneNumbers;
            }
            if (includeAllPhoneNumbers != undefined) {
                data.includeAllPhoneNumbers = includeAllPhoneNumbers;
            }

            return new Promise(async(resolve, reject) => {    
                that._rest.updateRoomData(bubbleId, data).then(async (json: any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(updateBubbleData) result : ", json);
                    let bubble = await that.addOrUpdateBubbleToCache(json);
                    resolve(bubble);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(updateBubbleData) error", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        setBubbleCustomData(bubble : Bubble, customData : any) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setBubbleCustomData) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            let bubbleId = bubble.id;
    
            let custom = {"customData": customData || {}};
    
            return new Promise((resolve, reject) => {
    
                that._rest.setBubbleCustomData(bubbleId, custom).then(async (json: any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleCustomData) customData set", json.customData);
                    bubble.customData = json.customData || {};
    
                    try {
                        await until(() => {
    
                            let bubbleInMemory = that._bubbles.find((bubbleIter) => {
                                return bubbleIter.id===bubbleId;
                            });
                            if (bubbleInMemory) {
                                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleCustomData) bubbleInMemory : ", bubbleInMemory?.id, ", \nbubble : ", bubble?.id);
    
                                return deepEqual(bubbleInMemory.customData, bubble.customData);
                            } else {
                                return false;
                            }
                        }, "wait in setBubbleCustomData for the customData to be updated by the event rainbow_onbubblecustomdatachanged", 8000).catch((err) => {
                            that._logger.log(that.WARN, LOG_ID + "(setBubbleCustomData) Error while waiting custom data. Error : ", err);
                        });
                        that._logger.log(that.DEBUG, LOG_ID + "(setBubbleCustomData) customData updated in bubble stored in BubblesService.");
                    } catch (err) {
                        that._logger.log(that.DEBUG, LOG_ID + "(setBubbleCustomData) customData not updated in bubble stored in BubblesService. Get infos about bubble from server.");
                        that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleCustomData) customData not updated in bubble stored in BubblesService. Get infos about bubble from server.", err);
                        that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
    
                            that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleCustomData) Custom data in bubble retrieved from server : ", bubbleUpdated.name + " | " + bubbleUpdated.customData);
    
                            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
    
                            /*// Update the existing local bubble stored
                            let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                            if (foundIndex > -1) {
                                bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                that._bubbles[foundIndex] = bubbleUpdated;
                            } else {
                                bubbleUpdated = Object.assign(new Bubble(), bubbleUpdated);
                                that._bubbles.push(bubbleUpdated);
                            } // */
    
                            that._eventEmitter.emit("evt_internal_bubblecustomDatachanged", bubble);
                        }).catch((err) => {
                            that._logger.log(that.ERROR, LOG_ID + "(setBubbleCustomData) get bubble failed for bubble : ", bubble, ", : ", err);
                            return reject(err);
                        });
                    }
                    resolve(bubble);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(setBubbleCustomData) error", err);
                    return reject(err);
                });
            });
        }
    
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
        setBubbleVisibilityStatus(bubble : Bubble, status : string) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setBubbleVisibilityStatus) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(setBubbleVisibilityStatus) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleVisibilityStatus) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
    
                that._rest.setBubbleVisibility(bubble.id, status).then((bubbleData) => {
                    that._logger.log(that.INFO, LOG_ID + "(setBubbleVisibilityStatus) visibility set ");
                    that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleVisibilityStatus) visibility set : ", bubbleData);
                    resolve(bubbleData);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(setBubbleVisibilityStatus) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleVisibilityStatus) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        setBubbleTopic(bubble : Bubble, topic : string) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setBubbleTopic) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
    
                that._rest.setBubbleTopic(bubble.id, topic).then((bubbleData: any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleTopic) topic set", bubbleData.topic);
                    bubble.topic = bubbleData.topic;
                    resolve(bubble);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(setBubbleTopic) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleTopic) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        setBubbleName(bubble : Bubble, name : string) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setBubbleName) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
    
                that._rest.setBubbleName(bubble.id, name).then((bubbleData: any) => {
    
                    that._logger.log(that.DEBUG, LOG_ID + "(setBubbleName) name set : ", bubbleData.name);
                    bubble.name = bubbleData.name;
                    resolve(bubble);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(setBubbleName) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleName) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @method randomString
         * @private
         * @category Manage Bubbles - Bubbles FIELDS
         * @instance
         * @param {number} length=10
         * @return {string}
         */
        randomString(length: number = 10) {
            let string = "";
            let rnd;
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            while (length > 0) {
                rnd = Math.floor(Math.random() * chars.length);
                string += chars.charAt(rnd);
                length--;
            }
            return string;
        };
    
        /**
         * @public
         * @nodered true
         * @method updateAvatarForBubble
         * @since 1.65
         * @instance
         * @category Manage Bubbles - Bubbles FIELDS
         * @description
         *    Update the bubble avatar (from given URL) <br>
         *    The image will be automatically resized <br>
         *    /!\ if URL isn't valid or given image isn't loadable, it'll fail <br>
         *    Return a promise. <br>
         * @param {string} urlAvatar  The avatarUrl
         * @param {Bubble} bubble  The bubble to update
         * @return {Bubble} A bubble object of null if not found
         */
        updateAvatarForBubble(urlAvatar : string, bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateAvatarForBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            return this.setAvatarBubble(bubble, urlAvatar);
        }
    
        /**
         * @private
         * @method setAvatarBubble
         * @category Manage Bubbles - Bubbles FIELDS
         * @instance
         * @param bubble
         * @param roomAvatarPath
         */
        setAvatarBubble(bubble: Bubble, roomAvatarPath) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setAvatarBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            if (!roomAvatarPath) {
                that._logger.log(that.WARN, LOG_ID + "(setAvatarBubble) bad or empty 'roomAvatarPath' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) bad or empty 'roomAvatarPath' parameter : ", roomAvatarPath);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
                resizeImage(roomAvatarPath, 512, 512).then(function (resizedImage) {
                    that._logger.log(that.DEBUG, LOG_ID + "(setAvatarBubble) resizedImage : ", resizedImage);
                    let binaryData = getBinaryData(resizedImage);
                    that._rest.setAvatarRoom(bubble.id, binaryData).then(
                            function success(result: any) {
                                that._logger.log(that.DEBUG, LOG_ID + "(setAvatarBubble) setAvatarRoom success : " + result);
                                /*
                                let url = that.avatarDomain;
                                if ($rootScope.cdn) {
                                    url = $rootScope.cdnServer;
                                }
                                bubble.avatar = url + "/api/room-avatar/" + bubble.id + "?size=512&rand=" + that.randomString();
                                // */
                                resolve(bubble);
                            },
                            function failure(err) {
                                that._logger.log(that.ERROR, LOG_ID + "(setAvatarBubble) error.");
                                that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) error : ", err);
                                return reject(err);
                            });
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        deleteAvatarFromBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteAvatarFromBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return this.deleteAvatarBubble(bubble.id);
        }
    
        /**
         * @private
         * @method deleteAvatarBubble
         * @category Manage Bubbles - Bubbles FIELDS
         * @instance
         * @param bubbleId
         */
        deleteAvatarBubble(bubbleId) {
            let that = this;
            if (!bubbleId) {
                that._logger.log(that.WARN, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubbleId);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
                that._rest.deleteAvatarRoom(bubbleId).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    return reject(err);
                });
            });
            /* return $q(function(resolve, reject) {
                $http({
                    method: "DELETE",
                    url: service.portalURL + "rooms/" + roomId + "/avatar",
                    headers: authService.getRequestHeader()
                }).then(function success() {
                    $log.info("[roomService] avatar room sucessfully deleted");
                    resolve(undefined);
                }).catch(function(err) {
                    reject(err);
                });
            });
            // */
        };
    
        /**
         * @public
         * @nodered true
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
        async updateCustomDataForBubble(customData: any, bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateCustomDataForBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCustomDataForBubble) customData : ", customData);
    
            return await this.setBubbleCustomData(bubble, customData).then((bubbleUpdated) => {
                return bubbleUpdated
            });
            /*
            let that = this;
             // update bubble with internal copy to avoid user/moderator/owner side effects
             let bubblefound : any = bubble && bubble.id ? await that.getBubbleById(bubble.id) : null;
    
             if (!customData) {
                 that._logger.log(that.WARN, LOG_ID + "(setAvatarBubble) bad or empty 'customData' parameter.");
                 that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) bad or empty 'customData' parameter : ", customData);
                 return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
             } else if (!bubblefound) {
                 that._logger.log(that.WARN, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
                 that._logger.log(that.INTERNALERROR, LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
                 return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
             } else {
                 return new Promise((resolve, reject) => {
                     bubblefound.customData = customData;
                     this._rest.ownerUpdateRoomCustomData(bubblefound).then(function (updatedCustomData) {
                         bubblefound.customData = updatedCustomData;
                             resolve(bubblefound);
                         })
                         .catch(function (err) {
                             reject(err);
                         });
                 });
             }
             // */
        }
    
        /**
         * @public
         * @nodered true
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
        deleteCustomDataForBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteCustomDataForBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            return this.updateCustomDataForBubble("", bubble);
        }
    
        /**
         * @public
         * @nodered true
         * @method updateDescriptionForBubble
         * @since 1.65
         * @instance
         * @category Manage Bubbles - Bubbles FIELDS
         * @description
         *    Update the description of the bubble  <br>
         *    Return a promise. <br>
         * @param {Bubble} bubble   The bubble to update
         * @param {string} strDescription   The description of the bubble (it is the topic on server side, and result event)
         * @return {Bubble} A bubble object of null if not found
         */
        async updateDescriptionForBubble(bubble : Bubble, strDescription : string) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateDescriptionForBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
            return this.setBubbleTopic(bubble, strDescription);
            /*let that = this;
            // update bubble with internal copy to avoid user/moderator/owner side effects
            let bubblefound : any = bubble && bubble.id ? await that.getBubbleById(bubble.id) : null;
    
            if (!strDescription) {
                that._logger.log(that.WARN, LOG_ID + "(updateDescriptionForBubble) bad or empty 'strDescription' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateDescriptionForBubble) bad or empty 'strDescription' parameter : ", strDescription);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (!bubblefound) {
                that._logger.log(that.WARN, LOG_ID + "(updateDescriptionForBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateDescriptionForBubble) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                return new Promise((resolve, reject) => {
                    bubblefound.desc = strDescription;
                    this._rest.ownerUpdateRoom(bubblefound).then(function (updatedCustomData) {
                        resolve(updatedCustomData);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            } // */
        }
    
        /**
         * @public
         * @nodered true
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
        changeBubbleOwner(bubble : Bubble, contact : Contact) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(changeBubbleOwner) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));
    
            if (!contact) {
                that._logger.log(that.WARN, LOG_ID + "(changeBubbleOwner) bad or empty 'contact' parameter ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(changeBubbleOwner) bad or empty 'contact' parameter : ", contact);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(changeBubbleOwner) bad or empty 'bubble' parameter ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(changeBubbleOwner) bad or empty 'bubble' parameter : ", bubble);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
    
            return new Promise((resolve, reject) => {
    
                that._rest.changeBubbleOwner(bubble.id, contact.id).then(async (bubbleData: any) => {
                    bubbleData = await that.addOrUpdateBubbleToCache(bubbleData);
                    that._logger.log(that.INFO, LOG_ID + "(changeBubbleOwner) owner setted : ", bubbleData.owner);
                    bubble.owner = bubbleData.owner;
                    resolve(bubbleData);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(changeBubbleOwner) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(changeBubbleOwner) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
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
        removeContactFromBubble(contact : Contact, bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removeContactFromBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name), ", contact.id : ", that._logger.stripStringForLogs(contact?.id), ", contact.name : ", that._logger.stripStringForLogs(contact?.name?.value));
    
            return new Promise(function (resolve, reject) {
    
                if (!contact) {
                    that._logger.log(that.WARN, LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter : ", contact);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } else if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter : ", bubble);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
    
                let contactStatus = "";

                for (const user of bubble.users) {
                    //bubble.users.forEach(function (user) {
                    if (user.userId===contact.id) {
                        contactStatus = user.status;
                    }
                    //});
                }
    
                that._logger.log(that.INFO, LOG_ID + "(removeContactFromBubble) remove contact with status", contactStatus);
    
                switch (contactStatus) {
                    case "rejected":
                    case "invited":
                    case "unsubscribed":
                        that._rest.removeInvitationOfContactToBubble(contact.id, bubble.id).then(function () {
                            that._logger.log(that.INFO, LOG_ID + "(removeContactFromBubble) removed successfully");
    
                            that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                                // Update the existing local bubble stored
                                let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                                /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                                if ( foundIndex > -1) {
                                    bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                    that._bubbles[foundIndex] = bubbleUpdated;
                                } else {
                                    that._logger.log(that.WARN, LOG_ID + "(removeContactFromBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                                }
                                 */
    
                                resolve(bubble);
                            }).catch((err) => {
                                that._logger.log(that.ERROR, LOG_ID + "(removeContactFromBubble) get bubble failed for bubble : ", bubble, ", : ", err);
                                return reject(err);
                            });
                        }).catch(function (err) {
                            that._logger.log(that.ERROR, LOG_ID + "(removeContactFromBubble) error");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "(removeContactFromBubble) error : ", err);
                            return reject(err);
                        });
                        break;
                    case "accepted":
                        that._rest.unsubscribeContactFromBubble(contact.id, bubble.id).then(function () {
                            that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromBubble) removed successfully");
    
                            that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
    
                                // Update the existing local bubble stored
                                let bubbleProm = that.addOrUpdateBubbleToCache(bubbleUpdated);
                                let bubble = await bubbleProm;
                                /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                                if ( foundIndex > -1) {
                                    bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                    that._bubbles[foundIndex] = bubbleUpdated;
                                } else {
                                    that._logger.log(that.WARN, LOG_ID + "(removeContactFromBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                                }
                                 */
    
                                // We send the result here, because sometimes the xmpp server does not send us the resulting event.
                                // So this event change will be sent twice time.
                                that._eventEmitter.emit("evt_internal_bubbleaffiliationchanged", bubble);
                                resolve(bubble);
                            }).catch((err) => {
                                that._logger.log(that.ERROR, LOG_ID + "(removeContactFromBubble) get bubble failed for bubble : ", bubble, ", : ", err);
                                return reject(err);
                            });
                        }).catch(function (err) {
                            that._logger.log(that.ERROR, LOG_ID + "(removeContactFromBubble) error");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "(removeContactFromBubble) error : ", err);
                            return reject(err);
                        });
                        break;
                    default:
                        that._logger.log(that.WARN, LOG_ID + "(removeContactFromBubble) contact not found in that bubble");
                        resolve(bubble);
                        break;
                }
            });
        }
    
        /**
         * @nodered true
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
        getAvatarFromBubble(bubble : Bubble) {
            /*
            Nom : 5da72aa7e6ca5a023da44eff
            Dimensions : 512 × 512
            Type MIME : image/jpeg
             */
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAvatarFromBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise((resolve, reject) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleById) bubble : ", bubble);
    
                if (!bubble) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getAvatarFromBubble) bad or empty 'bubble' parameter.");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getAvatarFromBubble) bad or empty 'bubble' parameter : ", bubble);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                if (!bubble.avatar) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getAvatarFromBubble) bad or empty avatar of 'bubble' parameter.");
                    that._logger.log(that.DEBUG, LOG_ID + "(getAvatarFromBubble) bad or empty avatar of 'bubble' parameter : ", bubble);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                return that._rest.getBlobFromUrl(bubble.avatar).then((avatarBuffer: any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getAvatarFromBubble) bubble from server : ", avatarBuffer);
                    let blob = {
                        buffer: avatarBuffer,
                        type: "image/jpeg",
                        fileSize: avatarBuffer.length,
                        fileName: bubble.id
                    }; // */
    
                    /*let blob = new Blob([response.data],
                        { type: mime }); // */
    
                    that._logger.log(that.DEBUG, LOG_ID + "getAvatarFromBubble success");
                    resolve(blob);
                }).catch((err) => {
                    return reject(err);
                });
            });
    
        }
    
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
        refreshMemberAndOrganizerLists(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(refreshMemberAndOrganizerLists) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.DEBUG, LOG_ID + "(refreshMemberAndOrganizerLists) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNAL, LOG_ID + "(refreshMemberAndOrganizerLists) bad or empty 'bubble' parameter : ", bubble);
                return ErrorManager.getErrorManager().BAD_REQUEST;
            }
    
            //Clear both lists :
            bubble.organizers = [];
            bubble.members = [];

            for (const user of bubble.users) {
                //bubble.users.forEach(function (user) {
                if (user.status===Bubble.RoomUserStatus.ACCEPTED || user.status===Bubble.RoomUserStatus.INVITED || user.jid_im===bubble.ownerContact.jid) {
                    if (user.privilege===Bubble.Privilege.MODERATOR) {
                        bubble.organizers.push(user);
                    } else {
                        bubble.members.push(user);
                    }
                }
                //});
            }
        };
    
        /**
         * @public
         * @nodered true
         * @method getUsersFromBubble
         * @instance
         * @category Manage Bubbles - Bubbles FIELDS
         * @param {Bubble} bubble           The bubble
         * @param {Object} options={}          The criterias to select the users to retrieve <br>
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
        getUsersFromBubble(bubble : Bubble, options: Object = {}) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getUsersFromBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise(function (resolve, reject) {
    
                /*let filterToApply = "format=medium";
                if (_options.format) {
                    filterToApply = "format=" + _options.format;
                }
    
                if (_options.page > 0) {
                    filterToApply += "&offset=";
                    if (_options.page > 1) {
                        filterToApply += (_options.limit * (_options.page - 1));
                    } else {
                        filterToApply += 0;
                    }
                }
    
                filterToApply += "&limit=" + Math.min(_options.limit, 1000);
    
                if (_options.type) {
                    filterToApply += "&types=" + _options.type;
                }
    
                // */
    
                that._rest.getRoomUsers(bubble.id, options).then(function (json) {
                    that._logger.log(that.INFO, LOG_ID + "(getRoomUsers) retrieve successfull");
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(getRoomUsers) error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(getRoomUsers) error : ", err);
                    return reject(err);
                });
            });
        }
    
        /**
         * @public
         * @nodered true
         * @method getStatusForConnectedUserInBubble
         * @instance
         * @category Manage Bubbles - Bubbles FIELDS
         * @param {Bubble} bubble           The bubble
         * @description
         *  Get the status of the connected user in a bubble <br>
         * @async
         * @return {Promise<Bubble, ErrorManager>}
         */
        getStatusForConnectedUserInBubble(bubble : Bubble) {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getStatusForConnectedUserInBubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            if (!bubble) {
                that._logger.log(that.WARN, LOG_ID + "(getStatusForConnectedUserInBubble) bad or empty 'bubble' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getStatusForConnectedUserInBubble) bad or empty 'bubble' parameter : ", bubble);
                //reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return "none";
            }
            let user = bubble.users.find((user) => {
                return user.userId===that._rest.userId;
            });
            return user ? user.status:"none";
        }
    
    //endregion Bubbles FIELDS    

    //region Bubbles TAGS
    
    /**
         * @public
     * @nodered true
     * @method retrieveAllBubblesByTags
         * @instance
         * @async
         * @category Manage Bubbles - Bubbles TAGS
         * @param {Array<string>} tags List of tags to filter the retrieved bubbles. 64 tags max.
         * @param {string} format="small" Allows to retrieve more or less room details in response. <br>
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
         * @param {number} nbUsersToKeep=100 Allows to truncate the returned list of active users member of the bubble in order to avoid having too much data in the response (performance optimization). <br>
         * If value is set to -1, all active bubble members are returned. <br>
         * Only usable if requested format is full (otherwise users field is not returned) <br>
         * Default value : 100 <br>
         * @return {Promise<{rooms, roomDetails}>}  return a promise with a list of  {rooms : List of rooms having the searched tag, roomDetails : List of rooms detail data according with format and nbUsersToKeep choices} filtered by tags or null
         * @description
         *  Get a list of {Bubble} filtered by tags. <br>
         */
    retrieveAllBubblesByTags(tags: Array<string>, format: string = "small", nbUsersToKeep: number = 100): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(retrieveAllBubblesByTags) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllBubblesByTags) bubble tags  " + tags);

            if (!tags) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllBubblesByTags) bad or empty 'tags' parameter : ", tags);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.retrieveAllBubblesByTags(tags, format, nbUsersToKeep).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllBubblesByTags) result from server : ", result);

                if (result) {
                    /* let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                    if (bubble.isActive) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) send initial presence to room : ", bubble.jid);
                        await that._presence.sendInitialBubblePresence(bubble);
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(getBubbleById) bubble not active, so do not send initial presence to room : ", bubble.jid);
                    } // */
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }
    
        /**
         * @public
         * @nodered true
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
        setTagsOnABubble(bubble: Bubble, tags: Array<string>): Promise<any> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setTagsOnABubble) bubble.id : ", that._logger.stripStringForLogs(bubble?.id), ", bubble.name : ", that._logger.stripStringForLogs(bubble?.name));

            return new Promise((resolve, reject) => {
                that._logger.log(that.DEBUG, LOG_ID + "(setTagsOnABubble) bubble tags  " + tags);
    
                if (!bubble || !bubble.id) {
                    that._logger.log(that.DEBUG, LOG_ID + "(setTagsOnABubble) bad or empty 'bubble' parameter : ", bubble);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                if (!tags) {
                    that._logger.log(that.DEBUG, LOG_ID + "(setTagsOnABubble) bad or empty 'tags' parameter : ", tags);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                return that._rest.setTagsOnABubble(bubble.id, tags).then(async (result) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(setTagsOnABubble) result from server : ", result);
    
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                }).catch((err) => {
                    return reject(err);
                });
            });
        }
    
        /**
         *
         * @public
         * @nodered true
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
        deleteTagOnABubble(bubbles: Array<Bubble>, tag: string): Promise<any> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteTagOnABubble) bubbles.length : ", bubbles?.length);

            return new Promise((resolve, reject) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTagOnABubble) bubble tag  ", tag);
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) bubble tag  ", tag, " on bubble : ", bubbles);
    
                if (!bubbles) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteTagOnABubble) bad or empty 'bubbles' parameter : ", bubbles);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                if (!tag) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteTagOnABubble) bad or empty 'tags' parameter : ", tag);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
    
                let roomIds = [];
                for (let i = 0; i < bubbles.length; i++) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) prepare to delete tag from bubble : ", bubbles[i]?.id);
                    roomIds.push(bubbles[i].id);
                }
    
                return that._rest.deleteTagOnABubble(roomIds, tag).then(async (result) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) result from server : ", result);
    
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                }).catch((err) => {
                    return reject(err);
                });
            });
        }
    
    //endregion Bubbles TAGS

    //region Bubbles CONTAINERS (Bubble Folder)

    // Get all rooms containers
    /**
     * @public
     * @nodered true
     * @method getAllBubblesContainers
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
     * @param {string} name=null name The name of a rooms container created by the logged in user. <br>
     * Two way to search containers are available:<br>
     * a word search ('all containers that contain a word beginning with...'). So name=cont or name=container leads to find "My first Container", "my second container" ..<br>
     * an exact match case insensitive for a list of container name. name=Container1&name=container2 eads to find 'Container1' and 'Container2' name (must be an exact match but we are case sensitive)<br>
     * @description
     *      retrieve the containers of bubbles from server. <br>
     *      A filter can be provided for the search by a name. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    getAllBubblesContainers(name: string = null) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllBubblesContainers) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesContainers) containers name  " + name);

            return that._rest.getAllBubblesContainers(name).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesContainers) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    // Get one rooms container
    /**
     * @public
     * @nodered true
     * @method getABubblesContainersById
     * @instance
     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
     * @param {string} id=null The id of the container of bubbles to retreive from server.
     * @async
     * @description
     *       retrieve a containers of bubbles from server by it's id. <br>
     * @return {Promise<any>} the result of the operation.

     */
    getABubblesContainersById(id: string = null) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getABubblesContainersById) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(getABubblesContainersById) containers id " + id);

            return that._rest.getABubblesContainersById(id).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getABubblesContainersById) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    // Add some rooms to the container
    /**
     * @public
     * @nodered true
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
    addBubblesToContainerById(containerId: string, bubbleIds: Array<string>) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(addBubblesToContainerById) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(addBubblesToContainerById) containers containerId : " + containerId, ", bubbleIds : ", bubbleIds);

            if (!containerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(addBubblesToContainerById) bad or empty 'containerId' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!bubbleIds) {
                that._logger.log(that.DEBUG, LOG_ID + "(addBubblesToContainerById) bad or empty 'bubbleIds' parameter : ", bubbleIds);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.addBubblesToContainerById(containerId, bubbleIds).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubblesToContainerById) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    // Change one rooms container name or description
    /**
     * @public
     * @nodered true
     * @method updateBubbleContainerNameAndDescriptionById
     * @instance
     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
     * @param {string} containerId The id of the container of bubbles to retreive from server.
     * @param {string} name The name of the container.
     * @param {string} description The description of the container.
     * @async
     * @description
     *       Change one bubble container name or description from server by it's id. <br>
     * @return {Promise<any>} the result of the operation.

     */
    updateBubbleContainerNameAndDescriptionById(containerId: string, name: string, description?: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateBubbleContainerNameAndDescriptionById) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(updateBubbleContainerNameAndDescriptionById) containers containerId : " + containerId, ", name : ", name);

            if (!containerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateBubbleContainerNameAndDescriptionById) bad or empty 'containerId' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!name) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateBubbleContainerNameAndDescriptionById) bad or empty 'name' parameter : ", name);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.updateBubbleContainerNameAndDescriptionById(containerId, name, description).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(updateBubbleContainerNameAndDescriptionById) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    // Create a rooms container
    /**
     * @public
     * @nodered true
     * @method createBubbleContainer
     * @instance
     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
     * @param {string} name The name of the container.
     * @param {string} description The description of the container.
     * @param {Array<string>} bubbleIds List of the bubbles Id to attach to the container.
     * @async
     * @description
     *       Create one bubble container with name or description. <br>
     *       
     * @return {Promise<any>} the result of the operation.

     */
    createBubbleContainer(name: string, description?: string, bubbleIds?: Array<string>) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(createBubbleContainer) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(createBubbleContainer) containers bubbleIds : " + bubbleIds, ", name : ", name);

            if (!name) {
                that._logger.log(that.DEBUG, LOG_ID + "(createBubbleContainer) bad or empty 'name' parameter : ", name);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.createBubbleContainer(name, description, bubbleIds).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubbleContainer) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    // Delete one rooms container
    /**
     * @public
     * @nodered true
     * @method deleteBubbleContainer
     * @instance
     * @category Manage Bubbles - Bubbles CONTAINERS (Bubble Folder)
     * @param {string} containerId The id of the container of bubbles to delete from server.
     * @async
     * @description
     *       delete one container by id. <br>
     * @return {Promise<any>} the result of the operation.

     */
    deleteBubbleContainer(containerId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteBubbleContainer) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteBubbleContainer) containerId : " + containerId);

            if (!containerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubbleContainer) bad or empty 'name' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.deleteBubbleContainer(containerId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubbleContainer) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    // Remove some rooms from the container
    /**
     * @public
     * @nodered true
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
    removeBubblesFromContainer(containerId: string, bubbleIds: Array<string>) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removeBubblesFromContainer) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(removeBubblesFromContainer) bubbleIds : " + bubbleIds, ", containerId : ", containerId);

            if (!containerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeBubblesFromContainer) bad or empty 'containerId' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!bubbleIds) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeBubblesFromContainer) bad or empty 'bubbleIds' parameter : ", bubbleIds);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.removeBubblesFromContainer(containerId, bubbleIds).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubblesFromContainer) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    //endregion Bubbles CONTAINERS

    //region Bubbles PUBLIC URL

    /**
     * @public
     * @nodered true
     * @method getABubblePublicLinkAsModerator
     * @since 2.19.0
     * @instance
     * @category Manage Bubbles - Bubbles PUBLIC URL
     * @param {string} bubbleId Bubble unique identifier
     * @param {boolean} emailContent Allows to retrieve email content in the json body response.
     * @param {string} language Allows to provide a language to use for email content. If not provided, logged in user language is used.
     * @async
     * @description
     *     Any member with an Organizer role (moderator privilege) should be able to share the link of the bubble. This api allow to get the openInviteId bound with the given bubble. <br>
     * @return {Promise<any>}
     */
    async getABubblePublicLinkAsModerator(bubbleId?: string , emailContent ?: boolean,  language ?: string) : Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getABubblePublicLinkAsModerator) .");

        if (!bubbleId) {
            that._logger.log(that.WARN, LOG_ID + "(getABubblePublicLinkAsModerator) bad or empty 'bubbleId' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(getABubblePublicLinkAsModerator) bad or empty 'bubbleId' parameter : ", bubbleId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        return that._rest.getABubblePublicLinkAsModerator(bubbleId, emailContent, language);
    }
    
    /**
         * @private
         * @method getInfoForPublicUrlFromOpenInvite
         * @since 1.72
         * @instance
         * @category Manage Bubbles - Bubbles PUBLIC URL
         * @param {Object} openInvite contains information about a bubbles invitation
         * @description
         *     get infos for the PublicUrl <br>
         * @return {Promise<any>}
    */
    async getInfoForPublicUrlFromOpenInvite(openInvite: any) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getInfoForPublicUrlFromOpenInvite) .");

        let publicUrlObject: any = {
            "publicUrl": that.getPublicURLFromResponseContent(openInvite)
        };
        if (openInvite.roomId) {
            publicUrlObject.bubble = await that.getBubbleById(openInvite.roomId);
        } else {
            publicUrlObject.bubbleType = openInvite.roomType;
        }
        if (openInvite.userId) {
            publicUrlObject.contact = await that._contactsService .getContactById(openInvite.userId);
        }
        return publicUrlObject;
    }
    
    /**
         *
         * @public
         * @nodered true
         * @method getAllPublicUrlOfBubbles
         * @since 1.72
         * @category Manage Bubbles - Bubbles PUBLIC URL
         * @instance
         * @description
         *     get all the PublicUrl belongs to the connected user <br>
         * @return {Promise<any>}
    */
    async getAllPublicUrlOfBubbles(): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllPublicUrlOfBubbles) .");

        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser();
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push(this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);
    }
    
    /**
         *
         * @public
         * @nodered true
         * @method getAllPublicUrlOfBubblesOfAUser
         * @since 1.72
         * @instance
         * @category Manage Bubbles - Bubbles PUBLIC URL
         * @param  {Contact} contact="new Contact()" user used to get all his Public Url. If not setted the connected user is used.
         * @description
         *     get all the PublicUrl belongs to a user <br>
         * @return {Promise<any>}
    */
    async getAllPublicUrlOfBubblesOfAUser(contact: Contact = new Contact()): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllPublicUrlOfBubblesOfAUser) .");

        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser(contact.id);
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push(this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);
    }
    
    /**
         *
         * @public
         * @nodered true
         * @method getAllPublicUrlOfABubble
         * @since 1.72
         * @instance
         * @category Manage Bubbles - Bubbles PUBLIC URL
         * @param {Bubble} bubble bubble from where get the public link.
         * @description
         *     get all the PublicUrl of a bubble belongs to the connected user <br>
         * @return {Promise<any>}
    */
    async getAllPublicUrlOfABubble(bubble : Bubble): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllPublicUrlOfABubble) .");

        if (!bubble) {
            that._logger.log(that.WARN, LOG_ID + "(getAllOpenInviteIdOfABubble) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(getAllOpenInviteIdOfABubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser(undefined, undefined, bubble.id);
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push(this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);

    }

    /**
         *
         * @public
         * @nodered true
         * @method getAllPublicUrlOfABubbleOfAUser
         * @since 1.72
         * @instance
         * @category Manage Bubbles - Bubbles PUBLIC URL
         * @param {Contact} contact user used to get all his Public Url. If not setted the connected user is used.
         * @param {Bubble} bubble bubble from where get the public link.
         * @description
         *     get all the PublicUrl of a bubble belongs to a user <br>
         * @return {Promise<any>}
    */
    async getAllPublicUrlOfABubbleOfAUser(contact: Contact, bubble: Bubble): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllPublicUrlOfABubbleOfAUser) .");

        if (!contact) {
            that._logger.log(that.WARN, LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'contact' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!bubble) {
            that._logger.log(that.WARN, LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser(contact.id, undefined, bubble.id);
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push(this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);
    }
    
    /**
         * @public
         * @nodered true
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
    async createPublicUrl(bubble: Bubble): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(createPublicUrl) .");

        if (!bubble || !bubble.id) {
            that._logger.log(that.WARN, LOG_ID + "(createPublicUrl) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(createPublicUrl) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        that._logger.log(that.INTERNAL, LOG_ID + "(createPublicUrl) bubble parameter : ", bubble?.id);

        let bubbleId: string = bubble.id;
        return that.getPublicURLFromResponseContent(await that._rest.createPublicUrl(bubbleId));
    }
    
    /**
         * @public
         * @nodered true
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
    async generateNewPublicUrl(bubble: Bubble): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(generateNewPublicUrl) .");
        if (!bubble) {
            that._logger.log(that.WARN, LOG_ID + "(generateNewPublicUrl) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(generateNewPublicUrl) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        let bubbleId: string = bubble.id;
        return that.getPublicURLFromResponseContent(await that._rest.generateNewPublicUrl(bubbleId));
    }
    
    /**
         * @public
         * @nodered true
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
    removePublicUrl(bubble: Bubble): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removePublicUrl) .");
        let bubbleId = bubble.id;
        return that._rest.removePublicUrl(bubbleId);
    }
    
    /**
         * @public
         * @nodered true
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
         * @param {string} autoRegister="unlock" value of the share of public URL to set.
         * @return {Promise<Bubble>} An object of the result
    */
    setBubbleAutoRegister(bubble: Bubble, autoRegister: string = "unlock"): Promise<Bubble> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(setBubbleAutoRegister) .");

        if (!bubble) {
            that._logger.log(that.WARN, LOG_ID + "(setBubbleAutoRegister) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleAutoRegister) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleAutoRegister(bubble.id, autoRegister).then(async (bubbleData) => {
                that._logger.log(that.INFO, LOG_ID + "(setBubbleAutoRegister) autoRegister set ");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleAutoRegister) autoRegister set : ", bubbleData);
                let bubbleObj: Bubble = await Bubble.BubbleFactory(that.avatarDomain, that._contactsService )(bubbleData);
                resolve(bubbleObj);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID + "(setBubbleAutoRegister) error");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setBubbleAutoRegister) error : ", err);
                return reject(err);
            });
        });
    }
    
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
    getPublicURLFromResponseContent(content: any): string {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getPublicURLFromResponseContent) .");

        let url: string = null;
        /*
        let openInviteId = content.openInviteId;

        if (openInviteId) {
            let strPort: string;
            if (((that._protocol=="https") && (that._port==="443")) || ((that._protocol=="http") && (that._port==="80")))
                strPort = "";
            else
                strPort = ":" + that._port;

            url = that._protocol + "://meet." + that._host + strPort + "/" + openInviteId;
        }
        return url;

         */

        if ((content!=null)) {
            url = content.invitationURL;
        }
        return url;
    }
    
    /**
         * @public
         * @nodered true
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
         * @param {string} publicUrl the public url to get the openinviteId.
         * @param {string} loginEmail User email address (used for login). Must be unique (409 error is returned if a user already exists with the same email address).
         * @param {string} password User password. </BR>
         * Rules: </BR>
         * * more than 8 characters, </BR>
         *     * ⚠️ Warning: the minimal password length will soon be increased to 12, planned to be effective mid-june 2023 (8 characters are still accepted until this date) </BR>
         * * at least 1 capital letter, </BR>
         * * 1 number, </BR>
         * * 1 special character. </BR>
         * @param {string} firstName User first name
         * @param {string} lastName User last name
         * @param {string} nickName User nickName
         * @param {string} title User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...)
         * @param {string} jobTitle User job title
         * @param {string} department User department
         * @return {Promise<any>} An object of the result
    */
    registerGuestForAPublicURL(publicUrl: string, loginEmail: string, password: string, firstName: string, lastName: string, nickName: string, title: string, jobTitle: string, department: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(registerGuestForAPublicURL) .");

        if (!publicUrl) {
            that._logger.log(that.WARN, LOG_ID + "(registerGuestForAPublicURL) bad or empty 'publicUrl' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(registerGuestForAPublicURL) bad or empty 'publicUrl' parameter : ", publicUrl);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!loginEmail) {
            that._logger.log(that.WARN, LOG_ID + "(registerGuestForAPublicURL) bad or empty 'loginEmail' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(registerGuestForAPublicURL) bad or empty 'loginEmail' parameter : ", loginEmail);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!password) {
            that._logger.log(that.WARN, LOG_ID + "(registerGuestForAPublicURL) bad or empty 'password' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(registerGuestForAPublicURL) bad or empty 'password' parameter : ", password);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(registerGuestForAPublicURL) decode openInviteId.");
            let openInviteId = publicUrl.split("/").pop();
            that._logger.log(that.INTERNAL, LOG_ID + "(registerGuestForAPublicURL) openInviteId found : ", openInviteId);
            let guestParam = new GuestParams(loginEmail, password, null, null, null, null, openInviteId, null, firstName, lastName, nickName, title, jobTitle, department);
            that._rest.registerGuest(guestParam).then(function (joinResult: any) {
                resolve(joinResult);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(registerGuestForAPublicURL) error");
                return reject(err);
            });
        });
    }
    
    //endregion Bubbles PUBLIC URL

    //region Bubbles Open Invites

    /**
     * @public
     * @nodered true
     * @method checkOpenInviteIdValidity
     * @since 2.22.4
     * @instance
     * @category Manage Bubbles - Bubbles Open Invites
     * @description
     *    Rainbow users may use a public URL to join a meeting The public URL format is designed by the Rainbow application programmer and must contain at least an 'openInviteId'. This openInviteId is an UUID-V4 value.<br>
     *    https://meet.openrainbow.com/d4bb04c2a2254cd3bebb28e449ce7de3 <br>
     *    The goal of this api is to check the validity of this URL. This API is public and no authentication is necessary. So a rate limiter is used to dissuade a brute force attack. <br>
     * @param {string} openInviteId uuid representing a part of the user's public URL to invite somebody to join a bubble. Example of public URL: https://web.openrainbow.com/#/invite?invitationId=0fc06e0ce4a849fcbe214ae5e1107417&scenario='public-url'
     * @return {Promise<any>} An object of the result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | roomName | String | The meeting name |
     * | roomTopic | String | The description of the meeting |
     * | roomLocked | Boolean | True when the new comer for the meeting are barred |
     * | invitingFirstName | String | The meeting creator's first name |
     * | invitingLastName | String | The meeting creator's last name |
     * | invitingCompanyName | String | The meeting creator's company name |
     * 
     */
    checkOpenInviteIdValidity(openInviteId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(checkOpenInviteIdValidity) .");

        if (!openInviteId) {
            that._logger.log(that.WARN, LOG_ID + "(checkOpenInviteIdValidity) bad or empty 'openInviteId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(checkOpenInviteIdValidity) bad or empty 'openInviteId' parameter : ", openInviteId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
       
        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(checkOpenInviteIdValidity) openInviteId found : ", openInviteId);
            that._rest.checkOpenInviteIdValidity(openInviteId).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(checkOpenInviteIdValidity) error");
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method joinBubbleByOpenInviteId
     * @since 2.22.4
     * @instance
     * @category Manage Bubbles - Bubbles Open Invites
     * @description
     *    Rainbow user may have a public link that will help their coworkers to join rooms. So that he just has to create a room and create a public link so called 'public URL'. <br>
     *    Each user can create on demand a public URL to one of his rooms(users public link). <br>
     *    The public URL format is designed by the Rainbow application programmer and must contain at least an 'openInviteId'. This openInviteId is an UUID-V4 value. <br>
     * @param {string} openInviteId uuid representing a part of the user's public URL to invite somebody to join a bubble. Example of public URL: https://web.openrainbow.com/#/invite?invitationId=0fc06e0ce4a849fcbe214ae5e1107417&scenario='public-url'
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | roomId | String | Room unique identifier. |
     * | hasAlreadyJoinThisRoom | Boolean | True when the loggedInUser has previously join this room. |
     * 
     */
    joinBubbleByOpenInviteId (openInviteId : string ) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(joinBubbleByOpenInviteId) .");

        if (!openInviteId) {
            that._logger.log(that.WARN, LOG_ID + "(joinBubbleByOpenInviteId) bad or empty 'openInviteId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(joinBubbleByOpenInviteId) bad or empty 'openInviteId' parameter : ", openInviteId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinBubbleByOpenInviteId) openInviteId found : ", openInviteId);
            that._rest.joinBubbleByOpenInviteId(openInviteId).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(joinBubbleByOpenInviteId) error");
                return reject(err);
            });
        });
    }

    //endregion Bubbles Open Invites

    //region Bubbles Polls

    /**
     * @public
     * @nodered true
     * @method createBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allow creating a Poll for a bubble. <br>
     * @param {string} bubbleId bubble identifier.
     * @param {string} title="" Poll title.
     * @param {Object} questions
     * [{<br>
     *      text : string //Question text (up to 20 questions).<br>
     *      multipleChoice : boolean //Is multiple choice allowed?<br>
     *      answers : [{<br>
     *           text : string // Answer text (up to 20 answers).<br>
     *           }]<br>
     * }] The questions to ask.<br>
     * @param {boolean} anonymous=false Is poll anonymous? Default value : false
     * @param {number} duration=0 Poll duration (from 0 to 60 minutes, 0 means no duration). Default value : 0
     * @return {Promise<any>} An object of the result
     * {
     *  pollId : string // Created poll identifier.
     *  }
     */
    createBubblePoll(bubbleId : string, title : string = "", questions 	: Array <{ text: string, multipleChoice: boolean, answers: Array<{ text : string }> }>, anonymous : boolean = false, duration : number = 0) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(createBubblePoll) .");

        if (!bubbleId) {
            that._logger.log(that.WARN, LOG_ID + "(createBubblePoll) bad or empty 'bubbleId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubblePoll) bad or empty 'bubbleId' parameter : ", bubbleId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!title) {
            that._logger.log(that.WARN, LOG_ID + "(createBubblePoll) bad or empty 'title' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubblePoll) bad or empty 'title' parameter : ", title);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!questions) {
            that._logger.log(that.WARN, LOG_ID + "(createBubblePoll) bad or empty 'questions' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubblePoll) bad or empty 'questions' parameter : ", questions);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        
        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createBubblePoll) create poll.");
            that._rest.createBubblePoll(bubbleId, title, questions, anonymous, duration).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(createBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(createBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows deleting a Poll for a bubble. <br>
     * @param {string} pollId poll identifier.
     * @return {Promise<any>} An object of the result
     */
    deleteBubblePoll(pollId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(deleteBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubblePoll) delete pollId : ", pollId);
            that._rest.deleteBubblePoll(pollId).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(deleteBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method getBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows getting data of a Poll for a bubble. <br>
     * @param {string} pollId poll identifier.
     * @param {string} format="small" If format equals small, non-anonymous polls are sent in anonymous format. Default value : small. Possible values : small, full
     * @return {Promise<any>} An object of the result
     */
    getBubblePoll(pollId : string, format : string = "small") {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(getBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(getBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePoll) delete pollId : ", pollId);
            that._rest.getBubblePoll(pollId, format).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(getBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method getBubblePollsByBubble
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    Get polls for a room. They are ordered by creation date (from newest to oldest). Only moderator can get unpublished polls. <br>
     * @param {string} bubbleId Bubble identifier.
     * @param {string} format="small" If format equals small, non-anonymous polls are sent in anonymous format. Default value : small. Possible values : small, full
     * @param {number} limit=100 Allow to specify the number of data to retrieve.
     * @param {number} offset Allow to specify the position of first data to retrieve
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
    getBubblePollsByBubble (bubbleId : string, format : string = "small", limit : number = 100, offset : number) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubblePollsByBubble) .");

        if (!bubbleId) {
            that._logger.log(that.WARN, LOG_ID + "(getBubblePollsByBubble) bad or empty 'bubbleId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(getBubblePollsByBubble) bad or empty 'bubbleId' parameter : ", bubbleId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePollsByBubble) bubbleId : ", bubbleId);
            that._rest.getBubblePollsByBubble(bubbleId, format, limit, offset).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(getBubblePollsByBubble) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getBubblePollsByBubble) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method publishBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows publishing a Poll for a bubble. <br>
     * @param {string} pollId poll bubble identifier.
     * @return {Promise<any>} An object of the result
     *
     */
    publishBubblePoll (pollId: string ) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(publishBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(publishBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(publishBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(publishBubblePoll) pollId : ", pollId);
            that._rest.publishBubblePoll(pollId).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(publishBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(publishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method terminateBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows terminating a Poll for a bubble. <br>
     * @param {string} pollId poll bubble identifier.
     * @return {Promise<any>} An object of the result
     *
     */
    terminateBubblePoll (pollId: string ): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(terminateBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(terminateBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(terminateBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(terminateBubblePoll) pollId : ", pollId);
            that._rest.terminateBubblePoll(pollId).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(terminateBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(terminateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @nodered true
     * @method unpublishBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows unpublishing a Poll for a bubble. <br>
     * @param {string} pollId poll bubble identifier.
     * @return {Promise<any>} An object of the result
     *
     */
    unpublishBubblePoll (pollId: string ) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(unpublishBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(unpublishBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(unpublishBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(unpublishBubblePoll) pollId : ", pollId);
            that._rest.unpublishBubblePoll(pollId).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(unpublishBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(unpublishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method updateBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows updating poll. When updating a question or an answer, all questions and answers must be present in body. <br>
     * @param {string} pollId poll identifier.
     * @param {string} bubbleId bubble identifier.
     * @param {string} title="" Poll title.
     * @param {Object} questions
     * [{<br>
     *      text : string //Question text (up to 20 questions).<br>
     *      multipleChoice : boolean //Is multiple choice allowed?<br>
     *      answers : [{<br>
     *           text : string // Answer text (up to 20 answers).<br>
     *           }]<br>
     * }] The questions to ask.<br>
     * @param {boolean} anonymous=false Is poll anonymous? Default value : false
     * @param {number} duration=0 Poll duration (from 0 to 60 minutes, 0 means no duration). Default value : 0
     * @return {Promise<any>} An object of the result
     * 
     */
    updateBubblePoll(pollId : string, bubbleId : string, title : string = "", questions 	: Array <{ text: string, multipleChoice: boolean, answers: Array<{ text : string }> }>, anonymous : boolean = false, duration : number = 0) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(updateBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(updateBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!bubbleId) {
            that._logger.log(that.WARN, LOG_ID + "(updateBubblePoll) bad or empty 'bubbleId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(updateBubblePoll) bad or empty 'bubbleId' parameter : ", bubbleId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!title) {
            that._logger.log(that.WARN, LOG_ID + "(updateBubblePoll) bad or empty 'title' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(updateBubblePoll) bad or empty 'title' parameter : ", title);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!questions) {
            that._logger.log(that.WARN, LOG_ID + "(updateBubblePoll) bad or empty 'questions' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(updateBubblePoll) bad or empty 'questions' parameter : ", questions);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateBubblePoll) update poll.");
            that._rest.updateBubblePoll(pollId, bubbleId, title, questions, anonymous, duration).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(updateBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method votesForBubblePoll
     * @since 2.10.0
     * @instance
     * @async
     * @category Manage Bubbles - Bubbles Polls
     * @description
     *    This API allows voting for a Poll for a bubble. <br>
     * @param {string} pollId poll bubble identifier.
     * @param {Array<Object>} votes Array< <br>
     *  question : number // Question number (starts at 0). <br>
     *  answers : number // Question answers (starts at 0). > <br>
     * @return {Promise<any>} An object of the result
     *
     */
    votesForBubblePoll (pollId: string, votes : Array<{ question : number, answers : Array <number> }> ) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(votesForBubblePoll) .");

        if (!pollId) {
            that._logger.log(that.WARN, LOG_ID + "(votesForBubblePoll) bad or empty 'pollId' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(votesForBubblePoll) bad or empty 'pollId' parameter : ", pollId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!votes) {
            that._logger.log(that.WARN, LOG_ID + "(votesForBubblePoll) bad or empty 'votes' parameter ");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(votesForBubblePoll) bad or empty 'votes' parameter : ", votes);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise(async function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(votesForBubblePoll) pollId : ", pollId);
            that._rest.votesForBubblePoll(pollId, votes).then(function (result: any) {
                resolve(result);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(votesForBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(votesForBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Bubbles Polls
    
    //endregion Manage Bubbles

    //region Bubbles Messages

    /**
     *
     * @public
     * @since 2.20.0
     * @nodered true
     * @method deleteAllMessagesInBubble
     * @category Bubbles Messages
     * @instance
     * @async
     * @description
     *   Delete all messages in a Bubble for everybody or hide it definitively for a specific contact. <br>
     * @param {Bubble} bubble bubble where im messages must be deleted.
     * @param {string} forContactJid=undefined jid of the contact we want to delete the access to messages in the bubble. If not setted, then all bubble's messages are deleted for every contacts.
     * @return Promise<any> Result of the API.
     */
    async deleteAllMessagesInBubble( bubble: Bubble, forContactJid: string = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteAllMessagesInBubble) .");

        if (!bubble) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteAllMessagesInBubble) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteAllMessagesInBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        // new to openconversation to send presence and activate the bubble if needed.
        let conversationObj = await that._conversations.openConversationForBubble(bubble);

        if (conversationObj.type!==Conversation.Type.ROOM) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteAllMessagesInBubble) bad or empty 'conversation.type' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteAllMessagesInBubble) bad or empty 'conversation.type' parameter : ", conversationObj);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return that._xmpp.deleteAllMessagesInRoomConversation(bubble.jid, forContactJid);
    }

    //endregion Bubbles Messages
    
    //region Conference V2

    /**
     * @public
     * @nodered true
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
    addPSTNParticipantToConference(roomId: string, participantPhoneNumber: string, country: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(addPSTNParticipantToConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(addPSTNParticipantToConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(addPSTNParticipantToConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!participantPhoneNumber) {
                that._logger.log(that.DEBUG, LOG_ID + "(addPSTNParticipantToConference) bad or empty 'participantPhoneNumber' parameter : ", participantPhoneNumber);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.addPSTNParticipantToConference(roomId, participantPhoneNumber, country).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addPSTNParticipantToConference) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method snapshotConference
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @param {string} limit=100 Allows to specify the number of participants to retrieve.
     * @param {string} offset=0 Allows to specify the position of first participant to retrieve.
     * @async
     * @description
     *       The snapshot command returns global information about conference and the set of participants engaged in the conference. <br>
     *       If conference isn't started, 'active' will be 'false' and the participants list empty. <br>
     *       If conference is started and the requester is in it, the response will contain global information about conference and the requested set of participants. <br>
     *       If the conference is started and the requester, not conference owner, isn't in the conference, the response will contain global information about conference and an empty participants list. <br>
     *       If the conference is started and the requester, conference owner, isn't in the conference, the response will contain global information about conference and the requested set of participants. <br>
     * @return {Promise<any>} the result of the operation.

     */
    snapshotConference(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(snapshotConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(snapshotConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(snapshotConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.snapshotConference(roomId, limit, offset).then(async (confSnapshop) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(snapshotConference) result from server : ", confSnapshop);

                /*if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
                // */
                let active: boolean = false;
                active = confSnapshop["active"];
                that._logger.log(that.DEBUG, LOG_ID + "(askConferenceSnapshot) - confSnapshop[\"active\"] : ", active);

                let conference: ConferenceSession ;

                let conferenceId = roomId;

                // Do something only if conference is active
                if (active) {
                    // Get conference form cache (if any)
                    conference = await that.getConferenceByIdFromCache(conferenceId);
                    if (conference==null) {
                        conference = new ConferenceSession(conferenceId);
                    }

                    conference.active = true;

                    // Clear participants since this server request give all info about them
                    conference.participants = new List<Participant>();

                    try {
                        // Loop on participants found
                        let jArray = confSnapshop["participants"];

                        if ((jArray!=null)) {
                            //jArray.forEach(async (jParticipant: any) => {
                            for (const jParticipant of jArray) {
                                let participant: Participant = null;
                                let participantId = null;
                                if (jParticipant.hasOwnProperty("participantId")) {
                                    participantId = jParticipant["participantId"];
                                }
                                // Id
                                participantId = jParticipant["participantId"];
                                if (jParticipant.hasOwnProperty("participant-id")) {
                                    participantId = jParticipant["participant-id"];
                                }
                                if (jParticipant.hasOwnProperty("user-id")) {
                                    participantId = jParticipant["user-id"];
                                }
                                if (jParticipant.hasOwnProperty("userId")) {
                                    participantId = jParticipant["userId"];
                                }

                                if (participantId) {
                                    // Create Participant object
                                    participant = new Participant(participantId);

                                    // Muted
                                    if (jParticipant.hasOwnProperty("mute"))
                                        participant.muted = (jParticipant["mute"]=="true");
                                    else
                                        participant.muted = false;

                                    /* // Hold
                                    if (jParticipant.hasOwnProperty("held"))
                                        participant.hold = (jParticipant["held"]=="true");
                                    else
                                        participant.hold = false;
                                        // */

                                    // IsModerator
                                    if (jParticipant.hasOwnProperty("participantRole"))
                                        participant.moderator = (jParticipant["participantRole"]=="moderator");
                                    else
                                        participant.moderator = false;

                                    /*// IsConnected
                                    if (jParticipant.hasOwnProperty("participantState"))
                                        participant.connected = (jParticipant["participantState"]=="connected");
                                    else
                                        participant.connected = false;
                                        // */

                                    // Jid_im
                                    if (jParticipant.hasOwnProperty("jid_im")) {
                                        participant.jid_im = jParticipant["jid_im"];
                                        participant.contact = await that._contactsService .getContactByJid(participant.jid_im).catch((err) => {
                                            that._logger.log(that.ERROR, LOG_ID + "(askConferenceSnapshot) - not found the contact for participant : ", err);
                                            return null;
                                        });
                                    }

                                    // PhoneNumber
                                    if (jParticipant.hasOwnProperty("phoneNumber"))
                                        participant.phoneNumber = jParticipant["phoneNumber"];

                                    if (jParticipant.hasOwnProperty("delegateCapability"))
                                        participant.delegateCapability = jParticipant["delegateCapability"];
                                    if (jParticipant.hasOwnProperty("associatedUserId"))
                                        participant.associatedUserId = jParticipant["associatedUserId"];
                                    if (jParticipant.hasOwnProperty("associatedGroupName"))
                                        participant.associatedGroupName = jParticipant["associatedGroupName"];
                                    if (jParticipant.hasOwnProperty("isOwner"))
                                        participant.isOwner = jParticipant["isOwner"];

                                    // Finally add participant to the list
                                    conference.participants.add(participant);
                                } else {
                                    that._logger.log(that.WARN, LOG_ID + "(askConferenceSnapshot) - no participantId found for conference, jParticipant : ", jParticipant);
                                }

                            }
                        }
                    } catch (e) {
                        that._logger.log(that.ERROR, LOG_ID + "(askConferenceSnapshot) - CATCH Error !!! Error : ", e);
                    }
                } else {
                    conference = new ConferenceSession(conferenceId);
                    conference.active = false;

                    // Clear participants since this server request give all info about them
                    conference.participants = new List<Participant>();
                }
                that._logger.log(that.DEBUG, LOG_ID + "(askConferenceSnapshot) - will add the built Conference : ", conference);

                // Finally add conference to the cache
                await that.addOrUpdateConferenceToCache(conference, true);
                return resolve (conference);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
    delegateConference(roomId: string, userId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(delegateConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(delegateConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(delegateConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(delegateConference) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.delegateConference(roomId, userId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(delegateConference) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method disconnectPSTNParticipantFromConference
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Disconnect PSTN participant from a conference. The request is sent by a conference's moderator. <br>
     *       Conference: Moderator can drop any PSTN participant. <br>
     *       Webinar: Organizer or speaker can drop any PSTN participant. <br>
     *       Practice room: Not applicable <br>
     *       Waiting room: Not applicable. <br>
     * @return {Promise<any>} the result of the operation.

     */
    disconnectPSTNParticipantFromConference(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(disconnectPSTNParticipantFromConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(disconnectPSTNParticipantFromConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(disconnectPSTNParticipantFromConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.disconnectPSTNParticipantFromConference(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(disconnectPSTNParticipantFromConference) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method disconnectParticipantFromConference
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} bubbleId The id of the room.
     * @param {string} userId User identifier.
     * @async
     * @description
     *       Disconnect participant from a conference. The request can be sent by participant himself or by a conference's moderator. <br>
     *       Conference: Moderator can drop any participant except conference owner. <br>
     *       Webinar: Organizer or speaker can drop any participant. <br>
     *       Practice room: Organizer or speaker can drop any participant. When last participant is dropped, practice room stops. <br>
     *       Waiting room: Not applicable. <br>
     * @return {Promise<any>} the result of the operation.

     */
    disconnectParticipantFromConference(bubbleId: string, userId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(disconnectParticipantFromConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(disconnectParticipantFromConference) bubbleId : " + bubbleId);

            if (!bubbleId) {
                that._logger.log(that.DEBUG, LOG_ID + "(disconnectParticipantFromConference) bad or empty 'bubbleId' parameter : ", bubbleId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(disconnectParticipantFromConference) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.disconnectParticipantFromConference(bubbleId, userId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(disconnectParticipantFromConference) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method getTalkingTimeForAllPparticipantsInConference
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @param {string} limit=100 Allows to specify the number of participants to retrieve.
     * @param {string} offset=0 Allows to specify the position of first participant to retrieve.
     * @async
     * @description
     *       The snapshot command returns global information about a conference and the set of participants engaged in the conference. <br>
     *       If conference isn't started, 'active' will be 'false' and the participants list empty. <br>
     *       If conference is started and the requester is in it, the response will contain global information about conference and the requested set of participants. <br>
     *       If the conference is started and the requester, not conference owner, isn't in the conference, the response will contain global information about conference and an empty participants list. <br>
     *       If the conference is started and the requester, conference owner, isn't in the conference, the response will contain global information about conference and the requested set of participants. <br>
     * @return {Promise<any>} the result of the operation.

     */
    getTalkingTimeForAllPparticipantsInConference(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getTalkingTimeForAllPparticipantsInConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getTalkingTimeForAllPparticipantsInConference(roomId, limit, offset).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method joinConferenceV2
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} bubbleId The id of the room.
     * @param {string} participantPhoneNumber Join through dial.
     * @param {string} country Country where the called number is from. If not provided, the user's country is taken.
     * @param {string} deskphone=false User joins conference through his deskphone. Default value : false
     * @param {Array<string>} dc=["rdeu"] TURN server prefix information associated to client location (DC = Data Center). Default Value : ["rdeu"]
     * @param {string} mute=false Join as muted/unmuted.
     * @param {string} microphone=false Has client a microphone?
     * @param {Array<string>} media=["video"] Requested media. Default value : ["video"] to let the bot join without audio. Possible value : "audio", "video" .
     * @param {string} resourceId Jabber resource identifier for webinar attendee. Default value : the internal xmpp resource used to connect server.
     * @async
     * @description
     *       Adds a participant to a conference. In case of PSTN conference, the user will be called to the provided phone number (dial out). <br>
     *           NOTE: The join done with audio media, need a webrtc stack because the server will close the connection after one minute if the media session is not up.
     * @return {Promise<any>} the result of the operation.
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object |     |
     * | jingleJid | String | WebRTC Gateway instance. |
     * | transportTurn optionnel | Boolean | If true, client must use 'relay' for 'iceTransportPolicy'. |
     * | gatewayPrefix optionnel | String | WebRTC Gateway prefix in case of deskphone. |
     * | gatewaySessionId optionnel | String | WebRTC Gateway session id in case of deskphone. |
     * | isAlreadyConnected optionnel | String | True if user is already connected. |
     *  
     */
    joinConferenceV2(bubbleId: string, participantPhoneNumber: string = undefined, country: string = undefined, deskphone : boolean = false, dc: Array<string> = ["rdeu"], mute: boolean = false, microphone: boolean = false, media : Array<string> = ["video"], resourceId : string  = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(joinConferenceV2) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(joinConferenceV2) bubbleId : " + bubbleId);

            if (!bubbleId) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinConferenceV2) bad or empty 'bubbleId' parameter : ", bubbleId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            
            if (!resourceId) {
                resourceId = that._xmpp.resourceId;
            }

            if (!dc) {
                dc = ["rdeu"];
            }
            
            if (!media) {
                media = ["video"];
            }

            that._rest.joinConferenceV2(bubbleId, participantPhoneNumber, country, deskphone, dc, mute, microphone, media, resourceId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(joinConferenceV2) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
    pauseRecording(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(pauseRecording) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(pauseRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(pauseRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(pauseRecording) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
    resumeRecording(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(resumeRecording) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(resumeRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(resumeRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(resumeRecording) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method startRecording
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Start the recording of a conference. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    startRecording(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(startRecording) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(startRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(startRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.startRecording(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(startRecording) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method stopRecording
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Stop the recording of a conference. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    stopRecording(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(stopRecording) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(stopRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(stopRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(stopRecording) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
     *
     */
    rejectAVideoConference(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(rejectAVideoConference) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(rejectAVideoConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(rejectAVideoConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.rejectAVideoConference(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(rejectAVideoConference) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method startConferenceOrWebinarInARoom
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} bubbleId The id of the room.
     * @param {Object} services Requested service types. example: { "services": [ "video-compositor" ] }
     * @async
     * @description
     *       The start command initiates a conference in a room. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    startConferenceOrWebinarInARoom(bubbleId: string, services  : { "services": [] } = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(startConferenceOrWebinarInARoom) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(startConferenceOrWebinarInARoom) bubbleId : " + bubbleId);

            if (!bubbleId) {
                that._logger.log(that.DEBUG, LOG_ID + "(startConferenceOrWebinarInARoom) bad or empty 'bubbleId' parameter : ", bubbleId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.startConferenceOrWebinarInARoom(bubbleId, services ).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(startConferenceOrWebinarInARoom) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method stopConferenceOrWebinar
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       The stop command terminates an active conference identified in a room. All currently connected participants are disconnected. <br>
     *       Conference: Only a conference owner can stop it. <br>
     *       Webinar: Any organizer can stop it. <br>
     *       Practice room: Any organizer or speaker can stop it. <br>
     *       Waiting room: Can't be stopped through API. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    stopConferenceOrWebinar(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(stopConferenceOrWebinar) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(stopConferenceOrWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(stopConferenceOrWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.stopConferenceOrWebinar(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(stopConferenceOrWebinar) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method subscribeForParticipantVideoStream
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @param {string} userId User identifier.
     * @param {string} media="video" [or audioVideo] Concerned media. The default value in the case of webinar is audio+video, else video. <br>
     * default value : video <br>
     * Authorized values : audio, video, audioVideo, sharing <br>
     * @param {number} subStreamLevel=0 Sub stream level (O=low, 2=high) to activate at startup. To be used only if simulcast is available on the publisher side. <br>
     * Authorized values : 0, 1, 2 <br>
     * @param {boolean} dynamicFeed=false Declare a feed as dynamic. You will subscribe first to the feed associated to publisher, then switch to active talker's feed if present. <br>
     *     Default value : false <br>
     * @async
     * @description
     *       Gives the possibility to a user participating in a WebRTC conference to subscribe and receive a video stream published by an other user. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    subscribeForParticipantVideoStream(roomId: string, userId: string, media : string = "video", subStreamLevel: number = 0, dynamicFeed: boolean = false) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(subscribeForParticipantVideoStream) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(subscribeForParticipantVideoStream) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeForParticipantVideoStream) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeForParticipantVideoStream) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.subscribeForParticipantVideoStream(roomId, userId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeForParticipantVideoStream) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method updatePSTNParticipantParameters
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @param {string} phoneNumber Participant phone number.
     * @param {string} option="unmute" Mute/unmute the participant. <br>
     *     Authorized values : mute, unmute
     * @async
     * @description
     *       The update PSTN participant command can update different options of a participant. Only one option can be updated at a time. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    updatePSTNParticipantParameters(roomId: string, phoneNumber: string, option: string = "unmute") {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updatePSTNParticipantParameters) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(updatePSTNParticipantParameters) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePSTNParticipantParameters) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!phoneNumber) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePSTNParticipantParameters) bad or empty 'phoneNumber' parameter : ", phoneNumber);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updatePSTNParticipantParameters(roomId, phoneNumber, option).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(updatePSTNParticipantParameters) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method updateConferenceParameters
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @param {string} option="unmute" Following options are available: <br>
     * Mute Mutes all participants, except requester. <br>
     * Unmute Unmutes all participants. <br>
     * Lock Disables any future participant from joining a conference. <br>
     * Unlock Unlocks the conference. <br>
     * Webinar Changes practice room into webinar. <br>
     *     Authorized values :  mute, unmute, lock, unlock, webinar <br>
     * @async
     * @description
     *       The update conference command can update different options of a conference. Only one option can be updated at a time. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    updateConferenceParameters(roomId: string, option: string = "unmute") {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateConferenceParameters) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(updateConferenceParameters) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConferenceParameters) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!option) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConferenceParameters) bad or empty 'option' parameter : ", option);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updateConferenceParameters(roomId, option).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConferenceParameters) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
     *
     */
    updateParticipantParameters(roomId: string, userId: string, option: string, media: string, bitRate: number, subStreamLevel: number, publisherId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateParticipantParameters) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(updateParticipantParameters) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateParticipantParameters) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!option) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateParticipantParameters) bad or empty 'option' parameter : ", option);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updateParticipantParameters(roomId, userId, option, media, bitRate, subStreamLevel, publisherId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(updateParticipantParameters) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
     *
     */
    allowTalkWebinar(roomId: string, userId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(allowTalkWebinar) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(allowTalkWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(allowTalkWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(allowTalkWebinar) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.allowTalkWebinar(roomId, userId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(allowTalkWebinar) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
     *
     */
    disableTalkWebinar(roomId: string, userId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(disableTalkWebinar) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(disableTalkWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(disableTalkWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(disableTalkWebinar) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.disableTalkWebinar(roomId, userId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(disableTalkWebinar) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method lowerHandWebinar
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Webinar: participant lowers hand. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    lowerHandWebinar(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(lowerHandWebinar) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(lowerHandWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(lowerHandWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.lowerHandWebinar(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(lowerHandWebinar) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method raiseHandWebinar
     * @instance
     * @since 2.2.0
     * @category Conference V2
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Webinar: participant raises hand. <br>
     * @return {Promise<any>} the result of the operation.
     *
     */
    raiseHandWebinar(roomId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(raiseHandWebinar) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(raiseHandWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(raiseHandWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.raiseHandWebinar(roomId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(raiseHandWebinar) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
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
     *
     */
    stageDescriptionWebinar(roomId: string, userId: string, type: string, properties: Array<string>) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(stageDescriptionWebinar) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(stageDescriptionWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(stageDescriptionWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(stageDescriptionWebinar) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!type) {
                that._logger.log(that.DEBUG, LOG_ID + "(stageDescriptionWebinar) bad or empty 'type' parameter : ", type);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!properties) {
                that._logger.log(that.DEBUG, LOG_ID + "(stageDescriptionWebinar) bad or empty 'properties' parameter : ", properties);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.stageDescriptionWebinar(roomId, userId, type, properties).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(stageDescriptionWebinar) result from server : ", result);

                if (result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    //endregion Conference V2

    //region Bubbles - dialIn

    /**
     * @public
     * @nodered true
     * @method disableDialInForABubble
     * @instance
     * @since 2.21.0
     * @category Bubbles - dialIn
     * @param {string} bubbleId The id of the room.
     * @async
     * @description
     *       This API allows to disable dial in for a room. <br>
     * @return {Promise<any>} the result of the operation.
     *
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | dialInCode | String | Dial in code. |
     * 
     */
    disableDialInForABubble(bubbleId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(disableDialInForABubble) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(disableDialInForABubble) bubbleId : " + bubbleId);

            if (!bubbleId) {
                that._logger.log(that.DEBUG, LOG_ID + "(disableDialInForABubble) bad or empty 'bubbleId' parameter : ", bubbleId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.disableDialInForARoom(bubbleId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(disableDialInForABubble) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method enableDialInForABubble
     * @instance
     * @since 2.21.0
     * @category Bubbles - dialIn
     * @param {string} bubbleId The id of the room.
     * @async
     * @description
     *       This API allows enabling dial in for a room. <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | dialInCode | String | Dial in code. |
     *
     */
    enableDialInForABubble(bubbleId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(enableDialInForABubble) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(enableDialInForABubble) bubbleId : " + bubbleId);

            if (!bubbleId) {
                that._logger.log(that.DEBUG, LOG_ID + "(enableDialInForABubble) bad or empty 'bubbleId' parameter : ", bubbleId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.enableDialInForARoom(bubbleId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(enableDialInForABubble) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method resetDialInCodeForABubble
     * @instance
     * @since 2.21.0
     * @category Bubbles - dialIn
     * @param {string} bubbleId The id of the room.
     * @async
     * @description
     *       This API allows resetting dial in code for a room. <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | dialInCode | String | Dial in code. |
     *
     */
    resetDialInCodeForABubble(bubbleId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(resetDialInCodeForABubble) bubbleId : ", bubbleId);

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(resetDialInCodeForABubble) bubbleId : " + bubbleId);

            if (!bubbleId) {
                that._logger.log(that.DEBUG, LOG_ID + "(resetDialInCodeForABubble) bad or empty 'bubbleId' parameter : ", bubbleId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.resetDialInCodeForARoom(bubbleId).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(resetDialInCodeForABubble) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method getDialInPhoneNumbersList
     * @instance
     * @since 2.21.0
     * @category Bubbles - dialIn
     * @param {string} shortList Allows to display phoneNumbers of the user's country in a separate list (default true).
     * @async
     * @description
     *       This API allows retrieving the list of phone numbers to join conference by Dial In. <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | country | String | User country (ISO 3166-1 alpha3 format) |
     * | language | String | User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) |
     * | shortList | Object\[\] | When the user's country is known, show when exist phoneNumbers located in this country |
     * | location | String | Country and sometime a city |
     * | locationcode | String | ISO 3166 location code |
     * | number | String | Dialable phone number |
     * | numberE164 | String | Dialable phone number in E.164 format |
     * | numberType | String | Number free of charge or not, one of `local`, `lo-call`, `tollFree`, `other` |
     * | phoneNumberList | Object\[\] | List of phoneNumbers ranked by country in the user's language (default: en) |
     * | location | String | Country and sometime a city |
     * | locationcode | String | ISO 3166 location code |
     * | number | String | Dialable phone number |
     * | numberE164 | String | Dialable phone number in E.164 format |
     * | numberType | String | Number free of charge or not, one of `local`, `lo-call`, `tollFree`, `other` |
     *
     */
    getDialInPhoneNumbersList ( shortList : boolean) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getDialInPhoneNumbersList) .");

        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(getDialInPhoneNumbersList) shortList : " + shortList);

            if (!shortList) {
                that._logger.log(that.DEBUG, LOG_ID + "(getDialInPhoneNumbersList) bad or empty 'shortList' parameter : ", shortList);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getDialInPhoneNumbersList(shortList).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getDialInPhoneNumbersList) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

   //endregion Bubbles - dialIn


}

module.exports.BubblesService = Bubbles;
export {Bubbles as BubblesService};

