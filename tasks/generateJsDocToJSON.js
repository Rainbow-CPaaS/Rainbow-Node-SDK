'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('generateJsDocToJSON', 'Generate JSON Doc File from JSDoc in source file', async function () {
        //const md = require("markdown").markdown;
        const fs = require("fs");
        const path = require("path");
        //const RSS = require('rss');
        const jsdocx = require('jsdoc-x');
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

        let options = this.options({
            debugcode: true
        });

        let tabFiles = this.files;
        grunt.log.writeln(">> tabFiles : ", tabFiles );
        //console.log(">> tabFiles : ", tabFiles );

        if (!tabFiles || !Array.isArray(tabFiles)) {
            grunt.log.writeln(">> tabfiles not defined.");
        }

        //const iterator = tabFiles.values();
        //for (const file of iterator) {

        for (let iter=0 ; iter < tabFiles.length ; iter++ ) {
            let file = tabFiles[iter];
            grunt.log.writeln(">> src : " + file.src + " to dest : " + file.dest + ", path.join(__dirname, file.src) : ", path.join(__dirname, "../" + file.src.toString()));

            try {
                const docs = await jsdocx.parse({files: file.src, output: file.dest});
                grunt.log.writeln(">> tabfiles : ", docs);
            } catch (err) {
                console.log(err.stack);
            }


            //let html = md.renderJsonML(md.toHTMLTree(filteredTree));
            //console.log(">> html : ", html);
//            grunt.file.write(file.dest, feedXml);
        }
        // */
    });
};
