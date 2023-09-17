import { MIN_INT } from '#constants/DataType';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '#types/ClassRef/instructions';

export function runIadd(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  // JS bitwise can only return 32-bit ints
  thread.pushStack((value1 + value2) | 0);
  thread.offsetPc(1);
}

export function runLadd(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 + value2));
  thread.offsetPc(1);
}

export function runFadd(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(Math.fround(value1 + value2));
  thread.offsetPc(1);
}

export function runDadd(
  thread: NativeThread,

  instruction: InstructionType
) {
  // JS numbers are IEEE754 doubles already
  const value2 = thread.popStackWide();
  const value1 = thread.popStackWide();
  thread.pushStackWide(value1 + value2);
  thread.offsetPc(1);
}

export function runIsub(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  // JS bitwise can only return 32-bit ints
  thread.pushStack((value1 - value2) | 0);
  thread.offsetPc(1);
}

export function runLsub(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 - value2));
  thread.offsetPc(1);
}

export function runFsub(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(Math.fround(value1 - value2));
  thread.offsetPc(1);
}

export function runDsub(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStackWide(value1 - value2);
  thread.offsetPc(1);
}

export function runImul(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  // JS bitwise can only return 32-bit ints
  thread.pushStack((value1 * value2) | 0);
  thread.offsetPc(1);
}

export function runLmul(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 * value2));
  thread.offsetPc(1);
}

export function runFmul(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(Math.fround(value1 * value2));
  thread.offsetPc(1);
}

export function runDmul(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStackWide(value1 * value2);
  thread.offsetPc(1);
}

export function runIdiv(
  thread: NativeThread,

  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 === MIN_INT && value2 === -1) {
    thread.pushStack(value1);
    return;
  }

  thread.pushStack((value1 / value2) | 0);
}

export function runLdiv(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 / value2));
  thread.offsetPc(1);
}

export function runFdiv(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(Math.fround(value1 / value2));
  thread.offsetPc(1);
}

export function runDdiv(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStackWide(value1 / value2);
  thread.offsetPc(1);
}

export function runIrem(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  // JS bitwise can only return 32-bit ints
  thread.pushStack(value1 % value2 | 0);
  thread.offsetPc(1);
}

export function runLrem(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 % value2));
  thread.offsetPc(1);
}

export function runFrem(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(Math.fround(value1 % value2));
  thread.offsetPc(1);
}

export function runDrem(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStackWide(value1 % value2);
  thread.offsetPc(1);
}

export function runIneg(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStack(-value | 0);
  thread.offsetPc(1);
}

export function runLneg(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, -value));
  thread.offsetPc(1);
}

export function runFneg(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStack(Math.fround(value));
  thread.offsetPc(1);
}

export function runDneg(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value = thread.popStack();
  thread.pushStackWide(-value);
  thread.offsetPc(1);
}

export function runIshl(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 << (value2 & 0x1f)) | 0);
  thread.offsetPc(1);
}

export function runLshl(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 << (value2 & 0x3fn)));
  thread.offsetPc(1);
}

export function runIshr(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 >> (value2 & 0x1f)) | 0);
  thread.offsetPc(1);
}

export function runLshr(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: number = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 >> BigInt(value2 & 0x3f)));
  thread.offsetPc(1);
}

export function runIushr(
  thread: NativeThread,

  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2: number = thread.popStack() & 0x3f;
  const value1: number = thread.popStack();

  if (value1 >= 0) {
    thread.pushStack((value1 >> value2) | 0);
    return;
  }

  thread.pushStack(((value1 >> value2) + (2 << ~value2)) | 0);
}

export function runLushr(
  thread: NativeThread,

  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2: number = thread.popStack() & 0x3f;
  const value1: bigint = thread.popStack();

  if (value1 >= 0) {
    thread.pushStackWide(BigInt.asIntN(64, value1 >> BigInt(value2)));
    return;
  }

  thread.pushStackWide(
    BigInt.asIntN(64, (value1 >> BigInt(value2)) + (2n << BigInt(~value2)))
  );
}

export function runIand(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 & value2) | 0);
  thread.offsetPc(1);
}

export function runLand(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 & value2));
  thread.offsetPc(1);
}

export function runIor(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack(value1 | value2 | 0);
  thread.offsetPc(1);
}

export function runLor(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 | value2));
  thread.offsetPc(1);
}

export function runIxor(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  thread.pushStack((value1 ^ value2) | 0);
  thread.offsetPc(1);
}

export function runLxor(
  thread: NativeThread,

  instruction: InstructionType
) {
  const value2: bigint = thread.popStack();
  const value1: bigint = thread.popStack();
  thread.pushStackWide(BigInt.asIntN(64, value1 ^ value2));
  thread.offsetPc(1);
}

export function runIinc(
  thread: NativeThread,

  instruction: InstructionType
) {
  const index = instruction.operands[0];
  const constant = instruction.operands[1];
  thread.storeLocal(index, (thread.loadLocal(index) + constant) | 0);
  thread.offsetPc(3);
}
