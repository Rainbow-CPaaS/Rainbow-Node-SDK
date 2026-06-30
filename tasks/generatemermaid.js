"use strict";

const path = require('path')
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

        let dest = that.files[0].dest + "/resources";
        if (!fs.existsSync(dest)){
            grunt.log.writeln(">> create dest directory : " + dest);
            fs.mkdirSync(dest, { recursive: true });
        } else {
            grunt.log.writeln(">> use already existing dest directory : " + dest);
        }

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

                let destFile = dest + "/" + path.basename(file) + ".png";
                grunt.log.writeln(">> destFile : " + destFile);

                let args = [];
                args.push("./node_modules/.bin/mmdc");
                args.push("-i");
                args.push(file);
                args.push("-o");
                args.push(destFile);
                args.push("-p");
                args.push("./puppeteer-config.json");
                grunt.log.writeln(">> will call cmdStr : " + cmdStr + ", with args : " + JSON.stringify(args));

                try {
                    await new Promise((resolve, reject) => {
                        let cp = spawn("node", args, { stdio: "pipe" });
                        cp.stdout.on("data", d => grunt.log.writeln(d.toString().trim()));
                        cp.stderr.on("data", d => grunt.log.error(d.toString().trim()));
                        cp.on("error", reject);
                        cp.on("close", code => code === 0 ? resolve() : reject(new Error(`mmdc exited with code ${code} for ${file}`)));
                    });
                } catch (err) {
                    grunt.log.warn(`>> skipping ${file} : ${err.message}`);
                }
            }

            //grunt.file.write(file, contents);
        }
        done();
    });
};
