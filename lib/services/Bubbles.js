"use strict";

var Error = require('../common/Error');

const LOG_ID = 'BUBBLES - ';

class Bubbles {

    constructor(_eventEmitter, _logger) {
        var that = this;

        this._xmpp = null;
        this._rest = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._bubbles = [];
    }

    start(_xmpp, _rest) {
        this._logger.log("debug", LOG_ID + "(start) _entering_");
        this._xmpp = _xmpp;
        this._rest = _rest;
        this._logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    /**
     * @public
     * @method createBubble
     * @param {string} strName  The name of the bubble to create
     * @param {string} strDescription  The description of the bubble to create
     * @param {string} strReason    The reason invitation
     * @param {Contact} contact     The contact to invite
     * @return {Bubble} A bubble
     * @description
     *  Create a new bubble and invite a user in
     */
    createBubble(strName, strDescription) {

        var that = this;

        if(!strName) {
            this.logger.log("debug", LOG_ID + "(createBubble) bad 'strName' parameter", strName);
            return Error.BAD_REQUEST;
        }

        if(!strDescription) {
            this.logger.log("debug", LOG_ID + "(createBubble) bad 'strDescription' parameter", strDescription);
            return Error.BAD_REQUEST;
        }

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(createBubble) _entering_");

            that._rest.createBubble(strName, strDescription).then(function(bubble) {
                that._logger.log("debug", LOG_ID + "(createBubble) creation successfull");

                that._eventEmitter.once('rainbow_onbubblepresencechanged', function() {
                    that._logger.log("debug", LOG_ID + "(createBubble) bubble presence successfull");
                    that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                    that._bubbles.push(bubble);
                    resolve(bubble);
                });

                that._xmpp.sendInitialBubblePresence(bubble.jid);
                
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(createBubble) error");
                that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method deleteBubble
     * @param {Bubble} bubble  The bubble to delete
     * @return {Error.OK} 
     * @description
     *  Delete a bubble
     */
    deleteBubble(bubble) {
        var that = this;

        if(!bubble) {
            this.logger.log("debug", LOG_ID + "(deleteBubble) bad 'bubble' parameter", bubble);
            return Error.BAD_REQUEST;
        }

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(deleteBubble) _entering_");

            that._rest.deleteBubble(bubble.id).then(function(json) {
                that._bubbles.splice(that._bubbles.findIndex(function(el) {
                    return el.id === bubble.id;                
                }), 1);
                that._logger.log("debug", LOG_ID + "(deleteBubble) delete successfull");
                resolve(Error.OK);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(deleteBubble) error");
                that._logger.log("debug", LOG_ID + "(deleteBubble) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method leaveBubble
     * @param {Bubble} bubble  The bubble to leave
     * @return {Object} The operation result
     * @description
     *  Leave a bubble. Only works if at least an other user is a moderator of this bubble
     */
    leaveBubble(bubble) {
        var that = this;

        if(!bubble) {
            this.logger.log("debug", LOG_ID + "(leaveBubble) bad 'bubble' parameter", bubble);
            return Error.BAD_REQUEST;
        }

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(leaveBubble) _entering_");

            that._rest.leaveBubble(bubble.id).then(function(json) {
                that._logger.log("debug", LOG_ID + "(leaveBubble) creation successfull");

                that._xmpp.sendUnavailableBubblePresence(bubble.jid);
                resolve(json);
                
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(createBubble) error");
                that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method inviteContactToBubble
     * @param {Contact} contact         The contact to invite
     * @param {Bubble} bubble           The bubble
     * @param {boolean} boolIsModerator     True to add a contact as a moderator of the bubble
     * @param {boolean} boolWithInvitation  If true, the contact will receive an invitation and will have to accept it before entering the bubble. False to force the contact directly in the bubble without sending an invitation.
     * @param {string} strReason        The reason of the invitation (optional)
     * @return {Invitation} The invitation sent
     * @description
     *  Create a new bubble and invite a user in
     */
    inviteContactToBubble(contact, bubble, boolIsModerator, boolWithInvitation, strReason) {
        var that = this;

        if(!contact) {
            this.logger.log("debug", LOG_ID + "(inviteContactToBubble) bad 'contact' parameter", contact);
            return Error.BAD_REQUEST;
        }

        if(!bubble) {
            this.logger.log("debug", LOG_ID + "(inviteContactToBubble) bad 'bubble' parameter", bubble);
            return Error.BAD_REQUEST;
        }

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _entering_");

            that._rest.inviteContactToBubble(contact.id, bubble.id, boolIsModerator, boolWithInvitation, strReason).then(function(invitation) {
                that._logger.log("debug", LOG_ID + "(inviteContactToBubble) invitation successfull");
                resolve(invitation);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(inviteContactToBubble) error");
                that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                reject(err);
            });
        });
    }

     /**
     * @public
     * @method
     * @instance
     * @description
     *    Remove a contact from a bubble <br/>
     *    Return a promise
     * @param {Contact} contact The contact to remove
     * @param {Bubble} bubble   The destination bubble
     * @return {Object|null} The bubble object or an error object depending on the result
     */
    removeContactFromBubble(contact, bubble) {

        var that = this;

        return new Promise(function(resolve, reject) {

            if (!contact) {
                this.logger.log("debug", LOG_ID + "(removeContactFromBubble) bad 'contact' parameter", contact);
                reject(Error.BAD_REQUEST);
            } else if (!bubble) {
                this.logger.log("debug", LOG_ID + "(removeContactFromBubble) bad 'bubble' parameter", bubble);
                reject(Error.BAD_REQUEST);
            } else {
            
                var contactStatus = "";

                bubble.users.forEach(function(user) {
                    if (user.userId === contact.id) {
                        contactStatus = user.status;
                    }
                });

                switch (contactStatus) {
                    case "invited":
                        that._rest.removeInvitationOfContactToBubble(contact.id, bubble.id).then(function(updatedBubble) {
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) successfully");
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                            resolve(updatedBubble);
                        }).catch(function(err) {
                            that._logger.log("error", LOG_ID + "(removeContactFromBubble) error", err);
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                            reject(err);
                        });
                        break;
                    case "accepted":
                        that._rest.unsubscribeContactFromBubble(contact.id, bubble.id).then(function(updatedBubble) {
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) successfully");
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                            resolve(updatedBubble);
                        }).catch(function(err) {
                            that._logger.log("error", LOG_ID + "(removeContactFromBubble) error", err);
                            that._logger.log("debug", LOG_ID + "(removeContactFromBubble) _exiting_");
                            reject(err);
                        });
                        break;
                    default:
                        this.logger.log("warning", LOG_ID + "(removeContactFromBubble) contact not found in that bubble");
                        resolve(bubble);
                        break;
                }

            }

        });
    }
    
    getBubbles() {
        var that = this;

        this._logger.log("debug", LOG_ID + "(getBubbles) _entering_");
        return new Promise(function(resolve, reject) {
            that._rest.getBubbles().then(function(listOfBubbles) {
                that._bubbles = listOfBubbles;
                that._logger.log("debug", LOG_ID + "(getBubbles) successfully");
                
                listOfBubbles.forEach(function(bubble) {
                    var users = bubble.users;
                    users.forEach(function(user) {
                        if(user.userId === that._rest.userId && user.status === "accepted") {
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
     * @return {Bubble[]} The list of existing bubbles
     * @description
     *  Return the list of existing bubbles
     */
    getAll() {
        return this._bubbles;
    }
    
    /**
     * @public
     * @method getBubbleById
     * @param {string} strId the id of the bubble
     * @return {Bubble} The bubble found or null
     * @description
     *  Get a bubble by its ID
     */
    getBubbleById(strId) {

        if(!strId) {
            this.logger.log("debug", LOG_ID + "(getBubbleById) bad 'strId' parameter", strId);
            return Error.BAD_REQUEST;
        }

        var bubbleFound = this._bubbles.find(function(bubble) {
            return (bubble.id === strId);
        });
        return bubbleFound;
    }

    /**
     * @public
     * @method getBubbleByJid
     * @param {string} strJid the JID of the bubble
     * @return {Bubble} The bubble found or null
     * @description
     *  Get a bubble by its JID
     */
    getBubbleByJid(strJid) {

        if(!strJid) {
            this.logger.log("debug", LOG_ID + "(getBubbleByJid) bad 'strJid' parameter", strJid);
            return Error.BAD_REQUEST;
        }

        var bubbleFound = this._bubbles.find(function(bubble) {
            return (bubble.jid === strJid);
        });
        return bubbleFound;
    }


    stop() {
        this._xmpp = null;
        this._rest = null;
    }

}

module.exports = Bubbles;

