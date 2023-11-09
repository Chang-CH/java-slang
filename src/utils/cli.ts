#!/usr/bin/env node

import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';

import JVM from '#jvm/index';
import NodeSystem, { Folder } from '#utils/NodeSystem';
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

  for (const filePath of options['-f']) {
    if (typeof options === 'number') {
      continue;
    }

    // converts nodejs buffer to ArrayBuffer
    const buffer = fs.readFileSync('example/' + filePath + '.class', null);
    const arraybuffer = a2ab(buffer);
    const view = new DataView(arraybuffer);

    if (options['-p']) {
      // Stubs, not used.
      const nativeSystem = new NodeSystem({
        Sample: view,
      });

      const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
      const cls = parseBin(view);
      console.debug(classFileToText(cls));
    }
    folders[filePath] = view;
  }

  const nativeSystem = new NodeSystem(folders);
  const jvm = new JVM(nativeSystem, {
    javaClassPath: 'natives',
    userDir: 'example',
  });
  jvm.initialize();
  // @ts-ignore
  jvm.runClass(options['-f'][0]);
}

main();
