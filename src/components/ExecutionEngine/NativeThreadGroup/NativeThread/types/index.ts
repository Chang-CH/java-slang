import { JavaPrimitive } from '#types/DataTypes';

export interface InstructionPointer {
  className: string;
  methodName: string;
  pc: number;
}

export interface StackFrame {
  operandStack: JavaPrimitive[];
  className: string;
  methodName: string;
  pc: number;
  this: any;
  arguments: JavaPrimitive[];
  locals: JavaPrimitive[];
}
