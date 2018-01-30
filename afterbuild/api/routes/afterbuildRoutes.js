'use strict';
module.exports = function (app) {
    var afterbuildList = require('../controllers/afterbuildController');

    // todoList Routes
    app.route('/tasks')
        .get(afterbuildList.list_all_tasks);
        //.post(todoList.create_a_task);

    app.route('/startTests')
        .get(afterbuildList.startTests);

    /*
    app.route('/tasks/:taskId')
        .get(todoList.read_a_task)
        .put(todoList.update_a_task)
        .delete(todoList.delete_a_task);
        // */
};
