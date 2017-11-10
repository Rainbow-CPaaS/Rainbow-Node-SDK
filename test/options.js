let options = {
    "rainbow": {
      "host": "dummy.openrainbow.org", // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "xmpp": {
      "protocol": "ws",
      "host": "dummy.openrainbow.org",
      "port": 80
    },
    "credentials": {
      "login": "alice@pgu.test.openrainbow.net", // The Rainbow email account to use
      "password": "dummy" // The Rainbow associated password to use
    },
    // Application identifier
    "application": {
      "appID": "59719d166260a9f00c211fc9", // The Rainbow Application Identifier - application must have a 'deployed' state
      "appSecret": "Oz8cbbElggWcKgrwhSBaL9C9", // The Rainbow Application Secret - retrieved from developer hub
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
    }
  };

  module.exports = options;