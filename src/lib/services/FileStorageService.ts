"use strict";
import EventEmitter = NodeJS.EventEmitter;

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import * as fileapi from "file-api";
import {FileViewerElementFactory as fileViewerElementFactory} from "../common/models/FileViewer";
import {fileDescriptorFactory} from "../common/models/fileDescriptor";
import {Conversation} from "../common/models/Conversation";
import {ErrorManager} from "../common/ErrorManager";
import * as url from 'url';
import {getBinaryData, logEntryExit, orderByFilter, resizeImage} from "../common/Utils";
import {isStarted} from "../common/Utils";
import {Logger} from "../common/Logger";
import {FileServerService} from "./FileServerService";
import {ConversationsService} from "./ConversationsService";
import {ContactsService} from "./ContactsService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "FileStorage/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name FileStorage
 * @version SDKVERSION
 * @public
 * @description
 *      This service shares files with a single user (one-to-one conversation) or with several persons (bubble conversation). <br><br>
 *      The main methods and events proposed in that service allow to: <br>
 *      - Upload a file in a one-to-one conversation or bubble conversation, <br/>
 *      - Download a file from a conversation or bubble, <br/>
 *      - To be notified when a file has been successfully uploaded when there is an error when uploading or downloading a file in a conversation or a bubble<br/>
 *      - Get the list of files send or received in a one-to-one conversation <br/>
 *      - Get the list of files send or received in a bubble conversation <br/>
 *      - Get the connected user quota and consumption
 */
class FileStorage {
    private _rest: RESTService;
    private _xmpp: XMPPService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP : any;
    private _useS2S: any;
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    private _fileServerService: FileServerService;
    private _conversations: ConversationsService;
	public fileDescriptors: any;
	public fileDescriptorsByDate: any;
	public fileDescriptorsByName: any;
	public fileDescriptorsBySize: any;
	public receivedFileDescriptors: any;
	public receivedFileDescriptorsByName: any;
	public receivedFileDescriptorsByDate: any;
	public receivedFileDescriptorsBySize: any;
	public consumptionData: any;
    private _contactService: ContactsService;
    private startDate: any;
	public started: any;
    private _errorHelperService: any;
    private _helpersService: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter, _logger, _startConfig) {
        this._startConfig = _startConfig;
        this._eventEmitter = _eventEmitter;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = _logger;

        this._fileServerService = null;
        this._conversations = null;

        this.fileDescriptors = [];
        this.fileDescriptorsByDate = [];
        this.fileDescriptorsByName = [];
        this.fileDescriptorsBySize = [];
        this.receivedFileDescriptors = [];
        this.receivedFileDescriptorsByName = [];
        this.receivedFileDescriptorsByDate = [];
        this.receivedFileDescriptorsBySize = [];
        this.consumptionData = {};
        this.ready = false;
    }

    start(_options, _core : Core) { // , __xmpp : XMPPService, _s2s : S2SService, __rest : RESTService, __fileServerService, __conversations
        let that = this;

        return new Promise((resolve, reject) => {
            try {

                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._fileServerService = _core.fileServer;
                that._conversations = _core.conversations;
                that.startDate = Date.now();
                that.started = false;
                that.fileDescriptors = [];
                that.fileDescriptorsByDate = [];
                that.fileDescriptorsByName = [];
                that.fileDescriptorsBySize = [];
                that.receivedFileDescriptors = [];
                that.receivedFileDescriptorsByName = [];
                that.receivedFileDescriptorsByDate = [];
                that.receivedFileDescriptorsBySize = [];
                that.consumptionData = {};
                this.ready = true;

                resolve();

            } catch (err) {
                reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            if (that.started) {
                that.started = false;
            }
            this.ready = false;
            resolve();
        });
    }

    init() {
        let that = this;

        return new Promise((resolve, reject)=> {
            // No blocking service
            that.retrieveFileDescriptorsListPerOwner()
                .then(() => {
                    return that.retrieveReceivedFiles(that._rest.userId /*_contactService.userContact.dbId*/);
                })
                .then(() => {
                    that.orderDocuments();
                    return that.retrieveUserConsumption();
                })
                .then(() => {
                    that.started = true;
                    let startDuration = Math.round(Date.now() - that.startDate);

                    that._logger.log("debug", LOG_ID + "(init) === STARTED (" + startDuration + " ms) ===");
                    resolve();
                })
                .catch((error) => {
                    that._logger.log("debug", LOG_ID + "(init) === STARTING === failure -- " + error.message);
                    reject(error);
                });
        });
    }



    /**
     * @private
     * @since 1.47.1
     * @method
     * @instance
     * @description
     *    Allow to add a file to an existing Peer 2 Peer or Bubble conversation
     *    Return a promise
     * @return {Message} Return the message sent
     */
    _addFileToConversation(conversation, file, data) {
        let that = this;

        return new Promise(function(resolve, reject) {
            return new Promise(function(_resolve) {

                // Allow to pass a file path (for test purpose)
                if ( typeof (file) === "string") {
                    try {
                        let fileObj = new fileapi.File({

                                //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                                "path": file,//"c:\\temp\\IMG_20131005_173918.jpg",   // path of file to read
                                //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read

                                //            buffer: Node.Buffer,          // use this Buffer instead of reading file
                                //            stream: Node.ReadStream,      // use this ReadStream instead of reading file
                                //            name: "SomeAwesomeFile.txt",  // optional when using `path`
                                // must be supplied when using `Node.Buffer` or `Node.ReadStream`
                                //            type: "text/plain",           // generated based on the extension of `name` or `path`

                                "jsdom": true,                  // be DoM-like and immediately get `size` and `lastModifiedDate`
                                // [default: false]
                                "async": false                  // use `fs.stat` instead of `fs.statSync` for getting
                                // the `jsdom` info
                                // [default: false]
                                //   lastModifiedDate: fileStat.mtime.toISOString()
                                //   size: fileStat.size || Buffer.length
                            }
                        );

                        that._logger.log("internal", LOG_ID + "(_addFileToConversation) file path : ", file, " give fileObj :", fileObj);

                        _resolve(fileObj);
                    } catch (err) {
                        that._logger.log("error", LOG_ID + "(_addFileToConversation) Catch Error !!! Error.");
                        that._logger.log("internalerror", LOG_ID + "(_addFileToConversation) Catch Error !!! Error : ", err);
                        reject(err);
                    }
                } else {
                    _resolve(file);
                }
            }).then(function(_file :any ) {

                if (_file.size > 100000000) {
                    let errorMessage = "The file is to large (limited to 100MB)";
                    that._logger.log("error", LOG_ID + "(_addFileToConversation) Error." );
                    that._logger.log("internalerror", LOG_ID + "(_addFileToConversation) Error : ", errorMessage);
                    reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));

                    /* reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "The file is to large (limited to 100MB)"
                    }); // */
                } else {
                    if (!data || data.length === 0) {
                        data = file.name;
                    }

                    that._conversations.sendFSMessage(conversation, _file, data).then(function(message) {
                        resolve(message);
                    });
                }
            });
        });
    }

    /**************** API ***************/

    /**
     * @public
     * @since 1.47.1
     * @method uploadFileToConversation
     * @instance
     * @param {Conversation} conversation   The conversation where the message will be added
     * @param {{size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
     * @param {String} strMessage   An optional message to add with the file
     * @description
     *    Allow to add a file to an existing conversation (ie: conversation with a contact)
     *    Return the promise
     * @return {Message} Return the message sent
     */
    uploadFileToConversation(conversation, file, strMessage) {
        let that = this;

        return new Promise(function(resolve, reject) {
            if (!conversation) {
                let errorMessage = "Parameter 'conversation' is missing or null";
                that._logger.log("error", LOG_ID + "(uploadFileToConversation) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is missing or null"
                }); // */
            } else if (!file) {
                let errorMessage = "Parameter 'file' is missing or null";
                that._logger.log("error", LOG_ID + "(uploadFileToConversation) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'file' is missing or null"
                }); // */
            } else if (conversation.type !== Conversation.Type.ONE_TO_ONE) {
                let errorMessage = "Parameter 'conversation' is not a one-to-one conversation";
                that._logger.log("error", LOG_ID + "(uploadFileToConversation) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /* reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is not a one-to-one conversation"
                }); // */
            } else {
                that._logger.log("internal", LOG_ID + "[uploadFileToConversation ] ::  Try to add a file ", file, " to the conversation ", conversation.id);
                that._addFileToConversation(conversation, file, strMessage).then(function(msg) {
                    that._logger.log("info", LOG_ID + "[uploadFileToConversation ] ::  file added");
                    resolve(msg);
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "[uploadFileToConversation ] ::  error when Try to add a file to the conversation ", conversation.id, ". Error. ");
                    that._logger.log("internalerror", LOG_ID + "[uploadFileToConversation ] ::  error when Try to add a file ", file, " to the conversation ", conversation.id, " : ", err);
                    reject(err);
                });
            }
        });
    };

    /**
     * @public
     * @since 1.47.1
     * @method uploadFileToBubble
     * @instance
     * @param {Bubble} bubble   The bubble where the message will be added
     * @param {File} file The file to add
     * @param {String} strMessage   An optional message to add with the file
     * @description
     *    Allow to add a file to an existing Bubble conversation
     *    Return a promise
     * @return {Message} Return the message sent
     */
    uploadFileToBubble(bubble, file, strMessage) {
        let that = this;

        return new Promise(async function(resolve, reject) {

            if (!bubble) {
                let errorMessage = "Parameter 'bubble' is missing or null";
                that._logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /* reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'bubble' is missing or null"
                }); // */
            } else if (!file) {
                let errorMessage = "Parameter 'file' is missing or null";
                that._logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'file' is missing or null"
                }); // */
            } else {
                let conversation = await that._conversations.getConversationByBubbleId(bubble.id); // getConversationByRoomDbId(bubble.dbId);
                that._logger.log("internal", LOG_ID + "(uploadFileToBubble) ::  conversation : ", conversation, " by the bubble id ", bubble.id);
                that._logger.log("internal", LOG_ID + "(uploadFileToBubble) ::  conversation.type : ", conversation.type, " vs Conversation.Type.ROOM ", Conversation.Type.ROOM);

                if (!conversation) {
                    let errorMessage = "Parameter 'bubble' don't have a conversation";
                    that._logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                    reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                    /*reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "Parameter 'bubble' don't have a conversation"
                    }); // */
                } else if (conversation.type !== Conversation.Type.ROOM) {
                    let errorMessage = "Parameter 'conversation' is not a bubble conversation";
                    that._logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                    reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                    /* reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "Parameter 'conversation' is not a bubble conversation"
                    }); // */
                } else {
                    that._logger.log("internal", LOG_ID + "(uploadFileToBubble) ::  Try to add a file " + file + " to the bubble " + bubble.id);
                    that._addFileToConversation(conversation, file, strMessage).then(function(msg) {
                        that._logger.log("info", LOG_ID + "(uploadFileToBubble) ::  file added");
                        resolve(msg);
                    }).catch(function(err) {
                        reject(err);
                    });
                }
            }
        });
    };

    /**
     * @public
     * @since 1.67.0
     * @method uploadFileToStorage
     * @param {String|File} file An {size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
     * @instance
     * @description
     *   Send a file in user storage
     */
    uploadFileToStorage( file) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("info", LOG_ID + "sendFSMessage");

            // Allow to pass a file path (for test purpose)
            if ( typeof (file) === "string") {
                try {
                    let fileObj = new fileapi.File({

                            //            path: "c:\\temp\\15777240.jpg",   // path of file to read
                            "path": file,//"c:\\temp\\IMG_20131005_173918.jpg",   // path of file to read
                            //path: "c:\\temp\\Rainbow_log_test.log",   // path of file to read

                            //            buffer: Node.Buffer,          // use this Buffer instead of reading file
                            //            stream: Node.ReadStream,      // use this ReadStream instead of reading file
                            //            name: "SomeAwesomeFile.txt",  // optional when using `path`
                            // must be supplied when using `Node.Buffer` or `Node.ReadStream`
                            //            type: "text/plain",           // generated based on the extension of `name` or `path`

                            "jsdom": true,                  // be DoM-like and immediately get `size` and `lastModifiedDate`
                            // [default: false]
                            "async": false                  // use `fs.stat` instead of `fs.statSync` for getting
                            // the `jsdom` info
                            // [default: false]
                            //   lastModifiedDate: fileStat.mtime.toISOString()
                            //   size: fileStat.size || Buffer.length
                        }
                    );

                    that._logger.log("internal", LOG_ID + "(uploadFileToStorage) file path : ", file, " give fileObj :", fileObj);

                    file = fileObj;
                } catch (err) {
                    that._logger.log("error", LOG_ID + "(uploadFileToStorage) Catch Error !!! Error.");
                    that._logger.log("internalerror", LOG_ID + "(uploadFileToStorage) Catch Error !!! Error : ", err);
                    return reject(err);
                }
            }

            // Add message in messages array
            let fileExtension = file.name.split(".").pop();
            let fileMimeType = file.type;
            let viewers = [];
            let currentFileDescriptor;


            that.createFileDescriptor(file.name, fileExtension, file.size, viewers).then(async function (fileDescriptor: any) {
                currentFileDescriptor = fileDescriptor;
                fileDescriptor.fileToSend = file;
                if (fileDescriptor.isImage()) {
                    // let URLObj = $window.URL || $window.webkitURL;
                    // fileDescriptor.previewBlob = URLObj.createObjectURL(file);
                    await resizeImage(file.path, 512, 512).then(function (resizedImage) {
                        that._logger.log("debug", LOG_ID + "(uploadFileToStorage) resizedImage : ", resizedImage);
                        file.preview = getBinaryData(resizedImage);
                    });

                    if (file.preview) {
                        fileDescriptor.previewBlob = file.preview;
                    }
                }

                // Upload file
                fileDescriptor.state = "uploading";

                return that._fileServerService.uploadAFileByChunk(fileDescriptor, file.path )
                    .then(function successCallback(fileDesc) {
                            that._logger.log("debug", LOG_ID + "uploadFileToStorage uploadAFileByChunk success");
                            return Promise.resolve(fileDesc);
                        },
                        function errorCallback(error) {
                            that._logger.log("error", LOG_ID + "uploadFileToStorage uploadAFileByChunk error.");
                            that._logger.log("internalerror", LOG_ID + "uploadFileToStorage uploadAFileByChunk error : ", error);

                            //do we need to delete the file descriptor from the server if error ??
                            that.deleteFileDescriptor(currentFileDescriptor.id);

                            // .then(function() {
                            // currentFileDescriptor.state = "uploadError";
                            currentFileDescriptor.state = "uploadError";

                            //message.receiptStatus = Message.ReceiptStatus.ERROR;
                            //message.fileErrorMsg = msgKey;
                            //that.updateMessage(message);

                            return Promise.reject(error);
                        });
            })
                .then(function successCallback(fileDescriptorResult) {
                        fileDescriptorResult.state = "uploaded";
                        fileDescriptorResult.chunkPerformed = 0;
                        fileDescriptorResult.chunkTotalNumber = 0;
                        resolve(fileDescriptorResult);
                    },
                    function errorCallback(error) {
                        that._logger.log("error", LOG_ID + "uploadFileToStorage createFileDescriptor error.");
                        that._logger.log("internalerror", LOG_ID + "uploadFileToStorage createFileDescriptor error : ", error);
                        return reject(error);
                    });


            //};


            /*
            todo: VBR What is this pendingMessages list coming from WebSDK ? Is it necessary for node SDK ?
            this.pendingMessages[message.id] = {
                conversation: conversation,
                message: message
            };
            // */
        });
    }
    /**
     * @public
     * @since 1.47.1
     * @method downloadFile
     * @instance
     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
     * @description
     *    Allow to download a file from the server)
     *    Return a promise
     * @return {} Object with : buffer Binary data of the file type,  Mime type, fileSize: fileSize, Size of the file , fileName: fileName The name of the file  Return the file received
     */
    downloadFile(fileDescriptor) {
    let that = this;
        return new Promise(function(resolve, reject) {


            if (!fileDescriptor) {
                let errorMessage = "Parameter 'fileDescriptor' is missing or null";
                that._logger.log("error", LOG_ID + "(downloadFile) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'fileDescriptor' is missing or null"
                }); // */
            } else {

                that._logger.log("internal", LOG_ID + "[getFile    ] ::  Try to get a file " + fileDescriptor.filename);

                let urlObj = url.parse(fileDescriptor.url);

                let fileToDownload = {
                    "url": urlObj.pathname || "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id,
                    "mime": fileDescriptor.mime || fileDescriptor.typeMime,
                    "filesize": fileDescriptor.filesize || fileDescriptor.size,
                    "filename": fileDescriptor.filename || fileDescriptor.fileName
                };

                that._fileServerService.getBlobFromUrlWithOptimization(fileToDownload.url, fileToDownload.mime, fileToDownload.filesize, fileToDownload.filename, undefined).then(function(blob) {
                    that._logger.log("debug", LOG_ID + "[getFile    ] ::  file downloaded");
                    resolve(blob);
                }).catch(function(err) {
                    reject(err);
                });
            }
        });
    };

    /**
     * @public
     * @since 1.47.1
     * @method getUserQuotaConsumption
     * @instance
     * @description
     *    Get the current file storage quota and consumption for the connected user
     *    Return a promise
     * @return {Object} Return an object containing the user quota and consumption
     */
    /*getUserQuotaConsumption() {
        let that = this;
        return that.retrieveUserConsumption();
    }*/


    /**
     * @public
     * @since 1.47.1
     * @method removeFile
     * @instance
     * @param {FileDescriptor} fileDescriptor   The description of the file to remove (short file descriptor)
     * @description
     *    Remove an uploaded file
     *    Return a promise
     * @return {Object} Return a SDK OK Object or a SDK error object depending the result
     */
    removeFile(fileDescriptor) {
        let that = this;

        return new Promise(function(resolve, reject) {

            if (!fileDescriptor) {
                let errorMessage = "Parameter 'fileDescriptor' is missing or null";
                that._logger.log("error", LOG_ID + "(removeFile) " + errorMessage);
                return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'fileDescriptor' is missing or null"
                }); // */
            }
            if(!fileDescriptor.id && !fileDescriptor.url) {
                let errorMessage = "Parameter 'fileDescriptor' is missing or null";
                that._logger.log("error", LOG_ID + "(removeFile) " + errorMessage);
                return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'fileDescriptor' don't contain information to remove the file"
                }); // */
            }
            else {

                that._logger.log("internal", LOG_ID + "[removeFile ] ::  Try to remove a file " + fileDescriptor.fileName);

                let fileDescriptorId = fileDescriptor.id;

                if (!fileDescriptorId) {
                    let parts = fileDescriptor.url.split("/");
                    fileDescriptorId = parts.pop() || parts.pop();
                }

                that.deleteFileDescriptor(fileDescriptorId).then(function() {
                    that._logger.log("debug", LOG_ID + "[removeFile    ] ::  file removed");
                    resolve(ErrorManager.getErrorManager().OK);
                }).catch(function(err) {
                    return reject(err);
                });
            }
        });
    }

    /**********************************************************/
    /**  Basic accessors to FileStorage's properties   **/
    /**********************************************************/
    getFileDescriptorById(id) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(getFileDescriptorById) FileDescriptorId : ", id, ", from : ", that.fileDescriptors);

        for (let fileDescriptor of that.fileDescriptors) {
            if (fileDescriptor.id === id) {
                return fileDescriptor;
            }
        }
        for (let fileDescriptor of that.receivedFileDescriptors) {
            if (fileDescriptor.id === id) {
                return fileDescriptor;
            }
        }
        return null;
    }

    /**
     * @public
     * @since 1.47.1
     * @method getFileDescriptorFromId
     * @instance
     * @param {String} id   The file id
     * @description
     *    Get the file descriptor the user own by it's id
     * @return {FileDescriptor} Return a file descriptors found or null if no file descriptor has been found
     */
    getFileDescriptorFromId(id) {
        return this.getFileDescriptorById(id);
    }

    /**
     * @public
     * @since 1.47.1
     * @method getFilesReceivedInConversation
     * @instance
     * @param {Conversation} conversation   The conversation where to get the files
     * @description
     *    Get the list of all files received in a conversation with a contact
     *    Return a promise
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesReceivedInConversation(conversation) {
        let that = this;

        return new Promise(function(resolve, reject) {
            if (!conversation) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg = "Parameter 'conversation' is missing or null";
                return reject(error);
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is missing or null"
                }); // */
            } else if (conversation.type !== Conversation.Type.ONE_TO_ONE) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg = "Parameter 'conversation' is not a one-to-one conversation";
                return reject(error);
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is not a one-to-one conversation"
                }); // */
            } else {
                that._logger.log("debug", LOG_ID + "[getFilesRcv] ::  get files received in conversation " + conversation.id + "...");
                that.retrieveFilesReceivedFromPeer(/* _contactService.userContact.dbId */ that._rest.userId, conversation.contact.id).then(function(files: any) {
                    that._logger.log("debug", LOG_ID + "[getFilesRcv] ::  shared " + files.length);
                    resolve(files);
                }).catch(function(err) {
                    return reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @since 1.47.1
     * @method getFilesReceivedInBubble
     * @instance
     * @param {Bubble} bubble   The bubble where to get the files
     * @description
     *    Get the list of all files received in a bubble
     *    Return a promise
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesReceivedInBubble(bubble) {
        let that = this;

        return new Promise(function(resolve, reject) {

            if (!bubble) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg = "Parameter 'bubble' is missing or null";
                return reject(error);
                /* reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'bubble' is missing or null"
                }); */
            } else {

                that._logger.log("debug", LOG_ID + "[getFilesRcv] ::  get files received in bubble " + bubble.id + "...");

                that.retrieveReceivedFilesForRoom(bubble.id).then(function(files: any) {
                    if (files) {
                        that._logger.log("debug", LOG_ID + "[getFilesRcv] :: " + files.length + " files received in bubble " + bubble.id);
                    } else {
                        that._logger.log("debug", LOG_ID + "[getFilesRcv] :: No files received in bubble " + bubble.id);
                    }
                    resolve(files);
                }).catch(function(err) {
                    return reject(err);
                });
            }
        });
    }

    /**
     * @private
     * @description
     * Method returns a file descriptor with full contact object in viewers'list by requesting server
     *
     * @param {string} fileId [required] Identifier of file descriptor
     * @return {Promise<FileDescriptor>} file descriptor
     *
     */
    getCompleteFileDescriptorById(id) {
        let that = this;
        return new Promise((resolve, reject) => {
            let fileDescriptor = null;

            if (that.fileDescriptors.some((fd) => {
                    if (fd.id === id) {
                        fileDescriptor = fd;
                        return true;
                    }
                    return false;
                })) {
                let promiseArray = [];
                //for each viewer ID, associate the contact
                for (let viewer of fileDescriptor.viewers) {
                    if (viewer.type === "user") {
                        promiseArray.push(
                            that._contactService.getContactById(viewer.viewerId, true).then((contact) => {
                                viewer.contact = contact;
                                return (viewer);
                            })
                            .catch((error) => {
                                that._logger.log("error", LOG_ID + "(getCompleteFileDescriptorById) Error.");
                                that._logger.log("internalerror", LOG_ID + "(getCompleteFileDescriptorById) Error : ", error);
                                return reject(error);
                            })
                        );
                    } else {
                        // TODO ?
                    }
                }

                Promise.all(promiseArray)
                    .then(() => {
                        resolve(fileDescriptor);
                    })
                    .catch((error) => {
                        that._logger.log("error", LOG_ID + "(getCompleteFileDescriptorById) error.");
                        that._logger.log("internalerror", LOG_ID + "(getCompleteFileDescriptorById) error : " + error);
                        return reject(error);
                    });

            } else {
                return reject();
            }
        });
    }

    /**
     *
     * @private
     *
     * @return {FileDescriptor[]}
     */
    getDocuments() {
        return this.fileDescriptors;
    }

    /**
     *
     * @private
     *
     * @return {FileDescriptor}
     */
    getReceivedDocuments() {
        return this.receivedFileDescriptors;
    }

    /**
     *
     * @private
     *
     * @param {boolean} received
     * @return {FileDescriptor[]}
     */
    getDocumentsByName(received) {
        return received ? this.receivedFileDescriptorsByName : this.fileDescriptorsByName;
    }

    /**
     *
     * @private
     *
     * @param {boolean} received
     * @return {FileDescriptor[]}
     */
    getDocumentsByDate(received) {
        return received ? this.receivedFileDescriptorsByDate : this.fileDescriptorsByDate;
    }

    /**
     *
     * @private
     *
     * @param {boolean} received
     * @return {FileDescriptor[]}
     */
    getDocumentsBySize(received) {
        return received ? this.receivedFileDescriptorsBySize : this.fileDescriptorsBySize;
    }

    /**
     *
     * @private
     *
     * @param {string} dbId
     * @return {FileDescriptor[]}
     */
    getReceivedFilesFromContact(dbId) {
        let files = this.receivedFileDescriptorsByDate.filter((file) => {
            return (file.ownerId === dbId);
        });

        return files;
    }

    /**
     *
     * @private
     *
     * @param {string} dbId
     * @return {FileDescriptor[]}
     */
    getSentFilesToContact(dbId) {
        let files = this.fileDescriptorsByDate.filter((file) => {
            for (let i = 0; i < file.viewers.length; i++) {
                if (file.viewers[i].viewerId === dbId) {
                    return true;
                }
            }
            return false;
        });

        return files;
    }

    /**
     *
     * @public
     *
     * @param {string} bubbleId id of the bubble
     * @return {FileDescriptor[]}
     */
    getReceivedFilesForRoom(bubbleId) {
        let files = this.receivedFileDescriptorsByDate.filter((file) => {
            for (let i = 0; i < file.viewers.length; i++) {
                if (file.viewers[i].viewerId === bubbleId && file.ownerId !== this._contactService.userContact.dbId) {
                    return true;
                }
            }
            return false;
        });

        return files;
    }

    /**
     *
     * @private
     *
     * @return {Object}
     */
    getConsumptionData() {
        return this.consumptionData;
    }

    /**********************************************************/
    /**  Methods requesting server                           **/
    /**********************************************************/

    /**
     * @private
     * @description
     * Method requests server to create a file descriptor this will be saved to local file descriptor list (i.e. this.fileDescriptors)
     *
     * @param {string} name [required] name of file for which file descriptor has to be created
     * @param {string} extension [required] extension of file
     * @param {number} size [required] size of  file
     * @param {FileViewer[]} viewers [required] list of viewers having access to the file (a viewer could be either be a user or a room)
     * @return {Promise<FileDescriptor>} file descriptor created by server or error
     *
     */
    createFileDescriptor(name, extension, size, viewers) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.createFileDescriptor(name, extension, size, viewers)
                .then((response ) => {
                    const fileDescriptor = that.createFileDescriptorFromData(response);
                    that._logger.log("debug", LOG_ID + "(createFileDescriptor) -- " + fileDescriptor.id + " -- success");

                    //in case something went wrong with the creation
                    if (fileDescriptor) {
                        that.fileDescriptors.push(fileDescriptor);
                    }

                    that.orderDocuments();
                    resolve(fileDescriptor);
                })
                .catch((errorResponse) => {
                    //const error = that._errorHelperService.handleError(errorResponse, "createFileDescriptor");
                    that._logger.log("error", LOG_ID + "(createFileDescriptor) Error." );
                    that._logger.log("internalerror", LOG_ID + "(createFileDescriptor) Error : " + errorResponse);
                    return reject(errorResponse);
                });
        });
    }


    /**
     *
     * @private
     *
     * @param {*} data
     * @return {FileDescriptor}
     */
    createFileDescriptorFromData(data) : any{
        let that = this;
        if (data) {
            let viewers = [];
            if (data.viewers) {
                for (let viewerData of data.viewers) {
                    viewers.push(fileViewerElementFactory(viewerData.viewerId, viewerData.type, viewerData.contact, that._contactService));
                }
            }
            let url = data.url;
            if (!url) {
                url = that._rest.http.serverURL + "/api/rainbow/fileserver/v1.0/files/" + data.id;
            }

            let state = "unknown";
            if (data.isUploaded) {
                state = "uploaded";
            } else {
                state = "not_uploaded";
            }

            let fd =  fileDescriptorFactory()(data.id, url, data.ownerId, data.fileName, data.extension, data.typeMIME,
                data.size, data.registrationDate, data.uploadedDate, data.dateToSort, viewers, state, data.thumbnail, data.orientation);

            return fd;
        }
        return;
    }

    /**
     * @private
     * @description
     *
     * Method request deletion of a file descriptor on the server and removes it from local storage
     * @param {string} id [required] file descriptor id to be destroyed
     * @return {Promise<FileDescriptor[]>} list of remaining file descriptors
     */
    deleteFileDescriptor(id) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.deleteFileDescriptor(id)
                .then(() => {
                    that._logger.log("info", LOG_ID + "(deleteFileDescriptor)  -- success");
                    that.deleteFileDescriptorFromCache(id, false);

                    resolve(null);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "deleteFileDescriptor");
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @private
     *
     * @description
     * Method request deletion of all files on the server and removes them from local storage
     * @return {Promise<{}>} ???
     */
    deleteAllFileDescriptor() {
        let that = this;
        return new Promise((resolve, reject) => {
            let promiseArray = [];
            that.fileDescriptors.forEach((fileDescriptor) => {
                if (fileDescriptor.state !== "deleted") {
                    promiseArray.push(
                        that.deleteFileDescriptor(fileDescriptor.id)
                        .then((response) => {
                            return response;
                        })
                    );
                }
            });

            Promise.all(promiseArray)
                .then(() => {
                    resolve();
                })
                .catch((errorResponse) => {
                    ///let error = that._errorHelperService.handleError(errorResponse, "deleteAllFileDescriptor");
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @public
     *
     * @description
     * Method retrieve full list of files belonging to user making the request
     *
     * @return {Promise<FileDescriptor[]>}
     *
     */
    retrieveFileDescriptorsListPerOwner() {
        let that = this;
        that.fileDescriptors = [];
        return new Promise((resolve, reject) => {
            //that._rest.receivedFileDescriptors("full", 1000)
            that._rest.retrieveFileDescriptors("full", 1000, undefined, undefined)
                .then((response : any) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve();
                    }

                    // Check if we have received all fileDescriptors
                    let limit = response.limit;
                    let total = response.total;
                    let getAllFileDescriptorPromise = null;

                    // Create the getAllFileDescriptor promise
                    if (total <= limit) {
                        getAllFileDescriptorPromise = Promise.resolve([]);
                    } else {
                        let offset = limit;
                        let requestCount = total / limit;
                        let requestArray = [];
                        for (let index = 1; index < requestCount; index++) {
                            requestArray.push(that.retrieveFileDescriptorsListPerOwnerwithOffset(offset, limit));
                            offset += limit;
                        }
                        getAllFileDescriptorPromise = Promise.all(requestArray);
                    }

                    // Call the getAllFileDescritor promise
                    getAllFileDescriptorPromise
                        .then((responsesData) => {
                            // Contact all response in a single array
                            responsesData.forEach((responseData) => {
                                fileDescriptorsData = fileDescriptorsData.concat(responseData);
                            });

                            if (fileDescriptorsData) {
                                // Create file descriptors
                                for (let fileDescriptorData of fileDescriptorsData) {
                                    let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorData);
                                    that.fileDescriptors.push(fileDescriptor);
                                }
                                that._logger.log("info", LOG_ID + "(retrieveFileDescriptorsListPerOwner) -- success");
                            } else {
                                that._logger.log("warn", LOG_ID + "(retrieveFileDescriptorsListPerOwner) -- warning fileDescriptorsData retrieved from server is empty");
                            }
                            resolve(that.fileDescriptors);
                        });
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "retrieveFileDescriptorsListPerOwner");
                    that._logger.log("error", LOG_ID + "(retrieveFileDescriptorsListPerOwner) Error." );
                    that._logger.log("internalerror", LOG_ID + "(retrieveFileDescriptorsListPerOwner) Error : " + errorResponse);
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @private
     *
     * @description
     * Method retrieve a list of [limit] files belonging to user making the request begining with offset
     *
     * @return {Promise<FileDescriptor[]>}
     *
     */
    retrieveFileDescriptorsListPerOwnerwithOffset(offset, limit) {
        return this._rest.retrieveFileDescriptors("full", limit, offset, undefined);
        //return this._rest.receivedFileDescriptors( "full", limit, offset);
    }

    /**
     * @private
     *
     * @description
     * Method request for the list of files received by a user from a given peer (i.e. inside a given conversation)
     *
     * @param {string} userId [required] dbId of user making the request
     * @param {string} peerId [required] dbId of peer user in the conversation
     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
     *
     */
    retrieveFilesReceivedFromPeer(userId, peerId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveFilesReceivedFromPeer(userId, peerId)
                .then((response : any) => {
                    let receivedFileDescriptors = [];
                    let fileDescriptorsData = response.data;
                    if (fileDescriptorsData) {
                        for (let fileDescriptorData of fileDescriptorsData) {
                            let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorData);
                            receivedFileDescriptors.push(fileDescriptor);
                        }
                    }
                    that._logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) -- success");
                    resolve(receivedFileDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "retrieveFilesReceivedFromPeer");
                    that._logger.log("error", LOG_ID + "(retrieveFilesReceivedFromPeer) Error." );
                    that._logger.log("internalerror", LOG_ID + "(retrieveFilesReceivedFromPeer) Error : ", errorResponse);
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @public
     *
     * @description
     * Method request for the list of files sent to a given peer (i.e. inside a given conversation)
     *
     * @param {string} peerId [required] id of peer user in the conversation
     * @return {Promise<FileDescriptor[]>} : list of sent files descriptors
     *
     */
    retrieveSentFiles(peerId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveFileDescriptors("full", null, null, peerId)
                .then((response : any) => {
                    let sentFilesDescriptors = [];
                    let fileDescriptorsData = response.data;
                    if (fileDescriptorsData) {
                        for (let fileDescriptorData of fileDescriptorsData) {
                            let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorData);
                            sentFilesDescriptors.push(fileDescriptor);
                        }
                    }
                    that._logger.log("info", LOG_ID + "(retrieveSentFiles) success");
                    resolve(sentFilesDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "retrieveSentFiles");
                    that._logger.log("error", LOG_ID + "(retrieveSentFiles Error" );
                    that._logger.log("internalerror", LOG_ID + "(retrieveSentFiles Error : " + errorResponse);
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @public
     *
     * @description
     * Method request for the list of files received in a room
     *
     * @param {string} bubbleId [required] Id of the room
     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
     *
     */
    retrieveReceivedFilesForRoom(bubbleId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveReceivedFilesForRoomOrViewer(bubbleId)
                .then((response : any) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve();
                    }

                    let result = [];
                    for (let fileDescriptorDataItem of fileDescriptorsData) {
                        fileDescriptorDataItem.viewers = [];
                        let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorDataItem);
                        if (fileDescriptor.ownerId !== that._rest.userId) {
                            result.push(fileDescriptor);
                        }
                    }
                    that._logger.log("info", LOG_ID + "(retrieveReceivedFilesForRoom) - retrieveReceivedFilesForRoomOrViewer success");
                    result = that.orderDocumentsForRoom(result);
                    resolve(result);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "retrieveReceivedFilesForRoom");
                    that._logger.log("error", LOG_ID + "(retrieveReceivedFilesForRoom) - retrieveReceivedFilesForRoomOrViewer Error." );
                    that._logger.log("internalerror", LOG_ID + "(retrieveReceivedFilesForRoom) - retrieveReceivedFilesForRoomOrViewer Error : " + errorResponse);
                    return reject(errorResponse);
                });
            });
        }

    /**
     *
     * @public
     *
     * @description
     * Method request for the list of files received by a user
     *
     * @param {string} viewerId [required] Id of the viewer, could be either an userId or a bubbleId
     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
     *
     */
    retrieveReceivedFiles(viewerId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveReceivedFilesForRoomOrViewer(viewerId)
                .then((response : any) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve();
                        return;
                    }

                    for (let fileDescriptorItem of fileDescriptorsData) {
                        // fileDescriptorItem.viewers = [];
                        let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorItem);

                        // filter files I sent but this are still returned by server because it is part of a room
                        if (fileDescriptor.ownerId !== that._rest.userId) {
                            let oldFileDesc = that.getFileDescriptorById(fileDescriptor.id);
                            if (oldFileDesc) {
                                fileDescriptor.previewBlob = oldFileDesc.previewBlob;
                            }
                            that.receivedFileDescriptors.push(fileDescriptor);
                        }
                    }
                    that.orderReceivedDocuments();
                    that._logger.log("info", LOG_ID + "(retrieveReceivedFiles) success");
                    resolve(that.receivedFileDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "retrieveReceivedFiles");
                    that._logger.log("error", LOG_ID + "(retrieveReceivedFiles) Error." );
                    that._logger.log("internalerror", LOG_ID + "(retrieveReceivedFiles) Error : " + errorResponse);
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @public
     * @since 1.47.1
     * @method getFilesSentInConversation
     * @instance
     * @param {Conversation} conversation   The conversation where to get the files
     * @description
     *    Get the list of all files sent in a conversation with a contact
     *    Return a promise
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesSentInConversation(conversation) {
        let that = this;
        return new Promise(function(resolve, reject) {
            if (!conversation) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg = "Parameter 'conversation' is missing or null";
                return reject(error);

                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is missing or null"
                }); */
            } else if (conversation.type !== Conversation.Type.ONE_TO_ONE) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg = "Parameter 'conversation' is not a one-to-one conversation";
                return reject(error);

                /*
                reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is not a one-to-one conversation"
                }); */
            } else {
                that._logger.log("info", LOG_ID + "[getFilesSnd] ::  get files sent in conversation " + conversation.id + "...");
                that.retrieveSentFiles(conversation.contact.id).then(function(files : any) {
                    that._logger.log("info", LOG_ID + "[getFilesSnd] ::  shared " + files.length);
                    resolve(files);
                }).catch(function(err) {
                    return reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @since 1.47.1
     * @method getFilesSentInBubble
     * @instance
     * @param {Bubble} bubble   The bubble where to get the files
     * @description
     *    Get the list of all files sent in a bubble
     *    Return a promise
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesSentInBubble(bubble) {
        let that = this;
        return new Promise(function(resolve, reject) {

            if (!bubble) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg = "Parameter 'bubble' is missing or null";
                return reject(error);
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'bubble' is missing or null"
                }); */

            } else {

                that._logger.log("info", LOG_ID + "[getFilesRcv] ::  get files received in bubble " + bubble.dbId + "...");

                that.retrieveSentFiles(bubble.id).then(function(files : any) {
                    that._logger.log("info", LOG_ID + "([getFilesSnd] ::  shared " + files.length);
                    resolve(files);
                }).catch(function(err) {
                    return reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @since 1.47.1
     * @method
     * @instance
     * @description
     *    Get the current file storage quota and consumption for the connected user
     *    Return a promise
     * @return {Object} Return an object containing the user quota and consumption
     */
    getUserQuotaConsumption() {
        let that = this;

        return new Promise(function(resolve, __reject) {
            that.retrieveUserConsumption().then(function(consumptionData) {
                resolve(consumptionData);
            });
        });
    }

    /**
     * @public
     * @since 1.47.1
     * @method getAllFilesSent
     * @instance
     * @description
     *    Get the list of files (represented using an array of File Descriptor objects) created and owned by the connected which is the list of file sent to all of his conversations and bubbles.
     * @return {FileDescriptor[]} Return an array containing the list of FileDescriptor objects representing the files sent
     */
    getAllFilesSent() {
        let that = this;
        return that.getDocuments();
    }

    /**
     * @public
     * @since 1.47.1
     * @method getAllFilesReceived
     * @instance
     * @description
     *    Get the list of files (represented using an array of File Descriptor objects) received by the connected user from all of his conversations and bubbles.
     * @return {FileDescriptor[]} Return an array containing a list of FileDescriptor objects representing the files received
     */
     getAllFilesReceived() {
         let that = this;
        return that.getReceivedDocuments();
    }


    /**
     * @private
     *
     * @description
     * Method retrieve the data usage of a given user
     *
     * @return {Promise<{}>} : object data with the following properties:
     *                  - feature {string} : The feature key belonging to the user's profile
     *                  - maxValue {number} : The quota associated to this offer [octet]
     *                  - currentValue {number} : The user's current consumption [octet]
     *                  - unit {string} : The unit of this counters
     */
    retrieveUserConsumption() {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveUserConsumption()
                .then((response : any) => {
                    that.consumptionData = response.data;
                    that._logger.log("info", LOG_ID + "(retrieveUserConsumption) success");
                    resolve(that.consumptionData);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "retrieveUserConsumption");
                    that._logger.log("error", LOG_ID + "(retrieveUserConsumption) error." );
                    that._logger.log("internalerror", LOG_ID + "(retrieveUserConsumption) error : " + errorResponse);
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @private
     *
     * @description
     * Method deletes a viewer from the list of viewer of a given file
     *
     * @param {string} viewerId [required] Identifier of viewer to be removed. Could be either a user or a room
     * @param {string} fileId [required] Identifier of the fileDescriptor from which the viewer will be removed
     * @return {Promise<{}>}
     *
     */
    deleteFileViewer(viewerId, fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.deleteFileViewer(viewerId, fileId).then(
                (response : any) => {
                    that._logger.log("info", LOG_ID + "(deleteFileViewer) " + response.statusText);
                    // delete viewer from viewer list
                    let fd = that.getFileDescriptorById(fileId);
                    if (fd) {
                        let index = -1;
                        for (let i = 0; i < fd.viewers.length; i++) {
                            if (fd.viewers[i].viewerId === viewerId) {
                                index = i;
                                break;
                            }
                        }
                        if (index !== -1) {
                            fd.viewers.splice(index, 1);
                        }
                    }
                    resolve();
                },
                (errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "deleteFileViewer");
                    that._logger.log("error", LOG_ID + "(deleteFileViewer) error." );
                    that._logger.log("intenralerror", LOG_ID + "(deleteFileViewer) error : " + errorResponse);
                    return reject(errorResponse);
                });
        });

    }

    /**
     *
     * @private
     *
     * @description
     * Method adds a viewer to a given file on server if it is not already one
     *
     * @param {string} fileId [required] Identifier of file
     * @param {string} viewerId [required] Identifier of viewer to be added
     * @param {string} viewerType [required] type of viewer to be added (user or room)
     * @return {Promise<FileDescriptor>} file descriptor with newly added viewer
     *
     */
    addFileViewer(fileId, viewerId, viewerType) {
        let that = this;
        let fileDescriptor = that.getFileDescriptorById(fileId);
        if (fileDescriptor && fileDescriptor.isAlreadyFileViewer(viewerId)) {
            return Promise.resolve(fileDescriptor);
        }

        return new Promise((resolve, reject) => {
            that._rest.addFileViewer(fileId, viewerId, viewerType).then(
                (response : any) => {
                    that._logger.log("info", LOG_ID + "(addFileViewer) success");
                    let fd = that.getFileDescriptorById(fileId);
                    if (fd) {
                        /* let viewerAdded = that.fileViewerFactory([{
                            viewerId: response.data.viewerId,
                            type: response.data.type
                        }])[0]; // */
                        let viewerAdded = fileViewerElementFactory(response.data.viewerId, response.data.type, undefined,  undefined);
                        if (viewerAdded.type === "user") {
                            that._contactService.getContactById(viewerId, true)
                                .then((contact) => {
                                    viewerAdded.contact = contact;
                                    fd.viewers.push(viewerAdded);
                                    resolve(fd);
                                })
                                .catch((error) => {
                                    that._logger.log("error", LOG_ID + "(addFileViewer) error.");
                                    that._logger.log("internalerror", LOG_ID + "(addFileViewer) error : ", error);
                                    return reject(error);
                                });
                        } else {
                            fd.viewers.push(viewerAdded);
                            resolve(fd);
                        }
                    }
                },
                (errorResponse) => {
                    const error = that._errorHelperService.handleError(errorResponse, "addFileViewer");
                    that._logger.log("error", LOG_ID + "(addFileViewer) error." );
                    that._logger.log("internalerror", LOG_ID + "(addFileViewer) error : ", errorResponse);
                    return reject(error);
                });
        });
    }

    /**
     * @private
     *
     * @description
     * Method retrieve a specific file descriptor from server
     *
     * @param {string} fileId [required] Identifier of file descriptor to retrieve
     * @return {Promise<FileDescriptor>} file descriptor retrieved
     *
     */
    retrieveOneFileDescriptor(fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveOneFileDescriptor(fileId )
                .then((response) => {
                    let fileDescriptor = that.createFileDescriptorFromData(response);
                    that._logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) " + fileId + " -- success");
                    resolve(fileDescriptor);
                })
                .catch((errorResponse) => {
                    //let error = that._errorHelperService.handleError(errorResponse, "getOneFileDescriptor");
                    that._logger.log("error", LOG_ID + "(retrieveOneFileDescriptor) " + errorResponse);
                    that._logger.log("internalerror", LOG_ID + "(retrieveOneFileDescriptor) Error : ", errorResponse);
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @private
     *
     * @description
     * Method retrieve a specific file descriptor from server and stores it in local fileDescriptors (replace existing and add if new)
     *
     * @param {string} fileId [required] Identifier of file descriptor to retrieve
     * @return {Promise<FileDescriptor>} file descriptor retrieved or null if none found
     *
     */
    retrieveAndStoreOneFileDescriptor(fileId, forceRetrieve) {
        let that = this;
        let fileDescriptor = that.getFileDescriptorById(fileId);
        if (fileDescriptor && !forceRetrieve) {
            that._logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- return existing fileDescriptor " + fileId);
            return Promise.resolve(fileDescriptor);
        }

        return that.retrieveOneFileDescriptor(fileId)
            .then((retrievedFileDescriptor : any) => {

                if (fileDescriptor && fileDescriptor.isImage()) {
                    retrievedFileDescriptor.previewBlob = fileDescriptor.previewBlob;
                }

                function findIndex (array, predicate) {
                    return array.findIndex(predicate);
                };

                // Remove old file descriptor with same id if there's one
                let oldFileDescriptorIndex = findIndex(that.fileDescriptors, (_fileDescriptor) => {
                    return _fileDescriptor.id === retrievedFileDescriptor.id;
                });
                if (oldFileDescriptorIndex > -1) {
                    that.fileDescriptors.splice(oldFileDescriptorIndex, 1);
                }
                let oldReceivedFileDescriptorIndex = findIndex(that.receivedFileDescriptors, (_fileDescriptor) => {
                    return _fileDescriptor.id === retrievedFileDescriptor.id;
                });
                if (oldReceivedFileDescriptorIndex > -1) {
                    that.receivedFileDescriptors.splice(oldReceivedFileDescriptorIndex, 1);
                }

                if (retrievedFileDescriptor.ownerId === that._rest.account.id) { // The file is mine
                    that.fileDescriptors.push(retrievedFileDescriptor);
                    that._logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- fileDescriptor " + retrievedFileDescriptor.id + " -- now stored in my files");
                } else { // The file is not mine
                    //that.retrievedFileDescriptors = [];
                    that.receivedFileDescriptors.push(retrievedFileDescriptor);
                    that._logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- fileDescriptor " + retrievedFileDescriptor.id + " -- now stored in received files");
                }

                return Promise.resolve(retrievedFileDescriptor);
            })
            .catch((errorResponse) => {
                that._logger.log("warn", LOG_ID + "(retrieveAndStoreOneFileDescriptor) ErrorManager on getting FileDescriptor Error. ");
                that._logger.log("internalerror", LOG_ID + "(retrieveAndStoreOneFileDescriptor) ErrorManager on getting FileDescriptor : ", errorResponse);
                if (errorResponse.status >= 400 && errorResponse.status < 500) {
                    if (fileDescriptor) {
                        if (errorResponse.status === 404) {
                            that.deleteFileDescriptorFromCache(fileDescriptor.id, true);
                        }
                    }
                }

                return Promise.reject(errorResponse);
            });
    }

    /**********************************************************/
    /**  Utilities                                           **/
    /**********************************************************/

    deleteFileDescriptorFromCache(id, forceDelete) {
        let that = this;
        that._logger.log("debug", LOG_ID + "(deleteFileDescriptorFromCache) " + id);

        for (let index = 0; index < that.receivedFileDescriptors.length; index++) {
            if (that.receivedFileDescriptors[index].id === id) {
                that.receivedFileDescriptors.splice(index, 1);
                break;
            }
        }

        for (let index = 0; index < that.fileDescriptors.length; index++) {
            if (that.fileDescriptors[index].id === id) {
                if (forceDelete) {
                    that.fileDescriptors.splice(index, 1);
                } else {
                    that.fileDescriptors[index].state = "deleted";
                }
                break;
            }
        }
    }

    orderDocuments() {
        let that = this;
        that._logger.log("debug", LOG_ID + "(orderDocuments) " + that.fileDescriptors.length);
        that.replaceOrderedByFilter(that.fileDescriptorsByDate, that.fileDescriptors, that.getDate, false, that.sortByDate);
        that.replaceOrderedByFilter(that.fileDescriptorsByName, that.fileDescriptors, that.getName, false, that.sortByName);
        that.replaceOrderedByFilter(that.fileDescriptorsBySize, that.fileDescriptors, that.getSize, false, that.sortBySize);
        that.orderReceivedDocuments();
    }

    orderReceivedDocuments() {
        let that = this;
        that._logger.log("debug", LOG_ID + "(orderReceivedDocuments) " + that.receivedFileDescriptors.length);
        that.replaceOrderedByFilter(that.receivedFileDescriptorsByName, that.receivedFileDescriptors, that.getName, false, that.sortByName);
        that.replaceOrderedByFilter(that.receivedFileDescriptorsByDate, that.receivedFileDescriptors, that.getDate, false, that.sortByDate);
        that.replaceOrderedByFilter(that.receivedFileDescriptorsBySize, that.receivedFileDescriptors, that.getSize, false, that.sortBySize);
    }

    orderDocumentsForRoom(documents) {
        let that = this;
        return orderByFilter(documents, that.getDate, false, that.sortByDate);
    }

    replaceOrderedByFilter(resultArray, originalArray, filterFct, flag, sortFct) {
        let that = this;
        //that._logger.log("debug", LOG_ID + "(replaceOrderedByFilter) ");

        resultArray.length = 0;
        let orderedArrayResult = orderByFilter(originalArray, filterFct, flag, sortFct);
        for (let fileResult of orderedArrayResult) {
            if (fileResult.state !== "deleted") {
                resultArray.push(fileResult);
            }
        }
    }

    getName(file) {
        let result = {
            name: "",
            date: ""
        };
        if (file.fileName) {
            result.name = file.fileName;
        }
        let date;
        if (file.uploadedDate) {
            date = new Date(file.uploadedDate);
        } else if (file.registrationDate) {
            date = new Date(file.registrationDate);
        } else {
            date = new Date(file.dateToSort);
        }
        result.date = date.getTime();
        return result;
    }

    getDate(file) {
        let date;
        if (file.uploadedDate) {
            date = new Date(file.uploadedDate);
        } else if (file.registrationDate) {
            date = new Date(file.registrationDate);
        } else {
            date = new Date(file.dateToSort);
        }
        return date.getTime();
    }

    getSize(file) {
        let result = {
            name: "",
            size: ""
        };
        if (file.name) {
            result.name = file.fileName;
        }
        result.size = file.size;
        return result;
    }

    sortByName(fileA, fileB) {
        let res = -1;
        if (fileA.name && fileB.name) {
            res = fileA.name.localeCompare(fileB.name);
            if (res === 0) {
                res = fileB.date - fileA.date;
            }
        }
        return res;
    }

    sortBySize(fileA, fileB) {
        let res = -1;
        if (fileA.size && fileB.size) {
            res = fileB.size - fileA.size;
        }
        return res;
    }

    sortByDate(fileA, fileB) {
        let res = 1;
        if (fileA && fileB) {
            res = fileB - fileA;
        }
        return res;
    }

    /**
     * @private
     *
     * @description
     * Method extract fileId part of URL
     *
     * @param {string} url
     * @return {string}
     *
     */
    extractFileIdFromUrl(url) {
        let parts = url.split("/");
        let fileDescriptorId = parts.pop() || parts.pop();
        return fileDescriptorId;
    }
}

module.exports.FileStorageService = FileStorage;
export {FileStorage as FileStorageService};
