let options = {
    /*
    "rainbow": {
        "host": "vberder.openrainbow.org",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
//        "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
//        "host": "web-sandbox.openrainbow.com",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "credentials": {
        "login": "alice@pgu.test.openrainbow.net",  // The Rainbow email account to use
//        "login": "vincent00@vbe.test.openrainbow.net",  // The Rainbow email account to use
//        "password": "Alcatel123!"   // The Rainbow associated password to use
        "password": "Password_123"   // The Rainbow associated password to use
//        "login": "vincent.berder@al-enterprise.com",  // The Rainbow email account to use
//        "password": ""   // The Rainbow associated password to use
    },
    // Application identifier
    "application": {
        "appID": "dce4508010dc11e89911ade160c1b521", // The Rainbow Application Identifier - application must have a 'deployed' state
        "appSecret": "XjJZLOvVCfvcpPTmt0UtIRUQddKfCGbDGBEfdB3qfXvZCKpgb9k0HaxzfQxI6UAa", // The Rainbow Application Secret - retrieved from developer hub
    },

    // Proxy configuration
    proxy: {
        host: '192.168.254.49',
        port: 8080,
        protocol: 'http'
    },

    "xmpp": {
        "protocol": "ws",
//        "host": "dummy.openrainbow.org",
        "host": "vberder.openrainbow.org",
        "port": 5280
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
    } // */
    "rainbow": {
        "host": "dummy.openrainbow.org" // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
//        "host": "vberder.openrainbow.org", // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "xmpp": {
      "protocol": "ws",
        "host": "dummy.openrainbow.org",
//        "host": "vberder.openrainbow.org",
        "port": 80
    },
    "credentials": {
      "login": "alice@pgu.test.openrainbow.net", // The Rainbow email account to use
//        "password": "Password_123" // The Rainbow associated password to use
        "password": "dummy" // The Rainbow associated password to use
    },
    // Application identifier
    "application": {
         "appID": "59719d166260a9f00c211fc9", // The Rainbow Application Identifier - application must have a 'deployed' state
         "appSecret": "Oz8cbbElggWcKgrwhSBaL9C9", // The Rainbow Application Secret - retrieved from developer hub
//        "appID": "dce4508010dc11e89911ade160c1b521", // The Rainbow Application Identifier - application must have a 'deployed' state
//        "appSecret": "XjJZLOvVCfvcpPTmt0UtIRUQddKfCGbDGBEfdB3qfXvZCKpgb9k0HaxzfQxI6UAa", // The Rainbow Application Secret - retrieved from developer hub
    },
    // Logs options
    "logs": {
      "enableConsoleLogs": true, // Default: true
      "enableFileLogs": false, // Default: false
      "file": {
        "path": "/var/tmp/rainbowsdk/", // Default path used
        "level": "debug" // Default log level used
      }
    },
    // IM options
    "im": {
      "sendReadReceipt": true // True to send the 'read' receipt automatically
    } // */
  };

  module.exports = options;