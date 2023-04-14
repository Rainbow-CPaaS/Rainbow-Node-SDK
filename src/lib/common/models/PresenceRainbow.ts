"use strict";


import {Offer, offerManager} from "./Offer";
import {ErrorManager} from "../ErrorManager";

/**
 *   Enum with all presence levels possible
 * @public
 * @enum {string}
 * @readonly
 */
enum PresenceLevel {
    /** Offline/Invisible The presence of the contact is not connected */
    Offline = "offline",

    /** Offline/Invisible The presence of the contact is not connected */
    Invisible = "invisible",

    /** The presence of the contact is connected */
    Online = "online",

    /** The presence of the contact is connected on mobile */
    OnlineMobile = "online-mobile",

    /** The presence of the contact is connected but away from a long time */
    Away = "away",

    /** The presence of the contact is in "Do not disturb" state */
    Dnd = "dnd",

    /** The presence of the contact is in "Busy" state */
    Busy = "busy",

    /** The presence of the contact appear offline but to stay still connected. */
    Xa = "xa",

    /** The presence of the contact is not known */
    Unknown = "Unknown",

    /// internal
    /** internal */
    Chat = "chat",

    /** The presence of the contact is an empty string */
    EmptyString = ""
}

/**
 *   Enum with all presence Show possible
 * @public
 * @enum {string}
 * @readonly
 */
enum PresenceShow {
    /** The presence of the contact is connected */
    Online = "online",

    /** The presence of the contact is disconnected */
    Offline = "offline",

    /** The contact is in "Do not disturb" state */
    Dnd = "dnd",

    /** For current contact only - to appear offline but to stay still connected */
    Xa = "xa",

    /** The contact is away */
    Away = "away",

    /** The Show is Chat */
    Chat = "chat",

    /** The Show is empty string */
    EmptyString = ""
}

/**
 *   Enum with all presence Status possible
 * @public
 * @enum {string}
 * @readonly
 */
enum PresenceStatus {
    /** The presence of the contact is connected */
    Online = "online",

    /** The presence of the contact is disconnected */
    ModeAuto = "mode=auto",

    /** The contact is connected but away from a long time */
    Away = "away",

    /** The contact is on phone */
    Phone = "phone",

    /** The contact is in an appointment - used only in Presence Calendar context */
    Appointment = "appointment",
    
    /** The contact is on presentation */
    Presentation = "presentation",

    /** The contact is on mobile phone */
    Mobile = "mobile",

    /** The is Teams presence */
    Calendar = "calendar",

    /** The is Teams presence */
    Teams = "teams",

    /** The status is empty string. */
    EmptyString = ""
}

// NOT USED YET. It looks to be the same as PresenceStatus
/// To store all presence details possible
enum PresenceDetails {
    /// The contact is inactive - it's presence level is set to Away
    Inactive = "inactive",

    /// The contact is in audio only conversation - it's presence level is set to Busy
    Audio = "audio",

    /// The contact is in audio and video conversation - it's presence level is set to Busy
    Video = "video",

    /// The contact is seeing a sharing  - it's presence level is set to Busy
    Sharing = "sharing",

    /// The contact is doing a presentation - it's presence level is set to DND
    Presentation = "presentation",

    /// The contact is busy - used only in Presence Calendar context
    Busy = "busy",

    /// The contact is "out of office" - used only in Presence Calendar contetx
    OutOfOffice = "out_of_office",

    /// The contact is free (He is not in a meeting) - used only in Presence Calendar contetx
    Free = "free",

    EmptyString = ""
}

/**
 *   Enum with the phone presence (linked to PBX)
 * @public
 * @enum {string}
 * @readonly
 */
enum PresencePhone {
    /** The PBX service is available - the phone is not currently used */
    EVT_CONNECTION_CLEARED = "EVT_CONNECTION_CLEARED",

    /** The PBX service is available - there is a incoming or outgoing call in ringing state */
    EVT_SERVICE_INITIATED = "EVT_SERVICE_INITIATED",

    /** The PBX service is available - there is a current call */
    EVT_ESTABLISHED = "EVT_ESTABLISHED",

    /** The PBX service is not available / operational so we don't know the presence phone */
    NOT_AVAILABLE = "NOT_AVAILABLE",
}

/**
 * @public
 * @class
 * @name PresenceInfo
 * @description
 *   Define the base of each presence - Presence Level and Presence Details
 */
class PresenceInfo {
    get presenceShow(): string {
        return this._presenceShow;
    }

    set presenceShow(value: string) {
        this._presenceShow = value;
    }
    /// <see cref="Model.PresenceLevel"/> - the presence level
    private _presenceLevel: PresenceLevel |string;

    /// <see cref="Model.PresenceDetails"/> - the presence details
    private _presenceDetails: PresenceDetails;

    private _presenceShow : string;
    private _presenceStatus : string;

    /// Constructor with presence level and details
    /// <param name="presenceLevel"><see cref="String"/>The presence level - see <see cref="Model.PresenceLevel"/> for all possible values</param>
    /// <param name="presenceDetails"><see cref="String"/>The presence details - see <see cref="Model.PresenceDetails"/> for all possible values</param>
    constructor(presenceLevel: PresenceLevel = PresenceLevel.Online, presenceDetails: PresenceDetails = PresenceDetails.EmptyString) {
        let that = this;
        that._presenceLevel = "";
        that._presenceShow = "";
        that._presenceStatus = "";
        that.presenceLevel = presenceLevel;
        that.presenceDetails = presenceDetails;
    }

    get presenceLevel(): PresenceLevel | string{
        return this._presenceLevel;
    }

    set presenceLevel(value: PresenceLevel|string ) {
        let that = this;
        switch (value) {
            case PresenceLevel.Online:
                //show = "online";
                //status = "";
                /*show = undefined;
                status = "mode=auto";
                // */
                that.presenceShow = PresenceShow.EmptyString;
                that.presenceStatus = PresenceStatus.ModeAuto;
                break;
            case PresenceLevel.Busy:
                /* show = "xa";
                status = "away";
                // */
                value = PresenceLevel.Dnd;
                that.presenceShow = PresenceShow.Dnd;
                that.presenceStatus = PresenceStatus.EmptyString;
                break;
            case PresenceLevel.Away:
                /* show = "xa";
                status = "away";
                // */
                that.presenceShow = PresenceShow.Xa;
                that.presenceStatus = PresenceStatus.Away;
                break;
            case PresenceLevel.Xa:
                /* show = "xa";
                status = "away";
                // */
                value = PresenceLevel.Away;
                that.presenceShow = PresenceShow.Xa;
                that.presenceStatus = PresenceStatus.Away;
                break;
            case PresenceLevel.Dnd:
                /*show = "dnd";
                status = "";
                // */
                that.presenceShow = PresenceShow.Dnd;
                that.presenceStatus = PresenceStatus.EmptyString;
                break;
            case PresenceLevel.Invisible:
                /* show = "xa";
                status = "";
                // */
                that.presenceShow = PresenceShow.Xa;
                that.presenceStatus = PresenceStatus.EmptyString;
                break;
            case PresenceLevel.Offline:
                /* show = "xa";
                status = "";
                // */
                //value = PresenceLevel.Invisible;
                that.presenceShow = PresenceShow.Offline;
                that.presenceStatus = PresenceStatus.EmptyString;
                break;
            default:
                that.presenceShow = PresenceShow.EmptyString;
                that.presenceStatus = PresenceStatus.EmptyString;
                break;
        }

        that._presenceLevel = value;
    }

    get presenceDetails(): PresenceDetails {
        return this._presenceDetails;
    }

    set presenceDetails(value: PresenceDetails) {
        this._presenceDetails = value;
    }

    get presenceStatus(): string {
        return this._presenceStatus;
    }

    set presenceStatus(value: string) {
        this._presenceStatus = value;
    }

    toJsonForServer () :  {show:string, status:string}  {
        let jsonForServer: { show: string; status: string };
        jsonForServer = {
            show: this._presenceShow,
            status: this._presenceStatus
        };
        return jsonForServer;
    }
}

/// To define the calendar presence. Inherit of <see cref="Model.PresenceInfo"/>
class PresenceCalendar extends PresenceInfo {
    /// The validity date of the calendar presence. If date is passed, it means that the user is "available" from a calendra presence point of view
    private _until: Date;

    /// Constructor with presence level , details and until
    /// <param name="presenceLevel"><see cref="String"/>The presence level - see <see cref="Model.PresenceLevel"/> for all possible values</param>
    /// <param name="presenceDetails"><see cref="String"/>The presence details - see <see cref="Model.PresenceDetails"/> for all possible values</param>
    /// <param name="until"><see cref="DateTime"/>The availability of this presence status - Used only if calendar context</param>
    constructor(presenceLevel?: PresenceLevel, presenceStatus? : string,presenceDetails?: PresenceDetails, until?: Date) {
        super(presenceLevel, presenceDetails);
        let that = this;
        that._until = until;
    }

    get until(): Date {
        return this._until;
    }

    set until(value: Date) {
        this._until = value;
    }
}

/// <summary>
/// To define the contact's presence
/// Inherit of <see cref="PresenceInfo"/>
/// There is 3 context: Calendar presence, Phone presence (linked to PBX) and the IM presence
/// </summary>
/**
 * @public
 * @class 
 * @name PresenceRainbow
 * @description
 *   Represent a contact's presence
 */
class PresenceRainbow extends PresenceInfo {
    /// The calendar presence
  //  private _presenceCalendar: PresenceCalendar;

    /// The phone presence (linked to a PBX)
//    private _presencePhone: PresencePhone;

    /// The resource linked to this presence
    private _resource: string;

    /// The Date when the presence has been set
    private _date: Date;

    /// Constructor with resource, presence level and presence details
    /// <param name="resource"><see cref="String"/>The resource linked to this presence level</param>
    /// <param name="date"><see cref="String"/>The date of this presence level</param>
    /// <param name="presenceLevel"><see cref="String"/>The presence level - see <see cref="Model.PresenceLevel"/> for all possible values</param>
    /// <param name="presenceDetails"><see cref="String"/>The presence details - see <see cref="Model.PresenceDetails"/> for all possible values</param>
    constructor(presenceLevel?: PresenceLevel, presenceStatus? : string, presenceDetails?: PresenceDetails, resource?: string, date?: Date) {
        super(presenceLevel, presenceDetails);
        let that = this;
        that._date = date;
        that._resource = resource;
        // that._presencePhone = PresencePhone.NOT_AVAILABLE;
        // that._presenceCalendar = new PresenceCalendar(PresenceLevel.Online);
    }

  /*  get presenceCalendar(): PresenceCalendar {
        return this._presenceCalendar;
    }

    set presenceCalendar(value: PresenceCalendar) {
        this._presenceCalendar = value;
    }

    get presencePhone(): PresencePhone {
        return this._presencePhone;
    }

    set presencePhone(value: PresencePhone) {
        this._presencePhone = value;
    }
*/
    get resource(): string {
        return this._resource;
    }

    set resource(value: string) {
        this._resource = value;
    }

    get date(): Date {
        return this._date;
    }

    set date(value: Date) {
        this._date = value;
    }
}


module.exports.PresenceCalendar = PresenceCalendar;
module.exports.PresenceInfo = PresenceInfo;
module.exports.PresenceLevel = PresenceLevel;
module.exports.PresenceShow = PresenceShow;
module.exports.PresenceStatus = PresenceStatus;
module.exports.PresenceDetails = PresenceDetails;
module.exports.PresencePhone = PresencePhone;
module.exports.PresenceRainbow = PresenceRainbow;
export {PresenceCalendar, PresenceInfo, PresenceLevel, PresenceShow, PresenceStatus, PresenceDetails, PresencePhone, PresenceRainbow};
