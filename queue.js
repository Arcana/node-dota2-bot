var util = require('util');

// Default backoff is 10s
const DEFAULT_BACKOFF = 10000;
const DEFAULT_RATELIMIT = 1;
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
    constructor(backoff, rate_limit, debug) {
        this._backoff     = backoff || DEFAULT_BACKOFF;
        this._rate_limit  = rate_limit || DEFAULT_RATELIMIT;
        this._debug       = debug;
        this._retries     = 0;
        this._state       = STATE.IDLE;
        this._queue       = [];
    }
    
    /**
     * Get the current state of the queue
     **/
    get state() {
        return this._state;
    }
    
    /**
     * Get the rate_limit 
     **/
    get rate_limit() {
        return this._rate_limit;
    }
    
    /**
     * Set the rate-limit
     * @param rate_limit #millis to wait between requests
     **/
    set rate_limit(rate_limit) {
        this._rate_limit = rate_limit;
    }
    
    /**
     * Get the backoff rate 
     **/
    get backoff(){
        return this._backoff;
    }
    
    /**
     * Set the backoff rate
     * @param backoff #millis for exponential backoff
     **/
    set backoff(backoff) {
        this._backoff = backoff;
    }
    
    /**
     * Schedule a job for execution
     * @param job function that needs to be executed
     **/
    schedule (job) {
        if (this._debug) util.log("Scheduling job");
        this._queue.push(job);
        if (this._state === STATE.IDLE) {
            this._state = STATE.RUNNING;
            if (this._retries === 0) this._execute();
        }
    }
    
    /**
     * Block job execution 
     **/
    block() {
        if (this._debug) util.log("Blocking queue");
        this._state = STATE.BLOCKED;
    }
    
    /**
     * Start job execution 
     **/
    release() {
        if (this._state === STATE.BLOCKED) {
            if (this._debug) util.log("Activating queue");
            this._state = STATE.IDLE;
            
            if (this._retries === 0) this._execute();
        }
    }
    
    /**
     * Deletes all the jobs from the queue 
     **/
    clear() {
        this._queue = [];
        this._retries = 0;
        this._state = STATE.IDLE;
    }
    
    _execute() {
        let job = this._queue[0];
        if (job) {
            switch(this._state) {
                case STATE.BLOCKED:{
                    this._retries++;
                    let r = Math.floor(Math.random() * (this._retries + 1));
                    let self = this;
                    if (this._debug) util.log("Queue blocked, sleeping for "+r*this.backoff);
                    setTimeout(() => {
                        self._execute();
                    }, r * this.backoff);
                }
                default: {
                    if (this._debug) util.log("Executing job");
                    this._retries = 0;
                    this._state = STATE.RUNNING;
                    (this._queue.shift())();
                    // Apply rate limiting
                    setTimeout(() => {
                        this._execute();
                    }, this.rate_limit);
                } 
            }
        } else {
            if (this._debug) util.log("Queue is empty, going idle");
            this._state = STATE.IDLE;
        }
    }
}