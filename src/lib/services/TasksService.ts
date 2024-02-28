"use strict";
import {GenericService} from "./GenericService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {isDefined, isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {EventEmitter} from "events";
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "TASKS/SVCE - ";
const API_ID = "API_CALL - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name TasksService
 * @version SDKVERSION
 * @public
 * @description
 *              This service manages tasks of the connected user. <br>
 *              <br><br>
 */
 class TasksService extends GenericService{
    private _tasks: any;

    static getClassName(){ return 'TasksService'; }
    getClassName(){ return TasksService.getClassName(); }

    static getAccessorName(){ return 'tasks'; }
    getAccessorName(){ return TasksService.getAccessorName(); }

    constructor(_core:Core, _eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._tasks = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        this._core = _core;

        this._eventEmitter.on("evt_internal_hdle_taskcreated", this._onTaskCreated.bind(this));
        this._eventEmitter.on("evt_internal_hdle_taskdeleted", this._onTaskDeleted.bind(this));
        this._eventEmitter.on("evt_internal_hdle_taskupdated", this._onTaskUpdated.bind(this));
        this._eventEmitter.on("evt_internal_hdle_useraddedintask", this._onUserAddedInTask.bind(this));
        this._eventEmitter.on("evt_internal_hdle_userremovedfromtask", this._onUserRemovedFromTask.bind(this));
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
                 that._tasks = [];
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
                that._tasks = null;

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
            await that.getTasks().then((result) => {
                that.setInitialized();
            }).catch(() => {
                that.setInitialized();
            });
        } else {
            that.setInitialized();
        } 
    }

    //region Tasks MANAGEMENT

    /**
     * @public
     * @nodered true
     * @method addTask
     * @instance
     * @param {string} name The name of the task to create
     * @param {string} comment The comment of the task to create
     * @param {boolean} isFavorite If true, the task is flagged as favorite
     * @description
     *      Create a new task <br>
     * @async
     * @category Tasks MANAGEMENT
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {Task} - Created task object or an error object depending on the result
     * @category async
     */
     async addTask(name, comment, isFavorite) {
         let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(addTask) is name defined : ", isDefined(name));

         return new Promise(function(resolve, reject) {
             if (typeof isFavorite === "undefined") {
                 isFavorite = false;
             }

             if (!name) {
                 that._logger.log(that.WARN, LOG_ID + "(addTask) bad or empty 'name' parameter");
                 that._logger.log(that.INTERNALERROR, LOG_ID + "(addTask) bad or empty 'name' parameter : ", name);
                 return reject(ErrorManager.getErrorManager().BAD_REQUEST);
             }

            that._rest.addTask(name, comment, isFavorite).then(task => {
                that._logger.log(that.DEBUG, LOG_ID + "(addTask) creation successfull");

                that._tasks.push(task);
                resolve(task);

            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(addTask) error");
                return reject(err);
            });
         });
     }

    createTaskcategory() {}
    createPropertiesTaskByCategoryId () {}
    updatePropertiesTaskByCategoryId () {}
    getTaskById() {}
    getTasksByCategoryId() {}
    /**
     * @public
     * @nodered true
     * @method getTasks
     * @instance
     * @param {string} category allows to retrieve only todos in that category.
     * @description
     *      This API can be used to retrieve the list of user's todos. This API can only be used by user himself.  <br>
     * @async
     * @category Tasks MANAGEMENT
     * @return {Promise<Object, ErrorManager>} The result
     * @fulfil {any} - This API can be used to retrieve the list of user's todos. This API can only be used by user himself.
     * @category async
     */
    async getTasks(category : string = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getTasks) is category defined : ", isDefined(category));

        return new Promise(function(resolve, reject) {

            that._rest.getTasks(category).then(task => {
                that._logger.log(that.DEBUG, LOG_ID + "(addTask) creation successfull");

                //that._tasks.push(task);
                resolve(task);
            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(addTask) error");
                return reject(err);
            });
        });
    }
    deletePropertiesFromTasks() {}
    deleteTask() {}
    deleteCategoryFromTasks() {}
    updateTask() {}

    //endregion Tasks MANAGEMENT

    //region Events

    /**
     * @private
     * @method _onTaskCreated
     * @instance
     * @param {Object} data Contains the taskId of the created task
     * @description
     *          Method called when a task is created <br>
     */
    async _onTaskCreated(data) {
        let that = this;

        await this._rest.getTaskById(data.taskId).then((taskCreated : any )=> {
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onTaskCreated) Task created : ", taskCreated.name);

            let foundIndex = that._tasks.findIndex(taskItem => taskItem.id === taskCreated.id);
            if (foundIndex > -1) {
                that._tasks[foundIndex] = taskCreated;
            } else {
                that._tasks.push(taskCreated);
            }

            that._eventEmitter.emit("evt_internal_taskcreated", taskCreated);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onTaskCreated) Error : ", err);
            //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onTaskCreated) Error : ", err);
        });
    }

    /**
     * @private
     * @method _onTaskDeleted
     * @instance
     * @param {Object} data Contains the taskId of the deleted task
     * @description
     *          Method called when a task is deleted <br>
     */
    async _onTaskDeleted(data) {
        let that = this;

        let foundIndex = that._tasks.findIndex(el => {
            return el.id === data.taskId;
        });

        if (foundIndex > -1) {
            let taskDeleted = that._tasks.splice(foundIndex, 1);
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onTaskDeleted) Task deleted : ", taskDeleted[0].name);
            that._eventEmitter.emit("evt_internal_taskdeleted", taskDeleted[0]);
        } else {
            that._eventEmitter.emit("evt_internal_taskdeleted", null);
        }
    }

    /**
     * @private
     * @method _onTaskUpdated
     * @instance
     * @param {Object} data Contains the taskId of the updated task
     * @description
     *          Method called when a task is updated (name, comment, isFavorite) <br>
     */
    async _onTaskUpdated(data) {
        let that = this;

        await this._rest.getTaskById(data.taskId).then((taskUpdated : any) => {
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onTaskUpdated) Task updated", taskUpdated.name);

            let foundIndex = that._tasks.findIndex(taskItem => taskItem.id === taskUpdated.id);
            if (foundIndex > -1) {
                that._tasks[foundIndex] = taskUpdated;
            } else {
                that._tasks.push(taskUpdated);
            }

            that._eventEmitter.emit("evt_internal_taskupdated", taskUpdated);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onTaskUpdated) Error : ", err);
            //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onTaskUpdated) Error : ", err);
        });
    }

    /**
     * @private
     * @method _onUserAddedInTask
     * @instance
     * @param {Object} data Contains the taskId and the userId
     * @description
     *          Method called when a user is added to a task <br>
     */
    async _onUserAddedInTask(data) {
        let that = this;

        await this._rest.getTaskById(data.taskId).then((taskUpdated : any ) => {
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onUserAddedInTask) User added in task", taskUpdated.name);

            let foundIndex = that._tasks.findIndex(taskItem => taskItem.id === taskUpdated.id);
            if (foundIndex > -1) {
                that._tasks[foundIndex] = taskUpdated;
            } else {
                that._tasks.push(taskUpdated);
            }

            let contactAddedIndex = taskUpdated.users.findIndex(userItem => userItem.id === data.userId);
            let contact = taskUpdated.users[contactAddedIndex];

            that._eventEmitter.emit("evt_internal_useraddedintask", taskUpdated, contact);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onUserAddedInTask) Error : ", err);
            //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onUserAddedInTask) Error : ", err);
        });
    }

    /**
     * @private
     * @method _onUserRemovedFromTask
     * @instance
     * @param {Object} data Contains the taskId and the userId
     * @description
     *          Method called when a user is removed from a task <br>
     */
    async _onUserRemovedFromTask(data) {
        let that = this;

        await this._rest.getTaskById(data.taskId).then((taskUpdated : any) => {
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onUserRemovedFromTask) User removed from task", taskUpdated.name);

            let foundIndex = that._tasks.findIndex(taskItem => taskItem.id === taskUpdated.id);

            let contact = null;

            if (foundIndex > -1) {
                let contactRemovedIndex = that._tasks[foundIndex].users.findIndex(userItem => userItem.id === data.userId);
                contact = that._tasks[foundIndex].users[contactRemovedIndex];
                that._tasks[foundIndex] = taskUpdated;
            } else {
                that._tasks.push(taskUpdated);
            }

            that._eventEmitter.emit("evt_internal_userremovedfromtask", taskUpdated, contact);
        }).catch((err) => {
            that._logger.log(that.WARN, LOG_ID + "(_onUserRemovedFromTask) Error : ", err);
            //that._logger.log(that.INTERNALERROR, LOG_ID + "(_onUserRemovedFromTask) Error : ", err);
        });
    }
    
    //endregion Events
    
 }

 module.exports.TasksService = TasksService;
 export {TasksService as TasksService} ;
