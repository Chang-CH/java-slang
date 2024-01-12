import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { JNI } from '#jvm/components/jni';
import { ReferenceClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import { JvmObject } from '#types/reference/Object';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { JvmArray } from '#types/reference/Array';
import {
  TestClassLoader,
  setupTest,
} from '#jvm/__tests__/__utils__/test-utility';
import { METHOD_FLAGS } from '#jvm/external/ClassFile/types/methods';
import { JavaStackFrame } from '#jvm/components/stackframe';
import Thread from '#jvm/components/thread/thread';

let testLoader: TestClassLoader;
let thread: Thread;
let threadClass: ReferenceClassData;
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
  testLoader = setup.testLoader;
  thread.invokeStackFrame(new JavaStackFrame(testClass, method, 0, []));
});

describe('Ifnull', () => {
  test('IFNULL: null branches', () => {
    code.setUint8(0, OPCODE.IFNULL);
    code.setInt16(1, 10);
    thread.pushStack(null);
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });

  test('IFNULL: non null does not branch', () => {
    code.setUint8(0, OPCODE.IFNULL);
    code.setInt16(1, 10);
    thread.pushStack(new JvmObject(threadClass));
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('Ifnonnull', () => {
  test('IFNONNULL: null does not branch', () => {
    code.setUint8(0, OPCODE.IFNONNULL);
    code.setInt16(1, 10);
    thread.pushStack(null);
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('IFNONNULL: non null branches', () => {
    code.setUint8(0, OPCODE.IFNONNULL);
    code.setInt16(1, 10);
    thread.pushStack(new JvmObject(threadClass));
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(10);
  });
});

describe('GotoW', () => {
  test('GOTO_W: goes to correct offset', () => {
    code.setUint8(0, OPCODE.GOTO_W);
    code.setInt32(1, 65535);
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(65535);
  });
});

describe('JsrW', () => {
  test('JSR_W: pushes next pc and jumps to offset', () => {
    code.setUint8(0, OPCODE.JSR_W);
    code.setInt32(1, 65535);

    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(65535);
  });
});

describe('Wide', () => {
  test('ILOAD: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.ILOAD);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.runFor(1);
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
    thread.storeLocal(0, 3n);
    thread.runFor(1);
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
    thread.runFor(1);
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
    thread.storeLocal(0, 3);
    thread.runFor(1);
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
    thread.runFor(1);
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
    thread.runFor(1);
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
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0) == 5n).toBe(true);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('FSTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.FSTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack(5);
    thread.runFor(1);
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
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(5);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(4);
  });
  test('ASTORE: reads wide index', () => {
    code.setUint8(0, OPCODE.WIDE);
    code.setUint8(1, OPCODE.ASTORE);
    code.setUint16(2, 0);
    thread.storeLocal(0, 3);
    thread.pushStack(null);
    thread.runFor(1);
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
    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(10);
    expect(lastFrame.locals.length).toBe(1);
    expect(thread.getPC()).toBe(6);
  });
});

describe('Multianewarray', () => {
  test('MULTIANEWARRAY: Creates multi dimensional array', () => {
    thread.returnStackFrame();
    let constIdx = 0;
    const customClass = testLoader.createClass({
      className: 'custom',
      constants: [
        () => {
          return {
            tag: CONSTANT_TAG.Utf8,
            length: 20,
            value: '[[Ljava/lang/Thread;',
          };
        },
        cPool => {
          constIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.MULTIANEWARRAY);
    code.setUint16(1, constIdx);
    code.setUint8(3, 2);
    const method = customClass.getMethod('test0()V') as Method;
    thread.invokeStackFrame(new JavaStackFrame(customClass, method, 0, []));

    thread.pushStack(2);
    thread.pushStack(3);

    thread.runFor(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.pc).toBe(4);
    expect(thread.getPC()).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    const arrayRef = thread.popStack() as JvmArray;
    expect(arrayRef.len()).toBe(2);
    expect(arrayRef.getClass().getClassname()).toBe('[[Ljava/lang/Thread;');
    expect(arrayRef.get(0).len()).toBe(3);
    expect(arrayRef.get(0).getClass().getClassname()).toBe(
      '[Ljava/lang/Thread;'
    );
    expect(arrayRef.get(0).get(2)).toBe(null);
    expect(arrayRef.get(1).len()).toBe(3);
    expect(arrayRef.get(1).getClass().getClassname()).toBe(
      '[Ljava/lang/Thread;'
    );
    expect(arrayRef.get(1).get(2)).toBe(null);
  });

  test('MULTIANEWARRAY: Negative dimensions throw exception', () => {
    thread.returnStackFrame();
    let constIdx = 0;
    const customClass = testLoader.createClass({
      className: 'custom',
      constants: [
        () => {
          return {
            tag: CONSTANT_TAG.Utf8,
            length: 20,
            value: '[[Ljava/lang/Thread;',
          };
        },
        cPool => {
          constIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.MULTIANEWARRAY);
    code.setUint16(1, constIdx);
    code.setUint8(3, 2);
    const method = customClass.getMethod('test0()V') as Method;
    thread.invokeStackFrame(new JavaStackFrame(customClass, method, 0, []));

    thread.pushStack(-1);
    thread.pushStack(3);

    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.class === threadClass).toBe(true);
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NegativeArraySizeException'
    );
  });

  test('MULTIANEWARRAY: 0 sized array empty', () => {
    thread.returnStackFrame();
    let constIdx = 0;
    const customClass = testLoader.createClass({
      className: 'custom',
      constants: [
        () => {
          return {
            tag: CONSTANT_TAG.Utf8,
            length: 20,
            value: '[[Ljava/lang/Thread;',
          };
        },
        cPool => {
          constIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.MULTIANEWARRAY);
    code.setUint16(1, constIdx);
    code.setUint8(3, 2);
    const method = customClass.getMethod('test0()V') as Method;
    thread.invokeStackFrame(new JavaStackFrame(customClass, method, 0, []));
    thread.pushStack(0);
    thread.pushStack(3);
    thread.runFor(1);

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.pc).toBe(4);
    expect(thread.getPC()).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    const arrayRef = thread.popStack();
    expect(arrayRef.len()).toBe(0);
    expect(arrayRef.getClass().getClassname()).toBe('[[Ljava/lang/Thread;');
  });
});
