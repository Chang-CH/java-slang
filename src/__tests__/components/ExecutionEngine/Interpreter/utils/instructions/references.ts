import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ConstantRef';
import { JavaReference } from '#types/dataTypes';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { METHOD_FLAGS } from '#jvm/external/ClassFile/types/methods';
import { TestClassLoader, TestSystem, createClass } from '#utils/test';

let thread: NativeThread;
let threadClass: ClassRef;
let testLoader: TestClassLoader;
let testSystem: TestSystem;
let jni: JNI;

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
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);

  // load error stubs
  const errorClass = createClass({
    className: 'java/lang/IncompatibleClassChangeError',
    loader: testLoader,
  });
  testLoader.loadTestClassRef(
    'java/lang/IncompatibleClassChangeError',
    errorClass
  );
});

describe('runInvokestatic', () => {
  test('INVOKESTATIC: Non static method throws IncompatibleClassChangeError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 3,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
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
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);

    const method = testClass.getMethod(thread, 'test0()V');
    thread.pushStackFrame(testClass, method, 0, []);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IncompatibleClassChangeError'
    );
  });
  test('INVOKESTATIC: Abstract method throws IncompatibleClassChangeError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 3,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC, METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);

    const method = testClass.getMethod(thread, 'test0()V');
    thread.pushStackFrame(testClass, method, 0, []);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod(
        thread,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      )
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JavaReference;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IncompatibleClassChangeError'
    );
  });
  test('INVOKESTATIC: Initializes class if not already initialized', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 3,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);

    const method = testClass.getMethod(thread, 'test0()V');
    thread.pushStackFrame(testClass, method, 0, []);
    expect(testClass.isInitialized).toBe(false);
    runInstruction(thread, jni, () => {});
    expect(testClass.isInitialized).toBe(true);
  });
  test('INVOKESTATIC: Pops args off stack per descriptor', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 6,
          value: '(IDJ)V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(IDJ)V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);
    const method = testClass.getMethod(thread, 'test0(IDJ)V');
    thread.pushStackFrame(testClass, method, 0, []);
    thread.pushStack(1);
    thread.pushStack64(2.5);
    thread.pushStack64(3n);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().locals[0]).toBe(1);
    expect(thread.peekStackFrame().locals[1]).toBe(2.5);
    expect(thread.peekStackFrame().locals[2] === 3n).toBe(true);
  });
  test('INVOKESTATIC: Undergoes value set conversion', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '(FD)V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);
    const method = testClass.getMethod(thread, 'test0(FD)V');
    thread.pushStackFrame(testClass, method, 0, []);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().locals[0]).toBe(Math.fround(1.3));
    expect(thread.peekStackFrame().locals[1]).toBe(1.3);
  });
  // Test synchronized
  // Test native method binding
  test('INVOKESTATIC: Native method returns int', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    let nativeMethodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 3,
          value: '()I',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 3,
          value: '()I',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'nativeFunc',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 1,
          descriptorIndex: cPool.length - 2,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 7,
        }),
        cPool => {
          nativeMethodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '()I',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC, METHOD_FLAGS.ACC_NATIVE],
          name: 'nativeFunc',
          descriptor: '()I',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, nativeMethodIdx);
    const method = testClass.getMethod(thread, 'test0()I');
    jni.registerNativeMethod('Test', 'nativeFunc()I', () => 5);
    thread.pushStackFrame(testClass, method, 0, []);
    runInstruction(thread, jni, () => {});
    runInstruction(thread, jni, () => {});
    expect(thread.popStack()).toBe(5);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('INVOKESTATIC: Native method returns long', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    let nativeMethodIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '()J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'test0',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 2,
          descriptorIndex: cPool.length - 3,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 2,
        }),
        cPool => {
          methodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '()J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: 'nativeFunc',
        }),
        cPool => ({
          tag: CONSTANT_TAG.NameAndType,
          nameIndex: cPool.length - 1,
          descriptorIndex: cPool.length - 2,
        }),
        cPool => ({
          tag: CONSTANT_TAG.Class,
          nameIndex: cPool.length - 7,
        }),
        cPool => {
          nativeMethodIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Methodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '()J',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC, METHOD_FLAGS.ACC_NATIVE],
          name: 'nativeFunc',
          descriptor: '()J',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, nativeMethodIdx);
    const method = testClass.getMethod(thread, 'test0()J');
    jni.registerNativeMethod('Test', 'nativeFunc()J', () => 5n);
    thread.pushStackFrame(testClass, method, 0, []);
    runInstruction(thread, jni, () => {});
    runInstruction(thread, jni, () => {});
    expect(thread.popStack64() === 5n).toBe(true);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
});
// Getstatic
// Putstatic
// Getfield
// Putfield
// Invokevirtual
// Invokespecial
// Invokestatic
// Invokeinterface
// Invokedynamic
// New
// Newarray
// Anewarray
// Arraylength
// Athrow
// Checkcast
// Instanceof
// Monitorenter
// Monitorexit
