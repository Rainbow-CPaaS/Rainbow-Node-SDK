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
* @property {string} label Error label
* @property {string} msg Error message
*/

/**
 * @module 
 * @name Error
 */
class Error {

    constructor() {
    }
    
    /**
     * @readonly
     * @memberof Error
     * @return {Err}
     */
    get BAD_REQUEST() {
        return {
            code: code.ERRORBADREQUEST,
            label: "BADREQUEST",
            msg: "One or several parameters are not valid for that request."
        };
    }

    /**
     * @readonly
     * @memberof Error
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
     * @memberof Error
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
     * @memberof Error
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
     * @memberof Error
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
     * @memberof Error
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

module.exports = new Error();