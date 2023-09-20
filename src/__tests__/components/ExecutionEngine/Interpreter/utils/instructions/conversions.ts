import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/dataTypes';
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
  thread = new NativeThread(threadClass, javaThread);
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method: threadClass.getMethod(thread, '<init>()V'),
    pc: 0,
  });
});

describe('runI2l', () => {
  test('I2L: int converts to bigInt', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.I2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runI2f', () => {
  test('I2F: int converts to float', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.I2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runI2f', () => {
  test('I2D: int converts to double', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.I2D,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runI2b', () => {
  test('I2B: int converts to byte', () => {
    thread.pushStack(127);
    runInstruction(thread, {
      opcode: OPCODE.I2B,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(127);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('I2B: int convert to byte sign lost', () => {
    thread.pushStack(255);
    runInstruction(thread, {
      opcode: OPCODE.I2B,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runI2c', () => {
  test('I2C: int converts to char', () => {
    thread.pushStack(0xffff);
    runInstruction(thread, {
      opcode: OPCODE.I2C,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(String.fromCharCode(0xffff));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('I2C: int convert to char truncates 4 LSB', () => {
    thread.pushStack(65536);
    runInstruction(thread, {
      opcode: OPCODE.I2C,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(String.fromCharCode(0));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runI2s', () => {
  test('I2S: max short int converts to short', () => {
    thread.pushStack(32767);
    runInstruction(thread, {
      opcode: OPCODE.I2S,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(32767);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('I2S: min short int converts to short', () => {
    thread.pushStack(-32768);
    runInstruction(thread, {
      opcode: OPCODE.I2S,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-32768);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('I2S: int convert to short overflows', () => {
    thread.pushStack(0x12345678);
    runInstruction(thread, {
      opcode: OPCODE.I2S,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0x5678);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runL2i', () => {
  test('L2I: max int long converts to int', () => {
    thread.pushStack64(2147483647n);
    runInstruction(thread, {
      opcode: OPCODE.L2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2147483647);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('L2I: min int long converts to int', () => {
    thread.pushStack64(-2147483648n);
    runInstruction(thread, {
      opcode: OPCODE.L2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2147483648);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('L2I: long convert to int overflows', () => {
    thread.pushStack64(2147483648n);
    runInstruction(thread, {
      opcode: OPCODE.L2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2147483648);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runL2f', () => {
  test('L2F: long converts to float', () => {
    thread.pushStack64(10n);
    runInstruction(thread, {
      opcode: OPCODE.L2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('L2F: long convert to float lose precision', () => {
    thread.pushStack64(9223372036854775807n);
    runInstruction(thread, {
      opcode: OPCODE.L2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(9223372036854775806);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runL2d', () => {
  test('L2D: long converts to double', () => {
    thread.pushStack64(10n);
    runInstruction(thread, {
      opcode: OPCODE.L2D,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(10);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('L2D: long convert to double lose precision', () => {
    thread.pushStack64(9223372036854775807n);
    runInstruction(thread, {
      opcode: OPCODE.L2D,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(9223372036854775806);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runF2i', () => {
  test('F2I: float converts to int', () => {
    thread.pushStack(-20.5);
    runInstruction(thread, {
      opcode: OPCODE.F2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-20);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2I: float large number convert to int max', () => {
    thread.pushStack(9223372036854775806);
    runInstruction(thread, {
      opcode: OPCODE.F2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2147483647);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2I: float small number convert to int min', () => {
    thread.pushStack(-9223372036854775806);
    runInstruction(thread, {
      opcode: OPCODE.F2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2147483648);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2I: float NaN convert to int 0', () => {
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.F2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2I: float infinity convert to int max', () => {
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.F2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2147483647);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2I: float -infinity convert to int min', () => {
    thread.pushStack(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.F2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2147483648);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runF2l', () => {
  test('F2L: float converts to long', () => {
    thread.pushStack(-20.5);
    runInstruction(thread, {
      opcode: OPCODE.F2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-20n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2L: float large number convert to long max', () => {
    thread.pushStack(9223372036854776000);
    runInstruction(thread, {
      opcode: OPCODE.F2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(9223372036854775807n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2L: float small number convert to long min', () => {
    thread.pushStack(-9223372036854776000);
    runInstruction(thread, {
      opcode: OPCODE.F2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-9223372036854775808n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2L: float NaN convert to long 0', () => {
    thread.pushStack(NaN);
    runInstruction(thread, {
      opcode: OPCODE.F2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2L: float infinity convert to long max', () => {
    thread.pushStack(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.F2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(9223372036854775807n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('F2L: float -infinity convert to long min', () => {
    thread.pushStack(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.F2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-9223372036854775808n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runF2d', () => {
  test('F2D: float converts to double', () => {
    thread.pushStack(1.0);
    runInstruction(thread, {
      opcode: OPCODE.F2D,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runD2i', () => {
  test('D2I: double converts to int', () => {
    thread.pushStack64(-20.5);
    runInstruction(thread, {
      opcode: OPCODE.D2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-20);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2I: double large number convert to int max', () => {
    thread.pushStack64(9223372036854775806);
    runInstruction(thread, {
      opcode: OPCODE.D2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2147483647);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2I: double small number convert to int min', () => {
    thread.pushStack64(-9223372036854775806);
    runInstruction(thread, {
      opcode: OPCODE.D2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2147483648);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2I: double NaN convert to int 0', () => {
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.D2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2I: double infinity convert to int max', () => {
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.D2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2147483647);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2I: double -infinity convert to int min', () => {
    thread.pushStack64(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.D2I,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-2147483648);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runD2l', () => {
  test('D2L: double converts to long', () => {
    thread.pushStack64(-20.5);
    runInstruction(thread, {
      opcode: OPCODE.D2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-20n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2L: double large number convert to long max', () => {
    thread.pushStack64(9223372036854776000);
    runInstruction(thread, {
      opcode: OPCODE.D2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(9223372036854775807n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2L: double small number convert to long min', () => {
    thread.pushStack64(-9223372036854776000);
    runInstruction(thread, {
      opcode: OPCODE.D2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-9223372036854775808n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2L: double NaN convert to long 0', () => {
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.D2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2L: double infinity convert to long max', () => {
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.D2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(9223372036854775807n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2L: double -infinity convert to long min', () => {
    thread.pushStack64(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.D2L,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-9223372036854775808n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runD2f', () => {
  test('D2F: float max double converts to float', () => {
    thread.pushStack64(3.4028235e38);
    runInstruction(thread, {
      opcode: OPCODE.D2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(3.4028235e38));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2F: double convert to float capped at infinity', () => {
    thread.pushStack64(3.5e38);
    runInstruction(thread, {
      opcode: OPCODE.D2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2F: double convert to float capped at -infinity', () => {
    thread.pushStack64(-3.5e38);
    runInstruction(thread, {
      opcode: OPCODE.D2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2F: double nan convert to float nan', () => {
    thread.pushStack64(NaN);
    runInstruction(thread, {
      opcode: OPCODE.D2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(NaN);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2F: double Infinity convert to float Infinity', () => {
    thread.pushStack64(Infinity);
    runInstruction(thread, {
      opcode: OPCODE.D2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('D2F: double -Infinity convert to float -Infinity', () => {
    thread.pushStack64(-Infinity);
    runInstruction(thread, {
      opcode: OPCODE.D2F,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-Infinity);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});
