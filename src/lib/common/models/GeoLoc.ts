"use strict";
export {};

/**
 * @class
 * @name GeoLoc
 * @public
 * @description
 *      This function represents a GeoLoc object which is the GPS coordinates. <br>
 */
class GeoLoc {
    public datum : string;
    public latitude: string;
    public longitude: string;
    public altitude: string;

    public static create(datum : string, latitude: string, longitude: string, altitude : string ): GeoLoc {
        let geoLoc = new GeoLoc();
        geoLoc.datum = datum;
        geoLoc.latitude = latitude;
        geoLoc.longitude = longitude;
        geoLoc.altitude = altitude;
        return geoLoc;
    }
}

module.exports.GeoLoc = GeoLoc;
export {GeoLoc};
