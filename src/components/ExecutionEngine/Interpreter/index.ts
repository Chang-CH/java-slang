import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import MemoryArea from '#jvm/components/MemoryArea';
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

      const instruction = this.memoryArea.getInstructionAt(current);
      console.log(
        `run ${INSTRUCTION_SET[instruction.opcode]}(${instruction.operands.join(
          ', '
        )}): stack: ${thread.stack[thread.stackPointer].operandStack.join(
          '|'
        )} , locals: ${thread.stack[thread.stackPointer].locals.join('|')}`
      );

      // TODO: handle exceptions
      runInstruction(thread, this.memoryArea, instruction);
    }

    if (isFinished) {
      onFinish && onFinish();
    }
  }
}
