import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';

export interface InstructionType {
  opcode: OPCODE;
  operands: any[];
  native?: false;
}
