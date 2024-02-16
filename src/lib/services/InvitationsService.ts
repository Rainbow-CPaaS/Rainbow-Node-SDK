"use strict";
import {FavoritesService} from "./FavoritesService";

export {};

import * as PubSub from "pubsub-js";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {EventEmitter} from "events";
import {InvitationEventHandler} from "../connection/XMPPServiceHandler/invitationEventHandler";
import {isStarted, logEntryExit} from "../common/Utils";
import {Invitation} from "../common/models/Invitation";
import * as moment from 'moment';
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {BubblesService} from "./BubblesService";
import {GroupsService} from "./GroupsService";
import {GenericService} from "./GenericService";
import {Contact} from "../common/models/Contact";

const LOG_ID = "INVITATION/SVCE - ";

/**
 * @module
 * @name InvitationsService
 * @version SDKVERSION
 * @public
 * @description
 *      This services manages the invitations received/ sent from/to server. <br>
 *
 */
@logEntryExit(LOG_ID)
@isStarted([])
class InvitationsService extends GenericService {
	receivedInvitations: {};
	sentInvitations: {};
	acceptedInvitationsArray: any[];
	sentInvitationsArray: any[];
	receivedInvitationsArray: any[];
	private _listeners: any[];
	private _portalURL: string;
	private _contactConfigRef: any;
	acceptedInvitations: {};
	private _invitationEventHandler: InvitationEventHandler;
	private _invitationHandlerToken: any;
	private _contacts: ContactsService;
	private _bubbles: BubblesService;
	private stats: any;

	static getClassName(){ return 'InvitationsService'; }
	getClassName(){ return InvitationsService.getClassName(); }

	static getAccessorName(){ return 'invitations'; }
	getAccessorName(){ return InvitationsService.getAccessorName(); }

	constructor(_core:Core, _eventEmitter: EventEmitter, _logger: Logger, _startConfig: { start_up: boolean; optional: boolean }) {//$q, $log, $http, $rootScope, authService, Invitation, contactService, xmppService, errorHelperService, settingsService) {
		super(_logger, LOG_ID);
		this.setLogLevels(this);
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

		this._core = _core;

		//update the sentInvitations list when new invitation is accepted
		// DONE : VBR that._listeners.push($rootScope.$on("ON_ROSTER_CHANGED_EVENT", that.getAllSentInvitations));
		this._eventEmitter.on("evt_internal_onrosters", that.onRosterChanged.bind(this));
		this._eventEmitter.on("evt_internal_invitationsManagementUpdate", that.onInvitationsManagementUpdate.bind(this));
		this._eventEmitter.on("evt_internal_joinCompanyInvitationManagementUpdate", that.onJoinCompanyInviteManagementMessageReceived.bind(this));
		this._eventEmitter.on("evt_internal_joinCompanyRequestManagementUpdate", that.onJoinCompanyRequestManagementMessageReceived.bind(this));
		this._eventEmitter.on("evt_internal_openinvitationManagementUpdate", that.onOpenInvitationManagementUpdate.bind(this));
	}

	/************************************************************/
	/** LIFECYCLE STUFF                                        **/

	/************************************************************/
	async start(_options, stats) { // , _xmpp: XMPPService, _s2s : S2SService, _rest: RESTService, _contacts : ContactsService, stats
		let that = this;
		that.initStartDate();
		that._logger.log("info", LOG_ID + "");
		that._logger.log("info", LOG_ID + "[InvitationService] === STARTING ===");
		that.stats = stats ? stats : [];

		that._xmpp = that._core._xmpp;
		that._rest = that._core._rest;
		that._options = _options;
		that._s2s = that._core._s2s;
		that._useXMPP = that._options.useXMPP;
		that._useS2S = that._options.useS2S;
		that._contacts = that._core.contacts;
		that._bubbles = that._core.bubbles;

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

		//stats.push({service: "InvitationService", startDuration: startDuration});
		that.setStarted ();
	};

	public async init (useRestAtStartup : boolean) {
		let that = this;
		let prom = [];
		if (useRestAtStartup) {
			prom.push(that.getAllSentInvitations());
			prom.push(that.getAllReceivedInvitations());
		}
		await Promise.all(prom).then(()=>{
			that.setInitialized();
		}).catch(()=>{
			that.setInitialized();
		});
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
		that.setStopped ();
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
			PubSub.subscribe(that._xmpp.hash + "." + that._invitationEventHandler.MESSAGE_MANAGEMENT, that._invitationEventHandler.onManagementMessageReceived.bind(that._invitationEventHandler)),
			PubSub.subscribe(that._xmpp.hash + "." + that._invitationEventHandler.MESSAGE_ERROR, that._invitationEventHandler.onErrorMessageReceived.bind(that._invitationEventHandler)),
			//PubSub.subscribe( that._xmpp.hash + "." + that._invitationEventHandler.MESSAGE_HEADLINE, that._invitationEventHandler.onHeadlineMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onCloseMessageReceived)
		];
	};

	//region Events
	
	onRosterChanged(data) {
		let that = this;
		that._logger.log("info", LOG_ID + "onRosterChanged : ", data);
		that.getAllSentInvitations().catch(err=>{
			that._logger.log("warn", LOG_ID + "(onRosterChanged) getAllSentInvitations error : ", err);
		});
	}

	async onOpenInvitationManagementUpdate(openInvitation) {
		let that = this;
		that._logger.log("internal", LOG_ID + "(onOpenInvitationManagementUpdate) openInvitation : ", openInvitation);
		//let userInviteElem = stanza.find("userinvite");
		if (openInvitation) {
			let invitation = {
				openInviteId: openInvitation.openinviteid,
				publicUrl: undefined,
				action: openInvitation.action,
				roomType: openInvitation.roomType,
				bubble: undefined,
				invitationURL: openInvitation.invitationURL
			};
			invitation.publicUrl = that._bubbles.getPublicURLFromResponseContent(invitation);
			invitation.bubble = await that._bubbles.getBubbleById(openInvitation.roomid);

			that._eventEmitter.emit("evt_internal_openinvitationUpdate", invitation);
		} else {
			that._logger.log("warn", LOG_ID + "(onOpenInvitationManagementUpdate) userInvite undefined!");
		}
		return true;
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

	async onJoinCompanyInviteManagementMessageReceived(joincompanyinvite) {
		let that = this;
        that._logger.log("internal", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) joincompanyinvite : ", joincompanyinvite);
		that._logger.log("debug", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) join company invite event received");
		that._eventEmitter.emit("evt_internal_joincompanyinvitereceived", joincompanyinvite);
		//let userInviteElem = stanza.find("userinvite");
		/* if (userInvite) {
			let id = userInvite.id;
			let type = userInvite.type;
			let action = userInvite.action;
			switch (type) {
				case "received":
                    that._logger.log("internal", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) received");
					await that.handleReceivedInvitation(id, action);
                    that._logger.log("internal", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) received after");
					break;
				case "sent":
                    that._logger.log("internal", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) sent");
					await that.handleSentInvitation(id, action);
                    that._logger.log("internal", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) sent after");
					break;
				default:
					that._logger.log("warn", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) - received unexpected type - " + type);
					break;
			}
		} else {
			that._logger.log("warn", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) userInvite undefined!");
		}
        that._logger.log("info", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) that.receivedInvitations : ", that.receivedInvitations);
        that._logger.log("info", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) that.acceptedInvitationsArray : ", that.acceptedInvitationsArray);
        that._logger.log("info", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) that.sentInvitations : ", that.sentInvitations);
        // */
		return true;
	};

	async onJoinCompanyRequestManagementMessageReceived(joincompanyrequest) {
		let that = this;
        that._logger.log("internal", LOG_ID + "(onJoinCompanyRequestManagementMessageReceived) joincompanyinvite : ", joincompanyrequest);
		that._logger.log("debug", LOG_ID + "(onJoinCompanyRequestManagementMessageReceived) join company invite event received");
		that._eventEmitter.emit("evt_internal_joincompanyrequestreceived", joincompanyrequest);
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
							}).catch((err)=>{
								that._logger.log("info", LOG_ID + "(handleReceivedInvitation) getContactById failed.");
								that._logger.log("internal", LOG_ID + "(handleReceivedInvitation) getContactById failed : ", err);
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
			}).catch(err=>{
				that._logger.log("warn", LOG_ID + "(handleReceivedInvitation) getServerInvitation error : ", err);
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
				resolve(undefined);
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
									that._contacts.getContactById(invitation.invitedUserId, true).then(function (contact: Contact) {
										// TODO : VBR $rootScope.$broadcast("ON_CONTACT_UPDATED_EVENT", contact);
										contact.roster = true;
									}).catch((err)=>{
										that._logger.log("info", LOG_ID + "(handleSentInvitation) getContactById failed.");
										that._logger.log("internal", LOG_ID + "(handleSentInvitation) getContactById failed : ", err);
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
									resolve(undefined);
								});
						} else {
							that.updateSentInvitationsArray();
							resolve(undefined);
						}
					}).catch(err=>{
					that._logger.log("warn", LOG_ID + "(handleSentInvitation) getServerInvitation error : ", err);
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

	//endregion Events
	
	//region Invitations RECEIVED

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
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method getReceivedInvitations
	 * @instance
	 * @category Invitations RECEIVED
	 * @description
	 *    Get the invite received coming from Rainbow users <br>
	 * @return {Invitation[]} The list of invitations received
	 */
	getReceivedInvitations() {
		let that = this;
		return that.receivedInvitationsArray;
	};

	/**
	 * @public
	 * @nodered true
	 * @since 2.9.0
	 * @method searchInvitationsReceivedFromServer
	 * @instance
	 * @category Invitations RECEIVED
	 * @param {string} sortField Sort items list based on the given field. Default value : lastNotificationDate.
	 * @param {string} status List all invitations having the provided status(es). Possible values : pending, accepted, auto-accepted, declined, canceled, failed. Default value : pending.
	 * @param {string} format Allows to retrieve more or less invitation details in response. Default value : `small`. Possible values : `small`, `medium`, `full`
	 * @param {number} limit Allow to specify the number of items to retrieve. Default value : 500
	 * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0.
	 * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possible values : -1, 1.
	 * @description
	 *    retrieve the invites received from others Rainbow users from server.<br>
	 * @return {any} The list of invite received
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object\[\] | List of user invitation Objects. |
	 * | limit | Number | Number of requested items |
	 * | offset | Number | Requested position of the first item to retrieve |
	 * | total | Number | Total number of items |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 * 
	 */
	searchInvitationsReceivedFromServer(sortField : string = "lastNotificationDate", status : string = "pending", format : string="small", limit : number = 500, offset : number, sortOrder : number) {
		let that = this;
		return new Promise(function (resolve, reject) {
			return that._rest.getInvitationsReceived(sortField, status, format, limit, offset, sortOrder).then(
					function success(response: any) {
						that._logger.log("info", LOG_ID + "(searchInvitationsReceivedFromServer) success (found " + response.data.length + " invitations)");
						resolve(response);
					},
					function failure(err) {
						that._logger.log("error", LOG_ID + "(searchInvitationsReceivedFromServer) error ");
						that._logger.log("internalerror", LOG_ID + "(searchInvitationsReceivedFromServer) error : ", err);
						reject(err);
					});
		});
	}
	
	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method 	getAcceptedInvitations
	 * @instance
	 * @category Invitations RECEIVED
	 * @description
	 *    Get the invites you accepted received from others Rainbow users <br>
	 * @return {Invitation[]} The list of invite sent
	 */
	getAcceptedInvitations() {
		let that = this;
		return that.acceptedInvitationsArray;
	};

	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method getInvitationsNumberForCounter
	 * @category Invitations RECEIVED
	 * @instance
	 * @description
	 *    Get the number of invitations received from others Rainbow users <br>
	 * @return {Invitation[]} The list of invite sent
	 */
	getInvitationsNumberForCounter() {
		let that = this;
		return that.receivedInvitationsArray.length;
	};

	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method getServerInvitation
	 * @instance
	 * @category Invitations RECEIVED
	 * @description
	 *    Get an invite by its id from server. <br>
	 * @param {String} invitationId the id of the invite to retrieve
	 * @return {Invitation} The invite if found
	 */
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

	// Getter method

	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method getInvitation
	 * @instance
	 * @category Invitations RECEIVED
	 * @description
	 *    Get an invite by its id <br>
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
	 * @nodered true
	 * @since 1.65
	 * @method joinContactInvitation
	 * @instance
	 * @category Invitations RECEIVED
	 * @async
	 * @description
	 *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	 *    Once accepted, the user will be part of your network. <br>
	 *    Return a promise <br>
	 * @param {Contact} contact The invitation to accept
	 * @return {Promise<Object>} A promise that contains SDK.OK if success or an object that describes the error
	 */
	async joinContactInvitation(contact) {
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

	// Invited methods

	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method acceptInvitation
	 * @instance
	 * @category Invitations RECEIVED
	 * @async
	 * @description
	 *    Accept a an invitation from an other Rainbow user to mutually join the network <br>
	 *    Once accepted, the user will be part of your network. <br>
	 *    Return a promise <br>
	 * @param {Invitation} invitation The invitation to accept
	 * @return {Promise<Object>} A promise that contains SDK.OK if success or an object that describes the error
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 * 
	 */
	async acceptInvitation(invitation) {
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
							that._contacts.getContactById(invitation.invitingUserId, true).then(function (contact) {
										// TODO : VBR $rootScope.$broadcast("ON_CONTACT_UPDATED_EVENT", contact);
										reject(err);
							}).catch((err)=>{
								that._logger.log("info", LOG_ID + "(acceptInvitation) getContactById failed.");
								that._logger.log("internal", LOG_ID + "(acceptInvitation) getContactById failed : ", err);
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
	 * @nodered true
	 * @since 1.65
	 * @method declineInvitation
	 * @instance
	 * @category Invitations RECEIVED
	 * @async
	 * @description
	 *    Decline an invitation from an other Rainbow user to mutually join the network <br>
	 *    Once declined, the user will not be part of your network. <br>
	 *    Return a promise <br>
	 * @param {Invitation} invitation The invitation to decline
	 * @return {Promise<Object>} A promise that contains SDK.OK in case of success or an object that describes the error
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object | User invitation Object. |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 * 
	 */
	async declineInvitation(invitation) {
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

	//endregion Invitations RECEIVED

	//region Invitations SENT

	/**
	 * @private
	 */
	async getAllSentInvitations() {
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

	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method getSentInvitations
	 * @instance
	 * @category Invitations SENT
	 * @description
	 *    Get the invites sent to others Rainbow users <br>
	 * @return {Invitation[]} The list of invite sent
	 */
	getSentInvitations() {
		let that = this;
		return that.sentInvitationsArray;
	};

	/**
	 * @public
	 * @nodered true
	 * @since 2.9.0
	 * @method searchInvitationsSentFromServer
	 * @instance
	 * @category Invitations SENT
	 * @param {string} sortField Sort items list based on the given field. Default value : lastNotificationDate
	 * @param {string} status List all invitations having the provided status(es). Possible values : pending, accepted, auto-accepted, declined, canceled, failed. Default value : pending.
	 * @param {string} format Allows to retrieve more or less invitation details in response. Default value : `small`. Possible values : `small`, `medium`, `full`
	 * @param {number} limit Allow to specify the number of items to retrieve. Default value : 500
	 * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.
	 * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possible values : -1, 1.
	 * @description
	 *    retrieve the invites sent to others Rainbow users from server.<br>
	 * @return {any} The list of invite sent
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object\[\] | List of user invitation Objects. |
	 * | authorizedReSendInvitationDate optionnel | Date-Time | Date when the inviting user will be allowed to resend again the invitation to the invited user.  <br>authorizedReSendInvitationDate is only set if invitation still have the status pending. | 
	 * | limit | Number | Number of requested items |
	 * | offset | Number | Requested position of the first item to retrieve |
	 * | total | Number | Total number of items |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 * 
	 */
	searchInvitationsSentFromServer(sortField : string = "lastNotificationDate", status : string = "pending", format : string="small", limit : number = 500, offset : number = 0, sortOrder : number = 1) {
		let that = this;
		return new Promise(function (resolve, reject) {
			return that._rest.getInvitationsSent(sortField, status, format, limit, offset, sortOrder).then(
					function success(response: any) {
						that._logger.log("info", LOG_ID + "(searchInvitationsSentFromServer) success (found " + response.data.length + " invitations)");
						resolve(response);
					},
					function failure(err) {
						that._logger.log("error", LOG_ID + "(searchInvitationsSentFromServer) error ");
						that._logger.log("internalerror", LOG_ID + "(searchInvitationsSentFromServer) error : ", err);
						reject(err);
					});
		});
	}
	
	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method sendInvitationByEmail
	 * @instance
	 * @category Invitations SENT
	 * @async
	 * @description
	 *    This API allows logged in user to invite another user by email. <br>
	 *    At the end of the process, if invited user accepts the invitation, invited user and inviting user will be searchable mutually and will be in each other rosters.  <br>
	 * @param {string} email The email.
	 * @param {string} lang The lang of the message.
	 * @param {string} customMessage The email text (optional).
	 * @return {Object} A promise that contains the contact added or an object describing an error
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object | User invitation Object. |
	 * | authorizedReSendInvitationDate | Date-Time | Date when the inviting user will be allowed to resend again the invitation to the invited user. |
	 * | invitationUrl optionnel | String | Invitation URL to be sent to the invited user.  <br>Only returned for invitations sent using `invitedPhoneNumber`, as invitation URL link is sent by SMS on client side. |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 * 
	 */
	async sendInvitationByEmail(email : string, lang : string, customMessage : string) {
		let that = this;
		return that.sendInvitationByCriteria(email, null,null, lang, customMessage );
	};

	/**
	 * @public
	 * @nodered true
	 * @since 2.9.0
	 * @method sendInvitationByCriteria
	 * @instance
	 * @category Invitations SENT
	 * @async
	 * @description
	 *    This API allows logged in user to invite another user by criteria. <br>
	 *    At the end of the process, if invited user accepts the invitation, invited user and inviting user will be searchable mutually and will be in each other rosters.  <br>
	 *    
	 *
	 * **Notes**:
	 *
	 * * One of email, invitedPhoneNumber or invitedUserId is mandatory.
	 * * It's not possible to invite users having only the role `guest`. (CPAAS user)
	 * * Users with visibility `isolated` or being in a company with visibility `isolated` are not allowed to invite external users.
	 * * Users with visibility `isolated` or being in a company with visibility `isolated` are not allowed to be invited by external users.  
	 *    From **1.53.0**, a user can be embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration.  
	 *    It is not a user with the role `guest`.  
	 *    This user gets the role `user` and the flag `guestMode` is set to true, waiting for the user finalizes his account. Besides, his `visibility` is 'none'.  
	 *    We can't invite this kind of user to join the logged in network. (HTTP error 403509)  
	 *      
	 *    Here are some details about this API and user invitation features.  
	 *    Users can be invited:
	 *
	 * * by `email`:
	 *    * If the provided email corresponds to the loginEmail of a Rainbow user, a visibility request is sent (if this Rainbow user is not in logged in user roster).
	 *        * An InviteUser entry is stored in database (with a generated invitationId).
	 *        * The invited user receive an email with a validation link (containing the invitationId).
	 *        * The invited user is notified with an XMPP message (containing the invitationId).
	 *            <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite action="create" id='57cd5922d341df5812bbcb72' type='received' status='pending' xmlns='jabber:iq:configuration'/>  </message> 	  	 
	 *        * The inviting user is notified with an XMPP message (containing the invitationId) (useful for multi-device).
	 *            <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite action="create" id='57cd5922d341df5812bbcb72' type='sent' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	 *        * The list of all visibility requests received by the logged in user (invited user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetReceivedInvites)
	 *        * The list of all visibility requests sent by the logged in user (inviting user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetSentInvites)
	 *        * The inviting user can re-send a visibility request notification (only by email) using API [POST /api/rainbow/enduser/v1.0/notifications/emails/invite-by-end-user/:invitationId/re-send](#api-enduser_notifications_emails-enduser_ResendInvite)
	 *        * To accept the visibility request (invited user side), client has to call API [POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/accept](#api-enduser_invitations-enduser_users_AcceptInvites)  
	 *            Once accepted, invited and inviting user will be in each other roster and will be mutually visible (search API, GET users, GET users/:userId, ...)
	 *        * To decline the visibility request (invited user side), client has to call API [POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/decline](#api-enduser_invitations-enduser_users_DeclineInvites)
	 *    * If the provided email is not known in Rainbow, an invitation is sent to this email to invite the person to create a Rainbow account
	 *        * An InviteUser entry is stored in database (with a generated invitationId).
	 *        * The invited user receive an email with a creation link (containing the invitationId).
	 *        * The inviting user is notified with an XMPP message (containing the invitationId) (useful for multi-device). 	 
	 *            <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite id='57cd5922d341df5812bbcb72' action="create" type='sent' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	 *        * The list of all visibility requests sent by the logged in user (inviting user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetSentInvites)
	 *        * The inviting user can re-send a visibility request notification (only by email) using API [POST /api/rainbow/enduser/v1.0/notifications/emails/invite-by-end-user/:invitationId/re-send](#api-enduser_notifications_emails-enduser_ResendInvite)
	 *        * To create his Rainbow account, the invited user has to use API "Self register a user" ([POST /api/rainbow/enduser/v1.0/users/self-register](#api-enduser_users-enduser_SelfRegisterUsers))
	 * * by phoneNumber (`invitedPhoneNumber`):
	 *    * No match is done on potential existing Rainbow users.
	 *    * An InviteUser entry is stored in database (with a generated invitationId).
	 *    * No email is sent to invited user. It is **up to clients calling this API to send an SMS to the invited user's phone** (with the invitationId).
	 *    * The inviting user is notified with an XMPP message (containing the invitationId) (useful for multi-device).
	 *        <message type='management' id='122'         from='jid_from@openrainbow.com'         to='jid_to@openrainbow.com'         xmlns='jabber:client'>     <userinvite id='57cd5922d341df5812bbcb72' action="create" type='sent' status='pending' xmlns='jabber:iq:configuration'/>  </message>
	 *    * If the invitedPhoneNumber correspond to a user already existing in Rainbow, he **will not** be able to see the request using the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetReceivedInvites), as no match is done between the invitedPhoneNumber and a potential user existing in Rainbow
	 *    * The list of all visibility requests sent by the logged in user (inviting user side) can be retrieved with the API [GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent(?status=pending|accepted|auto-accepted|declined)](#api-enduser_invitations-enduser_users_GetSentInvites)
	 *    * The inviting user can re-send a visibility request notification done by phoneNumber using API [POST /api/rainbow/enduser/v1.0/notifications/emails/invite-by-end-user/:invitationId/re-send](#api-enduser_notifications_emails-enduser_ResendInvite), however it is still **up to client to send an SMS to the invited user's phone** (the API only updates the field lastNotificationDate). If needed, it is **up to clients to re-send the SMS to the invited user's phone**.
	 *    * To create his Rainbow account, the invited user has to use API "Self register a user" using the associated invitationId ([POST /api/rainbow/enduser/v1.0/users/self-register](#api-enduser_users-enduser_SelfRegisterUsers))
	 * * by Rainbow user id (`invitedUserId`):
	 *    * if no user is found with the provided invitedUserId, an error 404 is returned
	 *    * otherwise, a visibility request is sent (if this Rainbow user is not in logged in user roster).  
	 *        Same documentation than existing user invited by email apply (see above).
	 * @param {string} email The email.
	 * @param {string} invitedPhoneNumber Invited phone number.
	 * @param {string} invitedUserId Invited Rainbow user unique ID
	 * @param {string} lang The lang of the message.
	 * @param {string} customMessage The email text (optional).
	 * @return {Object} A promise that contains the contact added or an object describing an error
	 *
	 *
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object | User invitation Object. |
	 * | authorizedReSendInvitationDate | Date-Time | Date when the inviting user will be allowed to resend again the invitation to the invited user. |
	 * | invitationUrl optionnel | String | Invitation URL to be sent to the invited user.  <br>Only returned for invitations sent using `invitedPhoneNumber`, as invitation URL link is sent by SMS on client side. |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 *
	 */
	async sendInvitationByCriteria(email: string, invitedPhoneNumber : string, invitedUserId : string, lang : string, customMessage : string) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._logger.log("info", LOG_ID + "(sendInvitationByCriteria)");
			return that._rest.sendInvitationByCriteria(email, lang, customMessage, invitedPhoneNumber, invitedUserId ).then(
					function success(data) {
						that._logger.log("info", LOG_ID + "(sendInvitationByCriteria) - success");
						resolve(data);
					},
					function failure(err) {
						that._logger.log("error", LOG_ID + "(sendInvitationByCriteria) error ");
						that._logger.log("internalerror", LOG_ID + "(sendInvitationByCriteria) error : ", err);
						reject(err);
					});
		});
	};

	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method cancelOneSendInvitation
	 * @instance
	 * @category Invitations SENT
	 * @async
	 * @param {Invitation} invitation The invitation to cancel
	 * @description
	 *    Cancel an invitation sent <br>
	 * @return {Object} The SDK Ok object or an error
	 */
	async cancelOneSendInvitation(invitation) {
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
	 * @nodered true
	 * @since 1.65
	 * @method reSendInvitation
	 * @instance
	 * @category Invitations SENT
	 * @async
	 * @param {string} invitationId The invitation to re send
	 * @param {string} customMessage Custom message that inviting user can add in email body
	 * @description
	 *    This API can be used to re-send a user invitation which has already been sent. <br>
	 *    Logged in user must be the one who sent the invitatio. <br>
	 *    An invitation can only be re-sent after a given period since last notification (1 hour by default). <br>
	 *    If invitation is canceled or failed, it is set back to pending and then re-sent. <br>
	 *    If invitation is accepted or auto-accepted, error 409 is returned. <br>
	 *    If invitation is declined, it is set back to pending and re-sent if the last notification was sent since a given period (1 week by default).  <br>
	 * @return {Object} The SDK Ok object or an error
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object | User invitation Object. |
	 * | authorizedReSendInvitationDate | Date-Time | Date when the inviting user will be allowed to resend again the invitation to the invited user. |
	 * | invitationUrl optionnel | String | Invitation URL to be sent to the invited user.  <br>Only returned for invitations sent using `invitedPhoneNumber`, as invitation URL link is sent by SMS on client side. |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 * 
	 */
	async reSendInvitation(invitationId: string, customMessage  : string) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._rest.reSendInvitation(invitationId, customMessage).then(
					function success() {
						that._logger.log("info", LOG_ID + "[InvitationService] reSendInvitation " + invitationId + " - success");
						resolve(undefined);
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
	 * @nodered true
	 * @since 1.65
	 * @method sendInvitationsByBulk
	 * @instance
	 * @category Invitations SENT
	 * @async
	 * @description
	 *    Send invitations for a list of emails as UCaaS <br>
	 *    LIMITED TO 100 invitations <br>
	 * @param {Array} listOfMails The list of emails
	 * @param {string} lang Force language of the email notification if not available. </BR>
	 * Language format is composed of locale using format ISO 639-1, with optionally the regional variation using ISO 3166‑1 alpha-2 (separated by hyphen).</BR>
	 * Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ...</BR>
	 * More information about the format can be found on this link.</BR>
	 * Algorithm for choosing language of email:</BR>
	 * invited user language is used if invited user exists in Rainbow and his language is available,</BR>
	 * else provided language in parameter lang is used if provided,</BR>
	 * else inviting user language is used if language is available,</BR>
	 * otherwise English is used.</BR> 
	 * @param {string} customMessage Custom message that inviting user can add in email body. The message will be the same for all emails.
	 * @return {Object} A promise that the invite result or an object describing an error
	 *
	 *
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | report | Object | Report of the bulk operation |
	 * | status | String | Status of the bulk operation.  <br>`ongoing`: there is at least 1 email to send  <br>`failed`: there is no email to send and errors occurred with the synchronous validation of the provided emails<br><br>Possibles values : `ongoing`, `failed` |
	 * | ongoing | Object\[\] | List of emails which will be treated |
	 * | email | String | Email address to invite |
	 * | index | Number | Position of the email address to invite in the input emails array |
	 * | errors | Object\[\] | Errors which has occurred during the validation of this email. Should always be empty, otherwise the email would be in the failed array. |
	 * | status | String | Status of the email invitation. Should always be ongoing, as the treatment is asynchronous and there is currently no way for the client to know the progression of the bulk invitations. |
	 * | failed | Object\[\] | List of emails for which the synchronous validation has failed |
	 * | email | String | Email address which failed validation |
	 * | index | Number | Position of the email address in the input emails array |
	 * | errors | Object\[\] | Errors which has occurred during the validation of this email. |
	 * | errorCode | Number | HTTP error code |
	 * | errorMsg | string | HTTP error message |
	 * | errorDetails | string | Detailed message about the error |
	 * | errorDetailsCode | Number | Detailed code about the error |
	 * | status | String | Status of the email invitation (failed). |
	 * | counters | Object | Counters of the different operation status |
	 * | total | Number | Total number of email addresses processed |
	 * | errorDetailsData | Object | Data about the error. The data being in this object (if any) are specific to the error and can help the clients to build an error message regarding the error. |
	 * | ongoing | Number | Number of emails that will be treated |
	 * | failed | Number | Number of emails for which the synchronous validation has failed |
	 *
	 */
	async sendInvitationsByBulk(listOfMails, lang? : string, customMessage? : string) {
		let that = this;

		if (!listOfMails.length || listOfMails.length > 100) {
			that._logger.log("error", LOG_ID + "(sendInvitationsByBulk) mail list length not correct");
			return Promise.reject();
		}

		return new Promise(function (resolve, reject) {
			that._rest.sendInvitationsByBulk(listOfMails, lang, customMessage).then(
					function success(data) {
						that._logger.log("info", LOG_ID + "(sendInvitationsByBulk) - success");
						resolve(data);
					},
					function failure(err) {
						that._logger.log("error", LOG_ID + "(sendInvitationsByBulk) error ");
						that._logger.log("internalerror", LOG_ID + "(sendInvitationsByBulk) error : ", err);
						reject(err);
					});
		});
	};
	
	async sendInvitationsParBulk(listOfMails, lang? : string, customMessage? : string) {
		return this.sendInvitationsByBulk(listOfMails, lang, customMessage );
	}

	//endregion Invitations SENT

	//region Invitations RECEIVED/SENT
	
	/**
	 * @public
	 * @nodered true
	 * @since 1.65
	 * @method getAllInvitationsNumber
	 * @instance
	 * @category Invitations RECEIVED/SENT
	 * @description
	 *    Get the number of invitations sent/received to/from others Rainbow users <br>
	 * @return {Invitation[]} The list of invite sent
	 */
	getAllInvitationsNumber = function () {
		let that = this;
		return that.receivedInvitationsArray.length + that.sentInvitationsArray.length + that.acceptedInvitationsArray.length;
	};

	/**
	 * @public
	 * @nodered true
	 * @since 2.21.0
	 * @method deleteAUserInvitation
	 * @instance
	 * @category Invitations SENT
	 * @async
	 * @param {Invitation} invitation The invitation to delete.
	 * @description
	 *    This API can be used to delete an invitation sent to/received from another Rainbow user. <br>
	 * @return {Object} The SDK Ok object or an error
	 * 
	 * 
	 * | Champ | Type | Description |
	 * | --- | --- | --- |
	 * | data | Object | User invitation Object. |
	 * | id  | String | Invitation unique Id |
	 * | invitedUserId optionnel | String | Invited user unique Rainbow Id.  <br>Only available for the inviting user if the invited user has been invited from his userId (parameter invitedUserId in API POST /api/rainbow/enduser/v1.0/users/:userId/invitations) or if the invitation has been accepted. |
	 * | invitedPhoneNumber optionnel | String | Invited user phoneNumber |
	 * | invitedUserEmail optionnel | String | Invited user email |
	 * | invitingUserId | String | Inviting user unique Rainbow Id |
	 * | invitingUserEmail | String | Inviting user loginEmail |
	 * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
	 * | invitingDate | Date-Time | Date the invitation was created |
	 * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
	 * | status | String | Invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`<br><br>* `pending`: invitation has been sent by inviting user and not yet accepted by invited user<br>* `accepted`: invitation has been accepted by invited user<br>* `auto-accepted`: invitation has been auto-accepted (case of users in same company)<br>* `declined`: invitation has been declined by invited user. Only invited user can see that he has declined an invitation. Inviting user still see the invitation as `pending`<br>* `canceled`: invitation has been canceled by inviting user. If invited user does not have an account in Rainbow, he can still use this invitationId received by email to create his Rainbow account, but he will not be added to inviting user roster.<br>* `failed`: invitation email failed to be sent to invited user (determined by parsing SMTP server logs). It can be the case if the provided invited email address does not exists. |
	 * | type | String | Invitation type:<br><br>* `visibility` (invited user exists in Rainbow),<br>* `registration` (invited user did not exist in Rainbow when invitation was sent) |
	 *
	 */
	async deleteAUserInvitation(invitation) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that._rest.deleteAUserInvitation(invitation).then(
					function success(data) {
						that._logger.log("info", LOG_ID + "(deleteAUserInvitation) success");
						that._logger.log("internal", LOG_ID + "(deleteAUserInvitation) success : ", data);
						resolve(data);
					},
					function failure(err) {
						that._logger.log("error", LOG_ID + "(deleteAUserInvitation) error ");
						that._logger.log("internalerror", LOG_ID + "(deleteAUserInvitation) error : ", err);
						reject(err);
					});
		});
	};

	/**
	 * @private
	 */
	updateContactInvitationStatus(contactDBId, status, invitation) {
		let that = this;
		return new Promise(function (resolve) {
			that._contacts.getContactById(contactDBId).then(function (contact) {
				if (contact) {
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
				} else {
					that._logger.log("warn", LOG_ID + "(updateContactInvitationStatus) getContactById did not found the contact by id : ", contactDBId, " so ignore invitation : ", invitation);
				}
				// contact.updateRichStatus();
				resolve(undefined);
			}).catch((err)=>{
				that._logger.log("info", LOG_ID + "(updateContactInvitationStatus) getContactById failed.");
				that._logger.log("internal", LOG_ID + "(updateContactInvitationStatus) getContactById failed : ", err);
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

	//endregion Invitations RECEIVED/SENT
}

module.exports.InvitationsService = InvitationsService;
export {InvitationsService};
