#!/usr/bin/env node

import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import { classFileToText } from '#utils/Prettify/classfile';
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

    const data = fs.readFileSync(fileName, null);
    const view = new DataView(data.buffer);

    if (options['-p']) {
      const bscl = new BootstrapClassLoader();
      const cls = bscl.parseClass(view);
      console.log(classFileToText(cls));
    }
  }
}

main();
