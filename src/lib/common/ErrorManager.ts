"use strict";

/**
 *   The code of the errors raised by the SDK.
 * @public
 * @enum {number}
 * @readonly
*/
const code = {
    /** OK code result */
	"OK": 1,
    /** ERROR code result */
	"ERROR": -1,
    /** ERRORUNAUTHORIZED code result */
	"ERRORUNAUTHORIZED": -2,
    /** ERRORXMPP code result */
	"ERRORXMPP": -4,
    /** ERRORXMPPJID code result */
	"ERRORXMPPJID": -8,
    /** ERRORBADREQUEST code result */
	"ERRORBADREQUEST": -16,
    /** ERRORUNSUPPORTED code result */
	"ERRORUNSUPPORTED": -32,
    /** ERRORNOTFOUND code result */
	"ERRORNOTFOUND": -64,
    /** ERRORFORBIDDEN code result */
    "ERRORFORBIDDEN": -128,
    /** OTHERERROR code result */
    "OTHERERROR": -256
};

/*
* @typedef Err
* @property {ErrorCode} code
* @property {string} label ErrorManager label
* @property {string} msg ErrorManager message
*/

/**
 * @class
 * @name ErrorManager
 * @public
 * @description
 *  The errors raised by the SDK.
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
            msg: "An error occured. See details for more information",
            details: ""
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
            msg: "The email or the password is not correct",
            details: ""
        };
    }

    OTHERERROR(_label, _msg) {
        return {
            code: code.ERROR,
            label: _label,
            msg: _msg
        };
    }

    CUSTOMERROR(codeERROR, label, msg, error) {
        return {
            code: codeERROR,
            label,
            msg,
            error
        };
    }

}

export {ErrorManager, code};
module.exports.ErrorManager = ErrorManager;
