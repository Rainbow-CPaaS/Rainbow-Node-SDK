"use strict";

var ErrorCase = require("../common/Error");

const LOG_ID = "GROUPS - ";

/**
 * @class
 * @name Groups
 * @description
 *		This service manages groups which allow to create his own lists of contacts.
 *		<br><br>
 *		The main methods proposed in that module allow to: <br>
 *		- Get all groups of the user
 *		- Create a new group
 *		- Delete an existing group
 *		- Add a contact in a group
 *		- Remove a contact from a group
 */

 class Groups {

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._groups = null;
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
                that._groups = [];
                that._eventEmitter.on("rainbow_groupcreated", that._onGroupCreated.bind(that));
                that._eventEmitter.on("rainbow_groupdeleted", that._onGroupDeleted.bind(that));
                that._eventEmitter.on("rainbow_groupupdated", that._onGroupUpdated.bind(that));
                that._eventEmitter.on("rainbow_useraddedingroup", that._onUserAddedInGroup.bind(that));
                that._eventEmitter.on("rainbow_userremovedfromgroup", that._onUserRemovedFromGroup.bind(that));
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
             } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
             }
         });
     }

     stop() {
         var that = this;

         this._logger.log("debug", LOG_ID + "(stop) _entering_");

         return new Promise(function(resolve, reject) {
             try {
                that._xmpp = null;
                that._rest = null;
                that._groups = null;
                that._eventEmitter.removeListener("rainbow_groupcreated", that._onGroupCreated);
                that._eventEmitter.removeListener("rainbow_groupdeleted", that._onGroupDeleted);
                that._eventEmitter.removeListener("rainbow_groupupdated", that._onGroupUpdated);
                that._eventEmitter.removeListener("rainbow_useraddedingroup", that._onUserAddedInGroup);
                that._eventEmitter.removeListener("rainbow_userremovedfromgroup", that._onUserRemovedFromGroup);
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
     * @method createGroup
     * @instance
     * @param {string} name The name of the group to create
     * @param {string} comment The comment of the group to create
     * @param {boolean} isFavorite If true, the group is flagged as favorite
     * @return {Group} In a promise, the created group
     * @description
     *      Create a new group
     */
     createGroup(name, comment, isFavorite) {
         var that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(createGroup) _entering_");

             if (typeof isFavorite === "undefined") {
                 isFavorite = false;
             }

             if (!name) {
                 that._logger.log("warn", LOG_ID + "(createGroup) bad or empty 'name' parameter", name);
                 that._logger.log("debug", LOG_ID + "(createGroup) _exiting_");
                 reject(ErrorCase.BAD_REQUEST);
                 throw new Error(ErrorCase.BAD_REQUEST.msg);
             } else {

                 that._rest.createGroup(name, comment, isFavorite).then(group => {
                     that._logger.log("debug", LOG_ID + "(createGroup) creation successfull");

                     that._groups.push(group);
                     resolve(group);

                 }, err => {
                     that._logger.log("error", LOG_ID + "(createGroup) error");
                     that._logger.log("debug", LOG_ID + "(createGroup) _exiting_");
                     reject(err);
                 });
             }
         });
     }

     /**
     * @public
     * @method deleteGroup
     * @instance
     * @param {Group} group The group to delete
     * @return {Group} In a promise, the deleted group
     * @memberof Groups
     * @description
     * 		Delete an owned group
      */
     deleteGroup(group) {
         var that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(deleteGroup) _entering_");

             if (!group) {
                 that._logger.log("warn", LOG_ID + "(deleteGroup) bad or empty 'group' parameter", group);
                 that._logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                 reject(ErrorCase.BAD_REQUEST);
                 throw new Error(ErrorCase.BAD_REQUEST.msg);
             } else {
                 that._rest.deleteGroup(group.id).then(function() {
                     var foundIndex = that._groups.findIndex(el => {
                         return el.id === group.id;
                     });

                     if (foundIndex > -1) {
                         let groupDeleted = that._groups.splice(foundIndex, 1);
                         that._logger.log("info", LOG_ID + "(deleteGroup) delete " + groupDeleted.length + " group successfully");
                         that._logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                         resolve(groupDeleted[0]);
                     } else {
                         resolve(null);
                     }
                 }).catch(function(err) {
                     that._logger.log("error", LOG_ID + "(deleteGroup) error");
                     that._logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                     reject(err);
                 });
             }
         });
     }
	 
	/**
     * @public
     * @method updateGroupName
     * @instance
     * @param {Group} group The group to update
     * @param {string} name The new name of the group
     * @return {Group} In a promise, the updated group
     * @memberof Groups
     * @description
     * 		Update the name of a group
     */
     updateGroupName(group, name) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(updateGroupName) _entering_");

            if (!group || !name) {
                if (!group) {
                    that._logger.log("warn", LOG_ID + "(updateGroupName) bad or empty 'group' parameter", group);
                }
                if (!name) {
                    that._logger.log("warn", LOG_ID + "(updateGroupName) bad or empty 'name' parameter", group);
                }
                that._logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else if (group.name === name) {
                that._logger.log("info", LOG_ID + "(updateGroupName) name of group is already defined to " + name + ", nothing is done");
                resolve(group);
            } else {
                that._rest.updateGroupName(group.id, name).then(group => {
                    var foundIndex = that._groups.findIndex(el => {
                        return el.id === group.id;
                    });

                    if (foundIndex > -1) {
                        that._groups[foundIndex].name = group.name;
                        that._logger.log("info", LOG_ID + "(updateGroupName) update name to " + group.name + " of group with id " + group.id + " successfully");
                        that._logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                        resolve(that._groups[foundIndex]);
                    } else {
                        resolve(null);
                    }
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(updateGroupName) error");
                    that._logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                    reject(err);
                });
            }
        });
     }

    /**
     * @private
     * @description
     *      Internal method
     */
     getGroups() {
         let that = this;

         return new Promise(function(resolve, reject) {

            that._logger.log("debug", LOG_ID + "(getGroups) _entering_");
            that._rest.getGroups().then(listOfGroups => {

                var promises = [];
                    
                listOfGroups.forEach(group => {
                    promises.push(new Promise(function(res, rej) {
                        that._rest.getGroup(group.id).then(groupWithUsersInformation => {
                            res(groupWithUsersInformation);
                        }, err => {
                            rej(err);
                        });
                    }));
                });
    
                Promise.all(promises).then(groups => {
                    that._groups = groups;
                    that._logger.log("info", LOG_ID + "(getGroups) get successfully");
                    that._logger.log("debug", LOG_ID + "(getGroups) _exiting_");
                    resolve();
                }, err => {
                    reject(err);
                });
   
            }, err => {
                 that._logger.log("error", LOG_ID + "(getGroups) error", err);
                 that._logger.log("debug", LOG_ID + "(getGroups) _exiting_");
                 reject(err);
            });
         });
     }

     /**
     * @public
     * @method addUserInGroup
     * @instance
     * @param {Contact} contact The user to add in group
     * @param {Group} group The group
     * @return {Group} In a promise, the updated group with the new contact added
     * @memberof Groups
     * @description
     * 		Add a contact in a group
      */
     addUserInGroup(contact, group) {
         let that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(addUserInGroup) _entering_");

             if (!contact) {
                 that._logger.log("warn", LOG_ID + "(addUserInGroup) bad or empty 'contact' parameter", contact);
                 that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                 reject(ErrorCase.BAD_REQUEST);
                 throw new Error(ErrorCase.BAD_REQUEST.msg);
             } else if (!group) {
                 that._logger.log("warn", LOG_ID + "(addUserInGroup) bad or empty 'group' parameter", group);
                 that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                 reject(ErrorCase.BAD_REQUEST);
                 throw new Error(ErrorCase.BAD_REQUEST.msg);
             } else {
                var contactIndex = group.users.findIndex(user => user.id === contact.id);
                 if (contactIndex === -1) {
                     that._rest.addUserInGroup(contact.id, group.id).then(groupUpdated => {
                        
                        that._rest.getGroup(groupUpdated.id).then(groupRetrieved => {
                             var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupRetrieved.id);
                             that._groups[foundIndex] = groupRetrieved;
                             that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                             resolve(groupRetrieved);
                         }, err => {
                             reject(err);
                         });
                     }, err => {
                         that._logger.log("error", LOG_ID + "(addUserInGroup) error");
                         that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                         reject(err);
                     });
                 } else {
                     that._logger.log("warn", LOG_ID + "(addUserInGroup) User is already a member of the group");
                     reject(ErrorCase.BAD_REQUEST);
                     throw new Error(ErrorCase.BAD_REQUEST.msg);
                 }
             }
         });
     }

     /**
     * @public
     * @method removeUserFromGroup
     * @instance
     * @param {Contact} contact The user to remove from the group
     * @param {Group} group The destination group
     * @return {Group} In a promise, the updated group without the removed contact
     * @memberof Groups
     * @description
     *		Remove a contact from a group
      */
     removeUserFromGroup(contact, group) {
         let that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _entering_");

             if (!contact) {
                 that._logger.log("warn", LOG_ID + "(removeUserFromGroup) bad or empty 'contact' parameter", contact);
                 that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                 reject(ErrorCase.BAD_REQUEST);
                 throw new Error(ErrorCase.BAD_REQUEST, msg);
             } else if (!group) {
                 that._logger.log("warn", LOG_ID + "(removeUserFromGroup) bad or empty 'group' parameter", group);
                 that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                 reject(ErrorCase.BAD_REQUEST);
                 throw new Error(ErrorCase.BAD_REQUEST, msg);
             } else {
                 var contactIndex = group.users.findIndex(user => user.id == contact.id);
                 if (contactIndex > -1) {
                     that._rest.removeUserFromGroup(contact.id, group.id).then(group => {
                         that._rest.getGroup(group.id).then(group => {
                             var foundIndex = that._groups.findIndex(groupItem => groupItem.id === group.id);
                             that._groups[foundIndex] = group;
                             that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                             resolve(group);
                         }, err => {
                             reject(err);
                         });
                     }, err => {
                         that._logger.log("error", LOG_ID + "(removeUserFromGroup) error");
                         that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                         reject(err);
                     });
                 } else {
                     that._logger.log("warn", LOG_ID + "(removeUserFromGroup) contact not found in that group");
                     that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                     resolve(group);
                 }
             }
         });
     }

    /**
     * @public
     * @method getAll
     * @instance
     * @return {Array} The list of existing groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
     * @memberof Groups
     * @description
     *  Return the list of existing groups
     */
    getAll() {
        return this._groups;
    }

    /**
     * @public
     * @method getFavoriteGroups
     * @instance
     * @return {Array} The list of favorite groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
     * @memberof Groups
     * @description
     *  Return the list of favorite groups
     */
    getFavoriteGroups() {
        return this._groups.filter((group) => {
            return group.isFavorite;
        });
    }

    /**
     * @public
     * @method getGroupById
     * @instance
     * @param {String} group Id of the group to found
     * @return {Group} The group found if exist or undefined
     * @memberof Groups
     * @description
     *  Return a group by its id
     */
    getGroupById(id) {
        return this._groups.find((group) => {
            return group.id === id;
        });
    }

    /**
     * @public
     * @method getGroupByName
     * @instance
     * @param {String} name Name of the group to found
     * @return {Group} The group found if exist or undefined
     * @memberof Groups
     * @description
     *  Return a group by its id
     */
    getGroupByName(name) {
        return this._groups.find((group) => {
            return group.name === name;
        });
    }

    /**
     * @private
     * @method _onGroupCreated
     * @instance
     * @param {Object} data Contains the groupId of the created group
     * @memberof Groups
     * @description
     *		Method called when a group is created
     */
    _onGroupCreated(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then(groupCreated => {
            that._logger.log("debug", LOG_ID + "(_onGroupCreated) Group created", groupCreated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupCreated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupCreated;
            } else {
                that._groups.push(groupCreated);
            }

            that._eventEmitter.emit("rainbow_ongroupcreated", groupCreated);
        });
    }

    /**
     * @private
     * @method _onGroupDeleted
     * @instance
     * @param {Object} data Contains the groupId of the deleted group
     * @memberof Groups
     * @description
     *		Method called when a group is deleted
     */
    _onGroupDeleted(data) {
        let that = this;

        var foundIndex = that._groups.findIndex(el => {
            return el.id === data.groupId;
        });

        if (foundIndex > -1) {
            let groupDeleted = that._groups.splice(foundIndex, 1);
            that._logger.log("debug", LOG_ID + "(_onGroupDeleted) Group deleted", groupDeleted[0].name);
            that._eventEmitter.emit("rainbow_ongroupdeleted", groupDeleted[0]);
        } else {
            that._eventEmitter.emit("rainbow_ongroupdeleted", null);
        }
    }

    /**
     * @private
     * @method _onGroupUpdated
     * @instance
     * @param {Object} data Contains the groupId of the updated group
     * @memberof Groups
     * @description
     *		Method called when a group is updated (name, comment, isFavorite)
     */
    _onGroupUpdated(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then(groupUpdated => {
            that._logger.log("debug", LOG_ID + "(_onGroupUpdated) Group updated", groupUpdated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            that._eventEmitter.emit("rainbow_ongroupupdated", groupUpdated);
        });
    }

    /**
     * @private
     * @method _onUserAddedInGroup
     * @instance
     * @param {Object} data Contains the groupId and the userId
     * @memberof Groups
     * @description
     *		Method called when a user is added to a group
     */
    _onUserAddedInGroup(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then(groupUpdated => {
            that._logger.log("debug", LOG_ID + "(_onUserAddedInGroup) User added in group", groupUpdated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            var contactAddedIndex = groupUpdated.users.findIndex(userItem => userItem.id === data.userId);
            var contact = groupUpdated.users[contactAddedIndex];

            that._eventEmitter.emit("rainbow_onuseraddedingroup", groupUpdated, contact);
        });
    }

    /**
     * @private
     * @method _onUserRemovedFromGroup
     * @instance
     * @param {Object} data Contains the groupId and the userId
     * @memberof Groups
     * @description
     *		Method called when a user is removed from a group
     */
    _onUserRemovedFromGroup(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then(groupUpdated => {
            that._logger.log("debug", LOG_ID + "(_onUserRemovedFromGroup) User removed from group", groupUpdated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);

            var contact = null;

            if (foundIndex > -1) {
                var contactRemovedIndex = that._groups[foundIndex].users.findIndex(userItem => userItem.id === data.userId);
                contact = that._groups[foundIndex].users[contactRemovedIndex];
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            that._eventEmitter.emit("rainbow_onuserremovedfromgroup", groupUpdated, contact);
        });
    }
 }

 module.exports = Groups;