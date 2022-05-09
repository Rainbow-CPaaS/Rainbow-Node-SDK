"use strict";
import {GenericService} from "./GenericService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Offer, offerManager} from '../common/models/Offer' ;
import {EventEmitter} from "events";
import {isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";

const LOG_ID = "PROFILES/SVCE - ";

const FeaturesEnum = {
    COMPANY_ADMIN_COUNT : "COMPANY_ADMIN_COUNT",
    COMPANY_LOGO_MODIFICATION : "COMPANY_LOGO_MODIFICATION",
    COMPANY_DOMAIN_NAME_MODIFICATION : "COMPANY_DOMAIN_NAME_MODIFICATION",
    COMPANY_DETAILS_MODIFICATION : "COMPANY_DETAILS_MODIFICATION",
    WEBRTC_FOR_MOBILE : "WEBRTC_FOR_MOBILE",
    BUBBLE_PARTICIPANT_COUNT : "BUBBLE_PARTICIPANT_COUNT",
    TELEPHONY_BASIC_CALL : "TELEPHONY_BASIC_CALL",
    TELEPHONY_SECOND_CALL : "TELEPHONY_SECOND_CALL",
    TELEPHONY_TRANSFER_CALL : "TELEPHONY_TRANSFER_CALL",
    TELEPHONY_CONFERENCE_CALL : "TELEPHONY_CONFERENCE_CALL",
    TELEPHONY_DEFLECT_CALL : "TELEPHONY_DEFLECT_CALL",
    TELEPHONY_PHONE_BOOK : "TELEPHONY_PHONE_BOOK",
    TELEPHONY_VOICE_MAIL : "TELEPHONY_VOICE_MAIL",
    TELEPHONY_CALL_FORWARD : "TELEPHONY_CALL_FORWARD",
    TELEPHONY_NOMADIC : "TELEPHONY_NOMADIC",
    CONFERENCE_PARTICIPANT_COUNT : "CONFERENCE_PARTICIPANT_COUNT",
    CONFERENCE_PARTICIPANT_ALLOWED : "CONFERENCE_PARTICIPANT_ALLOWED",
    WEBRTC_CONFERENCE_ALLOWED : "WEBRTC_CONFERENCE_ALLOWED",
    WEBRTC_CONFERENCE_PARTICIPANT_COUNT : "WEBRTC_CONFERENCE_PARTICIPANT_COUNT",
    WEBRTC_PARTICIPANT_ALLOWED : "WEBRTC_PARTICIPANT_ALLOWED",
    CONFERENCE_ALLOWED : "CONFERENCE_ALLOWED",
    CONFERENCE_DIAL_OUT : "CONFERENCE_DIAL_OUT",
    CONFERENCE_RECORDING : "CONFERENCE_RECORDING",
    MSO365_CALENDAR_PRESENCE : "MSO365_CALENDAR_PRESENCE",
    MSO365_DIRECTORY_SEARCH : "MSO365_DIRECTORY_SEARCH",
    MS_OUTLOOK_PLUGIN : "MS_OUTLOOK_PLUGIN",
    MS_SKYPE_PLUGIN : "MS_SKYPE_PLUGIN",
    FILE_SHARING_QUOTA_GB : "FILE_SHARING_QUOTA_GB",
    GOOGLE_CALENDAR_PRESENCE: "GOOGLE_CALENDAR_PRESENCE",
    WEBRTC_P2P_RECORDING: "WEBRTC_P2P_RECORDING",
    BUBBLE_PROMOTE_MEMBER: "BUBBLE_PROMOTE_MEMBER",
    BUBBLE_GUESTS_ALLOWED: "BUBBLE_GUESTS_ALLOWED",
    TELEPHONY_WEBRTC_GATEWAY: "TELEPHONY_WEBRTC_GATEWAY",
    TELEPHONY_WEBRTC_PSTN_CALLING: "TELEPHONY_WEBRTC_PSTN_CALLING",
    ANALYTICS_DASHBOARD_EC: "ANALYTICS_DASHBOARD_EC",
    ANALYTICS_DASHBOARD_BP: "ANALYTICS_DASHBOARD_BP",
    TELEPHONY_CALL_SUBJECT: "CALL_SUBJECT",
    CHANNEL_CREATE: "CHANNEL_CREATE",
    CHANNEL_CREATE_ADMIN_ROLE_BYPASS: "CHANNEL_CREATE_ADMIN_ROLE_BYPASS",
    CHANNEL_ACTIVATED: "CHANNEL_ACTIVATED",
    PERSONAL_CONFERENCE_ALLOWED:"CONFERENCE_ALLOWED",
    ALERT_NOTIFICATIONS_ALLOWED:"ALERT_NOTIFICATIONS_ALLOWED"

    /*COMPANY_ADMIN_COUNT: "COMPANY_ADMIN_COUNT",
    COMPANY_LOGO_MODIFICATION: "COMPANY_LOGO_MODIFICATION",
    COMPANY_DOMAIN_NAME_MODIFICATION: "COMPANY_DOMAIN_NAME_MODIFICATION",
    COMPANY_DETAILS_MODIFICATION: "COMPANY_DETAILS_MODIFICATION",
    WEBRTC_FOR_MOBILE: "WEBRTC_FOR_MOBILE",
    BUBBLE_PARTICIPANT_COUNT: "BUBBLE_PARTICIPANT_COUNT",
    TELEPHONY_BASIC_CALL: "TELEPHONY_BASIC_CALL",
    TELEPHONY_SECOND_CALL: "TELEPHONY_SECOND_CALL",
    TELEPHONY_TRANSFER_CALL: "TELEPHONY_TRANSFER_CALL",
    TELEPHONY_CONFERENCE_CALL: "TELEPHONY_CONFERENCE_CALL",
    TELEPHONY_DEFLECT_CALL: "TELEPHONY_DEFLECT_CALL",
    TELEPHONY_PHONE_BOOK: "TELEPHONY_PHONE_BOOK",
    TELEPHONY_VOICE_MAIL: "TELEPHONY_VOICE_MAIL",
    TELEPHONY_CALL_FORWARD: "TELEPHONY_CALL_FORWARD",
    CONFERENCE_PARTICIPANT_COUNT: "CONFERENCE_PARTICIPANT_COUNT",
    CONFERENCE_PARTICIPANT_ALLOWED: "CONFERENCE_PARTICIPANT_ALLOWED",
    WEBRTC_CONFERENCE_ALLOWED: "WEBRTC_CONFERENCE_ALLOWED",
    WEBRTC_CONFERENCE_PARTICIPANT_COUNT: "WEBRTC_CONFERENCE_PARTICIPANT_COUNT",
    WEBRTC_PARTICIPANT_ALLOWED: "WEBRTC_PARTICIPANT_ALLOWED",
    CONFERENCE_ALLOWED: "CONFERENCE_ALLOWED",
    CONFERENCE_DIAL_OUT: "CONFERENCE_DIAL_OUT",
    CONFERENCE_RECORDING: "CONFERENCE_RECORDING",
    MSO365_CALENDAR_PRESENCE: "MSO365_CALENDAR_PRESENCE",
    MSO365_DIRECTORY_SEARCH: "MSO365_DIRECTORY_SEARCH",
    MS_OUTLOOK_PLUGIN: "MS_OUTLOOK_PLUGIN",
    MS_SKYPE_PLUGIN: "MS_SKYPE_PLUGIN",
    FILE_SHARING_QUOTA_GB: "FILE_SHARING_QUOTA_GB",
    GOOGLE_CALENDAR_PRESENCE: "GOOGLE_CALENDAR_PRESENCE",
    WEBRTC_P2P_RECORDING: "WEBRTC_P2P_RECORDING" // */
};

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name ProfilesService
 * @version SDKVERSION
 * @public
 * @description
 *  This module is the service used to retrieve profiles from server. <br>
*/
class ProfilesService extends GenericService {
    private stats: any;
	public features: any;
	public profiles: any;
	public mainOffers: any;
    private thirdPartyApps: any = null;
    private startDate: any;
    private timer: NodeJS.Timeout;

    static getClassName(){ return 'ProfilesService'; }
    getClassName(){ return ProfilesService.getClassName(); }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    /*********************************************************************/
    /** LIFECYCLE STUFF                                                 **/
    /*********************************************************************/
    start (_options, _core, stats) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;

        //that._logger.log("debug", LOG_ID + "(start) ");
        that._logger.log("info", LOG_ID + "(start) [profileService] === STARTING ===");

        that.stats = stats ? stats : [];

        that._xmpp = _core._xmpp;
        that._rest = _core._rest;
        that._options = _options;
        that._s2s = _core._s2s;
        that._useXMPP = that._options.useXMPP;
        that._useS2S = that._options.useS2S;
        that.features = {};
        that.profiles = [];
        that.mainOffers = [];
        that.setStarted ();
    }

    stop () {
        let that = this;
//        that._logger.log("debug", LOG_ID + "(stop) [profileService] === STOPPING ===");

  //      that._logger.log("debug", LOG_ID + "(stop) [profileService] === STOPPED ===");
        that.setStopped ();
        return Promise.resolve(undefined);
    }

    restart () {
        let that = this;
        that._logger.log("debug", LOG_ID + "(restart) [profileService] === RESTART ===");

        //resend the features for the desktop client
        this.onUserUpdateNeeded();
    }

    init (useRest: boolean) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (useRest) {
                // Fetch profile from server
                that.getServerProfile().then(function () {
                            // Consider service as started
                            that.setInitialized();
                            //that.stats.push({service: "profileService", startDuration: startDuration});

                            //$rootScope.$broadcast("ON_PROFILE_FEATURES_UPDATED");
                            that._logger.log("debug", LOG_ID + "(start) send rainbow_onprofilefeatureupdated ");
                            that._eventEmitter.emit("evt_internal_profilefeatureupdated");

                            // NED TO BE PORTED !!!!!!!
                            // $rootScope.$on("$destroy", $rootScope.$on("ON_PROFILE_FEATURES_UPDATE_NEEDED", that.onUserUpdateNeeded));

                            that.setInitialized();
                            resolve(undefined);
                        })
                        .catch(function (error) {
                            that._logger.log("warn", LOG_ID + "([profileService] === getServerProfile FAILURE === ");
                            that._logger.log("internalerror", LOG_ID + "([profileService] === getServerProfile FAILURE === : " + error.message);
                            resolve(undefined);
                            //return reject(error);
                        });
            } else {
                that.setInitialized();
                resolve(undefined);
            }
        });
    
    }

    onUserUpdateNeeded ()
    {
        let that = this;
        //wait 3 seconds before requesting the featureProfile for this user; ignore events in the meantime
        if (that.timer) {
            return;
        }
        that.timer = setTimeout(() => {
            that.getServerProfile()
                    .then(function () {
                        // $rootScope.$broadcast("ON_PROFILE_FEATURES_UPDATED");
                        //that._logger.log("debug", LOG_ID + "(start) send rainbow_onprofilefeatureupdated ");
                        that._eventEmitter.emit("evt_internal_profilefeatureupdated");
                        clearInterval(that.timer);
                        that.timer = null;
                    })
                    .catch(function (error) {
                        that.timer = null;
                        that._logger.log("warn", LOG_ID + "(onUserUpdateNeeded) FAILURE .");
                        that._logger.log("internalerror", LOG_ID + "(onUserUpdateNeeded) FAILURE === ", error.message);
                        // reject(error);
                    });
        }, 3000);
    } ;
    
    //region Profiles PROFILES
    
    /*********************************************************************/
    /** PROFILE API STUFF                                          **/
    /*********************************************************************/
    /**
     * @public
     * @method getServerProfile
     * @async
     * @category Profiles PROFILES
     * @description
     * This API can be used to get user profiles and features.<br>
     * @return {Promise<any>}
     */
    async getServerProfile () {
        let that = this;
        return Promise.all([that.getServerProfiles(), that.getServerProfilesFeatures()]);
    }

    /**
     * @public
     * @method getServerProfiles
     * @async
     * @category Profiles PROFILES
     * @description
     * This API can be used to get user profiles.<br>
     * This API can only be used by user himself
     * @return {Promise<any>}
     */
    async getServerProfiles () {
        let that = this;
        return new Promise( (resolve, reject) => {
            that._rest.getServerProfiles()
            /* $http({
                method: "GET",
                url: config.restServerUrl + "/api/rainbow/enduser/v1.0/users/" + contactService.userContact.dbId + "/profiles",
                headers: authService.getRequestHeader()
            }) // */ .then(
                function success(response : []) {
                    that.profiles = [];
                    that.mainOffers = [];
                    response.forEach(function (profileData) {
                        that._logger.log("internal", LOG_ID + "(getServerProfiles) === response ===" + profileData);
                        //store profile data
                        that.profiles.push(profileData);
                        let offer = offerManager.createOfferFromProfileData(profileData);
                        if (offer.isExclusive || offer.isDefault) {
                            that.mainOffers.push(offer);
                        }
                    });
                    that.mainOffers.sort(offerManager.offerComparator);
                    resolve(undefined);
                },
                function error(response) {
                    let errorMessage = "(getServerProfiles) failure: no server response";
                    if (response) {
                        errorMessage = "(getServerProfiles) failure: " + JSON.stringify(response);
                    }
                    that._logger.log("error", LOG_ID + "(getServerProfiles) Error. ");
                    that._logger.log("internalerror", LOG_ID + "(getServerProfiles) Error : ", errorMessage);
                    return reject( ErrorManager.getErrorManager().OTHERERROR("REQUESTERROR", errorMessage));
                });
        });
    }

    /**
     * @public
     * @method getMyProfileOffer
     * @category Profiles PROFILES
     * @description
     * This API can be used to get user profile offer.<br>
     * Returns the profile "Enterprise", "Business", "Essential" or null (if none of them)
     * @return {any}
     */
    getMyProfileOffer () {
        let that = this;
        if (that.mainOffers.length > 0) {
            return that.mainOffers.slice(-1)[0];
        }
        return null;
    }

    /**
     * @public
     * @method getMyProfileName
     * @category Profiles PROFILES
     * @description
     * This API can be used to get user profile offer name.<br>
     * Returns the profile "Enterprise", "Business", "Essential" or null (if none of them)
     * @return {any}
     */
    getMyProfileName () {
        let that = this ;
        let profile = that.getMyProfileOffer();
        if (profile) {
            return profile.name;
        }
        return null;
    }

    /**
     * @public
     * @method getMyProfiles
     * @category Profiles PROFILES
     * @description
     * This API can be used to get user profiles.<br>
     * @return {any}
     */
    getMyProfiles () {
        let that = this ;
        let profiles = [];
        if (that._started) {
            //TODO return a simplified profile object ???
            profiles = that.profiles;
        } else {
            that._logger.log("debug", LOG_ID + "(getMyProfiles) : service not started");
        }
        return profiles;
    }

    /**
     * @public
     * @method getThirdPartyApps
     * @async
     * @category Profiles PROFILES
     * @param {boolean} force Parameter force in order to refresh the list 
     * @description
     *  Get The list of the Third Party Application that have access to this Rainbow Account. 
     * @return {Promise<any>}
     */
    public async getThirdPartyApps(force: boolean = false) {
        let that = this ;
        return new Promise(async (resolve, reject) => {
            try {
                // We've already asked the server for the list
                if (that.thirdPartyApps!==null && !force) {
                    that._logger.log("debug", LOG_ID + "(getThirdPartyApps) -- from cache");
                    return that.thirdPartyApps;
                }

                that.thirdPartyApps = await that._rest.getThirdPartyApps();
                that._logger.log("debug", LOG_ID + "(getThirdPartyApps) from server -- success");
                return that.thirdPartyApps;
            } catch (error) {
                let errorMessage = "(getThirdPartyApps) from server failed -- no answer from server";
                if (error) {
                    errorMessage = "(getThirdPartyApps) from server failed -- " + JSON.stringify(error);
                }
                that._logger.log("error", LOG_ID + "(getThirdPartyApps) Error : " + errorMessage);
                throw new Error(errorMessage);
            }
        });
    }

    /**
     * @public
     * @method revokeThirdPartyAccess
     * @async
     * @category Profiles PROFILES
     * @param {string} tokenId The tokenId should be sent as a parameter
     * @description
     * Revoke the access of a third-party application from Rainbow 
     * @return {Promise<any>}
     */
    public async revokeThirdPartyAccess(tokenId: string) {
        let that = this ;
        return new Promise(async (resolve, reject) => {
            try {
                if (!tokenId) {
                    that._logger.log("warn", LOG_ID + "(revokeThirdPartyAccess) missing token");
                    throw new Error('No tokenId');
                }
                that._logger.log("debug", LOG_ID + "(revokeThirdPartyAccess) with token -- " + tokenId);
                that.thirdPartyApps = await that._rest.revokeThirdPartyAccess(tokenId);
                that._logger.log("debug", LOG_ID + "(revokeThirdPartyAccess) -- success");
                that.thirdPartyApps.forEach((app: any, index: number) => {
                    if (app.id===tokenId) {
                        that.thirdPartyApps.splice(index, 1);
                    }
                });
                return this.thirdPartyApps;
            } catch (error) {
                let errorMessage = "(revokeThirdPartyAccess) from server failed -- no answer from server";
                if (error) {
                    errorMessage = "(revokeThirdPartyAccess) from server failed -- " + JSON.stringify(error);
                }
                that._logger.log("error", LOG_ID + "[profileService] ", errorMessage);
                throw new Error(errorMessage);
            }
        });
    }

    //endregion Profiles PROFILES

    //region Profiles FEATURES

    /**
     * @public
     * @method getServerProfilesFeatures
     * @async
     * @category Profiles FEATURES
     * @description
     * This API can be used to get user profile features.<br>
     * @return {Promise<any>}
     */
    async getServerProfilesFeatures () {
        let that = this ;
        return new Promise((resolve, reject) => {
            /* $http({
                method: "GET",
                url: config.restServerUrl + "/api/rainbow/enduser/v1.0/users/" + contactService.userContact.dbId + "/profiles/features",
                headers: authService.getRequestHeader()
            }) // */
            that._rest.getServerProfilesFeatures().then(
                function success(response : []) {
                    that.features = {};
                    response.forEach(function (featureData : any) {
                        that._logger.log("internal", LOG_ID + "(getServerProfilesFeatures) === response === : ", featureData);
                        //store feature data
                        if (featureData.hasOwnProperty("featureUniqueRef")) {
                            that.features[featureData.featureUniqueRef] = featureData;
                        }
                    });
                    resolve(undefined);
                },
                function error(response) {
                    let errorMessage = "(getServerProfilesFeatures) failure : no server response";
                    if (response) {
                        errorMessage = "(getServerProfilesFeatures) failure : " + JSON.stringify(response);
                    }
                    that._logger.log("error", LOG_ID + "(getServerProfilesFeatures) Error.");
                    that._logger.log("internalerror", LOG_ID + "(getServerProfilesFeatures) Error : ", errorMessage);
                    return reject(ErrorManager.getErrorManager().OTHERERROR("REQUESTERROR", errorMessage));
                });
        });
    }

    /*********************************************************************/
    /** USER DATA API STUFF                                             **/
    /*********************************************************************/
    /*getUserData getUserData() {
        return authService.getUserData();
    }

    setUserData setUserData(params) {
        return $q(function (resolve, reject) {
            let url = config.restServerUrl + "/api/rainbow/enduser/v1.0/users/" + contactService.userContact.dbId;
            $http({method: "PUT", url: url, headers: authService.getRequestHeader(), data: params})
                .then(
                    function success(result) {
                        $log.info("[profileService] setUserData " + JSON.stringify(params) + " -- success");
                        resolve(result.data);
                    },
                    function failure(response) {
                        let errorMessage = "setUserData failure: no server response";
                        if (response) {
                            errorMessage = "setUserData failure: " + JSON.stringify(response);
                        }
                        $log.error("[profileService] " + errorMessage);
                    reject( ErrorManager.getErrorManager().OTHERERROR("REQUESTERROR", errorMessage));
                    });
        });
    }
    // */

    /**
     * @public
     * @method isFeatureEnabled
     * @category Profiles FEATURES
     * @description
     * This API can be used to know if a feature is enabled.<br>
     * @return {any}
     */
    isFeatureEnabled (featureUniqueRef) {
        let that = this;
        if (that._started && that.features.hasOwnProperty(featureUniqueRef) && that.features[featureUniqueRef].hasOwnProperty("featureType") && that.features[featureUniqueRef].featureType === "boolean" && that.features[featureUniqueRef].hasOwnProperty("isEnabled")) {
            let enabled = that.features[featureUniqueRef].isEnabled;
            that._logger.log("debug", LOG_ID + "(isFeatureEnabled) : " + featureUniqueRef + " : " + enabled);
            return enabled;
        }
        that._logger.log("debug", LOG_ID + "(isFeatureEnabled) : " + featureUniqueRef + " : service not started or feature not enabled");
        return false;
    }

    /**
     * @public
     * @method getFeatureLimitMax
     * @category Profiles FEATURES
     * @description
     * This API can be used to get Max limit of feature.<br>
     * @return {any}
     */
    getFeatureLimitMax (featureUniqueRef) {
        let that = this ;
        if (that._started && that.features.hasOwnProperty(featureUniqueRef) && that.features[featureUniqueRef].hasOwnProperty("featureType") && that.features[featureUniqueRef].featureType === "number" && that.features[featureUniqueRef].hasOwnProperty("limitMax")) {
            let limitMax = that.features[featureUniqueRef].limitMax;
            that._logger.log("debug", LOG_ID + "(getFeatureLimitMax) : " + featureUniqueRef + " : " + limitMax);
            return limitMax;
        }
        that._logger.log("debug", LOG_ID + "(getFeatureLimitMax) : " + featureUniqueRef + " : service not started or feature not enabled");
        return 0;
    }

    /**
     * @public
     * @method getFeatureLimitMin
     * @category Profiles FEATURES
     * @description
     * This API can be used to get Min limit of feature.<br>
     * @return {any}
     */
    getFeatureLimitMin (featureUniqueRef) {
        let that = this ;
        if (that._started && that.features.hasOwnProperty(featureUniqueRef) && that.features[featureUniqueRef].hasOwnProperty("featureType") && that.features[featureUniqueRef].featureType === "number" && that.features[featureUniqueRef].hasOwnProperty("limitMin")) {
            let limitMin = that.features[featureUniqueRef].limitMin;
            that._logger.log("debug", LOG_ID + "(getFeatureLimitMin) : " + featureUniqueRef + " : " + limitMin);
            return limitMin;
        }
        that._logger.log("debug", LOG_ID + "(getFeatureLimitMin) : " + featureUniqueRef + " : service not started or feature not enabled");
        return 0;
    }

    /**
     * @public
     * @method getMyProfileFeatures
     * @category Profiles FEATURES
     * @description
     * This API can be used to get features of the profile of connected user.<br>
     * @return {any}
     */
    getMyProfileFeatures () {
        let that = this;
        let profileFeatures = {};
        if (that._started) {
            //return a simplified feature object with featureType, limitMin, limitMax and isEnabled properties only
            Object.keys(that.features).forEach(function (featureUniqueRef) {
                let originalFeature = that.features[featureUniqueRef];
                let feature = {};
                Object.keys(originalFeature).filter(function (featureProperty) {
                    return (featureProperty === "featureUniqueRef" || featureProperty === "featureType" || featureProperty === "limitMin" || featureProperty === "limitMax" || featureProperty === "isEnabled");
                }).forEach(function (featureProperty) {
                    feature[featureProperty] = originalFeature[featureProperty];
                });
                profileFeatures[featureUniqueRef] = feature;
            });
        } else {
            that._logger.log("warn", LOG_ID + "(getMyProfileFeatures) : service not started");
        }
        return profileFeatures;
    }

    getFeaturesEnum() {
        return FeaturesEnum;
    }

    //endregion Profiles FEATURES

}

module.exports = {"ProfilesService" : ProfilesService, "FeaturesEnum" : FeaturesEnum } ;
export {ProfilesService , FeaturesEnum}
