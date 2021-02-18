"use strict";
import {Bubble} from "./Bubble";

export {};
const AsyncLock = require('async-lock');
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";

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
    public domainUsername: string;
    
    constructor(id? : string , name?: string, type?: string, userId?: string, companyId?: string, jid_im?: string, jid_resource?: string, creationDate?: string, ipAddresses?: List<string>, macAddresses?: List<string>, tags?: List<string>, geolocation?: string, domainUsername? : string) {
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

        /**
         * @public
         * @readonly
         * @property {string} domainUsername The Domain Username of the device.
         * @instance
         */
        this.domainUsername = domainUsername
    }
}

/**
 * @class
 * @name AlertDevicesData
 * @description
 *      This class represents a list of retrieved "Alert Device" to receive the "Alert". <br>
 */
class AlertDevicesData {
    //public data: List<AlertDevice>
    private alertDevices: IDictionary<string, AlertDevice> = new Dictionary();
    public total: number;
    public limit: number;
    public offset: number;

    private lockEngine: any;
    private lockKey = "LOCK_ALERTDEVICE";
    
    constructor(limit: number = 0) {
        this.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});
        
        /**
         * @public
         * @readonly
         * @property {List<string>} data The List of AlertDevice found
         * @instance
         */
        // this.data = new List<AlertDevice>();

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

    // region Add/get/first/last/remove AlertDevice
    
    addAlertDevice (alertDevice : AlertDevice) : Promise<AlertDevice> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (!that.alertDevices.containsKey(alertDevice.id)) )
                {
                    that.total++;
                    //that._logger.log("debug", LOG_ID + "(addBubbleToJoin) We add the Bubble in the pool poolBubbleToJoin to join it as soon as possible - Jid : ", roomJid,", nbBubbleAdded : ", that.nbBubbleAdded);
                    that.alertDevices.add(alertDevice.id, alertDevice);
                    //needToAsk = true;
                    return alertDevice;
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

    async removeBubbleToJoin(alertDevice: AlertDevice): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if ( (that.alertDevices.containsKey(alertDevice.id)) )
                {
                    //that._logger.log("debug", LOG_ID + "(removeBubbleToJoin) We remove the Bubble from poolBubbleToJoin - Jid : ", roomJid);
                    that.alertDevices.remove((item: KeyValuePair<string, AlertDevice>) => {
                        return alertDevice.id === item.key;
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

    async getAlertDevice() : Promise<AlertDevice>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertDevice> = that.alertDevices.elementAt(0);
                if (!item) return ;
                let id = item.key;
                let alertDevice = item.value;
                //that._logger.log("debug", LOG_ID + "(getBubbleToJoin) We retrieved the Bubble from poolBubbleToJoin - Jid : ", roomJid);

                //that._logger.log("debug", LOG_ID + "(getBubbleToJoin) We remove the Bubble from poolBubbleToJoin - Jid : ", roomJid);
                that.alertDevices.remove((item: KeyValuePair<string, AlertDevice>) => {
                    return id === item.key;
                });
                return alertDevice;
            }).then((result) => {
                // that._logger.log("internal", LOG_ID + "(getBubbleToJoin) Succeed - bubble : ", result);
                resolve(result);
            }).catch((result) => {
                // that._logger.log("internal", LOG_ID + "(getBubbleToJoin) Failed - bubble : ", result);
                resolve(undefined);
            });
        });
    }
    
    first () : Promise<AlertDevice>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertDevice> = that.alertDevices.elementAt(0);
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
    
    last () : Promise<AlertDevice> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, AlertDevice> = that.alertDevices.elementAt(that.total);
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
    
    getAlertDevices (): IDictionary<string, AlertDevice> {
        let that = this;
        return that.alertDevices
    }
    
    //endregion
}

module.exports.AlertDevice =  AlertDevice;
module.exports.AlertDevicesData = AlertDevicesData;
export {AlertDevice, AlertDevicesData};
