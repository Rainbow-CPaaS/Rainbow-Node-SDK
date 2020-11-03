"use strict";
import {Alert} from "./Alert";
import {Bubble} from "./Bubble";
import {List} from "ts-generic-collections-linq";

export {};

class AlertTemplate {
    /// <summary>
    /// <see cref="string"/> - Template Id
    /// </summary>
    public id: string;

/// <summary>
/// <see cref="string"/> - Human readable string identifying this template
/// </summary>
    public name: string;

/// <summary>
/// <see cref="string"/> - unique identifier of the company that own this template.  default value user logged in company Id
/// </summary>
    public companyId: string;

/// <summary>
/// <see cref="string"/> - String denoting the type of the subject event of the alert message (max 255 characters)
/// </summary>
    public event: string;

/// <summary>
/// <see cref="string"/> - String describing the subject event of the alert message (max 8192 characters)
/// </summary>
    public description: string;

/// <summary>
/// <see cref="string"/> - Mime Type of description's content (max 255 characters) - Default value: text/plain
/// </summary>
    public mimeType: string;

/// <summary>
/// <see cref="string"/> - String naming the originator of the alert message (max 255 characters)
/// </summary>
    public senderName: string;

/// <summary>
/// <see cref="string"/> - headline of the alert message (max 255 characters) used for short message devices that may only presents this field (mobile device push)
/// </summary>
    public headline: string;

/// <summary>
/// <see cref="string"/> - text representing the recommended action (max 4096 characters)
/// </summary>
    public instruction: string;

/// <summary>
/// <see cref="string"/> - contact for follow-up or confirmation of the alert message (optional)
/// </summary>
    public contact: string;

/// <summary>
/// <see cref="string"/> - templates type only 'cap' is allowed
/// </summary>
    public type: string;

/// <summary>
/// <see cref="String"/> - templates status ( 'Actual', 'Exercise', 'System', 'Test','Draft') - default: Actual
/// </summary>
    public status: string;

/// <summary>
/// <see cref="String"/> - templates scope ( 'Public', 'Restricted', 'Alert') - Default value: Public
/// </summary>
    public scope: string;

/// <summary>
/// <see cref="string"/> - template category ('Geo', 'Met', 'Safety', 'Security', 'Rescue', 'Fire', 'Health', 'Env', 'Transport', 'Infra', 'CBRNE', 'Other') - Default value: Safety
/// </summary>
    public category: string;

/// <summary>
/// <see cref="string"/> - template urgency ('Immediate', 'Expected', 'Future', 'Past', 'Unknown') - Default value: Immediate
/// </summary>
    public urgency: string;

/// <summary>
/// <see cref="String"/> - template severity ('Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown') - Default value: Severe
/// </summary>
    public severity: string;

/// <summary>
/// <see cref="string"/> - template certainty ('Observed', 'Likely', 'Possible', 'Unlikely', 'Unknown') - Default value: Observed
/// </summary>
    public certainty: string;

/// <summary>
/// Default constructor
/// </summary>
    public constructor() {
        let that = this;
        that.type = "cap";
        that.status = "Actual";
        that.scope = "Public";
        that.category = "Safety";
        that.urgency = "Immediate";
        that.severity = "Severe";
        that.certainty = "Observed";
    }
}

/// <summary>
/// Structure used when retrieving severals AlertTemplate from server
/// </summary>
class AlertTemplatesData {
    /// <summary>
    /// List of AlertTemplate found
    /// </summary>
    public data: List<AlertTemplate>;

/// <summary>
/// Total number of items available
/// </summary>
    public total: number;

/// <summary>
/// Number of items asked
/// </summary>
    public limit: number;

/// <summary>
/// Offset used
/// </summary>
    public offset: number;
}

export {AlertTemplate, AlertTemplatesData};
module.exports = {AlertTemplate, AlertTemplatesData};
