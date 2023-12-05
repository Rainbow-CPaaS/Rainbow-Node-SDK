'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('generateJsDocToJSON', 'Generate JSON Doc File from JSDoc in source file', async function () {
        // Tell Grunt this task is asynchronous.
        var done = this.async();
        
        //const md = require("markdown").markdown;
        const fs = require("fs");
        const path = require("path");
        //const RSS = require('rss');
        const jsdocx = require('jsdoc-x');
        const util = require("util");

        //const uuid4 = require("uuid/v4");
        /*const { v4: uuid4 } = require('uuid');

        function  generateRandomID() {
            return uuid4();
        } // */

        // Extract version
        let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        let packageJSON = JSON.parse(content);
        let minVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts") - 2) : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
        let fullVersion = packageJSON.version;
        let currentVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts")) : packageJSON.version;

        grunt.log.writeln(">> minVersion : " + minVersion + ", fullVersion : ", fullVersion, ", currentVersion : ", currentVersion);

        /*
        let options = this.options({
            debugcode: true
        });
        // */

        let tabFiles = this.files;
        grunt.log.writeln(">> tabFiles : ", tabFiles );
        //console.log(">> tabFiles : ", tabFiles );

        if (!tabFiles || !Array.isArray(tabFiles)) {
            grunt.log.writeln(">> tabfiles not defined.");
        }

        //const iterator = tabFiles.values();
        //for (const file of iterator) {

        for (let iter=0 ; iter < tabFiles.length ; iter++ ) {
            let files = (tabFiles[iter].src+"").split(",");
            grunt.log.writeln(">> files : ", util.inspect(files, false, null, true));
            //continue;
            for (let iterFile=0 ; iterFile < files.length ; iterFile++ ) {
                let file = {"src": files[iterFile], "dest": tabFiles[iter].dest};
                grunt.log.writeln(">> file : ", file);
                //continue;
                grunt.log.writeln(">> src : " + file.src);
                let fileInputName = path.join(__dirname, '../' + file.src);

                let str = "" + file.src;
                let posSlash = str.lastIndexOf("/");
                grunt.log.writeln(">> str : " + str, ", posSlash : ", posSlash);
                let fileInputShortName = str.substr(posSlash, str.length);
                grunt.log.writeln(">> fileInputShortName : " + fileInputShortName);
                let posDot = fileInputShortName.lastIndexOf(".");
                let fileDestJson = fileInputShortName.substr(0, posDot < 0 ? fileInputShortName.length : posDot) + ".json";
                grunt.log.writeln(">> fileDestJson : " + fileDestJson, ", posDot : " + posDot);
                let fileDestName = path.join(__dirname, '../' + file.dest + fileDestJson);
                grunt.log.writeln(">> src : " + fileInputName + " to dest : " + fileDestName);

                let options = {
                    files: [fileInputName], // file.src
                    //source: file.src,
                    encoding: 'utf8',
                    recurse: false,
                    pedantic: false,
                    access: "public",
                    package: null,
                    module: true,
                    undocumented: false,
                    undescribed: false,
                    ignored: false,
                    relativePath: null,
                    sort: "grouped",
                    filter: {"$kind": 'function'},
                    output: {
                        "path": fileDestName,
                        "indent": 2,
                        "force": true
                    },
                    debug: true
                };
                grunt.log.writeln(">> options : ", options);
                grunt.log.writeln(">> src : " + fileInputName + " to dest : " + fileDestName);
                try {

                    await jsdocx.parse(options, (param) => {
                        //jsdocx.parse( "./lib/services").then(docs => {
                        //console.log(param);
                        grunt.log.writeln(">> parsed src : " + fileInputName + " to dest : " + fileDestName);
                        // console.log(JSON.stringify(docs, null, '  '));
                        /*expect(docs).toEqual(jasmine.any(Array));
                        let result = _.filter(docs, { undocumented: true });
                        expect(result.length).toBeGreaterThan(0);
                        result = _.find(docs, { longname: 'module.exports' });
                        expect(result).toBeDefined();
                        result = _.find(docs, { kind: 'package' });
                        expect(result).toBeUndefined();
                        result = _.find(docs, { longname: 'Code.ignored' });
                        expect(result).toBeUndefined();
                        // */
                    }).catch(err => {
                        //console.log("error : ",  err.stack);
                        grunt.log.writeln(">> error src : " + fileInputName + " to dest : " + fileDestName, ", error : ", err);

                        //expect(Boolean(err)).toEqual(false);
                        //console.log(err.stack || err);
                    });
                    // .finally(done);

                    /* try {
                        const docs = await jsdocx.parse({files: file.src, output: {"path": file.dest, "indent": 2, "force": true} });
                        grunt.log.writeln(">> tabfiles : ", docs);
                    } catch (err) {
                        console.log(err.stack);
                    } // */

                    //let html = md.renderJsonML(md.toHTMLTree(filteredTree));
                    //console.log(">> html : ", html);
//            grunt.file.write(file.dest, feedXml);
                } catch (err) {
                    grunt.log.writeln(">> CATCH Error !!! err : ", err);
                }
            }
        }
        // */
    });
};
