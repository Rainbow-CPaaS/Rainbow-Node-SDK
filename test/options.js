let options = {
    "rainbow": {
      "host": "vincent.openrainbow.org", // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
    },
    "credentials": {
      "login": "alice@pgu.test.openrainbow.net", // The Rainbow email account to use
      "password": "alice" // The Rainbow associated password to use
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
      // Proxy configuration
   /*   "proxy": {
          "host": "192.168.254.49",
          "port": 8080,
          "http": "http"
      },*/
    // IM options
    "im": {
      "sendReadReceipt": true // True to send the 'read' receipt automatically
    }
  };

  module.exports = options;