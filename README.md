# dota2-bot
Wrapper around the node-dota2 library which handles all log-in shenanigans. 
This basic DotaBot class prepares an object for connection to Steam and the 
Dota2 Game Coordinator. As soon as `connect(callback)` is called, the DotaBot 
connects to Steam and the Dota2 GC. As soon as all connections are made, 
the queue is started. From then on, all scheduled functions will be executed as 
soon as the GC is available.

[![npm](https://img.shields.io/npm/v/dota2-bot.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/dota2-bot "Current version on npm")
[![Dependency Status](https://img.shields.io/david/Crazy-Duck/node-dota2-bot.svg?maxAge=2592000&style=flat-square)](https://david-dm.org/Crazy-Duck/node-dota2-bot "Check this project's dependencies")

## Usage
### Installation
Run `npm install dota2-bot` to install the package or clone from GitHub

### Properties
* `steamClient` The steam client used to interact with Steam. See node-steam for details.
* `steamUser` The steam user for account-related functionality, including logon.. See node-steam for details.
* `steamFriends` The steam friends for community functionality, such as chats and friend messages. See node-steam for details.
* `Dota2` The Dota2Client for interaction with the Dota2 Game Coordinator. See node-dota2 for details.

#### Getters / Setters
* `state` The current state of the queue (only getter).
* `rate_limit` The current rate limiting factor, i.e. the time in milliseconds between requests.
* `backoff` The current backoff factor used for exponential backoff.

### Methods
#### constructor (logonDetails, debug, debugMore)
* `logonDetails` Object with two properties, `account_name` and `password`
* `debug` Boolean indicating whether or not basic debug info should be shown
* `debugMore`Boolean indicating whether or not advanced debug info should be shown

Creates a new DotaBot ready to connect to Steam and the Dota2 GC

#### connect ()
Connect to Steam and the Dota2 GC. DotaBot will keep the connections alive until `disconnect()` is called

#### disconnect ()
Disconnect from Steam and the Dota2 GC.

#### schedule(fn)
* `fn` Function to schedule for execution as soon as the GC is available

### Example

#### Script
```javascript
'use strict'
const DotaBot = require("DotaBot");

var logonDetails = {account_name: 'username', password:'password'};
var bot = new DotaBot(logonDetails, true, false);
bot.Dota2.on("profileCardData", function (accId, data) {
    console.log(JSON.stringify(data));
});
bot.connect();
bot.schedule(()=>{bot.Dota2.requestProfileCard(63470426);});
setTimeout(()=>{bot.disconnect();}, 25000);
```

#### Output
```
19 May 12:16:07 - Blocking queue
19 May 12:16:07 - Scheduling job
19 May 12:16:07 - Connected, logging on..
19 May 12:16:07 - Logged on with id = **********
19 May 12:16:07 - Launching Dota 2
19 May 12:16:07 - Received servers.
19 May 12:16:07 - sentryfile saved
19 May 12:16:08 - Sending ClientHello
19 May 12:16:08 - Received client welcome.
19 May 12:16:08 - Activating queue
19 May 12:16:08 - Executing job
19 May 12:16:08 - Sending profile card request
19 May 12:16:08 - Queue is empty, going idle
19 May 12:16:09 - Cache subscribed, type 7
19 May 12:16:09 - Unknown cache ID: 7
19 May 12:16:09 - Received profile card data for: 63470426
{"account_id":63470426,"background_def_index":0, ...
19 May 12:16:26 - Exiting Dota 2
```