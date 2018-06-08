class FileViewerType {
    public static USER = "user";
    public static ROOM = "room";
}

interface IFileViewer {
    viewerId: string;
    type: FileViewerType;
    contact: any;
}

/**
 * @public
 * @class
 * @name FileViewer
 * @description
 *      This class is used to represent a File Viewer who is the list of persons (individual or a bubble) that can access (download) the file.
 */
class FileViewer implements IFileViewer {
    public viewerId: string;
    public type: FileViewerType;
    public contact: any;
    private _avatarSrc: any;

    /**
     * @this FileViewer
	 */
    constructor(
        viewerId: string,
        type: FileViewerType,
        contact: any,
        private contactService: any = null) {

        /**
	     * @public
         * @property {String} viewerId The id of the viewer
	     * @readonly
	     */
        this.viewerId = viewerId;

        /**
	     * @public
         * @property {string} type The type of viewer: 'user' for a contact or 'room' for a bubble
	     * @readonly
	     */
        this.type = type;

        /**
	     * @public
         * @property {Contact} contact The contact
	     * @readonly
	     */
        this.contact = contact;
    }

    get avatarSrc() {
        if (this.contact) { this._avatarSrc = this.contact.avatar.src; }
        else {
            this._avatarSrc = null;
            this.contactService.getContactByDBId(this.viewerId)
                .then((contact) => { 
                    this.contact = contact;
                    this._avatarSrc = this.contact.avatar.src;
                });
        }
        return this._avatarSrc;
    }
}

function FileViewerFactory() {
    return (data: any): FileViewer[] => {
        let viewers: FileViewer[] = [];
        for (let viewerData of data) {
            viewers.push(new FileViewer(viewerData.viewerId, viewerData.type, viewerData.contact, viewerData.contactService));
        }
        return viewers;
    };
}

function FileViewerElementFactory() {
    return (viewerId, type, contact, contactService): FileViewer => {
        return new FileViewer(viewerId, type, contact, contactService);
    };
}

module.exports = FileViewer;