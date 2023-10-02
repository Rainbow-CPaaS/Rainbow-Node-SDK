'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('generateRss', 'Generate What is new rss file', function () {
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
            let data = fs.readFileSync(path.join(__dirname, "../" + file.src), "utf8");
            //grunt.log.writeln("data read ");
            let tree = md.parse(data.toString());
            let version = null;

            /* loop over data and add to feed */
            let itemModel = {
                title: 'Rainbow Node SDK Version ',
                description: '',
                url: 'https://github.com/Rainbow-CPaaS/Rainbow-Node-SDK/', // link to the item
                guid: '1123', // optional - defaults to url
                categories: ['ChangeLog', 'Rainbow', 'Node', 'SDK'], // optional - array of item categories
                author: 'Rainbow', // optional - defaults to feed author property
                date: 'May 27, 2019', // any format that js Date can parse.
                //lat: 33.417974, //optional latitude field for GeoRSS
                //long: -111.933231, //optional longitude field for GeoRSS
                //enclosure: {url:'...', file:'path-to-file'}, // optional enclosure
                custom_elements: [
                ]
            };
            let item = undefined;
            let treeIter = 0;
            for (treeIter = 1; treeIter <  tree.length ; treeIter++ ) {
                 let markdownElt = tree[treeIter];

                 // Version line : get version + date of delivery
                if (markdownElt[0] === "header" && markdownElt[1].level === 3) {
                    // A version
                    version = markdownElt[2][2];
                    //console.log("version markdownElt : ", markdownElt);
                    // return true;
                    //if (version.startsWith(minVersion)) {
                        //console.log("header markdownElt : ", markdownElt);
                        if (item ) {
                            //console.log("header save itrem : ", item);
                            feed.item(item);
                        }
                        item = Object.assign({}, itemModel);
                        item.title = "Rainbow Node Sdk ChangeLog for release " + version;
                        let date =  new Date(markdownElt[3]);
                        //console.log("header date : ", date,  ", markdownElt[3] : ", markdownElt[3]);
                        item.date = date.toString();
                        item.guid = version;//generateRandomID();
                        item.url += "tree/v" + item.guid + "/";
                        //return true;
                    /*} else {
                        version = null;
                    }
                    // */
                }

                // Feature item of list of the version : build the line of feature
                if (markdownElt[0] === "header" && markdownElt[1].level === 4) {
                        //const iteratormdElmt = markdownElt.values();
                        //console.log("bulletlist iteratormdElmt.length : ", iteratormdElmt.length);
                    markdownElt.forEach(mdElt => {
                        //grunt.log.writeln(">> mdElet : ", mdElt);
                    //for (const mdElt of iteratormdElmt) {
                            // eslint-disable-next-line max-depth
                            if (mdElt[0] === "listitem") {
                                //console.log("listitem found : ", mdElt.values());
                                //const iteratormdElmtData = mdElt.values();
                                item.description +=  "- ";
                                // eslint-disable-next-line max-depth
                                mdElt.forEach(mdDataElt => {
//                                    for (const mdDataElt of iteratormdElmtData) {
                                    // eslint-disable-next-line max-depth
                                    if (mdDataElt !== "listitem") {
                                        //console.log("iter data mdDataElt : ", mdDataElt);
                                        item.description +=   mdDataElt;
                                    }

                                });
                                item.description += "<br>\n";
                            }
                        });// */
                }

                // Feature item of list of the version : build the line of feature
                if (markdownElt[0] === "bulletlist") {
                        //const iteratormdElmt = markdownElt.values();
                        //console.log("bulletlist iteratormdElmt.length : ", iteratormdElmt.length);
                    markdownElt.forEach(mdElt => {
                        //grunt.log.writeln(">> mdElet : ", mdElt);
                    //for (const mdElt of iteratormdElmt) {
                            // eslint-disable-next-line max-depth
                            if (mdElt[0] === "listitem") {
                                //console.log("listitem found : ", mdElt.values());
                                //const iteratormdElmtData = mdElt.values();
                                item.description +=  "- ";
                                // eslint-disable-next-line max-depth
                                mdElt.forEach(mdDataElt => {
//                                    for (const mdDataElt of iteratormdElmtData) {
                                    // eslint-disable-next-line max-depth
                                    if (mdDataElt !== "listitem") {
                                        //console.log("iter data mdDataElt : ", mdDataElt);
                                        item.description +=   mdDataElt;
                                    }

                                });
                                item.description += "<br>\n";
                            }
                        });// */
                }

            }
            if (item ) {
                feed.item(item);
            }
            let feedXml = feed.xml(true);
            //console.log(">> rss : ", feedXml);

            //let html = md.renderJsonML(md.toHTMLTree(filteredTree));
            //console.log(">> html : ", html);
            grunt.file.write(file.dest, feedXml);
        }
    });
};
