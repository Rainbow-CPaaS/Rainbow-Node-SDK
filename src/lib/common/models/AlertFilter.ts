"use strict";

export {};
import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";

/// <summary>
/// Define a filter used when an alert is created to notify only some devices
/// </summary>
export class AlertFilter {
    /// <summary>
    /// <see cref="string"/> - Filter Id
    /// </summary>
    id: string;

/// <summary>
/// <see cref="string"/> - Filter Name
/// </summary>
    name: string;

/// <summary>
/// <see cref="string"/> - company identifier that owns this filter
/// </summary>
    companyId: string;

/// <summary>
/// <see cref="string"/> - tag's list to apply
/// </summary>
    tags: List<string>;
}

/// <summary>
/// Structure used to retrieve several AlertFilters objects from server
/// </summary>
class AlertFiltersData {
    /// <summary>
    /// List of <see cref="AlertFilter"/> found
    /// </summary>
    data: List<AlertFilter>

/// <summary>
/// Total number of items available
/// </summary>
    total: number

/// <summary>
/// Number of items asked
/// </summary>
    limit: number

/// <summary>
/// Offset used
/// </summary>
    offset: number
}

exports= {AlertFilter, AlertFiltersData};
module.exports = {AlertFilter, AlertFiltersData};
