import { constantTag } from '#constants/ClassFile/constants';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { constant_Utf8_info } from '#types/ClassFile/constants';
import { InstructionType } from '#types/ClassFile/instructions';

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

export function runIconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(0);
  thread.offsetPc(1);
}

export function runIconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(1);
  thread.offsetPc(1);
}

export function runIconst_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(2);
  thread.offsetPc(1);
}

export function runIconst_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(3);
  thread.offsetPc(1);
}

export function runIconst_4(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(4);
  thread.offsetPc(1);
}

export function runIconst_5(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(5);
  thread.offsetPc(1);
}

export function runLconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(0n);
  thread.offsetPc(1);
}

export function runLconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(1n);
  thread.offsetPc(1);
}

export function runFconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(0.0);
  thread.offsetPc(1);
}

export function runFconst_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(1.0);
  thread.offsetPc(1);
}

export function runFconst_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(2.0);
  thread.offsetPc(1);
}

export function runDconst_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(0.0);
  thread.offsetPc(1);
}

export function runDconst_1(
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
  const item = memoryArea.getConstant(
    thread.getClassName(),
    instruction.operands[0]
  );
  if (
    item.tag === constantTag.constant_Methodref ||
    item.tag === constantTag.constant_MethodType
  ) {
    console.debug('ldc: method reference resolution not implemented');
    thread.pushStack(item);
    thread.offsetPc(2);
    return;
  }

  if (item.tag === constantTag.constant_Class) {
    const className = memoryArea.getConstant(
      thread.getClassName(),
      item.nameIndex
    ) as constant_Utf8_info;

    const classRef = memoryArea.getClass(className.value);
    thread.pushStack(classRef);
    thread.offsetPc(2);
    return;
  }

  thread.pushStack(item.value);
  thread.offsetPc(2);
}

export function runLdcW(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  console.warn('ldcW: class/method reference resolution not implemented');
  thread.pushStackWide(
    memoryArea.getConstantWide(thread.getClassName(), instruction.operands[0])
      .value
  );
  thread.offsetPc(3);
}

export function runLdc2W(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(
    memoryArea.getConstantWide(thread.getClassName(), instruction.operands[0])
      .value
  );
  thread.offsetPc(3);
}
