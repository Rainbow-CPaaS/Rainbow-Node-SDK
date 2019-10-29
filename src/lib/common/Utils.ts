"use strict";



const config = require ("../config/config");
import * as core from "./../../../index";

let makeId = (n) => {
  let text = "";
  let possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

let createPassword = (size) => {
    let possible = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "?=.*[_~!@#\$%\^&\*\-\+=`\|\(\){}\[\]:;\"'<>,\.\?\/]", "0123456789"];
    let key = "";
    for (let i = 0; i < size - 4; i++) {
        let index = Math.floor(Math.random() * possible.length);
        key += possible[index].charAt(Math.floor(Math.random() * possible[index].length));
    }
    for (let i = 0; i < 4; i++) {
        key += possible[i].charAt(Math.floor(Math.random() * possible[i].length));
    }
    return key;
};

let isAdmin = ( roles ) => {
    return Array.isArray( roles ) && roles.indexOf("admin") !== -1;
};

class Deferred {
	public resolve: any;
	public reject: any;
	public promise: any;

    constructor() {
        let that = this;
        this.resolve = null;
        this.reject = null;
        this.promise = new Promise(function(resolve, reject) {
            that.resolve = resolve;
            that.reject = reject;
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
    let result = "";

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
              return reject(err);
          }
      }, time);
    });
};



/*
myFunction() in the original question can be modified as follows

async function myFunction(number) {

    let x=number;
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
function until(conditionFunction : Function, labelOfWaitingCondition : string, waitMsTimeBeforeReject : number = 5000) {

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
                reject(new Error('ErrorManager the condition \'' + labelOfWaitingCondition + '\' failed'));
                //throw new ErrorManager('ErrorManager the condition ' + labelOfWaitingCondition ? labelOfWaitingCondition : "" + ' failed');
                return;
            }
            setTimeout(_ => poll(resolve, reject), 400);
        }
    };

    return new Promise(poll);
}

function orderByFilter(originalArray, filterFct, flag, sortFct) {
    let o = []

    let objectsCompared = [];

    if (!originalArray) {
        return [];
    }

    originalArray.forEach((objectOriginal, index) => {
        let tabOfArgForApply = [];
        tabOfArgForApply.push(objectOriginal);
        let objectComparing = {
            keyToCompare: null,
            objectOriginal: null
        } ;
        objectComparing.keyToCompare = filterFct.apply(null, tabOfArgForApply);
        objectComparing.objectOriginal = objectOriginal;
        objectsCompared.push(objectComparing);
        //that.waitingBotConversations.splice(index, 1);
    });

    function compWithkeyToCompare (objectComparingA, objectComparingB?) {
        return sortFct(objectComparingA.keyToCompare, objectComparingB.keyToCompare) ;
    }

    o = objectsCompared.sort(compWithkeyToCompare);
//        o = objs.sort(sortFct);

    let tabOrdered = [];

    o.forEach((objectCompared, index) => {
        tabOrdered.push(objectCompared.objectOriginal) ;
    });

    if (flag) {
        tabOrdered.reverse();
    } else {
        return tabOrdered;
    }
}

function  isStart_upService( serviceoptions) {
    let start_up = true;
    if (!serviceoptions.optional) {
        start_up = true;
    } else {
        start_up = !!serviceoptions.start_up;
    }
    return start_up;
}

function isStarted(_methodsToIgnoreStartedState: Array<string> = []) : any{
    return function (target, key, descriptor) : any {
        let keys = Object.getOwnPropertyNames(target.prototype);
        keys.forEach((propertyName)=> {
            const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
            const isMethod = descriptor.value instanceof Function;
            if (!isMethod)
                return;

            // Keep the method store in a local variable
            const originalMethod = descriptor.value;
            descriptor.value = function (...args: any[]) {

                // Execute the method with its initial context and arguments
                // Return value is stored into a variable instead of being passed to the execution stack
                let returnValue = undefined;
                let methodsToIgnoreStartedState = ["start", "stop", "contructor", "attachHandlers"] ;
                methodsToIgnoreStartedState = methodsToIgnoreStartedState.concat(_methodsToIgnoreStartedState[0]);
                let ignoreTheStartedState : boolean = (methodsToIgnoreStartedState.find((elt) => { return elt === propertyName; } ) != undefined);
                if (this == null) {
                    returnValue = originalMethod.apply(this, args);
                } else {
                    let start_up = isStart_upService(this.startConfig);
                    if (ignoreTheStartedState) {
                        if (start_up) {
                            returnValue = originalMethod.apply(this, args);
                        } else {
                            return Promise.resolve({msg: "The service of the Object " + target.name + " is not configured for start-up!!! Can not call method : " + propertyName});
                            //throw({msg: "The service of the Object " + target.name + " is not ready!!! Can not call method : " + propertyName});
                        }
                    } else {
                        if (start_up) {
                            if (this.ready) {
                                returnValue = originalMethod.apply(this, args);
                            } else {
                                //return Promise.resolve({msg: "The service of the Object " + target.name + " is not ready!!! Can not call method : " + propertyName});
                                throw({msg: "The service of the Object " + target.name + " is not ready!!! Can not call method : " + propertyName});
                            }
                        } else {
                            return Promise.resolve({msg: "The service of the Object " + target.name + " is not configured for start-up!!! Can not call method : " + propertyName});
                        }
                    }
                }
                // Return back the value to the execution stack
                return returnValue;


                /* console.log("The method args are: " + JSON.stringify(args));
                const result = originalMethod.apply(this, args);
                console.log("The return value is: " + result);
                return result; // */
            };

            Object.defineProperty(target.prototype, propertyName, descriptor);
        });
    }
}

export {
    makeId,
    createPassword,
    isAdmin,
    anonymizePhoneNumber,
    Deferred,
    isSuperAdmin,
    setTimeoutPromised,
    until,
    orderByFilter,
    isStart_upService,
    isStarted
    };
