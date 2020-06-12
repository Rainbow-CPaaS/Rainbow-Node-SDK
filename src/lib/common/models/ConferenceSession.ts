"use strict";

import {List} from "ts-generic-collections-linq";
import {Appreciation, Channel} from "./Channel";

export {};

/// <summary>
/// Define a participant to a conference
///
/// The Id of the particpant is NOT AT ALL related to the Id of a <see cref="Contact"/>
///
/// The Jid_im of the participant can be compared to the Jid_im of a <see cref="Contact"/>
/// </summary>
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

    /// <summary>
    /// <see cref="Boolean"/> - To know if the participant has the audio or not
    /// </summary>
    private _connected: boolean // { get; set; }

    constructor() {
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

    /// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    public ToString(): string {
        let tab = "- ";
        let result = "";
        // let result = String.Format($"Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}PhoneNumber:[{PhoneNumber}] {tab}Moderator:[{Moderator}] {tab}Muted:[{Muted}] {tab}Hold:[{Hold}] {tab}Connected:[{Connected}]");
        return result;
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
    private _media: List<string>; // { get; set; }

    constructor() {
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

    /// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    public ToString(): string {
        let tab = "- ";
        let result = "";
        // let result = String.Format($"Id:[{Id}] {tab}Jid_im:[{Jid_im}] {tab}MediaType:[{String.Join(", ", Media.ToArray())}]");
        return result;
    }
}

/// <summary>
/// To describe a Conference in progress in a Bubble
///
/// Id of the Conference is related to a Bubble using Bubble.ConfEndpoints.ConfEndpointId
/// </summary>
class ConferenceSession {
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

    /// <summary>
    /// <see cref="Boolean"/> - To know if the conference is recorded
    /// </summary>
    private _recordStarted: boolean; // { get; set; }

    /// <summary>
    /// <see cref="String"/> - Media type used in this conference. See <see cref="Bubble.MediaType"/> for possible values.
    /// </summary>
    private _mediaType: string; // { get; set; }

    /// <summary>
    /// <see cref="T:List{Participant}"/> - List of <see cref="Participant"/>
    /// </summary>
    private _participants: List<Participant>; // { get; set; }

    /// <summary>
    /// <see cref="T:List{Publisher}"/> - List of <see cref="Publisher"/>
    /// </summary>
    private _publishers: List<Publisher>; // { get; set; }

    /// <summary>
    /// <see cref="T:List{String}"/> - List of talkers (using the ID of the participant)
    /// </summary>
    private _talkers: List<String>; //{ get; set; }

    constructor() {

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

    get talkers(): List<String> {
        return this._talkers;
    }

    set talkers(value: List<String>) {
        this._talkers = value;
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
        let result = "";
        /*
                    if (Talkers != null)
                        talkersStr = (Talkers.Count > 0) ? " [" + String.Join("], [", Talkers.ToArray()) + "] " : "";

                    let result = String.Format($"{tab}Id:[{Id}] {tab}Active:[{Active}] {tab}Muted:[{Muted}] {tab}Locked:[{Locked}] {tab}RecordStarted:[{RecordStarted}] {tab}MediaType:[{MediaType}]" +
                        $"  {tab}Participants:[{participantsStr}]" +
                        $"  {tab}Publishers:[{publishersStr}]" +
                        $"  {tab}Talkers:[{talkersStr}]" );
        */

        return result;
    }
}

module.exports.ConferenceSession = ConferenceSession;
export {ConferenceSession};
