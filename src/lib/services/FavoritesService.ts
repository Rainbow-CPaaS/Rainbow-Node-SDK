"use strict";
import {Logger} from "../common/Logger";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {logEntryExit} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {FavoriteEventHandler} from '../connection/XMPPServiceHandler/favoriteEventHandler';
import { Favorite } from '../common/models/Favorite';
import {ErrorManager} from "../common/ErrorManager";
import {isStarted} from "../common/Utils";
import {EventEmitter} from "events";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {GenericService} from "./GenericService";

const LOG_ID = "FAVTE/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
* @module
* @name FavoritesService
 * @version SDKVERSION
 * @public
* @description
*      This module is the basic module for handling Favorites in Rainbow. In Rainbow, Favorites are the way to list a most frequent, most used or the most important conversations, bubbles and bots. <br>
*      The main methods and events proposed in that service allow to: <br>
*      - Create or delete a Rainbow Favorite (one-to-one, bubble or bot), <br>
*      - Retrieve all information linked to that Favorite, <br>
*/
class FavoritesService extends GenericService{
    private _favoriteEventHandler: FavoriteEventHandler;
    private _favoriteHandlerToken: any;
    //public static $inject: string[] = ['$http', '$log', 'contactService', 'authService', 'roomService', 'conversationService', 'xmppService'];
    private favorites: Favorite[] = [];

    static getClassName(){ return 'FavoritesService'; }
    getClassName(){ return FavoritesService.getClassName(); }

    constructor(_core:Core, _eventEmitter : EventEmitter, logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(logger, LOG_ID);

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        this._startConfig = _startConfig;
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = logger;

        this._core = _core;

        this._eventEmitter.on("evt_internal_favoritecreated_handle", this.onFavoriteCreated.bind(this));
        this._eventEmitter.on("evt_internal_favoriteupdated_handle", this.onFavoriteUpdated.bind(this));
        this._eventEmitter.on("evt_internal_favoritedeleted_handle", this.onFavoriteDeleted.bind(this));
    }


    public async start(_options) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;
        that.initStartDate();
        that._xmpp = that._core._xmpp;
        that._rest = that._core._rest;
        that._options = _options;
        that._s2s = that._core._s2s;
        that._useXMPP = that._options.useXMPP;
        that._useS2S = that._options.useS2S;
        this._favoriteHandlerToken = [];

        that._logger.log("info", LOG_ID + " ");
        that._logger.log("info", LOG_ID + "[start] === STARTING ===");
        this.attachHandlers();

        //this.conversationService.favoriteService = this;
        //this.attachHandlers();

        //stats.push({ service: 'favoriteService', startDuration: startDuration });
        that.setStarted ();
    }

    public async stop() {
        let that = this;

        that._logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this._initialized = false;

        that._xmpp = null;
        that._rest = null;

        delete that._favoriteEventHandler;
        that._favoriteEventHandler = null;
        if (that._favoriteHandlerToken) {
            that._favoriteHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        }
        that._favoriteHandlerToken = [];

        /*this.$log.info('Stopping');
        if (this._xmppManagementHandler) {
            this.xmppService.deleteHandler(this._xmppManagementHandler);
            this._xmppManagementHandler = null;
        }
        this.$log.info('Stopped');

         */

        that.setStopped ();
        that._logger.log("info", LOG_ID + "[stop] Stopped");
    }

    public async init (useRestAtStartup : boolean) {
        let that = this;
        if (useRestAtStartup) {
            await that.getServerFavorites().then(()=> {
                that.setInitialized();
            }).catch(()=>{
                that.setInitialized();
            });
        }

        /*await setTimeoutPromised(3000).then(() => {
            let startDate = new Date();
            that.getCallLogHistoryPage()
                .then(() => {
                    // @ts-ignore
                    let duration = new Date() - startDate;
                    let startDuration = Math.round(duration);
                    that._logger.log("info", LOG_ID + " callLogService start duration : ",  startDuration);
                    that._logger.log("info", LOG_ID + "[start] === STARTED (" + startDuration + " ms) ===");
                    that.started = true;
                })
                .catch(() => {
                    that._logger.log("error", LOG_ID + "[start] === STARTING FAILURE ===");
                });
        });

         */

    }

    private attachHandlers() {
        let that = this;

        that._logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._favoriteEventHandler = new FavoriteEventHandler(that._xmpp, that);
        that._favoriteHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._favoriteEventHandler.MESSAGE_MANAGEMENT, that._favoriteEventHandler.onManagementMessageReceived.bind(that._favoriteEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._favoriteEventHandler.MESSAGE_ERROR, that._favoriteEventHandler.onErrorMessageReceived.bind(that._favoriteEventHandler))
        ];

        /*
        if (this._xmppManagementHandler) { this.xmppService.deleteHandler(this._xmppManagementHandler); }
        this._xmppManagementHandler = this.xmppService.addHandler((stanza) => { this.onXmppEvent(stanza); return true; }, null, "message", "management");

         */

        /*
        //if reconnection, update the call-logs
        if (that.started && that.lastTimestamp) {
            $interval(function () {
                that.getCallLogHistoryPage(that.lastTimestamp);
            }, 1000, 1, true);
        }
        // */
    }


    public async reconnect() {
        await this.getServerFavorites();
        //this.conversationService.favoriteService = this;
        this.attachHandlers();
    }


    private async getServerFavorites( peerId: string = undefined): Promise<Favorite[]> {
        try {
            let that = this;
            return new Promise(async (resolve, reject) => {
                this._rest.getServerFavorites(peerId).then(async (favorite : []) => {
                    if (favorite) {
                        that._logger.log("info", LOG_ID + "(getServerFavorites) favorite tab length : ", favorite.length);
                        let promises = favorite.map(async (data: any) => {
                            return this.createFavoriteObj(data.id, data.peerId, data.type, data.position);
                        });
                        let favorites = await Promise.all(promises);
                        this.favorites = favorites.filter((favorite) => {
                            return favorite !== null;
                        });
                        that._logger.log("info", LOG_ID + `getServerFavorites -- SUCCESS -- found ${this.favorites.length} favorites`);
                    } else {
                        that._logger.log("info", LOG_ID + "(getServerFavorites) favorite return by REST service is null.");
                    }
                    resolve(this.favorites);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getServerFavorites) error.");
                    that._logger.log("internalerror", LOG_ID + "(getServerFavorites) error : ", err);
                    return reject(err);
                });

                /*
//            let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites`;
  //          let response = await this.$http({ method: "GET", url: url, headers: this.authService.getRequestHeader() });
            let promises = response.data.data.map(async (data: any) => { return this.createFavorite(data.id, data.peerId, data.type); });
            let favorites = await Promise.all(promises);
            this.favorites = favorites.filter((favorite) => { return favorite !== null; });
            this.$log.info(`getServerFavorites -- SUCCESS -- found ${this.favorites.length} favorites`);
            return this.favorites;
            */
            });
        }
        catch (error) {
            let errorMessage = `getServerFavorites -- FAILURE -- ${error.message}`;
            this._logger.log("error", LOG_ID + `[getServerFavorites] CATCH Error !!! `);
            this._logger.log("internalerror", LOG_ID + `CATCH Error !!! : ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    private async addServerFavorite(peerId: string, type: string, position : number= undefined) {
        let that = this;
        try {
            let favorite = await that._rest.addServerFavorite(peerId, type, position);
            that._logger.log("internal", LOG_ID +`addServerFavorite(${peerId}, ${type}) -- SUCCESS`, favorite);
            return favorite;
        }
        catch (error) {
            let errorMessage = `addServerFavorite(${peerId}, ${type}) -- FAILURE -- ${error.message}`;
            that._logger.log("error", LOG_ID + `[addServerFavorite] Error.`);
            that._logger.log("internalerror", LOG_ID + `${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    private async removeServerFavorite(favoriteId: string) {
        let that = this;
        try {
            return new Promise(async (resolve, reject) => {
                that._rest.removeServerFavorite(favoriteId).then(async (favoriteDeleted ) => {
                    that._logger.log("info", LOG_ID +"(removeServerFavorite) -- SUCCESS.");
                    that._logger.log("internal", LOG_ID +"(removeServerFavorite) -- SUCCESS : ", favoriteDeleted);
                    resolve(favoriteDeleted);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(removeServerFavorite) error.");
                    that._logger.log("internalerror", LOG_ID + "(removeServerFavorite) error : ", err);
                    return reject(err);
                });

            });
        }
        catch (error) {
            let errorMessage = `removeServerFavorite(${favoriteId}) -- FAILURE -- ${error.statusText}`;
            that._logger.log("error", LOG_ID +`[removeServerFavorite] Error.`);
            that._logger.log("internalerror", LOG_ID +`${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    private async toggleFavorite(conversation: any): Promise<any> {
        let peerId = conversation.contact ? conversation.contact.dbId : conversation.room.dbId;
        let type = conversation.contact ? (conversation.contact.isBot ? 'bot' : 'user') : 'room';
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        if (!favorite) {
            return this.addServerFavorite(peerId, type);
        } else {
            return this.removeServerFavorite(favorite.id);
        }
    }

    private updateFavorites(conversation: any): void {
        let peerId = conversation.contact ? conversation.contact.dbId : conversation.room.dbId;
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        if (favorite) { conversation.isFavorite = true; favorite.conv = conversation; }
    }

    //region Favorites MANAGEMENT
    
    private async createFavoriteObj(id: string, peerId: string, type: string, position: number) {
        let that = this;
        try {
            let favorite: any = new Favorite(id, peerId, type, position);

            /*
            // Get peer object
            if (type === 'room') { favorite.room = this.roomService.getRoomById(peerId); }
            else { favorite.contact = await this.contactService.getContactByDBId(peerId); }

            // Fetch eventual conversation
            let convId: string = favorite.room ? favorite.room.jid : favorite.contact.jid;
            let conv: any = this.conversationService.getConversationById(convId);
            if (conv) { conv.isFavorite = true; favorite.conv = conv; }

             */
            return favorite;
        }
        catch (error) {
            that._logger.log("error", LOG_ID + `[createFavorite] Error.`);
            that._logger.log("internalerror", LOG_ID + `createFavorite(${id}, ${peerId}, ${type}) -- FAILURE -- ${error.message}`);
            return null;
        }
    }

    /**
     * @public
     * @nodered true
     * @since 1.56
     * @method createFavorite()
     * @category Favorites MANAGEMENT
     * @instance
     * @description
     *   Add conversation/bubble/bot to Favorites Array <br>
     * @param {string} id of the conversation/bubble
     * @param {string} type of Favorite (can be 'user' or 'bubble')
     * @return {Promise<Favorite>} A Favorite object
     */
    public async createFavorite(id : string, type : string) : Promise<Favorite> {
        let that = this;

        return new Promise((resolve, reject) => {

            if (!id) {
                that._logger.log("debug", LOG_ID + "[createFavorite] :: Error: parameter 'id' is missing or null");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!type) {
                that._logger.log("debug", LOG_ID + "[createFavorite] :: Error: parameter 'type' is missing or null");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (type !== "bubble" && type !== "user") {
                that._logger.log("debug", LOG_ID + "[createFavorite] :: Error: type should be set to \"user\" or \"bubble\"");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (type === "bubble") {
                type = "room"
            }

            that.addServerFavorite(id, type).then((favorite: any) => {
                that._logger.log("debug", LOG_ID + `[createFavorite] :: Successfully added ${type} to favorites`);
                return resolve(favorite);
            }).catch(err => {
                that._logger.log("error", LOG_ID + "[createFavorite] :: Error.");
                that._logger.log("internalerror", LOG_ID + "[createFavorite] :: Error : ", err);
                return reject(err)
            })

        });
    };

    /**
     * @public
     * @since 1.56
     * @nodered true
     * @method deleteFavorite()
     * @category Favorites MANAGEMENT
     * @instance
     * @description
     *   Delete conversation/bubble/bot from Favorites Array <br>
     * @param {string} id of the Favorite item
     * @return {Favorite[]} A Favorite object
     */
    async deleteFavorite(id : string) : Promise<any>{
        let that = this;
        return new Promise((resolve, reject) => {
            if (!id) {
                that._logger.log("debug", LOG_ID + "[deleteFavorite] :: Error: parameter 'id' is missing or null");
                return reject("[deleteFavorite] :: Error: parameter 'id' is missing or null");
            }

            that.removeServerFavorite(id)
                .then((favDeleted) => {
                    return resolve(favDeleted)
                })
                .catch(err => {
                    that._logger.log("error", LOG_ID + "[deleteFavorite] :: Error.");
                    that._logger.log("internalerror", LOG_ID + "[deleteFavorite] :: Error : ", err);
                    return reject(err)
                })
        })
    }

    //endregion Favorites MANAGEMENT
    
    //region Favorites GET

    /**
     * @public
     * @nodered true
     * @method getFavorite
     * @category Favorites GET
     * @instance
     * @description
     * get favorite from cache by Id.
     * @param {string} peerId The id of the favorite.
     * @return {Promise<Favorite>} The favorite corresponding to the peerId
     */
    public async getFavorite(peerId: string) : Promise<Favorite> {
        let favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        //let convGetter = favorite.contact ? this.conversationService.getOrCreateOneToOneConversation(favorite.contact.jid) : this.conversationService.getRoomConversation(favorite.room.jid);
        //return await convGetter;
        return favorite;
    }
    
    /**
     * @public
     * @since 1.56
     * @nodered true
     * @method fetchAllFavorites
     * @category Favorites GET
     * @instance
     * @param {string} peerId Allows to retrieve only the requested peerId(s) from user's favorites
     * @description
     *   Fetch all the Favorites from the server in a form of an Array <br>
     * @return {Array<Favorite>} An array of Favorite objects
     */
    public async fetchAllFavorites(peerId: string = undefined) : Promise<Array<Favorite>> {
        let that = this;

        return new Promise((resolve, reject) => {
            that.getServerFavorites(peerId)
                    .then(function(favorites) {
                        that._logger.log("debug", LOG_ID + `[fetchAllFavorites] :: Successfully fetched the Favorites`);
                        that._logger.log("internal", LOG_ID + `[fetchAllFavorites] :: Successfully fetched the Favorites : `, favorites);
                        resolve(favorites)
                    })
                    .catch(function(err) {
                        that._logger.log("error", LOG_ID + `[fetchAllFavorites] :: Error.`);
                        that._logger.log("internalerror", LOG_ID + `[fetchAllFavorites] :: ERROR : `, err);
                        return reject(err)
                    })
        });
    };

    /**
     * @public
     * @since 2.21.0
     * @nodered true
     * @method checkIsPeerSettedAsFavorite
     * @category Favorites GET
     * @instance
     * @param {string} peerId peerId unique identifier
     * @description
     *   This API can be used to check if a given peerId is in user's favorites. <br>
     * @return {Array<Favorite>} The result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | isFavorite | Boolean | true if the requested peerId is in user's favorites, false otherwise. |
     * 
     */
    checkIsPeerSettedAsFavorite(peerId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(checkIsPeerSettedAsFavorite) peerId : ", peerId);

            if (!peerId) {
                that._logger.log("debug", LOG_ID + "(checkIsPeerSettedAsFavorite) bad or empty 'peerId' parameter : ", peerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.checkIsPeerSettedAsFavorite(peerId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(checkIsPeerSettedAsFavorite) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @since 2.21.0
     * @nodered true
     * @method getFavoriteById
     * @category Favorites GET
     * @instance
     * @param {string} favoriteId Favorite unique identifier
     * @description
     *   This API can be used to retrieve a specific user's favorite by Id. <br>
     * @return {Array<Favorite>} The result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Id of the favorite. |
     * | peerId | String | userId, roomId, botId, directoryId or office365Id of the favorite. |
     * | position | Integer | position of the favorite in favorite list (first position is 0). |
     * | type | string | Type of the favorite peer:<br><br>* `user` for User to User favorite type,<br>* `room` for User to Room favorite type.<br>* `bot` for User to Bot service favorite type.<br>* `directory` for User to Directory service favorite type.<br>* `office365` for User to Office365 service favorite type.<br><br>Possibles values : `"user"`, `"room"`, `"bot"`, `"directory"`, `"office365"` |
     * 
     */
    getFavoriteById(favoriteId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getFavoriteById) favoriteId : ", favoriteId);

            if (!favoriteId) {
                that._logger.log("debug", LOG_ID + "(getFavoriteById) bad or empty 'favoriteId' parameter : ", favoriteId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getFavoriteById(favoriteId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getFavoriteById) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @since 2.21.0
     * @method getAllUserFavoriteList
     * @category Favorites GET
     * @instance
     * @param {string} peerId Allows to retrieve only the requested peerId(s) from user's favorites.
     * @description
     *   This API can be used to retrieve the list of user's favorites. <br>
     * @return {Array<Favorite>} The result
     *
     *
     *  Array of Favorites.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Id of the favorite. |
     * | peerId | String | userId, roomId, botId, directoryId or office365Id of the favorite. |
     * | position | Integer | position of the favorite in favorite list (first position is 0). |
     * | type | string | Type of the favorite peer:<br><br>* `user` for User to User favorite type,<br>* `room` for User to Room favorite type.<br>* `bot` for User to Bot service favorite type.<br>* `directory` for User to Directory service favorite type.<br>* `office365` for User to Office365 service favorite type.<br><br>Possibles values : `"user"`, `"room"`, `"bot"`, `"directory"`, `"office365"` |
     *
     */
    getAllUserFavoriteList(peerId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getAllUserFavoriteList) peerId : ", peerId);

            if (!peerId) {
                that._logger.log("debug", LOG_ID + "(getAllUserFavoriteList) bad or empty 'peerId' parameter : ", peerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getAllUserFavoriteList(peerId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getAllUserFavoriteList) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @since 2.21.0
     * @nodered true
     * @method moveFavoriteToPosition
     * @category Favorites GET
     * @instance
     * @description
     *   This API can be used to update a favorite's position in favorite list. <br>
     * @return {Array<Favorite>} The result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Id of the favorite. |
     * | peerId | String | userId, roomId, botId, directoryId or office365Id of the favorite. |
     * | position | Integer | position of the favorite in favorite list (first position is 0). |
     * | type | string | Type of the favorite peer:<br><br>* `user` for User to User favorite type,<br>* `room` for User to Room favorite type.<br>* `bot` for User to Bot service favorite type.<br>* `directory` for User to Directory service favorite type.<br>* `office365` for User to Office365 service favorite type.<br><br>Possibles values : `"user"`, `"room"`, `"bot"`, `"directory"`, `"office365"` |
     *
     * @param {string} favoriteId Favorite unique identifier
     * @param {number} position new position in list. If position exceed favorites list size the favorite is moved to the end of the list
     */
    moveFavoriteToPosition (favoriteId : string, position : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(moveFavoriteToPosition) favoriteId : ", favoriteId);

            if (!favoriteId) {
                that._logger.log("debug", LOG_ID + "(moveFavoriteToPosition) bad or empty 'favoriteId' parameter : ", favoriteId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.moveFavoriteToPosition(favoriteId, position).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(moveFavoriteToPosition) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    //endregion Favorites GET

    // ******************* Event XMPP parsed in favoriteEventHandler ***************
    //region Events

    private async onXmppEvent(stanza) {
        try {/*
            let stanzaElem = $(stanza);
            let favoriteElem = stanzaElem.find("favorite");
            if (favoriteElem) {
                let id = favoriteElem.attr("id");
                let type = favoriteElem.attr("type");
                let peerId = favoriteElem.attr("peer_id");
                let action = favoriteElem.attr("action");

                if (action === 'create') {
                    let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
                    if (!favorite) {
                        favorite = await this.createFavorite(id, peerId, type);
                        this.favorites.push(favorite);
                        this.sendEvent('ON_FAVORITE_CREATED', { favorite });
                    }
                }

                if (action === 'delete') {
                    let index = this.favorites.findIndex((fav) => { return fav.id === id; });
                    if (index !== -1) {
                        let favorite = this.favorites[index];
                        if (favorite.conv) { favorite.conv.isFavorite = false; }
                        this.favorites.splice(index, 1);
                        this.sendEvent('ON_FAVORITE_DELETED', { favoriteId: favorite.id });
                    }
                }
            }
            return true;
            */
        }
        catch (error) { return true; }
    }

    /*private sendEvent(eventName: string, detail: any): void {
        let event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

     */

    public async  onFavoriteCreated(fav: {id:string, peerId: string, type: string, position: number}): Promise<void> {
        let that = this;
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === fav.peerId; });
        if (!favorite) {
            favorite = await this.createFavoriteObj(fav.id, fav.peerId, fav.type, fav.position);
            if (favorite) {
                this.favorites.push(favorite);
                //that._logger.log("internal", LOG_ID + "[onFavoriteCreated] send event : ", favorite);
                //this.sendEvent('ON_FAVORITE_CREATED', { favorite });

                that._eventEmitter.emit("evt_internal_favoritecreated", favorite);
            }
        }
    }

    public async  onFavoriteUpdated(fav: {id:string, peerId: string, type: string, position: number}): Promise<void> {
        let that = this;
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === fav.peerId; });
        if (!favorite) {
            favorite = await this.createFavoriteObj(fav.id, fav.peerId, fav.type, fav.position);
            if (favorite) {
                this.favorites.push(favorite);
                that._eventEmitter.emit("evt_internal_favoritecreated", favorite);
            }
        } else {
            favorite.id = fav.id;
            favorite.peerId = fav.peerId;
            favorite.type = fav.type;
            favorite.position = fav.position;
            that._eventEmitter.emit("evt_internal_favoriteupdated", favorite);
        }
    }

    public async onFavoriteDeleted(fav: {id:string, peerId: string, type: string, position: number}): Promise<void> {
        let that = this;
        let index = this.favorites.findIndex((fav) => { return fav.id === fav.id; });
        if (index !== -1) {
            let favorite = this.favorites[index];
            if (favorite.conv) { favorite.conv.isFavorite = false; }
            this.favorites.splice(index, 1);
            that._eventEmitter.emit("evt_internal_favoritedeleted", fav);
        }
    }
    
    //endregion Events
}

module.exports.FavoritesService = FavoritesService;
export {FavoritesService};
