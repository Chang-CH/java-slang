#!/usr/bin/env node

import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import { JNI } from '#jvm/components/JNI';
import MemoryArea from '#jvm/components/MemoryArea';
import JVM from '#jvm/index';
import OsInterface, { Folder } from '#utils/OsInterface';
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
      describe: 'files to include',
      type: 'array',
      demandOption: true,
    })
    .option('-p', {
      alias: 'disassemble',
      describe: 'show class file data',
      type: 'boolean',
      demandOption: false,
    })
    .option('nowarn', {
      alias: 'nowarn',
      describe: 'hides warning messages',
      type: 'boolean',
      demandOption: false,
    })
    .option('nodebug', {
      alias: 'nodebug',
      describe: 'hides debug messages',
      type: 'boolean',
      demandOption: false,
    })
    .help()
    .parseSync();

  if (options['nowarn']) {
    console.warn = () => {};
  }

  if (options['nodebug']) {
    console.debug = () => {};
  }

  const folders: Folder = {};

  for (const fileName of options['-f']) {
    if (typeof options === 'number') {
      continue;
    }

    // converts nodejs buffer to ArrayBuffer
    const buffer = fs.readFileSync(fileName, null);
    const arraybuffer = a2ab(buffer);
    const view = new DataView(arraybuffer);

    if (options['-p']) {
      // Stubs, not used.
      const memory = new MemoryArea(new JNI());
      const os = new OsInterface({
        Sample: view,
      });

      const bscl = new BootstrapClassLoader(memory, os);
      const cls = bscl.readClass(view);
      console.debug(classFileToText(cls));
    }
    folders[fileName] = view;
  }

  const os = new OsInterface(folders);
  const jvm = new JVM(os);
  // @ts-ignore
  jvm.runClass(options['-f'][0]);
}

main();
