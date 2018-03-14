var Log = require("./logger");
var logger = Log();
var logService = "DatasApi  | ";

function DatasApi() {

};

var datasApi = undefined;

DatasApi.prototype.writeAPINumber = function writeAPINumber(number) {
    logger.debug(logService + "[writeAPINumber    ] :: number : " + number);
    this.number = number;
    //$("#api_number").text(number);
};

DatasApi.prototype.writeAPICoverage = function writeAPICoverage(number) {
    logger.debug(logService + "[writeAPICoverage    ] :: number : " + number);
    //$("#api_coverage").text(number);
};

DatasApi.prototype.writeEpicsList = function writeEpicsList(list) {
    var html = [];

    this.epics_list = list;
    if (list) {
        list.forEach(function (epic) {
            logger.debug(logService + "[writeEpicsList    ] :: epic name : " + epic.name);
        });
    } else {
        logger.debug(logService + "[writeEpicsList    ] :: epic empty");
    }
/*    list.forEach(function (epic) {
        var isChecked = epic.runnable;

        html.push('<input id="' + epic.name + '" class="input-epic" type="checkbox" aria-label="..." ' + (isChecked ? 'checked' : '') + '>');
        html.push('<span class="label label-epic">' + epic.name + '</span>');
    });

    html = html.join("");

    $("#epics_list").html(html);
    // */
};


DatasApi.prototype.writeAPIList = function writeAPIList(list) {
    var html = [];

    var id = "";
    this.apiList = list;

    for (var key in list) {
        logger.debug(logService + "[writeAPIList    ] :: [" + key + "] : " + list[key].methodName);

        // id = list[key].methodName.substring(11).replaceAll(".", "-");

     //   html.push('<li class="list-group-item api-name"><div class="api-method">' + list[key].methodName.substring(11) + '</div><span class="badge" id="' + id + '">0</span></li>');
    }

//    html = html.join("");

   // $("#api_list").html(html);
};

DatasApi.prototype.writeAPICoverage = function writeAPICoverage(number) {
    logger.debug(logService + "[writeAPICoverage    ] :: number : " + number);
    this.api_coverage = number;
};

DatasApi.prototype.writeAPIDetails = function writeAPIDetails(number) {
    logger.debug(logService + "[writeAPIDetails    ] :: number : " + number);
    this.api_details = number;
};

DatasApi.prototype.writeEpicEnd = function writeEpicEnd() {
    logger.debug(logService + "[writeEpicEnd    ] " );
    // Fill jUnit
    //$("#junit_textarea").val($("#junit_textarea").val() + "\r\n" + junitTestFooter + "\r\n");
};

DatasApi.prototype.writeEpic = function writeEpic(name, id) {
    logger.debug(logService + "[writeEpic    ] :: name : " + name + ", id : " + id);

    /*var nodes = [
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
    // */
};

DatasApi.prototype.writeNbActionsForEpic = function writeNbActionsForEpic(refEpic, nbSteps) {
    // $("#badge_actions_" + refEpic).html('<span class="fa fa-cog" aria-hidden="true"></span>&nbsp;' + nbSteps + " actions");
    this.nbActionsForEpics = {
        'refEpic' : refEpic,
        'nbSteps' : nbSteps
    };
};

DatasApi.prototype.writeNbTestsForEpic = function writeNbTestsForEpic(refEpic, nbSteps) {
    // $("#badge_tests_" + refEpic).html('<span class="fa fa-cogs" aria-hidden="true"></span>&nbsp;' + nbSteps + " tests");
    this.nbTestsForEpics = {
        'refEpic': refEpic,
        'nbSteps': nbSteps
    };
};

DatasApi.prototype.writeNbAssertsForEpic = function writeNbAssertsForEpic(refEpic, nbSteps) {
    //$("#badge_asserts_" + refEpic).html('<span class="fa fa-check-square-o" aria-hidden="true"></span>&nbsp;' + nbSteps + " asserts");
    this.nbAssetsForEpics = {
        'refEpic': refEpic,
        'nbSteps': nbSteps
    };
};

DatasApi.prototype.writeProgress = function writeProgress(id, actions) {
    actions.progress += 1;
  //  $("#epic_status_" + id).text("In progress... " + actions.progress + "/" + actions.nbActions);
};

DatasApi.prototype.writeProgressFinish = function writeProgressFinish(id, hasError) {

/*    if (hasError) {
        $("#epic_status_" + id).text("Failed");
        $("#epic_status_" + id).removeClass("label-default").addClass("label-danger");
    }
    else {
        $("#epic_status_" + id).text("Done");
        $("#epic_status_" + id).removeClass("label-default").addClass("label-success");
    } // */
};

DatasApi.prototype.writeProgressFinishBad = function writeProgressFinishBad(id) {
    /* $("#epic_status_" + id).text("Aborted");
    $("#epic_status_" + id).removeClass("label-default").addClass("label-danger");
    // */
};

DatasApi.prototype.writeTest = function writeTest(refEpic, name, id) {

    /*
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
    // */
};

DatasApi.prototype.writeTestEnd = function writeTestEnd() {
    // Fill jUnit
   // $("#junit_textarea").val($("#junit_textarea").val() + "\r\n\t" + junitTestSuiteFooter);
};

DatasApi.prototype.writeActionEnd = function writeActionEnd() {
};

DatasApi.prototype.writeMissingAPI = function writeMissingAPI(refTest, name) {

    /*
    var nodes = [
        '<li><div class="block">',
        '<div class="block_content">',
        '<span class="label label-pill label-danger"><span class="fa fa-cog" aria-hidden="true"></span>&nbsp;&nbsp;NOT EXECUTED&nbsp;</span>',
        '<span class="title api-title">Unknown API ' + name + '</span>',
        '</div>',
        '</li>'
    ].join("");

    $("#test_" + refTest).append(nodes);
    // */
};

function getdatasApi() {
    if (datasApi == undefined) {
        // Instantiate the SDK
        datasApi = new DatasApi();
    } else {

    }
    return datasApi;
}

exports.getdatasApi = getdatasApi;