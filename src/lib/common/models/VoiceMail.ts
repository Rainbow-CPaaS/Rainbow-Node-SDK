"use strict";
export {};


/**
 * @ngdoc factory
 * @module rainbow
 * @private
 * @name VoiceMail
 * @restrict E
 * @description VoiceMail model
 */

/*************************************************************/
/* STATIC FACTORIES                                          */
/*************************************************************/

/**
 * @ngdoc method
 * @name VoiceMail#create
 * @returns {VoiceMail} VoiceMail object.
 * @description Creates new VoiceMail object
 */
const createVoiceMail = (profilesService) => {
    return new VoiceMail(profilesService);
};

/**
 * @class
 * @name VoiceMail
 * @private
 * @description
 *      This class is used to represent a VoiceMail <br/>
 */
class VoiceMail {
	public VMFlag: any;
	public VMCounter: any;
	public infoMsg: any;
	public voiceMailFeatureEnabled: any;

    /*************************************************************/
    /* INVITATION CONSTRUCTOR                                  */

    /*************************************************************/
    constructor(profileService) {
        /**
         * @public
         * @property {boolean} VMFlag Allow vm msg notification without knowing nu of msg
         * @readonly
         */
        this.VMFlag = false;

        /**
         * @public
         * @property {int} VMCounter nb of vm msg (if 0 nothing to display)
         * @readonly
         */
        this.VMCounter = 0;

        /**
         * @public
         * @property {string} infoMsg service warning deduced from handler/callservice feedback
         * @readonly
         */
        this.infoMsg = "";


        /**
         * @public
         * @property {string} infoMsg service warning deduced from handler/callservice feedback
         * @readonly
         */
        this.voiceMailFeatureEnabled = profileService.isFeatureEnabled(profileService.getFeaturesEnum().TELEPHONY_VOICE_MAIL);
    }

    /**
     * @public
     * @method
     * @instance
     */
    setVMFlag(flag) {
        this.VMFlag = flag;
    }

    /**
     * @public
     * @method
     * @instance
     */
    getVMFlag() {
        return this.VMFlag;
    }

    /**
     * @public
     * @method
     * @instance
     */
    setVMCounter(ct) {
        if (ct > 0) {
            this.VMFlag = true;
            this.VMCounter = ct;
        }
        else {
            this.VMCounter = 0;
        }
    }

    /**
     * @public
     * @method
     * @instance
     */
    getVMCounter() {
        return this.VMCounter;
    }

    /**
     * @public
     * @method
     * @instance
     */
    setInfoMsg(msg) {
        this.infoMsg = msg;
    }

    /**
     * @public
     * @method
     * @instance
     */
    getInfoMsg() {
        return this.infoMsg;
    }

    /**
     * @public
     * @method
     * @instance
     */
    getDisplayState() {
        return this.voiceMailFeatureEnabled;
    }

}

module.exports = {createVoiceMail: createVoiceMail, VoiceMail: VoiceMail};
export {createVoiceMail as createVoiceMail, VoiceMail as VoiceMail};