import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ConstantRef';
import { JavaReference } from '#types/dataTypes';
import JsSystem from '#utils/JsSystem';

let thread: NativeThread;
let threadClass: ClassRef;

beforeEach(() => {
  const jni = new JNI();
  const nativeSystem = new JsSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl.load('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method: threadClass.getMethod(thread, '<init>()V'),
    pc: 0,
  });
});

describe('runLcmp', () => {
  test('lcmp: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack64(100n);
    thread.pushStack64(99n);
    runInstruction(thread, {
      opcode: OPCODE.LCMP,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('lcmp: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack64(100n);
    thread.pushStack64(100n);
    runInstruction(thread, {
      opcode: OPCODE.LCMP,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('lcmp: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack64(99n);
    thread.pushStack64(100n);
    runInstruction(thread, {
      opcode: OPCODE.LCMP,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFcmpl', () => {
  test('FCMPL: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.2);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPL: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPL: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack(-0.0);
    thread.pushStack(+0.0);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPL: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack(1.2);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPL: value1 is NaN pushes -1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPL: value2 is NaN pushes -1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPL: both values are NaN pushes -1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFcmpg', () => {
  test('FCMPG: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.2);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPG: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPG: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack(-0.0);
    thread.pushStack(+0.0);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPG: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack(1.2);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPG: value1 is NaN pushes 1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPG: value2 is NaN pushes 1I onto stack', () => {
    thread.pushStack(1.5);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FCMPG: both values are NaN pushes 1I onto stack', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDcmpl', () => {
  test('DCMPL: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.2);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPL: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPL: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack64(-0.0);
    thread.pushStack64(+0.0);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPL: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.2);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPL: value1 is NaN pushes -1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPL: value2 is NaN pushes -1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPL: both values are NaN pushes -1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DCMPL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDcmpg', () => {
  test('DCMPG: value1 > value2 pushes 1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.2);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPG: value1 == value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPG: -0 == +0 pushes 0I onto stack', () => {
    thread.pushStack64(-0.0);
    thread.pushStack64(+0.0);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPG: value1 < value2 pushes 0I onto stack', () => {
    thread.pushStack64(1.2);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPG: value1 is NaN pushes 1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPG: value2 is NaN pushes 1I onto stack', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DCMPG: both values are NaN pushes 1I onto stack', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DCMPG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIfeq', () => {
  test('IFEQ: non zero no branch', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IFEQ,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('IFEQ: zero branches', () => {
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IFEQ,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFEQ: -0 branches', () => {
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.IFEQ,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });
});

describe('runIfne', () => {
  test('IFNE: non zero branches', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IFNE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFNE: zero no branch', () => {
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IFNE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('IFNE: -0 no branch', () => {
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.IFNE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});

describe('runIflt', () => {
  test('IFLT: less than zero branches', () => {
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IFLT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFLT: zero no branch', () => {
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IFLT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('IFLT: -0 no branch', () => {
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.IFLT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});

describe('runIfge', () => {
  test('IFGE: greater than zero branches', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IFGE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFGE: zero branches', () => {
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IFGE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFGE: -0 branches', () => {
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.IFGE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFGE: less than 0 no branch', () => {
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IFGE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});

describe('runIfgt', () => {
  test('IFGT: greater than zero branches', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IFGT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFGT: zero no branch', () => {
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IFGT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('IFGT: -0 no branch', () => {
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.IFGT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('IFGT: less than 0 no branch', () => {
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IFGT,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});

describe('runIfle', () => {
  test('IFLE: greater than zero no branch', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IFLE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('IFLE: zero branches', () => {
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IFLE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFLE: -0 branches', () => {
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.IFLE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });

  test('IFLE: less than 0 branches', () => {
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IFLE,
      operands: [10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(10);
  });
});
