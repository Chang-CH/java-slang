import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';

describe('run_nop', () => {
  test('does not change stack', () => {
    const mem = new MemoryArea();
    const thread = new NativeThread({
      operandStack: [],
      className: 'test',
      methodName: 'test',
      pc: 0,
      this: null,
      arguments: [],
      locals: [],
    });
    runInstruction(thread, mem, {
      opcode: INSTRUCTION_SET.nop,
      operands: [],
    });
    expect(thread.peekStackFrame().operandStack.length).toBe(0);
  });
});
