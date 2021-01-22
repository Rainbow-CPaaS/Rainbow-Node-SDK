"use strict";
import {List} from "ts-generic-collections-linq";

export {};

/**
 * @class
 * @name Alert
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
        this.status = description;

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
    public data: List<Alert>;
    public total: number;
    public limit: number
    public offset: number

    constructor( data: List<Alert>, total: number = 0, limit: number = 0, offset: number = 0){
        /**
         * @public
         * @readonly
         * @property {List<Alert>} id The List of Alerts retrieved
         * @instance
         */
        this.data = data;

        /**
         * @public
         * @readonly
         * @property {number} total The Total number of items available
         * @instance
         */
        this.total = total;

        /**
         * @public
         * @readonly
         * @property {number} limit The number of items asked
         * @instance
         */
        this.limit = limit;

        /**
         * @public
         * @readonly
         * @property {number} offset The Offset used
         * @instance
         */
        this.offset = offset;

    }
}

module.exports = {Alert, AlertsData};
export {Alert, AlertsData};
