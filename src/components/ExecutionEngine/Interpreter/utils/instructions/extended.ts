import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '../readInstruction';
import { JavaReference } from '#types/dataTypes';

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
  thread.pushStack64(instruction.operands[0]);
  thread.offsetPc(5);
}
