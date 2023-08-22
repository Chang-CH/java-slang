import { InstructionPointer, StackFrame } from './types';

export default class NativeThread {
  stack: StackFrame[];
  stackPointer: number;

  constructor(initialFrame: StackFrame) {
    this.stack = [initialFrame];
    this.stackPointer = 0;
  }

  getCurrentInstruction(): InstructionPointer {
    const currentFrame = this.stack[this.stackPointer];
    return {
      className: currentFrame.className,
      methodName: currentFrame.methodName,
      pc: currentFrame.pc,
    };
  }

  peekStackFrame() {
    return this.stack[this.stackPointer];
  }

  pushStack(value: any) {
    // check for stack overflow?
    this.stack[this.stackPointer].operandStack.push(value);
  }

  popStack() {
    return this.stack[this.stackPointer].operandStack.pop();
  }

  popStackFrame() {
    this.stack.pop();
    this.stackPointer -= 1;
    // TODO: remove thread from threadpool?
  }

  pushStackFrame(frame: StackFrame) {
    this.stack.push(frame);
    this.stackPointer += 1;
  }

  storeLocal(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  loadLocal(index: number) {
    return this.stack[this.stackPointer].locals[index];
  }
}
