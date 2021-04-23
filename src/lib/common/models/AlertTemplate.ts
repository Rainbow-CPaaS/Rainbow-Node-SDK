"use strict";
const AsyncLock = require('async-lock');
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";

export {};

/**
 * @class
 * @name AlertTemplate
 * @public
 * @description
 *      This class represents a filter used when an alert is created to notify only some devices. <br>
 */
class AlertTemplate {
    public id: string;
    public name: string;
    public companyId: string;
    public event: string;
    public description: string;
    public mimeType: string;
    public senderName: string;
    public headline: string;
    public instruction: string;
    public contact: string;
    public type: string;
    public status: string;
    public scope: string;
    public category: string;
    public urgency: string;
    public severity: string;
    public certainty: string;

    public constructor(id?: string, name?: string, companyId?: string, event?: string, description?: string, mimeType: string = "text/plain", senderName?: string, headline?: string, instruction?: string, contact?: string, type: string = "cap", status: string = "Actual", scope: string = "Public", category: string = "Safety", urgency: string = "Immediate", severity: string = "Severe", certainty: string = "Observed") {
        /*
        let that = this;
        that.type = "cap";
        that.status = "Actual";
        that.scope = "Public";
        that.category = "Safety";
        that.urgency = "Immediate";
        that.severity = "Severe";
        that.certainty = "Observed";
        // */

    /**
     * @public
     * @readonly
     * @property {string} id The Template Id
     * @instance
     */
    this.id = id;

    /**
     * @public
     * @readonly
     * @property {string} name The Human readable string identifying this template
     * @instance
     */
    this.name = name;

    /**
     * @public
     * @readonly
     * @property {string} companyId The unique identifier of the company that own this template.  default value user logged in company Id
     * @instance
     */
    this.companyId = companyId;

    /**
     * @public
     * @readonly
     * @property {string} event The String denoting the type of the subject event of the alert message (max 255 characters)
     * @instance
     */
    this.event = event;

    /**
     * @public
     * @readonly
     * @property {string} description The String describing the subject event of the alert message (max 8192 characters)
     * @instance
     */
    this.description = description;

    /**
     * @public
     * @readonly
     * @property {string} mimeType The Mime Type of description's content (max 255 characters) - Default value: text/plain
     * @instance
     */
    this.mimeType = mimeType;

    /**
     * @public
     * @readonly
     * @property {string} senderName The String naming the originator of the alert message (max 255 characters)
     * @instance
     */
    this.senderName = senderName;

    /**
     * @public
     * @readonly
     * @property {string} headline The headline of the alert message (max 255 characters) used for short message devices that may only presents this field (mobile device push)
     * @instance
     */
    this.headline = headline;

    /**
     * @public
     * @readonly
     * @property {string} instruction The text representing the recommended action (max 4096 characters)
     * @instance
     */
    this.instruction = instruction;

    /**
     * @public
     * @readonly
     * @property {string} contact The contact for follow-up or confirmation of the alert message (optional)
     * @instance
     */
    this.contact = contact;

    /**
     * @public
     * @readonly
     * @property {string} type The templates type only 'cap' is allowed
     * @instance
     */
    this.type = type;

    /**
     * @public
     * @readonly
     * @property {string} status The templates status ( 'Actual', 'Exercise', 'System', 'Test','Draft') - default: Actual
     * @instance
     */
    this.status = status;

    /**
     * @public
     * @readonly
     * @property {string} scope The templates scope ( 'Public', 'Restricted', 'Alert') - Default value: Public
     * @instance
     */
    this.scope = scope;

    /**
     * @public
     * @readonly
     * @property {string} category The template category ('Geo', 'Met', 'Safety', 'Security', 'Rescue', 'Fire', 'Health', 'Env', 'Transport', 'Infra', 'CBRNE', 'Other') - Default value: Safety
     * @instance
     */
    this.category = category;

    /**
     * @public
     * @readonly
     * @property {string} urgency The template urgency ('Immediate', 'Expected', 'Future', 'Past', 'Unknown') - Default value: Immediate
     * @instance
     */
    this.urgency = urgency;

    /**
     * @public
     * @readonly
     * @property {string} severity The template severity ('Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown') - Default value: Severe
     * @instance
     */
    this.severity = severity;

    /**
     * @public
     * @readonly
     * @property {string} certainty The template certainty ('Observed', 'Likely', 'Possible', 'Unlikely', 'Unknown') - Default value: Observed
     * @instance
     */
    this.certainty = certainty;

    }
}

/**
 * @class
 * @name AlertTemplatesData
 * @description
 *      This class represents a Structure used when retrieving severals AlertTemplate from server. <br>
 */
class AlertTemplatesData {
    //public data: List<AlertTemplate>
    private alertTemplates: IDictionary<string, AlertTemplate> = new Dictionary();
    public total: number;
    public limit: number;
    public offset: number;

    private lockEngine: any;
    private lockKey = "LOCK_AlertTemplate";

    constructor(limit: number = 0) {
        this.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});

        /**
         * @public
         * @readonly
         * @property {List<string>} data The List of AlertTemplate found
         * @instance
         */
        // this.data = new List<AlertTemplate>();

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

    // region Add/get/first/last/remove AlertTemplate

    addAlertTemplate (alertTemplate : AlertTemplate) : Promise<AlertTemplate> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (!that.alertTemplates.containsKey(alertTemplate.id)) )
                {
                    that.total++;
                    that.alertTemplates.add(alertTemplate.id, alertTemplate);
                    //needToAsk = true;
                    return alertTemplate;
                }
                return ;
            }).then((result) => {
                return resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoin(alertTemplate: AlertTemplate): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (that.alertTemplates.containsKey(alertTemplate.id)) )
                {
                    that.alertTemplates.remove((item: KeyValuePair<string, AlertTemplate>) => {
                        return alertTemplate.id === item.key;
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

    async getAlertTemplate() : Promise<AlertTemplate>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertTemplate> = that.alertTemplates.elementAt(0);
                if (!item) return ;
                let id = item.key;
                let alertTemplate = item.value;
                that.alertTemplates.remove((item: KeyValuePair<string, AlertTemplate>) => {
                    return id === item.key;
                });
                return alertTemplate;
            }).then((result) => {
                resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    first () : Promise<AlertTemplate>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertTemplate> = that.alertTemplates.elementAt(0);
                return item.value;
            }).then((result) => {
                return resolve(result);
            }).catch((result) => {
                resolve(undefined);
            });
        });
    }

    last () : Promise<AlertTemplate> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertTemplate> = that.alertTemplates.elementAt(that.total);
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


module.exports = {AlertTemplate, AlertTemplatesData};
export {AlertTemplate, AlertTemplatesData};
