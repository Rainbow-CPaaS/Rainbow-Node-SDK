'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/RVOICE - ";

/**
 * Handles all REST API calls related to Rainbow Voice (CLI options, Cloud PBX groups,
 * deskphones, personal routines, routing, settings, voice calls, voice forward, and hunting groups).
 */
@logEntryExit(LOG_ID)
class RESTRainbowVoice extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTRainbowVoice'; }
    getClassName() { return RESTRainbowVoice.getClassName(); }
    static getAccessorName() { return 'restrainbowvoice'; }
    getAccessorName() { return RESTRainbowVoice.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        this._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            this.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => { resolve(undefined); });
    }

    //region Rainbow Voice CLI Options

    retrieveAllAvailableCallLineIdentifications() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/cli-options";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllAvailableCallLineIdentifications) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllAvailableCallLineIdentifications) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllAvailableCallLineIdentifications) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllAvailableCallLineIdentifications) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllAvailableCallLineIdentifications) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveCurrentCallLineIdentification() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options/current
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/cli-options/current";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCurrentCallLineIdentification) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveCurrentCallLineIdentification) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCurrentCallLineIdentification) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveCurrentCallLineIdentification) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveCurrentCallLineIdentification) error : ", err);
                return reject(err);
            });
        });
    }

    setCurrentActiveCallLineIdentification(policy: string, phoneNumberId?: string) {
        // API https://api.openrainbow.org/voice/#api-CLI_Options-Set_CLI
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(setCurrentActiveCallLineIdentification) policy : ", policy + ", phoneNumberId : ", phoneNumberId);
            let data = {
                policy,
                phoneNumberId
            };

            that.http.put("/api/rainbow/voice/v1.0/cli-options", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCurrentActiveCallLineIdentification) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCurrentActiveCallLineIdentification) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCurrentActiveCallLineIdentification) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCurrentActiveCallLineIdentification) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice CLI Options

    //region Rainbow Voice Cloud PBX group

    addMemberToGroup(groupId: string, memberId: string, position: number, roles: [], status: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-add_user_to_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(addMemberToGroup) groupId : ", groupId + ", memberId : ", memberId + ", position : ", position + ", roles : ", roles + ", status : ", status);
            let data = {
                memberId,
                position,
                roles,
                status
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/members", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addMemberToGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addMemberToGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addMemberToGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addMemberToGroup) error : ", err);
                return reject(err);
            });
        });
    }

    deleteVoiceMessageAssociatedToAGroup(groupId: string, messageId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-DeleteGroupVoiceMessage
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/voice/v1.0/groups/" + groupId + "/messages/" + messageId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getVoiceMessagesAssociatedToGroup(groupId: string, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups/" + groupId + "/messages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate);
            addParamToUrl(urlParamsTab, "callerName", callerName);
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessagesAssociatedToGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getVoiceMessagesAssociatedToGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessagesAssociatedToGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getVoiceMessagesAssociatedToGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getVoiceMessagesAssociatedToGroup) error : ", err);
                return reject(err);
            });
        });
    }

    getGroupForwards(groupId: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/forwards
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetCloudPbxGroupForwards
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups/" + groupId + "/forwards";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getGroupForwards) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getGroupForwards) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getGroupForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getGroupForwards) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getGroupForwards) error : ", err);
                return reject(err);
            });
        });
    }

    getTheUserGroup(type: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Get_User_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getTheUserGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTheUserGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTheUserGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTheUserGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTheUserGroup) error : ", err);
                return reject(err);
            });
        });
    }

    joinAGroup(groupId: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/join
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinAGroup) groupId : ", groupId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/join", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    joinAllGroups() {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/join
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_all_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinAllGroups) .");
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/join", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinAllGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinAllGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinAllGroups) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinAllGroups) error : ", err);
                return reject(err);
            });
        });
    }

    leaveAGroup(groupId: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/leave
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(leaveAGroup) groupId : ", groupId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/leave", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(leaveAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(leaveAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(leaveAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    leaveAllGroups() {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/leave
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_all_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(leaveAllGroups) .");
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/leave", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(leaveAllGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(leaveAllGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(leaveAllGroups) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveAllGroups) error : ", err);
                return reject(err);
            });
        });
    }

    removeMemberFromGroup(groupId: string, memberId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members/:memberId
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-remove_user_from_group
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/voice/v1.0/groups/" + groupId + "/members/" + memberId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/messages-summary
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupsMessagesSummary
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups/messages-summary";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) error : ", err);
                return reject(err);
            });
        });
    }

    updateAGroup(groupId: string, externalNumberId: string, isEmptyAllowed: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroup
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) groupId : ", groupId, ", externalNumberId : ", externalNumberId, ", isEmptyAllowed : ", isEmptyAllowed);
            let data = {
                externalNumberId,
                isEmptyAllowed
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateAVoiceMessageAssociatedToAGroup(groupId: string, messageId: string, read: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-UpdateGroupVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) groupId : ", groupId + ", messageId : ", messageId);
            let data = {
                read
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/messages/" + messageId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAVoiceMessageAssociatedToAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAVoiceMessageAssociatedToAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupForward(groupId: string, callForwardType: string, destinationType: string, numberToForward: number, activate: boolean, noReplyDelay: number, managerIds: Array<string>, rvcpAutoAttendantId: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/forwards/:callForwardType
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroupForwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupForward) groupId : ", groupId + ", callForwardType : ", callForwardType);
            let data = {
                destinationType,
                "number": numberToForward,
                activate,
                noReplyDelay,
                managerIds,
                rvcpAutoAttendantId
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/forwards/" + callForwardType, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupForward) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupForward) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupForward) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupForward) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupMember(groupId: string, memberId: string, position: number, roles: Array<string>, status: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members/:memberId
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-update_member_inside_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupMember) groupId : ", groupId + ", memberId : ", memberId);
            let data = {
                position,
                roles,
                status
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/members/" + memberId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupMember) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupMember) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupMember) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupMember) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Cloud PBX group

    //region Rainbow Voice Deskphones

    activateDeactivateDND(activate: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/dnd
        // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Dnd_state
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(activateDeactivateDND) activate : ", activate);
            let data = undefined;
            that.http.put("/api/rainbow/voice/v1.0/deskphones/dnd?activate=" + activate, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activateDeactivateDND) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activateDeactivateDND) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activateDeactivateDND) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activateDeactivateDND) error : ", err);
                return reject(err);
            });
        });
    }

    configureAndActivateDeactivateForward(callForwardType: string, type: string, number: string, timeout: number, activated: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/forwards/:callForwardType
        // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Forward_state
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(configureAndActivateDeactivateForward) callForwardType : ", callForwardType);
            let data = {
                type,
                number,
                timeout,
                activated
            };
            that.http.put("/api/rainbow/voice/v1.0/deskphones/forwards/" + callForwardType, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(configureAndActivateDeactivateForward) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(configureAndActivateDeactivateForward) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(configureAndActivateDeactivateForward) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(configureAndActivateDeactivateForward) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveActiveForwards() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/forwards
        // API https://api.openrainbow.org/voice/#api-Deskphones-Get_active_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/deskphones/forwards";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveActiveForwards) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveActiveForwards) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveActiveForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveActiveForwards) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveActiveForwards) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveDNDState() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/dnd
        // API https://api.openrainbow.org/voice/#api-Deskphones-Get_Dnd_state
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/deskphones/dnd";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveDNDState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveDNDState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveDNDState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveDNDState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveDNDState) error : ", err);
                return reject(err);
            });
        });
    }

    searchUsersGroupsContactsByName(displayName: string, limit: number) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/searchbyname
        // API https://api.openrainbow.org/voice/#api-Deskphones-Search_by_name
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/deskphones/searchbyname";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "limit", limit);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchUsersGroupsContactsByName) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchUsersGroupsContactsByName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchUsersGroupsContactsByName) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchUsersGroupsContactsByName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchUsersGroupsContactsByName) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Deskphones

    //region Rainbow Voice Personal Routines

    activatePersonalRoutine(routineId: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId/activate
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Activate_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(activatePersonalRoutine) routineId : ", routineId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/personalroutines/" + routineId + "/activate", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activatePersonalRoutine) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activatePersonalRoutine) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activatePersonalRoutine) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activatePersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    createCustomPersonalRoutine(name: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Create_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createCustomPersonalRoutine) name : ", name);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/personalroutines", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCustomPersonalRoutine) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCustomPersonalRoutine) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCustomPersonalRoutine) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCustomPersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCustomPersonalRoutine(routineId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Delete_PersonalRoutine
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/personalroutines/" + routineId;
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomPersonalRoutine) (" + routineId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCustomPersonalRoutine) (" + routineId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCustomPersonalRoutine) (" + routineId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getPersonalRoutineData(routineId: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/personalroutines/" + routineId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getPersonalRoutineData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getPersonalRoutineData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getPersonalRoutineData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPersonalRoutineData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPersonalRoutines(userId) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutines
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/personalroutines?userId=" + userId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPersonalRoutines) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPersonalRoutines) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPersonalRoutines) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPersonalRoutines) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPersonalRoutines) error : ", err);
                return reject(err);
            });
        });
    }

    updatePersonalRoutineData(routineId: string, dndPresence: boolean, name: string, presence: { manage: boolean, value: string }, deviceMode: { manage: boolean, mode: string }, immediateCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, busyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, noreplyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string, noReplyDelay: number }, huntingGroups: { withdrawAll: boolean }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Update_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updatePersonalRoutineData) routineId : ", routineId + ", name : ", name);
            let data = {
                dndPresence,
                name,
                presence,
                deviceMode,
                immediateCallForward,
                busyCallForward,
                noreplyCallForward,
                huntingGroups
            };
            that.http.put("/api/rainbow/voice/v1.0/personalroutines/" + routineId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePersonalRoutineData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updatePersonalRoutineData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updatePersonalRoutineData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updatePersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Personal Routines

    //region Rainbow Voice Routing

    manageUserRoutingData(destinations: Array<string>, currentDeviceId: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/routing
        // API https://api.openrainbow.org/voice/#api-Routing-Set_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(manageUserRoutingData) destinations : ", destinations + ", currentDeviceId : ", currentDeviceId);
            let data = {
                destinations,
                currentDeviceId
            };
            that.http.put("/api/rainbow/voice/v1.0/routing", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(manageUserRoutingData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(manageUserRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(manageUserRoutingData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(manageUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrievetransferRoutingData(calleeId: string, addresseeId?: string, addresseePhoneNumber?: string) {
        // GET    https://openrainbow.com/api/rainbow/voice/v1.0/transfer-routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Transfer_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/transfer-routing";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "calleeId", calleeId);
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId);
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrievetransferRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrievetransferRoutingData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrievetransferRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrievetransferRoutingData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrievetransferRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserRoutingData() {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/routing";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveUserRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveUserRoutingData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveUserRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveUserRoutingData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Routing

    //region Rainbow Voice Settings

    retrieveVoiceUserSettings() {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/settings
        // API https://api.openrainbow.org/voice/#api-Settings-Get_settings
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/settings";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveVoiceUserSettings) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveVoiceUserSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveVoiceUserSettings) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveVoiceUserSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveVoiceUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Settings

    //region Rainbow Voice Voice

    addParticipant3PCC(callId: string, callData: { callee: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/participants
        // API https://api.openrainbow.org/voice/#api-Voice-Add_participant
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(addParticipant3PCC) callId : ", callId, ", callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addParticipant3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addParticipant3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addParticipant3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addParticipant3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    answerCall3PCC(callId: string, callData: { legId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/answer
        // API https://api.openrainbow.org/voice/#api-Voice-Answer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(answerCall3PCC) callId : ", callId, ", callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(answerCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(answerCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(answerCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(answerCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    blindTransferCall3PCC(callId: string, callData: { destination: { userId: string, resource: string } }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/blind-transfer
        // API https://api.openrainbow.org/voice/#api-Voice-Blind_Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(blindTransferCall3PCC) callId : ", callId, ", callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(blindTransferCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(blindTransferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(blindTransferCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(blindTransferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deflectCall3PCC(callId: string, callData: { destination: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/deflect
        // API https://api.openrainbow.org/voice/#api-Voice-Deflect_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(deflectCall3PCC) callId : ", callId, ", callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/deflect", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deflectCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deflectCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deflectCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deflectCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    holdCall3PCC(callId: string, callData: { legId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/hold
        // API https://api.openrainbow.org/voice/#api-Voice-Hold_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(holdCall3PCC) callId : ", callId, ", callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/hold", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(holdCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(holdCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(holdCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(holdCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    makeCall3PCC(callData: {
        deviceId: string,
        callerAutoAnswer: boolean,
        anonymous: boolean,
        calleeExtNumber: string,
        calleePbxId: string,
        calleeShortNumber: string,
        calleeCountry: string,
        dialPadCalleeNumber: string
    }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls
        // API https://api.openrainbow.org/voice/#api-Voice-Make_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(makeCall3PCC) callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(makeCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(makeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(makeCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(makeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    mergeCall3PCC(activeCallId: string, callData: { heldCallId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/merge
        // API https://api.openrainbow.org/voice/#api-Voice-Merge_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(mergeCall3PCC) activeCallId : ", activeCallId);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/merge", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(mergeCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(mergeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(mergeCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(mergeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    pickupCall3PCC(callData: {
        deviceId: string,
        callerAutoAnswer: boolean,
        calleeShortNumber: string
    }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/pickup
        // API https://api.openrainbow.org/voice/#api-Voice-Pickup_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(pickupCall3PCC) callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/pickup", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(pickupCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(pickupCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(pickupCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(pickupCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    releaseCall3PCC(callId: string, legId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId
        // API https://api.openrainbow.org/voice/#api-Voice-Release_call
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/calls/" + callId;
            url += legId ? "?legId=" + legId : "";
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(releaseCall3PCC) (" + callId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    retrieveCall3PCC(callId: string, callData: { legId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/retrieve
        // API https://api.openrainbow.org/voice/#api-Voice-Retrieve_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCall3PCC) callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/retrieve", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    sendDTMF3PCC(callId: string, callData: { legId: string, digits: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/senddtmf
        // API https://api.openrainbow.org/voice/#api-Voice-Send_DTMF
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(sendDTMF3PCC) callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/senddtmf", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendDTMF3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendDTMF3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendDTMF3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendDTMF3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    snapshot3PCC(callId: string, deviceId: string, seqNum: number) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/snapshot
        // API https://api.openrainbow.org/voice/#api-Voice-SnapshotCall
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/snapshot";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "callId", callId + "");
            addParamToUrl(urlParamsTab, "deviceId", deviceId + "");
            addParamToUrl(urlParamsTab, "seqNum", seqNum + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(snapshot3PCC) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(snapshot3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(snapshot3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(snapshot3PCC) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(snapshot3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    transferCall3PCC(activeCallId: string, callData: { heldCallId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/transfer
        // API https://api.openrainbow.org/voice/#api-Voice-Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(transferCall3PCC) callData : ", callData);
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/transfer", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(transferCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(transferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(transferCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(transferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAVoiceMessage(messageId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessage
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages/" + messageId;
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteAVoiceMessage) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    deleteAllVoiceMessages(messageId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessages
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages";
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteAllVoiceMessages) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getEmergencyNumbersAndEmergencyOptions() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/emergency-numbers
        // API https://api.openrainbow.org/voice/#api-Voice-EmergencyNumbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/emergency-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getVoiceMessages(limit: number, offset: number, sortField: string, sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-GetVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/messages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate);
            addParamToUrl(urlParamsTab, "callerName", callerName);
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getVoiceMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessages) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getVoiceMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }

    getUserDevices() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/devices
        // API https://api.openrainbow.org/voice/#api-Voice-Devices
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/devices";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getUserDevices) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getUserDevices) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserDevices) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getUserDevices) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserDevices) error : ", err);
                return reject(err);
            });
        });
    }

    updateVoiceMessage(messageId: string, urlData: { read: boolean }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Voice-UpdateVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateVoiceMessage) messageId : ", messageId + ", urlData : ", urlData);
            that.http.put("/api/rainbow/voice/v1.0/messages/" + messageId, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateVoiceMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateVoiceMessage) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateVoiceMessage) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateVoiceMessage) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Voice

    //region Rainbow Voice Voice Forward

    forwardCall(callForwardType: string, userId: string, urlData: { destinationType: string, number: string, activate: boolean, noReplyDelay: number }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards/:callForwardType
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Forward_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(forwardCall) callForwardType : ", callForwardType + ", urlData : ", urlData);
            let url: string = "/api/rainbow/voice/v1.0/forwards/" + callForwardType;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "userId ", userId + "");
            url = urlParamsTab[0];
            that.http.put(url, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(forwardCall) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(forwardCall) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(forwardCall) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(forwardCall) error : ", err);
                return reject(err);
            });
        });
    }

    getASubscriberForwards(userId: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Get_Subscriber_call_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getASubscriberForwards) userId : ", userId);
            let url: string = "/api/rainbow/voice/v1.0/forwards";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "userId ", userId + "");
            url = urlParamsTab[0];
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getASubscriberForwards) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getASubscriberForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getASubscriberForwards) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getASubscriberForwards) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Voice Forward

    //region Rainbow Voice Voice Search Hunting Groups

    searchCloudPBXhuntingGroups(name: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/search/huntinggroups
        // API https://api.openrainbow.org/voice/#api-Voice_Search_Hunting_Groups-Get_Cloud_PBX_Hunting_Groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchCloudPBXhuntingGroups) name : ", name);
            let url: string = "/api/rainbow/voice/v1.0/search/huntinggroups";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "name", name + "");
            url = urlParamsTab[0];
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(searchCloudPBXhuntingGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchCloudPBXhuntingGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchCloudPBXhuntingGroups) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchCloudPBXhuntingGroups) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Voice Search Hunting Groups
}

export {RESTRainbowVoice};
