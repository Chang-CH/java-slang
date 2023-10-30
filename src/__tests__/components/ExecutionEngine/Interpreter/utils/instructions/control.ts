import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import JvmThread from '#types/reference/Thread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '#types/reference/Object';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';

let thread: JvmThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');

  threadClass = bscl.getClassRef('java/lang/Thread').result as ClassRef;

  thread = new JvmThread(threadClass);
  const method = threadClass.getMethod('<init>()V') as MethodRef;
  code = (method._getCode() as CodeAttribute).code;
  thread.pushStackFrame(threadClass, method, 0, []);
});

describe('runGoto', () => {
  test('GOTO: goes to correct offset', () => {
    code.setUint8(0, OPCODE.GOTO);
    code.setInt16(1, 10);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });
});

describe('runJsr', () => {
  test('JSR: pushes next pc and jumps to offset', () => {
    code.setUint8(0, OPCODE.JSR);
    code.setInt16(1, 10);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(3);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });
});

describe('runRet', () => {
  test('RET: pushes next pc and jumps to offset', () => {
    code.setUint8(0, OPCODE.RET);
    code.setUint8(1, 0);
    thread.storeLocal(0, 3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(3);
  });
});

describe('runIreturn', () => {
  test('IRETURN: returns int to previous stackframe', () => {
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('runLreturn', () => {
  test('LRETURN: returns long to previous stackframe', () => {
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64() === 5n).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('runFreturn', () => {
  test('FRETURN: returns float to previous stackframe', () => {
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.FRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });

  test('FRETURN: undergoes value set conversion', () => {
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(3.33);
    code.setUint8(0, OPCODE.FRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(Math.fround(3.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('runDreturn', () => {
  test('DRETURN: returns double to previous stackframe', () => {
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    thread.pushStack64(5.5);
    code.setUint8(0, OPCODE.DRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64()).toBe(5.5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('runAreturn', () => {
  test('ARETURN: returns reference to previous stackframe', () => {
    const obj = new JvmObject(threadClass);
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(obj);
    code.setUint8(0, OPCODE.ARETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(obj);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('runreturn', () => {
  test('RETURN: returns to previous stackframe', () => {
    const obj = new JvmObject(threadClass);
    thread.pushStackFrame(threadClass, thread.getMethod(), 0, []);
    code.setUint8(0, OPCODE.RETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.popStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });

  // IllegalMonitorStateException
});
