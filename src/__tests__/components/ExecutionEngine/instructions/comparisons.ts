import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import { JNI } from '#jvm/components/JNI';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { ClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import Thread from '#jvm/components/Thread/Thread';
import { SuccessResult } from '#types/result';
import JVM from '#jvm/index';

let thread: Thread;
let threadClass: ClassData;
let code: DataView;
let jni: JNI;
beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');

  threadClass = (
    bscl.getClassRef('java/lang/Thread') as SuccessResult<ClassData>
  ).getResult() as ClassData;
  thread = new Thread(threadClass, new JVM(nativeSystem));
  const method = threadClass.getMethod('<init>()V') as Method;
  code = (method._getCode() as CodeAttribute).code;
  thread.invokeSf(threadClass, method, 0, []);
});

describe('Lcmp', () => {
  test('lcmp: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack64(100n);
    thread.pushStack64(99n);
    code.setUint8(0, OPCODE.LCMP);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('lcmp: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack64(100n);
    thread.pushStack64(100n);
    code.setUint8(0, OPCODE.LCMP);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('lcmp: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack64(99n);
    thread.pushStack64(100n);
    code.setUint8(0, OPCODE.LCMP);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Fcmpl', () => {
  test('FCMPL: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.2);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPL: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.5);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPL: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack(-0.0);
    thread.pushStack(+0.0);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPL: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack(1.2);
    thread.pushStack(1.5);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPL: value1 is NaN pushes -1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(1.5);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPL: value2 is NaN pushes -1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(NaN);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPL: both values are NaN pushes -1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    code.setUint8(0, OPCODE.FCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Fcmpg', () => {
  test('FCMPG: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.2);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPG: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.5);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPG: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack(-0.0);
    thread.pushStack(+0.0);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPG: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack(1.2);
    thread.pushStack(1.5);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPG: value1 is NaN pushes 1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(1.5);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPG: value2 is NaN pushes 1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(NaN);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('FCMPG: both values are NaN pushes 1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    code.setUint8(0, OPCODE.FCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Dcmpl', () => {
  test('DCMPL: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.2);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPL: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.5);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPL: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack64(-0.0);
    thread.pushStack64(+0.0);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPL: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.2);
    thread.pushStack64(1.5);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPL: value1 is NaN pushes -1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(1.5);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPL: value2 is NaN pushes -1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(NaN);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPL: both values are NaN pushes -1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    code.setUint8(0, OPCODE.DCMPL);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Dcmpg', () => {
  test('DCMPG: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.2);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPG: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.5);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPG: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack64(-0.0);
    thread.pushStack64(+0.0);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPG: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.2);
    thread.pushStack64(1.5);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPG: value1 is NaN pushes 1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(1.5);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPG: value2 is NaN pushes 1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(NaN);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DCMPG: both values are NaN pushes 1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    code.setUint8(0, OPCODE.DCMPG);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Ifeq', () => {
  test('IFEQ: non zero no branch', () => {
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IFEQ);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFEQ: zero branches', () => {
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IFEQ);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFEQ: -0 branches', () => {
    thread.pushStack(-0);
    code.setUint8(0, OPCODE.IFEQ);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });
});

describe('Ifne', () => {
  test('IFNE: non zero branches', () => {
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IFNE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFNE: zero no branch', () => {
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IFNE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFNE: -0 no branch', () => {
    thread.pushStack(-0);
    code.setUint8(0, OPCODE.IFNE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('Iflt', () => {
  test('IFLT: less than zero branches', () => {
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.IFLT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFLT: zero no branch', () => {
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IFLT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFLT: -0 no branch', () => {
    thread.pushStack(-0);
    code.setUint8(0, OPCODE.IFLT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('Ifge', () => {
  test('IFGE: greater than zero branches', () => {
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IFGE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFGE: zero branches', () => {
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IFGE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFGE: -0 branches', () => {
    thread.pushStack(-0);
    code.setUint8(0, OPCODE.IFGE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFGE: less than 0 no branch', () => {
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.IFGE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('Ifgt', () => {
  test('IFGT: greater than zero branches', () => {
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IFGT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFGT: zero no branch', () => {
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IFGT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFGT: -0 no branch', () => {
    thread.pushStack(-0);
    code.setUint8(0, OPCODE.IFGT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFGT: less than 0 no branch', () => {
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.IFGT);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('Ifle', () => {
  test('IFLE: greater than zero no branch', () => {
    thread.pushStack(1);
    code.setUint8(0, OPCODE.IFLE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFLE: zero branches', () => {
    thread.pushStack(0);
    code.setUint8(0, OPCODE.IFLE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFLE: -0 branches', () => {
    thread.pushStack(-0);
    code.setUint8(0, OPCODE.IFLE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFLE: less than 0 branches', () => {
    thread.pushStack(-1);
    code.setUint8(0, OPCODE.IFLE);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });
});
