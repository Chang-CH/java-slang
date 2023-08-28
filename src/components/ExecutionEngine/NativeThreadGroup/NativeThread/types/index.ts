import { JavaPrimitive, JavaType } from '#types/DataTypes';

export interface InstructionPointer {
  className: string;
  methodName: string;
  pc: number;
}

export interface StackFrame {
  operandStack: any[];
  typeStack: JavaType[];
  className: string;
  methodName: string;
  pc: number;
  this: any;
  arguments: any[];
  argumentTypes: JavaType[];
  locals: any[];
  localType: JavaType[];
}
