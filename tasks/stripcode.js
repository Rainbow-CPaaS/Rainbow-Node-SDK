'use strict';

module.exports = function(grunt) {

    const fs = require("fs");
    const path = require("path");

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('removedebugcode', 'Remove code from production code', function() {

        // Extract version
        let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        let packageJSON = JSON.parse(content);
        //let minVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts") - 2) : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
        let fullVersion = packageJSON.version;
        //let currentVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts")) : packageJSON.version;

        let multilineComment = /\/\*([\s\S]*?)\*\//g;
        let singleLineComment = /^\s*\t*(\/\/)[^\n\r]*[\n\r]/gm;
        // //let debugcode = /^.*debug.*$/g;
        // let replaceCode = [];
        // let replaceBy = [];
        // //let debugcode = /.*["|']debug["|'].*\r?\n/gm;
        // //replaceCode[0] = /.*["']debug["'][\s\S]*?;{1}/gm;
        // //replaceCode[1] = /.*["']internal["'][\s\S]*?;{1}/g;
        // //replaceCode[0] = /\/\/ dev-code \/\/([\s\S]*?)\/\/ end-dev-code \/\//g;
        // replaceCode[0] = /\/\/ dev-code \/\//g;
        // replaceBy[0] = "/*";
        // replaceCode[1] = /\/\/ end-dev-code \/\//g;
        // replaceBy[1] = "// */";
        //
        // replaceCode[2] = /\* @version SDKVERSION/g;
        // //replaceBy[2] = "* @version " + fullVersion + " ";
        // replaceBy[2] = "* @version " + fullVersion + " - Documentation generated on " + new Date().toJSON().replace(/-/g, "/");

        let countremovedcode = 0;

        let options = this.options({
            singleline: false,
            multiline: false,
            debugcode: true
        });

        //grunt.log.writeln(">> flags : " + JSON.stringify(this.flags ) );
        
        if (options.replaceCodeTab && Array.isArray(options.replaceCodeTab)) {
            options.replaceCodeTab.push([/\* @version SDKVERSION/g, "* @version " + fullVersion + " - Documentation generated on " + new Date().toJSON().replace(/-/g, "/")]);
        }
        
            /*
            if (options.replaceCodeTab && Array.isArray(options.replaceCodeTab)) {
                options.replaceCodeTab.forEach((codeToReplace, index) => {
                    if (codeToReplace && Array.isArray(codeToReplace)) {
                        grunt.log.writeln(">> replaceCodeTab[" + index + "][0] : " + codeToReplace[0], ", replaceCodeTab[" + index + "][1] : " + codeToReplace[1]);
                    }
                });
            }
            // */
        
        this.files[0].src.forEach(function (file) {

            let contents = grunt.file.read(file);

            if ( options.multiline ) {
                contents = contents.replace(multilineComment, '/* replaced multi comment */\n');
            }

            if ( options.singleline ) {
                contents = contents.replace(singleLineComment, '// replaced single comment \n');
            }

            if ( options.debugcode ) {
                /*replaceCode.forEach((codeToReplace, index) => {
                    countremovedcode = (contents.match(codeToReplace) || []).length;
                    //contents = contents.replace(codeToReplace, '// replaced debug code \n');
                    contents = contents.replace(codeToReplace, replaceBy[index]);
                    if (countremovedcode > 0) {
                        grunt.log.writeln(">> " + countremovedcode + " debug code " + codeToReplace + " replaced by " + replaceBy[index] + " from " + file);
                    }
                }); // */

                if (options.replaceCodeTab && Array.isArray(options.replaceCodeTab)) {
                    options.replaceCodeTab.forEach((codeToReplaceAndReplaced, index) => {
                        if (codeToReplaceAndReplaced && Array.isArray(codeToReplaceAndReplaced)) {
                            //grunt.log.writeln(">> replace replaceCodeTab[" + index + "][0] : " + codeToReplaceAndReplaced[0], ", with replaceCodeTab[" + index + "][1] : " + codeToReplaceAndReplaced[1]);
                            countremovedcode = (contents.match(codeToReplaceAndReplaced[0]) || []).length;
                            //contents = contents.replace(codeToReplace, '// replaced debug code \n');
                            contents = contents.replace(codeToReplaceAndReplaced[0], codeToReplaceAndReplaced[1]);
                            if (countremovedcode > 0) {
                                grunt.log.writeln(">> " + countremovedcode + " debug code " + codeToReplaceAndReplaced[0] + " replaced by " + codeToReplaceAndReplaced[1] + " from " + file);
                            }
                        }
                    });
                }
            }

            grunt.file.write(file, contents);
        });
    });

    grunt.registerMultiTask('removeMacEOL', 'Remove Mac EOL from files', function() {

        // Extract version
        let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        let packageJSON = JSON.parse(content);
        //let minVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts") - 2) : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
        let fullVersion = packageJSON.version;
        //let currentVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts")) : packageJSON.version;

        let multilineComment = /\/\*([\s\S]*?)\*\//g;
        let singleLineComment = /^\s*\t*(\/\/)[^\n\r]*[\n\r]/gm;
        // //let debugcode = /^.*debug.*$/g;
        // let replaceCode = [];
        // let replaceBy = [];
        // //let debugcode = /.*["|']debug["|'].*\r?\n/gm;
        // //replaceCode[0] = /.*["']debug["'][\s\S]*?;{1}/gm;
        // //replaceCode[1] = /.*["']internal["'][\s\S]*?;{1}/g;
        // //replaceCode[0] = /\/\/ dev-code \/\/([\s\S]*?)\/\/ end-dev-code \/\//g;
        // replaceCode[0] = /\/\/ dev-code \/\//g;
        // replaceBy[0] = "/*";
        // replaceCode[1] = /\/\/ end-dev-code \/\//g;
        // replaceBy[1] = "// */";
        //
        // replaceCode[2] = /\* @version SDKVERSION/g;
        // //replaceBy[2] = "* @version " + fullVersion + " ";
        // replaceBy[2] = "* @version " + fullVersion + " - Documentation generated on " + new Date().toJSON().replace(/-/g, "/");

        let countremovedcode = 0;

        let options = this.options({
            singleline: false,
            multiline: false,
            debugcode: true
        });

        //grunt.log.writeln(">> flags : " + JSON.stringify(this.flags ) );

        if (options.replaceCodeTab && Array.isArray(options.replaceCodeTab)) {
            options.replaceCodeTab.push([/\* @version SDKVERSION/g, "* @version " + fullVersion + " - Documentation generated on " + new Date().toJSON().replace(/-/g, "/")]);
        }

        /*
        if (options.replaceCodeTab && Array.isArray(options.replaceCodeTab)) {
            options.replaceCodeTab.forEach((codeToReplace, index) => {
                if (codeToReplace && Array.isArray(codeToReplace)) {
                    grunt.log.writeln(">> replaceCodeTab[" + index + "][0] : " + codeToReplace[0], ", replaceCodeTab[" + index + "][1] : " + codeToReplace[1]);
                }
            });
        }
        // */

        this.files[0].src.forEach(function (file) {

            let contents = grunt.file.read(file);

            if ( options.multiline ) {
                contents = contents.replace(multilineComment, '/* replaced multi comment */\n');
            }

            if ( options.singleline ) {
                contents = contents.replace(singleLineComment, '// replaced single comment \n');
            }

            if ( options.debugcode ) {
                /*replaceCode.forEach((codeToReplace, index) => {
                    countremovedcode = (contents.match(codeToReplace) || []).length;
                    //contents = contents.replace(codeToReplace, '// replaced debug code \n');
                    contents = contents.replace(codeToReplace, replaceBy[index]);
                    if (countremovedcode > 0) {
                        grunt.log.writeln(">> " + countremovedcode + " debug code " + codeToReplace + " replaced by " + replaceBy[index] + " from " + file);
                    }
                }); // */

                if (options.replaceCodeTab && Array.isArray(options.replaceCodeTab)) {
                    options.replaceCodeTab.forEach((codeToReplaceAndReplaced, index) => {
                        if (codeToReplaceAndReplaced && Array.isArray(codeToReplaceAndReplaced)) {
                            //grunt.log.writeln(">> replace replaceCodeTab[" + index + "][0] : " + codeToReplaceAndReplaced[0], ", with replaceCodeTab[" + index + "][1] : " + codeToReplaceAndReplaced[1]);
                            countremovedcode = (contents.match(codeToReplaceAndReplaced[0]) || []).length;
                            //contents = contents.replace(codeToReplace, '// replaced debug code \n');
                            contents = contents.replace(codeToReplaceAndReplaced[0], codeToReplaceAndReplaced[1]);
                            if (countremovedcode > 0) {
                                grunt.log.writeln(">> " + countremovedcode + " debug code " + codeToReplaceAndReplaced[0] + " replaced by " + codeToReplaceAndReplaced[1] + " from " + file);
                            }
                        }
                    });
                }
            }

            grunt.file.write(file, contents);
        });
    });


};
