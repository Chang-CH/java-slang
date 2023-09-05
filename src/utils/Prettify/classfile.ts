import { CONSTANT_TAG } from '#constants/ClassFile/constants';
import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import { ClassFile } from '#types/ClassFile';
import { FIELD_FLAGS } from '#types/ClassFile/fields';
import { InstructionType } from '#types/ClassFile/instructions';
import { METHOD_FLAGS } from '#types/ClassFile/methods';

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
      return JSON.stringify(resolveReferences(getAllFlags(cls)), null, 2)
        .replaceAll('"', '')
        .replaceAll(',', '');
  }
};

function resolveReferences(cls: any) {
  const result: {
    [key: string]: any;
    methods: any[];
    constant_pool: string[];
  } = {
    magic: cls.magic,
    major_version: cls.major_version,
    minor_version: cls.minor_version,
    constant_pool: [],
    className: cls.this_class,
    superName: cls.super_class,
    methods: [],
  };

  /**
   * Convert constant pool to string
   */
  const textConstantPool = cls.constant_pool.map(
    (constant: any, index: number) => {
      const { tag, ...rest } = constant;
      return (
        `#${index} = ${CONSTANT_TAG[constant.tag]}`.padEnd(40) +
        `${Object.values(rest).join(' ')}`
      );
    }
  );

  /**
   * Convert methods to string
   */
  // result.methods = Object.entries(cls.methods).map(
  //   ([name, method], index: number) => {
  //     // @ts-ignore
  //     const methodname = cls.constant_pool[method.name_index].value;
  //     // @ts-ignore
  //     const descriptor = cls.constant_pool[method.descriptor_index].value;
  //     const attributes = method.attributes.map((attribute: any) => {
  //       return attribute.code
  //         .filter(x => x)
  //         .map(
  //           (code: InstructionType) =>
  //             `${INSTRUCTION_SET[code.opcode]}`.padEnd(15) +
  //             ` ${code.operands.join(', ')}`
  //         );
  //     });
  //     const flags = method.method_flags;
  //     return {
  //       flags,
  //       methodname,
  //       descriptor,
  //       attributes,
  //     };
  //   }
  // );
  result.methods = [];

  result.constant_pool = textConstantPool;

  return result;
}

function getAllFlags(cls: any) {
  for (let index = 0; index < (cls?.fields?.length ?? 0); index++) {
    const field = cls.fields[index];
    const flags = field.access_flags;

    const fieldflags = [];
    if (flags & FIELD_FLAGS.ACC_PUBLIC) fieldflags.push('ACC_PUBLIC');
    if (flags & FIELD_FLAGS.ACC_PRIVATE) fieldflags.push('ACC_PRIVATE');
    if (flags & FIELD_FLAGS.ACC_PROTECTED) fieldflags.push('ACC_PROTECTED');
    if (flags & FIELD_FLAGS.ACC_STATIC) fieldflags.push('ACC_STATIC');
    if (flags & FIELD_FLAGS.ACC_FINAL) fieldflags.push('ACC_FINAL');
    if (flags & FIELD_FLAGS.ACC_VOLATILE) fieldflags.push('ACC_VOLATILE');
    if (flags & FIELD_FLAGS.ACC_TRANSIENT) fieldflags.push('ACC_TRANSIENT');
    if (flags & FIELD_FLAGS.ACC_SYNTHETIC) fieldflags.push('ACC_SYNTHETIC');
    if (flags & FIELD_FLAGS.ACC_ENUM) fieldflags.push('ACC_ENUM');

    // @ts-ignore
    cls.fields[index].field_flags = fieldflags;
  }

  for (const key of Object.keys(cls.methods)) {
    const method = cls.methods[key];
    const flags = method.access_flags;

    const methodflags = [];
    if (flags & METHOD_FLAGS.ACC_PUBLIC) methodflags.push('ACC_PUBLIC');
    if (flags & METHOD_FLAGS.ACC_PRIVATE) methodflags.push('ACC_PRIVATE');
    if (flags & METHOD_FLAGS.ACC_PROTECTED) methodflags.push('ACC_PROTECTED');
    if (flags & METHOD_FLAGS.ACC_STATIC) methodflags.push('ACC_STATIC');
    if (flags & METHOD_FLAGS.ACC_FINAL) methodflags.push('ACC_FINAL');
    if (flags & METHOD_FLAGS.ACC_SYNCHRONIZED)
      methodflags.push('ACC_SYNCHRONIZED');
    if (flags & METHOD_FLAGS.ACC_BRIDGE) methodflags.push('ACC_BRIDGE');
    if (flags & METHOD_FLAGS.ACC_VARARGS) methodflags.push('ACC_VARARGS');
    if (flags & METHOD_FLAGS.ACC_NATIVE) methodflags.push('ACC_NATIVE');
    if (flags & METHOD_FLAGS.ACC_ABSTRACT) methodflags.push('ACC_ABSTRACT');
    if (flags & METHOD_FLAGS.ACC_STRICT) methodflags.push('ACC_STRICT');
    if (flags & METHOD_FLAGS.ACC_SYNTHETIC) methodflags.push('ACC_SYNTHETIC');

    // @ts-ignore
    cls.methods[key].method_flags = methodflags;
  }

  return cls;
}
