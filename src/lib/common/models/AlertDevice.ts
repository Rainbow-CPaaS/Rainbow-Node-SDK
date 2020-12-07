"use strict";
export {};
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";

class AlertDevice {

    /// <summary>
    /// <see cref="String"/> - Device Id
    /// </summary>
    public id: string;

/// <summary>
/// <see cref="String"/> - Device Name
/// </summary>
    public name: string;

/// <summary>
/// <see cref="String"/> - Device type (Allowed values: web, desktop, mac, android, ios)
/// </summary>
    public type: string;

/// <summary>
/// <see cref="String"/> - User Id using this device
/// </summary>
    public userId: string;

/// <summary>
/// <see cref="String"/> - Company to which belongs this device (user's company).
/// </summary>
    public companyId: string;

/// <summary>
/// <see cref="String"/> - User Jabber IM identifier (copied from the associated user)
/// </summary>
    public jid_im: string;

/// <summary>
/// <see cref="String"/> - Resource part of the full jid used by the device to connect to xmpp server.
/// </summary>
    public Jid_resource: string;

/// <summary>
/// <see cref="DateTime"/> - Device creation date
/// </summary>
    public creationDate: string;

/// <summary>
/// <see cref="List{String}"/> - Ip Addresses
/// </summary>
    public ipAddresses: List<string>;

/// <summary>
/// <see cref="List{String}"/> - Mac Addresses
/// </summary>
    public macAddresses: List<string>;

/// <summary>
/// <see cref="String"/> - An Array of free tags associated to the device. (max 5 tags. Each 64 characters max)
/// </summary>
    public tags: List<string>;

/// <summary>
/// <see cref="Geolocation"/> - Geolocation of the device. (only latitude and longitude (in degrees) are used for the moment)
/// </summary>
    public geolocation: string; //Geolocation
    constructor(Id? : string ) {
        this.id = Id;
    }
}

class AlertDevicesData {
    /// <summary>
    /// List of AlertDevice found
    /// </summary>
    public data: List<AlertDevice>
/// <summary>
/// Total number of items available
/// </summary>
    public total: number;

/// <summary>
/// Number of items asked
/// </summary>
    public limit: number;

/// <summary>
/// Offset used
/// </summary>
    public offset: number;
}

module.exports.AlertDevice =  AlertDevice;
module.exports.AlertDevicesData = AlertDevicesData;
export {AlertDevice, AlertDevicesData};
