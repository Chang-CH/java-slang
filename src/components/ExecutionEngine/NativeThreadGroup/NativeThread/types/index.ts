import { MethodRef } from '#jvm/external/ClassFile/types/methods';
import { ClassRef } from '#types/ConstantRef';

export interface InstructionPointer {
  className: string;
  methodName: string;
  pc: number;
}

export interface StackFrame {
  operandStack: any[];
  class: ClassRef;
  method: MethodRef;
  pc: number;
  locals: any[];
}
