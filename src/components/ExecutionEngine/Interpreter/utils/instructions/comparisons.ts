import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import NativeThread from '../../../NativeThreadGroup/NativeThread';

export function runLcmp(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2 = thread.popStackWide();
  const value1 = thread.popStackWide();

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

export function runFcmpl(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
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

export function runFcmpg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2 = thread.popStack();
  const value1 = thread.popStack();
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

export function runDcmpl(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2 = thread.popStackWide();
  const value1 = thread.popStackWide();
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

export function runDcmpg(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  thread.offsetPc(1);
  const value2 = thread.popStackWide();
  const value1 = thread.popStackWide();
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

export function runIfeq(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() === 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfne(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() !== 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIflt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() < 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfge(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() >= 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfgt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() > 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfle(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() <= 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmpeq(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 === value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmpne(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 !== value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmplt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 < value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmpge(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 >= value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmpgt(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 > value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmple(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 <= value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfAcmpeq(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 === value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfAcmpne(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const value2 = thread.popStack();
  const value1 = thread.popStack();

  if (value1 !== value2) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}
