# node-dota2-bot
Wrapper around the node-dota2 library which handles all log-in shennanigans. This basic DotaBot class prepares an object for connection to Steam and the Dota2 Game Coordinator. As soon as `connect()` is called, the DotaBot connects to Steam and the Dota2 GC and it invokes init(). If you want the bot to do anything more than just connecting, create a new class extending DotaBot and overriding the init() method.

## Usage
### Installation

### Basic Bot
```javascript
'use strict'
const DotaBot = require('./DotaBot');

var logonDetails = {account_name: 'username', password:'password'};
var bot = new DotaBot(logonDetails, true);
bot.connect();

```
### Extending
```javascript
'use strict'
const DotaBot = require('DotaBot'),
      Dota2   = require("dota2");
    
module.exports = class MyBot extends DotaBot{

  init() {
    // Interact with node-dota2 here. The Dota2Client object is available by calling `this.game`
  }
}
```
