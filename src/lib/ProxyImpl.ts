"use strict";
export {};

const LOG_ID = "PROXY - ";

class ProxyImpl {
	public _logger: any;
	public _protocol: any;
	public _host: any;
	public _port: any;
	public _activated: any;
	public _proxyURL: any;
    private _user: string;
    private _password: string;
    private _secureProtocol: string ;


    constructor(config, _logger) {

        this._logger = _logger;
        this._protocol = config.protocol;
        this._host = config.host;
        this._port = config.port;
        this._activated = this._host.length > 0;

        this._user = config.user;
        this._password = config.password;
        this._secureProtocol = config.secureProtocol ? config.secureProtocol : null;

        if (this._user === "" || this._user ) {
            this._proxyURL =  encodeURI(this._protocol + "://" + this._user + ":" + this._password + "@" + this._host + ":" + this._port.toString());
            //this._proxyURL = this._protocol + "://" + this._user + ":" + this._password + "@" + this._host + ":" + this._port.toString();
            this._logger.log("info", LOG_ID + "(constructor) proxy configured with authent");
            this._logger.log("internal", LOG_ID + "(constructor) proxy configured with authent : ", this._proxyURL);
        } else {

            this._proxyURL = this._protocol + "://" + this._host + ":" + this._port.toString();
        }
        if (this._activated) {
            this._logger.log("info", LOG_ID + "(constructor) proxy configured.");
            this._logger.log("internal", LOG_ID + "(constructor) proxy configured : ", this._proxyURL);
        }
    }

    get proxyURL() {
        return this._proxyURL;
    }

    get isProxyConfigured() {
        return this._activated;
    }

    get secureProtocol(): string {
        return this._secureProtocol;
    }

    set secureProtocol(value: string) {
        this._secureProtocol = value;
    }
}


module.exports.ProxyImpl = ProxyImpl;
export {ProxyImpl};
