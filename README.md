# node-dota2-bot
Wrapper around the node-dota2 library which handles all log-in shenanigans. 
This basic DotaBot class prepares an object for connection to Steam and the 
Dota2 Game Coordinator. As soon as `connect(callback)` is called, the DotaBot 
connects to Steam and the Dota2 GC. As soon as all connections are made, 
callback is invoked.

## Usage
### Installation
Clone the Git repo and run `npm install`. This'll probably be put on npm in the 
near future.

### Example
```javascript
'use strict'
const DotaBot = require("DotaBot");

var logonDetails = {account_name: 'username', password:'password'};
var bot = new Bot(logonDetails, true);
bot.connect(()=>{
    console.log('We are connected!');
    setTimeout(()=>{bot.disconnect();}, 5000);
});
```
