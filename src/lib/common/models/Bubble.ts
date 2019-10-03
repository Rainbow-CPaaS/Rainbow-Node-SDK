"use strict";
export{};


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

        public static RoomUserStatus = { "INVITED": "invited", "ACCEPTED": "accepted", "UNSUBSCRIBED": "unsubscribed", "REJECTED": "rejected", "DELETED": "deleted" };
        public autoRegister: any;

        constructor(_id : any = "", _name: any = "", _topic: any = "", _jid: any = "", _creator: any = "", _history: any = "none", _users: any = [], _creationDate: any = "", _visibility: any = "private", _customData: any = {}, _isActive: any = false, _conference: any,
                _disableNotifications : boolean = false, _lastAvatarUpdateDate : any = null, _guestEmails : [] = [], _confEndpoints : [] = [], _activeUsersCounter : number = 0, _autoRegister : boolean = false ) {
        
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
         * @property {Object[]} users The list of users of that Bubble with their status and privilege
         * @instance
         */
        this.users = _users;

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

        this.conference = _conference

        this.disableNotifications = _disableNotifications;
        this.lastAvatarUpdateDate = _lastAvatarUpdateDate;
        this.guestEmails = _guestEmails;
        this.confEndpoints = _confEndpoints;
        this.activeUsersCounter = _activeUsersCounter;

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
            return  user.userId === userId ;
        });
        return user ? user.status : "none";
    }

    updateBubble (data) {
        let that = this;
        if (data) {

            let bubbleproperties = Object.getOwnPropertyNames(that);
            //console.log("updateBubble update Bubble with : ", data["id"]);
            Object.getOwnPropertyNames(data).forEach(
                (val, idx, array) => {
                    //console.log(val + " -> " + data[val]);
                    if (bubbleproperties.find((el) => { return val == el ;})) {
                        //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                        that[val] = data[val];
                    } else {
                        //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble with : ", val, " -> ", data[val]);
                        console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble with : ");
                    }
                });
        }

        return this;
    }

        /**
         * @function
         * @public
         * @name BubbleFactory
         * @description
         * This class is used to create a channel from data object
         */
        public static BubbleFactory() {
//     constructor(_id : any = "", _name: any = "", _topic: any = "", _jid: any = "", _creator: any = "", _history: any = "none", _users: any = [],
//     _creationDate: any = "", _visibility: any = "private", _customData: any = {}, _isActive: any = false, _conference: any) {
            return (data: any): Bubble => {
                
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
                    data.autoRegister
            );
                if (data) {
                    let bubbleproperties = Object.getOwnPropertyNames(bubble);
                    Object.getOwnPropertyNames(data).forEach(
                        (val, idx, array) => {
                            //console.log(val + " -> " + data[val]);
                            if (!bubbleproperties.find((el) => { return val == el ;})) {
                                //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                                console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val);
                            }
                        });
                }

                return bubble;
            };
        }
}


export {Bubble};
module.exports.Bubble = Bubble;
