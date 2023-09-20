import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '../readInstruction';

export function runBreakpoint(
  thread: NativeThread,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep1(thread: NativeThread, instruction: InstructionType) {
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep2(thread: NativeThread, instruction: InstructionType) {
  throw new Error('runInstruction: Not implemented');
}
