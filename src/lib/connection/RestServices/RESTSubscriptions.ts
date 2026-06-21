'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/SUBS - ";

/**
 * Handles all REST API calls related to Favorites and Offers/Subscriptions.
 */
@logEntryExit(LOG_ID)
class RESTSubscriptions extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTSubscriptions'; }
    getClassName() { return RESTSubscriptions.getClassName(); }
    static getAccessorName() { return 'restsubscriptions'; }
    getAccessorName() { return RESTSubscriptions.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            let that = this;
            that.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }

    //region Favorites

    getServerFavorites(userId: string, peerId: string = undefined) {
        // GET /api/rainbow/enduser/v1.0/users/:userId/favorites
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getServerFavorites) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getServerFavorites) REST peerId : ", peerId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/favorites";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "peerId", peerId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getServerFavorites) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerFavorites) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerFavorites) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerFavorites) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerFavorites) error : ", err);
                return reject(err);
            });
        });
    }

    public async addServerFavorite(userId: string, peerId: string, type: string, position: number) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addServerFavorite) entry`);
        return new Promise(function (resolve, reject) {
            if (!peerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(addServerFavorite) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(addServerFavorite) No peerId provided");
                resolve(null);
            } else {
                let data = {peerId, type};

                let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/favorites";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "position", position);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(addServerFavorite) REST url : ", url);
                that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(addServerFavorite) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(addServerFavorite) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(addServerFavorite) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(addServerFavorite) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    public async checkIsPeerSettedAsFavorite(userId: string, peerId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkIsPeerSettedAsFavorite) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(checkIsPeerSettedAsFavorite) REST peerId : ", peerId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/favorites/peers/" + peerId + "/check";

            that._logger.log(that.INTERNAL, LOG_ID + "(checkIsPeerSettedAsFavorite) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkIsPeerSettedAsFavorite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkIsPeerSettedAsFavorite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkIsPeerSettedAsFavorite) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkIsPeerSettedAsFavorite) error : ", err);
                return reject(err);
            });
        });
    }

    public async getFavoriteById(userId: string, favoriteId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getFavoriteById) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getFavoriteById) REST favoriteId : ", favoriteId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/favorites/" + favoriteId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getFavoriteById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getFavoriteById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFavoriteById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFavoriteById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFavoriteById) error : ", err);
                return reject(err);
            });
        });
    }

    public async getAllUserFavoriteList(userId: string, peerId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllUserFavoriteList) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllUserFavoriteList) REST peerId  : ", peerId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/favorites";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "peerId ", peerId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllUserFavoriteList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllUserFavoriteList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllUserFavoriteList) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllUserFavoriteList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllUserFavoriteList) error : ", err);
                return reject(err);
            });
        });
    }

    moveFavoriteToPosition(userId: string, favoriteId: string, position: number) {
        // PUT /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(moveFavoriteToPosition) entry`);
        return new Promise(function (resolve, reject) {
            let data = {};
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/favorites/" + favoriteId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "position ", position);
            url = urlParamsTab[0];

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(moveFavoriteToPosition) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(moveFavoriteToPosition) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(moveFavoriteToPosition) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(moveFavoriteToPosition) error : ", err);
                return reject(err);
            });
        });
    }

    public async removeServerFavorite(userId: string, favoriteId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeServerFavorite) entry`);
        return new Promise(function (resolve, reject) {
            if (!favoriteId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeServerFavorite) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(removeServerFavorite) No favoriteId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/" + userId + "/favorites/" + favoriteId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeServerFavorite) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeServerFavorite) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(removeServerFavorite) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeServerFavorite) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Favorites

    //region Offers and subscriptions

    retrieveAllCompanyOffers(companyId: string, format: string = "small", name?: string, canBeSold?: boolean, autoSubscribe?: boolean, isExclusive?: boolean, isPrepaid?: boolean, profileId?: boolean, offerReference?: boolean, sapReference?: boolean, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) {
        // GET /api/rainbow/subscription/v1.0/companies/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveAllCompanyOffers) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanyOffers) REST companyId : ", companyId);

            let url: string = "/api/rainbow/subscription/v1.0/companies/" + companyId + "/offers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "canBeSold", canBeSold);
            addParamToUrl(urlParamsTab, "autoSubscribe", autoSubscribe);
            addParamToUrl(urlParamsTab, "isExclusive", isExclusive);
            addParamToUrl(urlParamsTab, "isPrepaid", isPrepaid);
            addParamToUrl(urlParamsTab, "profileId", profileId);
            addParamToUrl(urlParamsTab, "offerReference", offerReference);
            addParamToUrl(urlParamsTab, "sapReference", sapReference);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllCompanyOffers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanyOffers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllCompanyOffers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllCompanyOffers) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveAllCompanySubscriptions(companyId: string, format: string = "small") {
        // GET /api/rainbow/subscription/v1.0/companies/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveAllCompanySubscriptions) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanySubscriptions) REST companyId : ", companyId);

            let url: string = "/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanySubscriptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllCompanySubscriptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanySubscriptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllCompanySubscriptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllCompanySubscriptions) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeCompanyToOffer(companyId: string, offerId: string, maxNumberUsers?: number, autoRenew?: boolean) {
        // POST /api/rainbow/subscription/v1.0/companies/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(subscribeCompanyToOffer) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {offerId};

            if (maxNumberUsers != undefined) {
                params.maxNumberUsers = maxNumberUsers;
            }

            if (autoRenew != undefined) {
                params.autoRenew = autoRenew;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(subscribeCompanyToOffer) REST params : ", params);

            that.http.post("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeCompanyToOffer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeCompanyToOffer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(subscribeCompanyToOffer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(subscribeCompanyToOffer) error : ", err);
                return reject(err);
            });
        });
    }

    unSubscribeCompanyToSubscription(companyId: string, subscriptionId: string) {
        // DELETE /api/rainbow/subscription/v1.0/companies/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unSubscribeCompanyToSubscription) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeCompanyToSubscription) REST companyId : ", companyId + ", subscriptionId : ", subscriptionId);

            that.http.delete("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions/" + subscriptionId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unSubscribeCompanyToSubscription) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeCompanyToSubscription) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unSubscribeCompanyToSubscription) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unSubscribeCompanyToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeUserToSubscription(userId: string, subscriptionId: string) {
        // POST /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(subscribeUserToSubscription) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(subscribeUserToSubscription) REST params : ", params);

            that.http.post("/api/rainbow/admin/v1.0/users/" + userId + "/profiles/subscriptions/" + subscriptionId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeUserToSubscription) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeUserToSubscription) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(subscribeUserToSubscription) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(subscribeUserToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    unSubscribeUserToSubscription(userId: string, subscriptionId: string) {
        // DELETE /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unSubscribeUserToSubscription) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeUserToSubscription) REST params : ", params);

            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId + "/profiles/subscriptions/" + subscriptionId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unSubscribeUserToSubscription) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeUserToSubscription) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unSubscribeUserToSubscription) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unSubscribeUserToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    getAUserProfiles(userId: string) {
        // API https://api.openrainbow.org/admin/#api-users_profiles-admin_users_GetUserProfiles
        // GET /api/rainbow/admin/v1.0/users/:userId/profiles
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAUserProfiles) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfiles) REST userId : ", userId);

            let url: string = "/api/rainbow/admin/v1.0/users/" + userId + "/profiles";

            that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfiles) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAUserProfiles) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfiles) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAUserProfiles) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAUserProfiles) error : ", err);
                return reject(err);
            });
        });
    }

    getAUserProfilesFeaturesByUserId(userId: string) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAUserProfilesFeaturesByUserId) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + userId + "/profiles/features", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAUserProfilesFeaturesByUserId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfilesFeaturesByUserId) REST result : " + JSON.stringify(json) + " profiles features");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAUserProfilesFeaturesByUserId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAUserProfilesFeaturesByUserId) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Offers and subscriptions

}

module.exports = {'RESTSubscriptions': RESTSubscriptions};
export {RESTSubscriptions as RESTSubscriptions};
