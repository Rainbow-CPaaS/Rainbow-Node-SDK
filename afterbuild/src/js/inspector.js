var Inspector = (function() {

    "use strict";

    var logService = "Inspector  | ";
    var logger = null;
    var stack = "";
    var that;

    var privateAPI = {
        "initialize": "initialize",
        "load": "load",
        "ready": "ready",
        "setKeyFromConfig": "setKeyFromConfig",
        "hasBeenLaunchedFromConfig": "hasBeenLaunchedFromConfig",
        "signinOnRainbowHosted": "signinOnRainbowHosted",
        "signinOnRainbowDev": "signinOnRainbowDev",
        "signinOnRainbowBeta": "signinOnRainbowBeta",
        "createEssentialCompany": "createEssentialCompany",
        "removeEssentialCompany": "removeEssentialCompany",
        "_addFileToConversation": "_addFileToConversation"
    };

    function Inspector (log) {
        that = this;
        logger = log;
        logger.debug(logService + "[constructor] :: Started!");
        that.apiList = {};
    }

    var iterateAPI = function iterateAPI(obj, currentStack, list) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] === "object") {
                    iterateAPI(obj[property], currentStack + "." + property, list);
                } else {
                    if (typeof obj[property] === "function") {

                        if(!(property in privateAPI)) {
                            var item = {
                                "methodName": currentStack + "." + property,
                                "called": 0
                            };
                            list[item.methodName] = item;
                        }
                    }
                }
            }
        }
    };

    Inspector.prototype.exists = function exists(apiName) {

        var fullAPIName = stack + "." + apiName;

        if (fullAPIName in this.apiList) {
            return true;
        }
        return false;
    };

    Inspector.prototype.hasBeenCalled = function hasBeenCalled(apiName) {

        var fullAPIName = stack + "." + apiName;

        if (fullAPIName in this.apiList) {
            this.apiList[fullAPIName].called++;
            return this.apiList[fullAPIName].called;
        }

        logger.debug(logService + "[hasBeenCall] :: Warning " + apiName + " has not been found...");
        return 0;
    };

    Inspector.prototype.coverage = function coverage() {
        var nbMethods = Object.keys(that.apiList).length;
        var nbUsed = 0;

        for (var property in that.apiList) {
            if (that.apiList[property].called > 0) {
                nbUsed++;
            }
        }
        return Number((nbUsed / nbMethods * 100).toFixed(2));        
    };

    Inspector.prototype.nbUsedAPI = function nbUsedAPI() {
        var nbUsed = 0;

        for (var property in that.apiList) {
            if (that.apiList[property].called > 0) {
                nbUsed++;
            }
        }
        return (nbUsed);        
    };

    Inspector.prototype.nbAPI = function nbAPI() {
        return (Object.keys(that.apiList).length);        
    };

    Inspector.prototype.nbCalledAPI = function nbCalledAPI() {
        var nbCalled = 0;

        for (var property in that.apiList) {
            nbCalled += that.apiList[property].called;
        }
        return (nbCalled);  
    };

    Inspector.prototype.inspect = function inspect(obj, rootName) {

        stack = rootName;

        return new Promise(function(resolve, reject) {
            try {
                iterateAPI(obj, stack, that.apiList);
                logger.debug(logService + "[inspect    ] :: Found " + Object.keys(that.apiList).length + " api(s)");
                resolve(that.apiList);
            }
            catch (err) {
                logger.debug(logService + "[inspect    ] :: Error when parsing the API...");
                reject(err);
            }
        });
    };

    Inspector.prototype.getNbActions = function getNbActions(obj) {
        return new Promise(function(resolve, reject) {

            try {
                var nbSteps = 0;
                obj.forEach(function (run) {
                    var by = run.it.by;
                    by.forEach(function(action) {
                        var using = action.using;
                        if(using) {
                            nbSteps += using.length;
                        }
                        else {
                            nbSteps +=1;
                        }
                        
                    });
                });
                resolve(nbSteps);
            }
            catch (err) {
                reject(err);
            }
        });
    };

    Inspector.prototype.getNbAsserts = function getNbAsserts(obj) {
        return new Promise(function(resolve, reject) {

            try {
                var nbExpects = 0;
                obj.forEach(function (run) {
                    var by = run.it.by;
                    by.forEach(function(action) {
                        var nbUsers = action.using ? action.using.length : 0;
                        var expecting = action.expecting;
                        if (expecting) {
                            nbExpects += expecting.length * nbUsers;
                        }
                        var waiting = action.waiting;
                        if (waiting) {
                            nbExpects += 1;
                        }
                    });
                });
                resolve(nbExpects);
            }
            catch (err) {
                reject(err);
            }
        });
    };


    Inspector.prototype.getNbTests = function getNbTests(obj) {
        return new Promise(function(resolve, reject) {

            try {
                resolve(obj.length);
            }
            catch (err) {
                reject(err);
            }
        });
    };

    Inspector.prototype.getEpicsList = function getEpicsList(obj) {
        return obj.run;
    };

    Inspector.prototype.reset = function reset() {
        for (var key in that.apiList) {
            that.apiList[key].called = 0;
        }
        
    };

    return Inspector;
}());

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Inspector;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            "use strict";
            return Inspector;
        });
    }
    else {
        window.Inspector = Inspector;
    }
}