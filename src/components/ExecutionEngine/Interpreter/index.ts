import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassFile/instructions';
import NativeThread from '../NativeThreadGroup/NativeThread';
import runInstruction from './utils/runInstruction';

/**
 * Executes the instructions at the thread's current program counter.
 */
export default class Interpreter {
  private memoryArea: MemoryArea;

  constructor(memoryArea: MemoryArea) {
    this.memoryArea = memoryArea;
  }

  runFor(thread: NativeThread, instructions: number, onFinish?: () => void) {
    let isFinished = false;
    for (let i = 0; i < instructions; i++) {
      const current = thread.getCurrentInstruction();
      if (!current) {
        isFinished = true;
        break;
      }

      let instruction = this.memoryArea.getInstructionAt(thread, current);
      // is native
      if (typeof instruction === 'function') {
        console.debug(
          `[Native] JNI:`.padEnd(20) +
            ` ${current.className}.${current.methodName}`
        );
        const result = instruction(
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
        `#${current.pc}`.padEnd(4) +
          `${INSTRUCTION_SET[instruction.opcode]}(${instruction.operands.join(
            ', '
          )})`.padEnd(20) +
          ` locals: [${thread.peekStackFrame().locals.join(',')}]`.padEnd(40) +
          ` stack: [${thread.peekStackFrame().operandStack.join(',')}]:${
            thread.peekStackFrame().operandStack.length
          } ->`
      );

      // TODO: handle exceptions
      runInstruction(thread, this.memoryArea, instruction);
    }

    if (isFinished) {
      onFinish && onFinish();
    }
  }
}
