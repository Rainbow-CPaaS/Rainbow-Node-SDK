const RainbowSDK = require("../../index.js");
const options = require("../options");
const expect = require("chai").expect;
const nock = require("nock");
const jwt = require("jsonwebtoken");
const MockServer = require("mock-socket").Server;


describe("Channel Service", () => {

    // LOGGER
    let winston = require("winston");
    let logger = new winston.Logger({
        transports: [new(winston.transports.Console)()]
    });

    // XMPP WebSocket Server
    logger.debug("[TEST, Channels] going to MockServer : " + "ws://" + options.xmpp.host + ":" + options.xmpp.port + "/websocket");
    const mockServer = new MockServer("ws://" + options.xmpp.host + ":" + options.xmpp.port + "/websocket");
    mockServer.on("connection", (server) => {
        logger.debug("[TEST, Channels] MockServer.connection : " + "server : " + server);
    });

    var __dirname = ".";
    var isAuthenticated = false;
    var resource = "";
    var alice = require(__dirname + "/../replies/alice_login_success.json");

    mockServer.on("message", message => {
        if (message.startsWith("<open")) {
            mockServer.send("<open xmlns='urn:ietf:params:xml:ns:xmpp-framing' to='dummy-all-in-one-dev-1.ope" +
                    "ntouch.cloud' version='1.0'/>");
            if (!isAuthenticated) {
                mockServer.send("<stream:features xmlns:stream='http://etherx.jabber.org/streams'><c xmlns='http:" +
                        "//jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/eja" +
                        "bberd/' ver='XOFO0R0cqi8p4qFlpdNxjjjK4Zs='/><register xmlns='http://jabber.org/f" +
                        "eatures/iq-register'/><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mech" +
                        "anism>PLAIN</mechanism><mechanism>DIGEST-MD5</mechanism><mechanism>SCRAM-SHA-1</" +
                        "mechanism></mechanisms></stream:features>");
            } else {
                mockServer.send("<stream:features xmlns:stream='http://etherx.jabber.org/streams'><c xmlns='http:" +
                        "//jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/eja" +
                        "bberd/' ver='XOFO0R0cqi8p4qFlpdNxjjjK4Zs='/><bind xmlns='urn:ietf:params:xml:ns:" +
                        "xmpp-bind'/><session xmlns='urn:ietf:params:xml:ns:xmpp-session'><optional/></se" +
                        "ssion><ver xmlns='urn:xmpp:features:rosterver'/><sm xmlns='urn:xmpp:sm:2'/><sm x" +
                        "mlns='urn:xmpp:sm:3'/><csi xmlns='urn:xmpp:csi:0'/></stream:features>");
            }
        }
        if (message.startsWith("<auth")) {
            mockServer.send("<challenge xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>cj1kNDFkOGNkOThmMDBiMjA0ZTk4" +
                    "MDA5OThlY2Y4NDI3ZS93UzdkNlNDYmsyUXRFM0VUd251V0E9PSxzPU52NERxZ1dmb09ESG5YUlJCeWpE" +
                    "REE9PSxpPTQwOTY=</challenge>");
            mockServer.send("<open xmlns=\"urn:ietf:params:xml:ns:xmpp-framing\" version=\"1.0\" default:lang" +
                    "=\"en\" id=\"13260960624462208793\" from=\"dummy-all-in-one-dev-1.opentouch.clou" +
                    "d\"\/>");
        }
        if (message.startsWith("<response")) {
            mockServer.send("<success xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>dj1KM3d3dTc2WWU4THVEM1FOWVNWZj" +
                    "dTNUlHS3c9</success>");
            isAuthenticated = true;
        }
        if (message.startsWith("<iq type=\"set\"")) {
            var id = message.match(/id="(.*)" /);
            if (message.indexOf("bind") > -1) {
                resource = message.match(/<resource>(.*)<\/resource>/);
                mockServer.send("<iq xmlns='jabber:client' id='" + id[1] + "' type='result'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><jid>" + alice.loggedInUser.jid_im + "/" + resource[1] + "</jid></bind></iq>");
            } else if (message.indexOf("session") > -1) {
                mockServer.send("<iq xmlns='jabber:client' type='result' id='" + id[1] + "'/>");
            } else if (message.indexOf("carbon") > -1) {
                mockServer.send("<iq xmlns='jabber:client' from='" + alice.loggedInUser.jid_im + "' to='" + alice.loggedInUser.jid_im + "/" + resource[1] + "' id='" + id[1] + "' type='result'/>")
            }
        }
        if (message.startsWith("<presence") > -1) {
            mockServer.send("<presence xmlns='jabber:client' from='" + alice.loggedInUser.jid_im + "/" + resource[1] + "' to='" + alice.loggedInUser.jid_im + "/" + resource[1] + "'><priority>5</priority></presence>");
        }
    });

    // instantiate the SDK
    let rainbowSDK = new RainbowSDK(options);

    before(() => {
        var currentDate = new Date();
        var currentTimestamp = currentDate.valueOf() / 1000;

        let utc = new Date().toJSON().replace(/-/g, '/');

        logger.debug("[TEST, Channels] before : " + utc);

        var applicationResponse = require(__dirname + "/../replies/application_login_success.json");

        var tokenApp = jwt.sign({
            "countRenewed": 0,
            "maxTokenRenew": 5,
            "app": {
                "id": applicationResponse.id,
                "name": applicationResponse.loggedInApplication.name
            },
            "iat": currentTimestamp ,
            "exp": Math.trunc((currentTimestamp + (3600 * 240) ))
        }, "dummy");

        applicationResponse.token = tokenApp;

        var loginResponse = require(__dirname + "/../replies/alice_login_success.json");

        var token = jwt.sign({
            "countRenewed": 0,
            "maxTokenRenew": 7,
            "user": {
                "id": loginResponse.loggedInUser.id,
                "loginEmail": loginResponse.loggedInUser.loginEmail
            },
            "iat": currentTimestamp,
            "exp": Math.trunc((currentTimestamp + (3600 * 240 )))
        }, "dummy");

        logger.debug(token);
        loginResponse.token = token;

         var scope = nock("https://" + options.rainbow.host )
            .get("/api/rainbow/applications/v1.0/authentication/renew")
            .reply(200, applicationResponse)
            .get("/api/rainbow/applications/v1.0/authentication/login")
            .reply(200, applicationResponse)
            .get("/api/rainbow/authentication/v1.0/login")
            .reply(200, loginResponse)
            .get("/api/rainbow/enduser/v1.0/users/networks?format=full")
            .reply(200, {
                data: [],
                total: 0
            })
            .get("/api/rainbow/enduser/v1.0/rooms?format=full&offset=0&limit=100&userId=58d2ae9907" +
                    "6f165e59e84dfb")
            .reply(200, {
                data: [],
                total: 0
            })
            .get("/api/rainbow/enduser/v1.0/users/58d2ae99076f165e59e84dfb/settings")
            .reply(200, require(__dirname + "/../replies/settings_presence_online.json"))
            .get("/api/rainbow/channels/v1.0/channels")
            .reply(200, require(__dirname + "/../replies/channels/empty_channel_list.json"))
            .get("/api/rainbow/enduser/v1.0/users/58d2ae99076f165e59e84dfb/groups?format=full&offs" +
                    "et=0&limit=100")
            .reply(200, {
                data: [],
                total: 0
            })
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
            .reply(200, {});

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

            logger.debug("prepare nock for post channels");
            var scope = nock("https://" + options.rainbow.host )
                .post("/api/rainbow/channels/v1.0/channels", {
                    "name": "FirstChannel",
                    "topic": "First Channel",
                    "visibility": "company",
                    "max_items": 100,
                    "max_payload_size": 60000
                })
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
                        "id": "5a02d9e1eb329a4dea6045a5"
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

        it("Read Channel first time", (done) => {
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
                    "id": "5a02d9e1eb329a4dea6045a6"
                }
            };

            var scope = nock("https://" + options.rainbow.host)
                .get("/api/rainbow/channels/v1.0/channels/" + readChannel.data.id)
                .reply(200, readChannel)
                .log(console.log);

            rainbowSDK
                .channels
                .getChannelById(readChannel.data.id)
                .then((channel) => {
                    expect(channel.title)
                        .to
                        .be
                        .equal("Read Channel");
                    return rainbowSDK
                        .channels
                        .getChannelById(channel.id);
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

        it("Read Channel forced", (done) => {
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
                    "id": "5a02d9e1eb329a4dea6045b6"
                }
            };

            var scope = nock("https://" + options.rainbow.host)
                .get("/api/rainbow/channels/v1.0/channels/" + readChannel.data.id)
                .reply(200, readChannel)
                .get("/api/rainbow/channels/v1.0/channels/" + readChannel.data.id)
                .reply(200, readChannel)
                .log(console.log);

            rainbowSDK
                .channels
                .getChannelById(readChannel.data.id, true)
                .then((channel) => {
                    expect(channel.title)
                        .to
                        .be
                        .equal("Read Channel");
                    return rainbowSDK
                        .channels
                        .getChannelById(channel.id, true);
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
            var updateChannel = require(__dirname + "/../replies/channels/update_channel.json");

            var scope = nock("https://" + options.rainbow.host)
                .post("/api/rainbow/channels/v1.0/channels", {
                    "name": "ChannelToUpdate",
                    "topic": "Channel To Update",
                    "visibility": "company",
                    "max_items": 100,
                    "max_payload_size": 60000
                } )
                .reply(200, updateChannel)
                .put("/api/rainbow/channels/v1.0/channels/" + updateChannel.data.id, {"title": "Channel To Updated"})
                .reply(200, function () {
                    var updatedChannel = Object.assign({}, updateChannel);
                    updatedChannel.data.title = "Channel To Updated";
                    return updatedChannel;
                });

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
                        .updateChannelDescription(channel, "Channel To Updated");
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
            var secondChannel = require(__dirname + "/../replies/channels/second_channel.json");

            var scope = nock("https://" + options.rainbow.host)
                .post("/api/rainbow/channels/v1.0/channels", {
                    "name": "Second Channel",
                    "topic": "Second Channel",
                    "visibility": "company",
                    "max_items": 100,
                    "max_payload_size": 60000
                })
                .reply(200, secondChannel)
                .delete("/api/rainbow/channels/v1.0/channels/" + secondChannel.data.id)
                .reply(200, {
                    "status": "Channel secondChannel.data.id successfully deleted",
                    "data": []
                });

            rainbowSDK
                .channels
                .createChannel("Second Channel", "Second Channel")
                .then((channel) => {
                    logger.debug(JSON.stringify(channel))
                    return rainbowSDK
                        .channels
                        .deleteChannel(channel)
                        .then((result) => {
                            logger.debug("Channel deleted");
                            scope.done();
                            done();
                        });
                });
        });

        it("Find Channel", (done) => {
            var findChannel = require(__dirname + "/../replies/channels/find_channel.json");

            var scope = nock("https://" + options.rainbow.host)
                .get("/api/rainbow/channels/v1.0/channels/search")
                .query({"limit": "100"})
                .query({"topic": "great"})
                .reply(200, findChannel);

            rainbowSDK
                .channels
                .findChannelsByTopic("great")
                .then((channels) => {
                    expect(channels)
                        .to
                        .have
                        .lengthOf(2);
                    done();
                });
        });

        it("Publish Message", () => {});

        it("Subscribe To Channel", () => {});

        it("Unsubscribe To Channel", () => {});

        it("Get Channel Users", () => {});

        it("Delete All Users From Channel", () => {});

        it("Update Channel Users", () => {});
    });
});