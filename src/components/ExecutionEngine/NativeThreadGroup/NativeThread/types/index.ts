import { ClassRef } from '#types/ClassRef';
import { MethodRef, NativeMethodRef } from '#types/ClassFile/methods';

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
