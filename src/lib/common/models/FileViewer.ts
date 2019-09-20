"use strict";
export {};

let FileViewerType = {
    "USER" : "user",
    "ROOM" : "room"
};

/*
interface IFileViewer {
    viewerId: string;
    type: FileViewerType;
    contact: any;
}
// */
/**
 * @public
 * @class
 * @name FileViewer
 * @description
 *      This class is used to represent a File Viewer who is the list of persons (individual or a bubble) that can access (download) the file.
 */
class FileViewer /* implements IFileViewer */{
	public contactService: any;
	public viewerId: any;
	public type: any;
	public contact: any;
	public _avatarSrc: any;

/*    public viewerId: string;
    public type: FileViewerType;
    public contact: any;
    private _avatarSrc: any;
*/
    /**
     * @this FileViewer
	 */
    constructor(
        viewerId/*: string */,
        type/*: FileViewerType */,
        contact/*: any */,
        _contactService/*: any = null*/) {
        this.contactService = _contactService;
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

        this._avatarSrc = null;
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

/*
function FileViewerFactory() {
    return (data: any): FileViewer[] => {
        let viewers: FileViewer[] = [];
        for (let viewerData of data) {
            viewers.push(new FileViewer(viewerData.viewerId, viewerData.type, viewerData.contact, viewerData.contactService));
        }
        return viewers;
    };
}
// */

function FileViewerElementFactory(viewerId, type, contact, contactService) {
    //return (viewerId, type, contact, contactService): FileViewer => {
        return new FileViewer(viewerId, type, contact, contactService);
    //};
}

module.exports.FileViewer = FileViewer;
module.exports.FileViewerElementFactory = FileViewerElementFactory;
export {FileViewerElementFactory, FileViewer};