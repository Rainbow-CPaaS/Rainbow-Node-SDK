let RainbowSDK = require("../../index.js");
let options = require("../options.js");
let expect = require("chai").expect;
describe("Channel Service", () => {

    // LOGGER
    let winston = require("winston");
    let logger = new winston.Logger({
        transports: [new(winston.transports.Console)()]
    });

    // instantiate the SDK
    let rainbowSDK = new RainbowSDK(options);

    before(() => {
        return rainbowSDK
            .start()
            .then(() => {
                logger.debug("SDK Started");
            })
            .catch((err) => {
                logger.error(err);
            });
    });

    after(() => {
        return rainbowSDK
            .stop()
            .then(() => {
                logger.debug("SDK Stopped");
            })
            .catch((err) => {
                logger.error(err);
            });
    });

    beforeEach(() => {
        // Clean up existing channels
        rainbowSDK
            .channels
            .getChannels()
            .then((channels) => {
                logger.debug("Existing Channels " + JSON.stringify(channels));
                let channelPromises = [];
                channels
                    .owner
                    .forEach((channel) => {
                        logger.error("Remove Channel " + JSON.stringify(channel));
                        channelPromises.push(rainbowSDK.channels.deleteChannel(channel.id));
                    }, this);
                return Promise.all(channelPromises);
            });
    });

    afterEach(() => {});

    describe("Channel CRUD", () => {
        it("Create Channel", (done) => {
            rainbowSDK
                .channels
                .createChannel("FirstChannel", "First Channel")
                .then((channel) => {
                    logger.debug("Channel created");
                    done();
                });
        });

        it("Update Channel", (done) => {
            rainbowSDK
                .channels
                .createChannel("ChannelToUpdate", "Channel To Update")
                .then((channel) => {
                    logger.debug("Channel created");
                    expect(channel.title).to.be.equal("Channel To Update");
                    return rainbowSDK.channels.updateChannel(channel.id, "Channel To Updated");
                }).then( (channel) => {
                    expect(channel.title).to.be.equal("Channel To Updated");
                    done();
                } );
        });

        it("Delete Channel", (done) => {
            rainbowSDK
                .channels
                .createChannel("Second Channel", "Second Channel")
                .then((channel) => {
                    return rainbowSDK
                        .channels
                        .deleteChannel(channel.id)
                        .then((result) => {
                            logger.debug("Channel deleted");
                            done();
                        });
                });
        });
    });
});