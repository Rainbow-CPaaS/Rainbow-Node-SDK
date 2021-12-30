"use strict";

import { Contact } from "./Contact";
import {orderByFilter} from "../Utils";
import {constants} from "http2";

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

interface CallbackOneParam<T1, T2 = any> {
    (param1: T1): T2;
}

class InitialPresence {
    private _initPresencePromise : Promise<any>;
    private _initPresencePromiseResolve : CallbackOneParam<any>;
    private _initPresenceAck : boolean;
    private _initPresenceInterval : any;

    constructor() {
        this._initPresencePromise = null;
        this._initPresencePromiseResolve = null;
        this._initPresenceAck = false;
        this._initPresenceInterval = null;
    }

    get initPresencePromise(): Promise<any> {
        return this._initPresencePromise;
    }

    set initPresencePromise(value: Promise<any>) {
        this._initPresencePromise = value;
    }

    get initPresencePromiseResolve(): CallbackOneParam<any> {
        return this._initPresencePromiseResolve;
    }

    set initPresencePromiseResolve(value: CallbackOneParam<any>) {
        this._initPresencePromiseResolve = value;
    }

    get initPresenceAck(): boolean {
        return this._initPresenceAck;
    }

    set initPresenceAck(value: boolean) {
        this._initPresenceAck = value;
    }

    get initPresenceInterval(): any {
        return this._initPresenceInterval;
    }

    set initPresenceInterval(value: any) {
        this._initPresenceInterval = value;
    }

}

/**
 * @class
 * @name Bubble
 * @public
 * @description
 *      This class represents a Bubble. <br>
 *		A bubble is an interaction between several participants based on IM media. A bubble is described by a name and a description.<br>
 *		Like for one-to-one conversation, A conversation within a bubble never ends and all interactions done can be retrieved. <br>
 */
class Bubble {
    get initialPresence(): InitialPresence {
        return this._initialPresence;
    }

    set initialPresence(value: InitialPresence) {
        this._initialPresence = value;
    }
    public id: any;
    public name: any;
    public nameForLogs: string = "";
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
    public avatar: string;
    public organizers: Array<any>;
    public members: Array<any>;
    public containerId: string;
    public containerName: string;
    public status: string = "none";
    private _initialPresence : InitialPresence;


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
     * The privilege of the Contact in the Bubble.
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
     * Behaviour of the Bubble's History 
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
    public tags: Array<any>;

    constructor(_id: any = "", _name: any = "", _topic: any = "", _jid: any = "", _creator: any = "", _history: any = "none", _users: any = [], _creationDate: any = "", _visibility: any = "private", _customData: any = {}, _isActive: any = false, _conference: any,
                _disableNotifications: boolean = false, _lastAvatarUpdateDate: any = null, _guestEmails: [] = [], _confEndpoints: [] = [], _activeUsersCounter: number = 0, _autoRegister: boolean = false, _lastActivityDate, _autoAcceptInvitation: boolean = false, _tags: Array<any> = [], _avatarDomain: string = "", _containerId: string = null, _containerName: string = null) {

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
         * @property {Array<Contact>} users The list of users of that Bubble with their status and privilege. Note : Only 100 users are return by the server. So if there are more than this limit, you have to retrieve them with the method BubblesService::getUsersFromBubble
         * @instance
         */
        this.users = [];
        if (_users) {
            // need to order the users by date
            this.users = orderByFilter(_users, getUserAdditionDate, false, sortUsersByDate);
            // dev-code //
            //console.log("users ordered in bubble (" + this.id + ") : ", this.users);
            // end-dev-code //
        } else {
            this.users = _users;
        }
        
        /**
         * @public
         * @readonly
         * @property {Array<string>} organizers of the bubble, built from users property. It is affected by the limit of 100 (splitted between organizers and members).
         * @instance
         */
        this.organizers = [];
        
        /**
         * @public
         * @readonly
         * @property {Array<string>} members of the bubble, built from users property. It is affected by the limit of 100 (splitted between organizers and members).
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
         * @public
         * @readonly
         * @property {string} isActive When set to true all room users are invited to share their presence. Else they have to wait an event from XMPP server.
         * This flag is reset when the room is inactive for a while (basically 60 days), and set when the first user share his presence.
         * This flag is read-only.
         * @instance
         */        
        this.isActive = _isActive;

        /**
         * @public
         * @readonly
         * @property {string} lastActivityDate The date of the last activity in this bubble
         * @instance
         */
        this.lastActivityDate = _lastActivityDate;

        /**
         * @public
         * @readonly
         * @property {any} conference The conference of the bubble.
         * @instance
         */
        this.conference = _conference

        /**
         * @public
         * @readonly
         * @property {boolean} disableNotifications The enablement notification of the bubble.
         * @instance
         */
        this.disableNotifications = _disableNotifications;

        /**
         * @public
         * @readonly
         * @property {string} lastAvatarUpdateDate The date of the last modification of the avatar of the bubble.
         * @instance
         */
        this.lastAvatarUpdateDate = _lastAvatarUpdateDate;

        /**
         * @public
         * @readonly
         * @property {Array<string>} guestEmails The list of the guests user's emails in the bubble.
         * @instance
         */
        this.guestEmails = _guestEmails;

        /**
         * @public
         * @readonly
         * @property {string} confEndpoints The End point of the conference of the bubble.
         * @instance
         */
        this.confEndpoints = _confEndpoints;

        /**
         * @public
         * @readonly
         * @property {number} activeUsersCounter The count of active users in the bubble.
         * @instance
         */
        this.activeUsersCounter = _activeUsersCounter;

        /**
         * @public
         * @readonly
         * @property {string} avatar This is the URL to download the avatar of the bubble. Note that it is an unavailable url if no avatar has been setted.
         * @instance
         */
        this.avatar = _avatarDomain + "/api/room-avatar/" + _id + "?size=512&rand=" + randomString();
        
        /**
         * @public
         * @readonly
         * @property  {String} autoRegister    A user can create a room and not have to register users. He can share instead a public link also called 'public URL'(<a href="#api-users_rooms_public_link">users public link</a>).
         * <br>According with autoRegister value, if another person uses the link to join the room:
         * <ul>
         * <li>autoRegister = 'unlock':<br>
         *    If this user is not yet registered inside this room, he is automatically included with the status 'accepted' and join the room.</li>
         * <li>autoRegister = 'lock':<br>
         *    If this user is not yet registered inside this room, he can't access to the room. So that he can't join the room.</li>
         * <li>autoRegister = 'unlock_ack':<br>
         *    If this user is not yet registered inside this room, he can't access to the room waiting for the room's owner acknowledgment.</li>
         * </ul>
         * @instance
         */
        this.autoRegister = _autoRegister;

        /**
         * @public
         * @readonly
         * @property {boolean} owner Is the connected user is the owner of the bubble.
         * @instance
         */
        this.owner = false;

        /**
         * @public
         * @readonly
         * @property {boolean} auto acceptation of the bubble.
         * @instance
         */
        this.autoAcceptInvitation = _autoAcceptInvitation;

        /**
         * @public
         * @readonly
         * @property {Array<string>} tags Tags Array about the bubble.
         * @instance
         */
        this.tags = _tags;

        /**
         * @public
         * @property {string} containerId The id of the container in this bubble
         * @readonly
         */
        this.containerId = _containerId;

        /**
         * @public
         * @property {string} containerName The name of the container in this bubble
         * @readonly
         */
        this.containerName = _containerName;

        /**
         * @public
         * @property {string} status The status of the connected user in the bubble ('invited', 'accepted', 'unsubscribed', 'rejected' or 'deleted')
         * @readonly
         */
        this.status = "none";

        /**
         * @public
         * @property {InitialPresence} initialPresence The management of sent initial presence in the bubble of the connected user.
         * @readonly
         */
        this._initialPresence = new InitialPresence();
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

    get getNameForLogs(): string {
        if (!this.nameForLogs && this.name) {
            const temp = this.name.replace(/[^\s](?=.{1,}$)/g, "*");
            this.nameForLogs = this.name.charAt(0) + temp.substr(1);
        }
        return this.nameForLogs;
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
                        // dev-code-console //
                        console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble property : ", val);
                        // end-dev-code-console //
                    }
                });
            if (data.creator) {
                that.ownerContact = await contactsService.getContactById(data.creator, false);
                that.owner = (that.ownerContact.jid === contactsService.userContact.jid);
            }

            if (data.users) {
                data.users.forEach((userData: any) => {
                    const contact = contactsService.getContactById(userData.userId);
                    //if (contact) {                      
                        if (contactsService.isUserContact(contact)) {
                            that.status = userData.status;
                        }
                    //}
                })
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
                data.tags,
                avatarDomain,
                data.containerId, 
                data.containerName
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
                            // dev-code-console //
                            console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val);
                            // end-dev-code-console //
                        }
                    });
                if (data.creator) {
                    //await contactsService.getContactById(data.creator, false).then((result : Contact) => {
                    let result2 : Contact = await contactsService.getContactById(data.creator, false)
                    //console.log("(BubbleFactory) getContactById : ", result);
                    bubble.ownerContact = result2;
                    if (bubble.ownerContact) {
                        if (bubble.ownerContact.jid===contactsService.userContact.jid) {
                            bubble.owner = true;
                        } else {
                            // console.log("(BubbleFactory) OWNER false : " + bubble.ownerContact.jid + " : " + contactsService.userContact.jid);
                            bubble.owner = false;
                        }
                    } else {
                        // dev-code-console //
                        console.log("(BubbleFactory) ownerContact empty.");
                        // end-dev-code-console //
                    }
                }
                if (data.users) {
                    //data.users.forEach(async (userData: any) => {
                    for (const userData of data.users) {
                        const contact = await  contactsService.getContactById(userData.userId);
                        //if (contact) {                      
                        if (contactsService.isUserContact(contact)) {
                            bubble.status = userData.status;
                        }
                        //}
                    }
                    //})
                }
            }

            return bubble;
        };
    }
}


export {Bubble, InitialPresence};
export default {Bubble, InitialPresence};
module.exports = {Bubble, InitialPresence};
