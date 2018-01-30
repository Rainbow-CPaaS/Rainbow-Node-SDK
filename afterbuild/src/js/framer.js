var Framer = (function() {

    "use strict";

    var logService = "Framer     | ";

    var logger = null;

    var users = [];

    function Framer (_logger) {
        logger = _logger;
        logger.debug(logService + "[constructor] :: Started!");
    }

    Framer.prototype.createIFrame = function createIFrame(name) {
        logger.debug(logService + "[create frm ] :: Create a new IFrame for user " + name);

        $("<iframe>", {
            src: "./frame.html",
            id:  name,      
            frameborder: 0,
            scrolling: "no"
        }).appendTo(".framer");

        users.push(name);
    };

    Framer.prototype.removeAllIFrames = function removeAllIFrames() {
        logger.debug(logService + "[remove frm ] :: Remove all Iframes created (" + users.length + ")");
        users.forEach(function(user) {
            $("#" + user).remove();
            logger.debug(logService + "[remove frm ] :: Remove IFrame for user " + user);
        });
        users = [];
    };

    return Framer;
}());

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Framer;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            "use strict";
            return Framer;
        });
    }
    else {
        window.Framer = Framer;
    }
}