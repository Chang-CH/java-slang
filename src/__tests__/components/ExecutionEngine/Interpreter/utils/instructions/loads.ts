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

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new JsSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl.load('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
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
    expect(lastFrame.pc).toBe(2);
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
    expect(lastFrame.pc).toBe(2);
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
    expect(lastFrame.pc).toBe(2);
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
    expect(lastFrame.pc).toBe(2);
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
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runILOAD0', () => {
  test('ILOAD0: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runILOAD1', () => {
  test('ILOAD1: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(11);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runILOAD2', () => {
  test('ILOAD2: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(12);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runILOAD3', () => {
  test('ILOAD3: loads int from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10;
    thread.peekStackFrame().locals[1] = 11;
    thread.peekStackFrame().locals[2] = 12;
    thread.peekStackFrame().locals[3] = 13;
    code.setUint8(0, OPCODE.ILOAD3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(13);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLLOAD0', () => {
  test('LLOAD0: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLLOAD1', () => {
  test('LLOAD1: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(11n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLLOAD2', () => {
  test('LLOAD2: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(12n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLLOAD3', () => {
  test('LLOAD3: loads long from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10n;
    thread.peekStackFrame().locals[1] = 11n;
    thread.peekStackFrame().locals[2] = 12n;
    thread.peekStackFrame().locals[3] = 13n;
    code.setUint8(0, OPCODE.LLOAD3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(13n);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFLOAD0', () => {
  test('FLOAD0: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFLOAD1', () => {
  test('FLOAD1: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(11.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFLOAD2', () => {
  test('FLOAD2: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(12.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFLOAD3', () => {
  test('FLOAD3: loads float from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.FLOAD3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(13.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDLOAD0', () => {
  test('DLOAD0: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDLOAD1', () => {
  test('DLOAD1: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(11.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDLOAD2', () => {
  test('DLOAD2: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(12.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDLOAD3', () => {
  test('DLOAD3: loads double from local variable array', () => {
    thread.peekStackFrame().locals[0] = 10.0;
    thread.peekStackFrame().locals[1] = 11.0;
    thread.peekStackFrame().locals[2] = 12.0;
    thread.peekStackFrame().locals[3] = 13.0;
    code.setUint8(0, OPCODE.DLOAD3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(13.0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runALOAD0', () => {
  test('ALOAD0: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l0);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runALOAD1', () => {
  test('ALOAD1: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l1);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runALOAD2', () => {
  test('ALOAD2: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l2);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runALOAD3', () => {
  test('ALOAD3: loads reference from local variable array', () => {
    const l0 = new JavaReference(threadClass, {});
    const l1 = new JavaReference(threadClass, {});
    const l2 = new JavaReference(threadClass, {});
    const l3 = new JavaReference(threadClass, {});
    thread.peekStackFrame().locals[0] = l0;
    thread.peekStackFrame().locals[1] = l1;
    thread.peekStackFrame().locals[2] = l2;
    thread.peekStackFrame().locals[3] = l3;
    code.setUint8(0, OPCODE.ALOAD3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(l3);
    expect(lastFrame.locals.length).toBe(4);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIALOAD', () => {
  test('IALOAD: loads int from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.int, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('IALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.int, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('IALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.int, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runLALOAD', () => {
  test('LALOAD: loads long from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.long, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('LALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.long, [99n]);
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
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('LALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.long, [99n]);
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
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runFALOAD', () => {
  test('FALOAD: loads float from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('FALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
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
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('FALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
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
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runDALOAD', () => {
  test('DALOAD: loads float from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('DALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
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
    expect(lastFrame.pc).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('DALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.float, [99.0]);
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
    expect(lastFrame.pc).toBe(0);
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
    expect(lastFrame.pc).toBe(1);
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
    expect(lastFrame.pc).toBe(1);
  });

  test('AALOAD: null array throws NullPointerException', () => {
    const arrayRef = null;
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

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
    expect(lastFrame.pc).toBe(0);

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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runBALOAD', () => {
  test('BALOAD: loads boolean from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.boolean, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('BALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.boolean, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('BALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.boolean, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runCALOAD', () => {
  test('CALOAD: loads char from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.char, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('CALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.char, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('CALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.char, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('runSALOAD', () => {
  test('SALOAD: loads short from array', () => {
    const arrayRef = new JavaArray(1, ArrayType.short, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
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
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('SALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.short, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('SALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrayRef = new JavaArray(1, ArrayType.short, [99]);
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
    expect(lastFrame.pc).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});
