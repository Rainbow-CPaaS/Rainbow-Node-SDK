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
    console.log("[Rainbow] >>> on message", jsonMessage);
    var messageSent = nodeSDK.im.sendMessageToJid(jsonMessage.content + ' answered', jsonMessage.fromJid);
    console.log("[Rainbow] >>> Message sent", messageSent);
});

nodeSDK.events.on('rainbow_onmessageserverreceiptreceived', function(jsonMessage) {
    console.log("[Rainbow] >>> on server receipt", jsonMessage);
});

nodeSDK.events.on('rainbow_onmessagereceiptreceived', function(jsonMessage) {
    console.log("[Rainbow] >>> on client received receipt", jsonMessage);
});

nodeSDK.events.on('rainbow_onmessagereceiptreadreceived', function(jsonMessage) {
    console.log("[Rainbow] >>> on client read receipt", jsonMessage);
});

nodeSDK.events.on('rainbow_onerror', function(jsonMessage) {
    console.log("[Rainbow] >>> on error", jsonMessage);
});

nodeSDK.events.on('rainbow_onconnectionok', function() {
    console.log("[Rainbow] >>> on connected");
});

nodeSDK.events.on('rainbow_onconnectionerror', function(err) {
    console.log("[Rainbow] >>> on not connected", err);
});

nodeSDK.start();