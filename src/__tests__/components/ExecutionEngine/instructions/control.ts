import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import Thread from '#jvm/components/Thread/Thread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '#types/reference/Object';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { SuccessResult } from '#types/result';
import JVM from '#jvm/index';

let thread: Thread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');

  threadClass = (
    bscl.getClassRef('java/lang/Thread') as SuccessResult<ClassRef>
  ).getResult();

  thread = new Thread(threadClass, new JVM(nativeSystem));
  const method = threadClass.getMethod('<init>()V') as MethodRef;
  code = (method._getCode() as CodeAttribute).code;
  thread.invokeSf(threadClass, method, 0, []);
});

describe('Goto', () => {
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

describe('Jsr', () => {
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

describe('Ret', () => {
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

describe('Ireturn', () => {
  test('IRETURN: returns int to previous stackframe', () => {
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Lreturn', () => {
  test('LRETURN: returns long to previous stackframe', () => {
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64() === 5n).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Freturn', () => {
  test('FRETURN: returns float to previous stackframe', () => {
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(0);
    code.setUint8(0, OPCODE.FRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });

  test('FRETURN: undergoes value set conversion', () => {
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(3.33);
    code.setUint8(0, OPCODE.FRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(Math.fround(3.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Dreturn', () => {
  test('DRETURN: returns double to previous stackframe', () => {
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    thread.pushStack64(5.5);
    code.setUint8(0, OPCODE.DRETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64()).toBe(5.5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Areturn', () => {
  test('ARETURN: returns reference to previous stackframe', () => {
    const obj = new JvmObject(threadClass);
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    thread.pushStack(obj);
    code.setUint8(0, OPCODE.ARETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(obj);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('return', () => {
  test('RETURN: returns to previous stackframe', () => {
    const obj = new JvmObject(threadClass);
    thread.invokeSf(threadClass, thread.getMethod(), 0, []);
    code.setUint8(0, OPCODE.RETURN);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnSF();
    expect(thread.peekStackFrame()).toBe(undefined);
  });

  // IllegalMonitorStateException
});
