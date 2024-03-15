"use strict";
import {GenericService} from "./GenericService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {flattenObject, isDefined, isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {EventEmitter} from "events";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {RBVoiceEventHandler} from "../connection/XMPPServiceHandler/RBVoiceEventHandler.js";
import {TasksEventHandler} from "../connection/XMPPServiceHandler/TasksEventHandler.js";
import * as PubSub from "pubsub-js";
import {Task} from "../common/models/Task.js";

const LOG_ID = "TASKS/SVCE - ";
const API_ID = "API_CALL - ";

interface TaskInput {
    id?:string,
    category: string // Todo's category (for ex "high", "low", "middle").
    position?: number// Todo's position in this category.
    content: { //  Todo's content.
        done: boolean// Todo's status.
        personalNote: boolean// true when todo is a personal note, false when to do is related to a message in a conversation.
        title?: string // personal note title, field mandatory when personalNote is true.
        peerId?: string // ID of the conversation's peer, mandatory when personalNote is false.
        peerJid?: string // Jid of the conversation's peer, mandatory when personalNote is false.
        conversationJid?: string // Jid of the conversation's peer, mandatory when personalNote is false.
        messageId?: string // XMPP message Id, mandatory when personalNote is false.
        messageTimestamp?: number // Timestamp of the message, mandatory when personalNote is false.
        roomId?: string // ID of the room's peer, mandatory when personalNote is false.
        text?: string // To do's text
        fileInfo?: any // File informations when personalNote is false.
        creationDate?: number //Creation date in ms since Unix epoch*
    },
    categoryId?:string
}



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
    private _tasks: Array<Task>;
    private tasksEventHandler: TasksEventHandler;
    private tasksHandlerToken: any;

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
                 that.attachHandlers();
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

                 if (that.tasksHandlerToken) {
                     that.tasksHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                 }
                 that.tasksHandlerToken = [];

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

        attachHandlers() {
            let that = this;
            that.tasksEventHandler = new TasksEventHandler(that._xmpp, that._core);
            that.tasksHandlerToken = [
                PubSub.subscribe( that._xmpp.hash + "." + that.tasksEventHandler.MESSAGE, that.tasksEventHandler.onMessageReceived.bind(that.tasksEventHandler)),
                PubSub.subscribe( that._xmpp.hash + "." + that.tasksEventHandler.MESSAGE_MANAGEMENT, that.tasksEventHandler.onManagementMessageReceived.bind(that.tasksEventHandler)),
                PubSub.subscribe( that._xmpp.hash + "." + that.tasksEventHandler.MESSAGE_ERROR, that.tasksEventHandler.onErrorMessageReceived.bind(that.tasksEventHandler))
            ];
        }

        //region Tasks MANAGEMENT

    /**
     * @public
     * @nodered true
     * @method addTask
     * @instance
     * @param {TaskInput} task The task to create.
     * @description
     *      Create a new task <br>
     * @async
     * @category Tasks MANAGEMENT
     * @return {Promise<Task, ErrorManager>} The result
     * @fulfil {Task} - Created task object or an error object depending on the result
     * @category async
     */
     async addTask(task:TaskInput): Promise<any> {
         let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(addTask) is task defined : ", isDefined(task));

         return new Promise(function(resolve, reject) {
             if (!task) {
                 that._logger.log(that.WARN, LOG_ID + "(addTask) bad or empty 'task' parameter");
                 that._logger.log(that.INTERNALERROR, LOG_ID + "(addTask) bad or empty 'task' parameter : ", task);
                 return reject(ErrorManager.getErrorManager().BAD_REQUEST);
             }

            that._rest.addTask(task).then((taskAdded:any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(addTask) creation successfull.");
                resolve(that.addOrUpdateTaskToCache(taskAdded));
            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(addTask) error : ", err);
                return reject(err);
            });
         });
     }

    createTaskcategory(category : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(createTaskcategory) is category defined : ", isDefined(category));

        return new Promise(function(resolve, reject) {
            if (!category) {
                that._logger.log(that.WARN, LOG_ID + "(createTaskcategory) bad or empty 'category' parameter");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(createTaskcategory) bad or empty 'category' parameter : ", category);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.createTaskcategory(category).then(result => {
                that._logger.log(that.DEBUG, LOG_ID + "(createTaskcategory) creation successfull");

                resolve(result);
            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(createTaskcategory) error");
                return reject(err);
            });
        });
    }
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
     * @return {Promise<Task, ErrorManager>} The result
     * @fulfil {any} - This API can be used to retrieve the list of user's todos. This API can only be used by user himself.
     * @category async
     */
    async getTasks(category : string = undefined): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getTasks) is category defined : ", isDefined(category));

        return new Promise(function(resolve, reject) {

            that._rest.getTasks(category).then((result:any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTasks) successfull result : ", result);

                let categoriesTasksTab = result?.todos;
                for (let i = 0; i < categoriesTasksTab.length; i++) {
                    let category=categoriesTasksTab[i].category;
                    let categoryId=categoriesTasksTab[i].categoryId;
                    for (let j = 0; j < categoriesTasksTab[i].list.length; j++) {
                        let taskJson: TaskInput = {
                            category: "", content: {
                                done: false,
                                personalNote: false
                            }
                        };
                        taskJson.category = category;
                        taskJson.categoryId = categoryId;
                       Object.assign(taskJson, categoriesTasksTab[i].list[j]);

                        that.addOrUpdateTaskToCache(taskJson);
                    }
                }

                resolve(that._tasks.filter((task : Task)=>{
                    return that._tasks.some((task2) => task2.id === task.id);
                }));
            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(getTasks) error");
                return reject(err);
            });
        });
    }
    deletePropertiesFromTasks() {}
    async deleteTask(taskId : string) : Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteTask) is taskId defined : ", isDefined(taskId));

        return new Promise(function(resolve, reject) {

            that._rest.deleteTask(taskId).then(async (result:any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTask) successfull");
                await that.removeTaskFromCache(taskId).catch(()=>{});
                resolve(true);
            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(deleteTask) error");
                return reject(err);
            });
        });
    }
    deleteCategoryFromTasks() {}
    updateTask(taskId:string, task : TaskInput) {
        let that = this;

        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateTask) is task defined : ", isDefined(task));
        return new Promise(function(resolve, reject) {

            that._rest.updateTask(taskId, task).then((taskUpdated:any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTask) update successfull.");
                resolve(that.addOrUpdateTaskToCache(taskUpdated));
            }, err => {
                that._logger.log(that.ERROR, LOG_ID + "(updateTask) error");
                return reject(err);
            });
        });
    }

    //endregion Tasks MANAGEMENT

    //region Events

    /**
     * @private
     * @method _onTaskCreated
     * @instance
     * @param {any} data Contains the information of the created task
     * @description
     *          Method called when a task is created <br>
     */
    async _onTaskCreated(data: any) {
        let that = this;

        let taskCreated = that.addOrUpdateTaskToCache(data);
        that._eventEmitter.emit("evt_internal_taskcreated", taskCreated);
    }

    /**
     * @private
     * @method _onTaskDeleted
     * @instance
     * @param {any} data Contains the taskId of the deleted task
     * @description
     *          Method called when a task is deleted <br>
     */
    async _onTaskDeleted(data: any) {
        let that = this;
        let taskId = data?.id;

        if (taskId) {
            await this.removeTaskFromCache(taskId);
            that._eventEmitter.emit("evt_internal_taskdeleted", taskId);
        } else {
            //that._eventEmitter.emit("evt_internal_taskdeleted", null);
        }
    }

    /**
     * @private
     * @method _onTaskUpdated
     * @instance
     * @param {any} data Contains the data of the updated task
     * @description
     *          Method called when a task is updated (name, comment, isFavorite) <br>
     */
    async _onTaskUpdated(data: any) {
        let that = this;

        let taskUpdated = that.addOrUpdateTaskToCache(data);
        that._eventEmitter.emit("evt_internal_taskupdated", taskUpdated);
    }

    //endregion Events

   //region Management tasks cache
        /**
         * @private
         * @param taskId
         * @category Tasks Management tasks cache
         * @description
         *      GET A Task FROM CACHE <br>
         */
        private getTaskFromCache(taskId: string): Task {
            let taskFound = null;
            let that = this;
            that._logger.log(that.DEBUG, LOG_ID + "(getTaskFromCache) search id : ", taskId);

            if (that._tasks) {
                let taskFoundindex = that._tasks.findIndex((task) => {
                    return task.id === taskId;
                });
                if (taskFoundindex != -1) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getTaskFromCache) _tasks found : ", that._tasks[taskFoundindex], " with id : ", taskId);
                    return that._tasks[taskFoundindex];
                }
            }
            that._logger.log(that.DEBUG, LOG_ID + "(getTaskFromCache) _tasks found : ", taskFound, " with id : ", taskId);
            return taskFound ;
        }

        /*
        private updateTasksList(): void {
            let that = this;
            //that._logger.log(that.DEBUG, LOG_ID + "(updateTasksList) keys : ", Object.keys(that._tasks));
            that._tasksList = that._tasks.map((task) => { return task.id; });
            that._logger.log(that.INTERNAL, LOG_ID + "(updateTasksList) that._tasksList : ", that._tasksList);
        }
        // */

        transformTaskInputToJson (task:TaskInput) {
            let taskJson: any = {};
            /*taskJson.id = task.id;
            category
            position
            content // */
         /*    let channelproperties = Object.getOwnPropertyNames(that);
            //console.log("updateChannel update Channel with : ", data["id"]);
            Object.getOwnPropertyNames(data).forEach(
                    (val, idx, array) => {
                        //console.log(val + " -> " + data[val]);
                        if (channelproperties.find((el) => { return val == el ;})) {
                            //console.log("WARNING : One property of the parameter of updateChannel method is not present in the Bubble class : ", val, " -> ", data[val]);
                            that[val] = data[val];
                        } else {
                            console.log("WARNING : One property of the parameter of updateTask method is not present in the Task class can not update Task with : ", val, " -> ", data[val]);
                            // dev-code-console //
                            //console.log("WARNING : One property of the parameter of updateTask method is not present in the Task class can not update Task with : ");
                            // end-dev-code-console //
                        }
                    });
// */
        }

        private addOrUpdateTaskToCache(taskRaw: TaskInput): Task {
            let that = this;
            let taskObj : Task = undefined;
            let taskRawJson = flattenObject(taskRaw,'', false);
            let taskFoundindex = that._tasks.findIndex((taskIter) => {
                return taskIter.id === taskRawJson.id;
            });
            if (taskFoundindex != -1 && that._tasks[taskFoundindex]) {
                that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateTaskToCache) update in cache with taskRawJson : ", taskRawJson, ", at taskFoundindex : ", taskFoundindex);
                that._tasks[taskFoundindex].updateTask(taskRawJson);
                taskObj = that._tasks[taskFoundindex];
            } else {
                taskObj = Task.TaskFactory()(taskRawJson);
                that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateTaskToCache) will add in cache taskObj : ", taskObj);
                taskObj = that._tasks[that._tasks.push(taskObj)-1];
                that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateTaskToCache) added in cache taskObj : ", taskObj);
            }
            return taskObj;
        }

        private removeTaskFromCache(taskId: string): Promise<Boolean> {
            let that = this;
            let removeSucceed : boolean = false;
            return new Promise((resolve, reject) => {
                // Get the task to remove
                let taskToRemove = that.getTaskFromCache(taskId);
                if (taskToRemove) {
                    // Remove from tasks
                    let taskId = taskToRemove.id;

                    that._logger.log(that.INTERNAL, LOG_ID + "(removeTaskFromCache) remove from cache taskId : ", taskId);
                    that._tasks = that._tasks.filter( function(task) {
                        return !(task.id === taskId);
                    });

                    removeSucceed = true;
                } else {
                }
                resolve(removeSucceed);
            });
        }

        //endregion Management tasks cache

 }

 module.exports.TasksService = TasksService;
//module.exports = {'LevelInterface' : LevelInterface};
export type {TaskInput as TaskInput};

export {TasksService as TasksService} ;
