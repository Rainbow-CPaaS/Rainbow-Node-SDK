module.exports = function (grunt) {
  grunt.initConfig({
    jsdoc2md: {
      separateOutputFiles: {
        files: [
            { src: "./lib/common/Error.js", dest: "build/common/error.md" },
            { src: "./lib/common/Events.js", dest: "build/common/events.md" },
            { src: "./lib/common/Logger.js", dest: "build/common/logger.md" },
            { src: "./lib/common/XMPPUtils.js", dest: "build/common/xmpputils.md" },
            { src: "./lib/config/config.js", dest: "build/config/config.md" },
            { src: "./lib/config/Options.js", dest: "build/config/options.md" },
            { src: "./lib/connection/HttpService.js", dest: "build/connection/httpservice.md" },
            { src: "./lib/connection/RESTService.js", dest: "build/connection/restservice.md" },
            { src: "./lib/connection/XMPPService.js", dest: "build/connection/xmppservice.md" },
            { src: "./lib/services/Bubbles.js", dest: "build/services/error.md" },
            { src: "./lib/services/Contacts.js", dest: "build/services/contacts.md" },
            { src: "./lib/services/IM.js", dest: "build/services/im.md" },
            { src: "./lib/services/Presence.js", dest: "build/services/presence.md" },
            { src: "./lib/Core.js", dest: "build/core.md" },
            { src: "./lib/Proxy.js", dest: "build/proxy.md" }
        ]
      }
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
  });

  grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask("default", "jsdoc2md");
  grunt.registerTask("lint", ["eslint:all"]);
};