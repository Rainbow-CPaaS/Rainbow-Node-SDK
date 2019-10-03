"use strict";

// @ts-ignore
const SDPUtilFac = require('./SDPUtil.js');

// @ts-ignore
var SDPUtil = new SDPUtilFac.createSDPUtil();

// @ts-ignore
class SDP {
    private media: string[];
    private session: string;
    private raw: string;
/*    constructor() {
        this.media = '';
        this.session = '';
        this.raw = '';
    } */

    constructor(sdp)
    {
        this.media = sdp.split('\r\nm=');

        for (var i = 1; i < this.media.length; i++)
        {
            this.media[i] = 'm=' + this.media[i];

            if (i != this.media.length - 1)
            {
                this.media[i] += '\r\n';
            }
        }

        this.session = this.media.shift() + '\r\n';
        this.raw = this.session + this.media.join('');
    }

    // remove iSAC and CN from SDP
    mangle() {
        var i, j, mline, lines, rtpmap, newdesc;
        for (i = 0; i < this.media.length; i++) {
            lines = this.media[i].split('\r\n');
            lines.pop(); // remove empty last element
            mline = SDPUtil.parse_mline(lines.shift());
            if (mline.media != 'audio')
                continue;
            newdesc = '';
            mline.fmt.length = 0;
            for (j = 0; j < lines.length; j++) {
                if (lines[j].substr(0, 9) == 'a=rtpmap:') {
                    rtpmap = SDPUtil.parse_rtpmap(lines[j]);
                    if (rtpmap.name == 'CN' || rtpmap.name == 'ISAC')
                        continue;
                    mline.fmt.push(rtpmap.id);
                    newdesc += lines[j] + '\r\n';
                } else {
                    newdesc += lines[j] + '\r\n';
                }
            }
            this.media[i] = SDPUtil.build_mline(mline) + '\r\n';
            this.media[i] += newdesc;
        }
        this.raw = this.session + this.media.join('');
    }

    // remove lines matching prefix from session section
    removeSessionLines(prefix) {
        var self = this;
        var lines = SDPUtil.find_lines(this.session, prefix);
        lines.forEach(function(line) {
            self.session = self.session.replace(line + '\r\n', '');
        });
        this.raw = this.session + this.media.join('');
        return lines;
    }

    // remove lines matching prefix from a media section specified by mediaindex
    // TODO: non-numeric mediaindex could match mid
    removeMediaLines(mediaindex, prefix) {
        var self = this;
        var lines = SDPUtil.find_lines(this.media[mediaindex], prefix);
        lines.forEach(function(line) {
            self.media[mediaindex] = self.media[mediaindex].replace(line + '\r\n', '');
        });
        this.raw = this.session + this.media.join('');
        return lines;
    }

    // add content's to a jingle element
    toJingle(elem, thecreator, callerinfo) {

    var i, j, k, mline, ssrc, rtpmap, tmp, line, lines;
    var self = this;
    var stanzaPtr = elem;
    // new bundle plan
    if (SDPUtil.find_line(this.session, 'a=group:')) {
        lines = SDPUtil.find_lines(this.session, 'a=group:');
        for (i = 0; i < lines.length; i++) {
            tmp = lines[i].split(' ');
            var semantics = tmp.shift().substr(8);
            stanzaPtr = stanzaPtr.c('group', {xmlns: 'urn:xmpp:jingle:apps:grouping:0', semantics:semantics});
            for (j = 0; j < tmp.length; j++) {
                stanzaPtr = stanzaPtr.c('content', {name: tmp[j]}).up();
            }
            stanzaPtr = stanzaPtr.up();
        }
    }

    var bundle = [];
    if (SDPUtil.find_line(this.session, 'a=group:BUNDLE')) {
        bundle = SDPUtil.find_line(this.session, 'a=group:BUNDLE ').split(' ');
        bundle.shift();
    }
    for (i = 0; i < this.media.length; i++) {
        mline = SDPUtil.parse_mline(this.media[i].split('\r\n')[0]);
        if (!(mline.media == 'audio' || mline.media == 'video')) {
            continue;
        }
        if (SDPUtil.find_line(this.media[i], 'a=ssrc:')) {
            ssrc = SDPUtil.find_line(this.media[i], 'a=ssrc:').substring(7).split(' ')[0]; // take the first
        } else {
            ssrc = false;
        }

        stanzaPtr = stanzaPtr.c('content', {creator: thecreator, name: mline.media});
        if (SDPUtil.find_line(this.media[i], 'a=mid:')) {
            // prefer identifier from a=mid if present
            var mid = SDPUtil.parse_mid(SDPUtil.find_line(this.media[i], 'a=mid:'));
            stanzaPtr.setAttrs({ name: mid });
        }
        if (SDPUtil.find_line(this.media[i], 'a=rtpmap:').length) {
            stanzaPtr = stanzaPtr.c('description',
                 {xmlns: 'urn:xmpp:jingle:apps:rtp:1',
                  media: mline.media });
            if (ssrc) {
                stanzaPtr.setAttrs({ssrc: ssrc});
            }
            for (j = 0; j < mline.fmt.length; j++) {
                rtpmap = SDPUtil.find_line(this.media[i], 'a=rtpmap:' + mline.fmt[j]);
                if (!rtpmap) {
                    // the rtpmap is missing create it for static codec with default bitrate
                    switch (mline.fmt[j]) {
                        case '0': rtpmap= 'a=rtpmap:0 PCMU/8000';
                            break;
                        case '8': rtpmap= 'a=rtpmap:8 PCMA/8000';
                            break;
                        // unknow codec insert a fake one
                        default: rtpmap= 'a=rtpmap:'+ mline.fmt[j] + ' UNKNOW/8000';
                            break;
                    }
                }
                stanzaPtr = stanzaPtr.c('payload-type', SDPUtil.parse_rtpmap(rtpmap));
                // put any 'a=fmtp:' + mline.fmt[j] lines into <param name=foo value=bar/>
                if (SDPUtil.find_line(this.media[i], 'a=fmtp:' + mline.fmt[j])) {
                    tmp = SDPUtil.parse_fmtp(SDPUtil.find_line(this.media[i], 'a=fmtp:' + mline.fmt[j]));
                    for (k = 0; k < tmp.length; k++) {
                        stanzaPtr = stanzaPtr.c('parameter', tmp[k]).up();
                    }
                }
                this.RtcpFbToJingle(i, stanzaPtr, mline.fmt[j]); // XEP-0293 -- map a=rtcp-fb

                stanzaPtr = stanzaPtr.up();
            }
            if (SDPUtil.find_line(this.media[i], 'a=crypto:', this.session)) {
                stanzaPtr = stanzaPtr.c('encryption', {required: 1});
                var crypto = SDPUtil.find_lines(this.media[i], 'a=crypto:', this.session);
                crypto.forEach(function(line) {
                    stanzaPtr = stanzaPtr.c('crypto', SDPUtil.parse_crypto(line)).up();
                });
                stanzaPtr = stanzaPtr.up(); // end of encryption
            }

            if (ssrc) {
                // new style mapping
                stanzaPtr = stanzaPtr.c('source', { ssrc: ssrc, xmlns: 'urn:xmpp:jingle:apps:rtp:ssma:0' });
                // FIXME: group by ssrc and support multiple different ssrcs
                var ssrclines = SDPUtil.find_lines(this.media[i], 'a=ssrc:');
                ssrclines.forEach(function(line) {
                    var idx = line.indexOf(' ');
                    var linessrc = line.substr(0, idx).substr(7);
                    if (linessrc != ssrc) {
                        stanzaPtr = stanzaPtr.up();
                        ssrc = linessrc;
                        stanzaPtr = stanzaPtr.c('source', { ssrc: ssrc, xmlns: 'urn:xmpp:jingle:apps:rtp:ssma:0' });
                    }
                    var kv = line.substr(idx + 1);
                    stanzaPtr = stanzaPtr.c('parameter');
                    if (kv.indexOf(':') == -1) {
                        stanzaPtr.setAttrs({ name: kv });
                    } else {
                        stanzaPtr.setAttrs({ name: kv.split(':', 2)[0] });
                        stanzaPtr.setAttrs({ value: kv.split(':', 2)[1] });
                    }
                    stanzaPtr = stanzaPtr.up();
                });
                stanzaPtr = stanzaPtr.up();
            }

                var ssrcgrouplines = SDPUtil.find_lines(this.media[i], 'a=ssrc-group');
                ssrcgrouplines.forEach(function(line) {
                    var idx = line.indexOf(' ');
                    var semantics = line.substr(0, idx).substr(13);
                    stanzaPtr = stanzaPtr.c('ssrc-group', { xmlns: 'urn:xmpp:jingle:apps:rtp:ssma:0', semantics:semantics });
                    var kv = line.substr(idx + 1);
                    while(kv.length > 0 ) {
                        var ssrc_gr;
                        idx = kv.indexOf(' ');
                        if(idx > 0 ) {
                            ssrc_gr = kv.substr(0, idx);
                            kv = kv.substr(idx + 1);
                        } else {
                            ssrc_gr = kv.substr(0, kv.length);
                            kv = '';
                        }
                        stanzaPtr = stanzaPtr.c('source', { ssrc:ssrc_gr }).up();
                    }
                    stanzaPtr = stanzaPtr.up();
                });



            if (SDPUtil.find_line(this.media[i], 'a=rtcp-mux')) {
                stanzaPtr = stanzaPtr.c('rtcp-mux').up();
            }

            // XEP-0293 -- map a=rtcp-fb:*
            this.RtcpFbToJingle(i, elem, '*');

            // XEP-0294
            if (SDPUtil.find_line(this.media[i], 'a=extmap:')) {
                lines = SDPUtil.find_lines(this.media[i], 'a=extmap:');
                for (j = 0; j < lines.length; j++) {
                    tmp = SDPUtil.parse_extmap(lines[j]);
                    stanzaPtr = stanzaPtr.c('rtp-hdrext', { xmlns: 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0',
                                    uri: tmp.uri,
                                    id: tmp.value });
                    if (tmp.hasOwnProperty('direction')) {
                        switch (tmp.direction) {
                        case 'sendonly':
                            stanzaPtr.setAttrs({senders: 'responder'});
                            break;
                        case 'recvonly':
                            stanzaPtr.setAttrs({senders: 'initiator'});
                            break;
                        case 'sendrecv':
                            stanzaPtr.setAttrs({senders: 'both'});
                            break;
                        case 'inactive':
                            stanzaPtr.setAttrs({senders: 'none'});
                            break;
                        }
                    }
                    // TODO: handle params
                    stanzaPtr = stanzaPtr.up();
                }
            }
            stanzaPtr = stanzaPtr.up(); // end of description
        }

        // map ice-ufrag/pwd, dtls fingerprint, candidates
        this.TransportToJingle(i, stanzaPtr);

        if (SDPUtil.find_line(this.media[i], 'a=sendrecv', this.session)) {
            stanzaPtr.setAttrs({senders: 'both'});
        } else if (SDPUtil.find_line(this.media[i], 'a=sendonly', this.session)) {
            stanzaPtr.setAttrs({senders: 'initiator'});
        } else if (SDPUtil.find_line(this.media[i], 'a=recvonly', this.session)) {
            stanzaPtr.setAttrs({senders: 'responder'});
        } else if (SDPUtil.find_line(this.media[i], 'a=inactive', this.session)) {
            stanzaPtr.setAttrs({senders: 'none'});
        }
        if (mline.port == '0') {
            // estos hack to reject an m-line
            stanzaPtr = stanzaPtr.setAttrs({senders: 'rejected'});
        }
        stanzaPtr = stanzaPtr.up(); // end of content
    }

    if( callerinfo !== undefined ) {
        stanzaPtr = stanzaPtr.c('mediapillar');
        stanzaPtr.setAttrs({xmlns: 'urn:xmpp:janus:1'});
        stanzaPtr = stanzaPtr.c('callernumber').t(callerinfo.callernumber).up();
        stanzaPtr = stanzaPtr.c('displayname').t(callerinfo.displayname);
        stanzaPtr = stanzaPtr.up(); // end of content
        stanzaPtr = stanzaPtr.up(); // end of content
    }

    stanzaPtr = stanzaPtr.up();

    return elem;
    }

    TransportToJingle(mediaindex, elem) {
    var stanzaPtr = elem;
    var i = mediaindex;
    var tmp;
    var self = this;

    stanzaPtr = stanzaPtr.c('transport');

    // XEP-0320
    var fingerprints = SDPUtil.find_lines(this.media[mediaindex], 'a=fingerprint:', this.session);

    fingerprints.forEach(function(line) {
        tmp = SDPUtil.parse_fingerprint(line);
        tmp.xmlns = 'urn:xmpp:jingle:apps:dtls:0';
        stanzaPtr = stanzaPtr.c('fingerprint').t(tmp.fingerprint);
        delete tmp.fingerprint;
        line = SDPUtil.find_line(self.media[mediaindex], 'a=setup:', self.session);
        if (line) {
            tmp.setup = line.substr(8);
        }
        stanzaPtr.setAttrs(tmp);
        stanzaPtr = stanzaPtr.up(); // end of fingerprint
    });
    tmp = SDPUtil.iceparams(this.media[mediaindex], this.session);
    if (tmp) {
        tmp.xmlns = 'urn:xmpp:jingle:transports:ice-udp:1';
        stanzaPtr.setAttrs(tmp);
        // XEP-0176
        if (SDPUtil.find_line(this.media[mediaindex], 'a=candidate:', this.session)) { // add any a=candidate lines
            var lines = SDPUtil.find_lines(this.media[mediaindex], 'a=candidate:', this.session);
            lines.forEach(function (line) {
                //filter out "typ srflx" candidate
                if (line.includes("typ relay") || line.includes("typ host")){
                    let candTmp = SDPUtil.candidateToJingle(line);
                    if(candTmp !== null) {
                        stanzaPtr = stanzaPtr.c('candidate', candTmp).up();
                    }
            }
            });
        }
    }
    //stanzaPtr = stanzaPtr.up(); // end of transport
    }

    RtcpFbToJingle(mediaindex, elem, payloadtype) { // XEP-0293
        var stanzaPtr = elem;

        var lines = SDPUtil.find_lines(this.media[mediaindex], 'a=rtcp-fb:' + payloadtype);
        lines.forEach(function (line) {
            var tmp = SDPUtil.parse_rtcpfb(line);
            if (tmp.type == 'trr-int') {
                stanzaPtr = stanzaPtr.c('rtcp-fb-trr-int', {xmlns: 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0', value: tmp.params[0]});
                stanzaPtr = stanzaPtr.up();
            } else {
                stanzaPtr = stanzaPtr.c('rtcp-fb', {xmlns: 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0', type: tmp.type});
                if (tmp.params.length > 0) {
                    stanzaPtr.setAttrs({'subtype': tmp.params[0]});
                }
                stanzaPtr = stanzaPtr.up();
            }
        });
    }

    RtcpFbFromJingle(elem, payloadtype) { // XEP-0293
    var media = '';
    var tmp = elem.getChildren('rtcp-fb-trr-int','urn:xmpp:jingle:apps:rtp:rtcp-fb:0');
    if (tmp.length) {
        media += 'a=rtcp-fb:' + '*' + ' ' + 'trr-int' + ' ';
        if (tmp.attr('value')) {
            media += tmp.attr('value');
        } else {
            media += '0';
        }
        media += '\r\n';
    }
    tmp = elem.getChildren('rtcp-fb','urn:xmpp:jingle:apps:rtp:rtcp-fb:0');
    tmp.forEach(function (rtcpfb) {
        media += 'a=rtcp-fb:' + payloadtype + ' ' + rtcpfb.attr('type');
        if (rtcpfb.attr('subtype')) {
            media += ' ' + rtcpfb.attr('subtype');
        }
        media += '\r\n';
    });
    return media;
    }

    // construct an SDP from a jingle stanza
    fromJingle(jingle) {
    var self = this;
    this.raw = 'v=0\r\n' +
        'o=- ' + '1923518516' + ' 2 IN IP4 0.0.0.0\r\n' +// FIXME
        's=-\r\n' +
        't=0 0\r\n';
    // http://tools.ietf.org/html/draft-ietf-mmusic-sdp-bundle-negotiation-04#section-8
    if (jingle.getChildren('group','urn:xmpp:jingle:apps:grouping:0') !== []) {
        jingle.getChildren('group','urn:xmpp:jingle:apps:grouping:0').forEach(function (group, idx) {
            var contents = group.getChildren('content').map(function (content, idx) {
                return content.getAttr('name');
            });

            if (contents.length > 0) {
                self.raw += 'a=group:' + (group.getAttr('semantics') || group.getAttr('type')) + ' ' + contents.join(' ') + '\r\n';
            }
        });
    } else if (jingle.getChildren('group','urn:ietf:rfc:5888') !== []) {
        // temporary namespace, not to be used. to be removed soon.
        jingle.getChildren('group','urn:ietf:rfc:5888').forEach(function (group, idx) {
            var contents = group.getChildren('content').map(function (content, idx) {
                return content.getAttr('name');
            });
            if (group.getAttr('type') !== null && contents.length > 0) {
                self.raw += 'a=group:' + group.getAttr('type') + ' ' + contents.join(' ') + '\r\n';
            }
        });
    } else {
        var bundle = jingle.getChildren('content').filter(function (content) {
            return content.getChildren('bundle').length > 0;
        }).map(function (content, idx) {
            return content.getAttr('name');
        });
        if (bundle.length) {
            this.raw += 'a=group:BUNDLE ' + bundle.join(' ') + '\r\n';
        }
    }

    this.raw += 'a=ice-options:trickle' + '\r\n';

    this.session = this.raw;
    jingle.getChildren('content').forEach(function (content) {
        var m = self.jingle2media(content);
        self.media.push(m);
    });

    // reconstruct msid-semantic
    var msid = SDPUtil.parse_ssrc(this.media.toString());
    if (msid.hasOwnProperty('mslabel')) {
        this.session += "a=msid-semantic: WMS " + msid.mslabel + "\r\n";
    } else {
        this.session += "a=msid-semantic: WMS\r\n";
    }

    this.raw = this.session + this.media.join('');
    }

    // translate a jingle content element into an SDP media part
    jingle2media(content) {
    var media = '',
        desc = content.getChild('description'),
        ssrc = desc.attr('ssrc'),
        self = this,
        tmp;

    tmp = { media: desc.attr('media') };
    tmp.port = '1';
    if (content.attr('senders') == 'rejected') {
        // estos hack to reject an m-line.
        tmp.port = '0';
    }

    var isTransportFingerprint = false;
    if (content.getChildren('transport').length) {
        if (content.getChildren('transport')[0].getChild('fingerprint') !== undefined) {
            isTransportFingerprint = true;
        }
    }

    if (isTransportFingerprint || desc.getChild('encryption') !== undefined) {
        tmp.proto = 'RTP/SAVPF';
    } else {
        tmp.proto = 'RTP/AVPF';
    }
    tmp.fmt = desc.getChildren('payload-type').map(function (content, idx) { return content.getAttr('id'); });
    media += SDPUtil.build_mline(tmp) + '\r\n';
    media += 'c=IN IP4 0.0.0.0\r\n';
    media += 'a=rtcp:1 IN IP4 0.0.0.0\r\n';
    tmp = content.getChildren('transport','urn:xmpp:jingle:transports:ice-udp:1');
    if (tmp.length) {
        tmp = tmp[0];
        if (tmp.attr('ufrag')) {
            media += SDPUtil.build_iceufrag(tmp.attr('ufrag')) + '\r\n';
        }
        if (tmp.attr('pwd')) {
            media += SDPUtil.build_icepwd(tmp.attr('pwd')) + '\r\n';
        }
        tmp.getChildren('fingerprint').forEach(function (fp) {
            media += 'a=fingerprint:' + fp.getAttr('hash');
            media += ' ' + fp.text();
            media += '\r\n';
            if (fp.getAttr('setup')) {
                media += 'a=setup:' + fp.getAttr('setup') + '\r\n';
            }
        });
    }

    switch (content.attr('senders')) {
    case 'initiator':
        media += 'a=sendonly\r\n';
        break;
    case 'responder':
        media += 'a=recvonly\r\n';
        break;
    case 'none':
        media += 'a=inactive\r\n';
        break;
    case 'both':
        media += 'a=sendrecv\r\n';
        break;
    }
    media += 'a=mid:' + content.attr('name') + '\r\n';

    // <description><rtcp-mux/></description>
    // see http://code.google.com/p/libjingle/issues/detail?id=309 -- no spec though
    // and http://mail.jabber.org/pipermail/jingle/2011-December/001761.html
    if (desc.getChildren('rtcp-mux').length) {
        media += 'a=rtcp-mux\r\n';
    }
    if (desc.getChildren('encryption').length) {
        desc.getChildren('encryption')[0].getChildren('crypto').forEach(function (crypto) {
            media += 'a=crypto:' + crypto.getAttr('tag');
            media += ' ' + crypto.getAttr('crypto-suite');
            media += ' ' + crypto.getAttr('key-params');
            if (crypto.getAttr('session-params')) {
                media += ' ' + crypto.getAttr('session-params');
            }
            media += '\r\n';
        });
    }
    desc.getChildren('payload-type').forEach(function (ptype) {
        media += SDPUtil.build_rtpmap(ptype) + '\r\n';
        if (ptype.getChildren('parameter').length) {
            media += 'a=fmtp:' + ptype.getAttr('id') + ' ';
            media += ptype.getChildren('parameter').map(function (content, idx) { return (content.getAttr('name') ? (content.getAttr('name') + '=') : '') + content.getAttr('value'); }).join(';');
            media += '\r\n';
        }
        // xep-0293
        media += self.RtcpFbFromJingle(ptype, ptype.getAttr('id'));
    });

    // xep-0293
    media += self.RtcpFbFromJingle(desc, '*');

    // xep-0294
    tmp = desc.getChildren('rtp-hdrext','urn:xmpp:jingle:apps:rtp:rtp-hdrext:0');
    tmp.forEach(function (rtphdrext) {
        media += 'a=extmap:' + rtphdrext.getAttr('id') + ' ' + rtphdrext.getAttr('uri') + '\r\n';
    });

    if (content.getChildren('transport', 'urn:xmpp:jingle:transports:ice-udp:1').length) {
        content.getChildren('transport', 'urn:xmpp:jingle:transports:ice-udp:1')[0].getChildren('candidate').forEach(function (candidate) {
            media += SDPUtil.candidateFromJingle(candidate, true);
        });
    }

    desc.getChildren('source', 'urn:xmpp:jingle:apps:rtp:ssma:0').forEach(function (source) {
        var ssrc = source.getAttr('ssrc');
        source.getChildren('parameter').forEach(function (parameter) {
            media += 'a=ssrc:' + ssrc + ' ' + parameter.getAttr('name');
            if (parameter.getAttr('value')) {
                media += ':' + parameter.getAttr('value');
            }
            media += '\r\n';
        });
    });


    desc.getChildren('ssrc-group', 'urn:xmpp:jingle:apps:rtp:ssma:0').forEach(function (ssrcgr) {
        var semantics = ssrcgr.getAttr('semantics');
        media += 'a=ssrc-group:' + semantics;
        ssrcgr.getChildren('source').forEach(function (source) {
            media += ' ' + source.getAttr('ssrc');
        });
        media += '\r\n';
    });

    return media;
    }
}

function createSDP(sdp) {
    return new SDP(sdp);
}

module.exports.createSDP = createSDP;
