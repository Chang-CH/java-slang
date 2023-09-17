import { MethodType } from '#jvm/external/ClassFile/types/methods';
import { ClassRef } from '#types/ClassRef';

export interface InstructionPointer {
  className: string;
  methodName: string;
  pc: number;
}

export interface StackFrame {
  operandStack: any[];
  class: ClassRef;
  method: MethodType;
  pc: number;
  locals: any[];
}
