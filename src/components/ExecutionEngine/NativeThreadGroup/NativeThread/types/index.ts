import { ClassRef, MethodRef } from '#types/ConstantRef';

export interface StackFrame {
  operandStack: any[];
  class: ClassRef;
  method: MethodRef;
  pc: number;
  locals: any[];
}
