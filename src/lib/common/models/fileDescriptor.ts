"use strict";
export {};

declare var config: any;
declare var MD5: any;

class FileState {
    public static DELETED = "deleted";
    public static UPLOADING = "uploading";
    public static UPLOADED = "uploaded";
    public static NOT_UPLOADED = "not_uploaded";
    public static DOWNLOADING = "downloading";
    public static UNKNOWN = "unknown";
}

class ThumbnailPlaceholder {
    constructor(public icon: string, public style: string) { }
}

interface IThumbnail {
    availableThumbnail: boolean;
    md5sum: string;
    size: number;
    wantThumbnailDate: Date;

    isThumbnailAvailable(): boolean;
}

class Thumbnail implements IThumbnail {
    availableThumbnail: boolean;
    md5sum: string;
    size: number;
    wantThumbnailDate: Date;

    /**
     * @this FileDescriptor
     */
    constructor(data: any) {
        if (data) {
            this.availableThumbnail = data.availableThumbnail;
            this.md5sum = data.md5sum;
            this.size = data.size;
            this.wantThumbnailDate = data.wantThumbnailDate;
        } else {
            this.availableThumbnail = false;
        }
    }

    public isThumbnailAvailable(): boolean {
        return this.availableThumbnail;
    };
}

interface IFileDescriptor {
    id: string;
    url: string;
    ownerId: string;
    fileName: string;
    extension: string;
    typeMIME: string;
    size: number;
    registrationDate: Date;
    uploadedDate: Date;
    viewers: any[];
    state: FileState;
    // @ts-ignore
    fileToSend: any;
    //fileToSend: File;
    // @ts-ignore
    //previewBlob: Blob;
    previewBlob: any;

    // Download information Part :
    chunkTotalNumber: number;
    chunkPerformed: number;
    chunkPerformedPercent: number;

    // Thumbnail:
    thumbnail: IThumbnail;
    thumbnailPlaceholder: ThumbnailPlaceholder;
    //EXIF data:
    orientation: number;

    isThumbnailPossible(): boolean;
    isImage(): boolean;
    isUploaded(): boolean;
    isAlreadyFileViewer(viewerId: string): boolean;
    getDisplayName(): string;
    getDisplayNameTruncated(): String[];
    getExtension(): string;
}

/**
 * @public
 * @class
 * @name FileDescriptor
 * @description
 *      This class is used to represent a File Descriptor or a Short File Descriptor which describes a file shared in a conversation (one-to-one or bubble).
 */
class FileDescriptor implements IFileDescriptor {

    id: string;
    url: string;
    ownerId: string;
    fileName: string;
    extension: string;
    typeMIME: string;

    size: number;
    registrationDate: Date;
    uploadedDate: Date;
    viewers: any[];
    dateToSort: Date;
    state: FileState;
    // @ts-ignore
//    fileToSend: File;
    fileToSend: any;
    // @ts-ignore
  //  previewBlob: Blob;
    previewBlob: any;

    // Download information Part :
    chunkTotalNumber: number;
    chunkPerformed: number;
    chunkPerformedPercent: number;

    // Thumbnail:
    thumbnail: IThumbnail;
    thumbnailPlaceholder: ThumbnailPlaceholder;
    //EXIF data:
    orientation: number;

    /**
     * @this FileDescriptor
     */
    constructor(
        id: string = null,
        url: string = null,
        ownerId: string = null,
        fileName: string = null,
        extension: string = null,
        typeMIME: string = null,
        size: number = null,
        registrationDate: Date = null,
        uploadedDate: Date = null,
        dateToSort: Date = null,
        viewers = null,
        state: FileState = null,
        thumbnail: IThumbnail = null,
        orientation: number) {

        /**
         * @public
         * @property {string} id The file descriptor ID (File Descriptor only)
         * @readonly
         */
        this.id = id;

        /**
         * @public
         * @property {string} url The file descriptor url (File Descriptor only)
         * @readonly
         */
        this.url = url;

        /**
         * @public
         * @property {string} ownerId The ID of the owner (File Descriptor only)
         * @readonly
         */
        this.ownerId = ownerId;

        /**
         * @public
         * @property {string} fileName The name of the file
         * @readonly
         */
        this.fileName = fileName;

        /**
         * @public
         * @property {string} extension The extension of the file
         * @readonly
         */
        this.extension = extension;

        /**
         * @public
         * @property {string} typeMIME The mime type of the file ('mime' in Short File Descriptor)
         * @readonly
         */
        this.typeMIME = typeMIME;

        /**
         * @public
         * @property {ThumbnailPlaceholder} thumbnailPlaceholder The thumbnail icon placeholder info
         * @readonly
         */
        this.thumbnailPlaceholder = this.getThumbnailPlaceholderFromMimetype(typeMIME);

        /**
         * @public
         * @property {string} size The size of the file (octets)
         * @readonly
         */
        this.size = size;

        /**
         * @public
         * @property {Object} registrationDate The creation date (File Descriptor only)
         * @readonly
         */
        this.registrationDate = registrationDate;

        /**
         * @public
         * @property {Object} uploadedDate The upload date (File Descriptor only)
         * @readonly
         */
        this.uploadedDate = uploadedDate;

        /**
         * @private
         * @property {Object} dateToSort The date to sort (?)
         * @readonly
         */
        this.dateToSort = dateToSort;

        /**
         * @public
         * @property {any[]} viewers The list of viewers (File Descriptor only)
         * @readonly
         */
        this.viewers = viewers;

        this.state = state;

        this.thumbnail = new Thumbnail(thumbnail);

        this.fileToSend = undefined;
        this.previewBlob = undefined;

        /**
         * @public
         * @property {number} orientation
         * @description
         *      There are four possible values for orientation and the image should be rotated acording to this value.
         *      1 -> rotate(0deg),
         *      3 -> rotate(180deg),
         *      6 -> rotate(90deg),
         *      8 -> rotate(270deg).
         */
        this.orientation = orientation ? orientation : undefined;
    };

    public isMicrosoftFile(): boolean {
        let mediaExtension: string[] = ["docx", "doc", "ppt", "pptx", "xls", "xlsx"];
        return (mediaExtension.some((ext) => ext === this.extension));
    };

    public isThumbnailPossible(): boolean {
        return (this.isImage() || this.isPDF() );
    };

    public isPDF(): boolean {
        return (this.typeMIME === "application/pdf");
    };

    public isImage(): boolean {
        let imgType = "image/";
        return this.typeMIME && this.typeMIME.length >= imgType.length && this.typeMIME.slice(0, imgType.length) === imgType;
    };

    public isAudioVideo(): boolean {
        let mediaExtension: string[] = ["avi", "mpg", "wma", "mp3", "wmv", "mkv", "mov", "wav", "ogg", "mp4", "aac"];
        return (mediaExtension.some((ext) => ext === this.extension));
    };

    public isUploaded(): boolean {
        let imgType = "image/";
        return this.state && this.state === FileState.UPLOADED;
    };

    public isAlreadyFileViewer(viewerId: string): boolean {
        if (this.ownerId && this.ownerId === viewerId) {
            // We are owner of this file
            return true;
        }
        if (this.viewers) {
            return this.viewers.some((viewer) => viewer.viewerId === viewerId);
        }
        return false;
    }

    public getDisplayName(): string {
        return this.fileName.replace(/\.[^/.]+$/, "");
    }

    public getDisplayNameTruncated(): String[] {
        var str = this.fileName.replace(/\.[^/.]+$/, "");
        return [str.substring(0, str.length - 4), str.slice(-4)];
    }

    public getExtension(): string {
        if (this.fileName.toUpperCase() === this.extension.toUpperCase()) {
            return "";
        }
        else {
            return "." + this.extension;
        }
    }

    private getThumbnailPlaceholderFromMimetype(mime: string): ThumbnailPlaceholder {
        if (!mime) {
            return new ThumbnailPlaceholder('icon_filestandard', 'otherStyle');
        }

        if (mime.indexOf("image") === 0) {
            return new ThumbnailPlaceholder('icon_image', 'imageStyle');
        }

        if (mime === "application/msword" ||
            (/^application\/vnd.openxmlformats-officedocument.wordprocessingml.*$/.test(mime)) ||
            mime === "application/vnd.oasis.opendocument.text") {
            return new ThumbnailPlaceholder('icon_doc', 'docStyle');
        }

        if (/^application\/vnd.ms-powerpoint.*$/.test(mime) ||
            (/^application\/vnd.openxmlformats-officedocument.presentationml.*$/.test(mime)) ||
            mime === "application/vnd.oasis.opendocument.presentation") {
            return new ThumbnailPlaceholder('icon_ppt', 'pptStyle');
        }

        if (mime.indexOf("application/vnd.ms-excel") === 0 ||
            (/^application\/vnd.openxmlformats-officedocument.spreadsheetml.*$/.test(mime))) {
            return new ThumbnailPlaceholder('icon_xls', 'xlsStyle');
        }

        if (mime === "application/pdf" || mime === "application/vnd.oasis.opendocument.spreadsheet") {
            return new ThumbnailPlaceholder('icon_pdf', 'pdfStyle');
        }

        if (mime.indexOf("video/") === 0 || mime.indexOf("audio/") === 0) {
            return new ThumbnailPlaceholder('icon_file-video', 'imageStyle');
        }

        return new ThumbnailPlaceholder('icon_filestandard', 'otherStyle');
    };
}

function FileDescriptorFactory() {
    return (id, url, ownerId, fileName, extension, typeMIME,
            size, registrationDate, uploadedDate, dateToSort, viewers, state, thumbnail, orientation): FileDescriptor => {
        return new FileDescriptor(id, url, ownerId, fileName, extension, typeMIME,
            size, registrationDate, uploadedDate, dateToSort, viewers, state, thumbnail, orientation);
    };
}

module.exports.fileDescriptorFactory = FileDescriptorFactory;
export {FileDescriptorFactory as fileDescriptorFactory, FileDescriptor};
