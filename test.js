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
    console.log("[Rainbow] :: on message", jsonMessage);
    nodeSDK.sendAMessage(jsonMessage.from, jsonMessage.content + ' answered');
});

nodeSDK.events.on('rainbow_onerror', function(jsonMessage) {
    console.log("[Rainbow] :: on error", jsonMessage);
});

nodeSDK.events.on('rainbow_onconnected', function() {
    console.log("[Rainbow] :: on connected");
});

nodeSDK.start();