'use strict'

const steam = require("steam"),
    util    = require("util"),
    fs      = require("fs"),
    crypto  = require("crypto"),
    dota2   = require("dota2");
    
    
module.exports = class Bot {
    /**
     * Constructor of the Bot. This prepares an object for connecting to Steam
     * and the Dota2 Game Coordinator.
     * @param logonDetails {account_name: 'user', password: 'password'}
     * @param debug boolean
     * @param debug boolean
     **/
    constructor (logonDetails, debug, debugMore) {
        this.ready         = false;
        this.debug         = debug;
        this.debugMore     = debugMore;
        this._logonDetails = logonDetails;
        this.steamClient   = new steam.SteamClient();
        this.steamUser     = new steam.SteamUser(this.steamClient);
        this.steamFriends  = new steam.SteamFriends(this.steamClient);
        this.Dota2         = new dota2.Dota2Client(this.steamClient, debug, debugMore);
        
        let self = this;
        
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
                    self.ready = true;
                    if (self.callback) {
                        self.callback();
                        self.callback = undefined;
                    }
                });
                self.Dota2.once('unready', function onUnready() {
                    if (debug) util.log("Node-dota2 unready.");
                    self.ready = false;
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
            self.steamUser.logOn(self._logonDetails);
        },
        onSteamError    = function onSteamError(error) {
            if (debug) util.log("Connection closed by server. Trying reconnect");
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
     * Initiates the connection to Steam and the Dota2 Game Coordinator. As soon
     * as all connections are established, init will be called.
     **/
    connect(callback) {
        this.callback = callback;
        this.steamClient.connect();
    }
    
    /**
     * Disconnect from the Game Coordinator. 
     **/
    disconnect() {
        this.Dota2.exit();
        this.steamClient.disconnect();
    }
    
};