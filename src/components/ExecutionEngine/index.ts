import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/DataTypes';
import JsSystem from '#utils/JsSystem';
import { JNI } from '../JNI';
import Interpreter from './Interpreter';
import NativeThreadGroup from './NativeThreadGroup';
import NativeThread from './NativeThreadGroup/NativeThread';

export default class ExecutionEngine {
  nativeThreadGroup: NativeThreadGroup;
  os: JsSystem;
  interpreter: Interpreter;
  jni: JNI;

  constructor(os: JsSystem, jni: JNI) {
    this.jni = jni;
    this.os = os;
    this.nativeThreadGroup = new NativeThreadGroup();
    this.interpreter = new Interpreter(this.jni);
  }

  runClass(threadCls: ClassRef, mainClass: ClassRef, args?: any[]) {
    console.warn('ExecutionEngine.runClass not implemented.');

    // TODO: create new Thread() and pass in javaThis
    const javaThread = new JavaReference(threadCls, {});
    const mainThread = new NativeThread(threadCls, javaThread, {
      operandStack: [],
      locals: [],
      class: mainClass,
      method: mainClass.methods['main([Ljava/lang/String;)V'],
      pc: 0,
    });

    // TODO: pushstack string args
    this.nativeThreadGroup.addThread(mainThread);

    this.interpreter.runFor(this.nativeThreadGroup.getThread(), 1000, () => {
      console.debug('finished');
      process.exit();
    });
  }
}
