import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import Thread from '#jvm/components/Thread/Thread';
import { JNI } from '#jvm/components/JNI';
import { CLASS_STATUS, ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { METHOD_FLAGS } from '#jvm/external/ClassFile/types/methods';
import { TestClassLoader, TestSystem, createClass } from '#utils/test';
import { FIELD_FLAGS } from '#jvm/external/ClassFile/types/fields';
import { CLASS_FLAGS } from '#jvm/external/ClassFile/types';
import { ArrayPrimitiveType } from '#types/dataTypes';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';

let thread: Thread;
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

  thread = new Thread(threadClass);
});

// method resolution tested under classref
// Test synchronized
// Test signature polymorphic method declaration
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

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);

    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
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

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    expect(testClass.status).toBe(CLASS_STATUS.PREPARED);
    runInstruction(thread, jni, () => {});
    expect(testClass.status).toBe(CLASS_STATUS.INITIALIZED);
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
    const method = testClass.getMethod('test0(IDJ)V');
    thread.invokeSf(testClass, method as MethodRef, 0, []);
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
    const method = testClass.getMethod('test0(FD)V');
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().locals[0]).toBe(Math.fround(1.3));
    expect(thread.peekStackFrame().locals[1]).toBe(1.3);
  });
  test('INVOKESTATIC: private method throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC, METHOD_FLAGS.ACC_PRIVATE],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('INVOKESTATIC: method lookup checks superclass', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;

    const mainClass = createClass({
      className: 'mainClass',
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    expect(thread.getClass().getClassname()).toBe('mainClass');
    expect(thread.peekStackFrame().locals[0]).toBe(Math.fround(1.3));
    expect(thread.peekStackFrame().locals[1]).toBe(1.3);
  });
  test('INVOKESTATIC: method lookup checks superclass', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    expect(thread.getClass().getClassname()).toBe('superClass');
    expect(thread.peekStackFrame().locals[0]).toBe(Math.fround(1.3));
    expect(thread.peekStackFrame().locals[1]).toBe(1.3);
  });
  test('INVOKESTATIC: method lookup interface static methods not called', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKESTATIC);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NoSuchMethodError'
    );
  });
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
    const method = testClass.getMethod('test0()I') as MethodRef;
    jni.registerNativeMethod('Test', 'nativeFunc()I', () => 5);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
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
    const method = testClass.getMethod('test0()J') as MethodRef;
    jni.registerNativeMethod('Test', 'nativeFunc()J', () => 5n);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    runInstruction(thread, jni, () => {});
    expect(thread.popStack64() === 5n).toBe(true);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
});

// Test synchronized
// unsatisfiedlinkerror
// Test signature polymorphic method declaration
describe('runinvokevirtual', () => {
  test('INVOKEVIRTUAL: static method invoked without error', () => {
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
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(testClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('test0');
    expect(lastFrame.method.getMethodDesc()).toBe('()V');
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKEVIRTUAL: Pops args off stack per descriptor', () => {
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
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '(IDJ)V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = testClass.getMethod('test0(IDJ)V');
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(testClass);
    thread.pushStack(objRef);
    thread.pushStack(1);
    thread.pushStack64(2.5);
    thread.pushStack64(3n);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().locals[0] === objRef).toBe(true);
    expect(thread.peekStackFrame().locals[1]).toBe(1);
    expect(thread.peekStackFrame().locals[2]).toBe(2.5);
    expect(thread.peekStackFrame().locals[3] === 3n).toBe(true);
  });
  test('INVOKEVIRTUAL: Undergoes value set conversion', () => {
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
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = testClass.getMethod('test0(FD)V');
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(testClass);
    thread.pushStack(objRef);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().locals[1]).toBe(Math.fround(1.3));
    expect(thread.peekStackFrame().locals[2]).toBe(1.3);
  });
  test('INVOKEVIRTUAL: private method throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PRIVATE],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('INVOKEVIRTUAL: method lookup ok', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().locals[0] === objRef).toBe(true);
  });
  test('INVOKEVIRTUAL: method lookup checks superclass', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(superClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    expect(thread.getClass().getClassname()).toBe('superClass');
    expect(thread.peekStackFrame().locals[0] === objRef).toBe(true);
  });
  test('INVOKEVIRTUAL: method lookup override OK', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    expect(thread.getClass().getClassname()).toBe('mainClass');
    expect(thread.peekStackFrame().locals[0] === objRef).toBe(true);
  });
  test('INVOKEVIRTUAL: objectref is null, throws a NullPointerException', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(null);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });
  test('INVOKEVIRTUAL: lookup abstract method throws AbstractMethodError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/AbstractMethodError'
    );
  });
  test('INVOKEVIRTUAL: lookup method fails throws AbstractMethodError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const failLookupClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'mainClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V');
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(failLookupClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/AbstractMethodError'
    );
  });
});

// Test synchronized
// unsatisfiedlinkerror
// Test signature polymorphic method declaration
describe('runInvokeinterface', () => {
  test('INVOKEINTERFACE: static method invoked without error', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('test0');
    expect(lastFrame.method.getMethodDesc()).toBe('()V');
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKEINTERFACE: Pops args off stack per descriptor', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
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
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    thread.pushStack(0.5);
    thread.pushStack64(0.5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('test0');
    expect(lastFrame.method.getMethodDesc()).toBe('(FD)V');
    expect(lastFrame.locals[0] === objRef).toBe(true);
    expect(lastFrame.locals[1]).toBe(0.5);
    expect(lastFrame.locals[2]).toBe(0.5);
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKEINTERFACE: Undergoes value set conversion', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
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
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: 'test0',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(mainClass);
    thread.pushStack(objRef);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('test0');
    expect(lastFrame.method.getMethodDesc()).toBe('(FD)V');
    expect(lastFrame.locals[0] === objRef).toBe(true);
    expect(lastFrame.locals[1]).toBe(Math.fround(1.3));
    expect(lastFrame.locals[2]).toBe(1.3);
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKEINTERFACE: non public method throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('INVOKEINTERFACE: abstract method throws AbstractMethodError', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/AbstractMethodError'
    );
  });
  test('INVOKEINTERFACE: multiple maximally specific throws IncompatibleClassChangeError', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const superInterA = createClass({
      className: 'superInterA',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const superInterB = createClass({
      className: 'superInterB',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      interfaces: [interfaceClass, superInterA, superInterB],
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'interfaceClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IncompatibleClassChangeError'
    );
  });
  test('INVOKEINTERFACE: no non abstract method throws AbstractMethodError', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: 'test0',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
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
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKEINTERFACE);
    code.setUint16(1, methodIdx);
    code.setUint8(3, 0);
    code.setUint8(4, 0);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/AbstractMethodError'
    );
  });
});

// Test synchronized
// unsatisfiedlinkerror
// Test signature polymorphic method declaration
describe('runinvokespecial', () => {
  test('INVOKESPECIAL: static method invoked without error', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      superClass: superClass,
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '<init>',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'objClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESPECIAL);
    code.setUint16(1, methodIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(thread.getPC()).toBe(0);
    expect(lastFrame.method.getMethodName()).toBe('<init>');
    expect(lastFrame.method.getMethodDesc()).toBe('()V');
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKESPECIAL: Pops args off stack per descriptor', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          name: '<init>',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: '<init>',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      superClass: superClass,
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '(FD)V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '<init>',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'objClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESPECIAL);
    code.setUint16(1, methodIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    thread.pushStack(0.5);
    thread.pushStack64(0.5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('<init>');
    expect(lastFrame.method.getMethodDesc()).toBe('(FD)V');
    expect(lastFrame.locals[0] === objRef).toBe(true);
    expect(lastFrame.locals[1]).toBe(0.5);
    expect(lastFrame.locals[2]).toBe(0.5);
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKESPECIAL: Undergoes value set conversion', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          name: '<init>',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC, METHOD_FLAGS.ACC_STATIC],
          name: '<init>',
          descriptor: '(FD)V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      superClass: superClass,
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '(FD)V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '<init>',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'objClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESPECIAL);
    code.setUint16(1, methodIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    thread.pushStack(1.3);
    thread.pushStack64(1.3);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('<init>');
    expect(lastFrame.method.getMethodDesc()).toBe('(FD)V');
    expect(lastFrame.locals[0] === objRef).toBe(true);
    expect(lastFrame.locals[1]).toBe(Math.fround(1.3));
    expect(lastFrame.locals[2]).toBe(1.3);
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKESPECIAL: Interface method ref ok', () => {
    const ab = new ArrayBuffer(40);
    const code = new DataView(ab);
    let methodIdx = 0;
    const objClass = createClass({
      className: 'java/lang/Object',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const interfaceClass = createClass({
      className: 'interfaceClass',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [],
      superClass: objClass,
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '<init>',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'interfaceClass',
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
            tag: CONSTANT_TAG.InterfaceMethodref,
            classIndex: cPool.length - 1,
            nameAndTypeIndex: cPool.length - 2,
          };
        },
      ],
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      interfaces: [interfaceClass],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.INVOKESPECIAL);
    code.setUint16(1, methodIdx);
    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(interfaceClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method.getMethodName()).toBe('<init>');
    expect(lastFrame.method.getMethodDesc()).toBe('()V');
    expect(lastFrame.locals[0] === objRef).toBe(true);
    expect(thread.getPC()).toBe(0);
  });
  test('INVOKESPECIAL: abstract method throws AbstractMethodError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superClass = createClass({
      className: 'superClass',
      methods: [
        {
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_ABSTRACT],
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      superClass: superClass,
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '<init>',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'objClass',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESPECIAL);
    code.setUint16(1, methodIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/AbstractMethodError'
    );
  });
  test('INVOKESPECIAL: multiple maximally specific throws IncompatibleClassChangeError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let methodIdx = 0;
    const superInterA = createClass({
      className: 'superInterA',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });
    const superInterB = createClass({
      className: 'superInterB',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      methods: [
        {
          accessFlags: [METHOD_FLAGS.ACC_PUBLIC],
          name: '<init>',
          descriptor: '()V',
          attributes: [],
          code: new DataView(new ArrayBuffer(8)),
        },
      ],
      loader: testLoader,
    });

    const objClass = createClass({
      className: 'objClass',
      interfaces: [superInterA, superInterB],
      loader: testLoader,
    });

    const mainClass = createClass({
      className: 'mainClass',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '()V',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 5,
          value: '<init>',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'superInterA',
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
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.INVOKESPECIAL);
    code.setUint16(1, methodIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    const objRef = new JvmObject(objClass);
    thread.pushStack(objRef);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IncompatibleClassChangeError'
    );
  });
});

describe('runGetstatic', () => {
  test('GETSTATIC: Initializes class', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'I',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    expect(testClass.status).toBe(CLASS_STATUS.PREPARED);
    runInstruction(thread, jni, () => {});
    expect(testClass.status).toBe(CLASS_STATUS.INITIALIZED);
  });
  test('GETSTATIC: Gets static int', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'I',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    testClass.getFieldRef('staticFieldI')?.putValue(5);
    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    expect(thread.popStack()).toBe(5);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('GETSTATIC: Gets static long', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
          value: 'J',
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    testClass.getFieldRef('staticFieldJ')?.putValue(5n);
    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    expect(thread.popStack64() === 5n).toBe(true);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('GETSTATIC: gets inherited static long', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    superClass.getFieldRef('staticFieldJ')?.putValue(5n);
    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    expect(thread.popStack64() === 5n).toBe(true);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('GETSTATIC: private static int throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PRIVATE, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    superClass.getFieldRef('staticFieldJ')?.putValue(5n);

    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('GETSTATIC: non static int throws IncompatibleClassChangeError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    superClass.getFieldRef('staticFieldJ')?.putValue(5n);

    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(
      lastFrame.method.getMethodName() + lastFrame.method.getMethodDesc()
    ).toBe('dispatchUncaughtException(Ljava/lang/Throwable;)V');
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IncompatibleClassChangeError'
    );
  });
  test('GETSTATIC: Invalid field throws NoSuchFieldError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
          value: 'J',
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
      fields: [],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.GETSTATIC);
    code.setUint16(1, fieldIdx);

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NoSuchFieldError'
    );
  });
});

describe('runPutstatic', () => {
  test('PUTSTATIC: Initializes class', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'I',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    expect(testClass.status).toBe(CLASS_STATUS.PREPARED);
    runInstruction(thread, jni, () => {});
    expect(testClass.status).toBe(CLASS_STATUS.INITIALIZED);
  });
  test('PUTSTATIC: Puts static int', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'I',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    expect(testClass.getFieldRef('staticFieldI')?.getValue()).toBe(5);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('PUTSTATIC: Puts static long', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
          value: 'J',
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });

    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack64(5n);
    runInstruction(thread, jni, () => {});
    expect(testClass.getFieldRef('staticFieldJ')?.getValue() === 5n).toBe(true);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('PUTSTATIC: Puts inherited static long', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);

    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack64(5n);
    runInstruction(thread, jni, () => {});
    expect(superClass.getFieldRef('staticFieldJ')?.getValue() === 5n).toBe(
      true
    );
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('PUTSTATIC: private static int throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PRIVATE, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    superClass.getFieldRef('staticFieldJ')?.putValue(5n);

    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('PUTSTATIC: non static int throws IncompatibleClassChangeError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    superClass.getFieldRef('staticFieldJ')?.putValue(5n);

    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IncompatibleClassChangeError'
    );
  });
  test('PUTSTATIC: Invalid field throws NoSuchFieldError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
          value: 'J',
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
      fields: [],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);

    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NoSuchFieldError'
    );
  });
  test('PUTSTATIC: final static int outside init throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_FINAL, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'J',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      superClass: superClass,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 11,
          value: 'staticField',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 1,
          value: 'J',
        }),
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'SuperClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: 'main',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    superClass.getFieldRef('staticFieldJ')?.putValue(5n);

    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = mainClass.getMethod('main()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('PUTSTATIC: final static int inside init ok', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const mainClass = createClass({
      className: 'MainClass',
      status: CLASS_STATUS.INITIALIZING,
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_FINAL, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'I',
        },
      ],
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
          value: 'MainClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: '<clinit>',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = mainClass.getMethod('<clinit>()V') as MethodRef;
    thread.invokeSf(mainClass, method, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
    expect(mainClass.getFieldRef('staticFieldI')?.getValue()).toBe(5);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('PUTSTATIC: final static int from child init throws IllegalAccessError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const superClass = createClass({
      className: 'SuperClass',
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_STATIC, FIELD_FLAGS.ACC_FINAL],
          name: 'staticField',
          descriptor: 'I',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    const mainClass = createClass({
      className: 'mainClass',
      status: CLASS_STATUS.INITIALIZING,
      superClass: superClass,
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
          value: 'mainClass',
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
          accessFlags: [METHOD_FLAGS.ACC_STATIC],
          name: '<clinit>',
          descriptor: '()V',
          attributes: [],
          code: code,
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);

    const method = mainClass.getMethod('<clinit>()V') as MethodRef;
    thread.invokeSf(mainClass, method as MethodRef, 0, []);
    thread.pushStack(5);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(
      lastFrame.method.getMethodName() + lastFrame.method.getMethodDesc()
    ).toBe('dispatchUncaughtException(Ljava/lang/Throwable;)V');
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/IllegalAccessError'
    );
  });
  test('PUTSTATIC: float undergoes value set conversion', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
          value: 'F',
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'F',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1.3);
    runInstruction(thread, jni, () => {});
    expect(testClass.getFieldRef('staticFieldF')?.getValue()).toBe(
      Math.fround(1.3)
    );
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
  test('PUTSTATIC: int to boolean narrowed', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let fieldIdx = 0;
    const testClass = createClass({
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
          value: 'Z',
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
      fields: [
        {
          accessFlags: [FIELD_FLAGS.ACC_PUBLIC, FIELD_FLAGS.ACC_STATIC],
          name: 'staticField',
          descriptor: 'Z',
          attributes: [],
        },
      ],
      loader: testLoader,
    });
    code.setUint8(0, OPCODE.PUTSTATIC);
    code.setUint16(1, fieldIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(3);
    runInstruction(thread, jni, () => {});
    expect(testClass.getFieldRef('staticFieldZ')?.getValue()).toBe(1);
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
});

describe('runNew', () => {
  test('NEW: creates new object', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: classIdx - 1,
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
    code.setUint8(0, OPCODE.NEW);
    code.setUint16(1, classIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(thread.popStack().getClass() === testClass).toBe(true);
  });

  test('NEW: Interface class throws InstantiationError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIdx = 0;
    const testClass = createClass({
      className: 'Test',
      flags: CLASS_FLAGS.ACC_INTERFACE,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: classIdx - 1,
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
    code.setUint8(0, OPCODE.NEW);
    code.setUint16(1, classIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/InstantiationError'
    );
  });

  test('NEW: Abstract class throws InstantiationError', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIdx = 0;
    const testClass = createClass({
      className: 'Test',
      flags: CLASS_FLAGS.ACC_ABSTRACT,
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: classIdx - 1,
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
    code.setUint8(0, OPCODE.NEW);
    code.setUint16(1, classIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.method).toBe(
      threadClass.getMethod('dispatchUncaughtException(Ljava/lang/Throwable;)V')
    );
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/InstantiationError'
    );
  });

  test('NEW: initializes class', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIdx = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIdx = cPool.length;
          return {
            tag: CONSTANT_TAG.Class,
            nameIndex: classIdx - 1,
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
    code.setUint8(0, OPCODE.NEW);
    code.setUint16(1, classIdx);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    expect(testClass.status).toBe(CLASS_STATUS.PREPARED);
    runInstruction(thread, jni, () => {});
    expect(testClass.status).toBe(CLASS_STATUS.INITIALIZED);
  });
});

describe('runNewarray', () => {
  test('NEWARRAY: creates new array', () => {
    const ab = new ArrayBuffer(16);
    const code = new DataView(ab);

    const testClass = createClass({
      className: 'Test',
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
    code.setUint8(0, OPCODE.NEWARRAY);
    code.setUint8(1, ArrayPrimitiveType.boolean);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    const arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.getClass().getClassname()).toBe('[Z');
    expect(arrayObj.len()).toBe(0);
  });

  test('NEWARRAY: sets elements to default value', () => {
    const ab = new ArrayBuffer(16);
    const code = new DataView(ab);

    const testClass = createClass({
      className: 'Test',
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
    code.setUint8(0, OPCODE.NEWARRAY);

    // boolean
    code.setUint8(1, ArrayPrimitiveType.boolean);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    let arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // char
    code.setUint8(1, ArrayPrimitiveType.char);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // float
    code.setUint8(1, ArrayPrimitiveType.float);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // double
    code.setUint8(1, ArrayPrimitiveType.double);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // byte
    code.setUint8(1, ArrayPrimitiveType.byte);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // short
    code.setUint8(1, ArrayPrimitiveType.short);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // int
    code.setUint8(1, ArrayPrimitiveType.int);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0)).toBe(0);
    thread.returnSF();

    // long
    code.setUint8(1, ArrayPrimitiveType.long);
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0) === 0n).toBe(true);
    thread.returnSF();
  });

  test('NEWARRAY: negative array size throws NegativeArraySizeException', () => {
    const ab = new ArrayBuffer(16);
    const code = new DataView(ab);

    const testClass = createClass({
      className: 'Test',
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
    code.setUint8(0, OPCODE.NEWARRAY);
    code.setUint8(1, ArrayPrimitiveType.boolean);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(-1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(
      lastFrame.method.getMethodName() + lastFrame.method.getMethodDesc()
    ).toBe('dispatchUncaughtException(Ljava/lang/Throwable;)V');
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NegativeArraySizeException'
    );
  });
});

describe('runAnewarray', () => {
  test('ANEWARRAY: creates new array', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIndex = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIndex = cPool.length;
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
    code.setUint8(0, OPCODE.ANEWARRAY);
    code.setUint16(1, classIndex);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(0);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    const arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.getClass().getClassname()).toBe('[LTest;');
    expect(arrayObj.len()).toBe(0);
  });

  test('ANEWARRAY: initializes class', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIndex = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIndex = cPool.length;
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
    code.setUint8(0, OPCODE.ANEWARRAY);
    code.setUint16(1, classIndex);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(0);
    expect(testClass.status).toBe(CLASS_STATUS.PREPARED);
    runInstruction(thread, jni, () => {});
    expect(testClass.status).toBe(CLASS_STATUS.INITIALIZED);
  });

  test('ANEWARRAY: sets elements to default value', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIndex = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIndex = cPool.length;
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
    code.setUint8(0, OPCODE.ANEWARRAY);
    code.setUint16(1, classIndex);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(1);
    runInstruction(thread, jni, () => {});
    const arrayObj = thread.popStack() as JvmArray;
    expect(arrayObj.get(0) === null).toBe(true);
  });

  test('ANEWARRAY: negative array size throws NegativeArraySizeException', () => {
    const ab = new ArrayBuffer(24);
    const code = new DataView(ab);
    let classIndex = 0;
    const testClass = createClass({
      className: 'Test',
      constants: [
        () => ({
          tag: CONSTANT_TAG.Utf8,
          length: 4,
          value: 'Test',
        }),
        cPool => {
          classIndex = cPool.length;
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
    code.setUint8(0, OPCODE.ANEWARRAY);
    code.setUint16(1, classIndex);
    const method = testClass.getMethod('test0()V') as MethodRef;
    thread.invokeSf(testClass, method as MethodRef, 0, []);
    thread.pushStack(-1);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(
      lastFrame.method.getMethodName() + lastFrame.method.getMethodDesc()
    ).toBe('dispatchUncaughtException(Ljava/lang/Throwable;)V');
    expect(thread.getPC()).toBe(0);
    const exceptionObj = lastFrame.locals[1] as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NegativeArraySizeException'
    );
  });
});
