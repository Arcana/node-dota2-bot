'use strict'

const steam = require("steam"),
    util    = require("util"),
    fs      = require("fs"),
    crypto  = require("crypto"),
    dota2   = require("dota2"),
    queue   = require("./queue");

module.exports = class Bot {
    /**
     * Constructor of the Bot. This prepares an object for connecting to Steam
     * and the Dota2 Game Coordinator.
     * @param logonDetails {account_name: 'user', password: 'password'}
     * @param debug boolean
     * @param debug boolean
     **/
    constructor (logonDetails, debug, debugMore) {
        this._queue         = new queue(10000, true);
        this._debug         = debug;
        this._debugMore     = debugMore;
        this._logonDetails = logonDetails;
        this.steamClient   = new steam.SteamClient();
        this.steamUser     = new steam.SteamUser(this.steamClient);
        this.steamFriends  = new steam.SteamFriends(this.steamClient);
        this.Dota2         = new dota2.Dota2Client(this.steamClient, debug, debugMore);
        
        let self = this;
        // Block queue until GC is ready
        this._queue.block();
        
        let onConnected = function onConnected() {
            if (debug) util.log("Connected, logging on..");
            self.steamUser.logOn(self._logonDetails);
        },
        onSteamLogOn    = function onSteamLogOn(logonResp){
            if (logonResp.eresult == steam.EResult.OK) {
                // Set status to online
                self.steamFriends.setPersonaState(steam.EPersonaState.Online);
                // Set nickname
                self.steamFriends.setPersonaName(self._logonDetails.account_name);
                
                if (debug) util.log('Logged on with id = '+self.Dota2.ToAccountID(self.Dota2._client.steamID));
                self.Dota2.launch();
                self.Dota2.once('ready', function(){
                    // Activate queue when GC is ready
                    self._queue.release();
                });
                self.Dota2.once('unready', function onUnready() {
                    if (debug) util.log("Node-dota2 unready.");
                    // Block queue when GC is not ready
                    self._queue.block();
                });
                self.Dota2.once('unhandled', function(kMsg) {
                    if (debug) util.log("UNHANDLED MESSAGE " + kMsg);
                });
            }
        },
        onSteamServers  = function onSteamServers(servers) {
            if (debug) util.log("Received servers.");
            fs.writeFile('servers', JSON.stringify(servers));
        },
        onSteamLogOff   = function onSteamLogOff(eresult) {
            if (debug) util.log("Logged off from Steam. Trying reconnect");
            // Block queue while there's no acces to Steam
            self._queue.block();
            self.steamUser.logOn(self._logonDetails);
        },
        onSteamError    = function onSteamError(error) {
            if (debug) util.log("Connection closed by server. Trying reconnect");
            // Block queue while there's no acces to Steam
            self._queue.block();
            self.steamClient.reconnect();
        };
        this.steamClient.on('connected', onConnected);
        this.steamClient.on('logOnResponse', onSteamLogOn);
        this.steamClient.on('loggedOff', onSteamLogOff);
        this.steamClient.on('error', onSteamError);
        this.steamClient.on('servers', onSteamServers);
        
        let onUpdateMachineAuth = function onUpdateMachineAuth(sentry, callback) {
            fs.writeFileSync('sentry', sentry.bytes)
            if (debug) util.log("sentryfile saved");
            callback({ sha_file: crypto.createHash('sha1').update(sentry.bytes).digest() });
        };
        this.steamUser.on('updateMachineAuth', onUpdateMachineAuth);
    }
    
    /**
     * Initiates the connection to Steam and the Dota2 Game Coordinator.
     **/
    connect() {
        this.steamClient.connect();
    }
    
    /**
     * Disconnect from the Game Coordinator. This will also cancel all queued 
     * operations!
     **/
    disconnect() {
        this._queue.clear();
        this.Dota2.exit();
        this.steamClient.disconnect();
    }
    
    /**
     * Schedule a function for execution. This function will be executed as soon
     * as the GC is available.
     **/
    schedule(fn) {
        this._queue.schedule(fn);
    }

    
};