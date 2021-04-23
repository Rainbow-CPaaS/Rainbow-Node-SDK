"use strict";

const AsyncLock = require('async-lock');
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";

export {};

/**
 * @class
 * @name Alert
 * @public
 * @description
 *      This class represents an Alert to send to the Users with the "Alert" subscription and the an AlertDevice created. <br>
 */
class Alert {
    public id: string;
    public name: string;
    public description: string;
    public status: string;
    public templateId: string;
    public filterId: string;
    public companyId: string;
    public startDate: string;
    public expirationDate: string;
    
    constructor (name?: string, description?: string, status?: string, templateId?: string, filterId?: string, companyId?: string, startDate?: string, expirationDate?: string){
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Alert
         * @instance
         */
        this.id = undefined;

        /**
         * @public
         * @readonly
         * @property {string} name The name of the Alert
         * @instance
         */
        this.name = name;

        /**
         * @public
         * @readonly
         * @property {string} description The description of the Alert
         * @instance
         */
        this.description = description;

        /**
         * @public
         * @readonly
         * @property {string} status State of the Alert ('active', 'failed', 'completed', 'expired', 'canceled')
         * @instance
         */
        this.status = status;

        /**
         * @public
         * @readonly
         * @property {string} templateId The ITemplate unique identifier orresponding to the message content sent to the devices.
         * @instance
         */
        this.templateId = templateId;

        /**
         * @public
         * @readonly
         * @property {string} filterId The Alert filter unique identifier. Optional filter allowing to only notify company devices that match the criterion defined in the associated alert filter.
         * @instance
         */
        this.filterId = filterId;

        /**
         * @public
         * @readonly
         * @property {string} companyId The Unique identifier of the company to which belongs the alert (Optional). If not provided, it is set to logged in user's companyId.
         * @instance
         */
        this.companyId = companyId;

        /**
         * @public
         * @readonly
         * @property {string} startDate The Start Date of the Alert
         * @instance
         */
        this.startDate = startDate;

        /**
         * @public
         * @readonly
         * @property {string} expirationDate The End Date of the Alert
         * @instance
         */
        this.expirationDate = expirationDate;
    }
}

/**
 * @class
 * @name AlertsData
 * @description
 *      Structure used when retrieving severals Alerts from server. <br>
 */
class AlertsData {
    get size(): number {
        this._size = this._alerts.length;
        return this._size;
    }

    set size(value: number) {
        this._size = value;
    }
    get alerts(): IDictionary<string, Alert> {
        return this._alerts;
    }

    set alerts(value: IDictionary<string, Alert>) {
        this._alerts = value;
    }
    private _alerts: IDictionary<string, Alert> = new Dictionary();
    public total: number;
    public limit: number;
    public offset: number;
    
    private _size: number;

    private lockEngine: any;
    private lockKey = "LOCK_ALERT";

    constructor(limit: number = 0) {
        this.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});

        /**
         * @public
         * @readonly
         * @property {List<string>} data The List of Alert found
         * @instance
         */
        // this.data = new List<Alert>();

        /**
         * @public
         * @readonly
         * @property {number} total The Total number of items available
         * @instance
         */
        this.total = 0;

        /**
         * @public
         * @readonly
         * @property {number} limit The Number of items asked
         * @instance
         */
        this.limit = limit;

        /**
         * @public
         * @readonly
         * @property {number} offset The Offset used
         * @instance
         */
        this.offset = 0;
    }

    //region Lock

    lock(fn) {
        let that = this;
        let opts = undefined;
        return that.lockEngine.acquire(that.lockKey,
                async function () {
                    // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                    //that._logger.log("internal", LOG_ID + "(lock) lock the ", that.lockKey);
                    return await fn(); // async work
                }, opts).then((result) => {
            // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
            //that._logger.log("internal", LOG_ID + "(lock) release the ", that.lockKey, ", result : ", result);
            return result;
        });
    }

    //endregion

    // region Add/get/first/last/remove Alert

    addAlert (alert : Alert) : Promise<Alert> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (!that._alerts.containsKey(alert.id)) )
                {
                    that.total++;
                    //that._logger.log("debug", LOG_ID + "(addBubbleToJoin) We add the Bubble in the pool poolBubbleToJoin to join it as soon as possible - Jid : ", roomJid,", nbBubbleAdded : ", that.nbBubbleAdded);
                    that._alerts.add(alert.id, alert);
                    //needToAsk = true;
                    return alert;
                }
                return ;
            }).then((result) => {
                //that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Succeed - Jid : ", result);
                return resolve(result);
            }).catch((result) => {
                //that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoin(alert: Alert): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (that._alerts.containsKey(alert.id)) )
                {
                    //that._logger.log("debug", LOG_ID + "(removeBubbleToJoin) We remove the Bubble from poolBubbleToJoin - Jid : ", roomJid);
                    that._alerts.remove((item: KeyValuePair<string, Alert>) => {
                        return alert.id === item.key;
                    });
                    //needToAsk = true;
                }
            }).then((result) => {
                //that._logger.log("internal", LOG_ID + "(removeBubbleToJoin) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                //that._logger.log("internal", LOG_ID + "(removeBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async getAlert() : Promise<Alert>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, Alert> = that._alerts.elementAt(0);
                if (!item) return ;
                let id = item.key;
                let alert = item.value;
                //that._logger.log("debug", LOG_ID + "(getBubbleToJoin) We retrieved the Bubble from poolBubbleToJoin - Jid : ", roomJid);

                //that._logger.log("debug", LOG_ID + "(getBubbleToJoin) We remove the Bubble from poolBubbleToJoin - Jid : ", roomJid);
                that._alerts.remove((item: KeyValuePair<string, Alert>) => {
                    return id === item.key;
                });
                return alert;
            }).then((result) => {
                // that._logger.log("internal", LOG_ID + "(getBubbleToJoin) Succeed - bubble : ", result);
                resolve(result);
            }).catch((result) => {
                // that._logger.log("internal", LOG_ID + "(getBubbleToJoin) Failed - bubble : ", result);
                resolve(undefined);
            });
        });
    }

    first () : Promise<Alert>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, Alert> = that._alerts.elementAt(0);
                return item.value;
            }).then((result) => {
                //that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Succeed - Jid : ", result);
                return resolve(result);
            }).catch((result) => {
                //that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    last () : Promise<Alert> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, Alert> = that._alerts.elementAt(that.total);
                return item.value;
            }).then((result) => {
                //that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Succeed - Jid : ", result);
                return resolve(result);
            }).catch((result) => {
                //that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    //endregion
}

module.exports = {Alert, AlertsData};
export {Alert, AlertsData};
