import * as fs from 'fs';
import * as path from 'path';
//import * as mime from 'mime';
import mime from 'mime';
class FileInfo {
    public path?: string;
    public buffer?: Buffer;
    public stream?: any;
    public name: string;
    public type: string;
    public size?: number;
    public lastModifiedDate?: Date;
    public stat?: fs.Stats;
    public jsdom?: boolean;
    public async?: boolean;

    constructor(input: string | { [key: string]: any }) {
        if (typeof input === 'string') {
            this.path = input;
        } else {
            Object.keys(input).forEach((k) => {
                (this as any)[k] = input[k];
            });
        }

        this.name = this.name || path.basename(this.path || '');
        if (!this.name) {
            throw new Error('No name');
        }
        this.type = this.type || mime.getType(this.name) || '';

        if (!this.path) {
            if (this.buffer) {
                this.size = this.buffer.length;
            } else if (!this.stream) {
                throw new Error('No input, nor stream, nor buffer.');
            }
            return;
        }

        if (!this.jsdom) {
            return;
        }

        if (!this.async) {
            this.updateStat(fs.statSync(this.path));
        } else {
            fs.stat(this.path, (err, stat) => {
                if (err) {
                    throw err;
                }
                this.updateStat(stat);
            });
        }
    }

    private updateStat(stat: fs.Stats): void {
        this.stat = stat;
        this.lastModifiedDate = this.stat.mtime;
        this.size = this.stat.size;
    }
}

export default FileInfo;
export {FileInfo as FileInfo};
module.exports.FileInfo = FileInfo;
