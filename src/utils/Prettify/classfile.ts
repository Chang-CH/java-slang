import { CONSTANT_TAG } from '#constants/ClassFile/constants';
import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import { ClassFile } from '#types/ClassFile';
import { InstructionType } from '#types/ClassFile/instructions';

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
      return JSON.stringify(resolveReferences(cls), null, 2).replace('"', '');
  }
};

function resolveReferences(cls: ClassFile) {
  const result: {
    [key: string]: any;
    methods: any[];
    constant_pool: string[];
  } = {
    magic: cls.magic,
    major_version: cls.major_version,
    minor_version: cls.minor_version,
    constant_pool: [],
    classIndex: -1,
    className: '',
    superIndex: -1,
    superName: '',
    methods: [],
  };

  /**
   * Convert constant pool to string
   */
  const textConstantPool = cls.constant_pool.map((constant, index) => {
    const { tag, ...rest } = constant;
    return `#${index} = ${CONSTANT_TAG[constant.tag]}    ${Object.values(
      rest
    ).join(' ')}`;
  });

  /**
   * Resolve classname and superclass name
   */
  result.classIndex = cls.this_class;
  result.className =
    cls.constant_pool[
      // @ts-ignore
      cls.constant_pool[cls.this_class].name_index
      // @ts-ignore
    ].value;
  result.superIndex = cls.super_class;
  result.superName =
    cls.constant_pool[
      // @ts-ignore
      cls.constant_pool[cls.super_class].name_index
      // @ts-ignore
    ].value;

  /**
   * Convert methods to string
   */
  result.methods = cls.methods.map((method, index) => {
    // @ts-ignore
    const methodname = cls.constant_pool[method.name_index].value;
    // @ts-ignore
    const descriptor = cls.constant_pool[method.descriptor_index].value;
    const attributes = method.attributes.map(attribute => {
      return attribute.code.map(
        (code: InstructionType) =>
          `${INSTRUCTION_SET[code.opcode]}    ${code.operands.join(', ')}`
      );
    });
    return {
      methodname,
      descriptor,
      attributes,
    };
  });

  result.constant_pool = textConstantPool;

  return result;
}
