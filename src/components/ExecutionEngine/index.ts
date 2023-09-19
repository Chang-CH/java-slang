import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/DataTypes';
import JsSystem from '#utils/JsSystem';
import { JNI } from '../JNI';
import Interpreter from './Interpreter';
import NativeThreadGroup from './NativeThreadGroup';
import NativeThread from './NativeThreadGroup/NativeThread';

export default class ExecutionEngine {
  private nativeThreadGroup: NativeThreadGroup;
  private interpreter: Interpreter;
  private jni: JNI;

  constructor(os: JsSystem, jni: JNI) {
    this.jni = jni;
    this.nativeThreadGroup = new NativeThreadGroup();
    this.interpreter = new Interpreter(this.jni);
  }

  runClass(threadCls: ClassRef, mainClass: ClassRef, args?: any[]) {
    const javaThread = new JavaReference(threadCls, {});
    const mainThread = new NativeThread(threadCls, javaThread);
    mainThread.pushStackFrame({
      operandStack: [],
      locals: [],
      class: mainClass,
      method: mainClass.getMethod(mainThread, 'main([Ljava/lang/String;)V'),
      pc: 0,
    });

    // TODO: pushstack string args
    this.nativeThreadGroup.addThread(mainThread);

    this.interpreter.runFor(mainThread, 1000, () => {
      console.debug('finished');
      process.exit();
    });
  }
}
