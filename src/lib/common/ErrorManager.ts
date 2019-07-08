"use strict";

/*
* @typedef Err
* @readonly
* @enum {number}
*/
const code = {
	"OK": 1,
	"ERROR": -1,
	"ERRORUNAUTHORIZED": -2,
	"ERRORXMPP": -4,
	"ERRORXMPPJID": -8,
	"ERRORBADREQUEST": -16,
	"ERRORUNSUPPORTED": -32,
	"ERRORNOTFOUND": -64,
    "ERRORFORBIDDEN": -128,
    "OTHERERROR": -256
};

/*
* @typedef Err
* @property {ErrorCode} code
* @property {string} label ErrorManager label
* @property {string} msg ErrorManager message
*/

/**
 * @module 
 * @name ErrorManager
 */
class ErrorManager {
    private static xmppUtils: ErrorManager;

    constructor() {
    }
    
    static getErrorManager() {
        ErrorManager.xmppUtils = ErrorManager.xmppUtils ? ErrorManager.xmppUtils : new ErrorManager();

        return ErrorManager.xmppUtils;
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get BAD_REQUEST() : any{
        return {
            code: code.ERRORBADREQUEST,
            label: "BADREQUEST",
            msg: "One or several parameters are not valid for that request."
        };
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get FORBIDDEN() {
        return {
            code: code.ERRORFORBIDDEN,
            label: "FORBIDDEN",
            msg: "This operation is not allowed."
        };
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get OK() {
        return {
            code: code.OK,
            label: "SUCCESSFULL",
            msg: ""
        };
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get XMPP() {
        return {
            code: code.ERRORXMPP,
            label: "XMPPERROR",
            msg: "An error occured. See details for more information"
        };
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get ERROR() {
        return {
            code: code.ERROR,
            label: "INTERNALERROR",
            msg: "An error occured. See details for more information"
        };
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get UNAUTHORIZED() {
        return {
            code: code.ERRORUNAUTHORIZED,
            label: "UNAUTHORIZED",
            msg: "The email or the password is not correct"
        };
    }

    OTHERERROR(_label, _msg) {
        return {
            code: code.ERROR,
            label: _label,
            msg: _msg
        };
    }

    CUSTOMERROR(codeERROR, label, msg) {
        return {
            code: codeERROR,
            label: label,
            msg: msg
        };
    }

}

export {ErrorManager, code};
module.exports.ErrorManager = ErrorManager;