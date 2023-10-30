import JvmThread from '#types/reference/Thread';
import { JvmArray } from '#types/reference/Array';
import { asDouble, asFloat } from '..';

export function runIstore(thread: JvmThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, thread.popStack());
}

export function runLstore(thread: JvmThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal64(index, thread.popStack64());
}

export function runFstore(thread: JvmThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, asFloat(thread.popStack()));
}

export function runDstore(thread: JvmThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal64(index, asDouble(thread.popStack64()));
}

export function runAstore(thread: JvmThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.storeLocal(index, thread.popStack());
}

export function runIstore0(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(0, value);
}

export function runIstore1(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(1, value);
}

export function runIstore2(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(2, value);
}

export function runIstore3(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(3, value);
}

export function runLstore0(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack64();
  thread.storeLocal64(0, value);
}

export function runLstore1(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack64();
  thread.storeLocal64(1, value);
}

export function runLstore2(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack64();
  thread.storeLocal64(2, value);
}

export function runLstore3(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack64();
  thread.storeLocal64(3, value);
}

export function runFstore0(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(0, asFloat(value));
}

export function runFstore1(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(1, asFloat(value));
}

export function runFstore2(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(2, asFloat(value));
}

export function runFstore3(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(3, asFloat(value));
}

export function runDstore0(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(0, value);
}

export function runDstore1(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(1, value);
}

export function runDstore2(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(2, value);
}

export function runDstore3(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = asDouble(thread.popStack64());
  thread.storeLocal64(3, value);
}

export function runAstore0(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(0, value);
}

export function runAstore1(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(1, value);
}

export function runAstore2(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(2, value);
}

export function runAstore3(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  thread.storeLocal(3, value);
}

export function runIastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runLastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack64();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runFastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runDastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack64();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runAastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runBastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runCastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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

export function runSastore(thread: JvmThread): void {
  thread.offsetPc(1);
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JvmArray;

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
