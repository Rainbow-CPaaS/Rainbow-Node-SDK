'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/APPS - ";

/**
 * Handles all REST API calls related to Rainbow applications management.
 */
@logEntryExit(LOG_ID)
class RESTApplications extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTApplications'; }
    getClassName() { return RESTApplications.getClassName(); }
    static getAccessorName() { return 'restapplications'; }
    getAccessorName() { return RESTApplications.getAccessorName(); }

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

    //region Applications

    async blockApplication(applicationId, reason) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_blockApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/block
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(blockApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/block";

            let body = {
                reason: reason || "Application blocked by administrator"
            };

            that.http.put(url, that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(blockApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(blockApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(blockApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(blockApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async createApplication(name, platform, ownerId, isPublished, appKeyOnly, appKeyAndSecret, appKeyAndSecretAndJwt, appKeyAndJwtSecret, appKeyAndJwtAndSecret, appKeyAndJwtAndSecretAndRedirectUri) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_postApps
        // POST /api/rainbow/applications/v1.0/applications
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createApplication) entry`);
        return new Promise(function (resolve, reject) {
            let application = {
                name: name,
                platform: platform,
                ownerId: ownerId,
                isPublished: isPublished,
                appKeyOnly: appKeyOnly,
                appKeyAndSecret: appKeyAndSecret,
                appKeyAndSecretAndJwt: appKeyAndSecretAndJwt,
                appKeyAndJwtSecret: appKeyAndJwtSecret,
                appKeyAndJwtAndSecret: appKeyAndJwtAndSecret,
                appKeyAndJwtAndSecretAndRedirectUri: appKeyAndJwtAndSecretAndRedirectUri
            };

            Object.keys(application).forEach(key => {
                if (application[key] === undefined) {
                    delete application[key];
                }
            });

            that.http.post("/api/rainbow/applications/v1.0/applications", that.getRequestHeader(), application, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async declineApplicationDeployment(applicationId: string, reason: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_declineAppDeployment
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/decline-deployment
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(declineApplicationDeployment) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/decline-deployment";
            let body = { reason: reason };

            that.http.put(url, that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineApplicationDeployment) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(declineApplicationDeployment) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineApplicationDeployment) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineApplicationDeployment) error : ", err);
                return reject(err);
            });
        });
    }

    async deleteApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_deleteApp
        // DELETE /api/rainbow/applications/v1.0/applications/:applicationId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId;

            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async deployApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_deployApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/deploy
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deployApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/deploy";

            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deployApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deployApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deployApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deployApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async getAllApplicationsCreatedByUser(userId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_getAppsByUserId
        // GET /api/rainbow/applications/v1.0/users/:userId/applications
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllApplicationsCreatedByUser) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/users/" + userId + "/applications";

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllApplicationsCreatedByUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllApplicationsCreatedByUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllApplicationsCreatedByUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllApplicationsCreatedByUser) error : ", err);
                return reject(err);
            });
        });
    }

    async getApplicationDataById(appId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_getAppById
        // GET /api/rainbow/applications/v1.0/applications/:appId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getApplicationDataById) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + appId;
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getApplicationDataById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getApplicationDataById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getApplicationDataById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getApplicationDataById) error : ", err);
                if (err && err.code === 404) {
                    resolve(null);
                } else {
                    return reject(err);
                }
            });
        });
    }

    async getEmbedFrameForApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_getEmbedFrame
        // GET /api/rainbow/applications/v1.0/applications/:applicationId/embed-frame
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getEmbedFrameForApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/embed-frame";

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getEmbedFrameForApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmbedFrameForApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmbedFrameForApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmbedFrameForApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async getEmbeddingFrameForApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_getEmbeddingFrame
        // GET /api/rainbow/applications/v1.0/applications/:applicationId/embedding-frame
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getEmbeddingFrameForApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/embedding-frame";

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getEmbeddingFrameForApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmbeddingFrameForApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmbeddingFrameForApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmbeddingFrameForApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async renewExpiredApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_renewExpiredApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/renew
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(renewExpiredApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/renew";

            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(renewExpiredApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(renewExpiredApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(renewExpiredApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(renewExpiredApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async requestDeploymentOfApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_requestAppDeployment
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/request-deployment
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(requestDeploymentOfApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/request-deployment";

            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(requestDeploymentOfApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(requestDeploymentOfApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(requestDeploymentOfApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(requestDeploymentOfApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async restartApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_restartApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/restart
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(restartApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/restart";

            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(restartApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(restartApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(restartApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(restartApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async stopApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_stopApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/stop
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(stopApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/stop";

            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(stopApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(stopApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(stopApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(stopApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async unblockApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_unblockApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/unblock
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unblockApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/unblock";

            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unblockApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unblockApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unblockApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unblockApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async updateApplication(applicationId: string, applicationData: object) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_updateApp
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId;

            that.http.put(url, that.getRequestHeader(), applicationData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async getCountersForApplication(applicationId: string) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_getAppCounters
        // GET /api/rainbow/applications/v1.0/applications/:applicationId/counters
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCountersForApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/counters";

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCountersForApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCountersForApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCountersForApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCountersForApplication) error : ", err);
                return reject(err);
            });
        });
    }

    async updateCounterForApplication(applicationId: string, counterData: object) {
        // API https://api.openrainbow.org/application/#api-applications-applications_applications_updateAppCounter
        // PUT /api/rainbow/applications/v1.0/applications/:applicationId/counters
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCounterForApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/applications/v1.0/applications/" + applicationId + "/counters";

            that.http.put(url, that.getRequestHeader(), counterData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCounterForApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCounterForApplication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCounterForApplication) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCounterForApplication) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Applications

}

module.exports = {'RESTApplications': RESTApplications};
export {RESTApplications as RESTApplications};
