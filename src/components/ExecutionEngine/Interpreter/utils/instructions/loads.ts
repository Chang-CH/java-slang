import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import NativeThread from '../../../NativeThreadGroup/NativeThread';

export function runIload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runLload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runFload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runDload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runAload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runIload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(0));
  thread.offsetPc(1);
}

export function runIload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(1));
  thread.offsetPc(1);
}

export function runIload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(2));
  thread.offsetPc(1);
}

export function runIload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(3));
  thread.offsetPc(1);
}

export function runLload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(0));
  thread.offsetPc(1);
}

export function runLload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(1));
  thread.offsetPc(1);
}

export function runLload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(2));
  thread.offsetPc(1);
}

export function runLload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(3));
  thread.offsetPc(1);
}

export function runFload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(0));
  thread.offsetPc(1);
}

export function runFload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(1));
  thread.offsetPc(1);
}

export function runFload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(2));
  thread.offsetPc(1);
}

export function runFload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(3));
  thread.offsetPc(1);
}

export function runDload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(0));
  thread.offsetPc(1);
}

export function runDload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(1));
  thread.offsetPc(1);
}

export function runDload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(2));
  thread.offsetPc(1);
}

export function runDload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStackWide(thread.loadLocalWide(3));
  thread.offsetPc(1);
}

export function runAload_0(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(0));
  thread.offsetPc(1);
}

export function runAload_1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(1));
  thread.offsetPc(1);
}

export function runAload_2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(2));
  thread.offsetPc(1);
}

export function runAload_3(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(thread.loadLocal(3));
  thread.offsetPc(1);
}

export function runIaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('iaload: exceptions possibly not thrown');
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runLaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('laload: exceptions possibly not thrown');
  thread.pushStackWide(arrayref.get(index));
  thread.offsetPc(1);
}

export function runFaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('faload: exceptions possibly not thrown');
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runDaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('daload: exceptions possibly not thrown');
  thread.pushStackWide(arrayref.get(index));
  thread.offsetPc(1);
}

export function runAaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('aaload: exceptions possibly not thrown');
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runBaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('baload: exceptions possibly not thrown');
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runCaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('caload: exceptions possibly not thrown');
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runSaload(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const index: number = thread.popStack();
  const arrayref: any = thread.popStack();
  // TODO: throw NullPointerException if arrayref is null
  // TODO: throw ArrayIndexOutOfBoundsException if OOB
  console.warn('saload: exceptions possibly not thrown');
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}
