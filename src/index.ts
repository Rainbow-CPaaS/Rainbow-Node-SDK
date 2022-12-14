"use strict";

/*
const Module = require('module')
const orig = Module._extensions['.js']
const fs = require('fs')
Module._extensions['.js'] = function (module, filename) {
    try {
        return orig(module, filename)
    } catch (e) {
        if (e.code === 'ERR_REQUIRE_ESM') {
            // From: https://github.com/nodejs/node/blob/c24b74a7abec0848484671771d250cfd961f128e/lib/internal/modules/cjs/loader.js#L1237-L1238
            const content = fs.readFileSync(filename, 'utf8')
            module._compile(content, filename)
            // --
            return
        }
        throw e
    }
}

// */

import {NodeSDK} from "./lib/NodeSDK.js";

/*
//let RainbowSdk : any = NodeSDK;
//NodeSDK.RainbowSdk = NodeSDK;
NodeSDK.NodeSDK = NodeSDK;
// module.exports = NodeSDK;

//let RainbowSdk = NodeSDK;
//// module.exports = RainbowSdk;
//// module.exports.NodeSDK = NodeSDK;

export default NodeSDK;
// */

// module.exports = NodeSDK;
// module.exports.default = NodeSDK;
// module.exports.NodeSDK = NodeSDK;
export default NodeSDK;
export { NodeSDK as NodeSDK}; //, OptionsType};

