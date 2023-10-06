import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ConstantRef';
import { ArrayPrimitiveType, JavaArray, JavaReference } from '#types/dataTypes';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';

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
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method,
    pc: 0,
  });
});

describe('runInvokevirtual', () => {
  test('INVOKEVIRTUAL: not signature polymorphic', () => {
    thread.pushStack64(2n);
    thread.pushStack64(2n);
    code.setUint8(0, OPCODE.INVOKEVIRTUAL);
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
