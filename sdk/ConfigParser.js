'use strict';

var path = require('path');
const fs = require('file-system');
const util = require('util');


class ConfigParser {
    constructor(configPath) {

        try {
            configPath = path.resolve(configPath);
            fs.accessSync(configPath, fs.R_OK);

            let config = require(configPath);
            this._http = config.http;
            this._xmpp = config.xmpp;    

        } catch(err) {
            console.log(util.format('Path not found or no access rights to path %s with mode %s. %s', pathToCheck, err));
        }
    }

    get http() {
        return this._http;
    }

    get xmpp() {
        return this._xmpp;
    }
};

/** Returns a ConfigParser instance */
module.exports.loadConfig = function(configPath) {
    return new ConfigParser(configPath);
};