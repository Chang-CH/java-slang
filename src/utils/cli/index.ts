#!/usr/bin/env node

import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import { classFileToText } from '#utils/Prettify/classfile';
import * as fs from 'node:fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * Converts a NodeJS Buffer to an ArrayBuffer
 *
 * @param buffer nodejs buffer
 * @returns ArrayBuffer equivalent
 */
export function a2ab(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

export default function main() {
  /**
   * Get options
   */
  const options = yargs(hideBin(process.argv))
    .usage('$0 <cmd> [args]')
    .option('-f', {
      alias: 'files',
      describe: 'jsjvm-cli files to include',
      type: 'array',
      demandOption: true,
    })
    .option('-p', {
      alias: 'disassemble',
      describe: 'show class file data',
      type: 'boolean',
      demandOption: false,
    })
    .help()
    .parseSync();

  for (const fileName of options['-f']) {
    if (typeof options === 'number') {
      continue;
    }

    // converts nodejs buffer to ArrayBuffer
    const buffer = fs.readFileSync(fileName, null);
    const arraybuffer = a2ab(buffer);
    const view = new DataView(arraybuffer);

    if (options['-p']) {
      const bscl = new BootstrapClassLoader();
      const cls = bscl.readClass(view);
      console.log(classFileToText(cls));
    }
  }
}

main();
