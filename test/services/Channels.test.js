const RainbowSDK = require("../../index.js");
const options = require("../options");
const expect = require("chai").expect;
const nock = require("nock");
const MockServer = require("mock-socket").Server;


describe("Channel Service", () => {

    // LOGGER
    let winston = require("winston");
    let logger = new winston.Logger({
        transports: [new(winston.transports.Console)()]
    });

    // instantiate the SDK
    let rainbowSDK = new RainbowSDK(options);

    // XMPP WebSocket Server
    const mockServer = new MockServer("ws://" + options.xmpp.host + ":" + options.xmpp.port + "/websocket");
    mockServer.on("connection", server => {
        
    });

    var isAuthenticated = false;
    var resource = "";
    var alice = require(__dirname + "/../replies/alice_login_success.json");

    mockServer.on("message", message => {
        if ( message.startsWith("<ope")) {
            mockServer.send("<open xmlns='urn:ietf:params:xml:ns:xmpp-framing' to='dummy-all-in-one-dev-1.opentouch.cloud' version='1.0'/>");
            if ( !isAuthenticated ) {
            mockServer.send("<stream:features xmlns:stream='http://etherx.jabber.org/streams'><c xmlns='http://jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/ejabberd/' ver='XOFO0R0cqi8p4qFlpdNxjjjK4Zs='/><register xmlns='http://jabber.org/features/iq-register'/><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism><mechanism>DIGEST-MD5</mechanism><mechanism>SCRAM-SHA-1</mechanism></mechanisms></stream:features>");
            } else {
            mockServer.send("<stream:features xmlns:stream='http://etherx.jabber.org/streams'><c xmlns='http://jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/ejabberd/' ver='XOFO0R0cqi8p4qFlpdNxjjjK4Zs='/><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'/><session xmlns='urn:ietf:params:xml:ns:xmpp-session'><optional/></session><ver xmlns='urn:xmpp:features:rosterver'/><sm xmlns='urn:xmpp:sm:2'/><sm xmlns='urn:xmpp:sm:3'/><csi xmlns='urn:xmpp:csi:0'/></stream:features>");
            }
        }
        if (message.startsWith("<auth")) {
            mockServer.send("<challenge xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>cj1kNDFkOGNkOThmMDBiMjA0ZTk4MDA5OThlY2Y4NDI3ZS93UzdkNlNDYmsyUXRFM0VUd251V0E9PSxzPU52NERxZ1dmb09ESG5YUlJCeWpEREE9PSxpPTQwOTY=</challenge>");
            mockServer.send("<open xmlns=\"urn:ietf:params:xml:ns:xmpp-framing\" version=\"1.0\" default:lang" +
                    "=\"en\" id=\"13260960624462208793\" from=\"dummy-all-in-one-dev-1.opentouch.clou" +
                    "d\"\/>");
        }
        if ( message.startsWith("<response")) {
            mockServer.send("<success xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>dj1KM3d3dTc2WWU4THVEM1FOWVNWZjdTNUlHS3c9</success>");
            isAuthenticated = true;
        }
        if ( message.startsWith("<iq type=\"set\"")) {
            var id = message.match(/id="(.*)" /);
            if ( message.indexOf("bind") > -1 ) {
                resource = message.match(/<resource>(.*)<\/resource>/);
                mockServer.send("<iq xmlns='jabber:client' id='" + id[1] + "' type='result'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><jid>" + alice.loggedInUser.jid_im + "/" + resource[1] + "</jid></bind></iq>");
            } else if ( message.indexOf("session")  > -1 ) {
                mockServer.send("<iq xmlns='jabber:client' type='result' id='" + id[1] + "'/>");
            } else if ( message.indexOf("carbon") > -1 ) {
                mockServer.send("<iq xmlns='jabber:client' from='" + alice.loggedInUser.jid_im + "' to='" + alice.loggedInUser.jid_im + "/" + resource[1] + "' id='" + id[1] + "' type='result'/>")
            }
        }
        if ( message.startsWith("<presence") > -1 ) {
            mockServer.send("<presence xmlns='jabber:client' from='" + alice.loggedInUser.jid_im + "/" + resource[1] + "' to='" + alice.loggedInUser.jid_im + "/" + resource[1] + "'><priority>5</priority></presence>");
        }
    });


    before(() => {

        var scope = nock("https://" + options.rainbow.host)
            .get("/api/rainbow/authentication/v1.0/login")
            .reply(200, require(__dirname + "/../replies/alice_login_success.json"))
            .get("/api/rainbow/enduser/v1.0/users/networks?format=full")
            .reply(200, { data: [], total: 0 })
            .get("/api/rainbow/enduser/v1.0/rooms?format=full&offset=0&limit=100&userId=58d2ae99076f165e59e84dfb")
            .reply(200, { data: [], total: 0 })
            .get("/api/rainbow/enduser/v1.0/users/58d2ae99076f165e59e84dfb/settings")
            .reply(200, require(__dirname + "/../replies/settings_presence_online.json"))
            .get("/api/rainbow/channels/v1.0/channels")
            .reply(200, require(__dirname + "/../replies/empty_channel_list.json"))
            .get("/api/rainbow/enduser/v1.0/users/58d2ae99076f165e59e84dfb/groups?format=full&offset=0&limit=100")
            .reply(200, { data: [], total: 0 })
            .get("/api/rainbow/enduser/v1.0/bots")
            .reply(200, require(__dirname + "/../replies/emily_bot.json"));

        return rainbowSDK
            .start()
            .then(() => {
                scope.done();
                logger.debug("SDK Started");
            })
            .catch((err) => {
                logger.error(err);
            });
    });

    after(() => {

        var scope = nock("https://" + options.rainbow.host)
        .get("/api/rainbow/authentication/v1.0/logout")
        .reply(200, { });

        return rainbowSDK
            .stop()
            .then(() => {
                scope.done();
                logger.debug("SDK Stopped");
            })
            .catch((err) => {
                logger.error(err);
            });
    });

    beforeEach(() => {});

    afterEach(() => {});

    describe("Channel CRUD", () => {
        it("Create Channel", (done) => {

            var scope = nock("https://" + options.rainbow.host)
                .post("/api/rainbow/channels/v1.0/channels", { "name": "FirstChannel", "title": "First Channel" })
                .reply(200, {
                    "data": {
                        "name": "FirstChannel",
                        "title": "First Channel",
                        "companyId": "58d2ae7a16ab4821585311d1",
                        "creator": "58d2ae99076f165e59e84dfb",
                        "users": [
                            {
                                "userId": "58d2ae99076f165e59e84dfb",
                                "additionDate": "2017-11-08T10:18:09.126Z",
                                "type": "owner"
                            }
                        ],
                        "creationDate": "2017-11-08T10:18:09.125Z",
                        "id": "5a02d9e1eb329a4dea6045ac"
                    }
                });

            rainbowSDK
                .channels
                .createChannel("FirstChannel", "First Channel")
                .then((channel) => {
                    expect(channel.title)
                        .to
                        .be
                        .equal("First Channel");
                    logger.debug("Channel created");
                    scope.done();
                    done();
                });
        });

        it("Read Channel", (done) => {
            var readChannel = {
                "data": {
                    "name": "ReadChannel",
                    "title": "Read Channel",
                    "companyId": "58d2ae7a16ab4821585311d1",
                    "creator": "58d2ae99076f165e59e84dfb",
                    "users": [
                        {
                            "userId": "58d2ae99076f165e59e84dfb",
                            "additionDate": "2017-11-08T10:18:09.126Z",
                            "type": "owner"
                        }
                    ],
                    "creationDate": "2017-11-08T10:18:09.125Z",
                    "id": "5a02d9e1eb329a4dea6045ac"
                }
            };

            var scope = nock("https://" + options.rainbow.host)
            .post("/api/rainbow/channels/v1.0/channels", { "name": "ReadChannel", "title": "Read Channel" })
            .reply(200, readChannel )
            .get("/api/rainbow/channels/v1.0/channels/" + readChannel.data.id)
            .reply(200, readChannel );
            
            rainbowSDK
                .channels
                .createChannel("ReadChannel", "Read Channel")
                .then((channel) => {
                    logger.debug("Channel created");
                    expect(channel.title)
                        .to
                        .be
                        .equal("Read Channel");
                    return rainbowSDK
                        .channels
                        .getChannel(channel.id);
                })
                .then((channel) => {
                    expect(channel.title)
                        .to
                        .be
                        .equal("Read Channel");
                    scope.done();
                    done();
                });
        });

        it("Update Channel", (done) => {
            var updateChannel = {
                "data": {
                    "name": "ChannelToUpdate",
                    "title": "Channel To Update",
                    "companyId": "58d2ae7a16ab4821585311d1",
                    "creator": "58d2ae99076f165e59e84dfb",
                    "users": [
                        {
                            "userId": "58d2ae99076f165e59e84dfb",
                            "additionDate": "2017-11-08T10:18:09.126Z",
                            "type": "owner"
                        }
                    ],
                    "creationDate": "2017-11-08T10:18:09.125Z",
                    "id": "5a02d9e1eb329a4dea6045ac"
                }
            };

            var scope = nock("https://" + options.rainbow.host)
            .post("/api/rainbow/channels/v1.0/channels", { "name": "ChannelToUpdate", "title": "Channel To Update" })
            .reply(200, updateChannel )
            .put("/api/rainbow/channels/v1.0/channels/" + updateChannel.data.id, { "title" : "Channel To Updated" })
            .reply(200, function() {
                var updatedChannel = Object.assign( {}, updateChannel);
                updatedChannel.data.title = "Channel To Updated";
                return updatedChannel;
            } );

            rainbowSDK
                .channels
                .createChannel("ChannelToUpdate", "Channel To Update")
                .then((channel) => {
                    logger.debug("Channel created");
                    expect(channel.title)
                        .to
                        .be
                        .equal("Channel To Update");
                    return rainbowSDK
                        .channels
                        .updateChannel(channel.id, "Channel To Updated");
                })
                .then((channel) => {
                    expect(channel.title)
                        .to
                        .be
                        .equal("Channel To Updated");
                    scope.done();
                    done();
                });
        });

        it("Delete Channel", (done) => {
            var secondChannel = {
                "data": {
                    "name": "Second Channel",
                    "title": "Second Channel",
                    "companyId": "58d2ae7a16ab4821585311d1",
                    "creator": "58d2ae99076f165e59e84dfb",
                    "users": [
                        {
                            "userId": "58d2ae99076f165e59e84dfb",
                            "additionDate": "2017-11-08T10:18:09.126Z",
                            "type": "owner"
                        }
                    ],
                    "creationDate": "2017-11-08T10:18:09.125Z",
                    "id": "5a02d9e1eb329a4dea6045ac"
                }
            };

            var scope = nock("https://" + options.rainbow.host)
            .post("/api/rainbow/channels/v1.0/channels", { "name": "Second Channel", "title": "Second Channel" })
            .reply(200, secondChannel )
            .delete("/api/rainbow/channels/v1.0/channels/" + secondChannel.data.id)
            .reply(200, {
                     "status": "Channel secondChannel.data.id successfully deleted",
                     "data": []
                 } );

            rainbowSDK
                .channels
                .createChannel("Second Channel", "Second Channel")
                .then((channel) => {
                    return rainbowSDK
                        .channels
                        .deleteChannel(channel.id)
                        .then((result) => {
                            logger.debug("Channel deleted");
                            scope.done();
                            done();
                        });
                });
        });
    });
});