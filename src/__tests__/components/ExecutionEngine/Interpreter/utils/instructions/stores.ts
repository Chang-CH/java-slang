import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ConstantRef';
import { ArrayType, JavaArray, JavaReference } from '#types/dataTypes';
import JsSystem from '#utils/JsSystem';
import { AttributeCode } from '#jvm/external/ClassFile/types/attributes';

let thread: NativeThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;
let javaThread: JavaReference;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new JsSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl.load('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);
  const method = threadClass.getMethod(thread, '<init>()V');
  code = (method.code as AttributeCode).code;
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method,
    pc: 0,
  });
});

describe('runIstore', () => {
  test('ISTORE: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(2);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runIstore0', () => {
  test('ISTORE0: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(2);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIstore1', () => {
  test('ISTORE1: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(2);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIstore2', () => {
  test('ISTORE2: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(2);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIstore3', () => {
  test('ISTORE3: stores int into locals', () => {
    thread.pushStack(3);
    code.setUint8(0, OPCODE.ISTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(3);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLstore', () => {
  test('LSTORE: stores long into locals', () => {
    thread.pushStack64(3n);
    code.setUint8(0, OPCODE.LSTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0) === 3n).toBe(true);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runLstore0', () => {
  test('LSTORE0: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0) === 5n).toBe(true);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLstore1', () => {
  test('LSTORE1: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(1) === 5n).toBe(true);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLstore2', () => {
  test('LSTORE2: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(2) === 5n).toBe(true);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLstore3', () => {
  test('LSTORE3: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(3) === 5n).toBe(true);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFstore', () => {
  test('FSTORE: stores double into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.5);
    expect(lastFrame.pc).toBe(2);
  });

  test('FSTORE: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(Math.fround(0.3));
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runFstore0', () => {
  test('FSTORE0: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSTORE0: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(Math.fround(0.3));
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFstore1', () => {
  test('FSTORE1: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSTORE1: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(Math.fround(0.3));
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFstore2', () => {
  test('FSTORE2: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSTORE2: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(Math.fround(0.3));
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFstore3', () => {
  test('FSTORE3: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSTORE3: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(Math.fround(0.3));
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDstore', () => {
  test('DSTORE: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0)).toBe(0.5);
    expect(lastFrame.pc).toBe(2);
  });

  test('DSTORE: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0)).toBe(0.29999995231628424);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runDstore0', () => {
  test('DSTORE0: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSTORE0: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0)).toBe(0.29999995231628424);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDstore1', () => {
  test('DSTORE1: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(1)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSTORE1: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(1)).toBe(0.29999995231628424);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDstore2', () => {
  test('DSTORE2: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(2)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSTORE2: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(2)).toBe(0.29999995231628424);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDstore3', () => {
  test('DSTORE3: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(3)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSTORE3: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(3)).toBe(0.29999995231628424);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runAstore', () => {
  test('ASTORE: stores int into locals', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE);
    code.setUint8(1, 0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(v1);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runAstore0', () => {
  test('ASTORE0: stores int into locals', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE0);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(v1);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runAstore1', () => {
  test('ASTORE1: stores int into locals', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE1);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(v1);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runAstore2', () => {
  test('ASTORE2: stores int into locals', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE2);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(v1);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runAstore3', () => {
  test('ASTORE3: stores int into locals', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(v1);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIastore', () => {
  test('IASTORE: stores int into array', () => {
    const arrayref = new JavaArray(1, ArrayType.int);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(lastFrame.pc).toBe(1);
  });

  test('IASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('IASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.int);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('IASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.int);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runLastore', () => {
  test('LASTORE: stores long into array', () => {
    const arrayref = new JavaArray(1, ArrayType.long);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0) === 5n).toBe(true);
    expect(lastFrame.pc).toBe(1);
  });

  test('LASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('LASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.long);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('LASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.long);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runFastore', () => {
  test('FASTORE: stores float into array', () => {
    const arrayref = new JavaArray(1, ArrayType.float);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('FASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('FASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.float);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('FASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.float);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runDastore', () => {
  test('DASTORE: stores double into array', () => {
    const arrayref = new JavaArray(1, ArrayType.double);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(0.5);
    expect(lastFrame.pc).toBe(1);
  });

  test('DASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('DASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.double);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('DASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.double);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runAastore', () => {
  test('AASTORE: stores reference into array', () => {
    const arrayref = new JavaArray(1, 'Ljava/lang/Thread');
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.AASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(v1);
    expect(lastFrame.pc).toBe(1);
  });

  test('AASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(null);
    code.setUint8(0, OPCODE.AASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('AASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, 'Ljava/lang/Thread');
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.AASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('AASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, 'Ljava/lang/Thread');
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.AASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runBastore', () => {
  test('BASTORE: stores byte into array', () => {
    const arrayref = new JavaArray(1, ArrayType.byte);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(lastFrame.pc).toBe(1);
  });

  test('BASTORE: truncates int to byte', () => {
    const arrayref = new JavaArray(1, ArrayType.byte);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(128);
    code.setUint8(0, OPCODE.BASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(-128);
    expect(lastFrame.pc).toBe(1);
  });

  test('BASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('BASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.byte);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('BASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.byte);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runCastore', () => {
  test('CASTORE: stores char into array', () => {
    const arrayref = new JavaArray(1, ArrayType.char);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(lastFrame.pc).toBe(1);
  });

  test('CASTORE: truncates int to char', () => {
    const arrayref = new JavaArray(1, ArrayType.char);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(0x11111);
    code.setUint8(0, OPCODE.CASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(0x1111);
    expect(lastFrame.pc).toBe(1);
  });

  test('CASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('CASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.char);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('CASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.char);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runSastore', () => {
  test('SASTORE: stores short into array', () => {
    const arrayref = new JavaArray(1, ArrayType.short);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(lastFrame.pc).toBe(1);
  });

  test('SASTORE: truncates int to short', () => {
    const arrayref = new JavaArray(1, ArrayType.char);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(32768);
    code.setUint8(0, OPCODE.SASTORE);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(-32768);
    expect(lastFrame.pc).toBe(1);
  });

  test('SASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('SASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.short);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('SASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrayref = new JavaArray(1, ArrayType.short);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);
    runInstruction(thread, jni, () => {});
    const exceptionObj = thread.loadLocal(1) as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});
