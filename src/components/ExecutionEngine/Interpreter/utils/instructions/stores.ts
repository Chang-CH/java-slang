import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '../readInstruction';
import { JavaArray } from '#types/dataTypes';

export function runIstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runLstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal64(instruction.operands[0], thread.popStack64());
  thread.offsetPc(2);
}

export function runFstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal(instruction.operands[0], Math.fround(thread.popStack()));
  thread.offsetPc(2);
}

export function runDstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal64(instruction.operands[0], thread.popStack64() + 1 - 1); // force into double
  thread.offsetPc(2);
}

export function runAstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runIstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runIstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runIstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runIstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runLstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(0, value);
  thread.offsetPc(1);
}

export function runLstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(1, value);
  thread.offsetPc(1);
}

export function runLstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(2, value);
  thread.offsetPc(1);
}

export function runLstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(3, value);
  thread.offsetPc(1);
}

export function runFstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(0, Math.fround(value));
  thread.offsetPc(1);
}

export function runFstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(1, Math.fround(value));
  thread.offsetPc(1);
}

export function runFstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(2, Math.fround(value));
  thread.offsetPc(1);
}

export function runFstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(3, Math.fround(value));
  thread.offsetPc(1);
}

export function runDstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64() + 1 - 1; // force into double
  thread.storeLocal64(0, value);
  thread.offsetPc(1);
}

export function runDstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64() + 1 - 1; // force into double
  thread.storeLocal64(1, value);
  thread.offsetPc(1);
}

export function runDstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64() + 1 - 1; // force into double
  thread.storeLocal64(2, value);
  thread.offsetPc(1);
}

export function runDstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64() + 1 - 1; // force into double
  thread.storeLocal64(3, value);
  thread.offsetPc(1);
}

export function runAstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runAstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runAstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runAstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runIastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runLastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runFastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runDastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runAastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runBastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, (value << 24) >> 24);
  thread.offsetPc(1);
}

export function runCastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, value & 0xffff);
  thread.offsetPc(1);
}

export function runSastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;

  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (index < 0 || index >= arrayref.len()) {
    thread.throwNewException('java/lang/ArrayIndexOutOfBoundsException', '');
    return;
  }

  arrayref.set(index, (value << 16) >> 16);
  thread.offsetPc(1);
}
