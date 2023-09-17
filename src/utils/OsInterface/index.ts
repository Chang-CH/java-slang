import { ClassFile } from '#jvm/external/ClassFile/types';
import parseBin, { a2ab } from '#utils/parseBinary';
import * as fs from 'node:fs';

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

  readFile(path: string): ClassFile {
    // TODO: remove hardcoded natives path
    if (path.startsWith('natives')) {
      // converts nodejs buffer to ArrayBuffer
      const buffer = fs.readFileSync(path + '.class', null);
      const arraybuffer = a2ab(buffer);
      const view = new DataView(arraybuffer);
      const res = parseBin(view);
      return res;
    }

    const pathArray = [path];

    let currentFolder: Folder | DataView = this.files;
    for (const folderName of pathArray) {
      // @ts-ignore
      if (!currentFolder[folderName]) {
        throw new Error(`File not found: ${pathArray.join('/')}`);
      }
      // @ts-ignore
      currentFolder = currentFolder[folderName];
    }

    if (currentFolder instanceof DataView) {
      return parseBin(currentFolder);
    }

    throw new Error('File is not a class file');
  }
}
