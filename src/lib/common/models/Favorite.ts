"use strict";
import {AlertFilter, AlertFiltersData} from "./AlertFilter";

export {};

/**
 * @class
 * @name Favorite
 * @public
 * @description
 *      This class represents a Favorite. <br>
 */
class Favorite {
    
    public id: string;
    public peerId: string;
    public type: string;
    public room: any;
    public contact: any;
    public conv: any;
    public position: number;

    constructor(id: string, peerId: string, type: string, position: number) {
        /**
         * id of the Favorite 
         * @type {string}
         */
        this.id = id;
        /**
         * the peerId of the favorite
         * @type {string}
         */
        this.peerId = peerId;
        /**
         * The type of the favorite
         * @type {string}
         */
        this.type = type;
        /**
         * The position of the favorite
         * @type {number}
         */
        this.position = position;
    }
}

exports.Favorite = Favorite;
module.exports.Favorite = Favorite;

module.exports = {Favorite};
export {Favorite};
