import { InstructionType } from '../readInstruction';
import NativeThread from '../../../NativeThreadGroup/NativeThread';
import { asDouble, asFloat } from '..';

export function runLcmp(thread: NativeThread, instruction: InstructionType) {
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

export function runFcmpl(thread: NativeThread, instruction: InstructionType) {
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

export function runFcmpg(thread: NativeThread, instruction: InstructionType) {
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

export function runDcmpl(thread: NativeThread, instruction: InstructionType) {
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

export function runDcmpg(thread: NativeThread, instruction: InstructionType) {
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

export function runIfeq(thread: NativeThread, instruction: InstructionType) {
  if (thread.popStack() === 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfne(thread: NativeThread, instruction: InstructionType) {
  if (thread.popStack() !== 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIflt(thread: NativeThread, instruction: InstructionType) {
  if (thread.popStack() < 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfge(thread: NativeThread, instruction: InstructionType) {
  if (thread.popStack() >= 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfgt(thread: NativeThread, instruction: InstructionType) {
  if (thread.popStack() > 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfle(thread: NativeThread, instruction: InstructionType) {
  if (thread.popStack() <= 0) {
    thread.offsetPc(instruction.operands[0]);
    return;
  }
  thread.offsetPc(3);
}

export function runIfIcmpeq(
  thread: NativeThread,
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
