"use strict";
import EventEmitter = NodeJS.EventEmitter;

export {};
import * as deepEqual from "deep-equal";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Bubble} from "../common/models/Bubble";
import {XMPPService} from "../connection/XMPPService";
import {createPromiseQueue} from "../common/promiseQueue";
import {logEntryExit, until, resizeImage, getBinaryData} from "../common/Utils";
import {isStarted} from "../common/Utils";
import {Logger} from "../common/Logger";
import {atob} from "atob";
import {ContactsService} from "./ContactsService";
import {ProfilesService} from "./ProfilesService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";
const Jimp = require('jimp');
//import Jimp from "jimp";

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
 *      Each user can create bubbles and invite other users to be part of it.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new bubble <br>
 *      - Invite users in a bubble or remove them <br>
 *      - Manage a bubble: close, delete <br>
 *      - Leave a bubble <br>
 *      - Accept or decline an invitation to join a bubble <br>
 *      - Change the custom data attached to a bubble
 */
class Bubbles {
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _bubbles: Bubble[];
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    public ready: boolean;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    private avatarDomain: string;
    private _contacts: ContactsService;
    private _profileService: ProfilesService;
    private _options: any;
    private _s2s: S2SService;
    private _presence: PresenceService;
    private _useXMPP: any;
    private _useS2S: any;

    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter : EventEmitter,  _http : any, _logger : Logger, _startConfig) {
        this.ready = false;
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

        this.avatarDomain = _http.host.split(".").length === 2 ? _http.protocol + "://cdn." + _http.host + ":" + _http.port : _http.protocol + "://" + _http.host + ":" + _http.port;

        this._eventEmitter.on("evt_internal_invitationreceived", this._onInvitationReceived.bind(this));
        this._eventEmitter.on("evt_internal_affiliationchanged", this._onAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_ownaffiliationchanged", this._onOwnAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_customdatachanged", this._onCustomDataChanged.bind(this));
        this._eventEmitter.on("evt_internal_topicchanged", this._onTopicChanged.bind(this));
        this._eventEmitter.on("evt_internal_namechanged", this._onNameChanged.bind(this));
        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));
        this._eventEmitter.on("evt_internal_privilegechanged", this._onPrivilegeBubbleChanged.bind(this));

    }

    start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _profileService : ProfilesService
        let that = this;

        return new Promise(function(resolve, reject) {
            try {
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
                that.ready = true;
                resolve();
            }
            catch (err) {
                return reject();
            }
        });
    }

    stop() {
        let that = this;

        return new Promise(function(resolve, reject) {
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
                that.ready = false;
                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createBubble
     * @instance
     * @description
     *  Create a new bubble
     * @param {string} name  The name of the bubble to create
     * @param {string} description  The description of the bubble to create
     * @param {boolean} withHistory If true, a newcomer will have the complete messages history since the beginning of the bubble. False if omitted
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - Bubble object, else an ErrorManager object
     * @category async
     */
    async createBubble(name, description, withHistory) {

        let that = this;

        return new Promise((resolve, reject) => {

            if (typeof withHistory === "undefined") {
                withHistory = false;
            }

            if (!name) {
                that._logger.log("warn", LOG_ID + "(createBubble) bad or empty 'name' parameter");
                that._logger.log("internalerror", LOG_ID + "(createBubble) bad or empty 'name' parameter", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!description) {
                that._logger.log("warn", LOG_ID + "(createBubble) bad or empty 'description' parameter");
                that._logger.log("internalerror", LOG_ID + "(createBubble) bad or empty 'description' parameter", description);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.createBubble(name, description, withHistory).then((bubble : any) => {
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
                    // Wait for the bubble to be added in service list with the treatment of the sendInitialPresence result event (_onbubblepresencechanged)
                    await until(() => {
                        return (that._bubbles.find((bubbleIter : any) => {
                                return (bubbleIter.jid === bubble.jid);
                            }) !== undefined);
                        },
                        "Waiting for the initial presence of a creation of bubble : " + bubble.jid);
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
     *  Check if the bubble is closed or not.
     */
    isBubbleClosed(bubble) {

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter : ", bubble);
            throw (ErrorManager.getErrorManager().BAD_REQUEST);
        } else {
            let activeUser = bubble.users.find((user) => {
                return user.status === "invited" || user.status === "accepted";
            });

            if (activeUser) {
                return false;
            }

            return true;
        }
    }

    /**
     * @public
     * @method
     * @instance
     * @description
     *    Delete all existing owned bubbles <br/>
     *    Return a promise
     * @return {Object} Nothing or an error object depending on the result
     */
    deleteAllBubbles() {
        let that = this;
        let deleteallBubblePromiseQueue = createPromiseQueue(that._logger);

        let bubbles = that.getAll();

        bubbles.forEach(function(bubble) {
            let  deleteBubblePromise = function() { return that.deleteBubble(bubble); };
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
     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants.
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble removed, else an ErrorManager object
     * @category async
     */
    deleteBubble(bubble) {
        let that = this;

        return new Promise(function (resolve, reject) {

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter");
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
     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants.
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble removed, else an ErrorManager object
     * @category async
     */
    closeAndDeleteBubble(bubble) {
        let that = this;

        return new Promise(function(resolve, reject) {
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
                    resolve( updatedBubble);
                }).catch(function(err) {
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
     *  Close a owned bubble. When the owner closes a bubble, the bubble is archived and only accessible in read only mode for all participants.
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
                    return that.removeContactFromBubble({id: participantID}, bubble).then( () => {
                        that._logger.log("debug", LOG_ID + "(closeBubble) Participant " + participantID + " unsubscribed");
                        return unsubscribeParticipants(participantsIDList).then(() => {
                            resolve();
                        }).catch((err) => {
                            return reject(err);
                        });
                    }).catch((err) => {
                        return reject(err);
                    });
                }
                resolve();
            });
        };

        return new Promise(function(resolve, reject) {
            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(closeBubble) bad or empty 'bubble' parameter");
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
     *  Archive  a bubble.
     *  This API allows to close the room in one step. The other alternative is to change the status for each room users not deactivated yet.
     *  All users currently having the status 'invited' or 'accepted' will receive a message/stanza .
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The operation result
     * @category async
     */
    archiveBubble(bubble) {
        let that = this;
        return new Promise(function(resolve, reject) {
            let otherModerator = null;

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(archiveBubble) bad or empty 'bubble' parameter");
                that._logger.log("internalerror", LOG_ID + "(archiveBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.archiveBubble(bubble.id).then(function(json) {
                that._logger.log("info", LOG_ID + "(archiveBubble) leave successfull");
                that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                resolve(json);

            }).catch(function(err) {
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
     *  Leave a bubble. If the connected user is a moderator, an other moderator should be still present in order to leave this bubble.
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The operation result
     * @category async
     */
    leaveBubble(bubble) {
        let that = this;
        return new Promise(function(resolve, reject) {
            let otherModerator = null;
            let userStatus = "none";

            if (bubble) {
                otherModerator = bubble.users.find((user) => {
                    return user.privilege === "moderator" && user.status === "accepted" && user.userId !== that._rest.userId;
                });

                userStatus = bubble.getStatusForUser(that._rest.userId);
            }

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter");
                that._logger.log("internalerror", LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!otherModerator) {
                that._logger.log("warn", LOG_ID + "(leaveBubble) can't leave a bubble if no other active moderator");
                reject(ErrorManager.getErrorManager().FORBIDDEN);
                return;
            }

            that._rest.leaveBubble(bubble.id, userStatus).then(function(json) {
                that._logger.log("info", LOG_ID + "(leaveBubble) leave successfull");
                that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                resolve(json);
            }).catch(function(err) {
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
     * @param {Object} options          The criterias to select the users to retrieve
     * format : Allows to retrieve more or less user details in response, besides specifics data about room users like (privilege, status and additionDate)
     * - small: userId loginEmail displayName jid_im
     * - medium: userId loginEmail displayName jid_im status additionDate privilege firstName lastName companyId companyName
     * - full: userId loginEmail displayName jid_im status additionDate privilege firstName lastName nickName title jobTitle emails country language timezone companyId companyName roles adminType
     * sortField : Sort items list based on the given field
     * privilege : Allows to filter users list on the privilege type provided in this option.
     * limit : Allow to specify the number of items to retrieve.
     * offset : Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.
     * sortOrder : Specify order when sorting items list. Available values -1, 1 (default)
     * @description
     *  Get a list of users in a bubble filtered by criterias.
     * @async
     * @return {Promise<Array, ErrorManager>}
     */
    getUsersFromBubble(bubble, options : Object = {}) {
        let that = this;
        return new Promise(function(resolve, reject) {

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

            that._rest.getRoomUsers(bubble.id, options).then(function(json) {
                that._logger.log("info", LOG_ID + "(getRoomUsers) retrieve successfull");
                resolve(json);
            }).catch(function(err) {
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
     *  Get the status of the connected user in a bubble
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     */
    getStatusForConnectedUserInBubble(bubble) {
        let that = this;
        if (!bubble) {
            that._logger.log("warn", LOG_ID + "(getStatusForConnectedUserInBubble) bad or empty 'bubble' parameter");
            that._logger.log("internalerror", LOG_ID + "(getStatusForConnectedUserInBubble) bad or empty 'bubble' parameter : ", bubble);
            //reject(ErrorManager.getErrorManager().BAD_REQUEST);
            return "none";
        }
        let user = bubble.users.find((user) => {
            return  user.userId === that._rest.userId ;
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
     *  Invite a contact in a bubble
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble updated with the new invitation
     * @category async
     */
    inviteContactToBubble(contact, bubble, isModerator, withInvitation, reason) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("internal", LOG_ID + "(inviteContactToBubble) arguments : ", ...arguments);

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter");
                that._logger.log("internalerror", LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter : ", contact);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter");
                that._logger.log("internalerror", LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let isActive = false;
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

            if (isActive || isInvited) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) Contact has been already invited or is already a member of the bubble");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that.removeContactFromBubble(contact, bubble).then((bubbleUpdated: any) => {
                return that._rest.inviteContactToBubble(contact.id, bubbleUpdated.id, isModerator, withInvitation, reason);
            }).then(function() {
                that._logger.log("info", LOG_ID + "(inviteContactToBubble) invitation successfully sent");

                return that._rest.getBubble(bubble.id);
            }).then(async (bubbleReUpdated : any) => {

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
            }).catch(function(err) {
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
     *  Invite a list of contacts by emails in a bubble
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
                that._logger.log("warn", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'contact' parameter");
                that._logger.log("internalerror", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'contact' parameter : ", contactsEmails);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(inviteContactsByEmailToBubble) bad or empty 'bubble' parameter");
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

    // @private for ale rainbow team's tests only
    joinConference( bubble) {
        let that = this;

        return new Promise(async function(resolve, reject) {
            that._logger.log("internal", LOG_ID + "(joinConference) arguments : ", ...arguments);

             if (!bubble || !bubble.id) {
                that._logger.log("warn", LOG_ID + "(joinConference) bad or empty 'bubble' parameter");
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
                that._logger.log("warn", LOG_ID + "(joinConference) bad or empty 'bubble.confEndpoints' parameter");
                that._logger.log("internalerror", LOG_ID + "(joinConference) bad or empty 'bubble.confEndpoints' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let mediaType = bubble.mediaType;
            if (!that._profileService.isFeatureEnabled(that._profileService.getFeaturesEnum().WEBRTC_CONFERENCE_ALLOWED) && mediaType !== that._rest.MEDIATYPE.WEBRTCSHARINGONLY) {
                that._logger.log("warn", LOG_ID + "(WebConferenceService) retrieveWebConferences - user is not allowed");
                reject(new Error("notAllowed"));
                return;
            }

            let endpoint = await that._rest.retrieveWebConferences(mediaType);
            let confEndPoints = null;
                confEndPoints = endpoint;
            let confEndPointId = null;
            if (confEndPoints.length === 1 && confEndPoints[0].mediaType === that._rest.MEDIATYPE.WEBRTC) {
                confEndPointId = confEndPoints[0].id;
            }

             that._rest.joinConference(confEndPointId, "moderator").then(function(joinResult : any) {
                resolve(joinResult);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(joinConference) error");
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
     *  Promote or not a contact in a bubble
     *  The logged in user can't update himself. As a result, a 'moderator' can't be downgraded to 'user'.
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble updated with the modifications
     * @category async
     */
    promoteContactInBubble(contact, bubble, isModerator) {
        let that = this;

        return new Promise(function(resolve, reject) {

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter");
                that._logger.log("internalerror", LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter : ", contact);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter");
                that._logger.log("internalerror", LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            let isActive = false;
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

            if (!isActive && !isInvited) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) Contact is not invited or is not already a member of the bubble");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.promoteContactInBubble(contact.id, bubble.id, isModerator)
            .then(function() {
                that._logger.log("info", LOG_ID + "(promoteContactInBubble) user privilege successfully sent");

                return that._rest.getBubble(bubble.id);
            }).then(async (bubbleReUpdated : any) => {

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
            }).catch(function(err) {
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
     *    Return a promise.
     * @param {Contact} contact The contact to promote
     * @param {Bubble} bubble   The destination bubble
     * @return {Promise<Bubble, ErrorManager>} The bubble object or an error object depending on the result
     */
    promoteContactToModerator(contact, bubble) {
        let that = this;
        if (!contact) {
            that._logger.log("warn", LOG_ID + "(promoteContactToModerator) bad or empty 'contact' parameter");
            that._logger.log("internalerror", LOG_ID + "(promoteContactToModerator) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubble) {
            that._logger.log("warn", LOG_ID + "(promoteContactToModerator) bad or empty 'bubble' parameter");
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
     *    Return a promise.
     * @param {Contact} contact The contact to promote
     * @param {Bubble} bubble   The destination bubble
     * @return {Promise<Bubble, ErrorManager>} The bubble object or an error object depending on the result
     */
    demoteContactFromModerator (contact, bubble) {
        let that = this;
        if (!contact) {
            that._logger.log("warn", LOG_ID + "(demoteContactFromModerator) bad or empty 'contact' parameter");
            that._logger.log("internalerror", LOG_ID + "(demoteContactFromModerator) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubble) {
            that._logger.log("warn", LOG_ID + "(demoteContactFromModerator) bad or empty 'bubble' parameter");
            that._logger.log("internalerror", LOG_ID + "(demoteContactFromModerator) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        return this.promoteContactInBubble(contact, bubble, false);
    }

    /**
     * @public
     * @method changeBubbleOwner
     * @instance
     * @param {Contact} contact         The contact to set a new bubble owner
     * @param {Bubble} bubble           The bubble
     * @description
     *  Set a moderator contact as owner of a bubble
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

            that._rest.changeBubbleOwner(bubble.id, contact.id).then(async (bubbleData : any ) => {
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
     *    Remove a contact from a bubble
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble object or an error object depending on the result
     * @category async
     */
    removeContactFromBubble(contact, bubble) {

        let that = this;

        return new Promise(function(resolve, reject) {

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter");
                that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter : ", contact);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter");
                that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter : ", bubble);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let contactStatus = "";

            bubble.users.forEach(function(user) {
                if (user.userId === contact.id) {
                    contactStatus = user.status;
                }
            });

            that._logger.log("info", LOG_ID + "(removeContactFromBubble) remove contact with status", contactStatus);

            switch (contactStatus) {
                case "rejected":
                case "invited":
                case "unsubscribed":
                    that._rest.removeInvitationOfContactToBubble(contact.id, bubble.id).then(function() {
                        that._logger.log("info", LOG_ID + "(removeContactFromBubble) removed successfully");

                        that._rest.getBubble(bubble.id).then(async (bubbleUpdated : any) => {
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
                    }).catch(function(err) {
                        that._logger.log("error", LOG_ID + "(removeContactFromBubble) error");
                        that._logger.log("internalerror", LOG_ID + "(removeContactFromBubble) error : ", err);
                        return reject(err);
                    });
                    break;
                case "accepted":
                    that._rest.unsubscribeContactFromBubble(contact.id, bubble.id).then(function() {
                        that._logger.log("debug", LOG_ID + "(removeContactFromBubble) removed successfully");

                        that._rest.getBubble(bubble.id).then(async (bubbleUpdated : any) => {

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
                    }).catch(function(err) {
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

        return new Promise(function(resolve, reject) {
            that._rest.getBubbles().then(function(listOfBubbles : any = []) {
                that._logger.log("debug", LOG_ID + "(getBubbles)  listOfBubbles.length : ", listOfBubbles.length);

                //that._bubbles = listOfBubbles.map( (bubble) => Object.assign( new Bubble(), bubble));
                that._bubbles = [];
                listOfBubbles.map(async (bubble) => {
                    await that.addOrUpdateBubbleToCache(bubble);
                });
                that._logger.log("info", LOG_ID + "(getBubbles) get successfully");
                let prom = [];
                listOfBubbles.forEach(function(bubble : any) {

                    let users = bubble.users;
                    users.forEach(function(user) {
                        if (user.userId === that._rest.userId && user.status === "accepted") {
                            if (bubble.isActive) {
                                that._logger.log("debug", LOG_ID + "(getBubbles) send initial presence to room : ", bubble.jid);
                                prom.push(that._presence.sendInitialBubblePresence(bubble));
                            } else {
                                that._logger.log("debug", LOG_ID + "(getBubbles) bubble not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        }
                    });
                });

                Promise.all(prom).then(() =>
                {
                    resolve();
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(getBubbles) error");
                    that._logger.log("internalerror", LOG_ID + "(getBubbles) error : ", err);
                    return reject(err);
                }); // */
            }).catch(function(err) {
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
     *  Return the list of existing bubbles
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
     *  Return the list of existing bubbles
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
        return bubbleFound ;
    }

    private async addOrUpdateBubbleToCache(bubble : any): Promise<Bubble> {
        let that = this;
        let bubbleObj : Bubble = await Bubble.BubbleFactory(that.avatarDomain, that._contacts)(bubble);
        let bubbleFoundindex = this._bubbles.findIndex((channelIter) => {
            return channelIter.id === bubble.id;
        });
        if (bubbleFoundindex != -1) {
            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble, ", at bubbleFoundindex : ", bubbleFoundindex);
            //this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble, ", at bubbleFoundindex : ", bubbleFoundindex);
            this._bubbles[bubbleFoundindex].updateBubble(bubble, that._contacts);
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

                that._logger.log("internal", LOG_ID + "(removeBubbleFromCache) remove from cache bubbleId : ", bubbleIdToRemove);
                that._bubbles = this._bubbles.filter( function(chnl: any) {
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
     *  Get A Blob object with data about the avatar picture of the bubble.
     */
    getAvatarFromBubble(bubble){
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

                return that._rest.getBlobFromUrl(bubble.avatar).then((avatarBuffer : any) => {
                    that._logger.log("internal", LOG_ID + "(getAvatarFromBubble) bubble from server : ", avatarBuffer);
                    let blob = {buffer : avatarBuffer,
                        type: "image/jpeg",
                        fileSize: avatarBuffer.length,
                        fileName: bubble.id
                    }; // */

                    /*let blob = new Blob([response.data],
                        { type: mime }); // */

                    that._logger.log("debug", LOG_ID + "getAvatarFromBubble success");
                        resolve(blob);
                }).catch((err)=>{
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
     *  Refresh members and organizers of the bubble.
     */
    refreshMemberAndOrganizerLists (bubble) {
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
     * @async
     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
     * @description
     *  Get a bubble by its ID in memory and if it is not found in server.
     */
    getBubbleById(id) : Promise<Bubble>{
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getBubbleById) bubble id  " + id);

            if (!id) {
                that._logger.log("debug", LOG_ID + "(getBubbleById) bad or empty 'id' parameter", id);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let bubbleFound = that._bubbles.find((bubble) => {
                return (bubble.id === id);
            });

            if (bubbleFound) {
                that._logger.log("debug", LOG_ID + "(getBubbleById) bubbleFound in memory : ", bubbleFound.jid);
            } else {
                that._logger.log("debug", LOG_ID + "(getBubbleById) bubble not found in memory, search in server id : ", id);
                return that._rest.getBubble(id).then(async (bubbleFromServer) => {
                    that._logger.log("internal", LOG_ID + "(getBubbleById) bubble from server : ", bubbleFromServer);

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
                }).catch((err)=>{
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
     * @async
     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
     * @description
     *  Get a bubble by its JID in memory and if it is not found in server.
     */
    async getBubbleByJid(jid) : Promise<Bubble>  {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getBubbleByJid) bubble jid  ", jid);

            if (!jid) {
                that._logger.log("debug", LOG_ID + "(getBubbleByJid) bad or empty 'jid' parameter", jid);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let bubbleFound : any = that._bubbles.find((bubble) => {
                return (bubble.jid === jid);
            });


            if (bubbleFound) {
                that._logger.log("debug", LOG_ID + "(getBubbleByJId) bubbleFound in memory : ", bubbleFound.jid);
            } else {
                that._logger.log("debug", LOG_ID + "(getBubbleByJId) bubble not found in memory, search in server jid : ", jid);
                return that._rest.getBubbleByJid(jid).then(async (bubbleFromServer) => {
                    that._logger.log("internal", LOG_ID + "(getBubbleByJId) bubble from server : ", bubbleFromServer);

                    if (bubbleFromServer) {
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleFromServer);
                        //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                        //that._bubbles.push(bubble);
                        if (bubble.isActive) {
                            that._logger.log("debug", LOG_ID + "(getBubbleByJid) send initial presence to room : ", bubble.jid);
                            await that._presence.sendInitialBubblePresence(bubble);
                        } else {
                            that._logger.log("debug", LOG_ID + "(getBubbleByJid) bubble not active, so do not send initial presence to room : ", bubble.jid);
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
     *  Get the list of Bubbles that have a pending invitation not yet accepted of declined
     */
    getAllPendingBubbles() {

        let that = this;

        let pendingBubbles = this._bubbles.filter((bubble) => {

            let invitation = bubble.users.filter((user) => {
                return (user.userId === that._rest.userId && user.status === "invited");
            });
            return invitation.length > 0;
        });
        return pendingBubbles;
    }

    /**
     * @public
     * @method getAllActiveBubbles
     * @since 1.30
     * @instance
     * @return {Bubble[]} An array of Bubbles that are "active" for the connected user
     * @description
     *  Get the list of Bubbles where the connected user can chat
     */
    getAllActiveBubbles() {
        let that = this;

        let activeBubbles = this._bubbles.filter((bubble) => {

            let amIActive = bubble.users.find((user) => {
                return (user.userId === that._rest.userId && user.status === "accepted");
            });

            return amIActive;
        });
        return activeBubbles;
    }

    /**
     * @public
     * @method getAllClosedBubbles
     * @since 1.30
     * @instance
     * @return {Bubble[]} An array of Bubbles that are closed for the connected user
     * @description
     *  Get the list of Bubbles where the connected user can only read messages
     */
    getAllClosedBubbles() {
        let that = this;

        let closedBubbles = this._bubbles.filter((bubble) => {

            let amIAway = bubble.users.find((user) => {
                return (user.userId === that._rest.userId && user.status === "unsubscribed");
            });

            return amIAway;
        });
        return closedBubbles;
    }

    /**
     * @public
     * @method acceptInvitationToJoinBubble
     * @instance
     * @param {Bubble} bubble The Bubble to join
     * @description
     *  Accept an invitation to join a bubble
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble updated or an error object depending on the result
     * @category async
     */
    acceptInvitationToJoinBubble(bubble) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.acceptInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                that._logger.log("info", LOG_ID + "(acceptInvitationToJoinBubble) invitation accepted", invitationStatus);

                that._rest.getBubble(bubble.id).then(async (bubbleUpdated : any) => {
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
     *  Decline an invitation to join a bubble
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble updated or an error object depending on the result
     * @category async
     */
    declineInvitationToJoinBubble(bubble) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.declineInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                that._logger.log("info", LOG_ID + "(declineInvitationToJoinBubble) invitation declined : ", invitationStatus);

                that._rest.getBubble(bubble.id).then(async (bubbleUpdated : any) => {
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
     *  Modify all custom data at once in a bubble
     *  To erase all custom data, put {} in customData
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The bubble updated with the custom data set or an error object depending on the result
     * @category async
     */
    setBubbleCustomData(bubble, customData) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let bubbleId = bubble.id;

        let custom = {"customData": customData || {} };

        return new Promise((resolve, reject) => {

            that._rest.setBubbleCustomData(bubbleId, custom).then(async (json : any) => {
                that._logger.log("internal", LOG_ID + "(setBubbleCustomData) customData set", json.customData);
                bubble.customData = json.customData || {};

                try {
                    await until( () => {

                            let bubbleInMemory = that._bubbles.find( (bubbleIter) => { return bubbleIter.id === bubbleId; });
                            if (bubbleInMemory)  {
                                that._logger.log("internal", LOG_ID + "(setBubbleCustomData) bubbleInMemory : ", bubbleInMemory, ", \nbubble : ", bubble);

                                return deepEqual(bubbleInMemory.customData, bubble.customData);
                            } else {
                                return false;
                            }
                        } , "wait in setBubbleCustomData for the customData to be updated by the event rainbow_onbubblecustomdatachanged", 8000);
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
     *  Set the Bubble's visibility status
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result
     * @category async
     */
    setBubbleVisibilityStatus(bubble, status) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleVisibilityStatus) bad or empty 'bubble' parameter");
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
     *  Set the Bubble's topic
     * @memberof Bubbles
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result
     * @category async
     */
    setBubbleTopic(bubble, topic) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleTopic(bubble.id, topic).then((bubbleData : any) => {
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
     * @param {string} topic Bubble's name
     * @description
     *  Set the Bubble's name
     * @async
     * @return {Promise<Bubble, ErrorManager>}
     * @fulfil {Bubble} - The Bubble full data or an error object depending on the result
     * @category async
     */
    setBubbleName(bubble, name) {

        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleName(bubble.id, name).then((bubbleData : any) => {

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

    randomString (length : number = 10) {
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
     *    Return a promise.
     * @param {string} urlAvatar  The avatarUrl
     * @param {Bubble} bubble  The bubble to update
     * @return {Bubble} A bubble object of null if not found
     */
    updateAvatarForBubble(urlAvatar, bubble) {
        return this.setAvatarBubble(bubble,urlAvatar);
    }

    /**
     * @private
     * @method setAvatarBubble
     * @param bubble
     * @param roomAvatarPath
     */
    setAvatarBubble (bubble, roomAvatarPath) {
        let that = this;

        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!roomAvatarPath) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'roomAvatarPath' parameter");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'roomAvatarPath' parameter : ", roomAvatarPath);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            resizeImage(roomAvatarPath, 512, 512).then(function (resizedImage) {
                that._logger.log("debug", LOG_ID + "(setAvatarBubble) resizedImage : ", resizedImage);
                let binaryData = getBinaryData(resizedImage);
                that._rest.setAvatarRoom(bubble.id, binaryData).then(
                    function success(result : any) {
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

     *    Return a promise.
     * @param {Bubble} bubble  The bubble to update
     * @return {Bubble} A bubble object of null if not found
     */
    deleteAvatarFromBubble(bubble) {
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter");
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
    deleteAvatarBubble (bubbleId) {
        let that = this;
        if (!bubbleId) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter : ", bubbleId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            that._rest.deleteAvatarRoom(bubbleId).then((res) => {
                resolve (res);
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
                resolve();
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
     *    Return a promise.
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
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'customData' parameter");
            this._logger.log("internalerror", LOG_ID + "(setAvatarBubble) bad or empty 'customData' parameter : ", customData);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubblefound) {
            this._logger.log("warn", LOG_ID + "(setAvatarBubble) bad or empty 'bubble' parameter");
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
     *    Return a promise.
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
     *    Return a promise.
     * @param {string} strDescription   The description of the bubble (is is the topic on server side, and result event)
     * @param {Bubble} bubble   The bubble to update
     * @return {Bubble} A bubble object of null if not found
     */
    async updateDescriptionForBubble(bubble, strDescription) {
        return this.setBubbleTopic(bubble, strDescription);
        /*let that = this;
        // update bubble with internal copy to avoid user/moderator/owner side effects
        let bubblefound : any = bubble && bubble.id ? await that.getBubbleById(bubble.id) : null;

        if (!strDescription) {
            this._logger.log("warn", LOG_ID + "(updateDescriptionForBubble) bad or empty 'strDescription' parameter");
            this._logger.log("internalerror", LOG_ID + "(updateDescriptionForBubble) bad or empty 'strDescription' parameter : ", strDescription);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!bubblefound) {
            this._logger.log("warn", LOG_ID + "(updateDescriptionForBubble) bad or empty 'bubble' parameter");
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
     *      Method called when receiving an invitation to join a bubble
     */
    _onInvitationReceived(invitation) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onInvitationReceived) invitation : ", invitation);

        this._rest.getBubble(invitation.bubbleId).then(async (bubbleUpdated : any) => {
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
            that._logger.log("internal", LOG_ID + "(_onInvitationReceived) get bubble failed for invitation : ", invitation);
        });;
    }

    /**
     * @private
     * @method _onAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when affilitation to a bubble changed
     */
    async _onAffiliationChanged(affiliation) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onAffiliationChanged) affiliation : ", affiliation);

        await this._rest.getBubble(affiliation.bubbleId).then( async (bubbleUpdated : any) => {
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
            that._logger.log("internal", LOG_ID + "(_onAffiliationChanged) get bubble failed for affiliation : ", affiliation);
        });
    }

    /**
     * @private
     * @method _onOwnAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when the user affilitation to a bubble changed
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
                        if (affiliation.status === "accepted") {
                            if (bubble.isActive) {
                                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                                that._presence.sendInitialBubblePresence(bubble);
                            } else {
                                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                            }
                        } else if (affiliation.status === "unsubscribed") {
                            that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                        }
                    } else {
                        let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);

                        /*bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                        that._bubbles.push(bubbleUpdated); // */
                        // New bubble, send initial presence
                        if (bubble.isActive) {
                            that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                            that._presence.sendInitialBubblePresence(bubble);
                        } else {
                            that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                        }

                    }

                    that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubbleUpdated);
                });
            }
        } else {

            // remove it
            let bubbleToRemoved = that._bubbles.findIndex(function(el) {
                return el.id === affiliation.bubbleId;
            });
             //*/

            if (bubbleToRemoved != -1 ) {
                let bubbleRemoved = await that.removeBubbleFromCache(affiliation.bubbleId);
                that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubbleRemoved);
                that._eventEmitter.emit("evt_internal_bubbledeleted", bubbleRemoved);
            } else {
                that._logger.log("warn", LOG_ID + "(_onOwnAffiliationChanged) deleted bubble not found in cache, so raised the deleted event with only the id of this bubble : ", affiliation.bubbleId);
                let bubble = {id:null };
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
     *      Method called when custom data have changed for a bubble
     */
    _onCustomDataChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated : any) => {

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
     *      Method called when the topic has changed for a bubble
     */
    _onTopicChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated : any) => {
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
     *     Method called when the owner of a bubble changed.
     */
    async _onPrivilegeBubbleChanged(bubbleInfo) {
        /*
        let that = this;
        let ownerContact = await that.getContactById(bubbleInfo.creator, false);
         */
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onPrivilegeBubbleChanged) privilege changed for bubbleInfo : ", bubbleInfo);

        this._rest.getBubble(bubbleInfo.bubbleId).then(async (bubbleUpdated : any) => {
            that._logger.log("internal", LOG_ID + "(_onPrivilegeBubbleChanged) privilege changed for bubble : ", bubbleUpdated.name);

            let bubble = await that.addOrUpdateBubbleToCache(bubbleUpdated);
            that._eventEmitter.emit("evt_internal_bubbleprivilegechanged", {bubble, "privilege" : bubbleInfo.privilege});
        });
    }


    /**
     * @private
     * @method _onNameChanged
     * @instance
     * @param {Object} data contains information about bubble new name received
     * @description
     *      Method called when the name has changed for a bubble
     */
    _onNameChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then(async (bubbleUpdated : any) => {
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
     *      Method called when the name has changed for a bubble
     */
    async _onbubblepresencechanged(bubbleInfo) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onbubblepresencechanged) bubble presence received for : ", bubbleInfo.jid );
        //that._logger.log("internal", LOG_ID + "(_onbubblepresencechanged) bubble presence : ", bubbleInfo );
        // Find the bubble in service list, and else retrieve it from server.
        let bubbleInMemory: Bubble;
        bubbleInMemory = await that.getBubbleByJid(bubbleInfo.jid);
// that._bubbles.find((bubbleIter) => { return bubbleIter.jid === bubbleInfo.jid ; });
        if (bubbleInMemory) {
            that._logger.log("internal", LOG_ID + "(_onbubblepresencechanged) bubble found in memory : ", bubbleInMemory.jid);
            if (bubbleInfo.statusCode === "resumed") {
                that._presence.sendInitialBubblePresence(bubbleInfo).then(()=> {
                    bubbleInMemory.isActive = true;
                    that._eventEmitter.emit("evt_internal_bubblepresencechanged", bubbleInMemory);
                });
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

}

module.exports.BubblesService = Bubbles;
export {Bubbles as BubblesService};
