'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/FSTO - ";

/**
 * Handles all REST API calls related to FileStorage and FileServer.
 */
@logEntryExit(LOG_ID)
class RESTFileStorage extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTFileStorage'; }
    getClassName() { return RESTFileStorage.getClassName(); }
    static getAccessorName() { return 'restfilestorage'; }
    getAccessorName() { return RESTFileStorage.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            let that = this;
            that.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }

    //region FileStorage

    createFileDescriptor(name, extension, size, viewers, voicemessage: boolean, duration: number, encoding: boolean, ccarelogs: boolean, ccareclientlogs: boolean) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createFileDescriptor) entry`);
        return new Promise(function (resolve, reject) {
            let data = {
                fileName: name,
                extension: extension,
                size: size,
                viewers: viewers,
                voicemessage,
                duration,
                encoding,
                ccarelogs,
                ccareclientlogs
            };

            that.http.post("/api/rainbow/filestorage/v1.0/files", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createFileDescriptor) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(createFileDescriptor) REST get Blob from Url");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createFileDescriptor) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFileDescriptor(fileId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteFileDescriptor) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/filestorage/v1.0/files/" + fileId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteFileDescriptor) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteFileDescriptor) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteFileDescriptor) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFileDescriptors(fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, viewerId: string, path: string, limit: number = 1000, offset: number, sortField: string, sortOrder: number, format: string = "full") {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveFileDescriptors) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFileDescriptors) REST fileName : ", fileName);

            let url: string = "/api/rainbow/filestorage/v1.0/files";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (fileName != undefined) {
                addParamToUrl(urlParamsTab, "fileName", fileName);
            }
            if (extension != undefined) {
                addParamToUrl(urlParamsTab, "extension", extension);
            }
            if (typeMIME != undefined) {
                addParamToUrl(urlParamsTab, "typeMIME", typeMIME);
            }
            if (purpose != undefined) {
                addParamToUrl(urlParamsTab, "purpose", purpose);
            }
            if (isUploaded != undefined) {
                addParamToUrl(urlParamsTab, "isUploaded", isUploaded ? "true" : "false");
            }
            if (viewerId != undefined) {
                addParamToUrl(urlParamsTab, "viewerId", viewerId);
            }
            if (path != undefined) {
                addParamToUrl(urlParamsTab, "path", path);
            }
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFileDescriptors) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveFileDescriptors) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveFileDescriptors) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFileDescriptors) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveFileDescriptors) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveFileDescriptors) error : ", err);
                return reject(err);
            });
        });
    }

    getAllConferenceRecords(roomName?: string, recordingName?: string, status?: string, roomId?: string, purpose?: string, fetch: string = "mine", isEphemeral?: boolean, limit: number = 100, offset: number = 0, sortField: string = "recordingStartDate", sortOrder: number = 1, format: string = "small") {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllConferenceRecords) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllConferenceRecords) REST limit : ", limit);

            let url: string = "/api/rainbow/filestorage/v1.0/conferences-recordings";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            if (roomName != undefined) {
                addParamToUrl(urlParamsTab, "roomName", roomName);
            }
            if (recordingName != undefined) {
                addParamToUrl(urlParamsTab, "recordingName", recordingName);
            }
            if (status != undefined) {
                addParamToUrl(urlParamsTab, "status", status);
            }
            if (roomId != undefined) {
                addParamToUrl(urlParamsTab, "roomId", roomId);
            }
            if (purpose != undefined) {
                addParamToUrl(urlParamsTab, "purpose", purpose);
            }
            if (fetch != undefined) {
                addParamToUrl(urlParamsTab, "fetch", fetch);
            }
            if (isEphemeral != undefined) {
                addParamToUrl(urlParamsTab, "isEphemeral", isEphemeral ? "true" : "false");
            }
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllConferenceRecords) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllConferenceRecords) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getAllConferenceRecords) REST get conference records");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllConferenceRecords) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllConferenceRecords) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllConferenceRecords) error : ", err);
                return reject(err);
            });
        });
    }

    updateOneConferenceRecordName(confrecid: string, recordingName: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateOneConferenceRecordName) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateOneConferenceRecordName) REST confrecid : ", confrecid);

            let url: string = "/api/rainbow/filestorage/v1.0/conferences-recordings/" + confrecid;
            let body = {"recordingName": recordingName};

            that.http.put(url, that.getRequestHeader(), body).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateOneConferenceRecordName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateOneConferenceRecordName) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateOneConferenceRecordName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateOneConferenceRecordName) error : ", err);
                return reject(err);
            });
        });
    }

    getOneConferenceRecord(confrecid: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getOneConferenceRecord) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getOneConferenceRecord) REST confrecid : ", confrecid);

            let url: string = "/api/rainbow/filestorage/v1.0/conferences-recordings/" + confrecid;

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getOneConferenceRecord) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getOneConferenceRecord) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getOneConferenceRecord) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getOneConferenceRecord) error : ", err);
                return reject(err);
            });
        });
    }

    deleteOneConferenceRecord(confrecid: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteOneConferenceRecord) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteOneConferenceRecord) REST confrecid : ", confrecid);

            let url: string = "/api/rainbow/filestorage/v1.0/conferences-recordings/" + confrecid;

            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteOneConferenceRecord) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteOneConferenceRecord) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteOneConferenceRecord) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteOneConferenceRecord) error : ", err);
                return reject(err);
            });
        });
    }

    deleteOneDocumentConferenceRecord(confrecid: string, fileId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteOneDocumentConferenceRecord) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteOneDocumentConferenceRecord) REST confrecid : ", confrecid + ", fileId: " + fileId);

            let url: string = "/api/rainbow/filestorage/v1.0/conferences-recordings/" + confrecid + "/files/" + fileId;

            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteOneDocumentConferenceRecord) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteOneDocumentConferenceRecord) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteOneDocumentConferenceRecord) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteOneDocumentConferenceRecord) error : ", err);
                return reject(err);
            });
        });
    }

    getOneConferenceRecordExternalRef(registrationUuid: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getOneConferenceRecordExternalRef) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getOneConferenceRecordExternalRef) REST registrationUuid : ", registrationUuid);

            let url: string = "/api/rainbow/filestorage/v1.0/conferences-recordings/external-reference";
            let body = {"registrationUuid": registrationUuid};

            that.http.post(url, that.getRequestHeader(), body).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getOneConferenceRecordExternalRef) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getOneConferenceRecordExternalRef) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getOneConferenceRecordExternalRef) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getOneConferenceRecordExternalRef) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFilesReceivedFromPeer(userId, peerId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveFilesReceivedFromPeer) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + userId + "?ownerId=" + peerId + "&format=full", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveFilesReceivedFromPeer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFilesReceivedFromPeer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveFilesReceivedFromPeer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveFilesReceivedFromPeer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string = "full", limit: number = 100, offset: number, sortField: string, sortOrder: number) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveReceivedFilesForRoomOrViewer) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST fileName : ", fileName);

            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + viewerId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveReceivedFilesForRoomOrViewer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveReceivedFilesForRoomOrViewer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveOneFileDescriptor(fileId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveOneFileDescriptor) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/" + fileId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveOneFileDescriptor) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveOneFileDescriptor) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveOneFileDescriptor) REST result : ", json);
                let res = json ? json?.data : {};
                resolve(res);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveOneFileDescriptor) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveOneFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserConsumption() {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveUserConsumption) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/users/consumption", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveUserConsumption) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveUserConsumption) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveUserConsumption) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveUserConsumption) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveUserConsumption) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFileViewer(viewerId, fileId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteFileViewer) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/filestorage/v1.0/files/" + fileId + "/viewers/" + viewerId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteFileViewer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteFileViewer) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteFileViewer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteFileViewer) error : ", err);
                return reject(err);
            });
        });
    }

    addFileViewer(fileId, viewerId, viewerType) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addFileViewer) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/filestorage/v1.0/files/" + fileId + "/viewers", that.getRequestHeader(), {
                viewerId: viewerId,
                type: viewerType
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addFileViewer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addFileViewer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addFileViewer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addFileViewer) error : ", err);
                return reject(err);
            });
        });
    }

    getFileDescriptorsByCompanyId(companyId, fileName: boolean, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "fileName", sortOrder: number = 1) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getFileDescriptorsByCompanyId) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getFileDescriptorsByCompanyId) REST companyId : ", companyId);

            let url: string = "/api/rainbow/filestorage/v1.0/companies/" + companyId + "/files";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (fileName != undefined) {
                addParamToUrl(urlParamsTab, "fileName", fileName ? "true" : "false");
            }
            if (extension != undefined) {
                addParamToUrl(urlParamsTab, "extension", extension);
            }
            if (typeMIME != undefined) {
                addParamToUrl(urlParamsTab, "typeMIME", typeMIME);
            }
            if (purpose != undefined) {
                addParamToUrl(urlParamsTab, "purpose", purpose);
            }
            if (isUploaded != undefined) {
                addParamToUrl(urlParamsTab, "isUploaded", isUploaded ? "true" : "false");
            }
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getFileDescriptorsByCompanyId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFileDescriptorsByCompanyId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFileDescriptorsByCompanyId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFileDescriptorsByCompanyId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFileDescriptorsByCompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    copyFileInPersonalCloudSpace(fileId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(copyFileInPersonalCloudSpace) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/filestorage/v1.0/files/" + fileId + "/copy", that.getRequestHeader(), undefined, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(copyFileInPersonalCloudSpace) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(copyFileInPersonalCloudSpace) REST result : ", json);
                if (json && json.data) {
                    resolve(json?.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(copyFileInPersonalCloudSpace) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(copyFileInPersonalCloudSpace) error : ", err);
                return reject(err);
            });
        });
    }

    fileOwnershipChange(fileId: string, userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(fileOwnershipChange) entry`);
        return new Promise(function (resolve, reject) {
            let data = {userId};

            that.http.put("/api/rainbow/filestorage/v1.0/files/" + fileId + "/drop", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(fileOwnershipChange) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(fileOwnershipChange) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(fileOwnershipChange) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(fileOwnershipChange) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion FileStorage

    //region FileServer

    getPartialDataFromServer(url, minRange, maxRange, index) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getPartialDataFromServer) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeaderWithRange("application/octet-stream", "bytes=" + minRange + "-" + maxRange), undefined).then(function (data) {
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialDataFromServer) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialDataFromServer) REST get Blob from Url");
                resolve({"data": data, "index": index});
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPartialDataFromServer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPartialDataFromServer) error : ", err);
                return reject(err);
            });
        });
    }

    getPartialBufferFromServer(url, minRange, maxRange, index) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getPartialBufferFromServer) entry`);
        return new Promise(function (resolve, reject) {
            let header = that.getRequestHeaderWithRange("responseType: 'arraybuffer'", "bytes=" + minRange + "-" + maxRange);
            that.http.get(url, header, undefined, 'arraybuffer').then(function (data) {
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialBufferFromServer) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialBufferFromServer) REST get Blob from Url");
                resolve({"data": data, "index": index});
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPartialBufferFromServer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPartialBufferFromServer) error : ", err);
                return reject(err);
            });
        });
    }

    getFileFromUrl(url) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getFileFromUrl) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeader("application/octet-stream"), undefined).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(getFileFromUrl) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getFileFromUrl) REST get Blob from Url");
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFileFromUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFileFromUrl) error : ", err);
                return reject(err);
            });
        });
    }

    getBlobFromUrl(url) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBlobFromUrl) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeader("responseType: 'arraybuffer'"), undefined).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBlobFromUrl) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getBlobFromUrl) REST get Blob from Url");
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBlobFromUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBlobFromUrl) error : ", err);
                return reject(err);
            });
        });
    }

    uploadAFile(fileId, buffer) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(uploadAFile) entry`);
        return new Promise(function (resolve, reject) {
            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId, that.getRequestHeader("Content-Type: 'application/octet-stream'"), buffer).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadAFile) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadAFile) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadAFile) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadAFile) error : ", err);
                return reject(err);
            });
        });
    }

    uploadABuffer(fileId, buffer) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(uploadABuffer) entry`);
        return new Promise(function (resolve, reject) {
            let headers = that.getRequestHeader();
            headers['Content-Type'] = 'application/octet-stream';
            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId, headers, buffer).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadABuffer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadABuffer) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadABuffer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadABuffer) error : ", err);
                return reject(err);
            });
        });
    }

    uploadAStream(fileId, stream) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(uploadAStream) entry`);
        return new Promise(function (resolve, reject) {
            let headers = that.getRequestHeader();
            headers['Content-Type'] = 'application/octet-stream';
            that.http.putStream("/api/rainbow/fileserver/v1.0/files/" + fileId, headers, stream).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadAStream) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadAStream) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadAStream) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadAStream) error : ", err);
                return reject(err);
            });
        });
    }

    sendPartialDataToServer(fileId, file, index) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendPartialDataToServer) entry`);
        return new Promise(function (resolve, reject) {
            let headers = that.getRequestHeader();
            headers["Content-Type"] = 'application/octet-stream';

            that._logger.log(that.DEBUG, LOG_ID + " sendPartialDataToServer, fileId : " + fileId + ", index : " + index + " Headers : ", JSON.stringify(headers, null, "  "));

            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId + "/parts/" + index, headers, file).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendPartialDataToServer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendPartialDataToServer) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendPartialDataToServer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendPartialDataToServer) error : ", err);
                return reject(err);
            });
        });
    }

    sendPartialFileCompletion(fileId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendPartialFileCompletion) entry`);
        return new Promise(function (resolve, reject) {
            let headers = that.getRequestHeader("application/json");
            headers['Content-Type'] = 'application/octet-stream';

            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId + "/parts/end", headers, undefined).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendPartialFileCompletion) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendPartialFileCompletion) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendPartialFileCompletion) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendPartialFileCompletion) error : ", err);
                return reject(err);
            });
        });
    }

    getFilesTemporaryURL(fileId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getFilesTemporaryURL) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/fileserver/v1.0/files/" + fileId + "/temporary-url";

            that._logger.log(that.INTERNAL, LOG_ID + "(getFilesTemporaryURL) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFilesTemporaryURL) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFilesTemporaryURL) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFilesTemporaryURL) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFilesTemporaryURL) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion FileServer

}

module.exports = {'RESTFileStorage': RESTFileStorage};
export {RESTFileStorage as RESTFileStorage};
