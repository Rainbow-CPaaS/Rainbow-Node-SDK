"use strict";

const crypto = require("crypto");
const URL = require("url");
const fs = require("fs");

const LOG_ID = "FILESERVERSERVICE - ";

class FileServerService {

    constructor(_eventEmitter, _logger) {
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this._capabilities = null;
    }

    get capabilities()  {
        let that = this;
        return new Promise(( resolve, reject) => {
                if (!that._capabilities) {
                    if (that.rest) {
                        that.rest.getServerCapabilities().then((capabilities) => {
                            that._capabilities = capabilities;
                            that.logger.log("debug", LOG_ID + "(start) _exiting_");
                            resolve(this._capabilities);
                        }).catch(() => {
                            reject();
                        });
                    } else {
                        reject();
                    }
                    return;
                }
                resolve(that._capabilities);
        });
    }

    start(_xmpp, _rest) {

        var that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.rest = _rest;

                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve) {
            try {
                that._xmpp = null;
                that._rest = null;
                
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * Method retrieve data from server using range request mecanism (RFC7233)
     * 
     * @private
     * @param {string} url [required] server url for request
     * @param {number} minRange [requied] minimum value of range
     * @param {number} maxRange [required] maximum value of range
     * @param {number} index [required] index of the part. Used to re-assemble the data 
     * @returns {Object} structure containing the response data from server and the index 
     * 
     * @memberof FileServerService
     */
    getPartialDataFromServer(url, minRange, maxRange, index) {
        return this.rest.getPartialDataFromServer(url, minRange, maxRange, index);
    }

    /**
     * Method creates buffer from a file retrieved from server using optimization (range request) whenever necessary
     * 
     * @param {string} url [required] server url for request
     * @param {string} mime [required] Mime type of the blob to be created
     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
     * @param {string} fileName [optional] name of file to be downloaded
     * @returns {Buffer} Buffer created from data received from server
     * 
     * @memberof FileServerService
     */
    getBufferFromUrlWithOptimization(url, mime, fileSize, fileName, uploadedDate) {
        let that = this;
        if (fileSize === void 0) { fileSize = 0; }
        if (fileName === void 0) { fileName = ""; }
        if (uploadedDate === void 0) { uploadedDate = ""; }
        if (uploadedDate.length !== 0) {
            url += "?update=" + crypto.createHash("md5").update(uploadedDate).digest("hex");
        }

        let _url = url.startsWith("http") ? URL.parse(url).path : url;

        return new Promise((resolve, reject) => {
        
            this.capabilities.then( (capabilities) => {
                if (Boolean(capabilities.maxChunkSizeDownload) && fileSize !== 0 && fileSize > capabilities.maxChunkSizeDownload) {
                    let range = capabilities.maxChunkSizeDownload;
                    let minRange = 0;
                    let maxRange = range - 1;
                    let repetition = Math.ceil(fileSize / range);
                    let bufferArray = new Array(repetition);

                    let promiseArray = [];

                    for (let i = 0; repetition > 0; i++, repetition--, minRange += range, maxRange += range) {
                        promiseArray.push(
                            this.getPartialDataFromServer(_url, minRange, maxRange, i)
                            .then(response => {
                                bufferArray[response.index] = response.data;
                                return (response.data);
                            })
                        );
                    }

                    Promise.all(promiseArray)
                    .then(
                        () => {
                            let buffer = Buffer.concat(bufferArray);
                            that.logger.log("info", LOG_ID + "[FileServerService] getBufferFromUrlWithOptimization success");
                            resolve(buffer);
                        },
                        (error) => {
                            that.logger.log("info", LOG_ID + "[FileServerService] " + error);
                            reject(error);
                        }
                    );
                } else {
                    resolve(that.rest.getFileFromUrl(_url));
                }
            }); 
        });
    }

    /**
     * Method creates buffer from a file retrieved from server using optimization (range request) whenever necessary
     * 
     * @param {string} file [required] destination file
     * @param {string} url [required] server url for request
     * @param {string} mime [required] Mime type of the blob to be created
     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
     * @param {string} fileName [optional] name of file to be downloaded
     * @returns {Buffer} Buffer created from data received from server
     * 
     * @memberof FileServerService
     */
    getFileFromUrlWithOptimization(destFile, url, mime, fileSize, fileName, uploadedDate) {
        let that = this;
        if (fileSize === void 0) { fileSize = 0; }
        if (fileName === void 0) { fileName = ""; }
        if (uploadedDate === void 0) { uploadedDate = ""; }
        if (uploadedDate.length !== 0) {
            url += "?update=" + crypto.createHash("md5").update(uploadedDate).digest("hex");
        }

        let _url = url.startsWith("http") ? URL.parse(url).path : url;

        let stream  = fs.createWriteStream(destFile, {flags: "a"});

        return new Promise((resolve, reject) => {
        
            this.capabilities.then( (capabilities) => {
                if (Boolean(capabilities.maxChunkSizeDownload) && fileSize !== 0 && fileSize > capabilities.maxChunkSizeDownload) {
                    let range = capabilities.maxChunkSizeDownload;
                    let minRange = 0;
                    let maxRange = range - 1;
                    let repetition = Math.ceil(fileSize / range);
                    let blobArray = new Array(repetition);

                    let promiseArray = [];
                    
                    for (let i = 0; repetition > 0; i++, repetition--, minRange += range, maxRange += range) {
                        promiseArray.push(
                            this.getPartialDataFromServer(_url, minRange, maxRange, i)
                            .then(response => {
                                
                                blobArray[response.index] = response.data;
                                return (response.data);
                            })
                        );
                    }

                    Promise.all(promiseArray)
                    .then(
                        () => {
                            let buffer = Buffer.concat(blobArray);
                            that.logger.log("info", LOG_ID + "[FileServerService] getBufferFromUrlWithOptimization success");
                            resolve(buffer);
                        },
                        (error) => {
                            that.logger.log("info", LOG_ID + "[FileServerService] " + error);
                            reject(error);
                        }
                    );
                } else {
                    resolve(that.rest.getFileFromUrl(_url));
                }
            }); 
        });
    }

    /**
     * Method retrieves user quota (capabilities) for user
     * 
     * @returns {Capabilities} user quota for user
     * 
     * @memberof FileServerService
     */
    getServerCapabilities() {
        return this.rest.getServerCapabilities();
    }
}


module.exports = FileServerService;