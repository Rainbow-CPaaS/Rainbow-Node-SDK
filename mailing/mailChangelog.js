#!/usr/bin/env node

/* jshint undef: true, unused: true, esversion: 6,  */
/* eslint require-jsdoc: 0 */

/*
 * Generate & send changelog
 * Copyright (c) 2018 Alcatel-Lucent Entreprise
 */

const md = require("markdown").markdown;
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const program = require("commander");
const YAML = require("yamljs");
const process = require("process");
const Mailjet = require("node-mailjet");

global.window = {};

// Extract version
let content = fs.readFileSync(path.join(__dirname, "../package.json"));
let packageJSON = JSON.parse(content);
let minVersion =
    packageJSON.version.indexOf("-beta") > -1
        ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-beta") - 2)
        : packageJSON.version.substr(0, packageJSON.version.lastIndexOf("."));
let fullVersion = packageJSON.version;
let currentVersion =
    packageJSON.version.indexOf("-beta") > -1
        ? packageJSON.version.substr(0, packageJSON.version.lastIndexOf("-beta"))
        : packageJSON.version;

function loadSingleReleaseNotes(item, config) {
    return new Promise((resolve, reject) => {
        let product = {};

        product.title = item.title;

        fs.readFile(item.path, "utf8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            let tree = md.parse(data.toString());

            let version = null;
            let filteredTree = tree.filter((markdownElt, index) => {
                if (index === 0) {
                    return true;
                }
                if (item[0] === "hr") {
                    return false;
                }

                if (markdownElt[0] === "header" && markdownElt[1].level === 2) {
                    // A version
                    version = markdownElt[2][2];
                    if (version.startsWith(minVersion)) {
                        return true;
                    } else {
                        version = null;
                    }
                }

                if (markdownElt[0] === "bulletlist") {
                    if (version) {
                        return true;
                    }
                }

                return false;
            });

            let html = md.renderJsonML(md.toHTMLTree(filteredTree));

            product.notes = html;
            resolve(product);
        });
    });
}

function extractReleaseNotes(releaseNotes, config) {
    return new Promise((resolve, reject) => {
        let productPromises = [];
        releaseNotes.deliveries.forEach(item => {
            productPromises.push(loadSingleReleaseNotes(item, config));
        });
        Promise.all(productPromises)
            .then(values => {
                resolve(values);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function generateNunjucksVariables(config) {
    let releaseNoteDefinition = YAML.load(path.join(__dirname, "./changelog.yaml"));

    return new Promise((resolve, reject) => {
        extractReleaseNotes(releaseNoteDefinition, config)
            .then(products => {
                let vars = {
                    devmode: false,
                    date: config.date,
                    component: releaseNoteDefinition.component,
                    from: {
                        email: releaseNoteDefinition.fromEmail,
                        name: releaseNoteDefinition.fromName
                    },
                    to: {
                        email: releaseNoteDefinition.toEmail,
                        name: releaseNoteDefinition.toName
                    },
                    cc: {
                        email: releaseNoteDefinition.ccEmail,
                        name: releaseNoteDefinition.ccName
                    },
                    environment: releaseNoteDefinition[config.environment],
                    subject: releaseNoteDefinition.subject,
                    products: products
                };

                if (config.test) {
                    vars.devmode = true;
                    vars.dev = {
                        email: config.test,
                        name: "Developer"
                    };
                }
                resolve(vars);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function sendMail(vars, mailjet) {
    let to = [];
    let devSubject = "";
    if (vars.devmode) {
        to.push({
            Email: vars.dev.email,
            Name: vars.dev.name
        });
        devSubject = "[DEV] ";
    } else {
        to.push({
            Email: vars.to.email,
            Name: vars.to.name
        });
        to.push({
            Email: vars.cc.email,
            Name: vars.cc.name
        });
    }

    let message =
        "Note: An early version <b>" +
        fullVersion +
        "</b> has been published to NPM (https://www.npmjs.com/package/rainbow-cli?activeTab=versions) and has not replaced the <i>latest</i> tag.";
    if (vars.environment !== "PRE-PRODUCTION" || !fullVersion.includes("beta")) {
        message =
            "Note: A new version <b>" +
            fullVersion +
            "</b> has been published to NPM (https://www.npmjs.com/package/rainbow-cli?activeTab=versions) and is now the <i>latest</i> tag.";
    }

    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
            {
                From: {
                    Email: vars.from.email,
                    Name: vars.from.name
                },
                To: to,
                Subject: devSubject + vars.subject + currentVersion + " delivered to " + vars.environment,
                TextPart: "Hi all, component " + vars.component + " has been delivered to " + vars.environment,
                HTMLPart: [
                    "<p>Hi all,</p>",
                    "<p>Component <b>" +
                        vars.component +
                        "</b> as been delivered to <b>" +
                        vars.environment +
                        "</b></p>",
                    "<p>Here is the complete changelog for version <b>" + minVersion + "</b>",
                    vars.products.map(product => {
                        return "<h2><u>" + product.title + "</u></h2>" + product.notes + "<br>";
                    }),
                    "<p>" + message + "</p>",
                    "<p>---<br>",
                    "The Rainbow team</p>"
                ].join("")
            }
        ]
    });

    request
        .then(result => {
            console.log(result.body);
        })
        .catch(err => {
            console.log(err.statusCode);
        });
}

program
    .command("notify")
    .description("Generate and send changelog for a preproduction release")
    .option(
        "-e, --environment [environment]",
        "Environment published: 'production' or 'preproduction' (default)",
        "preproduction"
    )
    .option("-t, --test [email]", "Test the email by sending him to a test email")
    .action((env, options) => {
        let apiKey = process.env.MJ_APIKEY_PUBLIC;
        let apiSecret = process.env.MJ_APIKEY_PRIVATE;

        let mailjet = Mailjet.connect(apiKey, apiSecret);

        generateNunjucksVariables(env).then(vars => {
            sendMail(vars, mailjet);
        });
    });

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}
