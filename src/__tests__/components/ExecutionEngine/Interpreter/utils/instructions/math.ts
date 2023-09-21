import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/dataTypes';
import JsSystem from '#utils/JsSystem';

let thread: NativeThread;
let threadClass: ClassRef;

const MAX_LONG = 9223372036854775807n;
const MIN_LONG = -9223372036854775808n;
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

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
  thread = new NativeThread(threadClass, javaThread);
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method: threadClass.getMethod(thread, '<init>()V'),
    pc: 0,
  });
});

describe('runIadd', () => {
  test('IADD: int addition', () => {
    thread.pushStack(1);
    thread.pushStack(2);
    runInstruction(thread, {
      opcode: OPCODE.IADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(3);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IADD: int addition overflows', () => {
    thread.pushStack(MAX_INT);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MIN_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IADD: int addition underflows', () => {
    thread.pushStack(MIN_INT);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MAX_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLadd', () => {
  test('LADD: long addition', () => {
    thread.pushStack(1n);
    thread.pushStack(2n);
    runInstruction(thread, {
      opcode: OPCODE.LADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(3n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LADD: long addition overflows', () => {
    thread.pushStack(MAX_LONG);
    thread.pushStack(1n);
    runInstruction(thread, {
      opcode: OPCODE.LADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MIN_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LADD: long addition underflows', () => {
    thread.pushStack(MIN_LONG);
    thread.pushStack(-1n);
    runInstruction(thread, {
      opcode: OPCODE.LADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MAX_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFadd', () => {
  test('FADD: float addition', () => {
    thread.pushStack(1.5);
    thread.pushStack(2.5);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(4.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition overflow Infinity', () => {
    thread.pushStack(3.4e38);
    thread.pushStack(3.4e38);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition underflow Ininfity', () => {
    thread.pushStack(-3.4e38);
    thread.pushStack(-3.4e38);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition NaN returns NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition Infinity - Infinity = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition Infinity + any = Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(5.0);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition -Infinity + any = -Infinity', () => {
    thread.pushStack(-Infinity);
    thread.pushStack(5.0);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition Infinity + Infinity = Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition -Infinity + -Infinity = -Infinity', () => {
    thread.pushStack(-Infinity);
    thread.pushStack(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition -0 + 0 = +0', () => {
    thread.pushStack(-0);
    thread.pushStack(+0);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition 0 + 0 = +0', () => {
    thread.pushStack(+0);
    thread.pushStack(+0);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition -0 + -0 = -0', () => {
    thread.pushStack(-0);
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition 0 + any = any', () => {
    thread.pushStack(1.33);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.33);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FADD: float addition any + any = fround of any', () => {
    thread.pushStack(1.33);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.FADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(2.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDadd', () => {
  test('DADD: double addition', () => {
    thread.pushStack64(1.5);
    thread.pushStack64(2.5);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(4.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition overflow Infinity', () => {
    thread.pushStack64(1.7e308);
    thread.pushStack64(1.7e308);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition underflow Ininfity', () => {
    thread.pushStack64(-1.7e308);
    thread.pushStack64(-1.7e308);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition NaN returns NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition Infinity + -Infinity = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition Infinity + any = Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition -Infinity + any = -Infinity', () => {
    thread.pushStack64(-Infinity);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition Infinity + Infinity = Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition -Infinity + -Infinity = -Infinity', () => {
    thread.pushStack64(-Infinity);
    thread.pushStack64(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition -0 + 0 = +0', () => {
    thread.pushStack64(-0);
    thread.pushStack64(+0);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition 0 + 0 = +0', () => {
    thread.pushStack64(+0);
    thread.pushStack64(+0);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition -0 + -0 = -0', () => {
    thread.pushStack64(-0);
    thread.pushStack64(-0);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition 0 + any = any', () => {
    thread.pushStack64(1.33);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.33);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DADD: double addition any + any', () => {
    thread.pushStack64(1.33);
    thread.pushStack64(1);
    runInstruction(thread, {
      opcode: OPCODE.DADD,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(2.33);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIsub', () => {
  test('ISUB: int subtraction', () => {
    thread.pushStack(2);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.ISUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('ISUB: int subtraction overflows', () => {
    thread.pushStack(MAX_INT);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.ISUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MIN_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('ISUB: int subtraction underflows', () => {
    thread.pushStack(MIN_INT);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.ISUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MAX_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLsub', () => {
  test('LSUB: long subtraction', () => {
    thread.pushStack(2n);
    thread.pushStack(1n);
    runInstruction(thread, {
      opcode: OPCODE.LSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LSUB: long subtraction overflows', () => {
    thread.pushStack(MAX_LONG);
    thread.pushStack(-1n);
    runInstruction(thread, {
      opcode: OPCODE.LSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MIN_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LSUB: long subtraction underflows', () => {
    thread.pushStack(MIN_LONG);
    thread.pushStack(1n);
    runInstruction(thread, {
      opcode: OPCODE.LSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MAX_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFsub', () => {
  test('FSUB: float subtraction', () => {
    thread.pushStack(2.5);
    thread.pushStack(1.5);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction overflow Infinity', () => {
    thread.pushStack(3.4e38);
    thread.pushStack(-3.4e38);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction underflow Ininfity', () => {
    thread.pushStack(-3.4e38);
    thread.pushStack(3.4e38);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction NaN returns NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction Infinity - Infinity = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction Infinity - any = Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(5.0);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction -Infinity - any = -Infinity', () => {
    thread.pushStack(-Infinity);
    thread.pushStack(5.0);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction Infinity - Infinity = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction -Infinity - Infinity = -Infinity', () => {
    thread.pushStack(-Infinity);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction 0 - 0 = +0', () => {
    thread.pushStack(0);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction 0 - -0 = +0', () => {
    thread.pushStack(+0);
    thread.pushStack(-0);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction -0 - 0 = -0', () => {
    thread.pushStack(-0);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction 0 + any = any', () => {
    thread.pushStack(1.33);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.33);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FSUB: float subtraction any - any = fround of any', () => {
    thread.pushStack(1.33);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.FSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDsub', () => {
  test('DSUB: double subtraction', () => {
    thread.pushStack64(2.5);
    thread.pushStack64(1.5);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction overflow Infinity', () => {
    thread.pushStack64(1.8e308);
    thread.pushStack64(-1.8e308);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction underflow Ininfity', () => {
    thread.pushStack64(-1.8e308);
    thread.pushStack64(1.8e308);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction NaN returns NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction Infinity - Infinity = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction Infinity - any = Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction -Infinity - any = -Infinity', () => {
    thread.pushStack64(-Infinity);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction Infinity - Infinity = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction -Infinity - Infinity = -Infinity', () => {
    thread.pushStack64(-Infinity);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction 0 - 0 = +0', () => {
    thread.pushStack64(0);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction 0 - -0 = +0', () => {
    thread.pushStack64(+0);
    thread.pushStack64(-0);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction -0 - 0 = -0', () => {
    thread.pushStack64(-0);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction 0 + any = any', () => {
    thread.pushStack64(1.33);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.33);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DSUB: double subtraction any - any = any', () => {
    thread.pushStack64(1.33);
    thread.pushStack64(1);
    runInstruction(thread, {
      opcode: OPCODE.DSUB,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0.33 + 1 - 1); // force it into double
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runImul', () => {
  test('IMUL: int multiplication', () => {
    thread.pushStack(2);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IMUL: int multiplication overflows', () => {
    thread.pushStack(MAX_INT);
    thread.pushStack(2);
    runInstruction(thread, {
      opcode: OPCODE.IMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IMUL: int multiplication underflows', () => {
    thread.pushStack(MAX_INT);
    thread.pushStack(-2);
    runInstruction(thread, {
      opcode: OPCODE.IMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IMUL: int overflow precision', () => {
    thread.pushStack(1000000007);
    thread.pushStack(1000000007);
    runInstruction(thread, {
      opcode: OPCODE.IMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-371520463);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLmul', () => {
  test('LMUL: long multiplication', () => {
    thread.pushStack64(2n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(2n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LMUL: long multiplication overflows', () => {
    thread.pushStack64(MAX_LONG);
    thread.pushStack64(2n);
    runInstruction(thread, {
      opcode: OPCODE.LMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-2n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LMUL: long multiplication underflows', () => {
    thread.pushStack64(MAX_LONG);
    thread.pushStack64(-2n);
    runInstruction(thread, {
      opcode: OPCODE.LMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(2n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFmul', () => {
  test('FMUL: float multiplication', () => {
    thread.pushStack(2);
    thread.pushStack(0.5);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication overflow Infinity', () => {
    thread.pushStack(3.4e38);
    thread.pushStack(2.0);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication underflow -Infinity', () => {
    thread.pushStack(-3.4e38);
    thread.pushStack(2);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication NaN returns NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication Infinity * 0 = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication Infinity * +any = Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(5.0);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication Infinity * -any = -Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(-5.0);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication any * any = fround of any', () => {
    thread.pushStack(0.11);
    thread.pushStack(3);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FMUL: float multiplication smallest precision = 0', () => {
    thread.pushStack(-4e-32);
    thread.pushStack(-4e-32);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
  test('FMUL: float multiplication negative smallest precision = -0', () => {
    thread.pushStack(4e-32);
    thread.pushStack(-4e-32);
    runInstruction(thread, {
      opcode: OPCODE.FMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDmul', () => {
  test('DMUL: double multiplication', () => {
    thread.pushStack64(2);
    thread.pushStack64(0.5);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication overflow Infinity', () => {
    thread.pushStack64(1.7e308);
    thread.pushStack64(2.0);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication underflow -Infinity', () => {
    thread.pushStack64(-1.7e308);
    thread.pushStack64(2);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication NaN returns NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication Infinity * 0 = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication Infinity * +any = Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication Infinity * -any = -Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(-5.0);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication any * any = fround of any', () => {
    thread.pushStack64(1.1);
    thread.pushStack64(0.3);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0.33);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DMUL: double multiplication smallest precision = 0', () => {
    thread.pushStack64(-2e-307);
    thread.pushStack64(-2e-307);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
  test('DMUL: double multiplication negative smallest precision = -0', () => {
    thread.pushStack64(2e-307);
    thread.pushStack64(-2e-307);
    runInstruction(thread, {
      opcode: OPCODE.DMUL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIdiv', () => {
  test('IDIV: int division', () => {
    thread.pushStack(2);
    thread.pushStack(2);
    runInstruction(thread, {
      opcode: OPCODE.IDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IDIV: int min / -1 division overflow', () => {
    thread.pushStack(MIN_INT);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MIN_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IDIV: int division rounds to zero', () => {
    thread.pushStack(9);
    thread.pushStack(10);
    runInstruction(thread, {
      opcode: OPCODE.IDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IDIV: negative int division rounds to zero', () => {
    thread.pushStack(9);
    thread.pushStack(-10);
    runInstruction(thread, {
      opcode: OPCODE.IDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IDIV: divide by zero throws ArithmeticException', () => {
    thread.pushStack(9);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IDIV,
      operands: [],
    });

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
      'java/lang/ArithmeticException'
    );
  });
});

describe('runLdiv', () => {
  test('LDIV: long division', () => {
    thread.pushStack64(2n);
    thread.pushStack64(2n);
    runInstruction(thread, {
      opcode: OPCODE.LDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LDIV: long division rounds to 0', () => {
    thread.pushStack64(9n);
    thread.pushStack64(10n);
    runInstruction(thread, {
      opcode: OPCODE.LDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LDIV: negative long division rounds to 0', () => {
    thread.pushStack64(9n);
    thread.pushStack64(-10n);
    runInstruction(thread, {
      opcode: OPCODE.LDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LDIV: long min / -1 division overflows', () => {
    thread.pushStack64(MIN_LONG);
    thread.pushStack64(-1n);
    runInstruction(thread, {
      opcode: OPCODE.LDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MIN_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LDIV: divide by zero throws ArithmeticException', () => {
    thread.pushStack64(9n);
    thread.pushStack64(0n);
    runInstruction(thread, {
      opcode: OPCODE.LDIV,
      operands: [],
    });

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
      'java/lang/ArithmeticException'
    );
  });
});

describe('runFdiv', () => {
  test('FDIV: float division', () => {
    thread.pushStack(2);
    thread.pushStack(0.5);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(4.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division overflow Infinity', () => {
    thread.pushStack(3.4e38);
    thread.pushStack(0.5);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division underflow -Infinity', () => {
    thread.pushStack(-3.4e38);
    thread.pushStack(0.5);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division NaN returns NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division 0 / 0 = NaN', () => {
    thread.pushStack(0);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division any / 0 = Infinity', () => {
    thread.pushStack(5.0);
    thread.pushStack(0.0);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division -any / 0 = -Infinity', () => {
    thread.pushStack(-5.0);
    thread.pushStack(0.0);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division Infinity / Infinity = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division Infinity / +any = Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(5.0);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division Infinity / -any = -Infinity', () => {
    thread.pushStack(Infinity);
    thread.pushStack(-5.0);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division any / Infinity = +0', () => {
    thread.pushStack(5.0);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division any / -Infinity = -0', () => {
    thread.pushStack(5.0);
    thread.pushStack(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division any / any = fround of any', () => {
    thread.pushStack(0.99);
    thread.pushStack(3.0);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division smallest precision = +0', () => {
    thread.pushStack(-4e-32);
    thread.pushStack(-4e32);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FDIV: float division negative smallest precision = -0', () => {
    thread.pushStack(4e-32);
    thread.pushStack(-4e32);
    runInstruction(thread, {
      opcode: OPCODE.FDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDdiv', () => {
  test('DDIV: double division', () => {
    thread.pushStack64(2);
    thread.pushStack64(0.5);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(4.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division overflow Infinity', () => {
    thread.pushStack64(1.7e308);
    thread.pushStack64(0.5);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division underflow -Infinity', () => {
    thread.pushStack64(-1.7e308);
    thread.pushStack64(0.5);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division NaN returns NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division 0 / 0 = NaN', () => {
    thread.pushStack64(0);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: float division any / 0 = Infinity', () => {
    thread.pushStack64(5.0);
    thread.pushStack64(0.0);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: float division -any / 0 = -Infinity', () => {
    thread.pushStack64(-5.0);
    thread.pushStack64(0.0);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division Infinity / Infinity = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division Infinity / +any = Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division Infinity / -any = -Infinity', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(-5.0);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division any / Infinity = +0', () => {
    thread.pushStack64(5.0);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division any / -Infinity = -0', () => {
    thread.pushStack64(5.0);
    thread.pushStack64(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division smallest precision = +0', () => {
    thread.pushStack64(-4e-302);
    thread.pushStack64(-4e302);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], +0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DDIV: double division negative smallest precision = -0', () => {
    thread.pushStack64(4e-302);
    thread.pushStack64(-4e302);
    runInstruction(thread, {
      opcode: OPCODE.DDIV,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIrem', () => {
  test('IREM: int remainder', () => {
    thread.pushStack(3);
    thread.pushStack(2);
    runInstruction(thread, {
      opcode: OPCODE.IREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IREM: int min % -1 remainder returns 0', () => {
    thread.pushStack(MIN_INT);
    thread.pushStack(-1);
    runInstruction(thread, {
      opcode: OPCODE.IREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IREM: Any remainder zero throws ArithmeticException', () => {
    thread.pushStack(9);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.IREM,
      operands: [],
    });

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
      'java/lang/ArithmeticException'
    );
  });
});

describe('runLrem', () => {
  test('LREM: long remainder', () => {
    thread.pushStack64(3n);
    thread.pushStack64(2n);
    runInstruction(thread, {
      opcode: OPCODE.LREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LREM: long min % -1 returns 0', () => {
    thread.pushStack64(MIN_LONG);
    thread.pushStack64(-1n);
    runInstruction(thread, {
      opcode: OPCODE.LREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LREM: Remainder by zero throws ArithmeticException', () => {
    thread.pushStack64(9n);
    thread.pushStack64(0n);
    runInstruction(thread, {
      opcode: OPCODE.LREM,
      operands: [],
    });

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
      'java/lang/ArithmeticException'
    );
  });
});

describe('runFrem', () => {
  test('FREM: float remainder', () => {
    thread.pushStack(1.3);
    thread.pushStack(0.5);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder NaN returns NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder NaN returns NaN', () => {
    thread.pushStack(NaN);
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder 0 % 0 = NaN', () => {
    thread.pushStack(0);
    thread.pushStack(0);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder Infinity % any = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(2);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder -0 % Infinity = -0', () => {
    thread.pushStack(-0);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder Infinity % Infinity = NaN', () => {
    thread.pushStack(Infinity);
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FREM: float remainder any % any = fround of any', () => {
    thread.pushStack(0.99);
    thread.pushStack(0.66);
    runInstruction(thread, {
      opcode: OPCODE.FREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDrem', () => {
  test('DREM: double remainder', () => {
    thread.pushStack64(1.3);
    thread.pushStack64(0.5);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.3 - 1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder NaN returns NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder NaN returns NaN', () => {
    thread.pushStack64(NaN);
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder 0 % 0 = NaN', () => {
    thread.pushStack64(0);
    thread.pushStack64(0);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder Infinity % any = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(2);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder -0 % Infinity = -0', () => {
    thread.pushStack64(-0);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder Infinity % Infinity = NaN', () => {
    thread.pushStack64(Infinity);
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DREM: double remainder any % any = fround of any', () => {
    thread.pushStack64(0.99);
    thread.pushStack64(0.66);
    runInstruction(thread, {
      opcode: OPCODE.DREM,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0.99 - 0.66);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIneg', () => {
  test('INEG: int negation', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.INEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('INEG: int negation overflows', () => {
    thread.pushStack(MIN_INT);
    runInstruction(thread, {
      opcode: OPCODE.INEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MIN_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLneg', () => {
  test('LNEG: long negation', () => {
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LNEG: long negation overflows', () => {
    thread.pushStack64(MIN_LONG);
    runInstruction(thread, {
      opcode: OPCODE.LNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MIN_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFneg', () => {
  test('FNEG: float negation', () => {
    thread.pushStack(1.0);
    runInstruction(thread, {
      opcode: OPCODE.FNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FNEG: negates zero', () => {
    thread.pushStack(0.0);
    runInstruction(thread, {
      opcode: OPCODE.FNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FNEG: NaN negated is NaN', () => {
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.FNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('FNEG: float Infinity negated is -Infinity', () => {
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.FNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDneg', () => {
  test('DNEG: float negation', () => {
    thread.pushStack64(1.0);
    runInstruction(thread, {
      opcode: OPCODE.DNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DNEG: negates zero', () => {
    thread.pushStack64(0.0);
    runInstruction(thread, {
      opcode: OPCODE.DNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(Object.is(lastFrame.operandStack[0], -0)).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DNEG: NaN negated is NaN', () => {
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.DNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DNEG: float Infinity negated is -Infinity', () => {
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.DNEG,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIshl', () => {
  test('ISHL: shift left int', () => {
    thread.pushStack(2);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.ISHL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('ISHL: int shift left overflows', () => {
    thread.pushStack(1);
    thread.pushStack(0x1f);
    runInstruction(thread, {
      opcode: OPCODE.ISHL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MIN_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('ISHL: int shift left capped at 0x1f', () => {
    thread.pushStack(1);
    thread.pushStack(0x3f);
    runInstruction(thread, {
      opcode: OPCODE.ISHL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(MIN_INT);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLshl', () => {
  test('LSHL: shift left long', () => {
    thread.pushStack64(2n);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.LSHL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(4n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LSHL: int shift left overflows', () => {
    thread.pushStack64(1n);
    thread.pushStack(0x3f);
    runInstruction(thread, {
      opcode: OPCODE.LSHL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MIN_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LSHL: int shift left capped at 0x3f', () => {
    thread.pushStack64(1n);
    thread.pushStack(0x7f);
    runInstruction(thread, {
      opcode: OPCODE.LSHL,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(MIN_LONG);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIshr', () => {
  test('ISHR: shift right int', () => {
    thread.pushStack(2);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.ISHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('ISHR: int shift right truncated', () => {
    thread.pushStack(1);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.ISHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('ISHR: int shift right capped at 0x1f', () => {
    thread.pushStack(MIN_INT);
    thread.pushStack(0x3f);
    runInstruction(thread, {
      opcode: OPCODE.ISHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLshr', () => {
  test('LSHR: shift right long', () => {
    thread.pushStack64(2n);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.LSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LSHR: int shift right truncates', () => {
    thread.pushStack64(MIN_LONG);
    thread.pushStack(0x3f);
    runInstruction(thread, {
      opcode: OPCODE.LSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LSHR: int shift right capped at 0x3f', () => {
    thread.pushStack64(MIN_LONG);
    thread.pushStack(0x7f);
    runInstruction(thread, {
      opcode: OPCODE.LSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIushr', () => {
  test('IUSHR: shift right int', () => {
    thread.pushStack(2);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IUSHR: int shift right truncated', () => {
    thread.pushStack(1);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IUSHR: int shift right capped at 0x1f', () => {
    thread.pushStack(MIN_INT);
    thread.pushStack(0x3f);
    runInstruction(thread, {
      opcode: OPCODE.IUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLushr', () => {
  test('LUSHR: shift right long', () => {
    thread.pushStack64(2n);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.LUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LUSHR: int shift right changes sign', () => {
    thread.pushStack64(-2n);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.LUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0].toString()).toBe('9223372036854775807');
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LUSHR: int shift right truncates', () => {
    thread.pushStack64(MIN_LONG);
    thread.pushStack(0x3f);
    runInstruction(thread, {
      opcode: OPCODE.LUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0].toString()).toBe('1');
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LUSHR: int shift right capped at 0x3f', () => {
    thread.pushStack64(MIN_LONG);
    thread.pushStack(0x7f);
    runInstruction(thread, {
      opcode: OPCODE.LUSHR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0].toString()).toBe('1');
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIand', () => {
  test('IAND: int and', () => {
    thread.pushStack(3);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IAND,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IAND: int and negatives', () => {
    thread.pushStack(-1);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IAND,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLand', () => {
  test('LAND: long and', () => {
    thread.pushStack64(3n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LAND,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LAND: long and negatives', () => {
    thread.pushStack64(-1n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LAND,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIor', () => {
  test('IOR: int or', () => {
    thread.pushStack(2);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(3);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IOR: int or negatives', () => {
    thread.pushStack(-1);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLor', () => {
  test('LOR: long or', () => {
    thread.pushStack64(2n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(3n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LOR: long or negatives', () => {
    thread.pushStack64(-1n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIXor', () => {
  test('IXOR: int Xor', () => {
    thread.pushStack(3);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IXOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('IXOR: int Xor negatives', () => {
    thread.pushStack(-1);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.IXOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLxor', () => {
  test('LXOR: long xor', () => {
    thread.pushStack64(3n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LXOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(2n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('LXOR: long xor negatives', () => {
    thread.pushStack64(-1n);
    thread.pushStack64(1n);
    runInstruction(thread, {
      opcode: OPCODE.LXOR,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-2n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIinc', () => {
  test('IINC: int increments', () => {
    thread.peekStackFrame().locals = [20];
    runInstruction(thread, {
      opcode: OPCODE.IINC,
      operands: [0, 10],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(1);
    expect(lastFrame.locals[0]).toBe(30);
    expect(lastFrame.pc).toBe(3);
  });
});