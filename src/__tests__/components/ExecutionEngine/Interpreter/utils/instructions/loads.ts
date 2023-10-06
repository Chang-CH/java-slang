import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ConstantRef';
import { ArrayPrimitiveType, JavaArray, JavaReference } from '#types/dataTypes';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';

let thread: NativeThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl.load('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);
  const method = threadClass.getMethod(thread, '<init>()V');
  code = (method.code as CodeAttribute).code;
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method,
    pc: 0,
  });
});

describe('runILOAD', () => {
  test('ILOAD: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    code.setUint8(0, OPCODE.ILOAD);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runLLOAD', () => {
  test('LLOAD: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    code.setUint8(0, OPCODE.LLOAD);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10n);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runFLOAD', () => {
  test('FLOAD: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 1.3;
    code.setUint8(0, OPCODE.FLOAD);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.3);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runDLOAD', () => {
  test('DLOAD: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 1.3;
    code.setUint8(0, OPCODE.DLOAD);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.3);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runALOAD', () => {
  test('ALOAD: loads reference from local variable array', () => {
    const obj = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = obj;
    code.setUint8(0, OPCODE.ALOAD);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(obj);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runILOAD_0', () => {
  test('ILOAD_0: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runILOAD_1', () => {
  test('ILOAD_1: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(11);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runILOAD_2', () => {
  test('ILOAD_2: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD_2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(12);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runILOAD_3', () => {
  test('ILOAD_3: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD_3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(13);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLLOAD_0', () => {
  test('LLOAD_0: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD_0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10n);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLLOAD_1', () => {
  test('LLOAD_1: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD_1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(11n);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLLOAD_2', () => {
  test('LLOAD_2: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD_2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(12n);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLLOAD_3', () => {
  test('LLOAD_3: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD_3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(13n);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFLOAD_0', () => {
  test('FLOAD_0: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD_0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFLOAD_1', () => {
  test('FLOAD_1: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD_1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(11.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFLOAD_2', () => {
  test('FLOAD_2: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD_2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(12.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFLOAD_3', () => {
  test('FLOAD_3: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD_3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(13.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDLOAD_0', () => {
  test('DLOAD_0: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD_0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDLOAD_1', () => {
  test('DLOAD_1: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD_1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(11.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDLOAD_2', () => {
  test('DLOAD_2: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD_2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(12.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDLOAD_3', () => {
  test('DLOAD_3: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD_3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(13.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runALOAD_0', () => {
  test('ALOAD_0: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD_0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l0);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runALOAD_1', () => {
  test('ALOAD_1: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD_1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l1);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runALOAD_2', () => {
  test('ALOAD_2: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD_2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l2);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runALOAD_3', () => {
  test('ALOAD_3: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD_3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l3);
    expect(lastFrame.locals.length).toBe(4);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIALOAD', () => {
  test('IALOAD: loads int from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('IALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('IALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('IALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runLALOAD', () => {
  test('LALOAD: loads long from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('LALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('LALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('LALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runFALOAD', () => {
  test('FALOAD: loads float from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('FALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('FALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runDALOAD', () => {
  test('DALOAD: loads float from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('DALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('DALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runAALOAD', () => {
  test('AALOAD: loads ref from array', () => {
    const arrayRef = new JavaArray(1, 'Ljava/lang/Thread', [null]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(null);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('AALOAD: loads arrayref from array', () => {
    const ref = new JavaArray(1, 'Ljava/lang/Thread', [null]);
    const arrayRef = new JavaArray(1, '[Ljava/lang/Thread', [ref]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(ref);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('AALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('AALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, '[Ljava/lang/Thread', [null]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('AALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, '[Ljava/lang/Thread', [null]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runBALOAD', () => {
  test('BALOAD: loads boolean from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('BALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('BALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('BALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runCALOAD', () => {
  test('CALOAD: loads char from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('CALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('CALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('CALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runSALOAD', () => {
  test('SALOAD: loads short from array', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('SALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('SALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('SALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayPrimitiveType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});
