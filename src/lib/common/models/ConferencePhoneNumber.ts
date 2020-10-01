"use strict";

export {};

/// <summary>
/// Describe a phone number used to reach an audio Meeting
/// </summary>
class ConferencePhoneNumber {
    /// <summary>
    /// <see cref="String"/> - Name of the location (Country name and City name). The language of the end-user is used
    ///
    /// Example of result: France, Paris
    /// </summary>
    private _location: string;

    /// <summary>
    /// <see cref="String"/> - Country Alpha-3 code (ISO 3166 - cf. https://www.iban.com/country-codes)
    /// </summary>
    private _locationcode: string;

    /// <summary>
    /// <see cref="String"/> - The international phone number
    /// </summary>
    private _number: string;

    /// <summary>
    /// <see cref="Boolean"/> - true means non-English bridges.
    ///
    /// For English bridges: The mobile can dial : bridge number + accesscode #
    ///
    /// For non-English bridges: The mobile can dial : bridge number + 1# + code #
    ///
    /// The 1# may be replaced by 2# if the country of the called number is not the country of the user.
    ///
    /// '+' is 'pause',
    /// </summary>
    private _needLanguageSelection: boolean;

    /// <summary>
    /// <see cref="String"/> - Number free of charge or not, one of **local**, **lo-call**, **tollFree**, **other**
    /// </summary>
    private _numberType: string;

    constructor() {
    }

    get location(): string {
        return this._location;
    }

    set location(value: string) {
        this._location = value;
    }

    get locationcode(): string {
        return this._locationcode;
    }

    set locationcode(value: string) {
        this._locationcode = value;
    }

    get number(): string {
        return this._number;
    }

    set number(value: string) {
        this._number = value;
    }

    get needLanguageSelection(): boolean {
        return this._needLanguageSelection;
    }

    set needLanguageSelection(value: boolean) {
        this._needLanguageSelection = value;
    }

    get numberType(): string {
        return this._numberType;
    }

    set numberType(value: string) {
        this._numberType = value;
    }

/// <summary>
    /// Serialize this object to String
    /// </summary>
    /// <returns><see cref="String"/> as serialization result</returns>
    ToString(): string {
        return "";
        //return $"Location:[{Location}] - Locationcode:[{Locationcode}] - Number:[{Number}] - NumberType:[{NumberType}] - NeedLanguageSelection:[{NeedLanguageSelection}]";
    }
}

module.exports.ConferencePhoneNumber = ConferencePhoneNumber;
export {ConferencePhoneNumber};
