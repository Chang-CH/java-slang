import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef, ConstantClass } from '#types/ConstantRef';
import { JavaReference } from '#types/dataTypes';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import {
  ConstantClassInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';

let thread: NativeThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl._resolveClass('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);
  const method = threadClass.getMethod(thread, '<init>()V');
  code = (method.code as CodeAttribute).code;
  thread.pushStackFrame(threadClass, method, 0, []);
});

describe('runIfnull', () => {
  test('IFNULL: null branches', () => {
    code.setUint8(0, OPCODE.IFNULL);
    code.setInt16(1, 10);
    thread.pushStack(null);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFNULL: non null does not branch', () => {
    code.setUint8(0, OPCODE.IFNULL);
    code.setInt16(1, 10);
    thread.pushStack(new JavaReference(threadClass, {}));
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('runIfnonnull', () => {
  test('IFNONNULL: null does not branch', () => {
    code.setUint8(0, OPCODE.IFNONNULL);
    code.setInt16(1, 10);
    thread.pushStack(null);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFNONNULL: non null branches', () => {
    code.setUint8(0, OPCODE.IFNONNULL);
    code.setInt16(1, 10);
    thread.pushStack(new JavaReference(threadClass, {}));
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });
});

describe('runGotoW', () => {
  test('GOTO_W: goes to correct offset', () => {
    code.setUint8(0, OPCODE.GOTO_W);
    code.setInt32(1, 65535);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(65535);
  });
});

describe('runJsrW', () => {
  test('JSR_W: pushes next pc and jumps to offset', () => {
    code.setUint8(0, OPCODE.JSR_W);
    code.setInt32(1, 65535);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(65535);
  });
});

describe('runWide', () => {
  test('ILOAD: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.ILOAD);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(3);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('LLOAD: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.LLOAD);
    code.setUint16(2, 0);
    thread.storeLocal64(0, 3n);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64() === 3n).toBe(true);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('FLOAD: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.FLOAD);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(3);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('DLOAD: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.DLOAD);
    code.setUint16(2, 0);
    thread.storeLocal64(0, 3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(thread.popStack64()).toBe(3);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('ALOAD: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.ALOAD);
    code.setUint16(2, 0);
    thread.storeLocal(0, null);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack()).toBe(null);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('ISTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.ISTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(5);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('LSTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.LSTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack64(5n);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0) == 5n).toBe(true);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('FSTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.FSTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(5);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('DSTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.DSTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack64(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal64(0)).toBe(5);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('ASTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.ASTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack(null);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(null);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });

  test('IINC: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.IINC);
    code.setUint16(2, 0);
    code.setUint16(4, 5);
    thread.storeLocal(0, 5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(10);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(6);
  });
});

describe('runMultianewarray', () => {
  test('MULTIANEWARRAY: Creates multi dimensional array', () => {
    code.setUint8(0, OPCODE.MULTIANEWARRAY);
    code.setUint16(1, 0);
    code.setUint8(3, 2);

    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
    } as ConstantClassInfo;
    const utf = {
      tag: CONSTANT_TAG.Utf8,
      length: 20,
      value: '[[Ljava/lang/Thread;',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = classRef;
    (threadClass as any).constantPool[1] = utf;

    thread.pushStack(2);
    thread.pushStack(3);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.pc).toBe(4);
    expect(thread.getPC()).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    const arrayRef = thread.popStack();
    expect(arrayRef.len()).toBe(2);
    expect(arrayRef.type).toBe('[Ljava/lang/Thread;');
    expect(arrayRef.get(0).len()).toBe(3);
    expect(arrayRef.get(0).type).toBe('Ljava/lang/Thread;');
    expect(arrayRef.get(0).get(2)).toBe(null);
    expect(arrayRef.get(1).len()).toBe(3);
    expect(arrayRef.get(1).type).toBe('Ljava/lang/Thread;');
    expect(arrayRef.get(1).get(2)).toBe(null);
  });

  test('MULTIANEWARRAY: Negative dimensions throw exception', () => {
    code.setUint8(0, OPCODE.MULTIANEWARRAY);
    code.setUint16(1, 0);
    code.setUint8(3, 2);

    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
    } as ConstantClassInfo;
    const utf = {
      tag: CONSTANT_TAG.Utf8,
      length: 20,
      value: '[[Ljava/lang/Thread;',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = classRef;
    (threadClass as any).constantPool[1] = utf;

    thread.pushStack(-1);
    thread.pushStack(3);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class).toBe(threadClass);
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NegativeArraySizeException'
    );
  });

  test('MULTIANEWARRAY: 0 sized array empty', () => {
    code.setUint8(0, OPCODE.MULTIANEWARRAY);
    code.setUint16(1, 0);
    code.setUint8(3, 2);

    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
    } as ConstantClassInfo;
    const utf = {
      tag: CONSTANT_TAG.Utf8,
      length: 20,
      value: '[[Ljava/lang/Thread;',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = classRef;
    (threadClass as any).constantPool[1] = utf;

    thread.pushStack(0);
    thread.pushStack(3);

    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.pc).toBe(4);
    expect(thread.getPC()).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    const arrayRef = thread.popStack();
    expect(arrayRef.len()).toBe(0);
    expect(arrayRef.type).toBe('[Ljava/lang/Thread;');
  });
});