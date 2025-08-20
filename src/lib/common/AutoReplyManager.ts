"use strict";

import {from} from "rxjs";

export{};

const LOG_ID = "ARPLY/MNGR - ";

// Valeurs possibles pour l’attribut state
export type StateType = "enabled" | "disabled" | "scheduled";

// Valeurs possibles pour l’attribut audience
export type AudienceType = "all" | "known" | "none";

export interface DateWithTimezone {
    value: string;        // ISO 8601 date-time
    timezone?: string;    // optionnel (default = "UTC")
}

class AutoReplyManager {
    private _id: string;
    private _to: string;
    private _state: StateType;
    private _email: string;

    private _startDate?: DateWithTimezone;
    private _endDate?: DateWithTimezone;

    private _internalReplyMessage: string;
    private _externalReplyMessage?: {
        value: string;
        audience: AudienceType;
    };

    constructor(params: {
        id: string,
        to: string,
        state: StateType;
        email: string;
        internalReplyMessage: string;
        startDate?: DateWithTimezone;
        endDate?: DateWithTimezone;
        externalReplyMessage?: { value: string; audience: AudienceType };
    }) {
        this._id = params.id;
        this._to = params.to;
        this._state = params.state;
        this._email = params.email;
        this._internalReplyMessage = params.internalReplyMessage;
        this._startDate = params.startDate;
        this._endDate = params.endDate;
        this._externalReplyMessage = params.externalReplyMessage;
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

    get state(): StateType {
        return this._state;
    }

    set state(value: StateType) {
        this._state = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get startDate(): DateWithTimezone {
        return this._startDate;
    }

    set startDate(value: DateWithTimezone) {
        this._startDate = value;
    }

    get endDate(): DateWithTimezone {
        return this._endDate;
    }

    set endDate(value: DateWithTimezone) {
        this._endDate = value;
    }

    get internalReplyMessage(): string {
        return this._internalReplyMessage;
    }

    set internalReplyMessage(value: string) {
        this._internalReplyMessage = value;
    }

    get externalReplyMessage(): { value: string; audience: AudienceType } {
        return this._externalReplyMessage;
    }

    set externalReplyMessage(value: { value: string; audience: AudienceType }) {
        this._externalReplyMessage = value;
    }
}

module.exports.AutoReplyManager = AutoReplyManager;
export {AutoReplyManager};
