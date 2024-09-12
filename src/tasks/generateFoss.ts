"use strict";

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('generateFoss', 'Generate Foss file with lib imported in package.json', function () {

        const Request = require("request");
        const md = require("markdown").markdown;
        const fs = require("fs");
        const path = require("path");

        const RainbowSDK = require("../index");
        const Utils = require("../lib/common/Utils");

        let optionsFoss = this.options({
            debugcode: true
        });

        let tabFiles = this.files;
        grunt.log.writeln(">> FOSS tabFiles : ", tabFiles );
        //console.log(">> tabFiles : ", tabFiles );

        if (!tabFiles || !Array.isArray(tabFiles)) {
            grunt.log.writeln(">> tabfiles not defined.");
        }

        let file = tabFiles[0];
            
        let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        let packageJSON = JSON.parse(content);
        let minVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts") - 2):packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
//let fullVersion = packageJSON.version;
//let currentVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts")) : packageJSON.version;
        //grunt.log.writeln( "MAIN - rainbow SDK version : ", minVersion); //logger.colors.green(JSON.stringify(result)));


        const USER_AGENT = "node/" + process.version + " (" + process.platform + "; " + process.arch + ") " + "Rainbow Sdk/" + minVersion; //+ packageVersion.version;
        let headers = {};

        /**
         *
         */
        function hasJsonStructure(str) {
            if (typeof str!=='string') return false;
            try {
                const result = JSON.parse(str);
                const type = Object.prototype.toString.call(result);
                return type==='[object Object]'
                        || type==='[object Array]';
            } catch (err) {
                return false;
            }
        }

        function _getUrl(url, headers: any = {}, params): Promise<any> {

            let that = this;

            return new Promise(function (resolve, reject) {

                try {
                    headers["user-agent"] = USER_AGENT;
                    let urlEncoded = url;

                    //grunt.log.writeln( "MAIN - (get) url : ", (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                    //grunt.log.writeln( "MAIN - (get) url : ", that.serverURL + url, ", headers : ", headers, ", params : ", params);

                    let request = Request({
                        url: urlEncoded,
                        method: "GET",
                        headers: headers,
                        //params: params,
                        //proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                        //agentOptions: {
                        //secureProtocol: that.proxy.secureProtocol
                        //}
                    }, (error, response, body) => {
                        // grunt.log.writeln( "MAIN - (get) successfull");
                        if (error) {
                            return reject({
                                code: -1,
                                msg: "ErrorManager while requesting",
                                details: error
                            });
                        } else {
                            if (response) {
                                if (response.statusCode) {
                                    //grunt.log.writeln( "MAIN - (get) HTTP statusCode defined : ", response.statusCode);
                                    if (response.statusCode >= 200 && response.statusCode <= 206) {
                                        if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                            let json = {};
                                            if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                                json = JSON.parse(response.body);
                                                resolve(json);
                                            } else {
                                                resolve(response.body);
                                            }
                                        } else {
                                            return reject({
                                                code: -1,
                                                msg: "Bad content, please check your host",
                                                details: ""
                                            });
                                        }
                                    } else {
                                        grunt.log.writeln( "MAIN - (get) HTTP response.code != 200 , bodyjs : ", response.body);
                                        let bodyjs: any = {};
                                        if (hasJsonStructure(response.body)) {
                                            bodyjs = JSON.parse(response.body);
                                        } else {
                                            bodyjs.errorMsg = response.body;
                                        }
                                        let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                        let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
                                        errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";
                                        //that.tokenExpirationControl(bodyjs);
                                        return reject({
                                            code: response.statusCode,
                                            msg: msg,
                                            details: errorMsgDetail,
                                            error: bodyjs
                                        });

                                    }
                                } else {
                                }
                            } else {
                            }
                        }
                    });
                } catch (err) {
                    grunt.log.writeln( "MAIN - (get) HTTP ErrorManager", err);
                    return reject({
                        code: -1,
                        msg: "Unknown error",
                        details: ""
                    });
                }
            });
        }

        async function main() {
            let fossText = "**FOSS Component**  | **Website** | **License** | **Modified by ALE** | **Version** \n" +
                    ":------------- | :-------------: | :-------------: | :-------------: | :-------------: \n";

            for (const depKey in packageJSON.dependencies) {
                let fossName = depKey;
                let fossWebSite = "";
                let fossLicence = "";
                let fossModifiedByAle = "false";
                let fossVersion = packageJSON.dependencies[depKey];

                //grunt.log.writeln( "MAIN - rainbow SDK fossName : ", fossName, ", fossVersion : ", fossVersion); //logger.colors.green(JSON.stringify(result)));
                //_getUrl("https://api.npms.io/v2/search?q=" + depKey, headers, undefined).then(function (json) {
                await _getUrl("https://api.npms.io/v2/package/" + fossName, headers, undefined).then(function (json) {
                    //grunt.log.writeln( "MAIN - (getRainbowNodeSdkPackagePublishedInfos) dependency : ", fossName, ", received ", json);
                    // console.log( "MAIN - (getRainbowNodeSdkPackagePublishedInfos) received ", json);
                    fossName = json.collected.metadata.name;
                    fossWebSite = json.collected.metadata.links.homepage;
                    fossLicence = json.collected.metadata.license;
                    fossModifiedByAle = "false";
                    fossVersion = packageJSON.dependencies[depKey];

                    fossText += fossName + " | [" + fossWebSite + "](" + fossWebSite + ") | " + fossLicence + " | " + fossModifiedByAle + " | " + fossVersion + "\n"; //@xmpp/client | [www](http://github.com/xmppjs/xmpp.js) | [ISC](http://www.opensource.org/licenses/ISC) | NO | 0.3.0

                }).catch(function (err) {
                    grunt.log.writeln( "MAIN - (getRainbowNodeSdkPackagePublishedInfos) error : ", err);
                });
            }

            fossText += "\n" +
                    "---\n" +
                    "\n" +
                    "_Last updated " + new Date().toISOString() + "_\n";

            /* grunt.log.writeln( "MAIN - fossText : ", fossText);
            let filePath = path.join(__dirname, "../build/") + "fossText.md";
            grunt.log.writeln( "MAIN - filePath : ", filePath);

            //fs.writeFile("c:\\temp\\" + "fossText.md", fossText, "utf8", function(err) {
            fs.writeFile(filePath, fossText, "utf8", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log("The file was saved! : " + "c:\\temp\\" + "fossText.md");
                    console.log("The file was saved! : " + filePath);
                }
            });
            // */

            grunt.log.writeln( ">> Write the FOSS in file : ", file.dest);
            grunt.file.write(file.dest, fossText);
            
        }

        main();

    });
};
