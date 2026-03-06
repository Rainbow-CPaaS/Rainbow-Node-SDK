'use strict';

export {};

// SCRAM-SHA-256 SASL mechanism (RFC 7677)
// Compatible with the saslmechanisms / @xmpp/sasl plugin interface.

const cryptoLib = require('crypto');

const CLIENT_KEY : any = 'Client Key';
const SERVER_KEY : any = 'Server Key';

function parse(chal) {
    const dtives = {};
    const tokens = chal.split(/,(?=(?:[^"]|"[^"]*")*$)/);
    for (let i = 0; i < tokens.length; i++) {
        const dtiv = /(\w+)=["]?([^"]+)["]?$/.exec(tokens[i]);
        if (dtiv) {
            dtives[dtiv[1]] = dtiv[2];
        }
    }
    return dtives;
}

function saslname(name) {
    const escaped = [];
    for (let i = 0; i < name.length; i++) {
        if (name[i] === ',') {
            escaped.push('=2C');
        } else if (name[i] === '=') {
            escaped.push('=3D');
        } else {
            escaped.push(name[i]);
        }
    }
    return escaped.join('');
}

function genNonce() {
    return cryptoLib.randomBytes(16).toString('hex');
}

function H(data) {
    return cryptoLib.createHash('sha256').update(data).digest();
}

function HMAC(key, msg) {
    return cryptoLib.createHmac('sha256', key).update(msg).digest();
}

function Hi(password, salt, iterations) {
    const saltBuf = Buffer.from(salt);
    const concat = Buffer.alloc(saltBuf.length + 4);
    saltBuf.copy(concat);
    concat.writeUInt32BE(1, saltBuf.length);

    let ui1 = HMAC(Buffer.from(password, 'utf8'), concat);
    let ui = Buffer.from(ui1);

    for (let i = 1; i < iterations; i++) {
        ui1 = HMAC(Buffer.from(password, 'utf8'), ui1);
        for (let j = 0; j < ui.length; j++) {
            ui[j] ^= ui1[j];
        }
    }
    return ui;
}

function XOR(a, b) {
    const len = Math.min(a.length, b.length);
    const result = Buffer.allocUnsafe(len);
    for (let i = 0; i < len; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

const RESP :any = {};

function Mechanism(options) {
    options = options || {};
    this._genNonce = options.genNonce || genNonce;
    this._stage = 'initial';
}

Mechanism.Mechanism = Mechanism;
Mechanism.prototype.name = 'SCRAM-SHA-256';
Mechanism.prototype.clientFirst = true;

Mechanism.prototype.response = function (cred) {
    return RESP[this._stage](this, cred);
};

Mechanism.prototype.challenge = function (chal) {
    const values : any = parse(chal);
    this._salt = Buffer.from(values.s || '', 'base64');
    this._iterationCount = parseInt(values.i, 10);
    this._nonce = values.r;
    this._verifier = values.v;
    this._error = values.e;
    this._challenge = chal;
    return this;
};

RESP.initial = function (mech, cred) {
    mech._cnonce = mech._genNonce();

    let authzid = '';
    if (cred.authzid) {
        authzid = 'a=' + saslname(cred.authzid);
    }

    mech._gs2Header = 'n,' + authzid + ',';
    const username = 'n=' + saslname(cred.username || '');
    const nonce = 'r=' + mech._cnonce;

    mech._clientFirstMessageBare = username + ',' + nonce;
    mech._stage = 'challenge';

    return mech._gs2Header + mech._clientFirstMessageBare;
};

RESP.challenge = function (mech, cred) {
    const gs2Header = Buffer.from(mech._gs2Header).toString('base64');
    mech._clientFinalMessageWithoutProof = 'c=' + gs2Header + ',r=' + mech._nonce;

    let saltedPassword, clientKey, serverKey;

    const saltSame = cred.salt &&
        Buffer.isBuffer(cred.salt) &&
        cred.salt.length === mech._salt.length &&
        cred.salt.equals(mech._salt);

    if (saltSame && cred.clientKey && cred.serverKey) {
        clientKey = cred.clientKey;
        serverKey = cred.serverKey;
    } else if (saltSame && cred.saltedPassword) {
        saltedPassword = cred.saltedPassword;
        clientKey = HMAC(saltedPassword, CLIENT_KEY);
        serverKey = HMAC(saltedPassword, SERVER_KEY);
    } else {
        saltedPassword = Hi(cred.password || '', mech._salt, mech._iterationCount);
        clientKey = HMAC(saltedPassword, CLIENT_KEY);
        serverKey = HMAC(saltedPassword, SERVER_KEY);
    }

    const storedKey = H(clientKey);
    const authMessage = mech._clientFirstMessageBare + ',' +
                        mech._challenge + ',' +
                        mech._clientFinalMessageWithoutProof;

    const clientSignature = HMAC(storedKey, authMessage);
    const clientProof = XOR(clientKey, clientSignature).toString('base64');

    mech._serverSignature = HMAC(serverKey, authMessage);

    mech._stage = 'final';
    mech.cache = {
        salt: mech._salt,
        saltedPassword,
        clientKey,
        serverKey,
    };

    return mech._clientFinalMessageWithoutProof + ',p=' + clientProof;
};

RESP.final = function () {
    return '';
};

function saslScramSha256(sasl) {
    sasl.use(Mechanism);
}
// Plugin entry-point: called as saslFactory => saslFactory.use(Mechanism)
module.exports = saslScramSha256;

export {saslScramSha256};
export default saslScramSha256;
