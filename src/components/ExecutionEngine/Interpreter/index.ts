import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { JNI } from '#jvm/components/JNI';

import NativeThread from '../NativeThreadGroup/NativeThread';
import runInstruction from './utils/runInstruction';

/**
 * Executes the instructions at the thread's current program counter.
 */
export default class Interpreter {
  private jni: JNI;

  constructor(jni: JNI) {
    this.jni = jni;
  }

  runFor(thread: NativeThread, instructions: number, onFinish?: () => void) {
    let isFinished = false;
    for (let i = 0; i < instructions; i++) {
      const current = thread.getCurrentInstruction();

      if (!current) {
        isFinished = true;
        break;
      }

      // is native
      if (current.native) {
        const nativeMethod = this.jni.getNativeMethod(
          current.className,
          current.methodName
        );
        console.debug(
          `[Native] JNI:`.padEnd(20) +
            ` ${current.className}.${current.methodName}`
        );
        const result = nativeMethod(thread, thread.peekStackFrame().locals);
        thread.popStackFrame();
        if (result !== undefined) {
          thread.pushStack(result);
        }
        continue;
      }

      console.debug(
        `#${thread.getPC()}`.padEnd(4) +
          `${OPCODE[current.opcode]}(${current.operands.join(', ')})`.padEnd(
            20
          ) +
          ` locals: [${thread.peekStackFrame().locals.join(',')}]`.padEnd(40) +
          ` stack: [${thread.peekStackFrame().operandStack.join(',')}]:${
            thread.peekStackFrame().operandStack.length
          } ->`
      );

      // TODO: handle exceptions
      runInstruction(thread, current);
    }

    if (isFinished) {
      onFinish && onFinish();
    }
  }
}
