import { Subject, Subscription } from "rxjs";
import { Bubble } from "./Bubble.js";
import { WebConferenceParticipant } from "./webConferenceParticipant.js";

/**
 * @module
 * @name WebConferenceSession
 * @description
 * This class is used to represent a web conference session containing
 * all the relevant information to the current conference session
 */
export class WebConferenceSession {
    /**
     * @public
     * @name id
     * @description Conference Session ID. This is a global reference of the conference session
     * @type {string}
     * @readonly
     */
    public id: string;

    /**
     * @public
     * @name bubble
     * @description The Bubble object related to the conference
     * @type {Bubble}
     * @readonly
     */
    public bubble: Bubble;

    /**
     * @public
     * @name status
     * @description The current status of the conference. It could be "connecting", "connected", "reconnecting", "ended"
     * @type {string}
     * @readonly
     */
    public status: string;

    /**
     * @public
     * @name duration
     * @description The current duration of the conference (in seconds)
     * @type {number}
     * @readonly
     */
    public duration: number;

    /**
     * @public
     * @name localParticipant
     * @description Yourself in the conference
     * @type {WebConferenceParticipant}
     * @readonly
     */
    public localParticipant: WebConferenceParticipant;

    /**
     * @public
     * @name participants
     * @description The list of other participants currently connected in the conference
     * @type {WebConferenceParticipant[]}
     * @readonly
     */
    public participants: WebConferenceParticipant[];

    /**
     * @public
     * @name hasLocalSharing
     * @description Boolean indicating whether the current user is currently sharing his screen
     * @type {boolean}
     * @readonly
     */
    public hasLocalSharing: boolean = false;

    /**
     * @public
     * @name localSharingSession
     * @description The local sharing session (as a JINGLE SESSION object) or null 
     * @type {any}
     * @readonly
     */
    public localSharingSession: any;

    /**
     * @public
     * @name audioSession
     * @description The Audio session related to the web conference. (represented as a Jingle Session object)
     * @type {any}
     * @readonly
     */
    public audioSession: any;

    private sharingParticipant: WebConferenceParticipant;
    
    private pinnedParticipant: any;
    
    /*
    * PRIVATE UCAAS PARAMETERS NOT TO BE USED BY SDK
    */
    public type: string = "v2";
    public haveJoined: boolean = false;
    public isInExternalWindow: boolean = false;
    public conferenceView: string;
    public externalWindowRef: any;
    public isOnlySharingWindow: boolean = false;
    public control: any = {
        activeControl: false,
        hasRemoteControlling: false,
        controller: null,
        controlled: null
    };
    public conferenceLayoutSize: any = {};
    public record: any = {
        isRecording: false,
        recordingIsPaused: false
    };

    public recordingStarted: boolean = false;
    public currentRecordingState: string = "";
    public isMyConference: boolean = false;
    public dimLocalSharingScreen: boolean = false;
    public localStreams: any;
    public jingleJid: string;
    public originalVideoStream: any = null;
    public metricsId: string;
    public metricsState: string;

    private durationTimer: any;
    private locked: boolean;

    public static create(id: string, bubble: Bubble) { return new WebConferenceSession(id, bubble); }

    constructor(id: string, bubble: Bubble) {
        this.id = id;
        this.bubble = bubble;
        this.duration = 0;
        this.participants = [];
        this.conferenceView = "grid_view";
        this.duration = 0;
        this.haveJoined = false;
        this.isMyConference = false;
        this.pinnedParticipant = null;
        this.locked = false;
        this.localStreams = [];
    }

    /**
     * @public
     * @function getParticipants
     * @instance
     * @description
     *    Get a list of all connected participants in the conference (except for yourself)
     * @returns {WebConferenceParticipant[]} Return an array of all WebConferenceParticipants taking part of the web conference
     */
    public getParticipants() {
        return this.participants;
    }

    /**
     * @public
     * @function getLocalParticipant
     * @instance
     * @description
     *    Get yourself as a web conference participant
     * @returns {WebConferenceParticipant} Return the current user as a web conference participant connected to the conference  
     */
    public getLocalParticipant() {
        return this.localParticipant;
    }

    /**
     * @public
     * @function getBubble
     * @instance
     * @description
     *    Get the bubble related to the web conference session
     * @returns {Bubble} Get the bubble related to the web conference session
     */
    public getBubble() {
        return this.bubble;
    }

    /**
     * @public
     * @function getAudioSession
     * @instance
     * @description
     *    Get the jingle audio session related to the conference session
     * @returns {any} The jingle audio session related to the conference session
     */
    public getAudioSession() {
        return this.audioSession;
    }

    /**
     * @public
     * @function getSharingParticipant
     * @instance
     * @description
     *    Get web conference participant object that is currently sharing in the conference (could not be myself)
     * @returns {WebConferenceParticipant} Web conference participant object that is currently sharing (could not be myself)
     */
    public getSharingParticipant() {
        return this.sharingParticipant;
    }

    /**
     * @public
     * @function getLocalSharingSession
     * @instance
     * @description
     *    Get the local sharing session (if any)
     * @returns {any} The local sharing session (or null)
     */
    public getLocalSharingSession() {
        return this.localSharingSession;
    }

    /**
     * @public
     * @function getRemoteSharingSession
     * @instance
     * @description
     *    Get the remote sharing session (if any)
     * @returns {any} The remote sharing session (or null) from the sharing participant object
     */
    public getRemoteSharingSession() {
        return (this.sharingParticipant) ? this.sharingParticipant.videoSession : null;
    }

    /**
     * @public
     * @function getParticipantById
     * @instance
     * @param {string} participantId the ID of the participant to find
     * @description
     *    Find and return a participant by his Id
     * @returns {WebConferenceParticipant} The WebConferenceParticipant (if found) by his id
     */
    public getParticipantById(participantId: string): WebConferenceParticipant {
        if (this.localParticipant.id === participantId) return this.localParticipant;
        const participant = this.participants.find((part: WebConferenceParticipant) => { return part.id === participantId; });
        return participant;
    }

    /**
     * @public
     * @function isLock
     * @instance
     * @description
     *    Check if the current web conference is locked. In case it's locked, no other user is allowed to join it 
     * @returns {boolean} Return a boolean value indicating whether the web conference is currently locked
     */
    public isLocked() {
        return this.locked;
    }

    /**
     * @public
     * @function getDelegateParticipantsList
     * @instance
     * @description
     *    Get the list of participants to whom we can delegate the current conference. Delegation means that we give 
     *    the ownership of the conference to another user
     * @returns {Array} Return an array of WebConferenceParticipant to whom we can delegate the conference
     */
    public getDelegateParticipantsList() {
        return this.participants.filter((participant) => {
            return participant.delegateCapability;
        });
    }

    /*
    * PRIVATE UCAAS FUNCTIONS NOT TO BE USED BY SDK
    */

    public addOrUpdateParticipant(participant: WebConferenceParticipant) {
        if (this.localParticipant.id === participant.id) { 
            this.localParticipant.mute = participant.mute; 
            // this.localParticipant.rxSubject.next('updateInfo');
            return;
        }

        const participantIndex = this.participants.findIndex((part: WebConferenceParticipant) => { return part.id === participant.id; });
        if (participantIndex !== -1) { 
            const existingParticipant = this.participants[participantIndex];
            existingParticipant.mute = participant.mute;
            // existingParticipant.rxSubject.next('updateInfo');
        }
        else { this.participants.push(participant); }  
    }

    public startDuration() {
        if (this.durationTimer) return;
        this.durationTimer = setInterval(() => {
            this.duration++;
        }, 1000);
    }

    public stopDuration() {
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
            this.durationTimer = null;
            this.duration = 0;
        }
    }

    public getPinnedParticipant(): any {
        //check if participant is still here
        if (this.pinnedParticipant) {
            const checkPinnedParticipant = this.getParticipantByIdAndMediaType(this.pinnedParticipant.id, this.pinnedParticipant.mediaType);
            if (!checkPinnedParticipant) this.pinnedParticipant = null;
        }
        
        return this.pinnedParticipant;
    }

    public updatePinnedParticipant(participant: WebConferenceParticipant = null, mediaType: string = ""): void {
        if (!participant) {
            this.pinnedParticipant = null;
            return;
        }
        //pin participant
        this.pinnedParticipant = {
            id: participant.id,
            mediaType: mediaType
        };
    }

    public setLocked(lock: boolean = false) {
        this.locked = lock;
    }

    public setSharingParticipant(participant: WebConferenceParticipant = null) {
        if (!participant && this.sharingParticipant.videoSession) {
            this.sharingParticipant.videoSession.terminate();
            this.sharingParticipant.videoSession = null;
        }
        this.sharingParticipant = participant;
    }

    private getParticipantByIdAndMediaType(participantId: string, mediaType: string): WebConferenceParticipant {
        if (mediaType === "sharing") {
            if (this.localParticipant.id === participantId) { return (this.hasLocalSharing) ? this.localParticipant : null; }
            if (this.sharingParticipant && this.sharingParticipant.id === participantId) { return this.sharingParticipant; }
        }
        else {
            if (this.localParticipant.id === participantId) { return (this.localParticipant.videoSession) ? this.localParticipant : null; }
            const participant = this.participants.find((part: WebConferenceParticipant) => { return part.id === participantId; });
            if (participant && participant.videoSession) return participant;
        }
        
        return null;
    }

    // public removeParticipant(participantId: string) {
    //     const participantIndex = this.speakerParticipants.findIndex((part: WebinarSessionParticipant) => { return part.id === participantId; });
    //     if (participantIndex !== -1) { this.speakerParticipants.splice(participantIndex, 1); }
    //     if (this.localParticipant && this.localParticipant.id === participantId) { this.localParticipant = null; }
    // }
}
