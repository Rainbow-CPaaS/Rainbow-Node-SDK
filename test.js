var NodeSDK = require('./index');

var nodeSDK = new NodeSDK({
    rainbow: {
        "host": "sandbox",
    },
    credentials: {
        "login": "rford@westworld.com",
        "password": "Password_123"
    },
    logs: {
        path: '/var/tmp/rainbowsdk/',
        level: 'debug',
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

nodeSDK.events.on('rainbow_onready', function() {
    console.log("[Rainbow] >>> on ready");
    console.log("[Rainbow] >>> contacts", nodeSDK.contacts.getAll().length);
});

nodeSDK.events.on('rainbow_onconnectionerror', function(err) {
    console.log("[Rainbow] >>> on not connected", err);
});

nodeSDK.events.on('rainbow_oncontactpresencechanged', function(contact) {
    console.log("[Rainbow] >>> presence changed", contact);
})

nodeSDK.start();