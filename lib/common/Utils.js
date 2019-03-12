"use strict";

const config = require ("../config/config");

let makeId = (n) => {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

let createPassword = (size) => {
    var possible = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "?=.*[_~!@#\$%\^&\*\-\+=`\|\(\){}\[\]:;\"'<>,\.\?\/]", "0123456789"];
    var key = "";
    for (var i = 0; i < size - 4; i++) {
        var index = Math.floor(Math.random() * possible.length);
        key += possible[index].charAt(Math.floor(Math.random() * possible[index].length));
    }
    for (var i = 0; i < 4; i++) {
        key += possible[i].charAt(Math.floor(Math.random() * possible[i].length));
    }
    return key;
};

let isAdmin = ( roles ) => {
    return Array.isArray( roles ) && roles.indexOf("admin") !== -1;
};

class Deferred {
    constructor() {
        this.resolve = null;
        this.reject = null;
        this.promise = new Promise(function(resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));
        Object.freeze(this);
    }
}

let isSuperAdmin = (roles) => {
    return Array.isArray(roles) && roles.indexOf("superadmin") !== -1;
};

let anonymizePhoneNumber = function (number) {
    if (number === null || typeof number === "undefined") {
        return null;
    }
    if (config && config.debug === true) {
        return number;
    }
    var result = "";

    if (number.indexOf("+") === 0) {
        result = "+";
    }

    if (number.length > 4) {
        result = result + "*".repeat(number.length - 4 - result.length) + number.slice(number.length - 4);
    } else {
        result = number;
    }
    return result;
};

let setTimeoutPromised = function(time) {
    return new Promise((resolve, reject) => {
      setTimeout(()=> {
          try {
              resolve();
          } catch (err) {
              reject(err);
          }
      }, time);
    });
};



/*
myFunction() in the original question can be modified as follows

async function myFunction(number) {

    var x=number;
...
... more initializations

    await until(_ => flag == true);

...
... do something

}
// */

//where until() is this utility function
/**
 * @description
 * function to wait for a condition for a few time before it is resolved of rejected.
 * To be used with asunchrone function :
 * myFunction() is the code using until function.
 *
 * async function myFunction(number) {
  *    let x=number;
 * ... more initializations
 *
 *    await until(_ => flag == true);
 * ...
 * ... do something when until is resolved/rejected
 * }
 *
 * @param conditionFunction
 * @returns {Promise<any>}
 */
function until(conditionFunction, labelOfWaitingCondition, waitMsTimeBeforeReject) {

    let now = new Date();//.toJSON().replace(/-/g, '_');

    if (!waitMsTimeBeforeReject) {
        waitMsTimeBeforeReject = 1000 * 5; // wait 5 seconds
    }

    let end = new Date(now.getTime() + waitMsTimeBeforeReject);
    const poll = (resolve, reject) => {
        if (conditionFunction()) {
            resolve();
        } else  {
            if (new Date() > end ) {
                labelOfWaitingCondition  = labelOfWaitingCondition ? labelOfWaitingCondition : "";
                reject(new Error('Error the condition \'' + labelOfWaitingCondition + '\' failed'));
                //throw new Error('Error the condition ' + labelOfWaitingCondition ? labelOfWaitingCondition : "" + ' failed');
                return;
            }
            setTimeout(_ => poll(resolve, reject), 400);
        }
    };

    return new Promise(poll);
}

module.exports.makeId = makeId;
module.exports.createPassword = createPassword;
module.exports.isAdmin = isAdmin;
module.exports.anonymizePhoneNumber = anonymizePhoneNumber;
module.exports.Deferred = Deferred;
module.exports.isSuperAdmin = isSuperAdmin;
module.exports.setTimeoutPromised = setTimeoutPromised;
module.exports.until = until;