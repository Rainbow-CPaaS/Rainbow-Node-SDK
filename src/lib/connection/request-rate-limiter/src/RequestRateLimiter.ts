import LeakyBucket from './leakybucket';
import BackoffError from './BackoffError';
import {EventEmitter} from "events";
//import util from "util";
//import logd from 'logd';
const util = require("util");

//const log = logd.module('request-rate-limiter');


export default class RequestRateLimiter {
    public backoffTime: number;
    private requestRate: number;
    private interval: number;
    private timeout: number;
    public bucket: any;
    private requestHandler: any;
    private _eventEmitter: EventEmitter;


    /**
     * The constructor accepts 4 additional options, which can be used to configure the behaviour of the limiter:
     * backoffTime: how many seconds to back off when the remote end indicates to back off
     * requestRate: how many requests can be sent within the interval
     * interval: the interval within which all requests of the requestRate should be executed
     * timeout: no request will stay in the queue any longer than the timeout. if the queue is full, the requst will be rejected
     * 
    */
    constructor(_eventEmitter : EventEmitter,{
        backoffTime = 10,
        requestRate = 60,
        interval = 60,
        timeout = 600,
    } = {}) {
        this.backoffTime = backoffTime;
        this.requestRate = requestRate;
        this.interval = interval;
        this.timeout = timeout;

        this._eventEmitter = _eventEmitter;
  //      log.info(`Setting up a request rate limiter with the request rate ${requestRate}, an interval of ${interval}, a timeout of ${timeout} and a backoff time of ${backoffTime}`);

        // the leaky bucket is used to limit the requests and allow
        // bursting, like its often done on RESTful APIs
        this.bucket = new LeakyBucket({
            capacity: this.requestRate,
            interval: this.interval,
            timeout: this.timeout,
        });
    }




    /**
    * promise that resolves when the rate limited becomes idle
    * once resolved, the call to this method must be repeated
    * in order to become notified again.
    */
    async idle() {
        return this.bucket.isEmpty();
    }





    /**
    * enqueue a request
    */
    async request(requestConfig) {
        //log.info(`throttling request`);
        let that = this;
        let dateEnqueued = new Date();
        let iterBackOff = 0;

        // execute the request. if the request handler returns an instance 
        // of the BackoffError the request will be re-enqueued
        const doRequest = async() => {
          //  log.debug(`Executing request`);

            // wait for the next free slot, if the request cannot be executed
            // in time, an error will be thrown
            await this.bucket.throttle();


            return await this.executeRequest(requestConfig).then((response) => {
               // log.debug(`Request was sucessfull`);
                return response;
            }).catch(async (err) => {
                if (err instanceof BackoffError) {
                 //   log.debug(`Backing off for ${this.backoffTime}`);

                    iterBackOff++;
                    that._eventEmitter.emit("evt_internal_429BackoffError", {request:requestConfig, error:err, dateEnqueued, iterBackOff});

                    // console.log("err : ", util.inspect(err, false, 4, true));
                    // wait as long as is required by the backoffTime
                    // config value
                    this.bucket.pause(this.backoffTime);

                    // try again
                    return await doRequest();
                } else {
                   // log.error(`The request failed with the error ${err.message}`);
                    throw err;
                }
            });
        };
        
        return await doRequest();
    }



    /**
    * actually execute the requests
    */
    async executeRequest(requestConfig) {
        if (!this.requestHandler) {
            throw new Error(`No request handler present! Please register on using the setRequestHandler method!`);
        }

        return await this.requestHandler(requestConfig);
    }




    /**
    * set the reuqest handler that shall be used to handle the requests
    */
    setRequestHandler(requestHandler) {
        if (typeof requestHandler === 'function') {
            this.requestHandler = requestHandler;
        } else if (typeof requestHandler === 'object' &&
            typeof requestHandler.request === 'function') {

            // wrap the class, so that the internal interface 
            // inside this class is always the same
            this.requestHandler = async(requestConfig) => {
                return await requestHandler.request(requestConfig);
            };
        } else {
            throw new Error(`Invalid request handler. Expected a function or an object with a request method!`);
        }
    }
}
