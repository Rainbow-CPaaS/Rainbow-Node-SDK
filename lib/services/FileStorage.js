"use strict";
const fileViewerElementFactory = require("../common/models/FileViewer").FileViewerElementFactory;

const LOG_ID = "FileStorage - ";

class FileStorage {

    constructor(_eventEmitter, _logger) {
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

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

    start(_xmpp, _rest) {
        let that = this;

        return new Promise((resolve, reject) => {
            try {

                that.xmpp = _xmpp;
                that.rest = _rest;

                this.logger.log("debug", LOG_ID + "(start) _entering_");

                let startDate = Date.now();
                this.started = false;
                this.fileDescriptors = [];
                this.fileDescriptorsByDate = [];
                this.fileDescriptorsByName = [];
                this.fileDescriptorsBySize = [];
                this.receivedFileDescriptors = [];
                this.receivedFileDescriptorsByName = [];
                this.receivedFileDescriptorsByDate = [];
                this.receivedFileDescriptorsBySize = [];
                this.consumptionData = {};

                // No blocking service
                this.retrieveFileDescriptorsListPerOwner()
                    .then(() => {
                        return this.retrieveReceivedFiles(this.contactService.userContact.dbId);
                    })
                    .then(() => {
                        this.orderDocuments();
                        return this.retrieveUserConsumption();
                    })
                    .then(() => {
                        this.started = true;
                        var startDuration = Math.round(Date.now() - startDate);

                        this.logger.log("debug", LOG_ID + "(start) === STARTED (" + startDuration + " ms) ===");
                    })
                    .catch((error) => {
                        this.logger.log("debug", LOG_ID + "(start) === STARTING === failure -- " + error.message);
                    });

                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    stop() {
        return Promise((resolve, reject) => {
            let that = this;
            that.logger.log("debug", LOG_ID + "(stop) _entering_");
            if (this.started) {
                this.started = false;
            }
            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
            resolve();
        });
    }

    /**********************************************************/
    /**  Basic accessors to FileStorage's properties   **/
    /**********************************************************/
    getFileDescriptorById(id) {
        for (let fileDescriptor of this.fileDescriptors) {
            if (fileDescriptor.id === id) {
                return fileDescriptor;
            }
        }
        for (let fileDescriptor of this.receivedFileDescriptors) {
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

            if (this.fileDescriptors.some((fd) => {
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
                            this.contactService.getContactByDBId(viewer.viewerId)
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
                    const fileDescriptor = this.createFileDescriptorFromData(response);
                    that.logger.log("debug", LOG_ID + "(createFileDescriptor) -- " + fileDescriptor.id + " -- success");

                    //in case something went wrong with the creation
                    if (fileDescriptor) {
                        this.fileDescriptors.push(fileDescriptor);
                    }

                    this.orderDocuments();
                    that.logger.log("debug", LOG_ID + "(createFileDescriptor) _exiting_");
                    resolve(fileDescriptor);
                })
                .catch((errorResponse) => {
                    //const error = this.errorHelperService.handleError(errorResponse, "createFileDescriptor");
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
                    viewers.push(fileViewerElementFactory(viewerData.viewerId, viewerData.type, viewerData.contact, this.contactService));
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

            let fd =  that.fileDescriptorFactory(data.id, url, data.ownerId, data.fileName, data.extension, data.typeMIME,
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
                    this.deleteFileDescriptorFromCache(id, false);
                    
                    resolve(null);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "deleteFileDescriptor");
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
        return new Promise((resolve, reject) => {
            let promiseArray = [];
            this.fileDescriptors.forEach((fileDescriptor) => {
                if (fileDescriptor.state !== "deleted") {
                    promiseArray.push(
                        this.deleteFileDescriptor(fileDescriptor.id)
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
                    ///let error = this.errorHelperService.handleError(errorResponse, "deleteAllFileDescriptor");
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
        this.fileDescriptors = [];
        return new Promise((resolve, reject) => {
            //this.rest.receivedFileDescriptors("full", 1000)
            this.rest.retrieveFileDescriptors("full", 1000)
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
                            requestArray.push(this.retrieveFileDescriptorsListPerOwnerwithOffset(offset, limit));
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
                                    let fileDescriptor = this.createFileDescriptorFromData(fileDescriptorData);
                                    this.fileDescriptors.push(fileDescriptor);
                                }
                                that.logger.log("info", LOG_ID + "(retrieveFileDescriptorsListPerOwner) -- success");
                            } else {
                                that.logger.log("warn", LOG_ID + "(retrieveFileDescriptorsListPerOwner) -- warning fileDescriptorsData retrieved from server is empty");
                            }
                            resolve(this.fileDescriptors);
                        });
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "retrieveFileDescriptorsListPerOwner");
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
            this.rest.retrieveFilesReceivedFromPeer(userId, peerId)
                .then((response) => {
                    let receivedFileDescriptors = [];
                    let fileDescriptorsData = response.data.data;
                    if (fileDescriptorsData) {
                        for (let fileDescriptorData of fileDescriptorsData) {
                            let fileDescriptor = this.createFileDescriptorFromData(fileDescriptorData);
                            receivedFileDescriptors.push(fileDescriptor);
                        }
                    }
                    that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) -- success");
                    resolve(receivedFileDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "retrieveFilesReceivedFromPeer");
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
            this.rest.retrieveFileDescriptors("full", null, null, peerId)
                .then((response) => {
                    let sentFilesDescriptors = [];
                    let fileDescriptorsData = response.data.data;
                    if (fileDescriptorsData) {
                        for (let fileDescriptorData of fileDescriptorsData) {
                            let fileDescriptor = this.createFileDescriptorFromData(fileDescriptorData);
                            sentFilesDescriptors.push(fileDescriptor);
                        }
                    }
                    that.logger.log("info", LOG_ID + "(retrieveSentFiles) success");
                    resolve(sentFilesDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "retrieveSentFiles");
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
            this.rest.retrieveReceivedFilesForRoomOrViewer(roomId)
                .then((response) => {
                    let fileDescriptorsData = response.data.data;
                    if (!fileDescriptorsData) {
                        resolve();
                    }

                    let result = [];
                    for (let fileDescriptorDataItem of fileDescriptorsData) {
                        fileDescriptorDataItem.viewers = [];
                        let fileDescriptor = this.createFileDescriptorFromData(fileDescriptorDataItem);
                        if (fileDescriptor.ownerId !== this.contactService.userContact.dbId) {
                            result.push(fileDescriptor);
                        }
                    }
                    that.logger.log("info", LOG_ID + "(retrieveReceivedFilesForRoom) success");
                    result = this.orderDocumentsForRoom(result);
                    resolve(result);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "retrieveReceivedFilesForRoom");
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
            this.rest.retrieveReceivedFilesForRoomOrViewer(viewerId)
                .then((response) => {
                    let fileDescriptorsData = response.data.data;
                    if (!fileDescriptorsData) {
                        resolve();
                        return;
                    }

                    for (let fileDescriptorItem of fileDescriptorsData) {
                        // fileDescriptorItem.viewers = [];
                        let fileDescriptor = this.createFileDescriptorFromData(fileDescriptorItem);

                        // filter files I sent but this are still returned by server because it is part of a room
                        if (fileDescriptor.ownerId !== this.contactService.userContact.dbId) {
                            let oldFileDesc = this.getFileDescriptorById(fileDescriptor.id);
                            if (oldFileDesc) {
                                fileDescriptor.previewBlob = oldFileDesc.previewBlob;
                            }
                            this.receivedFileDescriptors.push(fileDescriptor);
                        }
                    }
                    this.orderReceivedDocuments();
                    that.logger.log("info", LOG_ID + "(retrieveReceivedFiles) success");
                    resolve(this.receivedFileDescriptors);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "retrieveReceivedFiles");
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
            this.rest.retrieveUserConsumption()
                .then((response) => {
                    this.consumptionData = response.data.data;
                    that.logger.log("info", LOG_ID + "(retrieveUserConsumption) success");
                    resolve(this.consumptionData);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "retrieveUserConsumption");
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
            this.rest.deleteFileViewer(viewerId, fileId).then(
                (response) => {
                    that.logger.log("info", LOG_ID + "(deleteFileViewer) " + response.statusText);
                    // delete viewer from viewer list
                    let fd = this.getFileDescriptorById(fileId);
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
                    //let error = this.errorHelperService.handleError(errorResponse, "deleteFileViewer");
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
        let fileDescriptor = this.getFileDescriptorById(fileId);
        if (fileDescriptor && fileDescriptor.isAlreadyFileViewer(viewerId)) {
            return this.$q.resolve(fileDescriptor);
        }

        return new Promise((resolve, reject) => {
            this.rest.addFileViewer(fileId, viewerId, viewerType).then(
                (response) => {
                    that.logger.log("info", LOG_ID + "(addFileViewer) success");
                    let fd = this.getFileDescriptorById(fileId);
                    if (fd) {
                        var viewerAdded = this.fileViewerFactory([{
                            viewerId: response.data.data.viewerId,
                            type: response.data.data.type
                        }])[0];
                        if (viewerAdded.type === "user") {
                            this.contactService.getContactByDBId(viewerId)
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
                    const error = this.errorHelperService.handleError(errorResponse, "addFileViewer");
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
            this.rest.retrieveOneFileDescriptor(fileId )
                .then((response) => {
                    let fileDescriptor = this.createFileDescriptorFromData(response.data.data);
                    that.logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) " + fileId + " -- success");
                    resolve(fileDescriptor);
                })
                .catch((errorResponse) => {
                    //let error = this.errorHelperService.handleError(errorResponse, "getOneFileDescriptor");
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
        let fileDescriptor = this.getFileDescriptorById(fileId);
        if (fileDescriptor && !forceRetrieve) {
            that.logger.log("info", LOG_ID + "(retrieveAndStoreOneFileDescriptor) -- return existing fileDescriptor " + fileId);
            return Promise.resolve(fileDescriptor);
        }

        return this.retrieveOneFileDescriptor(fileId)
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

        for (let index = 0; index < this.receivedFileDescriptors.length; index++) {
            if (this.receivedFileDescriptors[index].id === id) {
                this.receivedFileDescriptors.splice(index, 1);
                break;
            }
        }

        for (let index = 0; index < this.fileDescriptors.length; index++) {
            if (this.fileDescriptors[index].id === id) {
                if (forceDelete) {
                    this.fileDescriptors.splice(index, 1);
                } else {
                    this.fileDescriptors[index].state = "deleted";
                }
                break;
            }
        }
    }

    orderDocuments() {
        let that = this;
        that.logger.log("debug", LOG_ID + "(orderDocuments) " + this.fileDescriptors.length);
        this.replaceOrderedByFilter(this.fileDescriptorsByDate, this.fileDescriptors, this.getDate, false, this.sortByDate);
        this.replaceOrderedByFilter(this.fileDescriptorsByName, this.fileDescriptors, this.getName, false, this.sortByName);
        this.replaceOrderedByFilter(this.fileDescriptorsBySize, this.fileDescriptors, this.getSize, false, this.sortBySize);
        this.orderReceivedDocuments();
    }

    orderReceivedDocuments() {
        let that = this;
        that.logger.log("debug", LOG_ID + "(orderReceivedDocuments) " + this.receivedFileDescriptors.length);
        this.replaceOrderedByFilter(this.receivedFileDescriptorsByName, this.receivedFileDescriptors, this.getName, false, this.sortByName);
        this.replaceOrderedByFilter(this.receivedFileDescriptorsByDate, this.receivedFileDescriptors, this.getDate, false, this.sortByDate);
        this.replaceOrderedByFilter(this.receivedFileDescriptorsBySize, this.receivedFileDescriptors, this.getSize, false, this.sortBySize);
    }

    orderDocumentsForRoom(documents) {
        let that = this;
        return that.orderByFilter(documents, this.getDate, false, this.sortByDate);
    }

    replaceOrderedByFilter(resultArray, originalArray, filterFct, flag, sortFct) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(replaceOrderedByFilter) ");

        resultArray.length = 0;
        let orderedArrayResult = this.orderByFilter(originalArray, filterFct, flag, sortFct);
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
        if (fileA.value.name && fileB.value.name) {
            res = fileA.value.name.localeCompare(fileB.value.name);
            if (res === 0) {
                res = fileB.value.date - fileA.value.date;
            }
        }
        return res;
    }

    sortBySize(fileA, fileB) {
        let res = -1;
        if (fileA.value.size && fileB.value.size) {
            res = fileB.value.size - fileA.value.size;
        }
        return res;
    }

    sortByDate(fileA, fileB) {
        let res = 1;
        if (fileA && fileB) {
            res = fileB.value - fileA.value;
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