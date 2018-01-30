describe("rainbowSDK", function() {
    "use strict";

    var rainbowSDK;

    this.timeout(0);

    before(function(done) {

        rainbowSDK = angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

        $(document).on(rainbowSDK.RAINBOW_ONREADY, function() {
            console.log("READY");
            done();
        });
        
        $(document).on(rainbowSDK.RAINBOW_ONLOADED, function() {
            rainbowSDK.initialize();
        });

        rainbowSDK.load();
    });

    describe("Testing Core", function() {

        it("should be ready", function() {
            expect(rainbowSDK.isReady).to.equals(true);
        });

        it('should have a correct version', function() {
            expect(rainbowSDK.version()).to.be.a('string').and.not.equal("");
        });
    });

    /*
    describe('Connection Services', function() {
    
        it("should connect a user to the Rainbow Sandbox", function(done) {
            rainbowSDK.connection.signin('rford@westworld.com', 'Password_123').then(function(account) {
                expect(account).to.be.an('object');
                done();
            }).catch(function(err) {
                expect(err).to.equals(null);
                done();
            });
        });

        it("should disconnect the user from Rainbow Sandbox", function(done) {
            rainbowSDK.connection.signout().then(function(json) {
                expect(json).to.be.an('object');
                done();
            }).catch(function(err) {
                expect(err).to.equals(null);
                done();
            });
        });
    });
    */
});