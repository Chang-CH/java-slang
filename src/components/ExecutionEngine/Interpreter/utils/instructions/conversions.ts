import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { InstructionType } from '../readInstruction';

const MAX_INT = 2147483647;
const MIN_INT = -2147483648;
const MAX_LONG = BigInt('9223372036854775807');
const MIN_LONG = BigInt('-9223372036854775808');

export function runI2l(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.pushStack64(BigInt(value));
  thread.offsetPc(1);
}

export function runI2f(thread: NativeThread, instruction: InstructionType) {
  thread.offsetPc(1);
}

export function runI2d(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.pushStack64(value);
  thread.offsetPc(1);
}

export function runL2i(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.pushStack(Number(BigInt.asIntN(32, value)));
  thread.offsetPc(1);
}

export function runL2f(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.pushStack(Math.fround(Number(value)));
  thread.offsetPc(1);
}

export function runL2d(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.pushStack64(Number(value));
  thread.offsetPc(1);
}

export function runF2i(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack();
  if (Number.isNaN(value)) {
    value = 0;
  } else {
    value = Math.min(
      MAX_INT,
      Math.max(MIN_INT, Math.round(Math.fround(value)))
    );
  }
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runF2l(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack();
  if (Number.isNaN(value)) {
    value = 0n;
  } else if (value == Infinity) {
    value = MAX_LONG;
  } else if (value == -Infinity) {
    value = MIN_LONG;
  } else {
    value = BigInt(Math.round(Math.fround(value)));
    value = value > MAX_LONG ? MAX_LONG : value < MIN_LONG ? MIN_LONG : value;
  }
  thread.pushStack64(value);
  thread.offsetPc(1);
}

export function runF2d(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.pushStack64(value);
  thread.offsetPc(1);
}

export function runD2i(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack64();
  if (Number.isNaN(value)) {
    value = 0;
  } else {
    // If too large round to largest int, vice versa.
    value = Math.max(Math.min(Math.round(value), MAX_INT), MIN_INT);
  }
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runD2l(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack64();
  if (Number.isNaN(value)) {
    value = 0n;
  } else if (value == Infinity) {
    value = MAX_LONG;
  } else if (value == -Infinity) {
    value = MIN_LONG;
  } else {
    value = BigInt(Math.round(value));
    value = value > MAX_LONG ? MAX_LONG : value < MIN_LONG ? MIN_LONG : value;
  }
  thread.pushStack64(value);
  thread.offsetPc(1);
}

export function runD2f(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack64();
  value = Math.fround(value);
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runI2b(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack();
  value = (value << 24) >> 24;
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runI2c(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack();
  value = value & 0xffff;
  thread.pushStack(value);
  thread.offsetPc(1);
}

export function runI2s(thread: NativeThread, instruction: InstructionType) {
  let value = thread.popStack();
  value = (value << 16) >> 16;
  thread.pushStack(value);
  thread.offsetPc(1);
}
