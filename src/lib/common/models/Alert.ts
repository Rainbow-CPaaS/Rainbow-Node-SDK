"use strict";
import {List} from "ts-generic-collections-linq";

export {};

class Alert {

    /// <summary>
    /// <see cref="string"/> - Alert Id
    /// </summary>
    id: string;

/// <summary>
/// <see cref="string"/> - State of the notification ('active', 'failed', 'completed', 'expired', 'canceled')
/// </summary>
    status: string;

/// <summary>
/// <see cref="string"/> - Template unique identifier orresponding to the message content sent to the devices.
/// </summary>
    templateId: string;

/// <summary>
/// <see cref="string"/> - Notification filter unique identifier. Optional filter allowing to only notify company devices that match the criterion defined in the associated notification filter.
/// </summary>
    filterId: string;

/// <summary>
/// <see cref="string"/> - Unique identifier of the company to which belongs the alert (Optional). If not provided, it is set to logged in user's companyId.
/// </summary>
    companyId: string;

/// <summary>
/// <see cref="DateTime"/> - Start Date of the notification
/// </summary>
    startDate: string;

/// <summary>
/// <see cref="DateTime"/> - End Date of the notification (optional)
/// </summary>
    expirationDate: string;
}

/// <summary>
/// Structure used when retrieving severals Alerts from server
/// </summary>
class AlertsData {
    /// <summary>
    /// List of Alerts retrieved
    /// </summary>
    data: List<Alert>;

/// <summary>
/// Total number of items available
/// </summary>
    total: number;

/// <summary>
/// Number of items asked
/// </summary>
    limit: number

/// <summary>
/// Offset used
/// </summary>
    offset: number
}

module.exports = {Alert, AlertsData};
export {Alert, AlertsData};
