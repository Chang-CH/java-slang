import { ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '#types/reference/Object';
import Thread from '#jvm/components/Threads/Thread';
import { JNI } from '../JNI';
import Interpreter from './Interpreter';
import NativeThreadGroup from './NativeThreadGroup';

export default class ExecutionEngine {
  private nativeThreadGroup: NativeThreadGroup;
  private interpreter: Interpreter;
  private jni: JNI;

  constructor(jni: JNI) {
    this.jni = jni;
    this.nativeThreadGroup = new NativeThreadGroup();
    this.interpreter = new Interpreter(this.jni);
  }

  runClass(threadCls: ClassRef, mainClass: ClassRef, args?: any[]) {
    const mainThread = new Thread(threadCls);
    const mainMethod = mainClass.getMethod('main([Ljava/lang/String;)V');

    if (!mainMethod) {
      throw new Error('Main method not found');
    }

    mainThread.pushStackFrame(mainClass, mainMethod, 0, []);

    // TODO: pushstack string args
    this.nativeThreadGroup.addThread(mainThread);

    this.interpreter.runFor(mainThread, 1000, () => {
      console.debug('finished');
      process.exit();
    });
  }

  runMethod(threadCls: ClassRef, cls: ClassRef, method: string, args?: any[]) {
    const mainThread = new Thread(threadCls);

    mainThread.pushStackFrame(
      cls,
      cls.getMethod(method) as MethodRef,
      0,
      args ?? []
    );
    this.interpreter.runFor(mainThread, 10000, () => {
      console.debug('runMethod Finish');
    });
  }
}
