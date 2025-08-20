"use strict";

import {from} from "rxjs";

export{};

const LOG_ID = "CLDAR/MNGR - ";

// Valeurs possibles pour <type>
export type EventType =
    | "singleInstance"
    | "occurrence"
    | "seriesMaster"
    | "exception";

// Valeurs possibles pour <showAs>
export type ShowAs =
    | "busy"
    | "free"
    | "tentative"
    | "oof"
    | "workingelsewhere";

// Structure d'un événement
export interface CalendarEvent {
    id: string;                // attribut obligatoire
    subject: string;           // <subject>
    type: EventType;           // <type>
    showAs: ShowAs;            // <showAs>
    startDate: {
        value: string;           // ISO 8601 (xs:dateTime)
        timezone?: string;       // attribut optionnel
    };
    endDate: {
        value: string;           // ISO 8601 (xs:dateTime)
        timezone?: string;       // attribut optionnel
    };
}

class CalendarManager {
    private _events: CalendarEvent[];
    private _id: string;
    private _to: string;
    private _email: any;
    constructor(id: string, to : string, email : string) {
        if (!id) {
            throw new Error("to mandatory for CalendarManager");
        }
        if (!to) {
            throw new Error("to mandatory for CalendarManager");
        }
        if (!email) {
            throw new Error("email mandatory for CalendarManager");
        }
        this._id = id;
        this._to = to;
        this._email = email;
        this._events = [];
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get to(): string {
        return this._to;
    }

    set to(value: string) {
        this._to = value;
    }

    get email(): any {
        return this._email;
    }

    set email(value: any) {
        this._email = value;
    }

    get events(): CalendarEvent[] {
        return this._events;
    }

    /**
     * Add event to list
     * @param {Object} event - Object with data about event.
     */
    addEvent(event: CalendarEvent) {
        const validTypes = ["singleInstance", "occurrence", "seriesMaster", "exception"];
        const validShowAs = ["busy", "free", "tentative", "oof", "workingelsewhere"];

        if (!event.id) throw new Error("Event must have an id.");
        if (!event.subject) throw new Error("Event must have a subject.");
        if (!validTypes.includes(event.type)) throw new Error(`Wrong Type: ${event.type}`);
        if (!validShowAs.includes(event.showAs)) throw new Error(`Wrong showAs: ${event.showAs}`);
        if (!event.startDate || !event.endDate) throw new Error("Start date and end date are mandatory.");

        this._events.push(event);
    }

    /**
     * Supprime un événement par ID
     */
    removeEvent(id) {
        this._events = this._events.filter(evt => evt.id !== id);
    }

    /**
     * Retourne la liste des événements
     */
    listEvents() {
        return this._events;
    }

    /**
     * Génère un IQ XML <events> conforme au XSD
     */
/*    toXMLIQ(iqId = "cal1", from = "alice@example.com", to = "server.example.com") {
        let xml = `<iq from="${from}" to="${to}" type="set" id="${iqId}">`;
        xml += `<events xmlns="urn:xmpp:calendar:0" email="${this._email}">`;

        this._events.forEach(evt => {
            xml += `<event id="${evt.id}">`;
            xml += `<subject>${this.escapeXML(evt.subject)}</subject>`;
            xml += `<type>${evt.type}</type>`;
            xml += `<showAs>${evt.showAs}</showAs>`;
            xml += `<startDate${evt.startDate.timezone ? ` timezone="${evt.startDate.timezone}"` : ""}>${evt.startDate}</startDate>`;
            xml += `<endDate${evt.endDate.timezone ? ` timezone="${evt.endDate.timezone}"` : ""}>${evt.endDate}</endDate>`;
            xml += `</event>`;
        });

        xml += `</events></iq>`;
        return xml;
    }
    // */

    /**
     * Échappe les caractères spéciaux XML
     */
    escapeXML(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }
}

/*
// ==== Sample of use ====
const calendar = new CalendarManager("alice@example.com");

calendar.addEvent({
    id: "evt-001",
    subject: "Réunion projet",
    type: "singleInstance",
    showAs: "busy",
    startDate: "2025-08-14T09:00:00Z",
    endDate: "2025-08-14T10:30:00Z",
    startTimezone: "Europe/Paris",
    endTimezone: "Europe/Paris"
});

calendar.addEvent({
    id: "evt-002",
    subject: "Pause café",
    type: "occurrence",
    showAs: "free",
    startDate: "2025-08-14T10:30:00Z",
    endDate: "2025-08-14T10:45:00Z"
});

console.log(calendar.toXMLIQ("cal2"));
// */

module.exports.CalendarManager = CalendarManager;
export {CalendarManager};
