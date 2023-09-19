import { readInstruction } from '#jvm/components/ExecutionEngine/Interpreter/utils/readInstruction';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { ClassFile } from '#jvm/external/ClassFile/types';
import { AttributeCode } from '#jvm/external/ClassFile/types/attributes';
import { FIELDFLAGS } from '#jvm/external/ClassFile/types/fields';
import { METHODFLAGS } from '#jvm/external/ClassFile/types/methods';

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
      for (let i = 0; i < result.constantPool.length; i += 1) {
        result.constantPool[i].index = i;
      }

      for (const method of result.methods) {
        method.name = result.constantPool[method.nameIndex].value;
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
    constantPool: string[];
  } = {
    magic: cls.magic,
    majorVersion: cls.majorVersion,
    minorVersion: cls.minorVersion,
    constantPool: [],
    className: cls.thisClass,
    superName: cls.superClass,
    methods: [],
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

export function stringifyCode(attr: AttributeCode) {
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
    const code = readInstruction(attr.code, i);

    switch (code.opcode) {
      case OPCODE.NOP:
      case OPCODE.ACONSTNULL:
      case OPCODE.ICONSTM1:
      case OPCODE.ICONST0:
      case OPCODE.ICONST1:
      case OPCODE.ICONST2:
      case OPCODE.ICONST3:
      case OPCODE.ICONST4:
      case OPCODE.ICONST5:
      case OPCODE.LCONST0:
      case OPCODE.LCONST1:
      case OPCODE.FCONST0:
      case OPCODE.FCONST1:
      case OPCODE.FCONST2:
      case OPCODE.DCONST0:
      case OPCODE.DCONST1:
      case OPCODE.ILOAD0:
      case OPCODE.ILOAD1:
      case OPCODE.ILOAD2:
      case OPCODE.ILOAD3:
      case OPCODE.LLOAD0:
      case OPCODE.LLOAD1:
      case OPCODE.LLOAD2:
      case OPCODE.LLOAD3:
      case OPCODE.FLOAD0:
      case OPCODE.FLOAD1:
      case OPCODE.FLOAD2:
      case OPCODE.FLOAD3:
      case OPCODE.DLOAD0:
      case OPCODE.DLOAD1:
      case OPCODE.DLOAD2:
      case OPCODE.DLOAD3:
      case OPCODE.ALOAD0:
      case OPCODE.ALOAD1:
      case OPCODE.ALOAD2:
      case OPCODE.ALOAD3:
      case OPCODE.IALOAD:
      case OPCODE.LALOAD:
      case OPCODE.FALOAD:
      case OPCODE.DALOAD:
      case OPCODE.AALOAD:
      case OPCODE.BALOAD:
      case OPCODE.CALOAD:
      case OPCODE.SALOAD:
      case OPCODE.ISTORE0:
      case OPCODE.ISTORE1:
      case OPCODE.ISTORE2:
      case OPCODE.ISTORE3:
      case OPCODE.LSTORE0:
      case OPCODE.LSTORE1:
      case OPCODE.LSTORE2:
      case OPCODE.LSTORE3:
      case OPCODE.FSTORE0:
      case OPCODE.FSTORE1:
      case OPCODE.FSTORE2:
      case OPCODE.FSTORE3:
      case OPCODE.DSTORE0:
      case OPCODE.DSTORE1:
      case OPCODE.DSTORE2:
      case OPCODE.DSTORE3:
      case OPCODE.ASTORE0:
      case OPCODE.ASTORE1:
      case OPCODE.ASTORE2:
      case OPCODE.ASTORE3:
      case OPCODE.IASTORE:
      case OPCODE.LASTORE:
      case OPCODE.FASTORE:
      case OPCODE.DASTORE:
      case OPCODE.AASTORE:
      case OPCODE.BASTORE:
      case OPCODE.CASTORE:
      case OPCODE.SASTORE:
      case OPCODE.POP:
      case OPCODE.POP2:
      case OPCODE.DUP:
      case OPCODE.DUPX1:
      case OPCODE.DUPX2:
      case OPCODE.DUP2:
      case OPCODE.DUP2X1:
      case OPCODE.DUP2X2:
      case OPCODE.SWAP:
      case OPCODE.IADD:
      case OPCODE.LADD:
      case OPCODE.FADD:
      case OPCODE.DADD:
      case OPCODE.ISUB:
      case OPCODE.LSUB:
      case OPCODE.FSUB:
      case OPCODE.DSUB:
      case OPCODE.IMUL:
      case OPCODE.LMUL:
      case OPCODE.FMUL:
      case OPCODE.DMUL:
      case OPCODE.IDIV:
      case OPCODE.LDIV:
      case OPCODE.FDIV:
      case OPCODE.DDIV:
      case OPCODE.IREM:
      case OPCODE.LREM:
      case OPCODE.FREM:
      case OPCODE.DREM:
      case OPCODE.INEG:
      case OPCODE.LNEG:
      case OPCODE.FNEG:
      case OPCODE.DNEG:
      case OPCODE.ISHL:
      case OPCODE.LSHL:
      case OPCODE.ISHR:
      case OPCODE.LSHR:
      case OPCODE.IUSHR:
      case OPCODE.LUSHR:
      case OPCODE.IAND:
      case OPCODE.LAND:
      case OPCODE.IOR:
      case OPCODE.LOR:
      case OPCODE.IXOR:
      case OPCODE.LXOR:
      case OPCODE.I2L:
      case OPCODE.I2F:
      case OPCODE.I2D:
      case OPCODE.L2I:
      case OPCODE.L2F:
      case OPCODE.L2D:
      case OPCODE.F2I:
      case OPCODE.F2L:
      case OPCODE.F2D:
      case OPCODE.D2I:
      case OPCODE.D2L:
      case OPCODE.D2F:
      case OPCODE.I2B:
      case OPCODE.I2C:
      case OPCODE.I2S:
      case OPCODE.LCMP:
      case OPCODE.FCMPL:
      case OPCODE.FCMPG:
      case OPCODE.DCMPL:
      case OPCODE.DCMPG:
      case OPCODE.IRETURN:
      case OPCODE.LRETURN:
      case OPCODE.FRETURN:
      case OPCODE.DRETURN:
      case OPCODE.ARETURN:
      case OPCODE.RETURN:
      case OPCODE.ARRAYLENGTH:
      case OPCODE.ATHROW:
      case OPCODE.MONITORENTER:
      case OPCODE.MONITOREXIT:
      case OPCODE.BREAKPOINT:
      case OPCODE.IMPDEP1:
      case OPCODE.IMPDEP2:
        i += 1;
        break;
      case OPCODE.BIPUSH:
      case OPCODE.LDC:
      case OPCODE.ILOAD:
      case OPCODE.LLOAD:
      case OPCODE.FLOAD:
      case OPCODE.DLOAD:
      case OPCODE.ALOAD:
      case OPCODE.ISTORE:
      case OPCODE.LSTORE:
      case OPCODE.FSTORE:
      case OPCODE.DSTORE:
      case OPCODE.ASTORE:
      case OPCODE.RET:
      case OPCODE.NEWARRAY:
        i += 2;
        break;
      case OPCODE.SIPUSH:
      case OPCODE.LDCW:
      case OPCODE.LDC2W:
      case OPCODE.IINC:
      case OPCODE.IFEQ:
      case OPCODE.IFNE:
      case OPCODE.IFLT:
      case OPCODE.IFGE:
      case OPCODE.IFGT:
      case OPCODE.IFLE:
      case OPCODE.IFICMPEQ:
      case OPCODE.IFICMPNE:
      case OPCODE.IFICMPLT:
      case OPCODE.IFICMPGE:
      case OPCODE.IFICMPGT:
      case OPCODE.IFICMPLE:
      case OPCODE.IFACMPEQ:
      case OPCODE.IFACMPNE:
      case OPCODE.GOTO:
      case OPCODE.JSR:
      case OPCODE.GETSTATIC:
      case OPCODE.PUTSTATIC:
      case OPCODE.GETFIELD:
      case OPCODE.PUTFIELD:
      case OPCODE.INVOKEVIRTUAL:
      case OPCODE.INVOKESPECIAL:
      case OPCODE.INVOKESTATIC:
      case OPCODE.NEW:
      case OPCODE.ANEWARRAY:
      case OPCODE.CHECKCAST:
      case OPCODE.INSTANCEOF:
      case OPCODE.IFNULL:
      case OPCODE.IFNONNULL:
        i += 3;
        break;
      case OPCODE.MULTIANEWARRAY:
        i += 4;
        break;
      case OPCODE.INVOKEINTERFACE:
      case OPCODE.INVOKEDYNAMIC:
      case OPCODE.GOTOW:
      case OPCODE.JSRW:
        i += 5;
        break;
      case OPCODE.WIDE:
        i += 6;
        break;
      case OPCODE.TABLESWITCH:
      case OPCODE.LOOKUPSWITCH:
        throw new Error('tableswitch disassembly not implemented');
    }

    result.push(
      `${OPCODE[code.opcode]}`.padEnd(15) + ` ${code.operands.join(', ')}`
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
  if (flags & FIELDFLAGS.ACCPUBLIC) fieldflags.push('ACCPUBLIC');
  if (flags & FIELDFLAGS.ACCPRIVATE) fieldflags.push('ACCPRIVATE');
  if (flags & FIELDFLAGS.ACCPROTECTED) fieldflags.push('ACCPROTECTED');
  if (flags & FIELDFLAGS.ACCSTATIC) fieldflags.push('ACCSTATIC');
  if (flags & FIELDFLAGS.ACCFINAL) fieldflags.push('ACCFINAL');
  if (flags & FIELDFLAGS.ACCVOLATILE) fieldflags.push('ACCVOLATILE');
  if (flags & FIELDFLAGS.ACCTRANSIENT) fieldflags.push('ACCTRANSIENT');
  if (flags & FIELDFLAGS.ACCSYNTHETIC) fieldflags.push('ACCSYNTHETIC');
  if (flags & FIELDFLAGS.ACCENUM) fieldflags.push('ACCENUM');

  return fieldflags;
}

export function getMethodFlag(method: any) {
  const flags = method.accessFlags;

  const methodflags = [];
  if (flags & METHODFLAGS.ACCPUBLIC) methodflags.push('ACCPUBLIC');
  if (flags & METHODFLAGS.ACCPRIVATE) methodflags.push('ACCPRIVATE');
  if (flags & METHODFLAGS.ACCPROTECTED) methodflags.push('ACCPROTECTED');
  if (flags & METHODFLAGS.ACCSTATIC) methodflags.push('ACCSTATIC');
  if (flags & METHODFLAGS.ACCFINAL) methodflags.push('ACCFINAL');
  if (flags & METHODFLAGS.ACCSYNCHRONIZED) methodflags.push('ACCSYNCHRONIZED');
  if (flags & METHODFLAGS.ACCBRIDGE) methodflags.push('ACCBRIDGE');
  if (flags & METHODFLAGS.ACCVARARGS) methodflags.push('ACCVARARGS');
  if (flags & METHODFLAGS.ACCNATIVE) methodflags.push('ACCNATIVE');
  if (flags & METHODFLAGS.ACCABSTRACT) methodflags.push('ACCABSTRACT');
  if (flags & METHODFLAGS.ACCSTRICT) methodflags.push('ACCSTRICT');
  if (flags & METHODFLAGS.ACCSYNTHETIC) methodflags.push('ACCSYNTHETIC');

  return methodflags;
}
