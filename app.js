'use strict';

/**
    Started code : load the sdk module and start it

    @module nodeSDK
*/
(function() {
    var path = require('path');
    var configFileName = process.argv[2];
    if (!configFileName) {
        console.error('Missing config file.\nUsage:\n\tnode ' + process.argv[1] + ' <Full path to config file>');
        process.exit(-1);
    }
	
    var sdk = require(path.join(__dirname, 'sdk', 'Loader.js')).create(configFileName);
    sdk.start();
}());