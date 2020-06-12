"use strict";

import {MEDIATYPE} from "../../connection/RESTService";

export {};

/**
 * @class
 * @private
 * @name Conference
 * @description
 *      This class is used to represent a conference
 */
class Conference {

	//
	// Constructor
	private _companyId: string;
	private _id: string;
	private _mediaType: MEDIATYPE;
	private _name: string;
	private _passCodes: any;
	private _scheduled: boolean;
	private _lastUpdateDate: string;
	private _confDialOutDisabled: string;
	private _playEntryTone: boolean;
	private _userId: string;
	private _muteUponEntry: boolean;

	/**
	 * @this Conference
	 */
	constructor(
		companyId, // (String) Company unique identifier
		id, // (String) unique identifier of conference
		mediaType, // (String) mediaType of conference ("pstnAudio", "webrtc", "webrtcSharingOnly")
		name, // (String) name of conference
		passCodes, // (Array) list of passcodes
		scheduled, // (Boolean) true if it is a scheduled meeting, false otherwise
		lastUpdateDate, // (String) last update date of conference (e.g. 2018-06-20T09:08:00.000Z)
		userId, // (String) user unique identifier
		confDialOutDisabled, // (Boolean) true if dialOut from PGi is disabled
		playEntryTone, // (Boolean) A tone is played when participant enters the conference.
		muteUponEntry // (Boolean) When participant enters the conference, he is automatically muted.
	) {
		/**
		 * @public
		 * @property {string} companyId
		 * @readonly
		 */
		this._companyId = companyId;
		/**
		 * @public
		 * @property {string} id confEndpoint unique identifier
		 * @readonly
		 */
		this._id = id;
		/**
		 * @public
		 * @property {string} mediaType
		 * @readonly
		 */
		this._mediaType = mediaType;
		/**
		 * @public
		 * @property {string} name
		 * @readonly
		 */
		this._name = name;
		/**
		 * @public
		 * @property {Array} passCodes
		 * @readonly
		 */
		this._passCodes = passCodes ? passCodes : [];
		/**
		 * @public
		 * @property {boolean} scheduled
		 * @readonly
		 */
		this._scheduled = scheduled;
		/**
		 * @public
		 * @property {string} lastUpdateDate
		 */
		this._lastUpdateDate = lastUpdateDate;
		/**
		 * @public
		 * @property {string} userId
		 * @readonly
		 */
		this._userId = userId;
		/**
		 * @public
		 * @property {string} confDialOutDisabled
		 * @readonly
		 */
		this._confDialOutDisabled = confDialOutDisabled;
		/**
		 * @public
		 * @property {boolean} playEntryTone
		 * @readonly
		 */
		this._playEntryTone = playEntryTone;
		/**
		 * @public
		 * @property {boolean} scheduled
		 * @readonly
		 */
		this._muteUponEntry = muteUponEntry;

	}

	static createFromData(data) : Conference {
		return new Conference(
			data.companyId,
			data.id,
			data.mediaType,
			data.name,
			data.passCodes,
			data.scheduled,
			data.lastUpdateDate,
			data.userId,
			data.confDialOutDisabled,
			data.playEntryTone,
			data.muteUponEntry
		);
	};
	/**
	 * @private
	 * @property {string} updateFromData Allow to update an existing conference with data from server
	 * @readonly
	 */
	updateFromData (data) {
		this._companyId = data.companyId;
		this._id = data.id;
		this._mediaType = data.mediaType;
		this._name = data.name;
		this._passCodes = data.passCodes;
		this._scheduled = data.scheduled;
		this._lastUpdateDate = data.lastUpdateDate;
		this._userId = data.userId;
		this._confDialOutDisabled = data.confDialOutDisabled;
		this._playEntryTone = data.playEntryTone;
		this._muteUponEntry = data.muteUponEntry;
	};


	get companyId(): string {
		return this._companyId;
	}

	set companyId(value: string) {
		this._companyId = value;
	}

	get id(): string {
		return this._id;
	}

	set id(value: string) {
		this._id = value;
	}

	get mediaType(): MEDIATYPE {
		return this._mediaType;
	}

	set mediaType(value: MEDIATYPE) {
		this._mediaType = value;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get passCodes(): any {
		return this._passCodes;
	}

	set passCodes(value: any) {
		this._passCodes = value;
	}

	get scheduled(): boolean {
		return this._scheduled;
	}

	set scheduled(value: boolean) {
		this._scheduled = value;
	}

	get lastUpdateDate(): string {
		return this._lastUpdateDate;
	}

	set lastUpdateDate(value: string) {
		this._lastUpdateDate = value;
	}

	get confDialOutDisabled(): string {
		return this._confDialOutDisabled;
	}

	set confDialOutDisabled(value: string) {
		this._confDialOutDisabled = value;
	}

	get playEntryTone(): boolean {
		return this._playEntryTone;
	}

	set playEntryTone(value: boolean) {
		this._playEntryTone = value;
	}

	get userId(): string {
		return this._userId;
	}

	set userId(value: string) {
		this._userId = value;
	}

	get muteUponEntry(): boolean {
		return this._muteUponEntry;
	}

	set muteUponEntry(value: boolean) {
		this._muteUponEntry = value;
	}
}

module.exports.Conference = Conference;
export {Conference};
