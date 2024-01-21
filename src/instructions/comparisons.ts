import Thread from '#jvm/components/thread';
import { asDouble, asFloat } from '#utils/index';

function cmp(value1: number, value2: number, checkNan: number = 0): number {
  if (checkNan !== 0 && (Number.isNaN(value1) || Number.isNaN(value2))) {
    return checkNan;
  }

  if (value1 == value2) {
    return 0;
  }

  if (value1 > value2) {
    return 1;
  }

  return -1;
}

export function runLcmp(thread: Thread): void {
  const value2 = thread.popStack64();
  const value1 = thread.popStack64();
  thread.pushStack(cmp(value1, value2));
  thread.offsetPc(1);
}

export function runFcmpl(thread: Thread): void {
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  thread.pushStack(cmp(value1, value2, -1));
  thread.offsetPc(1);
}

export function runFcmpg(thread: Thread): void {
  const value2 = asFloat(thread.popStack());
  const value1 = asFloat(thread.popStack());
  thread.pushStack(cmp(value1, value2, 1));
  thread.offsetPc(1);
}

export function runDcmpl(thread: Thread): void {
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack(cmp(value1, value2, -1));
  thread.offsetPc(1);
}

export function runDcmpg(thread: Thread): void {
  const value2 = asDouble(thread.popStack64());
  const value1 = asDouble(thread.popStack64());
  thread.pushStack(cmp(value1, value2, 1));
  thread.offsetPc(1);
}

export function runIfeq(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  if (thread.popStack() === 0) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfne(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  if (thread.popStack() !== 0) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIflt(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  if (thread.popStack() < 0) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfge(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  if (thread.popStack() >= 0) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfgt(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  if (thread.popStack() > 0) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfle(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  if (thread.popStack() <= 0) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfIcmpeq(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 === value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfIcmpne(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 !== value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfIcmplt(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 < value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfIcmpge(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 >= value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfIcmpgt(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 > value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfIcmple(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 <= value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfAcmpeq(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 === value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}

export function runIfAcmpne(thread: Thread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC() + 1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
  if (value1 !== value2) {
    thread.offsetPc(branchbyte);
  } else {
    thread.offsetPc(3);
  }
}
