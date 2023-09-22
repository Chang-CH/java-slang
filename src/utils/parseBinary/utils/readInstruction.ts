import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
interface InstructionType {
  opcode: OPCODE;
  operands: any[];
}

export function readInstructions(
  view: DataView,
  offset: number,
  codeLength: number
) {
  const initial = offset;
  const end = offset + codeLength;
  const code: InstructionType[] = [];
  while (offset < end) {
    ({ result: code[offset - initial], offset } = readInstruction(
      view,
      offset
    ));
  }

  return { result: code, offset };
}

export function readInstruction(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const opcode = view.getUint8(offset);
  offset += 1;

  switch (opcode) {
    case OPCODE.NOP:
      return readnop(view, offset);
    case OPCODE.ACONSTNULL:
      return readaconstNull(view, offset);
    case OPCODE.ICONSTM1:
      return readiconstM1(view, offset);
    case OPCODE.ICONST0:
      return readiconst0(view, offset);
    case OPCODE.ICONST1:
      return readiconst1(view, offset);
    case OPCODE.ICONST2:
      return readiconst2(view, offset);
    case OPCODE.ICONST3:
      return readiconst3(view, offset);
    case OPCODE.ICONST4:
      return readiconst4(view, offset);
    case OPCODE.ICONST5:
      return readiconst5(view, offset);
    case OPCODE.LCONST0:
      return readlconst0(view, offset);
    case OPCODE.LCONST1:
      return readlconst1(view, offset);
    case OPCODE.FCONST0:
      return readfconst0(view, offset);
    case OPCODE.FCONST1:
      return readfconst1(view, offset);
    case OPCODE.FCONST2:
      return readfconst2(view, offset);
    case OPCODE.DCONST0:
      return readdconst0(view, offset);
    case OPCODE.DCONST1:
      return readdconst1(view, offset);
    case OPCODE.BIPUSH:
      return readbipush(view, offset);
    case OPCODE.SIPUSH:
      return readsipush(view, offset);
    case OPCODE.LDC:
      return readldc(view, offset);
    case OPCODE.LDCW:
      return readldcW(view, offset);
    case OPCODE.LDC2W:
      return readldc2W(view, offset);
    case OPCODE.ILOAD:
      return readiload(view, offset);
    case OPCODE.LLOAD:
      return readlload(view, offset);
    case OPCODE.FLOAD:
      return readfload(view, offset);
    case OPCODE.DLOAD:
      return readdload(view, offset);
    case OPCODE.ALOAD:
      return readaload(view, offset);
    case OPCODE.ILOAD0:
      return readiload0(view, offset);
    case OPCODE.ILOAD1:
      return readiload1(view, offset);
    case OPCODE.ILOAD2:
      return readiload2(view, offset);
    case OPCODE.ILOAD3:
      return readiload3(view, offset);
    case OPCODE.LLOAD0:
      return readlload0(view, offset);
    case OPCODE.LLOAD1:
      return readlload1(view, offset);
    case OPCODE.LLOAD2:
      return readlload2(view, offset);
    case OPCODE.LLOAD3:
      return readlload3(view, offset);
    case OPCODE.FLOAD0:
      return readfload0(view, offset);
    case OPCODE.FLOAD1:
      return readfload1(view, offset);
    case OPCODE.FLOAD2:
      return readfload2(view, offset);
    case OPCODE.FLOAD3:
      return readfload3(view, offset);
    case OPCODE.DLOAD0:
      return readdload0(view, offset);
    case OPCODE.DLOAD1:
      return readdload1(view, offset);
    case OPCODE.DLOAD2:
      return readdload2(view, offset);
    case OPCODE.DLOAD3:
      return readdload3(view, offset);
    case OPCODE.ALOAD0:
      return readaload0(view, offset);
    case OPCODE.ALOAD1:
      return readaload1(view, offset);
    case OPCODE.ALOAD2:
      return readaload2(view, offset);
    case OPCODE.ALOAD3:
      return readaload3(view, offset);
    case OPCODE.IALOAD:
      return readiaload(view, offset);
    case OPCODE.LALOAD:
      return readlaload(view, offset);
    case OPCODE.FALOAD:
      return readfaload(view, offset);
    case OPCODE.DALOAD:
      return readdaload(view, offset);
    case OPCODE.AALOAD:
      return readaaload(view, offset);
    case OPCODE.BALOAD:
      return readbaload(view, offset);
    case OPCODE.CALOAD:
      return readcaload(view, offset);
    case OPCODE.SALOAD:
      return readsaload(view, offset);
    case OPCODE.ISTORE:
      return readistore(view, offset);
    case OPCODE.LSTORE:
      return readlstore(view, offset);
    case OPCODE.FSTORE:
      return readfstore(view, offset);
    case OPCODE.DSTORE:
      return readdstore(view, offset);
    case OPCODE.ASTORE:
      return readastore(view, offset);
    case OPCODE.ISTORE0:
      return readistore0(view, offset);
    case OPCODE.ISTORE1:
      return readistore1(view, offset);
    case OPCODE.ISTORE2:
      return readistore2(view, offset);
    case OPCODE.ISTORE3:
      return readistore3(view, offset);
    case OPCODE.LSTORE0:
      return readlstore0(view, offset);
    case OPCODE.LSTORE1:
      return readlstore1(view, offset);
    case OPCODE.LSTORE2:
      return readlstore2(view, offset);
    case OPCODE.LSTORE3:
      return readlstore3(view, offset);
    case OPCODE.FSTORE0:
      return readfstore0(view, offset);
    case OPCODE.FSTORE1:
      return readfstore1(view, offset);
    case OPCODE.FSTORE2:
      return readfstore2(view, offset);
    case OPCODE.FSTORE3:
      return readfstore3(view, offset);
    case OPCODE.DSTORE0:
      return readdstore0(view, offset);
    case OPCODE.DSTORE1:
      return readdstore1(view, offset);
    case OPCODE.DSTORE2:
      return readdstore2(view, offset);
    case OPCODE.DSTORE3:
      return readdstore3(view, offset);
    case OPCODE.ASTORE0:
      return readastore0(view, offset);
    case OPCODE.ASTORE1:
      return readastore1(view, offset);
    case OPCODE.ASTORE2:
      return readastore2(view, offset);
    case OPCODE.ASTORE3:
      return readastore3(view, offset);
    case OPCODE.IASTORE:
      return readiastore(view, offset);
    case OPCODE.LASTORE:
      return readlastore(view, offset);
    case OPCODE.FASTORE:
      return readfastore(view, offset);
    case OPCODE.DASTORE:
      return readdastore(view, offset);
    case OPCODE.AASTORE:
      return readaastore(view, offset);
    case OPCODE.BASTORE:
      return readbastore(view, offset);
    case OPCODE.CASTORE:
      return readcastore(view, offset);
    case OPCODE.SASTORE:
      return readsastore(view, offset);
    case OPCODE.POP:
      return readpop(view, offset);
    case OPCODE.POP2:
      return readpop2(view, offset);
    case OPCODE.DUP:
      return readdup(view, offset);
    case OPCODE.DUPX1:
      return readdupX1(view, offset);
    case OPCODE.DUPX2:
      return readdupX2(view, offset);
    case OPCODE.DUP2:
      return readdup2(view, offset);
    case OPCODE.DUP2X1:
      return readdup2X1(view, offset);
    case OPCODE.DUP2X2:
      return readdup2X2(view, offset);
    case OPCODE.SWAP:
      return readswap(view, offset);
    case OPCODE.IADD:
      return readiadd(view, offset);
    case OPCODE.LADD:
      return readladd(view, offset);
    case OPCODE.FADD:
      return readfadd(view, offset);
    case OPCODE.DADD:
      return readdadd(view, offset);
    case OPCODE.ISUB:
      return readisub(view, offset);
    case OPCODE.LSUB:
      return readlsub(view, offset);
    case OPCODE.FSUB:
      return readfsub(view, offset);
    case OPCODE.DSUB:
      return readdsub(view, offset);
    case OPCODE.IMUL:
      return readimul(view, offset);
    case OPCODE.LMUL:
      return readlmul(view, offset);
    case OPCODE.FMUL:
      return readfmul(view, offset);
    case OPCODE.DMUL:
      return readdmul(view, offset);
    case OPCODE.IDIV:
      return readidiv(view, offset);
    case OPCODE.LDIV:
      return readldiv(view, offset);
    case OPCODE.FDIV:
      return readfdiv(view, offset);
    case OPCODE.DDIV:
      return readddiv(view, offset);
    case OPCODE.IREM:
      return readirem(view, offset);
    case OPCODE.LREM:
      return readlrem(view, offset);
    case OPCODE.FREM:
      return readfrem(view, offset);
    case OPCODE.DREM:
      return readdrem(view, offset);
    case OPCODE.INEG:
      return readineg(view, offset);
    case OPCODE.LNEG:
      return readlneg(view, offset);
    case OPCODE.FNEG:
      return readfneg(view, offset);
    case OPCODE.DNEG:
      return readdneg(view, offset);
    case OPCODE.ISHL:
      return readishl(view, offset);
    case OPCODE.LSHL:
      return readlshl(view, offset);
    case OPCODE.ISHR:
      return readishr(view, offset);
    case OPCODE.LSHR:
      return readlshr(view, offset);
    case OPCODE.IUSHR:
      return readiushr(view, offset);
    case OPCODE.LUSHR:
      return readlushr(view, offset);
    case OPCODE.IAND:
      return readiand(view, offset);
    case OPCODE.LAND:
      return readland(view, offset);
    case OPCODE.IOR:
      return readior(view, offset);
    case OPCODE.LOR:
      return readlor(view, offset);
    case OPCODE.IXOR:
      return readixor(view, offset);
    case OPCODE.LXOR:
      return readlxor(view, offset);
    case OPCODE.IINC:
      return readiinc(view, offset);
    case OPCODE.I2L:
      return readi2l(view, offset);
    case OPCODE.I2F:
      return readi2f(view, offset);
    case OPCODE.I2D:
      return readi2d(view, offset);
    case OPCODE.L2I:
      return readl2i(view, offset);
    case OPCODE.L2F:
      return readl2f(view, offset);
    case OPCODE.L2D:
      return readl2d(view, offset);
    case OPCODE.F2I:
      return readf2i(view, offset);
    case OPCODE.F2L:
      return readf2l(view, offset);
    case OPCODE.F2D:
      return readf2d(view, offset);
    case OPCODE.D2I:
      return readd2i(view, offset);
    case OPCODE.D2L:
      return readd2l(view, offset);
    case OPCODE.D2F:
      return readd2f(view, offset);
    case OPCODE.I2B:
      return readi2b(view, offset);
    case OPCODE.I2C:
      return readi2c(view, offset);
    case OPCODE.I2S:
      return readi2s(view, offset);
    case OPCODE.LCMP:
      return readlcmp(view, offset);
    case OPCODE.FCMPL:
      return readfcmpl(view, offset);
    case OPCODE.FCMPG:
      return readfcmpg(view, offset);
    case OPCODE.DCMPL:
      return readdcmpl(view, offset);
    case OPCODE.DCMPG:
      return readdcmpg(view, offset);
    case OPCODE.IFEQ:
      return readifeq(view, offset);
    case OPCODE.IFNE:
      return readifne(view, offset);
    case OPCODE.IFLT:
      return readiflt(view, offset);
    case OPCODE.IFGE:
      return readifge(view, offset);
    case OPCODE.IFGT:
      return readifgt(view, offset);
    case OPCODE.IFLE:
      return readifle(view, offset);
    case OPCODE.IFICMPEQ:
      return readifIcmpeq(view, offset);
    case OPCODE.IFICMPNE:
      return readifIcmpne(view, offset);
    case OPCODE.IFICMPLT:
      return readifIcmplt(view, offset);
    case OPCODE.IFICMPGE:
      return readifIcmpge(view, offset);
    case OPCODE.IFICMPGT:
      return readifIcmpgt(view, offset);
    case OPCODE.IFICMPLE:
      return readifIcmple(view, offset);
    case OPCODE.IFACMPEQ:
      return readifAcmpeq(view, offset);
    case OPCODE.IFACMPNE:
      return readifAcmpne(view, offset);
    case OPCODE.GOTO:
      return readgoto(view, offset);
    case OPCODE.JSR:
      return readjsr(view, offset);
    case OPCODE.RET:
      return readret(view, offset);
    case OPCODE.TABLESWITCH:
      return readtableswitch(view, offset);
    case OPCODE.LOOKUPSWITCH:
      return readlookupswitch(view, offset);
    case OPCODE.IRETURN:
      return readireturn(view, offset);
    case OPCODE.LRETURN:
      return readlreturn(view, offset);
    case OPCODE.FRETURN:
      return readfreturn(view, offset);
    case OPCODE.DRETURN:
      return readdreturn(view, offset);
    case OPCODE.ARETURN:
      return readareturn(view, offset);
    case OPCODE.RETURN:
      return readreturn(view, offset);
    case OPCODE.GETSTATIC:
      return readgetstatic(view, offset);
    case OPCODE.PUTSTATIC:
      return readputstatic(view, offset);
    case OPCODE.GETFIELD:
      return readgetfield(view, offset);
    case OPCODE.PUTFIELD:
      return readputfield(view, offset);
    case OPCODE.INVOKEVIRTUAL:
      return readinvokevirtual(view, offset);
    case OPCODE.INVOKESPECIAL:
      return readinvokespecial(view, offset);
    case OPCODE.INVOKESTATIC:
      return readinvokestatic(view, offset);
    case OPCODE.INVOKEINTERFACE:
      return readinvokeinterface(view, offset);
    case OPCODE.INVOKEDYNAMIC:
      return readinvokedynamic(view, offset);
    case OPCODE.NEW:
      return readnew(view, offset);
    case OPCODE.NEWARRAY:
      return readnewarray(view, offset);
    case OPCODE.ANEWARRAY:
      return readanewarray(view, offset);
    case OPCODE.ARRAYLENGTH:
      return readarraylength(view, offset);
    case OPCODE.ATHROW:
      return readathrow(view, offset);
    case OPCODE.CHECKCAST:
      return readcheckcast(view, offset);
    case OPCODE.INSTANCEOF:
      return readinstanceof(view, offset);
    case OPCODE.MONITORENTER:
      return readmonitorenter(view, offset);
    case OPCODE.MONITOREXIT:
      return readmonitorexit(view, offset);
    case OPCODE.WIDE:
      return readwide(view, offset);
    case OPCODE.MULTIANEWARRAY:
      return readmultianewarray(view, offset);
    case OPCODE.IFNULL:
      return readifnull(view, offset);
    case OPCODE.IFNONNULL:
      return readifnonnull(view, offset);
    case OPCODE.GOTOW:
      return readgotoW(view, offset);
    case OPCODE.JSRW:
      return readjsrW(view, offset);
    case OPCODE.BREAKPOINT:
      return readbreakpoint(view, offset);
    case OPCODE.IMPDEP1:
      return readimpdep1(view, offset);
    case OPCODE.IMPDEP2:
      return readimpdep2(view, offset);
    default:
      throw new Error('Unknown opcode');
  }
}

function readnop(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.NOP, operands: [] },
    offset,
  };
}

function readaconstNull(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: {
      opcode: OPCODE.ACONSTNULL,
      operands: [],
    },
    offset,
  };
}

function readiconstM1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONSTM1, operands: [] },
    offset,
  };
}

function readiconst0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONST0, operands: [] },
    offset,
  };
}

function readiconst1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONST1, operands: [] },
    offset,
  };
}

function readiconst2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONST2, operands: [] },
    offset,
  };
}

function readiconst3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONST3, operands: [] },
    offset,
  };
}

function readiconst4(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONST4, operands: [] },
    offset,
  };
}

function readiconst5(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ICONST5, operands: [] },
    offset,
  };
}

function readlconst0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LCONST0, operands: [] },
    offset,
  };
}

function readlconst1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LCONST1, operands: [] },
    offset,
  };
}

function readfconst0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FCONST0, operands: [] },
    offset,
  };
}

function readfconst1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FCONST1, operands: [] },
    offset,
  };
}

function readfconst2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FCONST2, operands: [] },
    offset,
  };
}

function readdconst0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DCONST0, operands: [] },
    offset,
  };
}

function readdconst1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DCONST1, operands: [] },
    offset,
  };
}

function readbipush(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const byte = view.getInt8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.BIPUSH, operands: [byte] },
    offset,
  };
}

function readsipush(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const value = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.SIPUSH,
      operands: [value],
    },
    offset,
  };
}

function readldc(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.LDC, operands: [index] },
    offset,
  };
}

function readldcW(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.LDCW,
      operands: [indexbyte],
    },
    offset,
  };
}

function readldc2W(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.LDC2W,
      operands: [indexbyte],
    },
    offset,
  };
}

function readiload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.ILOAD, operands: [index] },
    offset,
  };
}

function readlload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.LLOAD, operands: [index] },
    offset,
  };
}

function readfload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.FLOAD, operands: [index] },
    offset,
  };
}

function readdload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.DLOAD, operands: [index] },
    offset,
  };
}

function readaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.ALOAD, operands: [index] },
    offset,
  };
}

function readiload0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ILOAD0, operands: [] },
    offset,
  };
}

function readiload1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ILOAD1, operands: [] },
    offset,
  };
}

function readiload2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ILOAD2, operands: [] },
    offset,
  };
}

function readiload3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ILOAD3, operands: [] },
    offset,
  };
}

function readlload0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LLOAD0, operands: [] },
    offset,
  };
}

function readlload1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LLOAD1, operands: [] },
    offset,
  };
}

function readlload2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LLOAD2, operands: [] },
    offset,
  };
}

function readlload3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LLOAD3, operands: [] },
    offset,
  };
}

function readfload0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FLOAD0, operands: [] },
    offset,
  };
}

function readfload1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FLOAD1, operands: [] },
    offset,
  };
}

function readfload2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FLOAD2, operands: [] },
    offset,
  };
}

function readfload3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FLOAD3, operands: [] },
    offset,
  };
}

function readdload0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DLOAD0, operands: [] },
    offset,
  };
}

function readdload1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DLOAD1, operands: [] },
    offset,
  };
}

function readdload2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DLOAD2, operands: [] },
    offset,
  };
}

function readdload3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DLOAD3, operands: [] },
    offset,
  };
}

function readaload0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ALOAD0, operands: [] },
    offset,
  };
}

function readaload1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ALOAD1, operands: [] },
    offset,
  };
}

function readaload2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ALOAD2, operands: [] },
    offset,
  };
}

function readaload3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ALOAD3, operands: [] },
    offset,
  };
}

function readiaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IALOAD, operands: [] },
    offset,
  };
}

function readlaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LALOAD, operands: [] },
    offset,
  };
}

function readfaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FALOAD, operands: [] },
    offset,
  };
}

function readdaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DALOAD, operands: [] },
    offset,
  };
}

function readaaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.AALOAD, operands: [] },
    offset,
  };
}

function readbaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.BALOAD, operands: [] },
    offset,
  };
}

function readcaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.CALOAD, operands: [] },
    offset,
  };
}

function readsaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.SALOAD, operands: [] },
    offset,
  };
}

function readistore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: {
      opcode: OPCODE.ISTORE,
      operands: [index],
    },
    offset,
  };
}

function readlstore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: {
      opcode: OPCODE.LSTORE,
      operands: [index],
    },
    offset,
  };
}

function readfstore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: {
      opcode: OPCODE.FSTORE,
      operands: [index],
    },
    offset,
  };
}

function readdstore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: {
      opcode: OPCODE.DSTORE,
      operands: [index],
    },
    offset,
  };
}

function readastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: {
      opcode: OPCODE.ASTORE,
      operands: [index],
    },
    offset,
  };
}

function readistore0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISTORE0, operands: [] },
    offset,
  };
}

function readistore1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISTORE1, operands: [] },
    offset,
  };
}

function readistore2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISTORE2, operands: [] },
    offset,
  };
}

function readistore3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISTORE3, operands: [] },
    offset,
  };
}

function readlstore0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSTORE0, operands: [] },
    offset,
  };
}

function readlstore1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSTORE1, operands: [] },
    offset,
  };
}

function readlstore2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSTORE2, operands: [] },
    offset,
  };
}

function readlstore3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSTORE3, operands: [] },
    offset,
  };
}

function readfstore0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FSTORE0, operands: [] },
    offset,
  };
}

function readfstore1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FSTORE1, operands: [] },
    offset,
  };
}

function readfstore2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FSTORE2, operands: [] },
    offset,
  };
}

function readfstore3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FSTORE3, operands: [] },
    offset,
  };
}

function readdstore0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DSTORE0, operands: [] },
    offset,
  };
}

function readdstore1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DSTORE1, operands: [] },
    offset,
  };
}

function readdstore2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DSTORE2, operands: [] },
    offset,
  };
}

function readdstore3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DSTORE3, operands: [] },
    offset,
  };
}

function readastore0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ASTORE0, operands: [] },
    offset,
  };
}

function readastore1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ASTORE1, operands: [] },
    offset,
  };
}

function readastore2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ASTORE2, operands: [] },
    offset,
  };
}

function readastore3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ASTORE3, operands: [] },
    offset,
  };
}

function readiastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IASTORE, operands: [] },
    offset,
  };
}

function readlastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LASTORE, operands: [] },
    offset,
  };
}

function readfastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FASTORE, operands: [] },
    offset,
  };
}

function readdastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DASTORE, operands: [] },
    offset,
  };
}

function readaastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.AASTORE, operands: [] },
    offset,
  };
}

function readbastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.BASTORE, operands: [] },
    offset,
  };
}

function readcastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.CASTORE, operands: [] },
    offset,
  };
}

function readsastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.SASTORE, operands: [] },
    offset,
  };
}

function readpop(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.POP, operands: [] },
    offset,
  };
}

function readpop2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.POP2, operands: [] },
    offset,
  };
}

function readdup(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DUP, operands: [] },
    offset,
  };
}

function readdupX1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DUPX1, operands: [] },
    offset,
  };
}

function readdupX2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DUPX2, operands: [] },
    offset,
  };
}

function readdup2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DUP2, operands: [] },
    offset,
  };
}

function readdup2X1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DUP2X1, operands: [] },
    offset,
  };
}

function readdup2X2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DUP2X2, operands: [] },
    offset,
  };
}

function readswap(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.SWAP, operands: [] },
    offset,
  };
}

function readiadd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IADD, operands: [] },
    offset,
  };
}

function readladd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LADD, operands: [] },
    offset,
  };
}

function readfadd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FADD, operands: [] },
    offset,
  };
}

function readdadd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DADD, operands: [] },
    offset,
  };
}

function readisub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISUB, operands: [] },
    offset,
  };
}

function readlsub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSUB, operands: [] },
    offset,
  };
}

function readfsub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FSUB, operands: [] },
    offset,
  };
}

function readdsub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DSUB, operands: [] },
    offset,
  };
}

function readimul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IMUL, operands: [] },
    offset,
  };
}

function readlmul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LMUL, operands: [] },
    offset,
  };
}

function readfmul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FMUL, operands: [] },
    offset,
  };
}

function readdmul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DMUL, operands: [] },
    offset,
  };
}

function readidiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IDIV, operands: [] },
    offset,
  };
}

function readldiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LDIV, operands: [] },
    offset,
  };
}

function readfdiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FDIV, operands: [] },
    offset,
  };
}

function readddiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DDIV, operands: [] },
    offset,
  };
}

function readirem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IREM, operands: [] },
    offset,
  };
}

function readlrem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LREM, operands: [] },
    offset,
  };
}

function readfrem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FREM, operands: [] },
    offset,
  };
}

function readdrem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DREM, operands: [] },
    offset,
  };
}

function readineg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.INEG, operands: [] },
    offset,
  };
}

function readlneg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LNEG, operands: [] },
    offset,
  };
}

function readfneg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FNEG, operands: [] },
    offset,
  };
}

function readdneg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DNEG, operands: [] },
    offset,
  };
}

function readishl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISHL, operands: [] },
    offset,
  };
}

function readlshl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSHL, operands: [] },
    offset,
  };
}

function readishr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ISHR, operands: [] },
    offset,
  };
}

function readlshr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LSHR, operands: [] },
    offset,
  };
}

function readiushr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IUSHR, operands: [] },
    offset,
  };
}

function readlushr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LUSHR, operands: [] },
    offset,
  };
}

function readiand(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IAND, operands: [] },
    offset,
  };
}

function readland(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LAND, operands: [] },
    offset,
  };
}

function readior(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IOR, operands: [] },
    offset,
  };
}

function readlor(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LOR, operands: [] },
    offset,
  };
}

function readixor(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IXOR, operands: [] },
    offset,
  };
}

function readlxor(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LXOR, operands: [] },
    offset,
  };
}

function readiinc(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;
  const constant = view.getInt8(offset);
  offset += 1;

  return {
    result: {
      opcode: OPCODE.IINC,
      operands: [index, constant],
    },
    offset,
  };
}

function readi2l(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.I2L, operands: [] },
    offset,
  };
}

function readi2f(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.I2F, operands: [] },
    offset,
  };
}

function readi2d(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.I2D, operands: [] },
    offset,
  };
}

function readl2i(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.L2I, operands: [] },
    offset,
  };
}

function readl2f(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.L2F, operands: [] },
    offset,
  };
}

function readl2d(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.L2D, operands: [] },
    offset,
  };
}

function readf2i(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.F2I, operands: [] },
    offset,
  };
}

function readf2l(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.F2L, operands: [] },
    offset,
  };
}

function readf2d(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.F2D, operands: [] },
    offset,
  };
}

function readd2i(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.D2I, operands: [] },
    offset,
  };
}

function readd2l(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.D2L, operands: [] },
    offset,
  };
}

function readd2f(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.D2F, operands: [] },
    offset,
  };
}

function readi2b(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.I2B, operands: [] },
    offset,
  };
}

function readi2c(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.I2C, operands: [] },
    offset,
  };
}

function readi2s(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.I2S, operands: [] },
    offset,
  };
}

function readlcmp(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LCMP, operands: [] },
    offset,
  };
}

function readfcmpl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FCMPL, operands: [] },
    offset,
  };
}

function readfcmpg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FCMPG, operands: [] },
    offset,
  };
}

function readdcmpl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DCMPL, operands: [] },
    offset,
  };
}

function readdcmpg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DCMPG, operands: [] },
    offset,
  };
}

function readifeq(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFEQ,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifne(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;
  return {
    result: {
      opcode: OPCODE.IFNE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readiflt(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;
  return {
    result: {
      opcode: OPCODE.IFLT,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifge(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;
  return {
    result: {
      opcode: OPCODE.IFGE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifgt(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;
  return {
    result: {
      opcode: OPCODE.IFGT,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifle(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;
  return {
    result: {
      opcode: OPCODE.IFLE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifIcmpeq(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFICMPEQ,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifIcmpne(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFICMPNE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifIcmplt(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFICMPLT,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifIcmpge(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFICMPGE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifIcmpgt(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFICMPGT,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifIcmple(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFICMPLE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifAcmpeq(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFACMPEQ,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifAcmpne(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFACMPNE,
      operands: [branchbyte],
    },
    offset,
  };
}

function readgoto(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.GOTO,
      operands: [branchbyte],
    },
    offset,
  };
}

function readjsr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.JSR,
      operands: [branchbyte],
    },
    offset,
  };
}

function readret(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const index = view.getUint8(offset);
  offset += 1;

  return {
    result: { opcode: OPCODE.RET, operands: [index] },
    offset,
  };
}

function readtableswitch(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  offset += offset % 4; // padding

  const def = view.getInt32(offset);
  offset += 4;
  const low = view.getInt32(offset);
  offset += 4;
  const high = view.getInt32(offset);
  offset += 4;

  const offsets = []; // 0 indexed
  for (let i = 0; i < high - low + 1; i++) {
    offsets.push(view.getInt32(offset));
    offset += 4;
  }

  return {
    result: {
      opcode: OPCODE.TABLESWITCH,
      operands: [def, low, high, offsets],
    },
    offset,
  };
}

function readlookupswitch(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  if (offset % 4 !== 0) {
    offset += 4 - (offset % 4); // padding
  }

  const def = view.getInt32(offset);
  offset += 4;
  const npairCount = view.getInt32(offset);
  offset += 4;

  const npairs = []; // 0 indexed
  for (let i = 0; i < npairCount; i++) {
    npairs.push(view.getInt32(offset));
    offset += 4;
  }

  return {
    result: {
      opcode: OPCODE.TABLESWITCH,
      operands: [def, npairCount, npairs],
    },
    offset,
  };
}

function readireturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.IRETURN, operands: [] },
    offset,
  };
}

function readlreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.LRETURN, operands: [] },
    offset,
  };
}

function readfreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.FRETURN, operands: [] },
    offset,
  };
}

function readdreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.DRETURN, operands: [] },
    offset,
  };
}

function readareturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ARETURN, operands: [] },
    offset,
  };
}

function readreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.RETURN, operands: [] },
    offset,
  };
}

function readgetstatic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.GETSTATIC,
      operands: [indexbyte],
    },
    offset,
  };
}

function readputstatic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.PUTSTATIC,
      operands: [indexbyte],
    },
    offset,
  };
}

function readgetfield(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.GETFIELD,
      operands: [indexbyte],
    },
    offset,
  };
}

function readputfield(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.PUTFIELD,
      operands: [indexbyte],
    },
    offset,
  };
}

function readinvokevirtual(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.INVOKEVIRTUAL,
      operands: [indexbyte],
    },
    offset,
  };
}

function readinvokespecial(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.INVOKESPECIAL,
      operands: [indexbyte],
    },
    offset,
  };
}

function readinvokestatic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.INVOKESTATIC,
      operands: [indexbyte],
    },
    offset,
  };
}

function readinvokeinterface(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  const count = view.getUint8(offset);
  if (count === 0) {
    throw new Error('invokeinterface count must not be 0');
  }
  offset += 1;

  const zero = view.getUint8(offset);
  if (zero !== 0) {
    throw new Error('invokeinterface fourth operand must be 0');
  }
  offset += 1;

  return {
    result: {
      opcode: OPCODE.INVOKEINTERFACE,
      operands: [indexbyte, count],
    },
    offset,
  };
}

function readinvokedynamic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  const zero1 = view.getUint8(offset);
  if (zero1 !== 0) {
    throw new Error('invokedynamic third byte must be 0');
  }
  offset += 1;

  const zero2 = view.getUint8(offset);
  if (zero2 !== 0) {
    throw new Error('invokedynamic fourth bytes must be 0');
  }
  offset += 1;

  return {
    result: {
      opcode: OPCODE.INVOKEDYNAMIC,
      operands: [indexbyte],
    },
    offset,
  };
}

function readnew(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.NEW,
      operands: [indexbyte],
    },
    offset,
  };
}

function readnewarray(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const atype = view.getUint8(offset); // TODO: check atype valid
  offset += 1;

  return {
    result: {
      opcode: OPCODE.NEWARRAY,
      operands: [atype],
    },
    offset,
  };
}

function readanewarray(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;
  return {
    result: {
      opcode: OPCODE.ANEWARRAY,
      operands: [indexbyte],
    },
    offset,
  };
}

function readarraylength(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: {
      opcode: OPCODE.ARRAYLENGTH,
      operands: [],
    },
    offset,
  };
}

function readathrow(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: OPCODE.ATHROW, operands: [] },
    offset,
  };
}

function readcheckcast(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // FIXME: may have to use type checker project?
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.CHECKCAST,
      operands: [indexbyte],
    },
    offset,
  };
}

function readinstanceof(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // FIXME: may have to use type checker project?
  const indexbyte = view.getUint16(offset);

  offset += 2;

  return {
    result: {
      opcode: OPCODE.INSTANCEOF,
      operands: [indexbyte],
    },
    offset,
  };
}

function readmonitorenter(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: {
      opcode: OPCODE.MONITORENTER,
      operands: [],
    },
    offset,
  };
}

function readmonitorexit(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: {
      opcode: OPCODE.MONITOREXIT,
      operands: [],
    },
    offset,
  };
}

function readwide(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const opcode = view.getUint8(offset);
  offset += 1;

  const indexbyte = view.getUint16(offset);

  offset += 2;

  if (opcode == OPCODE.IINC) {
    const constbyte = view.getUint16(offset);
    offset += 2;

    return {
      result: {
        opcode: OPCODE.WIDE,
        operands: [indexbyte, constbyte],
      },
      offset,
    };
  }

  return {
    result: {
      opcode: OPCODE.WIDE,
      operands: [indexbyte],
    },
    offset,
  };
}

function readmultianewarray(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);

  offset += 2;

  const dimension = view.getUint8(offset);
  if (dimension < 0) {
    throw new Error('dimensions must be >= 1');
  }

  offset += 1;

  return {
    result: {
      opcode: OPCODE.MULTIANEWARRAY,
      operands: [indexbyte, dimension],
    },
    offset,
  };
}

function readifnull(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFNULL,
      operands: [branchbyte],
    },
    offset,
  };
}

function readifnonnull(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      opcode: OPCODE.IFNONNULL,
      operands: [branchbyte],
    },
    offset,
  };
}

function readgotoW(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt32(offset); // used to construct a signed 32-bit offset
  offset += 4;
  return {
    result: {
      opcode: OPCODE.GOTOW,
      operands: [branchbyte],
    },
    offset,
  };
}

function readjsrW(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt32(offset); // used to construct a signed 32-bit offset
  offset += 4;

  return {
    result: {
      opcode: OPCODE.JSRW,
      operands: [branchbyte],
    },
    offset,
  };
}

function readbreakpoint(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // reserved opcode
  return {
    result: { opcode: OPCODE.BREAKPOINT, operands: [] },
    offset,
  };
}

function readimpdep1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // reserved opcode
  return {
    result: { opcode: OPCODE.IMPDEP1, operands: [] },
    offset,
  };
}

function readimpdep2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // reserved opcode
  return {
    result: { opcode: OPCODE.IMPDEP2, operands: [] },
    offset,
  };
}
