'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('generateWhatsNew', 'Generate What is new file', function () {
        const md = require("markdown").markdown;
        const fs = require("fs");
        const path = require("path");
        const RSS = require('rss');
        //const uuid4 = require("uuid/v4");
        const { v4: uuid4 } = require('uuid');

        function  generateRandomID() {
            return uuid4();
        }

        let feedOptions = {
            title: 'Rainbow Node SDK Changelog feed',
            description: 'Rainbow Node SDK Changelog Feed Rss',
            feed_url: 'https://hub.openrainbow.com/CHANGELOG.xml',
            site_url: 'https://hub.openrainbow.com',
            image_url: 'https://theme.zdassets.com/theme_assets/722693/973985f113a0153af1f2339750d9637c92d870c6.svg',
            docs: 'https://hub.openrainbow.com/#/node',
            managingEditor: "support@openrainbow.com (Rainbow Support)",
            webMaster: "support@openrainbow.com (Rainbow Support)",
            copyright: '2019 ALE Rainbow',
            language: 'en',
            categories: ['ChangeLog', 'Rainbow', 'Node', 'SDK'],
            pubDate: new Date().toString(),
            ttl: '60'
        };

        let feed = new RSS(feedOptions);
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
            let changeLogTitle;
            if (!changeLogTitle) {
                changeLogTitle = "Rainbow Node SDK ChangeLog : " + minVersion;
                grunt.log.writeln(">> Set changeLogTitle file path to default one : ", changeLogTitle);
            } else {
                grunt.log.writeln(">> changeLogTitle file path externaly setted : ", changeLogTitle);
            }

            let item = {
                "title": changeLogTitle,
                "path": path.join(__dirname, "../" + file.src)
            };
            let data = fs.readFileSync(path.join(__dirname, "../" + file.src), "utf8");
            //grunt.log.writeln("data read ");
            let tree = md.parse(data.toString());

            let version = null;
            let filteredTree = tree.filter((markdownElt, index) => {
                if (index === 0) {
                    return true;
                }
                /*if (item[0] === "hr") {
                    return false;
                } // */

                if (markdownElt[0] === "header" && markdownElt[1].level === 2) {
                    return false;
                }

                if (markdownElt[0] === "header" && markdownElt[1].level === 3) {
                    // A version
                    version = markdownElt[2][2];
                    if (version.startsWith(minVersion)) {
                        return true;
                    } else {
                        version = null;
                    }
                }

                if (markdownElt[0] === "header" && markdownElt[1].level === 4) {
                    if (version) {
                        return true;
                    }
                }

                if (markdownElt[0] === "bulletlist") {
                    if (version) {
                        return true;
                    }
                }

                return false;
            });

            let html = "<h1>" + changeLogTitle + " - News</h1><hr />" + md.renderJsonML(md.toHTMLTree(filteredTree));

            grunt.log.writeln(">> html : ", html);
            //let feedXml = feed.xml(true);
            //console.log(">> rss : ", feedXml);

            //let html = md.renderJsonML(md.toHTMLTree(filteredTree));
            //console.log(">> html : ", html);
            grunt.file.write(file.dest, html);
        }
    });
};
