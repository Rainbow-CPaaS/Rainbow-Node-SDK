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
};

class Error {

    constructor() {
    };

    get BAD_REQUEST() {
        return {
            code: code.ERRORBADREQUEST,
            label: "Bad Request",
            msg: "One or several parameters are not valid for that request."
        };
    }

    get OK() {
        return {
            code: code.OK,
            label: "Request successful",
            msg: ""
        };
    }

    get XMPP() {
        return {
            code: code.ERRORXMPP,
            label: "XMPP Error",
            msg: "An error occured. See details for more information"
        };
    }

    get ERROR() {
        return {
            code: code.ERROR,
            label: "General Error",
            msg: "An error occured. See details for more information"
        };
    }

    get UNAUTHORIZED() {
        return {
            code: code.ERRORUNAUTHORIZED,
            label: "Security Error",
            msg: "The email or the password is not correct"
        };
    }

}

module.exports = new Error();