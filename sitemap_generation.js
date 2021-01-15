"use strict";

const yaml = require("js-yaml");
const fs = require("fs");
const { createReadStream, createWriteStream } = require('fs');
//const sm = require("sitemap");
const { SitemapStream, streamToPromise } = require('sitemap');

//const hostname = "https://hub.openrainbow.com";
//const hostname = "https://@hub_fqdn@";
//const hostname = "https://hub_fqdn";
const hostnameTag = "host_name_tag_to_be_replaced";
const reghostnameTag = /host_name_tag_to_be_replaced/g;
const hostnameHashValue = "#";
const reghostnameHashTag = /\/#/g;
const hostnameValue = "@hub_fqdn@";
const hostname = "https://" + hostnameTag;
const pathPrefix = "#/documentation/";

let appendUrl = function (obj, stack, cb) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] === "object") {
                appendUrl(obj[property], stack + "." + property, cb);
            } else {
                cb(obj[property]);
            }
        }
    }
};

function streamToString (smStream) {
    let chunks = "";
    return new Promise((resolve, reject) => {
        smStream.on('data', chunk => {
            //console.log("data : ", chunk);
            if (chunk.indexOf("<url") !== -1) {
                chunks += "\n" ;
            }
            chunks += chunk;
        })
        smStream.on('error', reject)
        smStream.on('end', () => {
            //console.log("chunks : ", chunks);
            resolve(chunks);
        })
        smStream.end();
        //streamToPromise(smStream).then(smStream.end)
    })
}

(async () => {
    try {
        let args = process.argv.slice(2);

        //const index = yaml.safeLoad(fs.readFileSync("index.yml", "utf8"));
        const index = yaml.load(fs.readFileSync("index.yml", "utf8"));

        //console.log("index : ", JSON.stringify(index));
        /*
            let sitemap = sm.createSitemap({
                hostname: (args.length && args[0])
                    ? args[0]
                    : hostname,
                level :  'silent'
            });

            appendUrl(index, "", (value) => {
                sitemap.add({
                    url: value.replace(/(ref:)?(.*).md/g, pathPrefix + "$2")
                },  'silent');
            });

            sitemap.toXML(function (err, xml) {
                if (!err) {
                    fs.writeFileSync("sitemap.xml", xml);
                }
            });
         */

        let smhostname = (args.length && args[0]) ? args[0] : hostname;
        //console.log("smhostname : ", smhostname);
        const smStream = new SitemapStream({
            hostname: smhostname,
            //xslUrl: "https://example.com/style.xsl",
            lastmodDateOnly: false, // print date not time
            xmlns: { // trim the xml namespace
                news: true, // flip to false to omit the xml namespace for news
                xhtml: true,
                image: true,
                video: true,
            }, // */
            level: 'silent'
        })

        appendUrl(index, "", (value) => {

            // coalesce stream to value
// alternatively you can pipe to another stream
            //streamToPromise(smStream).then(console.log)

            let smurl = value.replace(/(ref:)?(.*).md/g, pathPrefix + "$2");
            //console.log("smurl : ", smurl);
            /* smStream.write({
                url: smurl,
                //changefreq: 'weekly',
                //priority: 0.8, // A hint to the crawler that it should prioritize this over items less than 0.8
                cdata: true,
                level: 'silent'
            }, null) // */
            smStream.write( smurl, null);
            //console.log("step 1.");
        });

// indicate there is nothing left to write
        //streamToPromise(smStream).then(smStream.end);
        //smStream.end()

        //console.log("step 2.");
        let result = await streamToString(smStream);
        //console.log("step 3.");
        let sitemapStringReformated = result.replace(reghostnameTag, hostnameValue);
        sitemapStringReformated = sitemapStringReformated.replace(reghostnameHashTag, hostnameHashValue);
       // console.log("sitemapStringReformated : ", sitemapStringReformated);
        fs.writeFileSync("sitemap.xml", sitemapStringReformated);
        //smStream.pipe(createWriteStream("sitemap.xml"));

    }
    catch (e) {
        console.log("CATCH Error !!! error : ", e);
    }
}) ();
