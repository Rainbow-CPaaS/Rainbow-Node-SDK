"use strict";
import {createWriteStream} from "fs";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import * as fileapi from "file-api";
import {Observable} from 'rxjs';
import {FileViewerElementFactory as fileViewerElementFactory} from "../common/models/FileViewer";
import {FileDescriptor, fileDescriptorFactory} from "../common/models/FileDescriptor";
import {Conversation} from "../common/models/Conversation";
import {ErrorManager} from "../common/ErrorManager";
import * as url from 'url';
import {getBinaryData, logEntryExit, orderByFilter, resizeImage} from "../common/Utils";
import {EventEmitter} from "events";
import {isStarted} from "../common/Utils";
import {Logger} from "../common/Logger";
import {FileServerService} from "./FileServerService";
import {ConversationsService} from "./ConversationsService";
import {ContactsService} from "./ContactsService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {setInterval} from "timers";
import {isMainThread} from "worker_threads";
import {GenericService} from "./GenericService";

import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
// if ( ! mime.lookup) mime.lookup = mime.getType;

function FileUpdated(input) {
    var self = this;

    function updateStat(stat) {
        self.stat = stat;
        self.lastModifiedDate = self.stat.mtime;
        self.size = self.stat.size;
    }
    
    if (input == undefined) return; 

    if ('string' === typeof input) {
        self.path = input;
    } else {
        Object.keys(input).forEach(function (k) {
            self[k] = input[k];
        });
    }

    self.name = self.name || path.basename(self.path||'');
    if (!self.name) {
        throw new Error("No name");
    }
    if ( ! mime.lookup)  {
        self.type = self.type || mime.getType(self.name);
    } else {
        self.type = self.type || mime.lookup(self.name);
    }

    if (!self.path) {
        if (self.buffer) {
            self.size = self.buffer.length;
        } else if (!self.stream) {
            throw new Error('No input, nor stream, nor buffer.');
        }
        return;
    }

    if (!self.jsdom) {
        return;
    }

    if (!self.async) {
        updateStat(fs.statSync(self.path));
    } else {
        fs.stat(self.path, function (err, stat) {
            updateStat(stat);
        });
    }
}

const LOG_ID = "FileStorage/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name FileStorage
 * @version SDKVERSION
 * @public
 * @description
 *   This service shares files with a single user (one-to-one conversation) or with several persons (bubble conversation). <br><br>
 *   The main methods and events proposed in that service allow to: 
 *      
 *  - Upload a file in a one-to-one conversation or bubble conversation, 
 *  - Download a file from a conversation or bubble, 
 *  - To be notified when a file has been successfully uploaded when there is an error when uploading or downloading a file in a conversation or a bubble.
 *  - Get the list of files send or received in a one-to-one conversation 
 *  - Get the list of files send or received in a bubble conversation 
 *  - Get the connected user quota and consumption 
 *      
 */
class FileStorage extends GenericService{
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
    private _errorHelperService: any;
    private _helpersService: any;

    static getClassName(){ return 'FileStorage'; }
    getClassName(){ return FileStorage.getClassName(); }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
    start_up:boolean,
    optional:boolean
}) {
        super(_logger, LOG_ID);
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
                that._contactService = _core.contacts;
                that.fileDescriptors = [];
                that.fileDescriptorsByDate = [];
                that.fileDescriptorsByName = [];
                that.fileDescriptorsBySize = [];
                that.receivedFileDescriptors = [];
                that.receivedFileDescriptorsByName = [];
                that.receivedFileDescriptorsByDate = [];
                that.receivedFileDescriptorsBySize = [];
                that.consumptionData = {};
                that.setStarted ();
                resolve(undefined);
            } catch (err) {
                reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.setStopped ();
            resolve(undefined);
        });
    }

    init(useRestAtStartup : boolean) {
        let that = this;

        return new Promise((resolve, reject)=> {
            if (useRestAtStartup ) {
                // No blocking service
                let fileName : boolean = undefined; 
                let fileNameStr : string = undefined; 
                let ownerId : string = undefined; 
                let extension : string = undefined; 
                let typeMIME : string = undefined;
                let purpose : string = undefined;
                let isUploaded : boolean = undefined;
                let viewerId : string = undefined;
                let path : string = undefined;
                let limit : number = 1000;
                let offset : number = undefined;
                let roomName : string = undefined;
                let overall : boolean = undefined;
                let sortField : string = undefined;
                let sortOrder : number = undefined; 
                let format : string = "full";
                that.retrieveFileDescriptorsListPerOwner(fileNameStr , extension, typeMIME, purpose , isUploaded, viewerId, path, limit, offset, sortField, sortOrder, format)
                        .then(() => {
                            return that.retrieveReceivedFiles(that._rest.userId /*_contactService.userContact.dbId*/, ownerId , fileName , extension , typeMIME , isUploaded , purpose , roomName , overall , format , limit , offset , sortField , sortOrder );
                        })
                        .then(() => {
                            that.orderDocuments();
                            return that.retrieveUserConsumption();
                        })
                        .then(() => {
                            that.setInitialized();
                          //  resolve(undefined);
                        })
                        .catch((error) => {
                            that._logger.log("error", LOG_ID + "(init) === STARTING === failure -- " + error.message);
                            that.setInitialized();
                            //resolve(undefined);
                            //reject(error);
                        });
                //resolve(undefined);
            } else {
                that.setInitialized();
                //resolve (undefined);
            }
            resolve(undefined);
        });
    }



    /**************** API ***************/
    //region Files TRANSFER
    /**
     * @public
     * @since 1.47.1
     * @method uploadFileToConversation
     * @instance
     * @async
     * @category Files TRANSFER
     * @param {Conversation} conversation   The conversation where the message will be added
     * @param {{size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
     * @param {String} strMessage   An optional message to add with the file
     * @description
     *    Allow to add a file to an existing conversation (ie: conversation with a contact) <br>
     *    Return the promise <br>
     * @return {Message} Return the message sent <br>
     */
    async uploadFileToConversation(conversation, file, strMessage) {
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
     * @async
     * @category Files TRANSFER
     * @param {Bubble} bubble   The bubble where the message will be added
     * @param {File} file The file to add
     * @param {String} strMessage   An optional message to add with the file
     * @description
     *    Allow to add a file to an existing Bubble conversation <br>
     *    Return a promise <br>
     * @return {Message} Return the message sent <br>
     */
    async uploadFileToBubble(bubble, file, strMessage) {
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

                if (!conversation) {
                    let errorMessage = "Parameter 'bubble' don't have a conversation";
                    that._logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage + ", try to open it.");

                    conversation = await that._conversations.openConversationForBubble(bubble);

                }

                if (!conversation) {
                        let errorMessage = "Parameter 'bubble' don't have a conversation";
                        that._logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);

                        reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                    /*reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "Parameter 'bubble' don't have a conversation"
                    }); // */
                } else if (conversation.type !== Conversation.Type.ROOM) {
                    that._logger.log("internal", LOG_ID + "(uploadFileToBubble) ::  conversation.type : ", conversation.type, " vs Conversation.Type.ROOM ", Conversation.Type.ROOM);
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
     * @category Files TRANSFER
     * @async
     * @param {String|File} file An {size, type, name, preview, path}} object reprensenting The file to add. Properties are : the Size of the file in octets, the mimetype, the name, a thumbnail preview if it is an image, the path to the file to share.
     * @param {boolean} voicemessage When set to True, that allows to identify voice memos in a chat or multi-users chat conversation.
     * @param {number} duration The voice message in seconds. This field must be a positive number and is only taken into account when voicemessage is true.
     * @param {boolean} encoding AAC is the choosen format to encode a voice message. This is the native format for mobile clients, nor web client (OPUS, OGG..). This field must be set to true to order a transcodind and is only taken into account when voicemessage is true.
     * @param {boolean} ccarelogs When set to True, that allows to identify a log file uploaded by the user
     * @param {boolean} ccareclientlogs When set to True, that allows to identify a log file uploaded automatically by the client application
     * @instance
     * @description
     *   Send a file in user storage <br>
     */
    async uploadFileToStorage( file, voicemessage : boolean = undefined, duration : number = undefined, encoding : boolean = undefined, ccarelogs : boolean = undefined, ccareclientlogs : boolean = undefined) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("info", LOG_ID + "sendFSMessage");

            // Allow to pass a file path (for test purpose)
            if ( typeof (file) === "string") {
                try {

                    let fileObj = new FileUpdated({
                    //let fileObj = new fileapi.File({

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


            that.createFileDescriptor(file.name, fileExtension, file.size, viewers, voicemessage, duration, encoding, ccarelogs, ccareclientlogs).then(async function (fileDescriptor: any) {
                currentFileDescriptor = fileDescriptor;
                fileDescriptor.fileToSend = file;
                if (fileDescriptor.isImage()) {
                    // let URLObj = $window.URL || $window.webkitURL;
                    // fileDescriptor.previewBlob = URLObj.createObjectURL(file);
                    await resizeImage(file.path, 512, 512).then(function (resizedImage) {
                        // that._logger.log("debug", LOG_ID + "(uploadFileToStorage) resizedImage : ", resizedImage);
                        file.preview = getBinaryData(resizedImage);
                    });

                    if (file.preview) {
                        fileDescriptor.previewBlob = file.preview;
                    }
                }

                // Upload file
                fileDescriptor.state = "uploading";

                return that._fileServerService.uploadAFileByChunk(fileDescriptor, file.path ).then(function successCallback(fileDesc) {
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
     * @category Files TRANSFER
     * @async
     * @instance
     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
     * @param {string} path If provided then the retrieved file is stored in it. If not provided then
     * @description
     *    Allow to download a file from the server) <br>
     *    Return a promise <br>
     * @return {} Object with : Array of buffer Binary data of the file type,  Mime type, fileSize: fileSize, Size of the file , fileName: fileName The name of the file  Return the file received
     */
    async downloadFile(fileDescriptor, path: string = null) {
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

                that._logger.log("internal", LOG_ID + "(downloadFile) Try to get a file " + fileDescriptor.filename + "/" + fileDescriptor.fileName );

                let urlObj = url.parse(fileDescriptor.url);

                let fileToDownload = {
                    "url": urlObj.pathname || "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id,
                    "mime": fileDescriptor.mime || fileDescriptor.typeMime || fileDescriptor.typeMIME,
                    "filesize": fileDescriptor.filesize || fileDescriptor.size,
                    "filename": fileDescriptor.filename || fileDescriptor.fileName
                };

                that._fileServerService.getBlobFromUrlWithOptimization(fileToDownload.url, fileToDownload.mime, fileToDownload.filesize, fileToDownload.filename, undefined).then(function(blob : ArrayBuffer) {
                    that._logger.log("internal", LOG_ID + "(downloadFile) File downloaded : ", fileToDownload);
                    that._logger.log("debug", LOG_ID + "(downloadFile) File downloaded");
                    resolve(blob);
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(downloadFile) !!! Catch Error while downloaded");
                    that._logger.log("internalerror", LOG_ID + "(downloadFile) !!! Catch Error while downloaded : ", fileToDownload, ", error : ", err);
                    reject(err);
                });
            }
        });
    };

    /**
     * @public
     * @since 1.79.0
     * @method downloadFileInPath
     * @instance
     * @category Files TRANSFER
     * @async
     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
     * @param {string} path If provided then the retrieved file is stored in it. If not provided then
     * @async
     * @description
     *    Allow to download a file from the server and store it in provided path. <br>
     *    Return a promise <br>
     * @return {Observable<any>} Return an Observable object to see the completion of the download/save. <br>
     * It returns a percentage of downloaded data Values are between 0 and 100 (include). <br>
     * The last one value is the description and content of the file : <br>
     *  { <br>
     *      buffer : blobArray, // the buffer with the content of the file. <br>
     *      type: mime, // The mime type of the encoded file <br>
     *      fileSize: fileSize, // The size in octects of the file <br>
     *      fileName: fileName // The file saved. <br>
     *  } <br>
     *  Warning !!! : <br>
     *  take care to not log this last data which can be very important for big files. You can test if the value is < 101. <br>
     */
    async downloadFileInPath(fileDescriptor, path: string): Promise<Observable<any>> {
        let that = this;

        if (!fileDescriptor) {
            let errorMessage = "Parameter 'fileDescriptor' is missing or null";
            that._logger.log("error", LOG_ID + "(downloadFileInPath) " + errorMessage);
            // return(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
            return (Promise.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage)));
        } else {

            that._logger.log("internal", LOG_ID + "(downloadFileInPath) Try to get a file name : " + fileDescriptor.filename + " or " + fileDescriptor.fileName);

            let urlObj = url.parse(fileDescriptor.url);

            let fileToDownload = {
                "url": urlObj.pathname || "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id,
                "mime": fileDescriptor.mime || fileDescriptor.typeMime || fileDescriptor.typeMIME,
                "filesize": fileDescriptor.filesize || fileDescriptor.size,
                "filename": fileDescriptor.filename || fileDescriptor.fileName
            };

            let getBlobObsrv$ = await that._fileServerService.getBlobFromUrlWithOptimizationObserver(fileToDownload.url, fileToDownload.mime, fileToDownload.filesize, fileToDownload.filename, undefined);
            let previousValue :any = 0;
            let currentValue :any = 0;
            let completed = false;
            getBlobObsrv$.subscribe({
                next(value) {
                    if (value < 101)
                    {
                        currentValue = value;
                        that._logger.log("internal", LOG_ID + "(downloadFileInPath) % : ", value);
                    } else {
                        that._logger.log("internal", LOG_ID + "(downloadFileInPath) value !< 101 : File downloaded : ", currentValue?currentValue.fileName:"");
                        that._logger.log("debug", LOG_ID + "(downloadFileInPath) File downloaded");
                        currentValue = value;
                    }
                 },
                complete() {
                    that._logger.log("internal", LOG_ID + "C'est fini!");
                    that._logger.log("internal", LOG_ID + "(downloadFileInPath) File downloaded : ", currentValue?currentValue.fileName:"");
                    that._logger.log("debug", LOG_ID + "(downloadFileInPath) File downloaded");
                    if (currentValue && path) {
                        try {
                            let blobArray = currentValue.buffer;

                            let writeStream = createWriteStream(path + currentValue.fileName);

                            writeStream.on('error', () => {
                                that._logger.log("debug", LOG_ID + "(downloadFileInPath) - [RecordsService] WriteStream error event");
                            });
                            writeStream.on('drain', () => {
                                that._logger.log("debug", LOG_ID + "(downloadFileInPath) - [RecordsService] WriteStream drain event");
                            });

                            for (let index = 0; index < blobArray.length; index++) {
                                if (blobArray[index]) {
                                    that._logger.log("debug", LOG_ID + "(downloadFileInPath) >writeAvailableChunksInDisk : Blob " + index + " available");
                                    //fd.chunkWrittenInDisk = index;
                                    writeStream.write(new Buffer(blobArray[index]));
                                    blobArray[index] = null;
                                } else {
                                    that._logger.log("debug", LOG_ID + "(downloadFileInPath) >writeAvailableChunksInDisk : Blob " + index + " NOT available");
                                    break;
                                }
                            }
                            that._logger.log("debug", LOG_ID + `(downloadFileInPath) - The file ${currentValue.fileName} was saved!`);
                        } catch (e) {
                            that._logger.log("debug", LOG_ID + `(downloadFileInPath) - Error saving file ${currentValue.fileName} from Rainbow`, e);
                        }
                    } else {
                        that._logger.log("info", LOG_ID + `(downloadFileInPath) - Do not write the downloaded file ${currentValue.fileName}`);
                    }
                    completed = true;
                },
                error() {
                    completed=true;
                }
            });

            let myObservable$ = Observable.create(subject => {
                let intervalId = setInterval(() => {
                    if (previousValue != currentValue) {
                        that._logger.log("debug", "(downloadFileInPath) >myObservable next.");
                        previousValue = currentValue;
                        subject.next(Math.ceil(currentValue));
                    }//subject.complete();}, 1000);
                    if (completed) {
                        that._logger.log("debug", "(downloadFileInPath) >myObservable complete.");
                        subject.complete();
                        clearInterval(intervalId);
                    }
                },50);
            });
            //that._logger.log("internal", LOG_ID + "(downloadFile) File downloaded : ", fileToDownload);
            //that._logger.log("debug", LOG_ID + "(downloadFile) File downloaded");
            return (Promise.resolve(myObservable$));
        }
    };

    /**
     * @public
     * @since 1.47.1
     * @method removeFile
     * @instance
     * @async
     * @category Files TRANSFER
     * @param {FileDescriptor} fileDescriptor   The description of the file to remove (short file descriptor)
     * @description
     *    Remove an uploaded file <br>
     *    Return a promise <br>
     * @return {Object} Return a SDK OK Object or a SDK error object depending the result
     */
    async removeFile(fileDescriptor) {
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

    //endregion Files TRANSFER 

    //region Files FILE MANAGEMENT / PROPERTIES 

    /**
     * @private
     * @since 1.47.1
     * @method
     * @instance
     * @async
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     *    Allow to add a file to an existing Peer 2 Peer or Bubble conversation <br>
     *    Return a promise <br>
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
                    }).catch((err)=> {
                        return reject(err);
                    });
                }
            });
        });
    }
    
    /**********************************************************/
    /**  Basic accessors to FileStorage's properties   **/
    /**********************************************************/
    
    getFileDescriptorById(id) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(getFileDescriptorById) FileDescriptorId : ", id, ", that.fileDescriptors.length : ", that.fileDescriptors ? that.fileDescriptors.length : 0);

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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {String} id   The file id
     * @description
     *    Get the file descriptor the user own by it's id <br>
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
     * @async
     * @param {Conversation} conversation   The conversation where to get the files
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     *    Get the list of all files received in a conversation with a contact <br>
     *    Return a promise <br>
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    async getFilesReceivedInConversation(conversation) {
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
     * @async
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {Bubble} bubble   The bubble where to get the files
     * @description
     *    Get the list of all files received in a bubble <br>
     *    Return a promise <br>
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesReceivedInBubble(bubble, ownerId : string, fileName : boolean, extension : string, typeMIME : string, isUploaded : boolean, purpose : string, roomName : string, overall : boolean, format : string = "full", limit : number = 100, offset : number, sortField : string, sortOrder : number ) {
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

                that.retrieveReceivedFilesForRoom(bubble.id, ownerId , fileName , extension , typeMIME , isUploaded , purpose , roomName , overall , format , limit , offset , sortField , sortOrder).then(function(files: any) {
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
     * Method returns a file descriptor with full contact object in viewers'list by requesting server <br>
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @async
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @return {FileDescriptor[]}
     */
    getDocuments() {
        return this.fileDescriptors;
    }

    /**
     *
     * @private
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @return {FileDescriptor}
     */
    getReceivedDocuments() {
        return this.receivedFileDescriptors;
    }

    /**
     *
     * @private
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * @method getReceivedFilesForRoom
     * @public
     *
     * @instance
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {string} bubbleId id of the bubble
     * @description
     *    Method to get the list of received files descriptors.
     * @return {FileDescriptor[]}
     */
    getReceivedFilesForRoom(bubbleId) {
        let files = this.receivedFileDescriptorsByDate.filter((file) => {
            for (let i = 0; i < file.viewers.length; i++) {
                if (file.viewers[i].viewerId === bubbleId && file.ownerId !== this._contactService.userContact.id) {
                    return true;
                }
            }
            return false;
        });

        return files;
    }

    /**
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * Method requests server to create a file descriptor this will be saved to local file descriptor list (i.e. this.fileDescriptors) <br>
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {string} name [required] name of file for which file descriptor has to be created
     * @param {string} extension [required] extension of file
     * @param {number} size [required] size of  file
     * @param {FileViewer[]} viewers [required] list of viewers having access to the file (a viewer could be either be a user or a room)
     * @param {boolean} voicemessage When set to True, that allows to identify voice memos in a chat or multi-users chat conversation.
     * @param {number} duration The voice message in seconds. This field must be a positive number and is only taken into account when voicemessage is true.
     * @param {boolean} encoding AAC is the choosen format to encode a voice message. This is the native format for mobile clients, nor web client (OPUS, OGG..). This field must be set to true to order a transcodind and is only taken into account when voicemessage is true.
     * @param {boolean} ccarelogs When set to True, that allows to identify a log file uploaded by the user
     * @param {boolean} ccareclientlogs When set to True, that allows to identify a log file uploaded automatically by the client application
     * @return {Promise<FileDescriptor>} file descriptor created by server or error
     *
     */
    createFileDescriptor(name, extension, size, viewers, voicemessage : boolean = undefined, duration : number = undefined, encoding : boolean = undefined, ccarelogs : boolean = undefined, ccareclientlogs : boolean = undefined) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.createFileDescriptor(name, extension, size, viewers, voicemessage , duration , encoding , ccarelogs , ccareclientlogs )
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {*} data
     * @return {FileDescriptor}
     */
    createFileDescriptorFromData(data) : any{
        let that = this;
        if (data) {
            let viewers = [];
            if (data.viewers) {
                for (let viewerData of data.viewers) {
                    viewers.push(fileViewerElementFactory(viewerData.viewerId, viewerData.type, viewerData.contact, that._contactService.getContactById));
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
                data.size, data.registrationDate, data.uploadedDate, data.dateToSort, viewers, state, data.thumbnail, data.orientation, data.md5sum, data.applicationId );

            return fd;
        }
        return;
    }

    /**
     * @private
     * @description
     *
     * Method request deletion of a file descriptor on the server and removes it from local storage <br>
     * @category Files FILE MANAGEMENT / PROPERTIES
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * Method request deletion of all files on the server and removes them from local storage <br>
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
                    resolve(undefined);
                })
                .catch((errorResponse) => {
                    ///let error = that._errorHelperService.handleError(errorResponse, "deleteAllFileDescriptor");
                    return reject(errorResponse);
                });
        });
    }

    /**
     * @public
     * @method retrieveFileDescriptorsListPerOwner
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @async
     * @instance
     * @param {string} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion.
     * typeMIME='image/jpeg' allows to get all jpeg file
     * typeMime='image' allows to get all image files whatever the extension
     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files
     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). purpose=conference_record allows to get all records of conference
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} viewerId Among all files shared by the user, allow to specify a viewer.
     * @param {string} path For visual voice mail feature only (step1), allows to get file descriptors of each file under the given path.
     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 1000 Possibles values : 0-1000
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0
     * @param {string} sortField Sort items list based on the given field.
     * @param {string} sortOrder Specify order when sorting items list. Default value : 1 Possibles values : -1, 1
     * @param {string} format Allows to retrieve more or less file descriptors details in response.
     * small: _id, fileName, extension, isClean
     * medium: _id, fileName, extension, typeMIME, size, isUploaded,isClean, avReport, thumbnail, thumbnail500, original_w, original_h
     * full: all descriptors fields except storageURL
     * Default value : full Possibles values : "small", "medium", "full"
     * @description
     * Method retrieve full list of files belonging to user making the request <br>
     *
     * @return {Promise<FileDescriptor[]>}
     *
     */
    retrieveFileDescriptorsListPerOwner(fileName : string = undefined, extension : string = undefined, typeMIME : string = undefined, purpose : string = undefined, isUploaded : boolean = undefined, viewerId : string = undefined, path : string = undefined, limit : number = 1000, offset : number = 0, sortField : string = undefined, sortOrder : number = 1, format : string = "full") : Promise<[any]> {
        let that = this;
        that.fileDescriptors = [];
        return new Promise((resolve, reject) => {
            //that._rest.receivedFileDescriptors("full", 1000)
            that._rest.retrieveFileDescriptors( fileName, extension, typeMIME, purpose, isUploaded, viewerId, path, limit, offset, sortField, sortOrder, format)
            //that._rest.retrieveFileDescriptors("full", limit, offset, viewerId)
                .then((response : any) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve(undefined);
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
                            requestArray.push(that.retrieveFileDescriptorsListPerOwnerwithOffset( fileName, extension, typeMIME, purpose, isUploaded, viewerId, path, limit, offset, sortField, sortOrder, format)); //(offset, limit));
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * Method retrieve a list of [limit] files belonging to user making the request begining with offset <br>
     *
     * @return {Promise<FileDescriptor[]>}
     *
     */
    retrieveFileDescriptorsListPerOwnerwithOffset(fileName : string , extension : string, typeMIME : string, purpose : string, isUploaded : boolean, viewerId : string, path : string, limit : number = 1000, offset : number, sortField : string, sortOrder : number, format : string = "full") {
    //retrieveFileDescriptorsListPerOwnerwithOffset(offset, limit) {
        return this._rest.retrieveFileDescriptors( fileName, extension, typeMIME, purpose, isUploaded, viewerId, path, limit, offset, sortField, sortOrder, format);
        //return this._rest.retrieveFileDescriptors("full", limit, offset, undefined);
        //return this._rest.receivedFileDescriptors( "full", limit, offset);
    }

    /**
     * @private
     *
     * @description
     * Method request for the list of files received by a user from a given peer (i.e. inside a given conversation) <br>
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @async
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
     * @method retrieveSentFiles
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @instance
     * @description
     * Method request for the list of files sent to a given peer (i.e. inside a given conversation) <br>
     *
     * @param {string} peerId [required] id of peer user in the conversation
     * @param {string} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion.
     * typeMIME='image/jpeg' allows to get all jpeg file
     * typeMime='image' allows to get all image files whatever the extension
     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files
     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). purpose=conference_record allows to get all records of conference
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} path For visual voice mail feature only (step1), allows to get file descriptors of each file under the given path.
     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 1000 Possibles values : 0-1000
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0
     * @param {string} sortField Sort items list based on the given field.
     * @param {string} sortOrder Specify order when sorting items list. Default value : 1 Possibles values : -1, 1
     * @param {string} format Allows to retrieve more or less file descriptors details in response.
     * small: _id, fileName, extension, isClean
     * medium: _id, fileName, extension, typeMIME, size, isUploaded,isClean, avReport, thumbnail, thumbnail500, original_w, original_h
     * full: all descriptors fields except storageURL
     * Default value : full Possibles values : "small", "medium", "full"
     * @return {Promise<FileDescriptor[]>} : list of sent files descriptors
     *
     */
    retrieveSentFiles(peerId : string, fileName : string , extension : string, typeMIME : string, purpose : string, isUploaded : boolean, path : string, limit : number = 1000, offset : number = 0, sortField : string, sortOrder : number = 1, format : string = "full") {
        let that = this;
        return new Promise((resolve, reject) => {
            //that._rest.retrieveFileDescriptors("full", null, null, peerId)
            that._rest.retrieveFileDescriptors(fileName, extension, typeMIME, purpose, isUploaded, peerId, path, limit, offset, sortField, sortOrder, format)
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
     * @method retrieveReceivedFilesForRoom
     * @instance
     * @description
     * Method request for the list of files received in a room <br>
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {string} bubbleId [required] Id of the room
     * @param {string} ownerId Among all files shared with the user, allow to precify a provider.
     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion.
     * typeMIME='image/jpeg' allows to get all jpeg file
     * typeMime='image' allows to get all image files whatever the extension
     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files
     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). purpose=conference_record allows to get all records of conference
     * @param {string} roomName A word of the conference name. When purpose=conference_record is used, allow to reduce the list of results focusing of the recording name.
     * @param {boolean} overall When true, allow to get all files (my files and received files) in the same paginated list
     * @param {string} format Allows to retrieve viewers of each file when the format is full.
     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
     * Default value : full Possibles values : small, medium, full
     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 1000
     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1 Possibles values : -1, 1
     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
     *
     */
    retrieveReceivedFilesForRoom(bubbleId, ownerId : string, fileName : boolean, extension : string, typeMIME : string, isUploaded : boolean, purpose : string, roomName : string, overall : boolean, format : string = "full", limit : number = 1000, offset : number = 0, sortField : string = "fileName", sortOrder : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveReceivedFilesForRoomOrViewer(bubbleId, ownerId , fileName , extension , typeMIME , isUploaded , purpose , roomName , overall , format , limit , offset , sortField , sortOrder  )
                .then((response : any) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve(undefined);
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
     * @method retrieveReceivedFiles
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @instance
     * @async
     * @description
     * Method request for the list of files received by a user <br>
     *
     * @param {string} viewerId [required] Id of the viewer, could be either an userId or a bubbleId
     * @param {string} ownerId Among all files shared with the user, allow to precify a provider. Example a peerId in a face to face conversation.
     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. </br>
     * typeMIME='image/jpeg' allows to get all jpeg file </br>
     * typeMime='image' allows to get all image files whatever the extension </br>
     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files </br>
     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension </br>
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). </br> purpose=conference_record allows to get all records of conference
     * @param {string} roomName A word of the conference name. When purpose=conference_record is used, allow to reduce the list of results focusing of the recording name.
     * @param {boolean} overall When true, allow to get all files (my files and received files) in the same paginated list
     * @param {string} format Allows to retrieve viewers of each file when the format is full.
     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
     * Default value : full. Possibles values : small, medium, full
     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possibles values : -1, 1
     * @return {Promise<FileDescriptor[]>} : list of received files descriptors
     *
     */
    async retrieveReceivedFiles(viewerId : string, ownerId : string, fileName : boolean, extension : string, typeMIME : string, isUploaded : boolean, purpose : string, roomName : string, overall : boolean, format : string = "full", limit : number = 100, offset : number, sortField : string = "fileName", sortOrder : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId , fileName , extension , typeMIME , isUploaded , purpose , roomName , overall , format , limit , offset , sortField , sortOrder)
                .then((response : any) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve(undefined);
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @param {Conversation} conversation   The conversation where to get the files
     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. </br>
     * typeMIME='image/jpeg' allows to get all jpeg file </br>
     * typeMime='image' allows to get all image files whatever the extension </br>
     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files </br>
     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension </br>
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). </br> purpose=conference_record allows to get all records of conference
     * @param {string} format Allows to retrieve viewers of each file when the format is full.
     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
     * Default value : full. Possibles values : small, medium, full
     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possibles values : -1, 1
     * @description
     *    Get the list of all files sent in a conversation with a contact <br>
     *    Return a promise <br>
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesSentInConversation(conversation, fileName : string , extension : string, typeMIME : string, purpose : string, isUploaded : boolean, path : string, limit : number = 1000, offset : number, sortField : string, sortOrder : number, format : string = "full") {
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
                that.retrieveSentFiles(conversation.contact.id, fileName , extension , typeMIME , purpose , isUploaded , path , limit , offset , sortField , sortOrder , format ).then(function(files : any) {
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
     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. </br>
     * typeMIME='image/jpeg' allows to get all jpeg file </br>
     * typeMime='image' allows to get all image files whatever the extension </br>
     * typeMIME='image/jpeg'&typeMIME='image/png' allows to get all jpeg and png files </br>
     * typeMIME='image'&typeMIME='video' allows to get all image and video files whatever the extension </br>
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (conference_record for instance). </br> purpose=conference_record allows to get all records of conference
     * @param {string} path For visual voice mail feature only (step1), allows to get file descriptors of each file under the given path.
     * @param {string} format Allows to retrieve viewers of each file when the format is full.
     * small: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * medium: _id fileName extension typeMIME ownerId isUploaded uploadedDate size thumbnail thumbnail500 isClean tags
     * full: _id fileName extension typeMIME ownerId isUploaded uploadedDate size viewers thumbnail thumbnail500 isClean tags
     * Default value : full. Possibles values : small, medium, full
     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possibles values : -1, 1
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     *    Get the list of all files sent in a bubble <br>
     *    Return a promise <br>
     * @return {FileDescriptor[]} Return an array of file descriptors found or an empty array if no file descriptor has been found
     */
    getFilesSentInBubble(bubble, fileName : string , extension : string, typeMIME : string, purpose : string, isUploaded : boolean, path : string, limit : number = 1000, offset : number, sortField : string, sortOrder : number, format : string = "full") {
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

                that.retrieveSentFiles(bubble.id, fileName , extension , typeMIME , purpose , isUploaded , path , limit , offset , sortField , sortOrder , format ).then(function(files : any) {
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
     * @method getUserQuotaConsumption
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @instance
     * @description
     *    Get the current file storage quota and consumption for the connected user <br>
     *    Return a promise <br>
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     *    Get the list of files (represented using an array of File Descriptor objects) created and owned by the connected which is the list of file sent to all of his conversations and bubbles. <br>
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
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     *    Get the list of files (represented using an array of File Descriptor objects) received by the connected user from all of his conversations and bubbles. <br>
     * @return {FileDescriptor[]} Return an array containing a list of FileDescriptor objects representing the files received
     */
     getAllFilesReceived() {
         let that = this;
        return that.getReceivedDocuments();
    }


    /**
     * @private
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * Method retrieve the data usage of a given user <br>
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
     * Method deletes a viewer from the list of viewer of a given file <br>
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
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
                        let index : number = -1;
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
                    resolve(undefined);
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
     * @category Files FILE MANAGEMENT / PROPERTIES
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
                        let viewerAdded = fileViewerElementFactory(response.data.viewerId, response.data.type, undefined,  that._contactService.getContactById);
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
     * @public
     * @method retrieveOneFileDescriptor
     * @instance
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * Method retrieve a specific file descriptor from server <br>
     *
     * @param {string} fileId [required] Identifier of file descriptor to retrieve
     * @return {Promise<FileDescriptor>} file descriptor retrieved
     *
     */
    retrieveOneFileDescriptor(fileId) : Promise<any> {
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
     * Method retrieve a specific file descriptor from server and stores it in local fileDescriptors (replace existing and add if new) <br>
     *
     * @category Files FILE MANAGEMENT / PROPERTIES
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

    /**
     * @public
     * @method getFileDescriptorsByCompanyId
     * @instance
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * Get all file descriptors belonging to a given companyId.  <br>
     * The result is paginated.  <br>
     *     
     * @param {string} companyId Company unique identifier. If no value is provided then the companyId of the connected user is used. 
     * @param {boolean} fileName Allows to filter file descriptors by fileName criterion.
     * @param {string} extension Allows to filter file descriptors by extension criterion.
     * @param {string} typeMIME Allows to filter file descriptors by typeMIME criterion. <br>
     *  <br> 
     * - typeMIME=audio/wav allows to get all wav file <br>  
     * - typeMime=audio allows to get all audio files whatever the extension <br>  
     * - typeMIME=audio/wav&typeMIME=audio/mp3 allows to get all wav and mp3 files <br>  
     *  <br>
     * @param {string} purpose Allows to filter file descriptors by the utility of the file (rvcp_voice_promp, rvcp_record). <br>
     *  <br> 
     * - purpose=rvcp_voice_promp allows to get all voice prompt used by Rainbow Voice Communication Platform <br>  
     * - purpose=rvcp_record allows to get all records generated by Rainbow Voice Communication Platform <br>
     * - purpose=rvcp allows to get all Rainbow Voice Communication Platform files <br>
     *  <br>
     * @param {boolean} isUploaded Allows to filter file descriptors by isUploaded criterion.
     * @param {string} format Allows to retrieve viewers of each file when the format is full. <br>
     *   <br>
     * - small: _id, fileName, extension, isClean <br>  
     * - medium: _id, fileName, extension, typeMIME, size, isUploaded,isClean, avReport, thumbnail, thumbnail500, original_w, original_h <br>  
     * - full: all descriptors fields except storageURL   <br>
     *  <br>
     * Default value : small <br>
     * Possible values : small, medium, full <br>
     *  <br>
     * @param {number} limit Allow to specify the number of fileDescriptors to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first fileDescriptor to retrieve (first fileDescriptor if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort fileDescriptor list based on the given field. Default value : fileName
     * @param {number} sortOrder Specify order when sorting fileDescriptor list (1: arranged in alphabetical order, -1: reverse order). Default value : 1. Possible values : -1, 1
     * @return {Promise<any>} all file descriptors belonging to a given companyId. 
     * 
     */
    getFileDescriptorsByCompanyId (companyId: string = undefined, fileName : boolean = undefined, extension : string = undefined, typeMIME : string = undefined, purpose : string = undefined, isUploaded :boolean = undefined, format : string = "small", limit : number = 100, offset : number = 0, sortField : string = "fileName", sortOrder : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            companyId = companyId? companyId : that._rest.account.companyId;
            that._rest.getFileDescriptorsByCompanyId(companyId, fileName, extension, typeMIME, purpose, isUploaded, format, limit, offset, sortField, sortOrder  )
                    .then((response) => {                        
                        resolve(response);
                    })
                    .catch((errorResponse) => {
                        //let error = that._errorHelperService.handleError(errorResponse, "getOneFileDescriptor");
                        that._logger.log("error", LOG_ID + "(getFileDescriptorsByCompanyId) " + errorResponse);
                        that._logger.log("internalerror", LOG_ID + "(getFileDescriptorsByCompanyId) Error : ", errorResponse);
                        return reject(errorResponse);
                    });
        });
    }

    /**
     * @public
     * @method copyFileInPersonalCloudSpace
     * @instance
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * This API allows to keep a copy in my personal cloud space. Then:
     * - A new file descriptor is created.
     * - The viewer becomes owner. The file has not yet viewer.
     * - A copy of the file is put in the viewer's personal cloud space.
     * - A STANZA MESSAGE (type management) is sent to the owner of this new file. (tag 'file', action='update')
     * 
     * To copy the file you must:
     * 
     * - have enough space to store the file.(errorDetailsCode: 403630)
     * - not be the owner of the file.(errorDetailsCode: 403631)
     * - be an allowed viewer. The file is shared via a conversation or via a room.(errorDetailsCode: 403632)
     * - copy a file uploaded.(errorDetailsCode: 403630)
     * - have a personal cloud space in the same data center than the owner of the file.
     * 
     * @param {string} fileId [required] Identifier of file descriptor to modify
     * @return {Promise<FileDescriptor>} File descriptor Object
     *
     */ 
    copyFileInPersonalCloudSpace (fileId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.copyFileInPersonalCloudSpace(fileId).then((response) => {
                let fileDescriptor = that.createFileDescriptorFromData(response);
                that._logger.log("info", LOG_ID + "(copyFileInPersonalCloudSpace) " + fileId + " -- success");
                resolve(fileDescriptor);
            }).catch((errorResponse) => {
                //let error = that._errorHelperService.handleError(errorResponse, "getOneFileDescriptor");
                that._logger.log("error", LOG_ID + "(copyFileInPersonalCloudSpace) " + errorResponse);
                that._logger.log("internalerror", LOG_ID + "(copyFileInPersonalCloudSpace) Error : ", errorResponse);
                return reject(errorResponse);
            });
        });
    }
    
    /**
     * @public
     * @method fileOwnershipChange
     * @instance
     * @category Files FILE MANAGEMENT / PROPERTIES
     * @description
     * As a file owner, I want to Drop the ownership to another Rainbow user of the same company.     <br>
     *      Then:     <br>
     * <br>
     * The former owner becomes a viewer to stay allowed to get the display of the file.     <br>
     * The new owner may loose his status of viewer when needed (as he becomes owner).     <br>
     * <br>
     * Error cases:     
     * 
     * - the former owner's company must allow file ownership change (forbidFileOwnerChangeCustomisation == disabled) errorDetailCode 403156 Access denied: this API can only be called by users having the feature key forbidFileOwnerChangeCustomisation disabled   
     * - the logged in user is not the owner (errorDetailsCode: 403629)   
     * - the new owner must belong to the same company of the current owner. errorDetailCode 403637 User [userId] doesn't belong to the company [companyId]   
     * - the target file is not uploaded yet. errorDetailCode 403638 File [fileId] is not uploaded yet. So it can't be re-allocated.   
     * - the new owner must have enough space to store the file.(errorDetailsCode: 403630)   
     * - A STANZA MESSAGE (type management) is sent to the owner and each viewers. (tag 'file', action='update', owner='xxxxxxxxxxxxx')    
     *
     * @param {string} fileId [required] Identifier of file descriptor to modify
     * @param {string} userId ID of another user which will become owner.
     * @return {Promise<FileDescriptor>} File descriptor Object
     *
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | File descriptor Object |
     * | id  | String | File unique identifier (like 56d0277a0261b53142a5cab5) |
     * | fileName | String | Name of the file |
     * | ownerId | String | Rainbow Id of the file owner |
     * | md5sum | String | md5 of the file get from the backend file storage (default: "", refreshed each time the file is uploaded) |
     * | extension | String | File extension (jpeg, txt, ...) |
     * | typeMIME | String | https://fr.wikipedia.org/wiki/Type_MIME (image/jpeg,text/plain,...) |
     * | size | Number | Size of the file (Default: value given by Rainbow clients). Refreshed from the backend file storage each time the file is uploaded. |
     * | registrationDate | Date-Time | Date when the submit to upload this file was registered |
     * | isUploaded | Boolean | true when the file was uploaded at least one time |
     * | uploadedDate | Date-Time | Last time when the file was uploaded |
     * | viewers | Object\[\] | A set of objects including user or room Rainbow Id, type (user, room) |
     * | thumbnail | Object | Data of the thumbnail 'low resolution' (200X200 for images, 300x300 for .pdf, at least one dimension is 200 or 300)) |
     * | availableThumbnail | Boolean | Thumbnail availability |
     * | wantThumbnailDate | Date-Time | When the thumbnail is ordered |
     * | size | Number | Thumbnail size |
     * | md5sum | String | md5 of the thumbnail get from the backend file storage |
     * | typeMIME | String | https://fr.wikipedia.org/wiki/Type_MIME (application/octet-stream) |
     * | thumbnail500 | Object | Data of the thumbnail 'High resolution' (500x500 - at least one dimension is 500) |
     * | availableThumbnail | Boolean | Thumbnail availability |
     * | wantThumbnailDate | Date-Time | When the thumbnail is ordered |
     * | size | Integer | Thumbnail size |
     * | md5sum | String | md5 of the thumbnail get from the backend file storage |
     * | isClean | Boolean | Null when the file is not yet scanned by an anti-virus |
     * | typeMIME | String | https://fr.wikipedia.org/wiki/Type_MIME (application/octet-stream) |
     * | avReport | String | Null when the file is not yet scanned by an anti-virus |
     * | original_w | Number | For images only (jpeg, jpg, png, gif, pdf), this is the original width. It is processed at the same time as the thumbnails processing. (asynchronously) |
     * | original_h | Number | For images only (jpeg, jpg, png, gif, pdf), this is the original height. It is processed at the same time as the thumbnails processing. (asynchronously) |
     * | tags | Object | Wrap a set of data according with the file use |
     * | path | String | The path under which the owner will be able to classified the file. The folder management is not yet available; only a get files per path. For instance this facility is used to implement OXO visual voice mail feature on client side.<br><br>* /<br>* /voice-messages |
     * | msgId | String | When the file is generated by the Rainbow visual voice mail feature - The message Id (ex: "g0F6jhGrIXN5NQa") |
     * | messageType | String | When the file is generated by the Rainbow visual voice mail feature - The message type<br><br>default : `voice_message`<br><br>Possible values : `voice_message`, `conv_recording` |
     * | duration | Number | The message duration in second (voice message duration) |
     * 
     * 
     */
    fileOwnershipChange(fileId, userId) : Promise<FileDescriptor> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.fileOwnershipChange(fileId, userId).then((response) => {
                let fileDescriptor = that.createFileDescriptorFromData(response);
                that._logger.log("info", LOG_ID + "(fileOwnershipChange) " + fileId + " -- success");
                resolve(fileDescriptor);
            }).catch((errorResponse) => {
                //let error = that._errorHelperService.handleError(errorResponse, "getOneFileDescriptor");
                that._logger.log("error", LOG_ID + "(fileOwnershipChange) " + errorResponse);
                that._logger.log("internalerror", LOG_ID + "(fileOwnershipChange) Error : ", errorResponse);
                return reject(errorResponse);
            });
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
     * Method extract fileId part of URL <br>
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

    //endregion Files FILE MANAGEMENT / PROPERTIES 

}

module.exports.FileStorageService = FileStorage;
export {FileStorage as FileStorageService};
