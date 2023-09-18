import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '#types/ClassRef/instructions';
import { JavaReference } from '#types/DataTypes';

export function runWide(thread: NativeThread, instruction: InstructionType) {
  throw new Error('runInstruction: Not implemented');
}

export function runMultianewarray(
  thread: NativeThread,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runIfnull(thread: NativeThread, instruction: InstructionType) {
  const ref = thread.popStack() as JavaReference;
  if (ref === null) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfnonnull(
  thread: NativeThread,
  instruction: InstructionType
) {
  const ref = thread.popStack() as JavaReference;
  if (ref !== null) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runGotoW(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(instruction.operands[0]);
}

export function runJsrW(thread: NativeThread, instruction: InstructionType) {
  thread.pushStackWide(instruction.operands[0]);
  thread.offsetPc(5);
}
