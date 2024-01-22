import { ClassFile } from '#jvm/external/ClassFile/types';
import parseBin, { a2ab } from '#utils/parseBinary';
import * as fs from 'node:fs';
import AbstractSystem from './AbstractSystem';

export interface Folder {
  [name: string]: Folder | DataView;
}

export default class NodeSystem extends AbstractSystem {
  private files: Folder;
  private stdoutBuffer: string = '';
  private stderrBuffer: string = '';

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
    if (message.endsWith('\n')) {
      console.log(
        '\x1b[32m' + this.stdoutBuffer + message.slice(0, -1) + '\x1b[0m'
      );
      this.stdoutBuffer = '';
      return;
    }

    this.stdoutBuffer += message;
  }

  stderr(message: string): void {
    if (message.endsWith('\n')) {
      console.log(
        '\x1b[31m' + this.stderrBuffer + message.slice(0, -1) + '\x1b[0m'
      );
      this.stderrBuffer = '';
      return;
    }

    this.stderrBuffer += message;
  }
}
