import { JNI } from '#jvm/components/JNI';
import JvmThread from '#types/reference/Thread';
import runInstruction from './utils/runInstruction';

/**
 * Executes the instructions at the thread's current program counter.
 */
export default class Interpreter {
  private jni: JNI;

  constructor(jni: JNI) {
    this.jni = jni;
  }

  runFor(thread: JvmThread, instructions: number, onFinish?: () => void) {
    for (let i = 0; i < instructions; i++) {
      runInstruction(thread, this.jni, onFinish);
    }
  }
}
