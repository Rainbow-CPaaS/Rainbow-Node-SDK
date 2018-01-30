
const path = require("path");
var Log = require(path.join(__dirname, "src", "js", "logger.js"));
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var routes = require('./api/routes/afterbuildRoutes'); //importing route

var logger = new Log();



//Task = require('./api/models/afterbuildModel'), //created model loading here

// mongoose instance connection url connection
//mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost/Tododb');

class AfterbuildApiServer {

    constructor(options) {
        /* process.on("uncaughtException", (err) = > {
                 console.error(err);
         });

             process.on("warning", (err) = > {
                 console.error(err);
         }) ;

             process.on("unhandledRejection", (err, p) = > {
                 console.error(err);
         }) ;
        // */
    }

    /**
     * @public
     * @method start
     * @instance
     * @description
     *    Start the SDK
     * @memberof NodeSDK
     */
    start() {
        var that = this;
        return new Promise(function (resolve, reject) {
//            that.server.listen(8080);
            logger.debug("Afterbuild Web Portal started!");
            app.use(bodyParser.urlencoded({extended: true}));
            app.use(bodyParser.json());


            routes(app); //register the route


            app.listen(port);

            console.log('todo list RESTful API server started on: ' + port);

            /*.then(function () {
                logger.debug("server started!");
                resolve();
            }).catch(function (err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.publish("rainbow_onconnectionerror", error);
                reject(error);
            }); //*/
        });
    }

    stop() {
        var that = this;
        return new Promise(function (resolve, reject) {
            /*
                        that._core.stop().then(function () {
                            var success = Error.OK;
                            that.events.publish("rainbow_onstopped", success);
                            resolve();
                        }).catch(function (err) {
                            var error = Error.ERROR;
                            error.details = err;
                            that.events.publish("rainbow_onstopped", error);
                            reject(error);
                        });
            */
        });

    }

};

(function () {
    /*
        var path = require('path');
        var configFileName = process.argv[2];
        if (!configFileName) {
            console.error('Missing config file.\nUsage:\n\tnode ' + process.argv[1] + ' <Full path to config file>');
            process.exit(-1);
        }

        var portal = require(path.join(__dirname, 'App', 'PortalStarter.js')).create(configFileName);
    */
    var portal = new AfterbuildApiServer();
    portal.start().then(() => {
        logger.debug("AfterbuildPortal started!");
}).
    catch((err) => {
        logger.debug("AfterbuildPortal error! : " + err.message);
})
    ;
}());

module.exports = AfterbuildApiServer;