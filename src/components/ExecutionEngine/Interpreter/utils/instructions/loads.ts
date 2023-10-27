import { JavaArray } from '#types/dataTypes';
import NativeThread from '../../../NativeThreadGroup/NativeThread';

export function runIload(thread: NativeThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(index));
}

export function runLload(thread: NativeThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(index));
}

export function runFload(thread: NativeThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(index));
}

export function runDload(thread: NativeThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(index));
}

export function runAload(thread: NativeThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(index));
}

export function runIload0(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(0));
}

export function runIload1(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(1));
}

export function runIload2(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(2));
}

export function runIload3(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(3));
}

export function runLload0(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(0));
}

export function runLload1(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(1));
}

export function runLload2(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(2));
}

export function runLload3(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(3));
}

export function runFload0(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(0));
}

export function runFload1(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(1));
}

export function runFload2(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(2));
}

export function runFload3(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(3));
}

export function runDload0(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(0));
}

export function runDload1(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(1));
}

export function runDload2(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(2));
}

export function runDload3(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack64(thread.loadLocal64(3));
}

export function runAload0(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(0));
}

export function runAload1(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(1));
}

export function runAload2(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(2));
}

export function runAload3(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.pushStack(thread.loadLocal(3));
}

export function runIaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runLaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runFaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runDaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runAaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runBaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runCaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}

export function runSaload(thread: NativeThread): void {
  thread.offsetPc(1);
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
}
