import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '../readInstruction';

export function runGoto(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(instruction.operands[0]);
}

export function runJsr(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(instruction.operands[0]);
  thread.offsetPc(3);
}

export function runRet(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(2);
  const retAddr = thread.loadLocal(instruction.operands[0]);
  // TODO: update pc to retAddr
  throw new Error('runInstruction: ret not implemented');
}

export function runTableswitch(
  thread: NativeThread,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runLookupswitch(
  thread: NativeThread,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runIreturn(thread: NativeThread, instruction: InstructionType) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runLreturn(thread: NativeThread, instruction: InstructionType) {
  const ret = thread.popStack64();
  thread.popStackFrame();
  thread.pushStack64(ret);
}

export function runFreturn(thread: NativeThread, instruction: InstructionType) {
  const ret = Math.fround(thread.popStack());
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runDreturn(thread: NativeThread, instruction: InstructionType) {
  const ret = thread.popStack64() + 1 - 1;
  thread.popStackFrame();
  thread.pushStack64(ret);
}

export function runAreturn(thread: NativeThread, instruction: InstructionType) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runReturn(thread: NativeThread, instruction: InstructionType) {
  thread.popStackFrame();
}
