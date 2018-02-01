var Queue = (function() {
    
        "use strict";
        var rainbowNodeSdk = require('../../rainbowNodeSdk');
        var that;
        var logService = "Queue      | ";
    
        var testsPlan = null;
        var logger = null;
        var inspector = null;
        var framer = null;
        //var renderer = null;
        var datasApiMd = require('./datasApi');
        var datasApi = datasApiMd.getdatasApi();
        var prerequisite = null;
    
        var actionsStats = {};
    
        var tempoBeforeAsserting = 1000;
        var tempoBeforeTest = 1000;
    
        function Queue(_logger, _inspector, _framer, _renderer, _prerequisite) {
            logger = _logger;
            inspector = _inspector;
            framer = _framer;
            //renderer = _renderer;
            prerequisite = _prerequisite;
            logger.debug(logService + "[constructor] :: Started!");
            that = this;
        }
    
        function isObject(obj) {
            if (obj === null) { return false;}
            return ( (typeof obj === 'function') || (typeof obj === 'object') );
        }
    
        function isArray(obj) {
            return (Array.isArray(obj));
        }
    
        function isDefined(obj) {
            return (typeof (obj) !== "undefined" && obj !== null);
        }
    
        function isUndefined(obj) {
            return (typeof (obj) === "undefined" || obj === null);
        }
    
        function duplicateAction(action, name) {
            var duplicate = {
                "executing": action.executing, 
                "injecting": [], 
                "resulting": action.resulting, 
                "expecting": [],
                "using": [name]
            };
    
            for (var i = 0; i < action.injecting.length; i++) {
                duplicate.injecting.push(action.injecting[i]);
            }
    
            for (var i = 0; i < action.expecting.length; i++) {
                duplicate.expecting.push(action.expecting[i]);
            }
    
            return duplicate;
        }
    
        function getNameFromAPI(cmd) {
            var strAPI = "";
            if (cmd && cmd.length > 0) {
                var first = true;
                cmd.forEach(function(item) {
                    if (!first) {
                        strAPI += ".";
                    }
                    else {
                        first = false;
                    }
                    strAPI += item;
                });
            }
            return strAPI;
        }
    
        Queue.prototype.validateOneAction = function validateOneAction(conditions, id, user, refActionId, epicId) {
            if (!conditions) {
                return true;
            }
    
            if (!(typeof conditions) === "object") {
                return true;
            }
    
            if (conditions.length === 0) {
                logger.debug(logService + "[assert     ] ::          PASSED | no expectations");
                return true;
            }
    
            var nbSuccess = 0;
            var toReach = conditions.length;
    
            conditions.forEach(function(item) {
                var key = Object.keys(item)[0];
                var value = item[key];
    
                if (Object.keys(item).length === 2) {
                    user = item.for;
                }
    
                try {
                    var check = "";
                    if (key.substring(0, 4) === "var:") {
                        key = key.slice(4);
                        check = eval("window.sdkweb." + epicId + "." + user + "." + id + "." + key);
    
                        if ( value && value.startsWith && value.startsWith("#") ) {
                            // extract randomize info before comparing key and values
                            check = check.replace(/.*_/, "");
                            value = value.replace(/^./, "");
                        }
                    }
                    else if (key.substring(0, 4) === "all:") {
                        key = key.slice(4);
                        check = eval("window.sdkweb." + epicId + "." + user + "." + "all" + "." + key);
                    }
                    else {
                        check = key;
                    }
                    switch (value) {
                        case '$defined':
                            if (isDefined(check)) {
                                nbSuccess += 1;
                                logger.debug(logService + "[assert     ] ::          PASSED | expected " + key + " to be '$defined'");
                                renderer.writeAssertDefined(refActionId, key, true, user); 
                            }
                            else {
                                logger.debug(logService + "[assert     ] ::          FAILED | expected " + check + " to be '$defined' for " + key);
                                renderer.writeAssertDefined(refActionId, key, false, user); 
                            }
                            break;
                        case '$notDefined':
                            if (isUndefined(check)) {
                                nbSuccess += 1;
                                logger.debug(logService + "[assert     ] ::          PASSED | expected " + key + " to be '$notDefined'");
                                renderer.writeAssertUndefined(refActionId, key, true, user); 
                            }
                            else {
                                logger.debug(logService + "[assert     ] ::          FAILED | expected " + check + " to be '$notDefined' for " + key);
                                renderer.writeAssertUndefined(refActionId, key, false, user); 
                            }
                            break;
                        case '$anArray':
                            if (isArray(check)) {
                                nbSuccess += 1;
                                logger.debug(logService + "[assert     ] ::          PASSED | expected " + key + " to be '$anArray'");
                                renderer.writeAssertArray(refActionId, key, true, user); 
                            }
                            else {
                                logger.debug(logService + "[assert     ] ::          FAILED | expected " + check + " to be '$anArray' for " + key);
                                renderer.writeAssertArray(refActionId, key, false, user); 
                            }
                            break;
                        case "$anObject":
                            if (isObject(check)) {
                                nbSuccess += 1;
                                logger.debug(logService + "[assert     ] ::          PASSED | expected " + key + " to be '$anObject'");
                                renderer.writeAssertObject(refActionId, key, true, user); 
                            }
                            else {
                                logger.debug(logService + "[assert     ] ::          FAILED | expected " + check + " to be '$anObject' for " + key);
                                renderer.writeAssertObject(refActionId, key, false, user); 
                            }
                            break;
                        default:
                            if (check === value) {
                                nbSuccess += 1;
                                logger.debug(logService + "[assert     ] ::          PASSED | expected " + key + " to '$equal' " + check);
                                renderer.writeAssertEqual(refActionId, key, check, true, user); 
                            }
                            else {
                                logger.debug(logService + "[assert     ] ::          FAILED | expected " + value + " to '$equal' " + check + " for " + key);
                                renderer.writeAssertEqualFailed(refActionId, value, key, check, false, user); 
                            }
                            break;
                    }
                }
                catch (err) {
                    logger.debug(logService + "[assert     ] ::          CANCELED | Assertion on " + key + " can't be done...");
                    renderer.writeActionFailed(refActionId, "Assertion on " + key + " can't be done...", false, user);
                    console.log("err", err);
                    return false;
                }
            });
            if (nbSuccess === toReach) {
                return true;
            }
            else {
                return false;
            }
        };
    
        Queue.prototype.validateAllActions = function validateAllActions(__result, conditions, refTestId, user, refActionId, epicId) {
    
            return new Promise(function(resolve, __reject) {
                var isOk = that.validateOneAction(conditions, refTestId, user, refActionId, epicId);
    
                if (!isOk) {
                    actionsStats[epicId].hasAnError = true;
                }
                resolve();    
            });
        };
    
        Queue.prototype.executeNotAPromise = function executeNotAPromise(cmd) {
    
            return new Promise(function(resolve, reject) {
    
                try {
                    var res = eval(cmd);
                    resolve(res);
                }
                catch (err) {
                    reject(err);
                }
            });
        };
    
        Queue.prototype.waitForAnEvent = function waitForAnEvent(waiting, epicId, actionId) {
    
            return new Promise(function(resolve, reject) {
    
                if (!waiting) {
                    resolve(null);
                }
                else {
                    try {
                        var user = waiting.using[0];
                        var eventString = "window.sdkweb." + epicId + "." + user + ".win.rainbowSDK." + waiting.forEvent.slice(4);
                        var evtToListen = eval(eventString);
                        var property = waiting.resulting.substring(waiting.resulting.indexOf(">") + 1);
                    
                        var listener = function listener(event) {
                            var json = event.data;
    
                            switch (json.evt) {
                                case "listenResponse":
                                    logger.debug(logService + "[action     ] ::          PASSED | expected " + evtToListen + " (" + json.id + ")");
                                    renderer.writeAssertEvent(actionId, evtToListen, true, user);
                                    window.removeEventListener("message", listener, false);
                                    resolve(json.propValue);
                                    break;
                                default:
                                    break;
                            }
                        };
    
                        window.addEventListener("message", listener, false);
                        $("#" + user )[0].contentWindow.postMessage({evt: "listen", listening: evtToListen, "prop": property}, "*");
    
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            });
        };
    
        Queue.prototype.runAPI = function runAPI(cmd, params, user, epicId, actionId, waiting) {
            return new Promise(function(resolve, reject) {
    
                var startTime = new Date().getTime();
    
                try {
                    var eventString = "window.sdkweb." + epicId + "." + user + ".win.rainbowSDK";
                    cmd.forEach(function(param) {
                        eventString += "." + param;
                    });
                    eventString += "(";
                    for (var i = 0; i < params.length; i++) {
                        if (i === 0) {
                            eventString += params[i];
                        }
                        else {
                            eventString += "," + params[i];
                        }
                    }
                    eventString += ");";
    
                    var tempo = 1;
                    if (waiting) {
                        tempo = 1000;
                    }
    
                    that.temporize(tempo).then(function() {
                        var duration = new Date().getTime() - startTime;
                        if (tempo > 1) {
                            logger.debug(logService + "[action     ] ::          DEBOUNCE ACTION (" + duration + " ms)");
                            renderer.writeDebounceActionDone(actionId, duration, user);
                        }
                        startTime = new Date().getTime();
                        Promise.resolve(eval(eventString)).then(function(result) {
                            duration = new Date().getTime() - startTime;
                            logger.debug(logService + "[action     ] ::          PASSED | executed (" + duration + " ms)");
                            renderer.writeActionDone(actionId, duration, user);
                            resolve(result);
                        }).catch(function(err) {
                            logger.debug(logService + "[action     ] ::          error in ACTION (" + eventString + " )");
                            reject(err);
                        });
                    });
                }
                catch (_err) {
                    reject(_err);
                }
            });
        };
    
        Queue.prototype.runOneAction = function runOneAction(refTestId, cmd, params, output, conditions, waiting, user, epicId) {
            return new Promise(function(resolve, reject) {
    
                var strAPI = getNameFromAPI(cmd);
                var actionId = "_" + new Date().getTime();
    
                if (strAPI === "pause") {
                    logger.debug(logService + "[action     ] ::       executing " + strAPI);
                    
                    renderer.writePause(refTestId, strAPI, params[0], actionId);
                    
                    var startTime = new Date().getTime();
                    that.temporize(params[0]).then(function() {
                        var duration = new Date().getTime() - startTime;
                        logger.debug(logService + "[action     ] ::          PASSED | executed (" + duration + " ms)");
                        renderer.writeActionDone(actionId, duration, "");
                        resolve(false);
                    });                
    
                } else {
    
                    logger.debug(logService + "[action     ] ::       executing sdk." + strAPI + " (" + user + ")");
    
                    renderer.writeAction(refTestId, strAPI, user, actionId);
    
                    var nbCalled = inspector.hasBeenCalled(strAPI);
    
                    renderer.writeAPICalled(strAPI, nbCalled);
    
                    Promise.all([that.waitForAnEvent(waiting, epicId, actionId), that.runAPI(cmd, params, user, epicId, actionId, waiting)]).then(function(result) {
                        logger.debug(logService + "[action     ] ::       expecting sdk." + strAPI);
                        if (output) {
                            if (result) {
    
                                if ( !("all" in window.sdkweb[epicId][user])) {
                                    window.sdkweb[epicId][user].all = {};
                                }
    
                                var out = output;
                                var refTest = refTestId;
    
                                if (output.indexOf("all:") > -1) {
                                    out = output.substring(4);
                                    refTest = "all";
                                }
    
                                if (result.length > 1) {
                                    window.sdkweb[epicId][user][refTest][out] = result[1];
                                }
                                else {
                                    window.sdkweb[epicId][user][refTest][out] = result[0];
                                }
                            } 
                        }
    
                        if (waiting && result[0]) {
    
                            // only one user managed in waiting now
                            var waitingUser = waiting.using[0];
                            var object = waiting.resulting.substring(0, waiting.resulting.indexOf(">"));
                            var property = waiting.resulting.substring(waiting.resulting.indexOf(">") + 1);
                            
                            if (!(refTestId in window.sdkweb[epicId][waitingUser])) {
                                window.sdkweb[epicId][waitingUser][refTestId] = {};
                            }
    
                            window.sdkweb[epicId][waitingUser][refTestId][object] = {};
                            window.sdkweb[epicId][waitingUser][refTestId][object][property] = result[0];
                        }
    
                        that.temporize(tempoBeforeAsserting).then(function() {
                            that.validateAllActions(result[0], conditions, refTestId, user, actionId, epicId).then(function() {
                                renderer.writeActionEnd();
                                resolve(false);
                            }).catch(function(err) {
                                renderer.writeActionEnd();
                                reject(err);
                            });
                        });
                        
                    }).catch(function(err) {
                        logger.debug(logService + "[action     ] ::       FAILED | expected sdk." + strAPI);
                        renderer.writeActionAborted(actionId, strAPI, false, user);
                        //reject(err);
                        resolve(true);
                    });
                }
                
            });
        };
    
        Queue.prototype.temporize = function temporize(delay) {
            return new Promise(function(resolve, __reject) {
    
                setTimeout(function() {
                    resolve();
                }, delay);
    
            });
        };
    
        Queue.prototype.areAllAPIsExist = function areAllAPIsExist(test) {
            
            var by = test.by;
            var hasAnUndefinedApi = null;
    
            if (by) {
                
                by.some(function(action) {
    
                    var executing = action.executing;
    
                    if (executing) {
                        var key = executing.substring(0, 3);
    
                        if (key === "api") {
                            var apiName = action.executing.substring(4);
                            if (!inspector.exists(apiName)) {
                                hasAnUndefinedApi = apiName;
                                return true;
                            }
                        }
                    }
                });
            }
            return hasAnUndefinedApi;
        };
        
    
        Queue.prototype.runAllActionsOnTest = function runAllActionsOnTest(test, epicId) {
    
            return new Promise(function(resolve, reject) {
    
                try {
    
                    var undefinedAPI = that.areAllAPIsExist(test);
    
                    if (undefinedAPI) {
                        logger.debug(logService + "[test       ] ::    ABORTED (missing-api)");
                        renderer.writeMissingAPI(test.id, undefinedAPI);
                        resolve();
                    }
                    else {
                        var actionQueued = test.by.shift();
    
                        if (actionQueued) {
    
                            // Duplicate test in case of several users involved
                            if (actionQueued.using && actionQueued.using.length > 1) {
    
                                var actions = [];
                                
                                actionQueued.using.forEach(function(name) {
                                    
                                    var action = duplicateAction(actionQueued, name);
    
                                    for (var i = 0; i < action.injecting.length; i++) {
                                        action.injecting[i] = action.injecting[i].replaceAll("@", name);
                                    }
    
                                    actions.push(action);
                                });
    
                                // replace action queued by first action
                                actionQueued = actions.shift();
    
                                // Prepend others actions to the list
                                actions.forEach(function(action) {
                                    test.by.unshift(action);
                                });
                            }
                        }
    
                        if (actionQueued) {
    
                            renderer.writeProgress(epicId, actionsStats[epicId]);
    
                            var user = actionQueued.using ? actionQueued.using[0] : "";
                            var action = actionQueued.executing.substring(0, 3);
                            var cmd = actionQueued.executing.slice(4).split(".");
    
                            if (action === "api") {
                                if (!(test.id in window.sdkweb[epicId][user])) {
                                    window.sdkweb[epicId][user][test.id] = {};
                                }
    
                                for (var i = 0; i < actionQueued.injecting.length; i++) {
                                    var param = actionQueued.injecting[i];
                                    if (typeof param === "string") {
    
                                        var isInAnArray = false;
                                        //Injecting an array
                                        if (param.substring(0, 1) === "[") {
                                            isInAnArray = true;
                                            param = param.slice(1, -1);
                                        }
    
                                        var firstCharacters = param.substring(0, 4);
    
                                        switch (firstCharacters) {
                                            case "var:":
                                            case "all:":
                                                // Injecting output received from previous api call
                                                var pathToVariable = test.id;
                                                if (firstCharacters === "all:") {
                                                    pathToVariable = "all";
                                                }
                                                
                                                var o = "window.sdkweb." + epicId + "." + user + "." + pathToVariable + "." + param.slice(4);
                                                if (isInAnArray) {
                                                    actionQueued.injecting[i] = "[" + o + "]";
                                                }
                                                else {
                                                    actionQueued.injecting[i] = o;
                                                }
                                                break;
                                            case "usr:":
                                                // Injecting information from users
                                                var o = "window.sdkweb." + epicId + "." + param.slice(4);
                                                actionQueued.injecting[i] = o;
                                                break;
                                            case "api:":
                                                // Injecting rainbow SDK constant
                                                var o = "window.sdkweb." + epicId + "." + user + ".win.rainbowSDK." + param.slice(4); 
                                                actionQueued.injecting[i] = o;
                                                break;
                                            case "str:":
                                                actionQueued.injecting[i] = "'" + param.slice(4) + "'";
                                                break;
                                            case "eml:":
                                                actionQueued.injecting[i] = "'" + epicId.replace("_","") + "_" + param.slice(4) + "'";
                                                break;
                                            case "unq:":
                                                actionQueued.injecting[i] = "'" + param.slice(4) + " (" + epicId.replace("_","") + ")'";
                                                break;
                                            case "obj:":
                                                var o = "window.sdkweb." + epicId + "." + user + "." + test.id + ".obj";
                                                window.sdkweb[epicId][user][test.id].obj = JSON.parse(param.slice(4));
                                                actionQueued.injecting[i] = o;
                                                break;
                                            default:
                                                actionQueued.injecting[i] = "'" + param + "'";
                                                // Normal string: keep it
                                                break;
                                        }
                                    } 
                                }
                            }
                            else if (action === "exe") {
                                actionQueued.injecting = [actionQueued.duration];
                            }
                            
                            that.temporize(tempoBeforeTest).then(function() {
                                return that.runOneAction(test.id, cmd, actionQueued.injecting, actionQueued.resulting, actionQueued.expecting, actionQueued.waiting, user, epicId).then(function(hasAnError){
                                    
                                    if (hasAnError) {
                                        // Remove all others actions
                                    }
    
                                    return that.runAllActionsOnTest(test, epicId).then(function() {
                                        resolve();
                                    }).catch(function(err) {
                                        reject(err);    
                                    });
                                }).catch(function(err) {
                                    logger.debug(logService + "[test       ] ::    FAILED");
                                    reject(err);    
                                });
                            });
                        }
                        else {
                            logger.debug(logService + "[test       ] ::    PASSED");
                            resolve();
                        }
                    }
                }
                catch (err) {
                    console.log(">>>> Crach bis");
                    reject(err);
                }
    
            });
        };
    
        Queue.prototype.runAllTestsOnEpic = function runAllTestsOnEpic(tests, epicId) {
    
            return new Promise(function(resolve, reject) {
    
                var test = tests.shift();
    
                if (test) {
    
                    var it = test.it;
    
                    it.id = "_" + new Date().getTime();
                    logger.debug(logService + "[test       ] ::    it (" + it.id + ")");
                    logger.debug(logService + "[test       ] ::    should: '" + it.should + "'");
                    
                    renderer.writeTest(epicId, it.should, it.id);
    
                    return that.runAllActionsOnTest(it, epicId).then( function() {
                        renderer.writeTestEnd();
                        return that.runAllTestsOnEpic(tests, epicId).then(function() {
                            resolve();
                        }).catch(function(err) {
                            logger.debug(logService + "[epic       ] :: FAILED");                            reject();
                        });
                    }).catch(function(err) {
                        console.log("[TST ] Error (4)", err);
                        reject();
                    });
                }
                else {
                    logger.debug(logService + "[epic       ] :: PASSED");
                    resolve();
                }
            });
    
        };
    
        function waitForInit(listOfWaiting) {
    
            var waitFor = listOfWaiting;
    
            return new Promise(function(resolve, reject) {
    
                logger.debug(logService + "[epic       ] :: Wait for all IFrames...");
    
                window.addEventListener("message", function(event) {
                    var json = event.data;
    
                    switch (json.evt) {
                        case "started":
                            if (json.id in waitFor) {
                                logger.debug(logService + "[epic       ] :: IFrame " + json.id + " ready!");
                                delete waitFor[json.id];
                            }
                            if (Object.keys(waitFor).length === 0) {
                                // event listener to remove ?
                                logger.debug(logService + "[epic       ] :: All IFrames are ready. Continue...");
                                resolve();
                            }
                            break;
                        default:
                        break;
                    }
    
                }, false);
    
            });
        }
    
        Queue.prototype.randomString = function randomString(length, chars) {
            var result = "";
            for (var i = length; i > 0; --i) {
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return result;
        };
    
    
        Queue.prototype.runEpic = function runEpic(epics) {
    
            return new Promise(function(resolve, reject) {
    
                var epicPath = epics.shift();
    
                if (epicPath) {
                    logger.debug(logService + "[epic       ] :: -------------------------------------------");
                    that.loadEpic(epicPath).then(function(tests) {
    
                        var admin = tests.starring.admin;
                        var actors = tests.starring.actors;
                        var relations = tests.starring.relations;
                        var adminUser = null;
    
                        tests.epicId = "_" + new Date().getTime();
                        tests.randomId = that.randomString(16, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
                        logger.debug(logService + "[epic       ] :: Epic " + tests.describe + " (" + tests.epicId + ")");
    
                        window.sdkweb[tests.epicId] = {};
    
                        renderer.writeEpic(tests.describe, tests.epicId);
    
                        // Add tests that should run before
                        if (tests.runBeforeAll) {
                            tests.run.unshift(tests.runBeforeAll);
                        }
    
                        // Add tests that shoud run after
                        if (tests.runAfterAll) {
                            tests.run.push(tests.runAfterAll);
                        }
    
                        // rework actors email
                        for ( var userName in actors ) {
                            if ( admin[userName] === undefined ) 
                                actors[userName].email = tests.randomId + "_" + actors[userName].email;
                        }
                        
                        // Add tests for creating the companies and the users
                        var createCompaniesAndActors = prerequisite.createCompaniesAndUsers(admin, actors, tests.epicId);
    
                        // Add tests for removing the companies and the users
                        var removeCompaniesAndActors = prerequisite.removeCompaniesAndUsers(admin, actors);
    
                        var createRelationsActors = null;
                        var createRelationsCompanies = null;
    
                        if (tests.starring.relations) {
                            // Add tests for settings the relations between users
                            createRelationsActors = prerequisite.createRelationBetweenActors(admin, relations, actors, tests.randomId);
                            tests.run.unshift(createRelationsActors);
                            // Add tests for setting the relations between the companies (if needed)
                            createRelationsCompanies = prerequisite.createVisibilityBetweenCompanies(admin, relations, tests.epicId);
                            tests.run.unshift(createRelationsCompanies);
                        }                    
    
                        tests.run.unshift(createCompaniesAndActors);
                        tests.run.push(removeCompaniesAndActors);
    
                        var listOfWaiting = {};
                        
                        // Prepare admin
                        for (var userName in admin) {
                            adminUser  = admin[userName];
                            window.sdkweb[tests.epicId][userName] = {
                                "email": admin[userName].email,
                                "password": admin[userName].password,
                                "company": admin[userName].company,
                                "firstname": admin[userName].firstname,
                                "lastname": admin[userName].lastname,
                                "admin": true,
                                "win": null
                            };
    
                            framer.createIFrame(userName);
                            window.sdkweb[tests.epicId][userName].win = document.getElementById(userName).contentWindow;
                            listOfWaiting[userName] = userName;
                        }
                        
                        // Prepare users
                        for (var userName in actors) {
    
                            if (userName !== adminUser.firstname) {
                                window.sdkweb[tests.epicId][userName] = {
                                    "email": actors[userName].email,
                                    "password": actors[userName].password,
                                    "company": actors[userName].company,
                                    "firstname": actors[userName].firstname,
                                    "lastname": actors[userName].lastname,
                                    "admin": false,
                                    "win": null
                                };
    
                                framer.createIFrame(userName);
                                window.sdkweb[tests.epicId][userName].win = document.getElementById(userName).contentWindow;
                                listOfWaiting[userName] = userName;
                            }
                        }
    
                        waitForInit( listOfWaiting).then(function() {
                            Promise.all([
                                inspector.getNbTests(tests.run),
                                inspector.getNbActions(tests.run),
                                inspector.getNbAsserts(tests.run)]
                            ).then(function(results) {
                                
                                actionsStats[tests.epicId] = {
                                    nbTests: results[0],
                                    nbActions: results[1],
                                    nbAsserts: results[2],
                                    progress: 0,
                                    hasAnError: false
                                };
                                    
                                renderer.writeNbTestsForEpic(tests.epicId, results[0]);
                                renderer.writeNbActionsForEpic(tests.epicId, results[1]);
                                renderer.writeNbAssertsForEpic(tests.epicId, results[2]);
                                    
                                return that.runAllTestsOnEpic(tests.run, tests.epicId).then( function() {
                                    logger.debug(logService + "[epic       ] :: Epic done");
                                    renderer.writeProgressFinish(tests.epicId, actionsStats[tests.epicId].hasAnError);
                                    framer.removeAllIFrames();
                                    that.displayStats();
                                    return that.runEpic(epics).then(function() {
                                        resolve();
                                    }).catch(function(err) {
                                        console.log("Error 1", err);
                                        renderer.writeProgressFinishBad(tests.epicId);
                                        reject(err);
                                    });
                                }).catch(function(err) {
                                    renderer.writeProgressFinishBad(tests.epicId);
                                    console.log("Error 2", err);
                                    reject(err);
                                });
                            }).catch(function(err) {
                                renderer.writeProgressFinishBad(tests.epicId);
                                console.log("Err init", err);
                                reject(err);
                            });

                            //renderer.writeEpicEnd();

                        }).catch(function(err) {
                            logger.debug(logService + "[epic       ] :: Error : " + err);
                            reject(err);
                        });
                    }).catch(function(err) {
                        logger.debug(logService + "[epic       ] :: Error : " + err);
                        reject(err);
                    });
                }
                else {
                    resolve();
                }
    
            });
        };
    
        Queue.prototype.runTestsplan = function runTestsplan() {
            return new Promise(function(resolve, reject) {
    
                var epicsList = testsPlan.run;
                console.log(JSON.stringify(testsPlan.run));
    
                // Store epicsList
                localStorage.setItem("epicsList", JSON.stringify(epicsList)); 
    
                tempoBeforeAsserting = testsPlan.with.tempoBeforeAsserting;
                tempoBeforeTest = testsPlan.with.tempoBeforeTest;
    
                var epics = [];
                
                epicsList.forEach(function(epic) {
                    if(epic.runnable) {
                        epics.push(epic.file);
                    }
                });
    
                that.runEpic(epics).then(function() {
                    renderer.writeEpicEnd();
                    logger.debug(logService + "[runTestspln] :: Finished!");
                    resolve();
                }).catch(function(err) {
                    logger.debug(logService + "[runTestspln] :: Not finished!");
                    reject("err", err);
                });
    
            });
        };
    
        Queue.prototype.loadEpic = function loadEpic(epicPath) {
    
            return new Promise(function(resolve, reject) {
    
                $.getJSON(epicPath).then(function(data) {
                    logger.debug(logService + "[epic       ] :: Loaded '" + epicPath + "'");
                    resolve(data);
                }).fail( function(err) {
                    logger.debug(logService + "[epic       ] :: '" + epicPath + "' not loaded (not-found-or-invalid)");
                    reject({"code": "not-found-or-invalid", error: err});
                });
            });
        };
    
        Queue.prototype.load = function load(path) {
            return new Promise(function(resolve, reject) {
                $.getJSON(path).then(function(data) {
                    testsPlan = data;
                    logger.debug(logService + "[load       ] :: '" + path + "' loaded");
                    resolve(data);
                }).fail( function(err) {
                    logger.debug(logService + "[load       ] :: '" + path + "' not loaded ((not-found-or-invalid))");
                    reject({"code": "not-found-or-invalid", error: err});
                });
            });
        };
    
        Queue.prototype.initialize = function initialize() {
            return new Promise(function(resolve, reject) {
                logger.debug(logService + "[initialize ] :: Initializing...");
                inspector.inspect(rainbowNodeSdk.getRainbowSDK(), "rainbowSDK").then(function(apiList) {
                    datasApi.writeAPINumber(inspector.nbAPI());
                    datasApi.writeAPIList(apiList);
                    //renderer.writeAPINumber(inspector.nbAPI());
                    //renderer.writeAPIList(apiList);
                    logger.debug(logService + "[initialize ] :: Initialized");
                    resolve();
                }).catch(function() {
                    reject();
                });
            });
        };
    
        Queue.prototype.displayStats = function displayStats() {
            var coverage = inspector.coverage();
            renderer.writeAPICoverage(coverage + "%");
            renderer.writeAPIDetails(inspector.nbUsedAPI() + "/" + inspector.nbAPI());    
        };
    
        Queue.prototype.renderEpicsList = function renderEpicsList() {
            var epicsList = inspector.getEpicsList(testsPlan);
    
            // Retrieve existing epicslist from localstorage
            var storageResult = localStorage.getItem("epicsList");
            var storedEpicsList = JSON.parse(storageResult);
            if ( !storedEpicsList ) {
                storedEpicsList = [];
            }
    
            testsPlan.run.forEach(function(epic) {
    
                var storedValue = storedEpicsList.find( function(val) {
                    return ( val.name === epic.name );
                } );
                if ( storedValue ) {
                    epic.runnable = storedValue.runnable;
                } else {
                    epic.runnable = true;
                }            
            });
            renderer.writeEpicsList(epicsList);
        };
    
        Queue.prototype.selectEpic = function selectEpic(epicName, runnable) {
            testsPlan.run.forEach(function(epic) {
                if(epic.name === epicName) {
                    epic.runnable = runnable;
                }
            });
        };
    
        Queue.prototype.reset = function reset() {
            actionsStats = {};
        };
    
        return Queue;
    }());
    
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Queue;
    }
    else {
        if (typeof define === 'function' && define.amd) {
            define([], function() {
                "use strict";
                return Queue;
            });
        }
        else {
            window.Queue = Queue;
        }
    }