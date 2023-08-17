
export interface Folder {
    [name: string]: Folder | DataView;
}
/**
 * Acts as a mockup for OS interactions needed by the JVM.
 */
export default class OsContext {
    files: Folder;

    constructor(initialFiles: Folder) {
        this.files = initialFiles;
    }
    
    readFile(path: string[]): DataView {
        throw new Error("OsContext: Not implemented");
    }
}