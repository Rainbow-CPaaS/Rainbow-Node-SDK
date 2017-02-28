const LOG_ID = 'PROXY - ';

var parseConfig;

class Proxy {

    constructor(config, _logger) {

console.log("CONFIG", config);

        this._logger = _logger;
        this._protocol = config.http;
        this._host = config.host;
        this._port = config.port;
        this._activated = this._host.length > 0 ? true : false;
        this._proxyURL = this._protocol + "://" + this._host + ":" + this._port.toString();

        if(this._activated) {
            this._logger.log("info", LOG_ID + "(constructor) proxy configured", this._proxyURL);
        }
    }

    get proxyURL() {
        return this._proxyURL
    }

    get isProxyConfigured() {
        return this._activated;
    }

}

module.exports = Proxy;