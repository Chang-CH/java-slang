import { CONSTANT_TAG } from '#constants/ClassFile/constants';
import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import { readInstruction } from '#jvm/components/MemoryArea/utils/readInstruction';
import { ClassFile } from '#types/ClassFile';
import { FIELD_FLAGS } from '#types/ClassFile/fields';
import { InstructionType } from '#types/ClassFile/instructions';
import { METHOD_FLAGS } from '#types/ClassFile/methods';
import { read } from 'fs';

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
  result.methods = Object.entries(cls.methods).map(
    ([name, method], index: number) => {
      // @ts-ignore
      const methodname = cls.constant_pool[method.name_index].value;
      // @ts-ignore
      const descriptor = cls.constant_pool[method.descriptor_index].value;
      const attributes = method.attributes.map((attribute: any) => {
        const code = attribute.code as DataView;
        let i = 0;
        const result = [];
        while (i < code.byteLength) {
          const code = readInstruction(attribute.code, i);

          switch (code.opcode) {
            case INSTRUCTION_SET.nop:
            case INSTRUCTION_SET.aconst_null:
            case INSTRUCTION_SET.iconst_m1:
            case INSTRUCTION_SET.iconst_0:
            case INSTRUCTION_SET.iconst_1:
            case INSTRUCTION_SET.iconst_2:
            case INSTRUCTION_SET.iconst_3:
            case INSTRUCTION_SET.iconst_4:
            case INSTRUCTION_SET.iconst_5:
            case INSTRUCTION_SET.lconst_0:
            case INSTRUCTION_SET.lconst_1:
            case INSTRUCTION_SET.fconst_0:
            case INSTRUCTION_SET.fconst_1:
            case INSTRUCTION_SET.fconst_2:
            case INSTRUCTION_SET.dconst_0:
            case INSTRUCTION_SET.dconst_1:
            case INSTRUCTION_SET.iload_0:
            case INSTRUCTION_SET.iload_1:
            case INSTRUCTION_SET.iload_2:
            case INSTRUCTION_SET.iload_3:
            case INSTRUCTION_SET.lload_0:
            case INSTRUCTION_SET.lload_1:
            case INSTRUCTION_SET.lload_2:
            case INSTRUCTION_SET.lload_3:
            case INSTRUCTION_SET.fload_0:
            case INSTRUCTION_SET.fload_1:
            case INSTRUCTION_SET.fload_2:
            case INSTRUCTION_SET.fload_3:
            case INSTRUCTION_SET.dload_0:
            case INSTRUCTION_SET.dload_1:
            case INSTRUCTION_SET.dload_2:
            case INSTRUCTION_SET.dload_3:
            case INSTRUCTION_SET.aload_0:
            case INSTRUCTION_SET.aload_1:
            case INSTRUCTION_SET.aload_2:
            case INSTRUCTION_SET.aload_3:
            case INSTRUCTION_SET.iaload:
            case INSTRUCTION_SET.laload:
            case INSTRUCTION_SET.faload:
            case INSTRUCTION_SET.daload:
            case INSTRUCTION_SET.aaload:
            case INSTRUCTION_SET.baload:
            case INSTRUCTION_SET.caload:
            case INSTRUCTION_SET.saload:
            case INSTRUCTION_SET.istore_0:
            case INSTRUCTION_SET.istore_1:
            case INSTRUCTION_SET.istore_2:
            case INSTRUCTION_SET.istore_3:
            case INSTRUCTION_SET.lstore_0:
            case INSTRUCTION_SET.lstore_1:
            case INSTRUCTION_SET.lstore_2:
            case INSTRUCTION_SET.lstore_3:
            case INSTRUCTION_SET.fstore_0:
            case INSTRUCTION_SET.fstore_1:
            case INSTRUCTION_SET.fstore_2:
            case INSTRUCTION_SET.fstore_3:
            case INSTRUCTION_SET.dstore_0:
            case INSTRUCTION_SET.dstore_1:
            case INSTRUCTION_SET.dstore_2:
            case INSTRUCTION_SET.dstore_3:
            case INSTRUCTION_SET.astore_0:
            case INSTRUCTION_SET.astore_1:
            case INSTRUCTION_SET.astore_2:
            case INSTRUCTION_SET.astore_3:
            case INSTRUCTION_SET.iastore:
            case INSTRUCTION_SET.lastore:
            case INSTRUCTION_SET.fastore:
            case INSTRUCTION_SET.dastore:
            case INSTRUCTION_SET.aastore:
            case INSTRUCTION_SET.bastore:
            case INSTRUCTION_SET.castore:
            case INSTRUCTION_SET.sastore:
            case INSTRUCTION_SET.pop:
            case INSTRUCTION_SET.pop2:
            case INSTRUCTION_SET.dup:
            case INSTRUCTION_SET.dup_x1:
            case INSTRUCTION_SET.dup_x2:
            case INSTRUCTION_SET.dup2:
            case INSTRUCTION_SET.dup2_x1:
            case INSTRUCTION_SET.dup2_x2:
            case INSTRUCTION_SET.swap:
            case INSTRUCTION_SET.iadd:
            case INSTRUCTION_SET.ladd:
            case INSTRUCTION_SET.fadd:
            case INSTRUCTION_SET.dadd:
            case INSTRUCTION_SET.isub:
            case INSTRUCTION_SET.lsub:
            case INSTRUCTION_SET.fsub:
            case INSTRUCTION_SET.dsub:
            case INSTRUCTION_SET.imul:
            case INSTRUCTION_SET.lmul:
            case INSTRUCTION_SET.fmul:
            case INSTRUCTION_SET.dmul:
            case INSTRUCTION_SET.idiv:
            case INSTRUCTION_SET.ldiv:
            case INSTRUCTION_SET.fdiv:
            case INSTRUCTION_SET.ddiv:
            case INSTRUCTION_SET.irem:
            case INSTRUCTION_SET.lrem:
            case INSTRUCTION_SET.frem:
            case INSTRUCTION_SET.drem:
            case INSTRUCTION_SET.ineg:
            case INSTRUCTION_SET.lneg:
            case INSTRUCTION_SET.fneg:
            case INSTRUCTION_SET.dneg:
            case INSTRUCTION_SET.ishl:
            case INSTRUCTION_SET.lshl:
            case INSTRUCTION_SET.ishr:
            case INSTRUCTION_SET.lshr:
            case INSTRUCTION_SET.iushr:
            case INSTRUCTION_SET.lushr:
            case INSTRUCTION_SET.iand:
            case INSTRUCTION_SET.land:
            case INSTRUCTION_SET.ior:
            case INSTRUCTION_SET.lor:
            case INSTRUCTION_SET.ixor:
            case INSTRUCTION_SET.lxor:
            case INSTRUCTION_SET.i2l:
            case INSTRUCTION_SET.i2f:
            case INSTRUCTION_SET.i2d:
            case INSTRUCTION_SET.l2i:
            case INSTRUCTION_SET.l2f:
            case INSTRUCTION_SET.l2d:
            case INSTRUCTION_SET.f2i:
            case INSTRUCTION_SET.f2l:
            case INSTRUCTION_SET.f2d:
            case INSTRUCTION_SET.d2i:
            case INSTRUCTION_SET.d2l:
            case INSTRUCTION_SET.d2f:
            case INSTRUCTION_SET.i2b:
            case INSTRUCTION_SET.i2c:
            case INSTRUCTION_SET.i2s:
            case INSTRUCTION_SET.lcmp:
            case INSTRUCTION_SET.fcmpl:
            case INSTRUCTION_SET.fcmpg:
            case INSTRUCTION_SET.dcmpl:
            case INSTRUCTION_SET.dcmpg:
            case INSTRUCTION_SET.ireturn:
            case INSTRUCTION_SET.lreturn:
            case INSTRUCTION_SET.freturn:
            case INSTRUCTION_SET.dreturn:
            case INSTRUCTION_SET.areturn:
            case INSTRUCTION_SET.return:
            case INSTRUCTION_SET.arraylength:
            case INSTRUCTION_SET.athrow:
            case INSTRUCTION_SET.monitorenter:
            case INSTRUCTION_SET.monitorexit:
            case INSTRUCTION_SET.breakpoint:
            case INSTRUCTION_SET.impdep1:
            case INSTRUCTION_SET.impdep2:
              i += 1;
              break;
            case INSTRUCTION_SET.bipush:
            case INSTRUCTION_SET.ldc:
            case INSTRUCTION_SET.iload:
            case INSTRUCTION_SET.lload:
            case INSTRUCTION_SET.fload:
            case INSTRUCTION_SET.dload:
            case INSTRUCTION_SET.aload:
            case INSTRUCTION_SET.istore:
            case INSTRUCTION_SET.lstore:
            case INSTRUCTION_SET.fstore:
            case INSTRUCTION_SET.dstore:
            case INSTRUCTION_SET.astore:
            case INSTRUCTION_SET.ret:
            case INSTRUCTION_SET.newarray:
              i += 2;
              break;
            case INSTRUCTION_SET.sipush:
            case INSTRUCTION_SET.ldc_w:
            case INSTRUCTION_SET.ldc2_w:
            case INSTRUCTION_SET.iinc:
            case INSTRUCTION_SET.ifeq:
            case INSTRUCTION_SET.ifne:
            case INSTRUCTION_SET.iflt:
            case INSTRUCTION_SET.ifge:
            case INSTRUCTION_SET.ifgt:
            case INSTRUCTION_SET.ifle:
            case INSTRUCTION_SET.if_icmpeq:
            case INSTRUCTION_SET.if_icmpne:
            case INSTRUCTION_SET.if_icmplt:
            case INSTRUCTION_SET.if_icmpge:
            case INSTRUCTION_SET.if_icmpgt:
            case INSTRUCTION_SET.if_icmple:
            case INSTRUCTION_SET.if_acmpeq:
            case INSTRUCTION_SET.if_acmpne:
            case INSTRUCTION_SET.goto:
            case INSTRUCTION_SET.jsr:
            case INSTRUCTION_SET.getstatic:
            case INSTRUCTION_SET.putstatic:
            case INSTRUCTION_SET.getfield:
            case INSTRUCTION_SET.putfield:
            case INSTRUCTION_SET.invokevirtual:
            case INSTRUCTION_SET.invokespecial:
            case INSTRUCTION_SET.invokestatic:
            case INSTRUCTION_SET.new:
            case INSTRUCTION_SET.anewarray:
            case INSTRUCTION_SET.checkcast:
            case INSTRUCTION_SET.instanceof:
            case INSTRUCTION_SET.ifnull:
            case INSTRUCTION_SET.ifnonnull:
              i += 3;
              break;
            case INSTRUCTION_SET.multianewarray:
              i += 4;
              break;
            case INSTRUCTION_SET.invokeinterface:
            case INSTRUCTION_SET.invokedynamic:
            case INSTRUCTION_SET.goto_w:
            case INSTRUCTION_SET.jsr_w:
              i += 5;
              break;
            case INSTRUCTION_SET.wide:
              i += 6;
              break;
            case INSTRUCTION_SET.tableswitch:
            case INSTRUCTION_SET.lookupswitch:
              throw new Error('tableswitch disassembly not implemented');
          }

          result.push(
            `${INSTRUCTION_SET[code.opcode]}`.padEnd(15) +
              ` ${code.operands.join(', ')}`
          );
        }
        return result;
      });
      const flags = method.method_flags;
      return {
        flags,
        methodname,
        descriptor,
        attributes,
      };
    }
  );

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
