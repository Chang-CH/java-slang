import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import * as comparisons from './instructions/comparisons';
import * as constants from './instructions/constants';
import * as control from './instructions/control';
import * as conversions from './instructions/conversions';
import * as extended from './instructions/extended';
import * as loads from './instructions/loads';
import * as math from './instructions/math';
import * as references from './instructions/references';
import * as reserved from './instructions/reserved';
import * as stack from './instructions/stack';
import * as stores from './instructions/stores';
import { InstructionType } from './readInstruction';

export default function runInstruction(
  thread: NativeThread,
  instruction: InstructionType
): void {
  let result;
  switch (instruction.opcode) {
    case OPCODE.NOP:
      result = constants.runNop(thread, instruction);
      break;
    case OPCODE.ACONSTNULL:
      result = constants.runAconstNull(thread, instruction);
      break;
    case OPCODE.ICONSTM1:
      result = constants.runIconstM1(thread, instruction);
      break;
    case OPCODE.ICONST0:
      result = constants.runIconst0(thread, instruction);
      break;
    case OPCODE.ICONST1:
      result = constants.runIconst1(thread, instruction);
      break;
    case OPCODE.ICONST2:
      result = constants.runIconst2(thread, instruction);
      break;
    case OPCODE.ICONST3:
      result = constants.runIconst3(thread, instruction);
      break;
    case OPCODE.ICONST4:
      result = constants.runIconst4(thread, instruction);
      break;
    case OPCODE.ICONST5:
      result = constants.runIconst5(thread, instruction);
      break;
    case OPCODE.LCONST0:
      result = constants.runLconst0(thread, instruction);
      break;
    case OPCODE.LCONST1:
      result = constants.runLconst1(thread, instruction);
      break;
    case OPCODE.FCONST0:
      result = constants.runFconst0(thread, instruction);
      break;
    case OPCODE.FCONST1:
      result = constants.runFconst1(thread, instruction);
      break;
    case OPCODE.FCONST2:
      result = constants.runFconst2(thread, instruction);
      break;
    case OPCODE.DCONST0:
      result = constants.runDconst0(thread, instruction);
      break;
    case OPCODE.DCONST1:
      result = constants.runDconst1(thread, instruction);
      break;
    case OPCODE.BIPUSH:
      result = constants.runBipush(thread, instruction);
      break;
    case OPCODE.SIPUSH:
      instruction;
      result = constants.runSipush(thread, instruction);
      break;
    case OPCODE.LDC:
      result = constants.runLdc(thread, instruction);
      break;
    case OPCODE.LDCW:
      result = constants.runLdcW(thread, instruction);
      break;
    case OPCODE.LDC2W:
      result = constants.runLdc2W(thread, instruction);
      break;
    case OPCODE.ILOAD:
      result = loads.runIload(thread, instruction);
      break;
    case OPCODE.LLOAD:
      result = loads.runLload(thread, instruction);
      break;
    case OPCODE.FLOAD:
      result = loads.runFload(thread, instruction);
      break;
    case OPCODE.DLOAD:
      result = loads.runDload(thread, instruction);
      break;
    case OPCODE.ALOAD:
      result = loads.runAload(thread, instruction);
      break;
    case OPCODE.ILOAD0:
      result = loads.runIload0(thread, instruction);
      break;
    case OPCODE.ILOAD1:
      result = loads.runIload1(thread, instruction);
      break;
    case OPCODE.ILOAD2:
      result = loads.runIload2(thread, instruction);
      break;
    case OPCODE.ILOAD3:
      result = loads.runIload3(thread, instruction);
      break;
    case OPCODE.LLOAD0:
      result = loads.runLload0(thread, instruction);
      break;
    case OPCODE.LLOAD1:
      result = loads.runLload1(thread, instruction);
      break;
    case OPCODE.LLOAD2:
      result = loads.runLload2(thread, instruction);
      break;
    case OPCODE.LLOAD3:
      result = loads.runLload3(thread, instruction);
      break;
    case OPCODE.FLOAD0:
      result = loads.runFload0(thread, instruction);
      break;
    case OPCODE.FLOAD1:
      result = loads.runFload1(thread, instruction);
      break;
    case OPCODE.FLOAD2:
      result = loads.runFload2(thread, instruction);
      break;
    case OPCODE.FLOAD3:
      result = loads.runFload3(thread, instruction);
      break;
    case OPCODE.DLOAD0:
      result = loads.runDload0(thread, instruction);
      break;
    case OPCODE.DLOAD1:
      result = loads.runDload1(thread, instruction);
      break;
    case OPCODE.DLOAD2:
      result = loads.runDload2(thread, instruction);
      break;
    case OPCODE.DLOAD3:
      result = loads.runDload3(thread, instruction);
      break;
    case OPCODE.ALOAD0:
      result = loads.runAload0(thread, instruction);
      break;
    case OPCODE.ALOAD1:
      result = loads.runAload1(thread, instruction);
      break;
    case OPCODE.ALOAD2:
      result = loads.runAload2(thread, instruction);
      break;
    case OPCODE.ALOAD3:
      result = loads.runAload3(thread, instruction);
      break;
    case OPCODE.IALOAD:
      result = loads.runIaload(thread, instruction);
      break;
    case OPCODE.LALOAD:
      result = loads.runLaload(thread, instruction);
      break;
    case OPCODE.FALOAD:
      result = loads.runFaload(thread, instruction);
      break;
    case OPCODE.DALOAD:
      result = loads.runDaload(thread, instruction);
      break;
    case OPCODE.AALOAD:
      result = loads.runAaload(thread, instruction);
      break;
    case OPCODE.BALOAD:
      result = loads.runBaload(thread, instruction);
      break;
    case OPCODE.CALOAD:
      result = loads.runCaload(thread, instruction);
      break;
    case OPCODE.SALOAD:
      result = loads.runSaload(thread, instruction);
      break;
    case OPCODE.ISTORE:
      result = stores.runIstore(thread, instruction);
      break;
    case OPCODE.LSTORE:
      result = stores.runLstore(thread, instruction);
      break;
    case OPCODE.FSTORE:
      result = stores.runFstore(thread, instruction);
      break;
    case OPCODE.DSTORE:
      result = stores.runDstore(thread, instruction);
      break;
    case OPCODE.ASTORE:
      result = stores.runAstore(thread, instruction);
      break;
    case OPCODE.ISTORE0:
      result = stores.runIstore0(thread, instruction);
      break;
    case OPCODE.ISTORE1:
      result = stores.runIstore1(thread, instruction);
      break;
    case OPCODE.ISTORE2:
      result = stores.runIstore2(thread, instruction);
      break;
    case OPCODE.ISTORE3:
      result = stores.runIstore3(thread, instruction);
      break;
    case OPCODE.LSTORE0:
      result = stores.runLstore0(thread, instruction);
      break;
    case OPCODE.LSTORE1:
      result = stores.runLstore1(thread, instruction);
      break;
    case OPCODE.LSTORE2:
      result = stores.runLstore2(thread, instruction);
      break;
    case OPCODE.LSTORE3:
      result = stores.runLstore3(thread, instruction);
      break;
    case OPCODE.FSTORE0:
      result = stores.runFstore0(thread, instruction);
      break;
    case OPCODE.FSTORE1:
      result = stores.runFstore1(thread, instruction);
      break;
    case OPCODE.FSTORE2:
      result = stores.runFstore2(thread, instruction);
      break;
    case OPCODE.FSTORE3:
      result = stores.runFstore3(thread, instruction);
      break;
    case OPCODE.DSTORE0:
      result = stores.runDstore0(thread, instruction);
      break;
    case OPCODE.DSTORE1:
      result = stores.runDstore1(thread, instruction);
      break;
    case OPCODE.DSTORE2:
      result = stores.runDstore2(thread, instruction);
      break;
    case OPCODE.DSTORE3:
      result = stores.runDstore3(thread, instruction);
      break;
    case OPCODE.ASTORE0:
      result = stores.runAstore0(thread, instruction);
      break;
    case OPCODE.ASTORE1:
      result = stores.runAstore1(thread, instruction);
      break;
    case OPCODE.ASTORE2:
      result = stores.runAstore2(thread, instruction);
      break;
    case OPCODE.ASTORE3:
      result = stores.runAstore3(thread, instruction);
      break;
    case OPCODE.IASTORE:
      result = stores.runIastore(thread, instruction);
      break;
    case OPCODE.LASTORE:
      result = stores.runLastore(thread, instruction);
      break;
    case OPCODE.FASTORE:
      result = stores.runFastore(thread, instruction);
      break;
    case OPCODE.DASTORE:
      result = stores.runDastore(thread, instruction);
      break;
    case OPCODE.AASTORE:
      result = stores.runAastore(thread, instruction);
      break;
    case OPCODE.BASTORE:
      result = stores.runBastore(thread, instruction);
      break;
    case OPCODE.CASTORE:
      result = stores.runCastore(thread, instruction);
      break;
    case OPCODE.SASTORE:
      result = stores.runSastore(thread, instruction);
      break;
    case OPCODE.POP:
      result = stack.runPop(thread, instruction);
      break;
    case OPCODE.POP2:
      result = stack.runPop2(thread, instruction);
      break;
    case OPCODE.DUP:
      result = stack.runDup(thread, instruction);
      break;
    case OPCODE.DUPX1:
      result = stack.runDupX1(thread, instruction);
      break;
    case OPCODE.DUPX2:
      result = stack.runDupX2(thread, instruction);
      break;
    case OPCODE.DUP2:
      result = stack.runDup2(thread, instruction);
      break;
    case OPCODE.DUP2:
      result = stack.runDup2(thread, instruction);
      break;
    case OPCODE.DUP2X1:
      result = stack.runDup2X1(thread, instruction);
      break;
    case OPCODE.DUP2X2:
      result = stack.runDup2X2(thread, instruction);
      break;
    case OPCODE.SWAP:
      result = stack.runSwap(thread, instruction);
      break;
    case OPCODE.IADD:
      result = math.runIadd(thread, instruction);
      break;
    case OPCODE.LADD:
      result = math.runLadd(thread, instruction);
      break;
    case OPCODE.FADD:
      result = math.runFadd(thread, instruction);
      break;
    case OPCODE.DADD:
      result = math.runDadd(thread, instruction);
      break;
    case OPCODE.ISUB:
      result = math.runIsub(thread, instruction);
      break;
    case OPCODE.LSUB:
      result = math.runLsub(thread, instruction);
      break;
    case OPCODE.FSUB:
      result = math.runFsub(thread, instruction);
      break;
    case OPCODE.DSUB:
      result = math.runDsub(thread, instruction);
      break;
    case OPCODE.IMUL:
      result = math.runImul(thread, instruction);
      break;
    case OPCODE.LMUL:
      result = math.runLmul(thread, instruction);
      break;
    case OPCODE.FMUL:
      result = math.runFmul(thread, instruction);
      break;
    case OPCODE.DMUL:
      result = math.runDmul(thread, instruction);
      break;
    case OPCODE.IDIV:
      result = math.runIdiv(thread, instruction);
      break;
    case OPCODE.LDIV:
      result = math.runLdiv(thread, instruction);
      break;
    case OPCODE.FDIV:
      result = math.runFdiv(thread, instruction);
      break;
    case OPCODE.DDIV:
      result = math.runDdiv(thread, instruction);
      break;
    case OPCODE.IREM:
      result = math.runIrem(thread, instruction);
      break;
    case OPCODE.LREM:
      result = math.runLrem(thread, instruction);
      break;
    case OPCODE.FREM:
      result = math.runFrem(thread, instruction);
      break;
    case OPCODE.DREM:
      result = math.runDrem(thread, instruction);
      break;
    case OPCODE.INEG:
      result = math.runIneg(thread, instruction);
      break;
    case OPCODE.LNEG:
      result = math.runLneg(thread, instruction);
      break;
    case OPCODE.FNEG:
      result = math.runFneg(thread, instruction);
      break;
    case OPCODE.DNEG:
      result = math.runDneg(thread, instruction);
      break;
    case OPCODE.ISHL:
      result = math.runIshl(thread, instruction);
      break;
    case OPCODE.LSHL:
      result = math.runLshl(thread, instruction);
      break;
    case OPCODE.ISHR:
      result = math.runIshr(thread, instruction);
      break;
    case OPCODE.LSHR:
      result = math.runLshr(thread, instruction);
      break;
    case OPCODE.IUSHR:
      result = math.runIushr(thread, instruction);
      break;
    case OPCODE.LUSHR:
      result = math.runLushr(thread, instruction);
      break;
    case OPCODE.IAND:
      result = math.runIand(thread, instruction);
      break;
    case OPCODE.LAND:
      result = math.runLand(thread, instruction);
      break;
    case OPCODE.IOR:
      result = math.runIor(thread, instruction);
      break;
    case OPCODE.LOR:
      result = math.runLor(thread, instruction);
      break;
    case OPCODE.IXOR:
      result = math.runIxor(thread, instruction);
      break;
    case OPCODE.LXOR:
      result = math.runLxor(thread, instruction);
      break;
    case OPCODE.IINC:
      result = math.runIinc(thread, instruction);
      break;
    case OPCODE.I2L:
      result = conversions.runI2l(thread, instruction);
      break;
    case OPCODE.I2F:
      result = conversions.runI2f(thread, instruction);
      break;
    case OPCODE.I2D:
      result = conversions.runI2d(thread, instruction);
      break;
    case OPCODE.L2I:
      result = conversions.runL2i(thread, instruction);
      break;
    case OPCODE.L2F:
      result = conversions.runL2f(thread, instruction);
      break;
    case OPCODE.L2D:
      result = conversions.runL2d(thread, instruction);
      break;
    case OPCODE.F2I:
      result = conversions.runF2i(thread, instruction);
      break;
    case OPCODE.F2L:
      result = conversions.runF2l(thread, instruction);
      break;
    case OPCODE.F2D:
      result = conversions.runF2d(thread, instruction);
      break;
    case OPCODE.D2I:
      result = conversions.runD2i(thread, instruction);
      break;
    case OPCODE.D2L:
      result = conversions.runD2l(thread, instruction);
      break;
    case OPCODE.D2F:
      result = conversions.runD2f(thread, instruction);
      break;
    case OPCODE.I2B:
      result = conversions.runI2b(thread, instruction);
      break;
    case OPCODE.I2C:
      result = conversions.runI2c(thread, instruction);
      break;
    case OPCODE.I2S:
      result = conversions.runI2s(thread, instruction);
      break;
    case OPCODE.LCMP:
      result = comparisons.runLcmp(thread, instruction);
      break;
    case OPCODE.FCMPL:
      result = comparisons.runFcmpl(thread, instruction);
      break;
    case OPCODE.FCMPG:
      result = comparisons.runFcmpg(thread, instruction);
      break;
    case OPCODE.DCMPL:
      result = comparisons.runDcmpl(thread, instruction);
      break;
    case OPCODE.DCMPG:
      result = comparisons.runDcmpg(thread, instruction);
      break;
    case OPCODE.IFEQ:
      result = comparisons.runIfeq(thread, instruction);
      break;
    case OPCODE.IFNE:
      result = comparisons.runIfne(thread, instruction);
      break;
    case OPCODE.IFLT:
      result = comparisons.runIflt(thread, instruction);
      break;
    case OPCODE.IFGE:
      result = comparisons.runIfge(thread, instruction);
      break;
    case OPCODE.IFGT:
      result = comparisons.runIfgt(thread, instruction);
      break;
    case OPCODE.IFLE:
      result = comparisons.runIfle(thread, instruction);
      break;
    case OPCODE.IFICMPEQ:
      result = comparisons.runIfIcmpeq(thread, instruction);
      break;
    case OPCODE.IFICMPNE:
      result = comparisons.runIfIcmpne(thread, instruction);
      break;
    case OPCODE.IFICMPLT:
      result = comparisons.runIfIcmplt(thread, instruction);
      break;
    case OPCODE.IFICMPGE:
      result = comparisons.runIfIcmpge(thread, instruction);
      break;
    case OPCODE.IFICMPGT:
      result = comparisons.runIfIcmpgt(thread, instruction);
      break;
    case OPCODE.IFICMPLE:
      result = comparisons.runIfIcmple(thread, instruction);
      break;
    case OPCODE.IFACMPEQ:
      result = comparisons.runIfAcmpeq(thread, instruction);
      break;
    case OPCODE.IFACMPNE:
      result = comparisons.runIfAcmpne(thread, instruction);
      break;
    case OPCODE.GOTO:
      result = control.runGoto(thread, instruction);
      break;
    case OPCODE.JSR:
      result = control.runJsr(thread, instruction);
      break;
    case OPCODE.RET:
      result = control.runRet(thread, instruction);
      break;
    case OPCODE.TABLESWITCH:
      result = control.runTableswitch(thread, instruction);
      break;
    case OPCODE.LOOKUPSWITCH:
      result = control.runLookupswitch(thread, instruction);
      break;
    case OPCODE.IRETURN:
      result = control.runIreturn(thread, instruction);
      break;
    case OPCODE.LRETURN:
      result = control.runLreturn(thread, instruction);
      break;
    case OPCODE.FRETURN:
      result = control.runFreturn(thread, instruction);
      break;
    case OPCODE.DRETURN:
      result = control.runDreturn(thread, instruction);
      break;
    case OPCODE.ARETURN:
      result = control.runAreturn(thread, instruction);
      break;
    case OPCODE.RETURN:
      result = control.runReturn(thread, instruction);
      break;
    case OPCODE.GETSTATIC:
      result = references.runGetstatic(thread, instruction);
      break;
    case OPCODE.PUTSTATIC:
      result = references.runPutstatic(thread, instruction);
      break;
    case OPCODE.GETFIELD:
      result = references.runGetfield(thread, instruction);
      break;
    case OPCODE.PUTFIELD:
      result = references.runPutfield(thread, instruction);
      break;
    case OPCODE.INVOKEVIRTUAL:
      result = references.runInvokevirtual(thread, instruction);
      break;
    case OPCODE.INVOKESPECIAL:
      result = references.runInvokespecial(thread, instruction);
      break;
    case OPCODE.INVOKESTATIC:
      result = references.runInvokestatic(thread, instruction);
      break;
    case OPCODE.INVOKEINTERFACE:
      result = references.runInvokeinterface(thread, instruction);
      break;
    case OPCODE.INVOKEDYNAMIC:
      result = references.runInvokedynamic(thread, instruction);
      break;
    case OPCODE.NEW:
      result = references.runNew(thread, instruction);
      break;
    case OPCODE.NEWARRAY:
      result = references.runNewarray(thread, instruction);
      break;
    case OPCODE.ANEWARRAY:
      result = references.runAnewarray(thread, instruction);
      break;
    case OPCODE.ARRAYLENGTH:
      result = references.runArraylength(thread, instruction);
      break;
    case OPCODE.ATHROW:
      result = references.runAthrow(thread, instruction);
      break;
    case OPCODE.CHECKCAST:
      result = references.runCheckcast(thread, instruction);
      break;
    case OPCODE.INSTANCEOF:
      result = references.runInstanceof(thread, instruction);
      break;
    case OPCODE.MONITORENTER:
      result = references.runMonitorenter(thread, instruction);
      break;
    case OPCODE.MONITOREXIT:
      result = references.runMonitorexit(thread, instruction);
      break;
    case OPCODE.WIDE:
      result = extended.runWide(thread, instruction);
      break;
    case OPCODE.MULTIANEWARRAY:
      result = extended.runMultianewarray(thread, instruction);
      break;
    case OPCODE.IFNULL:
      result = extended.runIfnull(thread, instruction);
      break;
    case OPCODE.IFNONNULL:
      result = extended.runIfnonnull(thread, instruction);
      break;
    case OPCODE.GOTO:
      result = extended.runGotoW(thread, instruction);
      break;
    case OPCODE.JSR:
      result = extended.runJsrW(thread, instruction);
      break;
    case OPCODE.BREAKPOINT:
      result = reserved.runBreakpoint(thread, instruction);
      break;
    case OPCODE.IMPDEP1:
      result = reserved.runImpdep1(thread, instruction);
      break;
    case OPCODE.IMPDEP2:
      result = reserved.runImpdep2(thread, instruction);
      break;
    default:
      throw new Error(
        `runInstruction: Unknown opcode ${instruction.opcode} received!`
      );
  }
  return result;
}
