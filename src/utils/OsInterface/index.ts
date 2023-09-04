export interface Folder {
  [name: string]: Folder | DataView;
}

/**
 * Acts as a mockup for OS interactions needed by the JVM.
 */
export default class OsInterface {
  files: Folder;

  constructor(initialFiles: Folder) {
    this.files = initialFiles;
  }

  readFile(path: string[]): DataView {
    let currentFolder: Folder | DataView = this.files;
    for (const folderName of path) {
      // @ts-ignore
      if (!currentFolder[folderName]) {
        throw new Error(`File not found: ${path.join('/')}`);
      }
      // @ts-ignore
      currentFolder = currentFolder[folderName];
    }
    // @ts-ignore
    return currentFolder;
  }
}
