"use strict";

export {};
const AsyncLock = require('async-lock');
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";

/**
 * @class
 * @name AlertFilter
 * @description
 *      This class Define a filter used when an alert is created to notify only some devices. <br>
 */
class AlertFilter {
    public id: string;
    public name: string;
    public companyId: string;
    public tags: List<string>;
    
    constructor(id?: string, name?: string, companyId?: string, tags?: List<string>){
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Filter
         * @instance
         */
        this.id = id;

        /**
         * @public
         * @readonly
         * @property {string} name The Name of the Filter
         * @instance
         */
        this.name = name;

        /**
         * @public
         * @readonly
         * @property {string} companyId The company identifier that owns this filter
         * @instance
         */
        this.companyId = companyId;

        /**
         * @public
         * @readonly
         * @property {List<string>} tags The tag's list to apply
         * @instance
         */
        this.tags = tags;
    }
}

/**
 * @class
 * @name AlertFiltersData
 * @description
 *      This class represents a Structure used to retrieve several AlertFilters objects from server. <br>
 */
class AlertFiltersData {
    //public data: List<AlertFilter>
    private alertFilters: IDictionary<string, AlertFilter> = new Dictionary();
    public total: number;
    public limit: number;
    public offset: number;

    private lockEngine: any;
    private lockKey = "LOCK_AlertFilter";

    constructor(limit: number = 0) {
        this.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});

        /**
         * @public
         * @readonly
         * @property {List<string>} data The List of AlertFilter found
         * @instance
         */
        // this.data = new List<AlertFilter>();

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

    // region Add/get/first/last/remove AlertFilter

    addAlertFilter (alertFilter : AlertFilter) : Promise<AlertFilter> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (!that.alertFilters.containsKey(alertFilter.id)) )
                {
                    that.total++;
                    that.alertFilters.add(alertFilter.id, alertFilter);
                    //needToAsk = true;
                    return alertFilter;
                }
                return ;
            }).then((result) => {
                return resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoin(alertFilter: AlertFilter): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (that.alertFilters.containsKey(alertFilter.id)) )
                {
                    that.alertFilters.remove((item: KeyValuePair<string, AlertFilter>) => {
                        return alertFilter.id === item.key;
                    });
                    //needToAsk = true;
                }
            }).then((result) => {
                resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    async getAlertFilter() : Promise<AlertFilter>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertFilter> = that.alertFilters.elementAt(0);
                if (!item) return ;
                let id = item.key;
                let alertFilter = item.value;
                that.alertFilters.remove((item: KeyValuePair<string, AlertFilter>) => {
                    return id === item.key;
                });
                return alertFilter;
            }).then((result) => {
                resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    first () : Promise<AlertFilter>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertFilter> = that.alertFilters.elementAt(0);
                return item.value;
            }).then((result) => {
                return resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    last () : Promise<AlertFilter> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertFilter> = that.alertFilters.elementAt(that.total);
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




module.exports = {AlertFilter, AlertFiltersData};
export {AlertFilter, AlertFiltersData};
