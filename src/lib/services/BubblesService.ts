"use strict";

import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import * as deepEqual from "deep-equal";
import {GuestParams, MEDIATYPE, RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Bubble} from "../common/models/Bubble";
import {XMPPService} from "../connection/XMPPService";
import {EventEmitter} from "events";
import {createPromiseQueue} from "../common/promiseQueue";
import {getBinaryData, isStarted, logEntryExit, resizeImage, until} from "../common/Utils";
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {ProfilesService} from "./ProfilesService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";
import {Contact} from "../common/models/Contact";
import {ConferenceSession} from "../common/models/ConferenceSession";
import {ConferencePassCodes} from "../common/models/ConferencePassCodes";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";
import {Conference} from "../common/models/Conference";
import {BubblesManager} from "../common/BubblesManager";
import {GenericService} from "./GenericService";

export {};

const LOG_ID = "BUBBLES/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name Bubbles
 * @version SDKVERSION
 * @public
 * @description
 *      This service manages multi-party communications (aka bubbles). Bubbles allow to chat and to share files with several participants.<br><br>
 *      Each user can create bubbles and invite other users to be part of it. <br/>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new bubble <br>
 *      - Invite users in a bubble or remove them <br>
 *      - Manage a bubble: close, delete <br>
 *      - Leave a bubble <br>
 *      - Accept or decline an invitation to join a bubble <br>
 *      - Change the custom data attached to a bubble <br/>
 */
class Bubbles extends GenericService {
    private _bubbles: Bubble[];
    private avatarDomain: string;
    private _contacts: ContactsService;
    private _profileService: ProfilesService;
    private _presence: PresenceService;
    private _personalConferenceBubbleId: any;
    private _personalConferenceConfEndpointId: any;
    //private _conferencesSessionById: { [id: string] : any; } = {};     // <Conference Id, Conference>
    //private _linkConferenceAndBubble: { [id: string] : any; } = {}; // <Conference Id, Bubble Id>
    private _conferenceEndpoints: IDictionary<string, Conference> = new Dictionary();     // <Conference Id, Conference>
    private _conferencesSessionById: IDictionary<string, ConferenceSession> = new Dictionary();     // <Conference Id, Conference>
    private _linkConferenceAndBubble: IDictionary<string, string> = new Dictionary(); // <Conference Id, Bubble Id>
    private _webrtcConferenceId: string;
    _webConferenceRoom: any;
    private readonly _protocol: string = null;
    private readonly _host: string = null;
    private readonly _port: string = null;
    private bubblesManager : BubblesManager;

    static getClassName(){ return 'Bubbles'; }
    getClassName(){ return Bubbles.getClassName(); }

    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._bubbles = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._startConfig = _startConfig;
        this._protocol = _http.protocol;
        this._host = _http.host;
        this._port = _http.port;

        this.bubblesManager = new BubblesManager(this._eventEmitter,this._logger)

        this.avatarDomain = this._host.split(".").length === 2 ? this._protocol + "://cdn." + this._host + ":" + this._port : this._protocol + "://" + this._host + ":" + this._port;

        this._eventEmitter.on("evt_internal_invitationreceived", this._onInvitationReceived.bind(this));
        this._eventEmitter.on("evt_internal_affiliationchanged", this._onAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_ownaffiliationchanged", this._onOwnAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_customdatachanged", this._onCustomDataChanged.bind(this));
        this._eventEmitter.on("evt_internal_topicchanged", this._onTopicChanged.bind(this));
        this._eventEmitter.on("evt_internal_namechanged", this._onNameChanged.bind(this));
        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));
        this._eventEmitter.on("evt_internal_privilegechanged", this._onPrivilegeBubbleChanged.bind(this));
        this._eventEmitter.on("evt_internal_roomscontainer", this._onBubblesContainerReceived.bind(this));

    }

    start(_options, _core: Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _profileService : ProfilesService
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                await that.bubblesManager.init(_options, _core);
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._bubbles = [];
                that._contacts = _core.contacts;
                that._profileService = _core.profiles;
                that._presence = _core.presence;
                that._options = _options;
                that._s2s = _core._s2s;
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
                that.setStarted ();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    stop() {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._bubbles = null;
                /*that._eventEmitter.removeListener("evt_internal_invitationreceived", that._onInvitationReceived.bind(that));
                that._eventEmitter.removeListener("evt_internal_affiliationchanged", that._onAffiliationChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_ownaffiliationchanged", that._onOwnAffiliationChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_customdatachanged", that._onCustomDataChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_topicchanged", that._onTopicChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_namechanged", that._onNameChanged.bind(that));
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                // */
                that.bubblesManager.reset();
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    async init() {
        let that = this;
        that.setInitialized();
    }

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
    async createBubble(name, description, withHistory = false) {

        let that = this;

        return new Promise((resolve, reject) => {

            if (typeof withHistory === "undefined") {
                withHistory = false;
            }

            if (!name) {
                that._logger.log("warn", LOG_ID + "(createBubble) bad or empty 'name' parameter.");
                that._logger.log("internalerror", LOG_ID + "(createBubble) bad or empty 'name' parameter : ", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!description) {
                that._logger.log("warn", LOG_ID + "(createBubble) bad or empty 'description' parameter.");
                that._logger.log("internalerror", LOG_ID + "(createBubble) bad or empty 'description' parameter : ", description);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.createBubble(name, description, withHistory).then((bubble: any) => {
                that._logger.log("debug", LOG_ID + "(createBubble) creation successfull");
                that._logger.log("internal", LOG_ID + "(createBubble) creation successfull, bubble", bubble);

                /*that._eventEmitter.once("evt_internal_bubblepresencechanged", function fn_onbubblepresencechanged() {
                    that._logger.log("debug", LOG_ID + "(createBubble) bubble presence successfull");
                    that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                    that._bubbles.push(Object.assign( new Bubble(), bubble));
                    that._eventEmitter.removeListener("evt_internal_bubblepresencechanged", fn_onbubblepresencechanged);
                    resolve(bubble);
                }); // */

                that._presence.sendInitialBubblePresence(bubble).then(async () => {
                    /*// Wait for the bubble to be added in service list with the treatment of the sendInitialPresence result event (_onbubblepresencechanged)
                    await until(() => {
                            return (that._bubbles.find((bubbleIter: any) => {
                                return (bubbleIter.jid === bubble.jid);
                            }) !== undefined);
                        },
                        "Waiting for the initial presence of a creation of bubble : " + bubble.jid);
                     */
                    //that._bubbles.push(Object.assign( new Bubble(), bubble));
                    that._logger.log("debug", LOG_ID + "(createBubble) bubble successfully created and presence sent : ", bubble.jid);
                    resolve(bubble);
                });

            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(createBubble) error");
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method isBubbleClosed
     * @instance
     * @param {Bubble} bubble  The bubble to check
     * @return {boolean} True if the bubble is closed
     * @description
     *  Check if the bubble is closed or not. <br/>
     */
    isBubbleClosed(bubble) {

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter : ", bubble);
            throw (ErrorManager.getErrorManager().BAD_REQUEST);
        } else {
            let activeUser = bubble.users.find((user) => {
                return user.status === "invited" || user.status === "accepted";
            });

            return !activeUser;            
        }
    }

    /**
     * @public
     * @method
     * @instance
     * @description
     *    Delete all existing owned bubbles <br/>
     *    Return a promise <br/>
     * @return {Object} Nothing or an error object depending on the result
     */
    deleteAllBubbles() {
        let that = this;
        let deleteallBubblePromiseQueue = createPromiseQueue(that._logger);

        let bubbles = that.getAll();

        bubbles.forEach(function (bubble) {
            let deleteBubblePromise = function () {
                return that.deleteBubble(bubble);
            };
            deleteallBubblePromiseQueue.add(deleteBubblePromise);
        });

        return deleteallBubblePromiseQueue.execute();
    };

    /**
     * @public
     * @method
     * @instance
     * @description
     *    Delete all existing owned bubbles <br/>
     *    Return a promise <br/>
     * @return {Object} Nothing or an error object depending on the result
     */
    closeAnddeleteAllBubbles() {
        let that = this;
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
    deleteBubble(bubble) {
        let that = this;

        return new Promise(function (resolve, reject) {

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteBubble(bubble.id).then((resultDelete) => {
                //let bubbleRemoved = await that.removeBubbleFromCache(updatedBubble.id);
                /*let bubbleRemovedList = that._bubbles.splice(that._bubbles.findIndex(function(el) {
                    return el.id === updatedBubble.id;
                }), 1); // */
                that._logger.log("debug", LOG_ID + "(deleteBubble) delete bubble with id : ", bubble.id, " successfull");
                that._logger.log("internal", LOG_ID + "(deleteBubble) delete bubble : ", bubble, ", resultDelete : ", resultDelete, " bubble successfull");
                //let bubbleRemoved = bubbleRemoved.length > 0 ? bubbleRemoved[0] : null;
                //resolve( Object.assign(bubble, bubbleRemoved));
                resolve(bubble);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteBubble) error");
                return reject(err);
            });
        });
    }

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
    closeAndDeleteBubble(bubble) {
        let that = this;

        return new Promise(function (resolve, reject) {
            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter ");
                that._logger.log("warn", LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that.closeBubble(bubble).then((updatedBubble: any) => {
                that._rest.deleteBubble(updatedBubble.id).then(() => {
                    //let bubbleRemoved = await that.removeBubbleFromCache(updatedBubble.id);
                    /*let bubbleRemovedList = that._bubbles.splice(that._bubbles.findIndex(function(el) {
                        return el.id === updatedBubble.id;
                    }), 1); // */
                    that._logger.log("debug", LOG_ID + "(deleteBubble) delete with id : ", updatedBubble.id, " bubble successfull");
                    that._logger.log("internal", LOG_ID + "(deleteBubble) delete ", updatedBubble, " bubble successfull");
                    //let bubbleRemoved = bubbleRemoved.length > 0 ? bubbleRemoved[0] : null;
                    //resolve( Object.assign(bubble, bubbleRemoved));
                    resolve(updatedBubble);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(deleteBubble) error");
                    return reject(err);
                });
            }).catch((err) => {
                return reject(err);
            });
        });
    }

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
    closeBubble(bubble) {
        let that = this;

        let unsubscribeParticipants = (participantsIDList) => {

            return new Promise((resolve, reject) => {

                let participantID = participantsIDList.shift();

                if (participantID) {
                    return that.removeContactFromBubble({id: participantID}, bubble).then(() => {
                        that._logger.log("debug", LOG_ID + "(closeBubble) Participant " + participantID + " unsubscribed");
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

        return new Promise(function (resolve, reject) {
            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(closeBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(closeBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (that.isBubbleClosed(bubble)) {
                that._logger.log("internal", LOG_ID + "(closeBubble) bubble is already closed : ", bubble);
                resolve(bubble);
            } else {
                let queue = [];
                bubble.users.forEach(function (user) {
                    if (user.userId !== that._rest.userId && user.status !== Bubble.RoomUserStatus.DELETED && user.status !== Bubble.RoomUserStatus.REJECTED) {
                        // if (user.userId !== that._rest.userId) {
                        // unsubscribe everyone except the connected user
                        queue.push(user.userId);
                        //}
                    }
                });

                // unsubscribe the connected user
                // queue.push(that._rest.userId);

                unsubscribeParticipants(queue).then(() => {
                    that._logger.log("info", LOG_ID + "(closeBubble) all users have been unsubscribed from bubble. Bubble is closed");

                    that.removeContactFromBubble({id: that._rest.userId}, bubble).then(() => {
                        that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {

                            //

                            // Update the existing local bubble stored
                            let bubbleReturned = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                            /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                            if ( foundIndex > -1) {
                                bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                that._bubbles[foundIndex] = bubbleUpdated;
                            } else {
                                that._logger.log("warn", LOG_ID + "(closeBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                            }
                            // */

                            resolve(bubbleReturned);
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
    archiveBubble(bubble) {
        let that = this;
        return new Promise(function (resolve, reject) {

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(archiveBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(archiveBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.archiveBubble(bubble.id).then(function (json) {
                that._logger.log("info", LOG_ID + "(archiveBubble) leave successfull");
                that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                resolve(json);

            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(archiveBubble) error.");
                that._logger.log("internalerror", LOG_ID + "(archiveBubble) error : ", err);
                return reject(err);
            });
        });
    }

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
    leaveBubble(bubble) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let otherModerator = null;
            let userStatus = "none";

            if (bubble) {
                otherModerator = bubble.users.find((user) => {
                    return user.privilege === "moderator" && user.status === "accepted" && user.userId !== that._rest.userId;
                });

                userStatus = bubble.getStatusForUser(that._rest.userId);
            }

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!otherModerator) {
                that._logger.log("warn", LOG_ID + "(leaveBubble) can't leave a bubble if no other active moderator");
                reject(ErrorManager.getErrorManager().FORBIDDEN);
                return;
            }

            that._rest.leaveBubble(bubble.id, userStatus).then(function (json) {
                that._logger.log("info", LOG_ID + "(leaveBubble) leave successfull");
                that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(leaveBubble) error.");
                that._logger.log("internalerror", LOG_ID + "(leaveBubble) error : ", err);
                return reject(err);
            });
        });
    }


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
    getUsersFromBubble(bubble, options: Object = {}) {
        let that = this;
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
                that._logger.log("info", LOG_ID + "(getRoomUsers) retrieve successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getRoomUsers) error.");
                that._logger.log("internalerror", LOG_ID + "(getRoomUsers) error : ", err);
                return reject(err);
            });
        });
    }

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
    getStatusForConnectedUserInBubble(bubble) {
        let that = this;
        if (!bubble) {
            that._logger.log("warn", LOG_ID + "(getStatusForConnectedUserInBubble) bad or empty 'bubble' parameter.");
            that._logger.log("internalerror", LOG_ID + "(getStatusForConnectedUserInBubble) bad or empty 'bubble' parameter : ", bubble);
            //reject(ErrorManager.getErrorManager().BAD_REQUEST);
            return "none";
        }
        let user = bubble.users.find((user) => {
            return user.userId === that._rest.userId;
        });
        return user ? user.status : "none";
    }

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
    inviteContactToBubble(contact, bubble, isModerator, withInvitation, reason = null) {
        let that = this;

        return new Promise(function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(inviteContactToBubble) arguments : ", ...arguments);

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter.");
                that._logger.log("internalerror", LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter : ", contact);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let isActive = false;
            let isInvited = false;
            bubble.users.forEach(function (user) {
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
            });

            if (isActive || isInvited) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) Contact has been already invited or is already a member of the bubble");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that.removeContactFromBubble(contact, bubble).then((bubbleUpdated: any) => {
                return that._rest.inviteContactToBubble(contact.id, bubbleUpdated.id, isModerator, withInvitation, reason);
            }).then(function () {
                that._logger.log("info", LOG_ID + "(inviteContactToBubble) invitation successfully sent");

                return that._rest.getBubble(bubble.id);
            }).then(async (bubbleReUpdated: any) => {

                let bubble = await that.addOrUpdateBubbleToCache(bubbleReUpdated);

                /*
                // Update the existing local bubble stored
                let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleReUpdated.id);
                if ( foundIndex > -1) {
                    bubbleReUpdated = Object.assign(that._bubbles[foundIndex], bubbleReUpdated);
                    that._bubbles[foundIndex] = bubbleReUpdated;
                } else {
                    that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bubble with id:" + bubbleReUpdated.id + " is no more available");
                }
                 */

                resolve(bubble);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(inviteContactToBubble) error");
                return reject(err);
            });
        });
    }

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
    inviteContactsByEmailsToBubble(contactsEmails, bubble) {
        let that = this;

        return new Promise(function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(inviteContactsByEmailToBubble) arguments : ", ...arguments);

            if (!contactsEmails || !Array.isArray(contactsEmails)) {
                that._logger.log("warn", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'contact' parameter.");
                that._logger.log("internalerror", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'contact' parameter : ", contactsEmails);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            return that._rest.inviteContactsByEmailsToBubble(contactsEmails, bubble.id).then(function () {
                that._logger.log("info", LOG_ID + "(inviteContactsByEmailsToBubble) invitation successfully sent");
                return that._rest.getBubble(bubble.id);
            }).then(async (bubbleReUpdated: any) => {
                let bubble = await that.addOrUpdateBubbleToCache(bubbleReUpdated);
                resolve(bubble);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(inviteContactsByEmailsToBubble) error");
                return reject(err);
            });
        });
    }

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
    promoteContactInBubble(contact, bubble, isModerator) {
        let that = this;

        return new Promise(function (resolve, reject) {

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter.");
                that._logger.log("internalerror", LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter : ", contact);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            let isActive = false;
            let isInvited = false;
            bubble.users.forEach(function (user) {
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
            });

            if (!isActive && !isInvited) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) Contact is not invited or is not already a member of the bubble");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.promoteContactInBubble(contact.id, bubble.id, isModerator)
                .then(function () {
                    that._logger.log("info", LOG_ID + "(promoteContactInBubble) user privilege successfully sent");

                    return that._rest.getBubble(bubble.id);
                }).then(async (bubbleReUpdated: any) => {

                // Update the existing local bubble stored
                let bubble = await that.addOrUpdateBubbleToCache(bubbleReUpdated);
                /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleReUpdated.id);
                if ( foundIndex > -1) {
                    bubbleReUpdated = Object.assign(that._bubbles[foundIndex], bubbleReUpdated);
                    that._bubbles[foundIndex] = bubbleReUpdated;
                } else {
                    that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bubble with id:" + bubbleReUpdated.id + " is no more available");
                }
                 */

                resolve(bubble);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(promoteContactInBubble) error");
                that._logger.log("internalerror", LOG_ID + "(promoteContactInBubble) error : ", err);
                reject(err);
            });
        });
    }

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
    promoteContactToModerator(contact, bubble) {
        let that = this;
        if (!contact) {
            that._logger.log("warn", LOG_ID + "(promoteContactToModerator) bad or empty 'contact' parameter.");
            that._logger.log("internalerror", LOG_ID + "(promoteContactToModerator) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubble) {
            that._logger.log("warn", LOG_ID + "(promoteContactToModerator) bad or empty 'bubble' parameter.");
            that._logger.log("internalerror", LOG_ID + "(promoteContactToModerator) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        return this.promoteContactInBubble(contact, bubble, true);
    }

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
    demoteContactFromModerator(contact, bubble) {
        let that = this;
        if (!contact) {
            that._logger.log("warn", LOG_ID + "(demoteContactFromModerator) bad or empty 'contact' parameter.");
            that._logger.log("internalerror", LOG_ID + "(demoteContactFromModerator) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubble) {
            that._logger.log("warn", LOG_ID + "(demoteContactFromModerator) bad or empty 'bubble' parameter.");
            that._logger.log("internalerror", LOG_ID + "(demoteContactFromModerator) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        return this.promoteContactInBubble(contact, bubble, false);
    }

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
    changeBubbleOwner(bubble, contact) {

        let that = this;

        if (!contact) {
            that._logger.log("warn", LOG_ID + "(changeBubbleOwner) bad or empty 'contact' parameter ");
            that._logger.log("internalerror", LOG_ID + "(changeBubbleOwner) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubble) {
            this._logger.log("warn", LOG_ID + "(changeBubbleOwner) bad or empty 'bubble' parameter ");
            this._logger.log("internalerror", LOG_ID + "(changeBubbleOwner) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.changeBubbleOwner(bubble.id, contact.id).then(async (bubbleData: any) => {
                bubbleData = await that.addOrUpdateBubbleToCache(bubbleData);
                that._logger.log("info", LOG_ID + "(changeBubbleOwner) owner setted : ", bubbleData.owner);
                bubble.owner = bubbleData.owner;
                resolve(bubbleData);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(changeBubbleOwner) error");
                that._logger.log("internalerror", LOG_ID + "(changeBubbleOwner) error : ", err);
                return reject(err);
            });
        });
    }

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
    removeContactFromBubble(contact, bubble) {

        let that = this;

        return new Promise(function (resolve, reject) {

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter.");
                that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter : ", contact);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let contactStatus = "";

            bubble.users.forEach(function (user) {
                if (user.userId === contact.id) {
                    contactStatus = user.status;
                }
            });

            that._logger.log("info", LOG_ID + "(removeContactFromBubble) remove contact with status", contactStatus);

            switch (contactStatus) {
                case "rejected":
                case "invited":
                case "unsubscribed":
                    that._rest.removeInvitationOfContactToBubble(contact.id, bubble.id).then(function () {
                        that._logger.log("info", LOG_ID + "(removeContactFromBubble) removed successfully");

                        that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                            // Update the existing local bubble stored
                            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                            /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                            if ( foundIndex > -1) {
                                bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                that._bubbles[foundIndex] = bubbleUpdated;
                            } else {
                                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                            }
                             */

                            resolve(bubble);
                        });
                    }).catch(function (err) {
                        that._logger.log("error", LOG_ID + "(removeContactFromBubble) error");
                        that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) error : ", err);
                        return reject(err);
                    });
                    break;
                case "accepted":
                    that._rest.unsubscribeContactFromBubble(contact.id, bubble.id).then(function () {
                        that._logger.log("debug", LOG_ID + "(removeContactFromBubble) removed successfully");

                        that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {

                            // Update the existing local bubble stored
                            let bubbleProm = that.addOrUpdateBubbleToCache(bubbleUpdated);
                            let bubble = await bubbleProm;
                            /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                            if ( foundIndex > -1) {
                                bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                that._bubbles[foundIndex] = bubbleUpdated;
                            } else {
                                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                            }
                             */

                            // We send the result here, because sometimes the xmpp server does not send us the resulting event.
                            // So this event change will be sent twice time.
                            that._eventEmitter.emit("evt_internal_affiliationdetailschanged", bubble);
                            resolve(bubble);
                        });
                    }).catch(function (err) {
                        that._logger.log("error", LOG_ID + "(removeContactFromBubble) error");
                        that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) error : ", err);
                        return reject(err);
                    });
                    break;
                default:
                    that._logger.log("warn", LOG_ID + "(removeContactFromBubble) contact not found in that bubble");
                    resolve(bubble);
                    break;
            }
        });
    }

    /**
     * @private
     * @description
     *      Internal method
     */
    getBubbles() {
        let that = this;

        return new Promise(function (resolve, reject) {
            that._rest.getBubbles().then(function (listOfBubbles: any = []) {
                that._logger.log("debug", LOG_ID + "(getBubbles)  listOfBubbles.length : ", listOfBubbles.length);

                //that._bubbles = listOfBubbles.map( (bubble) => Object.assign( new Bubble(), bubble));
                that._bubbles = [];
                listOfBubbles.map(async (bubble) => {
                    await that.addOrUpdateBubbleToCache(bubble);
                });
                that._logger.log("info", LOG_ID + "(getBubbles) get successfully");
                let prom = [];
                listOfBubbles.forEach(function (bubble: any) {

                    let users = bubble.users;
                    users.forEach(function (user) {
                        if (user.userId === that._rest.userId && user.status === "accepted") {
                            if (that._options._imOptions.autoInitialBubblePresence) {
                                if (bubble.isActive) {
                                    that._logger.log("debug", LOG_ID + "(getBubbles) send initial presence to room : ", bubble.jid);
                                    //prom.push(that._presence.sendInitialBubblePresence(bubble));
                                    prom.push(that.bubblesManager.addBubbleToJoin(bubble));
                                } else {
                                    that._logger.log("debug", LOG_ID + "(getBubbles) bubble not active, so do not send initial presence to room : ", bubble.jid);
                                }
                            } else {
                                that._logger.log("debug", LOG_ID + "(getBubbles)  autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        }
                    });
                });

                Promise.all(prom).then(async () => {
                    if (that._options._imOptions.autoInitialBubblePresence) {
                        that._logger.log("debug", LOG_ID + "(getBubbles)  autoInitialBubblePresence active, so treatAllBubblesToJoin");
                        await that.bubblesManager.treatAllBubblesToJoin();
                    } else {
                        that._logger.log("debug", LOG_ID + "(getBubbles)  autoInitialBubblePresence not active, so do not treatAllBubblesToJoin");
                    }

                    return that.retrieveConferences(undefined, false, false).then((conferences) => {
                        that._logger.log("info", LOG_ID + "(getBubbles) retrieveAllConferences : ", conferences);
                        resolve(undefined);
                    }).catch(() => {
                        resolve(undefined);
                    });
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getBubbles) error");
                    that._logger.log("internalerror", LOG_ID + "(getBubbles) error : ", err);
                    return reject(err);
                }); // */
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getBubbles) error");
                that._logger.log("internalerror", LOG_ID + "(getBubbles) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAll
     * @instance
     * @return {Bubble[]} The list of existing bubbles
     * @description
     *  Return the list of existing bubbles <br/>
     */
    getAll() {
        return this._bubbles;
    }

    /**
     * @public
     * @method getAllBubbles
     * @instance
     * @return {Bubble[]} The list of existing bubbles
     * @description
     *  Return the list of existing bubbles <br/>
     */
    getAllBubbles() {
        return this.getAll();
    }

    /**
     * @public
     * @method getAllOwnedBubbles
     * @instance
     * @description
     *    Get the list of bubbles created by the user <br/>
     * @return {Bubble[]} An array of bubbles restricted to the ones owned by the user
     */
    getAllOwnedBubbles() {
        let that = this;
//        return new Promise(function (resolve, reject) {
        that._logger.log("debug", LOG_ID + "(getAllOwnedBubbles) ");
        //resolve(that._bubbles.filter(function (room) {
        return (that._bubbles.filter(function (room) {
            return (room.creator === that._rest.userId);
        }));
        //      });
    }

    private getBubbleFromCache(bubbleId: string): Bubble {
        let bubbleFound = null;
        this._logger.log("internal", LOG_ID + "(getBubbleFromCache) search id : ", bubbleId);

        if (this._bubbles) {
            let channelFoundindex = this._bubbles.findIndex((channel) => {
                return channel.id === bubbleId;
            });
            if (channelFoundindex != -1) {
                this._logger.log("internal", LOG_ID + "(getBubbleFromCache) bubble found : ", this._bubbles[channelFoundindex], " with id : ", bubbleId);
                return this._bubbles[channelFoundindex];
            }
        }
        this._logger.log("internal", LOG_ID + "(getBubbleFromCache) channel found : ", bubbleFound, " with id : ", bubbleId);
        return bubbleFound;
    }

    private async addOrUpdateBubbleToCache(bubble: any): Promise<Bubble> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) - parameter bubble : ", bubble);

        let bubbleObj: Bubble = await Bubble.BubbleFactory(that.avatarDomain, that._contacts)(bubble);
        let bubbleFoundindex = this._bubbles.findIndex((channelIter) => {
            return channelIter.id === bubble.id;
        });

        if (bubble.conference != null) {
            if (bubble.conference.scheduled) {
                //canAdd = false;
                //infoMessage = "DON'T MANAGE SCHEDULED MEETING";
                that._logger.log("debug", LOG_ID + "(addOrUpdateBubbleToCache) - DON'T MANAGE SCHEDULED MEETING");
            } else if (!bubble.isActive) {
                //canAdd = false;
                //infoMessage = "DON'T MANAGE INACTIVE Personal Conference";
                that._logger.log("debug", LOG_ID + "(addOrUpdateBubbleToCache) - DON'T MANAGE INACTIVE Personal Conference");
            } else {
                if (bubble.creator === that._rest.userId) {
                    if (bubble.confEndpoints != null) {
                        //foreach(Bubble.ConfEndpoint confEndpoint in bubble.confEndpoints)
                        bubble.confEndpoints.forEach((confEndpoint: any) => {
                            if (confEndpoint != null) {
                                if (confEndpoint.mediaType === "pstnAudio") {
                                    // It's an active and not scheduled meeting with a ConfEndpointId AND PstnAudio => So it's the Personal Conference
                                    //canAdd = true;

                                    that._personalConferenceBubbleId = bubble.id;
                                    that._personalConferenceConfEndpointId = confEndpoint.confEndpointId;
                                    let mediaType = confEndpoint.mediaType;
                                    that._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) - Personal Conference found - BubbleID: ", that._personalConferenceBubbleId, " - ConfEndpointId: ", that._personalConferenceConfEndpointId, " - mediaType: ", mediaType);
                                }
                            }
                        });
                    }
                }
            }
        }

        if (bubbleFoundindex != -1) {
            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble, ", at bubbleFoundindex : ", bubbleFoundindex);
            //this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble, ", at bubbleFoundindex : ", bubbleFoundindex);
            await this._bubbles[bubbleFoundindex].updateBubble(bubble, that._contacts);
            //this._bubbles.splice(bubbleFoundindex,1,bubbleObj);
            this.refreshMemberAndOrganizerLists(this._bubbles[bubbleFoundindex]);
            //this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) in update this._bubbles : ", this._bubbles);
            bubbleObj = this._bubbles[bubbleFoundindex];
        } else {
            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) add in cache bubbleObj : ", bubbleObj);

            this.refreshMemberAndOrganizerLists(bubbleObj);
            this._bubbles.push(bubbleObj);
        }
        //this.updateChannelsList();

        // Link conference and bubble
        let conferenceId: string = null;
        if (bubble.confEndpoints != null) {
            bubble.confEndpoints.forEach((confEndpoint: any) => {
                if (confEndpoint != null) {
                    conferenceId = confEndpoint.confEndpointId;
                    if (that._linkConferenceAndBubble.containsKey(conferenceId)) {
                        this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) remove before update link conferenceId : ", conferenceId, " to bubbleId : ", bubble.id);
                        that._linkConferenceAndBubble.remove((item: KeyValuePair<string, string>) => {
                            return item.key === conferenceId;
                        });
                    }

                    this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) Link conferenceId : ", conferenceId, " to bubbleId : ", bubble.id);
                    that._linkConferenceAndBubble.add(conferenceId, bubble.id);

                    if (that._conferencesSessionById.containsKey(conferenceId)) {
                        //needToRaiseEvent = true;
                        //conference = that.conferenceGetByIdFromCache(conferenceId);
                        //break;
                    } else {
                        // Since we have no information about this conference, we ask the servrr
                        that.askConferenceSnapshot(confEndpoint.confEndpointId, confEndpoint.mediaType);
                    }
                }
            });
        }
        return bubbleObj;
    }

    private removeBubbleFromCache(bubbleId: string): Promise<Bubble> {
        let that = this;
        return new Promise((resolve, reject) => {
            // Get the channel to remove
            let bubbleToRemove = this.getBubbleFromCache(bubbleId);
            if (bubbleToRemove) {
                // Remove from channels
                let bubbleIdToRemove = bubbleToRemove.id;
                // Remove link between conference and bubble
                let conferenceId: string = null;
                if (bubbleToRemove.confEndpoints != null) {
                    bubbleToRemove.confEndpoints.forEach((confEndpoint: any) => {
                        if (confEndpoint != null) {
                            conferenceId = confEndpoint.confEndpointId;
                            if (that._linkConferenceAndBubble.containsKey(conferenceId)) {
                                that._linkConferenceAndBubble.remove((item: KeyValuePair<string, string>) => {
                                    return item.key === conferenceId;
                                });
                            }

                            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) remove link conferenceId : ", conferenceId, " to bubbleId : ", bubbleToRemove.id);
                        }
                    });
                }

                that._logger.log("internal", LOG_ID + "(removeBubbleFromCache) remove from cache bubbleId : ", bubbleIdToRemove);
                that._bubbles = this._bubbles.filter(function (chnl: any) {
                    return !(chnl.id === bubbleIdToRemove);
                });
                resolve(bubbleToRemove);
            } else {
                resolve(null);
            }
        });
    }

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
    getAvatarFromBubble(bubble) {
        /*
        Nom : 5da72aa7e6ca5a023da44eff
        Dimensions : 512 × 512
        Type MIME : image/jpeg
         */
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("internal", LOG_ID + "(getBubbleById) bubble : ", bubble);

            if (!bubble) {
                that._logger.log("debug", LOG_ID + "(getAvatarFromBubble) bad or empty 'bubble' parameter.");
                that._logger.log("internal", LOG_ID + "(getAvatarFromBubble) bad or empty 'bubble' parameter : ", bubble);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!bubble.avatar) {
                that._logger.log("debug", LOG_ID + "(getAvatarFromBubble) bad or empty avatar of 'bubble' parameter.");
                that._logger.log("debug", LOG_ID + "(getAvatarFromBubble) bad or empty avatar of 'bubble' parameter : ", bubble);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.getBlobFromUrl(bubble.avatar).then((avatarBuffer: any) => {
                that._logger.log("internal", LOG_ID + "(getAvatarFromBubble) bubble from server : ", avatarBuffer);
                let blob = {
                    buffer: avatarBuffer,
                    type: "image/jpeg",
                    fileSize: avatarBuffer.length,
                    fileName: bubble.id
                }; // */

                /*let blob = new Blob([response.data],
                    { type: mime }); // */

                that._logger.log("debug", LOG_ID + "getAvatarFromBubble success");
                resolve(blob);
            }).catch((err) => {
                return reject(err);
            });
        });

    }

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
    getBubblesConsumption () {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("internal", LOG_ID + "(getBubblesConsumption) ");

            return that._rest.getBubblesConsumption().then((consumption: any) => {
                that._logger.log("internal", LOG_ID + "(getBubblesConsumption) consumption from server : ", consumption);
                that._logger.log("debug", LOG_ID + "(getBubblesConsumption) success.");

                let consumptionBuble = {};
                if (consumption.feature === "BUBBLE_COUNT" && consumption.unit === "room") {
                    consumptionBuble = {
                        maxValue: consumption.maxValue,
                        currentValue: consumption.currentValue
                    };
                    that._logger.log("internal", LOG_ID + "(getBubblesConsumption) return consumptionBuble : ", consumptionBuble);
                } else {
                    that._logger.log("warn", LOG_ID + "(getBubblesConsumption) consumption returned is not reconnised.");
                }
                resolve(consumptionBuble);
            }).catch((err) => {
                return reject(err);
            });
        });

    }

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
    refreshMemberAndOrganizerLists(bubble) {
        let that = this;
        if (!bubble) {
            that._logger.log("debug", LOG_ID + "(refreshMemberAndOrganizerLists) bad or empty 'bubble' parameter.");
            that._logger.log("internal", LOG_ID + "(refreshMemberAndOrganizerLists) bad or empty 'bubble' parameter : ", bubble);
            return ErrorManager.getErrorManager().BAD_REQUEST;
        }

        //Clear both lists :
        bubble.organizers = [];
        bubble.members = [];

        bubble.users.forEach(function (user) {
            if (user.status === Bubble.RoomUserStatus.ACCEPTED || user.status === Bubble.RoomUserStatus.INVITED || user.jid_im === bubble.ownerContact.jid) {
                if (user.privilege === Bubble.Privilege.MODERATOR) {
                    bubble.organizers.push(user);
                } else {
                    bubble.members.push(user);
                }
            }
        });
    };

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
    getBubbleById(id, force?: boolean): Promise<Bubble> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getBubbleById) bubble id  " + id);

            if (!id) {
                that._logger.log("debug", LOG_ID + "(getBubbleById) bad or empty 'id' parameter : ", id);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let bubbleFound = that._bubbles.find((bubble) => {
                return (bubble.id === id);
            });

            if (bubbleFound && !force) {
                that._logger.log("debug", LOG_ID + "(getBubbleById) bubbleFound in memory : ", bubbleFound.jid);
            } else {
                that._logger.log("debug", LOG_ID + "(getBubbleById) bubble not found in memory, search in server id : ", id);
                return that._rest.getBubble(id).then(async (bubbleFromServer : any ) => {
                    that._logger.log("internal", LOG_ID + "(getBubbleById) bubble from server : ", bubbleFromServer);

                    if (that._options._imOptions.autoInitialBubblePresence) {
                        if (bubbleFromServer) {
                            let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                            //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                            //that._bubbles.push(bubble);
                            if (bubble.isActive) {
                                that._logger.log("debug", LOG_ID + "(getBubbleById) send initial presence to room : ", bubble.jid);
                                await that._presence.sendInitialBubblePresence(bubble);
                            } else {
                                that._logger.log("debug", LOG_ID + "(getBubbleById) bubble not active, so do not send initial presence to room : ", bubble.jid);
                            }
                            resolve(bubble);
                        } else {
                            resolve(null);
                        }
                    } else {
                        that._logger.log("debug", LOG_ID + "(getBubbleById) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubbleFromServer.jid);
                        resolve(null);
                    }
                }).catch((err) => {
                    return reject(err);
                });
            }


            that._logger.log("internal", LOG_ID + "(getBubbleById) bubbleFound in memory : ", bubbleFound);
            resolve(bubbleFound);
        });
    }

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
    async getBubbleByJid(jid, force?: boolean): Promise<Bubble> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getBubbleByJid) bubble jid  ", jid);

            if (!jid) {
                that._logger.log("debug", LOG_ID + "(getBubbleByJid) bad or empty 'jid' parameter : ", jid);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let bubbleFound: any = that._bubbles.find((bubble) => {
                return (bubble.jid === jid);
            });


            if (bubbleFound && !force) {
                that._logger.log("debug", LOG_ID + "(getBubbleByJId) bubbleFound in memory : ", bubbleFound.jid);
            } else {
                that._logger.log("debug", LOG_ID + "(getBubbleByJId) bubble not found in memory, search in server jid : ", jid);
                return that._rest.getBubbleByJid(jid).then(async (bubbleFromServer) => {
                    that._logger.log("internal", LOG_ID + "(getBubbleByJId) bubble from server : ", bubbleFromServer);

                    if (bubbleFromServer) {
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                        //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                        //that._bubbles.push(bubble);
                        if (that._options._imOptions.autoInitialBubblePresence) {
                            if (bubble.isActive ) {
                                that._logger.log("debug", LOG_ID + "(getBubbleByJid) send initial presence to room : ", bubble.jid);
                                await that._presence.sendInitialBubblePresence(bubble);
                            } else {
                                that._logger.log("debug", LOG_ID + "(getBubbleByJid) bubble not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        } else {
                            that._logger.log("debug", LOG_ID + "(getBubbleByJid) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
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
     * @method getAllPendingBubbles
     * @instance
     * @return {Bubble[]} An array of Bubbles not accepted or declined
     * @description
     *  Get the list of Bubbles that have a pending invitation not yet accepted of declined <br/>
     */
    getAllPendingBubbles() {

        let that = this;

        return this._bubbles.filter((bubble) => {

            let invitation = bubble.users.filter((user) => {
                return (user.userId===that._rest.userId && user.status==="invited");
            });
            return invitation.length > 0;
        });
    }

    /**
     * @public
     * @method getAllActiveBubbles
     * @since 1.30
     * @instance
     * @return {Bubble[]} An array of Bubbles that are "active" for the connected user
     * @description
     *  Get the list of Bubbles where the connected user can chat <br/>
     */
    getAllActiveBubbles() {
        let that = this;

        return this._bubbles.filter((bubble) => {

            return bubble.users.find((user) => {
                return (user.userId===that._rest.userId && user.status==="accepted");
            });
        });
    }

    /**
     * @public
     * @method getAllClosedBubbles
     * @since 1.30
     * @instance
     * @return {Bubble[]} An array of Bubbles that are closed for the connected user
     * @description
     *  Get the list of Bubbles where the connected user can only read messages <br/>
     */
    getAllClosedBubbles() {
        let that = this;

        return this._bubbles.filter((bubble) => {

            return bubble.users.find((user) => {
                return (user.userId===that._rest.userId && user.status==="unsubscribed");
            });
        });
    }

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
    acceptInvitationToJoinBubble(bubble : Bubble) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.acceptInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                that._logger.log("info", LOG_ID + "(acceptInvitationToJoinBubble) invitation accepted", invitationStatus);

                that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                    // Update the existing local bubble stored
                    let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                    /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                    if ( foundIndex > -1) {
                        bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                        that._bubbles[foundIndex] = bubbleUpdated;
                    } else {
                        that._logger.log("warn", LOG_ID + "(acceptInvitationToJoinBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                    }
                     */

                    resolve(bubble);
                });

            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(acceptInvitationToJoinBubble) error");
                that._logger.log("internalerror", LOG_ID + "(acceptInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

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
    declineInvitationToJoinBubble(bubble) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.declineInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                that._logger.log("info", LOG_ID + "(declineInvitationToJoinBubble) invitation declined : ", invitationStatus);

                that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {
                    // Update the existing local bubble stored
                    let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                    /*let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                    if ( foundIndex > -1) {
                        bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                        that._bubbles[foundIndex] = bubbleUpdated;
                    } else {
                        that._logger.log("warn", LOG_ID + "(declineInvitationToJoinBubble) bubble with id:" + bubbleUpdated.id + " is no more available");
                    }
                     */

                    resolve(bubble);
                });

            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(declineInvitationToJoinBubble) error");
                that._logger.log("internalerror", LOG_ID + "(declineInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

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
    setBubbleCustomData(bubble, customData) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let bubbleId = bubble.id;

        let custom = {"customData": customData || {}};

        return new Promise((resolve, reject) => {

            that._rest.setBubbleCustomData(bubbleId, custom).then(async (json: any) => {
                that._logger.log("internal", LOG_ID + "(setBubbleCustomData) customData set", json.customData);
                bubble.customData = json.customData || {};

                try {
                    await until(() => {

                        let bubbleInMemory = that._bubbles.find((bubbleIter) => {
                            return bubbleIter.id === bubbleId;
                        });
                        if (bubbleInMemory) {
                            that._logger.log("internal", LOG_ID + "(setBubbleCustomData) bubbleInMemory : ", bubbleInMemory, ", \nbubble : ", bubble);

                            return deepEqual(bubbleInMemory.customData, bubble.customData);
                        } else {
                            return false;
                        }
                    }, "wait in setBubbleCustomData for the customData to be updated by the event rainbow_onbubblecustomdatachanged", 8000);
                    this._logger.log("debug", LOG_ID + "(setBubbleCustomData) customData updated in bubble stored in BubblesService.");
                } catch (err) {
                    this._logger.log("debug", LOG_ID + "(setBubbleCustomData) customData not updated in bubble stored in BubblesService. Get infos about bubble from server.");
                    this._logger.log("internal", LOG_ID + "(setBubbleCustomData) customData not updated in bubble stored in BubblesService. Get infos about bubble from server.", err);
                    that._rest.getBubble(bubble.id).then(async (bubbleUpdated: any) => {

                        that._logger.log("internal", LOG_ID + "(setBubbleCustomData) Custom data in bubble retrieved from server : ", bubbleUpdated.name + " | " + bubbleUpdated.customData);

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
                    });
                }
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleCustomData) error", err);
                return reject(err);
            });
        });
    }

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
    setBubbleVisibilityStatus(bubble, status) {
        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleVisibilityStatus) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setBubbleVisibilityStatus) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleVisibility(bubble.id, status).then((bubbleData) => {
                that._logger.log("info", LOG_ID + "(setBubbleVisibilityStatus) visibility set ");
                that._logger.log("internal", LOG_ID + "(setBubbleVisibilityStatus) visibility set : ", bubbleData);
                resolve(bubbleData);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleVisibilityStatus) error");
                that._logger.log("internalerror", LOG_ID + "(setBubbleVisibilityStatus) error : ", err);
                return reject(err);
            });
        });
    }

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
    setBubbleTopic(bubble, topic) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleTopic(bubble.id, topic).then((bubbleData: any) => {
                that._logger.log("internal", LOG_ID + "(setBubbleTopic) topic set", bubbleData.topic);
                bubble.topic = bubbleData.topic;
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleTopic) error");
                that._logger.log("internalerror", LOG_ID + "(setBubbleTopic) error : ", err);
                return reject(err);
            });
        });
    }

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
    setBubbleName(bubble, name) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleName(bubble.id, name).then((bubbleData: any) => {

                that._logger.log("debug", LOG_ID + "(setBubbleName) name set : ", bubbleData.name);
                bubble.name = bubbleData.name;
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleName) error");
                that._logger.log("internalerror", LOG_ID + "(setBubbleName) error : ", err);
                return reject(err);
            });
        });
    }

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
    updateAvatarForBubble(urlAvatar, bubble) {
        return this.setAvatarBubble(bubble, urlAvatar);
    }

    /**
     * @private
     * @method setAvatarBubble
     * @param bubble
     * @param roomAvatarPath
     */
    setAvatarBubble(bubble, roomAvatarPath) {
        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!roomAvatarPath) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'roomAvatarPath' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'roomAvatarPath' parameter : ", roomAvatarPath);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            resizeImage(roomAvatarPath, 512, 512).then(function (resizedImage) {
                that._logger.log("debug", LOG_ID + "(setAvatarBubble) resizedImage : ", resizedImage);
                let binaryData = getBinaryData(resizedImage);
                that._rest.setAvatarRoom(bubble.id, binaryData).then(
                    function success(result: any) {
                        that._logger.log("debug", LOG_ID + "(setAvatarBubble) setAvatarRoom success : " + result);
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
                        that._logger.log("error", LOG_ID + "(setAvatarBubble) error.");
                        that._logger.log("internalerror", LOG_ID + "(setAvatarBubble) error : ", err);
                        return reject(err);
                    });
            });
        });
    }

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
    deleteAvatarFromBubble(bubble) {
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return this.deleteAvatarBubble(bubble.id);
    }

    /**
     * @private
     * @method deleteAvatarBubble
     * @param bubbleId
     */
    deleteAvatarBubble(bubbleId) {
        let that = this;
        if (!bubbleId) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubbleId);
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
    async updateCustomDataForBubble(customData, bubble) {
        this._logger.log("internalerror", LOG_ID + "(updateCustomDataForBubble) customData : ", customData);

        return await this.setBubbleCustomData(bubble, customData).then((bubbleUpdated) => {
            return bubbleUpdated
        });
        /*
        let that = this;
         // update bubble with internal copy to avoid user/moderator/owner side effects
         let bubblefound : any = bubble && bubble.id ? await that.getBubbleById(bubble.id) : null;

         if (!customData) {
             this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'customData' parameter.");
             this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'customData' parameter : ", customData);
             return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
         } else if (!bubblefound) {
             this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter.");
             this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
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
     * @method deleteCustomDataForBubble
     * @since 1.65
     * @instance
     * @description
     *    Delete the customData of the bubble  <br/>
     *    Return a promise. <br/>
     * @param {Bubble} bubble   The bubble to update
     * @return {Promise<Bubble>} The updated Bubble
     */
    deleteCustomDataForBubble(bubble) {
        return this.updateCustomDataForBubble("", bubble);
    }

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
    async updateDescriptionForBubble(bubble, strDescription) {
        return this.setBubbleTopic(bubble, strDescription);
        /*let that = this;
        // update bubble with internal copy to avoid user/moderator/owner side effects
        let bubblefound : any = bubble && bubble.id ? await that.getBubbleById(bubble.id) : null;

        if (!strDescription) {
            this._logger.log("warn", LOG_ID + "(updateDescriptionForBubble) bad or empty 'strDescription' parameter.");
            this._logger.log("internalerror", LOG_ID + "(updateDescriptionForBubble) bad or empty 'strDescription' parameter : ", strDescription);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubblefound) {
            this._logger.log("warn", LOG_ID + "(updateDescriptionForBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(updateDescriptionForBubble) bad or empty 'bubble' parameter : ", bubble);
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
     * @private
     * @method _onInvitationReceived
     * @instance
     * @param {Object} invitation contains informations about bubble and user's jid
     * @description
     *      Method called when receiving an invitation to join a bubble <br/>
     */
    _onInvitationReceived(invitation) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onInvitationReceived) invitation : ", invitation);

        this._rest.getBubble(invitation.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log("debug", LOG_ID + "(_onInvitationReceived) invitation received from bubble.");
            that._logger.log("internal", LOG_ID + "(_onInvitationReceived) invitation received from bubble : ", bubbleUpdated);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

            /*// Store the new bubble
            let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            } // */

            that._eventEmitter.emit("evt_internal_invitationdetailsreceived", bubble);
        }).catch((err) => {
            that._logger.log("internal", LOG_ID + "(_onInvitationReceived) get bubble failed for invitation : ", invitation, ", : ", err);
        });        
    }

    /**
     * @private
     * @method _onAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when affilitation to a bubble changed <br/>
     */
    async _onAffiliationChanged(affiliation) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onAffiliationChanged) affiliation : ", affiliation);

        await this._rest.getBubble(affiliation.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log("debug", LOG_ID + "(_onAffiliationChanged) user affiliation changed for bubble.");
            that._logger.log("internal", LOG_ID + "(_onAffiliationChanged) user affiliation changed for bubble : ", bubbleUpdated, ", affiliation : ", affiliation);

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

            that._eventEmitter.emit("evt_internal_affiliationdetailschanged", bubble);
        }).catch((err) => {
            that._logger.log("internal", LOG_ID + "(_onAffiliationChanged) get bubble failed for affiliation : ", affiliation, ", err : ", err);
        });
    }

    /**
     * @private
     * @method _onOwnAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when the user affilitation to a bubble changed <br/>
     */
    async _onOwnAffiliationChanged(affiliation) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) parameters : affiliation : ", affiliation);

        if (affiliation.status !== "deleted") {
            if (affiliation.status === "available") {
                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) available state received. Nothing to do.");
            } else {
                await this._rest.getBubble(affiliation.bubbleId).then(async (bubbleUpdated: any) => {
                    that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) own affiliation changed for bubble : ", bubbleUpdated.name + " | " + affiliation.status);

                    // Update the existing local bubble stored
                    let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                    if (foundIndex > -1) {
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
                        //bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                        //that._bubbles[foundIndex] = bubbleUpdated;
                        if (affiliation.status === "accepted" ) {
                            if (that._options._imOptions.autoInitialBubblePresence) {
                                if (bubble.isActive) {
                                    that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                                    await that._presence.sendInitialBubblePresence(bubble);
                                } else {
                                    that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                                }
                            } else {
                                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        } else if (affiliation.status === "unsubscribed") {
                            that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                        }
                    } else {
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                        /*bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                        that._bubbles.push(bubbleUpdated); // */
                        // New bubble, send initial presence
                        if (that._options._imOptions.autoInitialBubblePresence) {
                            if (bubble.isActive ) {
                                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                                await that._presence.sendInitialBubblePresence(bubble);
                            } else {
                                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        } else {
                            that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) autoInitialBubblePresence not active, so do not send initial presence to room : ", bubble.jid);
                        }

                    }

                    that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubbleUpdated);
                });
            }
        } else {

            // remove it
            let bubbleToRemoved = that._bubbles.findIndex(function (el) {
                return el.id === affiliation.bubbleId;
            });
            //*/

            if (bubbleToRemoved != -1) {
                let bubbleRemoved = await that.removeBubbleFromCache(affiliation.bubbleId);
                that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubbleRemoved);
                that._eventEmitter.emit("evt_internal_bubbledeleted", bubbleRemoved);
            } else {
                that._logger.log("warn", LOG_ID + "(_onOwnAffiliationChanged) deleted bubble not found in cache, so raised the deleted event with only the id of this bubble : ", affiliation.bubbleId);
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
     *      Method called when custom data have changed for a bubble <br/>
     */
    _onCustomDataChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {

            that._logger.log("internal", LOG_ID + "(_onCustomDataChanged) Custom data changed for bubble : ", bubbleUpdated.name + " | " + data.customData);

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
        });
    }

    /**
     * @private
     * @method _onTopicChanged
     * @instance
     * @param {Object} data contains information about bubble new topic received
     * @description
     *      Method called when the topic has changed for a bubble <br/>
     */
    _onTopicChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log("internal", LOG_ID + "(_onTopicChanged) Topic changed for bubble : ", bubbleUpdated.name + " | " + data.topic);

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
        });
    }

    /**
     * @private
     * @method _onPrivilegeBubbleChanged
     * @instance
     * @param {Object} bubbleInfo modified bubble info
     * @description
     *     Method called when the owner of a bubble changed. <br/>
     */
    async _onPrivilegeBubbleChanged(bubbleInfo) {
        /*
        let that = this;
        let ownerContact = await that.getContactById(bubbleInfo.creator, false);
         */
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onPrivilegeBubbleChanged) privilege changed for bubbleInfo : ", bubbleInfo);

        this._rest.getBubble(bubbleInfo.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log("internal", LOG_ID + "(_onPrivilegeBubbleChanged) privilege changed for bubble : ", bubbleUpdated.name);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
            that._eventEmitter.emit("evt_internal_bubbleprivilegechanged", {bubble, "privilege": bubbleInfo.privilege});
        });
    }


    /**
     * @private
     * @method _onNameChanged
     * @instance
     * @param {Object} data contains information about bubble new name received
     * @description
     *      Method called when the name has changed for a bubble <br/>
     */
    _onNameChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated: any) => {
            that._logger.log("internal", LOG_ID + "(_onNameChanged) Name changed for bubble : ", bubbleUpdated.name + " | " + data.name);

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
        });
    }

    /**
     * @private
     * @method _onbubblepresencechanged
     * @instance
     * @param {Object} bubbleInfo contains information about bubble
     * @description
     *      Method called when the name has changed for a bubble <br/>
     */
    async _onbubblepresencechanged(bubbleInfo) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onbubblepresencechanged) bubble presence received for : ", bubbleInfo.jid);
        //that._logger.log("internal", LOG_ID + "(_onbubblepresencechanged) bubble presence : ", bubbleInfo );
        // Find the bubble in service list, and else retrieve it from server.
        let bubbleInMemory: Bubble;
        bubbleInMemory = await that.getBubbleByJid(bubbleInfo.jid);
// that._bubbles.find((bubbleIter) => { return bubbleIter.jid === bubbleInfo.jid ; });
        if (bubbleInMemory) {
            that._logger.log("internal", LOG_ID + "(_onbubblepresencechanged) bubble found in memory : ", bubbleInMemory.jid);
            if (bubbleInfo.statusCode === "resumed") {
                if ( that._options._imOptions.autoInitialBubblePresence) {
                    that._presence.sendInitialBubblePresence(bubbleInfo).then(() => {
                        bubbleInMemory.isActive = true;
                        that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
                    });
                } else {
                    that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
                }
            }
            if (bubbleInfo.statusCode === "deactivated") {
                bubbleInMemory.isActive = false;
                that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
            }
        } else {
            that._logger.log("warn", LOG_ID + "(_onbubblepresencechanged) bubble not found !");
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
     *      Method called when receiving an create/update/delete event of the bubbles container <br/>
     */
    async _onBubblesContainerReceived(infos) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) infos : ", infos);

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

                    that._bubbles.forEach((bubble : Bubble) => {
                        if (bubble.id === bubbleId) {
                            bubble.containerId = containerId;
                            bubble.containerName = containerName;
                        }
                    });
                    
                    await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                        that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) container received found bubble.");
                        that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) container received found bubble : ", bubbleUpdated);
                        bubblesAdded.push(bubbleUpdated);
                    }).catch((err) => {
                        that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", err : ", err);
                    });
                }
            } else {
                let bubbleId = bubblesIdAdded;

                that._bubbles.forEach((bubble : Bubble) => {
                    if (bubble.id === bubbleId) {
                        bubble.containerId = containerId;
                        bubble.containerName = containerName;
                    }
                });

                await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                    that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) container received found bubble to add.");
                    that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) container received found bubble to add : ", bubbleUpdated);
                    bubblesAdded.push(bubbleUpdated);
                }).catch((err) => {
                    that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", err : ", err);
                });
            }
        }

        if (bubblesIdRemoved) {
            if (Array.isArray(bubblesIdRemoved)) {
                for (let i = 0; i < bubblesIdRemoved.length; i++) {
                    let bubbleId = bubblesIdRemoved[i];

                    that._bubbles.forEach((bubble : Bubble) => {
                        if (bubble.id === bubbleId) {
                            bubble.containerId = undefined;
                            bubble.containerName = undefined;
                        }
                    });
                    
                    await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                        that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) container received found bubble to remove.");
                        that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) container received found bubble to remove : ", bubbleUpdated);
                        bubblesAdded.push(bubbleUpdated);
                    }).catch((err) => {
                        that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", err : ", err);
                    });
                }
            } else {
                let bubbleId = bubblesIdRemoved;
                that._bubbles.forEach((bubble : Bubble) => {
                    if (bubble.id === bubbleId) {
                        bubble.containerId = undefined;
                        bubble.containerName = undefined;
                    }
                });

                await that.getBubbleById(bubbleId).then(async (bubbleUpdated: any) => {
                    that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) container received found bubble.");
                    that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) container received found bubble : ", bubbleUpdated);
                    bubblesRemoved.push(bubbleUpdated);
                }).catch((err) => {
                    that._logger.log("internal", LOG_ID + "(_onBubblesContainerReceived) get bubble failed for infos : ", infos, ", : ", err);
                });
            }
        }
        
        let eventInfo =  {containerName, containerId, containerDescription, bubblesAdded, bubblesRemoved};

        switch (action) {
            case "create": {
                that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) create action.");
                that._eventEmitter.emit("evt_internal_bubblescontainercreated", eventInfo);
            }
                break;
            case "update": {
                that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) update action.");
                that._eventEmitter.emit("evt_internal_bubblescontainerupdated", eventInfo);
            }
                break;
            case "delete": {
                that._bubbles.forEach((bubble : Bubble) => {
                    if (bubble.containerId === containerId) {
                        bubble.containerId = undefined;
                        bubble.containerName = undefined;
                    }
                });
                that._logger.log("debug", LOG_ID + "(_onBubblesContainerReceived) delete action.");
                that._eventEmitter.emit("evt_internal_bubblescontainerdeleted", eventInfo);
            }
                break;
            default: {
                that._logger.log("warn", LOG_ID + "(_onBubblesContainerReceived) unknown action : ", action);
            }
                break;
        }

    }

//region PUBLIC URL

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
    async getInfoForPublicUrlFromOpenInvite(openInvite) {
        let that = this;
        let publicUrlObject: any = {
            "publicUrl": that.getPublicURLFromResponseContent(openInvite)
        };
        if (openInvite.roomId) {
            publicUrlObject.bubble = await that.getBubbleById(openInvite.roomId);
        } else {
            publicUrlObject.bubbleType = openInvite.roomType;
        }
        if (openInvite.userId) {
            publicUrlObject.contact = await that._contacts.getContactById(openInvite.userId);
        }
        return publicUrlObject;
    }

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
    async getAllPublicUrlOfBubbles(): Promise<any> {
        let that = this;
        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser();
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push( this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);
    }

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
    async getAllPublicUrlOfBubblesOfAUser(contact : Contact = new Contact()): Promise<any> {
        let that = this;
        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser(contact.id);
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push( this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);
    }

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
    async getAllPublicUrlOfABubble(bubble): Promise<any> {
        let that = this;
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(getAllOpenInviteIdOfABubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(getAllOpenInviteIdOfABubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser(undefined, undefined, bubble.id);
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push( this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);

    }

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
    async getAllPublicUrlOfABubbleOfAUser(contact : Contact, bubble : Bubble): Promise<any> {
        let that = this;
        if (!contact) {
            this._logger.log("warn", LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'contact' parameter.");
            this._logger.log("internalerror", LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(getAllOpenInviteIdOfABubbleOfAUser) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        let allOpenInviteObj = await that._rest.getAllOpenInviteIdPerRoomOfAUser(contact.id, undefined, bubble.id);
        let allPublicUrl = [];
        for (let openInvite of allOpenInviteObj) {
            allPublicUrl.push( this.getInfoForPublicUrlFromOpenInvite(openInvite));
        }
        return Promise.all(allPublicUrl);
    }

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
    async createPublicUrl(bubble: Bubble): Promise<any> {
        let that = this;
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(createPublicUrl) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(createPublicUrl) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        this._logger.log("internal", LOG_ID + "(createPublicUrl) bubble parameter : ", bubble);

        let bubbleId: string = bubble.id;
        return that.getPublicURLFromResponseContent(await that._rest.createPublicUrl(bubbleId));
        /*
        if (!application.IsCapabilityAvailable(Contact.Capability.BubbleCreate))
        {
            callback?.Invoke(new SdkResult<String>("Current user has not the capability [BubbleCreate]", false));
            return;
        }

        // CF. https://api.openrainbow.org/enduser/#api-users_rooms_public_link-unbindOpenInviteIdWithRoomId

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("enduser", $"users/{currentContactId}/public-links/bind");

        String body = String.Format(@"{{""roomId"":""{0}""}}", personalConferenceBubbleId);

        RestRequest restRequest = rest.GetRestRequest(resource, Method.POST);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync(restRequest, (response) =>
        {
            //Do we have a correct answer
            if (response.IsSuccessful)
            {
                log.DebugFormat("[CreatePublicUrl] - response.Content:\r\n{0}", response.Content);

                String url = GetPublicURLFromResponseContent(response.Content);

                if (String.IsNullOrEmpty(url))
                    callback?.Invoke(new SdkResult<String>("Cannot get Open Invite ID value", false));
                else
                    callback?.Invoke(new SdkResult<String>(url, true));
            }
            else
                callback?.Invoke(new SdkResult<String>(Sdk.ErrorFromResponse(response)));
        });
        // */
    }

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
    async generateNewPublicUrl(bubble: Bubble): Promise<any> {
        let that = this;
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(generateNewPublicUrl) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(generateNewPublicUrl) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        let bubbleId: string = bubble.id;
        return that.getPublicURLFromResponseContent(await that._rest.generateNewPublicUrl(bubbleId));
        /*
        if (!application.IsCapabilityAvailable(Contact.Capability.BubbleCreate))
    {
        callback?.Invoke(new SdkResult<String>("Current user has not the capability [BubbleCreate]", false));
        return;
    }

    // CF. https://api.openrainbow.org/enduser/#api-users_rooms_public_link-resetOpenInviteIdOfRoomId

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("enduser", $"users/{currentContactId}/public-links/reset");

    String body = String.Format(@"{{""roomId"":""{0}""}}", personalConferenceBubbleId);

    RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
    restRequest.AddParameter("body", body, ParameterType.RequestBody);

    restClient.ExecuteAsync(restRequest, (response) =>
    {
        //Do we have a correct answer
        if (response.IsSuccessful)
        {
            log.DebugFormat("[GenerateNewPublicUrl] - response.Content:\r\n{0}", response.Content);

            String url = GetPublicURLFromResponseContent(response.Content);

            if (String.IsNullOrEmpty(url))
                callback?.Invoke(new SdkResult<String>("Cannot get Open Invite ID value", false));
            else
                callback?.Invoke(new SdkResult<String>(url, true));
        }
        else
            callback?.Invoke(new SdkResult<String>(Sdk.ErrorFromResponse(response)));
    });
    // */
    }

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
    removePublicUrl(bubble: Bubble): Promise<any> {
        let that = this;
        let bubbleId = bubble.id;
        return that._rest.removePublicUrl(bubbleId);
        /*
            if (!application.IsCapabilityAvailable(Contact.Capability.BubbleCreate))
            {
                callback?.Invoke(new SdkResult<Boolean>("Current user has not the capability [BubbleCreate]"));
                return;
            }

            // CF. https://api.openrainbow.org/enduser/#api-users_rooms_public_link-unbindOpenInviteIdWithRoomId

            RestClient restClient = rest.GetClient();
            string resource = rest.GetResource("enduser", $"users/{currentContactId}/public-links/unbind");

            String body = String.Format(@"{{""roomId"":""{0}""}}", personalConferenceBubbleId);

            RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
            restRequest.AddParameter("body", body, ParameterType.RequestBody);

            restClient.ExecuteAsync(restRequest, (response) =>
            {
                //Do we have a correct answer
                if (response.IsSuccessful)
                {
                    callback?.Invoke(new SdkResult<Boolean>(true));
                }
                else
                    callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
            });
            // */
    }

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
    setBubbleAutoRegister(bubble : Bubble, autoRegister : string = "unlock") : Promise<Bubble> {
        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleAutoRegister) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(setBubbleAutoRegister) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleAutoRegister(bubble.id, autoRegister).then(async (bubbleData) => {
                that._logger.log("info", LOG_ID + "(setBubbleAutoRegister) autoRegister set ");
                that._logger.log("internal", LOG_ID + "(setBubbleAutoRegister) autoRegister set : ", bubbleData);
                let bubbleObj: Bubble = await Bubble.BubbleFactory(that.avatarDomain, that._contacts)(bubbleData);
                resolve(bubbleObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleAutoRegister) error");
                that._logger.log("internalerror", LOG_ID + "(setBubbleAutoRegister) error : ", err);
                return reject(err);
            });
        });
    }
    
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
    getPublicURLFromResponseContent(content: any): string {
        let that = this;
        let url: string = null;
        let openInviteId = content.openInviteId;

        if (openInviteId) {
            let strPort: string;
            if (((that._protocol == "https") && (that._port === "443")) || ((that._protocol == "http") && (that._port === "80")))
                strPort = "";
            else
                strPort = ":" + that._port;

            url = that._protocol + "://meet." + that._host + strPort + "/" + openInviteId;
        }
        return url;
    }

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
    registerGuestForAPublicURL (publicUrl: string, loginEmail : string, password: string, firstName: string, lastName: string, nickName: string, title: string, jobTitle: string, department: string) {
        let that = this;
        if (!publicUrl) {
            that._logger.log("warn", LOG_ID + "(registerGuestForAPublicURL) bad or empty 'publicUrl' parameter ");
            that._logger.log("internalerror", LOG_ID + "(registerGuestForAPublicURL) bad or empty 'publicUrl' parameter : ", publicUrl);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!loginEmail) {
            this._logger.log("warn", LOG_ID + "(registerGuestForAPublicURL) bad or empty 'loginEmail' parameter ");
            this._logger.log("internalerror", LOG_ID + "(registerGuestForAPublicURL) bad or empty 'loginEmail' parameter : ", loginEmail);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!password) {
            this._logger.log("warn", LOG_ID + "(registerGuestForAPublicURL) bad or empty 'password' parameter ");
            this._logger.log("internalerror", LOG_ID + "(registerGuestForAPublicURL) bad or empty 'password' parameter : ", password);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        return new Promise(async function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(registerGuestForAPublicURL) decode openInviteId.");
            let openInviteId = publicUrl.split("/").pop();
            that._logger.log("internal", LOG_ID + "(registerGuestForAPublicURL) openInviteId found : ", openInviteId);
            let guestParam = new GuestParams(loginEmail,password,null, null, null, null, openInviteId,null, firstName, lastName, nickName, title, jobTitle, department);
            that._rest.registerGuest(guestParam ).then(function (joinResult: any) {
                resolve(joinResult);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(registerGuestForAPublicURL) error");
                return reject(err);
            });
        });
    }

//endregion PUBLIC URL

//region CONFERENCE SPECIFIC

    // @private for ale rainbow team's tests only
    joinConference(bubble) {
        let that = this;

        return new Promise(async function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(joinConference) arguments : ", ...arguments);

            if (!bubble || !bubble.id) {
                that._logger.log("warn", LOG_ID + "(joinConference) bad or empty 'bubble' parameter.");
                that._logger.log("internalerror", LOG_ID + "(joinConference) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            /*let isActive = false;
            let isInvited = false;
            bubble.users.forEach(function(user) {
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
            });
getAllActiveBubbles
            if (isActive || isInvited) {
                that._logger.log("warn", LOG_ID + "(joinConference) Contact has been already invited or is already a member of the bubble");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } // */

            if (!bubble || !bubble.confEndpoints) {
                that._logger.log("warn", LOG_ID + "(joinConference) bad or empty 'bubble.confEndpoints' parameter.");
                that._logger.log("internalerror", LOG_ID + "(joinConference) bad or empty 'bubble.confEndpoints' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let mediaType = bubble.mediaType;
            if (!that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().WEBRTC_CONFERENCE_ALLOWED) && mediaType !== MEDIATYPE.WEBRTCSHARINGONLY) {
                that._logger.log("warn", LOG_ID + "(BubblesService) retrieveWebConferences - user is not allowed");
                reject(new Error("notAllowed"));
                return;
            }

            let endpoint = await that._rest.retrieveWebConferences(mediaType);
            let confEndPoints: Array<any>;
            confEndPoints = endpoint;
            let confEndPointId = null;
            if (confEndPoints.length === 1 && confEndPoints[0].mediaType === MEDIATYPE.WEBRTC) {
                confEndPointId = confEndPoints[0].id;
            }

            that._rest.joinConference(confEndPointId, "moderator").then(function (joinResult: any) {
                resolve(joinResult);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(joinConference) error");
                return reject(err);
            });
        });
    }

    /// <summary>
    /// To get a bubble from the cache using a conference Id
    /// </summary>
    /// <param name="conferenceId"><see cref="String"/>ID of the conference</param>
    /// <returns><see cref="Bubble"> - A bubble object or NULL if not found</see></returns>
    getBubbleByConferenceIdFromCache(conferenceId: string): Bubble {
        let result: Bubble = null;
        let that = this;
        if (that._linkConferenceAndBubble.containsKey(conferenceId)) {
            let bubbleId = that._linkConferenceAndBubble.tryGetValue(conferenceId);
            result = that.getBubbleFromCache(bubbleId);
        }
        return result;
    }

/// <summary>
/// To get ID of the bubble from the cache using a conference Id
/// </summary>
/// <param name="conferenceId"><see cref="String"/>ID of the conference</param>
/// <returns><see cref="Bubble"> - A bubble object or NULL if not found</see></returns>
    getBubbleIdByConferenceIdFromCache(conferenceId: string): string {
        let result: string = null;
        let that = this;
        if (that._linkConferenceAndBubble.containsKey(conferenceId)) {
            that._logger.log("internal", LOG_ID + "(getBubbleIdByConferenceIdFromCache) FOUND conferenceId : ", conferenceId, " in that._linkConferenceAndBubble.");
            result = that._linkConferenceAndBubble.tryGetValue(conferenceId);
        }
        that._logger.log("internal", LOG_ID + "(getBubbleIdByConferenceIdFromCache) conferenceId : ", conferenceId, " bubble : ", result, " from that._linkConferenceAndBubble : ", that._linkConferenceAndBubble);
        return result;
    }

/// <summary>
/// To know if the current user has the permission to start its own WebRTC Conference
/// </summary>
/// <returns><see cref="Boolean"/> - True if it's allowed, false if it's not the case</returns>
    conferenceAllowed(): boolean {
        let that = this;
        return that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().WEBRTC_CONFERENCE_ALLOWED) //that._profileService.get.IsFeatureEnabled(Feature.WEBRTC_CONFERENCE_ALLOWED);
    }

/// <summary>
/// To get a conference from the cache using a conference Id
/// </summary>
/// <param name="conferenceId"><see cref="String"/>ID of the conference to get</param>
/// <returns><see cref="Conference"> - A conference object or NULL if not found</see></returns>
    conferenceGetByIdFromCache(conferenceId: string): ConferenceSession // Conference
    {
        let result: any = null; // Conference
        let that = this;
        //lock (lockConferenceDictionary)
        //{
        if (that._conferencesSessionById.containsKey(conferenceId))
            result = that._conferencesSessionById[conferenceId];
        //}
        return result;
    }

/// <summary>
/// To get conferences list in progress from the cache
/// </summary>
/// <returns><see cref="T:List{Conference}"/> - The list of <see cref="Conference"/> in progress.</returns>
    conferenceGetListFromCache(): List<ConferenceSession> // List<Conference>
    {
        let that = this;
        let result: List<ConferenceSession> = new List();
        that._conferencesSessionById.forEach((item) => {
            result.add(item.value);
        });
        return result;
    }

    /**
     * @Method retrieveConferences
     * @public
     * @param {string} mediaType [optional] mediaType of conference(s) to retrive.
     * @param {boolean} scheduled [optional] whether it is a scheduled conference or not
     * @param {boolean} provisioning [optional] whether it is a conference that is in provisioning state or not
     * @returns {Promise<any>} a promise that resolves when conference are retrieved. Note: If no parameter is specified, then all mediaTypes are retrieved
     * @memberof ConferenceService
     */
    public retrieveConferences(mediaType?: string, scheduled?: boolean, provisioning?: boolean): Promise<any> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(retrieveConferences)  with mediaType=" + mediaType + " and scheduled=" + scheduled);

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

            if (/*!this.pstnConferenceService.isPstnConferenceAvailable && */ !(that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().WEBRTC_CONFERENCE_ALLOWED))) {
                that._logger.log("internal", LOG_ID + "(retrieveConferences)  - user is not allowed");
                reject(new Error("notAllowed"));
                return;
            }

            /*let urlParameters = "conferences?format=full&userId=" + this.contactService.userContact.dbId;
            if (angular.isDefined(scheduled)) {
                urlParameters += "&scheduled=" + scheduled;
            } // */

            that._rest.retrieveAllConferences(scheduled).then((result: Iterable<any>) => {
                for (let conferenceData of result) {
                    switch (conferenceData.mediaType) {
                        case MEDIATYPE.PstnAudio:
                            //this.pstnConferenceService.updateOrCreatePstnConferenceEndpoint(conferenceData);
                            break;
                        case MEDIATYPE.WEBRTC:
                        case MEDIATYPE.WEBRTCSHARINGONLY:
                            that.updateOrCreateWebConferenceEndpoint(conferenceData);
                            break;
                        default:
                            break;
                    }
                }
                resolve(result);
            }).catch(()=>{
                resolve(undefined);
            });
            /*
            this.$http({
                method: "GET",
                url: this.confProvPortalURL + urlParameters,
                headers: this.authService.getRequestHeader()
            })
                // Handle success response
                .then((response: ng.IHttpPromiseCallbackArg<any>) => {
                        let conferencesProvisionData = response.data.data;
                        for (let conferenceData of conferencesProvisionData) {
                            switch (conferenceData.mediaType) {
                                case this.MEDIATYPE.PSTNAUDIO:
                                    this.pstnConferenceService.updateOrCreatePstnConferenceEndpoint(conferenceData);
                                    break;
                                case this.MEDIATYPE.WEBRTC:
                                case this.MEDIATYPE.WEBRTCSHARINGONLY:
                                    this.BubblesService.updateOrCreateWebConferenceEndpoint(conferenceData);
                                    break;
                                default:
                                    break;
                            }
                        }
                        this.$log.info("[ConferenceService] retrieveConferences successfully");
                        resolve(conferencesProvisionData);
                    },
                    (response: ng.IHttpPromiseCallbackArg<any>) => {
                        let msg = response.data ? response.data.errorDetails : response.data;
                        let errorMessage = "retrieveConferences failure: " + msg;
                        this.$log.error("[ConferenceService] " + errorMessage);
                        reject(new Error(errorMessage));
                    });
                    // */
        });
    };

    /**
     * @Method updateOrCreateWebConferenceEndpoint
     * @public
     * @param {any} conferenceData [required] conference data for the update / creation
     * @returns {any} the updated conferenceEndpoint or null on error
     * @memberof BubblesService
     */
    public updateOrCreateWebConferenceEndpoint(conferenceData: any): any {
        let that = this;
        that._logger.log("internal", LOG_ID + "(updateOrCreateWebConferenceEndpoint for " + conferenceData.id);

        if (!conferenceData) {
            that._logger.log("internalerror", LOG_ID + "(updateOrCreateWebConferenceEndpoint) - no conference data !");
            return null;
        }

        if (conferenceData.mediaType !== MEDIATYPE.WEBRTC && conferenceData.mediaType !== MEDIATYPE.WEBRTCSHARINGONLY) {
            that._logger.log("internalerror", LOG_ID + "(updateOrCreateWebConferenceEndpoint) - wrong mediaType:" + conferenceData.mediaType);
            return null;
        }

        let conference: Conference = Conference.createFromData(conferenceData);
        that._conferenceEndpoints[conferenceData.id] = conference;
        if (conference.mediaType === MEDIATYPE.WEBRTC) {
            that.updateWebConferenceInfos([conference]);
        } else {
            //this.updateWebSharingOnlyConferenceInfos([conference]);
        }
        return this._conferenceEndpoints[conferenceData.id];
    }

    public updateWebConferenceInfos(endpoints: any[]): void {
        let that = this;
        that._logger.log("debug", LOG_ID + "(updateWebConferenceInfos)");
        // Get webConference info

        Object.assign(this._conferenceEndpoints, endpoints);

        that._webrtcConferenceId = that.getWebRtcConfEndpointId();
        if (that._webrtcConferenceId) {
            this._rest.getRoomByConferenceEndpointId(that._webrtcConferenceId).then(async (roomData: any) => {
                let conferenceRoom: any;
                if (roomData.length) {
                    conferenceRoom = await that.getBubbleById(roomData[0].id);
                    if (conferenceRoom) {

                    } else {
                        //service.createRoomFromData(roomData[0]);
                        conferenceRoom = await that.addOrUpdateBubbleToCache(roomData[0]);
                        // conferenceRoom = that.getBubbleById(roomData[0].id);
                    }
                } else {
                    that._logger.log("debug", LOG_ID + "(getRoomFromConferenceEndpointId) -- no room with confId ", that._webrtcConferenceId);
                    conferenceRoom = null;
                }
                let name = "nothing";
                if (conferenceRoom) {
                    name = conferenceRoom.name;
                }

                that._webConferenceRoom = conferenceRoom;
                that._logger.log("debug", LOG_ID + "(updateWebConferenceInfos) : webrtcConferenceId is currently attached to ", name);

            }).catch(
                () => {
                    that._logger.log("debug", LOG_ID + "(updateWebConferenceInfos) FAILURE ===");
                }
            );
        }
    }


    /**
     * @Method getWebRtcConfEndpointId
     * @public
     * @returns {string} the user unique webrtc conference enpoint id
     * @memberof BubblesService
     */
    public getWebRtcConfEndpointId(): string {
        for (let property in this._conferenceEndpoints) {
            if (this._conferenceEndpoints.hasOwnProperty(property) && this._conferenceEndpoints[property].mediaType === MEDIATYPE.WEBRTC) {
                return this._conferenceEndpoints[property].id;
            }
        }

        return null;
    }

    /**
     * @Method getWebRtcSharingOnlyConfEndpointId
     * @public
     * @returns {string} the user unique webrtcSharingOnly  conference enpoint id
     * @memberof BubblesService
     */
    public getWebRtcSharingOnlyConfEndpointId(): string {
        for (let property in this._conferenceEndpoints) {
            if (this._conferenceEndpoints.hasOwnProperty(property) && this._conferenceEndpoints[property].mediaType === MEDIATYPE.WEBRTCSHARINGONLY) {
                return this._conferenceEndpoints[property].id;
            }
        }

        return null;
    }

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
    async conferenceStart(bubble, conferenceId: string): Promise<any> {
        let that = this;
       /* let bubbleId = null;
        if (bubble) {
            bubbleId = bubble.id;
        }*/
        // Cf. https://api.openrainbow.org/conference/#api-conference-Start_conference

        let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;
        if (!conferenceId) {
            return that._rest.conferenceStart(bubble.id, that.getWebRtcConfEndpointId(), MEDIATYPE.WEBRTC);
        } else {
            return that._rest.conferenceStart(bubble.id, conferenceId, mediaType);
        }

        /*
            RestClient restClient = rest.GetClient();
            string resource = rest.GetResource("conference", $"conferences/{conferenceId}/start");

            String body = String.Format(@"{{""mediaType"":""{0}""}}", mediaType);

            RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
            restRequest.AddParameter("body", body, ParameterType.RequestBody);

            restClient.ExecuteAsync(restRequest, (response) =>
            {
                //Do we have a correct answer
                if (response.IsSuccessful)
                {
                    //log.DebugFormat("[ConferenceStart] - response.Content:\r\n{0}", response.Content);
                    callback?.Invoke(new SdkResult<Boolean>(true));
                }
                else
                    callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
            });

         // */
    }

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
    async conferenceStop(conferenceId: string) //, Action<SdkResult<Boolean>> callback = null)
    {
        let that = this;
        // Cf. https://api.openrainbow.org/conference/#api-conference-Stop_conference

        let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;
        let roomId = null;
        if (mediaType === MEDIATYPE.WEBRTC) {
            roomId = that.getBubbleIdByConferenceIdFromCache(conferenceId);
        }
        return that._rest.conferenceStop(conferenceId, mediaType, roomId);

        /*
        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("conference", $"conferences/{conferenceId}/stop");

        String body;

        if (mediaType == Bubble.MediaType.Webrtc)
        {
            String roomId = GetBubbleIdByConferenceIdFromCache(conferenceId);
            body = String.Format(@"{{""mediaType"":""{0}"", ""roomId"":""{0}""}}", mediaType, roomId);
        }
        else
            body = String.Format(@"{{""mediaType"":""{0}""}}", mediaType);

        RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync(restRequest, (response) =>
        {
            //Do we have a correct answer
            if (response.IsSuccessful)
            {
                //log.DebugFormat("[ConferenceStop] - response.Content:\r\n{0}", response.Content);
                callback?.Invoke(new SdkResult<Boolean>(true));
            }
            else
                callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
        });
        // */
    }

/// <summary>
/// To join a conference.
///
/// NOTE: The conference must be first started before to join it.
/// </summary>
/// <param name="conferenceId"><see cref="String"/> ID of the conference</param>
/// <param name="asModerator"><see cref="Boolean"/>To join conference as operator or not</param>
/// <param name="muted"><see cref="Boolean"/>To join conference as muted or not</param>
/// <param name="phoneNumber"><see cref="String"/>The phone number used to join the conference - it can be null or empty</param>
/// <param name="country"><see cref="String"/>Country of the phone number used (ISO 3166-1 alpha3 format) - if not specified used the country of the current user</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async conferenceJoin(conferenceId: string, asModerator: boolean, muted: boolean, phoneNumber: string, country: string)//, Action<SdkResult<Boolean>> callback = null)
    {
        let that = this;
        /*
        if (!application.IsCapabilityAvailable(Contact.Capability.BubbleParticipate))
        {
            callback?.Invoke(new SdkResult<Boolean>("Current user has not the capability [BubbleParticipate]"));
            return;
        }
        // */

        // Cf. https://api.openrainbow.org/conference/#api-conference-Join_conference

        let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;
/*        let roomId = null;
        if (mediaType === MEDIATYPE.WEBRTC) {
            roomId = that.getBubbleIdByConferenceIdFromCache(conferenceId);
        }*/
        return that._rest.conferenceJoin(conferenceId, mediaType, asModerator, muted, phoneNumber, country);

        /*
        String mediaType = (conferenceId == personalConferenceConfEndpointId) ? Bubble.MediaType.PstnAudio : Bubble.MediaType.Webrtc;

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("conference", $"conferences/{conferenceId}/join");


        String phoneNumberToUse = phoneNumber;
        if (String.IsNullOrEmpty(phoneNumberToUse))
            phoneNumberToUse = "joinWithoutAudio";

        String body = String.Format(@"{{""participantPhoneNumber"": ""{0}"", ""participant"": {{""role"": ""{1}"", ""type"": ""{2}""}}, ""mediaType"": ""{3}""{4}}}",
        phoneNumberToUse, asModerator ? "moderator" : "member", muted ? "muted" : "unmuted",
        mediaType,
        String.IsNullOrEmpty(country) ? "" : String.Format(@", ""country"": ""{0}""", country));

        log.DebugFormat("[PersonalConferenceJoin] - body:[{0}]", body);

        RestRequest restRequest = rest.GetRestRequest(resource, Method.POST);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync(restRequest, (response) =>
        {
            //Do we have a correct answer
            if (response.IsSuccessful)
            {
                //log.DebugFormat("[PersonalConferenceJoin] - response.Content:\r\n{0}", response.Content);
                callback?.Invoke(new SdkResult<Boolean>(true));
            }
            else
                callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
        });
        // */
    }

/// <summary>
/// Mute or Unmute the conference - If muted only the moderator can speak
///
/// Only the moderator of the conference can use this method
/// </summary>
/// <param name="conferenceId"><see cref="String"/> ID of the conference</param>
/// <param name="mute"><see cref="Boolean"/> True to mute, False to unmute</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    conferenceMuteOrUnmute(conferenceId: string, mute: boolean)//, Action<SdkResult<Boolean>> callback = null)
    {
        let that = this;
        return that.conferenceModeratorAction(conferenceId, mute ? "mute" : "unmute");
    }

/// <summary>
/// Mute or Unmute the specified participant in the conference
///
/// Only the moderator of the conference can use this method
/// </summary>
/// <param name="conferenceId"><see cref="String"/> ID of the conference</param>
/// <param name="participantId"><see cref="String"/> ID of the participant to mute/unmute</param>
/// <param name="mute"><see cref="Boolean"/> True to mute, False to unmute</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    conferenceMuteOrUnmutParticipant(conferenceId: string, participantId: string, mute: boolean) {
        let that = this;
        return that.conferenceModeratorActionOnParticipant(conferenceId, participantId, mute ? "mute" : "unmute");
    }

/// <summary>
/// Drop the specified participant in the conference
///
/// Only the moderator of the conference can use this method
/// </summary>
/// <param name="conferenceId"><see cref="String"/> ID of the conference</param>
/// <param name="participantId"><see cref="String"/> ID of the participant to drop</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async conferenceDropParticipant(conferenceId: string, participantId: string) {
        let that = this;
        /*
        if(!application.IsCapabilityAvailable(Contact.Capability.BubbleParticipate))
        {
            callback?.Invoke(new SdkResult<Boolean>("Current user has not the capability [BubbleParticipate]"));
            return;
        }
        // */

        // Cf. https://api.openrainbow.org/conference/#api-conference-Drop_participant
        let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;
        return that._rest.conferenceDropParticipant(conferenceId, mediaType, participantId);
        /*
        String mediaType = (conferenceId == personalConferenceConfEndpointId) ? Bubble.MediaType.PstnAudio : Bubble.MediaType.Webrtc;

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("conference", $"conferences/{conferenceId}/participants/{participantId}");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.DELETE);
        restRequest.AddQueryParameter("mediaType", mediaType);

        restClient.ExecuteAsync(restRequest, (response) =>
        {
            //Do we have a correct answer
            if (response.IsSuccessful)
            {
                //log.DebugFormat("[PersonalConferenceDropParticipant] - response.Content:\r\n{0}", response.Content);
                callback?.Invoke(new SdkResult<Boolean>(true));
            }
            else
                callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
        });
        // */
    }

//endregion CONFERENCE SPECIFIC

//region PERSONAL CONFERENCE SPECIFIC

/// <summary>
/// To know if the current user has the permission to start its own Personal Conference
/// </summary>
/// <returns><see cref="Boolean"/> - True if it's allowed, false if it's not the case</returns>
    personalConferenceAllowed(): boolean {
        let that = this;
        return that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().PERSONAL_CONFERENCE_ALLOWED);

        //return application.IsFeatureEnabled(Feature.PERSONAL_CONFERENCE_ALLOWED);
    }

/// <summary>
/// To get teh Id of the Personal Conference
/// </summary>
/// <returns><see cref="String"/> - Id of the Personal Conference or NULL</returns>
    personalConferenceGetId(): string {
        let that = this;
        return that._personalConferenceConfEndpointId;
    }

/// <summary>
/// To get the bubble which contains the Personal Meeting of the end-user (if he has the permission)
/// </summary>
/// <returns><see cref="Bubble"/> - The Bubble which contains the Personal Meeting or null</returns>
    async personalConferenceGetBubbleFromCache(): Promise<Bubble> {
        let that = this;
//    if (!String.IsNullOrEmpty(personalConferenceBubbleId))
        //      return GetBubbleByIdFromCache(personalConferenceBubbleId);
        if (that._personalConferenceBubbleId != null) {
            return await that.getBubbleById(that._personalConferenceBubbleId);
        }
        return null;
    }

/// <summary>
/// To get the ID of the bubble which contains the Personal Meeting of the end-user (if he has the permission)
/// </summary>
/// <returns><see cref="Bubble"/> - The Bubble which contains the Personal Meeting or null</returns>
    personalConferenceGetBubbleIdFromCache(): string {
        // if (!String.IsNullOrEmpty(personalConferenceBubbleId))
        //   return personalConferenceBubbleId;
        let that = this;
//    if (!String.IsNullOrEmpty(personalConferenceBubbleId))
        //      return GetBubbleByIdFromCache(personalConferenceBubbleId);
        if (that._personalConferenceBubbleId != null) {
            return that._personalConferenceBubbleId;
        }
        return null;
    }

/// <summary>
/// To get the list of phone numbers used to reach the Personal Meeting
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{PersonalConferenceAudioPhoneNumbers}}"/>Callback fired when the operation is done - <see cref="personalConferencePhoneNumbers"/> is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceGetPhoneNumbers(): Promise<any> {
        let that = this;
        /*
        if(!application.IsCapabilityAvailable(Contact.Capability.BubbleParticipate))
        {
            callback?.Invoke(new SdkResult<Boolean>("Current user has not the capability [BubbleParticipate]"));
            return;
        }
        // */

        // Cf. https://api.openrainbow.org/conference/#api-conference-Drop_participant
        //let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;
        return that._rest.personalConferenceGetPhoneNumbers();
        /*
        if (!application.IsCapabilityAvailable(Contact.Capability.BubbleParticipate))
        {
            callback?.Invoke(new SdkResult<PersonalConferencePhoneNumbers>("Current user has not the capability [BubbleParticipate]"));
            return;
        }

        if (personalConferencePhoneNumbers != null)
        {
            callback?.Invoke(new SdkResult<PersonalConferencePhoneNumbers>(personalConferencePhoneNumbers));
            return;
        }

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("confprovisioning", "conferences/audio/phonenumbers");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);
        restRequest.AddQueryParameter("shortList", "true");

        restClient.ExecuteAsync<PersonalConferencePhoneNumbersData>(restRequest, (response) =>
        {
            //Do we have a correct answer
            if (response.IsSuccessful)
            {
                //log.DebugFormat("[GetPersonalConferencePhoneNumbers] - response.Content:\r\n{0}", response.Content);

                PersonalConferencePhoneNumbersData personalConferenceAudioPhoneNumbersData = response.Data;
                personalConferencePhoneNumbers = new PersonalConferencePhoneNumbers();
                personalConferencePhoneNumbers.NearEndUser = personalConferenceAudioPhoneNumbersData.Data.ShortList;
                personalConferencePhoneNumbers.Others = personalConferenceAudioPhoneNumbersData.Data.PhoneNumberList;

                callback?.Invoke(new SdkResult<PersonalConferencePhoneNumbers>(personalConferencePhoneNumbers));
            }
            else
                callback?.Invoke(new SdkResult<PersonalConferencePhoneNumbers>(Sdk.ErrorFromResponse(response)));
        });
        // */
    }

/// <summary>
/// To retrieve the pass codes of the Personal Meeting of the current user
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{MeetingPassCodes}}"/>Callback fired when the operation is done - <see cref="ConferencePassCodes"/> is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceGetPassCodes(): Promise<ConferencePassCodes> {
// Cf. https://api.openrainbow.org/conf-provisioning/#api-conferences-GetConference
        let that = this;
        let result = new ConferencePassCodes();

        let passCodes = await that._rest.personalConferenceGetPassCodes(that._personalConferenceConfEndpointId);
        that._logger.log("debug", LOG_ID + "(personalConferenceGetPassCodes) need to fill the ConferencePassCodes with the server's returned passCodes : ", passCodes);
        return result;
        /*
    if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
    {
        callback?.Invoke(new SdkResult<ConferencePassCodes>("You don't have a Personal Meeting", false));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("confprovisioning", $"conferences/{personalConferenceConfEndpointId}");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);
    restRequest.AddQueryParameter("format", "full");

    restClient.ExecuteAsync(restRequest, (response) =>
    {
        //Do we have a correct answer
        if (response.IsSuccessful)
        {
            //log.DebugFormat("[PersonalConferenceGetPassCodes] - response.Content:\r\n{0}", response.Content);

            var json = JsonConvert.DeserializeObject<dynamic>(response.Content);

            ConferencePassCodes meetingPassCodes = null;

            JObject jObject = json["data"];
            if (jObject != null)
            {
                JArray jArray = (JArray)jObject.GetValue("passCodes");
                if (jArray != null)
                {
                    meetingPassCodes = new ConferencePassCodes();
                    foreach (JObject passCode in jArray)
                    {
                        if (passCode.GetValue("name").ToString() == "ModeratorPassCode")
                            meetingPassCodes.ModeratorPassCode = passCode.GetValue("value").ToString();

                        else if (passCode.GetValue("name").ToString() == "ParticipantPassCode")
                            meetingPassCodes.ParticipantPassCode = passCode.GetValue("value").ToString();
                    }
                }
            }

            if (meetingPassCodes != null)
                callback?.Invoke(new SdkResult<ConferencePassCodes>(meetingPassCodes));
            else
                callback?.Invoke(new SdkResult<ConferencePassCodes>("Cannot get pass codes of the meeting"));

        }
        else
            callback?.Invoke(new SdkResult<ConferencePassCodes>(Sdk.ErrorFromResponse(response)));
    });
    // */
    }

/// <summary>
/// To reset and get new pass codes of the Personal Meeting of the current user
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{MeetingPassCodes}}"/>Callback fired when the operation is done - <see cref="ConferencePassCodes"/> is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceResetPassCodes(): Promise<any> {
// Cf. https://api.openrainbow.org/conf-provisioning/#api-conferences-PutConference
        let that = this;

        return that._rest.personalConferenceResetPassCodes(that._personalConferenceConfEndpointId);
        /*

        if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
        {
        callback?.Invoke(new SdkResult<ConferencePassCodes>("You don't have an Personal Meeting", false));
        return;
        }

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("confprovisioning", $"conferences/{personalConferenceConfEndpointId}");

        String body = String.Format(@"{{""resetPasswords"":true}}");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync(restRequest, (response) =>
        {
        //Do we have a correct answer
        if (response.IsSuccessful)
        {
            //log.DebugFormat("[PersonalConferenceResetPassCodes] - response.Content:\r\n{0}", response.Content);

            var json = JsonConvert.DeserializeObject<dynamic>(response.Content);

            ConferencePassCodes meetingPassCodes = null;

            JObject jObject = json["data"];
            if (jObject != null)
            {
                JArray jArray = (JArray)jObject.GetValue("passCodes");
                if (jArray != null)
                {
                    meetingPassCodes = new ConferencePassCodes();
                    foreach (JObject passCode in jArray)
                    {
                        if (passCode.GetValue("name").ToString() == "ModeratorPassCode")
                            meetingPassCodes.ModeratorPassCode = passCode.GetValue("value").ToString();

                        else if (passCode.GetValue("name").ToString() == "ParticipantPassCode")
                            meetingPassCodes.ParticipantPassCode = passCode.GetValue("value").ToString();
                    }
                }
            }

            if (meetingPassCodes != null)
                callback?.Invoke(new SdkResult<ConferencePassCodes>(meetingPassCodes));
            else
                callback?.Invoke(new SdkResult<ConferencePassCodes>("Cannot get pass codes of the meeting"));

        }
        else
            callback?.Invoke(new SdkResult<ConferencePassCodes>(Sdk.ErrorFromResponse(response)));
        });
        // */
    }

/// <summary>
/// To retrieve the public URL to access the Personal Meeting - So a Guest or a Rainbow user can access to it just using a URL
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{String}}"/>Callback fired when the operation is done - <see cref="String"/> as a valid URL is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceGetPublicUrl(): Promise<any> {
        let that = this;
        return that.createPublicUrl(that._personalConferenceBubbleId);

        /*
        // Cf. https://api.openrainbow.org/enduser/#api-users_rooms_public_link-getOpenInviteIdsOfUser

        if (String.IsNullOrEmpty(personalConferenceBubbleId))
        {
        callback?.Invoke(new SdkResult<String>("You don't have an Personal Meeting", false));
        return;
        }

        CreatePublicUrl(personalConferenceBubbleId, callback);
        // */
    }

/// <summary>
/// Generate a new public URL to access the Personal Meeting (So a Guest or a Rainbow user can access to it just using a URL)
///
/// The previous URL is no more functional !
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{String}}"/>Callback fired when the operation is done - <see cref="String"/> as a valid URL is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceGenerateNewPublicUrl(): Promise<any> {
        let that = this;
        return that.generateNewPublicUrl(that._personalConferenceBubbleId);

// CF. https://api.openrainbow.org/enduser/#api-users_rooms_public_link-resetOpenInviteIdOfRoomId
        /*
        if (String.IsNullOrEmpty(personalConferenceBubbleId))
        {
        callback?.Invoke(new SdkResult<String>("You don't have an Personal Meeting", false));
        return;
        }

        GenerateNewPublicUrl(personalConferenceBubbleId, callback);
        //  */
    }

/// <summary>
/// To start a Personal Conference.
///
/// Only a moderator can start a Personal Conference.
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceStart(): Promise<any> {
        let that = this;
        return that.conferenceStart(null, that._personalConferenceConfEndpointId);

        /*
        if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
        {
        callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
        return;
        }

        ConferenceStart(personalConferenceConfEndpointId, callback);
        // */
    }

/// <summary>
/// To stop the Personal Conference.
///
/// Only a moderator can stop a Personal Conference
/// </summary>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceStop(): Promise<any> {
        let that = this;
        return that.conferenceStop(that._personalConferenceConfEndpointId);

        /*
        if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
        {
        callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
        return;
        }

        ConferenceStop(personalConferenceConfEndpointId, callback);
        // */
    }

/// <summary>
/// To join the Personal Conference.
///
/// NOTE: The Personal Conference must be first started before to join it.
/// </summary>
/// <param name="asModerator"><see cref="Boolean"/>To join Personal Conference as operator or not</param>
/// <param name="muted"><see cref="Boolean"/>To join Personal Conference as muted or not</param>
/// <param name="phoneNumber"><see cref="String"/>The phone number used to join the Personal Conference - it can be null or empty</param>
/// <param name="country"><see cref="String"/>Country of the phone number used (ISO 3166-1 alpha3 format) - if not specified used the country of the current user</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceJoin(asModerator: boolean, muted: boolean, phoneNumber: string, country: string): Promise<any> {
        let that = this;
        return that.conferenceJoin(that._personalConferenceConfEndpointId, asModerator, muted, phoneNumber, country);

        /*
        if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
    {
    callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
    return;
    }

    ConferenceJoin(personalConferenceConfEndpointId, asModerator, muted, phoneNumber, country, callback);
    // */
    }

/// <summary>
/// Mute or Unmute the Personal Conference - If muted only the moderator can speak
///
/// Only the moderator of the Personal Conference can use this method
/// </summary>
/// <param name="mute"><see cref="Boolean"/> True to mute, False to unmute</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceMuteOrUnmute(mute: boolean) {
        let that = this;
        return that.conferenceModeratorAction(that._personalConferenceConfEndpointId, mute ? "mute" : "unmute");

        /*
    if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
    {
    callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
    return;
    }

    ConferenceModeratorAction(personalConferenceConfEndpointId, mute ? "mute" : "unmute", callback);
    // */
    }

/// <summary>
/// Lock or Unlock the Personal Conference - If locked, no more participant can join the Personal Conference
///
/// Lock / Unlock is only possible for PSTN Conference
///
/// Only a moderator can use this method
/// </summary>
/// <param name="toLock"><see cref="Boolean"/> True to lock, False to unlock</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceLockOrUnlock(toLock: boolean) {
        let that = this;
        return that.conferenceModeratorAction(that._personalConferenceConfEndpointId, toLock ? "lock" : "unlock");

        /*

        if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
        {
        callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
        return;
        }

        ConferenceModeratorAction(personalConferenceConfEndpointId, toLock ? "lock" : "unlock", callback);
        // */
    }

/// <summary>
/// Mute or Unmute the specified participant in the Personal Conference
///
/// Only the moderator of the Personal Conference can use this method
/// </summary>
/// <param name="participantId"><see cref="String"/> ID of the participant to mute/unmute</param>
/// <param name="mute"><see cref="Boolean"/> True to mute, False to unmute</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceMuteOrUnmutParticipant(participantId: string, mute: boolean): Promise<any> {
        let that = this;
        return that.conferenceModeratorActionOnParticipant(that._personalConferenceConfEndpointId, participantId, mute ? "mute" : "unmute");

        /*
            if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
        {
        callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
        return;
        }

        ConferenceModeratorActionOnParticipant(personalConferenceConfEndpointId, participantId, mute ? "mute" : "unmute", callback);
        // */
    }

/// <summary>
/// Drop the specified participant in the Personal Conference
///
/// Only the moderator of the Personal Conference can use this method
/// </summary>
/// <param name="participantId"><see cref="String"/> ID of the participant to drop</param>
/// <param name="callback"><see cref="T:Action{SdkResult{Boolean}}"/>Callback fired when the operation is done - True is expected in **Data** member of <see cref="SdkResult{T}"/> if no error occurs</param>
    async personalConferenceDropParticipant(participantId: string): Promise<any> {
        let that = this;
        return that.conferenceDropParticipant(that._personalConferenceConfEndpointId, participantId);

        /*
        if (String.IsNullOrEmpty(personalConferenceConfEndpointId))
        {
        callback?.Invoke(new SdkResult<Boolean>("You don't have a Personal Conference"));
        return;
        }

        ConferenceDropParticipant(personalConferenceConfEndpointId, participantId, callback);
        // */
    }

//endregion PERSONAL CONFERENCE SPECIFIC

//region CONFERENCE / Personal Conference SPECIFIC

// Internal

    async conferenceEndedForBubble(bubbleJid: string) {
        let that = this;
        //let bubbleId : string = GetBubbleIdFromBubbleJidFromCache(bubbleJid);
        //let bubble : Bubble= GetBubbleByIdFromCache(bubbleId);
        let bubble: Bubble = await that.getBubbleByJid(bubbleJid);


        if (bubble.confEndpoints != null) {
            //foreach(Bubble.ConfEndpoint confEndpoint in bubble.confEndpoints)
            bubble.confEndpoints.forEach((confEndpoint: any) => {
                // Create a non active conference and "add it to the cache" - in consequence the conference will be removed and ConfrenceUpdated event raised if necessary
                let conference: ConferenceSession = new ConferenceSession();
                conference.id = confEndpoint.ConfEndpointId;
                conference.active = false;
                that._logger.log("debug", LOG_ID + "(ConferenceEndedForBubble) Add inactive conference to the cache - conferenceId: ", conference.id, ", bubbleJid:", bubbleJid);
                that.addConferenceToCache(conference);
            });
        }

        /* if ((bubble != null) && (bubble.ConfEndpoints != null) && (bubble.ConfEndpoints.Count > 0)) {
             conference : Conference;
             foreach(Bubble.ConfEndpoint
             confEndpoint in bubble.ConfEndpoints
         )
             {
                 // Create a non active conference and "add it to the cache" - in consequence the conference will be removed and ConfrenceUpdated event raised if necessary
                 conference = new Conference();
                 conference.Id = confEndpoint.ConfEndpointId;
                 conference.Active = false;

                 log.DebugFormat("[ConferenceEndedForBubble] Add inactive conference to the cache - conferenceId:[{0}] - bubbleId:[{1}] - bubbleId:[{2}]",
                     conference.Id, bubbleId, bubbleJid);
                 that.addConferenceToCache(conference);
             }
         }*/
    }

    askBubbleForConferenceDetails(bubbleJid: string) {
        /*
            GetBubbleByJid(bubbleJid, callback =>
            {
                if(!callback.Result.Success)
                {
                    log.WarnFormat("[AskBubbleForConferenceDetails] - Impossible to get details about this bubble - Error:[{0}]", Util.SerialiseSdkError(callback.Result) );
                }
                else
                {
                    Bubble bubble = callback.Data;
                    if ( (bubble.ConfEndpoints != null)
                        && (bubble.ConfEndpoints.Count > 0) )
                    {
                        foreach (Bubble.ConfEndpoint confEndpoint in bubble.ConfEndpoints)
                        {
                            log.DebugFormat("[AskBubbleForConferenceDetails] - ConfEndPoint related to this bubble:[{0}]", confEndpoint.ToString());
                        }
                    }
                    else
                    {
                        log.WarnFormat("[AskBubbleForConferenceDetails] - No Conf End Points provided for this bubble !");
                    }
                }
            });
        */
    }

    async personalConferenceRename(name: string) {
        let that = this;
        return that._rest.personalConferenceRename(that._personalConferenceConfEndpointId, name);

        /*    RestClient restClient = rest.GetClient();
            string resource = rest.GetResource("confprovisioning", $"conferences/{personalConferenceConfEndpointId}");

            String body = string.Format(@"{{""name"":""{0}""}}", name);

            RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
            restRequest.AddParameter("body", body, ParameterType.RequestBody);

            restClient.ExecuteAsync(restRequest, (response) =>
            {
                if (!response.IsSuccessful)
                    log.ErrorFormat("[PersonalConferenceRename] - Not possible to rename Personal Conference conference:[{0}]", Sdk.ErrorFromResponse(response));
            });*/
    }

    async askConferenceSnapshot(conferenceId: string, type: MEDIATYPE) {
        let that = this;
        return that._rest.askConferenceSnapshot(conferenceId, type);

        /* RestClient restClient = rest.GetClient();
         string resource = rest.GetResource("conference", $"conferences/{conferenceId}/snapshot");

         RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);
         restRequest.AddQueryParameter("mediaType", type);

         restClient.ExecuteAsync(restRequest, (response) =>
         {
             //Do we have a correct answer
             if (response.IsSuccessful)
             {
                 //log.DebugFormat("[AskConferenceSnapshot] - response.Content:\r\n{0}", response.Content);

                 var json = JsonConvert.DeserializeObject<dynamic>(response.Content);

                 if (json["data"] != null)
                 {
                     JObject jObject = (JObject)json["data"];

                     //if (jObject.GetValue("active") != null)
                     {

                         log.DebugFormat("[AskConferenceSnapshot] - active(string):[{0}]", jObject.GetValue("active").ToString());
                         Boolean active = false;
                         if (jObject.GetValue("active").Type == JTokenType.Boolean)
                             active = (Boolean)jObject.GetValue("active");

                         // Do something only if conference is active
                         if (active)
                         {
                             // Get conference form cahe (if any)
                             Conference conference = ConferenceGetByIdFromCache(conferenceId);
                             if (conference == null)
                             {
                                 conference = new Conference();
                                 conference.Id = conferenceId;
                             }

                             conference.Active = true;

                             // Clear participants since this server request give all info about them
                             conference.Participants = new List<Conference.Participant>();

                             try
                             {
                                 // Loop on participants found
                                 JArray jArray = (JArray)jObject.GetValue("participants");

                                 if ((jArray != null)
                                     && (jArray.Count > 0))
                                 {
                                     Conference.Participant participant = null;
                                     foreach (JObject jParticipant in jArray)
                                     {
                                         if (jParticipant.GetValue("participantId") != null)
                                         {
                                             // Create Participant object
                                             participant = new Conference.Participant();

                                             // Id
                                             participant.Id = jParticipant.GetValue("participantId").ToString();

                                             // Muted
                                             if (jParticipant.GetValue("mute") != null)
                                                 participant.Muted = (jParticipant.GetValue("mute").ToString() == "true");
                                             else
                                                 participant.Muted = false;

                                             // Hold
                                             if (jParticipant.GetValue("held") != null)
                                                 participant.Hold = (jParticipant.GetValue("held").ToString() == "true");
                                             else
                                                 participant.Hold = false;

                                             // IsModerator
                                             if (jParticipant.GetValue("participantRole") != null)
                                                 participant.Moderator = (jParticipant.GetValue("participantRole").ToString() == "moderator");
                                             else
                                                 participant.Moderator = false;

                                             // IsConnected
                                             if (jParticipant.GetValue("participantState") != null)
                                                 participant.Connected = (jParticipant.GetValue("participantState").ToString() == "connected");
                                             else
                                                 participant.Connected = false;

                                             // Jid_im
                                             if (jParticipant.GetValue("jid_im") != null)
                                                 participant.Jid_im = jParticipant.GetValue("jid_im").ToString();

                                             // PhoneNumber
                                             if (jParticipant.GetValue("phoneNumber") != null)
                                                 participant.PhoneNumber = jParticipant.GetValue("phoneNumber").ToString();

                                             // Finally add participant to the list
                                             conference.Participants.Add(participant);
                                         }
                                     }
                                 }
                             }
                             catch (Exception e)
                             {
                                 log.WarnFormat("[AskConferenceSnapshot] - Exception:[{0}]", Util.SerializeException(e));
                             }

                             log.DebugFormat("[AskConferenceSnapshot] - Conference:[{0}]", conference.ToString());

                             // Finally add conference to the cache
                             AddConferenceToCache(conference);
                         }
                     }
                 }
             }
             else
                 log.DebugFormat("[AskConferenceSnapshot] - Error:[{0}]", Sdk.ErrorFromResponse(response));
         });*/
    }

    async conferenceModeratorAction(conferenceId: string, action: string) //, Action<SdkResult<Boolean>> callback = null
    {


        let that = this;

        let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;
        if ((mediaType === MEDIATYPE.WEBRTC) && ((action == "lock") || (action == "unlock"))) {
            // CRRAINB - 8132: API To Lock a Conference doesn't work
            //      Lock only available for PSTN Conference (not webRTC)
            return Promise.reject({
                code: -1,
                "label": "API To Lock a Conference doesn't work. Lock only available for PSTN Conference (not webRTC)"
            });
        }

        return that._rest.conferenceModeratorAction(conferenceId, mediaType, action);

        /*
            if (!application.IsCapabilityAvailable(Contact.Capability.BubbleParticipate))
            {
                callback?.Invoke(new SdkResult<Boolean>("Current user has not the capability [BubbleParticipate]"));
                return;
            }

            // Cf. https://api.openrainbow.org/conference/#api-conference-Update_conference

            String mediaType = (conferenceId == personalConferenceConfEndpointId) ? Bubble.MediaType.PstnAudio : Bubble.MediaType.Webrtc;

            if ( (mediaType == Bubble.MediaType.Webrtc)
                && ( (action == "lock") || (action == "unlock") ) )
            {
                // CRRAINB - 8132: API To Lock a Conference doesn't work
                //      Lock only available for PSTN Conference (not webRTC)
                callback?.Invoke(new SdkResult<Boolean>("Lock / Unlock is only available for Personal Conference"));
                return;
            }

            RestClient restClient = rest.GetClient();
            string resource = rest.GetResource("conference", $"conferences/{conferenceId}/update");

            String body = String.Format(@"{{""option"":""{0}"", ""mediaType"":""{1}""}}", action, mediaType);

            RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
            restRequest.AddParameter("body", body, ParameterType.RequestBody);

            restClient.ExecuteAsync(restRequest, (response) =>
            {
                //Do we have a correct answer
                if (response.IsSuccessful)
                {
                    //log.DebugFormat("[PersonalConferenceModeratorAction] - response.Content:\r\n{0}", response.Content);
                    callback?.Invoke(new SdkResult<Boolean>(true));
                }
                else
                    callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
            });*/
    }

    async conferenceModeratorActionOnParticipant(conferenceId: string, participantId: string, action: string) {
        let that = this;

        let mediaType = (conferenceId == that._personalConferenceConfEndpointId) ? MEDIATYPE.PstnAudio : MEDIATYPE.WEBRTC;

        return that._rest.conferenceModeratorActionOnParticipant(conferenceId, mediaType, participantId, action);

        /*if (!application.IsCapabilityAvailable(Contact.Capability.BubbleParticipate))
        {
            callback?.Invoke(new SdkResult<Boolean>("Current user has not the capability [BubbleParticipate]"));
            return;
        }

        // Cf. https://api.openrainbow.org/conference/#api-conference-Update_participant

        String mediaType = (conferenceId == personalConferenceConfEndpointId) ? Bubble.MediaType.PstnAudio : Bubble.MediaType.Webrtc;

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("conference", $"conferences/{conferenceId}/participants/{participantId}");

        String body = String.Format(@"{{""option"":""{0}"", ""mediaType"":""{1}""}}", action, mediaType);

        RestRequest restRequest = rest.GetRestRequest(resource, Method.PUT);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync(restRequest, (response) =>
        {
            //Do we have a correct answer
            if (response.IsSuccessful)
            {
                //log.DebugFormat("[PersonalConferenceModeratorAction] - response.Content:\r\n{0}", response.Content);
                callback?.Invoke(new SdkResult<Boolean>(true));
            }
            else
                callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(response)));
        });*/
    }

//endregion CONFERENCE / Personal Conference SPECIFIC

//region Conference cache
    removeConferenceFromCache(conferenceId: string, deleteLinkWithBubble: boolean) {
        let that = this;
        if (that._conferencesSessionById.containsKey(conferenceId)) {
            that._conferencesSessionById.remove((item: KeyValuePair<string, ConferenceSession>) => {
                return conferenceId === item.key;
            });
        }

        if (deleteLinkWithBubble) {
            if (that._linkConferenceAndBubble.containsKey(conferenceId)) {
                that._linkConferenceAndBubble.remove((item: KeyValuePair<string, string>) => {
                    return conferenceId === item.key;
                });
            }
        }
    }

    addConferenceToCache(conference: ConferenceSession) {
        let that = this;
        if (conference != null) {
            let needToRaiseEvent: boolean = false;
            // Does this conference is linked to a known bubble ?
            let linkedWithBubble: boolean;
            linkedWithBubble = that._linkConferenceAndBubble.containsKey(conference.id);

            // Remove conference from cache
            that.removeConferenceFromCache(conference.id, !conference.active);

            // Add conference - only if still active
            if (conference.active) {
                that._conferencesSessionById.add(conference.id, conference);
                that._logger.log("debug", LOG_ID + "(addConferenceToCache) Added to conferences list cache - Conference : ", conference.ToString());
                // log.DebugFormat("[addConferenceToCache] Added to conferences list cache - Conference:[{0}]", conference.ToString());
            } else {
                needToRaiseEvent = true; // We always need to raise event even if conference is no more active - third party must known that the conference has ended
                that._logger.log("debug", LOG_ID + "(addConferenceToCache) Not added to conferences list cache - Conference : ", conference.ToString());
                // log.DebugFormat("[addConferenceToCache] Not added to conferences list cache - Conference[{0}]", conference.ToString());
            }

            // If already linked to bubble raised ConferenceUpdated event
            if (linkedWithBubble) {
                needToRaiseEvent = true;
            } else {
                that._logger.log("debug", LOG_ID + "(addConferenceToCache) This conference : ", conference.id, " is not linked to a known bubble");
                // log.WarnFormat("[addConferenceToCache] This conference [{0}] is not linked to a known bubble", conference.Id);
                // NEED TO ENHANCE THIS PART
            }

            // Raise event outside lock
            if (needToRaiseEvent) {
                that._logger.log("debug", LOG_ID + "(addConferenceToCache) ConferenceUpdated event raised.");
                // log.DebugFormat("[addConferenceToCache] ConferenceUpdated event raised");
                // TODO: ConferenceUpdated.Raise(this, new ConferenceEventArgs(conference));
            }
        }
    }

//endregion

// region tags
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
    retrieveAllBubblesByTags(tags: Array<string>): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(retrieveAllBubblesByTags) bubble tags  " + tags);

            if (!tags) {
                that._logger.log("debug", LOG_ID + "(retrieveAllBubblesByTags) bad or empty 'tags' parameter : ", tags);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.retrieveAllBubblesByTags(tags).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(retrieveAllBubblesByTags) result from server : ", result);

                if (result) {
                    /* let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                    if (bubble.isActive) {
                        that._logger.log("debug", LOG_ID + "(getBubbleById) send initial presence to room : ", bubble.jid);
                        await that._presence.sendInitialBubblePresence(bubble);
                    } else {
                        that._logger.log("debug", LOG_ID + "(getBubbleById) bubble not active, so do not send initial presence to room : ", bubble.jid);
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
     * @method setTagsOnABubble
     * @instance
     * @async
     * @description
     *      Set a list of tags on a {Bubble}. <br/>
     * @param {Bubble} bubble The on which the tags must be setted.
     * @param {Array<Object>} tags The tags to be setted on the selected bubble. Ex :  [{ "tag" : "Test1Tag" }, { "tag" : "Test2Tag" }]
     * @return {Promise<any>} return a promise with a Bubble's tags infos.
     */
    setTagsOnABubble(bubble : Bubble, tags: Array<string>): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(setTagsOnABubble) bubble tags  " + tags);

            if (!bubble || !bubble.id) {
                that._logger.log("debug", LOG_ID + "(setTagsOnABubble) bad or empty 'bubble' parameter : ", bubble);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!tags) {
                that._logger.log("debug", LOG_ID + "(setTagsOnABubble) bad or empty 'tags' parameter : ", tags);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.setTagsOnABubble(bubble.id, tags).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(setTagsOnABubble) result from server : ", result);

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
     * @method deleteTagOnABubble
     * @instance
     * @async
     * @description
     *  Delete a single tag on a list of {Bubble}. If the list of bubble is empty then every bubbles are concerned. <br/>
     * @param {Array<Bubble>} bubbles The bubbles on which the tags must be deleted.
     * @param {string} tag The tag to be removed on the selected bubbles.
     * @return {Promise<any>} return a promise with a Bubble's tags infos.
     */
    deleteTagOnABubble(bubbles : Array<Bubble>, tag: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(deleteTagOnABubble) bubble tag  ", tag);
            that._logger.log("internal", LOG_ID + "(deleteTagOnABubble) bubble tag  ", tag, " on bubble : ", bubbles);

            if (!bubbles) {
                that._logger.log("debug", LOG_ID + "(deleteTagOnABubble) bad or empty 'bubbles' parameter : ", bubbles);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!tag) {
                that._logger.log("debug", LOG_ID + "(deleteTagOnABubble) bad or empty 'tags' parameter : ", tag);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let roomIds = [];
            for ( let i = 0; i < bubbles.length; i++) {
                that._logger.log("internal", LOG_ID + "(deleteTagOnABubble) prepare to delete tag from bubble : ", bubbles[i]);
                roomIds.push(bubbles[i].id);
            }

            return that._rest.deleteTagOnABubble(roomIds, tag).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(deleteTagOnABubble) result from server : ", result);

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

//endregion tags

    //region CONTAINERS (Bubble Folder)

    // Get all rooms containers
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
    getAllBubblesContainers (name: string = null) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getAllBubblesContainers) containers name  " + name);

            return that._rest.getAllBubblesContainers(name).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getAllBubblesContainers) result from server : ", result);

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
     * @method getABubblesContainersById
     * @instance
     * @param {string} id The id of the container of bubbles to retreive from server.
     * @async
     * @description
     *       retrieve a containers of bubbles from server by it's id. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getABubblesContainersById (id: string = null) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getABubblesContainersById) containers id " + id);

            return that._rest.getABubblesContainersById(id).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getABubblesContainersById) result from server : ", result);

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
    addBubblesToContainerById (containerId: string , bubbleIds : Array<string> ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(addBubblesToContainerById) containers containerId : " + containerId, ", bubbleIds : ", bubbleIds);
            
            if (!containerId) {
                that._logger.log("debug", LOG_ID + "(addBubblesToContainerById) bad or empty 'containerId' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!bubbleIds) {
                that._logger.log("debug", LOG_ID + "(addBubblesToContainerById) bad or empty 'bubbleIds' parameter : ", bubbleIds);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            
            return that._rest.addBubblesToContainerById(containerId, bubbleIds).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(addBubblesToContainerById) result from server : ", result);

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
    updateBubbleContainerNameAndDescriptionById (containerId: string , name : string, description? : string ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(updateBubbleContainerNameAndDescriptionById) containers containerId : " + containerId, ", name : ", name);

            if (!containerId) {
                that._logger.log("debug", LOG_ID + "(updateBubbleContainerNameAndDescriptionById) bad or empty 'containerId' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!name) {
                that._logger.log("debug", LOG_ID + "(updateBubbleContainerNameAndDescriptionById) bad or empty 'name' parameter : ", name);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.updateBubbleContainerNameAndDescriptionById(containerId, name, description).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(updateBubbleContainerNameAndDescriptionById) result from server : ", result);

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
    createBubbleContainer (name : string, description? : string, bubbleIds? : Array<string> ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(createBubbleContainer) containers bubbleIds : " + bubbleIds, ", name : ", name);

            if (!name) {
                that._logger.log("debug", LOG_ID + "(createBubbleContainer) bad or empty 'name' parameter : ", name);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.createBubbleContainer( name, description, bubbleIds).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(createBubbleContainer) result from server : ", result);

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
     * @method deleteBubbleContainer
     * @instance
     * @param {string} containerId The id of the container of bubbles to delete from server.
     * @async
     * @description
     *       delete one container by id. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    deleteBubbleContainer (containerId : string ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(deleteBubbleContainer) containerId : " + containerId);

            if (!containerId) {
                that._logger.log("debug", LOG_ID + "(deleteBubbleContainer) bad or empty 'name' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.deleteBubbleContainer( containerId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(deleteBubbleContainer) result from server : ", result);

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
    removeBubblesFromContainer (containerId : string, bubbleIds : Array<string> ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(removeBubblesFromContainer) bubbleIds : " + bubbleIds, ", containerId : ", containerId);

            if (!containerId) {
                that._logger.log("debug", LOG_ID + "(removeBubblesFromContainer) bad or empty 'containerId' parameter : ", containerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!bubbleIds) {
                that._logger.log("debug", LOG_ID + "(removeBubblesFromContainer) bad or empty 'bubbleIds' parameter : ", bubbleIds);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            return that._rest.removeBubblesFromContainer(containerId, bubbleIds ).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(removeBubblesFromContainer) result from server : ", result);

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
    
    //endregion CONTAINERS
    
    //region Conference V2

    /**
     * @public
     * @method addPSTNParticipantToConference
     * @instance
     * @param {string} roomId The id of the room.
     * @param {string} participantPhoneNumber Phone number to call.
     * @param {string} country Country where the called number is from. If not provided, the user's country is taken.
     * @since 2.2.0
     * @async
     * @description
     *       Adds a PSTN participant to WebRTC conference. A SIP call is launched towards the requested phone number. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    addPSTNParticipantToConference(roomId : string, participantPhoneNumber : string, country : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(addPSTNParticipantToConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(addPSTNParticipantToConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!participantPhoneNumber) {
                that._logger.log("debug", LOG_ID + "(addPSTNParticipantToConference) bad or empty 'participantPhoneNumber' parameter : ", participantPhoneNumber);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.addPSTNParticipantToConference(roomId, participantPhoneNumber , country).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(addPSTNParticipantToConference) result from server : ", result);

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
     * @method snapshotConference
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} limit Allows to specify the number of participants to retrieve. 
     * @param {string} offset Allows to specify the position of first participant to retrieve.
     * @async
     * @description
     *       The snapshot command returns global information about conference and the set of participants engaged in the conference. <br/>
     *       If conference isn't started, 'active' will be 'false' and the participants list empty. <br/>
     *       If conference is started and the requester is in it, the response will contain global information about conference and the requested set of participants. <br/>
     *       If the conference is started and the requester, not conference owner, isn't in the conference, the response will contain global information about conference and an empty participants list. <br/>
     *       If the conference is started and the requester, conference owner, isn't in the conference, the response will contain global information about conference and the requested set of participants. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    snapshotConference(roomId : string, limit : number = 100,  offset : number = 0) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(snapshotConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(snapshotConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.snapshotConference(roomId, limit, offset).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(snapshotConference) result from server : ", result);

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
     * @method delegateConference
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} userId User identifier.
     * @async
     * @description
     *       Current owner of the conference delegates its control to another user (this user must support conference delegation, i.e. "delegateCapability" was set to true when joining). <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    delegateConference(roomId : string, userId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(delegateConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(delegateConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log("debug", LOG_ID + "(delegateConference) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.delegateConference(roomId, userId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(delegateConference) result from server : ", result);

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
     * @method disconnectPSTNParticipantFromConference
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Disconnect PSTN participant from conference. The request is sent by a conference's moderator. <br/>
     *       Conference: Moderator can drop any PSTN participant. <br/>
     *       Webinar: Organizer or speaker can drop any PSTN participant. <br/>
     *       Practice room: Not applicable <br/>
     *       Waiting room: Not applicable. <br/>     
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    disconnectPSTNParticipantFromConference (roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(disconnectPSTNParticipantFromConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(disconnectPSTNParticipantFromConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.disconnectPSTNParticipantFromConference(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(disconnectPSTNParticipantFromConference) result from server : ", result);

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
     * @method disconnectParticipantFromConference
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} userId User identifier.
     * @async
     * @description
     *       Disconnect participant from conference. The request can be sent by participant himself or by a conference's moderator. <br/> 
     *       Conference: Moderator can drop any participant except conference owner. <br/>
     *       Webinar: Organizer or speaker can drop any participant. <br/>
     *       Practice room: Organizer or speaker can drop any participant. When last participant is dropped, practice room stops. <br/>
     *       Waiting room: Not applicable. <br/>     
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    disconnectParticipantFromConference(roomId : string, userId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(delegateConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(delegateConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log("debug", LOG_ID + "(delegateConference) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.delegateConference(roomId, userId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(delegateConference) result from server : ", result);

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
     * @method getTalkingTimeForAllPparticipantsInConference
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} limit Allows to specify the number of participants to retrieve.
     * @param {string} offset Allows to specify the position of first participant to retrieve.
     * @async
     * @description
     *       The snapshot command returns global information about conference and the set of participants engaged in the conference. <br/>
     *       If conference isn't started, 'active' will be 'false' and the participants list empty. <br/>
     *       If conference is started and the requester is in it, the response will contain global information about conference and the requested set of participants. <br/>
     *       If the conference is started and the requester, not conference owner, isn't in the conference, the response will contain global information about conference and an empty participants list. <br/>
     *       If the conference is started and the requester, conference owner, isn't in the conference, the response will contain global information about conference and the requested set of participants. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getTalkingTimeForAllPparticipantsInConference(roomId : string, limit : number = 100,  offset : number = 0) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getTalkingTimeForAllPparticipantsInConference(roomId, limit, offset).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) result from server : ", result);

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
     * @method joinConferenceV2
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} mediaType For screen sharing during PSTN conference. Valid value : webrtcSharingOnly
     * @param {string} participantPhoneNumber Join through dial.
     * @param {string} country Country where the called number is from. If not provided, the user's country is taken.
     * @param {Array<string>} dc TURN server prefix information associated to client location (DC = Data Center).
     * @param {string} mute Join as muted/unmuted.
     * @param {string} microphone Has client a microphone?
     * @async
     * @description
     *       Adds a participant to a conference. In case of PSTN conference, the user will be called to the provided phone number (dial out). <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    joinConferenceV2(roomId : string, mediaType : string = "webrtcSharingOnly", participantPhoneNumber : string, country : string, dc : Array<string>, mute: boolean = false, microphone : boolean = true) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(joinConferenceV2) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(joinConferenceV2) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.joinConferenceV2(roomId, mediaType, participantPhoneNumber, country, dc, mute, microphone).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(joinConferenceV2) result from server : ", result);

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
     * @method pauseRecording
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Pauses the recording of a conference. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    pauseRecording(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(pauseRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(pauseRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(pauseRecording) result from server : ", result);

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
     * @method resumeRecording
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Resume the recording of a conference. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    resumeRecording(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(resumeRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(resumeRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(resumeRecording) result from server : ", result);

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
     * @method startRecording
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Start the recording of a conference. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    startRecording(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(startRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(startRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(startRecording) result from server : ", result);

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
     * @method stopRecording
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Stop the recording of a conference. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    stopRecording(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(stopRecording) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(stopRecording) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.pauseRecording(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(stopRecording) result from server : ", result);

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
     * @method rejectAVideoConference
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       User indicates that he rejects the conference (only available for WebRTC conferences). <br>
     *       A XMPP message will be sent to all his clients in order for them to remove the incoming call popup. <br/>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    rejectAVideoConference(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(rejectAVideoConference) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(rejectAVideoConference) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.rejectAVideoConference(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(rejectAVideoConference) result from server : ", result);

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
     * @method startConferenceOrWebinarInARoom
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       The start command initiates a conference in a room. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    startConferenceOrWebinarInARoom(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(startConferenceOrWebinarInARoom) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(startConferenceOrWebinarInARoom) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.startConferenceOrWebinarInARoom(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(startConferenceOrWebinarInARoom) result from server : ", result);

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
     * @method stopConferenceOrWebinar
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       The stop command terminates an active conference identified in a room. All currently connected participants are disconnected. <br>
     *       Conference: Only conference owner can stop it. <br>
     *       Webinar: Any organizer can stop it. <br>
     *       Practice room: Any organizer or speaker can stop it. <br>
     *       Waiting room: Can't be stopped through API. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    stopConferenceOrWebinar(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(stopConferenceOrWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(stopConferenceOrWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.stopConferenceOrWebinar(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(stopConferenceOrWebinar) result from server : ", result);

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
     * @method subscribeForParticipantVideoStream
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} userId User identifier.
     * @param {string} media [or audioVideo] Concerned media. Default value in case of webinar is audio+video, else video. <br>
     * default value : video <br>
     * Authorized values : audio, video, audioVideo, sharing <br>
     * @param {number} subStreamLevel Sub stream level (O=low, 2=high) to activate at startup. To be used only if simulcast is available at publisher side. <br>
     * Authorized values : 0, 1, 2 <br>
     * @param {boolean} dynamicFeed Declare a feed as dynamic. You will subscribe first to the feed associated to publisher, then switch to active talker's feed if present. <br>
     *     Valeur par défaut : false <br>
     * @async
     * @description
     *       Gives the possibility to a user participating in a WebRTC conference to subscribe and receive a video stream published by an other user. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    subscribeForParticipantVideoStream(roomId : string, userId : string, media : string = "video", subStreamLevel : number = 0, dynamicFeed : boolean = false ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(subscribeForParticipantVideoStream) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(subscribeForParticipantVideoStream) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log("debug", LOG_ID + "(subscribeForParticipantVideoStream) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.subscribeForParticipantVideoStream(roomId, userId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(subscribeForParticipantVideoStream) result from server : ", result);

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
     * @method updatePSTNParticipantParameters
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} phoneNumber Participant phone number.
     * @param {string} option Mute/unmute the participant. <br>
     *     Authorized values : mute, unmute
     * @async
     * @description
     *       The update PSTN participant command can update different options of a participant. Only one option can be updated at a time. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    updatePSTNParticipantParameters(roomId : string, phoneNumber : string, option : string = " unmute") {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(updatePSTNParticipantParameters) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(updatePSTNParticipantParameters) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!phoneNumber) {
                that._logger.log("debug", LOG_ID + "(updatePSTNParticipantParameters) bad or empty 'phoneNumber' parameter : ", phoneNumber);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updatePSTNParticipantParameters(roomId, phoneNumber, option).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(updatePSTNParticipantParameters) result from server : ", result);

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
     * @method updateConferenceParameters
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} option Following options are available: </br>
     * Mute Mutes all participants, except requester. </br>
     * Unmute Unmutes all participants. </br>
     * Lock Disables any future participant from joining conference. </br>
     * Unlock Unlocks the conference. </br>
     * Webinar Changes practice room into webinar. <br>
     *     Authorized values :  mute, unmute, lock, unlock, webinar </br>
     * @async
     * @description
     *       The update conference command can update different options of a conference. Only one option can be updated at a time. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    updateConferenceParameters(roomId : string, option : string = "unmute") {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(updateConferenceParameters) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(updateConferenceParameters) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!option) {
                that._logger.log("debug", LOG_ID + "(updateConferenceParameters) bad or empty 'option' parameter : ", option);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updateConferenceParameters(roomId, option).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(updateConferenceParameters) result from server : ", result);

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
      * @method updateParticipantParameters
      * @instance
      * @since 2.2.0
      * @param {string} roomId The id of the room.
      * @param {string} userId Conference session participant identifier.
      * @param {string} option Mute/unmute the participant. </br>
      * Plug/unplug the microphone.</br>
      * Update some media parameters:</br>
      *     Update media bandwidth as publisher. Two parameters must be present: media and bitRate.</br>
      *     Update substream level as subscriber. One parameter must be present: subStreamLevel. Parameter publisherId is optional.</br>
      * Authorized values : mute, unmute, update, plug, unplug</br>
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
      * @category async
      */
     updateParticipantParameters(roomId : string, userId : string, option : string, media : string, bitRate : number, subStreamLevel : number, publisherId : string ) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(updateParticipantParameters) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(updateParticipantParameters) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!option) {
                that._logger.log("debug", LOG_ID + "(updateParticipantParameters) bad or empty 'option' parameter : ", option);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updateParticipantParameters(roomId, userId, option, media, bitRate, subStreamLevel, publisherId ).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(updateParticipantParameters) result from server : ", result);

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
     * @method allowTalkWebinar
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} userId User identifier. </br>
     * @async
     * @description
     *       Webinar: allow a participant who raised his hand to talk. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    allowTalkWebinar(roomId : string, userId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(allowTalkWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(allowTalkWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log("debug", LOG_ID + "(allowTalkWebinar) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.allowTalkWebinar(roomId, userId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(allowTalkWebinar) result from server : ", result);

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
     * @method disableTalkWebinar
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} userId User identifier. </br>
     * @async
     * @description
     *       Webinar: disable a participant who raised his hand to talk. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    disableTalkWebinar(roomId : string, userId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(disableTalkWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(disableTalkWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log("debug", LOG_ID + "(disableTalkWebinar) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.disableTalkWebinar(roomId, userId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(disableTalkWebinar) result from server : ", result);

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
     * @method lowerHandWebinar
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Webinar: participant lowers hand. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    lowerHandWebinar(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(lowerHandWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(lowerHandWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.lowerHandWebinar(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(lowerHandWebinar) result from server : ", result);

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
     * @method raiseHandWebinar
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @async
     * @description
     *       Webinar: participant raises hand. <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    raiseHandWebinar(roomId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(raiseHandWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(raiseHandWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.raiseHandWebinar(roomId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(raiseHandWebinar) result from server : ", result);

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
     * @method stageDescriptionWebinar
     * @instance
     * @since 2.2.0
     * @param {string} roomId The id of the room.
     * @param {string} userId For each actor, his user identifier.
     * @param {string} type For each actor, how is he on scene: as a participant (avatar or video) or as a screen sharing. </br>
     * Authorized values : participant, sharing
     * @param {Array<string>} properties For each actor, up to 10 properties.
     * @async
     * @description
     *       Webinar: stage description (up to 10 actors). <br>
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    stageDescriptionWebinar(roomId : string, userId : string, type : string, properties : Array<string>) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(stageDescriptionWebinar) roomId : " + roomId);

            if (!roomId) {
                that._logger.log("debug", LOG_ID + "(stageDescriptionWebinar) bad or empty 'roomId' parameter : ", roomId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!userId) {
                that._logger.log("debug", LOG_ID + "(stageDescriptionWebinar) bad or empty 'userId' parameter : ", userId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!type) {
                that._logger.log("debug", LOG_ID + "(stageDescriptionWebinar) bad or empty 'type' parameter : ", type);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!properties) {
                that._logger.log("debug", LOG_ID + "(stageDescriptionWebinar) bad or empty 'properties' parameter : ", properties);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.stageDescriptionWebinar(roomId, userId, type, properties).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(stageDescriptionWebinar) result from server : ", result);

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

    //endregion
    
}

module.exports.BubblesService = Bubbles;
export {Bubbles as BubblesService};

