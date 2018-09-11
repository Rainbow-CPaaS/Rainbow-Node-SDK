"use strict";

const crypto = require("crypto");
const URL = require("url");
const fs = require("fs");

const TransferPromiseQueue = require("./TransferPromiseQueue");

const Deferred = require("../common/Utils").Deferred;

const LOG_ID = "FileServer - ";

const ONE_KILOBYTE = 1024;
const ONE_MEGABYTE = 1024 * 1024;
const ONE_GIGABYTE = 1024 * 1024 * 1024;

class FileServer {

    constructor(_eventEmitter, _logger) {
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this._capabilities = null;
        this.transferPromiseQueue = null;
    }

    get capabilities() {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!that._capabilities) {
                if (that.rest) {
                    that.rest.getServerCapabilities().then((capabilities) => {
                        that._capabilities = capabilities;
                        that.transferPromiseQueue = new TransferPromiseQueue();
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

        return new Promise(function (resolve, reject) {
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

        return new Promise(function (resolve) {
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
     * @memberof FileServer
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
     * @memberof FileServer
     */
    getBufferFromUrlWithOptimization(url, mime, fileSize, fileName, uploadedDate) {
        let that = this;
        if (fileSize === void 0) {
            fileSize = 0;
        }
        if (fileName === void 0) {
            fileName = "";
        }
        if (uploadedDate === void 0) {
            uploadedDate = "";
        }
        if (uploadedDate.length !== 0) {
            url += "?update=" + crypto.createHash("md5").update(uploadedDate).digest("hex");
        }

        let _url = url.startsWith("http") ? URL.parse(url).path : url;

        return new Promise((resolve, reject) => {

            this.capabilities.then((capabilities) => {
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
                                that.logger.log("info", LOG_ID + "[FileServer] getBufferFromUrlWithOptimization success");
                                resolve(buffer);
                            },
                            (error) => {
                                that.logger.log("info", LOG_ID + "[FileServer] " + error);
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
     * @memberof FileServer
     */
    getFileFromUrlWithOptimization(destFile, url, mime, fileSize, fileName, uploadedDate) {
        let that = this;
        if (fileSize === void 0) {
            fileSize = 0;
        }
        if (fileName === void 0) {
            fileName = "";
        }
        if (uploadedDate === void 0) {
            uploadedDate = "";
        }
        if (uploadedDate.length !== 0) {
            url += "?update=" + crypto.createHash("md5").update(uploadedDate).digest("hex");
        }

        let _url = url.startsWith("http") ? URL.parse(url).path : url;

        let stream = fs.createWriteStream(destFile, {
            flags: "a"
        });

        return new Promise((resolve, reject) => {

            this.capabilities.then((capabilities) => {
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
                                that.logger.log("info", LOG_ID + "[FileServer] getBufferFromUrlWithOptimization success");
                                resolve(buffer);
                            },
                            (error) => {
                                that.logger.log("info", LOG_ID + "[FileServer] " + error);
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
     * Method sends data file to server
     * 
     * @private
     * @param {string} fileId [required] file descriptor ID of file to be sent 
     * @param {File} file [required] file to be sent 
     * @param {string} mime [required] mime type of file
     * @returns {Promise<FileDescriptor>} file descriptor data received as response from server or http error response
     * 
     * @memberof FileServer
     */
    _uploadAFile(fileId, filePath, mime) {
        let that = this;
        return new Promise((resolve, reject) => {
            let fileDescriptor = this.fileStorageService.getFileDescriptorById(fileId);
            if (fileDescriptor) {
                fileDescriptor.state = "uploading";
            }

            let stream = fs.createReadStream(filePath);
            let buffer = new Buffer(ONE_MEGABYTE);
            stream.pipe(buffer)
            this.rest.uploadAFile(fileId, buffer)
                .then(
                    (response) => {
                        //let fileDescResponse = response.data.data;
                        let newFileDescriptor = that.fileStorageService.getFileDescriptorById(fileId);
                        if (newFileDescriptor) {
                            newFileDescriptor.state = "uploaded";
                        }
                        that.logger.log("info", LOG_ID + "(UploadAFile) success");
                        // this.$rootScope.$broadcast("ON_FILE_TRANSFER_EVENT", {
                        //     result: "success",
                        //     type: "upload",
                        //     url: this.portalURL + "/" + fileId,
                        //     fileId: fileId,
                        //     mime: mime,
                        //     filename: file.name,
                        //     filesize: file.size
                        // });
                        // this.fileStorageService.orderDocuments();
                        resolve(newFileDescriptor);
                    }).catch(
                    (errorResponse) => {
                        // let error = this.errorHelperService.handleError(errorResponse);
                        // this.$rootScope.$broadcast("ON_FILE_TRANSFER_EVENT", {
                        //     result: "failure",
                        //     type: "upload",
                        //     url: this.portalURL + "/" + fileId,
                        //     fileId: fileId,
                        //     mime: mime,
                        //     filename: file.name,
                        //     filesize: file.size
                        // });
                        reject(error);
                        that.logger.log("error", LOG_ID + "(UploadAFile) error: " + errorResponse);
                    });
        });
    }

    /**
     * Method sends data to server using range request mecanism (RFC7233)
     * 
     * @private
     * @param {string} fileId [required] file descriptor ID of file to be sent 
     * @param {Blob} file [required] file to be sent 
     * @param {number} initialSize [required] initial size of whole file to be sent before partition
     * @param {number} minRange [requied] minimum value of range
     * @param {number} maxRange [required] maximum value of range
     * @param {number} index [required] index of the part. Used to indicate the part number to the server
     * @returns {Promise<{}>} file descriptor data received as response from server or http error response
     * 
     * @memberof FileServer
     */
    _sendPartialDataToServer(fileId, file, initialSize, minRange, maxRange, index) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.sendPartialDataToServer(fileId, file, initialSize, minRange, maxRange, index).then(
                (response) => {
                    let filedescriptor = response.data.data;
                    that.logger.log("error", LOG_ID + "(_sendPartialDataToServer) sendPartialDataToServer success");
                    resolve(filedescriptor);
                },
                (errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse);
                    reject(errorResponse);
                    that.logger.log("error", LOG_ID + "(_sendPartialDataToServer) " + errorResponse);
                });
        });
    }

    /**
     * Upload File ByChunk progressCallback callback is displayed as part of the Requester class.
     * @callback uploadAFileByChunk~progressCallback
     * @param {FileDescriptor} fileDescriptor
     */

    /**
     * Method sends data to server using range request mecanism (RFC7233)
     * 
     * @private
     * @param {FileDescriptor} fileDescriptor [required] file descriptor Object of file to be sent 
     * @param {File} file [required] filePath of the file to be sent 
     * @param {uploadAFileByChunk~progressCallback} progressCallback [required] initial size of whole file to be sent before partition
     * @returns {Promise<{FileDescriptor}>} file descriptor data received as response from server or http error response
     * 
     * @memberof FileServer
     */
    uploadAFileByChunk(fileDescriptor, filePath, progressCallback) {
        let that = this;

        that.logger.log("info", LOG_ID + "(uploadAFileByChunk) _entering_");

        let fileStats = fs.statSync(filePath);

        let range = ONE_MEGABYTE;
        if (range < fileStats.size) {
            if (fileStats.size >= 100 * range) {
                range = (fileStats.size / 100) + this.ONE_KILOBYTE;
                that.logger.log("debug", LOG_ID + "(uploadAFileByChunk) changing chunk size: " + range);
            }
            let deferred = new Deferred();
            // let minRange = 0;
            // let maxRange = range - 1;
            // let repetition = Math.ceil(file.size / range);
            fileDescriptor.chunkTotalNumber = Math.ceil(fileStats.size / range);
            fileDescriptor.chunkPerformed = 0;
            fileDescriptor.chunkPerformedPercent = 0;
            fileDescriptor.state = "uploading";
            let promiseArray = [];

            let fd = fs.openSync("filePath", "r+");

            let partialSent = (blob, minRange, max, i) => {
                var promiseArrayDeferred = new Deferred();

                that._sendPartialDataToServer(fileDescriptor.id, blob, fileStats.size, minRange, max, i)
                    .then((response) => {
                        fileDescriptor.chunkPerformed++;
                        fileDescriptor.chunkPerformedPercent = 100 * fileDescriptor.chunkPerformed / fileDescriptor.chunkTotalNumber;
                        progressCallback(fileDescriptor);
                        return promiseArrayDeferred.resolve(response);

                    })
                    .catch((error) => {
                        that.logger.log("info", LOG_ID + "(uploadAFileByChunk) error on chunk upload=" + error);
                        promiseArrayDeferred.reject(error);
                    });
                return promiseArrayDeferred.promise;
            };

            for (let i = 0, minRange = 0, maxRange = range - 1, repetition = Math.ceil(fileStats.size / range); repetition > 0; i++, repetition--, minRange += range, maxRange += range) {
                let max = maxRange < fileStats.size ? maxRange : fileStats.size;

                let buf = new Buffer(max - minRange + 1);
                fs.read(fd, buf, minRange, max, minRange, (err, bytes) => {
                    if (err) {
                        return Promise.reject(err);
                    }
                    promiseArray.push(partialSent(buf, minRange, max, i));
                });
            }
            var promisesCompletion = () => {
                this.rest.sendPartialFileCompletion(fileDescriptor.id)
                    .then(
                        (response) => {
                            that.logger.log("info", LOG_ID + "(uploadAFileByChunk) success");
                            fileDescriptor.state = "uploaded";
                            fileDescriptor.chunkPerformed = 0;
                            fileDescriptor.chunkTotalNumber = 0;
                            fileDescriptor.chunkPerformedPercent = 0;
                            progressCallback(fileDescriptor);
                            deferred.resolve(fileDescriptor);
                        })
                    .catch((errorResponse) => {
                        deferred.reject(errorResponse);
                    });
            };
            var promisesReject = (errorResponse) => {
                deferred.reject(errorResponse);
            };
            that.transferPromiseQueue.addPromiseArray(promiseArray, promisesCompletion, promisesReject);
            return deferred.promise;
        }
        // Fallback if capabilities retrieval fails or file is small enough to upload the whole file in one go
        progressCallback(fileDescriptor);
        return that._uploadAFile(fileDescriptor.id, filePath, fileDescriptor.typeMIME)
            .then(
                (response) => {
                    that.logger.log("info", LOG_ID + "(uploadAFileByChunk) uploadAFile success");
                    progressCallback(fileDescriptor);
                    return Promise.resolve(fileDescriptor);
                });
    }

    isTransferInProgress() {
        return this.transferPromiseQueue.isTransferInProgress();
    }

    cancelAllTransfers() {
        this.transferPromiseQueue.cancelAllTransfers();
    }

    /**
     * Method retrieves user quota (capabilities) for user
     * 
     * @returns {Capabilities} user quota for user
     * 
     * @memberof FileServer
     */
    getServerCapabilities() {
        return this.rest.getServerCapabilities();
    }
}

module.exports = FileServer;