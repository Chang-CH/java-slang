import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';
import runInstruction from './utils/runInstruction';

/**
 * Executes the instructions at the thread's current program counter.
 */
export default class Interpreter {
  private jni: JNI;

  constructor(jni: JNI) {
    this.jni = jni;
  }

  runFor(thread: Thread, instructions: number, onFinish?: () => void) {
    for (let i = 0; i < instructions; i++) {
      if (thread.isStackEmpty()) {
        onFinish && onFinish();
        break;
      }
      runInstruction(thread, this.jni, onFinish);
    }
  }

  run(thread: Thread, onFinish?: () => void) {
    while (!thread.isStackEmpty()) {
      runInstruction(thread, this.jni, onFinish);
    }
    onFinish && onFinish();
  }
}
