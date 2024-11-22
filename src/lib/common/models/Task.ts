"use strict";
export {};


/**
 * @module
 * @public
 * @name Task
 * @description Task model
 */

/*************************************************************/
/* STATIC FACTORIES                                          */
/*************************************************************/

/**
 * @function
 * @public
 * @name Task#create
 * @returns {Task} Task object.
 * @description Creates new Task object
 * @param _id Task's Id.
 * @param _title Task's title.
 * @param _creationDate Task's creation date (to be used for personnalNote) If message then use messageTimestamp.
 * @param _done does the Task is done
 * @param _personalNote does the Task is a personnal Note (created by the connected user)
 * @param _peerId peed's Id of a message Task.
 * @param _peerJid peer's Jid of a message Task.
 * @param _conversationJid conversation's Jid of a message Task.
 * @param _messageId message's Id of a message Task.
 * @param _messageTimestamp message's Timestamp of a message Task.
 * @param _text of the Task. (Used for personnal Note)
 */
const createTask = (_id:string, _title: string, _creationDate: number, _done: boolean, _personalNote: boolean, _peerId: string, _peerJid: string, _conversationJid: string, _messageId: string, _messageTimestamp: number, _text: string, _position : number, _category : string, _categoryId : string, _type:string): Task => {
    return new Task(_id, _title, _creationDate, _done, _personalNote, _peerId, _peerJid, _conversationJid, _messageId, _messageTimestamp, _text, _position, _category, _categoryId, _type);
};

/**
 * @class
 * @name Task
 * @public
 * @description
 *      This class is used to represent a Task <br>
 */
class Task {
    public id:string;

    public title: string;
    public creationDate: number;

    public done: boolean;
    public personalNote: boolean;
    public peerId: string;
    public peerJid: string;
    public conversationJid: string;
    public messageId: string;
    public messageTimestamp: number;
    public text: string
    public position: number;
    public category: string;
    public categoryId: string
    public type: string

    constructor(_id:string, _title: string, _creationDate: number, _done: boolean, _personalNote: boolean, _peerId: string, _peerJid: string, _conversationJid: string, _messageId: string, _messageTimestamp: number, _text: string, _position : number, _category : string, _categoryId : string, _type:string) {

        /**
         * @public
         * @readonly
         * @property {string} id Task's Id.
         * @instance
         */
        this.id = _id;

        /**
         * @public
         * @readonly
         * @property {string} title Task's title.
         * @instance
         */
        this.title = _title;

        /**
         * @public
         * @readonly
         * @property {number} creationDate Task's creation date (to be used for personnalNote) If message then use messageTimestamp.
         * @instance
         */
        this.creationDate = _creationDate;

        /**
         * @public
         * @readonly
         * @property {boolean} done does the Task is done
         * @instance
         */
        this.done = _done;

        /**
         * @public
         * @readonly
         * @property {boolean} personalNote does the Task is a personnal Note (created by the connected user)
         * @instance
         */
        this.personalNote = _personalNote;

        /**
         * @public
         * @readonly
         * @property {string} peerId peed's Id of a message Task.
         * @instance
         */
        this.peerId = _peerId;

        /**
         * @public
         * @readonly
         * @property {string} peerJid peer's Jid of a message Task.
         * @instance
         */
        this.peerJid = _peerJid;

        /**
         * @public
         * @readonly
         * @property {string} conversationJid conversation's Jid of a message Task.
         * @instance
         */
        this.conversationJid = _conversationJid;

        /**
         * @public
         * @readonly
         * @property {number} messageId message's Id of a message Task.
         * @instance
         */
        this.messageId = _messageId;

        /**
         * @public
         * @readonly
         * @property {string} messageTimestamp message's Timestamp of a message Task.
         * @instance
         */
        this.messageTimestamp = _messageTimestamp;

        /**
         * @public
         * @readonly
         * @property {string} text of the Task. (Used for personnal Note)
         * @instance
         */
        this.text = _text;

        /**
         * @public
         * @readonly
         * @property {string} position of the Task.
         * @instance
         */
        this.position = _position;

        /**
         * @public
         * @readonly
         * @property {string} category of the Task.
         * @instance
         */
        this.category = _category;

        /**
         * @public
         * @readonly
         * @property {string} categoryId of the Task.
         * @instance
         */
        this.categoryId = _categoryId;

        /**
         * @public
         * @readonly
         * @property {string} type of the Task.
         * @instance
         */
        this.type = _type;
    }

    /**
     * @function
     * @public
     * @name ChannelFactory
     * @description
     * This method is used to create a channel from data object
     */
    public static TaskFactory() {
        return (data: any): Task => {
            let task: Task = new Task(
                    data.id,
                    data.title,
                    data.creationDate,
                    data.done,
                    data.personalNote,
                    data.peerId,
                    data.peerJid,
                    data.conversationJid,
                    data.messageId,
                    data.messageTimestamp,
                    data.text,
                    data.position,
                    data.category,
                    data.categoryId,
                    data.type
            );

            if (data) {
                // Get every properties of the new Task
                let objproperties = Object.getOwnPropertyNames(task);
                // Try to find these properties from the object passed in parameter (data) in this new Task to trace unknow values.
                Object.getOwnPropertyNames(data).forEach(
                        (val, idx, array) => {
                            //console.log(val + " -> " + data[val]);
                            if (!objproperties.find((el) => { return val == el ;})) {
                                // dev-code-console //
                                console.log("WARNING : One property of the parameter of TaskFactory method is not present in the Task class : ", val, " -> ", data[val]);
                                //console.log("WARNING : One property of the parameter of TaskFactory method is not present in the Task class : ", val);
                                // end-dev-code-console //
                            }
                        });
            }

            return task;
        };
    }

    /**
     * @function
     * @public
     * @name updateChannel
     * @description
     * This method is used to update a channel from data object
     */
    updateTask (data) {
        let that = this;
        if (data) {

            let channelproperties = Object.getOwnPropertyNames(that);
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
        }

        return this;
    }

}

module.exports = {createTask: createTask, Task: Task};
export {createTask as createTask, Task as Task};
