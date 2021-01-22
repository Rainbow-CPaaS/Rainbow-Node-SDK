"use strict";
export {};
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";

/**
 * @class
 * @name AlertDevice
 * @description
 *      This class represents an Alert device to receive the "Alert". It needs subscription to Alert license. <br>
 */
class AlertDevice {
    public id: string;
    public name: string;
    public type: string;
    public userId: string;
    public companyId: string;
    public jid_im: string;
    public jid_resource: string;
    public creationDate: string;
    public ipAddresses: List<string>;
    public macAddresses: List<string>;
    public tags: List<string>;
    public geolocation: string; //Geolocation
    
    constructor(id? : string , name?: string, type?: string, userId?: string, companyId?: string, jid_im?: string, jid_resource?: string, creationDate?: string, ipAddresses?: List<string>, macAddresses?: List<string>, tags?: List<string>, geolocation?: string) {
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Device
         * @instance
         */
        this.id = id;

        /**
         * @public
         * @readonly
         * @property {string} name The Name of the Device
         * @instance
         */
        this.name = name;

        /**
         * @public
         * @readonly
         * @property {string} type The type of the Device (Allowed values: web, desktop, mac, android, ios)
         * @instance
         */
        this.type = type;

        /**
         * @public
         * @readonly
         * @property {string} userId The User ID of the Device
         * @instance
         */
        this.userId = userId;

        /**
         * @public
         * @readonly
         * @property {string} companyId The Company to which belongs this device (user's company)
         * @instance
         */
        this.companyId = companyId;

        /**
         * @public
         * @readonly
         * @property {string} jid_im The User Jabber IM identifier (copied from the associated user)
         * @instance
         */
        this.jid_im = jid_im;

        /**
         * @public
         * @readonly
         * @property {string} jid_resource The Resource part of the full jid used by the device to connect to xmpp server.
         * @instance
         */
        this.jid_resource = jid_resource;

        /**
         * @public
         * @readonly
         * @property {string} creationDate The Device creation date
         * @instance
         */
        this.creationDate = creationDate;

        /**
         * @public
         * @readonly
         * @property {List<string>} ipAddresses The List of the IP Adresses
         * @instance
         */
        this.ipAddresses = ipAddresses;

        /**
         * @public
         * @readonly
         * @property {List<string>} macAddresses The Mac Addresses
         * @instance
         */
        this.macAddresses = macAddresses;

        /**
         * @public
         * @readonly
         * @property {List<string>} tags The An Array of free tags associated to the device. (max 5 tags. Each 64 characters max)
         * @instance
         */
        this.tags = tags;

        /**
         * @public
         * @readonly
         * @property {string} geolocation The Geolocation of the device. (only latitude and longitude (in degrees) are used for the moment)
         * @instance
         */
        this.geolocation = geolocation;
    }
}

/**
 * @class
 * @name AlertDevicesData
 * @description
 *      This class represents a list of retrieved "Alert Device" to receive the "Alert". <br>
 */
class AlertDevicesData {
    public data: List<AlertDevice>
    public total: number;
    public limit: number;
    public offset: number;

    constructor(data: List<AlertDevice>, total: number = 0, limit: number = 0, offset: number = 0) {
        /**
         * @public
         * @readonly
         * @property {List<string>} data The List of AlertDevice found
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

module.exports.AlertDevice =  AlertDevice;
module.exports.AlertDevicesData = AlertDevicesData;
export {AlertDevice, AlertDevicesData};
