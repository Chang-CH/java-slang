import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import { InstructionType } from '#types/ClassFile/instructions';

export function readInstructions(
  view: DataView,
  offset: number,
  code_length: number
) {
  const initial = offset;
  const end = offset + code_length;
  const code: InstructionType[] = [];
  while (offset < end) {
    ({ result: code[offset - initial], offset } = readInstruction(
      view,
      offset
    ));
  }

  return { result: code, offset };
}

function readInstruction(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  //TODO: check for overflow
  const opcode = view.getUint8(offset);
  offset += 1;

  switch (opcode) {
    case INSTRUCTION_SET.nop:
      return readnop(view, offset);
    case INSTRUCTION_SET.aconst_null:
      return readaconst_null(view, offset);
    case INSTRUCTION_SET.iconst_m1:
      return readiconst_m1(view, offset);
    case INSTRUCTION_SET.iconst_0:
      return readiconst_0(view, offset);
    case INSTRUCTION_SET.iconst_1:
      return readiconst_1(view, offset);
    case INSTRUCTION_SET.iconst_2:
      return readiconst_2(view, offset);
    case INSTRUCTION_SET.iconst_3:
      return readiconst_3(view, offset);
    case INSTRUCTION_SET.iconst_4:
      return readiconst_4(view, offset);
    case INSTRUCTION_SET.iconst_5:
      return readiconst_5(view, offset);
    case INSTRUCTION_SET.lconst_0:
      return readlconst_0(view, offset);
    case INSTRUCTION_SET.lconst_1:
      return readlconst_1(view, offset);
    case INSTRUCTION_SET.fconst_0:
      return readfconst_0(view, offset);
    case INSTRUCTION_SET.fconst_1:
      return readfconst_1(view, offset);
    case INSTRUCTION_SET.fconst_2:
      return readfconst_2(view, offset);
    case INSTRUCTION_SET.dconst_0:
      return readdconst_0(view, offset);
    case INSTRUCTION_SET.dconst_1:
      return readdconst_1(view, offset);
    case INSTRUCTION_SET.bipush:
      return readbipush(view, offset);
    case INSTRUCTION_SET.sipush:
      return readsipush(view, offset);
    case INSTRUCTION_SET.ldc:
      return readldc(view, offset);
    case INSTRUCTION_SET.ldc_w:
      return readldc_w(view, offset);
    case INSTRUCTION_SET.ldc2_w:
      return readldc2_w(view, offset);
    case INSTRUCTION_SET.iload:
      return readiload(view, offset);
    case INSTRUCTION_SET.lload:
      return readlload(view, offset);
    case INSTRUCTION_SET.fload:
      return readfload(view, offset);
    case INSTRUCTION_SET.dload:
      return readdload(view, offset);
    case INSTRUCTION_SET.aload:
      return readaload(view, offset);
    case INSTRUCTION_SET.iload_0:
      return readiload_0(view, offset);
    case INSTRUCTION_SET.iload_1:
      return readiload_1(view, offset);
    case INSTRUCTION_SET.iload_2:
      return readiload_2(view, offset);
    case INSTRUCTION_SET.iload_3:
      return readiload_3(view, offset);
    case INSTRUCTION_SET.lload_0:
      return readlload_0(view, offset);
    case INSTRUCTION_SET.lload_1:
      return readlload_1(view, offset);
    case INSTRUCTION_SET.lload_2:
      return readlload_2(view, offset);
    case INSTRUCTION_SET.lload_3:
      return readlload_3(view, offset);
    case INSTRUCTION_SET.fload_0:
      return readfload_0(view, offset);
    case INSTRUCTION_SET.fload_1:
      return readfload_1(view, offset);
    case INSTRUCTION_SET.fload_2:
      return readfload_2(view, offset);
    case INSTRUCTION_SET.fload_3:
      return readfload_3(view, offset);
    case INSTRUCTION_SET.dload_0:
      return readdload_0(view, offset);
    case INSTRUCTION_SET.dload_1:
      return readdload_1(view, offset);
    case INSTRUCTION_SET.dload_2:
      return readdload_2(view, offset);
    case INSTRUCTION_SET.dload_3:
      return readdload_3(view, offset);
    case INSTRUCTION_SET.aload_0:
      return readaload_0(view, offset);
    case INSTRUCTION_SET.aload_1:
      return readaload_1(view, offset);
    case INSTRUCTION_SET.aload_2:
      return readaload_2(view, offset);
    case INSTRUCTION_SET.aload_3:
      return readaload_3(view, offset);
    case INSTRUCTION_SET.iaload:
      return readiaload(view, offset);
    case INSTRUCTION_SET.laload:
      return readlaload(view, offset);
    case INSTRUCTION_SET.faload:
      return readfaload(view, offset);
    case INSTRUCTION_SET.daload:
      return readdaload(view, offset);
    case INSTRUCTION_SET.aaload:
      return readaaload(view, offset);
    case INSTRUCTION_SET.baload:
      return readbaload(view, offset);
    case INSTRUCTION_SET.caload:
      return readcaload(view, offset);
    case INSTRUCTION_SET.saload:
      return readsaload(view, offset);
    case INSTRUCTION_SET.istore:
      return readistore(view, offset);
    case INSTRUCTION_SET.lstore:
      return readlstore(view, offset);
    case INSTRUCTION_SET.fstore:
      return readfstore(view, offset);
    case INSTRUCTION_SET.dstore:
      return readdstore(view, offset);
    case INSTRUCTION_SET.astore:
      return readastore(view, offset);
    case INSTRUCTION_SET.istore_0:
      return readistore_0(view, offset);
    case INSTRUCTION_SET.istore_1:
      return readistore_1(view, offset);
    case INSTRUCTION_SET.istore_2:
      return readistore_2(view, offset);
    case INSTRUCTION_SET.istore_3:
      return readistore_3(view, offset);
    case INSTRUCTION_SET.lstore_0:
      return readlstore_0(view, offset);
    case INSTRUCTION_SET.lstore_1:
      return readlstore_1(view, offset);
    case INSTRUCTION_SET.lstore_2:
      return readlstore_2(view, offset);
    case INSTRUCTION_SET.lstore_3:
      return readlstore_3(view, offset);
    case INSTRUCTION_SET.fstore_0:
      return readfstore_0(view, offset);
    case INSTRUCTION_SET.fstore_1:
      return readfstore_1(view, offset);
    case INSTRUCTION_SET.fstore_2:
      return readfstore_2(view, offset);
    case INSTRUCTION_SET.fstore_3:
      return readfstore_3(view, offset);
    case INSTRUCTION_SET.dstore_0:
      return readdstore_0(view, offset);
    case INSTRUCTION_SET.dstore_1:
      return readdstore_1(view, offset);
    case INSTRUCTION_SET.dstore_2:
      return readdstore_2(view, offset);
    case INSTRUCTION_SET.dstore_3:
      return readdstore_3(view, offset);
    case INSTRUCTION_SET.astore_0:
      return readastore_0(view, offset);
    case INSTRUCTION_SET.astore_1:
      return readastore_1(view, offset);
    case INSTRUCTION_SET.astore_2:
      return readastore_2(view, offset);
    case INSTRUCTION_SET.astore_3:
      return readastore_3(view, offset);
    case INSTRUCTION_SET.iastore:
      return readiastore(view, offset);
    case INSTRUCTION_SET.lastore:
      return readlastore(view, offset);
    case INSTRUCTION_SET.fastore:
      return readfastore(view, offset);
    case INSTRUCTION_SET.dastore:
      return readdastore(view, offset);
    case INSTRUCTION_SET.aastore:
      return readaastore(view, offset);
    case INSTRUCTION_SET.bastore:
      return readbastore(view, offset);
    case INSTRUCTION_SET.castore:
      return readcastore(view, offset);
    case INSTRUCTION_SET.sastore:
      return readsastore(view, offset);
    case INSTRUCTION_SET.pop:
      return readpop(view, offset);
    case INSTRUCTION_SET.pop2:
      return readpop2(view, offset);
    case INSTRUCTION_SET.dup:
      return readdup(view, offset);
    case INSTRUCTION_SET.dup_x1:
      return readdup_x1(view, offset);
    case INSTRUCTION_SET.dup_x2:
      return readdup_x2(view, offset);
    case INSTRUCTION_SET.dup2:
      return readdup2(view, offset);
    case INSTRUCTION_SET.dup2_x1:
      return readdup2_x1(view, offset);
    case INSTRUCTION_SET.dup2_x2:
      return readdup2_x2(view, offset);
    case INSTRUCTION_SET.swap:
      return readswap(view, offset);
    case INSTRUCTION_SET.iadd:
      return readiadd(view, offset);
    case INSTRUCTION_SET.ladd:
      return readladd(view, offset);
    case INSTRUCTION_SET.fadd:
      return readfadd(view, offset);
    case INSTRUCTION_SET.dadd:
      return readdadd(view, offset);
    case INSTRUCTION_SET.isub:
      return readisub(view, offset);
    case INSTRUCTION_SET.lsub:
      return readlsub(view, offset);
    case INSTRUCTION_SET.fsub:
      return readfsub(view, offset);
    case INSTRUCTION_SET.dsub:
      return readdsub(view, offset);
    case INSTRUCTION_SET.imul:
      return readimul(view, offset);
    case INSTRUCTION_SET.lmul:
      return readlmul(view, offset);
    case INSTRUCTION_SET.fmul:
      return readfmul(view, offset);
    case INSTRUCTION_SET.dmul:
      return readdmul(view, offset);
    case INSTRUCTION_SET.idiv:
      return readidiv(view, offset);
    case INSTRUCTION_SET.ldiv:
      return readldiv(view, offset);
    case INSTRUCTION_SET.fdiv:
      return readfdiv(view, offset);
    case INSTRUCTION_SET.ddiv:
      return readddiv(view, offset);
    case INSTRUCTION_SET.irem:
      return readirem(view, offset);
    case INSTRUCTION_SET.lrem:
      return readlrem(view, offset);
    case INSTRUCTION_SET.frem:
      return readfrem(view, offset);
    case INSTRUCTION_SET.drem:
      return readdrem(view, offset);
    case INSTRUCTION_SET.ineg:
      return readineg(view, offset);
    case INSTRUCTION_SET.lneg:
      return readlneg(view, offset);
    case INSTRUCTION_SET.fneg:
      return readfneg(view, offset);
    case INSTRUCTION_SET.dneg:
      return readdneg(view, offset);
    case INSTRUCTION_SET.ishl:
      return readishl(view, offset);
    case INSTRUCTION_SET.lshl:
      return readlshl(view, offset);
    case INSTRUCTION_SET.ishr:
      return readishr(view, offset);
    case INSTRUCTION_SET.lshr:
      return readlshr(view, offset);
    case INSTRUCTION_SET.iushr:
      return readiushr(view, offset);
    case INSTRUCTION_SET.lushr:
      return readlushr(view, offset);
    case INSTRUCTION_SET.iand:
      return readiand(view, offset);
    case INSTRUCTION_SET.land:
      return readland(view, offset);
    case INSTRUCTION_SET.ior:
      return readior(view, offset);
    case INSTRUCTION_SET.lor:
      return readlor(view, offset);
    case INSTRUCTION_SET.ixor:
      return readixor(view, offset);
    case INSTRUCTION_SET.lxor:
      return readlxor(view, offset);
    case INSTRUCTION_SET.iinc:
      return readiinc(view, offset);
    case INSTRUCTION_SET.i2l:
      return readi2l(view, offset);
    case INSTRUCTION_SET.i2f:
      return readi2f(view, offset);
    case INSTRUCTION_SET.i2d:
      return readi2d(view, offset);
    case INSTRUCTION_SET.l2i:
      return readl2i(view, offset);
    case INSTRUCTION_SET.l2f:
      return readl2f(view, offset);
    case INSTRUCTION_SET.l2d:
      return readl2d(view, offset);
    case INSTRUCTION_SET.f2i:
      return readf2i(view, offset);
    case INSTRUCTION_SET.f2l:
      return readf2l(view, offset);
    case INSTRUCTION_SET.f2d:
      return readf2d(view, offset);
    case INSTRUCTION_SET.d2i:
      return readd2i(view, offset);
    case INSTRUCTION_SET.d2l:
      return readd2l(view, offset);
    case INSTRUCTION_SET.d2f:
      return readd2f(view, offset);
    case INSTRUCTION_SET.i2b:
      return readi2b(view, offset);
    case INSTRUCTION_SET.i2c:
      return readi2c(view, offset);
    case INSTRUCTION_SET.i2s:
      return readi2s(view, offset);
    case INSTRUCTION_SET.lcmp:
      return readlcmp(view, offset);
    case INSTRUCTION_SET.fcmpl:
      return readfcmpl(view, offset);
    case INSTRUCTION_SET.fcmpg:
      return readfcmpg(view, offset);
    case INSTRUCTION_SET.dcmpl:
      return readdcmpl(view, offset);
    case INSTRUCTION_SET.dcmpg:
      return readdcmpg(view, offset);
    case INSTRUCTION_SET.ifeq:
      return readifeq(view, offset);
    case INSTRUCTION_SET.ifne:
      return readifne(view, offset);
    case INSTRUCTION_SET.iflt:
      return readiflt(view, offset);
    case INSTRUCTION_SET.ifge:
      return readifge(view, offset);
    case INSTRUCTION_SET.ifgt:
      return readifgt(view, offset);
    case INSTRUCTION_SET.ifle:
      return readifle(view, offset);
    case INSTRUCTION_SET.if_icmpeq:
      return readif_icmpeq(view, offset);
    case INSTRUCTION_SET.if_icmpne:
      return readif_icmpne(view, offset);
    case INSTRUCTION_SET.if_icmplt:
      return readif_icmplt(view, offset);
    case INSTRUCTION_SET.if_icmpge:
      return readif_icmpge(view, offset);
    case INSTRUCTION_SET.if_icmpgt:
      return readif_icmpgt(view, offset);
    case INSTRUCTION_SET.if_icmple:
      return readif_icmple(view, offset);
    case INSTRUCTION_SET.if_acmpeq:
      return readif_acmpeq(view, offset);
    case INSTRUCTION_SET.if_acmpne:
      return readif_acmpne(view, offset);
    case INSTRUCTION_SET.goto:
      return readgoto(view, offset);
    case INSTRUCTION_SET.jsr:
      return readjsr(view, offset);
    case INSTRUCTION_SET.ret:
      return readret(view, offset);
    case INSTRUCTION_SET.tableswitch:
      return readtableswitch(view, offset);
    case INSTRUCTION_SET.lookupswitch:
      return readlookupswitch(view, offset);
    case INSTRUCTION_SET.ireturn:
      return readireturn(view, offset);
    case INSTRUCTION_SET.lreturn:
      return readlreturn(view, offset);
    case INSTRUCTION_SET.freturn:
      return readfreturn(view, offset);
    case INSTRUCTION_SET.dreturn:
      return readdreturn(view, offset);
    case INSTRUCTION_SET.areturn:
      return readareturn(view, offset);
    case INSTRUCTION_SET.return:
      return readreturn(view, offset);
    case INSTRUCTION_SET.getstatic:
      return readgetstatic(view, offset);
    case INSTRUCTION_SET.putstatic:
      return readputstatic(view, offset);
    case INSTRUCTION_SET.getfield:
      return readgetfield(view, offset);
    case INSTRUCTION_SET.putfield:
      return readputfield(view, offset);
    case INSTRUCTION_SET.invokevirtual:
      return readinvokevirtual(view, offset);
    case INSTRUCTION_SET.invokespecial:
      return readinvokespecial(view, offset);
    case INSTRUCTION_SET.invokestatic:
      return readinvokestatic(view, offset);
    case INSTRUCTION_SET.invokeinterface:
      return readinvokeinterface(view, offset);
    case INSTRUCTION_SET.invokedynamic:
      return readinvokedynamic(view, offset);
    case INSTRUCTION_SET.new:
      return readnew(view, offset);
    case INSTRUCTION_SET.newarray:
      return readnewarray(view, offset);
    case INSTRUCTION_SET.anewarray:
      return readanewarray(view, offset);
    case INSTRUCTION_SET.arraylength:
      return readarraylength(view, offset);
    case INSTRUCTION_SET.athrow:
      return readathrow(view, offset);
    case INSTRUCTION_SET.checkcast:
      return readcheckcast(view, offset);
    case INSTRUCTION_SET.instanceof:
      return readinstanceof(view, offset);
    case INSTRUCTION_SET.monitorenter:
      return readmonitorenter(view, offset);
    case INSTRUCTION_SET.monitorexit:
      return readmonitorexit(view, offset);
    case INSTRUCTION_SET.wide:
      return readwide(view, offset);
    case INSTRUCTION_SET.multianewarray:
      return readmultianewarray(view, offset);
    case INSTRUCTION_SET.ifnull:
      return readifnull(view, offset);
    case INSTRUCTION_SET.ifnonnull:
      return readifnonnull(view, offset);
    case INSTRUCTION_SET.goto_w:
      return readgoto_w(view, offset);
    case INSTRUCTION_SET.jsr_w:
      return readjsr_w(view, offset);
    case INSTRUCTION_SET.breakpoint:
      return readbreakpoint(view, offset);
    case INSTRUCTION_SET.impdep1:
      return readimpdep1(view, offset);
    case INSTRUCTION_SET.impdep2:
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
    result: { opcode: INSTRUCTION_SET.nop, operands: [] },
    offset,
  };
}

function readaconst_null(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aconst_null, operands: [] },
    offset,
  };
}

function readiconst_m1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_m1, operands: [] },
    offset,
  };
}

function readiconst_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_0, operands: [] },
    offset,
  };
}

function readiconst_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_1, operands: [] },
    offset,
  };
}

function readiconst_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_2, operands: [] },
    offset,
  };
}

function readiconst_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_3, operands: [] },
    offset,
  };
}

function readiconst_4(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_4, operands: [] },
    offset,
  };
}

function readiconst_5(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iconst_5, operands: [] },
    offset,
  };
}

function readlconst_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lconst_0, operands: [] },
    offset,
  };
}

function readlconst_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lconst_1, operands: [] },
    offset,
  };
}

function readfconst_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fconst_0, operands: [] },
    offset,
  };
}

function readfconst_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fconst_1, operands: [] },
    offset,
  };
}

function readfconst_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fconst_2, operands: [] },
    offset,
  };
}

function readdconst_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dconst_0, operands: [] },
    offset,
  };
}

function readdconst_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dconst_1, operands: [] },
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
    result: { opcode: INSTRUCTION_SET.bipush, operands: [byte] },
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
    result: { opcode: INSTRUCTION_SET.sipush, operands: [value] },
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
    result: { opcode: INSTRUCTION_SET.ldc, operands: [index] },
    offset,
  };
}

function readldc_w(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.ldc_w, operands: [indexbyte] },
    offset,
  };
}

function readldc2_w(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.ldc2_w, operands: [indexbyte] },
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
    result: { opcode: INSTRUCTION_SET.iload, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.lload, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.fload, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.dload, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.aload, operands: [index] },
    offset,
  };
}

function readiload_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iload_0, operands: [] },
    offset,
  };
}

function readiload_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iload_1, operands: [] },
    offset,
  };
}

function readiload_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iload_2, operands: [] },
    offset,
  };
}

function readiload_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iload_3, operands: [] },
    offset,
  };
}

function readlload_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lload_0, operands: [] },
    offset,
  };
}

function readlload_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lload_1, operands: [] },
    offset,
  };
}

function readlload_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lload_2, operands: [] },
    offset,
  };
}

function readlload_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lload_3, operands: [] },
    offset,
  };
}

function readfload_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fload_0, operands: [] },
    offset,
  };
}

function readfload_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fload_1, operands: [] },
    offset,
  };
}

function readfload_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fload_2, operands: [] },
    offset,
  };
}

function readfload_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fload_3, operands: [] },
    offset,
  };
}

function readdload_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dload_0, operands: [] },
    offset,
  };
}

function readdload_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dload_1, operands: [] },
    offset,
  };
}

function readdload_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dload_2, operands: [] },
    offset,
  };
}

function readdload_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dload_3, operands: [] },
    offset,
  };
}

function readaload_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aload_0, operands: [] },
    offset,
  };
}

function readaload_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aload_1, operands: [] },
    offset,
  };
}

function readaload_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aload_2, operands: [] },
    offset,
  };
}

function readaload_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aload_3, operands: [] },
    offset,
  };
}

function readiaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iaload, operands: [] },
    offset,
  };
}

function readlaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.laload, operands: [] },
    offset,
  };
}

function readfaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.faload, operands: [] },
    offset,
  };
}

function readdaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.daload, operands: [] },
    offset,
  };
}

function readaaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aaload, operands: [] },
    offset,
  };
}

function readbaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.baload, operands: [] },
    offset,
  };
}

function readcaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.caload, operands: [] },
    offset,
  };
}

function readsaload(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.saload, operands: [] },
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
    result: { opcode: INSTRUCTION_SET.istore, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.lstore, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.fstore, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.dstore, operands: [index] },
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
    result: { opcode: INSTRUCTION_SET.astore, operands: [index] },
    offset,
  };
}

function readistore_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.istore_0, operands: [] },
    offset,
  };
}

function readistore_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.istore_1, operands: [] },
    offset,
  };
}

function readistore_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.istore_2, operands: [] },
    offset,
  };
}

function readistore_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.istore_3, operands: [] },
    offset,
  };
}

function readlstore_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lstore_0, operands: [] },
    offset,
  };
}

function readlstore_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lstore_1, operands: [] },
    offset,
  };
}

function readlstore_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lstore_2, operands: [] },
    offset,
  };
}

function readlstore_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lstore_3, operands: [] },
    offset,
  };
}

function readfstore_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fstore_0, operands: [] },
    offset,
  };
}

function readfstore_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fstore_1, operands: [] },
    offset,
  };
}

function readfstore_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fstore_2, operands: [] },
    offset,
  };
}

function readfstore_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fstore_3, operands: [] },
    offset,
  };
}

function readdstore_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dstore_0, operands: [] },
    offset,
  };
}

function readdstore_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dstore_1, operands: [] },
    offset,
  };
}

function readdstore_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dstore_2, operands: [] },
    offset,
  };
}

function readdstore_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dstore_3, operands: [] },
    offset,
  };
}

function readastore_0(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.astore_0, operands: [] },
    offset,
  };
}

function readastore_1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.astore_1, operands: [] },
    offset,
  };
}

function readastore_2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.astore_2, operands: [] },
    offset,
  };
}

function readastore_3(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.astore_3, operands: [] },
    offset,
  };
}

function readiastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iastore, operands: [] },
    offset,
  };
}

function readlastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lastore, operands: [] },
    offset,
  };
}

function readfastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fastore, operands: [] },
    offset,
  };
}

function readdastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dastore, operands: [] },
    offset,
  };
}

function readaastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.aastore, operands: [] },
    offset,
  };
}

function readbastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.bastore, operands: [] },
    offset,
  };
}

function readcastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.castore, operands: [] },
    offset,
  };
}

function readsastore(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.sastore, operands: [] },
    offset,
  };
}

function readpop(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.pop, operands: [] },
    offset,
  };
}

function readpop2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.pop2, operands: [] },
    offset,
  };
}

function readdup(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dup, operands: [] },
    offset,
  };
}

function readdup_x1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dup_x1, operands: [] },
    offset,
  };
}

function readdup_x2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dup_x2, operands: [] },
    offset,
  };
}

function readdup2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dup2, operands: [] },
    offset,
  };
}

function readdup2_x1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dup2_x1, operands: [] },
    offset,
  };
}

function readdup2_x2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dup2_x2, operands: [] },
    offset,
  };
}

function readswap(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.swap, operands: [] },
    offset,
  };
}

function readiadd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iadd, operands: [] },
    offset,
  };
}

function readladd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ladd, operands: [] },
    offset,
  };
}

function readfadd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fadd, operands: [] },
    offset,
  };
}

function readdadd(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dadd, operands: [] },
    offset,
  };
}

function readisub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.isub, operands: [] },
    offset,
  };
}

function readlsub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lsub, operands: [] },
    offset,
  };
}

function readfsub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fsub, operands: [] },
    offset,
  };
}

function readdsub(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dsub, operands: [] },
    offset,
  };
}

function readimul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.imul, operands: [] },
    offset,
  };
}

function readlmul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lmul, operands: [] },
    offset,
  };
}

function readfmul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fmul, operands: [] },
    offset,
  };
}

function readdmul(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dmul, operands: [] },
    offset,
  };
}

function readidiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.idiv, operands: [] },
    offset,
  };
}

function readldiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ldiv, operands: [] },
    offset,
  };
}

function readfdiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fdiv, operands: [] },
    offset,
  };
}

function readddiv(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ddiv, operands: [] },
    offset,
  };
}

function readirem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.irem, operands: [] },
    offset,
  };
}

function readlrem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lrem, operands: [] },
    offset,
  };
}

function readfrem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.frem, operands: [] },
    offset,
  };
}

function readdrem(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.drem, operands: [] },
    offset,
  };
}

function readineg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ineg, operands: [] },
    offset,
  };
}

function readlneg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lneg, operands: [] },
    offset,
  };
}

function readfneg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fneg, operands: [] },
    offset,
  };
}

function readdneg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dneg, operands: [] },
    offset,
  };
}

function readishl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ishl, operands: [] },
    offset,
  };
}

function readlshl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lshl, operands: [] },
    offset,
  };
}

function readishr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ishr, operands: [] },
    offset,
  };
}

function readlshr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lshr, operands: [] },
    offset,
  };
}

function readiushr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iushr, operands: [] },
    offset,
  };
}

function readlushr(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lushr, operands: [] },
    offset,
  };
}

function readiand(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.iand, operands: [] },
    offset,
  };
}

function readland(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.land, operands: [] },
    offset,
  };
}

function readior(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ior, operands: [] },
    offset,
  };
}

function readlor(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lor, operands: [] },
    offset,
  };
}

function readixor(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ixor, operands: [] },
    offset,
  };
}

function readlxor(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lxor, operands: [] },
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
    result: { opcode: INSTRUCTION_SET.iinc, operands: [index, constant] },
    offset,
  };
}

function readi2l(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.i2l, operands: [] },
    offset,
  };
}

function readi2f(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.i2f, operands: [] },
    offset,
  };
}

function readi2d(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.i2d, operands: [] },
    offset,
  };
}

function readl2i(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.l2i, operands: [] },
    offset,
  };
}

function readl2f(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.l2f, operands: [] },
    offset,
  };
}

function readl2d(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.l2d, operands: [] },
    offset,
  };
}

function readf2i(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.f2i, operands: [] },
    offset,
  };
}

function readf2l(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.f2l, operands: [] },
    offset,
  };
}

function readf2d(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.f2d, operands: [] },
    offset,
  };
}

function readd2i(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.d2i, operands: [] },
    offset,
  };
}

function readd2l(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.d2l, operands: [] },
    offset,
  };
}

function readd2f(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.d2f, operands: [] },
    offset,
  };
}

function readi2b(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.i2b, operands: [] },
    offset,
  };
}

function readi2c(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.i2c, operands: [] },
    offset,
  };
}

function readi2s(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.i2s, operands: [] },
    offset,
  };
}

function readlcmp(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lcmp, operands: [] },
    offset,
  };
}

function readfcmpl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fcmpl, operands: [] },
    offset,
  };
}

function readfcmpg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.fcmpg, operands: [] },
    offset,
  };
}

function readdcmpl(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dcmpl, operands: [] },
    offset,
  };
}

function readdcmpg(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dcmpg, operands: [] },
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
    result: { opcode: INSTRUCTION_SET.ifeq, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.ifne, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.iflt, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.ifge, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.ifgt, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.ifle, operands: [branchbyte] },
    offset,
  };
}

function readif_icmpeq(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_icmpeq, operands: [branchbyte] },
    offset,
  };
}

function readif_icmpne(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_icmpne, operands: [branchbyte] },
    offset,
  };
}

function readif_icmplt(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_icmplt, operands: [branchbyte] },
    offset,
  };
}

function readif_icmpge(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_icmpge, operands: [branchbyte] },
    offset,
  };
}

function readif_icmpgt(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_icmpgt, operands: [branchbyte] },
    offset,
  };
}

function readif_icmple(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_icmple, operands: [branchbyte] },
    offset,
  };
}

function readif_acmpeq(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_acmpeq, operands: [branchbyte] },
    offset,
  };
}

function readif_acmpne(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt16(offset);
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.if_acmpne, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.goto, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.jsr, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.ret, operands: [index] },
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
      opcode: INSTRUCTION_SET.tableswitch,
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
  const npair_count = view.getInt32(offset);
  offset += 4;

  const npairs = []; // 0 indexed
  for (let i = 0; i < npair_count; i++) {
    npairs.push(view.getInt32(offset));
    offset += 4;
  }

  return {
    result: {
      opcode: INSTRUCTION_SET.tableswitch,
      operands: [def, npair_count, npairs],
    },
    offset,
  };
}

function readireturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.ireturn, operands: [] },
    offset,
  };
}

function readlreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.lreturn, operands: [] },
    offset,
  };
}

function readfreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.freturn, operands: [] },
    offset,
  };
}

function readdreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.dreturn, operands: [] },
    offset,
  };
}

function readareturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.areturn, operands: [] },
    offset,
  };
}

function readreturn(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.return, operands: [] },
    offset,
  };
}

function readgetstatic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.getstatic, operands: [indexbyte] },
    offset,
  };
}

function readputstatic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.putstatic, operands: [indexbyte] },
    offset,
  };
}

function readgetfield(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.getfield, operands: [indexbyte] },
    offset,
  };
}

function readputfield(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.putfield, operands: [indexbyte] },
    offset,
  };
}

function readinvokevirtual(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.invokevirtual, operands: [indexbyte] },
    offset,
  };
}

function readinvokespecial(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.invokespecial, operands: [indexbyte] },
    offset,
  };
}

function readinvokestatic(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.invokestatic, operands: [indexbyte] },
    offset,
  };
}

function readinvokeinterface(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
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
      opcode: INSTRUCTION_SET.invokeinterface,
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
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
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
    result: { opcode: INSTRUCTION_SET.invokedynamic, operands: [indexbyte] },
    offset,
  };
}

function readnew(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.new, operands: [indexbyte] },
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
    result: { opcode: INSTRUCTION_SET.newarray, operands: [atype] },
    offset,
  };
}

function readanewarray(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;
  return {
    result: { opcode: INSTRUCTION_SET.anewarray, operands: [indexbyte] },
    offset,
  };
}

function readarraylength(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.arraylength, operands: [] },
    offset,
  };
}

function readathrow(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.athrow, operands: [] },
    offset,
  };
}

function readcheckcast(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // FIXME: may have to use type checker project?
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.checkcast, operands: [indexbyte] },
    offset,
  };
}

function readinstanceof(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // FIXME: may have to use type checker project?
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  return {
    result: { opcode: INSTRUCTION_SET.instanceof, operands: [indexbyte] },
    offset,
  };
}

function readmonitorenter(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.monitorenter, operands: [] },
    offset,
  };
}

function readmonitorexit(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  return {
    result: { opcode: INSTRUCTION_SET.monitorexit, operands: [] },
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
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  if (opcode == INSTRUCTION_SET.iinc) {
    const constbyte = view.getUint16(offset);
    offset += 2;

    return {
      result: {
        opcode: INSTRUCTION_SET.wide,
        operands: [indexbyte, constbyte],
      },
      offset,
    };
  }

  return {
    result: { opcode: INSTRUCTION_SET.wide, operands: [indexbyte] },
    offset,
  };
}

function readmultianewarray(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const indexbyte = view.getUint16(offset);
  console.warn('FIXME: Not verified that index is unsigned. check specs.');
  offset += 2;

  const dimension = view.getUint8(offset);
  if (dimension < 0) {
    throw new Error('dimensions must be >= 1');
  }

  offset += 1;

  return {
    result: {
      opcode: INSTRUCTION_SET.multianewarray,
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
    result: { opcode: INSTRUCTION_SET.ifnull, operands: [branchbyte] },
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
    result: { opcode: INSTRUCTION_SET.ifnonnull, operands: [branchbyte] },
    offset,
  };
}

function readgoto_w(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt32(offset); // used to construct a signed 32-bit offset
  offset += 4;
  return {
    result: { opcode: INSTRUCTION_SET.goto_w, operands: [branchbyte] },
    offset,
  };
}

function readjsr_w(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  const branchbyte = view.getInt32(offset); // used to construct a signed 32-bit offset
  offset += 4;

  return {
    result: { opcode: INSTRUCTION_SET.jsr_w, operands: [branchbyte] },
    offset,
  };
}

function readbreakpoint(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // reserved opcode
  return {
    result: { opcode: INSTRUCTION_SET.breakpoint, operands: [] },
    offset,
  };
}

function readimpdep1(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // reserved opcode
  return {
    result: { opcode: INSTRUCTION_SET.impdep1, operands: [] },
    offset,
  };
}

function readimpdep2(
  view: DataView,
  offset: number
): { result: InstructionType; offset: number } {
  // reserved opcode
  return {
    result: { opcode: INSTRUCTION_SET.impdep2, operands: [] },
    offset,
  };
}
