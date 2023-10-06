import BootstrapClassLoader from "#jvm/components/ClassLoader/BootstrapClassLoader";
import NativeThread from "#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread";
import { JNI } from "#jvm/components/JNI";
import { CodeAttribute } from "#jvm/external/ClassFile/types/attributes";
import { ClassRef } from "#types/ConstantRef";
import { JavaReference } from "#types/dataTypes";
import NodeSystem from "#utils/NodeSystem";

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
