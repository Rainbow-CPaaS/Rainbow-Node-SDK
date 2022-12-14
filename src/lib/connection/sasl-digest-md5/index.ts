"use strict";
export {};


//const mech = require("sasl-digest-md5");
import {default as mech} from "sasl-digest-md5";
//const sasl = require("@xmpp/plugins/sasl");
import {default as sasl} from "@xmpp/plugins/sasl/index.js";

module.exports.name = "sasl-digest-md5";
let name = "sasl-digest-md5";
//module.exports.plugin = function plugin(entity) {
let plugin = function plugin(entity) {
  const SASL = entity.plugin(sasl);
  SASL.use(mech);
  return {entity};
};

export { name, plugin}
