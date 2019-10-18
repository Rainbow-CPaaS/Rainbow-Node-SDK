"use strict";


// @ts-ignore
class SDPUtil {
    constructor() {
    }

    iceparams (mediadesc, sessiondesc) {
        var data = null;
        if (this.find_line(mediadesc, 'a=ice-ufrag:', sessiondesc) &&
            this.find_line(mediadesc, 'a=ice-pwd:', sessiondesc)) {
            data = {
                ufrag: this.parse_iceufrag(this.find_line(mediadesc, 'a=ice-ufrag:', sessiondesc)),
                pwd: this.parse_icepwd(this.find_line(mediadesc, 'a=ice-pwd:', sessiondesc))
            };
        }
        return data;
    }

    parse_iceufrag(line) {
        return line.substring(12);
    }

    build_iceufrag(frag) {
        return 'a=ice-ufrag:' + frag;
    }

    parse_icepwd(line) {
        return line.substring(10);
    }

    build_icepwd(pwd) {
        return 'a=ice-pwd:' + pwd;
    }

    parse_mid(line) {
        return line.substring(6);
    }

    parse_mline(line) {
        var parts = line.substring(2).split(' '),
        data :any = {};
        data.media = parts.shift();
        data.port = parts.shift();
        data.proto = parts.shift();
        if (parts[parts.length - 1] === '') { // trailing whitespace
            parts.pop();
        }
        data.fmt = parts;
        return data;
    }

    build_mline(mline) {
        return 'm=' + mline.media + ' ' + mline.port + ' ' + mline.proto + ' ' + mline.fmt.join(' ');
    }

    parse_rtpmap(line) {
        var parts = line.substring(9).split(' '),
            data : any = {};
        data.id = parts.shift();
        parts = parts[0].split('/');
        data.name = parts.shift();
        data.clockrate = parts.shift();
        data.channels = parts.length ? parts.shift() : '1';
        return data;
    }

    build_rtpmap(el) {
        var line = 'a=rtpmap:' + el.getAttr('id') + ' ' + el.getAttr('name') + '/' + el.getAttr('clockrate');
        if (el.getAttr('channels') && el.getAttr('channels') != '1') {
            line += '/' + el.getAttr('channels');
        }
        return line;
    }

    parse_crypto(line) {
        var parts = line.substring(9).split(' '),
        data : any = {};
        data.tag = parts.shift();
        data['crypto-suite'] = parts.shift();
        data['key-params'] = parts.shift();
        if (parts.length) {
            data['session-params'] = parts.join(' ');
        }
        return data;
    }

    parse_fingerprint(line) { // RFC 4572
        var parts = line.substring(14).split(' '),
        data :any = {};
        data.hash = parts.shift();
        data.fingerprint = parts.shift();
        // TODO assert that fingerprint satisfies 2UHEX *(":" 2UHEX) ?
        return data;
    }

    parse_fmtp(line) {
        var parts = line.split(' '),
            i, key, value,
            data : any = [];
        parts.shift();
        parts = parts.join(' ').split(';');
        for (i = 0; i < parts.length; i++) {
            key = parts[i].split('=')[0];
            while (key.length && key[0] == ' ') {
                key = key.substring(1);
            }
            value = parts[i].split('=')[1];
            if (key && value) {
                data.push({name: key, value: value});
            } else if (key) {
                // rfc 4733 (DTMF) style stuff
                data.push({name: '', value: key});
            }
        }
        return data;
    }

    parse_icecandidate(line) {
        //console.log('jingle.sdp.parse_icecandidate ' + line );
        let candidate : any = {},
            elems = line.split(" ");
        candidate.foundation = Number(elems[0].substring(12));
        candidate.component = Number(elems[1]);
        candidate.protocol = elems[2].toLowerCase();
        candidate.priority = Number (elems[3]);
        candidate.ip = elems[4];
        candidate.address = candidate.ip; // VBE Added
        candidate.sdpMid = null;
        candidate.sdpMLineIndex = 0;
        candidate.port = Number (elems[5]);
        // elems[6] => "typ"
        candidate.type = elems[7];
        candidate.tcpType = candidate.type; // VBE Added
        candidate.generation = Number(0); // default value, may be overwritten below
        for (var i = 8; i < elems.length; i += 2) {
            switch (elems[i]) {
            case 'raddr':
                candidate['rel-addr'] = elems[i + 1];
                candidate["relatedAddress"] = elems[i + 1];
                break;
            case 'rport':
                candidate['rel-port'] = Number(elems[i + 1]);
                candidate["relatedPort"] = Number(elems[i + 1]);
                break;
            case 'generation':
                candidate.generation = Number (elems[i + 1]);
                break;
            case 'tcptype':
                candidate.tcptype = elems[i + 1];
                break;
            default: // TODO
                //console.log('parse_icecandidate not translating "' + elems[i] + '" = "' + elems[i + 1] + '"');
            }
        }
        candidate.network = 1;
        let idStr= Math.random().toString(36).substr(2, 10);
        candidate.id = Number(idStr); // not applicable to SDP -- FIXME: should be unique, not just random
        return candidate;
    }

    build_icecandidate(cand) {
        var line = ['a=candidate:' + cand.foundation, cand.component, cand.protocol, cand.priority, cand.ip, cand.port, 'typ', cand.type].join(' ');
        line += ' ';
        switch (cand.type) {
        case 'srflx':
        case 'prflx':
        case 'relay':
            if (cand.hasOwnAttribute('rel-addr') && cand.hasOwnAttribute('rel-port')) {
                line += 'raddr';
                line += ' ';
                line += cand['rel-addr'];
                line += ' ';
                line += 'rport';
                line += ' ';
                line += cand['rel-port'];
                line += ' ';
            }
            break;
        }
        if (cand.hasOwnAttribute('tcptype')) {
            line += 'tcptype';
            line += ' ';
            line += cand.tcptype;
            line += ' ';
        }
        line += 'generation';
        line += ' ';
        line += cand.hasOwnAttribute('generation') ? cand.generation : '0';
        //console.log('jingle.sdp.build_icecandidate ' + line );
        return line;
    }

    parse_ssrc(desc) {
        // proprietary mapping of a=ssrc lines
        // TODO: see "Jingle RTP Source Description" by Juberti and P. Thatcher on google docs
        // and parse according to that
        var lines = desc.split('\r\n'),
            data = {};
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].substring(0, 7) == 'a=ssrc:') {
                var idx = lines[i].indexOf(' ');
                data[lines[i].substr(idx + 1).split(':', 2)[0]] = lines[i].substr(idx + 1).split(':', 2)[1];
            }
        }
        return data;
    }

    parse_rtcpfb(line) {
        var parts = line.substr(10).split(' ');
        var data : any = {};
        data.pt = parts.shift();
        data.type = parts.shift();
        data.params = parts;
        return data;
    }

    parse_extmap(line) {
        var parts = line.substr(9).split(' ');
        var data : any  = {};
        data.value = parts.shift();
        if (data.value.indexOf('/') != -1) {
            data.direction = data.value.substr(data.value.indexOf('/') + 1);
            data.value = data.value.substr(0, data.value.indexOf('/'));
        } else {
            data.direction = 'both';
        }
        data.uri = parts.shift();
        data.params = parts;
        return data;
    }

    find_line(haystack, needle, sessionpart) {
        var lines = haystack.split('\r\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].substring(0, needle.length) == needle) {
                return lines[i];
            }
        }
        if (!sessionpart) {
            return false;
        }
        // search session part
        lines = sessionpart.split('\r\n');
        for (var j = 0; j < lines.length; j++) {
            if (lines[j].substring(0, needle.length) == needle) {
                return lines[j];
            }
        }
        return false;
    }

    find_lines(haystack, needle, sessionpart) {
        var lines = haystack.split('\r\n'),
            needles = [];
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].substring(0, needle.length) == needle)
                needles.push(lines[i]);
        }
        if (needles.length || !sessionpart) {
            return needles;
        }
        // search session part
        lines = sessionpart.split('\r\n');
        for (var j = 0; j < lines.length; j++) {
            if (lines[j].substring(0, needle.length) == needle) {
                needles.push(lines[j]);
            }
        }
        return needles;
    }

    candidateToJingle(line) {
        if (line.indexOf('candidate:') === 0) {
            line = 'a=' + line;
        } else if (line.substring(0, 12) != 'a=candidate:') {
			//console.log('parseCandidate called with a line that is not a candidate line');
            //console.log(line);
            return null;
        }
        if (line.substring(line.length - 2) == '\r\n') // chomp it
            line = line.substring(0, line.length - 2);
        var candidate  : any = {},
            elems = line.split(' '),
            i;
        if (elems[6] != 'typ') {
            //console.log('did not find typ in the right place');
            //console.log(line);
            return null;
        }
        candidate.foundation = elems[0].substring(12);
        candidate.component = elems[1];
        candidate.protocol = elems[2].toLowerCase();
        candidate.priority = elems[3];
        candidate.ip = elems[4];
        candidate.port = elems[5];
        // elems[6] => "typ"
        candidate.type = elems[7];
        candidate.generation = '0';

        for (i = 8; i < elems.length; i += 2) {
            switch (elems[i]) {
            case 'raddr':
                candidate['rel-addr'] = elems[i + 1];
                break;
            case 'rport':
                candidate['rel-port'] = elems[i + 1];
                break;
            case 'generation':
                candidate.generation = elems[i + 1];
                break;
            case 'tcptype':
                candidate.tcptype = elems[i + 1];
                break;
            default: // TODO
                //console.log('not translating "' + elems[i] + '" = "' + elems[i + 1] + '"');
            }
        }
        candidate.network = '1';
        candidate.id = Math.random().toString(36).substr(2, 10); // not applicable to SDP -- FIXME: should be unique, not just random
        return candidate;
    }


    candidateFromJingle(cand, newstr) {
        let parts = [
            'a=candidate:' + cand.getAttr('foundation'),
            cand.getAttr('component'),
            cand.getAttr('protocol'),
            cand.getAttr('priority'),
            cand.getAttr('ip'),
            cand.getAttr('port'),
            'typ',
            cand.getAttr('type')
        ];
        switch (cand.getAttr('type')) {
        case 'srflx':
        case 'prflx':
        case 'relay':
            if (cand.getAttr('rel-addr') && cand.getAttr('rel-port')) {
                parts.push('raddr');
                parts.push(cand.getAttr('rel-addr'));
                parts.push('rport');
                parts.push(cand.getAttr('rel-port'));
            }
            break;
        }
        parts.push('generation');
        parts.push(cand.getAttr('generation') || '0');

        if (newstr) {
            return parts.join(' ') + '\r\n';
        } else {
            return parts.join(' ');
        }

    } // */
    candidateFromJingle2 (cand, ufrag, pwd) {
        var parts = [
            'a=candidate:' + cand.getAttr('foundation'),
            cand.getAttr('component'),
            cand.getAttr('protocol'),
            cand.getAttr('priority'),
            cand.getAttr('ip'),
            cand.getAttr('port'),
            'typ',
            cand.getAttr('type')
        ];
        switch (cand.getAttr('type')) {
            case 'srflx':
            case 'prflx':
            case 'relay':
                if (cand.getAttr('rel-addr') && cand.getAttr('rel-port')) {
                    parts.push('raddr');
                    parts.push(cand.getAttr('rel-addr'));
                    parts.push('rport');
                    parts.push(cand.getAttr('rel-port'));
                }
                break;
        }
        parts.push('generation');
        parts.push(cand.getAttr('generation') || '0');

        if (cand.getAttr('network')) {
            parts.push('network-id');
            parts.push(cand.getAttr('network'));
        }

        if (cand.getAttr('cost')) {
            parts.push('network-cost');
            parts.push(cand.getAttr('cost'));
        }

        if (ufrag) {
            parts.push('ufrag');
            parts.push(ufrag);
        }

        if (pwd) {
            parts.push('pwd');
            parts.push(pwd);
        }

        return parts.join(' ') + '\r\n';
    }
}

function createSDPUtil() {
    return new SDPUtil();
}

module.exports.createSDPUtil = createSDPUtil;
export {createSDPUtil, SDPUtil};
