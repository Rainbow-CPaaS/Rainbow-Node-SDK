'use strict';
export {};


//const {xml, jid, Client} = require('@xmpp/client-core');
import {xml, jid, Client} from '@xmpp/client-core';

//const _reconnect = require('@xmpp/reconnect');
import {default as _reconnect} from '@xmpp/reconnect';
//const _websocket = require('@xmpp/websocket');
import {default as _websocket} from '@xmpp/websocket';
//const _tcp = require('@xmpp/tcp');
import {default as _tcp} from '@xmpp/tcp';
//const _tls = require('@xmpp/tls');
import _tls from '@xmpp/tls';
//const _middleware = require('@xmpp/middleware');
import {default as _middleware} from '@xmpp/middleware';
//const _streamFeatures = require('@xmpp/stream-features');
import {default as _streamFeatures} from '@xmpp/stream-features';
//const _iqCaller = require('@xmpp/iq/caller');
import {default as _iqCaller} from '@xmpp/iq/caller.js';
//const _iqCallee = require('@xmpp/iq/callee');
import {default as _iqCallee} from '@xmpp/iq/callee.js';
//const _resolve = require('@xmpp/resolve');
import {default as _resolve} from '@xmpp/resolve';

// Stream features - order matters and define priority
//const _starttls = require('@xmpp/starttls/client');
import {default as _starttls} from '@xmpp/starttls/client.js';
//const _sasl = require('@xmpp/sasl');
import {default as  _sasl} from '@xmpp/sasl';
//const _resourceBinding = require('@xmpp/resource-binding');
import {default as _resourceBinding} from '@xmpp/resource-binding';
//const _sessionEstablishment = require('@xmpp/session-establishment');
import {default as _sessionEstablishment} from '@xmpp/session-establishment';

// SASL mechanisms - order matters and define priority
//const scramsha1 = require('@xmpp/sasl-scram-sha-1');
//const plain = require('@xmpp/sasl-plain');
import {default as plain} from '@xmpp/sasl-plain';
//const anonymous = require('@xmpp/sasl-anonymous');


function  getDomain(service) {
  const domain = service.split('://')[1] || service;
  return domain.split(':')[0].split('/')[0];
}

function client(options = {}) {
  // @ts-ignore
  const {resource, credentials, username, password, ...params} = options;

  // @ts-ignore
  const {domain, service} = params;
  if (!domain && service) {
    // @ts-ignore
    params.domain = getDomain(service);
  }

  const entity = new Client(params);

  const reconnect = _reconnect({entity});
  const websocket = _websocket({entity});
  const tcp = _tcp({entity});
  const tls = _tls({entity});

  const middleware = _middleware({entity});
  const streamFeatures = _streamFeatures({middleware});
  const iqCaller = _iqCaller({middleware, entity});
  const iqCallee = _iqCallee({middleware, entity});
  const resolve = _resolve({entity});
  // Stream features - order matters and define priority
  const starttls = _starttls({streamFeatures});
  const sasl = _sasl({streamFeatures}, credentials || {username, password});
  //console.log("resourceBinding, iqCaller : ", iqCaller, ", streamFeatures :", streamFeatures, ", resource : ", resource)
  const resourceBinding = _resourceBinding({iqCaller, streamFeatures}, resource);
  const sessionEstablishment = _sessionEstablishment({iqCaller, streamFeatures});
  // SASL mechanisms - order matters and define priority
  const mechanisms = Object.entries({ plain}).map(
    ([k, v]) => ({[k]: v(sasl)})
  );

  //iqCallee.get('urn:xmpp:ping', 'ping', ctx => { return {} });
  let self = this;
  Object.assign(entity, {
    entity,
    reconnect,
    tcp,
    websocket,
    tls,
    middleware,
    streamFeatures,
    iqCaller,
    iqCallee,
    resolve,
    starttls,
    sasl,
    resourceBinding,
    sessionEstablishment,
    mechanisms,
  });
  entity.getQuery = (NS, adverb, callback) => {
    //client.iqCallee.get('urn:xmpp:ping', 'ping', ctx => { return {} });
    iqCallee.get(NS, adverb, callback);
  };

 entity.setQuery = (NS, adverb, callback) => {
    //client.iqCallee.get('urn:xmpp:ping', 'ping', ctx => { return {} });
    iqCallee.set(NS, adverb, callback);
  }; //*/
  return entity;
}




// module.exports.xml = xml;
// module.exports.jid = jid;
// module.exports.client = client;

export {client, jid, xml};
