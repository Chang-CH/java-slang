import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JavaArray } from '#types/dataTypes';
import { asDouble, asFloat } from '..';

export function runIstore(thread: NativeThread): void {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, thread.popStack());
}

export function runLstore(thread: NativeThread): void {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal64(index, thread.popStack64());
}

export function runFstore(thread: NativeThread): void {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, asFloat(thread.popStack()));
}

export function runDstore(thread: NativeThread): void {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal64(index, asDouble(thread.popStack64()));
}

export function runAstore(thread: NativeThread): void {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, thread.popStack());
}

export function runIstore0(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(0, value);
}

export function runIstore1(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(1, value);
}

export function runIstore2(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(2, value);
}

export function runIstore3(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(3, value);
}

export function runLstore0(thread: NativeThread): void {
  const value = thread.popStack64();
  thread.storeLocal64(0, value);
}

export function runLstore1(thread: NativeThread): void {
  const value = thread.popStack64();
  thread.storeLocal64(1, value);
}

export function runLstore2(thread: NativeThread): void {
  const value = thread.popStack64();
  thread.storeLocal64(2, value);
}

export function runLstore3(thread: NativeThread): void {
  const value = thread.popStack64();
  thread.storeLocal64(3, value);
}

export function runFstore0(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(0, asFloat(value));
}

export function runFstore1(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(1, asFloat(value));
}

export function runFstore2(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(2, asFloat(value));
}

export function runFstore3(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(3, asFloat(value));
}

export function runDstore0(thread: NativeThread): void {
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(0, value);
}

export function runDstore1(thread: NativeThread): void {
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(1, value);
}

export function runDstore2(thread: NativeThread): void {
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(2, value);
}

export function runDstore3(thread: NativeThread): void {
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(3, value);
}

export function runAstore0(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(0, value);
}

export function runAstore1(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(1, value);
}

export function runAstore2(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(2, value);
}

export function runAstore3(thread: NativeThread): void {
  const value = thread.popStack();
  thread.storeLocal(3, value);
}

export function runIastore(thread: NativeThread): void {
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
}

export function runLastore(thread: NativeThread): void {
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
}

export function runFastore(thread: NativeThread): void {
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
}

export function runDastore(thread: NativeThread): void {
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
}

export function runAastore(thread: NativeThread): void {
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
}

export function runBastore(thread: NativeThread): void {
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
}

export function runCastore(thread: NativeThread): void {
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
}

export function runSastore(thread: NativeThread): void {
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
}
