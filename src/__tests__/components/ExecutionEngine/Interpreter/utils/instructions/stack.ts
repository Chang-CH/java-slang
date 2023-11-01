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

let thread: Thread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;
let javaThread: JvmObject;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');

  threadClass = (
    bscl.getClassRef('java/lang/Thread') as SuccessResult<ClassRef>
  ).getResult();
  thread = new Thread(threadClass);
  const method = threadClass.getMethod('<init>()V') as MethodRef;
  code = (method._getCode() as CodeAttribute).code;
  thread.invokeSf(threadClass, method, 0, []);
});

describe('runPop', () => {
  test('POP: pop stack', () => {
    thread.pushStack(1);
    code.setUint8(0, OPCODE.POP);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runPop2', () => {
  test('POP2: pop stack 2 ints', () => {
    thread.pushStack(1);
    thread.pushStack(1);
    code.setUint8(0, OPCODE.POP2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('POP2: pop stack 1 double', () => {
    thread.pushStack64(1.0);
    code.setUint8(0, OPCODE.POP2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDup', () => {
  test('DUP: duplicates reference', () => {
    thread.pushStack(javaThread);
    code.setUint8(0, OPCODE.DUP);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0] === javaThread).toBe(true);
    expect(lastFrame.operandStack[1] === javaThread).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDupX1', () => {
  test('DUPX1: duplicates reference', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    thread.pushStack(v2);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP_X1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(3);
    expect(lastFrame.operandStack[0] === v1).toBe(true);
    expect(lastFrame.operandStack[1] === v2).toBe(true);
    expect(lastFrame.operandStack[2] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDupX2', () => {
  test('DUPX2: duplicates reference', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    const v3 = new JvmObject(threadClass);
    thread.pushStack(v3);
    thread.pushStack(v2);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP_X2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(thread.popStack() === v1).toBe(true);
    expect(thread.popStack() === v2).toBe(true);
    expect(thread.popStack() === v3).toBe(true);
    expect(thread.popStack() === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
  test('DUPX2: duplicates double', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack64(5.0);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP_X2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(thread.popStack() === v1).toBe(true);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack() === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDup2', () => {
  test('DUP2: duplicates 2 category 1', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    thread.pushStack(v2);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(lastFrame.operandStack[0] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.operandStack[2] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
  test('DUP2: duplicates category 2', () => {
    thread.pushStack64(5.0);
    code.setUint8(0, OPCODE.DUP2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(4);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack64()).toBe(5.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDup2X1', () => {
  test('DUP2X1: duplicates 3 category 1', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    const v3 = new JvmObject(threadClass);
    thread.pushStack(v3);
    thread.pushStack(v2);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP2_X1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(5);
    expect(lastFrame.operandStack[0] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.operandStack[2] === v3).toBe(true);
    expect(lastFrame.operandStack[3] === v2).toBe(true);
    expect(lastFrame.operandStack[4] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
  test('DUP2X1: duplicates category 2 category 1', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack64(5.0);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP2_X1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(5);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack()).toBe(v1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDup2X2', () => {
  test('DUP2X2: duplicates 4 category 1', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    const v3 = new JvmObject(threadClass);
    const v4 = new JvmObject(threadClass);
    thread.pushStack(v4);
    thread.pushStack(v3);
    thread.pushStack(v2);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP2_X2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(lastFrame.operandStack[0] === v2).toBe(true);
    expect(lastFrame.operandStack[1] === v1).toBe(true);
    expect(lastFrame.operandStack[2] === v4).toBe(true);
    expect(lastFrame.operandStack[3] === v3).toBe(true);
    expect(lastFrame.operandStack[4] === v2).toBe(true);
    expect(lastFrame.operandStack[5] === v1).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DUP2X2: duplicates category 1,1,2', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    thread.pushStack(v2);
    thread.pushStack(v1);
    thread.pushStack64(5.0);
    code.setUint8(0, OPCODE.DUP2_X2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(thread.popStack64()).toBe(5.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });

  test('DUP2X2: duplicates category 2,1,1', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    thread.pushStack64(5.0);
    thread.pushStack(v2);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.DUP2_X2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
  test('DUP2X2: duplicates category 2,2', () => {
    thread.pushStack64(5.0);
    thread.pushStack64(6.0);
    code.setUint8(0, OPCODE.DUP2_X2);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(6);
    expect(thread.popStack64()).toBe(6.0);
    expect(thread.popStack64()).toBe(5.0);
    expect(thread.popStack64()).toBe(6.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runSwap', () => {
  test('SWAP: swap stack operands', () => {
    const v1 = new JvmObject(threadClass);
    const v2 = new JvmObject(threadClass);
    thread.pushStack(v1);
    thread.pushStack(v2);
    code.setUint8(0, OPCODE.SWAP);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack()).toBe(v1);
    expect(thread.popStack()).toBe(v2);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});
