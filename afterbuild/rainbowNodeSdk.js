// Load the SDK
var RainbowSDK = require('../index');
var rainbowSDK = undefined;  // Need to see if this variable keep a singleton. Maybe need to be declare has global.rainbowSDK

// Define your configuration
let optionsSDK = {
    "rainbow": {
        "host": "demo.openrainbow.org",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
//        "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
//        "host": "web-sandbox.openrainbow.com",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "credentials": {
        "login": "vincent00@vbe.test.openrainbow.net",  // The Rainbow email account to use
        "password": "Alcatel123!"   // The Rainbow associated password to use
//        "login": "vincent.berder@al-enterprise.com",  // The Rainbow email account to use
//        "password": ""   // The Rainbow associated password to use
    },
    // Application identifier
    "application": {
        "id": "", // The Rainbow Application Identifier - application must have a 'deployed' state
        "secret": "", // The Rainbow Application Secret - retrieved from developer hub
    },

    // Proxy configuration
    proxy: {
        host: '192.168.254.49',
        port: 8080,
        protocol: 'http'
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": true,              // Default: true
        "enableFileLogs": false,                // Default: false
        "file": {
            "path": '/var/tmp/rainbowsdk/',     // Default path used
            "level": 'debug'                    // Default log level used
        }
    },
    // IM options
    "im": {
        "sendReadReceipt": true   // True to send the 'read' receipt automatically
    }
};


function getRainbowSDK() {
    if (rainbowSDK == undefined) {
        // Instantiate the SDK
        rainbowSDK = new RainbowSDK(optionsSDK);
    } else {

    }
    return rainbowSDK;
}

exports.getRainbowSDK = getRainbowSDK;