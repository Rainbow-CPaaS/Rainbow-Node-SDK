'use strict';

const path = require("path");
var Log = require(path.join(__dirname, "..", "..", "src", "js", "logger.js"));
var logger = Log();

var Inspector = require(path.join(__dirname, "..", "..","src", "js", "inspector.js"));
var Framer = require(path.join(__dirname, "..", "..","src", "js", "framer.js"));
var Renderer = require(path.join(__dirname, "..", "..","src", "js", "renderer.js"));
var Prerequisite = require(path.join(__dirname, "..", "..","src", "js", "prerequisite.js"));
var Queue = require(path.join(__dirname, "..", "..","src", "js", "queue.js"));
var rainbowNodeSdk = require('../../rainbowNodeSdk');

var inspector = new Inspector(logger);
var framer = new Framer(logger);
var renderer = new Renderer(logger);
var prerequisite = new Prerequisite(logger);
var queue = new Queue(logger, inspector, framer, renderer, prerequisite);

exports.list_all_tasks = function (req, res) {
    res.json({
        'firsttask': 'start queue reading'
    });
};

function initQueue()
{
    logger.debug("[AFTERBUILDCONTROLER ] :: initQueue !");

    queue.initialize().then(
        function () {
            logger.debug("[AFTERBUILDCONTROLER ] :: Queue initialized successfully!");
            queue.load("../../tests/testsPlan.json").then(function () {
                logger.debug("[AFTERBUILDCONTROLER ] :: Queue loaded successfully!");
                queue.renderEpicsList();
                /*
                $(".input-epic").click(function (e) {
                    queue.selectEpic(e.currentTarget.id, e.currentTarget.checked);
                }); // */
            }).catch(function () {

            });
        }
    )
    ;
}

exports.initQueue = function (req, res) {
    initQueue();
    res.json({
        'initQueue': 'start queue initialized'
    });
};

function startTests() {
    logger.debug("[AFTERBUILDCONTROLER ] :: startTests !");
    return new Promise(function (resolve, reject) {
        //$("#empty-state").hide();
        //var $btn = $("#startBtn").button('loading');
        //$('#resetBtn').addClass('disabled');

        queue.runTestsplan().then(function () {
            queue.displayStats();
            console.log("[AFTERBUILDCONTROLER ] :: Successfully finished !!!!");
            // $btn.button('reset');
            // $('#resetBtn').removeClass('disabled');
            resolve('success');
        }).catch(function () {
            queue.displayStats();
            console.log("[AFTERBUILDCONTROLER ] :: You have work to do :-(");
            // $btn.button('reset');
            // $('#resetBtn').removeClass('disabled');
            reject('failure');
        });
    });
}

exports.startTests = function (req, res) {
    startTests();
    res.json({
        'startTests': 'start queue tests'
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