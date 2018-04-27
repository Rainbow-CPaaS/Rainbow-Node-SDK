//    function($q, $rootScope, $log, $http, $interval, Offer, authService, contactService) {

"use strict";

//var service = this;
const Error = require("../common/Error");

const Offer = require('../common/models/Offer') ;

const LOG_ID = "PROFILES - ";


const FeaturesEnum = {
    COMPANY_ADMIN_COUNT: "COMPANY_ADMIN_COUNT",
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
    WEBRTC_P2P_RECORDING: "WEBRTC_P2P_RECORDING"
};

class ProfilesService {

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        this.logger = _logger;
        this.started = false;
        let that = this;

        this.onUserUpdateNeeded = (__event) =>
        {
            //wait 3 seconds before requesting the featureProfile for this user; ignore events in the meantime
            if (that.timer) {
                return;
            }
            that.timer = setTimeout(() => {
                that.getServerProfile()
                    .then(function () {
                        // $rootScope.$broadcast("ON_PROFILE_FEATURES_UPDATED");
                        that.logger.log("debug", LOG_ID + "(start) send rainbow_onprofilefeatureupdated ");
                        that._eventEmitter.emit("rainbow_onprofilefeatureupdated");
                        clearInterval(that.timer);
                        that.timer = null;
                    })
                    .catch(function (error) {
                        that.timer = null;
                        that.logger.log("warn", LOG_ID + "(onUserUpdateNeeded) FAILURE === " + error.message);
                        // reject(error);
                    });
            }, 3000);
        } ;


    }

    /*********************************************************************/
    /** LIFECYCLE STUFF                                                 **/
    /*********************************************************************/
    start (_xmpp, _rest, stats) {
        let that = this;

        //that.logger.log("debug", LOG_ID + "(start) ");
        that.logger.log("info", LOG_ID + "(start) [profileService] === STARTING ===");

        that.stats = stats ? stats : [];

        that._xmpp = _xmpp;
        that._rest = _rest;

        that.features = {};
        that.profiles = [];
        that.mainOffers = [];
        that.startDate = new Date();

    }

    stop () {
        let that = this;
        that.logger.log("debug", LOG_ID + "(stop) [profileService] === STOPPING ===");

        that.started = false;
        that.logger.log("debug", LOG_ID + "(stop) [profileService] === STOPPED ===");
        return Promise.resolve();
    }

    restart () {
        let that = this;
        that.logger.log("debug", LOG_ID + "(restart) [profileService] === RESTART ===");

        //resend the features for the desktop client
        this.onUserUpdateNeeded();
    }

    init () {
        let that = this;
        return new Promise((resolve, reject) => {
            // Fetch profile from server
            that.getServerProfile()
                .then(function () {
                    // Consider service as started
                    that.started = true;

                    var startDuration = Math.round(new Date() - that.startDate);
                    that.stats.push({service: "profileService", startDuration: startDuration});
                    that.logger.log("debug", LOG_ID + "(start) [profileService] === STARTED (" + startDuration + " ms) ===");

                    //$rootScope.$broadcast("ON_PROFILE_FEATURES_UPDATED");
                    that.logger.log("debug", LOG_ID + "(start) send rainbow_onprofilefeatureupdated ");
                    that._eventEmitter.emit("rainbow_onprofilefeatureupdated");


                    // NED TO BE PORTED !!!!!!!
                    // $rootScope.$on("$destroy", $rootScope.$on("ON_PROFILE_FEATURES_UPDATE_NEEDED", that.onUserUpdateNeeded));

                    resolve();
                })
                .catch(function (error) {
                    that.logger.log("warn", LOG_ID + "([profileService] === STARTING FAILURE === " + error.message);
                    reject(error);
                });
        });
    }

    /*********************************************************************/
    /** PROFILE API STUFF                                          **/
    /*********************************************************************/
    getServerProfile () {
        let that = this;
        return Promise.all([that.getServerProfiles(), that.getServerProfilesFeatures()]);
    }

    getServerProfiles () {
        let that = this;
        return new Promise( (resolve, reject) => {
            that._rest.getServerProfiles()
            /* $http({
                method: "GET",
                url: config.restServerUrl + "/api/rainbow/enduser/v1.0/users/" + contactService.userContact.dbId + "/profiles",
                headers: authService.getRequestHeader()
            }) // */ .then(
                function success(response) {
                    that.profiles = [];
                    that.mainOffers = [];
                    response.forEach(function (profileData) {
                        that.logger.log("debug", LOG_ID + "(getServerProfiles) === response ===" + profileData);
                        //store profile data
                        that.profiles.push(profileData);
                        var offer = Offer.offerManager.createOfferFromProfileData(profileData);
                        if (offer.isExclusive || offer.isDefault) {
                            that.mainOffers.push(offer);
                        }
                    });
                    that.mainOffers.sort(Offer.offerManager.offerComparator);
                    resolve();
                },
                function error(response) {
                    var errorMessage = "(getServerProfiles) failure: no server response";
                    if (response) {
                        errorMessage = "(getServerProfiles) failure: " + JSON.stringify(response);
                    }
                    that.logger.log("error", LOG_ID + "(getServerProfiles) : " + errorMessage);
                    reject( Error.OTHERERROR("REQUESTERROR", errorMessage));
                });
        });
    }

    getServerProfilesFeatures () {
        let that = this ;
        return new Promise((resolve, reject) => {
            /* $http({
                method: "GET",
                url: config.restServerUrl + "/api/rainbow/enduser/v1.0/users/" + contactService.userContact.dbId + "/profiles/features",
                headers: authService.getRequestHeader()
            }) // */
            that._rest.getServerProfilesFeatures().then(
                function success(response) {
                    that.features = {};
                    response.forEach(function (featureData) {
                        that.logger.log("debug", LOG_ID + "(getServerProfilesFeatures) === response ===" + featureData);
                        //store feature data
                        if (featureData.hasOwnProperty("featureUniqueRef")) {
                            that.features[featureData.featureUniqueRef] = featureData;
                        }
                    });
                    resolve();
                },
                function error(response) {
                    let errorMessage = "(getServerProfilesFeatures) failure : no server response";
                    if (response) {
                        errorMessage = "(getServerProfilesFeatures) failure : " + JSON.stringify(response);
                    }
                    that.logger.log("error", LOG_ID + "(getServerProfilesFeatures) " + errorMessage);
                    reject(Error.OTHERERROR("REQUESTERROR", errorMessage));
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
            var url = config.restServerUrl + "/api/rainbow/enduser/v1.0/users/" + contactService.userContact.dbId;
            $http({method: "PUT", url: url, headers: authService.getRequestHeader(), data: params})
                .then(
                    function success(result) {
                        $log.info("[profileService] setUserData " + JSON.stringify(params) + " -- success");
                        resolve(result.data);
                    },
                    function failure(response) {
                        var errorMessage = "setUserData failure: no server response";
                        if (response) {
                            errorMessage = "setUserData failure: " + JSON.stringify(response);
                        }
                        $log.error("[profileService] " + errorMessage);
                    reject( Error.OTHERERROR("REQUESTERROR", errorMessage));
                    });
        });
    }
    // */

    /**
     * APIs for GUI components
     * Used by SDK (public)
     * Warning when modifying this method
     */
    isFeatureEnabled (featureUniqueRef) {
        let that = this;
        if (that.started &&
            that.features.hasOwnProperty(featureUniqueRef) &&
            that.features[featureUniqueRef].hasOwnProperty("featureType") &&
            that.features[featureUniqueRef].featureType === "boolean" &&
            that.features[featureUniqueRef].hasOwnProperty("isEnabled")) {
            var enabled = that.features[featureUniqueRef].isEnabled;
            that.logger.log("debug", LOG_ID + "(isFeatureEnabled) : " + featureUniqueRef + " : " + enabled);
            return enabled;
        }
        that.logger.log("debug", LOG_ID + "(isFeatureEnabled) : " + featureUniqueRef + " : service not started or feature not enabled");
        return false;
    }

    getFeatureLimitMax (featureUniqueRef) {
        let that = this ;
        if (that.started &&
            that.features.hasOwnProperty(featureUniqueRef) &&
            that.features[featureUniqueRef].hasOwnProperty("featureType") &&
            that.features[featureUniqueRef].featureType === "number" &&
            that.features[featureUniqueRef].hasOwnProperty("limitMax")) {
            var limitMax = that.features[featureUniqueRef].limitMax;
            that.logger.log("debug", LOG_ID + "(getFeatureLimitMax) : " + featureUniqueRef + " : " + limitMax);
            return limitMax;
        }
        that.logger.log("debug", LOG_ID + "(getFeatureLimitMax) : " + featureUniqueRef + " : service not started or feature not enabled");
        return 0;
    }

    getFeatureLimitMin (featureUniqueRef) {
        let that = this ;
        if (that.started &&
            that.features.hasOwnProperty(featureUniqueRef) &&
            that.features[featureUniqueRef].hasOwnProperty("featureType") &&
            that.features[featureUniqueRef].featureType === "number" &&
            that.features[featureUniqueRef].hasOwnProperty("limitMin")) {
            var limitMin = that.features[featureUniqueRef].limitMin;
            that.logger.log("debug", LOG_ID + "(getFeatureLimitMin) : " + featureUniqueRef + " : " + limitMin);
            return limitMin;
        }
        that.logger.log("debug", LOG_ID + "(getFeatureLimitMin) : " + featureUniqueRef + " : service not started or feature not enabled");
        return 0;
    }

    /**
     * Returns the profile "Enterprise", "Business", "Essential" or null (if none of them)
     */
    getMyProfileOffer () {
        let that = this;
        if (that.mainOffers.length > 0) {
            return that.mainOffers.slice(-1)[0];
        }
        return null;
    }

    getMyProfileName () {
        let that = this ;
        var profile = that.getMyProfileOffer();
        if (profile) {
            return profile.name;
        }
        return null;
    }

    /**
     * APIs for GUI components
     * Used by SDK (public)
     */
    getMyProfiles () {
        let that = this ;
        var profiles = [];
        if (that.started) {
            //TODO return a simplified profile object ???
            profiles = that.profiles;
        } else {
            that.logger.log("debug", LOG_ID + "(getMyProfiles) : service not started");
        }
        return profiles;
    }

    /**
     * Used by SDK (public)
     * Warning when modifying this method
     */
    getMyProfileFeatures () {
        let that = this;
        var profileFeatures = {};
        if (that.started) {
            //return a simplified feature object with featureType, limitMin, limitMax and isEnabled properties only
            Object.keys(that.features).forEach(function (featureUniqueRef) {
                var originalFeature = that.features[featureUniqueRef];
                var feature = {};
                Object.keys(originalFeature).filter(function (featureProperty) {
                    return (featureProperty === "featureUniqueRef" || featureProperty === "featureType" || featureProperty === "limitMin" || featureProperty === "limitMax" || featureProperty === "isEnabled");
                }).forEach(function (featureProperty) {
                    feature[featureProperty] = originalFeature[featureProperty];
                });
                profileFeatures[featureUniqueRef] = feature;
            });
        } else {
            that.logger.log("warn", LOG_ID + "(getMyProfileFeatures) : service not started");
        }
        return profileFeatures;
    }

    getFeaturesEnum() {
        return FeaturesEnum;
    }

}

module.exports = {"ProfilesService" : ProfilesService, "FeaturesEnum" : FeaturesEnum } ;