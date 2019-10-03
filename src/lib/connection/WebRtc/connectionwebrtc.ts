'use strict';

const EventEmitter = require('events');

class ConnectionWebRtc extends EventEmitter {
  id: any;
  state: string;
  constructor(id) {
    super();
    this.id = id;
    this.state = 'open';
  }

  public close() {
    this.state = 'closed';
    this.emit('closed');
  }

  public toJSON() {
    return {
      id: this.id,
      state: this.state
    };
  }
}

module.exports.ConnectionWebRtc = ConnectionWebRtc;
export {ConnectionWebRtc};
