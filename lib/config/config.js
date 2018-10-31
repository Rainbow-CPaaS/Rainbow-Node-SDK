module.exports = {
    sandbox: {
        http: {
            host: "sandbox.openrainbow.com",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "sandbox.openrainbow.com",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20"
        }
    },
    official: {
        http: {
            host: "openrainbow.com",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "openrainbow.com",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20"
        }
    },
    any: {
        http: {
            host: "",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20"
        }
    },
    logs: {
        path: "/var/tmp/rainbowsdk/",
        level: "info",
        color: false,
        enableConsoleLog: true,
        "system-dev": {
            internals: false,
            http: false
        },
        zippedArchive: true,
        maxSize : "10m",
        maxFiles : null
    },
    im: {
        sendReadReceipt: true
    },
    mode:"xmpp",
    debug:true,
    permitSearchFromPhoneBook:true,
    displayOrder:"firstLast"
};