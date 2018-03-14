"use strict";

/**
    Started code : load the portal module and start it

    @module Portal
*/
/*
(function() {
    var path = require('path');
    var configFileName = process.argv[2];
    if (!configFileName) {
        console.error('Missing config file.\nUsage:\n\tnode ' + process.argv[1] + ' <Full path to config file>');
        process.exit(-1);
    }
	
    var portal = require(path.join(__dirname, 'App', 'PortalStarter.js')).create(configFileName);
    portal.start();
}());

// */
//

var http = require("http");
var url = require("url");
var querystring = require("querystring");

const path = require("path");

var Log = require(path.join(__dirname, "src", "js", "logger.js"));
//const PortalCommon = require(path.join(__dirname, '..', 'Common', 'commonportal', 'otlite-portal-common.js'));

var logger = new Log();

class AfterbuildPortal {

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

        this.server = http.createServer(function(req, res) {
            var params = querystring.parse(url.parse(req.url).query);
            res.writeHead(200, {"Content-Type": "text/plain"});

            if ("prenom" in params && "nom" in params) {
                res.write("Vous vous appelez " + params.prenom + " " + params.nom);
            } else {
                res.write("Vous devez bien avoir un prénom et un nom, non ?");
            }

            res.end();
        });


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
        return new Promise(function(resolve, reject) {
            that.server.listen(8080);
            logger.debug("Afterbuild Web Portal started!");
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
        return new Promise(function(resolve, reject) {
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

    startTests() {
      let inspector = new Inspector(logger);
      let framer = new Framer(logger);
      let renderer = new Renderer(logger);
      let prerequisite = new Prerequisite(logger);
      let queue = new Queue(logger, inspector, framer, renderer, prerequisite);

      queue.initialize().then(
          function() {
              console.log("[TST-MAIN ] :: Queue initialized successfully!");
              queue.load("tests/testsPlan.json").then(function() {
                  console.log("[TST-MAIN ] :: Queue loaded successfully!");
                  queue.renderEpicsList();
                  $(".input-epic").click(function(e) {
                      queue.selectEpic(e.currentTarget.id, e.currentTarget.checked);
                  });
              }).catch(function() {

              });
          }
      )
      ;
    }

}

(function() {
/*
    var path = require('path');
    var configFileName = process.argv[2];
    if (!configFileName) {
        console.error('Missing config file.\nUsage:\n\tnode ' + process.argv[1] + ' <Full path to config file>');
        process.exit(-1);
    }

    var portal = require(path.join(__dirname, 'App', 'PortalStarter.js')).create(configFileName);
*/
var portal = new AfterbuildPortal();
    portal.start().then(()=>{
        logger.debug("AfterbuildPortal started!");
    }).catch((err) => {
        logger.debug("AfterbuildPortal error! : " + err.message);
    });
}());

module.exports = AfterbuildPortal;
