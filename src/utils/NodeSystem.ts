import { ClassFile } from '#jvm/external/ClassFile/types';
import parseBin, { a2ab } from '#utils/parseBinary';
import * as fs from 'node:fs';
import AbstractSystem from './AbstractSystem';

export interface Folder {
  [name: string]: Folder | DataView;
}

export default class NodeSystem extends AbstractSystem {
  private files: Folder;

  constructor(initialFiles: Folder) {
    super();
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

    let currentFolder: any = this.files;
    for (const folderName of pathArray) {
      // @ts-ignore
      if (!currentFolder[folderName]) {
        // throw new Error(`File not found: ${pathArray.join('/')}`);
        currentFolder = currentFolder[folderName];
        break;
      }
      // @ts-ignore
      currentFolder = currentFolder[folderName];
    }

    if (currentFolder instanceof DataView) {
      return parseBin(currentFolder);
    }

    if (currentFolder) {
      return currentFolder;
    }

    // converts nodejs buffer to ArrayBuffer
    const buffer = fs.readFileSync(path + '.class', null);
    const arraybuffer = a2ab(buffer);
    const view = new DataView(arraybuffer);
    const res = parseBin(view);
    if (res) {
      return res;
    }

    throw new Error('File is not a class file');
  }

  stdout(message: string): void {
    console.log('\x1b[32m' + message + '\x1b[0m');
  }

  stderr(message: string): void {
    console.error('\x1b[31m' + message + '\x1b[0m');
  }
}
