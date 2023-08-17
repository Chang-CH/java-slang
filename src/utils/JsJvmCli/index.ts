#!/usr/bin/env node

import * as fs from 'node:fs';
import yargs from 'yargs';

export default function main() {
  /**
   * Get options
   */
  const options = yargs
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

    console.log(fileName);

    const data = fs.readFileSync(fileName, null);
    const view = new DataView(data.buffer);
    console.log(`magic: ${view.getUint32(0)}`);
  }
}

main();
