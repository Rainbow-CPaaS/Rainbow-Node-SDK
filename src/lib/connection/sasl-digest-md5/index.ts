"use strict";
export {};


const mech = require("sasl-digest-md5");
const sasl = require("@xmpp/plugins/sasl");

module.exports.name = "sasl-digest-md5";
module.exports.plugin = function plugin(entity) {
  const SASL = entity.plugin(sasl);
  SASL.use(mech);
  return {entity};
};
