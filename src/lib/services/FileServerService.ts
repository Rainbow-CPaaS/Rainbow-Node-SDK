"use strict";
import EventEmitter = NodeJS.EventEmitter;

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import * as  crypto from "crypto";
import * as URL from "url";
import * as fs from "fs";
//const TransferPromiseQueue = require("./TransferPromiseQueue");
import {createPromiseQueue} from "../common/promiseQueue";
import {Deferred, logEntryExit} from "../common/Utils";
import {ErrorManager} from "../common/ErrorManager";
//const blobUtil = require("blob-util");
//const Blob = require("blob");
import * as streamBuffers from 'stream-buffers';
import {isStarted} from "../common/Utils";
import {Logger} from "../common/Logger";
import {FileStorageService} from "./FileStorageService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "FileServer/SVCE - ";

const ONE_KILOBYTE = 1024;
const ONE_MEGABYTE = 1024 * 1024;
const ONE_GIGABYTE = 1024 * 1024 * 1024;

@logEntryExit(LOG_ID)
@isStarted([])
/**
* @module
* @name FileStorage
 * @version SDKVERSION
* @public
* @description
*      This service manage files on server side
*/
class FileServer {
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    private _capabilities: any;
    private transferPromiseQueue: any;
    private _fileStorageService: FileStorageService;
	public ONE_KILOBYTE: any;
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
	public ONE_MEGABYTE: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig) {
        this._startConfig = _startConfig;
        this._eventEmitter = _eventEmitter;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = _logger;
        this._capabilities = null;
        this.transferPromiseQueue = null;
        this._fileStorageService = null;
        this.ready = false;
    }

    get capabilities() : Promise<any>{
        let that = this;
        return new Promise((resolve, reject) => {
            if (!that._capabilities) {
                if (that._rest) {
                    that._rest.getServerCapabilities().then((capabilities) => {
                        that._capabilities = capabilities;
                        //that.transferPromiseQueue = new TransferPromiseQueue(that._logger);
                        resolve(this._capabilities);
                    }).catch(() => {
                        return reject();
                    });
                } else {
                    return reject();
                }
                return;
            }
            resolve(that._capabilities);
        });
    }

    start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _fileStorageService
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._fileStorageService = _core.fileStorage;

                that.ready = true;
                resolve();

            } catch (err) {
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;

                that.ready = false;
                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    init () {
        let that = this;

        return new Promise((resolve, reject)=> {
            let capa = that.capabilities;
            resolve(capa);
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
     */
    getPartialDataFromServer(url, minRange, maxRange, index) {
        return this._rest.getPartialDataFromServer(url, minRange, maxRange, index);
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

            this.capabilities.then((capabilities : any) => {
                if (Boolean(capabilities.maxChunkSizeDownload) && fileSize !== 0 && fileSize > capabilities.maxChunkSizeDownload) {
                    let range = capabilities.maxChunkSizeDownload;
                    let minRange = 0;
                    let maxRange = range - 1;
                    let repetition = Math.ceil(fileSize / range);
                    let bufferArray = new Array(repetition);

                    let promiseArray = [];

                    for (let i = 0; repetition > 0; i++, repetition--, minRange += range, maxRange += range) {
                        promiseArray.push(
                            this.getPartialDataFromServer(_url, minRange, maxRange, i).then((response : any ) => {
                                bufferArray[response.index] = response.data;
                                return (response.data);
                            })
                        );
                    }

                    Promise.all(promiseArray)
                        .then(
                            () => {
                                let buffer = Buffer.concat(bufferArray);
                                that._logger.log("info", LOG_ID + "[FileServer] getBufferFromUrlWithOptimization success");
                                resolve(buffer);
                            },
                            (error) => {
                                that._logger.log("error", LOG_ID + "[FileServer] Error." );
                                that._logger.log("internalerror", LOG_ID + "[FileServer] Error : ", error);
                                return reject(error);
                            }
                        );
                } else {
                    resolve(that._rest.getFileFromUrl(_url));
                }
            });
        });
    }

    /**
     * Method creates buffer from a file retrieved from server using optimization (range request) whenever necessary
     *
     * @param destFile
     * @param {string} url [required] server url for request
     * @param {string} mime [required] Mime type of the blob to be created
     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
     * @param {string} fileName [optional] name of file to be downloaded
     * @param {string} uploadedDate [optional] date of the upload
     * @returns {Buffer} Buffer created from data received from server
     *
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

            this.capabilities.then((capabilities : any) => {
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
                            .then((response : any)=> {

                                blobArray[response.index] = response.data;
                                return (response.data);
                            })
                        );
                    }

                    Promise.all(promiseArray)
                        .then(
                            () => {
                                let buffer = Buffer.concat(blobArray);
                                that._logger.log("info", LOG_ID + "[FileServer] getBufferFromUrlWithOptimization success");
                                resolve(buffer);
                            },
                            (error) => {
                                that._logger.log("error", LOG_ID + "[FileServer] Error.");
                                that._logger.log("internalerror", LOG_ID + "[FileServer] Error : ", error);
                                return reject(error);
                            }
                        );
                } else {
                    resolve(that._rest.getFileFromUrl(_url));
                }
            });
        });
    }

    /***
     * @private
     * @param fileDescriptor
     * @param large
     */
    public async getBlobThumbnailFromFileDescriptor(fileDescriptor: any, large: boolean = false) {
/*
        if (fileDescriptor.thumbnail.isThumbnailAvailable() ||
            (fileDescriptor.isImage() && fileDescriptor.size < (20 * this.ONE_KILOBYTE)) ) {

            // Check if a request for this thumbnail is already lauched
            let existingPromise = this.thumbnailPromises[fileDescriptor.id];
            if (existingPromise) {
                this.$log.info("[FileServerService] getBlobThumbnailFromFileDescriptor " + fileDescriptor.id + " already lauched");
                return existingPromise.promise;
            }

            // Create the defered object
            let defered = this.$q.defer();
            this.thumbnailPromises[fileDescriptor.id] = defered;

            // Forge the thumbnail url
            let url = fileDescriptor.url;
            if (fileDescriptor.thumbnail.isThumbnailAvailable() && fileDescriptor.size >= (20 * this.ONE_KILOBYTE)) {
                if (large) { url += "?thumbnail500=true"; }
                else { url += "?thumbnail=true"; }
            }
            else if (fileDescriptor.uploadedDate) { url += "?update=" + MD5.hexdigest(fileDescriptor.uploadedDate); }

            // Get the thumbnail blob
            this.getBlobFromUrl(url, fileDescriptor.typeMIME, fileDescriptor.size, fileDescriptor.fileName)
                .then((blob) => {
                    fileDescriptor.previewBlob = blob;

                    this.$rootScope.$broadcast("ON_FILE_TRANSFER_EVENT", {
                        result: "success", type: "download",
                        fileDesc: fileDescriptor});
                    delete this.thumbnailPromises[fileDescriptor.id];
                    defered.resolve(blob);
                })
                .catch((error) => {
                    this.$rootScope.$broadcast("ON_FILE_TRANSFER_EVENT", {
                        result: "failure", type: "download", message: error.message,
                        fileDesc: fileDescriptor});
                    delete this.thumbnailPromises[fileDescriptor.id];
                    defered.reject(error);
                });

            return defered.promise;
        }
        else { return this.$q.reject(); }

 */
    };


    /**
     * Method sends data file to server
     *
     * @private
     * @param {string} fileId [required] file descriptor ID of file to be sent
     * @param {File} file [required] file to be sent
     * @param {string} mime [required] mime type of file
     * @returns {Promise<FileDescriptor>} file descriptor data received as response from server or http error response
     *
     */
    _uploadAFile(fileId, filePath, mime) {
        let that = this;
        return new Promise((resolve, reject) => {
            let fileDescriptor = that._fileStorageService.getFileDescriptorById(fileId);
            if (fileDescriptor) {
                fileDescriptor.state = "uploading";
            }

            let stream = fs.createReadStream(filePath);
            //let buffer = new Buffer(ONE_MEGABYTE);
/*
            let myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
                initialSize: (1000 * 1024),   // start at 100 kilobytes.
                incrementAmount: (100 * 1024) // grow by 10 kilobytes each time buffer overflows.
            });
*/
            //stream.pipe(myWritableStreamBuffer);
//            stream.pipe(buffer)
            that._rest.uploadAStream(fileId, stream).then(
                    (response) => {
                        //let fileDescResponse = response.data.data;
                        let newFileDescriptor = that._fileStorageService.getFileDescriptorById(fileId);
                        if (newFileDescriptor) {
                            newFileDescriptor.state = "uploaded";
                        }
                        that._logger.log("info", LOG_ID + "(UploadAFile) success");
                        // this.$rootScope.$broadcast("ON_FILE_TRANSFER_EVENT", {
                        //     result: "success",
                        //     type: "upload",
                        //     url: this.portalURL + "/" + fileId,
                        //     fileId: fileId,
                        //     mime: mime,
                        //     filename: file.name,
                        //     filesize: file.size
                        // });
                        // this._fileStorageService.orderDocuments();
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
                        that._logger.log("error", LOG_ID + "(UploadAFile) error." );
                        that._logger.log("internalerror", LOG_ID + "(UploadAFile) error : ", errorResponse);
                        return reject(errorResponse);
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
     */
    _sendPartialDataToServer(fileId, file, index) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.sendPartialDataToServer(fileId, file, index).then(
                (response : any) => {
                    let filedescriptor = response.data;
                    that._logger.log("info", LOG_ID + "(_sendPartialDataToServer) sendPartialDataToServer success");
                    resolve(filedescriptor);
                },
                (errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse);
                    that._logger.log("error", LOG_ID + "(_sendPartialDataToServer) Error." );
                    that._logger.log("internalerror", LOG_ID + "(_sendPartialDataToServer) Error : ", errorResponse);
                    return reject(errorResponse);
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
//     * @param {uploadAFileByChunk~progressCallback} progressCallback [required] initial size of whole file to be sent before partition
     * @returns {Promise<{FileDescriptor}>} file descriptor data received as response from server or http error response
     *
     */
    async uploadAFileByChunk(fileDescriptor, filePath /*, progressCallback */) {
        let that = this;

        let promiseQueue = createPromiseQueue(that._logger);

        let fileStats = fs.statSync(filePath);

        //let range = ONE_MEGABYTE;
        let range = (await that.capabilities).maxChunkSizeUpload;
        if (range < fileStats.size) {
            if (fileStats.size >= 100 * range) {
                range = (fileStats.size / 100) + this.ONE_KILOBYTE;
                that._logger.log("debug", LOG_ID + "(uploadAFileByChunk) changing chunk size: " + range);
            }
            let deferred = new Deferred();
            fileDescriptor.chunkTotalNumber = Math.ceil(fileStats.size / range);
            fileDescriptor.chunkPerformed = 0;
            fileDescriptor.chunkPerformedPercent = 0;
            fileDescriptor.state = "uploading";
            //let promiseArray = [];
            let fd = fs.openSync(filePath, "r+");

            let partialSent = (promiseDeferred, blob, i) => {
                //let promiseArrayDeferred = new Deferred();

                that._sendPartialDataToServer(fileDescriptor.id, blob, i)
                    .then((response) => {
                        fileDescriptor.chunkPerformed++;
                        fileDescriptor.chunkPerformedPercent = 100 * fileDescriptor.chunkPerformed / fileDescriptor.chunkTotalNumber;
                        // progressCallback(fileDescriptor);
                        return promiseDeferred.resolve(response);

                    })
                    .catch((error) => {
                        that._logger.log("error", LOG_ID + "(uploadAFileByChunk) error on chunk upload.");
                        that._logger.log("internalerror", LOG_ID + "(uploadAFileByChunk) error on chunk upload : ", error);
                        return promiseDeferred.reject(error);
                    });
                return promiseDeferred.promise;
            };

            for (let i = 0, minRange = 0, maxRange = range - 1, repetition = Math.ceil(fileStats.size / range); repetition > 0; i++, repetition--, minRange += range, maxRange += range) {
                let max = maxRange < fileStats.size ? maxRange + 1 : fileStats.size;

                let sizeToRead = max - minRange;
                let buf = new Buffer(sizeToRead);

                that._logger.log("debug", LOG_ID + "(uploadAFileByChunk) sizeToRead=", sizeToRead, ", minRange : ", minRange, ", max : ", max, ", buff.byteLength : ", buf.byteLength);

                let promiseDeferred = new Deferred();
                //promiseArray.push(promiseDeferred.promise);
                promiseQueue.add(() => {
                    fs.readSync(fd, buf, 0, sizeToRead, null);
                    partialSent(promiseDeferred, buf, i);
                    return promiseDeferred.promise;
                });

            }
            /* let promisesCompletion = () => {
                 this._rest.sendPartialFileCompletion(fileDescriptor.id)
                     .then(
                         (response) => {
                             that._logger.log("info", LOG_ID + "(uploadAFileByChunk) success");
                             fileDescriptor.state = "uploaded";
                             fileDescriptor.chunkPerformed = 0;
                             fileDescriptor.chunkTotalNumber = 0;
                             fileDescriptor.chunkPerformedPercent = 0;
                             // progressCallback(fileDescriptor);
                             deferred.resolve(fileDescriptor);
                         })
                     .catch((errorResponse) => {
                         deferred.reject(errorResponse);
                     });
             };
             let promisesReject = (errorResponse) => {
                 deferred.reject(errorResponse);
             };
             that.transferPromiseQueue.addPromiseArray(promiseArray, promisesCompletion, promisesReject);
             // */

            promiseQueue.add(() => {
                return this._rest.sendPartialFileCompletion(fileDescriptor.id)
                    .then(
                        (response) => {
                            that._logger.log("info", LOG_ID + "(uploadAFileByChunk) success");
                            fileDescriptor.state = "uploaded";
                            fileDescriptor.chunkPerformed = 0;
                            fileDescriptor.chunkTotalNumber = 0;
                            fileDescriptor.chunkPerformedPercent = 0;
                            // progressCallback(fileDescriptor);
                            deferred.resolve(fileDescriptor);
                        })
                    .catch((errorResponse) => {
                        return deferred.reject(errorResponse);
                    });
            });
            // */
            return deferred.promise;
        }
        // Fallback if capabilities retrieval fails or file is small enough to upload the whole file in one go
        // progressCallback(fileDescriptor);
        return that._uploadAFile(fileDescriptor.id, filePath, fileDescriptor.typeMIME)
            .then(
                (response) => {
                    that._logger.log("info", LOG_ID + "(uploadAFileByChunk) uploadAFile success");
                    // progressCallback(fileDescriptor);
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
     * Method creates blob from a file retrieved from server using optimization (range request) whenever necessary
     *
     * @param {string} url [required] server url for request
     * @param {string} mime [required] Mime type of the blob to be created
     * @param {number} fileSize [optional] size of file to be retrieved. Default: 0
     * @param {string} fileName [optional] name of file to be downloaded
     * @returns {Promise<Blob>} Blob created from data received from server
     *
     * !!!!!! OBSOLETE
     */
    async getBlobFromUrlWithOptimization(url, mime, fileSize, fileName, uploadedDate ) {
        let that = this;
        if (fileSize == null || fileSize == undefined) {
            fileSize = 0;
        }

        if (fileName == null || fileName == undefined) {
            fileName = "";
        }

        if (uploadedDate == null || uploadedDate == undefined) {
            uploadedDate = "";
        }

        if (uploadedDate.length !== 0) {
          // NEED TO BE CORREDTED TO BE USED IN NODE RAINBOW SDK  url += "?update=" + MD5.hexdigest(uploadedDate);
        }

        if (!! (await that.capabilities).maxChunkSizeDownload && fileSize !== 0 && fileSize > (await that.capabilities).maxChunkSizeDownload) {
            return new Promise(async(resolve, reject) => {
                let range = (await that.capabilities).maxChunkSizeDownload;
                if (range > that.ONE_MEGABYTE) {
                    range = that.ONE_MEGABYTE;
                }
                let minRange = 0;
                let maxRange = range - 1;
                let repetition = Math.ceil(fileSize / range);
                let blobArray = new Array(repetition);
                that._logger.log("info", LOG_ID + "[FileServerService] getBlobFromUrlWithOptimization : " + repetition + " chunks to be downloaded");

                let promiseArray = [];

                for (let i = 0; repetition > 0; i++ , repetition-- , minRange += range, maxRange += range) {
                    promiseArray.push(
                        that.getPartialDataFromServer(url, minRange, maxRange, i)
                            .then((response) => {
                                blobArray[response['index']] = response['data'];
                                return (response['data']);
                            })
                    );
                }

                Promise.all(promiseArray)
                    .then(
                        () => {
                            /* NEED TO BE CORREDTED TO BE USED IN NODE RAINBOW SDK
                             let blob = new Blob(blobArray,
                                { type: mime });
                            that._logger.log("info", LOG_ID + "[FileServerService] getBlobFromUrlWithOptimization success");

                            resolve(blob);
                            */
                        },
                        (errorResponse) => {
                            let errorMessage = "[FileServerService] getBlobFromUrlWithOptimization failure : " + errorResponse.message;
                            that._logger.log("error", LOG_ID + "[FileServerService] getBlobFromUrlWithOptimization Error.");
                            that._logger.log("internalerror", LOG_ID + "[FileServerService] getBlobFromUrlWithOptimization : ", errorResponse);
                            return  reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                            /*
                            let error = this.errorHelperService.handleError(errorResponse);

                            let errorDataObj = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(errorResponse.data)));
                            let translatedErrorMessage = that.errorHelperService.getLocalizedError(errorDataObj.errorDetailsCode);
                            that._logger.log("info", LOG_ID + "[FileServerService] " + translatedErrorMessage ? translatedErrorMessage : error.message);
                            */

                            //reject(errorMessage);
                        }
                    );
            });
        } else {
            return this.getBlobFromUrl(url, mime, fileSize, fileName);
        }
    };

    /**
     * Method creates blob from a file retrieved from server
     *
     * @private
     * @param {string} url [required] server url for request
     * @param {string} mime [required] Mime type of the blob to be created
     * @param {number} fileSize [required] size of file to be retrieved
     * @param {string} fileName [required] name of file to be downloaded
     * @returns {ng.IPromise<Blob>} Blob created from data received from server
     *
     */
     getBlobFromUrl(url, mime, fileSize, fileName) {
         let that = this;
        that._logger.log("info", LOG_ID + "[FileServerService] >getBlobFromUrl" );
        that._logger.log("internal", LOG_ID + "[FileServerService] >getBlobFromUrl : " + url);

        return new Promise((resolve, reject) => {
            /*this.$http({
                method: "GET",
                url: url,
                headers: this.authService.getRequestHeader(),
                responseType: 'arraybuffer'
            }) // */
            that._rest.getBlobFromUrl(url).then(
                (response) => { // : ng.IHttpPromiseCallbackArg<IHttpUploadResult>
                    /* let blob = blobUtil.createBlob([response.data],
                        { type: mime }); // */

                    let blob = {buffer : response,
                         type: mime,
                        fileSize: fileSize,
                        fileName: fileName
                    }; // */

                    /*let blob = new Blob([response.data],
                        { type: mime }); // */

                    that._logger.log("debug", LOG_ID + "[FileServerService] getBlobFromUrl success");
                    resolve(blob);
                },
                (errorResponse) => {
                    let errorMessage = "[FileServerService] getBlobFromUrlWithOptimization failure : " + errorResponse;
                    that._logger.log("error", LOG_ID + "[FileServerService] getBlobFromUrlWithOptimization Error." );
                    that._logger.log("internalerror", LOG_ID + "[FileServerService] getBlobFromUrlWithOptimization : ", errorResponse);
                    let err = ErrorManager.getErrorManager().ERROR;
                    err.msg = errorMessage;
                    return reject(err);
                    /*
            let error = this.errorHelperService.handleError(errorResponse);

            let errorDataObj = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(errorResponse.data)));
            let translatedErrorMessage = this.errorHelperService.getLocalizedError(errorDataObj.errorDetailsCode);
            this.$log.error("[FileServerService] " + (translatedErrorMessage) ? translatedErrorMessage : error.message);
                // */
                });
        });
    }

/**
* Method retrieves user quota (capabilities) for user
*
* @returns {Capabilities} user quota for user
*
*/
    getServerCapabilities() {
        return this._rest.getServerCapabilities();
    }
}

module.exports.FileServerService = FileServer;
export {FileServer as FileServerService};
