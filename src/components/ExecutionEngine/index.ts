import { ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '#types/reference/Object';
import Thread, { ThreadStatus } from '#jvm/components/Thread/Thread';
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

  addThread(thread: Thread) {
    this.nativeThreadGroup.addThread(thread);
  }

  run() {
    while (this.nativeThreadGroup.hasThreads()) {
      const thread = this.nativeThreadGroup.getThread();

      this.interpreter.runFor(thread, 100000, () => {
        thread.setStatus(ThreadStatus.TERMINATED);

        console.log('Thread Terminated');
      });
    }
  }

  runThread(thread: Thread) {
    this.interpreter.run(thread, () => {
      console.log('Run Finish');
    });
  }
}
