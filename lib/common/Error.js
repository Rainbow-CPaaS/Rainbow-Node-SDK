"use strict";

const code = {
	"OK": 1,
	"ERROR": -1,
	"ERRORUNAUTHORIZED": -2,
	"ERRORXMPP": -4,
	"ERRORXMPPJID": -8,
	"ERRORBADREQUEST": -16,
	"ERRORUNSUPPORTED": -32,
	"ERRORNOTFOUND": -64, 
    "ERRORFORBIDDEN": -128
};

class Error {

    constructor() {
    }

    get BAD_REQUEST() {
        return {
            code: code.ERRORBADREQUEST,
            label: "BADREQUEST",
            msg: "One or several parameters are not valid for that request."
        };
    }

    get FORBIDDEN() {
        return {
            code: code.ERRORFORBIDDEN,
            label: "FORBIDDEN",
            msg: "This operation is not allowed."
        };
    }

    get OK() {
        return {
            code: code.OK,
            label: "SUCCESSFULL",
            msg: ""
        };
    }

    get XMPP() {
        return {
            code: code.ERRORXMPP,
            label: "XMPPERROR",
            msg: "An error occured. See details for more information"
        };
    }

    get ERROR() {
        return {
            code: code.ERROR,
            label: "INTERNALERROR",
            msg: "An error occured. See details for more information"
        };
    }

    get UNAUTHORIZED() {
        return {
            code: code.ERRORUNAUTHORIZED,
            label: "UNAUTHORIZED",
            msg: "The email or the password is not correct"
        };
    }
}

module.exports = new Error();