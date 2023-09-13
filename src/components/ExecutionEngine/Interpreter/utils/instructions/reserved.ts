import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';

export function runBreakpoint(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep1(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep2(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}
