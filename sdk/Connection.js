"use strict";

const LOG_ID = '[CONNECTION]';

class Connection {

    constructor(_credentials) {
        this.credentials = _credentials;
        this.http = null;
    }

    start(http) {
        var that = this;
        this.http = http;

        return new Promise(function(resolve, reject) {
            console.log(LOG_ID, "Module started");
            console.log(LOG_ID, "Email = ", that.credentials.login);
            resolve();
        });
    }

    login() {

        var that = this;

        console.log(LOG_ID, "Login...");

        return new Promise(function(resolve, reject) {
            that.http.login('/api/rainbow/authentication/v1.0/login', that.credentials.login, that.credentials.password).then(function() {
                console.log(LOG_ID, "Login OK !!!");
                resolve();
            }).catch(function() {
                console.log(LOG_ID, "Login OK !!!");
                reject();
            });
        });
        
    }

};

module.exports.create = function(config) {
    return new Connection(config);
}