'use strict';

import {ConnectionManager} from './connectionmanager';
import {WebRtcConnection} from './webrtcconnection';

class WebRtcConnectionManager {
    static create: (options: any) => WebRtcConnectionManager;
    public connectionManager: ConnectionManager;

    constructor(options = {}) {
        options = {
            Connection: WebRtcConnection,
            ...options
        };

        let self = this;

        this.connectionManager = new ConnectionManager(options);

    }

    async createConnection() {
        const connection = await this.connectionManager.createConnection();
        await connection.doOffer();
        return connection;
    };
    async createIncallConnection() {
        const connection = await this.connectionManager.createConnection();
        return connection;
    };

    getConnection(id) {
        return this.connectionManager.getConnection(id);
    };

    getConnections() {
        return this.connectionManager.getConnections();
    };

    toJSON() {
        return this.getConnections().map(connection => connection.toJSON());
    }
}

WebRtcConnectionManager.create = function create(options) {
  return new WebRtcConnectionManager({
    Connection: function(id) {
      return new WebRtcConnection(id, options);
    }
  });
};

module.exports.WebRtcConnectionManager = WebRtcConnectionManager;
export {WebRtcConnectionManager};
