import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { JNI } from '#jvm/components/JNI';

import NativeThread from '../NativeThreadGroup/NativeThread';
import runInstruction from './utils/runInstruction';
import { MethodRef } from '#jvm/external/ClassFile/types/methods';
import { checkNative } from '#utils/parseBinary/utils/readMethod';
import { InstructionType } from './utils/readInstruction';

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
      const methodCast = current as MethodRef;
      if (methodCast.accessFlags >= 0 && checkNative(methodCast)) {
        const nativeMethod = this.jni.getNativeMethod(
          thread.getClass().getClassname(),
          methodCast.name + methodCast.descriptor
        );
        console.debug(
          `[Native] JNI:`.padEnd(20) +
            ` ${thread.getClass().getClassname()}.${
              methodCast.name + methodCast.descriptor
            }`
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
          // @ts-ignore
          `${OPCODE[current.opcode]}(${current.operands.join(', ')})`.padEnd(
            20
          ) +
          ` locals: [${thread.peekStackFrame().locals.join(',')}]`.padEnd(40) +
          ` stack: [${thread.peekStackFrame().operandStack.join(',')}]:${
            thread.peekStackFrame().operandStack.length
          } ->`
      );

      runInstruction(thread, current as InstructionType);
    }

    if (isFinished) {
      onFinish && onFinish();
    }
  }
}
