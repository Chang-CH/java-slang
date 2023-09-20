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
let javaThread: JavaReference;

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

describe('runPop', () => {
  test('POP: pop stack', () => {
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.POP,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runPop2', () => {
  test('POP2: pop stack 2 ints', () => {
    thread.pushStack(1);
    thread.pushStack(1);
    runInstruction(thread, {
      opcode: OPCODE.POP2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('POP2: pop stack 1 double', () => {
    thread.pushStack64(1.0);
    runInstruction(thread, {
      opcode: OPCODE.POP2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDup', () => {
  test('DUP: duplicates reference', () => {
    thread.pushStack(javaThread);
    runInstruction(thread, {
      opcode: OPCODE.DUP,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0] === javaThread).toBe(true);
    expect(lastFrame.operandStack[1] === javaThread).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDupX1', () => {
  test('DUPX1: duplicates reference', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    thread.pushStack(v2);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUPX1,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(3);
    expect(lastFrame.operandStack[0] === v1).toBe(true);
    expect(lastFrame.operandStack[1] === v2).toBe(true);
    expect(lastFrame.operandStack[2] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDupX2', () => {
  test('DUPX2: duplicates reference', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    const v3 = new JavaReference(threadClass, {});
    thread.pushStack(v3);
    thread.pushStack(v2);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUPX2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(thread.popStack() === v1).toBe(true);
    expect(thread.popStack() === v2).toBe(true);
    expect(thread.popStack() === v3).toBe(true);
    expect(thread.popStack() === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
  test('DUPX2: duplicates double', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack64(5.0);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUPX2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(thread.popStack() === v1).toBe(true);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack() === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDup2', () => {
  test('DUP2: duplicates 2 category 1', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    thread.pushStack(v2);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUP2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(lastFrame.operandStack[0] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.operandStack[2] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
  test('DUP2: duplicates category 2', () => {
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DUP2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack64()).toBe(5.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDup2X1', () => {
  test('DUP2X1: duplicates 3 category 1', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    const v3 = new JavaReference(threadClass, {});
    thread.pushStack(v3);
    thread.pushStack(v2);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUP2X1,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(5);
    expect(lastFrame.operandStack[0] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.operandStack[2] === v3).toBe(true);
    expect(lastFrame.operandStack[3] === v2).toBe(true);
    expect(lastFrame.operandStack[4] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
  test('DUP2X1: duplicates category 2 category 1', () => {
    const v1 = new JavaReference(threadClass, {});
    thread.pushStack64(5.0);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUP2X1,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(5);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack()).toBe(v1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDup2X2', () => {
  test('DUP2X2: duplicates 4 category 1', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    const v3 = new JavaReference(threadClass, {});
    const v4 = new JavaReference(threadClass, {});
    thread.pushStack(v4);
    thread.pushStack(v3);
    thread.pushStack(v2);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUP2X2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(lastFrame.operandStack[0] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.operandStack[2] === v4).toBe(true);
    expect(lastFrame.operandStack[3] === v3).toBe(true);
    expect(lastFrame.operandStack[4] === v2).toBe(true);
    expect(lastFrame.operandStack[5] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DUP2X2: duplicates category 1,1,2', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    thread.pushStack(v2);
    thread.pushStack(v1);
    thread.pushStack64(5.0);
    runInstruction(thread, {
      opcode: OPCODE.DUP2X2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(thread.popStack64()).toBe(5.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });

  test('DUP2X2: duplicates category 2,1,1', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    thread.pushStack64(5.0);
    thread.pushStack(v2);
    thread.pushStack(v1);
    runInstruction(thread, {
      opcode: OPCODE.DUP2X2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
  test('DUP2X2: duplicates category 2,2', () => {
    thread.pushStack64(5.0);
    thread.pushStack64(6.0);
    runInstruction(thread, {
      opcode: OPCODE.DUP2X2,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(thread.popStack64()).toBe(6.0);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack64()).toBe(6.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runSwap', () => {
  test('SWAP: swap stack operands', () => {
    const v1 = new JavaReference(threadClass, {});
    const v2 = new JavaReference(threadClass, {});
    thread.pushStack(v1);
    thread.pushStack(v2);
    runInstruction(thread, {
      opcode: OPCODE.SWAP,
      operands: [],
    });

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});
