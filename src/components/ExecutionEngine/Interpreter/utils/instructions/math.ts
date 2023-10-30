import JvmThread from '#types/reference/Thread';
import { asDouble, asFloat } from '..';

const MIN_INT = -2147483648;
const MIN_LONG = BigInt('-9223372036854775808');

export function runIadd(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  // 2 * MAX_INT is within max type safe int
  thread.pushStack((value1 + value2) | 0);
}

export function runLadd(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack64(BigInt.asIntN(64, value1 + value2));
}

export function runFadd(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());

  if (value1 === 0 && value2 !== 0) {
    thread.pushStack(value2);
    return;
  } else if (value1 !== 0 && value2 === 0) {
    thread.pushStack(value1);
    return;
  }

  thread.pushStack(asFloat(value1 + value2));
}

export function runDadd(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack64(value1 + value2);
}

export function runIsub(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  // 2 * MIN_INT within type safe int
  thread.pushStack((value1 - value2) | 0);
}

export function runLsub(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStack64(BigInt.asIntN(64, value1 - value2));
}

export function runFsub(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());

  if (value1 === 0 && value2 !== 0) {
    thread.pushStack(value2);
    return;
  } else if (value1 !== 0 && value2 === 0) {
    thread.pushStack(value1);
    return;
  }

  thread.pushStack(asFloat(value1 - value2));
}

export function runDsub(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack64(value1 - value2);
}

export function runImul(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(Math.imul(value1, value2) | 0);
}

export function runLmul(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack64();
  const value1: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, value1 * value2));
}

export function runFmul(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  thread.pushStack(asFloat(value1 * value2));
}

export function runDmul(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack64(value1 * value2);
}

export function runIdiv(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value2 === 0) {
    thread.throwNewException('java/lang/ArithmeticException', 'Division by 0');
    return;
  }

  if (value1 === MIN_INT && value2 === -1) {
    thread.pushStack(value1);
    return;
  }

  thread.pushStack((value1 / value2) | 0);
}

export function runLdiv(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack64();
  const value1: bigint = thread.popStack64();

  if (value2 === 0n) {
    thread.throwNewException('java/lang/ArithmeticException', 'Division by 0');
    return;
  }

  if (value1 === MIN_LONG && value2 === -1n) {
    thread.pushStack64(value1);
    return;
  }

  thread.pushStack64(BigInt.asIntN(64, value1 / value2));
}

export function runFdiv(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  thread.pushStack(asFloat(value1 / value2));
}

export function runDdiv(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack64(value1 / value2);
}

export function runIrem(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value2 === 0) {
    thread.throwNewException('java/lang/ArithmeticException', 'Division by 0');
    return;
  }
  // JS bitwise can only return 32-bit ints
  thread.pushStack(value1 % value2 | 0);
}

export function runLrem(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack64();
  const value1: bigint = thread.popStack64();

  if (value2 === 0n) {
    thread.throwNewException('java/lang/ArithmeticException', 'Division by 0');
    return;
  }

  thread.pushStack64(BigInt.asIntN(64, value1 % value2));
}

export function runFrem(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  thread.pushStack(asFloat(value1 % value2));
}

export function runDrem(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack64(value1 % value2);
}

export function runIneg(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.pushStack(-value | 0);
}

export function runLneg(thread: JvmThread): void {
  thread.offsetPc(1);
  const value: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, -value));
}

export function runFneg(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = asFloat(thread.popStack());
  thread.pushStack(asFloat(-value));
}

export function runDneg(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = asDouble(thread.popStack64());
  thread.pushStack64(-value);
}

export function runIshl(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 << (value2 & 0x1f)) | 0);
}

export function runLshl(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: number = thread.popStack();
  const value1: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, value1 << BigInt(value2 & 0x3f)));
}

export function runIshr(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 >> (value2 & 0x1f)) | 0);
}

export function runLshr(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: number = thread.popStack();
  const value1: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, value1 >> BigInt(value2 & 0x3f)));
}

export function runIushr(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: number = thread.popStack() & 0x1f;
  const value1: number = thread.popStack();

  thread.pushStack((value1 >>> value2) | 0);
}

export function runLushr(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: number = thread.popStack() & 0x3f;
  const value1: bigint = thread.popStack64();

  if (value1 >= 0) {
    thread.pushStack64(BigInt.asIntN(64, value1 >> BigInt(value2)));
    return;
  }

  // convert leading 1's to zeros
  thread.pushStack64((value1 & 0xffffffffffffffffn) >> BigInt(value2));
}

export function runIand(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 & value2) | 0);
}

export function runLand(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack64();
  const value1: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, value1 & value2));
}

export function runIor(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(value1 | value2 | 0);
}

export function runLor(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack64();
  const value1: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, value1 | value2));
}

export function runIxor(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 ^ value2) | 0);
}

export function runLxor(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2: bigint = thread.popStack64();
  const value1: bigint = thread.popStack64();
  thread.pushStack64(BigInt.asIntN(64, value1 ^ value2));
}

export function runIinc(thread: JvmThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  const constant = thread.getCode().getInt8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, (thread.loadLocal(index) + constant) | 0);
}
