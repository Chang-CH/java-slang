import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import JvmThread from '#types/reference/Thread';
import { JNI } from '#jvm/components/JNI';
import { ConstantClass, ConstantString } from '#types/ConstantRef';
import { JvmObject } from '#types/reference/Object';
import { initString } from '#jvm/components/JNI/utils';
import { ConstantUtf8Info } from '#jvm/external/ClassFile/types/constants';
import { ClassRef } from '#types/ClassRef';
import { METHOD_FLAGS } from '#jvm/external/ClassFile/types/methods';
import { TestSystem, TestClassLoader, createClass } from '#utils/test';
import AbstractSystem from '#utils/AbstractSystem';
import { FIELD_FLAGS } from '#jvm/external/ClassFile/types/fields';
import { MethodRef } from '#types/MethodRef';

let testSystem: AbstractSystem;
let testLoader: TestClassLoader;
let thread: JvmThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;
let strClass: ClassRef;
let testClass: ClassRef;

beforeEach(() => {
  jni = new JNI();
  testSystem = new TestSystem();
  testLoader = new TestClassLoader(testSystem, '', null);

  const dispatchUncaughtCode = new DataView(new ArrayBuffer(8));
  dispatchUncaughtCode.setUint8(0, OPCODE.RETURN);
  threadClass = createClass({
    className: 'java/lang/Thread',
    methods: [
      {
        accessFlags: [METHOD_FLAGS.ACC_PROTECTED],
        name: 'dispatchUncaughtException',
        descriptor: '(Ljava/lang/Throwable;)V',
        attributes: [],
        code: dispatchUncaughtCode,
      },
    ],
    loader: testLoader,
  });
  strClass = createClass({
    className: 'java/lang/String',
    loader: testLoader,
    fields: [
      {
        accessFlags: [FIELD_FLAGS.ACC_FINAL, FIELD_FLAGS.ACC_PRIVATE],
        name: 'value',
        descriptor: '[C',
        attributes: [],
      },
    ],
  });
  thread = new JvmThread(threadClass);

  const ab = new ArrayBuffer(50);
  code = new DataView(ab);
  let fieldIdx = 0;
  testClass = createClass({
    className: 'Test',
    constants: [
      () => ({
        tag: CONSTANT_TAG.Utf8,
        length: 11,
        value: 'staticField',
      }),
      () => ({
        tag: CONSTANT_TAG.Utf8,
        length: 1,
        value: 'I',
      }),
      () => ({
        tag: CONSTANT_TAG.Utf8,
        length: 4,
        value: 'Test',
      }),
      cPool => ({
        tag: CONSTANT_TAG.NameAndType,
        nameIndex: cPool.length - 3,
        descriptorIndex: cPool.length - 2,
      }),
      cPool => ({
        tag: CONSTANT_TAG.Class,
        nameIndex: cPool.length - 2,
      }),
      cPool => {
        fieldIdx = cPool.length;
        return {
          tag: CONSTANT_TAG.Fieldref,
          classIndex: cPool.length - 1,
          nameAndTypeIndex: cPool.length - 2,
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
  const method = testClass.getMethod('test0()V') as MethodRef;
  thread.pushStackFrame(testClass, method, 0, []);
});

describe('runNop', () => {
  test('does not modify stack', () => {
    code.setUint8(0, OPCODE.NOP);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runAconstNull', () => {
  test('pushes null to stack', () => {
    code.setUint8(0, OPCODE.ACONST_NULL);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(null);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconstM1', () => {
  test('pushes -1 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_M1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst0', () => {
  test('pushes 0 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst1', () => {
  test('pushes 1 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst2', () => {
  test('pushes 2 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_2);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst3', () => {
  test('pushes 3 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_3);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(3);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst4', () => {
  test('pushes 4 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_4);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst5', () => {
  test('pushes 5 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_5);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLconst0', () => {
  test('pushes long 0 to stack', () => {
    code.setUint8(0, OPCODE.LCONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLconst1', () => {
  test('pushes long 1 to stack', () => {
    code.setUint8(0, OPCODE.LCONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFconst0', () => {
  test('pushes float 0 to stack', () => {
    code.setUint8(0, OPCODE.FCONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFconst1', () => {
  test('pushes float 1 to stack', () => {
    code.setUint8(0, OPCODE.FCONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(1.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFconst2', () => {
  test('pushes float 2 to stack', () => {
    code.setUint8(0, OPCODE.FCONST_2);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(2.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDconst0', () => {
  test('pushes double 0 to stack', () => {
    code.setUint8(0, OPCODE.DCONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDconst1', () => {
  test('pushes double 1 to stack', () => {
    code.setUint8(0, OPCODE.DCONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runBipush', () => {
  test('pushes byte to stack', () => {
    code.setUint8(0, OPCODE.BIPUSH);
    code.setInt8(1, 128);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-128);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runSipush', () => {
  test('pushes short to stack', () => {
    code.setUint8(0, OPCODE.SIPUSH);
    code.setInt16(1, 32768);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-32768);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

// FIXME: classref should push class object not classref onto stack
// Test MethodHandle
// Test MethodType
describe('runLdc', () => {
  test('reads int from constant pool and pushes to stack', () => {
    // use custom class
    thread.popStackFrame();
    const intConstant = {
      tag: CONSTANT_TAG.Integer,
      value: -99,
    };
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return intConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads float from constant pool and pushes to stack', () => {
    thread.popStackFrame();
    const floatConstant = {
      tag: CONSTANT_TAG.Float,
      value: Math.fround(-0.3),
    };
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return floatConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(-0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads string from constant pool and pushes to stack', () => {
    thread.popStackFrame();
    const strRef = initString(testLoader, 'hello world').result as JvmObject;
    const strConstant = {
      tag: CONSTANT_TAG.String,
      ref: strRef,
      stringIndex: 0,
    } as ConstantString;
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return strConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === strRef).toBe(true); // string literals should be same object
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('initializes uninitialized string from constant pool', () => {
    thread.popStackFrame();
    const strContent = {
      tag: CONSTANT_TAG.Utf8,
      value: 'hello world',
    } as ConstantUtf8Info;
    let constIdx = 0;
    let strConstant;
    const customClass = createClass({
      className: 'custom',
      constants: [
        () => strContent,
        cPool => {
          constIdx = cPool.length;
          strConstant = {
            tag: CONSTANT_TAG.String,
            stringIndex: cPool.length - 1,
          };
          return strConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(
      lastFrame.operandStack[0] ===
        (strConstant as unknown as ConstantString).ref
    ).toBe(true); // string literals should be same object
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads classref from constant pool and pushes to stack', () => {
    thread.popStackFrame();
    let classConstant;
    const strContent = {
      tag: CONSTANT_TAG.Utf8,
      value: 'Test',
    } as ConstantUtf8Info;
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        () => strContent,
        cPool => {
          constIdx = cPool.length;
          classConstant = {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
            classRef: testClass,
          } as ConstantClass;
          return classConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === testClass).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('saves class ref to constant pool', () => {
    thread.popStackFrame();
    let classConstant;
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          constIdx = cPool.length;
          classConstant = {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
          } as ConstantClass;
          return classConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === testClass).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runLdcW', () => {
  test('reads int from constant pool and pushes to stack', () => {
    // use custom class
    thread.popStackFrame();
    const intConstant = {
      tag: CONSTANT_TAG.Integer,
      value: -99,
    };
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return intConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads float from constant pool and pushes to stack', () => {
    thread.popStackFrame();
    const floatConstant = {
      tag: CONSTANT_TAG.Float,
      value: Math.fround(-0.3),
    };
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return floatConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(-0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads string from constant pool and pushes to stack', () => {
    thread.popStackFrame();
    const strRef = initString(testLoader, 'hello world').result as JvmObject;
    const strConstant = {
      tag: CONSTANT_TAG.String,
      ref: strRef,
      stringIndex: 0,
    } as ConstantString;
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return strConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === strRef).toBe(true); // string literals should be same object
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('initializes uninitialized string from constant pool', () => {
    thread.popStackFrame();
    const strContent = {
      tag: CONSTANT_TAG.Utf8,
      value: 'hello world',
    } as ConstantUtf8Info;
    let constIdx = 0;
    let strConstant;
    const customClass = createClass({
      className: 'custom',
      constants: [
        () => strContent,
        cPool => {
          constIdx = cPool.length;
          strConstant = {
            tag: CONSTANT_TAG.String,
            stringIndex: cPool.length - 1,
          };
          return strConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(
      lastFrame.operandStack[0] ===
        (strConstant as unknown as ConstantString).ref
    ).toBe(true); // string literals should be same object
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads classref from constant pool and pushes to stack', () => {
    thread.popStackFrame();
    let classConstant;
    const strContent = {
      tag: CONSTANT_TAG.Utf8,
      value: 'Test',
    } as ConstantUtf8Info;
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        () => strContent,
        cPool => {
          constIdx = cPool.length;
          classConstant = {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
            classRef: testClass,
          } as ConstantClass;
          return classConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === testClass).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('saves class ref to constant pool', () => {
    thread.popStackFrame();
    let classConstant;
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          constIdx = cPool.length;
          classConstant = {
            tag: CONSTANT_TAG.Class,
            nameIndex: cPool.length - 1,
          } as ConstantClass;
          return classConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0] === testClass).toBe(true);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('runLdc2W', () => {
  test('reads long from constant pool and pushes to stack', () => {
    // use custom class
    thread.popStackFrame();
    const longConstant = {
      tag: CONSTANT_TAG.Long,
      value: 99n,
    };
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return longConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC2_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads double from constant pool and pushes to stack', () => {
    // use custom class
    thread.popStackFrame();
    const doubleConstant = {
      tag: CONSTANT_TAG.Double,
      value: -0.3,
    };
    let constIdx = 0;
    const customClass = createClass({
      className: 'custom',
      constants: [
        cPool => {
          constIdx = cPool.length;
          return doubleConstant;
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
    const method = customClass.getMethod('test0()V') as MethodRef;
    thread.pushStackFrame(customClass, method, 0, []);
    code.setUint8(0, OPCODE.LDC2_W);
    code.setUint16(1, constIdx);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-0.3);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});
