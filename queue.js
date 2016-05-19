var util = require('util');

// Default backoff is 10s
const DEFAULT_BACKOFF = 10000;
const STATE = {
    IDLE:    "idle",
    RUNNING: "running",
    BLOCKED: "blocked",
};

/**
 * Job queue with exponential backoff 
 **/
module.exports = class Queue {
    
    /**
     * Creates a queue with the given backoff parameter
     * @param backoff number of milliseconds to be used as base backoff time
     * @param debug whether or not debug info should be logged
     **/
    constructor(backoff, debug) {
        this.backoff = backoff || DEFAULT_BACKOFF;
        this.debug   = debug;
        this.retries = 0;
        this.state   = STATE.IDLE;
        this.queue   = [];
    }
    
    /**
     * Schedule a job for execution
     * @param job function that needs to be executed
     **/
    schedule (job) {
        if (this.debug) util.log("Scheduling job");
        this.queue.push(job);
        if (this.state === STATE.IDLE) {
            this.state = STATE.RUNNING;
            if (this.retries === 0) this._execute();
        }
    }
    
    /**
     * Block job execution 
     **/
    block() {
        if (this.debug) util.log("Blocking queue");
        this.state = STATE.BLOCKED;
    }
    
    /**
     * Start job execution 
     **/
    release() {
        if (this.state === STATE.BLOCKED) {
            if (this.debug) util.log("Activating queue");
            this.state = STATE.IDLE;
            
            if (this.retries === 0) this._execute();
        }
    }
    
    /**
     * Deletes all the jobs from the queue 
     **/
    clear() {
        this.queue = [];
        this.retries = 0;
        this.state = STATE.IDLE;
    }
    
    _execute() {
        let job = this.queue[0];
        if (job) {
            switch(this.state) {
                case STATE.BLOCKED:{
                    this.retries++;
                    let r = Math.floor(Math.random() * (this.retries + 1));
                    let self = this;
                    if (this.debug) util.log("Queue blocked, sleeping for "+r*DEFAULT_BACKOFF);
                    setTimeout(() => {
                        self._execute();
                    }, r * DEFAULT_BACKOFF);
                }
                default: {
                    if (this.debug) util.log("Executing job");
                    this.retries = 0;
                    this.state = STATE.RUNNING;
                    (this.queue.shift())();
                    this._execute();
                } 
            }
        } else {
            if (this.debug) util.log("Queue is empty, going idle");
            this.state = STATE.IDLE;
        }
    }
}