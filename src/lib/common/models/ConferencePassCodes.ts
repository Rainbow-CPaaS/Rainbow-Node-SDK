"use strict";

export {};

/// <summary>
/// To store pass codes of a meeting
/// </summary>
class ConferencePassCodes {
    /// <summary>
    /// <see cref="String"/> - Pass code of the moderator - available if the end-user is the moderator
    /// </summary>
    private _moderatorPassCode: string;

    /// <summary>
    /// <see cref="String"/> - Pass code of the particpant
    /// </summary>
    private _participantPassCode: string;

    constructor () {
    }

    get moderatorPassCode(): string {
        return this._moderatorPassCode;
    }

    set moderatorPassCode(value: string) {
        this._moderatorPassCode = value;
    }

    get participantPassCode(): string {
        return this._participantPassCode;
    }

    set participantPassCode(value: string) {
        this._participantPassCode = value;
    }

/// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    public ToString(): string {
        return "";
        //return $"ModeratorPassCode:[{ModeratorPassCode}] - ParticipantPassCode:[{ParticipantPassCode}]";
    }
}

// module.exports.ConferencePassCodes = ConferencePassCodes;
export {ConferencePassCodes};
