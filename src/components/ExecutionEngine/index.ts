import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/DataTypes';
import OsInterface from '#utils/OsInterface';
import { JNI } from '../JNI';
import MemoryArea from '../MemoryArea';
import Interpreter from './Interpreter';
import NativeThreadGroup from './NativeThreadGroup';
import NativeThread from './NativeThreadGroup/NativeThread';

export default class ExecutionEngine {
  memoryArea: MemoryArea;
  nativeThreadGroup: NativeThreadGroup;
  os: OsInterface;
  interpreter: Interpreter;
  jni: JNI;

  constructor(memoryArea: MemoryArea, os: OsInterface, jni: JNI) {
    this.jni = jni;
    this.memoryArea = memoryArea;
    this.os = os;
    this.nativeThreadGroup = new NativeThreadGroup();
    this.interpreter = new Interpreter(this.memoryArea, jni);
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
