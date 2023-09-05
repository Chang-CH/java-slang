export interface InstructionPointer {
  className: string;
  methodName: string;
  pc: number;
}

export interface StackFrame {
  operandStack: any[];
  className: string;
  methodName: string;
  pc: number;
  this: any;
  locals: any[];
}
