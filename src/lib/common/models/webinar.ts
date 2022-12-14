"use strict";

import {Appreciation, Channel} from "./Channel.js";

export {};

import { Subject, Subscription } from "rxjs";
import {Contact} from "./Contact.js";

// declare let config: any;
class WebinarSessionParticipant {
    public id: string;
    public contact: Contact = null;
    public activeSpeaker: boolean = false;
    public mute: boolean = false;
    public onStage: boolean = false;
    public sharingOnStage: boolean = false;
    public searchString: string = null;
    public role: string = null;
    public raiseHand: boolean = false;

    public audioVideoSession: any = null;
    //public originalAudioVideoStream: MediaStream = null;
    public originalAudioVideoStream: any = null;
    //public audioVideoStream: MediaStream = null;
    //public audioVideoStream: any = null;
    public audioVideoSubStreamLevel: number = 1;
    //public audioVideoAudioElement: HTMLAudioElement = null;
    public audioVideoAudioElement: any = null;

    public sharingSession: any = null;
    public sharingStream: any = null;
    //public sharingAudioElement: HTMLAudioElement = null;
    public sharingAudioElement: any = null;

    public medias: any = { audio : false, video: false, sharing: false };

    public rxSubject: Subject<any> = new Subject<any>();
    public subStreamLevel: number = -1;

    public static create(id: string) { return new WebinarSessionParticipant(id); }

    constructor(id: string) { this.id = id; }
}

class WebinarSession {

    public jingleJid: string;
    public activeSpeakerId: string = null;
    public localParticipant: WebinarSessionParticipant = null;
    public speakerParticipants: WebinarSessionParticipant[] = [];
    public attendeeParticipants: WebinarSessionParticipant[] = [];
    public raiseHandAttendeeParticipants: WebinarSessionParticipant[] = [];

    public masterMedia: string = null;

    public static create() { return new WebinarSession(); }

    public getParticipantById(participantId: string): WebinarSessionParticipant {
        if (this.localParticipant.id === participantId) return this.localParticipant;

        const speakerParticipant = this.speakerParticipants.find((part: WebinarSessionParticipant) => { return part.id === participantId; });
        if (speakerParticipant) return speakerParticipant;
        
        const attendeeParticipant = this.attendeeParticipants.find((part: WebinarSessionParticipant) => { return part.id === participantId; });
        if (attendeeParticipant) return attendeeParticipant;
        
        return null;
    }

    public addOrUpdateParticipant(participant: WebinarSessionParticipant) {
        if (this.localParticipant.id === participant.id) { 
            this.localParticipant.mute = participant.mute; 
            this.localParticipant.rxSubject.next('updateInfo');
            return;
        }

        const participants = participant.role === 'attendee' ? this.attendeeParticipants : this.speakerParticipants;
        const participantIndex = participants.findIndex((part: WebinarSessionParticipant) => { return part.id === participant.id; });
        if (participantIndex !== -1) { 
            const existingParticipant = participants[participantIndex];
            existingParticipant.mute = participant.mute;
            existingParticipant.rxSubject.next('updateInfo');
        }
        else { participants.push(participant); }   
    }

    public removeParticipant(participantId: string) {
        const participantIndex = this.speakerParticipants.findIndex((part: WebinarSessionParticipant) => { return part.id === participantId; });
        if (participantIndex !== -1) { this.speakerParticipants.splice(participantIndex, 1); }
        if (this.localParticipant && this.localParticipant.id === participantId) { this.localParticipant = null; }
    }
}

class WebinarParticipant {
    public email: string;
    public lastName: string;
    public firstName: string;
    public company: string;
    public jobTitle: string;
    public state: string;
    public userId: string;
    public lastAvatarUpdateDate: string;
    public country: string; 

    public static create(): WebinarParticipant { return new WebinarParticipant(); }

    public getData(): string {
        return JSON.stringify({ 
            email: this.email, 
            userId: this.userId,
            lastName: this.lastName,
            firstName: this.firstName,
            company: this.company,
            jobTitle: this.jobTitle
        });
    }
}

class WebinarCSVStatus {
    public errorDetails: string;
    public okCount: number = 0;
    public errorCount: number = 0;
    public errorReport: any = [];

    public static create(): WebinarCSVStatus { return new WebinarCSVStatus(); }
}

class Webinar {

    public id: string = null;
    public name: string = '';
    public subject: string = '';
    public webinarStartDate: string = null;
    public webinarEndDate: string = null;
    public waitingRoomStartDate: string = null;
    public timeZone: string = null;
    public roomId: string = null;
    public roomModeratorsChatId: string = null;
    //public room: Room = null;
    public room: any = null;
    //public practiceRoom: Room = null;
    public practiceRoom: any = null;
    public organizers: any[] = [];
    public speakers: any[] = [];
    public participants: WebinarParticipant[] = [];

    public pendingParticipantNumber: number = 0;
    public acceptedParticipantNumber: number = 0;
    public rejectedParticipantNumber: number = 0;
    public color: string = '';
    public creatorId: string = null;
    public isCreator: boolean = false;
    public isOrganizer: boolean = false;
    public isSpeaker: boolean = false;
    public isAttendee: boolean = true;
    public password: string = null;
    public approvalRegistrationMethod: string = 'automatic';
    public registrationUuid: string = null;
    public published: boolean = false;
    public moderatorsNotified: boolean = false;
    public status: string = 'upcoming';
    public webinarUrl: string = null;
    public rxSubject: Subject<any> = new Subject<any>();
    public rxParticipantsSubject: Subject<any> = new Subject<any>();
    public isWebinarSync: boolean = true;
    public session: WebinarSession = null;
    public waitingRoomMultimediaURLs: string[] = [];
    public stageBackground: string = 'hop';
    
    public blur: boolean = false;
    public bgReplaceUrl: string = null;

    public action: string = null;
    public serverURL: string;
    

    public static create(_serverURL) {
        return new Webinar(_serverURL); 
    }

    public static createFromData(webinarData: any, _serverURL : string ) {
        const webinar = new Webinar(_serverURL);
        Webinar.updateFromData(webinar, webinarData);
        return webinar;
    }

    public static updateFromData(webinar: Webinar, webinarData: any) {

        // Fill data
        if (webinarData.id) { webinar.id = webinarData.id; }
        if (webinarData.isActive) { webinar.status = 'inProgress'; }
        if (webinarData.name) { webinar.name = webinarData.name; }
        if (webinarData.subject) { webinar.subject = webinarData.subject; }
        if (webinarData.webinarStartDate) { webinar.webinarStartDate = webinarData.webinarStartDate; }
        if (webinarData.webinarEndDate) { webinar.webinarEndDate = webinarData.webinarEndDate; }
        if (webinarData.waitingRoomStartDate) { webinar.waitingRoomStartDate = webinarData.waitingRoomStartDate; }
        if (webinarData.timeZone) { webinar.timeZone = webinarData.timeZone; }
        if (webinarData.roomId) { webinar.roomId = webinarData.roomId; }
        if (webinarData.roomModeratorsChatId) { webinar.roomModeratorsChatId = webinarData.roomModeratorsChatId; }
        if (webinarData.organizers) { webinar.organizers = webinarData.organizers; }
        if (webinarData.speakers) { webinar.speakers = webinarData.speakers; }
        if (webinarData.participants) { webinar.participants = webinarData.participants; }
        if (webinarData.creatorId) { webinar.creatorId = webinarData.creatorId; }
        if (webinarData.password) { webinar.password = webinarData.password; }
        if (webinarData.approvalRegistrationMethod) { webinar.approvalRegistrationMethod = webinarData.approvalRegistrationMethod; }
        if (webinarData.registrationUuid) { webinar.registrationUuid = webinarData.registrationUuid; }
        if (webinarData.emailNotification) { webinar.published = webinarData.emailNotification; }
        if (webinarData.moderatorsSelectedAnNotified) { webinar.moderatorsNotified = webinarData.moderatorsSelectedAnNotified; }
        if (webinarData.waitingRoomMultimediaURL) { webinar.waitingRoomMultimediaURLs = webinarData.waitingRoomMultimediaURL; }
        if (webinarData.stageBackground) { webinar.stageBackground = webinarData.stageBackground; }

        // Handle moderators
        webinar.organizers.forEach((organizer: any) => { organizer.role = 'organizer'; });
        webinar.speakers.forEach((speaker: any) => { speaker.role = 'speaker'; });
       
        if (webinarData.guestSpeakers) { 
            webinarData.guestSpeakers.forEach((guestSpeaker: any) => {
                webinar.speakers.push({ status: 'invited', email: guestSpeaker.email, role: 'speaker' });
            });
        }

        webinar.pendingParticipantNumber = 0;
        webinar.acceptedParticipantNumber = 0;
        webinar.rejectedParticipantNumber = 0;

        webinar.participants.forEach((participant: any) => {
            switch (participant.state) {
                case 'pending': webinar.pendingParticipantNumber++; break;
                case 'approved': webinar.acceptedParticipantNumber++; break;
                case 'rejected': webinar.rejectedParticipantNumber++; break;
                default: break;
            }
        });

        // Compute default color
        if (webinar.name.length) { webinar.color = Webinar.computeWebinarColor(webinar.name); }

        // Compute webinarURL
        //webinar.webinarUrl = `${config.webservices.protocol}://webinar.${config.webservices.server.replace(".red", ".com")}/${webinar.registrationUuid}`;
        webinar.webinarUrl = webinar.serverURL; //`${config.webservices.protocol}://webinar.${config.webservices.server.replace(".red", ".com")}/${webinar.registrationUuid}`;
       /* 
        if (window.location.origin.indexOf("localhost") !== -1) { webinar.webinarUrl = `localhost:9000/#/webinar/${webinar.registrationUuid}`; }
        if (window.location.origin.indexOf("demo") !== -1) { webinar.webinarUrl = `https://web-demo.openrainbow.org/#/webinar/${webinar.registrationUuid}`; }
        if (config.enableAioUrlMode) { webinar.webinarUrl = `${config.webservices.protocol}://${config.webservices.server.replace(".red", ".com")}/#/webinar/${webinar.registrationUuid}`; }
        // */
        
        //  Update tag status
        return webinar;
    }

    public static computeWebinarColor(name: string) {
        const upperCaseWebinarName = name.toUpperCase();
        const colors = ["#d3a575", "#eb8d8d", "#d47ab0", "#b38deb", "#9aa3ed", "#76a6e5", "#92d0de", "#a7d6bc", "#99c86b", "#b4d43d", "#dcd33b", "#eec838"];
        let sum = 0;
        for (let i = 0; i < upperCaseWebinarName.length; i++) { sum += upperCaseWebinarName.charCodeAt(i); }
        return colors[sum % 12];
    }

    public constructor(_serverURL : string) {
        this.serverURL = _serverURL;
    }

    public subscribe(handler: any): Subscription { return this.rxSubject.subscribe(handler); }

    public getData(): string {
        const data: any = {
            name: this.name,
            subject: this.subject,
            webinarStartDate: this.webinarStartDate,
            webinarEndDate: this.webinarEndDate,
            waitingRoomStartDate: this.waitingRoomStartDate,
            timeZone: this.timeZone,
            isOrganizer: true,
            approvalRegistrationMethod: this.approvalRegistrationMethod,
            passwordNeeded: false,
            waitingRoomMultimediaURL: this.waitingRoomMultimediaURLs,
            stageBackground: this.stageBackground
        };
        return JSON.stringify(data);
    }

    public updateRaiseHandParticipants(): void {
        if (this.session) {
            this.session.raiseHandAttendeeParticipants = this.session.attendeeParticipants.filter((participant: WebinarSessionParticipant) => { return participant.raiseHand; });
        }
    }

    public getTagInfo(): any {
        switch (this.status) {
            case 'upcoming': return this.session ? { label: this.isAttendee ? 'webinarWaitingRoom' : 'webinarPractice', 'class': this.isAttendee ? 'waitingRoom' : 'practice' } : null; 
            case 'inProgress': return { label: 'webinarLive', 'class': 'live' };
            case 'terminated': return { label: 'webinarTerminated', 'class': 'terminated' };
            default: return null;
        }
    }
}

// module.exports.WebinarSessionParticipant = WebinarSessionParticipant;
// module.exports.WebinarSession = WebinarSession;
// module.exports.WebinarParticipant = WebinarParticipant;
// module.exports.WebinarCSVStatus = WebinarCSVStatus;
// module.exports.Webinar = Webinar;
export {WebinarSessionParticipant, WebinarSession, WebinarParticipant, WebinarCSVStatus, Webinar};
