import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import * as comparisons from './comparisons';
import * as constants from './constants';
import * as control from './control';
import * as conversions from './conversions';
import * as extended from './extended';
import * as loads from './loads';
import * as math from './math';
import * as references from './references';
import * as reserved from './reserved';
import * as stack from './stack';
import * as stores from './stores';

export default function runInstruction(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
): void {
  let result;
  switch (instruction.opcode) {
    case INSTRUCTION_SET.nop:
      result = constants.runNop(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aconst_null:
      result = constants.runAconstNull(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_m1:
      result = constants.runIconstM1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_0:
      result = constants.runIconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_1:
      result = constants.runIconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_2:
      result = constants.runIconst_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_3:
      result = constants.runIconst_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_4:
      result = constants.runIconst_4(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iconst_5:
      result = constants.runIconst_5(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lconst_0:
      result = constants.runLconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lconst_1:
      result = constants.runLconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fconst_0:
      result = constants.runFconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fconst_1:
      result = constants.runFconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fconst_2:
      result = constants.runFconst_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dconst_0:
      result = constants.runDconst_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dconst_1:
      result = constants.runDconst_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.bipush:
      result = constants.runBipush(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.sipush:
      instruction;
      result = constants.runSipush(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldc:
      result = constants.runLdc(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldc:
      result = constants.runLdcW(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldc2_w:
      result = constants.runLdc2W(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload:
      result = loads.runIload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload:
      result = loads.runLload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload:
      result = loads.runFload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload:
      result = loads.runDload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload:
      result = loads.runAload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_0:
      result = loads.runIload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_1:
      result = loads.runIload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_2:
      result = loads.runIload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iload_3:
      result = loads.runIload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_0:
      result = loads.runLload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_1:
      result = loads.runLload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_2:
      result = loads.runLload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lload_3:
      result = loads.runLload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_0:
      result = loads.runFload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_1:
      result = loads.runFload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_2:
      result = loads.runFload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fload_3:
      result = loads.runFload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_0:
      result = loads.runDload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_1:
      result = loads.runDload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_2:
      result = loads.runDload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dload_3:
      result = loads.runDload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_0:
      result = loads.runAload_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_1:
      result = loads.runAload_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_2:
      result = loads.runAload_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aload_3:
      result = loads.runAload_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iaload:
      result = loads.runIaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.laload:
      result = loads.runLaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.faload:
      result = loads.runFaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.daload:
      result = loads.runDaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aaload:
      result = loads.runAaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.baload:
      result = loads.runBaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.caload:
      result = loads.runCaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.saload:
      result = loads.runSaload(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore:
      result = stores.runIstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore:
      result = stores.runLstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore:
      result = stores.runFstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore:
      result = stores.runDstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore:
      result = stores.runAstore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_0:
      result = stores.runIstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_1:
      result = stores.runIstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_2:
      result = stores.runIstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.istore_3:
      result = stores.runIstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_0:
      result = stores.runLstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_1:
      result = stores.runLstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_2:
      result = stores.runLstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lstore_3:
      result = stores.runLstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_0:
      result = stores.runFstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_1:
      result = stores.runFstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_2:
      result = stores.runFstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fstore_3:
      result = stores.runFstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_0:
      result = stores.runDstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_1:
      result = stores.runDstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_2:
      result = stores.runDstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dstore_3:
      result = stores.runDstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_0:
      result = stores.runAstore_0(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_1:
      result = stores.runAstore_1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_2:
      result = stores.runAstore_2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.astore_3:
      result = stores.runAstore_3(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iastore:
      result = stores.runIastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lastore:
      result = stores.runLastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fastore:
      result = stores.runFastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dastore:
      result = stores.runDastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.aastore:
      result = stores.runAastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.bastore:
      result = stores.runBastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.castore:
      result = stores.runCastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.sastore:
      result = stores.runSastore(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.pop:
      result = stack.runPop(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.pop2:
      result = stack.runPop2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup:
      result = stack.runDup(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup_x1:
      result = stack.runDupX1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2:
      result = stack.runDup2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2:
      result = stack.runDup2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2_x1:
      result = stack.runDup2X1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dup2_x2:
      result = stack.runDup2X2(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.swap:
      result = stack.runSwap(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iadd:
      result = math.runIadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ladd:
      result = math.runLadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fadd:
      result = math.runFadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dadd:
      result = math.runDadd(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.isub:
      result = math.runIsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lsub:
      result = math.runLsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fsub:
      result = math.runFsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dsub:
      result = math.runDsub(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.imul:
      result = math.runImul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lmul:
      result = math.runLmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fmul:
      result = math.runFmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dmul:
      result = math.runDmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.idiv:
      result = math.runIdiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ldiv:
      result = math.runLdiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fdiv:
      result = math.runFdiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ddiv:
      result = math.runDdiv(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.irem:
      result = math.runIrem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lrem:
      result = math.runLrem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.frem:
      result = math.runFrem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.drem:
      result = math.runDrem(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ineg:
      result = math.runIneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lneg:
      result = math.runLneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fneg:
      result = math.runFneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dneg:
      result = math.runDneg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ishl:
      result = math.runIshl(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lshl:
      result = math.runLshl(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ishr:
      result = math.runIshr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lshr:
      result = math.runLshr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iushr:
      result = math.runIushr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lushr:
      result = math.runLushr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iand:
      result = math.runIand(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.land:
      result = math.runLand(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ior:
      result = math.runIor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lor:
      result = math.runLor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ixor:
      result = math.runIxor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lxor:
      result = math.runLxor(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iinc:
      result = math.runIinc(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2l:
      result = conversions.runI2l(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2f:
      result = conversions.runI2f(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2d:
      result = conversions.runI2d(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.l2i:
      result = conversions.runL2i(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.l2f:
      result = conversions.runL2f(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.l2d:
      result = conversions.runL2d(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.f2i:
      result = conversions.runF2i(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.f2l:
      result = conversions.runF2l(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.f2d:
      result = conversions.runF2d(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.d2i:
      result = conversions.runD2i(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.d2l:
      result = conversions.runD2l(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.d2f:
      result = conversions.runD2f(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2b:
      result = conversions.runI2b(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2c:
      result = conversions.runI2c(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.i2s:
      result = conversions.runI2s(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lcmp:
      result = comparisons.runLcmp(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fcmpl:
      result = math.runFmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.fcmpg:
      result = comparisons.runFcmpg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dcmpl:
      result = math.runDmul(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dcmpg:
      result = comparisons.runDcmpg(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifeq:
      result = comparisons.runIfeq(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifne:
      result = comparisons.runIfne(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.iflt:
      result = comparisons.runIflt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifge:
      result = comparisons.runIfge(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifgt:
      result = comparisons.runIfgt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifle:
      result = comparisons.runIfle(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpeq:
      result = comparisons.runIfIcmpeq(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpne:
      result = comparisons.runIfIcmpne(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmplt:
      result = comparisons.runIfIcmplt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpge:
      result = comparisons.runIfIcmpge(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmpgt:
      result = comparisons.runIfIcmpgt(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_icmple:
      result = comparisons.runIfIcmple(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_acmpeq:
      result = comparisons.runIfAcmpeq(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.if_acmpne:
      result = comparisons.runIfAcmpne(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.goto:
      result = control.runGoto(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.jsr:
      result = control.runJsr(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ret:
      result = control.runRet(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.tableswitch:
      result = control.runTableswitch(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lookupswitch:
      result = control.runLookupswitch(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ireturn:
      result = control.runIreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.lreturn:
      result = control.runLreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.freturn:
      result = control.runFreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.dreturn:
      result = control.runDreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.areturn:
      result = control.runAreturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.return:
      result = control.runReturn(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.getstatic:
      result = references.runGetstatic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.putstatic:
      result = references.runPutstatic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.getfield:
      result = references.runGetfield(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.putfield:
      result = references.runPutfield(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokevirtual:
      result = references.runInvokevirtual(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokespecial:
      result = references.runInvokespecial(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokestatic:
      result = references.runInvokestatic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokeinterface:
      result = references.runInvokeinterface(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.invokedynamic:
      result = references.runInvokedynamic(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.new:
      result = references.runNew(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.newarray:
      result = references.runNewarray(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.anewarray:
      result = references.runAnewarray(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.arraylength:
      result = references.runArraylength(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.athrow:
      result = references.runAthrow(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.checkcast:
      result = references.runCheckcast(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.instanceof:
      result = references.runInstanceof(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.monitorenter:
      result = references.runMonitorenter(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.monitorexit:
      result = references.runMonitorexit(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.wide:
      result = extended.runWide(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.multianewarray:
      result = extended.runMultianewarray(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifnull:
      result = extended.runIfnull(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.ifnonnull:
      result = extended.runIfnonnull(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.goto:
      result = extended.runGotoW(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.jsr:
      result = extended.runJsrW(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.breakpoint:
      result = reserved.runBreakpoint(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.impdep1:
      result = reserved.runImpdep1(thread, memoryArea, instruction);
      break;
    case INSTRUCTION_SET.impdep2:
      result = reserved.runImpdep2(thread, memoryArea, instruction);
      break;
    default:
      throw new Error('runInstruction: Unknown opcode received!');
  }
  return result;
}
