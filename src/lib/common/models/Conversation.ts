"use strict";



//const Call = require("./Call");
import {Call} from "./Call";
//const uuid4 = require("uuid/v4");
import { v4 as uuid4 } from 'uuid';
import {Message} from "./Message";
import {Logger} from "../Logger.js";

import {FIFOQueue} from "../FIFOQueue.js";
import {pause} from "../Utils.js";
import {randomUUID} from "node:crypto";
let AsyncLock = require('async-lock');

const LOG_ID = "CONVERSATION/CONV - ";

class MessagesQueue extends FIFOQueue<Message> {
    private maxSize = 0;
    private lockEngine: any;
    private lockKey : string = "LOCK_MESSAGES_QUEUE";
    private maxPendingAsyncLockMessagesQueue = 1000;

    constructor(_logger: any, _maxSize : number = 10) {
        super(_logger);
        if (_maxSize <= 0) {
            throw new Error("Maximum size should be greater than zero");
        }
        this.maxSize = _maxSize;
        this.maxPendingAsyncLockMessagesQueue = _maxSize;
        this.lockEngine = new AsyncLock({timeout: 3 * 60 * 1000, maxPending: this.maxPendingAsyncLockMessagesQueue, maxOccupationTime : 5 * 60 * 1000});

    }

    // Ajoute un élément à la fin de la file d'attente
    enqueue(item: Message, forceDequeueIfFull: boolean = false): void {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        try {
            let id = item?.id;
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - enqueue Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - enqueue will start.");
                    if (this.queue.length >= this.maxSize ) {
                        if (!forceDequeueIfFull) {
                            throw new Error("Queue is full");
                        } else {
                            super.dequeue();
                        }
                    }
                    super.enqueue(item);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - enqueue started and finished. Will leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
    }

    // Retire et retourne le premier élément de la file d'attente
    dequeue(): Message | undefined {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - dequeue Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - dequeue will start.");
                    result = super.dequeue();
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - dequeue started and finished. Will pause before leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    // Retourne le premier élément de la file d'attente sans le retirer
    peek(): Message | undefined {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - peek Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - peek will start.");
                    result = super.peek();
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - peek started and finished. Will leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    // Retourne vrai si la file d'attente est vide, faux sinon
    isEmpty(): boolean {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - isEmpty Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - isEmpty will start.");
                    result = super.isEmpty();
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - isEmpty started and finished. Will leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    isFull(): boolean {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - isFull Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - isFull will start.");
                    result = this.queue.length === this.maxSize;
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - isFull started and finished. Will leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    // Retourne la taille de la file d'attente
    size(): number {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - size Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - size will start.");
                    result = super.size();
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - size started and finished. Will leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    get length(){
        let result = this.size();

        return result;
    }

    // Vide la file d'attente
    clear(): void {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - clear Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - clear will start.");
                    this.queue = [];
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - clear started and finished. Will leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
    }

    find(predicate:  any) {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - find Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - find will start.");
                    result = this.queue.find(predicate);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - find started and finished. Will pause before leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    filter(predicate: any) {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - dequeue Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - dequeue will start.");
                    result = this.queue.filter(predicate);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - dequeue started and finished. Will pause before leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return result;
    }

    forEach(predicate: any) {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - forEach Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - forEach will start.");
                    this.queue.forEach(predicate);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - forEach started and finished. Will pause before leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
    }

    unshift(element: any) {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - unshift Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - unshift will start.");
                    this.queue.unshift(element);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - unshift started and finished. Will pause before leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
    }

    // Méthode pour obtenir un itérateur
    [Symbol.iterator](): Iterator<any> {
        let index = 0;
        const dataArray = this.queue;

        // Fonction next() de l'itérateur
        const next = (): IteratorResult<any> => {
            if (index < dataArray.length) {
                return { value: dataArray[index++], done: false };
            } else {
                return { value: undefined, done: true };
            }
        };

        // Retourne l'itérateur
        return { next };
    }

    updateMessageIfExistsElseEnqueueIt(message: any) : Message {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        let result : any;
        let messageObj: Message;
        try {
            let id = randomUUID();
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", id, " - dequeue Message");
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - dequeue will start.");
                    // Check if this message already exist in message store
                    let messageIndice = that.queue.findIndex(function(item, index, tab) {
                        return item.id === message.id
                    });
                    if (messageIndice != -1) {
                        // update the already existing message and return this new value.
                        that.queue[messageIndice] = message;
                        messageObj = that.queue[messageIndice];
                    } else {
                        // Store the message
                        that.queue.push(message);
                        messageObj = message;
                    }
                    that.logger.log("debug", LOG_ID + "(add) - id : ", id, " - dequeue started and finished. Will pause before leave lock." );
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(that.timeBetweenXmppRequests);
            }, id).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
            }); // */
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        return messageObj;
    }

    //region Lock

    async lock(fn, id) {
        let that = this;
        let resultLock = "Lock failed.";
        try {
            that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - will acquire lock the ", that.lockKey);
            await that.lockEngine.acquire(that.lockKey, async () => {
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - lock the ", that.lockKey);
                let result = undefined;
                try {
                    result = await fn(); // async work
                    return result;
                } catch (err3) {
                    that.logger.log("error", LOG_ID + "(lock) - id : ", id, " - CATCH Error !!! error at run : ", that.lockKey, ", error : ", err3);
                }
            }).then((result) => {
                // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - release the ", that.lockKey, ", result : ", result);
                resultLock = result;
            }).catch((err2) => {
                    that.logger.log("warn", LOG_ID + "(lock) - id : ", id, " - catch at acquire : ", that.lockKey, ", error : ", err2);
                    throw resultLock = err2;
                }
            );
        } catch (err) {
            that.logger.log("error", LOG_ID + "(lock) - id : ", id, " - CATCH Error !!! error at acquire : ", that.lockKey, ", error : ", err);
            throw resultLock = err;
        }
        that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - __ exiting __ ", that.lockKey, ", resultLock : ", resultLock);
        return resultLock;
    }

    //endregion Lock
}

/**
 * @class
 * @name Conversation
 * @public
 * @description
 *      This class represents a conversation <br>
 *		A conversation is a "long" interaction (aka the "long tail") between the user ane one or several contacts (Rainbow users or not) based on the IM media if the recipients are Rainbow users. <br>
 *		A conversation never ends and all interactions done can be retrieved. <br>
 */
class Conversation {
    get messages(): MessagesQueue {
        //this.logger.log("internal", LOG_ID + "(get messages) id : ", this.id, ", get messages : ", this._messages);
        return this._messages;
    }
    set messages(value: any) {
        //this.logger.log("internal", LOG_ID + "(set messages) id : ", this.id, ", set messages : ", value);
        this._messages = value;
    }
    /* updateMessages(index: number , value: any) {
        //this.logger.log("internal", LOG_ID + "(updateMessages) id : ", this.id, ", add message : ", value);
        this._messages[index] = value;
    } // */
	public id: any;
	public dbId: any;
	public type: any;
	public owner: any;
	public contact: any;
	public bubble: any;
	public capabilities: any;
	public avatar: any;
	public presenceStatus: any;
	public name: any;
	public filterName: any;
	public missedCounter: any;
	public missedCalls: any;
	//private _messages: any;
	private _messages: MessagesQueue;
	public participantStatuses: any;
	public draft: any;
	public uploadFile: any;
	public status: any;
	public historyIndex: any;
	public historyMessages: any;
	public historyDefered: any;
	public historyComplete: any;
	public lastModification: any;
	public creationDate: any;
	public lastMessageText: any;
	public lastMessageSender: any;
	public pip: any;
	public videoCall: any;
	public audioCall: any;
	public pstnConferenceSession: any;
	public webConferenceSession: any;
	public isMutedAudio: any;
	public isMutedVideo: any;
	public infoVisible: any;
	public muted: any;
	public randomBase: any;
	public messageId: any;
	public currentHistoryId: any;
    public static Status: any;
    public static Type: any;
    private static randomBase: string;
    private static messageId: string;
    preload: boolean;
    isFavorite: boolean;
    bookmark : {
        "messageId" : string,
        "timestamp" : string,
        "unreadMessageNumber" : string
    };
    pendingPromise: Array<any>;
    private logger : any;


    constructor(conversationId, logger : Logger) {
        /**
         * @public
         * @property {string} id The conversation ID
         * @readonly
         */
        this.id = conversationId;

        this.logger = logger ? logger : console;        
        
        /**
         * @public
         * @property {string} dbId The database ID
         * @readonly
         */
        this.dbId = null;

        /**
         * @public
         * @property {ConversationType} type The type of the conversation. Can be ONE_TO_ONE (0), BUBBLE (1) or BOT (2)
         * @readonly
         */
        this.type = null;

        /**
         * @private
         * @readonly
         */
        this.owner = null;

        /**
         * @public
         * @property {Contact} contact (ONE_TO_ONE conversation only) The recipient of the conversation
         * @link Contact
         * @readonly
         */
        this.contact = null;

        /**
         * @public
         * @property {Bubble} bubble (BUBBLE conversation only) The conversation bubble
         * @link Bubble
         * @readonly
         */
        this.bubble = null;

        /**
         * @public
         * @property {Object} capabilities The capabilities of the conversation
         * @readonly
         */
        this.capabilities = null;

        // Display information

        /**
         * @public
         * @property {Object} avatar (ONE_TO_ONE conversation only) The avatar of the conversation
         * @readonly
         */
        this.avatar = null;

        /**
         * @private
         * @readonly
         */
        this.presenceStatus = null;

        /**
         * @private
         * @readonly
         */
        this.name = function () {
            return {};
        };

        /**
         * @public
         * @property {string} filterName The name of the conversation (the display name of the recipient for ONE_TO_ONE conversation or the room name for a ROOM conversation)
         * @readonly
         */
        this.filterName = "";

        /**
         * @public
         * @property {number} missedCounter The number of instant messages not read
         * @readonly
         */
        this.missedCounter = 0;

        /**
         * @public
         * @property {number} missedCalls (ONE_TO_ONE conversation only) The number of call missed with this recipient (only WebRTC call)
         * @readonly
         */
        this.missedCalls = 0;

        /**
         * @public
         * @property {Message[]} messages The list of messages downloaded for this conversation
         * @link Message
         * @readonly
         */
        this._messages = new MessagesQueue(logger,5);
        //this._messages = [];

        /**
         * @private
         * @readonly
         */
        this.participantStatuses = {};

        /**
         * @private
         * @readonly
         */
        this.draft = "";

        /**
         * @private
         * @readonly
         */
        this.uploadFile = null;

        /**
         * @public
         * @property {ConversationStatus} status The status of the conversation
         * @readonly
         */
        this.status = Conversation.Status.ACTIVE;

        // History stuff
        /**
         * @private
         * @readonly
         */
        this.historyIndex = -1;

        /**
         * @private
         * @readonly
         */
        this.historyMessages = [];

        /**
         * @private
         * @readonly
         */
        this.historyDefered = null;

        /**
         * @public
         * @property {Boolean} True if the history has been completely loaded
         * @readonly
         */
        this.historyComplete = false;

        // LastModification
        /**
         * @public
         * @property {Date} lastModification The date of the last modification of the conversation
         * @readonly
         */
        this.lastModification = undefined;

        // CreationDate
        /**
         * @public
         * @property {Date} creationDate The date of the creation of the conversation
         * @since 1.21
         * @readonly
         */
        this.creationDate = new Date();

        // LastMessageText
        /**
         * @public
         * @property {string} lastMessageText The text of the last message received of the conversation
         * @readonly
         */
        this.lastMessageText = "";

        // LastMessageSenderID
        /**
         * @public
         * @property {string} lastMessageSender The ID of the user for the last message
         * @readonly
         */
        this.lastMessageSender = "";

        // Picture in picture
        /**
         * @private
         * @readonly
         */
        this.pip = true;

        // Call references
        /**
         * @public
         * @property {Call} videoCall Link to a WebRTC call (audio/video/sharing) if exists
         * @readonly
         */
        this.videoCall = {
            status: Call.Status.UNKNOWN
        };

        /**
         * @public
         * @property {Call} audioCall Link to a telephony call (from a PBX) if exists
         * @readonly
         */
        this.audioCall = null;

        /**
         * @public
         * @property {ConferenceSession} pstnConferenceSession Link to a pstn conference session if exists
         * @readonly
         * @since 1.30
         */
        this.pstnConferenceSession = null;

        /**
         * @public
         * @property {ConferenceSession} webConferenceSession Link to a webrtc conference session if exists
         * @readonly
         * @since 1.30
         */
        this.webConferenceSession = null;

        //is muted
        /**
         * @private
         * @readonly
         */
        this.isMutedAudio = false;

        /**
         * @private
         * @readonly
         */
        this.isMutedVideo = false;

        /**
         * @private
         * @readonly
         */
        this.infoVisible = null;

        //is conversation muted
        this.muted = false;

        this.pendingPromise = undefined;
        
        //message ID
        let randomBase = this.generateRandomID();
        let messageId = 0;

        this.logger.log("debug", LOG_ID + "(Conversation) constructed : ", this.id);

    }

    /**
     * @private
     * @method addMessage
     * @memberof Conversation
     * @instance
     */
    addOrUpdateMessage(message) {
        let that = this;
        let messageObj = undefined ;

        this.logger.log("debug", LOG_ID + "(addOrUpdateMessage) id : ", this.id, ", message : ", message?message.id:undefined);
        
        // Check if this message already exist in message store
        messageObj = that.messages.updateMessageIfExistsElseEnqueueIt(message);
       /* let messageIndice = that.messages.findIndex(function(item, index, tab) {
            return item.id === message.id
        });
        if (messageIndice != -1) {
            // update the already existing message and return this new value.
            that.updateMessages(messageIndice, message);
            messageObj = that.messages[messageIndice];
        } else {
            // Store the message
            that.messages.push(message);
            messageObj = message;
        }
        */

        // Update lastModification
        that.lastModification = new Date();

        // Update lastMessageText
        that.lastMessageText = message.content;

        //update last activity date for rooms when we receive/sent messages
        if (this.bubble) {
            // dev-code-console //
            //console.log("conversation bubble : ", this.bubble);
            this.logger.log("internal", LOG_ID + "(addOrUpdateMessage) id : ", this.id, ", bubble : ", this.bubble.id);
            // end-dev-code-console //
            this.bubble.lastActivityDate = this.lastModification;
        }

        return messageObj;
    }

    /*************************************************************/
    /* STATIC FACTORIES                                          */
    /*************************************************************/
    static createOneToOneConversation(participant, logger : Logger) {
        // Create the conversation object
        let conversation = new Conversation(participant.jid_im, logger);

        // Attach it to contact
        conversation.contact = participant;
        participant.conversation = conversation;

        // Fill display information
        if (participant.isBot) {
            conversation.avatar = "";
            conversation.type = Conversation.Type.BOT;
        } else {
            conversation.avatar = participant.avatar ?
                participant.avatar.src :
                null;
            conversation.type = Conversation.Type.ONE_TO_ONE;
        }

        conversation.name = participant.name;
        // TODO ? conversation.filterName =
        // utilService.removeDiacritis(participant.displayName.toLowerCase());

        return conversation;
    }

    static createBubbleConversation(bubble, logger: Logger) {
        // Create the conversation object
        let conversation = new Conversation(bubble.jid, logger);
        conversation.type = Conversation.Type.ROOM;
        conversation.bubble = bubble;
        // TODO ? conversation.filterName =
        // utilService.removeDiacritis(room.name.toLowerCase());

        return conversation;
    }

    generateRandomID() {
        return uuid4();
    }

    static getUniqueMessageId() {
        let messageToSendID = "node_" + this.randomBase + this.messageId;
        this.messageId = this.messageId + 1;
        return messageToSendID;
    }

    /*************************************************************/
    /* PUBLIC STATIC METHODS                                     */
    /*************************************************************/
    static stringToStatus(status) {
        switch (status) {
            case "composing":
                return Conversation.Status.COMPOSING;
            case "paused":
                return Conversation.Status.PAUSED;
            default:
                return Conversation.Status.ACTIVE;
        }
    }

    /*************************************************************/
    /* PUBLIC METHODS                                            */
    /*************************************************************/
    reset() {
        this.logger.log("debug", LOG_ID + "(reset) id : ", this.id);
        //this.messages = [];
        this.messages.clear();
        this.lastMessageText = null;
        this.resetHistory();
    }

    resetHistory() {
        this.logger.log("debug", LOG_ID + "(resetHistory) id : ", this.id);
        //this.messages = [];
        //this.lastMessageText = null;
        this.historyIndex = -1;
        this.historyMessages = [];
        this.historyComplete = false;
        this.currentHistoryId = null;
    }


    getMessageById(messId) {
        return this
            ._messages
            .find((item) => {
                return item.id === messId;
            });
    }

    getlastEditableMsg() {
        let messgs = this._messages.filter((mess) => {
            return (mess.side === Message.Side.RIGHT) ;
        });

        if (messgs.length === 0) {
            return undefined;
        }

        let latestObject = messgs[0];
        for (let i = 1; i < messgs.length; i++) {
            const currentDate = new Date(latestObject.date);
            const nextDate = new Date(messgs[i].date);
            if (nextDate > currentDate) {
                latestObject = messgs[i];
            }
        }
        return latestObject;
        /*
        messgs.sort((a, b) => {
            let dateElmt1 = new Date(a.date);
            let dateElmt2 = new Date(b.date);
            return dateElmt2.getTime() - dateElmt1.getTime();
        });
        
        return messgs[0];
        // return this.messages.slice(-1)[0];
        // */
    }
}

/**
 * Enum conversation type
 * @public
 * @enum {number}
 * @readonly
 */
Conversation.Type = {
    /** One-to-one conversation */
    ONE_TO_ONE: 0,
    /** Room conversation with multiple participants */
    ROOM: 1,
    /** Conversation with a Bot */
    BOT: 2
};

/**
 * Enum conversation status
 * @public
 * @enum {Object}
 * @readonly
 */
Conversation.Status = {
    /** Active conversation */
    ACTIVE: {
        key: 0,
        value: "active"
    },
    /** Inactive conversation */
    INACTIVE: {
        key: 1,
        value: "inactive"
    },
    /** When composing a message */
    COMPOSING: {
        key: 2,
        value: "composing"
    },
    /** When a message is written but not sent */
    PAUSED: {
        key: 3,
        value: "paused"
    }
};

module.exports.Conversation = Conversation;
export {Conversation};
