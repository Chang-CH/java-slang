import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { ClassRef } from '#types/ClassRef';
import { ArrayType, JavaArray, JavaReference } from '#types/DataTypes';
import JsSystem from '#utils/JsSystem';

let thread: NativeThread;
let threadClass: ClassRef;

beforeEach(() => {
  const jni = new JNI();
  const os = new JsSystem({});

  const bscl = new BootstrapClassLoader(os, 'natives');
  bscl.load(
    'java/lang/Thread',
    () => {},
    e => {
      throw e;
    }
  );

  threadClass = bscl.getClassRef('java/lang/Thread', console.error) as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread, {
    operandStack: [],
    locals: [],
    class: threadClass,
    method: threadClass.methods['<init>()V'],
    pc: 0,
  });
});

describe('runInstruction', () => {
  test('ILOAD: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    runInstruction(thread, {
      opcode: OPCODE.ILOAD,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(1);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runInstruction', () => {
  test('LLOAD: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    runInstruction(thread, {
      opcode: OPCODE.LLOAD,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10n);
    expect(lastFrame.locals.length).toBe(1);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runInstruction', () => {
  test('FLOAD: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 1.3;
    runInstruction(thread, {
      opcode: OPCODE.FLOAD,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.3);
    expect(lastFrame.locals.length).toBe(1);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runInstruction', () => {
  test('DLOAD: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 1.3;
    runInstruction(thread, {
      opcode: OPCODE.DLOAD,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.3);
    expect(lastFrame.locals.length).toBe(1);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runInstruction', () => {
  test('ALOAD: loads reference from local variable array', () => {
    const obj = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = obj;
    runInstruction(thread, {
      opcode: OPCODE.ALOAD,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(obj);
    expect(lastFrame.locals.length).toBe(1);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runInstruction', () => {
  test('ILOAD0: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    runInstruction(thread, {
      opcode: OPCODE.ILOAD0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ILOAD1: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    runInstruction(thread, {
      opcode: OPCODE.ILOAD1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(11);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ILOAD2: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    runInstruction(thread, {
      opcode: OPCODE.ILOAD2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(12);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ILOAD3: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    runInstruction(thread, {
      opcode: OPCODE.ILOAD3,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(13);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('LLOAD0: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    runInstruction(thread, {
      opcode: OPCODE.LLOAD0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('LLOAD1: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    runInstruction(thread, {
      opcode: OPCODE.LLOAD1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(11n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('LLOAD2: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    runInstruction(thread, {
      opcode: OPCODE.LLOAD2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(12n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('LLOAD3: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    runInstruction(thread, {
      opcode: OPCODE.LLOAD3,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(13n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('FLOAD0: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.FLOAD0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('FLOAD1: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.FLOAD1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(11.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('FLOAD2: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.FLOAD2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(12.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('FLOAD3: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.FLOAD3,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(13.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('DLOAD0: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.DLOAD0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('DLOAD1: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.DLOAD1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(11.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('DLOAD2: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.DLOAD2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(12.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('DLOAD3: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    runInstruction(thread, {
      opcode: OPCODE.DLOAD3,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(13.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ALOAD0: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    runInstruction(thread, {
      opcode: OPCODE.ALOAD0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ALOAD1: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    runInstruction(thread, {
      opcode: OPCODE.ALOAD1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l1);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ALOAD2: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    runInstruction(thread, {
      opcode: OPCODE.ALOAD2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l2);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('ALOAD3: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    runInstruction(thread, {
      opcode: OPCODE.ALOAD3,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l3);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runInstruction', () => {
  test('IALOAD: loads int from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('IALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('IALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('LALOAD: loads long from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.LALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.LALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('LALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.LALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('LALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.LALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('FALOAD: loads float from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('FALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.FALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('FALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.FALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('DALOAD: loads float from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.DALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.DALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('DALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.DALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('DALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.DALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('AALOAD: loads ref from array', () => {
    const arrayRef = new JavaArray(1, 'Ljava/lang/Thread', [null]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.AALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(null);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('AALOAD: loads arrayref from array', () => {
    const ref = new JavaArray(1, 'Ljava/lang/Thread', [null]);
    const arrayRef = new JavaArray(1, '[Ljava/lang/Thread', [ref]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.AALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(ref);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('AALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.AALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('AALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, '[Ljava/lang/Thread', [null]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.AALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('AALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, '[Ljava/lang/Thread', [null]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.AALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('BALOAD: loads boolean from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.BALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('BALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.BALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('BALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.BALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('BALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.BALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('CALOAD: loads char from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.CALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('CALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.CALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('CALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.CALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('CALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.CALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runInstruction', () => {
  test('SALOAD: loads short from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.SALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('SALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.SALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe('java/lang/NullPointerException');
  });

  test('SALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.SALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('SALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.SALOAD,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V']
    );
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.cls.thisClass).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});
