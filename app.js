'use strict';



/**
    Started code : load the sdk module and start it

    @module nodeSDK
*/
(function() {
    var path = require('path');
    const EventEmitter = require('events').EventEmitter;
    var eventEmitter = new EventEmitter();

    var configFileName = process.argv[2];
    if (!configFileName) {
        console.error('Missing config file.\nUsage:\n\tnode ' + process.argv[1] + ' <Full path to config file>');
        process.exit(-1);
    }

    var signinAndRenewToken = function signinAndRenewToken() {
        sdk.signin().then(function() {
            return sdk.tokenSurvey();
        }).catch(function() {
            process.exit(-1);
        });
    };
	
    var sdk = require(path.join(__dirname, 'sdk', 'Loader.js')).create(configFileName, eventEmitter);
    sdk.start().then(function() {
        signinAndRenewToken();
    });

    eventEmitter.on('rainbow_signinrequired', function() {
        signinAndRenewToken();
    });

}());