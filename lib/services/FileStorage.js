"use strict";
const fileViewerElementFactory = require("../common/models/FileViewer").FileViewerElementFactory;
const fileDescriptorFactory = require("../common/models/fileDescriptor").fileDescriptorFactory();
const Conversation = require("../common/models/Conversation");
const url = require('url');
const LOG_ID = "FileStorage - ";

class FileStorage {

    constructor(_eventEmitter, _logger) {
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

        this.fileServerService = null;
        this.conversations = null;

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

    start(_xmpp, _rest, _fileServerService, _conversations) {
        let that = this;

        return new Promise((resolve, reject) => {
            try {

                that.xmpp = _xmpp;
                that.rest = _rest;
                that.fileServerService = _fileServerService;
                that.conversations = _conversations;

                that.logger.log("debug", LOG_ID + "(start) _entering_");

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

                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return Promise((resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(stop) _entering_");
            if (that.started) {
                that.started = false;
            }
            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
            resolve();
        });
    }

    init() {
        let that = this;

        return new Promise((resolve, reject)=> {
            // No blocking service
            that.retrieveFileDescriptorsListPerOwner()
                .then(() => {
                    return that.retrieveReceivedFiles(that.rest.userId /*contactService.userContact.dbId*/);
                })
                .then(() => {
                    that.orderDocuments();
                    return that.retrieveUserConsumption();
                })
                .then(() => {
                    that.started = true;
                    let startDuration = Math.round(Date.now() - that.startDate);

                    that.logger.log("debug", LOG_ID + "(init) === STARTED (" + startDuration + " ms) ===");
                    resolve();
                })
                .catch((error) => {
                    that.logger.log("debug", LOG_ID + "(init) === STARTING === failure -- " + error.message);
                    reject(error);
                });
        });
    }



    /**
     * @private
     * @since 1.24
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
                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", file, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            var blob = xhr.response;
                            var _file = new File([blob], file.replace(/^.*[\\\/]/, ""), {
                                type: "",
                                lastModified: Date.now()
                            });
                            _resolve(_file);
                        }
                    };
                    xhr.responseType = "blob";
                    xhr.send();
                } else {
                    _resolve(file);
                }
            }).then(function(_file) {

                if (_file.size > 100000000) {
                    let errorMessage = "The file is to large (limited to 100MB)";
                    that.logger.log("error", LOG_ID + "(_addFileToConversation) " + errorMessage);
                    reject(new Error(errorMessage));

                    /* reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "The file is to large (limited to 100MB)"
                    }); // */
                } else {
                    that.conversations.sendFSMessage(conversation, _file, data).then(function(message) {
                        resolve(message);
                    });
                }
            });
        });
    }

    /**************** API ***************/

    /**
     * @public
     * @since 1.24
     * @method
     * @instance
     * @param {Conversation} conversation   The conversation where the message will be added
     * @param {fileapi.File} file The file to add
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
                that.logger.log("error", LOG_ID + "(uploadFileToConversation) " + errorMessage);
                reject(new Error(errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is missing or null"
                }); // */
            } else if (!file) {
                let errorMessage = "Parameter 'file' is missing or null";
                that.logger.log("error", LOG_ID + "(uploadFileToConversation) " + errorMessage);
                reject(new Error(errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'file' is missing or null"
                }); // */
            } else if (conversation.type !== Conversation.Type.ONE_TO_ONE) {
                let errorMessage = "Parameter 'conversation' is not a one-to-one conversation";
                that.logger.log("error", LOG_ID + "(uploadFileToConversation) " + errorMessage);
                reject(new Error(errorMessage));
                /* reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'conversation' is not a one-to-one conversation"
                }); // */
            } else {
                that.logger.log("debug", LOG_ID + "[uploadFileToConversation ] ::  Try to add a file " + file + " to the conversation " + conversation.id);
                that._addFileToConversation(conversation, file, strMessage).then(function(msg) {
                    that.logger.log("info", LOG_ID + "[uploadFileToConversation ] ::  file added");
                    resolve(msg);
                }).catch(function(err) {
                    reject(err);
                });
            }
        });
    };

    /**
     * @public
     * @since 1.24
     * @method
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

        return new Promise(function(resolve, reject) {

            if (!bubble) {
                let errorMessage = "Parameter 'bubble' is missing or null";
                that.logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                reject(new Error(errorMessage));
                /* reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'bubble' is missing or null"
                }); // */
            } else if (!file) {
                let errorMessage = "Parameter 'file' is missing or null";
                that.logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                reject(new Error(errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'file' is missing or null"
                }); // */
            } else {
                var conversation = that.conversations.getConversationByBubbleId(bubble.id); // getConversationByRoomDbId(bubble.dbId);

                if (!conversation) {
                    let errorMessage = "Parameter 'bubble' don't have a conversation";
                    that.logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                    reject(new Error(errorMessage));
                    /*reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "Parameter 'bubble' don't have a conversation"
                    }); // */
                } else if (conversation.type !== Conversation.Type.ROOM) {
                    let errorMessage = "Parameter 'conversation' is not a bubble conversation";
                    that.logger.log("error", LOG_ID + "(uploadFileToBubble) " + errorMessage);
                    reject(new Error(errorMessage));
                    /* reject({
                        code: SDK.ERRORBADREQUEST,
                        label: "Parameter 'conversation' is not a bubble conversation"
                    }); // */
                } else {
                    that.logger.log("debug", LOG_ID + "(uploadFileToBubble) ::  Try to add a file " + file + " to the bubble " + bubble.dbId);
                    that._addFileToConversation(conversation, file, strMessage).then(function(msg) {
                        that.logger.log("info", LOG_ID + "(uploadFileToBubble) ::  file added");
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
     * @since 1.24
     * @method
     * @instance
     * @param {FileDescriptor} fileDescriptor   The description of the file to download (short file descriptor)
     * @description
     *    Allow to download a file from the server)
     *    Return a promise
     * @return {buffer Binary data of the file
     *                          type,  Mime type
                        fileSize: fileSize, Size of the file
                        fileName: fileName The name of the file

     * } Return the file received
     */
    downloadFile(fileDescriptor) {
    let that = this;
        return new Promise(function(resolve, reject) {


            if (!fileDescriptor) {
                let errorMessage = "Parameter 'fileDescriptor' is missing or null";
                that.logger.log("error", LOG_ID + "(downloadFile) " + errorMessage);
                reject(new Error(errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'fileDescriptor' is missing or null"
                }); // */
            } else {

                that.logger.log("debug", LOG_ID + "[getFile    ] ::  Try to get a file " + fileDescriptor.filename);

                let urlObj = url.parse(fileDescriptor.url);

                var fileToDownload = {
                    "url": urlObj.pathname || "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id,
                    "mime": fileDescriptor.mime || fileDescriptor.typeMime,
                    "filesize": fileDescriptor.filesize || fileDescriptor.size,
                    "filename": fileDescriptor.filename || fileDescriptor.fileName
                };

                that.fileServerService.getBlobFromUrlWithOptimization(fileToDownload.url, fileToDownload.mime, fileToDownload.filesize, fileToDownload.filename).then(function(blob) {
                    that.logger.log("debug", LOG_ID + "[getFile    ] ::  file downloaded");
                    resolve(blob);
                }).catch(function(err) {
                    reject(err);
                });
            }
        });
    };

    /**
     * @public
     * @since 1.24
     * @method
     * @instance
     * @description
     *    Get the current file storage quota and consumption for the connected user
     *    Return a promise
     * @return {Object} Return an object containing the user quota and consumption
     */
    getUserQuotaConsumption() {
        let that = this;
        return that.retrieveUserConsumption();
    }


    /**
     * @public
     * @since 1.24
     * @method
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
                reject(new Error(errorMessage));
                /*reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'fileDescriptor' is missing or null"
                }); // */
            }
            if(!fileDescriptor.id && !fileDescriptor.url) {
                reject({
                    code: SDK.ERRORBADREQUEST,
                    label: "Parameter 'fileDescriptor' don't contain information to remove the file"
                });
            }
            else {

                $log.sdk(logService + "[removeFile ] ::  Try to remove a file " + fileDescriptor.filename);

                var fileDescriptorId = fileDescriptor.id;

                if (!fileDescriptorId) {
                    var parts = fileDescriptor.url.split("/");
                    fileDescriptorId = parts.pop() || parts.pop();
                }

                fileStorageService.deleteFileDescriptor(fileDescriptorId).then(function() {
                    $log.sdk(logService + "[getFile    ] ::  file removed");
                    resolve({
                        code: SDK.OK,
                        label: "OK"
                    });
                }).catch(function(err) {
                    reject(err);
                });
            }
        });
    };




    /**********************************************************/
    /**  Basic accessors to FileStorage's properties   **/
    /**********************************************************/
    getFileDescriptorById(id) {
        let that = this;

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
     * Method returns a file descriptor with full contact object in viewers'list by requesting server
     * 
     * @param {string} fileId [required] Identifier of file descriptor
     * @returns {Promise<FileDescriptor>} file descriptor
     * 
     * @memberOf FileStorage
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
                            that.contactService.getContactByDBId(viewer.viewerId)
                            .then((contact) => {
                                viewer.contact = contact;
                                return (viewer);
                            })
                            .catch((error) => {
                                that.logger.log("error", LOG_ID + "(getCompleteFileDescriptorById)  " + error);
                                reject(error);
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
                        that.logger.log("error", LOG_ID + "(getCompleteFileDescriptorById) " + error);
                        reject(error);
                    });

            } else {
                reject();
            }
        });
    }

    /**
     *
     *
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
     */
    getDocuments() {
        return this.fileDescriptors;
    }

    /**
     *
     *
     * @returns {FileDescriptor}
     * @memberof FileStorage
     */
    getReceivedDocuments() {
        return this.receivedFileDescriptors;
    }

    /**
     *
     *
     * @param {boolean} received
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
     */
    getDocumentsByName(received) {
        return received ? this.receivedFileDescriptorsByName : this.fileDescriptorsByName;
    }

    /**
     *
     *
     * @param {boolean} received
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
     */
    getDocumentsByDate(received) {
        return received ? this.receivedFileDescriptorsByDate : this.fileDescriptorsByDate;
    }

    /**
     *
     *
     * @param {boolean} received
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
     */
    getDocumentsBySize(received) {
        return received ? this.receivedFileDescriptorsBySize : this.fileDescriptorsBySize;
    }

    /**
     *
     *
     * @param {string} dbId
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
     */
    getReceivedFilesFromContact(dbId) {
        let files = this.receivedFileDescriptorsByDate.filter((file) => {
            return (file.ownerId === dbId);
        });

        return files;
    }

    /**
     *
     *
     * @param {string} dbId
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
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
     *
     * @param {string} dbId
     * @returns {FileDescriptor[]}
     * @memberof FileStorage
     */
    getReceivedFilesForRoom(dbId) {
        let files = this.receivedFileDescriptorsByDate.filter((file) => {
            for (let i = 0; i < file.viewers.length; i++) {
                if (file.viewers[i].viewerId === dbId && file.ownerId !== this.contactService.userContact.dbId) {
                    return true;
                }
            }
            return false;
        });

        return files;
    }

    /**
     *
     *
     * @returns {Object}
     * @memberof FileStorage
     */
    getConsumptionData() {
        return this.consumptionData;
    }

    /**********************************************************/
    /**  Methods requesting server                           **/
    /**********************************************************/

    /**
     * Method requests server to create a file descriptor this will be saved to local file descriptor list (i.e. this.fileDescriptors)
     * 
     * @param {string} name [required] name of file for which file descriptor has to be created
     * @param {string} extension [required] extension of file
     * @param {number} size [required] size of  file
     * @param {FileViewer[]} viewers [required] list of viewers having access to the file (a viewer could be either be a user or a room)
     * @returns {Promise<FileDescriptor>} file descriptor created by server or error 
     * 
     * @memberof FileStorage
     */
    createFileDescriptor(name, extension, size, viewers) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(createFileDescriptor) _entering_");
        return new Promise((resolve, reject) => {
            that.rest.createFileDescriptor(name, extension, size, viewers)
                .then((response ) => {
                    const fileDescriptor = that.createFileDescriptorFromData(response);
                    that.logger.log("debug", LOG_ID + "(createFileDescriptor) -- " + fileDescriptor.id + " -- success");

                    //in case something went wrong with the creation
                    if (fileDescriptor) {
                        that.fileDescriptors.push(fileDescriptor);
                    }

                    that.orderDocuments();
                    that.logger.log("debug", LOG_ID + "(createFileDescriptor) _exiting_");
                    resolve(fileDescriptor);
                })
                .catch((errorResponse) => {
                    //const error = that.errorHelperService.handleError(errorResponse, "createFileDescriptor");
                    that.logger.log("error", LOG_ID + "(createFileDescriptor) " + errorResponse);
                    reject(errorResponse);
                });
        });
    }

    
    /**
     *
     *
     * @param {*} data
     * @returns {FileDescriptor}
     * @memberof FileStorage
     */
    createFileDescriptorFromData(data) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(createFileDescriptorFromData) _entering_");
        if (data) {
            let viewers = [];
            if (data.viewers) {
                for (let viewerData of data.viewers) {
                    viewers.push(fileViewerElementFactory(viewerData.viewerId, viewerData.type, viewerData.contact, that.contactService));
                }
            }
            let url = data.url;
            if (!url) {
                url = that.rest.http.serverURL + "/api/rainbow/fileserver/v1.0/files/" + data.id;
            }

            var state = "unknown";
            if (data.isUploaded) {
                state = "uploaded";
            } else {
                state = "not_uploaded";
            }

            let fd =  fileDescriptorFactory(data.id, url, data.ownerId, data.fileName, data.extension, data.typeMIME,
                data.size, data.registrationDate, data.uploadedDate, data.dateToSort, viewers, state, data.thumbnail, data.orientation);
            
            that.logger.log("debug", LOG_ID + "(createFileDescriptorFromData) _exiting_");
            return fd;
        }
        return;
    }

    /**
     * Method request deletion of a file descriptor on the server and removes it from local storage
     * @param {string} id [required] file descriptor id to be destroyed
     * @returns {Promise<FileDescriptor[]>} list of remaining file descriptors
     * @memberof FileStorage
     */
    deleteFileDescriptor(id) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.deleteFileDescriptor(id)
                .then(() => {
                    that.logger.log("info", LOG_ID + "(deleteFileDescriptor)  -- success");
                    that.deleteFileDescriptorFromCache(id, false);
                    
                    resolve(null);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "deleteFileDescriptor");
                    reject(errorResponse);
                    that.logger.log("error", LOG_ID + "(deleteFileDescriptor) _exiting_");
                });
        });
    }

    /**
     * Method request deletion of all files on the server and removes them from local storage
     * @returns {Promise<{}>} ???
     * @memberof FileStorage
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
                    ///let error = that.errorHelperService.handleError(errorResponse, "deleteAllFileDescriptor");
                    reject(errorResponse);
                });
        });
    }

    /**
     * Method retrieve full list of files belonging to user making the request
     * 
     * @returns {Promise<FileDescriptor[]>} 
     * 
     * @memberof FileStorage
     */
    retrieveFileDescriptorsListPerOwner() {
        let that = this;
        that.fileDescriptors = [];
        return new Promise((resolve, reject) => {
            //that.rest.receivedFileDescriptors("full", 1000)
            that.rest.retrieveFileDescriptors("full", 1000)
                .then((response) => {
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
                                that.logger.log("info", LOG_ID + "(retrieveFileDescriptorsListPerOwner) -- success");
                            } else {
                                that.logger.log("warn", LOG_ID + "(retrieveFileDescriptorsListPerOwner) -- warning fileDescriptorsData retrieved from server is empty");
                            }
                            resolve(that.fileDescriptors);
                        });
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "retrieveFileDescriptorsListPerOwner");
                    reject(errorResponse);
                    that.logger.log("error", LOG_ID + "(retrieveFileDescriptorsListPerOwner) " + errorResponse);
                });
        });
    }

    /**
     * Method retrieve a list of [limit] files belonging to user making the request begining with offset
     * 
     * @returns {Promise<FileDescriptor[]>} 
     * 
     * @memberof FileStorage
     */
    retrieveFileDescriptorsListPerOwnerwithOffset(offset, limit) {
        return this.rest.retrieveFileDescriptors("full", limit, offset);
        //return this.rest.receivedFileDescriptors( "full", limit, offset);
    }

    /**
     * Method request for the list of files received by a user from a given peer (i.e. inside a given conversation)
     * 
     * @param {string} userId [required] dbId of user making the request
     * @param {string} peerId [required] dbId of peer user in the conversation
     * @returns {Promise<FileDescriptor[]>} : list of received files descriptors 
     * 
     * @memberOf FileStorage
     */
    retrieveFilesReceivedFromPeer(userId, peerId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.retrieveFilesReceivedFromPeer(userId, peerId)
                .then((response) => {
                    let receivedFileDescriptors = [];
                    let fileDescriptorsData = response.data.data;
                    if (fileDescriptorsData) {
                        for (let fileDescriptorData of fileDescriptorsData) {
                            let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorData);
                            receivedFileDescriptors.push(fileDescriptor);
                        }
                    }
                    that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) -- success");
                    resolve(receivedFileDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "retrieveFilesReceivedFromPeer");
                    that.logger.log("error", LOG_ID + "(retrieveFilesReceivedFromPeer) " + errorResponse);
                    reject(errorResponse);
                });
        });
    }

    /**
     * Method request for the list of files sent to a given peer (i.e. inside a given conversation)
     * 
     * @param {string} peerId [required] dbId of peer user in the conversation
     * @returns {Promise<FileDescriptor[]>} : list of sent files descriptors 
     * 
     * @memberOf FileStorage
     */
    retrieveSentFiles(peerId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.retrieveFileDescriptors("full", null, null, peerId)
                .then((response) => {
                    let sentFilesDescriptors = [];
                    let fileDescriptorsData = response.data.data;
                    if (fileDescriptorsData) {
                        for (let fileDescriptorData of fileDescriptorsData) {
                            let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorData);
                            sentFilesDescriptors.push(fileDescriptor);
                        }
                    }
                    that.logger.log("info", LOG_ID + "(retrieveSentFiles) success");
                    resolve(sentFilesDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "retrieveSentFiles");
                    that.logger.log("error", LOG_ID + "(retrieveSentFiles " + errorResponse);
                    reject(errorResponse);
                });
        });
    }

    /**
     * Method request for the list of files received in a room
     * 
     * @param {string} roomId [required] Id of the room
     * @returns {Promise<FileDescriptor[]>} : list of received files descriptors 
     * 
     * @memberOf FileStorage
     */
    retrieveReceivedFilesForRoom(roomId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.retrieveReceivedFilesForRoomOrViewer(roomId)
                .then((response) => {
                    let fileDescriptorsData = response.data.data;
                    if (!fileDescriptorsData) {
                        resolve();
                    }

                    let result = [];
                    for (let fileDescriptorDataItem of fileDescriptorsData) {
                        fileDescriptorDataItem.viewers = [];
                        let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorDataItem);
                        if (fileDescriptor.ownerId !== that.contactService.userContact.dbId) {
                            result.push(fileDescriptor);
                        }
                    }
                    that.logger.log("info", LOG_ID + "(retrieveReceivedFilesForRoom) success");
                    result = that.orderDocumentsForRoom(result);
                    resolve(result);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "retrieveReceivedFilesForRoom");
                    that.logger.log("error", LOG_ID + "(retrieveReceivedFilesForRoom) " + errorResponse);
                    reject(errorResponse);
                });
            });
        }

    /**
     * Method request for the list of files received by a user
     * 
     * @param {string} viewerId [required] Id of the viewer, could be either an userId or a roomId
     * @returns {Promise<FileDescriptor[]>} : list of received files descriptors 
     * 
     * @memberOf FileStorage
     */
    retrieveReceivedFiles(viewerId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.retrieveReceivedFilesForRoomOrViewer(viewerId)
                .then((response) => {
                    let fileDescriptorsData = response.data;
                    if (!fileDescriptorsData) {
                        resolve();
                        return;
                    }

                    for (let fileDescriptorItem of fileDescriptorsData) {
                        // fileDescriptorItem.viewers = [];
                        let fileDescriptor = that.createFileDescriptorFromData(fileDescriptorItem);

                        // filter files I sent but this are still returned by server because it is part of a room
                        if (fileDescriptor.ownerId !== that.rest.userId) {
                            let oldFileDesc = that.getFileDescriptorById(fileDescriptor.id);
                            if (oldFileDesc) {
                                fileDescriptor.previewBlob = oldFileDesc.previewBlob;
                            }
                            that.receivedFileDescriptors.push(fileDescriptor);
                        }
                    }
                    that.orderReceivedDocuments();
                    that.logger.log("info", LOG_ID + "(retrieveReceivedFiles) success");
                    resolve(that.receivedFileDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "retrieveReceivedFiles");
                    that.logger.log("error", LOG_ID + "(retrieveReceivedFiles) " + errorResponse);
                    reject(errorResponse);
                });
        });
    }

    /**
     * Method retrieve the data usage of a given user
     * 
     * @returns {Promise<{}>} : object data with the following properties: 
     *                  - feature {string} : The feature key belonging to the user's profile
     *                  - maxValue {number} : The quota associated to this offer [octet]
     *                  - currentValue {number} : The user's current consumption [octet]
     *                  - unit {string} : The unit of this counters 
     * @memberOf FileStorage
     */
    retrieveUserConsumption() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.retrieveUserConsumption()
                .then((response) => {
                    that.consumptionData = response.data;
                    that.logger.log("info", LOG_ID + "(retrieveUserConsumption) success");
                    resolve(that.consumptionData);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "retrieveUserConsumption");
                    that.logger.log("error", LOG_ID + "(retrieveUserConsumption) error: " + errorResponse);
                    reject(errorResponse);
                });
        });
    }

    /**
     * Method deletes a viewer from the list of viewer of a given file
     * 
     * @param {string} viewerId [required] Identifier of viewer to be removed. Could be either a user or a room
     * @param {string} fileId [required] Identifier of the fileDescriptor from which the viewer will be removed
     * @returns {Promise<{}>} 
     * 
     * @memberof FileStorage
     */
    deleteFileViewer(viewerId, fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.deleteFileViewer(viewerId, fileId).then(
                (response) => {
                    that.logger.log("info", LOG_ID + "(deleteFileViewer) " + response.statusText);
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
                    //let error = that.errorHelperService.handleError(errorResponse, "deleteFileViewer");
                    that.logger.log("error", LOG_ID + "(deleteFileViewer) error: " + errorResponse);
                    reject(errorResponse);
                });
        });

    }

    /**
     * Method adds a viewer to a given file on server if it is not already one
     * 
     * @param {string} fileId [required] Identifier of file
     * @param {string} viewerId [required] Identifier of viewer to be added
     * @param {string} viewerType [required] type of viewer to be added (user or room)
     * @returns {Promise<FileDescriptor>} file descriptor with newly added viewer
     * 
     * @memberOf FileStorage
     */
    addFileViewer(fileId, viewerId, viewerType) {
        let that = this;
        let fileDescriptor = that.getFileDescriptorById(fileId);
        if (fileDescriptor && fileDescriptor.isAlreadyFileViewer(viewerId)) {
            return Promise.resolve(fileDescriptor);
        }

        return new Promise((resolve, reject) => {
            that.rest.addFileViewer(fileId, viewerId, viewerType).then(
                (response) => {
                    that.logger.log("info", LOG_ID + "(addFileViewer) success");
                    let fd = that.getFileDescriptorById(fileId);
                    if (fd) {
                        /* var viewerAdded = that.fileViewerFactory([{
                            viewerId: response.data.viewerId,
                            type: response.data.type
                        }])[0]; // */
                        let viewerAdded = fileViewerElementFactory(response.data.viewerId, response.data.type);
                        if (viewerAdded.type === "user") {
                            that.contactService.getContactById(viewerId)
                                .then((contact) => {
                                    viewerAdded.contact = contact;
                                    fd.viewers.push(viewerAdded);
                                    resolve(fd);
                                })
                                .catch((error) => {
                                    that.logger.log("error", LOG_ID + "(addFileViewer) error: " + error);
                                    reject(error);
                                });
                        } else {
                            fd.viewers.push(viewerAdded);
                            resolve(fd);
                        }
                    }
                },
                (errorResponse) => {
                    const error = that.errorHelperService.handleError(errorResponse, "addFileViewer");
                    that.logger.log("error", LOG_ID + "(addFileViewer) error: " + errorResponse);
                    reject(error);
                });
        });
    }

    /** 
     * Method retrieve a specific file descriptor from server
     * 
     * @param {string} fileId [required] Identifier of file descriptor to retrieve
     * @returns {Promise<FileDescriptor>} file descriptor retrieved
     * 
     * @memberOf FileStorage
     */
    retrieveOneFileDescriptor(fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.retrieveOneFileDescriptor(fileId )
                .then((response) => {
                    let fileDescriptor = that.createFileDescriptorFromData(response.data.data);
                    that.logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) " + fileId + " -- success");
                    resolve(fileDescriptor);
                })
                .catch((errorResponse) => {
                    //let error = that.errorHelperService.handleError(errorResponse, "getOneFileDescriptor");
                    that.logger.log("error", LOG_ID + "(retrieveOneFileDescriptor) " + errorResponse);
                    reject(errorResponse);
                });
        });
    }

    /**
     * Method retrieve a specific file descriptor from server and stores it in local fileDescriptors (replace existing and add if new)
     * 
     * @param {string} fileId [required] Identifier of file descriptor to retrieve
     * @returns {Promise<FileDescriptor>} file descriptor retrieved or null if none found
     * 
     * @memberOf FileStorage
     */
    retrieveAndStoreOneFileDescriptor(fileId, forceRetrieve) {
        let that = this;
        let fileDescriptor = that.getFileDescriptorById(fileId);
        if (fileDescriptor && !forceRetrieve) {
            that.logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- return existing fileDescriptor " + fileId);
            return Promise.resolve(fileDescriptor);
        }

        return that.retrieveOneFileDescriptor(fileId)
            .then((retrievedFileDescriptor) => {

                if (fileDescriptor && fileDescriptor.isImage()) {
                    retrievedFileDescriptor.previewBlob = fileDescriptor.previewBlob;
                }

                // Remove old file descriptor with same id if there's one
                let oldFileDescriptorIndex = that.helpersService.findIndex(that.fileDescriptors, (_fileDescriptor) => {
                    return _fileDescriptor.id === retrievedFileDescriptor.id;
                });
                if (oldFileDescriptorIndex > -1) {
                    that.fileDescriptors.splice(oldFileDescriptorIndex, 1);
                }
                let oldReceivedFileDescriptorIndex = that.helpersService.findIndex(that.receivedFileDescriptors, (_fileDescriptor) => {
                    return _fileDescriptor.id === retrievedFileDescriptor.id;
                });
                if (oldReceivedFileDescriptorIndex > -1) {
                    that.receivedFileDescriptors.splice(oldReceivedFileDescriptorIndex, 1);
                }

                if (retrievedFileDescriptor.ownerId === that.contactService.userContact.dbId) { // The file is mine
                    that.fileDescriptors.push(retrievedFileDescriptor);
                    that.logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- fileDescriptor " + retrievedFileDescriptor.id + " -- now stored in my files");
                } else { // The file is not mine
                    //that.retrievedFileDescriptors = [];
                    that.receivedFileDescriptors.push(retrievedFileDescriptor);
                    that.logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- fileDescriptor " + retrievedFileDescriptor.id + " -- now stored in received files");
                }

                return Promise.resolve(retrievedFileDescriptor);
            })
            .catch((errorResponse) => {
                that.logger.log("warn", LOG_ID + "(retrieveAndStoreOneFileDescriptor) Error on getting FileDescriptor: " + errorResponse.errorDetailsCode);
                let error = that.errorHelperService.handleError(errorResponse, "retrieveAndStoreOneFileDescriptor");
                if (error.status >= 400 && error.status < 500) {
                    if (fileDescriptor) {
                        if (error.status === 404) {
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
        that.logger.log("debug", LOG_ID + "(deleteFileDescriptorFromCache) " + id);

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
        that.logger.log("debug", LOG_ID + "(orderDocuments) " + that.fileDescriptors.length);
        that.replaceOrderedByFilter(that.fileDescriptorsByDate, that.fileDescriptors, that.getDate, false, that.sortByDate);
        that.replaceOrderedByFilter(that.fileDescriptorsByName, that.fileDescriptors, that.getName, false, that.sortByName);
        that.replaceOrderedByFilter(that.fileDescriptorsBySize, that.fileDescriptors, that.getSize, false, that.sortBySize);
        that.orderReceivedDocuments();
    }

    orderReceivedDocuments() {
        let that = this;
        that.logger.log("debug", LOG_ID + "(orderReceivedDocuments) " + that.receivedFileDescriptors.length);
        that.replaceOrderedByFilter(that.receivedFileDescriptorsByName, that.receivedFileDescriptors, that.getName, false, that.sortByName);
        that.replaceOrderedByFilter(that.receivedFileDescriptorsByDate, that.receivedFileDescriptors, that.getDate, false, that.sortByDate);
        that.replaceOrderedByFilter(that.receivedFileDescriptorsBySize, that.receivedFileDescriptors, that.getSize, false, that.sortBySize);
    }

    orderDocumentsForRoom(documents) {
        let that = this;
        return that.orderByFilter(documents, that.getDate, false, that.sortByDate);
    }

    replaceOrderedByFilter(resultArray, originalArray, filterFct, flag, sortFct) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(replaceOrderedByFilter) ");

        resultArray.length = 0;
        let orderedArrayResult = that.orderByFilter(originalArray, filterFct, flag, sortFct);
        for (let fileResult of orderedArrayResult) {
            if (fileResult.state !== "deleted") {
                resultArray.push(fileResult);
            }
        }
    }

    orderByFilter (originalArray, filterFct, flag, sortFct) {
        let o = []

        let objs = [];

        originalArray.forEach(function(obj, index) {
            let tab = []
            tab.push(obj);
            let res = filterFct.apply(null, tab);
            objs.push(res);
                //that.waitingBotConversations.splice(index, 1);
        });

        o = objs.sort(sortFct);

        if (flag) {
             return o.reverse();
        } else {
            return o;
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
     * Method extract fileId part of URL
     * 
     * @param {string} url 
     * @returns {string} 
     * 
     * @memberof FileStorage
     */
    extractFileIdFromUrl(url) {
        let parts = url.split("/");
        let fileDescriptorId = parts.pop() || parts.pop();
        return fileDescriptorId;
    }
}

module.exports = FileStorage;