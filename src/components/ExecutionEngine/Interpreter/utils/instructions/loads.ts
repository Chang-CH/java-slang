import { InstructionType } from '../readInstruction';
import { JavaArray } from '#types/dataTypes';
import NativeThread from '../../../NativeThreadGroup/NativeThread';

export function runIload(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runLload(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runFload(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runDload(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runAload(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(instruction.operands[0]));
  thread.offsetPc(2);
}

export function runIload0(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(0));
  thread.offsetPc(1);
}

export function runIload1(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(1));
  thread.offsetPc(1);
}

export function runIload2(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(2));
  thread.offsetPc(1);
}

export function runIload3(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(3));
  thread.offsetPc(1);
}

export function runLload0(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(0));
  thread.offsetPc(1);
}

export function runLload1(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(1));
  thread.offsetPc(1);
}

export function runLload2(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(2));
  thread.offsetPc(1);
}

export function runLload3(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(3));
  thread.offsetPc(1);
}

export function runFload0(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(0));
  thread.offsetPc(1);
}

export function runFload1(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(1));
  thread.offsetPc(1);
}

export function runFload2(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(2));
  thread.offsetPc(1);
}

export function runFload3(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(3));
  thread.offsetPc(1);
}

export function runDload0(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(0));
  thread.offsetPc(1);
}

export function runDload1(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(1));
  thread.offsetPc(1);
}

export function runDload2(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(2));
  thread.offsetPc(1);
}

export function runDload3(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack64(thread.loadLocal64(3));
  thread.offsetPc(1);
}

export function runAload0(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(0));
  thread.offsetPc(1);
}

export function runAload1(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(1));
  thread.offsetPc(1);
}

export function runAload2(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(2));
  thread.offsetPc(1);
}

export function runAload3(thread: NativeThread, instruction: InstructionType) {
  thread.pushStack(thread.loadLocal(3));
  thread.offsetPc(1);
}

export function runIaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runLaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack64(arrayref.get(index));
  thread.offsetPc(1);
}

export function runFaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runDaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack64(arrayref.get(index));
  thread.offsetPc(1);
}

export function runAaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runBaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runCaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}

export function runSaload(thread: NativeThread, instruction: InstructionType) {
  const index: number = thread.popStack();
  const arrayref: JavaArray | null = thread.popStack();
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (arrayref.len() <= index || index < 0) {
    thread.throwNewException(
      'java/lang/ArrayIndexOutOfBoundsException',
      `Index ${index} out of bounds for length ${arrayref.len()}`
    );
    return;
  }
  thread.pushStack(arrayref.get(index));
  thread.offsetPc(1);
}
