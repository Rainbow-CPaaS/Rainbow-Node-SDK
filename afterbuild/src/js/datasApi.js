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
    //$("#api_coverage").text(number);
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

function getdatasApi() {
    if (datasApi == undefined) {
        // Instantiate the SDK
        datasApi = new DatasApi();
    } else {

    }
    return datasApi;
}

exports.getdatasApi = getdatasApi;