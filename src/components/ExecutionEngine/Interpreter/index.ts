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
    // TODO: handle exceptions
    const current = thread.getCurrentInstruction();
    const instruction = this.memoryArea.getInstructionAt(current);
    runInstruction(thread, this.memoryArea, instruction);

    console.log(
      `run ${INSTRUCTION_SET[instruction.opcode]}(${instruction.operands.join(
        ', '
      )}): stack: ${thread.stack[thread.stackPointer].operandStack.join(
        '|'
      )} , locals: ${thread.stack[thread.stackPointer].locals.join('|')}`
    );

    if (instructions <= 0) {
      onFinish && onFinish();
      return;
    }

    this.runFor(thread, instructions - 1, onFinish);
  }
}
