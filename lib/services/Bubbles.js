"use strict";

var ErrorCase = require("../common/Error");
let Bubble = require("../common/models/Bubble");

const LOG_ID = "BUBBLES - ";

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

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._bubbles = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    start(_xmpp, _rest) {
        var that = this;

        this._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._bubbles = [];
                that._eventEmitter.on("rainbow_invitationreceived", that._onInvitationReceived.bind(that));
                that._eventEmitter.on("rainbow_affiliationchanged", that._onAffiliationChanged.bind(that));
                that._eventEmitter.on("rainbow_ownaffiliationchanged", that._onOwnAffiliationChanged.bind(that));
                that._eventEmitter.on("rainbow_customdatachanged", that._onCustomDataChanged.bind(that));
                that._eventEmitter.on("rainbow_topicchanged", that._onTopicChanged.bind(that));
                that._eventEmitter.on("rainbow_namechanged", that._onNameChanged.bind(that));
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            }
            catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        var that = this;

        this._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._bubbles = null;
                that._eventEmitter.removeListener("rainbow_invitationreceived", that._onInvitationReceived);
                that._eventEmitter.removeListener("rainbow_affiliationchanged", that._onAffiliationChanged);
                that._eventEmitter.removeListener("rainbow_ownaffiliationchanged", that._onOwnAffiliationChanged);
                that._eventEmitter.removeListener("rainbow_customdatachanged", that._onCustomDataChanged);
                that._eventEmitter.removeListener("rainbow_topicchanged", that._onTopicChanged);
                that._eventEmitter.removeListener("rainbow_namechanged", that._onNameChanged);
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method createBubble
     * @instance
     * @param {string} name  The name of the bubble to create
     * @param {string} description  The description of the bubble to create
     * @param {boolean} withHistory If true, a newcomer will have the complete messages history since the beginning of the bubble. False if omitted
     * @return {Bubble} A bubble
     * @memberOf Bubbles
     * @description
     *  Create a new bubble
     */
    createBubble(name, description, withHistory) {

        var that = this;

        return new Promise((resolve, reject) => {

            that._logger.log("debug", LOG_ID + "(createBubble) _entering_");

            if (typeof withHistory === "undefined") {
                withHistory = false;
            }
        
            if (!name) {
                that._logger.log("warn", LOG_ID + "(createBubble) bad or empty 'name' parameter", name);
                that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (!description) {
                that._logger.log("warn", LOG_ID + "(createBubble) bad or empty 'description' parameter", description);
                that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                that._rest.createBubble(name, description, withHistory).then((bubble) => {
                    that._logger.log("debug", LOG_ID + "(createBubble) creation successfull");

                    that._eventEmitter.once("rainbow_onbubblepresencechanged", () => {
                        that._logger.log("debug", LOG_ID + "(createBubble) bubble presence successfull");
                        that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                        that._bubbles.push(Object.assign( new Bubble(), bubble));
                        resolve(bubble);
                    });

                    that._xmpp.sendInitialBubblePresence(bubble.jid);
                    
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createBubble) error");
                    that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                    reject(err);
                });    
            }
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

        this._logger.log("debug", LOG_ID + "(isBubbleClosed) _entering_");
        
        if (!bubble) {
            this._logger.log("warn", LOG_ID + "(isBubbleClosed) bad or empty 'bubble' parameter", bubble);
            this._logger.log("debug", LOG_ID + "(isBubbleClosed) _exiting_");
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        } else {
            var activeUser = bubble.users.find((user) => {
                return user.status === "invited" || user.status === "accepted";
            });

            this._logger.log("debug", LOG_ID + "(isBubbleClosed) _exiting_");
            if (activeUser) {
                return false;
            }
            
            return true;
        }
    }

    /**
     * @public
     * @method deleteBubble
     * @instance
     * @param {Bubble} bubble  The bubble to delete
     * @return {Bubble} The bubble removed
     * @memberof Bubbles
     * @description
     *  Delete a owned bubble. When the owner deletes a bubble, the bubble and its content is no more accessible by all participants.
     */
    deleteBubble(bubble) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(deleteBubble) _entering_");

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(deleteBubble) bad or empty 'bubble' parameter", bubble);
                that._logger.log("debug", LOG_ID + "(deleteBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                that.closeBubble(bubble).then((updatedBubble) => {
                    that._rest.deleteBubble(updatedBubble.id).then(function() {
                        let bubbleRemovedList = that._bubbles.splice(that._bubbles.findIndex(function(el) {
                            return el.id === updatedBubble.id;
                        }), 1);
                        that._logger.log("info", LOG_ID + "(deleteBubble) delete "  + bubbleRemovedList.length + " bubble successfull");
                        that._logger.log("debug", LOG_ID + "(deleteBubble) _exiting_");
                        let bubbleRemoved = bubbleRemovedList.length > 0 ? bubbleRemovedList[0] : null;
                        resolve( Object.assign(bubble, bubbleRemoved));
                    }).catch(function(err) {
                        that._logger.log("error", LOG_ID + "(deleteBubble) error");
                        that._logger.log("debug", LOG_ID + "(deleteBubble) _exiting_");
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });    
            }
        });
    }

    /**
     * @public
     * @method closeBubble
     * @instance
     * @param {Bubble} bubble The Bubble to close
     * @return {Bubble} The bubble closed
     * @memberof Bubbles
     * @description
     *  Close a owned bubble. When the owner closes a bubble, the bubble is archived and only accessible in read only mode for all participants.
     */
    closeBubble(bubble) {
        var that = this;

        let unsubscribeParticipants = (participantsIDList) => {

            return new Promise((resolve, reject) => {

                var participantID = participantsIDList.shift();

                if (participantID) {
                    return that.removeContactFromBubble({id: participantID}, bubble).then( () => {
                        that._logger.log("debug", LOG_ID + "(closeBubble) Participant " + participantID + " unsubscribed");
                        return unsubscribeParticipants(participantsIDList).then(() => {
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        }); 
                    }).catch((err) => {
                        reject(err);
                    });
                }
                resolve();
            });
        };

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(closeBubble) _entering_");

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(closeBubble) bad or empty 'bubble' parameter", bubble);
                that._logger.log("debug", LOG_ID + "(closeBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (that.isBubbleClosed(bubble)) {
                that._logger.log("info", LOG_ID + "(closeBubble) bubble is already closed", bubble);
                resolve(bubble);
            } else {
                var queue = [];
                bubble.users.forEach(function(user) {
                    if (user.userId !== that._rest.userId) {
                        // unsubscribe everyone except the connected user
                        queue.push(user.userId);
                    }
                });

                // unsubscribe the connected user
                queue.push(that._rest.userId);

                unsubscribeParticipants(queue).then(() => {
                    that._logger.log("info", LOG_ID + "(closeBubble) all users have been unsubscribed from bubble. Bubble is closed");

                    that._rest.getBubble(bubble.id).then(function(bubbleUpdated) {
                        // Update the existing local bubble stored
                        var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                        bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                        that._bubbles[foundIndex] = bubbleUpdated;

                        that._logger.log("debug", LOG_ID + "(closeBubble) _exiting_");
                        resolve(bubbleUpdated);
                    });
                }).catch( (err) => {
                    reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @method leaveBubble
     * @instance
     * @param {Bubble} bubble  The bubble to leave
     * @return {Object} The operation result
     * @memberof Bubbles
     * @description
     *  Leave a bubble. If the connected user is a moderator, an other moderator should be still present in order to leave this bubble.
     */
    leaveBubble(bubble) {

        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(leaveBubble) _entering_");

            var otherModerator = null;

            if (bubble) {
                otherModerator = bubble.users.find((user) => {
                    return user.privilege === "moderator" && user.status === "accepted" && user.userId !== that._rest.userId;
                });
            }

            if (!bubble) {
                that._logger.log("warn", LOG_ID + "(leaveBubble) bad or empty 'bubble' parameter", bubble);
                that._logger.log("debug", LOG_ID + "(leaveBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (!otherModerator) {
                that._logger.log("warn", LOG_ID + "(leaveBubble) can't leave a bubble if no other active moderator");
                that._logger.log("debug", LOG_ID + "(leaveBubble) _exiting_");
                reject(ErrorCase.FORBIDDEN);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                that._rest.leaveBubble(bubble.id).then(function(json) {
                    that._logger.log("info", LOG_ID + "(leaveBubble) leave successfull");
                    that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                    that._logger.log("debug", LOG_ID + "(leaveBubble) _exiting_");
                    resolve(json);
                    
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(leaveBubble) error");
                    that._logger.log("debug", LOG_ID + "(leaveBubble) _exiting_");
                    reject(err);
                });
            }
        });
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
     * @return {Bubble} The bubble updated with the new invitation
     * @memberof Bubbles
     * @description
     *  Invite a contact in a bubble
     */
    inviteContactToBubble(contact, bubble, isModerator, withInvitation, reason) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _entering_");

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bad or empty 'contact' parameter", contact);
                that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(inviteContactToBubble) bad or empty 'bubble' parameter", bubble);
                that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
            } else {

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
                    reject(ErrorCase.BAD_REQUEST);
                    throw new Error(ErrorCase.BAD_REQUEST.msg);
                } else {

                    that.removeContactFromBubble(contact, bubble).then((bubbleUpdated) => {
                        return that._rest.inviteContactToBubble(contact.id, bubbleUpdated.id, isModerator, withInvitation, reason);
                    }).then(function() {
                        that._logger.log("info", LOG_ID + "(inviteContactToBubble) invitation successfully sent");

                        return that._rest.getBubble(bubble.id);
                    }).then(function(bubbleReUpdated) {
        
                        // Update the existing local bubble stored
                        var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleReUpdated.id);
                        bubbleReUpdated = Object.assign(that._bubbles[foundIndex], bubbleReUpdated);
                        that._bubbles[foundIndex] = bubbleReUpdated;

                        that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                        resolve(bubbleReUpdated);
                    }).catch(function(err) {
                        that._logger.log("error", LOG_ID + "(inviteContactToBubble) error");
                        that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                        reject(err);
                    });
                }
            }
        });
    }

    /**
     * @public
     * @method promoteContactInBubble
     * @instance
     * @param {Contact} contact         The contact to promote or downgraded
     * @param {Bubble} bubble           The bubble
     * @param {boolean} isModerator     True to promote a contact as a moderator of the bubble, and false to downgrade
     * @return {Bubble} The bubble updated with the modifications
     * @memberof Bubbles
     * @description
     *  Promote or not a contact in a bubble
     *  The logged in user can't update himself. As a result, a 'moderator' can't be downgraded to 'user'. 
     */
    promoteContactInBubble(contact, bubble, isModerator) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(promoteContactInBubble) _entering_");

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bad or empty 'contact' parameter", contact);
                that._logger.log("debug", LOG_ID + "(promoteContactInBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(promoteContactInBubble) bad or empty 'bubble' parameter", bubble);
                that._logger.log("debug", LOG_ID + "(promoteContactInBubble) _exiting_");
            } else {

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
                    reject(ErrorCase.BAD_REQUEST);
                    throw new Error(ErrorCase.BAD_REQUEST.msg);
                } else {

                    that._rest.promoteContactInBubble(contact.id, bubble.id, isModerator)
                    .then(function() {
                        that._logger.log("info", LOG_ID + "(promoteContactInBubble) user privilege successfully sent");

                        return that._rest.getBubble(bubble.id);
                    }).then(function(bubbleReUpdated) {
        
                        // Update the existing local bubble stored
                        var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleReUpdated.id);
                        bubbleReUpdated = Object.assign(that._bubbles[foundIndex], bubbleReUpdated);
                        that._bubbles[foundIndex] = bubbleReUpdated;

                        that._logger.log("debug", LOG_ID + "(promoteContactInBubble) _exiting_");
                        resolve(bubbleReUpdated);
                    }).catch(function(err) {
                        that._logger.log("error", LOG_ID + "(promoteContactInBubble) error");
                        that._logger.log("debug", LOG_ID + "(promoteContactInBubble) _exiting_");
                        reject(err);
                    });
                }
            }
        });
    }

    /**
     * @public
     * @method changeBubbleOwner
     * @instance
     * @param {Contact} contact         The contact to set a new bubble owner
     * @param {Bubble} bubble           The bubble
     * @return {Bubble}                 The bubble updated with the modifications
     * @memberof Bubbles
     * @description
     *  Set a moderator contact as owner of a bubble
     */
    changeBubbleOwner(bubble, contact) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(changeBubbleOwner) _entering_");
        
        if (!contact) {
            that._logger.log("warn", LOG_ID + "(changeBubbleOwner) bad or empty 'contact' parameter", contact);
            that._logger.log("debug", LOG_ID + "(changeBubbleOwner) _exiting_");
            reject(ErrorCase.BAD_REQUEST);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        } else if (!bubble) {
            this._logger.log("debug", LOG_ID + "(changeBubbleOwner) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.changeBubbleOwner(bubble.id, contact.id).then((bubbleData) => {
                that._logger.log("info", LOG_ID + "(changeBubbleOwner) owner set", bubbleData.owner);
                bubble.owner = bubbleData.owner;
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(changeBubbleOwner) error", err);
                that._logger.log("debug", LOG_ID + "(changeBubbleOwner) _exiting_");
                reject(err);
            });
        });
    }

     /**
     * @public
     * @method removeContactFromBubble
     * @instance
     * @param {Contact} contact The contact to remove
     * @param {Bubble} bubble   The destination bubble
     * @return {Object|null} The bubble object or an error object depending on the result
     * @memberof Bubbles
     * @description
     *    Remove a contact from a bubble <br/>
     *    Return a promise
     */
    removeContactFromBubble(contact, bubble) {

        var that = this;

        return new Promise(function(resolve, reject) {

            if (!contact) {
                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bad or empty 'contact' parameter", contact);
                that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (!bubble) {
                that._logger.log("warn", LOG_ID + "(removeContactFromBubble) bad or empty 'bubble' parameter", bubble);
                that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
            
                var contactStatus = "";

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
                            
                            that._rest.getBubble(bubble.id).then((bubbleUpdated) => {
                                // Update the existing local bubble stored
                                let foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                                bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                that._bubbles[foundIndex] = bubbleUpdated;

                                that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                                resolve(bubbleUpdated);
                            });
                        }).catch(function(err) {
                            that._logger.log("error", LOG_ID + "(removeContactFromBubble) error", err);
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                            reject(err);
                        });
                        break;
                    case "accepted":
                        that._rest.unsubscribeContactFromBubble(contact.id, bubble.id).then(function() {
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) removed successfully");

                            that._rest.getBubble(bubble.id).then((bubbleUpdated) => {

                                // Update the existing local bubble stored
                                var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                                bubbleUpdated = Object.assign(that._bubbles[foundIndex], bubbleUpdated);
                                that._bubbles[foundIndex] = bubbleUpdated;
                                
                                that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                                resolve(bubbleUpdated);
                            });
                        }).catch(function(err) {
                            that._logger.log("error", LOG_ID + "(removeContactFromBubble) error", err);
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                            reject(err);
                        });
                        break;
                    default:
                        that._logger.log("warn", LOG_ID + "(removeContactFromBubble) contact not found in that bubble");
                        that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                        resolve(bubble);
                        break;
                }
            }
        });
    }

    /**
     * @private
     * @description
     *      Internal method
     */
    getBubbles() {
        var that = this;
        
        return new Promise(function(resolve, reject) {

            that._logger.log("debug", LOG_ID + "(getBubbles) _entering_");

            that._rest.getBubbles().then(function(listOfBubbles) {
                that._bubbles = listOfBubbles.map( (bubble) => Object.assign( new Bubble(), bubble));
                that._logger.log("info", LOG_ID + "(getBubbles) get successfully");
                
                listOfBubbles.forEach(function(bubble) {

                    var users = bubble.users;
                    users.forEach(function(user) {
                        if (user.userId === that._rest.userId && user.status === "accepted") {
                            that._logger.log("debug", LOG_ID + "(getBubbles) send initial presence to room");
                            that._xmpp.sendInitialBubblePresence(bubble.jid);
                        }
                    });
                });

                that._logger.log("debug", LOG_ID + "(getBubbles) _exiting_");
                resolve();
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(getBubbles) error", err);
                that._logger.log("debug", LOG_ID + "(getBubbles) _exiting_");
                reject(err);
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
     * @method getBubbleById
     * @instance
     * @param {string} id the id of the bubble
     * @return {Bubble} The bubble found or null
     * @memberof Bubbles
     * @description
     *  Get a bubble by its ID
     */
    getBubbleById(id) {

        if (!id) {
            this._logger.log("debug", LOG_ID + "(getBubbleById) bad or empty 'id' parameter", id);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        var bubbleFound = this._bubbles.find(function(bubble) {
            return (bubble.id === id);
        });
        return bubbleFound;
    }

    /**
     * @public
     * @method getBubbleByJid
     * @instance
     * @param {string} jid the JID of the bubble
     * @return {Bubble} The bubble found or null
     * @memberof Bubbles
     * @description
     *  Get a bubble by its JID
     */
    getBubbleByJid(jid) {

        if (!jid) {
            this._logger.log("debug", LOG_ID + "(getBubbleByJid) bad or empty 'jid' parameter", jid);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        var bubbleFound = this._bubbles.find(function(bubble) {
            return (bubble.jid === jid);
        });
        return bubbleFound;
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
     * @return {Bubble} The bubble updated
     * @description
     *  Accept an invitation to join a bubble
     *  Return a Promise
     * @memberof Bubbles
     */
    acceptInvitationToJoinBubble(bubble) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(acceptInvitationToJoinBubble) _entering_");
        
        if (!bubble) {
            this._logger.log("debug", LOG_ID + "(acceptInvitationToJoinBubble) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.acceptInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                that._logger.log("info", LOG_ID + "(acceptInvitationToJoinBubble) invitation accepted", invitationStatus);

                that._rest.getBubble(bubble.id).then((bubbleUpdated) => {
                    // Update the existing local bubble stored
                    var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                    bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                    that._bubbles[foundIndex] = bubbleUpdated;
                    
                    resolve(bubbleUpdated);
                });
                
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(acceptInvitationToJoinBubble) error", err);
                that._logger.log("debug", LOG_ID + "(acceptInvitationToJoinBubble) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method declineInvitationToJoinBubble
     * @instance
     * @param {Bubble} bubble The Bubble to decline
     * @return {Bubble} The bubble updated
     * @description
     *  Decline an invitation to join a bubble
     *  Return a Promise
     * @memberof Bubbles
     */
    declineInvitationToJoinBubble(bubble) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(declineInvitationToJoinBubble) _entering_");
        
        if (!bubble) {
            this._logger.log("debug", LOG_ID + "(declineInvitationToJoinBubble) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.declineInvitationToJoinBubble(bubble.id).then((invitationStatus) => {
                that._logger.log("info", LOG_ID + "(declineInvitationToJoinBubble) invitation declined", invitationStatus);

                that._rest.getBubble(bubble.id).then((bubbleUpdated) => {
                    // Update the existing local bubble stored
                    var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                    bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                    that._bubbles[foundIndex] = bubbleUpdated;

                    resolve(bubbleUpdated);
                });
                
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(declineInvitationToJoinBubble) error", err);
                that._logger.log("debug", LOG_ID + "(declineInvitationToJoinBubble) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method setBubbleCustomData
     * @instance
     * @param {Bubble} bubble The Bubble
     * @param {Object} customData Bubble's custom data area. key/value format. Maximum and size are server dependent
     * @return {Bubble} The bubble updated with the custom data set
     * @description
     *  Modify all custom data at once in a bubble
     *  To erase all custom data, put {} in customData
     *  Return a Promise
     * @memberof Bubbles
     */
    setBubbleCustomData(bubble, customData) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(setBubbleCustomData) _entering_");
        
        if (!bubble) {
            this._logger.log("debug", LOG_ID + "(setBubbleCustomData) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        let custom = {"customData": customData || {} };

        return new Promise((resolve, reject) => {

            that._rest.setBubbleCustomData(bubble.id, custom).then((json) => {
                that._logger.log("info", LOG_ID + "(setBubbleCustomData) customData set", json.customData);
                bubble.customData = json.customData || {};
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleCustomData) error", err);
                that._logger.log("debug", LOG_ID + "(setBubbleCustomData) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @private
     * @method setBubbleVisibilityStatus
     * @instance
     * @param {Bubble} bubble The Bubble
     * @param {string} status Bubble's public/private group visibility for search.  Either "private" (default) or "public"
     * @return {Object} The Bubble full data
     * @description
     *  Set the Bubble's visibility status
     *  Return a Promise
     * @memberof Bubbles
     */
    setBubbleVisibilityStatus(bubble, status) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(setBubbleVisibilityStatus) _entering_");
        
        if (!bubble) {
            this._logger.log("debug", LOG_ID + "(setBubbleVisibilityStatus) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleVisibility(bubble.id, status).then((bubbleData) => {
                that._logger.log("info", LOG_ID + "(setBubbleVisibilityStatus) visibility set", bubbleData);
                resolve(bubbleData);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleVisibilityStatus) error", err);
                that._logger.log("debug", LOG_ID + "(setBubbleVisibilityStatus) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method setBubbleTopic
     * @instance
     * @param {Bubble} bubble The Bubble
     * @param {string} topic Bubble's topic
     * @return {Object} The Bubble full data
     * @description
     *  Set the Bubble's topic
     *  Return a Promise
     * @memberof Bubbles
     */
    setBubbleTopic(bubble, topic) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(setBubbleTopic) _entering_");
        
        if (!bubble) {
            this._logger.log("debug", LOG_ID + "(setBubbleTopic) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleTopic(bubble.id, topic).then((bubbleData) => {
                that._logger.log("info", LOG_ID + "(setBubbleTopic) topic set", bubbleData.topic);
                bubble.topic = bubbleData.topic;
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleTopic) error", err);
                that._logger.log("debug", LOG_ID + "(setBubbleTopic) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method setBubbleName
     * @instance
     * @param {Bubble} bubble The Bubble
     * @param {string} topic Bubble's name
     * @return {Object} The Bubble full data
     * @description
     *  Set the Bubble's name
     *  Return a Promise
     * @memberof Bubbles
     */
    setBubbleName(bubble, name) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(setBubbleName) _entering_");
        
        if (!bubble) {
            this._logger.log("debug", LOG_ID + "(setBubbleName) bad or empty 'bubble' parameter", bubble);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.setBubbleName(bubble.id, name).then((bubbleData) => {
                
                that._logger.log("info", LOG_ID + "(setBubbleName) name set", bubbleData.name);
                bubble.name = bubbleData.name;
                resolve(bubble);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setBubbleName) error", err);
                that._logger.log("debug", LOG_ID + "(setBubbleName) _exiting_");
                reject(err);
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

        that._logger.log("debug", LOG_ID + "(_onInvitationReceived) enter");

        this._rest.getBubble(invitation.bubbleId).then( (bubbleUpdated) => {
            that._logger.log("debug", LOG_ID + "(_onInvitationReceived) invitation received from bubble", bubbleUpdated.name);

            // Store the new bubble
            var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            }

            that._eventEmitter.emit("rainbow_invitationdetailsreceived", bubbleUpdated);
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

        that._logger.log("debug", LOG_ID + "(_onAffiliationChanged) enter");

        this._rest.getBubble(affiliation.bubbleId).then( (bubbleUpdated) => {
            that._logger.log("debug", LOG_ID + "(_onAffiliationChanged) user affiliation changed for bubble", bubbleUpdated.name + " | " + affiliation.status);

            // Update the existing local bubble stored
            var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            }

            that._eventEmitter.emit("rainbow_affiliationdetailschanged", bubbleUpdated);
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
        
        that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) enter", affiliation);

        if (affiliation.status !== "deleted") {
            this._rest.getBubble(affiliation.bubbleId).then( (bubbleUpdated) => {
                that._logger.log("debug", LOG_ID + "(_onOwnAffiliationChanged) own affiliation changed for bubble", bubbleUpdated.name + " | " + affiliation.status);
    
                // Update the existing local bubble stored
                var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
                if (foundIndex > -1) {
                    bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                    that._bubbles[foundIndex] = bubbleUpdated;
                    if (affiliation.status === "accepted") {
                        that._xmpp.sendInitialBubblePresence(bubbleUpdated.jid);
                    }
                    else if (affiliation.status === "unsubscribed") {
                        that._xmpp.sendUnavailableBubblePresence(bubbleUpdated.jid);
                    }
                }
                else {
                    bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                    that._bubbles.push(bubbleUpdated);
                    // New bubble, send initial presence
                    that._xmpp.sendInitialBubblePresence(bubbleUpdated.jid);
                }
    
                that._eventEmitter.emit("rainbow_ownaffiliationdetailschanged", bubbleUpdated);
            });
        }
        else {
            // remove it
            let bubbleRemoved = that._bubbles.splice(that._bubbles.findIndex(function(el) {
                return el.id === affiliation.bubbleId;
            }), 1);

            if (bubbleRemoved.length > 0) {
                that._eventEmitter.emit("rainbow_ownaffiliationdetailschanged", bubbleRemoved[0]);
            } else {
                that._eventEmitter.emit("rainbow_ownaffiliationdetailschanged", null);
            }
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

        this._rest.getBubble(data.bubbleId).then( (bubbleUpdated) => {

            that._logger.log("debug", LOG_ID + "(_onCustomDataChanged) Custom data changed for bubble", bubbleUpdated.name + " | " + data.customData);

            // Update the existing local bubble stored
            var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            }

            that._eventEmitter.emit("rainbow_bubblecustomDatachanged", bubbleUpdated);
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

        this._rest.getBubble(data.bubbleId).then( (bubbleUpdated) => {
            that._logger.log("debug", LOG_ID + "(_onTopicChanged) Topic changed for bubble", bubbleUpdated.name + " | " + data.topic);

            // Update the existing local bubble stored
            var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            }

            that._eventEmitter.emit("rainbow_bubbletopicchanged", bubbleUpdated);
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

        this._rest.getBubble(data.bubbleId).then( (bubbleUpdated) => {
            that._logger.log("debug", LOG_ID + "(_onNameChanged) Name changed for bubble", bubbleUpdated.name + " | " + data.name);

            // Update the existing local bubble stored
            var foundIndex = that._bubbles.findIndex(bubbleItem => bubbleItem.id === bubbleUpdated.id);
            if (foundIndex > -1) {
                bubbleUpdated = Object.assign( that._bubbles[foundIndex], bubbleUpdated);
                that._bubbles[foundIndex] = bubbleUpdated;
            }
            else {
                bubbleUpdated = Object.assign( new Bubble(), bubbleUpdated);
                that._bubbles.push(bubbleUpdated);
            }

            that._eventEmitter.emit("rainbow_bubblenamechanged", bubbleUpdated);
        });
    }
}

module.exports = Bubbles;
