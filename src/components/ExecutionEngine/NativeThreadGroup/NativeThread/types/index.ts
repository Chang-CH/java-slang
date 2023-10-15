import { ClassRef } from '#types/ClassRef';
import { MethodRef } from '#types/MethodRef';

export interface StackFrame {
  operandStack: any[];
  maxStack: number;
  class: ClassRef;
  method: MethodRef;
  pc: number;
  locals: any[];
}
