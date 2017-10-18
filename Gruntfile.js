module.exports = function (grunt) {
  grunt.initConfig({

    jsdoc2md: {
      separateOutputFiles: {
        files: [
            { src: "lib/common/Events.js", dest: "build/events.md" },
            { src: "lib/services/Admin.js", dest: "build/admin.md" },
            { src: "lib/services/Bubbles.js", dest: "build/bubbles.md" },
            { src: "lib/services/Contacts.js", dest: "build/contacts.md" },
            { src: "lib/services/IM.js", dest: "build/im.md" },
            { src: "lib/services/Presence.js", dest: "build/presence.md" },
            { src: "index.js", dest: "build/sdk.md" },
            { src: "lib/common/models/Bubble.js", dest: "build/bubble.md" },
            { src: "lib/common/models/Contact.js", dest: "build/contact.md" },
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
    }
});

  grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask("default", ["clean:dist", "jsdoc2md"]);
  grunt.registerTask("lint", ["eslint:all"]);
};