"use strict";
export {};


// Constructor
class Offer {
	public id: any;
	public name: any;
	public description: any;
	public offerReference: any;
	public profileId: any;
	public canBeSold: any;
	public businessModel: any;
	public isPrepaid: any;
	public prepaidDuration: any;
	public isDefault: any;
	public isExclusive: any;
	public logo: any;
	public isEnterprise: any;
	public isBusiness: any;
	public isEssential: any;

    constructor(id, name, description, offerReference, profileId, canBeSold, businessModel, isDefault, isExclusive, isPrepaid, prepaidDuration) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.offerReference = offerReference;
        this.profileId = profileId;
        this.canBeSold = canBeSold ? canBeSold : false;
        this.businessModel = businessModel;
        this.isPrepaid = isPrepaid;
        this.prepaidDuration = prepaidDuration;

        this.isDefault = isDefault;
        this.isExclusive = isExclusive;

        var offerName = this.name.toLowerCase();

        //check name in order to show the right logo
        if (offerName) {
            if (offerName.indexOf("enterprise") !== -1) {
                offerName = "enterprise";
            }
            else if (offerName.indexOf("business") !== -1) {
                offerName = "business";
            }
            else if (offerName.indexOf("conference") !== -1) {
                offerName = "conference";
            }
        }
        this.logo = "logo-offer-" + offerName + ".svg";

        this.isEnterprise = function () {
            return this.name.toLowerCase().startsWith("enterprise");
        };

        this.isBusiness = function () {
            return this.name.toLowerCase().startsWith("business");
        };

        this.isEssential = function () {
            return this.name.toLowerCase().startsWith("essential");
        };

    }

    static isExclusive(offer: any) {
        return false;
    }
}

class OfferManager {
    constructor () {

    }
// Comparator
    offerComparator(offer1, offer2) {
        var offerOrder = ["Essential", "Business", "Enterprise"];

        var orderIndex1 = offerOrder.findIndex(function (order) {
            return offer1.name.startsWith(order); // "Enterprise demo" and "enterprise" must have the same index
        });
        var orderIndex2 = offerOrder.findIndex(function (order) {
            return offer2.name.startsWith(order); // "Enterprise demo" and "enterprise" must have the same index
        });
        // unknown offers are grouped at the bottom
        orderIndex1 = orderIndex1 === -1 ? offerOrder.length : orderIndex1;
        orderIndex2 = orderIndex2 === -1 ? offerOrder.length : orderIndex2;

        if (orderIndex1 < orderIndex2) {
            return -1;
        }
        if (orderIndex1 > orderIndex2) {
            return 1;
        }
        // offer 1 and 2 have same order index
        // reverse sort them by name (ie. "enterprise demo" before "enterprise")
        if (offer1.name > offer2.name) {
            return orderIndex1 === offerOrder.length ? 1 : -1;
        }
        if (offer1.name < offer2.name) {
            return orderIndex1 === offerOrder.length ? -1 : 1;
        }
        return 0;
    }

// Filters
    isExclusive(offer) {
        return offer.isDefault || offer.isExclusive; // like "Essential" (default) or "Enterprise" // nb_users (like "Beta") or undefined (like "Essential")
    }

    isOptional(offer) {
        return !Offer.isExclusive(offer);
    }

    isEssential(offer) {
        return offer.isEssential();
    }

    isNotEssential(offer) {
        return !offer.isEssential();
    }

    isModelByNbUser(offer) {
        return offer.businessModel === "nb_users";
    }

    isPrepaid(offer) {
        return offer.isPrepaid;
    }

    isNotPrepaid(offer) {
        return !offer.isPrepaid;
    }

    createOfferFromData (data) {
        return new Offer(data.id, data.name, data.description, data.offerReference, data.profileId, data.canBeSold, data.businessModel, data.isDefault, data.isExclusive, data.isPrepaid, data.prepaidDuration);
    }


    createOfferFromSubscriptionData (subscription) {
        return new Offer(subscription.offerId, subscription.offerName, subscription.offerReference, undefined, subscription.profileId, subscription.canBeSold, subscription.businessModel, subscription.isDefault, subscription.isExclusive, subscription.isPrepaid, undefined);
    }

    createOfferFromProfileData (profile) {
        return new Offer(profile.offerId, profile.offerName, undefined, undefined, profile.profileId, false, undefined, profile.isDefault, profile.isExclusive, profile.isPrepaid, profile.prepaidDuration);
    }
}


let offerManager = new OfferManager();

module.exports = {
    'Offer': Offer,
    'offerManager': offerManager
};
export {Offer, offerManager};