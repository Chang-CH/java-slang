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

  runFor(thread: NativeThread, instructions: number) {
    // TODO: handle exceptions
    const current = thread.getCurrentInstruction();
    const instruction = this.memoryArea.getInstructionAt(current);
    runInstruction(thread, this.memoryArea, instruction);
    instructions > 0 && this.runFor(thread, instructions - 1);
  }
}
