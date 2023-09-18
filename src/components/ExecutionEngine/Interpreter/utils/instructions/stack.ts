import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '#types/ClassRef/instructions';

export function runPop(thread: NativeThread, instruction: InstructionType) {
  thread.popStack();
  thread.offsetPc(1);
}

export function runPop2(thread: NativeThread, instruction: InstructionType) {
  thread.popStackWide();
  thread.offsetPc(1);
}

export function runDup(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.pushStack(value);
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runDupX1(thread: NativeThread, instruction: InstructionType) {
  const value1 = thread.popStack();
  const value2 = thread.popStack();
  thread.pushStack(value1);
  thread.pushStack(value2);
  thread.pushStack(value1);
  thread.offsetPc(1);
}

export function runDupX2(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(1);
  const value1 = thread.popStack();
  const value2 = thread.popStack();
  const value3 = thread.popStack();
  thread.pushStack(value1);
  thread.pushStack(value3);
  thread.pushStack(value2);
  thread.pushStack(value1);
}

export function runDup2(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(1);
  const value1 = thread.popStack();
  const value2 = thread.popStack();
  thread.pushStack(value2);
  thread.pushStack(value1);
  thread.pushStack(value2);
  thread.pushStack(value1);
}

export function runDup2X1(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(1);
  const value1 = thread.popStack();
  const value2 = thread.popStack();
  const value3 = thread.popStack();
  thread.pushStack(value2);
  thread.pushStack(value1);
  thread.pushStack(value3);
  thread.pushStack(value2);
  thread.pushStack(value1);
}

export function runDup2X2(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(1);
  const value1 = thread.popStack();
  const value2 = thread.popStack();
  const value3 = thread.popStack();
  const value4 = thread.popStack();
  thread.pushStack(value2);
  thread.pushStack(value1);
  thread.pushStack(value4);
  thread.pushStack(value3);
  thread.pushStack(value2);
  thread.pushStack(value1);
}

export function runSwap(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(1);
  const value1 = thread.popStack();
  const value2 = thread.popStack();
  thread.pushStack(value1);
  thread.pushStack(value2);
}
