"use strict";

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
     * @method inviteContactToBubble
     * @param {Contact} contact         The contact to invite
     * @param {Bubble} bubble           The bubble
     * @param {boolean} isModerator     True to add a contact as a moderator of the bubble
     * @param {boolean} withInvitation  If true, the contact will receive an invitation and will have to accept it before entering the bubble. False to force the contact directly in the bubble without sending an invitation.
     * @param {string} strReason        The reason of the invitation (optional)
     * @return {Invitation} The invitation sent
     * @description
     *  Create a new bubble and invite a user in
     */
    inviteContactToBubble(contact, bubble, isModerator, withInvitation, reason) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _entering_");

            that._rest.inviteContactToBubble(contact.id, bubble.id, isModerator, withInvitation, reason).then(function(invitation) {
                that._logger.log("debug", LOG_ID + "(inviteContactToBubble) invitation successfull");
                resolve(invitation);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(inviteContactToBubble) error");
                that._logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                reject(err);
            });
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

                console.log("Bubbles", that._bubbles);

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

