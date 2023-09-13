import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import { JNI } from '#jvm/components/JNI';
import MemoryArea from '#jvm/components/MemoryArea';
import NativeThread from '../NativeThreadGroup/NativeThread';
import runInstruction from './utils/instructions';

/**
 * Executes the instructions at the thread's current program counter.
 */
export default class Interpreter {
  private memoryArea: MemoryArea;
  private jni: JNI;

  constructor(memoryArea: MemoryArea, jni: JNI) {
    this.memoryArea = memoryArea;
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
        const result = nativeMethod(
          thread,
          this.memoryArea,
          thread.peekStackFrame().locals
        );
        thread.popStackFrame();
        if (result !== undefined) {
          thread.pushStack(result);
        }
        continue;
      }

      console.debug(
        // `[${thread.getClassName()}.${thread.getMethodName()}]` +
        `#${thread.getPC()}`.padEnd(4) +
          `${INSTRUCTION_SET[current.opcode]}(${current.operands.join(
            ', '
          )})`.padEnd(20) +
          ` locals: [${thread.peekStackFrame().locals.join(',')}]`.padEnd(40) +
          ` stack: [${thread.peekStackFrame().operandStack.join(',')}]:${
            thread.peekStackFrame().operandStack.length
          } ->`
      );

      // TODO: handle exceptions
      runInstruction(thread, this.memoryArea, current);
    }

    if (isFinished) {
      onFinish && onFinish();
    }
  }
}
