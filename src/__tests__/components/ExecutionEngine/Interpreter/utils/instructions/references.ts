import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ConstantRef';
import { ArrayPrimitiveType, JavaArray, JavaReference } from '#types/dataTypes';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantClassInfo,
  ConstantMethodrefInfo,
  ConstantNameAndTypeInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';

let thread: NativeThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl.load('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);
  const method = threadClass.getMethod(thread, '<init>()V');
  code = (method.code as CodeAttribute).code;
  thread.pushStackFrame(threadClass, method, 0, []);
});

describe('runInvokestatic', () => {
  test('INVOKESTATIC: Non static method throws IncompatibleClassChangeError', () => {
    const methodConstant = {
      tag: CONSTANT_TAG.Methodref,
      classIndex: 1,
      nameAndTypeIndex: 2,
    } as ConstantMethodrefInfo;
    (threadClass as any).constantPool[0] = methodConstant;
    const classConstant = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 3,
    } as ConstantClassInfo;
    (threadClass as any).constantPool[1] = classConstant;
    const nameAndTypeConstant = {
      tag: CONSTANT_TAG.NameAndType,
      nameIndex: 4,
      descriptorIndex: 5,
    } as ConstantNameAndTypeInfo;
    (threadClass as any).constantPool[2] = nameAndTypeConstant;
    const classNameConstant = {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'java/lang/Thread',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[3] = classNameConstant;
    const methodNameConstant = {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: '<init>',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[4] = methodNameConstant;
    const descriptorConstant = {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: '()V',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[5] = descriptorConstant;

    code.setUint8(0, OPCODE.LDC2_W);
    code.setUint16(1, 0);
    code.setUint8(0, OPCODE.INVOKESTATIC);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
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
