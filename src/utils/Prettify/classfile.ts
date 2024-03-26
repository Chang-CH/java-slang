import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { ClassFile } from '#jvm/external/ClassFile/types';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { FIELD_FLAGS } from '#jvm/external/ClassFile/types/fields';
import { METHOD_FLAGS } from '#jvm/external/ClassFile/types/methods';
import { readInstruction } from '#utils/parseBinary/utils/readInstruction';
import { logger } from '..';

/**
 * Parses the class file to replace references with actual values.
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
      logger.warn("jvm-slang doesn't support verbose classfile output yet");
      return JSON.stringify(cls, null, 2);
    case 'simplified':
      const result: any = {};
      for (let i = 0; i < result.constantPool.length; i += 1) {
        result.constantPool[i].index = i;
      }

      for (const method of result.methods) {
        method.name = result.constantPool[method.nameIndex].value;
      }
      logger.warn("jvm-slang doesn't support simplified classfile output yet");
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
    constantPool: string[];
  } = {
    magic: cls.magic,
    majorVersion: cls.majorVersion,
    minorVersion: cls.minorVersion,
    constantPool: [],
    className: cls.thisClass,
    superName: cls.superClass,
    methods: [],
    fields: cls.fields,
  };

  /**
   * Convert constant pool to string
   */
  const textConstantPool = cls.constantPool.map(
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
    ([name, data], index: number) => {
      const method: any = data;
      const methodname = method.name;
      const descriptor = method.descriptor;
      const attributes = method.attributes.map((attribute: any) => {
        if (attribute.code === undefined) {
          return [];
        }

        return stringifyCode(attribute);
      });

      const flags = method.methodFlags;
      return {
        flags,
        methodname,
        descriptor,
        attributes,
      };
    }
  );

  result.constantPool = textConstantPool;

  return result;
}

export function stringifyCode(attr: CodeAttribute) {
  const code = attr.code;
  if (code === undefined) {
    return [];
  }
  let i = 0;
  const result: string[] = [];
  if (code === null) {
    return result;
  }

  while (i < code.byteLength) {
    const res = readInstruction(attr.code, i);
    i = res.offset;
    const code = res.result;

    // switch (code.opcode) {
    //   case OPCODE.NOP:
    //   case OPCODE.ACONST_NULL:
    //   case OPCODE.ICONST_M1:
    //   case OPCODE.ICONST_0:
    //   case OPCODE.ICONST_1:
    //   case OPCODE.ICONST_2:
    //   case OPCODE.ICONST_3:
    //   case OPCODE.ICONST_4:
    //   case OPCODE.ICONST_5:
    //   case OPCODE.LCONST_0:
    //   case OPCODE.LCONST_1:
    //   case OPCODE.FCONST_0:
    //   case OPCODE.FCONST_1:
    //   case OPCODE.FCONST_2:
    //   case OPCODE.DCONST_0:
    //   case OPCODE.DCONST_1:
    //   case OPCODE.ILOAD_0:
    //   case OPCODE.ILOAD_1:
    //   case OPCODE.ILOAD_2:
    //   case OPCODE.ILOAD_3:
    //   case OPCODE.LLOAD_0:
    //   case OPCODE.LLOAD_1:
    //   case OPCODE.LLOAD_2:
    //   case OPCODE.LLOAD_3:
    //   case OPCODE.FLOAD_0:
    //   case OPCODE.FLOAD_1:
    //   case OPCODE.FLOAD_2:
    //   case OPCODE.FLOAD_3:
    //   case OPCODE.DLOAD_0:
    //   case OPCODE.DLOAD_1:
    //   case OPCODE.DLOAD_2:
    //   case OPCODE.DLOAD_3:
    //   case OPCODE.ALOAD_0:
    //   case OPCODE.ALOAD_1:
    //   case OPCODE.ALOAD_2:
    //   case OPCODE.ALOAD_3:
    //   case OPCODE.IALOAD:
    //   case OPCODE.LALOAD:
    //   case OPCODE.FALOAD:
    //   case OPCODE.DALOAD:
    //   case OPCODE.AALOAD:
    //   case OPCODE.BALOAD:
    //   case OPCODE.CALOAD:
    //   case OPCODE.SALOAD:
    //   case OPCODE.ISTORE_0:
    //   case OPCODE.ISTORE_1:
    //   case OPCODE.ISTORE_2:
    //   case OPCODE.ISTORE_3:
    //   case OPCODE.LSTORE_0:
    //   case OPCODE.LSTORE_1:
    //   case OPCODE.LSTORE_2:
    //   case OPCODE.LSTORE_3:
    //   case OPCODE.FSTORE_0:
    //   case OPCODE.FSTORE_1:
    //   case OPCODE.FSTORE_2:
    //   case OPCODE.FSTORE_3:
    //   case OPCODE.DSTORE_0:
    //   case OPCODE.DSTORE_1:
    //   case OPCODE.DSTORE_2:
    //   case OPCODE.DSTORE_3:
    //   case OPCODE.ASTORE_0:
    //   case OPCODE.ASTORE_1:
    //   case OPCODE.ASTORE_2:
    //   case OPCODE.ASTORE_3:
    //   case OPCODE.IASTORE:
    //   case OPCODE.LASTORE:
    //   case OPCODE.FASTORE:
    //   case OPCODE.DASTORE:
    //   case OPCODE.AASTORE:
    //   case OPCODE.BASTORE:
    //   case OPCODE.CASTORE:
    //   case OPCODE.SASTORE:
    //   case OPCODE.POP:
    //   case OPCODE.POP2:
    //   case OPCODE.DUP:
    //   case OPCODE.DUP_X1:
    //   case OPCODE.DUP_X2:
    //   case OPCODE.DUP2:
    //   case OPCODE.DUP2_X1:
    //   case OPCODE.DUP2_X2:
    //   case OPCODE.SWAP:
    //   case OPCODE.IADD:
    //   case OPCODE.LADD:
    //   case OPCODE.FADD:
    //   case OPCODE.DADD:
    //   case OPCODE.ISUB:
    //   case OPCODE.LSUB:
    //   case OPCODE.FSUB:
    //   case OPCODE.DSUB:
    //   case OPCODE.IMUL:
    //   case OPCODE.LMUL:
    //   case OPCODE.FMUL:
    //   case OPCODE.DMUL:
    //   case OPCODE.IDIV:
    //   case OPCODE.LDIV:
    //   case OPCODE.FDIV:
    //   case OPCODE.DDIV:
    //   case OPCODE.IREM:
    //   case OPCODE.LREM:
    //   case OPCODE.FREM:
    //   case OPCODE.DREM:
    //   case OPCODE.INEG:
    //   case OPCODE.LNEG:
    //   case OPCODE.FNEG:
    //   case OPCODE.DNEG:
    //   case OPCODE.ISHL:
    //   case OPCODE.LSHL:
    //   case OPCODE.ISHR:
    //   case OPCODE.LSHR:
    //   case OPCODE.IUSHR:
    //   case OPCODE.LUSHR:
    //   case OPCODE.IAND:
    //   case OPCODE.LAND:
    //   case OPCODE.IOR:
    //   case OPCODE.LOR:
    //   case OPCODE.IXOR:
    //   case OPCODE.LXOR:
    //   case OPCODE.I2L:
    //   case OPCODE.I2F:
    //   case OPCODE.I2D:
    //   case OPCODE.L2I:
    //   case OPCODE.L2F:
    //   case OPCODE.L2D:
    //   case OPCODE.F2I:
    //   case OPCODE.F2L:
    //   case OPCODE.F2D:
    //   case OPCODE.D2I:
    //   case OPCODE.D2L:
    //   case OPCODE.D2F:
    //   case OPCODE.I2B:
    //   case OPCODE.I2C:
    //   case OPCODE.I2S:
    //   case OPCODE.LCMP:
    //   case OPCODE.FCMPL:
    //   case OPCODE.FCMPG:
    //   case OPCODE.DCMPL:
    //   case OPCODE.DCMPG:
    //   case OPCODE.IRETURN:
    //   case OPCODE.LRETURN:
    //   case OPCODE.FRETURN:
    //   case OPCODE.DRETURN:
    //   case OPCODE.ARETURN:
    //   case OPCODE.RETURN:
    //   case OPCODE.ARRAYLENGTH:
    //   case OPCODE.ATHROW:
    //   case OPCODE.MONITORENTER:
    //   case OPCODE.MONITOREXIT:
    //   case OPCODE.BREAKPOINT:
    //   case OPCODE.IMPDEP1:
    //   case OPCODE.IMPDEP2:
    //     i += 1;
    //     break;
    //   case OPCODE.BIPUSH:
    //   case OPCODE.LDC:
    //   case OPCODE.ILOAD:
    //   case OPCODE.LLOAD:
    //   case OPCODE.FLOAD:
    //   case OPCODE.DLOAD:
    //   case OPCODE.ALOAD:
    //   case OPCODE.ISTORE:
    //   case OPCODE.LSTORE:
    //   case OPCODE.FSTORE:
    //   case OPCODE.DSTORE:
    //   case OPCODE.ASTORE:
    //   case OPCODE.RET:
    //   case OPCODE.NEWARRAY:
    //     i += 2;
    //     break;
    //   case OPCODE.SIPUSH:
    //   case OPCODE.LDC:
    //   case OPCODE.LDC2_W:
    //   case OPCODE.IINC:
    //   case OPCODE.IFEQ:
    //   case OPCODE.IFNE:
    //   case OPCODE.IFLT:
    //   case OPCODE.IFGE:
    //   case OPCODE.IFGT:
    //   case OPCODE.IFLE:
    //   case OPCODE.IF_ICMPEQ:
    //   case OPCODE.IF_ICMPNE:
    //   case OPCODE.IF_ICMPLT:
    //   case OPCODE.IF_ICMPGE:
    //   case OPCODE.IF_ICMPGT:
    //   case OPCODE.IF_ICMPLE:
    //   case OPCODE.IF_ACMPEQ:
    //   case OPCODE.IF_ACMPNE:
    //   case OPCODE.GOTO:
    //   case OPCODE.JSR:
    //   case OPCODE.GETSTATIC:
    //   case OPCODE.PUTSTATIC:
    //   case OPCODE.GETFIELD:
    //   case OPCODE.PUTFIELD:
    //   case OPCODE.INVOKEVIRTUAL:
    //   case OPCODE.INVOKESPECIAL:
    //   case OPCODE.INVOKESTATIC:
    //   case OPCODE.NEW:
    //   case OPCODE.ANEWARRAY:
    //   case OPCODE.CHECKCAST:
    //   case OPCODE.INSTANCEOF:
    //   case OPCODE.IFNULL:
    //   case OPCODE.IFNONNULL:
    //     i += 3;
    //     break;
    //   case OPCODE.MULTIANEWARRAY:
    //     i += 4;
    //     break;
    //   case OPCODE.INVOKEINTERFACE:
    //   case OPCODE.INVOKEDYNAMIC:
    //   case OPCODE.GOTO_W:
    //   case OPCODE.JSR_W:
    //     i += 5;
    //     break;
    //   case OPCODE.WIDE:
    //     i += 6;
    //     break;
    //   case OPCODE.TABLESWITCH:
    //   case OPCODE.LOOKUPSWITCH:
    //     throw new Error('tableswitch disassembly not implemented');
    // }

    result.push(
      `#${i} ${OPCODE[code.opcode]}`.padEnd(15) + ` ${code.operands.join(', ')}`
    );
  }
  return result;
}

function getAllFlags(cls: any) {
  for (let index = 0; index < (cls?.fields?.length ?? 0); index++) {
    const field = cls.fields[index];
    // @ts-ignore
    cls.fields[index].fieldFlags = getFieldFlag(field);
  }

  for (const key of Object.keys(cls.methods)) {
    const method = cls.methods[key];

    // @ts-ignore
    cls.methods[key].methodFlags = getMethodFlag(method);
  }

  return cls;
}

export function getFieldFlag(field: any) {
  const flags = field.accessFlags;
  const fieldflags = [];
  if (flags & FIELD_FLAGS.ACC_PUBLIC) fieldflags.push('ACCPUBLIC');
  if (flags & FIELD_FLAGS.ACC_PRIVATE) fieldflags.push('ACCPRIVATE');
  if (flags & FIELD_FLAGS.ACC_PROTECTED) fieldflags.push('ACCPROTECTED');
  if (flags & FIELD_FLAGS.ACC_STATIC) fieldflags.push('ACCSTATIC');
  if (flags & FIELD_FLAGS.ACC_FINAL) fieldflags.push('ACCFINAL');
  if (flags & FIELD_FLAGS.ACC_VOLATILE) fieldflags.push('ACCVOLATILE');
  if (flags & FIELD_FLAGS.ACC_TRANSIENT) fieldflags.push('ACCTRANSIENT');
  if (flags & FIELD_FLAGS.ACC_SYNTHETIC) fieldflags.push('ACCSYNTHETIC');
  if (flags & FIELD_FLAGS.ACC_ENUM) fieldflags.push('ACCENUM');

  return fieldflags;
}

export function getMethodFlag(method: any) {
  const flags = method.accessFlags;

  const methodflags = [];
  if (flags & METHOD_FLAGS.ACC_PUBLIC) methodflags.push('ACCPUBLIC');
  if (flags & METHOD_FLAGS.ACC_PRIVATE) methodflags.push('ACCPRIVATE');
  if (flags & METHOD_FLAGS.ACC_PROTECTED) methodflags.push('ACCPROTECTED');
  if (flags & METHOD_FLAGS.ACC_STATIC) methodflags.push('ACCSTATIC');
  if (flags & METHOD_FLAGS.ACC_FINAL) methodflags.push('ACCFINAL');
  if (flags & METHOD_FLAGS.ACC_SYNCHRONIZED)
    methodflags.push('ACCSYNCHRONIZED');
  if (flags & METHOD_FLAGS.ACC_BRIDGE) methodflags.push('ACCBRIDGE');
  if (flags & METHOD_FLAGS.ACC_VARARGS) methodflags.push('ACCVARARGS');
  if (flags & METHOD_FLAGS.ACC_NATIVE) methodflags.push('ACCNATIVE');
  if (flags & METHOD_FLAGS.ACC_ABSTRACT) methodflags.push('ACCABSTRACT');
  if (flags & METHOD_FLAGS.ACC_STRICT) methodflags.push('ACCSTRICT');
  if (flags & METHOD_FLAGS.ACC_SYNTHETIC) methodflags.push('ACCSYNTHETIC');

  return methodflags;
}
