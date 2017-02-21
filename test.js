var NodeSDK = require('./index');

var nodeSDK = new NodeSDK({
    rainbow: {
        "host": "sandbox",
    },
    credentials: {
        "login": "rford@westworld.com",
        "password": "Password_123"
    }
});

nodeSDK.events.on('rainbow_onmessagereceived', function(jsonMessage) {
});

nodeSDK.start();