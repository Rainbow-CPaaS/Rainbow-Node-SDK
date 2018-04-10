module.exports = function (grunt) {
  grunt.initConfig({

    /* ------------------------------ VARIABLES -------------------------------- */
    version: grunt.file.read("./config/version.js").split("\"")[1],
    nodeSdkOrder: grunt.file.read("./jsdoc/cheatsheet/node/nodeSdkOrder") + "\n</div><!--MERMAID-->",
    pkg: grunt.file.readJSON("package.json"),

    jsdoc2md: {
      separateOutputFiles: {
        files: [
            { src: "lib/common/Events.js", dest: "build/events.md" },
            { src: "lib/services/Admin.js", dest: "build/admin.md" },
            { src: "lib/services/Bubbles.js", dest: "build/bubbles.md" },
            { src: "lib/services/Channels.js", dest: "build/channels.md" },
            { src: "lib/services/Contacts.js", dest: "build/contacts.md" },
            { src: "lib/services/Conversations.js", dest: "build/conversations.md" },
            { src: "lib/services/IM.js", dest: "build/im.md" },
            { src: "lib/services/Presence.js", dest: "build/presence.md" },
            { src: "lib/services/Groups.js", dest: "build/groups.md" },
            { src: "index.js", dest: "build/sdk.md" },
            { src: "lib/common/models/Bubble.js", dest: "build/bubble.md" },
            { src: "lib/common/models/Channel.js", dest: "build/channel.md" },
            { src: "lib/common/models/Contact.js", dest: "build/contact.md" },
            { src: "lib/common/models/Conversation.js", dest: "build/conversation.md" },
            { src: "lib/common/models/Message.js", dest: "build/message.md" },
            { src: "lib/common/models/Settings.js", dest: "build/settings.md" },
        ]
      }
    },

    clean: {
        dist: ["build"],
    },

    eslint: {
        all: ["lib/**/*.js", "index.js", "tests/**/*.js"],
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

    watch: {
        lint: {
            files: ["lib/**/*.js", "index.js", "tests/**/*.js"],
            tasks: ["eslint:all"]
        }
    },

    jsdoc: {
        nodesheets: {
            src: [
                "lib/services/Admin.js",
                "lib/services/Bubbles.js",
                "lib/services/Channels.js",
                "lib/services/Contacts.js",
                "lib/services/Conversations.js",
                "lib/services/Groups.js",
                "lib/services/IM.js",
                "lib/services/Presence.js",
                "index.js", 
                "lib/common/Events.js", 
                "lib/common/models/Bubble.js",
                "lib/common/models/Channel.js",
                "lib/common/models/Conversation.js",
                "lib/common/models/Contact.js",
                "lib/common/models/Message.js"
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
                {expand: true, cwd: "./node_modules/mermaid/dist", src: ["mermaid.js"], dest: "bin/jsdoc/sheets/cheatsheet", filter: "isFile"}               
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
        }
    }
});

  grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-copy-part-of-file");
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks("grunt-exec");
  grunt.registerTask("default", ["clean:dist", "jsdoc2md", "nodesheets"]);
  grunt.registerTask("nodesheets", ["jsdoc:nodesheets", "copy-part-of-file:nodesheets", "copy:generatednodecheatsheet", "replace:nodesheets", "exec:renderNodeSheets"]);
  grunt.registerTask("lint", ["eslint:all"]);
};