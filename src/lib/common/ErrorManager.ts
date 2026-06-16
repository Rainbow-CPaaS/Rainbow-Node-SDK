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

/**
 * @interface Err
 * @property {number} code ErrorManager error code
 * @property {string} label ErrorManager label
 * @property {string} msg ErrorManager message
 * @property {unknown} [cause] Original error that caused this one
 */
interface Err {
    code: number;
    label: string;
    msg: string;
    details?: string;
    error?: any;
    cause?: unknown;
}

/**
 * @class
 * @name ErrorManager
 * @public
 * @description
 *  The errors raised by the SDK.
 */
class ErrorManager {
    private static errorManager: ErrorManager;

    constructor() {
    }

    static getErrorManager() {
        ErrorManager.errorManager = ErrorManager.errorManager ? ErrorManager.errorManager : new ErrorManager();

        return ErrorManager.errorManager;
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get BAD_REQUEST() : Err {
        return {
            code: code.ERRORBADREQUEST,
            label: "BADREQUEST",
            msg: "One or several parameters are not valid for that request.",
        };
    }

    /**
     * @readonly
     * @memberof ErrorManager
     * @return {Err}
     */
    get FORBIDDEN() : Err {
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
    get OK() : Err {
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
    get XMPP() : Err {
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
    get ERROR() : Err {
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
    get UNAUTHORIZED() : Err {
        return {
            code: code.ERRORUNAUTHORIZED,
            label: "UNAUTHORIZED",
            msg: "The email or the password is not correct",
            details: ""
        };
    }

    OTHERERROR(_label: string, _msg: string) : Err {
        return {
            code: code.ERROR,
            label: _label,
            msg: _msg
        };
    }

    CUSTOMERROR(codeERROR, label: string = "", msg: string = "", error: any = undefined) : Err {
        return {
            code: codeERROR,
            label,
            msg,
            error
        };
    }

}

export {ErrorManager, code};
export type {Err};
module.exports.ErrorManager = ErrorManager;
