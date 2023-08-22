import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import NativeThread from '../../NativeThreadGroup/NativeThread';

export default function runInstruction(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
): void {
  let result;
  switch (instruction.opcode) {
    case INSTRUCTION_SET.nop:
      result = run_nop(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aconst_null:
      result = run_aconst_null(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_m1:
      result = run_iconst_m1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_0:
      result = run_iconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_1:
      result = run_iconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_2:
      result = run_iconst_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_3:
      result = run_iconst_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_4:
      result = run_iconst_4(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_5:
      result = run_iconst_5(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lconst_0:
      result = run_lconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lconst_1:
      result = run_lconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fconst_0:
      result = run_fconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fconst_1:
      result = run_fconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fconst_2:
      result = run_fconst_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dconst_0:
      result = run_dconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dconst_1:
      result = run_dconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.bipush:
      result = run_bipush(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.sipush:
      result = run_sipush(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldc:
      result = run_ldc(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldc_w:
      result = run_ldc_w(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldc2_w:
      result = run_ldc2_w(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload:
      result = run_iload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload:
      result = run_lload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload:
      result = run_fload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload:
      result = run_dload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload:
      result = run_aload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_0:
      result = run_iload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_1:
      result = run_iload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_2:
      result = run_iload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_3:
      result = run_iload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_0:
      result = run_lload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_1:
      result = run_lload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_2:
      result = run_lload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_3:
      result = run_lload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_0:
      result = run_fload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_1:
      result = run_fload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_2:
      result = run_fload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_3:
      result = run_fload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_0:
      result = run_dload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_1:
      result = run_dload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_2:
      result = run_dload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_3:
      result = run_dload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_0:
      result = run_aload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_1:
      result = run_aload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_2:
      result = run_aload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_3:
      result = run_aload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iaload:
      result = run_iaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.laload:
      result = run_laload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.faload:
      result = run_faload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.daload:
      result = run_daload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aaload:
      result = run_aaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.baload:
      result = run_baload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.caload:
      result = run_caload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.saload:
      result = run_saload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore:
      result = run_istore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore:
      result = run_lstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore:
      result = run_fstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore:
      result = run_dstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore:
      result = run_astore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_0:
      result = run_istore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_1:
      result = run_istore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_2:
      result = run_istore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_3:
      result = run_istore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_0:
      result = run_lstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_1:
      result = run_lstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_2:
      result = run_lstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_3:
      result = run_lstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_0:
      result = run_fstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_1:
      result = run_fstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_2:
      result = run_fstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_3:
      result = run_fstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_0:
      result = run_dstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_1:
      result = run_dstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_2:
      result = run_dstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_3:
      result = run_dstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_0:
      result = run_astore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_1:
      result = run_astore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_2:
      result = run_astore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_3:
      result = run_astore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iastore:
      result = run_iastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lastore:
      result = run_lastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fastore:
      result = run_fastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dastore:
      result = run_dastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aastore:
      result = run_aastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.bastore:
      result = run_bastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.castore:
      result = run_castore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.sastore:
      result = run_sastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.pop:
      result = run_pop(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.pop2:
      result = run_pop2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup:
      result = run_dup(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup_x1:
      result = run_dup_x1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup_x2:
      result = run_dup_x2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2:
      result = run_dup2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2_x1:
      result = run_dup2_x1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2_x2:
      result = run_dup2_x2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.swap:
      result = run_swap(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iadd:
      result = run_iadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ladd:
      result = run_ladd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fadd:
      result = run_fadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dadd:
      result = run_dadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.isub:
      result = run_isub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lsub:
      result = run_lsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fsub:
      result = run_fsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dsub:
      result = run_dsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.imul:
      result = run_imul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lmul:
      result = run_lmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fmul:
      result = run_fmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dmul:
      result = run_dmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.idiv:
      result = run_idiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldiv:
      result = run_ldiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fdiv:
      result = run_fdiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ddiv:
      result = run_ddiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.irem:
      result = run_irem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lrem:
      result = run_lrem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.frem:
      result = run_frem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.drem:
      result = run_drem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ineg:
      result = run_ineg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lneg:
      result = run_lneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fneg:
      result = run_fneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dneg:
      result = run_dneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ishl:
      result = run_ishl(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lshl:
      result = run_lshl(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ishr:
      result = run_ishr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lshr:
      result = run_lshr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iushr:
      result = run_iushr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lushr:
      result = run_lushr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iand:
      result = run_iand(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.land:
      result = run_land(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ior:
      result = run_ior(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lor:
      result = run_lor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ixor:
      result = run_ixor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lxor:
      result = run_lxor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iinc:
      result = run_iinc(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2l:
      result = run_i2l(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2f:
      result = run_i2f(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2d:
      result = run_i2d(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.l2i:
      result = run_l2i(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.l2f:
      result = run_l2f(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.l2d:
      result = run_l2d(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.f2i:
      result = run_f2i(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.f2l:
      result = run_f2l(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.f2d:
      result = run_f2d(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.d2i:
      result = run_d2i(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.d2l:
      result = run_d2l(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.d2f:
      result = run_d2f(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2b:
      result = run_i2b(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2c:
      result = run_i2c(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2s:
      result = run_i2s(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lcmp:
      result = run_lcmp(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fcmpl:
      result = run_fcmpl(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fcmpg:
      result = run_fcmpg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dcmpl:
      result = run_dcmpl(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dcmpg:
      result = run_dcmpg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifeq:
      result = run_ifeq(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifne:
      result = run_ifne(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iflt:
      result = run_iflt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifge:
      result = run_ifge(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifgt:
      result = run_ifgt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifle:
      result = run_ifle(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpeq:
      result = run_if_icmpeq(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpne:
      result = run_if_icmpne(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmplt:
      result = run_if_icmplt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpge:
      result = run_if_icmpge(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpgt:
      result = run_if_icmpgt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmple:
      result = run_if_icmple(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_acmpeq:
      result = run_if_acmpeq(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_acmpne:
      result = run_if_acmpne(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.goto:
      result = run_goto(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.jsr:
      result = run_jsr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ret:
      result = run_ret(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.tableswitch:
      result = run_tableswitch(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lookupswitch:
      result = run_lookupswitch(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ireturn:
      result = run_ireturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lreturn:
      result = run_lreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.freturn:
      result = run_freturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dreturn:
      result = run_dreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.areturn:
      result = run_areturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.return:
      result = run_return(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.getstatic:
      result = run_getstatic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.putstatic:
      result = run_putstatic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.getfield:
      result = run_getfield(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.putfield:
      result = run_putfield(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokevirtual:
      result = run_invokevirtual(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokespecial:
      result = run_invokespecial(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokestatic:
      result = run_invokestatic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokeinterface:
      result = run_invokeinterface(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokedynamic:
      result = run_invokedynamic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.new:
      result = run_new(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.newarray:
      result = run_newarray(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.anewarray:
      result = run_anewarray(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.arraylength:
      result = run_arraylength(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.athrow:
      result = run_athrow(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.checkcast:
      result = run_checkcast(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.instanceof:
      result = run_instanceof(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.monitorenter:
      result = run_monitorenter(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.monitorexit:
      result = run_monitorexit(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.wide:
      result = run_wide(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.multianewarray:
      result = run_multianewarray(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifnull:
      result = run_ifnull(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifnonnull:
      result = run_ifnonnull(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.goto_w:
      result = run_goto_w(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.jsr_w:
      result = run_jsr_w(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.breakpoint:
      result = run_breakpoint(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.impdep1:
      result = run_impdep1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.impdep2:
      result = run_impdep2(thread, memoryArea, instruction);
      break;
    default:
      throw new Error('runInstruction: Unknown opcode received!');
  }

  thread.peekStackFrame().pc += 1;

  return result;
}

function run_nop(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  return;
}

function run_aconst_null(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_m1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_4(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iconst_5(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fconst_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_bipush(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(instruction.operands[0]);
}

function run_sipush(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ldc(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ldc_w(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ldc2_w(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(0));
}

function run_iload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(1));
}

function run_iload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(2));
}

function run_iload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(3));
}

function run_lload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_laload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_faload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_daload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_baload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_caload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_saload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_istore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_astore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_istore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(0, thread.popStack());
}

function run_istore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(1, thread.popStack());
}

function run_istore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(2, thread.popStack());
}

function run_istore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(3, thread.popStack());
}

function run_lstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_astore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_astore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_astore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_astore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_aastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_bastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_castore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_sastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_pop(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_pop2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dup(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dup_x1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dup_x2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dup2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dup2_x1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dup2_x2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_swap(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iadd(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ladd(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fadd(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dadd(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_isub(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lsub(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fsub(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dsub(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_imul(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lmul(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fmul(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dmul(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_idiv(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ldiv(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fdiv(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ddiv(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_irem(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lrem(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_frem(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_drem(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ineg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lneg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fneg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dneg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ishl(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lshl(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ishr(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lshr(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iushr(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lushr(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iand(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_land(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ior(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lor(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ixor(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lxor(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iinc(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_i2l(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_i2f(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_i2d(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_l2i(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_l2f(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_l2d(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_f2i(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_f2l(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_f2d(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_d2i(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_d2l(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_d2f(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_i2b(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_i2c(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_i2s(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lcmp(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fcmpl(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_fcmpg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dcmpl(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dcmpg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifeq(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifne(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_iflt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifge(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifgt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifle(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_icmpeq(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_icmpne(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_icmplt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_icmpge(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_icmpgt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_icmple(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_acmpeq(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_if_acmpne(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_goto(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_jsr(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ret(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_tableswitch(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lookupswitch(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ireturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_lreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_freturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_dreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_areturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_return(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_getstatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_putstatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_getfield(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_putfield(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_invokevirtual(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_invokespecial(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_invokestatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_invokeinterface(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_invokedynamic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_new(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_newarray(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_anewarray(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_arraylength(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_athrow(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_checkcast(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_instanceof(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_monitorenter(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_monitorexit(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_wide(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_multianewarray(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifnull(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_ifnonnull(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_goto_w(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_jsr_w(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_breakpoint(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_impdep1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

function run_impdep2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}
