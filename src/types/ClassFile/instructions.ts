import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';

export interface InstructionType {
  opcode: INSTRUCTION_SET;
  operands: any[];
}
