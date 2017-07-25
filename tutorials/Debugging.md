## Debugging
---

### Preamble
---

As the SDK for Node.JS is embedded into your Node.JS application and runs as a Node.JS process, it is interesting to know how to get information in case of failure.

This guide will describe in details how to configure the SDK for Node.JS in order to help you understanding what's wrong.


### Retrieving SDK version
---

If you need the information, at any time, you can retrieve the SDK Node.JS version by calling the API `version`. It's a public property accessible from the root object.

```js

let version = rainbowSDK.version;

```

Note: This information is displayed in logs.


### Configuring logs
---

The SDK for Node.JS lets you configuring how you want to get the logs. You can define to have access to logs from the console, from a file or from both.


#### Logging to the console
---

By default, the Rainbow SDK for Node.js logs to the shell console used (ie. the sheel console that starts the Node.js process).

You can disable it by setting the parameter `enableConsoleLogs` to false.


```js

...
logs: {
    enableConsoleLogs: false
    ...
}

```

Using the console logs, all logs are displayed. There is no filter.


#### Logging to files
---

By default, the Rainbow SDK for Node.JS don't log information to a file, only to the console.

You can save these logs into a file by setting the parameter `enableFileLogs` to true. (False by default).


```js

...
logs: {
    enableFileLogs: true
    ...
}

```

You can modify the path where the logs are saved and the log level by modifying the parameter `file` like the following:


```js

...
logs: {
    enableFileLogs: true,
    file: {
        path: '/var/tmp/mypath/',
        level: 'error'
    }
}

```

The available log levels are: `error`, `warn`, `info` and `debug`

Each day a new file is created. A maximum of 10 files can be generated, then the oldest one is overwritten to add the new logs which means that the oldest logs (written 10 days ago) are lost. 


### Retrieving information in logs
---

Each line logged has the same format. Here is an exemple of a log

```shell

16:04:39 - info: CORE -  (constructor) SDK version: 1.28.0

```

The following information is contained:

| information | Example | Details |
|-------------|---------|:--------|
| **Time** | `16:04:39` | Time in seconds |
| **Level** | `info` | The log level of this log |
| **Service** | `CORE`| The SDK Services that generated this log |
| **Method** | `constructor`| The SDK method that generated this log |
| **Info** | SDK version: 1.28.0 | The log information |

The log information can contain a serialized JSON object when needed.


 ### Specific version information
 ---

 At the beginning of the logs, you will find interesting information that can help you understanding the version used and how to contact us in case of issues:

 ```shell

16:04:39 - info: LOGS - ------------------------------------------------
16:04:39 - info: LOGS - Welcome to the ALE Rainbow SDK for Node.JS
16:04:39 - info: LOGS - Where Everything connects
16:04:39 - info: LOGS - Support: Send message to Emily using #support #api
16:04:39 - info: LOGS - ------------------------------------------------
16:04:39 - info: LOGS - (constructor) No file logs enabled
16:04:39 - debug: CORE - (constructor) _entering_
16:04:39 - debug: CORE - (constructor) ------- SDK INFORMATION -------
16:04:39 - info: CORE -  (constructor) SDK version: 1.28.0
16:04:39 - info: CORE -  (constructor) Node version: v6.10.2
16:04:39 - info: CORE -  (constructor) http_parser version: 2.7.0
16:04:39 - info: CORE -  (constructor) node version: 6.10.2
16:04:39 - info: CORE -  (constructor) v8 version: 5.1.281.98
16:04:39 - info: CORE -  (constructor) uv version: 1.9.1
16:04:39 - info: CORE -  (constructor) zlib version: 1.2.11
16:04:39 - info: CORE -  (constructor) ares version: 1.10.1-DEV
16:04:39 - info: CORE -  (constructor) icu version: 58.2
16:04:39 - info: CORE -  (constructor) modules version: 48
16:04:39 - info: CORE -  (constructor) openssl version: 1.0.2k
16:04:39 - debug: CORE - (constructor) ------- SDK INFORMATION -------

```

The SDK for Node.JS logs the SDK version and all Node.JS main component used.

When contacting the support (#support #api) don't forget to add all these information. Copy/Pasting only the error seen is not suffisant. We need to know which version you are using.


---

_Last updated July, 25th 2017_