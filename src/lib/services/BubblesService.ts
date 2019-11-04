"use strict";
export {};
import * as deepEqual from "deep-equal";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Bubble} from "../common/models/Bubble";
import {XMPPService} from "../connection/XMPPService";
import {createPromiseQueue} from "../common/promiseQueue";
import {logEntryExit, until} from "../common/Utils";
import {isStarted} from "../common/Utils";

const LOG_ID = "BUBBLES/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @class
 * @name Bubbles
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
	public _xmpp: XMPPService;
	public _rest: RESTService;
	public _bubbles: Bubble[];
	public _eventEmitter: any;
	public _logger: any;
    public ready: boolean;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter, _logger, _startConfig) {
        this.ready = false;
        this._xmpp = null;
        this._rest = null;
        this._bubbles = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._startConfig = _startConfig;

        this._eventEmitter.on("evt_internal_invitationreceived", this._onInvitationReceived.bind(this));
        this._eventEmitter.on("evt_internal_affiliationchanged", this._onAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_ownaffiliationchanged", this._onOwnAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_customdatachanged", this._onCustomDataChanged.bind(this));
        this._eventEmitter.on("evt_internal_topicchanged", this._onTopicChanged.bind(this));
        this._eventEmitter.on("evt_internal_namechanged", this._onNameChanged.bind(this));
        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));

    }

    start(_xmpp : XMPPService, _rest : RESTService) {
        let that = this;

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._bubbles = [];
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
     * @memberof Bubbles
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

                that._xmpp.sendInitialBubblePresence(bubble.jid).then(async () => {
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
     * @memberof Bubbles
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
     * @memberof Bubbles
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

            that._rest.deleteBubble(bubble.id).then(function (resultDelete) {
                //let bubbleRemoved = that.removeBubbleFromCache(updatedBubble.id);
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
     * @memberof Bubbles
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
                that._rest.deleteBubble(updatedBubble.id).then(function() {
                    //let bubbleRemoved = that.removeBubbleFromCache(updatedBubble.id);
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
     * @memberof Bubbles
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
                        that._rest.getBubble(bubble.id).then(function (bubbleUpdated: any) {

                            //

                            // Update the existing local bubble stored
                            let bubbleReturned = that.addOrUpdateBubbleToCache(bubbleUpdated);

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
     * @method leaveBubble
     * @instance
     * @param {Bubble} bubble  The bubble to leave
     * @memberof Bubbles
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
                that._logger.log("error", LOG_ID + "(leaveBubble) error");
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getStatusForConnectedUserInBubble
     * @instance
     * @param {Bubble} bubble           The bubble
     * @memberof Bubbles
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
     * @memberof Bubbles
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
            }).then(function(bubbleReUpdated : any) {

                let bubble = that.addOrUpdateBubbleToCache(bubbleReUpdated);

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
     * @method promoteContactInBubble
     * @instance
     * @param {Contact} contact         The contact to promote or downgraded
     * @param {Bubble} bubble           The bubble
     * @param {boolean} isModerator     True to promote a contact as a moderator of the bubble, and false to downgrade
     * @memberof Bubbles
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
            }).then(function(bubbleReUpdated : any) {

                // Update the existing local bubble stored
                let bubble = that.addOrUpdateBubbleToCache(bubbleReUpdated);
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
     * @method changeBubbleOwner
     * @instance
     * @param {Contact} contact         The contact to set a new bubble owner
     * @param {Bubble} bubble           The bubble
     * @memberof Bubbles
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

            that._rest.changeBubbleOwner(bubble.id, contact.id).then((bubbleData : any ) => {
                that._logger.log("info", LOG_ID + "(changeBubbleOwner) owner set", bubbleData.owner);
                bubble.owner = bubbleData.owner;
                resolve(bubble);
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
     * @memberof Bubbles
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

                        that._rest.getBubble(bubble.id).then((bubbleUpdated : any) => {
                            // Update the existing local bubble stored
                            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);
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

                        that._rest.getBubble(bubble.id).then((bubbleUpdated : any) => {

                            // Update the existing local bubble stored
                            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);
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
            that._rest.getBubbles().then(function(listOfBubbles : any) {

                //that._bubbles = listOfBubbles.map( (bubble) => Object.assign( new Bubble(), bubble));
                that._bubbles = [];
                listOfBubbles.map( (bubble) => {
                    that.addOrUpdateBubbleToCache(bubble);
                });
                that._logger.log("info", LOG_ID + "(getBubbles) get successfully");
                let prom = [];
                listOfBubbles.forEach(function(bubble : any) {

                    let users = bubble.users;
                    users.forEach(function(user) {
                        if (user.userId === that._rest.userId && user.status === "accepted") {
                            if (bubble.isActive) {
                                that._logger.log("debug", LOG_ID + "(getBubbles) send initial presence to room : ", bubble.jid);
                                prom.push(that._xmpp.sendInitialBubblePresence(bubble.jid));
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
                });
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
     * @memberof Bubbles
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
     * @memberof Bubbles
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
     * @memberof Bubbles
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

    private addOrUpdateBubbleToCache(bubble : any): Bubble {
        let bubbleObj : Bubble = Bubble.BubbleFactory()(bubble);
        let bubbleFoundindex = this._bubbles.findIndex((channelIter) => {
            return channelIter.id === bubble.id;
        });
        if (bubbleFoundindex != -1) {
            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) update in cache with bubble : ", bubble, ", at bubbleFoundindex : ", bubbleFoundindex);
            this._bubbles[bubbleFoundindex].updateBubble(bubble);
            //this._bubbles.splice(bubbleFoundindex,1,bubbleObj);
            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) in update this._bubbles : ", this._bubbles);
            bubbleObj = this._bubbles[bubbleFoundindex];
        } else {
            this._logger.log("internal", LOG_ID + "(addOrUpdateBubbleToCache) add in cache bubbleObj : ", bubbleObj);
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
     * @public
     * @method getBubbleById
     * @instance
     * @param {string} id the id of the bubble
     * @async
     * @return {Promise<Bubble>}  return a promise with {Bubble} The bubble found or null
     * @memberof Bubbles
     * @description
     *  Get a bubble by its ID in memory and if it is not found in server.
     */
    getBubbleById(id) {
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
                return that._rest.getBubble(id).then((bubbleFromServer) => {
                    that._logger.log("internal", LOG_ID + "(getBubbleById) bubble from server : ", bubbleFromServer);

                    if (bubbleFromServer) {
                        let bubble = that.addOrUpdateBubbleToCache(bubbleFromServer);
                        //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                        //that._bubbles.push(bubble);
                        if (bubble.isActive) {
                            that._logger.log("debug", LOG_ID + "(getBubbleById) send initial presence to room : ", bubble.jid);
                            that._xmpp.sendInitialBubblePresence(bubble.jid);
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
     * @memberof Bubbles
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
                return that._rest.getBubbleByJid(jid).then((bubbleFromServer) => {
                    that._logger.log("internal", LOG_ID + "(getBubbleByJId) bubble from server : ", bubbleFromServer);

                    if (bubbleFromServer) {
                        let bubble = that.addOrUpdateBubbleToCache(bubbleFromServer);
                        //let bubble = Object.assign(new Bubble(), bubbleFromServer);
                        //that._bubbles.push(bubble);
                        if (bubble.isActive) {
                            that._logger.log("debug", LOG_ID + "(getBubbleByJid) send initial presence to room : ", bubble.jid);
                            that._xmpp.sendInitialBubblePresence(bubble.jid);
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
     * @memberof Bubbles
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
     * @memberof Bubbles
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
     * @memberof Bubbles
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
     * @memberof Bubbles
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

                that._rest.getBubble(bubble.id).then((bubbleUpdated : any) => {
                    // Update the existing local bubble stored
                    let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);
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
     * @memberof Bubbles
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

                that._rest.getBubble(bubble.id).then((bubbleUpdated : any) => {
                    // Update the existing local bubble stored
                    let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);
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
     * @memberof Bubbles
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
                    that._rest.getBubble(bubble.id).then((bubbleUpdated: any) => {

                        that._logger.log("internal", LOG_ID + "(setBubbleCustomData) Custom data in bubble retrieved from server : ", bubbleUpdated.name + " | " + bubbleUpdated.customData);

                        let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);

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
     * @memberof Bubbles
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
     * @memberof Bubbles
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

    /**
     * @private
     * @method _sendInitialBubblePresence
     * @instance
     * @param {Bubble} bubble The Bubble
     * @memberof Bubbles
     * @description
     *      Method called when receiving an invitation to join a bubble
     */
    _sendInitialBubblePresence(bubble) {
        this._xmpp.sendInitialBubblePresence(bubble.jid);
    }

    /**
     * @private
     * @method _onInvitationReceived
     * @instance
     * @param {Object} invitation contains informations about bubble and user's jid
     * @memberof Bubbles
     * @description
     *      Method called when receiving an invitation to join a bubble
     */
    _onInvitationReceived(invitation) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(_onInvitationReceived) invitation : ", invitation);

        this._rest.getBubble(invitation.bubbleId).then( (bubbleUpdated : any) => {
            that._logger.log("debug", LOG_ID + "(_onInvitationReceived) invitation received from bubble : ", bubbleUpdated.name);

            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);

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
        });
    }

    /**
     * @private
     * @method _onAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @memberof Bubbles
     * @description
     *      Method called when affilitation to a bubble changed
     */
    _onAffiliationChanged(affiliation) {
        let that = this;

        this._rest.getBubble(affiliation.bubbleId).then( (bubbleUpdated : any) => {
            that._logger.log("debug", LOG_ID + "(_onAffiliationChanged) user affiliation changed for bubble : ", bubbleUpdated.name + " | " + affiliation.status);

            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);

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
        });
    }

    /**
     * @private
     * @method _onOwnAffiliationChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @memberof Bubbles
     * @description
     *      Method called when the user affilitation to a bubble changed
     */
    _onOwnAffiliationChanged(affiliation) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) parameters : affiliation : ", affiliation);

        if (affiliation.status !== "deleted") {
            this._rest.getBubble(affiliation.bubbleId).then( (bubbleUpdated : any) => {
                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) own affiliation changed for bubble : ", bubbleUpdated.name + " | " + affiliation.status);

                // Update the existing local bubble stored
                let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                if (foundIndex > -1) {
                    let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);
                    //bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                    //that._bubbles[foundIndex] = bubbleUpdated;
                    if (affiliation.status === "accepted") {
                        if (bubble.isActive) {
                            that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                            that._xmpp.sendInitialBubblePresence(bubble.jid);
                        } else {
                            that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                        }
                    }
                    else if (affiliation.status === "unsubscribed") {
                        that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                    }
                }
                else {
                    let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);

                    /*bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                    that._bubbles.push(bubbleUpdated); // */
                    // New bubble, send initial presence
                    if (bubble.isActive) {
                        that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) send initial presence to room : ", bubble.jid);
                        that._xmpp.sendInitialBubblePresence(bubble.jid);
                    } else {
                        that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) bubble not active, so do not send initial presence to room : ", bubble.jid);
                    }

                }

                that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubbleUpdated);
            });
        } else {

            // remove it
            let bubbleToRemoved = that._bubbles.findIndex(function(el) {
                return el.id === affiliation.bubbleId;
            });
             //*/

            if (bubbleToRemoved != -1 ) {
                let bubbleRemoved = that.removeBubbleFromCache(affiliation.bubbleId);
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
     * @memberof Bubbles
     * @description
     *      Method called when custom data have changed for a bubble
     */
    _onCustomDataChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then( (bubbleUpdated : any) => {

            that._logger.log("internal", LOG_ID + "(_onCustomDataChanged) Custom data changed for bubble : ", bubbleUpdated.name + " | " + data.customData);

            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);

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
     * @memberof Bubbles
     * @description
     *      Method called when the topic has changed for a bubble
     */
    _onTopicChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then( (bubbleUpdated : any) => {
            that._logger.log("internal", LOG_ID + "(_onTopicChanged) Topic changed for bubble : ", bubbleUpdated.name + " | " + data.topic);

            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);
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
     * @method _onNameChanged
     * @instance
     * @param {Object} data contains information about bubble new name received
     * @memberof Bubbles
     * @description
     *      Method called when the name has changed for a bubble
     */
    _onNameChanged(data) {
        let that = this;

        this._rest.getBubble(data.bubbleId).then( (bubbleUpdated : any) => {
            that._logger.log("internal", LOG_ID + "(_onNameChanged) Name changed for bubble : ", bubbleUpdated.name + " | " + data.name);

            let bubble = that.addOrUpdateBubbleToCache(bubbleUpdated);

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
     * @param {Object} data contains information about bubble
     * @memberof Bubbles
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
                that._xmpp.sendInitialBubblePresence(bubbleInfo.jid).then(()=> {
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
