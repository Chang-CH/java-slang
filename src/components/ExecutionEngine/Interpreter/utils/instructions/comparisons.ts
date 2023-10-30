import JvmThread from '#types/reference/Thread';
import { asDouble, asFloat } from '..';

export function runLcmp(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = thread.popStack64();
  const value1 = thread.popStack64();

  if (value1 > value2) {
    thread.pushStack(1);
    return;
  }

  if (value1 < value2) {
    thread.pushStack(-1);
    return;
  }

  thread.pushStack(0);
}

export function runFcmpl(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  if (Number.isNaN(value1) || Number.isNaN(value2)) {
    thread.pushStack(-1);
    return;
  }

  if (value1 == value2) {
    thread.pushStack(0);
    return;
  }

  if (value1 > value2) {
    thread.pushStack(1);
    return;
  }

  thread.pushStack(-1);
}

export function runFcmpg(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  if (Number.isNaN(value1) || Number.isNaN(value2)) {
    thread.pushStack(1);
    return;
  }

  if (value1 == value2) {
    thread.pushStack(0);
    return;
  }

  if (value1 > value2) {
    thread.pushStack(1);
    return;
  }

  thread.pushStack(-1);
}

export function runDcmpl(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  if (Number.isNaN(value1) || Number.isNaN(value2)) {
    thread.pushStack(-1);
    return;
  }

  if (value1 == value2) {
    thread.pushStack(0);
    return;
  }

  if (value1 > value2) {
    thread.pushStack(1);
    return;
  }

  thread.pushStack(-1);
}

export function runDcmpg(thread: JvmThread): void {
  thread.offsetPc(1);
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  if (Number.isNaN(value1) || Number.isNaN(value2)) {
    thread.pushStack(1);
    return;
  }

  if (value1 == value2) {
    thread.pushStack(0);
    return;
  }

  if (value1 > value2) {
    thread.pushStack(1);
    return;
  }

  thread.pushStack(-1);
}

export function runIfeq(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  if (thread.popStack() === 0) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfne(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  if (thread.popStack() !== 0) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIflt(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  if (thread.popStack() < 0) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfge(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  if (thread.popStack() >= 0) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfgt(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  if (thread.popStack() > 0) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfle(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  if (thread.popStack() <= 0) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfIcmpeq(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 === value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfIcmpne(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 !== value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfIcmplt(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 < value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfIcmpge(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 >= value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfIcmpgt(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 > value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfIcmple(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 <= value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfAcmpeq(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 === value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfAcmpne(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 !== value2) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}
