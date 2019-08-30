'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('removedebugcode', 'Remove code from production code', function() {

        let multilineComment = /\/\*([\s\S]*?)\*\//g;
        let singleLineComment = /^\s*\t*(\/\/)[^\n\r]*[\n\r]/gm;

        let options = this.options({
            singleline: true,
            multiline: true
        });

        this.files[0].src.forEach(function (file) {

            let contents = grunt.file.read(file);

            if ( options.multiline ) {
                contents = contents.replace(multilineComment, '/* replaced multi comment */');
            }

            if ( options.singleline ) {
                contents = contents.replace(singleLineComment, '// replaced single comment ');
            }

            grunt.file.write(file, contents);
        });
    });
};