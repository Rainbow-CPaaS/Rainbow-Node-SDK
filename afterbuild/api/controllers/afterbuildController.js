'use strict';

const path = require("path");
var Log = require(path.join(__dirname, "..", "..", "src", "js", "logger.js"));
var logger = new Log();

var Inspector = require(path.join(__dirname, "..", "..","src", "js", "inspector.js"));
var Framer = require(path.join(__dirname, "..", "..","src", "js", "framer.js"));
var Renderer = require(path.join(__dirname, "..", "..","src", "js", "renderer.js"));
var Prerequisite = require(path.join(__dirname, "..", "..","src", "js", "prerequisite.js"));
var Queue = require(path.join(__dirname, "..", "..","src", "js", "queue.js"));
var rainbowNodeSdk = require('../../rainbowNodeSdk');

exports.list_all_tasks = function (req, res) {
    res.json({
        'firsttask': 'start queue reading'
    });
};

function startTests()
{
    logger.debug("startTests");
    let inspector = new Inspector(logger);
    let framer = new Framer(logger);
    let renderer = new Renderer(logger);
    let prerequisite = new Prerequisite(logger);
    let queue = new Queue(logger, inspector, framer, renderer, prerequisite);

    queue.initialize().then(
        function () {
            console.log("[TST-MAIN ] :: Queue initialized successfully!");
            queue.load("tests/testsPlan.json").then(function () {
                console.log("[TST-MAIN ] :: Queue loaded successfully!");
                queue.renderEpicsList();
                $(".input-epic").click(function (e) {
                    queue.selectEpic(e.currentTarget.id, e.currentTarget.checked);
                });
            }).catch(function () {

            });
        }
    )
    ;
}

exports.startTests = function (req, res) {
    startTests();
    res.json({
        'startTests': 'start queue reading'
    });
};


/*
exports.create_a_task = function (req, res) {
    var new_task = new Task(req.body);
    new_task.save(function (err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};


exports.read_a_task = function (req, res) {
    Task.findById(req.params.taskId, function (err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};


exports.update_a_task = function (req, res) {
    Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function (err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};


exports.delete_a_task = function (req, res) {


    Task.remove({
        _id: req.params.taskId
    }, function (err, task) {
        if (err)
            res.send(err);
        res.json({message: 'Task successfully deleted'});
    });
};


// */