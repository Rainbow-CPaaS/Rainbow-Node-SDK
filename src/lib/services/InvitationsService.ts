"use strict";
import {FavoritesService} from "./FavoritesService";

export {};

import * as PubSub from "pubsub-js";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import EventEmitter = NodeJS.EventEmitter;
import {InvitationEventHandler} from "../connection/XMPPServiceHandler/invitationEventHandler";
import {isStarted, logEntryExit} from "../common/Utils";
import {Invitation} from "../common/models/Invitation";
import * as moment from 'moment';
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {S2SService} from "../connection/S2S/S2SService";
import {Core} from "../Core";

const LOG_ID = "INVITATION/SVCE - ";

/**
 * @module
 * @name InvitationsService
 * @version SDKVERSION
 * @public
 * @description
 *      This services manages the invitations received/ sent from/to server.
 *
 */
@logEntryExit(LOG_ID)
@isStarted([])
class InvitationsService {
	receivedInvitations: {};
	sentInvitations: {};
	acceptedInvitationsArray: any[];
	sentInvitationsArray: any[];
	receivedInvitationsArray: any[];
	private _listeners: any[];
	private _portalURL: string;
	private _contactConfigRef: any;
	acceptedInvitations: {};
	private _logger: Logger;
	private _xmpp: XMPPService;
	private _rest: RESTService;
	private _options: any;
	private _s2s: S2SService;
	private _useXMPP: any;
	private _useS2S: any;
	private started: boolean = false;
	private _eventEmitter: EventEmitter;
	private _invitationEventHandler: InvitationEventHandler;
	private _invitationHandlerToken: any;
	private _contacts: any;
	private stats: any;
	private readonly _startConfig: {
		start_up:boolean,
		optional:boolean
	};
	public ready: boolean = false;
	get startConfig(): { start_up: boolean; optional: boolean } {
		return this._startConfig;
	}

	constructor(_eventEmitter: EventEmitter, _logger: Logger, _startConfig: { start_up: boolean; optional: boolean }) {//$q, $log, $http, $rootScope, authService, Invitation, contactService, xmppService, errorHelperService, settingsService) {
		let that = this;
		this._startConfig = _startConfig;
		this._xmpp = null;
		this._rest = null;
		this._s2s = null;
		this._options = {};
		this._useXMPP = false;
		this._useS2S = false;
		this._eventEmitter = _eventEmitter;
		this._logger = _logger;
		this.started = false;

		//update the sentInvitations list when new invitation is accepted
		// DONE : VBR that._listeners.push($rootScope.$on("ON_ROSTER_CHANGED_EVENT", that.getAllSentInvitations));
		this._eventEmitter.on("evt_internal_onrosters", that.onRosterChanged.bind(this));
		this._eventEmitter.on("evt_internal_invitationsManagementUpdate", that.onInvitationsManagementUpdate.bind(this));
	}

	/************************************************************/
	/** LIFECYCLE STUFF                                        **/

	/************************************************************/
	async start(_options, _core : Core, stats) { // , _xmpp: XMPPService, _s2s : S2SService, _rest: RESTService, _contacts : ContactsService, stats
		let that = this;
		that._logger.log("info", LOG_ID + "");
		that._logger.log("info", LOG_ID + "[InvitationService] === STARTING ===");
		that.stats = stats ? stats : [];

		that._xmpp = _core._xmpp;
		that._rest = _core._rest;
		that._options = _options;
		that._s2s = _core._s2s;
		that._useXMPP = that._options.useXMPP;
		that._useS2S = that._options.useS2S;
		that._contacts = _core.contacts;

		let startDate: any = new Date();
		// Private invitation storage
		that.receivedInvitations = {};
		that.sentInvitations = {};

		// Public invitation storage
		that.acceptedInvitationsArray = [];
		that.sentInvitationsArray = [];
		that.receivedInvitationsArray = [];
		that._listeners = [];

		//that._portalURL = config.restServerUrl + "/api/rainbow/enduser/v1.0/users/";

		that.attachHandlers();

		let now: any = new Date();
		let startDuration = Math.round(now - startDate);
		stats.push({service: "InvitationService", startDuration: startDuration});
		that._logger.log("info", LOG_ID + "[InvitationService] === STARTED (" + startDuration + " ms) ===");

		this.started = true;
		this.ready = true;
	};

	public async init () {
		let that = this;
		await that.getAllSentInvitations();
		await that.getAllReceivedInvitations();

	}

	async stop() {
		let that = this;
		that._logger.log("info", LOG_ID + "");
		that._logger.log("info", LOG_ID + "[InvitationService] === STOPPING ===");

		// Remove _listeners
		let listener;
		if (that._listeners) {
			while ((listener = that._listeners.pop())) {
				listener();
			}
		}

		that._logger.log("info", LOG_ID + "[InvitationService] === STOPPED ===");
		that.started = false;
		this.ready = false;
	};


	/************************************************************/
	/** EVENT HANDLING STUFF                                   **/

	/************************************************************/
	attachHandlers() {
		let that = this;
		that._logger.log("info", LOG_ID + "[InvitationService] attachHandlers");
		/* TODO : VBR
		if (that._contactConfigRef) {
			that._xmpp.connection.deleteHandler(that._contactConfigRef);
			that._contactConfigRef = null;
		}
		// */
		//that._contactConfigRef = that._xmpp.connection.addHandler(that.onInvitationsUpdate, null, "message", "management");

		that._invitationEventHandler = new InvitationEventHandler(that._xmpp, that);
		that._invitationHandlerToken = [
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_WEBRTC, that.conversationEventHandler.onWebRTCMessageReceived),
			PubSub.subscribe(that._xmpp.hash + "." + that._invitationEventHandler.MESSAGE_MANAGEMENT, that._invitationEventHandler.onManagementMessageReceived),
			PubSub.subscribe(that._xmpp.hash + "." + that._invitationEventHandler.MESSAGE_ERROR, that._invitationEventHandler.onErrorMessageReceived),
			//PubSub.subscribe( that._xmpp.hash + "." + that._invitationEventHandler.MESSAGE_HEADLINE, that._invitationEventHandler.onHeadlineMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onCloseMessageReceived)
		];
	};

	onRosterChanged() {
		let that = this;
		that._logger.log("info", LOG_ID + "onRosterChanged");
		return that.getAllSentInvitations();
	}

	async onInvitationsManagementUpdate(userInvite) {
		let that = this;
        that._logger.log("internal", LOG_ID + "(onInvitationsUpdate) userInvite : ", userInvite);
		//let userInviteElem = stanza.find("userinvite");
		if (userInvite) {
			let id = userInvite.id;
			let type = userInvite.type;
			let action = userInvite.action;
			switch (type) {
				case "received":
                    that._logger.log("internal", LOG_ID + "(onInvitationsUpdate) received");
					await that.handleReceivedInvitation(id, action);
                    that._logger.log("internal", LOG_ID + "(onInvitationsUpdate) received after");
					break;
				case "sent":
                    that._logger.log("internal", LOG_ID + "(onInvitationsUpdate) sent");
					await that.handleSentInvitation(id, action);
                    that._logger.log("internal", LOG_ID + "(onInvitationsUpdate) sent after");
					break;
				default:
					that._logger.log("warn", LOG_ID + "(onInvitationsUpdate) - received unexpected type - " + type);
					break;
			}
		} else {
			that._logger.log("warn", LOG_ID + "(onInvitationsUpdate) userInvite undefined!");
		}
        that._logger.log("info", LOG_ID + "(onInvitationsUpdate) that.receivedInvitations : ", that.receivedInvitations);
        that._logger.log("info", LOG_ID + "(onInvitationsUpdate) that.acceptedInvitationsArray : ", that.acceptedInvitationsArray);
        that._logger.log("info", LOG_ID + "(onInvitationsUpdate) that.sentInvitations : ", that.sentInvitations);
		return true;
	};

	async handleReceivedInvitation(id, action) {
		let that = this;
		that._logger.log("info", LOG_ID + "(handleReceivedInvitation).");
		that._logger.log("info", LOG_ID + "(handleReceivedInvitation) : ", id, ", action : ", action);

		// Handle deletion action
		if (action === "delete") {
			delete that.receivedInvitations[id];
			that.updateReceivedInvitationsArray();
			// Hanle other actions
		} else {
			await that.getServerInvitation(id).then((invitation: any) => {
				that._logger.log("info", LOG_ID + "(handleReceivedInvitation) invitation received from server : ", invitation);
				let updateInvitation = null;
				let status = "none";

				if (action === "create") {
					that._logger.log("debug", LOG_ID + "(handleReceivedInvitation) user invite create received");
					that._eventEmitter.emit("evt_internal_userinvitereceived", invitation);
				}

				switch (invitation.status) {
					case "pending":
						that.receivedInvitations[invitation.id] = invitation;
						updateInvitation = invitation;
						status = "ask";
						break;
					case "accepted":
					case "auto-accepted":
						that.receivedInvitations[invitation.id] = invitation;
						//that._logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite accepted");
						//that._eventEmitter.emit("evt_internal_userinviteaccepted", invitation);
						// TODO : VBR : DONE $rootScope.$broadcast("ON_INVITATION_ACCEPTED", invitation.invitingUserId); // evt_internal_userinviteaccepted
						if (invitation.invitingUserId) {
							that._contacts.getContactById(invitation.invitingUserId, true).then(function (contact) {
								// TODO : VBR $rootScope.$broadcast("ON_CONTACT_UPDATED_EVENT", contact);
							});
						}

						//$rootScope.$broadcast("ON_INVITATION_EMAIL_RECEIVED", invitation);
						break;
					case "canceled":
						//that._logger.log("debug", LOG_ID + "(handleReceivedInvitation) user invite canceled");
						//that._eventEmitter.emit("evt_internal_userinvitecanceled", {invitationId: id, invitation});
						break;
					default:
						delete that.receivedInvitations[invitation.id];
						status = "unknown";
						break;
				}

				if (invitation.invitingUserId) {
					that.updateContactInvitationStatus(invitation.invitingUserId, status, updateInvitation).then(function () {
							that.updateReceivedInvitationsArray();
						});
				} else {
					that.updateReceivedInvitationsArray();
				}

				// Needed for SDK
				// TODO : VBR : DONE $rootScope.$broadcast("ON_INVITATION_CHANGED", invitation);
			});
		}
	};

	handleSentInvitation(id, action) {
		let that = this;
		return new Promise(function (resolve) {
			that._logger.log("info", LOG_ID + "(handleSentInvitation) id : ", id, ", action : ", action);

			// Handle deletion action
			if (action === "delete") {
				delete that.sentInvitations[id];
				that.updateReceivedInvitationsArray();
				resolve();
			}

			// Handle other actions
			else {
				that.getServerInvitation(id).then(function (invitation: any) {
                    that._logger.log("info", LOG_ID + "(handleSentInvitation) invitation received from server : ", invitation);
						let contactStatus = null;

						switch (invitation.status) {
							case "pending":
								that.sentInvitations[invitation.id] = invitation;
								contactStatus = "wait";
								break;
							case "accepted":
							case "auto-accepted":
								that._logger.log("debug", LOG_ID + "(handleSentInvitation) user invite accepted");
								that._eventEmitter.emit("evt_internal_userinviteaccepted",  invitation);
								// TODO : VBR $rootScope.$broadcast("ON_INVITATION_ACCEPTED", invitation.invitedUserId); // evt_internal_userinviteaccepted
								if (invitation.invitedUserId) {
									that._contacts.getContactById(invitation.invitedUserId, true).then(function (contact) {
										// TODO : VBR $rootScope.$broadcast("ON_CONTACT_UPDATED_EVENT", contact);
									});
								}
								break;
							case "canceled":
								that._logger.log("debug", LOG_ID + "(handleSentInvitation) user invite canceled");
								that._eventEmitter.emit("evt_internal_userinvitecanceled", invitation);
								break;

							default:
								delete that.sentInvitations[invitation.id];
								contactStatus = "unknown";
								break;
						}

						if (invitation.invitedUserId) {
							that.updateContactInvitationStatus(invitation.invitedUserId, contactStatus, invitation)
								.then(function () {
									that.updateSentInvitationsArray();
									resolve();
								});
						} else {
							that.updateSentInvitationsArray();
							resolve();
						}
					});

				if (action === "resend") {
					// TODO : VBR : DONE $rootScope.$broadcast("ON_INVITATIONS_RE_SEND", id);
				}
			}
		});
	};

	updateReceivedInvitationsArray() {
		let that = this;
		// Handle received invitations
		that.receivedInvitationsArray = [];
		that.acceptedInvitationsArray = [];
		for (let key in that.receivedInvitations) {
			if (that.receivedInvitations.hasOwnProperty(key)) {
				let invitation = that.receivedInvitations[key];
				switch (invitation.status) {
					case "pending":
						that.receivedInvitationsArray.push(invitation);
						break;
					case "accepted":
					case "auto-accepted":
						that.acceptedInvitationsArray.push(invitation);
						break;
					default:
						break;
				}
			}
		}

		// Handle received invitations
		that.receivedInvitationsArray.sort(that.sortInvitationArray);

		// Handle accepted invitations
		that.acceptedInvitationsArray = that.acceptedInvitationsArray.filter(function (acceptedInvitation) {
			let lastInvite = moment(acceptedInvitation.lastNotificationDate);
			let duration = moment.duration(moment().diff(lastInvite));
			let hours = duration.asHours();
			return hours < 168; // 168 hours = 1 week :)
		});

		that.acceptedInvitationsArray.sort(that.sortInvitationArray);

		// TODO : VBR $rootScope.$broadcast("ON_INVITATIONS_NUMBER_UPDATED");
	};

	updateSentInvitationsArray() {
		let that = this;
		that.sentInvitationsArray = [];
		for (let key in that.sentInvitations) {
			if (that.sentInvitations.hasOwnProperty(key)) {
				that.sentInvitationsArray.push(that.sentInvitations[key]);
			}
		}
		that.sentInvitationsArray.sort(that.sortInvitationArray);
		// TODO : VBR $rootScope.$broadcast("ON_INVITATIONS_NUMBER_UPDATED");
	};

	getServerInvitation(invitationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._rest.getServerInvitation(invitationId).then(
                (response: any) => {
                    that._logger.log("info", LOG_ID + "(getServerInvitation) success");
                    that._logger.log("internal", LOG_ID + "(getServerInvitation) success : ", response);
                    let receivedInvitation = Invitation.createFromData(response.data);
                    resolve(receivedInvitation);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getServerInvitation) error.");
                    that._logger.log("internalerror", LOG_ID + "(getServerInvitation) error : ", err);
                    reject(err);
                });
        });
    };


	/************************************************************/
	/** PUBLIC METHODS                                         **/

	/************************************************************/

	/**
	 * @public
	 * @since 1.65
	 * @method getReceivedInvitations
	 * @instance
	 * @description
	 *    Get the invite received coming from Rainbow users
	 * @return {Invitation[]} The list of invitations received
	 */
	getReceivedInvitations() {
		let that = this;
		return that.receivedInvitationsArray;
	};

	/**
	 * @public
	 * @since 1.65
	 * @method 	getAcceptedInvitations
	 * @instance
	 * @description
	 *    Get the invites you accepted received from others Rainbow users
	 * @return {Invitation[]} The list of invite sent
	 */
	getAcceptedInvitations() {
		let that = this;
		return that.acceptedInvitationsArray;
	};

	/**
	 * @public
	 * @since 1.65
	 * @method getSentInvitations
	 * @instance
	 * @description
	 *    Get the invites sent to others Rainbow users
	 * @return {Invitation[]} The list of invite sent
	 */
	getSentInvitations() {
		let that = this;
		return that.sentInvitationsArray;
	};

	/**
	 * @public
	 * @since 1.65
	 * @method getInvitationsNumberForCounter
	 * @instance
	 * @description
	 *    Get the number of invitations received from others Rainbow users
	 * @return {Invitation[]} The list of invite sent
	 */
	getInvitationsNumberForCounter() {
		let that = this;
		return that.receivedInvitationsArray.length;
	};

	/**
	 * @public
	 * @since 1.65
	 * @method getAllInvitationsNumber
	 * @instance
	 * @description
	 *    Get the number of invitations sent/received to/from others Rainbow users
	 * @return {Invitation[]} The list of invite sent
	 */
	getAllInvitationsNumber = function () {
		let that = this;
		return that.receivedInvitationsArray.length + that.sentInvitationsArray.length + that.acceptedInvitationsArray.length;
	};

	// Getter method

	/**
	 * @public
	 * @since 1.65
	 * @method getInvitation
	 * @instance
	 * @description
	 *    Get an invite by its id
	 * @param {String} invitationId the id of the invite to retrieve
	 * @return {Invitation} The invite if found
	 */
	getInvitation(invitationId) {
		let that = this;
        that._logger.log("info", LOG_ID + "(getInvitation) that.receivedInvitations : ", that.receivedInvitations);
        that._logger.log("info", LOG_ID + "(getInvitation) that.acceptedInvitationsArray : ", that.acceptedInvitationsArray);
        that._logger.log("info", LOG_ID + "(getInvitation) that.sentInvitations : ", that.sentInvitations);

        let invitationFound = that.receivedInvitations[invitationId];
		if (!invitationFound) {
			invitationFound = that.acceptedInvitationsArray[invitationId];
		}
		if (!invitationFound) {
			invitationFound = that.sentInvitations[invitationId];
		}
        /*if (!invitationFound) {
            that._rest.getInvitationById(data.invitationId).then((invitation : any) => {
                    that._logger.log("debug", LOG_ID + "(_onUserInviteCanceled) invitation canceled id", invitation.id);

                    that._eventEmitter.emit("evt_internal_userinvitecanceled", invitation);
                }, err => {
                    that._logger.log("warn", LOG_ID + "(_onUserInviteCanceled) no invitation found for " + data.invitationId);
                });
        } // */
		return invitationFound;
	};


	// Sender methods

	/**
	 * @public
	 * @since 1.65
	 * @method joinContactInvitation
	 * @instance
	 * @description
	 *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	 *    Once accepted, the user will be part of your network. <br>
	 *    Return a promise
	 * @param {Contact} contact The invitation to accept
	 * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
	 */
	joinContactInvitation(contact) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._logger.log("info", LOG_ID + "(joinContactInvitation) contact (" + contact.jid + ")");
			return that._rest.joinContactInvitation(contact).then(
				async function success(data) {
					that._logger.log("info", LOG_ID + "(joinContactInvitation) - success (" + contact.jid + ")");
					if (contact.status === "unknown") {
						await that.updateContactInvitationStatus(contact.id, "wait", null);
					}
					resolve(data);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(joinContactInvitation) error ");
					that._logger.log("internalerror", LOG_ID + "(joinContactInvitation) error : ", err);
					reject(err);				});
		});
	};

	/**
	 * @public
	 * @since 1.65
	 * @method sendInvitationByEmail
	 * @instance
	 * @description
	 *    Send an invitation email as UCaaS
	 * @param {string} email The email
	 * @param {string} [customMessage] The email text (optional)
	 * @return {Object} A promise that contains the contact added or an object describing an error
	 */
	sendInvitationByEmail(email, lang, customMessage) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._logger.log("info", LOG_ID + "sendInvitationByEmail");
			return that._rest.sendInvitationByEmail(email, lang, customMessage ).then(
				function success(data) {
					that._logger.log("info", LOG_ID + "[InvitationService] sendInvitationByEmail - success");
					resolve(data);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(joinContactInvitation) error ");
					that._logger.log("internalerror", LOG_ID + "(joinContactInvitation) error : ", err);
					reject(err);
				});
		});
	};

	/**
	 * @public
	 * @since 1.65
	 * @method cancelOneSendInvitation
	 * @instance
	 * @param {Invitation} invitation The invitation to cancel
	 * @description
	 *    Cancel an invitation sent
	 * @return {Object} The SDK Ok object or an error
	 */
	cancelOneSendInvitation(invitation) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._rest.cancelOneSendInvitation(invitation).then(
				function success(data) {
					that._logger.log("info", LOG_ID + "(cancelOneSendInvitation) success");
					that._logger.log("internal", LOG_ID + "(cancelOneSendInvitation) success : ", data);
					resolve(data);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(cancelOneSendInvitation) error ");
					that._logger.log("internalerror", LOG_ID + "(cancelOneSendInvitation) error : ", err);
					reject(err);
				});
		});
	};

	/**
	 * @public
	 * @since 1.65
	 * @method reSendInvitation
	 * @instance
	 * @param {Number} invitationId The invitation to re send
	 * @description
	 *    Re send an invitation sent
	 * @return {Object} The SDK Ok object or an error
	 */
	reSendInvitation(invitationId) {
		let that = this;
		return new Promise(function (resolve, reject) {
		that._rest.reSendInvitation(invitationId).then(
				function success() {
					that._logger.log("info", LOG_ID + "[InvitationService] reSendInvitation " + invitationId + " - success");
					resolve();
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(reSendInvitation) error ");
					that._logger.log("internalerror", LOG_ID + "(reSendInvitation) error : ", err);
					reject(err);
				});
		});
	};

	/**
	 * @public
	 * @since 1.65
	 * @method sendInvitationByEmail
	 * @instance
	 * @description
	 *    Send invitations for a list of emails as UCaaS
	 *    LIMITED TO 100 invitations
	 * @param {Array} listOfMails The list of emails
	 * @return {Object} A promise that the invite result or an object describing an error
	 */
	sendInvitationsParBulk(listOfMails) {
		let that = this;

		if (!listOfMails.length || listOfMails.length > 100) {
			that._logger.log("error", LOG_ID + "[InvitationService] sendInvitationsParBulk mail list length not correct");
			return Promise.reject();
		}

		return new Promise(function (resolve, reject) {
			that._rest.sendInvitationsParBulk(listOfMails).then(
				function success(data) {
					that._logger.log("info", LOG_ID + "[InvitationService] sendInvitationsParBulk - success");
					resolve(data);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(reSendInvitation) error ");
					that._logger.log("internalerror", LOG_ID + "(reSendInvitation) error : ", err);
					reject(err);
				});
		});
	};

	// Invited methods

	/**
	 * @public
	 * @since 1.65
	 * @method acceptInvitation
	 * @instance
	 * @description
	 *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	 *    Once accepted, the user will be part of your network. <br>
	 *    Return a promise
	 * @param {Invitation} invitation The invitation to accept
	 * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
	 */
	acceptInvitation(invitation) {
		let that = this;
		if (!invitation) {
			let error = ErrorManager.getErrorManager().BAD_REQUEST;
			error.msg += ", invitation not defined, can not acceptInvitation";
			return Promise.reject(error);
		}
		return new Promise(function (resolve, reject) {
			that._rest.acceptInvitation(invitation).then(
				function success(data) {
					that._logger.log("info", LOG_ID + "(acceptInvitation) success");
					that._logger.log("internal", LOG_ID + "(acceptInvitation) success : ", data);
					resolve(data);
				},
				function failure(err) {
					//let error = errorHelperService.handleError(err);
					if (err.errorDetailsCode && err.errorDetailsCode === 409605) {
						that._contacts.getContactById(invitation.invitingUserId, true)
							.then(function (contact) {
								// TODO : VBR $rootScope.$broadcast("ON_CONTACT_UPDATED_EVENT", contact);
								reject(err);
							});
					} else {
						that._logger.log("error", LOG_ID + "(acceptInvitation) error ");
						that._logger.log("internalerror", LOG_ID + "(acceptInvitation) error : ", err);
						reject(err);
					}
				});
		});
	};

	/**
	 * @public
	 * @since 1.65
	 * @method declineInvitation
	 * @instance
	 * @description
	 *    Decline an invitation from an other Rainbow user to mutually join the network <br>
	 *    Once declined, the user will not be part of your network. <br>
	 *    Return a promise
	 * @param {Invitation} invitation The invitation to decline
	 * @return {Object} A promise that contains SDK.OK in case of success or an object that describes the error
	 */
	declineInvitation(invitation) {
		let that = this;
		if (!invitation) {
			let error = ErrorManager.getErrorManager().BAD_REQUEST;
			error.msg += ", invitation not defined, can not declineInvitation";
			return Promise.reject(error);
		}
		return new Promise(function (resolve, reject) {
			that._rest.declineInvitation(invitation).then(
				function success(data) {
					that._logger.log("info", LOG_ID + "(declineInvitation) success");
					that._logger.log("internal", LOG_ID + "(declineInvitation) success : ", data);
					resolve(data);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(declineInvitation) error ");
					that._logger.log("internalerror", LOG_ID + "(declineInvitation) error : ", err);
					reject(err);
				});
		});
	};


	/************************************************************/
	/** PRIVATE METHODS                                        **/

	/************************************************************/
	/**
	 * @private
	 */
	updateContactInvitationStatus(contactDBId, status, invitation) {
		let that = this;
		return new Promise(function (resolve) {
			that._contacts.getContactById(contactDBId).then(function (contact) {
				switch (status) {
					case "ask":
						contact.status = "unknown";
						contact.ask = "ask";
						contact.invitation = invitation;
						break;
					case "wait":
						contact.status = "wait";
						contact.ask = "subscribe";
						contact.invitation = invitation;
						break;
					default:
						contact.ask = "none";
						contact.invitation = null;
						break;
				}
				// contact.updateRichStatus();
				resolve();
			});
		});
	};

	/**
	 * @private
	 */
	sortInvitationArray(invitA, invitB) {
		let invitBlastNotificationDate : any = new Date(invitB.lastNotificationDate);
		let invitAlastNotificationDate : any = new Date(invitA.lastNotificationDate);
		return  invitBlastNotificationDate - invitAlastNotificationDate ;
	};

	/**
	 * @private
	 */
	getAllReceivedInvitations() {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._rest.getAllReceivedInvitations().then(
				function success(response : any) {
					let invitationsData : any = response.data;
					that._logger.log("info", LOG_ID + "(getAllReceivedInvitations) success (find " + invitationsData.length + " invitations)");

					that.receivedInvitations = {};
					that.acceptedInvitations = {};

					invitationsData.forEach(async function (invitationData) {
						if (invitationData.status === "pending" && invitationData.type !== "registration") {
							let invitation = Invitation.createFromData(invitationData);
							that.receivedInvitations[invitationData.id] = invitation;
							if (invitationData.invitingUserId) {
								await that.updateContactInvitationStatus(invitationData.invitingUserId, "ask", invitation);
							}
						} else if (invitationData.status === "accepted" || invitationData.status === "auto-accepted") {
							that.receivedInvitations[invitationData.id] = Invitation.createFromData(invitationData);
						}
					});
					that.updateReceivedInvitationsArray();
					resolve(that.receivedInvitations);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(getAllReceivedInvitations) error ");
					that._logger.log("internalerror", LOG_ID + "(getAllReceivedInvitations) error : ", err);
					reject(err);				});
		});
	};

	/**
	 * @private
	 */
	getAllSentInvitations() {
		let that = this;
		return new Promise(function (resolve, reject) {
			return that._rest.getAllSentInvitations().then(
				function success(response: any) {
					let invitationsData = response.data;
					that._logger.log("info", LOG_ID + "(getAllSentInvitations) success (find " + invitationsData.length + " invitations)");
					that.sentInvitations = {};
					invitationsData.forEach(async function (invitationData) {
						if (invitationData.status === "pending" && !invitationData.inviteToJoinMeeting) {
							let sentInvitation = Invitation.createFromData(invitationData);
							that.sentInvitations[invitationData.id] = sentInvitation;
							if (sentInvitation.invitedUserId !== undefined) {
								await that.updateContactInvitationStatus(sentInvitation.invitedUserId, "wait", sentInvitation);
							}
						}
					});
					that.updateSentInvitationsArray();
					resolve(that.sentInvitations);
				},
				function failure(err) {
					that._logger.log("error", LOG_ID + "(getAllSentInvitations) error ");
					that._logger.log("internalerror", LOG_ID + "(getAllSentInvitations) error : ", err);
					reject(err);
				});
		});
	}
}

module.exports.InvitationsService = InvitationsService;
export {InvitationsService};
