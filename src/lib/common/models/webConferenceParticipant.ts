import { Contact } from "./Contact";

/**
 * @module
 * @name WebConferenceParticipant
 * @description
 * This class is used to represent a web conference participant object that 
 * is part of the WebConferenceSession
 */
export class WebConferenceParticipant {
    /**
     * @public
     * @name id
     * @description The ID of the participant;
     * @type {string}
     * @readonly
     */
    public id: string;

    /**
     * @public
     * @name contact
     * @description Contact object related to the web conference participant
     * @type {Contact}
     * @readonly
     */
    public contact: Contact;

    /**
     * @public
     * @name isVideoAvailable
     * @description Whether the participant is currently publishing his video in the conference
     * @type {boolean}
     * @readonly
     */
    public isVideoAvailable: boolean;

    /**
     * @public
     * @name videoSession
     * @description The current video session related to that participant. If the session is null but the 'isVideoAvailable' 
     * is true, then we can subscribe to this participant video. 
     * @type {any}
     * @readonly
     */
    public videoSession: any;

    /**
     * @public
     * @name mute
     * @description Whether the participant is currently muted
     * @type {boolean}
     * @readonly
     */
    public mute: boolean;

    /**
     * @public
     * @name noMicrophone
     * @description Whether the participant has joined without microphone
     * @type {boolean}
     * @readonly
     */
    public noMicrophone: boolean;

    /**
     * @public
     * @name role
     * @description The current role of the participant. It could be either a moderator, or participant
     * @type {string}
     * @readonly
     */
    public role: string;

    /**
     * @public
     * @name isSharingParticipant
     * @description Whether the current participant object is a sharing participant (in this case, the videoSession object is related to the sharing session)
     * @type {boolean}
     * @readonly
     */
    public isSharingParticipant: boolean;

    /**
     * @public
     * @name delegateCapability
     * @description Indicates whether the conference can be delegated to the current participant
     * @type {boolean}
     * @readonly
     */
    public delegateCapability: boolean;

    public subscriptionInProgress: boolean;

    public static create(id: string) { return new WebConferenceParticipant(id); }

    constructor(id: string) { 
        this.id = id; 
        this.subscriptionInProgress = false;
        this.mute = false;
        this.noMicrophone = false;
        this.isVideoAvailable = false;
        this.delegateCapability = false;
    }
}
