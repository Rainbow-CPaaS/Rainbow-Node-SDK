"use strict";

import { Contact } from "./Contact";
import {orderByFilter} from "../Utils";

export{};

function  randomString(length = 10) {
    let string = "";
    let rnd;
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    while (length > 0) {
        rnd = Math.floor(Math.random() * chars.length);
        string += chars.charAt(rnd);
        length--;
    }
    return string;
}

function getUserAdditionDate(user) {
    if (user && user.additionDate) {
        try {
            return new Date(user.additionDate).getTime();
        } catch(err){
            console.error("Error while getUserAdditionDate!!!");
        }
    }

    return 0;
}

function sortUsersByDate (userADate, userBDate) {
    let res = 0;
    if (userADate && userBDate) {
        if (userADate <  userBDate) {
            res = -1;
        }
        if (userADate >  userBDate) {
            res = 1;
        }
    }

    // dev-code //
    //res = 1;
    // end-dev-code //

    return res;
}

/**
 * @class
 * @name Bubble
 * @description
 *      This class represents a Bubble. <br>
 *		A bubble is an interaction between several participants based on IM media. A bubble is described by a name and a description.<br>
 *		Like for one-to-one conversation, A conversation within a bubble never ends and all interactions done can be retrieved. <br>
 */
class Bubble {
        public id: any;
        public name: any;
        public topic: any;
        public jid: any;
        public creator: any;
        public history: any;
        public users: any;
        public creationDate: any;
        public visibility: any;
        public customData: any;
        public isActive: any;
        public conference: any;
        public disableNotifications: boolean;
        public lastAvatarUpdateDate: null;
        public guestEmails: any[];
        public confEndpoints: [];
        public activeUsersCounter: number;
        public avatar: String;
        public organizers: Array<any>;
        public members: Array<any>;


    public static RoomUserStatus = {
            "INVITED": "invited",
            "ACCEPTED": "accepted",
            "UNSUBSCRIBED": "unsubscribed",
            "REJECTED": "rejected",
            "DELETED": "deleted"
        };
        public autoRegister: any;
        public lastActivityDate: any;

        /**
         * @private
         * @readonly
         * @enum {number}
         */
        public static Type = {
            "PRIVATE": 0,
            "PUBLIC": 1
        };

        /**
         * @public
         * @readonly
         * @enum {String}
         */
        public static Privilege = {
            /** User level */
            "USER": "user",
            /** Moderator level */
            "MODERATOR": "moderator",
            /** Guest level */
            "GUEST": "guest"
        };

        /**
         * @public
         * @readonly
         * @enum {String}
         */
        public static History = {
            /** Full bubble history is accessible for newcomers */
            "ALL": "all",
            /** No history is accessible for newcomers, only new messages posted */
            "NONE": "none"
        };

        /**
         * @description the creator (owner ) of the bubble.
         */
        public ownerContact: Contact;
        public owner: boolean;
        public autoAcceptInvitation: boolean;

        constructor(_id: any = "", _name: any = "", _topic: any = "", _jid: any = "", _creator: any = "", _history: any = "none", _users: any = [], _creationDate: any = "", _visibility: any = "private", _customData: any = {}, _isActive: any = false, _conference: any,
                    _disableNotifications: boolean = false, _lastAvatarUpdateDate: any = null, _guestEmails: [] = [], _confEndpoints: [] = [], _activeUsersCounter: number = 0, _autoRegister: boolean = false, _lastActivityDate, _avatarDomain: String = "", autoAcceptInvitation: boolean = false) {

            /**
             * @public
             * @readonly
             * @property {string} id The ID of the Bubble
             * @instance
             */
            this.id = _id;

            /**
             * @public
             * @readonly
             * @property {string} name The name of the Bubble
             * @instance
             */
            this.name = _name;

            /**
             * @public
             * @readonly
             * @property {string} topic The topic of the Bubble
             * @instance
             */
            this.topic = _topic;

            /**
             * @public
             * @readonly
             * @property {string} jid The JID of the Bubble
             * @instance
             */
            this.jid = _jid;

            /**
             * @public
             * @readonly
             * @property {string} creator The ID of the creator of the Bubble
             * @instance
             */
            this.creator = _creator;

            /**
             * @public
             * @readonly
             * @property {string} history The type of history the bubble supports. Can be 'none' (no history) or 'full' (Full bubble history is accessible for newcomers)
             * @instance
             */
            this.history = _history;

            /**
             * @public
             * @readonly
             * @property {Object[]} users The list of users of that Bubble with their status and privilege. Note : Only 100 users are return by the server. So if there are more than this limit, you have to retrieve them with the method BubblesService::getUsersFromBubble
             * @instance
             */
            if (_users) {
                // need to order the users by date
                this.users = orderByFilter(_users, getUserAdditionDate, false, sortUsersByDate);
                // dev-code //
                console.log("users ordered in bubble (" + this.id + ") : ", this.users);
                // end-dev-code //
            } else {
                this.users = _users;
            }

            /**
             * @public
             * @readonly
             * @property {string} organizers of the bubble, built from users property. It is affected by the limit of 100 (splitted between organizers and members).
             * @instance
             */
            this.organizers = [];
            /**
             * @public
             * @readonly
             * @property {string} members of the bubble, built from users property. It is affected by the limit of 100 (splitted between organizers and members).
             * @instance
             */
            this.members = [];


            /**
             * @public
             * @readonly
             * @property {string} creationDate The creation date of the Bubble
             * @instance
             */
            this.creationDate = _creationDate;

            /**
             * @public
             * @readonly
             * @property {string} visibility The visibility of the Bubble. Can be private (only visible for members) or public
             * @instance
             */
            this.visibility = _visibility;

            /**
             * @public
             * @readonly
             * @property {Object} customData The custom data attached to that Bubble. List of pairs (key/value).
             * @instance
             */
            this.customData = _customData;

            /**
             *
             * @type {boolean}
             */
            this.isActive = _isActive;

            /**
             * @private
             * @property {string} lastActivityDate The date of the last activity in this bubble
             * @readonly
             */
            this.lastActivityDate = _lastActivityDate;

            this.conference = _conference

            this.disableNotifications = _disableNotifications;
            this.lastAvatarUpdateDate = _lastAvatarUpdateDate;
            this.guestEmails = _guestEmails;
            this.confEndpoints = _confEndpoints;
            this.activeUsersCounter = _activeUsersCounter;

            /**
             * @property {string} avatar This is the URL to download the avatar of the bubble. Note that it is an unavailable url if no avatar has been setted.
             */
            this.avatar = _avatarDomain + "/api/room-avatar/" + _id + "?size=512&rand=" + randomString();
            /**
             * @public
             * @readonly
             * @property  {String} autoRegister    A user can create a room and not have to register users. He can share instead a public link also called 'public URL'(<a href="#api-users_rooms_public_link">users public link</a>).
             * </br>According with autoRegister value, if another person uses the link to join the room:
             * <ul>
             * <li>autoRegister = 'unlock':</br>
             *    If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room.</li>
             * <li>autoRegister = 'lock':</br>
             *    If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room.</li>
             * <li>autoRegister = 'unlock_ack':</br>
             *    If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment.</li>
             * </ul>
             * @instance
             */
            this.autoRegister = _autoRegister;

            this.owner = false;

            /**
             * @description auto acceptation of the bubble.
             */
            this.autoAcceptInvitation = autoAcceptInvitation;
        }

        /**
         * Method helper to know if room is a meeting
         * @private
         */
        isMeetingBubble() {
            if (this.conference && this.conference.mediaType === "pstnAudio") {
                return true;
            }
            return false;
        }

        getStatusForUser(userId) {
            let that = this;
            let user = that.users.find((user) => {
                return user.userId === userId;
            });
            return user ? user.status : "none";
        }

        setUsers(_users) {
            if (_users) {
                // need to order the users by date
                this.users = orderByFilter(_users, getUserAdditionDate, false, sortUsersByDate);
                // dev-code //
                // console.log("users ordered in bubble (" + this.id + ") : ", this.users);
                // end-dev-code //
            } else {
                this.users = _users;
            }
        }

        async updateBubble(data, contactsService) {
            let that = this;
            if (data) {

                let bubbleproperties = Object.getOwnPropertyNames(that);
                //console.log("updateBubble update Bubble with : ", data["id"]);
                Object.getOwnPropertyNames(data).forEach(
                    (val, idx, array) => {
                        //console.log(val + " -> " + data[val]);
                        if (bubbleproperties.find((el) => {
                            return val == el;
                        })) {
                            // dev-code //
                            // console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                            // end-dev-code //
                            if (val === "users") {
                                // dev-code //
                                // console.log("update users in bubble : ", data[val]);
                                // end-dev-code //
                                that.setUsers(data[val]);
                            } else {
                                that[val] = data[val];
                            }
                        } else {
                            //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble with : ", val, " -> ", data[val]);
                            console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble property : ", val);
                        }
                    });
                if (data.creator) {
                    that.ownerContact = await contactsService.getContactById(data.creator, false);
                    that.owner = (that.ownerContact.jid === contactsService.userContact.jid);
                }
            }

            return this;
        }

        /**
         * @function
         * @public
         * @name BubbleFactory
         * @description
         * This class is used to create a bubble from data object
         */
        public static BubbleFactory(avatarDomain, contactsService) {
//     constructor(_id : any = "", _name: any = "", _topic: any = "", _jid: any = "", _creator: any = "", _history: any = "none", _users: any = [],
//     _creationDate: any = "", _visibility: any = "private", _customData: any = {}, _isActive: any = false, _conference: any) {
            return async (data: any): Promise<Bubble> => {

                let bubble = new Bubble(
                    data.id,
                    data.name,
                    data.topic,
                    data.jid,
                    data.creator,
                    data.history,
                    data.users,
                    data.creationDate,
                    data.visibility,
                    data.customData,
                    data.isActive,
                    data.conference,
                    data.disableNotifications,
                    data.lastAvatarUpdateDate,
                    data.guestEmails,
                    data.confEndpoints,
                    data.activeUsersCounter,
                    data.autoRegister,
                    data.lastActivityDate,
                    data.autoAcceptInvitation,
                    avatarDomain
                );
                if (data) {
                    let bubbleproperties = Object.getOwnPropertyNames(bubble);
                    Object.getOwnPropertyNames(data).forEach(
                        (val, idx, array) => {
                            //console.log(val + " -> " + data[val]);
                            if (!bubbleproperties.find((el) => {
                                return val == el;
                            })) {
                                //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                                console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val);
                            }
                        });
                    if (data.creator) {
                        await contactsService.getContactById(data.creator, false).then((result) => {
                            //console.log("(BubbleFactory) getContactById : ", result);
                            bubble.ownerContact = result;
                            if (bubble.ownerContact) {
                                if (bubble.ownerContact.jid === contactsService.userContact.jid) {
                                    bubble.owner = true;
                                } else {
                                    // console.log("(BubbleFactory) OWNER false : " + bubble.ownerContact.jid + " : " + contactsService.userContact.jid);
                                    bubble.owner = false;
                                }
                            } else {
                                console.log("(BubbleFactory) ownerContact empty.");
                            }
                        });
                    }
                }

                return bubble;
            };
        }
    }


export {Bubble};
module.exports = {Bubble};
