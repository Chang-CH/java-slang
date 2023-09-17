import { MAX_INT, MIN_INT, MAX_LONG, MIN_LONG } from '#constants/DataType';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '#types/ClassRef/instructions';

export function runI2l(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStackWide(BigInt(value));
  thread.offsetPc(1);
}

export function runI2f(
  thread: NativeThread,

  instruction: InstructionType
) {
  thread.offsetPc(1);
}

export function runI2d(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStackWide(value);
  thread.offsetPc(1);
}

export function runL2i(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStack(Number(BigInt.asIntN(32, value)));
  thread.offsetPc(1);
}

export function runL2f(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStack(Math.fround(Number(value)));
  thread.offsetPc(1);
}

export function runL2d(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStack(Number(value));
  thread.offsetPc(1);
}

export function runF2i(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStack();
  if (Number.isNaN(value)) {
    value = 0;
  } else {
    value = Math.min(MAX_INT, Math.max(MIN_INT, Math.round(value)));
  }
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runF2l(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStack();
  if (Number.isNaN(value)) {
    value = 0n;
  } else {
    value = BigInt(Math.round(value));
    value = value > MAX_LONG ? MAX_LONG : value < MIN_LONG ? MIN_LONG : value;
  }
  thread.pushStackWide(value);
  thread.offsetPc(1);
}

export function runF2d(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStackWide(value);
  thread.offsetPc(1);
}

export function runD2i(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStackWide();
  if (Number.isNaN(value)) {
    value = 0;
  } else {
    // If too large round to largest int, vice versa.
    value = Math.max(Math.min(Math.round(value), MAX_INT), MIN_INT);
  }
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runD2l(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStackWide();
  if (Number.isNaN(value)) {
    value = 0n;
  } else {
    value = BigInt(Math.round(value));
    value = value > MAX_LONG ? MAX_LONG : value < MIN_LONG ? MIN_LONG : value;
  }
  thread.pushStackWide(value);
  thread.offsetPc(1);
}

export function runD2f(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStackWide();
  value = Math.fround(value);
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runI2b(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStack();
  value = (value << 24) >> 24;
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runI2c(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStack();
  // TODO: confirm this is correct
  value = String.fromCharCode(value & 0xffff);
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runI2s(
  thread: NativeThread,

  instruction: InstructionType
) {
  let value = thread.popStack();
  value = (value << 16) >> 16;
  thread.pushStack(value);
  thread.offsetPc(1);
}
