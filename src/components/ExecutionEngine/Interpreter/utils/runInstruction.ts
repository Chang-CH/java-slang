import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import NativeThread from '../../NativeThreadGroup/NativeThread';

export default function runInstruction(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
): void {
  switch (instruction.opcode) {
    case INSTRUCTION_SET.nop:
      throw new Error('Instruction nop not implemented!');
      return;
    case INSTRUCTION_SET.aconst_null:
      throw new Error('Instruction aconst_null not implemented!');
      return;
    case INSTRUCTION_SET.iconst_m1:
      throw new Error('Instruction iconst_m1 not implemented!');
      return;
    case INSTRUCTION_SET.iconst_0:
      throw new Error('Instruction iconst_0 not implemented!');
      return;
    case INSTRUCTION_SET.iconst_1:
      throw new Error('Instruction iconst_1 not implemented!');
      return;
    case INSTRUCTION_SET.iconst_2:
      throw new Error('Instruction iconst_2 not implemented!');
      return;
    case INSTRUCTION_SET.iconst_3:
      throw new Error('Instruction iconst_3 not implemented!');
      return;
    case INSTRUCTION_SET.iconst_4:
      throw new Error('Instruction iconst_4 not implemented!');
      return;
    case INSTRUCTION_SET.iconst_5:
      throw new Error('Instruction iconst_5 not implemented!');
      return;
    case INSTRUCTION_SET.lconst_0:
      throw new Error('Instruction lconst_0 not implemented!');
      return;
    case INSTRUCTION_SET.lconst_1:
      throw new Error('Instruction lconst_1 not implemented!');
      return;
    case INSTRUCTION_SET.fconst_0:
      throw new Error('Instruction fconst_0 not implemented!');
      return;
    case INSTRUCTION_SET.fconst_1:
      throw new Error('Instruction fconst_1 not implemented!');
      return;
    case INSTRUCTION_SET.fconst_2:
      throw new Error('Instruction fconst_2 not implemented!');
      return;
    case INSTRUCTION_SET.dconst_0:
      throw new Error('Instruction dconst_0 not implemented!');
      return;
    case INSTRUCTION_SET.dconst_1:
      throw new Error('Instruction dconst_1 not implemented!');
      return;
    case INSTRUCTION_SET.bipush:
      throw new Error('Instruction bipush not implemented!');
      return;
    case INSTRUCTION_SET.sipush:
      throw new Error('Instruction sipush not implemented!');
      return;
    case INSTRUCTION_SET.ldc:
      throw new Error('Instruction ldc not implemented!');
      return;
    case INSTRUCTION_SET.ldc_w:
      throw new Error('Instruction ldc_w not implemented!');
      return;
    case INSTRUCTION_SET.ldc2_w:
      throw new Error('Instruction ldc2_w not implemented!');
      return;
    case INSTRUCTION_SET.iload:
      throw new Error('Instruction iload not implemented!');
      return;
    case INSTRUCTION_SET.lload:
      throw new Error('Instruction lload not implemented!');
      return;
    case INSTRUCTION_SET.fload:
      throw new Error('Instruction fload not implemented!');
      return;
    case INSTRUCTION_SET.dload:
      throw new Error('Instruction dload not implemented!');
      return;
    case INSTRUCTION_SET.aload:
      throw new Error('Instruction aload not implemented!');
      return;
    case INSTRUCTION_SET.iload_0:
      throw new Error('Instruction iload_0 not implemented!');
      return;
    case INSTRUCTION_SET.iload_1:
      throw new Error('Instruction iload_1 not implemented!');
      return;
    case INSTRUCTION_SET.iload_2:
      throw new Error('Instruction iload_2 not implemented!');
      return;
    case INSTRUCTION_SET.iload_3:
      throw new Error('Instruction iload_3 not implemented!');
      return;
    case INSTRUCTION_SET.lload_0:
      throw new Error('Instruction lload_0 not implemented!');
      return;
    case INSTRUCTION_SET.lload_1:
      throw new Error('Instruction lload_1 not implemented!');
      return;
    case INSTRUCTION_SET.lload_2:
      throw new Error('Instruction lload_2 not implemented!');
      return;
    case INSTRUCTION_SET.lload_3:
      throw new Error('Instruction lload_3 not implemented!');
      return;
    case INSTRUCTION_SET.fload_0:
      throw new Error('Instruction fload_0 not implemented!');
      return;
    case INSTRUCTION_SET.fload_1:
      throw new Error('Instruction fload_1 not implemented!');
      return;
    case INSTRUCTION_SET.fload_2:
      throw new Error('Instruction fload_2 not implemented!');
      return;
    case INSTRUCTION_SET.fload_3:
      throw new Error('Instruction fload_3 not implemented!');
      return;
    case INSTRUCTION_SET.dload_0:
      throw new Error('Instruction dload_0 not implemented!');
      return;
    case INSTRUCTION_SET.dload_1:
      throw new Error('Instruction dload_1 not implemented!');
      return;
    case INSTRUCTION_SET.dload_2:
      throw new Error('Instruction dload_2 not implemented!');
      return;
    case INSTRUCTION_SET.dload_3:
      throw new Error('Instruction dload_3 not implemented!');
      return;
    case INSTRUCTION_SET.aload_0:
      throw new Error('Instruction aload_0 not implemented!');
      return;
    case INSTRUCTION_SET.aload_1:
      throw new Error('Instruction aload_1 not implemented!');
      return;
    case INSTRUCTION_SET.aload_2:
      throw new Error('Instruction aload_2 not implemented!');
      return;
    case INSTRUCTION_SET.aload_3:
      throw new Error('Instruction aload_3 not implemented!');
      return;
    case INSTRUCTION_SET.iaload:
      throw new Error('Instruction iaload not implemented!');
      return;
    case INSTRUCTION_SET.laload:
      throw new Error('Instruction laload not implemented!');
      return;
    case INSTRUCTION_SET.faload:
      throw new Error('Instruction faload not implemented!');
      return;
    case INSTRUCTION_SET.daload:
      throw new Error('Instruction daload not implemented!');
      return;
    case INSTRUCTION_SET.aaload:
      throw new Error('Instruction aaload not implemented!');
      return;
    case INSTRUCTION_SET.baload:
      throw new Error('Instruction baload not implemented!');
      return;
    case INSTRUCTION_SET.caload:
      throw new Error('Instruction caload not implemented!');
      return;
    case INSTRUCTION_SET.saload:
      throw new Error('Instruction saload not implemented!');
      return;
    case INSTRUCTION_SET.istore:
      throw new Error('Instruction istore not implemented!');
      return;
    case INSTRUCTION_SET.lstore:
      throw new Error('Instruction lstore not implemented!');
      return;
    case INSTRUCTION_SET.fstore:
      throw new Error('Instruction fstore not implemented!');
      return;
    case INSTRUCTION_SET.dstore:
      throw new Error('Instruction dstore not implemented!');
      return;
    case INSTRUCTION_SET.astore:
      throw new Error('Instruction astore not implemented!');
      return;
    case INSTRUCTION_SET.istore_0:
      throw new Error('Instruction istore_0 not implemented!');
      return;
    case INSTRUCTION_SET.istore_1:
      throw new Error('Instruction istore_1 not implemented!');
      return;
    case INSTRUCTION_SET.istore_2:
      throw new Error('Instruction istore_2 not implemented!');
      return;
    case INSTRUCTION_SET.istore_3:
      throw new Error('Instruction istore_3 not implemented!');
      return;
    case INSTRUCTION_SET.lstore_0:
      throw new Error('Instruction lstore_0 not implemented!');
      return;
    case INSTRUCTION_SET.lstore_1:
      throw new Error('Instruction lstore_1 not implemented!');
      return;
    case INSTRUCTION_SET.lstore_2:
      throw new Error('Instruction lstore_2 not implemented!');
      return;
    case INSTRUCTION_SET.lstore_3:
      throw new Error('Instruction lstore_3 not implemented!');
      return;
    case INSTRUCTION_SET.fstore_0:
      throw new Error('Instruction fstore_0 not implemented!');
      return;
    case INSTRUCTION_SET.fstore_1:
      throw new Error('Instruction fstore_1 not implemented!');
      return;
    case INSTRUCTION_SET.fstore_2:
      throw new Error('Instruction fstore_2 not implemented!');
      return;
    case INSTRUCTION_SET.fstore_3:
      throw new Error('Instruction fstore_3 not implemented!');
      return;
    case INSTRUCTION_SET.dstore_0:
      throw new Error('Instruction dstore_0 not implemented!');
      return;
    case INSTRUCTION_SET.dstore_1:
      throw new Error('Instruction dstore_1 not implemented!');
      return;
    case INSTRUCTION_SET.dstore_2:
      throw new Error('Instruction dstore_2 not implemented!');
      return;
    case INSTRUCTION_SET.dstore_3:
      throw new Error('Instruction dstore_3 not implemented!');
      return;
    case INSTRUCTION_SET.astore_0:
      throw new Error('Instruction astore_0 not implemented!');
      return;
    case INSTRUCTION_SET.astore_1:
      throw new Error('Instruction astore_1 not implemented!');
      return;
    case INSTRUCTION_SET.astore_2:
      throw new Error('Instruction astore_2 not implemented!');
      return;
    case INSTRUCTION_SET.astore_3:
      throw new Error('Instruction astore_3 not implemented!');
      return;
    case INSTRUCTION_SET.iastore:
      throw new Error('Instruction iastore not implemented!');
      return;
    case INSTRUCTION_SET.lastore:
      throw new Error('Instruction lastore not implemented!');
      return;
    case INSTRUCTION_SET.fastore:
      throw new Error('Instruction fastore not implemented!');
      return;
    case INSTRUCTION_SET.dastore:
      throw new Error('Instruction dastore not implemented!');
      return;
    case INSTRUCTION_SET.aastore:
      throw new Error('Instruction aastore not implemented!');
      return;
    case INSTRUCTION_SET.bastore:
      throw new Error('Instruction bastore not implemented!');
      return;
    case INSTRUCTION_SET.castore:
      throw new Error('Instruction castore not implemented!');
      return;
    case INSTRUCTION_SET.sastore:
      throw new Error('Instruction sastore not implemented!');
      return;
    case INSTRUCTION_SET.pop:
      throw new Error('Instruction pop not implemented!');
      return;
    case INSTRUCTION_SET.pop2:
      throw new Error('Instruction pop2 not implemented!');
      return;
    case INSTRUCTION_SET.dup:
      throw new Error('Instruction dup not implemented!');
      return;
    case INSTRUCTION_SET.dup_x1:
      throw new Error('Instruction dup_x1 not implemented!');
      return;
    case INSTRUCTION_SET.dup_x2:
      throw new Error('Instruction dup_x2 not implemented!');
      return;
    case INSTRUCTION_SET.dup2:
      throw new Error('Instruction dup2 not implemented!');
      return;
    case INSTRUCTION_SET.dup2_x1:
      throw new Error('Instruction dup2_x1 not implemented!');
      return;
    case INSTRUCTION_SET.dup2_x2:
      throw new Error('Instruction dup2_x2 not implemented!');
      return;
    case INSTRUCTION_SET.swap:
      throw new Error('Instruction swap not implemented!');
      return;
    case INSTRUCTION_SET.iadd:
      throw new Error('Instruction iadd not implemented!');
      return;
    case INSTRUCTION_SET.ladd:
      throw new Error('Instruction ladd not implemented!');
      return;
    case INSTRUCTION_SET.fadd:
      throw new Error('Instruction fadd not implemented!');
      return;
    case INSTRUCTION_SET.dadd:
      throw new Error('Instruction dadd not implemented!');
      return;
    case INSTRUCTION_SET.isub:
      throw new Error('Instruction isub not implemented!');
      return;
    case INSTRUCTION_SET.lsub:
      throw new Error('Instruction lsub not implemented!');
      return;
    case INSTRUCTION_SET.fsub:
      throw new Error('Instruction fsub not implemented!');
      return;
    case INSTRUCTION_SET.dsub:
      throw new Error('Instruction dsub not implemented!');
      return;
    case INSTRUCTION_SET.imul:
      throw new Error('Instruction imul not implemented!');
      return;
    case INSTRUCTION_SET.lmul:
      throw new Error('Instruction lmul not implemented!');
      return;
    case INSTRUCTION_SET.fmul:
      throw new Error('Instruction fmul not implemented!');
      return;
    case INSTRUCTION_SET.dmul:
      throw new Error('Instruction dmul not implemented!');
      return;
    case INSTRUCTION_SET.idiv:
      throw new Error('Instruction idiv not implemented!');
      return;
    case INSTRUCTION_SET.ldiv:
      throw new Error('Instruction ldiv not implemented!');
      return;
    case INSTRUCTION_SET.fdiv:
      throw new Error('Instruction fdiv not implemented!');
      return;
    case INSTRUCTION_SET.ddiv:
      throw new Error('Instruction ddiv not implemented!');
      return;
    case INSTRUCTION_SET.irem:
      throw new Error('Instruction irem not implemented!');
      return;
    case INSTRUCTION_SET.lrem:
      throw new Error('Instruction lrem not implemented!');
      return;
    case INSTRUCTION_SET.frem:
      throw new Error('Instruction frem not implemented!');
      return;
    case INSTRUCTION_SET.drem:
      throw new Error('Instruction drem not implemented!');
      return;
    case INSTRUCTION_SET.ineg:
      throw new Error('Instruction ineg not implemented!');
      return;
    case INSTRUCTION_SET.lneg:
      throw new Error('Instruction lneg not implemented!');
      return;
    case INSTRUCTION_SET.fneg:
      throw new Error('Instruction fneg not implemented!');
      return;
    case INSTRUCTION_SET.dneg:
      throw new Error('Instruction dneg not implemented!');
      return;
    case INSTRUCTION_SET.ishl:
      throw new Error('Instruction ishl not implemented!');
      return;
    case INSTRUCTION_SET.lshl:
      throw new Error('Instruction lshl not implemented!');
      return;
    case INSTRUCTION_SET.ishr:
      throw new Error('Instruction ishr not implemented!');
      return;
    case INSTRUCTION_SET.lshr:
      throw new Error('Instruction lshr not implemented!');
      return;
    case INSTRUCTION_SET.iushr:
      throw new Error('Instruction iushr not implemented!');
      return;
    case INSTRUCTION_SET.lushr:
      throw new Error('Instruction lushr not implemented!');
      return;
    case INSTRUCTION_SET.iand:
      throw new Error('Instruction iand not implemented!');
      return;
    case INSTRUCTION_SET.land:
      throw new Error('Instruction land not implemented!');
      return;
    case INSTRUCTION_SET.ior:
      throw new Error('Instruction ior not implemented!');
      return;
    case INSTRUCTION_SET.lor:
      throw new Error('Instruction lor not implemented!');
      return;
    case INSTRUCTION_SET.ixor:
      throw new Error('Instruction ixor not implemented!');
      return;
    case INSTRUCTION_SET.lxor:
      throw new Error('Instruction lxor not implemented!');
      return;
    case INSTRUCTION_SET.iinc:
      throw new Error('Instruction iinc not implemented!');
      return;
    case INSTRUCTION_SET.i2l:
      throw new Error('Instruction i2l not implemented!');
      return;
    case INSTRUCTION_SET.i2f:
      throw new Error('Instruction i2f not implemented!');
      return;
    case INSTRUCTION_SET.i2d:
      throw new Error('Instruction i2d not implemented!');
      return;
    case INSTRUCTION_SET.l2i:
      throw new Error('Instruction l2i not implemented!');
      return;
    case INSTRUCTION_SET.l2f:
      throw new Error('Instruction l2f not implemented!');
      return;
    case INSTRUCTION_SET.l2d:
      throw new Error('Instruction l2d not implemented!');
      return;
    case INSTRUCTION_SET.f2i:
      throw new Error('Instruction f2i not implemented!');
      return;
    case INSTRUCTION_SET.f2l:
      throw new Error('Instruction f2l not implemented!');
      return;
    case INSTRUCTION_SET.f2d:
      throw new Error('Instruction f2d not implemented!');
      return;
    case INSTRUCTION_SET.d2i:
      throw new Error('Instruction d2i not implemented!');
      return;
    case INSTRUCTION_SET.d2l:
      throw new Error('Instruction d2l not implemented!');
      return;
    case INSTRUCTION_SET.d2f:
      throw new Error('Instruction d2f not implemented!');
      return;
    case INSTRUCTION_SET.i2b:
      throw new Error('Instruction i2b not implemented!');
      return;
    case INSTRUCTION_SET.i2c:
      throw new Error('Instruction i2c not implemented!');
      return;
    case INSTRUCTION_SET.i2s:
      throw new Error('Instruction i2s not implemented!');
      return;
    case INSTRUCTION_SET.lcmp:
      throw new Error('Instruction lcmp not implemented!');
      return;
    case INSTRUCTION_SET.fcmpl:
      throw new Error('Instruction fcmpl not implemented!');
      return;
    case INSTRUCTION_SET.fcmpg:
      throw new Error('Instruction fcmpg not implemented!');
      return;
    case INSTRUCTION_SET.dcmpl:
      throw new Error('Instruction dcmpl not implemented!');
      return;
    case INSTRUCTION_SET.dcmpg:
      throw new Error('Instruction dcmpg not implemented!');
      return;
    case INSTRUCTION_SET.ifeq:
      throw new Error('Instruction ifeq not implemented!');
      return;
    case INSTRUCTION_SET.ifne:
      throw new Error('Instruction ifne not implemented!');
      return;
    case INSTRUCTION_SET.iflt:
      throw new Error('Instruction iflt not implemented!');
      return;
    case INSTRUCTION_SET.ifge:
      throw new Error('Instruction ifge not implemented!');
      return;
    case INSTRUCTION_SET.ifgt:
      throw new Error('Instruction ifgt not implemented!');
      return;
    case INSTRUCTION_SET.ifle:
      throw new Error('Instruction ifle not implemented!');
      return;
    case INSTRUCTION_SET.if_icmpeq:
      throw new Error('Instruction if_icmpeq not implemented!');
      return;
    case INSTRUCTION_SET.if_icmpne:
      throw new Error('Instruction if_icmpne not implemented!');
      return;
    case INSTRUCTION_SET.if_icmplt:
      throw new Error('Instruction if_icmplt not implemented!');
      return;
    case INSTRUCTION_SET.if_icmpge:
      throw new Error('Instruction if_icmpge not implemented!');
      return;
    case INSTRUCTION_SET.if_icmpgt:
      throw new Error('Instruction if_icmpgt not implemented!');
      return;
    case INSTRUCTION_SET.if_icmple:
      throw new Error('Instruction if_icmple not implemented!');
      return;
    case INSTRUCTION_SET.if_acmpeq:
      throw new Error('Instruction if_acmpeq not implemented!');
      return;
    case INSTRUCTION_SET.if_acmpne:
      throw new Error('Instruction if_acmpne not implemented!');
      return;
    case INSTRUCTION_SET.goto:
      throw new Error('Instruction goto not implemented!');
      return;
    case INSTRUCTION_SET.jsr:
      throw new Error('Instruction jsr not implemented!');
      return;
    case INSTRUCTION_SET.ret:
      throw new Error('Instruction ret not implemented!');
      return;
    case INSTRUCTION_SET.tableswitch:
      throw new Error('Instruction tableswitch not implemented!');
      return;
    case INSTRUCTION_SET.lookupswitch:
      throw new Error('Instruction lookupswitch not implemented!');
      return;
    case INSTRUCTION_SET.ireturn:
      throw new Error('Instruction ireturn not implemented!');
      return;
    case INSTRUCTION_SET.lreturn:
      throw new Error('Instruction lreturn not implemented!');
      return;
    case INSTRUCTION_SET.freturn:
      throw new Error('Instruction freturn not implemented!');
      return;
    case INSTRUCTION_SET.dreturn:
      throw new Error('Instruction dreturn not implemented!');
      return;
    case INSTRUCTION_SET.areturn:
      throw new Error('Instruction areturn not implemented!');
      return;
    case INSTRUCTION_SET.return:
      throw new Error('Instruction return not implemented!');
      return;
    case INSTRUCTION_SET.getstatic:
      throw new Error('Instruction getstatic not implemented!');
      return;
    case INSTRUCTION_SET.putstatic:
      throw new Error('Instruction putstatic not implemented!');
      return;
    case INSTRUCTION_SET.getfield:
      throw new Error('Instruction getfield not implemented!');
      return;
    case INSTRUCTION_SET.putfield:
      throw new Error('Instruction putfield not implemented!');
      return;
    case INSTRUCTION_SET.invokevirtual:
      throw new Error('Instruction invokevirtual not implemented!');
      return;
    case INSTRUCTION_SET.invokespecial:
      throw new Error('Instruction invokespecial not implemented!');
      return;
    case INSTRUCTION_SET.invokestatic:
      throw new Error('Instruction invokestatic not implemented!');
      return;
    case INSTRUCTION_SET.invokeinterface:
      throw new Error('Instruction invokeinterface not implemented!');
      return;
    case INSTRUCTION_SET.invokedynamic:
      throw new Error('Instruction invokedynamic not implemented!');
      return;
    case INSTRUCTION_SET.new:
      throw new Error('Instruction new not implemented!');
      return;
    case INSTRUCTION_SET.newarray:
      throw new Error('Instruction newarray not implemented!');
      return;
    case INSTRUCTION_SET.anewarray:
      throw new Error('Instruction anewarray not implemented!');
      return;
    case INSTRUCTION_SET.arraylength:
      throw new Error('Instruction arraylength not implemented!');
      return;
    case INSTRUCTION_SET.athrow:
      throw new Error('Instruction athrow not implemented!');
      return;
    case INSTRUCTION_SET.checkcast:
      throw new Error('Instruction checkcast not implemented!');
      return;
    case INSTRUCTION_SET.instanceof:
      throw new Error('Instruction instanceof not implemented!');
      return;
    case INSTRUCTION_SET.monitorenter:
      throw new Error('Instruction monitorenter not implemented!');
      return;
    case INSTRUCTION_SET.monitorexit:
      throw new Error('Instruction monitorexit not implemented!');
      return;
    case INSTRUCTION_SET.wide:
      throw new Error('Instruction wide not implemented!');
      return;
    case INSTRUCTION_SET.multianewarray:
      throw new Error('Instruction multianewarray not implemented!');
      return;
    case INSTRUCTION_SET.ifnull:
      throw new Error('Instruction ifnull not implemented!');
      return;
    case INSTRUCTION_SET.ifnonnull:
      throw new Error('Instruction ifnonnull not implemented!');
      return;
    case INSTRUCTION_SET.goto_w:
      throw new Error('Instruction goto_w not implemented!');
      return;
    case INSTRUCTION_SET.jsr_w:
      throw new Error('Instruction jsr_w not implemented!');
      return;
    case INSTRUCTION_SET.breakpoint:
      throw new Error('Instruction breakpoint not implemented!');
      return;
    case INSTRUCTION_SET.impdep1:
      throw new Error('Instruction impdep1 not implemented!');
      return;
    case INSTRUCTION_SET.impdep2:
      throw new Error('Instruction impdep2 not implemented!');
      return;
    default:
      throw new Error('runInstruction: Unknown opcode received!');
  }
}
