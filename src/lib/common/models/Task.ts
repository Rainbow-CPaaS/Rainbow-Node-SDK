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
const createTask = (_id:string, _title: string, _creationDate: number, _done: boolean, _personalNote: boolean, _peerId: string, _peerJid: string, _conversationJid: string, _messageId: string, _messageTimestamp: number, _text: string): Task => {
    return new Task(_id, _title, _creationDate, _done, _personalNote, _peerId, _peerJid, _conversationJid, _messageId, _messageTimestamp, _text);
};

/**
 * @class
 * @name Task
 * @public
 * @description
 *      This class is used to represent a Task <br>
 */
class Task {
    private _id:string;

    private _title: string;
    private _creationDate: number;

    private _done: boolean;
    private _personalNote: boolean;
    private _peerId: string;
    private _peerJid: string;
    private _conversationJid: string;
    private _messageId: string;
    private _messageTimestamp: number;
    private _text: string
    constructor(_id:string, _title: string, _creationDate: number, _done: boolean, _personalNote: boolean, _peerId: string, _peerJid: string, _conversationJid: string, _messageId: string, _messageTimestamp: number, _text: string) {

        /**
         * @public
         * @readonly
         * @property {string} id Task's Id.
         * @instance
         */
        this._id = _id;

        /**
         * @public
         * @readonly
         * @property {string} title Task's title.
         * @instance
         */
        this._title = _title;

        /**
         * @public
         * @readonly
         * @property {number} creationDate Task's creation date (to be used for personnalNote) If message then use messageTimestamp.
         * @instance
         */
        this._creationDate = _creationDate;

        /**
         * @public
         * @readonly
         * @property {boolean} done does the Task is done
         * @instance
         */
        this._done = _done;

        /**
         * @public
         * @readonly
         * @property {boolean} personalNote does the Task is a personnal Note (created by the connected user)
         * @instance
         */
        this._personalNote = _personalNote;

        /**
         * @public
         * @readonly
         * @property {string} peerId peed's Id of a message Task.
         * @instance
         */
        this._peerId = _peerId;

        /**
         * @public
         * @readonly
         * @property {string} peerJid peer's Jid of a message Task.
         * @instance
         */
        this._peerJid = _peerJid;

        /**
         * @public
         * @readonly
         * @property {string} conversationJid conversation's Jid of a message Task.
         * @instance
         */
        this._conversationJid = _conversationJid;

        /**
         * @public
         * @readonly
         * @property {number} messageId message's Id of a message Task.
         * @instance
         */
        this._messageId = _messageId;

        /**
         * @public
         * @readonly
         * @property {string} messageTimestamp message's Timestamp of a message Task.
         * @instance
         */
        this._messageTimestamp = _messageTimestamp;

        /**
         * @public
         * @readonly
         * @property {string} text of the Task. (Used for personnal Note)
         * @instance
         */
        this._text = _text;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get creationDate(): number {
        return this._creationDate;
    }

    set creationDate(value: number) {
        this._creationDate = value;
    }

    get done(): boolean {
        return this._done;
    }

    set done(value: boolean) {
        this._done = value;
    }

    get personalNote(): boolean {
        return this._personalNote;
    }

    set personalNote(value: boolean) {
        this._personalNote = value;
    }

    get peerId(): string {
        return this._peerId;
    }

    set peerId(value: string) {
        this._peerId = value;
    }

    get peerJid(): string {
        return this._peerJid;
    }

    set peerJid(value: string) {
        this._peerJid = value;
    }

    get conversationJid(): string {
        return this._conversationJid;
    }

    set conversationJid(value: string) {
        this._conversationJid = value;
    }

    get messageId(): string {
        return this._messageId;
    }

    set messageId(value: string) {
        this._messageId = value;
    }

    get messageTimestamp(): number {
        return this._messageTimestamp;
    }

    set messageTimestamp(value: number) {
        this._messageTimestamp = value;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
    }
}

module.exports = {createTask: createTask, Task: Task};
export {createTask as createTask, Task as Task};
