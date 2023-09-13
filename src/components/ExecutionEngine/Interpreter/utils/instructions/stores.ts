import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import { JavaArray } from '#types/DataTypes';

export function runIstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runLstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocalWide(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runFstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runDstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocalWide(instruction.operands[0], thread.popStackWide());
  thread.offsetPc(2);
}

export function runAstore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runIstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runIstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runIstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runIstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runLstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocalWide(0, value);
  thread.offsetPc(1);
}

export function runLstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocalWide(1, value);
  thread.offsetPc(1);
}

export function runLstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocalWide(2, value);
  thread.offsetPc(1);
}

export function runLstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocalWide(3, value);
  thread.offsetPc(1);
}

export function runFstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runFstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runFstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runFstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runDstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStackWide();
  thread.storeLocalWide(0, value);
  thread.offsetPc(1);
}

export function runDstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStackWide();
  thread.storeLocalWide(1, value);
  thread.offsetPc(1);
}

export function runDstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStackWide();
  thread.storeLocalWide(2, value);
  thread.offsetPc(1);
}

export function runDstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStackWide();
  thread.storeLocalWide(3, value);
  thread.offsetPc(1);
}

export function runAstore_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runAstore_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runAstore_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runAstore_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runIastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('iastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runLastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('lastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runFastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('fastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runDastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('dastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runAastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('aastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runBastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('bastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runCastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('castore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runSastore(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('sastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}
