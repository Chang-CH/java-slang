import { ClassFile } from '#types/ClassFile';

/**
 * Parses the class file to replace references with actual values.
 * TODO: replicate javap -v output
 *
 * @param cls classfile object output during bscl parse stage
 * @returns stringified classfile
 */
export const classFileToText = (
  cls: ClassFile,
  format: 'raw' | 'verbose' | 'simplified' = 'raw'
) => {
  switch (format) {
    case 'verbose':
      console.warn("jvm-slang doesn't support verbose classfile output yet");
      return JSON.stringify(cls, null, 2);
    case 'simplified':
      const result: any = {};
      for (let i = 0; i < result.constant_pool.length; i += 1) {
        result.constant_pool[i].index = i;
      }

      for (const method of result.methods) {
        method.name = result.constant_pool[method.name_index].value;
      }
      console.warn("jvm-slang doesn't support simplified classfile output yet");
      return JSON.stringify(cls, null, 2);
    default:
      return JSON.stringify(cls, null, 2);
  }
};
