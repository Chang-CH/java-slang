import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassRef/instructions';

export function runGoto(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(instruction.operands[0]);
}

export function runJsr(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.pushStack(instruction.operands[0]);
  thread.offsetPc(3);
}

export function runRet(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(2);
  const retAddr = thread.loadLocal(instruction.operands[0]);
  // TODO: update pc to retAddr
  throw new Error('runInstruction: ret not implemented');
}

export function runTableswitch(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runLookupswitch(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runIreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runLreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ret = thread.popStackWide();
  thread.popStackFrame();
  thread.pushStackWide(ret);
}

export function runFreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runDreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ret = thread.popStackWide();
  thread.popStackFrame();
  thread.pushStackWide(ret);
}

export function runAreturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runReturn(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.popStackFrame();
}
