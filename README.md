# node-dota2-bot
Wrapper around the node-dota2 library which handles all log-in shenanigans. 
This basic DotaBot class prepares an object for connection to Steam and the 
Dota2 Game Coordinator. As soon as `connect(callback)` is called, the DotaBot 
connects to Steam and the Dota2 GC. As soon as all connections are made, 
callback is invoked. From then on, you can interact with the Dota2Client via the
Dota2 property.

## Usage
### Installation
Clone the Git repo and run `npm install`. This'll probably be put on npm in the 
near future.

### Properties
* `steamClient` The steam client used to interact with Steam. See node-steam for details.
* `steamUser` The steam user for account-related functionality, including logon.. See node-steam for details.
* `steamFriends` The steam friends for community functionality, such as chats and friend messages. See node-steam for details.
* `Dota2` The Dota2Client for interaction with the Dota2 Game Coordinator. See node-dota2 for details.

### Methods
#### constructor (logonDetails, debug, debugMore)
* `logonDetails` Object with two properties, `account_name` and `password`
* `debug` Boolean indicating whether or not basic debug info should be shown
* `debugMore`Boolean indicating whether or not advanced debug info should be shown

Creates a new Bot ready to connect to Steam and the Dota2 GC

#### connect ()
Connect to Steam and the Dota2 GC. The Bot will keep the connections alive until `disconnect()` is called

#### disconnect ()
Disconnect from Steam and the Dota2 GC.

### Example
```javascript
'use strict'
const DotaBot = require("DotaBot");

var logonDetails = {account_name: 'username', password:'password'};
var bot = new Bot(logonDetails, true, false);
bot.connect(()=>{
    console.log('We are connected!');
    setTimeout(()=>{bot.disconnect();}, 5000);
});
```
