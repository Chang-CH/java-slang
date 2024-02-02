import Thread from '#jvm/components/thread';
import { checkError } from '#types/Result';
import { asDouble, asFloat } from '#utils/index';

const MAX_INT = 2147483647;
const MIN_INT = -2147483648;
const MAX_LONG = BigInt('9223372036854775807');
const MIN_LONG = BigInt('-9223372036854775808');

export function runI2l(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack64(BigInt(value));
}

export function runI2f(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack(Math.fround(value));
}

export function runI2d(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack64(value);
}

export function runL2i(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack64();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack(Number(BigInt.asIntN(32, value)));
}

export function runL2f(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack64();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack(asFloat(Number(value)));
}

export function runL2d(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack64();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack64(Number(value));
}

export function runF2i(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  let value = popResult.result;
  if (Number.isNaN(value)) {
    value = 0;
  } else {
    value = Math.min(MAX_INT, Math.max(MIN_INT, Math.round(asFloat(value))));
  }
  thread.pushStack(value);
}

export function runF2l(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  let value = popResult.result;
  if (Number.isNaN(value)) {
    value = BigInt(0);
  } else if (value == Infinity) {
    value = MAX_LONG;
  } else if (value == -Infinity) {
    value = MIN_LONG;
  } else {
    value = BigInt(Math.round(asFloat(value)));
    value = value > MAX_LONG ? MAX_LONG : value < MIN_LONG ? MIN_LONG : value;
  }
  thread.pushStack64(value);
}

export function runF2d(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  const value = popResult.result;
  thread.pushStack64(value);
}

export function runD2i(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack64();
  if (checkError(popResult)) {
    return;
  }
  let value = asDouble(popResult.result);
  if (Number.isNaN(value)) {
    value = 0;
  } else {
    // If too large round to largest int, vice versa.
    value = Math.max(Math.min(Math.round(value), MAX_INT), MIN_INT);
  }
  thread.pushStack(value);
}

export function runD2l(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack64();
  if (checkError(popResult)) {
    return;
  }
  const dbl = asDouble(popResult.result);
  let value;
  if (Number.isNaN(dbl)) {
    value = BigInt(0);
  } else if (dbl == Infinity) {
    value = MAX_LONG;
  } else if (dbl == -Infinity) {
    value = MIN_LONG;
  } else {
    value = BigInt(Math.round(dbl));
    value = value > MAX_LONG ? MAX_LONG : value < MIN_LONG ? MIN_LONG : value;
  }
  thread.pushStack64(value);
}

export function runD2f(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack64();
  if (checkError(popResult)) {
    return;
  }
  let value = asDouble(popResult.result);
  value = asFloat(value);
  thread.pushStack(value);
}

export function runI2b(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  let value = popResult.result;
  value = (value << 24) >> 24;
  thread.pushStack(value);
}

export function runI2c(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  let value = popResult.result;
  value = value & 0xffff;
  thread.pushStack(value);
}

export function runI2s(thread: Thread): void {
  thread.offsetPc(1);
  const popResult = thread.popStack();
  if (checkError(popResult)) {
    return;
  }
  let value = popResult.result;
  value = (value << 16) >> 16;
  thread.pushStack(value);
}
