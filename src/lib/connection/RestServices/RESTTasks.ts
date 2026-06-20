'use strict';

import {addParamToUrl, addPropertyToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {TaskInput} from "../../services/TasksService.js";

const LOG_ID = "REST/TASKS - ";

/**
 * Handles all REST API calls related to Tasks (To-Do list) management.
 */
@logEntryExit(LOG_ID)
class RESTTasks extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTTasks'; }
    getClassName() { return RESTTasks.getClassName(); }
    static getAccessorName() { return 'resttasks'; }
    getAccessorName() { return RESTTasks.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            let that = this;
            that.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }

    //region Tasks MANAGEMENT

    /**
     * Creates a task for the given user.
     * @param {string} userId - The authenticated user ID.
     * @param {any} task - Task data object.
     * @returns {Promise<any>}
     */
    async addTask(userId: string, task: any) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodo
        // POST /api/rainbow/enduser/v1.0/users/:userId/todos
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addTask) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos";
            let data: any = task;

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addTask) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addTask) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves all task categories for the given user.
     * @param {string} userId - The authenticated user ID.
     * @returns {Promise<any>}
     */
    getAllCategories(userId: string) {
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos/category
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllCategories) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/category";

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCategories) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCategories) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCategories) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCategories) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCategories) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Creates a task category for the given user.
     * @param {string} userId - The authenticated user ID.
     * @param {string} category - Category name.
     * @returns {Promise<any>}
     */
    createTaskcategory(userId: string, category: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodoCategory
        // POST /api/rainbow/enduser/v1.0/users/:userId/todos/category
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createTaskcategory) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/category";
            let data: any = {};
            addPropertyToObj(data, "category", category, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createTaskcategory) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createTaskcategory) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createTaskcategory) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createTaskcategory) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Creates or updates properties for a task category.
     * @param {string} userId - The authenticated user ID.
     * @param {string} categoryId - The category ID.
     * @param {any} properties - Properties to set.
     * @returns {Promise<any>}
     */
    createOrUpdatePropertiesTaskByCategoryId(userId: string, categoryId: string, properties: any) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodoProperties
        // POST /api/rainbow/enduser/v1.0/users/:userId/todos/properties/:categoryId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createOrUpdatePropertiesTaskByCategoryId) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/properties/" + categoryId;
            let data: any = {};
            addPropertyToObj(data, "properties", properties, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createOrUpdatePropertiesTaskByCategoryId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createOrUpdatePropertiesTaskByCategoryId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createOrUpdatePropertiesTaskByCategoryId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createOrUpdatePropertiesTaskByCategoryId) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves a task by its ID for the given user.
     * @param {string} userId - The authenticated user ID.
     * @param {string} taskId - The task ID.
     * @returns {Promise<any>}
     */
    async getTaskById(userId: string, taskId: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-GetUserTodos
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getTaskById) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/" + taskId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getTaskById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTaskById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTaskById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTaskById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTaskById) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves tasks filtered by category ID for the given user.
     * @param {string} userId - The authenticated user ID.
     * @param {string} category - Category ID.
     * @returns {Promise<any>}
     */
    getTasksByCategoryId(userId: string, category: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-getTodoCategory
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos/category/:categoryId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getTasksByCategoryId) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/category/" + category;

            that._logger.log(that.INTERNAL, LOG_ID + "(getTasksByCategoryId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTasksByCategoryId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTasksByCategoryId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTasksByCategoryId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTasksByCategoryId) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves all tasks for the given user, optionally filtered by category.
     * @param {string} userId - The authenticated user ID.
     * @param {string} category - Optional category filter.
     * @returns {Promise<any>}
     */
    getTasks(userId: string, category: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-GetUserTodos
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getTasks) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "category", category);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getTasks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTasks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTasks) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTasks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTasks) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes all properties for a task category.
     * @param {string} userId - The authenticated user ID.
     * @param {string} categoryId - Category ID.
     * @returns {Promise<any>}
     */
    deletePropertiesFromCategoriesTasks(userId: string, categoryId: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodoCategories
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/properties/:categoryId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deletePropertiesFromCategoriesTasks) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/properties/" + categoryId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deletePropertiesFromCategoriesTasks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deletePropertiesFromCategoriesTasks) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deletePropertiesFromCategoriesTasks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deletePropertiesFromCategoriesTasks) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes a task by ID.
     * @param {string} userId - The authenticated user ID.
     * @param {string} taskId - Task ID.
     * @returns {Promise<any>}
     */
    deleteTask(userId: string, taskId: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodo
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteTask) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/" + taskId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTask) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTask) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes a task category.
     * @param {string} userId - The authenticated user ID.
     * @param {string} categoryId - Category ID.
     * @returns {Promise<any>}
     */
    deleteCategoryFromTasks(userId: string, categoryId: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodoCategory
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/category/:categoryId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCategoryFromTasks) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/category/" + categoryId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCategoryFromTasks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCategoryFromTasks) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCategoryFromTasks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCategoryFromTasks) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Updates a task by ID.
     * @param {string} userId - The authenticated user ID.
     * @param {string} taskId - Task ID.
     * @param {TaskInput} task - Updated task data.
     * @returns {Promise<any>}
     */
    updateTask(userId: string, taskId: string, task: TaskInput) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-updateTodo
        // PUT /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateTask) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/" + taskId;
            let data: any = {};
            addPropertyToObj(data, "category", task.category, false);
            addPropertyToObj(data, "position", task.position, false);
            addPropertyToObj(data, "content", task.content, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateTask) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateTask) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Tasks MANAGEMENT

}

module.exports = {'RESTTasks': RESTTasks};
export {RESTTasks as RESTTasks};
