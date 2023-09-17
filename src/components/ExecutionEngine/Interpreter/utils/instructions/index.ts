import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassRef/instructions';
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
    case OPCODE.NOP:
      result = constants.runNop(thread, memoryArea, instruction);
      break;
    case OPCODE.ACONSTNULL:
      result = constants.runAconstNull(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONSTM1:
      result = constants.runIconstM1(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONST0:
      result = constants.runIconst0(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONST1:
      result = constants.runIconst1(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONST2:
      result = constants.runIconst2(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONST3:
      result = constants.runIconst3(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONST4:
      result = constants.runIconst4(thread, memoryArea, instruction);
      break;
    case OPCODE.ICONST5:
      result = constants.runIconst5(thread, memoryArea, instruction);
      break;
    case OPCODE.LCONST0:
      result = constants.runLconst0(thread, memoryArea, instruction);
      break;
    case OPCODE.LCONST1:
      result = constants.runLconst1(thread, memoryArea, instruction);
      break;
    case OPCODE.FCONST0:
      result = constants.runFconst0(thread, memoryArea, instruction);
      break;
    case OPCODE.FCONST1:
      result = constants.runFconst1(thread, memoryArea, instruction);
      break;
    case OPCODE.FCONST2:
      result = constants.runFconst2(thread, memoryArea, instruction);
      break;
    case OPCODE.DCONST0:
      result = constants.runDconst0(thread, memoryArea, instruction);
      break;
    case OPCODE.DCONST1:
      result = constants.runDconst1(thread, memoryArea, instruction);
      break;
    case OPCODE.BIPUSH:
      result = constants.runBipush(thread, memoryArea, instruction);
      break;
    case OPCODE.SIPUSH:
      instruction;
      result = constants.runSipush(thread, memoryArea, instruction);
      break;
    case OPCODE.LDC:
      result = constants.runLdc(thread, memoryArea, instruction);
      break;
    case OPCODE.LDCW:
      result = constants.runLdcW(thread, memoryArea, instruction);
      break;
    case OPCODE.LDC2W:
      result = constants.runLdc2W(thread, memoryArea, instruction);
      break;
    case OPCODE.ILOAD:
      result = loads.runIload(thread, memoryArea, instruction);
      break;
    case OPCODE.LLOAD:
      result = loads.runLload(thread, memoryArea, instruction);
      break;
    case OPCODE.FLOAD:
      result = loads.runFload(thread, memoryArea, instruction);
      break;
    case OPCODE.DLOAD:
      result = loads.runDload(thread, memoryArea, instruction);
      break;
    case OPCODE.ALOAD:
      result = loads.runAload(thread, memoryArea, instruction);
      break;
    case OPCODE.ILOAD0:
      result = loads.runIload0(thread, memoryArea, instruction);
      break;
    case OPCODE.ILOAD1:
      result = loads.runIload1(thread, memoryArea, instruction);
      break;
    case OPCODE.ILOAD2:
      result = loads.runIload2(thread, memoryArea, instruction);
      break;
    case OPCODE.ILOAD3:
      result = loads.runIload3(thread, memoryArea, instruction);
      break;
    case OPCODE.LLOAD0:
      result = loads.runLload0(thread, memoryArea, instruction);
      break;
    case OPCODE.LLOAD1:
      result = loads.runLload1(thread, memoryArea, instruction);
      break;
    case OPCODE.LLOAD2:
      result = loads.runLload2(thread, memoryArea, instruction);
      break;
    case OPCODE.LLOAD3:
      result = loads.runLload3(thread, memoryArea, instruction);
      break;
    case OPCODE.FLOAD0:
      result = loads.runFload0(thread, memoryArea, instruction);
      break;
    case OPCODE.FLOAD1:
      result = loads.runFload1(thread, memoryArea, instruction);
      break;
    case OPCODE.FLOAD2:
      result = loads.runFload2(thread, memoryArea, instruction);
      break;
    case OPCODE.FLOAD3:
      result = loads.runFload3(thread, memoryArea, instruction);
      break;
    case OPCODE.DLOAD0:
      result = loads.runDload0(thread, memoryArea, instruction);
      break;
    case OPCODE.DLOAD1:
      result = loads.runDload1(thread, memoryArea, instruction);
      break;
    case OPCODE.DLOAD2:
      result = loads.runDload2(thread, memoryArea, instruction);
      break;
    case OPCODE.DLOAD3:
      result = loads.runDload3(thread, memoryArea, instruction);
      break;
    case OPCODE.ALOAD0:
      result = loads.runAload0(thread, memoryArea, instruction);
      break;
    case OPCODE.ALOAD1:
      result = loads.runAload1(thread, memoryArea, instruction);
      break;
    case OPCODE.ALOAD2:
      result = loads.runAload2(thread, memoryArea, instruction);
      break;
    case OPCODE.ALOAD3:
      result = loads.runAload3(thread, memoryArea, instruction);
      break;
    case OPCODE.IALOAD:
      result = loads.runIaload(thread, memoryArea, instruction);
      break;
    case OPCODE.LALOAD:
      result = loads.runLaload(thread, memoryArea, instruction);
      break;
    case OPCODE.FALOAD:
      result = loads.runFaload(thread, memoryArea, instruction);
      break;
    case OPCODE.DALOAD:
      result = loads.runDaload(thread, memoryArea, instruction);
      break;
    case OPCODE.AALOAD:
      result = loads.runAaload(thread, memoryArea, instruction);
      break;
    case OPCODE.BALOAD:
      result = loads.runBaload(thread, memoryArea, instruction);
      break;
    case OPCODE.CALOAD:
      result = loads.runCaload(thread, memoryArea, instruction);
      break;
    case OPCODE.SALOAD:
      result = loads.runSaload(thread, memoryArea, instruction);
      break;
    case OPCODE.ISTORE:
      result = stores.runIstore(thread, memoryArea, instruction);
      break;
    case OPCODE.LSTORE:
      result = stores.runLstore(thread, memoryArea, instruction);
      break;
    case OPCODE.FSTORE:
      result = stores.runFstore(thread, memoryArea, instruction);
      break;
    case OPCODE.DSTORE:
      result = stores.runDstore(thread, memoryArea, instruction);
      break;
    case OPCODE.ASTORE:
      result = stores.runAstore(thread, memoryArea, instruction);
      break;
    case OPCODE.ISTORE0:
      result = stores.runIstore0(thread, memoryArea, instruction);
      break;
    case OPCODE.ISTORE1:
      result = stores.runIstore1(thread, memoryArea, instruction);
      break;
    case OPCODE.ISTORE2:
      result = stores.runIstore2(thread, memoryArea, instruction);
      break;
    case OPCODE.ISTORE3:
      result = stores.runIstore3(thread, memoryArea, instruction);
      break;
    case OPCODE.LSTORE0:
      result = stores.runLstore0(thread, memoryArea, instruction);
      break;
    case OPCODE.LSTORE1:
      result = stores.runLstore1(thread, memoryArea, instruction);
      break;
    case OPCODE.LSTORE2:
      result = stores.runLstore2(thread, memoryArea, instruction);
      break;
    case OPCODE.LSTORE3:
      result = stores.runLstore3(thread, memoryArea, instruction);
      break;
    case OPCODE.FSTORE0:
      result = stores.runFstore0(thread, memoryArea, instruction);
      break;
    case OPCODE.FSTORE1:
      result = stores.runFstore1(thread, memoryArea, instruction);
      break;
    case OPCODE.FSTORE2:
      result = stores.runFstore2(thread, memoryArea, instruction);
      break;
    case OPCODE.FSTORE3:
      result = stores.runFstore3(thread, memoryArea, instruction);
      break;
    case OPCODE.DSTORE0:
      result = stores.runDstore0(thread, memoryArea, instruction);
      break;
    case OPCODE.DSTORE1:
      result = stores.runDstore1(thread, memoryArea, instruction);
      break;
    case OPCODE.DSTORE2:
      result = stores.runDstore2(thread, memoryArea, instruction);
      break;
    case OPCODE.DSTORE3:
      result = stores.runDstore3(thread, memoryArea, instruction);
      break;
    case OPCODE.ASTORE0:
      result = stores.runAstore0(thread, memoryArea, instruction);
      break;
    case OPCODE.ASTORE1:
      result = stores.runAstore1(thread, memoryArea, instruction);
      break;
    case OPCODE.ASTORE2:
      result = stores.runAstore2(thread, memoryArea, instruction);
      break;
    case OPCODE.ASTORE3:
      result = stores.runAstore3(thread, memoryArea, instruction);
      break;
    case OPCODE.IASTORE:
      result = stores.runIastore(thread, memoryArea, instruction);
      break;
    case OPCODE.LASTORE:
      result = stores.runLastore(thread, memoryArea, instruction);
      break;
    case OPCODE.FASTORE:
      result = stores.runFastore(thread, memoryArea, instruction);
      break;
    case OPCODE.DASTORE:
      result = stores.runDastore(thread, memoryArea, instruction);
      break;
    case OPCODE.AASTORE:
      result = stores.runAastore(thread, memoryArea, instruction);
      break;
    case OPCODE.BASTORE:
      result = stores.runBastore(thread, memoryArea, instruction);
      break;
    case OPCODE.CASTORE:
      result = stores.runCastore(thread, memoryArea, instruction);
      break;
    case OPCODE.SASTORE:
      result = stores.runSastore(thread, memoryArea, instruction);
      break;
    case OPCODE.POP:
      result = stack.runPop(thread, memoryArea, instruction);
      break;
    case OPCODE.POP2:
      result = stack.runPop2(thread, memoryArea, instruction);
      break;
    case OPCODE.DUP:
      result = stack.runDup(thread, memoryArea, instruction);
      break;
    case OPCODE.DUPX1:
      result = stack.runDupX1(thread, memoryArea, instruction);
      break;
    case OPCODE.DUP2:
      result = stack.runDup2(thread, memoryArea, instruction);
      break;
    case OPCODE.DUP2:
      result = stack.runDup2(thread, memoryArea, instruction);
      break;
    case OPCODE.DUP2X1:
      result = stack.runDup2X1(thread, memoryArea, instruction);
      break;
    case OPCODE.DUP2X2:
      result = stack.runDup2X2(thread, memoryArea, instruction);
      break;
    case OPCODE.SWAP:
      result = stack.runSwap(thread, memoryArea, instruction);
      break;
    case OPCODE.IADD:
      result = math.runIadd(thread, memoryArea, instruction);
      break;
    case OPCODE.LADD:
      result = math.runLadd(thread, memoryArea, instruction);
      break;
    case OPCODE.FADD:
      result = math.runFadd(thread, memoryArea, instruction);
      break;
    case OPCODE.DADD:
      result = math.runDadd(thread, memoryArea, instruction);
      break;
    case OPCODE.ISUB:
      result = math.runIsub(thread, memoryArea, instruction);
      break;
    case OPCODE.LSUB:
      result = math.runLsub(thread, memoryArea, instruction);
      break;
    case OPCODE.FSUB:
      result = math.runFsub(thread, memoryArea, instruction);
      break;
    case OPCODE.DSUB:
      result = math.runDsub(thread, memoryArea, instruction);
      break;
    case OPCODE.IMUL:
      result = math.runImul(thread, memoryArea, instruction);
      break;
    case OPCODE.LMUL:
      result = math.runLmul(thread, memoryArea, instruction);
      break;
    case OPCODE.FMUL:
      result = math.runFmul(thread, memoryArea, instruction);
      break;
    case OPCODE.DMUL:
      result = math.runDmul(thread, memoryArea, instruction);
      break;
    case OPCODE.IDIV:
      result = math.runIdiv(thread, memoryArea, instruction);
      break;
    case OPCODE.LDIV:
      result = math.runLdiv(thread, memoryArea, instruction);
      break;
    case OPCODE.FDIV:
      result = math.runFdiv(thread, memoryArea, instruction);
      break;
    case OPCODE.DDIV:
      result = math.runDdiv(thread, memoryArea, instruction);
      break;
    case OPCODE.IREM:
      result = math.runIrem(thread, memoryArea, instruction);
      break;
    case OPCODE.LREM:
      result = math.runLrem(thread, memoryArea, instruction);
      break;
    case OPCODE.FREM:
      result = math.runFrem(thread, memoryArea, instruction);
      break;
    case OPCODE.DREM:
      result = math.runDrem(thread, memoryArea, instruction);
      break;
    case OPCODE.INEG:
      result = math.runIneg(thread, memoryArea, instruction);
      break;
    case OPCODE.LNEG:
      result = math.runLneg(thread, memoryArea, instruction);
      break;
    case OPCODE.FNEG:
      result = math.runFneg(thread, memoryArea, instruction);
      break;
    case OPCODE.DNEG:
      result = math.runDneg(thread, memoryArea, instruction);
      break;
    case OPCODE.ISHL:
      result = math.runIshl(thread, memoryArea, instruction);
      break;
    case OPCODE.LSHL:
      result = math.runLshl(thread, memoryArea, instruction);
      break;
    case OPCODE.ISHR:
      result = math.runIshr(thread, memoryArea, instruction);
      break;
    case OPCODE.LSHR:
      result = math.runLshr(thread, memoryArea, instruction);
      break;
    case OPCODE.IUSHR:
      result = math.runIushr(thread, memoryArea, instruction);
      break;
    case OPCODE.LUSHR:
      result = math.runLushr(thread, memoryArea, instruction);
      break;
    case OPCODE.IAND:
      result = math.runIand(thread, memoryArea, instruction);
      break;
    case OPCODE.LAND:
      result = math.runLand(thread, memoryArea, instruction);
      break;
    case OPCODE.IOR:
      result = math.runIor(thread, memoryArea, instruction);
      break;
    case OPCODE.LOR:
      result = math.runLor(thread, memoryArea, instruction);
      break;
    case OPCODE.IXOR:
      result = math.runIxor(thread, memoryArea, instruction);
      break;
    case OPCODE.LXOR:
      result = math.runLxor(thread, memoryArea, instruction);
      break;
    case OPCODE.IINC:
      result = math.runIinc(thread, memoryArea, instruction);
      break;
    case OPCODE.I2L:
      result = conversions.runI2l(thread, memoryArea, instruction);
      break;
    case OPCODE.I2F:
      result = conversions.runI2f(thread, memoryArea, instruction);
      break;
    case OPCODE.I2D:
      result = conversions.runI2d(thread, memoryArea, instruction);
      break;
    case OPCODE.L2I:
      result = conversions.runL2i(thread, memoryArea, instruction);
      break;
    case OPCODE.L2F:
      result = conversions.runL2f(thread, memoryArea, instruction);
      break;
    case OPCODE.L2D:
      result = conversions.runL2d(thread, memoryArea, instruction);
      break;
    case OPCODE.F2I:
      result = conversions.runF2i(thread, memoryArea, instruction);
      break;
    case OPCODE.F2L:
      result = conversions.runF2l(thread, memoryArea, instruction);
      break;
    case OPCODE.F2D:
      result = conversions.runF2d(thread, memoryArea, instruction);
      break;
    case OPCODE.D2I:
      result = conversions.runD2i(thread, memoryArea, instruction);
      break;
    case OPCODE.D2L:
      result = conversions.runD2l(thread, memoryArea, instruction);
      break;
    case OPCODE.D2F:
      result = conversions.runD2f(thread, memoryArea, instruction);
      break;
    case OPCODE.I2B:
      result = conversions.runI2b(thread, memoryArea, instruction);
      break;
    case OPCODE.I2C:
      result = conversions.runI2c(thread, memoryArea, instruction);
      break;
    case OPCODE.I2S:
      result = conversions.runI2s(thread, memoryArea, instruction);
      break;
    case OPCODE.LCMP:
      result = comparisons.runLcmp(thread, memoryArea, instruction);
      break;
    case OPCODE.FCMPL:
      result = math.runFmul(thread, memoryArea, instruction);
      break;
    case OPCODE.FCMPG:
      result = comparisons.runFcmpg(thread, memoryArea, instruction);
      break;
    case OPCODE.DCMPL:
      result = math.runDmul(thread, memoryArea, instruction);
      break;
    case OPCODE.DCMPG:
      result = comparisons.runDcmpg(thread, memoryArea, instruction);
      break;
    case OPCODE.IFEQ:
      result = comparisons.runIfeq(thread, memoryArea, instruction);
      break;
    case OPCODE.IFNE:
      result = comparisons.runIfne(thread, memoryArea, instruction);
      break;
    case OPCODE.IFLT:
      result = comparisons.runIflt(thread, memoryArea, instruction);
      break;
    case OPCODE.IFGE:
      result = comparisons.runIfge(thread, memoryArea, instruction);
      break;
    case OPCODE.IFGT:
      result = comparisons.runIfgt(thread, memoryArea, instruction);
      break;
    case OPCODE.IFLE:
      result = comparisons.runIfle(thread, memoryArea, instruction);
      break;
    case OPCODE.IFICMPEQ:
      result = comparisons.runIfIcmpeq(thread, memoryArea, instruction);
      break;
    case OPCODE.IFICMPNE:
      result = comparisons.runIfIcmpne(thread, memoryArea, instruction);
      break;
    case OPCODE.IFICMPLT:
      result = comparisons.runIfIcmplt(thread, memoryArea, instruction);
      break;
    case OPCODE.IFICMPGE:
      result = comparisons.runIfIcmpge(thread, memoryArea, instruction);
      break;
    case OPCODE.IFICMPGT:
      result = comparisons.runIfIcmpgt(thread, memoryArea, instruction);
      break;
    case OPCODE.IFICMPLE:
      result = comparisons.runIfIcmple(thread, memoryArea, instruction);
      break;
    case OPCODE.IFACMPEQ:
      result = comparisons.runIfAcmpeq(thread, memoryArea, instruction);
      break;
    case OPCODE.IFACMPNE:
      result = comparisons.runIfAcmpne(thread, memoryArea, instruction);
      break;
    case OPCODE.GOTO:
      result = control.runGoto(thread, memoryArea, instruction);
      break;
    case OPCODE.JSR:
      result = control.runJsr(thread, memoryArea, instruction);
      break;
    case OPCODE.RET:
      result = control.runRet(thread, memoryArea, instruction);
      break;
    case OPCODE.TABLESWITCH:
      result = control.runTableswitch(thread, memoryArea, instruction);
      break;
    case OPCODE.LOOKUPSWITCH:
      result = control.runLookupswitch(thread, memoryArea, instruction);
      break;
    case OPCODE.IRETURN:
      result = control.runIreturn(thread, memoryArea, instruction);
      break;
    case OPCODE.LRETURN:
      result = control.runLreturn(thread, memoryArea, instruction);
      break;
    case OPCODE.FRETURN:
      result = control.runFreturn(thread, memoryArea, instruction);
      break;
    case OPCODE.DRETURN:
      result = control.runDreturn(thread, memoryArea, instruction);
      break;
    case OPCODE.ARETURN:
      result = control.runAreturn(thread, memoryArea, instruction);
      break;
    case OPCODE.RETURN:
      result = control.runReturn(thread, memoryArea, instruction);
      break;
    case OPCODE.GETSTATIC:
      result = references.runGetstatic(thread, memoryArea, instruction);
      break;
    case OPCODE.PUTSTATIC:
      result = references.runPutstatic(thread, memoryArea, instruction);
      break;
    case OPCODE.GETFIELD:
      result = references.runGetfield(thread, memoryArea, instruction);
      break;
    case OPCODE.PUTFIELD:
      result = references.runPutfield(thread, memoryArea, instruction);
      break;
    case OPCODE.INVOKEVIRTUAL:
      result = references.runInvokevirtual(thread, memoryArea, instruction);
      break;
    case OPCODE.INVOKESPECIAL:
      result = references.runInvokespecial(thread, memoryArea, instruction);
      break;
    case OPCODE.INVOKESTATIC:
      result = references.runInvokestatic(thread, memoryArea, instruction);
      break;
    case OPCODE.INVOKEINTERFACE:
      result = references.runInvokeinterface(thread, memoryArea, instruction);
      break;
    case OPCODE.INVOKEDYNAMIC:
      result = references.runInvokedynamic(thread, memoryArea, instruction);
      break;
    case OPCODE.NEW:
      result = references.runNew(thread, memoryArea, instruction);
      break;
    case OPCODE.NEWARRAY:
      result = references.runNewarray(thread, memoryArea, instruction);
      break;
    case OPCODE.ANEWARRAY:
      result = references.runAnewarray(thread, memoryArea, instruction);
      break;
    case OPCODE.ARRAYLENGTH:
      result = references.runArraylength(thread, memoryArea, instruction);
      break;
    case OPCODE.ATHROW:
      result = references.runAthrow(thread, memoryArea, instruction);
      break;
    case OPCODE.CHECKCAST:
      result = references.runCheckcast(thread, memoryArea, instruction);
      break;
    case OPCODE.INSTANCEOF:
      result = references.runInstanceof(thread, memoryArea, instruction);
      break;
    case OPCODE.MONITORENTER:
      result = references.runMonitorenter(thread, memoryArea, instruction);
      break;
    case OPCODE.MONITOREXIT:
      result = references.runMonitorexit(thread, memoryArea, instruction);
      break;
    case OPCODE.WIDE:
      result = extended.runWide(thread, memoryArea, instruction);
      break;
    case OPCODE.MULTIANEWARRAY:
      result = extended.runMultianewarray(thread, memoryArea, instruction);
      break;
    case OPCODE.IFNULL:
      result = extended.runIfnull(thread, memoryArea, instruction);
      break;
    case OPCODE.IFNONNULL:
      result = extended.runIfnonnull(thread, memoryArea, instruction);
      break;
    case OPCODE.GOTO:
      result = extended.runGotoW(thread, memoryArea, instruction);
      break;
    case OPCODE.JSR:
      result = extended.runJsrW(thread, memoryArea, instruction);
      break;
    case OPCODE.BREAKPOINT:
      result = reserved.runBreakpoint(thread, memoryArea, instruction);
      break;
    case OPCODE.IMPDEP1:
      result = reserved.runImpdep1(thread, memoryArea, instruction);
      break;
    case OPCODE.IMPDEP2:
      result = reserved.runImpdep2(thread, memoryArea, instruction);
      break;
    default:
      throw new Error(
        `runInstruction: Unknown opcode ${instruction.opcode} received!`
      );
  }
  return result;
}
