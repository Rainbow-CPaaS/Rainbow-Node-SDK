module.exports = function(grunt) {
  grunt.initConfig({

      //touch: ['tasks/generateFoss.js'],
      
    /* ------------------------------ VARIABLES -------------------------------- */
    version: grunt.file.read("./config/version.js").split("\"")[1],
    nodeSdkOrder: grunt.file.read("./jsdoc/cheatsheet/node/nodeSdkOrder") + "\n</div><!--MERMAID-->",
    pkg: grunt.file.readJSON("package.json"),

    jsdoc2md: {
      separateOutputFiles: {
        files: [
            { src: "lib/common/Events.js", dest: "build/events.md" },
            { src: "lib/services/AdminService.js", dest: "build/admin.md" },
            { src: "lib/services/AlertsService.js", dest: "build/alerts.md" },
            { src: "lib/services/BubblesService.js", dest: "build/bubbles.md" },
            { src: "lib/services/CallLogService.js", dest: "build/calllog.md" },
            { src: "lib/services/ChannelsService.js", dest: "build/channels.md" },
            { src: "lib/services/ContactsService.js", dest: "build/contacts.md" },
            { src: "lib/services/ConversationsService.js", dest: "build/conversations.md" },
            { src: "lib/services/FavoritesService.js", dest: "build/favorites.md" },
            { src: "lib/services/FileStorageService.js", dest: "build/filestorage.md" },
            { src: "lib/services/GroupsService.js", dest: "build/groups.md" },
            { src: "lib/services/ImsService.js", dest: "build/im.md" },
            { src: "lib/services/InvitationsService.js", dest: "build/invitations.md" },
            { src: "lib/services/PresenceService.js", dest: "build/presence.md" },
            { src: "lib/services/ProfilesService.js", dest: "build/profiles.md" },
            { src: "lib/services/RBVoiceService.js", dest: "build/rbvoice.md" },
            { src: "lib/services/S2SService.js", dest: "build/s2s.md" },
            { src: "lib/services/TelephonyService.js", dest: "build/telephony.md" },
            { src: "lib/services/WebinarsService.js", dest: "build/webinars.md" },
            { src: "lib/NodeSDK.js", dest: "build/sdk.md" },
            { src: "lib/common/models/Alert.js", dest: "build/alert.md" },
            { src: "lib/common/models/AlertDevice.js", dest: "build/alertdevice.md" },
            { src: "lib/common/models/AlertFilter.js", dest: "build/alertfilter.md" },
            { src: "lib/common/models/AlertMessage.js", dest: "build/alertmessage.md" },
            { src: "lib/common/models/AlertTemplate.js", dest: "build/alerttemplate.md" },
            { src: "lib/common/models/Bubble.js", dest: "build/bubble.md" },
            { src: "lib/common/models/Channel.js", dest: "build/channel.md" },
            { src: "lib/common/models/Call.js", dest: "build/call.md" },
            { src: "lib/common/models/CallLog.js", dest: "build/calllogType.md" },
            { src: "lib/common/models/Contact.js", dest: "build/contact.md" },
            { src: "lib/common/models/Conversation.js", dest: "build/conversation.md" },
            { src: "lib/common/ErrorManager.js", dest: "build/errormanager.md" },
            { src: "lib/common/models/Favorite.js", dest: "build/favorite.md" },
            { src: "lib/common/models/FileDescriptor.js", dest: "build/filedescriptor.md" },
            { src: "lib/common/models/FileViewer.js", dest: "build/fileviewer.md" },
            { src: "lib/common/models/GeoLoc.js", dest: "build/geoloc.md" },
            { src: "lib/common/models/Invitation.js", dest: "build/invitation.md" },
            { src: "lib/common/models/Message.js", dest: "build/message.md" },
            { src: "lib/common/models/PresenceRainbow.js", dest: "build/presencerainbow.md" },
            { src: "lib/common/models/Settings.js", dest: "build/settings.md" }
        ]
      }
    },

    clean: {
        dist: ["build"],
    },

    eslint: {
        all: ["lib/**/*.js", "index.js", "tests/**/*.js", "tasks/*.js"],
        watched: ["Gruntfile.js"],
        options: {
            configFile: ".eslintrc",
            fix: true
        },

        checkstylereporter: {
            src: ["lib/**/*.js", "index.js", "tests/**/*.js"],
            configFile: ".eslintrc",
            options: {
                outputFile: "reportQUnit/eslint.xml",
                format: "checkstyle"
            }
        },
    },

      // Configuration to be run (and then tested).
    removedebugcode: {
        all: {
            options: {
                singleline: false,
                multiline: false,
                debugcode: true,
                replaceCodeTab: [[/\/\/ dev-code \/\//g, "/*"], [/\/\/ end-dev-code \/\//g, "// */"], [/\/\/ dev-code-internal \/\//g, "/*"], [/\/\/ end-dev-code-internal \/\//g, "// */"], [/\/\/ dev-code-console \/\//g, "/*"], [/\/\/ end-dev-code-console \/\//g, "// */"]]
            },
            src: ['lib/**/*.js']
        },
        debug: {
            options: {
                singleline: false,
                multiline: false,
                debugcode: true,
                replaceCodeTab: [[/\/\/ dev-code \/\//g, "/*"], [/\/\/ end-dev-code \/\//g, "// */"], [/\/\/ dev-code-console \/\//g, "/*"], [/\/\/ end-dev-code-console \/\//g, "// */"]]
            },
            src: ['lib/**/*.js']
        }
    },

    generateRss:{
        all: {
            options: {
                debugcode: true
            },
            files: [
                {
                    src: "CHANGELOG.md", dest:"build/ChangeLogRSS.xml"
                }
                /* ,
                {
                src: "tutorials/What_is_new.md", dest: "build/What_is_new.rss"
                } */
                ]
        }
    },

      generateFoss: {
          all: {
              options: {
                  debugcode: true
              },
              files: [
                  {
                      dest:"build/fossText.md"
                  }
              ]
          }
      },
      
      watch: {
        lint: {
            files: ["lib/**/*.js", "index.js", "tests/**/*.js"],
            tasks: ["eslint:all"]
        }
    },

    jsdoc: {
        nodesheets: {
            src: [
                "lib/services/AdminService.js",
                "lib/services/AlertsService.js",
                "lib/services/BubblesService.js",
                "lib/services/CallLogService.js",
                "lib/services/ChannelsService.js",
                "lib/services/ContactsService.js",
                "lib/services/ConversationsService.js",
                "lib/services/FavoritesService.js",
                "lib/services/FileStorageService.js",
                "lib/services/GroupsService.js",
                "lib/services/ImsService.js",
                "lib/services/InvitationsService.js",
                "lib/services/PresenceService.js",
                "lib/services/S2SService.js",
                "lib/services/TelephonyService.js",
                "lib/NodeSDK.js",
                "lib/common/Events.js",
                "lib/common/models/Bubble.js",
                "lib/common/models/Call.js",
                "lib/common/models/Channel.js",
                "lib/common/models/Contact.js",
                "lib/common/models/Conversation.js",
                "lib/common/models/Invitation.js",
                "lib/common/models/Message.js",
                "lib/common/models/Settings.js",
            ],
            dest: "bin/jsdoc",
            options: {
                template: "node_modules/rainbow_hub_sheets_generation/mermaidtemplate"
            }
        }
    },

    "copy-part-of-file": {
        nodesheets: {
            options: {
                sourceFileStartPattern: "<!--START-->",
                sourceFileEndPattern: "<!--END-->",
                destinationFileStartPattern: "<div class=\"mermaid\">",
                destinationFileEndPattern: "@@</div><!--MERMAID-->"
            },
            files: {
                "./jsdoc/cheatsheet/node/nodesheets.html": ["./bin/jsdoc/sheets/diagram"]
            }
        }
    },

    copy: {
        generatednodecheatsheet: {
            files: [
                {expand: true, cwd: "./jsdoc", src: ["cheatsheet/node/**/*.html"], dest: "bin/jsdoc/sheets", filter: "isFile"},
                {expand: true, cwd: "./jsdoc", src: ["cheatsheet/node/**/*.css"], dest: "bin/jsdoc/sheets", filter: "isFile"},
                {expand: true, cwd: "./jsdoc", src: ["cheatsheet/assets/**/*.*"], dest: "bin/jsdoc/sheets", filter: "isFile"},
                {expand: true, cwd: "./node_modules/mermaid/dist", src: ["mermaid.js"], dest: "bin/jsdoc/sheets/cheatsheet", filter: "isFile"},
                {expand: true, cwd: "./node_modules/rainbow_hub_sheets_generation/node_modules/mermaid/dist", src: ["mermaid.js"], dest: "bin/jsdoc/sheets/cheatsheet", filter: "isFile"}
            ]
        }
    },

    replace: {
        nodesheets: {
            options: {
                patterns: [
                    {
                        json: {
                            "<!--VERSION HERE-->": "<h3>Cheat Sheet Beta - NodeSdk - v<%= pkg.version %></h3>",
                            "</div><!--MERMAID-->": "<%= nodeSdkOrder %>"
                        }
                    }
                ]
            },
            files: [
                {
                    expand: true,
                    flatten: true,
                    src: [
                        "jsdoc/cheatsheet/node/nodesheets.html",
                    ],
                    dest: "bin/jsdoc/sheets/cheatsheet/node/"
                }]
        }
    },

    exec: {
        renderNodeSheets: {
            cmd: "node puppeteer.js node"
        },
        sitemapGeneration: {
            cmd: "node sitemap_generation.js"
        }
    },
    "ts": {
        /*"default": {
            options: {
                verbose: true
            }
        }, */
        "options": {
            // disable the grunt-ts fast feature
            "fast": 'never',
            "verbose": true
        },
        "build": {
            "src": ["src/**/*.ts", "!node_modules/**"],
            "tsconfig": true
        }
      },
    dtsGenerator: {
        "options": {
            //"name": "rainbow-node-sdk",
            //"main": "rainbow-node-sdk",
            "project": "./",
            //"include": [ "./src/**/*.ts" ],
            "baseDir": "./",
            //"files": ["./src/**/*.ts", "**/*"],
            "out": "./typings/rainbow-node-sdk.d.ts",
            "verbose": true
        },
        "default": {
            "src": [ "./src/**/*.ts" ]
        }
    }
      
});

  grunt.loadTasks("tasks");
  grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-copy-part-of-file");
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("dts-generator");
  // grunt.loadNpmTasks('grunt-touch');

    grunt.registerTask('generateFossRun', 'My "generateFossRun" task.', function() {
        // Enqueue "bar" and "baz" tasks, to run after "foo" finishes, in-order.
        grunt.task.run(["generateFoss"]);
    
    });

  grunt.registerTask("preparecode", ["clean:dist", "dtsGenerator", "ts:build", "removedebugcode"]);
  grunt.registerTask("default", ["preparecode"]); // Step 1 : grunt : to compil the sources
  //grunt.registerTask("default", ["touch", "preparecode", "jsdoc2md", "generateRss", "nodesheets", "exec:sitemapGeneration"]);
    grunt.registerTask("delivery", ["generateFossRun", "jsdoc2md", "generateRss", "nodesheets", "exec:sitemapGeneration"]); // Step 2 : grunt delivery : To pepare the sources + doc for package

  grunt.registerTask("prepareDEBUGcode", ["clean:dist", "dtsGenerator", "ts:build", "removedebugcode:debug"]);
  //grunt.registerTask("debugDelivery", ["touch", "prepareDEBUGcode", "jsdoc2md", "generateRss", "nodesheets", "exec:sitemapGeneration"]);
  grunt.registerTask("debugDeliveryDelivery", [ "generateFossRun", "jsdoc2md", "generateRss", "nodesheets", "exec:sitemapGeneration"]);
  grunt.registerTask("debugDeliveryBuild", [ "prepareDEBUGcode"]);

  //    grunt.registerTask("default", ["clean:dist", "dtsGenerator", "ts:build", "removedebugcode", "jsdoc2md", "nodesheets", "exec:sitemapGeneration"]);
    
  grunt.registerTask("nodesheets", ["jsdoc:nodesheets", "copy-part-of-file:nodesheets", "copy:generatednodecheatsheet", "replace:nodesheets", "exec:renderNodeSheets"]);
  grunt.registerTask("lint", ["eslint:all"]);
};
