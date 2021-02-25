'use strict';

import {publicDecrypt} from "crypto";

//const uuidv4 = require('uuid/v4');
//import * as uuidv4 from 'uuid/dist/v4';
import { v4 as uuidv4 } from 'uuid';

const DefaultConnection = require('./connectionwebrtc');

class ConnectionManager {
  connections = new Map();
  closedListeners = new Map();
  Connection : any;
  generateId : any;

  constructor(options : any = {}) {
    options = {
      Connection: DefaultConnection,
      generateId: uuidv4,
      ...options
    };

    let self = this;
/*    const {
      Connection,
      generateId
    } = options;
    // */
      this.Connection = options.Connection;
      this.generateId = options.generateId;
  }

    createId() {
        do {
            const id = this.generateId();
            if (!this.connections.has(id)) {
                return id;
            }
            // eslint-disable-next-line
        } while (true);
    }

    deleteConnection(connection) {
        // 1. Remove "closed" listener.
        const closedListener = this.closedListeners.get(connection);
        this.closedListeners.delete(connection);
        connection.removeListener('closed', closedListener);

        // 2. Remove the Connection from the Map.
        this.connections.delete(connection.id);
    }


    async createConnection () {
        let that = this;
        const id = this.createId();
        const connection = new this.Connection(id);

        // 1. Add the "closed" listener.
        function closedListener() { that.deleteConnection(connection); }
        this.closedListeners.set(connection, closedListener);
        connection.once('closed', closedListener);

        // 2. Add the Connection to the Map.
        this.connections.set(connection.id, connection);

        return connection;
    };

    getConnection (id ) {
        return this.connections.get(id) || null;
    };

    getConnections () {
        return [...this.connections.values()];
    };

    toJSON() {
    return this.getConnections().map(connection => connection.toJSON());
  }

}

module.exports.ConnectionManager = ConnectionManager;
export {ConnectionManager};
