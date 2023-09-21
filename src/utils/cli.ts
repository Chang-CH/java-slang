#!/usr/bin/env node

import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';

import JVM from '#jvm/index';
import JsSystem, { Folder } from '#utils/JsSystem';
import { classFileToText } from '#utils/Prettify/classfile';
import parseBin, { a2ab } from '#utils/parseBinary';
import * as fs from 'node:fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

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
      const nativeSystem = new JsSystem({
        Sample: view,
      });

      const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
      const cls = parseBin(view);
      console.debug(classFileToText(cls));
    }
    folders[fileName] = view;
  }

  const nativeSystem = new JsSystem(folders);
  const jvm = new JVM(nativeSystem);
  // @ts-ignore
  jvm.runClass(options['-f'][0]);
}

main();
