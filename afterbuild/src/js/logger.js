var Logger = (function() {

    "use strict";

    var logService = "Logger     | ";

    function Logger () {
        this.debug(logService + "[constructor] :: Started!");
    }

    Logger.prototype.debug = function debug(message) {

        var utc = function utc(now) {
            var datestring = now.toDateString() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
            return datestring;
        };

        console.log("%c " + utc(new Date()) + " | RBW-TST | " + message, "color:orange");
    };

    return Logger;
}());

var logger = undefined;
function getLogger() {
    if (logger == undefined) {
        // Instantiate the SDK
        logger = new Logger();
    } else {

    }
    return logger;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = getLogger;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            "use strict";
            return Logger;
        });
    }
    else {
        window.Logger = Logger;
    }
}