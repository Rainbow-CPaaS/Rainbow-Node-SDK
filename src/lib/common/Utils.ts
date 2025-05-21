"use strict";


//import util from "util";

//import {start} from "repl";

import {atob} from "atob";
import {Jimp, JimpMime} from "jimp";
import {dirname, join} from 'path';
import {existsSync} from 'fs';
import {DataStoreType} from "../config/config.js";

const config = require ("../config/config");
const dns = require('dns');
const utilTypes = require('util').types;
const xml2js = require('xml2js');
const util = require("util");

const fs = require('fs');
const ini = require('ini');

let isObject =  (value) => {
    return (value !== null && typeof value === 'object');
}

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
    return Array.isArray( roles ) && -1 !== roles.indexOf("admin");
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

let equalIgnoreCase = function(s1: string, s2: string) {
    let regex = new RegExp('^' + s1 + '$', 'i');
    if (regex.test(s2)) {
        return true;
    } else {
        return false;
    }
}

let isNullOrEmpty = function(value) {
    let _isNullOrEmpty = true;
    if (value) {
        if (typeof (value) == 'string') {
            if (value.length > 0)
                _isNullOrEmpty = false;
        }
    }
    return _isNullOrEmpty;
}

let isDefined = function(value) {
    let _isDefined = false;
    if (value !== null && value !== undefined) {
        _isDefined = true;
    }
    return _isDefined;
}

let isDefinedAndNotEmpty = function(value) {
    return (isDefined(value) && !isNullOrEmpty(value));
}

let isNotDefined = function(value) {
    return (! isDefined(value));
}

let isNotDefinedOrEmpty = function(value) {
    return ((! isDefined(value)) || value === "");
}

let isNumber = function  isNumber(data) {
    return (typeof data === 'number' && !(isNaN(data)));
}


/**
 *
 * @name isPlainObject
 * @description
 * Vérifier si c'est un objet JSON (littéral)
 * @returns {boolean}
 *
 *
 * example:
 * '''
 * console.log(isPlainObject(jsonObject)); // true
 * console.log(isPlainObject(instance));  // false
 * '''
 *
 */
let isPlainObject = function isPlainObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

/**
 *
 * @name isInstanceOfClass
 * @description
 * Combinaison pour différencier un JSON et une instance
 * @returns {boolean}
 *
 *
 * example:
 * '''
 * console.log(isInstanceOfClass(instance));  // true (instance de classe)
 * console.log(isInstanceOfClass(jsonObject)); // false (objet JSON)
 * console.log(isInstanceOfClass(null));      // false
 * console.log(isInstanceOfClass([]));        // false
 * '''
 *
 */
let isInstanceOfClass = function isInstanceOfClass(obj: any): boolean {
    return obj instanceof Object && obj.constructor !== Object;
}

/**
 *
 * @name isJsonObject
 * @description
 * Détection avancée : présence du constructeur
 * @param obj
 * @returns {boolean}
 *
 * example:
 * '''
 * console.log(isJsonObject(jsonObject)); // true
 * console.log(isJsonObject(instance));   // false
 * '''
 *
 */
let isJsonObject = function isJsonObject(obj: any): boolean {
    return obj !== null && typeof obj === "object" && obj.constructor === Object;
}

/**
 * @name toBoolean
 * @param value
 * @returns {boolean}
 *
 *
 * exemples :
 * ```
 * console.log(toBoolean(true));           // true
 * console.log(toBoolean(false));          // false
 * console.log(toBoolean(1));              // true
 * console.log(toBoolean(0));              // false
 * console.log(toBoolean("Hello"));        // true
 * console.log(toBoolean("false"));        // false
 * console.log(toBoolean("False"));        // false
 * console.log(toBoolean("  FaLsE  "));    // false
 * console.log(toBoolean(""));             // false
 * console.log(toBoolean(null));           // false
 * console.log(toBoolean(undefined));      // false
 * ```
 */
function toBoolean(value: any): boolean {
    if (typeof value === "string" && value.trim().toLowerCase() === "false") {
        return false;
    }
    return Boolean(value);
}
/**
 * @name setTimeoutPromised
 * @description
 *  function to wait for milliseconds and return a resolved promise.
 * @param {number} timeOutMs milliseconds to wait.
 * @returns {Promise<any>}
 */
let setTimeoutPromised = function(timeOutMs: number) : Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(()=> {
          try {
              resolve(undefined);
          } catch (err) {
              return reject(err);
          }
      }, timeOutMs);
    });
};

/**
 * @name pause
 * @description
 *  function to wait for milliseconds and return a resolved promise.
 * @param {number} timeOutMs milliseconds to wait.
 * @returns {Promise<any>}
 */
let pause = setTimeoutPromised;
/*let pause = function (timeToWaitMS) : Promise<any> {
    return setTimeoutPromised(timeToWaitMS);
} // */

function pauseSync(milliseconds: number): void {
    const startTime = Date.now();
    while (Date.now() - startTime < milliseconds) {
        // Ne rien faire, attendre que le temps s'écoule
        setTimeout(()=>{}, 10);
    }
}

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
 * @name until
 * @description
 * function to wait for a condition for a few time before it is resolved of rejected.
 * To be used with asynchrone function :
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
 * @param labelOfWaitingCondition
 * @param waitMsTimeBeforeReject
 * @returns {Promise<any>}
 */
function until(conditionFunction : Function, labelOfWaitingCondition : string, waitMsTimeBeforeReject : number = 5000): Promise<any> {

    let now = new Date();//.toJSON().replace(/-/g, '_');

    if (!waitMsTimeBeforeReject) {
        waitMsTimeBeforeReject = 1000 * 5; // wait 5 seconds
    }

    let end = new Date(now.getTime() + waitMsTimeBeforeReject);
    const poll = (resolve, reject) => {
        if (conditionFunction()) {
            resolve(undefined);
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

// function to treat a promise in an amount of time.
function doWithinInterval({promise, timeout, error}) {
    let timer = null;

    return Promise.race([
        new Promise((resolve, reject) => {
            function reject2() {
                return reject(error);
            }
            timer = setTimeout(reject2, timeout);
            return timer;
        }),
        promise.then((value) => {
            clearTimeout(timer);
            return value;
        })
    ]);
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

function addDaysToDate(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addParamToUrl(urlParams : Array<string>, paramName : string, paramValue : any,  addEmptyParam: boolean = false) {
    if (!addEmptyParam && isNotDefined(paramValue)) {
        return;
    } 
    if (paramName && urlParams) {
        if (urlParams[0].includes("?") ) {
            urlParams[0] += "&" ;
        } else {
            urlParams[0] += "?";
        }
        //urlParams[0] += urlParams[0] ? "&" : "?";
        urlParams[0] += paramName + "=" + encodeURIComponent(paramValue);
    }
}

function addPropertyToObj(objetToUpdate : Object, methodName : string, methodValue : any, addEmptyProperty: boolean = false) {
    if (!addEmptyProperty && isNotDefined(methodValue)) {
        return;
    } 
    if (objetToUpdate && methodName && (typeof objetToUpdate === "object" || typeof objetToUpdate === "function") ) {
        objetToUpdate[methodName] = methodValue;
    }
}


function updateObjectPropertiesFromAnOtherObject (dstObjectArray: number | any[], srcObject: { [x: string]: any; }) {
    if (!Array.isArray(dstObjectArray)) {
        return {};
    }

    let dstObject = dstObjectArray[0];
    Object.getOwnPropertyNames(srcObject).forEach((val, idx, array) => {
                //console.log(val + " -> " + data[val]);
                if (dstObject.hasOwnProperty(val)) {
                    // dev-code //
                    // console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                    // end-dev-code //

                    if (srcObject && (typeof srcObject[val] === "object" || typeof srcObject[val] === "function") ) {
                        // dev-code //
                       // console.log("One property of the dst Object is found in dst and is an Object, so recursivly try to update.");
                        // end-dev-code //
                        let dstArray = [];
                        dstArray.push(dstObject[val]);
                        updateObjectPropertiesFromAnOtherObject(dstArray, srcObject[val]);
                    } else {
                        // dev-code //
                        //console.log("One property of the dst Object is found in dst and is an Object, so update it.");
                        // end-dev-code //
                        dstObject[val] = srcObject[val];
                    }
                } else {
                    // dev-code-console //
                    //console.log("WARNING : One property of the dst Object is not present in src Object default value, so ignore it : ", val);
                    // end-dev-code-console //
                }
            });
}

function cleanEmptyMembersFromObject(objParams : Object) {
    if (objParams) {
        for (let objParamsKey in objParams) {
            if (objParams[objParamsKey] == undefined || objParams[objParamsKey] == null) {
                delete objParams[objParamsKey];
            }
        }
    }
}

function  isStart_upService( serviceoptions) {
    let start_up = true;
    if (serviceoptions !== undefined) {
        if (!serviceoptions.optional) {
            start_up = true;
        } else {
            start_up = !!serviceoptions.start_up;
        }
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
                let methodsToIgnoreStartedState = ["start", "stop", "contructor", "attachHandlers", "getClassName", "cleanMemoryCache", "getAccessorName", "setLogLevels", "sendPing"] ;
                methodsToIgnoreStartedState = [].concat(methodsToIgnoreStartedState, _methodsToIgnoreStartedState);
                let ignoreTheStartedState : boolean = (methodsToIgnoreStartedState.find((elt) => { return elt === propertyName; } ) != undefined);
                if (this == null) {
                    returnValue = originalMethod.apply(this, args);
                } else {
                    let logger = this.logger ? this.logger : this._logger ? this._logger : {};
                    let start_up = isStart_upService(this.startConfig);
                   /* if (propertyName==="getBubbleByJid" || propertyName==="getBubbleById") {
                        //logger.log("internal", LOG_ID + logger.colors.data("Method " + propertyName) + ", args ", args? "is defined" : "is not defined", ", this ", this ? "is defined" : "is NOT defined");
                        logger.log("internal", "LOG_ID" + logger.colors.data("isStarted "  + this.getClassName() + "::" + propertyName) + ", start_up : ", start_up, ", ignoreTheStartedState : ", ignoreTheStartedState, ", this._started : ", this._started);
                    } // */

                    if (ignoreTheStartedState) {
                        if (start_up) {
                            //logger.log("debug", LOG_ID + logger.colors.data("Method " + propertyName + "(...) _entering_"));
                            returnValue = originalMethod.apply(this, args);
                            //logger.log("debug", LOG_ID + logger.colors.data("Method " + propertyName + "(...) _exiting_"));
                        } else {
                            return Promise.resolve({msg: "The service of the Object " + target.name + " is not configured for start-up!!! Can not call method : " + propertyName});
                            //throw({msg: "The service of the Object " + target.name + " is not ready!!! Can not call method : " + propertyName});
                        }
                    } else {
                        if (start_up) {
                            if (this._started) {
                              //  logger.log("debug", LOG_ID + logger.colors.data("Method " + propertyName + "(...) _entering_"));
                                returnValue = originalMethod.apply(this, args);
                                //logger.log("debug", LOG_ID + logger.colors.data("Method " + propertyName + "(...) _exiting_"));
                            } else {
                                //return Promise.resolve({msg: "The service of the Object " + target.name + " is not ready!!! Can not call method : " + propertyName});
                                let error = {code : -1, msg: "The service of the Object " + target.name + " is not started!!! Can not call method : " + propertyName};
                                if (isPromise(originalMethod)) {
                                    error.code = 400;
                                    // returnValue = Promise.reject(error);
                                }
                                    //throw({msg: "The service of the Object " + target.name + " is not started!!! Can not call method : " + propertyName});
                                    throw(error);
                            }
                        } else {
                            returnValue = Promise.resolve({msg: "The service of the Object " + target.name + " is not configured for start-up!!! Can not call method : " + propertyName});
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

function logEntryExit(LOG_ID) : any {
    return function (target, key, descriptor): any {
        let keys = Object.getOwnPropertyNames(target.prototype);
        keys.forEach((propertyName) => {
            const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
            const isMethod = descriptor.value instanceof Function;
            if (!isMethod)
                return;

            // Keep the method store in a local variable
            const originalMethod = descriptor.value;
            descriptor.value = function (...args: any[]) {
                let startDate = new Date();
                /*let result = Promise.resolve();
                try {
                    if (parameters === undefined) {
                        result =  await methodDefinition.apply(thisToUse,[]);
                    } else {
                        result =  await methodDefinition.apply(thisToUse,parameters);
                        //result = await methodDefinition(...parameters);
                    }
                } catch (err) {
                    result = Promise.reject(err);
                } 
                let stopDate = new Date();
                // @ts-ignore
                let startDuration = Math.round(stopDate - startDate);
                //console.log("start duration of the method : " + methodName + " === STARTED (" + startDuration + " ms) ===");
                */
                
                // Execute the method with its initial context and arguments
                // Return value is stored into a variable instead of being passed to the execution stack
                let returnValue = undefined;
                if (this==null || originalMethod.name==="getClassName" || propertyName==="getClassName" || originalMethod.name==="getAccessorName" || propertyName==="getAccessorName" || originalMethod.name==="setLogLevels" || propertyName==="setLogLevels") {
                    returnValue = originalMethod.apply(this, args);
                } else {
                    let logger = this.logger ? this.logger:this._logger ? this._logger:{log : ()=> {console.log( arguments);}, colors:{data : function (param) {return param} }};
                    try {

                        /* if (!this.getClassName) {
                             this.getClassName = function getClassName () { return "UNKNOWNCLASS"; };
                         } // */
                        let logParameters = this.startConfig?this.startConfig.logEntryParameters: false;
                        if (logParameters) {
                            logger.log("internal", LOG_ID + logger.colors.data("Method " + this.getClassName() + "::" + propertyName + "(...) _entering_ with : " + util.inspect(arguments, false, 4, true)));
                            
                        } else {
                            logger.log("internal", LOG_ID + logger.colors.data("Method " + this.getClassName() + "::" + propertyName + "(...) _entering_"));
                        }
                        /*if (propertyName==="getBubbleByJid" || propertyName==="getBubbleById") {
                            //logger.log("internal", LOG_ID + logger.colors.data("Method " + propertyName) + ", args ", args? "is defined" : "is not defined", ", this ", this ? "is defined" : "is NOT defined");
                            logger.log("internal", LOG_ID + logger.colors.data("Method "  + this.getClassName() + "::" + propertyName) + ", args : ", args );
                            //logger.log("internal", LOG_ID + logger.colors.data("Method "  + this.getClassName() + "::" + propertyName) + ", args : ", args, ", this ", this.constructor.name );
                        } // */

                        returnValue = originalMethod.apply(this, args);
                        let stopDate = new Date();
                        // @ts-ignore
                        let startDuration = Math.round(stopDate - startDate);
                        logger.log("internal", LOG_ID + logger.colors.data("Method " + this.getClassName() + "::" + propertyName + "(...) _exiting_ execution time : " + startDuration + " ms."));
                    } catch (err) {
                        logger.log("error", LOG_ID + "(logEntryExit) CATCH Error !!! for ", logger.colors.data("Method " + this.getClassName() + "::" + propertyName), " error : ", err);
                        // let error = {msg: "The service of the Object " + target.name + " is not started!!! Can not call method : " + propertyName};
                        if (err.code == 400) {
                            returnValue = Promise.reject(err);
                        }
                    }
                }
                // Return back the value to the execution stack
                return returnValue;
            };
            Object.defineProperty(target.prototype, propertyName, descriptor);
        });
    }
}

/**
 * @private
 * @param avatarImg
 * @param maxWidth
 * @param maxHeight
 */
function resizeImage (avatarImg, maxWidth, maxHeight) {
    let that = this;
    //let logger = this.logger ? this.logger : this._logger ? this._logger : {};
    return new Promise((resolve, reject)=> {
        Jimp.read(avatarImg) // this can be url or local location
            .then(image => {
                // logger.log("debug", "(resizeImage) image : ", image);
                return resolve(
                    image.resize({"w":maxHeight, "h":maxWidth}) // , "mode":Jimp.RESIZE_BEZIER
                    // @ts-ignore
                    .getBase64(JimpMime.jpeg)
                    );
            })
            .catch(err => {
                console.log("error", "(resizeImage) Error : ", err);
            });
    });


    /*
    let defered = $q.defer();
    let image = new Image();
    image.src = avatarImg;

    image.onload = function() {
        let imageWidth = image.width;
        let imageHeight = image.height;

        if (imageWidth > imageHeight) {
            if (imageWidth > maxWidth) {
                imageHeight *= maxWidth / imageWidth;
                imageWidth = maxWidth;
            }
        }
        else {
            if (imageHeight > maxHeight) {
                imageWidth *= maxHeight / imageHeight;
                imageHeight = maxHeight;
            }
        }

        let canvas = document.createElement("canvas");
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        image.width = imageWidth;
        image.height = imageHeight;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

        let resizedImage = new Image();
        resizedImage.src = canvas.toDataURL("image/png");
        defered.resolve(resizedImage);
    };
    return defered.promise;
    // */
}

/**
 * @private
 * @param image
 */
function getBinaryData (image) {
    let typeIndex = image.indexOf("image/") + 6;
    let binaryIndex = image.indexOf(";base64,");
    let binaryData = image.slice(binaryIndex + 8);
    let imageType = image.slice(typeIndex, binaryIndex);
    let binary_string = atob(binaryData);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binary_string.charCodeAt(i); }
    return { type: imageType, data: bytes };
}

/**
 *
 * @param max The greater number which can be generated. If not defined the default value is 10.
 * @description
 *      generate an integer number between 1 and max value param.
 * @return {number} Return an integer number between 1 and max value param.
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max?max:10));
}

/**
 * @private
 * @description
 * Genere un code avec le format suivant : l'année + le mois + le jour + l'heure + les minutes + un nombre aléatoire sur 5 chiffres.
 *  un code au format :
 *     YYYYMMDDHHmm + un nombre aléatoire sur 5 chiffres
 * @returns {string}
 */
function genererCode(): string {
    const maintenant = new Date();

    const annee = maintenant.getFullYear().toString();
    const mois = (maintenant.getMonth() + 1).toString().padStart(2, '0');
    const jour = maintenant.getDate().toString().padStart(2, '0');
    const heures = maintenant.getHours().toString().padStart(2, '0');
    const minutes = maintenant.getMinutes().toString().padStart(2, '0');

    const dateHeure = `${annee}${mois}${jour}${heures}${minutes}`;

    const nombreAleatoire = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0');

    const code = `${dateHeure}${nombreAleatoire}`;
    return code;
}

console.log(genererCode());
// Exemple : "20250516144638429"

function throwError() {
    throw new Error();
}

function stackTrace() {

    try {
        throwError();
    }
    catch (e) {
        try {
            //return e.stack.split('at ')[3].split(' ')[0];
            return e.stack;
        } catch (e) {
            return '';
        }
    }
    /*var err = new Error();
    return err.stack;// */
}

function isPromise (x) {
    let isProm = utilTypes.isPromise(x) || x.constructor.name === 'Promise' || x.constructor.name === 'AsyncFunction';
    return isProm ;
    //return Object(x).constructor===Promise;
}

function promiseState(p) {
    const t = {};
    return Promise.race([p, t])
        .then(v => (v === t) ? "pending" : "fulfilled", () => "rejected");
}

// Function to test if variable is a string
function isString(variable) {
    return typeof variable === "string";
}

const resolveDns = (cname) => {
    return new Promise(function (resolve, reject ) {
        const getIp = (accum) => {

           // console.log("(resolve) (getIp) param : ", accum);
            dns.resolve(cname, (err, result) => {
                if (err) {
                    //console.error(`error: ${err}`)
                    reject();
                } else {
                    result.push.apply(result, accum)
                    //console.log("(resolve) (getIp) result : ", result)
                    resolve (result);
                }
            })
        }

        let accum = []
        const getCnames = (err, result) => {
            if (err) {
                //console.log("(resolve) (getIp) error : ", err)
                // no more records
                getIp(accum)
            } else {
                //console.log("(resolve) (getIp) result : ", result)
                const cname = result[0]
                accum.push(cname)
                dns.resolveCname(cname, getCnames)
            }
        }

        dns.resolveCname(cname, getCnames)
    });
}

function castStrToTypes(value, name) {
    let result = value;
    try {
        // Try to cast to Object the value
        result = JSON.parse(value);
        return result;
    } catch (err) {
        try {
            // Try to cast to Number the value
            result = +value;
            if (Number.isNaN(result)) {
                result = value;
            } else {
                return result;
            }
        } catch (err) {
            result = value;
        }
    }
    return result;
}

async function getJsonFromXML(xml : string) {
    try {

        const result = await xml2js.parseStringPromise(xml, {mergeAttrs: false, explicitArray : false, attrkey : "$attrs", emptyTag  : undefined, valueProcessors:[castStrToTypes], attrValueProcessors:[castStrToTypes]});

        // convert it to a JSON string
        return result;
        //return JSON.stringify(result, null, 4);
    } catch (err) {
        //console.log(err);
        return {};
    }
}

function getTextFromJSONProperty(property){
    let result = "";
    if (isObject(property)) {
      result = property?._;
    } else
    if (isString(property)) {
      result = property;
    } else {
        result = property;
    }
    return result;
}

function getAttrFromJSONObj(obj, name){
    let result = undefined; //  msg?.body?.$attrs["xml:lang"]
    if (obj && isObject(obj) && obj.$attrs) {
      result = obj.$attrs[name];
    }
    return result;
}
function getAlternateMessageFromJSONObj(content){
    let result :{message:any, type:string} = {
        message: undefined,
        type: ""
    }; //  msg?.body?.$attrs["xml:lang"]
    if (content && isObject(content) && content.$attrs) {
      result.type = content.$attrs["type"]
    }
    if (content && isObject(content) && content._) {
      result.message = content._
    }
    return result;
}

type DecodedContent = Record<string, any>;

/* Don t work has expected
function getJsonFromXml2jsObject(parsedObject: ParsedResult): DecodedContent {
    function cleanObject(obj: any): any {
        if (typeof obj === 'object' && !Array.isArray(obj)) {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(obj)) {
                if (Array.isArray(value)) {
                    if (key === 'item') {
                        // Si la clé est 'item', retourner directement le tableau nettoyé
                        result[key] = value.map(cleanObject);
                    } else if (value.length === 1) {
                        result[key] = cleanObject(value[0]);
                    } else {
                        result[key] = value.map(cleanObject);
                    }
                } else {
                    result[key] = cleanObject(value);
                }
            }
            return result;
        }
        return obj;
    }

    // Suppression des métadonnées inutiles et nettoyage de l'objet
    if (parsedObject && parsedObject._) {
        return cleanObject(parsedObject);
    }
    return {};
}
 // */
function getValueFromVariable(variable, defaultValue){
    return (isObject(variable)?variable:{});
}

function getObjectFromVariable(variable){
    return getValueFromVariable(variable, {});
}

type JsonObject = { [key: string]: any };

function findAllPropInJSONByPropertyName(obj: JsonObject, propertyName: string, maxDepth: number = 10, cond : (key, value, tabToSaveObjFound) => void = null): any[] | any {
    let results: any[] = [];

    function search(obj: JsonObject, currentDepth: number) {
        if (currentDepth > maxDepth) {
            return;
        }

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                //if (key === propertyName && ( !cond || ( cond && cond(key, obj[key]) ) ) ) {
                if (key === propertyName) {
                    if (!cond) {
                        results.push(obj[key]);
                    } else {
                        cond(key, obj[key], results);
                        /* if (Array.isArray(obj[key])) {

                        } else {
                            cond(key, obj[key])
                        } // */
                    }
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    search(obj[key], currentDepth + 1);
                }
            }
        }
    }

    search(obj, 0);
    if (results.length === 1) {
//        console.log("(findAllPropInJSONByPropertyName) results[0] : ", results[0]);
        if (typeof results[0] === 'object' && results[0] !== null) {
            results[0].length = 1;
        }
        return results[0];
    }
    return results;
}

function findAllPropInJSONByPropertyNameByXmlNS(obj: JsonObject, propertyName: string, xmlNsStr : string,  maxDepth: number = 10 ){
    let result = findAllPropInJSONByPropertyName(obj, propertyName, maxDepth, (key, value, tabToSaveObjFound) => {
        let isFound = false;
        if (Array.isArray(value)){
                value.forEach((valueElmtItem) => {
                    if (valueElmtItem?.$attrs?.xmlns === xmlNsStr) {
                        tabToSaveObjFound.push(valueElmtItem);
                    }
               //     isFound = isFound || (valueElmtItem?.$attrs?.xmlns === xmlNsStr);
                });
            //return isFound;
        } else {
            if (value?.$attrs?.xmlns === xmlNsStr) {
                tabToSaveObjFound.push(value);
            }
             //isFound = value?.$attrs?.xmlns === xmlNsStr;
            //return isFound;
        }
    }) ;
    return result.length === 0 ? undefined : result;
}

function safeJsonParse(str) {
    try {
        return [null, JSON.parse(str)];
    } catch (err) {
        return [err];
    }
}

function randomString(length, chars) {
    let result = "";
    for (let i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}

function generateRamdomEmail(email){
    let randomId = randomString(16, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    let emailGenerated = randomId + "_" + email;
    return emailGenerated.toLowerCase();
}

function callerName() {
    /*try {
        throw new Error();
    }
    catch (e) { //*/
        try {
            let callerNameStr = (new Error()).stack.split('at ')[6].split(' ')[0];
            return callerNameStr?callerNameStr.substring("descriptor.value.".length):'';
            //return e;
        } catch (e) {
            return '';
        }
    //}
}

function currentFunction(){
    let whoCallMe = callerName();
    console.log(whoCallMe);
}

function functionName(functionPtr) {
    let methodCallbackStr = functionPtr?functionPtr.toString():undefined;                // 
    //let result1 = methodCallbackStr?methodCallbackStr.match(/function\s*(.*?)\s*{/):"";
    //that.logger.log("internal", LOG_ID + "(methodSignature) - result1 : ", result1);
    let methodFromNamedFunction = methodCallbackStr?methodCallbackStr.match(/function\s*(.*?)\s*{/) : undefined;
    let methodNameFromNamedFunction = methodFromNamedFunction ? methodFromNamedFunction[0] : undefined;
    let methodFromAnonymousFunction = methodCallbackStr?methodCallbackStr.match(/\s*(.*?)\s*=>\s*{/) : undefined;
    let methodNameFromAnonymousFunction = methodFromAnonymousFunction? methodFromAnonymousFunction[0]  : undefined;
    let result = methodNameFromNamedFunction ? methodNameFromNamedFunction : ( methodNameFromAnonymousFunction ? methodNameFromAnonymousFunction : "") ;
    result = result.substr('function '.length);
    result = result.substr(0, result.indexOf('('));
    return result;
}

function functionSignature(functionPtr) {
    let methodCallbackStr = functionPtr?functionPtr.toString():undefined;                // 
    //let result1 = methodCallbackStr?methodCallbackStr.match(/function\s*(.*?)\s*{/):"";
    //that.logger.log("internal", LOG_ID + "(methodSignature) - result1 : ", result1);
    let methodFromNamedFunction = methodCallbackStr?methodCallbackStr.match(/function\s*(.*?)\s*{/) : undefined;
    let methodNameFromNamedFunction = methodFromNamedFunction ? methodFromNamedFunction[0] + "...}" : undefined;
    let methodFromAnonymousFunction = methodCallbackStr?methodCallbackStr.match(/\s*(.*?)\s*=>\s*{/) : undefined;
    let methodNameFromAnonymousFunction = methodFromAnonymousFunction? methodFromAnonymousFunction[0] + "...}" : undefined;
    let result = methodNameFromNamedFunction ? methodNameFromNamedFunction : ( methodNameFromAnonymousFunction ? methodNameFromAnonymousFunction : "") ;
    return result;
}

async function traceExecutionTime(thisToUse, methodName, methodDefinition, parameters = undefined) {
    let startDate = new Date();
    let result = Promise.resolve();
    try {
        if (parameters === undefined) {
            result =  await methodDefinition.apply(thisToUse,[]);
        } else {
            result =  await methodDefinition.apply(thisToUse,parameters);
            //result = await methodDefinition(...parameters);
        }
    } catch (err) {
        result = Promise.reject(err);
    }
    let stopDate = new Date();
    // @ts-ignore
    let startDuration = Math.round(stopDate - startDate);
    console.log("start duration of the method : " + methodName + " === STARTED (" + startDuration + " ms) ===");
    return result;
}

/**
 * convert time in milliseconds to hours, minutes ands seconds in human readable time.
 * @param {number} duration in milliseconds
 * @returns {string} time
 */
function msToTime(duration: number): string {
    let ms: number = duration % 1000;
    duration = (duration - ms) / 1000;
    let secs: number = duration % 60;
    duration = (duration - secs) / 60;
    let mins: number = duration % 60;
    duration = (duration - mins) / 60;
    let hrs: number = duration % 60;
    let days: number = (duration - hrs) / 24;

    let hours: string = (hrs < 10) ? "0" + hrs : hrs.toString();
    let minutes: string = (mins < 10) ? "0" + mins : mins.toString();
    let seconds: string = (secs < 10) ? "0" + secs : secs.toString();
    let milliseconds: string = (ms < 10) ? "0" + ms : ms.toString();

    //return hrs + ':' + mins + ':' + secs + '.' + ms;
    return (days + " Jrs " + hours + ":" + minutes + ":" + seconds + "." + milliseconds);
}

/**
 * @description
 * Voici une fonction TypeScript qui transforme un objet JSON avec une arborescence en un objet JSON plat :
 * Cette fonction prend en paramètre un objet JSON obj et une chaîne parentKey (optionnelle, par défaut vide) qui est utilisée pour conserver le chemin dans l'objet JSON plat résultant.
 * Elle parcourt récursivement l'objet JSON d'entrée et construit l'objet JSON plat en combinant les clés parentes avec les clés enfants séparées par des points.
*/
function flattenObject(obj: any, parentKey : string = '', withparentKey : boolean= true): any {
    return Object.keys(obj).reduce((acc: any, key: string) => {
        const prefixedKey = (parentKey && withparentKey) ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            const flattenedChild = flattenObject(obj[key], prefixedKey, withparentKey);
            return { ...acc, ...flattenedChild };
        } else {
            return { ...acc, [prefixedKey]: obj[key] };
        }
    }, {});
}

function formattStringOnNbChars(variableString, nbChars = 50) {
    // S'assurer que la chaîne a exactement 50 caractères
    let formattedString = variableString?.slice(0, nbChars).padEnd(nbChars);

    // Entourer la chaîne de parenthèses
    //formattedString = `(${formattedString})`;

    // Afficher sur la console
    return formattedString;
}

function loadConfigFromIniFile() {
    let config :any = {"RAINBOWSDKNODE":{}};
    try {
        let userAPPDATAPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") ;

        try {
            if (userAPPDATAPath) {
                userAPPDATAPath += "/Rainbow/RainbowNodeSdkDir";
                if (!fs.existsSync(userAPPDATAPath)) {
                    if (fs.mkdirSync(userAPPDATAPath, {recursive: true})) {
                    } else {
                    }
                } else {
                }
            } else {

            }
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }

        let readResult = fs.readFileSync(userAPPDATAPath + '/config.ini', 'utf-8');
        config = ini.parse(readResult);
    } catch (err) {
        config = {"RAINBOWSDKNODE":{}};
    }
    return (config?.RAINBOWSDKNODE) ? (config?.RAINBOWSDKNODE) : {};
}

function saveConfigFromIniFile(config: any) {
    try {
        let userAPPDATAPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") ;

        try {
            if (userAPPDATAPath) {
                userAPPDATAPath += "/Rainbow/RainbowNodeSdkDir";
                if (!fs.existsSync(userAPPDATAPath)) {
                    if (fs.mkdirSync(userAPPDATAPath, {recursive: true})) {
                        fs.writeFileSync(userAPPDATAPath + '/config.ini', ini.stringify(config, {section: 'RAINBOWSDKNODE'}));
                    } else {
                    }
                } else {
                    fs.writeFileSync(userAPPDATAPath + '/config.ini', ini.stringify(config, {section: 'RAINBOWSDKNODE'}));
                }
            } else {
            }
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    } catch (err) {
    }
}

// Function to write the array to a file
function writeArrayToFile(array:Array<any>, path : string) {
    const data = array.join('\n'); // Convert array to string with newlines
    fs.writeFileSync(path, data, 'utf8');
    //console.log('Array written to file');
}

// Function to read the array from the file
function readArrayFromFile(path : string) {
    const data = fs.readFileSync(path, 'utf8');
    const array = data.split('\n'); // Convert string back to array
    //console.log('Array read from file:', array);
    return array;
}

// To find the package.json file of the current library
// // If using CommonJS, use __dirname
// // If using ES modules:
// const currentFileUrl = import.meta.url;
// const currentDir = dirname(fileURLToPath(currentFileUrl));
//
// const packageJsonPath = findPackageJson(currentDir);
function findPackageJson(startDir: string): string | null {
    let currentDir = startDir;

    while (currentDir !== '/') {
        const packageJsonPath = join(currentDir, 'package.json');
        if (existsSync(packageJsonPath)) {
            return packageJsonPath;
        }
        currentDir = dirname(currentDir);
    }

    return null; // Return null if package.json not found
}

function getStoreStanzaValue(storeMessages:boolean, messagesDataStore : DataStoreType, p_messagesDataStore : DataStoreType) : string {
    let storeStanzaValue :string = DataStoreType.StoreTwinSide;
    if (isDefined(p_messagesDataStore)) {
        if (p_messagesDataStore != DataStoreType.UsestoreMessagesField) {
            storeStanzaValue = p_messagesDataStore;
        } else {
            if (storeMessages) {
                storeStanzaValue = DataStoreType.StoreTwinSide;
            } else {
                storeStanzaValue = DataStoreType.NoStore;
            }
        }
    } else if (isDefined(messagesDataStore)) {
        if (messagesDataStore != DataStoreType.UsestoreMessagesField) {
            storeStanzaValue = messagesDataStore;
        } else {
            if (storeMessages) {
                storeStanzaValue = DataStoreType.StoreTwinSide;
            } else {
                storeStanzaValue = DataStoreType.NoStore;
            }
        }
    } else if (isDefined(storeMessages)) {
        if (storeMessages) {
           storeStanzaValue = DataStoreType.StoreTwinSide;
        } else {
            storeStanzaValue = DataStoreType.NoStore;
        }
    }
    return storeStanzaValue;
}

export let objToExport = {
    makeId,
    createPassword,
    isAdmin,
    anonymizePhoneNumber,
    equalIgnoreCase,
    isNullOrEmpty,
    isObject,
    isDefined,
    isDefinedAndNotEmpty,
    isNotDefined,
    isNotDefinedOrEmpty,
    isNumber,
    isString,
    isPlainObject,
    isInstanceOfClass,
    isJsonObject,
    toBoolean,
    Deferred,
    isSuperAdmin,
    setTimeoutPromised,
    until,
    orderByFilter,
    updateObjectPropertiesFromAnOtherObject,
    isStart_upService,
    isStarted,
    logEntryExit,
    resizeImage,
    getBinaryData,
    getRandomInt,
    genererCode,
    pause,
    pauseSync,
    stackTrace,
    addDaysToDate,
    addParamToUrl,
    cleanEmptyMembersFromObject,
    resolveDns,
    isPromise,
    promiseState,
    doWithinInterval,
    addPropertyToObj,
    generateRamdomEmail,
    randomString,
    getJsonFromXML,
    getTextFromJSONProperty,
    getAttrFromJSONObj,
    getAlternateMessageFromJSONObj,
    getValueFromVariable,
    getObjectFromVariable,
    findAllPropInJSONByPropertyName,
    findAllPropInJSONByPropertyNameByXmlNS,
    callerName,
    functionName,
    functionSignature,
    traceExecutionTime,
    msToTime,
    flattenObject,
    formattStringOnNbChars,
    loadConfigFromIniFile,
    saveConfigFromIniFile,
    safeJsonParse,
    writeArrayToFile,
    readArrayFromFile,
    findPackageJson,
    getStoreStanzaValue
};

module.exports = objToExport;
export {
    makeId,
    createPassword,
    isAdmin,
    anonymizePhoneNumber,
    equalIgnoreCase,
    isNullOrEmpty,
    isObject,
    isDefined,
    isDefinedAndNotEmpty,
    isNotDefined,
    isNotDefinedOrEmpty,
    isNumber,
    isString,
    isPlainObject,
    isInstanceOfClass,
    isJsonObject,
    toBoolean,
    Deferred,
    isSuperAdmin,
    setTimeoutPromised,
    until,
    orderByFilter,
    updateObjectPropertiesFromAnOtherObject,
    isStart_upService,
    isStarted,
    logEntryExit,
    resizeImage,
    getBinaryData,
    getRandomInt,
    genererCode,
    pause,
    pauseSync,
    stackTrace,
    addDaysToDate,
    addParamToUrl,
    cleanEmptyMembersFromObject,
    resolveDns,
    isPromise,
    promiseState,
    doWithinInterval,
    addPropertyToObj,
    generateRamdomEmail,
    randomString,
    getJsonFromXML,
    getTextFromJSONProperty,
    getAttrFromJSONObj,
    getAlternateMessageFromJSONObj,
    getValueFromVariable,
    getObjectFromVariable,
    findAllPropInJSONByPropertyName,
    findAllPropInJSONByPropertyNameByXmlNS,
    callerName,
    functionName,
    functionSignature,
    traceExecutionTime,
    msToTime,
    flattenObject,
    formattStringOnNbChars,
    loadConfigFromIniFile,
    saveConfigFromIniFile,
    safeJsonParse,
    writeArrayToFile,
    readArrayFromFile,
    findPackageJson,
    getStoreStanzaValue
};

export default {
    makeId,
    createPassword,
    isAdmin,
    anonymizePhoneNumber,
    equalIgnoreCase,
    isNullOrEmpty,
    isObject,
    isDefined,
    isDefinedAndNotEmpty,
    isNotDefined,
    isNotDefinedOrEmpty,
    isNumber,
    isString,
    isPlainObject,
    isInstanceOfClass,
    isJsonObject,
    toBoolean,
    Deferred,
    isSuperAdmin,
    setTimeoutPromised,
    until,
    orderByFilter,
    updateObjectPropertiesFromAnOtherObject,
    isStart_upService,
    isStarted,
    logEntryExit,
    resizeImage,
    getBinaryData,
    getRandomInt,
    genererCode,
    pause,
    pauseSync,
    stackTrace,
    addDaysToDate,
    addParamToUrl,
    cleanEmptyMembersFromObject,
    resolveDns,
    isPromise,
    promiseState,
    doWithinInterval,
    addPropertyToObj,
    generateRamdomEmail,
    randomString,
    getJsonFromXML,
    getTextFromJSONProperty,
    getAttrFromJSONObj,
    getAlternateMessageFromJSONObj,
    getValueFromVariable,
    getObjectFromVariable,
    findAllPropInJSONByPropertyName,
    findAllPropInJSONByPropertyNameByXmlNS,
    callerName,
    functionName,
    functionSignature,
    traceExecutionTime,
    msToTime,
    flattenObject,
    formattStringOnNbChars,
    loadConfigFromIniFile,
    saveConfigFromIniFile,
    safeJsonParse,
    writeArrayToFile,
    readArrayFromFile,
    findPackageJson,
    getStoreStanzaValue
};
