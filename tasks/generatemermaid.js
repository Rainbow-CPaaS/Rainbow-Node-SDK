"use strict";

let setTimeoutPromised = function(timeOutMs) {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            try {
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        }, timeOutMs);
    });
};

let pause = setTimeoutPromised;

let spawn = require("child_process").spawn;

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    grunt.registerMultiTask("generatemermaid", "Generate mermaid files.", async function() {
        let that = this;
        const fs = require("fs");
        const path = require("path");
        // Extract version
        let content = fs.readFileSync(path.join(__dirname, "../package.json"));
        let packageJSON = JSON.parse(content);
        //let minVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts") - 2) : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
        let fullVersion = packageJSON.version;
        //let currentVersion = packageJSON.version.indexOf("-lts") > -1 ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-lts")) : packageJSON.version;

        // Tell Grunt this task is asynchronous.
        let done = this.async();

        let options = this.options({
            shellcmd: "",
            debugcode: true
        });

        //grunt.log.writeln(">> flags : " + JSON.stringify(this.flags ) );
        grunt.log.writeln(">> that.files : " + JSON.stringify(that.files ) );

        let dest = that.files[0].dest;
        for (const index in that.files[0].src) {
            let file = that.files[0].src[index];
            //let contents = grunt.file.read(file);
            grunt.log.writeln(">> file " + file);

            if (options.debugcode) {
                //mermaid.
                // sh ./node_modules/.bin/mmdc -i jsdoc/diagramsMermaid/Flowchart.md -o build/Flowchart.png
                //grunt.log.writeln(">> dest : " + dest + " debug code " + options.debugcode + " from " + file);
                //let cmdStr = options.shellcmd + " -i " + file + " -o " + dest + "/" + file + ".png";
                let cmdStr = options.shellcmd;
                let args = [];
                args.push("./node_modules/.bin/mmdc");
                args.push("-i");
                args.push(file);
                args.push("-o");
                args.push(dest + "/" + file + ".png");
                //grunt.log.writeln(">> dest : " + options.shellcmd + " -i " + file + " -o " + dest + "/" + file + ".png");
                grunt.log.writeln(">> cmdStr : " + cmdStr + ", args : ", args);
                let cp = spawn(cmdStr, args);
                /*
                cp.stdout.pipe(process.stdout);
                cp.stderr.pipe(process.stderr);
                process.stdin.pipe(cp.stdin);

                cp.on("error", function(err) {
                    console.error("Error executing phantom at : ", cmdStr);
                    console.error(err.stack);
                });

                cp.on("exit", function(code) {
                    // Wait few ms for error to be printed.
                    setTimeout(function() {
                        process.exit(code);
                    }, 20);
                });

                process.on("SIGTERM", function() {
                    cp.kill("SIGTERM");
                    process.exit(1);
                });
                // */
            }

            //grunt.file.write(file, contents);
        }
        grunt.log.writeln(">> Wait 5 seconds.");
        await pause(5000);
        grunt.log.writeln(">> End wait.");
        done();
    });
};
