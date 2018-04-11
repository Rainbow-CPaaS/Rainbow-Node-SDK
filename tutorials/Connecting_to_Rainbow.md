## Connecting to Rainbow
---


### Preamble
---

The Node.JS SDK is a NPM (Node.JS) library that can be used to connect a server (eg: your server backend) to Rainbow.

This tutorial will explain in details what you have to do and how it works.


### Configuration
---

As explained in the guide [Getting Started](/#/documentation/doc/sdk/node/guides/Getting_Started), you have to setup the SDK for Node.JS in order to connect to Rainbow.

Here is a complete sample for connecting to Rainbow. Adapt it with your credentials:


```js

// Load the SDK
let RainbowSDK = require('rainbow-node-sdk');


// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox",                      
    },
    "credentials": {
        "login": "bot@mycompany.com",  
        "password": "thePassword!123"   
    },
    // Application identifier
    "application": {
        "appID": "", 
        "appSecret": "", 
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": true,              
        "enableFileLogs": false,                
        "file": {
            "path": '/var/tmp/rainbowsdk/',
            "level": 'debug'                    
        }
    },
    // IM options
    "im": {
        "sendReadReceipt": true   
    }
};

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start().then(() => {
    // Do something when the SDK is connected to Rainbow
    ...
});

```

### Starting the SDK for Node.JS
---

Starting the SDK for Node.JS can be done by calling the API `start()`. This will start all services and try to connect to Rainbow.


```js

...
rainbowSDK.events.on('rainbow_onstarted', () => {
    // Do something when the SDK has been started
    ...
});

rainbowSDK.events.on('rainbow_onconnected', () => {
    // Do something when the SDK has successfully connected to Rainbow
    ...
});

rainbowSDK.events.on('rainbow_onready', () => {
    // Do something when the SDK is ready to be used
    ...
});

// Start the SDK
rainbowSDK.start().then(() => {
    // Do something when the SDK is connected to Rainbow
    ...
});

```


### Stopping the SDK for Node.JS
---

At any time, you can stop the connection to Rainbow by calling the API `stop()`. This will stop all services and disconnect from Rainbow.


```js

...
rainbowSDK.events.on('rainbow_onstopped', () => {
    // do something when the SDK has been stopped
    ...
});


rainbowSDK.stop().then((res) => {
    // Do something when the SDK has been stopped
    ...
});

```

Once stopped, the only way to reconnect is to call the API `start()` again.


### SDK Node.JS complete lifecycle
---

The SDK for Node.JS has a complete lifecycle that can be managed by the application that handles it.

Each time the state of the SDK for Node.JS changes, an event is fired

<center>
<br>
<br>
<small>STATE</small><br>`stopped`<br>
|<br>
v<br>
**rainbow_onstarted**<br><small>EVENT</small><br>
|<br>
V<br>
<small>STATE</small><br>`started`<br>
|<br>
v<br>
**rainbow_onconnected**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`connected`<br>
|<br>
v<br>
**rainbow_onready**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`ready`<br>
|<br>
v<br>
**rainbow_ondisconnected**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`disconnected`<br>
|<br>
v<br>
**rainbow_onreconnecting**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`reconnecting`<br>
|<br>
v<br>
**rainbow_onconnected**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`connected`<br>
|<br>
v<br>
**rainbow_onready**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`ready`<br>
|<br>
v<br>
**rainbow_onstopped**<br><small>EVENT</small><br>
|<br>
v<br>
<small>STATE</small><br>`stopped`<br>
<br>

</center>


### States
---

Here is the list of state managed by the SDK for Node.JS:

| Name | Description |
|:-----|:------------|
| **stopped** | The SDK for Node.JS is stopped |
| **started** | The SDK for Node.JS has been started successfully |
| **connected** | The SDK for Node.JS is connected to Rainbow |
| **ready** | The SDK for Node.JS is ready to be used |
| **disconnected** | The SDK for Node.JS is disconnected from Rainbow |
| **reconnecting** | The SDK for Node.JS tries to reconnect to Rainbow |
| **failed** | The SDK for Node.JS has failed to reconnect to Rainbow |


#### State stopped
---

When instantiating the SDK for Node.JS, his state is `stopped`.

To start using it, you need to call the API `start()`.


#### State started
---

When the API `start()` has been called, the SDK for Node.JS launches all his internal services and if he succeeds, he tries to connect to Rainbow using the configuration provided.


#### State connected
---

If the SDK for Node.JS succeeds connecting to Rainbow, his state moves to `connected`. At this time, the SDK for Node.JS is not yet fully usable because he needs to get information from Rainbow regarding contacts, bubbles...

Having a SDK for Node.JS that reaches that state, means that the credentials you use are correct. 


#### State ready
---

Once the SDK for Node.JS has finished retrieving all his needed information, the state moves to `ready`.

In that state, you can use it (ie: call API).


#### State disconnected
---

Sometimes, the connection to Rainbow can be lost (eg: network issue, Rainbow upgrade...).

In that situation, the SDK for Node.JS detects this disconnection and moves the state to `disconnected`.


#### State reconnecting
---

When a disconnection happens, the SDK for Node.JS tries to reconnect.

He will made several attempts to reconnect using a Fibonacci strategy backoff to compute the delay between two attempts. 

If the SDK for Node.JS succeeds to reconnect, the state will move to `connected` and then `ready`.


#### State failed
---

Atfer 30 attempts to reconnect, the SDK for Node.JS stops trying...

In that case, the state moves to `failed`.

When the SDK for Node.JS is in that state, he will no more try to reconnect.

A good practice is to handle the reconnection from your application by calling the API `stop()` and then the API `start()` to initiate a new restart from scratch.

This will lead to a complete new lifecycle (and so reconnect attempt if needed).


### Events
---

Here is the list of events that your application can handle:

| Name | Description |
|:-----|:------------|
| **rainbow_onstarted** | Fired when the SDK has successfully started (not yet signed in) |
| **rainbow_onstopped** | Fired when the SDK has been successfully stopped (all services have been stopped) |
| **rainbow_onconnected** | Fired when the connection is successfull with Rainbow (signin complete) |
| **rainbow_onconnectionerror** | Fired when the connection can't be done with Rainbow (ie. issue on sign-in) |
| **rainbow_ondisconnected** | Fired when the SDK lost the connection with Rainbow |
| **rainbow_onreconnecting** | Fired when the SDK tries to reconnect |
| **rainbow_onfailed** | Fired when the SDK didn't succeed to reconnect and stop trying |
| **rainbow_onerror** | Fired when something goes wrong (ie: bad 'configurations' parameter, impossible to connect or reconnect, etc...) |
| **rainbow_onready** | Fired when the SDK is connected to Rainbow and ready to be used |


#### Event rainbow_onstarted
---

This event is fired when the SDK for Node.JS has finished starting his internal modules and is ready to connect to Rainbow.

This event is fired after calling the API `start()`.


#### Event rainbow_onstopped
---

This event is fired when the SDK for Node.JS has finished stopping his internal modules and is deconnected from Rainbow.

this event is fired after calling the API `stop()`.


#### Event rainbow_onconnected
---

This event is fired when the SDK for Node.JS succeeds to connect to Rainbow with the credentials provided in the configuration parameters.

This event is also fired in case of successfull reconnection.


#### Event rainbow_onready
---

This event is fired when the SDK for Node.JS is ready to be use.

Once you receive this event, you can start calling others API.

This event is also fired in case of successfull reconnection.


#### Event rainbow_onconnectionerror
---

This event is fired when the SDK for Node.JS fails to connect to Rainbow due to ba credentials or bad Rainbow host used.


#### Event rainbow_ondisconnected
---

This event is fired when the SDK for Node.JS has been disconnected from Rainbow and before starting to reconnect.


#### Event rainbow_onreconnecting
---

This event is fired each time an attempt to reconnect is made by the SDK for Node.JS.


#### Event rainbow_onfailed
---

This event is fired when the maximal number of attempts to reconnect has been reached and the SDK for Node.Js can't still not connect to Rainbow. 


#### Event rainbow_onerror
---

This event is fired each time an error occurs in the SDK for Node.JS (eg: reconnection failed). When this event is fired, the application has to manually call the API `stop()` and `start()` in order to restart de SDK properly.


---

_Last updated January, 11th 2018_