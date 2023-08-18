import { ClassFile } from '#types/ClassFile';
import { InstructionType } from '#types/ClassFile/instructions';
import { InstructionPointer } from '../ExecutionEngine/NativeThreadGroup/NativeThread/types';

export default class MemoryArea {
  getInstructionAt(pointer: InstructionPointer): InstructionType {
    console.error('MemoryArea.getInstructionAt: not implemented.');
    return { opcode: 0, operands: [] };
  }

  loadClass(className: string, cls: ClassFile): void {
    console.error('MemoryArea.loadClass: not implemented.');
    return;
  }
}
