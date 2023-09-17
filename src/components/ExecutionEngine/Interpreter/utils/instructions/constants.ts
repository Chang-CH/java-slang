import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassRef/instructions';
import {
  ConstantDoubleInfo,
  ConstantFloatInfo,
  ConstantIntegerInfo,
  ConstantLongInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import {
  ConstantMethodref,
  ConstantInterfaceMethodref,
  ConstantClass,
  ConstantString,
} from '#types/ClassRef/constants';

export function runNop(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(1);
  return;
}

export function runAconstNull(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(null);
  thread.offsetPc(1);
}

export function runIconstM1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(-1);
  thread.offsetPc(1);
}

export function runIconst0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(0);
  thread.offsetPc(1);
}

export function runIconst1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(1);
  thread.offsetPc(1);
}

export function runIconst2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(2);
  thread.offsetPc(1);
}

export function runIconst3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(3);
  thread.offsetPc(1);
}

export function runIconst4(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(4);
  thread.offsetPc(1);
}

export function runIconst5(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(5);
  thread.offsetPc(1);
}

export function runLconst0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(0n);
  thread.offsetPc(1);
}

export function runLconst1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(1n);
  thread.offsetPc(1);
}

export function runFconst0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(0.0);
  thread.offsetPc(1);
}

export function runFconst1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(1.0);
  thread.offsetPc(1);
}

export function runFconst2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(2.0);
  thread.offsetPc(1);
}

export function runDconst0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(0.0);
  thread.offsetPc(1);
}

export function runDconst1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(1.0);
  thread.offsetPc(1);
}

export function runBipush(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(instruction.operands[0]);
  thread.offsetPc(2);
}

export function runSipush(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(instruction.operands[0]);
  thread.offsetPc(3);
}

export function runLdc(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const item = thread.getClass().getConstant(thread, instruction.operands[0]);
  if (
    item.tag === CONSTANT_TAG.constantMethodref ||
    item.tag === CONSTANT_TAG.constantInterfaceMethodref ||
    item.tag === CONSTANT_TAG.constantClass ||
    item.tag === CONSTANT_TAG.constantString
  ) {
    thread.pushStack(
      (
        item as
          | ConstantMethodref
          | ConstantInterfaceMethodref
          | ConstantClass
          | ConstantString
      ).ref
    );
    thread.offsetPc(2);
    return;
  }

  thread.pushStack((item as ConstantIntegerInfo | ConstantFloatInfo).value);
  thread.offsetPc(2);
}

export function runLdcW(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const item = thread.getClass().getConstant(thread, instruction.operands[0]);
  if (
    item.tag === CONSTANT_TAG.constantMethodref ||
    item.tag === CONSTANT_TAG.constantInterfaceMethodref ||
    item.tag === CONSTANT_TAG.constantClass ||
    item.tag === CONSTANT_TAG.constantString
  ) {
    thread.pushStack(
      (
        item as
          | ConstantMethodref
          | ConstantInterfaceMethodref
          | ConstantClass
          | ConstantString
      ).ref
    );
    thread.offsetPc(3);
    return;
  }

  thread.pushStack((item as ConstantIntegerInfo | ConstantFloatInfo).value);
  thread.offsetPc(3);
}

export function runLdc2W(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const item = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as
    | ConstantDoubleInfo
    | ConstantLongInfo;

  thread.pushStackWide(item.value);
  thread.offsetPc(3);
}
