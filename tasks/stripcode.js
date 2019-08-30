'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('removedebugcode', 'Remove code from production code', function() {

        let multilineComment = /\/\*([\s\S]*?)\*\//g;
        let singleLineComment = /^\s*\t*(\/\/)[^\n\r]*[\n\r]/gm;
        //let debugcode = /^.*debug.*$/g;
        let replaceCode = [];
        let debugcode = /.*["|']debug["|'].*\r?\n/gm;
        replaceCode[0] = debugcode;

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
                replaceCode.forEach((codeToReplace) => {
                    countremovedcode = (contents.match(codeToReplace) || []).length;
                    contents = contents.replace(codeToReplace, '// replaced debug code \n');
                    grunt.log.writeln(">> " + countremovedcode + " debug code " + codeToReplace + " removed from " + file);
                });
            }

            grunt.file.write(file, contents);
        });
    });
};