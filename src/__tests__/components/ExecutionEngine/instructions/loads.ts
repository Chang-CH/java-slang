import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import Thread from '#jvm/components/Thread/Thread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { SuccessResult } from '#types/result';
import JVM from '#jvm/index';

let thread: Thread;
let threadClass: ClassRef;
let bscl: BootstrapClassLoader;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  bscl = new BootstrapClassLoader(nativeSystem, 'natives');

  threadClass = (
    bscl.getClassRef('java/lang/Thread') as SuccessResult<ClassRef>
  ).getResult();

  thread = new Thread(threadClass, new JVM(nativeSystem));
  const method = threadClass.getMethod('<init>()V') as MethodRef;
  code = (method._getCode() as CodeAttribute).code;
  thread.invokeSf(threadClass, method, 0, []);
});

describe('ILOAD', () => {
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

describe('LLOAD', () => {
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

describe('FLOAD', () => {
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

describe('DLOAD', () => {
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

describe('ALOAD', () => {
  test('ALOAD: loads reference from local variable array', () => {
    const obj = new JvmObject(threadClass);
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

describe('ILOAD_0', () => {
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

describe('ILOAD_1', () => {
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

describe('ILOAD_2', () => {
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

describe('ILOAD_3', () => {
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

describe('LLOAD_0', () => {
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

describe('LLOAD_1', () => {
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

describe('LLOAD_2', () => {
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

describe('LLOAD_3', () => {
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

describe('FLOAD_0', () => {
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

describe('FLOAD_1', () => {
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

describe('FLOAD_2', () => {
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

describe('FLOAD_3', () => {
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

describe('DLOAD_0', () => {
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

describe('DLOAD_1', () => {
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

describe('DLOAD_2', () => {
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

describe('DLOAD_3', () => {
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

describe('ALOAD_0', () => {
  test('ALOAD_0: loads reference from local variable array', () => {
    const l0 = new JvmObject(threadClass);
    const l1 = new JvmObject(threadClass);
    const l2 = new JvmObject(threadClass);
    const l3 = new JvmObject(threadClass);
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

describe('ALOAD_1', () => {
  test('ALOAD_1: loads reference from local variable array', () => {
    const l0 = new JvmObject(threadClass);
    const l1 = new JvmObject(threadClass);
    const l2 = new JvmObject(threadClass);
    const l3 = new JvmObject(threadClass);
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

describe('ALOAD_2', () => {
  test('ALOAD_2: loads reference from local variable array', () => {
    const l0 = new JvmObject(threadClass);
    const l1 = new JvmObject(threadClass);
    const l2 = new JvmObject(threadClass);
    const l3 = new JvmObject(threadClass);
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

describe('ALOAD_3', () => {
  test('ALOAD_3: loads reference from local variable array', () => {
    const l0 = new JvmObject(threadClass);
    const l1 = new JvmObject(threadClass);
    const l2 = new JvmObject(threadClass);
    const l3 = new JvmObject(threadClass);
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

describe('IALOAD', () => {
  test('IALOAD: loads int from array', () => {
    const arrCls = (
      bscl.getClassRef('[I') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('IALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[I') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('IALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[I') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.IALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('LALOAD', () => {
  test('LALOAD: loads long from array', () => {
    const arrCls = (
      bscl.getClassRef('[J') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99n]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('LALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[J') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('LALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[J') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99n]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.LALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('FALOAD', () => {
  test('FALOAD: loads float from array', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99.0]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('FALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('FALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.FALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('DALOAD', () => {
  test('DALOAD: loads float from array', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99.0]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('DALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('DALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99.0]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.DALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('AALOAD', () => {
  test('AALOAD: loads ref from array', () => {
    const arrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [null]);
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
    const iarrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassRef>
    ).getResult();
    const iarrayRef = iarrCls.instantiate() as JvmArray;
    iarrayRef.initialize(thread, 1, [null]);
    const arrCls = (
      bscl.getClassRef('[[Ljava/lang/Thread;') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [iarrayRef]);
    thread.pushStack(arrayRef);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === iarrayRef).toBe(true);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('AALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('AALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.AALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('BALOAD', () => {
  test('BALOAD: loads boolean from array', () => {
    const arrCls = (
      bscl.getClassRef('[Z') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('BALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[Z') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('BALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[Z') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.BALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('CALOAD', () => {
  test('CALOAD: loads char from array', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('CALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('CALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.CALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('SALOAD', () => {
  test('SALOAD: loads short from array', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
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
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('SALOAD: high index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('SALOAD: low index OOB throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassRef>
    ).getResult();
    const arrayRef = arrCls.instantiate() as JvmArray;
    arrayRef.initialize(thread, 1, [99]);
    thread.pushStack(arrayRef);
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.SALOAD);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);

    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});
