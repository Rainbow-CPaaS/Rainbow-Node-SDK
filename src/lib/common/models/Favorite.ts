"use strict";
export {};

export class Favorite {
    
    public id: string;
    public peerId: string;
    public type: string;
    public room: any;
    public contact: any;
    public conv: any;

    constructor(id: string, peerId: string, type: string) {
        this.id = id;
        this.peerId = peerId;
        this.type = type;
    }
}

exports.Favorite = Favorite;
module.exports.Favorite = Favorite;
