var Renderer = (function() {

    "use strict";

    var logService = "Renderer   | ";

    var logger = null;

    var junitTestHeader = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\r\n<testsuites>";
    var junitTestFooter = "</testsuites>";
    
    var junitTestSuiteHeader = "<testsuite id=\"$$test_id$$\" name=\"$$test_name$$\">";
    var junitTestSuiteFooter = "</testsuite>";

    var junitTestCaseHeader = "<testcase id=\"$$case_id$$\" name=\"$$case_name$$\">";
    var junitTestCaseFooter = "</testcase>";
    
    var junitTestCaseFailure = "<failure></failure>";

    function Renderer (_logger) {
        logger = _logger;
        logger.debug(logService + "[constructor] :: Started!");
    }

    Renderer.prototype.writeAPINumber = function writeAPINumber(number) {
        $("#api_number").text(number);
    };

    Renderer.prototype.writeAPICoverage = function writeAPICoverage(number) {
        $("#api_coverage").text(number);
    };

    Renderer.prototype.writeAPIDetails = function writeAPIDetails(number) {
        $("#api_details").text(number);
    };

    Renderer.prototype.writeEpic = function writeEpic(name, id) {
        
        var nodes = [    
            '<div class="panel panel-default">',
            '<div class="panel-heading" role="tab" id="headingOne_' + id + '">',
            '<span class="label label-pill label-info"><span class="fa fa-list" aria-hidden="true"></span>&nbsp;EPIC&nbsp;</span>',
            '<span class="panel-title epic-title">',
            '<a role="button" data-toggle="collapse" data-parent="#api_testsPlan" href="#collapseOne_' + id + '" aria-expanded="true" aria-controls="collapseOne_' + id + '">',
            name,
            '</a>',
            '</span>',
            '<span class="label label-pill label-primary" id="badge_tests_' + id + '"></span>',
            '<span class="label label-pill label-warning badge-actions" id="badge_actions_' + id + '"></span>',
            '<span class="label label-pill label-expect badge-actions" id="badge_asserts_' + id + '"></span>',
            '<span class="label label-pill label-default epic-status" id="epic_status_' + id + '">Not Started</span>',
            '</div>',
            '<div id="collapseOne_' + id + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne_' + id + '">',
            '<div class="panel-body">',
            '<ul class="list-unstyled timeline widget" id="epic_' + id + '"></ul>',
            '</div>',
            '</div>',
            '</div>'].join("");
            
        $("#api_testsPlan").append(nodes);

        // Fill jUnit
        $("#junit_textarea").val(junitTestHeader);
    };
    Renderer.prototype.writeEpicEnd = function writeEpicEnd() {
        // Fill jUnit
        $("#junit_textarea").val($("#junit_textarea").val() + "\r\n" + junitTestFooter + "\r\n" );
    };

    Renderer.prototype.writeTest = function writeTest(refEpic, name, id) {

        var nodes = [
            '<li><div class="block">',
            '<div class="block_content">',
            '<span class="label label-pill label-primary"><span class="fa fa-cogs" aria-hidden="true"></span>&nbsp;&nbsp;IT SHOULD&nbsp;</span>',
            '<span class="title test-title">' + name + '</span>',
            '</div>',
            '<ul id="test_' + id + '"></ul>',
            '</div>',
            '</div>',
            '</li>'
        ].join("");

        $("#epic_" + refEpic).append(nodes);

        // Fill jUnit
        $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t" + 
            junitTestSuiteHeader.replace("$$test_id$$", id).replace("$$test_name$$", name)
        );
    };
    Renderer.prototype.writeTestEnd = function writeTestEnd() {        
        // Fill jUnit
        $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t" + junitTestSuiteFooter );
    };

    Renderer.prototype.writeAction = function writeAction(refTest, name, user, id) {

        var nodes = [
            '<li><div class="block">',
            '<div class="block_content">',
            '<span class="label label-pill label-warning"><span class="fa fa-cog" aria-hidden="true"></span>&nbsp;&nbsp;EXECUTE&nbsp;</span>',
            '<span class="title api-title">' + name + '</span>',
            '<span class="label label-pill label-default user-title">' + user + '</span>',
            '<ul id="assert_' + id + '"></ul>',
            '</div>',
            '</div>',
            '</li>'
        ].join("");

        $("#test_" + refTest).append(nodes);

        // Fill jUnit
        $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t\t" + 
            junitTestCaseHeader.replace("$$case_id$$", id).replace("$$case_name$$", name) + "\r\n\t\t" + junitTestCaseFooter
        );
    };
    Renderer.prototype.writeActionEnd = function writeActionEnd() {
    };

    Renderer.prototype.writeMissingAPI = function writeMissingAPI(refTest, name) {

        var nodes = [
            '<li><div class="block">',
            '<div class="block_content">',
            '<span class="label label-pill label-danger"><span class="fa fa-cog" aria-hidden="true"></span>&nbsp;&nbsp;NOT EXECUTED&nbsp;</span>',
            '<span class="title api-title">Unknown API ' + name + '</span>',
            '</div>',
            '</li>'
        ].join("");

        $("#test_" + refTest).append(nodes);
    };

    Renderer.prototype.writePause = function writePause(refTest, name, user, id) {

        var nodes = [
            '<li><div class="block">',
            '<div class="block_content">',
            '<span class="label label-pill label-warning"><span class="fa fa-cog" aria-hidden="true"></span>&nbsp;&nbsp;EXECUTE&nbsp;</span>',
            '<span class="title api-title">' + name + '</span>',
            '<span class="label label-pill label-default user-title">' + user + '</span>',
            '<ul id="assert_' + id + '"></ul>',
            '</div>',
            '</div>',
            '</li>'
        ].join("");

        $("#test_" + refTest).append(nodes);
    };

    Renderer.prototype.writeAssertDefined = function writeAssertDefined(refActionId, name, isOk, user) {
        var str = 'expected <label class="label label-expect">' + name + '</label> to be <label class="label label-expect">defined</label>&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeAssertUndefined = function writeAssertUndefined(refActionId, name, isOk, user) {
        var str = 'expected <label class="label label-expect">' + name + '</label> to be <label class="label label-expect">undefined</label>&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeAssertArray = function writeAssertArray(refActionId, name, isOk, user) {
        var str = 'expected <label class="label label-expect">' + name + '</label> to be an <label class="label label-expect">array</label>&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeAssertObject = function writeAssertObject(refActionId, name, isOk, user) {
        var str = 'expected <label class="label label-expect">' + name + '</label> to be an <label class="label label-expect">object</label>&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeAssertEqual = function writeAssertEqual(refActionId, key, check, isOk, user) {
        var str = 'expected <label class="label label-expect">' + key + '</label> to equal <label class="label label-expect">' + check + '</label>&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeAssertEqualFailed = function writeAssertEqualFailed(refActionId, value, key, check, isOk, user) {
        var str = 'expected <label class="label label-expect">' + key + '</label> to equal <label class="label label-expect">' + value + '</label> but received <label class="label label-expect">' + check + '</label>&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeActionFailed = function writeActionFailed(refActionId, key, isOk, user) {
        var str = 'expected <label class="label label-expect">' + key + '</label> can not be executed successfully&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeAssertEvent = function writeAssertEvent(refActionId, name, isOk, user) {
        var str = 'expected event <label class="label label-expect">' + name + '</label> received&nbsp;';
        writeAssert(refActionId, str, isOk, user);
    };

    Renderer.prototype.writeActionAborted = function writeActionAborted(refActionId, name, user) {
        var str = 'expected action <label class="label label-expect">' + name + '</label> to be called&nbsp;';
        writeAssert(refActionId, str, false, user);
    };

    Renderer.prototype.writeActionDone = function writeActionDone(refActionId, timer, user) {
        var str = 'expected action <label class="label label-expect">done</label> in ';
        if(timer === 0) {
            str += '<label class="label label-expect">1 ms</label>&nbsp;';
        } else {
            str += '<label class="label label-expect">' + timer + ' ms</label>&nbsp;';
        } 
        writeAssert(refActionId, str, true, user);
    };

    Renderer.prototype.writeDebounceActionDone = function writeDebounceActionDone(refActionId, timer, user) {
        var str = 'debounce action <label class="label label-expect">done</label> in ';
        str += '<label class="label label-expect">' + timer + ' ms</label>&nbsp;';
        writeAssert(refActionId, str, true, user);
    };

    var writeAssert = function writeAssert(refActionId, name, isOk, user) {
        var style = "ok";
        
        if(!isOk) {
            style = "error";
        }

        var nodes = [
            '<li><div class="block">',
            '<div class="block_content">',
            '<h2 class="title-' + style + ' assert-title">' + name + '<small>' + user + '</small></h2>',
            '</div>',
            '</div>',
            '</li>'
        ].join("");

        $("#assert_" + refActionId).append(nodes);

        // Fill jUnit
        $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t\t" + 
            junitTestCaseHeader.replace("$$case_id$$", refActionId).replace("$$case_name$$", name.replace(/<(?:.|\n)*?>/gm, '').replace('&nbsp;','') )
        );
        if(!isOk) {
            $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t\t\t" + 
                junitTestCaseFailure.replace("$$case_id$$", refActionId).replace("$$case_name$$", name.replace(/<(?:.|\n)*?>/gm, '') )
            );
        };
        $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t\t" + junitTestCaseFooter);
    };

    Renderer.prototype.writeNbActionsForEpic = function writeNbActionsForEpic(refEpic, nbSteps) {
        $("#badge_actions_" + refEpic).html('<span class="fa fa-cog" aria-hidden="true"></span>&nbsp;' + nbSteps + " actions");
    };

    Renderer.prototype.writeNbTestsForEpic = function writeNbTestsForEpic(refEpic, nbSteps) {
        $("#badge_tests_" + refEpic).html('<span class="fa fa-cogs" aria-hidden="true"></span>&nbsp;' + nbSteps + " tests");
    };

    Renderer.prototype.writeNbAssertsForEpic = function writeNbAssertsForEpic(refEpic, nbSteps) {
        $("#badge_asserts_" + refEpic).html('<span class="fa fa-check-square-o" aria-hidden="true"></span>&nbsp;' + nbSteps + " asserts");
    };

    Renderer.prototype.writeProgress = function writeProgress(id, actions) {
        actions.progress += 1;
        $("#epic_status_" + id).text("In progress... " + actions.progress + "/" + actions.nbActions);
    };

    Renderer.prototype.writeProgressFinish = function writeProgressFinish(id, hasError) {
        
        if(hasError) {
            $("#epic_status_" + id).text("Failed");
            $("#epic_status_" + id).removeClass("label-default").addClass("label-danger");
        }
        else {
            $("#epic_status_" + id).text("Done");
            $("#epic_status_" + id).removeClass("label-default").addClass("label-success");
        }
    };

    Renderer.prototype.writeProgressFinishBad = function writeProgressFinishBad(id) {
        $("#epic_status_" + id).text("Aborted");
        $("#epic_status_" + id).removeClass("label-default").addClass("label-danger");
    };

    Renderer.prototype.writeEpicsList = function writeEpicsList(list) {
        var html = [];

        list.forEach(function(epic) {
            var isChecked = epic.runnable;

            html.push('<input id="' + epic.name + '" class="input-epic" type="checkbox" aria-label="..." ' + (isChecked ? 'checked':'') + '>');
            html.push('<span class="label label-epic">' + epic.name + '</span>');
        });

        html = html.join("");

        $("#epics_list").html(html);
    };

    Renderer.prototype.writeAPIList = function writeAPIList(list) {
        var html = [];
        
        var id = "";

        for (var key in list) {
            
            id = list[key].methodName.substring(11).replaceAll(".", "-");
            
            html.push('<li class="list-group-item api-name"><div class="api-method">' + list[key].methodName.substring(11) + '</div><span class="badge" id="' + id +'">0</span></li>');
        }
            
        html = html.join("");

        $("#api_list").html(html);
    };

    Renderer.prototype.writeAPICalled = function writeAPICalled(strAPI, nbCalled) {
        if(nbCalled > 0) {
            var id = strAPI.replaceAll(".", "-");
            $('#' + id).text(nbCalled);
            if (!$('#' + id).hasClass("api-called")) {
                $('#' + id).addClass("api-called");
            }
        }
    };

    return Renderer;
}());

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Renderer;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            "use strict";
            return Renderer;
        });
    }
    else {
        window.Renderer = Renderer;
    }
}