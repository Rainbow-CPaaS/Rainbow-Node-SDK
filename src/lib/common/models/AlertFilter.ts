"use strict";

export {};
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";

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
    public data: List<AlertFilter>
    public total: number
    public limit: number
    public offset: number
    constructor(data: List<AlertFilter>, total: number = 0, limit: number = 0, offset: number = 0) {
        /**
         * @public
         * @readonly
         * @property {List<AlertFilter>} id The ID of the Filter
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
        this.offset = offset;
    }
}

module.exports = {AlertFilter, AlertFiltersData};
export {AlertFilter, AlertFiltersData};
