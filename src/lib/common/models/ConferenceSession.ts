"use strict";

import {List} from "ts-generic-collections-linq";
import {MEDIATYPE} from "../../connection/RESTService";
import {Contact} from "./Contact";
import {Bubble} from "./Bubble";

export {};

/// <summary>
/// Define a participant to a conference
///
/// The Id of the particpant is NOT AT ALL related to the Id of a <see cref="Contact"/>
///
/// The Jid_im of the participant can be compared to the Jid_im of a <see cref="Contact"/>
/// </summary>
/**
 * @class
 * @name Participant
 * @public
 * @description
 *      This class Define a participant to a conference. <br>
 */
class Participant {
    /// <summary>
    /// <see cref="String"/> - Id of the participant. CANNNOT BE COMPARED to Id of a <see cref="Contact"/>
    /// </summary>
    private _id: string; // { get; set; }

    /// <summary>
    /// <see cref="String"/> - Jid of the participant. Can be compared to Jid_im of a <see cref="Contact"/>
    /// </summary>
    private _jid_im: string; // { get; set; }

    /// <summary>
    /// <see cref="String"/> - Phone number of the participant to join the conference (if any)
    /// </summary>
    private _phoneNumber: string; // { get; set; }

    /// <summary>
    /// <see cref="Boolean"/> - To know if the participant is a moderator
    /// </summary>
    private _moderator: boolean; // { get; set; }

    /// <summary>
    /// <see cref="Boolean"/> - To know if the participant is muted
    /// </summary>
    private _muted: boolean; // { get; set; }

    /// <summary>
    /// <see cref="Boolean"/> - To know if the participant is hold
    /// </summary>
    private _hold: boolean; // { get; set; }

    private _talking : boolean;
    private _talkingTime : number;
    private _microphone : boolean;
    private _delegateCapability : boolean;
    
    /// <summary>
    /// <see cref="Boolean"/> - To know if the participant has the audio or not
    /// </summary>
    private _connected: boolean // { get; set; }

    private _contact: Contact;
    
    private _associatedUserId : string;
    private _associatedGroupName : string;
    private _isOwner : boolean;

    constructor(id: string) {
        this._id = id;
    }

    /**
     *
     *  @name id
     * @return {string}
     * @description
     *    get the id of the participant. The Id of the particpant is NOT AT ALL related to the Id of a Contact.
     */
    get id(): string {
        return this._id;
    }

    /**
     *
     *  @name id
     * @param {string} value
     * @description
     *    set the id of the participant. The Id of the particpant is NOT AT ALL related to the Id of a Contact.
     */
    set id(value: string) {
        this._id = value;
    }

    get jid_im(): string {
        return this._jid_im;
    }

    set jid_im(value: string) {
        this._jid_im = value;
    }

    get phoneNumber(): string {
        return this._phoneNumber;
    }

    set phoneNumber(value: string) {
        this._phoneNumber = value;
    }

    get moderator(): boolean {
        return this._moderator;
    }

    set moderator(value: boolean) {
        this._moderator = value;
    }

    get muted(): boolean {
        return this._muted;
    }

    set muted(value: boolean) {
        this._muted = value;
    }

    get hold(): boolean {
        return this._hold;
    }

    set hold(value: boolean) {
        this._hold = value;
    }

    get connected(): boolean {
        return this._connected;
    }

    set connected(value: boolean) {
        this._connected = value;
    }

    get contact(): Contact {
        return this._contact;
    }

    set contact(value: Contact) {
        this._contact = value;
    }

    get talkingTime(): number {
        return this._talkingTime;
    }

    set talkingTime(value: number) {
        this._talkingTime = value;
    }

    get talking(): boolean {
        return this._talking;
    }

    set talking(value: boolean) {
        this._talking = value;
    }

    get microphone(): boolean {
        return this._microphone;
    }

    set microphone(value: boolean) {
        this._microphone = value;
    }

    get delegateCapability(): boolean {
        return this._delegateCapability;
    }

    set delegateCapability(value: boolean) {
        this._delegateCapability = value;
    }

    get associatedUserId(): string {
        return this._associatedUserId;
    }

    set associatedUserId(value: string) {
        this._associatedUserId = value;
    }

    get associatedGroupName(): string {
        return this._associatedGroupName;
    }

    set associatedGroupName(value: string) {
        this._associatedGroupName = value;
    }

    get isOwner(): boolean {
        return this._isOwner;
    }

    set isOwner(value: boolean) {
        this._isOwner = value;
    }

    /// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    public ToString(): string {
        let tab = "- ";
        let result = "";
        // let result = String.Format($"Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]");
        return `Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]`;
    }
}

/**
 * @class
 * @name Talker
 * @public
 * @description
 *      This class Define a participant talking in a conference. <br>
 */
class Talker {
    private _participant: Participant;
    private _talkingTime: number;
    private _publisher: boolean;
    private _simulcast: boolean;

    constructor(participant: Participant) {
        this._participant = participant;
    }

    get participant(): Participant {
        return this._participant;
    }

    set participant(value: Participant) {
        this._participant = value;
    }

    get talkingTime(): number {
        return this._talkingTime;
    }

    set talkingTime(value: number) {
        this._talkingTime = value;
    }

    get publisher(): boolean {
        return this._publisher;
    }

    set publisher(value: boolean) {
        this._publisher = value;
    }

    get simulcast(): boolean {
        return this._simulcast;
    }

    set simulcast(value: boolean) {
        this._simulcast = value;
    }

    public ToString(): string {
        let tab = "- ";
        let result = "";
        // let result = String.Format($"Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]");
        return `participant Id:[{_participant.id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]`;
    }
}

/**
 * @class
 * @name Silent
 * @public
 * @description
 *      This class Define a participant talking in a conference. <br>
 */
class Silent {
    private _participant: Participant;
    private _talkingTime: string;
    private _publisher: boolean;
    private _simulcast: boolean;

    constructor(participant: Participant) {
        this._participant = participant;
    }

    get participant(): Participant {
        return this._participant;
    }

    set participant(value: Participant) {
        this._participant = value;
    }

    get talkingTime(): string {
        return this._talkingTime;
    }

    set talkingTime(value: string) {
        this._talkingTime = value;
    }

    get publisher(): boolean {
        return this._publisher;
    }

    set publisher(value: boolean) {
        this._publisher = value;
    }

    get simulcast(): boolean {
        return this._simulcast;
    }

    set simulcast(value: boolean) {
        this._simulcast = value;
    }

    public ToString(): string {
        let tab = "- ";
        let result = "";
        // let result = String.Format($"Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]");
        return `participant Id:[{_participant.id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]`;
    }
}

/// <summary>
/// Define a publisher to a conference
///
/// The Id of the particpant is NOT AT ALL related to the Id of a <see cref="Contact"/>
///
/// The Jid_im of the participant can be compared to the Jid_im of a <see cref="Contact"/>
/// </summary>
class Publisher {
    get simulcast(): boolean {
        return this._simulcast;
    }

    set simulcast(value: boolean) {
        this._simulcast = value;
    }
    /// <summary>
    /// <see cref="String"/> - Id of the publisher. CANNNOT BE COMPARED to Id of a <see cref="Contact"/>
    /// </summary>
    private _id: string; // { get; set; }

    /// <summary>
    /// <see cref="String"/> - Jid of the publisher. Can be compared to Jid_im of a <see cref="Contact"/>
    /// </summary>
    private _jid_im: string; // { get; set; }

    /// <summary>
    /// <see cref="T:List{String}"/> - List of media used by the publisher - can be "sharing" or "video"
    /// </summary>
    private _media: List<string> = new List<string>(); // { get; set; }

    private _participant : Participant;
    private _simulcast: boolean;

    get participant(): Participant {
        return this._participant;
    }

    set participant(value: Participant) {
        this._participant = value;
    }

//    private _contact: Contact;

    constructor(id) {
        this.id = id;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get jid_im(): string {
        return this._jid_im;
    }

    set jid_im(value: string) {
        this._jid_im = value;
    }

    get media(): List<string> {
        return this._media;
    }

    set media(value: List<string>) {
        this._media = value;
    }

/*
    get contact(): Contact {
        return this._contact;
    }

    set contact(value: Contact) {
        this._contact = value;
    }
*/

    /// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    public ToString(): string {
        let tab = "- ";
        let result = `Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}MediaType:[{String.Join(", ", Media.ToArray())}]`;
        // let result = String.Format($"Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}MediaType:[{String.Join(", ", Media.ToArray())}]");
        return result;
    }
}


class Service {
    private _serviceId: string;
    private _serviceType: string;

    get serviceId(): string {
        return this._serviceId;
    }

    set serviceId(value: string) {
        this._serviceId = value;
    }

    get serviceType(): string {
        return this._serviceType;
    }

    set serviceType(value: string) {
        this._serviceType = value;
    }

    constructor () {}
}

/// <summary>
/// To describe a Conference in progress in a Bubble
///
/// Id of the Conference is related to a Bubble using Bubble.ConfEndpoints.ConfEndpointId
/// </summary>
class ConferenceSession {
    
    get bubble(): Bubble {
        return this._bubble;
    }
    
    set bubble(value:Bubble) {
        this._bubble = value;
    }

    get ownerJidIm(): string {
        return this._ownerJidIm;
    }

    set ownerJidIm(value: string) {
        this._ownerJidIm = value;
    }
    get services(): List<Service> {
        return this._services;
    }

    set services(value: List<Service>) {
        this._services = value;
    }
    /// <summary>
    /// <see cref="string"/> - Id of the conference - it's equal to Bubble.ConfEndpoints.ConfEndpointId
    /// </summary>
    private _id: string; //{ get; set; }

    /// <summary>
    /// <see cref="Boolean"/> - To know if the conference is active
    /// </summary>
    private _active: boolean; //{ get; set; }

    /// <summary>
    /// <see cref="Boolean"/> - To know if the conference is muted. Guest can not be heard if muted.
    /// </summary>
    private _muted: boolean; // { get; set; }

    /// <summary>
    /// <see cref="Boolean"/> - To know if the conference is locked. No new participant can join the conference if locked.
    /// </summary>
    private _locked: boolean; // { get; set; }
    
    private _talkerActive: boolean;

    /// <summary>
    /// <see cref="Boolean"/> - To know if the conference is recorded
    /// </summary>
    private _recordStarted: boolean; // { get; set; }
    
    private _recordingState: boolean; // { get; set; }
    
    private _recordingUserId: boolean; // { get; set; }

    private _participantCount: number;
    
    /// <summary>
    /// <see cref="String"/> - Media type used in this conference. See <see cref="Bubble.MediaType"/> for possible values.
    /// </summary>
    private _mediaType: string; // { get; set; }
    
/*
    This value is an initial value provided with <conference-state> node in <conference-info> node in Message stanza. It has to be increment by us when a participant or publisher is added.
    private _participantCount : number;    
    private _publisherCount : number;
*/

    private _reason : string;
    /// <summary>
    /// <see cref="T:List{Participant}"/> - List of <see cref="Participant"/>
    /// </summary>
    private _participants: List<Participant> = new List<Participant>(); // { get; set; }

    /// <summary>
    /// <see cref="T:List{Publisher}"/> - List of <see cref="Publisher"/>
    /// </summary>
    private _publishers: List<Publisher> = new List<Publisher>(); // { get; set; }

    /// <summary>
    /// <see cref="T:List{String}"/> - List of talkers (using the ID of the participant)
    /// </summary>
    private _talkers: List<Talker> = new List<Talker>(); //{ get; set; }
    
    private _silents: List<Silent> = new List<Silent>(); //{ get; set; }
    private _replacedByConference: ConferenceSession;
    private _replaceConference: ConferenceSession;

    private _services: List<Service> = new List<Service>();
    private _ownerJidIm : string ;
    private _bubble: Bubble;

    constructor(id: string, participants: List<Participant> = new List (), mediaType: MEDIATYPE = MEDIATYPE.WEBRTC) {
        let that = this;
        that._id = id;
        that._participants = participants;
        that._mediaType = mediaType;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
    }

    get muted(): boolean {
        return this._muted;
    }

    set muted(value: boolean) {
        this._muted = value;
    }

    get locked(): boolean {
        return this._locked;
    }

    set locked(value: boolean) {
        this._locked = value;
    }

    get recordStarted(): boolean {
        return this._recordStarted;
    }

    set recordStarted(value: boolean) {
        this._recordStarted = value;
    }

    get recordingState(): boolean {
        return this._recordingState; 
    }

    set recordingState(value: boolean) {
        this._recordingState = value;
    }

    get recordingUserId(): boolean {
        return this._recordingUserId;
    }

    set recordingUserId(value: boolean) {
        this._recordingUserId = value;
    }

    get participantCount(): number {
        return this._participantCount;
    }

    set participantCount(value: number) {
        this._participantCount = value;
    }

    get mediaType(): string {
        return this._mediaType;
    }

    set mediaType(value: string) {
        this._mediaType = value;
    }

    get participants(): List<Participant> {
        return this._participants;
    }

    set participants(value: List<Participant>) {
        this._participants = value;
    }

    get publishers(): List<Publisher> {
        return this._publishers;
    }

    set publishers(value: List<Publisher>) {
        this._publishers = value;
    }

    get talkers(): List<Talker> {
        return this._talkers;
    }

    set talkers(value: List<Talker>) {
        this._talkers = value;
    }

    get silents(): List<Silent> {
        return this._silents;
    }

    set silents(value: List<Silent>) {
        this._silents = value;
    }

    get talkerActive(): boolean {
        return this._talkerActive;
    }

    set talkerActive(value: boolean) {
        this._talkerActive = value;
    }

/*
    get participantCount(): number {
        return this._participantCount;
    }

    set participantCount(value: number) {
        this._participantCount = value;
    }

    get publisherCount(): number {
        return this._publisherCount;
    }

    set publisherCount(value: number) {
        this._publisherCount = value;
    }
// */

    get reason(): string {
        return this._reason;
    }

    set reason(value: string) {
        this._reason = value;
    }

    get replacedByConference(): ConferenceSession {
        return this._replacedByConference;
    }

    set replacedByConference(value: ConferenceSession) {
        this._replaceConference = null; // can not replace a conf if this conf is replaced.
        this._replacedByConference = value;
    }

    get replaceConference(): ConferenceSession {
        return this._replaceConference;
    }

    set replaceConference(conference: ConferenceSession) {
        let that = this;
        that._replaceConference = conference;
        /*that.participants = conference.participants;
        that.publishers = conference.publishers ;
        that.talkers = conference.talkers ;
        that.silents = conference.silents ;
        // */
        conference.reset();
        conference.active = false;
        conference.replacedByConference = that;
    }

    /// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    public ToString(): string {
        let that = this;
        let tab = "\r\n\t";

        let participantsStr = "";
        if (that._participants != null) {
            /*
                            foreach(Participant participant in Participants)
                            {
                                if (String.IsNullOrEmpty(participantsStr))
                                    participantsStr += String.Format($" [{participant.ToString()}]");
                                else
                                    participantsStr += String.Format($"{tab}\t[{participant.ToString()}] ");
                            }
            */
        }

        let publishersStr = "";
        if (that._publishers != null) {
            /* foreach (Publisher publisher in Publishers)
             {
                 if (String.IsNullOrEmpty(publishersStr))
                     publishersStr += String.Format($" [{publisher.ToString()}]");
                 else
                     publishersStr += String.Format($"{tab}\t[{publisher.ToString()}] ");
             }*/
        }

        let talkersStr = "";
        let result = "" + this.id;
        /*
                    if (Talkers != null)
                        talkersStr = (Talkers.Count > 0) ? " [" + String.Join("], [", Talkers.ToArray()) + "] " : "";

                    let result = String.Format($"{tab}Id:[{Id}] {tab}Active:[{Active}] {tab}Muted:[{Muted}] {tab}Locked:[{Locked}] {tab}RecordStarted:[{RecordStarted}] {tab}MediaType:[{MediaType}]" +
                        $"  {tab}Participants:[{participantsStr}]" +
                        $"  {tab}Publishers:[{publishersStr}]" +
                        $"  {tab}Talkers:[{talkersStr}]" );
        */

        //result = this;
        //result = JSON.stringify(this);
        return result;
    }

    reset() {
        let that = this;
/*
        that._participants = new List<Participant>(); // { get; set; }
        that._publishers = new List<Publisher>(); // { get; set; }
        that._talkers = new List<Talker>(); //{ get; set; }
        that._silents = new List<Silent>(); //{ get; set; }
// */
        that._participants.clear();
        that._publishers.clear();
        that._talkers.clear();
        that._silents.clear();
        /*that._active = false;
        that._locked = false;
        that._talkerActive = false;
        // */
    }
}

module.exports.Talker = Talker;
module.exports.Silent = Silent;
module.exports.Publisher = Publisher;
module.exports.Participant = Participant;
module.exports.Service = Service;
module.exports.ConferenceSession = ConferenceSession;
export {Publisher, Participant, ConferenceSession, Talker, Silent, Service};
