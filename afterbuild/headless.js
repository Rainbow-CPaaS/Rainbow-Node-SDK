/*jshint esnext: true */

const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');

var fs = require("fs");
var https = require("https");
var http = require("http");
var express = require("express");
var logger = require("morgan");
var serveStatic = require("serve-static");

var argv = process.argv;
var dir = "build";
var protocol = "https";

var index = (argv[1] === "debug") ? 3 : 2;

console.log("---------------------------------------------------------");
console.log("-- OT-Lite client HTTPS server                         --");
if (argv[index] === "debug") {
  dir = ".";
  console.log("-- DEBUG                                               --");
}

if (argv[index] === "demo") {
  dir = "build_sdk/local";
  console.log("-- DEBUG                                               --");
}

if (argv[index+1] === "http") {
  protocol = "http";
  console.log("-- HTTP                                                --");
}

console.log("---------------------------------------------------------");

// Configure express
console.log("[HTTP_SERVICE] load config");
var app = express();
app.set("port", 8001);
app.use(logger("dev"));

var serveStaticParams = {
  index: ["index.html"]
};
if (argv[2] !== "debug") {
  serveStaticParams.maxAge = "1d";
}

app.use(serveStatic(dir, serveStaticParams));

// Load certificates
console.log("[HTTP_SERVICE] load certificates");
var key = fs.readFileSync("./certificates/key.pem");
var cert = fs.readFileSync("./certificates/cert.pem");
var https_options = {
  key: key,
  cert: cert
};

// Start the https server
let server;
if (protocol === "http") {
  server = http
    .createServer(app)
    .listen(app.get("port"), function () {
      console.log("[HTTP_SERVICE] started : listening on port " + app.get("port") + " protocol http");
    });
} else {
  server = https
    .createServer(https_options, app)
    .listen(app.get("port"), function () {
      console.log("[HTTP_SERVICE] started : listening on port " + app.get("port") + " protocol https");
    });
}

/**
 * Launches a debugging instance of Chrome.
 * @param {boolean=} headless True (default) launches Chrome in headless mode.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
function launchChrome(headless = false) {
  return chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
    chromeFlags: [
      '--window-size=1280,1024',
      '--disable-gpu', 
      '--no-sandbox', 
      headless ? '--headless' : ''
    ]
  });
}

let remotechrome = null;
launchChrome(true).then(chrome => {
  CDP({port: chrome.port}).then((_chrome) => {
    remotechrome = _chrome;

    remotechrome
      .Console
      .messageAdded((params) => {
        console.log('messageAdded:', params.message.text);
      });
    return remotechrome
      .Console
      .enable();
  }).then(() => {
    return remotechrome
      .Page
      .enable();
  }).then(() => {
    remotechrome
      .Page
      .navigate({url: `${protocol}://localhost:${app.get("port")}/afterbuild`});
    remotechrome
      .Page
      .loadEventFired(() => {

        console.log("Rainbow AfterBuild loaded");

        remotechrome.on('test', () => {
          console.log("Rainbow AfterBuild started");
        })

        const js = "document.querySelector('title').textContent";
        // Evaluate the JS expression in the page.
        remotechrome
          .Runtime
          .evaluate({expression: js})
          .then(result => {
            console.log('Title of page: ' + result.result.value);
            return new Promise(function(resolve) {
              setTimeout(resolve, 200);
            });
          })
          .then(result => {
          return remotechrome
              .Runtime
              .evaluate({expression: "selectTest('Core')", awaitPromise: true});
/*              .evaluate({expression: "selectTest( [ \
                'Admin', 'Bubbles', 'Capabilities', 'Core', \
                'Connection', 'Contacts', 'Conversations', \
                'File Storage', 'Groups', 'User Profile', 'IM', \
                'Presence'])", awaitPromise: true});*/
          })
          .then(result => {
              return remotechrome
              .Runtime
              .evaluate({expression: "startTest()", awaitPromise: true});
          })
          .then(result => {
            console.log("Tests passed with success");

            const jsjUnit = "junit_textarea_read();";
            // Evaluate the JS expression in the page.
            remotechrome
              .Runtime
              .evaluate({expression: jsjUnit})
              .then(result => {
                console.log('Got jUnit XML: ' + result.result.value);
                if (!fs.existsSync('afterbuild/artifacts')) {
                  fs.mkdirSync('afterbuild/artifacts');
                }
                if (!fs.existsSync('afterbuild/artifacts/integration')) {
                  fs.mkdirSync('afterbuild/artifacts/integration');
                }
                if (!fs.existsSync('afterbuild/artifacts/integration/junit')) {
                  fs.mkdirSync('afterbuild/artifacts/integration/junit');
                }
                fs.writeFileSync('afterbuild/artifacts/integration/junit/integration.xml', result.result.value);
                return new Promise(function(resolve) {
                  setTimeout(resolve, 200);
                  remotechrome.close();
                  chrome.kill();
                  server.close();
                });
              });
          })
          .catch((err) => {
            console.log("Tests startup or execution failure: "+ err);
            remotechrome.close();
            chrome.kill();
            server.close();
          })
      })
  }).catch((err) => {
    console.log("Tests startup failure: "+ err);
    remotechrome.close();
    chrome.kill();
    server.close();
  })
});