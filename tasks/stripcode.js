'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('removedebugcode', 'Remove code from production code', function() {

        let multilineComment = /\/\*([\s\S]*?)\*\//g;
        let singleLineComment = /^\s*\t*(\/\/)[^\n\r]*[\n\r]/gm;
        //let debugcode = /^.*debug.*$/g;
        let replaceCode = [];
        let replaceBy = [];
        //let debugcode = /.*["|']debug["|'].*\r?\n/gm;
        //replaceCode[0] = /.*["']debug["'][\s\S]*?;{1}/gm;
        //replaceCode[1] = /.*["']internal["'][\s\S]*?;{1}/g;
        //replaceCode[0] = /\/\/ dev-code \/\/([\s\S]*?)\/\/ end-dev-code \/\//g;
        replaceCode[0] = /\/\/ dev-code \/\//g;
        replaceBy[0] = "/*";
        replaceCode[1] = /\/\/ end-dev-code \/\//g;
        replaceBy[1] = "// */";


        let countremovedcode = 0;

        let options = this.options({
            singleline: false,
            multiline: false,
            debugcode: true
        });

        this.files[0].src.forEach(function (file) {

            let contents = grunt.file.read(file);

            if ( options.multiline ) {
                contents = contents.replace(multilineComment, '/* replaced multi comment */\n');
            }

            if ( options.singleline ) {
                contents = contents.replace(singleLineComment, '// replaced single comment \n');
            }

            if ( options.debugcode ) {
                replaceCode.forEach((codeToReplace, index) => {
                    countremovedcode = (contents.match(codeToReplace) || []).length;
                    //contents = contents.replace(codeToReplace, '// replaced debug code \n');
                    contents = contents.replace(codeToReplace, replaceBy[index]);
                    if (countremovedcode > 0) {
                        grunt.log.writeln(">> " + countremovedcode + " debug code " + codeToReplace + " removed from " + file);
                    }
                });
            }

            grunt.file.write(file, contents);
        });
    });
};