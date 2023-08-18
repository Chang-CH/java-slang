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
    throw new Error('OsInterface: Not implemented');
  }
}
