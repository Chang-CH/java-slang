import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { JNI } from '#jvm/components/JNI';
import { ClassData } from '#types/class/ClassData';
import { JvmObject } from '#types/reference/Object';
import { JavaStackFrame } from '#jvm/components/stackframe';
import { setupTest } from '#jvm/__tests__/__utils__/test-utility';
import Thread from '#jvm/components/thread';

let thread: Thread;
let threadClass: ClassData;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  const setup = setupTest();
  thread = setup.thread;
  threadClass = setup.classes.threadClass;
  code = setup.code;
  jni = setup.jni;
  const testClass = setup.classes.testClass;
  const method = setup.method;
  thread.invokeStackFrame(new JavaStackFrame(testClass, method, 0, []));
});

describe('Goto', () => {
  test('GOTO: goes to correct offset', () => {
    code.setUint8(0, OPCODE.GOTO);
    code.setInt16(1, 10);
    thread.runFor(1);
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

    thread.runFor(1);
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

    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(3);
  });
});

describe('Ireturn', () => {
  test('IRETURN: returns int to previous stackframe', () => {
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IRETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Lreturn', () => {
  test('LRETURN: returns long to previous stackframe', () => {
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LRETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64() === 5n).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Freturn', () => {
  test('FRETURN: returns float to previous stackframe', () => {
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    thread.pushStack(0);
    code.setUint8(0, OPCODE.FRETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });

  test('FRETURN: undergoes value set conversion', () => {
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    thread.pushStack(3.33);
    code.setUint8(0, OPCODE.FRETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(Math.fround(3.33));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Dreturn', () => {
  test('DRETURN: returns double to previous stackframe', () => {
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    thread.pushStack64(5.5);
    code.setUint8(0, OPCODE.DRETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64()).toBe(5.5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('Areturn', () => {
  test('ARETURN: returns reference to previous stackframe', () => {
    const obj = new JvmObject(threadClass);
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    thread.pushStack(obj);
    code.setUint8(0, OPCODE.ARETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(obj);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });
  // IllegalMonitorStateException
});

describe('return', () => {
  test('RETURN: returns to previous stackframe', () => {
    const obj = new JvmObject(threadClass);
    thread.invokeStackFrame(
      new JavaStackFrame(threadClass, thread.getMethod(), 0, [])
    );
    code.setUint8(0, OPCODE.RETURN);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(0);

    thread.returnStackFrame();
    expect(thread.peekStackFrame()).toBe(undefined);
  });

  // IllegalMonitorStateException
});
