"use strict";
import {GenericService} from "./GenericService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {EventEmitter} from "events";
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "GROUPS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name GroupsService
 * @version SDKVERSION
 * @public
 * @description
 *		This service manages groups which allow to create his own lists of contacts. <br>
 *		<br><br>
 *		The main methods proposed in that module allow to: <br>
 *		- Get all groups of the user <br>
 *		- Create a new group <br>
 *		- Delete an existing group <br>
 *		- Add a contact in a group <br>
 *		- Remove a contact from a group <br>
 */
 class GroupsService extends GenericService{
    private _groups: any;

    static getClassName(){ return 'GroupsService'; }
    getClassName(){ return GroupsService.getClassName(); }

    constructor(_core:Core, _eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._groups = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        this._core = _core;

        this._eventEmitter.on("evt_internal_hdle_groupcreated", this._onGroupCreated.bind(this));
        this._eventEmitter.on("evt_internal_hdle_groupdeleted", this._onGroupDeleted.bind(this));
        this._eventEmitter.on("evt_internal_hdle_groupupdated", this._onGroupUpdated.bind(this));
        this._eventEmitter.on("evt_internal_hdle_useraddedingroup", this._onUserAddedInGroup.bind(this));
        this._eventEmitter.on("evt_internal_hdle_userremovedfromgroup", this._onUserRemovedFromGroup.bind(this));
    }

     start(_options) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
         let that = this;
         that.initStartDate();
         return new Promise(function(resolve, reject) {
             try {
                 that._xmpp = that._core._xmpp;
                 that._rest = that._core._rest;
                 that._options = _options;
                 that._s2s = that._core._s2s;
                 that._useXMPP = that._options.useXMPP;
                 that._useS2S = that._options.useS2S;
                 that._groups = [];
/*
                 that._eventEmitter.removeListener("evt_internal_groupcreated", that._onGroupCreated);
                 that._eventEmitter.removeListener("evt_internal_groupdeleted", that._onGroupDeleted);
                 that._eventEmitter.removeListener("evt_internal_groupupdated", that._onGroupUpdated);
                 that._eventEmitter.removeListener("evt_internal_useraddedingroup", that._onUserAddedInGroup);
                 that._eventEmitter.removeListener("evt_internal_userremovedfromgroup", that._onUserRemovedFromGroup);

                 that._eventEmitter.on("evt_internal_groupcreated", that._onGroupCreated.bind(that));
                that._eventEmitter.on("evt_internal_groupdeleted", that._onGroupDeleted.bind(that));
                that._eventEmitter.on("evt_internal_groupupdated", that._onGroupUpdated.bind(that));
                that._eventEmitter.on("evt_internal_useraddedingroup", that._onUserAddedInGroup.bind(that));
                that._eventEmitter.on("evt_internal_userremovedfromgroup", that._onUserRemovedFromGroup.bind(that));
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
         return new Promise(function(resolve, reject) {
             try {
                that._xmpp = null;
                that._rest = null;
                that._groups = null;
/*
                that._eventEmitter.removeListener("evt_internal_groupcreated", that._onGroupCreated);
                that._eventEmitter.removeListener("evt_internal_groupdeleted", that._onGroupDeleted);
                that._eventEmitter.removeListener("evt_internal_groupupdated", that._onGroupUpdated);
                that._eventEmitter.removeListener("evt_internal_useraddedingroup", that._onUserAddedInGroup);
                that._eventEmitter.removeListener("evt_internal_userremovedfromgroup", that._onUserRemovedFromGroup);
*/
                 that.setStopped ();
                 resolve(undefined);
             } catch (err) {
                 return reject(err);
             }
         });
     }

    async init (useRestAtStartup : boolean) {
        let that = this;
        if (useRestAtStartup) {
            await that.getGroups().then((result) => {
                that.setInitialized();
            }).catch(() => {
                that.setInitialized();
            });
        } else {
            that.setInitialized();
        } 
    }

    //region Groups MANAGEMENT

    /**
     * @public
     * @nodered true
     * @method createGroup
     * @instance
     * @param {string} name The name of the group to create
     * @param {string} comment The comment of the group to create
     * @param {boolean} isFavorite If true, the group is flagged as favorite
     * @description
     *      Create a new group <br>
     * @async
     * @category Groups MANAGEMENT
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Group} - Created group object or an error object depending on the result
     * @category async
     */
     async createGroup(name, comment, isFavorite) {
         let that = this;

         return new Promise(function(resolve, reject) {
             if (typeof isFavorite === "undefined") {
                 isFavorite = false;
             }

             if (!name) {
                 that._logger.log("warn", LOG_ID + "(createGroup) bad or empty 'name' parameter");
                 that._logger.log("internalerror", LOG_ID + "(createGroup) bad or empty 'name' parameter : ", name);
                 return reject(ErrorManager.getErrorManager().BAD_REQUEST);
             }

            that._rest.createGroup(name, comment, isFavorite).then(group => {
                that._logger.log("debug", LOG_ID + "(createGroup) creation successfull");

                that._groups.push(group);
                resolve(group);

            }, err => {
                that._logger.log("error", LOG_ID + "(createGroup) error");
                return reject(err);
            });
         });
     }

     /**
      * @public
      * @nodered true
      * @method deleteGroup
      * @instance
      * @param {Object} group The group to delete
      * @description
      *    Delete an owned group <br>
      * @async
      * @category Groups MANAGEMENT
      * @return {Promise<Object, ErrorManager>} The result
      * @fulfil {Group} - Deleted group object or an error object depending on the result
      * @category async
      */
     async deleteGroup(group) {
         let that = this;

         return new Promise(function(resolve, reject) {
             if (!group) {
                 that._logger.log("warn", LOG_ID + "(deleteGroup) bad or empty 'group' parameter.");
                 that._logger.log("internalerror", LOG_ID + "(deleteGroup) bad or empty 'group' parameter : ", group);
                 return reject(ErrorManager.getErrorManager().BAD_REQUEST);
             }
            that._rest.deleteGroup(group.id).then(function() {
                let foundIndex = that._groups.findIndex(el => {
                    return el.id === group.id;
                });

                if (foundIndex > -1) {
                    let groupDeleted = that._groups.splice(foundIndex, 1);
                    that._logger.log("info", LOG_ID + "(deleteGroup) delete " + groupDeleted.length + " group successfully");
                    resolve(groupDeleted[0]);
                } else {
                    resolve(null);
                }
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(deleteGroup) error");
                return reject(err);
            });
         });
     }

    /**
     * @public
     * @nodered true
     * @method deleteAllGroups
     * @instance
     * @async
     * @category Groups MANAGEMENT
     * @description
     *    Delete all existing owned groups <br>
     *    Return a promise <br>
     * @return {Object} Nothing or an error object depending on the result
     */
    async deleteAllGroups() {
         let that = this;

        return new Promise((resolve, reject) => {
            const promiseQueue = [];

            const groups = that.getAll();

            if (!Array.isArray(groups) || (groups && groups.length === 0)) {
                return resolve({
                    code: 0,
                    label: 'OK'
                });
            }

            groups.forEach(group => {
                promiseQueue.push(that.deleteGroup(group).catch (()=> {}));
            });

            Promise.all(promiseQueue)
                .then(() => {
                    that._logger.log("info", LOG_ID + "[deleteAllGroups] :: All groups deleted successfully");
                    return resolve({
                        code: 0,
                        label: 'OK'
                    });
                })
                .catch(err => {
                    that._logger.log("error", LOG_ID + "[deleteAllGroups] :: Error when deleting all groups");
                    return reject(err);
                });
        });
    }

    /**
     * @public
     * @nodered true
     * @method updateGroupName
     * @instance
     * @async
     * @category Groups MANAGEMENT
     * @param {Object} group The group to update
     * @param {string} name The new name of the group
     * @description
     * 		Update the name of a group <br>
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Group} - Updated group object or an error object depending on the result
     * @category async
     */
     async updateGroupName(group, name) {
        let that = this;

        return new Promise(function(resolve, reject) {
            if (!group || !name) {
                if (!group) {
                    that._logger.log("warn", LOG_ID + "(updateGroupName) bad or empty 'group' parameter");
                    that._logger.log("internalerror", LOG_ID + "(updateGroupName) bad or empty 'group' parameter : ", group);
                }
                if (!name) {
                    that._logger.log("warn", LOG_ID + "(updateGroupName) bad or empty 'name' parameter.");
                    that._logger.log("internalerror", LOG_ID + "(updateGroupName) bad or empty 'name' parameter : ", name);
                }
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (group.name === name) {
                that._logger.log("debug", LOG_ID + "(updateGroupName) name of group is already defined, nothing is done");
                resolve(group);
            } else {
                that._rest.updateGroupName(group.id, name).then((group : any) => {
                    let foundIndex = that._groups.findIndex(el => {
                        return el.id === group.id;
                    });

                    if (foundIndex > -1) {
                        that._groups[foundIndex].name = group.name;
                        that._logger.log("internal", LOG_ID + "(updateGroupName) update name to " + group.name + " of group with id " + group.id + " successfully");
                        resolve(that._groups[foundIndex]);
                    } else {
                        resolve(null);
                    }
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(updateGroupName) error");
                    return reject(err);
                });
            }
        });
     }

    /**
     * @public
     * @nodered true
     * @method updateGroupComment
     * @instance
     * @async
     * @category Groups MANAGEMENT
     * @param {Object} group The group to update
     * @param {string} comment The new comment of the group
     * @description
     * 		Update the comment of a group <br>
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Group} - Updated group object or an error object depending on the result
     * @category async
     */
     async updateGroupComment(group, comment) {
        let that = this;

        return new Promise(function(resolve, reject) {
            if (!group || !comment) {
                if (!group) {
                    that._logger.log("warn", LOG_ID + "(updateGroupComment) bad or empty 'group' parameter");
                    that._logger.log("internalerror", LOG_ID + "(updateGroupComment) bad or empty 'group' parameter : ", group);
                }
                if (!comment) {
                    that._logger.log("warn", LOG_ID + "(updateGroupComment) bad or empty 'comment' parameter.");
                    that._logger.log("internalerror", LOG_ID + "(updateGroupComment) bad or empty 'comment' parameter : ", comment);
                }
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (group.comment === comment) {
                that._logger.log("debug", LOG_ID + "(updateGroupComment) name of group is already defined, nothing is done");
                resolve(group);
            } else {
                that._rest.updateGroupComment(group.id, comment).then((group : any) => {
                    let foundIndex = that._groups.findIndex(el => {
                        return el.id === group.id;
                    });

                    if (foundIndex > -1) {
                        that._groups[foundIndex].comment = group.comment;
                        that._logger.log("internal", LOG_ID + "(updateGroupComment) update comment to " + group.comment + " of group with id " + group.id + " successfully");
                        resolve(that._groups[foundIndex]);
                    } else {
                        resolve(null);
                    }
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(updateGroupComment) error");
                    return reject(err);
                });
            }
        });
     }

    /**
     * @private
     * @category Groups MANAGEMENT
     * @description
     *      Internal method <br>
     */
     getGroups() {
         let that = this;
         return new Promise(function(resolve, reject) {
            that._rest.getGroups().then((listOfGroups : []) => {

                let promises = [];

                listOfGroups.forEach((group : any) => {
                    promises.push(new Promise(function(res, rej) {
                        that._rest.getGroup(group.id).then(groupWithUsersInformation => {
                            res(groupWithUsersInformation);
                        }, err => {
                            return rej(err);
                        });
                    }));
                });

                Promise.all(promises).then(groups => {
                    that._groups = groups;
                    that._logger.log("info", LOG_ID + "(getGroups) get successfully");
                    resolve(that._groups);
                }, err => {
                    return reject(err);
                });

            }, err => {
                 that._logger.log("error", LOG_ID + "(getGroups) Error.");
                 that._logger.log("internalerror", LOG_ID + "(getGroups) Error : ", err);
                return reject(err);
            });
         });
     }

     /**
     * @public
      * @nodered true
      * @method setGroupAsFavorite
     * @since 1.67.0
     * @async
     * @category Groups MANAGEMENT
     * @instance
     * @param {Object} group The group
     * @description
     * 		Set a group as a favorite one of the curent loggued in user. <br>
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Group} - Updated group or an error object depending on the result
     * @category async
     */
     async setGroupAsFavorite( group) {
         let that = this;
         return new Promise(function (resolve, reject) {
             if (!group) {
                 that._logger.log("warn", LOG_ID + "(setGroupAsFavorite) bad or empty 'group' parameter.");
                 that._logger.log("internalerror", LOG_ID + "(setGroupAsFavorite) bad or empty 'group' parameter : ", group);
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                 return;
             }

             that._logger.log("internal", LOG_ID + "(setGroupAsFavorite) param group : ", group);

             that._rest.updateGroupFavorite(group.id, true).then((groupRetrieved: any) => {
                 that._logger.log("debug", LOG_ID + "(setGroupAsFavorite) set favorite group successfull");
                 that._logger.log("internal", LOG_ID + "(setGroupAsFavorite) set favorite group successfull, group : ", groupRetrieved);
                 resolve(groupRetrieved);
             }, err => {
                 return reject(err);
             });
         });
     }

    /**
     * @public
     * @nodered true
     * @method unsetGroupAsFavorite
     * @since 1.67.0
     * @category Groups MANAGEMENT
     * @async
     * @instance
     * @param {Object} group The group
     * @description
     * 		Remove the favorite state of a group of the curent loggued in user. <br>
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Group} - Updated group or an error object depending on the result
     * @category async
     */
    async unsetGroupAsFavorite(group) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!group) {
                that._logger.log("warn", LOG_ID + "(unsetGroupAsFavorite) bad or empty 'group' parameter.");
                that._logger.log("internalerror", LOG_ID + "(unsetGroupAsFavorite) bad or empty 'group' parameter : ", group);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._logger.log("internal", LOG_ID + "(unsetGroupAsFavorite) param group : ", group);

            that._rest.updateGroupFavorite(group.id, false).then((groupRetrieved: any) => {
                that._logger.log("debug", LOG_ID + "(unsetGroupAsFavorite) unset favorite group successfull");
                that._logger.log("internal", LOG_ID + "(unsetGroupAsFavorite) unset favorite group successfull, group : ", groupRetrieved);
                resolve(groupRetrieved);
            }, err => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method getAll
     * @category Groups MANAGEMENT
     * @instance
     * @return {Array} The list of existing groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
     * @description
     *  Return the list of existing groups <br>
     */
    getAll() {
        return this._groups;
    }

    /**
     * @public
     * @nodered true
     * @method getFavoriteGroups
     * @category Groups MANAGEMENT
     * @instance
     * @return {Array} The list of favorite groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
     * @description
     *  Return the list of favorite groups <br>
     */
    getFavoriteGroups() {
        return this._groups.filter((group) => {
            return group.isFavorite;
        });
    }

    /**
     * @public
     * @nodered true
     * @method getGroupById
     * @category Groups MANAGEMENT
     * @instance
     * @async
     * @param {String} id group Id of the group to found
     * @return {Promise<any>} The group found if exist or undefined
     * @description
     *  Return a group by its id <br>
     */
    getGroupById(id: string, forceServerSearch : boolean = false) : Promise<any>{
        return new Promise((resolve, reject) => {
            let that = this;
            let groupFound = this._groups.find((group) => {
                return  (group.id===id);
            });

            if (groupFound && !forceServerSearch) {
                return resolve (groupFound);
            } else {
                return that._rest.getGroups().then(async (listOfGroups: [any]) => {

                    let promises = [];
                    let groupFoundOnServer = false;

                    for (const group of listOfGroups) {
                        if (group.id === id) {
                            await this._rest.getGroup(group.id).then((groupUpdated: any) => {
                                //that._logger.log("internal", LOG_ID + "(_onGroupUpdated) Group updated", groupUpdated.name);

                                let foundIndex = that._groups.findIndex(groupItem => groupItem.id===groupUpdated.id);
                                if (foundIndex > -1) {
                                    that._groups[foundIndex] = groupUpdated;
                                } else {
                                    that._groups.push(groupUpdated);
                                }

                                that._eventEmitter.emit("evt_internal_groupupdated", groupUpdated);
                                //that._logger.log("info", LOG_ID + "(getGroupByName) retrieved infos on group found on server successfully.");
                                that._logger.log("debug", LOG_ID + "(getGroupById) retrieved infos on group found on server successfully, groupUpdated : ", groupUpdated);
                                groupFoundOnServer = true;
                                return resolve(groupUpdated);
                            });
                        }
                    };
                    if (!groupFoundOnServer) {
                        return resolve (null);
                    }
                }, err => {
                    that._logger.log("error", LOG_ID + "(getGroupById) Error.");
                    that._logger.log("internalerror", LOG_ID + "(getGroupById) Error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getGroupByName
     * @category Groups MANAGEMENT
     * @instance
     * @async
     * @param {String} name Name of the group to found
     * @param {boolean} forceServerSearch force the update from server.
     * @return {Promise<any>} The group found if exist or undefined
     * @description
     *  Return a group by its id <br>
     */
    async getGroupByName(name : string, forceServerSearch : boolean = false) : Promise<any>{
        return new Promise((resolve, reject) => {
            let that = this;
            let groupFound = this._groups.find((group) => {
                return  (group.name===name);
            });

            if (groupFound && !forceServerSearch) {
                return resolve (groupFound);
            } else {
                that._rest.getGroups().then(async (listOfGroups: [any]) => {

                    let promises = [];
                    let groupFoundOnServer = false;

                    for (const group of listOfGroups) {
                        if (group.name === name) {
                            await this._rest.getGroup(group.id).then((groupUpdated: any) => {
                                //that._logger.log("internal", LOG_ID + "(_onGroupUpdated) Group updated", groupUpdated.name);

                                let foundIndex = that._groups.findIndex(groupItem => groupItem.id===groupUpdated.id);
                                if (foundIndex > -1) {
                                    that._groups[foundIndex] = groupUpdated;
                                } else {
                                    that._groups.push(groupUpdated);
                                }

                                that._eventEmitter.emit("evt_internal_groupupdated", groupUpdated);
                                //that._logger.log("info", LOG_ID + "(getGroupByName) retrieved infos on group found on server successfully.");
                                that._logger.log("debug", LOG_ID + "(getGroupByName) retrieved infos on group found on server successfully, groupUpdated : ", groupUpdated);
                                groupFoundOnServer = true;
                                resolve(groupUpdated);
                            });
                        }
                    };
                    if (!groupFoundOnServer) {
                        return resolve (null);
                    } 
                }, err => {
                    that._logger.log("error", LOG_ID + "(getGroupByName) Error.");
                    that._logger.log("internalerror", LOG_ID + "(getGroupByName) Error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Groups MANAGEMENT

    //region Groups USERS

    /**
     * @public
     * @nodered true
     * @method addUserInGroup
     * @instance
     * @async
     * @category Groups USERS
     * @param {Contact} contact The user to add in group
     * @param {Object} group The group
     * @description
     * 		Add a contact in a group <br>
     * @return {Promise<Object, ErrorManager>} The result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object. |
     * | id  | String | Group unique identifier. |
     * | name | String | Group name. |
     * | comment | String | Group comment. |
     * | isFavorite | Boolean | Is group flagged as favorite. |
     * | owner | String | Rainbow Id of group owner. |
     * | creationDate | Date-Time | Creation date of the group (read only, set automatically during group creation). |
     * | users | String\[\] | List of Rainbow users being in the group. |
     * 
     * @fulfil {Group} - Updated group with the new contact added or an error object depending on the result
     * @category async
     */
    async addUserInGroup(contact, group) {
        let that = this;
        return new Promise(async function(resolve, reject) {
            if (!contact) {
                that._logger.log("warn", LOG_ID + "(addUserInGroup) bad or empty 'contact' parameter.");
                that._logger.log("internalerror", LOG_ID + "(addUserInGroup) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (!group) {
                that._logger.log("warn", LOG_ID + "(addUserInGroup) bad or empty 'group' parameter.");
                that._logger.log("internalerror", LOG_ID + "(addUserInGroup) bad or empty 'group' parameter : ", group);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._logger.log("internal", LOG_ID + "(addUserInGroup) contact : ", contact, ", group : ", group);

            let contactIndex = group.users.findIndex(user => user.id === contact.id);
            if (contactIndex === -1) {
                await that._rest.addUserInGroup(contact.id, group.id).then(async (groupUpdated : any) => {

                    await that._rest.getGroup(groupUpdated.id).then((groupRetrieved : any) => {
                        let foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupRetrieved.id);
                        that._groups[foundIndex] = groupRetrieved;
                        resolve(groupRetrieved);
                    }, err => {
                        return reject(err);
                    });
                }, err => {
                    that._logger.log("error", LOG_ID + "(addUserInGroup) error.");
                    that._logger.log("internalerror", LOG_ID + "(addUserInGroup) error : ", err);
                    return reject(err);
                });
            } else {
                that._logger.log("warn", LOG_ID + "(addUserInGroup) User is already a member of the group");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method removeUserFromGroup
     * @instance
     * @async
     * @category Groups USERS
     * @param {Contact} contact The user to remove from the group
     * @param {Object} group The destination group
     * @description
     *		Remove a contact from a group <br>
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Group} - Updated group without the removed contact or an error object depending on the result
     * @category async
     */
    async removeUserFromGroup(contact, group) {
        let that = this;
        return new Promise(async function(resolve, reject) {
            if (!contact) {
                that._logger.log("warn", LOG_ID + "(removeUserFromGroup) bad or empty 'contact' parameter.");
                that._logger.log("internalerror", LOG_ID + "(removeUserFromGroup) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else if (!group) {
                that._logger.log("warn", LOG_ID + "(removeUserFromGroup) bad or empty 'group' parameter.");
                that._logger.log("internalerror", LOG_ID + "(removeUserFromGroup) bad or empty 'group' parameter : ", group);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._logger.log("internal", LOG_ID + "(removeUserFromGroup) contact : ", contact, ", group : ", group);

            let contactIndex = group.users.findIndex(user => user.id == contact.id);
            if (contactIndex > -1) {
                await that._rest.removeUserFromGroup(contact.id, group.id).then(async (group : any) => {
                    await that._rest.getGroup(group.id).then((group :any) => {
                        let foundIndex = that._groups.findIndex(groupItem => groupItem.id === group.id);
                        that._groups[foundIndex] = group;
                        resolve(group);
                    }, err => {
                        return reject(err);
                    });
                }, err => {
                    that._logger.log("error", LOG_ID + "(removeUserFromGroup) error");
                    return reject(err);
                });
            } else {
                that._logger.log("warn", LOG_ID + "(removeUserFromGroup) contact not found in that group");
                resolve(group);
            }
        });
    }

    //endregion Groups USERS
    
    //region Events

    /**
     * @private
     * @method _onGroupCreated
     * @instance
     * @param {Object} data Contains the groupId of the created group
     * @description
     *		Method called when a group is created <br>
     */
    async _onGroupCreated(data) {
        let that = this;

        await this._rest.getGroup(data.groupId).then((groupCreated : any )=> {
            //that._logger.log("internal", LOG_ID + "(_onGroupCreated) Group created : ", groupCreated.name);

            let foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupCreated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupCreated;
            } else {
                that._groups.push(groupCreated);
            }

            that._eventEmitter.emit("evt_internal_groupcreated", groupCreated);
        }).catch((err) => {
            that._logger.log("warn", LOG_ID + "(_onGroupCreated) Error : ", err);
            //that._logger.log("internalerror", LOG_ID + "(_onGroupCreated) Error : ", err);
        });
    }

    /**
     * @private
     * @method _onGroupDeleted
     * @instance
     * @param {Object} data Contains the groupId of the deleted group
     * @description
     *		Method called when a group is deleted <br>
     */
    async _onGroupDeleted(data) {
        let that = this;

        let foundIndex = that._groups.findIndex(el => {
            return el.id === data.groupId;
        });

        if (foundIndex > -1) {
            let groupDeleted = that._groups.splice(foundIndex, 1);
            //that._logger.log("internal", LOG_ID + "(_onGroupDeleted) Group deleted : ", groupDeleted[0].name);
            that._eventEmitter.emit("evt_internal_groupdeleted", groupDeleted[0]);
        } else {
            that._eventEmitter.emit("evt_internal_groupdeleted", null);
        }
    }

    /**
     * @private
     * @method _onGroupUpdated
     * @instance
     * @param {Object} data Contains the groupId of the updated group
     * @description
     *		Method called when a group is updated (name, comment, isFavorite) <br>
     */
    async _onGroupUpdated(data) {
        let that = this;

        await this._rest.getGroup(data.groupId).then((groupUpdated : any) => {
            //that._logger.log("internal", LOG_ID + "(_onGroupUpdated) Group updated", groupUpdated.name);

            let foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            that._eventEmitter.emit("evt_internal_groupupdated", groupUpdated);
        }).catch((err) => {
            that._logger.log("warn", LOG_ID + "(_onGroupUpdated) Error : ", err);
            //that._logger.log("internalerror", LOG_ID + "(_onGroupUpdated) Error : ", err);
        });
    }

    /**
     * @private
     * @method _onUserAddedInGroup
     * @instance
     * @param {Object} data Contains the groupId and the userId
     * @description
     *		Method called when a user is added to a group <br>
     */
    async _onUserAddedInGroup(data) {
        let that = this;

        await this._rest.getGroup(data.groupId).then((groupUpdated : any ) => {
            //that._logger.log("internal", LOG_ID + "(_onUserAddedInGroup) User added in group", groupUpdated.name);

            let foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            let contactAddedIndex = groupUpdated.users.findIndex(userItem => userItem.id === data.userId);
            let contact = groupUpdated.users[contactAddedIndex];

            that._eventEmitter.emit("evt_internal_useraddedingroup", groupUpdated, contact);
        }).catch((err) => {
            that._logger.log("warn", LOG_ID + "(_onUserAddedInGroup) Error : ", err);
            //that._logger.log("internalerror", LOG_ID + "(_onUserAddedInGroup) Error : ", err);
        });
    }

    /**
     * @private
     * @method _onUserRemovedFromGroup
     * @instance
     * @param {Object} data Contains the groupId and the userId
     * @description
     *		Method called when a user is removed from a group <br>
     */
    async _onUserRemovedFromGroup(data) {
        let that = this;

        await this._rest.getGroup(data.groupId).then((groupUpdated : any) => {
            //that._logger.log("internal", LOG_ID + "(_onUserRemovedFromGroup) User removed from group", groupUpdated.name);

            let foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);

            let contact = null;

            if (foundIndex > -1) {
                let contactRemovedIndex = that._groups[foundIndex].users.findIndex(userItem => userItem.id === data.userId);
                contact = that._groups[foundIndex].users[contactRemovedIndex];
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            that._eventEmitter.emit("evt_internal_userremovedfromgroup", groupUpdated, contact);
        }).catch((err) => {
            that._logger.log("warn", LOG_ID + "(_onUserRemovedFromGroup) Error : ", err);
            //that._logger.log("internalerror", LOG_ID + "(_onUserRemovedFromGroup) Error : ", err);
        });
    }
    
    //endregion Events
    
 }

 module.exports.GroupsService = GroupsService;
 export {GroupsService as GroupsService} ;
