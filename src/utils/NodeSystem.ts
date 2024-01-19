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
